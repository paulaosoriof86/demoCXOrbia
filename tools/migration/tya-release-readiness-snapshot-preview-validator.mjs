#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'release-readiness-snapshot-preview-phase-a.tya.contract.json');
const dependencyFiles = [
  'sensitive-data-policy-phase-a.tya.contract.json',
  'assignment-sync-conflict-preview-phase-a.tya.contract.json',
  'visit-lifecycle-reservation-preview-phase-a.tya.contract.json',
  'postulation-dynamic-form-preview-phase-a.tya.contract.json',
  'notification-outbox-preview-phase-a.tya.contract.json',
  'email-user-mailbox-preview-phase-a.tya.contract.json',
  'crm-external-folder-refs-preview-phase-a.tya.contract.json',
  'shopper-communication-history-preview-phase-a.tya.contract.json',
  'shopper-ranking-scoring-preview-phase-a.tya.contract.json',
  'project-tenant-rule-versioning-preview-phase-a.tya.contract.json',
  'rule-change-changelog-notification-preview-phase-a.tya.contract.json',
  'synthetic-input-pack-readiness-map-phase-a.tya.contract.json',
  'readiness-map-to-release-snapshot-bridge-phase-a.tya.contract.json'
];
const dependencyPaths = dependencyFiles.map((file) => path.join(root, 'app', 'contracts', file));

const sensitiveKeyPatterns = [
  /dpi|passport|pasaporte/i,
  /document(Number|o)?/i,
  /bank|banco|account|cuenta|iban|swift/i,
  /phone|telefono|teléfono|whatsapp|email/i,
  /raw(Data|Payload|Source|Body|Message|Recipient|Contact|Url|Link|Attachment|File)?/i,
  /token|secret|clientSecret|oauth|credential/i,
  /base64|attachment|adjunto|privateLink|signedUrl/i,
  /productionCredential|serviceAccount|apiKey/i
];

const safeMetadataKeySuffixes = new Set([
  'sourceSafe',
  'containsRawSensitiveData',
  'isSyntheticOrSanitized',
  'forbidsRawSensitiveData',
  'rawOperationalDataAllowed',
  'realProviderCredentialsAllowed',
  'emailSendAllowed',
  'whatsappSendAllowed',
  'paymentProviderAllowed',
  'firestoreWritesAllowed',
  'storageWritesAllowed',
  'makeWriteAllowed',
  'geminiAllowed',
  'importRealDataAllowed',
  'productionAllowed',
  'deployAllowed',
  'mergeAllowed',
  'realActivationRequested',
  'deployRequested',
  'writeRequested'
]);

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

function isSafeMetadataKey(key) {
  const suffix = String(key).split('.').pop();
  return safeMetadataKeySuffixes.has(suffix);
}

function detectSensitiveKeys(payload) {
  const keys = flattenKeys(payload);
  return [...new Set(keys.filter((key) => !isSafeMetadataKey(key) && sensitiveKeyPatterns.some((pattern) => pattern.test(key))))];
}

function validateSnapshot(snapshot, contract) {
  const failures = [];
  for (const key of contract.requiredSnapshotFields || []) {
    if (snapshot?.[key] === undefined || snapshot?.[key] === null || snapshot?.[key] === '') failures.push(`missing_snapshot_${key}`);
  }
  if (snapshot?.deployAllowed === true || snapshot?.mergeAllowed === true || snapshot?.productionAllowed === true || snapshot?.firestoreWritesAllowed === true || snapshot?.importRealDataAllowed === true) failures.push('real_activation_flag_not_allowed');
  if (snapshot?.status && !['draft_preview', 'ready_for_review', 'manual_review_required', 'blocked', 'approved_preview_only'].includes(snapshot.status)) failures.push(`unsupported_snapshot_status:${snapshot.status}`);
  if (snapshot?.approvedByRef && snapshot?.status !== 'approved_preview_only') failures.push('approval_ref_requires_approved_preview_only_status');
  return [...new Set(failures)];
}

