#!/usr/bin/env node
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const str=v=>String(v==null?'':v).trim();
const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const projectId=process.env.PROJECT||process.env.GOOGLE_CLOUD_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.TENANT_ID||'tya';
const programId=process.env.PROJECT_ID||'cinepolis';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId});
const db=getFirestore();

const ym=v=>{const m=str(v).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);return m?m[1]+'-'+m[2]:'';};
const country=v=>{const x=str(v).toUpperCase();if(x==='GT'||x.includes('GUATEMALA'))return 'GT';if(x==='HN'||x.includes('HONDURAS'))return 'HN';return '';};
const statusFor=(period,c)=>{
  if(!period||!c)return '';
  if(period<='2026-07')return 'paid';
  if(period==='2026-08')return c==='HN'?'paid':c==='GT'?'pending':'';
  if(period==='2026-09')return ['GT','HN'].includes(c)?'pending':'';
  return '';
};
const isLiquidationCandidate=v=>{
  const estado=str(v.estado||v.status).toLowerCase();
  const facets=v.canonicalFacets||{};
  return facets.submitted===true||!!v.submittedAt||v.submit===true||['submitida','liquidada','pagada','cuestionario'].includes(estado);
};

const projectRef=db.collection('tenants').doc(tenantId).collection('projects').doc(programId);
const [projectSnap,visitSnap]=await Promise.all([projectRef.get(),projectRef.collection('visits').get()]);
const project=projectSnap.data()||{};
const configuredAmount=(c,key)=>{
  const map=project?.[key]||project?.financial?.[key]||project?.finance?.[key]||{};
  return map&&typeof map==='object'?num(map[c]):null;
};

const groups=new Map(),samples={candidate:[],excluded:[],incomplete:[]};
let inScope=0,candidates=0,excluded=0,amountResolvable=0,amountIncomplete=0;
const reasons={};
for(const doc of visitSnap.docs){
  const v=doc.data()||{},period=ym(v.periodId||v.periodo||v.period||v.projectPeriodId),c=country(v.pais||v.country);
  const paymentStatus=statusFor(period,c); if(!paymentStatus)continue;
  inScope++;
  const base={visitId:str(v.id||v.visitId||doc.id),period,country:c,estado:str(v.estado||v.status),shopperId:str(v.shopperId)||null,currency:str(v.currency||v.moneda)||null};
  if(!isLiquidationCandidate(v)){excluded++; if(samples.excluded.length<25)samples.excluded.push(base);continue;}
  candidates++;
  const explicit=num(v?.hrManaged?.honorario)??(str(v?.honorarioSource)!=='project_country_config'?num(v?.honorario):null);
  const configured=configuredAmount(c,'honorario');
  const honorario=explicit??configured;
  const boleto=num(v.boleto),combo=num(v.comboAmt);
  const currency=str(v.currency||v.moneda||project?.currency?.[c]||project?.currencies?.[c]);
  const sourceRevision=str(v.hrSourceRevision||v.sourceRevision);
  const missing=[];
  if(!str(v.shopperId))missing.push('SHOPPER_ID');
  if(!currency)missing.push('CURRENCY');
  if(honorario===null)missing.push('HONORARIO');
  if(boleto===null)missing.push('BOLETO');
  if(combo===null)missing.push('COMBO');
  if(v.reimbursementSourceComplete===false||v.reimbursementPartial===true)missing.push('REIMBURSEMENT_INCOMPLETE');
  if(!sourceRevision)missing.push('SOURCE_REVISION');
  if(missing.length){
    amountIncomplete++;for(const m of missing)reasons[m]=(reasons[m]||0)+1;
    if(samples.incomplete.length<40)samples.incomplete.push({...base,missing,honorario,configuredHonorario:configured,boleto,combo,sourceRevision:sourceRevision||null});
    continue;
  }
  amountResolvable++;
  if(samples.candidate.length<40)samples.candidate.push({...base,paymentStatus,honorario,honorarioSource:explicit!==null?'hr_explicit':'project_country_config',boleto,combo,total:honorario+boleto+combo,sourceRevision});
  const k=[period,c,currency,paymentStatus].join('|');
  const g=groups.get(k)||{period,country:c,currency,paymentStatus,count:0,total:0};
  g.count++;g.total+=honorario+boleto+combo;groups.set(k,g);
}
const result={decision:amountIncomplete?'HOLD_VRM151_HISTORICAL_AMOUNT_DIAGNOSTIC_INCOMPLETE':'PASS_VRM151_HISTORICAL_AMOUNT_DIAGNOSTIC',project:{tenantId,projectId:programId},readDocuments:visitSnap.size,inScope,candidates,excludedNonLiquidation:excluded,amountResolvable,amountIncomplete,reasons,totals:[...groups.values()].sort((a,b)=>[a.period,a.country,a.currency].join('|').localeCompare([b.period,b.country,b.currency].join('|'))),samples,writes:0,hrWrites:0,bankWrites:0,production:false};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
