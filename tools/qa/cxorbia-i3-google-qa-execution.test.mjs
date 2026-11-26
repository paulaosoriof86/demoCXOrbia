import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {readGoogleQaExecution} from './cxorbia-i3-google-qa-execution.mjs';
import {academyHrObserver,verifyAcademyHrObservation} from './cxorbia-i3-google-qa-execution.mjs';

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

import {financeHrOwnerCode} from './cxorbia-i3-finance-ui-readonly.mjs';
test('HR diagnostic retains only an owner-defined code and strips all dynamic detail',()=>{
  assert.equal(financeHrOwnerCode('HR_LIVE_REVISION_READBACK_HTTP_503'),'HR_LIVE_REVISION_READBACK_HTTP_503');
  assert.equal(financeHrOwnerCode('HR_LIVE_VISIT_PERIOD_MISSING_private'),'HR_LIVE_VISIT_PERIOD_MISSING');
  assert.equal(financeHrOwnerCode('PRIVATE_ACCOUNT_OR_PROVIDER'),'OTHER');
  assert.equal(financeHrOwnerCode(''),'NO_OWNER_ERROR');
});

function googleArchiveShellFixture({producerStatus=13,readbackStatus=47}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'google-finance-archive-')),out=path.join(root,'out'),publicOut=path.join(out,'ui-readonly'),objects=path.join(root,'objects');
 fs.mkdirSync(path.join(root,'tools/qa'),{recursive:true});fs.mkdirSync(publicOut,{recursive:true});fs.mkdirSync(objects);
 const entry='private-session-0-movements-pdf.envelope.json',ciphertext=JSON.stringify({version:1,algorithm:'RSA-OAEP-SHA256+AES-256-GCM',key:'SYNTHETIC_WRAPPED_KEY',iv:'SYNTHETIC_IV',tag:'SYNTHETIC_TAG',ciphertext:'SYNTHETIC_CIPHERTEXT',plainSha256:'9'.repeat(64)})+'\n';
 fs.writeFileSync(path.join(publicOut,entry),ciphertext);
 const raw={privateDataExposed:false,decision:'HOLD_C09_C10_UI_READONLY',error:'FUNCTIONAL_DEFECT:C09_C10_EXPORT_PDF_CONTENT',failurePdf:{privateEvidence:{entry,sha256:digest(ciphertext),plainSha256:'9'.repeat(64),encrypted:true,algorithm:'RSA-OAEP-SHA256+AES-256-GCM'}}};
 fs.writeFileSync(path.join(publicOut,'finance-ui-readonly.json'),JSON.stringify(raw));
 fs.writeFileSync(path.join(root,'tools/qa/cxorbia-i3-finance-focal-execute.sh'),'exit '+producerStatus+'\n');
 fs.writeFileSync(path.join(root,'tools/qa/cxorbia-i3-finance-current-readback.sh'),'exit '+readbackStatus+'\n');
 const source=fs.readFileSync(new URL('./cxorbia-i3-finance-google-transport.sh',import.meta.url),'utf8'),tail=source.slice(source.indexOf('status=0\n'));
 const prefix='gs://'+bucket+'/cxorbia-i3-qa/'+id;
 const stub='put(){ local src="$1" dest="$2"; cp "$src" "$TEST_OBJECTS/$(basename "$dest")"; printf "%s#1795603001002000\\n" "$dest"; }\n';
 const script=path.join(root,'transport-tail.sh');fs.writeFileSync(script,'set -Eeuo pipefail\n'+stub+'prefix="$TEST_PREFIX"\n'+tail);
 const run=spawnSync('bash',[script],{cwd:root,encoding:'utf8',env:{PATH:process.env.PATH,FINAL_FOCAL_OUT:out,FOCAL_SOURCE:sourceShaForTest(),CXORBIA_GOOGLE_QA_START:env.CXORBIA_GOOGLE_QA_START,TEST_PREFIX:prefix,TEST_OBJECTS:objects}});
 return {root,objects,entry,ciphertext,raw,run,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
function sourceShaForTest(){return source;}
test('failed identity readback cannot discard an existing PDF failure or replace its original exit code',()=>{
 const f=googleArchiveShellFixture();try{
  assert.equal(f.run.status,13,f.run.stderr);assert.equal(fs.existsSync(path.join(f.objects,'result.json')),true);
  assert.equal(fs.readFileSync(path.join(f.objects,f.entry),'utf8'),f.ciphertext);
  const bundle=JSON.parse(fs.readFileSync(path.join(f.objects,'result.json'),'utf8')),raw=JSON.parse(bundle.resultText),seal=JSON.parse(bundle.identityReadbackText);
  assert.equal(bundle.exitCode,13);assert.equal(raw.error,f.raw.error);assert.equal(seal.decision,'HOLD_CURRENT_FINANCE_DEV_IDENTITY_READBACK');
  assert.equal(seal.readbackExitCode,47);assert.notEqual(seal.runtimeTrafficExact,true);assert.notEqual(seal.hostingBeforeAfterSame,true);
  assert.equal(bundle.encryptedPdfObjects.length,1);assert.equal(bundle.encryptedPdfObjects[0].entry,f.entry);
  assert.equal(bundle.encryptedPdfObjects[0].sha256,digest(f.ciphertext));assert.match(bundle.encryptedPdfObjects[0].uri,/#1795603001002000$/);
 }finally{f.cleanup();}
});

function encryptedResultFixture(){
 const f=resultFixture(),entry='private-session-0-movements-pdf.envelope.json',generation='1795603001002000';
 f.envelope={version:1,algorithm:'RSA-OAEP-SHA256+AES-256-GCM',plainSha256:'9'.repeat(64),key:'DO_NOT_STORE_WRAPPED_KEY',iv:'DO_NOT_STORE_IV',tag:'DO_NOT_STORE_TAG',ciphertext:'DO_NOT_STORE_CIPHERTEXT'};
 f.envelopeBytes=JSON.stringify(f.envelope)+'\n';f.envelopeUri=f.resultUri.replace(/result\.json#\d+$/,entry+'#'+generation);
 f.raw.stage='SESSION_1_MOVEMENT_EXPORT';f.raw.error='FUNCTIONAL_DEFECT:C09_C10_EXPORT_PDF_CONTENT';
 f.raw.failurePdf={matches:false,parsed:true,missingCellCount:1,privateEvidence:{entry,sha256:digest(f.envelopeBytes),plainSha256:f.envelope.plainSha256,encrypted:true,algorithm:f.envelope.algorithm}};
 f.bundle.resultText=JSON.stringify(f.raw);f.bundle.resultSha256=digest(f.bundle.resultText);
 f.bundle.identityReadbackText=JSON.stringify({decision:'HOLD_CURRENT_FINANCE_DEV_IDENTITY_READBACK',sourceSha:source,readbackExitCode:47,error:'ENVIRONMENT_FAILURE:GOOGLE_FINANCE_IDENTITY_READBACK_FAILED',production:false,deploys:0});
 f.bundle.sealSha256=digest(f.bundle.identityReadbackText);
 f.bundle.encryptedPdfObjects=[{entry,uri:f.envelopeUri,generation,sha256:digest(f.envelopeBytes)}];
 const originalRead=f.read;f.envelopeReads=0;f.read=(cmd,args)=>{
  if(args.includes(f.envelopeUri)){f.envelopeReads++;return args[1]==='cat'?f.envelopeBytes:JSON.stringify({bucket,name:'cxorbia-i3-qa/'+id+'/'+entry,generation,timeCreated:'2026-11-25T10:46:00Z'});}
  return originalRead(cmd,args);
 };
 return f;
}
test('Google PDF diagnostic retains verified immutable ciphertext locator, separate seal failure and original error',()=>{
 const f=encryptedResultFixture(),s=summarizeGoogleFinanceResult({uri:f.resultUri,expectedIdentity:f.expected},f.read),e=s.provenance.encryptedPdfEvidence;
 assert.equal(s.state,'HOLD');assert.equal(s.decision,'RECORDED_TYPED_RESULT_HOLD');assert.equal(s.newDomainMatches,0);assert.deepEqual(s.ownerSpecificReceipts,[]);
 assert.deepEqual(s.failureCodes,['FUNCTIONAL_DEFECT:C09_C10_EXPORT_PDF_CONTENT']);assert.equal(s.observations.failurePdf.missingCellCount,1);
 assert.equal(s.observations.sameArtifactReadback.failureCode,'ENVIRONMENT_FAILURE:GOOGLE_FINANCE_IDENTITY_READBACK_FAILED');assert.equal(s.observations.sameArtifactReadback.readbackExitCode,47);assert.equal(s.observations.sameArtifactReadback.verified,false);
 assert.equal(e.status,'VERIFIED');assert.equal(e.objects[0].verified,true);assert.equal(e.objects[0].uri,f.envelopeUri);assert.equal(e.objects[0].generation,'1795603001002000');
 assert.equal(e.objects[0].sha256,s.observations.failurePdf.privateEvidence.sha256);assert.equal(f.envelopeReads,2);
 assert.equal(s.provenance.startGeneration,generation);assert.equal(s.provenance.runId,undefined);assert.equal(s.provenance.jobId,undefined);assert.equal(s.provenance.artifactId,undefined);
 assert.doesNotMatch(JSON.stringify(s),/DO_NOT_STORE/);
});
for(const [name,alter] of [
 ['changed ciphertext bytes',f=>{f.envelopeBytes+=' ';}],
 ['different generation',f=>{f.bundle.encryptedPdfObjects[0].generation='1795603001009999';}],
 ['different UUID',f=>{f.bundle.encryptedPdfObjects[0].uri=f.envelopeUri.replace(id,'52baa293-43b7-44a3-b52c-bd4ae17b0e87');}],
 ['different declared hash',f=>{f.bundle.encryptedPdfObjects[0].sha256='0'.repeat(64);}]
])test('Google ciphertext '+name+' stays unverified without discarding the public diagnosis',()=>{
 const f=encryptedResultFixture();alter(f);const s=summarizeGoogleFinanceResult({uri:f.resultUri,expectedIdentity:f.expected},f.read);
 assert.equal(s.provenance.encryptedPdfEvidence.status,'HOLD_READBACK_UNCONFIRMED');assert.equal(s.provenance.encryptedPdfEvidence.objects[0].verified,false);
 assert.equal(s.observations.failurePdf.missingCellCount,1);assert.deepEqual(s.failureCodes,['FUNCTIONAL_DEFECT:C09_C10_EXPORT_PDF_CONTENT']);assert.equal(s.state,'HOLD');assert.doesNotMatch(JSON.stringify(s),/DO_NOT_STORE/);
});
test('legacy Google PDF locator is marked unbound and is not invented from an Actions artifact',()=>{
 const f=encryptedResultFixture();delete f.bundle.encryptedPdfObjects;
 const s=summarizeGoogleFinanceResult({uri:f.resultUri,expectedIdentity:f.expected},f.read);
 assert.equal(s.provenance.encryptedPdfEvidence.status,'HOLD_LEGACY_REFERENCE_UNBOUND');assert.equal(f.envelopeReads,0);
 assert.equal(s.observations.failurePdf.privateEvidence.referenceOnly,true);assert.equal(s.provenance.artifactId,undefined);assert.equal(s.provenance.jobId,undefined);
});

import {academyJob,readGoogleAcademyResult} from './cxorbia-i3-google-qa-execution.mjs';
test('Academy requires its own marker, exact ZIP generation and current served tuple',()=>{
 const academyStart={...start,job:academyJob},prefix='gs://'+bucket+'/cxorbia-i3-qa/'+id;
 const ext=readGoogleQaExecution(env,academyJob,source,tree,reader(academyStart));
 const expected={sourceSha:source,sourceTree:tree,controlSha:control,transportSha:control,runtimeRevision:'r',runtimeDigest:'d',hostingVersion:'h'};
 const raw={...expected,schemaVersion:'cxorbia.i3.d08-ui-provider-new-session.v1',runId:generation,runAttempt:'1',externalExecution:ext,production:false};
 const rawBytes=JSON.stringify(raw),resultUri=prefix+'/result.json#1795624487264686';
 const b={schemaVersion:'cxorbia.i3.google-d08-result.v1',startUri:env.CXORBIA_GOOGLE_QA_START,exitCode:2,archiveUri:prefix+'/evidence.zip#1795624414514001',archiveSha256:'e'.repeat(64),resultSha256:digest(rawBytes)};
 const read=(cmd,args)=>{const uri=args.find(x=>x===resultUri);if(!uri)return reader(academyStart)(cmd,args);
   return args[1]==='cat'?JSON.stringify(b):JSON.stringify({name:'cxorbia-i3-qa/'+id+'/result.json',bucket,generation:'1795624487264686',timeCreated:'2026-11-25T16:34:00Z'});};
 const archive=(uri,sha)=>{assert.equal(uri,b.archiveUri);assert.equal(sha,b.archiveSha256);return rawBytes;};
 assert.equal(readGoogleAcademyResult(resultUri,expected,read,archive).transport.jobConclusion,'failure');
 assert.throws(()=>readGoogleAcademyResult(resultUri,{...expected,runtimeDigest:'incorrect'},read,archive),/RESULT_IDENTITY/);
 b.archiveUri=b.archiveUri.replace(id,'not-the-marker');assert.throws(()=>readGoogleAcademyResult(resultUri,expected,read,archive),/ARCHIVE_BINDING/);
});

import {academyPasswordConfig, academyPasswordClaimProof, createAcademyPasswordActors} from './cxorbia-i3-google-qa-execution.mjs';
const authConfigBytes=fs.readFileSync(new URL('../../'+academyPasswordConfig,import.meta.url),'utf8');
const authRequest={schemaVersion:'cxorbia.i3.d08-ui-qa-request.v1',authorization:'PAULA_AUTHORIZED_D08_DEV_ONLY',executionMode:'UI_WITH_RECOVERY',production:false,hrIndependent:true,tenantId:'tya',projectId:'cinepolis',country:'GT'};
function passwordExec(configBytes=authConfigBytes, jobName=academyJob){
  return readGoogleQaExecution(env,jobName,source,tree,reader({...start,job:jobName,passwordConfigSha256:digest(configBytes)}));
}
test('independent HR observer requires the real registered native D08 execution, current pair and exact QA observer',()=>{
  const observerGitBlob='e'.repeat(40),receiptBlob='f'.repeat(40);
  const seal={sourceSha:source,receiptBlob,runId:id,mode:'CURRENT_SOURCE_SERVING'};
  const hrAcceptance={mode:'MANUAL_FRESH_TWO_SHARED_PRESENTATIONS',sourceSha:source,pairedRunId:id,
    maxManualReads:1,maxSharedChecks:2,observerPath:academyHrObserver,observerGitBlob};
  const request={...authRequest,sourceSha:source,pairedRunId:id,pairedReceiptGitBlob:receiptBlob,hrAcceptance};
  const exec=passwordExec(),read=(cmd,args)=>{
    assert.equal(cmd,'git');
    assert.deepEqual(args,args[0]==='rev-parse'?['rev-parse',control+':'+academyHrObserver]:['hash-object',academyHrObserver]);
    return observerGitBlob+'\n';
  };
  assert.doesNotThrow(()=>verifyAcademyHrObservation(exec,request,seal,read));
  assert.throws(()=>verifyAcademyHrObservation({...exec},request,seal,read),/NATIVE_AUTHORITY/);
  for(const bad of [{sourceSha:'d'.repeat(40)},{pairedRunId:'wrong'},{maxManualReads:2},{maxSharedChecks:3},{mode:'OTHER'},{observerPath:'other'},{observerGitBlob:control}]){
    assert.throws(()=>verifyAcademyHrObservation(exec,{...request,hrAcceptance:{...hrAcceptance,...bad}},seal,read),/SCOPE|BLOB/);
  }
  for(const bad of [{sourceSha:'d'.repeat(40)},{runId:'wrong'},{mode:'PREDECESSOR_RUNTIME_SERVING'},{receiptBlob:source}]){
    assert.throws(()=>verifyAcademyHrObservation(exec,request,{...seal,...bad},read),/SCOPE/);
  }
  assert.throws(()=>verifyAcademyHrObservation(exec,request,seal,(_cmd,args)=>args[0]==='rev-parse'?observerGitBlob:tree),/BLOB/);
});
function configReader(bytes){
  return (cmd,args)=>{assert.equal(cmd,'git');assert.deepEqual(args,['show',control+':'+academyPasswordConfig]);return bytes;};
}
test('native D08 password credentials belong only to the four exact generated UIDs and are erased after use',()=>{
  const actors=createAcademyPasswordActors(passwordExec(),authRequest,configReader(authConfigBytes));
  const prefix='qa_d08_'+generation+'_1_';
  const creds=['admin','shopper','cliente','other'].map(label=>actors.forUid(prefix+label));
  assert.equal(new Set(creds.map(c=>c.password)).size,4);
  for (const [i,label] of ['admin','shopper','cliente','other'].entries()){
    assert.equal(creds[i].email,prefix+label+'@cxorbia.invalid');
    assert.match(creds[i].password,/^Qa!1[A-Za-z0-9_-]{43}$/);
  }
  for(const uid of ['admin','qa_d08_12345678_1_admin',prefix+'fifth'])
    assert.throws(()=>actors.forUid(uid),/UNOWNED_UID/);
  assert.equal(JSON.stringify(actors).includes('Qa!1'),false);
  actors.clear();
  assert.ok(creds.every(c=>c.password===''));assert.throws(()=>actors.forUid(prefix+'admin'));
});
test('native D08 rejects mutated config bytes, unlocked request, alternate deployment and spoofed native start',()=>{
  const make=(ex,cfg,req=authRequest)=>createAcademyPasswordActors(ex,req,configReader(cfg));
  assert.throws(()=>make({...passwordExec()},authConfigBytes),/NATIVE_AUTHORITY/);
  assert.throws(()=>make(passwordExec(authConfigBytes,'i3-finance-focal-reproof'),authConfigBytes),/NATIVE_AUTHORITY/);
  assert.throws(()=>make(passwordExec(),authConfigBytes+' '),/CONFIG_DIGEST/);
  for(const [k,v] of [['labels',['admin']],['emailDomain','example.com'],['projectId','foreign'],['project','prod'],['production',true]]){
    const bytes=JSON.stringify({...JSON.parse(authConfigBytes),[k]:v});
    assert.throws(()=>make(passwordExec(bytes),bytes),/CONFIG_SCOPE/);
  }
  for(const [k,v] of [['executionMode','RECOVERY_ONLY'],['authorization','OTHER'],['projectId','other'],['country','HN'],['production',true],['hrIndependent',false]])
    assert.throws(()=>make(passwordExec(),authConfigBytes,{...authRequest,[k]:v}),/REQUEST_SCOPE/);
});
test('claims are checked independently in every password session without persisting the token or JWT',async()=>{
  const uid='qa_d08_'+generation+'_1_shopper',expectedClaims={role:'shopper',projectIds:['cinepolis'],qaPurpose:'D08',shopperId:uid};
  const identity={uid,expectedClaims},page=(actual)=>({evaluate:async(fn,keys)=>{
    assert.deepEqual(keys,Object.keys(expectedClaims));
    const previous=globalThis.window;
    try{
      globalThis.window={firebase:{auth:()=>({currentUser:{uid:actual.uid,getIdTokenResult:async()=>({token:'private-jwt',signInProvider:actual.provider,claims:{...actual.claims,sub:actual.subject}})}})}};
      return await fn(keys);
    }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
  }});
  const good={uid,subject:uid,provider:'password',claims:expectedClaims};
  const proof=await academyPasswordClaimProof(page(good),identity);
  assert.deepEqual(Object.keys(proof).sort(),['claimsSha256','signInProvider','uid']);assert.match(proof.claimsSha256,/^[a-f0-9]{64}$/);
  for(const bad of [{uid:'foreign'},{subject:'foreign'},{provider:'custom'},{claims:{...expectedClaims,role:'admin'}},{claims:{...expectedClaims,projectIds:['other']}}])
    await assert.rejects(academyPasswordClaimProof(page({...good,...bad}),identity),/AUTH_FAILURE:D08_PASSWORD_SESSION_CLAIMS/);
});

test('each signed-in D08 browser uses its own Firebase password actor, with no custom token or IAM method',async()=>{
  const actors=createAcademyPasswordActors(passwordExec(),authRequest,configReader(authConfigBytes));
  const calls=[],methods={setPersistence:async mode=>calls.push(mode),signInWithEmailAndPassword:async(email,password)=>{
    const uid=email.split('@')[0];
    assert.equal(actors.forUid(uid).password,password);calls.push(email);
  }};
  const auth=Object.assign(()=>methods,{Auth:{Persistence:{LOCAL:'local'}}});
  const fake={evaluate:async(fn,arg)=>{
    const previous=globalThis.firebase;
    try{globalThis.firebase={auth};await fn(arg);}
    finally{if(previous===undefined)delete globalThis.firebase;else globalThis.firebase=previous;}
  }};
  const labels=['admin','shopper','cliente','other'];
  for(const label of labels){
    const uid='qa_d08_'+generation+'_1_'+label;
    await actors.signIn(fake,uid);await actors.signIn(fake,uid);
  }
  assert.equal(calls.filter(x=>x==='local').length,8);
  assert.equal(new Set(calls.filter(x=>x!=='local')).size,4);
  await assert.rejects(actors.signIn(fake,'other'),/UNOWNED_UID/);actors.clear();
});
