#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const baseUrl = arg('--base-url', 'http://127.0.0.1:4173/index-backend-dev.html?cxTyaPhaseA=1&r18d=visible');
const outDir = path.resolve(arg('--out', '.tmp/tya-corte3-canonical-finance-ui-export-r23'));
fs.mkdirSync(outDir, { recursive: true });

const report = {
  schemaVersion: '1.2.1',
  gateId: 'tya-corte3-canonical-finance-ui-export-r23',
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
    paymentsExecuted: 0,
    batchesImported: 0,
    imports: false,
    writes: false,
    deploy: false,
    production: false
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
  const deadline = Date.now() + 15000;
  do {
    readiness = await page.evaluate(() => {
      const scripts = [...document.scripts].map(script => script.getAttribute('src')).filter(Boolean);
      const financial = window.CX_TYA_FINANCIAL_CANONICAL_SOURCE_SAFE || null;
      return {
        documentReadyState: document.readyState,
        cxPresent: !!window.CX,
        dataPresent: !!window.CX?.data,
        liqPresent: !!window.CX?.liq,
        finPresent: !!window.CX?.fin,
        visibleReady: window.CX_TYA_VISIBLE_DATA_READY === true,
        financeReady: window.CX_TYA_FINANCIAL_CANONICAL_READY === true,
        visibleFlagRaw: window.CX_TYA_VISIBLE_DATA_READY ?? null,
        financeFlagRaw: window.CX_TYA_FINANCIAL_CANONICAL_READY ?? null,
        hrSnapshotPresent: !!window.CX_TYA_HR_SOURCE_SAFE,
        financialSnapshotPresent: !!financial,
        financialLiquidationCount: Array.isArray(financial?.liquidations) ? financial.liquidations.length : null,
        financialReviewCount: Array.isArray(financial?.reviewQueue) ? financial.reviewQueue.length : null,
        financialPaymentsCount: Array.isArray(financial?.payments) ? financial.payments.length : null,
        financialBatchesCount: Array.isArray(financial?.batches) ? financial.batches.length : null,
        dataFinancialSnapshotPresent: !!window.CX?.data?.financialSnapshot,
        projectCount: Array.isArray(window.CX?.data?.projects) ? window.CX.data.projects.length : null,
        visitCount: Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas.length : null,
        currentProjectId: window.CX?.data?.currentProjectId || null,
        currentPeriodId: window.CX?.data?.currentPeriodId || null,
        sourceAdapterTagCount: scripts.filter(src => src.includes('tya-phase-a-source-safe-dev-adapter.js')).length,
        financialAdapterTagCount: scripts.filter(src => src.includes('tya-financial-canonical-source-safe-adapter.js')).length,
        sourcePayloadTagCount: scripts.filter(src => src.includes('tya-hr-source-safe-periods.js')).length,
        financialFinalTagCount: scripts.filter(src => src.includes('tya-financial-canonical-source-safe-final.js')).length,
        scripts
      };
    });
    if (readiness.visibleReady && readiness.financeReady) break;
    await page.waitForTimeout(250);
  } while (Date.now() < deadline);

  report.readiness = readiness;
  fs.writeFileSync(path.join(outDir, 'readiness-debug.json'), JSON.stringify({
    readiness,
    pageErrors: report.pageErrors,
    consoleErrors: report.consoleErrors,
    failedRequests: report.failedRequests
  }, null, 2) + '\n', 'utf8');
  await page.screenshot({ path: path.join(outDir, 'readiness-debug.png'), fullPage: true });

  check(readiness?.visibleReady === true, 'visible_source_safe_data_ready', JSON.stringify(readiness));
  check(readiness?.financeReady === true, 'canonical_finance_ready', JSON.stringify(readiness));

  const adminBtn = page.locator('[data-role="admin"]');
  check(await adminBtn.count() === 1, 'admin_login_available');
  await adminBtn.click();
  await page.waitForFunction(() => document.getElementById('app')?.classList.contains('on') && CX.session?.role === 'admin', null, { timeout: 30000 });

  const core = await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const projects = Array.isArray(CX.data.projects) ? CX.data.projects : [];
    const project = projects.find(p => String(p.periodKey || '') === '2026-05') ||
      projects.find(p => String(p.id || '').includes('2026-05'));
    if (!project) throw new Error('period_2026_05_not_found');
    const changed = typeof CX.data.setProject === 'function' ? CX.data.setProject(project.id) : false;
    if (changed === false && CX.data.period()?.id !== project.id) throw new Error('period_2026_05_not_selected');

    const currentPeriodKey = String(CX.data.period()?.periodKey || CX.data.period()?.id || '').replace(/^cinepolis(?:-|::)/, '');
    const snapshot = CX.data.financialSnapshot;
    const allSnapshot = Array.isArray(snapshot?.liquidations) ? snapshot.liquidations : [];
    const periodSnapshot = allSnapshot.filter(x => x.periodKey === '2026-05');
    const liqs = CX.liq.forProject(CX.data);
    const exact = liqs.filter(x => x.financialSourceStatus === 'exact_reconciled_source_safe');
    const pending = liqs.filter(x => x.financialSourceStatus !== 'exact_reconciled_source_safe');
    const paid = liqs.filter(x => x.estado === 'pagada' || x.paymentConfirmed === true || x.paymentState === 'paid' || x.paymentState === 'confirmado');

    const byPaymentItemId = new Map(periodSnapshot.filter(x => x.paymentItemId).map(x => [String(x.paymentItemId), x]));
    const byHrRowId = new Map(periodSnapshot.filter(x => x.hrRowId).map(x => [String(x.hrRowId), x]));
    const byVisitId = new Map(periodSnapshot.filter(x => x.visitId).map(x => [String(x.visitId), x]));
    const sourceForLiq = item =>
      byPaymentItemId.get(String(item?.paymentItemId || '')) ||
      byHrRowId.get(String(item?.hrRowId || '')) ||
      byVisitId.get(String(item?.visitaId || item?.visitId || '')) || null;

    const amountMismatches = exact.filter(item => {
      const source = sourceForLiq(item);
      return !source ||
        Number(item.honorario) !== Number(source.honorario) ||
        Number(item.boleto) !== Number(source.boleto) ||
        Number(item.combo) !== Number(source.combo) ||
        Number(item.total) !== Number(source.total);
    });

    const exactLiq = exact.find(item => sourceForLiq(item));
    const exactVisit = exactLiq ? (CX.data._visitas || []).find(v =>
      String(v.id) === String(exactLiq.visitaId) ||
      (v.hrRowId && exactLiq.hrRowId && String(v.hrRowId) === String(exactLiq.hrRowId))
    ) : null;
    const visitContract = exactVisit ? CX.data.visitContract(exactVisit) : null;
    const financeByCountry = CX.fin.porPais(CX.data);

    CX.router.nav('financiero');
    await sleep(120);
    const adminHtml = document.getElementById('view')?.innerHTML || '';
    const adminText = document.getElementById('view')?.innerText || '';

    let capturedReport = null;
    if (CX.reportKit) {
      const original = CX.reportKit.openReport;
      CX.reportKit.openReport = (spec, id) => { capturedReport = { spec, id }; };
      document.getElementById('finExport')?.click();
      await sleep(80);
      CX.reportKit.openReport = original;
    }

    const exactWithShopper = exact.find(item => {
      const visit = (CX.data._visitas || []).find(v =>
        String(v.id) === String(item.visitaId) ||
        (v.hrRowId && item.hrRowId && String(v.hrRowId) === String(item.hrRowId))
      );
      return visit && visit.shopperId;
    });
    const shopperVisit = exactWithShopper ? (CX.data._visitas || []).find(v =>
      String(v.id) === String(exactWithShopper.visitaId) ||
      (v.hrRowId && exactWithShopper.hrRowId && String(v.hrRowId) === String(exactWithShopper.hrRowId))
    ) : null;

    if (shopperVisit) {
      CX.session.role = 'shopper';
      CX.session.testRole = null;
      CX.session.user = { id: 'gate-shopper', name: 'Gate Shopper', role: 'shopper', shopperId: shopperVisit.shopperId };
      CX.session.view = 'beneficios';
      CX.router.buildRail('shopper');
      CX.router.nav('beneficios');
      await sleep(120);
    }
    const benefitsText = document.getElementById('view')?.innerText || '';
    const benefitsHtml = document.getElementById('view')?.innerHTML || '';
    const shopperId = shopperVisit?.shopperId || null;
    const shopperVisitIds = new Set(shopperId && CX.data.visitsForShopper ? CX.data.visitsForShopper(shopperId).map(v => String(v.id)) : []);
    const shopperLiqs = CX.liq.forProject(CX.data).filter(x => shopperVisitIds.has(String(x.visitaId)));
    const shopperPaid = shopperLiqs.filter(x => x.estado === 'pagada' || x.paymentConfirmed === true);
    const exactCountFromFinance = Object.values(financeByCountry || {}).reduce((sum, value) => sum + Number(value?.exactReconciledRecords || 0), 0);

    return {
      currentPeriodKey,
      snapshotSummary: snapshot.summary,
      snapshotPaymentCount: Array.isArray(snapshot.payments) ? snapshot.payments.length : null,
      snapshotBatchCount: Array.isArray(snapshot.batches) ? snapshot.batches.length : null,
      financialSourceMetaPaymentCount: CX.data.financialSourceMeta?.paymentConfirmedCount,
      periodSnapshotCount: periodSnapshot.length,
      liquidationCount: liqs.length,
      exactCount: exact.length,
      pendingCount: pending.length,
      paidCount: paid.length,
      amountMismatchCount: amountMismatches.length,
      exactVisitId: exactVisit?.id || null,
      exactVisitHrRowId: exactVisit?.hrRowId || null,
      visitContract,
      financeCountries: Object.keys(financeByCountry || {}),
      financeExactCounts: Object.fromEntries(Object.entries(financeByCountry || {}).map(([k, v]) => [k, v.exactReconciledRecords || 0])),
      exactCountFromFinance,
      adminHasDashboard: adminText.includes('Dashboard Financiero'),
      adminHasExport: adminHtml.includes('finExport'),
      adminCanonicalBinding: exactCountFromFinance === exact.length && exact.length > 0 && pending.length > 0,
      reportCaptured: !!capturedReport,
      reportId: capturedReport?.id || null,
      reportRows: capturedReport?.spec?.rows?.length || 0,
      reportColumns: capturedReport?.spec?.columns?.length || 0,
      reportChartRows: capturedReport?.spec?.chart?.data?.length || 0,
      reportFilename: capturedReport?.spec?.filename || null,
      shopperId,
      shopperLiquidationCount: shopperLiqs.length,
      shopperPaidCount: shopperPaid.length,
      benefitsHasTitle: benefitsText.includes('Mis Beneficios'),
      benefitsHasHonorarios: benefitsText.includes('Honorarios'),
      benefitsHasReembolsos: benefitsText.includes('Reembolsos'),
      benefitsHasPorCobrar: benefitsText.includes('Por cobrar'),
      benefitsHasPaidZero: benefitsText.includes('Pagado'),
      benefitsRows: (benefitsHtml.match(/<tr>/g) || []).length
    };
  });

  report.summary = core;
  await page.screenshot({ path: path.join(outDir, 'corte3-ui-final-state.png'), fullPage: true });

  check(core.currentPeriodKey.includes('2026-05'), 'period_2026_05_active', core.currentPeriodKey);
  check(core.snapshotSummary.exactAcceptedLinks === 209, 'snapshot_exact_links_209', String(core.snapshotSummary.exactAcceptedLinks));
  check(core.snapshotSummary.canonicalAmountReady === 207, 'snapshot_amount_ready_207', String(core.snapshotSummary.canonicalAmountReady));
  check(core.snapshotSummary.amountReviewRequired === 2, 'snapshot_amount_review_2', String(core.snapshotSummary.amountReviewRequired));
  check(core.snapshotSummary.reviewQueue === 79, 'snapshot_link_review_79', String(core.snapshotSummary.reviewQueue));
  check(core.snapshotPaymentCount === 0 && core.snapshotBatchCount === 0 && core.financialSourceMetaPaymentCount === 0,
    'snapshot_confirmed_payments_zero', `${core.snapshotPaymentCount}/${core.snapshotBatchCount}/${core.financialSourceMetaPaymentCount}`);
  check(core.liquidationCount === 44, 'current_period_liquidations_44', String(core.liquidationCount));
  check(core.exactCount === core.periodSnapshotCount, 'ui_exact_count_matches_snapshot', `${core.exactCount}/${core.periodSnapshotCount}`);
  check(core.exactCount + core.pendingCount === 44, 'exact_plus_pending_44');
  check(core.paidCount === 0, 'no_paid_in_finance_collection');
  check(core.amountMismatchCount === 0, 'canonical_amounts_match_snapshot', String(core.amountMismatchCount));
  check(core.exactVisitId && core.exactVisitHrRowId, 'canonical_visit_match_found');
  check(core.visitContract && core.visitContract.paymentConfirmed === false, 'visit_contract_payment_not_confirmed');
  check(core.visitContract && core.visitContract.paymentState === 'pending_source_confirmation', 'visit_contract_payment_fail_closed', String(core.visitContract?.paymentState));
  check(core.adminHasDashboard && core.adminHasExport && core.adminCanonicalBinding, 'finance_ui_bound_to_canonical_state');
  check(core.reportCaptured, 'finance_report_spec_captured');
  check(core.reportRows === core.financeCountries.length && core.reportColumns >= 8, 'finance_report_rows_columns_complete', `${core.reportRows}/${core.reportColumns}`);
  check(core.reportChartRows === core.financeCountries.length, 'finance_report_chart_spec_present', String(core.reportChartRows));
  check(String(core.reportFilename || '').endsWith('.pdf'), 'finance_report_pdf_filename');
  check(core.shopperId && core.shopperLiquidationCount > 0, 'shopper_with_canonical_benefits_found');
  check(core.shopperPaidCount === 0, 'benefits_paid_zero');
  check(core.benefitsHasTitle && core.benefitsHasHonorarios && core.benefitsHasReembolsos && core.benefitsHasPorCobrar && core.benefitsHasPaidZero,
    'benefits_ui_uses_canonical_collection');
  check(core.benefitsRows > 1, 'benefits_detail_rows_rendered', String(core.benefitsRows));

  report.warnings.push('PDF chart rendering and Excel visual formatting remain P1/P2 until real files are visually inspected. This gate verifies the canonical report specification and UI binding only.');
  report.status = 'PASS';
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'summary.txt'), 'PASS_TYA_CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23\n', 'utf8');
  console.log('PASS_TYA_CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23');
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
