#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const str=v=>String(v==null?'':v).trim();
const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const tenantId=process.env.TENANT_ID||'tya',programId=process.env.PROJECT_ID||'cinepolis';
const hrUrl=process.env.HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&vrm151=owner';
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:process.env.PROJECT||'cxorbia-backend-dev'});
const db=getFirestore(),projectRef=db.collection('tenants').doc(tenantId).collection('projects').doc(programId);

const ym=v=>{const m=str(v).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);return m?m[1]+'-'+m[2]:'';};
const country=v=>{const x=str(v).toUpperCase();if(x==='GT'||x.includes('GUATEMALA'))return 'GT';if(x==='HN'||x.includes('HONDURAS'))return 'HN';return '';};
const statusFor=(period,c)=>period<='2026-07'?'paid':period==='2026-08'?(c==='HN'?'paid':c==='GT'?'pending':''):period==='2026-09'&&['GT','HN'].includes(c)?'pending':'';
const isLiquidation=v=>{const e=str(v.estado||v.status).toLowerCase(),f=v.canonicalFacets||{};return f.submitted===true||!!v.submittedAt||v.submit===true||['submitida','liquidada','pagada','cuestionario'].includes(e);};

const [projectSnap,fireSnap,hrRes]=await Promise.all([
  projectRef.get(),
  projectRef.collection('visits').get(),
  fetch(hrUrl,{headers:{'cache-control':'no-cache,no-store,max-age=0'}})
]);
if(!hrRes.ok)throw new Error('ENVIRONMENT_FAILURE:HR_HTTP_'+hrRes.status);
const project=projectSnap.data()||{},hr=await hrRes.json(),fire=fireSnap.docs.map(d=>({__docId:d.id,...(d.data()||{})}));
const byDoc=new Map(fire.map(v=>[str(v.__docId),v]));
const byHrRow=new Map();for(const v of fire){const k=str(v.hrRowId);if(!k)continue;if(!byHrRow.has(k))byHrRow.set(k,[]);byHrRow.get(k).push(v);}
const configured=(c,key)=>{const map=project?.[key]||project?.financial?.[key]||project?.finance?.[key]||{};return map&&typeof map==='object'?num(map[c]):null;};

const groups=new Map(),ambiguous=[],canonical=[],duplicateGroups=[];
let hrInScope=0,nonLiquidation=0,ownerMissing=0,ownerExact=0,ownerFallback=0,amountResolvable=0,amountIncomplete=0;
const reasons={};
for(const hv of (hr.visits||[])){
  const period=ym(hv.periodKey||hv.periodId||hv.periodo),c=country(hv.pais||hv.country),paymentStatus=statusFor(period,c);
  if(!paymentStatus)continue; hrInScope++;
  if(!isLiquidation(hv)){nonLiquidation++;continue;}
  const liveId=str(hv.id||hv.visitId),hrRowId=str(hv.hrRowId),dups=byHrRow.get(hrRowId)||[];
  if(dups.length>1)duplicateGroups.push({hrRowId,liveId,count:dups.length,docIds:dups.map(x=>x.__docId)});
  let dv=byDoc.get(liveId)||null,authority='live_hr_visit_id_equals_firestore_doc_id';
  if(!dv&&dups.length===1){dv=dups[0];authority='exact_legacy_fallback';ownerFallback++;}
  else if(dv)ownerExact++;
  if(!dv){ownerMissing++;ambiguous.push({liveId,hrRowId,period,country:c,reason:'CANONICAL_DURABLE_OWNER_MISSING'});continue;}
  const merged={...dv,...hv,hrRowId:hrRowId||dv.hrRowId,id:liveId||dv.id,visitId:liveId||dv.visitId};
  const explicit=num(merged?.hrManaged?.honorario)??(str(merged?.honorarioSource)!=='project_country_config'?num(merged?.honorario):null);
  const honorario=explicit??configured(c,'honorario'),boleto=num(merged.boleto),combo=num(merged.comboAmt);
  const currency=str(merged.currency||merged.moneda||project?.currency?.[c]||project?.currencies?.[c]);
  const sourceRevision=str(hv.hrSourceRevision||hv.sourceRevision||hr.revision);
  const missing=[];if(!str(merged.shopperId))missing.push('SHOPPER_ID');if(!currency)missing.push('CURRENCY');if(honorario===null)missing.push('HONORARIO');if(boleto===null)missing.push('BOLETO');if(combo===null)missing.push('COMBO');if(!sourceRevision)missing.push('SOURCE_REVISION');
  if(missing.length){amountIncomplete++;for(const m of missing)reasons[m]=(reasons[m]||0)+1;ambiguous.push({liveId,hrRowId,docId:dv.__docId,authority,period,country:c,shopperId:str(merged.shopperId)||null,currency:currency||null,missing});continue;}
  amountResolvable++;
  const total=honorario+boleto+combo,row={liveId,hrRowId,docId:dv.__docId,authority,period,country:c,currency,shopperId:str(merged.shopperId),paymentStatus,honorario,boleto,combo,total,sourceRevision};
  canonical.push(row);
  const k=[period,c,currency,paymentStatus].join('|'),g=groups.get(k)||{period,country:c,currency,paymentStatus,count:0,total:0};
  g.count++;g.total+=total;groups.set(k,g);
}
const result={decision:ambiguous.length?'HOLD_VRM151_CANONICAL_OWNER_OR_AMOUNT_AMBIGUOUS':'PASS_VRM151_CANONICAL_OWNER_AND_AMOUNT',hrRevision:str(hr.revision),hrStable:hr.revisionStable===true,hrVisitCount:(hr.visits||[]).length,firestoreVisitDocs:fire.length,hrInScope,nonLiquidation,ownerExact,ownerFallback,ownerMissing,duplicateGroupCount:duplicateGroups.length,amountResolvable,amountIncomplete,reasons,canonicalCount:canonical.length,totals:[...groups.values()].sort((a,b)=>[a.period,a.country].join('|').localeCompare([b.period,b.country].join('|'))),canonicalSample:canonical.slice(0,60),ambiguousSample:ambiguous.slice(0,80),duplicateGroups:duplicateGroups.slice(0,80),writes:0,hrWrites:0,bankWrites:0,production:false};
const out=process.env.OUT||'';if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');}
process.stdout.write(JSON.stringify(result,null,2)+'\n');
