import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createFinanceCommandProvider} from '../../cxorbia-finance-command-provider-v1.mjs';
import {commandProviderKind} from '../cxorbia-command-runtime-v1.mjs';

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
class StrictReadBeforeWriteDB extends DB{
  async runTransaction(fn){
    const w=new Map([...this.s].map(([k,v])=>[k,clone(v)]));let wrote=false;
    const tx={
      get:async r=>{if(wrote)throw new Error('Firestore transactions require all reads to be executed before all writes.');return new Snap(r.id,w.get(r.path));},
      set:(r,v,o={})=>{wrote=true;this._set(w,r.path,v,o);},
      create:(r,v)=>{wrote=true;if(w.has(r.path))throw new Error('ALREADY_EXISTS');this._set(w,r.path,v,{})}
    };
    const out=await fn(tx);this.s=w;return out;
  }
}
class Auth{async verifyIdToken(){return{uid:'admin-1',tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']};}}
const policy={schemaVersion:'cxorbia.finance-command-provider-policy.v1',enabled:true,allowedTenantIds:['tenant-a'],allowedProjectIds:['project-a'],conflictPolicy:'review_no_silent_overwrite',externalPaymentWrites:false,bankWrites:false,hrWrites:false};
function baseDb(){
  const db=new DB();
  db.seed('tenants/tenant-a/users/admin-1',{active:true,tenantId:'tenant-a',role:'super',authNamespace:'staff',projectIds:['project-a']});
  db.seed('tenants/tenant-a/projects/project-a',{id:'project-a',projectId:'project-a',tenantId:'tenant-a',version:7,honorario:{GT:60,HN:200},currency:{GT:'Q',HN:'L'}});
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',{id:'SEP!2',visitId:'SEP!2',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-09',hrRowId:'SEP!2',shopperId:'shopper-1',pais:'GT',currency:'Q',honorario:null,boleto:35,comboAmt:100,reimbursementSourceComplete:true,canonicalFacets:{submitted:true},hrSourceRevision:'rev-hr',version:3});
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

function historicalCommand(extra={}){
  return {
    version:'cxorbia-command-adapter-v1',
    commandType:'finance.historical.reconcile',
    entityType:'historicalPaymentReconciliation',
    tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-09',entityId:'hist-test',
    idempotencyKey:'finance.historical.reconcile:key',expectedVersion:'source-current',
    authorization:{providerEnforcementRequired:true,permission:'finance.reconcile'},
    payload:{visitIds:['SEP!2'],visitRefs:[{visitId:'SEP!2',hrRowId:'SEP!2'}],paymentStatus:'paid',sourceRevision:'rev-hr',reconciliationBatchId:'hist-test',sourceRef:'historical-reconciliation:test'},
    ...extra
  };
}

test('VRM-151 command runtime routes finance.historical.reconcile to finance provider',()=>{
  assert.equal(commandProviderKind('finance.historical.reconcile'),'finance');
});

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

test('VRM-151 historical reconciliation uses canonical submitted visit, exact amount and idempotent durable status without bank or HR writes',async()=>{
  const db=baseDb(),p=createFinanceCommandProvider({auth:new Auth(),db,policy}),cmd=historicalCommand();
  const a=await p.execute('token',cmd),b=await p.execute('token',cmd);
  assert.equal(a.ok,true);assert.equal(a.reconciled,1);assert.equal(a.amountReviewRequired,0);assert.equal(a.detail[0].amount,195);assert.equal(a.detail[0].amountStatus,'exact');
  assert.equal(a.bankWrites,0);assert.equal(a.hrWrites,0);
  const v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  assert.equal(v.paymentConfirmed,true);assert.equal(v.historicalReconciliationConfirmed,true);assert.equal(v.historicalPaymentAmount,195);assert.equal(v.historicalPaymentAmountReviewRequired,false);assert.equal(v.reconciliationSourceRevision,'rev-hr');
  assert.equal(b.ok,true);assert.equal(b.idempotentReplay,true);assert.equal(b.providerWrites,0);
});

test('VRM-152 historical reconciliation completes every transaction read before the first write',async()=>{
  const seed=baseDb(),db=new StrictReadBeforeWriteDB();db.s=new Map([...seed.s].map(([k,v])=>[k,clone(v)]));
  const v2={...db.get('tenants/tenant-a/projects/project-a/visits/SEP!2'),id:'SEP!3',visitId:'SEP!3',hrRowId:'SEP!3',shopperId:'shopper-2',version:1};
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!3',v2);
  const payload={visitIds:['SEP!2','SEP!3'],visitRefs:[{visitId:'SEP!2',hrRowId:'SEP!2'},{visitId:'SEP!3',hrRowId:'SEP!3'}],paymentStatus:'paid',sourceRevision:'rev-hr',reconciliationBatchId:'hist-read-before-write',sourceRef:'historical-reconciliation:read-before-write'};
  const cmd=historicalCommand({idempotencyKey:'finance.historical.reconcile:read-before-write',entityId:'hist-read-before-write',payload});
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy}),r=await p.execute('token',cmd);
  assert.equal(r.ok,true);assert.equal(r.reconciled,2);assert.equal(r.providerAck,true);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').paymentConfirmed,true);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!3').paymentConfirmed,true);
});

