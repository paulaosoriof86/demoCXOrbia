import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCurrentAuthorityAliases} from './cxorbia-i3-current-authority-alias-guard.mjs';

const fixture=()=>{
  const action='source served DEV; next B8 and B9',blocker='B8_B9_HOLD',source='b'.repeat(40),tree='c'.repeat(40),blob='d'.repeat(40),path='ledger-v608.json';
  const d={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productSourceSha:source,productSourceTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,moduleTruthPath:'matrix-v294.json',updatedAt:'2026-11-11T20:38:14Z'};
  const p={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt};
  const l={findings:{'VRM-001':{},'VRM-002':{}},governance:{findingCount:2,nextFindingId:'VRM-003',findingIdsPresent:['VRM-001','VRM-002'],currentProductSourceSha:source,currentProductSourceTree:tree},findingCount:2,nextFindingId:'VRM-003',currentProductSourceSha:source,currentProductSourceTree:tree,currentLedgerSuccessor:path,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentTruth:{moduleTruthPath:d.moduleTruthPath,productSourceSha:source,productTree:tree,currentMaterializationRunId:50,currentMaterializationSourceSha:source},currentMaterialization:{runId:50,sourceSha:source,sourceTree:tree}};
  return {descriptor:d,pointer:p,ledger:l};
};

test('current aliases agree with descriptor-selected ledger and current DEV seal',()=>{
  const r=validateCurrentAuthorityAliases(fixture());assert.equal(r.pass,true,JSON.stringify(r));
});

for(const [name,change,code] of [
  ['stale top-level count',v=>v.ledger.findingCount=1,'CURRENT_FINDING_COUNT_DESYNC'],
  ['stale pointer next ID',v=>v.pointer.nextFindingId='VRM-002','CURRENT_NEXT_FINDING_ID_DESYNC'],
  ['stale top-level source',v=>v.ledger.currentProductSourceSha='old','CURRENT_PRODUCT_SOURCE_DESYNC'],
  ['stale current truth',v=>v.ledger.currentTruth.currentMaterializationRunId=40,'CURRENT_TRUTH_DEV_SEAL_DESYNC'],
  ['old next action',v=>v.ledger.exactNextAction='source still pending','CURRENT_NEXT_ACTION_DESYNC'],
  ['contradictory blocker',v=>v.pointer.activeBlocker='B7_PENDING','CURRENT_ACTIVE_BLOCKER_DESYNC'],
  ['outdated pointer ledger',v=>v.pointer.findingsLedgerPath='ledger-v607.json','CURRENT_LEDGER_PATH_DESYNC'],
  ['outdated blob',v=>v.pointer.findingsLedgerExpectedGitBlob='old','CURRENT_LEDGER_BLOB_DESYNC'],
  ['stale timestamp',v=>v.ledger.updatedAt='2026-11-09T00:00:00Z','CURRENT_CONTROL_UPDATED_AT_DESYNC']
])test('rejects '+name,()=>{const v=fixture();change(v);const r=validateCurrentAuthorityAliases(v);assert.equal(r.pass,false);assert.ok(r.failures.includes(code),JSON.stringify(r));});
