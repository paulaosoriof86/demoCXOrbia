#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R15G source-safe binding.

  Runs the existing R15F binding and then enforces the canonical context contract:
  - tenantId: tya
  - root projectId: cinepolis
  - active periodId: cinepolis-YYYY-MM
  - one period owns its 44 visits
  - operational, submission, liquidation and payment-control states survive the
    payload-to-CX.data adapter boundary without inferring payments.

  This is a backend connection-layer overlay. It does not modify app/modules,
  write providers, import data, deploy, pay, or enable production.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

await import('./tya-source-safe-binding-build-r15f.mjs');

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const appDir = path.resolve(valueOf('--app-dir', 'app'));
const adapterSrc = valueOf('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter.js');
const adapterFile = path.join(appDir, adapterSrc);
const outDir = path.resolve(valueOf('--out', '.tmp/source-safe-binding-r15g'));

const fail = message => {
  console.error(`R15G_BINDING_FAIL: ${message}`);
  process.exit(1);
};
if (!fs.existsSync(adapterFile)) fail(`Generated adapter missing: ${adapterFile}`);

let code = fs.readFileSync(adapterFile, 'utf8');
code = code.replace(
  "id:'tya', clientName:'TyA', name:'TyA', tagline:'Tenant TyA · Phase A controlada'",
  "id:'tya', tenantId:'tya', clientName:'TyA', name:'TyA', tagline:'Tenant TyA · Phase A controlada'"
);
code = code.replace(
  "  CX.data.currentProjectId = latest && latest.id;\n  CX.data.sourceMode = 'tya_hr_live_multitab_source_safe_dev';",
  "  CX.data.currentProjectId = 'cinepolis';\n  CX.data.currentPeriodId = latest && latest.id;\n  CX.data.sourceMode = 'tya_hr_live_multitab_source_safe_dev';"
);
code = code.replace(
  'currentPeriodId:CX.data.currentProjectId,',
  'currentPeriodId:CX.data.currentPeriodId,'
);
code = code.replace(
  "CX.dataSource.warnings = shoppers.length === 210 ? ['Gap shopper protegido: 210/213; 3 referencias continúan en revisión.'] : [];",
  "CX.dataSource.warnings = shoppers.length === 216 ? [] : ['Conteo shopper source-safe distinto al snapshot aprobado: ' + shoppers.length + '/216.'];"
);
code = code.replace(
  "tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', sourceTitle:snapshot.source && snapshot.source.title,",
  "tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', activePeriodId:latest && latest.id, sourceTitle:snapshot.source && snapshot.source.title,"
);

const stateMappingBefore = `    estado: v.estado || 'disponible',
    shopperId: v.shopperId || null,`;
const stateMappingAfter = `    estado: v.estado || 'disponible',
    canonicalState: v.canonicalState || null,
    operationalState: v.operationalState || null,
    questionnaireState: v.questionnaireState || null,
    submissionState: v.submissionState || null,
    liquidationState: v.liquidationState || null,
    paymentState: v.paymentState || null,
    paymentControlOnly: v.paymentControlOnly === true,
    paymentConfirmed: v.paymentConfirmed === true,
    paymentSourceRef: v.paymentSourceRef || null,
    financialControl: v.financialControl || null,
    liquidationEvidence: v.liquidationEvidence || null,
    paymentEvidence: v.paymentEvidence || null,
    shopperId: v.shopperId || null,`;
if (!code.includes(stateMappingBefore)) fail('R15F visit-state insertion anchor missing.');
code = code.replace(stateMappingBefore, stateMappingAfter);

const workflowMappingBefore = `    submit: !!v.submit,
    submittedAt: v.submittedAt || null,
    assignmentSource: v.hasShopper ? 'hr' : null,
    assignmentSyncStatus: 'hr_live_source_safe_preview',
    reviewRequired: false,`;
const workflowMappingAfter = `    submit: Boolean(v.submit || v.submittedAt || v.submissionState === 'submitted_by_tya'),
    submittedAt: v.submittedAt || null,
    assignmentSource: v.assignmentSource || (v.hasShopper ? 'hr' : null),
    assignmentSyncStatus: v.assignmentSyncStatus || 'hr_live_source_safe_preview',
    lastSyncedAt: v.lastSyncedAt || null,
    reviewRequired: v.reviewRequired === true,
    reviewReasons: Array.isArray(v.reviewReasons) ? v.reviewReasons : [],`;
if (!code.includes(workflowMappingBefore)) fail('R15F workflow-state insertion anchor missing.');
code = code.replace(workflowMappingBefore, workflowMappingAfter);

const required = [
  "tenantId:'tya', clientName:'TyA'",
  "CX.data.currentProjectId = 'cinepolis';",
  'CX.data.currentPeriodId = latest && latest.id;',
  'currentPeriodId:CX.data.currentPeriodId,',
  'shoppers.length === 216',
  'activePeriodId:latest && latest.id',
  'submissionState: v.submissionState || null,',
  'liquidationState: v.liquidationState || null,',
  'paymentState: v.paymentState || null,',
  "v.submissionState === 'submitted_by_tya'",
  'financialControl: v.financialControl || null,'
];
const missing = required.filter(token => !code.includes(token));
if (missing.length) fail(`Canonical context/state invariants missing: ${missing.join(', ')}`);
if (code.includes('CX.data.currentProjectId = latest && latest.id;')) {
  fail('Period identity still overwrites root project identity.');
}

fs.writeFileSync(adapterFile, code, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
const report = {
  schemaVersion: '1.1.0',
  decision: 'PASS_R15G_CANONICAL_PROJECT_PERIOD_AND_WORKFLOW_BINDING',
  adapterFile: path.relative(process.cwd(), adapterFile).replaceAll('\\', '/'),
  tenantId: 'tya',
  projectId: 'cinepolis',
  periodIdentity: 'cinepolis-YYYY-MM',
  expectedShoppers: 216,
  preservedStates: [
    'canonicalState',
    'operationalState',
    'questionnaireState',
    'submissionState',
    'liquidationState',
    'paymentState',
    'financialControl'
  ],
  safeState: {
    writes: false,
    imports: false,
    deploy: false,
    production: false,
    providers: false,
    payments: false,
    paymentsInferred: false
  }
};
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
