import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SOURCE=path.resolve(process.env.CXORBIA_CURRENT_SOURCE_SAFE||process.env.CXORBIA_HR_SOURCE_SAFE_OUT||'.tmp/hr-current/tya-hr-source-safe.js');
const OUT_JSON=path.resolve(process.env.CXORBIA_COUNTRY_GATE_JSON||'app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.json');
const OUT_MD=path.resolve(process.env.CXORBIA_COUNTRY_GATE_MD||'app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md');
function currentPeriodKey(){const explicit=String(process.env.CXORBIA_EXPECTED_CURRENT_PERIOD||'').trim();if(/^20\d{2}-(0[1-9]|1[0-2])$/.test(explicit))return explicit;const now=new Date();return `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`;}
function load(){const code=fs.readFileSync(SOURCE,'utf8'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(code,ctx);return JSON.parse(JSON.stringify(ctx.window.CX_TYA_HR_SOURCE_SAFE));}
function expectedCountry(tab){return String(tab?.country||(/\sHN$/i.test(String(tab?.title||tab?.tabTitle||''))?'HN':'GT'));}
function byCountry(rows){const out={};for(const row of rows){const c=String(row.country||row.pais||'EMPTY');out[c]=(out[c]||0)+1;}return out;}
const source=load();
if(!source||source.sourceSafe!==true)throw new Error('source_safe_snapshot_missing');
const periodKey=currentPeriodKey();
const tabs=(source.tabsRead||[]).filter(t=>String(t.periodKey||'')===periodKey);
const visits=(source.visits||[]).filter(v=>String(v.periodKey||'')===periodKey);
const results=tabs.map(tab=>{const title=String(tab.title||tab.tabTitle||''),expected=expectedCountry(tab),rows=visits.filter(v=>String(v.sourceTab||'')===title),mismatches=rows.filter(v=>String(v.country||v.pais||'')!==expected);return {title,periodKey,expectedCountry:expected,tabExists:true,visitRows:rows.length,countryCounts:byCountry(rows),mismatchCount:mismatches.length,mismatchRows:mismatches.map(v=>Number(v.sourceRow||0)).filter(Boolean).sort((a,b)=>a-b)};});
const coverage=['GT','HN'].every(country=>results.some(r=>r.expectedCountry===country&&r.visitRows>0));
const decision=tabs.length>=2&&coverage&&results.every(r=>r.mismatchCount===0)?'PASS_COUNTRY_TAB_CONSISTENCY':'HOLD_COUNTRY_TAB_CONSISTENCY';
const report={schemaVersion:'tya.hr-country-tab-consistency.v3',generatedAt:new Date().toISOString(),sourceSafe:true,pii:false,providerWrites:0,periodKey,results,decision,safety:{hrWrites:0,firestoreWrites:0,authWrites:0,hostingDeploys:0,production:false,merge:false}};
fs.mkdirSync(path.dirname(OUT_JSON),{recursive:true});fs.writeFileSync(OUT_JSON,JSON.stringify(report,null,2)+'\n','utf8');
const md=['# TyA HR — consistencia país/pestaña desde la misma revisión viva','',`- Fecha: ${report.generatedAt}`,`- Periodo: ${periodKey}`,`- Decisión: \`${decision}\``,'- No se hace una segunda lectura GViz; se valida la misma revisión source-safe del provider.','',...results.flatMap(r=>[`## ${r.title}`,'',`- País esperado: ${r.expectedCountry}.`,`- Filas: ${r.visitRows}.`,`- Distribución: ${Object.entries(r.countryCounts).map(([k,v])=>`${k}=${v}`).join(', ')}.`,`- Mismatch: ${r.mismatchCount}.`,'']),'## Seguridad','','- Sin PII; provider/HR/Firestore/Auth/Hosting writes=0.',''];
fs.writeFileSync(OUT_MD,md.join('\n'),'utf8');
console.log(JSON.stringify({decision,periodKey,results}));if(decision!=='PASS_COUNTRY_TAB_CONSISTENCY')process.exitCode=2;
