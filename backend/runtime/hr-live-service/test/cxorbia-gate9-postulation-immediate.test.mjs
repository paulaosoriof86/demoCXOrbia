import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOperationalCommandProvider } from '../../cxorbia-operational-command-provider-v1.mjs';

const repoRoot=fileURLToPath(new URL('../../../../',import.meta.url));
const clone=v=>v===undefined?undefined:structuredClone(v);
class Snapshot{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class DocRef{constructor(db,p){this.db=db;this.path=p;this.id=p.split('/').at(-1);}collection(n){return new CollectionRef(this.db,`${this.path}/${n}`);}async get(){return new Snapshot(this.id,this.db._store.get(this.path));}}
class CollectionRef{constructor(db,p){this.db=db;this.path=p;}doc(id){return new DocRef(this.db,`${this.path}/${id}`);}}
class FakeFirestore{
  constructor(){this._store=new Map();}
  collection(n){return new CollectionRef(this,n);}
  _set(p,v,o={},store=this._store){const prior=store.get(p);store.set(p,o?.merge&&prior?{...clone(prior),...clone(v)}:clone(v));}
  async runTransaction(fn){const working=new Map([...this._store].map(([k,v])=>[k,clone(v)]));const tx={get:async r=>new Snapshot(r.id,working.get(r.path)),create:(r,v)=>{if(working.has(r.path))throw new Error('ALREADY_EXISTS');this._set(r.path,v,{merge:false},working);},set:(r,v,o={})=>this._set(r.path,v,o,working),delete:r=>working.delete(r.path)};const out=await fn(tx);this._store=working;return out;}
  seed(p,v){this._store.set(p,clone(v));}
  get(p){return clone(this._store.get(p));}
  paths(){return [...this._store.keys()].sort();}
}
class FakeAuth{constructor({shopperId='shopper-a'}={}){this.shopperId=shopperId;}async verifyIdToken(){return {uid:'shopper-uid',tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:this.shopperId,projectIds:['project-a']};}}
const policy={schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};
const memberPath='tenants/tenant-a/users/shopper-uid';
const visitPath=id=>`tenants/tenant-a/projects/project-a/visits/${id}`;
const postPrefix='tenants/tenant-a/projects/project-a/postulations/';
function seededDb(state='disponible'){
  const db=new FakeFirestore();
  db.seed(memberPath,{active:true,tenantId:'tenant-a',role:'shopper',authNamespace:'shopper',shopperId:'shopper-a',projectIds:['project-a']});
  db.seed(visitPath('visit-a'),{id:'visit-a',visitId:'visit-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',hrRowId:'HR!2',estado:state,status:state,shopperId:''});
  return db;
}
const command=(overrides={})=>({version:'cxorbia-command-adapter-v1',commandType:'application.create',entityType:'application',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:'absent',idempotencyKey:'gate9-application-create-a',payload:{visitId:'visit-a',hrRowId:'HR!2',shopperId:'shopper-a',proposedDate:'2026-09-05',note:'gate9'},authorization:{providerEnforcementRequired:true,permission:'application.create'},...overrides});

test('Gate 9 / application.create persists exact shopper visit scope and ACKs before UI success',async()=>{
  const db=seededDb();
  const provider=createOperationalCommandProvider({auth:new FakeAuth(),db,policy});
  const result=await provider.execute('shopper-token',command());
  assert.equal(result.ok,true);assert.equal(result.status,'committed');assert.equal(result.providerAck,true);assert.equal(result.successUiAllowed,true);assert.equal(result.localMutation,false);assert.equal(result.localStorageWrite,false);
  const posts=db.paths().filter(p=>p.startsWith(postPrefix));
  assert.equal(posts.length,1);
  const post=db.get(posts[0]);
  assert.equal(post.tenantId,'tenant-a');assert.equal(post.projectId,'project-a');assert.equal(post.periodId,'period-a');assert.equal(post.visitId,'visit-a');assert.equal(post.shopperId,'shopper-a');assert.equal(post.estado,'pendiente');assert.equal(post.fechaProp,'2026-09-05');
});

test('Gate 9 / application.create replay is idempotent and creates no duplicate postulation',async()=>{
  const db=seededDb();const provider=createOperationalCommandProvider({auth:new FakeAuth(),db,policy});
  const first=await provider.execute('shopper-token',command());const replay=await provider.execute('shopper-token',command());
  assert.equal(first.ok,true);assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);assert.equal(db.paths().filter(p=>p.startsWith(postPrefix)).length,1);
});

test('Gate 9 / application.create rejects shopper mismatch and unavailable visit without writes',async()=>{
  const db=seededDb();const provider=createOperationalCommandProvider({auth:new FakeAuth(),db,policy});
  const mismatch=await provider.execute('shopper-token',command({idempotencyKey:'gate9-mismatch',payload:{visitId:'visit-a',shopperId:'shopper-b',proposedDate:'2026-09-05'}}));
  assert.equal(mismatch.ok,false);assert.equal(mismatch.code,'OPS_APPLICATION_SHOPPER_SCOPE_DENIED');assert.equal(db.paths().filter(p=>p.startsWith(postPrefix)).length,0);
  const db2=seededDb('asignada');const provider2=createOperationalCommandProvider({auth:new FakeAuth(),db:db2,policy});
  const unavailable=await provider2.execute('shopper-token',command({idempotencyKey:'gate9-unavailable'}));
  assert.equal(unavailable.ok,false);assert.equal(unavailable.code,'OPS_VISIT_NOT_AVAILABLE');assert.equal(db2.paths().filter(p=>p.startsWith(postPrefix)).length,0);
});

test('Gate 9 / frontend requires remote ACK and preserves durable posts through protected HR composition',()=>{
  const form=fs.readFileSync(path.join(repoRoot,'app/modules/visita-detalle.js'),'utf8');
  const bridge=fs.readFileSync(path.join(repoRoot,'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'),'utf8');
  const backend=fs.readFileSync(path.join(repoRoot,'app/core/backend-firebase.js'),'utf8');
  const admin=fs.readFileSync(path.join(repoRoot,'app/modules/postulaciones.js'),'utf8');
  assert.match(form,/CX\.commandAdapter\?\.execute/);assert.match(form,/commandType:'application\.create'/);assert.match(form,/status==='committed'/);assert.match(form,/providerAck===true/);assert.match(form,/successUiAllowed===true/);assert.doesNotMatch(form,/Postulación validada · pendiente de envío operativo/);
  assert.match(bridge,/postulations:\s*Array\.isArray\(payload\?\.posts\)\s*\?\s*payload\.posts\s*:\s*\[\]/);
  assert.match(backend,/postulations/);assert.match(backend,/_posts/);assert.match(admin,/data\._posts/);
});
