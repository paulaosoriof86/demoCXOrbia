import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// I3 P0: exact A06 readback and one DEV traffic activation of the already
// built image from RUN2087, only with explicit descriptor/status authority.
// No rebuild, no production, and no data/provider writes.
const source='f36ab1eb7c6bf842603273ee5fb8e79e7fabce6d';
const expectedRevision='cxorbia-live-hr-dev-00336-fz2';
const expectedImage='gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev:i3-vrm154-156-f36ab1eb7c6b-41663635530';
const previousDigest='sha256:34418f7bcba9fdd37dbf4c34d7c09f4da01b5ecaa89f2ce2eaa24c05faaac941';
const priorRevision='cxorbia-live-hr-dev-00335-tpk';
const activate=process.argv.includes('--activate-exact-dev');
const scope=['--project=cxorbia-backend-dev','--region=us-central1'];
const run=(args)=>JSON.parse(execFileSync('gcloud',args,{encoding:'utf8',timeout:45000,maxBuffer:6_000_000}));
const describe=()=>run(['run','services','describe','cxorbia-live-hr-dev',...scope,'--format=json']);
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const d=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
assert.equal(d.productSourceSha,source,'RELEASE_COMPOSITION_FAILURE:SOURCE_NOT_EXACT');
assert.equal(d.production,'DO_NOT_TOUCH');
if(activate){
  assert.equal(d.status,'HOLD_VRM134_A05_DEV_TRAFFIC_REQUIRED','RELEASE_COMPOSITION_FAILURE:TRAFFIC_AUTHORITY');
  assert.equal(d.vrm134A06ParallelHrRefresh20261103?.authorizeExactDevTrafficSwitch20261103,true,
    'RELEASE_COMPOSITION_FAILURE:EXACT_DEV_TRAFFIC_AUTHORIZATION_MISSING');
  assert.equal(d.vrm134A06ParallelHrRefresh20261103?.materializationRunId,41663635530,
    'RELEASE_COMPOSITION_FAILURE:SOURCE_BUILD_RUN_NOT_EXACT');
}

const service=describe();
const created=service.status?.latestCreatedRevisionName;
const ready=service.status?.latestReadyRevisionName;
const traffic=(service.status?.traffic||[]).filter(x=>x.revisionName===ready&&x.percent===100);
const intendedRevision=run(['run','revisions','describe',expectedRevision,...scope,'--format=json']);
const conciseConditions=(xs)=>(xs||[]).map(({type,status,reason,message})=>({type,status,reason,message}));
console.log(JSON.stringify({decision:'DIAGNOSTIC_VRM134_A06_RUNTIME_STATE_READ_ONLY',
  expectedRevision,latestCreatedRevision:created,latestReadyRevision:ready,
  traffic:service.status?.traffic?.filter(x=>x.percent>0),
  templateImage:service.spec?.template?.spec?.containers?.[0]?.image,
  serviceConditions:conciseConditions(service.status?.conditions),
  intendedRevisionConditions:conciseConditions(intendedRevision.status?.conditions),
  intendedRevisionImageDigest:intendedRevision.status?.imageDigest,
  builds:0,deploys:0,production:false}));
assert.equal(created,expectedRevision,'ENVIRONMENT_FAILURE:UNEXPECTED_CREATED_REVISION');
assert.equal(service.spec?.template?.spec?.containers?.[0]?.image,expectedImage,
  'RELEASE_COMPOSITION_FAILURE:SOURCE_IMAGE_TAG_NOT_CURRENT');

const revision=intendedRevision;
const raw=String(revision.status?.imageDigest||'');
const digest=raw.includes('@sha256:')?`sha256:${raw.split('@sha256:')[1]}`:raw;
assert.match(digest,/^sha256:[a-f0-9]{64}$/,'ENVIRONMENT_FAILURE:REVISION_DIGEST_MISSING');
assert.notEqual(digest,previousDigest,'RELEASE_COMPOSITION_FAILURE:OLD_RUNTIME_DIGEST_STILL_SERVING');
assert.equal(revision.spec?.containers?.[0]?.image,expectedImage,
  'RELEASE_COMPOSITION_FAILURE:NEW_REVISION_IMAGE_TAG_MISMATCH');
