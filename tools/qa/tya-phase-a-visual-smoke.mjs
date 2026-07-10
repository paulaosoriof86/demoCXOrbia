#!/usr/bin/env node
/*
  CXOrbia TyA - visual smoke aligned to the post-V96 source lock.
  Browser-only validation. No deploy, providers, imports or database writes.
*/
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const valueOf = (flag, fallback = null) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const baseUrl = valueOf('--base-url', process.env.CXORBIA_BASE_URL || 'http://127.0.0.1:4173');
const outDir = valueOf('--out', '.tmp/phase-a-visual-smoke');
fs.mkdirSync(outDir, { recursive: true });

const report = {
  gate: 'cxorbia-tya-phase-a-visual-smoke-post-v96',
  generatedAt: new Date().toISOString(),
  baseUrl,
  roles: [],
  hardFails: [],
  warnings: [],
  safeState: { deploy: false, production: false, providers: false, databaseWrites: false, imports: false }
};

const roleSpecs = [
  { id: 'admin', enter: 'admin', shell: 'admin', expect: { projectSelector: true } },
  { id: 'coordinador', enter: 'coordinador', shell: 'admin' },
  { id: 'aliado', enter: 'aliado', shell: 'admin' },
  { id: 'custom', enter: 'custom', shell: 'admin', expectFailClosed: true },
  { id: 'cliente', enter: 'cliente', shell: 'cliente', expect: { clientProjectSelector: true } },
  { id: 'shopper', enter: 'shopper', shell: 'shopper' }
];

const browser = await chromium.launch({ headless: true });

async function hardenForSmoke(page) {
  await page.evaluate(() => {
    try { localStorage.setItem('cx_banners', '[]'); } catch {}
    try { sessionStorage.setItem('cx_pwa_shown', '1'); } catch {}
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.confidencialidad) {
      window.CX.confidencialidad.pending = () => false;
      window.CX.confidencialidad.show = (_role, onDone) => { if (onDone) onDone(); };
      window.CX.confidencialidad.accept = () => {};
    }
    if (window.CX?.app) window.CX.app.showBanners = () => {};
  });
}

async function enterRole(page, spec) {
  await page.waitForFunction(() => Boolean(window.CX?.app?.selectRole && window.CX?.confidencialidad && window.CX?.router), null, { timeout: 12000 });
  await hardenForSmoke(page);
  await page.evaluate(role => {
    document.querySelectorAll('.cx-ov').forEach(node => node.remove());
    if (window.CX?.session?.clear) window.CX.session.clear();
    if (window.CX?.confidencialidad) {
      window.CX.confidencialidad.pending = () => false;
      window.CX.confidencialidad.show = (_role, onDone) => { if (onDone) onDone(); };
    }
    if (window.CX?.app) window.CX.app.showBanners = () => {};
    window.CX.app.selectRole(role);
  }, spec.enter);
  await page.waitForTimeout(350);
  await hardenForSmoke(page);
}

async function waitForShell(page, shell) {
  const selectors = shell === 'cliente'
    ? ['#app.on', '#rail', '#view']
    : shell === 'shopper'
      ? ['#app.on', '#rail', '#view']
      : ['#app.on', '#rail', '#view'];
  for (const selector of selectors) await page.waitForSelector(selector, { state: 'visible', timeout: 12000 });
}

for (const spec of roleSpecs) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err.message || err)));
  const roleResult = { id: spec.id, shell: spec.shell, status: 'pending', consoleErrors, pageErrors };

  try {
    await page.addInitScript(() => {
      try { localStorage.setItem('cx_banners', '[]'); } catch {}
      try { sessionStorage.setItem('cx_pwa_shown', '1'); } catch {}
    });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await enterRole(page, spec);
    await waitForShell(page, spec.shell);

    const state = await page.evaluate(() => ({
      role: window.CX?.session?.role || null,
      effectiveRole: window.CX?.session?.effectiveRole?.() || window.CX?.session?.testRole || null,
      view: window.CX?.session?.view || null,
      projectId: window.CX?.data?.currentProjectId || null,
      appOn: document.querySelector('#app')?.classList.contains('on') || false,
      railRendered: (() => {
        const el = document.querySelector('#rail');
        if (!el) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })(),
      viewRendered: (() => {
        const el = document.querySelector('#view');
        if (!el) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })(),
      navItems: document.querySelectorAll('#rail button, #rail [data-nav], #rail [data-go], #rail .nav-item').length,
      overlays: document.querySelectorAll('.cx-ov').length,
      projectSelectors: document.querySelectorAll('#rail select,#projectSelect,#projectSel,[data-project-select]').length,
      clientProjectSelectors: document.querySelectorAll('#rail select,#clientProjectSel,[data-client-project-select]').length,
      bodyText: document.body.innerText.slice(0, 5000)
    }));
    roleResult.state = state;

    if (!state.appOn || !state.railRendered || !state.viewRendered) throw new Error('shell_not_visible');
    if (state.overlays) roleResult.warnings = [`non_blocking_overlay_count:${state.overlays}`];
    if (spec.expectFailClosed && state.navItems > 0) roleResult.warnings = [...(roleResult.warnings || []), `custom_role_visible_nav_items:${state.navItems}`];
    if (spec.expect?.projectSelector && state.projectSelectors === 0) roleResult.warnings = [...(roleResult.warnings || []), 'admin_project_selector_not_detected'];
    if (spec.expect?.clientProjectSelector && state.clientProjectSelectors === 0) roleResult.warnings = [...(roleResult.warnings || []), 'client_project_selector_not_detected'];

    if (consoleErrors.length) roleResult.warnings = [...(roleResult.warnings || []), `console_errors:${consoleErrors.length}`];
    if (pageErrors.length) throw new Error(`page_errors:${pageErrors.join(' | ')}`);

    roleResult.status = 'pass';
    await page.screenshot({ path: path.join(outDir, `${spec.id}.png`), fullPage: true });
  } catch (error) {
    roleResult.status = 'fail';
    roleResult.error = String(error.message || error);
    report.hardFails.push(`${spec.id}:${roleResult.error}`);
    try { await page.screenshot({ path: path.join(outDir, `${spec.id}-failure.png`), fullPage: true }); } catch {}
  } finally {
    report.roles.push(roleResult);
    await context.close();
  }
}

await browser.close();
for (const role of report.roles) {
  for (const warning of role.warnings || []) report.warnings.push(`${role.id}:${warning}`);
}
report.verdict = report.hardFails.length ? 'NO_GO_VISUAL_SMOKE_POST_V96' : (report.warnings.length ? 'GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96' : 'GO_VISUAL_SMOKE_POST_V96');
fs.writeFileSync(path.join(outDir, 'phase-a-visual-smoke-report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
const md = [
  '# CXOrbia TyA Phase A visual smoke — source lock post-V96', '',
  `Generated: ${report.generatedAt}`,
  `Base URL: ${report.baseUrl}`,
  `Verdict: ${report.verdict}`,
  `Hard fails: ${report.hardFails.length}`,
  `Warnings: ${report.warnings.length}`,
  '', '## Roles',
  ...report.roles.map(role => `- ${role.id}: ${role.status}${role.error ? ` — ${role.error}` : ''}`),
  '', '## Hard fails', ...(report.hardFails.length ? report.hardFails.map(x => `- ${x}`) : ['- none']),
  '', '## Warnings', ...(report.warnings.length ? report.warnings.map(x => `- ${x}`) : ['- none']),
  '', '## Safe state', '- No deploy', '- No production', '- No provider calls', '- No database writes', '- No imports', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'phase-a-visual-smoke-report.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.hardFails.length ? 1 : 0;
