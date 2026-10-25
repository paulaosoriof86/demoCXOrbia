#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = path.join(root, '_diagnosticos', 'tya-safe-audit-bundle', 'safe-audit-bundle.json');
const outDir = path.join(root, '_diagnosticos', 'tya-safe-audit-normalized');
fs.mkdirSync(outDir, { recursive: true });

function writeReport(report) {
  fs.writeFileSync(path.join(outDir, 'safe-audit-normalized.json'), JSON.stringify(report, null, 2));
  const lines = [
    '# Safe audit normalized report',
    '',
    `Generated: ${report.generatedAt}`,
    `Decision: ${report.decision}`,
    `Input present: ${report.inputPresent}`,
    '',
    '## Checks',
    '',
    ...report.checks.map((check) => `- ${check.name}: exit=${check.exitCode}; status=${check.status}`),
    '',
    '## Notes',
    '',
    ...report.notes.map((note) => `- ${note}`)
  ];
  fs.writeFileSync(path.join(outDir, 'safe-audit-normalized.md'), lines.join('\n'));
}

if (!fs.existsSync(inputPath)) {
  const report = {
    generatedAt: new Date().toISOString(),
    inputPresent: false,
    decision: 'blocked',
    checks: [],
    notes: ['Input safe-audit-bundle.json was not found.', 'Run only after explicit GO and after safe audit bundle exists.']
  };
  writeReport(report);
  console.log(JSON.stringify({ decision: report.decision, inputPresent: false, outDir: path.relative(root, outDir) }, null, 2));
  process.exitCode = 2;
} else {
  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const checks = Array.isArray(raw.results)
    ? raw.results.map((item) => ({
        name: item.command || 'unknown',
        exitCode: item.exitCode,
        status: item.exitCode === 0 ? 'ok' : 'review_required'
      }))
    : [];
  const hasReview = checks.some((check) => check.status !== 'ok');
  const decision = hasReview ? 'review_required' : 'ok_to_continue_documental';
  const report = {
    generatedAt: new Date().toISOString(),
    inputPresent: true,
    decision,
    sourceStatus: raw.status || null,
    checks,
    notes: ['Normalized report only. It does not authorize source lock, production, import, merge, deploy, or providers.']
  };
  writeReport(report);
  console.log(JSON.stringify({ decision, checks: checks.length, outDir: path.relative(root, outDir) }, null, 2));
  if (decision !== 'ok_to_continue_documental') process.exitCode = 2;
}
