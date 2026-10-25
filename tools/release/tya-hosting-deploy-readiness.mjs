#!/usr/bin/env node
/* CXOrbia TyA - Hosting deploy readiness
   Safe validator. No deploy, no provider calls, no DB writes. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

function readJson(rel){ return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
function readText(rel){ return fs.readFileSync(path.join(root, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra={}){ list.push({ message, ...extra }); }

let firebaserc = null;
let firebase = null;
if (!exists('.firebaserc')) add(hardFails, 'firebaserc_missing');
else firebaserc = readJson('.firebaserc');
if (!exists('firebase.json')) add(hardFails, 'firebase_json_missing');
else firebase = readJson('firebase.json');

const devProject = firebaserc?.projects?.dev || firebaserc?.projects?.default || null;
const hostingTarget = firebase?.hosting?.target || null;
const publicDir = firebase?.hosting?.public || null;
const targetSites = devProject && hostingTarget ? (firebaserc?.targets?.[devProject]?.hosting?.[hostingTarget] || []) : [];
const devSite = targetSites[0] || null;
const devRootUrl = devSite ? `https://${devSite}.web.app` : null;

if (!devProject) add(hardFails, 'dev_project_missing');
else add(info, 'dev_project_detected', { devProject });
if (!hostingTarget) add(hardFails, 'hosting_target_missing');
else add(info, 'hosting_target_detected', { hostingTarget });
if (!publicDir) add(hardFails, 'hosting_public_missing');
else add(info, 'hosting_public_detected', { publicDir });
if (!devSite) add(hardFails, 'hosting_site_mapping_missing');
else add(info, 'hosting_site_detected', { devSite, devRootUrl });

const workflow = '.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml';
if (!exists(workflow)) add(hardFails, 'deploy_workflow_missing', { workflow });
else {
  const text = readText(workflow);
  const checks = [
    ['projectId: cxorbia-backend-dev', 'workflow_project_id'],
    ['target: cxorbia-dev', 'workflow_target'],
    ['channelId: live', 'workflow_live_channel'],
    ['Verify DEV root URL', 'workflow_verification_step'],
    ['FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV', 'workflow_secret_gate'],
    ['No Firestore/Storage rules, Functions, imports or providers', 'workflow_safe_scope_comment']
  ];
  for (const [needle, key] of checks) {
    if (text.includes(needle)) add(info, key, { ok: true });
    else add(hardFails, key + '_missing');
  }
}

if (devRootUrl) add(warnings, 'deploy_evidence_required_before_human_smoke', { devRootUrl });

const report = {
  gate: 'cxorbia-tya-hosting-deploy-readiness',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_CONFIG' : 'READY_FOR_DEV_DEPLOY_RUNNER',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  devProject,
  hostingTarget,
  publicDir,
  devSite,
  devRootUrl,
  finalProductionUrl: 'https://tya-plataforma.web.app',
  deployEvidenceRequired: true,
  safeState: {
    deployExecutedByThisTool: false,
    productionFinal: false,
    firestoreRules: false,
    storageRules: false,
    functions: false,
    imports: false,
    providerCalls: false,
    databaseWrites: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'hosting-deploy-readiness.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Hosting deploy readiness',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `DEV URL expected: ${report.devRootUrl || 'missing'}`,
    `Final production URL: ${report.finalProductionUrl}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}`) : ['- none']),
    '',
    '## Warnings',
    ...(warnings.length ? warnings.map(x => `- ${x.message}${x.devRootUrl ? ` · ${x.devRootUrl}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- This tool does not deploy',
    '- No Firestore rules',
    '- No Storage rules',
    '- No Functions',
    '- No imports',
    '- No provider calls',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'hosting-deploy-readiness.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
