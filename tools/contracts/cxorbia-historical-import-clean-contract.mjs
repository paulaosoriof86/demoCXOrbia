#!/usr/bin/env node
/*
  CXOrbia - Historical import clean contract validator
  Preview-only contract. No database writes, no raw data persistence, no HR writes, no deploy.

  Purpose:
  Validate the manifest for a clean historical import before any real import.
  The contract permits only sanitized metadata and stable-key previews. It must
  never receive raw sensitive data, old database dumps, bank data or DPI.
*/

const actions = new Set([
  'preview_import_manifest',
  'validate_source_snapshot',
  'validate_row_mapping',
  'preview_dedupe_keys',
  'preview_conflict_queue',
  'request_import_batch_review',
  'export_import_readiness_report'
]);

const roles = new Set([
  'superadmin',
  'admin',
  'ops',
  'finance',
  'technical_reviewer'
]);

const sourceTypes = new Set([
  'hr_export_clean',
  'manual_clean_csv',
  'controlled_fixture',
  'redacted_reference'
]);

const entities = new Set([
  'projects',
  'visits',
  'shoppers',
  'assignments',
  'certifications',
  'settlements',
  'questionnaire_routes'
]);

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function hasSensitiveKey(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const raw = JSON.stringify(obj).toLowerCase();
  return ['dpi', 'dui', 'passport', 'pasaporte', 'bank', 'banco', 'cuenta bancaria', 'accountnumber', 'iban', 'swift', 'nda', 'password', 'token', 'secret'].some(term => raw.includes(term));
}

function validate(payload) {
  const errors = [];
  const warnings = [];
  const p = payload && typeof payload === 'object' ? payload : {};

  if (!hasText(p.tenantId)) errors.push('tenantId_required');
  if (!hasText(p.projectId)) errors.push('projectId_required');
  if (!hasText(p.action) || !actions.has(p.action)) errors.push('unsupported_action');
  if (!hasText(p.actorRole) || !roles.has(p.actorRole)) errors.push('unsupported_actor_role');
  if (!hasText(p.auditRef)) errors.push('auditRef_required');

  if (!hasText(p.sourceType) || !sourceTypes.has(p.sourceType)) errors.push('unsupported_source_type');
  if (!hasText(p.entity) || !entities.has(p.entity)) errors.push('unsupported_entity');

  if (!isPositiveInteger(p.totalRows)) errors.push('totalRows_required_non_negative_integer');
  if (!isPositiveInteger(p.cleanRows)) errors.push('cleanRows_required_non_negative_integer');
  if (!isPositiveInteger(p.rejectedRows)) errors.push('rejectedRows_required_non_negative_integer');

  if (Number.isInteger(p.totalRows) && Number.isInteger(p.cleanRows) && Number.isInteger(p.rejectedRows)) {
    if (p.cleanRows + p.rejectedRows > p.totalRows) errors.push('clean_plus_rejected_exceeds_total');
  }

  if (!Array.isArray(p.stableKeys) || p.stableKeys.length === 0) {
    errors.push('stableKeys_required');
  } else {
    const requiredKeys = ['tenantId', 'projectId'];
    for (const key of requiredKeys) {
      if (!p.stableKeys.includes(key)) errors.push(`stableKey_${key}_required`);
    }
  }

  if (p.entity === 'visits' && Array.isArray(p.stableKeys) && !p.stableKeys.includes('visitId')) {
    errors.push('visitId_stable_key_required_for_visits');
  }

  if (p.entity === 'shoppers' && Array.isArray(p.stableKeys) && !p.stableKeys.includes('shopperId')) {
    errors.push('shopperId_stable_key_required_for_shoppers');
  }

  if (p.entity === 'assignments' && Array.isArray(p.stableKeys)) {
    for (const key of ['visitId', 'shopperId', 'assignmentSource']) {
      if (!p.stableKeys.includes(key)) errors.push(`stableKey_${key}_required_for_assignments`);
    }
  }

  if (p.execute === true || p.writeToDatabase === true || p.writeToHr === true || p.importNow === true) {
    errors.push('real_import_side_effects_not_allowed');
  }

  if (p.oldDatabaseDump === true || p.connectOldDatabase === true) {
    errors.push('old_database_copy_not_allowed');
  }

  if (p.containsDpi === true || p.containsBankData === true || p.containsNda === true || p.containsRawSensitiveData === true || hasSensitiveKey(p.sampleRow)) {
    errors.push('sensitive_data_not_allowed');
  }

  if (p.rejectedRows > 0) warnings.push('rejected_rows_require_review_report');
  if (p.conflictCount > 0) warnings.push('conflicts_require_human_review_queue');

  return {
    contract: 'cxorbia-historical-import-clean',
    version: 'phase-a-preview-20260708',
    generatedAt: new Date().toISOString(),
    action: p.action || null,
    tenantId: p.tenantId || null,
    projectId: p.projectId || null,
    entity: p.entity || null,
    verdict: errors.length ? 'NO_GO_CONTRACT' : 'GO_PREVIEW_ONLY',
    status: errors.length ? 'blocked_gate' : 'import_preview_ready',
    errors,
    warnings,
    stableKeys: p.stableKeys || [],
    safeState: {
      deploy: false,
      production: false,
      databaseWrites: false,
      hrWrites: false,
      oldDatabaseConnection: false,
      imports: false,
      sensitiveData: false
    }
  };
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { input += chunk; });
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(input.trim() || '{}');
    } catch {
      console.log(JSON.stringify({
        contract: 'cxorbia-historical-import-clean',
        verdict: 'NO_GO_CONTRACT',
        errors: ['invalid_json'],
        safeState: { deploy: false, production: false, databaseWrites: false, hrWrites: false, oldDatabaseConnection: false, imports: false }
      }, null, 2));
      process.exitCode = 1;
      return;
    }

    const result = validate(payload);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.errors.length ? 1 : 0;
  });
}

main();
