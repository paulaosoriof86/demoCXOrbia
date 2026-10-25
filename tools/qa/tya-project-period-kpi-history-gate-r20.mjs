#!/usr/bin/env node
/*
  CXOrbia TyA Phase A R20 — project/period/KPI/history gate.

  Validates the canonical public contract instead of legacy internal arrays or
  terminal labels. `submitida` remains realized/questionnaire/submitted; it is
  not treated as an unexecuted visit. Browser-only/read-only.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const baseUrl=valueOf('--base-url',process.env.CXORBIA_BASE_URL||'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible');
const outDir=path.resolve(valueOf('--out','.tmp/tya-project-period-kpi-history-r20'));
fs.mkdirSync(outDir,{recursive:true});

const report={schemaVersion:'2.0.0',gate:'tya-project-period-kpi-history-r20',generatedAt:new Date().toISOString(),baseUrl,observed:null,blockers:[],warnings:[],decision:'HOLD_NOT_RUN',safeState:{browserReadOnly:true,writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}};
const block=(code,detail='')=>report.blockers.push(detail?`${code}:${detail}`:code);
const warn=(code,detail='')=>report.warnings.push(detail?`${code}:${detail}`:code);

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
  const page=await context.newPage();
  const pageErrors=[],consoleErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.message||error).slice(0,300)));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text().slice(0,300));});
  await page.addInitScript(()=>{try{localStorage.clear();sessionStorage.clear();sessionStorage.setItem('cx_pwa_shown','1');localStorage.setItem('cx_banners','[]');}catch{}});
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>Boolean(window.CX_TYA_HR_SOURCE_SAFE&&window.CX?.data&&window.CX_TYA_VISIBLE_DATA_READY),null,{timeout:30000});

  report.observed=await page.evaluate(()=>{
    const snapshot=window.CX_TYA_HR_SOURCE_SAFE||{};
    const data=window.CX?.data||{};
    const summaries=Array.isArray(snapshot.periodOperationalSummary)?snapshot.periodOperationalSummary:[];
    const periods=Array.isArray(snapshot.periods)?snapshot.periods:[];
    const sourceVisits=Array.isArray(snapshot.visits)?snapshot.visits:[];
    const keys=summaries.map(row=>row.periodKey);
    const byKey=Object.fromEntries(summaries.map(row=>[row.periodKey,row]));
    const originalPeriod=data.currentPeriodId;
    const switchResults=[];
    for(const period of periods){
      data.currentPeriodId=period.id;
      const rows=typeof data.visitas==='function'?data.visitas():[];
      const kpis=typeof data.periodKpis==='function'?data.periodKpis(period.key):null;
      switchResults.push({periodKey:period.key,periodId:period.id,rowCount:rows.length,kpis,firstVisitId:rows[0]?.id||null});
    }
    data.currentPeriodId=originalPeriod;
    const recent=typeof data.recentPeriodKpis==='function'?data.recentPeriodKpis(3):[];
    const currentRows=typeof data.visitas==='function'?data.visitas():[];
    const facets=typeof data.visitFacets==='function'?currentRows.map(row=>data.visitFacets(row)):[];
    const currentBuckets={
      total:currentRows.length,
      assigned:facets.filter(item=>item.assigned).length,
      unassigned:facets.filter(item=>!item.assigned&&!item.cancelled).length,
      pendingSchedule:facets.filter(item=>item.assigned&&!item.scheduled&&!item.realized&&!item.cancelled).length,
      realized:facets.filter(item=>item.realized).length,
      pendingQuestionnaire:facets.filter(item=>item.realized&&!item.questionnaire&&!item.cancelled).length,
      questionnaireCompleted:facets.filter(item=>item.questionnaire).length,
      pendingSubmission:facets.filter(item=>item.questionnaire&&!item.submitted&&!item.cancelled).length,
      submitted:facets.filter(item=>item.submitted).length,
      liquidationCandidates:facets.filter(item=>item.liquidationCandidate).length,
      paymentConfirmed:facets.filter(item=>item.paymentConfirmed).length
    };
    return {
      tenantId:snapshot.tenantId||null,
      sourceProjectId:snapshot.projectId||null,
      currentProjectId:data.currentProjectId||null,
      currentPeriodId:data.currentPeriodId||null,
      context:typeof data.ctx==='function'?data.ctx():null,
      sourcePeriodCount:periods.length,
      sourceVisitCount:sourceVisits.length,
      periodSummaryCount:summaries.length,
      uniquePeriodKeys:new Set(keys).size,
      firstPeriodKey:keys[0]||null,
      lastPeriodKey:keys.at(-1)||null,
      periodKeys:keys,
      allPeriods44:summaries.every(row=>row.total===44),
      allCountrySplit:summaries.every(row=>row.byCountry?.GT===34&&row.byCountry?.HN===10),
      nonMonotonic:summaries.filter(row=>row.submitted>row.questionnaireCompleted||row.questionnaireCompleted>row.realized||row.realized>row.total).map(row=>row.periodKey),
      may2026:byKey['2026-05']||null,
      june2026:byKey['2026-06']||null,
      july2026:byKey['2026-07']||null,
      switchResults,
      recent,
      currentBuckets,
      currentSummary:byKey[String(data.currentPeriodId||'').replace(/^cinepolis-/,'')]||null,
      sourceAccessMode:snapshot.source?.accessMode||null,
      sourceHistoryScope:snapshot.normalization?.historyScope||null,
      runtimeLiveSync:snapshot.source?.runtimeLiveSync===true
    };
  });

  const o=report.observed;
  if(o.tenantId!=='tya')block('tenant_mismatch',String(o.tenantId));
  if(o.sourceProjectId!=='cinepolis'||o.currentProjectId!=='cinepolis')block('root_project_mismatch',`${o.sourceProjectId}/${o.currentProjectId}`);
  if(!o.currentPeriodId||o.currentPeriodId===o.currentProjectId)block('project_period_identity_collapsed');
  if(o.context?.tenantId!=='tya'||o.context?.projectId!=='cinepolis'||o.context?.periodId!==o.currentPeriodId)block('context_mismatch');
  if(o.sourcePeriodCount!==14||o.periodSummaryCount!==14||o.uniquePeriodKeys!==14)block('historical_period_count_mismatch',`${o.sourcePeriodCount}/${o.periodSummaryCount}/${o.uniquePeriodKeys}`);
  if(o.sourceVisitCount!==616)block('historical_visit_count_mismatch',String(o.sourceVisitCount));
  if(o.firstPeriodKey!=='2025-06'||o.lastPeriodKey!=='2026-07')block('historical_range_mismatch',`${o.firstPeriodKey}/${o.lastPeriodKey}`);
  if(!o.allPeriods44)block('period_visit_totals_not_44');
  if(!o.allCountrySplit)block('period_country_split_not_34_10');
  if(o.nonMonotonic.length)block('non_monotonic_operational_history',o.nonMonotonic.join(','));
  if(!o.may2026||o.may2026.realized!==44||o.may2026.questionnaireCompleted!==44||o.may2026.submitted!==44)block('may_2026_not_fully_executed_submitted',JSON.stringify(o.may2026));
  if(!o.june2026||o.june2026.realized!==44||o.june2026.questionnaireCompleted!==44||o.june2026.submitted!==44)block('june_2026_not_fully_executed_submitted',JSON.stringify(o.june2026));
  if(o.may2026?.paymentConfirmed!==0||o.june2026?.paymentConfirmed!==0)block('historical_payment_inferred_without_financial_source');
  if(!o.july2026||o.july2026.total!==44||o.july2026.unassigned<=0)block('july_2026_assignment_reality_missing',JSON.stringify(o.july2026));
  if(o.switchResults.length!==14)block('period_switch_result_count_mismatch',String(o.switchResults.length));
  for(const result of o.switchResults){
    if(result.rowCount!==44)block('period_switch_row_count_mismatch',`${result.periodKey}:${result.rowCount}`);
    if(!result.kpis||result.kpis.periodKey!==result.periodKey||result.kpis.total!==44)block('period_kpi_contract_mismatch',result.periodKey);
  }
  if(!Array.isArray(o.recent)||o.recent.length!==3||o.recent.map(item=>item.periodKey).join(',')!=='2026-05,2026-06,2026-07')block('recent_period_history_mismatch',JSON.stringify(o.recent));
  if(!o.currentSummary)block('current_period_summary_missing');
  else for(const key of ['total','assigned','unassigned','pendingSchedule','realized','pendingQuestionnaire','questionnaireCompleted','pendingSubmission','submitted','liquidationCandidates','paymentConfirmed']){
    if(Number(o.currentBuckets[key])!==Number(o.currentSummary[key]))block('current_bucket_summary_mismatch',`${key}:${o.currentBuckets[key]}/${o.currentSummary[key]}`);
  }
  if(!['public_gviz_gid_verified_inventory','sheets_api_service_account'].includes(o.sourceAccessMode))block('source_not_live_verified',String(o.sourceAccessMode));
  if(!['all_verified_hr_periods','all_detected_hr_periods'].includes(o.sourceHistoryScope))block('history_scope_not_verified',String(o.sourceHistoryScope));
  if(o.runtimeLiveSync)warn('runtime_live_sync_unexpected_in_build_snapshot');
  if(pageErrors.length)block('page_errors',String(pageErrors.length));
  if(consoleErrors.length)warn('console_errors',String(consoleErrors.length));
  report.pageErrors=pageErrors;report.consoleErrors=consoleErrors;
  await page.screenshot({path:path.join(outDir,'project-period-kpi-history-r20.png'),fullPage:true});
  await context.close();
}catch(error){block('gate_fatal',String(error?.message||error).slice(0,400));}
finally{await browser.close();}

report.blockers=[...new Set(report.blockers)];report.warnings=[...new Set(report.warnings)];
report.ok=report.blockers.length===0;
report.decision=report.ok?(report.warnings.length?'PASS_WITH_WARNING_R20_PROJECT_PERIOD_KPI_HISTORY':'PASS_R20_PROJECT_PERIOD_KPI_HISTORY'):'HOLD_R20_PROJECT_PERIOD_KPI_HISTORY';
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),['# TyA project/period/KPI/history R20','',`Decision: **${report.decision}**`,`Periods: ${report.observed?.sourcePeriodCount??'n/a'}`,`Visits: ${report.observed?.sourceVisitCount??'n/a'}`,'','## Blockers',...(report.blockers.length?report.blockers.map(item=>`- ${item}`):['- none']),'','## Warnings',...(report.warnings.length?report.warnings.map(item=>`- ${item}`):['- none'])].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok)process.exit(1);
