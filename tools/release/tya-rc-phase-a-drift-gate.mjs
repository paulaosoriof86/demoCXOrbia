#!/usr/bin/env node
/*
  CXOrbia TyA - RC Phase A drift gate
  Safe local validator. No deploy, no provider calls, no DB writes.

  Current rule:
  - the complete V110 runtime must match the deterministic union manifest;
  - once that source lock passes, app paths inherited since the old validation
    SHA are not treated as drift;
  - later backend/docs/source-safe/reconciliation/release-gate changes remain
    reviewable without reopening the V110 frontend;
  - consumed one-time deploy files are accepted only while they remain deleted.
*/

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valIdx = args.indexOf('--validated');
const outIdx = args.indexOf('--out');
const validated = valIdx >= 0 ? args[valIdx + 1] : process.env.CXORBIA_VALIDATED_RUNTIME_SHA;
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const allowedPrefixes = [
  'app/docs/',
  'docs/',
  'README',
  'backend/contracts/',
  'backend/adapters/',
  'tools/contracts/',
  'tools/hr-source/',
  'tools/reconciliation/',
  'tools/empalme/',
  'tools/qa/r10-final-result/',
  'tools/release/',
  '.github/workflows/cxorbia-phase-a-remote-smoke.yml',
  '.github/workflows/cxorbia-rc-phase-a-drift-gate.yml',
  '.github/workflows/cxorbia-rc-phase-a-predeploy-gate.yml',
  '.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml'
];

const allowedExact = [
  '.gitignore',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md',
  '.github/authorized/cxorbia-dev-hosting-deploy-20260713.txt',
  '.github/workflows/cxorbia-authorized-dev-hosting-deploy-once-20260713.yml',
  '.github/workflows/cxorbia-auth-preactivation-route-action.yml',
  '.github/workflows/cxorbia-dev-auth-firestore-readiness-post-v96.yml',
  '.github/workflows/cxorbia-firebase-dev-clean-state-read-only-gate.yml',
  '.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml',
  '.github/workflows/cxorbia-source-lock-post-v96-runtime-verify.yml',
  '.github/workflows/cxorbia-phase-a-visual-smoke.yml',
  '.github/workflows/cxorbia-phase-a-operational-readiness-r9.yml',
  '.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml',
  '.github/workflows/cxorbia-phase-a-rc-smoke.yml',
  '.github/workflows/cxorbia-cxdata-firestore-readonly-r15d.yml',
  '.github/workflows/cxorbia-firebase-existing-dev-provenance-r15c.yml',
  '.github/workflows/cxorbia-firestore-canonical-drift-r15e.yml',
  '.github/workflows/cxorbia-canonical-materialization-dry-run-r16.yml',
  '.github/workflows/cxorbia-canonical-materialization-provider-compare-r16e.yml',
  '.github/workflows/cxorbia-canonical-materialization-source-alignment-r16c.yml',
  '.github/workflows/cxorbia-r14c-financial-overlay-review-plan-r16d.yml',
  'tools/migration/tya-assignment-sync-conflict-preview.mjs',
  'tools/migration/tya-assignment-sync-outbox-contract.mjs',
  'tools/migration/tya-phase-a-rc-smoke-gate.mjs',
  'tools/migration/tya-canonical-materialization-source-alignment-r16c.mjs',
  'tools/migration/tya-r14c-financial-overlay-review-plan-r16d.mjs',
  'tools/qa/tya-phase-a-visual-smoke.mjs',
  'tools/qa/tya-phase-a-source-safe-visual-smoke.mjs',
  'tools/qa/tya-phase-a-visible-data-smoke-r17.mjs',
  'backend/config/phase-a-financial-workbook-source-safe-r14.json'
];

const consumedOneTimeExact = [
  '.github/authorized/cxorbia-visible-tya-r17-redeploy-20260713.txt',
  '.github/workflows/cxorbia-authorized-visible-tya-r17-redeploy-once-20260713.yml'
];

function emitFailure(message, extra = {}) {
  const report = {
    gate: 'cxorbia-tya-rc-phase-a-drift',
    verdict: 'NO_GO_DRIFT',
    message,
    validated,
    generatedAt: new Date().toISOString(),
    ...extra
  };
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'rc-phase-a-drift-report.json'), JSON.stringify(report, null, 2), 'utf8');
  }
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

