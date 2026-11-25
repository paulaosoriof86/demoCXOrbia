import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {consumeGoogleMaterialization} from './cxorbia-i3-automatic-result-consumer.mjs';
import {DESCRIPTOR,POINTER,jsonBytes,gitBlob,sha256} from './cxorbia-i3-current-control-projection.mjs';

const repo='/repos/paulaosoriof86/demoCXOrbia',branch='recovery/cxorbia-phase-a-20260831',root=path.resolve(import.meta.dirname,'../..');
const buildId='56b76a83-3e5d-4957-99aa-2521a9c51845',location='us-central1',project='cxorbia-backend-dev',bucket=project+'_cloudbuild';
const digest=x=>createHash('sha1').update(x).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));

// A full in-memory Git object/ref service exercises the real loader, projector,
// writer and readback. No HTTP, gcloud, Auth, Firestore or browser is invoked.
function fixture({configured=true,wrongWorkflowPin=false}={}){
 const d=read(DESCRIPTOR),p=read(POINTER),originalHead='c'.repeat(40),workflowPath='.github/workflows/cxorbia-recovery-i3-dev-certification.yml',workflowBytes=fs.readFileSync(path.join(root,workflowPath),'utf8');
 const sourceBytes=Buffer.from('synthetic immutable source archive'),sourceObject={bucket,name:'cxorbia-i3/source/approved.tgz',generation:'1795610001000000',size:sourceBytes.length,sha256:sha256(sourceBytes)};
 const config={location,serviceAccount:`projects/${project}/serviceAccounts/firebase-adminsdk-fbsvc@${project}.iam.gserviceaccount.com`,
  sourceObject,
  workflow:{path:workflowPath,job:'vrm154-156-dev-materialization',gitBlob:gitBlob(workflowBytes),sha256:sha256(workflowBytes)},
  step:{id:'vrm154-156-dev-materialization',name:'synthetic/paired-runner@sha256:'+'a'.repeat(64),entrypoint:'bash',args:['tools/qa/cxorbia-i3-paired-source-checks.sh']}};
 if(wrongWorkflowPin)config.workflow.gitBlob='9'.repeat(40);
 if(configured)d.pendingDevSuccessor.pairedCloudBuild=config;else delete d.pendingDevSuccessor.pairedCloudBuild;
 p.pendingDevSuccessor=structuredClone(d.pendingDevSuccessor);
 const contents=new Map([[DESCRIPTOR,jsonBytes(d)],[POINTER,jsonBytes(p)],[workflowPath,workflowBytes],
  [d.currentAutomationReceipt.path,fs.readFileSync(path.join(root,d.currentAutomationReceipt.path),'utf8')],
  [d.moduleTruthPath,jsonBytes(read(d.moduleTruthPath))],[d.findingsLedgerPath,jsonBytes(read(d.findingsLedgerPath))]]);
 const blobs=new Map(),tree=new Map();for(const [file,bytes]of contents){const id=gitBlob(bytes);blobs.set(id,bytes);tree.set(file,id);}
 const firstTree=digest(JSON.stringify([...tree])),trees=new Map([[firstTree,tree]]),commits=new Map([[originalHead,{sha:originalHead,tree:{sha:firstTree},parents:[]}]]);
 const f={head:originalHead,originalHead,descriptor:d,contents,blobs,trees,commits,mutations:[],patches:0,race:false};
 f.api=async(route,body,method)=>{
  assert.ok(route.startsWith(repo+'/'));
  if(body){f.mutations.push({route,method,body});}
  if(route===repo+'/git/ref/heads/'+branch)return {object:{sha:f.head}};
  if(route.startsWith(repo+'/git/commits/')){const commit=commits.get(route.split('/').at(-1));assert.ok(commit,'known commit');return commit;}
  if(route.startsWith(repo+'/git/trees/')){const value=trees.get(route.split('/').at(-1).split('?')[0]);assert.ok(value);return {truncated:false,tree:[...value].map(([path,sha])=>({path,sha,type:'blob',mode:'100644'}))};}
  if(route.startsWith(repo+'/git/blobs/')){const value=blobs.get(route.split('/').at(-1));assert.equal(typeof value,'string');return {content:Buffer.from(value).toString('base64'),encoding:'base64'};}
  if(route.startsWith(repo+'/compare/'))return {status:f.head===originalHead?'identical':'ahead',merge_base_commit:{sha:originalHead}};
  if(route.includes('/actions/workflows/'))return {workflow_runs:[]};
  if(route===repo+'/git/blobs'){const sha=gitBlob(body.content);blobs.set(sha,body.content);return {sha};}
  if(route===repo+'/git/trees'){
   const next=new Map(trees.get(body.base_tree));for(const item of body.tree)next.set(item.path,item.sha);
   const sha=digest(JSON.stringify([...next]));trees.set(sha,next);return {sha};
  }
  if(route===repo+'/git/commits'){
   const sha=digest(JSON.stringify(body));commits.set(sha,{sha,tree:{sha:body.tree},parents:body.parents.map(sha=>({sha}))});
   if(f.race)f.head='9'.repeat(40);return {sha};
  }
  if(route===repo+'/git/refs/heads/'+branch){assert.equal(method,'PATCH');assert.equal(body.force,false);f.patches++;f.head=body.sha;return {object:{sha:f.head}};}
  throw Error('Unexpected fake API route '+route);
 };
 f.currentBytes=file=>blobs.get(trees.get(commits.get(f.head).tree.sha).get(file));
 f.assets=Object.fromEntries(Array.from({length:20},(_,i)=>['core/test-'+i+'.js','e'.repeat(64)]));
 f.result={decision:'PASS_I3_GTHN_EXACT_DEV_MATERIALIZATION',executionProvider:'GOOGLE_CLOUD_BUILD',runId:buildId,runAttempt:1,
  sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,runtimeRevision:'cxorbia-live-hr-dev-00999-test',runtimeDigest:'sha256:'+'f'.repeat(64),
  hostingVersion:'sites/cxorbia-backend-dev/versions/test',hostingRelease:'sites/cxorbia-backend-dev/channels/live/releases/test',hrRevision:'b'.repeat(64),
  servedSha256:f.assets,verifiedServedAssetCount:20,sourceHostedExact:true,runtimeTrafficExact:true,productionUnchanged:true,scenarioDimensionsProven:true,
  production:false,builds:1,runtimeDeploys:1,hostingDeploys:1,storageRulesDeploys:0,firestoreRulesDeploys:0,hrWrites:0};
 const hr={decision:'PASS_EXCEL_CANONICAL_ID_READONLY',executionProvider:'GOOGLE_CLOUD_BUILD',runId:buildId,runAttempt:1,
  ...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,f.result[k]])),revision:f.result.hrRevision,
  production:false,fullDomain:false,firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0};
 f.source=sourceBytes;
 f.archive=execFileSync('python3',['-c',`import io,json,sys,zipfile
d=json.load(sys.stdin);b=io.BytesIO()
with zipfile.ZipFile(b,'w') as z:
 for p,v in d.items(): z.writestr(p,json.dumps(v))
sys.stdout.buffer.write(b.getvalue())`],{input:JSON.stringify({'result.json':f.result,'hr-after/result.json':hr}),maxBuffer:2*1024*1024});
 f.expected={controlSha:originalHead,sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,serviceAccount:config.serviceAccount,step:config.step,workflow:config.workflow,
  stepId:'vrm154-156-dev-materialization',request:{path:DESCRIPTOR,field:'pendingDevSuccessor',gitBlob:gitBlob(contents.get(DESCRIPTOR)),sha256:sha256(contents.get(DESCRIPTOR))},
  predecessorReceiptPath:d.postDeployRunSeal.receiptPath,predecessorReceiptBlob:d.postDeployRunSeal.receiptBlob,
  predecessorExecution:{provider:'GITHUB_ACTIONS',runId:String(d.currentMaterialization.runId),runAttempt:d.currentMaterialization.runAttempt||1},
  sourceObject,
  evidenceObject:{bucket,name:`cxorbia-i3/${buildId}/evidence.zip`,generation:'1795610001002000',size:f.archive.length,sha256:sha256(f.archive)}};
 const e=f.expected;
 f.build={id:buildId,name:`projects/${project}/locations/${location}/builds/${buildId}`,projectId:project,status:'SUCCESS',serviceAccount:e.serviceAccount,
  startTime:'2026-11-25T12:00:00Z',finishTime:'2026-11-25T12:05:00Z',steps:[{...structuredClone(config.step),status:'SUCCESS',timing:{startTime:'2026-11-25T12:00:05Z',endTime:'2026-11-25T12:04:50Z'}}],
  substitutions:{_CXORBIA_SCOPE:'I3_PAIRED_DEV',_CXORBIA_CONTROL_SHA:e.controlSha,_CXORBIA_SOURCE_SHA:e.sourceSha,_CXORBIA_SOURCE_TREE:e.sourceTree,_CXORBIA_REQUEST_BLOB:e.request.gitBlob,_CXORBIA_PREDECESSOR_BLOB:e.predecessorReceiptBlob},
  sourceProvenance:{resolvedStorageSource:{bucket,object:e.sourceObject.name,generation:e.sourceObject.generation}},
  results:{artifactManifest:`gs://${bucket}/cxorbia-i3/${buildId}/artifacts-${buildId}.json`}};
 const objectUri=pin=>`gs://${pin.bucket}/${pin.name}#${pin.generation}`;
 f.manifest=[{location:objectUri(e.evidenceObject),file_hash:{type:2,value:createHash('md5').update(f.archive).digest('base64')}}];
 f.logs='Native Cloud Build log\n';f.nativeCalls=[];
 f.readNative=(cmd,args)=>{
  f.nativeCalls.push([cmd,args]);assert.equal(cmd,'gcloud');
  if(args[0]==='builds')return args[1]==='describe'?JSON.stringify(f.build):f.logs;
  const uri=args.find(x=>x.startsWith('gs://')),source=uri===objectUri(e.sourceObject),archive=uri===objectUri(e.evidenceObject);
  assert.ok(source||archive||uri===f.build.results.artifactManifest||uri===f.build.results.artifactManifest+'#1795610001003000');
  if(args[1]==='cat')return source?f.source:archive?f.archive:JSON.stringify(f.manifest);
  const pin=source?e.sourceObject:archive?e.evidenceObject:{bucket,name:f.build.results.artifactManifest.slice(('gs://'+bucket+'/').length),generation:'1795610001003000',size:JSON.stringify(f.manifest).length};
  return JSON.stringify({...pin,size:String(pin.size),timeCreated:source?'2026-11-25T11:59:00Z':'2026-11-25T12:04:55Z'});
 };
 f.run=options=>consumeGoogleMaterialization({api:f.api,buildId,location,expected:f.expected,readNative:f.readNative,assetReader:()=>f.assets,treeReader:()=>d.productSourceTree,now:'2026-11-25T13:00:00Z',...options});
 return f;
}

