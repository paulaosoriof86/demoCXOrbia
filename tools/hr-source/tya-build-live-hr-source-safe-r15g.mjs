#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R15G + R20 live HR source-safe builder.

  Ejecuta el lector multi-tab con resolución de encabezados fail-closed,
  normaliza fechas y aplica una única máquina canónica a TODOS los periodos
  detectados. El mapeo de columnas proviene de un contrato único versionado.

  No PII, providers, writes, imports, deploy, production or payments.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import {
  applyCanonicalVisitState,
  summarizeCanonicalPeriods,
  validateCanonicalHistory
} from './tya-canonical-visit-state-r20.mjs';

const OUT_FILE = process.env.CXORBIA_HR_SOURCE_SAFE_OUT || 'app/data/tya-hr-source-safe-periods.js';
const baseBuilder = path.resolve('tools/hr-source/tya-build-live-hr-source-safe-static.mjs');
const generatedBuilder = path.resolve('tools/hr-source/.tya-build-live-hr-source-safe-static-r20.generated.mjs');
const columnMapPath = path.resolve('backend/contracts/tya-hr-column-map-r20-v1.json');
if (!fs.existsSync(columnMapPath)) throw new Error(`R20 column map missing: ${columnMapPath}`);
const columnMap = JSON.parse(fs.readFileSync(columnMapPath, 'utf8'));
if (columnMap.contractId !== 'tya-hr-column-map-r20-v1' || columnMap.resolutionPolicy !== 'exact_or_unique_anchored_only') {
  throw new Error('R20 column map contract identity/policy mismatch.');
}
const columnEntries = Object.entries(columnMap.columns || {});
if (!columnEntries.length) throw new Error('R20 column map contract has no columns.');
for (const [name, spec] of columnEntries) {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name) || !Array.isArray(spec?.aliases) || !spec.aliases.length) {
    throw new Error(`Invalid R20 column specification: ${name}`);
  }
}

// El builder histórico usaba `includes()` y podía seleccionar el primer encabezado
// parcialmente parecido. R20 reemplaza esa función solo durante el build: exacto
// primero y coincidencia anclada únicamente cuando es única.
const baseSource = fs.readFileSync(baseBuilder, 'utf8');
const strictColumnResolver = String.raw`function col(header, aliases){
  const key = value => norm(value).replace(/[^a-z0-9ñ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cells = (header.row || []).map(key);
  const needles = aliases.map(key).filter(Boolean);
  for(const needle of needles){
    const exact = cells.reduce((hits,value,index)=>{ if(value===needle) hits.push(index); return hits; },[]);
    if(exact.length===1) return exact[0];
    if(exact.length>1) return -1;
  }
  for(const needle of needles){
    const anchored = cells.reduce((hits,value,index)=>{
      if(value===needle || value.startsWith(needle+' ') || value.endsWith(' '+needle)) hits.push(index);
      return hits;
    },[]);
    if(anchored.length===1) return anchored[0];
    if(anchored.length>1) return -1;
  }
  return -1;
}`;
const contractMappingBlock = [
  '  const c = {',
  ...columnEntries.map(([name, spec]) => `    ${name}: col(header, ${JSON.stringify(spec.aliases)}),`),
  '  };',
  '  const issues = [];'
].join('\n');
let patchedSource = baseSource.replace(/function col\(header, aliases\)\{[\s\S]*?\n\}/, strictColumnResolver);
patchedSource = patchedSource.replace(/  const c = \{[\s\S]*?\n  \};\n  const issues = \[\];/, contractMappingBlock);
if (patchedSource === baseSource || !patchedSource.includes('const anchored = cells.reduce') || !patchedSource.includes(JSON.stringify(columnMap.columns.fechaSubmitido.aliases))) {
  throw new Error('R20 could not install strict resolver and contract column map.');
}
fs.writeFileSync(generatedBuilder, patchedSource, 'utf8');
let run;
try {
  run = spawnSync(process.execPath, [generatedBuilder], {
    env: process.env,
    stdio: 'inherit',
    encoding: 'utf8'
  });
} finally {
  try { fs.unlinkSync(generatedBuilder); } catch {}
}
if (run.status !== 0) process.exit(run.status || 1);
if (!fs.existsSync(OUT_FILE)) throw new Error(`R15G source payload missing: ${OUT_FILE}`);

