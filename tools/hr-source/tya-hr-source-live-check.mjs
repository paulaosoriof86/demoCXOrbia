import fs from 'node:fs';
import path from 'node:path';
import { getSecretSource, googleCsvExportUrl, detectSource, privateDir } from './tya-hr-source-private-registry.mjs';

function arg(name){
  const prefix = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function parseCsv(text){
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for(let i = 0; i < text.length; i++){
    const ch = text[i];
    const next = text[i + 1];
    if(quoted){
      if(ch === '"' && next === '"') { cell += '"'; i++; }
      else if(ch === '"') quoted = false;
      else cell += ch;
    } else {
      if(ch === '"') quoted = true;
      else if(ch === ',') { row.push(cell); cell = ''; }
      else if(ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if(ch !== '\r') cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.filter(r => r.some(c => String(c || '').trim() !== ''));
}

function issue(code, severity, message, expected = '', detected = '', delta = ''){
  return { code, severity, message, expected, detected, delta };
}

const sourceRef = arg('sourceRef') || process.env.CXORBIA_HR_SOURCE_REF || '';
const selected = getSecretSource(sourceRef);
const outDir = process.env.CXORBIA_HR_LIVE_CHECK_OUT || path.join(privateDir, 'live-check');
fs.mkdirSync(outDir, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'live-source-check-no-firestore-writes',
  sourceRef: selected?.safe?.sourceRef || sourceRef || '',
  sourceType: selected?.safe?.type || 'unknown',
  provider: selected?.safe?.provider || 'unknown',
  maskedUrl: selected?.safe?.maskedUrl || '',
  firestoreWrites: 0,
  importsExecuted: 0,
  canImport: false,
  status: 'blocked',
  counts: {},
  periodsDetected: [],
  issues: []
};

try{
  if(!selected || !selected.rawUrl){
    throw new Error('No private source registered. Run tya-hr-source-register-private.mjs first.');
  }

  const detected = detectSource(selected.rawUrl);
  report.sourceType = detected.type;
  report.provider = detected.provider;

  if(detected.type === 'google_sheets'){
    const csvUrl = googleCsvExportUrl(selected.rawUrl);
    const res = await fetch(csvUrl, { headers: { 'Cache-Control': 'no-cache' } });
    report.httpStatus = res.status;
    report.contentType = res.headers.get('content-type') || '';
    if(!res.ok){
      report.status = res.status === 401 || res.status === 403 ? 'auth_error' : 'blocked';
      report.issues.push(issue('google_csv_http_error', 'critical', `Google CSV export returned HTTP ${res.status}`, 'HTTP 200', `HTTP ${res.status}`, 1));
    } else {
      const text = await res.text();
      const rows = parseCsv(text);
      const headers = rows[0] || [];
      report.status = rows.length > 1 ? 'ready_for_preview' : 'empty_range';
      report.counts = {
        rows: Math.max(0, rows.length - 1),
        columns: headers.length,
        firestoreWrites: 0,
        importsExecuted: 0
      };
      report.headersPreview = headers.slice(0, 25);
      if(rows.length <= 1){
        report.issues.push(issue('empty_google_csv_export', 'warning', 'CSV export did not contain data rows.', 'data rows > 0', rows.length - 1, 1));
      }
      report.issues.push(issue('single_gid_check_only', 'warning', 'Local check validates only one visible sheet/gid. Full multi-tab HR requires Sheets API or exported XLSX parser.', 'all HR tabs', 'single gid CSV', 'multi_tab_pending'));
    }
  } else if(detected.type === 'excel_online'){
    const res = await fetch(selected.rawUrl, { method: 'GET' });
    report.httpStatus = res.status;
    report.contentType = res.headers.get('content-type') || '';
    report.status = res.ok ? 'connected' : (res.status === 401 || res.status === 403 ? 'auth_error' : 'blocked');
    report.issues.push(issue('excel_online_parser_pending', 'warning', 'Excel Online access can be tested, but workbook parsing requires Microsoft Graph/export connector.', 'workbook rows parsed', 'access check only', 'parser_pending'));
  } else {
    report.status = 'schema_changed';
    report.issues.push(issue('unsupported_source_type', 'critical', 'Source URL is not recognized as Google Sheets or Excel Online.', 'google_sheets|excel_online', detected.type, 1));
  }
}catch(err){
  report.status = 'blocked';
  report.issues.push(issue('live_check_exception', 'critical', err.message || String(err), 'successful live check', 'exception', 1));
}

const jsonPath = path.join(outDir, 'hrSourceLiveCheck.json');
const mdPath = path.join(outDir, 'hrSourceLiveCheck.md');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# CXOrbia HR Source live check',
  '',
  `Generated at: ${report.generatedAt}`,
  `Source ref: ${report.sourceRef}`,
  `Source type: ${report.sourceType}`,
  `Provider: ${report.provider}`,
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
  '## Issues',
  ...(report.issues.length ? report.issues.map(i => `- ${i.severity}: ${i.code} — ${i.message}`) : ['- none'])
].join('\n');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(md);
console.log('');
console.log(`JSON: ${jsonPath}`);
console.log(`Markdown: ${mdPath}`);

if(report.issues.some(i => i.severity === 'critical')) process.exitCode = 1;
