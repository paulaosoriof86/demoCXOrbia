import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeMaterializationReceipt,projectMaterialization,bindControlPaths,validateProjectionRegistry,DESCRIPTOR,POINTER,gitBlob,jsonBytes} from './cxorbia-i3-current-control-projection.mjs';
import {validateZipListing,selectPairedArtifact,runJournal,commitFiles,requiredPairedAssets,validateConsumedJournal,pendingRuns,projectCurrentAutomationReceipt} from './cxorbia-i3-automatic-result-consumer.mjs';
import {validateCurrentAuthorityAliases,validResumedBuild} from './cxorbia-i3-current-authority-alias-guard.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
function inputs(){const descriptor=read(DESCRIPTOR);return {descriptor,pointer:read(POINTER),ledger:read(descriptor.findingsLedgerPath),matrix:read(descriptor.moduleTruthPath)};}
function fixture(){
 const controls=inputs(),d=controls.descriptor,runId=Number(d.currentMaterialization.runId)+100,attempt=1;
 const run={id:runId,run_number:3000,run_attempt:attempt,head_sha:'a'.repeat(40),head_branch:'recovery/cxorbia-phase-a-20260831',path:'.github/workflows/cxorbia-recovery-i3-dev-certification.yml',repository:{full_name:'paulaosoriof86/demoCXOrbia'},status:'in_progress',conclusion:null};
 const job={id:33,run_id:runId,run_attempt:attempt,name:'vrm154-156-dev-materialization',conclusion:'success',started_at:'2026-11-24T16:00:00Z',completed_at:'2026-11-24T16:05:00Z'};
 const artifact={id:44,name:`cxorbia-vrm154-156-dev-materialization-${runId}-${attempt}`,digest:'sha256:'+'d'.repeat(64),created_at:'2026-11-24T16:04:58Z',expired:false,workflow_run:{id:runId,head_sha:run.head_sha}};
 const sourceAssets=Object.fromEntries(Array.from({length:20},(_,i)=>[`core/file${i}.js`,'e'.repeat(64)]));
 const result={decision:'PASS_I3_GTHN_EXACT_DEV_MATERIALIZATION',sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,runtimeRevision:'cxorbia-live-hr-dev-00999-test',runtimeDigest:'sha256:'+'f'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/test',hostingRelease:'sites/cxorbia-backend-dev/channels/live/releases/test',hrRevision:'b'.repeat(64),servedSha256:{...sourceAssets},verifiedServedAssetCount:20,sourceHostedExact:true,runtimeTrafficExact:true,productionUnchanged:true,scenarioDimensionsProven:true,production:false,builds:1,runtimeDeploys:1,hostingDeploys:1,storageRulesDeploys:0,firestoreRulesDeploys:0,hrWrites:0};
 const hrResult={decision:'PASS_EXCEL_CANONICAL_ID_READONLY',...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,result[k]])),runId:String(runId),revision:result.hrRevision,production:false,fullDomain:false,firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0};
 return {controls,run,job,artifact,result,hrResult,sourceAssets,verifiedArchiveDigest:artifact.digest};
}
function project(f=fixture()){
 const bundle=makeMaterializationReceipt(f),out=projectMaterialization(f.controls,{...bundle,matrixPath:'RECOVERY-I3-MODULE-TRUTH-MATRIX-20261124-V999.json',ledgerPath:'CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V999_2026-11-24.json'});
 const files=bindControlPaths(out,{matrixPath:out.matrixPath,ledgerPath:out.ledgerPath});return {f,out,files,bundle};
}
test('ledger active self pointers advance together and stale paths fail validation',()=>{
 const {out}=project();
 assert.equal(out.ledger.findingsLedgerPath,out.descriptor.findingsLedgerPath);
 assert.equal(out.ledger.currentLedgerSuccessor,out.descriptor.findingsLedgerPath);
 out.ledger.findingsLedgerPath='stale-ledger.json';
 assert.ok(validateProjectionRegistry(out).failures.includes('CURRENT_PROJECTION_DESYNC:ledger.currentLedgerPath'));
});
test('interruption after deploy: exact receipt advances DEV without altering six domains, C3, or human approvals',()=>{
 const {f,out,files}=project();assert.equal(out.descriptor.postDeployRunSeal.runId,f.run.id);
 assert.deepEqual(out.matrix.modules.filter(x=>x.classification==='MATCH').map(x=>x.domain),f.controls.matrix.modules.filter(x=>x.classification==='MATCH').map(x=>x.domain));
 assert.deepEqual(out.descriptor.currentC3PreterminalAudit,f.controls.descriptor.currentC3PreterminalAudit);
 assert.equal(validateCurrentAuthorityAliases(out).pass,true,JSON.stringify(validateCurrentAuthorityAliases(out)));
 assert.equal(gitBlob(files.get(out.matrixPath)),out.descriptor.moduleTruthExpectedGitBlob);
 assert.equal(gitBlob(files.get(out.ledgerPath)),out.descriptor.findingsLedgerExpectedGitBlob);
 assert.equal(out.descriptor.productSourceSha,f.controls.descriptor.productSourceSha);
});
test('replay of exact run/attempt/receipt is a no-op, and does not create another successor',()=>{
 const {out,bundle}=project();const again=projectMaterialization(out,bundle);assert.equal(again.noop,true);
});
test('a lower attempt of the same run cannot supersede the current attempt',()=>{
 const {out,bundle}=project();out.descriptor.currentMaterialization.runAttempt=2;assert.throws(()=>projectMaterialization(out,bundle),/OUT_OF_ORDER/);
});
for(const [name,mutate]of [
 ['pointer last C3',o=>{o.pointer.lastModuleTruthProof.runId=1;}],
 ['matrix C3 transition',o=>{o.matrix.i3Q2HostingReleaseC3Pending.runtimeRevision='stale';}],
 ['ledger latest DEV',o=>{o.ledger.latestDev={runId:1};}],
 ['descriptor next block',o=>{o.descriptor.nextPlannedBlock.exactPending='repeat old deployment';}],
 ['nested hosting source',o=>{o.ledger.currentTruth.currentHostingSourceSha='old';}],
 ['nested candidate materialization',o=>{o.ledger.canonicalFunctionalCandidate.currentMaterialization={runId:1};}],
 ['nested matrix materialization',o=>{o.matrix.productSource.currentMaterialization={runId:1};}],
 ['snapshot date',o=>{o.pointer.asOf='2026-11-18T00:00:00Z';}],
 ['project completed reader repeated as pending',o=>{o.matrix.modules.find(m=>m.domain==='projects-periods-hr-source-wizard-multiproject').actionRequired='Repeat original Excel binding';}],
 ['client predecessor C3 presented as current',o=>{o.matrix.modules.find(m=>m.domain==='client-portal-reportkit').actionRequired='RUN2564 current-source C3 is complete';}],
 ['module serving source',o=>{o.matrix.modules[0].lastServedSource='old';}],
 ['module candidate source',o=>{o.matrix.modules[0].currentCandidateSource='old';}],
 ['module candidate tree',o=>{o.matrix.modules[0].currentCandidateTree='old';}],
 ['module cumulative source',o=>{o.matrix.modules[0].cumulativeSource='old';}],
 ['module nested deployment',o=>{o.matrix.modules[0].currentMaterialization={runId:1};}],
 ['module obsolete F2 operational receipt',o=>{o.matrix.modules[0].currentF2OperationalExcel={runId:1};}],
 ['module stale not deployed status',o=>{o.matrix.modules[0].sourceClosure={state:'COMPOSED_NOT_DEPLOYED'};}],
 ['owner serving source',o=>{o.matrix.sourceFiles.find(x=>x.currentServingAuthority).lastServedSource='old';}],
 ['owner serving receipt',o=>{o.matrix.sourceFiles.find(x=>x.currentServingAuthority).currentServingAuthority.runId=1;}],
 ])test(`previously unguarded active alias rejects ${name}`,()=>{const {out}=project();mutate(out);assert.equal(validateProjectionRegistry(out).pass,false);});
