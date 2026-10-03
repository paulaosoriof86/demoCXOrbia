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
const paid=recs.filter(r=>str(r.paymentStatus)==='paid').length,pending=recs.filter(r=>str(r.paymentStatus)==='pending').length,review=persistedReview.size;
const result={schemaVersion:'cxorbia.vrm153.reconciliation-readback.v1',decision:statusMismatches.length||reviewExtra.length||reviewMissing.length?'HOLD_VRM153_RECONCILIATION_READBACK_MISMATCH':'PASS_VRM153_RECONCILIATION_READBACK_MATCH',sourceRevision:str(dry.sourceRevision),hrRevision:str(hr.revision),counts:{records:recs.length,uniqueVisits:new Set(recs.map(r=>str(r.visitId))).size,paid,pending,amountReviewRequired:review,expectedRecords:dry.expected?.canonicalSubmitted??null,expectedPaid:dry.expected?.paid??null,expectedPending:dry.expected?.pending??null,expectedAmountReviewRequired:dry.expected?.amountReviewRequired??null},statusMismatches,reviewExtra,reviewMissing,details,octoberRecords:recs.filter(r=>str(r.periodId)==='cinepolis-2026-10').length,writes:0,hrWrites:0,bankWrites:0,financialMovementWrites:0,production:false};
fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify(result,null,2)+'\n');
