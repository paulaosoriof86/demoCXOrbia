import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-future-enabled-runner-contract');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function exists(file) { return fs.existsSync(file); }

const files = {
  writePlan: path.join(repoRoot, 'tmp', 'tya-controlled-dev-write-plan', 'controlledDevWritePlan.json'),
  authorizationReview: path.join(repoRoot, 'tmp', 'tya-controlled-dev-authorization-review', 'controlledDevAuthorizationReview.json'),
  readinessV5: path.join(repoRoot, 'tmp', 'tya-readiness-consolidated-v5', 'readinessConsolidatedV5.json'),
  dryRunPackage: path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package', 'tyaDevImportDryRunPackage.json')
};

const data = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readJson(file)]));

const contract = {
  generatedAt: new Date().toISOString(),
  mode: 'future-enabled-runner-contract-no-runtime-actions',
  contractStatus: 'draft_not_executable',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  inputs: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, exists(file)])),
  requiredRuntimeFlagsForFutureRunner: {
    CXORBIA_TYA_ENABLE_DEV_WRITE_RUNNER: 'must_equal_I_UNDERSTAND_DEV_ONLY',
    CXORBIA_TYA_TARGET_ENV: 'must_equal_DEV',
    CXORBIA_TYA_TENANT_ID: 'must_equal_tya',
    CXORBIA_TYA_PROJECT_ID: 'must_equal_tya-migration-dev',
    CXORBIA_TYA_BATCH_ID: 'required_unique_batch_id'
  },
  requiredRuntimeFilesForFutureRunner: [
    'controlledDevWritePlan.json',
    'rollback checklist approval',
    'rules checklist approval',
    'dry-run package',
    'readiness V5 report'
  ],
  abortConditions: [
    'missing explicit Paula authorization',
    'target environment is not DEV',
    'tenantId mismatch',
    'projectId mismatch',
    'batchId missing or already used',
    'expected counts mismatch',
    'route outside tenant/project scope',
    'attempt to create Auth users',
    'attempt to write final payments',
    'attempt to trigger notifications',
    'attempt to write Storage evidence',
    'any production indicator'
  ],
  futureRunnerShape: {
    phase1ValidateOnly: true,
    phase2PrepareBatchMetadata: true,
    phase3WritePreviewOnlyIfAuthorized: 'future separate runner only',
    phase4VerifyCounts: true,
    phase5RollbackAvailable: true
  },
  sourceCounts: data.readinessV5?.counts || {}
};

fs.writeFileSync(path.join(outDir, 'futureEnabledRunnerContract.json'), JSON.stringify(contract, null, 2), 'utf8');

const md = [
  '# TyA future enabled runner contract',
  '',
  `Generated at: ${contract.generatedAt}`,
  '',
  '## Status',
  `- Contract status: ${contract.contractStatus}`,
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Inputs',
  ...Object.entries(contract.inputs).map(([key, value]) => `- ${key}: ${value ? 'found' : 'missing'}`),
  '',
  '## Required runtime flags for any future separate runner',
  ...Object.entries(contract.requiredRuntimeFlagsForFutureRunner).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Abort conditions',
  ...contract.abortConditions.map(item => `- ${item}`),
  '',
  '## Future runner shape',
  ...Object.entries(contract.futureRunnerShape).map(([key, value]) => `- ${key}: ${value}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'futureEnabledRunnerContract.md'), md, 'utf8');
console.log(md);
