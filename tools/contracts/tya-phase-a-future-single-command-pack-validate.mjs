#!/usr/bin/env node
/* CXOrbia TyA - Phase A future single-command pack validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate a future PowerShell single-command pack contract. This script does
   not send a command to Paula and does not execute the builder.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-future-single-command-pack-v1.json';

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
  if (contract.mode !== 'future_command_pack_documentation_only_do_not_execute') {
    add(hardFails, 'contract_mode_must_be_do_not_execute', { mode: contract.mode });
  }

  const status = contract.status || {};
  if (status.executeNow !== false) add(hardFails, 'execute_now_must_be_false');
  for (const key of ['readyForFutureUse', 'requiresPaulaComputer', 'requiresLocalSourceSafeInputs', 'requiresExplicitAssistantInstructionAtThatMoment', 'privateDataMustNotBePastedInChat']) {
    if (status[key] !== true) add(hardFails, 'status_required_true_missing', { key });
  }

  for (const item of ['conversation_not_lost_or_continuity_prompt_available', 'repo_path_confirmed_or_detectable', 'branch_docs_tya_v6_v71_audit_confirmed', 'source_safe_input_builder_contract_present', 'local_builder_execution_control_contract_present', 'realdata_domain_readiness_pack_present', 'local_source_safe_report_exists_or_need_is_explicit', 'no_private_data_requested_in_chat']) {
    if (!contract.preconditionsBeforeGivingCommandToPaula?.includes(item)) add(hardFails, 'precondition_missing', { item });
  }

  for (const item of ['git_branch', 'required_contract_files', 'source_safe_input_builder_contract', 'local_builder_execution_control_contract', 'realdata_domain_readiness_pack_contract', 'source_safe_domain_mapping_contract', 'cxdata_dev_adapter_contract', 'accumulated_readiness_contract']) {
    if (!contract.commandMustValidate?.includes(item)) add(hardFails, 'command_validation_missing', { item });
  }

  const rules = contract.futurePowerShellTemplateRules || {};
  for (const key of ['singleBlockOnly', 'noAlternativeRoutes', 'noManualEditing', 'noRawDataEcho', 'noClipboardPrivateData', 'writesReportsOnlyToTmp', 'doesNotGitAddTmp', 'doesNotCommitTmp', 'doesNotDeploy', 'doesNotEnableRuntime', 'doesNotImport', 'doesNotWriteFirestore', 'doesNotWriteHr', 'doesNotCallMakeGemini', 'doesNotExecutePayments']) {
    if (rules[key] !== true) add(hardFails, 'future_powershell_rule_required_true_missing', { key });
  }

  for (const step of ['set strict error handling', 'resolve repo path', 'cd repo path', 'confirm git branch docs-tya-v6-v71-audit', 'create .tmp output dirs', 'run node --check for validators', 'run source-safe input builder contract validator', 'run local builder execution control validator', 'run realdata domain readiness pack validator contract-only', 'print clear verdict summary', 'print what remains blocked', 'never git add .tmp']) {
    if (!contract.futureCommandOutline?.includes(step)) add(hardFails, 'future_command_outline_step_missing', { step });
  }

  const inputNames = new Set((contract.futureCommandInputs || []).map((x) => x.name));
  for (const name of ['RepoPath', 'SourceSafeInputPath']) {
    if (!inputNames.has(name)) add(hardFails, 'future_command_input_missing', { name });
  }

  for (const output of contract.futureCommandExpectedOutputs || []) {
    if (!String(output).includes('.tmp')) add(hardFails, 'future_command_output_must_be_tmp', { output });
  }

  for (const blocked of ['do_not_send_command_now', 'do_not_ask_paula_to_run_now', 'do_not_request_private_data', 'do_not_execute_builder_without_source_safe_inputs', 'do_not_use_this_as_runtime_go', 'do_not_use_this_as_import_go']) {
    if (!contract.blockedUntilExplicitNeed?.includes(blocked)) add(hardFails, 'blocked_until_explicit_need_missing', { blocked });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of ['commandSentBeforeNeeded', 'privateDataRequestedInChat', 'rawHrRequested', 'branchMismatch', 'repoMismatch', 'nodeValidatorsMissing', 'tmpOutputCommitted', 'runtimeEnabled', 'adapterEnabled', 'importAttempt', 'firestoreWriteAttempt', 'hrWriteAttempt', 'deployAttempt', 'makeGeminiAttempt', 'paymentAttempt']) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-local-builder-execution-control-v1.json',
  'tools/contracts/tya-phase-a-local-builder-execution-control-validate.mjs',
  'backend/contracts/phase-a-source-safe-input-builder-contract-v1.json',
  'backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-future-single-command-pack-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_FUTURE_SINGLE_COMMAND_PACK_BLOCKED' : 'GO_FUTURE_SINGLE_COMMAND_PACK_READY_DO_NOT_EXECUTE',
  productionDecision: 'BLOCK_COMMAND_EXECUTION_BUILDER_RUNTIME_WRITES_IMPORTS_DEPLOY_UNTIL_EXPLICIT_NEED',
  counts: {
    preconditions: contract?.preconditionsBeforeGivingCommandToPaula?.length || 0,
    commandValidations: contract?.commandMustValidate?.length || 0,
    commandOutlineSteps: contract?.futureCommandOutline?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in future command pack. Do not send command, run builder, import, enable adapter, switch runtime, write, or deploy.'
    : 'Keep this as a future no-execution command pack. Send an actual PowerShell block only when Paula has computer and local source-safe inputs are needed.',
  safeState: {
    commandSentToPaula: false,
    commandExecuted: false,
    builderExecuted: false,
    localOutputCommitted: false,
    adapterEnabled: false,
    runtimeConnected: false,
    domainImportExecuted: false,
    frontendModified: false,
    modulesModified: false,
    appCoreModified: false,
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
  const target = path.isAbsolute(outDir) ? outDir : path.join(root, outDir);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'phase-a-future-single-command-pack-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A future single-command pack validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Preconditions: ${report.counts.preconditions}`,
    `- Command validations: ${report.counts.commandValidations}`,
    `- Command outline steps: ${report.counts.commandOutlineSteps}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.item ? ` · ${x.item}` : ''}${x.key ? ` · ${x.key}` : ''}${x.step ? ` · ${x.step}` : ''}${x.stop ? ` · ${x.stop}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Command not sent to Paula',
    '- Command not executed',
    '- Builder not executed',
    '- Local output not committed',
    '- Adapter disabled',
    '- Runtime not connected',
    '- Domain import not executed',
    '- Frontend not modified',
    '- Modules not modified',
    '- App core not modified',
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
  fs.writeFileSync(path.join(target, 'phase-a-future-single-command-pack-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
