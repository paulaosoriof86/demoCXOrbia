#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const contractPath = path.join(root, 'app/contracts/local-readiness-preflight-phase-a.tya.contract.json');
const gateFlags = ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'geminiAllowed', 'importRealDataAllowed', 'deployAllowed', 'mergeAllowed'];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function gitBranch() {
  const result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, encoding: 'utf8', timeout: 8000 });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function checkFile(relPath) {
  return { path: relPath, exists: fs.existsSync(path.join(root, relPath)) };
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];
  for (const flag of gateFlags) {
    if (contract[flag] !== false) issues.push(`contract_${flag}_not_false`);
  }

  const branch = gitBranch();
  if (!branch) warnings.push('git_branch_not_available');
  if (branch && branch !== contract.expectedBranch) warnings.push(`unexpected_branch:${branch}`);

  const fileChecks = (contract.requiredFiles || []).map(checkFile);
  const contractChecks = (contract.requiredContracts || []).map(checkFile);
  for (const row of [...fileChecks, ...contractChecks]) {
    if (!row.exists) issues.push(`missing:${row.path}`);
  }

  for (const row of contractChecks.filter((item) => item.exists)) {
    const dependency = readJson(path.join(root, row.path));
    for (const flag of gateFlags) {
      if (dependency[flag] === true) issues.push(`dependency_${row.path}_${flag}_true`);
    }
  }

  const report = {
    preflight: 'tya-local-readiness-preflight',
    status: issues.length ? 'review_required' : 'preflight_preview_ready',
    branch,
    expectedBranch: contract.expectedBranch,
    productionAllowed: false,
    deployAllowed: false,
    mergeAllowed: false,
    importRealDataAllowed: false,
    fileChecks,
    contractChecks,
    issues,
    warnings,
    nextSafeSteps: [
      'Run node tools/migration/tya-phase-a-local-readiness-runbook.mjs only after reviewing this preflight.',
      'Keep prototype P0 pending unless a corrective candidate passed audit.',
      'Use outputs as preview diagnostics only.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
  if (issues.length) process.exitCode = 2;
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ preflight: 'tya-local-readiness-preflight', status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
