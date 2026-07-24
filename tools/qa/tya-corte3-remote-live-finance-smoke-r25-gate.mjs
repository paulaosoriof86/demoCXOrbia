#!/usr/bin/env node
/* CXOrbia TyA · Corte 3 remote live finance smoke R25.
   Validates the deployed live-HR runtime where identity-exact financial rows
   coexist with fail-closed operational rows pending financial reconciliation. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = arg('--base-url', 'https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1');
const outDir = path.resolve(arg('--out', '.tmp/tya-corte3-remote-live-finance-smoke-r25'));
fs.mkdirSync(outDir, { recursive: true });

const report = {
  schemaVersion: '1.0.0',
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
    batchesImported: 0,
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
      return {
        documentReadyState: document.readyState,
        cxPresent: !!window.CX,
        visibleReady: window.CX_TYA_VISIBLE_DATA_READY === true,
        financeReady: window.CX_TYA_FINANCIAL_CANONICAL_READY === true,
        hrSnapshotPresent: !!window.CX_TYA_HR_SOURCE_SAFE,
        financialSnapshotPresent: !!financial,
        financialLiquidationCount: Array.isArray(financial?.liquidations) ? financial.liquidations.length : null,
        financialReviewCount: Array.isArray(financial?.reviewQueue) ? financial.reviewQueue.length : null,
        financialPaymentsCount: Array.isArray(financial?.payments) ? financial.payments.length : null,
        financialBatchesCount: Array.isArray(financial?.batches) ? financial.batches.length : null,
        projectCount: Array.isArray(window.CX?.data?.projects) ? window.CX.data.projects.length : null,
        visitCount: Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas.length : null,
        currentProjectId: window.CX?.data?.currentProjectId || null,
        currentPeriodId: window.CX?.data?.currentPeriodId || null,
        liveHrScriptCount: scripts.filter(src => src.includes('/api/tya/cinepolis/hr-live')).length,
        liveAdapterCount: scripts.filter(src => src.includes('tya-phase-a-source-safe-dev-adapter-r18a.js')).length,
        financialAdapterCount: scripts.filter(src => src.includes('tya-financial-canonical-source-safe-adapter.js')).length,
        financialFinalCount: scripts.filter(src => src.includes('tya-financial-canonical-source-safe-final.js')).length
      };
    });
    if (readiness.visibleReady && readiness.financeReady) break;
    await page.waitForTimeout(250);
  } while (Date.now() < deadline);

  report.readiness = readiness;
  fs.writeFileSync(path.join(outDir, 'readiness.json'), JSON.stringify(readiness, null, 2) + '\n', 'utf8');
  check(readiness?.visibleReady === true, 'live_source_safe_data_ready', JSON.stringify(readiness));
  check(readiness?.financeReady === true, 'canonical_finance_ready', JSON.stringify(readiness));
  check(readiness?.liveHrScriptCount === 1 && readiness?.liveAdapterCount === 1, 'live_hr_binding_exact', `${readiness?.liveHrScriptCount}/${readiness?.liveAdapterCount}`);
  check(readiness?.financialAdapterCount === 1 && readiness?.financialFinalCount === 1, 'canonical_finance_binding_exact', `${readiness?.financialAdapterCount}/${readiness?.financialFinalCount}`);

  const adminBtn = page.locator('[data-role="admin"]');
  check(await adminBtn.count() === 1, 'admin_login_available');
  await adminBtn.click();
  await page.waitForFunction(() => document.getElementById('app')?.classList.contains('on') && CX.session?.role === 'admin', null, { timeout: 30000 });

  const core = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const projects = Array.isArray(CX.data.projects) ? CX.data.projects : [];
    const project = projects.find(item => String(item.periodKey || '') === '2026-05') ||
      projects.find(item => String(item.id || '').includes('2026-05'));
    if (!project) throw new Error('period_2026_05_not_found');
    const changed = typeof CX.data.setProject === 'function' ? CX.data.setProject(project.id) : false;
    if (changed === false && CX.data.period()?.id !== project.id) throw new Error('period_2026_05_not_selected');

    const visits = typeof CX.data.visitas === 'function' ? CX.data.visitas() : [];
    const snapshot = CX.data.financialSnapshot || {};
    const allSnapshot = Array.isArray(snapshot.liquidations) ? snapshot.liquidations : [];
    const periodSnapshot = allSnapshot.filter(item => item.periodKey === '2026-05');
    const liquidations = CX.liq.forProject(CX.data);
    const exact = liquidations.filter(item => item.financialSourceStatus === 'exact_reconciled_source_safe');
    const pending = liquidations.filter(item => item.financialSourceStatus !== 'exact_reconciled_source_safe');
    const paid = liquidations.filter(item => item.estado === 'pagada' || item.paymentConfirmed === true || item.paymentState === 'paid' || item.paymentState === 'confirmed');
    const pendingSafe = pending.every(item =>
      item.reviewRequired === true &&
      item.paymentConfirmed === false &&
      item.paymentState === 'pending_source_confirmation' &&
      item.liquidationState === 'pending_financial_source' &&
      item.financialSourceStatus === 'pending_or_review' &&
      item.amountSource === 'hr_operational_amount_pending_financial_reconciliation'
    );

    const byPaymentItemId = new Map(periodSnapshot.filter(item => item.paymentItemId).map(item => [String(item.paymentItemId), item]));
    const byHrRowId = new Map(periodSnapshot.filter(item => item.hrRowId).map(item => [String(item.hrRowId), item]));
    const byVisitId = new Map(periodSnapshot.filter(item => item.visitId).map(item => [String(item.visitId), item]));
    const sourceFor = item => byPaymentItemId.get(String(item?.paymentItemId || '')) ||
      byHrRowId.get(String(item?.hrRowId || '')) ||
      byVisitId.get(String(item?.visitaId || item?.visitId || '')) || null;
    const amountMismatches = exact.filter(item => {
      const source = sourceFor(item);
      return !source || Number(item.honorario) !== Number(source.honorario) ||
        Number(item.boleto) !== Number(source.boleto) ||
        Number(item.combo) !== Number(source.combo) ||
        Number(item.total) !== Number(source.total);
    });

    const exactVisitRow = exact.find(item => sourceFor(item));
    const exactVisit = exactVisitRow ? (CX.data._visitas || []).find(visit =>
      String(visit.id) === String(exactVisitRow.visitaId) ||
      (visit.hrRowId && exactVisitRow.hrRowId && String(visit.hrRowId) === String(exactVisitRow.hrRowId))
    ) : null;
    const visitContract = exactVisit ? CX.data.visitContract(exactVisit) : null;
    const financeByCountry = CX.fin.porPais(CX.data);

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

    const exactWithShopper = exact.find(item => {
      const visit = (CX.data._visitas || []).find(row => String(row.id) === String(item.visitaId) ||
        (row.hrRowId && item.hrRowId && String(row.hrRowId) === String(item.hrRowId)));
      return visit && visit.shopperId;
    });
    const shopperVisit = exactWithShopper ? (CX.data._visitas || []).find(row =>
      String(row.id) === String(exactWithShopper.visitaId) ||
      (row.hrRowId && exactWithShopper.hrRowId && String(row.hrRowId) === String(exactWithShopper.hrRowId))
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
    const shopperPaid = shopperLiquidations.filter(item => item.estado === 'pagada' || item.paymentConfirmed === true);
    const exactCountFromFinance = Object.values(financeByCountry || {}).reduce((sum, value) => sum + Number(value?.exactReconciledRecords || 0), 0);

    return {
      currentPeriodKey: String(CX.data.period()?.periodKey || CX.data.period()?.id || '').replace(/^cinepolis(?:-|::)/, ''),
      currentVisitCount: visits.length,
      periodSnapshotCount: periodSnapshot.length,
      liquidationCount: liquidations.length,
      exactCount: exact.length,
      pendingCount: pending.length,
      pendingSafe,
      pendingStates: pending.map(item => ({
        estado: item.estado,
        liquidationState: item.liquidationState,
        paymentState: item.paymentState,
        financialSourceStatus: item.financialSourceStatus,
        reviewRequired: item.reviewRequired,
        paymentConfirmed: item.paymentConfirmed
      })),
      paidCount: paid.length,
      amountMismatchCount: amountMismatches.length,
      snapshotSummary: snapshot.summary,
      snapshotPayments: Array.isArray(snapshot.payments) ? snapshot.payments.length : null,
      snapshotBatches: Array.isArray(snapshot.batches) ? snapshot.batches.length : null,
      visitContract,
      financeCountries: Object.keys(financeByCountry || {}),
      financeExactCounts: Object.fromEntries(Object.entries(financeByCountry || {}).map(([country, value]) => [country, value.exactReconciledRecords || 0])),
      exactCountFromFinance,
      adminHasDashboard: adminText.includes('Dashboard Financiero'),
      adminHasExport: adminHtml.includes('finExport'),
      reportCaptured: !!capturedReport,
      reportRows: capturedReport?.spec?.rows?.length || 0,
      reportColumns: capturedReport?.spec?.columns?.length || 0,
      reportChartRows: capturedReport?.spec?.chart?.data?.length || 0,
      reportFilename: capturedReport?.spec?.filename || null,
      shopperId,
      shopperLiquidationCount: shopperLiquidations.length,
      shopperPaidCount: shopperPaid.length,
      benefitKpiKeys,
      benefitsRows: (benefitsHtml.match(/<tr>/g) || []).length
    };
  });

  report.summary = core;
  await page.screenshot({ path: path.join(outDir, 'remote-live-corte3-final-state.png'), fullPage: true });

  check(core.currentPeriodKey.includes('2026-05'), 'period_2026_05_active', core.currentPeriodKey);
  check(core.currentVisitCount === 44, 'current_period_visit_inventory_44', String(core.currentVisitCount));
  check(core.snapshotSummary?.exactAcceptedLinks === 209, 'snapshot_exact_links_209', String(core.snapshotSummary?.exactAcceptedLinks));
  check(core.snapshotSummary?.canonicalAmountReady === 207, 'snapshot_amount_ready_207', String(core.snapshotSummary?.canonicalAmountReady));
  check(core.snapshotSummary?.amountReviewRequired === 2, 'snapshot_amount_review_2', String(core.snapshotSummary?.amountReviewRequired));
  check(core.snapshotSummary?.reviewQueue === 79, 'snapshot_link_review_79', String(core.snapshotSummary?.reviewQueue));
  check(core.snapshotPayments === 0 && core.snapshotBatches === 0, 'snapshot_payments_batches_zero', `${core.snapshotPayments}/${core.snapshotBatches}`);
  check(core.periodSnapshotCount === 42 && core.exactCount === 42, 'may_exact_financial_rows_42', `${core.periodSnapshotCount}/${core.exactCount}`);
  check(core.pendingCount === 2 && core.liquidationCount === 44, 'may_non_exact_rows_visible_as_two_fail_closed_reviews', `${core.pendingCount}/${core.liquidationCount}`);
  check(core.pendingSafe === true, 'pending_rows_fail_closed', JSON.stringify(core.pendingStates));
  check(core.exactCount + core.pendingCount === core.liquidationCount, 'exact_plus_pending_equals_collection');
  check(core.paidCount === 0, 'no_paid_rows');
  check(core.amountMismatchCount === 0, 'canonical_amounts_match_snapshot', String(core.amountMismatchCount));
  check(core.visitContract?.paymentConfirmed === false && core.visitContract?.paymentState === 'pending_source_confirmation',
    'visit_contract_payment_fail_closed', JSON.stringify(core.visitContract));
  check(core.exactCountFromFinance === 42 && core.financeExactCounts.GT === 32 && core.financeExactCounts.HN === 10,
    'finance_country_exact_counts_32_10', JSON.stringify(core.financeExactCounts));
  check(core.adminHasDashboard && core.adminHasExport, 'finance_ui_and_export_visible');
  check(core.reportCaptured && core.reportRows === 2 && core.reportColumns >= 8 && core.reportChartRows === 2,
    'finance_report_spec_complete', `${core.reportRows}/${core.reportColumns}/${core.reportChartRows}`);
  check(String(core.reportFilename || '').endsWith('.pdf'), 'finance_report_pdf_filename');
  check(core.shopperId && core.shopperLiquidationCount > 0 && core.shopperPaidCount === 0, 'shopper_benefits_fail_closed', `${core.shopperLiquidationCount}/${core.shopperPaidCount}`);
  check(['hon','reemb','cobrar','pagado'].every(key => core.benefitKpiKeys.includes(key)),
    'benefits_four_canonical_kpis', core.benefitKpiKeys.join(','));
  check(core.benefitsRows > 1, 'benefits_detail_rows_rendered', String(core.benefitsRows));

  report.warnings.push('May 2026 contains 44 HR visits: 42 identity-exact canonical financial rows and 2 explicit fail-closed operational review rows. The two review rows are not canonical, not paid and cannot enter a batch.');
  report.warnings.push('PDF chart rendering and Excel formatting remain visual P1/P2 checks for Paula.');
  report.status = 'PASS';
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'summary.txt'), 'PASS_TYA_CORTE3_REMOTE_LIVE_FINANCE_SMOKE_R25\n', 'utf8');
  console.log('PASS_TYA_CORTE3_REMOTE_LIVE_FINANCE_SMOKE_R25');
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
