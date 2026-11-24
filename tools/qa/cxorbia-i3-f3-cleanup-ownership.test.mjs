import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {F3_QA,f3AssertCleanupLock,f3SafeEvidence} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
function fixture(){
 const owner='f3-qa-45386193183-1',idempotencyKey=owner+'-reconcile-initial',sourceRevision='a'.repeat(64),actorUid=owner+'-admin',scope={tenantId:'tya',projectId:F3_QA.projectId};
 const path='tenants/tya/commandReceipts/hr-'+digest([F3_QA.projectId,idempotencyKey]),attemptId='11111111-1111-4111-8111-111111111111';
 const data={...scope,sourceRevision,actorUid,idempotencyKey,attemptId,status:'committed',digest:digest({actorUid,scope,sourceRevision,commandType:'hr.snapshot.reconcile'}),result:{ok:true,providerAck:true,authWrites:0,unresolvedEffects:0,unverifiedEffects:0}};
 return {owner,baseline:null,current:{projectId:F3_QA.projectId,receiptPath:path,attemptId,status:'committed',expiresAt:1},reconcilePaths:[path],receipts:[{path,data}]};
}
test('F3 cleanup accepts an unchanged absent/committed baseline and an exactly owned committed receipt',()=>{
 const h=fixture();assert.equal(f3AssertCleanupLock(h),'OWNED_COMMITTED_RECONCILIATION');
 assert.equal(f3AssertCleanupLock({...h,current:null}),'BASELINE_UNCHANGED');
 const prior={projectId:'other-project',receiptPath:'prior-committed',attemptId:'prior',status:'committed'};
 assert.equal(f3AssertCleanupLock({...h,current:prior,baseline:structuredClone(prior)}),'BASELINE_UNCHANGED');
});
for(const [name,change] of [
 ['partial current lock',h=>h.current.status='partial'],
 ['running current lock',h=>h.current.status='running'],
 ['foreign project',h=>h.current.projectId='cinepolis'],
 ['foreign receipt path',h=>h.current.receiptPath='tenants/tya/commandReceipts/hr-foreign'],
 ['deleted receipt',h=>h.receipts[0].data=null],
 ['foreign actor',h=>h.receipts[0].data.actorUid='another-admin'],
 ['foreign idempotency owner',h=>h.receipts[0].data.idempotencyKey='f3-qa-other-reconcile-initial'],
 ['different attempt',h=>h.receipts[0].data.attemptId='another-attempt'],
 ['tampered digest',h=>h.receipts[0].data.digest='f'.repeat(64)],
 ['partial receipt',h=>h.receipts[0].data.status='partial'],
 ['unverified effects',h=>h.receipts[0].data.result.unverifiedEffects=1],
 ['unexpected Auth write',h=>h.receipts[0].data.result.authWrites=1],
])test('F3 cleanup blocks '+name+' and preserves input ownership evidence',()=>{
 const h=fixture();change(h);const before=structuredClone(h);assert.throws(()=>f3AssertCleanupLock(h),/F3_QA_LOCK_(?:OWNER|RECEIPT_OWNER)/);assert.deepEqual(h,before);
});
test('F3 evidence retains the reconciliation contract while redacting unexpected secrets recursively',()=>{
 const evidence={status:'partial',credentialAuthenticationPending:false,credentialReadback:'NO_CREDENTIAL_CHANGE',receiptBinding:{actorUid:'qa-admin'},unexpected:{password:'secret',idToken:'secret',refresh_token:'secret',credentials:{private_key:'secret'},detail:'Bearer abc.secret'},rows:[{authorization:'Bearer secret',apiKey:'secret'}]};
 const safe=f3SafeEvidence(evidence),encoded=JSON.stringify(safe);
 assert.equal(safe.status,'partial');assert.equal(safe.credentialReadback,'NO_CREDENTIAL_CHANGE');assert.equal(safe.receiptBinding.actorUid,'qa-admin');assert.ok(!encoded.includes('abc.secret'));assert.ok(!encoded.includes('"secret"'));assert.equal(evidence.unexpected.password,'secret');
});