test('Google dry-run verifies native evidence and all four controls without making a Git mutation',async()=>{
 const f=fixture(),out=await f.run({dryRun:true});assert.equal(out.decision,'DRY_RUN_GOOGLE_RECEIPT_VALIDATED');assert.equal(f.mutations.length,0);assert.equal(f.head,f.originalHead);
 const d=JSON.parse(out.files.get(DESCRIPTOR)),p=JSON.parse(out.files.get(POINTER)),m=JSON.parse(out.files.get(d.moduleTruthPath)),l=JSON.parse(out.files.get(d.findingsLedgerPath));
 for(const value of [d,p,m,l]){assert.equal(value.actionsScanCursor.runId,String(f.descriptor.postDeployRunSeal.runId));assert.equal(value.postDeployRunSeal.runId,buildId);assert.equal(value.state,'HOLD');}
 assert.equal(d.currentAutomationReceipt.executionProvider,'GOOGLE_CLOUD_BUILD');assert.equal(d.currentRuntimeBinding.provider,'excel_online');
 assert.equal(d.currentAutomationReceipt.succession.predecessorReceiptBlob,f.descriptor.currentAutomationReceipt.gitBlob);
 assert.equal(out.productActions,0);assert.ok(f.nativeCalls.every(([,args])=>['builds','storage'].includes(args[0])));
});
test('Google receipt commits with one guarded ref update, readback and exact no-op replay',async()=>{
 const f=fixture(),out=await f.run();assert.equal(out.decision,'CONSUMED_EXACT_DEV_MATERIALIZATION');assert.equal(f.patches,1);assert.notEqual(f.head,f.originalHead);
 const stored=f.currentBytes(out.receiptPath),d=JSON.parse(f.currentBytes(DESCRIPTOR));assert.equal(d.postDeployRunSeal.receiptBlob,gitBlob(stored));
 const before=f.mutations.length,head=f.head,replay=await f.run();assert.equal(replay.decision,'NOOP_ALREADY_CONSUMED');assert.equal(f.head,head);assert.equal(f.mutations.length,before);
});
test('divergent native replay cannot rewrite the stored Google receipt',async()=>{
 const f=fixture(),out=await f.run(),before=f.mutations.length,bytes=f.currentBytes(out.receiptPath);f.logs+='Different log evidence\n';
 await assert.rejects(f.run(),/REPLAY_RECEIPT_CHANGED/);assert.equal(f.mutations.length,before);assert.equal(f.currentBytes(out.receiptPath),bytes);
});
test('wrong producer request blob or predecessor prevents any native read and Git mutation',async()=>{
 for(const key of ['request','predecessorReceiptBlob']){
  const f=fixture();if(key==='request')f.expected.request.gitBlob='9'.repeat(40);else f.expected[key]='9'.repeat(40);
  await assert.rejects(f.run(),/GOOGLE_PRODUCER_EXPECTED_BINDING/);assert.equal(f.nativeCalls.length,0);assert.equal(f.mutations.length,0);
 }
});
test('an unpublished paired Google configuration fails closed without inventing a producer step',async()=>{
 const f=fixture({configured:false});await assert.rejects(f.run(),/GOOGLE_PAIRED_CONFIGURATION_UNPROVEN/);assert.equal(f.nativeCalls.length,0);assert.equal(f.mutations.length,0);
});
test('paired step remains bound to exact bytes of the existing producer workflow',async()=>{
 const f=fixture({wrongWorkflowPin:true});await assert.rejects(f.run(),/GOOGLE_PAIRED_WORKFLOW_BINDING/);assert.equal(f.nativeCalls.length,0);assert.equal(f.mutations.length,0);
});
test('a different native executable cannot reuse a successful step name',async()=>{
 const f=fixture();f.build.steps[0].args=['different-script.sh'];await assert.rejects(f.run(),/SOURCE_FAILURE/);assert.equal(f.mutations.length,0);
});
test('Cloud Build success with a failed paired step does not reach the Git writer',async()=>{
 const f=fixture();f.build.steps[0].status='FAILURE';await assert.rejects(f.run(),/GOOGLE_PAIRED_NATIVE_STEP/);assert.equal(f.mutations.length,0);
});
test('interleaved control writer stops the Google CAS without any ref update',async()=>{
 const f=fixture();f.race=true;await assert.rejects(f.run(),/CAS_HEAD_CHANGED/);assert.equal(f.patches,0);assert.equal(f.head,'9'.repeat(40));
});
