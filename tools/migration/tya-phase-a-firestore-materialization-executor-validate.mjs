#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : fallback; };
const outDir = path.resolve(repo, arg('--out', '.tmp/firestore-materialization-executor-validation'));
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cxorbia-executor-'));
const plan = {
  schemaVersion: '1.0.0', planId: 'fixture_plan_001', planSha256: 'fixture_sha_001', mode: 'dry_run', writes: false, imported: false, production: false,
  safeState: { writes: false, imported: false, production: false },
  batches: [{ batchId: 'b1', operationCount: 1, operationIds: ['op1'] }],
  operations: [{ operationId: 'op1', operation: 'create', documentPath: 'tenants/t1', precondition: { exists: false }, data: { tenantId: 't1', sourceSafe: true, imported: false, production: false } }]
};
const future = new Date(Date.now() + 3600_000).toISOString();
const attestation = { schemaVersion: '1.0.0', targetType: 'emulator', targetProjectId: 'cxorbia-emulator-fixture', cleanState: true, checkedAt: new Date().toISOString(), checkedBy: 'user:validator', allowedPlanId: plan.planId, allowedPlanSha256: plan.planSha256, writesAuthorized: false, expiresAt: future };
const planPath = path.join(tmp, 'plan.json');
const attPath = path.join(tmp, 'attestation.json');
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
fs.writeFileSync(attPath, JSON.stringify(attestation, null, 2));
const executor = path.join(here, 'tya-phase-a-firestore-materialization-executor.mjs');
const run = (name, args, env = {}) => {
  const reportPath = path.join(outDir, `${name}.json`);
  const cp = spawnSync(process.execPath, [executor, ...args, '--out', reportPath], { cwd: repo, env: { ...process.env, ...env }, encoding: 'utf8' });
  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null;
  return { name, exitCode: cp.status, report };
};
const cases = [];
cases.push(run('preflight-valid', ['--mode', 'preflight', '--plan', planPath, '--attestation', attPath]));
cases.push(run('execute-no-gates', ['--mode', 'execute', '--plan', planPath, '--attestation', attPath]));
const devAtt = { ...attestation, targetType: 'dev_clean', writesAuthorized: true };
const devPath = path.join(tmp, 'dev-attestation.json');
fs.writeFileSync(devPath, JSON.stringify(devAtt, null, 2));
cases.push(run('execute-dev-blocked', ['--mode', 'execute', '--plan', planPath, '--attestation', devPath], { GCLOUD_PROJECT: devAtt.targetProjectId, CXORBIA_ALLOW_EMULATOR_WRITES: 'true', CXORBIA_FIRESTORE_EXECUTION_APPROVAL: `${plan.planId}:${plan.planSha256}` }));
const badPlan = { ...plan, operations: [{ ...plan.operations[0], operation: 'set', precondition: {} }] };
const badPath = path.join(tmp, 'bad-plan.json');
fs.writeFileSync(badPath, JSON.stringify(badPlan, null, 2));
cases.push(run('preflight-tampered-plan', ['--mode', 'preflight', '--plan', badPath, '--attestation', attPath]));
const checks = [
  { name: 'valid_preflight_passes', ok: cases[0].exitCode === 0 && cases[0].report?.ok === true && cases[0].report?.writes === false },
  { name: 'execute_without_gates_blocks', ok: cases[1].exitCode !== 0 && cases[1].report?.ok === false && cases[1].report?.writes === false },
  { name: 'dev_clean_execution_blocked_v1', ok: cases[2].exitCode !== 0 && cases[2].report?.blockers?.includes('execute_target_emulator_only_v1') },
  { name: 'tampered_plan_blocks', ok: cases[3].exitCode !== 0 && cases[3].report?.ok === false },
  { name: 'no_case_wrote', ok: cases.every(item => item.report?.writes === false && item.report?.execution?.createdDocuments === 0) }
];
const result = {
  ok: checks.every(item => item.ok),
  checks,
  cases: cases.map(item => ({ name: item.name, exitCode: item.exitCode, ok: item.report?.ok, blockers: item.report?.blockers, writes: item.report?.writes })),
  safeState: { writes: false, imported: false, production: false }
};
fs.writeFileSync(path.join(outDir, 'executor-validation.json'), JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'executor-validation.md'), `# Firestore materialization executor validation\n\nVerdict: **${result.ok ? 'PASS' : 'HOLD'}**\n\nChecks: ${checks.length}\nWrites: 0\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
