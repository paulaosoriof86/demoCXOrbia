import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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

function historicalSnapshotFromDb(db){
  const visits=[];
  for(const [path,value] of db.s.entries()){
    if(!path.includes('/projects/project-a/visits/'))continue;
    const docId=path.split('/').at(-1),v=clone(value)||{};
    visits.push({...v,id:v.id||v.visitId||docId,visitId:v.visitId||v.id||docId});
  }
  return {tenantId:'tenant-a',projectId:'project-a',visits};
}
function historicalProvider(db,hrSnapshot=historicalSnapshotFromDb(db),hrRevision='rev-hr'){
  return createFinanceCommandProvider({auth:new Auth(),db,policy,hrSnapshot,hrRevision});
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
  const db=baseDb(),p=historicalProvider(db),cmd=historicalCommand();
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
  const p=historicalProvider(db),r=await p.execute('token',cmd);
  assert.equal(r.ok,true);assert.equal(r.reconciled,2);assert.equal(r.providerAck,true);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').paymentConfirmed,true);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!3').paymentConfirmed,true);
});

test('VRM-153 historical reconciliation uses exact HR revision for reimbursement authority when durable Firestore copy is incomplete',async()=>{
  const db=baseDb(),stored=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');stored.boleto=null;stored.comboAmt=null;db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',stored);
  const hrVisit={...stored,id:'SEP!2',visitId:'SEP!2',hrRowId:'SEP!2',boleto:35,comboAmt:100,reimbursementSourceComplete:true};
  const p=historicalProvider(db,{tenantId:'tenant-a',projectId:'project-a',visits:[hrVisit]}),r=await p.execute('token',historicalCommand());
  assert.equal(r.ok,true);assert.equal(r.amountReviewRequired,0);assert.equal(r.detail[0].amount,195);assert.equal(r.detail[0].amountStatus,'exact');
  const after=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');assert.equal(after.historicalPaymentAmount,195);assert.equal(after.historicalPaymentAmountReviewRequired,false);
});

test('VRM-153 historical reconciliation fails closed when command HR revision differs from runtime HR authority',async()=>{
  const db=baseDb(),p=historicalProvider(db,historicalSnapshotFromDb(db),'different-revision'),r=await p.execute('token',historicalCommand());
  assert.equal(r.ok,false);assert.match(r.code,/FINANCE_HISTORICAL_HR_REVISION_MISMATCH/);
});

test('VRM-151 historical reconciliation records paid status but keeps amount null and review-required when reimbursement source is incomplete',async()=>{
  const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');v.comboAmt=null;db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
  const p=historicalProvider(db),r=await p.execute('token',historicalCommand());
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
  const p=historicalProvider(db),r=await p.execute('token',cmd);
  assert.equal(r.ok,true);assert.equal(r.reconciled,1);
  const exact=db.get('tenants/tenant-a/projects/project-a/visits/live-visit-1');
  const old=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  assert.equal(exact.paymentConfirmed,true);assert.equal(exact.reconciliationSourceRef,'historical-reconciliation:owner-test');
  assert.equal(old.paymentConfirmed,undefined);assert.equal(old.reconciliationSourceRef,undefined);
  const rec=[...db.s.entries()].find(([k,v])=>k.includes('/paymentReconciliations/')&&v?.visitId==='live-visit-1')?.[1];
  assert.equal(rec?.durableVisitId,'live-visit-1');assert.equal(rec?.durableVisitAuthority,'live_hr_visit_id_equals_firestore_doc_id');
});

test('VRM-153 exact pending-to-paid supersession retains the prior audit record, one active visit and zero bank writes',async()=>{
  const db=baseDb(),p=historicalProvider(db),original=historicalCommand();
  const pending=historicalCommand({idempotencyKey:'vrm153:initial',entityId:'hist-prior',
    payload:{...original.payload,paymentStatus:'pending',reconciliationBatchId:'hist-prior'}});
  assert.equal((await p.execute('token',pending)).ok,true);
  const paid=historicalCommand({idempotencyKey:'vrm153:promote',entityId:'hist-current',
    payload:{...original.payload,paymentStatus:'paid',reconciliationBatchId:'hist-current',
      supersession:{priorBatchId:'hist-prior',priorPaymentStatus:'pending',authorityRef:'frozen-authorized-paid-2026-10-02',paymentDate:'2026-10-02'}}});
  const first=await p.execute('token',paid),replay=await p.execute('token',paid);
  assert.equal(first.ok,true);assert.equal(first.providerAck,true);assert.equal(first.bankWrites,0);assert.equal(first.hrWrites,0);
  assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  const records=[...db.s.values()].filter(v=>v?.source==='historical_reconciliation');
  assert.equal(records.length,2);assert.equal(records.filter(v=>v.active!==false).length,1);
  const old=records.find(v=>v.reconciliationBatchId==='hist-prior'),fresh=records.find(v=>v.reconciliationBatchId==='hist-current');
  assert.equal(old.paymentStatus,'pending');assert.equal(old.active,false);assert.equal(old.superseded,true);
  assert.equal(old.supersededByBatchId,'hist-current');assert.equal(fresh.paymentStatus,'paid');
  assert.equal(fresh.supersedesBatchId,'hist-prior');assert.equal(fresh.paymentDate,'2026-10-02');
  const visit=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  assert.equal(visit.historicalPaymentStatus,'paid');assert.equal(visit.reconciliationBatchId,'hist-current');
  assert.equal(visit.historicalPaymentDate,'2026-10-02');
});

test('VRM-153 rejects unapproved overwrite, downgrade and future-dated proof without writes',async()=>{
  const db=baseDb(),p=historicalProvider(db),original=historicalCommand();
  const pending=historicalCommand({idempotencyKey:'vrm153:pending',entityId:'hist-pending',
    payload:{...original.payload,paymentStatus:'pending',reconciliationBatchId:'hist-pending'}});
  assert.equal((await p.execute('token',pending)).ok,true);
  const originalStore=JSON.stringify([...db.s.entries()]);
  const missing=historicalCommand({idempotencyKey:'vrm153:no-proof',entityId:'hist-paid',
    payload:{...original.payload,reconciliationBatchId:'hist-paid'}});
  let r=await p.execute('token',missing);assert.equal(r.ok,false);assert.match(r.code,/FINANCE_HISTORICAL_SUPERSESSION_REQUIRED/);
  const future=historicalCommand({idempotencyKey:'vrm153:future',entityId:'hist-paid',
    payload:{...original.payload,reconciliationBatchId:'hist-paid',supersession:{priorBatchId:'hist-pending',priorPaymentStatus:'pending',paymentDate:'2030-10-02',authorityRef:'approval'}}});
  r=await p.execute('token',future);assert.equal(r.ok,false);assert.match(r.code,/FINANCE_HISTORICAL_SUPERSESSION_DATE_INVALID/);
  const downgrade=historicalCommand({idempotencyKey:'vrm153:downgrade',entityId:'hist-pending-2',
    payload:{...original.payload,paymentStatus:'pending',reconciliationBatchId:'hist-pending-2',supersession:{priorBatchId:'hist-pending',priorPaymentStatus:'pending',paymentDate:'2026-10-02',authorityRef:'approval'}}});
  r=await p.execute('token',downgrade);assert.equal(r.ok,false);assert.match(r.code,/FINANCE_HISTORICAL_SUPERSESSION_TRANSITION_DENIED/);
  assert.equal(JSON.stringify([...db.s.entries()]),originalStore);
});

test('VRM-153 cross-project prior reconciliation blocks the whole transaction',async()=>{
  const db=baseDb(),p=historicalProvider(db),original=historicalCommand();
  const pending=historicalCommand({idempotencyKey:'vrm153:bad-old',entityId:'old',
    payload:{...original.payload,paymentStatus:'pending',reconciliationBatchId:'old'}});
  assert.equal((await p.execute('token',pending)).ok,true);
  const key=[...db.s.entries()].find(([k,v])=>k.includes('/paymentReconciliations/')&&v.reconciliationBatchId==='old')[0];
  db.seed(key,{...db.get(key),projectId:'foreign-project'});
  const before=JSON.stringify([...db.s.entries()]);
  const paid=historicalCommand({idempotencyKey:'vrm153:bad-paid',entityId:'new',
    payload:{...original.payload,reconciliationBatchId:'new',supersession:{priorBatchId:'old',priorPaymentStatus:'pending',paymentDate:'2026-10-02',authorityRef:'approval'}}});
  const out=await p.execute('token',paid);
  assert.equal(out.ok,false);assert.match(out.code,/FINANCE_HISTORICAL_SUPERSESSION_PRIOR_CONFLICT/);
  assert.equal(JSON.stringify([...db.s.entries()]),before);
});

test('VRM-153 supersession completes every Firestore read before any write in two-visit transaction',async()=>{
  const seed=baseDb(),db=new StrictReadBeforeWriteDB();db.s=new Map([...seed.s].map(([k,v])=>[k,clone(v)]));
  const v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!3',{...v,id:'SEP!3',visitId:'SEP!3',hrRowId:'SEP!3',shopperId:'shopper-2'});
  const p=historicalProvider(db),original=historicalCommand();
  const visitRefs=[{visitId:'SEP!2',hrRowId:'SEP!2'},{visitId:'SEP!3',hrRowId:'SEP!3'}];
  const initial=historicalCommand({idempotencyKey:'vrm153:two-old',entityId:'two-old',
    payload:{...original.payload,visitIds:['SEP!2','SEP!3'],visitRefs,paymentStatus:'pending',reconciliationBatchId:'two-old'}});
  assert.equal((await p.execute('token',initial)).ok,true);
  const paid=historicalCommand({idempotencyKey:'vrm153:two-new',entityId:'two-new',
    payload:{...original.payload,visitIds:['SEP!2','SEP!3'],visitRefs,paymentStatus:'paid',reconciliationBatchId:'two-new',
      supersession:{priorBatchId:'two-old',priorPaymentStatus:'pending',paymentDate:'2026-10-02',authorityRef:'approval'}}});
  const result=await p.execute('token',paid);assert.equal(result.ok,true);assert.equal(result.reconciled,2);
  const records=[...db.s.values()].filter(v=>v?.source==='historical_reconciliation');
  assert.equal(records.length,4);assert.equal(records.filter(v=>v.active!==false).length,2);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!3').historicalPaymentStatus,'paid');
});

