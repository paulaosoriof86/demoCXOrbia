#!/usr/bin/env node
/* CXOrbia TyA - post-Claude immediate audit pack preparer.
   Safe dry-run helper. No Firebase, no Auth, no Firestore, no provider calls, no writes except local report output. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : null;
};
const currentDir = getArg('--current');
const candidateDir = getArg('--candidate');
const outDir = getArg('--out');
const hardFails = [];
const warnings = [];
const info = [];

function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }
function walk(abs, base = abs, result = []) {
  if (!fs.existsSync(abs)) return result;
  for (const name of fs.readdirSync(abs)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist' || name === 'build') continue;
    const p = path.join(abs, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, base, result);
    else result.push(path.relative(base, p).replaceAll('\\', '/'));
  }
  return result.sort();
}
function hashLite(abs) {
  if (!fs.existsSync(abs)) return null;
  const txt = fs.readFileSync(abs);
  let h = 0;
  for (const b of txt) h = ((h << 5) - h + b) | 0;
  return `${txt.length}:${h}`;
}

const contractPath = 'backend/contracts/phase-a-post-claude-immediate-audit-pack-v1.json';
const configPath = 'backend/config/phase-a-post-claude-immediate-audit-pack.source-safe.json';
let contract = null;
let config = null;

for (const rel of [contractPath, configPath]) {
  if (!exists(rel)) add(hardFails, 'required_file_missing', { file: rel });
}
try { if (exists(contractPath)) contract = readJson(contractPath); } catch (err) { add(hardFails, 'contract_json_invalid', { error: String(err.message || err) }); }
try { if (exists(configPath)) config = readJson(configPath); } catch (err) { add(hardFails, 'config_json_invalid', { error: String(err.message || err) }); }

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({ auditsNewCandidateNow: false, touchesFrontend: false, deploy: false, production: false, readsPrivateData: false, writesData: false, containsSensitiveData: false })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
}
if (config) {
  if (config.sourceSafe !== true || config.production !== false || config.containsSensitiveData !== false) add(hardFails, 'config_not_source_safe');
  for (const moduleKey of ['tenantProjectPeriod','hrSource','usersRolesScopes','academia','certifications','shoppers','visitsAssignments','liquidationsPayments','reviewAudit','providersGates','pwaBranding','cxDataSwitch']) {
    if (!Array.isArray(config.moduleChecklist?.[moduleKey]) || !config.moduleChecklist[moduleKey].length) add(hardFails, 'module_checklist_missing', { moduleKey });
  }
}

let delta = null;
if (!currentDir || !candidateDir) {
  add(warnings, 'candidate_paths_not_provided', { expected: '--current <dir> --candidate <dir>' });
} else {
  const currentAbs = path.resolve(root, currentDir);
  const candidateAbs = path.resolve(root, candidateDir);
  if (!fs.existsSync(currentAbs)) add(hardFails, 'current_dir_missing', { currentDir });
  if (!fs.existsSync(candidateAbs)) add(hardFails, 'candidate_dir_missing', { candidateDir });
  if (fs.existsSync(currentAbs) && fs.existsSync(candidateAbs)) {
    const currentFiles = walk(currentAbs);
    const candidateFiles = walk(candidateAbs);
    const currentSet = new Set(currentFiles);
    const candidateSet = new Set(candidateFiles);
    const added = candidateFiles.filter(x => !currentSet.has(x));
    const deleted = currentFiles.filter(x => !candidateSet.has(x));
    const common = candidateFiles.filter(x => currentSet.has(x));
    const modified = common.filter(rel => hashLite(path.join(currentAbs, rel)) !== hashLite(path.join(candidateAbs, rel)));
    delta = { addedCount: added.length, deletedCount: deleted.length, modifiedCount: modified.length, added, deleted, modified };
    add(info, 'file_delta_prepared', { added: added.length, deleted: deleted.length, modified: modified.length });
  }
}

const report = {
  gate: 'phase-a-post-claude-immediate-audit-pack',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_AUDIT_PACK_PREP' : 'GO_AUDIT_PACK_READY_NOT_AUDITED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  hardFails,
  warnings,
  info,
  delta,
  requiredAuditAxes: contract?.requiredAuditAxes || [],
  responseBuckets: contract?.responseBuckets || [],
  moduleChecklist: config?.moduleChecklist || {},
  safeState: {
    deploy: false,
    production: false,
    providerCalls: false,
    dataWrites: false,
    privateDataReads: false
  }
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'post-claude-immediate-audit-pack.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA post-Claude immediate audit pack',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Delta summary',
    delta ? `- Added: ${delta.addedCount}\n- Deleted: ${delta.deletedCount}\n- Modified: ${delta.modifiedCount}` : '- candidate paths not provided',
    '',
    '## Required audit axes',
    ...(report.requiredAuditAxes.length ? report.requiredAuditAxes.map(x => `- ${x}`) : ['- none']),
    '',
    '## Response buckets',
    ...(report.responseBuckets.length ? report.responseBuckets.map(x => `- ${x}`) : ['- none']),
    '',
    '## Safe state',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No data writes',
    '- No private data reads',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'post-claude-immediate-audit-pack.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
