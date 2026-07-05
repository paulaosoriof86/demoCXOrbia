#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'visit-lifecycle-reservation-preview-phase-a.tya.contract.json');
const lifecycleContractPath = path.join(root, 'app', 'contracts', 'visit-lifecycle-phase-a.tya.contract.json');
const reservationContractPath = path.join(root, 'app', 'contracts', 'visit-reservation-window-phase-a.tya.contract.json');
const assignmentPreviewContractPath = path.join(root, 'app', 'contracts', 'assignment-sync-conflict-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Email|Whatsapp|Attachment|Audio|Body)?/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i
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
  return [...new Set(keys.filter((key) => sensitivePatterns.some((pattern) => pattern.test(key))))];
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function dayOfMonth(value) {
  const date = parseDate(value);
  return date ? date.getUTCDate() : null;
}

function weekday(value) {
  const date = parseDate(value);
  return date ? date.getUTCDay() : null;
}

function compareIsoDate(a, b) {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return null;
  return da.getTime() - db.getTime();
}

function isFutureDateTime(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

function actionDate(row) {
  if (row.actionType === 'reserve_from_postulation') return row.proposedDate;
  if (row.actionType === 'schedule_visit') return row.scheduledAt || row.proposedDate;
  if (row.actionType === 'request_reschedule' || row.actionType === 'approve_reschedule') return row.rescheduledAt || row.requestedDate;
  return row.scheduledAt || row.proposedDate || row.requestedDate || row.rescheduledAt;
}

function validateWindow(row) {
  const failures = [];
  const dateValue = actionDate(row);
  const hasOverride = row.overrideApproved === true || row.scheduleValidationStatus === 'override_approved';

  if (['reserve_from_postulation', 'schedule_visit', 'request_reschedule', 'approve_reschedule'].includes(row.actionType) && !dateValue) {
    failures.push('missing_required_date');
  }

  if (dateValue && row.availableFrom && compareIsoDate(dateValue, row.availableFrom) < 0 && !hasOverride) {
    failures.push('before_available_from');
  }

  if (dateValue && row.franja && !hasOverride) {
    const d = weekday(dateValue);
    if (row.franja === 'WK' && !(d >= 1 && d <= 5)) failures.push('outside_franja');
    if (row.franja === 'WKND' && !(d === 0 || d === 6)) failures.push('outside_franja');
  }

  if (dateValue && row.quincena && !hasOverride) {
    const day = dayOfMonth(dateValue);
    if (row.quincena === 'Q1' && !(day >= 1 && day <= 15)) failures.push('outside_quincena');
    if (row.quincena === 'Q2' && !(day >= 16)) failures.push('outside_quincena');
  }

  if (hasOverride && (!row.authorizedBy || !row.authorizedReason)) failures.push('override_required');

  return failures;
}

function validateLifecycle(row) {
  const failures = [];
  if (!row.tenantId || !row.projectId || !row.visitId) failures.push('missing_tenant_project_visit');

  const needsAssignment = ['reserve_from_postulation', 'schedule_visit', 'request_reschedule', 'approve_reschedule', 'mark_performed', 'mark_questionnaire_completed'].includes(row.actionType);
  if (needsAssignment && (!row.assignmentId || !row.shopperId)) failures.push('missing_assignment_or_shopper');

  if (row.assignmentSyncOutcome === 'conflict_review_required' || row.assignmentSyncOutcome === 'manual_review_required') failures.push('assignment_sync_conflict');

  if (row.actionType === 'mark_performed') {
    if (!row.performedAt) failures.push('missing_required_date');
    if (isFutureDateTime(row.performedAt)) failures.push('future_performed_at');
  }

  if (row.actionType === 'mark_questionnaire_completed') {
    if (!row.questionnaireCompletedAt) failures.push('missing_required_date');
    if (isFutureDateTime(row.questionnaireCompletedAt)) failures.push('future_questionnaire_completed_at');
    if (row.performedAt && row.questionnaireCompletedAt && compareIsoDate(row.questionnaireCompletedAt, row.performedAt) < 0) failures.push('questionnaire_before_performed');
  }

  if (row.activeReservationExists === true && row.actionType === 'reserve_from_postulation') failures.push('reservation_duplicate_risk');

  return failures;
}

function outcomeFor(row, failures) {
  if (failures.includes('assignment_sync_conflict')) return 'assignment_conflict_blocks_schedule';
  if (failures.includes('missing_tenant_project_visit') || failures.includes('missing_assignment_or_shopper') || failures.includes('missing_required_date')) return 'manual_review_required';
  if (failures.length) return 'conflict_review_required';
  if (row.actionType === 'reserve_from_postulation') return 'reservation_ready';
  if (row.actionType === 'schedule_visit') return 'schedule_valid';
  if (row.actionType === 'request_reschedule' || row.actionType === 'approve_reschedule') return 'reschedule_valid';
  if (row.actionType === 'cancel_visit') return 'cancelled_or_unassignable';
  if (row.actionType === 'release_reservation') return 'released_to_available';
  if (row.actionType === 'mark_performed') return 'performed_pending_questionnaire';
  if (row.actionType === 'mark_questionnaire_completed') return 'questionnaire_completed_pending_review';
  return 'manual_review_required';
}

function recommendedStatus(outcome) {
  return {
    reservation_ready: 'reserved_with_proposed_date',
    schedule_valid: 'scheduled',
    reschedule_valid: 'rescheduled',
    released_to_available: 'available',
    cancelled_or_unassignable: 'cancelled',
    performed_pending_questionnaire: 'performed_pending_questionnaire',
    questionnaire_completed_pending_review: 'questionnaire_completed_pending_review',
    assignment_conflict_blocks_schedule: 'conflict_review_required',
    manual_review_required: 'manual_review_required',
    conflict_review_required: 'conflict_review_required'
  }[outcome] || 'manual_review_required';
}

function safeRow(row, failures, outcome) {
  return {
    outcome,
    validationFailures: failures,
    tenantId: row.tenantId || null,
    projectId: row.projectId || null,
    visitId: row.visitId || null,
    hrRowId: row.hrRowId || null,
    sourceVisitRef: row.sourceVisitRef || null,
    assignmentId: row.assignmentId || null,
    shopperId: row.shopperId || null,
    reservationId: row.reservationId || null,
    scheduleRequestId: row.scheduleRequestId || null,
    actionType: row.actionType || null,
    franja: row.franja || null,
    quincena: row.quincena || null,
    availableFrom: row.availableFrom || null,
    proposedDate: row.proposedDate || null,
    scheduledAt: row.scheduledAt || null,
    rescheduledAt: row.rescheduledAt || null,
    performedAt: row.performedAt || null,
    questionnaireCompletedAt: row.questionnaireCompletedAt || null,
    assignmentSyncOutcome: row.assignmentSyncOutcome || null,
    recommendedVisitLifecycleStatus: recommendedStatus(outcome),
    recommendedScheduleValidationStatus: failures.length ? (failures.includes('override_required') ? 'override_required' : 'conflict_review_required') : 'valid'
  };
}

function validatePreviewInput(inputFile) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];

  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');

  const sensitiveKeys = detectSensitiveKeys(payload);
  if (sensitiveKeys.length) issues.push(`sensitive_or_raw_field_keys_detected:${sensitiveKeys.join(',')}`);

  const visits = Array.isArray(payload.visits) ? payload.visits : [];
  if (!Array.isArray(payload.visits)) warnings.push('input.visits missing or not an array');

  const rows = visits.map((row) => {
    const failures = [...new Set([...validateWindow(row), ...validateLifecycle(row)])];
    const outcome = outcomeFor(row, failures);
    return safeRow(row, failures, outcome);
  });

  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    visitCount: visits.length,
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
  const lifecycleContract = readJson(lifecycleContractPath);
  const reservationContract = readJson(reservationContractPath);
  const assignmentPreviewContract = readJson(assignmentPreviewContractPath);
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'hrWriteAllowed', 'storageWritesAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');
  if (assignmentPreviewContract.runtimeEnabled !== false) issues.push('Assignment preview dependency must keep runtime disabled');
  if (lifecycleContract.runtimeEnabled !== false) issues.push('Lifecycle dependency must keep runtime disabled');
  if (reservationContract.runtimeEnabled !== false) issues.push('Reservation dependency must keep runtime disabled');

  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'assignmentId', 'shopperId', 'availableFrom', 'franja', 'quincena', 'visitLifecycleStatus', 'assignmentSyncOutcome']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['reservation_ready', 'schedule_valid', 'reschedule_valid', 'assignment_conflict_blocks_schedule', 'manual_review_required', 'conflict_review_required']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  for (const failure of ['before_available_from', 'outside_franja', 'outside_quincena', 'future_performed_at', 'questionnaire_before_performed', 'assignment_sync_conflict']) {
    if (!contract.validationFailures?.includes(failure)) issues.push(`Missing validation failure: ${failure}`);
  }

  const rules = contract.scheduleWindowRules || [];
  if (!rules.some((rule) => rule.includes('availableFrom'))) issues.push('Missing availableFrom rule');
  if (!rules.some((rule) => rule.includes('Reservation means'))) issues.push('Missing reservation is not HR sync rule');

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-visit-lifecycle-reservation-preview-validator',
    status: issues.length ? 'review_required' : 'visit_lifecycle_reservation_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    hrWriteAllowed: false,
    storageWritesAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, lifecycleContractPath),
      path.relative(root, reservationContractPath),
      path.relative(root, assignmentPreviewContractPath),
      path.relative(root, sensitivePolicyPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized visits only.',
      'Keep reservation and schedule labels as preview/pending HR sync while gates are off.',
      'Route out-of-window schedules to override/review, never silent approval.',
      'Update Academy visit lifecycle and reservation lessons/checklists.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-visit-lifecycle-reservation-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