const raw = fs.readFileSync(OUT_FILE, 'utf8');
const prefix = 'window.CX_TYA_HR_SOURCE_SAFE = ';
const start = raw.indexOf(prefix);
const end = raw.lastIndexOf(';');
if (start < 0 || end < start) throw new Error('R15G cannot parse source-safe JS envelope.');
const snapshot = JSON.parse(raw.slice(start + prefix.length, end));

const mappingIssues = Array.isArray(snapshot.issues) ? snapshot.issues : [];
const criticalColumns = new Set(columnEntries.filter(([,spec]) => spec.critical === true).map(([name]) => name));
const mappingBlockers = mappingIssues.filter(issue =>
  issue?.code === 'header_not_found' ||
  (issue?.code === 'column_missing' && criticalColumns.has(issue.column))
);
if (mappingBlockers.length) {
  throw new Error(`R20 HR mapping HOLD; missing/ambiguous critical headers: ${JSON.stringify(mappingBlockers).slice(0, 4000)}`);
}

function pad(value){ return String(value).padStart(2, '0'); }
function isoDateFromExcelSerial(serial){
  const n = Number(serial);
  if (!Number.isFinite(n) || n < 1 || n > 100000) return null;
  const wholeDays = Math.floor(n);
  const millis = Date.UTC(1899, 11, 30) + wholeDays * 86400000;
  const d = new Date(millis);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
}
function normalizeDate(value){
  if (value == null || value === '') return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{3,6}(?:\.\d+)?$/.test(text)) return isoDateFromExcelSerial(text) || text;
  const iso = text.match(/^(20\d{2})[-/]([01]?\d)[-/]([0-3]?\d)(?:\s.*)?$/);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;
  const latin = text.match(/^([0-3]?\d)[/.-]([01]?\d)[/.-](20\d{2})(?:\s.*)?$/);
  if (latin) return `${latin[3]}-${pad(latin[2])}-${pad(latin[1])}`;
  return text;
}

const dateFields = ['disponibleDesde','agendada','realizada','cuestFecha','submittedAt'];
let normalizedDateCount = 0;
for (const visit of snapshot.visits || []) {
  for (const field of dateFields) {
    const before = visit[field];
    const after = normalizeDate(before);
    if (String(before ?? '') !== String(after ?? '')) normalizedDateCount += 1;
    visit[field] = after;
  }
}

snapshot.visits = (snapshot.visits || []).map(applyCanonicalVisitState);
const canonicalHistory = validateCanonicalHistory(snapshot.visits, snapshot.periods || []);
if (canonicalHistory.decision !== 'PASS_CANONICAL_HISTORY') {
  throw new Error(`R20 canonical history HOLD: ${JSON.stringify(canonicalHistory.issues).slice(0, 2500)}`);
}

const shoppersById = new Map();
for (const visit of snapshot.visits) {
  if (!visit.shopperId) continue;
  const current = shoppersById.get(visit.shopperId) || {
    id: visit.shopperId,
    shopperId: visit.shopperId,
    code: visit.shopperCode,
    nombre: 'Shopper protegido',
    pais: visit.country || visit.pais || null,
    ciudad: visit.ciudad || '',
    estado: null,
    status: null,
    rating: null,
    perfilCompleto: false,
    dataLevel: 'protected_reference',
    operationalProfileAvailable: false,
    visitas: 0,
    realizadas: 0,
    submitidas: 0,
    liquidadas: 0,
    pagadas: 0,
    sourceSafe: true,
    piiProtected: true
  };
  const facets = visit.canonicalFacets || {};
  current.visitas += 1;
  current.realizadas += facets.realized ? 1 : 0;
  current.submitidas += facets.submitted ? 1 : 0;
  current.liquidadas += facets.liquidationConfirmed ? 1 : 0;
  current.pagadas += facets.paymentConfirmed ? 1 : 0;
  shoppersById.set(visit.shopperId, current);
}
snapshot.shoppers = [...shoppersById.values()].sort((a,b)=>String(a.code||'').localeCompare(String(b.code||'')));

