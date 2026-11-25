// Read-only review tests. Temp artifacts and mocked GitHub only; no repo/provider mutation.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {incorporateTypedResults,consumeRun,selectTypedArtifact,pendingTypedRuns,pendingSatisfiedRequestRuns,retireSatisfiedD08Request,runJournal,typedResultKey} from './cxorbia-i3-automatic-result-consumer.mjs';
import {DESCRIPTOR,POINTER,gitBlob,sha256,jsonBytes,projectCurrentResidualNextAction} from './cxorbia-i3-current-control-projection.mjs';
import {TYPED_SUMMARY_SCHEMAS} from './cxorbia-i3-typed-result-summary.mjs';

// Small synthetic producer-shaped results. No test imports, providers or secrets.
function typedSummaryFixture(kind='F3_ENDPOINT'){
  const schema=Object.keys(TYPED_SUMMARY_SCHEMAS).find(key=>TYPED_SUMMARY_SCHEMAS[key].kind===kind);
  const spec=TYPED_SUMMARY_SCHEMAS[schema];
  const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40)};
  const transport={jobName:spec.job,entry:spec.entry};
  if(kind==='F3_ENDPOINT')return {transport,raw:{
    schemaVersion:schema,state:'HOLD',decision:'HOLD_F3_ISOLATED_ENDPOINT',runId:'12345678',runAttempt:'1',...identity,
    syntheticOnly:true,b14Closed:false,newModuleMatches:0,productionWrites:0,operationalHrWrites:0,
    applicationAckProven:false,recoveryRequired:true,cases:[],events:[],remoteCommandAttempts:[],
    cleanup:{firestore:false,auth:false,remoteMake:false,authPreservedForRecovery:true},
    failure:'PERSISTENCE_FAILURE:F3_QA_LOCK_OWNER:PRIVATE_SUFFIX_NOT_FOR_SUMMARY'
  }};
  assert.equal(kind,'A08_RESIDUAL');
  return {transport,raw:{
    schemaVersion:schema,gate:'HOLD',decision:'HOLD_I3_A08_STORAGE_PENDING',fullA08Certified:false,newDomainMatches:0,...identity,
    scope:{executionMode:'PASSWORD_ONLY'},scopeDecision:'PASS_I3_A08_PASSWORD3_SCOPED_READONLY',
    passwordProofs:[{pass:true},{pass:true},{pass:true}],apiProofs:[],
    finalChecks:{seal:true,passwords:true,apis:false,storage:false,requestedScopePass:true,pass:false},
    sameArtifactAfter:true,safety:{production:false,providerCommands:0,directAuthWrites:0,directFirestoreWrites:0,hrWrites:0}
  }};
}


