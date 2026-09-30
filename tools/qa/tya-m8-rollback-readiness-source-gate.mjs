import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const exactAction='M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY';
const action=String(process.env.CXORBIA_M8_ACTION||'').trim();
const outPath=process.env.CXORBIA_M8_ROLLBACK_OUTPUT||'.tmp/m8-human-validation/rollback-readiness.json';
const m7EvidencePath='app/docs/evidence/c6-live-user-admin-runtime-proof-31658676280.json';
const buildLockPath='app/core/build-lock.js';
const expectedRepo='paulaosoriof86/demoCXOrbia';
const expectedBranch='docs-tya-v6-v71-audit';
const expectedPr=7;
const m7Target='8fcc29bc4ce48e7198b8ae55223817eae6052b06';
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();

function readBuildLock(){
  const source=fs.readFileSync(buildLockPath,'utf8');
  const context={window:{}};
  vm.createContext(context);
  vm.runInContext(source,context,{filename:buildLockPath,timeout:2000});
  return {
    sourceLock:context.CX_SOURCE_LOCK||context.window?.CX?.SOURCE_LOCK||null,
    buildId:context.CX_BUILD_ID||context.window?.CX?.BUILD_ID||null
  };
}

function write(value){
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  fs.writeFileSync(outPath,JSON.stringify(value,null,2)+'\n','utf8');
}

