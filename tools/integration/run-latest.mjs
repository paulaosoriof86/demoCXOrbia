#!/usr/bin/env node
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readJson } from './lib.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const incoming = resolve(repoRoot, 'incoming');

function newestPlan() {
  if (!existsSync(incoming)) throw new Error(`No existe ${incoming}`);
  const plans = readdirSync(incoming)
    .filter((name) => /^EMPALME-.*\.json$/i.test(name))
    .map((name) => ({ path: join(incoming, name), mtime: statSync(join(incoming, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!plans.length) throw new Error('No hay plan EMPALME-*.json en incoming/');
  return plans[0].path;
}

function run() {
  const planPath = newestPlan();
  const plan = readJson(planPath);
  if (!plan.candidateFile) throw new Error('El plan no contiene candidateFile');
  const candidatePath = resolve(incoming, plan.candidateFile);
  const tenantPolicy = resolve(repoRoot, plan.tenantPolicy || 'tools/integration/policies/tenants/tya.json');
  const productPolicy = resolve(repoRoot, 'tools/integration/policies/cxorbia-product.json');
  const common = ['--repo', repoRoot, '--candidate', candidatePath, '--plan', planPath, '--policy', productPolicy, '--tenant-policy', tenantPolicy];

  const preflight = spawnSync(process.execPath, [resolve(scriptDir, 'workspace-preflight.mjs'), ...common], { cwd: repoRoot, stdio: 'inherit' });
  if (preflight.status !== 0) process.exit(preflight.status || 2);

  const apply = spawnSync(process.execPath, [resolve(scriptDir, 'empalme-candidate.mjs'), ...common, '--apply', '--commit', '--push'], { cwd: repoRoot, stdio: 'inherit' });
  process.exit(apply.status || 0);
}

try { run(); }
catch (error) {
  process.stderr.write(`RUN_LATEST_FAIL: ${String(error.stack || error.message || error)}\n`);
  process.exitCode = 1;
}
