#!/usr/bin/env node
/* CXOrbia TyA - Phase A readiness bucket evaluator.
   Safe dry-run only. No Firebase/Auth/Firestore/provider calls. No writes except optional local report. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const files = {
  contract: 'backend/contracts/phase-a-readiness-bucket-evaluator-v1.json',
  buckets: 'backend/config/phase-a-readiness-buckets.source-safe.json',
  moduleMatrix: 'backend/config/phase-a-module-readiness-matrix.source-safe.json',
  connectionGate: 'backend/config/phase-a-real-connection-readiness-map.source-safe.json',
  claudeAudit: 'backend/config/phase-a-claude-candidate-forensic-audit-checklist.source-safe.json'
};

const hardFails = [];
const warnings = [];
const info = [];
const moduleResults = [];

function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }
function hasForbiddenText(txt) {
  return [
    /password\s*[:=]/i,
    /private[_-]?key\s*[:=]/i,
    /refresh[_-]?token\s*[:=]/i,
    /provider[_-]?token\s*[:=]/i,
    /bank(account|number)?\s*[:=]/i,
    /dpi\s*[:=]/i,
    /privateWebhookUrl/i,
    /rawWorkbook/i
  ].some(rx => rx.test(txt));
}

let contract = null;
let buckets = null;

for (const [key, rel] of Object.entries(files)) {
  if (!exists(rel)) add(key === 'moduleMatrix' || key === 'connectionGate' || key === 'claudeAudit' ? warnings : hardFails, 'required_file_missing', { key, file: rel });
  else {
    try {
      const txt = read(rel);
      if (hasForbiddenText(txt)) add(hardFails, 'forbidden_sensitive_pattern_detected', { key, file: rel });
      const json = readJson(rel);
      if (key === 'contract') contract = json;
      if (key === 'buckets') buckets = json;
      add(info, 'json_valid', { key, file: rel });
    } catch (err) {
      add(hardFails, 'json_invalid', { key, file: rel, error: String(err.message || err) });
    }
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  const expectedFalse = [
    'realDatabaseConnected',
    'firestoreWritesEnabled',
    'authEnabled',
    'importsEnabled',
    'productionEnabled',
    'containsSecrets',
    'containsSensitiveData',
    'providerWritebackEnabled'
  ];
  for (const key of expectedFalse) {
    if (contract.safeState?.[key] !== false) add(hardFails, 'safe_state_invalid', { key, actual: contract.safeState?.[key] });
  }
}

if (buckets) {
  if (buckets.sourceSafe !== true) add(hardFails, 'buckets_not_source_safe');
  if (buckets.production !== false) add(hardFails, 'buckets_marked_production');
  if (!Array.isArray(buckets.modules) || !buckets.modules.length) add(hardFails, 'modules_missing');
  else {
    for (const mod of buckets.modules) {
      const missing = [];
      for (const key of ['moduleId', 'label', 'requirements', 'noGoIfMissing']) {
        if (mod[key] === undefined || (Array.isArray(mod[key]) && mod[key].length === 0)) missing.push(key);
      }
      const blocker = missing.length > 0 || mod.requiredForTyARealConnection !== true;
      const prototypeNeeded = mod.claudePrototypeRequired === true;
      let bucket = 'GO_READY';
      if (blocker) bucket = 'NO_GO_BLOCKER';
      else if (prototypeNeeded) bucket = 'WARNING_READY';
      moduleResults.push({
        moduleId: mod.moduleId,
        label: mod.label,
        bucket,
        claudePrototypeRequired: prototypeNeeded,
        reusableCxorbia: mod.reusableCxorbia === true,
        requiredForTyARealConnection: mod.requiredForTyARealConnection === true,
        missing,
        noGoIfMissing: mod.noGoIfMissing || []
      });
    }
  }
}

const counts = moduleResults.reduce((acc, x) => {
  acc[x.bucket] = (acc[x.bucket] || 0) + 1;
  return acc;
}, {});

const verdict = hardFails.length
  ? 'NO_GO_READINESS_BUCKET_EVALUATOR'
  : (counts.NO_GO_BLOCKER ? 'NO_GO_MODULE_BLOCKERS' : (counts.WARNING_READY ? 'WARNING_READY_DRY_RUN_ONLY' : 'GO_READY_DRY_RUN_ONLY'));

const report = {
  gate: 'cxorbia-tya-phase-a-readiness-bucket-evaluator',
  generatedAt: new Date().toISOString(),
  verdict,
  safeState: {
    firebaseCalls: false,
    authCalls: false,
    firestoreCalls: false,
    providerCalls: false,
    databaseWrites: false,
    production: false,
    imports: false,
    payments: false
  },
  counts,
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  hardFails,
  warnings,
  info,
  moduleResults,
  nextUse: [
    'Use before any TyA real connection GO.',
    'Use after Claude candidate audit to separate P0/P1 prototype asks from backend-prepared items.',
    'Use for future tenants before connecting source or creating real data.'
  ]
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'readiness-bucket-evaluator-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A readiness bucket evaluator report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${report.hardFailCount}`,
    `Warnings: ${report.warningCount}`,
    '',
    '## Bucket counts',
    `- GO_READY: ${counts.GO_READY || 0}`,
    `- WARNING_READY: ${counts.WARNING_READY || 0}`,
    `- NO_GO_BLOCKER: ${counts.NO_GO_BLOCKER || 0}`,
    '',
    '## Module results',
    ...moduleResults.map(x => `- ${x.moduleId}: ${x.bucket}${x.claudePrototypeRequired ? ' · Claude/prototype required' : ''}`),
    '',
    '## Safe state',
    '- No Firebase/Auth/Firestore/provider calls',
    '- No writes/imports/payments/production',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'readiness-bucket-evaluator-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
