import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-controlled-dev-write-plan');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function found(file) { return fs.existsSync(file); }

const authorizationPath = path.join(repoRoot, 'tmp', 'tya-controlled-dev-authorization-review', 'controlledDevAuthorizationReview.json');
const dryRunPath = path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package', 'tyaDevImportDryRunPackage.json');
const readinessPath = path.join(repoRoot, 'tmp', 'tya-readiness-consolidated-v5', 'readinessConsolidatedV5.json');

const authorization = readJson(authorizationPath);
const dryRun = readJson(dryRunPath);
const readiness = readJson(readinessPath);

const plan = {
  generatedAt: new Date().toISOString(),
  mode: 'controlled-dev-write-plan-no-runtime-actions',
  planStatus: authorization?.authorizationStatus === 'ready_for_human_authorization_review'
    ? 'plan_ready_for_review_not_execution'
    : 'plan_blocked_until_authorization_review',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  inputs: {
    authorizationReview: found(authorizationPath),
    dryRunPackage: found(dryRunPath),
    readinessV5: found(readinessPath)
  },
  counts: readiness?.counts || {},
  targetScope: {
    environment: 'DEV_ONLY_TO_BE_CONFIRMED',
    tenantId: 'tya',
    projectId: 'tya-migration-dev',
    batchIdPattern: 'tya-dev-import-YYYYMMDD-HHMMSS'
  },
  plannedCollections: [
    'tenants/{tenantId}/migrationBatches/{batchId}',
    'tenants/{tenantId}/projects/{projectId}/migrationPreview/visits',
    'tenants/{tenantId}/projects/{projectId}/migrationPreview/shoppers',
    'tenants/{tenantId}/projects/{projectId}/migrationPreview/communicationsHistory',
    'tenants/{tenantId}/projects/{projectId}/migrationPreview/operativeCandidates'
  ],
  blockedCollections: [
    'production paths',
    'auth users',
    'active notifications',
    'payments final records',
    'storage evidence objects'
  ],
  requiredGates: [
    'Explicit Paula authorization for controlled DEV only',
    'Confirmed DEV Firebase target',
    'Rollback checklist complete',
    'Rules checklist complete',
    'Enabled runner created separately after authorization'
  ]
};

fs.writeFileSync(path.join(outDir, 'controlledDevWritePlan.json'), JSON.stringify(plan, null, 2), 'utf8');

const md = [
  '# TyA controlled DEV write plan',
  '',
  `Generated at: ${plan.generatedAt}`,
  '',
  '## Status',
  `- Plan status: ${plan.planStatus}`,
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Inputs',
  `- Authorization review: ${plan.inputs.authorizationReview ? 'found' : 'missing'}`,
  `- Dry-run package: ${plan.inputs.dryRunPackage ? 'found' : 'missing'}`,
  `- Readiness V5: ${plan.inputs.readinessV5 ? 'found' : 'missing'}`,
  '',
  '## Target scope',
  `- Environment: ${plan.targetScope.environment}`,
  `- tenantId: ${plan.targetScope.tenantId}`,
  `- projectId: ${plan.targetScope.projectId}`,
  `- batchId pattern: ${plan.targetScope.batchIdPattern}`,
  '',
  '## Planned collections',
  ...plan.plannedCollections.map(item => `- ${item}`),
  '',
  '## Blocked collections',
  ...plan.blockedCollections.map(item => `- ${item}`),
  '',
  '## Required gates',
  ...plan.requiredGates.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'controlledDevWritePlan.md'), md, 'utf8');
console.log(md);
