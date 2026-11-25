import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createD01DocumentAuthorityMapping,validateD01DocumentAuthorityBinding,D01_DOCUMENT_AUTHORITY} from './cxorbia-i3-document-authority-task-binding.mjs';
import {readFrozenTaskContracts,evaluateFrozenTaskCoverage,hasTerminalAcceptance} from './cxorbia-i3-terminal-module-domain-coverage.mjs';
import {completeSyntheticProcessMatrix} from './fixtures/cxorbia-i3-frozen-task-acceptance.fixture.mjs';
import {buildFrozenTaskEvidenceBindings} from './cxorbia-i3-bind-frozen-task-evidence.mjs';

const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const realMatrix=JSON.parse(fs.readFileSync(descriptor.moduleTruthPath,'utf8'));
const contracts=readFrozenTaskContracts(),task=contracts.tasks.find(t=>t.taskId==='D01');
const realReceipt=fs.readFileSync(D01_DOCUMENT_AUTHORITY.path);
const mapping=createD01DocumentAuthorityMapping(task);
const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'synthetic-runtime',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/synthetic/versions/1',artifactSha256:'d'.repeat(64)};
const readImmutable=ref=>execFileSync('git',['cat-file','blob',ref.gitBlob],{maxBuffer:32*1024*1024});
const cumulativeMap=JSON.parse(readImmutable(descriptor.currentCumulativeTaskEvidenceMap));

