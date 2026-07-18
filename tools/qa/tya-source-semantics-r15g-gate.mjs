#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R15G source semantics gate.

  Verifies the source-safe payload and connection context before human visual review.
  A fresh build-time HR snapshot is accepted for this gate but is explicitly
  reported as not being runtime live synchronization.

  Shopper counts are source-derived. Drift against the last audited reference is
  reviewable and must not be hidden, but it does not block visual runtime while
  the source-level R11D review queue remains the authority for historical identity
  completeness. Array/count inconsistency, empty shoppers or invented identities
  remain blockers. This gate never materializes, deletes or completes identities.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = valueOf('--base-url', process.env.CXORBIA_BASE_URL || 'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1');
const outDir = path.resolve(valueOf('--out', '.tmp/tya-source-semantics-r15g'));
const maxAgeHours = Number(process.env.CXORBIA_MAX_SOURCE_AGE_HOURS || 24);
const expected = {
  tenantId: process.env.CXORBIA_EXPECT_TENANT_ID || 'tya',
  projectId: process.env.CXORBIA_EXPECT_PROJECT_ID || 'cinepolis',
  periods: Number(process.env.CXORBIA_EXPECT_PERIODS || 14),
  visits: Number(process.env.CXORBIA_EXPECT_VISITS || 616),
  shopperReference: Number(process.env.CXORBIA_EXPECT_SHOPPERS || 216)
};
fs.mkdirSync(outDir, { recursive:true });

const report = {
  schemaVersion:'1.1.1',
  gate:'tya-source-semantics-r15g',
  generatedAt:new Date().toISOString(),
  baseUrl,
  expected,
  shopperCompletenessAuthority:'R11D_review_queue',
  observed:null,
  blockers:[],
  warnings:[],
  pageErrors:[],
  consoleErrors:[],
  decision:'HOLD_NOT_RUN',
  safeState:{browserReadOnly:true,writes:false,imports:false,shopperMaterialization:false,shopperDeletion:false,deploy:false,production:false,providers:false,payments:false}
};
const add = (list, code, detail='') => {
  const value = detail ? `${code}:${detail}` : code;
  if (!list.includes(value)) list.push(value);
};
const block = (code, detail='') => add(report.blockers, code, detail);
const warn = (code, detail='') => add(report.warnings, code, detail);

