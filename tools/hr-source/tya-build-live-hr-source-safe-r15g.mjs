#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R15G live HR source-safe builder.

  Executes the existing live HR builder and then normalizes the source-safe
  payload so operational submission, liquidation and payment are not conflated.
  It also converts spreadsheet serial dates to ISO dates.

  No PII, providers, writes, imports, deploy, production or payments.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const OUT_FILE = process.env.CXORBIA_HR_SOURCE_SAFE_OUT || 'app/data/tya-hr-source-safe-periods.js';
const baseBuilder = path.resolve('tools/hr-source/tya-build-live-hr-source-safe-static.mjs');
const run = spawnSync(process.execPath, [baseBuilder], {
  env: process.env,
  stdio: 'inherit',
  encoding: 'utf8'
});
if (run.status !== 0) process.exit(run.status || 1);
if (!fs.existsSync(OUT_FILE)) throw new Error(`R15G source payload missing: ${OUT_FILE}`);

const raw = fs.readFileSync(OUT_FILE, 'utf8');
const prefix = 'window.CX_TYA_HR_SOURCE_SAFE = ';
const start = raw.indexOf(prefix);
const end = raw.lastIndexOf(';');
if (start < 0 || end < start) throw new Error('R15G cannot parse source-safe JS envelope.');
const snapshot = JSON.parse(raw.slice(start + prefix.length, end));

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
let submittedSeparatedCount = 0;
for (const visit of snapshot.visits || []) {
  for (const field of dateFields) {
    const before = visit[field];
    const after = normalizeDate(before);
    if (String(before ?? '') !== String(after ?? '')) normalizedDateCount += 1;
    visit[field] = after;
  }
  const submitted = Boolean(visit.submittedAt || visit.submit);
  const hasFinancialConfirmation = Boolean(
    visit.paymentSourceRef ||
    visit.paymentConfirmedAt ||
    visit.liquidationEvidence ||
    visit.paymentState === 'confirmed' ||
    visit.liquidationState === 'confirmed'
  );
  if (submitted) {
    visit.submit = true;
    visit.workflowState = 'submitted_by_tya';
    visit.submissionState = 'confirmed_hr';
    if (!hasFinancialConfirmation) {
      if (visit.estado === 'liquidada') visit.estado = 'cuestionario';
      visit.liquidationState = 'candidate_pending_financial_match';
      visit.paymentState = 'not_confirmed';
      submittedSeparatedCount += 1;
    }
  }
}

const shoppersById = new Map((snapshot.shoppers || []).map(shopper => [shopper.id, {
  ...shopper,
  visitas: 0,
  realizadas: 0,
  submitidas: 0,
  liquidadas: 0
}]));
for (const visit of snapshot.visits || []) {
  if (!visit.shopperId) continue;
  const shopper = shoppersById.get(visit.shopperId);
  if (!shopper) continue;
  shopper.visitas += 1;
  if (visit.realizada || visit.cuestFecha || visit.submittedAt || visit.submit) shopper.realizadas += 1;
  if (visit.submittedAt || visit.submit) shopper.submitidas += 1;
  if (visit.paymentState === 'confirmed' || visit.liquidationState === 'confirmed') shopper.liquidadas += 1;
}
snapshot.shoppers = [...shoppersById.values()].sort((a,b)=>String(a.code||'').localeCompare(String(b.code||'')));

const byStatus = {};
for (const visit of snapshot.visits || []) byStatus[visit.estado] = (byStatus[visit.estado] || 0) + 1;
snapshot.counts = {
  ...(snapshot.counts || {}),
  shoppers: snapshot.shoppers.length,
  byStatus,
  submitted: (snapshot.visits || []).filter(v => v.submittedAt || v.submit).length,
  liquidationCandidatesPendingFinancialMatch: (snapshot.visits || []).filter(v => v.liquidationState === 'candidate_pending_financial_match').length,
  paymentConfirmed: (snapshot.visits || []).filter(v => v.paymentState === 'confirmed').length
};
snapshot.source = {
  ...(snapshot.source || {}),
  semanticNormalizer: 'r15g',
  dateFormat: 'YYYY-MM-DD',
  submissionLiquidationSeparated: true,
  buildTimeSnapshot: true,
  runtimeLiveSync: false
};
snapshot.normalization = {
  version: 'R15G',
  normalizedDateCount,
  submittedSeparatedCount,
  rule: 'submitted_by_tya_is_not_liquidated_or_paid_without_financial_evidence'
};

const output = [
  '/* CXOrbia TyA live HR source-safe DEV payload. R15G normalized; no PII/raw workbook. */',
  prefix,
  JSON.stringify(snapshot, null, 2),
  ';'
].join('');
fs.writeFileSync(OUT_FILE, output, 'utf8');
console.log(JSON.stringify({
  decision: 'PASS_R15G_HR_SOURCE_SEMANTICS',
  outFile: OUT_FILE,
  counts: snapshot.counts,
  normalization: snapshot.normalization,
  safeState: { writes:false, imports:false, deploy:false, production:false, providers:false, payments:false }
}, null, 2));
