#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'project-tenant-rule-versioning-preview-phase-a.tya.contract.json');
const dependencyPaths = [
  'sensitive-data-policy-phase-a.tya.contract.json',
  'assignment-sync-conflict-preview-phase-a.tya.contract.json',
  'visit-lifecycle-reservation-preview-phase-a.tya.contract.json',
  'postulation-dynamic-form-preview-phase-a.tya.contract.json',
  'notification-outbox-preview-phase-a.tya.contract.json',
  'email-user-mailbox-preview-phase-a.tya.contract.json',
  'crm-external-folder-refs-preview-phase-a.tya.contract.json',
  'shopper-communication-history-preview-phase-a.tya.contract.json',
  'shopper-ranking-scoring-preview-phase-a.tya.contract.json'
].map((file) => path.join(root, 'app', 'contracts', file));

const sensitiveKeyPatterns = [
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
  /token|secret|clientSecret|oauth/i,
  /raw(Payload|Secret|Credential|Document|File|Body|Attachment|Contact)?/i,
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

function detectSensitiveKeys(payload) {
  const keys = flattenKeys(payload);
  return [...new Set(keys.filter((key) => sensitiveKeyPatterns.some((pattern) => pattern.test(key))))];
}

function validateRuleSet(ruleSet, contract) {
  const failures = [];
  for (const key of contract.requiredRuleSetFields || []) {
    if (ruleSet[key] === undefined || ruleSet[key] === null || ruleSet[key] === '') failures.push(`missing_${key}`);
  }
  if (ruleSet.ruleSetType && !contract.ruleSetTypes?.includes(ruleSet.ruleSetType)) failures.push(`unsupported_ruleSetType:${ruleSet.ruleSetType}`);
  if (ruleSet.status && !contract.statuses?.includes(ruleSet.status)) failures.push(`unsupported_status:${ruleSet.status}`);
  if (ruleSet.changeType && !contract.changeTypes?.includes(ruleSet.changeType)) failures.push(`unsupported_changeType:${ruleSet.changeType}`);
  if (ruleSet.productionAllowed === true || ruleSet.firestoreWritesAllowed === true || ruleSet.makeEnabled === true || ruleSet.geminiEnabled === true || ruleSet.realProviderEnabled === true) failures.push('real_activation_flag_not_allowed');
  if (ruleSet.secrets || ruleSet.credentials || ruleSet.rawPayload || ruleSet.rawConfig || ruleSet.providerToken) failures.push('raw_or_secret_payload_not_allowed');
  if (ruleSet.changeType?.startsWith('breaking_') && (!ruleSet.migrationPlanId || !ruleSet.rollbackPlanId)) failures.push('breaking_change_requires_migration_and_rollback');
  if (['currency_country_change', 'payment_rule_change', 'sensitive_policy_change', 'integration_gate_change'].includes(ruleSet.changeType) && !ruleSet.reviewedByRef) failures.push('high_impact_change_requires_review');
  if (ruleSet.status === 'active_future_only' && !ruleSet.approvedByRef) failures.push('future_activation_requires_approval_ref');
  if (ruleSet.ruleSetVersion && !String(ruleSet.ruleSetVersion).match(/^v?\d+(\.\d+){0,3}(-[a-z0-9_-]+)?$/i)) failures.push('ruleSetVersion_format_review_required');
  if (ruleSet.previousRuleSetVersion && ruleSet.previousRuleSetVersion === ruleSet.ruleSetVersion) failures.push('previous_version_same_as_current');
  if (ruleSet.projectId === 'global' && ruleSet.ruleSetType !== 'sensitive_data_policy') failures.push('global_project_rule_requires_platform_review');
  return [...new Set(failures)];
}

function outcomeFor(failures) {
  if (failures.some((failure) => failure.includes('secret') || failure.includes('sensitive') || failure.includes('raw_'))) return 'blocked_sensitive_payload';
  if (failures.some((failure) => failure.includes('real_activation'))) return 'blocked_real_activation';
  if (failures.some((failure) => failure.includes('rollback'))) return 'rollback_plan_required';
  if (failures.some((failure) => failure.includes('migration'))) return 'migration_plan_required';
  if (failures.some((failure) => failure.includes('review') || failure.includes('approval'))) return 'human_review_required';
  if (failures.length) return 'conflict_review_required';
  return 'rule_version_preview_ready';
}

function validatePreviewInput(inputFile, contract) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];

  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');

  const sensitiveKeys = detectSensitiveKeys(payload);
  if (sensitiveKeys.length) issues.push(`sensitive_or_raw_field_keys_detected:${sensitiveKeys.join(',')}`);

  const ruleSets = Array.isArray(payload.ruleSets) ? payload.ruleSets : [];
  if (!Array.isArray(payload.ruleSets)) warnings.push('input.ruleSets missing or not an array');

  const rows = ruleSets.map((ruleSet) => {
    const failures = validateRuleSet(ruleSet, contract);
    return {
      outcome: outcomeFor(failures),
      validationFailures: failures,
      tenantId: ruleSet.tenantId || null,
      projectId: ruleSet.projectId || null,
      ruleSetId: ruleSet.ruleSetId || null,
      ruleSetVersion: ruleSet.ruleSetVersion || null,
      ruleSetType: ruleSet.ruleSetType || null,
      status: ruleSet.status || null,
      changeType: ruleSet.changeType || null,
      previousRuleSetVersion: ruleSet.previousRuleSetVersion || null,
      migrationPlanId: ruleSet.migrationPlanId || null,
      rollbackPlanId: ruleSet.rollbackPlanId || null
    };
  });

  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    ruleSetCount: ruleSets.length,
    sensitiveKeys,
    counts,
    rows,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const dependencies = dependencyPaths.map(readJson);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'geminiAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  dependencies.forEach((dependency, index) => {
    if (dependency.runtimeEnabled !== false && dependency.status !== 'draft_documental_no_runtime') {
      issues.push(`Dependency runtime must remain disabled: ${path.basename(dependencyPaths[index])}`);
    }
  });

  for (const key of ['tenantId', 'projectId', 'ruleSetId', 'ruleSetVersion', 'ruleSetType', 'status', 'migrationPlanId', 'rollbackPlanId']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['rule_version_preview_ready', 'human_review_required', 'blocked_sensitive_payload', 'blocked_real_activation', 'rollback_plan_required']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input, contract);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-project-tenant-rule-versioning-preview-validator',
    status: issues.length ? 'review_required' : 'project_tenant_rule_versioning_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    geminiAllowed: false,
    importRealDataAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: dependencyPaths.map((filePath) => path.relative(root, filePath)),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized ruleSets only.',
      'Keep rule versions as preview/draft until explicit approval gates exist.',
      'Never overwrite active project rules silently.',
      'Update Claude/prototype and Academia with rule versioning, migration and rollback states.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-project-tenant-rule-versioning-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
