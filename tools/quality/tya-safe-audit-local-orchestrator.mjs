#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, '_diagnosticos', 'tya-safe-audit-local-orchestrator');
fs.mkdirSync(outDir, { recursive: true });

function writeReport(report) {
  fs.writeFileSync(path.join(outDir, 'local-orchestrator-report.json'), JSON.stringify(report, null, 2));
  const lines = [
    '# Safe audit local orchestrator report',
    '',
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    `GO accepted: ${report.goAccepted}`,
    '',
    '## Steps',
    '',
    ...report.steps.map((step) => `- ${step.name}: exit=${step.exitCode}; status=${step.status}`),
    '',
    'This report does not authorize source lock, production, import, deploy, merge, or providers.'
  ];
  fs.writeFileSync(path.join(outDir, 'local-orchestrator-report.md'), lines.join('\n'));
}

const goAccepted = process.env.CXORBIA_LOCAL_GO === 'YES';
if (!goAccepted) {
  const report = {
    generatedAt: new Date().toISOString(),
    status: 'blocked_missing_go',
    goAccepted: false,
    steps: [],
    notes: ['Set CXORBIA_LOCAL_GO=YES only after explicit GO from Paula.']
  };
  writeReport(report);
  console.log(JSON.stringify({ status: report.status, outDir: path.relative(root, outDir) }, null, 2));
  process.exitCode = 2;
} else {
  const commands = [
    { name: 'safe_audit_bundle', cmd: 'node', args: ['tools/quality/tya-safe-audit-bundle.mjs'] },
    { name: 'safe_audit_result_normalizer', cmd: 'node', args: ['tools/quality/tya-safe-audit-result-normalizer.mjs'] },
    { name: 'local_output_packager', cmd: 'node', args: ['tools/quality/tya-local-output-packager.mjs'] }
  ];

  const steps = [];
  for (const item of commands) {
    const run = spawnSync(item.cmd, item.args, { cwd: root, encoding: 'utf8', shell: false });
    steps.push({
      name: item.name,
      command: [item.cmd, ...item.args].join(' '),
      exitCode: run.status,
      status: run.status === 0 ? 'ok' : 'review_required',
      stdout: (run.stdout || '').slice(0, 4000),
      stderr: (run.stderr || '').slice(0, 4000)
    });
  }

  const hasReview = steps.some((step) => step.status !== 'ok');
  const report = {
    generatedAt: new Date().toISOString(),
    status: hasReview ? 'review_required' : 'ok_to_review_outputs',
    goAccepted: true,
    steps,
    notes: ['Local-only orchestration. No deploy, merge, import, providers, or production.']
  };
  writeReport(report);
  console.log(JSON.stringify({ status: report.status, steps: steps.length, outDir: path.relative(root, outDir) }, null, 2));
  if (hasReview) process.exitCode = 2;
}
