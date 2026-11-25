import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {findNewerDevProviderReceipt,validatePendingDevSuccessor} from './cxorbia-i3-shock-continuity-guard.mjs';
import {hasExactExecutionSuccessor,validateSealedExecutionAuthority,validateCurrentAuthorityAliases} from './cxorbia-i3-current-authority-alias-guard.mjs';

const descriptorPath='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const hash=(kind,bytes)=>createHash(kind).update(bytes).digest('hex');
const bytes=value=>JSON.stringify(value,null,2)+'\n';
// Native readback admission has independent tests. These fixtures exercise the
// persisted guard against real Git objects, including exact producer/predecessor
// blobs, rather than returning a magic blob for every requested path.
function fixture(t,{sameSource=false}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-native-authority-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const git=args=>execFileSync('git',['-C',dir,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
 const write=(name,value)=>{fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true});fs.writeFileSync(path.join(dir,name),typeof value==='string'?value:bytes(value));};
 const commit=message=>{git(['add','.']);git(['-c','user.name=CXOrbia guard test','-c','user.email=guard-test@example.invalid','commit','-qm',message]);return git(['rev-parse','HEAD']).trim();};
 git(['init','-q']);write('app/index.js','previous source\n');const previousSource=commit('previous source'),previousTree=git(['rev-parse','HEAD^{tree}']).trim();
 write('app/index.js','current source\n');const currentSource=commit('current source'),sourceSha=sameSource?previousSource:currentSource,sourceTree=sameSource?previousTree:git(['rev-parse','HEAD^{tree}']).trim();
 const priorPath='docs/checkpoints/CXORBIA_I3_ACTIONS_PREDECESSOR.json';
 const predecessor={runId:50,runAttempt:1,runNumber:5,sourceSha:previousSource,sourceTree:previousTree,runtimeRevision:'runtime-prior',runtimeDigest:'sha256:'+'1'.repeat(64),hostingVersion:'hosting-prior',hostingRelease:'release-prior',artifactDigest:'sha256:'+'2'.repeat(64),production:false,materializationReceiptPath:priorPath};
 const priorReceipt={source:{sha:previousSource,tree:previousTree},materialization:predecessor};write(priorPath,priorReceipt);
 const priorBlob=git(['hash-object',priorPath]).trim(),priorSeal={...predecessor,mode:'PREDECESSOR_SERVING_PENDING_SOURCE',receiptPath:priorPath,receiptBlob:priorBlob};
 const producer={productSourceSha:sourceSha,productSourceTree:sourceTree,productTreeAuthority:sourceTree,currentMaterialization:predecessor,postDeployRunSeal:priorSeal};
 producer.pendingDevSuccessor={state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'RUNTIME_AND_HOSTING',sourceSha,sourceTree,devPublished:false,production:false,servingRuntimeSeal:priorSeal,servingPairedMaterialization:predecessor};
 const workflowPath='.github/workflows/cxorbia-recovery-i3-dev-certification.yml',workflowRaw='jobs:\n  vrm154-156-dev-materialization:\n    runs-on: ubuntu-latest\n';write(workflowPath,workflowRaw);
 const workflow={path:workflowPath,job:'vrm154-156-dev-materialization',gitBlob:git(['hash-object',workflowPath]).trim(),sha256:hash('sha256',workflowRaw)};
 const step={args:['tools/qa/cxorbia-i3-paired-source-checks.sh'],entrypoint:'bash',id:'vrm154-156-dev-materialization',name:'synthetic/paired-runner@sha256:'+'a'.repeat(64)};
 producer.pendingDevSuccessor.pairedCloudBuild={location:'us-central1',serviceAccount:'projects/cxorbia-backend-dev/serviceAccounts/firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com',workflow,step,sourceObject:{bucket:'cxorbia-backend-dev_cloudbuild',name:'cxorbia-i3/source.tgz',generation:'1795610001000000',size:100,sha256:'5'.repeat(64)}};
 write(descriptorPath,producer);const controlHead=commit('exact producer request'),requestRaw=git(['show',controlHead+':'+descriptorPath]);
 const id='5573055a-facf-48a5-8e80-2d9698b4c21b',bucket='cxorbia-backend-dev_cloudbuild';
 const object=(name,generation,sha256)=>({bucket,name,generation,size:100,sha256,uri:`gs://${bucket}/${name}#${generation}`});
 const executionBinding={executionProvider:'GOOGLE_CLOUD_BUILD',runId:id,runAttempt:1,runNumber:null,project:'cxorbia-backend-dev',location:'us-central1',resourceName:`projects/cxorbia-backend-dev/locations/us-central1/builds/${id}`,serviceAccount:'projects/cxorbia-backend-dev/serviceAccounts/firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com',stepId:'vrm154-156-dev-materialization',jobConclusion:'success',producerControlHead:controlHead,sourceSha,sourceTree,request:{path:descriptorPath,field:'pendingDevSuccessor',gitBlob:git(['rev-parse',controlHead+':'+descriptorPath]).trim(),sha256:hash('sha256',requestRaw)},predecessorReceiptPath:priorPath,predecessorReceiptBlob:priorBlob,predecessorExecution:{provider:'GITHUB_ACTIONS',runId:'50',runAttempt:1},startedAt:'2026-11-25T12:00:00Z',completedAt:'2026-11-25T12:05:00Z',buildMetadataSha256:'3'.repeat(64),nativeLogsSha256:'4'.repeat(64),sourceObject:object('cxorbia-i3/source.tgz','1795610001000000','5'.repeat(64)),evidenceObject:object('cxorbia-i3/evidence.zip','1795610001002000','6'.repeat(64)),artifactManifest:{uri:`gs://${bucket}/cxorbia-i3/${id}/artifacts-${id}.json#1795610001003000`,sha256:'7'.repeat(64)},artifactDigest:'sha256:'+'6'.repeat(64),nativeBuildVerified:true,scope:'I3_PAIRED_DEV',production:false};
 const materialization={executionProvider:'GOOGLE_CLOUD_BUILD',runId:id,runAttempt:1,runNumber:null,sourceSha,sourceTree,artifactDigest:executionBinding.artifactDigest,executionBinding,runtimeRevision:'runtime-google',runtimeDigest:'sha256:'+'8'.repeat(64),hostingVersion:'hosting-google',hostingRelease:'release-google',production:false};
 Object.assign(executionBinding,{workflow,nativeStepSha256:hash('sha256',JSON.stringify(step))});
 const receiptPath=`docs/checkpoints/CXORBIA_I3_GOOGLE_BUILD_${id}_AUTOMATIC_DEV_RECEIPT.json`;
 materialization.materializationReceiptPath=receiptPath;
 const receipt={schemaVersion:'cxorbia.i3.current-source-dev-materialization.v1',executionProvider:'GOOGLE_CLOUD_BUILD',runId:id,runAttempt:1,runNumber:null,executionBinding,decision:'PASS_I3_GTHN_EXACT_DEV_MATERIALIZATION',source:{sha:sourceSha,tree:sourceTree},materialization,production:false,state:'HOLD',succession:{expectedControlHead:controlHead,predecessorReceiptPath:priorPath,predecessorReceiptBlob:priorBlob,predecessorExecution:executionBinding.predecessorExecution}};
 write(receiptPath,receipt);commit('immutable native receipt');
 const receiptBlob=git(['rev-parse','HEAD:'+receiptPath]).trim(),seal={...materialization,receiptPath,receiptBlob,mode:'CURRENT_SOURCE_SERVING'};
 return {dir,gitRead:git,write,commit,producer,controlHead,priorSeal,predecessor,receiptPath,receipt,seal,sourceSha,sourceTree};
}

