import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const previewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');
const canonicalPlanPath = process.env.CXORBIA_TYA_CANONICAL_PLAN || path.join(repoRoot, 'tmp', 'tya-canonical-staging', 'tyaCanonicalStagingPlan.json');
const outDir = process.env.CXORBIA_TYA_SANITIZED_DEV_OUT || path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate');

fs.mkdirSync(outDir, { recursive: true });

function readJson(file, fallback = null){
  try{ return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch{ return fallback; }
}

function readJsonl(file){
  try{
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  }catch{
    return [];
  }
}

function writeJsonl(file, rows){
  fs.writeFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
}

const sensitiveKey = /(^|_)(dpi|documento|document|passport|pasaporte|nit|bank|banco|cuenta|account|iban|routing|card|tarjeta|secret|token|password|clave)($|_)/i;

function sanitizeValue(value, removed, pathParts = []){
  if(Array.isArray(value)) return value.map((v, idx) => sanitizeValue(v, removed, [...pathParts, String(idx)]));
  if(value && typeof value === 'object'){
    const out = {};
    for(const [k, v] of Object.entries(value)){
      if(sensitiveKey.test(k)){
        removed.push([...pathParts, k].join('.'));
        continue;
      }
      out[k] = sanitizeValue(v, removed, [...pathParts, k]);
    }
    return out;
  }
  return value;
}

function stamp(row, extra){
  return { ...row, ...extra, sanitizedAt: new Date().toISOString(), executeAllowed: false };
}

const canonicalPlan = readJson(canonicalPlanPath, null);
const visits = readJsonl(path.join(previewDir, 'previewVisits.jsonl'));
const submitidos = readJsonl(path.join(previewDir, 'previewSubmitidos.jsonl'));
const shoppers = readJsonl(path.join(previewDir, 'previewShoppers.jsonl'));
const postulations = readJsonl(path.join(previewDir, 'previewPostulations.jsonl'));
const notifications = readJsonl(path.join(previewDir, 'previewNotifications.jsonl'));
const liqs = readJsonl(path.join(previewDir, 'previewLiquidationCandidates.jsonl'));
const issues = readJsonl(path.join(previewDir, 'validationIssues.jsonl'));

const periodReviewSet = new Set((canonicalPlan?.reviewRequired || []).map(p => p.periodId || p.sourceTab).filter(Boolean));
const preparationSet = new Set((canonicalPlan?.preparationPeriods || []).map(p => p.periodId || p.sourceTab).filter(Boolean));

function classifyVisit(row){
  const key = row.periodId || row.sourcePeriod || row.periodRaw || '';
  if(preparationSet.has(key)) return 'preparation_not_closed';
  if(periodReviewSet.has(key) || String(key).includes('JUNIO_26_HN')) return 'review_required';
  return 'candidate_for_dev_staging';
}

const removedSensitiveFields = [];
const sanitizedShoppers = shoppers.map((s, idx) => {
  const removed = [];
  const clean = sanitizeValue(s, removed);
  if(removed.length) removedSensitiveFields.push({ sourceIndex: idx, docId: s.docId || '', removedFields: removed });
  return stamp(clean, {
    importPolicy: 'sanitized_preview_only',
    piiPolicy: 'sensitive_fields_removed_before_dev_candidate',
    removedSensitiveFieldCount: removed.length
  });
});

const sanitizedVisits = visits.map(v => stamp(v, { importPolicy: classifyVisit(v) }));
const sanitizedSubmitidos = submitidos.map(e => stamp(e, { importPolicy: 'event_candidate_for_dev_staging' }));
const sanitizedPostulations = postulations.map(p => stamp(p, { importPolicy: 'event_candidate_for_dev_staging', questionnaireMarksPolicy: 'questionnaire_marks_not_imported_independently' }));
const sanitizedNotifications = notifications.map(n => stamp(n, { importPolicy: 'history_only_until_recipient_canonical', activeNotification: false }));
const sanitizedLiqs = liqs.map(l => stamp(l, { importPolicy: 'liquidation_candidate_only_until_finance_crosscheck', finalDebt: false, finalPayment: false }));

const issueResolution = issues.map(i => {
  let resolution = 'keep_as_blocker_or_warning';
  if(i.code === 'questionnaire_marks_duplicate_postulations') resolution = 'resolved_by_excluding_questionnaire_marks_as_independent_source';
  if(i.code === 'dpi_present_in_shoppers') resolution = 'resolved_in_candidate_by_removing_sensitive_fields_from_shoppers';
  if(i.code === 'liquidations_require_external_excel') resolution = 'kept_as_warning_liquidations_candidate_only';
  if(i.code === 'notification_recipients_unresolved') resolution = 'kept_as_warning_notifications_history_only';
  return { ...i, candidateResolution: resolution, executeAllowed: false };
});

writeJsonl(path.join(outDir, 'candidateVisits.jsonl'), sanitizedVisits);
writeJsonl(path.join(outDir, 'candidateSubmitidos.jsonl'), sanitizedSubmitidos);
writeJsonl(path.join(outDir, 'candidateShoppersSanitized.jsonl'), sanitizedShoppers);
writeJsonl(path.join(outDir, 'candidatePostulations.jsonl'), sanitizedPostulations);
writeJsonl(path.join(outDir, 'candidateNotificationsHistory.jsonl'), sanitizedNotifications);
writeJsonl(path.join(outDir, 'candidateLiquidationOnly.jsonl'), sanitizedLiqs);
writeJsonl(path.join(outDir, 'candidateIssueResolution.jsonl'), issueResolution);

const manifest = {
  generatedAt: new Date().toISOString(),
  mode: 'sanitized-dev-candidate-no-firestore-writes',
  tenantId: 'tya',
  programId: 'cinepolis',
  inputs: { previewDir, canonicalPlanPath, canonicalPlanLoaded: !!canonicalPlan },
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, canImport: false, executeAllowed: false },
  counts: {
    visits: sanitizedVisits.length,
    submitidos: sanitizedSubmitidos.length,
    shoppersSanitized: sanitizedShoppers.length,
    postulations: sanitizedPostulations.length,
    notificationsHistory: sanitizedNotifications.length,
    liquidationCandidatesOnly: sanitizedLiqs.length,
    validationIssues: issueResolution.length,
    sensitiveFieldOccurrencesRemoved: removedSensitiveFields.reduce((sum, r) => sum + r.removedFields.length, 0)
  },
  policies: {
    questionnaireMarks: 'excluded_as_independent_source_because_duplicate_of_postulations',
    shoppersPii: 'sensitive_fields_removed_from_dev_candidate',
    notifications: 'history_only_until_recipient_canonical',
    liquidations: 'candidate_only_until_external_finance_crosscheck',
    periodReview: 'review_or_preparation_periods_not_final_import'
  },
  remainingBeforeWrite: [
    'Review sanitized candidate counts against Paula expected counts.',
    'Confirm period classification for JUNIO 26, JUNIO 26 HN and JULIO 26.',
    'Confirm shopper dedupe/canonicalShopperId policy.',
    'Validate Firestore/Auth/Storage rules before any DEV write.',
    'Create separate write runner only after explicit authorization and rollback test.'
  ]
};