const browser = await chromium.launch({headless:true});
try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(String(error?.message || error).slice(0,300)));
  page.on('console', message => { if(message.type()==='error') report.consoleErrors.push(message.text().slice(0,300)); });
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('cx_demo_mode','off');
      localStorage.setItem('cx_banners','[]');
      sessionStorage.setItem('cx_pwa_shown','1');
    } catch {}
  });
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(() => Boolean(window.CX_TYA_HR_SOURCE_SAFE && window.CX?.data && window.CX_TYA_VISIBLE_DATA_READY),null,{timeout:30000});

  const observed = await page.evaluate(() => {
    const snapshot = window.CX_TYA_HR_SOURCE_SAFE || {};
    const data = window.CX?.data || {};
    const visits = Array.isArray(snapshot.visits) ? snapshot.visits : [];
    const shoppers = Array.isArray(snapshot.shoppers) ? snapshot.shoppers : [];
    const dateFields = ['disponibleDesde','agendada','realizada','cuestFecha','submittedAt'];
    const numericDateSignals = visits.reduce((count, visit) => count + dateFields.filter(field => /^\d{3,6}(?:\.0+)?$/.test(String(visit?.[field] ?? '').trim())).length, 0);
    const submittedAsLiquidated = visits.filter(visit => visit?.estado === 'liquidada' && Boolean(visit?.submittedAt || visit?.submit) && !['confirmed'].includes(visit?.paymentState) && !['confirmed'].includes(visit?.liquidationState)).length;
    const submittedWithoutWorkflowState = visits.filter(visit => Boolean(visit?.submittedAt || visit?.submit) && visit?.workflowState !== 'submitted_by_tya').length;
    const genericProjects = (data.projects || []).filter(project => ['retail','banca','food'].includes(project?.id)).length;
    const generatedAt = snapshot.generatedAt || null;
    const ageHours = generatedAt ? (Date.now() - new Date(generatedAt).getTime()) / 3600000 : null;
    return {
      sourceSafe:snapshot.sourceSafe === true,
      imported:snapshot.imported === true,
      production:snapshot.production === true,
      generatedAt,
      ageHours,
      tenantId:snapshot.tenantId || null,
      projectId:snapshot.projectId || null,
      periodCount:snapshot.counts?.periods ?? snapshot.periods?.length ?? null,
      visitCount:snapshot.counts?.visits ?? visits.length,
      shopperCount:snapshot.counts?.shoppers ?? shoppers.length,
      shopperArrayCount:shoppers.length,
      numericDateSignals,
      submittedAsLiquidated,
      submittedWithoutWorkflowState,
      submittedCount:snapshot.counts?.submitted ?? visits.filter(v=>v?.submittedAt || v?.submit).length,
      liquidationCandidatesPendingFinancialMatch:snapshot.counts?.liquidationCandidatesPendingFinancialMatch ?? null,
      paymentConfirmed:snapshot.counts?.paymentConfirmed ?? null,
      semanticNormalizer:snapshot.source?.semanticNormalizer || null,
      buildTimeSnapshot:snapshot.source?.buildTimeSnapshot === true,
      runtimeLiveSync:snapshot.source?.runtimeLiveSync === true,
      sourceAccessMode:snapshot.source?.accessMode || null,
      sourceMode:data.sourceMode || null,
      activeProjectId:data.currentProjectId || null,
      activePeriodId:data.currentPeriodId || null,
      projectAccessorId:data.project?.()?.id || null,
      periodAccessorId:data.period?.()?.id || null,
      context:data.ctx?.() || null,
      currentPeriodVisits:data.visitas?.()?.length ?? null,
      genericProjects
    };
  });
  report.observed = observed;

  if(!observed.sourceSafe || observed.imported || observed.production) block('unsafe_source_state');
  if(observed.tenantId !== expected.tenantId) block('tenant_mismatch',`${observed.tenantId}/${expected.tenantId}`);
  if(observed.projectId !== expected.projectId) block('source_project_mismatch',`${observed.projectId}/${expected.projectId}`);
  if(observed.periodCount !== expected.periods) block('period_count_mismatch',`${observed.periodCount}/${expected.periods}`);
  if(observed.visitCount !== expected.visits) block('visit_count_mismatch',`${observed.visitCount}/${expected.visits}`);
  if(!Number.isFinite(observed.shopperCount) || observed.shopperCount <= 0) block('shopper_count_empty_or_invalid',String(observed.shopperCount));
  if(observed.shopperCount !== observed.shopperArrayCount) block('shopper_count_array_mismatch',`${observed.shopperCount}/${observed.shopperArrayCount}`);
  if(observed.shopperCount !== expected.shopperReference) warn('shopper_count_drift_review',`${observed.shopperCount}/${expected.shopperReference}`);
  if(observed.numericDateSignals) block('raw_numeric_spreadsheet_dates',String(observed.numericDateSignals));
  if(observed.submittedAsLiquidated) block('submitted_conflated_with_liquidated',String(observed.submittedAsLiquidated));
  if(observed.submittedWithoutWorkflowState) block('submitted_missing_operational_state',String(observed.submittedWithoutWorkflowState));
  if(observed.semanticNormalizer !== 'r15g') block('r15g_semantic_normalizer_missing');
  if(!observed.generatedAt || !Number.isFinite(observed.ageHours)) block('source_generated_at_missing_or_invalid');
  else if(observed.ageHours < -1 || observed.ageHours > maxAgeHours) block('source_snapshot_stale',`${observed.ageHours.toFixed(2)}h/${maxAgeHours}h`);
  if(observed.activeProjectId !== expected.projectId) block('active_root_project_mismatch',String(observed.activeProjectId));
  if(!observed.activePeriodId || observed.activePeriodId === observed.activeProjectId) block('project_period_identity_collapsed');
  if(observed.projectAccessorId !== expected.projectId) block('project_accessor_mismatch',String(observed.projectAccessorId));
  if(observed.periodAccessorId !== observed.activePeriodId) block('period_accessor_mismatch',String(observed.periodAccessorId));
  if(observed.context?.tenantId !== expected.tenantId || observed.context?.projectId !== expected.projectId || observed.context?.periodId !== observed.activePeriodId) block('canonical_context_mismatch');
  if(observed.currentPeriodVisits !== 44) block('current_period_visit_scope_mismatch',String(observed.currentPeriodVisits));
  if(observed.genericProjects) block('demo_projects_visible_in_tya_source',String(observed.genericProjects));
  if(observed.buildTimeSnapshot && !observed.runtimeLiveSync) warn('dev_uses_fresh_build_time_hr_snapshot_not_runtime_sync');
  if(report.pageErrors.length) block('page_errors',String(report.pageErrors.length));
  if(report.consoleErrors.length) warn('console_errors',String(report.consoleErrors.length));

  await page.screenshot({path:path.join(outDir,'tya-source-semantics-r15g.png'),fullPage:true});
  await context.close();
} catch(error) {
  block('gate_fatal',String(error?.message || error).slice(0,350));
} finally {
  await browser.close();
}

report.blockers=[...new Set(report.blockers)];
report.warnings=[...new Set(report.warnings)];
report.ok=report.blockers.length===0;
report.decision=report.ok?(report.warnings.length?'PASS_WITH_WARNING_R15G_TYA_SOURCE_SEMANTICS':'PASS_R15G_TYA_SOURCE_SEMANTICS'):'HOLD_R15G_TYA_SOURCE_SEMANTICS';
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),[
  '# TyA R15G source semantics gate','',
  `Decision: **${report.decision}**`,'',
  `Blockers: ${report.blockers.length}`,
  `Warnings: ${report.warnings.length}`,'',
  '## Blockers',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none']),'',
  '## Warnings',...(report.warnings.length?report.warnings.map(x=>`- ${x}`):['- none']),'',
  'Shopper drift is reviewable under R11D; it does not authorize materialization or deletion of historical identities.','',
  'Build-time snapshot PASS in this local/DEV gate does not mean runtime HR sync or production readiness.',''
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok) process.exit(1);
