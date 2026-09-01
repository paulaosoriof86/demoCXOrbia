#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const MANIFEST='backend/config/cxorbia-phase-a-release-manifest-v1.json';
const ADAPTER='app/adapters/tya-live-source-refresh-watch-v2.js';
const LIVE='https://cxorbia-backend-dev.web.app/adapters/tya-live-source-refresh-watch-v2.js';
const OUT=process.env.CXORBIA_F8_HOSTING_DRIFT_OUT||'.tmp/f8-hosting-adapter-drift-rootcause/report.json';
const sha256=v=>crypto.createHash('sha256').update(v).digest('hex');
const git=(args)=>{const r=spawnSync('git',args,{encoding:'utf8',timeout:15000});return r.status===0?String(r.stdout||''):null;};
const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
const expected=String(manifest?.provider?.hosting?.certifiedAdapterSha256||'');
const functional=String(manifest?.source?.functionalSourceSha||'');
const runtime=String(manifest?.source?.runtimeReleaseSourceSha||'');
if(!expected||!functional||!runtime)throw new Error('F8_HOSTING_DRIFT_MANIFEST_INCOMPLETE');
const current=fs.readFileSync(ADAPTER);
const currentSha=sha256(current);
const functionalText=git(['show',`${functional}:${ADAPTER}`]);
const runtimeText=git(['show',`${runtime}:${ADAPTER}`]);
const functionalSha=functionalText===null?null:sha256(Buffer.from(functionalText));
const runtimeSha=runtimeText===null?null:sha256(Buffer.from(runtimeText));
const res=await fetch(`${LIVE}?rootcause=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(20000)});
if(!res.ok)throw new Error(`F8_HOSTING_DRIFT_PUBLIC_HTTP_${res.status}`);
const liveBytes=Buffer.from(await res.arrayBuffer());
const liveSha=sha256(liveBytes);
let classification='UNRESOLVED_HASH_RELATION';
if(liveSha===expected)classification='NO_LIVE_DRIFT_MANIFEST_MATCH';
else if(liveSha===currentSha&&currentSha!==expected)classification='LIVE_MATCHES_CURRENT_BRANCH_NOT_FROZEN_MANIFEST';
else if(functionalSha&&liveSha===functionalSha&&functionalSha!==expected)classification='LIVE_MATCHES_FROZEN_FUNCTIONAL_SOURCE_MANIFEST_HASH_WRONG';
else if(runtimeSha&&liveSha===runtimeSha&&runtimeSha!==expected)classification='LIVE_MATCHES_FROZEN_RUNTIME_SOURCE_MANIFEST_HASH_WRONG';
else if(functionalSha===expected&&liveSha!==expected)classification='LIVE_HOSTING_CONTENT_DRIFT_FROM_FROZEN_FUNCTIONAL_SOURCE';
const report={
  schemaVersion:'cxorbia.f8.hosting-adapter-drift-rootcause.readonly.v1',
  generatedAt:new Date().toISOString(),
  releaseId:manifest.releaseId,
  hostingRelease:manifest?.provider?.hosting?.release||null,
  hostingVersion:manifest?.provider?.hosting?.version||null,
  adapterPath:ADAPTER,
  expectedCertifiedSha256:expected,
  liveSha256:liveSha,
  currentBranchSha256:currentSha,
  frozenFunctionalSourceSha:functional,
  frozenFunctionalAdapterSha256:functionalSha,
  frozenRuntimeSourceSha:runtime,
  frozenRuntimeAdapterSha256:runtimeSha,
  liveEqualsExpected:liveSha===expected,
  liveEqualsCurrentBranch:liveSha===currentSha,
  liveEqualsFrozenFunctionalSource:functionalSha!==null&&liveSha===functionalSha,
  liveEqualsFrozenRuntimeSource:runtimeSha!==null&&liveSha===runtimeSha,
  currentBranchEqualsExpected:currentSha===expected,
  frozenFunctionalEqualsExpected:functionalSha!==null&&functionalSha===expected,
  frozenRuntimeEqualsExpected:runtimeSha!==null&&runtimeSha===expected,
  classification,
  providerWrites:0,
  deploys:0,
  authorizationConsumed:false,
  secretValuesRead:false
};
fs.mkdirSync(OUT.split('/').slice(0,-1).join('/'),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({classification,liveEqualsExpected:report.liveEqualsExpected,liveEqualsCurrentBranch:report.liveEqualsCurrentBranch,liveEqualsFrozenFunctionalSource:report.liveEqualsFrozenFunctionalSource,currentBranchEqualsExpected:report.currentBranchEqualsExpected}));
if(classification==='UNRESOLVED_HASH_RELATION')process.exitCode=2;
