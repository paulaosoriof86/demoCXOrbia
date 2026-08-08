#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'visit-lifecycle-phase-a.tya.contract.json');

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
  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'assignmentId', 'shopperId', 'visitLifecycleStatus', 'questionnaireStatus', 'lastSyncedAt']) {
    if (!stableKeys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const lifecycleStatuses = contract.visitLifecycleStatuses || [];
  for (const status of ['available', 'scheduled', 'performed_pending_questionnaire', 'questionnaire_completed_pending_review', 'approved_for_submitido', 'submitido_registered', 'liquidation_candidate', 'conflict_review_required']) {
    if (!lifecycleStatuses.includes(status)) issues.push(`Missing lifecycle status: ${status}`);
  }

  const questionnaireStatuses = contract.questionnaireStatuses || [];
  for (const status of ['external_link_missing', 'completed_pending_review', 'correction_required']) {
    if (!questionnaireStatuses.includes(status)) issues.push(`Missing questionnaire status: ${status}`);
  }

  const actions = contract.actions || {};
  for (const actionName of ['scheduleVisit', 'requestReschedule', 'cancelVisit', 'markPerformed', 'markQuestionnaireCompleted', 'openReview']) {
    if (!actions[actionName]) issues.push(`Missing action: ${actionName}`);
    if (actions[actionName]?.writesAllowedNow !== false) issues.push(`Action must stay disabled: ${actionName}`);
  }

  const questionnaireRules = contract.questionnaireRules || [];
  if (!questionnaireRules.some((r) => r.includes('not submitido'))) issues.push('Missing questionnaire is not submitido rule');
  if (!questionnaireRules.some((r) => r.includes('must not fall back'))) issues.push('Missing external link no fallback rule');

  const liquidationRules = contract.liquidationRules || [];
  if (!liquidationRules.some((r) => r.includes('not automatically liquidable'))) issues.push('Missing no automatic liquidation rule');
  if (!liquidationRules.some((r) => r.includes('Payment status is separate'))) issues.push('Missing payment separate rule');

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not call Make', 'Do not write HR', 'Do not write Firestore', 'Do not treat questionnaire completed as submitido']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('shopper')) warnings.push('Academy impact should include shopper role');
  if (!Array.isArray(academy.newLessons) || !academy.newLessons.length) warnings.push('Academy new lessons not listed');

  const report = {
    validator: 'tya-visit-lifecycle-contract-validator',
    status: issues.length ? 'review_required' : 'visit_lifecycle_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    lifecycleStatuses,
    questionnaireStatuses,
    actions: Object.keys(actions),
    academyImpact: academy,
    issues,
    warnings,
    nextSafeSteps: [
      'Map visible visit states to canonical lifecycle statuses without enabling writes.',
      'Use this contract for safe preview validation of scheduling, rescheduling, cancellation and questionnaire completed.',
      'Update Academy manuals and role courses for visit lifecycle and shopper execution.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-visit-lifecycle-contract-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
