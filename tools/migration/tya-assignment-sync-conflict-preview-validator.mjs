#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'assignment-sync-conflict-preview-phase-a.tya.contract.json');
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

function stableVisitKeys(row) {
  return [row.visitId, row.hrRowId, row.sourceVisitRef].filter(Boolean).map(String);
}

function hasStableVisitKey(row) {
  return stableVisitKeys(row).length > 0;
}

function safeAssignment(row, sourceType) {
  return {
    sourceType,
    tenantId: row.tenantId || null,
    projectId: row.projectId || null,
    visitId: row.visitId || null,
    hrRowId: row.hrRowId || null,
    sourceVisitRef: row.sourceVisitRef || null,
    shopperId: row.shopperId || null,
    assignmentId: row.assignmentId || null,
    postulationId: row.postulationId || null,
    assignmentSource: row.assignmentSource || sourceType,
    assignmentSyncStatus: row.assignmentSyncStatus || 'sync_disabled_preview_only',
    status: row.status || row.assignmentStatus || null,
    cancelled: row.cancelled === true || row.status === 'cancelled' || row.assignmentStatus === 'cancelled'
  };
}

function matchByStableVisit(platformAssignment, hrAssignment) {
  const platformKeys = new Set(stableVisitKeys(platformAssignment));
  return stableVisitKeys(hrAssignment).some((key) => platformKeys.has(key));
}

