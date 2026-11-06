import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {maybeHandleCertificationRuntimeRequest} from '../certification-runtime.mjs';

const tenantId='tenant-example',projectId='project-example';
const previousPeriod=projectId+'-2027-01',nextPeriod=projectId+'-2027-02';
const fresh=()=>({origin:'runtime_refresh',revision:'fresh-external-hr-revision',loadedAt:Date.now(),
 snapshot:{tenantId,projectId,sourceSafe:true,imported:false,periods:[{key:'2027-02'},{key:'campana-Q3'}]}});
function fixture({metadata={},current=fresh(),readError=null,state='published'}={}){
 const attempts=new Map();let writes=0,reads=0;
 const resource={tenantId,projectId,periodId:previousPeriod,status:'active',resourceType:'certification_bank',
  tipo:'certification_bank',visibleRoles:['shopper'],bank:{estado:state,contentRevision:'bank-immutable-rev',gate:80,
   preguntas:[{q:'Synthetic question',ops:['A','B'],correcta:'B',exp:'Synthetic feedback'}]}};
 const db={collection:name=>{assert.equal(name,'tenants');return {doc:tenant=>{
  assert.equal(tenant,tenantId);return {collection:collection=>{
   if(collection==='resources')return {doc:id=>({get:async()=>({id,exists:id==='original-bank',data:()=>resource})})};
   assert.equal(collection,'projects');return {doc:project=>{assert.equal(project,projectId);return {collection:sub=>{
    if(sub==='periods')return {doc:id=>({get:async()=>({id,exists:Object.hasOwn(metadata,id),data:()=>metadata[id]})})};
    if(sub==='certifications')return {doc:id=>({id})};
    assert.equal(sub,'certificationRecertifications');return {get:async()=>({docs:[]})};
   }}}};
  }};
 }};},runTransaction:async fn=>fn({get:async ref=>({id:ref.id,exists:attempts.has(ref.id),data:()=>attempts.get(ref.id)}),
  create:(ref,item)=>{assert.equal(attempts.has(ref.id),false);attempts.set(ref.id,structuredClone(item));writes++;}})};
 const invoke=async({periodId=nextPeriod,action='attempt',key='same-attempt',...extra}={})=>{
  const req=Readable.from([JSON.stringify({periodId,bankResourceId:'original-bank',answers:['B'],...extra})]);
  req.method='POST';req.headers={'idempotency-key':key};let result;
  await maybeHandleCertificationRuntimeRequest(req,{},new URL(`https://dev.example/api/tenants/${tenantId}/projects/${projectId}/certifications/${action}`),{
   ensureAdmin:()=>({db}),verifyPrincipal:async()=>({uid:'synthetic-user',role:'shopper',namespace:'shopper',shopperId:'shopper-example'}),
   currentSourceRevision:()=> 'revision-before-possible-refresh',
   readCurrentSnapshot:async()=>{reads++;if(readError)throw new Error(readError);return current;},
   sendJson:(_res,httpStatus,payload)=>{result={httpStatus,...payload};}
  });return result;
 };
 return {invoke,attempts,resource,get writes(){return writes;},get reads(){return reads;}};
}

