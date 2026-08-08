import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerPrivateSource } from './tya-hr-source-private-registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = Number(process.env.CXORBIA_HR_SOURCE_PORT || 8787);
const endpoint = `http://127.0.0.1:${port}/api/hr-source`;
const previewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');
const outDir = process.env.CXORBIA_HR_SOURCE_PRIVATE_FLOW_OUT || path.join(repoRoot, 'tmp', 'hr-source-private-full-flow');
const serverScript = path.join(repoRoot, 'tools', 'hr-source', 'tya-hr-source-dev-server.mjs');

function arg(name){
  const prefix = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
function assert(condition, message){ if(!condition) throw new Error(message); }
function safeName(value){ return String(value || '').replace(/[<>:"/\\|?*]+/g, '_').slice(0, 80); }

const rawUrl = arg('url') || process.env.CXORBIA_HR_SOURCE_URL || '';
const tenantId = arg('tenantId') || process.env.CXORBIA_TENANT_ID || 'tya';
const projectId = arg('projectId') || process.env.CXORBIA_PROJECT_ID || 'cinepolis';
const label = arg('label') || process.env.CXORBIA_HR_SOURCE_LABEL || 'TyA HR live source';

if(!rawUrl){
  console.error('Missing source URL. Set CXORBIA_HR_SOURCE_URL locally or pass --url="...". Do not paste private URLs into ChatGPT.');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

async function waitForEndpoint(timeoutMs = 15000){
  const started = Date.now();
  while(Date.now() - started < timeoutMs){
    try{
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', sourceType: 'google_sheets', sourceRef: 'wait-check', env: 'private-full-flow' })
      });
      if(res.status === 200) return true;
    }catch{
      // wait
    }
    await sleep(300);
  }
  return false;
}

async function post(action, safe){
  const payload = {
    action,
    tenantId,
    projectId,
    sourceType: safe.type || 'google_sheets',
    sourceRef: safe.sourceRef,
    maskedUrl: safe.maskedUrl,
    requestedAt: new Date().toISOString(),
    env: 'private-full-flow'
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return { action, statusCode: res.status, json };
}

function summarizePeriods(periods){
  const rows = Array.isArray(periods) ? periods : [];
  const byCountry = {};
  const tabRows = [];
  for(const p of rows){
    const country = p.country || p.pais || 'sin_pais';
    const period = p.period || p.periodo || p.name || 'sin_periodo';
    const visits = Number(p.visits || p.rows || 0);
    byCountry[country] = (byCountry[country] || 0) + visits;
    tabRows.push({ period, country, visits, status: p.status || '', columns: p.columns || '', sheetId: p.sheetId || '' });
  }
  return { count: tabRows.length, byCountry, rows: tabRows };
}

function issueCounts(issues){
  const out = { total: 0, critical: 0, warning: 0, info: 0, other: 0 };
  for(const i of Array.isArray(issues) ? issues : []){
    out.total += 1;
    const s = i.severity || i.severidad || 'other';
    if(s === 'critical' || s === 'critico' || s === 'alto') out.critical += 1;
    else if(s === 'warning' || s === 'medio') out.warning += 1;
    else if(s === 'info' || s === 'bajo') out.info += 1;
    else out.other += 1;
  }
  return out;
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'private-hr-source-full-flow-no-firestore-writes',
  tenantId,
  projectId,
  endpoint,
  previewDir,
  outDir,
  source: null,
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, canImportExpected: false },
  serverStarted: false,
  serverStopped: false,
  results: [],
  coverage: {},
  errors: []
};

let server = null;
let serverLog = '';

try{
  assert(fs.existsSync(serverScript), `Missing server script: ${serverScript}`);
  const reg = registerPrivateSource({ rawUrl, label, tenantId, projectId });
  report.source = {
    sourceRef: reg.safe.sourceRef,
    label: reg.safe.label,
    type: reg.safe.type,
    provider: reg.safe.provider,
    maskedUrl: reg.safe.maskedUrl,
    safeRegistryPath: reg.safeRegistryPath,
    secretRegistryPath: reg.secretRegistryPath ? '[local secret path omitted from report body]' : ''
  };

  if(!fs.existsSync(previewDir)){
    report.errors.push(`Missing staging preview dir: ${previewDir}. Run the safe pipeline/staging preview first. Live HR check can still be registered, but combined preview needs staging.`);
  }

  server = spawn(process.execPath, [serverScript], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CXORBIA_HR_SOURCE_PORT: String(port),
      CXORBIA_TYA_STAGING_PREVIEW_DIR: previewDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  report.serverStarted = true;
  server.stdout.on('data', chunk => { serverLog += chunk.toString(); });
  server.stderr.on('data', chunk => { serverLog += chunk.toString(); });

  const ready = await waitForEndpoint();
  assert(ready, `Endpoint did not become ready: ${endpoint}`);

  for(const action of ['test', 'preview', 'sync-request']){
    const result = await post(action, reg.safe);
    assert(result.statusCode === 200, `${action}: HTTP ${result.statusCode}`);
    assert(result.json && typeof result.json.status === 'string', `${action}: missing status`);
    assert(result.json.canImport === false, `${action}: canImport must be false`);
    if(action === 'sync-request') assert(result.json.status === 'blocked', 'sync-request must stay blocked');
    const coverage = summarizePeriods(result.json.periodsDetected);
    const issues = issueCounts(result.json.issues);
    report.results.push({
      action,
      http: result.statusCode,
      status: result.json.status,
      canImport: result.json.canImport,
      counts: result.json.counts || {},
      periodsDetected: coverage.count,
      countryTotals: coverage.byCountry,
      issues
    });
    if(action === 'preview'){
      report.coverage = {
        periodsDetected: coverage.count,
        countryTotals: coverage.byCountry,
        periodRows: coverage.rows,
        rawIssuesPreview: Array.isArray(result.json.issues) ? result.json.issues.slice(0, 50).map(i => ({ code: i.code || i.codigo, severity: i.severity || i.severidad, period: i.period || i.periodo, message: i.message || i.accion })) : []
      };
    }
  }
}catch(err){
  report.errors.push(String(err && err.stack ? err.stack : err));
  process.exitCode = 1;
}finally{
  if(server){
    server.kill('SIGTERM');
    report.serverStopped = true;
  }
  report.serverLog = serverLog.trim().slice(-4000);
  const jsonPath = path.join(outDir, 'hrSourcePrivateFullFlow.json');
  const mdPath = path.join(outDir, 'hrSourcePrivateFullFlow.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const resultLines = report.results.map(r => `- ${r.action}: HTTP ${r.http}, status=${r.status}, canImport=${r.canImport}, periods=${r.periodsDetected}, issues=${r.issues.total}, critical=${r.issues.critical}`);
  const coverageRows = (report.coverage.periodRows || []).map(r => `| ${r.period} | ${r.country} | ${r.visits} | ${r.columns || ''} | ${r.status || ''} |`);
  const issueRows = (report.coverage.rawIssuesPreview || []).map(i => `| ${i.code || ''} | ${i.severity || ''} | ${i.period || ''} | ${(i.message || '').replace(/\|/g, '/')} |`);
  const md = [
    '# CXOrbia TyA HR Source private full flow',
    '',
    `Generated at: ${report.generatedAt}`,
    `Tenant: ${tenantId}`,
    `Project: ${projectId}`,
    `Endpoint: ${endpoint}`,
    '',
    '## Source',
    `- sourceRef: ${report.source?.sourceRef || ''}`,
    `- type: ${report.source?.type || ''}`,
    `- provider: ${report.source?.provider || ''}`,
    `- maskedUrl: ${report.source?.maskedUrl || ''}`,
    '',
    '## Safety',
    '- Firestore writes: 0',
    '- Imports executed: 0',
    '- Deploy: 0',
    '- canImport expected: false',
    '',
    '## Results',
    ...(resultLines.length ? resultLines : ['- none']),
    '',
    '## Coverage by period/tab',
    '| Period/tab | Country/source | Rows/visits | Columns | Status |',
    '|---|---:|---:|---:|---|',
    ...(coverageRows.length ? coverageRows : ['| none | - | 0 | - | - |']),
    '',
    '## Issues preview',
    '| Code | Severity | Period | Message |',
    '|---|---|---|---|',
    ...(issueRows.length ? issueRows : ['| none | - | - | - |']),
    '',
    '## Errors',
    ...(report.errors.length ? report.errors.map(e => `- ${e}`) : ['- none']),
    '',
    `JSON report: ${jsonPath}`
  ].join('\n');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(md);
  console.log('');
  console.log(`Report dir: ${outDir}`);
}
