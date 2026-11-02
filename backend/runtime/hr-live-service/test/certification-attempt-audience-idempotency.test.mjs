import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {maybeHandleCertificationRuntimeRequest} from '../certification-runtime.mjs';

const scope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-10'};
const shopper={uid:'qa-readonly',role:'shopper',namespace:'shopper',shopperId:'isolated-memory-shopper'};
const question=(n)=>({q:'Pregunta QA '+n,ops:['A','B','C','D'],
  correcta:'A',exp:'Respuesta QA',fuente:'Fuente sintética'});
const bank=(id,more={})=>({id,tenantId:scope.tenantId,projectId:scope.projectId,
  periodId:scope.periodId,status:'active',resourceType:'certification_bank',
  tipo:'certification_bank',visibleRoles:['shopper'],targetAll:false,
  bank:{estado:'published',contentRevision:'qa-revision-v1',gate:80,
    preguntas:[question(1),question(2)]},...more});

function memoryProvider(rows) {
  const resources=new Map(rows.map(x=>[x.id,x])),attempts=new Map();
  let creates=0;
  const db={
    collection:name=>{
      assert.equal(name,'tenants');
      return {doc:tenant=>{
        assert.equal(tenant,scope.tenantId);
        return {collection:kind=>{
          if(kind==='resources')return {doc:id=>({get:async()=>({
            exists:resources.has(id),id,data:()=>resources.get(id)})})};
          if(kind==='projects')return {doc:project=>{
            assert.equal(project,scope.projectId);
            return {collection:sub=>{
              if(sub==='certificationRecertifications')return {get:async()=>({docs:[]})};
              if(sub==='certifications')return {doc:id=>({id})};
              throw new Error('Unexpected project collection '+sub);
            }};
          }};
          throw new Error('Unexpected tenant collection '+kind);
        }};
      }};
    },
    runTransaction:async fn=>fn({
      get:async ref=>({id:ref.id,exists:attempts.has(ref.id),
        data:()=>attempts.get(ref.id)}),
      create:(ref,item)=>{
        assert.equal(attempts.has(ref.id),false);
        attempts.set(ref.id,structuredClone(item));creates++;
      }
    })
  };
  const invoke=async(body,{principal=shopper,key='idem-qa-1'}={})=>{
    const req=Readable.from([JSON.stringify(body)]);req.method='POST';
    req.headers={'idempotency-key':key};let response=null;
    const handled=await maybeHandleCertificationRuntimeRequest(req,{},
      new URL('https://dev.example/api/tenants/tya/projects/cinepolis/certifications/attempt'),{
        ensureAdmin:()=>({db}),verifyPrincipal:async()=>principal,
        sendJson:(_res,httpStatus,payload)=>{response={httpStatus,...payload};},
        currentSourceRevision:()=> 'test-source'
      });
    assert.equal(handled,true);return response;
  };
  return {db,resources,attempts,invoke,get creates(){return creates;}};
}
const payload=(bankResourceId='published-qa',answers=['A','A'])=>({
  periodId:scope.periodId,bankResourceId,answers
});

test('D06 P0: first exact attempt has ACK; same idempotency key replays without a second write',async()=>{
  const p=memoryProvider([bank('published-qa')]);
  const first=await p.invoke(payload());
  assert.equal(first.httpStatus,200);assert.equal(first.committed,true);
  assert.equal(first.providerAck,true);assert.equal(first.providerWrites,1);
  assert.equal(first.score,100);assert.equal(first.pass,true);
  assert.equal(first.idempotentReplay,false);
  assert.equal(first.item.shopperId,shopper.shopperId);
  assert.equal(p.creates,1);assert.equal(p.attempts.size,1);
  const replay=await p.invoke(payload());
  assert.equal(replay.httpStatus,200);assert.equal(replay.idempotentReplay,true);
  assert.equal(replay.providerWrites,0);assert.equal(replay.score,first.score);
  assert.equal(replay.item.id,first.item.id);
  assert.equal(p.creates,1);assert.equal(p.attempts.size,1);
});

test('D06 P0: a reused idempotency key with different answers is HTTP 409 with zero new writes',async()=>{
  const p=memoryProvider([bank('published-qa')]);
  const first=await p.invoke(payload());
  const conflict=await p.invoke(payload('published-qa',['B','B']));
  assert.equal(first.httpStatus,200);assert.equal(conflict.httpStatus,409);
  assert.equal(conflict.code,'CERT_ATTEMPT_IDEMPOTENCY_REUSE');
  assert.equal(conflict.committed,false);assert.equal(conflict.providerAck,false);
  assert.equal(conflict.successUiAllowed,false);
  assert.equal(p.creates,1);assert.equal(p.attempts.size,1);
  const item=[...p.attempts.values()][0];
  assert.equal(item.score,100);assert.equal(item.pass,true);
});

test('D06 P0: a bank revision change cannot silently reuse a durable attempt score',async()=>{
  const p=memoryProvider([bank('published-qa')]);
  assert.equal((await p.invoke(payload())).httpStatus,200);
  const changed=bank('published-qa');
  changed.bank.contentRevision='qa-revision-v2';
  p.resources.set('published-qa',changed);
  const conflict=await p.invoke(payload());
  assert.equal(conflict.httpStatus,409);
  assert.equal(conflict.code,'CERT_ATTEMPT_IDEMPOTENCY_REUSE');
  assert.equal(p.creates,1);
});

test('D06 P0: an Admin-only published or disposable QA-only bank cannot create a Shopper attempt',async()=>{
  const hidden=bank('admin-only',{visibleRoles:[],targetAll:false});
  const disposable=bank('qa-disposable',{qaOnly:true,targetAll:true});
  const p=memoryProvider([hidden,disposable]);
  for(const id of ['admin-only','qa-disposable']){
    const res=await p.invoke(payload(id),{key:'attempt-'+id});
    assert.equal(res.httpStatus,400);assert.equal(res.code,'CERT_BANK_AUDIENCE_MISMATCH');
    assert.equal(res.committed,false);assert.equal(res.providerAck,false);
  }
  assert.equal(p.creates,0);
});

test('D06 P0: incomplete answers, unpublished and cross-period banks fail closed',async()=>{
  const pending=bank('pending',{bank:{...bank('x').bank,estado:'pending_review'}});
  const otherPeriod=bank('other-period',{periodId:'cinepolis-2026-09'});
  const p=memoryProvider([bank('published-qa'),pending,otherPeriod]);
  assert.equal((await p.invoke(payload('published-qa',['A']))).httpStatus,400);
  assert.equal((await p.invoke(payload('pending'))).httpStatus,400);
  assert.equal((await p.invoke(payload('other-period'))).httpStatus,400);
  assert.equal(p.creates,0);
});

test('D06 P0: only authenticated Shopper principals can write attempts',async()=>{
  const p=memoryProvider([bank('published-qa')]);
  const res=await p.invoke(payload(),{principal:{uid:'staff',role:'admin',shopperId:'untrusted'}});
  assert.equal(res.httpStatus,403);assert.equal(res.committed,false);
  assert.equal(p.creates,0);
});
