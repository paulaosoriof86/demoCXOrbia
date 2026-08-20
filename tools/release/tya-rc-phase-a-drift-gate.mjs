#!/usr/bin/env node
/*
  CXOrbia TyA - RC Phase A drift gate
  Safe source/control-plane validator. No deploy, provider calls or DB writes.

  Current authority:
  - backend/config/cxorbia-phase-a-continuity-lock.json
  - functionalSourceLock inside that file
  - tools/continuity/validate-cxorbia-phase-a-continuity-lock.js

  Historical --validated arguments are accepted for workflow compatibility but
  never replace the canonical functionalSourceLock.
  Consumed non-product harness HOLDs remain terminal only when the continuity
  validator proves they are disabled, fully consumed and write/deploy safe.

  Runtime protection intentionally covers core/modules/styles AND the live
  backend-dev entrypoint/adapters/data. This prevents a control-plane-only
  iteration from silently changing the tested product while still reporting
  same-artifact/no-rebuild.
*/

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valIdx = args.indexOf('--validated');
const outIdx = args.indexOf('--out');
const historicalValidatedInput = valIdx >= 0 ? args[valIdx + 1] : null;
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;
const lockPath = 'backend/config/cxorbia-phase-a-continuity-lock.json';

function writeReport(report) {
  if (!outDir) return;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'rc-phase-a-drift-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA RC Phase A drift report',
    '',
    `Generated: ${report.generatedAt}`,
    `Plan: ${report.planId || 'n/a'}`,
    `Epoch: ${report.syncEpoch || 'n/a'}`,
    `Current iteration: ${report.currentIteration || 'n/a'}`,
    `Functional source lock: ${report.functionalSourceLock || 'n/a'}`,
    `Head: ${report.head || 'n/a'}`,
    `Verdict: ${report.verdict}`,
    '',
    '## Runtime drift',
    ...(report.runtimeChangedFiles?.length ? report.runtimeChangedFiles.map((file) => `- ${file}`) : ['- none']),
    '',
    '## Safe state',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'rc-phase-a-drift-report.md'), md, 'utf8');
}

function fail(message, extra = {}) {
  const report = {
    gate: 'cxorbia-tya-rc-phase-a-drift',
    verdict: 'NO_GO_DRIFT',
    message,
    historicalValidatedInput,
    generatedAt: new Date().toISOString(),
    ...extra,
    safeState: {
      deploy: false,
      production: false,
      providers: false,
      databaseWrites: false,
      imports: false
    }
  };
  writeReport(report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

let lock;
try {
  lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
} catch (error) {
  fail('canonical_continuity_lock_unreadable', { error: String(error?.message || error) });
}

const functionalSourceLock = lock.functionalSourceLock;
if (!functionalSourceLock) fail('functional_source_lock_missing', { planId: lock.planId, syncEpoch: lock.syncEpoch });
if (lock.repository !== 'paulaosoriof86/demoCXOrbia') fail('repository_lock_mismatch', { repository: lock.repository });
if (lock.branch !== 'docs-tya-v6-v71-audit') fail('branch_lock_mismatch', { branch: lock.branch });
if (lock.formalProgress?.productionIsAuthorized !== false) fail('production_must_remain_unauthorized_before_G1');

let continuityOutput = '';
try {
  continuityOutput = execFileSync(process.execPath, [
    'tools/continuity/validate-cxorbia-phase-a-continuity-lock.js'
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (error) {
  fail('canonical_continuity_validator_failed', {
    planId: lock.planId,
    syncEpoch: lock.syncEpoch,
    currentIteration: lock.currentIteration,
    functionalSourceLock,
    validatorError: String(error?.stderr || error?.message || error).slice(0, 2000)
  });
}

if (!continuityOutput.includes('CONTINUITY_LOCK_PASS')) {
  fail('canonical_continuity_validator_missing_terminal_pass', {
    planId: lock.planId,
    syncEpoch: lock.syncEpoch,
    currentIteration: lock.currentIteration,
    functionalSourceLock,
    continuityOutput: continuityOutput.slice(0, 2000)
  });
}

let changedFiles;
try {
  const raw = execFileSync('git', ['diff', '--name-only', `${functionalSourceLock}..HEAD`], { encoding: 'utf8' });
  changedFiles = raw.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
} catch (error) {
  fail('git_diff_from_functional_source_lock_failed', {
    planId: lock.planId,
    syncEpoch: lock.syncEpoch,
    currentIteration: lock.currentIteration,
    functionalSourceLock,
    error: String(error?.message || error)
  });
}

const runtimeExact = new Set([
  'app/index.html',
  'app/index-backend-dev.html',
  'app/app.js',
  'app/manifest.webmanifest'
]);
const runtimePrefixes = [
  'app/core/',
  'app/modules/',
  'app/styles/',
  'app/adapters/',
  'app/data/'
];
const isRuntime = (file) => runtimeExact.has(file) || runtimePrefixes.some((prefix) => file.startsWith(prefix));
const runtimeChangedFiles = changedFiles.filter(isRuntime);

const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (runtimeChangedFiles.length) {
  fail('functional_runtime_drift_after_frozen_source', {
    planId: lock.planId,
    syncEpoch: lock.syncEpoch,
    currentIteration: lock.currentIteration,
    functionalSourceLock,
    head,
    runtimeChangedFiles
  });
}

const report = {
  gate: 'cxorbia-tya-rc-phase-a-drift',
  verdict: 'GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED',
  generatedAt: new Date().toISOString(),
  planId: lock.planId,
  syncEpoch: lock.syncEpoch,
  currentIteration: lock.currentIteration,
  functionalSourceLock,
  head,
  historicalValidatedInput,
  historicalValidatedInputIgnoredAsAuthority: true,
  continuityValidator: 'CONTINUITY_LOCK_PASS',
  consumedTerminalHarnessHoldPolicyEnforced: true,
  runtimeProtectionIncludesBackendDevAdaptersData: true,
  changedFilesSinceFunctionalLock: changedFiles.length,
  runtimeChangedFiles,
  runtimeChangedCount: runtimeChangedFiles.length,
  safeState: {
    deploy: false,
    production: false,
    providers: false,
    databaseWrites: false,
    imports: false
  }
};
writeReport(report);
console.log(JSON.stringify(report, null, 2));
