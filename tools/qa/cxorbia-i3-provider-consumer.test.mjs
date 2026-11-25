import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingRuns,typedResultKey,pendingTypedRuns,pendingExternalTypedResults,pendingSatisfiedRequestRuns,projectCurrentAutomationReceipt,automationSuccessionFromProducer} from './cxorbia-i3-automatic-result-consumer.mjs';
import {projectCurrentScopedClauses} from './cxorbia-i3-scoped-clause-projection.mjs';
import {gitBlob,jsonBytes} from './cxorbia-i3-current-control-projection.mjs';

const uuid='56b76a83-3e5d-4957-99aa-2521a9c51845';
const job='i3-finance-focal-reproof';
function scanFixture(){
 const run={id:51,run_attempt:2,status:'completed'};
 const api=async route=>route.includes('/attempts/')?{jobs:[{name:job,conclusion:'failure'}]}:{workflow_runs:[run]};
 return {api,currentRunId:52,currentRunAttempt:1,knownPaths:new Map(),descriptor:{postDeployRunSeal:{executionProvider:'GOOGLE_CLOUD_BUILD',runId:uuid},actionsScanCursor:{provider:'GITHUB_ACTIONS',runId:'50',runAttempt:1}}};
}
test('Google UUID materialization preserves the real Actions scan floor and both missing attempts',async()=>{
 assert.deepEqual(await pendingRuns(scanFixture()),[{runId:51,runAttempt:1},{runId:51,runAttempt:2}]);
});
test('Google numeric generation is never substituted for the Actions cursor',async()=>{
 const f=scanFixture();f.descriptor.postDeployRunSeal={executionProvider:'GOOGLE_CLOUD_SHELL',runId:'1795605223282455'};
 assert.equal((await pendingRuns(f)).length,2);
});
test('external seal without a valid Actions cursor fails before the provider scan',async()=>{
 for(const cursor of [undefined,{provider:'GITHUB_ACTIONS',runId:uuid,runAttempt:1},{provider:'GOOGLE_CLOUD_BUILD',runId:'50',runAttempt:1}]){
  const f=scanFixture();f.descriptor.actionsScanCursor=cursor;let calls=0;f.api=async()=>{calls++;return {workflow_runs:[]};};
  await assert.rejects(pendingRuns(f),/SOURCE_FAILURE|MAPPING_FAILURE/);assert.equal(calls,0);
 }
});
test('Actions cursor attempt governs only the boundary Actions run after an external deployment',async()=>{
 const f=scanFixture();f.descriptor.actionsScanCursor={provider:'GITHUB_ACTIONS',runId:'51',runAttempt:1};
 f.descriptor.currentMaterialization={executionProvider:'GOOGLE_CLOUD_BUILD',runId:uuid,runAttempt:8};
 assert.deepEqual(await pendingRuns(f),[{runId:51,runAttempt:2}]);
});
function automationFixture(){
 const event={schemaVersion:'cxorbia.i3.automatic-execution-journal.v1',path:'docs/checkpoints/CXORBIA_I3_RUN51_ATTEMPT1_EXECUTION_JOURNAL.json',gitBlob:'b'.repeat(40),runId:51,runAttempt:1,outcome:'RECORDED_EXECUTION_NO_PRODUCT_PROMOTION',pendingTypedResults:[],materializationReceiptPath:null,production:false};
 const current={...event,executionProvider:'GOOGLE_CLOUD_BUILD',runId:uuid,path:'docs/checkpoints/CXORBIA_I3_GOOGLE_EXECUTION.json',gitBlob:'c'.repeat(40)};
 return {current,event,queue:new Map(),journalExists:false};
}
test('late Actions completion cannot replace the current Google execution by numeric ordering or clock',()=>{
 const f=automationFixture();f.event.observedAt='2099-01-01T00:00:00Z';const before=structuredClone(f.current),out=projectCurrentAutomationReceipt(f);
 assert.equal(out.changed,false);assert.deepEqual(out.receipt,before);
});
test('different external UUIDs require a predecessor transition instead of arrival order',()=>{
 const f=automationFixture();f.event={...f.current,runId:'a1b76a83-3e5d-4957-99aa-2521a9c51845',path:'other.json',gitBlob:'d'.repeat(40)};
 assert.equal(projectCurrentAutomationReceipt(f).changed,false);
});
test('the same provider execution cannot replay a divergent immutable journal outcome',()=>{
 const f=automationFixture();f.current=structuredClone(f.event);f.event.outcome='CONSUMED_EXACT_DEV_MATERIALIZATION';
 assert.throws(()=>projectCurrentAutomationReceipt(f),/SOURCE_FAILURE/);
});
function causalAutomationFixture(){
 const f=automationFixture(),journal={schemaVersion:f.current.schemaVersion,repository:'paulaosoriof86/demoCXOrbia',executionProvider:'GOOGLE_CLOUD_BUILD',runId:uuid,runAttempt:1,production:false,productActionsPerformedByConsumer:0};
 const bytes=jsonBytes(journal);f.current.gitBlob=gitBlob(bytes);
 const snapshot=()=>({currentAutomationReceipt:structuredClone(f.current)});
 f.producer={descriptor:snapshot(),pointer:snapshot(),blobs:new Map([[f.current.path,f.current.gitBlob]]),readBytes:async()=>bytes};
 f.controls={head:'a'.repeat(40),descriptor:snapshot(),pointer:snapshot()};return f;
}
test('a genuine new Actions producer containing the Google predecessor can resume automation',async()=>{
 const f=causalAutomationFixture(),succession=await automationSuccessionFromProducer(f);assert.equal(succession.expectedControlHead,f.controls.head);
 f.event.executionProvider='GITHUB_ACTIONS';f.event.succession=succession;
 const out=projectCurrentAutomationReceipt({...f,expectedControlHead:f.controls.head});assert.equal(out.changed,true);assert.equal(out.receipt.runId,51);assert.equal(out.receipt.executionProvider,'GITHUB_ACTIONS');
});
test('an older producer without the exact Google predecessor receives no transition authority',async()=>{
 const f=causalAutomationFixture();for(const key of ['descriptor','pointer'])f.producer[key].currentAutomationReceipt={...f.event};
 assert.equal(await automationSuccessionFromProducer(f),null);
});
test('a claimed producer predecessor without its immutable journal blob cannot advance automation',async()=>{
 const f=causalAutomationFixture();f.producer.blobs.set(f.current.path,'9'.repeat(40));
 await assert.rejects(automationSuccessionFromProducer(f),/AUTOMATION_SUCCESSION_PRODUCER_JOURNAL/);
});
test('automation transition rejects a caller CAS head different from the derived current control',async()=>{
 const f=causalAutomationFixture();f.event.succession=await automationSuccessionFromProducer(f);
 assert.throws(()=>projectCurrentAutomationReceipt({...f,expectedControlHead:'9'.repeat(40)}),/AUTOMATION_SUCCESSION_PREDECESSOR/);
});
test('legacy Actions keys stay byte-identical and Google identities have an explicit namespace',()=>{
 assert.equal(typedResultKey({runId:51,runAttempt:1,jobId:9}),'51/1/9');
 assert.equal(typedResultKey({executionProvider:'GITHUB_ACTIONS',runId:51,runAttempt:1,jobId:9}),'51/1/9');
 assert.equal(typedResultKey({executionProvider:'GOOGLE_CLOUD_BUILD',runId:uuid,runAttempt:1,jobId:'qa-step'}),`GOOGLE_CLOUD_BUILD/${uuid}/1/qa-step`);
 assert.equal(typedResultKey({provider:'GOOGLE_CLOUD_SHELL',key:'GOOGLE_CLOUD_SHELL/1795605223282455'}),'GOOGLE_CLOUD_SHELL/1795605223282455');
});
test('a UUID without a provider cannot become an Actions key',()=>{
 assert.throws(()=>typedResultKey({runId:uuid,runAttempt:1,jobId:9}),/SOURCE_FAILURE|MAPPING_FAILURE/);
});
test('Actions drain excludes explicitly external entries and preserves their queue objects',()=>{
 const queue=[{name:job,runId:51,runAttempt:1,jobId:9},{name:job,executionProvider:'GOOGLE_CLOUD_BUILD',runId:uuid,runAttempt:1,jobId:'qa-step'},{name:job,provider:'GOOGLE_CLOUD_SHELL',key:'GOOGLE_CLOUD_SHELL/1795605223282455'}],before=structuredClone(queue);
 assert.deepEqual(pendingTypedRuns(queue),[{runId:51,runAttempt:1}]);assert.deepEqual(queue,before);
 assert.deepEqual(pendingExternalTypedResults(queue),[{key:`GOOGLE_CLOUD_BUILD/${uuid}/1/qa-step`,executionProvider:'GOOGLE_CLOUD_BUILD'},{key:'GOOGLE_CLOUD_SHELL/1795605223282455',executionProvider:'GOOGLE_CLOUD_SHELL'}]);
});
test('external typed D08 evidence cannot be routed to the Actions run API',()=>{
 const controls={pointer:{currentD08UiQaRequest:{path:'request.json',gitBlob:'a'.repeat(40)},currentFunctionalEvidenceIndex:{results:[{provider:'GOOGLE_CLOUD_BUILD',runId:uuid,runAttempt:1,decision:'PASS_D08_TYPED_PARTIAL_INCORPORATION'}]}}};
 assert.deepEqual(pendingSatisfiedRequestRuns(controls),[]);
});
function metadataFixture(){
 const scope='f'.repeat(64);
 const matrix={classificationCounts:{HOLD:1},modules:[{domain:'finance-core-liquidation-costs',classification:'HOLD',currentResidualClauses:{pending:'Resolve amount and safe November metadata edit; finish UI.',preserved:'Existing finance accepted.'}}]};
 const result={kind:'FINANCE_METADATA',state:'HOLD',fullDomain:false,newDomainMatches:0,production:false,ownerSpecificReceipts:[],producer:{decision:'PASS_FINANCE_METADATA_ALREADY_APPLIED',jobConclusion:'success'},observations:{scopeSha256:scope,readbackExact:true,firstUnchanged:true,financialFactsUnchanged:true,sameLedgerTotal:true,advanceCount:2,newMovements:0,allocationOrPayoutWrites:0,providerCommandsExecuted:0,providerWrites:0,idempotentNoop:true,safety:{production:false,hrWrites:0,bankWrites:0,externalPaymentWrites:0,directFirestoreWrites:0,financialFactWrites:0}}};
 return {matrix,financeScopeSha256:scope,result};
}
test('external producer evidence cannot acquire unadapted Actions-only scoped credit',()=>{
 const f=metadataFixture(),out=projectCurrentScopedClauses({...f,verified:[{entry:{provider:'GOOGLE_CLOUD_SHELL',key:'GOOGLE_CLOUD_SHELL/1795605223282455'},result:f.result}]});
 assert.equal(out.changed,false);assert.deepEqual(out.matrix,f.matrix);
});
test('divergent same-key scoped replay is rejected instead of selecting one by input order',()=>{
 const f=metadataFixture(),first={entry:{key:'51/1/9',runId:51,runAttempt:1,jobId:9},result:f.result},second=structuredClone(first);second.result.observations.scopeSha256='a'.repeat(64);
 assert.throws(()=>projectCurrentScopedClauses({...f,verified:[first,second]}),/SOURCE_FAILURE|MAPPING_FAILURE/);
});
