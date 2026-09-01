#!/usr/bin/env node
/* CXOrbia TyA - Runtime switch rollback/smoke plan validator
   Safe validator. No runtime patch, no writes, no deploy. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const docsPath = 'app/docs/CXDATA-RUNTIME-SWITCH-ROLLBACK-SMOKE-CHECKLIST-20260709.md';
const gatePath = 'backend/contracts/cxdata-runtime-switch-gate-phase-a-v1.json';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

if (!exists(docsPath)) add(hardFails, 'rollback_smoke_checklist_missing', { file: docsPath });
else {
  const doc = read(docsPath);
  const requiredSections = [
    'Precondiciones antes de tocar runtime',
    'Archivos permitidos para switch',
    'Rollback minimo',
    'Smoke minimo DEV / preview',
    'NO GO inmediato',
    'Criterio de GO DEV',
    'Criterio de GO produccion',
    'Claude/prototipo',
    'Estado seguro actual'
  ];
  for (const section of requiredSections) {
    if (!doc.includes(section)) add(hardFails, 'required_section_missing', { section });
  }
  const requiredTerms = [
    'app/core/data.js',
    'app/modules/**',
    'Cinepolis aparece como proyecto normal configurable',
    'JUNIO 26 HN',
    'DPI',
    'questionnaire_marks',
    'rollback',
    'smoke humano GO',
    'GO explicito de Paula',
    'Sin runtime switch',
    'Sin Firestore writes',
    'Sin datos sensibles'
  ];
  for (const term of requiredTerms) {
    if (!doc.includes(term)) add(hardFails, 'required_term_missing', { term });
  }
  add(info, 'rollback_smoke_checklist_present', { file: docsPath });
}

if (!exists(gatePath)) add(hardFails, 'runtime_switch_gate_contract_missing', { file: gatePath });
else {
  try {
    const gate = readJson(gatePath);
    if (gate.singleConnectionPointPolicy?.mustHaveRollback !== true) add(hardFails, 'gate_contract_missing_rollback_requirement');
    if (gate.singleConnectionPointPolicy?.mustHaveSmokeBeforeProduction !== true) add(hardFails, 'gate_contract_missing_smoke_requirement');
    if (!gate.requiredBeforeDevRuntimePreview?.includes('rollback plan documented')) add(hardFails, 'gate_contract_missing_dev_rollback_requirement');
    if (!gate.requiredBeforeDevRuntimePreview?.includes('smoke checklist documented')) add(hardFails, 'gate_contract_missing_dev_smoke_requirement');
    add(info, 'runtime_switch_gate_contract_validated', { file: gatePath });
  } catch (err) {
    add(hardFails, 'runtime_switch_gate_contract_invalid_json', { error: String(err.message || err) });
  }
}

const report = {
  gate: 'cxorbia-tya-runtime-switch-rollback-smoke-plan',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_ROLLBACK_SMOKE_PLAN' : 'GO_ROLLBACK_SMOKE_PLAN_READY_NO_SWITCH',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_SWITCH_EXECUTED_IN_DEV_AND_SMOKE_GO',
  safeState: {
    runtimeSwitch: false,
    modulesModified: false,
    firestoreWrites: false,
    imports: false,
    hrWrites: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'runtime-switch-rollback-smoke-plan-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA runtime switch rollback smoke plan report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Production decision: ${report.productionDecision}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.file ? ` · ${x.file}` : ''}${x.section ? ` · ${x.section}` : ''}${x.term ? ` · ${x.term}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- No runtime switch',
    '- No module changes',
    '- No Firestore writes',
    '- No imports',
    '- No HR writes',
    '- No deploy',
    '- No production',
    '- No raw PII',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'runtime-switch-rollback-smoke-plan-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
