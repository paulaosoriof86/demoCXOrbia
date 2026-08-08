#!/usr/bin/env node
/* CXOrbia TyA - Phase A operational state machine validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the Phase A operational state machine contract for HR/platform sync,
   certification preservation, questionnaire routing and payment control.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-operational-state-machine-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  const requiredKeys = ['tenantId', 'projectId', 'visitId', 'hrRowId', 'shopperId', 'assignmentSource', 'assignmentSyncStatus', 'lastSyncedAt'];
  const keys = new Set(contract.stableKeysRequired || []);
  for (const key of requiredKeys) {
    if (!keys.has(key)) add(hardFails, 'required_stable_key_missing', { key });
  }

  const rules = contract.globalRules || {};
  const requiredTrueRules = [
    'multiProjectFromStart',
    'cinepolisIsProjectNotGlobalLogic',
    'hrIsOperationalSourceForPhaseA',
    'doNotDeduplicateByVisualMatch',
    'doNotOverwriteConflictsSilently',
    'certificationsAlreadyPresentedMustBePreserved',
    'juneVisitsExecutedJunePendingIsPaymentControl',
    'questionnaireRoutingConfigurableByProjectOrVisit',
    'adminActionsRequireAudit',
    'runtimeSwitchRequiresExplicitPaulaGo'
  ];
  for (const rule of requiredTrueRules) {
    if (rules[rule] !== true) add(hardFails, 'required_global_rule_missing_or_false', { rule });
  }

  const assignmentStates = contract.assignmentStates || [];
  const stateNames = new Set(assignmentStates.map((s) => s.state));
  const requiredStates = [
    'available',
    'application_pending',
    'assigned_from_platform_pending_hr_sync',
    'assigned_from_hr_pending_platform_sync',
    'assigned_synced',
    'sync_conflict_review',
    'scheduled',
    'completed',
    'questionnaire_completed',
    'submitted_by_tya',
    'liquidation_candidate',
    'payment_review',
    'payment_scheduled',
    'payment_confirmed_external'
  ];
  for (const state of requiredStates) {
    if (!stateNames.has(state)) add(hardFails, 'required_assignment_state_missing', { state });
  }

  const conflictState = assignmentStates.find((s) => s.state === 'sync_conflict_review');
  if (!conflictState) {
    add(hardFails, 'sync_conflict_review_state_missing');
  } else if (conflictState.blocksDuplicateAssignment !== true) {
    add(hardFails, 'sync_conflict_review_must_block_duplicate_assignment');
  }

  for (const state of assignmentStates) {
    if (!Array.isArray(state.allowedTransitions)) add(hardFails, 'assignment_state_transitions_missing', { state: state.state });
    if (state.state?.startsWith('assigned') && state.blocksDuplicateAssignment !== true) {
      add(hardFails, 'assigned_state_must_block_duplicate_assignment', { state: state.state });
    }
  }

  const certificationStates = new Set((contract.certificationStates || []).map((s) => s.state));
  for (const state of ['preserved_already_presented', 'required_new_or_expired', 'passed', 'review_required']) {
    if (!certificationStates.has(state)) add(hardFails, 'required_certification_state_missing', { state });
  }

  const modes = new Set(contract.questionnaireRoutingModes || []);
  for (const mode of ['cxorbia', 'tya_online', 'external_platform', 'general_link', 'hr_visit_link']) {
    if (!modes.has(mode)) add(hardFails, 'questionnaire_routing_mode_missing', { mode });
  }

  const conflictTypes = contract.conflictTypes || [];
  for (const code of ['assignment_source_conflict', 'shopper_identity_review_required', 'visit_key_collision', 'payment_status_conflict', 'certification_preservation_mismatch']) {
    if (!conflictTypes.some((x) => x.code === code)) add(hardFails, 'required_conflict_type_missing', { code });
  }
  if (!conflictTypes.some((x) => x.resolution === 'do_not_merge_by_name')) {
    add(hardFails, 'identity_conflict_must_block_visual_name_merge');
  }

  for (const action of contract.futureAdminActions || []) {
    if (action.requiresAudit !== true) add(hardFails, 'future_admin_action_requires_audit_missing', { action: action.action });
    if (action.writesAllowedNow !== false) add(hardFails, 'future_admin_action_must_not_write_now', { action: action.action });
  }

  const safe = contract.safeStateExpected || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_must_be_false', { key, expected });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of ['missingStableKey', 'duplicateAssignmentWithoutConflict', 'visualNameOnlyDeduplication', 'runtimeSwitchWithoutPaulaGo', 'firebaseWritesBeforeGate', 'hrWritesBeforeGate']) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }
}

const docsExpected = [
  'app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md',
  'app/docs/CHECKPOINT-OPERATIVO-REALDATA-PREVIEW-TYA-20260709.md',
  'app/docs/PHASE-A-OPERATIONAL-CONTINUITY-GATE-TYA-20260709.md'
];
for (const doc of docsExpected) {
  if (!exists(doc)) add(warnings, 'supporting_doc_missing', { file: doc });
}

const report = {
  gate: 'cxorbia-tya-phase-a-operational-state-machine-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_PHASE_A_STATE_MACHINE_BLOCKED' : 'GO_PHASE_A_STATE_MACHINE_CONTRACTED_NO_RUNTIME',
  productionDecision: 'BLOCK_PRODUCTION_RUNTIME_IMPORTS_WRITES_UNTIL_FINAL_GATES_AND_PAULA_GO',
  counts: {
    assignmentStates: contract?.assignmentStates?.length || 0,
    certificationStates: contract?.certificationStates?.length || 0,
    questionnaireRoutingModes: contract?.questionnaireRoutingModes?.length || 0,
    conflictTypes: contract?.conflictTypes?.length || 0,
    futureAdminActions: contract?.futureAdminActions?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in the contract. Do not repeat Level 0/1, do not deploy, do not import, do not switch runtime.'
    : 'Use this state machine as the Phase A backend contract for sync, certification preservation and payment control. Continue without runtime switch.',
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
  fs.writeFileSync(path.join(target, 'phase-a-operational-state-machine-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A operational state machine validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Assignment states: ${report.counts.assignmentStates}`,
    `- Certification states: ${report.counts.certificationStates}`,
    `- Questionnaire routing modes: ${report.counts.questionnaireRoutingModes}`,
    `- Conflict types: ${report.counts.conflictTypes}`,
    `- Future admin actions: ${report.counts.futureAdminActions}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.state ? ` · ${x.state}` : ''}${x.key ? ` · ${x.key}` : ''}${x.code ? ` · ${x.code}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
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
  fs.writeFileSync(path.join(target, 'phase-a-operational-state-machine-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
