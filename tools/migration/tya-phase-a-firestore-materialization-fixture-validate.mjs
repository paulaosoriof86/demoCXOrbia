#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const out = path.resolve(repo, '.tmp/firestore-materialization-fixture');
fs.rmSync(out, { recursive: true, force: true });
const run = spawnSync(process.execPath, [
  path.join(here, 'tya-phase-a-build-firestore-materialization-plan.mjs'),
  '--hr', path.join(here, 'fixtures/phase-a-materialization-source-safe-small.js'),
  '--financial', path.join(here, 'fixtures/phase-a-materialization-financial-source-safe-small.js'),
  '--certifications', path.join(here, 'fixtures/phase-a-materialization-cert-source-safe-small.js'),
  '--out', out
], { encoding: 'utf8' });
if (run.status !== 0) {
  console.error(run.stdout);
  console.error(run.stderr);
  process.exit(run.status || 1);
}
const plan = JSON.parse(fs.readFileSync(path.join(out, 'firestore-materialization-plan.json'), 'utf8'));
const expected = { tenant: 1, project: 1, hrImport: 1, period: 1, shopper: 1, visit: 1, liquidation: 1 };
const blockers = [];
for (const [domain, count] of Object.entries(expected)) {
  if (plan.counts.byDomain[domain] !== count) blockers.push(`${domain}:${plan.counts.byDomain[domain]}/${count}`);
}
if (plan.operations.length !== 7) blockers.push(`operations:${plan.operations.length}/7`);
if (plan.operations.some(operation => operation.data?.paid === true || operation.data?.paymentState === 'paid')) blockers.push('unexpected_paid');
if (plan.operations.some(operation => operation.data?.lotEligible === true)) blockers.push('unexpected_lot_eligible');
const result = {
  ok: blockers.length === 0,
  counts: plan.counts,
  blockers,
  writes: false,
  imported: false,
  production: false
};
fs.writeFileSync(path.join(out, 'fixture-verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
