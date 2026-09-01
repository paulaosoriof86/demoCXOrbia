#!/usr/bin/env node
/* CXOrbia TyA - Phase A runtime DEV GO request gate
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: decide if it is valid to ASK Paula for explicit GO for a separate runtime DEV
   preview step. This tool never performs the runtime switch.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const paulaGoIdx = args.indexOf('--paula-go');
const paulaGo = paulaGoIdx >= 0 ? args[paulaGoIdx + 1] : '';
const contractPath = 'backend/contracts/phase-a-runtime-dev-go-request-gate-v1.json';

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
  if (contract.mode !== 'request_gate_only_no_runtime_switch') add(hardFails, 'contract_mode_must_be_request_only_no_runtime', { mode: contract.mode });

  const principles = contract.requestPrinciples || {};
  for (const principle of [
    'requestOnly',
    'paulaExplicitGoRequired',
    'goCannotBeInferredFromGreenValidators',
    'allPriorGatesMustBeClean',
    'doNotRepeatLevel0Level1',
    'noSyntheticFixtureAsRealEvidence',
    'noDerivedTmpOutputAsOriginalEvidence',
    'noProtectedUiChangesFromBackend',
    'noWritesBeforeRuntimeSwitchGate',
    'rollbackPlanRequired',
    'manualSmokeRequiredAfterDevRuntimeOnly'
  ]) {
    if (principles[principle] !== true) add(hardFails, 'required_request_principle_missing_or_false', { principle });
  }
  if (principles.runtimeSwitchAllowedByThisGate !== false) add(hardFails, 'runtime_switch_must_not_be_allowed_by_request_gate');

  for (const check of contract.requiredBeforeRequest || []) {
    if (check.required && check.file && !exists(check.file)) add(hardFails, 'required_file_missing_before_request', { checkId: check.checkId, file: check.file });
    if (check.required && check.validator && !exists(check.validator)) add(hardFails, 'required_validator_missing_before_request', { checkId: check.checkId, validator: check.validator });
    if (!check.required && check.validator && !exists(check.validator)) add(warnings, 'optional_validator_missing_fallback_required', { checkId: check.checkId, validator: check.validator, fallbackAllowed: check.fallbackAllowed });
    if (check.file && exists(check.file)) add(info, 'required_file_present_before_request', { checkId: check.checkId, file: check.file });
    if (check.validator && exists(check.validator)) add(info, 'validator_present_before_request', { checkId: check.checkId, validator: check.validator });
  }

  const safe = contract.safeStateExpected || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_must_be_false', { key, expected });
  }

  const outputs = new Set(contract.requestOutputsExpected || []);
  for (const expected of ['clear summary of clean gates', 'explicit list of remaining blocks', 'safe state confirmation', 'rollback plan reference', 'manual smoke checklist reference', 'exact wording asking Paula for GO', 'statement that no runtime switch occurs automatically']) {
    if (!outputs.has(expected)) add(hardFails, 'request_output_expectation_missing', { expected });
  }
}

const requiredPhrase = contract?.paulaGoPhraseRequired || 'Autorizo GO runtime DEV preview Phase A TyA';
let goStatus = 'not_requested';
if (paulaGo) {
  if (paulaGo.trim() === requiredPhrase) {
    goStatus = 'exact_go_recorded';
    add(info, 'paula_go_phrase_exact_match');
  } else {
    goStatus = 'ambiguous_or_invalid_go_phrase';
    add(hardFails, 'paula_go_phrase_ambiguous_or_invalid', { requiredPhrase });
  }
}

const verdict = hardFails.length
  ? 'NO_GO_RUNTIME_DEV_REQUEST_BLOCKED'
  : goStatus === 'exact_go_recorded'
    ? 'PAULA_GO_RECORDED_READY_FOR_SEPARATE_RUNTIME_SWITCH_PR'
    : 'READY_TO_ASK_PAULA_GO_NO_RUNTIME_SWITCH';

const report = {
  gate: 'cxorbia-tya-phase-a-runtime-dev-go-request-gate',
  generatedAt: new Date().toISOString(),
  verdict,
  productionDecision: 'BLOCK_PRODUCTION_AND_BLOCK_RUNTIME_SWITCH_IN_THIS_GATE',
  paulaGoStatus: goStatus,
  requiredPaulaGoPhrase: requiredPhrase,
  counts: {
    requiredChecks: contract?.requiredBeforeRequest?.length || 0,
    hardStops: contract?.hardStops?.length || 0,
    hardFails: hardFails.length,
    warnings: warnings.length,
    info: info.length
  },
  requestText: hardFails.length ? null : `Para autorizar el siguiente paso separado, responde exactamente: ${requiredPhrase}`,
  nextStep: hardFails.length
    ? 'Fix only root cause. Do not ask GO, do not switch runtime, do not write, do not import, do not deploy.'
    : goStatus === 'exact_go_recorded'
      ? 'Prepare a separate runtime DEV switch PR/gate. This request gate still did not switch runtime.'
      : 'Ask Paula for exact GO phrase. Do not switch runtime automatically.',
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
  fs.writeFileSync(path.join(target, 'phase-a-runtime-dev-go-request-gate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A runtime DEV GO request gate',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Paula GO status: ${report.paulaGoStatus}`,
    '',
    '## Counts',
    `- Required checks: ${report.counts.requiredChecks}`,
    `- Hard stops: ${report.counts.hardStops}`,
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.checkId ? ` · ${x.checkId}` : ''}${x.file ? ` · ${x.file}` : ''}${x.validator ? ` · ${x.validator}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.checkId ? ` · ${x.checkId}` : ''}${x.validator ? ` · ${x.validator}` : ''}`) : ['- none']),
    '',
    '## Request text',
    report.requestText ? `- ${report.requestText}` : '- blocked',
    '',
    '## Next step',
    `- ${report.nextStep}`,
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
    '- No Make/Gemini live',
    '- No real payments',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(target, 'phase-a-runtime-dev-go-request-gate-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
