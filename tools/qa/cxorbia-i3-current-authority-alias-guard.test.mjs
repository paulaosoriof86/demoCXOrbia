import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCurrentAuthorityAliases} from './cxorbia-i3-current-authority-alias-guard.mjs';

const fixture=()=>{
  const action='source served DEV; next B8 and B9',blocker='B8_B9_HOLD',source='b'.repeat(40),tree='c'.repeat(40),blob='d'.repeat(40),path='ledger-v608.json';
  const d={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productSourceSha:source,productSourceTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,moduleTruthPath:'matrix-v294.json',updatedAt:'2026-11-11T20:38:14Z'};
  const p={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentDevMaterialization:{sourceSha:source,runtimeRevision:'dev-370',hostingVersion:'hosting-370'},activePhaseAClosureLock20261110:{sourceSha:source,devRuntime:'dev-370',devHosting:'hosting-370'}};
  const l={findings:{'VRM-001':{},'VRM-002':{}},governance:{findingCount:2,nextFindingId:'VRM-003',findingIdsPresent:['VRM-001','VRM-002'],currentProductSourceSha:source,currentProductSourceTree:tree},findingCount:2,nextFindingId:'VRM-003',currentProductSourceSha:source,currentProductSourceTree:tree,currentLedgerSuccessor:path,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentTruth:{moduleTruthPath:d.moduleTruthPath,productSourceSha:source,productTree:tree,currentMaterializationRunId:50,currentMaterializationSourceSha:source},currentMaterialization:{runId:50,sourceSha:source,sourceTree:tree,runtimeRevision:'dev-370',hostingVersion:'hosting-370'}};
  return {descriptor:d,pointer:p,ledger:l};
};

test('current aliases agree with descriptor-selected ledger and current DEV seal',()=>{
  const r=validateCurrentAuthorityAliases(fixture());assert.equal(r.pass,true,JSON.stringify(r));
});

const pendingFixture=()=>{
  const v=fixture(),predecessor='a'.repeat(40),predecessorTree='e'.repeat(40);
  v.descriptor.postDeployRunSeal={mode:'PREDECESSOR_SERVING_PENDING_SOURCE',sourceSha:predecessor,sourceTree:predecessorTree};
  v.pointer.postDeployRunSeal={...v.descriptor.postDeployRunSeal};
  v.pointer.currentDevMaterialization.sourceSha=predecessor;
  v.ledger.currentMaterialization.sourceSha=predecessor;
  v.ledger.currentMaterialization.sourceTree=predecessorTree;
  v.ledger.currentTruth.currentMaterializationSourceSha=predecessor;
  v.ledger.currentTruth.sourceMaterialized=false;
  return v;
};
test('pending source preserves old served DEV seal while pointers target new source',()=>{
  const r=validateCurrentAuthorityAliases(pendingFixture());
  assert.equal(r.pass,true,JSON.stringify(r));
});
const hostingOnlyFixture=()=>{
  const v=pendingFixture(),source=v.descriptor.productSourceSha,tree=v.descriptor.productSourceTree;
  v.descriptor.postDeployRunSeal={...v.descriptor.postDeployRunSeal,hostingVersion:'hosting-370',runtimeRevision:'dev-370'};
  v.pointer.postDeployRunSeal={...v.descriptor.postDeployRunSeal};
  const h={sourceSha:source,sourceTree:tree,hostingVersion:'hosting-371',runtimeRevision:'dev-370',productionChanged:false};
  v.descriptor.currentHostingOnlyDevMaterialization={...h};
  v.pointer.currentHostingOnlyDevMaterialization={...h};
  v.ledger.currentTruth.sourceMaterialized=true;
  v.ledger.currentTruth.materializationScope='HOSTING_ONLY_WITH_PAIRED_PREDECESSOR';
  v.pointer.activePhaseAClosureLock20261110.devHosting=h.hostingVersion;
  return v;
};
test('current Hosting-only DEV supersedes the business phase-lock Hosting without inventing a Cloud Run deploy',()=>{
  const r=validateCurrentAuthorityAliases(hostingOnlyFixture());
  assert.equal(r.pass,true,JSON.stringify(r));
});
for(const [name,change,code] of [
  ['stale phase-lock Hosting',v=>v.pointer.activePhaseAClosureLock20261110.devHosting='hosting-370','CURRENT_PHASE_LOCK_DEV_HOSTING_DESYNC'],
  ['fabricated Hosting source',v=>v.descriptor.currentHostingOnlyDevMaterialization.sourceSha='f'.repeat(40),'CURRENT_PRODUCT_SOURCE_DESYNC'],
  ['falsified release continuity',v=>v.descriptor.currentHostingOnlyDevMaterialization.productionChanged=true,'CURRENT_PRODUCT_SOURCE_DESYNC']
])test('Hosting-only receipt rejects '+name,()=>{
  const v=hostingOnlyFixture();change(v);
  const r=validateCurrentAuthorityAliases(v);assert.equal(r.pass,false,JSON.stringify(r));
  assert.ok(r.failures.includes(code),JSON.stringify(r));
});
for(const [name,change] of [
  ['falsified source materialization',v=>v.ledger.currentTruth.sourceMaterialized=true],
  ['changed predecessor seal',v=>v.ledger.currentMaterialization.sourceSha='f'.repeat(40)],
  ['stale phase lock source',v=>v.pointer.activePhaseAClosureLock20261110.sourceSha='a'.repeat(40)],
  ['stale current source alias',v=>v.ledger.currentTruth.productSourceSha='a'.repeat(40)]
])test('pending predecessor rejects '+name,()=>{
  const v=pendingFixture();change(v);
  assert.equal(validateCurrentAuthorityAliases(v).pass,false);
});