fs.writeFileSync(path.join(outDir, 'sanitizedDevCandidateManifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'removedSensitiveFields.audit.json'), JSON.stringify({ generatedAt: manifest.generatedAt, removedSensitiveFields }, null, 2), 'utf8');

const md = [
  '# TyA sanitized DEV candidate',
  '',
  `Generated at: ${manifest.generatedAt}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- canImport: false',
  '- executeAllowed: false',
  '',
  '## Counts',
  `- Visits: ${manifest.counts.visits}`,
  `- Submitidos: ${manifest.counts.submitidos}`,
  `- Shoppers sanitized: ${manifest.counts.shoppersSanitized}`,
  `- Postulations: ${manifest.counts.postulations}`,
  `- Notifications history: ${manifest.counts.notificationsHistory}`,
  `- Liquidation candidates only: ${manifest.counts.liquidationCandidatesOnly}`,
  `- Validation issues: ${manifest.counts.validationIssues}`,
  `- Sensitive field occurrences removed: ${manifest.counts.sensitiveFieldOccurrencesRemoved}`,
  '',
  '## Policies applied',
  ...Object.entries(manifest.policies).map(([k, v]) => `- ${k}: ${v}`),
  '',
  '## Remaining before write',
  ...manifest.remainingBeforeWrite.map(v => `- ${v}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'sanitizedDevCandidateReport.md'), md, 'utf8');
console.log(md);
console.log('');
console.log(`Report dir: ${outDir}`);