test('historical archives stay historical and do not become active source assertions',()=>{
 const {out}=project();out.matrix.historicalFixture={currentMaterialization:{sourceSha:'old'},nextExactAction:'old'};assert.equal(validateProjectionRegistry(out).pass,true);
});
for(const [name,mutate]of [
 ['A08 obsolete request',o=>{o.pointer.currentA08ResidualQaExecution={state:'REQUESTED'};}],
 ['D08 obsolete handoff',o=>{o.matrix.continuityHandoff||={};o.matrix.continuityHandoff.independentD08UiQaRequest={state:'REQUESTED'};}],
 ['finance obsolete request',o=>{o.ledger.findings['VRM-369'].currentExecutionScope={executionState:'REQUESTED_NOT_EXECUTED'};}]
])test('request guard rejects '+name,()=>{const {out}=project();mutate(out);assert.equal(validateProjectionRegistry(out).pass,false);});
test('D08 fulfilled request cannot remain active, but a distinct new request is allowed',()=>{
 const {out}=project(),request=out.pointer.currentD08UiQaRequest;
 assert.ok(request);
 for(const o of [out.descriptor,out.pointer])o.currentFunctionalEvidenceIndex={results:[{decision:'PASS_D08_TYPED_PARTIAL_INCORPORATION',requestBinding:{path:request.path,gitBlob:request.gitBlob}}]};
 assert.equal(validateProjectionRegistry(out).pass,false);
 for(const o of [out.descriptor,out.pointer])o.currentD08UiQaRequest.gitBlob='9'.repeat(40);
 assert.equal(validateProjectionRegistry(out).pass,true);
});
function pendingCandidateProjection(){
 const {out}=project(),prior=structuredClone(out.descriptor.currentMaterialization);
 for(const key of ['descriptor','pointer','ledger','matrix'])out[key].postDeployRunSeal.mode='PREDECESSOR_SERVING_PENDING_SOURCE';
 out.descriptor.productSourceSha='1'.repeat(40);out.descriptor.productSourceTree='2'.repeat(40);
 for(const mod of out.matrix.modules)for(const [key,value]of Object.entries({currentCandidateSource:out.descriptor.productSourceSha,currentCandidateTree:out.descriptor.productSourceTree,cumulativeSource:out.descriptor.productSourceSha}))if(Object.hasOwn(mod,key))mod[key]=value;
 return {out,prior};
}
test('pending candidate aliases advance while the served predecessor receipt stays immutable',()=>{
 const {out,prior}=pendingCandidateProjection();
 assert.equal(validateProjectionRegistry(out).pass,true);
 assert.deepEqual(out.descriptor.currentMaterialization,prior);
 assert.ok(out.matrix.modules.every(mod=>mod.lastServedSource===prior.sourceSha));
});
for(const key of ['currentCandidateSource','currentCandidateTree','cumulativeSource'])test(`pending candidate rejects stale ${key}`,()=>{
 const {out,prior}=pendingCandidateProjection(),mod=out.matrix.modules.find(mod=>Object.hasOwn(mod,key));
 assert.ok(mod);mod[key]=key==='currentCandidateTree'?prior.sourceTree:prior.sourceSha;
 assert.ok(validateProjectionRegistry(out).failures.includes(`CURRENT_PROJECTION_DESYNC:matrix.modules.${mod.domain}.${key}`));
 assert.deepEqual(out.descriptor.currentMaterialization,prior);
});
test('module alias migration preserves original receipts in history without changing approvals',()=>{
 const f=fixture(),mod=f.controls.matrix.modules[0];
 const old={sourceSha:'old-source',runtimeRevision:'old-runtime',runId:1};
 mod.currentMaterialization=old;mod.currentCandidateSource='old-source';mod.sourceClosure={state:'COMPOSED_NOT_DEPLOYED',proof:['original source proof']};
 const {out}=project(f),saved=out.archived.moduleCurrentAliases[mod.domain];
 assert.deepEqual(saved.currentMaterialization,old);assert.equal(saved.currentCandidateSource,'old-source');
 assert.deepEqual(saved.sourceClosure,mod.sourceClosure);
 assert.deepEqual(out.matrix.modules[0].currentMaterialization,out.descriptor.currentMaterialization);
 assert.equal(out.matrix.modules[0].classification,mod.classification);
});
for(const key of ['sourceSha','sourceTree','runId','runtimeRevision','runtimeDigest','hostingVersion','revision','production','hrWrites','authWrites','commandPosts','firestoreWrites'])test(`HR proof must match exact scope: ${key}`,()=>{
 const f=fixture();f.hrResult[key]=typeof f.hrResult[key]==='number'?1:typeof f.hrResult[key]==='boolean'?true:'other';assert.throws(()=>makeMaterializationReceipt(f),/HR_READBACK_IDENTITY/);
});
test('partial successful-looking result cannot certify missing served asset',()=>{const f=fixture();delete f.result.servedSha256['core/file19.js'];f.result.verifiedServedAssetCount--;assert.throws(()=>makeMaterializationReceipt(f),/INCOMPLETE_SERVED_INVENTORY/);});
for(const key of ['sourceHostedExact','runtimeTrafficExact','productionUnchanged'])test(`partial deploy rejects ${key}`,()=>{const f=fixture();f.result[key]=false;assert.throws(()=>makeMaterializationReceipt(f),/RELEASE_COMPOSITION_FAILURE/);});
test('modified ZIP digest, wrong source and duplicate artifact cannot be accepted',()=>{
 let f=fixture();f.verifiedArchiveDigest='sha256:'+'1'.repeat(64);assert.throws(()=>makeMaterializationReceipt(f),/ARTIFACT_DIGEST/);
 f=fixture();const bundle=makeMaterializationReceipt(f);bundle.receipt.materialization.sourceSha='2'.repeat(40);assert.throws(()=>projectMaterialization(f.controls,bundle),/NOT_CURRENT_PRODUCT/);
 f=fixture();assert.throws(()=>selectPairedArtifact({...f,artifacts:[f.artifact,{...f.artifact,id:45}]}),/AMBIGUOUS/);
});
test('artifact from previous run attempt is rejected; legacy name is accepted only on first attempt',()=>{
 const f=fixture();f.artifact.name=`cxorbia-vrm154-156-dev-materialization-${f.run.id}`;assert.equal(selectPairedArtifact({...f,artifacts:[f.artifact]}).id,44);
 f.run.run_attempt=2;f.job.run_attempt=2;assert.throws(()=>selectPairedArtifact({...f,artifacts:[f.artifact]}),/AMBIGUOUS/);
});
test('108 skipped jobs remain skipped and cannot create functional credit',()=>{
 const f=fixture(),jobs=[f.job,...Array.from({length:108},(_,i)=>({id:100+i,name:'skipped-'+i,conclusion:'skipped'}))];
 const j=runJournal({...f,jobs,artifacts:[f.artifact],now:'2026-11-24T16:05:00Z'});assert.equal(j.jobs.filter(x=>x.conclusion==='skipped').length,108);assert.equal(j.newDomainMatches,0);assert.equal(j.productActionsPerformedByConsumer,0);
});
test('ZIP paths reject traversal, absolute, windows, and duplicate entries',()=>{for(const entries of [['../result.json'],['/result.json'],['C:\\result.json'],['a','a']])assert.throws(()=>validateZipListing(entries),/SOURCE_FAILURE/);validateZipListing(['result.json','hr-after/result.json']);});
test('CAS conflict before any object creation aborts without writing',async()=>{
 let mutations=0;const api=async(route,body)=>{if(body)mutations++;return {object:{sha:'new'}};};
 await assert.rejects(()=>commitFiles(api,{expectedHead:'old',files:new Map(),message:'control'}),/CAS_HEAD_CHANGED/);assert.equal(mutations,0);
});
test('CAS race after commit construction prevents branch update and does not force',async()=>{
 let refs=0,patches=0;const api=async(route,body,method)=>{
  if(route.includes('/git/ref/heads/'))return {object:{sha:++refs===1?'old':'other'}};
  if(method==='PATCH'){patches++;assert.equal(body.force,false);}
  if(route.endsWith('/git/commits/old'))return {tree:{sha:'tree'}};
  if(route.endsWith('/git/blobs'))return {sha:gitBlob(body.content)};
  if(route.endsWith('/git/trees'))return {sha:'tree2'};
  if(route.endsWith('/git/commits'))return {sha:'new'};
  throw new Error(route);
 };
 await assert.rejects(()=>commitFiles(api,{expectedHead:'old',files:new Map([['docs/checkpoints/CXORBIA_I3_TEST.json','{}\n']]),message:'test'}),/CAS_HEAD_CHANGED/);assert.equal(patches,0);
});
test('source inventory comes from producer contract independently of result keys',()=>{assert.deepEqual(requiredPairedAssets("printf '%s' 'PAIR_ASSET_FILES=a.js b.js'"),['a.js','b.js']);assert.throws(()=>requiredPairedAssets(''),/ASSET_CONTRACT/);});
test('resumed build remains zero and needs original build, source, image and artifact proof',()=>{
 const f=fixture(),m=f.result;m.builds=0;m.buildProvenance={decision:'PASS_EXACT_SUCCESSFUL_BUILD_REUSED',builds:0,sourceSha:m.sourceSha,sourceTree:m.sourceTree,runtimeDigest:m.runtimeDigest,imageUri:'gcr.io/project/image@'+m.runtimeDigest,originalBuildRunId:123,originalBuildId:'56b76a83-3e5d-4957-99aa-2521a9c51845',originalArtifactId:321,originalArtifactDigest:'sha256:'+'a'.repeat(64),production:false};assert.equal(validResumedBuild(m),true);m.buildProvenance.runtimeDigest='wrong';assert.equal(validResumedBuild(m),false);
});
test('one terminal writer in existing workflow covers every producer and stays within guarded size',()=>{
 const yaml=fs.readFileSync(path.join(root,'.github/workflows/cxorbia-recovery-i3-dev-certification.yml'),'utf8'),body=yaml.slice(yaml.indexOf('\njobs:'));
 const jobs=[...body.matchAll(/^  ([a-zA-Z0-9_-]+):\s*$/gm)].map(m=>m[1]);
 const final=body.slice(body.indexOf('  continuity-result-consumer:'));
 const needs=final.match(/needs: \[([^\]]+)\]/)[1].split(',').map(x=>x.trim());
 assert.deepEqual(needs.slice().sort(),jobs.filter(x=>x!=='continuity-result-consumer').sort());
 assert.equal((yaml.match(/contents: write/g)||[]).length,1);assert.ok(final.includes('always()'));assert.ok(final.includes('github.token'));assert.ok(yaml.includes('--preflight'));assert.ok(Buffer.byteLength(yaml)<510000);
});