test('VRM-153 exact same-human HR alias supersession requires transactional trusted identity link and preserves prior ID',async()=>{
  const db=baseDb(),baseline=historicalProvider(db),orig=historicalCommand();
  const prior=historicalCommand({idempotencyKey:'identity:old',entityId:'hist-old-id',
    payload:{...orig.payload,paymentStatus:'pending',reconciliationBatchId:'hist-old-id'}});
  assert.equal((await baseline.execute('token',prior)).ok,true);
  const live={...db.get('tenants/tenant-a/projects/project-a/visits/SEP!2'),shopperId:'shopper-2'};
  const provider=historicalProvider(db,{tenantId:'tenant-a',projectId:'project-a',visits:[live]});
  const make=(linkRef,idempotencyKey)=>historicalCommand({idempotencyKey,entityId:'hist-new-id',
    payload:{...orig.payload,reconciliationBatchId:'hist-new-id',
      supersession:{priorBatchId:'hist-old-id',priorPaymentStatus:'pending',paymentDate:'2026-10-02',authorityRef:'frozen-exact-oct02',
        identityLinkRefsByVisitId:linkRef?{'SEP!2':linkRef}:undefined}}});
  const before=JSON.stringify([...db.s.entries()]);
  let out=await provider.execute('token',make(null,'identity:no-link'));
  assert.equal(out.ok,false);assert.match(out.code,/FINANCE_HISTORICAL_EXACT_IDENTITY_LINK_REQUIRED/);
  assert.equal(JSON.stringify([...db.s.entries()]),before);
  db.seed('tenants/tenant-a/shopperIdentityLinks/irl_exact_verified12345678',{tenantId:'tenant-a',projectScope:'project-a',status:'active',
    sourceSystem:'hr_external',authorityType:'tenant_adjudication',authorityRef:'human-exact-same-human-approval',
    periodIndependent:true,canonicalShopperId:'shopper-2',exactAliases:['shopper-1','shopper-2'],sourceSafe:true});
  const paid=make('irl_exact_verified12345678','identity:trusted');
  out=await provider.execute('token',paid);const replay=await provider.execute('token',paid);
  assert.equal(out.ok,true);assert.equal(out.providerAck,true);
  assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  const recs=[...db.s.values()].filter(v=>v?.source==='historical_reconciliation');
  assert.equal(recs.length,2);assert.equal(recs.filter(v=>v.active!==false).length,1);
  const old=recs.find(v=>v.reconciliationBatchId==='hist-old-id'),current=recs.find(v=>v.reconciliationBatchId==='hist-new-id');
  assert.equal(old.shopperId,'shopper-1');assert.equal(old.superseded,true);
  assert.equal(old.supersessionIdentityLinkId,'irl_exact_verified12345678');
  assert.equal(current.shopperId,'shopper-2');assert.equal(current.priorReconciliationShopperId,'shopper-1');
  assert.equal(current.supersessionIdentityLinkId,'irl_exact_verified12345678');
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').historicalPaymentStatus,'paid');
});

test('VRM-153 explicit HR alias without permitted scoped link is not financial identity proof',async()=>{
  const db=baseDb(),p=historicalProvider(db),orig=historicalCommand();
  assert.equal((await p.execute('token',historicalCommand({idempotencyKey:'untrusted-old',entityId:'old-a',
    payload:{...orig.payload,paymentStatus:'pending',reconciliationBatchId:'old-a'}}))).ok,true);
  const altered={...db.get('tenants/tenant-a/projects/project-a/visits/SEP!2'),shopperId:'shopper-2'};
  const provider=historicalProvider(db,{tenantId:'tenant-a',projectId:'project-a',visits:[altered]});
  const linkId='irl_untrusted_alias_12345678';
  db.seed('tenants/tenant-a/shopperIdentityLinks/'+linkId,{tenantId:'tenant-a',projectScope:'foreign-project',status:'active',
    sourceSystem:'hr_external',authorityType:'provider_exact',authorityRef:'some-reference',periodIndependent:true,
    canonicalShopperId:'shopper-2',exactAliases:['shopper-1','shopper-2'],sourceSafe:true});
  const baseline=JSON.stringify([...db.s.entries()]);
  const attempt=historicalCommand({idempotencyKey:'untrusted-paid',entityId:'new-b',
    payload:{...orig.payload,reconciliationBatchId:'new-b',
      supersession:{priorBatchId:'old-a',priorPaymentStatus:'pending',paymentDate:'2026-10-02',authorityRef:'evidence',
        identityLinkRefsByVisitId:{'SEP!2':linkId}}}});
  const result=await provider.execute('token',attempt);
  assert.equal(result.ok,false);assert.match(result.code,/FINANCE_HISTORICAL_EXACT_IDENTITY_AUTHORITY_CONFLICT/);
  assert.equal(JSON.stringify([...db.s.entries()]),baseline);
});

test('VRM-153 initial exact historically-paid August row preserves authorized October 2 payment date without bank transfer',async()=>{
  const db=baseDb(),p=historicalProvider(db),base=historicalCommand();
  const command=historicalCommand({idempotencyKey:'vrm153:aug-hn:paid-date',
    payload:{...base.payload,reconciliationBatchId:'hist-aug-hn-approved',historicalPaymentDate:'2026-10-02',
      historicalPaymentAuthorityRef:'paula-authorized-august-2026-10-08'}});
  const out=await p.execute('token',command),replay=await p.execute('token',command);
  assert.equal(out.ok,true);assert.equal(out.bankWrites,0);assert.equal(out.hrWrites,0);
  assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  const rec=[...db.s.values()].find(x=>x?.reconciliationBatchId==='hist-aug-hn-approved'&&x.source==='historical_reconciliation');
  assert.equal(rec.paymentStatus,'paid');assert.equal(rec.paymentDate,'2026-10-02');
  assert.equal(rec.historicalPaymentAuthorityRef,'paula-authorized-august-2026-10-08');
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').historicalPaymentDate,'2026-10-02');
});
test('VRM-153 historical payment date rejects pending, future date, missing source authority without writes',async()=>{
  const db=baseDb(),p=historicalProvider(db),base=historicalCommand();
  const before=JSON.stringify([...db.s.entries()]);
  for(const change of [
    {paymentStatus:'pending',historicalPaymentDate:'2026-10-02',historicalPaymentAuthorityRef:'approval'},
    {paymentStatus:'paid',historicalPaymentDate:'2030-01-01',historicalPaymentAuthorityRef:'approval'},
    {paymentStatus:'paid',historicalPaymentDate:'2026-10-02',historicalPaymentAuthorityRef:''}
  ]){
    const out=await p.execute('token',historicalCommand({idempotencyKey:'vrm153:reject:'+JSON.stringify(change),payload:{...base.payload,...change}}));
    assert.equal(out.ok,false);assert.match(out.code,/FINANCE_HISTORICAL_INITIAL_PAYMENT_DATE_/);
    assert.equal(JSON.stringify([...db.s.entries()]),before);
  }
});

test('VRM-151 historical reconciliation rejects non-submitted visits even when the historical month is marked paid',async()=>{
  const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');v.canonicalFacets={submitted:false};v.estado='cuestionario';v.submittedAt=null;db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
  const p=historicalProvider(db),r=await p.execute('token',historicalCommand());
  assert.equal(r.ok,false);assert.match(r.code,/FINANCE_HISTORICAL_VISIT_NOT_SUBMITTED/);
  const after=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');assert.equal(after.paymentConfirmed,undefined);assert.equal(after.reconciliationSourceRef,undefined);
});

test('ADMIN-004 missing config fails closed and payment batch rejects unreconciled visit',async()=>{
  const db=baseDb(),proj=db.get('tenants/tenant-a/projects/project-a');proj.honorario={};db.seed('tenants/tenant-a/projects/project-a',proj);
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy});
  const r=await p.execute('token',command('finance.reconcile.visit'));assert.equal(r.ok,false);assert.match(r.code,/FINANCE_RECONCILIATION_SOURCE_INCOMPLETE/);
  const pay=await p.execute('token',command('finance.payment.batch'));assert.equal(pay.ok,true);assert.equal(pay.pagadas,0);assert.equal(pay.reviewRequired.length,1);assert.match(pay.reviewRequired[0].motivo,/Conciliación financiera exacta requerida/);
});

test('HF-20261012-27 payment batch rejects financially exact visits until operational state is submitted/validated',async()=>{
  for(const state of ['realizada','cuestionario']){
    const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
    v.estado=state;v.submit=false;v.financialSourceStatus='reconciled_exact';
    v.canonicalFacets={submitted:false};v.submittedAt=null;
    v.financialMatch={status:'reconciled_exact',total:195,country:'GT',currency:'Q'};
    db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
    const p=createFinanceCommandProvider({auth:new Auth(),db,policy});
    const pay=await p.execute('token',command('finance.payment.batch',{idempotencyKey:'hf27-block-state:'+state}));
    assert.equal(pay.ok,true);
    assert.equal(pay.pagadas,0);
    assert.equal(pay.reviewRequired.length,1);
    assert.match(pay.reviewRequired[0].motivo,/Estado operativo validado requerido/);
    assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').paymentState,undefined);
  }
});

test('HF-20261012-27 payment batch rejects internal duplicate and external payment duplicates',async()=>{
  for(const patch of [
    {paymentState:'platform_recorded_pending_external_reconciliation',externalPaymentConfirmed:false,paymentSourceRef:null},
    {paymentState:'payment_confirmed',paymentConfirmed:true,externalPaymentConfirmed:true,paymentSourceRef:'bank-confirmed:1'}
  ]){
    const db=baseDb(),v=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
    Object.assign(v,{estado:'cuestionario',submit:true,financialSourceStatus:'reconciled_exact',financialMatch:{status:'reconciled_exact',total:195,country:'GT',currency:'Q'}},patch);
    db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',v);
    const p=createFinanceCommandProvider({auth:new Auth(),db,policy});
    const pay=await p.execute('token',command('finance.payment.batch',{idempotencyKey:'hf27-block-duplicate:'+String(patch.paymentState)}));
    assert.equal(pay.ok,true);
    assert.equal(pay.pagadas,0);
    assert.equal(pay.reviewRequired.length,1);
    assert.match(pay.reviewRequired[0].motivo,/pago|confirmado|duplic/i);
    assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').lastPaymentCommandId,undefined);
  }
});

