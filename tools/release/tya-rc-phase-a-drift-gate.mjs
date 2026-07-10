#!/usr/bin/env node
/*
  CXOrbia TyA - RC Phase A drift gate
  Safe local validator. No deploy, no provider calls, no DB writes.

  Purpose: after a runtime commit passes smoke gates, ensure later commits before
  cutover are documentation, release notes, workflow gates, and preview-only
  backend contract validators. If runtime app files change, the visual/technical
  smoke must be run again and the validated runtime SHA updated.

  Usage:
    node tools/release/tya-rc-phase-a-drift-gate.mjs --validated <validated-runtime-sha>
*/

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

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
  '.github/workflows/cxorbia-phase-a-remote-smoke.yml',
  '.github/workflows/cxorbia-rc-phase-a-drift-gate.yml',
  '.github/workflows/cxorbia-rc-phase-a-predeploy-gate.yml',
  '.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml',
  'tools/release/tya-rc-phase-a-drift-gate.mjs',
  'tools/release/tya-rc-phase-a-predeploy-gate.mjs'
];

const allowedExact = [
  '.gitignore',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md',
  '.github/workflows/cxorbia-auth-preactivation-route-action.yml',
  '.github/workflows/cxorbia-dev-auth-firestore-readiness-post-v96.yml',
  '.github/workflows/cxorbia-source-lock-post-v96-runtime-verify.yml',
  '.github/workflows/cxorbia-phase-a-visual-smoke.yml',
  'tools/migration/tya-assignment-sync-conflict-preview.mjs',
  'tools/migration/tya-assignment-sync-outbox-contract.mjs',
  'tools/migration/tya-phase-a-rc-smoke-gate.mjs',
  'tools/qa/tya-phase-a-visual-smoke.mjs',
  'tools/release/tya-auth-dev-claims-seed-plan-validate.mjs',
  'tools/release/tya-auth-dev-claims-taxonomy-seed-validate.mjs',
  'tools/release/tya-auth-preactivation-route-action-validate.mjs',
  'tools/release/tya-auth-rbac-contract-validate.mjs',
  'tools/release/tya-claude-candidate-forensic-audit-prepare.mjs',
  'tools/release/tya-cxdata-firestore-contract-validate.mjs',
  'tools/release/tya-dev-auth-firestore-activation-readiness-post-v96-validate.mjs',
  'tools/release/tya-hosting-deploy-readiness.mjs',
  'tools/release/tya-hr-source-safe-protected-candidates-validate.mjs',
  'tools/release/tya-module-readiness-matrix-validate.mjs',
  'tools/release/tya-phase-a-today-finish-readiness.mjs',
  'tools/release/tya-post-claude-immediate-audit-pack.mjs',
  'tools/release/tya-protected-read-access-adapter-validate.mjs',
  'tools/release/tya-readiness-bucket-evaluator.mjs',
  'tools/release/tya-real-connection-readiness-gate-validate.mjs',
  'tools/release/tya-role-taxonomy-org-scope-validate.mjs',
  'tools/release/tya-source-lock-post-v96-runtime-verify.mjs'
];

function fail(message) {
  const report = {
    gate: 'cxorbia-tya-rc-phase-a-drift',
    verdict: 'NO_GO_DRIFT',
    message,
    validated,
    generatedAt: new Date().toISOString()
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

if (!validated) fail('missing_validated_runtime_sha');

let files = [];
try {
  const raw = execFileSync('git', ['diff', '--name-only', `${validated}..HEAD`], { encoding: 'utf8' });
  files = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
} catch (err) {
  fail('git_diff_failed: ' + String(err.message || err));
}

function isSourceSafeConfig(file) {
  return file.startsWith('backend/config/') && file.endsWith('.source-safe.json');
}

function isDraftRules(file) {
  return file.startsWith('backend/rules/') && file.endsWith('.rules.draft');
}

function isAllowed(file) {
  if (allowedExact.includes(file)) return true;
  if (isSourceSafeConfig(file)) return true;
  if (isDraftRules(file)) return true;
  return allowedPrefixes.some(prefix => file === prefix || file.startsWith(prefix));
}

const blocked = files.filter(file => !isAllowed(file));
const report = {
  gate: 'cxorbia-tya-rc-phase-a-drift',
  generatedAt: new Date().toISOString(),
  validatedRuntimeSha: validated,
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  verdict: blocked.length ? 'NO_GO_DRIFT' : 'GO_DOCS_RELEASE_CONTRACTS_HR_SOURCE_SAFE_ONLY_AFTER_VALIDATION',
  changedCount: files.length,
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
    docs: true,
    rootRequiredDocs: true,
    backendContracts: true,
    backendAdaptersPreviewOnly: true,
    backendSourceSafeConfigOnly: true,
    backendDraftRulesOnly: true,
    hrSourceSafeTools: true,
    releaseGateWorkflowsExplicitOnly: true,
    releaseValidatorsExplicitOnly: true,
    previewOnlyContracts: true,
    smokeGateValidators: true,
    runtimeAppChanges: false,
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
    `Validated runtime SHA: ${report.validatedRuntimeSha}`,
    `Head: ${report.head}`,
    `Verdict: ${report.verdict}`,
    `Changed files: ${report.changedCount}`,
    `Blocked files: ${report.blockedCount}`,
    '',
    '## Blocked files',
    ...(blocked.length ? blocked.map(file => `- ${file}`) : ['- none']),
    '',
    '## Changed files',
    ...(files.length ? files.map(file => `- ${file}`) : ['- none']),
    '',
    '## Allowed policy',
    '- Docs: yes',
    '- Root required docs: yes',
    '- Backend contracts: yes',
    '- Backend adapters preview-only: yes',
    '- Backend source-safe config ending in .source-safe.json: yes',
    '- Backend draft rules ending in .rules.draft: yes',
    '- HR source-safe tools: yes',
    '- Release workflows: explicit allowlist only',
    '- Release validators: explicit allowlist only',
    '- Preview-only contracts: yes',
    '- Smoke gate validators: yes',
    '- Runtime app changes: no',
    '- Provider activation: no',
    '- Database writes: no',
    '- Imports: no',
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
