#!/usr/bin/env node
/* CXOrbia TyA - Minimal sanitized input validator
   Safe validator. No runtime patch, no Firestore writes, no imports, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const inputIdx = args.indexOf('--input');
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/tya-minimal-sanitized-input-phase-a-v1.json';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function readJson(relOrAbs) { const p = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); return JSON.parse(fs.readFileSync(p, 'utf8')); }
function get(obj, pathExpr) { return pathExpr.split('.').reduce((a, k) => (a && Object.prototype.hasOwnProperty.call(a, k) ? a[k] : undefined), obj); }
function hasAll(obj, fields, prefix) {
  for (const field of fields || []) {
    if (obj?.[field] === undefined || obj?.[field] === null || obj?.[field] === '') add(hardFails, 'required_field_missing', { scope: prefix, field });
  }
}

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_json_valid', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

let payload = null;
if (inputPath) {
  try {
    payload = readJson(inputPath);
    add(info, 'input_loaded', { inputPath });
  } catch (err) {
    add(hardFails, 'input_invalid_json', { inputPath, error: String(err.message || err) });
  }
} else {
  add(warnings, 'no_input_provided_manifest_only_or_contract_validation');
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    productionEnabled: false,
    containsSecrets: false,
    containsRawPii: false,
    containsRawHrRows: false,
    containsRawWorkbook: false,
    containsOldDatabaseDump: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  if (contract.tenantProject?.tenantId !== 'tya') add(hardFails, 'tenant_tya_missing');
  if (contract.tenantProject?.projectId !== 'cinepolis') add(hardFails, 'project_cinepolis_missing');
  if (contract.tenantProject?.projectMustBeNormalConfigurable !== true) add(hardFails, 'project_must_be_normal_configurable_missing');
}

if (payload && contract) {
  const text = JSON.stringify(payload).toLowerCase();
  for (const forbidden of contract.forbiddenFieldsAnywhere || []) {
    if (text.includes(String(forbidden).toLowerCase())) add(hardFails, 'forbidden_field_or_marker_present', { forbidden });
  }

  const projectConfig = payload.projectConfig;
  if (!projectConfig) add(hardFails, 'project_config_missing');
  else {
    hasAll(projectConfig, contract.minimumPreviewPayload?.projectConfig?.requiredFields, 'projectConfig');
    if (projectConfig.tenantId !== 'tya') add(hardFails, 'payload_project_config_tenant_not_tya', { actual: projectConfig.tenantId });
    if (projectConfig.projectId !== 'cinepolis') add(hardFails, 'payload_project_config_project_not_cinepolis', { actual: projectConfig.projectId });
  }

  const periods = payload.periods;
  if (!Array.isArray(periods) || !periods.length) add(hardFails, 'periods_missing_or_empty');
  else periods.forEach((period, index) => hasAll(period, contract.minimumPreviewPayload?.periods?.requiredFields, `periods[${index}]`));

  const visits = payload.visits;
  if (!Array.isArray(visits) || !visits.length) add(warnings, 'visits_missing_or_empty_level0_manifest_only');
  else visits.forEach((visit, index) => {
    hasAll(visit, contract.minimumPreviewPayload?.visits?.requiredFields, `visits[${index}]`);
    const allowed = contract.minimumPreviewPayload?.visits?.allowedStatusValues || [];
    if (visit.status && !allowed.includes(visit.status)) add(hardFails, 'visit_status_not_allowed', { index, status: visit.status });
  });

  if (payload.shoppers !== undefined) {
    if (!Array.isArray(payload.shoppers)) add(hardFails, 'shoppers_must_be_array_if_present');
    else payload.shoppers.forEach((shopper, index) => hasAll(shopper, contract.minimumPreviewPayload?.shoppers?.requiredIfIncludedFields, `shoppers[${index}]`));
  }

  const certs = payload.certificationPreservation;
  if (!Array.isArray(certs) || !certs.length) add(warnings, 'certification_preservation_missing_or_empty');
  else certs.forEach((cert, index) => hasAll(cert, contract.minimumPreviewPayload?.certificationPreservation?.requiredFields, `certificationPreservation[${index}]`));

  const liquidationCandidates = payload.liquidationCandidates;
  if (!Array.isArray(liquidationCandidates) || !liquidationCandidates.length) add(warnings, 'liquidation_candidates_missing_or_empty');
  else liquidationCandidates.forEach((item, index) => hasAll(item, contract.minimumPreviewPayload?.liquidationCandidates?.requiredFields, `liquidationCandidates[${index}]`));

  const issues = Array.isArray(payload.issues) ? payload.issues : [];
  if (!issues.length) add(hardFails, 'issues_missing_required_blockers');
  else issues.forEach((issue, index) => hasAll(issue, contract.minimumPreviewPayload?.issues?.requiredFields, `issues[${index}]`));
  const issueCodes = new Set(issues.map((issue) => issue.code));
  for (const required of contract.requiredIssuesBeforeRuntimePreview || []) {
    if (!issueCodes.has(required.code)) add(hardFails, 'required_issue_missing', { code: required.code });
  }
}

const canRenderLevel = payload
  ? Array.isArray(payload.visits) && payload.visits.length
    ? Array.isArray(payload.shoppers) && payload.shoppers.length && Array.isArray(payload.certificationPreservation) && Array.isArray(payload.liquidationCandidates)
      ? 'level2_sanitizedOperationalPreview'
      : 'level1_sanitizedVisits'
    : 'level0_manifestOnly'
  : 'contractOnly';

const report = {
  gate: 'cxorbia-tya-minimal-sanitized-input',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_MINIMAL_SANITIZED_INPUT' : 'GO_MINIMAL_SANITIZED_INPUT_SAFE_NO_RUNTIME',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  previewLevel: canRenderLevel,
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'minimal-sanitized-input-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA minimal sanitized input report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Preview level: ${report.previewLevel}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.scope ? ` · ${x.scope}` : ''}${x.field ? ` · ${x.field}` : ''}${x.code ? ` · ${x.code}` : ''}${x.forbidden ? ` · ${x.forbidden}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}`) : ['- none']),
    '',
    '## Safe state',
    '- Runtime not connected',
    '- Frontend not modified',
    '- Modules not modified',
    '- No Firestore writes',
    '- No imports',
    '- No HR writes',
    '- No deploy',
    '- No production',
    '- No raw PII',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'minimal-sanitized-input-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