test('HF-20261012-27 payment batch records only selected eligible visits, separates currencies and is idempotent',async()=>{
  const db=baseDb(),first=db.get('tenants/tenant-a/projects/project-a/visits/SEP!2');
  Object.assign(first,{estado:'cuestionario',submit:true,canonicalFacets:{submitted:true},financialSourceStatus:'reconciled_exact',
    financialMatch:{status:'reconciled_exact',total:195,country:'GT',currency:'Q'}});
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!2',first);
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!3',{id:'SEP!3',visitId:'SEP!3',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-09',hrRowId:'SEP!3',
    shopperId:'shopper-2',shopper:'Shopper HN',sucursal:'HN 1',pais:'HN',currency:'L',estado:'cuestionario',submit:true,canonicalFacets:{submitted:true},
    financialSourceStatus:'reconciled_exact',financialMatch:{status:'reconciled_exact',total:300,country:'HN',currency:'L'},version:4});
  db.seed('tenants/tenant-a/projects/project-a/visits/SEP!4',{id:'SEP!4',visitId:'SEP!4',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-09',hrRowId:'SEP!4',
    shopperId:'shopper-3',pais:'GT',currency:'Q',estado:'cuestionario',submit:true,canonicalFacets:{submitted:true},
    financialSourceStatus:'reconciled_exact',financialMatch:{status:'reconciled_exact',total:100,country:'GT',currency:'Q'},version:5});
  const cmd=command('finance.payment.batch',{idempotencyKey:'hf27-selected-multicurrency',expectedVersion:clientHashTest([['live-visit-1',3],['live-visit-2',4]]),
    payload:{visitIds:['live-visit-1','live-visit-2'],visitRefs:[{visitId:'live-visit-1',hrRowId:'SEP!2'},{visitId:'live-visit-2',hrRowId:'SEP!3'}],fechaPago:'2026-10-13',referencia:'hf27-internal'}});
  const p=createFinanceCommandProvider({auth:new Auth(),db,policy});
  const firstAck=await p.execute('token',cmd),replay=await p.execute('token',cmd);
  assert.equal(firstAck.ok,true);assert.equal(firstAck.providerAck,true);assert.equal(firstAck.pagadas,2);
  assert.equal(firstAck.loteIds.length,2);
  assert.equal(firstAck.externalPaymentConfirmed,false);assert.equal(firstAck.bankWrites,0);
  assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').paymentState,'platform_recorded_pending_external_reconciliation');
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!3').paymentState,'platform_recorded_pending_external_reconciliation');
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!2').paymentSourceRef,null);
  assert.equal(db.get('tenants/tenant-a/projects/project-a/visits/SEP!4').paymentState,undefined);
});