const now='2026-11-24T22:00:00Z';
function fixture(kinds=['F3_ENDPOINT']){
  const run={id:12345678,run_number:2782,run_attempt:1,head_sha:'d'.repeat(40),head_branch:'recovery/cxorbia-phase-a-20260831',path:'.github/workflows/cxorbia-recovery-i3-dev-certification.yml',repository:{full_name:'paulaosoriof86/demoCXOrbia'},status:'completed',conclusion:'failure'};
  const rows=kinds.map((kind,i)=>{const f=typedSummaryFixture(kind),job={id:222+i,run_id:run.id,run_attempt:1,name:f.transport.jobName,conclusion:'failure',status:'completed',started_at:'2026-11-24T21:40:00Z',completed_at:'2026-11-24T21:46:00Z'};
    const prefix=kind==='F3_ENDPOINT'?'cxorbia-i3-b14-qa-provider':kind==='A08_RESIDUAL'?'cxorbia-i3-two-keepers-role-e2e-readonly':'cxorbia-i3-finance-focal';
    const artifact={id:333+i,name:prefix+'-'+run.id,digest:'sha256:'+'e'.repeat(64),created_at:'2026-11-24T21:45:59Z',expired:false,workflow_run:{id:run.id,head_sha:run.head_sha}};
    return {raw:f.raw,entry:f.transport.entry,job,artifact};});
  const jobs=rows.map(r=>r.job),artifacts=rows.map(r=>r.artifact),journal=runJournal({run,jobs,artifacts,now});
  journal.outcome='RECORDED_EXECUTION_NO_PRODUCT_PROMOTION';journal.materializationReceiptPath=null;
  journal.pendingTypedResults=jobs.map(job=>({jobId:job.id,name:job.name,conclusion:job.conclusion,state:'EVIDENCE_RECORDED_TYPED_CLAUSE_INCORPORATION_REQUIRED'}));
  const queue=jobs.map(job=>({runId:run.id,runAttempt:run.run_attempt,jobId:job.id,name:job.name}));
  const evidenceIndex={schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false};
  const known=new Map(),controls={descriptor:{currentFunctionalEvidenceIndex:evidenceIndex},pointer:{currentResultIncorporationQueue:queue,currentFunctionalEvidenceIndex:evidenceIndex},readBytes:async p=>{assert.ok(known.has(p),'unexpected receipt read '+p);return known.get(p);}};
  const files=new Map();let downloads=0;
  const download=async(_api,artifact)=>{downloads++;const row=rows.find(r=>r.artifact.id===artifact.id),folder=fs.mkdtempSync(path.join(os.tmpdir(),'typed-review-'));fs.writeFileSync(path.join(folder,row.entry),JSON.stringify(row.raw));return {folder,digest:artifact.digest,cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})};};
  const producerLoader=async()=>({descriptor:{currentMaterialization:{sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40)}},pointer:{},matrix:{}});
  const args={api:async()=>{throw Error('No network allowed');},token:'synthetic',run,jobs,artifacts,controls,journal,files,now,download,producerLoader};
  return {args,rows,known,files,get downloads(){return downloads;}};
}
function installOld(f,index=0){
  const job=f.args.jobs[index],provenance={runId:String(f.args.run.id),runAttempt:'1',jobId:String(job.id),controlHead:f.args.run.head_sha,artifactId:String(f.args.artifacts[index].id),artifactDigest:f.args.artifacts[index].digest};
  const saved={schemaVersion:'cxorbia.i3.typed-result-summary.v1',provenance,ownerSpecificReceipts:[],state:'HOLD',newDomainMatches:0,production:false},text=jsonBytes(saved);
  const p=`docs/checkpoints/CXORBIA_I3_RUN${f.args.run.id}_ATTEMPT1_JOB${job.id}_TYPED_RESULT.json`;
  f.known.set(p,text);const entry={key:typedResultKey({...provenance,runId:f.args.run.id,runAttempt:1,jobId:job.id}),path:p,gitBlob:gitBlob(text),sha256:sha256(text),...provenance};
  f.args.controls.pointer.currentFunctionalEvidenceIndex.results.push(entry);return entry;
}

