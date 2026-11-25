import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {projectCurrentResidualNextAction,gitBlob,sha256} from './cxorbia-i3-current-control-projection.mjs';

// Immutable receipts preserve the observed 0d457 pre-publication regression.
// Controls are isolated fixtures; a later live paired result cannot change them.
const receiptPath='docs/checkpoints/CXORBIA_I3_GOOGLE_D08_1795627423976545_TYPED_RESULT.json';
const requestPath='docs/checkpoints/CXORBIA_I3_D08_UI_AFTER_RUN2783_RECOVERY_REQUEST_20261125.json';
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const receiptBytes=read(receiptPath),requestBytes=read(requestPath),receipt=JSON.parse(receiptBytes),request=JSON.parse(requestBytes);
const clone=x=>structuredClone(x);
const financeAction='Complete the current clean D08 request with provider-bound evidence and owned-fixture cleanup. Publish the paired runtime and Hosting from exact source 235d6c28.';
const d08Action='Publish paired DEV source 235d6c28, including the real PDF repair and F3, from the verified immutable Google source object. Do not repeat the D08 request on 1691.';
function fixture(){
 const proof=receipt.provenance;
 const d08={key:'GOOGLE_CLOUD_SHELL/'+proof.startGeneration,path:receiptPath,gitBlob:gitBlob(receiptBytes),sha256:sha256(receiptBytes),provider:'GOOGLE_CLOUD_SHELL',...Object.fromEntries(['controlHead','transportSha','startUri','resultUri','bundleSha256','archiveUri','archiveSha256'].map(k=>[k,proof[k]]))};
 const finance={key:'GOOGLE_CLOUD_SHELL/1795624414514166',path:'docs/checkpoints/CXORBIA_I3_GOOGLE_FINANCE_1795624487264686_TYPED_RESULT.json',sha256:'7b4dde1ca89c40dc50bd0d3ca7dfb9cf19bade788247259ac07481050e210134',provider:'GOOGLE_CLOUD_SHELL',resultUri:'gs://already-incorporated-finance/result.json#1795624487264686'};
 const served={...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,request[k]])),runId:request.pairedRunId,runAttempt:1,materializationReceiptPath:request.pairedReceiptPath};
 const seal={mode:'PREDECESSOR_SERVING_PENDING_SOURCE',receiptPath:request.pairedReceiptPath,receiptBlob:request.pairedReceiptGitBlob,...clone(served)};
 const requestRef={path:requestPath,gitBlob:gitBlob(requestBytes),state:'REQUESTED_CURRENT_DEV_UI_AFTER_EXACT_RUN2783_CLEANUP',sourceSha:request.sourceSha,pairedRunId:request.pairedRunId,production:false};
 const d={productSourceSha:'235d6c28e72226f792514656fd5c47c8ba65cbee',productSourceTree:'77b4de2c621560019ad043f22d90e75a508d2f79',currentMaterialization:served,postDeployRunSeal:seal,currentD08UiQaRequest:requestRef,
  activeBlocker:'ENVIRONMENT_FAILURE_GITHUB_ACTIONS_ACCOUNT_LOCKED',currentFunctionalEvidenceIndex:{results:[finance,d08]},
  currentFinanceGoogleFollowup:{resultKey:finance.key,receiptSha256:finance.sha256,servedSource:served.sourceSha,nextAction:financeAction},
  currentD08GoogleFollowup:{resultKey:d08.key,receiptSha256:d08.sha256,nextAction:d08Action},
  pendingDevSuccessor:{state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',sourceSha:'235d6c28e72226f792514656fd5c47c8ba65cbee',pairedCloudBuild:{launchTag:'cxorbia-vrm378-pair-8277d2a4-a2',imageBuild:{id:'196450ea-342f-4a31-bf8d-a2620a31f155'}}},production:'DO_NOT_TOUCH'};
 const out={descriptor:d,pointer:clone(d),matrix:{modules:[{domain:'finance-core-liquidation-costs',classification:'HOLD',currentResidualClauses:{pending:'Finance current PDF and two sessions.',preserved:'Three rows and two advances proved.'}},{domain:'certifications',classification:'HOLD',currentResidualClauses:{pending:'D08 current UI role/session residual.',preserved:'Prior Admin progress and edit retained.'}},{domain:'benefits',classification:'MATCH'}]},ledger:{findings:{preserved:{state:'PASS'}}}};
 const producer={head:proof.controlHead,descriptor:{currentD08UiQaRequest:clone(requestRef),currentMaterialization:clone(served),postDeployRunSeal:clone(seal)},pointer:{currentD08UiQaRequest:clone(requestRef),currentMaterialization:clone(served),postDeployRunSeal:clone(seal)}};
 return {out,d08Evidence:{producer,receiptBytes,requestBytes},d08,finance};
}
function invariant(out){
 const value=clone(out);
 for(const control of Object.values(value))for(const key of ['nextExactAction','exactNextAction','nextPlannedBlock'])delete control[key];
 return value;
}
test('0d457: exact incorporated D08 supersedes the stale Finance prerequisite in all four controls',()=>{
 const f=fixture(),before=invariant(f.out),result=projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence});
 assert.ok(result.nextAction.startsWith('I3: '+d08Action));assert.ok(!result.nextAction.includes(financeAction));
 for(const control of Object.values(f.out))assert.equal(control.nextExactAction,result.nextAction);
 assert.deepEqual(invariant(f.out),before);assert.equal(projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence}).changed,false);
});
for(const [name,mutate] of [
 ['evidence absent',f=>{delete f.d08Evidence;}],
 ['followup absent',f=>{delete f.out.descriptor.currentD08GoogleFollowup;}],
 ['result key differs',f=>{f.out.descriptor.currentD08GoogleFollowup.resultKey='GOOGLE_CLOUD_SHELL/other';}],
 ['receipt hash differs',f=>{f.out.descriptor.currentD08GoogleFollowup.receiptSha256='f'.repeat(64);}],
 ['pointer followup differs',f=>{f.out.pointer.currentD08GoogleFollowup.nextAction='unbound';}],
 ['producer control differs',f=>{f.d08Evidence.producer.head='f'.repeat(40);}],
 ['producer request differs',f=>{f.d08Evidence.producer.descriptor.currentD08UiQaRequest.gitBlob='f'.repeat(40);}],
 ['producer pointer request differs',f=>{f.d08Evidence.producer.pointer.currentD08UiQaRequest.path='another.json';}],
 ['served source differs',f=>{for(const c of [f.out.descriptor,f.out.pointer])c.currentMaterialization.sourceSha='f'.repeat(40);}],
 ['served tree differs',f=>{for(const c of [f.out.descriptor,f.out.pointer])c.currentMaterialization.sourceTree='f'.repeat(40);}],
 ['paired run differs',f=>{for(const c of [f.out.descriptor,f.out.pointer])c.currentMaterialization.runId=45500000000;}],
 ['paired receipt differs',f=>{for(const c of [f.out.descriptor,f.out.pointer])c.postDeployRunSeal.receiptBlob='f'.repeat(40);}],
 ['newer D08 has no bound followup',f=>{for(const c of [f.out.descriptor,f.out.pointer])c.currentFunctionalEvidenceIndex.results.push({...clone(f.d08),key:'GOOGLE_CLOUD_SHELL/1795627229281377'});}]
])test('D08 does not acquire current authority when '+name,()=>{
 const f=fixture();mutate(f);const result=projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence});
 assert.ok(!result.nextAction.startsWith('I3: '+d08Action));
});
for(const [name,key,code] of [['receipt','receiptBytes','D08_FOLLOWUP_RECEIPT_BYTES'],['request','requestBytes','D08_FOLLOWUP_REQUEST_BYTES']])
 test('changed '+name+' bytes reject before any control mutation',()=>{
  const f=fixture(),before=clone(f.out);f.d08Evidence[key]+=' ';
  assert.throws(()=>projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence}),new RegExp(code));assert.deepEqual(f.out,before);
 });