function classifyPair(platformAssignment, hrAssignment) {
  const reasons = [];
  if (!platformAssignment.tenantId || !hrAssignment.tenantId || platformAssignment.tenantId !== hrAssignment.tenantId) reasons.push('tenant_mismatch');
  if (!platformAssignment.projectId || !hrAssignment.projectId || platformAssignment.projectId !== hrAssignment.projectId) reasons.push('project_mismatch');
  if (!hasStableVisitKey(platformAssignment) || !hasStableVisitKey(hrAssignment)) reasons.push('missing_stable_visit_key');
  if (!platformAssignment.shopperId || !hrAssignment.shopperId) reasons.push('missing_shopper_key');
  if (platformAssignment.shopperId && hrAssignment.shopperId && platformAssignment.shopperId !== hrAssignment.shopperId) reasons.push('shopper_mismatch');
  if (platformAssignment.hrRowId && hrAssignment.hrRowId && platformAssignment.hrRowId !== hrAssignment.hrRowId) reasons.push('hr_row_mismatch');
  if (platformAssignment.cancelled || hrAssignment.cancelled) reasons.push('cancelled_visit_or_assignment');

  const conflictReasons = reasons.filter((reason) => reason !== 'missing_stable_visit_key' && reason !== 'missing_shopper_key');
  const outcome = conflictReasons.length ? 'conflict_review_required'
    : reasons.length ? 'manual_review_required'
      : 'already_reflected_no_duplicate';

  return {
    outcome,
    conflictReasons: reasons,
    tenantId: platformAssignment.tenantId || hrAssignment.tenantId || null,
    projectId: platformAssignment.projectId || hrAssignment.projectId || null,
    visitId: platformAssignment.visitId || hrAssignment.visitId || null,
    hrRowId: platformAssignment.hrRowId || hrAssignment.hrRowId || null,
    sourceVisitRef: platformAssignment.sourceVisitRef || hrAssignment.sourceVisitRef || null,
    platformShopperId: platformAssignment.shopperId || null,
    hrShopperId: hrAssignment.shopperId || null,
    platformAssignmentId: platformAssignment.assignmentId || null,
    hrAssignmentId: hrAssignment.assignmentId || null,
    recommendedStatus: outcome === 'already_reflected_no_duplicate' ? 'synced_from_hr' : outcome
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

  const platformAssignments = Array.isArray(payload.platformAssignments) ? payload.platformAssignments.map((row) => safeAssignment(row, 'platform_preview')) : [];
  const hrAssignments = Array.isArray(payload.hrAssignments) ? payload.hrAssignments.map((row) => safeAssignment(row, 'hr_preview')) : [];
  const postulations = Array.isArray(payload.postulations) ? payload.postulations : [];

  if (!Array.isArray(payload.platformAssignments)) warnings.push('input.platformAssignments missing or not an array');
  if (!Array.isArray(payload.hrAssignments)) warnings.push('input.hrAssignments missing or not an array');

  const matchedHrIndexes = new Set();
  const rows = [];

  for (const platformAssignment of platformAssignments) {
    const candidateIndexes = hrAssignments
      .map((hrAssignment, index) => ({ hrAssignment, index }))
      .filter(({ hrAssignment }) => matchByStableVisit(platformAssignment, hrAssignment));

    if (candidateIndexes.length > 1) {
      rows.push({
        outcome: 'conflict_review_required',
        conflictReasons: ['duplicate_hr_assignments'],
        tenantId: platformAssignment.tenantId,
        projectId: platformAssignment.projectId,
        visitId: platformAssignment.visitId,
        hrRowId: platformAssignment.hrRowId,
        sourceVisitRef: platformAssignment.sourceVisitRef,
        platformShopperId: platformAssignment.shopperId,
        platformAssignmentId: platformAssignment.assignmentId,
        recommendedStatus: 'conflict_review_required'
      });
      candidateIndexes.forEach(({ index }) => matchedHrIndexes.add(index));
    } else if (candidateIndexes.length === 1) {
      const [{ hrAssignment, index }] = candidateIndexes;
      matchedHrIndexes.add(index);
      rows.push(classifyPair(platformAssignment, hrAssignment));
    } else if (!hasStableVisitKey(platformAssignment) || !platformAssignment.shopperId) {
      rows.push({
        outcome: 'manual_review_required',
        conflictReasons: [!hasStableVisitKey(platformAssignment) ? 'missing_stable_visit_key' : 'missing_shopper_key'].filter(Boolean),
        tenantId: platformAssignment.tenantId,
        projectId: platformAssignment.projectId,
        visitId: platformAssignment.visitId,
        hrRowId: platformAssignment.hrRowId,
        sourceVisitRef: platformAssignment.sourceVisitRef,
        platformShopperId: platformAssignment.shopperId,
        platformAssignmentId: platformAssignment.assignmentId,
        recommendedStatus: 'manual_review_required'
      });
    } else if (platformAssignment.cancelled) {
      rows.push({
        outcome: 'cancelled_or_unassignable',
        conflictReasons: ['cancelled_visit_or_assignment'],
        tenantId: platformAssignment.tenantId,
        projectId: platformAssignment.projectId,
        visitId: platformAssignment.visitId,
        hrRowId: platformAssignment.hrRowId,
        sourceVisitRef: platformAssignment.sourceVisitRef,
        platformShopperId: platformAssignment.shopperId,
        platformAssignmentId: platformAssignment.assignmentId,
        recommendedStatus: 'cancelled'
      });
    } else {
      rows.push({
        outcome: 'platform_pending_hr_sync',
        conflictReasons: [],
        tenantId: platformAssignment.tenantId,
        projectId: platformAssignment.projectId,
        visitId: platformAssignment.visitId,
        hrRowId: platformAssignment.hrRowId,
        sourceVisitRef: platformAssignment.sourceVisitRef,
        platformShopperId: platformAssignment.shopperId,
        platformAssignmentId: platformAssignment.assignmentId,
        recommendedStatus: 'pending_make_sync'
      });
    }
  }

  hrAssignments.forEach((hrAssignment, index) => {
    if (matchedHrIndexes.has(index)) return;
    if (!hasStableVisitKey(hrAssignment) || !hrAssignment.shopperId) {
      rows.push({
        outcome: 'manual_review_required',
        conflictReasons: [!hasStableVisitKey(hrAssignment) ? 'missing_stable_visit_key' : 'missing_shopper_key'].filter(Boolean),
        tenantId: hrAssignment.tenantId,
        projectId: hrAssignment.projectId,
        visitId: hrAssignment.visitId,
        hrRowId: hrAssignment.hrRowId,
        sourceVisitRef: hrAssignment.sourceVisitRef,
        hrShopperId: hrAssignment.shopperId,
        hrAssignmentId: hrAssignment.assignmentId,
        recommendedStatus: 'manual_review_required'
      });
      return;
    }
    rows.push({
      outcome: hrAssignment.cancelled ? 'cancelled_or_unassignable' : 'hr_detected_new_assignment',
      conflictReasons: hrAssignment.cancelled ? ['cancelled_visit_or_assignment'] : [],
      tenantId: hrAssignment.tenantId,
      projectId: hrAssignment.projectId,
      visitId: hrAssignment.visitId,
      hrRowId: hrAssignment.hrRowId,
      sourceVisitRef: hrAssignment.sourceVisitRef,
      hrShopperId: hrAssignment.shopperId,
      hrAssignmentId: hrAssignment.assignmentId,
      recommendedStatus: hrAssignment.cancelled ? 'cancelled' : 'synced_from_hr'
    });
  });

  const counts = rows.reduce((acc, row) => {
    acc[row.outcome] = (acc[row.outcome] || 0) + 1;
    return acc;
  }, {});

  return {
    inputChecked: path.relative(root, inputPath),
    platformAssignmentCount: platformAssignments.length,
    hrAssignmentCount: hrAssignments.length,
    postulationCount: postulations.length,
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
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'hrWriteAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');

  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'sourceVisitRef', 'shopperId', 'assignmentId', 'assignmentSource', 'assignmentSyncStatus']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['platform_pending_hr_sync', 'hr_detected_new_assignment', 'already_reflected_no_duplicate', 'conflict_review_required', 'manual_review_required']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  for (const reason of ['missing_stable_visit_key', 'shopper_mismatch', 'duplicate_hr_assignments', 'sensitive_fields_detected', 'visual_match_only_not_allowed']) {
    if (!contract.conflictReasons?.includes(reason)) issues.push(`Missing conflict reason: ${reason}`);
  }

  const rules = contract.mappingRules || [];
  if (!rules.some((rule) => rule.includes('Do not dedupe by branch name'))) issues.push('Missing no visual/branch dedupe rule');
  if (!rules.some((rule) => rule.includes('No writes'))) issues.push('Missing no writes rule');

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-assignment-sync-conflict-preview-validator',
    status: issues.length ? 'review_required' : 'assignment_sync_conflict_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    sensitivePolicyChecked: path.relative(root, sensitivePolicyPath),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized platformAssignments and hrAssignments only.',
      'Keep HR synchronized labels out of UI while gates are off.',
      'Route mismatches to conflict_review_required, never overwrite silently.',
      'Update Academy assignment sync conflict lessons and checklists.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-assignment-sync-conflict-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
