#!/usr/bin/env node
/* CXOrbia TyA - Runtime DEV preview GO/NO-GO validator
   Safe validator. No runtime switch, no writes, no imports, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
function arg(name) { const idx = args.indexOf(name); return idx >= 0 ? args[idx + 1] : null; }
const preflightPath = arg('--preflight');
const level2ValidationPath = arg('--level2-validation');
const bridgeValidationPath = arg('--bridge-validation');
const runtimeSwitchPath = arg('--runtime-switch-validation');
const rollbackSmokePath = arg('--rollback-smoke-validation');
const outDir = arg('--out');
const paulaGoFlag = args.includes('--paula-go-requested');

const contractPath = 'backend/contracts/tya-runtime-dev-preview-go-nogo-phase-a-v1.json';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function exists(relOrAbs) { return relOrAbs && fs.existsSync(abs(relOrAbs)); }
function readJson(relOrAbs) { return JSON.parse(fs.readFileSync(abs(relOrAbs), 'utf8')); }
function loadReport(id, p, required = true) {
  if (!p) {
    add(required ? hardFails : warnings, 'report_path_missing', { id });
    return null;
  }
  if (!exists(p)) {
    add(required ? hardFails : warnings, 'report_file_missing', { id, path: p });
    return null;
  }
  try {
    const report = readJson(p);
    add(info, 'report_loaded', { id, path: p, verdict: report.verdict || null });
    return report;
  } catch (err) {
    add(required ? hardFails : warnings, 'report_invalid_json', { id, path: p, error: String(err.message || err) });
    return null;
  }
}
function hardFailCount(report) {
  if (!report) return null;
  if (Number.isFinite(Number(report.hardFailCount))) return Number(report.hardFailCount);
  if (Number.isFinite(Number(report.counts?.hardFails))) return Number(report.counts.hardFails);
  if (Array.isArray(report.hardFails)) return report.hardFails.length;
  return null;
}
function requireVerdict(report, id, expected) {
  if (!report) return;
  if (report.verdict !== expected) add(hardFails, 'unexpected_verdict', { id, expected, actual: report.verdict });
}
function allowVerdict(report, id, allowed) {
  if (!report) return;
  if (!allowed.includes(report.verdict)) add(hardFails, 'unexpected_verdict', { id, allowed, actual: report.verdict });
}
function requireZeroHardFails(report, id) {
  if (!report) return;
  const count = hardFailCount(report);
  if (count === null) add(warnings, 'hard_fail_count_not_found', { id });
  else if (count !== 0) add(hardFails, 'report_has_hard_fails', { id, count });
}

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.status !== 'draft_gate_not_authorized') add(hardFails, 'contract_status_unexpected', { status: contract.status });
  for (const [key, expected] of Object.entries({
    runtimeSwitchAuthorized: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    oldDatabaseConnected: false,
    makeDispatch: false,
    geminiPublish: false,
    paymentExecution: false,
    productionEnabled: false,
    containsSecrets: false,
    containsRawPii: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'contract_safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
}

const preflight = loadReport('localRealdataPreflight', preflightPath, false);
const level2 = loadReport('level2SanitizedOperationalValidation', level2ValidationPath, false);
const bridge = loadReport('bridgeValidation', bridgeValidationPath, false);
const runtimeSwitch = loadReport('runtimeSwitchGateValidation', runtimeSwitchPath, false);
const rollbackSmoke = loadReport('rollbackSmokePlanValidation', rollbackSmokePath, false);

if (preflight) {
  requireVerdict(preflight, 'localRealdataPreflight', 'GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME');
  requireZeroHardFails(preflight, 'localRealdataPreflight');
  for (const level of ['level0', 'level1', 'level2']) {
    if (preflight.payloads?.[level] !== true) add(hardFails, 'preflight_payload_missing', { level, actual: preflight.payloads?.[level] });
  }
}
if (level2) {
  requireVerdict(level2, 'level2SanitizedOperationalValidation', 'GO_LEVEL2_SANITIZED_OPERATIONAL_SAFE_NO_RUNTIME');
  requireZeroHardFails(level2, 'level2SanitizedOperationalValidation');
}
if (bridge) {
  requireVerdict(bridge, 'bridgeValidation', 'GO_SAFE_BRIDGE_NOT_CONNECTED');
  requireZeroHardFails(bridge, 'bridgeValidation');
}
if (runtimeSwitch) {
  allowVerdict(runtimeSwitch, 'runtimeSwitchGateValidation', ['GO_GATE_READY_SWITCH_NOT_AUTHORIZED', 'GO_RUNTIME_SWITCH_PRECONDITIONS_MET']);
  requireZeroHardFails(runtimeSwitch, 'runtimeSwitchGateValidation');
}
if (rollbackSmoke) {
  requireVerdict(rollbackSmoke, 'rollbackSmokePlanValidation', 'GO_ROLLBACK_SMOKE_PLAN_READY_NO_SWITCH');
  requireZeroHardFails(rollbackSmoke, 'rollbackSmokePlanValidation');
}

const missingRequiredReports = [
  ['preflight', preflight],
  ['level2Validation', level2],
  ['bridgeValidation', bridge],
  ['runtimeSwitchValidation', runtimeSwitch],
  ['rollbackSmokeValidation', rollbackSmoke]
].filter(([, report]) => !report).map(([name]) => name);
if (missingRequiredReports.length) {
  add(warnings, 'not_ready_to_request_paula_go_missing_reports', { missingRequiredReports });
}

if (!paulaGoFlag) {
  add(warnings, 'paula_go_not_requested_flag_absent');
}

const readyToAskPaulaGo = !hardFails.length && !missingRequiredReports.length;
const canSwitchRuntimeNow = readyToAskPaulaGo && paulaGoFlag;
const report = {
  gate: 'cxorbia-tya-runtime-dev-preview-go-nogo',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length
    ? 'NO_GO_REQUEST_RUNTIME_DEV_PREVIEW'
    : readyToAskPaulaGo
      ? 'GO_READY_TO_REQUEST_PAULA_RUNTIME_DEV_PREVIEW'
      : 'GO_GATE_READY_REPORTS_PENDING_NO_RUNTIME',
  runtimeDecision: canSwitchRuntimeNow
    ? 'ELIGIBLE_TO_PREPARE_RUNTIME_SWITCH_AFTER_EXPLICIT_PAULA_GO_RECONFIRMATION'
    : 'DO_NOT_SWITCH_RUNTIME',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_DEV_RUNTIME_PREVIEW_SMOKE_AND_PAULA_PRODUCTION_GO',
  readyToAskPaulaGo,
  paulaGoFlag,
  canSwitchRuntimeNow,
  missingRequiredReports,
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    oldDatabaseConnected: false,
    makeDispatch: false,
    geminiPublish: false,
    paymentExecution: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  hardFails,
  warnings,
  info
};

if (outDir) {
  const out = abs(outDir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'runtime-dev-preview-go-nogo-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA runtime DEV preview GO/NO-GO report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Runtime decision: ${report.runtimeDecision}`,
    `Production decision: ${report.productionDecision}`,
    `Ready to ask Paula GO: ${report.readyToAskPaulaGo}`,
    `Paula GO flag: ${report.paulaGoFlag}`,
    `Can switch runtime now: ${report.canSwitchRuntimeNow}`,
    '',
    '## Missing reports',
    ...(missingRequiredReports.length ? missingRequiredReports.map(x => `- ${x}`) : ['- none']),
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.id ? ` · ${x.id}` : ''}${x.expected ? ` · expected=${x.expected}` : ''}${x.actual ? ` · actual=${x.actual}` : ''}${x.level ? ` · ${x.level}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.id ? ` · ${x.id}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Runtime not connected',
    '- Frontend not modified',
    '- Modules not modified',
    '- No Firestore writes',
    '- No imports',
    '- No HR writes',
    '- No old database connected',
    '- No Make/Gemini/payment execution',
    '- No deploy',
    '- No production',
    '- No raw PII',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(out, 'runtime-dev-preview-go-nogo-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
