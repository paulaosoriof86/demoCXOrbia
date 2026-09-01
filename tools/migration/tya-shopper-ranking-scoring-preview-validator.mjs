#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'shopper-ranking-scoring-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');
const assignmentSyncPath = path.join(root, 'app', 'contracts', 'assignment-sync-conflict-preview-phase-a.tya.contract.json');
const visitLifecyclePath = path.join(root, 'app', 'contracts', 'visit-lifecycle-reservation-preview-phase-a.tya.contract.json');
const communicationHistoryPath = path.join(root, 'app', 'contracts', 'shopper-communication-history-preview-phase-a.tya.contract.json');

const forbiddenKeyPatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i,
  /email/i,
  /raw(Name|Identity|Document|Contact|Message|Body|Attachment|File|Payment)?/i,
  /age|edad|gender|genero|género|religion|salud|health|family/i,
  /base64|attachment|adjunto/i
];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { input: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
    }
  }
  return args;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (child && typeof child === 'object' && !Array.isArray(child)) keys.push(...flattenKeys(child, fullKey));
  }
  return keys;
}

function detectForbiddenKeys(payload) {
  const keys = flattenKeys(payload);
  return [...new Set(keys.filter((key) => forbiddenKeyPatterns.some((pattern) => pattern.test(key))))];
}

function validateRankingRun(run, contract) {
  const failures = [];
  for (const key of contract.requiredRankingRunFields || []) {
    if (run?.[key] === undefined || run?.[key] === null || run?.[key] === '') failures.push(`missing_run_${key}`);
  }
  if (run?.productionAllowed === true || run?.autoAssignAllowed === true || run?.writesAllowed === true) failures.push('run_real_action_flags_not_allowed');
  if (run?.status && !['draft_preview', 'ready_for_review', 'manual_review_required', 'blocked'].includes(run.status)) failures.push(`unsupported_run_status:${run.status}`);
  return [...new Set(failures)];
}

function validateMetric(metric, contract) {
  const failures = [];
  for (const key of contract.requiredMetricFields || []) {
    if (metric[key] === undefined || metric[key] === null || metric[key] === '') failures.push(`missing_metric_${key}`);
  }
  if (metric.sourceSafe !== true) failures.push('metric_sourceSafe_must_be_true');
  if (!contract.allowedMetricCategories?.includes(metric.metricCategory)) failures.push(`unsupported_metric_category:${metric.metricCategory}`);
  if (typeof metric.metricValue !== 'number' || !Number.isFinite(metric.metricValue)) failures.push('metricValue_must_be_number');
  if (typeof metric.metricWeight !== 'number' || !Number.isFinite(metric.metricWeight)) failures.push('metricWeight_must_be_number');
  if (metric.metricValue < 0 || metric.metricValue > 100) failures.push('metricValue_out_of_range');
  if (metric.metricWeight < 0 || metric.metricWeight > 100) failures.push('metricWeight_out_of_range');
  if (metric.paymentAmount || metric.rawPaymentAmount || metric.totalPaid) failures.push('payment_amount_not_allowed_as_metric');
  if (metric.manualAdjustmentValue && (!metric.manualAdjustmentReason || !metric.reviewedByRef)) failures.push('manual_adjustment_requires_reason_and_reviewer');
  if (metric.sampleSize !== undefined && metric.sampleSize < 3) failures.push('insufficient_sample_size');
  if (metric.assignmentSyncOutcome && ['conflict_review_required', 'manual_review_required'].includes(metric.assignmentSyncOutcome)) failures.push('assignment_conflict_blocks_clean_score');
  if (metric.visitLifecycleOutcome && ['conflict_review_required', 'manual_review_required'].includes(metric.visitLifecycleOutcome)) failures.push('visit_lifecycle_conflict_blocks_clean_score');
  return [...new Set(failures)];
}

function outcomeForMetric(failures) {
  if (failures.some((failure) => failure.includes('payment') || failure.includes('sensitive') || failure.includes('forbidden'))) return 'blocked_sensitive_metric';
  if (failures.some((failure) => failure.includes('sample'))) return 'insufficient_sample_review_required';
  if (failures.some((failure) => failure.includes('manual_adjustment'))) return 'manual_adjustment_review_required';
  if (failures.some((failure) => failure.includes('conflict'))) return 'conflict_review_required';
  if (failures.length) return 'not_ranked_preview';
  return 'shopper_score_preview_ready';
}

