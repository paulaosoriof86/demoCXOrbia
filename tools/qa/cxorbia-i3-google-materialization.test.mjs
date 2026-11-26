import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readGooglePairedArchive} from './cxorbia-i3-google-qa-execution.mjs';
import {makeMaterializationReceipt,projectMaterialization,bindControlPaths,readBoundedF3CellProof,validateProjectionRegistry,executionProviderOf,actionsCursorOf,DESCRIPTOR,POINTER,jsonBytes,gitBlob} from './cxorbia-i3-current-control-projection.mjs';

const root=path.resolve(import.meta.dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const id='5573055a-facf-48a5-8e80-2d9698b4c21b',project='cxorbia-backend-dev',bucket=project+'_cloudbuild',location='us-central1';
function fixture(){
 const descriptor=read(DESCRIPTOR),controls={head:'c'.repeat(40),descriptor,pointer:read(POINTER),ledger:read(descriptor.findingsLedgerPath),matrix:read(descriptor.moduleTruthPath)};
 const sourceAssets=Object.fromEntries(Array.from({length:20},(_,i)=>['core/asset'+i+'.js','e'.repeat(64)]));
 const result={decision:'PASS_I3_GTHN_EXACT_DEV_MATERIALIZATION',executionProvider:'GOOGLE_CLOUD_BUILD',runId:id,runAttempt:1,sourceSha:descriptor.productSourceSha,sourceTree:descriptor.productSourceTree,runtimeRevision:'cxorbia-live-hr-dev-00999-test',runtimeDigest:'sha256:'+'f'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/test',hostingRelease:'sites/cxorbia-backend-dev/channels/live/releases/test',hrRevision:'b'.repeat(64),servedSha256:{...sourceAssets},verifiedServedAssetCount:20,sourceHostedExact:true,runtimeTrafficExact:true,productionUnchanged:true,scenarioDimensionsProven:true,production:false,builds:1,runtimeDeploys:1,hostingDeploys:1,storageRulesDeploys:0,firestoreRulesDeploys:0,hrWrites:0};
 const hrResult={decision:'PASS_EXCEL_CANONICAL_ID_READONLY',executionProvider:'GOOGLE_CLOUD_BUILD',runId:id,runAttempt:1,...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,result[k]])),revision:result.hrRevision,production:false,fullDomain:false,firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0};
 const source=Buffer.from('synthetic immutable source archive'),expected={controlSha:controls.head,sourceSha:descriptor.productSourceSha,sourceTree:descriptor.productSourceTree,serviceAccount:'projects/'+project+'/serviceAccounts/firebase-adminsdk-fbsvc@'+project+'.iam.gserviceaccount.com',stepId:'vrm154-156-dev-materialization',request:{path:DESCRIPTOR,field:'pendingDevSuccessor',gitBlob:gitBlob(fs.readFileSync(path.join(root,DESCRIPTOR),'utf8')),sha256:hash(fs.readFileSync(path.join(root,DESCRIPTOR)))},workflow:{path:'.github/workflows/cxorbia-recovery-i3-dev-certification.yml',job:'vrm154-156-dev-materialization',gitBlob:gitBlob(fs.readFileSync(path.join(root,'.github/workflows/cxorbia-recovery-i3-dev-certification.yml'),'utf8')),sha256:hash(fs.readFileSync(path.join(root,'.github/workflows/cxorbia-recovery-i3-dev-certification.yml')))},predecessorReceiptPath:descriptor.postDeployRunSeal.receiptPath,predecessorReceiptBlob:descriptor.postDeployRunSeal.receiptBlob,predecessorExecution:{provider:executionProviderOf(descriptor.currentMaterialization),runId:String(descriptor.currentMaterialization.runId),runAttempt:Number(descriptor.currentMaterialization.runAttempt||1)},sourceObject:{bucket,name:'cxorbia-i3/source/approved.tgz',generation:'1795610001000000',size:source.length,sha256:hash(source)}};
 expected.step={id:expected.stepId,name:'gcr.io/google.com/cloudsdktool/google-cloud-cli:stable',entrypoint:'bash',args:['-euo','pipefail','-c','bash tools/qa/cxorbia-i3-paired-dev-seal.sh verify']};
 const f={controls,sourceAssets,result,hrResult,expected,source,calls:[]};
 f.rebuild=()=>{
  f.archive=execFileSync('python3',['-c',`import io,json,sys,zipfile
d=json.load(sys.stdin);b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:
 for p,v in d.items(): z.writestr(p,json.dumps(v))
sys.stdout.buffer.write(b.getvalue())`,],{input:JSON.stringify(f.entries||{'result.json':f.result,'hr-after/result.json':f.hrResult}),maxBuffer:2*1024*1024});
  expected.evidenceObject={bucket,name:'cxorbia-i3/'+id+'/dev-evidence.zip',generation:'1795610001002000',size:f.archive.length,sha256:hash(f.archive)};
  f.manifest=[{location:'gs://'+bucket+'/'+expected.evidenceObject.name+'#'+expected.evidenceObject.generation,file_hash:{type:2,value:createHash('md5').update(f.archive).digest('base64')}}];
 };
 f.rebuild();
 f.build={id,name:`projects/${project}/locations/${location}/builds/${id}`,projectId:project,status:'SUCCESS',serviceAccount:expected.serviceAccount,startTime:'2026-11-25T12:00:00Z',finishTime:'2026-11-25T12:05:00Z',steps:[{...structuredClone(expected.step),status:'SUCCESS',timing:{startTime:'2026-11-25T12:00:05Z',endTime:'2026-11-25T12:04:50Z'}}],substitutions:{_CXORBIA_SCOPE:'I3_PAIRED_DEV',_CXORBIA_CONTROL_SHA:expected.controlSha,_CXORBIA_SOURCE_SHA:expected.sourceSha,_CXORBIA_SOURCE_TREE:expected.sourceTree,_CXORBIA_REQUEST_BLOB:expected.request.gitBlob,_CXORBIA_PREDECESSOR_BLOB:expected.predecessorReceiptBlob},sourceProvenance:{resolvedStorageSource:{bucket,object:expected.sourceObject.name,generation:expected.sourceObject.generation}},results:{artifactManifest:'gs://'+bucket+'/cxorbia-i3/'+id+'/artifacts-'+id+'.json'}};
 f.logs='Native Google execution log\n';
 f.reader=(cmd,args)=>{
  f.calls.push([cmd,args]);assert.equal(cmd,'gcloud');
  if(args[0]==='projects')return JSON.stringify({projectId:project,projectNumber:'123456789012'});
  if(args[0]==='builds')return args[1]==='describe'?JSON.stringify(f.build):f.logs;
  assert.equal(args[0],'storage');const uri=args.find(x=>x.startsWith('gs://'));
  const sourceUri='gs://'+bucket+'/'+expected.sourceObject.name+'#'+expected.sourceObject.generation,evidenceUri='gs://'+bucket+'/'+expected.evidenceObject.name+'#'+expected.evidenceObject.generation;
  const isSource=uri===sourceUri,isEvidence=uri===evidenceUri,isManifest=uri===f.build.results.artifactManifest||uri===f.build.results.artifactManifest.split('#')[0]+'#1795610001003000';
  assert.ok(isSource||isEvidence||isManifest,'unrecognized object '+uri);
  if(args[1]==='cat')return isSource?f.source:isEvidence?f.archive:JSON.stringify(f.manifest);
  const pin=isSource?expected.sourceObject:isEvidence?expected.evidenceObject:{bucket,name:f.build.results.artifactManifest.split('#')[0].slice(('gs://'+bucket+'/').length),generation:'1795610001003000',size:JSON.stringify(f.manifest).length};
  return JSON.stringify({bucket:pin.bucket,name:pin.name,generation:pin.generation,size:String(pin.size),timeCreated:isSource?'2026-11-25T11:59:00Z':'2026-11-25T12:04:55Z',...(f.metadataOverride||{})});
 };
 return f;
}
function admitted(f=fixture()){
 const download=readGooglePairedArchive({buildId:id,location,expected:f.expected},f.reader);
 try{
  const result=JSON.parse(fs.readFileSync(path.join(download.folder,'result.json'))),hrResult=JSON.parse(fs.readFileSync(path.join(download.folder,'hr-after/result.json')));
  const bundle=makeMaterializationReceipt({externalExecution:download.externalExecution,result,hrResult,sourceAssets:f.sourceAssets,verifiedArchiveDigest:download.digest});
  bundle.receipt.succession.expectedControlHead=f.controls.head;
  return {f,bundle};
 }finally{download.cleanup();}
}
function projected(f=fixture()){
 const {bundle}=admitted(f),out=projectMaterialization(f.controls,{...bundle,matrixPath:'RECOVERY-I3-MODULE-TRUTH-MATRIX-20261125-V999.json',ledgerPath:'CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V999_2026-11-25.json'});
 bindControlPaths(out,{matrixPath:out.matrixPath,ledgerPath:out.ledgerPath});return {f,bundle,out};
}

