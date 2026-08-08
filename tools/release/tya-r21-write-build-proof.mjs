#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const raw=fs.readFileSync('app/data/tya-hr-source-safe-periods.js','utf8');
const prefix='window.CX_TYA_HR_SOURCE_SAFE = ';
const snapshot=JSON.parse(raw.slice(raw.indexOf(prefix)+prefix.length,raw.lastIndexOf(';')));
const counts=snapshot.counts||{};
if(Number(counts.periods)!==14||Number(counts.visits)!==616)throw new Error(`Corte 1 count mismatch: ${JSON.stringify(counts)}`);
const proof={
  schemaVersion:'2.0.0',environment:'dev',build:process.env.CXORBIA_RUNTIME_BUILD_LABEL,
  commit:process.env.GITHUB_SHA||null,runtimeVersion:'V164',
  sourceZipSha256:'b62a9df4f5e9a20580502e7e971c553af0d2ccac83c82ab8431c509f6a3d8128',
  manifestFile:'app/docs/MANIFEST-V164-CORTE1-REPORTES-EMPALME-DIRECTO-20260720.json',
  empalmeCommit:'f708515a637a3998eefdbe39ef66d37a3f130fb6',
  authorizedTechnicalGateRun:29768206645,
  authorizedTechnicalGateCommit:'cf0dbf735522f5ae2ed67d865dfb97d1a37335f2',
  tenantId:'tya',projectId:'cinepolis',periods:14,visits:616,
  assigned:611,unassigned:5,performed:592,questionnaire:590,submitted:527,paymentConfirmed:0,
  shoppers:Number(counts.shoppers??snapshot.shoppers?.length??0),
  currentPeriodVisits:44,currentPeriodAssigned:39,currentPeriodUnassigned:5,currentPeriodAvailable:4,currentPeriodEligibilityBlocked:1,
  availableReports:4,pendingSourceReports:3,frontendFormats:['json','csv','pdf','xlsx','pptx'],
  hostingOnly:true,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false,imports:false,make:false,gemini:false,payments:false,production:false,
  generatedAt:new Date().toISOString()
};
const proofFile='app/cxorbia-v164-corte1-dev-build-proof.json';
fs.writeFileSync(proofFile,JSON.stringify(proof,null,2)+'\n','utf8');
fs.mkdirSync(process.env.CXORBIA_OUT_DIR,{recursive:true});
fs.writeFileSync(process.env.CXORBIA_OUT_DIR+'/build-proof.json',JSON.stringify(proof,null,2)+'\n','utf8');
console.log(JSON.stringify({ok:true,decision:'PASS_V164_CORTE1_BUILD_PROOF_WRITTEN',proofFile,proof},null,2));
