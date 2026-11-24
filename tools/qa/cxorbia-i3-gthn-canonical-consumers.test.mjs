import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {visitsFromSnapshot,createOperationalCommandProvider} from '../../backend/runtime/cxorbia-operational-command-provider-v1.mjs';

const require=createRequire(import.meta.url),composer=require('../../app/adapters/tya-cumulative-read-model-v2.js');
const copy=x=>x===undefined?undefined:structuredClone(x),tenantId='qa-tenant',projectId='qa-project',periodId='qa-project-2026-11',hrRowId='NOVIEMBRE 26!2';
const visit=(country,extra={})=>({id:'canonical_'+country,visitId:'canonical_'+country,tenantId,projectId,rootProjectId:projectId,periodId,periodKey:'2026-11',hrRowId,sourceTab:'NOVIEMBRE 26',sourceRow:2,pais:country,country,excelWorksheetFingerprint:(country==='GT'?'a':'b').repeat(64),estado:'disponible',status:'disponible',canonicalFacets:{available:true,assigned:false},...extra});
const snapshot=(visits=[visit('GT'),visit('HN')])=>({sourceSafe:true,imported:false,firestoreWrites:0,tenantId,projectId,currentPeriodId:periodId,periods:[{id:periodId,key:'2026-11',tenantId,projectId}],visits,shoppers:[]});
const compose=(visits,protectedVisits=[],posts=[])=>composer.compose({hr:{...snapshot(visits),currentProjectId:projectId,projects:[{id:periodId,rootProjectId:projectId}],posts},protectedPayload:{visits:protectedVisits}});

test('F2 country rows sharing a worksheet coordinate retain their exact canonical IDs',()=>{
  const r=visitsFromSnapshot(snapshot());assert.deepEqual(r.visits.map(v=>v.id).sort(),['canonical_GT','canonical_HN']);
});
test('legacy non-Excel durable keys remain coordinate-based',()=>{
  const v=visit('GT');delete v.excelWorksheetFingerprint;
  assert.equal(visitsFromSnapshot(snapshot([v])).visits[0].id,hrRowId);
});
test('duplicate canonical Excel IDs are still rejected',()=>{
  assert.throws(()=>visitsFromSnapshot(snapshot([visit('GT'),visit('HN',{id:'canonical_GT',visitId:'canonical_GT'})])),/OPS_HR_DUPLICATE_VISIT_STABLE_KEY/);
});
test('a protected HN payment facet cannot enrich a GT row sharing its coordinate',()=>{
  const hn=visit('HN',{__docId:'canonical_HN',paymentConfirmed:true,canonicalFacets:{paymentConfirmed:true}});
  const r=compose([visit('GT'),visit('HN')],[hn]);
  assert.equal(r.diagnostics.duplicateVisitKeys,0);
  assert.notEqual(r.visits.find(v=>v.id==='canonical_GT').canonicalFacets.paymentConfirmed,true);
  assert.equal(r.visits.find(v=>v.id==='canonical_HN').canonicalFacets.paymentConfirmed,true);
});
test('exact canonical document with conflicting country cannot enrich the visit',()=>{
  const r=compose([visit('GT')],[visit('HN',{id:'canonical_GT',visitId:'canonical_GT',__docId:'canonical_GT',paymentConfirmed:true})]);
  assert.notEqual(r.visits[0].canonicalFacets.paymentConfirmed,true);
});
test('coordinate fallback requires matching Excel country and period',()=>{
  for(const change of [{pais:'HN',country:'HN'},{periodId:'qa-project-2026-10',periodKey:'2026-10'},{pais:undefined,country:undefined}]){
    const r=compose([visit('GT')],[visit('GT',{id:'old',visitId:'old',__docId:'old',paymentConfirmed:true,...change})]);
    assert.notEqual(r.visits[0].canonicalFacets.paymentConfirmed,true,JSON.stringify(change));
  }
});
test('a unique same-country same-period historical coordinate remains usable',()=>{
  const r=compose([visit('GT')],[visit('GT',{id:'old',visitId:'old',__docId:'old',paymentConfirmed:true})]);
  assert.equal(r.visits[0].canonicalFacets.paymentConfirmed,true);
});
test('ambiguous coordinate postulation remains pending rather than following HN assignment',()=>{
  const r=compose([visit('GT'),visit('HN',{shopperId:'hn-shopper',estado:'asignada',canonicalFacets:{assigned:true,available:false}})],[],[{id:'qa-post',periodId,projectId,hrRowId,shopperId:'gt-shopper',estado:'pendiente'}]);
  assert.notEqual(r.posts.find(x=>x.id==='qa-post')._archived,true);
});
test('canonical GT postulation uses GT availability even when HN shares its row',()=>{
  const r=compose([visit('GT'),visit('HN',{shopperId:'hn-shopper',estado:'asignada',canonicalFacets:{assigned:true,available:false}})],[],[{id:'qa-post',periodId,projectId,hrRowId,visitId:'canonical_GT',shopperId:'gt-shopper',estado:'pendiente'}]);
  assert.notEqual(r.posts.find(x=>x.id==='qa-post')._archived,true);
});

