#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const baseUrl=arg('--base-url',process.env.CXORBIA_BASE_URL||'http://127.0.0.1:4173/app/index.html?cxTyaPhaseA=1&r18d=visible');
const contractFile=arg('--contract','backend/contracts/phase-a-corte1-context-history-reports-v1.json');
const outDir=arg('--out','.tmp/tya-corte1-report-projection-browser');
const contract=JSON.parse(fs.readFileSync(contractFile,'utf8'));
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
    const julyBranches=r.filter({periodKey:'2026-07'},'branch');
    const csv=r.toCSV({periodKey:'2026-07'});
    const branchCSV=r.toCSV({periodKey:'2026-07',country:'GT'},'branch');
    const json=JSON.parse(r.toJSON({periodKey:'2026-07',country:'GT'}));
    const branchJSON=JSON.parse(r.toJSON({periodKey:'2026-07',country:'GT'},'branch'));
    const availableReport=r.report('executive_operational_summary',{periodKey:'2026-07'});
    const branchReport=r.report('branch_operational_status',{periodKey:'2026-07',country:'GT'});
    const pendingReport=r.report('training_gaps',{periodKey:'2026-07'});
    return {
      exists:true,schemaVersion:r.schemaVersion,contractId:r.contractId,tenantId:r.tenantId,projectId:r.projectId,
      periods:r.periods,countries:r.countries,latestPeriod:r.latestPeriod,rows:r.rows,branchRows:r.branchRows,catalog:r.catalog,totals:r.totals,source:r.source,frontend:r.frontend,
      juneGT,juneHN,july,julyBranches,csvLines:csv.split(/\r?\n/).length,branchCSVLines:branchCSV.split(/\r?\n/).length,jsonRows:json.rows.length,branchJSONRows:branchJSON.rows.length,
      availableReport:{available:availableReport.available,reason:availableReport.reason,rows:availableReport.rows.length,level:availableReport.definition&&availableReport.definition.projectionLevel},
      branchReport:{available:branchReport.available,reason:branchReport.reason,rows:branchReport.rows.length,level:branchReport.definition&&branchReport.definition.projectionLevel},
      pendingReport:{available:pendingReport.available,reason:pendingReport.reason,rows:pendingReport.rows.length,availability:pendingReport.definition&&pendingReport.definition.availability},
      rowKeys:[...new Set(r.rows.flatMap(x=>Object.keys(x)))].sort(),
      branchKeys:[...new Set(r.branchRows.flatMap(x=>Object.keys(x)))].sort()
    };
  });
  if(!observed.exists)add(blockers,'report_projection_missing',false,true);
  else {
    const scope=contract.sourceScope||{};
    if(observed.schemaVersion!==contract.schemaVersion)add(blockers,'schema_version_mismatch',observed.schemaVersion,contract.schemaVersion);
    if(observed.contractId!==contract.id)add(blockers,'contract_id_mismatch',observed.contractId,contract.id);
    if(observed.tenantId!==contract.tenantId)add(blockers,'tenant_mismatch',observed.tenantId,contract.tenantId);
    if(observed.projectId!==contract.projectId)add(blockers,'project_mismatch',observed.projectId,contract.projectId);
    if(observed.periods?.length!==scope.expectedPeriods)add(blockers,'period_count_mismatch',observed.periods?.length,scope.expectedPeriods);
    if(observed.latestPeriod!==scope.periodEnd)add(blockers,'latest_period_mismatch',observed.latestPeriod,scope.periodEnd);
    if(observed.rows?.length!==scope.expectedPeriods*(scope.countries||[]).length)add(blockers,'report_row_count_mismatch',observed.rows?.length,scope.expectedPeriods*(scope.countries||[]).length);
    if(!Array.isArray(observed.branchRows)||!observed.branchRows.length)add(blockers,'branch_projection_missing',observed.branchRows?.length||0,'> 0');
    if((observed.branchRows||[]).reduce((n,r)=>n+r.visits,0)!==scope.expectedVisits)add(blockers,'branch_projection_total_mismatch',(observed.branchRows||[]).reduce((n,r)=>n+r.visits,0),scope.expectedVisits);
    if(observed.totals?.visits!==scope.expectedVisits)add(blockers,'visit_total_mismatch',observed.totals?.visits,scope.expectedVisits);
    if((observed.totals?.assigned||0)+(observed.totals?.unassigned||0)!==scope.expectedVisits)add(blockers,'assignment_partition_mismatch',observed.totals,scope.expectedVisits);
    if(observed.totals?.paymentConfirmed!==0)add(blockers,'payment_inference_detected',observed.totals?.paymentConfirmed,0);
    if(observed.juneGT?.[0]?.visits!==34||observed.juneHN?.[0]?.visits!==10)add(blockers,'june_country_counts_mismatch',{GT:observed.juneGT?.[0]?.visits,HN:observed.juneHN?.[0]?.visits},{GT:34,HN:10});
    const julyVisits=(observed.july||[]).reduce((n,r)=>n+r.visits,0);
    if(julyVisits!==44)add(blockers,'july_visit_count_mismatch',julyVisits,44);
    if((observed.julyBranches||[]).reduce((n,r)=>n+r.visits,0)!==44)add(blockers,'july_branch_total_mismatch',(observed.julyBranches||[]).reduce((n,r)=>n+r.visits,0),44);
    if(observed.jsonRows!==1)add(blockers,'json_scope_filter_mismatch',observed.jsonRows,1);
    if(observed.csvLines!==3)add(blockers,'csv_scope_filter_mismatch',observed.csvLines,3);
    if(observed.branchJSONRows<1)add(blockers,'branch_json_scope_empty',observed.branchJSONRows,'> 0');
    if(observed.branchCSVLines!==observed.branchJSONRows+1)add(blockers,'branch_csv_scope_mismatch',observed.branchCSVLines,observed.branchJSONRows+1);
    if(observed.source?.sourceSafe!==true||observed.source?.production!==false||observed.source?.imported!==false)add(blockers,'source_state_mismatch',observed.source,{sourceSafe:true,production:false,imported:false});

    const catalogById=new Map((observed.catalog||[]).map(x=>[x.id,x]));
    const expectedAvailable=(contract.reportCatalog||[]).filter(x=>x.availability==='available').map(x=>x.id);
    const expectedPending=(contract.reportCatalog||[]).filter(x=>x.availability==='pending_source').map(x=>x.id);
    for(const id of expectedAvailable)if(catalogById.get(id)?.availability!=='available')add(blockers,'report_capability_available_mismatch',{id,value:catalogById.get(id)?.availability},'available');
    for(const id of expectedPending)if(catalogById.get(id)?.availability!=='pending_source')add(blockers,'report_capability_pending_mismatch',{id,value:catalogById.get(id)?.availability},'pending_source');
    if(observed.availableReport.available!==true||observed.availableReport.level!=='periodCountry'||observed.availableReport.rows!==2)add(blockers,'available_report_contract_mismatch',observed.availableReport,{available:true,level:'periodCountry',rows:2});
    if(observed.branchReport.available!==true||observed.branchReport.level!=='branch'||observed.branchReport.rows<1)add(blockers,'branch_report_contract_mismatch',observed.branchReport,{available:true,level:'branch',rows:'> 0'});
    if(observed.pendingReport.available!==false||observed.pendingReport.reason!=='pending_source'||observed.pendingReport.rows!==0)add(blockers,'pending_report_contract_mismatch',observed.pendingReport,{available:false,reason:'pending_source',rows:0});

    const forbidden=['email','mail','phone','telefono','whatsapp','dpi','banco','cuenta','ctanum','direccion','address'];
    const leaked=[...(observed.rowKeys||[]),...(observed.branchKeys||[])].filter(k=>forbidden.includes(String(k).toLowerCase()));
    if(leaked.length)add(blockers,'pii_keys_in_projection',[...new Set(leaked)],[]);
    if((observed.frontend?.formatsPending||[]).length)add(warnings,'frontend_formats_pending',observed.frontend.formatsPending,[]);
  }
  if(pageErrors.length)add(blockers,'page_errors',pageErrors,[]);
  if(consoleErrors.length)add(blockers,'console_errors',consoleErrors,[]);
  await page.screenshot({path:path.join(outDir,'tya-corte1-report-projection.png'),fullPage:true});
  const decision=blockers.length?'HOLD_CORTE1_REPORT_PROJECTION_BROWSER':warnings.length?'PASS_WITH_REVIEW_CORTE1_REPORT_PROJECTION_BROWSER':'PASS_CORTE1_REPORT_PROJECTION_BROWSER';
  const result={ok:blockers.length===0,decision,baseUrl,contractFile,blockers,warnings,pageErrors,consoleErrors,observed};
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(result,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 report projection browser gate\n\n- Decision: \`${decision}\`\n- Contract: \`${contractFile}\`\n- Blockers: ${blockers.length}\n- Warnings: ${warnings.length}\n- Page errors: ${pageErrors.length}\n- Console errors: ${consoleErrors.length}\n- Period/country rows: ${observed.rows?.length||0}\n- Branch rows: ${observed.branchRows?.length||0}\n`,'utf8');
  console.log(JSON.stringify(result,null,2));
  if(blockers.length)process.exitCode=1;
} finally {
  await browser.close();
}