test('Google native UUID receipt is admitted without fabricated Actions IDs; exact paired readback stays HOLD',()=>{
 const {f,bundle,out}=projected(),r=bundle.receipt;
 assert.equal(r.runId,id);assert.equal(r.executionProvider,'GOOGLE_CLOUD_BUILD');
 for(const k of ['jobId','artifactId','workflowRunId'])assert.equal(Object.hasOwn(r,k),false);
 assert.equal(r.archiveDigestVerified,true);assert.equal(r.terminalCertified,false);assert.equal(r.phaseAComplete,false);assert.equal(r.newDomainMatches,0);
 assert.equal(out.descriptor.currentRuntimeBinding.provider,'excel_online');assert.equal(out.descriptor.currentRuntimeBinding.executionProvider,'GOOGLE_CLOUD_BUILD');
 const cursor=actionsCursorOf(f.controls.descriptor);
 for(const name of ['descriptor','pointer','matrix','ledger'])assert.deepEqual(out[name].actionsScanCursor,cursor);
 assert.deepEqual(out.matrix.modules.filter(x=>x.classification==='MATCH').map(x=>x.domain),f.controls.matrix.modules.filter(x=>x.classification==='MATCH').map(x=>x.domain));
 assert.deepEqual(out.descriptor.currentC3PreterminalAudit,f.controls.descriptor.currentC3PreterminalAudit);
 assert.equal(validateProjectionRegistry(out).pass,true,JSON.stringify(validateProjectionRegistry(out)));
 assert.ok(f.calls.every(([,args])=>args[0]==='projects'&&args[1]==='describe'&&args[2]===project||args[0]==='builds'&&['describe','log'].includes(args[1])||args[0]==='storage'&&['objects','cat'].includes(args[1])));
});
test('exact Google replay is NOOP and altered bytes cannot mutate the serving receipt',()=>{
 const {out,bundle}=projected();out.head='d'.repeat(40);
 assert.equal(projectMaterialization(out,bundle).noop,true);
 const changed=structuredClone(bundle);changed.receipt.observedAt='2026-11-25T12:06:00Z';
 assert.throws(()=>projectMaterialization(out,changed),/REPLAY_RECEIPT_CHANGED/);
});
for(const [name,change]of [
 ['project',f=>{f.build.projectId='different';}],
 ['build status',f=>{f.build.status='FAILURE';}],
 ['relevant step',f=>{f.build.steps[0].status='FAILURE';}],
 ['service identity',f=>{f.build.serviceAccount='projects/other/serviceAccounts/other@other.iam.gserviceaccount.com';}],
 ['request source',f=>{f.build.substitutions._CXORBIA_SOURCE_SHA='9'.repeat(40);}],
 ['request binding',f=>{f.build.substitutions._CXORBIA_REQUEST_BLOB='9'.repeat(40);}],
 ['resolved archive generation',f=>{f.build.sourceProvenance.resolvedStorageSource.generation='1795610001009999';}],
 ['artifact byte hash',f=>{f.archive=Buffer.concat([f.archive,Buffer.from('tamper')]);}],
 ['object metadata generation',f=>{f.metadataOverride={generation:'1795610001009999'};}],
 ['object time window',f=>{f.metadataOverride={timeCreated:'2026-11-26T12:00:00Z'};}],
 ['native artifact manifest',f=>{f.manifest[0].location=f.manifest[0].location.replace('2000','9999');}],
 ['native MD5',f=>{f.manifest[0].file_hash.value='invalid';}],
 ['native logs absent',f=>{f.logs='';}],
 ['executed command',f=>{f.build.steps[0].args=['-c','echo fake'];}],
 ['step failure bypass',f=>{f.build.steps[0].allowFailure=true;}],
 ['extra native step',f=>{f.build.steps.push({...f.build.steps[0],id:'unreviewed'});}],
 ['global execution override',f=>{f.build.options={env:['NODE_OPTIONS=override']};}],
 ['native manifest pinned generation',f=>{f.build.results.artifactManifest+='#1795610001009999';}],
 ['missing workflow binding',f=>{delete f.expected.workflow;}],
 ['unverified numeric project resource',f=>{f.build.name=`projects/999999999999/locations/${location}/builds/${id}`;}]
])test('Google receipt rejects '+name+' before projection',()=>{const f=fixture();change(f);assert.throws(()=>admitted(f),/SOURCE_FAILURE/);});
for(const [name,change]of [
 ['unpaired Hosting',f=>{f.result.sourceHostedExact=false;f.rebuild();}],
 ['runtime traffic',f=>{f.result.runtimeTrafficExact=false;f.rebuild();}],
 ['missing served asset',f=>{delete f.result.servedSha256['core/asset19.js'];f.result.verifiedServedAssetCount=19;f.rebuild();}],
 ['HR executor',f=>{f.hrResult.executionProvider='GITHUB_ACTIONS';f.rebuild();}],
 ['HR revision',f=>{f.hrResult.revision='9'.repeat(64);f.rebuild();}],
 ['fake Actions artifact',f=>{f.result.artifactId=123;f.rebuild();}]
])test('native build success cannot bypass '+name,()=>{const f=fixture();change(f);assert.throws(()=>admitted(f),/(SOURCE_FAILURE|RELEASE_COMPOSITION_FAILURE)/);});
for(const [name,change]of [
 ['control HEAD',x=>{x.f.controls.head='9'.repeat(40);}],
 ['predecessor blob',x=>{x.bundle.receipt.succession.predecessorReceiptBlob='9'.repeat(40);}],
 ['predecessor provider',x=>{const previous=x.bundle.receipt.succession.predecessorExecution;previous.provider=previous.provider==='GOOGLE_CLOUD_BUILD'?'GITHUB_ACTIONS':'GOOGLE_CLOUD_BUILD';}],
 ['request binding',x=>{x.bundle.receipt.executionBinding.predecessorReceiptBlob='9'.repeat(40);}]
])test('external materialization requires exact succession '+name,()=>{const x=admitted();change(x);assert.throws(()=>projectMaterialization(x.f.controls,x.bundle),/EXTERNAL_SUCCESSION/);});
test('external provider without preserved Actions cursor fails closed',()=>{
 assert.throws(()=>actionsCursorOf({postDeployRunSeal:{executionProvider:'GOOGLE_CLOUD_BUILD',runId:id}}),/REQUIRES_ACTIONS_CURSOR/);
 assert.throws(()=>actionsCursorOf({postDeployRunSeal:{runId:id}}),/REQUIRES_ACTIONS_CURSOR/);
 assert.equal(executionProviderOf({provider:'excel_online'}),'GITHUB_ACTIONS');
});
test('conflicting technical provider tags cannot route an external receipt into Actions',()=>{
 assert.throws(()=>executionProviderOf({executionProvider:'GITHUB_ACTIONS',provider:'GOOGLE_CLOUD_BUILD'}),/CONFLICTING_EXECUTION_PROVIDER/);
 assert.throws(()=>executionProviderOf({executionProvider:'GOOGLE_CLOUD_BUILD',provider:'GOOGLE_CLOUD_SHELL'}),/CONFLICTING_EXECUTION_PROVIDER/);
 assert.equal(executionProviderOf({executionProvider:'GOOGLE_CLOUD_BUILD',provider:'excel_online'}),'GOOGLE_CLOUD_BUILD');
});
test('provider/cursor mismatches are rejected by the shared four-control registry',()=>{
 const {out}=projected();out.pointer.postDeployRunSeal.executionProvider='GITHUB_ACTIONS';out.ledger.actionsScanCursor.runId='123';
 const failed=validateProjectionRegistry(out);assert.equal(failed.pass,false);assert.ok(failed.failures.some(x=>x.includes('executionProvider')));assert.ok(failed.failures.some(x=>x.includes('actionsScanCursor')));
});
test('raw self-reported native verification cannot replace independent provider readback',()=>{
 const f=fixture();assert.throws(()=>makeMaterializationReceipt({externalExecution:{executionProvider:'GOOGLE_CLOUD_BUILD',nativeBuildVerified:true},result:f.result,hrResult:f.hrResult,sourceAssets:f.sourceAssets,verifiedArchiveDigest:'sha256:'+f.expected.evidenceObject.sha256}),/NATIVE_PROVENANCE_REQUIRED/);
});
test('native serializers retain exact project-number resource, manifest generation and nested MD5',()=>{
 const f=fixture();f.build.name=`projects/123456789012/locations/${location}/builds/${id}`;
 f.build.results.artifactManifest+='#1795610001003000';
 const md5=createHash('md5').update(f.archive).digest('base64');
 f.manifest[0].file_hash=[{fileHash:[{type:'MD5',value:Buffer.from(md5).toString('base64')}]}];
 const {bundle}=admitted(f),binding=bundle.receipt.executionBinding;
 assert.equal(binding.resourceName,f.build.name);assert.equal(binding.projectNumber,'123456789012');
 assert.match(binding.projectMetadataSha256,/^[a-f0-9]{64}$/);
 assert.equal(binding.artifactManifest.uri,f.build.results.artifactManifest);
 assert.deepEqual(binding.workflow,f.expected.workflow);assert.match(binding.nativeStepSha256,/^[a-f0-9]{64}$/);
});
test('ambiguous native MD5s cannot be merged to accept a partly matching manifest',()=>{
 const f=fixture();f.manifest[0].file_hash=[f.manifest[0].file_hash,{type:2,value:'0'.repeat(32)}];
 assert.throws(()=>admitted(f),/NATIVE_ARTIFACT_HASH/);
});
test('independently verified native binding cannot be mutated before receipt creation',()=>{
 const f=fixture(),download=readGooglePairedArchive({buildId:id,location,expected:f.expected},f.reader);
 try{assert.throws(()=>{download.externalExecution.request.gitBlob='9'.repeat(40);},TypeError);}finally{download.cleanup();}
});
test('return to Actions requires exact Google predecessor and advances only the Actions cursor',()=>{
 const {f,out}=projected();out.head='d'.repeat(40);
 const runId=Number(actionsCursorOf(out.descriptor).runId)+1,run={id:runId,run_number:3000,run_attempt:1,head_sha:out.head,head_branch:'recovery/cxorbia-phase-a-20260831',path:'.github/workflows/cxorbia-recovery-i3-dev-certification.yml'};
 const job={id:123,run_id:runId,run_attempt:1,conclusion:'success',started_at:'2026-11-25T13:00:00Z',completed_at:'2026-11-25T13:05:00Z'};
 const artifact={id:456,name:`cxorbia-vrm154-156-dev-materialization-${runId}-1`,workflow_run:{id:runId,head_sha:run.head_sha},created_at:'2026-11-25T13:04:59Z',digest:'sha256:'+'9'.repeat(64)};
 const result={...f.result,runId},hrResult={...f.hrResult,runId};delete result.executionProvider;delete hrResult.executionProvider;
 const predecessorExecution={provider:'GOOGLE_CLOUD_BUILD',runId:id,runAttempt:1},predecessorReceiptPath=out.descriptor.postDeployRunSeal.receiptPath,predecessorReceiptBlob=out.descriptor.postDeployRunSeal.receiptBlob;
 const executionBinding={executionProvider:'GITHUB_ACTIONS',producerControlHead:run.head_sha,request:{path:DESCRIPTOR,field:'pendingDevSuccessor',gitBlob:'b'.repeat(40),sha256:'c'.repeat(64)},predecessorReceiptPath,predecessorReceiptBlob,predecessorExecution};
 const args={run,job,artifact,result,hrResult,sourceAssets:f.sourceAssets,verifiedArchiveDigest:artifact.digest};
 assert.throws(()=>projectMaterialization(out,makeMaterializationReceipt(args)),/EXTERNAL_SUCCESSION/);
 const bundle=makeMaterializationReceipt({...args,succession:{expectedControlHead:out.head,predecessorReceiptPath,predecessorReceiptBlob,predecessorExecution,executionBinding}});
 const next=projectMaterialization(out,{...bundle,matrixPath:'RECOVERY-I3-MODULE-TRUTH-MATRIX-20261125-V1000.json',ledgerPath:'CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V1000_2026-11-25.json'});
 assert.equal(next.descriptor.currentMaterialization.executionProvider,'GITHUB_ACTIONS');
 for(const name of ['descriptor','pointer','ledger','matrix'])assert.equal(String(next[name].actionsScanCursor.runId),String(runId));
 assert.deepEqual(next.descriptor.currentC3PreterminalAudit,f.controls.descriptor.currentC3PreterminalAudit);
});

