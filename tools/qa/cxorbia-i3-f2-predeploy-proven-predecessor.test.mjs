import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePredeployPredecessor,validateF3EnvironmentRequest,validateF3EnvironmentReadback,validateBuiltArtifactResume,validateMailboxDisabledReadback,validateResumedBuildRuntime,F3_ENV_STATUS} from './cxorbia-i3-f2-predeploy-proven-predecessor.mjs';
const clone=structuredClone;
function fixture(){
 const source='b'.repeat(40),tree='c'.repeat(40),receiptBlob='d'.repeat(40),status='HOLD_I3_GTHN_PENDING_DEV';
 const paired={sourceSha:'9'.repeat(40),sourceTree:'a'.repeat(40),runtimeRevision:'runtime-384',runtimeDigest:'sha256:'+('e'.repeat(64)),hostingVersion:'hosting-384',runId:2748,materializationReceiptPath:'docs/checkpoints/prior.json',production:false};
 const seal={...paired,mode:'PREDECESSOR_SERVING_PENDING_SOURCE',receiptPath:paired.materializationReceiptPath,receiptBlob};
 const pending={state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'RUNTIME_AND_HOSTING',sourceSha:source,sourceTree:tree,predecessorProductSourceSha:paired.sourceSha,servingPairedMaterialization:clone(paired),servingRuntimeSeal:clone(seal),devPublished:false,production:false};
 return {source,tree,status,receiptBlob,pendingDev:{present:true,pass:true},receipt:{source:{sha:paired.sourceSha,tree:paired.sourceTree},materialization:clone(paired)},descriptor:{productSourceSha:source,productTreeAuthority:tree,status,currentMaterialization:paired,postDeployRunSeal:seal,pendingDevSuccessor:pending,i4Authorized:false},
 runtime:{spec:{template:{spec:{containers:[{env:[{name:'CXORBIA_RECOVERY_SOURCE_SHA',value:paired.sourceSha}]}]}}},status:{latestReadyRevisionName:paired.runtimeRevision,traffic:[{revisionName:paired.runtimeRevision,percent:100}]}},
 hosting:{release:{version:{name:paired.hostingVersion}}},revision:{metadata:{name:paired.runtimeRevision},status:{imageDigest:'gcr.io/example@'+paired.runtimeDigest}}};
}
test('new paired source is bound to the actual committed serving predecessor',()=>{
 const f=fixture(),r=validatePredeployPredecessor(f);assert.equal(r.decision,'PASS_EXACT_PROVEN_DEV_PREDECESSOR');assert.equal(r.writes,0);assert.equal(r.production,false);assert.equal(r.priorProofRun,2748);
});
for(const [label,mutate,error]of[
 ['wrong status',f=>f.status='OTHER',/pending status drift/],
 ['candidate source',f=>f.source='wrong',/candidate source drift/],
 ['candidate tree',f=>f.tree='wrong',/candidate tree drift/],
 ['missing proof',f=>delete f.pendingDev,/proof missing/],
 ['unproven source',f=>f.pendingDev.pass=false,/proof invalid/],
 ['wrong predecessor',f=>f.descriptor.pendingDevSuccessor.predecessorProductSourceSha='wrong',/predecessor source drift/],
 ['altered receipt',f=>f.receipt.materialization.runtimeRevision='other',/committed predecessor materialization drift/],
 ['wrong blob',f=>f.receiptBlob='f'.repeat(40),/receipt blob drift/],
 ['wrong ready revision',f=>f.runtime.status.latestReadyRevisionName='other',/last proven runtime revision mismatch/],
 ['split traffic',f=>f.runtime.status.traffic.push({revisionName:'other',percent:1}),/one serving revision/],
 ['99 percent',f=>f.runtime.status.traffic[0].percent=99,/100%/],
 ['other traffic',f=>f.runtime.status.traffic[0].revisionName='other',/traffic revision mismatch/],
 ['wrong runtime source',f=>f.runtime.spec.template.spec.containers[0].env[0].value='other',/prior runtime source mismatch/],
 ['missing runtime source',f=>f.runtime.spec.template.spec.containers[0].env=[],/prior runtime source mismatch/],
 ['wrong hosting',f=>f.hosting.release.version.name='other',/Hosting version mismatch/],
 ['wrong digest',f=>f.revision.status.imageDigest='sha256:wrong',/runtime digest mismatch/],
 ['missing revision',f=>delete f.revision,/revision readback missing/],
 ['published claim',f=>f.descriptor.pendingDevSuccessor.devPublished=true,/Expected values/],
 ['production claim',f=>f.descriptor.pendingDevSuccessor.production=true,/Expected values/]
])test('predeploy blocks '+label,()=>{const f=fixture();mutate(f);assert.throws(()=>validatePredeployPredecessor(f),error);});