for(const [name,change,code] of [
  ['stale top-level count',v=>v.ledger.findingCount=1,'CURRENT_FINDING_COUNT_DESYNC'],
  ['stale pointer next ID',v=>v.pointer.nextFindingId='VRM-002','CURRENT_NEXT_FINDING_ID_DESYNC'],
  ['stale top-level source',v=>v.ledger.currentProductSourceSha='old','CURRENT_PRODUCT_SOURCE_DESYNC'],
  ['stale current truth',v=>v.ledger.currentTruth.currentMaterializationRunId=40,'CURRENT_TRUTH_DEV_SEAL_DESYNC'],
  ['stale nested B1-B9 runtime',v=>v.pointer.activePhaseAClosureLock20261110.devRuntime='dev-369','CURRENT_PHASE_LOCK_DEV_RUNTIME_DESYNC'],
  ['stale nested B1-B9 hosting',v=>v.pointer.activePhaseAClosureLock20261110.devHosting='hosting-369','CURRENT_PHASE_LOCK_DEV_HOSTING_DESYNC'],
  ['stale current DEV source',v=>v.pointer.currentDevMaterialization.sourceSha='a'.repeat(40),'CURRENT_PHASE_LOCK_PRODUCT_SOURCE_DESYNC'],
  ['old next action',v=>v.ledger.exactNextAction='source still pending','CURRENT_NEXT_ACTION_DESYNC'],
  ['contradictory blocker',v=>v.pointer.activeBlocker='B7_PENDING','CURRENT_ACTIVE_BLOCKER_DESYNC'],
  ['outdated pointer ledger',v=>v.pointer.findingsLedgerPath='ledger-v607.json','CURRENT_LEDGER_PATH_DESYNC'],
  ['outdated blob',v=>v.pointer.findingsLedgerExpectedGitBlob='old','CURRENT_LEDGER_BLOB_DESYNC'],
  ['stale timestamp',v=>v.ledger.updatedAt='2026-11-09T00:00:00Z','CURRENT_CONTROL_UPDATED_AT_DESYNC']
])test('rejects '+name,()=>{const v=fixture();change(v);const r=validateCurrentAuthorityAliases(v);assert.equal(r.pass,false);assert.ok(r.failures.includes(code),JSON.stringify(r));});
