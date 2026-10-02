#!/usr/bin/env node
import fs from 'node:fs';
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const str=v=>String(v==null?'':v).trim();
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:process.env.PROJECT||'cxorbia-backend-dev'});
const db=getFirestore(),tenantId='tya',projectId='cinepolis';
const ids=[
'hr_2025-12_gt_34_3fb3c6d04d',
'hr_2026-02_gt_20_1911657f39',
'hr_2026-02_gt_33_d3bf1238d1',
'hr_2026-03_gt_20_e30e77a9e5',
'hr_2026-04_gt_31_263a722734',
'hr_2026-05_gt_25_cc5ace594e',
'hr_2026-07_gt_13_3e8d6f398f'
];
const project=db.collection('tenants').doc(tenantId).collection('projects').doc(projectId);
const hrUrl=process.env.HR_URL||'https://cxorbia-backend-dev.web.app/api/tya/cinepolis/hr-live?format=json&vrm151=exceptions';
const hrRes=await fetch(hrUrl,{headers:{'cache-control':'no-cache,no-store,max-age=0'}});if(!hrRes.ok)throw new Error('HR_HTTP_'+hrRes.status);
const hr=await hrRes.json(),hrById=new Map((hr.visits||[]).map(v=>[str(v.id||v.visitId),v]));
const allow=['id','visitId','hrRowId','periodKey','periodId','pais','country','estado','status','canonicalState','shopperId','honorario','honorarioSource','boleto','comboAmt','combo','reembolso','reimbursement','reimbursementStatus','reimbursementSourceStatus','reimbursementSourceComplete','reimbursementPartial','ticketReimbursementAmount','comboReimbursementAmount','otherReimbursementAmount','total','totalCalculated','cuestFecha','submittedAt','realizada','sourceTab','sourceRow','sourceRevision','hrSourceRevision'];
const pick=o=>Object.fromEntries(allow.filter(k=>o&&o[k]!==undefined).map(k=>[k,o[k]]));
const rows=[];
for(const id of ids){
 const snap=await project.collection('visits').doc(id).get(),dv=snap.exists?(snap.data()||{}):null,hv=hrById.get(id)||null;
 rows.push({id,firestoreExists:!!dv,hrExists:!!hv,firestore:pick(dv),hr:pick(hv)});
}
const result={decision:'PASS_VRM151_SEVEN_REIMBURSEMENT_EXCEPTIONS_READ_ONLY',count:rows.length,rows,writes:0,hrWrites:0,bankWrites:0,production:false};
const out=process.env.OUT||'';if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');}
process.stdout.write(JSON.stringify(result,null,2)+'\n');
