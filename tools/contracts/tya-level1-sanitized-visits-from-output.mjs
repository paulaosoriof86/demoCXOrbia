#!/usr/bin/env node
/* CXOrbia TyA - Level 1 sanitized visits generator from existing output
   Safe generator. No HR calls, no Firestore writes, no imports, no deploy.

   Purpose: convert an already-existing sanitized/source-safe local output into
   a Level 1 minimal sanitized input payload with row-level visits for DEV preview.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const inputIdx = args.indexOf('--input');
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;
const level0Idx = args.indexOf('--level0');
const level0Path = level0Idx >= 0 ? args[level0Idx + 1] : null;
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-level1-sanitized-visits';

const level1ContractPath = 'backend/contracts/tya-level1-sanitized-visits-phase-a-v1.json';
const minimalContractPath = 'backend/contracts/tya-minimal-sanitized-input-phase-a-v1.json';

function abs(relOrAbs) { return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs); }
function readJson(relOrAbs) { return JSON.parse(fs.readFileSync(abs(relOrAbs), 'utf8')); }
function writeJson(absOut, name, obj) { fs.mkdirSync(absOut, { recursive: true }); fs.writeFileSync(path.join(absOut, name), JSON.stringify(obj, null, 2), 'utf8'); }
function normalize(value) { return String(value ?? '').trim(); }
function normalizeTabName(value) { return normalize(value).replace(/\s+/g, ' ').toUpperCase(); }
function safeSlug(...parts) { return parts.map(p => normalize(p).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown').join('-'); }
function parsePeriod(tabName) {
  const n = normalizeTabName(tabName);
  const country = n.endsWith(' HN') ? 'HN' : 'GT';
  const base = country === 'HN' ? n.replace(/ HN$/, '') : n;
  const [monthName, yy] = base.split(' ');
  const year = yy ? `20${yy}` : 'unknown';
  const monthMap = { ENERO: '01', FEBRERO: '02', MARZO: '03', ABRIL: '04', MAYO: '05', JUNIO: '06', JULIO: '07', AGOSTO: '08', SEPTIEMBRE: '09', OCTUBRE: '10', NOVIEMBRE: '11', DICIEMBRE: '12' };
  const mm = monthMap[monthName] || '00';
  return { country, periodKey: `${year}-${mm}-${country}`, periodId: `cinepolis-${year}-${mm}-${country.toLowerCase()}` };
}

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }

function findRows(source) {
  if (!source || typeof source !== 'object') return [];
  const direct = [source.visits, source.rows, source.sanitizedVisits, source.visitRows, source.hrRows, source.operationalRows].find(Array.isArray);
  if (direct) return direct;
  if (Array.isArray(source.tabs)) {
    const out = [];
    for (const tab of source.tabs) {
      const tabRows = [tab.rows, tab.visits, tab.sanitizedRows, tab.operationalRows].find(Array.isArray) || [];
      for (const row of tabRows) out.push({ ...row, sourceTab: row.sourceTab || tab.tabName || tab.name || tab.sheet });
    }
    return out;
  }
  if (source.report && typeof source.report === 'object') return findRows(source.report);
  return [];
}

function getField(row, names, fallback = null) {
  for (const name of names) {
    if (row && row[name] !== undefined && row[name] !== null && row[name] !== '') return row[name];
  }
  return fallback;
}

function deriveStatus(row, sourceTab) {
  const tab = normalizeTabName(sourceTab);
  if (tab === 'JUNIO 26 HN') return 'review_required';
  if (tab === 'JULIO 26' || tab === 'JULIO 26 HN') return 'preparation_not_closed';
  const rawStatus = normalize(getField(row, ['status', 'visitStatus', 'estado', 'estadoVisita'], '')).toLowerCase();
  const knownMap = {
    pending_assignment: 'pending_assignment',
    pending_schedule: 'pending_schedule',
    scheduled: 'scheduled',
    completed_pending_questionnaire: 'completed_pending_questionnaire',
    questionnaire_pending_submit: 'questionnaire_pending_submit',
    submitted_liquidation_candidate: 'submitted_liquidation_candidate',
    liquidation_payment_control: 'liquidation_payment_control',
    review_required: 'review_required',
    preparation_not_closed: 'preparation_not_closed'
  };
  if (knownMap[rawStatus]) return knownMap[rawStatus];
  const shopper = getField(row, ['shopperRef', 'shopperId', 'shopperCode', 'shopperAssignedRef'], null);
  const scheduledDate = getField(row, ['scheduledDate', 'fechaProgramada', 'programada'], null);
  const completedDate = getField(row, ['completedDate', 'fechaRealizada', 'realizada'], null);
  const questionnaireDate = getField(row, ['questionnaireCompletedDate', 'cuestionarioCompletado', 'questionnaireCompleted'], null);
  const submittedAt = getField(row, ['submittedAt', 'fechaSubmitido', 'submitido'], null);
  const liquidated = getField(row, ['liquidatedRaw', 'liquidated', 'liquidado'], null);
  if (!shopper) return 'pending_assignment';
  if (!scheduledDate) return 'pending_schedule';
  if (!completedDate) return 'scheduled';
  if (!questionnaireDate) return 'completed_pending_questionnaire';
  if (!submittedAt) return 'questionnaire_pending_submit';
  if (!liquidated) return 'submitted_liquidation_candidate';
  return 'liquidation_payment_control';
}

let level1Contract = null;
let minimalContract = null;
let input = null;
let level0 = null;

try { level1Contract = readJson(level1ContractPath); add(info, 'level1_contract_loaded', { file: level1ContractPath }); } catch (err) { add(hardFails, 'level1_contract_missing_or_invalid', { file: level1ContractPath, error: String(err.message || err) }); }
try { minimalContract = readJson(minimalContractPath); add(info, 'minimal_contract_loaded', { file: minimalContractPath }); } catch (err) { add(hardFails, 'minimal_contract_missing_or_invalid', { file: minimalContractPath, error: String(err.message || err) }); }
if (!inputPath) add(hardFails, 'input_required_for_level1_generation');
else {
  try { input = readJson(inputPath); add(info, 'input_loaded', { inputPath }); } catch (err) { add(hardFails, 'input_invalid_json', { inputPath, error: String(err.message || err) }); }
}
if (level0Path) {
  try { level0 = readJson(level0Path); add(info, 'level0_loaded', { level0Path }); } catch (err) { add(warnings, 'level0_invalid_or_unavailable', { level0Path, error: String(err.message || err) }); }
}

if (input) {
  const text = JSON.stringify(input).toLowerCase();
  for (const forbidden of level1Contract?.forbiddenFieldsAnywhere || minimalContract?.forbiddenFieldsAnywhere || []) {
    if (text.includes(String(forbidden).toLowerCase())) add(hardFails, 'input_contains_forbidden_marker', { forbidden });
  }
}

const rows = input ? findRows(input) : [];
if (!rows.length && input) add(hardFails, 'no_visit_like_rows_found_in_input');

const visits = [];
for (let index = 0; index < rows.length; index += 1) {
  const row = rows[index] || {};
  const sourceTab = normalizeTabName(getField(row, ['sourceTab', 'tabName', 'sheet', 'period', 'sourcePeriod'], 'UNKNOWN'));
  if (sourceTab === 'DASHBOARD' || sourceTab === 'DASHBOARD HN') continue;
  const parsed = parsePeriod(sourceTab);
  const hrRowId = normalize(getField(row, ['hrRowId', 'rowId', 'sourceRowId', 'id'], `${sourceTab}-${index + 1}`));
  const visitId = normalize(getField(row, ['visitId'], `visit-${safeSlug(parsed.periodId, hrRowId)}`));
  const status = deriveStatus(row, sourceTab);
  const visit = {
    visitId,
    hrRowId,
    projectId: 'cinepolis',
    periodId: normalize(getField(row, ['periodId'], parsed.periodId)),
    sourceTab,
    country: normalize(getField(row, ['country', 'pais'], parsed.country)),
    cityRef: normalize(getField(row, ['cityRef', 'cityCode', 'ciudadRef'], 'city_ref_pending')),
    branchRef: normalize(getField(row, ['branchRef', 'cinemaRef', 'shoppingRef', 'sucursalRef'], 'branch_ref_pending')),
    quincena: normalize(getField(row, ['quincena'], 'review_required')),
    timeBand: normalize(getField(row, ['timeBand', 'franja', 'franjaHoraria'], 'review_required')),
    availableFrom: getField(row, ['availableFrom', 'disponibleDesde'], null),
    scheduledDate: getField(row, ['scheduledDate', 'fechaProgramada'], null),
    completedDate: getField(row, ['completedDate', 'fechaRealizada'], null),
    questionnaireCompletedDate: getField(row, ['questionnaireCompletedDate', 'cuestionarioCompletado'], null),
    submittedAt: getField(row, ['submittedAt', 'fechaSubmitido'], null),
    status,
    shopperRef: normalize(getField(row, ['shopperRef', 'shopperId', 'shopperCode'], 'shopper_ref_pending')),
    assignmentSource: normalize(getField(row, ['assignmentSource'], 'hr_source_preview')),
    assignmentSyncStatus: normalize(getField(row, ['assignmentSyncStatus'], 'not_synced_preview')),
    reviewRequired: Boolean(row.reviewRequired || status === 'review_required' || sourceTab === 'JUNIO 26 HN')
  };
  for (const required of level1Contract?.requiredVisitFields || []) {
    if (visit[required] === undefined || visit[required] === '') add(hardFails, 'generated_visit_required_field_missing', { index, field: required });
  }
  if (!(level1Contract?.allowedVisitStatuses || []).includes(visit.status)) add(hardFails, 'generated_visit_status_not_allowed', { index, status: visit.status });
  visits.push(visit);
}

const periodsFromLevel0 = Array.isArray(level0?.periods) ? level0.periods : [];
const periodsFromVisits = [...new Map(visits.map(v => [v.periodId, {
  periodId: v.periodId,
  sourceTab: v.sourceTab,
  country: v.country,
  periodKey: parsePeriod(v.sourceTab).periodKey,
  quincenas: ['Q1', 'Q2'],
  status: v.sourceTab === 'JUNIO 26 HN' ? 'review_required' : ['JULIO 26', 'JULIO 26 HN'].includes(v.sourceTab) ? 'preparation_not_closed_historical' : 'sanitized_visits_preview',
  expectedVisitCount: visits.filter(x => x.periodId === v.periodId).length,
  reviewRequired: v.sourceTab === 'JUNIO 26 HN' || visits.some(x => x.periodId === v.periodId && x.reviewRequired)
}])).values()];

const payload = {
  projectConfig: level0?.projectConfig || {
    tenantId: 'tya',
    projectId: 'cinepolis',
    projectName: 'Cinepolis',
    clientName: 'TyA',
    countries: [...new Set(visits.map(v => v.country).filter(Boolean))],
    currencies: { GT: 'GTQ', HN: 'HNL' },
    periods: periodsFromVisits.map(p => p.periodId),
    hrSourceRef: { type: 'google_sheets_private_config', urlPolicy: 'private_config_only_not_repo', readerMode: 'xlsx_multitab_preview' },
    questionnaireRouting: { mode: 'configurable_by_project_or_visit', status: 'not_connected_preview' },
    paymentRulesRef: { mode: 'configured_by_project_country_period', junePendingIsPaymentControl: true, paidRequiresAuditEvidence: true, status: 'preview_not_paid' },
    certificationRulesRef: { preserveAlreadyPresented: true, humanReviewRequiredForGemini: true, status: 'preservation_preview_pending_mapping' }
  },
  periods: periodsFromLevel0.length ? periodsFromLevel0 : periodsFromVisits,
  visits,
  shoppers: [],
  certificationPreservation: [],
  liquidationCandidates: [],
  issues: level0?.issues || [
    { issueId: 'issue-sensitive-shopper-data-policy', severity: 'critical', scope: 'shoppers', code: 'sensitive_shopper_data_policy', messageSafe: 'DPI or sensitive shopper fields must be dropped, encrypted or staged under restricted policy before import.', blocksRuntime: false, blocksImport: true, blocksProduction: true },
    { issueId: 'issue-questionnaire-marks-duplicate-postulations', severity: 'critical', scope: 'questionnaires', code: 'questionnaire_marks_duplicate_postulations', messageSafe: 'questionnaire_marks duplicates postulations and must not be used as independent source.', blocksRuntime: false, blocksImport: true, blocksProduction: true },
    { issueId: 'issue-shopper-canonical-mismatch', severity: 'critical', scope: 'shoppers', code: 'shopper_canonical_mismatch', messageSafe: 'Shopper references remain review_required and must not be silently promoted by visual/name match.', blocksRuntime: false, blocksImport: true, blocksProduction: true },
    { issueId: 'issue-junio-26-hn-review-required', severity: 'warning_or_critical', scope: 'periods', code: 'junio_26_hn_review_required', messageSafe: 'JUNIO 26 HN has documented row difference and must remain review_required, no auto-import.', blocksRuntime: false, blocksImport: true, blocksProduction: true },
    { issueId: 'issue-liquidations-finance-crosscheck', severity: 'warning', scope: 'liquidations', code: 'liquidations_require_finance_crosscheck', messageSafe: 'Liquidations require external finance crosscheck before final paid state.', blocksRuntime: false, blocksImport: true, blocksProduction: true }
  ],
  meta: {
    generatedAt: new Date().toISOString(),
    previewLevel: 'level1_sanitizedVisits',
    sourceSafe: true,
    noRawPii: true,
    importsExecuted: false,
    firestoreWrites: false,
    hrWrites: false,
    runtimeConnected: false,
    note: 'Level 1 contains sanitized visit rows only. Shoppers remain opaque refs until canonical review is resolved.'
  }
};

const payloadText = JSON.stringify(payload).toLowerCase();
for (const forbidden of level1Contract?.forbiddenFieldsAnywhere || []) {
  if (payloadText.includes(String(forbidden).toLowerCase())) add(hardFails, 'generated_payload_contains_forbidden_marker', { forbidden });
}
const requiredIssueCodes = new Set((level1Contract?.requiredIssueCodes || []).map(String));
const payloadIssueCodes = new Set(payload.issues.map(x => x.code));
for (const code of requiredIssueCodes) {
  if (!payloadIssueCodes.has(code)) add(hardFails, 'generated_payload_required_issue_missing', { code });
}

const report = {
  gate: 'cxorbia-tya-level1-sanitized-visits-from-output',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LEVEL1_GENERATION' : 'GO_LEVEL1_SANITIZED_VISITS_GENERATED_NO_RUNTIME',
  previewLevel: 'level1_sanitizedVisits',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_RUNTIME_SWITCH_SMOKE_AND_PAULA_GO',
  counts: {
    inputRows: rows.length,
    generatedVisits: visits.length,
    periods: payload.periods.length,
    reviewRequiredVisits: visits.filter(v => v.reviewRequired).length,
    shoppers: 0,
    certificationPreservation: 0,
    liquidationCandidates: 0,
    issues: payload.issues.length
  },
  safeState: {
    runtimeConnected: false,
    frontendModified: false,
    modulesModified: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    deploy: false,
    production: false,
    rawPii: false
  },
  hardFails,
  warnings,
  info
};

const absOut = abs(outDir);
fs.mkdirSync(absOut, { recursive: true });
writeJson(absOut, 'tya-minimal-sanitized-input-level1.json', payload);
writeJson(absOut, 'tya-level1-sanitized-visits-report.json', report);
const md = [
  '# CXOrbia TyA Level 1 sanitized visits from output',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Preview level: ${report.previewLevel}`,
  `Production decision: ${report.productionDecision}`,
  '',
  '## Counts',
  `- Input rows: ${report.counts.inputRows}`,
  `- Generated visits: ${report.counts.generatedVisits}`,
  `- Periods: ${report.counts.periods}`,
  `- Review required visits: ${report.counts.reviewRequiredVisits}`,
  `- Shoppers: ${report.counts.shoppers}`,
  `- Certification preservation rows: ${report.counts.certificationPreservation}`,
  `- Liquidation candidates: ${report.counts.liquidationCandidates}`,
  `- Issues: ${report.counts.issues}`,
  '',
  '## Hard fails',
  ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.field ? ` · ${x.field}` : ''}${x.forbidden ? ` · ${x.forbidden}` : ''}${x.code ? ` · ${x.code}` : ''}`) : ['- none']),
  '',
  '## Meaning',
  '- Level 1 can support sanitized visit preview.',
  '- Shoppers remain opaque refs, not full real shopper profiles.',
  '- No production, no imports and no writes are authorized.',
  '',
  '## Safe state',
  '- Runtime not connected',
  '- Frontend not modified',
  '- Modules not modified',
  '- No Firestore writes',
  '- No imports',
  '- No HR writes',
  '- No deploy',
  '- No production',
  '- No raw PII',
  ''
].join('\n');
fs.writeFileSync(path.join(absOut, 'tya-level1-sanitized-visits-report.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
