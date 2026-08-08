#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((token) => token.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return fallback;
}

const manifest = arg('manifest', 'tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json');
const outputDir = arg('outputDir', '_diagnosticos/tya-release-readiness');
const prototypeP0Status = arg('prototypeP0Status', 'pending');
const executeValidators = process.argv.includes('--executeValidators');
const mode = executeValidators ? 'execute_preview' : 'structure_preview';
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

function rel(filePath) { return path.relative(root, filePath); }
function ensureFile(filePath) {
  const resolved = path.join(root, filePath);
  if (!fs.existsSync(resolved)) throw new Error(`Missing required file: ${filePath}`);
}
function output(name) { return path.join(root, outputDir, `${name}-${mode}-${stamp}`); }
function run(label, args, outputPath, allowBlocked = false) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 45000 });
  const body = `${result.stdout || ''}${result.stderr || ''}`;
  if (outputPath) fs.writeFileSync(outputPath, body, 'utf8');
  if (result.status !== 0 && !(allowBlocked && result.status === 2)) {
    throw new Error(`${label} failed with code ${result.status}. See ${outputPath ? rel(outputPath) : 'stdout'}`);
  }
  return { label, code: result.status || 0, output: outputPath ? rel(outputPath) : null };
}

try {
  for (const filePath of [
    'app/contracts/phase-a-local-readiness-runbook.tya.contract.json',
    'tools/migration/tya-synthetic-input-pack-preview-runner.mjs',
    'tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs',
    'tools/migration/tya-readiness-map-to-release-snapshot-preview-bridge.mjs',
    'tools/migration/tya-release-readiness-snapshot-preview-validator.mjs',
    'tools/migration/tya-release-readiness-sanitized-report.mjs',
    'tools/migration/tya-controlled-production-matrix-preview.mjs',
    manifest
  ]) ensureFile(filePath);

  fs.mkdirSync(path.join(root, outputDir), { recursive: true });

  const runnerOutput = output('01-synthetic-pack-runner') + '.json';
  const mapOutput = output('02-synthetic-pack-readiness-map') + '.json';
  const snapshotInput = output('03-release-readiness-snapshot-input') + '.json';
  const snapshotReport = output('04-release-readiness-snapshot-report') + '.json';
  const sanitizedMd = output('05-release-readiness-sanitized-report') + '.md';
  const sanitizedJson = output('05b-release-readiness-sanitized-summary') + '.json';
  const matrixMd = output('06-controlled-production-matrix') + '.md';
  const matrixJson = output('06b-controlled-production-matrix') + '.json';

  const steps = [];
  const runnerArgs = ['tools/migration/tya-synthetic-input-pack-preview-runner.mjs', '--input', manifest];
  if (executeValidators) runnerArgs.push('--execute');
  steps.push(run('01 synthetic pack runner', runnerArgs, runnerOutput));
  steps.push(run('02 readiness map', ['tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs', '--input', rel(runnerOutput), '--output', rel(mapOutput)], null, true));
  steps.push(run('03 snapshot bridge', ['tools/migration/tya-readiness-map-to-release-snapshot-preview-bridge.mjs', '--input', rel(mapOutput), '--output', rel(snapshotInput), '--prototypeP0Status', prototypeP0Status], null));
  steps.push(run('04 snapshot validator', ['tools/migration/tya-release-readiness-snapshot-preview-validator.mjs', '--input', rel(snapshotInput)], snapshotReport));
  steps.push(run('05 sanitized markdown', ['tools/migration/tya-release-readiness-sanitized-report.mjs', '--input', rel(snapshotReport), '--output', rel(sanitizedMd), '--format', 'markdown'], null));
  steps.push(run('05b sanitized json', ['tools/migration/tya-release-readiness-sanitized-report.mjs', '--input', rel(snapshotReport), '--output', rel(sanitizedJson), '--format', 'json_summary'], null));
  steps.push(run('06 matrix markdown', ['tools/migration/tya-controlled-production-matrix-preview.mjs', '--input', rel(sanitizedJson), '--output', rel(matrixMd), '--format', 'markdown'], null, true));
  steps.push(run('06b matrix json', ['tools/migration/tya-controlled-production-matrix-preview.mjs', '--input', rel(sanitizedJson), '--output', rel(matrixJson), '--format', 'json'], null, true));

  const index = {
    runbook: 'tya-phase-a-local-readiness-runbook',
    generatedAt: new Date().toISOString(),
    mode,
    prototypeP0Status,
    productionAllowed: false,
    deployAllowed: false,
    mergeAllowed: false,
    importRealDataAllowed: false,
    steps,
    outputs: { runnerOutput: rel(runnerOutput), mapOutput: rel(mapOutput), snapshotInput: rel(snapshotInput), snapshotReport: rel(snapshotReport), sanitizedMd: rel(sanitizedMd), sanitizedJson: rel(sanitizedJson), matrixMd: rel(matrixMd), matrixJson: rel(matrixJson) },
    nextSafeSteps: ['Review sanitized report and matrix before any sharing.', 'Keep source lock blocked while frontend P0 remains pending.', 'Do not deploy, merge, import, write or activate providers from this runbook.']
  };
  const indexPath = output('00-phase-a-local-readiness-runbook-index') + '.json';
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: 'phase_a_local_readiness_runbook_complete', index: rel(indexPath), outputs: index.outputs }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
