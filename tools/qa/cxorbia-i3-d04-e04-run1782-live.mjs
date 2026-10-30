import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {initializeApp,applicationDefault,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const ROOT=String(process.env.HOSTING_URL||'').replace(/\/$/,'');
const SRC=String(process.env.FOCAL_SOURCE||'');
const HR=String(process.env.EXPECTED_HR_REVISION||'');
const RUN=String(process.env.GITHUB_RUN_ID||'');
const SESSION_PROOF_MODE=process.env.CXORBIA_I3_INDEPENDENT_SESSION_PROOF==='YES_PAULA_20261029_DEV';
const R7_MODE=SESSION_PROOF_MODE&&process.env.CXORBIA_I3_SESSION_MODE==='R7_D07_C04_C05_BOUNDED';
const D07_READ_ONLY_MODE=SESSION_PROOF_MODE&&process.env.CXORBIA_I3_SESSION_MODE==='R6D07_READ_ONLY';
const OUT=String(process.env.PHASEA_LIVE_OUT||'')+(R7_MODE?'/r7-d07-c04-c05':D07_READ_ONLY_MODE?'/d07-readonly':'/d04-e04');
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
if(!ROOT||!SRC||!HR||!/^\d+$/.test(RUN))throw Error('ENVIRONMENT_FAILURE:D04_E04_ENV');
assert.equal(descriptor.productSourceSha,SRC);
let sessionPackage=null, sessionPreflight=null;
if(R7_MODE){
// Inserted as the R7-only branch before the unchanged R5/R6 session guard.
assert.equal(descriptor.status,'HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL');
assert.equal(SRC,'4854a4e289bf76d08f3ffe3ecddd09168ba501af');
assert.equal(descriptor.productTreeAuthority,'7e55c5fefee821b2d9dd1d7c6e575592b8534be4');
assert.equal(ROOT,'https://cxorbia-backend-dev.web.app');
const r7Git=(...args)=>execFileSync('git',args,{encoding:'utf8',timeout:10000,maxBuffer:1024*1024}).trim();
const r7Blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const r7ReadLinked=link=>{
  assert.match(link?.path||'',/^docs\/checkpoints\/[A-Z0-9_]+\.json$/);
  assert.match(link?.gitBlob||'',/^[a-f0-9]{40}$/);
  const bytes=fs.readFileSync(link.path);assert.equal(r7Blob(bytes),link.gitBlob);
  assert.equal(r7Git('rev-parse','HEAD:'+link.path),link.gitBlob);
  return JSON.parse(bytes);
};
assert.equal(r7Git('rev-parse','HEAD'),process.env.GITHUB_SHA);
assert.equal(r7Git('rev-parse',SRC+'^{tree}'),descriptor.productTreeAuthority);
const packagePath=process.env.CXORBIA_I3_SESSION_PACKAGE||'';
assert.equal(packagePath,'docs/checkpoints/CXORBIA_I3_C02_D04_INDEPENDENT_SESSION_PACKAGE_20261029_R7.json');
const packageBytes=fs.readFileSync(packagePath),packageBlob=r7Blob(packageBytes);
const execution=JSON.parse(fs.readFileSync('CXORBIA_RECOVERY_EXECUTION_CURRENT.json','utf8'));
assert.equal(execution.currentSessionProofPackage?.path,packagePath);
assert.equal(execution.currentSessionProofPackage?.gitBlob,packageBlob);
assert.equal(r7Git('rev-parse','HEAD:'+packagePath),packageBlob);
sessionPackage=JSON.parse(packageBytes);
sessionPreflight=JSON.parse(fs.readFileSync(process.env.CXORBIA_I3_SESSION_PREFLIGHT,'utf8'));
assert.equal(sessionPackage.schemaVersion,'cxorbia.i3.c02-d04.independent-session-package.v1');
assert.equal(sessionPackage.id,'CXORBIA-I3-D07-C04-C05-BOUNDED-20261029-R8');
assert.equal(sessionPackage.mode,'R7_D07_C04_C05_BOUNDED');
assert.equal(sessionPackage.attemptNumber,8);
assert.equal(sessionPackage.expectedControlParentSha,r7Git('rev-parse','HEAD^'));
assert.equal(sessionPackage.sourceSha,SRC);assert.equal(sessionPackage.sourceTree,descriptor.productTreeAuthority);
assert.equal(sessionPackage.production,false);
assert.equal(sessionPackage.actor.uid,'NkcIVM4AnSU1gI9cGKHI5P12YqC3');
assert.equal(sessionPackage.actor.tenantId,'tya');assert.equal(sessionPackage.actor.projectId,'cinepolis');assert.equal(sessionPackage.actor.role,'admin');
assert.equal(sessionPackage.actor.createUser,false);assert.equal(sessionPackage.actor.changeClaims,false);
assert.equal(sessionPackage.c02.execute,false);assert.equal(sessionPackage.c02.replayReconciliation,false);
assert.equal(sessionPackage.d04.execute,false);
for(const key of ['fixtureSeeds','contentEdits','fixtureDeletes'])assert.equal(sessionPackage.d04[key],0);
for(const key of ['authMutations','hrWrites','resourceWrites','storageWrites','deploys'])assert.equal(sessionPackage.scope[key],0);
assert.equal(sessionPackage.scope.production,false);
assert.equal(sessionPackage.d07.execute,true);assert.deepEqual(sessionPackage.d07.roles,['admin','shopper']);
assert.equal(sessionPackage.d07.tenantId,'tya');assert.equal(sessionPackage.d07.projectId,'cinepolis');
assert.equal(sessionPackage.d07.periodId,'cinepolis-2026-10');
assert.equal(sessionPackage.d07.shopperId,'TYA_GT_393371F88D10F7A8');
assert.equal(sessionPackage.d07.shopperUidFingerprint,'a6e3ff21498bd79cbc4078ec47b7b5760a6534e43803614e997bb2294d77ee98');
assert.equal(sessionPackage.d07.bucket,'cxorbia-backend-dev.firebasestorage.app');
assert.equal(sessionPackage.d07.approvedName,'Instructivo Shopper.pdf');assert.equal(sessionPackage.d07.approvedSize,162335);
assert.equal(sessionPackage.d07.approvedSha256,'3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454');
assert.equal(sessionPackage.d07.binaryGetsPerRole,1);assert.equal(sessionPackage.d07.downloadsPerRole,1);
for(const key of ['resourceCrud','storageRuleChanges','serviceWorkerChanges'])assert.equal(sessionPackage.d07[key],false);assert.equal(sessionPackage.d07.corsChanges,true);assert.equal(sessionPackage.scope.providerConfigWritesMax,1);
assert.equal(sessionPackage.c04c05.execute,true);assert.equal(sessionPackage.c04c05.commands,4);
assert.equal(sessionPackage.c04c05.replays,2);assert.equal(sessionPackage.c04c05.maxLinkedDocuments,13);
assert.equal(sessionPackage.c04c05.helperSha256,'aec21d3231eb895ee7c873ab22ab8bf74125c37457b915a5e95ca0059d3aed3b');
assert.equal(sessionPackage.scope.financeCommands,4);assert.equal(sessionPackage.scope.financeReplays,2);
assert.equal(sessionPackage.scope.financeProviderWrites,15);assert.equal(sessionPackage.scope.cleanupDeletes,13);
assert.equal(sessionPackage.sourceProof?.decision,'PASS_I3_B_CUMULATIVE_SOURCE_PROOF');
assert.equal(sessionPackage.sourceProof?.workflowPath,'.github/workflows/cxorbia-recovery-i3-dev-certification.yml');
assert.equal(sessionPackage.sourceProof?.jobName,'phasea-rejected-checkpoint-source-proof');
for(const field of ['runId','jobId','artifactId'])assert.ok(Number.isSafeInteger(sessionPackage.sourceProof[field])&&sessionPackage.sourceProof[field]>0);
assert.match(sessionPackage.sourceProof.headSha,/^[a-f0-9]{40}$/);
assert.match(sessionPackage.sourceProof.artifactDigest,/^sha256:[a-f0-9]{64}$/);
const ciReceipt=r7ReadLinked(sessionPackage.sourceProof.receipt);
assert.equal(ciReceipt.decision,'PASS_I3_B_CUMULATIVE_SOURCE_PROOF');assert.equal(ciReceipt.sourceSha,SRC);assert.equal(ciReceipt.sourceTree,descriptor.productTreeAuthority);assert.equal(ciReceipt.production,false);
for(const [receiptField,packageField] of [['runId','runId'],['sourceJobId','jobId'],['artifactId','artifactId'],['controlSha','headSha']])assert.equal(ciReceipt[receiptField],sessionPackage.sourceProof[packageField],'R7_SOURCE_PROOF_RECEIPT:'+receiptField);
assert.equal('sha256:'+ciReceipt.artifactZipSha256,sessionPackage.sourceProof.artifactDigest);
const repair=r7ReadLinked(sessionPackage.sourceRepair);
assert.equal(repair.sourceSha,SRC);assert.equal(repair.sourceTree,descriptor.productTreeAuthority);
const target=sessionPackage.materialization;
assert.equal(target.deliveryKind,'DEV_LIVE_MATERIALIZATION');assert.equal(target.origin,ROOT);
assert.equal(target.sourceSha,SRC);assert.equal(target.sourceTree,descriptor.productTreeAuthority);
assert.equal(target.runtimeSourceSha,SRC);assert.equal(target.hrRevision,HR);assert.equal(target.production,false);
assert.ok(Number.isSafeInteger(target.materializationRunId)&&target.materializationRunId>0);
assert.match(target.controlSha,/^[a-f0-9]{40}$/);
assert.match(target.runtimeRevision,/^cxorbia-live-hr-dev-[a-z0-9-]+$/);
assert.match(target.runtimeDigest,/^sha256:[a-f0-9]{64}$/);
assert.match(target.hostingVersion,/^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/);
assert.match(target.hostingRelease,/^sites\/cxorbia-backend-dev\/channels\/live\/releases\/[a-zA-Z0-9_-]+$/);
assert.equal(target.rulesRelease,'projects/cxorbia-backend-dev/releases/cloud.firestore');
assert.match(target.rulesetName,/^projects\/cxorbia-backend-dev\/rulesets\/[a-zA-Z0-9-]+$/);
assert.equal(target.rulesGitBlob,r7Git('rev-parse',SRC+':firestore.rules'));
const receipt=r7ReadLinked(target.receipt);
assert.equal(receipt.decision,'PASS_I3_PHASEA_CUMULATIVE_DEV_MATERIALIZATION');
for(const field of ['sourceSha','sourceTree','runtimeSourceSha','runtimeRevision','runtimeDigest','hrRevision','hostingVersion','hostingRelease','rulesRelease','rulesetName','rulesGitBlob','deliveryKind','origin','materializationRunId','controlSha','production'])assert.equal(receipt[field],target[field],'R7_MATERIALIZATION_RECEIPT:'+field);
assert.equal(sessionPreflight.decision,'PASS_R7_DEV_LIVE_MATERIALIZATION_PREFLIGHT');
assert.equal(sessionPreflight.mode,sessionPackage.mode);assert.equal(sessionPreflight.packageBlob,packageBlob);
assert.equal(sessionPreflight.controlSha,process.env.GITHUB_SHA);assert.equal(sessionPreflight.runId,RUN);
assert.deepEqual(sessionPreflight.materializationReceipt,target.receipt);
assert.deepEqual(sessionPreflight.sourceRepair,sessionPackage.sourceRepair);
assert.deepEqual(sessionPreflight.sourceProof,sessionPackage.sourceProof);
assert.equal(sessionPreflight.materializationControlSha,target.controlSha);
for(const field of ['sourceSha','sourceTree','runtimeSourceSha','runtimeRevision','runtimeDigest','hrRevision','hostingVersion','hostingRelease','rulesRelease','rulesetName','rulesGitBlob','deliveryKind','origin','materializationRunId','production'])assert.equal(sessionPreflight[field],target[field],'R7_PREFLIGHT_PIN:'+field);
for(const field of ['sourceIdentityVerified','runtimeIdentityVerified','hostingReleaseVerified','rulesReleaseVerified'])assert.equal(sessionPreflight[field],true);
const owners=['app/index-backend-dev.html','app/adapters/tya-financial-canonical-source-safe-adapter.js',
  'app/core/backend-browser-auth.js','app/core/backend-certifications.js','app/core/backend-cxdata-finance-read.js',
  'app/core/backend-finance-benefits.js','app/core/backend-protected-dev-mode.js','app/core/backend-protected-dev-session-continuity.js',
  'app/core/backend-resources.js','app/modules/cert.js','app/modules/documentos.js','app/modules/finanzas.js',
  'app/adapters/cxorbia-cxdata-command-boundary-v1.js','app/adapters/cxorbia-command-adapter-v1.js'];
assert.deepEqual(Object.keys(sessionPreflight.servedOwnerBlobs||{}).sort(),owners.slice().sort());
assert.deepEqual(Object.keys(target.owners||{}).sort(),owners.slice().sort());assert.equal(sessionPreflight.servedOwnerCount,owners.length);
for(const owner of owners){const canonical=r7Git('rev-parse',SRC+':'+owner);assert.equal(target.owners[owner],canonical);assert.equal(sessionPreflight.servedOwnerBlobs[owner],canonical);}
assert.equal(sessionPreflight.deploys,0);assert.equal(sessionPreflight.writes,0);
}else if(SESSION_PROOF_MODE){
  assert.equal(descriptor.status,'HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL');
  assert.equal(SRC,'946c3cb8eff6a043693b10ed628d2ebc860508e1');
  assert.equal(descriptor.productTreeAuthority,'4afcecfd4b41ac697995a1164115a23a46db44c7');
  const packagePath=process.env.CXORBIA_I3_SESSION_PACKAGE||'';
  assert.match(packagePath,/^docs\/checkpoints\/CXORBIA_I3_C02_D04_INDEPENDENT_SESSION_PACKAGE_20261029(?:_R[1-9][0-9]*)?\.json$/);
  const packageBytes=fs.readFileSync(packagePath);
  const packageBlob=createHash('sha1').update(Buffer.from('blob '+packageBytes.length+'\0')).update(packageBytes).digest('hex');
  const execution=JSON.parse(fs.readFileSync('CXORBIA_RECOVERY_EXECUTION_CURRENT.json','utf8'));
  assert.equal(execution.currentSessionProofPackage?.path,packagePath);
  assert.equal(execution.currentSessionProofPackage?.gitBlob,packageBlob);
  sessionPackage=JSON.parse(packageBytes);
  sessionPreflight=JSON.parse(fs.readFileSync(process.env.CXORBIA_I3_SESSION_PREFLIGHT,'utf8'));
  assert.equal(sessionPackage.schemaVersion,'cxorbia.i3.c02-d04.independent-session-package.v1');
  assert.equal(sessionPackage.sourceSha,SRC);
  assert.equal(sessionPackage.sourceTree,descriptor.productTreeAuthority);
  if(D07_READ_ONLY_MODE){
    assert.equal(sessionPackage.mode,'R6D07_READ_ONLY');
    assert.equal(sessionPackage.id,'CXORBIA-I3-D07-ADMIN-SHOPPER-READ-ONLY-20261029-R6');
    assert.equal(sessionPackage.attemptNumber,6);
    assert.equal(sessionPackage.c02.execute,false);
    assert.equal(sessionPackage.d04.execute,false);
    assert.equal(sessionPackage.d04.fixtureSeeds,0);
    assert.equal(sessionPackage.d04.contentEdits,0);
    assert.equal(sessionPackage.d04.fixtureDeletes,0);
    assert.equal(sessionPackage.scope.qaFixtureWrites,0);
    assert.equal(sessionPackage.scope.resourceWrites,0);
    assert.equal(sessionPackage.scope.storageWrites,0);
    assert.equal(sessionPackage.d07.shopperId,'TYA_GT_393371F88D10F7A8');
    assert.equal(sessionPackage.d07.shopperUidFingerprint,'a6e3ff21498bd79cbc4078ec47b7b5760a6534e43803614e997bb2294d77ee98');
    assert.deepEqual(sessionPackage.d07.roles,['admin','shopper']);
    assert.equal(sessionPackage.d07.tenantId,'tya');
    assert.equal(sessionPackage.d07.projectId,'cinepolis');
    assert.equal(sessionPackage.d07.periodId,'cinepolis-2026-10');
    assert.equal(sessionPackage.d07.approvedName,'Instructivo Shopper.pdf');
    assert.equal(sessionPackage.d07.approvedSize,162335);
    assert.equal(sessionPackage.d07.approvedSha256,'3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454');
    assert.equal(sessionPackage.d07.binaryGetsPerRole,1);
    assert.equal(sessionPackage.d07.downloadsPerRole,1);
    assert.equal(sessionPackage.d07.resourceCrud,false);
    assert.equal(sessionPackage.d07.corsChanges,false);
    assert.equal(sessionPackage.d07.serviceWorkerChanges,false);
    assert.equal(sessionPreflight.mode,'R6D07_READ_ONLY');
    assert.equal(sessionPreflight.sourceIdentityVerified,true);
    assert.equal(sessionPreflight.servedOwnerCount,12);
    assert.equal(sessionPreflight.servedOwnerBlobs?.['app/core/backend-resources.js'],'d3073758c85f0184cdd38fd9f88882ecc212c30c');
    assert.equal(sessionPreflight.servedOwnerBlobs?.['app/modules/documentos.js'],'db994135c9e38854000b13606e7fdd3872ab7e1b');
  }else{
    assert.ok(!sessionPackage.mode||sessionPackage.mode==='C02_D04_INDEPENDENT_SESSION');
    assert.equal(sessionPackage.id,'CXORBIA-I3-C02-D04-INDEPENDENT-SESSION-20261029-R5');
    assert.equal(sessionPackage.attemptNumber,5);
  }
  assert.equal(sessionPackage.c02.replayReconciliation,false);
  assert.equal(sessionPackage.actor.createUser,false);
  assert.equal(sessionPackage.actor.changeClaims,false);
  assert.equal(sessionPackage.sourceRepair.path,'docs/checkpoints/CXORBIA_I3_D04_EXACT_SERVER_READBACK_REPAIR_20261029.json');
  assert.equal(sessionPackage.sourceRepair.gitBlob,'87d53c006e247bec3b8ddde4599ce945fb6f48e8');
  const previewRequestPath='.github/control/CXORBIA_I3_CROSSFRONT_1029_DEV_PREVIEW_REQUEST.json';
  assert.equal(sessionPackage.preview.transportRequestPath,previewRequestPath);
  const previewRequestBytes=fs.readFileSync(previewRequestPath);
  const previewRequestBlob=createHash('sha1').update(Buffer.from('blob '+previewRequestBytes.length+'\0')).update(previewRequestBytes).digest('hex');
  assert.equal(sessionPackage.preview.transportRequestGitBlob,previewRequestBlob);
  const previewRequest=JSON.parse(previewRequestBytes);
  assert.equal(previewRequest.sourceSha,SRC);
  assert.equal(previewRequest.sourceTree,descriptor.productTreeAuthority);
  assert.deepEqual(sessionPackage.sourceProof,previewRequest.sourceProof);
  assert.match(sessionPackage.preview.controlSha,/^[a-f0-9]{40}$/);
  assert.ok(Number.isSafeInteger(sessionPackage.preview.runId)&&sessionPackage.preview.runId>0);
  assert.equal(sessionPackage.preview.runId,40973709501);
  assert.ok(Number.isSafeInteger(sessionPackage.preview.artifactId)&&sessionPackage.preview.artifactId>0);
  assert.notEqual(sessionPackage.preview.runId,40901257714);
  assert.match(sessionPackage.preview.artifactZipSha256,/^[a-f0-9]{64}$/);
  assert.equal(sessionPackage.preview.channel,'i3-recovery-1029-'+sessionPackage.preview.runId);
  assert.equal(sessionPackage.preview.transportDecision,'PASS_I3_CROSSFRONT_1029_DEV_HOSTING_PREVIEW_EXACT_BYTES_ISOLATED');
  assert.equal(sessionPackage.preview.servedFilesMatch,8);
  assert.equal(sessionPackage.preview.production,false);
  assert.equal(sessionPackage.production,false);
  assert.equal(sessionPackage.actor.uid,'NkcIVM4AnSU1gI9cGKHI5P12YqC3');
  assert.equal(ROOT,sessionPackage.preview.origin);
  assert.equal(ROOT,'https://cxorbia-backend-dev--i3-recovery-1029-40973709501-011nk50h.web.app');
  assert.equal(sessionPackage.preview.hostingVersion,'sites/cxorbia-backend-dev/versions/bd065678b1af6c14');
  assert.match(ROOT,/^https:\/\/cxorbia-backend-dev--i3-recovery-1029-[1-9][0-9]*-[a-z0-9]+\.web\.app$/);
  assert.ok(ROOT.startsWith('https://cxorbia-backend-dev--'+sessionPackage.preview.channel+'-'));
  assert.match(sessionPackage.preview.hostingVersion,/^sites\/cxorbia-backend-dev\/versions\/[a-f0-9]+$/);
  assert.equal(sessionPreflight.decision,D07_READ_ONLY_MODE?'PASS_D07_EXISTING_PREVIEW_PREFLIGHT':'PASS_C02_D04_EXISTING_PREVIEW_PREFLIGHT');
  assert.equal(sessionPreflight.sourceSha,SRC);
  assert.equal(sessionPreflight.sourceTree,descriptor.productTreeAuthority);
  assert.equal(sessionPreflight.packageBlob,packageBlob);
  assert.equal(sessionPreflight.runId,RUN);
  assert.equal(sessionPreflight.controlSha,process.env.GITHUB_SHA);
  assert.equal(sessionPreflight.hrRevision,HR);
  assert.equal(sessionPreflight.previewOrigin,ROOT);
  assert.equal(sessionPreflight.hostingVersion,sessionPackage.preview.hostingVersion);
  assert.equal(sessionPreflight.runtimeRevision,sessionPackage.preview.runtimeRevision);
  assert.equal(sessionPreflight.runtimeDigest,sessionPackage.preview.runtimeDigest);
  assert.equal(sessionPackage.preview.runtimeRevision,'cxorbia-live-hr-dev-00330-fim');
  assert.equal(sessionPackage.preview.runtimeDigest,'sha256:bba5ebbf19c203954ec0be6c2c3ef01a057e7ce3f98fb7e5eeac2d889bd0a500');
  assert.equal(sessionPreflight.previewControlSha,sessionPackage.preview.controlSha);
  assert.equal(sessionPreflight.previewRunId,sessionPackage.preview.runId);
  assert.equal(sessionPreflight.previewArtifactId,sessionPackage.preview.artifactId);
  assert.equal(sessionPreflight.previewArtifactZipSha256,sessionPackage.preview.artifactZipSha256);
  assert.equal(sessionPreflight.production,false);
}else{
  assert.equal(descriptor.status,'HOLD_I3_D04_E04_LIVE_E2E_REQUIRED');
  assert.equal(descriptor.currentMaterialization?.sourceSha,SRC);
  assert.ok(Number(descriptor.currentMaterialization?.runNumber)>=1796,'D04 naming requires newly materialized source');
}
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc('tya');
const str=x=>String(x??'').trim();
const materialization=R7_MODE?{runId:sessionPackage.materialization.materializationRunId,...sessionPackage.materialization}:SESSION_PROOF_MODE?{runId:sessionPackage.preview.runId,...sessionPackage.preview}:descriptor.currentMaterialization;
const res={decision:'HOLD',version:'cxorbia.i3.d04-e04.name-edit.connected.v2',sourceSha:SRC,sourceTree:descriptor.productTreeAuthority,materializationRunId:materialization.runId,hostingVersion:materialization.hostingVersion,runtimeRevision:materialization.runtimeRevision,hrRevision:HR,scope:{tenant:'tya',project:'cinepolis'},d04:{},e04:{},cleanup:{},writes:{auth:0,hr:0,otherBanks:0,production:0},production:false};
if(R7_MODE){
  res.packageBlob=sessionPreflight.packageBlob;res.controlSha=sessionPreflight.controlSha;
  res.materialization={...sessionPackage.materialization};res.deploys=0;
  res.i3='HOLD';res.gate20='HOLD';res.gate21='HOLD';res.i4Authorized=false;
}else if(SESSION_PROOF_MODE){
  res.version='cxorbia.i3.c02-d04.independent-sessions.v1';
  res.scope={tenant:'tya',project:'cinepolis',period:'cinepolis-2026-10',taskIds:['C02','D04']};
  res.preview={origin:ROOT,runId:sessionPackage.preview.runId,hostingVersion:sessionPackage.preview.hostingVersion,
    runtimeRevision:sessionPreflight.runtimeRevision,runtimeDigest:sessionPreflight.runtimeDigest};
  res.packageBlob=sessionPreflight.packageBlob;
  res.controlSha=sessionPreflight.controlSha;
  res.writes.finance=null;
  res.writes.qaResourceSeed=0;
  res.writes.qaResourceEdit=0;
  res.writes.qaResourceCleanup=0;
  res.deploys=0;
  res.i3='HOLD';res.gate20='HOLD';res.gate21='HOLD';res.i4Authorized=false;
}
let browser,qaRef=null;
const record=()=>fs.writeFileSync(OUT+'/result.json',JSON.stringify(res,null,2)+'\n');
const url=ROOT+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxProjectId=cinepolis&d04run='+RUN;
async function evaluatePage(page,fn,arg){
 const operation=page.evaluate(fn,arg);
 if(!SESSION_PROOF_MODE)return operation;
 let timer;
 try{return await Promise.race([operation,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('ENVIRONMENT_FAILURE:BOUNDED_PAGE_EVALUATION_TIMEOUT')),60000);})]);}
 finally{clearTimeout(timer);}
}
async function member(role){
 const all=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...d.data()}));
 const pool=all.filter(m=>m.active!==false&&
   (role==='admin'?['admin','super'].includes(str(m.role).toLowerCase())&&str(m.authNamespace).toLowerCase()!=='shopper':
    ['cliente','client'].includes(str(m.role).toLowerCase())&&str(m.authNamespace).toLowerCase()==='staff'));
 for(const m of pool){
  const ids=Array.isArray(m.projectIds)?m.projectIds.map(String):[];
  if(ids.length&&!ids.includes('cinepolis')&&str(m.scopeProjectId)!=='cinepolis')continue;
  try{const u=await auth.getUser(m.id);if(!u.disabled)return m;}catch(e){if(str(e.code)!=='auth/user-not-found')throw e;}
 }
 throw Error('AUTH_FAILURE:'+role.toUpperCase()+'_SCOPED_MEMBER_UNAVAILABLE');
}
async function sign(m,role){
 if(D07_READ_ONLY_MODE)return signD07Role(m,role);
 const ctx=await browser.newContext({viewport:{width:1400,height:940}}),page=await ctx.newPage();
 await page.goto(url+'&pre='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
 let sessionBoundary=null;
 if(SESSION_PROOF_MODE){
  assert.equal(role,'admin');
  assert.equal(m.id,sessionPackage.actor.uid);
  const initiallySignedOut=await evaluatePage(page,async()=>{
   const instance=window.firebase.auth();
   let unsubscribe=null,timer;
   try{return await new Promise((resolve,reject)=>{
    timer=setTimeout(()=>reject(Error('AUTH_INITIAL_STATE_TIMEOUT')),30000);
    unsubscribe=instance.onAuthStateChanged(user=>resolve(user===null),reject);
   });}finally{clearTimeout(timer);if(unsubscribe)unsubscribe();}
  });
  assert.equal(initiallySignedOut,true,'AUTH_FAILURE:NEW_CONTEXT_NOT_EMPTY');
  sessionBoundary={newBrowserContext:true,authNullBeforeSignIn:true,expectedActorUid:m.id,
   mechanism:'existing_ci_custom_token_in_memory',ordinaryPasswordLoginProven:false,tokenLogged:false};
 }
 const token=await auth.createCustomToken(m.id);
 await evaluatePage(page,async t=>{const a=window.firebase.auth();await a.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await a.signInWithCustomToken(t);},token);
 await page.goto('about:blank');
 await page.goto(url+'&signed='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(id=>String(window.firebase?.auth?.().currentUser?.uid||'')===id,m.id,{timeout:90000});
 await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
 await evaluatePage(page,async()=>{await window.CX.backendAuth.ensureAuthenticated();});
 try{
 await page.waitForFunction(input=>{const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},r=String(c.role||'').toLowerCase();
  return c.authenticated===true&&(input.role==='admin'?['admin','super'].includes(r):['cliente','client'].includes(r))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&/^[0-9a-f]{64}$/.test(String(window.CX?.data?.previewMeta?.sourceRevision||''));},{role,hr:HR},{timeout:30000});
 }catch(e){
  const diag=await evaluatePage(page,()=>{const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},m=window.CX?.data?.previewMeta||{};
   return {firebaseAuth:!!window.firebase?.auth?.().currentUser,contextAuth:c.authenticated===true,contextRole:String(c.role||''),sessionRole:String(window.CX?.session?.role||''),project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.currentPeriodId||''),hrApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,gateReady:g.ready===true,gateBlocked:g.blocked===true,gateReason:String(g.reason||g.code||'').slice(0,120),sourceRevision:String(m.sourceRevision||''),resourcesAvailable:!!window.CX?.backendResources?.load};});
  throw Error('ENVIRONMENT_FAILURE:D04_E04_PROTECTED_HR_GATE:'+JSON.stringify({role,expectedRevision:HR,observed:diag}));
 }
 const liveRev=await evaluatePage(page,()=>String(window.CX?.data?.previewMeta?.sourceRevision||''));
 if(!/^[0-9a-f]{64}$/.test(liveRev))throw Error('PROVIDER_FAILURE:D04_E04_HR_REVISION_NOT_CERTIFIABLE');
 if(SESSION_PROOF_MODE){
  assert.equal(liveRev,HR,'PROVIDER_FAILURE:SESSION_HR_REVISION_DIFFERS_FROM_PREFLIGHT');
  if(res.hrRevisionLive)assert.equal(liveRev,res.hrRevisionLive,'PROVIDER_FAILURE:INDEPENDENT_SESSION_HR_REVISION_DRIFT');
  const principal=await evaluatePage(page,()=>{const c=window.CX.backendAuth.context();return {uid:window.firebase.auth().currentUser.uid,role:c.role,tenantId:c.tenantId,authNamespace:c.authNamespace};});
  assert.equal(principal.uid,m.id);
  assert.ok(['admin','super'].includes(principal.role));
  assert.equal(principal.tenantId,'tya');
  assert.equal(principal.authNamespace,'staff');
  sessionBoundary.principal=principal;
  sessionBoundary.authenticatedActorUid=m.id;
  sessionBoundary.applicationAuthAndHrGatePassed=true;
 }
 if(role==='admin'){
  res.hrRevisionLive=liveRev;
  res.hrRevisionChangedSinceMaterialization=liveRev!==HR;
 }else if(res.hrRevisionLive!==liveRev){
  throw Error('PROVIDER_FAILURE:D04_E04_ADMIN_CLIENT_HR_REVISION_MISMATCH');
 }
 return {ctx,page,sessionBoundary};
}
async function exactSessionProofAdmin(){
 const uid=sessionPackage.actor.uid;
 const user=await auth.getUser(uid);
 assert.equal(user.disabled,false,'AUTH_FAILURE:EXACT_ADMIN_DISABLED');
 const claims=user.customClaims||{};
 assert.ok(['admin','super'].includes(str(claims.role).toLowerCase()),'AUTH_FAILURE:EXACT_ADMIN_ROLE');
 assert.ok(['','staff'].includes(str(claims.authNamespace).toLowerCase()),'AUTH_FAILURE:EXACT_ADMIN_NAMESPACE');
 assert.ok(claims.tenantId==='tya'||(Array.isArray(claims.tenants)&&claims.tenants.includes('tya')),'AUTH_FAILURE:EXACT_ADMIN_TENANT');
 const ids=Array.isArray(claims.projectIds)?claims.projectIds.map(String):[];
 assert.ok(!ids.length||ids.includes('cinepolis'),'AUTH_FAILURE:EXACT_ADMIN_PROJECT');
 const snap=await tenant.collection('users').doc(uid).get();
 if(snap.exists){
  const member=snap.data();
  assert.notEqual(member.active,false,'AUTH_FAILURE:EXACT_ADMIN_MEMBERSHIP_DISABLED');
  assert.ok(['admin','super'].includes(str(member.role).toLowerCase()),'AUTH_FAILURE:EXACT_ADMIN_MEMBERSHIP_ROLE');
  assert.notEqual(str(member.authNamespace).toLowerCase(),'shopper','AUTH_FAILURE:EXACT_ADMIN_MEMBERSHIP_NAMESPACE');
 }
 res.actor={uid,role:claims.role,authNamespace:'staff',tenantId:'tya',existingUser:true,
  membershipDocumentPresent:snap.exists,claimsChanged:false,createdUser:false};
 return {id:uid};
}

