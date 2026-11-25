import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {RUN2537_REFS,normalizeRun2537AcceptedScopes,readRun2537Immutable} from './cxorbia-i3-run2537-accepted-scope-codec.mjs';
const task=JSON.parse(fs.readFileSync('docs/checkpoints/CXORBIA_I3_FROZEN_FUNCTIONAL_TASK_CONTRACTS_20261125.json','utf8')).tasks.find(t=>t.taskId==='E05');
const base={task,currentSourceSha:'8d70a09d1c58d31f5f4b0926f519bb7ac6695749',readSourceBytes:(source,p)=>execFileSync('git',['show',`${source}:${p}`],{maxBuffer:4*1024*1024})};
const decoded=normalizeRun2537AcceptedScopes(base);
test('decodes three accepted obligations from exact immutable RUN2537 bytes',()=>{
 assert.equal(decoded.originalDecision,'PASS_I3_TENANT_ADMIN_CONFIG_BRANDING_COMPLETE_CONTRACT');
 assert.equal(decoded.scopedObligations.length,3);
 assert.equal(decoded.scopedObligations[0].readOnlyProof.checksBeforeReload.length,8);
 assert.equal(decoded.scopedObligations[0].readOnlyProof.checksAfterReload.length,8);
 assert.equal(decoded.scopedObligations[0].role,'super');
 assert.equal(decoded.acceptanceBindingSha256,task.acceptanceBindingSha256);
});
test('retains mixed-run HR activity and write branch instead of manufacturing global read-only counts',()=>{
 const read=decoded.scopedObligations[0];
 assert.equal(decoded.originalOperationKind,'MUTATION');
 assert.equal(read.readOnlyProof.commandWritesEnabled,true);
 assert.equal(read.readOnlyProof.countryMutationTested,false);
 assert.equal(read.readOnlyProof.mutations[0].classification,'AUTHORIZED_HR_RECONCILIATION_NOT_CONFIGURATION_WRITE');
 assert.equal(read.recordedContext.periodId,'NOT_RECORDED_IN_VIEW_RECEIPT');
 assert.equal(Object.hasOwn(read,'providerWrites'),false);
 assert.equal(Object.hasOwn(read,'providerAck'),false);
});
test('provider steps bind actual committed receipt and audit idempotency key, not a generated key',()=>{
 const write=decoded.scopedObligations[1];
 assert.equal(write.operationKind,'PROVIDER_WRITE');
 assert.deepEqual(write.scope,{tenantId:'tya',projectId:'prj-369e6d061c9dc27ed725',periodId:'setup-i3-country-43772983839-1'});
 assert.equal(write.steps[0].remoteReceiptId,'tenants/tya/commandReceipts/b197ccf0adf7fd4fbca854a92c76b57982e0d185');
 assert.equal(write.steps[0].idempotencyKey,'project.update:1rrtmcc');
 assert.equal(write.steps[1].remoteReceiptId,'tenants/tya/commandReceipts/bc7ebfd76d8e931eb1534818d3a974fe5de0928c');
 assert.equal(write.steps[1].idempotencyKey,'project.update:1q3qiky');
 assert.deepEqual(write.steps.map(x=>x.providerWritesOnReplay),[0,0]);
});
test('preserves cleanup and reports the actual changed dependency without fake carry',()=>{
 assert.deepEqual(decoded.changedOwnerPaths,[]);
 assert.deepEqual(decoded.changedDependencyPaths,['app/adapters/tya-c6-unified-human-runtime-v1.js']);
 assert.deepEqual(decoded.scopedObligations[2].cleanup,{decision:'PASS_OWNED_FIXTURE_CLEANUP',deleted:7,remaining:0});
 assert.equal(decoded.carryForward,null);
 assert.deepEqual(decoded.terminalOwnerReceipts,[]);
 assert.equal(decoded.completeTaskInventory,false);
 assert.equal(decoded.fullTaskPass,false);
 assert.equal(decoded.newFunctionalPasses,0);
});
test('refuses altered historical receipt bytes even if JSON still says PASS',()=>{
 assert.throws(()=>normalizeRun2537AcceptedScopes({...base,readImmutable:ref=>ref===RUN2537_REFS.mixed?Buffer.concat([readRun2537Immutable(ref),Buffer.from(' ')]):readRun2537Immutable(ref)}),/IMMUTABLE_MIXED/);
});
test('refuses different original contract bytes and a different task acceptance',()=>{
 assert.throws(()=>normalizeRun2537AcceptedScopes({...base,readImmutable:ref=>ref===RUN2537_REFS.contract?Buffer.from('{}'):readRun2537Immutable(ref)}),/IMMUTABLE_CONTRACT/);
 assert.throws(()=>normalizeRun2537AcceptedScopes({...base,task:{...task,acceptanceBindingSha256:'0'.repeat(64)}}),/FROZEN_E05_ACCEPTANCE/);
 assert.throws(()=>normalizeRun2537AcceptedScopes({...base,task:{...task,frozenAuthority:{...task.frozenAuthority,acceptance:'rewritten'}}}),/FROZEN_E05_ACCEPTANCE/);
});
test('refuses an unverified original owner source instead of accepting a declared hash',()=>{
 assert.throws(()=>normalizeRun2537AcceptedScopes({...base,readSourceBytes:(source,p)=>source===decoded.originalIdentity.sourceSha?Buffer.from('different'):base.readSourceBytes(source,p)}),/ORIGINAL_SOURCE_BYTES/);
});