const byStatus = {};
for (const visit of snapshot.visits) byStatus[visit.estado] = (byStatus[visit.estado] || 0) + 1;
const canonicalPeriods = summarizeCanonicalPeriods(snapshot.visits);
snapshot.counts = {
  ...(snapshot.counts || {}),
  shoppers: snapshot.shoppers.length,
  byStatus,
  assigned: snapshot.visits.filter(v => v.canonicalFacets?.assigned).length,
  unassigned: snapshot.visits.filter(v => !v.canonicalFacets?.assigned).length,
  scheduled: snapshot.visits.filter(v => v.canonicalFacets?.scheduled).length,
  realized: snapshot.visits.filter(v => v.canonicalFacets?.realized).length,
  questionnaireCompleted: snapshot.visits.filter(v => v.canonicalFacets?.questionnaire).length,
  submitted: snapshot.visits.filter(v => v.canonicalFacets?.submitted).length,
  liquidationCandidatesPendingFinancialMatch: snapshot.visits.filter(v => v.liquidationState === 'candidate_pending_financial_match').length,
  liquidationConfirmed: snapshot.visits.filter(v => v.liquidationState === 'confirmed').length,
  paymentConfirmed: snapshot.visits.filter(v => v.paymentState === 'confirmed').length,
  reviewRequired: snapshot.visits.filter(v => v.reviewRequired === true).length
};
snapshot.periodOperationalSummary = canonicalPeriods;
snapshot.source = {
  ...(snapshot.source || {}),
  semanticNormalizer: 'r15g+r20',
  columnMapContract: columnMap.contractId,
  columnResolver: columnMap.resolutionPolicy,
  mappingFailClosed: true,
  dateFormat: 'YYYY-MM-DD',
  submissionLiquidationSeparated: true,
  canonicalStateAcrossAllDetectedPeriods: true,
  buildTimeSnapshot: true,
  runtimeLiveSync: false
};
snapshot.normalization = {
  version: 'R20',
  normalizedDateCount,
  mappingIssues: mappingIssues.length,
  mappingBlockers: mappingBlockers.length,
  periodCount: canonicalHistory.periodCount,
  periodKeys: canonicalHistory.periodKeys,
  historyScope: 'all_detected_hr_periods',
  rules: [
    'contract_driven_column_map',
    'strict_unique_header_resolution',
    'critical_missing_or_ambiguous_headers_hold_build',
    'unassigned_iff_no_shopper_reference',
    'assigned_without_valid_schedule_is_pending_schedule',
    'realized_without_questionnaire_is_pending_questionnaire',
    'questionnaire_without_submit_is_pending_tya_submit',
    'submitted_is_liquidation_candidate_not_liquidated_or_paid',
    'liquidation_and_payment_require_external_financial_evidence',
    'control_conflicts_are_review_required_not_silent_overwrites'
  ]
};

const output = [
  '/* CXOrbia TyA live HR source-safe DEV payload. R20 canonical historical semantics; no PII/raw workbook. */',
  prefix,
  JSON.stringify(snapshot, null, 2),
  ';'
].join('');
fs.writeFileSync(OUT_FILE, output, 'utf8');
console.log(JSON.stringify({
  decision: 'PASS_R20_CANONICAL_HR_HISTORY',
  outFile: OUT_FILE,
  columnMapContract: columnMap.contractId,
  counts: snapshot.counts,
  normalization: snapshot.normalization,
  safeState: { writes:false, imports:false, deploy:false, production:false, providers:false, payments:false }
}, null, 2));