test('UUID native witness reveals a stale Actions seal through its exact predecessor',t=>{
 const f=fixture(t),witness={path:f.receiptPath,value:f.receipt};
 assert.equal(findNewerDevProviderReceipt({sourceSha:f.sourceSha,sealedRunId:50,sealedExecution:f.priorSeal,receipts:[witness],gitRead:f.gitRead}),witness);
});
test('native receipt identity cannot be selected by clock, numeric coercion, or missing binding',t=>{
 const f=fixture(t);
 for(const mutate of [r=>{r.succession.predecessorReceiptBlob='a'.repeat(40);},r=>{r.materialization.executionBinding.nativeLogsSha256='';},r=>{r.succession.expectedControlHead='a'.repeat(40);},r=>{delete r.materialization.executionProvider;}]){
  const receipt=structuredClone(f.receipt);mutate(receipt);receipt.observedAt='2999-01-01T00:00:00Z';
  assert.equal(findNewerDevProviderReceipt({sourceSha:f.sourceSha,sealedRunId:50,sealedExecution:f.priorSeal,receipts:[{path:f.receiptPath,value:receipt}],gitRead:f.gitRead}),undefined);
 }
 assert.equal(findNewerDevProviderReceipt({sourceSha:f.sourceSha,sealedRunId:f.seal.runId,sealedExecution:f.seal,receipts:[{path:f.receiptPath,value:f.receipt}],gitRead:f.gitRead}),undefined);
});
test('canonical execution guard accepts full committed native binding while retaining HOLD',t=>{
 const f=fixture(t),result=validateSealedExecutionAuthority({seal:f.seal,receipt:f.receipt,aliases:[structuredClone(f.seal),structuredClone(f.receipt.materialization)],gitRead:f.gitRead});
 assert.equal(result.pass,true,JSON.stringify(result));assert.equal(f.receipt.state,'HOLD');
});
for(const [name,mutate]of [
 ['same UUID under Actions provider',x=>{x.alias.executionProvider='GITHUB_ACTIONS';}],
 ['different native object generation',x=>{x.alias.executionBinding.evidenceObject.generation='1795610001009999';}],
 ['missing native log digest',x=>{delete x.receipt.materialization.executionBinding.nativeLogsSha256;}],
 ['unbound native verification flag',x=>{x.receipt.materialization.executionBinding={nativeBuildVerified:true};}],
 ['producer request drift',x=>{x.receipt.materialization.executionBinding.request.sha256='a'.repeat(64);}],
 ['producer source archive drift',x=>{x.receipt.materialization.executionBinding.sourceObject.sha256='a'.repeat(64);}],
 ['predecessor receipt drift',x=>{x.receipt.succession.predecessorReceiptBlob='a'.repeat(40);}],
 ['late receipt after changed materialization',x=>{x.receipt.succession.expectedControlHead='a'.repeat(40);}]
])test('canonical execution guard rejects '+name,t=>{
 const f=fixture(t),x={receipt:structuredClone(f.receipt),alias:structuredClone(f.seal)};mutate(x);
 assert.equal(validateSealedExecutionAuthority({seal:f.seal,receipt:x.receipt,aliases:[x.alias],gitRead:f.gitRead}).pass,false);
});
test('Actions ordering remains numeric; foreign ordering requires immutable causal evidence',t=>{
 const f=fixture(t);
 assert.equal(hasExactExecutionSuccessor({candidate:{runId:51},seal:{runId:50}}),true);
 assert.equal(hasExactExecutionSuccessor({candidate:{runId:49},seal:{runId:50}}),false);
 assert.equal(hasExactExecutionSuccessor({candidate:f.receipt.materialization,receipt:f.receipt,seal:f.priorSeal,gitRead:f.gitRead}),true);
 const swapped={...f.priorSeal,executionProvider:'GOOGLE_CLOUD_BUILD',runId:'ffffffff-ffff-ffff-ffff-ffffffffffff'};
 assert.equal(hasExactExecutionSuccessor({candidate:f.receipt.materialization,receipt:f.receipt,seal:swapped,gitRead:f.gitRead}),false);
});