test('VRM313: current HR period without metadata grants exact attempt ACK and idempotent replay',async()=>{
 const p=fixture();const first=await p.invoke();
 assert.equal(first.httpStatus,200);assert.equal(first.providerAck,true);assert.equal(first.pass,true);
 assert.equal(first.item.periodId,nextPeriod);assert.equal(first.item.bankPeriodId,previousPeriod);
 assert.equal(first.item.bankResourceId,'original-bank');assert.equal(first.item.sourceRevision,'fresh-external-hr-revision');
 assert.equal(first.item.feedback.length,1);assert.equal(first.item.contentRevision,'bank-immutable-rev');
 const replay=await p.invoke();assert.equal(replay.item.id,first.item.id);assert.equal(replay.providerWrites,0);
 assert.equal(replay.idempotentReplay,true);assert.equal(p.writes,1);assert.equal(p.attempts.size,1);
 assert.equal(p.resource.periodId,previousPeriod);
});
test('VRM313: exact monthly alias and operational nonmonthly key are supported generically',async()=>{
 for(const periodId of ['2027-02',projectId+'-campana-Q3']){
  const p=fixture();const r=await p.invoke({periodId});assert.equal(r.httpStatus,200);assert.equal(r.item.periodId,periodId);
  assert.equal(r.item.bankPeriodId,previousPeriod);assert.equal(p.writes,1);
 }
});
test('VRM313: unknown period and fuzzy/non-prefixed campaign aliases never authorize a write',async()=>{
 for(const periodId of [projectId+'-2027-03','campana-Q3','2027-2','another-project-2027-02']){
  const p=fixture();const r=await p.invoke({periodId,snapshot:fresh().snapshot});
  assert.equal(r.httpStatus,400);assert.equal(r.code,'CERT_EXECUTION_PERIOD_REQUIRED');assert.equal(p.writes,0);
 }
});
test('VRM313: bootstrap, unsafe, imported, missing revision and failed HR reads fail closed',async()=>{
 const samples=[{...fresh(),origin:'build_bootstrap'},{...fresh(),revision:''},
  {...fresh(),snapshot:{...fresh().snapshot,sourceSafe:false}},
  {...fresh(),snapshot:{...fresh().snapshot,imported:true}},null];
 for(const current of samples){const p=fixture({current});const r=await p.invoke();
  assert.equal(r.code,'CERT_EXECUTION_PERIOD_AUTHORITY_REQUIRED');assert.equal(p.writes,0);}
 const p=fixture({readError:'HR_PROVIDER_UNAVAILABLE'});const r=await p.invoke();
 assert.equal(r.httpStatus,500);assert.equal(r.providerAck,false);assert.equal(p.writes,0);
});
test('VRM313: HR scope mismatch or duplicate period is rejected before persistence',async()=>{
 for(const changed of [{tenantId:'foreign'},{projectId:'foreign'},
  {periods:[{key:'2027-02',projectId:'foreign'}]},
  {periods:[{key:'2027-02',tenantId:'foreign'}]},
  {periods:[{key:'2027-02'},{key:'2027-02'}]}]){
  const p=fixture({current:{...fresh(),snapshot:{...fresh().snapshot,...changed}}});const r=await p.invoke();
  assert.equal(r.code,'CERT_EXECUTION_PERIOD_SCOPE_MISMATCH');assert.equal(p.writes,0);
 }
});
test('VRM313: exact optional metadata still works and invalid/ambiguous metadata cannot fall back',async()=>{
 const good={tenantId,projectId,periodId:nextPeriod};
 const p=fixture({metadata:{[nextPeriod]:good},readError:'MUST_NOT_READ_HR'});assert.equal((await p.invoke()).httpStatus,200);assert.equal(p.reads,0);
 for(const metadata of [{[nextPeriod]:good,'2027-02':good},{[nextPeriod]:{...good,projectId:'foreign'}},
  {[nextPeriod]:{...good,periodId:previousPeriod}}]){
  const invalid=fixture({metadata});const r=await invalid.invoke();
  assert.equal(r.code,'CERT_EXECUTION_PERIOD_SCOPE_MISMATCH');assert.equal(invalid.reads,0);assert.equal(invalid.writes,0);
 }
});
test('VRM313: approved practice in a current HR period stays read-only and grants no certification',async()=>{
 const p=fixture({state:'approved_preview'});const r=await p.invoke({action:'practice'});
 assert.equal(r.httpStatus,200);assert.equal(r.preview,true);assert.equal(r.pass,true);
 assert.equal(r.committed,false);assert.equal(r.providerWrites,0);assert.equal(p.writes,0);assert.equal(p.attempts.size,0);
 assert.equal((await p.invoke()).code,'CERT_BANK_NOT_PUBLISHED');assert.equal(p.writes,0);
});