test('a different native producer cannot borrow an incorporated D08 result key',()=>{
 const f=fixture(),altered=JSON.parse(f.d08Evidence.receiptBytes);altered.provenance.job='another-job';
 f.d08Evidence.receiptBytes=JSON.stringify(altered);
 for(const c of [f.out.descriptor,f.out.pointer]){
  const e=c.currentFunctionalEvidenceIndex.results.at(-1);e.gitBlob=gitBlob(f.d08Evidence.receiptBytes);e.sha256=sha256(f.d08Evidence.receiptBytes);c.currentD08GoogleFollowup.receiptSha256=e.sha256;
 }
 assert.throws(()=>projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence}),/D08_FOLLOWUP_RECEIPT_IDENTITY/);
});
test('a later incorporated Finance followup keeps precedence without ordering execution clocks',()=>{
 const f=fixture();
 for(const c of [f.out.descriptor,f.out.pointer]){const e={...clone(f.finance),key:'GOOGLE_CLOUD_SHELL/1795624414514167',observedAt:'2000-01-01T00:00:00Z'};c.currentFunctionalEvidenceIndex.results.push(e);c.currentD08GoogleFollowup.observedAt='2999-01-01T00:00:00Z';c.currentFinanceGoogleFollowup.resultKey=e.key;}
 assert.ok(projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence}).nextAction.startsWith('I3: '+financeAction));
});
for(const blocker of ['ENVIRONMENT_FAILURE_GITHUB_ACTIONS_ACCOUNT_LOCKED','CURRENT_SOURCE_FUNCTIONAL_CLOSURE_AND_E08_ENVIRONMENT_HOLD'])
 test('admitted Google pair uses the served candidate despite historical '+blocker,()=>{
  const f=fixture();
  for(const c of [f.out.descriptor,f.out.pointer]){
   c.activeBlocker=blocker;
   Object.assign(c.currentMaterialization,{executionProvider:'GOOGLE_CLOUD_BUILD',runId:'18d8d2fd-0e77-4692-a910-904c1bc66238',sourceSha:c.productSourceSha,sourceTree:c.productSourceTree,runtimeRevision:'cxorbia-live-hr-dev-00392-788',hostingVersion:'sites/cxorbia-backend-dev/versions/8c9523cb34a7e529',runtimeDigest:'sha256:8277d2a4bdf5a83910b97bb1ef57adbc398408cfdd634f6046926942ec470f55'});
   c.postDeployRunSeal={...clone(c.currentMaterialization),mode:'CURRENT_SOURCE_SERVING',receiptPath:'docs/checkpoints/CXORBIA_I3_GOOGLE_BUILD_18d8d2fd-0e77-4692-a910-904c1bc66238_AUTOMATIC_DEV_RECEIPT.json',receiptBlob:'a'.repeat(40)};
  }
  const before=invariant(f.out),next=projectCurrentResidualNextAction(f.out,{d08Evidence:f.d08Evidence}).nextAction;
  assert.ok(next.startsWith('I3: Use the exact currently served DEV candidate.'));
  assert.doesNotMatch(next,/before paired publication|Publish paired DEV source 235d6c28|D08 request on 1691|Complete the current clean D08 request/);
  assert.match(next,/FINANCE_RESIDUAL: Finance current PDF/);assert.match(next,/D08: D08 current UI role/);assert.deepEqual(invariant(f.out),before);
 });
