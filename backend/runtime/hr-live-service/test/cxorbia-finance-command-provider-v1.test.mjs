import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createFinanceCommandProvider} from '../../cxorbia-finance-command-provider-v1.mjs';

const clone=v=>v===undefined?undefined:structuredClone(v);
const clientHashTest=value=>{const s=typeof value==='string'?value:JSON.stringify(value||{});let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
class Snap{constructor(id,v){this.id=id;this._v=v;this.exists=v!==undefined;}data(){return clone(this._v);}}
class Ref{constructor(db,path){this.db=db;this.path=path;this.id=path.split('/').at(-1);}collection(n){return new Col(this.db,this.path+'/'+n);}async get(){return new Snap(this.id,this.db.s.get(this.path));}}
class Col{constructor(db,path){this.db=db;this.path=path;}doc(id){return new Ref(this.db,this.path+'/'+id);}}
class DB{
  constructor(){this.s=new Map();}
  collection(n){return new Col(this,n);}
  seed(p,v){this.s.set(p,clone(v));}
  get(p){return clone(this.s.get(p));}
  _set(store,p,v,o={}){const old=store.get(p);store.set(p,o.merge&&old?{...clone(old),...clone(v)}:clone(v));}
  async runTransaction(fn){
    const w=new Map([...this.s].map(([k,v])=>[k,clone(v)]));
    const tx={get:async r=>new Snap(r.id,w.get(r.path)),set:(r,v,o={})=>this._set(w,r.path,v,o),create:(r,v)=>{if(w.has(r.path))throw new Error('ALREADY_EXISTS');this._set(w,r.path,v,{})}};
    const out=await fn(tx);this.s=w;return out;
  }
}
class Auth{async verifyIdToken(){return{uid:'admin-1',tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']};}}
const policy={schemaVersion:'cxorbia.finance-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',externalPaymentWrites:false,bankWrites:false,hrWrites:false};
function baseDb(){
  const db=new DB();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']});
  db.seed('tenants/tenant-a/projects/project-a',{id:'project-a',projectId:'project-a',tenantId:'tenant-a',version:7,honorario:{GT:60,HN:200},currency:{GT:'Q',HN:'L'}});
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',{id:'SEP!2',visitId:'SEP!2',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-09',hrRowId:'SEP!2',pais:'GT',currency:'Q',honorario:null,boleto:35,comboAmt:100,reimbursementSourceComplete:true,canonicalFacets:{submitted:true},hrSourceRevision:'rev-hr',version:3});
  return db;
}
function command(type,extra={}){
  const reconcile=type==='finance.reconcile.visit';
  return {
    version:'cxorbia-command-adapter-v1',commandType:type,entityType:reconcile?'financeReconciliation':'paymentBatch',
    tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-09',entityId:reconcile?'live-visit-1':'batch',
    idempotencyKey:type+':key',expectedVersion:reconcile?3:clientHashTest([['live-visit-1',3]]),
    authorization:{providerEnforcementRequired:true,permission:reconcile?'finance.reconcile':'finance.markPaid'},
    payload:reconcile?{visitId:'live-visit-1',hrRowId:'SEP!2',sourceRevision:'rev-hr'}:{visitIds:['live-visit-1'],visitRefs:[{visitId:'live-visit-1',hrRowId:'SEP!2'}],fechaPago:'2026-09-29'},
    ...extra
  };
}

test('ADMIN-004 reconcile uses project-country honorarium when HR is blank and never confirms external payment',async()=>{
  const db=baseDb(),p=createFinanceCommandProvider({auth:new Auth(),db,policy});
  const r=await p.execute('token',command('finance.reconcile.visit'));
  assert.equal(r.ok,true);assert.equal(r.financialMatch.honorario,60);assert.equal(r.financialMatch.honorarioSource,'project_country_config');assert.equal(r.financialMatch.total,195);
  const v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  assert.equal(v.financialSourceStatus,'reconciled_exact');assert.equal(v.financialMatch.estado,'validada');assert.equal(v.financialMatch.externalPaymentConfirmed,false);assert.equal(v.paymentSourceRef,undefined);
});

test('ADMIN-004 explicit HR honorarium has precedence and reconciliation is idempotent',async()=>{
  const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');v.hrManaged={honorario:75};v.honorario=75;db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy}),cmd=command('finance.reconcile.visit');
  const a=await p.execute('token',cmd),b=await p.execute('token',cmd);
  assert.equal(a.ok,true);assert.equal(a.financialMatch.honorario,75);assert.equal(a.financialMatch.honorarioSource,'hr_explicit');assert.equal(a.financialMatch.total,210);
  assert.equal(b.ok,true);assert.equal(b.idempotentReplay,true);assert.equal(b.providerWrites,0);
});

test('ADMIN-004 missing config fails closed and payment batch rejects unreconciled visit',async()=>{
  const db=baseDb(),proj=db.get('tenants/tenant-a/projects/project-a');proj.honorario={};db.seed('tenants/tenant-a/projects/project-a',proj);
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy});
  const r=await p.execute('token',command('finance.reconcile.visit'));assert.equal(r.ok,false);assert.match(r.code,/FINANCE_RECONCILIATION_SOURCE_INCOMPLETE/);
  const pay=await p.execute('token',command('finance.payment.batch'));assert.equal(pay.ok,true);assert.equal(pay.pagadas,0);assert.equal(pay.reviewRequired.length,1);assert.match(pay.reviewRequired[0].motivo,/Conciliación financiera exacta requerida/);
});


test('ADMIN-004 project.update boundary sends the canonical current version in the provider payload',()=>{
  const src=fs.readFileSync(new URL('../../../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8');
  assert.match(src,/const currentVersion=versionOf\(current\);/);
  assert.match(src,/Object\.assign\(\{\},cleanPatch,\{projectId:id,periodId,version:currentVersion\}\)/);
});


test('ADMIN-004 command boundary parses as JavaScript after project.update version fix',()=>{
  const src=fs.readFileSync(new URL('../../../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8');
  assert.doesNotThrow(()=>new Function(src));
  assert.equal(src.includes('currentVersion=versionOf(current);\\n      const cmd='),false);
});


test('ADMIN-004 backend refresh invalidates exact HR authority before Firestore refresh',()=>{
  const src=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
  const wrapper=src.match(/CX\.backend\.refresh=async function\(\)\{([^]*?)return s;\};/)?.[1]||'';
  assert.ok(wrapper.length>0,'wrapped backend refresh must exist');
  const pending=wrapper.indexOf("sourceRef='firestore-refresh-pending-hr-recompose'");
  const invalidate=wrapper.indexOf("applied:false");
  const original=wrapper.indexOf('await original()');
  const schedule=wrapper.indexOf("schedule('backend_refresh_dynamic',true)");
  assert.ok(pending>=0&&invalidate>=0&&original>=0&&schedule>=0);
  assert.ok(pending<original,'sourceRef must be invalidated before Firestore refresh');
  assert.ok(invalidate<original,'HR authority must be fail-closed before Firestore refresh');
  assert.ok(original<schedule,'HR recomposition is scheduled only after fresh Firestore capture');
});
