import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  createOperationalCommandProvider
} from '../../cxorbia-operational-command-provider-v1.mjs';

const require=createRequire(import.meta.url);
const composer=require('../../../../app/adapters/tya-cumulative-read-model-v2.js');
const repoRoot=fileURLToPath(new URL('../../../../',import.meta.url));
const clone=value=>value===undefined?undefined:structuredClone(value);

class Snapshot{
  constructor(id,value){this.id=id;this._value=value;this.exists=value!==undefined;}
  data(){return clone(this._value);}
}
class DocRef{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(name){return new CollectionRef(this.db,`${this.path}/${name}`);}
  async get(){return new Snapshot(this.id,this.db._store.get(this.path));}
}
class Query{
  constructor(db,path,field,value,cap=Infinity){this.db=db;this.path=path;this.field=field;this.value=value;this.cap=cap;}
  limit(n){return new Query(this.db,this.path,this.field,this.value,n);}
  async get(){
    const prefix=`${this.path}/`,depth=this.path.split('/').length+1,docs=[];
    for(const [path,value] of this.db._store){
      if(!path.startsWith(prefix)||path.split('/').length!==depth)continue;
      if(value?.[this.field]===this.value)docs.push(new Snapshot(path.split('/').at(-1),value));
      if(docs.length>=this.cap)break;
    }
    return {size:docs.length,docs};
  }
}
class CollectionRef{
  constructor(db,path){this.db=db;this.path=path;}
  doc(id){return new DocRef(this.db,`${this.path}/${id}`);}
  where(field,op,value){assert.equal(op,'==');return new Query(this.db,this.path,field,value);}
}
class FakeFirestore{
  constructor(){this._store=new Map();}
  collection(name){return new CollectionRef(this,name);}
  _set(path,value,options={},store=this._store){
    const prior=store.get(path);
    store.set(path,options?.merge&&prior?{...clone(prior),...clone(value)}:clone(value));
  }
  async runTransaction(fn){
    const working=new Map([...this._store].map(([k,v])=>[k,clone(v)]));
    const tx={
      get:async ref=>new Snapshot(ref.id,working.get(ref.path)),
      create:(ref,value)=>{if(working.has(ref.path))throw new Error('ALREADY_EXISTS');this._set(ref.path,value,{merge:false},working);},
      set:(ref,value,options={})=>this._set(ref.path,value,options,working),
      delete:ref=>working.delete(ref.path)
    };
    const result=await fn(tx);
    this._store=working;
    return result;
  }
  get(path){return clone(this._store.get(path));}
  seed(path,value){this._store.set(path,clone(value));}
  paths(){return [...this._store.keys()].sort();}
}
class FakeAuth{
  async verifyIdToken(){return {uid:'admin-1',tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']};}
}

const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
const provider=(db)=>createOperationalCommandProvider({auth:new FakeAuth(),db,policy});
const visitPath=id=>`tenants/tenant-a/projects/project-a/visits/${id}`;
const receiptPaths=db=>db.paths().filter(p=>p.includes('/commandReceipts/'));
const auditPaths=db=>db.paths().filter(p=>p.includes('/entityAuditTrail/'));
const hrSnapshot=()=>({
  sourceSafe:true,
  imported:false,
  firestoreWrites:0,
  tenantId:'tenant-a',
  projectId:'project-a',
  currentPeriodId:'period-a',
  visits:[{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'period-a',periodId:'period-a',hrRowId:'HR!2',sourceTab:'HR',sourceRow:2,estado:'disponible',status:'disponible',sucursal:'HR Sucursal',ciudad:'Ciudad',pais:'GT',canonicalFacets:{available:true,assigned:false}}]
});

test('Gate 7 / visit HR reconciliation creates durable visits idempotently by revision',async()=>{
  const db=new FakeFirestore();
  const first=await provider(db).reconcileSnapshot(hrSnapshot(),{sourceRevision:'hr-rev-1'});
  assert.equal(first.ok,true);
  assert.equal(first.visitCount,1);
  assert.equal(first.createdVisits,1);
  assert.equal(first.providerWrites,1);
  assert.equal(db.get(visitPath('visit-a')).hrRowId,'HR!2');
  assert.equal(db.get(visitPath('visit-a')).periodId,'period-a');

  const before=db.paths();
  const replay=await provider(db).reconcileSnapshot(hrSnapshot(),{sourceRevision:'hr-rev-1'});
  assert.equal(replay.createdVisits,0);
  assert.equal(replay.idempotentReplays,1);
  assert.equal(replay.providerWrites,0);
  assert.deepEqual(db.paths(),before);
});

test('Gate 7 / HR reconciliation updates durable operational state across revisions and repairs stale same-revision rows',async()=>{
  const db=new FakeFirestore();
  await provider(db).reconcileSnapshot(hrSnapshot(),{sourceRevision:'hr-rev-1'});
  const assigned=hrSnapshot();
  assigned.visits[0]={...assigned.visits[0],estado:'asignada',status:'asignada',shopperId:'shopper-hr',canonicalFacets:{available:false,assigned:true}};
  const second=await provider(db).reconcileSnapshot(assigned,{sourceRevision:'hr-rev-2'});
  assert.equal(second.providerWrites,1);
  assert.equal(db.get(visitPath('visit-a')).estado,'asignada');
  assert.equal(db.get(visitPath('visit-a')).shopperId,'shopper-hr');
  assert.equal(db.get(visitPath('visit-a')).assignmentSource,'hr');
  assert.equal(db.get(visitPath('visit-a')).assignmentSyncStatus,'synced');
  assert.equal(db.get(visitPath('visit-a')).canonicalFacets.available,false);

  const available=hrSnapshot();
  const third=await provider(db).reconcileSnapshot(available,{sourceRevision:'hr-rev-3'});
  assert.equal(third.providerWrites,1);
  assert.equal(db.get(visitPath('visit-a')).estado,'disponible');
  assert.equal(db.get(visitPath('visit-a')).shopperId,null);
  assert.equal(db.get(visitPath('visit-a')).assignmentSource,null);
  assert.equal(db.get(visitPath('visit-a')).assignmentSyncStatus,null);
  assert.equal(db.get(visitPath('visit-a')).canonicalFacets.available,true);

  db.seed(visitPath('visit-a'),{...db.get(visitPath('visit-a')),estado:'realizada',status:'realizada',shopperId:'shopper-stale',assignmentSource:'hr',assignmentSyncStatus:'synced'});
  const repaired=await provider(db).reconcileSnapshot(available,{sourceRevision:'hr-rev-3'});
  assert.equal(repaired.providerWrites,1);
  assert.equal(db.get(visitPath('visit-a')).estado,'disponible');
  assert.equal(db.get(visitPath('visit-a')).shopperId,null);
});

test('Gate 7 / HR reconciliation preserves platform-pending assignment until HR reflects or conflicts',async()=>{
  const db=new FakeFirestore();
  db.seed(visitPath('visit-a'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:'asignada',status:'asignada',shopperId:'shopper-platform',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',version:4});
  const waiting=await provider(db).reconcileSnapshot(hrSnapshot(),{sourceRevision:'hr-rev-wait'});
  assert.equal(waiting.providerWrites,1);
  assert.equal(db.get(visitPath('visit-a')).shopperId,'shopper-platform');
  assert.equal(db.get(visitPath('visit-a')).assignmentSource,'platform');
  assert.equal(db.get(visitPath('visit-a')).assignmentSyncStatus,'pending_hr');

  const reflected=hrSnapshot();
  reflected.visits[0]={...reflected.visits[0],estado:'asignada',status:'asignada',shopperId:'shopper-platform',canonicalFacets:{available:false,assigned:true}};
  const synced=await provider(db).reconcileSnapshot(reflected,{sourceRevision:'hr-rev-synced'});
  assert.equal(synced.providerWrites,1);
  assert.equal(db.get(visitPath('visit-a')).shopperId,'shopper-platform');
  assert.equal(db.get(visitPath('visit-a')).assignmentSource,'platform');
  assert.equal(db.get(visitPath('visit-a')).assignmentSyncStatus,'synced');
});

test('Gate 7 / composer overlays durable platform pending assignment without taking HR-managed fields',()=>{
  const result=composer.compose({
    hr:{projects:[],visits:[{id:'visit-a',visitId:'visit-a',projectId:'period-a',periodId:'period-a',hrRowId:'HR!2',estado:'disponible',sucursal:'HR Fresh',shopperId:''}],shoppers:[{id:'shopper-a',shopperId:'shopper-a',nombre:'Shopper A'}],posts:[],currentProjectId:'project-a',currentPeriodId:'period-a'},
    protectedPayload:{visits:[{id:'visit-a',visitId:'visit-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',shopperId:'shopper-a',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,canonicalFacets:{assigned:true,available:false}}],shoppers:[],posts:[]}
  });
  const visit=result.visits[0];
  assert.equal(result.diagnostics.duplicateVisitKeys,0);
  assert.equal(result.diagnostics.pendingPlatformAssignmentOverlays,1);
  assert.equal(visit.shopperId,'shopper-a');
  assert.equal(visit.sucursal,'HR Fresh');
  assert.equal(visit.canonicalFacets.available,false);
  assert.equal(visit.canonicalFacets.assigned,true);
  assert.equal(result.visits.filter(v=>v.shopperId==='shopper-a').length,1);
});

test('Gate 7 / composer marks HR versus durable shopper conflict without silent overwrite',()=>{
  const result=composer.compose({
    hr:{projects:[],visits:[{id:'visit-a',visitId:'visit-a',projectId:'period-a',periodId:'period-a',hrRowId:'HR!2',estado:'asignada',shopperId:'shopper-hr'}],shoppers:[{id:'shopper-hr',shopperId:'shopper-hr',nombre:'HR Shopper'},{id:'shopper-durable',shopperId:'shopper-durable',nombre:'Durable Shopper'}],posts:[],currentProjectId:'project-a',currentPeriodId:'period-a'},
    protectedPayload:{visits:[{id:'visit-a',visitId:'visit-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',shopperId:'shopper-durable',assignmentSource:'platform',assignmentSyncStatus:'pending_hr'}],shoppers:[],posts:[]}
  });
  assert.equal(result.visits[0].shopperId,'shopper-hr');
  assert.equal(result.visits[0].assignmentReviewRequired,true);
  assert.equal(result.diagnostics.assignmentConflicts.length,1);
});

test('Gate 7 / visit.assign requires provider ACK and replays idempotently',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('visit-a'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:'disponible',status:'disponible'});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.assign',entityType:'visit',entityId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:'source-current',idempotencyKey:'gate7-assign-idempotent',payload:{visitId:'visit-a',hrRowId:'HR!2',shopperId:'shopper-a',assignmentSource:'platform'},authorization:{providerEnforcementRequired:true}};
  const first=await provider(db).execute('token',command);
  assert.equal(first.ok,true);
  assert.equal(first.status,'committed');
  assert.equal(first.providerAck,true);
  assert.equal(first.successUiAllowed,true);
  assert.equal(db.get(visitPath('visit-a')).shopperId,'shopper-a');
  assert.equal(db.get(visitPath('visit-a')).assignmentSource,'platform');
  assert.equal(db.get(visitPath('visit-a')).assignmentSyncStatus,'pending_hr');
  assert.equal(receiptPaths(db).length,1);
  assert.equal(auditPaths(db).length,1);

  const replay=await provider(db).execute('token',command);
  assert.equal(replay.ok,true);
  assert.equal(replay.idempotentReplay,true);
  assert.equal(replay.providerWrites,0);
  assert.equal(receiptPaths(db).length,1);
  assert.equal(auditPaths(db).length,1);
});

test('Gate 7 / visit.assign rejects a durable visit that is no longer HR-available',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('visit-a'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:'realizada',status:'realizada'});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.assign',entityType:'visit',entityId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:'source-current',idempotencyKey:'gate7-assign-stale',payload:{visitId:'visit-a',hrRowId:'HR!2',shopperId:'shopper-a',assignmentSource:'platform'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);
  assert.equal(result.ok,false);
  assert.equal(result.code,'OPS_VISIT_NOT_AVAILABLE');
  assert.equal(receiptPaths(db).length,0);
  assert.equal(auditPaths(db).length,0);
  assert.equal(db.get(visitPath('visit-a')).shopperId,undefined);
});

