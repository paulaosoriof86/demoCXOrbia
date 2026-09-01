#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'assignment-sync-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'hrWriteAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const stableKeys = contract.stableKeys || [];
  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'shopperId', 'assignmentSource', 'assignmentSyncStatus', 'lastSyncedAt']) {
    if (!stableKeys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const statuses = contract.assignmentSyncStatuses || [];
  for (const status of ['pending_make_sync', 'synced_from_platform', 'synced_from_hr', 'conflict_review_required', 'sync_disabled_preview_only']) {
    if (!statuses.includes(status)) issues.push(`Missing assignment sync status: ${status}`);
  }

  const actions = contract.actions || {};
  for (const actionName of ['approvePostulation', 'manualAdminAssignment', 'hrAssignmentDetected', 'markConflict', 'cancelAssignment']) {
    if (!actions[actionName]) issues.push(`Missing action: ${actionName}`);
    if (actions[actionName]?.writesAllowedNow !== false) issues.push(`Action must stay disabled: ${actionName}`);
  }

  const rules = contract.rules || [];
  if (!rules.some((r) => r.includes('No silent overwrite'))) issues.push('Missing no silent overwrite rule');
  if (!rules.some((r) => r.includes('Never deduplicate'))) issues.push('Missing no visual dedupe rule');
  if (!rules.some((r) => r.includes('Make sync remains disabled'))) issues.push('Missing Make disabled rule');

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('ops')) warnings.push('Academy impact should include ops role');
  if (!Array.isArray(academy.manualsToUpdate) || !academy.manualsToUpdate.length) warnings.push('Academy manuals to update not listed');

  const report = {
    validator: 'tya-assignment-sync-contract-validator',
    status: issues.length ? 'review_required' : 'assignment_sync_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    stableKeys,
    assignmentSyncStatuses: statuses,
    actions: Object.keys(actions),
    academyImpact: academy,
    issues,
    warnings,
    nextSafeSteps: [
      'Map postulation and assignment UI states to these canonical statuses without enabling writes.',
      'Use this contract for HR/platform sync validator and conflict preview.',
      'Update Academy manuals and role courses for postulation and assignment workflows.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-assignment-sync-contract-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