function computeScores(rows) {
  const byShopper = new Map();
  for (const row of rows) {
    const key = `${row.tenantId || ''}::${row.projectId || ''}::${row.rankingPeriodId || ''}::${row.shopperId || ''}`;
    if (!byShopper.has(key)) byShopper.set(key, []);
    byShopper.get(key).push(row);
  }
  return [...byShopper.entries()].map(([key, metrics]) => {
    const totalWeight = metrics.reduce((sum, row) => sum + (typeof row.metricWeight === 'number' ? row.metricWeight : 0), 0);
    const weighted = metrics.reduce((sum, row) => sum + ((row.metricValue || 0) * (row.metricWeight || 0)), 0);
    const score = totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) / 100 : null;
    const anyBlocked = metrics.some((row) => row.outcome === 'blocked_sensitive_metric');
    const anyConflict = metrics.some((row) => row.outcome === 'conflict_review_required');
    const anySample = metrics.some((row) => row.outcome === 'insufficient_sample_review_required');
    const anyManual = metrics.some((row) => row.outcome === 'manual_adjustment_review_required');
    let scoreStatus = 'shopper_ranking_ready_for_review';
    if (anyBlocked) scoreStatus = 'blocked_sensitive_metric';
    else if (anyConflict) scoreStatus = 'conflict_review_required';
    else if (anySample) scoreStatus = 'insufficient_sample_review_required';
    else if (anyManual) scoreStatus = 'manual_adjustment_review_required';
    const [tenantId, projectId, rankingPeriodId, shopperId] = key.split('::');
    return {
      tenantId,
      projectId,
      rankingPeriodId,
      shopperId,
      score,
      totalWeight,
      metricCount: metrics.length,
      scoreStatus,
      metricBreakdown: metrics.map((row) => ({ metricId: row.metricId, metricCategory: row.metricCategory, metricValue: row.metricValue, metricWeight: row.metricWeight, outcome: row.outcome }))
    };
  });
}

function validatePreviewInput(inputFile, contract) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];
  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');

  const forbiddenKeys = detectForbiddenKeys(payload);
  if (forbiddenKeys.length) issues.push(`forbidden_or_sensitive_keys_detected:${forbiddenKeys.join(',')}`);

  const run = payload.rankingRun || {};
  const runFailures = validateRankingRun(run, contract);
  const metrics = Array.isArray(payload.shopperMetrics) ? payload.shopperMetrics : [];
  if (!Array.isArray(payload.shopperMetrics)) warnings.push('input.shopperMetrics missing or not an array');

  const rows = metrics.map((metric) => {
    const failures = validateMetric(metric, contract);
    return {
      outcome: outcomeForMetric(failures),
      validationFailures: failures,
      tenantId: metric.tenantId || null,
      projectId: metric.projectId || null,
      rankingRunId: metric.rankingRunId || null,
      rankingPeriodId: metric.rankingPeriodId || null,
      shopperId: metric.shopperId || null,
      metricId: metric.metricId || null,
      metricCategory: metric.metricCategory || null,
      metricValue: metric.metricValue ?? null,
      metricWeight: metric.metricWeight ?? null,
      metricSourceRef: metric.metricSourceRef || null,
      sampleSize: metric.sampleSize ?? null
    };
  });

  const scores = computeScores(rows);
  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    rankingRun: {
      rankingRunId: run.rankingRunId || null,
      rankingPeriodId: run.rankingPeriodId || null,
      rankingScope: run.rankingScope || null,
      scoreVersion: run.scoreVersion || null,
      validationFailures: runFailures
    },
    metricCount: metrics.length,
    forbiddenKeys,
    counts,
    rows,
    scores,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const assignmentSync = readJson(assignmentSyncPath);
  const visitLifecycle = readJson(visitLifecyclePath);
  const communicationHistory = readJson(communicationHistoryPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'geminiAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');
  if (assignmentSync.runtimeEnabled !== false) issues.push('Assignment sync preview must remain disabled');
  if (visitLifecycle.runtimeEnabled !== false) issues.push('Visit lifecycle preview must remain disabled');
  if (communicationHistory.runtimeEnabled !== false || communicationHistory.emailSendAllowed !== false || communicationHistory.whatsappSendAllowed !== false) issues.push('Communication history gates must remain disabled');

  for (const key of ['tenantId', 'projectId', 'shopperId', 'rankingPeriodId', 'rankingRunId', 'metricId', 'metricSourceRef', 'scoreStatus']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }
  for (const outcome of ['shopper_score_preview_ready', 'insufficient_sample_review_required', 'conflict_review_required', 'blocked_sensitive_metric']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input, contract);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
    if (inputPreview.rankingRun.validationFailures.length) issues.push(...inputPreview.rankingRun.validationFailures);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-shopper-ranking-scoring-preview-validator',
    status: issues.length ? 'review_required' : 'shopper_ranking_scoring_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    geminiAllowed: false,
    importRealDataAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, sensitivePolicyPath),
      path.relative(root, assignmentSyncPath),
      path.relative(root, visitLifecyclePath),
      path.relative(root, communicationHistoryPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized metrics only.',
      'Keep ranking as admin review aid, not automatic assignment.',
      'Document any manual adjustment with reviewer and reason.',
      'Update Claude/prototype and Academia with ranking transparency and manual review states.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-shopper-ranking-scoring-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
