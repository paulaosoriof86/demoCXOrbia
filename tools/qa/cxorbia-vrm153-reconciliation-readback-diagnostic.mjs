#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const PROJECT=process.env.PROJECT||'cxorbia-backend-dev',TENANT=process.env.TENANT_ID||'tya',PROGRAM=process.env.PROJECT_ID||'cinepolis';
const OUT=process.env.OUT||'.tmp/vrm153-readback',DRY=process.env.DRY_RESULT||OUT+'/dry/result.json';
const HR_URL=process.env.HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&vrm153=readback';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROGRAM);
const dry=JSON.parse(fs.readFileSync(DRY,'utf8'));
if(dry.decision!=='PASS_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN')throw new Error('VRM153_REQUIRES_PASS_DRY_RUN');
const batches=arr(dry.batches),batchIds=new Set(batches.map(b=>'hist-'+PROGRAM+'-'+str(b.period)+'-'+str(b.paymentStatus)+'-scope-v1'));
const expectedStatus=new Map(),expectedReview=new Set(arr(dry.amountReviewRows).map(r=>str(r.visitId)));
for(const b of batches)for(const id of arr(b.visitIds))expectedStatus.set(str(id),str(b.paymentStatus));
const recSnap=await tenant.collection('paymentReconciliations').get();
const recs=recSnap.docs.map(x=>({id:x.id,...(x.data()||{})})).filter(r=>batchIds.has(str(r.reconciliationBatchId)));
const persistedReview=new Set(recs.filter(r=>r.amountReviewRequired===true).map(r=>str(r.visitId)));
const statusMismatches=recs.filter(r=>expectedStatus.get(str(r.visitId))!==str(r.paymentStatus)).map(r=>({visitId:str(r.visitId),expected:expectedStatus.get(str(r.visitId)),observed:str(r.paymentStatus)}));
const reviewExtra=[...persistedReview].filter(id=>!expectedReview.has(id));
const reviewMissing=[...expectedReview].filter(id=>!persistedReview.has(id));
const mismatchIds=[...new Set([...statusMismatches.map(x=>x.visitId),...reviewExtra,...reviewMissing])];
const hrRes=await fetch(HR_URL,{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
if(!hrRes.ok)throw new Error('VRM153_HR_HTTP_'+hrRes.status);
const hr=await hrRes.json(),hrById=new Map(arr(hr.visits).map(v=>[str(v.id||v.visitId),v]));
const recById=new Map(recs.map(r=>[str(r.visitId),r]));
const details=[];
for(const id of mismatchIds){
 const rec=recById.get(id)||{},docId=str(rec.durableVisitId||id),snap=await project.collection('visits').doc(docId).get(),v=snap.exists?(snap.data()||{}):{},h=hrById.get(id)||{};
 details.push({visitId:id,durableVisitId:docId,expectedStatus:expectedStatus.get(id)||null,persistedStatus:str(rec.paymentStatus)||null,expectedReview:expectedReview.has(id),persistedReview:persistedReview.has(id),persistedReviewReasons:arr(rec.reviewReasons),persistedAmount:rec.amount??null,firestore:{boleto:v.boleto??null,comboAmt:v.comboAmt??null,reimbursementSourceComplete:v.reimbursementSourceComplete??null,reimbursementPartial:v.reimbursementPartial??null,honorario:v.honorario??null,honorarioSource:v.honorarioSource??null},hr:{boleto:h.boleto??null,comboAmt:h.comboAmt??null,reimbursementSourceComplete:h.reimbursementSourceComplete??null,reimbursementPartial:h.reimbursementPartial??null,honorario:h.honorario??null,honorarioSource:h.honorarioSource??null}});
}
/* VRM-153: a partial reconciliation batch must NOT be called PASS.
   Compare all expected visit IDs from the same live HR revision, read-only. */
const allRecon=recSnap.docs.map(x=>({id:x.id,...(x.data()||{})}));
const activeByVisit=new Map();
for(const rec of allRecon){
  const id=str(rec.visitId);
  if(!expectedStatus.has(id)||str(rec.tenantId)!==TENANT||str(rec.projectId)!==PROGRAM
     ||str(rec.source)!=='historical_reconciliation'||rec.active===false||rec.superseded===true)continue;
  if(!activeByVisit.has(id))activeByVisit.set(id,[]);
  activeByVisit.get(id).push(str(rec.reconciliationBatchId));
}
const activeHistoricalDuplicates=[...activeByVisit].filter(([,batches])=>batches.length>1)
  .map(([visitId,batches])=>({visitId,batches}));
const persistedIds=new Set(recs.map(r=>str(r.visitId)));
const expectedGroupById=new Map();
for(const g of arr(dry.grouped))for(const ref of arr(g.visitRefs))
  expectedGroupById.set(str(ref.visitId),{period:str(g.period),country:str(g.country),hrRowId:str(ref.hrRowId)});
const missingRows=[...expectedStatus.entries()].filter(([id])=>!persistedIds.has(id)).map(([visitId,status])=>{
  const group=expectedGroupById.get(visitId)||{},h=hrById.get(visitId)||{};
  const otherBatches=allRecon.filter(r=>str(r.visitId)===visitId&&!batchIds.has(str(r.reconciliationBatchId)))
    .map(r=>({reconciliationBatchId:str(r.reconciliationBatchId),paymentStatus:str(r.paymentStatus)}));
  return {visitId,period:group.period||'',country:group.country||'',
    expectedStatus:status,hrRowId:group.hrRowId||str(h.hrRowId),
    presentInOtherBatch:otherBatches.length>0,otherBatches};
});
const unexpectedScopeRows=recs.filter(r=>!expectedStatus.has(str(r.visitId)))
  .map(r=>({visitId:str(r.visitId),paymentStatus:str(r.paymentStatus),reconciliationBatchId:str(r.reconciliationBatchId)}));
const missingByStatus={paid:missingRows.filter(x=>x.expectedStatus==='paid').length,
  pending:missingRows.filter(x=>x.expectedStatus==='pending').length};
const missingByPeriodCountry={};
for(const row of missingRows){const k=[row.period,row.country,row.expectedStatus].join('|');
  missingByPeriodCountry[k]=(missingByPeriodCountry[k]||0)+1;}
const paid=recs.filter(r=>str(r.paymentStatus)==='paid').length,pending=recs.filter(r=>str(r.paymentStatus)==='pending').length,review=persistedReview.size;
const counts={records:recs.length,uniqueVisits:persistedIds.size,paid,pending,amountReviewRequired:review,
 expectedRecords:dry.expected?.canonicalSubmitted??null,expectedPaid:dry.expected?.paid??null,
 expectedPending:dry.expected?.pending??null,expectedAmountReviewRequired:dry.expected?.amountReviewRequired??null,
 missingExactVisits:missingRows.length,unexpectedInScope:unexpectedScopeRows.length};
const fullPass=!statusMismatches.length&&!reviewExtra.length&&!reviewMissing.length
 &&!missingRows.length&&!unexpectedScopeRows.length&&!activeHistoricalDuplicates.length
 &&str(dry.sourceRevision)===str(hr.revision||hr.sourceRevision)
 &&counts.records===counts.expectedRecords&&counts.uniqueVisits===counts.expectedRecords
 &&paid===counts.expectedPaid&&pending===counts.expectedPending
 &&review===counts.expectedAmountReviewRequired;

/* Read-only VRM-153 preflight. No command execution and no Firestore writes. */
async function exactPreflight(row){
  const priorScope=arr(row.otherBatches).filter(x=>str(x.paymentStatus)==='pending');
  const isSupersession=row.expectedStatus==='paid'&&priorScope.length===1;
  const candidates=[str(row.visitId),str(row.hrRowId)].filter((x,i,a)=>x&&a.indexOf(x)===i);
  let snap=null;
  for(const id of candidates){
    const s=await project.collection('visits').doc(id).get();
    if(s.exists){snap=s;break;}
  }
  const v=snap?.exists?(snap.data()||{}):{},h=hrById.get(row.visitId)||{};
  const priorBatchId=isSupersession?str(priorScope[0].reconciliationBatchId):null;
  const priorRecords=isSupersession?allRecon.filter(r=>str(r.visitId)===str(row.visitId)&&str(r.reconciliationBatchId)===priorBatchId):[];
  const prior=priorRecords.length===1?priorRecords[0]:null;
  const blockers=[];
  if(!snap?.exists)blockers.push('CANONICAL_VISIT_DOCUMENT_NOT_FOUND');
  if(!str(v.shopperId))blockers.push('SHOPPER_ID_NOT_DURABLE');
  if(!h||!str(h.id||h.visitId))blockers.push('LIVE_HR_VISIT_NOT_FOUND');
  if(isSupersession){
    if(!prior)blockers.push('EXACT_PREVIOUS_RECONCILIATION_NOT_UNIQUE');
    if(prior&&(
        str(prior.tenantId)!==TENANT||str(prior.projectId)!==PROGRAM
        ||str(prior.visitId)!==str(row.visitId)||str(prior.periodId)!==PROGRAM+'-'+str(row.period)
        ||str(prior.durableVisitId)!==str(snap?.id)||str(prior.shopperId)!==str(h.shopperId||v.shopperId)
        ||str(prior.country)!==str(row.country)||str(prior.paymentStatus)!=='pending'
        ||str(prior.source)!=='historical_reconciliation'||prior.paymentConfirmed===true
        ||prior.active===false||prior.superseded===true||str(prior.supersededByBatchId)
      ))blockers.push('EXACT_PREVIOUS_RECONCILIATION_SCOPE_OR_STATE_CONFLICT');
    if(str(v.reconciliationBatchId)!==priorBatchId||str(v.historicalPaymentStatus).toLowerCase()!=='pending'
       ||v.paymentConfirmed===true||v.historicalReconciliationConfirmed===true)
      blockers.push('DURABLE_VISIT_NOT_STILL_PENDING_IN_PREVIOUS_BATCH');
  }else if(row.presentInOtherBatch){
    blockers.push('UNEXPECTED_NON_SUPERSESSION_OTHER_BATCH');
  }else if(str(v.reconciliationBatchId)||str(v.historicalPaymentStatus)||v.paymentConfirmed===true){
    blockers.push('MISSING_RECONCILIATION_BUT_EXISTING_DURABLE_FINANCE_STATE');
  }
  return {visitId:str(row.visitId),period:str(row.period),country:str(row.country),
    expectedStatus:str(row.expectedStatus),visitDocumentPresent:!!snap?.exists,durableVisitId:snap?.id||null,
    priorBatchId,priorRecordFound:!!prior,paymentState:str(v.historicalPaymentStatus)||null,
    eligibleForExactSupersession:isSupersession&&blockers.length===0,
    noExistingReconciliation:!row.presentInOtherBatch,blockers};
}
const preflightRows=[];
for(let start=0;start<missingRows.length;start+=8)
  preflightRows.push(...await Promise.all(missingRows.slice(start,start+8).map(exactPreflight)));
const oldPending=preflightRows.filter(x=>x.priorBatchId);
const withoutReconciliation=preflightRows.filter(x=>x.noExistingReconciliation);
const supersessionPreflight={
  sourceRevision:str(dry.sourceRevision),liveHrRevision:str(hr.revision||hr.sourceRevision),
  examined:preflightRows.length,previousPendingRecords:oldPending.length,
  eligibleExactSupersessions:oldPending.filter(x=>x.eligibleForExactSupersession).length,
  blockedExactSupersessions:oldPending.filter(x=>!x.eligibleForExactSupersession).length,
  unrecordedExactVisits:withoutReconciliation.length,
  unrecordedByPeriodCountry:Object.fromEntries(Object.entries(missingByPeriodCountry).filter(([key])=>!key.startsWith('2026-08|GT|paid'))),
  readyToRequestScopedFinancialAuthorization:oldPending.length>0
    &&oldPending.every(x=>x.eligibleForExactSupersession)
    &&str(dry.sourceRevision)===str(hr.revision||hr.sourceRevision)
    &&activeHistoricalDuplicates.length===0,
  rows:preflightRows,readsOnly:true,firestoreWrites:0,bankWrites:0,hrWrites:0,production:false
};

const result={schemaVersion:'cxorbia.vrm153.reconciliation-readback.v3',
 decision:fullPass?'PASS_VRM153_RECONCILIATION_READBACK_MATCH':'HOLD_VRM153_RECONCILIATION_READBACK_MISMATCH',
 sourceRevision:str(dry.sourceRevision),hrRevision:str(hr.revision||hr.sourceRevision),
 liveHrVisitCount:arr(hr.visits).length,
 counts,missingByStatus,missingByPeriodCountry,missingRows,unexpectedScopeRows,activeHistoricalDuplicates,supersessionPreflight,
 otherBatchMatchesForMissing:missingRows.filter(x=>x.presentInOtherBatch).length,
 statusMismatches,reviewExtra,reviewMissing,details,
 octoberRecords:recs.filter(r=>str(r.periodId)==='cinepolis-2026-10').length,
 writes:0,hrWrites:0,bankWrites:0,financialMovementWrites:0,production:false};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify(result,null,2)+'\n');