// Integration fragment for existing runner1782. Uses its assert, db, and OUT.
// No application mutation, credentials, tokens, or auth material are retained.
const C02_ID = 'hr_2026-10_gt_2_97b3975c30';
const C02_UID = 'NkcIVM4AnSU1gI9cGKHI5P12YqC3';
const C02_PATHS = {
  receipt: 'tenants/tya/commandReceipts/1c1fe3d3e9c8982e59577c9b41cb0b72b4996486',
  audit: 'tenants/tya/entityAuditTrail/finance-f652be05bb1506688e59ba5fac06616dccebbd61',
  visit: 'tenants/tya/projects/cinepolis/visits/OCTUBRE 26!2',
};
const C02_MATCH = {
  status: 'reconciled_exact', authority: 'project_country_config', projectConfigVersion: 4,
  sourceRevision: '6fd4beb82cc85e61c26f54992fc60fd28d49f9b1c832654dba6fd3204571bcbf',
  visitId: C02_ID, durableVisitId: 'OCTUBRE 26!2', hrRowId: 'OCTUBRE 26!2',
  country: 'GT', pais: 'GT', currency: 'Q', moneda: 'Q',
  honorario: 60, honorarioSource: 'project_country_config', boleto: 33, combo: 112,
  reembolso: 145, total: 205, estado: 'validada',
  liquidationState: 'validated_financial_source', paymentState: 'not_scheduled',
  externalPaymentConfirmed: false, paymentSourceRef: null,
  reconciledAt: '2026-10-29T20:07:36.274Z', reconciledBy: C02_UID,
};

function c02Normalize(value) {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(c02Normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, c02Normalize(child)]));
  }
  return value;
}

async function readC02Durable() {
  const names = Object.keys(C02_PATHS);
  const snapshots = await db.getAll(...names.map(key => db.doc(C02_PATHS[key])));
  const docs = {};
  for (let index = 0; index < names.length; index++) {
    const key = names[index], snapshot = snapshots[index];
    assert.ok(snapshot.exists, 'C02_DOCUMENT_MISSING:' + key);
    assert.ok(snapshot.updateTime, 'C02_UPDATE_TIME_REQUIRED:' + key);
    const data = c02Normalize(snapshot.data());
    assert.equal(Object.keys(data.financialMatch || {}).length, 24, 'C02_MATCH_FIELD_COUNT:' + key);
    assert.deepEqual(data.financialMatch, C02_MATCH, 'C02_MATCH_DRIFT:' + key);
    docs[key] = {
      path: snapshot.ref.path,
      updateTime: {seconds: snapshot.updateTime.seconds, nanoseconds: snapshot.updateTime.nanoseconds},
      financialMatch: data.financialMatch,
    };
    if (key === 'receipt') {
      assert.equal(data.commandType, 'finance.reconcile.visit');
      assert.equal(data.entityId, 'OCTUBRE 26!2');
      assert.equal(data.actorUid, C02_UID);
      assert.equal(data.providerAck, true);
      assert.equal(data.status, 'committed');
      assert.equal(data.updatedAt, '2026-10-29T20:07:36.275Z');
      assert.equal(data.commandDigest, '105da7149063d5e430e3488ca91421c009fb8a398d8e0594142db2b5c43dc8df');
      docs[key].header = {
        commandType: data.commandType, entityId: data.entityId, actorUid: data.actorUid,
        providerAck: data.providerAck, status: data.status, updatedAt: data.updatedAt,
        commandDigest: data.commandDigest,
      };
    } else if (key === 'audit') {
      assert.equal(data.commandType, 'finance.reconcile.visit');
      assert.equal(data.entityId, 'OCTUBRE 26!2');
      assert.equal(data.entityType, 'financeReconciliation');
      assert.equal(data.actorUid, C02_UID);
      assert.equal(data.actorRole, 'admin');
      assert.equal(data.tenantId, 'tya');
      assert.equal(data.projectId, 'cinepolis');
      assert.equal(data.periodId, 'cinepolis-2026-10');
      assert.equal(data.externalPaymentConfirmed, false);
      assert.equal(data.createdAt, '2026-10-29T20:07:36.275Z');
      assert.equal(data.idempotencyKey, 'finance.reconcile.visit:19vve9y');
      docs[key].header = {
        commandType: data.commandType, entityId: data.entityId, entityType: data.entityType,
        actorUid: data.actorUid, actorRole: data.actorRole, tenantId: data.tenantId,
        projectId: data.projectId, periodId: data.periodId,
        externalPaymentConfirmed: data.externalPaymentConfirmed,
        createdAt: data.createdAt, idempotencyKey: data.idempotencyKey,
      };
    } else {
      assert.equal(data.financialSourceStatus, 'reconciled_exact');
      assert.equal(data.financialReviewRequired, false);
      assert.equal(data.version, 25);
      assert.equal(data.updatedAt, '2026-10-29T20:07:36.275Z');
      docs[key].header = {
        financialSourceStatus: data.financialSourceStatus,
        financialReviewRequired: data.financialReviewRequired,
        version: data.version, updatedAt: data.updatedAt,
      };
    }
  }
  return docs;
}

async function readC02(page, label) {
  assert.match(label, /^[a-z0-9-]+$/);
  const mutations = [];
  const observe = request => {
    const requestUrl = new URL(request.url()), method = request.method();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return;
    const command = requestUrl.pathname === '/v1/cxorbia/commands';
    const firestoreWrite = requestUrl.hostname === 'firestore.googleapis.com' &&
      (/\/Write\/channel$/.test(requestUrl.pathname) || /:commit$/.test(requestUrl.pathname));
    if (!command && !firestoreWrite) return;
    let commandType = '';
    if (command) {
      try { commandType = String(request.postDataJSON()?.commandType || 'unknown'); } catch { commandType = 'unparsed'; }
    }
    mutations.push({method, path: requestUrl.pathname, commandType});
    res.c02.unexpectedMutationRequests=mutations;
    res.writes.finance=null;
  };
  page.on('request', observe);
  try {
    const normalizeText = value => String(value || '').replace(/\s+/g, ' ').trim();
    const money = (value, amount) => assert.match(normalizeText(value), new RegExp('^Q\\s*' + amount + '(?:[.,]0+)?$'));
    await page.locator('#projSel').waitFor({state: 'visible', timeout: 45000});
    if (await page.locator('#projSel').inputValue() !== 'cinepolis') {
      await page.locator('#projSel').selectOption('cinepolis');
    }
    await page.locator('#periodSel option[value="cinepolis-2026-10"]').waitFor({state: 'attached', timeout: 45000});
    if (await page.locator('#periodSel').inputValue() !== 'cinepolis-2026-10') {
      await page.locator('#periodSel').selectOption('cinepolis-2026-10');
    }
    const nav = page.locator('#nav-liquidaciones');
    await nav.waitFor({state: 'attached', timeout: 30000});
    if (!await nav.isVisible()) {
      await page.locator('.nav-sec-wrap').filter({has: page.locator('#nav-liquidaciones')}).locator('.nav-sec').click();
    }
    await nav.click();
    const detailSelector = '[data-ldetail="' + C02_ID + '"]';
    const row = page.locator('#view tr[data-li]').filter({has: page.locator(detailSelector)});
    await row.waitFor({state: 'visible', timeout: 45000});
    assert.equal(await row.count(), 1, 'C02_UNIQUE_ROW');
    const cells = (await row.locator(':scope > td').allTextContents()).map(normalizeText);
    assert.equal(cells[1], 'Julissa Flores');
    assert.match(cells[2], /^C\.\s*Miraflores$/);
    assert.equal(cells[4], 'Validada · lista para lote');
    assert.equal(cells[5], '✅');
    money(cells[6], 60); money(cells[7], 145); money(cells[8], 205);
    await row.locator(detailSelector).click();
    const modal = page.getByRole('dialog', {name: 'Detalle financiero · Julissa Flores', exact: true});
    await modal.waitFor({state: 'visible', timeout: 10000});
    const fields = await modal.locator('.grid.g2 > div').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [
      String(node.querySelector(':scope > span.muted')?.textContent || '').trim(),
      String(node.querySelector(':scope > div')?.innerText || '').replace(/\s+/g, ' ').trim(),
    ])));
    assert.equal(fields.Estado, 'Validada · lista para lote');
    money(fields.Honorario, 60); money(fields.Reembolso, 145); money(fields.Total, 205);
    assert.equal(fields['Pago externo'], 'No confirmado');
    assert.equal(await modal.locator('#liqDetailReconcile').count(), 0, 'C02_NO_RECONCILE_REQUIRED');
    assert.equal(await page.locator('#projSel').inputValue(), 'cinepolis');
    assert.equal(await page.locator('#periodSel').inputValue(), 'cinepolis-2026-10');
    const screenshot = 'c02-' + label + '.png';
    await modal.screenshot({path: OUT + '/' + screenshot});
    await modal.locator('[data-x]').click();
    assert.deepEqual(mutations, [], 'C02_READ_ONLY_MUTATION_REQUEST');
    return {
      label, method: 'VISIBLE_DOM_READ_ONLY', projectId: 'cinepolis', periodId: 'cinepolis-2026-10',
      uiVisitId: C02_ID, uniqueRowCount: 1, cells, detail: fields, screenshot,
      mutationRequests: mutations, reconcileClicks: 0, paymentClicks: 0, batchClicks: 0,
    };
  } finally {
    page.off('request', observe);
  }
}


