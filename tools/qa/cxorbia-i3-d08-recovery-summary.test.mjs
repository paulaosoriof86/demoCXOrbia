// Exact recovery summaries and request retirement; mocked artifacts only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
import {incorporateTypedResults,retireSatisfiedD08RecoveryRequest,pendingSatisfiedRequestRuns,runJournal,typedResultKey} from './cxorbia-i3-automatic-result-consumer.mjs';
import {DESCRIPTOR,POINTER,gitBlob,sha256,jsonBytes} from './cxorbia-i3-current-control-projection.mjs';
const targetHash='f77b28264754da5011b40b25e19107c3091f34f7163108d24ba50ddd7e2446fc';
const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40)};
function fixture(){
 const raw={schemaVersion:'cxorbia.i3.d08-recovery-cleanup.v1',state:'HOLD',decision:'PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP',runId:'12345678',runAttempt:'1',executionMode:'RECOVERY_ONLY',fixtureRunId:'45514816284',fixtureRunAttempt:'1',originalJournalSha256:targetHash,...identity,
  production:false,phaseAComplete:false,fullDomain:false,newDomainMatches:0,fixtureCreates:0,providerCommands:0,hrWrites:0,productionWrites:0,expectedDocuments:18,expectedAuthUsers:4,firestoreTransactionConfirmed:true,
  cleanup:{ok:true,exactKnownPathsOnly:true,ownershipTransaction:true,deletedDocuments:18,deletedAuth:4,remainingOwnedDocuments:0,remainingOwnedAuth:0},deletedPaths:['DO_NOT_STORE_UID'],private:'DO_NOT_STORE_PRIVATE'};
 const transport={runId:12345678,runAttempt:1,jobId:222,artifactId:333,jobName:'i3-run2382-academy-b7-isolated-dev-qa',jobConclusion:'success',controlHead:'d'.repeat(40),artifactDigest:'sha256:'+'e'.repeat(64),verifiedArchiveDigest:'sha256:'+'e'.repeat(64),entry:'d08-recovery/result.json'};
 const summarize=()=>summarizeTypedResult({resultText:JSON.stringify(raw),transport,expectedIdentity:identity});
 const requestBody={schemaVersion:'cxorbia.i3.d08-ui-qa-request.v1',executionMode:'RECOVERY_ONLY',authorization:'PAULA_AUTHORIZED_D08_DEV_ONLY',production:false,...identity,recoveryRun2783:{runId:raw.fixtureRunId,runAttempt:'1',journalSha256:targetHash,expectedDocuments:18,expectedAuthUsers:4}};
 const requestPath='docs/checkpoints/REQUEST_D08_RECOVERY.json',requestBytes=jsonBytes(requestBody),request={path:requestPath,gitBlob:gitBlob(requestBytes)};
 const residual={status:'PENDING_UI',remaining:['Admin Shopper Cliente UI clauses'],currentUiCertified:false};
 const index={schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false};
 const descriptor={currentD08UiQaRequest:structuredClone(request),d08AcademyProgressResidual:structuredClone(residual),currentFunctionalEvidenceIndex:index};
 const pointer=structuredClone(descriptor),known=new Map();
 const controls={descriptor,pointer,blobs:new Map(),readBytes:async p=>{assert.ok(known.has(p));return known.get(p);}};
 const producer={descriptor:{currentD08UiQaRequest:request,currentMaterialization:identity},pointer:{currentD08UiQaRequest:request},blobs:new Map([[requestPath,request.gitBlob]]),readBytes:async p=>{assert.equal(p,requestPath);return requestBytes;}};
 const files=new Map(),entry={runId:12345678,runAttempt:1,jobId:222,path:'docs/checkpoints/RECOVERY_TYPED.json',gitBlob:'f'.repeat(40),sha256:'1'.repeat(64)};
 return {raw,transport,summarize,requestBody,requestBytes,requestPath,request,residual,controls,producer,files,entry,known};
}
test('recovery PASS records exact absence without functional credit or raw identities',()=>{
 const f=fixture(),r=f.summarize();assert.equal(r.kind,'D08_RECOVERY');assert.equal(r.state,'HOLD');assert.equal(r.newDomainMatches,0);assert.equal(r.fullDomain,false);assert.deepEqual(r.ownerSpecificReceipts,[]);assert.equal(r.observations.cleanup.deletedDocuments,18);assert.doesNotMatch(JSON.stringify(r),/DO_NOT_STORE/);
});
test('idempotent cleanup resumption permits already absent documents and residual Auth',()=>{
 const f=fixture();f.raw.cleanup.deletedDocuments=0;f.raw.cleanup.deletedAuth=2;assert.equal(f.summarize().observations.cleanup.deletedAuth,2);
});
test('held cleanup preserves unknown absence and its bounded error category',()=>{
 const f=fixture();f.raw.decision='HOLD';f.raw.cleanup={ok:false};delete f.raw.firestoreTransactionConfirmed;f.raw.error='PERSISTENCE_FAILURE:D08_RECOVERY_BUNDLE_CHANGED:DO_NOT_STORE';const r=f.summarize();assert.equal(r.observations.cleanup.remainingOwnedDocuments,null);assert.equal(r.classification,'PERSISTENCE_FAILURE');assert.doesNotMatch(JSON.stringify(r),/DO_NOT_STORE/);
});
for(const [name,change]of [
 ['different fixture',f=>f.raw.fixtureRunId='45514816285'],['different original bytes',f=>f.raw.originalJournalSha256='0'.repeat(64)],
 ['unverified absence',f=>f.raw.cleanup.remainingOwnedAuth=1],['partial deletions claimed PASS',f=>f.raw.cleanup.deletedDocuments=17],
 ['new fixture',f=>f.raw.fixtureCreates=1],['command replay',f=>f.raw.providerCommands=1],['production write',f=>f.raw.productionWrites=1],
 ['functional credit',f=>f.raw.newDomainMatches=1],['full-domain credit',f=>f.raw.fullDomain=true],['unconfirmed transaction',f=>f.raw.firestoreTransactionConfirmed=false],
 ['wrong execution run',f=>f.raw.runId='99999999'],['UI mode',f=>f.raw.executionMode='UI_WITH_RECOVERY']
])test('rejects '+name,()=>{const f=fixture();change(f);assert.throws(()=>f.summarize(),/TYPED_SUMMARY_/);});
test('cleanup-only retirement archives only the exact request and preserves functional residuals',async()=>{
 const f=fixture();assert.equal(await retireSatisfiedD08RecoveryRequest({...f,result:f.summarize()}),true);
 for(const file of [DESCRIPTOR,POINTER]){const v=JSON.parse(f.files.get(file));assert.equal(v.currentD08UiQaRequest,undefined);assert.deepEqual(v.d08AcademyProgressResidual,f.residual);}
 const archive=[...f.files.keys()].find(p=>p.endsWith('_SATISFIED_D08_RECOVERY_REQUEST.json'));assert.ok(archive);assert.equal(JSON.parse(f.files.get(archive)).fixtureRunId,'45514816284');
});
test('late cleanup result cannot remove a newer request',async()=>{
 const f=fixture(),newer={path:'docs/checkpoints/NEWER_D08_REQUEST.json',gitBlob:'9'.repeat(40)};f.controls.pointer.currentD08UiQaRequest=newer;f.controls.descriptor.currentD08UiQaRequest=structuredClone(newer);
 assert.equal(await retireSatisfiedD08RecoveryRequest({...f,result:f.summarize()}),true);assert.equal(f.files.size,0);assert.equal(f.entry.requestBinding.path,f.requestPath);
});
test('a failed job cannot retire the request even if its cleanup fields claim PASS',async()=>{
 const f=fixture();f.transport.jobConclusion='failure';assert.equal(await retireSatisfiedD08RecoveryRequest({...f,result:f.summarize()}),false);assert.equal(f.files.size,0);
});
test('a UI request cannot be retired by cleanup evidence',async()=>{
 const f=fixture(),bytes=jsonBytes({...f.requestBody,executionMode:'UI_WITH_RECOVERY'}),request={path:f.requestPath,gitBlob:gitBlob(bytes)};
 f.producer.pointer.currentD08UiQaRequest=request;f.producer.descriptor.currentD08UiQaRequest=request;f.producer.blobs.set(request.path,request.gitBlob);f.producer.readBytes=async()=>bytes;
 await assert.rejects(retireSatisfiedD08RecoveryRequest({...f,result:f.summarize()}),/D08_RECOVERY_REQUEST_RECEIPT_BINDING/);assert.equal(f.files.size,0);
});
function integration(){
 const f=fixture(),run={id:12345678,run_number:2784,run_attempt:1,head_sha:f.transport.controlHead,head_branch:'recovery/cxorbia-phase-a-20260831',path:'.github/workflows/cxorbia-recovery-i3-dev-certification.yml',repository:{full_name:'paulaosoriof86/demoCXOrbia'},status:'completed',conclusion:'success'};
 const job={id:222,run_id:run.id,run_attempt:1,name:f.transport.jobName,conclusion:'success',status:'completed',started_at:'2026-11-25T01:00:00Z',completed_at:'2026-11-25T01:02:00Z'};
 const artifact={id:333,name:'cxorbia-i3-run2382-academy-b7-synthetic-'+run.id,digest:f.transport.artifactDigest,created_at:'2026-11-25T01:01:59Z',expired:false,workflow_run:{id:run.id,head_sha:run.head_sha}};
 const journal=runJournal({run,jobs:[job],artifacts:[artifact],now:'2026-11-25T01:02:01Z'});journal.pendingTypedResults=[{jobId:job.id,name:job.name,conclusion:'success'}];
 f.controls.pointer.currentResultIncorporationQueue=[{runId:run.id,runAttempt:1,jobId:job.id,name:job.name}];let downloads=0;
 const download=async()=>{downloads++;const folder=fs.mkdtempSync(path.join(os.tmpdir(),'d08-recovery-test-'));fs.mkdirSync(path.join(folder,'d08-recovery'));fs.writeFileSync(path.join(folder,'d08-recovery/result.json'),JSON.stringify(f.raw));return {folder,digest:artifact.digest,cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})};};
 const args={api:async()=>{throw Error('NO_NETWORK');},token:'LOCAL_FIXTURE',run,jobs:[job],artifacts:[artifact],controls:f.controls,journal,files:f.files,now:'2026-11-25T01:02:01Z',download,producerLoader:async()=>f.producer};
 return {...f,args,get downloads(){return downloads;}};
}
test('same-job cleanup artifact is incorporated, queued work removed, exact request retired',async()=>{
 const f=integration(),out=await incorporateTypedResults(f.args);assert.deepEqual(out.failures,[]);assert.equal(out.incorporated.length,1);assert.equal(out.queue.size,0);assert.equal(out.requestsReconciled,1);
 const entry=out.incorporated[0],receipt=JSON.parse(f.files.get(entry.path));assert.equal(entry.kind,'D08_RECOVERY');assert.equal(entry.ownerReceiptCount,0);assert.equal(receipt.newDomainMatches,0);assert.equal(receipt.observations.cleanup.remainingOwnedDocuments,0);assert.equal(JSON.parse(f.files.get(POINTER)).currentD08UiQaRequest,undefined);
});
test('saved cleanup can repair a missed request retirement without downloading again',async()=>{
 const f=integration(),first=await incorporateTypedResults(f.args),entry=first.incorporated[0];
 f.controls.pointer.currentFunctionalEvidenceIndex=first.index;f.controls.descriptor.currentFunctionalEvidenceIndex=structuredClone(first.index);f.controls.pointer.currentResultIncorporationQueue=[];
 f.known.set(entry.path,f.files.get(entry.path));f.files.clear();
 assert.deepEqual(pendingSatisfiedRequestRuns(f.controls),[{runId:12345678,runAttempt:1}]);
 const second=await incorporateTypedResults(f.args);assert.deepEqual(second.failures,[]);assert.equal(f.downloads,1);assert.equal(second.requestsReconciled,1);assert.equal(JSON.parse(f.files.get(POINTER)).currentD08UiQaRequest,undefined);
});
test('held recovery is incorporated without retiring its request',async()=>{
 const f=integration();f.raw.decision='HOLD';f.raw.cleanup={ok:false};delete f.raw.firestoreTransactionConfirmed;f.args.jobs[0].conclusion='failure';
 const out=await incorporateTypedResults(f.args);assert.deepEqual(out.failures,[]);assert.equal(out.incorporated.length,1);assert.equal(out.requestsReconciled,0);assert.equal(f.files.has(POINTER),false);assert.equal(out.queue.size,0);
});
