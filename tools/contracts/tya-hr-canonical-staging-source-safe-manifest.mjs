#!/usr/bin/env node
/* CXOrbia TyA - HR canonical staging source-safe manifest
   Safe runner. No HR calls, no Firestore writes, no imports, no deploy.

   Purpose: turn the already documented HR live evidence into a source-safe
   canonical staging manifest for Phase A planning without exposing PII.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-hr-canonical-staging-source-safe';
const inputIdx = args.indexOf('--input');
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;

const contractPath = 'backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json';
function readJson(relOrAbs) {
  const p = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJson(abs, name, obj) {
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, name), JSON.stringify(obj, null, 2), 'utf8');
}
function normalizeTabName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toUpperCase();
}
function parsePeriod(tabName) {
  const n = normalizeTabName(tabName);
  const country = n.endsWith(' HN') ? 'HN' : 'GT';
  const base = country === 'HN' ? n.replace(/ HN$/, '') : n;
  const [monthName, yy] = base.split(' ');
  const year = yy ? `20${yy}` : 'unknown';
  const monthMap = {
    ENERO: '01', FEBRERO: '02', MARZO: '03', ABRIL: '04', MAYO: '05', JUNIO: '06',
    JULIO: '07', AGOSTO: '08', SEPTIEMBRE: '09', OCTUBRE: '10', NOVIEMBRE: '11', DICIEMBRE: '12'
  };
  const mm = monthMap[monthName] || '00';
  return { country, periodKey: `${year}-${mm}-${country}`, monthName: monthName || 'unknown', year };
}
function safeObservedMap(input) {
  if (!input) return new Map();
  const source = Array.isArray(input.tabs) ? input.tabs : Array.isArray(input.rows) ? input.rows : Array.isArray(input) ? input : [];
  const map = new Map();
  for (const item of source) {
    const name = normalizeTabName(item.tab || item.name || item.sheet || item.period || item.sourcePeriod);
    if (!name) continue;
    map.set(name, {
      observedRows: Number(item.rows ?? item.rowCount ?? item.filas ?? item.count ?? 0),
      observedColumns: Number(item.columns ?? item.columnCount ?? item.columnas ?? 0),
      sourceStatus: item.status || item.sourceStatus || item.mode || null
    });
  }
  return map;
}
function expectedRowsFor(tabName) {
  const n = normalizeTabName(tabName);
  if (n.endsWith(' HN')) {
    if (n === 'JUNIO 26 HN') return 10;
    return 10;
  }
  return 34;
}

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }

let contract;
try {
  contract = readJson(contractPath);
} catch (err) {
  add(hardFails, 'contract_missing_or_invalid', { file: contractPath, error: String(err.message || err) });
}

let input = null;
if (inputPath) {
  try {
    input = readJson(inputPath);
    add(info, 'optional_input_loaded', { inputPath });
  } catch (err) {
    add(hardFails, 'optional_input_invalid', { inputPath, error: String(err.message || err) });
  }
}

if (contract?.safeState) {
  for (const [key, expected] of Object.entries({
    frontendConnected: false,
    firestoreWrites: false,
    importsExecuted: false,
    hrWrites: false,
    productionEnabled: false,
    containsSecrets: false,
    containsRawPii: false,
    containsRawHrRows: false,
    containsRawWorkbook: false
  })) {
    if (contract.safeState[key] !== expected) add(hardFails, 'contract_safe_state_invalid', { key, expected, actual: contract.safeState[key] });
  }
}

const expectedOperational = contract?.tabClassification?.operationalTabsExpected || [];
const expectedDashboards = contract?.tabClassification?.dashboardTabsExpected || [];
if (expectedOperational.length !== 28) add(hardFails, 'expected_operational_tab_count_invalid', { count: expectedOperational.length });
if (expectedDashboards.length !== 2) add(hardFails, 'expected_dashboard_tab_count_invalid', { count: expectedDashboards.length });

const observed = safeObservedMap(input);
const manifestTabs = [];
for (const tabName of [...expectedOperational, ...expectedDashboards]) {
  const n = normalizeTabName(tabName);
  const obs = observed.get(n) || null;
  const tabType = expectedDashboards.map(normalizeTabName).includes(n) ? 'dashboard_excluded' : 'operational';
  const period = tabType === 'operational' ? parsePeriod(n) : { country: null, periodKey: null, monthName: null, year: null };
  const expectedRows = tabType === 'operational' ? expectedRowsFor(n) : null;
  const issues = [];
  let importStatus = tabType === 'dashboard_excluded' ? 'excluded_dashboard' : 'source_safe_preview_only';
  let rowCountStatus = 'not_observed_in_this_run';
  if (obs) {
    rowCountStatus = expectedRows == null ? 'not_applicable' : obs.observedRows === expectedRows ? 'matches_expected' : 'review_required';
  }
  if (n === 'JUNIO 26 HN') {
    importStatus = 'review_required';
    issues.push('documented_extra_or_different_row_count');
  }
  if (n === 'JULIO 26' || n === 'JULIO 26 HN') {
    importStatus = 'preparation_not_closed_historical';
    issues.push('preparation_period_not_historical_closed');
  }
  if (tabType === 'dashboard_excluded') {
    issues.push('dashboard_not_operational_visit_source');
  }
  manifestTabs.push({
    tenantId: contract?.tenant?.tenantId || 'tya',
    projectId: contract?.project?.projectId || 'cinepolis',
    programId: contract?.project?.programId || 'cinepolis',
    sourceTitle: contract?.source?.title || 'HR Guatemala - Sincronizacion Google Sheets',
    tabName: n,
    tabType,
    periodKey: period.periodKey,
    country: period.country,
    expectedOperationalRows: expectedRows,
    observedRows: obs?.observedRows ?? null,
    observedColumns: obs?.observedColumns ?? null,
    schemaStatus: obs ? 'observed_source_safe' : 'pending_current_observation',
    rowCountStatus,
    importStatus,
    issues,
    auditRef: `hr-source-safe::${n.replace(/[^A-Z0-9_-]/g, '_')}`
  });
}

const forbiddenText = JSON.stringify(manifestTabs).toLowerCase();
for (const forbidden of contract?.forbiddenInManifest || []) {
  if (forbiddenText.includes(String(forbidden).toLowerCase())) {
    add(hardFails, 'forbidden_field_name_leaked_in_manifest', { forbidden });
  }
}

const report = {
  gate: 'cxorbia-tya-hr-canonical-staging-source-safe-manifest',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_HR_SOURCE_SAFE_MANIFEST' : 'GO_SOURCE_SAFE_MANIFEST_READY_NO_IMPORT',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_SOURCE_SAFE_STAGING_AND_VISUAL_SMOKE',
  source: {
    type: contract?.source?.type || 'google_sheets',
    title: contract?.source?.title || 'HR Guatemala - Sincronizacion Google Sheets',
    urlPolicy: 'private_config_only_not_repo',
    readerMode: 'xlsx_multitab_preview'
  },
  counts: {
    operationalTabsExpected: expectedOperational.length,
    dashboardTabsExpected: expectedDashboards.length,
    manifestTabs: manifestTabs.length,
    observedTabsFromOptionalInput: observed.size,
    importableNow: 0,
    reviewRequired: manifestTabs.filter(t => t.importStatus === 'review_required' || t.rowCountStatus === 'review_required').length,
    excludedDashboards: manifestTabs.filter(t => t.tabType === 'dashboard_excluded').length
  },
  blockingIssuesBeforeImport: contract?.blockingIssuesBeforeImport || [],
  safeState: {
    deploy: false,
    production: false,
    providerCalls: false,
    databaseWrites: false,
    imports: false,
    oldDatabaseConnected: false,
    rawPii: false,
    rawHrRows: false
  },
  hardFails,
  warnings,
  info,
  manifestTabs
};

const absOut = path.join(root, outDir);
writeJson(absOut, 'hr-canonical-staging-source-safe-manifest.json', report);
const md = [
  '# CXOrbia TyA HR canonical staging source-safe manifest',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Production decision: ${report.productionDecision}`,
  '',
  '## Counts',
  `- Operational tabs expected: ${report.counts.operationalTabsExpected}`,
  `- Dashboard tabs expected: ${report.counts.dashboardTabsExpected}`,
  `- Manifest tabs: ${report.counts.manifestTabs}`,
  `- Observed tabs from optional input: ${report.counts.observedTabsFromOptionalInput}`,
  `- Importable now: ${report.counts.importableNow}`,
  `- Review required: ${report.counts.reviewRequired}`,
  `- Excluded dashboards: ${report.counts.excludedDashboards}`,
  '',
  '## Blocking issues before import',
  ...report.blockingIssuesBeforeImport.map(x => `- ${x}`),
  '',
  '## Safe state',
  '- No deploy',
  '- No production',
  '- No provider calls',
  '- No database writes',
  '- No imports',
  '- No old database connected',
  '- No raw PII',
  '- No raw HR rows',
  '',
  '## Tabs',
  ...manifestTabs.map(t => `- ${t.tabName}: ${t.tabType} · ${t.periodKey || 'n/a'} · ${t.country || 'n/a'} · ${t.importStatus} · ${t.rowCountStatus}`),
  ''
].join('\n');
fs.writeFileSync(path.join(absOut, 'hr-canonical-staging-source-safe-manifest.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
