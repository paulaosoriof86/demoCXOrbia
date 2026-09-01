#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, '_diagnosticos', 'tya-safe-audit-bundle');
fs.mkdirSync(outDir, { recursive: true });

const commands = [
  ['node', ['tools/quality/tya-p0-operational-copy-scanner.mjs']],
  ['node', ['tools/migration/tya-local-readiness-preflight.mjs']],
  ['node', ['tools/migration/tya-local-readiness-consistency-check.mjs']]
];

const results = [];
for (const [cmd, args] of commands) {
  const startedAt = new Date().toISOString();
  const run = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: false });
  results.push({
    command: [cmd, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: run.status,
    stdout: (run.stdout || '').slice(0, 8000),
    stderr: (run.stderr || '').slice(0, 8000)
  });
}

const status = results.some((r) => r.exitCode && r.exitCode !== 0) ? 'review_required' : 'ok';
const report = { generatedAt: new Date().toISOString(), status, results };
fs.writeFileSync(path.join(outDir, 'safe-audit-bundle.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, 'safe-audit-bundle.md'), [
  '# Safe audit bundle',
  '',
  `Generated: ${report.generatedAt}`,
  `Status: ${status}`,
  '',
  ...results.map((r) => `## ${r.command}\n\nExit code: ${r.exitCode}\n`),
  '',
  'This bundle is local-only and does not deploy, merge, import real data, or call real providers.'
].join('\n'));

console.log(JSON.stringify({ status, outDir: path.relative(root, outDir), checks: results.length }, null, 2));
if (status === 'review_required') process.exitCode = 2;
