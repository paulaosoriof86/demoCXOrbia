#!/usr/bin/env node
/* CXOrbia TyA - Phase A admin actions audit validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate that every future Phase A admin action is auditable, scoped,
   gated, source-safe and write-disabled until explicit gates and Paula GO.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-admin-actions-audit-contract-v1.json';

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
  if (contract.mode !== 'source_safe_contract_only_no_writes') {
    add(hardFails, 'contract_mode_must_be_no_writes', { mode: contract.mode });
  }

  const principles = contract.principles || {};
  const requiredTruePrinciples = [
    'adminOperableFromPlatform',
    'previewOnlyUntilGate',
    'auditRequiredForEveryAction',
    'noHardDelete',
    'logicalAnnulmentOnly',
    'tenantProjectScoped',
    'multiProjectSafe',
    'humanReviewForConflicts',
    'noVisualDeduplication',
    'noRuntimeSwitchWithoutPaulaGo'
  ];
  for (const p of requiredTruePrinciples) {
    if (principles[p] !== true) add(hardFails, 'required_principle_missing_or_false', { principle: p });
  }
  if (principles.writesAllowedNow !== false) add(hardFails, 'writes_allowed_now_must_be_false');

  const requiredAuditFields = new Set(contract.auditEventRequiredFields || []);
  for (const field of ['auditId', 'tenantId', 'projectId', 'actorUid', 'actorRole', 'action', 'entityType', 'entityId', 'beforeState', 'afterState', 'reasonCode', 'source', 'sourceRef', 'idempotencyKey', 'correlationId', 'createdAt', 'gateStatus']) {
    if (!requiredAuditFields.has(field)) add(hardFails, 'required_audit_field_missing', { field });
  }

  const forbidden = new Set(contract.forbiddenAuditFields || []);
  for (const field of ['rawDpi', 'dpi', 'rawBankAccount', 'bankAccount', 'rawPhone', 'phone', 'rawEmail', 'email', 'rawShopperName', 'serviceAccountJson', 'makeWebhookUrl', 'geminiApiKey', 'paymentProviderToken']) {
    if (!forbidden.has(field)) add(hardFails, 'forbidden_audit_field_missing', { field });
  }

  const actions = contract.actions || [];
  const requiredActions = [
    'approve_application',
    'reject_application',
    'reflect_platform_assignment_to_hr',
    'reflect_hr_assignment_to_platform',
    'resolve_sync_conflict',
    'request_reschedule',
    'approve_reschedule',
    'mark_completed',
    'mark_questionnaire_completed',
    'mark_submitted_by_tya',
    'preserve_certification',
    'mark_certification_review_required',
    'create_liquidation_candidate',
    'mark_payment_review',
    'schedule_payment_control',
    'confirm_external_payment',
    'annul_or_correct_admin_state'
  ];
  for (const action of requiredActions) {
    if (!actions.some((a) => a.action === action)) add(hardFails, 'required_action_missing', { action });
  }

  for (const action of actions) {
    if (action.allowedInPhaseA !== true) add(hardFails, 'action_must_be_allowed_as_future_phase_a_contract', { action: action.action });
    if (action.writesAllowedNow !== false) add(hardFails, 'action_writes_must_be_disabled_now', { action: action.action });
    if (action.requiresAudit !== true) add(hardFails, 'action_requires_audit_missing', { action: action.action });
    if (!Array.isArray(action.requiresStableKeys) || !action.requiresStableKeys.includes('tenantId') || !action.requiresStableKeys.includes('projectId')) {
      add(hardFails, 'action_must_be_tenant_project_scoped', { action: action.action });
    }
    if (!Array.isArray(action.hardStops) || action.hardStops.length === 0) {
      add(hardFails, 'action_hard_stops_missing', { action: action.action });
    }
    if (!Array.isArray(action.sideEffectsPreview)) {
      add(hardFails, 'action_side_effects_preview_missing', { action: action.action });
    }
  }

  const conflict = actions.find((a) => a.action === 'resolve_sync_conflict');
  if (conflict && !conflict.hardStops?.includes('visualNameOnlyDeduplication')) {
    add(hardFails, 'resolve_conflict_must_block_visual_name_deduplication');
  }

  const preserve = actions.find((a) => a.action === 'preserve_certification');
  if (preserve && !preserve.sideEffectsPreview?.includes('do_not_request_again')) {
    add(hardFails, 'preserve_certification_must_prevent_request_again');
  }

  const paymentActions = actions.filter((a) => String(a.entityType || '').includes('payment'));
  for (const action of paymentActions) {
    if (!String(action.sideEffectsPreview || '').includes('no_provider_payment') && action.action !== 'mark_payment_review') {
      add(warnings, 'payment_action_should_explicitly_state_no_provider_payment', { action: action.action });
    }
    if (action.writesAllowedNow !== false) add(hardFails, 'payment_action_must_not_write_now', { action: action.action });
  }

  const safe = contract.safeStateExpected || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-operational-state-machine-v1.json',
  'backend/contracts/phase-a-operational-continuity-gate-v1.json',
  'app/docs/PHASE-A-OPERATIONAL-STATE-MACHINE-TYA-20260709.md',
  'app/docs/PHASE-A-OPERATIONAL-CONTINUITY-GATE-TYA-20260709.md'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-admin-actions-audit-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_ADMIN_ACTIONS_AUDIT_BLOCKED' : 'GO_ADMIN_ACTIONS_AUDIT_CONTRACTED_NO_WRITES',
  productionDecision: 'BLOCK_WRITES_RUNTIME_IMPORTS_DEPLOY_UNTIL_FINAL_GATES_AND_PAULA_GO',
  counts: {
    actions: contract?.actions?.length || 0,
    requiredAuditFields: contract?.auditEventRequiredFields?.length || 0,
    forbiddenAuditFields: contract?.forbiddenAuditFields?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in admin action audit contract. Do not activate writes, runtime, imports or deploy.'
    : 'Use this contract to guide future admin UI/backend actions with audit and gates. Continue Phase A without writes.',
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
  fs.writeFileSync(path.join(target, 'phase-a-admin-actions-audit-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A admin actions audit validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Actions: ${report.counts.actions}`,
    `- Required audit fields: ${report.counts.requiredAuditFields}`,
    `- Forbidden audit fields: ${report.counts.forbiddenAuditFields}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.action ? ` · ${x.action}` : ''}${x.field ? ` · ${x.field}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.action ? ` · ${x.action}` : ''}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
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
  fs.writeFileSync(path.join(target, 'phase-a-admin-actions-audit-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
