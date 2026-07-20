#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const baseUrl=arg('--base-url',process.env.CXORBIA_BASE_URL||'http://127.0.0.1:4173/app/index.html?cxTyaPhaseA=1&r18d=visible');
const outDir=arg('--out','.tmp/tya-corte1-report-projection-browser');
fs.mkdirSync(outDir,{recursive:true});
const blockers=[];
const warnings=[];
const add=(arr,code,observed,expected)=>arr.push({code,observed,expected});

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const pageErrors=[];
const consoleErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
try{
  await page.goto(baseUrl,{waitUntil:'networkidle',timeout:120000});
  await page.waitForFunction(()=>window.CX&&window.CX.data,{timeout:30000});
  const observed=await page.evaluate(()=>{
    const r=window.CX_TYA_CORTE1_REPORTS;
    if(!r)return {exists:false};
    const juneGT=r.filter({periodKey:'2026-06',country:'GT'});
    const juneHN=r.filter({periodKey:'2026-06',country:'HN'});
    const july=r.filter({periodKey:'2026-07'});
    const csv=r.toCSV({periodKey:'2026-07'});
    const json=JSON.parse(r.toJSON({periodKey:'2026-07',country:'GT'}));
    return {
      exists:true,schemaVersion:r.schemaVersion,contractId:r.contractId,tenantId:r.tenantId,projectId:r.projectId,
      periods:r.periods,countries:r.countries,latestPeriod:r.latestPeriod,rows:r.rows,totals:r.totals,source:r.source,frontend:r.frontend,
      juneGT,juneHN,july,csvLines:csv.split(/\r?\n/).length,jsonRows:json.rows.length,
      keys:[...new Set(r.rows.flatMap(x=>Object.keys(x)))].sort()
    };
  });
  if(!observed.exists)add(blockers,'report_projection_missing',false,true);
  else {
    if(observed.contractId!=='phase-a-corte1-context-history-reports-v1')add(blockers,'contract_id_mismatch',observed.contractId,'phase-a-corte1-context-history-reports-v1');
    if(observed.tenantId!=='tya')add(blockers,'tenant_mismatch',observed.tenantId,'tya');
    if(observed.projectId!=='cinepolis')add(blockers,'project_mismatch',observed.projectId,'cinepolis');
    if(observed.periods?.length!==14)add(blockers,'period_count_mismatch',observed.periods?.length,14);
    if(observed.latestPeriod!=='2026-07')add(blockers,'latest_period_mismatch',observed.latestPeriod,'2026-07');
    if(observed.rows?.length!==28)add(blockers,'report_row_count_mismatch',observed.rows?.length,28);
    if(observed.totals?.visits!==616)add(blockers,'visit_total_mismatch',observed.totals?.visits,616);
    if((observed.totals?.assigned||0)+(observed.totals?.unassigned||0)!==616)add(blockers,'assignment_partition_mismatch',observed.totals,616);
    if(observed.totals?.paymentConfirmed!==0)add(blockers,'payment_inference_detected',observed.totals?.paymentConfirmed,0);
    if(observed.juneGT?.[0]?.visits!==34||observed.juneHN?.[0]?.visits!==10)add(blockers,'june_country_counts_mismatch',{GT:observed.juneGT?.[0]?.visits,HN:observed.juneHN?.[0]?.visits},{GT:34,HN:10});
    const julyVisits=(observed.july||[]).reduce((n,r)=>n+r.visits,0);
    if(julyVisits!==44)add(blockers,'july_visit_count_mismatch',julyVisits,44);
    if(observed.jsonRows!==1)add(blockers,'json_scope_filter_mismatch',observed.jsonRows,1);
    if(observed.csvLines!==3)add(blockers,'csv_scope_filter_mismatch',observed.csvLines,3);
    if(observed.source?.sourceSafe!==true||observed.source?.production!==false||observed.source?.imported!==false)add(blockers,'source_state_mismatch',observed.source,{sourceSafe:true,production:false,imported:false});
    const forbidden=['email','mail','phone','telefono','whatsapp','dpi','banco','cuenta','ctanum','direccion','address'];
    const leaked=(observed.keys||[]).filter(k=>forbidden.includes(String(k).toLowerCase()));
    if(leaked.length)add(blockers,'pii_keys_in_projection',leaked,[]);
    if((observed.frontend?.formatsPending||[]).length)add(warnings,'frontend_formats_pending',observed.frontend.formatsPending,[]);
  }
  if(pageErrors.length)add(blockers,'page_errors',pageErrors,[]);
  if(consoleErrors.length)add(blockers,'console_errors',consoleErrors,[]);
  await page.screenshot({path:path.join(outDir,'tya-corte1-report-projection.png'),fullPage:true});
  const decision=blockers.length?'HOLD_CORTE1_REPORT_PROJECTION_BROWSER':warnings.length?'PASS_WITH_REVIEW_CORTE1_REPORT_PROJECTION_BROWSER':'PASS_CORTE1_REPORT_PROJECTION_BROWSER';
  const result={ok:blockers.length===0,decision,baseUrl,blockers,warnings,pageErrors,consoleErrors,observed};
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(result,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 report projection browser gate\n\n- Decision: \`${decision}\`\n- Blockers: ${blockers.length}\n- Warnings: ${warnings.length}\n- Page errors: ${pageErrors.length}\n- Console errors: ${consoleErrors.length}\n`,'utf8');
  console.log(JSON.stringify(result,null,2));
  if(blockers.length)process.exitCode=1;
} finally {
  await browser.close();
}
