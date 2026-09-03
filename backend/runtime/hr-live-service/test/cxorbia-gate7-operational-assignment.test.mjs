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

test('Gate 7 / visitas UI does not declare assignment success before ACK',()=>{
  const source=fs.readFileSync(path.join(repoRoot,'app/modules/visitas.js'),'utf8');
  assert.match(source,/await\s+data\.assignVisit\([^;]+ackAware\s*:\s*true/);
  assert.match(source,/commandSucceeded\(result\)/);
  assert.doesNotMatch(source,/data\.assignVisit\(v\.id,b\.dataset\.id\);\s*close\(\);\s*ui\.toast\('Visita asignada/);
  assert.doesNotMatch(source,/data\.assignVisit\(v\.id,s\.id\);\s*close\(\);\s*ui\.toast\('Shopper creado y visita asignada/);
});