function mockedGitApi({initialFiles,run,jobs,artifacts}){
  // Queue/receipt tests start from a current action; complete successor-schema
  // and stale-action repair are exercised in scoped-clause-projection tests.
  const descriptor=JSON.parse(initialFiles.get(DESCRIPTOR)),pointer=JSON.parse(initialFiles.get(POINTER));
  const matrix=JSON.parse(initialFiles.get(descriptor.moduleTruthPath)),ledger=JSON.parse(initialFiles.get(descriptor.findingsLedgerPath));
  projectCurrentResidualNextAction({descriptor,pointer,matrix,ledger});
  for(const [file,value]of [[DESCRIPTOR,descriptor],[POINTER,pointer],[descriptor.moduleTruthPath,matrix],[descriptor.findingsLedgerPath,ledger]])initialFiles.set(file,jsonBytes(value));
  let head='1'.repeat(40),next=2;const blobs=new Map(),trees=new Map(),commits=new Map(),mutatedPaths=[];
  const makeSha=()=>String(next++).padStart(40,'0');
  const tree=new Map();for(const [p,text]of initialFiles){const b=gitBlob(text);blobs.set(b,text);tree.set(p,b);}trees.set('2'.repeat(40),tree);commits.set(head,{sha:head,tree:{sha:'2'.repeat(40)},parents:[]});
  const api=async(route,body,method='GET')=>{
    if(route.includes('/actions/runs/')&&route.includes('/jobs?'))return {jobs};
    if(route.includes('/actions/runs/')&&route.includes('/artifacts?'))return {artifacts};
    if(route.includes('/actions/runs/'))return run;
    if(route.includes('/git/ref/heads/'))return {object:{sha:head}};
    if(route.includes('/git/refs/heads/')&&method==='PATCH'){assert.equal(body.force,false);head=body.sha;return {object:{sha:head}};}
    if(route.endsWith('/git/blobs')&&body){const b=gitBlob(body.content);blobs.set(b,body.content);return {sha:b};}
    if(route.includes('/git/blobs/')){const b=route.split('/').at(-1);assert.ok(blobs.has(b));return {sha:b,content:Buffer.from(blobs.get(b)).toString('base64'),encoding:'base64'};}
    if(route.endsWith('/git/trees')&&body){const t=new Map(trees.get(body.base_tree));for(const e of body.tree){t.set(e.path,e.sha);mutatedPaths.push(e.path);}const sha=makeSha();trees.set(sha,t);return {sha};}
    if(route.includes('/git/trees/')){const sha=route.split('/git/trees/')[1].split('?')[0];assert.ok(trees.has(sha));return {sha,truncated:false,tree:[...trees.get(sha)].map(([path,sha])=>({path,sha,type:'blob'}))};}
    if(route.endsWith('/git/commits')&&body){const sha=makeSha(),c={sha,tree:{sha:body.tree},parents:body.parents.map(sha=>({sha}))};commits.set(sha,c);return c;}
    if(route.includes('/git/commits/')){const c=commits.get(route.split('/').at(-1));assert.ok(c);return c;}
    throw Error('Unexpected mocked route '+route);
  };
  const currentText=p=>blobs.get(trees.get(commits.get(head).tree.sha).get(p));
  return {api,mutatedPaths,currentText};
}