// Nonblocking CI-only diagnostic fragment. Uses the existing runner's db and ROOT.
// Reuses only the resource metadata already loaded by the approved D04 case.
// Do not click Abrir, enter the PDF viewer, or call readPublishedPdf for this probe.
// No Storage GET, token, response body, upload, CORS change, or broad metadata query.
async function readD07OptionsFromLoadedCatalog(page) {
  const out = {
    decision: 'NOT_PROVEN', scope: 'ONE_ALREADY_LOADED_AUTHORIZED_PDF_OPTIONS_ONLY',
    binaryGetAttempted: false, tokenUsed: false, writes: 0,
    metadataBinding: 'MISSING', probes: {},
  };
  const boundedRead = async promise => {
    let timer;
    try {
      return await Promise.race([promise, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('D07_DIAGNOSTIC_READ_TIMEOUT')), 6000);
      })]);
    } finally { clearTimeout(timer); }
  };
  try {
    const previewOrigin = new URL(ROOT).origin;
    if (!/^https:\/\/cxorbia-backend-dev--[-a-z0-9]+\.web\.app$/.test(previewOrigin) ||
        new URL(page.url()).origin !== previewOrigin) {
      return {...out, decision: 'NOT_PROVEN_PREVIEW_ORIGIN_MISMATCH'};
    }
    // This is the existing CI provider test, not Browser-plugin page inspection.
    // No load(), collection query, navigation, viewer, token, or binary call occurs.
    const binding = await boundedRead(page.evaluate(() => {
      const normalize = value => String(value || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const status = window.CX_BACKEND_RESOURCES_STATUS || {};
      if (status.status !== 'ready' || status.tenantId !== 'tya' ||
          status.projectId !== 'cinepolis' || status.periodId !== 'cinepolis-2026-10') return null;
      const items = window.CX?.backendResources?.items;
      if (!Array.isArray(items)) return null;
      const matches = items.filter(item => {
        const mime = String(item.mimeType || item.contentType || '').trim().toLowerCase();
        return item.status === 'active' && item.resourceType === 'project_resource' &&
          item.tenantId === 'tya' && item.projectId === 'cinepolis' && item.periodId === 'cinepolis-2026-10' &&
          String(item.tipo || '').toLowerCase() === 'pdf' && (!mime || /^application\/pdf(?:;|$)/.test(mime)) &&
          [item.n, item.meta].some(value => normalize(value) === 'instructivo shopper.pdf') &&
          /\.pdf$/i.test(String(item.storagePath || ''));
      });
      if (matches.length !== 1) return null;
      const item = matches[0];
      return {id: String(item.id || ''), storagePath: String(item.storagePath || ''), version: item.version ?? null,
        bucket: String(window.firebase?.app?.().options?.storageBucket || '')};
    }));
    if (!binding || !/^[-a-zA-Z0-9_]+$/.test(binding.id)) {
      return {...out, decision: 'NOT_PROVEN_EXACT_LOADED_RESOURCE_MISSING_OR_AMBIGUOUS'};
    }
    const resourceId = binding.id;
    const snapshot = await boundedRead(db.doc('tenants/tya/resources/' + resourceId).get());
    if (!snapshot.exists) return {...out, decision: 'NOT_PROVEN_EXACT_RESOURCE_METADATA_MISSING'};
    const data = snapshot.data() || {};
    const normalize = value => String(value || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const mime = String(data.mimeType || data.contentType || '').trim().toLowerCase();
    if (data.status !== 'active' || data.resourceType !== 'project_resource' ||
        String(data.tipo || '').toLowerCase() !== 'pdf' || data.tenantId !== 'tya' ||
        data.projectId !== 'cinepolis' || data.periodId !== 'cinepolis-2026-10' ||
        (data.id && data.id !== resourceId) ||
        (mime && !/^application\/pdf(?:;|$)/.test(mime)) ||
        String(data.storagePath || '') !== binding.storagePath || (data.version ?? null) !== binding.version ||
        ![data.n, data.meta].some(value => normalize(value) === 'instructivo shopper.pdf')) {
      return {...out, decision: 'NOT_PROVEN_EXACT_RESOURCE_METADATA_SCOPE_MISMATCH'};
    }
    const storagePath = String(data.storagePath || '');
    const prefix = 'tenants/tya/projects/cinepolis/periods/cinepolis-2026-10/resources/' + resourceId + '/';
    const fileName = storagePath.startsWith(prefix) ? storagePath.slice(prefix.length) : '';
    if (!/^[-a-zA-Z0-9_.]+\.pdf$/i.test(fileName) || fileName.includes('..') ||
        normalize(fileName) !== 'instructivo shopper.pdf') {
      return {...out, decision: 'NOT_PROVEN_EXACT_STORAGE_PATH_MISSING_OR_MISMATCH'};
    }
    const bucket = binding.bucket;
    if (bucket !== 'cxorbia-backend-dev.firebasestorage.app') {
      return {...out, decision: 'NOT_PROVEN_DEV_BUCKET_MISMATCH'};
    }
    const endpoint = 'https://firebasestorage.googleapis.com/v0/b/' + encodeURIComponent(bucket) +
      '/o/' + encodeURIComponent(storagePath) + '?alt=media';
    out.metadataBinding = 'LOADED_EXACT_DOCUMENT_AND_STORAGE_PATH_VERIFIED';
    out.resourceId=resourceId;
    out.resourceVersion=binding.version;
    out.storagePathSha256=createHash('sha256').update(storagePath).digest('hex');
    const origins = {preview: previewOrigin, dev: 'https://cxorbia-backend-dev.web.app'};
    const entries = await Promise.all(Object.entries(origins).map(async ([label, origin]) => {
      // Only safe response status and CORS headers are retained. No body is read.
      let result = {status: 'NO_RESPONSE', ACAO: null, ACAM: null, ACAH: null, Vary: null};
      try {
        const response = await fetch(endpoint, {
          method: 'OPTIONS', redirect: 'manual', cache: 'no-store',
          headers: {
            Origin: origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'authorization',
          },
          signal: AbortSignal.timeout(10000),
        });
        result = {
          status: response.status,
          ACAO: response.headers.get('access-control-allow-origin'),
          ACAM: response.headers.get('access-control-allow-methods'),
          ACAH: response.headers.get('access-control-allow-headers'),
          Vary: response.headers.get('vary'),
        };
        await response.body?.cancel().catch(() => {});
      } catch {
        // No raw error messages, URLs, headers, tokens, or body are emitted.
      }
      return [label, result];
    }));
    out.probes = Object.fromEntries(entries);
    out.decision = 'HEADERS_OBSERVED_ONLY_NOT_D07_CERTIFICATION';
    return out;
  } catch {
    // This diagnostic must never block the independent C02 or D04 verdicts.
    return {...out, decision: 'NOT_PROVEN_DIAGNOSTIC_UNAVAILABLE'};
  }
}


let d04SessionBaseline = null;

async function d04OtherBankHeads(excludedId = '') {
  const rows = await tenant.collection('resources')
    .where('projectId', '==', 'cinepolis').where('status', '==', 'active').get();
  return rows.docs.filter(d => d.id !== excludedId && d.data()?.resourceType === 'certification_bank')
    .map(d => ({id: d.id, version: d.data().version, revision: d.data().bank?.contentRevision || '',
      updateTime:{seconds:d.updateTime.seconds,nanoseconds:d.updateTime.nanoseconds}}))
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function d04ReadEditorSession(page, fixture, label) {
  assert.match(label, /^[a-z0-9-]+$/);
  const loaded = await evaluatePage(page,async input => {
    const scope = {projectId: 'cinepolis', periodId: input.period};
    await window.CX.backendResources.load(scope);
    const matches = window.CX.backendResources.items.filter(x => x.id === input.rid);
    const item = matches[0];
    return {
      matched: matches.length,
      project: String(window.CX.data.currentProjectId || ''),
      period: String(window.CX.data.period()?.id || ''),
      uid: String(window.firebase.auth().currentUser?.uid || ''),
      version: item?.version, estado: item?.bank?.estado,
      certId: item?.bank?.certificationId,
      revision: item?.bank?.contentRevision,
      questions: item?.bank?.preguntas,
      history: item?.bank?.reviewHistory,
      sourceSha256: item?.bank?.documentSource?.source_sha256
    };
  }, fixture);
  assert.equal(loaded.matched, 1, 'D04_FRESH_SESSION_BANK_NOT_UNIQUE');
  assert.equal(loaded.project, 'cinepolis');
  assert.equal(loaded.period, fixture.period);
  assert.equal(loaded.uid, 'NkcIVM4AnSU1gI9cGKHI5P12YqC3');
  assert.equal(loaded.version, 2);
  assert.equal(loaded.estado, 'pending_review');
  assert.equal(loaded.certId, fixture.certId);
  assert.equal(loaded.revision, fixture.revision);
  assert.equal(loaded.sourceSha256, fixture.sourceSha256);
  assert.deepEqual(loaded.questions, fixture.questions);
  assert.deepEqual(loaded.history, fixture.history);

  await evaluatePage(page,id => {
    window.CX_CERT_SELECTED_ID = id;
    window.CX.router.nav('cert', {history: false});
  }, fixture.certId);
  await page.locator('#certReviewEdit').waitFor({state: 'visible', timeout: 30000});
  await page.locator('#certReviewEdit').click();
  await page.locator('#certReviewQuestions fieldset').last().waitFor({state: 'attached', timeout: 15000});
  const sourceText = await page.locator('#certReviewSource').innerText();
  assert.ok(sourceText.includes('SHA: ' + fixture.sourceSha256));
  assert.match(sourceText, /\bversión 2\b/);
  const visibleQuestions = await page.locator('#certReviewQuestions fieldset').evaluateAll(nodes => nodes.map(node => {
    const areas = Array.from(node.querySelectorAll('textarea'));
    const inputs = Array.from(node.querySelectorAll('input'));
    const ops = inputs.slice(0, 4).map(x => x.value);
    const choice = Number(node.querySelector('select').value);
    return {q: areas[0].value, ops, correcta: ops[choice], exp: areas[1].value, fuente: inputs[4].value};
  }));
  assert.equal(visibleQuestions.length, 15);
  assert.deepEqual(visibleQuestions, fixture.questions);
  assert.equal(await page.locator('#certReviewSave').isDisabled(), true);
  const screenshot = 'd04-' + label + '.png';
  await page.screenshot({path: OUT + '/' + screenshot, fullPage: true});
  return {
    backendLoad: true, uiEditorRead: true, role: 'admin', projectId: loaded.project,
    periodId: loaded.period, bankId: fixture.rid, certificationId: fixture.certId,
    version: 2, questions: 15, contentMatched: true, historyMatched: true,
    sourceMatched: true, pendingReview: true, saveDisabled: true, screenshot,
    writes: 0
  };
}

async function d04PrepareSessionFixture(page) {
  const attempt = String(process.env.GITHUB_RUN_ATTEMPT || '1');
  assert.match(RUN, /^\d+$/);
  assert.match(attempt, /^\d+$/);
  const runTag = RUN + '-' + attempt;
  const scope = await evaluatePage(page,() => ({
    project: String(window.CX.data.currentProjectId || ''),
    period: String(window.CX.data.period()?.id || ''),
    uid: String(window.firebase.auth().currentUser?.uid || '')
  }));
  assert.equal(scope.project, 'cinepolis');
  assert.equal(scope.period, 'cinepolis-2026-10');
  assert.equal(scope.uid, 'NkcIVM4AnSU1gI9cGKHI5P12YqC3');
  const certId = 'qa-i3-d04-session-' + runTag;
  const rid = 'certbank-cinepolis-' + scope.period + '-' + certId;
  const candidateRef = tenant.collection('resources').doc(rid);
  assert.equal((await candidateRef.get()).exists, false, 'D04_QA_COLLISION_DO_NOT_TOUCH');
  d04SessionBaseline = await d04OtherBankHeads();
  qaRef = candidateRef;
  const questions = Array.from({length: 15}, (_, i) => ({
    q: 'Pregunta QA ' + (i + 1), ops: ['Primera', 'Segunda', 'Tercera', 'Cuarta'],
    correcta: 'Primera', exp: 'Explicación QA', fuente: '[Página 1]'
  }));
  const sourceSha256 = 'a'.repeat(64); // Synthetic QA provenance; not the operational instructive.
  const seed = await evaluatePage(page,async input => {
    await window.CX.backendResources.load({projectId: 'cinepolis', periodId: input.period});
    const reply = await window.CX.certStore.save(input.period, {
      certificationId: input.certId, certificationName: 'QA D04 sesión ' + input.runTag,
      preguntas: input.questions, gate: 80, required: false, estado: 'pending_review',
      contentRevision: 'qa-session-' + input.runTag, generadoPorUid: 'qa-fixture-not-user',
      documentSource: {name: 'Fixture QA de sesión independiente', source_sha256: input.sourceSha256,
        extraction_quality: {pageCount: 1, sufficient: true}}
    }, input.certId);
    return {ack: reply?.providerAck === true, committed: reply?.committed === true,
      resourceId: reply?.item?.id, version: reply?.item?.version};
  }, {period: scope.period, certId, runTag, questions, sourceSha256});
  assert.deepEqual(seed, {ack: true, committed: true, resourceId: rid, version: 1});
  res.writes.qaResourceSeed=1;
  const initial = (await qaRef.get()).data();
  assert.equal(initial.version, 1);
  assert.deepEqual(initial.bank.preguntas, questions);
  assert.equal(initial.bank.estado, 'pending_review');

  await evaluatePage(page,id => {
    window.CX_CERT_SELECTED_ID = id;
    window.CX.router.nav('cert', {history: false});
  }, certId);
  await page.locator('#certReviewEdit').waitFor({state: 'visible', timeout: 30000});
  await page.locator('#certReviewEdit').click();
  const editedQuestion = 'Pregunta QA revisada para sesión independiente ' + runTag;
  await page.locator('#certReviewQuestions fieldset').first().locator('textarea').first().fill(editedQuestion);
  await page.locator('#certReviewPreview').click();
  assert.match(await page.locator('#certReviewDiff').innerText(), /Preguntas modificadas: 1\b/);
  assert.equal(await page.locator('#certReviewSave').isEnabled(), true);
  const ackText = 'Revisión guardada en servidor · publicación pendiente.';
  res.d04Attempt={bankId:rid,certificationId:certId,seedVersion:1,editClickCount:0,
    expectedQuestion:editedQuestion,expectedFirstQuestion:{...questions[0],q:editedQuestion},
    localVersion2Observed:false,editorDetached:false,ackUiObserved:false};
  res.d04Diagnostics={safeReviewErrors:[]};
  page.on('console',message=>{
    const value=message.text();
    if(value.startsWith('CXORBIA_CERT_REVIEW_SAFE_ERROR '))
      res.d04Diagnostics.safeReviewErrors.push(value.slice(0,180));
  });
  await evaluatePage(page,()=>{
    const state={startedAt:Date.now(),events:[]},seen=new WeakMap();
    const capture=()=>{
      for(const el of document.querySelectorAll('#cx-toasts .toast')){
        const text=String(el.textContent||'');
        if(text!=='Revisión guardada en servidor · publicación pendiente.'&&!text.startsWith('No se pudo guardar la revisión.'))continue;
        const style=getComputedStyle(el),box=el.getBoundingClientRect();
        const entry={at:Date.now(),text,className:el.className,display:style.display,visibility:style.visibility,
          opacity:style.opacity,width:box.width,height:box.height,connected:el.isConnected};
        const fingerprint=JSON.stringify({...entry,at:0});
        if(seen.get(el)!==fingerprint&&state.events.length<24){state.events.push(entry);seen.set(el,fingerprint);}
      }
    };
    const observer=new MutationObserver(capture);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    const timer=setTimeout(()=>observer.disconnect(),15000);
    state.stop=()=>{observer.disconnect();clearTimeout(timer);};
    window.__cxI3D04ToastObservation=state;
    return true;
  });
  // Observe the unchanged required ACK before the click, so a short-lived toast is not missed.
  const ackObserved=page.getByText(ackText,{exact:true}).waitFor({state:'visible',timeout:10000})
    .then(async()=>{
      res.d04Attempt.ackUiObserved=true;
      await page.screenshot({path:OUT+'/d04-save-ack.png',fullPage:true,timeout:10000});
    });
  res.d04Attempt.editClickCount=1;
  res.writes.qaResourceEdit=null; // Unknown until exact durable readback; never infer zero from a missed toast.
  res.d04Attempt.clickedAt=Date.now();
  await Promise.all([ackObserved,page.locator('#certReviewSave').click()]); // One content-edit command.
  res.d04Diagnostics.toastObservation=await evaluatePage(page,()=>{
    const state=window.__cxI3D04ToastObservation;state?.stop?.();
    return state?{startedAt:state.startedAt,events:state.events}:null;
  });
  await page.waitForFunction(id => window.CX.backendResources.items.some(x => x.id === id && x.version === 2), rid, {timeout: 45000});
  res.d04Attempt.localVersion2Observed=true;
  await page.locator('#certReviewSave').waitFor({state: 'detached', timeout: 15000});
  res.d04Attempt.editorDetached=true;
  const stored = (await qaRef.get()).data();
  const expectedQuestions = questions.map((q, i) => i === 0 ? {...q, q: editedQuestion} : q);
  assert.equal(stored.version, 2);
  res.writes.qaResourceEdit=1;
  assert.equal(stored.bank.certificationId, certId);
  assert.equal(stored.bank.estado, 'pending_review');
  assert.equal(stored.bank.certificationName, initial.bank.certificationName);
  assert.equal(stored.bank.documentSource.source_sha256, sourceSha256);
  assert.deepEqual(stored.bank.preguntas, expectedQuestions);
  assert.match(stored.bank.contentRevision, /^[0-9a-f]{64}$/);
  assert.notEqual(stored.bank.contentRevision, initial.bank.contentRevision);
  assert.equal(stored.bank.reviewHistory.length, 1);
  const review = stored.bank.reviewHistory[0];
  assert.equal(review.fromVersion, 1);
  assert.equal(review.toVersion, 2);
  assert.equal(review.reviewerUid, scope.uid);
  assert.equal(review.changes.length, 1);
  assert.equal(review.changes[0].index, 1);
  assert.deepEqual(review.changes[0].before, questions[0]);
  assert.deepEqual(review.changes[0].after, expectedQuestions[0]);
  assert.equal(review.nameChange, null);
  assert.deepEqual(await d04OtherBankHeads(rid), d04SessionBaseline);
  const fixture = {period: scope.period, certId, rid, sourceSha256,
    revision: stored.bank.contentRevision, questions: expectedQuestions, history: stored.bank.reviewHistory};

  await page.reload({waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(period => {
    const c = window.CX?.backendAuth?.context?.() || {}, g = window.CX_C6_HR_AUTHORITY_GATE || {};
    return c.authenticated === true && ['admin', 'super'].includes(String(c.role || '')) &&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true && g.ready === true && g.blocked !== true &&
      String(window.CX.data.currentProjectId || '') === 'cinepolis' &&
      String(window.CX.data.period()?.id || '') === period &&
      typeof window.CX.backendResources?.load === 'function';
  }, scope.period, {timeout: 90000});
  const reload = await d04ReadEditorSession(page, fixture, 'reload');
  return {fixture, proof: {scope: 'D04_INDEPENDENT_SESSION_CLAUSE_ONLY',
    bankId: rid, certificationId: certId, syntheticQaFixture: true,
    versionBefore: 1, versionAfter: 2, contentEditClicks: 1, nameEdits: 0,
    providerAck: true, committed: true, durableReadback: true,
    ackUiText: ackText, ackScreenshot: 'd04-save-ack.png',
    historyEntries: 1, autoPublished: false, existingBanksUnchanged: true,
    reload, independentSession: null, humanAcceptance: 'PENDING', fullTaskClosed: false}};
}

async function d04VerifyPostSession(fixture) {
  const stored = (await qaRef.get()).data();
  assert.equal(stored.version, 2);
  assert.equal(stored.bank.contentRevision, fixture.revision);
  assert.deepEqual(stored.bank.preguntas, fixture.questions);
  assert.deepEqual(stored.bank.reviewHistory, fixture.history);
  assert.equal(stored.bank.estado, 'pending_review');
  assert.deepEqual(await d04OtherBankHeads(fixture.rid), d04SessionBaseline);
}

// Integration proposal only. Append helpers to the existing D04 runner; no new entrypoint.
// No provider call is made by importing this file. Caller supplies two isolated, authenticated pages.

const D07 = R7_MODE?Object.freeze({...sessionPackage.d07,sourceSha:SRC,sourceTree:descriptor.productTreeAuthority,
  resourceOwnerBlob:sessionPreflight.servedOwnerBlobs['app/core/backend-resources.js'],
  viewerOwnerBlob:sessionPreflight.servedOwnerBlobs['app/modules/documentos.js']}):Object.freeze({
  sourceSha:'946c3cb8eff6a043693b10ed628d2ebc860508e1',
  sourceTree:'4afcecfd4b41ac697995a1164115a23a46db44c7',
  resourceOwnerBlob:'d3073758c85f0184cdd38fd9f88882ecc212c30c',
  viewerOwnerBlob:'db994135c9e38854000b13606e7fdd3872ab7e1b',
  tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10',
  bucket:'cxorbia-backend-dev.firebasestorage.app',
  shopperId:'TYA_GT_393371F88D10F7A8',
  shopperUidFingerprint:'a6e3ff21498bd79cbc4078ec47b7b5760a6534e43803614e997bb2294d77ee98',
  approvedName:'Instructivo Shopper.pdf',approvedSize:162335,
  approvedSha256:'3654d624896f3517c39136b29f6c37542d8a128f9d8d9d8a616693f039753454',
});
const sha=value=>createHash('sha256').update(value).digest('hex');
const norm=value=>String(value||'').replace(/_/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const uidFingerprint=uid=>sha('cxorbia-provider-uid-v1\0'+uid);
const fail=code=>{throw new Error('D07_'+code);};
const check=(condition,code)=>{if(!condition)fail(code);};
async function bounded(operation,ms,code){
  let timer;
  try{return await Promise.race([operation,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('D07_'+code)),ms);})]);}
  catch(error){if(/^D07_[A-Z0-9_]+$/.test(String(error?.message||'')))throw error;fail(code+'_FAILED');}
  finally{clearTimeout(timer);}
}

async function resolveD07ExistingShopper({tenant,auth}){
  // Exactly one bounded membership query. Never list Auth or pick the first of multiple matches.
  let found;
  try{found=await bounded(tenant.collection('users').where('shopperId','==',D07.shopperId).limit(2).get(),10000,'SHOPPER_MEMBERSHIP_TIMEOUT');}
  catch{fail('SHOPPER_MEMBERSHIP_READ_UNPROVEN');}
  check(found.size===1,'SHOPPER_MEMBERSHIP_NOT_UNIQUE');
  const doc=found.docs[0],m=doc.data()||{},uid=doc.id;
  check(uidFingerprint(uid)===D07.shopperUidFingerprint,'SHOPPER_UID_FINGERPRINT_MISMATCH');
  check(m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&m.shopperId===D07.shopperId,'SHOPPER_MEMBERSHIP_SCOPE_MISMATCH');
  check(m.tenantId===D07.tenantId&&Array.isArray(m.projectIds)&&m.projectIds.includes(D07.projectId),'SHOPPER_MEMBERSHIP_PROJECT_MISMATCH');
  check(m.status!=='inactive'&&(m.providerUidFingerprint==null||m.providerUidFingerprint===D07.shopperUidFingerprint),'SHOPPER_MEMBERSHIP_FINGERPRINT_OR_STATUS_MISMATCH');
  let user;
  try{user=await bounded(auth.getUser(uid),10000,'SHOPPER_AUTH_TIMEOUT');}
  catch{fail('SHOPPER_AUTH_READ_UNPROVEN');}
  const c=user.customClaims||{};
  check(user.uid===uid&&user.disabled===false,'SHOPPER_AUTH_DISABLED_OR_DIFFERENT');
  check(c.role==='shopper'&&c.authNamespace==='shopper'&&c.shopperId===D07.shopperId,'SHOPPER_CLAIMS_IDENTITY_MISMATCH');
  check(c.tenantId===D07.tenantId&&Array.isArray(c.projectIds)&&c.projectIds.includes(D07.projectId),'SHOPPER_CLAIMS_SCOPE_MISMATCH');
  check(c.country==null||c.country==='GT','SHOPPER_CLAIMS_COUNTRY_CONFLICT');
  // UID stays only in runner memory. Public receipt uses the approved fingerprint.
  return {id:uid,role:'shopper',shopperId:D07.shopperId,uidFingerprint:D07.shopperUidFingerprint};
}

function inspectD07StorageBinding({id,storagePath}){
  const value=String(storagePath||'');
  const prefix='tenants/'+D07.tenantId+'/projects/'+D07.projectId+'/periods/'+D07.periodId+'/resources/';
  const parentScopeMatches=value.startsWith(prefix),suffix=parentScopeMatches?value.slice(prefix.length):'';
  const match=/^([-a-zA-Z0-9_]+)\/([-a-zA-Z0-9_.]+\.pdf)$/i.exec(suffix);
  const segments=value.split('/'),file=segments[segments.length-1]||'';
  const folder=match?.[1]||null;
  return {resourceId:id,pathSha256:sha(value),pathLength:value.length,segmentCount:segments.length,
    scope:{tenantId:D07.tenantId,projectId:D07.projectId,periodId:D07.periodId},parentScopeMatches,
    safeSingleFolderAndPdfBasename:!!match&&!suffix.includes('..'),storageFolderId:folder,
    storageFolderEqualsDocumentId:folder===id,basenameSha256:sha(file),basenameLength:file.length,
    approvedBasenameMatches:norm(file)===norm(D07.approvedName)};
}
function bindingFailure(code,diagnostic){
  const error=new Error('D07_'+code);error.d07BindingDiagnostic=diagnostic;throw error;
}

async function readD07LoadedBinding(page,{role,uid,onDiagnostic=()=>{}}){
  check(['admin','shopper'].includes(role),'UNSUPPORTED_ROLE');
  // Scope is selected through the existing UI before this call. No hidden period mutation.
  await page.waitForFunction(expected=>{
    const s=window.CX_BACKEND_RESOURCES_STATUS||{};
    return s.status==='ready'&&s.tenantId===expected.tenantId&&s.projectId===expected.projectId&&s.periodId===expected.periodId;
  },D07,{timeout:30000});
  const row=await bounded(page.evaluate(({expected,role,uid})=>{
    const cx=window.CX,c=cx?.backendAuth?.context?.()||{},s=window.CX_BACKEND_RESOURCES_STATUS||{};
    const actualRole=String(cx?.session?.effectiveRole?.()||c.role||'');
    if(window.firebase?.auth?.().currentUser?.uid!==uid||c.authenticated!==true||c.tenantId!==expected.tenantId||
      (role==='admin'?!['admin','super'].includes(actualRole):actualRole!=='shopper')||
      c.authNamespace!==(role==='admin'?'staff':'shopper')||
      cx?.data?.currentProjectId!==expected.projectId||cx?.data?.currentPeriodId!==expected.periodId||
      s.status!=='ready'||s.projectId!==expected.projectId||s.periodId!==expected.periodId)return null;
    if(role==='shopper'&&(c.shopperId!==expected.shopperId||!Array.isArray(c.projectIds)||!c.projectIds.includes(expected.projectId)))return null;
    const normalize=v=>String(v||'').replace(/_/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
    const items=cx.backendResources?.list?.({projectId:expected.projectId,periodId:expected.periodId,resourceType:'project_resource'})||[];
    const matches=items.filter(x=>x.status==='active'&&x.tenantId===expected.tenantId&&x.projectId===expected.projectId&&
      x.periodId===expected.periodId&&x.tipo==='pdf'&&[x.n,x.meta].some(v=>normalize(v)===normalize(expected.approvedName))&&
      (!x.mimeType||x.mimeType==='application/pdf'));
    if(matches.length!==1)return null;
    const x=matches[0];
    return {id:String(x.id||''),storagePath:String(x.storagePath||''),version:x.version??null,
      size:x.size??null,bucket:String(window.firebase.app().options.storageBucket||''),role:actualRole,
      visibleForRole:x.targetAll===true||(Array.isArray(x.visibleRoles)&&x.visibleRoles.includes(actualRole))};
  },{expected:D07,role,uid}),10000,'LOADED_BINDING_TIMEOUT');
  check(row,'LOADED_EXACT_RESOURCE_MISSING_AMBIGUOUS_OR_WRONG_SCOPE');
  check(/^[-a-zA-Z0-9_]+$/.test(row.id)&&row.bucket===D07.bucket,'RESOURCE_ID_OR_BUCKET_MISMATCH');
  if(role==='shopper')check(row.visibleForRole===true,'RESOURCE_NOT_VISIBLE_FOR_SHOPPER');
  const diagnostic={stage:'catalog-'+role,version:row.version,size:row.size,role:row.role,...inspectD07StorageBinding(row)};
  onDiagnostic(diagnostic);
  if(!diagnostic.parentScopeMatches||!diagnostic.safeSingleFolderAndPdfBasename||!diagnostic.approvedBasenameMatches)
    bindingFailure('STORAGE_PATH_SCOPE_MISMATCH',diagnostic);
  // The upload folder and Firestore document ID are independent identifiers by the current product contract.
  return {...row,pathDiagnostic:diagnostic};
}

async function bindD07BeforeReads({adminPage,shopperPage,adminUid,shopperUid,db,preflight,onDiagnostic=()=>{}}){
  check(preflight?.sourceSha===D07.sourceSha&&preflight?.sourceTree===D07.sourceTree&&
    preflight?.previewRunId===40973709501&&preflight?.sourceIdentityVerified===true&&
    preflight?.servedOwnerBlobs?.['app/core/backend-resources.js']===D07.resourceOwnerBlob&&
    preflight?.servedOwnerBlobs?.['app/modules/documentos.js']===D07.viewerOwnerBlob,'SOURCE_PREFLIGHT_UNBOUND');
  check(/^https:\/\/cxorbia-backend-dev--[-a-z0-9]+\.web\.app$/.test(preflight.previewOrigin||'')&&
    new URL(adminPage.url()).origin===preflight.previewOrigin&&new URL(shopperPage.url()).origin===preflight.previewOrigin,'PREVIEW_ORIGIN_MISMATCH');
  check(typeof preflight.hostingVersion==='string'&&/^sites\/cxorbia-backend-dev\/versions\/[0-9a-f]+$/.test(preflight.hostingVersion),'HOSTING_VERSION_UNBOUND');
  // Both role catalogs must expose the same exact resource before either binary GET.
  const a=await readD07LoadedBinding(adminPage,{role:'admin',uid:adminUid,onDiagnostic});
  const s=await readD07LoadedBinding(shopperPage,{role:'shopper',uid:shopperUid,onDiagnostic});
  for(const field of ['id','storagePath','version','bucket'])check(a[field]===s[field],'ROLE_RESOURCE_BINDING_MISMATCH');
  const ref=db.doc('tenants/'+D07.tenantId+'/resources/'+a.id);
  const before=await bounded(ref.get(),10000,'EXACT_METADATA_TIMEOUT');
  const d=before.exists?(before.data()||{}):{};
  const checks={exists:before.exists===true,documentIdMatches:before.id===a.id,storedIdMatches:d.id==null||d.id===a.id,
    publishedPdf:d.status==='active'&&d.resourceType==='project_resource'&&d.tipo==='pdf',
    scopeMatches:d.tenantId===D07.tenantId&&d.projectId===D07.projectId&&d.periodId===D07.periodId,
    exactStoragePathMatches:d.storagePath===a.storagePath&&d.storagePath===s.storagePath,
    versionMatches:(d.version??null)===a.version&&(d.version??null)===s.version,
    approvedMetadataNameMatches:[d.n,d.meta].some(v=>norm(v)===norm(D07.approvedName)),
    shopperPublished:d.targetAll===true||(Array.isArray(d.visibleRoles)&&d.visibleRoles.includes('shopper')),
    approvedSizeMatchesIfDeclared:d.size==null||d.size===D07.approvedSize};
  const metadataDiagnostic={stage:'exact-sdk-document',resourceId:a.id,version:d.version??null,size:d.size??null,
    scope:{tenantId:d.tenantId??null,projectId:d.projectId??null,periodId:d.periodId??null},checks,
    storagePathSha256:sha(String(d.storagePath||'')),storageFolderEqualsDocumentId:a.pathDiagnostic.storageFolderEqualsDocumentId,
    updateTime:before.updateTime?{seconds:before.updateTime.seconds,nanoseconds:before.updateTime.nanoseconds}:null};
  onDiagnostic(metadataDiagnostic);
  if(!Object.values(checks).every(Boolean))bindingFailure('EXACT_METADATA_BINDING_MISMATCH',metadataDiagnostic);
  const endpoint='https://firebasestorage.googleapis.com/v0/b/'+encodeURIComponent(a.bucket)+'/o/'+encodeURIComponent(a.storagePath)+'?alt=media';
  return {id:a.id,storagePath:a.storagePath,version:a.version,bucket:a.bucket,endpoint,ref,before,
    sourceProof:{sourceSha:preflight.sourceSha,sourceTree:preflight.sourceTree,previewRunId:preflight.previewRunId,previewOrigin:preflight.previewOrigin,hostingVersion:preflight.hostingVersion,servedOwnerBlobs:preflight.servedOwnerBlobs},
    safe:{resourceId:a.id,version:a.version,storagePathSha256:sha(a.storagePath),approvedSha256:D07.approvedSha256,approvedSize:D07.approvedSize,
      bothRoleCatalogsVisible:true,exactMetadataBound:true,pathDiagnostic:a.pathDiagnostic,metadataDiagnostic}};
}

// Pure request classification. POST alone is not evidence of a mutation.
function classifyD07Request({url,method,endpoint,getCount=0}){
  const u=new URL(url),verb=String(method).toUpperCase(),readMethod=['GET','HEAD','OPTIONS'].includes(verb);
  const storage=['firebasestorage.googleapis.com','storage.googleapis.com'].includes(u.hostname);
  const command=!readMethod&&u.pathname==='/v1/cxorbia/commands';
  const firestore=u.hostname==='firestore.googleapis.com';
  const knownReadRpc=/:(?:batchGet|runQuery|runAggregationQuery|partitionQuery|beginTransaction|rollback)$/.test(u.pathname);
  const firestoreWrite=firestore&&!readMethod&&(
    /\/Write\/channel$/.test(u.pathname)||/:(?:commit|batchWrite|write)$/.test(u.pathname)||
    ['PATCH','DELETE','PUT'].includes(verb)||
    (verb==='POST'&&/\/documents(?:\/|$)/.test(u.pathname)&&!knownReadRpc));
  const storageMutation=storage&&!readMethod;
  const authMutation=!readMethod&&u.hostname==='identitytoolkit.googleapis.com'&&
    /accounts:(?:update|delete|signUp|batchDelete|upload|sendOobCode|resetPassword)$/.test(u.pathname);
  const unexpectedRead=storage&&['GET','HEAD'].includes(verb)&&(url!==endpoint||(verb==='GET'&&getCount>=1));
  return {mutating:command||firestoreWrite||storageMutation||authMutation,unexpectedRead,
    exactPdfGet:storage&&verb==='GET'&&url===endpoint&&!unexpectedRead};
}

async function installD07ReadOnlyContextGuard(context){
  // Install before goto/Auth. Listener reads, token exchange and account lookup remain allowed.
  // No Storage binary read is allowed until both catalogs and the exact SDK document are bound.
  const pattern=/^https?:\/\//;
  const evidence={installedBeforeNavigation:true,bindingSet:false,blockedWriteRequests:0,
    blockedUnexpectedStorageReads:0,storageGetsOutsideRoleGuard:0};
  let endpoint=null;
  const handler=async route=>{
    const request=route.request();
    const kind=classifyD07Request({url:request.url(),method:request.method(),endpoint});
    if(kind.mutating){evidence.blockedWriteRequests++;await route.abort('blockedbyclient');}
    else if(kind.unexpectedRead){evidence.blockedUnexpectedStorageReads++;await route.abort('blockedbyclient');}
    else{if(kind.exactPdfGet)evidence.storageGetsOutsideRoleGuard++;await route.continue();}
  };
  await context.route(pattern,handler);
  return {evidence,setBinding(binding){
    check(!evidence.bindingSet&&binding?.safe?.bothRoleCatalogsVisible===true&&binding?.safe?.exactMetadataBound===true&&
      binding?.sourceProof?.sourceSha===D07.sourceSha&&typeof binding?.endpoint==='string','CONTEXT_BINDING_UNPROVEN');
    endpoint=binding.endpoint;evidence.bindingSet=true;
  },stop:()=>context.unroute(pattern,handler)};
}

async function readD07RolePdf({page,role,uid,binding,outDir}){
  const result={role,decision:'HOLD',openClicks:0,binaryGetCount:0,blockedUnexpectedRequests:0,
    downloadCount:0,rendered:false,writesObserved:false,blockedWriteRequests:0,httpStatus:null,networkError:null,diagnostic:null};
  const pending=[],guardPattern=/^https?:\/\//;let guardInstalled=false;
  const observeResponse=response=>{if(response.url()===binding.endpoint&&response.request().method()==='GET')result.httpStatus=response.status();};
  const observeFailure=request=>{if(request.url()===binding.endpoint){const code=String(request.failure()?.errorText||'');result.networkError=/^net::ERR_[A-Z0-9_]+$/.test(code)?code:'OTHER_NETWORK_ERROR';}};
  page.on('response',observeResponse);page.on('requestfailed',observeFailure);
  const guard=async route=>{
    const request=route.request();
    const kind=classifyD07Request({url:request.url(),method:request.method(),endpoint:binding.endpoint,getCount:result.binaryGetCount});
    if(kind.mutating||kind.unexpectedRead){
      result.blockedUnexpectedRequests++;result.writesObserved||=kind.mutating;
      if(kind.mutating)result.blockedWriteRequests++;
      await route.abort('blockedbyclient');return;
    }
    if(kind.exactPdfGet){
      result.binaryGetCount++;
      pending.push(request.headerValue('authorization').then(value=>{result.authenticatedGetHeaderPresent=typeof value==='string'&&/^Firebase .+/.test(value);}).catch(()=>{result.authenticatedGetHeaderPresent=false;}));
    }
    await route.continue();
  };
  try{
    await page.route(guardPattern,guard);guardInstalled=true;
    // Only the app router is invoked; the binary read must result from this exact visible button click.
    await bounded(page.evaluate(()=>window.CX.router.nav('documentos',{history:false})),10000,'RESOURCES_NAVIGATION_TIMEOUT');
    const open=page.locator('button[data-doc="'+binding.id+'"]');
    await open.waitFor({state:'visible',timeout:15000});
    check(await open.count()===1,'EXACT_OPEN_BUTTON_NOT_UNIQUE');
    if(role==='shopper'){
      check(await page.locator('#docUp').count()===0,'SHOPPER_CREATE_CONTROL_VISIBLE');
      check(await page.locator('[data-editd],[data-deld]').count()===0,'SHOPPER_MUTATION_CONTROL_VISIBLE');
    }
    result.openClicks=1;await open.click({timeout:10000});
    await page.waitForFunction(()=>['ready','failed'].includes(document.querySelector('[data-pdf-status]')?.dataset.pdfStatus),null,{timeout:45000});
    result.diagnostic=await bounded(page.locator('[data-pdf-status]').evaluate(node=>({
      status:node.dataset.pdfStatus,stage:node.dataset.d07Stage||null,code:node.dataset.d07Code||null,
      text:String(node.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
    })),10000,'VISIBLE_DIAGNOSTIC_TIMEOUT');
    if(result.diagnostic.status!=='ready')fail('PDF_VISIBLE_FAILURE');
    check(result.diagnostic.text==='PDF visible en la plataforma','PDF_READY_TEXT_MISMATCH');
    const canvas=await bounded(page.locator('[data-pdf-viewer] canvas').evaluate(node=>{
      const w=node.width,h=node.height,ctx=node.getContext('2d');
      if(!w||!h||!ctx)return {width:w,height:h,inkPixels:0};
      const data=ctx.getImageData(0,0,w,h).data;let ink=0;
      for(let i=0;i<data.length;i+=4)if(data[i+3]>0&&(data[i]<245||data[i+1]<245||data[i+2]<245)){if(++ink>=16)break;}
      return {width:w,height:h,inkPixels:ink};
    }),10000,'CANVAS_OBSERVATION_TIMEOUT');
    check(canvas.width>100&&canvas.height>100&&canvas.inkPixels>=16,'PDF_CANVAS_BLANK');
    result.rendered=true;result.canvas=canvas;
    const position=(await page.locator('[data-pdf-page]').innerText()).trim();
    const match=/^Página 1 de ([1-9]\d*)$/.exec(position);check(match,'PDF_PAGE_COUNT_UNPROVEN');
    result.pageCount=Number(match[1]);
    await page.locator('[data-pdf-viewer]').screenshot({path:outDir+'/d07-'+role+'-pdf-page1.png',timeout:10000});
    const downloadButton=page.locator('[data-pdf-download]');
    check(await downloadButton.isEnabled(),'PDF_DOWNLOAD_NOT_ENABLED');
    // The app reuses the authenticated bytes. Download must not start a second provider GET.
    const [download]=await Promise.all([page.waitForEvent('download',{timeout:15000}),downloadButton.click({timeout:10000})]);
    result.downloadCount=1;
    check(norm(download.suggestedFilename())===norm(D07.approvedName),'DOWNLOAD_NAME_MISMATCH');
    const stream=await bounded(download.createReadStream(),15000,'DOWNLOAD_STREAM_TIMEOUT');check(stream,'DOWNLOAD_STREAM_MISSING');
    const content=await bounded((async()=>{
      const digest=createHash('sha256');let size=0,signature=Buffer.alloc(0);
      for await(const chunk of stream){
        size+=chunk.length;check(size<=D07.approvedSize,'DOWNLOAD_EXCEEDS_APPROVED_SIZE');
        if(signature.length<5)signature=Buffer.concat([signature,chunk]).subarray(0,5);
        digest.update(chunk);
      }
      return {size,sha256:digest.digest('hex'),pdfSignature:signature.equals(Buffer.from('%PDF-'))};
    })(),15000,'DOWNLOAD_BYTES_TIMEOUT');
    check(content.pdfSignature&&content.size===D07.approvedSize&&content.sha256===D07.approvedSha256,'DOWNLOAD_NOT_APPROVED_PDF_BYTES');
    result.download=content;
    if(result.pageCount>1){
      await page.locator('[data-pdf-next]').click({timeout:10000});
      await page.waitForFunction(()=>/^Página 2 de /.test(document.querySelector('[data-pdf-page]')?.textContent||''),null,{timeout:10000});
      await page.locator('[data-pdf-prev]').click({timeout:10000});
      await page.waitForFunction(()=>/^Página 1 de /.test(document.querySelector('[data-pdf-page]')?.textContent||''),null,{timeout:10000});
      result.pageNavigation='PASS_1_2_1';
    }else result.pageNavigation='SINGLE_PAGE';
    await page.locator('#docBack').click({timeout:10000});
    await open.waitFor({state:'visible',timeout:10000});result.backToCatalog=true;
    const after=await readD07LoadedBinding(page,{role,uid});
    for(const field of ['id','storagePath','version','bucket'])check(after[field]===binding[field],'RESOURCE_CHANGED_DURING_READ');
    await Promise.all(pending);
    check(result.binaryGetCount===1&&result.authenticatedGetHeaderPresent===true&&result.httpStatus===200,'EXACT_AUTHENTICATED_GET_NOT_PROVEN');
    check(result.blockedUnexpectedRequests===0&&!result.writesObserved,'UNEXPECTED_REQUEST_DURING_READ');
    result.decision='PASS_EXACT_APPROVED_PDF_READ_RENDER_DOWNLOAD_FOR_ROLE';
  }catch(error){
    result.error=/^D07_[A-Z0-9_]+$/.test(String(error?.message||''))?error.message:'D07_BOUNDED_UI_OR_PROVIDER_FAILURE';
    // Do not log raw URLs, credentials, Auth records, Storage paths, or response bodies.
    if(!result.diagnostic)result.diagnostic=await bounded(page.locator('[data-pdf-status]').evaluate(node=>({
      status:node.dataset.pdfStatus,stage:node.dataset.d07Stage||null,code:node.dataset.d07Code||null,
      text:String(node.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
    })),10000,'FAILURE_DIAGNOSTIC_TIMEOUT').catch(()=>null);
    await page.locator('#view').screenshot({path:outDir+'/d07-'+role+'-failure.png',timeout:10000}).catch(()=>{});
  }finally{
    page.off('response',observeResponse);page.off('requestfailed',observeFailure);
    if(guardInstalled)await page.unroute(guardPattern,guard);
    await Promise.allSettled(pending);
  }
  return result;
}

async function finishD07ReadOnly({binding,admin,shopper}){
  const after=await bounded(binding.ref.get(),10000,'FINAL_METADATA_TIMEOUT');
  check(after.exists,'RESOURCE_REMOVED_DURING_READ');
  check(isDeepStrictEqual(after.data(),binding.before.data()),'RESOURCE_METADATA_CHANGED');
  check(after.updateTime?.isEqual(binding.before.updateTime)===true,'RESOURCE_UPDATE_TIME_CHANGED');
  const passed=[admin,shopper].every(x=>x?.decision==='PASS_EXACT_APPROVED_PDF_READ_RENDER_DOWNLOAD_FOR_ROLE');
  return {decision:passed?'PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE':'HOLD_D07_REAL_PDF_READ_ONLY_CLAUSE',
    fullTaskClosed:false,sourceProof:binding.sourceProof,resource:binding.safe,admin,shopper,
    metadataAndUpdateTimeUnchanged:true,scope:'EXACT_APPROVED_PROJECT_PERIOD_PDF_READ_RENDER_DOWNLOAD',
    testScopeOnly:true,resourceWrites:passed?0:null,observedBlockedWriteRequests:Number(admin?.blockedWriteRequests||0)+Number(shopper?.blockedWriteRequests||0),
    authAccountMutationsIssuedByHelper:0,hrCommandsIssuedByHelper:0,financeCommandsIssuedByHelper:0,production:false,
    remainingFrozenClauses:['PDF alta/metadatos/version y no binario huerfano','documento ajeno denegado','vinculo a visita y revision','retiro seguro'],
    existingTxtCoveragePreserved:true,miDiaEligibilityProven:false};
}

async function signD07Role(m,role){
 check(D07_READ_ONLY_MODE&&['admin','shopper'].includes(role),'SESSION_MODE_OR_ROLE_UNAUTHORIZED');
 if(role==='admin')check(m.id===sessionPackage.actor.uid,'ADMIN_UID_MISMATCH');
 else check(m.shopperId===D07.shopperId&&m.uidFingerprint===D07.shopperUidFingerprint&&uidFingerprint(m.id)===D07.shopperUidFingerprint,'SHOPPER_UID_MISMATCH');
 const ctx=await browser.newContext({viewport:{width:1400,height:940}});
 const guard=await installD07ReadOnlyContextGuard(ctx);
 d07Contexts.push({ctx,guard,role});
 const page=await ctx.newPage();
 await page.goto(url+'&pre='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
 const empty=await bounded(page.evaluate(async()=>{
   const a=window.firebase.auth();let unsub=null,timer;
   try{return await new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('AUTH_INITIAL_STATE_TIMEOUT')),30000);unsub=a.onAuthStateChanged(u=>resolve(u===null),reject);});}
   finally{clearTimeout(timer);if(unsub)unsub();}
 }),35000,'INITIAL_AUTH_STATE_TIMEOUT');
 check(empty===true,'NEW_CONTEXT_NOT_EMPTY');
 const token=await bounded(auth.createCustomToken(m.id),15000,'EXISTING_IDENTITY_TOKEN_TIMEOUT');
 await bounded(page.evaluate(async t=>{const a=window.firebase.auth();await a.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await a.signInWithCustomToken(t);},token),45000,'EXISTING_IDENTITY_SIGNIN_TIMEOUT');
 await page.goto('about:blank');
 await page.goto(url+'&signed='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(id=>window.firebase?.auth?.().currentUser?.uid===id,m.id,{timeout:90000});
 await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
 await bounded(page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();}),45000,'APPLICATION_AUTH_TIMEOUT');
 await page.waitForFunction(input=>{
   const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
   const role=String(c.role||'').toLowerCase(),rev=String(window.CX?.data?.previewMeta?.sourceRevision||'');
   return c.authenticated===true&&window.firebase?.auth?.().currentUser?.uid===input.uid&&
     c.tenantId==='tya'&&c.authNamespace===(input.role==='admin'?'staff':'shopper')&&
     (input.role==='admin'?['admin','super'].includes(role):role==='shopper'&&c.shopperId===input.shopperId&&Array.isArray(c.projectIds)&&c.projectIds.includes('cinepolis'))&&
     window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&/^[0-9a-f]{64}$/.test(rev);
 },{uid:m.id,role,shopperId:role==='shopper'?D07.shopperId:null},{timeout:45000});
 const observed=await bounded(page.evaluate(()=>{const c=window.CX.backendAuth.context();return {uid:window.firebase.auth().currentUser.uid,role:c.role,tenantId:c.tenantId,authNamespace:c.authNamespace,shopperId:c.shopperId||null,revision:String(window.CX.data.previewMeta.sourceRevision||'')};}),10000,'AUTH_SCOPE_READ_TIMEOUT');
 check(observed.uid===m.id&&observed.tenantId==='tya'&&observed.revision===HR,'AUTH_OR_HR_REVISION_MISMATCH');
 if(res.hrRevisionLive)check(res.hrRevisionLive===observed.revision,'TWO_ROLE_HR_REVISION_MISMATCH');
 else res.hrRevisionLive=observed.revision;
 const sessionBoundary={newBrowserContext:true,authNullBeforeSignIn:true,role:observed.role,tenantId:observed.tenantId,
  authNamespace:observed.authNamespace,uidFingerprint:uidFingerprint(m.id),
  shopperId:role==='shopper'?D07.shopperId:null,applicationAuthAndHrGatePassed:true,hrRevision:observed.revision,
  mechanism:'existing_ci_custom_token_in_memory',ordinaryPasswordLoginProven:false,tokenLogged:false};
 return {ctx,page,guard,sessionBoundary};
}
async function selectD07UiScope(page){
 const current=await bounded(page.evaluate(()=>({project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.currentPeriodId||'')})),10000,'INITIAL_UI_SCOPE_TIMEOUT');
 if(current.project!==D07.projectId){
   await page.locator('#projSel').waitFor({state:'visible',timeout:15000});
   check(await page.locator('#projSel option[value="cinepolis"]').count()===1,'PROJECT_OPTION_UNAVAILABLE');
   await page.locator('#projSel').selectOption(D07.projectId,{timeout:15000});
 }
 await page.waitForFunction(()=>String(window.CX?.data?.currentProjectId||'')==='cinepolis',null,{timeout:30000});
 const period=await bounded(page.evaluate(()=>String(window.CX?.data?.currentPeriodId||'')),10000,'PERIOD_READ_TIMEOUT');
 if(period!==D07.periodId){
   await page.locator('#periodSel').waitFor({state:'visible',timeout:15000});
   check(await page.locator('#periodSel option[value="cinepolis-2026-10"]').count()===1,'OCTOBER_OPTION_UNAVAILABLE');
   await page.locator('#periodSel').selectOption(D07.periodId,{timeout:15000});
 }
 await page.waitForFunction(()=>String(window.CX?.data?.currentProjectId||'')==='cinepolis'&&String(window.CX?.data?.currentPeriodId||'')==='cinepolis-2026-10',null,{timeout:30000});
 await bounded(page.evaluate(()=>window.CX.router.nav('documentos',{history:false})),15000,'CATALOG_NAVIGATION_TIMEOUT');
}
const d07Contexts=[];
async function runD07ReadOnly(){
 res.version='cxorbia.i3.d07.admin-shopper-readonly.v1';res.mode='R6D07_READ_ONLY';
 res.scope={tenant:'tya',project:'cinepolis',period:'cinepolis-2026-10',taskIds:['D07'],roles:['admin','shopper'],testRunOnly:true};
 res.c02={executed:false,commandCount:0};res.d04={executed:false,fixtureSeeds:0,contentEdits:0,fixtureDeletes:0};
 res.e04={executed:false};res.d07={decision:'HOLD_D07_REAL_PDF_READ_ONLY_CLAUSE',fullTaskClosed:false};
 res.writes={auth:0,hr:0,resource:0,financeCommands:0,production:0};
 res.bindingDiagnostics=[];res.cleanup={resourceCleanupPerformed:false,browserClosed:false};res.contextGuardsPass=false;
 let binding,adminSession,shopperSession;
 try{
  const exactAdmin=await bounded(exactSessionProofAdmin(),15000,'ADMIN_IDENTITY_READ_TIMEOUT');
  const exactShopper=await resolveD07ExistingShopper({tenant,auth});
  res.actor={admin:{uidFingerprint:uidFingerprint(exactAdmin.id),exactConfiguredUidVerified:true},
   shopper:{uidFingerprint:exactShopper.uidFingerprint,shopperId:exactShopper.shopperId,existingIdentityVerified:true},
   accountCreated:false,claimsChanged:false};
  browser=await chromium.launch({headless:true});
  adminSession=await sign(exactAdmin,'admin');res.sessions={admin:adminSession.sessionBoundary};
  await selectD07UiScope(adminSession.page);
  shopperSession=await sign(exactShopper,'shopper');res.sessions.shopper=shopperSession.sessionBoundary;
  check(adminSession.ctx!==shopperSession.ctx,'ROLE_CONTEXT_REUSED');res.sessions.distinctContexts=true;
  await selectD07UiScope(shopperSession.page);
  binding=await bindD07BeforeReads({adminPage:adminSession.page,shopperPage:shopperSession.page,adminUid:exactAdmin.id,shopperUid:exactShopper.id,db,preflight:sessionPreflight,
    onDiagnostic:safe=>{res.bindingDiagnostics.push(safe);record();}});
  res.binding=binding.safe;
  for(const entry of [{page:adminSession.page,role:'admin'},{page:shopperSession.page,role:'shopper'}]){
    const button=entry.page.locator('button[data-doc="'+binding.id+'"]');
    await button.waitFor({state:'visible',timeout:15000});check(await button.count()===1,'ROLE_VISIBLE_RESOURCE_NOT_UNIQUE');
    if(entry.role==='shopper'){
      check(await entry.page.locator('#docUp').count()===0,'SHOPPER_CREATE_CONTROL_VISIBLE');
      check(await entry.page.locator('[data-editd],[data-deld]').count()===0,'SHOPPER_MUTATION_CONTROL_VISIBLE');
    }
  }
  res.binding.bothRoleOpenButtonsVisible=true;
  for(const entry of d07Contexts){
    check(entry.guard.evidence.blockedWriteRequests===0&&entry.guard.evidence.blockedUnexpectedStorageReads===0&&entry.guard.evidence.storageGetsOutsideRoleGuard===0,'UNEXPECTED_REQUEST_BEFORE_BOUND_READ');
    entry.guard.setBinding(binding);
  }
  const admin=await readD07RolePdf({page:adminSession.page,role:'admin',uid:exactAdmin.id,binding,outDir:OUT});
  res.d07.admin=admin;record();
  const shopper=await readD07RolePdf({page:shopperSession.page,role:'shopper',uid:exactShopper.id,binding,outDir:OUT});
  res.d07.shopper=shopper;record();
  res.d07=await finishD07ReadOnly({binding,admin,shopper});res.decision=res.d07.decision;
 }catch(error){
  if(error?.d07BindingDiagnostic)res.bindingDiagnostics.push(error.d07BindingDiagnostic);
  res.decision='HOLD_D07_REAL_PDF_READ_ONLY_CLAUSE';
  res.error={classification:'D07_READ_ONLY_UNPROVEN',code:/^D07_[A-Z0-9_]+$/.test(String(error?.message||''))?error.message:'D07_AUTH_UI_OR_PROVIDER_FAILURE'};
  record();
 }finally{
  // Keep route guards installed until the browser is closed. No resource cleanup/write.
  if(browser){
    try{await bounded(browser.close(),20000,'BROWSER_CLOSE_TIMEOUT');res.cleanup.browserClosed=true;}
    catch{res.cleanup.browserClosed=false;res.decision='HOLD_D07_BROWSER_CLEANUP';}
  }else res.cleanup.browserClosed=true;
  res.contextGuards=d07Contexts.map(x=>({role:x.role,...x.guard.evidence}));
  res.contextGuardsPass=res.contextGuards.length===2&&res.contextGuards.every(x=>x.installedBeforeNavigation===true&&x.bindingSet===true&&x.blockedWriteRequests===0&&x.blockedUnexpectedStorageReads===0&&x.storageGetsOutsideRoleGuard===0);
  if(!res.contextGuardsPass&&res.decision==='PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE')res.decision='HOLD_D07_NETWORK_SCOPE_UNPROVEN';
  record();
 }
 console.log(JSON.stringify({decision:res.decision,mode:res.mode,d07:res.d07,contextGuards:res.contextGuards,cleanup:res.cleanup,error:res.error||null,production:false}));
 if(res.decision!=='PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE')process.exitCode=1;
}

