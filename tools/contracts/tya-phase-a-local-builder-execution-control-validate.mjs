#!/usr/bin/env node
/* CXOrbia TyA - Phase A local builder execution control validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the control contract for a future single-command local builder
   workflow. This validator does not run the builder and does not request private data.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-local-builder-execution-control-v1.json';

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
  if (contract.mode !== 'local_execution_control_contract_only_no_builder_run') {
    add(hardFails, 'contract_mode_must_be_control_only_no_run', { mode: contract.mode });
  }

  const principles = contract.executionPrinciples || {};
  for (const key of [
    'singleCommandWorkflow',
    'localOnly',
    'noChatPrivateData',
    'noRepoOutputCommit',
    'noRuntime',
    'noWrites',
    'noImports',
    'noDeploy',
    'noProduction',
    'phaseARealTyAOnly',
    'doNotRepeatLevel0Level1',
    'doNotAskAgainForDocumentedInputs',
    'sourceSafeInputOnly',
    'requiresExplicitLocalPathsOnlyWhenNeeded'
  ]) {
    if (principles[key] !== true) add(hardFails, 'execution_principle_required_true_missing', { key });
  }

  for (const file of contract.requiredRepoContractsBeforeLocalRun || []) {
    if (!exists(file)) add(hardFails, 'required_repo_contract_missing', { file });
    else add(info, 'required_repo_contract_present', { file });
  }

  const inputNames = new Set((contract.localInputsWhenNeeded || []).map((x) => x.name));
  for (const name of ['hrSourceSafeReportPath', 'sanitizedTyaExportPath', 'projectConfigPath']) {
    if (!inputNames.has(name)) add(hardFails, 'local_input_definition_missing', { name });
  }
  for (const input of contract.localInputsWhenNeeded || []) {
    if (!Array.isArray(input.mustNotBe) || input.mustNotBe.length === 0) add(hardFails, 'local_input_must_not_be_missing', { name: input.name });
    if (!Array.isArray(input.allowedExamples) || input.allowedExamples.length === 0) add(warnings, 'local_input_allowed_examples_missing', { name: input.name });
  }

  for (const output of contract.localOutputs || []) {
    if (output.mustStayLocal !== true) add(hardFails, 'local_output_must_stay_local', { name: output.name });
    if (output.commitAllowed !== false) add(hardFails, 'local_output_commit_must_be_false', { name: output.name });
    if (!String(output.pathRecommended || '').includes('.tmp')) add(hardFails, 'local_output_path_must_be_tmp', { name: output.name, path: output.pathRecommended });
  }

  const plan = contract.singleCommandPlan || {};
  if (plan.commandType !== 'PowerShell one block when Paula has computer') add(hardFails, 'single_command_plan_type_unexpected', { commandType: plan.commandType });
  if (plan.currentStatus !== 'not_requested_now') add(hardFails, 'single_command_must_not_be_requested_now', { currentStatus: plan.currentStatus });
  const mustDo = new Set(plan.mustDo || []);
  for (const item of ['confirm repo path', 'confirm branch docs-tya-v6-v71-audit', 'validate source-safe input builder contract', 'validate realdata readiness pack contract', 'write reports only under .tmp', 'print verdict and next action']) {
    if (!mustDo.has(item)) add(hardFails, 'single_command_must_do_missing', { item });
  }
  const mustNotDo = new Set(plan.mustNotDo || []);
  for (const item of ['git add .tmp', 'commit local output', 'upload private data', 'enable adapter', 'switch runtime', 'write Firestore', 'write HR', 'deploy', 'run Make/Gemini', 'execute payments']) {
    if (!mustNotDo.has(item)) add(hardFails, 'single_command_must_not_do_missing', { item });
  }

  const assertions = new Set((contract.localBuilderSafetyAssertions || []).map((x) => x.assertionId));
  for (const assertion of ['output_not_committed', 'input_is_source_safe', 'no_sensitive_markers', 'phase_a_business_rules', 'no_runtime_side_effects']) {
    if (!assertions.has(assertion)) add(hardFails, 'local_builder_safety_assertion_missing', { assertion });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of ['repoBranchMismatch', 'requiredContractMissing', 'privateDataRequestedInChat', 'rawHrInputDetected', 'rawSensitiveMarkerDetected', 'oldDatabaseInputDetected', 'syntheticFixtureMarkedReal', 'derivedTmpMarkedOriginal', 'localOutputCommitted', 'adapterEnabled', 'runtimeConnected', 'firestoreWriteAttempt', 'hrWriteAttempt', 'importAttempt', 'deployAttempt', 'makeGeminiCallAttempt', 'paymentAttempt', 'level0Level1ReprocessAttempt']) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
  }
}

const report = {
  gate: 'cxorbia-tya-phase-a-local-builder-execution-control-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LOCAL_BUILDER_EXECUTION_CONTROL_BLOCKED' : 'GO_LOCAL_BUILDER_EXECUTION_CONTROL_READY_NO_RUN',
  productionDecision: 'BLOCK_BUILDER_RUNTIME_WRITES_IMPORTS_DEPLOY_UNTIL_LOCAL_SOURCE_SAFE_INPUT_AND_EXPLICIT_REQUEST',
  counts: {
    localInputs: contract?.localInputsWhenNeeded?.length || 0,
    localOutputs: contract?.localOutputs?.length || 0,
    requiredContracts: contract?.requiredRepoContractsBeforeLocalRun?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in local execution control contract. Do not run builder, import, enable adapter, switch runtime, write, or deploy.'
    : 'Keep this as the future one-block local execution control. Do not ask Paula to run it until local source-safe inputs are needed.',
  safeState: {
    localCommandIssuedToPaula: false,
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
  fs.writeFileSync(path.join(target, 'phase-a-local-builder-execution-control-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A local builder execution control validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Local inputs: ${report.counts.localInputs}`,
    `- Local outputs: ${report.counts.localOutputs}`,
    `- Required contracts: ${report.counts.requiredContracts}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.name ? ` · ${x.name}` : ''}${x.item ? ` · ${x.item}` : ''}${x.key ? ` · ${x.key}` : ''}${x.stop ? ` · ${x.stop}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.name ? ` · ${x.name}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Local command not issued to Paula',
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
  fs.writeFileSync(path.join(target, 'phase-a-local-builder-execution-control-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
