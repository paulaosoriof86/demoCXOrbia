import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-staging-prewrite-validator');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function exists(file) { return fs.existsSync(file); }

const manifestPath = path.join(repoRoot, 'tmp', 'tya-dev-staging-route-count-manifest', 'devStagingRouteCountManifest.json');
const targetValidatorPath = path.join(repoRoot, 'tmp', 'tya-dev-staging-target-validator', 'devStagingTargetValidator.json');
const authorizationPath = path.join(repoRoot, 'tmp', 'tya-controlled-dev-authorization-review', 'controlledDevAuthorizationReview.json');

const manifest = readJson(manifestPath);
const target = readJson(targetValidatorPath);
const authorization = readJson(authorizationPath);

const checks = [];
function add(id, ok, reason) { checks.push({ id, ok, reason }); }

add('manifest_found', !!manifest, 'route count manifest must exist');
add('target_validator_found', !!target, 'target validator report must exist');
add('authorization_review_found', !!authorization, 'authorization review report must exist');

if (manifest) {
  const collections = manifest.collections || [];
  add('all_paths_include_tenant', collections.every(item => item.path.includes(`tenants/${manifest.scope?.tenantId || 'tya'}`)), 'all paths must include tenantId');
  add('project_paths_include_project', collections.filter(item => item.path.includes('/projects/')).every(item => item.path.includes(`/projects/${manifest.scope?.projectId || 'tya-migration-dev'}`)), 'project paths must include projectId');
  add('data_paths_include_batch', collections.every(item => item.path.includes('{batchId}')), 'all planned paths must include batchId placeholder');
  add('no_final_records', collections.every(item => item.finalRecord === false), 'manifest must not allow final records');
  add('non_negative_counts', collections.every(item => Number.isInteger(item.expectedCount) && item.expectedCount >= 0), 'expected counts must be non-negative integers');
}

if (target) {
  add('target_not_executed', target.safety?.executeAllowed === false, 'target validator must remain non-executable');
}

if (authorization) {
  add('authorization_not_runtime', authorization.safety?.executeAllowed === false, 'authorization review must remain non-executable');
}

const ok = checks.every(item => item.ok);
const report = {
  generatedAt: new Date().toISOString(),
  mode: 'dev-staging-prewrite-validator-no-runtime-actions',
  validationStatus: ok ? 'prewrite_contract_valid_for_review' : 'prewrite_contract_blocked',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  inputs: {
    routeCountManifest: exists(manifestPath),
    targetValidator: exists(targetValidatorPath),
    authorizationReview: exists(authorizationPath)
  },
  checks,
  next: ok
    ? ['Contract can be reviewed. Do not execute writes from this validator.']
    : ['Resolve failed checks before any future enabled runner is considered.']
};

fs.writeFileSync(path.join(outDir, 'devStagingPrewriteValidator.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA DEV staging prewrite validator',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Status',
  `- Validation status: ${report.validationStatus}`,
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Inputs',
  ...Object.entries(report.inputs).map(([key, value]) => `- ${key}: ${value ? 'found' : 'missing'}`),
  '',
  '## Checks',
  '| Check | Result | Reason |',
  '|---|---|---|',
  ...checks.map(item => `| ${item.id} | ${item.ok ? 'OK' : 'BLOCKED'} | ${item.reason} |`),
  '',
  '## Next',
  ...report.next.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'devStagingPrewriteValidator.md'), md, 'utf8');
console.log(md);