test('journal existence alone never proves consumption',()=>{
 const f=fixture(),j=runJournal({...f,jobs:[f.job],artifacts:[f.artifact],now:'2026-11-24T16:05:00Z'});j.outcome='CONSUMED_EXACT_DEV_MATERIALIZATION';validateConsumedJournal(j,f.run,1);
 for(const key of ['runId','runAttempt','controlHead','outcome']){const bad=structuredClone(j);bad[key]='wrong';assert.throws(()=>validateConsumedJournal(bad,f.run,1),/JOURNAL_IDENTITY/);}
 const wrongRun=structuredClone(f.run);wrongRun.head_branch='other';assert.throws(()=>validateConsumedJournal(j,wrongRun,1),/RUN_AUTHORITY/);
});
test('startup recovers every missing attempt and ignores mutable checkpoint date',async()=>{
 const f=fixture();f.run.status='completed';f.run.run_attempt=2;
 const api=async route=>route.includes('/attempts/')?{jobs:[f.job]}:{workflow_runs:[f.run]};
 const pending=await pendingRuns({api,currentRunId:f.run.id+1,currentRunAttempt:1,descriptor:{updatedAt:'2030-01-01',postDeployRunSeal:{runId:f.run.id-1}},knownPaths:new Map()});
 assert.deepEqual(pending,[{runId:f.run.id,runAttempt:1},{runId:f.run.id,runAttempt:2}]);
});
for(const conclusion of ['success','failure','cancelled','timed_out','skipped'])test('interrupted control-only finalizer recovers '+conclusion,async()=>{
 const f=fixture();f.run.status='completed';
 const api=async route=>route.includes('/attempts/')?{jobs:[{name:'canonical-candidate-authority',status:'completed',conclusion}]}:{workflow_runs:[f.run]};
 const pending=await pendingRuns({api,currentRunId:f.run.id+1,descriptor:{postDeployRunSeal:{runId:f.run.id-1}},knownPaths:new Map()});
 assert.deepEqual(pending,conclusion==='skipped'?[]:[{runId:f.run.id,runAttempt:1}]);
});
test('control recovery preserves consumed attempt and skips running latest attempt',async()=>{
 const f=fixture();f.run.run_attempt=3;
 const old={...f.run,run_attempt:1};const journal=runJournal({...f,run:old,jobs:[],artifacts:[],now:'2026-11-24T16:05:00Z'});journal.outcome='RECORDED_EXECUTION_NO_PRODUCT_PROMOTION';
 const path=`docs/checkpoints/CXORBIA_I3_RUN${f.run.id}_ATTEMPT1_EXECUTION_JOURNAL.json`;
 const api=async route=>route.includes('/attempts/')?{jobs:[{name:'canonical-candidate-authority',conclusion:'cancelled'}]}:{workflow_runs:[f.run]};
 const pending=await pendingRuns({api,currentRunId:f.run.id,currentRunAttempt:3,descriptor:{postDeployRunSeal:{runId:f.run.id-1}},knownPaths:new Map([[path,'blob']]),readJournal:async()=>journal});
 assert.deepEqual(pending,[{runId:f.run.id,runAttempt:2}]);
});
test('publication stage advances while D08/C09/C10 obligations remain explicit',()=>{
 const {out}=project();assert.ok(!out.matrix.modules.some(m=>m.classification==='SOURCE_PROVEN_PENDING_DEV_MATERIALIZATION'));
 const persistence=out.matrix.modules.find(m=>m.domain==='persistence-command-ack-boundary');assert.match(persistence.actionRequired,/D08.*C09\/C10/);
});