function scopedCellFixture(){
 const f=fixture(), producer='d'.repeat(40), receiptBlob='b'.repeat(40), hash='b'.repeat(64);
 const typed={provider:'GOOGLE_CLOUD_SHELL',kind:'F3_ENDPOINT',key:'GOOGLE_CLOUD_SHELL/1999999999999901',
  path:'docs/checkpoints/CXORBIA_I3_GOOGLE_F3_1795704378174692_TYPED_RESULT.json',gitBlob:receiptBlob,controlHead:producer};
 const scoped={path:'docs/checkpoints/CXORBIA_I3_F3_1795704069979393_BOUNDED_MAKE_WINDOW_AND_CLEANUP_20261126.json',
  gitBlob:'a'.repeat(40),sha256:hash,typedResultKey:typed.key,typedResultPath:typed.path,typedResultBlob:typed.gitBlob,
  taskId:'B14',terminalTaskPass:false,fullB14:false,fullF3:false,production:false};
 const d08={path:'docs/checkpoints/CXORBIA_I3_GOOGLE_D08_REQUEST.json',gitBlob:'e'.repeat(40),production:false};
 for(const o of [f.controls.descriptor,f.controls.pointer,f.controls.ledger,f.controls.matrix])o.currentF3BoundedCellEvidence=structuredClone(scoped);
 for(const o of [f.controls.descriptor,f.controls.pointer]){
  o.currentFunctionalEvidenceIndex={...o.currentFunctionalEvidenceIndex,results:[...(o.currentFunctionalEvidenceIndex?.results||[]),typed]};
  o.currentD08UiQaRequest=structuredClone(d08);
 }
 const domains=['canonical-hr-state-adapters','persistence-command-ack-boundary'];
 const pending=['Retain proven GT L2 scenarios bound to the predecessor.','Complete external-origin conflict and echo.'];
 for(const domain of domains){
  const mod=f.controls.matrix.modules.find(m=>m.domain===domain);
  mod.currentF3BoundedCellEvidence=structuredClone(scoped);mod.currentResidualClauses=[...pending];
 }
 return {f,scoped,typed,d08,domains,pending};
}
test('paired materialization retains the scoped GT cell receipt and both HR residuals after D08 is bound',()=>{
 const {f,scoped,typed,d08,domains,pending}=scopedCellFixture();
 const {out}=projected(f);
 for(const domain of domains){
  const mod=out.matrix.modules.find(m=>m.domain===domain);
  assert.deepEqual(mod.currentResidualClauses,pending);
  assert.deepEqual(mod.currentF3BoundedCellEvidence,scoped);
  assert.equal(mod.actionRequired,pending.join(' '));
 }
 assert.equal(out.descriptor.nextExactAction.includes(pending[0]),true);
 assert.deepEqual(out.descriptor.currentD08UiQaRequest,d08);
 assert.deepEqual(out.pointer.currentD08UiQaRequest,d08);
 assert.equal(out.descriptor.currentFunctionalEvidenceIndex.results.filter(e=>e.key===typed.key).length,1);
 assert.equal(out.descriptor.authorizationI4===true,false);
});

