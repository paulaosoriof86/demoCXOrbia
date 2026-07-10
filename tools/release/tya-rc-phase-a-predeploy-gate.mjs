#!/usr/bin/env node
/*
  CXOrbia TyA - predeploy validation aligned to source lock post-V96.
  Validation success is not deploy authorization.
  No provider calls, imports, database writes or deploys.
*/
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 && args[outIdx + 1] ? path.resolve(root, args[outIdx + 1]) : null;
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const sha256 = rel => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');

function listFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
  return out.sort();
}

function localScripts(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1])
    .filter(src => !/^(?:https?:)?\/\//i.test(src) && !/^data:/i.test(src))
    .map(src => src.split(/[?#]/, 1)[0].replace(/^\.\//, '').replace(/^\//, ''));
}

const hardFails = [];
const warnings = [];
const checks = {};

let sourceManifest = null;
try {
  sourceManifest = JSON.parse(read('backend/config/phase-a-source-lock-post-v96-runtime-manifest.source-safe.json'));
  if (sourceManifest.kind !== 'cxorbia.sourceLockRuntimeManifest') hardFails.push('source_lock_manifest_kind_invalid');
  if (!Array.isArray(sourceManifest.runtimeFiles) || sourceManifest.runtimeFiles.length !== 67) hardFails.push('source_lock_runtime_count_not_67');
} catch (error) {
  hardFails.push(`source_lock_manifest_unreadable:${error.message}`);
}
const runtimeMissing = [];
const runtimeMismatched = [];
for (const item of sourceManifest?.runtimeFiles || []) {
  if (!exists(item.path)) runtimeMissing.push(item.path);
  else if (sha256(item.path) !== item.sha256) runtimeMismatched.push(item.path);
}
if (runtimeMissing.length) hardFails.push(`source_lock_runtime_missing:${runtimeMissing.join(',')}`);
if (runtimeMismatched.length) hardFails.push(`source_lock_runtime_mismatched:${runtimeMismatched.join(',')}`);
checks.sourceLock = {
  expected: sourceManifest?.runtimeFiles?.length || 0,
  matched: Math.max(0, (sourceManifest?.runtimeFiles?.length || 0) - runtimeMissing.length - runtimeMismatched.length),
  missing: runtimeMissing,
  mismatched: runtimeMismatched
};

let firebase = null;
try { firebase = JSON.parse(read('firebase.json')); } catch (error) { hardFails.push(`firebase_json_invalid:${error.message}`); }
let firebaserc = null;
try { firebaserc = JSON.parse(read('.firebaserc')); } catch (error) { hardFails.push(`firebaserc_invalid:${error.message}`); }
const hostingPublic = firebase?.hosting?.public || null;
const defaultProject = firebaserc?.projects?.default || null;
const hostingTarget = firebaserc?.targets?.[defaultProject]?.hosting || {};
if (hostingPublic !== 'app') hardFails.push(`firebase_hosting_public_not_app:${hostingPublic || 'missing'}`);
if (defaultProject !== 'cxorbia-backend-dev') hardFails.push(`firebase_default_project_unexpected:${defaultProject || 'missing'}`);
if (!Object.values(hostingTarget).flat().includes('cxorbia-backend-dev')) hardFails.push('firebase_hosting_target_missing_dev_site');
checks.firebase = { hostingPublic, defaultProject, hostingTarget };

let html = '';
try { html = read('app/index.html'); } catch (error) { hardFails.push(`index_unreadable:${error.message}`); }
const scripts = localScripts(html);
const duplicateScripts = [...new Set(scripts.filter((src, index) => scripts.indexOf(src) !== index))];
const missingScripts = scripts.filter(src => !exists(`app/${src}`));
if (duplicateScripts.length) hardFails.push(`duplicate_local_scripts:${duplicateScripts.join(',')}`);
if (missingScripts.length) hardFails.push(`missing_local_scripts:${missingScripts.join(',')}`);
if (!/<meta\s+charset=["']?UTF-8["']?\s*\/?>/i.test(html)) hardFails.push('index_charset_not_utf8');
const activeBackendScripts = scripts.filter(src => /(?:^|\/)(?:backend-|cx-data-bridge|backend-connection-point)/i.test(src));
if (activeBackendScripts.length) hardFails.push(`backend_runtime_scripts_active_before_authorization:${activeBackendScripts.join(',')}`);
checks.index = { localScripts: scripts.length, duplicateScripts, missingScripts, activeBackendScripts };

const requiredDocs = [
  'app/docs/SOURCE-LOCK-EMPALME-PROTOTIPO-POST-V96-20260710.md',
  'app/docs/REAUDITORIA-EMPALME-PROTOTIPO-POST-V96-20260710.md',
  'app/docs/PHASE-A-DEV-AUTH-FIRESTORE-ACTIVATION-READINESS-POST-V96-20260710.md',
  'app/docs/EMPALME-CONTROLADO-RUNTIME-POST-V96-20260710.md'
];
const missingDocs = requiredDocs.filter(file => !exists(file));
if (missingDocs.length) hardFails.push(`required_docs_missing:${missingDocs.join(',')}`);
checks.docs = { required: requiredDocs.length, missing: missingDocs };

const deployWorkflowPath = '.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml';
let deployWorkflow = '';
try { deployWorkflow = read(deployWorkflowPath); } catch (error) { hardFails.push(`deploy_workflow_unreadable:${error.message}`); }
const manualDispatch = /^\s{2}workflow_dispatch:/m.test(deployWorkflow);
const automaticTriggers = [...deployWorkflow.matchAll(/^\s{2}(push|pull_request|schedule):/gm)].map(match => match[1]);
const confirmationGate = deployWorkflow.includes('DEPLOY_DEV_ROOT');
const sourceLockGateBeforeFirebase = deployWorkflow.indexOf('Source lock post-V96 runtime gate') >= 0 && deployWorkflow.indexOf('Source lock post-V96 runtime gate') < deployWorkflow.indexOf('Firebase CLI access check');
if (!manualDispatch) hardFails.push('deploy_workflow_not_manual_dispatch');
if (automaticTriggers.length) hardFails.push(`deploy_workflow_has_automatic_triggers:${automaticTriggers.join(',')}`);
if (!confirmationGate) hardFails.push('deploy_workflow_missing_exact_confirmation');
if (!sourceLockGateBeforeFirebase) hardFails.push('deploy_workflow_source_lock_gate_not_before_firebase');
checks.deployWorkflow = { manualDispatch, automaticTriggers, confirmationGate, sourceLockGateBeforeFirebase };

try {
  const webManifest = JSON.parse(read('app/manifest.webmanifest'));
  if (!webManifest.name || !webManifest.start_url || !webManifest.display) hardFails.push('web_manifest_identity_incomplete');
  checks.webManifest = { valid: true, name: webManifest.name, startUrl: webManifest.start_url, display: webManifest.display };
} catch (error) {
  hardFails.push(`web_manifest_invalid:${error.message}`);
  checks.webManifest = { valid: false };
}
if (!exists('app/sw.js') || !read('app/sw.js').includes('self.addEventListener')) hardFails.push('service_worker_invalid');

const envFiles = listFiles('.').filter(file => /(^|\/)\.env(?:\.|$)/i.test(file) && !file.endsWith('.example'));
if (envFiles.length) hardFails.push(`environment_files_present:${envFiles.join(',')}`);
checks.sensitiveData = { envFiles };

let copyReport = null;
if (exists('tools/quality/tya-p0-operational-copy-scanner.mjs')) {
  try { execFileSync(process.execPath, ['tools/quality/tya-p0-operational-copy-scanner.mjs'], { cwd: root, stdio: 'pipe' }); } catch {}
  const copyPath = path.join(root, '_diagnosticos/tya-p0-operational-copy-scan/p0-operational-copy-scan.json');
  if (fs.existsSync(copyPath)) {
    try { copyReport = JSON.parse(fs.readFileSync(copyPath, 'utf8')); } catch { copyReport = null; }
  }
}
const copyResidues = copyReport?.findingsCount || copyReport?.sourceHitCount || copyReport?.hitCount || 0;
if (copyResidues) warnings.push(`source_lock_copy_items_for_p1_review:${copyResidues}`);
checks.copy = { scannerExecuted: Boolean(copyReport), sourceResidues: copyResidues };

const report = {
  gate: 'cxorbia-tya-rc-phase-a-predeploy-post-v96',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_PREDEPLOY_POST_V96' : (warnings.length ? 'GO_WITH_WARNINGS_PREDEPLOY_NOT_DEPLOY_AUTHORIZATION' : 'GO_PREDEPLOY_NOT_DEPLOY_AUTHORIZATION'),
  hardFails,
  warnings,
  checks,
  deploymentAuthorization: false,
  safeState: {
    deploy: false,
    production: false,
    providers: false,
    databaseWrites: false,
    imports: false,
    authActivation: false,
    firestoreActivation: false
  }
};

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'rc-phase-a-predeploy-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  const md = [
    '# CXOrbia TyA RC Phase A predeploy — source lock post-V96', '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    `Runtime matched: ${checks.sourceLock.matched}/${checks.sourceLock.expected}`,
    `Deployment authorization: no`,
    '', '## Hard fails', ...(hardFails.length ? hardFails.map(x => `- ${x}`) : ['- none']),
    '', '## Warnings', ...(warnings.length ? warnings.map(x => `- ${x}`) : ['- none']),
    '', '## Safe state', '- No deploy', '- No production', '- No provider calls', '- No database writes', '- No imports', '- No Auth/Firestore activation', ''
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'rc-phase-a-predeploy-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
