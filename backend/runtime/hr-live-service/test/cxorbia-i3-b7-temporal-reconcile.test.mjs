import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationalCommandProvider} from '../../cxorbia-operational-command-provider-v1.mjs';

// Local in-memory fake: absolutely no external provider, HR, Firebase or Auth writes.
const clone=v=>v===undefined?undefined:structuredClone(v);
class Ref {
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(n){return new Ref(this.db,this.path+'/'+n);}
  doc(n){return new Ref(this.db,this.path+'/'+n);}
  async get(){return {exists:this.db.rows.has(this.path),data:()=>clone(this.db.rows.get(this.path))};}
}
class FakeDb {
  constructor(){this.rows=new Map();}
  collection(n){return new Ref(this,n);}
  seed(p,v){this.rows.set(p,clone(v));}
  read(p){return clone(this.rows.get(p));}
  async runTransaction(fn){
    const next=new Map([...this.rows].map(([k,v])=>[k,clone(v)]));
    const tx={
      get:async r=>({exists:next.has(r.path),data:()=>clone(next.get(r.path))}),
      create:(r,v)=>{if(next.has(r.path))throw Error('ALREADY_EXISTS');next.set(r.path,clone(v));},
      set:(r,v,o={})=>next.set(r.path,o.merge&&next.has(r.path)?{...clone(next.get(r.path)),...clone(v)}:clone(v)),
      delete:r=>next.delete(r.path)
    };
    const result=await fn(tx);this.rows=next;return result;
  }
}
const auth={verifyIdToken:async()=>({uid:'admin-1',tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']})};
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
const provider=db=>createOperationalCommandProvider({auth,db,policy});
const projectPath='tenants/tenant-a/projects/project-a',visitPath=projectPath+'/visits/HR!2';
const hr=fields=>({sourceSafe:true,imported:false,firestoreWrites:0,tenantId:'tenant-a',projectId:'project-a',currentPeriodId:'period-a',visits:[{hrRowId:'HR!2',visitId:'logical-visit',periodId:'period-a',sourceTab:'HR',sourceRow:2,estado:'disponible',status:'disponible',shopperId:null,sucursal:'Sala Alfa',ciudad:'Ciudad',canonicalFacets:{available:true,assigned:false},...fields}]});
const command=id=>({version:'cxorbia-command-adapter-v1',commandType:'reservation.create',entityType:'reservation',entityId:'rsv-'+id,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:'absent',idempotencyKey:'b7-'+id,authorization:{providerEnforcementRequired:true},payload:{visitId:'HR!2',hrRowId:'HR!2',branchId:'sala-alfa|ciudad',shopperId:'shopper-a',status:'solicitada'}});
function setup(){
  const db=new FakeDb();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',projectIds:['project-a']});
  db.seed(projectPath,{reservationWindowMode:'future_only',timeZone:'America/Guatemala'});
  return db;
}
function seedOld(db,dates){
  db.seed(visitPath,{id:'HR!2',visitId:'HR!2',hrRowId:'HR!2',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',estado:'disponible',status:'disponible',shopperId:null,sucursal:'Sala Alfa',ciudad:'Ciudad',protectedOperatorNote:'preserve',version:4,...dates});
}
test('I3 B7: stale durable date blocks before HR reconciliation, then HR date enables ACK with idempotent replay',async()=>{
  const db=setup(),p=provider(db);
  seedOld(db,{periodKey:'2026-01',disponibleDesde:'2026-01-05',availableFrom:'2026-01-05'});
  const rejected=await p.execute('fixture-token',command('before'));
  assert.equal(rejected.code,'OPS_RESERVATION_FUTURE_WINDOW_REQUIRED');
  assert.equal(rejected.providerAck,false);assert.equal(rejected.providerWrites,0);
  const fresh=hr({periodKey:'2099-11',disponibleDesde:'2099-11-05',availableFrom:'2099-11-05'});
  const first=await p.reconcileSnapshot(fresh,{sourceRevision:'HR-EXACT-REV-1'});
  assert.equal(first.providerWrites,1);assert.equal(first.hrWrites,0);
  const row=db.read(visitPath);
  assert.equal(row.periodKey,'2099-11');assert.equal(row.disponibleDesde,'2099-11-05');assert.equal(row.availableFrom,'2099-11-05');
  assert.equal(row.periodId,'period-a');assert.equal(row.protectedOperatorNote,'preserve');
  const replay=await p.reconcileSnapshot(fresh,{sourceRevision:'HR-EXACT-REV-1'});
  assert.equal(replay.providerWrites,0);assert.equal(replay.idempotentReplays,1);
  const saved=await p.execute('fixture-token',command('after'));
  assert.equal(saved.ok,true);assert.equal(saved.providerAck,true);assert.equal(saved.status,'committed');
  const again=await p.execute('fixture-token',command('after'));
  assert.equal(again.idempotentReplay,true);assert.equal(again.providerWrites,0);
});
test('I3 B7: removal of HR future fields invalidates stale window, never fabricates available dates',async()=>{
  const db=setup(),p=provider(db);
  seedOld(db,{periodKey:'2099-11',disponibleDesde:'2099-11-05',availableFrom:'2099-11-05'});
  const fix=await p.reconcileSnapshot(hr({}),{sourceRevision:'HR-EXACT-REV-2'});
  assert.equal(fix.providerWrites,1);
  const row=db.read(visitPath);
  assert.equal(row.periodKey,null);assert.equal(row.disponibleDesde,null);assert.equal(row.availableFrom,null);
  assert.equal(row.periodId,'period-a');
  const rejected=await p.execute('fixture-token',command('missing-date'));
  assert.equal(rejected.code,'OPS_RESERVATION_FUTURE_WINDOW_REQUIRED');
  assert.equal(rejected.providerAck,false);assert.equal(rejected.providerWrites,0);
});