test('later native failed-HR evidence uses exact predecessor and remains a HOLD blocker',t=>{
 const f=fixture(t,{sameSource:true}),failurePath='docs/checkpoints/CXORBIA_I3_GOOGLE_HR_FAILURE.json';
 const proof={...f.receipt.materialization,succession:f.receipt.succession,classification:'PROVIDER_FAILURE',state:'HOLD',decision:'HOLD_HR_READ_FAILED',production:false};
 f.write(failurePath,proof);f.commit('immutable native failed HR observation');
 const residual={...proof,receiptPath:failurePath,receiptBlob:f.gitRead(['rev-parse','HEAD:'+failurePath]).trim()};
 const descriptor={productSourceSha:f.sourceSha,productSourceTree:f.sourceTree,postDeployRunSeal:{...f.priorSeal,mode:'CURRENT_SOURCE_SERVING'}};
 const ledger={findings:{},currentMaterialization:{...f.predecessor,hrLiveVerified:true}};
 const matrix={modules:[{currentDevStage:'HR_FAILED',currentResidualEvidence:residual}]},pointer={};
 const input={descriptor,pointer,ledger,matrix,gitRead:f.gitRead},code='CURRENT_MODULE_HR_FAILURE_WITHOUT_NEWER_EVIDENCE';
 assert.equal(validateCurrentAuthorityAliases(input).failures.includes(code),false);
 residual.succession={...residual.succession,predecessorReceiptBlob:'a'.repeat(40)};
 assert.equal(validateCurrentAuthorityAliases(input).failures.includes(code),true);
 assert.equal(proof.state,'HOLD');assert.equal(proof.production,false);
});