test('HF-20261012-27 UI exposes one liquidation eligibility owner for row actions, detail and selection',()=>{
  const source=fs.readFileSync('app/modules/finanzas.js','utf8');
  assert.match(source,/function cxFinanceLiquidationEligibility\(/);
  assert.match(source,/Estado operativo validado requerido/);
  assert.match(source,/Registro interno previo/);
  assert.match(source,/Pago externo confirmado/);
  assert.match(source,/canRecordInternalPayment=l=>cxFinanceLiquidationEligibility\(l,/);
  assert.match(source,/data-blockreason/);
});

test('HF-20261012-21 finance dashboard exposes compact KPI hierarchy and five financial states without mixing country currencies',()=>{
  const source=fs.readFileSync('app/modules/finanzas.js','utf8');
  assert.match(source,/function cxFinanceKpiValue\(/);
  assert.match(source,/function cxFinancePaymentKpiValue\(/);
  assert.match(source,/data-fin-state="confirmed_value"/);
  assert.match(source,/data-fin-state="pending_source"/);
  assert.match(source,/data-fin-state="obligation_unpaid"/);
  assert.match(source,/data-fin-state="internal_pending_external"/);
  assert.match(source,/data-fin-state="external_confirmed"/);
  assert.match(source,/data-fin-country=/);
  assert.match(source,/data-fin-currency=/);
  assert.match(source,/GTQ\/HNL/);
  assert.doesNotMatch(source,/moneyOrPending=\(d,n,label='Pendiente de fuente\/configuración'\)=>Number\.isFinite\(n\)\?\(d\.cur\+' '\+n\.toLocaleString\(\)\):label/);
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


test('ADMIN-004 backend refresh invalidates HR authority then awaits atomic recomposition and readback',()=>{
  const src=fs.readFileSync(new URL('../../../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
  const wrapper=src.match(/CX\.backend\.refresh=async function\(\)\{([^]*?)return s;\};/)?.[1]||'';
  assert.ok(wrapper.length>0,'wrapped backend refresh must exist');
  const pending=wrapper.indexOf("sourceRef='firestore-refresh-pending-hr-recompose'");
  const invalidate=wrapper.indexOf("applied:false");
  const original=wrapper.indexOf('await original()');
  const compose=wrapper.indexOf("await reconcile('backend_refresh_dynamic')");
  const required=wrapper.indexOf('BACKEND_REFRESH_ATOMIC_COMPOSITION_REQUIRED');
  const readback=wrapper.indexOf('BACKEND_REFRESH_READBACK_REVISION_MISMATCH');
  assert.ok(pending>=0&&invalidate>=0&&original>=0&&compose>=0&&required>=0&&readback>=0);
  assert.ok(pending<original,'sourceRef must be invalidated before Firestore refresh');
  assert.ok(invalidate<original,'HR authority must be fail-closed before Firestore refresh');
  assert.ok(original<compose,'atomic HR recomposition starts only after fresh Firestore capture');
  assert.ok(compose<required&&required<readback,'refresh must await applied composition and exact revision readback before resolving');
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


test('HF-20261012-26 durable budget create, readback, update, delete and exact idempotency without bank truth',async()=>{
  const db=baseDb(),p=createFinanceCommandProvider({auth:new Auth(),db,policy});
  const save={version:'cxorbia-command-adapter-v1',commandType:'finance.budget.save',entityType:'financeBudget',
    tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',entityId:null,
    idempotencyKey:'hf26-budget-create-01',expectedVersion:'absent',
    authorization:{providerEnforcementRequired:true,permission:'finance.budget.write'},
    payload:{clientRequestId:'budget-form-01',country:'GT',currency:'Q',concept:'Transporte',amount:200}};
  assert.equal(commandProviderKind('finance.budget.save'),'finance');
  assert.equal(commandProviderKind('finance.budget.delete'),'finance');
  const initial=await p.execute('token',save);
  assert.equal(initial.ok,true);assert.equal(initial.committed,true);assert.equal(initial.providerAck,true);
  assert.equal(initial.externalPaymentConfirmed,false);assert.equal(initial.bankWrites,0);
  const id=initial.entityId,path='tenants/tenant-a/financeBudgets/'+id;
  const first=await db.collection('tenants').doc('tenant-a').collection('financeBudgets').doc(id).get();
  assert.equal(first.exists,true);assert.equal(first.data().status,'active');assert.equal(first.data().version,1);
  assert.equal(first.data().country,'GT');assert.equal(first.data().currency,'Q');assert.equal(first.data().amount,200);
  const replay=await p.execute('token',save);
  assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  assert.equal(db.get(path).amount,200);
  const edit={...save,entityId:id,idempotencyKey:'hf26-budget-edit-01',expectedVersion:1,
    payload:{country:'GT',currency:'Q',concept:'Transporte mensual',amount:225}};
  const updated=await p.execute('token',edit);
  assert.equal(updated.ok,true);assert.equal(updated.budget.amount,225);assert.equal(updated.budget.version,2);
  assert.equal(db.get(path).concept,'Transporte mensual');
  const stale=await p.execute('token',{...edit,idempotencyKey:'hf26-budget-edit-stale',payload:{...edit.payload,amount:999}});
  assert.equal(stale.ok,false);assert.equal(stale.code,'FINANCE_BUDGET_EXPECTED_VERSION_CONFLICT');
  const remove={...save,commandType:'finance.budget.delete',entityId:id,idempotencyKey:'hf26-budget-delete-01',
    expectedVersion:2,authorization:{providerEnforcementRequired:true,permission:'finance.budget.delete'},payload:{budgetId:id}};
  const removed=await p.execute('token',remove);
  assert.equal(removed.ok,true);assert.equal(removed.budget.status,'deleted');assert.equal(db.get(path).status,'deleted');
  assert.equal(db.get(path).version,3);
  const rerun=await p.execute('token',remove);assert.equal(rerun.ok,true);assert.equal(rerun.idempotentReplay,true);
  // New user intent after soft delete yields a new audited budget document; none resurrects automatically.
  const another=await p.execute('token',{...save,idempotencyKey:'hf26-budget-recreate-intent-02',payload:{...save.payload,clientRequestId:'budget-form-02'}});
  assert.equal(another.ok,true);assert.notEqual(another.entityId,id);
  assert.equal(db.get(path).status,'deleted');assert.equal(db.get('tenants/tenant-a/financeBudgets/'+another.entityId).status,'active');
  assert.equal(db.get('tenants/tenant-a/financialMovements/mov-1'),undefined);
});

test('HF-20261012-26 budget fail-closed country, currency, role, scope, amount, and no client writes',async()=>{
  const db=baseDb(),p=createFinanceCommandProvider({auth:new Auth(),db,policy});
  const base={version:'cxorbia-command-adapter-v1',commandType:'finance.budget.save',entityType:'financeBudget',
    tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',entityId:null,
    idempotencyKey:'hf26-deny-default',expectedVersion:'absent',
    authorization:{providerEnforcementRequired:true,permission:'finance.budget.write'},payload:{country:'GT',currency:'Q',concept:'Prueba',amount:10}};
  for(const [kind,payload,code] of [
    ['wrong-currency',{...base.payload,currency:'L'},'FINANCE_BUDGET_CURRENCY_SCOPE_CONFLICT'],
    ['missing-country',{...base.payload,country:''},'FINANCE_BUDGET_COUNTRY_CURRENCY_CONFIG_REQUIRED'],
    ['negative',{...base.payload,amount:-10},'FINANCE_BUDGET_AMOUNT_INVALID'],
    ['invalid',{...base.payload,concept:'<iframe>'},'FINANCE_BUDGET_CONCEPT_INVALID']
  ]){
    const result=await p.execute('token',{...base,idempotencyKey:'hf26-deny-'+kind,payload});
    assert.equal(result.ok,false);assert.equal(result.providerWrites,0);assert.match(result.code,new RegExp(code));
  }
  const forbidden=await p.execute('token',{...base,idempotencyKey:'hf26-permission-wrong',
    authorization:{providerEnforcementRequired:true,permission:'finance.movement.write'}});
  assert.equal(forbidden.ok,false);assert.equal(forbidden.providerWrites,0);
  const outOfScope=await p.execute('token',{...base,projectId:'project-b',idempotencyKey:'hf26-scope-denied'});
  assert.equal(outOfScope.ok,false);assert.equal(outOfScope.providerWrites,0);
  assert.equal([...db.s.keys()].some(x=>x.includes('/financeBudgets/')),false);
  const rules=fs.readFileSync('firestore.rules','utf8');
  assert.match(rules,/match \/financeBudgets\/\{budgetId\}/);
  assert.match(rules,/allow create, update, delete: if false;/);
  const module=fs.readFileSync('app/modules/finanzas.js','utf8');
  assert.match(module,/data\.saveFinanceBudget/);
  assert.match(module,/data\.deleteFinanceBudget/);
  assert.match(module,/getFinanceBudgets/);
  assert.match(module,/FINANCE_BUDGET_READBACK_MISMATCH/);
  assert.doesNotMatch(module,/CX\.finStore\.setPres\(p\.id,k/);
});


test('HF-20261012-22 provider diagnostic returns remote error codes without exposing raw exception/Pll',async()=>{
  const uiSource=fs.readFileSync('app/modules/finanzas.js','utf8');
  const from=uiSource.indexOf('function cxFinanceReconcileFailure(');
  const to=uiSource.indexOf('function _fin(data)',from);
  assert.ok(from>=0&&to>from,'Scoped finance diagnostic helper missing');
  const CX={backend:{refresh:async()=>{}}};
  const methods=new Function('CX',uiSource.slice(from,to)+';return {cxFinanceReconcileFailure,cxFinanceReconcileWithProof,cxFinanceExactReconcileReadback};')(CX);
  assert.deepEqual(methods.cxFinanceReconcileFailure({code:'FINANCE_VISIT_NOT_SUBMITTED',status:'blocked'},null),
    {code:'FINANCE_VISIT_NOT_SUBMITTED',httpStatus:null,committed:false});
  assert.equal(methods.cxFinanceReconcileFailure({code:'COMMAND_TRANSPORT_ERROR'},null).code,'COMMAND_TRANSPORT_ERROR');
  assert.equal(methods.cxFinanceReconcileFailure({code:'unsafe <script> secret=abcd'},null).code,'FINANCE_RECONCILE_ERROR_UNCLASSIFIED');
  assert.equal(methods.cxFinanceReconcileFailure({code:'FINANCE_RECONCILIATION_SOURCE_INCOMPLETE:unknown_honorario',httpStatus:409},null).httpStatus,409);
  assert.match(uiSource,/data-fin-reconcile-diagnostic/);
  assert.match(uiSource,/showDiagnostic\(result\.code/);
  assert.match(uiSource,/admin-finance-liquidation-detail-reconcile/);
  const blocked=await methods.cxFinanceReconcileWithProof({
    reconcileFinanceVisit:async()=>({ok:false,status:'blocked',code:'FINANCE_PERIOD_SCOPE_CONFLICT',providerAck:false})
  },'visit-1','admin-finance-reconcile');
  assert.deepEqual(blocked,{ok:false,code:'FINANCE_PERIOD_SCOPE_CONFLICT',httpStatus:null,providerAck:false});
});

test('HF-20261012-22 ACK never shown as full reconciliation until unique exact protected readback',async()=>{
  const uiSource=fs.readFileSync('app/modules/finanzas.js','utf8');
  const from=uiSource.indexOf('function cxFinanceReconcileFailure('),to=uiSource.indexOf('function _fin(data)',from);
  let refreshCalls=0,uiSuccess=0;
  const CX={backend:{refresh:async()=>{refreshCalls++;}}};
  const methods=new Function('CX',uiSource.slice(from,to)+';return {cxFinanceReconcileWithProof};')(CX);
  const data={currentPeriodId:'project-a-2026-10',
    __protectedVisits:[],
    reconcileFinanceVisit:async()=>({ok:true,status:'committed',providerAck:true,successUiAllowed:true})};
  const unresolved=await methods.cxFinanceReconcileWithProof(data,'live-visit-1','unit-hf22');
  assert.equal(unresolved.ok,false);
  assert.equal(unresolved.providerAck,true);
  assert.equal(unresolved.code,'FINANCE_RECONCILE_READBACK_UNAVAILABLE');
  assert.equal(refreshCalls,1);
  data.__protectedVisits=[{__docId:'live-visit-1',financialSourceStatus:'reconciled_exact',
    financialMatch:{status:'reconciled_exact',sourceRevision:'rev-hr-202610',country:'GT',currency:'Q'}}];
  const ok=await methods.cxFinanceReconcileWithProof(data,'live-visit-1','unit-hf22');
  assert.equal(ok.ok,true);assert.equal(ok.providerAck,true);
  assert.equal(ok.readback.sourceRevision,'rev-hr-202610');assert.equal(ok.readback.country,'GT');
  data.__protectedVisits.push({...data.__protectedVisits[0]});
  const duplicate=await methods.cxFinanceReconcileWithProof(data,'live-visit-1','unit-hf22');
  assert.equal(duplicate.ok,false);assert.equal(duplicate.code,'FINANCE_RECONCILE_READBACK_AMBIGUOUS');assert.equal(duplicate.providerAck,true);
  assert.equal(uiSuccess,0);
});

test('HF-20261012-23 independent source, obligation, internal ledger and external paid states',()=>{
  const source=fs.readFileSync('app/modules/finanzas.js','utf8');
  const start=source.indexOf('function cxFinanceReviewState('),end=source.indexOf('function cxFinanceReconcileFailure(',start);
  assert.ok(start>=0&&end>start,'exact financial review stage owner');
  const classify=new Function(source.slice(start,end)+'return cxFinanceReviewState;')();
  const blocked=classify({financialSourceStatus:'pending_or_review',moneda:'Q',total:null},['monto total']);
  assert.equal(blocked.sourceComplete,false);
  assert.equal(blocked.state,'Datos incompletos');
  assert.equal(blocked.obligation,'Importe pendiente de fuente');
  assert.equal(blocked.payment,'Sin pago confirmado');
  const pending=classify({financialSourceStatus:'pending_financial_source',moneda:'L',total:100},[]);
  assert.equal(pending.state,'Requiere conciliar');assert.equal(pending.paid,false);
  assert.equal(pending.obligation,'Monto operativo conocido · pendiente validación financiera');
  const reconciled=classify({financialSourceStatus:'reconciled_exact',moneda:'Q',total:200,paymentState:'not_scheduled'},[]);
  assert.equal(reconciled.exact,true);assert.equal(reconciled.payment,'Sin pago confirmado');
  assert.equal(reconciled.obligation,'Fuente conciliada · revisar pago');
  const platform=classify({financialSourceStatus:'reconciled_exact',moneda:'Q',total:200,paymentState:'platform_recorded_pending_external_reconciliation',paymentConfirmed:true},[]);
  assert.equal(platform.recorded,true);assert.equal(platform.paid,false);
  assert.equal(platform.payment,'Registro interno · falta confirmación externa');
  const externallyConfirmed=classify({financialSourceStatus:'reconciled_exact',moneda:'L',total:200,paymentConfirmed:true,externalPaymentConfirmed:true,paymentSourceRef:'bank-source-confirmed'},[]);
  assert.equal(externallyConfirmed.paid,true);assert.equal(externallyConfirmed.payment,'Pago externo confirmado por fuente');
  const notPaidFromInternal=classify({financialSourceStatus:'reconciled_exact',moneda:'Q',total:250,paymentConfirmed:true,externalPaymentConfirmed:false,paymentSourceRef:'platform-receipt-only'},[]);
  assert.equal(notPaidFromInternal.paid,false);
  assert.match(source,/<th>Obligación<\/th><th>Pago<\/th>/);
  assert.match(source,/r\.reviewState\.obligation/);
  assert.match(source,/r\.reviewState\.payment/);
});


test('HF-20261012-25 monthly CxP CxC provider ledger, client protections and UI readback',async()=>{
  const src=fs.readFileSync('app/modules/finanzas.js','utf8');
  assert.match(src,/id="cxpMonthCard"/);
  assert.match(src,/id="cxcMonthCard"/);
  assert.match(src,/data-cxc-apply/);
  assert.match(src,/data\.applyFinanceAccount\(rec\.id,amount/);
  assert.match(src,/data\.applyFinanceAccount\(r\.id,amount/);
  assert.match(src,/FINANCE_ACCOUNT_READBACK_MISMATCH/);
  assert.match(src,/No se puede editar o eliminar directamente una cuenta protegida/);
  assert.doesNotMatch(src,/derivedLiqCxps\.slice\(0,8\)/);
  assert.match(src,/if\(connectedFinance\(\)\)\{\s*const safe=v=>/);
  assert.match(src,/return;\s*\}\s*const estados=kind==='cxc'/);
  assert.match(src,/data-cxdet="cxc:/);
});

test('HF-20261012-25 CxC internal collection uses existing durable finance.account.apply with no bank claim',async()=>{
  const db=baseDb(),p=createFinanceCommandProvider({auth:new Auth(),db,policy}),id='account-cxc-oct';
  const accountPath='tenants/tenant-a/financeAccounts/'+id;
  db.seed(accountPath,{id,tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',kind:'cxc',
    country:'GT',pais:'GT',currency:'Q',moneda:'Q',concepto:'Cobro cliente',balance:75,saldo:75,monto:75,version:1,status:'open'});
  const cmd={version:'cxorbia-command-adapter-v1',commandType:'finance.account.apply',entityType:'financeAccount',
    tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',entityId:id,
    idempotencyKey:'hf25-internal-cxc-collect',expectedVersion:1,
    authorization:{providerEnforcementRequired:true,permission:'finance.account.apply'},
    payload:{accountId:id,amount:25,fecha:'2026-10-13',desc:'Cobro interno de prueba'}};
  const first=await p.execute('token',cmd);
  assert.equal(first.ok,true);assert.equal(first.providerAck,true);assert.equal(first.status,'committed');
  assert.equal(first.externalPaymentConfirmed,false);assert.equal(first.bankWrites,0);
  assert.equal(db.get(accountPath).balance,50);assert.equal(db.get(accountPath).version,2);
  const mov=first.movement;assert.equal(mov.tipo,'ingreso');assert.equal(mov.tipoIngreso,'cobro_cxc');
  assert.equal(mov.cashCollection,true);assert.equal(mov.revenueRecognized,false);
  assert.equal(mov.currency,'Q');assert.equal(mov.country,'GT');
  const replay=await p.execute('token',cmd);assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);
  assert.equal(replay.providerWrites,0);assert.equal(db.get(accountPath).balance,50);
  const wrong=await p.execute('token',{...cmd,idempotencyKey:'hf25-overdraw',expectedVersion:2,payload:{...cmd.payload,amount:100}});
  assert.equal(wrong.ok,false);assert.match(wrong.code,/FINANCE_ACCOUNT_APPLY_AMOUNT_INVALID/);
  assert.equal(db.get(accountPath).balance,50);
});

test('HF24 missing finance read provider fails closed instead of returning successful empty finances',async()=>{
  const source=fs.readFileSync(new URL('../../../../app/core/backend-cxdata-finance-read.js',import.meta.url),'utf8');
  const CX={BACKEND:{enabled:true},data:{},bus:{emit(){}}};
  const ctx={CX,window:{CX},document:{readyState:'complete'},Promise,console};
  vm.runInNewContext(source,ctx);
  const inputs={projectId:'project-a',periodId:'project-a-2026-10'};
  for(const name of ['getFinancialMovements','getFinanceAccounts','getFinanceBudgets']){
    const result=await CX.data[name](inputs);
    assert.equal(result.status,'blocked',name+' must never fake status ok');
    assert.equal(result.ok,false);
    assert.equal(result.code,'FINANCE_READ_PROVIDER_UNAVAILABLE');
    assert.equal(result.items.length,0);
  }
  CX.backendFinanceBenefits={
    getFinancialMovements:async()=>({items:[{id:'mov-a'}],status:'ok'}),
    getFinanceAccounts:async()=>({items:[],status:'ok'}),
    getFinanceBudgets:async()=>({items:[],status:'ok'})
  };
  const live=await CX.data.getFinancialMovements(inputs);
  assert.equal(live.status,'ok');assert.equal(live.items[0].id,'mov-a');
});

test('HF24 finance creation requires unique tenant scoped remote readback after provider ACK',()=>{
  const s=fs.readFileSync(new URL('../../../../app/modules/finanzas.js',import.meta.url),'utf8');
  const begin=s.indexOf('function cxFinanceCreatedReadback('),end=s.indexOf('/* END HF24 exact finance create readback */',begin);
  assert.ok(begin>0&&end>begin);
  const check=new Function(s.slice(begin,end)+'return cxFinanceCreatedReadback;')();
  const ack={ok:true,providerAck:true,entityId:'a-1',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10'};
  const row={id:'a-1',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',pais:'GT',currency:'Q',monto:125,kind:'cxc'};
  const match={country:'GT',currency:'Q',amount:125,kind:'cxc'};
  assert.equal(check(ack,[row],match),true);
  assert.equal(check(ack,[],match),false);
  assert.equal(check({...ack,providerAck:false},[row],match),false);
  assert.equal(check(ack,[row,row],match),false);
  assert.equal(check(ack,[{...row,periodId:'project-a-2026-09'}],match),false);
  assert.equal(check(ack,[{...row,currency:'L'}],match),false);
  assert.equal(check(ack,[{...row,monto:250}],match),false);
  assert.match(s,/FINANCE_MOVEMENT_READBACK_UNAVAILABLE/);
  assert.match(s,/FINANCE_MOVEMENT_READBACK_MISMATCH/);
  assert.match(s,/FINANCE_ACCOUNT_READBACK_UNAVAILABLE/);
  assert.match(s,/FINANCE_ACCOUNT_READBACK_MISMATCH/);
  assert.match(s,/Verifica antes de repetir/);
});

test('HF-20261012-25 B8 CxP internal abono never announces a confirmed external payment',()=>{
  const s=fs.readFileSync('app/modules/finanzas.js','utf8');
  assert.match(s,/Registrar abonos internos seleccionados/);
  assert.match(s,/confirmación bancaria\/externa pendiente/);
  assert.match(s,/Se actualizaron .* CxP en vista de demostración, sin confirmación durable/);
  assert.doesNotMatch(s,/CxP pagada\(s\) y confirmada\(s\)/);
  assert.match(s,/data\.applyFinanceAccount\(id,amount,\{ackAware:true/);
  assert.match(s,/if\(!\(ack\?\.ok&&ack\?\.providerAck\)\)throw new Error\('FINANCE_ACCOUNT_ACK_REQUIRED'\)/);
  const provider=fs.readFileSync('backend/runtime/cxorbia-finance-command-provider-v1.mjs','utf8');
  assert.match(provider,/externalPaymentConfirmed:false/);
});

test('I3 B8 budget safe provider ACK and canonical destination projects',()=>{
  const s=fs.readFileSync('app/modules/finanzas.js','utf8');
  const begin=s.indexOf('function cxFinanceCommandCommitted('),end=s.indexOf('/* HF-20261012-22:',begin);
  assert.ok(begin>=0&&end>begin,'the budget provider predicate must be in scope');
  const ack=new Function(s.slice(begin,end)+'return cxFinanceCommandCommitted;')();
  assert.equal(ack({ok:true,status:'committed',providerAck:true,successUiAllowed:true}),true);
  for(const r of [
    null,{ok:true,status:'committed',providerAck:false,successUiAllowed:true},
    {ok:true,status:'pending',providerAck:true,successUiAllowed:true},
    {ok:true,status:'committed',providerAck:true,successUiAllowed:false},
    {ok:false,status:'committed',providerAck:true,successUiAllowed:true}
  ])assert.equal(ack(r),false,'no budget UI success without remote ACK');
  assert.match(s,/if\(!cxFinanceCommandCommitted\(ack\)\)throw new Error\(String\(ack\?\.code\|\|'FINANCE_BUDGET_ACK_REQUIRED'\)\)/);
  assert.match(s,/if\(!cxFinanceCommandCommitted\(ack\)\)throw new Error\(String\(ack\?\.code\|\|'FINANCE_BUDGET_DELETE_ACK_REQUIRED'\)\)/);
  assert.match(s,/if\(!await refreshDurableFinance\(true\)\)throw new Error\('FINANCE_BUDGET_READBACK_UNAVAILABLE'\)/);
  assert.match(s,/typeof data\.programs==='function'\?data\.programs\(\):\[\]/);
  assert.match(s,/program\.key===canonicalProjectId\(\)/);
  assert.doesNotMatch(s,/\(data\.projects\|\|\[\]\)\.map\(pr=>`<option value=/);
  const actual=[{id:'cinepolis-2026-09',program:'cinepolis',name:'Cinépolis'},{id:'cinepolis-2026-10',program:'cinepolis',name:'Cinépolis'},{id:'otro-2026-10',program:'otro',name:'Otro'}];
  const distinct=[...new Map(actual.map(row=>[row.program,row.name])).entries()];
  assert.deepEqual(distinct,[['cinepolis','Cinépolis'],['otro','Otro']]);
});

test('R12 remote operating revenue does not count remittances, advances, financing or CxC recovery',()=>{
 const source=fs.readFileSync(new URL('../../../../app/modules/finanzas.js',import.meta.url),'utf8');
 const section=source.match(/function cxFinanceOperatingRevenueEligible\(m,providerBacked\)\{([\s\S]*?)\n\}/);
 assert.ok(section);
 const eligible=vm.runInNewContext('(function(m,providerBacked){'+section[1]+'\n})');
 for(const tipoIngreso of ['remesa','anticipo','financiamiento','cobro_cxc'])
   assert.equal(eligible({monto:7300,tipoIngreso,revenueRecognized:false,operatingRevenue:false},true),false);
 assert.equal(eligible({monto:123,tipoIngreso:'honorarios',revenueRecognized:true,operatingRevenue:true},true),true);
 assert.equal(eligible({monto:123,tipoIngreso:'honorarios',revenueRecognized:true},true),false);
 assert.equal(eligible({monto:-123,tipoIngreso:'honorarios',revenueRecognized:true,operatingRevenue:true},true),false);
 assert.match(source,/cxFinanceOperatingRevenueEligible\(m,connectedFinance\(\)\)/);
});
test('R09 ordinary finance screens use human explanations while preserving provider audit code',()=>{
 const source=fs.readFileSync(new URL('../../../../app/modules/finanzas.js',import.meta.url),'utf8');
 const match=source.match(/function cxFinanceFailureCopy\(code\)\{([\s\S]*?)\n\}/);
 assert.ok(match);
 const display=vm.runInNewContext('(function(code){'+match[1]+'\n})');
 assert.match(display('FINANCE_VISIT_NOT_SUBMITTED'),/todavía no fue submitida/);
 assert.doesNotMatch(display('UNKNOWN_TECH_404'),/UNKNOWN_TECH_404/);
 assert.match(source,/dataset\.providerResultCode/);
 assert.doesNotMatch(source,/textContent=status\+' · '\+code\+' · visita '/);
 assert.doesNotMatch(source,/ui\.toast\('Conciliación no confirmada · '\+diagnostic\.code/);
});

// C04: same financial command/provider contract, explicit administrative tenant scope.
function c04Environment({role='admin',entitlement='TYA_COMPLETE',countries=['GT','HN'],active=true,namespace='staff'}={}){
  const db=baseDb();
  db.seed('tenants/tenant-a/users/admin-1',{active,tenantId:'tenant-a',role,authNamespace:namespace,projectIds:['project-a'],countries,...(entitlement===undefined?{}:{entitlementMode:entitlement})});
  const auth={verifyIdToken:async()=>({uid:'admin-1',tenantId:'tenant-a',role,authNamespace:namespace,projectIds:['project-a']})};
  return {db,provider:createFinanceCommandProvider({auth,db,policy})};
}
function c04Command(type,{idempotencyKey=type+':c04-global',entityId=null,expectedVersion='absent',payload={},...extra}={}){
  const entityTypes={'finance.movement.create':'financialMovement','finance.account.create':'financeAccount','finance.account.apply':'financeAccount','finance.reconcile.visit':'financeReconciliation','finance.budget.save':'financeBudget'};
  const permissions={'finance.movement.create':'finance.movement.write','finance.account.create':'finance.account.write','finance.account.apply':'finance.account.apply','finance.reconcile.visit':'finance.reconcile','finance.budget.save':'finance.budget.write'};
  return {version:'cxorbia-command-adapter-v1',commandType:type,entityType:entityTypes[type],tenantId:'tenant-a',projectId:null,periodId:'2026-10',requireProject:false,requirePeriod:true,
    entityId,expectedVersion,idempotencyKey,authorization:{providerEnforcementRequired:true,permission:permissions[type]},
    payload:{global:true,periodId:'2026-10',kind:'cxc',tipo:'ingreso',tipoIngreso:'remesa',country:'GT',currency:'Q',amount:1,concepto:'C04 memory fixture',cat:'C04 memory fixture',fecha:'2026-10-29',...payload},...extra};
}

test('C04 project-scoped account and movement remain available to a project-limited Admin',async()=>{
  const {db,provider}=c04Environment({entitlement:'SPECIFIC_PROJECTS'});
  for(const type of ['finance.account.create','finance.movement.create']){
    const cmd=c04Command(type,{projectId:'project-a',requireProject:true,periodId:'project-a-2026-10',payload:{global:false,periodId:'project-a-2026-10'}});
    const result=await provider.execute('token',cmd);
    assert.equal(result.ok,true);assert.equal(result.projectId,'project-a');assert.equal(result.periodId,'project-a-2026-10');
    const row=result.account||result.movement;assert.notEqual(row.global,true);assert.equal(row.currency,'Q');
  }
  const before=clone([...db.s]);
  const wrongCurrency=c04Command('finance.movement.create',{idempotencyKey:'c04-project-wrong-currency',projectId:'project-a',requireProject:true,periodId:'project-a-2026-10',payload:{global:false,periodId:'project-a-2026-10',currency:'L'}});
  assert.equal((await provider.execute('token',wrongCurrency)).code,'FINANCE_MOVEMENT_CURRENCY_SCOPE_CONFLICT');assert.deepEqual([...db.s],before);
});

test('C04 Global movement/account use the tenant ledger, explicit country/currency and exact replay without bank or HR writes',async()=>{
  const {db,provider}=c04Environment(),beforeProject=clone(db.get('tenants/tenant-a/projects/project-a'));
  const gt=await provider.execute('token',c04Command('finance.movement.create',{idempotencyKey:'c04-gt',payload:{amount:1.25}}));
  const hn=await provider.execute('token',c04Command('finance.movement.create',{idempotencyKey:'c04-hn',payload:{country:'HN',currency:'L',amount:2.5}}));
  assert.equal(gt.ok,true);assert.equal(hn.ok,true);
  for(const result of [gt,hn]){
    assert.equal(result.projectId,null);assert.equal(result.periodId,'2026-10');
    assert.equal(result.externalPaymentConfirmed,false);assert.equal(result.bankWrites,0);
    const row=db.get('tenants/tenant-a/financialMovements/'+result.entityId);
    assert.equal(row.global,true);assert.equal(row.projectId,null);assert.equal(row.tenantId,'tenant-a');
    assert.equal(row.revenueRecognized,false);assert.equal(row.operatingRevenue,false);
    assert.equal(row.periodId,'2026-10');
  }
  assert.equal(gt.movement.currency,'Q');assert.equal(gt.movement.amount,1.25);
  assert.equal(hn.movement.currency,'L');assert.equal(hn.movement.amount,2.5);
  const cmd=c04Command('finance.account.create'),created=await provider.execute('token',cmd);
  assert.equal(created.ok,true);assert.equal(created.account.global,true);assert.equal(created.account.projectId,null);
  const snapshot=clone([...db.s]);
  const replay=await provider.execute('token',cmd);
  assert.equal(replay.ok,true);assert.equal(replay.idempotentReplay,true);assert.equal(replay.providerWrites,0);
  assert.deepEqual([...db.s],snapshot);
  const changed=await provider.execute('token',{...cmd,payload:{...cmd.payload,amount:2}});
  assert.equal(changed.ok,false);assert.match(changed.code,/IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD/);assert.equal(changed.providerWrites,0);
  assert.deepEqual(db.get('tenants/tenant-a/projects/project-a'),beforeProject);
  assert.equal([...db.s.keys()].filter(path=>path.includes('/visits/')).length,1);
});

test('C04 Global financing remains non-operating and creates only a linked Global CxP',async()=>{
  const {db,provider}=c04Environment();
  const result=await provider.execute('token',c04Command('finance.movement.create',{payload:{tipoIngreso:'financiamiento',amount:4.25}}));
  assert.equal(result.ok,true);assert.equal(result.movement.nonOperating,true);assert.equal(result.movement.revenueRecognized,false);
  const account=db.get('tenants/tenant-a/financeAccounts/'+result.linkedAccount.id);
  assert.equal(account.global,true);assert.equal(account.projectId,null);assert.equal(account.periodId,'2026-10');
  assert.equal(account.kind,'cxp');assert.equal(account.sourceMovementId,result.movement.id);assert.equal(account.balance,4.25);
  assert.equal(account.country,'GT');assert.equal(account.currency,'Q');
});

test('C04 Global collection changes only the exact account and replay preserves balance/version/movement',async()=>{
  const {db,provider}=c04Environment();
  const created=await provider.execute('token',c04Command('finance.account.create'));
  const other=await provider.execute('token',c04Command('finance.account.create',{idempotencyKey:'c04-other-account',payload:{country:'HN',currency:'L',amount:3}}));
  assert.equal(created.ok,true);assert.equal(other.ok,true);
  const beforeOther=clone(db.get('tenants/tenant-a/financeAccounts/'+other.entityId));
  const cmd=c04Command('finance.account.apply',{entityId:created.entityId,expectedVersion:created.account.updatedAt,payload:{accountId:created.entityId,amount:0.4}});
  const applied=await provider.execute('token',cmd);
  assert.equal(applied.ok,true);assert.equal(applied.account.balance,0.6);assert.equal(applied.account.version,1);
  assert.equal(applied.movement.global,true);assert.equal(applied.movement.accountId,created.entityId);
  assert.equal(applied.movement.revenueRecognized,false);assert.equal(applied.movement.operatingRevenue,false);assert.equal(applied.externalPaymentConfirmed,false);
  const after=clone([...db.s]),replay=await provider.execute('token',cmd);
  assert.equal(replay.ok,true);assert.equal(replay.providerWrites,0);assert.deepEqual([...db.s],after);
  assert.deepEqual(db.get('tenants/tenant-a/financeAccounts/'+other.entityId),beforeOther);
  const stale=await provider.execute('token',{...cmd,idempotencyKey:'c04-stale'});
  assert.equal(stale.ok,false);assert.match(stale.code,/EXPECTED_VERSION_CONFLICT/);assert.deepEqual([...db.s],after);
});

test('C04 Global is denied for project-only/missing entitlements, disallowed roles, inactive membership and country restriction',async t=>{
  const cases=[
    ['specific-projects',{entitlement:'SPECIFIC_PROJECTS'},{},'FINANCE_ACTOR_TENANT_ENTITLEMENT_REQUIRED'],
    ['missing-entitlement',{entitlement:null},{},'FINANCE_ACTOR_TENANT_ENTITLEMENT_REQUIRED'],
    ['ops',{role:'ops'},{},'FINANCE_ACTOR_SCOPE_DENIED'],
    ['coordinador',{role:'coordinador'},{},'FINANCE_ACTOR_SCOPE_DENIED'],
    ['shopper',{role:'shopper',namespace:'shopper'},{},'FINANCE_ACTOR_SCOPE_DENIED'],
    ['client',{role:'cliente',namespace:'client'},{},'FINANCE_ACTOR_SCOPE_DENIED'],
    ['inactive',{active:false},{},'FINANCE_ACTOR_MEMBERSHIP_INVALID'],
    ['country',{countries:['GT']},{country:'HN',currency:'L'},'FINANCE_ACTOR_COUNTRY_DENIED'],
  ];
  for(const [label,env,payload,code] of cases)await t.test(label,async()=>{
    const {db,provider}=c04Environment(env),before=clone([...db.s]);
    if(label==='missing-entitlement'){const m=db.get('tenants/tenant-a/users/admin-1');delete m.entitlementMode;db.seed('tenants/tenant-a/users/admin-1',m);}
    const actualBefore=clone([...db.s]);
    const result=await provider.execute('token',c04Command('finance.account.create',{payload}));
    assert.equal(result.ok,false);assert.equal(result.code,code);assert.equal(result.providerWrites,0);assert.deepEqual([...db.s],actualBefore);
  });
});

test('C04 Global never bypasses project command scope, tenant allowlist, version or project-only visit/budget contracts',async t=>{
  const cases=[
    ['missing-global',c04Command('finance.movement.create',{payload:{global:false}})],
    ['fake-global-project',c04Command('finance.movement.create',{projectId:'__global__'})],
    ['global-with-project',c04Command('finance.movement.create',{projectId:'project-a'})],
    ['global-wrong-period',c04Command('finance.movement.create',{periodId:'project-a-2026-10'})],
    ['global-payload-period',c04Command('finance.movement.create',{payload:{periodId:'2026-09'}})],
    ['global-date-period',c04Command('finance.movement.create',{payload:{fecha:'2026-09-29'}})],
    ['global-no-date',c04Command('finance.movement.create',{payload:{fecha:null}})],
    ['global-invalid-date',c04Command('finance.movement.create',{payload:{fecha:'2026-10-32'}})],
    ['global-project-destination',c04Command('finance.movement.create',{payload:{proyectoId:'project-a'}})],
    ['global-visit-link',c04Command('finance.account.create',{payload:{visitId:'visit-a'}})],
    ['global-unbounded-version',c04Command('finance.account.apply',{entityId:'account-a',expectedVersion:'source-current'})],
    ['global-budget',c04Command('finance.budget.save')],
    ['global-reconcile',c04Command('finance.reconcile.visit',{entityId:'visit-a',payload:{visitId:'visit-a'}})],
    ['foreign-tenant',c04Command('finance.movement.create',{tenantId:'tenant-b'})],
    ['project-policy-still-denied',c04Command('finance.movement.create',{projectId:'project-b',requireProject:true,periodId:'project-b-2026-10',payload:{global:false,periodId:'project-b-2026-10'}})],
  ];
  for(const [label,cmd] of cases)await t.test(label,async()=>{
    const {db,provider}=c04Environment(),before=clone([...db.s]);
    const result=await provider.execute('token',cmd);
    assert.equal(result.ok,false,label);assert.equal(result.providerWrites,0,label);assert.deepEqual([...db.s],before,label);
  });
  const {db,provider}=c04Environment({role:'super',entitlement:null});
  const accepted=await provider.execute('token',c04Command('finance.movement.create'));
  assert.equal(accepted.ok,true);assert.equal(accepted.projectId,null);
});

test('C04 Global account application refuses wrong account tenant/project/month/marker and country',async t=>{
  const variations=[['tenant',{tenantId:'tenant-b'}],['project',{projectId:'project-a'}],['period',{periodId:'2026-09'}],['marker',{global:false}],['country',{country:'HN',pais:'HN',currency:'L',moneda:'L'}],['internal-id',{id:'other'}],['missing-id',{id:undefined}]];
  for(const [label,patch] of variations)await t.test(label,async()=>{
    const {db,provider}=c04Environment({countries:['GT']});
    db.seed('tenants/tenant-a/financeAccounts/c04-account',{id:'c04-account',tenantId:'tenant-a',projectId:null,global:true,periodId:'2026-10',kind:'cxc',country:'GT',pais:'GT',currency:'Q',moneda:'Q',balance:1,saldo:1,version:1,...patch});
    const before=clone([...db.s]);
    const result=await provider.execute('token',c04Command('finance.account.apply',{entityId:'c04-account',expectedVersion:1,payload:{accountId:'c04-account',amount:0.25}}));
    assert.equal(result.ok,false);assert.equal(result.providerWrites,0);assert.deepEqual([...db.s],before);
  });
});

function c04BrowserBoundary(){
  const commands=[];
  const CX={BACKEND:{enabled:true,enableCommandWrites:true,tenantId:'tenant-a'},
    backendAuth:{context:()=>({authenticated:true,tenantId:'tenant-a',role:'admin',authNamespace:'staff',actorId:'admin-1',projectIds:['project-a']})},
    session:{user:{id:'admin-1',tenantId:'tenant-a',role:'admin',projectIds:['project-a']}},bus:{on(){},emit(){}},
    data:{ctx:()=>({tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10'}),currentProjectId:'project-a',currentPeriodId:'project-a-2026-10'}};
  const context={CX,console,document:{readyState:'complete'},setTimeout:()=>0,queueMicrotask:()=>{},addEventListener(){}};context.window=context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL('../../../../app/adapters/cxorbia-command-adapter-v1.js',import.meta.url),'utf8'),context);
  CX.commandAdapter.registerTransport('memory',{execute:async command=>{commands.push(clone(command));return {ok:true,status:'committed',providerAck:true,successUiAllowed:true,projectId:command.projectId,periodId:command.periodId};}});
  CX.commandAdapter.useTransport('memory');
  vm.runInContext(fs.readFileSync(new URL('../../../../app/adapters/cxorbia-cxdata-command-boundary-v1.js',import.meta.url),'utf8'),context);
  return {CX,commands};
}

test('C04 command boundary carries explicit Global scope and keeps project cache/commands independent',async()=>{
  const {CX,commands}=c04BrowserBoundary(),body={tipo:'ingreso',tipoIngreso:'remesa',country:'GT',currency:'Q',amount:1,fecha:'2026-10-29'};
  const global=await CX.data.createFinancialMovement(body,{ackAware:true,global:true,periodId:'2026-10'});
  await CX.data.createFinancialMovement(body,{ackAware:true});
  assert.equal(global.projectId,null);assert.equal(commands[0].projectId,null);assert.equal(commands[0].periodId,'2026-10');assert.equal(commands[0].payload.periodId,'2026-10');
  assert.equal(commands[0].payload.global,true);assert.equal(commands[0].requireProject,false);
  assert.equal(commands[1].projectId,'project-a');assert.equal(commands[1].periodId,'project-a-2026-10');assert.equal(commands[1].requireProject,true);
  assert.notEqual(commands[0].idempotencyKey,commands[1].idempotencyKey);
  CX.data.__financeAccounts=[{id:'account-a',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',version:99}];
  CX.data.__globalFinanceAccounts=[{id:'account-a',tenantId:'tenant-a',projectId:null,periodId:'2026-10',global:true,version:2}];
  await CX.data.applyFinanceAccount('account-a',0.4,{ackAware:true,global:true,periodId:'2026-10',fecha:'2026-10-29'});
  assert.equal(commands.at(-1).expectedVersion,2);assert.equal(commands.at(-1).projectId,null);
  CX.data.__globalFinanceAccounts=[];
  const count=commands.length,rejected=await CX.data.applyFinanceAccount('account-a',0.4,{ackAware:true,global:true,periodId:'2026-10',fecha:'2026-10-29'});
  assert.equal(rejected.ok,false);assert.equal(rejected.code,'FINANCE_ACCOUNT_SOURCE_READ_REQUIRED');assert.equal(commands.length,count);
  assert.equal(CX.data.__financeAccounts[0].version,99);
});

function c04Reader(rows,metadata={fromCache:false,hasPendingWrites:false}){
  const queries=[];
  class Query{
    constructor(path,filters=[]){this.path=path;this.filters=filters;}
    collection(name){return new Query(this.path+'/'+name);}
    doc(id){return new Query(this.path+'/'+id);}
    where(field,op,value){assert.equal(op,'==');return new Query(this.path,[...this.filters,[field,value]]);}
    async get(options){queries.push({path:this.path,filters:clone(this.filters),options:clone(options)});return {metadata,docs:rows.filter(r=>this.filters.every(([field,value])=>r.data[field]===value)).map(r=>({id:r.id,data:()=>clone(r.data)}))};}
  }
  const CX={BACKEND:{tenantId:'tenant-a'},backend:{tenantId:()=> 'tenant-a'},bus:{emit(){}}};
  const firebase={apps:[{}],firestore:()=>({collection:name=>new Query(name)})};
  const context={CX,firebase,console:{warn(){}}};context.window=context;
  vm.runInNewContext(fs.readFileSync(new URL('../../../../app/core/backend-finance-benefits.js',import.meta.url),'utf8'),context);
  return {reader:CX.backendFinanceBenefits,queries};
}

test('C04 Global reader filters Global-only/month and requires server-confirmed snapshot without pending local writes',async t=>{
  const rows=[
    {id:'global-q',data:{id:'global-q',tenantId:'tenant-a',projectId:null,periodId:'2026-10',global:true,country:'GT',currency:'Q',amount:1.25}},
    {id:'global-l',data:{id:'global-l',tenantId:'tenant-a',projectId:null,periodId:'2026-10',global:true,country:'HN',currency:'L',amount:2.5}},
    {id:'project',data:{id:'project',tenantId:'tenant-a',projectId:'project-a',periodId:'2026-10',country:'GT',currency:'Q',amount:99}},
    {id:'prior',data:{id:'prior',tenantId:'tenant-a',projectId:null,periodId:'2026-09',global:true,country:'GT',currency:'Q',amount:88}},
  ];
  for(const method of ['getFinancialMovements','getFinanceAccounts']){
    const {reader,queries}=c04Reader(rows),result=await reader[method]({global:true,projectId:null,periodId:'2026-10'});
    assert.equal(result.status,'ok');assert.deepEqual(Array.from(result.items,r=>r.id),['global-q','global-l']);
    assert.deepEqual(queries[0].options,{source:'server'});
    assert.deepEqual(queries[0].filters,[['global',true],['projectId',null],['periodId','2026-10']]);
    const project=await reader[method]({projectId:'project-a',periodId:'2026-10'});
    assert.deepEqual(Array.from(project.items,r=>r.id),['project']);assert.equal(queries[1].options,undefined);
  }
  for(const metadata of [{fromCache:true,hasPendingWrites:false},{fromCache:false,hasPendingWrites:true},{}])await t.test(JSON.stringify(metadata),async()=>{
    const result=await c04Reader(rows,metadata).reader.getFinanceAccounts({global:true,projectId:null,periodId:'2026-10'});
    assert.equal(result.status,'error');assert.ok(result.errors.includes('FINANCE_GLOBAL_REMOTE_READ_REQUIRED'));assert.equal(result.items.length,0);
  });
  for(const patch of [{tenantId:'tenant-b'},{id:'hidden-other-id'},{id:undefined}]){
    const invalid=clone(rows);Object.assign(invalid[0].data,patch);
    const result=await c04Reader(invalid).reader.getFinancialMovements({global:true,projectId:null,periodId:'2026-10'});
    assert.equal(result.status,'error');assert.ok(result.errors.includes('FINANCE_GLOBAL_READ_SCOPE_MISMATCH'));
  }
  const malformed=await c04Reader(rows).reader.getFinanceAccounts({global:true,projectId:'project-a',periodId:'2026-10'});
  assert.equal(malformed.status,'error');assert.ok(malformed.errors.includes('FINANCE_GLOBAL_READ_SCOPE_REQUIRED'));
});

test('C04 Global UI currency/month/readback preserve actual row scope, cents and linked account update',()=>{
  const source=fs.readFileSync(new URL('../../../../app/modules/finanzas.js',import.meta.url),'utf8');
  const start=source.indexOf('function cxFinanceExplicitCurrency('),end=source.indexOf('/* END HF24 exact finance create readback */',start);
  assert.ok(start>0&&end>start);
  const context={};vm.createContext(context);
  vm.runInContext("function cxFinanceCommandCommitted(r){return r?.ok===true&&r?.status==='committed'&&r?.providerAck===true&&r?.successUiAllowed===true;}\n"+source.slice(start,end),context);
  const p={currency:{GT:'Q',HN:'L'}};
  assert.equal(context.cxFinanceRowCurrency({country:'GT',currency:'USD'},p,true),'USD');
  assert.equal(context.cxFinanceRowCurrency({country:'HN',currency:'L'},p,true),'L');
  assert.equal(context.cxFinanceRowCurrency({country:'GT'},p,true),'pending_currency');
  assert.equal(context.cxFinanceGlobalMonth({periodKey:'2026-10'},'project-a-2026-10'),'2026-10');
  assert.equal(context.cxFinanceGlobalMonth({},'unknown'),null);
  const before={id:'account-a',kind:'cxc',country:'GT',currency:'Q',balance:1};
  const account={...before,global:true,projectId:null,periodId:'2026-10',tenantId:'tenant-a',balance:0.6,version:2,lastMovementId:'movement-a'};
  const movement={id:'movement-a',global:true,projectId:null,periodId:'2026-10',tenantId:'tenant-a',accountId:'account-a',country:'GT',currency:'Q',amount:0.4,revenueRecognized:false,operatingRevenue:false};
  const ack={ok:true,status:'committed',providerAck:true,successUiAllowed:true,tenantId:'tenant-a',projectId:null,periodId:'2026-10',entityId:'account-a',account,movement};
  assert.equal(context.cxFinanceGlobalApplyReadback(ack,[account],[movement],before,0.4),true);
  for(const patch of [{global:false},{projectId:'project-a'},{periodId:'2026-09'},{currency:'L'},{country:'HN'},{version:3},{balance:0.61},{lastMovementId:'other'}])assert.equal(context.cxFinanceGlobalApplyReadback(ack,[{...account,...patch}],[movement],before,0.4),false);
  assert.equal(context.cxFinanceGlobalApplyReadback(ack,[account,account],[movement],before,0.4),false);
  assert.equal(context.cxFinanceGlobalApplyReadback(ack,[account],[],before,0.4),false);
  assert.equal(context.cxFinanceGlobalApplyReadback({...ack,account:{...account,id:'other'}},[account],[movement],before,0.4),false);
  assert.equal(context.cxFinanceGlobalApplyReadback({...ack,movement:{...movement,accountId:'other'}},[account],[movement],before,0.4),false);
  assert.equal(context.cxFinanceGlobalApplyReadback({...ack,account:{...account,global:false}},[account],[movement],before,0.4),false);
  const createAck={...ack,entityId:'movement-a'},row={...movement,monto:0.4};
  assert.equal(context.cxFinanceCreatedReadback(createAck,[row],{country:'GT',currency:'Q',amount:0.4,global:true}),true);
  assert.equal(context.cxFinanceCreatedReadback(createAck,[{...row,global:false}],{country:'GT',currency:'Q',amount:0.4,global:true}),false);
  assert.equal(context.cxFinanceCreatedReadback(createAck,[row],{country:'GT',currency:'Q',amount:0.4,global:true,sourceMovementId:'required-link'}),false);
  assert.equal(context.cxFinanceCreatedReadback(createAck,[{...row,sourceMovementId:'required-link'}],{country:'GT',currency:'Q',amount:0.4,global:true,sourceMovementId:'required-link'}),true);
});

function c04MovementView({failGlobal=false,globalRows}={}){
  // The real module renders and binds its scope/export events; this tiny host is
  // a DOM test double, not a live browser or a provider authentication proof.
  class Element{
    constructor(dataset={}){this.dataset=dataset;this.handlers={};this._html='';}
    set innerHTML(v){this._html=String(v);this.nodes={};}
    get innerHTML(){return this._html;}
    addEventListener(name,fn){this.handlers[name]=fn;}
    async click(){return this.handlers.click?.({preventDefault(){}});}
    querySelectorAll(selector){
      if(selector==='[data-scope]')return ['proyecto','global'].map(value=>this.nodes[value]||(this.nodes[value]=new Element({scope:value})));
      return [];
    }
    querySelector(selector){
      if(selector==='#movExport'&&this._html.includes('id="movExport"'))return this.nodes.export||(this.nodes.export=new Element());
      return null;
    }
  }
  const modules={},queries=[],reports=[],localCalls=[],toasts=[];
  const project={id:'project-a-2026-10',projectId:'project-a',periodKey:'2026-10',name:'Project October',countries:['GT','HN'],currency:{GT:'Q',HN:'L'}};
  const projectRows=[{id:'project-movement',tenantId:'tenant-a',projectId:'project-a',periodId:'project-a-2026-10',pais:'GT',country:'GT',currency:'Q',moneda:'Q',monto:99,amount:99,fecha:'2026-10-29',tipo:'ingreso',tipoIngreso:'remesa',cat:'Project only',revenueRecognized:false,operatingRevenue:false}];
  const globals=globalRows||[
    {id:'global-q',tenantId:'tenant-a',projectId:null,periodId:'2026-10',global:true,pais:'GT',country:'GT',currency:'Q',moneda:'Q',monto:1.25,amount:1.25,fecha:'2026-10-29',tipo:'ingreso',tipoIngreso:'remesa',cat:'Global Q',revenueRecognized:false,operatingRevenue:false},
    {id:'global-l',tenantId:'tenant-a',projectId:null,periodId:'2026-10',global:true,pais:'HN',country:'HN',currency:'L',moneda:'L',monto:2.5,amount:2.5,fecha:'2026-10-29',tipo:'ingreso',tipoIngreso:'remesa',cat:'Global L',revenueRecognized:false,operatingRevenue:false}
  ];
  const data={currentProjectId:'project-a',currentPeriodId:'project-a-2026-10',tenantId:()=> 'tenant-a',period:()=>project,
    async getFinancialMovements(req){queries.push({kind:'movements',...clone(req)});return {status:req.global&&failGlobal?'error':'ok',items:clone(req.global?globals:projectRows)};},
    async getFinanceAccounts(req){queries.push({kind:'accounts',...clone(req)});return {status:req.global&&failGlobal?'error':'ok',items:[]};},
    async getFinanceBudgets(req){queries.push({kind:'budgets',...clone(req)});return {status:'ok',items:[]};},_visitas:[]};
  const ui={el:()=>new Element(),ph:(...v)=>v.join(' '),empty:(...v)=>v.join(' '),money:(c,v)=>c+' '+Number(v).toFixed(2),kpi:(...v)=>v.join(' '),bdg:(...v)=>v.join(' '),aiBox:(...v)=>v.join(' '),toast:(...v)=>toasts.push(v)};
  const finStore={GLOBAL:'__global__',CATEGORIAS:[],TIPOS_INGRESO:{remesa:'Remesa'},TIPOS_EGRESO:{},_mov:{__global__:[{monto:7300,currency:'Q'}]},_cxp:{},_cxc:{},_fin:{}};
  for(const k of ['mov','cxp','cxc','financiamientos'])finStore[k]=()=>{localCalls.push(k);return [];};
  const CX={BACKEND:{enabled:true,tenantId:'tenant-a'},data,dataSource:{showFixtures:()=>false},module:(name,fn)=>{modules[name]=fn;},finStore,
    bus:{on(){},emit(){}},fin:{canonPeriods:()=>[{id:'project-a-2026-10',label:'October'}],canonCurrentId:()=>data.currentPeriodId},liq:{forProject:()=>[]},reportKit:{openReport:spec=>reports.push(spec)}};
  const context={CX,console,setTimeout:()=>0,document:{},CX_TENANT_RUNTIME_CONFIG:{tenantId:'tenant-a',countries:['GT','HN']}};context.window=context;
  vm.runInNewContext(fs.readFileSync(new URL('../../../../app/modules/finanzas.js',import.meta.url),'utf8'),context);
  const host=modules.movimientos({data,ui});
  return {host,data,queries,reports,localCalls,toasts,globals};
}

test('C04 real Movimientos draw/scope/export use isolated remote ledgers, never the legacy local balance',async()=>{
  const v=c04MovementView();await new Promise(resolve=>setImmediate(resolve));
  assert.match(v.host.innerHTML,/Project only/);assert.doesNotMatch(v.host.innerHTML,/Global Q/);
  const projectCache=v.data.__financialMovements;
  const projectBudgetReader=v.data.getFinanceBudgets;delete v.data.getFinanceBudgets;
  await v.host.querySelectorAll('[data-scope]')[1].click();await new Promise(resolve=>setImmediate(resolve));
  assert.match(v.host.innerHTML,/Global Q/);assert.match(v.host.innerHTML,/Global L/);assert.doesNotMatch(v.host.innerHTML,/Project only|7300/);
  assert.match(v.host.innerHTML,/Hay 1 registros heredados/);
  assert.deepEqual(v.localCalls,[]);assert.equal(v.data.__financialMovements,projectCache);
  assert.deepEqual(v.queries.filter(q=>q.global).map(q=>[q.kind,q.projectId,q.periodId]),[['movements',null,'2026-10'],['accounts',null,'2026-10']]);
  await v.host.querySelector('#movExport').click();
  const report=v.reports[0];assert.equal(report.meta.scope,'Global');assert.equal(report.meta.period,'2026-10');assert.match(report.filename,/movimientos_global_2026-10_/);
  assert.deepEqual(Array.from(report.rows,r=>[r.moneda,r.monto]),[['Q',1.25],['L',2.5]]);
  assert.deepEqual(Array.from(report.chart.data,r=>[r.label,r.value]),[['Q · Ingreso',1.25],['L · Ingreso',2.5]]);
  assert.equal(report.chart.perCurrency.Q.Ingreso,1.25);assert.equal(report.chart.perCurrency.L.Ingreso,2.5);
  assert.ok(report.summary.some(line=>line.includes('Q — Ingresos oper.: Q 0.00')));
  assert.ok(report.summary.some(line=>line.includes('L — Ingresos oper.: L 0.00')));
  v.data.getFinanceBudgets=projectBudgetReader;
  await v.host.querySelectorAll('[data-scope]')[0].click();await new Promise(resolve=>setImmediate(resolve));
  assert.match(v.host.innerHTML,/Project only/);assert.doesNotMatch(v.host.innerHTML,/Global Q|Global L/);
  assert.equal(v.data.__financialMovements,projectCache);assert.deepEqual(v.localCalls,[]);
});

test('C04 failed Global read shows no monetary fallback and currency keys cannot corrupt aggregation',async()=>{
  const failed=c04MovementView({failGlobal:true});await new Promise(resolve=>setImmediate(resolve));
  await failed.host.querySelectorAll('[data-scope]')[1].click();await new Promise(resolve=>setImmediate(resolve));
  assert.match(failed.host.innerHTML,/No se pudo confirmar la lectura remota/);assert.doesNotMatch(failed.host.innerHTML,/Global Q|7300|Ingresos oper\./);assert.deepEqual(failed.localCalls,[]);
  const sample=c04MovementView().globals[0];
  const keys=c04MovementView({globalRows:['__proto__','constructor'].map((currency,i)=>({...sample,id:'key-'+i,currency,moneda:currency,cat:'Key '+i}))});
  await new Promise(resolve=>setImmediate(resolve));await keys.host.querySelectorAll('[data-scope]')[1].click();await new Promise(resolve=>setImmediate(resolve));
  await keys.host.querySelector('#movExport').click();
  const report=keys.reports[0];assert.equal(report.chart.perCurrency.__proto__.Ingreso,1.25);assert.equal(report.chart.perCurrency.constructor.Ingreso,1.25);
  assert.deepEqual(Array.from(report.chart.data,r=>r.value),[1.25,1.25]);
});
