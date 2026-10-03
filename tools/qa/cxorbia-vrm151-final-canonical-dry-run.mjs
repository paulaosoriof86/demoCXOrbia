#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const str=v=>String(v==null?'':v).trim();
const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const tenantId=process.env.TENANT_ID||'tya',programId=process.env.PROJECT_ID||'cinepolis';
const hrUrl=process.env.HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&vrm151=finaldry';
const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const materializedHrRevision=str(descriptor?.currentMaterialization?.hrRevision||descriptor?.vrm151RuntimeMaterialization?.hrRevision);
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:process.env.PROJECT||'cxorbia-backend-dev'});
const db=getFirestore(),projectRef=db.collection('tenants').doc(tenantId).collection('projects').doc(programId);

const ym=v=>{const m=str(v).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);return m?m[1]+'-'+m[2]:'';};
const country=v=>{const x=str(v).toUpperCase();if(x==='GT'||x.includes('GUATEMALA'))return 'GT';if(x==='HN'||x.includes('HONDURAS'))return 'HN';return '';};
const paymentStatusFor=(period,c)=>{
  if(!period||!c)return '';
  if(period<='2026-07')return 'paid';
  if(period==='2026-08')return c==='HN'?'paid':c==='GT'?'pending':'';
  if(period==='2026-09')return ['GT','HN'].includes(c)?'pending':'';
  return '';
};
const submitted=v=>v?.canonicalFacets?.submitted===true||!!v?.submittedAt||v?.submit===true||['submitida','liquidada','pagada'].includes(str(v?.estado||v?.status).toLowerCase())||str(v?.canonicalState).toLowerCase()==='submitted_complete';
const EXPECTED_BY_REVISION=Object.freeze({
  '27996d9caa7ee95be1fed935143e89c442e7abe54423392ad2b29971ac6b4732':Object.freeze({canonicalSubmitted:628,paid:562,pending:66,amountReviewRequired:5,octoberTouched:0}),
  'f77e740a8f8c92f48ded256276e03c15594711ce57204381b672d61c19aa9305':Object.freeze({canonicalSubmitted:636,paid:562,pending:74,amountReviewRequired:5,octoberTouched:0})
});

const [projectSnap,fireSnap,hrRes]=await Promise.all([
  projectRef.get(),
  projectRef.collection('visits').get(),
  fetch(hrUrl,{headers:{'cache-control':'no-cache,no-store,max-age=0'}})
]);
if(!hrRes.ok)throw new Error('ENVIRONMENT_FAILURE:HR_HTTP_'+hrRes.status);
const project=projectSnap.data()||{},fire=fireSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})})),hr=await hrRes.json();
const sourceRevision=str(hr.revision||materializedHrRevision);
if(!sourceRevision)throw new Error('VRM151_DRYRUN_SOURCE_REVISION_REQUIRED');
const byDoc=new Map(fire.map(v=>[str(v.__docId),v]));
const byHrRow=new Map();for(const v of fire){const k=str(v.hrRowId);if(!k)continue;if(!byHrRow.has(k))byHrRow.set(k,[]);byHrRow.get(k).push(v);}
const configured=(c,key)=>{const map=project?.[key]||project?.financial?.[key]||project?.finance?.[key]||{};return map&&typeof map==='object'?num(map[c]):null;};

