import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {maybeHandleCertificationRuntimeRequest,certificationRouteScope} from '../certification-runtime.mjs';

const scope={tenantId:'tya',projectId:'cinepolis'};
const actor={uid:'admin-uid',role:'admin',namespace:'staff'};
const id='attempt-'+'a'.repeat(28),other='attempt-'+'b'.repeat(28);
const exact={id,recordType:'certification_attempt',tenantId:scope.tenantId,projectId:scope.projectId,
  periodId:'cinepolis-2026-10',shopperId:'isolated-qa-shopper',bankResourceId:'qa-published-bank',
  createdAt:'2026-11-08T10:00:00.000Z',score:100,pass:true,status:'certified',
  eligibilityGranted:true,currentCertification:true,providerAck:true,answersHash:'original-answers-hash',
  feedback:[{question:'QA',selected:'A',ok:true}]};
const legitimate={...exact,id:other,shopperId:'actual-shopper',createdAt:'2026-11-07T10:00:00.000Z'};
const payload=()=>({attemptId:id,shopperId:exact.shopperId,bankResourceId:exact.bankResourceId,
  expectedCreatedAt:exact.createdAt,reason:'Intento sintético de validación I3 en DEV',confirmation:'ANULAR PRUEBA'});

function provider(){
  const attempts=new Map([[id,structuredClone(exact)],[other,structuredClone(legitimate)]]);
  const receipts=new Map(),users=new Map([[actor.uid,{active:true,status:'active',role:'admin',authNamespace:'staff',
    tenantId:scope.tenantId,projectIds:[scope.projectId]}]]);
  let writes=0;
  const document=(kind,identifier)=>({id:identifier,kind,
    get:async()=>{const map={attempt:attempts,receipt:receipts,user:users}[kind],value=map.get(identifier);
      return {id:identifier,exists:!!value,data:()=>structuredClone(value)};}});
  const db={collection:name=>{
    assert.equal(name,'tenants');
    return {doc:tenant=>{
      assert.equal(tenant,scope.tenantId);
      return {collection:kind=>{
        if(kind==='commandReceipts')return {doc:id=>document('receipt',id)};
        if(kind==='users')return {doc:id=>document('user',id)};
        if(kind==='projects')return {doc:project=>{
          assert.equal(project,scope.projectId);
          return {collection:sub=>{
            assert.equal(sub,'certifications');
            return {doc:id=>document('attempt',id)};
          }};
        }};
        throw Error('Unexpected collection '+kind);
      }};
    }};
  },runTransaction:async fn=>fn({
    get:async ref=>ref.get(),
    set:(ref,value)=>{
      const map={attempt:attempts,receipt:receipts,user:users}[ref.kind];
      map.set(ref.id,structuredClone(value));writes++;
    }
  })};
  const invoke=async(body=payload(),{principal=actor,key='qa-void-one',projectId=scope.projectId}={})=>{
    const req=Readable.from([JSON.stringify(body)]);req.method='POST';req.headers={'idempotency-key':key};
    let response=null;
    await maybeHandleCertificationRuntimeRequest(req,{},new URL('https://dev.test/api/tenants/tya/projects/'+projectId+'/certifications/void-test-attempt'),{
      ensureAdmin:()=>({db}),verifyPrincipal:async()=>principal,
      sendJson:(_res,httpStatus,body)=>{response={httpStatus,...body};}
    });
    return response;
  };
  return {attempts,receipts,users,invoke,get writes(){return writes;}};
}

test('I3 P0: exact staff Admin void creates an audited tombstone, never deletes history or other credentials',async()=>{
  const p=provider();
  assert.equal(certificationRouteScope('/api/tenants/tya/projects/cinepolis/certifications/void-test-attempt').action,'void-test-attempt');
  const result=await p.invoke();
  assert.equal(result.httpStatus,200);assert.equal(result.committed,true);
  assert.equal(result.providerAck,true);assert.equal(result.readbackVerified,true);
  assert.equal(result.attemptWrites,1);assert.equal(result.hrWrites,0);
  assert.equal(result.item.id,id);assert.equal(result.item.status,'voided_test');
  assert.equal(result.item.eligibilityGranted,false);assert.equal(result.item.currentCertification,false);
  assert.equal(result.item.pass,true,'original exam result retained for audit');
  assert.equal(result.item.answersHash,exact.answersHash,'answers provenance unchanged');
  assert.equal(result.item.voidedByUid,actor.uid);
  assert.equal(result.item.qaTestAttested,true);
  assert.equal(p.attempts.size,2,'no physical deletes');
  assert.deepEqual(p.attempts.get(other),legitimate,'other approved shopper untouched');
  assert.equal(p.receipts.size,1);assert.equal(p.writes,2);
});

test('I3 P0: exact replay is readback verified and does not write twice; a different key cannot rewrite the void',async()=>{
  const p=provider();
  const one=await p.invoke();
  const replay=await p.invoke();
  assert.equal(one.httpStatus,200);
  assert.equal(replay.httpStatus,200);assert.equal(replay.idempotentReplay,true);
  assert.equal(replay.providerWrites,0);assert.equal(p.writes,2);
  const otherKey=await p.invoke(payload(),{key:'different-key'});
  assert.equal(otherKey.httpStatus,409);
  assert.equal(otherKey.providerAck,false);assert.equal(p.writes,2);
});

test('I3 P0: Shopper, inactive membership, foreign projects and mismatched exact attempt all fail closed',async()=>{
  for(const scenario of ['shopper','inactive','wrong-project','wrong-shopper','wrong-created-at','wrong-bank']){
    const p=provider(),body=payload(),opts={};
    if(scenario==='shopper')opts.principal={uid:'shopper-uid',role:'shopper',namespace:'shopper',shopperId:exact.shopperId};
    if(scenario==='inactive')p.users.get(actor.uid).active=false;
    if(scenario==='wrong-project')p.users.get(actor.uid).projectIds=['other-project'];
    if(scenario==='wrong-shopper')body.shopperId='somebody-else';
    if(scenario==='wrong-created-at')body.expectedCreatedAt='2026-11-08T11:00:00.000Z';
    if(scenario==='wrong-bank')body.bankResourceId='different-bank';
    const res=await p.invoke(body,opts);
    assert.equal(res.committed,false,scenario);assert.equal(res.providerAck,false,scenario);
    assert.equal(p.writes,0,scenario);assert.deepEqual(p.attempts.get(id),exact,scenario);
  }
});

test('I3 P0: no implicit test classification, bulk operation or unchecked confirmation is accepted',async()=>{
  const bad=[{...payload(),confirmation:''},{...payload(),reason:'short'},
    {...payload(),attemptId:other},{...payload(),attemptIds:[id,other]},
    {...payload(),projectId:'another'}];
  for(const body of bad){
    const p=provider(),res=await p.invoke(body);
    assert.notEqual(res.httpStatus,200);
    assert.equal(res.providerAck,false);assert.equal(p.writes,0);
  }
});

test('I3 P0: a second operator cannot silently void an already voided test attempt',async()=>{
  const p=provider();assert.equal((await p.invoke()).httpStatus,200);
  const res=await p.invoke(payload(),{key:'another-operation'});
  assert.equal(res.httpStatus,409);assert.equal(res.providerAck,false);
  assert.equal(p.receipts.size,1);assert.equal(p.writes,2);
});
