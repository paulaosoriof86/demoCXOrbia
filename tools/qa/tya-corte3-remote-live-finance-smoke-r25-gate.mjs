#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 remote live finance smoke R25.
   Validates live HR, canonical finance and immutable source-safe historical
   payments: May 2026 complete, June 2026 partial, no payment execution. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = arg('--base-url', 'https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=3');
const outDir = path.resolve(arg('--out', '.tmp/tya-corte3-remote-live-finance-smoke-r25'));
fs.mkdirSync(outDir, { recursive: true });

const report = {
  schemaVersion: '1.1.0',
  gateId: 'tya-corte3-remote-live-finance-smoke-r25',
  generatedAt: new Date().toISOString(),
  baseUrl,
  status: 'HOLD',
  readiness: null,
  summary: null,
  checks: [],
  warnings: [],
  pageErrors: [],
  consoleErrors: [],
  failedRequests: [],
  safeState: {
    sourceSafe: true,
    deploy: false,
    production: false,
    merge: false,
    imports: false,
    paymentsExecuted: 0,
    executableBatchesCreated: 0,
    writes: false
  }
};

const check = (condition, id, detail = '') => {
  report.checks.push({ id, pass: !!condition, detail });
  if (!condition) throw new Error(`${id}${detail ? `:${detail}` : ''}`);
};

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(String(error?.message || error).slice(0, 1000)));
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 1000));
  });
  page.on('requestfailed', request => report.failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText || 'request_failed'
  }));
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('cx_pwa_shown', '1');
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  let readiness = null;
  const deadline = Date.now() + 20000;
  do {
    readiness = await page.evaluate(() => {
      const scripts = [...document.scripts].map(script => script.getAttribute('src')).filter(Boolean);
      const financial = window.CX_TYA_FINANCIAL_CANONICAL_SOURCE_SAFE || null;
      const paymentHistory = window.CX_TYA_PAYMENT_HISTORY_SOURCE_SAFE || null;
      return {
        documentReadyState: document.readyState,
        cxPresent: !!window.CX,
        visibleReady: window.CX_TYA_VISIBLE_DATA_READY === true,
        financeReady: window.CX_TYA_FINANCIAL_CANONICAL_READY === true,
        paymentHistoryReady: window.CX_TYA_PAYMENT_HISTORY_READY === true,
        hrSnapshotPresent: !!window.CX_TYA_HR_SOURCE_SAFE,
        financialSnapshotPresent: !!financial,
        paymentHistoryPresent: !!paymentHistory,
        financialLiquidationCount: Array.isArray(financial?.liquidations) ? financial.liquidations.length : null,
        financialReviewCount: Array.isArray(financial?.reviewQueue) ? financial.reviewQueue.length : null,
        financialPaymentsCount: Array.isArray(financial?.payments) ? financial.payments.length : null,
        financialBatchesCount: Array.isArray(financial?.batches) ? financial.batches.length : null,
        historicalPaidItemCount: Array.isArray(paymentHistory?.paidItems) ? paymentHistory.paidItems.length : null,
        historicalPaymentGroupCount: Array.isArray(paymentHistory?.historicalPaymentGroups) ? paymentHistory.historicalPaymentGroups.length : null,
        projectCount: Array.isArray(window.CX?.data?.projects) ? window.CX.data.projects.length : null,
        visitCount: Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas.length : null,
        currentProjectId: window.CX?.data?.currentProjectId || null,
        currentPeriodId: window.CX?.data?.currentPeriodId || null,
        liveHrScriptCount: scripts.filter(src => src.includes('/api/tya/cinepolis/hr-live')).length,
        liveAdapterCount: scripts.filter(src => src.includes('tya-phase-a-source-safe-dev-adapter-r18a.js')).length,
        financialAdapterCount: scripts.filter(src => src.includes('tya-financial-canonical-source-safe-adapter.js')).length,
        financialFinalCount: scripts.filter(src => src.includes('tya-financial-canonical-source-safe-final.js')).length,
        paymentHistoryScriptCount: scripts.filter(src => src.includes('tya-payment-history-source-safe.js')).length
      };
    });
    if (readiness.visibleReady && readiness.financeReady && readiness.paymentHistoryReady) break;
    await page.waitForTimeout(250);
  } while (Date.now() < deadline);

  report.readiness = readiness;
  fs.writeFileSync(path.join(outDir, 'readiness.json'), JSON.stringify(readiness, null, 2) + '\n', 'utf8');
  check(readiness?.visibleReady === true, 'live_source_safe_data_ready', JSON.stringify(readiness));
  check(readiness?.financeReady === true, 'canonical_finance_ready', JSON.stringify(readiness));
  check(readiness?.paymentHistoryReady === true && readiness?.paymentHistoryPresent === true,
    'historical_payment_truth_ready', JSON.stringify(readiness));
  check(readiness?.liveHrScriptCount === 1 && readiness?.liveAdapterCount === 1,
    'live_hr_binding_exact', `${readiness?.liveHrScriptCount}/${readiness?.liveAdapterCount}`);
  check(readiness?.financialAdapterCount === 1 && readiness?.financialFinalCount === 1 && readiness?.paymentHistoryScriptCount === 1,
    'canonical_finance_payment_binding_exact', `${readiness?.financialAdapterCount}/${readiness?.financialFinalCount}/${readiness?.paymentHistoryScriptCount}`);

  const adminBtn = page.locator('[data-role="admin"]');
  check(await adminBtn.count() === 1, 'admin_login_available');
  await adminBtn.click();
  await page.waitForFunction(() => document.getElementById('app')?.classList.contains('on') && CX.session?.role === 'admin', null, { timeout: 30000 });

  const core = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const projects = Array.isArray(CX.data.projects) ? CX.data.projects : [];
    const selectPeriod = async key => {
      const project = projects.find(item => String(item.periodKey || '') === key) ||
        projects.find(item => String(item.id || '').includes(key));
      if (!project) throw new Error(`period_${key}_not_found`);
      const changed = typeof CX.data.setProject === 'function' ? CX.data.setProject(project.id) : false;
      if (changed === false && CX.data.period()?.id !== project.id) throw new Error(`period_${key}_not_selected`);
      await sleep(80);
      return project;
    };
    const isReview = item => item.reviewRequired === true ||
      item.financialSourceStatus === 'pending_or_review' ||
      item.liquidationState === 'pending_financial_source';
    const isPaid = item => item.paymentConfirmed === true && !!(item.paymentSourceRef || item.paymentRef);
    const summarizePeriod = async key => {
      await selectPeriod(key);
      const visits = typeof CX.data.visitas === 'function' ? CX.data.visitas() : [];
      const liquidations = CX.liq.forProject(CX.data);
      const exact = liquidations.filter(item => !isReview(item));
      const reviews = liquidations.filter(isReview);
      const paid = liquidations.filter(isPaid);
      const pendingPayment = liquidations.filter(item => !isPaid(item));
      const finance = CX.fin.porPais(CX.data);
      return {
        key,
        visits: visits.length,
        liquidationCount: liquidations.length,
        exactCount: exact.length,
        reviewCount: reviews.length,
        paidCount: paid.length,
        pendingPaymentCount: pendingPayment.length,
        paidHrRowIds: paid.map(item => String(item.hrRowId || '')).filter(Boolean).sort(),
        paidByCurrency: paid.reduce((out,item) => {
          const currency = item.moneda || 'pending_currency';
          out[currency] = (out[currency] || 0) + Number(item.total || 0);
          return out;
        }, {}),
        reviewPaymentCoexist: reviews.every(item => item.paymentConfirmed === true && !!item.paymentSourceRef),
        reviewStates: reviews.map(item => ({
          hrRowId:item.hrRowId,
          financialSourceStatus:item.financialSourceStatus,
          reviewRequired:item.reviewRequired,
          paymentConfirmed:item.paymentConfirmed,
          paymentState:item.paymentState
        })),
        cxpByCountry: Object.fromEntries(Object.entries(finance || {}).map(([country,value]) => [country, Number(value?.cxp || 0)])),
        paidRecordsByCountry: Object.fromEntries(Object.entries(finance || {}).map(([country,value]) => [country, Number(value?.pagosConfirmados || 0)]))
      };
    };

    const snapshot = CX.data.financialSnapshot || {};
    const paymentHistory = CX.data.paymentHistorySnapshot || {};
    const may = await summarizePeriod('2026-05');

    const mayVisit = (CX.data._visitas || []).find(visit => String(visit.periodKey || '') === '2026-05');
    const mayVisitContract = mayVisit ? CX.data.visitContract(mayVisit) : null;

    CX.router.nav('financiero');
    await sleep(150);
    const adminHtml = document.getElementById('view')?.innerHTML || '';
    const adminText = document.getElementById('view')?.innerText || '';
    let capturedReport = null;
    if (CX.reportKit) {
      const original = CX.reportKit.openReport;
      CX.reportKit.openReport = (spec, id) => { capturedReport = { spec, id }; };
      document.getElementById('finExport')?.click();
      await sleep(100);
      CX.reportKit.openReport = original;
    }

    const mayPaidWithShopper = CX.liq.forProject(CX.data).find(item => {
      if (!isPaid(item)) return false;
      const visit = (CX.data._visitas || []).find(row => String(row.id) === String(item.visitaId));
      return !!visit?.shopperId;
    });
    const shopperVisit = mayPaidWithShopper ? (CX.data._visitas || []).find(row =>
      String(row.id) === String(mayPaidWithShopper.visitaId)
    ) : null;
    if (shopperVisit) {
      CX.session.role = 'shopper';
      CX.session.testRole = null;
      CX.session.user = { id: 'gate-shopper', name: 'Gate Shopper', role: 'shopper', shopperId: shopperVisit.shopperId };
      CX.session.view = 'beneficios';
      CX.router.buildRail('shopper');
      CX.router.nav('beneficios');
      await sleep(150);
    }
    const benefitsHtml = document.getElementById('view')?.innerHTML || '';
    const benefitKpiKeys = [...document.querySelectorAll('#benKpis [data-k]')].map(node => node.getAttribute('data-k')).filter(Boolean);
    const shopperId = shopperVisit?.shopperId || null;
    const shopperVisitIds = new Set(shopperId && CX.data.visitsForShopper ? CX.data.visitsForShopper(shopperId).map(visit => String(visit.id)) : []);
    const shopperLiquidations = CX.liq.forProject(CX.data).filter(item => shopperVisitIds.has(String(item.visitaId)));
    const shopperPaid = shopperLiquidations.filter(isPaid);

    const june = await summarizePeriod('2026-06');
    const groups = typeof CX.data.historicalPaymentGroups === 'function' ? CX.data.historicalPaymentGroups() : [];
    const confirmedPayments = typeof CX.data.confirmedPayments === 'function' ? CX.data.confirmedPayments() : [];
    const paymentBatches = typeof CX.data.paymentBatches === 'function' ? CX.data.paymentBatches() : [];

    return {
      snapshotSummary:snapshot.summary,
      snapshotPayments:Array.isArray(snapshot.payments) ? snapshot.payments.length : null,
      snapshotBatches:Array.isArray(snapshot.batches) ? snapshot.batches.length : null,
      paymentHistorySourceSha:paymentHistory?.source?.workbookSha256 || null,
      paymentHistorySummary:paymentHistory?.summary || null,
      mayPolicy:paymentHistory?.periodPolicies?.['2026-05'] || null,
      may,
      june,
      mayVisitContract,
      historicalGroupCount:groups.length,
      historicalGroupsExecutable:groups.filter(group => group.executionAllowed === true).length,
      confirmedPaymentEvidenceCount:confirmedPayments.length,
      paymentBatchCount:paymentBatches.length,
      adminHasDashboard:adminText.includes('Dashboard Financiero'),
      adminHasExport:adminHtml.includes('finExport'),
      reportCaptured:!!capturedReport,
      reportRows:capturedReport?.spec?.rows?.length || 0,
      reportColumns:capturedReport?.spec?.columns?.length || 0,
      reportChartRows:capturedReport?.spec?.chart?.data?.length || 0,
      reportFilename:capturedReport?.spec?.filename || null,
      shopperId,
      shopperLiquidationCount:shopperLiquidations.length,
      shopperPaidCount:shopperPaid.length,
      benefitKpiKeys,
      benefitsRows:(benefitsHtml.match(/<tr>/g) || []).length
    };
  });

  report.summary = core;
  await page.screenshot({ path: path.join(outDir, 'remote-live-corte3-payment-history-final-state.png'), fullPage: true });

  check(core.snapshotSummary?.exactAcceptedLinks === 209, 'snapshot_exact_links_209', String(core.snapshotSummary?.exactAcceptedLinks));
  check(core.snapshotSummary?.canonicalAmountReady === 207, 'snapshot_amount_ready_207', String(core.snapshotSummary?.canonicalAmountReady));
  check(core.snapshotSummary?.amountReviewRequired === 2, 'snapshot_amount_review_2', String(core.snapshotSummary?.amountReviewRequired));
  check(core.snapshotSummary?.reviewQueue === 79, 'snapshot_link_review_79', String(core.snapshotSummary?.reviewQueue));
  check(core.snapshotPayments === 0 && core.snapshotBatches === 0 && core.paymentBatchCount === 0,
    'no_executable_payment_batches_imported', `${core.snapshotPayments}/${core.snapshotBatches}/${core.paymentBatchCount}`);
  check(core.paymentHistorySourceSha === 'b8e753ade03286caf3ff19e119a9b21b4dde7d5bd21d61fba70ab32719afea89',
    'payment_history_source_sha_exact', String(core.paymentHistorySourceSha));
  check(core.historicalGroupCount === 2 && core.historicalGroupsExecutable === 0,
    'historical_groups_immutable_non_executable', `${core.historicalGroupCount}/${core.historicalGroupsExecutable}`);

  check(core.may.visits === 44 && core.may.liquidationCount === 44, 'may_inventory_44', JSON.stringify(core.may));
  check(core.may.exactCount === 42 && core.may.reviewCount === 2, 'may_exact_42_reviews_2', JSON.stringify(core.may));
  check(core.may.paidCount === 44 && core.may.pendingPaymentCount === 0, 'may_paid_44_pending_0', JSON.stringify(core.may));
  check(core.may.reviewPaymentCoexist === true, 'may_financial_reviews_preserved_with_payment_confirmed', JSON.stringify(core.may.reviewStates));
  check(core.may.cxpByCountry.GT === 0 && core.may.cxpByCountry.HN === 0,
    'may_cxp_zero_by_country', JSON.stringify(core.may.cxpByCountry));
  check(core.mayPolicy?.countryTotals?.GT?.visitCount === 34 && core.mayPolicy?.countryTotals?.HN?.visitCount === 10,
    'may_paid_country_counts_34_10', JSON.stringify(core.mayPolicy?.countryTotals));
  check(core.mayPolicy?.countryTotals?.GT?.honorarioPaid === 2040 && core.mayPolicy?.countryTotals?.GT?.reimbursementPaid === 5448 && core.mayPolicy?.countryTotals?.GT?.totalPaid === 7488,
    'may_gt_paid_totals_source_safe', JSON.stringify(core.mayPolicy?.countryTotals?.GT));
  check(core.mayPolicy?.countryTotals?.HN?.honorarioPaid === 2000 && core.mayPolicy?.countryTotals?.HN?.reimbursementPaid === 3861 && core.mayPolicy?.countryTotals?.HN?.totalPaid === 5861,
    'may_hn_paid_totals_source_safe', JSON.stringify(core.mayPolicy?.countryTotals?.HN));
  check(core.mayVisitContract?.paymentConfirmed === true && core.mayVisitContract?.paymentState === 'payment_confirmed' && core.mayVisitContract?.paymentExecutionAllowed === false,
    'may_visit_contract_historical_payment_confirmed_non_executable', JSON.stringify(core.mayVisitContract));

  check(core.june.visits === 44 && core.june.liquidationCount === 44, 'june_inventory_44', JSON.stringify(core.june));
  check(core.june.paidCount === 2 && core.june.pendingPaymentCount === 42,
    'june_paid_2_pending_42', JSON.stringify(core.june));
  check(JSON.stringify(core.june.paidHrRowIds) === JSON.stringify(['JUNIO 26!2','JUNIO 26!6']),
    'june_paid_hrrowids_exact', JSON.stringify(core.june.paidHrRowIds));
  check(core.june.paidByCurrency.Q === 451 && !core.june.paidByCurrency.L,
    'june_paid_gt_451_hn_0', JSON.stringify(core.june.paidByCurrency));

  check(core.adminHasDashboard && core.adminHasExport, 'finance_ui_and_export_visible');
  check(core.reportCaptured && core.reportRows === 2 && core.reportColumns >= 8 && core.reportChartRows === 2,
    'finance_report_spec_complete', `${core.reportRows}/${core.reportColumns}/${core.reportChartRows}`);
  check(String(core.reportFilename || '').endsWith('.pdf'), 'finance_report_pdf_filename');
  check(core.shopperId && core.shopperLiquidationCount > 0 && core.shopperPaidCount > 0,
    'shopper_benefits_show_confirmed_historical_payment', `${core.shopperLiquidationCount}/${core.shopperPaidCount}`);
  check(['hon','reemb','cobrar','pagado'].every(key => core.benefitKpiKeys.includes(key)),
    'benefits_four_canonical_kpis', core.benefitKpiKeys.join(','));
  check(core.benefitsRows > 1, 'benefits_detail_rows_rendered', String(core.benefitsRows));

  report.warnings.push('May 2026 preserves 42 exact financial links and 2 financial reviews while all 44 payment states are historically confirmed. Payment truth does not erase financial review truth.');
  report.warnings.push('June 2026 has exactly two source-confirmed payments (JUNIO 26!2 and JUNIO 26!6); the remaining 42 obligations stay pending without inference.');
  report.warnings.push('PDF chart rendering and Excel formatting remain visual P1/P2 checks for Paula.');
  report.status = 'PASS';
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'summary.txt'), 'PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25\n', 'utf8');
  console.log('PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25');
  console.log(JSON.stringify(core));
} catch (error) {
  report.status = 'HOLD';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.error(report.error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
