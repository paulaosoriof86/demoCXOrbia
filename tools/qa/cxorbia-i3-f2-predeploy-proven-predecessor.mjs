/** Read-only predecessor identity guard for the existing paired DEV lane. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {validatePendingDevSuccessor} from './cxorbia-i3-shock-continuity-guard.mjs';

export const F3_ENV_STATUS='HOLD_I3_F3_DEV_MATERIALIZED_ENV_REQUIRED';
export function validateF3EnvironmentRequest(descriptor,revision){
  const r=descriptor.runtimeEnvironmentRepairRequest,m=descriptor.currentMaterialization,s=descriptor.postDeployRunSeal;
  assert.equal(descriptor.status,F3_ENV_STATUS,'F3 environment status');
  assert.ok(r&&m&&s,'F3 environment authority missing');
  assert.equal(r.schemaVersion,'cxorbia.i3.f3-runtime-environment-repair.v1');
  assert.equal(r.classification,'ENVIRONMENT_FAILURE');
  assert.equal(r.scope,'F3_SYNTHETIC_PROJECT_ONLY');
  assert.equal(r.state,'REQUIRED');
  assert.equal(r.projectId,'f3-qa-20261124');
  assert.equal(r.production,false);assert.notEqual(descriptor.i4Authorized,true);
  assert.equal(r.builds,0);assert.equal(r.hostingDeploys,0);assert.equal(r.operationalHrWrites,0);
  assert.equal(m.sourceSha,descriptor.productSourceSha);assert.equal(m.sourceTree,descriptor.productTreeAuthority);
  assert.equal(s.mode,'CURRENT_SOURCE_SERVING');
  for(const k of ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion']){
    assert.equal(r[k],m[k],'F3 request '+k);assert.equal(s[k],m[k],'F3 seal '+k);
  }
  assert.equal(r.originalBuildRunId,m.runId);assert.equal(m.production,false);
  assert.equal(r.toolboxUrl,'https://eu2.make.com/mcp/server/4b7fc076-74a6-410b-8a7b-937e972e8bbe');
  assert.equal(r.secretName,'cxorbia-dev-f3-make-toolbox');assert.equal(r.secretVersion,'1');
  assert.equal(revision?.metadata?.name,m.runtimeRevision,'F3 prior revision');
  assert.equal(String(revision?.status?.imageDigest||'').split('@').at(-1),m.runtimeDigest,'F3 prior digest');
  assert.equal(revision?.spec?.containers?.[0]?.env?.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,m.sourceSha,'F3 prior source');
  return {decision:'PASS_F3_SAME_ARTIFACT_ENV_PREFLIGHT',builds:0,hostingDeploys:0,production:false};
}
export function validateF3EnvironmentReadback(descriptor,revision){
  const r=descriptor.runtimeEnvironmentRepairRequest,m=descriptor.currentMaterialization;
  assert.equal(descriptor.status,F3_ENV_STATUS);assert.ok(r&&m);
  assert.equal(String(revision?.status?.imageDigest||'').split('@').at(-1),m.runtimeDigest,'F3 after digest');
  const env=revision?.spec?.containers?.[0]?.env||[],entry=n=>env.find(e=>e.name===n);
  for(const [k,v] of Object.entries({CXORBIA_RECOVERY_SOURCE_SHA:m.sourceSha,CXORBIA_F3_HR_FIELDS_ENABLED:'true',CXORBIA_F3_MAKE_TOOLBOX_URL:r.toolboxUrl,CXORBIA_I3_B14_DIRECT_READER_DEV:'true',CXORBIA_B14_MAKE_TOOLBOX_URL:'https://eu2.make.com/mcp/server/98b29fbe-fbfe-42f2-aeae-e27998eb60c6'}))assert.equal(entry(k)?.value,v,'F3 environment '+k);
  for(const [k,n] of [['CXORBIA_F3_MAKE_TOOLBOX_TOKEN',r.secretName],['CXORBIA_B14_MAKE_TOOLBOX_TOKEN','cxorbia-dev-b14-make-toolbox']]){
    assert.equal(entry(k)?.value,undefined,'plaintext credential forbidden');
    assert.deepEqual(entry(k)?.valueFrom?.secretKeyRef,{key:'1',name:n},'secret reference drift');
  }
  return {decision:'PASS_F3_SAME_ARTIFACT_ENV_READBACK',runtimeRevision:revision.metadata.name,runtimeDigest:m.runtimeDigest,originalBuildRunId:m.runId,sourceSha:m.sourceSha,sourceTree:m.sourceTree,builds:0,hostingDeploys:0,operationalHrWrites:0,production:false,secretValuesRead:false};
}

export function validatePredeployPredecessor({runtime,hosting,descriptor,status,source,tree,pendingDev,receipt,receiptBlob,prior,revision}){
  if(descriptor.status==='HOLD_I3_GTHN_PENDING_DEV')assert.equal(status,descriptor.status,'pending status drift');
  assert.equal(descriptor.productSourceSha,source,'candidate source drift');
  assert.equal(descriptor.productTreeAuthority,tree,'candidate tree drift');
  let expectedRuntime=descriptor.postDeployRunSeal?.runtimeRevision;
  let expectedHosting=descriptor.currentHostingOnlyDevMaterialization?.hostingVersion||descriptor.currentMaterialization?.hostingVersion;
  let priorProofRun=null;
  const app=runtime.spec?.template?.spec?.containers?.[0];
  if(status===F3_ENV_STATUS){
    validateF3EnvironmentRequest(descriptor,revision);priorProofRun=descriptor.currentMaterialization.runId;
  }else if(status==='HOLD_I3_F2_EXCEL_OPERATIONAL_READER_SOURCE_ONLY_PENDING_DEV_6_OF_21'){
    assert.equal(prior?.proofRunId,45197074228,'not last proved predecessor');
    assert.equal(prior.proofJobConclusion,'success');
    assert.equal(prior.proofResultJsonSha256,'1c529bcdcc9852b5a5813d29ede9326d55059a943f368ff53535c09b2a386507');
    assert.equal(prior.production,'DO_NOT_TOUCH');
    assert.equal(prior.nextSourceSha,source);assert.equal(prior.nextSourceTree,tree);
    assert.equal(app?.env?.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,prior.sourceSha,'prior runtime source mismatch');
    assert.equal(app?.image,prior.runtimeImageTag,'prior runtime image mismatch');
    expectedRuntime=prior.runtimeRevision;expectedHosting=prior.hostingVersion;priorProofRun=prior.proofRunId;
  }else if(status==='HOLD_I3_GTHN_PENDING_DEV'){
    const pending=descriptor.pendingDevSuccessor||{},seal=descriptor.postDeployRunSeal||{},paired=descriptor.currentMaterialization;
    assert.equal(descriptor.status,status,'pending status drift');
    assert.equal(pendingDev?.present,true,'pending source proof missing');assert.equal(pendingDev?.pass,true,'pending source proof invalid');
    assert.equal(pending.state,'P0_PROVEN_PENDING_DEV_MATERIALIZATION');assert.equal(pending.scope,'RUNTIME_AND_HOSTING');
    assert.equal(pending.sourceSha,source);assert.equal(pending.sourceTree,tree);
    assert.equal(pending.devPublished,false);assert.equal(pending.production,false);assert.notEqual(descriptor.i4Authorized,true);
    assert.ok(paired,'paired predecessor missing');assert.equal(paired.production,false);
    assert.equal(pending.predecessorProductSourceSha,paired.sourceSha,'pending predecessor source drift');
    assert.notEqual(source,paired.sourceSha,'pending source must be a successor');
    assert.deepEqual(pending.servingPairedMaterialization,paired,'pending materialization drift');
    assert.deepEqual(pending.servingRuntimeSeal,seal,'pending seal drift');
    assert.equal(seal.mode,'PREDECESSOR_SERVING_PENDING_SOURCE');
    assert.ok(/^[a-f0-9]{40}$/.test(receiptBlob||''),'predecessor receipt blob missing');
    assert.equal(receiptBlob,seal.receiptBlob,'predecessor receipt blob drift');
    assert.equal(paired.materializationReceiptPath,seal.receiptPath,'predecessor receipt path drift');
    assert.equal(receipt?.source?.sha,paired.sourceSha,'receipt predecessor source drift');
    assert.equal(receipt?.source?.tree,paired.sourceTree,'receipt predecessor tree drift');
    assert.deepEqual(receipt.materialization,paired,'committed predecessor materialization drift');
    for(const key of ['sourceSha','sourceTree','runId','runtimeRevision','runtimeDigest','hostingVersion'])assert.equal(seal[key],paired[key],'predecessor seal '+key+' drift');
    assert.equal(app?.env?.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,paired.sourceSha,'prior runtime source mismatch');
    assert.ok(revision,'predecessor revision readback missing');
    assert.equal(revision.metadata?.name,paired.runtimeRevision,'prior revision name mismatch');
    const raw=String(revision.status?.imageDigest||''),digest=raw.includes('@')?raw.split('@').at(-1):raw;
    assert.equal(digest,paired.runtimeDigest,'prior runtime digest mismatch');
    expectedRuntime=paired.runtimeRevision;expectedHosting=paired.hostingVersion;priorProofRun=paired.runId;
  }
  assert.ok(expectedRuntime&&expectedHosting,'proven predecessor identity missing');
  assert.equal(runtime.status?.latestReadyRevisionName,expectedRuntime,'last proven runtime revision mismatch');
  const serving=(runtime.status?.traffic||[]).filter(x=>Number(x.percent)>0);
  assert.equal(serving.length,1,'prior DEV runtime must have one serving revision');
  assert.equal(serving[0].revisionName,expectedRuntime,'prior traffic revision mismatch');
  assert.equal(serving[0].percent,100,'prior DEV runtime must serve 100%');
  assert.equal(hosting.release?.version?.name,expectedHosting,'last proven Hosting version mismatch');
  return {decision:'PASS_EXACT_PROVEN_DEV_PREDECESSOR',priorProofRun,predecessorRuntime:expectedRuntime,predecessorHosting:expectedHosting,newSourceSha:source,production:false,writes:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv[2]==='--reuse'){
    const descriptor=JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR,'utf8'));
    assert.equal(descriptor.currentMaterialization.sourceSha,process.env.FOCAL_SOURCE);assert.equal(descriptor.currentMaterialization.sourceTree,process.env.FOCAL_TREE);
    if(process.env.ACTIVE_STATUS===F3_ENV_STATUS)validateF3EnvironmentRequest(descriptor,JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/revision-before.json','utf8')));
    else {assert.equal(descriptor.status,'HOLD_I3_F09_DEV_MATERIALIZED_C3_REPROOF_PENDING');assert.equal(descriptor.runtimeSourceLabelCorrectionPending,true);}
    process.exit(0);
  }
  if(process.argv[2]==='--env-readback'){
    if(process.env.ACTIVE_STATUS===F3_ENV_STATUS){
      const proof=validateF3EnvironmentReadback(JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR,'utf8')),JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/runtime-revision.json','utf8')));
      fs.writeFileSync(process.env.FOCAL_OUT+'/f3-environment-readback.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
    }
    process.exit(0);
  }
  const [runtimePath,hostingPath,descriptorPath,status,source,tree,revisionPath]=process.argv.slice(2),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  assert.ok(runtimePath&&hostingPath&&descriptorPath&&status&&source&&tree,'missing exact guard arguments');
  const descriptor=read(descriptorPath),args={runtime:read(runtimePath),hosting:read(hostingPath),descriptor,status,source,tree};
  if(status==='HOLD_I3_F2_EXCEL_OPERATIONAL_READER_SOURCE_ONLY_PENDING_DEV_6_OF_21')args.prior=read('.github/control/CXORBIA_I3_F2_VERIFIED_SERVING_PREDECESSOR_20261123.json');
  if(status===F3_ENV_STATUS)args.revision=read(revisionPath);
  if(status==='HOLD_I3_GTHN_PENDING_DEV'){
    const gitBlob=p=>execFileSync('git',['rev-parse','HEAD:'+p],{encoding:'utf8'}).trim();
    args.pendingDev=validatePendingDevSuccessor({descriptor,pointer:read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json'),matrix:read(descriptor.moduleTruthPath),gitBlob});
    const bytes=fs.readFileSync(descriptor.postDeployRunSeal.receiptPath);
    args.receiptBlob=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    assert.equal(args.receiptBlob,gitBlob(descriptor.postDeployRunSeal.receiptPath),'working predecessor receipt differs from committed blob');
    args.receipt=JSON.parse(bytes);args.revision=read(revisionPath);
  }
  console.log('CXORBIA_I3_EXACT_DEV_PREDEPLOY_READBACK='+JSON.stringify(validatePredeployPredecessor(args)));
}
