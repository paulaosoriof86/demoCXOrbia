import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCurrentAuthorityAliases,validateLatestExecutionSource} from './cxorbia-i3-current-authority-alias-guard.mjs';

const fixture=()=>{
  const action='source served DEV; next B8 and B9',blocker='B8_B9_HOLD',source='b'.repeat(40),tree='c'.repeat(40),blob='d'.repeat(40),path='ledger-v608.json';
  const d={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productSourceSha:source,productSourceTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,moduleTruthPath:'matrix-v294.json',updatedAt:'2026-11-11T20:38:14Z'};
  const p={findingsLedgerPath:path,findingsLedgerExpectedGitBlob:blob,nextFindingId:'VRM-003',productTree:tree,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentDevMaterialization:{sourceSha:source,runtimeRevision:'dev-370',hostingVersion:'hosting-370'},activePhaseAClosureLock20261110:{sourceSha:source,devRuntime:'dev-370',devHosting:'hosting-370'}};
  const l={findings:{'VRM-001':{},'VRM-002':{}},governance:{findingCount:2,nextFindingId:'VRM-003',findingIdsPresent:['VRM-001','VRM-002'],currentProductSourceSha:source,currentProductSourceTree:tree},findingCount:2,nextFindingId:'VRM-003',currentProductSourceSha:source,currentProductSourceTree:tree,currentLedgerSuccessor:path,exactNextAction:action,nextExactAction:action,activeBlocker:blocker,updatedAt:d.updatedAt,currentTruth:{moduleTruthPath:d.moduleTruthPath,productSourceSha:source,productTree:tree,currentMaterializationRunId:50,currentMaterializationSourceSha:source},currentMaterialization:{runId:50,sourceSha:source,sourceTree:tree,runtimeRevision:'dev-370',hostingVersion:'hosting-370'}};
  const c3={schemaVersion:'cxorbia.i3.current-c3-preterminal-audit.v1',runId:100,moduleCount:21,matchModules:5,sourceReadyModules:1,sourceReadyDomainNames:['tenant-admin-config-branding'],pendingFiles:87,sourceSha:source,sourceTree:tree,hostingVersion:'hosting-370',runtimeRevision:'dev-370',decision:'HOLD_C3_PRETERMINAL_SOURCE_EVIDENCE_PENDING',production:false};
  d.currentC3PreterminalAudit={...c3};d.lastModuleTruthProof={...c3};d.c3PreterminalProof={...c3};
  p.currentC3PreterminalAudit={...c3};
  l.currentC3PreterminalAudit={...c3};l.lastModuleTruthProof={...c3};l.c3PreterminalProof={...c3};
  d.currentExecutionReceipt={runId:100,path:'receipt.json'};p.currentExecutionReceipt={...d.currentExecutionReceipt};
  d.currentExecutionReceiptSemantics=p.currentExecutionReceiptSemantics='LATEST_FOCAL_NOT_GLOBAL';
  d.phaseAHumanAcceptanceCurrent20261111={technicalDomainMatches:5};p.activePhaseAClosureLock20261110.strictDomainMatches=5;l.currentTruth.moduleMatch=5;
  p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed=4;
  p.activePhaseAClosureLock20261110.currentAccountingSemantics={humanFunctionalBlocks:{passed:4,total:9},strictOwnerDomainMatch:{matched:5,total:21}};
  for(const object of [d.currentC3PreterminalAudit,d.lastModuleTruthProof,d.c3PreterminalProof,p.currentC3PreterminalAudit,l.currentC3PreterminalAudit,l.lastModuleTruthProof,l.c3PreterminalProof])Object.assign(object,{pendingOwnerProofFiles:87,pendingBlobProvenanceFiles:0,pendingMappingApprovalFiles:0});
  d.moduleTruthExpectedGitBlob='e'.repeat(40);l.currentTruth.moduleTruthGitBlob=d.moduleTruthExpectedGitBlob;
  d.currentCanonicalControl={sourceSha:source,sourceTree:tree,matrix:{path:d.moduleTruthPath,gitBlob:d.moduleTruthExpectedGitBlob},ledger:{path:d.findingsLedgerPath,gitBlob:d.findingsLedgerExpectedGitBlob}};
  p.currentCanonicalControl=structuredClone(d.currentCanonicalControl);
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
test('current functional accounting follows the new source while original human evidence stays historical',()=>{
  const v=fixture();v.descriptor.moduleTruthPath='matrix-V294.json';
  v.ledger.currentTruth.moduleTruthPath=v.descriptor.moduleTruthPath;
  for(const control of [v.descriptor,v.pointer])control.currentCanonicalControl.matrix.path=v.descriptor.moduleTruthPath;
  v.matrix={version:'V294',modules:Array.from({length:21},(_,i)=>({classification:i<5?'MATCH':'HOLD'})),
    integralCertificationUnchanged:{match:5},functionalBlockCertificationAccounting20261110:{
      currentProductSourceSha:v.descriptor.productSourceSha,domainMatchCount:5,domainCount:21,domainPendingCount:16,
      latestReadback:{sourceSha:'a'.repeat(40)}}};
  assert.equal(validateCurrentAuthorityAliases(v).pass,true,JSON.stringify(validateCurrentAuthorityAliases(v)));
  v.matrix.functionalBlockCertificationAccounting20261110.currentProductSourceSha='a'.repeat(40);
  assert.ok(validateCurrentAuthorityAliases(v).failures.includes('CURRENT_FUNCTIONAL_ACCOUNTING_SOURCE_DESYNC'));
  v.matrix.functionalBlockCertificationAccounting20261110.currentProductSourceSha=v.descriptor.productSourceSha;
  v.matrix.functionalBlockCertificationAccounting20261110.domainMatchCount=6;
  assert.ok(validateCurrentAuthorityAliases(v).failures.includes('CURRENT_FUNCTIONAL_ACCOUNTING_COUNT_DESYNC'));
  assert.equal(v.matrix.functionalBlockCertificationAccounting20261110.latestReadback.sourceSha,'a'.repeat(40));
});
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
test('a paired runtime+Hosting successor preserves the exact currently served predecessor',()=>{
 const v=hostingSuccessorPendingFixture();v.descriptor.pendingDevSuccessor.scope='RUNTIME_AND_HOSTING';v.pointer.pendingDevSuccessor.scope='RUNTIME_AND_HOSTING';
 assert.equal(validateCurrentAuthorityAliases(v).pass,true,JSON.stringify(validateCurrentAuthorityAliases(v)));
 v.pointer.pendingDevSuccessor.servingHosting={...v.pointer.pendingDevSuccessor.servingHosting,hostingVersion:'fabricated'};
 assert.equal(validateCurrentAuthorityAliases(v).pass,false);
});
function pairedAfterDeployFixture(){
 const v=hostingSuccessorPendingFixture(),d=v.descriptor,p=v.pointer,l=v.ledger,old={...d.currentC3PreterminalAudit};
 delete d.pendingDevSuccessor;delete p.pendingDevSuccessor;delete d.currentHostingOnlyDevMaterialization;delete p.currentHostingOnlyDevMaterialization;
 const seal={...l.currentMaterialization,runId:110,sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,runtimeRevision:'dev-371',hostingVersion:'hosting-372'};
 l.currentMaterialization={...seal};p.currentDevMaterialization={...seal};d.postDeployRunSeal={...seal,mode:'CURRENT_SOURCE_SERVING'};p.postDeployRunSeal={...d.postDeployRunSeal};
 Object.assign(l.currentTruth,{sourceMaterialized:true,materializationScope:'RUNTIME_AND_HOSTING',currentMaterializationRunId:110,currentMaterializationSourceSha:seal.sourceSha});
 Object.assign(p.activePhaseAClosureLock20261110,{devRuntime:seal.runtimeRevision,devHosting:seal.hostingVersion});
 const transition={state:'DEV_RUNTIME_AND_HOSTING_VERIFIED_C3_PENDING',sourceSha:seal.sourceSha,sourceTree:seal.sourceTree,runtimeRevision:seal.runtimeRevision,hostingVersion:seal.hostingVersion,previousC3SourceSha:old.sourceSha,previousC3SourceTree:old.sourceTree,previousRuntimeRevision:old.runtimeRevision,previousHostingVersion:old.hostingVersion,production:false};
 d.i3Q2HostingReleaseC3Pending={...transition};p.i3Q2HostingReleaseC3Pending={...transition};l.i3Q2HostingReleaseC3Pending={...transition};return v;
}
test('paired ACK preserves the previous C3 runtime/source as historical until same-source verification',()=>{
 const v=pairedAfterDeployFixture();assert.equal(validateCurrentAuthorityAliases(v).pass,true,JSON.stringify(validateCurrentAuthorityAliases(v)));
});
function pairedPendingHostingFixture(){
 const v=pairedAfterDeployFixture(),d=v.descriptor,p=v.pointer,l=v.ledger;
 const source='2'.repeat(40),tree='3'.repeat(40),paired=structuredClone(l.currentMaterialization);
 d.currentMaterialization=structuredClone(paired);
 d.postDeployRunSeal.mode='PREDECESSOR_SERVING_PENDING_SOURCE';p.postDeployRunSeal=structuredClone(d.postDeployRunSeal);
 d.productSourceSha=source;d.productSourceTree=tree;p.productTree=tree;
 l.currentProductSourceSha=source;l.currentProductSourceTree=tree;
 Object.assign(l.governance,{currentProductSourceSha:source,currentProductSourceTree:tree});
 Object.assign(l.currentTruth,{productSourceSha:source,productTree:tree,sourceMaterialized:false});
 p.activePhaseAClosureLock20261110.sourceSha=source;
 const pending={state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'HOSTING_ONLY',sourceSha:source,sourceTree:tree,
  predecessorProductSourceSha:paired.sourceSha,production:false,devPublished:false,
  servingPairedMaterialization:paired,servingRuntimeSeal:structuredClone(d.postDeployRunSeal)};
 d.pendingDevSuccessor=structuredClone(pending);p.pendingDevSuccessor=structuredClone(pending);return v;
}
test('Hosting-only source may follow an exact paired receipt while preserving its older C3',()=>{
 const v=pairedPendingHostingFixture();assert.equal(validateCurrentAuthorityAliases(v).pass,true,JSON.stringify(validateCurrentAuthorityAliases(v)));
 assert.notEqual(v.descriptor.currentC3PreterminalAudit.sourceSha,v.descriptor.pendingDevSuccessor.predecessorProductSourceSha);
 assert.equal(v.descriptor.currentHostingOnlyDevMaterialization,undefined);
});
test('pending paired receipt also agrees with descriptor, not only pointer and ledger',()=>{
 const v=pairedPendingHostingFixture();v.descriptor.currentMaterialization.runtimeDigest='fabricated';
 assert.equal(validateCurrentAuthorityAliases(v).pass,false);
});
for(const field of ['sourceSha','sourceTree','runtimeRevision','hostingVersion'])test('pending Hosting from paired rejects altered '+field,()=>{
 const v=pairedPendingHostingFixture();v.descriptor.pendingDevSuccessor.servingPairedMaterialization[field]='fabricated';
 v.pointer.pendingDevSuccessor=structuredClone(v.descriptor.pendingDevSuccessor);
 assert.equal(validateCurrentAuthorityAliases(v).pass,false);
});
function hostingAfterPairedFixture(){
 const v=pairedPendingHostingFixture(),d=v.descriptor,p=v.pointer,l=v.ledger;
 const h={sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,hostingVersion:'hosting-373',
  runtimeRevision:l.currentMaterialization.runtimeRevision,productionChanged:false};
 d.currentHostingOnlyDevMaterialization=structuredClone(h);p.currentHostingOnlyDevMaterialization=structuredClone(h);
 delete d.pendingDevSuccessor;delete p.pendingDevSuccessor;
 Object.assign(l.currentTruth,{sourceMaterialized:true,materializationScope:'HOSTING_ONLY_WITH_PAIRED_PREDECESSOR'});
 p.activePhaseAClosureLock20261110.devHosting=h.hostingVersion;
 for(const x of [d,p,l])Object.assign(x.i3Q2HostingReleaseC3Pending,{state:'DEV_HOSTING_VERIFIED_C3_PENDING',
  sourceSha:h.sourceSha,sourceTree:h.sourceTree,hostingVersion:h.hostingVersion,runtimeRevision:h.runtimeRevision});
 return v;
}
test('Hosting after paired preserves the C3 previous runtime instead of relabelling its receipt',()=>{
 const v=hostingAfterPairedFixture();assert.equal(validateCurrentAuthorityAliases(v).pass,true,JSON.stringify(validateCurrentAuthorityAliases(v)));
 assert.notEqual(v.descriptor.currentC3PreterminalAudit.runtimeRevision,v.ledger.currentMaterialization.runtimeRevision);
 for(const x of [v.descriptor,v.pointer,v.ledger])x.i3Q2HostingReleaseC3Pending.previousRuntimeRevision='fabricated';
 assert.equal(validateCurrentAuthorityAliases(v).pass,false);
});
test('Hosting after a newer runtime requires the explicit historical C3 runtime',()=>{
 const v=hostingAfterPairedFixture();
 for(const x of [v.descriptor,v.pointer,v.ledger])delete x.i3Q2HostingReleaseC3Pending.previousRuntimeRevision;
 assert.equal(validateCurrentAuthorityAliases(v).pass,false);
});
for(const field of ['previousRuntimeRevision','previousHostingVersion','previousC3SourceSha','sourceTree','runtimeRevision','hostingVersion'])test('paired transition rejects a falsified '+field,()=>{
 const v=pairedAfterDeployFixture();for(const x of [v.descriptor,v.pointer,v.ledger])x.i3Q2HostingReleaseC3Pending[field]='fabricated';assert.equal(validateCurrentAuthorityAliases(v).pass,false);
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

for(const [name,mutate,code] of [
 ['stale current focal',v=>v.descriptor.currentExecutionReceipt.runId=1,'CURRENT_EXECUTION_RECEIPT_DESYNC'],
 ['stale current semantic',v=>v.descriptor.currentExecutionReceiptSemantics='OLD','CURRENT_EXECUTION_RECEIPT_SEMANTICS_DESYNC'],
 ['technical count contradicted by current C3',v=>v.descriptor.phaseAHumanAcceptanceCurrent20261111.technicalDomainMatches=4,'CURRENT_TECHNICAL_DOMAIN_COUNT_DESYNC'],
 ['stale matrix hash',v=>v.ledger.currentTruth.moduleTruthGitBlob='old','CURRENT_TRUTH_MATRIX_BLOB_DESYNC'],
 ['stale nested current pointer',v=>v.pointer.currentCanonicalControl.matrix.path='old.json','CURRENT_CANONICAL_CONTROL_POINTER_DESYNC']
])test('reject accumulated alias drift: '+name,()=>{const v=fixture();mutate(v);assert.ok(validateCurrentAuthorityAliases(v).failures.includes(code));});

const latestHostingAckFixture=()=>{
 const h={receiptPath:'hosting.json',receiptBlob:'b'.repeat(40),sourceSha:'c'.repeat(40),sourceTree:'d'.repeat(40),runId:2,runNumber:2,runtimeRevision:'runtime-1',runtimeDigest:'sha256:'+ 'e'.repeat(64),hostingVersion:'sites/dev/versions/2',hostingRelease:'release-2'};
 const r={schemaVersion:'cxorbia.i3.hosting-only-dev-exact-ack.v1',decision:'PASS_I3_CURRENT_SOURCE_HOSTING_DEV_ONLY',sourceSha:h.sourceSha,sourceTree:h.sourceTree,runNumber:h.runNumber,workflowRunId:h.runId,runtimeRevision:h.runtimeRevision,runtimeDigest:h.runtimeDigest,hostingAfter:h.hostingVersion,hostingRelease:h.hostingRelease,artifactId:123,artifactDigest:'sha256:'+ 'f'.repeat(64),sourceHostedExact:true,verifiedServedAssetCount:1,servedSha256:{'app.js':'a'.repeat(64)},cloudRunBuilds:0,cloudRunDeploys:0,rulesDeploys:0,hrWrites:0,productionDeploys:0,firestoreDirectWrites:0,hostingDeploys:1,productionUnchanged:true,production:false,i4Authorized:false,phaseAComplete:false};
 const d={productSourceSha:h.sourceSha,productTreeAuthority:h.sourceTree,postDeployRunSeal:{mode:'PREDECESSOR_SERVING_PENDING_SOURCE',sourceSha:'a'.repeat(40),runtimeRevision:h.runtimeRevision,runtimeDigest:h.runtimeDigest},currentHostingOnlyDevMaterialization:h};
 const p={currentHostingOnlyDevMaterialization:structuredClone(h),lastExecutionReceipt:{kind:'EXACT_HOSTING_ONLY_DEV_ACK_NOT_FUNCTIONAL_CERTIFICATE',path:h.receiptPath,gitBlob:h.receiptBlob,runId:h.runId,runNumber:h.runNumber,sourceSha:h.sourceSha,sourceTree:h.sourceTree,artifactId:r.artifactId,artifactDigest:r.artifactDigest,production:false}};
 return {descriptor:d,pointer:p,receipt:r,gitBlob:path=>path==='hosting.json'?'b'.repeat(40):'',readJson:path=>path==='hosting.json'?r:{}};
};
test('latest Hosting ACK advances to exact frontend source while paired runtime seal remains immutable',()=>{
 const v=latestHostingAckFixture(),before=JSON.stringify(v.descriptor.postDeployRunSeal);assert.equal(validateLatestExecutionSource(v).pass,true);assert.equal(JSON.stringify(v.descriptor.postDeployRunSeal),before);
});
for(const [name,change]of [
 ['runtime digest',v=>{v.descriptor.currentHostingOnlyDevMaterialization.runtimeDigest='wrong';v.pointer.currentHostingOnlyDevMaterialization.runtimeDigest='wrong';v.receipt.runtimeDigest='wrong';}],
 ['predecessor source relabel',v=>{v.pointer.lastExecutionReceipt.sourceSha=v.descriptor.postDeployRunSeal.sourceSha;}],
 ['missing source',v=>{delete v.pointer.lastExecutionReceipt.sourceSha;}],
 ['receipt path',v=>{v.pointer.lastExecutionReceipt.path='other.json';}],
 ['receipt blob',v=>{v.pointer.lastExecutionReceipt.gitBlob='wrong';}],
 ['execution run',v=>{v.pointer.lastExecutionReceipt.runId=3;}],
 ['receipt run',v=>{v.receipt.workflowRunId=3;}],
 ['artifact digest',v=>{v.pointer.lastExecutionReceipt.artifactDigest='wrong';}],
 ['receipt Hosting',v=>{v.receipt.hostingAfter='other';}],
 ['runtime write',v=>{v.receipt.cloudRunDeploys=1;}],
 ['terminal claim',v=>{v.receipt.phaseAComplete=true;}],
 ['unverified assets',v=>{v.receipt.verifiedServedAssetCount=2;}],
 ['unrelated latest kind',v=>{v.pointer.lastExecutionReceipt.kind='OTHER';}]
])test('latest Hosting ACK rejects '+name+' even when source SHA agrees',()=>{const v=latestHostingAckFixture();change(v);assert.equal(validateLatestExecutionSource(v).pass,false);});
test('paired predecessor latest receipt remains accepted without fabricating a Hosting ACK',()=>{
 const v=latestHostingAckFixture();v.pointer.lastExecutionReceipt={kind:'CI_EXACT_DEV_MATERIALIZATION_NOT_HUMAN_ACCEPTANCE',sourceSha:v.descriptor.postDeployRunSeal.sourceSha,sourceTree:'1'.repeat(40),path:'paired.json',gitBlob:'2'.repeat(40),runId:1,runNumber:1,production:false};assert.equal(validateLatestExecutionSource(v).pass,true);assert.equal(validateLatestExecutionSource(v).hostingOnly,false);
});

const latestC3AttemptFixture=()=>{
 const v=latestHostingAckFixture(),d=v.descriptor,p=v.pointer,h=d.currentHostingOnlyDevMaterialization;
 d.productSourceSha='1'.repeat(40);d.productTreeAuthority='2'.repeat(40);
 const kind='C3_PRETERMINAL_AND_CERTIFY_ATTEMPT_NOT_TERMINAL_CERTIFICATE';
 const r={schemaVersion:'cxorbia.i3.c3-certify-attempt-readback.v1',kind,decision:'HOLD_I3_PRE_FIXTURES_DURABLE_REVISION_DIVERGENCE',strictCertificationStatus:'HOLD',sourceSha:h.sourceSha,sourceTree:h.sourceTree,runId:3,runNumber:3,artifactId:300,artifactDigest:'sha256:'+'3'.repeat(64),runtimeRevision:h.runtimeRevision,runtimeDigest:h.runtimeDigest,hostingVersion:h.hostingVersion,c3Decision:'PASS_C3_PRETERMINAL_SOURCE_READY_EXACT_DEV',moduleCount:21,matchModules:5,sourceReadyModules:21,pendingFiles:0,builds:0,runtimeDeploys:0,hostingDeploys:0,rulesDeploys:0,hrWrites:0,productionDeploys:0,production:false,terminalCertified:false,phaseAComplete:false,i4Authorized:false};
 const audit={...r,decision:r.c3Decision};d.currentC3PreterminalAudit=audit;p.currentC3PreterminalAudit=structuredClone(audit);
 const pending={state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'RUNTIME_AND_HOSTING',sourceSha:d.productSourceSha,sourceTree:d.productTreeAuthority,predecessorProductSourceSha:h.sourceSha,servingHosting:structuredClone(h),servingRuntimeSeal:structuredClone(d.postDeployRunSeal),production:false,devPublished:false};d.pendingDevSuccessor=pending;p.pendingDevSuccessor=structuredClone(pending);
 const latest={kind,decision:r.decision,path:'c3-attempt.json',gitBlob:'4'.repeat(40),...Object.fromEntries(['sourceSha','sourceTree','runId','runNumber','artifactId','artifactDigest','production','terminalCertified','phaseAComplete','i4Authorized'].map(k=>[k,r[k]]))};
 p.lastExecutionReceipt=latest;p.currentExecutionReceipt=structuredClone(latest);d.currentExecutionReceipt=structuredClone(latest);
 v.receipt=r;v.gitBlob=path=>path==='c3-attempt.json'?'4'.repeat(40):'';v.readJson=path=>path==='c3-attempt.json'?r:{};return v;
};
test('current C3 attempt preserves exact serving predecessor while one runtime+Hosting successor is pending',()=>{
 const v=latestC3AttemptFixture(),before=JSON.stringify(v.descriptor.postDeployRunSeal),r=validateLatestExecutionSource(v);assert.equal(r.pass,true,JSON.stringify(r));assert.equal(r.c3Attempt,true);assert.equal(JSON.stringify(v.descriptor.postDeployRunSeal),before);
});
for(const [name,change]of [
 ['candidate relabel',v=>{v.receipt.sourceSha=v.pointer.lastExecutionReceipt.sourceSha=v.descriptor.productSourceSha;}],
 ['candidate tree relabel',v=>{v.receipt.sourceTree=v.pointer.lastExecutionReceipt.sourceTree=v.descriptor.productTreeAuthority;}],
 ['wrong run',v=>{v.pointer.lastExecutionReceipt.runId=4;}],
 ['missing receipt blob',v=>{delete v.pointer.lastExecutionReceipt.gitBlob;}],
 ['changed receipt blob',v=>{v.gitBlob=()=>'5'.repeat(40);}],
 ['unreadable receipt',v=>{v.readJson=()=>{throw Error('missing');};}],
 ['wrong Hosting',v=>{v.receipt.hostingVersion='other';}],
 ['wrong runtime',v=>{v.receipt.runtimeRevision='other';}],
 ['wrong digest',v=>{v.receipt.runtimeDigest='other';}],
 ['pending missing',v=>{delete v.descriptor.pendingDevSuccessor;}],
 ['pending pointers differ',v=>{v.pointer.pendingDevSuccessor.sourceSha='6'.repeat(40);}],
 ['pending wrongly published',v=>{v.descriptor.pendingDevSuccessor.devPublished=true;}],
 ['serving Hosting changed',v=>{v.descriptor.pendingDevSuccessor.servingHosting.hostingVersion='other';}],
 ['C3 artifact changed',v=>{v.descriptor.currentC3PreterminalAudit.artifactId=400;}],
 ['promoted complete count',v=>{v.receipt.matchModules=21;}],
 ['runtime deployment',v=>{v.receipt.runtimeDeploys=1;}],
 ['unknown kind',v=>{v.pointer.lastExecutionReceipt.kind='OTHER';}],
 ...['production','terminalCertified','phaseAComplete','i4Authorized'].map(k=>[k+' claimed',v=>{v.receipt[k]=true;}])
])test('C3 attempt successor rejects '+name,()=>{const v=latestC3AttemptFixture();change(v);assert.equal(validateLatestExecutionSource(v).pass,false);});

for(const [name,change,code]of [
 ['stale nested strict4 versus actual5',v=>{v.pointer.activePhaseAClosureLock20261110.currentAccountingSemantics.strictOwnerDomainMatch.matched=4;},'CURRENT_PHASE_LOCK_NESTED_ACCOUNTING_DESYNC'],
 ['human count replaced by technical count',v=>{v.pointer.activePhaseAClosureLock20261110.currentAccountingSemantics.humanFunctionalBlocks.passed=5;},'CURRENT_PHASE_LOCK_NESTED_ACCOUNTING_DESYNC'],
 ['missing C3 component',v=>{delete v.descriptor.currentC3PreterminalAudit.pendingOwnerProofFiles;},'CURRENT_C3_PENDING_BREAKDOWN_DESYNC'],
 ['C3 components do not sum to pending',v=>{v.descriptor.currentC3PreterminalAudit.pendingMappingApprovalFiles=1;},'CURRENT_C3_PENDING_BREAKDOWN_DESYNC'],
 ['negative C3 pending component',v=>{v.descriptor.currentC3PreterminalAudit.pendingBlobProvenanceFiles=-1;},'CURRENT_C3_PENDING_BREAKDOWN_DESYNC']
])test('single canonical guard rejects '+name,()=>{const v=fixture();change(v);const r=validateCurrentAuthorityAliases(v);assert.equal(r.pass,false);assert.ok(r.failures.includes(code),JSON.stringify(r));});
