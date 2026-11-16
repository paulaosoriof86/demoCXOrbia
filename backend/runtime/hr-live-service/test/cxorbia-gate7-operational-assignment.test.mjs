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
  visits:[{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'period-a',periodId:'period-a',hrRowId:'HR!2',sourceTab:'HR',sourceRow:2,estado:'disponible',status:'disponible',sucursal:'HR Sucursal',ciudad:'Ciudad',pais:'GT',
    periodKey:'2026-09',disponibleDesde:null,availableFrom:null,availabilityState:'eligible_unassigned',availabilityDependency:null,
    shopper:null,shopperCode:null,hasShopper:false,canonicalState:'available',operationalState:'available',
    assignmentState:'unassigned',schedulingState:'not_applicable',executionState:'not_realized',questionnaireState:'not_available',submissionState:'not_submitted',
    agendada:null,controlDia:null,cuestFecha:null,realizada:null,submit:false,submittedAt:null,boleto:0,comboAmt:0,sourceSnapshotAt:null,reviewRequired:false,reviewReasons:[],
    canonicalFacets:{available:true,assigned:false}}]
});

test('PRE-I4 VRM-134 / bounded visit workers settle all writes before reporting a failure',async()=>{
  const providerSource=fs.readFileSync(path.join(repoRoot,'backend/runtime/cxorbia-operational-command-provider-v1.mjs'),'utf8');
  assert.match(providerSource,/CXORBIA_VISIT_RECONCILIATION_CONCURRENCY\|\|16/);
  assert.match(providerSource,/Math\.min\(24/);
  const db=new FakeFirestore(),run=db.runTransaction.bind(db);
  let started=0,releaseSlow,startedBoth,completed=false;
  const slow=new Promise(resolve=>{releaseSlow=resolve;}),both=new Promise(resolve=>{startedBoth=resolve;});
  db.runTransaction=fn=>run(tx=>fn({...tx,get:async ref=>{
    started++;
    if(started===1)throw new Error('FIXTURE_FIRST_VISIT_FAILED');
    startedBoth();await slow;return tx.get(ref);
  }}));
  const source=hrSnapshot();
  source.visits.push({...source.visits[0],id:'visit-b',visitId:'visit-b',hrRowId:'HR!3',sourceRow:3});
  const pending=provider(db).reconcileSnapshot(source,{sourceRevision:'hr-rev-1'});
  const observed=pending.then(()=>{completed=true;},()=>{completed=true;});
  await both;
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.equal(completed,false,'a failed worker must not return while another can still write');
  releaseSlow();
  await assert.rejects(pending,/FIXTURE_FIRST_VISIT_FAILED/);
  await observed;
  assert.equal(db.get(visitPath('HR!3')).hrRowId,'HR!3','late durable effect is settled before rejection');
});

test('Gate 7 / visit HR reconciliation creates durable visits idempotently by revision',async()=>{
  const db=new FakeFirestore();
  const first=await provider(db).reconcileSnapshot(hrSnapshot(),{sourceRevision:'hr-rev-1'});
  assert.equal(first.ok,true);
  assert.equal(first.visitCount,1);
  assert.equal(first.createdVisits,1);
  assert.equal(first.providerWrites,1);
  assert.equal(db.get(visitPath('HR!2')).hrRowId,'HR!2');
  assert.equal(db.get(visitPath('HR!2')).periodId,'period-a');

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
  assert.equal(db.get(visitPath('HR!2')).estado,'asignada');
  assert.equal(db.get(visitPath('HR!2')).shopperId,'shopper-hr');
  assert.equal(db.get(visitPath('HR!2')).assignmentSource,'hr');
  assert.equal(db.get(visitPath('HR!2')).assignmentSyncStatus,'synced');
  assert.equal(db.get(visitPath('HR!2')).canonicalFacets.available,false);

  const available=hrSnapshot();
  const third=await provider(db).reconcileSnapshot(available,{sourceRevision:'hr-rev-3'});
  assert.equal(third.providerWrites,1);
  assert.equal(db.get(visitPath('HR!2')).estado,'disponible');
  assert.equal(db.get(visitPath('HR!2')).shopperId,null);
  assert.equal(db.get(visitPath('HR!2')).assignmentSource,null);
  assert.equal(db.get(visitPath('HR!2')).assignmentSyncStatus,null);
  assert.equal(db.get(visitPath('HR!2')).canonicalFacets.available,true);

  db.seed(visitPath('HR!2'),{...db.get(visitPath('HR!2')),estado:'realizada',status:'realizada',shopperId:'shopper-stale',assignmentSource:'hr',assignmentSyncStatus:'synced'});
  const repaired=await provider(db).reconcileSnapshot(available,{sourceRevision:'hr-rev-3'});
  assert.equal(repaired.providerWrites,1);
  assert.equal(db.get(visitPath('HR!2')).estado,'disponible');
  assert.equal(db.get(visitPath('HR!2')).shopperId,null);
});

test('Gate 7 / HR reconciliation gives HR authority until external reflection is confirmed',async()=>{
  const db=new FakeFirestore();
  db.seed(visitPath('HR!2'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:'asignada',status:'asignada',shopperId:'shopper-platform',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',version:4});
  const waiting=await provider(db).reconcileSnapshot(hrSnapshot(),{sourceRevision:'hr-rev-wait'});
  assert.equal(waiting.providerWrites,1);
  assert.equal(db.get(visitPath('HR!2')).shopperId,null);
  assert.equal(db.get(visitPath('HR!2')).assignmentSource,null);
  assert.equal(db.get(visitPath('HR!2')).assignmentSyncStatus,null);

  const reflected=hrSnapshot();
  reflected.visits[0]={...reflected.visits[0],estado:'asignada',status:'asignada',shopperId:'shopper-platform',canonicalFacets:{available:false,assigned:true}};
  const synced=await provider(db).reconcileSnapshot(reflected,{sourceRevision:'hr-rev-synced'});
  assert.equal(synced.providerWrites,1);
  assert.equal(db.get(visitPath('HR!2')).shopperId,'shopper-platform');
  assert.equal(db.get(visitPath('HR!2')).assignmentSource,'hr');
  assert.equal(db.get(visitPath('HR!2')).assignmentSyncStatus,'synced');
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

test('Gate 7 / approval atomically assigns visit and targets exactly one shopper notice without duplicate on replay',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('visit-a'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:'disponible',status:'disponible',version:4});
  db.seed('tenants/tenant-a/projects/project-a/postulations/app-a',{
    id:'app-a',visitId:'visit-a',hrRowId:'HR!2',shopperId:'shopper-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',
    status:'pendiente',estado:'pendiente',fechaProp:'2026-11-20',version:2
  });
  const command={version:'cxorbia-command-adapter-v1',commandType:'application.status.update',entityType:'application',entityId:'app-a',
    tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:2,idempotencyKey:'approve-app-a-20261110',
    payload:{status:'aprobada',reason:'admin_approval'},authorization:{providerEnforcementRequired:true}};
  const first=await provider(db).execute('token',command);
  assert.equal(first.ok,true);
  assert.equal(first.providerAck,true);
  assert.equal(db.get(visitPath('visit-a')).shopperId,'shopper-a');
  assert.equal(db.get(visitPath('visit-a')).assignmentSyncStatus,'pending_hr');
  const notices=db.paths().filter(path=>path.startsWith('tenants/tenant-a/bulletins/'));
  assert.equal(notices.length,1);
  const notice=db.get(notices[0]);
  assert.deepEqual(notice.targetShopperIds,['shopper-a']);
  assert.deepEqual(notice.targetProjectIds,['project-a']);
  assert.equal(notice.actionRoute,'misvisitas');
  assert.equal(notice.entityId,'visit-a');
  assert.equal(notice.eventKey,'postulation_approved_visit_assigned');
  assert.equal(notice.operational,true);
  const replay=await provider(db).execute('token',command);
  assert.equal(replay.ok,true);
  assert.equal(replay.idempotentReplay,true);
  assert.equal(replay.providerWrites,0);
  assert.equal(db.paths().filter(path=>path.startsWith('tenants/tenant-a/bulletins/')).length,1);
  assert.equal(receiptPaths(db).length,1);
  const unrelatedRetry={...command,idempotencyKey:'different-request-after-approval',expectedVersion:3};
  const retry=await provider(db).execute('token',unrelatedRetry);
  assert.equal(retry.ok,false);
  assert.equal(retry.code,'OPS_APPLICATION_ALREADY_APPROVED');
  assert.equal(db.paths().filter(path=>path.startsWith('tenants/tenant-a/bulletins/')).length,1);
});

test('Gate 7 / rejected applications never produce shopper approval bulletin',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed('tenants/tenant-a/projects/project-a/postulations/app-b',{
    id:'app-b',visitId:'visit-a',shopperId:'shopper-b',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',status:'pendiente',version:1
  });
  const command={version:'cxorbia-command-adapter-v1',commandType:'application.status.update',entityType:'application',entityId:'app-b',
    tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:1,idempotencyKey:'reject-app-b-20261110',
    payload:{status:'rechazada'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);
  assert.equal(result.providerAck,true);
  assert.equal(db.paths().filter(path=>path.startsWith('tenants/tenant-a/bulletins/')).length,0);
});

test('Gate 7 / shopper bulletin queries enforce exact recipient and project even when role query is broad',()=>{
  const source=fs.readFileSync(path.join(repoRoot,'app/core/backend-bulletins.js'),'utf8');
  assert.match(source,/if\(targets\.length&&\(!sid\|\|!targets\.includes\(String\(sid\)\)\)\)return;/);
  assert.match(source,/if\(projects\.length&&\(!projectId\|\|!projects\.includes\(String\(projectId\)\)\)\)return;/);
  const ui=fs.readFileSync(path.join(repoRoot,'app/modules/postulaciones.js'),'utf8');
  assert.doesNotMatch(ui,/CX\.automations\.fire\('aprobacion'/);
  const miDia=fs.readFileSync(path.join(repoRoot,'app/modules/midia.js'),'utf8');
  assert.match(miDia,/n\.operational===true&&n\.eventKey==='postulation_approved_visit_assigned'/);
});

test('Gate 7 / visit.assign resolves exact HR durable key when logical visitId differs and accepts source-current',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(visitPath('HR!2'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:'disponible',status:'disponible',version:7});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.assign',entityType:'visit',entityId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:'source-current',idempotencyKey:'gate7-exact-hr-key',payload:{visitId:'visit-a',hrRowId:'HR!2',shopperId:'shopper-a',assignmentSource:'platform'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);
  assert.equal(result.ok,true);
  assert.equal(result.providerAck,true);
  assert.equal(db.get(visitPath('HR!2')).shopperId,'shopper-a');
  assert.equal(db.get(visitPath('HR!2')).assignmentSyncStatus,'pending_hr');
  assert.equal(db.get(visitPath('visit-a')),undefined);
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
  const futureDate=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.reschedule',entityType:'visit',entityId:'visit-s',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:2,idempotencyKey:'prei4-reschedule-1',payload:{visitId:'visit-s',newDate:futureDate,decision:'approved',franjaCode:'AM 8–12h'},authorization:{providerEnforcementRequired:true}};
  const first=await provider(db).execute('token',command);assert.equal(first.providerAck,true);assert.equal(db.get(visitPath('visit-s')).agendada,futureDate);
  const replay=await provider(db).execute('token',command);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
});

test('PRE-I4 VRM-013 / internal-owned cancellation releases only after provider ACK',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed('tenants/tenant-a/projects/project-a',{operationalSource:{mode:'internal'}});
  db.seed(visitPath('visit-c'),{id:'visit-c',visitId:'visit-c',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'agendada',status:'agendada',shopperId:'shopper-a',shopper:'Shopper A',agendada:'2026-09-26',version:3,canonicalFacets:{available:false,assigned:true,scheduled:true}});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.cancel',entityType:'visit',entityId:'visit-c',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:3,idempotencyKey:'prei4-cancel-1',payload:{visitId:'visit-c',releaseToAvailable:true,reason:'admin_cancel_release'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);assert.equal(result.providerAck,true);
  const row=db.get(visitPath('visit-c'));assert.equal(row.estado,'disponible');assert.equal(row.shopperId,null);assert.equal(row.agendada,null);assert.equal(row.canonicalFacets.available,true);assert.equal(row.assignmentSyncStatus,'pending_hr');
});

test('PRE-I4 VRM-013 / external-HR cancellation cannot fabricate availability without HR ACK',async()=>{
  const db=new FakeFirestore();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed('tenants/tenant-a/projects/project-a',{operationalSource:{mode:'external'}});
  db.seed(visitPath('visit-ext'),{id:'visit-ext',visitId:'visit-ext',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!9',estado:'agendada',status:'agendada',shopperId:'shopper-a',agendada:'2026-09-26',version:3,canonicalFacets:{available:false,assigned:true,scheduled:true}});
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.cancel',entityType:'visit',entityId:'visit-ext',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:3,idempotencyKey:'prei4-external-cancel-ack-block',payload:{visitId:'visit-ext',releaseToAvailable:true,reason:'admin_cancel_release'},authorization:{providerEnforcementRequired:true}};
  const result=await provider(db).execute('token',command);
  assert.equal(result.ok,false);assert.equal(result.providerAck,false);assert.equal(result.code,'OPS_CANCEL_EXTERNAL_HR_ACK_REQUIRED');
  assert.equal(db.get(visitPath('visit-ext')).estado,'agendada');assert.equal(db.get(visitPath('visit-ext')).shopperId,'shopper-a');
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

// VRM143: exact cycles are provider-owned and survive retries without reviving old notices.
import vm from 'node:vm';
function requestCycleFixture(){
 const db=new FakeFirestore();
 const mergeMap=(a,b)=>{const out=clone(a)||{};for(const [k,v]of Object.entries(b)){out[k]=v&&typeof v==='object'&&!Array.isArray(v)&&a?.[k]&&typeof a[k]==='object'&&!Array.isArray(a[k])?mergeMap(a[k],v):clone(v);}return out;};
 // Firestore merge preserves nested fields that are absent from a patch.
 db._set=(p,v,options={},store=db._store)=>store.set(p,options.merge?mergeMap(store.get(p),v):clone(v));
 const actor=token=>token==='shopper-token'?{uid:'shopper-1',role:'shopper',authNamespace:'shopper',shopperId:'shopper-a'}:{uid:'admin-1',role:'admin',authNamespace:'staff'};
 for(const token of ['shopper-token','admin-token']){const a=actor(token);db.seed('tenants/tenant-a/users/'+a.uid,{...a,tenantId:'tenant-a',active:true,projectIds:['project-a']});}
 const auth={verifyIdToken:async token=>({...actor(token),tenantId:'tenant-a',projectIds:['project-a']})};
 db.seed('tenants/tenant-a/projects/project-a',{tenantId:'tenant-a',operationalSource:{mode:'external'},timeZone:'UTC'});
 const v={id:'visit-cycle',visitId:'visit-cycle',hrRowId:'HR!cycle',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',periodKey:'2026-11',quincena:'2Q',shopperId:'shopper-a',estado:'agendada',status:'agendada',agendada:'2026-11-18',version:1,canonicalFacets:{available:false,assigned:true,scheduled:true,cancelled:false},hrManaged:{hrRowId:'HR!cycle',sourceRevision:'independent-hr'},currency:'GTQ',paidAmount:23,financeHistory:[{id:'immutable'}]};
 db.seed(visitPath(v.id),v);const service=createOperationalCommandProvider({auth,db,policy});
 const command=(type,version,key,payload)=>({version:'cxorbia-command-adapter-v1',commandType:type,entityType:'visit',entityId:v.id,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:version,idempotencyKey:key,payload:{visitId:v.id,hrRowId:v.hrRowId,...payload},authorization:{providerEnforcementRequired:true}});
 const bulletins=()=>db.paths().filter(p=>p.includes('/bulletins/')).map(p=>db.get(p));
 const snapshot=()=>JSON.stringify([...db._store]);
 return {db,service,command,bulletins,snapshot,initial:v};
}
function actualRequestNoticeFeed(rows,visit,role){
 const CX={BACKEND:{enabled:false,previewMode:false,tenantId:'tenant-a'},dataSource:{showFixtures:()=>false},session:{role,user:{shopperId:'shopper-a'}},backendAuth:{context:()=>({tenantId:'tenant-a',role,shopperId:'shopper-a'})},data:{currentProjectId:'project-a',currentPeriodId:'2026-12',period:()=>({periodo:'2026-12'}),_visitas:[visit]}};
 const c=vm.createContext({CX,console,Set,Date,document:{readyState:'complete'}});c.window=c;c.addEventListener=()=>{};
 vm.runInContext(fs.readFileSync(path.join(repoRoot,'app/core/notif.js'),'utf8'),c);
 vm.runInContext(fs.readFileSync(path.join(repoRoot,'app/core/backend-bulletins.js'),'utf8').replace('  CX.backendBulletins = {','  CX.__normalizeNotice=normalize;\n  CX.backendBulletins = {'),c);
 CX.notif._items=rows.map(d=>CX.__normalizeNotice({id:d.id,data:()=>d},new Set()));return CX.notif;
}
for(const [type,field]of [['visit.cancel','cancelRequest'],['visit.reschedule','rescheduleRequest']])test('VRM143 '+type+' two exact cycles, equal clock, durable notice and old replay',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-16T12:00:00Z')});
 const f=requestCycleFixture(),{db,service}=f;
 const otherField=field==='cancelRequest'?'rescheduleRequest':'cancelRequest';db.seed(visitPath(f.initial.id),{...f.initial,[otherField]:{status:'rejected',reason:'unrelated prior request',decidedAt:'2026-10-01T00:00:00Z'}});
 const initial=db.get(visitPath(f.initial.id));
 const request=f.command(type,1,type+'-request-1',{reason:'request one',requestOnly:type==='visit.cancel',requestedByShopper:type==='visit.reschedule',newDate:'2026-11-22',requestCycleId:'UNTRUSTED_CLIENT_CYCLE'});
 const first=await service.execute('shopper-token',request);assert.equal(first.providerAck,true,JSON.stringify(first));assert.equal(first.providerWrites,4);
 let row=db.get(visitPath(f.initial.id));const cycle1=row[field].requestCycleId;assert.match(cycle1,/^[a-f0-9]{40}$/);assert.notEqual(cycle1,request.payload.requestCycleId);assert.equal(f.bulletins()[0].requestCycleId,cycle1);assert.equal(f.bulletins()[0].createdAt,row[field].requestedAt);
 const decision=f.command(type,2,type+'-decision-1',{decision:'rejected',reason:'decision one'});
 const rejected=await service.execute('admin-token',decision);assert.equal(rejected.providerAck,true,JSON.stringify(rejected));assert.equal(rejected.providerWrites,4);
 row=db.get(visitPath(f.initial.id));assert.equal(row[field].requestCycleId,cycle1);assert.equal(row[field].requestedAt,'2026-11-16T12:00:00.000Z');assert.equal(row[field].decidedBy,'admin-1');
 const decisionNotice=f.bulletins().find(n=>n.idempotencyKey===decision.idempotencyKey);assert.equal(decisionNotice.requestCycleId,cycle1);assert.notEqual(decisionNotice.idempotencyKey,request.idempotencyKey);
 const request2=f.command(type,3,type+'-request-2',{reason:'request two',requestOnly:type==='visit.cancel',requestedByShopper:type==='visit.reschedule',newDate:'2026-11-23'});
 const second=await service.execute('shopper-token',request2);assert.equal(second.providerAck,true,JSON.stringify(second));assert.equal(second.providerWrites,4);row=db.get(visitPath(f.initial.id));
 const cycle2=row[field].requestCycleId;assert.notEqual(cycle2,cycle1);assert.equal(row[field].requestedAt,'2026-11-16T12:00:00.000Z');assert.equal(row[field].status,'pending_review');assert.equal(row[field].reason,'request two');
 for(const key of ['decidedAt','decidedBy','decisionReason'])assert.equal(row[field][key],null,'new cycle must clear '+key+' even under nested merge');
 const clean=v=>{const r=clone(v);for(const k of [field,'version','updatedAt'])delete r[k];return r;};assert.deepEqual(clean(row),clean(initial));
 for(const [token,c]of [['shopper-token',request],['admin-token',decision]]){const before=f.snapshot(),replay=await service.execute(token,c);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);assert.equal(f.snapshot(),before);}
 const all=f.bulletins(),current=all.find(n=>n.idempotencyKey===request2.idempotencyKey),adminFeed=actualRequestNoticeFeed(all,row,'admin'),shopperFeed=actualRequestNoticeFeed(all,row,'shopper');
 assert.deepEqual(Array.from(adminFeed.for('admin'),n=>n.id),[current.id]);assert.equal(adminFeed.history('admin').length,2);assert.equal(shopperFeed.for('shopper').length,0);assert.equal(shopperFeed.history('shopper').length,1);
});
test('VRM143 external cancellation preserves exact pending HR cycle without fabricating availability',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-16T12:00:00Z')});const f=requestCycleFixture();
 const request=f.command('visit.cancel',1,'pending-hr-request',{requestOnly:true,reason:'request'});assert.equal((await f.service.execute('shopper-token',request)).providerAck,true);
 const cycle=f.db.get(visitPath(f.initial.id)).cancelRequest.requestCycleId,decision=f.command('visit.cancel',2,'pending-hr-decision',{decision:'approved',reason:'approved'});assert.equal((await f.service.execute('admin-token',decision)).providerAck,true);
 const row=f.db.get(visitPath(f.initial.id));assert.equal(row.cancelRequest.status,'approved_pending_hr');assert.equal(row.cancelRequest.requestCycleId,cycle);assert.equal(f.bulletins().find(n=>n.idempotencyKey===decision.idempotencyKey).requestCycleId,cycle);
 for(const k of ['shopperId','agendada','estado','hrManaged','canonicalFacets','financeHistory','paidAmount','currency'])assert.deepEqual(row[k],f.initial[k]);
 const before=f.snapshot(),blocked=await f.service.execute('shopper-token',f.command('visit.cancel',3,'blocked-request',{requestOnly:true,reason:'second'}));assert.equal(blocked.code,'OPS_VISIT_REQUEST_ALREADY_PENDING');assert.equal(f.snapshot(),before);
 const replay=await f.service.execute('admin-token',decision);assert.equal(replay.providerWrites,0);assert.equal(replay.idempotentReplay,true);assert.equal(f.snapshot(),before);
 assert.equal(actualRequestNoticeFeed(f.bulletins(),row,'shopper').for('shopper').length,1);
});
test('VRM143 bulletin write failure rolls back request, receipt and audit together',async t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-16T12:00:00Z')});const f=requestCycleFixture(),set=f.db._set;
 f.db._set=(p,...rest)=>{if(p.includes('/bulletins/'))throw new Error('SYNTHETIC_NOTICE_WRITE_FAILURE');return set(p,...rest);};
 const before=f.snapshot(),result=await f.service.execute('shopper-token',f.command('visit.cancel',1,'atomic-request',{requestOnly:true,reason:'request'}));assert.equal(result.providerAck,false);assert.equal(result.code,'SYNTHETIC_NOTICE_WRITE_FAILURE');assert.equal(f.snapshot(),before);
});
