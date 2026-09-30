#!/usr/bin/env node
/* CXOrbia TyA - Phase A runtime DEV switch plan validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the separated future runtime DEV switch plan. This tool never
   performs the switch and does not modify frontend modules/core.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-runtime-dev-switch-plan-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(rel) { return path.join(root, rel); }
function exists(rel) { return rel ? fs.existsSync(abs(rel)) : true; }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.mode !== 'runtime_switch_plan_only_no_execution') add(hardFails, 'contract_mode_must_be_plan_only', { mode: contract.mode });

  const principles = contract.separationPrinciples || {};
  for (const principle of [
    'goRequestGateIsSeparate',
    'runtimeSwitchPlanDoesNotExecute',
    'runtimeSwitchRequiresExactPaulaGoAlreadyRecorded',
    'devOnlyNotProduction',
    'productionRemainsBlocked',
    'rollbackPlanRequiredBeforeSwitch',
    'smokeRequiredAfterSwitch',
    'protectedUiModulesCannotBePatchedHere',
    'cxDataInterfaceMustRemainStable',
    'switchPointMustBeSingleAndExplicit',
    'noOldDatabaseConnection',
    'newCleanDatabaseOnly'
  ]) {
    if (principles[principle] !== true) add(hardFails, 'required_switch_plan_principle_missing_or_false', { principle });
  }

  for (const input of contract.requiredInputsBeforeSwitchPlanCanProceed || []) {
    if (input.required !== true) add(warnings, 'input_not_marked_required', { inputId: input.inputId });
    if (!input.source) add(hardFails, 'input_source_missing', { inputId: input.inputId });
    if (!input.expected) add(hardFails, 'input_expected_missing', { inputId: input.inputId });
  }

  const allowed = contract.allowedDevSwitchScope || {};
  for (const [key, expected] of Object.entries(allowed)) {
    if (key === 'environment') continue;
    if (expected !== false) add(hardFails, 'allowed_dev_switch_scope_must_stay_false_now', { key, expected });
  }
  if (allowed.environment !== 'DEV preview only') add(hardFails, 'environment_must_be_dev_preview_only', { environment: allowed.environment });

  for (const step of contract.futureSwitchStepsPreparedOnly || []) {
    if (step.executesNow !== false) add(hardFails, 'future_switch_step_must_not_execute_now', { step: step.step });
  }

  const smoke = new Set(contract.manualSmokeChecklistFuture || []);
  for (const item of ['login_roles_visible_no_auth_production_switch', 'navigation_modules_load_no_regression', 'cxdata_interface_unchanged', 'assignments_do_not_duplicate', 'certifications_preserved_not_requested_again', 'june_liquidations_show_control_not_real_payment', 'rollback_toggle_available']) {
    if (!smoke.has(item)) add(hardFails, 'manual_smoke_item_missing', { item });
  }

  const rollback = new Set(contract.rollbackRequirements || []);
  for (const item of ['single_switch_point_can_be_disabled', 'no_data_loss_on_disable', 'localStorage_interface_fallback_available_until_final_cutover', 'no_firestore_or_hr_write_happened_before_rollback', 'rollback_documented_in_cambios_backend']) {
    if (!rollback.has(item)) add(hardFails, 'rollback_requirement_missing', { item });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of ['paulaGoMissing', 'runtimeGoNoGoMissingOrDirty', 'adapterTouchesAppModulesDirectly', 'cxDataInterfaceChanged', 'multipleRuntimeSwitchPoints', 'fixtureUsedAsRealDevInput', 'firestoreWritesEnabled', 'productionDeployAttempt', 'oldDatabaseConnectionAttempt', 'rollbackMissing']) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-runtime-dev-go-request-gate-v1.json',
  'tools/contracts/tya-phase-a-runtime-dev-go-request-gate.mjs',
  'backend/contracts/phase-a-accumulated-readiness-gate-v1.json',
  'tools/contracts/tya-phase-a-accumulated-readiness-gate.mjs'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-runtime-dev-switch-plan-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_RUNTIME_DEV_SWITCH_PLAN_BLOCKED' : 'GO_RUNTIME_DEV_SWITCH_PLAN_READY_NO_EXECUTION',
  productionDecision: 'BLOCK_PRODUCTION_AND_BLOCK_RUNTIME_SWITCH_EXECUTION_IN_THIS_PLAN',
  counts: {
    futureSwitchSteps: contract?.futureSwitchStepsPreparedOnly?.length || 0,
    manualSmokeItems: contract?.manualSmokeChecklistFuture?.length || 0,
    rollbackRequirements: contract?.rollbackRequirements?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in switch plan. Do not execute runtime switch, writes, imports, deploy or payments.'
    : 'Use this as plan for a separate future runtime DEV switch PR/gate only after exact Paula GO and clean reports. No execution happened.',
  safeState: {
    runtimeConnected: false,
    switchExecuted: false,
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
  fs.writeFileSync(path.join(target, 'phase-a-runtime-dev-switch-plan-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A runtime DEV switch plan validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Future switch steps: ${report.counts.futureSwitchSteps}`,
    `- Manual smoke items: ${report.counts.manualSmokeItems}`,
    `- Rollback requirements: ${report.counts.rollbackRequirements}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.step ? ` · ${x.step}` : ''}${x.item ? ` · ${x.item}` : ''}${x.key ? ` · ${x.key}` : ''}${x.stop ? ` · ${x.stop}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Runtime not connected',
    '- Switch not executed',
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
  fs.writeFileSync(path.join(target, 'phase-a-runtime-dev-switch-plan-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
