#!/usr/bin/env node
/* CXOrbia TyA - Phase A real-data domain readiness pack validator
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: validate the dry-run readiness pack contract and optionally validate a local
   source-safe input JSON against the minimum Phase A domain requirements.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const inputIdx = args.indexOf('--input');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function exists(rel) { return rel ? fs.existsSync(abs(rel)) : true; }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj || {}, key); }
function listify(value) { return Array.isArray(value) ? value : value ? [value] : []; }

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.mode !== 'realdata_readiness_pack_contract_only_no_import') {
    add(hardFails, 'contract_mode_must_be_readiness_pack_no_import', { mode: contract.mode });
  }

  for (const file of contract.requiredContracts || []) {
    if (!exists(file)) add(hardFails, 'required_contract_missing', { file });
    else add(info, 'required_contract_present', { file });
  }

  const shape = contract.readinessInputShape || {};
  for (const field of ['tenantId', 'projectId', 'sourceType', 'sourceRef', 'sourceSafety', 'domains', 'generatedAt']) {
    if (!shape.requiredTopLevelFields?.includes(field)) add(hardFails, 'input_shape_required_field_missing', { field });
  }

  const safety = shape.sourceSafetyRequired || {};
  for (const [key, expected] of Object.entries(safety)) {
    if (expected !== false) add(hardFails, 'source_safety_required_flags_must_be_false', { key, expected });
  }

  const domainChecks = contract.domainReadinessChecks || [];
  const requiredDomains = ['tenant_project_config', 'hr_source_status', 'visits', 'shoppers', 'certifications', 'liquidations_payments_june', 'questionnaire_routes'];
  for (const domain of requiredDomains) {
    if (!domainChecks.some((d) => d.domain === domain && d.required === true)) add(hardFails, 'required_domain_check_missing', { domain });
  }

  const assertions = new Set((contract.phaseABusinessAssertions || []).map((x) => x.assertionId));
  for (const assertion of ['june_pending_is_payment_control', 'certifications_preserved_before_re_request', 'hr_platform_assignment_no_duplicate', 'questionnaire_route_configurable', 'cinepolis_configured_project']) {
    if (!assertions.has(assertion)) add(hardFails, 'phase_a_business_assertion_missing', { assertion });
  }

  const hardStops = new Set(contract.hardStops || []);
  for (const stop of ['missingInput', 'inputNotSourceSafe', 'sourceIsSyntheticFixture', 'sourceIsDerivedTmpOutput', 'sourceIsOldDatabase', 'rawSensitiveMarkerFound', 'requiredDomainMissing', 'requiredFieldMissing', 'stableKeyMissing', 'canImportTrue', 'canWriteTrue', 'paymentControlOnlyFalse']) {
    if (!hardStops.has(stop)) add(hardFails, 'hard_stop_missing', { stop });
  }

  const safe = contract.safeStateExpectedNow || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (key === 'dryRunOnly') {
      if (expected !== true) add(hardFails, 'dry_run_only_must_be_true', { expected });
    } else if (expected !== false) {
      add(hardFails, 'safe_state_expected_now_must_be_false', { key, expected });
    }
  }
}

let input = null;
if (inputPath) {
  try {
    input = readJson(inputPath);
    add(info, 'input_loaded', { inputPath });
  } catch (err) {
    add(hardFails, 'input_missing_or_invalid_json', { inputPath, error: String(err.message || err) });
  }
} else {
  add(warnings, 'no_input_provided_contract_only_validation', { note: 'Use --input with local source-safe dry-run JSON when available. Do not paste private data into chat.' });
}

if (contract && input) {
  const shape = contract.readinessInputShape || {};
  for (const field of shape.requiredTopLevelFields || []) {
    if (!hasOwn(input, field)) add(hardFails, 'input_required_top_level_field_missing', { field });
  }

  if (input.tenantId !== contract.tenantId) add(hardFails, 'input_tenant_mismatch', { expected: contract.tenantId, found: input.tenantId });
  if (input.projectId !== contract.projectId) add(hardFails, 'input_project_mismatch', { expected: contract.projectId, found: input.projectId });
  if (!shape.sourceTypeAllowed?.includes(input.sourceType)) add(hardFails, 'input_source_type_not_allowed', { sourceType: input.sourceType });

  const safety = input.sourceSafety || {};
  for (const [key, expected] of Object.entries(shape.sourceSafetyRequired || {})) {
    if (safety[key] !== expected) add(hardFails, 'input_source_safety_flag_invalid', { key, expected, found: safety[key] });
  }

  const inputText = JSON.stringify(input);
  for (const marker of contract.forbiddenMarkersAnywhere || []) {
    if (inputText.includes(`"${marker}"`)) add(hardFails, 'forbidden_marker_key_found_in_input', { marker });
  }

  const domains = input.domains || {};
  for (const check of contract.domainReadinessChecks || []) {
    const rows = listify(domains[check.domain]);
    if (check.required && !hasOwn(domains, check.domain)) {
      if (check.minimumRecordCount > 0) add(hardFails, 'input_required_domain_missing', { domain: check.domain, status: check.statusIfMissing });
      else add(warnings, 'input_optional_empty_domain_missing', { domain: check.domain, status: check.statusIfMissing });
      continue;
    }
    if (rows.length < (check.minimumRecordCount || 0)) {
      const target = check.minimumRecordCount > 0 ? hardFails : warnings;
      add(target, 'input_domain_record_count_below_minimum', { domain: check.domain, found: rows.length, minimum: check.minimumRecordCount, status: check.statusIfMissing });
    }
    for (const [idx, row] of rows.entries()) {
      for (const field of check.mustHaveFields || []) {
        if (!hasOwn(row, field)) add(hardFails, 'input_domain_required_field_missing', { domain: check.domain, index: idx, field });
      }
      for (const field of check.stableKeyFields || []) {
        if (!hasOwn(row, field) || row[field] === '' || row[field] === null || typeof row[field] === 'undefined') add(hardFails, 'input_domain_stable_key_missing', { domain: check.domain, index: idx, field });
      }
      for (const field of check.mustRemainFalse || []) {
        if (row[field] !== false) add(hardFails, 'input_domain_flag_must_remain_false', { domain: check.domain, index: idx, field, found: row[field] });
      }
      for (const field of check.mustRemainTrue || []) {
        if (row[field] !== true) add(hardFails, 'input_domain_flag_must_remain_true', { domain: check.domain, index: idx, field, found: row[field] });
      }
    }
  }
}

const report = {
  gate: 'cxorbia-tya-phase-a-realdata-domain-readiness-pack-validate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_REALDATA_DOMAIN_READINESS_BLOCKED' : input ? 'GO_REALDATA_DOMAIN_READINESS_DRY_RUN_ONLY' : 'GO_READINESS_PACK_CONTRACT_ONLY_NO_INPUT',
  productionDecision: 'BLOCK_ADAPTER_RUNTIME_WRITES_IMPORTS_DEPLOY_UNTIL_CLEAN_REALDATA_GATE_AND_PAULA_GO',
  inputPath: inputPath || null,
  counts: {
    domainChecks: contract?.domainReadinessChecks?.length || 0,
    businessAssertions: contract?.phaseABusinessAssertions?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length
  },
  nextStep: hardFails.length
    ? 'Fix only root cause in dry-run readiness. Do not import, enable adapter, switch runtime, write, or deploy.'
    : input
      ? 'Use this dry-run report to decide if a later CX.data DEV adapter read request can be prepared. No runtime was enabled.'
      : 'When original local source-safe TyA JSON exists, run again with --input. Do not paste private data into chat.',
  safeState: {
    adapterEnabled: false,
    runtimeConnected: false,
    domainImportExecuted: false,
    dryRunOnly: true,
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
  fs.writeFileSync(path.join(target, 'phase-a-realdata-domain-readiness-pack-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A real-data domain readiness pack validation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Input path: ${report.inputPath || 'none'}`,
    '',
    '## Counts',
    `- Domain checks: ${report.counts.domainChecks}`,
    `- Business assertions: ${report.counts.businessAssertions}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.domain ? ` · ${x.domain}` : ''}${x.field ? ` · ${x.field}` : ''}${x.marker ? ` · ${x.marker}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.domain ? ` · ${x.domain}` : ''}${x.note ? ` · ${x.note}` : ''}`) : ['- none']),
    '',
    '## Next step',
    `- ${report.nextStep}`,
    '',
    '## Safe state',
    '- Adapter disabled',
    '- Runtime not connected',
    '- Domain import not executed',
    '- Dry-run only',
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
  fs.writeFileSync(path.join(target, 'phase-a-realdata-domain-readiness-pack-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
