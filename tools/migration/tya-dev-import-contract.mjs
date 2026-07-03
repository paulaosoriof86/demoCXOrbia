import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const previewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');
const outDir = process.env.CXORBIA_TYA_IMPORT_CONTRACT_OUT || path.join(repoRoot, 'tmp', 'tya-dev-import-contract');
const hrMultitabPath = process.env.CXORBIA_HR_MULTITAB_REPORT || path.join(repoRoot, 'tmp', 'hr-source-private', 'multitab-preview', 'hrSourceMultitabPreview.json');

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

function issue(code, severity, message, source = 'contract', expected = '', detected = ''){
  return { code, severity, message, source, expected, detected };
}

function pathPlan(projectId, kind){
  return `tenants/tya/projects/${projectId}/${kind}`;
}

function uniq(values){
  return [...new Set(values.filter(Boolean).map(String))];
}

fs.mkdirSync(outDir, { recursive: true });

const visits = readJsonl(path.join(previewDir, 'previewVisits.jsonl'));
const submitidos = readJsonl(path.join(previewDir, 'previewSubmitidos.jsonl'));
const liquidations = readJsonl(path.join(previewDir, 'previewLiquidationCandidates.jsonl'));
const shoppers = readJsonl(path.join(previewDir, 'previewShoppers.jsonl'));
const postulations = readJsonl(path.join(previewDir, 'previewPostulations.jsonl'));
const notifications = readJsonl(path.join(previewDir, 'previewNotifications.jsonl'));
const validationIssues = readJsonl(path.join(previewDir, 'validationIssues.jsonl'));
const migrationBatch = readJson(path.join(previewDir, 'migrationBatch.json'), {});
const hrMultitab = readJson(hrMultitabPath, null);

const detectedProjectIds = uniq(visits.map(v => v.projectId || v.project || 'cinepolis'));
const projectId = detectedProjectIds[0] || 'cinepolis';
const countries = uniq(visits.map(v => v.country || v.pais));
const periods = uniq(visits.map(v => v.periodRaw || v.period || v.periodo));

const blockers = [];
if(!fs.existsSync(previewDir)){
  blockers.push(issue('staging_preview_missing', 'critical', 'No existe staging preview local.', 'preview', 'tmp/tya-staging-preview', 'missing'));
}
for(const v of validationIssues){
  if(v.severity === 'critical'){
    blockers.push(issue(v.code || 'validation_critical', 'critical', v.message || 'Critical validation issue.', v.sourceFile || 'validationIssues', v.expected ?? '', v.detected ?? ''));
  }
}
if(shoppers.length > 0){
  blockers.push(issue('pii_policy_gate', 'critical', 'Shoppers requieren politica PII final antes de cualquier escritura.', 'security', 'PII encrypted/restricted', 'pending'));
}
if(liquidations.length > 0){
  blockers.push(issue('financial_crosscheck_gate', 'warning', 'Liquidaciones son candidatas hasta cruce financiero externo.', 'finance', 'external crosscheck', 'pending'));
}
if(!hrMultitab){
  blockers.push(issue('live_hr_multitab_not_validated', 'warning', 'No hay reporte local multitab HR viva conectado al contrato.', 'hr_source', 'hrSourceMultitabPreview.json', 'missing'));
}

const contract = {
  generatedAt: new Date().toISOString(),
  contractVersion: 'tya-dev-import-contract-v1',
  mode: 'PLAN_ONLY_LOCKED',
  tenantId: 'tya',
  projectId,
  source: {
    stagingPreviewDir: previewDir,
    migrationBatchId: migrationBatch.batchId || migrationBatch.id || 'local-staging-preview',
    hrLiveMultitabAttached: !!hrMultitab,
    hrLiveStatus: hrMultitab?.status || 'not_attached',
    hrLiveSheets: hrMultitab?.counts?.sheets || 0,
    hrLiveRows: hrMultitab?.counts?.rows || 0
  },
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    canWriteToFirestore: false,
    canImport: false,
    executeAllowed: false,
    requiresExplicitFutureApproval: true
  },
  gates: {
    requiredBeforeAnyWrite: [
      'clean_migration_preview_without_critical_issues',
      'pii_policy_for_shoppers',
      'questionnaire_duplicate_resolution',
      'rtdb_encoding_resolution_or_exclusion',
      'notification_recipient_resolution',
      'junio_26_hn_extra_row_resolution',
      'financial_crosscheck_for_liquidations',
      'rollback_plan_reviewed',
      'dev_only_write_runner_created_separately'
    ],
    currentStatus: blockers.some(b => b.severity === 'critical') ? 'blocked' : 'review_required'
  },
  counts: {
    visits: visits.length,
    submitidos: submitidos.length,
    liquidationCandidates: liquidations.length,
    shoppers: shoppers.length,
    postulations: postulations.length,
    notifications: notifications.length,
    validationIssues: validationIssues.length,
    blockers: blockers.length,
    periods: periods.length,
    countries: countries.length,
    firestoreWrites: 0,
    importsExecuted: 0
  },
  collections: [
    { kind: 'visits', path: pathPlan(projectId, 'visits'), count: visits.length, source: 'previewVisits.jsonl', writeAllowed: false },
    { kind: 'questionnaireMarks', path: pathPlan(projectId, 'questionnaireMarks'), count: submitidos.length, source: 'previewSubmitidos.jsonl', writeAllowed: false },
    { kind: 'liquidationCandidates', path: pathPlan(projectId, 'liquidationCandidates'), count: liquidations.length, source: 'previewLiquidationCandidates.jsonl', writeAllowed: false },
    { kind: 'shoppersPrivateStaging', path: pathPlan(projectId, 'shoppersPrivateStaging'), count: shoppers.length, source: 'previewShoppers.jsonl', writeAllowed: false },
    { kind: 'postulations', path: pathPlan(projectId, 'postulations'), count: postulations.length, source: 'previewPostulations.jsonl', writeAllowed: false },
    { kind: 'notificationHistory', path: pathPlan(projectId, 'notificationHistory'), count: notifications.length, source: 'previewNotifications.jsonl', writeAllowed: false }
  ],
  periods,
  countries,
  blockers
};

const jsonPath = path.join(outDir, 'tyaDevImportContract.json');
const mdPath = path.join(outDir, 'tyaDevImportContract.md');
fs.writeFileSync(jsonPath, JSON.stringify(contract, null, 2), 'utf8');

const md = [
  '# TyA DEV import contract',
  '',
  `Generated at: ${contract.generatedAt}`,
  `Mode: ${contract.mode}`,
  `Tenant: ${contract.tenantId}`,
  `Project: ${contract.projectId}`,
  `Current status: ${contract.gates.currentStatus}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- canWriteToFirestore: false',
  '- executeAllowed: false',
  '',
  '## Counts',
  ...Object.entries(contract.counts).map(([k,v]) => `- ${k}: ${v}`),
  '',
  '## Collections plan',
  ...contract.collections.map(c => `- ${c.kind}: ${c.path} count=${c.count} writeAllowed=${c.writeAllowed}`),
  '',
  '## Gates required before any future write',
  ...contract.gates.requiredBeforeAnyWrite.map(g => `- ${g}`),
  '',
  '## Blockers',
  ...(contract.blockers.length ? contract.blockers.map(b => `- ${b.severity}: ${b.code} — ${b.message}`) : ['- none'])
].join('\n');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(md);
console.log('');
console.log(`JSON: ${jsonPath}`);
console.log(`Markdown: ${mdPath}`);

if(contract.gates.currentStatus === 'blocked') process.exitCode = 1;
