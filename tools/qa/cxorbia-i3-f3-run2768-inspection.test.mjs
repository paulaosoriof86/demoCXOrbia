import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {F3_RUN2768_TARGET as TARGET,F3_RUN2768_TARGET_PATHS as PATHS,f3ReadRun2768State,f3AssessRun2768Orphan} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const lockPath='tenants/tya/commandReceipts/hr-scope-'+digest('tya'),projectPath='tenants/tya/projects/'+TARGET.projectId;
function fixture(){
 const lock={receiptPath:TARGET.receiptPath,projectId:TARGET.projectId,attemptId:'11111111-1111-4111-8111-111111111111',status:'partial',expiresAt:Date.parse('2026-11-24T11:43:20Z')};
 const reads=[],writes=[];
 const deny=name=>()=>{writes.push(name);throw Error('UNEXPECTED_WRITE');};
 const db={doc:p=>{
  assert.ok(p===lockPath||PATHS.includes(p),'No unbounded/foreign reads');
  return {get:async()=>{reads.push(p);return {exists:p===lockPath,data:()=>p===lockPath?structuredClone(lock):undefined,updateTime:{toDate:()=>new Date('2026-11-24T11:41:25Z')}};},
   listCollections:async()=>{assert.ok(p===projectPath||p===TARGET.receiptPath);reads.push(p+'/collections');return [];},
   create:deny('create'),set:deny('set'),update:deny('update'),delete:deny('delete')};
 },runTransaction:deny('transaction')};
 const auth={getUser:async uid=>{assert.equal(uid,TARGET.owner+'-admin');reads.push('auth:'+uid);throw Object.assign(Error('absent'),{code:'auth/user-not-found'});},createUser:deny('createUser'),deleteUser:deny('deleteUser')};
 return {db,auth,lock,reads,writes};
}
test('RUN2768 inspection only reads the fixed 15 expected documents, exact lock, two QA collection inventories and exact Auth UID',async()=>{
 const h=fixture(),state=await f3ReadRun2768State(h),plan=f3AssessRun2768Orphan(state,Date.parse('2026-11-24T12:00:00Z'));
 assert.equal(PATHS.length,15);assert.equal(h.reads.length,19);assert.deepEqual(h.writes,[]);
 assert.equal(state.documents.length,15);assert.ok(state.documents.every(row=>row.exists===false));assert.equal(state.writes,0);
 assert.equal(plan.decision,'REVIEWABLE_F3_RUN2768_EXPIRED_OWNED_ORPHAN');assert.equal(plan.restoresHistoricalBaseline,false);assert.equal(plan.priorCommittedBaselineAvailable,false);
 assert.equal(plan.lockDigest,digest(h.lock));assert.equal(plan.sourceStateDigest,digest(state));
});
for(const [name,change] of [
 ['foreign project',s=>s.lock.data.projectId='cinepolis'],
 ['foreign receipt',s=>s.lock.data.receiptPath='tenants/tya/commandReceipts/hr-foreign'],
 ['running lock',s=>s.lock.data.status='running'],
 ['missing UUID',s=>s.lock.data.attemptId='guessed'],
 ['lease outside known failed-run window',s=>s.lock.data.expiresAt=Date.parse('2026-11-24T11:50:00Z')],
 ['remaining fixture',s=>s.documents[0].exists=true],
 ['remaining subcollection',s=>s.projectCollections=['visits']],
 ['remaining auth',s=>s.auth.exists=true],
 ['extra lock field',s=>s.lock.data.otherOwner=true]
])test('RUN2768 recovery assessment refuses '+name,async()=>{
 const h=fixture(),state=await f3ReadRun2768State(h);change(state);state.lock.digest=digest(state.lock.data);
 assert.throws(()=>f3AssessRun2768Orphan(state,Date.parse('2026-11-24T12:00:00Z')),/F3_RECOVERY_/);assert.deepEqual(h.writes,[]);
});
test('RUN2768 inspector redacts an unexpected secret on the lock and refuses to authorize that modified shape',async()=>{
 const h=fixture();h.lock.accessToken='never-persist-secret';const state=await f3ReadRun2768State(h);
 assert.ok(!JSON.stringify(state).includes('never-persist-secret'));
 assert.throws(()=>f3AssessRun2768Orphan(state,Date.parse('2026-11-24T12:00:00Z')),/F3_RECOVERY_LOCK_READBACK/);assert.deepEqual(h.writes,[]);
});