test('existing journal is immutable while previously incorporated receipt drains exact queue',async()=>{
  const f=fixture(),entry=installOld(f),journalPath=`docs/checkpoints/CXORBIA_I3_RUN${f.args.run.id}_ATTEMPT1_EXECUTION_JOURNAL.json`,journalText=jsonBytes(f.args.journal);
  const matrixPath='RECOVERY-I3-MODULE-TRUTH-MATRIX-20261124-V999.json',ledgerPath='CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V999_2026-11-24.json';
  const previousAutomation={runId:99999999,marker:'must-remain-current'},pointer={...f.args.controls.pointer,currentAutomationReceipt:previousAutomation};
  const descriptor={findingsLedgerPath:ledgerPath,moduleTruthPath:matrixPath,currentAutomationReceipt:previousAutomation,currentFunctionalEvidenceIndex:pointer.currentFunctionalEvidenceIndex};
  const mock=mockedGitApi({initialFiles:new Map([[DESCRIPTOR,jsonBytes(descriptor)],[POINTER,jsonBytes(pointer)],[matrixPath,'{}\n'],[ledgerPath,'{}\n'],[journalPath,journalText],[entry.path,f.known.get(entry.path)]]),run:f.args.run,jobs:f.args.jobs,artifacts:f.args.artifacts});
  const result=await consumeRun({api:mock.api,token:'synthetic',runId:f.args.run.id,runAttempt:1,now});
  assert.equal(result.decision,'CONSUMED_EXISTING_JOURNAL_TYPED_RESULTS');assert.equal(mock.currentText(journalPath),journalText);assert.ok(!mock.mutatedPaths.includes(journalPath));
  const p=JSON.parse(mock.currentText(POINTER));assert.deepEqual(p.currentResultIncorporationQueue,[]);assert.deepEqual(p.currentAutomationReceipt,previousAutomation);
});
test('two new results: one unsupported schema cannot discard the verified result',async()=>{
  const f=fixture(['F3_ENDPOINT','A08_RESIDUAL']);f.rows[1].raw.schemaVersion='unknown.schema';
  const out=await incorporateTypedResults(f.args);assert.equal(out.incorporated.length,1);assert.equal(out.failures.length,1);assert.equal(out.queue.size,1);assert.equal(f.files.size,1);
});
test('existing index hash mismatch is isolated per job and does not discard earlier valid result',async()=>{
  const f=fixture(['F3_ENDPOINT','A08_RESIDUAL']),old=installOld(f,1);old.gitBlob='0'.repeat(40);
  const out=await incorporateTypedResults(f.args);assert.equal(out.incorporated.length,1);assert.equal(out.failures.length,1);assert.equal(out.queue.size,1);assert.equal(f.files.size,1);
});
test('unsupported producer stays queued and does not download or create credit',async()=>{
  const f=fixture();f.args.journal.pendingTypedResults[0].name='other-source-proof';f.args.jobs[0].name='other-source-proof';f.args.controls.pointer.currentResultIncorporationQueue[0].name='other-source-proof';
  const out=await incorporateTypedResults(f.args);assert.equal(out.queue.size,1);assert.equal(out.incorporated.length,0);assert.equal(f.downloads,0);assert.equal(f.files.size,0);
});
test('typed queue before materialization floor is returned independently of that floor',()=>{
  const queue=[{runId:100,runAttempt:1,jobId:1,name:'i3-b14-qa-provider-proof'},{runId:100,runAttempt:1,jobId:2,name:'i3-finance-focal-reproof'},{runId:99,runAttempt:1,jobId:3,name:'unsupported'}];
  assert.deepEqual(pendingTypedRuns(queue),[{runId:100,runAttempt:1}]);
});
test('current typed workflow legacy artifact name is valid on attempt two when job window is exact',()=>{
  const f=fixture();f.args.run.run_attempt=2;f.args.jobs[0].run_attempt=2;
  assert.equal(selectTypedArtifact({run:f.args.run,job:f.args.jobs[0],artifacts:f.args.artifacts}).id,f.args.artifacts[0].id);
});
test('fresh artifact must match the immutable journal artifact digest before incorporation',async()=>{
  const f=fixture();f.args.journal.artifacts[0].digest='sha256:'+'0'.repeat(64);
  const out=await incorporateTypedResults(f.args);assert.equal(out.incorporated.length,0);assert.equal(out.failures.length,1);assert.equal(out.queue.size,1);assert.equal(f.files.size,0);
});
test('divergent descriptor and pointer indices reject both direct incorporation and control loading before mutation',async()=>{
  const f=fixture(),entry=installOld(f);
  f.args.controls.descriptor.currentFunctionalEvidenceIndex={schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false};
  await assert.rejects(incorporateTypedResults(f.args),/MAPPING_FAILURE:TYPED_INDEX_CONTROL_DESYNC/);
  assert.equal(f.downloads,0);assert.equal(f.files.size,0);
  const journalPath=`docs/checkpoints/CXORBIA_I3_RUN${f.args.run.id}_ATTEMPT1_EXECUTION_JOURNAL.json`;
  const matrixPath='RECOVERY-I3-MODULE-TRUTH-MATRIX-20261124-V999.json',ledgerPath='CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V999_2026-11-24.json';
  const descriptor={...f.args.controls.descriptor,findingsLedgerPath:ledgerPath,moduleTruthPath:matrixPath};
  const mock=mockedGitApi({initialFiles:new Map([[DESCRIPTOR,jsonBytes(descriptor)],[POINTER,jsonBytes(f.args.controls.pointer)],[matrixPath,'{}\n'],[ledgerPath,'{}\n'],[journalPath,jsonBytes(f.args.journal)],[entry.path,f.known.get(entry.path)]]),run:f.args.run,jobs:f.args.jobs,artifacts:f.args.artifacts});
  await assert.rejects(consumeRun({api:mock.api,token:'synthetic',runId:f.args.run.id,runAttempt:1,now}),/MAPPING_FAILURE:TYPED_INDEX_CONTROL_DESYNC/);
  assert.deepEqual(mock.mutatedPaths,[]);
});
test('old receipt artifact identity must match its index before the exact queue item can drain',async()=>{
  for(const [field,value]of [['artifactId','999999'],['artifactDigest','sha256:'+'0'.repeat(64)]]){
    const f=fixture(),entry=installOld(f);entry[field]=value;
    const out=await incorporateTypedResults(f.args);
    assert.equal(out.incorporated.length,0,field);assert.equal(out.failures.length,1,field);
    assert.equal(out.failures[0].code,'SOURCE_FAILURE:TYPED_INDEX_ARTIFACT_IDENTITY',field);
    assert.equal(out.queue.size,1,field);assert.equal(f.files.size,0,field);assert.equal(f.downloads,0,field);
  }
});
test('draining one run preserves another run pending failure and clears only the resolved failure',async()=>{
  const f=fixture(),entry=installOld(f),journalPath=`docs/checkpoints/CXORBIA_I3_RUN${f.args.run.id}_ATTEMPT1_EXECUTION_JOURNAL.json`,journalText=jsonBytes(f.args.journal);
  const matrixPath='RECOVERY-I3-MODULE-TRUTH-MATRIX-20261124-V999.json',ledgerPath='CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V999_2026-11-24.json';
  const otherQueue={runId:11111111,runAttempt:1,jobId:999,name:'i3-finance-focal-reproof'};
  const otherFailure={...otherQueue,key:typedResultKey(otherQueue),code:'SOURCE_FAILURE:TYPED_ARTIFACT_MISSING_OR_AMBIGUOUS',observedAt:'2026-11-24T20:00:00Z'};
  const resolvedFailure={key:entry.key,runId:f.args.run.id,runAttempt:1,jobId:f.args.jobs[0].id,code:'SOURCE_FAILURE:TYPED_RESULT_ENTRY_MISSING_OR_AMBIGUOUS',observedAt:'2026-11-24T21:00:00Z'};
  const pointer={...f.args.controls.pointer,currentResultIncorporationQueue:[...f.args.controls.pointer.currentResultIncorporationQueue,otherQueue],currentTypedResultFailures:[otherFailure,resolvedFailure]};
  const descriptor={findingsLedgerPath:ledgerPath,moduleTruthPath:matrixPath,currentFunctionalEvidenceIndex:pointer.currentFunctionalEvidenceIndex,currentResultIncorporationQueue:pointer.currentResultIncorporationQueue,currentTypedResultFailures:pointer.currentTypedResultFailures};
  const mock=mockedGitApi({initialFiles:new Map([[DESCRIPTOR,jsonBytes(descriptor)],[POINTER,jsonBytes(pointer)],[matrixPath,'{}\n'],[ledgerPath,'{}\n'],[journalPath,journalText],[entry.path,f.known.get(entry.path)]]),run:f.args.run,jobs:f.args.jobs,artifacts:f.args.artifacts});
  const result=await consumeRun({api:mock.api,token:'synthetic',runId:f.args.run.id,runAttempt:1,now});
  assert.equal(result.decision,'CONSUMED_EXISTING_JOURNAL_TYPED_RESULTS');
  for(const file of [DESCRIPTOR,POINTER]){
    const current=JSON.parse(mock.currentText(file));
    assert.deepEqual(current.currentResultIncorporationQueue,[otherQueue]);
    assert.deepEqual(current.currentTypedResultFailures,[otherFailure]);
  }
  assert.equal(mock.currentText(journalPath),journalText);assert.ok(!mock.mutatedPaths.includes(journalPath));
});