// R7-only additions. The preceding R5/R6 implementations remain intact.
async function bindD07BeforeReadsR7({adminPage,shopperPage,adminUid,shopperUid,db,preflight,onDiagnostic=()=>{}}){
  check(preflight?.sourceSha===D07.sourceSha&&preflight?.sourceTree===D07.sourceTree&&
    preflight?.materializationRunId===sessionPackage.materialization.materializationRunId&&preflight?.sourceIdentityVerified===true&&
    preflight?.servedOwnerBlobs?.['app/core/backend-resources.js']===D07.resourceOwnerBlob&&
    preflight?.servedOwnerBlobs?.['app/modules/documentos.js']===D07.viewerOwnerBlob,'SOURCE_PREFLIGHT_UNBOUND');
  check(preflight.deliveryKind==='DEV_LIVE_MATERIALIZATION'&&preflight.origin==='https://cxorbia-backend-dev.web.app'&&
    new URL(adminPage.url()).origin===preflight.origin&&new URL(shopperPage.url()).origin===preflight.origin,'DEV_LIVE_ORIGIN_MISMATCH');
  check(preflight?.storageCors?.bucket===D07.bucket&&preflight?.storageCors?.expectedRulePresent===true&&Number(preflight?.providerConfigWrites||0)<=1,'DEV_STORAGE_CORS_PREFLIGHT_UNBOUND');
  check(typeof preflight.hostingVersion==='string'&&/^sites\/cxorbia-backend-dev\/versions\/[0-9a-f]+$/.test(preflight.hostingVersion),'HOSTING_VERSION_UNBOUND');
  // Both role catalogs must expose the same exact resource before either binary GET.
  const a=await readD07LoadedBinding(adminPage,{role:'admin',uid:adminUid,onDiagnostic});
  const s=await readD07LoadedBinding(shopperPage,{role:'shopper',uid:shopperUid,onDiagnostic});
  for(const field of ['id','storagePath','version','bucket'])check(a[field]===s[field],'ROLE_RESOURCE_BINDING_MISMATCH');
  const ref=db.doc('tenants/'+D07.tenantId+'/resources/'+a.id);
  const before=await bounded(ref.get(),10000,'EXACT_METADATA_TIMEOUT');
  const d=before.exists?(before.data()||{}):{};
  const checks={exists:before.exists===true,documentIdMatches:before.id===a.id,storedIdMatches:d.id==null||d.id===a.id,
    publishedPdf:d.status==='active'&&d.resourceType==='project_resource'&&d.tipo==='pdf',
    scopeMatches:d.tenantId===D07.tenantId&&d.projectId===D07.projectId&&d.periodId===D07.periodId,
    exactStoragePathMatches:d.storagePath===a.storagePath&&d.storagePath===s.storagePath,
    versionMatches:(d.version??null)===a.version&&(d.version??null)===s.version,
    approvedMetadataNameMatches:[d.n,d.meta].some(v=>norm(v)===norm(D07.approvedName)),
    shopperPublished:d.targetAll===true||(Array.isArray(d.visibleRoles)&&d.visibleRoles.includes('shopper')),
    approvedSizeMatchesIfDeclared:d.size==null||d.size===D07.approvedSize};
  const metadataDiagnostic={stage:'exact-sdk-document',resourceId:a.id,version:d.version??null,size:d.size??null,
    scope:{tenantId:d.tenantId??null,projectId:d.projectId??null,periodId:d.periodId??null},checks,
    storagePathSha256:sha(String(d.storagePath||'')),storageFolderEqualsDocumentId:a.pathDiagnostic.storageFolderEqualsDocumentId,
    updateTime:before.updateTime?{seconds:before.updateTime.seconds,nanoseconds:before.updateTime.nanoseconds}:null};
  onDiagnostic(metadataDiagnostic);
  if(!Object.values(checks).every(Boolean))bindingFailure('EXACT_METADATA_BINDING_MISMATCH',metadataDiagnostic);
  const endpoint='https://firebasestorage.googleapis.com/v0/b/'+encodeURIComponent(a.bucket)+'/o/'+encodeURIComponent(a.storagePath)+'?alt=media';
  return {id:a.id,storagePath:a.storagePath,version:a.version,bucket:a.bucket,endpoint,ref,before,
    sourceProof:{sourceSha:preflight.sourceSha,sourceTree:preflight.sourceTree,deliveryKind:preflight.deliveryKind,materializationRunId:preflight.materializationRunId,origin:preflight.origin,hostingVersion:preflight.hostingVersion,servedOwnerBlobs:preflight.servedOwnerBlobs},
    safe:{resourceId:a.id,version:a.version,storagePathSha256:sha(a.storagePath),approvedSha256:D07.approvedSha256,approvedSize:D07.approvedSize,
      bothRoleCatalogsVisible:true,exactMetadataBound:true,pathDiagnostic:a.pathDiagnostic,metadataDiagnostic}};
}

