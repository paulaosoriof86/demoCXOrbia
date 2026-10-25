import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const candidateDir = process.env.CXORBIA_TYA_SANITIZED_DEV_DIR || path.join(repoRoot, 'tmp', 'tya-sanitized-dev-candidate');
const outDir = process.env.CXORBIA_TYA_WRITE_PLAN_OUT || path.join(repoRoot, 'tmp', 'tya-firestore-write-plan');
fs.mkdirSync(outDir, { recursive: true });

function readJsonl(file){
  try { return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse); }
  catch { return []; }
}
function writeJsonl(file, rows){
  fs.writeFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
}
function planRows(rows, collection, sourceFile){
  return rows.map((payload, index) => ({
    operation: 'plan_create',
    targetPath: `tenants/tya/migrationPreview/${collection}/${payload.docId || `${collection}_${index}`}`,
    sourceFile,
    sourceIndex: index,
    executeAllowed: false,
    payload
  }));
}

const files = {
  visits: 'candidateVisits.jsonl',
  submitidos: 'candidateSubmitidos.jsonl',
  shoppers: 'candidateShoppersSanitized.jsonl',
  postulations: 'candidatePostulations.jsonl',
  communications: 'candidateNotificationsHistory.jsonl',
  operativeCandidates: 'candidateLiquidationOnly.jsonl',
  issueResolution: 'candidateIssueResolution.jsonl'
};
const data = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, readJsonl(path.join(candidateDir, f))]));
const plan = [
  ...planRows(data.visits, 'visits', files.visits),
  ...planRows(data.submitidos, 'events', files.submitidos),
  ...planRows(data.shoppers, 'shoppers', files.shoppers),
  ...planRows(data.postulations, 'events', files.postulations),
  ...planRows(data.communications, 'communicationsHistory', files.communications),
  ...planRows(data.operativeCandidates, 'operativeCandidates', files.operativeCandidates),
  ...planRows(data.issueResolution, 'issueResolution', files.issueResolution)
];

const critical = data.issueResolution.filter(r => String(r.severity || '').toLowerCase() === 'critical');
const gate = {
  generatedAt: new Date().toISOString(),
  status: critical.length ? 'review_required' : 'review_required',
  canWriteToFirestore: false,
  executeAllowed: false,
  importsExecuted: 0,
  firestoreWrites: 0,
  reason: 'safe_plan_only_requires_manual_review',
  requiredAuthorizationText: 'PAULA_AUTORIZA_DEV_STAGING_WRITE'
};
const manifest = {
  generatedAt: gate.generatedAt,
  mode: 'safe-write-plan-from-sanitized-candidate',
  sourceCandidateDir: candidateDir,
  gate,
  counts: {
    planRows: plan.length,
    visits: data.visits.length,
    submitidos: data.submitidos.length,
    shoppers: data.shoppers.length,
    postulations: data.postulations.length,
    communications: data.communications.length,
    operativeCandidates: data.operativeCandidates.length,
    issueResolution: data.issueResolution.length
  },
  safety: { firestoreWrites: 0, importsExecuted: 0, deploy: 0, production: 0, executeAllowed: false }
};

writeJsonl(path.join(outDir, 'firestoreWritePlan.jsonl'), plan);
fs.writeFileSync(path.join(outDir, 'importGate.json'), JSON.stringify(gate, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'writePlanManifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
const md = [
  '# TyA safe write plan from candidate', '',
  `Generated at: ${manifest.generatedAt}`, '',
  '## Safety', '- Firestore writes: 0', '- Imports executed: 0', '- Deploy: 0', '- Production: 0', '- executeAllowed: false', '',
  '## Gate', `- Status: ${gate.status}`, `- Reason: ${gate.reason}`, `- Can write to Firestore: ${gate.canWriteToFirestore}`, '',
  '## Counts',
  `- Plan rows: ${manifest.counts.planRows}`,
  `- Visits: ${manifest.counts.visits}`,
  `- Submitidos: ${manifest.counts.submitidos}`,
  `- Shoppers: ${manifest.counts.shoppers}`,
  `- Postulations: ${manifest.counts.postulations}`,
  `- Communications history: ${manifest.counts.communications}`,
  `- Operative candidates: ${manifest.counts.operativeCandidates}`,
  `- Issue resolution: ${manifest.counts.issueResolution}`
].join('\n');
fs.writeFileSync(path.join(outDir, 'writePlanReport.md'), md, 'utf8');
console.log(md);