function windowFixture(f){return {schemaVersion:'cxorbia.i3.hr-period-window-dev.v1',decision:'PASS_HR_PERIOD_WINDOW_HISTORY_AND_EXPLICIT_READ',
 ...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,f.result[k]])),runId:String(f.run.id),runAttempt:f.run.run_attempt,revision:f.result.hrRevision,
 rolling:{mode:'rolling_window',periodIds:['p-2026-10','p-2026-11']},returned:{mode:'rolling_window',periodIds:['p-2026-10','p-2026-11'],revision:f.result.hrRevision},explicit:{mode:'explicit_period',periodIds:['p-2026-09']},
 history:{available:true,externalReadCurrent:false,originalSeedVisits:836,periods:19},production:false,fullDomain:false,authenticatedUiCertified:false,firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0,operationalImports:0};}
test('typed window proof removes only its completed action and preserves all domain obligations',()=>{
 const f=fixture();f.hrWindow=windowFixture(f);f.requireHrWindow=true;
 const {out}=project(f);assert.ok(!out.pointer.nextPlannedBlock.taskIds.includes('HR_PERIOD_WINDOW'));
 assert.deepEqual([...out.pointer.nextPlannedBlock.completedTaskIds].sort(),[...new Set([...(f.controls.pointer.nextPlannedBlock?.completedTaskIds||[]),'HR_PERIOD_WINDOW'])].sort());
 assert.match(out.pointer.exactNextAction,/reading window, retained history and explicit older-period read are verified/);
 assert.match(out.matrix.modules.find(x=>x.domain==='canonical-hr-state-adapters').actionRequired,/Complete authenticated durable HR/);
 assert.equal(validateCurrentAuthorityAliases(out).pass,true);assert.equal(out.matrix.modules.filter(x=>x.classification==='MATCH').length,6);
});
test('requested HR window result cannot be silently omitted',()=>{const f=fixture();f.requireHrWindow=true;assert.throws(()=>makeMaterializationReceipt(f),/HR_WINDOW_REQUIRED/);});
for(const key of ['runId','runAttempt','revision','sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','production','hrWrites','fullDomain'])test('typed window proof rejects wrong '+key,()=>{
 const f=fixture();f.hrWindow=windowFixture(f);f.hrWindow[key]=typeof f.hrWindow[key]==='number'?99:typeof f.hrWindow[key]==='boolean'?true:'wrong';assert.throws(()=>makeMaterializationReceipt(f),/HR_WINDOW_/);
});

