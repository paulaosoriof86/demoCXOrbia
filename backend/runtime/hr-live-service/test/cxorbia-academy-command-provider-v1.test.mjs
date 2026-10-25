import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAcademyCommandProvider} from '../../cxorbia-academy-command-provider-v1.mjs';
import {commandProviderKind} from '../cxorbia-command-runtime-v1.mjs';

const clone=v=>v===undefined?undefined:structuredClone(v);
class Snap{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(n){return new Col(this.db,this.path+'/'+n);}async get(){return new Snap(this.id,this.db.s.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.s=new Map();}
  collection(n){return new Col(this,n);}
  seed(p,v){this.s.set(p,clone(v));}
  async runTransaction(fn){
    const w=new Map([...this.s].map(([k,v])=>[k,clone(v)]));let wrote=false;
    const tx={
      get:async r=>{if(wrote)throw new Error('READ_AFTER_WRITE');return new Snap(r.id,w.get(r.path));},
      set:(r,v,o={})=>{wrote=true;const old=w.get(r.path);w.set(r.path,o.merge&&old?{...clone(old),...clone(v)}:clone(v));},
      create:(r,v)=>{wrote=true;if(w.has(r.path))throw new Error('ALREADY_EXISTS');w.set(r.path,clone(v));}
    };
    const out=await fn(tx);this.s=w;return out;
  }
}
class Auth{
  constructor(uid='admin-1',role='super'){this.uid=uid;this.role=role;}
  async verifyIdToken(){return{uid:this.uid,tenantId:'tenant-a',role:this.role,authNamespace:'staff',name:this.uid};}
}
const policy={schemaVersion:'cxorbia.academy-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],hrWrites:false,externalWrites:false,paymentWrites:false};
function baseDb(){
  const d=new DB();
  d.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',name:'Admin One'});
  d.seed('tenants/tenant-a/users/admin-2',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',name:'Admin Two'});
  d.seed('tenants/tenant-a/users/admin-3',{active:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',name:'Admin Three'});
  return d;
}
function cmd(type,payload={},extra={}){
  return {commandType:type,entityType:type==='academy.category.create'?'academyCategory':'academyCourse',entityId:extra.entityId||null,tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',requireProject:false,requirePeriod:false,expectedVersion:extra.expectedVersion??(type.endsWith('.create')?'absent':1),idempotencyKey:extra.idempotencyKey||type+':key',payload,authorization:{providerEnforcementRequired:true,permission:extra.permission||'academy.edit'}};
}

test('VRM-192 runtime routes academy lifecycle commands to academy provider',()=>{
  for(const t of ['academy.course.create','academy.course.update','academy.course.state','academy.category.create'])assert.equal(commandProviderKind(t),'academy');
});

test('VRM-192 custom course create is tenant durable audited idempotent and seed-safe',async()=>{
  const db=baseDb(),provider=createAcademyCommandProvider({auth:new Auth(),db,policy});
  const c=cmd('academy.course.create',{audience:'admin',n:'Curso Durable',cat:'Operación',lessons:[],scope:{tenantId:['tenant-a']}});
  const first=await provider.execute('token',c),again=await provider.execute('token',c);
  assert.equal(first.ok,true);assert.equal(first.providerAck,true);assert.equal(first.readbackVerified,true);
  assert.equal(first.entityReadback.n,'Curso Durable');assert.equal(first.entityReadback.estado,'borrador');assert.equal(first.entityReadback.version,1);
  assert.equal(first.hrWrites,0);assert.equal(first.externalWrites,0);assert.equal(first.localStorageWrite,false);
  assert.equal(again.ok,true);assert.equal(again.idempotentReplay,true);assert.equal(again.providerWrites,0);
  assert.ok([...db.s.keys()].some(k=>k.includes('/academyCourses/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/academyAudit/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/commandReceipts/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/entityAuditTrail/')));
  const seed=await provider.execute('token',cmd('academy.course.create',{audience:'admin',n:'Seed',sourceOwned:true},{idempotencyKey:'seed:deny'}));
  assert.equal(seed.ok,false);assert.match(seed.code,/ACADEMY_COURSE_INVALID/);
});

test('VRM-192 expectedVersion protects content edits and increments content version',async()=>{
  const db=baseDb(),provider=createAcademyCommandProvider({auth:new Auth(),db,policy});
  const created=await provider.execute('token',cmd('academy.course.create',{audience:'admin',n:'Curso Uno',lessons:[]},{idempotencyKey:'course:create:one'}));
  const updated=await provider.execute('token',cmd('academy.course.update',{audience:'admin',patch:{desc:'Cambio durable'},contentChange:true},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'course:update:one'}));
  assert.equal(updated.ok,true);assert.equal(updated.entityReadback.desc,'Cambio durable');assert.equal(updated.entityReadback.version,2);assert.equal(updated.entityReadback.contentVersion,2);
  const stale=await provider.execute('token',cmd('academy.course.update',{audience:'admin',patch:{desc:'Stale'},contentChange:true},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'course:update:stale'}));
  assert.equal(stale.ok,false);assert.match(stale.code,/ACADEMY_EXPECTED_VERSION_CONFLICT/);
});

test('VRM-192 workflow enforces separation of duties and durable workflow version',async()=>{
  const db=baseDb(),creator=createAcademyCommandProvider({auth:new Auth('admin-1','super'),db,policy});
  const created=await creator.execute('token',cmd('academy.course.create',{audience:'admin',n:'Curso Flujo',lessons:[]},{idempotencyKey:'wf:create'}));
  const selfReview=await creator.execute('token',cmd('academy.course.state',{audience:'admin',state:'en_revision',reason:'revisar'},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'wf:self-review'}));
  assert.equal(selfReview.ok,false);assert.match(selfReview.code,/REVIEWER_MUST_DIFFER/);
  const reviewer=createAcademyCommandProvider({auth:new Auth('admin-2','admin'),db,policy});
  const reviewed=await reviewer.execute('token',cmd('academy.course.state',{audience:'admin',state:'en_revision',reason:'revisión'},{entityId:created.entityId,expectedVersion:1,idempotencyKey:'wf:review'}));
  assert.equal(reviewed.ok,true);assert.equal(reviewed.entityReadback.estado,'en_revision');assert.equal(reviewed.entityReadback.workflowVersion,2);assert.equal(reviewed.entityReadback.reviewedByUserId,'admin-2');
  const approver=createAcademyCommandProvider({auth:new Auth('admin-3','admin'),db,policy});
  const approved=await approver.execute('token',cmd('academy.course.state',{audience:'admin',state:'aprobado',reason:'contenido validado'},{entityId:created.entityId,expectedVersion:2,idempotencyKey:'wf:approve'}));
  assert.equal(approved.ok,true);assert.equal(approved.entityReadback.estado,'aprobado');assert.equal(approved.entityReadback.workflowVersion,3);assert.equal(approved.entityReadback.approvedByUserId,'admin-3');
});

test('VRM-192 categories are durable tenant entities with provider ACK/readback',async()=>{
  const db=baseDb(),provider=createAcademyCommandProvider({auth:new Auth(),db,policy});
  const result=await provider.execute('token',cmd('academy.category.create',{name:'Investigación de mercados'},{idempotencyKey:'cat:create'}));
  assert.equal(result.ok,true);assert.equal(result.entityType,'academyCategory');assert.equal(result.readbackVerified,true);assert.equal(result.entityReadback.name,'Investigación de mercados');
});

test('VRM-192 frontend custom content uses protected academy state and awaits provider ACK/readback',()=>{
  const academy=fs.readFileSync(new URL('../../../../app/modules/academia.js',import.meta.url),'utf8');
  const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  const bridge=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
  assert.match(academy,/_state\(\)\{CX\.data\.__academyState/);
  assert.match(academy,/if\(this\._canonical\(\)\)return \(Array\.isArray\(this\._state\(\)\.courses\)/);
  assert.match(academy,/ACADEMY_PROVIDER_OWNS_CUSTOM_CONTENT/);
  assert.match(academy,/academy\.course\.create/);assert.match(academy,/academy\.course\.update/);assert.match(academy,/academy\.course\.state/);assert.match(academy,/academy\.category\.create/);
  assert.match(academy,/providerAck===true&&a\.successUiAllowed===true&&a\.readbackVerified===true/);
  assert.match(academy,/await Promise\.resolve\(CX\.acadData\.editCourse/);
  assert.match(academy,/await Promise\.resolve\(CX\.acadData\.setCourseState/);
  assert.match(academy,/await Promise\.resolve\(CX\.acadData\.addCourse/);
  assert.match(academy,/CX\.acadData\.addCategory\(n\)/);
  assert.doesNotMatch(academy,/ncatSave[^\n]*localStorage/);
  assert.match(server,/firestore_tenant_academy/);assert.match(server,/academyCourses/);assert.match(server,/academyCategories/);assert.match(server,/academyAudit/);
  assert.match(bridge,/__academyState=clone\(protectedState\?\.academy\|\|\{\}\)/);
});

console.log('PASS_VRM192_ACADEMY_PROVIDER_SOURCE');
