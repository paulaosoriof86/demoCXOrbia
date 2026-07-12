#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — source-safe operational visual smoke.

  Purpose:
  - validate the latest empalmed frontend against the sanitized TyA HR payload;
  - exercise real project/period/visit/shopper counts without exposing raw PII;
  - verify admin, client and shopper shells plus operational module routes;
  - produce screenshots and a sanitized report only.

  Safety:
  - browser/local static server only;
  - no Firestore/Auth/Storage/Make/Gemini writes;
  - no import, deploy, payment or production action;
  - no raw shopper names, emails, phones, bank data or document identifiers in output.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const valueOf = (flag, fallback = null) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const baseUrl = valueOf('--base-url', process.env.CXORBIA_BASE_URL || 'http://127.0.0.1:4173/index.html');
const outDir = path.resolve(valueOf('--out', '.tmp/phase-a-source-safe-visual-smoke'));
const expected = {
  tenantId: process.env.CXORBIA_EXPECT_TENANT_ID || 'tya',
  projectId: process.env.CXORBIA_EXPECT_PROJECT_ID || 'cinepolis',
  periods: Number(process.env.CXORBIA_EXPECT_PERIODS || 14),
  visits: Number(process.env.CXORBIA_EXPECT_VISITS || 616),
  shoppers: Number(process.env.CXORBIA_EXPECT_SHOPPERS || 213)
};

fs.mkdirSync(outDir, { recursive: true });

const report = {
  gate: 'cxorbia-tya-phase-a-source-safe-operational-visual-smoke',
  generatedAt: new Date().toISOString(),
  baseUrl,
  expected,
  source: null,
  roles: [],
  modules: [],
  blockers: [],
  warnings: [],
  decision: 'HOLD_NOT_RUN',
  safeState: {
    sourceSafe: true,
    writes: false,
    imported: false,
    production: false,
    providersWritten: false,
    paymentsExecuted: false,
    rawSensitiveDataOutput: false
  }
};

function addBlocker(code, detail = null) {
  report.blockers.push(detail ? `${code}:${detail}` : code);
}
function addWarning(code, detail = null) {
  report.warnings.push(detail ? `${code}:${detail}` : code);
}
function countOf(payload, key) {
  const explicit = Number(payload?.counts?.[key]);
  if (Number.isFinite(explicit)) return explicit;
  return Array.isArray(payload?.[key]) ? payload[key].length : 0;
}
function normalizedModuleKeys(value) {
  if (!value || typeof value !== 'object') return [];
  return Object.keys(value).map(key => String(key).toLowerCase()).sort();
}
function sanitizeConsole(text) {
  return String(text || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email-protected]')
    .replace(/\b\+?\d[\d\s()-]{7,}\b/g, '[phone-protected]')
    .slice(0, 300);
}

const roleSpecs = [
  {
    id: 'admin',
    enter: 'admin',
    expectedModules: ['dashboard', 'proyectos', 'visitas', 'postulaciones', 'certificaciones', 'finanzas', 'academia']
  },
  {
    id: 'cliente',
    enter: 'cliente',
    expectedModules: ['dashboard', 'visitas']
  },
  {
    id: 'shopper',
    enter: 'shopper',
    expectedModules: ['visitas', 'certificaciones', 'beneficios', 'academia']
  }
];

const browser = await chromium.launch({ headless: true });

async function harden(page) {
  await page.evaluate(() => {
    try { localStorage.setItem('cx_banners', '[]'); } catch {}
    try { sessionStorage.setItem('cx_pwa_shown', '1'); } catch {}
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.confidencialidad) {
      window.CX.confidencialidad.pending = () => false;
      window.CX.confidencialidad.show = (_role, done) => { if (done) done(); };
      window.CX.confidencialidad.accept = () => {};
    }
    if (window.CX?.app) window.CX.app.showBanners = () => {};
  });
}