// Proposed R7-only strengthening; legacy classifiers remain byte-identical.
// The existing exact PDF GET/path/count contract is preserved.
function classifyD07RequestR7(input){
  const base=classifyD07Request(input),u=new URL(input.url),verb=String(input.method).toUpperCase();
  if(['GET','HEAD','OPTIONS'].includes(verb))return base;
  const firestoreRead=verb==='POST'&&u.hostname==='firestore.googleapis.com'&&
    /\/Listen\/channel$|:(?:batchGet|runQuery|runAggregationQuery|partitionQuery|beginTransaction|rollback)$|\/(?:BatchGetDocuments|GetDocument|ListDocuments|ListCollectionIds|RunQuery|RunAggregationQuery|PartitionQuery|BeginTransaction|Rollback)$/.test(u.pathname);
  const authRead=verb==='POST'&&(
    u.hostname==='identitytoolkit.googleapis.com'&&/\/accounts:(?:signInWithCustomToken|signInWithPassword|lookup)$/.test(u.pathname)||
    u.hostname==='securetoken.googleapis.com'&&/\/token$/.test(u.pathname));
  return {...base,mutating:base.mutating||!(firestoreRead||authRead)};
}

async function installD07ReadOnlyContextGuardR7(context){
  // Install before goto/Auth. Listener reads, token exchange and account lookup remain allowed.
  // No Storage binary read is allowed until both catalogs and the exact SDK document are bound.
  const pattern=/^https?:\/\//;
  const evidence={strictReadOnlyPolicy:'R7_EXPLICIT_READ_ONLY_POST_WHITELIST',installedBeforeNavigation:true,bindingSet:false,blockedWriteRequests:0,
    blockedUnexpectedStorageReads:0,storageGetsOutsideRoleGuard:0};
  let endpoint=null;
  const handler=async route=>{
    const request=route.request();
    const kind=classifyD07RequestR7({url:request.url(),method:request.method(),endpoint});
    if(kind.mutating){evidence.blockedWriteRequests++;await route.abort('blockedbyclient');}
    else if(kind.unexpectedRead){evidence.blockedUnexpectedStorageReads++;await route.abort('blockedbyclient');}
    else{if(kind.exactPdfGet)evidence.storageGetsOutsideRoleGuard++;await route.continue();}
  };
  await context.route(pattern,handler);
  return {evidence,setBinding(binding){
    check(!evidence.bindingSet&&binding?.safe?.bothRoleCatalogsVisible===true&&binding?.safe?.exactMetadataBound===true&&
      binding?.sourceProof?.sourceSha===D07.sourceSha&&typeof binding?.endpoint==='string','CONTEXT_BINDING_UNPROVEN');
    endpoint=binding.endpoint;evidence.bindingSet=true;
  },stop:()=>context.unroute(pattern,handler)};
}


async function readD07RolePdfR7({page,role,uid,binding,outDir}){
  const result={role,decision:'HOLD',stage:'START',stages:[],clickAttempted:false,clickCompleted:false,clickTimeout:false,
    openClicks:0,binaryGetCount:0,blockedUnexpectedRequests:0,
    downloadCount:0,rendered:false,writesObserved:false,blockedWriteRequests:0,httpStatus:null,networkError:null,diagnostic:null};
  const pending=[],guardPattern=/^https?:\/\//;let guardInstalled=false;
  const startedAt=Date.now();let domObserver=null;
  result.dom={beforeClick:null,afterClick:null,failure:null,observation:null};result.pageErrors=[];
  const mark=stage=>{result.stage=stage;result.stages.push({stage,elapsedMs:Date.now()-startedAt});};
  const errorType=error=>['Error','TimeoutError','AssertionError','TypeError','ReferenceError','SyntaxError','RangeError','AbortError','NetworkError','FirebaseError','InvalidStateError'].includes(error?.name)?error.name:'OTHER';
  const observePageError=error=>{if(result.pageErrors.length<12)result.pageErrors.push({stage:result.stage,type:errorType(error),elapsedMs:Date.now()-startedAt});};
  const readSafeDom=async()=>{
    const dom=await bounded(page.evaluate(id=>{
      const exact=[...document.querySelectorAll('button[data-doc]')].filter(n=>n.dataset.doc===id),button=exact[0]||null;
      const visible=node=>!!node?.isConnected&&node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden'&&getComputedStyle(node).display!=='none';
      const rect=button?.getBoundingClientRect(),x=rect?rect.left+rect.width/2:-1,y=rect?rect.top+rect.height/2:-1;
      const inside=x>=0&&y>=0&&x<innerWidth&&y<innerHeight,hit=inside?document.elementFromPoint(x,y):null;
      const tags=['BUTTON','DIV','SPAN','A','CANVAS','SECTION','MAIN','BODY','HTML','INPUT','SVG','PATH'];
      const statuses=[...document.querySelectorAll('[data-pdf-status]')],status=statuses[0]||null,viewer=document.querySelector('[data-pdf-viewer]');
      const stages=['TOKEN','GET','GET_HTTP','BYTES','COMPLETE','PDF_JS_LOAD','PDF_JS_DOCUMENT','PDF_JS_RENDER','RESOURCE_READ'];
      const rawStatus=status?.dataset.pdfStatus,rawStage=status?.dataset.d07Stage,rawCode=status?.dataset.d07Code;
      return {viewPresent:!!document.querySelector('#view'),catalogOpenButtonCount:document.querySelectorAll('button[data-doc]').length,
        exactOpenButtonCount:exact.length,exactOpenButtonConnected:button?.isConnected===true,exactOpenButtonVisible:visible(button),
        exactOpenButtonEnabled:button?button.disabled===false:null,centerInViewport:inside,centerHitsExactButton:!!button&&!!hit&&(hit===button||button.contains(hit)),
        centerHitTag:hit?(tags.includes(hit.tagName)?hit.tagName:'OTHER'):null,
        viewerCount:document.querySelectorAll('[data-pdf-viewer]').length,viewerVisible:visible(viewer),statusCount:statuses.length,
        pdfStatus:status?(['loading','ready','failed'].includes(rawStatus)?rawStatus:'OTHER'):null,
        pdfStage:stages.includes(rawStage)?rawStage:null,pdfCode:/^RESOURCE_(?:READ|PDF)_[A-Z0-9_]{3,80}$/.test(rawCode||'')?rawCode:null,
        canvasCount:document.querySelectorAll('[data-pdf-viewer] canvas').length,backButtonPresent:!!document.querySelector('#docBack'),
        downloadButtonPresent:!!document.querySelector('[data-pdf-download]'),downloadButtonEnabled:document.querySelector('[data-pdf-download]')?.disabled===false,
        retryButtonCount:document.querySelectorAll('[data-pdf-retry]').length};
    },binding.id),5000,'SAFE_DOM_TIMEOUT');
    if(domObserver)dom.observation=await bounded(domObserver.evaluate(state=>state.read()),5000,'DOM_OBSERVER_READ_TIMEOUT');
    return dom;
  };
  page.on('pageerror',observePageError);
  const observeResponse=response=>{if(response.url()===binding.endpoint&&response.request().method()==='GET')result.httpStatus=response.status();};
  const observeFailure=request=>{if(request.url()===binding.endpoint){const code=String(request.failure()?.errorText||'');result.networkError=/^net::ERR_[A-Z0-9_]+$/.test(code)?code:'OTHER_NETWORK_ERROR';}};
  page.on('response',observeResponse);page.on('requestfailed',observeFailure);
  const guard=async route=>{
    const request=route.request();
    const kind=classifyD07RequestR7({url:request.url(),method:request.method(),endpoint:binding.endpoint,getCount:result.binaryGetCount});
    if(kind.mutating||kind.unexpectedRead){
      result.blockedUnexpectedRequests++;result.writesObserved||=kind.mutating;
      if(kind.mutating)result.blockedWriteRequests++;
      await route.abort('blockedbyclient');return;
    }
    if(kind.exactPdfGet){
      result.binaryGetCount++;
      pending.push(request.headerValue('authorization').then(value=>{result.authenticatedGetHeaderPresent=typeof value==='string'&&/^Firebase .+/.test(value);}).catch(()=>{result.authenticatedGetHeaderPresent=false;}));
    }
    await route.continue();
  };
  try{
    mark('INSTALL_ROLE_GUARD');
    await page.route(guardPattern,guard);guardInstalled=true;
    // Only the app router is invoked; the binary read must result from this exact visible button click.
    mark('NAVIGATE_CATALOG');
    await bounded(page.evaluate(()=>window.CX.router.nav('documentos',{history:false})),10000,'RESOURCES_NAVIGATION_TIMEOUT');
    const open=page.locator('button[data-doc="'+binding.id+'"]');
    mark('WAIT_EXACT_OPEN_BUTTON');
    await open.waitFor({state:'visible',timeout:15000});
    check(await open.count()===1,'EXACT_OPEN_BUTTON_NOT_UNIQUE');
    if(role==='shopper'){
      check(await page.locator('#docUp').count()===0,'SHOPPER_CREATE_CONTROL_VISIBLE');
      check(await page.locator('[data-editd],[data-deld]').count()===0,'SHOPPER_MUTATION_CONTROL_VISIBLE');
    }
    mark('INSTALL_PASSIVE_DOM_OBSERVER');
    domObserver=await bounded(page.evaluateHandle(id=>{
      const find=()=>[...document.querySelectorAll('button[data-doc]')].find(node=>node.dataset.doc===id)||null;
      const initial=find(),began=performance.now();let current=initial,callbacks=0,replacements=0,detachments=0;
      const transitions=[];
      const read=()=>({callbacks,openButtonReplacements:replacements,openButtonDetachments:detachments,
        initialButtonStillConnected:initial?.isConnected===true,transitions:transitions.slice()});
      const observer=new MutationObserver(()=>{
        callbacks++;const next=find();
        if(next!==current){
          replacements++;if(current&&!current.isConnected)detachments++;current=next;
          if(transitions.length<16)transitions.push({elapsedMs:Math.round(performance.now()-began),openButtonPresent:!!next,initialButtonStillConnected:initial?.isConnected===true});
        }
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
      return {read,stop:()=>{observer.disconnect();return read();}};
    },binding.id),5000,'DOM_OBSERVER_INSTALL_TIMEOUT');
    mark('DOM_BEFORE_OPEN_CLICK');result.dom.beforeClick=await readSafeDom();
    mark('OPEN_CLICK');result.clickAttempted=true;
    await open.click({timeout:10000});
    result.clickCompleted=true;result.openClicks=1;
    mark('DOM_AFTER_OPEN_CLICK');result.dom.afterClick=await readSafeDom();
    mark('WAIT_PDF_TERMINAL_STATUS');
    await page.waitForFunction(()=>['ready','failed'].includes(document.querySelector('[data-pdf-status]')?.dataset.pdfStatus),null,{timeout:45000});
    mark('READ_PDF_STATUS');
    result.diagnostic=await bounded(page.locator('[data-pdf-status]').evaluate(node=>({
      status:node.dataset.pdfStatus,stage:node.dataset.d07Stage||null,code:node.dataset.d07Code||null,
      text:String(node.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
    })),10000,'VISIBLE_DIAGNOSTIC_TIMEOUT');
    if(result.diagnostic.status!=='ready')fail('PDF_VISIBLE_FAILURE');
    check(result.diagnostic.text==='PDF visible en la plataforma','PDF_READY_TEXT_MISMATCH');
    mark('OBSERVE_RENDERED_CANVAS');
    const canvas=await bounded(page.locator('[data-pdf-viewer] canvas').evaluate(node=>{
      const w=node.width,h=node.height,ctx=node.getContext('2d');
      if(!w||!h||!ctx)return {width:w,height:h,inkPixels:0};
      const data=ctx.getImageData(0,0,w,h).data;let ink=0;
      for(let i=0;i<data.length;i+=4)if(data[i+3]>0&&(data[i]<245||data[i+1]<245||data[i+2]<245)){if(++ink>=16)break;}
      return {width:w,height:h,inkPixels:ink};
    }),10000,'CANVAS_OBSERVATION_TIMEOUT');
    check(canvas.width>100&&canvas.height>100&&canvas.inkPixels>=16,'PDF_CANVAS_BLANK');
    result.rendered=true;result.canvas=canvas;
    mark('READ_PAGE_COUNT');
    const position=(await page.locator('[data-pdf-page]').innerText()).trim();
    const match=/^Página 1 de ([1-9]\d*)$/.exec(position);check(match,'PDF_PAGE_COUNT_UNPROVEN');
    result.pageCount=Number(match[1]);
    mark('CAPTURE_RENDERED_PDF');
    await page.locator('[data-pdf-viewer]').screenshot({path:outDir+'/d07-'+role+'-pdf-page1.png',timeout:10000});
    mark('CHECK_DOWNLOAD_BUTTON');
    const downloadButton=page.locator('[data-pdf-download]');
    check(await downloadButton.isEnabled(),'PDF_DOWNLOAD_NOT_ENABLED');
    // The app reuses the authenticated bytes. Download must not start a second provider GET.
    mark('DOWNLOAD_CLICK_AND_EVENT');
    const [download]=await Promise.all([page.waitForEvent('download',{timeout:15000}),downloadButton.click({timeout:10000})]);
    result.downloadCount=1;
    check(norm(download.suggestedFilename())===norm(D07.approvedName),'DOWNLOAD_NAME_MISMATCH');
    mark('READ_DOWNLOAD_STREAM');
    const stream=await bounded(download.createReadStream(),15000,'DOWNLOAD_STREAM_TIMEOUT');check(stream,'DOWNLOAD_STREAM_MISSING');
    mark('HASH_DOWNLOADED_BYTES');
    const content=await bounded((async()=>{
      const digest=createHash('sha256');let size=0,signature=Buffer.alloc(0);
      for await(const chunk of stream){
        size+=chunk.length;check(size<=D07.approvedSize,'DOWNLOAD_EXCEEDS_APPROVED_SIZE');
        if(signature.length<5)signature=Buffer.concat([signature,chunk]).subarray(0,5);
        digest.update(chunk);
      }
      return {size,sha256:digest.digest('hex'),pdfSignature:signature.equals(Buffer.from('%PDF-'))};
    })(),15000,'DOWNLOAD_BYTES_TIMEOUT');
    check(content.pdfSignature&&content.size===D07.approvedSize&&content.sha256===D07.approvedSha256,'DOWNLOAD_NOT_APPROVED_PDF_BYTES');
    result.download=content;
    if(result.pageCount>1){
      mark('NEXT_PAGE_CLICK');
      await page.locator('[data-pdf-next]').click({timeout:10000});
      mark('WAIT_SECOND_PAGE');
      await page.waitForFunction(()=>/^Página 2 de /.test(document.querySelector('[data-pdf-page]')?.textContent||''),null,{timeout:10000});
      mark('PREVIOUS_PAGE_CLICK');
      await page.locator('[data-pdf-prev]').click({timeout:10000});
      mark('WAIT_FIRST_PAGE_AGAIN');
      await page.waitForFunction(()=>/^Página 1 de /.test(document.querySelector('[data-pdf-page]')?.textContent||''),null,{timeout:10000});
      result.pageNavigation='PASS_1_2_1';
    }else result.pageNavigation='SINGLE_PAGE';
    mark('RETURN_TO_CATALOG_CLICK');
    await page.locator('#docBack').click({timeout:10000});
    mark('WAIT_CATALOG_RETURN');
    await open.waitFor({state:'visible',timeout:10000});result.backToCatalog=true;
    mark('VERIFY_CATALOG_BINDING_UNCHANGED');
    const after=await readD07LoadedBinding(page,{role,uid});
    for(const field of ['id','storagePath','version','bucket'])check(after[field]===binding[field],'RESOURCE_CHANGED_DURING_READ');
    mark('VERIFY_EXACT_READ_FOOTPRINT');
    await Promise.all(pending);
    check(result.binaryGetCount===1&&result.authenticatedGetHeaderPresent===true&&result.httpStatus===200,'EXACT_AUTHENTICATED_GET_NOT_PROVEN');
    check(result.blockedUnexpectedRequests===0&&!result.writesObserved,'UNEXPECTED_REQUEST_DURING_READ');
    mark('COMPLETE');
    result.decision='PASS_EXACT_APPROVED_PDF_READ_RENDER_DOWNLOAD_FOR_ROLE';
  }catch(error){
    result.failureStage=result.stage;result.errorType=errorType(error);
    result.clickTimeout=result.stage==='OPEN_CLICK'&&result.clickAttempted&&!result.clickCompleted&&result.errorType==='TimeoutError';
    result.failureElapsedMs=Date.now()-startedAt;
    result.dom.failure=await readSafeDom().catch(()=>({available:false,code:'D07_SAFE_DOM_UNAVAILABLE'}));
    result.error=/^D07_[A-Z0-9_]+$/.test(String(error?.message||''))?error.message:'D07_BOUNDED_UI_OR_PROVIDER_FAILURE';
    // Do not log raw URLs, credentials, Auth records, Storage paths, or response bodies.
    if(!result.diagnostic)result.diagnostic=await bounded(page.locator('[data-pdf-status]').evaluate(node=>({
      status:node.dataset.pdfStatus,stage:node.dataset.d07Stage||null,code:node.dataset.d07Code||null,
      text:String(node.innerText||'').replace(/\s+/g,' ').trim().slice(0,700),
    })),10000,'FAILURE_DIAGNOSTIC_TIMEOUT').catch(()=>null);
    result.failureScreenshot={attempted:true,saved:false};
    await page.locator('#view').screenshot({path:outDir+'/d07-'+role+'-failure.png',timeout:10000}).then(()=>{result.failureScreenshot.saved=true;},()=>{});
  }finally{
    page.off('pageerror',observePageError);
    if(domObserver){
      result.dom.observation=await bounded(domObserver.evaluate(state=>state.stop()),5000,'DOM_OBSERVER_STOP_TIMEOUT').catch(()=>({available:false,code:'D07_DOM_OBSERVER_STOP_UNAVAILABLE'}));
      await bounded(domObserver.dispose(),5000,'DOM_OBSERVER_DISPOSE_TIMEOUT').catch(()=>{});
    }
    page.off('response',observeResponse);page.off('requestfailed',observeFailure);
    if(guardInstalled)await page.unroute(guardPattern,guard);
    await Promise.allSettled(pending);
  }
  return result;
}


const R7Finance=R7_MODE?(()=>{

// Proposal for the existing CI runner only. Importing this file performs no I/O.
// Four approved UI commands, two exact synthetic replays, thirteen linked docs.
const C04C05=Object.freeze({
  schema:'cxorbia.i3.c04-c05.bounded-finance.v1',
  uid:'NkcIVM4AnSU1gI9cGKHI5P12YqC3',tenantId:'tya',projectId:'cinepolis',
  projectPeriod:'cinepolis-2026-10',globalPeriod:'2026-10',
  commandPath:'/v1/cxorbia/commands',maxRowsPerScopedQuery:500,
  commands:4,replays:2,maxLinkedDocuments:13,
  cxc:{country:'GT',currency:'Q',amount:1,apply:0.4,balance:0.6},
  financing:{country:'HN',currency:'L',amount:2,apply:0.5,balance:1.5}
});
const OWNER_PATHS=['app/modules/finanzas.js','app/core/backend-finance-benefits.js',
  'app/core/backend-cxdata-finance-read.js','app/adapters/cxorbia-cxdata-command-boundary-v1.js',
  'app/adapters/cxorbia-command-adapter-v1.js'];
const str=value=>String(value??'');
const arr=value=>Array.isArray(value)?value:[];
const uniq=value=>[...new Set(arr(value).map(str))].sort();
const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value))).digest('hex');
function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object'){
    if(typeof value.toJSON==='function')return stable(value.toJSON());
    return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,stable(value[k])]));
  }
  return value;
}
const check=(ok,code)=>{if(!ok)throw new Error('C04_'+code);};
const timeOf=snap=>snap?.updateTime?{seconds:snap.updateTime.seconds,nanoseconds:snap.updateTime.nanoseconds}:null;
const head=snap=>({id:snap.id,exists:snap.exists===true,hash:snap.exists?sha(snap.data()):null,updateTime:timeOf(snap)});
const versionOf=row=>row?.version??row?.updatedAt??row?.lastSyncedAt??row?.hrRevision??row?.sourceRevision??'source-current';
const cents=value=>Math.round(Number(value)*100);
const rowScope=row=>row?.tenantId===C04C05.tenantId&&row?.projectId===null&&row?.global===true&&row?.periodId===C04C05.globalPeriod;
const safeError=error=>/^C04_[A-Z0-9_]+$/.test(str(error?.message))?error.message:
  error?.name==='TimeoutError'?'C04_UI_TIMEOUT':'C04_BOUNDED_CASE_FAILURE';
async function bounded(promise,ms,code){
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('C04_'+code)),ms);})]);}
  finally{clearTimeout(timer);}
}
function getAll(db,refs){return bounded(db.getAll(...refs),15000,'EXACT_SERVER_READ_TIMEOUT');}

function validateC04Pins(pins,proof){
  for(const field of ['sourceSha','sourceTree','rulesGitBlob'])check(/^[a-f0-9]{40}$/.test(str(pins?.[field])),'PIN_MISSING');
  check(/^sha256:[a-f0-9]{64}$/.test(str(pins.runtimeDigest))&&/^cxorbia-live-hr-dev-[a-z0-9-]+$/.test(str(pins.runtimeRevision)),'RUNTIME_PIN_MISSING');
  check(/^[a-f0-9]{64}$/.test(str(pins.hrRevision)),'HR_PIN_MISSING');
  check(pins.deliveryKind==='DEV_LIVE_MATERIALIZATION'&&Number.isSafeInteger(pins.materializationRunId)&&pins.materializationRunId>0,'DEV_MATERIALIZATION_PIN_MISSING');
  check(pins.origin==='https://cxorbia-backend-dev.web.app','DEV_ORIGIN_DENIED');
  check(/^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/.test(str(pins.hostingVersion)),'HOSTING_PIN_MISSING');
  check(pins.rulesRelease==='projects/cxorbia-backend-dev/releases/cloud.firestore'&&/^projects\/cxorbia-backend-dev\/rulesets\/[a-zA-Z0-9-]+$/.test(str(pins.rulesetName)),'RULES_RELEASE_PIN_MISSING');
  check(proof?.sourceIdentityVerified===true&&proof?.rulesReleaseVerified===true,'MATERIALIZATION_NOT_PROVEN');
  for(const field of ['sourceSha','sourceTree','rulesGitBlob','runtimeRevision','runtimeDigest','hrRevision','deliveryKind','materializationRunId','origin','hostingVersion','rulesRelease','rulesetName'])check(proof[field]===pins[field],'MATERIALIZATION_PIN_MISMATCH');
  for(const owner of OWNER_PATHS)check(/^[a-f0-9]{40}$/.test(str(pins.owners?.[owner]))&&proof.servedOwnerBlobs?.[owner]===pins.owners[owner],'FINANCE_OWNER_NOT_PROVEN');
  return true;
}

function validateC04Actor(member,user){
  check(member?.id===C04C05.uid&&member.active===true&&member.tenantId===C04C05.tenantId&&member.authNamespace==='staff','EXACT_ADMIN_MEMBERSHIP_INVALID');
  check(['admin','super'].includes(member.role),'EXACT_ADMIN_ROLE_INVALID');
  check(member.role==='super'||member.entitlementMode==='TYA_COMPLETE','GLOBAL_ENTITLEMENT_REQUIRED');
  check(Array.isArray(member.projectIds)&&member.projectIds.includes(C04C05.projectId),'EXACT_ADMIN_PROJECT_DENIED');
  const memberCountries=uniq(member.countries);
  check(member.role==='super'||memberCountries.length===0||['GT','HN'].every(c=>memberCountries.includes(c)),'GT_HN_SCOPE_DENIED');
  const claims=user?.customClaims||{};
  check(user?.uid===C04C05.uid&&user.disabled===false&&claims.role===member.role&&claims.tenantId===C04C05.tenantId&&claims.authNamespace==='staff','EXACT_ADMIN_CLAIMS_INVALID');
  check(isDeepStrictEqual(uniq(claims.projectIds),uniq(member.projectIds)),'EXACT_ADMIN_CLAIMS_SCOPE_MISMATCH');
  return {uidFingerprint:sha('cxorbia-provider-uid-v1\0'+C04C05.uid),role:member.role,
    tenantId:member.tenantId,authNamespace:member.authNamespace,active:member.active,
    entitlementMode:member.entitlementMode??null,projectIds:uniq(member.projectIds),countries:memberCountries,
    countryScopeRule:member.role==='super'?'super':memberCountries.length?'explicit_countries':'provider_empty_list_means_unrestricted',
    memberRead:'exact_document',authRead:'exact_getUser',accountCreated:false,claimsChanged:false};
}