test('paired projection rejects mismatched exact F3 evidence and module references',()=>{
 const {f}=scopedCellFixture();
 f.controls.pointer.currentF3BoundedCellEvidence.gitBlob='e'.repeat(40);
 assert.throws(()=>projected(f),/F3_BOUNDED_CELL_EVIDENCE_BINDING/);
 const second=scopedCellFixture();
 const mod=second.f.controls.matrix.modules.find(m=>m.domain==='canonical-hr-state-adapters');
 mod.currentF3BoundedCellEvidence.typedResultBlob='f'.repeat(40);
 assert.throws(()=>projected(second.f),/F3_BOUNDED_CELL_MODULE_BINDING/);
});

test('the current authority guard reads the exact scoped evidence bytes and rejects tampering',()=>{
 const {f,scoped,typed,domains}=scopedCellFixture(), controls=f.controls;
 const identity={sourceSha:'c'.repeat(40),sourceTree:'d'.repeat(40),runtimeRevision:'test-revision',hostingVersion:'test-version'};
 const acceptanceBindingSha256='a'.repeat(64);
 const seal={nativeStartGeneration:typed.key.split('/')[1],nativeResultGeneration:'1999999999999902',
  nativeResult:{sourceAndRuntime:{observed:identity},path:typed.path,baselineRevision:'base',restoredRevision:'base'},
  independentAudit:{windowDefects:[],physicalPatchRequests:2,replayAndRejectedPhysicalPatches:0,remoteCleanupVerified:true},
  businessProcessAcceptance:{originalTaskId:'B14',frozenAcceptanceBindingSha256:acceptanceBindingSha256,
   ownerDomains:domains,wholeOriginalTaskComplete:false},b14Closed:false,fullF3Closed:false,production:false};
 const owners=[controls.descriptor,controls.pointer,controls.matrix,controls.ledger,...controls.matrix.modules.filter(m=>domains.includes(m.domain))];
 const bind=bytes=>{
  const ref={...scoped,...identity,acceptanceBindingSha256,nativeResultGeneration:seal.nativeResultGeneration,
   gitBlob:gitBlob(bytes),sha256:createHash('sha256').update(bytes).digest('hex')};
  for(const owner of owners)owner.currentF3BoundedCellEvidence=structuredClone(ref);
  return ref;
 };
 const bytes=jsonBytes(seal), ref=bind(bytes);
 assert.deepEqual(readBoundedF3CellProof(controls,()=>Buffer.from(bytes)),ref);
 assert.throws(()=>readBoundedF3CellProof(controls,()=>bytes+' '),/F3_BOUNDED_CELL_RECEIPT_BYTES/);
 const promoted=jsonBytes({...seal,fullF3Closed:true});bind(promoted);
 assert.throws(()=>readBoundedF3CellProof(controls,()=>promoted),/F3_BOUNDED_CELL_RECEIPT_SCOPE/);
 delete controls.descriptor.currentF3BoundedCellEvidence;
 assert.throws(()=>readBoundedF3CellProof(controls),/F3_BOUNDED_CELL_EVIDENCE_BINDING/);
});