test('numeric native resource requires pinned Google project metadata',t=>{
 const f=fixture(t),receipt=structuredClone(f.receipt),seal=structuredClone(f.seal);
 for(const b of [receipt.executionBinding,receipt.materialization.executionBinding,seal.executionBinding])Object.assign(b,{projectNumber:'123456789',projectMetadataSha256:'9'.repeat(64),resourceName:`projects/123456789/locations/us-central1/builds/${seal.runId}`});
 assert.equal(validateSealedExecutionAuthority({seal,receipt,gitRead:f.gitRead}).pass,true);
 delete receipt.materialization.executionBinding.projectMetadataSha256;
 assert.equal(validateSealedExecutionAuthority({seal,receipt,gitRead:f.gitRead}).pass,false);
});

test('pending source after native paired receipt permits null Actions runNumber only with exact native binding',t=>{
 const f=fixture(t),proofPath='docs/checkpoints/CXORBIA_I3_SOURCE_PROOF.json',scopePath='docs/checkpoints/CXORBIA_I3_SOURCE_SCOPE.json';
 f.write('app/index.js','bounded next source\n');const newSource=f.commit('bounded source successor'),newTree=f.gitRead(['rev-parse',newSource+'^{tree}']).trim();
 const scope={allowedProductFiles:['app/index.js']};f.write(scopePath,scope);f.commit('source scope');
 const proof={sourceSha:newSource,sourceTree:newTree,predecessorProductSourceSha:f.sourceSha,sourceTestsPass:2,sourceTestsFail:0,allowedProductFiles:['app/index.js'],allowedTestFiles:[],findings:[{priority:'P0_PROVEN'}],production:false,scopeReceiptPath:scopePath,scopeReceiptBlob:f.gitRead(['rev-parse','HEAD:'+scopePath]).trim()};
 f.write(proofPath,proof);f.commit('bounded source proof');
 const seal={...f.seal,mode:'PREDECESSOR_SERVING_PENDING_SOURCE'},pending={...proof,state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'RUNTIME_AND_HOSTING',devPublished:false,rulesDeploys:0,storageRulesDeploys:0,proofReceiptPath:proofPath,proofReceiptBlob:f.gitRead(['rev-parse','HEAD:'+proofPath]).trim(),servingPairedMaterialization:f.receipt.materialization,servingRuntimeSeal:seal};
 const descriptor={productSourceSha:newSource,productTreeAuthority:newTree,currentMaterialization:f.receipt.materialization,postDeployRunSeal:seal,pendingDevSuccessor:pending},pointer={postDeployRunSeal:seal,currentDevMaterialization:f.receipt.materialization,pendingDevSuccessor:pending},matrix={productSource:{sha:newSource,authorityState:'SOURCE_ONLY_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV'}};
 const gitRead=f.gitRead,gitAncestor=(before,after)=>{try{gitRead(['merge-base','--is-ancestor',before,after]);return true;}catch{return false;}};
 const result=validatePendingDevSuccessor({descriptor,pointer,matrix,gitBlob:p=>f.gitRead(['rev-parse','HEAD:'+p]).trim(),gitRead,gitAncestor});
 assert.equal(result.pass,true,JSON.stringify(result));
 descriptor.currentMaterialization.executionBinding.nativeLogsSha256='';
 assert.equal(validatePendingDevSuccessor({descriptor,pointer,matrix,gitBlob:p=>f.gitRead(['rev-parse','HEAD:'+p]).trim(),gitRead,gitAncestor}).pass,false);
});