class Doc{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(n){return new Coll(this.db,this.path+'/'+n);}
  async get(){return this.db.snap(this);}
}
class Coll{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Doc(this.db,this.path+'/'+id);}}
class Db{
  constructor(){this.rows=new Map();}
  collection(n){return new Coll(this,n);}
  snap(ref){const value=this.rows.get(ref.path);return {id:ref.id,exists:value!==undefined,data:()=>copy(value)};}
  async runTransaction(fn){
    const writes=[],r=await fn({get:async ref=>this.snap(ref),create:(ref,v)=>{assert.equal(this.rows.has(ref.path),false);writes.push([ref,v,false]);},set:(ref,v,o)=>writes.push([ref,v,o?.merge||o?.mergeFields]),delete:ref=>writes.push([ref,undefined,false])});
    for(const [ref,v,merge] of writes){if(v===undefined)this.rows.delete(ref.path);else this.rows.set(ref.path,copy(merge?{...this.rows.get(ref.path),...v}:v));}return r;
  }
}
const visitPath=id=>'tenants/'+tenantId+'/projects/'+projectId+'/visits/'+id;
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:[tenantId],allowedProjectIds:[projectId],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
function providerFixture(hr=snapshot()){
  const db=new Db(),actor={uid:'qa-admin',tenantId,role:'admin',authNamespace:'staff',projectIds:[projectId]};
  db.rows.set('tenants/'+tenantId+'/users/'+actor.uid,{...actor,active:true});
  return {db,provider:createOperationalCommandProvider({db,auth:{verifyIdToken:async()=>actor},policy,hrSnapshot:hr,hrRevision:'d'.repeat(64)})};
}
test('reconciliation preserves an existing F2 canonical document and its payment fields',async()=>{
  const f=providerFixture();f.db.rows.set(visitPath('canonical_GT'),visit('GT',{version:4,paymentConfirmed:true,sourceTab:'OLD',sourceRow:77,hrRowId:'OLD!77'}));
  const r=await f.provider.reconcileSnapshot(snapshot([visit('GT')]),{sourceRevision:'d'.repeat(64)});
  assert.equal(r.ok,true);assert.equal(r.createdVisits,0);assert.equal(f.db.rows.get(visitPath('canonical_GT')).paymentConfirmed,true);
  assert.equal(f.db.rows.get(visitPath('canonical_GT')).hrRowId,hrRowId);assert.equal(f.db.rows.has(visitPath(hrRowId)),false);
});
test('reconciliation rejects an explicit country or period contradiction without writes',async()=>{
  for(const patch of [{pais:'HN',country:'HN'},{periodId:'qa-project-2026-10'}]){
    const f=providerFixture();f.db.rows.set(visitPath('canonical_GT'),visit('GT',patch));const before=copy([...f.db.rows]);
    await assert.rejects(f.provider.reconcileSnapshot(snapshot([visit('GT')]),{sourceRevision:'d'.repeat(64)}),/OPS_VISIT_DURABLE_SCOPE_CONFLICT/);assert.deepEqual([...f.db.rows],before);
  }
});
const command=(extra={})=>({version:'cxorbia-command-adapter-v1',commandType:'visit.assign',entityType:'visit',entityId:'canonical_GT',tenantId,projectId,periodId,idempotencyKey:'qa-gthn-assign',expectedVersion:1,authorization:{providerEnforcementRequired:true},payload:{visitId:'canonical_GT',hrRowId,shopperId:'qa-shopper'},...extra});
test('assignment resolves canonical doc before a same-coordinate HN document',async()=>{
  const f=providerFixture();f.db.rows.set(visitPath('canonical_GT'),visit('GT',{version:1}));f.db.rows.set(visitPath(hrRowId),visit('HN',{id:hrRowId,visitId:hrRowId,version:1}));
  const before=copy(f.db.rows.get(visitPath(hrRowId))),r=await f.provider.execute('verified',command());
  assert.equal(r.ok,true,JSON.stringify(r));assert.equal(f.db.rows.get(visitPath('canonical_GT')).shopperId,'qa-shopper');assert.deepEqual(f.db.rows.get(visitPath(hrRowId)),before);
});
test('unproven row fallback cannot assign a different canonical visit',async()=>{
  const f=providerFixture();f.db.rows.set(visitPath(hrRowId),visit('HN',{id:hrRowId,visitId:hrRowId,version:1}));const before=copy([...f.db.rows]);
  const r=await f.provider.execute('verified',command());assert.equal(r.ok,false);assert.deepEqual([...f.db.rows],before);
});
test('legacy durable row with an explicit logical alias remains assignable',async()=>{
  const f=providerFixture(null);f.db.rows.set(visitPath(hrRowId),visit('GT',{id:'canonical_GT',visitId:'canonical_GT',version:1}));
  const r=await f.provider.execute('verified',command());assert.equal(r.ok,true,JSON.stringify(r));assert.equal(f.db.rows.get(visitPath(hrRowId)).shopperId,'qa-shopper');
});

