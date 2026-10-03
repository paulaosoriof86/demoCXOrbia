import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCommercialCommandProvider} from '../../cxorbia-commercial-command-provider-v1.mjs';
import {commandProviderKind} from '../cxorbia-command-runtime-v1.mjs';

const clone=v=>v===undefined?undefined:structuredClone(v);
class Snap{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(n){return new Col(this.db,this.path+'/'+n);}async get(){return new Snap(this.id,this.db.s.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}async get(){const prefix=this.path+'/',docs=[];for(const [p,v] of this.db.s.entries())if(p.startsWith(prefix)&&!p.slice(prefix.length).includes('/'))docs.push(new Snap(p.slice(prefix.length),v));return{docs};}}
class DB{
  constructor(){this.s=new Map();}
  collection(n){return new Col(this,n);}
  seed(p,v){this.s.set(p,clone(v));}
  get(p){return clone(this.s.get(p));}
  _set(store,p,v,o={}){const old=store.get(p);store.set(p,o.merge&&old?{...clone(old),...clone(v)}:clone(v));}
  async runTransaction(fn){const w=new Map([...this.s].map(([k,v])=>[k,clone(v)]));let wrote=false;const tx={get:async r=>{if(wrote)throw new Error('READ_AFTER_WRITE');return new Snap(r.id,w.get(r.path));},set:(r,v,o={})=>{wrote=true;this._set(w,r.path,v,o);},create:(r,v)=>{wrote=true;if(w.has(r.path))throw new Error('ALREADY_EXISTS');this._set(w,r.path,v,{})}};const out=await fn(tx);this.s=w;return out;}
}
class Auth{constructor(role='super',tenant='tenant-a'){this.role=role;this.tenant=tenant;}async verifyIdToken(){return{uid:'admin-1',tenantId:this.tenant,role:this.role,authNamespace:'staff'};}}
const policy={schemaVersion:'cxorbia.commercial-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],hrWrites:false,externalWrites:false,paymentWrites:false};
function baseDb(){const d=new DB();d.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff'});return d;}
function cmd(type,entityType,payload={},extra={}){return{commandType:type,entityType,entityId:extra.entityId||null,tenantId:'tenant-a',projectId:null,periodId:null,requireProject:false,requirePeriod:false,expectedVersion:extra.expectedVersion??'absent',idempotencyKey:extra.idempotencyKey||type+':one',payload,authorization:{providerEnforcementRequired:true,permission:'crm.edit'}};}

test('VRM-189 runtime routes tenant commercial mutations',()=>{
  for(const t of ['client.create','client.update','crm.account.create','crm.contact.create','crm.opportunity.create','crm.column.create','crm.column.update','crm.column.delete'])assert.equal(commandProviderKind(t),'commercial');
});
test('VRM-189 client create is durable, audited and idempotent',async()=>{
  const d=baseDb(),p=createCommercialCommandProvider({auth:new Auth(),db:d,policy}),c=cmd('client.create','client',{name:'Cliente Uno',pais:'GT'});
  const a=await p.execute('token',c),b=await p.execute('token',c);
  assert.equal(a.ok,true);assert.equal(a.providerAck,true);assert.equal(a.readbackVerified,true);assert.equal(a.entityReadback.name,'Cliente Uno');assert.equal(a.entityReadback.version,1);assert.equal(a.projectId,null);assert.equal(a.periodId,null);assert.equal(a.localStorageWrite,false);assert.equal(a.hrWrites,0);
  assert.equal(b.ok,true);assert.equal(b.idempotentReplay,true);assert.equal(b.providerWrites,0);
  assert.ok([...d.s.keys()].some(k=>k.includes('/commandReceipts/')));assert.ok([...d.s.keys()].some(k=>k.includes('/entityAuditTrail/')));
});
test('VRM-189 expectedVersion blocks stale account update',async()=>{
  const d=baseDb(),p=createCommercialCommandProvider({auth:new Auth(),db:d,policy});
  const a=await p.execute('token',cmd('crm.account.create','crmAccount',{nombre:'Cuenta Uno'}));assert.equal(a.ok,true);
  const ok=await p.execute('token',cmd('crm.account.update','crmAccount',{nombre:'Cuenta Dos'},{entityId:a.entityId,expectedVersion:1,idempotencyKey:'account:update:1'}));assert.equal(ok.ok,true);assert.equal(ok.entityReadback.version,2);
  const stale=await p.execute('token',cmd('crm.account.update','crmAccount',{nombre:'Cuenta Tres'},{entityId:a.entityId,expectedVersion:1,idempotencyKey:'account:update:stale'}));assert.equal(stale.ok,false);assert.match(stale.code,/EXPECTED_VERSION_CONFLICT/);
});
test('VRM-189 super/admin RBAC denies another role',async()=>{
  const d=baseDb(),p=createCommercialCommandProvider({auth:new Auth('ops'),db:d,policy}),r=await p.execute('token',cmd('client.create','client',{name:'No'}));assert.equal(r.ok,false);assert.match(r.code,/ACTOR_DENIED/);
});
test('VRM-189 source removes browser-local authority and exposes durable readback',()=>{
  const clients=fs.readFileSync(new URL('../../../../app/modules/clientes.js',import.meta.url),'utf8');
  const crm=fs.readFileSync(new URL('../../../../app/modules/crm.js',import.meta.url),'utf8');
  const boundary=fs.readFileSync(new URL('../../../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8');
  const bridge=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
  const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  assert.equal(/\blocalStorage\b/.test(clients),false);assert.equal(/\blocalStorage\b/.test(crm),false);
  assert.match(clients,/readbackVerified===true/);assert.match(crm,/readbackVerified===true/);
  assert.match(boundary,/requireProject:false,requirePeriod:false/);assert.match(boundary,/CX\.commercialCommandBoundary/);
  assert.match(bridge,/__commercialState=clone\(protectedState\?\.commercial\|\|\{\}\)/);
  assert.match(server,/firestore_tenant_commercial/);assert.match(server,/crmOpportunities/);
});
