#!/usr/bin/env node
/* CXOrbia TyA - Local real-data preview preflight
   Safe orchestrator. No HR calls, no Firestore writes, no imports, no deploy.

   Purpose: reduce manual work when Paula has a computer by running the safe chain:
   locator -> Level 0 generator -> optional Level 1 generator -> optional Level 2 generator -> validators.
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
function arg(name) { const idx = args.indexOf(name); return idx >= 0 ? args[idx + 1] : null; }
const inputPath = arg('--input');
const shoppersPath = arg('--shoppers');
const certificationsPath = arg('--certifications');
const liquidationsPath = arg('--liquidations');
const outDir = arg('--out') || '.tmp/tya-local-realdata-preview-preflight';
const failFast = args.includes('--fail-fast');

const steps = [];
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function exists(relOrAbs) { return fs.existsSync(abs(relOrAbs)); }
function ensureDir(relOrAbs) { fs.mkdirSync(abs(relOrAbs), { recursive: true }); }
function writeJson(relOrAbs, name, value) { ensureDir(relOrAbs); fs.writeFileSync(path.join(abs(relOrAbs), name), JSON.stringify(value, null, 2), 'utf8'); }
function runStep(name, commandArgs, options = {}) {
  const start = new Date().toISOString();
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20
  });
  const step = {
    name,
    startedAt: start,
    finishedAt: new Date().toISOString(),
    command: ['node', ...commandArgs].join(' '),
    status: result.status,
    signal: result.signal,
    ok: options.allowFailure ? true : result.status === 0,
    stdoutTail: (result.stdout || '').slice(-4000),
    stderrTail: (result.stderr || '').slice(-4000)
  };
  steps.push(step);
  if (result.status !== 0 && !options.allowFailure) {
    add(hardFails, 'step_failed', { step: name, status: result.status });
    if (failFast) throw new Error(`Step failed: ${name}`);
  }
  if (result.status !== 0 && options.allowFailure) add(warnings, 'step_warning_nonzero_allowed', { step: name, status: result.status });
  return step;
}

const requiredScripts = [
  'tools/contracts/tya-level1-sanitized-visit-output-locator.mjs',
  'tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs',
  'tools/contracts/tya-minimal-sanitized-input-validate.mjs',
  'tools/contracts/tya-level1-sanitized-visits-from-output.mjs',
  'tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs',
  'tools/contracts/tya-level2-sanitized-operational-validate.mjs',
  'tools/contracts/tya-cxdata-realdata-preview-bridge-validate.mjs',
  'tools/contracts/tya-cxdata-runtime-switch-gate-validate.mjs',
  'tools/contracts/tya-cxdata-runtime-switch-smoke-plan-validate.mjs'
];

for (const script of requiredScripts) {
  if (!exists(script)) add(hardFails, 'required_script_missing', { script });
}

const safeOut = outDir;
const locatorOut = path.join(safeOut, 'locator');
const level0Out = path.join(safeOut, 'level0');
const level1Out = path.join(safeOut, 'level1');
const level2Out = path.join(safeOut, 'level2');
const validationsOut = path.join(safeOut, 'validations');

try {
  if (!hardFails.length) {
    runStep('locate-level1-candidates', [
      'tools/contracts/tya-level1-sanitized-visit-output-locator.mjs',
      '--out', locatorOut,
      ...(inputPath ? ['--extra', inputPath] : [])
    ], { allowFailure: true });

    runStep('generate-level0-from-manifest', [
      'tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs',
      '--out', level0Out
    ], { allowFailure: false });

    const level0Payload = path.join(level0Out, 'tya-minimal-sanitized-input-level0.json');
    if (exists(level0Payload)) {
      runStep('validate-level0-minimal-input', [
        'tools/contracts/tya-minimal-sanitized-input-validate.mjs',
        '--input', level0Payload,
        '--out', path.join(validationsOut, 'level0')
      ], { allowFailure: false });
    } else {
      add(hardFails, 'level0_payload_not_generated', { file: level0Payload });
    }

    let level1Payload = path.join(level1Out, 'tya-minimal-sanitized-input-level1.json');
    if (inputPath) {
      runStep('generate-level1-from-input', [
        'tools/contracts/tya-level1-sanitized-visits-from-output.mjs',
        '--input', inputPath,
        '--level0', level0Payload,
        '--out', level1Out
      ], { allowFailure: true });

      if (exists(level1Payload)) {
        runStep('validate-level1-minimal-input', [
          'tools/contracts/tya-minimal-sanitized-input-validate.mjs',
          '--input', level1Payload,
          '--out', path.join(validationsOut, 'level1')
        ], { allowFailure: true });
      } else {
        add(warnings, 'level1_payload_not_generated', { file: level1Payload });
      }
    } else {
      add(info, 'no_input_path_provided_level1_skipped');
    }

    const level2Payload = path.join(level2Out, 'tya-minimal-sanitized-input-level2.json');
    if (exists(level1Payload)) {
      runStep('generate-level2-from-level1-and-optional-inputs', [
        'tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs',
        '--level1', level1Payload,
        '--out', level2Out,
        ...(shoppersPath ? ['--shoppers', shoppersPath] : []),
        ...(certificationsPath ? ['--certifications', certificationsPath] : []),
        ...(liquidationsPath ? ['--liquidations', liquidationsPath] : [])
      ], { allowFailure: true });

      if (exists(level2Payload)) {
        runStep('validate-level2-sanitized-operational', [
          'tools/contracts/tya-level2-sanitized-operational-validate.mjs',
          '--input', level2Payload,
          '--out', path.join(validationsOut, 'level2')
        ], { allowFailure: true });
      } else {
        add(warnings, 'level2_payload_not_generated', { file: level2Payload });
      }
    } else {
      add(info, 'level2_skipped_no_level1_payload');
    }

    runStep('validate-realdata-preview-bridge', [
      'tools/contracts/tya-cxdata-realdata-preview-bridge-validate.mjs',
      '--out', path.join(validationsOut, 'bridge')
    ], { allowFailure: true });

    runStep('validate-runtime-switch-gate-no-switch', [
      'tools/contracts/tya-cxdata-runtime-switch-gate-validate.mjs',
      '--out', path.join(validationsOut, 'runtime-switch')
    ], { allowFailure: true });

    runStep('validate-rollback-smoke-plan', [
      'tools/contracts/tya-cxdata-runtime-switch-smoke-plan-validate.mjs',
      '--out', path.join(validationsOut, 'rollback-smoke')
    ], { allowFailure: true });
  }
} catch (err) {
  add(hardFails, 'preflight_exception', { error: String(err.message || err) });
}

const level1Exists = exists(path.join(level1Out, 'tya-minimal-sanitized-input-level1.json'));
const level2Exists = exists(path.join(level2Out, 'tya-minimal-sanitized-input-level2.json'));
const report = {
  gate: 'cxorbia-tya-local-realdata-preview-preflight',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LOCAL_REALDATA_PREFLIGHT' : 'GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_LEVEL2_VALIDATED_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  inputPath: inputPath || null,
  optionalInputs: {
    shoppersPath: shoppersPath || null,
    certificationsPath: certificationsPath || null,
    liquidationsPath: liquidationsPath || null
  },
  outputDir: safeOut,
  payloads: {
    level0: exists(path.join(level0Out, 'tya-minimal-sanitized-input-level0.json')),
    level1: level1Exists,
    level2: level2Exists
  },
  counts: {
    steps: steps.length,
    failedSteps: steps.filter(s => !s.ok).length,
    warnings: warnings.length,
    hardFails: hardFails.length
  },
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
  nextStep: level2Exists
    ? 'Review Level 2 validation. If clean, prepare DEV runtime switch request with Paula GO; do not switch automatically.'
    : level1Exists
      ? 'Review Level 1 and Level 2 warnings. Add sanitized shoppers/certifications/liquidations only if available; do not request HR again yet.'
      : 'Run again with --input pointing to a sanitized local HR output if locator finds one. Do not request HR again yet.',
  hardFails,
  warnings,
  info,
  steps
};

writeJson(safeOut, 'local-realdata-preview-preflight-report.json', report);
const md = [
  '# CXOrbia TyA local real-data preview preflight',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Production decision: ${report.productionDecision}`,
  `Input path: ${inputPath || 'none'}`,
  `Shoppers input: ${shoppersPath || 'none'}`,
  `Certifications input: ${certificationsPath || 'none'}`,
  `Liquidations input: ${liquidationsPath || 'none'}`,
  `Output dir: ${safeOut}`,
  '',
  '## Payloads',
  `- Level 0: ${report.payloads.level0}`,
  `- Level 1: ${report.payloads.level1}`,
  `- Level 2: ${report.payloads.level2}`,
  '',
  '## Counts',
  `- Steps: ${report.counts.steps}`,
  `- Failed steps: ${report.counts.failedSteps}`,
  `- Warnings: ${report.counts.warnings}`,
  `- Hard fails: ${report.counts.hardFails}`,
  '',
  '## Steps',
  ...steps.map(s => `- ${s.name}: status=${s.status} ok=${s.ok}`),
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
  ''
].join('\n');
fs.writeFileSync(path.join(abs(safeOut), 'local-realdata-preview-preflight-report.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
