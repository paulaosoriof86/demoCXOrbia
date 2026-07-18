#!/usr/bin/env node
/*
  CXOrbia TyA — project/period/KPI/history semantic gate.

  Validates the exact cross-layer defect class that previously escaped syntax and route smoke:
  - project and period identities are separate;
  - the 14 HR periods are unique and each owns exactly 44 visits;
  - changing MAY/JUN/JUL changes the active visit set and all consumers see the same context;
  - financial/liquidation KPI calculations remain scoped to the active period;
  - June is executed and remains liquidation/payment control, not pending visits;
  - payment control is proven from canonical visit states or the approved period-level
    source-safe financial-control envelope, never inferred as paid.

  Source-safe browser test only. No providers, writes, imports, deploy or production.
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
const outDir = path.resolve(valueOf('--out', '.tmp/tya-project-period-kpi-history-gate'));
const expected = {
  tenantId: process.env.CXORBIA_EXPECT_TENANT_ID || 'tya',
  projectId: process.env.CXORBIA_EXPECT_PROJECT_ID || 'cinepolis',
  periods: Number(process.env.CXORBIA_EXPECT_PERIODS || 14),
  visits: Number(process.env.CXORBIA_EXPECT_VISITS || 616),
  visitsPerPeriod: Number(process.env.CXORBIA_EXPECT_VISITS_PER_PERIOD || 44),
  keys: ['2026-05','2026-06','2026-07']
};

fs.mkdirSync(outDir, { recursive: true });
const report = {
  schemaVersion:'1.2.0',
  gate: 'tya-project-period-kpi-history-gate',
  generatedAt: new Date().toISOString(),
  baseUrl,
  expected,
  context: null,
  periods: [],
  snapshots: [],
  blockers: [],
  warnings: [],
  decision: 'HOLD_NOT_RUN',
  safeState: { sourceSafe:true, writes:false, imported:false, production:false, providersWritten:false, paymentsExecuted:false, paymentsInferred:false }
};
const block = (code, detail='') => report.blockers.push(detail ? `${code}:${detail}` : code);
const warn = (code, detail='') => report.warnings.push(detail ? `${code}:${detail}` : code);
const unique = values => new Set(values).size === values.length;

const browser = await chromium.launch({ headless:true });
try {
  const context = await browser.newContext({ viewport:{width:1440,height:1000}, serviceWorkers:'block' });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error?.message || error).slice(0,240)));
  page.on('console', message => { if(message.type()==='error') consoleErrors.push(message.text().slice(0,240)); });
  await page.addInitScript(() => {
    window.CX_TYA_PHASE_A_PREVIEW = true;
    try { localStorage.setItem('cx_demo_mode','off'); localStorage.setItem('cx_banners','[]'); sessionStorage.setItem('cx_pwa_shown','1'); } catch {}
  });
  await page.goto(baseUrl, { waitUntil:'domcontentloaded', timeout:30000 });
  await page.waitForFunction(() => Boolean(window.CX?.data && window.CX_TYA_HR_SOURCE_SAFE && window.CX_TYA_R18D_VISIBLE_READY), null, { timeout:20000 });

  const inventory = await page.evaluate(() => {
    const data = window.CX.data;
    const source = window.CX_TYA_HR_SOURCE_SAFE;
    const visibleContract = window.CX_TYA_R18D_VISIBLE_CONTRACT || null;
    const periods = Array.isArray(data.projects) ? data.projects.map(p => ({
      id:p.id,
      parentProjectId:p.parentProjectId || p.program || null,
      program:data.programKey ? data.programKey(p) : p.program,
      periodKey:p.periodKey,
      name:p.name,
      nVisitas:p.nVisitas
    })) : [];
    const visitCounts = {};
    for(const visit of data._visitas || []) visitCounts[visit.projectId] = (visitCounts[visit.projectId] || 0) + 1;
    return {
      source:{tenantId:source.tenantId,projectId:source.projectId,sourceSafe:source.sourceSafe===true,imported:source.imported===true,production:source.production===true,counts:source.counts},
      currentProjectId:data.currentProjectId,
      currentPeriodId:data.currentPeriodId,
      project:data.project ? data.project() : null,
      period:data.period ? data.period() : null,
      ctx:data.ctx ? data.ctx() : null,
      periods,
      visitCounts,
      totalVisits:(data._visitas || []).length,
      programs:data.programs ? data.programs().map(pg=>({key:pg.key,name:pg.name,periodCount:(pg.periods||[]).length})) : [],
      financialControl:data.financialControl || null,
      visibleContract
    };
  });
  report.context = inventory;
  report.periods = inventory.periods;

  if(inventory.source.tenantId !== expected.tenantId) block('tenant_mismatch', `${inventory.source.tenantId}/${expected.tenantId}`);
  if(inventory.source.projectId !== expected.projectId) block('source_project_mismatch', `${inventory.source.projectId}/${expected.projectId}`);
  if(!inventory.source.sourceSafe || inventory.source.imported || inventory.source.production) block('unsafe_source_state');
  if(inventory.currentProjectId !== expected.projectId) block('active_project_identity_mismatch', String(inventory.currentProjectId));
  if(!inventory.currentPeriodId || inventory.currentPeriodId === inventory.currentProjectId) block('project_period_identity_collapsed');
  if(inventory.project?.id !== expected.projectId) block('project_accessor_identity_mismatch', String(inventory.project?.id));
  if(inventory.period?.id !== inventory.currentPeriodId) block('period_accessor_identity_mismatch', String(inventory.period?.id));
  if(inventory.project?.id === inventory.period?.id) block('project_period_accessors_same_identity');
  if(inventory.ctx?.projectId !== expected.projectId || inventory.ctx?.periodId !== inventory.currentPeriodId) block('ctx_not_aligned');
  if(inventory.periods.length !== expected.periods) block('period_count_mismatch', `${inventory.periods.length}/${expected.periods}`);
  if(!unique(inventory.periods.map(p=>p.id))) block('duplicate_period_ids');
  if(!unique(inventory.periods.map(p=>p.periodKey))) block('duplicate_period_keys');
  if(inventory.programs.length !== 1 || inventory.programs[0]?.key !== expected.projectId || inventory.programs[0]?.periodCount !== expected.periods) block('project_does_not_group_all_periods');
  if(inventory.totalVisits !== expected.visits) block('total_visit_count_mismatch', `${inventory.totalVisits}/${expected.visits}`);
  for(const period of inventory.periods){
    if(period.program !== expected.projectId) block('period_parent_project_mismatch', `${period.periodKey}:${period.program}`);
    const count = Number(inventory.visitCounts[period.id] || 0);
    if(count !== expected.visitsPerPeriod) block('period_visit_count_mismatch', `${period.periodKey}:${count}/${expected.visitsPerPeriod}`);
  }

  const financialControl = inventory.financialControl;
  if(!financialControl || financialControl.tenantId !== expected.tenantId || financialControl.projectId !== expected.projectId) {
    block('period_financial_control_envelope_missing_or_mismatched');
  } else {
    if(financialControl.sourceSafe !== true || financialControl.imported !== false || financialControl.production !== false || financialControl.providerWrites !== false) block('unsafe_period_financial_control_envelope');
    if(!Array.isArray(financialControl.payments) || financialControl.payments.length !== 0 || !Array.isArray(financialControl.batches) || financialControl.batches.length !== 0) block('period_financial_control_contains_unapproved_payment_records');
    if(financialControl.cutPeriod !== '2026-06' || financialControl.sourceStatus !== 'pending_financial_source') block('june_period_financial_control_status_mismatch');
  }
  if(inventory.visibleContract?.junePaymentControlPresent !== true) block('june_visible_financial_control_not_exposed');
  if(inventory.visibleContract?.paidConfirmed !== 0 || inventory.visibleContract?.paymentLotsCreated !== 0) block('visible_financial_control_falsely_confirms_payment');

  for(const key of expected.keys){
    const snapshot = await page.evaluate(periodKey => {
      const data = window.CX.data;
      const period = data.projects.find(p => p.periodKey === periodKey);
      if(!period) return {periodKey, missing:true};
      const before = {projectId:data.currentProjectId,periodId:data.currentPeriodId};
      const changed = data.setCurrentPeriod ? data.setCurrentPeriod(period.id) : false;
      const visits = data.visitas ? data.visitas() : [];
      const posts = data.posts ? data.posts() : [];
      const liquidations = window.CX.liq?.forProject ? window.CX.liq.forProject(data) : [];
      const finance = window.CX.fin?.porPais ? window.CX.fin.porPais(data) : {};
      const statusCounts = visits.reduce((acc,v)=>{const key=String(v.estado||'unknown');acc[key]=(acc[key]||0)+1;return acc;},{});
      const countryCounts = visits.reduce((acc,v)=>{const key=String(v.pais||v.country||'UNKNOWN');acc[key]=(acc[key]||0)+1;return acc;},{});
      const submissionStateCounts = visits.reduce((acc,v)=>{const key=String(v.submissionState||'unknown');acc[key]=(acc[key]||0)+1;return acc;},{});
      const liquidationStateCounts = visits.reduce((acc,v)=>{const key=String(v.liquidationState||'unknown');acc[key]=(acc[key]||0)+1;return acc;},{});
      const paymentStateCounts = visits.reduce((acc,v)=>{const key=String(v.paymentState||'unknown');acc[key]=(acc[key]||0)+1;return acc;},{});
      const visitIds = visits.map(v=>v.id).sort();
      const executionEvidence = visits.filter(v=>Boolean(v.realizada||v.cuestFecha||v.submittedAt||v.submit)).length;
      const pendingExecution = visits.length - executionEvidence;
      const confirmedPaymentStates = new Set(['paid','payment_confirmed_external','confirmed']);
      const pendingPaymentStates = new Set(['pending_financial_source','pending_financial_review','pending_payment_evidence']);
      const liquidationCandidateStates = new Set(['liquidation_candidate','liquidation_candidate_exact_financial_link']);
      const isPaymentConfirmed = v => v.paymentConfirmed === true || Boolean(v.paymentSourceRef) || confirmedPaymentStates.has(String(v.paymentState||''));
      const hasExplicitPaymentControl = v =>
        v.paymentControlOnly === true ||
        Boolean(v.financialControl) ||
        pendingPaymentStates.has(String(v.paymentState||'')) ||
        liquidationCandidateStates.has(String(v.liquidationState||'')) ||
        v.submissionState === 'submitted_by_tya' ||
        Boolean(v.submit || v.submittedAt) ||
        ['liquidada','cuestionario'].includes(String(v.estado||''));
      const paymentConfirmed = visits.filter(isPaymentConfirmed).length;
      const paymentPending = visits.filter(v=>!isPaymentConfirmed(v) && hasExplicitPaymentControl(v)).length;
      const financialControlCount = visits.filter(v=>Boolean(v.financialControl) || v.paymentControlOnly === true).length;
      const financeVisits = Object.values(finance||{}).reduce((sum,row)=>sum+Number(row?.visRe||0),0);
      const periodControl = data.financialControl || null;
      const juneClaim = periodKey === periodControl?.cutPeriod ? periodControl?.claims?.june || null : null;
      const periodPaymentControl = {
        present: Boolean(
          juneClaim &&
          periodControl?.sourceStatus === 'pending_financial_source' &&
          String(juneClaim.q1 || '').includes('pending') &&
          String(juneClaim.q2 || '').includes('pending')
        ),
        sourceStatus:periodControl?.sourceStatus || null,
        cutPeriod:periodControl?.cutPeriod || null,
        q1:juneClaim?.q1 || null,
        q2:juneClaim?.q2 || null,
        payments:Array.isArray(periodControl?.payments) ? periodControl.payments.length : null,
        batches:Array.isArray(periodControl?.batches) ? periodControl.batches.length : null
      };
      return {
        periodKey,
        missing:false,
        changed,
        before,
        projectId:data.currentProjectId,
        periodId:data.currentPeriodId,
        projectAccessorId:data.project?.()?.id,
        periodAccessorId:data.period?.()?.id,
        ctx:data.ctx?.(),
        visitCount:visits.length,
        postCount:posts.length,
        liquidationCount:liquidations.length,
        financeVisits,
        financialControlCount,
        periodPaymentControl,
        statusCounts,
        submissionStateCounts,
        liquidationStateCounts,
        paymentStateCounts,
        countryCounts,
        executionEvidence,
        pendingExecution,
        paymentConfirmed,
        paymentPending,
        firstVisitId:visitIds[0]||null,
        lastVisitId:visitIds.at(-1)||null,
        visitIdSignature:visitIds.join('|')
      };
    }, key);
    report.snapshots.push(snapshot);
    if(snapshot.missing){ block('required_period_missing', key); continue; }
    if(!snapshot.changed) block('period_switch_rejected', key);
    if(snapshot.projectId !== expected.projectId) block('project_changed_when_period_changed', `${key}:${snapshot.projectId}`);
    if(snapshot.periodId !== snapshot.periodAccessorId) block('period_context_not_propagated', key);
    if(snapshot.projectAccessorId !== expected.projectId) block('project_accessor_changed', key);
    if(snapshot.ctx?.projectId !== expected.projectId || snapshot.ctx?.periodId !== snapshot.periodId) block('consumer_context_mismatch', key);
    if(snapshot.visitCount !== expected.visitsPerPeriod) block('active_period_visit_scope_mismatch', `${key}:${snapshot.visitCount}`);
    if(snapshot.countryCounts.GT !== 34 || snapshot.countryCounts.HN !== 10) block('active_period_country_scope_mismatch', `${key}:${JSON.stringify(snapshot.countryCounts)}`);
    if(snapshot.financeVisits !== snapshot.liquidationCount) block('finance_kpi_mixes_periods', `${key}:${snapshot.financeVisits}/${snapshot.liquidationCount}`);
    if(snapshot.financeVisits > expected.visitsPerPeriod || snapshot.liquidationCount > expected.visitsPerPeriod) block('kpi_exceeds_active_period', key);
    if(key === '2026-06'){
      if(snapshot.pendingExecution !== 0) block('june_has_pending_execution', String(snapshot.pendingExecution));
      if(snapshot.liquidationCount <= 0 || snapshot.financeVisits <= 0) block('june_liquidation_control_missing');
      if(snapshot.paymentConfirmed !== 0) block('june_payment_falsely_confirmed', String(snapshot.paymentConfirmed));
      if(snapshot.paymentPending <= 0 && snapshot.periodPaymentControl?.present !== true) block('june_payment_control_missing');
      if(snapshot.periodPaymentControl?.payments !== 0 || snapshot.periodPaymentControl?.batches !== 0) block('june_period_control_contains_payment_records');
    }
  }

  const signatures = report.snapshots.filter(s=>!s.missing).map(s=>s.visitIdSignature);
  if(signatures.length === expected.keys.length && !unique(signatures)) block('period_switch_returns_same_visit_set');
  const statusSignatures = report.snapshots.filter(s=>!s.missing).map(s=>JSON.stringify(s.statusCounts));
  if(statusSignatures.length === expected.keys.length && new Set(statusSignatures).size === 1) warn('may_june_july_status_distribution_identical_review');
  if(pageErrors.length) block('page_errors', String(pageErrors.length));
  if(consoleErrors.length) warn('console_errors', String(consoleErrors.length));

  await page.screenshot({path:path.join(outDir,'tya-project-period-kpi-history.png'),fullPage:true});
  await context.close();
} catch(error){
  block('gate_fatal', String(error?.message || error).slice(0,300));
} finally {
  await browser.close();
}

report.blockers = [...new Set(report.blockers)];
report.warnings = [...new Set(report.warnings)];
report.ok = report.blockers.length === 0;
report.decision = report.ok ? (report.warnings.length ? 'PASS_WITH_REVIEW_TYA_PROJECT_PERIOD_KPI_HISTORY' : 'PASS_TYA_PROJECT_PERIOD_KPI_HISTORY') : 'HOLD_TYA_PROJECT_PERIOD_KPI_HISTORY';
fs.writeFileSync(path.join(outDir,'report.json'), JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'), [
  '# TyA project / period / KPI / history gate','',
  `Decision: **${report.decision}**`,
  `Periods: ${report.periods.length}`,
  `Snapshots: ${report.snapshots.length}`,
  `Blockers: ${report.blockers.length}`,
  `Warnings: ${report.warnings.length}`,'',
  '## Blockers',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none']),'',
  '## Warnings',...(report.warnings.length?report.warnings.map(x=>`- ${x}`):['- none']),'',
  'June payment control is proven only by canonical pending states, protected financial-control links or the approved period-level source-safe envelope; paid is never inferred.','',
  '## Safe state','- source-safe only','- no writes/import/deploy/production/providers/payments',''
].join('\n'),'utf8');
console.log(JSON.stringify(report,null,2));
if(!report.ok) process.exit(1);
