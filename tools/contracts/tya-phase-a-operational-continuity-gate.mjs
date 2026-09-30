#!/usr/bin/env node
/* CXOrbia TyA - Phase A operational continuity gate
   Safe validator. No provider calls, no database writes, no imports, no deploy, no runtime switch.

   Purpose: keep Phase A moving forward without repeating Level 0/1 and without allowing
   synthetic fixtures or derived tmp outputs to be treated as real TyA evidence.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const contractPath = 'backend/contracts/phase-a-operational-continuity-gate-v1.json';

const hardFails = [];
const warnings = [];
const info = [];

function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(rel) { return path.join(root, rel); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }
function hasAny(text, markers) { return markers.filter((marker) => text.includes(marker)); }

let contract = null;
try {
  contract = readJson(contractPath);
  add(info, 'contract_loaded', { file: contractPath });
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

if (contract) {
  if (contract.mode !== 'source_safe_contract_only') {
    add(hardFails, 'contract_mode_not_source_safe', { mode: contract.mode });
  }
  if (!contract.nonReversionLocks?.level0ProjectPeriodReadinessRecognized) {
    add(hardFails, 'level0_non_reversion_lock_missing');
  }
  if (!contract.nonReversionLocks?.level1PreviouslyWorkedNoRestart) {
    add(hardFails, 'level1_non_reversion_lock_missing');
  }
  if (!contract.nonReversionLocks?.doNotUseSyntheticFixturesAsRealEvidence) {
    add(hardFails, 'synthetic_fixture_guard_missing');
  }
  if (!contract.nonReversionLocks?.doNotUseDerivedTmpOutputsAsOriginalEvidence) {
    add(hardFails, 'derived_tmp_guard_missing');
  }

  for (const block of contract.requiredSourceSafeBlocks || []) {
    if (block.required && !exists(block.evidenceFile)) {
      add(hardFails, 'required_evidence_file_missing', { blockId: block.blockId, file: block.evidenceFile });
    } else if (block.required) {
      add(info, 'required_evidence_file_present', { blockId: block.blockId, file: block.evidenceFile });
    }
    if (block.runner && !exists(block.runner)) {
      add(hardFails, 'required_runner_missing', { blockId: block.blockId, runner: block.runner });
    } else if (block.runner) {
      add(info, 'required_runner_present', { blockId: block.blockId, runner: block.runner });
    }
  }

  const safe = contract.safeStateExpected || {};
  for (const [key, expected] of Object.entries(safe)) {
    if (expected !== false) add(hardFails, 'safe_state_expected_must_be_false', { key, expected });
  }
}

const protectedUiPaths = ['app/modules/', 'app/core/'];
const disallowedRuntimeClaims = [
  'production ready',
  'produccion lista',
  'runtime conectado',
  'Firestore conectado',
  'HR sincronizada',
  'pago real ejecutado',
  'Make activo',
  'Gemini activo'
];

const checkpointPath = 'app/docs/CHECKPOINT-OPERATIVO-REALDATA-PREVIEW-TYA-20260709.md';
if (exists(checkpointPath)) {
  const checkpoint = read(checkpointPath);
  const requiredPhrases = [
    'Level 0 queda superado',
    'Level 1 ya fue trabajado',
    'No reiniciar Level 0/1',
    'fixture',
    'output derivado',
    'fuente original real/sanitizada'
  ];
  const missing = requiredPhrases.filter((phrase) => !checkpoint.includes(phrase));
  if (missing.length) add(warnings, 'checkpoint_missing_some_no_reprocess_phrases', { file: checkpointPath, missing });
  const forbidden = hasAny(checkpoint, disallowedRuntimeClaims);
  if (forbidden.length) add(hardFails, 'checkpoint_contains_disallowed_runtime_claims', { file: checkpointPath, forbidden });
} else {
  add(hardFails, 'operational_checkpoint_missing', { file: checkpointPath });
}

const noReversionPath = 'app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md';
if (exists(noReversionPath)) {
  const noRev = read(noReversionPath);
  for (const phrase of ['No reabrir desde cero Level 0', 'Level 1 ya habia sido trabajado', 'No volver a aceptar']) {
    if (!noRev.includes(phrase)) add(warnings, 'no_reversion_checkpoint_phrase_missing', { file: noReversionPath, phrase });
  }
} else {
  add(hardFails, 'no_reversion_checkpoint_missing', { file: noReversionPath });
}

const docsToScan = [
  'app/docs/CHECKPOINT-OPERATIVO-REALDATA-PREVIEW-TYA-20260709.md',
  'app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md',
  'app/docs/HR-SOURCE-PRIVATE-FULL-FLOW-20260703.md'
];
for (const file of docsToScan) {
  if (!exists(file)) continue;
  const text = read(file);
  const forbiddenSensitive = hasAny(text, [
    'rawDpi', 'rawBankAccount', 'rawPhone', 'rawEmail', 'serviceAccountJson', 'makeWebhookUrl', 'geminiApiKey'
  ]);
  if (forbiddenSensitive.length) add(hardFails, 'doc_contains_forbidden_sensitive_marker', { file, forbiddenSensitive });
}

const report = {
  gate: 'cxorbia-tya-phase-a-operational-continuity-gate',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_PHASE_A_CONTINUITY_BLOCKED' : 'GO_PHASE_A_CONTINUE_NO_RUNTIME',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_DEV_GO_AND_FINAL_GATES',
  counts: {
    hardFails: hardFails.length,
    warnings: warnings.length,
    info: info.length,
    requiredBlocks: contract?.requiredSourceSafeBlocks?.length || 0
  },
  nextStep: hardFails.length
    ? 'Fix only root cause. Do not repeat Level 0/1, do not deploy, do not import, do not switch runtime.'
    : 'Continue Phase A with HR source-safe/full-flow, assignment sync conflict policy, certification preservation and June liquidation/payment control. No runtime switch yet.',
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
  fs.writeFileSync(path.join(target, 'phase-a-operational-continuity-gate-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A operational continuity gate',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    '',
    '## Counts',
    `- Hard fails: ${report.counts.hardFails}`,
    `- Warnings: ${report.counts.warnings}`,
    `- Required blocks: ${report.counts.requiredBlocks}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.blockId ? ` · ${x.blockId}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
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
  fs.writeFileSync(path.join(target, 'phase-a-operational-continuity-gate-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
