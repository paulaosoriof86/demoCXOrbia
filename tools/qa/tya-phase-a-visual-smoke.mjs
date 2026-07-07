#!/usr/bin/env node
/*
  CXOrbia TyA - Phase A visual/console smoke
  Local-only browser smoke. No deploy, no provider calls, no DB writes.

  The script starts a local static server for /app, opens Chromium with Playwright,
  enters the demo as admin and shopper, navigates critical Phase A screens,
  checks that views are not blank, captures console/page errors, and verifies
  visible copy does not promise real sends/sync/payments while gates are off.
*/

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const appDir = path.join(root, 'app');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0 ? path.resolve(root, args[outIndex + 1]) : path.resolve(root, '.tmp/phase-a-visual-smoke');
const headless = !args.includes('--headed');

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'
};

function safeJoin(base, urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0] || '/');
  const rel = clean === '/' ? '/index.html' : clean;
  const full = path.normalize(path.join(base, rel));
  if (!full.startsWith(base)) return null;
  return full;
}

function startServer() {
  const server = http.createServer((req, res) => {
    const full = safeJoin(appDir, req.url || '/');
    if (!full || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      const fallback = path.join(appDir, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(fs.readFileSync(fallback));
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(full).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(full));
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const criticalAdmin = [
  ['dashboard', 'Dashboard'],
  ['postulaciones', 'Postulaciones'],
  ['reservas', 'Reservas'],
  ['automatizaciones', 'Automatizaciones'],
  ['financiero', 'Finanzas'],
  ['aprendizaje', 'Academia']
];
const criticalShopper = [
  ['visitas', 'Visitas disponibles'],
  ['reservas', 'Reservas shopper'],
  ['misvisitas', 'Mis visitas'],
  ['beneficios', 'Mis beneficios'],
  ['aprendizaje', 'Academia shopper'],
  ['cert', 'Certificación']
];
const forbiddenVisible = [
  'WhatsApp enviado', 'WA enviado al shopper', 'Correo enviado a', 'HR sincronizada', 'shopper notificado',
  'Payload de prueba enviado', 'Disparo enviado', 'eventos enviados', 'cuestionario enviado', 'Make activo',
  'Google Sheets en vivo', 'portal en vivo', 'pago automático', 'egreso automático'
];

async function assertVisibleCopy(page, label, findings) {
  const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  for (const term of forbiddenVisible) {
    if (text.includes(term)) findings.failures.push({ type: 'visible_forbidden_copy', label, term });
  }
}

async function navigateModule(page, id, label, findings) {
  const nav = page.locator(`#nav-${id}`);
  const count = await nav.count();
  if (!count) {
    findings.failures.push({ type: 'missing_nav', id, label });
    return;
  }
  await nav.first().click();
  await page.waitForTimeout(350);
  const viewText = (await page.locator('#view').innerText({ timeout: 5000 }).catch(() => '')).trim();
  if (viewText.length < 20) findings.failures.push({ type: 'blank_or_too_short_view', id, label, length: viewText.length });
  await assertVisibleCopy(page, label, findings);
  findings.visited.push({ id, label, textLength: viewText.length });
}

async function enterRole(page, role, findings) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#login', { timeout: 10000 });
  const selector = role === 'admin' ? '[data-role="admin"]' : '[data-role="shopper"]';
  await page.locator(selector).first().click();
  await page.waitForSelector('#app.on, #rail .nav-i', { timeout: 10000 }).catch(async () => {
    const appOn = await page.locator('#app').evaluate(el => el.className).catch(() => 'missing');
    findings.failures.push({ type: 'shell_not_ready', role, appClass: appOn });
  });
  await assertVisibleCopy(page, `login-${role}`, findings);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const port = server.address().port;
  const baseURL = `http://127.0.0.1:${port}`;
  const findings = {
    gate: 'cxorbia-tya-phase-a-visual-smoke',
    generatedAt: new Date().toISOString(),
    baseURL,
    safeState: { deploy: false, production: false, providers: false, databaseWrites: false, imports: false },
    visited: [], failures: [], warnings: [], console: [], pageErrors: []
  };

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  page.on('console', msg => {
    const text = msg.text();
    findings.console.push({ type: msg.type(), text: text.slice(0, 500) });
    if (msg.type() === 'error' && !/favicon|Failed to load resource/i.test(text)) findings.failures.push({ type: 'console_error', text: text.slice(0, 500) });
  });
  page.on('pageerror', err => findings.failures.push({ type: 'page_error', text: String(err.message || err).slice(0, 800) }));

  try {
    await enterRole(page, 'admin', findings);
    for (const [id, label] of criticalAdmin) await navigateModule(page, id, label, findings);
    const qFn = await page.evaluate(() => typeof window.CX?.shopperQuestionnaire === 'function').catch(() => false);
    if (!qFn) findings.failures.push({ type: 'missing_function', name: 'CX.shopperQuestionnaire' });
    else findings.visited.push({ id: 'shopperQuestionnaire', label: 'Cuestionario shopper function', textLength: 1 });

    await page.locator('#logoutBtn').click().catch(() => {});
    await page.waitForTimeout(200);
    await enterRole(page, 'shopper', findings);
    for (const [id, label] of criticalShopper) await navigateModule(page, id, label, findings);
  } finally {
    await page.screenshot({ path: path.join(outDir, 'phase-a-visual-smoke-last-page.png'), fullPage: true }).catch(() => {});
    await browser.close().catch(() => {});
    server.close();
  }

  findings.verdict = findings.failures.length ? 'NO_GO_VISUAL' : 'GO_VISUAL_CONDICIONADO_RC_PHASE_A';
  fs.writeFileSync(path.join(outDir, 'phase-a-visual-smoke-report.json'), JSON.stringify(findings, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Phase A visual smoke report', '',
    `Generated: ${findings.generatedAt}`,
    `Verdict: ${findings.verdict}`,
    `Visited: ${findings.visited.length}`,
    `Failures: ${findings.failures.length}`, '',
    '## Visited', ...findings.visited.map(v => `- ${v.label} (${v.id}) · textLength=${v.textLength}`), '',
    '## Failures', ...(findings.failures.length ? findings.failures.map(f => `- ${f.type}${f.id ? ` · ${f.id}` : ''}${f.term ? ` · ${f.term}` : ''}${f.text ? ` · ${f.text}` : ''}`) : ['- none']), '',
    '## Safe state', '- No deploy', '- No production', '- No provider calls', '- No database writes', '- No real imports', ''
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'phase-a-visual-smoke-report.md'), md, 'utf8');
  console.log(JSON.stringify(findings, null, 2));
  process.exitCode = findings.failures.length ? 1 : 0;
}

main().catch(err => { console.error(err); process.exit(1); });
