import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createProjectCommandProvider} from '../../cxorbia-project-command-provider-v1.mjs';
import {commandProviderKind} from '../cxorbia-command-runtime-v1.mjs';

const clone=v=>v===undefined?undefined:structuredClone(v);
class Snap{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class Ref{
  constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}
  collection(n){return new Col(this.db,this.path+'/'+n);}
  async get(){return new Snap(this.id,this.db.s.get(this.path));}
}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.s=new Map();}
  collection(n){return new Col(this,n);}
  seed(path,value){this.s.set(path,clone(value));}
  get(path){return clone(this.s.get(path));}
  _set(store,path,value,opts={}){const old=store.get(path);store.set(path,opts.merge&&old?{...clone(old),...clone(value)}:clone(value));}
  async runTransaction(fn){
    const work=new Map([...this.s].map(([k,v])=>[k,clone(v)]));let wrote=false;
    const tx={
      get:async ref=>{if(wrote)throw new Error('READ_AFTER_WRITE');return new Snap(ref.id,work.get(ref.path));},
      set:(ref,value,opts={})=>{wrote=true;this._set(work,ref.path,value,opts);},
      create:(ref,value)=>{wrote=true;if(work.has(ref.path))throw new Error('ALREADY_EXISTS');this._set(work,ref.path,value,{});}
    };
    const result=await fn(tx);this.s=work;return result;
  }
}
class Auth{async verifyIdToken(){return{uid:'admin-1',tenantId:'tenant-a',role:'super',authNamespace:'staff'};}}
const policy={
  schemaVersion:'cxorbia.project-command-provider-policy.v1',
  enabled:true,
  allowedTenantIds:['tenant-a'],
  allowedProjectIds:['project-a'],
  externalProviderWrites:false,hrWrites:false,makeCalls:false,geminiCalls:false,paymentWrites:false
};
function baseDb(){
  const db=new DB();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff'});
  db.seed('tenants/tenant-a/projects/project-a',{
    id:'project-a',projectId:'project-a',tenantId:'tenant-a',version:7,name:'Proyecto A',
    countries:['GT'],operationalSource:{mode:'external',providerType:'google_sheets',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:'binding-a',mappingRef:'map-a'}
  });
  return db;
}
function command(type,payload={},extra={}){
  const create=type==='period.create';
  return {
    version:'cxorbia-period-lifecycle-v1',
    commandType:type,entityType:'period',entityId:extra.entityId||null,
    tenantId:'tenant-a',projectId:'project-a',periodId:create?null:(extra.periodId||'project-a-2026-10'),
    requireProject:true,requirePeriod:!create,
    expectedVersion:extra.expectedVersion??(create?'absent':'source-current'),
    idempotencyKey:extra.idempotencyKey||type+':key',
    payload:{projectId:'project-a',...payload},
    authorization:{providerEnforcementRequired:true,permission:create?'period.create':'period.state.update'}
  };
}

test('VRM-190 runtime routes period lifecycle commands to project provider',()=>{
  assert.equal(commandProviderKind('period.create'),'project');
  assert.equal(commandProviderKind('period.state.update'),'project');
});

test('VRM-190 period create is project-scoped durable audited and idempotent',async()=>{
  const db=baseDb(),provider=createProjectCommandProvider({auth:new Auth(),db,policy});
  const cmd=command('period.create',{name:'Octubre 2026',periodo:'OCT 2026',countries:['GT'],program:'project-a'});
  const first=await provider.execute('token',cmd),again=await provider.execute('token',cmd);
  assert.equal(first.ok,true);assert.equal(first.providerAck,true);assert.equal(first.readbackVerified,true);
  assert.equal(first.projectId,'project-a');assert.ok(first.periodId.startsWith('project-a-period-'));
  assert.equal(first.entityReadback.projectId,'project-a');assert.equal(first.entityReadback.state,'activo');assert.equal(first.entityReadback.version,1);
  assert.equal(first.entityReadback.sourceMode,'external');assert.equal(first.hrWrites,0);assert.equal(first.externalProviderWrites,0);
  assert.equal(again.ok,true);assert.equal(again.idempotentReplay,true);assert.equal(again.providerWrites,0);
  assert.ok([...db.s.keys()].some(k=>k.includes('/projects/project-a/periods/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/commandReceipts/')));
  assert.ok([...db.s.keys()].some(k=>k.includes('/entityAuditTrail/')));
});

test('VRM-190 first state transition can durably overlay a source-derived period, then enforces expectedVersion',async()=>{
  const db=baseDb(),provider=createProjectCommandProvider({auth:new Auth(),db,policy});
  const close=command('period.state.update',{state:'cerrado'},{entityId:'project-a-2026-10',periodId:'project-a-2026-10',expectedVersion:'source-current',idempotencyKey:'period:close:1'});
  const first=await provider.execute('token',close);
  assert.equal(first.ok,true);assert.equal(first.readbackVerified,true);assert.equal(first.entityReadback.state,'cerrado');assert.equal(first.entityReadback.sourceDerived,true);assert.equal(first.entityReadback.version,1);
  const reopen=command('period.state.update',{state:'activo'},{entityId:'project-a-2026-10',periodId:'project-a-2026-10',expectedVersion:1,idempotencyKey:'period:reopen:1'});
  const second=await provider.execute('token',reopen);
  assert.equal(second.ok,true);assert.equal(second.entityReadback.state,'activo');assert.equal(second.entityReadback.version,2);
  const stale=command('period.state.update',{state:'archivado'},{entityId:'project-a-2026-10',periodId:'project-a-2026-10',expectedVersion:1,idempotencyKey:'period:archive:stale'});
  const blocked=await provider.execute('token',stale);
  assert.equal(blocked.ok,false);assert.match(blocked.code,/PERIOD_EXPECTED_VERSION_CONFLICT/);
});

test('VRM-190 rejects state transition outside the lifecycle contract',async()=>{
  const db=baseDb(),provider=createProjectCommandProvider({auth:new Auth(),db,policy});
  const result=await provider.execute('token',command('period.state.update',{state:'borrado'},{entityId:'project-a-2026-10',periodId:'project-a-2026-10'}));
  assert.equal(result.ok,false);assert.match(result.code,/PERIOD_STATE_INVALID/);
});

test('VRM-190 frontend requires provider ACK/readback before period success UI and canonical period state is provider-backed',()=>{
  const data=fs.readFileSync(new URL('../../../../app/core/data.js',import.meta.url),'utf8');
  const periods=fs.readFileSync(new URL('../../../../app/modules/periodos.js',import.meta.url),'utf8');
  const bridge=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
  const server=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
  assert.match(data,/_periodCanonical\(\)/);
  assert.match(data,/_periodProviderRows\(\)/);
  assert.match(data,/period\.state\.update/);
  assert.match(data,/period\.create/);
  assert.match(data,/applyPeriodReadback\(row\)/);
  assert.match(periods,/providerAck===true&&a\.successUiAllowed===true&&a\.readbackVerified===true/);
  assert.match(periods,/await Promise\.resolve\(data\.duplicatePeriod/);
  assert.match(periods,/await Promise\.resolve\(data\.closePeriod/);
  assert.match(periods,/await Promise\.resolve\(data\.archivePeriod/);
  assert.match(periods,/await Promise\.resolve\(data\.reopenPeriod/);
  assert.match(bridge,/__protectedPeriods=clone\(protectedState\?\.periods\|\|\[\]\)/);
  assert.match(server,/projectRef\.collection\('periods'\)/);
});

console.log('PASS_VRM190_PERIOD_LIFECYCLE_SOURCE');
