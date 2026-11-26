import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readGoogleQaExecution,f3Job,f3ConfigPath,f3FixturePath} from './cxorbia-i3-google-qa-execution.mjs';
import {summarizeGoogleF3Result,summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
import {assertF3EndpointScope} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
import {consumeGoogleF3Result} from './cxorbia-i3-automatic-result-consumer.mjs';
import {canonicalSha256,verifiedTypedReceipt} from './cxorbia-i3-scoped-clause-projection.mjs';
import {DESCRIPTOR,POINTER,jsonBytes,gitBlob,sha256} from './cxorbia-i3-current-control-projection.mjs';

const producer='1d86b1b1ce275be4aca56c883a32038458824f8a',repo='/repos/paulaosoriof86/demoCXOrbia',branch='recovery/cxorbia-phase-a-20260831';
const bucket='cxorbia-backend-dev_cloudbuild',id='5573055a-facf-48a5-8e80-2d9698b4c21b',generation='1795651400000000',resultGeneration='1795651500000000';
const prefix='gs://'+bucket+'/cxorbia-i3-qa/'+id,sourceBytes=new Map();
const at=file=>{if(!sourceBytes.has(file))sourceBytes.set(file,execFileSync('git',['show',producer+':'+file],{encoding:'utf8',maxBuffer:32*1024*1024}));return sourceBytes.get(file);};
const sha1=value=>createHash('sha1').update(value).digest('hex');

function nativeFixture(){
 const config=JSON.parse(at(f3ConfigPath)),manifest=JSON.parse(at(f3FixturePath));
 const expected={...config,controlSha:producer,transportSha:producer,remoteFixtureDigest:canonicalSha256(manifest)};
 const start={schemaVersion:'cxorbia.i3.google-qa-start.v1',provider:'GOOGLE_CLOUD_SHELL',project:'cxorbia-backend-dev',repository:'paulaosoriof86/demoCXOrbia',branch,job:f3Job,attempt:1,production:false,
  sourceSha:config.sourceSha,sourceTree:config.sourceTree,controlSha:producer,transportSha:producer};
 const startUri=prefix+'/start.json#'+generation,resultUri=prefix+'/result.json#'+resultGeneration;
 const f={config,manifest,expected,start,startUri,resultUri,archiveNames:['receipt.json']};
 f.read=(cmd,args)=>{
  if(cmd==='git')return (args.at(-1)==='HEAD'?producer:config.sourceTree)+'\n';
  assert.equal(cmd,'gcloud');const uri=args.find(x=>x.startsWith('gs://')),isStart=uri===startUri;
  assert.ok(isStart||uri===resultUri,'only the exact native objects are read');
  if(args[1]==='cat')return JSON.stringify(isStart?f.start:f.bundle)+'\n';
  return JSON.stringify({bucket,name:'cxorbia-i3-qa/'+id+'/'+(isStart?'start':'result')+'.json',generation:isStart?generation:resultGeneration,timeCreated:'2026-11-26T00:05:00Z'});
 };
 const ext=readGoogleQaExecution({CXORBIA_GOOGLE_QA_START:startUri},f3Job,config.sourceSha,config.sourceTree,f.read);
 f.raw={schemaVersion:'cxorbia.i3.f3.qa-endpoint.v1',state:'HOLD',decision:'HOLD_F3_ISOLATED_ENDPOINT',runId:generation,runAttempt:'1',qaOwner:'f3-qa-'+generation+'-1',
  ...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,config[k]])),controlSha:producer,externalExecution:ext,
  remoteFixtureDigest:expected.remoteFixtureDigest,syntheticOnly:true,productionWrites:0,operationalHrWrites:0,applicationAckProven:false,b14Closed:false,newModuleMatches:0,cases:[],events:[],cleanup:{firestore:false,auth:false,remoteMake:false},failure:'AUTH_FAILURE:F3_QA_SIGN_BLOB_PERMISSION'};
 f.refresh=()=>{f.text=JSON.stringify(f.raw);f.bundle={schemaVersion:'cxorbia.i3.google-f3-result.v1',startUri,archiveUri:prefix+'/evidence.zip#1795651490000000',archiveSha256:'e'.repeat(64),resultSha256:sha256(f.text),exitCode:1};};f.refresh();
 f.archive=(uri,digest)=>{assert.equal(uri,f.bundle.archiveUri);assert.equal(digest,f.bundle.archiveSha256);return {text:f.text,names:f.archiveNames};};
 f.summarize=()=>summarizeGoogleF3Result({uri:resultUri,expectedIdentity:expected},f.read,f.archive);
 return f;
}

