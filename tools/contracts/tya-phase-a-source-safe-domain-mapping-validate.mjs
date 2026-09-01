#!/usr/bin/env node
/* CXOrbia TyA - Phase A source-safe domain mapping validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the source-safe domain mapping contract required before a future
   disabled CX.data DEV adapter can read Phase A TyA real/sanitized data.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-source-safe-domain-mapping-v1.json';

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
  if (contract.mode !== 'source_safe_domain_mapping_contract_only_no_import') {
    add(hardFails, 'contract_mode_must_be_mapping_only_no_import', { mode: contract.mode });
  }

  const principles = contract.sourcePrinciples || {};
  for (const key of [
    'hrOperationalSource',
    'originalSanitizedSourceRequired',
    'sourceRefsOpaque',
    'noRawHrRowsInRepo',
    'noRawSensitiveFields',
    'noSyntheticFixtureAsReal',
    'noDerivedTmpAsOriginal',
    'noOldDatabaseConnection',
    'noLevel0Level1Reprocess',
    'projectConfigDrivesBehavior',
    'manualReviewForConflicts'
  ]) {
    if (principles[key] !== true) add(hardFails, 'source_principle_required_true_missing', { key });
  }

  const globalStable = new Set(contract.stableKeysRequiredEverywhere || []);
  for (const key of ['tenantId', 'projectId']) {
    if (!globalStable.has(key)) add(hardFails, 'global_stable_key_missing', { key });
  }

  const domains = contract.domainMappings || [];
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
    if (!domains.some((d) => d.domain === domain && d.required === true)) add(hardFails, 'required_domain_missing_or_not_required', { domain });
  }

  const forbiddenMarkers = ['rawDpi', 'dpi', 'rawBankAccount', 'bankAccount', 'rawPhone', 'phone', 'rawEmail', 'email', 'rawHrRow', 'rawWorkbook', 'rawCsv', 'serviceAccountJson', 'makeWebhookUrl', 'geminiApiKey', 'paymentProviderToken'];
  for (const domain of domains) {
    if (!Array.isArray(domain.minimumFields) || domain.minimumFields.length === 0) add(hardFails, 'domain_minimum_fields_missing', { domain: domain.domain });
    if (!Array.isArray(domain.stableKeys) || !domain.stableKeys.includes('tenantId')) add(hardFails, 'domain_tenant_stable_key_missing', { domain: domain.domain });
    if (domain.domain !== 'shoppers' && !domain.stableKeys?.includes('projectId')) add(hardFails, 'domain_project_stable_key_missing', { domain: domain.domain });
    if (!Array.isArray(domain.sourceAllowed) || domain.sourceAllowed.length === 0) add(hardFails, 'domain_source_allowed_missing', { domain: domain.domain });
    if (!domain.phaseARule) add(hardFails, 'domain_phase_a_rule_missing', { domain: domain.domain });
    const forbidden = new Set(domain.forbiddenFields || []);
    for (const marker of forbiddenMarkers) {
      if ((domain.domain === 'tenant_project_config' || domain.domain === 'hr_source_status' || domain.domain === 'audit_preview') && ['makeWebhookUrl', 'geminiApiKey', 'serviceAccountJson'].includes(marker) && !forbidden.has(marker)) {
        add(warnings, 'security_secret_marker_not_explicitly_forbidden_on_sensitive_domain', { domain: domain.domain, marker });
      }
    }
  }

  const crossRules = new Set((contract.crossDomainRules || []).map((r) => r.ruleId));
  for (const rule of [
    'visit_assignment_stable_key_consistency',
    'shopper_certification_payment_consistency',
    'june_payment_not_visit_execution',
    'certification_preservation_before_re_request',
    'questionnaire_route_required_or_blocked_honestly'
  ]) {
    if (!crossRules.has(rule)) add(hardFails, 'cross_domain_rule_missing', { rule });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of [
    'missingRequiredDomain',
    'missingStableKey',
    'rawSensitiveFieldPresent',
    'rawHrRowPresent',
    'rawUrlOrSecretPresent',
    'syntheticFixtureMarkedReal',
    'derivedTmpMarkedOriginal',
    'oldDatabaseSourceRef',
    'visualNameOnlyDeduplication',
    'juneVisitMarkedPendingExecutionWhenPaymentOnly',
    'certificationReRequestedWithoutReview',
    'paymentMarkedExecutedByCXOrbia',
    'questionnaireRouteMissingWithoutBlockedStatus'
  ]) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
  }
}

for (const supporting of [
  'backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json',
  'tools/contracts/tya-phase-a-cxdata-dev-adapter-contract-validate.mjs',
  'backend/contracts/phase-a-operational-queues-contract-v1.json',
  'backend/contracts/phase-a-admin-actions-audit-contract-v1.json'
]) {
  if (!exists(supporting)) add(warnings, 'supporting_file_missing', { file: supporting });
}

const report = {
  gate: 'cxorbia-tya-phase-a-source-safe-domain-mapping-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_SOURCE_SAFE_DOMAIN_MAPPING_BLOCKED' : 'GO_SOURCE_SAFE_DOMAIN_MAPPING_CONTRACT_READY_NO_IMPORT',
  productionDecision: 'BLOCK_ADAPTER_READS_RUNTIME_WRITES_IMPORTS_DEPLOY_UNTIL_REALDATA_GATE_AND_PAULA_GO',
  counts: {
    domains: contract?.domainMappings?.length || 0,
    crossDomainRules: contract?.crossDomainRules?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in source-safe mapping. Do not import, enable adapter, switch runtime, write, or deploy.'
    : 'Use this mapping as minimum source-safe schema for future CX.data DEV adapter reads. Continue Phase A real-data readiness without enabling adapter.',
  safeState: {
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
  const target = abs(outDir);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'phase-a-source-safe-domain-mapping-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A source-safe domain mapping validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Domains: ${report.counts.domains}`,
    `- Cross-domain rules: ${report.counts.crossDomainRules}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.domain ? ` · ${x.domain}` : ''}${x.key ? ` · ${x.key}` : ''}${x.rule ? ` · ${x.rule}` : ''}${x.stop ? ` · ${x.stop}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.domain ? ` · ${x.domain}` : ''}${x.marker ? ` · ${x.marker}` : ''}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
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
  fs.writeFileSync(path.join(target, 'phase-a-source-safe-domain-mapping-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
