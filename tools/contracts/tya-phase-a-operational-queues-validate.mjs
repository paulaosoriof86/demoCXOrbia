#!/usr/bin/env node
/* CXOrbia TyA - Phase A operational queues validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate source-safe operational queues for Phase A: conflicts, HR/platform sync,
   certification preservation, June liquidation/payment control, questionnaire route review and admin corrections.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-operational-queues-contract-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(rel) { return path.join(root, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function exists(rel) { return fs.existsSync(abs(rel)); }

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.mode !== 'source_safe_contract_only_no_writes') add(hardFails, 'contract_mode_must_be_no_writes', { mode: contract.mode });

  const principles = contract.principles || {};
  for (const principle of [
    'queueItemsAreSourceSafe',
    'queueItemsAreTenantProjectScoped',
    'queueItemsRequireStableKeys',
    'queueResolutionRequiresAudit',
    'noRawSensitiveData',
    'noSilentOverwrite',
    'noVisualDeduplication',
    'noSyntheticFixtureAsRealEvidence',
    'noDerivedTmpOutputAsOriginalEvidence',
    'humanReviewForBlockers'
  ]) {
    if (principles[principle] !== true) add(hardFails, 'required_queue_principle_missing_or_false', { principle });
  }
  if (principles.queueResolutionWritesAllowedNow !== false) add(hardFails, 'queue_resolution_writes_must_be_disabled_now');

  const requiredFields = new Set(contract.queueItemRequiredFields || []);
  for (const field of ['queueItemId', 'tenantId', 'projectId', 'queueType', 'severity', 'status', 'entityType', 'entityId', 'stableKeys', 'reasonCode', 'source', 'sourceRef', 'createdAt', 'updatedAt', 'gateStatus']) {
    if (!requiredFields.has(field)) add(hardFails, 'required_queue_item_field_missing', { field });
  }

  const forbidden = new Set(contract.forbiddenQueueFields || []);
  for (const field of ['rawDpi', 'dpi', 'rawBankAccount', 'bankAccount', 'rawPhone', 'phone', 'rawEmail', 'email', 'rawShopperName', 'serviceAccountJson', 'makeWebhookUrl', 'geminiApiKey', 'paymentProviderToken', 'rawHrRow', 'rawCsv', 'rawWorkbook']) {
    if (!forbidden.has(field)) add(hardFails, 'forbidden_queue_field_missing', { field });
  }

  const queueTypes = contract.queueTypes || [];
  for (const queueType of ['sync_conflicts', 'hr_platform_sync_pending', 'certification_preservation_review', 'june_liquidation_payment_control', 'questionnaire_route_review', 'admin_corrections_review']) {
    if (!queueTypes.some((q) => q.queueType === queueType)) add(hardFails, 'required_queue_type_missing', { queueType });
  }

  for (const queue of queueTypes) {
    if (queue.autoResolveAllowed !== false) add(hardFails, 'queue_auto_resolve_must_be_false', { queueType: queue.queueType });
    if (queue.writesAllowedNow !== false) add(hardFails, 'queue_writes_must_be_disabled_now', { queueType: queue.queueType });
    if (!Array.isArray(queue.requiredStableKeys) || !queue.requiredStableKeys.includes('tenantId') || !queue.requiredStableKeys.includes('projectId')) {
      add(hardFails, 'queue_must_require_tenant_project_stable_keys', { queueType: queue.queueType });
    }
    if (!Array.isArray(queue.resolutionActions) || queue.resolutionActions.length === 0) {
      add(hardFails, 'queue_resolution_actions_missing', { queueType: queue.queueType });
    }
    if (!Array.isArray(queue.allowedStatuses) || !queue.allowedStatuses.includes('blocked')) {
      add(warnings, 'queue_should_include_blocked_status', { queueType: queue.queueType });
    }
  }

  const syncQueue = queueTypes.find((q) => q.queueType === 'sync_conflicts');
  if (syncQueue && syncQueue.autoResolveAllowed !== false) add(hardFails, 'sync_conflicts_must_not_autoresolve');

  const certQueue = queueTypes.find((q) => q.queueType === 'certification_preservation_review');
  if (certQueue && !certQueue.resolutionActions?.includes('preserve_certification')) add(hardFails, 'cert_queue_must_include_preserve_certification_action');

  const paymentQueue = queueTypes.find((q) => q.queueType === 'june_liquidation_payment_control');
  if (paymentQueue && !paymentQueue.resolutionActions?.includes('confirm_external_payment')) add(hardFails, 'payment_queue_must_use_external_confirmation_only');

  const priorityRules = new Set((contract.prioritizationRules || []).map((r) => r.rule));
  for (const rule of ['blocker_first', 'assignment_conflicts_before_payments', 'certification_preservation_before_re_request', 'june_payment_control_after_submitted', 'no_queue_item_without_stable_keys']) {
    if (!priorityRules.has(rule)) add(hardFails, 'priority_rule_missing', { rule });
  }

  const safe = contract.safeStateExpected || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-admin-actions-audit-contract-v1.json',
  'backend/contracts/phase-a-operational-state-machine-v1.json',
  'backend/contracts/phase-a-operational-continuity-gate-v1.json',
  'app/docs/PHASE-A-ADMIN-ACTIONS-AUDIT-TYA-20260709.md',
  'app/docs/PHASE-A-OPERATIONAL-STATE-MACHINE-TYA-20260709.md'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-operational-queues-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_PHASE_A_QUEUES_BLOCKED' : 'GO_PHASE_A_QUEUES_CONTRACTED_NO_WRITES',
  productionDecision: 'BLOCK_WRITES_RUNTIME_IMPORTS_DEPLOY_UNTIL_FINAL_GATES_AND_PAULA_GO',
  counts: {
    queueTypes: contract?.queueTypes?.length || 0,
    requiredFields: contract?.queueItemRequiredFields?.length || 0,
    forbiddenFields: contract?.forbiddenQueueFields?.length || 0,
    priorityRules: contract?.prioritizationRules?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in queue contract. Do not activate writes, runtime, imports or deploy.'
    : 'Use queue contract to guide future admin dashboards/actions. Continue Phase A without writes.',
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    oldDatabaseConnected: false,
    deploy: false,
    production: false,
    rawPii: false,
    makeGeminiLive: false,
    realPayments: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const target = abs(outDir);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'phase-a-operational-queues-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A operational queues validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Queue types: ${report.counts.queueTypes}`,
    `- Required fields: ${report.counts.requiredFields}`,
    `- Forbidden fields: ${report.counts.forbiddenFields}`,
    `- Priority rules: ${report.counts.priorityRules}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.queueType ? ` · ${x.queueType}` : ''}${x.field ? ` · ${x.field}` : ''}${x.rule ? ` · ${x.rule}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.queueType ? ` · ${x.queueType}` : ''}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Runtime not connected',
    '- Frontend not modified',
    '- Modules not modified',
    '- No Firestore writes',
    '- No imports',
    '- No HR writes',
    '- No old database connected',
    '- No deploy',
    '- No production',
    '- No raw PII',
    '- No Make/Gemini live',
    '- No real payments',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(target, 'phase-a-operational-queues-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
