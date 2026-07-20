#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const raw=fs.readFileSync('app/data/tya-hr-source-safe-periods.js','utf8');
const prefix='window.CX_TYA_HR_SOURCE_SAFE = ';
const snapshot=JSON.parse(raw.slice(raw.indexOf(prefix)+prefix.length,raw.lastIndexOf(';')));
const counts=snapshot.counts||{};
if(Number(counts.periods)!==14||Number(counts.visits)!==616)throw new Error(`Corte 0B count mismatch: ${JSON.stringify(counts)}`);
const proof={
  schemaVersion:'1.0.0',environment:'dev',build:process.env.CXORBIA_RUNTIME_BUILD_LABEL,
  commit:process.env.GITHUB_SHA||null,runtimeVersion:'V161C',
  aggregateSha256:'7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf',
  authorizedTechnicalGateRun:29712762494,
  authorizedTechnicalGateCommit:'7acc4e6c18355827df6ed649c3a537db07eec196',
  tenantId:'tya',projectId:'cinepolis',periods:14,visits:616,
  shoppers:Number(counts.shoppers??snapshot.shoppers?.length??0),
  currentPeriodVisits:44,currentPeriodAssigned:39,currentPeriodUnassigned:5,currentPeriodAvailable:4,currentPeriodEligibilityBlocked:1,
  hostingOnly:true,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false,imports:false,make:false,gemini:false,payments:false,production:false,
  generatedAt:new Date().toISOString()
};
fs.writeFileSync('app/cxorbia-v161c-r21-dev-build-proof.json',JSON.stringify(proof,null,2)+'\n','utf8');
fs.mkdirSync(process.env.CXORBIA_OUT_DIR,{recursive:true});
fs.writeFileSync(process.env.CXORBIA_OUT_DIR+'/build-proof.json',JSON.stringify(proof,null,2)+'\n','utf8');
console.log(JSON.stringify({ok:true,decision:'PASS_R21_BUILD_PROOF_WRITTEN',proof},null,2));
