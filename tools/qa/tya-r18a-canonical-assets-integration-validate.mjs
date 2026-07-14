#!/usr/bin/env node
/*
  Validates that R18A integrates existing canonical assets without recomputing
  shopper/financial reconciliation or fabricating runtime/shopper/payment facts.
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const repo = process.cwd();
const payloadPath = path.resolve(valueOf('--payload', 'app/data/tya-hr-source-safe-periods.js'));
const adapterPath = path.resolve(valueOf('--adapter', 'app/adapters/tya-phase-a-source-safe-dev-adapter-r18a.js'));
const outDir = path.resolve(valueOf('--out', '.tmp/r18a-canonical-assets-integration-validation'));
const selfTest = args.includes('--self-test');
const globalName = 'CX_TYA_HR_SOURCE_SAFE';

function readAssignment(file) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 5000 });
  return sandbox.window[globalName];
}

function makeFixture(file) {
  const fixture = {
    generatedAt: '2026-07-14T00:00:00.000Z',
    tenantId: 'tenant-a',
    tenantName: 'Tenant A',
    projectId: 'project-a',
    projectName: 'Project A',
    source: { accessMode: 'fixture', sourceSafe: true },
    projectConfig: { projectId:'project-a',projectName:'Project A',countries:['PA','PB'],currency:{PA:'A',PB:'B'} },
    periods: [{ key:'2025-07',label:'JUL 2025',fullLabel:'Julio 2025',month:7,year:2025,total:2,countries:{PA:2,PB:0} }],
    visits: [
      {
        id:'visit-serial',hrRowId:'JUL 25!10',sourceTab:'JUL 25',sourceRow:10,periodKey:'2025-07',periodLabel:'JUL 2025',
        pais:'PA',country:'PA',shopperId:'shopper-1',shopperCode:'S-1',shopper:'Shopper protegido',hasShopper:true,
        disponibleDesde:'45850.0',agendada:'45851.0',realizada:'45852.0',cuestFecha:'45853.0',submittedAt:'45854.0',submit:true,
        controlDia:'OK',estado:'liquidada',sourceSafe:true,piiProtected:true
      },
      {
        id:'visit-ambiguous',hrRowId:'JUL 25!11',sourceTab:'JUL 25',sourceRow:11,periodKey:'2025-07',periodLabel:'JUL 2025',
        pais:'PA',country:'PA',shopperId:null,shopperCode:null,shopper:null,hasShopper:false,
        disponibleDesde:'07/08/2025',agendada:null,realizada:null,cuestFecha:null,submittedAt:null,submit:false,
        controlDia:'P x Asignar',estado:'disponible',sourceSafe:true,piiProtected:true
      }
    ],
    shoppers:[{id:'shopper-1',code:'S-1',nombre:'Shopper protegido',pais:'PA',estado:'Activo',rating:4.3}],
    counts:{periods:1,tabs:1,visits:2,shoppers:1,byCountry:{PA:2}},
    production:false,imported:false,sourceSafe:true
  };
  fs.writeFileSync(file, `window.${globalName} = ${JSON.stringify(fixture,null,2)};\n`, 'utf8');
}

let effectivePayload = payloadPath;
let tempDir = null;
if (selfTest) {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cxorbia-r18a-'));
  const input = path.join(tempDir, 'fixture.js');
  const output = path.join(tempDir, 'canonical.js');
  makeFixture(input);
  const result = spawnSync(process.execPath, [
    path.join(repo, 'tools/hr-source/tya-canonicalize-live-hr-source-safe-r18a.mjs'),
    '--input', input,
    '--out', output,
    '--report-dir', path.join(tempDir, 'report')
  ], { cwd:repo, encoding:'utf8' });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(result.status || 4);
  }
  effectivePayload = output;
}

if (!fs.existsSync(effectivePayload)) throw new Error(`Payload missing: ${effectivePayload}`);
const payload = readAssignment(effectivePayload);
const visits = Array.isArray(payload?.visits) ? payload.visits : [];
const shoppers = Array.isArray(payload?.shoppers) ? payload.shoppers : [];
const dateFields = ['disponibleDesde','agendada','realizada','cuestFecha','submittedAt'];
const submitted = visits.filter(visit => visit.submissionState === 'submitted_by_tya');
const adapterText = fs.existsSync(adapterPath) ? fs.readFileSync(adapterPath,'utf8') : '';

const checks = {
  canonicalizationPresent: payload?.canonicalization?.integrationId === 'R18A_INTEGRATE_EXISTING_CANONICAL_ASSETS',
  noShopperReconciliationRecompute: payload?.canonicalization?.shopperReconciliationRecomputed === false,
  noFinancialReconciliationRecompute: payload?.canonicalization?.financialReconciliationRecomputed === false,
  datesIsoOrNull: visits.length > 0 && visits.every(visit => dateFields.every(field => visit[field] == null || /^\d{4}-\d{2}-\d{2}$/.test(String(visit[field])))),
  noNumericDateResidues: visits.every(visit => dateFields.every(field => !/^\d{3,6}(?:\.0+)?$/.test(String(visit[field] ?? '').trim()))),
  stateDimensionsPresent: visits.every(visit => ['operationalState','questionnaireState','submissionState','liquidationState','paymentState'].every(field => typeof visit[field] === 'string' && visit[field].length > 0)),
  submittedNotLiquidated: submitted.every(visit => visit.estado !== 'liquidada' && visit.liquidationState === 'liquidation_candidate'),
  submittedNotPaid: submitted.every(visit => !['paid','payment_confirmed_external'].includes(visit.paymentState)),
  snapshotMetadataHonest: payload.runtimeSyncActive === false && payload.source?.snapshotOnly === true && Boolean(payload.sourceSnapshotAt),
  protectedShopperNoInventedRating: shoppers.every(shopper => shopper.rating == null),
  protectedShopperNoInventedStatus: shoppers.every(shopper => shopper.estado == null && shopper.status == null),
  protectedShopperDataLevel: shoppers.every(shopper => shopper.dataLevel === 'protected_reference' && shopper.operationalProfileAvailable === false),
  reviewQueueAvailable: Array.isArray(payload.reviewQueue),
  selfTestSerialNormalized: !selfTest || visits.find(visit => visit.id === 'visit-serial')?.agendada === '2025-07-13',
  selfTestSubmittedSeparated: !selfTest || visits.find(visit => visit.id === 'visit-serial')?.submissionState === 'submitted_by_tya',
  adapterGeneratedWhenRequired: selfTest || adapterText.length > 0,
  adapterNoUniformRating: selfTest || !adapterText.includes('rating: 4.3'),
  adapterNoLiveRuntimeClaim: selfTest || !adapterText.includes('HR viva source-safe'),
  adapterCarriesCanonicalStates: selfTest || ['operationalState','questionnaireState','submissionState','liquidationState','paymentState'].every(field => adapterText.includes(field)),
  adapterMarksRuntimeInactive: selfTest || adapterText.includes('runtimeSyncActive:false')
};

const failures = Object.entries(checks).filter(([,pass]) => !pass).map(([name]) => name);
const pass = failures.length === 0;
const report = {
  schemaVersion:'1.0.0',
  reportId:'phase-a-r18a-canonical-assets-integration-validation',
  generatedAt:new Date().toISOString(),
  mode:selfTest ? 'self_test' : 'payload_and_adapter',
  decision:pass ? 'PASS_R18A_CANONICAL_ASSETS_INTEGRATION_VALIDATION' : 'FAIL_R18A_CANONICAL_ASSETS_INTEGRATION_VALIDATION',
  checks,
  failures,
  counts:{visits:visits.length,shoppers:shoppers.length,submitted:submitted.length,reviewQueue:payload.reviewQueue?.length || 0},
  safeState:{writes:false,imports:false,deploy:false,production:false,providerCalls:false,piiOutput:false}
};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'r18a-canonical-assets-validation.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'r18a-canonical-assets-validation.md'),[
  '# R18A canonical assets integration validation','',
  `Decision: **${report.decision}**`,
  `Mode: ${report.mode}`,
  `Visits: ${report.counts.visits}`,
  `Shoppers: ${report.counts.shoppers}`,
  `Submitted: ${report.counts.submitted}`,
  `Review queue: ${report.counts.reviewQueue}`,
  `Failures: ${failures.join(', ') || 'none'}`,'',
  'No shopper/financial reconciliation recomputed. No writes, imports, deploy or production.'
].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if (tempDir) fs.rmSync(tempDir,{recursive:true,force:true});
process.exitCode = pass ? 0 : 4;
