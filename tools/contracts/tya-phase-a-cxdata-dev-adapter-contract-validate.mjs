#!/usr/bin/env node
/* CXOrbia TyA - Phase A CX.data DEV adapter contract validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the future disabled-by-default CX.data DEV adapter contract for
   Phase A real/sanitized TyA data without touching app/modules or app/core.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json';

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
  if (contract.mode !== 'dev_adapter_contract_only_disabled_by_default') {
    add(hardFails, 'contract_mode_must_be_disabled_dev_adapter_contract_only', { mode: contract.mode });
  }

  const focus = contract.phaseAFocus || {};
  for (const key of [
    'realDataPriority',
    'doNotUseDemoAsFinalSource',
    'doNotUseSyntheticFixturesAsRealEvidence',
    'doNotUseDerivedTmpOutputsAsOriginalEvidence',
    'doNotRepeatLevel0Level1',
    'juneVisitsExecutedPaymentsOnlyPending',
    'preserveHistoricalShoppers',
    'preserveAlreadyPresentedCertifications',
    'cinepolisProjectConfigurableNotHardcoded'
  ]) {
    if (focus[key] !== true) add(hardFails, 'phase_a_focus_required_true_missing', { key });
  }
  if (!String(focus.sourceOfTruth || '').includes('HR')) add(hardFails, 'source_of_truth_must_reference_hr_source_safe');

  const iface = contract.interfaceRules || {};
  for (const key of [
    'cxDataInterfaceMustRemainExact',
    'singleFutureSwitchPointOnly',
    'localStorageFallbackRequired',
    'adapterDisabledByDefault',
    'noAppModulesRewrite',
    'noUiLogicPatchesFromBackend',
    'readShapeCompatibleWithPrototype',
    'writeMethodsReturnBlockedUntilGate'
  ]) {
    if (iface[key] !== true) add(hardFails, 'interface_rule_required_true_missing', { key });
  }

  const domains = contract.domainsRequiredForPhaseA || [];
  const requiredDomains = [
    'tenant_project_config',
    'hr_source_status',
    'visits',
    'shoppers',
    'applications_assignments',
    'certifications',
    'liquidations_payments_june',
    'questionnaire_routes',
    'operational_queues',
    'audit_preview'
  ];
  for (const domain of requiredDomains) {
    if (!domains.some((d) => d.domain === domain)) add(hardFails, 'required_phase_a_domain_missing', { domain });
  }
  for (const domain of domains) {
    if (domain.writeEnabledNow !== false) add(hardFails, 'domain_writes_must_be_disabled_now', { domain: domain.domain });
    if (!Array.isArray(domain.mustSupport) || domain.mustSupport.length === 0) add(hardFails, 'domain_must_support_fields_missing', { domain: domain.domain });
  }

  const blocked = contract.blockedWriteResponseShape || {};
  if (blocked.ok !== false) add(hardFails, 'blocked_write_response_ok_must_be_false');
  if (blocked.runtimeConnected !== false) add(hardFails, 'blocked_write_response_runtime_must_be_false');
  if (blocked.writeExecuted !== false) add(hardFails, 'blocked_write_response_write_executed_must_be_false');
  if (blocked.auditPreviewRequired !== true) add(hardFails, 'blocked_write_response_audit_preview_required_missing');

  const gates = new Set(contract.realDataGateRequirementsBeforeAdapterCanRead || []);
  for (const gate of [
    'originalHrSourceSafeOutputOrDryRunPresent',
    'notSyntheticFixture',
    'notDerivedTmpOutput',
    'noRawSensitiveFields',
    'tenantProjectConfigPresent',
    'cinepolisConfiguredAsProject',
    'periodsCountriesCurrenciesPresent',
    'visitsStableKeysPresent',
    'historicalShoppersMappedSourceSafe',
    'certificationsPreservedSourceSafe',
    'juneLiquidationPaymentControlMapped',
    'questionnaireRoutesConfiguredOrBlockedHonestly'
  ]) {
    if (!gates.has(gate)) add(hardFails, 'real_data_gate_requirement_missing', { gate });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of [
    'cxDataInterfaceChanged',
    'multipleSwitchPoints',
    'adapterEnabledByDefault',
    'appModulesModifiedByAdapter',
    'demoDataUsedAsProductionSource',
    'syntheticFixtureUsedAsRealData',
    'derivedTmpUsedAsOriginalSource',
    'rawSensitiveDataExposed',
    'firestoreWritesEnabled',
    'hrWritesEnabled',
    'realPaymentAttempt',
    'oldDatabaseConnectionAttempt',
    'certificationReRequestedWithoutReview',
    'juneVisitsTreatedAsPendingVisits'
  ]) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-runtime-dev-switch-plan-v1.json',
  'backend/contracts/phase-a-accumulated-readiness-gate-v1.json',
  'app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md',
  'app/docs/PHASE-A-ACCUMULATED-READINESS-GATE-TYA-20260709.md'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-cxdata-dev-adapter-contract-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_CXDATA_DEV_ADAPTER_CONTRACT_BLOCKED' : 'GO_CXDATA_DEV_ADAPTER_CONTRACT_READY_DISABLED',
  productionDecision: 'BLOCK_RUNTIME_SWITCH_WRITES_IMPORTS_DEPLOY_UNTIL_REALDATA_GATE_AND_PAULA_GO',
  counts: {
    domains: contract?.domainsRequiredForPhaseA?.length || 0,
    realDataGates: contract?.realDataGateRequirementsBeforeAdapterCanRead?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in CX.data DEV adapter contract. Do not enable adapter, runtime, writes, imports or deploy.'
    : 'Use this disabled contract as the future adapter specification. Continue Phase A real-data readiness without enabling runtime.',
  safeState: {
    adapterEnabled: false,
    runtimeConnected: false,
    switchExecuted: false,
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
  const target = abs(outDir);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'phase-a-cxdata-dev-adapter-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A CX.data DEV adapter contract validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Domains: ${report.counts.domains}`,
    `- Real-data gates: ${report.counts.realDataGates}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.domain ? ` · ${x.domain}` : ''}${x.key ? ` · ${x.key}` : ''}${x.gate ? ` · ${x.gate}` : ''}${x.stop ? ` · ${x.stop}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Adapter disabled',
    '- Runtime not connected',
    '- Switch not executed',
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
  fs.writeFileSync(path.join(target, 'phase-a-cxdata-dev-adapter-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