function automationFixture(){
 const event={schemaVersion:'cxorbia.i3.automatic-execution-journal.v1',path:'docs/checkpoints/CXORBIA_I3_RUN50_ATTEMPT1_EXECUTION_JOURNAL.json',gitBlob:'b'.repeat(40),runId:50,runAttempt:1,outcome:'RECORDED_EXECUTION_NO_PRODUCT_PROMOTION',pendingTypedResults:[{jobId:60,name:'i3-finance-focal-reproof',conclusion:'failure',state:'EVIDENCE_RECORDED_TYPED_CLAUSE_INCORPORATION_REQUIRED'},{jobId:70,name:'i3-run2382-academy-b7-isolated-dev-qa',conclusion:'success',state:'EVIDENCE_RECORDED_TYPED_CLAUSE_INCORPORATION_REQUIRED'}],materializationReceiptPath:null,production:false};
 return {event,current:structuredClone(event),queue:new Map(),journalExists:true};
}
test('incorporated failed and successful jobs both leave the live pending list while the journal remains unchanged',()=>{
 const f=automationFixture(),original=structuredClone(f.event),out=projectCurrentAutomationReceipt(f);
 assert.equal(out.changed,true);assert.deepEqual(out.receipt.pendingTypedResults,[]);assert.deepEqual(f.event,original);
 assert.deepEqual(f.current.pendingTypedResults,original.pendingTypedResults);assert.equal(out.receipt.outcome,original.outcome);
});
test('only the exact effective run/attempt/job queue keeps a live pending item',()=>{
 const f=automationFixture();f.queue.set('50/1/60',{runId:50,runAttempt:1,jobId:60});f.queue.set('50/2/70',{runId:50,runAttempt:2,jobId:70});
 const out=projectCurrentAutomationReceipt(f);assert.deepEqual(out.receipt.pendingTypedResults.map(x=>x.jobId),[60]);
});
test('a repaired live pending projection is idempotent and has no product or domain credit',()=>{
 const f=automationFixture(),first=projectCurrentAutomationReceipt(f),again=projectCurrentAutomationReceipt({...f,current:first.receipt});
 assert.equal(again.changed,false);assert.deepEqual(again.receipt,first.receipt);assert.equal(again.receipt.production,false);assert.ok(!Object.hasOwn(again.receipt,'newDomainMatches'));
});
test('draining an old journal cannot supersede a newer current run or attempt',()=>{
 for(const current of [{runId:51,runAttempt:1},{runId:50,runAttempt:2}]){
  const f=automationFixture();f.current={...f.current,...current,path:'newer-journal.json',gitBlob:'c'.repeat(40)};
  const before=structuredClone(f.current),out=projectCurrentAutomationReceipt(f);assert.equal(out.changed,false);assert.deepEqual(out.receipt,before);
 }
});
test('the current attempt pending projection requires the original journal binding',()=>{
 for(const field of ['path','gitBlob']){const f=automationFixture();f.current[field]='wrong';assert.throws(()=>projectCurrentAutomationReceipt(f),/CURRENT_AUTOMATION_JOURNAL_BINDING/);}
});
test('a new current run publishes its effective pending set immediately',()=>{
 const f=automationFixture();f.current={...f.current,runId:49,path:'old-journal.json'};f.journalExists=false;
 const out=projectCurrentAutomationReceipt(f);assert.equal(out.changed,true);assert.equal(out.receipt.runId,50);assert.deepEqual(out.receipt.pendingTypedResults,[]);
});