function envFixture(){
 const f=fixture(),m=f.descriptor.currentMaterialization;
 f.status=f.descriptor.status=F3_ENV_STATUS;f.source=m.sourceSha;f.tree=m.sourceTree;
 f.descriptor.productSourceSha=f.source;f.descriptor.productTreeAuthority=f.tree;
 f.descriptor.postDeployRunSeal.mode='CURRENT_SOURCE_SERVING';delete f.descriptor.pendingDevSuccessor;
 f.descriptor.runtimeEnvironmentRepairRequest={schemaVersion:'cxorbia.i3.f3-runtime-environment-repair.v1',classification:'ENVIRONMENT_FAILURE',scope:'F3_SYNTHETIC_PROJECT_ONLY',state:'REQUIRED',projectId:'f3-qa-20261124',production:false,builds:0,hostingDeploys:0,operationalHrWrites:0,...m,originalBuildRunId:m.runId,toolboxUrl:'https://eu2.make.com/mcp/server/4b7fc076-74a6-410b-8a7b-937e972e8bbe',secretName:'cxorbia-dev-f3-make-toolbox',secretVersion:'1'};
 f.revision.spec={containers:[{env:clone(f.runtime.spec.template.spec.containers[0].env)}]};
 return f;
}
test('F3 environment repair requires the consumed build and exactly the same artifact',()=>{
 const f=envFixture();assert.equal(validatePredeployPredecessor(f).priorProofRun,f.descriptor.currentMaterialization.runId);
 assert.equal(validateF3EnvironmentRequest(f.descriptor,f.revision).builds,0);
});
for(const [name,change]of[
 ['wrong source',f=>f.descriptor.runtimeEnvironmentRepairRequest.sourceSha='other'],
 ['wrong prior revision',f=>f.revision.metadata.name='other'],
 ['wrong digest',f=>f.revision.status.imageDigest='sha256:other'],
 ['wrong Hosting',f=>f.descriptor.runtimeEnvironmentRepairRequest.hostingVersion='other'],
 ['source label drift',f=>f.revision.spec.containers[0].env[0].value='other'],
 ['rebuild requested',f=>f.descriptor.runtimeEnvironmentRepairRequest.builds=1],
 ['hosting deployment requested',f=>f.descriptor.runtimeEnvironmentRepairRequest.hostingDeploys=1],
 ['operational writes',f=>f.descriptor.runtimeEnvironmentRepairRequest.operationalHrWrites=1],
 ['production',f=>f.descriptor.runtimeEnvironmentRepairRequest.production=true],
 ['other project',f=>f.descriptor.runtimeEnvironmentRepairRequest.projectId='cinepolis'],
 ['other secret',f=>f.descriptor.runtimeEnvironmentRepairRequest.secretName='other'],
 ['unpinned secret',f=>f.descriptor.runtimeEnvironmentRepairRequest.secretVersion='latest'],
 ['other toolbox',f=>f.descriptor.runtimeEnvironmentRepairRequest.toolboxUrl='other']
])test('F3 reuse blocks '+name,()=>{const f=envFixture();change(f);assert.throws(()=>validateF3EnvironmentRequest(f.descriptor,f.revision));});
function afterEnv(){
 const f=envFixture(),r=f.descriptor.runtimeEnvironmentRepairRequest;
 f.revision.metadata.name='runtime-385';f.revision.spec.containers[0].env.push(
  {name:'CXORBIA_F3_HR_FIELDS_ENABLED',value:'true'},{name:'CXORBIA_F3_MAKE_TOOLBOX_URL',value:r.toolboxUrl},
  {name:'CXORBIA_I3_B14_DIRECT_READER_DEV',value:'true'},{name:'CXORBIA_B14_MAKE_TOOLBOX_URL',value:'https://eu2.make.com/mcp/server/98b29fbe-fbfe-42f2-aeae-e27998eb60c6'},
  {name:'CXORBIA_F3_MAKE_TOOLBOX_TOKEN',valueFrom:{secretKeyRef:{name:r.secretName,key:'1'}}},
  {name:'CXORBIA_B14_MAKE_TOOLBOX_TOKEN',valueFrom:{secretKeyRef:{name:'cxorbia-dev-b14-make-toolbox',key:'1'}}});return f;
}
test('F3 readback proves secret references without reading credentials',()=>{
 const f=afterEnv(),r=validateF3EnvironmentReadback(f.descriptor,f.revision);assert.equal(r.runtimeRevision,'runtime-385');assert.equal(r.secretValuesRead,false);
});
for(const [name,change]of[
 ['missing writer',f=>f.revision.spec.containers[0].env=f.revision.spec.containers[0].env.filter(e=>e.name!=='CXORBIA_F3_HR_FIELDS_ENABLED')],
 ['changed image',f=>f.revision.status.imageDigest='sha256:other'],
 ['reader removed',f=>f.revision.spec.containers[0].env=f.revision.spec.containers[0].env.filter(e=>e.name!=='CXORBIA_B14_MAKE_TOOLBOX_TOKEN')],
 ['plaintext token',f=>{const e=f.revision.spec.containers[0].env.find(e=>e.name==='CXORBIA_F3_MAKE_TOOLBOX_TOKEN');e.value='not-a-secret';delete e.valueFrom;}],
 ['latest secret',f=>f.revision.spec.containers[0].env.find(e=>e.name==='CXORBIA_F3_MAKE_TOOLBOX_TOKEN').valueFrom.secretKeyRef.key='latest']
])test('F3 postdeploy blocks '+name,()=>{const f=afterEnv();change(f);assert.throws(()=>validateF3EnvironmentReadback(f.descriptor,f.revision));});
function buildFixture(){
 const f=fixture(),r={schemaVersion:'cxorbia.i3.paired-built-artifact-resume.v1',state:'RESUME_EXACT_SUCCESSFUL_BUILD',production:false,builds:0,sourceSha:f.source,sourceTree:f.tree,receiptBlob:f.receiptBlob,originalBuildRunId:2774,buildId:'exact-build',originalArtifactId:123,originalArtifactDigest:'sha256:'+'f'.repeat(64),sourceStorageObject:'source/exact.tgz'};
 r.imageTag='gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev:i3-vrm154-156-'+r.sourceSha.slice(0,12)+'-'+r.originalBuildRunId;
 f.descriptor.pairedBuildResumeRequest=r;
 return {descriptor:f.descriptor,blob:f.receiptBlob,receipt:{sourceSha:f.source,sourceTree:f.tree,failure:{runId:r.originalBuildRunId,buildId:r.buildId,artifactId:r.originalArtifactId,artifactDigest:r.originalArtifactDigest,imageTag:r.imageTag,buildStatus:'SUCCESS',runtimeDeploys:0,hostingDeploys:0,production:false}},build:{id:r.buildId,projectId:'cxorbia-backend-dev',status:'SUCCESS',substitutions:{_IMAGE:r.imageTag},source:{storageSource:{bucket:'cxorbia-backend-dev_cloudbuild',object:r.sourceStorageObject}},results:{images:[{name:r.imageTag,digest:'sha256:'+'8'.repeat(64)}]}}};
}
test('paired resume pins the provider-verified existing image by digest and records zero builds',()=>{
 const f=buildFixture(),r=validateBuiltArtifactResume(f.descriptor,f.build,f.receipt,f.blob);
 assert.equal(r.builds,0);assert.equal(r.originalBuildRunId,2774);assert.equal(r.imageUri,'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@sha256:'+'8'.repeat(64));
});
for(const [name,change] of [
 ['other source',f=>f.descriptor.pairedBuildResumeRequest.sourceSha='e'.repeat(40)],
 ['wrong receipt',f=>f.blob='1'.repeat(40)],
 ['unsuccessful build',f=>f.build.status='WORKING'],
 ['other project',f=>f.build.projectId='production'],
 ['other source archive',f=>f.build.source.storageSource.object='source/other.tgz'],
 ['other image',f=>f.build.results.images[0].name='other'],
 ['mutable digest',f=>f.build.results.images[0].digest='latest'],
 ['different build input',f=>f.build.substitutions._IMAGE='other'],
 ['already deployed predecessor',f=>f.receipt.failure.runtimeDeploys=1],
 ['production requested',f=>f.descriptor.pairedBuildResumeRequest.production=true]
])test('paired resume rejects '+name,()=>{const f=buildFixture();change(f);assert.throws(()=>validateBuiltArtifactResume(f.descriptor,f.build,f.receipt,f.blob));});
function disabledMailboxFixture(){
 const d={productSourceSha:'a'.repeat(40),productTreeAuthority:'b'.repeat(40),currentMailboxEnvironmentHold:{state:'HOLD_MAIL_UNCONFIGURED',sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),production:false}};
 const revision={metadata:{name:'dev-exact'},spec:{containers:[{env:[{name:'CXORBIA_RECOVERY_SOURCE_SHA',value:d.productSourceSha},{name:'CXORBIA_USER_MAILBOX_ENABLED',value:'false'},{name:'CXORBIA_USER_MAILBOX_SEND_ENABLED',value:'false'}]}]}};return {d,revision};
}
test('disabled mailbox readback retains E08 HOLD on the new exact source',()=>{
 const f=disabledMailboxFixture(),r=validateMailboxDisabledReadback(f.d,f.revision);assert.equal(r.mailDomainClosed,false);assert.equal(r.keyMounted,false);
});
test('disabled mailbox readback rejects enablement or any credential mount',()=>{
 for(const mode of ['enabled','key','source']){const f=disabledMailboxFixture(),e=f.revision.spec.containers[0].env;
 if(mode==='enabled')e[1].value='true';if(mode==='key')e.push({name:'CXORBIA_MAILBOX_CREDENTIAL_KEY_B64',valueFrom:{secretKeyRef:{name:'key',key:'1'}}});if(mode==='source')e[0].value='other';
 assert.throws(()=>validateMailboxDisabledReadback(f.d,f.revision));}
});
test('resumed runtime must match the exact already-built digest after deployment',()=>{
 const f=buildFixture(),proof=validateBuiltArtifactResume(f.descriptor,f.build,f.receipt,f.blob);
 const revision={metadata:{name:'dev-new'},status:{imageDigest:'gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@'+proof.runtimeDigest},spec:{containers:[{env:[{name:'CXORBIA_RECOVERY_SOURCE_SHA',value:proof.sourceSha}]}]}};
 assert.equal(validateResumedBuildRuntime(f.descriptor,proof,revision).builds,0);
 revision.status.imageDigest='gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@sha256:'+'9'.repeat(64);
 assert.throws(()=>validateResumedBuildRuntime(f.descriptor,proof,revision),/digest mismatch/);
});