function c04ExpectedReferences(command){
  const prefix='tenants/'+C04C05.tenantId+'/',type=command.commandType;
  const rootKey=`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${command.idempotencyKey}`;
  const receipt=prefix+'commandReceipts/'+sha(rootKey).slice(0,40);
  const audit=prefix+'entityAuditTrail/finance-'+sha(command.idempotencyKey+'\0'+type).slice(0,40);
  const result={receipt,audit,created:[receipt,audit],changed:[]};
  if(type==='finance.account.create'){
    result.accountId=command.entityId||'acct-'+sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${command.payload.kind}\0${command.idempotencyKey}`).slice(0,28);
    result.account=prefix+'financeAccounts/'+result.accountId;result.created.push(result.account);
  }else if(type==='finance.movement.create'){
    result.movementId=command.entityId||'mov-'+sha(rootKey).slice(0,28);
    result.movement=prefix+'financialMovements/'+result.movementId;result.created.push(result.movement);
    result.accountId='fin-'+sha(result.movementId+'\0cxp').slice(0,28);
    result.account=prefix+'financeAccounts/'+result.accountId;result.created.push(result.account);
  }else if(type==='finance.account.apply'){
    result.accountId=command.entityId;
    result.account=prefix+'financeAccounts/'+result.accountId;result.changed.push(result.account);
    result.movementId='acct-'+sha(result.accountId+'\0'+command.idempotencyKey).slice(0,30);
    result.movement=prefix+'financialMovements/'+result.movementId;result.created.push(result.movement);
  }else check(false,'COMMAND_TYPE_DENIED');
  return result;
}

function validateC04Command(command,step){
  check(command?.version==='cxorbia-command-adapter-v1'&&command.tenantId===C04C05.tenantId&&command.projectId===null&&command.periodId===C04C05.globalPeriod&&command.requireProject===false&&command.requirePeriod===true,'COMMAND_SCOPE_DENIED');
  const p=command.payload||{};
  check(p.global===true&&p.periodId===C04C05.globalPeriod&&!p.projectId&&!p.proyectoId&&!p.visitId&&!p.visitaId&&!arr(p.visitIds).length,'COMMAND_LINK_DENIED');
  check(str(command.idempotencyKey).length>8&&command.actor?.actorId===C04C05.uid&&command.actor?.role===step.role,'COMMAND_ACTOR_OR_IDEMPOTENCY_DENIED');
  check(command.authorization?.providerEnforcementRequired===true,'COMMAND_PROVIDER_ENFORCEMENT_REQUIRED');
  if(step.replay){check(isDeepStrictEqual(command,step.originalCommand),'REPLAY_NOT_EXACT');return true;}
  const createAccount=step.kind==='create-cxc',createFinancing=step.kind==='create-financing';
  const type=createAccount?'finance.account.create':createFinancing?'finance.movement.create':'finance.account.apply';
  const permission=createAccount?'finance.account.write':createFinancing?'finance.movement.write':'finance.account.apply';
  check(command.commandType===type&&command.authorization.permission===permission,'COMMAND_TYPE_DENIED');
  check(command.entityType===(createFinancing?'financialMovement':'financeAccount'),'COMMAND_ENTITY_TYPE_DENIED');
  if(createAccount||createFinancing){
    check(command.entityId===null&&command.expectedVersion==='absent','CREATE_ID_OR_VERSION_DENIED');
    const expected=createAccount?C04C05.cxc:C04C05.financing;
    check(p.country===expected.country&&p.pais===expected.country&&p.currency===expected.currency&&p.moneda===expected.currency&&p.amount===expected.amount&&p.monto===expected.amount,'CREATE_MONEY_DENIED');
    check(p.concepto===step.marker,'QA_MARKER_MISSING');
    if(createAccount)check(p.kind==='cxc'&&p.origin==='manual','CXC_KIND_DENIED');
    if(createFinancing)check(p.tipo==='ingreso'&&p.tipoIngreso==='financiamiento'&&p.cat===step.marker&&p.beneficiario===step.marker,'FINANCING_CLASSIFICATION_DENIED');
  }else{
    check(command.entityId===step.accountId&&p.accountId===step.accountId&&p.amount===step.amount,'QA_ACCOUNT_APPLY_DENIED');
    check(str(command.expectedVersion)===str(step.expectedVersion)&&str(command.expectedVersion)!=='source-current','ACCOUNT_VERSION_DENIED');
  }
  if(!createAccount)check(/^2026-10-(?:0[1-9]|[12][0-9]|3[01])$/.test(str(p.fecha)),'COMMAND_DATE_DENIED');
  return true;
}

function classifyC04Request({url,method,origin}){
  const u=new URL(url),m=str(method).toUpperCase(),p=u.pathname;
  if(p===C04C05.commandPath)return u.origin===origin&&m==='POST'?'command':'deny';
  if(['GET','HEAD','OPTIONS'].includes(m))return 'read';
  if(/(^|\.)firestore\.googleapis\.com$/.test(u.hostname)){
    if(m!=='POST')return 'deny';
    return /\/Listen\/channel$|:(?:batchGet|runQuery|runAggregationQuery|partitionQuery|beginTransaction|rollback)$|\/(?:BatchGetDocuments|GetDocument|ListDocuments|ListCollectionIds|RunQuery|RunAggregationQuery|PartitionQuery|BeginTransaction|Rollback)$/.test(p)?'read':'deny';
  }
  if(/(?:firebasestorage\.googleapis\.com|storage\.googleapis\.com)$/.test(u.hostname))return 'deny';
  if(/(?:identitytoolkit|securetoken)\.googleapis\.com$/.test(u.hostname)){
    return m==='POST'&&/accounts:(?:signInWithCustomToken|signInWithPassword|lookup)$|\/token$/.test(p)?'read':'deny';
  }
  return 'deny';
}

function createCommandGuard({db,pins,onPlanned,knownHeads}){
  let context,active=null,stopped=false;
  const routePattern=/^https?:\/\//;
  const pendingResponses=new Set(),requests=new Map();
  const evidence={installedBeforeNavigation:false,commandsIssued:0,replaysIssued:0,unexpectedMutationBlocked:0,validationFailures:[],requestCount:0};
  async function beforeCommand(command,step){
    validateC04Command(command,step);
    const refs=c04ExpectedReferences(command);
    if(step.replay){
      check(refs.receipt===step.originalRefs.receipt&&refs.audit===step.originalRefs.audit,'REPLAY_REFERENCE_MISMATCH');
    }else{
      const all=[...refs.created,...refs.changed],snaps=await getAll(db,all.map(p=>db.doc(p)));
      for(let i=0;i<all.length;i++){
        if(refs.created.includes(all[i]))check(!snaps[i].exists,'QA_ID_COLLISION_DO_NOT_TOUCH');
        else check(knownHeads.has(all[i])&&isDeepStrictEqual(head(snaps[i]),knownHeads.get(all[i])),'QA_ACCOUNT_CHANGED_BEFORE_COMMAND');
      }
      onPlanned({command,refs,step});
    }
    return refs;
  }
  const handler=async route=>{
    const req=route.request(),kind=classifyC04Request({url:req.url(),method:req.method(),origin:pins.origin});
    evidence.requestCount++;
    if(kind==='deny'){
      evidence.unexpectedMutationBlocked++;
      await route.abort('blockedbyclient');return;
    }
    if(kind!=='command'){await route.continue();return;}
    const item=active;
    if(!item||item.claimed){evidence.unexpectedMutationBlocked++;await route.abort('blockedbyclient');return;}
    item.claimed=true;
    try{
      const command=req.postDataJSON();
      const refs=await beforeCommand(command,item.step);
      item.command=command;item.refs=refs;requests.set(req,item);
      if(item.step.replay)evidence.replaysIssued++;else evidence.commandsIssued++;
      item.continued=true;
      await route.continue();
    }catch(error){
      const code=safeError(error);evidence.validationFailures.push(code);item.reject(Error(code));
      await route.abort('blockedbyclient').catch(()=>{});
    }
  };
  const responseHandler=response=>{
    const item=requests.get(response.request());if(!item)return;
    const task=(async()=>{
      try{
        const body=await bounded(response.json(),15000,'COMMAND_RESPONSE_TIMEOUT');
        item.resolve({command:item.command,refs:item.refs,step:item.step,httpStatus:response.status(),body});
      }catch(error){item.reject(Error(safeError(error)));}
    })();
    pendingResponses.add(task);task.finally(()=>pendingResponses.delete(task));
  };
  const failedHandler=request=>{const item=requests.get(request);if(item)item.reject(Error('C04_COMMAND_NETWORK_FAILURE'));};
  return {
    evidence,
    get context(){return context;},
    async install(ctx){
      check(!context&&ctx.pages().length===0,'GUARD_MUST_PRECEDE_PAGE');context=ctx;
      await ctx.route(routePattern,handler);ctx.on('response',responseHandler);ctx.on('requestfailed',failedHandler);
      evidence.installedBeforeNavigation=true;
    },
    arm(step){
      check(!active,'COMMAND_ALREADY_ARMED');
      let resolve,reject;const observed=new Promise((yes,no)=>{resolve=yes;reject=no;});
      // Attach the rejection handler immediately, before the UI event can fail.
      observed.catch(()=>{});
      const item={step,resolve,reject,claimed:false,continued:false};active=item;
      return {observed,finish(){check(active===item,'COMMAND_ARM_CHANGED');active=null;},item};
    },
    async stop(){
      if(stopped)return;stopped=true;
      if(context){context.off('response',responseHandler);context.off('requestfailed',failedHandler);await context.unroute(routePattern,handler);}
      await Promise.allSettled([...pendingResponses]);
    }
  };
}

async function readScope(page,pins,role){
  const state=await bounded(page.evaluate(()=>{
    const c=window.CX?.backendAuth?.context?.()||{};
    return {uid:window.firebase?.auth?.().currentUser?.uid||'',role:c.role,tenantId:c.tenantId,authNamespace:c.authNamespace,
      projectId:window.CX?.data?.currentProjectId,periodId:window.CX?.data?.currentPeriodId,
      hrRevision:window.CX?.data?.previewMeta?.sourceRevision,backendEnabled:window.CX?.BACKEND?.enabled===true,
      fixtures:typeof window.CX?.dataSource?.showFixtures==='function'?window.CX.dataSource.showFixtures():null,
      effectiveRole:window.CX?.session?.effectiveRole?.(),testRole:window.CX?.session?.testRole||null};
  }),10000,'APP_SCOPE_READ_TIMEOUT');
  check(new URL(page.url()).origin===pins.origin,'APP_ORIGIN_MISMATCH');
  check(state.uid===C04C05.uid&&state.role===role&&state.effectiveRole===role&&!state.testRole&&state.tenantId===C04C05.tenantId&&state.authNamespace==='staff','APP_PRINCIPAL_MISMATCH');
  check(state.projectId===C04C05.projectId&&state.periodId===C04C05.projectPeriod&&state.hrRevision===pins.hrRevision,'APP_SCOPE_MISMATCH');
  check(state.backendEnabled&&state.fixtures===false,'PROTECTED_FINANCE_NOT_ACTIVE');
  return {role,tenantId:state.tenantId,projectId:state.projectId,periodId:state.periodId,hrRevision:state.hrRevision,fixtures:false};
}

async function openGlobal(page,pins,role){
  await readScope(page,pins,role);
  await bounded(page.evaluate(()=>window.CX.router.nav('movimientos',{history:false})),10000,'FINANCE_NAV_TIMEOUT');
  const global=page.locator('[data-scope="global"]');
  await global.waitFor({state:'visible',timeout:20000});check(await global.count()===1,'GLOBAL_CONTROL_AMBIGUOUS');
  await global.click({timeout:10000});
  await page.waitForFunction(()=>document.querySelector('[data-scope="global"]')?.classList.contains('btn-pr')&&
    window.CX?.data?.__financeGlobalProjectionLoaded===true&&
    window.CX.data.__financeGlobalProjectionKey==='tya::__global__::2026-10'&&
    !!document.querySelector('[data-cuenta="cxc"]')&&!!document.querySelector('#addFin'),null,{timeout:30000});
  await readScope(page,pins,role);
}

async function scopedLedgerSnapshot(db){
  const tenant=db.collection('tenants').doc(C04C05.tenantId),out=new Map();
  for(const name of ['financialMovements','financeAccounts']){
    for(const scope of ['global','project']){
      let q=tenant.collection(name);
      q=scope==='global'?q.where('global','==',true).where('projectId','==',null).where('periodId','==',C04C05.globalPeriod):
        q.where('projectId','==',C04C05.projectId).where('periodId','==',C04C05.projectPeriod);
      const snap=await bounded(q.limit(C04C05.maxRowsPerScopedQuery+1).get(),15000,'SCOPED_BASELINE_TIMEOUT');
      check(snap.size<=C04C05.maxRowsPerScopedQuery,'SCOPED_BASELINE_LIMIT_EXCEEDED');
      for(const doc of snap.docs)out.set(doc.ref.path,{head:head(doc),data:doc.data(),scope,collection:name});
    }
  }
  return out;
}
function ledgerFingerprint(map,excluded=new Set()){
  return [...map].filter(([p])=>!excluded.has(p)).map(([p,v])=>({pathHash:sha(p),...v.head})).sort((a,b)=>a.pathHash.localeCompare(b.pathHash));
}
function operationIncome(map,currency){
  let total=0;
  for(const [,v] of map)if(v.scope==='global'&&v.collection==='financialMovements'){
    const r=v.data;if(r.currency===currency&&Number(r.monto)>0&&r.tipoIngreso!=='financiamiento'&&r.operatingRevenue===true&&r.revenueRecognized===true)total+=Number(r.monto);
  }
  return total;
}

async function linkedSnapshots(db,paths){
  const keys=[...paths].sort();if(!keys.length)return new Map();
  const snaps=await getAll(db,keys.map(p=>db.doc(p)));
  return new Map(keys.map((p,i)=>[p,{head:head(snaps[i]),snap:snaps[i],data:snaps[i].exists?snaps[i].data():null}]));
}
function headsOf(map){return new Map([...map].map(([p,v])=>[p,v.head]));}
function equalHeads(a,b){return isDeepStrictEqual([...a].sort(([p],[q])=>p.localeCompare(q)),[...b].sort(([p],[q])=>p.localeCompare(q)));}

function validateC04CommandFootprint(record,snapshots,knownHeads){
  const created=new Set(record.refs.created),changed=new Set(record.refs.changed);
  for(const p of created)check(!knownHeads.has(p)&&!changed.has(p),'COMMAND_FOOTPRINT_CREATED_COLLISION');
  for(const p of changed)check(knownHeads.has(p),'COMMAND_FOOTPRINT_CHANGED_NOT_OWNED');
  check(snapshots.size===knownHeads.size+created.size,'COMMAND_FOOTPRINT_SIZE_MISMATCH');
  for(const [p,prior] of knownHeads){
    const current=snapshots.get(p)?.head;
    check(current?.exists===true,'COMMAND_FOOTPRINT_OWNED_DOCUMENT_MISSING');
    if(!changed.has(p))check(isDeepStrictEqual(current,prior),'UNEXPECTED_OWNED_DOCUMENT_DELTA');
  }
  for(const [p,current] of snapshots)check(current.head?.exists===true&&(knownHeads.has(p)||created.has(p)),
    'COMMAND_FOOTPRINT_UNPLANNED_DOCUMENT');
  return true;
}

function validateC04Ack(record){
  const b=record.body,c=record.command;
  check(record.httpStatus===200&&b?.ok===true&&b.status==='committed'&&b.committed===true&&b.providerAck===true&&b.successUiAllowed===true,'STRICT_PROVIDER_ACK_REQUIRED');
  check(b.tenantId===c.tenantId&&b.projectId===null&&b.periodId===c.periodId&&b.commandType===c.commandType&&b.idempotencyKey===c.idempotencyKey,'ACK_SCOPE_MISMATCH');
  check(b.localMutation===false&&b.localStorageWrite===false&&b.externalPaymentConfirmed===false&&b.externalPaymentWrites===0&&b.bankWrites===0,'ACK_SIDE_EFFECT_CONTRACT_MISMATCH');
  if(record.step.replay){
    check(b.idempotentReplay===true&&b.providerWrites===0,'REPLAY_WRITES_OR_NOT_IDEMPOTENT');
    check(b.entityId===record.step.originalEntityId,'REPLAY_ENTITY_CHANGED');return;
  }
  check(b.idempotentReplay===false&&b.providerWrites===(record.step.kind==='create-cxc'?3:4),'COMMAND_WRITE_COUNT_MISMATCH');
}

function validateCommittedRows(record,snaps){
  validateC04Ack(record);
  const c=record.command,r=record.refs,b=record.body,p=c.payload;
  const get=ref=>{const s=snaps.get(ref);check(s?.head.exists,'ACK_WITHOUT_EXACT_DOCUMENT');return s.data;};
  const receipt=get(r.receipt),audit=get(r.audit);
  check(receipt.status==='committed'&&receipt.providerAck===true&&receipt.commandType===c.commandType&&receipt.commandDigest===sha(c)&&receipt.actorUid===C04C05.uid,'RECEIPT_MISMATCH');
  check(rowScope(audit)&&audit.actorUid===C04C05.uid&&audit.commandType===c.commandType&&audit.idempotencyKey===c.idempotencyKey,'AUDIT_SCOPE_MISMATCH');
  const account=get(r.account);
  check(rowScope(account)&&account.id===r.accountId,'ACCOUNT_ID_OR_SCOPE_MISMATCH');
  if(record.step.kind==='create-cxc'){
    check(b.entityId===r.accountId&&account.kind==='cxc'&&account.concepto===record.step.marker&&account.country==='GT'&&account.currency==='Q'&&cents(account.originalAmount)===100&&cents(account.balance)===100,'CXC_CREATE_READBACK_MISMATCH');
    check(isDeepStrictEqual(receipt.entity,account)&&isDeepStrictEqual(b.account,account),'CXC_ACK_RECEIPT_READBACK_MISMATCH');
  }else{
    const movement=get(r.movement);
    check(rowScope(movement)&&movement.id===r.movementId&&movement.revenueRecognized===false&&movement.operatingRevenue===false,'MOVEMENT_SCOPE_OR_DOUBLE_REVENUE');
    check(isDeepStrictEqual(b.movement,movement),'MOVEMENT_ACK_READBACK_MISMATCH');
    if(record.step.kind==='create-financing'){
      check(b.entityId===r.movementId&&movement.tipo==='ingreso'&&movement.tipoIngreso==='financiamiento'&&movement.nonOperating===true&&movement.cat===record.step.marker&&movement.country==='HN'&&movement.currency==='L'&&cents(movement.amount)===200,'FINANCING_MOVEMENT_MISMATCH');
      check(account.kind==='cxp'&&account.origin==='financiamiento'&&account.sourceMovementId===movement.id&&account.concepto===record.step.marker&&account.country==='HN'&&account.currency==='L'&&cents(account.balance)===200,'FINANCING_LINKED_CXP_MISMATCH');
      check(isDeepStrictEqual(receipt.entity,movement)&&isDeepStrictEqual(receipt.linkedAccount,account)&&isDeepStrictEqual(b.linkedAccount,account),'FINANCING_RECEIPT_READBACK_MISMATCH');
    }else{
      const before=record.step.before,expectedBalance=record.step.kind==='apply-cxc'?C04C05.cxc.balance:C04C05.financing.balance;
      check(b.entityId===r.accountId&&movement.accountId===r.accountId&&account.lastMovementId===movement.id&&account.version===Number(before.version||0)+1,'APPLY_LINK_OR_VERSION_MISMATCH');
      check(cents(account.balance)===cents(expectedBalance)&&cents(account.saldo)===cents(expectedBalance)&&cents(movement.amount)===cents(p.amount),'APPLY_BALANCE_MISMATCH');
      check(movement.currency===before.currency&&movement.country===before.country&&account.currency===before.currency&&account.country===before.country,'APPLY_CURRENCY_SCOPE_MISMATCH');
      if(record.step.kind==='apply-cxc')check(movement.tipo==='ingreso'&&movement.tipoIngreso==='cobro_cxc'&&movement.cashCollection===true,'CXC_COLLECTION_CLASSIFICATION_MISMATCH');
      else check(movement.tipo==='egreso'&&movement.tipoEgreso==='abono_cxp'&&movement.cashCollection===false,'CXP_REPAYMENT_CLASSIFICATION_MISMATCH');
      check(movement.cat===(record.step.kind==='apply-cxc'?'Cobro CxC · ':'Abono CxP · ')+before.concepto,'APPLY_CONCEPT_LINK_MISMATCH');
      check(isDeepStrictEqual(receipt.entity,account)&&isDeepStrictEqual(receipt.movement,movement)&&isDeepStrictEqual(b.account,account),'APPLY_ACK_RECEIPT_READBACK_MISMATCH');
      check(cents(audit.balanceBefore)===cents(before.balance)&&cents(audit.balanceAfter)===cents(expectedBalance),'APPLY_AUDIT_BALANCE_MISMATCH');
    }
  }
  check(receipt.entityId===b.entityId&&audit.entityId===b.entityId,'ACK_RECEIPT_AUDIT_ID_MISMATCH');
}

async function visibleFinanceRows(page,model,baseline,label,outDir){
  const proof=await bounded(page.evaluate(({accounts,movements,income})=>{
    const money=(currency,amount)=>currency+' '+Number(amount).toLocaleString('es-GT');
    const text=node=>String(node?.innerText||'').replace(/\s+/g,' ').trim();
    const accountRows=accounts.map(r=>{
      const nodes=[...document.querySelectorAll('[data-cxdet]')].filter(n=>n.dataset.cxdet===r.kind+':'+r.id);
      const row=nodes.length===1?nodes[0].closest(r.kind==='cxc'?'.cxcRow':'.cxpRow'):null;
      const value=text(row);
      const concept=text(row?.querySelector(':scope > div:first-child > b'));
      const country=text(row?.querySelector(':scope > div:first-child > div')).split('·')[0].trim();
      const balance=text(row?.querySelector(':scope > div:last-child > b'));
      return {id:r.id,unique:nodes.length===1,visible:!!row?.getClientRects().length,marker:concept===r.marker,country:country===r.country,money:balance===money(r.currency,r.balance),textHashInput:value};
    });
    const movementRows=movements.map(r=>{
      const nodes=[...document.querySelectorAll('[data-delm]')].filter(n=>n.dataset.delm===r.id);
      const row=nodes.length===1?nodes[0].closest('tr'):null;
      const cells=row?[...row.querySelectorAll('td')]:[];
      return {id:r.id,unique:nodes.length===1,visible:!!row?.getClientRects().length,marker:text(cells[1]?.querySelector('b'))===r.concept,country:text(cells[4])===r.country,money:text(cells[5])===(r.amount<0?'− ':'+ ')+money(r.currency,Math.abs(r.amount)),textHashInput:text(row)};
    });
    const kpis=income.map(x=>{
      const headings=[...document.querySelectorAll('#view div')].filter(n=>text(n)==='Moneda '+x.currency&&n.nextElementSibling?.classList.contains('grid'));
      const cells=headings.length===1?[...headings[0].nextElementSibling.querySelectorAll('.kpi')]:[];
      const tiles=cells.filter(n=>text(n.querySelector('.k-l'))==='Ingresos oper.');
      return {currency:x.currency,unique:headings.length===1&&tiles.length===1,unchanged:tiles.length===1&&text(tiles[0].querySelector('.k-v'))===money(x.currency,x.amount)};
    });
    return {accountRows,movementRows,kpis,globalSelected:document.querySelector('[data-scope="global"]')?.classList.contains('btn-pr')===true};
  },{accounts:model.accounts,movements:model.movements,income:['Q','L'].map(currency=>({currency,amount:operationIncome(baseline,currency)}))}),10000,'DOM_READBACK_TIMEOUT');
  check(proof.globalSelected&&proof.accountRows.every(r=>r.unique&&r.visible&&r.marker&&r.country&&r.money)&&proof.movementRows.every(r=>r.unique&&r.visible&&r.marker&&r.country&&r.money),'VISIBLE_EXACT_ROWS_MISMATCH');
  check(proof.kpis.every(x=>x.unique&&x.unchanged),'VISIBLE_CURRENCY_OR_DOUBLE_REVENUE_MISMATCH');
  for(const r of [...proof.accountRows,...proof.movementRows]){r.textSha256=sha(r.textHashInput);delete r.textHashInput;}
  await page.locator('#view').screenshot({path:path.join(outDir,'c04-'+label+'.png'),timeout:10000});
  return {...proof,screenshot:'c04-'+label+'.png'};
}

async function c04ConditionalCleanup(db,expected){
  const refs=[...expected.keys()].sort();
  check(refs.length>0&&refs.length<=C04C05.maxLinkedDocuments,'CLEANUP_REFERENCE_COUNT_DENIED');
  for(const ref of refs)check(/^tenants\/tya\/(financialMovements|financeAccounts|commandReceipts|entityAuditTrail)\/[a-z0-9-]+$/.test(ref)&&expected.get(ref)?.exists===true&&expected.get(ref).id===ref.split('/').at(-1),'CLEANUP_REFERENCE_SCOPE_DENIED');
  await bounded(db.runTransaction(async tx=>{
    const snapshots=await tx.getAll(...refs.map(p=>db.doc(p)));
    for(let i=0;i<refs.length;i++)check(isDeepStrictEqual(head(snapshots[i]),expected.get(refs[i])),'CLEANUP_PRECONDITION_CHANGED');
    for(const p of refs)tx.delete(db.doc(p));
  },{maxAttempts:1}),20000,'CLEANUP_TRANSACTION_UNCERTAIN');
  const after=await linkedSnapshots(db,refs);
  check([...after.values()].every(v=>v.head.exists===false),'CLEANUP_ABSENCE_NOT_PROVEN');
  return {decision:'PASS_EXACT_CONDITIONAL_CLEANUP',count:refs.length,allAbsent:true,blindDeletes:false};
}

/**
 * openAdminSession({member,label,installContextGuard}) is supplied by the existing
 * CI runner. It creates a fresh BrowserContext, calls installContextGuard(context)
 * BEFORE newPage/goto, uses the existing UID/custom token in memory, proves empty
 * initial Auth, and returns {ctx,page,sessionBoundary}. It must not create users,
 * change claims/membership, navigate elsewhere, or install a service-worker bypass.
 */
async function runC04C05BoundedFinance({db,auth,openAdminSession,pins,proof,runId,outDir}){
  const result={schemaVersion:C04C05.schema,decision:'HOLD_C04_C05_BOUNDED_FINANCE',fullTaskClosed:false,
    scope:{tenantId:C04C05.tenantId,projectId:C04C05.projectId,periodId:C04C05.projectPeriod,globalPeriod:C04C05.globalPeriod},
    sourceSha:pins?.sourceSha||null,sourceTree:pins?.sourceTree||null,runtimeRevision:pins?.runtimeRevision||null,
    commands:[],replays:[],sessions:[],fixturesStarted:false,cleanup:{decision:'NOT_STARTED'},
    writes:{authAccountsIssued:0,claimsIssued:0,membershipIssued:0,hrIssued:0,productionIssued:0,bankIssued:0,externalPaymentIssued:0,financeProvider:null,cleanupDeletes:null},
    c02Executed:false,q205Replayed:false,q7300Recreated:false,production:false};
  const sessions=[],guards=[],planned=new Map(),knownHeads=new Map(),records=[];
  let baseline=null,memberHead=null,allVerified=true,integrityFailure=false,firstPage=null,lastSnapshots=new Map();
  const finishFile=()=>{fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'c04-c05-bounded-result.json'),JSON.stringify(result,null,2)+'\n');};
  try{
    check(/^\d+$/.test(str(runId))&&typeof openAdminSession==='function','RUNNER_INPUT_INVALID');
    validateC04Pins(pins,proof);
    const memberRef=db.doc('tenants/'+C04C05.tenantId+'/users/'+C04C05.uid);
    const memberSnap=await bounded(memberRef.get(),15000,'EXACT_ADMIN_READ_TIMEOUT');
    check(memberSnap.exists,'EXACT_ADMIN_MEMBERSHIP_MISSING');memberHead=head(memberSnap);
    const member={...memberSnap.data(),id:C04C05.uid};
    const authUser=await bounded(auth.getUser(C04C05.uid),15000,'EXACT_ADMIN_AUTH_READ_TIMEOUT');
    result.actor=validateC04Actor(member,authUser);
    const marker='QA-C04-C05-'+runId+'-'+randomBytes(6).toString('hex');
    const markers={cxc:marker+'-GT-CXC',financing:marker+'-HN-FIN'};
    result.fixtureMarker=marker;
    fs.mkdirSync(outDir,{recursive:true});
    const onPlanned=record=>{
      for(const p of [...record.refs.created,...record.refs.changed])planned.set(p,record);
      result.lastAction={phase:'request_validated_before_send',kind:record.step.kind,commandType:record.command.commandType,commandSha256:sha(record.command),
        receipt:record.refs.receipt,audit:record.refs.audit,accountId:record.refs.accountId,movementId:record.refs.movementId||null};
    };
    async function newSession(label){
      const guard=createCommandGuard({db,pins,onPlanned,knownHeads});guards.push(guard);
      const session=await bounded(openAdminSession({member,label,installContextGuard:ctx=>guard.install(ctx)}),150000,'FRESH_SESSION_TIMEOUT');
      sessions.push(session);check(guard.evidence.installedBeforeNavigation,'CONTEXT_GUARD_NOT_INSTALLED');
      check(session.ctx===guard.context&&typeof session.page?.context==='function'&&session.page.context()===session.ctx,'SESSION_GUARD_CONTEXT_MISMATCH');
      session.page.setDefaultTimeout(10000);
      check(session.sessionBoundary?.newBrowserContext===true&&session.sessionBoundary?.authNullBeforeSignIn===true,'INDEPENDENT_SESSION_NOT_PROVEN');
      check(!sessions.slice(0,-1).some(s=>s.ctx===session.ctx),'BROWSER_CONTEXT_REUSED');
      result.sessions.push({label,newBrowserContext:true,authNullBeforeSignIn:true,mechanism:'existing_ci_custom_token_in_memory',ordinaryPasswordLoginProven:false,
        scope:await readScope(session.page,pins,member.role)});
      await openGlobal(session.page,pins,member.role);
      return {session,guard};
    }
    const first=await newSession('primary');firstPage=first.session.page;
    baseline=await scopedLedgerSnapshot(db);
    result.baseline={queryScope:'global_and_cinepolis_october_financial_movements_and_accounts',count:baseline.size,sha256:sha(ledgerFingerprint(baseline))};

    async function uiCommand(step,prepare,saveSelector){
      result.phase='prepare_'+step.kind;
      await readScope(firstPage,pins,member.role);
      await prepare();
      const armed=first.guard.arm({...step,role:member.role});
      const successText={
        'create-cxc':'Cuenta por cobrar registrada con ACK y lectura remota coincidente',
        'apply-cxc':'Cobro interno registrado con ACK y lectura protegida. Confirmación bancaria independiente.',
        'create-financing':'Financiamiento confirmado · flujo no operativo + CxP vinculada',
        'apply-cxp':'Devolución confirmada · CxP reducida'
      }[step.kind];
      const visibleAck=firstPage.waitForFunction(expected=>Array.from(document.querySelectorAll('#cx-toasts > div')).some(n=>n.getClientRects().length&&getComputedStyle(n).opacity!=='0'&&getComputedStyle(n).visibility!=='hidden'&&String(n.innerText||'').replace(/\s+/g,' ').trim()===expected),successText,{timeout:35000});
      visibleAck.catch(()=>{});
      let record;
      try{
        // Response observer is active before the click. No automatic click retry.
        const [observed]=await Promise.all([bounded(armed.observed,40000,'COMMAND_ACK_TIMEOUT'),firstPage.locator(saveSelector).click({timeout:10000})]);
        record=observed;result.fixturesStarted=true;allVerified=false;
        result.lastAction={...result.lastAction,phase:'response_observed',httpStatus:record.httpStatus,
          providerAck:record.body?.providerAck===true,providerWrites:Number.isSafeInteger(record.body?.providerWrites)?record.body.providerWrites:null,
          providerCode:/^[A-Z0-9_]{1,100}$/.test(str(record.body?.code))?record.body.code:null};
        validateC04Ack(record);
        lastSnapshots=await linkedSnapshots(db,planned.keys());
        validateCommittedRows(record,lastSnapshots);
        // Never adopt a changed earlier fixture as a new cleanup expectation.
        // Only this exact command's declared account update may change a prior head.
        validateC04CommandFootprint(record,lastSnapshots,knownHeads);
        for(const [p,v] of lastSnapshots)knownHeads.set(p,v.head);
        allVerified=true;records.push(record);
        result.lastAction.phase='durable_readback_verified';
        result.commands.push({kind:step.kind,commandType:record.command.commandType,commandSha256:sha(record.command),idempotencyKeySha256:sha(record.command.idempotencyKey),
          entityId:record.body.entityId,providerWrites:record.body.providerWrites,strictAck:true,serverReceiptAuditAndRows:true,sourceRefs:[record.refs.receipt,record.refs.audit]});
        const ackHandle=await visibleAck;await ackHandle.dispose();result.commands.at(-1).visibleAck=true;
        await firstPage.locator(saveSelector).waitFor({state:'detached',timeout:20000});
        await readScope(firstPage,pins,member.role);
        return record;
      }finally{
        if(armed.item.continued&&!record){allVerified=false;result.fixturesStarted=true;}
        armed.finish();
      }
    }
    async function replay(original){
      result.phase='replay_'+original.step.kind;
      await readScope(firstPage,pins,member.role);
      const before=await linkedSnapshots(db,planned.keys()),beforeLedger=await scopedLedgerSnapshot(db);
      const armed=first.guard.arm({replay:true,kind:'replay-'+original.step.kind,role:member.role,originalCommand:original.command,originalRefs:original.refs,originalEntityId:original.body.entityId});
      try{
        const [observed]=await Promise.all([bounded(armed.observed,40000,'REPLAY_ACK_TIMEOUT'),bounded(firstPage.evaluate(async ({command,uid})=>{
          const user=window.firebase.auth().currentUser;if(!user||user.uid!==uid)throw Error('C04_REPLAY_AUTH_MISSING');
          const token=await user.getIdToken();
          const response=await fetch('/v1/cxorbia/commands',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(command)});
          return {httpStatus:response.status};
        },{command:original.command,uid:C04C05.uid}),40000,'REPLAY_FETCH_TIMEOUT')]);
        validateC04Ack(observed);
        const after=await linkedSnapshots(db,planned.keys()),afterLedger=await scopedLedgerSnapshot(db);
        if(!equalHeads(headsOf(before),headsOf(after))||!isDeepStrictEqual(ledgerFingerprint(beforeLedger),ledgerFingerprint(afterLedger))){integrityFailure=true;throw Error('C04_REPLAY_DURABLE_DELTA');}
        result.replays.push({commandType:observed.command.commandType,entityId:observed.body.entityId,exactCommand:true,idempotentReplay:true,providerWrites:0,allLinkedDataAndUpdateTimesUnchanged:true,scopedLedgerUnchanged:true});
      }catch(error){integrityFailure=true;throw error;}finally{armed.finish();}
    }

    const cxc=await uiCommand({kind:'create-cxc',marker:markers.cxc},async()=>{
      await firstPage.locator('[data-cuenta="cxc"]').click({timeout:10000});
      await firstPage.locator('#ctCon').fill(markers.cxc);await firstPage.locator('#ctPais').selectOption('GT');
      await firstPage.locator('#ctCurrency').fill('Q');await firstPage.locator('#ctMonto').fill('1.00');
    },'#ctSave');
    const cxcBefore=lastSnapshots.get(cxc.refs.account).data;
    const collection=await uiCommand({kind:'apply-cxc',accountId:cxc.refs.accountId,amount:0.4,expectedVersion:versionOf(cxcBefore),before:cxcBefore},async()=>{
      await firstPage.locator('[data-cxc-apply="'+cxc.refs.accountId+'"]').click({timeout:10000});
      await firstPage.locator('#cxcApplyAmount').fill('0.40');
    },'#cxcApplySave');
    await replay(collection);
    const financing=await uiCommand({kind:'create-financing',marker:markers.financing},async()=>{
      await firstPage.locator('#addFin').click({timeout:10000});
      await firstPage.locator('#fnF').fill(markers.financing);await firstPage.locator('#fnC').fill(markers.financing);
      await firstPage.locator('#fnP').selectOption('HN');await firstPage.locator('#fnCurrency').fill('L');await firstPage.locator('#fnM').fill('2.00');
    },'#fnSave');
    await replay(financing);
    const financingBefore=lastSnapshots.get(financing.refs.account).data;
    const repayment=await uiCommand({kind:'apply-cxp',accountId:financing.refs.accountId,amount:0.5,expectedVersion:versionOf(financingBefore),before:financingBefore},async()=>{
      await firstPage.locator('[data-devfin="'+financing.refs.accountId+'"]').click({timeout:10000});
      await firstPage.locator('#dvM').fill('0.50');
    },'#dvOk');
    check(records.length===4&&planned.size===13&&result.replays.length===2,'EXPECTED_FOOTPRINT_NOT_PROVEN');
    const model={accounts:[
      {id:cxc.refs.accountId,kind:'cxc',marker:markers.cxc,...C04C05.cxc},
      {id:financing.refs.accountId,kind:'cxp',marker:markers.financing,...C04C05.financing}],movements:[
      {id:collection.refs.movementId,concept:'Cobro CxC · '+markers.cxc,country:'GT',currency:'Q',amount:0.4},
      {id:financing.refs.movementId,concept:markers.financing,country:'HN',currency:'L',amount:2},
      {id:repayment.refs.movementId,concept:'Abono CxP · '+markers.financing,country:'HN',currency:'L',amount:-0.5}]};
    result.primaryDom=await visibleFinanceRows(firstPage,model,baseline,'primary',outDir);
    result.phase='independent_session';
    const beforeSecond=await linkedSnapshots(db,planned.keys());
    const second=await newSession('independent');
    result.independentDom=await visibleFinanceRows(second.session.page,model,baseline,'independent',outDir);
    const afterSecond=await linkedSnapshots(db,planned.keys());
    check(equalHeads(headsOf(beforeSecond),headsOf(afterSecond)),'SECOND_SESSION_DURABLE_CHANGE');
    check(isDeepStrictEqual(result.primaryDom.accountRows,result.independentDom.accountRows)&&isDeepStrictEqual(result.primaryDom.movementRows,result.independentDom.movementRows),'INDEPENDENT_VISIBLE_ROWS_DIFFER');
    lastSnapshots=afterSecond;for(const [p,v] of lastSnapshots)knownHeads.set(p,v.head);
    const afterLedger=await scopedLedgerSnapshot(db),excluded=new Set(planned.keys());
    if(!isDeepStrictEqual(ledgerFingerprint(baseline),ledgerFingerprint(afterLedger,excluded))){integrityFailure=true;throw Error('C04_OTHER_SCOPED_RECORDS_CHANGED');}
    check(['Q','L'].every(cur=>cents(operationIncome(baseline,cur))===cents(operationIncome(afterLedger,cur))),'OPERATING_REVENUE_CHANGED');
    result.otherScopedRecords={unchanged:true,beforeSha256:sha(ledgerFingerprint(baseline)),afterSha256:sha(ledgerFingerprint(afterLedger,excluded)),count:baseline.size,noClaimAboutConcurrentExternalWriters:true};
    const memberAfter=await bounded(memberRef.get(),15000,'MEMBERSHIP_FINAL_READ_TIMEOUT');
    check(isDeepStrictEqual(memberHead,head(memberAfter)),'MEMBERSHIP_CHANGED_DURING_CASE');
    check(guards.every(g=>g.evidence.unexpectedMutationBlocked===0&&g.evidence.validationFailures.length===0),'UNEXPECTED_CASE_COMMANDS');
    check(first.guard.evidence.commandsIssued===4&&first.guard.evidence.replaysIssued===2&&guards[1].evidence.commandsIssued===0&&guards[1].evidence.replaysIssued===0,'ISSUED_COMMAND_COUNT_MISMATCH');
    result.linkedDocuments=[...knownHeads].map(([ref,h])=>({collection:ref.split('/')[2],id:h.id,sha256:h.hash,updateTime:h.updateTime}));
    result.writes.financeProvider=result.commands.reduce((n,r)=>n+r.providerWrites,0);
    result.decision='PASS_C04_C05_BOUNDED_FINANCE_AWAITING_CLEANUP';
    result.phase='verified_awaiting_cleanup';
  }catch(error){
    result.error=safeError(error);result.errorType=['TimeoutError','AssertionError','Error'].includes(error?.name)?error.name:'OTHER';
    if(firstPage){
      result.failureUi=await bounded(firstPage.evaluate(()=>({
        globalSelected:document.querySelector('[data-scope="global"]')?.classList.contains('btn-pr')===true,
        cxcCreateDialog:!!document.querySelector('#ctSave'),cxcApplyDialog:!!document.querySelector('#cxcApplySave'),
        financingDialog:!!document.querySelector('#fnSave'),repaymentDialog:!!document.querySelector('#dvOk'),
        role:window.CX?.backendAuth?.context?.()?.role||null,projectId:window.CX?.data?.currentProjectId||null,periodId:window.CX?.data?.currentPeriodId||null
      })),10000,'FAILURE_UI_TIMEOUT').catch(()=>null);
      try{await firstPage.locator('#view').screenshot({path:path.join(outDir,'c04-failure.png'),timeout:10000});result.failureScreenshot='c04-failure.png';}
      catch(_){result.failureScreenshotError='C04_SCREENSHOT_UNAVAILABLE';}
    }
  }finally{
    result.guards=guards.map(g=>({...g.evidence}));
    // No cleanup on replay deltas, unaccounted side effects, or unverified commits.
    if(planned.size&&allVerified&&!integrityFailure&&knownHeads.size===planned.size){
      try{result.cleanup=await c04ConditionalCleanup(db,knownHeads);result.writes.cleanupDeletes=result.cleanup.count;}
      catch(error){result.cleanup={decision:'HOLD_CLEANUP_PRECONDITION_OR_COMMIT_UNCERTAIN',error:safeError(error),blindDeletes:false};}
    }else if(planned.size){
      result.cleanup={decision:'HOLD_PRESERVE_DIAGNOSTIC_DOCUMENTS',reason:integrityFailure?'replay_or_unexpected_delta':'commit_not_fully_verified',blindDeletes:false,knownCandidateIds:[...planned.keys()]};
    }else result.cleanup={decision:'NO_FIXTURES_PLANNED',count:0,allAbsent:true,blindDeletes:false};
    if(result.decision==='PASS_C04_C05_BOUNDED_FINANCE_AWAITING_CLEANUP'&&result.cleanup.decision==='PASS_EXACT_CONDITIONAL_CLEANUP'){
      try{
        const afterCleanup=await scopedLedgerSnapshot(db);
        check(isDeepStrictEqual(ledgerFingerprint(baseline),ledgerFingerprint(afterCleanup)),'POST_CLEANUP_LEDGER_DIFFERS');
        result.cleanup.otherScopedRecordsUnchanged=true;
        result.decision='PASS_C04_C05_BOUNDED_FINANCE';
      }catch(error){result.decision='HOLD_C04_C05_BOUNDED_FINANCE';result.error=safeError(error);}
    }else result.decision='HOLD_C04_C05_BOUNDED_FINANCE';
    result.contextClose=[];
    const closedContexts=new Set();
    // The mutation guard remains installed until each context has actually closed.
    for(let i=0;i<guards.length;i++){
      const context=guards[i].context;
      if(!context){result.contextClose.push({session:i,closed:false,error:'C04_CONTEXT_NOT_RETURNED'});continue;}
      if(closedContexts.has(context)){result.contextClose.push({session:i,closed:true,duplicateContext:true});continue;}
      try{await bounded(context.close(),10000,'CONTEXT_CLOSE_TIMEOUT');closedContexts.add(context);result.contextClose.push({session:i,closed:true});}
      catch(error){result.contextClose.push({session:i,closed:false,error:safeError(error)});}
    }
    for(const guard of guards)if(closedContexts.has(guard.context))await guard.stop().catch(()=>{});
    // Include any blocked request observed during cleanup or context closure.
    result.guards=guards.map(g=>({...g.evidence}));
    if(result.guards.some(g=>g.unexpectedMutationBlocked>0||g.validationFailures.length>0)){
      result.decision='HOLD_C04_C05_BOUNDED_FINANCE';result.error||='C04_UNEXPECTED_CASE_COMMANDS';
    }
    result.sessionsClosed=result.contextClose.every(x=>x.closed===true);
    if(!result.sessionsClosed){result.decision='HOLD_C04_C05_BOUNDED_FINANCE';result.error||='C04_CONTEXT_CLOSE_NOT_PROVEN';}
    finishFile();
  }
  return result;
}

return {C04C05,runC04C05BoundedFinance};
})():null;

const r7SafeCode=(error,fallback)=>/^(?:D07|C04|R7)_[A-Z0-9_]{1,120}$/.test(String(error?.message||''))?error.message:fallback;
async function r7Bounded(operation,ms,code){
  let timer;try{return await Promise.race([operation,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('R7_'+code)),ms);})]);}
  finally{clearTimeout(timer);}
}

async function r7ExactAdmin(){
  const uid=sessionPackage.actor.uid,user=await r7Bounded(auth.getUser(uid),15000,'ADMIN_IDENTITY_READ_TIMEOUT'),claims=user.customClaims||{};
  assert.equal(user.uid,uid);assert.equal(user.disabled,false);assert.equal(claims.role,sessionPackage.actor.role);
  assert.equal(claims.authNamespace,'staff');assert.equal(claims.tenantId,'tya');
  assert.ok(Array.isArray(claims.projectIds)&&claims.projectIds.includes('cinepolis'));
  const snap=await r7Bounded(tenant.collection('users').doc(uid).get(),15000,'ADMIN_MEMBERSHIP_READ_TIMEOUT');
  assert.equal(snap.exists,true,'R7_ADMIN_MEMBERSHIP_REQUIRED');const m=snap.data()||{};
  assert.equal(m.active,true);assert.notEqual(m.status,'inactive');assert.equal(m.tenantId,'tya');
  assert.equal(m.role,claims.role);assert.equal(m.authNamespace,'staff');
  assert.ok(Array.isArray(m.projectIds)&&m.projectIds.includes('cinepolis'));
  return {id:uid,role:claims.role};
}

async function openR7D07Session(m,role,ownedBrowser,evidence){
  check(R7_MODE&&['admin','shopper'].includes(role),'SESSION_MODE_OR_ROLE_UNAUTHORIZED');
  if(role==='admin')check(m.id===sessionPackage.actor.uid,'ADMIN_UID_MISMATCH');
  else check(m.shopperId===D07.shopperId&&m.uidFingerprint===D07.shopperUidFingerprint&&uidFingerprint(m.id)===D07.shopperUidFingerprint,'SHOPPER_UID_MISMATCH');
  const ctx=await ownedBrowser.newContext({viewport:{width:1400,height:940}});
  const guard=await installD07ReadOnlyContextGuardR7(ctx);evidence.contexts.push({ctx,guard,role});
  const page=await ctx.newPage();
  await page.goto(url+'&r7d07pre='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:90000});
  const empty=await bounded(page.evaluate(async()=>{
    const a=window.firebase.auth();let unsub=null,timer;
    try{return await new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('AUTH_INITIAL_STATE_TIMEOUT')),30000);unsub=a.onAuthStateChanged(u=>resolve(u===null),reject);});}
    finally{clearTimeout(timer);if(unsub)unsub();}
  }),35000,'INITIAL_AUTH_STATE_TIMEOUT');check(empty===true,'NEW_CONTEXT_NOT_EMPTY');
  const token=await bounded(auth.createCustomToken(m.id),15000,'EXISTING_IDENTITY_TOKEN_TIMEOUT');
  await bounded(page.evaluate(async t=>{const a=window.firebase.auth();await a.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await a.signInWithCustomToken(t);},token),45000,'EXISTING_IDENTITY_SIGNIN_TIMEOUT');
  await page.goto('about:blank');
  await page.goto(url+'&r7d07signed='+Date.now(),{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(id=>window.firebase?.auth?.().currentUser?.uid===id,m.id,{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await bounded(page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();}),45000,'APPLICATION_AUTH_TIMEOUT');
  await page.waitForFunction(input=>{
    const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},role=String(c.role||'').toLowerCase();
    return c.authenticated===true&&window.firebase?.auth?.().currentUser?.uid===input.uid&&c.tenantId==='tya'&&
      c.authNamespace===(input.role==='admin'?'staff':'shopper')&&
      (input.role==='admin'?['admin','super'].includes(role):role==='shopper'&&c.shopperId===input.shopperId&&Array.isArray(c.projectIds)&&c.projectIds.includes('cinepolis'))&&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===input.hr;
  },{uid:m.id,role,shopperId:role==='shopper'?D07.shopperId:null,hr:HR},{timeout:45000});
  const observed=await bounded(page.evaluate(()=>{const c=window.CX.backendAuth.context();return {uid:window.firebase.auth().currentUser.uid,role:c.role,tenantId:c.tenantId,authNamespace:c.authNamespace,shopperId:c.shopperId||null,revision:String(window.CX.data.previewMeta.sourceRevision||'')};}),10000,'AUTH_SCOPE_READ_TIMEOUT');
  check(observed.uid===m.id&&observed.tenantId==='tya'&&observed.revision===HR,'AUTH_OR_HR_REVISION_MISMATCH');
  if(evidence.hrRevisionLive)check(evidence.hrRevisionLive===observed.revision,'TWO_ROLE_HR_REVISION_MISMATCH');else evidence.hrRevisionLive=observed.revision;
  return {ctx,page,guard,sessionBoundary:{newBrowserContext:true,authNullBeforeSignIn:true,role:observed.role,tenantId:observed.tenantId,
    authNamespace:observed.authNamespace,uidFingerprint:uidFingerprint(m.id),shopperId:role==='shopper'?D07.shopperId:null,
    applicationAuthAndHrGatePassed:true,hrRevision:observed.revision,mechanism:'existing_ci_custom_token_in_memory',ordinaryPasswordLoginProven:false,tokenLogged:false}};
}

async function runR7D07(result){
  Object.assign(result,{decision:'HOLD_D07_REAL_PDF_READ_ONLY_CLAUSE',executed:true,fullTaskClosed:false,stage:'IDENTITY',
    bindingDiagnostics:[],sessions:{},cleanup:{resourceCleanupPerformed:false,browserClosed:false},contextGuardsPass:false,
    writes:{authAccounts:0,claims:0,membership:0,resource:0,storage:0,hr:0,finance:0,production:0}});
  const evidence={contexts:[]};let ownedBrowser=null;
  const outDir=path.join(OUT,'d07');fs.mkdirSync(outDir,{recursive:true});
  const checkpoint=stage=>{result.stage=stage;record();};
  try{
    const admin=await r7ExactAdmin(),shopper=await resolveD07ExistingShopper({tenant,auth});
    result.actor={admin:{uidFingerprint:uidFingerprint(admin.id),exactConfiguredUidVerified:true},
      shopper:{uidFingerprint:shopper.uidFingerprint,shopperId:shopper.shopperId,existingIdentityVerified:true},accountCreated:false,claimsChanged:false};
    checkpoint('LAUNCH_D07_BROWSER');ownedBrowser=await chromium.launch({headless:true,timeout:45000});
    checkpoint('AUTH_ADMIN');const a=await openR7D07Session(admin,'admin',ownedBrowser,evidence);result.sessions.admin=a.sessionBoundary;
    await selectD07UiScope(a.page);
    checkpoint('AUTH_SHOPPER');const s=await openR7D07Session(shopper,'shopper',ownedBrowser,evidence);result.sessions.shopper=s.sessionBoundary;
    check(a.ctx!==s.ctx,'ROLE_CONTEXT_REUSED');result.sessions.distinctContexts=true;await selectD07UiScope(s.page);
    checkpoint('BIND_BOTH_ROLE_CATALOGS');
    const binding=await bindD07BeforeReadsR7({adminPage:a.page,shopperPage:s.page,adminUid:admin.id,shopperUid:shopper.id,db,preflight:sessionPreflight,
      onDiagnostic:safe=>{result.bindingDiagnostics.push(safe);record();}});result.binding=binding.safe;
    for(const entry of [{page:a.page,role:'admin'},{page:s.page,role:'shopper'}]){
      const button=entry.page.locator('button[data-doc="'+binding.id+'"]');
      await button.waitFor({state:'visible',timeout:15000});check(await button.count()===1,'ROLE_VISIBLE_RESOURCE_NOT_UNIQUE');
      if(entry.role==='shopper'){check(await entry.page.locator('#docUp').count()===0,'SHOPPER_CREATE_CONTROL_VISIBLE');check(await entry.page.locator('[data-editd],[data-deld]').count()===0,'SHOPPER_MUTATION_CONTROL_VISIBLE');}
    }
    result.binding.bothRoleOpenButtonsVisible=true;
    for(const entry of evidence.contexts){
      check(entry.guard.evidence.blockedWriteRequests===0&&entry.guard.evidence.blockedUnexpectedStorageReads===0&&entry.guard.evidence.storageGetsOutsideRoleGuard===0,'UNEXPECTED_REQUEST_BEFORE_BOUND_READ');entry.guard.setBinding(binding);
    }
    checkpoint('ADMIN_PDF');const adminRead=await readD07RolePdfR7({page:a.page,role:'admin',uid:admin.id,binding,outDir});result.admin=adminRead;record();
    checkpoint('SHOPPER_PDF');const shopperRead=await readD07RolePdfR7({page:s.page,role:'shopper',uid:shopper.id,binding,outDir});result.shopper=shopperRead;record();
    checkpoint('FINAL_METADATA_READ');Object.assign(result,await finishD07ReadOnly({binding,admin:adminRead,shopper:shopperRead}));
  }catch(error){
    if(error?.d07BindingDiagnostic)result.bindingDiagnostics.push(error.d07BindingDiagnostic);
    result.failureStage=result.stage;result.decision='HOLD_D07_REAL_PDF_READ_ONLY_CLAUSE';result.error=r7SafeCode(error,'R7_D07_AUTH_UI_OR_PROVIDER_FAILURE');
  }finally{
    if(ownedBrowser){
      try{await r7Bounded(ownedBrowser.close(),20000,'D07_BROWSER_CLOSE_TIMEOUT');result.cleanup.browserClosed=true;}
      catch(error){result.cleanup.browserClosed=false;result.cleanup.error=r7SafeCode(error,'R7_D07_BROWSER_CLOSE_FAILED');result.decision='HOLD_D07_BROWSER_CLEANUP';}
    }else result.cleanup.browserClosed=true;
    result.contextGuards=evidence.contexts.map(x=>({role:x.role,...x.guard.evidence}));
    result.contextGuardsPass=result.contextGuards.length===2&&result.contextGuards.every(x=>x.installedBeforeNavigation===true&&x.bindingSet===true&&x.blockedWriteRequests===0&&x.blockedUnexpectedStorageReads===0&&x.storageGetsOutsideRoleGuard===0);
    if(!result.contextGuardsPass&&result.decision==='PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE')result.decision='HOLD_D07_NETWORK_SCOPE_UNPROVEN';
    fs.writeFileSync(path.join(outDir,'result.json'),JSON.stringify(result,null,2)+'\n');record();
  }
  return result;
}

async function selectR7FinanceScope(page){
  const initial=await r7Bounded(page.evaluate(()=>({project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.currentPeriodId||'')})),10000,'FINANCE_INITIAL_SCOPE_TIMEOUT');
  if(initial.project!=='cinepolis'){
    await page.locator('#projSel').waitFor({state:'visible',timeout:15000});assert.equal(await page.locator('#projSel option[value="cinepolis"]').count(),1);
    await page.locator('#projSel').selectOption('cinepolis',{timeout:15000});
  }
  await page.waitForFunction(()=>window.CX?.data?.currentProjectId==='cinepolis',null,{timeout:30000});
  const period=await r7Bounded(page.evaluate(()=>String(window.CX?.data?.currentPeriodId||'')),10000,'FINANCE_PERIOD_READ_TIMEOUT');
  if(period!=='cinepolis-2026-10'){
    await page.locator('#periodSel').waitFor({state:'visible',timeout:15000});assert.equal(await page.locator('#periodSel option[value="cinepolis-2026-10"]').count(),1);
    await page.locator('#periodSel').selectOption('cinepolis-2026-10',{timeout:15000});
  }
  await page.waitForFunction(()=>window.CX?.data?.currentProjectId==='cinepolis'&&window.CX?.data?.currentPeriodId==='cinepolis-2026-10',null,{timeout:30000});
}

async function runR7Finance(){
  const outDir=path.join(OUT,'c04-c05');fs.mkdirSync(outDir,{recursive:true});
  const envelope={decision:'HOLD_C04_C05_BOUNDED_FINANCE',executed:false,fullTaskClosed:false,browserClosed:false};
  let ownedBrowser=null;
  try{
    assert.equal(res.d07.cleanup?.browserClosed,true,'R7_D07_BROWSER_ISOLATION_NOT_PROVEN');
    ownedBrowser=await chromium.launch({headless:true,timeout:45000});
    async function openAdminSession({member,label,installContextGuard}){
      assert.equal(member.id,sessionPackage.actor.uid);assert.equal(member.tenantId,'tya');assert.equal(member.authNamespace,'staff');assert.ok(['admin','super'].includes(member.role));
      const ctx=await ownedBrowser.newContext({viewport:{width:1400,height:940}});
      await installContextGuard(ctx);const page=await ctx.newPage();page.setDefaultTimeout(10000);
      await page.goto(url+'&r7financepre='+encodeURIComponent(label),{waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase.apps?.length>0,null,{timeout:45000});
      const empty=await r7Bounded(page.evaluate(async()=>{
        const a=window.firebase.auth();let unsubscribe=null,timer;
        try{return await new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('AUTH_INITIAL_STATE_TIMEOUT')),30000);unsubscribe=a.onAuthStateChanged(user=>resolve(user===null),reject);});}
        finally{clearTimeout(timer);if(unsubscribe)unsubscribe();}
      }),35000,'FINANCE_INITIAL_AUTH_TIMEOUT');assert.equal(empty,true,'R7_FINANCE_CONTEXT_NOT_EMPTY');
      const token=await r7Bounded(auth.createCustomToken(member.id),15000,'FINANCE_EXISTING_TOKEN_TIMEOUT');
      await r7Bounded(page.evaluate(async value=>{const a=window.firebase.auth();await a.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);await a.signInWithCustomToken(value);},token),45000,'FINANCE_SIGNIN_TIMEOUT');
      await page.goto('about:blank');
      await page.goto(url+'&r7financesigned='+encodeURIComponent(label),{waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForFunction(id=>window.firebase?.auth?.().currentUser?.uid===id,member.id,{timeout:45000});
      await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:45000});
      await r7Bounded(page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();}),45000,'FINANCE_APP_AUTH_TIMEOUT');
      await page.waitForFunction(input=>{
        const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
        return c.authenticated===true&&window.firebase?.auth?.().currentUser?.uid===input.uid&&c.role===input.role&&c.authNamespace==='staff'&&c.tenantId==='tya'&&
          window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===input.hr;
      },{uid:member.id,role:member.role,hr:HR},{timeout:45000});
      await selectR7FinanceScope(page);
      return {ctx,page,sessionBoundary:{newBrowserContext:true,authNullBeforeSignIn:true,role:member.role,tenantId:'tya',authNamespace:'staff',
        uidFingerprint:uidFingerprint(member.id),hrRevision:HR,applicationAuthAndHrGatePassed:true,mechanism:'existing_ci_custom_token_in_memory',ordinaryPasswordLoginProven:false,tokenLogged:false}};
    }
    envelope.executed=true;
    Object.assign(envelope,await R7Finance.runC04C05BoundedFinance({db,auth,openAdminSession,pins:sessionPackage.materialization,proof:sessionPreflight,runId:RUN,outDir}));
  }catch(error){envelope.decision='HOLD_C04_C05_BOUNDED_FINANCE';envelope.error=r7SafeCode(error,'R7_FINANCE_CALLBACK_OR_BROWSER_FAILURE');}
  finally{
    if(ownedBrowser){try{await r7Bounded(ownedBrowser.close(),20000,'FINANCE_BROWSER_CLOSE_TIMEOUT');envelope.browserClosed=true;}
      catch(error){envelope.browserClosed=false;envelope.decision='HOLD_C04_C05_BOUNDED_FINANCE';envelope.browserCloseError=r7SafeCode(error,'R7_FINANCE_BROWSER_CLOSE_FAILED');}}
    else envelope.browserClosed=true;
    fs.writeFileSync(path.join(outDir,'r7-finance-envelope.json'),JSON.stringify(envelope,null,2)+'\n');
  }
  return envelope;
}

async function runR7Bounded(){
  res.version='cxorbia.i3.r7.d07-c04-c05.bounded.v1';res.mode='R7_D07_C04_C05_BOUNDED';
  res.scope={tenant:'tya',project:'cinepolis',period:'cinepolis-2026-10',globalPeriod:'2026-10',taskIds:['D07','C04','C05'],testScopeOnly:true};
  res.c02={executed:false,commands:0,replayReconciliation:false};res.d04={executed:false,fixtureSeeds:0,contentEdits:0,fixtureDeletes:0};res.e04={executed:false};
  res.d07={};res.c04c05={decision:'NOT_STARTED',executed:false};res.writes={authAccountsIssued:0,claimsIssued:0,membershipIssued:0,hrIssued:0,resourceIssued:0,storageIssued:0,productionIssued:0};
  res.decision='HOLD_R7_D07_C04_C05_BOUNDED';res.fullTasksClosed=false;record();
  await runR7D07(res.d07);
  // A functional D07 HOLD does not suppress the independent finance evidence.
  // Closure of its browser is required before creating the finance browser.
  if(res.d07.cleanup?.browserClosed===true)res.c04c05=await runR7Finance();
  else res.c04c05={decision:'HOLD_C04_C05_BROWSER_ISOLATION_NOT_PROVEN',executed:false,fullTaskClosed:false};
  const passed=res.d07.decision==='PASS_D07_ADMIN_SHOPPER_REAL_PDF_READ_ONLY_CLAUSE'&&res.d07.cleanup.browserClosed===true&&res.d07.contextGuardsPass===true&&
    res.c04c05.decision==='PASS_C04_C05_BOUNDED_FINANCE'&&res.c04c05.sessionsClosed===true&&res.c04c05.browserClosed===true;
  res.decision=passed?'PASS_R7_D07_C04_C05_BOUNDED':'HOLD_R7_D07_C04_C05_BOUNDED';
  res.cleanup={d07BrowserClosed:res.d07.cleanup?.browserClosed===true,financeBrowserClosed:res.c04c05.browserClosed===true,finance:res.c04c05.cleanup||null};
  record();console.log(JSON.stringify({decision:res.decision,mode:res.mode,d07:res.d07.decision,c04c05:res.c04c05.decision,cleanup:res.cleanup,production:false}));
  if(!passed)process.exitCode=1;
}


if(R7_MODE){
 await runR7Bounded();
}else if(D07_READ_ONLY_MODE){
 await runD07ReadOnly();
}else{
try{
 browser=await chromium.launch({headless:true});
 if(SESSION_PROOF_MODE){
  const exactAdmin=await exactSessionProofAdmin();
  const before=await readC02Durable();
  res.c02={durable:{before},independentApplicationSession:false,fullTaskClosed:false};
  const first=await sign(exactAdmin,'admin');
  res.sessions={first:first.sessionBoundary,independent:null};
  res.c02.baseline=await readC02(first.page,'baseline');
  const {fixture,proof}=await d04PrepareSessionFixture(first.page);
  res.d04=proof;
  const second=await sign(exactAdmin,'admin');
  assert.notEqual(second.ctx,first.ctx,'AUTH_FAILURE:CONTEXT_REUSED');
  assert.notEqual(second.page.context(),first.page.context(),'AUTH_FAILURE:PAGE_CONTEXT_REUSED');
  res.sessions.independent=second.sessionBoundary;
  res.sessions.distinctContexts=true;
  res.c02.independent=await readC02(second.page,'independent');
  res.d04.independentSession=await d04ReadEditorSession(second.page,fixture,'independent');
  await d04VerifyPostSession(fixture);
  const after=await readC02Durable();
  assert.deepEqual(after,before,'C02_DURABLE_DOCS_CHANGED');
  res.c02.durable={before,after,financialMatchFields:24,unchanged:true};
  res.writes.finance=0;
  res.c02.reconcileClicks=0;res.c02.paymentClicks=0;
  res.c02.independentApplicationSession=true;
  res.c02.originalClientAckResponseObserved=false;
  res.c02.negativeSourceProofPreserved='RUN1954_C01_03_C01_04_C01_07';
  res.d04.independentApplicationSession=true;
  res.d04.priorPassesPreserved=['RUN1788_QUESTION_EDIT','RUN1797_NAME_EDIT'];
  res.d04.humanAcceptance='PENDING';res.d04.fullTaskClosed=false;
  res.e04={retested:false,priorRun1797Preserved:true};
  res.d07Preflight=await readD07OptionsFromLoadedCatalog(second.page);
  res.decision='PASS_C02_D04_INDEPENDENT_SESSIONS';
 }else{

 const admin=await sign(await member('admin'),'admin');
 const page=admin.page;
 const current=await evaluatePage(page,()=>({project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.period?.()?.id||'')}));
 assert.equal(current.project,'cinepolis');
 if(!current.period)throw Error('MAPPING_FAILURE:CERT_SCOPE_PERIOD');
 const certId='qa-i3-d04-'+RUN;
 const rid='certbank-cinepolis-'+current.period+'-'+certId;
 res.scope.period=current.period;
 qaRef=tenant.collection('resources').doc(rid);
 if((await qaRef.get()).exists){qaRef=null;throw Error('PERSISTENCE_FAILURE:QA_COLLISION');}
 const allBefore=(await tenant.collection('resources').where('projectId','==','cinepolis').where('status','==','active').get()).docs
  .filter(d=>d.data()?.resourceType==='certification_bank')
  .map(d=>({id:d.id,version:d.data().version,revision:d.data().bank?.contentRevision})).sort((a,b)=>a.id.localeCompare(b.id));
 const questions=Array.from({length:15},(_,i)=>({q:'Pregunta QA '+(i+1),ops:['Primera','Segunda','Tercera','Cuarta'],correcta:'Primera',exp:'Explicación QA',fuente:'[Página 1]'}));
 const seed=await evaluatePage(page,async arg=>{
  await window.CX.backendResources.load({projectId:'cinepolis',periodId:arg.period});
  const reply=await window.CX.certStore.save(arg.period,{certificationId:arg.certId,certificationName:'QA D04 '+arg.run,preguntas:arg.questions,gate:80,estado:'pending_review',contentRevision:'qa-'+arg.run,generadoPorUid:'qa-fixture-not-user',documentSource:{name:'Fixture QA',source_sha256:'a'.repeat(64),extraction_quality:{pageCount:1,sufficient:true}}},arg.certId);
  return{ack:reply?.providerAck===true,committed:reply?.committed===true,resourceId:reply?.item?.id,version:reply?.item?.version};
 },{period:current.period,certId,run:RUN,questions});
 if(!seed.ack||!seed.committed||seed.resourceId!==rid||seed.version!==1)throw Error('PERSISTENCE_FAILURE:QA_SEED_ACK');
 if((await qaRef.get()).data()?.version!==1)throw Error('PERSISTENCE_FAILURE:QA_SEED_READBACK');
 await evaluatePage(page,id=>{window.CX_CERT_SELECTED_ID=id;window.CX.router.nav('cert',{history:false});},certId);
 await page.locator('#certReviewEdit').waitFor({state:'visible',timeout:30000});
 await page.locator('#certReviewEdit').click();
 const newName='QA D04 Certificación Revisada '+RUN;
  await page.locator('#certReviewName').waitFor({state:'visible',timeout:12000});
  await page.locator('#certReviewName').fill(newName);
 await page.locator('#certReviewPreview').click();
 const diff=await page.locator('#certReviewDiff').innerText();
  if(!diff.includes('Nombre actualizado: '+newName)||!diff.includes('pendiente de publicación'))throw Error('FUNCTIONAL_DEFECT:D04_NAME_PREVIEW_DIFF');
 await page.locator('#certReviewSave').click();
 await page.waitForFunction(id=>(window.CX?.backendResources?.items||[]).some(x=>x.id===id&&x.version===2),rid,{timeout:45000});
 const stored=(await qaRef.get()).data()||{};
 if(stored.version!==2||stored.bank?.preguntas?.length!==15||stored.bank?.preguntas?.[0]?.q!==questions[0].q
    ||stored.bank?.certificationName!==newName||stored.n!==newName||stored.bank?.certificationId!==certId
    ||stored.bank?.estado!=='pending_review'||stored.bank?.reviewHistory?.length!==1||stored.bank?.reviewHistory?.[0]?.toVersion!==2
    ||stored.bank?.reviewHistory?.[0]?.changes?.length!==0
    ||stored.bank?.reviewHistory?.[0]?.nameChange?.before!=='QA D04 '+RUN||stored.bank?.reviewHistory?.[0]?.nameChange?.after!==newName)
    throw Error('PERSISTENCE_FAILURE:D04_NAME_CAS_ACK_READBACK');
 await page.reload({waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(input=>{
  const context=window.CX?.backendAuth?.context?.()||{},gate=window.CX_C6_HR_AUTHORITY_GATE||{};
  return context.authenticated===true&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true
    &&gate.ready===true&&gate.blocked!==true
    &&String(window.CX?.data?.previewMeta?.sourceRevision||'')===input.revision
    &&String(window.CX?.data?.currentProjectId||'')===input.project
    &&String(window.CX?.data?.period?.()?.id||'')===input.period
    &&typeof window.CX?.backendResources?.load==='function';
 },{revision:res.hrRevisionLive,project:'cinepolis',period:current.period},{timeout:90000});
 const reloaded=await evaluatePage(page,async a=>{
  let loadError='';
  try{await window.CX.backendResources.load({projectId:'cinepolis',periodId:a.period});}catch(e){loadError=String(e?.message||e).slice(0,120);}
  const b=window.CX.certStore.bank(a.period,a.id);
  return{version:b?.__resourceVersion??null,q:b?.preguntas?.[0]?.q??null,name:b?.certificationName??null,certId:b?.certificationId??null,estado:b?.estado??null,history:b?.reviewHistory?.length??null,foundInResources:(window.CX.backendResources?.items||[]).some(r=>r.id===a.resourceId),loadError,project:String(window.CX?.data?.currentProjectId||''),period:String(window.CX?.data?.period?.()?.id||'')};
 },{period:current.period,id:certId,resourceId:rid});
 res.d04.reloadReadback={version:reloaded.version,nameMatched:reloaded.name===newName,questionsUnchanged:reloaded.q===questions[0].q,certIdMatched:reloaded.certId===certId,history:reloaded.history,foundInResources:reloaded.foundInResources,providerLoadError:reloaded.loadError,projectMatched:reloaded.project==='cinepolis',periodMatched:reloaded.period===current.period};
 if(reloaded.version!==2||reloaded.name!==newName||reloaded.q!==questions[0].q||reloaded.certId!==certId||reloaded.estado!=='pending_review'||reloaded.history!==1)
  throw Error('PERSISTENCE_FAILURE:D04_NAME_RELOAD:'+JSON.stringify(res.d04.reloadReadback));
 const allAfter=(await tenant.collection('resources').where('projectId','==','cinepolis').where('status','==','active').get()).docs
  .filter(d=>d.id!==rid&&d.data()?.resourceType==='certification_bank')
  .map(d=>({id:d.id,version:d.data().version,revision:d.data().bank?.contentRevision})).sort((a,b)=>a.id.localeCompare(b.id));
 if(JSON.stringify(allBefore)!==JSON.stringify(allAfter))throw Error('PERSISTENCE_FAILURE:NON_QA_BANK_CHANGED');
 await evaluatePage(page,()=>window.CX.router.nav('cert',{history:false}));
  await page.locator('#certIA').click();
  await page.locator('.cx-ov:visible #ciAiName').waitFor({state:'visible',timeout:12000});
  const editableAiName=await page.locator('.cx-ov:visible #ciAiName').count()===1;
  if(!editableAiName)throw Error('FUNCTIONAL_DEFECT:D04_GENERATION_NAME_FIELD_MISSING');
  res.d04={...res.d04,decision:'PASS_D04_PENDING_NAME_EDIT_PROVIDER_ACK_VERSION_HISTORY_RELOAD',versionBefore:1,versionAfter:2,questions:15,nameBefore:'QA D04 '+RUN,nameAfter:newName,oldBanksUnchanged:true,autoPublished:false,editableAiName,stableId:true,qaFixtureOnly:true};
 await admin.ctx.close();
 const client=await sign(await member('client'),'client');
 await client.page.evaluate(()=>window.CX.router.nav('cli_insights',{history:false}));
 await client.page.waitForFunction(()=>String(window.CX?.session?.view||'')==='cli_insights',null,{timeout:30000});
 await client.page.waitForTimeout(500);
 const visual=await client.page.evaluate(()=>{const txt=String(document.querySelector('#view')?.innerText||''),p=window.CX?.data?.period?.()||{};
  return{route:String(window.CX?.session?.view||''),benchmarkStatus:String(p.benchmarkSource?.status||''),revision:String(p.benchmarkSource?.sourceRevision||''),section:txt.includes('Benchmark vs industria'),sourceMissing:txt.includes('Referencia sectorial pendiente'),noInvented:txt.includes('No se emiten comparaciones ni juicios de desempeño.'),visible:!!document.querySelector('#view')?.getBoundingClientRect()?.height};});
 if(visual.route!=='cli_insights'||!visual.section||!visual.visible)throw Error('VISUAL_DEFECT:F12_CLIENT_ROUTE');
 if(visual.benchmarkStatus!=='verified'&&(!visual.sourceMissing||!visual.noInvented))throw Error('FUNCTIONAL_DEFECT:F12_UNVERIFIED_BENCHMARK_SHOWN');
 if(visual.benchmarkStatus==='verified'&&!visual.revision)throw Error('SOURCE_FAILURE:F12_BENCHMARK_NO_REVISION');
 res.e04={decision:'PASS_CLIENT_F12_SOURCE_AWARE_DOM',sourceStatus:visual.benchmarkStatus||'absent',sourceAbsentWarningShown:visual.sourceMissing,noInventedComparison:visual.noInvented,humanApproval:'PENDING'};
 await client.ctx.close();
 res.decision='PASS_D04_E04_CONNECTED_DEV_QA_NO_HUMAN_APPROVAL';
 }
}catch(e){
 res.error={classification:String(e?.message||e).split(':')[0],detail:String(e?.message||e).slice(0,820)};
 if(SESSION_PROOF_MODE&&browser){
  res.failureUi=[];
  for(const page of browser.contexts().flatMap(context=>context.pages()).slice(0,2)){
   try{
    const visible=await evaluatePage(page,rid=>{
     const item=(window.CX?.backendResources?.items||[]).find(row=>row.id===rid);
     const observation=window.__cxI3D04ToastObservation;observation?.stop?.();
     return {
      toastObservation:observation?{startedAt:observation.startedAt,events:observation.events}:null,
      toasts:[...document.querySelectorAll('#cx-toasts .toast')].map(el=>String(el.innerText||'').slice(0,240)),
      editorPresent:!!document.querySelector('#certReviewQuestions'),
      savePresent:!!document.querySelector('#certReviewSave'),
      saveDisabled:document.querySelector('#certReviewSave')?.disabled??null,
      loadedQaBank:item?{id:item.id,version:item.version,estado:item.bank?.estado,
        firstQuestion:item.bank?.preguntas?.[0],firstQuestionKeys:Object.keys(item.bank?.preguntas?.[0]||{}),
        historyEntries:item.bank?.reviewHistory?.length||0}:null
     };
    },res.d04Attempt?.bankId||'');
    const screenshot='session-failure-'+res.failureUi.length+'.png';
    const entry={...visible,screenshot};res.failureUi.push(entry);
    try{await page.screenshot({path:OUT+'/'+screenshot,fullPage:true,timeout:10000});}
    catch(screenshotError){entry.screenshotError=String(screenshotError?.message||screenshotError).slice(0,180);}
   }catch(captureError){res.failureUi.push({captureError:String(captureError?.message||captureError).slice(0,180)});}
  }
 }
}
finally{
 if(SESSION_PROOF_MODE&&browser)await browser.close().catch(()=>{});
 if(qaRef)try{
  const x=await qaRef.get();
  if(x.exists){
   if(SESSION_PROOF_MODE){
    const expectedId='qa-i3-d04-session-'+RUN+'-'+String(process.env.GITHUB_RUN_ATTEMPT||'1');
    assert.equal(x.data()?.bank?.certificationId,expectedId,'QA_CLEANUP_OWNERSHIP_MISMATCH');
    assert.equal(x.data()?.bank?.documentSource?.name,'Fixture QA de sesión independiente','QA_CLEANUP_SOURCE_MISMATCH');
    const data=x.data();
    res.d04FixtureBeforeCleanup={id:qaRef.id,version:data.version,status:data.status,
      certificationId:data.bank.certificationId,estado:data.bank.estado,
      contentRevision:data.bank.contentRevision,questionCount:data.bank.preguntas?.length,
      firstQuestion:data.bank.preguntas?.[0]?.q,firstQuestionFields:data.bank.preguntas?.[0],
      firstQuestionKeys:Object.keys(data.bank.preguntas?.[0]||{}),historyEntries:data.bank.reviewHistory?.length||0,
      history:data.bank.reviewHistory||[],updateTime:{seconds:x.updateTime.seconds,nanoseconds:x.updateTime.nanoseconds}};
    if(data.version===2&&data.bank.reviewHistory?.length===1)res.writes.qaResourceEdit=1;
   }
   await qaRef.delete();
   if(SESSION_PROOF_MODE)res.writes.qaResourceCleanup=1;
  }
  res.cleanup.qaAbsentAfter=!(await qaRef.get()).exists;
 }catch(e){res.cleanup.error=String(e?.message||e).slice(0,200);}
 else res.cleanup.qaAbsentAfter=true;
 if(SESSION_PROOF_MODE&&d04SessionBaseline){
  try{
   assert.deepEqual(await d04OtherBankHeads(),d04SessionBaseline);
   res.cleanup.existingBanksUnchanged=true;
  }catch(e){
   res.cleanup.existingBanksUnchanged=false;
   res.cleanup.bankVerificationError=String(e?.message||e).slice(0,180);
   res.decision='HOLD_QA_CLEANUP';
  }
 }
 if(browser)await browser.close().catch(()=>{});
 if(res.cleanup.qaAbsentAfter!==true)res.decision='HOLD_QA_CLEANUP';
 record();
}
console.log(JSON.stringify({decision:res.decision,c02:SESSION_PROOF_MODE?{independentApplicationSession:res.c02?.independentApplicationSession,durableUnchanged:res.c02?.durable?.unchanged}:undefined,d04:res.d04,e04:res.e04,cleanup:res.cleanup,error:res.error||null,production:false}));
const expectedDecision=SESSION_PROOF_MODE?'PASS_C02_D04_INDEPENDENT_SESSIONS':'PASS_D04_E04_CONNECTED_DEV_QA_NO_HUMAN_APPROVAL';
if(res.decision!==expectedDecision)process.exitCode=1;
}
