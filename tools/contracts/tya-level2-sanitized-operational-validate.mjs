#!/usr/bin/env node
/* CXOrbia TyA - Level 2 sanitized operational payload validator
   Safe validator. No runtime patch, no Firestore writes, no imports, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const inputIdx = args.indexOf('--input');
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/tya-level2-sanitized-operational-phase-a-v1.json';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function readJson(relOrAbs) { return JSON.parse(fs.readFileSync(abs(relOrAbs), 'utf8')); }
function hasAll(obj, fields, scope) {
  for (const field of fields || []) {
    if (obj?.[field] === undefined || obj?.[field] === null || obj?.[field] === '') add(hardFails, 'required_field_missing', { scope, field });
  }
}

let contract = null;
let payload = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}
if (inputPath) {
  try {
    payload = readJson(inputPath);
    add(info, 'input_loaded', { inputPath });
  } catch (err) {
    add(hardFails, 'input_invalid_json', { inputPath, error: String(err.message || err) });
  }
} else {
  add(warnings, 'no_input_provided_contract_only_validation');
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
    oldDatabaseConnected: false,
    productionEnabled: false,
    containsSecrets: false,
    containsRawPii: false,
    containsRawHrRows: false,
    containsRawWorkbook: false,
    containsOldDatabaseDump: false,
    containsRawPaymentData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
}

if (payload && contract) {
  const text = JSON.stringify(payload).toLowerCase();
  for (const forbidden of contract.forbiddenFieldsAnywhere || []) {
    if (text.includes(String(forbidden).toLowerCase())) add(hardFails, 'forbidden_field_or_marker_present', { forbidden });
  }

  for (const key of contract.requiredTopLevelKeys || []) {
    if (payload[key] === undefined || payload[key] === null) add(hardFails, 'top_level_key_missing', { key });
  }

  if (!Array.isArray(payload.shoppers)) add(hardFails, 'shoppers_missing_or_not_array');
  else payload.shoppers.forEach((item, index) => {
    hasAll(item, contract.shopperFields?.required, `shoppers[${index}]`);
    if (item.status && !contract.shopperFields.allowedStatuses.includes(item.status)) add(hardFails, 'shopper_status_not_allowed', { index, status: item.status });
    if (item.reviewRequired !== true && item.sourceConfidence === 'unknown_or_review_required') add(warnings, 'shopper_low_confidence_should_review', { index });
  });

  if (!Array.isArray(payload.certificationPreservation)) add(hardFails, 'certification_preservation_missing_or_not_array');
  else payload.certificationPreservation.forEach((item, index) => {
    hasAll(item, contract.certificationPreservationFields?.required, `certificationPreservation[${index}]`);
    if (item.status && !contract.certificationPreservationFields.allowedStatuses.includes(item.status)) add(hardFails, 'certification_status_not_allowed', { index, status: item.status });
    if ((item.status === 'presented_preserved_preview' || item.status === 'approved_preserved_preview') && item.preserveWithoutRetake !== true) add(hardFails, 'preserved_certification_missing_preserve_flag', { index });
  });

  if (!Array.isArray(payload.liquidationCandidates)) add(hardFails, 'liquidation_candidates_missing_or_not_array');
  else payload.liquidationCandidates.forEach((item, index) => {
    hasAll(item, contract.liquidationCandidateFields?.required, `liquidationCandidates[${index}]`);
    if (item.status && !contract.liquidationCandidateFields.allowedStatuses.includes(item.status)) add(hardFails, 'liquidation_status_not_allowed', { index, status: item.status });
    if (item.status === 'paid_requires_audit_evidence') add(hardFails, 'paid_status_not_allowed_in_level2_preview', { index });
    const total = Number(item.totalAmount || 0);
    const expected = Number(item.honorariumAmount || 0) + Number(item.reimbursementAmount || 0);
    if (Number.isFinite(total) && Number.isFinite(expected) && Math.abs(total - expected) > 0.01) add(warnings, 'liquidation_total_mismatch', { index, total, expected });
  });

  const issues = Array.isArray(payload.issues) ? payload.issues : [];
  const issueCodes = new Set(issues.map(issue => issue.code));
  for (const required of contract.requiredIssues || []) {
    if (!issueCodes.has(required)) add(hardFails, 'required_issue_missing', { code: required });
  }
}

const report = {
  gate: 'cxorbia-tya-level2-sanitized-operational',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LEVEL2_SANITIZED_OPERATIONAL' : 'GO_LEVEL2_SANITIZED_OPERATIONAL_SAFE_NO_RUNTIME',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  counts: payload ? {
    shoppers: Array.isArray(payload.shoppers) ? payload.shoppers.length : 0,
    certificationPreservation: Array.isArray(payload.certificationPreservation) ? payload.certificationPreservation.length : 0,
    liquidationCandidates: Array.isArray(payload.liquidationCandidates) ? payload.liquidationCandidates.length : 0,
    issues: Array.isArray(payload.issues) ? payload.issues.length : 0
  } : null,
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
    rawPii: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const out = abs(outDir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'level2-sanitized-operational-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Level 2 sanitized operational report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Counts',
    ...(report.counts ? Object.entries(report.counts).map(([k, v]) => `- ${k}: ${v}`) : ['- no input provided']),
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.scope ? ` · ${x.scope}` : ''}${x.field ? ` · ${x.field}` : ''}${x.forbidden ? ` · ${x.forbidden}` : ''}${x.code ? ` · ${x.code}` : ''}`) : ['- none']),
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
    ''
  ].join('\n');
  fs.writeFileSync(path.join(out, 'level2-sanitized-operational-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
