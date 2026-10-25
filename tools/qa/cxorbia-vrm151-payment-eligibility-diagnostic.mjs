#!/usr/bin/env node
import fs from 'node:fs';
const str=v=>String(v==null?'':v).trim();
const hrUrl=process.env.HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&vrm151=eligibility';
const res=await fetch(hrUrl,{headers:{'cache-control':'no-cache,no-store,max-age=0'}});if(!res.ok)throw new Error('HR_HTTP_'+res.status);
const hr=await res.json();
const ym=v=>{const m=str(v).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);return m?m[1]+'-'+m[2]:'';};
const country=v=>{const x=str(v).toUpperCase();if(x==='GT'||x.includes('GUATEMALA'))return 'GT';if(x==='HN'||x.includes('HONDURAS'))return 'HN';return '';};
const statusFor=(p,c)=>p<='2026-07'?'paid':p==='2026-08'?(c==='HN'?'paid':c==='GT'?'pending':''):p==='2026-09'&&['GT','HN'].includes(c)?'pending':'';
const submitted=v=>v?.canonicalFacets?.submitted===true||!!v.submittedAt||v.submit===true||['submitida','liquidada','pagada'].includes(str(v.estado||v.status).toLowerCase())||str(v.canonicalState).toLowerCase()==='submitted_complete';
const rows=[],totals={};
for(const v of hr.visits||[]){
 const period=ym(v.periodKey||v.periodId||v.periodo),c=country(v.pais||v.country),paymentStatus=statusFor(period,c);if(!paymentStatus)continue;
 const ok=submitted(v),key=[period,c,paymentStatus,ok?'submitted':'not_submitted'].join('|');
 totals[key]=(totals[key]||0)+1;
 if(!ok)rows.push({id:str(v.id||v.visitId),hrRowId:str(v.hrRowId),period,country:c,paymentStatus,estado:str(v.estado||v.status),canonicalState:str(v.canonicalState),submittedAt:str(v.submittedAt)||null,shopperId:str(v.shopperId)||null});
}
const result={decision:'PASS_VRM151_HISTORICAL_PAYMENT_ELIGIBILITY_READ_ONLY',hrVisitCount:(hr.visits||[]).length,totals:Object.entries(totals).map(([key,count])=>({key,count})).sort((a,b)=>a.key.localeCompare(b.key)),notSubmittedCount:rows.length,notSubmitted:rows,writes:0,hrWrites:0,bankWrites:0,production:false};
const out=process.env.OUT||'';if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');}
process.stdout.write(JSON.stringify(result,null,2)+'\n');