test('VRM-151 historical reconciliation records paid status but keeps amount null and review-required when reimbursement source is incomplete',async()=>{
  const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');v.comboAmt=null;db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy}),r=await p.execute('token',historicalCommand());
  assert.equal(r.ok,true);assert.equal(r.reconciled,1);assert.equal(r.amountReviewRequired,1);assert.equal(r.detail[0].amount,null);assert.equal(r.detail[0].amountStatus,'review_required');assert.deepEqual(r.detail[0].reviewReasons,['COMBO_MISSING']);
  const after=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  assert.equal(after.paymentConfirmed,true);assert.equal(after.historicalPaymentAmount,null);assert.equal(after.historicalPaymentAmountReviewRequired,true);assert.deepEqual(after.historicalPaymentReviewReasons,['COMBO_MISSING']);assert.equal(after.financialMatch,undefined);
});

test('VRM-151 historical reconciliation writes the live visitId canonical owner before legacy hrRowId duplicate',async()=>{
  const db=baseDb(),legacy=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  const canonical={...legacy,id:'live-visit-1',visitId:'live-visit-1',hrRowId:'SEP!2',version:4};
  db.seed('tenants/tenant-a/projects/project-a/visits/live-visit-1',canonical);
  const payload={visitIds:['live-visit-1'],visitRefs:[{visitId:'live-visit-1',hrRowId:'SEP!2'}],paymentStatus:'paid',sourceRevision:'rev-hr',reconciliationBatchId:'hist-owner-test',sourceRef:'historical-reconciliation:owner-test'};
  const cmd=historicalCommand({idempotencyKey:'finance.historical.reconcile:owner-key',entityId:'hist-owner-test',payload});
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy}),r=await p.execute('token',cmd);
  assert.equal(r.ok,true);assert.equal(r.reconciled,1);
  const exact=db.get('tenants/tenant-a/projects/project-a/visits/live-visit-1');
  const old=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  assert.equal(exact.paymentConfirmed,true);assert.equal(exact.reconciliationSourceRef,'historical-reconciliation:owner-test');
  assert.equal(old.paymentConfirmed,undefined);assert.equal(old.reconciliationSourceRef,undefined);
  const rec=[...db.s.entries()].find(([k,v])=>k.includes('/paymentReconciliations/')&&v?.visitId==='live-visit-1')?.[1];
  assert.equal(rec?.durableVisitId,'live-visit-1');assert.equal(rec?.durableVisitAuthority,'live_hr_visit_id_equals_firestore_doc_id');
});

test('VRM-151 historical reconciliation rejects non-submitted visits even when the historical month is marked paid',async()=>{
  const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');v.canonicalFacets={submitted:false};v.estado='cuestionario';v.submittedAt=null;db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy}),r=await p.execute('token',historicalCommand());
  assert.equal(r.ok,false);assert.match(r.code,/FINANCE_HISTORICAL_VISIT_NOT_SUBMITTED/);
  const after=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');assert.equal(after.paymentConfirmed,undefined);assert.equal(after.reconciliationSourceRef,undefined);
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


test('ADMIN-004 unified human runtime preserves canonical project-country honorarium on HR-owned operational visits',()=>{
  const src=fs.readFileSync(new URL('../../../../app/adapters/tya-c6-unified-human-runtime-v1.js',import.meta.url),'utf8');
  assert.match(src,/source==='project_country_config'\|\|source==='project_configuration'/);
  assert.match(src,/return 'project_config_known'/);
  assert.match(src,/if\(authority==='project_config_known'\)/);
  assert.match(src,/v\.honorarioSource='project_country_config'/);
  const known=src.indexOf("return 'project_config_known'");
  const unknown=src.indexOf("return 'hr_unknown'");
  assert.ok(known>=0&&unknown>=0&&known<unknown,'known project-country fallback must be resolved before HR-operational unknown fallback');
});
