#!/usr/bin/env node
/*
  CXOrbia TyA R17 — fail-closed semantic visual gate based on Paula's human review.

  Purpose:
  - verify one canonical period actually controls sidebar, Dashboard, Visitas and Mi Día;
  - detect duplicate tenant title, raw spreadsheet date serials, static-snapshot claims,
    submit/liquidation conflation and fabricated uniform shopper attributes;
  - prevent a route/count-only smoke from being reported as a semantic visual PASS.

  Safety:
  - public DEV URL/browser read-only;
  - no Firebase/Auth/Storage/HR writes;
  - no imports, rules, Functions, Make, Gemini, payments, deploy or production;
  - no raw shopper names, email, phone, bank or document output.
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

const baseUrl = valueOf(
  '--base-url',
  process.env.CXORBIA_BASE_URL || 'https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r17=visible&semanticAudit=1'
);
const outDir = path.resolve(valueOf('--out', '.tmp/tya-r17-human-findings-semantic-gate'));
fs.mkdirSync(outDir, { recursive: true });

const report = {
  schemaVersion: '1.0.0',
  gate: 'cxorbia-tya-r17-human-findings-semantic-gate',
  generatedAt: new Date().toISOString(),
  baseUrl,
  decision: 'HOLD_NOT_RUN',
  login: null,
  source: null,
  dashboard: null,
  visits: null,
  myDay: null,
  shoppers: null,
  blockers: [],
  warnings: [],
  consoleErrors: [],
  pageErrors: [],
  safeState: {
    browserReadOnly: true,
    firestoreWrites: false,
    authWrites: false,
    storageWrites: false,
    hrWrites: false,
    imports: false,
    rules: false,
    functions: false,
    make: false,
    gemini: false,
    payments: false,
    deploy: false,
    production: false,
    piiOutput: false
  }
};

const norm = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const safeText = value => String(value || '')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email-protected]')
  .replace(/\b\+?\d[\d\s()-]{7,}\b/g, '[phone-protected]')
  .replace(/TYA_(GT|HN)_[A-Z0-9]+/g, 'TYA_$1_[protected]')
  .slice(0, 500);

function addBlocker(code, detail = null) {
  const item = detail == null ? code : `${code}:${safeText(detail)}`;
  if (!report.blockers.includes(item)) report.blockers.push(item);
}

function addWarning(code, detail = null) {
  const item = detail == null ? code : `${code}:${safeText(detail)}`;
  if (!report.warnings.includes(item)) report.warnings.push(item);
}

function monthKeyFromLabel(value) {
  const text = norm(value);
  const months = {
    ene: '01', enero: '01', feb: '02', febrero: '02', mar: '03', marzo: '03',
    abr: '04', abril: '04', may: '05', mayo: '05', jun: '06', junio: '06',
    jul: '07', julio: '07', ago: '08', agosto: '08', sep: '09', septiembre: '09',
    set: '09', setiembre: '09', oct: '10', octubre: '10', nov: '11', noviembre: '11',
    dic: '12', diciembre: '12'
  };
  const token = Object.keys(months).find(key => new RegExp(`\\b${key}\\b`, 'i').test(text));
  const yearMatch = text.match(/20\d{2}/);
  return token && yearMatch ? `${yearMatch[0]}-${months[token]}` : null;
}

async function preparePage(page) {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('cx_pwa_shown', '1');
      localStorage.setItem('cx_banners', '[]');
    } catch {}
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => window.CX_TYA_VISIBLE_DATA_READY === true, null, { timeout: 30000 });
  await page.waitForFunction(() => Boolean(window.CX?.app?.selectRole && window.CX?.router && window.CX?.data), null, { timeout: 30000 });
  await page.evaluate(() => {
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.confidencialidad) {
      window.CX.confidencialidad.pending = () => false;
      window.CX.confidencialidad.show = (_role, done) => { if (done) done(); };
      window.CX.confidencialidad.accept = () => {};
    }
    if (window.CX?.app) window.CX.app.showBanners = () => {};
  });
}

async function enterAdmin(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.session?.clear) window.CX.session.clear();
    window.CX.app.selectRole('admin');
  });
  await page.waitForSelector('#app.on', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#rail', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#view', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
}

async function nav(page, route) {
  await page.evaluate(value => window.CX.router.nav(value), route);
  await page.waitForTimeout(500);
}

async function selectedOption(page, selector) {
  return page.evaluate(sel => {
    const node = document.querySelector(sel);
    if (!node) return null;
    return {
      value: node.value,
      text: node.options?.[node.selectedIndex]?.textContent?.trim() || ''
    };
  }, selector);
}

async function setSidebarPeriodByLabel(page, labelPattern) {
  return page.evaluate(pattern => {
    const select = document.querySelector('#periodSel');
    if (!select) return { changed: false, reason: 'period_selector_missing' };
    const re = new RegExp(pattern, 'i');
    const option = [...select.options].find(item => re.test(String(item.textContent || '')));
    if (!option) return { changed: false, reason: 'period_option_missing' };
    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return { changed: true, value: option.value, text: String(option.textContent || '').trim() };
  }, labelPattern);
}

async function calendarSnapshot(page) {
  return page.evaluate(() => {
    const view = document.querySelector('#view');
    const text = String(view?.innerText || '').replace(/\s+/g, ' ').trim();
    const monthNode = [...document.querySelectorAll('#view span')].find(node =>
      /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+20\d{2}$/i
        .test(String(node.textContent || '').trim())
    );
    return {
      text: text.slice(0, 1800),
      monthLabel: String(monthNode?.textContent || '').trim(),
      activeCells: document.querySelectorAll('#view .cg-cell.cg-has').length,
      totalCells: document.querySelectorAll('#view .cg-cell').length
    };
  });
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push(safeText(message.text()));
  });
  page.on('pageerror', error => report.pageErrors.push(safeText(error?.message || error)));

  await preparePage(page);

  report.login = await page.evaluate(() => {
    const login = document.querySelector('#login');
    const brandName = String(document.querySelector('#login .login-brand .brand-name')?.textContent || '').trim();
    const title = String(document.querySelector('#login .login-title')?.textContent || '').trim();
    const hasClientLogo = Boolean(document.querySelector('#login .login-brand img.client-logo'));
    const flags = [...document.querySelectorAll('#login .login-flags .cflag span')]
      .map(node => String(node.textContent || '').trim())
      .filter(Boolean);
    return {
      fullText: String(login?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1200),
      brandName,
      title,
      hasClientLogo,
      flags,
      configuredCountries: Array.isArray(window.CX?.BRAND?.countries) ? window.CX.BRAND.countries : [],
      tenantId: window.CX?.BRAND?.id || null,
      clientName: window.CX?.BRAND?.clientName || null,
      tagline: window.CX?.BRAND?.tagline || null
    };
  });

  if (!report.login.hasClientLogo && norm(report.login.brandName) && norm(report.login.brandName) === norm(report.login.title)) {
    addBlocker('login_duplicate_tenant_title_without_logo', `${report.login.brandName} / ${report.login.title}`);
  }
  if (report.login.flags.length && report.login.flags.length === report.login.configuredCountries.length) {
    addWarning('login_flags_show_all_configured_countries_not_active_country_selection', report.login.flags.join(','));
  }
  await page.screenshot({ path: path.join(outDir, '01-login-default-r17.png'), fullPage: true });

  report.source = await page.evaluate(() => {
    const snapshot = window.CX_TYA_HR_SOURCE_SAFE || {};
    const visits = Array.isArray(snapshot.visits) ? snapshot.visits : [];
    const resources = performance.getEntriesByType('resource').map(entry => String(entry.name || ''));
    const runtimeHrRequests = resources.filter(url => /sheets\.googleapis\.com|docs\.google\.com\/spreadsheets|firestore\.googleapis\.com/i.test(url));
    const submittedAsLiquidated = visits.filter(visit =>
      visit?.estado === 'liquidada' &&
      Boolean(visit?.submittedAt || visit?.submit) &&
      !visit?.liquidationState &&
      !visit?.paymentState &&
      !visit?.liquidationEvidence
    ).length;
    const numericDateSignals = visits.reduce((count, visit) => {
      return count + ['disponibleDesde', 'agendada', 'realizada', 'cuestFecha', 'submittedAt']
        .filter(field => /^\d{3,6}(?:\.0+)?$/.test(String(visit?.[field] ?? '').trim())).length;
    }, 0);
    return {
      generatedAt: snapshot.generatedAt || null,
      buildLabel: snapshot.buildLabel || null,
      sourceType: snapshot.source?.type || null,
      accessMode: snapshot.source?.accessMode || null,
      counts: snapshot.counts || null,
      runtimeHrRequestCount: runtimeHrRequests.length,
      submittedAsLiquidated,
      numericDateSignals,
      dataSourceMode: window.CX?.dataSource?.mode || null,
      dataSourceStatus: window.CX?.dataSource?.status || null,
      dataSourceRef: window.CX?.dataSource?.sourceRef || null,
      sourceMode: window.CX?.data?.sourceMode || null
    };
  });

  if (report.source.runtimeHrRequestCount === 0) {
    addBlocker('deployed_app_uses_build_time_hr_snapshot_not_runtime_live_hr', report.source.generatedAt || 'generatedAt_missing');
  }
  if (report.source.submittedAsLiquidated > 0) {
    addBlocker('submitted_conflated_with_liquidated_without_financial_evidence', String(report.source.submittedAsLiquidated));
  }
  if (report.source.numericDateSignals > 0) {
    addBlocker('raw_spreadsheet_numeric_dates_in_source_payload', String(report.source.numericDateSignals));
  }

  await enterAdmin(page);

  await nav(page, 'dashboard');
  const initialSidebar = await selectedOption(page, '#periodSel');
  const initialDashboardMonth = await selectedOption(page, '#monthSel');
  const juneChange = await setSidebarPeriodByLabel(page, 'JUN\\s*2026');
  await page.waitForTimeout(700);
  await nav(page, 'dashboard');
  const juneSidebar = await selectedOption(page, '#periodSel');
  const juneDashboardMonth = await selectedOption(page, '#monthSel');
  const juneState = await page.evaluate(() => ({
    currentPeriodId: window.CX?.data?.currentProjectId || null,
    currentPeriodLabel: window.CX?.data?.project?.()?.periodo || window.CX?.data?.project?.()?.name || null,
    visitCount: window.CX?.data?.visitas?.()?.length || 0,
    viewText: String(document.querySelector('#view')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1400)
  }));

  report.dashboard = {
    initialSidebar,
    initialDashboardMonth,
    juneChange,
    juneSidebar,
    juneDashboardMonth,
    juneState
  };

  if (!juneChange.changed) addBlocker('sidebar_period_change_failed', juneChange.reason || 'unknown');
  const sidebarJuneKey = monthKeyFromLabel(juneSidebar?.text);
  const dashboardJuneKey = monthKeyFromLabel(juneDashboardMonth?.text);
  if (sidebarJuneKey && dashboardJuneKey && sidebarJuneKey !== dashboardJuneKey) {
    addBlocker('dashboard_month_selector_not_bound_to_canonical_sidebar_period', `${juneSidebar.text} / ${juneDashboardMonth.text}`);
  }
  if (juneState.currentPeriodId && !String(juneState.currentPeriodId).endsWith('2026-06')) {
    addBlocker('sidebar_period_did_not_update_cxdata_current_period', juneState.currentPeriodId);
  }
  await page.screenshot({ path: path.join(outDir, '02-dashboard-period-split-r17.png'), fullPage: true });

  const julyChange = await setSidebarPeriodByLabel(page, 'JUL\\s*2026');
  await page.waitForTimeout(700);
  await nav(page, 'midia');
  const julySidebar = await selectedOption(page, '#periodSel');
  let myDayInitial = await calendarSnapshot(page);
  let attempts = 0;
  while (monthKeyFromLabel(myDayInitial.monthLabel) !== '2026-07' && attempts < 4) {
    const next = await page.$('#cgNext');
    if (!next) break;
    await next.click();
    await page.waitForTimeout(450);
    myDayInitial = await calendarSnapshot(page);
    attempts += 1;
  }
  const myDayRuntime = await page.evaluate(() => ({
    currentPeriodId: window.CX?.data?.currentProjectId || null,
    currentPeriodLabel: window.CX?.data?.project?.()?.periodo || window.CX?.data?.project?.()?.name || null,
    currentPeriodVisits: window.CX?.data?.visitas?.()?.length || 0,
    scheduledOrAvailableDates: (window.CX?.data?.visitas?.() || []).filter(v => v?.agendada || v?.disponibleDesde).length
  }));
  report.myDay = { julyChange, julySidebar, calendar: myDayInitial, runtime: myDayRuntime, navigationAttempts: attempts };

  if (!julyChange.changed) addBlocker('july_period_change_failed', julyChange.reason || 'unknown');
  if (monthKeyFromLabel(myDayInitial.monthLabel) !== '2026-07') {
    addBlocker('my_day_calendar_month_not_bound_to_selected_period', `${julySidebar?.text || 'unknown'} / ${myDayInitial.monthLabel || 'missing'}`);
  }
  if (myDayRuntime.currentPeriodVisits > 0 && myDayRuntime.scheduledOrAvailableDates > 0 && myDayInitial.activeCells === 0) {
    addBlocker('my_day_july_calendar_empty_despite_period_date_rows', `${myDayRuntime.currentPeriodVisits} visits / ${myDayRuntime.scheduledOrAvailableDates} dated rows`);
  }
  await page.screenshot({ path: path.join(outDir, '03-my-day-july-calendar-r17.png'), fullPage: true });

  await nav(page, 'visitas');
  report.visits = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#vBody tr')];
    const rawAgendaValues = rows.map(row => String(row.children?.[5]?.textContent || '').trim())
      .filter(value => /^\d{3,6}(?:\.0+)?$/.test(value));
    const dataRows = window.CX?.data?.visitas?.() || [];
    const stateCounts = dataRows.reduce((acc, visit) => {
      const key = String(visit?.estado || 'missing');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return {
      visibleRows: rows.length,
      rawAgendaValueCount: rawAgendaValues.length,
      rawAgendaSamples: rawAgendaValues.slice(0, 5),
      currentPeriodId: window.CX?.data?.currentProjectId || null,
      currentPeriodVisits: dataRows.length,
      stateCounts
    };
  });
  if (report.visits.rawAgendaValueCount > 0) {
    addBlocker('visits_table_displays_raw_spreadsheet_date_serials', `${report.visits.rawAgendaValueCount} rows; samples=${report.visits.rawAgendaSamples.join(',')}`);
  }
  await page.screenshot({ path: path.join(outDir, '04-visits-raw-dates-r17.png'), fullPage: true });

  await nav(page, 'shoppers');
  report.shoppers = await page.evaluate(() => {
    const shoppers = Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers : [];
    const ratings = [...new Set(shoppers.map(s => s?.rating).filter(value => value != null))];
    const names = [...new Set(shoppers.map(s => String(s?.nombre || '')).filter(Boolean))];
    const states = [...new Set(shoppers.map(s => String(s?.estado || '')).filter(Boolean))];
    const honoraria = [...new Set(shoppers.map(s => String(s?.honorarioPref || '')).filter(Boolean))];
    const completeSignals = [...new Set(shoppers.map(s => s?.perfilCompleto))];
    return {
      count: shoppers.length,
      uniqueRatings: ratings,
      uniqueNameCount: names.length,
      allProtectedName: names.length === 1 && names[0] === 'Shopper protegido',
      uniqueStates: states,
      uniqueHonoraria: honoraria,
      completeSignals
    };
  });
  if (report.shoppers.count >= 200 && report.shoppers.uniqueRatings.length === 1) {
    addBlocker('shopper_operational_rating_uniform_placeholder', String(report.shoppers.uniqueRatings[0]));
  }
  if (report.shoppers.count >= 200 && report.shoppers.allProtectedName && report.shoppers.uniqueStates.length <= 1) {
    addWarning('shopper_list_is_protected_reference_projection_not_complete_operational_profile', String(report.shoppers.count));
  }
  await page.screenshot({ path: path.join(outDir, '05-shoppers-placeholder-projection-r17.png'), fullPage: true });

  if (report.consoleErrors.length) addWarning('console_errors', String(report.consoleErrors.length));
  if (report.pageErrors.length) addBlocker('page_errors', String(report.pageErrors.length));

  await context.close();
} catch (error) {
  addBlocker('semantic_gate_fatal', error?.stack || error?.message || String(error));
} finally {
  await browser.close();
}

report.decision = report.blockers.length
  ? 'NO_GO_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING'
  : report.warnings.length
    ? 'PASS_WITH_REVIEW_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING'
    : 'PASS_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING';
report.ok = report.blockers.length === 0;

fs.writeFileSync(
  path.join(outDir, 'tya-r17-human-findings-semantic-gate-report.json'),
  JSON.stringify(report, null, 2) + '\n',
  'utf8'
);

const md = [
  '# TyA R17 — human findings semantic gate',
  '',
  `Generated: ${report.generatedAt}`,
  `Decision: ${report.decision}`,
  `URL: ${report.baseUrl}`,
  `Blockers: ${report.blockers.length}`,
  `Warnings: ${report.warnings.length}`,
  '',
  '## Blockers',
  ...(report.blockers.length ? report.blockers.map(item => `- ${item}`) : ['- none']),
  '',
  '## Warnings',
  ...(report.warnings.length ? report.warnings.map(item => `- ${item}`) : ['- none']),
  '',
  '## Evidence summary',
  `- Login duplicate: ${report.blockers.some(item => item.startsWith('login_duplicate_tenant_title'))}`,
  `- Static HR snapshot only: ${report.blockers.some(item => item.startsWith('deployed_app_uses_build_time_hr_snapshot'))}`,
  `- Submitted/liquidated conflation: ${report.source?.submittedAsLiquidated || 0}`,
  `- Source numeric date signals: ${report.source?.numericDateSignals || 0}`,
  `- Dashboard period split: ${report.blockers.some(item => item.startsWith('dashboard_month_selector'))}`,
  `- Mi Día calendar mismatch/empty: ${report.blockers.some(item => item.startsWith('my_day_'))}`,
  `- Visible raw date serial rows: ${report.visits?.rawAgendaValueCount || 0}`,
  `- Uniform shopper rating placeholder: ${report.blockers.some(item => item.startsWith('shopper_operational_rating_uniform_placeholder'))}`,
  '',
  '## Safe state',
  '- Browser/public DEV read-only only',
  '- No Firestore/Auth/Storage/HR writes',
  '- No imports, rules, Functions, Make, Gemini, payments, deploy or production',
  '- No raw PII output',
  ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'tya-r17-human-findings-semantic-gate-report.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 2;