test('F3 accepts a verified Google identity without fabricating Actions and rejects a copied identity',()=>{
 const f=nativeFixture(),env={CXORBIA_GOOGLE_QA_START:f.startUri,CXORBIA_F3_QA_ENDPOINT_GATE:'PAULA_AUTHORIZED_ISOLATED_F3_ENDPOINT_20261124',
  CXORBIA_F3_QA_BASE_URL:'https://cxorbia-backend-dev.web.app',GOOGLE_CLOUD_PROJECT:'cxorbia-backend-dev',
  ...Object.fromEntries(['SOURCE_SHA','SOURCE_TREE','RUNTIME_REVISION','RUNTIME_DIGEST','HOSTING_VERSION'].map((suffix,i)=>['CXORBIA_F3_QA_'+suffix,f.config[['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'][i]]]))};
 const ext=f.raw.externalExecution;
 assert.equal(assertF3EndpointScope(env,f.manifest,ext).owner,'f3-qa-'+generation+'-1');
 assert.throws(()=>assertF3EndpointScope(env,f.manifest,{...ext}),/F3_QA_GOOGLE_IDENTITY/);
 assert.throws(()=>assertF3EndpointScope(env,f.manifest),/UNVERIFIED_GOOGLE_IDENTITY/);
 assert.throws(()=>assertF3EndpointScope({...env,GITHUB_RUN_ID:generation},f.manifest,ext),/F3_QA_GOOGLE_IDENTITY/);
 assert.equal(Object.isFrozen(ext),true);
});
test('F3 Google HOLD is durably recordable with archive proof and no owner/domain promotion',()=>{
 const f=nativeFixture(),r=f.summarize();assert.equal(r.kind,'F3_ENDPOINT');assert.equal(r.state,'HOLD');assert.equal(r.newDomainMatches,0);assert.equal(r.provenance.archiveVerified,true);
 assert.equal(r.provenance.startGeneration,generation);assert.equal(r.provenance.resultGeneration,resultGeneration);assert.equal(r.provenance.artifactId,undefined);
 assert.throws(()=>summarizeTypedResult({resultText:f.text,transport:{},expectedIdentity:f.expected}),/GOOGLE_RESULT_REQUIRES_PROVIDER_VERIFICATION/);
});
for(const [name,alter] of [
 ['raw bytes',f=>{f.text+=' ';}],['wrong fixture',f=>{f.raw.remoteFixtureDigest='a'.repeat(64);f.refresh();}],
 ['wrong live pin',f=>{f.raw.runtimeRevision='cxorbia-live-hr-dev-00999-bad';f.refresh();}],
 ['different producer',f=>{f.start.controlSha='a'.repeat(40);}],
 ['different archive UUID',f=>{f.bundle.archiveUri=f.bundle.archiveUri.replace(id,'52baa293-43b7-44a3-b52c-bd4ae17b0e87');}],
 ['invented ACK without live readback',f=>{f.raw.applicationAckProven=true;f.refresh();}],
 ['role PASS without captures',f=>{f.raw.shopperRoleProof={decision:'PASS_F3_QA_SHOPPER_ROLE_SCOPED'};f.refresh();}]
])test('native F3 rejects '+name,()=>{const f=nativeFixture();alter(f);assert.throws(f.summarize);});

