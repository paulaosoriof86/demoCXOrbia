#!/usr/bin/env node
/* CXOrbia I3 R08 + finance exact provider provenance without content/PII or writes. */
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const t=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const src=t(process.env.FOCAL_SOURCE),rev=t(process.env.EXPECTED_HR_REVISION),host=t(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const out=t(process.env.R08_FINANCE_OUT||'.tmp/phasea-representative-live/r08-finance');
fs.mkdirSync(out,{recursive:true});
const r={schema:'cxorbia.i3.r08-finance.provenance.readonly.v1',sourceSha:src,revisionExpected:rev,revisionObserved:null,
  R08:{state:'HOLD_R08_SOURCE_AND_VERTEX_REVIEW'},finance:{state:'HOLD_FINANCE_SOURCE_PAYMENTS'},
  writes:{auth:0,firestore:0,hr:0,finance:0,bank:0,production:0}};
const save=()=>{fs.writeFileSync(out+'/result.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));};
const safeError=e=>t(e?.code||e?.message||e).replace(/[^a-zA-Z0-9_:.-]/g,'_').slice(0,80);
const byProject=v=>!t(v.projectId)||t(v.projectId)==='cinepolis';
async function col(ref){let a=await ref.limit(1600).get();return {rows:a.docs.map(d=>({id:d.id,...(d.data()||{})})),truncated:a.size===1600};}
async function hr(){
 const x=await fetch(host+'/api/tya/cinepolis/hr-live?format=meta&focus='+Date.now(),{headers:{'cache-control':'no-store'},signal:AbortSignal.timeout(95000)});
 if(!x.ok)throw Error('ENVIRONMENT_FAILURE_HR_META_HTTP_'+x.status);
 const j=await x.json();if(j.ok!==true||j.revisionStable!==true||j.sourceSafe!==true)throw Error('PROVIDER_FAILURE_HR_META');
 return t(j.revision);
}
function paidState(x){return Boolean(x.paymentConfirmed===true||x.externalPaymentConfirmed===true||['paid','pagada','confirmed','payment_confirmed'].includes(t(x.paymentStatus||x.paymentState).toLowerCase()));}
function proof(x){return Boolean(t(x.paymentSourceRef||x.historicalPaymentAuthorityRef||x.externalPaymentRef||x.bankProofRef));}
try{
 if(!/^[a-f0-9]{40}$/.test(src)||!/^[a-f0-9]{64}$/.test(rev)||new URL(host).origin!=='https://cxorbia-backend-dev.web.app')throw Error('SOURCE_FAILURE_DEV_AUTHORITY');
 r.revisionObserved=await hr();if(r.revisionObserved!==rev)throw Error('ENVIRONMENT_FAILURE_HR_DRIFT');
 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
 const ten=getFirestore().collection('tenants').doc('tya');
 const [resources,ai,reconciliations,project]=await Promise.all([
   col(ten.collection('resources')),col(ten.collection('aiSettings')),col(ten.collection('paymentReconciliations')),
   ten.collection('projects').doc('cinepolis').get()
 ]);
 const bank=resources.rows.filter(v=>byProject(v)&&v.resourceType==='certification_bank');
 const candidate=resources.rows.filter(v=>byProject(v)&&/instructivo|manual|protocolo|resource|training|certification/i.test([v.resourceType,v.tipo,v.n,v.name,v.title].map(t).join('|'))&&v.resourceType!=='certification_bank');
 const sourceFields=v=>['sourceText','extractedText','instructionText','instructivoText','protocolText','bodyText'].some(k=>t(v[k]).length>=40);
 const externalFile=v=>Boolean(t(v.storagePath||v.storageObject||v.storageUrl||v.filePath||v.resourcePath));
 const approved=v=>Boolean(v.approved===true||v.isApproved===true||['published','approved','confirmed'].includes(t(v.status||v.estado).toLowerCase())||t(v.approvedByUid));
 const active=ai.rows.filter(v=>v.status==='active'&&v.serverProxy===true&&(!arr(v.projectIds).length||v.projectIds.includes('cinepolis')));
 const c=project.exists?project.data()||{}:{};
 r.R08={state:'HOLD_R08_REAL_VERTEX_15_AND_HUMAN_REVIEW_REQUIRED',settings:active.length,
  candidateResources:candidate.length,candidateWithEmbeddedText:candidate.filter(sourceFields).length,
  candidateWithFilePointer:candidate.filter(externalFile).length,approvedCandidateSources:candidate.filter(approved).length,
  banks:bank.length,bankStates:Object.fromEntries([...new Set(bank.map(x=>t(x.bank?.estado||x.status)||'missing'))].map(st=>[st,bank.filter(x=>(t(x.bank?.estado||x.status)||'missing')===st).length])),
  banksWith15Questions:bank.filter(x=>arr(x.bank?.preguntas).length===15).length,
  bankContentRevisions:bank.filter(x=>t(x.bank?.contentRevision)).length,
  selectedProjectCertificationPolicyPresent:Boolean(t(c.certificationReviewPolicy||c.certReviewPolicy)),
  selectedProjectRequiredQuestionCount:Number(c.certificationQuestionCount||c.certQuestionCount||c.questionCount||0)||null,
  providerGenerationTriggered:false,instructionTextExported:false};
 const rows=reconciliations.rows.filter(byProject);
 const status={},currencies={},review={};
 let paid=0,paidWithoutProof=0,pending=0,pendingWithoutProof=0,amountReview=0,linkedSource=0,noSource=0,amountQ7300=0,q7300Authority=0;
 for(const x of rows){
  const st=t(x.paymentStatus||x.paymentState||x.status||'unspecified').toLowerCase();
  status[st]=(status[st]||0)+1;const c=t(x.currency||x.moneda||'unknown').toUpperCase();currencies[c]=(currencies[c]||0)+1;
  const isPaid=paidState(x),hasProof=proof(x);
  if(isPaid){paid++;if(!hasProof)paidWithoutProof++}else{pending++;if(!hasProof)pendingWithoutProof++}
  if(x.amountReviewRequired===true||t(x.amountStatus).includes('review'))amountReview++;
  if(t(x.sourceRef||x.reconciliationSourceRef))linkedSource++;else noSource++;
  const amount=Number(x.amount||x.total||x.honorario||0);
  if(Number.isFinite(amount)&&Math.abs(amount-7300)<0.001){amountQ7300++;if(hasProof)q7300Authority++}
 }
 r.finance={state:'HOLD_FINANCE_HISTORICAL_BACKING_AND_BATCH_PENDING',reconciliations:rows.length,truncated:reconciliations.truncated,
  countries:{GT:rows.filter(x=>['GT','GUATEMALA'].includes(t(x.country||x.pais).toUpperCase())).length,HN:rows.filter(x=>['HN','HONDURAS'].includes(t(x.country||x.pais).toUpperCase())).length},
  statusDistribution:status,currencyDistribution:currencies,paidStatusCount:paid,paidStatusWithoutIndependentProofCount:paidWithoutProof,
  pendingStatusCount:pending,pendingWithoutProofCount:pendingWithoutProof,amountReviewRequired:amountReview,
  sourceRefPresent:linkedSource,sourceRefMissing:noSource,
  q7300AmountCandidates:amountQ7300,q7300CandidatesWithExternalProof:q7300Authority,
  realPaymentTransfersValidated:0, noPaymentWrite:true,
  caveat:'Paid status or reconciliation sourceRef does not independently establish bank transfer'};
 r.hrRevisionReadback=await hr();
 if(r.hrRevisionReadback!==rev)throw Error('ENVIRONMENT_FAILURE_HR_DRIFT_AFTER');
 save();
}catch(e){
 r.decision='HOLD_I3_READONLY_'+safeError(e);
 save();process.exitCode=2;
}
