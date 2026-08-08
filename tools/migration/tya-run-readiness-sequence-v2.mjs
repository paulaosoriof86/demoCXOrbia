import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-readiness-sequence-v2');
fs.mkdirSync(outDir, { recursive: true });

const scripts = [
  'tools/migration/tya-build-canonical-staging-plan.mjs',
  'tools/migration/tya-build-sanitized-dev-candidate.mjs',
  'tools/migration/tya-build-shopper-identity-review.mjs',
  'tools/migration/tya-build-legacy-communications-review.mjs',
  'tools/migration/tya-build-liq-candidate-review.mjs',
  'tools/migration/tya-build-safe-write-plan-from-candidate.mjs',
  'tools/migration/tya-build-dev-import-dry-run-package.mjs',
  'tools/migration/tya-build-readiness-consolidated.mjs'
];

const result = { generatedAt: new Date().toISOString(), status: 'pending', steps: [] };
for(const script of scripts){
  const run = spawnSync('node', [script], { cwd: repoRoot, encoding: 'utf8' });
  result.steps.push({ script, status: run.status === 0 ? 'ok' : 'failed', exitCode: run.status, stdoutTail: String(run.stdout || '').slice(-2000), stderrTail: String(run.stderr || '').slice(-2000) });
  if(run.status !== 0) break;
}
result.status = result.steps.every(s => s.status === 'ok') ? 'ok' : 'failed';
fs.writeFileSync(path.join(outDir, 'readinessSequenceV2.json'), JSON.stringify(result, null, 2), 'utf8');
const lines = ['# TyA readiness sequence v2', '', `Generated at: ${result.generatedAt}`, '', `Status: ${result.status}`, '', '| Script | Status | Exit |', '|---|---|---:|'];
for(const s of result.steps) lines.push(`| ${s.script} | ${s.status} | ${s.exitCode ?? '-'} |`);
fs.writeFileSync(path.join(outDir, 'readinessSequenceV2.md'), lines.join('\n'), 'utf8');
console.log(lines.join('\n'));
