const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const {chromium} = require('playwright');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

const [source, destination, expected] = process.argv.slice(2);
if (!/^[a-f0-9]{40}$/.test(source || '') || !destination || !['pass', 'missing-flags'].includes(expected)) {
  throw Error('Use: node <script> <source-sha> <result.json> <pass|missing-flags>');
}
const blob = file => execFileSync('git', ['show', source + ':' + file], {encoding: 'utf8'});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function prove() {
  const {pdfContentDiagnostic} = await import('./cxorbia-i3-finance-ui-export-readonly.mjs');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}, locale: 'en-US'});
    await page.route('**/*', route => route.abort());
    await page.setContent('<!doctype html><html lang="es"><meta charset="utf-8"><body></body></html>');
    for (const sheet of ['theme', 'layout']) await page.addStyleTag({content: blob('app/styles/' + sheet + '.css')});
    await page.evaluate(() => { window.CX = {module() {}}; window.print = () => {}; });
    await page.addScriptTag({content: blob('app/core/config.js')});
    await page.addScriptTag({content: blob('app/modules/cliente-extra.js')});

    // Use the original dashboard spec on synthetic aggregates. Keep the country oracle independent.
    const dashboard = blob('app/modules/finanzas.js');
    const begin = dashboard.indexOf('const finSpec=(ext)=>');
    const end = dashboard.indexOf("fx.addEventListener('click'", begin);
    if (begin < 0 || end <= begin) throw Error('SOURCE_FAILURE:FINANCE_DASHBOARD_SPEC');
    const spec = dashboard.slice(begin, end);
    await page.addScriptTag({content: `{
      const projectLabel='Proyecto de prueba', modelLbl='Prueba', p={countries:['GT','HN']};
      const sample=cur=>({cur,ingreso:10,honorarioDevengado:1,honorarioPorPagar:1,honorarioPagado:0,fijos:0,margen:9,margenPct:90,cxc:0,pagosConfirmados:0});
      const fp={GT:sample('GTQ'),HN:sample('HNL')}, finCurPeriod=()=>'Noviembre 2026', san=s=>s;
      ${spec}
      CX.reportKit.exportPDF(finSpec('pdf'));
    }`});
    const rows = [['🇬🇹 Guatemala','GTQ'],['🇭🇳 Honduras','HNL']];
    const dom = await page.locator('#cxRKPrint tbody tr').evaluateAll(items =>
      items.map(row => Array.from(row.cells).slice(0, 2).map(cell => cell.textContent.trim())));
    if (JSON.stringify(dom) !== JSON.stringify(rows)) throw Error('MAPPING_FAILURE:FINANCE_COUNTRY_FIXTURE');

    const pdf = await page.pdf({format: 'A4', printBackground: true});
    const doc = await pdfjs.getDocument({data: new Uint8Array(pdf), disableFontFace: true, useSystemFonts: true, isEvalSupported: false}).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      pages.push(content.items.map(item => item.str).join(' '));
    }
    const result = pdfContentDiagnostic({pages: doc.numPages, text: pages.join(' '), title: 'Dashboard Financiero', periodLabel: 'Noviembre 2026', rows});
    await doc.destroy();
    const output = {scope: 'SYNTHETIC_COUNTRY_RENDER_ONLY', source, chromium: browser.version(), playwright: require('playwright/package.json').version,
      pdfjs: pdfjs.version, dom, pdfBytes: pdf.length, pdfSha256: hash(pdf), result, operationalWrites: 0};
    fs.writeFileSync(destination, JSON.stringify(output, null, 2) + '\n');
    const missing = result.missingCells.map(cell => cell.expectedSha256);
    const bothFlagLabels = rows.map(([country]) => hash(country.toLowerCase()));
    if (expected === 'pass' ? !result.matches : !result.titleMatches || !result.periodMatches || JSON.stringify(missing) !== JSON.stringify(bothFlagLabels)) {
      throw Error('ENVIRONMENT_FAILURE:FINANCE_PDF_COUNTRY_FONT');
    }
  } finally {
    await browser.close();
  }
}
prove().catch(error => { console.error(error.message); process.exitCode = 1; });
