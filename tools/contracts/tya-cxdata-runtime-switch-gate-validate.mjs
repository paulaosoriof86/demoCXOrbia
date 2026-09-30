#!/usr/bin/env node
/* CXOrbia TyA - CX.data runtime switch gate validator
   Safe validator. No runtime patch, no Firestore writes, no imports, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const allowIdx = args.indexOf('--allow-runtime-switch');
const allowRuntimeSwitch = allowIdx >= 0;
const sanitizedInputIdx = args.indexOf('--sanitized-input');
const sanitizedInputPath = sanitizedInputIdx >= 0 ? args[sanitizedInputIdx + 1] : null;

const contractPath = 'backend/contracts/cxdata-runtime-switch-gate-phase-a-v1.json';
const bridgeContractPath = 'backend/contracts/cxdata-realdata-preview-bridge-phase-a-v1.json';
const bridgeAdapterPath = 'backend/adapters/cxdata-realdata-preview-bridge.preview.mjs';
const manifestContractPath = 'backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json';
const dataPath = 'app/core/data.js';

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

function validateJson(rel, label) {
  if (!exists(rel)) {
    add(hardFails, `${label}_missing`, { file: rel });
    return null;
  }
  try {
    const value = readJson(rel);
    add(info, `${label}_json_valid`, { file: rel });
    return value;
  } catch (err) {
    add(hardFails, `${label}_json_invalid`, { file: rel, error: String(err.message || err) });
    return null;
  }
}

const contract = validateJson(contractPath, 'runtime_switch_contract');
validateJson(bridgeContractPath, 'bridge_contract');
validateJson(manifestContractPath, 'manifest_contract');

if (!exists(bridgeAdapterPath)) add(hardFails, 'bridge_adapter_missing', { file: bridgeAdapterPath });
else add(info, 'bridge_adapter_present', { file: bridgeAdapterPath });

let dataLayerIsDemo = false;
if (!exists(dataPath)) add(hardFails, 'data_layer_missing', { file: dataPath });
else {
  const data = read(dataPath);
  dataLayerIsDemo = data.includes('Mock data layer') && data.includes('GENÉRICO');
  if (dataLayerIsDemo) add(warnings, 'runtime_data_layer_still_demo_generic', { file: dataPath });
  if (!data.includes('CX.data')) add(hardFails, 'cxdata_facade_missing', { file: dataPath });
}

if (contract) {
  if (contract.status !== 'draft_gate_not_authorized') add(hardFails, 'runtime_switch_contract_status_unexpected', { status: contract.status });
  for (const [key, expected] of Object.entries({
    runtimeSwitchAuthorized: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    productionEnabled: false,
    containsSecrets: false,
    containsRawPii: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  if (contract.singleConnectionPointPolicy?.mustPreserveCxDataInterface !== true) add(hardFails, 'must_preserve_cxdata_interface_missing');
  if (contract.singleConnectionPointPolicy?.mustHaveRollback !== true) add(hardFails, 'rollback_requirement_missing');
  if (contract.singleConnectionPointPolicy?.mustHaveSmokeBeforeProduction !== true) add(hardFails, 'smoke_requirement_missing');
  for (const mode of ['demo_only', 'manifest_preview_only', 'sanitized_preview_readonly', 'dev_runtime_preview', 'production_runtime']) {
    if (!contract.runtimeSwitchModes?.[mode]) add(hardFails, 'runtime_switch_mode_missing', { mode });
  }
  for (const required of ['source-safe HR manifest generated', 'sanitized visits preview available or manifest-only UI explicitly accepted', 'Cinepolis represented as normal configurable project', 'rollback plan documented', 'smoke checklist documented', 'Paula explicit GO']) {
    if (!contract.requiredBeforeDevRuntimePreview?.includes(required)) add(hardFails, 'dev_runtime_required_item_missing', { required });
  }
  for (const noGo of ['app/core/data.js still demo as final production source', 'Cinepolis hardcoded in UI modules', 'raw PII in repo or logs', 'no rollback', 'no smoke']) {
    if (!contract.noGoConditions?.includes(noGo)) add(hardFails, 'no_go_condition_missing', { noGo });
  }
}

let sanitizedInputLoaded = false;
if (sanitizedInputPath) {
  const abs = path.isAbsolute(sanitizedInputPath) ? sanitizedInputPath : path.join(root, sanitizedInputPath);
  if (!fs.existsSync(abs)) add(hardFails, 'sanitized_input_missing', { sanitizedInputPath });
  else {
    try {
      const parsed = JSON.parse(fs.readFileSync(abs, 'utf8'));
      const text = JSON.stringify(parsed).toLowerCase();
      for (const forbidden of ['rawdpi', 'rawbank', 'rawphone', 'rawemail', 'privatehrurl', 'spreadsheetfileid', 'serviceaccountjson']) {
        if (text.includes(forbidden)) add(hardFails, 'sanitized_input_contains_forbidden_marker', { forbidden });
      }
      sanitizedInputLoaded = true;
      add(info, 'sanitized_input_loaded', { sanitizedInputPath });
    } catch (err) {
      add(hardFails, 'sanitized_input_invalid_json', { sanitizedInputPath, error: String(err.message || err) });
    }
  }
}

if (allowRuntimeSwitch) {
  if (!sanitizedInputLoaded) add(hardFails, 'runtime_switch_requested_without_sanitized_input');
  if (dataLayerIsDemo) add(hardFails, 'runtime_switch_requested_while_demo_layer_still_final_source');
} else {
  add(info, 'runtime_switch_not_requested');
}

const report = {
  gate: 'cxorbia-tya-cxdata-runtime-switch-gate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_RUNTIME_SWITCH' : allowRuntimeSwitch ? 'GO_RUNTIME_SWITCH_PRECONDITIONS_MET' : 'GO_GATE_READY_SWITCH_NOT_AUTHORIZED',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_DEV_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  decision: {
    runtimeSwitchRequested: allowRuntimeSwitch,
    sanitizedInputLoaded,
    runtimeDataLayerStillDemo: dataLayerIsDemo,
    canSwitchNow: allowRuntimeSwitch && sanitizedInputLoaded && !dataLayerIsDemo && hardFails.length === 0
  },
  safeState: {
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
  fs.writeFileSync(path.join(abs, 'cxdata-runtime-switch-gate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA CX.data runtime switch gate report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Runtime switch requested: ${allowRuntimeSwitch}`,
    `Sanitized input loaded: ${sanitizedInputLoaded}`,
    `Runtime data layer still demo: ${dataLayerIsDemo}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.required ? ` · ${x.required}` : ''}${x.noGo ? ` · ${x.noGo}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Safe state',
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
  fs.writeFileSync(path.join(abs, 'cxdata-runtime-switch-gate-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
