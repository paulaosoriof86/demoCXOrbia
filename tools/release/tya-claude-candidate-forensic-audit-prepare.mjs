#!/usr/bin/env node
/* CXOrbia TyA - Claude candidate forensic audit preparation.
   Safe dry-run only. No deploy, no writes, no provider calls, no production. */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}
const currentPath = arg('--current');
const candidatePath = arg('--candidate');
const outDir = arg('--out');
const hardFails = [];
const warnings = [];
const info = [];
function push(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(p) { return p && fs.existsSync(path.resolve(root, p)); }
function read(rel) { return fs.readFileSync(path.resolve(root, rel), 'utf8'); }
function sha(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function listFiles(dir) {
  const abs = path.resolve(root, dir);
  const out = [];
  function walk(d) {
    for (const item of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, item.name);
      if (item.isDirectory()) walk(p);
      else out.push(path.relative(abs, p).replaceAll('\\', '/'));
    }
  }
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) walk(abs);
  return out.sort();
}
function fingerprint(dir, maxBytes = 800000) {
  if (!exists(dir)) return { exists: false, files: [], hashes: {} };
  const files = listFiles(dir);
  const hashes = {};
  for (const file of files) {
    const p = path.resolve(root, dir, file);
    const stat = fs.statSync(p);
    if (stat.size <= maxBytes) hashes[file] = sha(fs.readFileSync(p));
    else hashes[file] = `large:${stat.size}`;
  }
  return { exists: true, files, hashes };
}

const requiredRepoFiles = [
  'backend/contracts/phase-a-real-connection-readiness-gate-v1.json',
  'backend/contracts/phase-a-module-readiness-matrix-v1.json',
  'backend/contracts/phase-a-role-taxonomy-org-scope-v1.json',
  'backend/contracts/phase-a-hr-source-safe-to-protected-candidates-v1.json',
  'backend/contracts/phase-a-protected-read-access-adapter-v1.json',
  'backend/contracts/phase-a-auth-dev-claims-taxonomy-seed-v2.json',
  'app/data/tya-hr-source-safe-periods.js'
];
for (const file of requiredRepoFiles) {
  if (!exists(file)) push(hardFails, 'required_readiness_file_missing', { file });
  else push(info, 'required_readiness_file_present', { file });
}

if (!currentPath) push(warnings, 'current_candidate_path_not_provided');
if (!candidatePath) push(warnings, 'new_candidate_path_not_provided');
if (candidatePath && candidatePath.toLowerCase().endsWith('.zip')) push(warnings, 'candidate_zip_must_be_extracted_before_deep_file_diff', { candidatePath });

const current = currentPath ? fingerprint(currentPath) : { exists: false, files: [], hashes: {} };
const candidate = candidatePath ? fingerprint(candidatePath) : { exists: false, files: [], hashes: {} };
if (currentPath && !current.exists) push(hardFails, 'current_candidate_path_missing', { currentPath });
if (candidatePath && !candidate.exists) push(hardFails, 'new_candidate_path_missing_or_not_directory', { candidatePath });

const currentSet = new Set(current.files);
const candidateSet = new Set(candidate.files);
const added = candidate.files.filter(f => !currentSet.has(f));
const removed = current.files.filter(f => !candidateSet.has(f));
const common = candidate.files.filter(f => currentSet.has(f));
const modified = common.filter(f => current.hashes[f] !== candidate.hashes[f]);

const auditAxes = [
  'sourceLockAndBaseline',
  'projectPeriodSeparation',
  'tenantProjectConfigurability',
  'hrSourceMaskedAndGeneric',
  'rolesPersonasScopes',
  'protectedDataAndAuthGates',
  'academiaCoursesManualsRoutes',
  'certificationCarryover',
  'shopperProtectedProfiles',
  'visitsAssignmentsScheduling',
  'liquidationsPaymentsPreview',
  'reviewQueueAuditEvents',
  'makeGeminiPaymentProviderGates',
  'pwaBrandingInstallability',
  'cxDataBackendSwitch',
  'regressionsAndSyntax',
  'tyaSpecificVsReusableCxorbia'
];

const report = {
  gate: 'cxorbia-tya-claude-candidate-forensic-audit-readiness',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_FORENSIC_AUDIT_PREP' : 'GO_FORENSIC_AUDIT_PREP_SAFE',
  safeState: { noDeploy: true, noWrites: true, noProviderCalls: true, noProduction: true },
  paths: { currentPath, candidatePath },
  counts: { added: added.length, removed: removed.length, modified: modified.length, currentFiles: current.files.length, candidateFiles: candidate.files.length },
  changedFiles: { added, removed, modified },
  auditAxes,
  followupBuckets: ['P0BlockerAskClaudeNow','P1ShouldFixWhileCapacityExists','BackendAlreadyPreparedNoClaudeChange','PrototypeOnlyClaudeRequired','TyASpecificConfig','ReusableCxorbiaPattern'],
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.resolve(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'claude-candidate-forensic-audit-prep.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# Claude candidate forensic audit preparation',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    '',
    '## Counts',
    `- Added: ${added.length}`,
    `- Removed: ${removed.length}`,
    `- Modified: ${modified.length}`,
    '',
    '## Audit axes',
    ...auditAxes.map(x => `- ${x}`),
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}`) : ['- none']),
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'claude-candidate-forensic-audit-prep.md'), md, 'utf8');
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
