#!/usr/bin/env node
/* CXOrbia TyA - CX.data real-data preview bridge validator
   Safe validator. No runtime patch, no Firestore writes, no imports, no deploy. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/cxdata-realdata-preview-bridge-phase-a-v1.json';
const adapterPath = 'backend/adapters/cxdata-realdata-preview-bridge.preview.mjs';
const dataPath = 'app/core/data.js';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
if (!exists(contractPath)) add(hardFails, 'bridge_contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (!exists(adapterPath)) add(hardFails, 'bridge_adapter_missing', { file: adapterPath });
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
    'runtimePatched: false',
    'firestoreWrites: false',
    'importsExecuted: false',
    'hrWrites: false',
    'assertSourceSafeObject',
    'CXDATA_REALDATA_FORBIDDEN_KEY',
    'buildCinepolisProjectFromManifest',
    'buildPeriodProjectsFromManifest',
    'buildCxDataPreviewShape',
    'canPatchRuntime()'
  ]) {
    if (!text.includes(term)) add(hardFails, 'adapter_required_term_missing', { term });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    frontendConnected: false,
    runtimePatched: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    productionEnabled: false,
    containsSecrets: false,
    containsRawPii: false,
    containsRawHrRows: false,
    containsRawWorkbook: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  if (contract.project?.projectId !== 'cinepolis') add(hardFails, 'cinepolis_project_id_missing');
  if (contract.project?.mustRemainNormalConfigurableProject !== true) add(hardFails, 'cinepolis_must_be_normal_configurable');
  if (contract.project?.mustNotBeHardcodedGlobalLogic !== true) add(hardFails, 'cinepolis_must_not_be_hardcoded');
  if (contract.targetFacade?.mustRemainSameInterface !== true) add(hardFails, 'cxdata_interface_must_remain_same');
  if (contract.targetFacade?.mustNotRewriteModules !== true) add(hardFails, 'modules_must_not_be_rewritten');
  for (const gate of ['devManifestOnly', 'devPreviewReadOnly', 'devRuntimeBridge', 'productionCutover']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
  for (const forbidden of ['rawHrWorkbook', 'rawCsv', 'rawDpi', 'rawBankAccount', 'rawPhone', 'rawEmail', 'signedNdaFile', 'privateHrUrl', 'spreadsheetFileId', 'serviceAccountJson']) {
    if (!contract.sourceInputs?.forbidden?.includes(forbidden)) add(hardFails, 'forbidden_input_policy_missing', { forbidden });
  }
}

if (exists(dataPath)) {
  const data = read(dataPath);
  if (data.includes('Mock data layer') && data.includes('GENÉRICO')) {
    add(warnings, 'runtime_data_layer_still_demo_generic', { file: dataPath });
  }
  if (!data.includes('CX.data')) add(hardFails, 'cxdata_facade_not_found', { file: dataPath });
}

const indexPath = 'app/index.html';
if (exists(indexPath)) {
  const index = read(indexPath);
  if (index.includes('cxdata-realdata-preview-bridge.preview.mjs') || index.includes('cxdata-realdata-preview-bridge-phase-a-v1')) {
    add(hardFails, 'preview_bridge_must_not_be_loaded_by_frontend_yet');
  } else {
    add(info, 'frontend_not_connected_to_preview_bridge');
  }
}

const report = {
  gate: 'cxorbia-tya-cxdata-realdata-preview-bridge',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_CXDATA_REALDATA_BRIDGE' : 'GO_SAFE_BRIDGE_NOT_CONNECTED',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_USES_REALDATA_SOURCE_AND_SMOKE_GO',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    frontendConnected: false,
    runtimePatched: false,
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
  fs.writeFileSync(path.join(abs, 'cxdata-realdata-preview-bridge-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA CX.data real-data preview bridge report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.gate ? ` · ${x.gate}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Frontend not connected',
    '- Runtime not patched',
    '- No Firestore writes',
    '- No imports',
    '- No HR writes',
    '- No deploy',
    '- No production',
    '- No raw PII',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'cxdata-realdata-preview-bridge-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