try{
  ensure(action===exactAction,'M8_ROLLBACK_ACTION_NOT_EXACT');
  ensure(fs.existsSync(m7EvidencePath),'M8_M7_EVIDENCE_MISSING');
  ensure(fs.existsSync(buildLockPath),'M8_BUILD_LOCK_MISSING');
  const head=git('rev-parse','HEAD');
  const appTreeCurrent=git('rev-parse','HEAD:app');
  const appTreeM7=git('rev-parse',`${m7Target}:app`);
  const appChanges=git('diff','--name-only',m7Target,'HEAD','--','app').split(/\r?\n/).filter(Boolean);
  const runtimeAppChanges=appChanges.filter(p=>!p.startsWith('app/docs/'));
  const documentationAppChanges=appChanges.filter(p=>p.startsWith('app/docs/'));
  ensure(runtimeAppChanges.length===0,'M8_RUNTIME_APP_DRIFT_FROM_M7_DEPLOYED_PRODUCT:'+runtimeAppChanges.join(','));

  const m7=JSON.parse(fs.readFileSync(m7EvidencePath,'utf8'));
  ensure(m7.decision==='PASS_M7_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF','M8_M7_EVIDENCE_NOT_PASS');
  ensure(m7.runtime12?.targetHeadSha===m7Target,'M8_M7_TARGET_SHA_DRIFT');
  ensure(m7.runtime12?.workflowConclusion==='success','M8_M7_WORKFLOW_NOT_SUCCESS');
  ensure(m7.runtime12?.artifactDecision==='PASS_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME','M8_M7_ARTIFACT_NOT_PASS');
  ensure(m7.hosting?.remoteParityExact===true,'M8_M7_REMOTE_PARITY_NOT_EXACT');
  ensure(Number(m7.hosting?.physicalDeploys)===1&&Number(m7.hosting?.automaticSecondDeploys)===0,'M8_M7_HOSTING_COUNT_INVALID');
  ensure(m7.safety?.production===false&&m7.safety?.merge===false,'M8_M7_SAFETY_INVALID');

  const {sourceLock,buildId}=readBuildLock();
  ensure(sourceLock,'M8_SOURCE_LOCK_UNREADABLE');
  ensure(sourceLock.repository===expectedRepo&&sourceLock.branch===expectedBranch&&Number(sourceLock.pullRequest)===expectedPr,'M8_SOURCE_LOCK_IDENTITY_INVALID');
  ensure(sourceLock.production===false,'M8_SOURCE_LOCK_PRODUCTION_TRUE');
  ensure(typeof sourceLock.aggregateSha256==='string'&&/^[a-f0-9]{64}$/i.test(sourceLock.aggregateSha256),'M8_SOURCE_LOCK_AGGREGATE_INVALID');
  ensure(buildId===sourceLock.aggregateSha256.slice(0,16),'M8_BUILD_ID_SOURCE_LOCK_MISMATCH');
  ensure(typeof sourceLock.manifestFile==='string'&&sourceLock.manifestFile.length>0,'M8_SOURCE_LOCK_MANIFEST_MISSING');
  ensure(fs.existsSync('app/'+sourceLock.manifestFile)||fs.existsSync(sourceLock.manifestFile),'M8_SOURCE_LOCK_MANIFEST_NOT_FOUND');

  const result={
    schemaVersion:'cxorbia.m8.rollback-readiness-source-gate.v2',
    generatedAt:new Date().toISOString(),
    decision:'PASS_M8_ROLLBACK_READINESS_SOURCE_GATE',
    action:exactAction,
    repository:expectedRepo,
    branch:expectedBranch,
    pullRequest:expectedPr,
    currentHeadSha:head,
    productIdentity:{
      appTreeCurrent,
      m7DeployedTargetHeadSha:m7Target,
      appTreeM7Deployed:appTreeM7,
      wholeAppTreeExact:appTreeCurrent===appTreeM7,
      runtimeAppParityWithM7Deployed:true,
      runtimeAppChanges,
      documentationOnlyAppDrift:documentationAppChanges,
      buildId,
      sourceLock:{
        manifestFile:sourceLock.manifestFile,
        aggregateSha256:sourceLock.aggregateSha256,
        candidateId:sourceLock.candidateId||null,
        candidateSha256:sourceLock.candidateSha256||null,
        packageSha256:sourceLock.packageSha256||null,
        production:false
      }
    },
    lastKnownGoodDev:{
      runtimeDecision:m7.decision,
      workflowRunId:m7.runtime12.workflowRunId,
      jobId:m7.runtime12.jobId,
      artifactId:m7.runtime12.artifactId,
      artifactDigest:m7.runtime12.artifactDigest,
      remoteParityExact:true,
      targetHeadSha:m7Target
    },
    rollbackReadiness:{
      status:'READY_FAIL_CLOSED_FOR_M9_PROVIDER_CAPTURE',
      m8SourceAndBuildLockVerified:true,
      m7RuntimeProductBytesUnchanged:true,
      lastKnownGoodDevRuntimeVerified:true,
      currentProductionReleaseCapture:'PENDING_M9_PROVIDER_READ',
      currentProductionReleaseCaptured:false,
      rollbackExecutorVerification:'PENDING_M9_PROVIDER_CAPABILITY_READ',
      rollbackExecutionAuthorized:false,
      productionTouchedInM8:false,
      requirementsForM9:[
        'Capture the exact current production Hosting release/version before promotion.',
        'Verify a provider-supported rollback path to that captured pre-cutover release before promotion.',
        'Bind the single production promotion request to the exact tested product/source lock.',
        'Fail closed before production if release capture or rollback capability cannot be verified.',
        'If post-cutover smoke fails, rollback requires the explicit production gate and the captured pre-cutover release; no guessed command or reconstructed artifact is allowed.'
      ]
    },
    safety:{providerReads:0,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false}
  };
  write(result);
  console.log(JSON.stringify(result));
}catch(error){
  const failure={
    schemaVersion:'cxorbia.m8.rollback-readiness-source-gate.failure.v2',
    generatedAt:new Date().toISOString(),
    decision:'FAIL_M8_ROLLBACK_READINESS_SOURCE_GATE',
    action:exactAction,
    error:String(error?.message||error).replace(/[^A-Za-z0-9_.:/ ,-]/g,'_').slice(0,700),
    safety:{providerReads:0,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false}
  };
  write(failure);
  console.error(JSON.stringify(failure));
  process.exitCode=1;
}
