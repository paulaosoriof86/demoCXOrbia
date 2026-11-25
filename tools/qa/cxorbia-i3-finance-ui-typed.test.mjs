import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {incorporateTypedResults} from './cxorbia-i3-automatic-result-consumer.mjs';
import {summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
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