function consumerFixture(){
 const native=nativeFixture(),d=JSON.parse(at(DESCRIPTOR)),p=JSON.parse(at(POINTER));
 const paths=[DESCRIPTOR,POINTER,d.moduleTruthPath,d.findingsLedgerPath,d.currentCumulativeTaskEvidenceMap.path,
  'docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json',d.currentAutomationReceipt.path,
  f3ConfigPath,f3FixturePath,native.config.canonicalMaterializationReceiptPath,...d.currentFunctionalEvidenceIndex.results.map(x=>x.path)];
 const blobs=new Map(),tree=new Map();for(const file of paths){const bytes=at(file),hash=gitBlob(bytes);blobs.set(hash,bytes);tree.set(file,hash);}
 const treeSha=sha1(JSON.stringify([...tree])),trees=new Map([[treeSha,tree]]),commits=new Map([[producer,{sha:producer,tree:{sha:treeSha},parents:[]}]]);
 const f={...native,head:producer,mutations:[],patches:0,race:false};
 f.api=async(route,body,method)=>{
  if(body)f.mutations.push({route,body});
  if(route===repo+'/git/ref/heads/'+branch)return {object:{sha:f.head}};
  if(route.startsWith(repo+'/git/commits/'))return commits.get(route.split('/').at(-1));
  if(route.startsWith(repo+'/git/trees/'))return {truncated:false,tree:[...trees.get(route.split('/').at(-1).split('?')[0])].map(([path,sha])=>({path,sha,type:'blob'}))};
  if(route.startsWith(repo+'/git/blobs/'))return {content:Buffer.from(blobs.get(route.split('/').at(-1))).toString('base64')};
  if(route.startsWith(repo+'/compare/'))return {status:f.head===producer?'identical':'ahead',merge_base_commit:{sha:producer}};
  if(route===repo+'/git/blobs'){const hash=gitBlob(body.content);blobs.set(hash,body.content);return {sha:hash};}
  if(route===repo+'/git/trees'){const next=new Map(trees.get(body.base_tree));for(const x of body.tree)next.set(x.path,x.sha);const hash=sha1(JSON.stringify([...next]));trees.set(hash,next);return {sha:hash};}
  if(route===repo+'/git/commits'){const hash=sha1(JSON.stringify(body));commits.set(hash,{sha:hash,tree:{sha:body.tree},parents:body.parents.map(sha=>({sha}))});if(f.race)f.head='9'.repeat(40);return {sha:hash};}
  if(route===repo+'/git/refs/heads/'+branch){assert.equal(method,'PATCH');assert.equal(body.force,false);f.patches++;f.head=body.sha;return {object:{sha:f.head}};}
  throw Error('Unexpected route '+route);
 };
 f.bytes=file=>blobs.get(trees.get(commits.get(f.head).tree.sha).get(file));
 f.run=options=>consumeGoogleF3Result({api:f.api,uri:f.resultUri,expected:{controlSha:producer,transportSha:producer},readNative:f.read,readArchive:f.archive,...options});
 return f;
}
test('F3 dry run validates a complete control package with zero Git mutations',async()=>{
 const f=consumerFixture(),r=await f.run({dryRun:true});assert.equal(r.decision,'DRY_RUN_GOOGLE_F3_VALIDATED');assert.equal(f.mutations.length,0);
 const d=JSON.parse(r.files.get(DESCRIPTOR)),p=JSON.parse(r.files.get(POINTER));
 assert.deepEqual(d.currentFunctionalEvidenceIndex,p.currentFunctionalEvidenceIndex);assert.deepEqual(d.postDeployRunSeal,JSON.parse(at(DESCRIPTOR)).postDeployRunSeal);
 const e=d.currentFunctionalEvidenceIndex.results.at(-1);assert.equal(e.key,'GOOGLE_CLOUD_SHELL/'+generation);assert.equal(e.kind,'F3_ENDPOINT');assert.equal(e.runId,undefined);
 assert.doesNotThrow(()=>verifiedTypedReceipt(e,r.files.get(e.path),{gitBlob,sha256}));
});
test('F3 native receipt publishes with CAS/readback and an exact replay makes no write',async()=>{
 const f=consumerFixture(),r=await f.run();assert.equal(r.decision,'CONSUMED_GOOGLE_F3_SCOPED_RESULT');assert.equal(f.patches,1);
 const d=JSON.parse(f.bytes(DESCRIPTOR));assert.deepEqual(d.currentAutomationReceipt,JSON.parse(at(DESCRIPTOR)).currentAutomationReceipt);
 const before=f.mutations.length,head=f.head,again=await f.run();assert.equal(again.decision,'NOOP_ALREADY_CONSUMED');assert.equal(f.head,head);assert.equal(f.mutations.length,before);
});
test('F3 changed replay and interleaved writer cannot advance the ref',async()=>{
 const f=consumerFixture();await f.run();const before=f.mutations.length;f.raw.failure='AUTH_FAILURE:DIFFERENT';f.refresh();
 await assert.rejects(f.run(),/GOOGLE_F3_REPLAY_CHANGED/);assert.equal(f.mutations.length,before);
 const raced=consumerFixture();raced.race=true;await assert.rejects(raced.run(),/CAS_HEAD_CHANGED/);assert.equal(raced.patches,0);
});
