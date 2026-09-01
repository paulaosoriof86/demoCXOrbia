#!/usr/bin/env node
/* CXOrbia Phase A - HR source-safe to protected candidates validator.
   Dry-run only. No Firebase, no Firestore, no Auth, no writes, no deploy. */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { buildProtectedCandidates } from '../../backend/adapters/hr-source-safe-to-protected-candidates.preview.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
function argValue(name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

const inputPath = argValue('--input', 'app/data/tya-hr-source-safe-periods.js');
const outDir = argValue('--out', null);

function readSourceSafePayload(relPath) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) {
    return { payload: null, hardFail: { message: 'input_file_missing', file: relPath } };
  }
  const raw = fs.readFileSync(abs, 'utf8');
  if (relPath.endsWith('.json')) return { payload: JSON.parse(raw), hardFail: null };

  const context = { window: {} };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(raw, context, { timeout: 1000, filename: relPath });
  return { payload: context.window.CX_TYA_HR_SOURCE_SAFE || null, hardFail: null };
}

const hardFails = [];
let payload = null;
try {
  const readResult = readSourceSafePayload(inputPath);
  payload = readResult.payload;
  if (readResult.hardFail) hardFails.push(readResult.hardFail);
  if (!payload) hardFails.push({ message: 'source_safe_payload_not_found', inputPath });
} catch (error) {
  hardFails.push({ message: 'source_safe_payload_parse_failed', inputPath, error: String(error.message || error) });
}

const dryRun = payload ? buildProtectedCandidates(payload) : null;
if (dryRun?.hardFails?.length) hardFails.push(...dryRun.hardFails);

const report = {
  gate: 'cxorbia-phase-a-hr-source-safe-protected-candidates',
  generatedAt: new Date().toISOString(),
  inputPath,
  verdict: hardFails.length ? 'NO_GO_HR_SOURCE_SAFE_PROTECTED_CANDIDATES' : dryRun?.verdict || 'NO_GO_NO_DRY_RUN',
  hardFailCount: hardFails.length,
  warningCount: dryRun?.warnings?.length || 0,
  hardFails,
  warnings: dryRun?.warnings || [],
  summary: dryRun?.summary || {},
  safeState: {
    firebaseCalls: false,
    firestoreCalls: false,
    authCalls: false,
    writes: false,
    deploy: false,
    production: false,
    containsSensitiveData: false
  }
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'protected-candidates-report.json'), JSON.stringify(report, null, 2), 'utf8');
  if (dryRun) {
    fs.writeFileSync(path.join(abs, 'protected-candidates-preview.source-safe.json'), JSON.stringify(dryRun.candidates, null, 2), 'utf8');
  }
  const md = [
    '# CXOrbia Phase A HR source-safe protected candidates report',
    '',
    `Generated: ${report.generatedAt}`,
    `Input: ${inputPath}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${report.hardFailCount}`,
    `Warnings: ${report.warningCount}`,
    '',
    '## Summary',
    ...Object.entries(report.summary).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map((item) => `- ${item.message}${item.file ? ` · ${item.file}` : ''}${item.path ? ` · ${item.path}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No Firebase calls',
    '- No Firestore calls',
    '- No Auth calls',
    '- No writes',
    '- No deploy',
    '- No production',
    '- No sensitive data',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'protected-candidates-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