if (!validated) emitFailure('missing_validated_runtime_sha');

const sourceLockOut = outDir
  ? path.join(outDir, 'v110-source-lock')
  : '.tmp/rc-phase-a-drift-v110-source-lock';
let sourceLockVerified = false;
try {
  execFileSync(process.execPath, [
    'tools/release/tya-source-lock-v110-union-verify.mjs',
    '--manifest', 'app/docs/MANIFEST-V110-UNION-EMPALME-R1.json',
    '--out', sourceLockOut
  ], { encoding: 'utf8', stdio: 'pipe' });
  sourceLockVerified = true;
} catch (error) {
  emitFailure('v110_union_source_lock_failed', {
    sourceLockVerified: false,
    sourceLockError: String(error?.stderr || error?.message || error).slice(0, 500)
  });
}

let files = [];
try {
  const raw = execFileSync('git', ['diff', '--name-only', `${validated}..HEAD`], { encoding: 'utf8' });
  files = raw.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
} catch (error) {
  emitFailure('git_diff_failed: ' + String(error.message || error), { sourceLockVerified });
}

function isSourceSafeConfig(file) {
  return file.startsWith('backend/config/') && file.endsWith('.json') && file.includes('source-safe');
}

function isDraftRules(file) {
  return file.startsWith('backend/rules/') && file.endsWith('.rules.draft');
}

function isAllowed(file) {
  if (file.startsWith('app/')) return sourceLockVerified;
  if (consumedOneTimeExact.includes(file)) return !fs.existsSync(file);
  if (allowedExact.includes(file)) return true;
  if (isSourceSafeConfig(file)) return true;
  if (isDraftRules(file)) return true;
  return allowedPrefixes.some((prefix) => file === prefix || file.startsWith(prefix));
}

const blocked = files.filter((file) => !isAllowed(file));
const report = {
  gate: 'cxorbia-tya-rc-phase-a-drift',
  generatedAt: new Date().toISOString(),
  validatedRuntimeSha: validated,
  runtimeSourceLock: {
    baseline: 'V110 union deterministic manifest',
    manifest: 'app/docs/MANIFEST-V110-UNION-EMPALME-R1.json',
    verified: sourceLockVerified
  },
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  verdict: blocked.length ? 'NO_GO_DRIFT' : 'GO_V110_LOCKED_BACKEND_SOURCE_SAFE_ONLY_AFTER_VALIDATION',
  changedCount: files.length,
  appChangedSinceHistoricalShaCount: files.filter((file) => file.startsWith('app/')).length,
  blockedCount: blocked.length,
  changedFiles: files,
  blockedFiles: blocked,
  safeState: {
    deploy: false,
    production: false,
    providers: false,
    databaseWrites: false,
    imports: false
  },
  allowedPolicy: {
    v110ManifestLockedAppOnly: true,
    docs: true,
    rootRequiredDocs: true,
    backendContracts: true,
    backendAdaptersReadOrPreviewOnly: true,
    backendSourceSafeConfigOnly: true,
    backendDraftRulesOnly: true,
    hrSourceSafeTools: true,
    reconciliationTools: true,
    releaseValidators: true,
    explicitReleaseWorkflows: true,
    consumedOneTimeFilesMustRemainDeleted: true,
    runtimeAppOutsideV110Manifest: false,
    providerActivation: false,
    databaseWrites: false,
    imports: false
  }
};

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'rc-phase-a-drift-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA RC Phase A drift report',
    '',
    `Generated: ${report.generatedAt}`,
    `Historical validated SHA: ${report.validatedRuntimeSha}`,
    `Current runtime lock: ${report.runtimeSourceLock.baseline}`,
    `V110 source lock verified: ${report.runtimeSourceLock.verified}`,
    `Head: ${report.head}`,
    `Verdict: ${report.verdict}`,
    `Changed files since historical SHA: ${report.changedCount}`,
    `App files covered by V110 source lock: ${report.appChangedSinceHistoricalShaCount}`,
    `Blocked files: ${report.blockedCount}`,
    '',
    '## Blocked files',
    ...(blocked.length ? blocked.map((file) => `- ${file}`) : ['- none']),
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

console.log(JSON.stringify(report, null, 2));
process.exitCode = blocked.length ? 1 : 0;
