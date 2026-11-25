import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {incorporateTypedResults} from './cxorbia-i3-automatic-result-consumer.mjs';
import {summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
import {financeHrOwnerCode,financeBootstrapProbe} from './cxorbia-i3-finance-ui-readonly.mjs';
const copy=x=>structuredClone(x);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'cxorbia-live-hr-dev-00391-8mg',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/511061474d07baca'};
function fixture(){
  const exp={decision:'PASS_EXPORT_PARITY',rows:2,xlsx:{parsed:true,contentMatches:true},pdf:{parsed:true,contentMatches:true}};
  const session={newContextEmpty:true,exactCurrentAdminClaims:true,serverReadConfirmed:true,advancePairExact:true,firstAdvanceUnchanged:true,secondMetadataExact:true,rowCount:2,movementExport:exp,dashboard:{...copy(exp),realRows:true,independentHrKpisCertified:false},privateAccountName:'MUST_NOT_APPEAR'};
  const result={schemaVersion:'cxorbia.i3.finance-core-ui-readonly.v1',decision:'PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE',state:'HOLD',operationKind:'READ_ONLY_WITH_APP_MUTATIONS_BLOCKED',runId:'1',runAttempt:'1',...identity,production:false,privateDataExposed:false,fullDomain:false,newDomainMatches:0,phaseAComplete:false,paymentsTested:false,benefitsRetested:false,dashboardIndependentHrKpisCertified:false,automaticHrReconciliationProven:false,independentAdminSessions:2,advanceCount:2,currentAdminClaimsVerified:true,browserServerReadVerified:true,newSessionParity:true,financialDocumentsStable:true,committedMetadataReceiptVerified:true,firstAdvanceUnchanged:true,secondMetadataExact:true,sameCashPeriod:true,providerCommandsExecuted:0,financialMutationRequestsDispatched:0,directFirestoreWrites:0,authIdentityOrClaimsWrites:0,network:{unexpectedDenied:0,automaticHrSuppressed:2,allowedAuthRequests:4,routeControlFailures:0},sessions:[copy(session),copy(session)]};
  const transport={runId:'1',runAttempt:'1',jobId:'2',artifactId:'3',jobName:'i3-finance-focal-reproof',jobConclusion:'success',controlHead:'d'.repeat(40),artifactDigest:'sha256:'+'e'.repeat(64),verifiedArchiveDigest:'sha256:'+'e'.repeat(64),entry:'finance-ui-readonly.json'};
  const text=JSON.stringify({decision:'PASS_CURRENT_FINANCE_DEV_IDENTITY_READBACK',sourceSha:identity.sourceSha,runtimeRevision:identity.runtimeRevision,hostingVersion:identity.hostingVersion,runtimeTrafficExact:true,hostingBeforeAfterSame:true,production:false,deploys:0});
  return {result,transport,identityReadback:{entry:'identity-live-readback.json',artifactId:transport.artifactId,artifactDigest:transport.artifactDigest,text}};
}
function summarize(f){const resultText=JSON.stringify(f.result);return summarizeTypedResult({resultText,transport:{...f.transport,resultSha256:hash(resultText)},expectedIdentity:identity,identityReadback:f.identityReadback});}
test('finance UI summary retains scoped facts and never promotes domain or exposes raw values',()=>{
  const s=summarize(fixture());assert.equal(s.kind,'FINANCE_UI_READONLY');assert.equal(s.decision,'RECORDED_FINANCE_UI_SCOPED_PASS');assert.equal(s.observations.sameArtifactReadback.verified,true);assert.equal(s.state,'HOLD');assert.equal(s.fullDomain,false);assert.equal(s.phaseAComplete,false);assert.equal(s.newDomainMatches,0);assert.equal(s.observations.independentAdminSessions,2);assert.equal(s.observations.network.automaticHrSuppressed,2);assert(!JSON.stringify(s).includes('MUST_NOT_APPEAR'));
});
test('typed consumer rejects overstated PASS with missing byte proof, second session, identity, or writes',async t=>{
  for(const [name,mutate]of [
    ['only one session',r=>r.sessions.pop()],['one context reused',r=>r.sessions[1].newContextEmpty=false],
    ['missing XLSX parse',r=>r.sessions[0].movementExport.xlsx.parsed=false],
    ['PDF mismatch',r=>r.sessions[1].movementExport.pdf.contentMatches=false],
    ['missing live identity',r=>delete r.runtimeDigest],['network writer',r=>r.providerCommandsExecuted=1],
    ['denied unexpected',r=>r.network.unexpectedDenied=1],['guard control failure',r=>r.network.routeControlFailures=1],['finance drift',r=>r.financialDocumentsStable=false],
    ['claim full domain',r=>r.fullDomain=true],['claim HR KPI',r=>r.dashboardIndependentHrKpisCertified=true],
    ['claim Benefits',r=>r.benefitsRetested=true],['missing dashboard bytes',r=>r.sessions[0].dashboard.pdf.parsed=false]
  ])await t.test(name,()=>{const f=fixture();mutate(f.result);assert.throws(()=>summarize(f),/MAPPING_FAILURE:TYPED_SUMMARY_/);});
});
test('empty Dashboard is an explicit unproved export while required Movimientos remains proved',()=>{
  const f=fixture();for(const s of f.result.sessions)s.dashboard={decision:'NOT_APPLICABLE_NO_ELIGIBLE_ROWS',realRows:false,emptyStateObserved:true,independentHrKpisCertified:false};
  const result=summarize(f);assert.equal(result.observations.sessions[0].dashboard.decision,'NOT_APPLICABLE_NO_ELIGIBLE_ROWS');
  f.result.sessions[1].dashboard.emptyStateObserved=false;assert.throws(()=>summarize(f),/FINANCE_UI_DASHBOARD/);
});
test('HOLD from preflight keeps missing facts unknown instead of inventing a successful session',()=>{
  const f=fixture();f.result.decision='HOLD_C09_C10_UI_READONLY';f.result.sessions=[];f.result.independentAdminSessions=0;delete f.result.financialDocumentsStable;delete f.result.committedMetadataReceiptVerified;f.result.error='AUTH_FAILURE:C09_C10_CURRENT_MEMBERSHIP:private-uid';
  const r=summarize(f);assert.equal(r.observations.financialDocumentsStable,null);assert.equal(r.observations.independentAdminSessions,0);assert.deepEqual(r.failureCodes,['AUTH_FAILURE:C09_C10_CURRENT_MEMBERSHIP']);assert(!JSON.stringify(r).includes('private-uid'));
});
test('post-proof job failure or missing/mismatched seal records incomplete HOLD and preserves raw provenance',async t=>{
  const cases=[
    ['missing seal',f=>delete f.identityReadback],
    ['invalid JSON',f=>f.identityReadback.text='{'],
    ['foreign artifact',f=>f.identityReadback.artifactId='99'],
    ['different archive digest',f=>f.identityReadback.artifactDigest='sha256:'+'f'.repeat(64)],
    ['wrong entry',f=>f.identityReadback.entry='other.json'],
    ['wrong source',f=>{const s=JSON.parse(f.identityReadback.text);s.sourceSha='f'.repeat(40);f.identityReadback.text=JSON.stringify(s);}],
    ['wrong runtime',f=>{const s=JSON.parse(f.identityReadback.text);s.runtimeRevision='cxorbia-live-hr-dev-00001-abc';f.identityReadback.text=JSON.stringify(s);}],
    ['wrong hosting',f=>{const s=JSON.parse(f.identityReadback.text);s.hostingVersion='sites/cxorbia-backend-dev/versions/other';f.identityReadback.text=JSON.stringify(s);}],
    ['deploy occurred',f=>{const s=JSON.parse(f.identityReadback.text);s.deploys=1;f.identityReadback.text=JSON.stringify(s);}],
    ['production',f=>{const s=JSON.parse(f.identityReadback.text);s.production=true;f.identityReadback.text=JSON.stringify(s);}],
    ['traffic mismatch',f=>{const s=JSON.parse(f.identityReadback.text);s.runtimeTrafficExact=false;f.identityReadback.text=JSON.stringify(s);}],
    ['job failed after raw PASS',f=>f.transport.jobConclusion='failure'],
    ['job cancelled after raw PASS',f=>f.transport.jobConclusion='cancelled'],
    ['job timed out after raw PASS',f=>f.transport.jobConclusion='timed_out']
  ];
  for(const [name,mutate]of cases)await t.test(name,()=>{
    const f=fixture();mutate(f);const result=summarize(f);
    assert.equal(result.decision,'RECORDED_FINANCE_UI_INCOMPLETE');assert.equal(result.state,'HOLD');
    assert.equal(result.producer.decision,'PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE');
    assert.equal(result.observations.effectiveDecision,'HOLD_C09_C10_SAME_ARTIFACT_UNCONFIRMED');
    assert.equal(result.observations.sameArtifactReadback.verified,false);
    assert.equal(result.provenance.resultSha256,hash(JSON.stringify(f.result)));
    assert.equal(result.provenance.artifactDigest,f.transport.artifactDigest);
    assert.equal(result.observations.independentAdminSessions,2);assert.equal(result.fullDomain,false);
  });
});
test('same archive seal flows through consumer; a neighboring seal cannot supply missing evidence',async t=>{
  for(const scenario of ['valid','missing-with-neighbor','job-failure'])await t.test(scenario,async()=>{
    const f=fixture(),folder=fs.mkdtempSync(path.join(os.tmpdir(),'finance-ui-seal-'));
    const artifactFolder=path.join(folder,'artifact');fs.mkdirSync(artifactFolder);
    fs.writeFileSync(path.join(artifactFolder,'finance-ui-readonly.json'),JSON.stringify(f.result));
    fs.writeFileSync(path.join(folder,'identity-live-readback.json'),f.identityReadback.text);
    if(scenario!=='missing-with-neighbor')fs.writeFileSync(path.join(artifactFolder,'identity-live-readback.json'),f.identityReadback.text);
    const run={id:1,run_attempt:1,head_sha:f.transport.controlHead};
    const job={id:2,name:'i3-finance-focal-reproof',status:'completed',conclusion:scenario==='job-failure'?'failure':'success',started_at:'2026-11-25T00:00:00Z',completed_at:'2026-11-25T00:01:00Z'};
    const artifact={id:3,name:'cxorbia-i3-finance-focal-1',digest:f.transport.artifactDigest,created_at:'2026-11-25T00:00:59Z',expired:false,workflow_run:{id:1,head_sha:run.head_sha}};
    const index={schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false},files=new Map();
    const controls={descriptor:{currentFunctionalEvidenceIndex:index},pointer:{currentFunctionalEvidenceIndex:index,currentResultIncorporationQueue:[{runId:1,runAttempt:1,jobId:2,name:job.name}]}};
    try{
      const result=await incorporateTypedResults({
        api:async()=>{throw Error('No network permitted');},token:'synthetic',run,jobs:[job],artifacts:[artifact],controls,
        journal:{artifacts:[artifact],pendingTypedResults:[{jobId:2,name:job.name}]},files,now:'2026-11-25T00:02:00Z',
        download:async()=>({folder:artifactFolder,digest:artifact.digest,cleanup:()=>{}}),
        producerLoader:async()=>({descriptor:{currentMaterialization:identity},pointer:{},matrix:{}})
      });
      assert.equal(result.failures.length,0);assert.equal(result.incorporated.length,1);
      const saved=JSON.parse([...files.entries()].find(([p])=>p.endsWith('_TYPED_RESULT.json'))[1]);
      assert.equal(saved.observations.sameArtifactReadback.verified,scenario==='valid');
      assert.equal(saved.decision,scenario==='valid'?'RECORDED_FINANCE_UI_SCOPED_PASS':'RECORDED_FINANCE_UI_INCOMPLETE');
      assert.equal(saved.producer.decision,'PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE');
    }finally{fs.rmSync(folder,{recursive:true,force:true});}
  });
});
test('failure stage survives typed recording while arbitrary route, suffix and HTML do not',()=>{
  const f=fixture();f.result.decision='HOLD_C09_C10_UI_READONLY';
  f.result.stage='SESSION_1_MOVEMENT_EXPORT';f.result.failureStage=f.result.stage;f.result.sessionAttempted=1;f.result.activeSessionProgress={auth:true,serverRows:true,dom:true,movementExport:false,private:'DO_NOT_STORE'};
  f.result.failureUi={available:true,route:'DO_NOT_STORE',role:'DO_NOT_STORE',movementRowCount:3,html:'DO_NOT_STORE',uid:'DO_NOT_STORE'};
  const r=summarize(f);assert.equal(r.observations.failureStage,'SESSION_1_MOVEMENT_EXPORT');assert.equal(r.observations.activeSessionProgress.movementExport,false);assert.equal(r.observations.failureUi.movementRowCount,3);assert.equal(r.observations.failureUi.route,null);assert(!JSON.stringify(r).includes('DO_NOT_STORE'));
});

function pdfFailureFixture(){
  const f=fixture();f.result.decision='HOLD_C09_C10_UI_READONLY';f.transport.jobConclusion='failure';
  f.result.sessions=[];f.result.independentAdminSessions=0;f.result.stage='SESSION_1_MOVEMENT_EXPORT';f.result.failureStage=f.result.stage;
  f.result.error='FUNCTIONAL_DEFECT:C09_C10_PDF_CONTENT';f.result.errorSha256=hash(f.result.error);
  f.result.networkFailure='ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST';f.result.network.unexpectedDenied=13;
  f.result.failurePdf={matches:false,pages:1,textCharacters:350,textSha256:'1'.repeat(64),titleMatches:true,periodMatches:true,
    titleMatchesIgnoringWhitespace:true,periodMatchesIgnoringWhitespace:true,missingCellCount:1,missingCellsTruncated:false,
    missingCells:[{row:1,column:0,expectedCharacters:10,expectedSha256:'2'.repeat(64),matchesIgnoringWhitespace:true}],
    bytes:2048,sha256:'3'.repeat(64),privateEvidence:{entry:'private-session-0-movements-pdf.envelope.json',sha256:'4'.repeat(64),plainSha256:'5'.repeat(64),encrypted:true,algorithm:'RSA-OAEP-SHA256+AES-256-GCM'}};
  f.result.partialExportProof={decision:'PARTIAL_EXPORT_PROOF_PDF_PENDING',rows:3,semanticRowsSha256:'6'.repeat(64),
    preview:{sha256:'7'.repeat(64),contentMatches:true},xlsx:{bytes:4096,sha256:'8'.repeat(64),parsed:true,contentMatches:true},
    nativePrintDom:{sha256:'9'.repeat(64),contentMatches:true},pdf:{bytes:2048,sha256:'3'.repeat(64),pages:1,parsed:true,contentMatches:false}};
  return f;
}
test('PDF failure preserves typed diagnostic and encrypted reference without replacing primary error or crediting partial export',()=>{
  const f=pdfFailureFixture();
  for(const item of [f.result.failurePdf,f.result.failurePdf.missingCells[0],f.result.failurePdf.privateEvidence,f.result.partialExportProof,f.result.partialExportProof.pdf]){
    Object.assign(item,{text:'DO_NOT_STORE_PRIVATE_PDF_TEXT',url:'https://private.example.test/DO_NOT_STORE_ACCOUNT?token=DO_NOT_STORE_TOKEN',base64:'DO_NOT_STORE_PDF_BYTES',rawRows:['DO_NOT_STORE_FINANCE_ROW']});
  }
  f.result.networkFailure+=':DO_NOT_STORE_PRIVATE_SUFFIX';
  const r=summarize(f);
  assert.equal(r.classification,'FUNCTIONAL_DEFECT');assert.deepEqual(r.failureCodes,['FUNCTIONAL_DEFECT:C09_C10_PDF_CONTENT']);
  assert.equal(r.observations.networkFailure,'ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST');
  assert.equal(r.observations.failurePdf.missingCellCount,1);assert.equal(r.observations.failurePdf.missingCells[0].matchesIgnoringWhitespace,true);
  assert.equal(r.observations.failurePdf.privateEvidence.entry,'private-session-0-movements-pdf.envelope.json');
  assert.equal(r.observations.failurePdf.privateEvidence.sha256,'4'.repeat(64));assert.equal(r.observations.failurePdf.privateEvidence.referenceOnly,true);
  assert.equal(r.observations.partialExportProof.decision,'PARTIAL_EXPORT_PROOF_PDF_PENDING');
  assert.equal(r.observations.partialExportProof.xlsx.contentMatches,true);assert.equal(r.observations.partialExportProof.pdf.contentMatches,false);
  assert.equal(r.decision,'RECORDED_TYPED_RESULT_HOLD');assert.equal(r.state,'HOLD');assert.equal(r.phaseAComplete,false);
  assert.equal(r.ownerSpecificReceipts.length,0);assert.equal(r.privateValuesStored,false);assert(!JSON.stringify(r).includes('DO_NOT_STORE'));
});
test('PDF diagnostics bound cells and reject private paths, URLs, malformed hashes and false encryption metadata',async t=>{
  for(const [name,mutate]of [
    ['path traversal',x=>x.entry='../DO_NOT_STORE.pdf'],['private URL',x=>x.entry='https://private.example.test/DO_NOT_STORE.pdf'],
    ['unscoped filename',x=>x.entry='private-customer-DO_NOT_STORE.pdf'],['plain attachment',x=>x.encrypted=false],
    ['non-string filename',x=>x.entry=['private-session-0-movements-pdf.envelope.json']],
    ['wrong algorithm',x=>x.algorithm='DO_NOT_STORE'],['bad envelope hash',x=>x.sha256='DO_NOT_STORE'],['bad plain hash',x=>x.plainSha256='DO_NOT_STORE']
  ])await t.test(name,()=>{const f=pdfFailureFixture();mutate(f.result.failurePdf.privateEvidence);const r=summarize(f);assert.equal(r.observations.failurePdf.privateEvidence,null);assert(!JSON.stringify(r).includes('DO_NOT_STORE'));});
  const f=pdfFailureFixture();f.result.failurePdf.missingCells=Array.from({length:80},(_,row)=>({row,column:0,expectedCharacters:10,expectedSha256:'DO_NOT_STORE',matchesIgnoringWhitespace:false,expectedValue:'DO_NOT_STORE'}));
  f.result.failurePdf.sha256='DO_NOT_STORE';f.result.failurePdf.textSha256='DO_NOT_STORE';
  const r=summarize(f);assert.equal(r.observations.failurePdf.missingCells.length,64);assert.equal(r.observations.failurePdf.missingCellsTruncated,true);
  assert.equal(r.observations.failurePdf.sha256,null);assert.equal(r.observations.failurePdf.textSha256,null);assert.equal(r.observations.failurePdf.missingCells[0].expectedSha256,null);assert(!JSON.stringify(r).includes('DO_NOT_STORE'));
});
test('contradictory PDF, partial export or failure metadata cannot accompany a Finance PASS',async t=>{
  for(const [name,mutate]of [
    ['PDF diagnostic',r=>r.failurePdf=pdfFailureFixture().result.failurePdf],
    ['partial export',r=>r.partialExportProof=pdfFailureFixture().result.partialExportProof],
    ['secondary network failure',r=>r.networkFailure='ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST'],
    ['primary failure',r=>r.error='FUNCTIONAL_DEFECT:C09_C10_PDF_CONTENT']
    ,['HR owner diagnostic',r=>r.hrOwnerDiagnostic={authorityPresent:true,applied:false,ownerCode:'HR_LIVE_UNAVAILABLE'}]
  ])await t.test(name,()=>{const f=fixture();mutate(f.result);assert.throws(()=>summarize(f),/MAPPING_FAILURE:TYPED_SUMMARY_FINANCE_UI_CONTRADICTORY_PASS/);});
});
test('new failed-PDF artifact survives the existing consumer pipeline as HOLD with exact diagnostics and no owner receipt',async()=>{
  const f=pdfFailureFixture(),folder=fs.mkdtempSync(path.join(os.tmpdir(),'finance-ui-pdf-failure-'));
  const resultText=JSON.stringify(f.result);fs.writeFileSync(path.join(folder,'finance-ui-readonly.json'),resultText);
  const run={id:1,run_attempt:1,head_sha:f.transport.controlHead};
  const job={id:2,name:'i3-finance-focal-reproof',status:'completed',conclusion:'failure',started_at:'2026-11-25T00:00:00Z',completed_at:'2026-11-25T00:01:00Z'};
  const artifact={id:3,name:'cxorbia-i3-finance-focal-1',digest:f.transport.artifactDigest,created_at:'2026-11-25T00:00:59Z',expired:false,workflow_run:{id:1,head_sha:run.head_sha}};
  const index={schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false},files=new Map();
  const controls={descriptor:{currentFunctionalEvidenceIndex:index},pointer:{currentFunctionalEvidenceIndex:index,currentResultIncorporationQueue:[{runId:1,runAttempt:1,jobId:2,name:job.name}]}};
  try{
    const result=await incorporateTypedResults({api:async()=>{throw Error('No network permitted');},token:'synthetic',run,jobs:[job],artifacts:[artifact],controls,
      journal:{artifacts:[artifact],pendingTypedResults:[{jobId:2,name:job.name}]},files,now:'2026-11-25T00:02:00Z',
      download:async()=>({folder,digest:artifact.digest,cleanup:()=>{}}),producerLoader:async()=>({descriptor:{currentMaterialization:identity},pointer:{},matrix:{}})});
    assert.equal(result.failures.length,0);assert.equal(result.incorporated.length,1);
    const saved=JSON.parse([...files.entries()].find(([p])=>p.endsWith('_TYPED_RESULT.json'))[1]);
    assert.equal(saved.provenance.resultSha256,hash(resultText));assert.equal(saved.decision,'RECORDED_TYPED_RESULT_HOLD');assert.equal(saved.classification,'FUNCTIONAL_DEFECT');
    assert.equal(saved.observations.failurePdf.privateEvidence.sha256,'4'.repeat(64));assert.equal(saved.observations.failurePdf.missingCells[0].expectedSha256,'2'.repeat(64));
    assert.equal(saved.observations.partialExportProof.pdf.contentMatches,false);assert.equal(saved.ownerSpecificReceipts.length,0);assert.equal(saved.newDomainMatches,0);
  }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test('historical results without PDF diagnostics do not acquire invented diagnostic fields',()=>{
  const f=fixture();f.result.decision='HOLD_C09_C10_UI_READONLY';const r=summarize(f);
  for(const key of ['failurePdf','partialExportProof','networkFailure','hrOwnerDiagnostic'])assert.equal(Object.hasOwn(r.observations,key),false);
  for(const key of ['failureCode','readbackExitCode'])assert.equal(Object.hasOwn(r.observations.sameArtifactReadback,key),false);
});

function hrOwnerFailureFixture(){
  const f=fixture();f.result.decision='HOLD_C09_C10_UI_READONLY';f.transport.jobConclusion='failure';
  Object.assign(f.result,{sessions:[],independentAdminSessions:0,stage:'SESSION_1_AUTH',failureStage:'SESSION_1_AUTH',sessionAttempted:1,
    error:'ENVIRONMENT_FAILURE:C09_C10_UI_UNCONFIRMED',networkFailure:'ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST',
    activeSessionProgress:{auth:false,period:false,serverRows:false,dom:false,advancePair:false,movementExport:false,dashboard:false,finalRead:false},
    failureUi:{available:true,firebaseUserPresent:true,contextAuthenticated:true,authorityApplied:false},
    hrOwnerDiagnostic:{authorityPresent:true,applied:false,retryable:true,sourceReady:false,sourceBlocked:true,runtimeReady:true,
      ownerCode:'HR_LIVE_HTTP_503',ownerErrorSha256:hash('SYNTHETIC_HR_OWNER_FAILURE'),authenticatedHrHttp:[200,503]}});
  Object.assign(f.result.network,{automaticHrSuppressed:0,unexpectedDenied:4,allowedAuthRequests:5,routeControlFailures:0});
  return f;
}
test('HR owner failure survives typed recording without changing the primary classification or giving export credit',()=>{
  const f=hrOwnerFailureFixture();Object.assign(f.result.hrOwnerDiagnostic,{ownerError:'DO_NOT_STORE_RAW_ERROR',uid:'DO_NOT_STORE_UID',url:'https://private.invalid/DO_NOT_STORE_URL',details:{account:'DO_NOT_STORE_ACCOUNT'}});
  const r=summarize(f),d=r.observations.hrOwnerDiagnostic;
  assert.equal(r.classification,'ENVIRONMENT_FAILURE');assert.deepEqual(r.failureCodes,['ENVIRONMENT_FAILURE:C09_C10_UI_UNCONFIRMED']);
  assert.equal(r.observations.failureStage,'SESSION_1_AUTH');assert.equal(r.observations.failureUi.contextAuthenticated,true);assert.equal(r.observations.failureUi.authorityApplied,false);
  assert.equal(d.ownerCode,'HR_LIVE_HTTP_503');assert.equal(d.ownerErrorSha256,hash('SYNTHETIC_HR_OWNER_FAILURE'));assert.deepEqual(d.authenticatedHrHttp,[200,503]);
  assert.equal(d.authorityPresent,true);assert.equal(d.applied,false);assert.equal(d.runtimeReady,true);assert.equal(d.available,null);
  assert.equal(r.observations.independentAdminSessions,0);assert.deepEqual(r.observations.sessions,[]);assert.equal(r.decision,'RECORDED_TYPED_RESULT_HOLD');
  assert.equal(r.state,'HOLD');assert.equal(r.phaseAComplete,false);assert.equal(r.newDomainMatches,0);assert.deepEqual(r.ownerSpecificReceipts,[]);assert.doesNotMatch(JSON.stringify(r),/DO_NOT_STORE|private\.invalid/);
});
test('bootstrap probes only authenticated original Admin reads and exports fixed codes',async()=>{
  const prior=global.window,queries=[];
  const identity={uid:'synthetic',tenantId:'qa',projectId:'qa-project',firebaseProject:'qa-firebase'};
  const ctx={authenticated:true,role:'admin',tenantId:identity.tenantId,projectIds:[identity.projectId]};
  const ref=name=>({collection:ref,doc:ref,limit(n){assert.equal(n,1);return this;},
    async get(options){assert.deepEqual(options,{source:'server'});queries.push(name);
      if(name==='shoppers')throw Object.assign(Error('DO_NOT_STORE'),{code:'permission-denied'});
      return {metadata:{fromCache:false}};}});
  global.window={CX:{backendAuth:{context:()=>ctx}},firebase:{auth:()=>({currentUser:{uid:identity.uid}}),
    app:()=>({options:{projectId:identity.firebaseProject}}),firestore:()=>ref('db')},
    CX_PROTECTED_AUTH_HR_BOOT_RECONCILE:{authorized:true,protectedBackendReady:false},
    CX_BACKEND_LAST_STATE:{source:'localStorage/demo',error:'Missing or insufficient permissions. DO_NOT_STORE'}};
  try{
    const wrong=await financeBootstrapProbe({...identity,uid:'other'});assert.deepEqual(wrong.serverReads,{});assert.deepEqual(queries,[]);
    const b=await financeBootstrapProbe(identity);
    assert.deepEqual(queries.sort(),['periods','projects','shoppers','visits']);
    assert.equal(b.serverReads.shoppers,'PERMISSION_DENIED');assert.equal(b.serverReads.visits,'SERVER_OK');
    assert.equal(b.stateErrorCode,'PERMISSION_DENIED');assert.doesNotMatch(JSON.stringify(b),/synthetic|DO_NOT_STORE/);
    const f=hrOwnerFailureFixture();f.result.hrOwnerDiagnostic.bootstrap={...b,uid:'DO_NOT_STORE',
      serverReads:{...b.serverReads,private:'DO_NOT_STORE',visits:'DO_NOT_STORE'}};
    const result=summarize(f),d=result.observations.hrOwnerDiagnostic.bootstrap;
    assert.equal(d.bootBackendReady,false);assert.equal(d.serverReads.shoppers,'PERMISSION_DENIED');
    assert.equal(d.serverReads.visits,undefined);assert.equal(result.state,'HOLD');assert.doesNotMatch(JSON.stringify(d),/DO_NOT_STORE/);
  }finally{if(prior===undefined)delete global.window;else global.window=prior;}
});
test('every supported producer HR owner code remains exact, including sanitized dynamic prefixes and HTTP boundaries',async t=>{
  const codes=['HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS','HR_LIVE_DUPLICATE_PERIOD_KEYS','HR_LIVE_NETWORK_FAILURE','HR_LIVE_NONEMPTY_REQUIRED','HR_LIVE_REVISION_CHANGED_DURING_COMPOSITION','HR_LIVE_REVISION_PUBLICATION_MISMATCH','HR_LIVE_REVISION_READBACK_MISSING','HR_LIVE_REVISION_REQUIRED','HR_LIVE_SCOPE_MISMATCH','HR_LIVE_SOURCE_SAFE_REQUIRED','HR_LIVE_UNAVAILABLE','PROJECT_SCOPE_REQUIRED','CANONICAL_COMPOSER_V2_MISSING','CANONICAL_PERIOD_LOSS','CERTIFICATION_EVIDENCE_PROJECTOR_MISSING','BACKEND_REFRESH_ATOMIC_COMPOSITION_REQUIRED','BACKEND_REFRESH_READBACK_REVISION_MISMATCH','AUTH_FAILURE:PROTECTED_HR_PRINCIPAL_REQUIRED','AUTH_FAILURE:SESSION_GENERATION_CHANGED_DURING_COMPOSITION','AUTH_FAILURE:SESSION_NO_LONGER_AUTHORIZED','AUTH_FAILURE:PROTECTED_STATE_PRINCIPAL_CHANGED_DURING_COMPOSITION','AUTH_FAILURE:SHOPPER_PRINCIPAL_CLAIMS_MEMBERSHIP_MISMATCH',
    'CANONICAL_DYNAMIC_COMPOSITION_INVARIANT_DO_NOT_STORE_UID','HR_LIVE_VISIT_PERIOD_MISSING_DO_NOT_STORE_PERIOD','AUTH_FAILURE:SHOPPER_EXACT_HR_PROFILE_COUNTRY_PERIOD_REQUIRED:DO_NOT_STORE_PRIVATE_DETAIL',
    'HR_LIVE_HTTP_100','HR_LIVE_HTTP_599','HR_LIVE_REVISION_READBACK_HTTP_200','HR_LIVE_REVISION_READBACK_HTTP_599','UNKNOWN_DO_NOT_STORE',''];
  for(const [index,raw]of codes.entries())await t.test('producer code '+index,()=>{
    const f=hrOwnerFailureFixture(),expected=financeHrOwnerCode(raw);f.result.hrOwnerDiagnostic.ownerCode=expected;
    const r=summarize(f);assert.equal(r.observations.hrOwnerDiagnostic.ownerCode,expected);assert.doesNotMatch(JSON.stringify(r),/DO_NOT_STORE/);
    assert.equal(r.classification,'ENVIRONMENT_FAILURE');
  });
});
test('HR owner whitelist rejects unsanitized codes, malformed values and arrays without exposing their contents',async t=>{
  for(const value of ['HR_LIVE_HTTP_600','HR_LIVE_HTTP_099','HR_LIVE_HTTP_200:DO_NOT_STORE_UID','AUTH_FAILURE:PROTECTED_HR_PRINCIPAL_REQUIRED:DO_NOT_STORE_UID','CANONICAL_DYNAMIC_COMPOSITION_INVARIANT_DO_NOT_STORE_UID','https://private.invalid/DO_NOT_STORE',42,['HR_LIVE_UNAVAILABLE'],{code:'DO_NOT_STORE'}])await t.test('reject code '+typeof value,()=>{
    const f=hrOwnerFailureFixture();f.result.hrOwnerDiagnostic.ownerCode=value;const r=summarize(f);
    assert.equal(r.observations.hrOwnerDiagnostic.ownerCode,null);assert.doesNotMatch(JSON.stringify(r),/DO_NOT_STORE|private\.invalid/);
  });
  for(const value of [null,[],['DO_NOT_STORE'],'DO_NOT_STORE']){const f=hrOwnerFailureFixture();f.result.hrOwnerDiagnostic=value;const r=summarize(f);assert.equal(r.observations.hrOwnerDiagnostic,null);assert.doesNotMatch(JSON.stringify(r),/DO_NOT_STORE/);}
  const f=hrOwnerFailureFixture();Object.assign(f.result.hrOwnerDiagnostic,{applied:'true',authorityPresent:1,retryable:{private:'DO_NOT_STORE'},ownerErrorSha256:'DO_NOT_STORE_HASH',authenticatedHrHttp:[200,201,202,0,100,599,600,'503',-1,200.5]});
  const d=summarize(f).observations.hrOwnerDiagnostic;assert.equal(d.applied,null);assert.equal(d.authorityPresent,null);assert.equal(d.retryable,null);assert.equal(d.ownerErrorSha256,null);
  assert.deepEqual(d.authenticatedHrHttp,[202,0,100,599,null,null,null,null]);assert.equal(d.authenticatedHrHttp.length,8);
  f.result.hrOwnerDiagnostic={available:false};const unavailable=summarize(f).observations.hrOwnerDiagnostic;
  assert.equal(unavailable.available,false);assert.equal(unavailable.ownerCode,null);assert.equal(unavailable.authenticatedHrHttp,null);
});
test('HR owner diagnostic is incorporated through the existing consumer with zero exports and no new PASS',async()=>{
  const f=hrOwnerFailureFixture(),folder=fs.mkdtempSync(path.join(os.tmpdir(),'finance-ui-hr-owner-')),resultText=JSON.stringify(f.result);
  fs.writeFileSync(path.join(folder,'finance-ui-readonly.json'),resultText);
  const run={id:1,run_attempt:1,head_sha:f.transport.controlHead};
  const job={id:2,name:'i3-finance-focal-reproof',status:'completed',conclusion:'failure',started_at:'2026-11-25T00:00:00Z',completed_at:'2026-11-25T00:01:00Z'};
  const artifact={id:3,name:'cxorbia-i3-finance-focal-1',digest:f.transport.artifactDigest,created_at:'2026-11-25T00:00:59Z',expired:false,workflow_run:{id:1,head_sha:run.head_sha}};
  const index={schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false},files=new Map();
  const controls={descriptor:{currentFunctionalEvidenceIndex:index},pointer:{currentFunctionalEvidenceIndex:index,currentResultIncorporationQueue:[{runId:1,runAttempt:1,jobId:2,name:job.name}]}};
  try{
    const result=await incorporateTypedResults({api:async()=>{throw Error('No network permitted');},token:'synthetic',run,jobs:[job],artifacts:[artifact],controls,
      journal:{artifacts:[artifact],pendingTypedResults:[{jobId:2,name:job.name}]},files,now:'2026-11-25T00:02:00Z',
      download:async()=>({folder,digest:artifact.digest,cleanup:()=>{}}),producerLoader:async()=>({descriptor:{currentMaterialization:identity},pointer:{},matrix:{}})});
    assert.equal(result.failures.length,0);assert.equal(result.incorporated.length,1);assert.equal(result.queue.size,0);
    const saved=JSON.parse([...files.entries()].find(([p])=>p.endsWith('_TYPED_RESULT.json'))[1]);
    assert.equal(saved.provenance.resultSha256,hash(resultText));assert.equal(saved.observations.hrOwnerDiagnostic.ownerCode,'HR_LIVE_HTTP_503');
    assert.equal(saved.observations.hrOwnerDiagnostic.applied,false);assert.deepEqual(saved.observations.sessions,[]);
    assert.equal(saved.classification,'ENVIRONMENT_FAILURE');assert.equal(saved.decision,'RECORDED_TYPED_RESULT_HOLD');assert.equal(saved.newDomainMatches,0);assert.deepEqual(saved.ownerSpecificReceipts,[]);
  }finally{fs.rmSync(folder,{recursive:true,force:true});}
});
