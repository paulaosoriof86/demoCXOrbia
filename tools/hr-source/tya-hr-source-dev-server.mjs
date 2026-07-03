import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSecretSource, googleCsvExportUrl, detectSource, maskUrl as privateMaskUrl } from './tya-hr-source-private-registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = Number(process.env.CXORBIA_HR_SOURCE_PORT || 8787);
const previewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');

const ALLOWED_ACTIONS = new Set(['test', 'preview', 'sync-request']);

function readJson(file, fallback = null){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function readJsonl(file){
  try {
    return fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
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

function send(res, statusCode, body, origin = '*'){
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function issue({ code, severity = 'warning', message, expected = '', detected = '', delta = '', period = 'backend', row = '', action = '' }){
  return {
    code,
    codigo: code,
    severity,
    severidad: severity === 'critical' ? 'alto' : severity === 'warning' ? 'medio' : severity,
    periodo: period,
    expected,
    detected,
    delta,
    sourceRow: row,
    accion: action || message,
    message
  };
}

function maskRef(input){
  const raw = String(input || '').trim();
  if(!raw) return '';
  if(raw.length <= 12) return raw;
  return `${raw.slice(0, 6)}...${raw.slice(-4)}`;
}

function loadPreview(){
  const batch = readJson(path.join(previewDir, 'migrationBatch.json'), {});
  const visits = readJsonl(path.join(previewDir, 'previewVisits.jsonl'));
  const submitidos = readJsonl(path.join(previewDir, 'previewSubmitidos.jsonl'));
  const liquidations = readJsonl(path.join(previewDir, 'previewLiquidationCandidates.jsonl'));
  const shoppers = readJsonl(path.join(previewDir, 'previewShoppers.jsonl'));
  const postulations = readJsonl(path.join(previewDir, 'previewPostulations.jsonl'));
  const notifications = readJsonl(path.join(previewDir, 'previewNotifications.jsonl'));
  const validationIssues = readJsonl(path.join(previewDir, 'validationIssues.jsonl'));
  return { batch, visits, submitidos, liquidations, shoppers, postulations, notifications, validationIssues };
}

function periodsDetected(visits){
  const map = new Map();
  for(const v of visits){
    const key = `${v.periodRaw || 'sin_periodo'}|${v.country || 'sin_pais'}`;
    const cur = map.get(key) || { period: v.periodRaw || 'sin_periodo', country: v.country || 'sin_pais', visits: 0, status: v.periodStatus || '' };
    cur.visits += 1;
    map.set(key, cur);
  }
  return [...map.values()].sort((a,b)=>String(a.period).localeCompare(String(b.period)) || String(a.country).localeCompare(String(b.country)));
}

async function privateLiveCheck(payload){
  const requestedRef = String(payload.sourceRef || '').trim();
  if(!requestedRef || !requestedRef.startsWith('hrsrc_')) return null;

  const selected = getSecretSource(requestedRef);
  if(!selected || !selected.rawUrl || selected.safe?.sourceRef !== requestedRef){
    return {
      matched: false,
      sourceRef: requestedRef,
      sourceType: payload.sourceType || 'google_sheets',
      maskedUrl: payload.maskedUrl || maskRef(requestedRef),
      counts: { liveSourceMatched: false, firestoreWrites: 0, importsExecuted: 0 },
      issues: [issue({ code: 'private_source_not_registered', severity: 'warning', message: 'sourceRef no existe en registro privado local.', expected: 'registered private sourceRef', detected: requestedRef, delta: 1 })]
    };
  }

  const detected = detectSource(selected.rawUrl);
  const maskedUrl = selected.safe?.maskedUrl || privateMaskUrl(selected.rawUrl);
  const result = {
    matched: true,
    sourceRef: selected.safe.sourceRef,
    sourceType: detected.type || selected.safe.type || 'unknown',
    maskedUrl,
    counts: { liveSourceMatched: true, firestoreWrites: 0, importsExecuted: 0 },
    issues: []
  };

  try{
    if(detected.type === 'google_sheets'){
      const csvUrl = googleCsvExportUrl(selected.rawUrl);
      const res = await fetch(csvUrl, { headers: { 'Cache-Control': 'no-cache' } });
      result.counts.liveHttpStatus = res.status;
      result.counts.liveContentType = res.headers.get('content-type') || '';
      if(!res.ok){
        result.issues.push(issue({ code: 'google_csv_http_error', severity: 'critical', message: `Google CSV export returned HTTP ${res.status}`, expected: 'HTTP 200', detected: `HTTP ${res.status}`, delta: 1, period: 'live_source' }));
      } else {
        const rows = parseCsv(await res.text());
        const headers = rows[0] || [];
        result.counts.liveRows = Math.max(0, rows.length - 1);
        result.counts.liveColumns = headers.length;
        result.counts.liveHeadersPreview = headers.slice(0, 25).length;
        if(rows.length <= 1){
          result.issues.push(issue({ code: 'empty_google_csv_export', severity: 'warning', message: 'CSV export no contiene filas de datos.', expected: 'rows > 0', detected: String(Math.max(0, rows.length - 1)), delta: 1, period: 'live_source' }));
        }
        result.issues.push(issue({ code: 'single_gid_check_only', severity: 'warning', message: 'Live check valida un solo gid; HR multi-tab requiere Sheets API/export XLSX.', expected: 'all HR tabs', detected: 'single gid CSV', delta: 'multi_tab_pending', period: 'live_source' }));
      }
    } else if(detected.type === 'excel_online'){
      const res = await fetch(selected.rawUrl, { method: 'GET' });
      result.counts.liveHttpStatus = res.status;
      result.counts.liveContentType = res.headers.get('content-type') || '';
      if(!res.ok){
        result.issues.push(issue({ code: 'excel_online_http_error', severity: res.status === 401 || res.status === 403 ? 'critical' : 'warning', message: `Excel Online returned HTTP ${res.status}`, expected: 'HTTP 200', detected: `HTTP ${res.status}`, delta: 1, period: 'live_source' }));
      }
      result.issues.push(issue({ code: 'excel_online_parser_pending', severity: 'warning', message: 'Excel Online parsing requiere Microsoft Graph/export connector.', expected: 'workbook parsed', detected: 'access check only', delta: 'parser_pending', period: 'live_source' }));
    } else {
      result.issues.push(issue({ code: 'unsupported_source_type', severity: 'critical', message: 'Fuente no reconocida como Google Sheets ni Excel Online.', expected: 'google_sheets|excel_online', detected: detected.type, delta: 1, period: 'live_source' }));
    }
  }catch(err){
    result.issues.push(issue({ code: 'private_live_check_exception', severity: 'critical', message: err.message || String(err), expected: 'live check ok', detected: 'exception', delta: 1, period: 'live_source' }));
  }

  return result;
}

async function responseFor(action, payload){
  const loaded = loadPreview();
  const live = await privateLiveCheck(payload);
  const sourceRef = live?.sourceRef || payload.sourceRef || (payload.urlPending ? maskRef(payload.urlPending) : 'local-preview');
  const sourceType = live?.sourceType || payload.sourceType || 'google_sheets';
  const maskedUrl = live?.maskedUrl || payload.maskedUrl || maskRef(sourceRef);
  const sourceIssue = payload.urlPending
    ? issue({ code: 'url_received_not_persisted', severity: 'info', message: 'URL recibida solo en memoria para DEV; no se persiste en este endpoint local.', expected: 'private_backend_storage', detected: 'memory_only', delta: 0 })
    : null;

  if(!fs.existsSync(previewDir)){
    return {
      status: 'not_found',
      sourceType,
      sourceRef,
      maskedUrl,
      periodsDetected: [],
      counts: live?.counts || {},
      issues: [
        issue({ code: 'staging_preview_missing', severity: 'critical', message: `No existe staging preview local: ${previewDir}`, expected: 'tmp/tya-staging-preview', detected: 'missing', delta: 1 }),
        ...(live?.issues || [])
      ],
      canImport: false,
      message: 'No existe staging preview local. Ejecuta primero tya-build-staging-preview.ps1.'
    };
  }

  const issues = loaded.validationIssues.map(i => issue({
    code: i.code || 'validation_issue',
    severity: i.severity || 'warning',
    message: i.message || '',
    expected: i.expected ?? '',
    detected: i.detected ?? '',
    delta: i.delta ?? '',
    period: i.sourceFile || i.periodo || 'migration',
    row: i.sourceKey || i.sourceRow || '',
    action: i.message || ''
  }));
  if(sourceIssue) issues.unshift(sourceIssue);
  if(live?.issues?.length) issues.unshift(...live.issues);

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const counts = {
    visits: loaded.visits.length,
    submitidos: loaded.submitidos.length,
    liquidationCandidates: loaded.liquidations.length,
    shoppers: loaded.shoppers.length,
    postulations: loaded.postulations.length,
    notifications: loaded.notifications.length,
    validationIssues: loaded.validationIssues.length,
    liveSourceMatched: !!live?.matched,
    criticalIssues: criticalCount,
    warningIssues: warningCount,
    firestoreWrites: 0,
    importsExecuted: 0,
    ...(live?.counts || {})
  };

  if(action === 'test'){
    return {
      status: live?.issues?.some(i => i.severity === 'critical') ? 'auth_error' : 'connected',
      sourceType,
      sourceRef,
      maskedUrl,
      periodsDetected: [],
      counts: { validationIssues: loaded.validationIssues.length, liveSourceMatched: !!live?.matched, firestoreWrites: 0, importsExecuted: 0, ...(live?.counts || {}) },
      issues: [ ...(sourceIssue ? [sourceIssue] : []), ...(live?.issues || []) ],
      canImport: false,
      message: live?.matched ? 'Endpoint DEV HR conectado y fuente privada revisada. Importacion sigue bloqueada.' : 'Endpoint DEV HR conectado. Importacion sigue bloqueada.'
    };
  }

  if(action === 'sync-request'){
    return {
      status: 'blocked',
      sourceType,
      sourceRef,
      maskedUrl,
      periodsDetected: periodsDetected(loaded.visits),
      counts,
      issues: [
        issue({ code: 'sync_blocked_until_authorization', severity: 'critical', message: 'Sincronizacion bloqueada hasta autorizacion explicita y rollback.', expected: 'PAULA_AUTORIZA_DEV_STAGING_WRITE', detected: 'not_authorized', delta: 1 }),
        ...issues
      ],
      canImport: false,
      message: 'Sync bloqueado: falta autorizacion explicita.'
    };
  }

  const status = criticalCount > 0 ? 'blocked' : (warningCount > 0 ? 'parsed_with_warnings' : 'ready_for_preview');
  return {
    status,
    sourceType,
    sourceRef,
    maskedUrl,
    periodsDetected: periodsDetected(loaded.visits),
    counts,
    issues,
    canImport: false,
    message: status === 'blocked' ? 'Preview DEV generado con issues criticos. Importacion bloqueada.' : 'Preview DEV generado. Importacion bloqueada por seguridad.'
  };
}

function readBody(req){
  return new Promise((resolve, reject)=>{
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', ()=>{
      try { resolve(body ? JSON.parse(body) : {}); }
      catch(err){ reject(err); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res)=>{
  const origin = req.headers.origin || '*';
  if(req.method === 'OPTIONS') return send(res, 204, {}, origin);
  if(req.url !== '/api/hr-source' || req.method !== 'POST'){
    return send(res, 404, { status: 'not_found', message: 'Use POST /api/hr-source' }, origin);
  }
  try{
    const payload = await readBody(req);
    const action = String(payload.action || '').trim();
    if(!ALLOWED_ACTIONS.has(action)){
      return send(res, 400, {
        status: 'schema_changed',
        canImport: false,
        issues: [issue({ code: 'invalid_action', severity: 'critical', message: `Accion no soportada: ${action}`, expected: 'test|preview|sync-request', detected: action, delta: 1 })],
        message: 'Accion no soportada.'
      }, origin);
    }
    return send(res, 200, await responseFor(action, payload), origin);
  }catch(err){
    return send(res, 500, {
      status: 'blocked',
      canImport: false,
      issues: [issue({ code: 'dev_endpoint_exception', severity: 'critical', message: err.message || String(err), expected: 'valid_json', detected: 'exception', delta: 1 })],
      message: 'Error en endpoint DEV HR.'
    }, origin);
  }
});

server.listen(port, '127.0.0.1', ()=>{
  console.log('CXOrbia HR Source DEV endpoint listening');
  console.log(`URL: http://127.0.0.1:${port}/api/hr-source`);
  console.log(`Preview dir: ${previewDir}`);
  console.log('Private source support: enabled when sourceRef starts with hrsrc_');
  console.log('Firestore writes: 0');
  console.log('Imports executed: 0');
});
