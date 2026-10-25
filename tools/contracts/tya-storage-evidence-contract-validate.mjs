#!/usr/bin/env node
/* CXOrbia TyA - Storage evidence contract validator
   Safe validator. No Storage calls, no provider calls, no writes. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/storage-evidence-phase-a-v1.json';
const adapterPath = 'backend/adapters/firebase-storage-evidence-adapter.preview.mjs';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
if (!exists(contractPath)) add(hardFails, 'storage_contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (!exists(adapterPath)) add(hardFails, 'storage_adapter_missing', { file: adapterPath });
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
    'storageProviderConnected: false',
    'uploadsEnabled: false',
    'downloadsEnabled: false',
    'signedUrlsEnabled: false',
    'assertStorageGate',
    'STORAGE_EVIDENCE_GATE_BLOCKED',
    'STORAGE_EVIDENCE_NOT_CONNECTED',
    'assertSafeFileName',
    'createFirebaseStorageEvidenceAdapter'
  ]) {
    if (!text.includes(term)) add(hardFails, 'adapter_required_term_missing', { term });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    storageProviderConnected: false,
    frontendConnected: false,
    uploadsEnabled: false,
    downloadsEnabled: false,
    signedUrlsEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const key of ['tenantId', 'projectId', 'bucketScope', 'entityId', 'documentId']) {
    if (!contract.requiredPathKeys?.includes(key)) add(hardFails, 'required_path_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'documentId', 'entityType', 'entityId', 'documentType', 'sensitivity', 'status', 'createdAt', 'createdBy', 'auditRef']) {
    if (!contract.requiredMetadataKeys?.includes(key)) add(hardFails, 'required_metadata_key_missing', { key });
  }
  for (const scope of ['visitEvidence', 'shopperDocuments', 'hrImports', 'liquidationSupports', 'academyAssets']) {
    if (!contract.bucketScopes?.[scope]?.phaseA) add(hardFails, 'bucket_scope_missing_or_disabled', { scope });
  }
  for (const sensitivity of ['publicProduct', 'internalRestricted', 'operationalRestricted', 'sensitiveRestricted', 'financialRestricted']) {
    if (!contract.sensitivityLevels?.[sensitivity]) add(hardFails, 'sensitivity_level_missing', { sensitivity });
  }
  for (const forbidden of ['rawDpi', 'rawPassport', 'rawBankAccount', 'signedNdaFile', 'privateStorageUrl', 'signedUrl', 'providerToken', 'serviceAccountJson', 'rawEvidenceBinary', 'base64Evidence']) {
    if (!contract.forbiddenInRepo?.includes(forbidden)) add(hardFails, 'forbidden_repo_policy_missing', { forbidden });
  }
  for (const gate of ['devStorageConfig', 'devUploads', 'stagingEvidenceImport', 'productionEvidenceCutover']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
}

const indexPath = 'app/index.html';
if (exists(indexPath)) {
  const index = read(indexPath);
  if (index.includes('firebase-storage-evidence-adapter.preview.mjs') || index.includes('storage-evidence-phase-a-v1')) {
    add(hardFails, 'preview_storage_adapter_must_not_be_loaded_by_frontend');
  } else {
    add(info, 'frontend_not_connected_to_storage_preview_adapter');
  }
}

const report = {
  gate: 'cxorbia-tya-storage-evidence-contract',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_STORAGE_CONTRACT' : 'GO_SAFE_STORAGE_CONTRACT_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    storageProviderConnected: false,
    frontendConnected: false,
    uploadsEnabled: false,
    downloadsEnabled: false,
    signedUrlsEnabled: false,
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
  fs.writeFileSync(path.join(abs, 'storage-evidence-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Storage evidence contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.key ? ` · ${x.key}` : ''}${x.scope ? ` · ${x.scope}` : ''}${x.gate ? ` · ${x.gate}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Storage provider not connected',
    '- Frontend not connected',
    '- Uploads disabled',
    '- Downloads disabled',
    '- Signed URLs disabled',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'storage-evidence-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
