import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-staging-route-count-manifest');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function exists(file) { return fs.existsSync(file); }

const readinessPath = path.join(repoRoot, 'tmp', 'tya-readiness-consolidated-v5', 'readinessConsolidatedV5.json');
const writePlanPath = path.join(repoRoot, 'tmp', 'tya-controlled-dev-write-plan', 'controlledDevWritePlan.json');
const contractPath = path.join(repoRoot, 'tmp', 'tya-future-enabled-runner-contract', 'futureEnabledRunnerContract.json');

const readiness = readJson(readinessPath) || {};
const writePlan = readJson(writePlanPath) || {};
const contract = readJson(contractPath) || {};

const counts = readiness.counts || {};
const tenantId = writePlan?.targetScope?.tenantId || 'tya';
const projectId = writePlan?.targetScope?.projectId || 'tya-migration-dev';
const batchIdPlaceholder = '{batchId}';

const collections = [
  {
    id: 'batchMetadata',
    path: `tenants/${tenantId}/migrationBatches/${batchIdPlaceholder}`,
    expectedCount: 1,
    policy: 'metadata_only',
    finalRecord: false
  },
  {
    id: 'visitsPreview',
    path: `tenants/${tenantId}/projects/${projectId}/migrationPreview/${batchIdPlaceholder}/visits`,
    expectedCount: counts.sanitizedVisits || 0,
    policy: 'sanitized_preview_only',
    finalRecord: false
  },
  {
    id: 'shoppersPreview',
    path: `tenants/${tenantId}/projects/${projectId}/migrationPreview/${batchIdPlaceholder}/shoppers`,
    expectedCount: counts.sanitizedShoppers || counts.shopperCandidates || 0,
    policy: 'provisional_identity_preview_only',
    finalRecord: false
  },
  {
    id: 'communicationsHistoryPreview',
    path: `tenants/${tenantId}/projects/${projectId}/migrationPreview/${batchIdPlaceholder}/communicationsHistory`,
    expectedCount: counts.legacyCommunications || 0,
    policy: 'history_only_inactive',
    finalRecord: false
  },
  {
    id: 'operativeCandidatesPreview',
    path: `tenants/${tenantId}/projects/${projectId}/migrationPreview/${batchIdPlaceholder}/operativeCandidates`,
    expectedCount: counts.operativeCandidates || 0,
    policy: 'candidate_only_no_final_records',
    finalRecord: false
  }
];

const manifest = {
  generatedAt: new Date().toISOString(),
  mode: 'dev-staging-route-count-manifest-no-runtime-actions',
  manifestStatus: exists(readinessPath) && exists(writePlanPath)
    ? 'ready_for_review_not_execution'
    : 'missing_local_inputs',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  inputs: {
    readinessV5: exists(readinessPath),
    controlledDevWritePlan: exists(writePlanPath),
    futureEnabledRunnerContract: exists(contractPath)
  },
  scope: { tenantId, projectId, batchId: batchIdPlaceholder },
  sourceCounts: counts,
  collections,
  validationsRequiredBeforeFutureWrite: [
    'all paths must include tenantId',
    'all project paths must include projectId',
    'all data paths must include batchId',
    'expected counts must match dry-run package',
    'all records must be preview or metadata only',
    'no final operational or finance records allowed',
    'no Auth, Storage, Make or production writes allowed'
  ],
  contractStatus: contract.contractStatus || 'not_loaded'
};

fs.writeFileSync(path.join(outDir, 'devStagingRouteCountManifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

const md = [
  '# TyA DEV staging route count manifest',
  '',
  `Generated at: ${manifest.generatedAt}`,
  '',
  '## Status',
  `- Manifest status: ${manifest.manifestStatus}`,
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Inputs',
  ...Object.entries(manifest.inputs).map(([key, value]) => `- ${key}: ${value ? 'found' : 'missing'}`),
  '',
  '## Scope',
  `- tenantId: ${tenantId}`,
  `- projectId: ${projectId}`,
  `- batchId: ${batchIdPlaceholder}`,
  '',
  '## Expected route counts',
  '| ID | Path | Expected count | Policy | Final record |',
  '|---|---|---:|---|---|',
  ...collections.map(item => `| ${item.id} | ${item.path} | ${item.expectedCount} | ${item.policy} | ${item.finalRecord ? 'yes' : 'no'} |`),
  '',
  '## Validations required before any future write',
  ...manifest.validationsRequiredBeforeFutureWrite.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'devStagingRouteCountManifest.md'), md, 'utf8');
console.log(md);
