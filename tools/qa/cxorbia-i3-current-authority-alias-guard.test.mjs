import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCurrentAuthorityAliases} from './cxorbia-i3-current-authority-alias-guard.mjs';

const fixture=()=>{
  const action='source served DEV; next B8 and B9',blocker='B8_B9_HOLD',source='b'.repeat(40),tree='c'.repeat(40),blob='d'.repeat(40),path='ledger-v608.json';
  const d={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productSourceSha:source,productSourceTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,moduleTruthPath:'matrix-v294.json',updatedAt:'2026-11-11T20:38:14Z'};
  const p={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentDevMaterialization:{sourceSha:source,runtimeRevision:'dev-370',hostingVersion:'hosting-370'},activePhaseAClosureLock20261110:{sourceSha:source,devRuntime:'dev-370',devHosting:'hosting-370'}};
  const l={findings:{'VRM-001':{},'VRM-002':{}},governance:{findingCount:2,nextFindingId:'VRM-003',findingIdsPresent:['VRM-001','VRM-002'],currentProductSourceSha:source,currentProductSourceTree:tree},findingCount:2,nextFindingId:'VRM-003',currentProductSourceSha:source,currentProductSourceTree:tree,currentLedgerSuccessor:path,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentTruth:{moduleTruthPath:d.moduleTruthPath,productSourceSha:source,productTree:tree,currentMaterializationRunId:50,currentMaterializationSourceSha:source},currentMaterialization:{runId:50,sourceSha:source,sourceTree:tree,runtimeRevision:'dev-370',hostingVersion:'hosting-370'}};
  const c3={schemaVersion:'cxorbia.i3.current-c3-preterminal-audit.v1',runId:100,moduleCount:21,matchModules:5,sourceReadyModules:1,sourceReadyDomainNames:['tenant-admin-config-branding'],pendingFiles:87,sourceSha:source,sourceTree:tree,hostingVersion:'hosting-370',runtimeRevision:'dev-370',decision:'HOLD_C3_PRETERMINAL_SOURCE_EVIDENCE_PENDING',production:false};
  d.currentC3PreterminalAudit={...c3};d.lastModuleTruthProof={...c3};d.c3PreterminalProof={...c3};
  p.currentC3PreterminalAudit={...c3};
  l.currentC3PreterminalAudit={...c3};l.lastModuleTruthProof={...c3};l.c3PreterminalProof={...c3};
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
  const next={...v.descriptor.currentC3PreterminalAudit,hostingVersion:h.hostingVersion};
  v.descriptor.currentC3PreterminalAudit={...next};v.descriptor.lastModuleTruthProof={...next};v.descriptor.c3PreterminalProof={...next};
  v.pointer.currentC3PreterminalAudit={...next};
  v.ledger.currentC3PreterminalAudit={...next};v.ledger.lastModuleTruthProof={...next};v.ledger.c3PreterminalProof={...next};
  return v;
};
test('current Hosting-only DEV supersedes the business phase-lock Hosting without inventing a Cloud Run deploy',()=>{
  const r=validateCurrentAuthorityAliases(hostingOnlyFixture());
  assert.equal(r.pass,true,JSON.stringify(r));
});
const hostingSuccessorPendingFixture=()=>{
  const v=hostingOnlyFixture(),source='f'.repeat(40),tree='1'.repeat(40);
  const serving={...v.descriptor.currentHostingOnlyDevMaterialization};
  const successor={state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'HOSTING_ONLY',
    sourceSha:source,sourceTree:tree,predecessorProductSourceSha:serving.sourceSha,
    servingHosting:serving,production:false,devPublished:false};
  v.descriptor.pendingDevSuccessor={...successor};
  v.pointer.pendingDevSuccessor={...successor};
  v.descriptor.productSourceSha=source;v.descriptor.productSourceTree=tree;
  v.pointer.productTree=tree;
  v.ledger.currentProductSourceSha=source;v.ledger.currentProductSourceTree=tree;
  v.ledger.governance.currentProductSourceSha=source;v.ledger.governance.currentProductSourceTree=tree;
  v.ledger.currentTruth.productSourceSha=source;v.ledger.currentTruth.productTree=tree;
  v.ledger.currentTruth.sourceMaterialized=false;
  v.pointer.activePhaseAClosureLock20261110.sourceSha=source;
  return v;
};
test('new bounded Hosting-only source keeps prior C3 and Hosting facts until new source is actually served',()=>{
  const v=hostingSuccessorPendingFixture();
  const r=validateCurrentAuthorityAliases(v);
  assert.equal(r.pass,true,JSON.stringify(r));
  v.descriptor.currentC3PreterminalAudit.sourceSha=v.descriptor.productSourceSha;
  v.descriptor.lastModuleTruthProof.sourceSha=v.descriptor.productSourceSha;
  v.descriptor.c3PreterminalProof.sourceSha=v.descriptor.productSourceSha;
  v.pointer.currentC3PreterminalAudit.sourceSha=v.descriptor.productSourceSha;
  v.ledger.currentC3PreterminalAudit.sourceSha=v.descriptor.productSourceSha;
  v.ledger.lastModuleTruthProof.sourceSha=v.descriptor.productSourceSha;
  v.ledger.c3PreterminalProof.sourceSha=v.descriptor.productSourceSha;
  assert.ok(validateCurrentAuthorityAliases(v).failures.includes('CURRENT_C3_PROOF_DESYNC'));
});
test('Hosting-only ACK preserves the old C3 as historical until the new-source C3 audit runs',()=>{
  const v=hostingSuccessorPendingFixture(),d=v.descriptor,p=v.pointer,l=v.ledger;
  const predecessor={...d.currentHostingOnlyDevMaterialization};
  const nextHosting={...predecessor,sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,
    hostingVersion:'hosting-372'};
  d.currentHostingOnlyDevMaterialization={...nextHosting};
  p.currentHostingOnlyDevMaterialization={...nextHosting};
  delete d.pendingDevSuccessor;delete p.pendingDevSuccessor;
  p.activePhaseAClosureLock20261110.devHosting=nextHosting.hostingVersion;
  l.currentTruth.sourceMaterialized=true;
  l.currentTruth.materializationScope='HOSTING_ONLY_WITH_PAIRED_PREDECESSOR';
  const transition={state:'DEV_HOSTING_VERIFIED_C3_PENDING',sourceSha:d.productSourceSha,
    sourceTree:d.productSourceTree,hostingVersion:nextHosting.hostingVersion,
    runtimeRevision:nextHosting.runtimeRevision,
    previousC3SourceSha:predecessor.sourceSha,previousC3SourceTree:predecessor.sourceTree,
    previousHostingVersion:predecessor.hostingVersion,production:false};
  d.i3Q2HostingReleaseC3Pending={...transition};p.i3Q2HostingReleaseC3Pending={...transition};l.i3Q2HostingReleaseC3Pending={...transition};
  const good=validateCurrentAuthorityAliases(v);assert.equal(good.pass,true,JSON.stringify(good));
  p.i3Q2HostingReleaseC3Pending.previousHostingVersion='fabricated';
  assert.ok(validateCurrentAuthorityAliases(v).failures.includes('CURRENT_C3_PROOF_DESYNC'));
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

for(const [name,change] of [
  ['archived 20-domain receipt reused as current',v=>v.descriptor.lastModuleTruthProof={runId:573,moduleCount:20}],
  ['C3 pointer retains an older run',v=>v.pointer.currentC3PreterminalAudit.runId=90],
  ['descriptor C3 legacy alias retains 20-domain receipt',v=>v.descriptor.c3PreterminalProof={runId:573,moduleCount:20}],
  ['C3 ledger retains an old source',v=>v.ledger.c3PreterminalProof.sourceSha='a'.repeat(40)],
  ['C3 wrong hosted version',v=>v.descriptor.currentC3PreterminalAudit.hostingVersion='hosting-369'],
  ['C3 fabricated all-ready count',v=>v.descriptor.currentC3PreterminalAudit.sourceReadyModules=21]
])test('current authority rejects '+name,()=>{
  const v=fixture();change(v);
  const r=validateCurrentAuthorityAliases(v);
  assert.equal(r.pass,false,JSON.stringify(r));
  assert.ok(r.failures.includes('CURRENT_C3_PROOF_DESYNC'),JSON.stringify(r));
});
