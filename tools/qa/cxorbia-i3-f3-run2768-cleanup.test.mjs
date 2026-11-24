import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {F3_RUN2768_TARGET as TARGET,F3_RUN2768_TARGET_PATHS as PATHS,F3_RUN2768_CLEANUP_PIN as PIN,f3ClearRun2768OwnedOrphan,f3ValidateRun2770InspectionBytes} from './cxorbia-i3-b14-isolated-provider-writer-qa.mjs';
const bytes=fs.readFileSync(process.env.CXORBIA_F3_TEST_INSPECTION_FILE||new URL('../../'+PIN.receiptPath,import.meta.url));
const evidence=JSON.parse(bytes),lockPath=evidence.state.lock.path;
function fixture(){
 const rows=new Map([[lockPath,structuredClone(evidence.state.lock.data)]]),writes=[],checkpoints=[];let version=1,mutateBeforeTransaction=null,collections=[];
 const stamp=v=>({toDate:()=>new Date(PIN.updateTime),isEqual:other=>other?.version===v,version:v});
 const snap=p=>({exists:rows.has(p),data:()=>structuredClone(rows.get(p)),updateTime:rows.has(p)?stamp(version):undefined});
 const db={projectId:'cxorbia-backend-dev',doc:p=>{
  assert.ok(p===lockPath||PATHS.includes(p));return {path:p,get:async()=>snap(p),listCollections:async()=>collections};
 },runTransaction:async fn=>{
  if(mutateBeforeTransaction)mutateBeforeTransaction();
  const deletes=[];await fn({get:async ref=>snap(ref.path),delete:ref=>{assert.equal(ref.path,lockPath);deletes.push(ref.path);},set:()=>assert.fail('No baseline reconstruction'),create:()=>assert.fail('No creation')});
  for(const p of deletes){rows.delete(p);writes.push({operation:'delete',path:p});}
 }};
 const auth={getUser:async uid=>{assert.equal(uid,TARGET.owner+'-admin');throw Object.assign(Error('absent'),{code:'auth/user-not-found'});}};
 return {db,auth,rows,writes,checkpoints,checkpoint:async(stage,data)=>checkpoints.push({stage,...data}),setBefore:fn=>{mutateBeforeTransaction=fn;},bumpVersion:()=>{version++;},setCollections:rows=>{collections=rows;}};
}
test('RUN2770 exact artifact bytes/state/UUID pin validate before any SDK writes',()=>{
 const result=f3ValidateRun2770InspectionBytes(bytes);assert.equal(result.stateDigest,PIN.stateDigest);assert.equal(result.state.lock.digest,PIN.lockDigest);assert.equal(result.state.lock.data.attemptId,PIN.attemptId);
 for(const changed of [Buffer.from(String(bytes)+' '),Buffer.from(String(bytes).replace(TARGET.projectId,'foreign-project'))])assert.throws(()=>f3ValidateRun2770InspectionBytes(changed),/F3_CLEANUP_INSPECTION_FILE_SHA/);
});
test('RUN2768 CAS deletes only the reviewed expired lock, records before/deleted checkpoints and verifies complete absence',async()=>{
 const h=fixture(),result=await f3ClearRun2768OwnedOrphan({...h,inspectionBytes:bytes});
 assert.equal(result.decision,'PASS_F3_RUN2768_EXACT_OWNED_ORPHAN_REMOVED');assert.equal(result.writes,1);assert.equal(result.restoresHistoricalBaseline,false);
 assert.deepEqual(h.writes,[{operation:'delete',path:lockPath}]);assert.deepEqual(h.checkpoints.map(x=>x.stage),['before','deleted']);
 assert.equal(result.after.lock.exists,false);assert.ok(result.after.documents.every(x=>x.exists===false));assert.equal(result.after.auth.exists,false);
 for(const key of ['remoteMakeWrites','authWrites','operationalDocumentWrites','productionWrites'])assert.equal(result[key],0);
});
test('RUN2768 cleanup exact replay is an observed zero-write no-op',async()=>{
 const h=fixture();await f3ClearRun2768OwnedOrphan({...h,inspectionBytes:bytes});h.writes.length=0;
 const result=await f3ClearRun2768OwnedOrphan({...h,inspectionBytes:bytes});assert.equal(result.decision,'PASS_F3_RUN2768_OWNED_ORPHAN_ALREADY_ABSENT');assert.equal(result.idempotentReplay,true);assert.equal(result.writes,0);assert.deepEqual(h.writes,[]);
});
test('RUN2768 cleanup cannot use a production or different Firestore instance',async()=>{
 const h=fixture();h.db.projectId='tya-plataforma';await assert.rejects(f3ClearRun2768OwnedOrphan({...h,inspectionBytes:bytes}),/F3_CLEANUP_DATABASE_PROJECT/);assert.deepEqual(h.writes,[]);
});
for(const [name,change] of [
 ['different owner',h=>h.rows.get(lockPath).receiptPath='tenants/tya/commandReceipts/hr-foreign'],
 ['different exact attempt',h=>h.rows.get(lockPath).attemptId='11111111-1111-4111-8111-111111111111'],
 ['remaining scoped document',h=>h.rows.set(PATHS[0],{qaOwner:TARGET.owner})],
 ['remaining scoped subcollection',h=>h.setCollections([{id:'visits'}])],
 ['same data but concurrent native version change',h=>h.setBefore(()=>h.bumpVersion())],
 ['concurrent owner change',h=>h.setBefore(()=>{h.rows.get(lockPath).projectId='cinepolis';h.bumpVersion();})],
 ['concurrent fixture creation',h=>h.setBefore(()=>h.rows.set(PATHS[0],{qaOwner:'new-run'}))]
])test('RUN2768 CAS fails closed with zero writes on '+name,async()=>{
 const h=fixture();change(h);await assert.rejects(f3ClearRun2768OwnedOrphan({...h,inspectionBytes:bytes}),/F3_(?:CLEANUP|RECOVERY)_/);assert.deepEqual(h.writes,[]);assert.ok(h.rows.has(lockPath));
});