const canonical=[],excluded=[],ambiguous=[],seen=new Set();
for(const hv of hr.visits||[]){
  const period=ym(hv.periodKey||hv.periodId||hv.periodo),c=country(hv.pais||hv.country),paymentStatus=paymentStatusFor(period,c);
  if(!paymentStatus)continue;
  const liveId=str(hv.id||hv.visitId),hrRowId=str(hv.hrRowId),dups=byHrRow.get(hrRowId)||[];
  let dv=byDoc.get(liveId)||null,authority='live_hr_visit_id_equals_firestore_doc_id';
  if(!dv&&dups.length===1){dv=dups[0];authority='exact_legacy_fallback';}
  if(!dv){ambiguous.push({visitId:liveId,hrRowId,period,country:c,reason:'CANONICAL_DURABLE_OWNER_MISSING'});continue;}
  const merged={...dv,...hv,id:liveId||dv.id,visitId:liveId||dv.visitId,hrRowId:hrRowId||dv.hrRowId};
  if(!submitted(merged)){excluded.push({visitId:liveId,hrRowId,period,country:c,reason:'NOT_SUBMITTED',estado:str(merged.estado||merged.status),canonicalState:str(merged.canonicalState)});continue;}
  if(seen.has(liveId)){ambiguous.push({visitId:liveId,hrRowId,period,country:c,reason:'DUPLICATE_CANONICAL_VISIT_ID'});continue;}seen.add(liveId);
  const shopperId=str(merged.shopperId),currency=str(merged.currency||merged.moneda||project?.currency?.[c]||project?.currencies?.[c]);
  const explicit=num(merged?.hrManaged?.honorario)??(str(merged?.honorarioSource)!=='project_country_config'?num(merged?.honorario):null);
  const configuredHonorario=configured(c,'honorario'),honorario=explicit??configuredHonorario;
  if(!shopperId||!currency||honorario===null){
    ambiguous.push({visitId:liveId,hrRowId,period,country:c,reason:!shopperId?'SHOPPER_ID_MISSING':!currency?'CURRENCY_MISSING':'HONORARIO_SOURCE_MISSING'});continue;
  }
  const boleto=num(merged.boleto),combo=num(merged.comboAmt),reviewReasons=[];
  if(boleto===null)reviewReasons.push('BOLETO_MISSING');
  if(combo===null)reviewReasons.push('COMBO_MISSING');
  if(merged.reimbursementSourceComplete===false||merged.reimbursementPartial===true)reviewReasons.push('REIMBURSEMENT_INCOMPLETE');
  const amountReviewRequired=reviewReasons.length>0,reembolso=amountReviewRequired?null:boleto+combo,total=amountReviewRequired?null:honorario+reembolso;
  canonical.push({
    visitId:liveId,durableVisitId:dv.__docId,hrRowId,authority,period,periodId:str(dv.periodId||merged.periodId)||('cinepolis-'+period),
    country:c,currency,shopperId,paymentStatus,sourceRevision,
    honorario,honorarioSource:explicit!==null?'hr_explicit':'project_country_config',
    boleto,combo,reembolso,total,amountStatus:amountReviewRequired?'review_required':'exact',amountReviewRequired,reviewReasons
  });
}
const keyOf=r=>[r.period,r.country,r.currency,r.shopperId,r.paymentStatus].join('|');
const groups=new Map();
for(const r of canonical){
  const k=keyOf(r),g=groups.get(k)||{period:r.period,periodId:r.periodId,country:r.country,currency:r.currency,shopperId:r.shopperId,paymentStatus:r.paymentStatus,count:0,exactAmountCount:0,amountReviewRequiredCount:0,totalExactAmount:0,visitIds:[],visitRefs:[]};
  g.count++;g.visitIds.push(r.visitId);g.visitRefs.push({visitId:r.visitId,hrRowId:r.hrRowId});
  if(r.amountReviewRequired)g.amountReviewRequiredCount++;else{g.exactAmountCount++;g.totalExactAmount+=r.total;}
  groups.set(k,g);
}
const byPeriodStatus=new Map();
for(const r of canonical){
  const k=[r.period,r.paymentStatus].join('|'),g=byPeriodStatus.get(k)||{period:r.period,periodId:r.periodId,paymentStatus:r.paymentStatus,count:0,exactAmountCount:0,amountReviewRequiredCount:0,totalExactAmountByCurrency:{},visitIds:[],visitRefs:[]};
  g.count++;g.visitIds.push(r.visitId);g.visitRefs.push({visitId:r.visitId,hrRowId:r.hrRowId});
  if(r.amountReviewRequired)g.amountReviewRequiredCount++;else{g.exactAmountCount++;g.totalExactAmountByCurrency[r.currency]=(g.totalExactAmountByCurrency[r.currency]||0)+r.total;}
  byPeriodStatus.set(k,g);
}
const statusCounts=canonical.reduce((o,r)=>(o[r.paymentStatus]=(o[r.paymentStatus]||0)+1,o),{});
const reviewRows=canonical.filter(r=>r.amountReviewRequired);
const octTouched=canonical.filter(r=>r.period==='2026-10').length;
const expected=EXPECTED_BY_REVISION[sourceRevision]||null;
const decision=!!expected&&!ambiguous.length&&canonical.length===expected.canonicalSubmitted&&(statusCounts.paid||0)===expected.paid&&(statusCounts.pending||0)===expected.pending&&reviewRows.length===expected.amountReviewRequired&&octTouched===expected.octoberTouched
  ?'PASS_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN'
  :'HOLD_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN_MISMATCH';
const result={
  decision,sourceRevision,hrStable:hr.revisionStable===true||!!sourceRevision,expectedRevisionKnown:!!expected,frozenExpectedRevisions:Object.keys(EXPECTED_BY_REVISION),
  expected,
  observed:{canonicalSubmitted:canonical.length,paid:statusCounts.paid||0,pending:statusCounts.pending||0,amountReviewRequired:reviewRows.length,octoberTouched:octTouched,excludedNotSubmitted:excluded.length,ambiguous:ambiguous.length},
  grouped:[...groups.values()].sort((a,b)=>keyOf(a).localeCompare(keyOf(b))),
  batches:[...byPeriodStatus.values()].sort((a,b)=>[a.period,a.paymentStatus].join('|').localeCompare([b.period,b.paymentStatus].join('|'))),
  amountReviewRows:reviewRows,
  excludedNotSubmitted:excluded,
  ambiguous,
  writes:0,hrWrites:0,bankWrites:0,financialMovementWrites:0,production:false
};
const out=process.env.OUT||'';if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');}
process.stdout.write(JSON.stringify(result,null,2)+'\n');
if(decision!=='PASS_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN')process.exitCode=2;