async function openSourceSafePage(page) {
  await page.addInitScript(() => {
    window.CX_TYA_PHASE_A_PREVIEW = true;
    try { localStorage.setItem('cx_banners', '[]'); } catch {}
    try { sessionStorage.setItem('cx_pwa_shown', '1'); } catch {}
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => Boolean(window.CX_TYA_HR_SOURCE_SAFE), null, { timeout: 20000 });
  await page.waitForFunction(() => Boolean(window.CX?.app?.selectRole && window.CX?.router), null, { timeout: 20000 });
  await harden(page);
}

async function readSource(page) {
  return page.evaluate(() => {
    const source = window.CX_TYA_HR_SOURCE_SAFE || {};
    const visits = Array.isArray(source.visits) ? source.visits : [];
    const shoppers = Array.isArray(source.shoppers) ? source.shoppers : [];
    const periods = Array.isArray(source.periods) ? source.periods : [];
    const countryCounts = visits.reduce((acc, visit) => {
      const key = String(visit.pais || visit.country || 'UNKNOWN').toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const currencyCounts = visits.reduce((acc, visit) => {
      const key = String(visit.currency || 'UNKNOWN').toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const unsafeVisitCount = visits.filter(visit =>
      visit?.sourceSafe !== true ||
      visit?.tenantId !== 'tya' ||
      visit?.projectId !== 'cinepolis'
    ).length;
    const rawShopperNameSignals = visits.filter(visit => {
      const value = String(visit?.shopper || '');
      return value && value !== 'Shopper protegido';
    }).length;
    const june = visits.filter(visit => String(visit.periodKey || '') === '2026-06');
    const juneExecutionEvidence = june.filter(visit => Boolean(visit.realizada || visit.cuestFecha || visit.submittedAt || visit.submit)).length;
    return {
      tenantId: source.tenantId || null,
      projectId: source.projectId || null,
      generatedAt: source.generatedAt || null,
      sourceSafe: source.sourceSafe === true,
      imported: source.imported === true,
      production: source.production === true,
      counts: {
        periods: Number(source.counts?.periods ?? periods.length),
        visits: Number(source.counts?.visits ?? visits.length),
        shoppers: Number(source.counts?.shoppers ?? shoppers.length)
      },
      arrays: { periods: periods.length, visits: visits.length, shoppers: shoppers.length },
      countryCounts,
      currencyCounts,
      unsafeVisitCount,
      rawShopperNameSignals,
      june: { visits: june.length, withExecutionEvidence: juneExecutionEvidence }
    };
  });
}

async function enterRole(page, role) {
  await harden(page);
  await page.evaluate(value => {
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.session?.clear) window.CX.session.clear();
    window.CX.app.selectRole(value);
  }, role);
  await page.waitForSelector('#app.on', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#rail', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
  await harden(page);
}

async function moduleInventory(page) {
  return page.evaluate(() => ({
    moduleKeys: Object.keys(window.CX?.modules || {}).map(key => String(key).toLowerCase()).sort(),
    routeKeys: Object.keys(window.CX?.routes || {}).map(key => String(key).toLowerCase()).sort(),
    navText: Array.from(document.querySelectorAll('#rail button,#rail [data-nav],#rail [data-go],#rail .nav-item'))
      .map(node => String(node.textContent || '').trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 100),
    dataMode: window.CX?.data?.previewMeta?.sourceSafe === true || window.CX?.dataSource?.mode === 'source_safe_preview',
    currentProjectId: window.CX?.data?.currentProjectId || window.CX_TYA_HR_SOURCE_SAFE?.projectId || null
  }));
}

async function tryRoute(page, token) {
  return page.evaluate(async routeToken => {
    const modules = window.CX?.modules || {};
    const routes = window.CX?.routes || {};
    const keys = [...new Set([...Object.keys(modules), ...Object.keys(routes)])];
    const normalized = routeToken.toLowerCase();
    const exact = keys.find(key => key.toLowerCase() === normalized);
    const partial = keys.find(key => key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase()));
    const target = exact || partial || null;
    if (!target) return { token: routeToken, target: null, attempted: false, rendered: false };
    try {
      if (window.CX?.router?.go) window.CX.router.go(target);
      else if (window.CX?.router?.navigate) window.CX.router.navigate(target);
      else return { token: routeToken, target, attempted: false, rendered: false };
    } catch (error) {
      return { token: routeToken, target, attempted: true, rendered: false, error: String(error?.message || error).slice(0, 180) };
    }
    await new Promise(resolve => setTimeout(resolve, 250));
    const view = document.querySelector('#view');
    const text = String(view?.innerText || '').trim();
    return {
      token: routeToken,
      target,
      attempted: true,
      rendered: Boolean(view && text.length > 0),
      textLength: text.length,
      hasTechnicalPromise: /enviado con éxito|sincronizado con hr|pago ejecutado|publicado automáticamente/i.test(text)
    };
  }, token);
}

try {
  const sourceContext = await browser.newContext({ viewport: { width: 1440, height: 1100 }, serviceWorkers: 'block' });
  const sourcePage = await sourceContext.newPage();
  const sourceConsoleErrors = [];
  const sourcePageErrors = [];
  sourcePage.on('console', message => {
    if (message.type() === 'error') sourceConsoleErrors.push(sanitizeConsole(message.text()));
  });
  sourcePage.on('pageerror', error => sourcePageErrors.push(sanitizeConsole(error?.message || error)));
  await openSourceSafePage(sourcePage);
  report.source = await readSource(sourcePage);

  if (report.source.tenantId !== expected.tenantId) addBlocker('tenant_mismatch');
  if (report.source.projectId !== expected.projectId) addBlocker('project_mismatch');
  if (!report.source.sourceSafe) addBlocker('source_safe_false');
  if (report.source.imported) addBlocker('source_claims_imported_true');
  if (report.source.production) addBlocker('source_claims_production_true');
  if (countOf({ counts: report.source.counts }, 'periods') !== expected.periods) addBlocker('period_count_mismatch', `${report.source.counts.periods}/${expected.periods}`);
  if (countOf({ counts: report.source.counts }, 'visits') !== expected.visits) addBlocker('visit_count_mismatch', `${report.source.counts.visits}/${expected.visits}`);
  if (countOf({ counts: report.source.counts }, 'shoppers') !== expected.shoppers) addBlocker('shopper_count_mismatch', `${report.source.counts.shoppers}/${expected.shoppers}`);
  if (report.source.arrays.periods !== report.source.counts.periods) addBlocker('period_array_count_mismatch');
  if (report.source.arrays.visits !== report.source.counts.visits) addBlocker('visit_array_count_mismatch');
  if (report.source.unsafeVisitCount) addBlocker('unsafe_visit_records', String(report.source.unsafeVisitCount));
  if (report.source.rawShopperNameSignals) addBlocker('raw_shopper_name_signals', String(report.source.rawShopperNameSignals));
  if (!report.source.countryCounts.GT || !report.source.countryCounts.HN) addBlocker('country_coverage_missing');
  if (!report.source.currencyCounts.Q || !report.source.currencyCounts.L) addWarning('currency_coverage_review', JSON.stringify(report.source.currencyCounts));
  if (report.source.june.visits && report.source.june.withExecutionEvidence !== report.source.june.visits) {
    addWarning('june_rows_without_execution_evidence', `${report.source.june.visits - report.source.june.withExecutionEvidence}`);
  }
  if (sourceConsoleErrors.length) addWarning('source_console_errors', String(sourceConsoleErrors.length));
  if (sourcePageErrors.length) addBlocker('source_page_errors', String(sourcePageErrors.length));
  await sourcePage.screenshot({ path: path.join(outDir, 'source-safe-admin-entry.png'), fullPage: true });
  await sourceContext.close();

  for (const spec of roleSpecs) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(sanitizeConsole(message.text()));
    });
    page.on('pageerror', error => pageErrors.push(sanitizeConsole(error?.message || error)));
    const roleResult = {
      id: spec.id,
      status: 'pending',
      sourceSafeMode: false,
      projectId: null,
      expectedModules: spec.expectedModules,
      availableModuleKeys: [],
      routes: [],
      consoleErrorCount: 0,
      pageErrorCount: 0
    };
    try {
      await openSourceSafePage(page);
      await enterRole(page, spec.enter);
      const inventory = await moduleInventory(page);
      roleResult.sourceSafeMode = inventory.dataMode;
      roleResult.projectId = inventory.currentProjectId;
      roleResult.availableModuleKeys = normalizedModuleKeys(Object.fromEntries(inventory.moduleKeys.map(key => [key, true])));
      if (!inventory.dataMode) addWarning(`${spec.id}_source_safe_mode_not_exposed`);
      if (inventory.currentProjectId !== expected.projectId) addBlocker(`${spec.id}_project_context_mismatch`);
      for (const token of spec.expectedModules) {
        const routeResult = await tryRoute(page, token);
        roleResult.routes.push(routeResult);
        report.modules.push({ role: spec.id, ...routeResult });
        if (!routeResult.target) addWarning(`${spec.id}_module_alias_not_found`, token);
        else if (!routeResult.rendered) addBlocker(`${spec.id}_module_not_rendered`, token);
        if (routeResult.hasTechnicalPromise) addBlocker(`${spec.id}_dishonest_operational_copy`, token);
      }
      roleResult.consoleErrorCount = consoleErrors.length;
      roleResult.pageErrorCount = pageErrors.length;
      if (pageErrors.length) addBlocker(`${spec.id}_page_errors`, String(pageErrors.length));
      if (consoleErrors.length) addWarning(`${spec.id}_console_errors`, String(consoleErrors.length));
      await page.screenshot({ path: path.join(outDir, `${spec.id}-source-safe.png`), fullPage: true });
      roleResult.status = pageErrors.length ? 'fail' : 'pass';
    } catch (error) {
      roleResult.status = 'fail';
      roleResult.error = sanitizeConsole(error?.message || error);
      addBlocker(`${spec.id}_shell_failure`, roleResult.error);
      try { await page.screenshot({ path: path.join(outDir, `${spec.id}-source-safe-failure.png`), fullPage: true }); } catch {}
    } finally {
      report.roles.push(roleResult);
      await context.close();
    }
  }
} catch (error) {
  addBlocker('smoke_fatal', sanitizeConsole(error?.message || error));
} finally {
  await browser.close();
}

report.blockers = [...new Set(report.blockers)];
report.warnings = [...new Set(report.warnings)];
report.decision = report.blockers.length
  ? 'HOLD_SOURCE_SAFE_VISUAL_SMOKE'
  : report.warnings.length
    ? 'PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE'
    : 'PASS_SOURCE_SAFE_VISUAL_SMOKE';
report.ok = !report.blockers.length;

fs.writeFileSync(path.join(outDir, 'phase-a-source-safe-visual-smoke-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
const md = [
  '# CXOrbia TyA Phase A — source-safe operational visual smoke',
  '',
  `Generated: ${report.generatedAt}`,
  `Decision: ${report.decision}`,
  `Tenant/project: ${report.source?.tenantId || 'n/a'} / ${report.source?.projectId || 'n/a'}`,
  `Counts: ${report.source?.counts?.periods || 0} periods / ${report.source?.counts?.visits || 0} visits / ${report.source?.counts?.shoppers || 0} shoppers`,
  `Roles tested: ${report.roles.length}`,
  `Module routes tested: ${report.modules.length}`,
  `Blockers: ${report.blockers.length}`,
  `Warnings: ${report.warnings.length}`,
  '',
  '## Blockers',
  ...(report.blockers.length ? report.blockers.map(item => `- ${item}`) : ['- none']),
  '',
  '## Warnings',
  ...(report.warnings.length ? report.warnings.map(item => `- ${item}`) : ['- none']),
  '',
  '## Roles',
  ...report.roles.map(role => `- ${role.id}: ${role.status}; source-safe=${role.sourceSafeMode}; project=${role.projectId}; routes=${role.routes.length}`),
  '',
  '## Safe state',
  '- Source-safe data only',
  '- No raw PII output',
  '- No provider writes',
  '- No Firestore/Auth/Storage/HR writes',
  '- No import, payment, deploy or production',
  ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'phase-a-source-safe-visual-smoke-report.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 2;
