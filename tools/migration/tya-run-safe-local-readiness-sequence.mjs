import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-safe-local-readiness-sequence');
fs.mkdirSync(outDir, { recursive: true });

const steps = [
  ['canonical', ['node', ['tools/migration/tya-build-canonical-staging-plan.mjs']]],
  ['sanitized', ['node', ['tools/migration/tya-build-sanitized-dev-candidate.mjs']]],
  ['shopperIdentity', ['node', ['tools/migration/tya-build-shopper-identity-review.mjs']]],
  ['legacyComms', ['node', ['tools/migration/tya-build-legacy-communications-review.mjs']]],
  ['operativeCandidates', ['node', ['tools/migration/tya-build-liq-candidate-review.mjs']]],
  ['readiness', ['node', ['tools/migration/tya-build-readiness-consolidated.mjs']]]
];

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'safe-local-readiness-sequence',
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, executeAllowed: false },
  repoRoot,
  steps: []
};

for(const [name, [cmd, args]] of steps){
  const startedAt = new Date().toISOString();
  const run = spawnSync(cmd, args, { cwd: repoRoot, encoding: 'utf8', shell: false });
  const step = {
    name,
    command: [cmd, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    status: run.status === 0 ? 'ok' : 'failed',
    exitCode: run.status,
    stdoutTail: String(run.stdout || '').slice(-4000),
    stderrTail: String(run.stderr || '').slice(-4000)
  };
  result.steps.push(step);
  if(run.status !== 0) break;
}

result.status = result.steps.every(s => s.status === 'ok') ? 'ok' : 'failed';
fs.writeFileSync(path.join(outDir, 'safeLocalReadinessSequence.json'), JSON.stringify(result, null, 2), 'utf8');

const lines = ['# TyA safe local readiness sequence', '', `Generated at: ${result.generatedAt}`, '', '## Safety', '- Firestore writes: 0', '- Imports executed: 0', '- Deploy: 0', '- Production: 0', '- executeAllowed: false', '', `Status: ${result.status}`, '', '## Steps', '| Step | Status | Exit |', '|---|---|---:|'];
for(const s of result.steps) lines.push(`| ${s.name} | ${s.status} | ${s.exitCode ?? '-'} |`);
lines.push('', `Report dir: ${outDir}`);
fs.writeFileSync(path.join(outDir, 'safeLocalReadinessSequence.md'), lines.join('\n'), 'utf8');
console.log(lines.join('\n'));
