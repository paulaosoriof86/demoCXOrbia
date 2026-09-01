#!/usr/bin/env node
/*
  CXOrbia TyA Phase A - live HR source-safe static builder
  - Reads the live multi-tab Google Sheet with a service account when Sheets API is available.
  - Falls back to public XLSX export when the HR is shared by link and Sheets API is not available to the service project.
  - Writes a public-safe JS payload for DEV Hosting preview.
  - Does not write Firestore, Storage, HR, Make, Gemini, payments or production.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { unzipXlsx, sharedStrings, workbookSheets, worksheetRows } from './tya-hr-source-xlsx-lite.mjs';

const SHEET_ID = process.env.CXORBIA_HR_LIVE_SHEET_ID || '1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const OUT_FILE = process.env.CXORBIA_HR_SOURCE_SAFE_OUT || 'app/data/tya-hr-source-safe-periods.js';
const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';
const RANGE_MAX_ROW = Number(process.env.CXORBIA_HR_LIVE_MAX_ROW || 140);
const RANGE_MAX_COL = process.env.CXORBIA_HR_LIVE_MAX_COL || 'AI';
const NOW = new Date().toISOString();

const MONTHS = {
  ENERO: { n: 1, short: 'ENE', full: 'Enero' },
  FEBRERO: { n: 2, short: 'FEB', full: 'Febrero' },
  MARZO: { n: 3, short: 'MAR', full: 'Marzo' },
  ABRIL: { n: 4, short: 'ABR', full: 'Abril' },
  MAYO: { n: 5, short: 'MAY', full: 'Mayo' },
  JUNIO: { n: 6, short: 'JUN', full: 'Junio' },
  JULIO: { n: 7, short: 'JUL', full: 'Julio' },
  AGOSTO: { n: 8, short: 'AGO', full: 'Agosto' },
  SEPTIEMBRE: { n: 9, short: 'SEP', full: 'Septiembre' },
  SETIEMBRE: { n: 9, short: 'SEP', full: 'Septiembre' },
  OCTUBRE: { n: 10, short: 'OCT', full: 'Octubre' },
  NOVIEMBRE: { n: 11, short: 'NOV', full: 'Noviembre' },
  DICIEMBRE: { n: 12, short: 'DIC', full: 'Diciembre' }
};

function b64url(input){
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function safeServiceAccountInfo(){
  try {
    const sa = SERVICE_ACCOUNT_JSON ? JSON.parse(SERVICE_ACCOUNT_JSON) : {};
    return {
      type: sa.type || '',
      clientEmail: sa.client_email || '',
      projectId: sa.project_id || ''
    };
  } catch {
    return { type: '', clientEmail: '', projectId: '' };
  }
}

function signJwt(sa){
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(sa.private_key).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsigned}.${signature}`;
}

async function tokenFromServiceAccount(){
  if(!SERVICE_ACCOUNT_JSON) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON env.');
  const sa = JSON.parse(SERVICE_ACCOUNT_JSON);
  if(sa.type !== 'service_account') throw new Error('Secret is not a service_account JSON.');
  const jwt = signJwt(sa);
  const body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt });
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const json = await res.json();
  if(!res.ok) throw new Error(`Google OAuth failed: HTTP ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  return { token: json.access_token, clientEmail: sa.client_email };
}

async function sheetsGet(pathAndQuery, token){
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${pathAndQuery}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if(!res.ok) throw new Error(`Sheets API failed: HTTP ${res.status} ${JSON.stringify(json).slice(0, 500)}`);
  return json;
}

function parseTabName(title){
  const clean = String(title || '').trim().replace(/\s+/g, ' ').toUpperCase();
  const m = clean.match(/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{2})(?:\s+(HN))?$/);
  if(!m) return null;
  const month = MONTHS[m[1]];
  const year = 2000 + Number(m[2]);
  const country = m[3] === 'HN' ? 'HN' : 'GT';
  return {
    country,
    year,
    month: month.n,
    monthName: month.full,
    label: `${month.short} ${year}`,
    fullLabel: `${month.full} ${year}`,
    key: `${year}-${String(month.n).padStart(2, '0')}`,
    tabTitle: title
  };
}

function norm(value){
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();
}

function findHeader(values){
  for(let i = 0; i < Math.min(values.length, 14); i++){
    const row = values[i] || [];
    const normalized = row.map(norm);
    if(normalized.includes('pais') && normalized.some(v => v.includes('shopping'))){
      const map = {};
      normalized.forEach((v, idx) => { if(v) map[v] = idx; });
      return { index: i, row, normalized, map };
    }
  }
  return null;
}

function col(header, aliases){
  for(const a of aliases){
    const needle = norm(a);
    const exact = header.normalized.indexOf(needle);
    if(exact >= 0) return exact;
    const partial = header.normalized.findIndex(v => v && v.includes(needle));
    if(partial >= 0) return partial;
  }
  return -1;
}

function cell(row, idx){ return idx >= 0 ? String(row[idx] ?? '').trim() : ''; }
function isBlank(row){ return !row || row.every(v => String(v ?? '').trim() === ''); }
function isVisitRow(row, c){
  return !!(cell(row, c.pais) && cell(row, c.shopping) && cell(row, c.idCinema));
}

function safeHash(value, prefix){
  const raw = String(value || '').trim();
  if(!raw) return '';
  return `${prefix}_${crypto.createHash('sha256').update(raw.toLowerCase()).digest('hex').slice(0, 10)}`;
}

function normalizeMoney(raw){
  const text = String(raw || '').trim();
  if(!text) return null;
  const n = Number(text.replace(/[QL\s]/gi, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function statusFrom(row, c){
  const control = norm(cell(row, c.controlDia));
  const scheduled = cell(row, c.fechaProgramada);
  const realized = cell(row, c.fechaRealizada);
  const questionnaire = cell(row, c.fechaCuestionario);
  const submitted = cell(row, c.fechaSubmitido);
  const shopper = cell(row, c.shopper);
  if(submitted) return 'liquidada';
  if(questionnaire) return 'cuestionario';
  if(realized) return 'realizada';
  if(control.includes('fuera')) return 'fuera_rango';
  if(control.includes('p x asignar')) return 'disponible';
  if(control.includes('p x agendar')) return shopper ? 'asignada' : 'disponible';
  if(scheduled) return 'agendada';
  if(shopper) return 'asignada';
  return 'disponible';
}

function visitFrom(row, c, meta, rowNumber){
  const shopperName = cell(row, c.shopper);
  const country = meta.country;
  const status = statusFrom(row, c);
  const shopping = cell(row, c.shopping);
  const cinemaId = cell(row, c.idCinema);
  const visitId = `hr_${meta.key}_${country.toLowerCase()}_${rowNumber}_${safeHash([cinemaId, shopping, cell(row, c.quincena), cell(row, c.franja), rowNumber].join('|'), 'v').slice(-10)}`;
  return {
    id: visitId,
    hrRowId: `${meta.tabTitle}!${rowNumber}`,
    sourceTab: meta.tabTitle,
    sourceRow: rowNumber,
    tenantId: 'tya',
    projectId: 'cinepolis',
    program: 'cinepolis',
    periodKey: meta.key,
    periodLabel: meta.label,
    pais: country,
    country,
    cinemaId,
    sucursal: shopping,
    ciudad: cell(row, c.ciudad),
    quincena: cell(row, c.quincena),
    franja: cell(row, c.franja),
    franjaCode: norm(cell(row, c.franja)).includes('wknd') ? 'WKND' : 'WK',
    formato: cell(row, c.formato),
    escenario: cell(row, c.tipoCompra),
    tipoCombo: cell(row, c.tipoCombo),
    metodoPago: cell(row, c.metodoPago),
    disponibleDesde: cell(row, c.disponibleDesde),
    agendada: cell(row, c.fechaProgramada) || null,
    realizada: cell(row, c.fechaRealizada) || null,
    cuestFecha: cell(row, c.fechaCuestionario) || null,
    submittedAt: cell(row, c.fechaSubmitido) || null,
    submit: !!cell(row, c.fechaSubmitido),
    estado: status,
    controlDia: cell(row, c.controlDia),
    shopperId: safeHash(shopperName, `shopper_${country.toLowerCase()}`),
    shopper: shopperName ? 'Shopper protegido' : null,
    shopperCode: shopperName ? safeHash(shopperName, `TYA_${country}`).toUpperCase() : null,
    hasShopper: !!shopperName,
    currency: country === 'HN' ? 'L' : 'Q',
    honorario: normalizeMoney(cell(row, c.honorarios)),
    boleto: normalizeMoney(cell(row, c.precioBoleto)),
    comboAmt: normalizeMoney(cell(row, c.precioCombo)),
    sourceSafe: true,
    piiProtected: true
  };
}

function buildFromRange(meta, values){
  const header = findHeader(values || []);
  if(!header) return { meta, visits: [], issues: [{ code: 'header_not_found', severity: 'critical', tab: meta.tabTitle }] };
  const c = {
    pais: col(header, ['País']),
    idCinema: col(header, ['ID CINEMA']),
    ciudad: col(header, ['CIUDAD']),
    shopping: col(header, ['Shopping']),
    franja: col(header, ['Franja Horaria']),
    formato: col(header, ['Formato de Cine']),
    tipoCombo: col(header, ['Tipo de Combo']),
    tipoCompra: col(header, ['Tipo de Compra']),
    metodoPago: col(header, ['Método de Pago']),
    quincena: col(header, ['Quincena']),
    shopper: col(header, ['Shopper Asignado']),
    disponibleDesde: col(header, ['Disponible a partir de', 'Disponible desde']),
    fechaProgramada: col(header, ['Fecha programada']),
    controlDia: col(header, ['Control día s/ franja horaria', 'Control dia s/ franja horaria']),
    fechaRealizada: col(header, ['Fecha realizada']),
    fechaCuestionario: col(header, ['Fecha Cuestionario completado', 'Ccuestionario completado', 'Cuestionario completado']),
    precioBoleto: col(header, ['Precio de boleto']),
    precioCombo: col(header, ['Precio de combo']),
    honorarios: col(header, ['Honorarios']),
    fechaSubmitido: col(header, ['Fecha submitido', 'Submitido'])
  };
  const issues = [];
  for(const [name, idx] of Object.entries(c)){
    if(['precioBoleto', 'precioCombo', 'honorarios', 'metodoPago'].includes(name)) continue;
    if(idx < 0) issues.push({ code: 'column_missing', severity: 'warning', tab: meta.tabTitle, column: name });
  }
  const visits = [];
  for(let i = header.index + 1; i < values.length; i++){
    const row = values[i] || [];
    if(isBlank(row)) continue;
    if(!isVisitRow(row, c)) continue;
    visits.push(visitFrom(row, c, meta, i + 1));
  }
  return { meta, visits, issues, headerRow: header.index + 1 };
}

function summarizePeriods(visits, tabs){
  const periodMap = new Map();
  for(const tab of tabs){
    const k = tab.key;
    if(!periodMap.has(k)){
      periodMap.set(k, {
        key: k,
        label: tab.label,
        fullLabel: tab.fullLabel,
        month: tab.month,
        monthName: tab.monthName,
        year: tab.year,
        projectId: 'cinepolis',
        projectName: 'Cinépolis',
        internalName: `Cinépolis ${tab.fullLabel}`,
        countries: { GT: 0, HN: 0 },
        tabs: {}
      });
    }
    const p = periodMap.get(k);
    p.tabs[tab.country] = tab.tabTitle;
  }
  for(const v of visits){
    const p = periodMap.get(v.periodKey);
    if(!p) continue;
    p.countries[v.country] = (p.countries[v.country] || 0) + 1;
  }
  const periods = [...periodMap.values()].map(p => ({ ...p, total: (p.countries.GT || 0) + (p.countries.HN || 0) }));
  periods.sort((a,b)=> a.key.localeCompare(b.key));
  return periods;
}

function summarizeShoppers(visits){
  const map = new Map();
  for(const v of visits){
    if(!v.shopperId) continue;
    const cur = map.get(v.shopperId) || {
      id: v.shopperId,
      code: v.shopperCode,
      nombre: 'Shopper protegido',
      pais: v.country,
      ciudad: v.ciudad,
      estado: 'Activo',
      visitas: 0,
      realizadas: 0,
      liquidadas: 0,
      sourceSafe: true,
      piiProtected: true
    };
    cur.visitas += 1;
    if(['realizada','cuestionario','liquidada'].includes(v.estado)) cur.realizadas += 1;
    if(v.estado === 'liquidada') cur.liquidadas += 1;
    map.set(v.shopperId, cur);
  }
  return [...map.values()].sort((a,b)=>String(a.code).localeCompare(String(b.code)));
}

function countsByStatus(visits){
  const out = {};
  for(const v of visits) out[v.estado] = (out[v.estado] || 0) + 1;
  return out;
}

async function readFromSheetsApi(){
  const { token, clientEmail } = await tokenFromServiceAccount();
  const meta = await sheetsGet('?fields=properties(title,timeZone,locale),sheets(properties(title,index,gridProperties(rowCount,columnCount)))', token);
  const tabs = (meta.sheets || []).map(s => parseTabName(s.properties?.title)).filter(Boolean);
  if(!tabs.length) throw new Error('No valid HR month tabs detected.');
  const ranges = tabs.map(t => `'${t.tabTitle.replace(/'/g, "''")}'!A1:${RANGE_MAX_COL}${RANGE_MAX_ROW}`);
  const valueRanges = [];
  for(let i = 0; i < ranges.length; i += 8){
    const chunk = ranges.slice(i, i + 8).map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    const json = await sheetsGet(`/values:batchGet?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&${chunk}`, token);
    valueRanges.push(...(json.valueRanges || []));
  }
  return {
    accessMode: 'sheets_api_service_account',
    clientEmail,
    title: meta.properties?.title || 'HR Guatemala - Sincronizacion Google Sheets',
    tabs,
    valueRanges
  };
}

async function readFromPublicXlsxExport(apiError){
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;
  const res = await fetch(url, { redirect: 'follow' });
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || '';
  if(!res.ok) throw new Error(`XLSX export failed: HTTP ${res.status} ${contentType}`);
  if(buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b){
    const preview = buf.toString('utf8', 0, Math.min(buf.length, 300));
    throw new Error(`XLSX export did not return a ZIP workbook. contentType=${contentType}; preview=${preview}`);
  }
  const files = unzipXlsx(buf);
  const shared = sharedStrings(files);
  const sheets = workbookSheets(files);
  const tabs = sheets.map(s => parseTabName(s.name)).filter(Boolean);
  if(!tabs.length) throw new Error('No valid HR month tabs detected in XLSX export.');
  const valueRanges = tabs.map(tab => {
    const sheet = sheets.find(s => s.name === tab.tabTitle);
    return { range: tab.tabTitle, values: worksheetRows(files, sheet, shared).slice(0, RANGE_MAX_ROW) };
  });
  const info = safeServiceAccountInfo();
  return {
    accessMode: 'public_xlsx_export_fallback',
    fallbackReason: String(apiError?.message || apiError || '').slice(0, 500),
    clientEmail: info.clientEmail || '',
    title: 'HR Guatemala - Sincronizacion Google Sheets',
    tabs,
    valueRanges
  };
}

async function readLiveHr(){
  try {
    return await readFromSheetsApi();
  } catch (apiError) {
    console.warn('[HR live] Sheets API path failed; trying public XLSX export fallback.');
    console.warn(String(apiError?.message || apiError).slice(0, 800));
    return await readFromPublicXlsxExport(apiError);
  }
}

async function main(){
  const live = await readLiveHr();
  const allVisits = [];
  const allIssues = [];
  const tabsRead = [];
  live.valueRanges.forEach((vr, i) => {
    const tab = live.tabs[i];
    const parsed = buildFromRange(tab, vr.values || []);
    allVisits.push(...parsed.visits);
    allIssues.push(...parsed.issues);
    tabsRead.push({ title: tab.tabTitle, country: tab.country, periodKey: tab.key, rows: parsed.visits.length, headerRow: parsed.headerRow || null });
  });

  const periods = summarizePeriods(allVisits, live.tabs);
  const shoppers = summarizeShoppers(allVisits);
  const snapshot = {
    generatedAt: NOW,
    buildLabel: process.env.CXORBIA_DEV_BUILD_LABEL || 'tya-live-hr-source-safe-dev',
    tenantId: 'tya',
    tenantName: 'TyA',
    projectId: 'cinepolis',
    projectName: 'Cinépolis',
    source: {
      type: 'google_sheets_live_multitab',
      accessMode: live.accessMode,
      fallbackReason: live.fallbackReason || null,
      title: live.title || 'HR Guatemala - Sincronizacion Google Sheets',
      spreadsheetIdMasked: `${SHEET_ID.slice(0, 6)}...${SHEET_ID.slice(-4)}`,
      serviceAccountProject: safeServiceAccountInfo().projectId || 'cxorbia-backend-dev',
      serviceAccountEmailMasked: (live.clientEmail || '').replace(/^[^@]+/, '***'),
      sourceSafe: true,
      piiExcluded: ['telefono', 'mail', 'dpi', 'banco', 'direccion_shopper', 'hr_url_privada', 'workbook_crudo']
    },
    tenantConfig: {
      tenantId: 'tya',
      tenantName: 'TyA',
      configurable: true
    },
    projectConfig: {
      projectId: 'cinepolis',
      projectName: 'Cinépolis',
      configurable: true,
      hrSourceId: 'hr-live-multitab',
      questionnaireMode: 'configurable_by_project_or_visit',
      countries: ['GT', 'HN'],
      currency: { GT: 'Q', HN: 'L' }
    },
    periods,
    visits: allVisits,
    shoppers,
    counts: {
      periods: periods.length,
      tabs: live.tabs.length,
      visits: allVisits.length,
      shoppers: shoppers.length,
      byStatus: countsByStatus(allVisits),
      byCountry: allVisits.reduce((m,v)=>(m[v.country]=(m[v.country]||0)+1,m),{})
    },
    tabsRead,
    issues: allIssues.slice(0, 100),
    production: false,
    imported: false,
    firestoreWrites: 0,
    sourceSafe: true
  };

  if(!snapshot.counts.periods || !snapshot.counts.visits){
    throw new Error(`HR live source-safe build produced empty result: ${JSON.stringify(snapshot.counts)}`);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  const js = [
    '/* CXOrbia TyA live HR source-safe DEV payload. Generated in GitHub Actions; no PII/raw workbook. */',
    'window.CX_TYA_HR_SOURCE_SAFE = ',
    JSON.stringify(snapshot, null, 2),
    ';'
  ].join('');
  fs.writeFileSync(OUT_FILE, js, 'utf8');
  fs.mkdirSync('.tmp/rc-phase-a-dev-root-deploy', { recursive: true });
  fs.writeFileSync('.tmp/rc-phase-a-dev-root-deploy/hr-live-source-safe-summary.json', JSON.stringify(snapshot.counts, null, 2), 'utf8');
  fs.writeFileSync('.tmp/rc-phase-a-dev-root-deploy/hr-live-source-safe-summary.md', [
    '# TyA HR live source-safe build',
    '',
    `Generated: ${snapshot.generatedAt}`,
    `Access mode: ${snapshot.source.accessMode}`,
    `Periods: ${snapshot.counts.periods}`,
    `Tabs: ${snapshot.counts.tabs}`,
    `Visits: ${snapshot.counts.visits}`,
    `Shoppers protected refs: ${snapshot.counts.shoppers}`,
    `By country: ${JSON.stringify(snapshot.counts.byCountry)}`,
    `By status: ${JSON.stringify(snapshot.counts.byStatus)}`,
    '',
    'No Firestore writes, no imports, no payments, no providers, no PII.'
  ].join('\n'), 'utf8');
  console.log(`HR live source-safe payload generated: ${OUT_FILE}`);
  console.log(JSON.stringify(snapshot.counts, null, 2));
}

main().catch(err => {
  fs.mkdirSync('.tmp/rc-phase-a-dev-root-deploy', { recursive: true });
  fs.writeFileSync('.tmp/rc-phase-a-dev-root-deploy/hr-live-source-safe-error.txt', String(err.stack || err.message || err), 'utf8');
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});
