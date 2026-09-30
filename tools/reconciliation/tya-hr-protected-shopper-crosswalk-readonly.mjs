#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import admin from 'firebase-admin';

const HR='app/data/tya-hr-source-safe-periods.js';
const OUT='app/docs/evidence/HR-PROTECTED-SHOPPER-CROSSWALK-READONLY-LATEST.json';
const OUT_MD='app/docs/evidence/HR-PROTECTED-SHOPPER-CROSSWALK-READONLY-LATEST.md';
const cred=process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(!cred||!fs.existsSync(cred))throw new Error('credential_missing');
const sa=JSON.parse(fs.readFileSync(cred,'utf8'));if(sa.project_id!=='cxorbia-backend-dev')throw new Error('wrong_project');
admin.initializeApp({credential:admin.credential.cert(sa),projectId:'cxorbia-backend-dev'});const db=admin.firestore();
const code=fs.readFileSync(HR,'utf8'),sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox,{filename:HR,timeout:5000});const hr=sandbox.window.CX_TYA_HR_SOURCE_SAFE;if(!hr?.sourceSafe)throw new Error('hr_source_safe_missing');
const planned=Array.isArray(hr.shoppers)?hr.shoppers:[];if(planned.length!==210)throw new Error(`unexpected_hr_shoppers:${planned.length}`);
const snap=await db.collection('tenants').doc('tya').collection('shoppers').get();
const byStable=new Map(),byCode=new Map();
const add=(map,k,c)=>{k=String(k??'').trim().toLowerCase();if(!k)return;if(!map.has(k))map.set(k,[]);if(!map.get(k).some(x=>x.docId===c.docId))map.get(k).push(c);};
for(const doc of snap.docs){const d=doc.data()||{},c={docId:doc.id};for(const v of[doc.id,d.id,d.shopperId,d.sourceKey,d.externalId,d.hrShopperId])add(byStable,v,c);for(const v of[d.code,d.shopperCode,d.codigo,d.username])add(byCode,v,c);}
const rows=[];let exactId=0,exactCode=0,unmapped=0,collision=0;
for(const p of planned){const pid=String(p.id||'').trim(),pc=String(p.code||'').trim(),ids=byStable.get(pid.toLowerCase())||[],codes=byCode.get(pc.toLowerCase())||[];let action='UNMAPPED',canonicalDocId=null,basis=null;if(ids.length===1){action='REUSE_EXISTING_BY_STABLE_HR_ID';canonicalDocId=ids[0].docId;basis='stable_hr_id';exactId++;}else if(ids.length>1){action='HOLD_COLLISION';basis='stable_hr_id_nonunique';collision++;}else if(codes.length===1){action='REUSE_EXISTING_BY_STABLE_HR_CODE';canonicalDocId=codes[0].docId;basis='stable_hr_code';exactCode++;}else if(codes.length>1){action='HOLD_COLLISION';basis='stable_hr_code_nonunique';collision++;}else{unmapped++;}rows.push({plannedShopperId:pid,plannedShopperCode:pc||null,action,basis,canonicalDocId});}
const counts={planned:planned.length,canonicalExisting:snap.size,reuseByStableHrId:exactId,reuseByStableHrCode:exactCode,reuseTotal:exactId+exactCode,unmapped,collision};
const report={schemaVersion:'tya.hr-protected-shopper-crosswalk.readonly.v1',generatedAt:new Date().toISOString(),target:{projectId:'cxorbia-backend-dev',tenantId:'tya'},policy:{nameMatching:false,stableTechnicalIdOnly:true,stableCodeOnly:true,automaticMergeOnName:false},counts,rows,safety:{providerReads:true,providerWrites:0,authWrites:0,deploys:0,production:false,merge:false,pii:false}};
fs.mkdirSync('app/docs/evidence',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(OUT_MD,['# HR protected shoppers — crosswalk read-only','',`- Planned HR refs: ${counts.planned}.`,`- Existing canonical shoppers: ${counts.canonicalExisting}.`,`- Reuse exact stable HR ID: ${counts.reuseByStableHrId}.`,`- Reuse exact stable HR code: ${counts.reuseByStableHrCode}.`,`- Reuse total: ${counts.reuseTotal}.`,`- Unmapped: ${counts.unmapped}.`,`- Collision: ${counts.collision}.`,'- Name matching: false. Provider writes: 0.',''].join('\n'));
console.log(JSON.stringify({decision:'PASS_HR_PROTECTED_SHOPPER_CROSSWALK_READONLY',counts,safety:report.safety},null,2));
