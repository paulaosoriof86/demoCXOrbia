#!/usr/bin/env node
/* CXOrbia TyA - Phase A source-safe input builder contract validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the contract that will guide a future local-only builder for
   source-safe TyA domain readiness input. This validator does not build data.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-source-safe-input-builder-contract-v1.json';

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
  if (contract.mode !== 'builder_contract_only_local_source_safe_no_output_in_repo') {
    add(hardFails, 'contract_mode_must_be_builder_contract_only', { mode: contract.mode });
  }

  const principles = contract.builderPrinciples || {};
  for (const key of [
    'localOnly',
    'outputNotCommitted',
    'sourceSafeOnly',
    'noRawSensitiveData',
    'noRawHrRows',
    'noOldDatabaseConnection',
    'noSyntheticFixtureAsReal',
    'noDerivedTmpAsOriginal',
    'noRuntime',
    'noWrites',
    'noImports',
    'doNotAskAgainForDocumentedInputs',
    'phaseARealTyAOnly'
  ]) {
    if (principles[key] !== true) add(hardFails, 'builder_principle_required_true_missing', { key });
  }

  const inputTypes = new Set((contract.allowedInputs || []).map((x) => x.inputType));
  for (const inputType of ['hr_source_safe_full_flow_report', 'original_sanitized_tya_export', 'project_config_source_safe']) {
    if (!inputTypes.has(inputType)) add(hardFails, 'allowed_input_type_missing', { inputType });
  }
  for (const input of contract.allowedInputs || []) {
    if (!Array.isArray(input.mustNotContain)) add(hardFails, 'allowed_input_must_not_contain_missing', { inputType: input.inputType });
    if (!input.allowedLocation) add(hardFails, 'allowed_input_location_missing', { inputType: input.inputType });
  }

  const output = contract.outputShape || {};
  if (output.mustStayLocal !== true) add(hardFails, 'output_must_stay_local_true_missing');
  for (const field of ['tenantId', 'projectId', 'sourceType', 'sourceRef', 'sourceSafety', 'domains', 'generatedAt']) {
    if (!output.topLevelFields?.includes(field)) add(hardFails, 'output_top_level_field_missing', { field });
  }
  const safety = output.sourceSafety || {};
  for (const [key, expected] of Object.entries(safety)) {
    if (expected !== false) add(hardFails, 'output_source_safety_flag_must_be_false', { key, expected });
  }
  for (const domain of ['tenant_project_config', 'hr_source_status', 'visits', 'shoppers', 'applications_assignments', 'certifications', 'liquidations_payments_june', 'questionnaire_routes', 'operational_queues', 'audit_preview']) {
    if (!output.domainsRequired?.includes(domain)) add(hardFails, 'output_required_domain_missing', { domain });
  }

  for (const step of contract.buildStepsPreparedOnly || []) {
    if (step.executesNow !== false) add(hardFails, 'build_step_must_not_execute_now', { step: step.step });
  }
  const stepNames = new Set((contract.buildStepsPreparedOnly || []).map((x) => x.step));
  for (const step of ['load_source_safe_hr_status', 'map_project_config', 'map_visits_from_hr_rows_sanitized', 'map_historical_shoppers_source_safe', 'map_certifications_preserved', 'map_june_liquidations_payment_control', 'map_questionnaire_routes', 'derive_operational_queues_preview', 'validate_with_realdata_domain_readiness_pack']) {
    if (!stepNames.has(step)) add(hardFails, 'required_build_step_missing', { step });
  }

  const fieldRules = new Set((contract.fieldDerivationRules || []).map((x) => x.field));
  for (const field of ['visitId', 'shopperId', 'assignmentSource', 'paymentControlOnly', 'preservedAlreadyPresented', 'routeStatus']) {
    if (!fieldRules.has(field)) add(hardFails, 'field_derivation_rule_missing', { field });
  }

  const forbidden = new Set(contract.forbiddenTransformations || []);
  for (const item of ['copyRawHrRowsToOutput', 'copyRawSensitiveFieldsToOutput', 'useSyntheticFixtureAsRealInput', 'useDerivedTmpOutputAsOriginalInput', 'connectOldDatabase', 'deduplicateByVisualNameOnly', 'markJuneVisitsPendingExecutionWhenPaymentOnly', 'requestCertificationAgainWithoutReview', 'markPaymentAsExecutedByCXOrbia', 'inventQuestionnaireLink', 'commitLocalOutputToRepo']) {
    if (!forbidden.has(item)) add(hardFails, 'forbidden_transformation_missing', { item });
  }

  const post = contract.expectedPostBuildValidation || {};
  if (post.validator !== 'tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs') add(hardFails, 'post_build_validator_unexpected', { validator: post.validator });
  if (post.requiredVerdictBeforeAdapterReadRequest !== 'GO_REALDATA_DOMAIN_READINESS_DRY_RUN_ONLY') add(hardFails, 'post_build_required_verdict_unexpected', { verdict: post.requiredVerdictBeforeAdapterReadRequest });
  for (const key of ['doesNotEnableRuntime', 'doesNotImport', 'doesNotWrite']) {
    if (post[key] !== true) add(hardFails, 'post_build_safety_flag_missing', { key });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of ['builderOutputCommittedToRepo', 'rawSensitiveMarkerFound', 'rawHrRowsFound', 'sourceIsSyntheticFixture', 'sourceIsDerivedTmpOutput', 'sourceIsOldDatabase', 'missingProjectConfig', 'missingHrSourceStatus', 'missingVisits', 'missingShoppers', 'missingCertificationPreservation', 'missingJunePaymentControl', 'missingQuestionnaireRouteStatus', 'invalidCanImportTrue', 'invalidCanWriteTrue']) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json',
  'tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs',
  'backend/contracts/phase-a-source-safe-domain-mapping-v1.json',
  'backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-source-safe-input-builder-contract-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_SOURCE_SAFE_INPUT_BUILDER_CONTRACT_BLOCKED' : 'GO_SOURCE_SAFE_INPUT_BUILDER_CONTRACT_READY_NO_EXECUTION',
  productionDecision: 'BLOCK_BUILDER_EXECUTION_ADAPTER_RUNTIME_WRITES_IMPORTS_DEPLOY_UNTIL_LOCAL_SOURCE_SAFE_INPUT_AND_PAULA_GO',
  counts: {
    allowedInputs: contract?.allowedInputs?.length || 0,
    buildSteps: contract?.buildStepsPreparedOnly?.length || 0,
    fieldRules: contract?.fieldDerivationRules?.length || 0,
    forbiddenTransformations: contract?.forbiddenTransformations?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in builder contract. Do not execute builder, import, enable adapter, switch runtime, write, or deploy.'
    : 'Use this contract to implement or run a future local-only source-safe builder when needed. No builder execution happened.',
  safeState: {
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
  fs.writeFileSync(path.join(target, 'phase-a-source-safe-input-builder-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A source-safe input builder contract validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Allowed inputs: ${report.counts.allowedInputs}`,
    `- Build steps: ${report.counts.buildSteps}`,
    `- Field rules: ${report.counts.fieldRules}`,
    `- Forbidden transformations: ${report.counts.forbiddenTransformations}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.step ? ` · ${x.step}` : ''}${x.field ? ` · ${x.field}` : ''}${x.key ? ` · ${x.key}` : ''}${x.stop ? ` · ${x.stop}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
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
  fs.writeFileSync(path.join(target, 'phase-a-source-safe-input-builder-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
