#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const input=process.env.CXORBIA_CURRENT_HR_FULL||'.tmp/current-hr-full.js';
const output=process.env.CXORBIA_CURRENT_HR_THROUGH_JULY||'app/data/tya-hr-source-safe-current-through-july.js';
const cutoff=process.env.CXORBIA_HR_CUTOFF||'2026-07';
const staleFile=process.env.CXORBIA_STALE_HR_SOURCE||'app/data/tya-hr-source-safe-periods.js';
const readAssignment=file=>{const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync(file,'utf8'),sb,{filename:file,timeout:5000});return JSON.parse(JSON.stringify(sb.window.CX_TYA_HR_SOURCE_SAFE));};
const src=readAssignment(input);
if(!src||src.sourceSafe!==true||src.imported===true||src.production===true)throw new Error('current_hr_source_not_safe');
const periods=(src.periods||[]).filter(p=>String(p.key)<=cutoff);
const visits=(src.visits||[]).filter(v=>String(v.periodKey)<=cutoff);
const refs=new Set(visits.map(v=>v.shopperId).filter(Boolean));
const shoppers=(src.shoppers||[]).filter(s=>refs.has(s.id));
const byStatus={};const byCountry={};
for(const v of visits){byStatus[v.estado]=(byStatus[v.estado]||0)+1;const c=v.pais||v.country||'UNKNOWN';byCountry[c]=(byCountry[c]||0)+1;}
const counts={periods:periods.length,tabs:periods.reduce((n,p)=>n+Object.keys(p.tabs||{}).length,0),visits:visits.length,shoppers:shoppers.length,byStatus,byCountry,assigned:visits.filter(v=>v.hasShopper||v.shopperId).length,unassigned:visits.filter(v=>!(v.hasShopper||v.shopperId)).length,scheduled:visits.filter(v=>v.agendada).length,realized:visits.filter(v=>v.realizada).length,questionnaireCompleted:visits.filter(v=>v.cuestFecha).length,submitted:visits.filter(v=>v.submit||v.submittedAt).length};
const out={...src,generatedAt:new Date().toISOString(),buildLabel:'tya-live-hr-source-safe-current-through-july',periods,visits,shoppers,counts,issues:[],currentThroughPeriod:cutoff,sourceSafe:true,imported:false,production:false};
if(periods.length!==14||visits.length!==616)throw new Error(`through_july_counts_unexpected:${periods.length}/${visits.length}`);
fs.mkdirSync(output.split('/').slice(0,-1).join('/'),{recursive:true});
fs.writeFileSync(output,`/* CXOrbia TyA current live HR through July source-safe; no PII/raw workbook. */window.CX_TYA_HR_SOURCE_SAFE = ${JSON.stringify(out,null,2)};\n`,'utf8');
let stale=null;if(fs.existsSync(staleFile))stale=readAssignment(staleFile);
const staleRefs=new Set((stale?.shoppers||[]).map(s=>s.id));const currentRefs=new Set(shoppers.map(s=>s.id));
const report={schemaVersion:'tya.current-hr-through-july.source-safe.v1',generatedAt:out.generatedAt,cutoff,counts,referenceDiff:{staleSourceGeneratedAt:stale?.generatedAt||null,staleRefs:staleRefs.size,currentRefs:currentRefs.size,added:[...currentRefs].filter(x=>!staleRefs.has(x)).length,removed:[...staleRefs].filter(x=>!currentRefs.has(x)).length,intersection:[...currentRefs].filter(x=>staleRefs.has(x)).length},sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),safety:{containsPii:false,providerWrites:0,hrWrites:0,firestoreWrites:0,deploys:0,production:false}};
fs.mkdirSync('app/docs/evidence',{recursive:true});fs.writeFileSync('app/docs/evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('app/docs/evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.md',`# HR viva actual source-safe hasta julio\n\n- Periodos: ${periods.length}.\n- Visitas: ${visits.length}.\n- Shopper refs actuales: ${currentRefs.size}.\n- Refs agregadas vs snapshot previo: ${report.referenceDiff.added}.\n- Refs retiradas vs snapshot previo: ${report.referenceDiff.removed}.\n- Intersección: ${report.referenceDiff.intersection}.\n- PII: 0. Provider/data writes: 0.\n`);
console.log(JSON.stringify(report,null,2));
