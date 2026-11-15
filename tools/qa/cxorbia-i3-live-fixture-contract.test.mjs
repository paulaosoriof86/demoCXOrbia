import test from 'node:test';
import assert from 'node:assert/strict';
import {commandDigest, requireProviderAck, reservationLifecyclePassed, restoreAssignment} from './cxorbia-i3-live-fixture-contract.mjs';

const ack={ok:true,committed:true,providerAck:true,successUiAllowed:true};
for(const key of Object.keys(ack))for(const value of [false,undefined,'true'])test(`reject ${key}=${value}`,()=>{
  assert.throws(()=>requireProviderAck({...ack,[key]:value},'RESERVE'),/ACK_NOT_COMMITTED/);
});
test('read-only reservation readiness never proves CRUD',()=>assert.equal(reservationLifecyclePassed({ok:true,source:'durable_provider',created:false,statusAck:false,deleted:false}),false));
const lifecycle={operationKind:'SYNTHETIC_PROVIDER_LIFECYCLE',production:false,duplicateCount:0,
  ...Object.fromEntries(['created','createAck','statusAck','deleted','deleteAck','independentFirestoreReadback','reloadReadback','absentAfterReload','idempotentReplay','cleanupVerified'].map(k=>[k,true]))};
test('complete observed reservation lifecycle qualifies',()=>assert.equal(reservationLifecyclePassed(lifecycle),true));
for(const key of Object.keys(lifecycle).filter(k=>lifecycle[k]===true))test('no reservation PASS without '+key,()=>assert.equal(reservationLifecyclePassed({...lifecycle,[key]:false}),false));

const time=n=>({isEqual:other=>other?.nanoseconds===n,nanoseconds:n});
function fixture(){
  const before={tenantId:'t',projectId:'p',periodId:'period',shopperId:null,estado:'disponible',status:'disponible',version:4,hrRowId:'hr-1',retained:'business-field'};
  const command={commandType:'visit.assign',entityId:'v',tenantId:'t',projectId:'p',periodId:'period',idempotencyKey:'fixture',expectedVersion:4,payload:{shopperId:'qa',hrRowId:'hr-1'}};
  const after={...before,shopperId:'qa',estado:'asignada',status:'asignada',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,updatedAt:'2026-11-15T01:00:00Z',version:5};
  const state={visit:after,visitTime:time(2),receipt:{status:'committed',providerAck:true,commandDigest:commandDigest(command),commandType:command.commandType,entityId:'v',actorUid:'admin'},receiptTime:time(2),writes:0};
  const snap=kind=>({exists:state[kind]!=null,data:()=>structuredClone(state[kind]),updateTime:state[kind+'Time']});
  const ref={path:'visits/v',get:async()=>snap('visit')},receiptRef={path:'receipts/r'};
  const db={runTransaction:async fn=>fn({get:async r=>snap(r===ref?'visit':'receipt'),set:(r,data)=>{assert.equal(r,ref);state.visit=structuredClone(data);state.visitTime=time(3);state.writes++;}})};
  return {db,state,journal:{ref,receiptRef,beforeData:before,beforeUpdateTime:time(1),command,actorUid:'admin',submitted:true,requestResolved:false}};
}
test('lost HTTP response after committed assignment still restores exact before image',async()=>{
  const {db,state,journal}=fixture();const r=await restoreAssignment(db,journal);
  assert.equal(r.exactReadback,true);assert.deepEqual(state.visit,journal.beforeData);assert.equal(state.writes,1);
  await restoreAssignment(db,journal);assert.equal(state.writes,1);
});
for(const [name,mutate,code] of [
  ['later same-millisecond write',s=>s.visitTime=time(3),'CONCURRENT_WRITE'],
  ['different target',s=>s.receipt.entityId='other','RECEIPT_MISMATCH'],
  ['different actor',s=>s.receipt.actorUid='other','RECEIPT_MISMATCH'],
  ['different digest',s=>s.receipt.commandDigest='0'.repeat(64),'RECEIPT_MISMATCH'],
  ['false provider ACK',s=>s.receipt.providerAck=false,'RECEIPT_MISMATCH'],
  ['unrelated field edited',s=>s.visit.retained='changed','POSTIMAGE_CONFLICT'],
  ['different assigned shopper',s=>s.visit.shopperId='real-shopper','POSTIMAGE_CONFLICT'],
  ['later version',s=>s.visit.version=6,'POSTIMAGE_CONFLICT'],
  ['missing receipt',s=>s.receipt=null,'RECEIPT_MISSING'],
  ['missing visit',s=>s.visit=null,'VISIT_MISSING']
])test('restore fails closed: '+name,async()=>{
  const {db,state,journal}=fixture();mutate(state);
  await assert.rejects(restoreAssignment(db,journal),new RegExp(code));assert.equal(state.writes,0);assert.notEqual(journal.restored,true);
});
test('ambiguous in-flight request is not called clean merely because before image remains',async()=>{
  const {db,state,journal}=fixture();state.visit=structuredClone(journal.beforeData);state.visitTime=time(1);state.receipt=null;
  await assert.rejects(restoreAssignment(db,journal),/AMBIGUOUS_REQUEST/);assert.equal(state.writes,0);
});
test('known blocked command leaves exact before image without writes',async()=>{
  const {db,state,journal}=fixture();state.visit=structuredClone(journal.beforeData);state.visitTime=time(1);state.receipt=null;journal.outcome='BLOCKED_NO_WRITES';
  assert.equal((await restoreAssignment(db,journal)).writes,0);
});
test('committed HTTP ACK without durable receipt does not authorize cleanup',async()=>{
  const {db,state,journal}=fixture();state.visit=structuredClone(journal.beforeData);state.visitTime=time(1);state.receipt=null;journal.outcome='COMMITTED_ACK';
  await assert.rejects(restoreAssignment(db,journal),/AMBIGUOUS_REQUEST/);
});
test('readback error prevents fixture cleanup authorization',async()=>{
  const {db,journal}=fixture();journal.ref.get=async()=>{throw new Error('readback unavailable');};
  await assert.rejects(restoreAssignment(db,journal),/readback unavailable/);assert.notEqual(journal.restored,true);
});