assert.equal(revision.metadata?.name,expectedRevision);
assert.equal(revision.status?.conditions?.find(x=>x.type==='Ready')?.status,'True',
  'ENVIRONMENT_FAILURE:REVISION_NOT_HEALTHY');

let observed=service,trafficSwitches=0;
if(activate){
  assert.equal(ready,priorRevision,'ENVIRONMENT_FAILURE:PRIOR_RUNTIME_TRAFFIC_CHANGED');
  assert.equal(traffic.length,1,'ENVIRONMENT_FAILURE:PRIOR_TRAFFIC_NOT_EXACT_100');
  console.log(JSON.stringify({decision:'VRM134_A06_ONE_DEV_TRAFFIC_SWITCH_START',
    fromRevision:priorRevision,toRevision:expectedRevision,digest,builds:0,production:false}));
  execFileSync('gcloud',['run','services','update-traffic','cxorbia-live-hr-dev',
    '--to-revisions',`${expectedRevision}=100`,...scope,'--quiet'],
  {encoding:'utf8',timeout:180000,maxBuffer:4_000_000});
  trafficSwitches=1;
}

try{
  for(let attempt=1;attempt<=12;attempt++){
    observed=describe();
    if(observed.status?.latestReadyRevisionName===expectedRevision&&
      (observed.status?.traffic||[]).some(x=>x.revisionName===expectedRevision&&x.percent===100))break;
    if(!activate||attempt===12)break;
    await sleep(5000);
  }
  assert.equal(observed.status?.latestReadyRevisionName,expectedRevision,'ENVIRONMENT_FAILURE:NEW_RUNTIME_NOT_READY');
  assert.equal(observed.status?.latestCreatedRevisionName,expectedRevision,'ENVIRONMENT_FAILURE:CREATED_RUNTIME_DRIFT');
  assert.equal((observed.status?.traffic||[]).filter(x=>x.revisionName===expectedRevision&&x.percent===100).length,
    1,'ENVIRONMENT_FAILURE:NEW_RUNTIME_NOT_100_PERCENT_TRAFFIC');
  const url=String(observed.status?.url||'');
  assert.match(url,/^https:\/\//,'ENVIRONMENT_FAILURE:RUNTIME_URL_MISSING');
  let health;
  for(let i=0;i<4;i++){
    try{
      const response=await fetch(url+'/health',{signal:AbortSignal.timeout(25000)});
      if(!response.ok)throw new Error('HEALTH_HTTP_'+response.status);
      health=await response.json();
      if(health.ok===true&&health.production===false&&health.hrWrites===false)break;
    }catch(err){if(i===3)throw err;await sleep(3000);}
  }
  assert.equal(health?.ok,true,'ENVIRONMENT_FAILURE:ACTIVE_HEALTH_FAIL');
  assert.equal(health?.production,false,'RELEASE_COMPOSITION_FAILURE:NON_DEV_RUNTIME');
  assert.equal(health?.hrWrites,false,'PERSISTENCE_FAILURE:UNEXPECTED_HR_WRITE');
}catch(error){
  if(trafficSwitches===1){
    console.error(JSON.stringify({decision:'VRM134_A06_DEV_ACTIVATION_FAILED_ROLLBACK',reason:error.message,
      restoreRevision:priorRevision,production:false}));
    execFileSync('gcloud',['run','services','update-traffic','cxorbia-live-hr-dev',
      '--to-revisions',`${priorRevision}=100`,...scope,'--quiet'],{timeout:180000,maxBuffer:4_000_000});
    const rollback=describe();
    assert.equal((rollback.status?.traffic||[]).filter(x=>x.revisionName===priorRevision&&x.percent===100).length,
      1,'ENVIRONMENT_FAILURE:ROLLBACK_READBACK_FAILED');
    console.error(JSON.stringify({decision:'VRM134_A06_DEV_ROLLBACK_TRAFFIC_RESTORED',
      revision:priorRevision,trafficPercent:100,production:false}));
  }
  throw error;
}
console.log(JSON.stringify({decision:'PASS_VRM134_A06_ACTIVE_RUNTIME_READBACK',sourceSha:source,
  revision:expectedRevision,imageTag:expectedImage,runtimeDigest:digest,trafficPercent:100,
  sourceBuildRun:41663635530,trafficSwitches,builds:0,cloudRunImageUpdates:0,
  hostingDeploys:0,providerWrites:0,production:false}));