function requestRetirementFixture(){
 const body={authorization:'PAULA_AUTHORIZED_D08_DEV_ONLY',production:false,sourceSha:'a'.repeat(40)},bytes=jsonBytes(body);
 const request={path:'docs/checkpoints/CXORBIA_I3_D08_UI_QA_REQUEST_TEST.json',gitBlob:gitBlob(bytes),state:'REQUESTED'};
 const residual={status:'PENDING',providerEvidence:{decision:'PASS',historicalProviderOnly:true},wholeD08HumanAcceptance:'PENDING',roleSessionsPending:['Admin','Shopper','Cliente'],currentReadOnlyUiObservation:{dateLocal:'2026-11-17'},currentUiCertified:false,remaining:['Current Admin, Shopper and Cliente independent UI/session acceptance','Unproved clause outside this exact request']};
 const controls={descriptor:{currentD08UiQaRequest:structuredClone(request),d08AcademyProgressResidual:structuredClone(residual)},pointer:{currentD08UiQaRequest:structuredClone(request),d08AcademyProgressResidual:structuredClone(residual)},blobs:new Map()};
 const producer={descriptor:{currentD08UiQaRequest:structuredClone(request)},pointer:{currentD08UiQaRequest:structuredClone(request)},blobs:new Map([[request.path,request.gitBlob]]),readBytes:async()=>bytes};
 const result={schemaVersion:'cxorbia.i3.d08-typed-incorporation.v1',decision:'PASS_D08_TYPED_PARTIAL_INCORPORATION',focalObligationCount:25,ownerSpecificReceipts:[{},{},{}],fullDomain:false,newDomainMatches:0,production:false,evidence:{requestCanonicalSha256:sha256(JSON.stringify(body))}};
 const entry={path:'docs/checkpoints/CXORBIA_I3_TEST_TYPED_RESULT.json',gitBlob:'b'.repeat(40),sha256:'c'.repeat(64),runId:12345678,runAttempt:1,jobId:222};
 return {result,entry,producer,controls,files:new Map()};
}
test('exact normalized D08 request retires atomically while unknown clauses and historical acceptance survive',async()=>{
 const f=requestRetirementFixture(),before=structuredClone(f.controls);
 assert.equal(await retireSatisfiedD08Request(f),true);assert.equal(f.files.size,3);
 for(const file of [DESCRIPTOR,POINTER]){
  const value=JSON.parse(f.files.get(file));assert.equal(value.currentD08UiQaRequest,undefined);
  assert.deepEqual(value.d08AcademyProgressResidual.providerEvidence,before.pointer.d08AcademyProgressResidual.providerEvidence);
  assert.equal(value.d08AcademyProgressResidual.wholeD08HumanAcceptance,'PENDING');
  assert.deepEqual(value.d08AcademyProgressResidual.remaining,['Unproved clause outside this exact request']);
 }
 assert.deepEqual(f.controls,before);assert.equal(f.entry.requestBinding.gitBlob,f.producer.pointer.currentD08UiQaRequest.gitBlob);
});
test('D08 incomplete result leaves request and files untouched',async()=>{
 const f=requestRetirementFixture();f.result.decision='RECORDED_D08_INCOMPLETE';
 assert.equal(await retireSatisfiedD08Request(f),false);assert.equal(f.files.size,0);assert.equal(f.entry.requestBinding,undefined);
});
test('late normalized D08 result binds its evidence but preserves a different active request',async()=>{
 const f=requestRetirementFixture();for(const o of [f.controls.descriptor,f.controls.pointer])o.currentD08UiQaRequest.gitBlob='f'.repeat(40);
 assert.equal(await retireSatisfiedD08Request(f),true);assert.equal(f.files.size,0);
 assert.equal(f.controls.pointer.currentD08UiQaRequest.gitBlob,'f'.repeat(40));
 assert.equal(f.entry.requestBinding.gitBlob,f.producer.pointer.currentD08UiQaRequest.gitBlob);
});
for(const kind of ['receipt hash','producer mismatch','archive collision'])test('D08 retirement rejects '+kind+' before changing files or index binding',async()=>{
 const f=requestRetirementFixture();
 if(kind==='receipt hash')f.result.evidence.requestCanonicalSha256='0'.repeat(64);
 if(kind==='producer mismatch')f.producer.descriptor.currentD08UiQaRequest.gitBlob='0'.repeat(40);
 if(kind==='archive collision')f.controls.blobs.set('docs/checkpoints/CXORBIA_I3_RUN12345678_ATTEMPT1_JOB222_SATISFIED_D08_REQUEST.json','0'.repeat(40));
 await assert.rejects(retireSatisfiedD08Request(f),/SOURCE_FAILURE:D08_/);assert.equal(f.files.size,0);assert.equal(f.entry.requestBinding,undefined);
});
test('already indexed D08 evidence closes its request without downloading or replacing its immutable receipt; replay is a no-op',async()=>{
 const f=fixture(),q=requestRetirementFixture();f.args.jobs[0].name='i3-run2382-academy-b7-isolated-dev-qa';f.args.jobs[0].conclusion='success';f.args.journal.pendingTypedResults[0].name=f.args.jobs[0].name;
 const entry=installOld(f),old=JSON.parse(f.known.get(entry.path));
 const saved={...q.result,evidence:{...q.result.evidence,...old.provenance}},text=jsonBytes(saved);
 entry.gitBlob=gitBlob(text);entry.sha256=sha256(text);entry.decision=saved.decision;f.known.set(entry.path,text);
 for(const key of ['descriptor','pointer'])Object.assign(f.args.controls[key],structuredClone(q.controls[key]));
 f.args.controls.blobs=new Map();f.args.producerLoader=async()=>q.producer;
 const out=await incorporateTypedResults(f.args);
 assert.equal(out.requestsReconciled,1);assert.equal(out.incorporated.length,0);assert.equal(out.queue.size,0);assert.equal(f.downloads,0);assert.equal(f.known.get(entry.path),text);
 for(const [file,key]of [[DESCRIPTOR,'descriptor'],[POINTER,'pointer']]){f.args.controls[key]=JSON.parse(f.files.get(file));f.args.controls[key].currentFunctionalEvidenceIndex=out.index;}
 f.args.controls.pointer.currentResultIncorporationQueue=[];f.files.clear();
 const replay=await incorporateTypedResults(f.args);assert.equal(replay.requestsReconciled,0);assert.equal(replay.incorporated.length,0);assert.equal(f.files.size,0);
});
test('request reconciliation finds an indexed fulfilled request even when the incorporation queue is empty',()=>{
 const f=requestRetirementFixture(),q=f.controls.pointer.currentD08UiQaRequest;
 f.controls.pointer.currentResultIncorporationQueue=[];
 f.controls.pointer.currentFunctionalEvidenceIndex={results:[
  {runId:1,runAttempt:1,decision:'PASS_D08_TYPED_PARTIAL_INCORPORATION'},
  {runId:2,runAttempt:1,decision:'PASS_D08_TYPED_PARTIAL_INCORPORATION',requestBinding:{path:q.path,gitBlob:'0'.repeat(40)}},
  {runId:3,runAttempt:1,decision:'RECORDED_D08_INCOMPLETE'}]};
 assert.deepEqual(pendingSatisfiedRequestRuns(f.controls),[{runId:1,runAttempt:1}]);
 delete f.controls.pointer.currentD08UiQaRequest;assert.deepEqual(pendingSatisfiedRequestRuns(f.controls),[]);
});
