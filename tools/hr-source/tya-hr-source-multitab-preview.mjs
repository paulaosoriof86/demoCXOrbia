import fs from 'node:fs';
import path from 'node:path';
import { getSecretSource, extractGoogleSheetId, privateDir } from './tya-hr-source-private-registry.mjs';
import { previewWorkbook } from './tya-hr-source-xlsx-lite.mjs';

function arg(name){
  const prefix = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function issue(code, severity, message, expected = '', detected = '', delta = ''){
  return { code, severity, message, expected, detected, delta };
}

const sourceRef = arg('sourceRef') || process.env.CXORBIA_HR_SOURCE_REF || '';
const selected = getSecretSource(sourceRef);
const outDir = process.env.CXORBIA_HR_MULTITAB_OUT || path.join(privateDir, 'multitab-preview');
fs.mkdirSync(outDir, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'multitab-xlsx-preview-no-firestore-writes',
  sourceRef: selected?.safe?.sourceRef || sourceRef || '',
  maskedUrl: selected?.safe?.maskedUrl || '',
  status: 'blocked',
  counts: { firestoreWrites: 0, importsExecuted: 0 },
  tabs: [],
  issues: [],
  firestoreWrites: 0,
  importsExecuted: 0,
  canImport: false
};

try{
  if(!selected || !selected.rawUrl) throw new Error('No private source registered.');
  const sheetId = extractGoogleSheetId(selected.rawUrl);
  if(!sheetId) throw new Error('Registered source is not a Google Sheets URL.');

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const res = await fetch(exportUrl, { headers: { 'Cache-Control': 'no-cache' } });
  report.httpStatus = res.status;
  report.contentType = res.headers.get('content-type') || '';
  if(!res.ok){
    report.status = res.status === 401 || res.status === 403 ? 'auth_error' : 'blocked';
    report.issues.push(issue('google_xlsx_http_error', 'critical', `Google XLSX export returned HTTP ${res.status}`, 'HTTP 200', `HTTP ${res.status}`, 1));
  } else {
    const bytes = Buffer.from(await res.arrayBuffer());
    const preview = previewWorkbook(bytes);
    report.status = preview.sheets > 0 ? 'ready_for_preview' : 'empty_range';
    report.counts = {
      workbookFiles: preview.workbookFiles,
      sheets: preview.sheets,
      rows: preview.rows,
      firestoreWrites: 0,
      importsExecuted: 0
    };
    report.tabs = preview.tabs.map(t => ({
      name: t.name,
      sheetId: t.sheetId,
      rows: t.rows,
      columns: t.columns,
      headers: t.headers,
      issue: t.issue || ''
    }));
    if(preview.sheets === 0){
      report.issues.push(issue('xlsx_no_sheets', 'critical', 'Workbook does not expose sheets.', 'sheets > 0', 0, 1));
    }
    const emptyTabs = report.tabs.filter(t => t.rows === 0).length;
    if(emptyTabs){
      report.issues.push(issue('xlsx_empty_tabs', 'warning', `${emptyTabs} tabs without rows.`, 'all tabs with rows', emptyTabs, emptyTabs));
    }
  }
}catch(err){
  report.status = 'blocked';
  report.issues.push(issue('multitab_preview_exception', 'critical', err.message || String(err), 'successful multitab preview', 'exception', 1));
}

const jsonPath = path.join(outDir, 'hrSourceMultitabPreview.json');
const mdPath = path.join(outDir, 'hrSourceMultitabPreview.md');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# CXOrbia HR Source multitab XLSX preview',
  '',
  `Generated at: ${report.generatedAt}`,
  `Source ref: ${report.sourceRef}`,
  `Masked URL: ${report.maskedUrl}`,
  `Status: ${report.status}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- canImport: false',
  '- Raw URL is read from local private registry only',
  '',
  '## Counts',
  ...Object.entries(report.counts || {}).map(([k,v]) => `- ${k}: ${v}`),
  '',
  '## Tabs',
  ...(report.tabs.length ? report.tabs.map(t => `- ${t.name}: rows=${t.rows}, columns=${t.columns}`) : ['- none']),
  '',
  '## Issues',
  ...(report.issues.length ? report.issues.map(i => `- ${i.severity}: ${i.code} — ${i.message}`) : ['- none'])
].join('\n');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(md);
console.log('');
console.log(`JSON: ${jsonPath}`);
console.log(`Markdown: ${mdPath}`);

if(report.issues.some(i => i.severity === 'critical')) process.exitCode = 1;
