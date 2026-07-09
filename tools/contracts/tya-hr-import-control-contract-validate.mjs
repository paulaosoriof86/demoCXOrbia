#!/usr/bin/env node
/* CXOrbia TyA - HR import control contract validator
   Safe validator. No old DB calls, no HR writes, no DB writes. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/hr-import-control-phase-a-v1.json';
const adapterPath = 'backend/adapters/hr-import-control-adapter.preview.mjs';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
if (!exists(contractPath)) add(hardFails, 'hr_import_contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (!exists(adapterPath)) add(hardFails, 'hr_import_adapter_missing', { file: adapterPath });
else {
  const text = read(adapterPath);
  try {
    execFileSync('node', ['--check', path.join(root, adapterPath)], { stdio: 'pipe' });
    add(info, 'adapter_syntax_ok', { file: adapterPath });
  } catch (err) {
    add(hardFails, 'adapter_syntax_fail', { file: adapterPath, error: String(err.stderr || err.message).slice(0, 800) });
  }
  for (const term of [
    'connectedToFrontend: false',
    'oldDatabaseConnected: false',
    'importWritesEnabled: false',
    'hrWritesEnabled: false',
    'assertImportWriteGate',
    'HR_IMPORT_WRITE_GATE_BLOCKED',
    'HR_IMPORT_ADAPTER_NOT_CONNECTED',
    'assertNoRawHrPayload',
    'createHrImportControlAdapter'
  ]) {
    if (!text.includes(term)) add(hardFails, 'adapter_required_term_missing', { term });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    frontendConnected: false,
    oldDatabaseConnected: false,
    importWritesEnabled: false,
    hrWritesEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false,
    containsRawHrPayload: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const collection of ['hrSources', 'hrImportRuns', 'hrRowsStaging', 'visitSourceMap', 'shopperSourceMap', 'certificationSourceMap', 'importConflicts']) {
    if (!contract.collections?.[collection]?.phaseA) add(hardFails, 'collection_missing_or_disabled', { collection });
  }
  for (const key of ['tenantId', 'projectId', 'importRunId', 'hrSourceId', 'mode', 'status', 'sourcePeriodFrom', 'sourcePeriodTo', 'createdAt', 'createdBy', 'auditRef']) {
    if (!contract.requiredImportRunKeys?.includes(key)) add(hardFails, 'required_import_run_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'hrRowId', 'importRunId', 'country', 'periodKey', 'quincena', 'visitSourceKey', 'shopperSourceKey', 'visitStatus', 'assignmentStatus', 'questionnaireStatus', 'paymentControlStatus', 'sanitizationStatus', 'auditRef']) {
    if (!contract.requiredHrRowKeys?.includes(key)) add(hardFails, 'required_hr_row_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'hrSourceId', 'importRunId', 'hrRowId', 'visitId', 'visitSourceKey', 'shopperId', 'shopperSourceKey', 'assignmentId', 'certificationSourceId', 'country', 'periodKey', 'quincena']) {
    if (!contract.stableKeys?.includes(key)) add(hardFails, 'stable_key_missing', { key });
  }
  for (const mode of ['dry_run', 'staging_sanitized', 'promote_reviewed', 'rollback']) {
    if (!contract.importModes?.[mode]) add(hardFails, 'import_mode_missing', { mode });
  }
  for (const status of ['pending_source_review', 'sanitized_preview', 'ready_for_review', 'review_required', 'approved_for_staging', 'staged_sanitized', 'approved_for_promote', 'promoted_audited', 'rejected_with_audit', 'rolled_back_audited']) {
    if (!contract.statuses?.[status]) add(hardFails, 'status_missing', { status });
  }
  for (const forbidden of ['rawHrWorkbook', 'rawHrCsv', 'rawDpi', 'rawPassport', 'rawBankAccount', 'rawPhone', 'rawEmail', 'signedNdaFile', 'privateHrUrl', 'hrCredential', 'serviceAccountJson', 'rawEvidenceBinary', 'base64Evidence']) {
    if (!contract.forbiddenInRepo?.includes(forbidden)) add(hardFails, 'forbidden_repo_policy_missing', { forbidden });
  }
  for (const gate of ['devDryRun', 'devStagingWrite', 'stagingPromote', 'productionPromote', 'hrWriteBack']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
  if (contract.phaseAContext?.hrIsOperationalSource !== true) add(hardFails, 'phase_a_hr_source_context_missing');
  if (contract.phaseAContext?.historicalImportRequired !== true) add(hardFails, 'historical_import_context_missing');
  if (contract.phaseAContext?.historicalShoppersFromHrRequired !== true) add(hardFails, 'historical_shoppers_context_missing');
  if (contract.phaseAContext?.certificationsAlreadyPresentedMustBePreserved !== true) add(hardFails, 'certifications_preserved_context_missing');
  if (contract.dedupePolicy?.strategy !== 'stable_keys_only') add(hardFails, 'dedupe_strategy_must_be_stable_keys_only');
  if (contract.dedupePolicy?.visualMatchOnlyAllowed !== false) add(hardFails, 'visual_match_only_must_be_forbidden');
}

const indexPath = 'app/index.html';
if (exists(indexPath)) {
  const index = read(indexPath);
  if (index.includes('hr-import-control-adapter.preview.mjs') || index.includes('hr-import-control-phase-a-v1')) {
    add(hardFails, 'preview_hr_import_adapter_must_not_be_loaded_by_frontend');
  } else {
    add(info, 'frontend_not_connected_to_hr_import_preview_adapter');
  }
}

const report = {
  gate: 'cxorbia-tya-hr-import-control-contract',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_HR_IMPORT_CONTRACT' : 'GO_SAFE_HR_IMPORT_CONTRACT_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    frontendConnected: false,
    oldDatabaseConnected: false,
    importWritesEnabled: false,
    hrWritesEnabled: false,
    deploy: false,
    production: false,
    providerCalls: false,
    databaseWrites: false,
    imports: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'hr-import-control-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA HR import control contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.key ? ` · ${x.key}` : ''}${x.collection ? ` · ${x.collection}` : ''}${x.mode ? ` · ${x.mode}` : ''}${x.status ? ` · ${x.status}` : ''}${x.gate ? ` · ${x.gate}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Frontend not connected',
    '- Old database not connected',
    '- Import writes disabled',
    '- HR writes disabled',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'hr-import-control-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
