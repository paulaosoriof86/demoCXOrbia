#!/usr/bin/env node
/* CXOrbia TyA - CX.data Firestore contract validator
   Safe validator. No deploy, no provider calls, no database writes. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

const contractPath = 'backend/contracts/cxdata-firestore-phase-a-v1.json';
const adapterPath = 'backend/adapters/firebase-cxdata-adapter.preview.mjs';

if (!exists(contractPath)) add(hardFails, 'contract_missing', { file: contractPath });
if (!exists(adapterPath)) add(hardFails, 'adapter_missing', { file: adapterPath });

let contract = null;
if (exists(contractPath)) {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  if (contract.safeState?.connectedToFrontend !== false) add(hardFails, 'contract_must_not_connect_frontend');
  if (contract.safeState?.writesEnabled !== false) add(hardFails, 'contract_writes_must_be_disabled');
  if (contract.safeState?.containsSensitiveData !== false) add(hardFails, 'contract_sensitive_state_invalid');

  for (const key of ['tenantId', 'projectId', 'entityType', 'entityId']) {
    if (!contract.identityKeys?.includes(key)) add(hardFails, 'identity_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'shopperId', 'assignmentSource', 'assignmentSyncStatus', 'lastSyncedAt']) {
    if (!contract.syncKeys?.includes(key)) add(hardFails, 'sync_key_missing', { key });
  }
  for (const name of ['tenants', 'projects', 'visits', 'assignments', 'shoppers', 'applications', 'certifications', 'liquidations', 'hrImports', 'conflictReviews', 'outbox', 'auditLog']) {
    if (!contract.collections?.[name]) add(hardFails, 'collection_missing', { collection: name });
  }
  for (const method of ['get', 'set', 'remove', 'list', 'upsert', 'seed', 'export']) {
    if (!contract.cxDataInterface?.minimumMethods?.includes(method)) add(hardFails, 'cxdata_method_missing', { method });
  }
}

if (exists(adapterPath)) {
  const text = read(adapterPath);
  try {
    execFileSync('node', ['--check', path.join(root, adapterPath)], { stdio: 'pipe' });
    add(info, 'adapter_syntax_ok', { file: adapterPath });
  } catch (err) {
    add(hardFails, 'adapter_syntax_fail', { file: adapterPath, error: String(err.stderr || err.message).slice(0, 800) });
  }
  for (const term of [
    'connectedToFrontend: false',
    'writesEnabled: false',
    'assertWriteGate',
    'CXDATA_WRITES_BLOCKED',
    'CXDATA_FIRESTORE_NOT_CONNECTED',
    'tenantId',
    'projectId',
    'createCxDataFirestoreAdapter'
  ]) {
    if (!text.includes(term)) add(hardFails, 'adapter_required_term_missing', { term });
  }
}

const indexPath = 'app/index.html';
if (exists(indexPath)) {
  const index = read(indexPath);
  if (index.includes('firebase-cxdata-adapter.preview.mjs') || index.includes('cxdata-firestore-phase-a-v1')) {
    add(hardFails, 'preview_adapter_must_not_be_loaded_by_frontend');
  } else {
    add(info, 'frontend_not_connected_to_preview_adapter');
  }
}

const report = {
  gate: 'cxorbia-tya-cxdata-firestore-contract',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_CONTRACT' : 'GO_SAFE_CONTRACT_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    frontendConnected: false,
    writesEnabled: false,
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
  fs.writeFileSync(path.join(abs, 'cxdata-firestore-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA CX.data Firestore contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.key ? ` · ${x.key}` : ''}${x.collection ? ` · ${x.collection}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Frontend not connected',
    '- Writes disabled',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'cxdata-firestore-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