test('real accepted D01 document is reused without a fabricated runtime/role/provider execution',()=>{
 const proof=validateD01DocumentAuthorityBinding({task,mapping,matrix:realMatrix});
 assert.equal(proof.pass,true);assert.equal(proof.newFunctionalExecution,false);
 assert.equal(proof.observedClauses.length,2);
 assert.equal(mapping.sourceSha,undefined);assert.equal(mapping.providerAck,undefined);
 assert.equal(mapping.requiredClauses.every(c=>c.operationKind==='DOCUMENT_AUTHORITY'),true);
});
test('current evaluator credits the already accepted documentary task and leaves the other51 unresolved',()=>{
 const matrix=structuredClone(realMatrix);matrix.functionalTaskEvidenceMappings={D01:mapping};
 const proof=evaluateFrozenTaskCoverage({matrix,receipts:[],identity});
 const d01=proof.tasks.find(t=>t.taskId==='D01');
 assert.equal(d01.status,'GO');assert.deepEqual(d01.mappingFailures,[]);
 assert.equal(proof.provenTaskCount,1);assert.equal(proof.pass,false);
 assert.equal(proof.tasks.filter(t=>t.status==='HOLD').length,51);
});
for(const [name,mutate] of [
 ['document hash',m=>m.executionUpdateD01.source.sha256='0'.repeat(64)],
 ['document revision',m=>m.executionUpdateD01.source.driveRevisionId='another-revision'],
 ['country scope',m=>m.executionUpdateD01.scopeCountries=['GT']],
 ['project',m=>m.executionUpdateD01.project='Other project'],
 ['approval',m=>m.executionUpdateD01.approval.chronologyAlignedWithFinalDriveRevision=false],
 ['missing active approval',m=>delete m.executionUpdateD01]
])test('D01 reuse rejects active-authority drift: '+name,()=>{
 const matrix=structuredClone(realMatrix);mutate(matrix);
 const result=validateD01DocumentAuthorityBinding({task,mapping,matrix});
 assert.equal(result.pass,false);assert.ok(result.failures.includes('DOCUMENT_ACTIVE_AUTHORITY_MISMATCH'));
});
test('D01 cannot nominate a different receipt or use modified immutable bytes',()=>{
 const wrong={...mapping,authorityReceipt:{...mapping.authorityReceipt,path:'another-pass.json'}};
 let requested;
 const result=validateD01DocumentAuthorityBinding({task,mapping:wrong,matrix:realMatrix,readBytes:p=>{requested=p;return Buffer.concat([realReceipt,Buffer.from(' ')]);}});
 assert.equal(requested,D01_DOCUMENT_AUTHORITY.path);
 assert.equal(result.pass,false);assert.ok(result.failures.includes('DOCUMENT_MAPPING_CONTRACT_BINDING'));
 assert.ok(result.failures.includes('DOCUMENT_RECEIPT_HASH'));
});
test('missing immutable document receipt does not become a PASS from active summary alone',()=>{
 const result=validateD01DocumentAuthorityBinding({task,mapping,matrix:realMatrix,readBytes:()=>{throw Error('absent');}});
 assert.equal(result.pass,false);assert.ok(result.failures.includes('DOCUMENT_RECEIPT_UNAVAILABLE'));
});
test('document evidence cannot be relabeled to satisfy a functional task',()=>{
 const matrix=structuredClone(realMatrix);
 matrix.functionalTaskEvidenceMappings={D02:{...mapping,taskId:'D02'}};
 const result=evaluateFrozenTaskCoverage({matrix,identity});
 const d02=result.tasks.find(t=>t.taskId==='D02');
 assert.equal(d02.status,'HOLD');assert.ok(d02.mappingFailures.length>0);
});
test('terminal revalidation accepts exact D01 evidence while retaining all functional and P0 guards',()=>{
 const matrix=completeSyntheticProcessMatrix(identity);
 matrix.executionUpdateD01=structuredClone(realMatrix.executionUpdateD01);
 matrix.functionalTaskEvidenceMappings.D01=mapping;
 matrix.terminalClosure.acceptedCurrentOwnerReceipts=matrix.terminalClosure.acceptedCurrentOwnerReceipts.filter(r=>r.receipt.contractAuthority.taskBindings[0].taskId!=='D01');
 const rows=matrix.terminalClosure.acceptedCurrentOwnerReceipts;
 matrix.terminalClosure.processAcceptance=evaluateFrozenTaskCoverage({matrix,receipts:rows.map(r=>r.receipt),identity});
 assert.equal(matrix.terminalClosure.processAcceptance.provenTaskCount,52);
 assert.equal(hasTerminalAcceptance(matrix,identity),true);
 rows[0].receipt.uiProof.realBrowserE2E=false;assert.equal(hasTerminalAcceptance(matrix,identity),false);
 rows[0].receipt.uiProof.realBrowserE2E=true;matrix.terminalClosure.unresolvedP0=[{id:'P0_REAL'}];
 assert.equal(hasTerminalAcceptance(matrix,identity),false);
});
test('deterministic generator preserves18 historical scopes and25 scoped clauses without promoting partial tasks',()=>{
 const before=JSON.stringify(realMatrix);
 const result=buildFrozenTaskEvidenceBindings({matrix:realMatrix,contracts,cumulativeMap,readImmutable});
 assert.equal(JSON.stringify(realMatrix),before);
 assert.deepEqual(Object.keys(result.matrixPatch.functionalTaskEvidenceMappings),['D01']);
 assert.equal(result.immutableReferencesVerified,22);
 assert.equal(result.preservedCumulativeTaskScopes.length,18);
 assert.equal(result.scopedClauseBindings.find(x=>x.taskId==='D08').knownClauseIds.length,25);
 assert.equal(result.scopedClauseBindings[0].completeTaskInventory,false);
 assert.equal(result.preservedCumulativeTaskScopes.every(t=>t.newFunctionalPass===false),true);
 for(const id of ['C04','C05','D06'])assert.equal(result.matrixPatch.functionalTaskEvidenceMappings[id],undefined);
 assert.equal(result.phaseAComplete,false);assert.equal(result.newFunctionalPasses,0);
 assert.deepEqual(buildFrozenTaskEvidenceBindings({matrix:realMatrix,contracts,cumulativeMap,readImmutable}),result);
});
test('generator rejects altered historical acceptance or a mismatched immutable receipt',()=>{
 const altered=structuredClone(cumulativeMap);altered.tasks[0].originalAcceptance='accept everything';
 assert.throws(()=>buildFrozenTaskEvidenceBindings({matrix:realMatrix,contracts,cumulativeMap:altered,readImmutable}),/TASK_ACCEPTANCE/);
 assert.throws(()=>buildFrozenTaskEvidenceBindings({matrix:realMatrix,contracts,cumulativeMap,readImmutable:()=>Buffer.from('{}')}),/IMMUTABLE_HASH/);
});
