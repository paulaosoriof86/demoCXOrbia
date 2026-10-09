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
