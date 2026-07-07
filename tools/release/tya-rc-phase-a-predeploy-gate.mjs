#!/usr/bin/env node
/*
  CXOrbia TyA - RC Phase A predeploy gate
  Safe validator. No deploy, no provider calls, no DB writes.

  Purpose: confirm the repo is configured only for a controlled Hosting preview/staging
  movement with gates closed before Paula authorizes any deploy step.
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const failures = [];
const warnings = [];
const info = [];

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function readJson(rel){ return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
function push(kind, message, extra={}){ (kind === 'fail' ? failures : kind === 'warn' ? warnings : info).push({ message, ...extra }); }
function fileContains(rel, pattern){ if(!exists(rel)) return false; return pattern.test(fs.readFileSync(path.join(root, rel), 'utf8')); }

const requiredFiles = [
  'firebase.json',
  '.firebaserc',
  'app/index.html',
  'app/core/production-copy-guard.js',
  'tools/migration/tya-phase-a-rc-smoke-gate.mjs',
  'tools/qa/tya-phase-a-visual-smoke.mjs',
  'tools/release/tya-rc-phase-a-drift-gate.mjs',
  'app/docs/RC-PHASE-A-CONTROLLED-DECISION-20260706.md',
  'app/docs/PREDEPLOY-CONTROLADO-RC-PHASE-A-20260706.md'
];
for (const rel of requiredFiles) {
  if (exists(rel)) push('info', 'required_file_present', { file: rel });
  else push('fail', 'required_file_missing', { file: rel });
}

if (exists('firebase.json')) {
  try {
    const firebase = readJson('firebase.json');
    const hosting = firebase.hosting || {};
    if (hosting.public !== 'app') push('fail', 'hosting_public_must_be_app', { value: hosting.public });
    else push('info', 'hosting_public_ok', { value: hosting.public });
    if (hosting.target !== 'cxorbia-dev') push('warn', 'hosting_target_not_expected_dev', { value: hosting.target });
    else push('info', 'hosting_target_dev_ok', { value: hosting.target });
    const rewrites = JSON.stringify(hosting.rewrites || []);
    if (!rewrites.includes('/index.html')) push('fail', 'spa_rewrite_missing');
    const headers = JSON.stringify(hosting.headers || []);
    for (const term of ['text/html; charset=utf-8','application/javascript; charset=utf-8','text/css; charset=utf-8','application/json; charset=utf-8','application/manifest+json; charset=utf-8']) {
      if (!headers.includes(term)) push('fail', 'utf8_header_missing', { term });
    }
    if (firebase.firestore || firebase.storage) push('warn', 'rules_config_present_do_not_deploy_rules_in_rc', { firestore: !!firebase.firestore, storage: !!firebase.storage });
  } catch (err) {
    push('fail', 'firebase_json_invalid', { error: String(err.message || err) });
  }
}

if (exists('.firebaserc')) {
  try {
    const rc = readJson('.firebaserc');
    const projects = rc.projects || {};
    if (projects.default && /prod|production/i.test(projects.default)) push('fail', 'firebase_default_points_to_production_like_project', { value: projects.default });
    if (projects.default !== 'cxorbia-backend-dev') push('warn', 'firebase_default_not_expected_dev', { value: projects.default });
    else push('info', 'firebase_default_dev_ok', { value: projects.default });
    const raw = JSON.stringify(rc);
    if (/prod|production/i.test(raw)) push('warn', 'firebaserc_contains_production_like_text');
  } catch (err) {
    push('fail', 'firebaserc_invalid', { error: String(err.message || err) });
  }
}

if (exists('app/index.html')) {
  const html = fs.readFileSync(path.join(root, 'app/index.html'), 'utf8');
  if (!html.includes('<meta charset="UTF-8">')) push('fail', 'index_utf8_meta_missing');
  if (!html.includes('core/production-copy-guard.js')) push('fail', 'production_copy_guard_not_loaded');
  const guardPos = html.indexOf('core/production-copy-guard.js');
  const uiPos = html.indexOf('core/ui.js');
  const modulesPos = html.indexOf('modules/');
  if (uiPos >= 0 && guardPos >= 0 && guardPos <= uiPos) push('fail', 'guard_must_load_after_ui');
  if (modulesPos >= 0 && guardPos >= 0 && guardPos >= modulesPos) push('fail', 'guard_must_load_before_modules');
}

const sensitivePatterns = [
  { name: 'private_key', pattern: /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/ },
  { name: 'service_account_private_key', pattern: /"private_key"\s*:/ },
  { name: 'google_api_key_literal', pattern: /AIza[0-9A-Za-z\-_]{20,}/ },
  { name: 'firebase_token_literal', pattern: /FIREBASE_TOKEN\s*=/ },
  { name: 'make_webhook_literal', pattern: /hook\.(make|integromat)\.com\//i }
];
const scanDirs = ['app', 'tools', '.github'];
function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|json|html|css|md|yml|yaml|webmanifest|rules)$/.test(entry.name)) out.push(full);
  }
  return out;
}
for (const abs of scanDirs.flatMap(d => walk(path.join(root, d)))) {
  const rel = path.relative(root, abs).replace(/\\/g, '/');
  const text = fs.readFileSync(abs, 'utf8');
  for (const item of sensitivePatterns) {
    if (item.pattern.test(text)) push('fail', 'sensitive_or_secret_pattern_found', { file: rel, pattern: item.name });
  }
}

try {
  const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (status) push('warn', 'working_tree_not_clean_in_local_context');
  else push('info', 'working_tree_clean');
} catch (err) {
  push('warn', 'git_status_unavailable');
}

const report = {
  gate: 'cxorbia-tya-rc-phase-a-predeploy',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_PREDEPLOY' : 'GO_PREDEPLOY_CONTROLLED_WITH_GATES_CLOSED',
  failureCount: failures.length,
  warningCount: warnings.length,
  infoCount: info.length,
  failures,
  warnings,
  info,
  safeState: {
    deployExecuted: false,
    production: false,
    firestoreWrites: false,
    authWrites: false,
    storageWrites: false,
    hrWrites: false,
    providers: false,
    imports: false
  }
};

if (outDir) {
  const absOut = path.join(root, outDir);
  fs.mkdirSync(absOut, { recursive: true });
  fs.writeFileSync(path.join(absOut, 'rc-phase-a-predeploy-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA RC Phase A predeploy report', '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Failures: ${report.failureCount}`,
    `Warnings: ${report.warningCount}`,
    '',
    '## Failures', ...(failures.length ? failures.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Warnings', ...(warnings.length ? warnings.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No deploy executed', '- No production', '- No provider calls', '- No database writes', '- No real imports', ''
  ].join('\n');
  fs.writeFileSync(path.join(absOut, 'rc-phase-a-predeploy-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
