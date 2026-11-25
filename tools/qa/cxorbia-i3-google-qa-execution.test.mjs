import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readGoogleQaExecution} from './cxorbia-i3-google-qa-execution.mjs';

const bucket='cxorbia-backend-dev_cloudbuild',id='5573055a-facf-48a5-8e80-2d9698b4c21b';
const name='cxorbia-i3-qa/'+id+'/start.json',generation='1795603001000000';
const env={CXORBIA_GOOGLE_QA_START:'gs://'+bucket+'/'+name+'#'+generation};
const job='i3-finance-focal-reproof',source='a'.repeat(40),tree='b'.repeat(40),control='c'.repeat(40);
const start={schemaVersion:'cxorbia.i3.google-qa-start.v1',provider:'GOOGLE_CLOUD_SHELL',project:'cxorbia-backend-dev',
  repository:'paulaosoriof86/demoCXOrbia',branch:'recovery/cxorbia-phase-a-20260831',job,attempt:1,production:false,
  transportSha:control,controlSha:control,sourceSha:source,sourceTree:tree};
function reader(marker=start,metadata={bucket,name,generation,timeCreated:'2026-11-25T10:40:00Z'}){
  return (cmd,args)=>cmd==='git'?(args.at(-1)==='HEAD'?control:tree)+'\n':args[1]==='cat'?JSON.stringify(marker)+'\n':JSON.stringify(metadata);
}
test('uses immutable marker generation and preserves actual bytes and producer identity',()=>{
 const x=readGoogleQaExecution(env,job,source,tree,reader());
 assert.equal(x.provider,'GOOGLE_CLOUD_SHELL');assert.equal(x.runId,generation);assert.equal(x.controlSha,control);
 assert.equal(x.startSha256,createHash('sha256').update(JSON.stringify(start)+'\n').digest('hex'));
});
test('regular workflow uses its existing transport',()=>assert.equal(readGoogleQaExecution({},job,source,tree),null));
for(const [field,value] of [['project','other'],['branch','main'],['production',true],['attempt',2],['sourceSha','d'.repeat(40)],['sourceTree','d'.repeat(40)],['controlSha','d'.repeat(40)],['job','other']]){
 test('rejects different '+field,()=>assert.throws(()=>readGoogleQaExecution(env,job,source,tree,reader({...start,[field]:value}))));
}
test('rejects another object generation and mixed provenance',()=>{
 assert.throws(()=>readGoogleQaExecution(env,job,source,tree,reader(start,{bucket,name,generation:'2',timeCreated:'today'})));
 assert.throws(()=>readGoogleQaExecution({...env,GITHUB_RUN_ID:'1234'},job,source,tree,reader()));
});

import {summarizeGoogleFinanceResult,summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
const digest = text => createHash('sha256').update(text).digest('hex');
function resultFixture(){
  const startBytes=JSON.stringify(start)+'\n',resultUri=env.CXORBIA_GOOGLE_QA_START.replace('start.json','result.json').replace(generation,'1795603001001000');
  const expected={sourceSha:source,sourceTree:tree,controlSha:control,transportSha:control,runtimeRevision:'cxorbia-live-hr-dev-00391-8mg',runtimeDigest:'sha256:'+'d'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/511061474d07baca'};
  const raw={externalExecution:readGoogleQaExecution(env,job,source,tree,reader()),schemaVersion:'cxorbia.i3.finance-core-ui-readonly.v1',
    runId:generation,runAttempt:1,decision:'HOLD_C09_C10_UI_READONLY',state:'HOLD',operationKind:'READ_ONLY_WITH_APP_MUTATIONS_BLOCKED',sourceSha:source,sourceTree:tree,
    controlSha:control,stage:'DEPENDENCIES',privateDataExposed:false,production:false,phaseAComplete:false,fullDomain:false,newDomainMatches:0,
    paymentsTested:false,benefitsRetested:false,dashboardIndependentHrKpisCertified:false,automaticHrReconciliationProven:false};
  const resultText=JSON.stringify(raw),identityReadbackText='{}';
  const bundle={schemaVersion:'cxorbia.i3.google-finance-result.v1',startUri:env.CXORBIA_GOOGLE_QA_START,exitCode:1,resultText,
    resultSha256:digest(resultText),identityReadbackText,sealSha256:digest(identityReadbackText)};
  const read=(cmd,args)=>{
    if(cmd==='git')return reader()(cmd,args);
    const uri=args.find(x=>x.startsWith('gs://'));
    if(uri===env.CXORBIA_GOOGLE_QA_START)return args[1]==='cat'?startBytes:reader()(cmd,args);
    if(uri!==resultUri)throw Error('unrecognized object');
    return args[1]==='cat'?JSON.stringify(bundle):JSON.stringify({bucket,name:name.replace('start.json','result.json'),generation:'1795603001001000',timeCreated:'2026-11-25T10:45:00Z'});
  };
  return {resultUri,expected,raw,bundle,read};
}
test('imports a Google HOLD with independent object reads and no invented Actions IDs',()=>{
  const f=resultFixture(),s=summarizeGoogleFinanceResult({uri:f.resultUri,expectedIdentity:f.expected},f.read);
  assert.equal(s.decision,'RECORDED_TYPED_RESULT_HOLD');assert.equal(s.provenance.provider,'GOOGLE_CLOUD_SHELL');
  assert.equal(s.provenance.resultUri,f.resultUri);assert.equal(s.provenance.resultSha256,f.bundle.resultSha256);
  assert.equal(s.provenance.artifactId,undefined);assert.equal(s.provenance.jobId,undefined);
  assert.throws(()=>summarizeTypedResult({resultText:f.bundle.resultText,expectedIdentity:f.expected,transport:{}}),/GOOGLE_RESULT_REQUIRES_PROVIDER_VERIFICATION/);
});
for(const [name,alter] of [
  ['unbound transport revision',f=>{f.expected.transportSha='e'.repeat(40);}],
  ['altered receipt bytes',f=>{f.bundle.resultText+=' ';}],
  ['altered sibling seal',f=>{f.bundle.identityReadbackText+=' ';}],
  ['mismatched start',f=>{f.bundle.startUri=f.bundle.startUri.replace(id,'52baa293-43b7-44a3-b52c-bd4ae17b0e87');}],
  ['overstated UI evidence',f=>{f.raw.decision='PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE';f.bundle.resultText=JSON.stringify(f.raw);f.bundle.resultSha256=digest(f.bundle.resultText);}]
]){
  test('rejects '+name,()=>{const f=resultFixture();alter(f);assert.throws(()=>summarizeGoogleFinanceResult({uri:f.resultUri,expectedIdentity:f.expected},f.read));});
}
