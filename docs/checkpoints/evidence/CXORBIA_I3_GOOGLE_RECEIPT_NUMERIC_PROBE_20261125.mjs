// Read-only causal probe against current owners. All input identities are
// synthetic; injected API never contacts GitHub or Google.
import assert from 'node:assert/strict';
import {projectCurrentAutomationReceipt,pendingRuns} from '../../../tools/qa/cxorbia-i3-automatic-result-consumer.mjs';
import {projectMaterialization} from '../../../tools/qa/cxorbia-i3-current-control-projection.mjs';

const uuid='11111111-1111-4111-8111-111111111111';
const source='a'.repeat(40),tree='b'.repeat(40);
let error=null;
try{
 projectMaterialization({descriptor:{productSourceSha:source,productSourceTree:tree,currentMaterialization:{runId:45500000000,runAttempt:1}},pointer:{},ledger:{},matrix:{}},
  {receipt:{observedAt:'2026-11-25T00:00:00Z',materialization:{sourceSha:source,sourceTree:tree,runId:uuid,runAttempt:1}},receiptPath:'synthetic-only.json'});
}catch(e){error=e.message;}
assert.equal(error,'SOURCE_FAILURE:OUT_OF_ORDER_MATERIALIZATION');

const staleGithub={runId:45500000000,runAttempt:1,path:'synthetic-github.json',gitBlob:'c'.repeat(40),pendingTypedResults:[]};
const cloudCurrent={runId:uuid,runAttempt:1,path:'synthetic-cloud.json',gitBlob:'d'.repeat(40),pendingTypedResults:[]};
const projected=projectCurrentAutomationReceipt({current:cloudCurrent,event:staleGithub,queue:new Map(),journalExists:false});
assert.equal(projected.changed,true);
assert.equal(projected.receipt.runId,staleGithub.runId);

let reads=0,jobReads=0;
const fakeApi=async route=>{reads++;if(route.includes('/attempts/')){jobReads++;return {jobs:[{name:'canonical-candidate-authority',conclusion:'failure'}]};}
return {workflow_runs:[{id:45500000001,status:'completed',run_attempt:1}]};};
const missing=await pendingRuns({api:fakeApi,currentRunId:0,descriptor:{postDeployRunSeal:{runId:uuid}},knownPaths:new Map()});
assert.deepEqual(missing,[]);assert.equal(jobReads,0);
const baseline=await pendingRuns({api:fakeApi,currentRunId:0,descriptor:{postDeployRunSeal:{runId:45500000000}},knownPaths:new Map()});
assert.deepEqual(baseline,[{runId:45500000001,runAttempt:1}]);

console.log(JSON.stringify({kind:'CAUSAL_READONLY_EXISTING_OWNER_PROBE',syntheticOnly:true,externalCalls:0,writes:0,
 observations:[
  {owner:'projectMaterialization',cloudUuidAsRunId:'REJECTED_AS_OUT_OF_ORDER',error},
  {owner:'projectCurrentAutomationReceipt',cloudCurrentReplacedByOlderGithubEvent:projected.changed},
  {owner:'pendingRuns',cloudUuidFloorPendingCount:missing.length,githubNumericFloorPendingCount:baseline.length}
 ]},null,2));
