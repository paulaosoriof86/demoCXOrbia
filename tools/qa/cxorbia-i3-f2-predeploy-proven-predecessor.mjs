/** Read-only predecessor identity guard for the existing paired DEV lane. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {validatePendingDevSuccessor} from './cxorbia-i3-shock-continuity-guard.mjs';

export const F3_ENV_STATUS='HOLD_I3_F3_DEV_MATERIALIZED_ENV_REQUIRED';
export function validateBuiltArtifactResume(descriptor,build,receipt,receiptBlob){
  const r=descriptor.pairedBuildResumeRequest;
  assert.equal(descriptor.status,'HOLD_I3_GTHN_PENDING_DEV');assert.ok(r);
  assert.equal(r.schemaVersion,'cxorbia.i3.paired-built-artifact-resume.v1');
  assert.equal(r.state,'RESUME_EXACT_SUCCESSFUL_BUILD');assert.equal(r.production,false);assert.notEqual(descriptor.i4Authorized,true);
  assert.equal(r.builds,0);assert.equal(r.sourceSha,descriptor.productSourceSha);assert.equal(r.sourceTree,descriptor.productTreeAuthority);
  assert.equal(r.sourceSha,descriptor.pendingDevSuccessor?.sourceSha);assert.equal(r.sourceTree,descriptor.pendingDevSuccessor?.sourceTree);
  assert.equal(r.receiptBlob,receiptBlob);assert.ok(/^[a-f0-9]{40}$/.test(receiptBlob));
  assert.equal(receipt.sourceSha,r.sourceSha);assert.equal(receipt.sourceTree,r.sourceTree);
  assert.equal(receipt.failure?.runId,r.originalBuildRunId);assert.equal(receipt.failure?.buildId,r.buildId);
  assert.equal(receipt.failure?.artifactId,r.originalArtifactId);assert.equal(receipt.failure?.artifactDigest,r.originalArtifactDigest);
  assert.equal(receipt.failure?.imageTag,r.imageTag);assert.equal(receipt.failure?.buildStatus,'SUCCESS');
  assert.equal(receipt.failure?.runtimeDeploys,0);assert.equal(receipt.failure?.hostingDeploys,0);assert.equal(receipt.failure?.production,false);
  assert.equal(build.id,r.buildId);assert.equal(build.projectId,'cxorbia-backend-dev');assert.equal(build.status,'SUCCESS');
  assert.equal(r.imageTag,'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev:i3-vrm154-156-'+r.sourceSha.slice(0,12)+'-'+r.originalBuildRunId);
  assert.equal(build.substitutions?._IMAGE,r.imageTag);
  assert.equal(build.source?.storageSource?.bucket,'cxorbia-backend-dev_cloudbuild');
  assert.equal(build.source?.storageSource?.object,r.sourceStorageObject);
  const matches=(build.results?.images||[]).filter(image=>image.name===r.imageTag);
  assert.equal(matches.length,1);assert.ok(/^sha256:[a-f0-9]{64}$/.test(matches[0].digest));
  return {decision:'PASS_EXACT_SUCCESSFUL_BUILD_REUSED',sourceSha:r.sourceSha,sourceTree:r.sourceTree,builds:0,originalBuildRunId:r.originalBuildRunId,originalBuildId:r.buildId,originalArtifactId:r.originalArtifactId,originalArtifactDigest:r.originalArtifactDigest,imageUri:'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@'+matches[0].digest,runtimeDigest:matches[0].digest,production:false};
}
export function validateMailboxDisabledReadback(descriptor,revision){
  const hold=descriptor.currentMailboxEnvironmentHold;assert.equal(hold?.state,'HOLD_MAIL_UNCONFIGURED');
  assert.equal(hold.production,false);assert.equal(hold.sourceSha,descriptor.productSourceSha);assert.equal(hold.sourceTree,descriptor.productTreeAuthority);
  const env=revision?.spec?.containers?.[0]?.env||[];
  assert.equal(env.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,hold.sourceSha);
  for(const name of ['CXORBIA_USER_MAILBOX_ENABLED','CXORBIA_USER_MAILBOX_SEND_ENABLED'])assert.equal(env.find(e=>e.name===name)?.value,'false');
  assert.equal(env.filter(e=>e.name==='CXORBIA_MAILBOX_CREDENTIAL_KEY_B64').length,0);
  return {decision:'PASS_DEV_MAILBOX_DISABLED_E08_HOLD',runtimeRevision:revision.metadata.name,sourceSha:hold.sourceSha,sourceTree:hold.sourceTree,mailboxEnabled:false,sendEnabled:false,keyMounted:false,mailDomainClosed:false,production:false};
}
export function validateResumedBuildRuntime(descriptor,proof,revision){
  assert.equal(proof.decision,'PASS_EXACT_SUCCESSFUL_BUILD_REUSED');assert.equal(proof.builds,0);
  assert.equal(proof.sourceSha,descriptor.productSourceSha);assert.equal(proof.sourceTree,descriptor.productTreeAuthority);
  assert.equal(proof.originalBuildId,descriptor.pairedBuildResumeRequest?.buildId);
  assert.equal(proof.originalBuildRunId,descriptor.pairedBuildResumeRequest?.originalBuildRunId);
  assert.equal(proof.runtimeDigest,String(revision?.status?.imageDigest||'').split('@').at(-1),'resumed build runtime digest mismatch');
  assert.equal(revision?.spec?.containers?.[0]?.env?.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,proof.sourceSha);
  return {decision:'PASS_SAME_RESUMED_BUILD_RUNTIME',runtimeDigest:proof.runtimeDigest,runtimeRevision:revision.metadata.name,sourceSha:proof.sourceSha,sourceTree:proof.sourceTree,originalBuildId:proof.originalBuildId,originalBuildRunId:proof.originalBuildRunId,builds:0,production:false};
}
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

export function validatePredeployPredecessor({runtime,hosting,descriptor,status,source,tree,pendingDev,receipt,receiptBlob,prior,revision,physicalStage}){
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
    let physical=paired;
    if(pending.physicalPredecessor){
      assert.equal(physicalStage?.native?.id,pending.physicalPredecessor.failedBuildId);
      assert.equal(physicalStage.native.status,'FAILURE');
      assert.equal(physicalStage.production,false);
      assert.equal(physicalStage.sealed,false);
      assert.equal(physicalStage.identity.sourceSha,pending.previousApprovedSourceSha);
      assert.equal(physicalStage.native.predecessorReceiptBlob,seal.receiptBlob);
      assert.equal(physicalStage.identity.hostingRelease,hosting.release?.name);
      physical=physicalStage.identity;
    }
    assert.equal(app?.env?.find(e=>e.name==='CXORBIA_RECOVERY_SOURCE_SHA')?.value,physical.sourceSha,'prior runtime source mismatch');
    assert.ok(revision,'predecessor revision readback missing');
    assert.equal(revision.metadata?.name,physical.runtimeRevision,'prior revision name mismatch');
    const raw=String(revision.status?.imageDigest||''),digest=raw.includes('@')?raw.split('@').at(-1):raw;
    assert.equal(digest,physical.runtimeDigest,'prior runtime digest mismatch');
    expectedRuntime=physical.runtimeRevision;expectedHosting=physical.hostingVersion;priorProofRun=physical.runId;
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
  if(process.argv[2]==='--resume-built-artifact'){
    const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),descriptor=read(process.env.CANDIDATE_DESCRIPTOR),r=descriptor.pairedBuildResumeRequest;
    assert.ok(r&&/^docs\/checkpoints\/[^/]+\.json$/.test(r.receiptPath));
    assert.equal(process.env.PROJECT,'cxorbia-backend-dev');assert.equal(process.env.SERVICE,'cxorbia-live-hr-dev');assert.equal(process.env.REGION,'us-central1');
    assert.equal(process.env.FOCAL_SOURCE,r.sourceSha);assert.equal(process.env.FOCAL_TREE,r.sourceTree);assert.ok(/^[a-f0-9-]{36}$/.test(r.buildId));
    const bytes=fs.readFileSync(r.receiptPath),receiptBlob=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    assert.equal(execFileSync('git',['rev-parse','HEAD:'+r.receiptPath],{encoding:'utf8'}).trim(),receiptBlob);
    const build=JSON.parse(execFileSync('gcloud',['builds','describe',r.buildId,'--project=cxorbia-backend-dev','--format=json'],{encoding:'utf8'}));
    fs.writeFileSync(process.env.FOCAL_OUT+'/resumed-build.json',JSON.stringify(build,null,2)+'\n');
    const proof=validateBuiltArtifactResume(descriptor,build,JSON.parse(bytes),receiptBlob);
    fs.writeFileSync(process.env.FOCAL_OUT+'/build-resume.json',JSON.stringify(proof,null,2)+'\n');console.log(proof.imageUri);process.exit(0);
  }
  if(process.argv[2]==='--reuse'){
    const descriptor=JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR,'utf8'));
    assert.equal(descriptor.currentMaterialization.sourceSha,process.env.FOCAL_SOURCE);assert.equal(descriptor.currentMaterialization.sourceTree,process.env.FOCAL_TREE);
    if(process.env.ACTIVE_STATUS===F3_ENV_STATUS)validateF3EnvironmentRequest(descriptor,JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/revision-before.json','utf8')));
    else {assert.equal(descriptor.status,'HOLD_I3_F09_DEV_MATERIALIZED_C3_REPROOF_PENDING');assert.equal(descriptor.runtimeSourceLabelCorrectionPending,true);}
    process.exit(0);
  }
  if(process.argv[2]==='--env-readback'){
    const descriptor=JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR,'utf8'));
    if(descriptor.pairedBuildResumeRequest?.state==='RESUME_EXACT_SUCCESSFUL_BUILD'){
      const proof=validateResumedBuildRuntime(descriptor,JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/build-resume.json','utf8')),JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/runtime-revision.json','utf8')));
      fs.writeFileSync(process.env.FOCAL_OUT+'/resumed-runtime-readback.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
    }
    if(descriptor.currentMailboxEnvironmentHold?.state==='HOLD_MAIL_UNCONFIGURED'){
      const proof=validateMailboxDisabledReadback(descriptor,JSON.parse(fs.readFileSync(process.env.FOCAL_OUT+'/runtime-revision.json','utf8')));
      fs.writeFileSync(process.env.FOCAL_OUT+'/mailbox-disabled-runtime-readback.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
    }
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
    const pin=descriptor.pendingDevSuccessor?.physicalPredecessor?.stageReceipt;
    if(pin){
      assert.equal(gitBlob(pin.path),pin.gitBlob);
      args.physicalStage=JSON.parse(execFileSync('git',['show','HEAD:'+pin.path],{encoding:'utf8'}));
    }
  }
  console.log('CXORBIA_I3_EXACT_DEV_PREDEPLOY_READBACK='+JSON.stringify(validatePredeployPredecessor(args)));
}