function bridgeFixture({reply=()=>({ok:true,status:200,json:async()=>snapshot()}),validateError=null}={}){
  const source=fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8'),from=source.indexOf('function visitKey('),to=source.indexOf('function sessionProfile(',from);
  let requests=0,sleeps=0,time=1000;const user={uid:'qa-user',getIdTokenResult:async()=>({token:'fixture-only',claims:{role:'admin',tenantId,projectIds:[projectId]}})};
  const scope={tenantId,projectId},env={URLSearchParams,Map,Set,Date:class extends Date{static now(){return time;}},
    str:v=>String(v??'').trim(),arr:v=>Array.isArray(v)?v:[],clone:copy,sleep:async()=>{sleeps++;},HR_MAX_ATTEMPTS:6,
    endpointFor:()=>'/fixture',context:()=>({}),resolveScope:()=>scope,authorized:()=>true,depsReady:()=>true,operationalSource:()=>({mode:'external'}),
    firebase:{auth:()=>({currentUser:user})},fetch:async()=>reply(++requests)};
  env.window=env;vm.createContext(env);
  vm.runInContext('let hrPrefetch=null;\n'+source.slice(from,to)+'\nthis.qa={fetchHr,primeHrPrefetch,consumeHrPrefetch,validateSnapshot,visitKey,prefetchResult:()=>hrPrefetch.promise};',env);
  if(validateError)vm.runInContext('validateSnapshot=()=>{throw new Error('+JSON.stringify(validateError)+');};',env);
  return {qa:env.qa,scope,user,clock:t=>{time=t;},stats:()=>({requests,sleeps})};
}
test('bridge validates distinct canonical GT/HN IDs despite equal row coordinates',()=>{
  const f=bridgeFixture();assert.equal(f.qa.validateSnapshot(snapshot(),f.scope).uniqueVisitKeys,2);
});
test('deterministic mapping failure performs one read and no retry, including prefetch',async()=>{
  const f=bridgeFixture({validateError:'HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS'});f.qa.primeHrPrefetch();
  await assert.rejects(f.qa.consumeHrPrefetch(f.scope),/HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS/);assert.deepEqual(f.stats(),{requests:1,sleeps:0});
});
test('a slow in-flight same-session prefetch is joined instead of duplicated',async()=>{
  let done;const pending=new Promise(r=>{done=r;}),f=bridgeFixture({reply:()=>pending});f.qa.primeHrPrefetch();await Promise.resolve();
  f.clock(31000);const consumed=f.qa.consumeHrPrefetch(f.scope);done({ok:true,status:200,json:async()=>snapshot()});await consumed;assert.equal(f.stats().requests,1);
});
test('transient HTTP503 retries once and succeeds, HTTP401 never retries',async()=>{
  const f=bridgeFixture({reply:n=>n===1?{ok:false,status:503,json:async()=>({})}:{ok:true,status:200,json:async()=>snapshot()}});
  await f.qa.fetchHr(f.scope);assert.deepEqual(f.stats(),{requests:2,sleeps:1});
  const auth=bridgeFixture({reply:()=>({ok:false,status:401,json:async()=>({})})});await assert.rejects(auth.qa.fetchHr(auth.scope),/HTTP_401/);assert.deepEqual(auth.stats(),{requests:1,sleeps:0});
});
test('actual network transport failure may retry without retrying Auth errors',async()=>{
  const f=bridgeFixture({reply:n=>{if(n===1)throw new TypeError('Failed to fetch');return {ok:true,status:200,json:async()=>snapshot()};}});await f.qa.fetchHr(f.scope);assert.deepEqual(f.stats(),{requests:2,sleeps:1});
  const denied=bridgeFixture();denied.user.getIdTokenResult=async()=>{throw new Error('auth/network-request-failed');};await assert.rejects(denied.qa.fetchHr(denied.scope),/auth\/network/);assert.deepEqual(denied.stats(),{requests:0,sleeps:0});
});


test('missing visit identity remains a contract failure',()=>{
  assert.equal(composer.visitKey({periodId}), '');
  const f=bridgeFixture();assert.throws(()=>f.qa.validateSnapshot(snapshot([{periodId,periodKey:'2026-11'}]),f.scope),/DUPLICATE_OR_MISSING_VISIT_KEYS/);
});
test('a coordinate-only post without country cannot follow a single opposite-country Excel row',()=>{
  const r=compose([visit('HN',{shopperId:'hn-shopper',estado:'asignada',canonicalFacets:{assigned:true,available:false}})],[],[{id:'qa-post',periodId,projectId,hrRowId,visitId:'missing_GT',shopperId:'gt-shopper',estado:'pendiente'}]);
  assert.notEqual(r.posts.find(x=>x.id==='qa-post')._archived,true);
});
test('a completed stale prefetch performs exactly one fresh read',async()=>{
  const f=bridgeFixture();f.qa.primeHrPrefetch();await f.qa.prefetchResult();f.clock(20000);await f.qa.consumeHrPrefetch(f.scope);assert.equal(f.stats().requests,2);
});
test('a changed principal never consumes the previous principal prefetch',async()=>{
  const f=bridgeFixture();f.qa.primeHrPrefetch();await f.qa.prefetchResult();f.user.uid='second-user';const r=await f.qa.consumeHrPrefetch(f.scope);assert.equal(f.stats().requests,2);assert.equal(r.claims.uid,'second-user');
});
test('exact GT reflection remains distinct when HN shares the physical coordinate',async()=>{
  const hr=snapshot([visit('GT',{shopperId:'qa-shopper'}),visit('HN',{shopperId:'hn-shopper'})]),f=providerFixture(hr);
  f.db.rows.set(visitPath('canonical_GT'),visit('GT',{shopperId:'qa-shopper',version:1}));
  const c=command({commandType:'visit.sync.confirm',authorization:{providerEnforcementRequired:true,permission:'visit.sync.confirm'},payload:{visitId:'canonical_GT',hrRowId,hrShopperId:'qa-shopper'}});
  const r=await f.provider.execute('verified',c);assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.hrReflection.hrVisitId,'canonical_GT');assert.equal(r.hrProviderAck,false);
});