test('Gate 7 / visitas UI does not declare assignment success before ACK',()=>{
  const source=fs.readFileSync(path.join(repoRoot,'app/modules/visitas.js'),'utf8');
  assert.match(source,/await\s+data\.assignVisit\([^;]+ackAware\s*:\s*true/);
  assert.match(source,/commandSucceeded\(result\)/);
  assert.doesNotMatch(source,/data\.assignVisit\(v\.id,b\.dataset\.id\);\s*close\(\);\s*ui\.toast\('Visita asignada/);
  assert.doesNotMatch(source,/data\.assignVisit\(v\.id,s\.id\);\s*close\(\);\s*ui\.toast\('Shopper creado y visita asignada/);
});

test('Gate 7 / unmatched platform-only shopper profiles stay review-only until exact HR crosswalk exists',()=>{
  const result=composer.compose({
    hr:{
      projects:[{id:'period-a',projectId:'project-a',countries:['GT','HN']}],
      visits:[],shoppers:[],posts:[],
      currentProjectId:'project-a',currentPeriodId:'period-a',sourceRevision:'hr-rev-platform-profile'
    },
    protectedPayload:{
      visits:[],
      shoppers:[
        {id:'shopper-platform-a',shopperId:'shopper-platform-a',tenantId:'tenant-a',projectIds:['project-a'],nombre:'Nora Plataforma',pais:'GT',country:'GT',whatsapp:'+50255550001',phone:'+50255550001',email:'nora@example.invalid',estado:'Activo',visibleLogin:'nora.plataforma'},
        {id:'shopper-platform-b',shopperId:'shopper-platform-b',tenantId:'tenant-a',projectIds:['project-b'],nombre:'Bruno Otro Proyecto',pais:'HN',country:'HN',whatsapp:'+50499990001',phone:'+50499990001',email:'bruno@example.invalid',estado:'Activo',visibleLogin:'bruno.otro'}
      ],
      posts:[],postulations:[],applications:[],certifications:[],liquidations:[]
    }
  });
  // PRE-I4 VRM-033: without an exact HR crosswalk neither profile may be promoted
  // into the normal operational shopper population. They remain review-only.
  assert.equal(result.shoppers.length,0);
  assert.equal(result.platformOnlyProfiles.length,2);
  assert.equal(result.diagnostics.platformOnlyProfilesPresented,0);
  assert.equal(result.diagnostics.unmatchedProfilesExcludedFromOperationalList,true);
  for(const id of ['shopper-platform-a','shopper-platform-b']){
    const review=result.platformOnlyProfiles.find(x=>x.id===id);
    assert.ok(review);
    assert.equal(review.presentedToAuthorizedStaff,false);
    assert.equal(review.reason,'no_exact_hr_crosswalk');
    assert.ok(result.identityReviewQueue.some(x=>x.id===id&&x.reason==='no_exact_hr_crosswalk'));
  }
});



test('PRE-I4 VRM-013 / canonical provider supports atomic reassignment with ACK and schedule decision',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('visit-r'),{id:'visit-r',visitId:'visit-r',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!8',estado:'agendada',status:'agendada',shopperId:'shopper-old',agendada:'2026-09-24',version:4,canonicalFacets:{available:false,assigned:true,scheduled:true}});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.reassign',entityType:'visit',entityId:'visit-r',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:4,idempotencyKey:'prei4-reassign-1',payload:{visitId:'visit-r',shopperId:'shopper-new',assignmentSource:'platform',scheduleDecision:'change',scheduledDate:'2026-09-25',franjaCode:'PM 14–18h'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);
  assert.equal(result.ok,true);assert.equal(result.providerAck,true);
  const row=db.get(visitPath('visit-r'));assert.equal(row.shopperId,'shopper-new');assert.equal(row.reassignedFromShopperId,'shopper-old');assert.equal(row.agendada,'2026-09-25');assert.equal(row.franjaCode,'PM 14–18h');assert.equal(row.assignmentSyncStatus,'pending_hr');
});

test('PRE-I4 VRM-013 / canonical provider reschedule decision is durable and idempotent',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('visit-s'),{id:'visit-s',visitId:'visit-s',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'asignada',status:'asignada',shopperId:'shopper-a',version:2});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.reschedule',entityType:'visit',entityId:'visit-s',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:2,idempotencyKey:'prei4-reschedule-1',payload:{visitId:'visit-s',newDate:'2026-09-26',decision:'approved',franjaCode:'AM 8–12h'},authorization:{providerEnforcementRequired:true}};
  const first=await provider(db).execute('token',command);assert.equal(first.providerAck,true);assert.equal(db.get(visitPath('visit-s')).agendada,'2026-09-26');
  const replay=await provider(db).execute('token',command);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
});

test('PRE-I4 VRM-013 / canonical provider cancel releases visit to availability only after ACK',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('visit-c'),{id:'visit-c',visitId:'visit-c',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'agendada',status:'agendada',shopperId:'shopper-a',shopper:'Shopper A',agendada:'2026-09-26',version:3,canonicalFacets:{available:false,assigned:true,scheduled:true}});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.cancel',entityType:'visit',entityId:'visit-c',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:3,idempotencyKey:'prei4-cancel-1',payload:{visitId:'visit-c',releaseToAvailable:true,reason:'admin_cancel_release'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);assert.equal(result.providerAck,true);
  const row=db.get(visitPath('visit-c'));assert.equal(row.estado,'disponible');assert.equal(row.shopperId,null);assert.equal(row.agendada,null);assert.equal(row.canonicalFacets.available,true);assert.equal(row.assignmentSyncStatus,'pending_hr');
});

test('PRE-I4 VRM-013 / Postulaciones has no local-first edit reassign cancel or reprogram success paths',()=>{
  const source=fs.readFileSync(path.join(repoRoot,'app/modules/postulaciones.js'),'utf8');
  assert.match(source,/requestVisitReschedule\(x\.visitaId/);
  assert.match(source,/assignVisit\(x\.visitaId,sel,\{ackAware:true,reassign:true/);
  assert.match(source,/requestVisitCancel\(x\.visitaId,\{ackAware:true,releaseToAvailable:true/);
  assert.doesNotMatch(source,/Asignación actualizada en memoria/);
  assert.doesNotMatch(source,/data\.assignVisit&&data\.assignVisit\(x\.visitaId,sel\)/);
  assert.doesNotMatch(source,/v\.estado='disponible';v\.shopperId=null/);
});
