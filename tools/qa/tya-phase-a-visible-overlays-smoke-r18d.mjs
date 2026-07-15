#!/usr/bin/env node
/*
  CXOrbia TyA Phase A R18D — visible overlay smoke.
  Browser-only and read-only. Validates the V131 build copy after applying the
  existing R11D/R14C/certification outputs; no providers, writes or deploy.
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
const baseUrl = valueOf('--base-url', process.env.CXORBIA_BASE_URL || 'http://127.0.0.1:4173/index.html?cxTyaPhaseA=1&r18d=visible');
const outDir = path.resolve(valueOf('--out', '.tmp/phase-a-visible-overlays-smoke-r18d'));
fs.mkdirSync(outDir, { recursive: true });

const expected = {
  periods: 14,
  visits: 616,
  shoppers: 216,
  currentPeriodVisits: 44,
  financialExactLinks: 196,
  financialReviewQueue: 92,
  shopperReviewQueue: 1,
  certificationReviewQueue: 1,
  paidConfirmed: 0,
  certificationCarryoverConfirmed: 0,
  requestedAgainAutomatically: 0
};
const report = {
  schemaVersion: '1.1.0',
  gate: 'cxorbia-tya-visible-overlays-smoke-r18d',
  generatedAt: new Date().toISOString(),
  baseUrl,
  expected,
  runtime: null,
  modules: [],
  blockers: [],
  warnings: [],
  decision: 'HOLD_NOT_RUN',
  safeState: { browserOnly: true, providerCalls: false, writes: false, imports: false, deploy: false, production: false, piiOutput: false }
};
const block = (code, detail = '') => report.blockers.push(detail ? `${code}:${detail}` : code);
const warn = (code, detail = '') => report.warnings.push(detail ? `${code}:${detail}` : code);
const clean = value => String(value || '').replace(/\s+/g, ' ').trim().slice(0, 1000);

async function preparePage(page) {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('cx_pwa_shown', '1');
      localStorage.setItem('cx_banners', '[]');
    } catch (error) {}
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.CX_TYA_VISIBLE_DATA_READY === true, null, { timeout: 20000 });
  await page.waitForFunction(() => window.CX_TYA_R18D_VISIBLE_READY === true, null, { timeout: 20000 });
  await page.waitForFunction(() => Boolean(window.CX?.app?.selectRole && window.CX?.router && window.CX?.data), null, { timeout: 20000 });
  await page.evaluate(() => {
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.confidencialidad) {
      window.CX.confidencialidad.pending = () => false;
      window.CX.confidencialidad.show = (_role, done) => done && done();
      window.CX.confidencialidad.accept = () => {};
    }
    if (window.CX?.app) window.CX.app.showBanners = () => {};
  });
}

async function enterAdmin(page) {
  await page.evaluate(() => {
    if (window.CX?.session?.clear) window.CX.session.clear();
    window.CX.app.selectRole('admin');
  });
  await page.waitForSelector('#app.on', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
}

async function openModule(page, token) {
  let result;
  try {
    result = await page.evaluate(async routeToken => {
      const keys = [...new Set([...Object.keys(window.CX?.modules || {}), ...Object.keys(window.CX?.routes || {})])];
      const normalized = String(routeToken).toLowerCase();
      const target = keys.find(key => String(key).toLowerCase() === normalized) ||
        keys.find(key => String(key).toLowerCase().includes(normalized) || normalized.includes(String(key).toLowerCase())) || null;
      if (!target) return { token: routeToken, target: null, rendered: false, text: '', error: null };
      try {
        if (window.CX?.router?.nav) window.CX.router.nav(target);
        else if (window.CX?.router?.go) window.CX.router.go(target);
        else if (window.CX?.router?.navigate) window.CX.router.navigate(target);
        else return { token: routeToken, target, rendered: false, text: '', error: 'router_method_missing' };
      } catch (error) {
        return { token: routeToken, target, rendered: false, text: '', error: String(error?.stack || error?.message || error).slice(0, 800) };
      }
      await new Promise(resolve => setTimeout(resolve, 450));
      const text = String(document.querySelector('#view')?.innerText || '').replace(/\s+/g, ' ').trim();
      return { token: routeToken, target, rendered: text.length > 0, text: text.slice(0, 2500), error: null };
    }, token);
  } catch (error) {
    result = { token, target: null, rendered: false, text: '', error: clean(error?.stack || error?.message || error) };
  }
  report.modules.push(result);
  if (!result.target) block(`module_missing_${token}`);
  else if (result.error) block(`module_render_error_${token}`, clean(result.error));
  else if (!result.rendered) block(`module_not_rendered_${token}`);
  return result;
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(clean(message.text())); });
  page.on('pageerror', error => pageErrors.push(clean(error?.message || error)));
  await preparePage(page);

  report.runtime = await page.evaluate(() => {
    const visits = Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas : [];
    const shoppers = Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers : [];
    const projects = Array.isArray(window.CX?.data?.projects) ? window.CX.data.projects : [];
    const currentVisits = window.CX?.data?.visitas ? window.CX.data.visitas() : [];
    const exact = visits.filter(item => item.r14cExactControl === true);
    return {
      visibleContract: window.CX_TYA_R18D_VISIBLE_CONTRACT || null,
      baseVisibleContract: window.CX_TYA_VISIBLE_DATA_CONTRACT || null,
      dataSource: { mode: window.CX?.dataSource?.mode || null, status: window.CX?.dataSource?.status || null },
      periods: projects.length,
      uniquePeriodIds: new Set(projects.map(item => item.id)).size,
      visits: visits.length,
      shoppers: shoppers.length,
      currentPeriodVisits: Array.isArray(currentVisits) ? currentVisits.length : 0,
      financialExactLinks: exact.length,
      exactControlsPendingReview: exact.every(item => item.paymentState === 'pending_financial_review'),
      exactControlsNotPaid: exact.every(item => item.paymentConfirmed === false && item.paid !== true && item.lotEligible !== true),
      financialReviewQueue: Array.isArray(window.CX?.data?.financialReviewQueue) ? window.CX.data.financialReviewQueue.length : -1,
      shopperReviewQueue: Array.isArray(window.CX?.data?.shopperReviewQueue) ? window.CX.data.shopperReviewQueue.length : -1,
      certificationReviewQueue: Array.isArray(window.CX?.data?.certificationReviewQueue) ? window.CX.data.certificationReviewQueue.length : -1,
      certificationHoldShoppers: shoppers.filter(item => item.certificationCarryoverConfirmed !== true).length,
      certificationFalseConfirmations: shoppers.filter(item => item.certificationCarryoverConfirmed === true).length,
      documentFinancialOverlay: document.documentElement.getAttribute('data-cx-financial-overlay'),
      documentCertificationCarryover: document.documentElement.getAttribute('data-cx-certification-carryover')
    };
  });

  const r = report.runtime;
  if (!r.visibleContract || r.visibleContract.integrationId !== 'R18D_VISIBLE_EXISTING_OVERLAYS') block('r18d_visible_contract_missing');
  if (r.periods !== expected.periods || r.uniquePeriodIds !== expected.periods) block('period_count_mismatch', `${r.periods}/${r.uniquePeriodIds}`);
  if (r.visits !== expected.visits) block('visit_count_mismatch', `${r.visits}/${expected.visits}`);
  if (r.shoppers !== expected.shoppers) block('shopper_count_mismatch', `${r.shoppers}/${expected.shoppers}`);
  if (r.currentPeriodVisits !== expected.currentPeriodVisits) block('current_period_visit_count_mismatch', `${r.currentPeriodVisits}/${expected.currentPeriodVisits}`);
  if (r.financialExactLinks !== expected.financialExactLinks) block('financial_exact_links_mismatch', `${r.financialExactLinks}/${expected.financialExactLinks}`);
  if (!r.exactControlsPendingReview) block('exact_controls_not_pending_financial_review');
  if (!r.exactControlsNotPaid) block('payment_or_lot_inferred_from_control');
  if (r.financialReviewQueue !== expected.financialReviewQueue) block('financial_review_queue_mismatch', `${r.financialReviewQueue}/${expected.financialReviewQueue}`);
  if (r.shopperReviewQueue !== expected.shopperReviewQueue) block('shopper_review_queue_mismatch', `${r.shopperReviewQueue}/${expected.shopperReviewQueue}`);
  if (r.certificationReviewQueue !== expected.certificationReviewQueue) block('certification_review_queue_mismatch', `${r.certificationReviewQueue}/${expected.certificationReviewQueue}`);
  if (r.certificationHoldShoppers !== expected.shoppers || r.certificationFalseConfirmations !== 0) block('certification_hold_mismatch', `${r.certificationHoldShoppers}/${r.certificationFalseConfirmations}`);
  if (r.visibleContract.paidConfirmed !== expected.paidConfirmed || r.visibleContract.paymentLotsCreated !== 0) block('payment_confirmation_inferred');
  if (r.visibleContract.certificationCarryoverConfirmed !== expected.certificationCarryoverConfirmed) block('certification_carryover_inferred');
  if (r.visibleContract.requestedAgainAutomatically !== expected.requestedAgainAutomatically) block('certification_requested_again_automatically');
  if (r.documentFinancialOverlay !== 'r14c-pending-review') block('financial_overlay_document_marker_missing');
  if (r.documentCertificationCarryover !== 'hold-pending-source') block('certification_hold_document_marker_missing');

  await enterAdmin(page);
  const shoppersModule = await openModule(page, 'shoppers');
  const financeModule = await openModule(page, 'financiero');
  const certificationModule = await openModule(page, 'cert');

  if (shoppersModule.rendered && !/216/.test(shoppersModule.text)) warn('shopper_count_not_visible_in_module', 'runtime_passes_216');
  if (financeModule.rendered && /Pagada \(confirmado\)|pago confirmado|lote confirmado/i.test(financeModule.text)) block('finance_module_claims_confirmed_payment');
  if (certificationModule.rendered && !/pendiente de fuente|no hay.*certificaci|banco.*no publicado/i.test(certificationModule.text)) warn('certification_hold_copy_not_visible', clean(certificationModule.text).slice(0, 180));
  if (consoleErrors.length) block('console_errors', String(consoleErrors.length));
  if (pageErrors.length) block('page_errors', String(pageErrors.length));

  report.consoleErrors = consoleErrors;
  report.pageErrors = pageErrors;
  await page.screenshot({ path: path.join(outDir, 'r18d-admin-final-view.png'), fullPage: true });
  report.decision = report.blockers.length ? 'FAIL_R18D_VISIBLE_OVERLAYS' : (report.warnings.length ? 'PASS_WITH_REVIEW_R18D_VISIBLE_OVERLAYS' : 'PASS_R18D_VISIBLE_OVERLAYS');
  await context.close();
} catch (error) {
  block('smoke_exception', clean(error?.message || error));
  report.decision = 'FAIL_R18D_VISIBLE_OVERLAYS';
} finally {
  await browser.close();
}

report.blockers = [...new Set(report.blockers)];
report.warnings = [...new Set(report.warnings)];
if (report.blockers.length) report.decision = 'FAIL_R18D_VISIBLE_OVERLAYS';
else if (report.warnings.length) report.decision = 'PASS_WITH_REVIEW_R18D_VISIBLE_OVERLAYS';
else report.decision = 'PASS_R18D_VISIBLE_OVERLAYS';

fs.writeFileSync(path.join(outDir, 'r18d-visible-overlays-smoke.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'r18d-visible-overlays-smoke.md'), [
  '# CXOrbia TyA visible overlays smoke R18D', '',
  `Decision: **${report.decision}**`,
  `Periods: ${report.runtime?.periods ?? 0}`,
  `Visits: ${report.runtime?.visits ?? 0}`,
  `Shoppers: ${report.runtime?.shoppers ?? 0}`,
  `R14C exact controls: ${report.runtime?.financialExactLinks ?? 0}`,
  `Financial review queue: ${report.runtime?.financialReviewQueue ?? 0}`,
  `Certification HOLD shoppers: ${report.runtime?.certificationHoldShoppers ?? 0}`,
  `Modules rendered: ${report.modules.filter(item => item.rendered).length}/${report.modules.length}`,
  `Blockers: ${report.blockers.length}`,
  ...report.blockers.map(item => `- ${item}`),
  `Warnings: ${report.warnings.length}`,
  ...report.warnings.map(item => `- ${item}`), '',
  'Browser-only, read-only. No providers, writes, imports, deploy or production.'
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ decision: report.decision, runtime: report.runtime, modules: report.modules.map(item => ({ token: item.token, target: item.target, rendered: item.rendered, error: item.error || null })), blockers: report.blockers, warnings: report.warnings, safeState: report.safeState }, null, 2));
process.exitCode = report.blockers.length ? 2 : 0;