function validateReadinessItem(item, contract) {
  const failures = [];
  for (const key of contract.requiredReadinessItemFields || []) {
    if (item[key] === undefined || item[key] === null || item[key] === '') failures.push(`missing_item_${key}`);
  }
  if (item.readinessArea && !contract.readinessAreas?.includes(item.readinessArea)) failures.push(`unsupported_readinessArea:${item.readinessArea}`);
  if (item.readinessStatus && !contract.readinessStatuses?.includes(item.readinessStatus)) failures.push(`unsupported_readinessStatus:${item.readinessStatus}`);
  if (item.gateStatus && !contract.gateStatuses?.includes(item.gateStatus)) failures.push(`unsupported_gateStatus:${item.gateStatus}`);
  if (['blocked_missing_input', 'blocked_sensitive_data', 'blocked_real_gate_off', 'blocked_prototype_pending', 'blocked_conflict'].includes(item.readinessStatus) && !item.blockingReason) failures.push('blocked_item_requires_blockingReason');
  if (item.readinessStatus === 'manual_review_required' && !item.manualReviewReason) failures.push('manual_review_requires_reason');
  if (item.gateStatus === 'future_activation_requires_approval' && !item.approvalPlanRef) failures.push('future_activation_requires_approval_plan_ref');
  if (item.realActivationRequested === true || item.deployRequested === true || item.writeRequested === true) failures.push('real_activation_request_not_allowed');
  return [...new Set(failures)];
}

function outcomeForItem(failures, item) {
  if (failures.some((failure) => failure.includes('sensitive'))) return 'release_snapshot_blocked_sensitive_data';
  if (failures.some((failure) => failure.includes('real_activation'))) return 'release_snapshot_blocked_real_gate_off';
  if (failures.some((failure) => failure.includes('missing'))) return 'release_snapshot_blocked_missing_input';
  if (failures.some((failure) => failure.includes('manual_review') || failure.includes('approval'))) return 'release_snapshot_manual_review_required';
  if (failures.length) return 'release_snapshot_conflict_review_required';
  if (item.readinessStatus === 'ready_for_review') return 'release_snapshot_ready_for_review';
  if (item.readinessStatus === 'blocked_prototype_pending') return 'release_snapshot_blocked_prototype_pending';
  return 'release_snapshot_preview_ready';
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

  const snapshot = payload.snapshot || {};
  const snapshotFailures = validateSnapshot(snapshot, contract);
  const items = Array.isArray(payload.readinessItems) ? payload.readinessItems : [];
  if (!Array.isArray(payload.readinessItems)) warnings.push('input.readinessItems missing or not an array');

  const rows = items.map((item) => {
    const failures = validateReadinessItem(item, contract);
    return {
      outcome: outcomeForItem(failures, item),
      validationFailures: failures,
      tenantId: item.tenantId || null,
      projectId: item.projectId || null,
      snapshotId: item.snapshotId || null,
      readinessArea: item.readinessArea || null,
      readinessStatus: item.readinessStatus || null,
      gateStatus: item.gateStatus || null,
      validatorId: item.validatorId || null,
      blockingReason: item.blockingReason || null,
      manualReviewReason: item.manualReviewReason || null
    };
  });

  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    snapshot: {
      snapshotId: snapshot.snapshotId || null,
      snapshotPeriodId: snapshot.snapshotPeriodId || null,
      baselineRef: snapshot.baselineRef || null,
      backendBranchRef: snapshot.backendBranchRef || null,
      pullRequestRef: snapshot.pullRequestRef || null,
      status: snapshot.status || null,
      validationFailures: snapshotFailures
    },
    readinessItemCount: items.length,
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

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'geminiAllowed', 'importRealDataAllowed', 'deployAllowed', 'mergeAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  dependencies.forEach((dependency, index) => {
    if (dependency.runtimeEnabled !== false && dependency.status !== 'draft_documental_no_runtime') issues.push(`Dependency runtime must remain disabled: ${path.basename(dependencyPaths[index])}`);
  });
  for (const key of ['tenantId', 'snapshotId', 'baselineRef', 'validatorId', 'validatorStatus', 'gateStatus', 'readinessArea', 'readinessStatus']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input, contract);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
    if (inputPreview.snapshot.validationFailures.length) issues.push(...inputPreview.snapshot.validationFailures);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-release-readiness-snapshot-preview-validator',
    status: issues.length ? 'review_required' : 'release_readiness_snapshot_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    makeWriteAllowed: false,
    emailSendAllowed: false,
    whatsappSendAllowed: false,
    geminiAllowed: false,
    importRealDataAllowed: false,
    deployAllowed: false,
    mergeAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: dependencyPaths.map((filePath) => path.relative(root, filePath)),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized readiness snapshot only.',
      'Keep all real activation gates off until explicit future approval and production plan exist.',
      'Use readiness blockers to separate missing input, prototype pending, sensitive data and real gate off states.',
      'Update Claude/prototype and Academia with preview readiness dashboard states.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ validator: 'tya-release-readiness-snapshot-preview-validator', status: 'error', runtimeEnabled: false, productionAllowed: false, firestoreWritesAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
