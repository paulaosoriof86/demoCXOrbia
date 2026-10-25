import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createProjectCommandProvider,validateProjectPayload} from '../../cxorbia-project-command-provider-v1.mjs';

const clone=v=>v===undefined?undefined:structuredClone(v);
class Snap{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(n){return new Col(this.db,this.path+'/'+n);}async get(){return new Snap(this.id,this.db.s.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.s=new Map();}
  collection(n){return new Col(this,n);}
  seed(p,v){this.s.set(p,clone(v));}
  _set(store,p,v,o={}){const old=store.get(p);store.set(p,o.merge&&old?{...clone(old),...clone(v)}:clone(v));}
  async runTransaction(fn){const w=new Map([...this.s].map(([k,v])=>[k,clone(v)]));let wrote=false;const tx={get:async r=>{if(wrote)throw new Error('READ_AFTER_WRITE');return new Snap(r.id,w.get(r.path));},set:(r,v,o={})=>{wrote=true;this._set(w,r.path,v,o);},create:(r,v)=>{wrote=true;if(w.has(r.path))throw new Error('ALREADY_EXISTS');this._set(w,r.path,v,{})}};const out=await fn(tx);this.s=w;return out;}
}
class Auth{async verifyIdToken(){return{uid:'admin-1',tenantId:'tenant-a',role:'super',authNamespace:'staff'};}}
const policy={schemaVersion:'cxorbia.project-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],externalProviderWrites:false,hrWrites:false,makeCalls:false,geminiCalls:false,paymentWrites:false};
const baseProject={
  id:'project-a',projectId:'project-a',tenantId:'tenant-a',version:7,name:'Proyecto A',normalizedName:'proyecto a',countries:['GT'],periodId:'period-a',
  operationalSource:{mode:'external',authority:'external_source',providerType:'google_sheets',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:'binding-old',mappingRef:'map-old'}
};
function baseDb(){const d=new DB();d.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff'});d.seed('tenants/tenant-a/projects/project-a',baseProject);return d;}

test('VRM-191 project update returns durable readback for provider binding changes',async()=>{
  const db=baseDb(),provider=createProjectCommandProvider({auth:new Auth(),db,policy});
  const payload={...baseProject,version:7,operationalSource:{...baseProject.operationalSource,providerBindingId:'binding-new',mappingRef:'map-v2'},hrSourceAdmin:{tipo:'google_sheets',providerBindingId:'binding-new',mappingRef:'map-v2',estado:'connected'}};
  const result=await provider.execute('token',{commandType:'project.update',entityType:'project',entityId:'project-a',tenantId:'tenant-a',projectId:'project-a',periodId:'period-a',expectedVersion:7,idempotencyKey:'vrm191-project-source-update',payload,authorization:{providerEnforcementRequired:true,permission:'project.update'}});
  assert.equal(result.ok,true);assert.equal(result.providerAck,true);assert.equal(result.readbackVerified,true);
  assert.equal(result.entityReadback.operationalSource.providerBindingId,'binding-new');
  assert.equal(result.entityReadback.operationalSource.mappingRef,'map-v2');
  assert.equal(result.entityReadback.operationalSource.writePolicy,'external_read_only');
  assert.equal(result.entityReadback.version,8);
  assert.equal(result.hrWrites,undefined);
});

test('VRM-191 project config rejects raw private URL authority',()=>{
  const bad={...baseProject,version:7,privateUrl:'https://docs.google.com/spreadsheets/d/private'};
  const v=validateProjectPayload(bad,'update');
  assert.equal(v.ok,false);assert.ok(v.errors.some(x=>x.startsWith('PROJECT_CONFIG_SECRET_FORBIDDEN:')));
});

test('VRM-191 HR source administration is project-scoped and project-provider persisted',()=>{
  const source=fs.readFileSync(new URL('../../../../app/modules/hr-source.js',import.meta.url),'utf8');
  assert.match(source,/const pid=\(\)=>data\.currentProjectId/);
  assert.doesNotMatch(source,/const pid=\(\)=>data\.currentPeriodId/);
  assert.match(source,/CX\.data\.updateProject\(pid,next,\{ackAware:true/);
  assert.match(source,/providerAck===true&&ack\.successUiAllowed===true&&ack\.readbackVerified===true/);
  assert.match(source,/writePolicy:'external_read_only'/);
  assert.match(source,/providerBindingId:binding,mappingRef:mapping/);
  assert.match(source,/if\(this\._canonical\(\)\)\{const pid=this\._projectId\(\)/);
});

test('VRM-191 rutas no self-declares Google Sheets connected from a raw URL',()=>{
  const rutas=fs.readFileSync(new URL('../../../../app/modules/rutas.js',import.meta.url),'utf8');
  assert.doesNotMatch(rutas,/id="gsUrl"/);
  assert.doesNotMatch(rutas,/CX\.hr\.setFuente/);
  assert.doesNotMatch(rutas,/HR conectada en línea/);
  assert.match(rutas,/CX\.router\.nav\('hrsource'\)/);
  assert.match(rutas,/vínculo seguro\/mapeo/);
});

test('VRM-191 browser bridge transmits raw URL only to register endpoint and redacts it from bridge state',()=>{
  const bridge=fs.readFileSync(new URL('../../../../app/core/backend-hr-source-bridge.js',import.meta.url),'utf8');
  assert.match(bridge,/if\(kind==='register'&&payload\.privateSourceUrl\)body\.privateSourceUrl/);
  assert.match(bridge,/providerBindingId: r\.providerBindingId \|\| r\.sourceRef/);
  assert.match(bridge,/CX\.bus\.on\('hr-source:register'/);
  assert.match(bridge,/const safePayload=\{projectId:payload\.projectId/);
  assert.doesNotMatch(bridge,/safePayload=\{[^}]*privateSourceUrl/);
});

test('VRM-191 canonical HR engine is live-read-only and blocks browser mutations/writeback',()=>{
  const hr=fs.readFileSync(new URL('../../../../app/core/hr.js',import.meta.url),'utf8');
  assert.match(hr,/HR_SOURCE_CONFIG_PROVIDER_OWNED/);
  assert.match(hr,/HR_LIVE_PROVIDER_OWNS_SYNC/);
  assert.match(hr,/HR_EXTERNAL_EDIT_REQUIRES_PROVIDER_ACK/);
  assert.match(hr,/HR_WRITEBACK_REQUIRES_AUTHORIZED_PROVIDER_CONTRACT/);
  assert.match(hr,/origen:'hr_live'/);
  assert.match(hr,/__liveHrVisits/);
});

console.log('PASS_VRM191_HR_SOURCE_PROVIDER_CONTRACT');
