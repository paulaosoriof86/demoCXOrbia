#!/usr/bin/env node
/* CXOrbia TyA - Minimal sanitized input generator from HR source-safe manifest
   Safe generator. No HR calls, no Firestore writes, no imports, no deploy.

   Purpose: produce a Level 0/manifest-only payload that can validate the real-data
   bridge path using documented TyA/Cinepolis HR structure without exposing PII.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const manifestIdx = args.indexOf('--manifest');
const manifestPath = manifestIdx >= 0 ? args[manifestIdx + 1] : null;
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/tya-minimal-sanitized-input';

const stagingContractPath = 'backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json';
const minimalContractPath = 'backend/contracts/tya-minimal-sanitized-input-phase-a-v1.json';

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
  return { country, periodKey: `${year}-${mm}-${country}`, periodId: `cinepolis-${year}-${mm}-${country.toLowerCase()}` };
}
function expectedRowsFor(tabName) {
  return normalizeTabName(tabName).endsWith(' HN') ? 10 : 34;
}
function sourceSafeId(prefix, ...parts) {
  return [prefix, ...parts].map(x => String(x || 'unknown').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).join('-');
}

const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }

let stagingContract = null;
let minimalContract = null;
try {
  stagingContract = readJson(stagingContractPath);
  add(info, 'staging_contract_loaded', { file: stagingContractPath });
} catch (err) {
  add(hardFails, 'staging_contract_missing_or_invalid', { file: stagingContractPath, error: String(err.message || err) });
}
try {
  minimalContract = readJson(minimalContractPath);
  add(info, 'minimal_contract_loaded', { file: minimalContractPath });
} catch (err) {
  add(hardFails, 'minimal_contract_missing_or_invalid', { file: minimalContractPath, error: String(err.message || err) });
}

let manifest = null;
if (manifestPath) {
  try {
    manifest = readJson(manifestPath);
    add(info, 'manifest_loaded', { manifestPath });
  } catch (err) {
    add(hardFails, 'manifest_invalid', { manifestPath, error: String(err.message || err) });
  }
}

const expectedOperational = stagingContract?.tabClassification?.operationalTabsExpected || [];
const manifestTabs = Array.isArray(manifest?.manifestTabs)
  ? manifest.manifestTabs
  : expectedOperational.map((tabName) => {
      const parsed = parsePeriod(tabName);
      return {
        tabName: normalizeTabName(tabName),
        tabType: 'operational',
        periodKey: parsed.periodKey,
        country: parsed.country,
        expectedOperationalRows: expectedRowsFor(tabName),
        observedRows: null,
        observedColumns: null,
        schemaStatus: 'pending_current_observation',
        rowCountStatus: 'not_observed_in_this_run',
        importStatus: normalizeTabName(tabName) === 'JUNIO 26 HN'
          ? 'review_required'
          : ['JULIO 26', 'JULIO 26 HN'].includes(normalizeTabName(tabName))
            ? 'preparation_not_closed_historical'
            : 'manifest_only_not_imported',
        issues: normalizeTabName(tabName) === 'JUNIO 26 HN'
          ? ['documented_extra_or_different_row_count']
          : ['manifest_only_no_row_level_preview']
      };
    });

const periods = manifestTabs
  .filter((tab) => tab.tabType === 'operational')
  .map((tab) => {
    const parsed = parsePeriod(tab.tabName);
    const reviewRequired = tab.importStatus === 'review_required' || tab.rowCountStatus === 'review_required';
    return {
      periodId: parsed.periodId,
      sourceTab: tab.tabName,
      country: tab.country || parsed.country,
      periodKey: tab.periodKey || parsed.periodKey,
      quincenas: ['Q1', 'Q2'],
      status: tab.importStatus || 'manifest_only_not_imported',
      expectedVisitCount: Number(tab.expectedOperationalRows || expectedRowsFor(tab.tabName)),
      reviewRequired
    };
  });

const payload = {
  projectConfig: {
    tenantId: 'tya',
    projectId: 'cinepolis',
    projectName: 'Cinepolis',
    clientName: 'TyA',
    countries: [...new Set(periods.map(p => p.country).filter(Boolean))],
    currencies: { GT: 'GTQ', HN: 'HNL' },
    periods: periods.map(p => p.periodId),
    hrSourceRef: {
      type: 'google_sheets_private_config',
      title: stagingContract?.source?.title || 'HR Guatemala - Sincronizacion Google Sheets',
      urlPolicy: 'private_config_only_not_repo',
      readerMode: 'xlsx_multitab_preview',
      sourceSafeManifest: true
    },
    questionnaireRouting: {
      mode: 'configurable_by_project_or_visit',
      allowed: ['cxorbia', 'tya_online', 'external_platform', 'general_link', 'hr_visit_link'],
      status: 'not_connected_preview'
    },
    paymentRulesRef: {
      mode: 'configured_by_project_country_period',
      junePendingIsPaymentControl: true,
      paidRequiresAuditEvidence: true,
      status: 'preview_not_paid'
    },
    certificationRulesRef: {
      preserveAlreadyPresented: true,
      humanReviewRequiredForGemini: true,
      status: 'preservation_preview_pending_mapping'
    }
  },
  periods,
  visits: [],
  shoppers: [],
  certificationPreservation: [],
  liquidationCandidates: [],
  issues: [
    {
      issueId: sourceSafeId('issue', 'sensitive-shopper-data-policy'),
      severity: 'critical',
      scope: 'shoppers',
      code: 'sensitive_shopper_data_policy',
      messageSafe: 'DPI or sensitive shopper fields must be dropped, encrypted or staged under restricted policy before import.',
      blocksRuntime: false,
      blocksImport: true,
      blocksProduction: true
    },
    {
      issueId: sourceSafeId('issue', 'questionnaire-marks-duplicate-postulations'),
      severity: 'critical',
      scope: 'questionnaires',
      code: 'questionnaire_marks_duplicate_postulations',
      messageSafe: 'questionnaire_marks duplicates postulations and must not be used as independent source.',
      blocksRuntime: false,
      blocksImport: true,
      blocksProduction: true
    },
    {
      issueId: sourceSafeId('issue', 'shopper-canonical-mismatch'),
      severity: 'critical',
      scope: 'shoppers',
      code: 'shopper_canonical_mismatch',
      messageSafe: 'Shopper references remain review_required and must not be silently promoted by visual/name match.',
      blocksRuntime: false,
      blocksImport: true,
      blocksProduction: true
    },
    {
      issueId: sourceSafeId('issue', 'junio-26-hn-review-required'),
      severity: 'warning_or_critical',
      scope: 'periods',
      code: 'junio_26_hn_review_required',
      messageSafe: 'JUNIO 26 HN has documented row difference and must remain review_required, no auto-import.',
      blocksRuntime: false,
      blocksImport: true,
      blocksProduction: true
    },
    {
      issueId: sourceSafeId('issue', 'liquidations-finance-crosscheck'),
      severity: 'warning',
      scope: 'liquidations',
      code: 'liquidations_require_finance_crosscheck',
      messageSafe: 'Liquidations require external finance crosscheck before final paid state.',
      blocksRuntime: false,
      blocksImport: true,
      blocksProduction: true
    }
  ],
  meta: {
    generatedAt: new Date().toISOString(),
    previewLevel: 'level0_manifestOnly',
    sourceSafe: true,
    noRawPii: true,
    importsExecuted: false,
    firestoreWrites: false,
    hrWrites: false,
    runtimeConnected: false,
    note: 'This payload is safe for validation and readiness only. It does not contain row-level visits yet.'
  }
};

const payloadText = JSON.stringify(payload).toLowerCase();
for (const forbidden of minimalContract?.forbiddenFieldsAnywhere || []) {
  if (payloadText.includes(String(forbidden).toLowerCase())) {
    add(hardFails, 'generated_payload_contains_forbidden_marker', { forbidden });
  }
}

const report = {
  gate: 'cxorbia-tya-minimal-sanitized-input-from-manifest',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_GENERATED_MINIMAL_INPUT' : 'GO_LEVEL0_MINIMAL_INPUT_GENERATED_NO_RUNTIME',
  previewLevel: 'level0_manifestOnly',
  productionDecision: 'BLOCK_PRODUCTION_UNTIL_LEVEL1_OR_LEVEL2_SANITIZED_INPUT_AND_RUNTIME_SMOKE',
  counts: {
    periods: periods.length,
    visits: 0,
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

const absOut = path.join(root, outDir);
writeJson(absOut, 'tya-minimal-sanitized-input-level0.json', payload);
writeJson(absOut, 'tya-minimal-sanitized-input-level0-report.json', report);
const md = [
  '# CXOrbia TyA minimal sanitized input Level 0',
  '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Preview level: ${report.previewLevel}`,
  `Production decision: ${report.productionDecision}`,
  '',
  '## Counts',
  `- Periods: ${report.counts.periods}`,
  `- Visits: ${report.counts.visits}`,
  `- Shoppers: ${report.counts.shoppers}`,
  `- Certification preservation rows: ${report.counts.certificationPreservation}`,
  `- Liquidation candidates: ${report.counts.liquidationCandidates}`,
  `- Issues: ${report.counts.issues}`,
  '',
  '## Meaning',
  '- This is Level 0 manifest-only.',
  '- It can validate project and period readiness.',
  '- It cannot claim real visits/shoppers are visible yet.',
  '- It must not be used for production.',
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
fs.writeFileSync(path.join(absOut, 'tya-minimal-sanitized-input-level0.md'), md, 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
