import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-staging-preauthorization-consolidated-report');
fs.mkdirSync(outDir, { recursive: true });

function readJson(relPath) {
  try { return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8')); }
  catch { return null; }
}
function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

const inputs = {
  v78ContinuityBaseline: 'tmp/tya-v78-backend-continuity-baseline/v78BackendContinuityBaseline.json',
  routeCountManifest: 'tmp/tya-dev-staging-route-count-manifest/devStagingRouteCountManifest.json',
  prewriteValidator: 'tmp/tya-dev-staging-prewrite-validator/devStagingPrewriteValidator.json',
  targetValidator: 'tmp/tya-dev-staging-target-validator/devStagingTargetValidator.json',
  futureRunnerContract: 'tmp/tya-future-enabled-runner-contract/futureEnabledRunnerContract.json',
  authorizationReview: 'tmp/tya-controlled-dev-authorization-review/controlledDevAuthorizationReview.json',
  readinessV5: 'tmp/tya-readiness-consolidated-v5/readinessConsolidatedV5.json'
};

const loaded = Object.fromEntries(Object.entries(inputs).map(([key, relPath]) => [key, {
  path: relPath,
  found: exists(relPath),
  data: readJson(relPath)
}]));

const docInputs = {
  sourceLockV78: 'app/docs/V78-SOURCE-LOCK-BACKEND-CONTINUITY-TYA-20260704.md',
  controlledMergeV78: 'app/docs/EMPALME-CONTROLADO-V78-FRONTEND-BACKEND-TYA-20260704.md',
  correctedAuditV78: 'app/docs/AUDITORIA-FORENSE-V78-CORREGIDA-CXORBIA-20260704.md',
  routeCountManifestDoc: 'app/docs/DEV-STAGING-ROUTE-COUNT-MANIFEST-TYA-20260704.md',
  prewriteValidatorDoc: 'app/docs/DEV-STAGING-PREWRITE-VALIDATOR-TYA-20260704.md',
  futureRunnerContractDoc: 'app/docs/FUTURE-ENABLED-RUNNER-CONTRACT-TYA-20260704.md'
};

const docStatus = Object.fromEntries(Object.entries(docInputs).map(([key, relPath]) => [key, {
  path: relPath,
  found: exists(relPath)
}]));

const checks = [];
function add(id, ok, detail) { checks.push({ id, ok, detail }); }

add('v78_source_locked', docStatus.sourceLockV78.found, 'V78 source lock document exists');
add('v78_controlled_merge_documented', docStatus.controlledMergeV78.found, 'V78 controlled frontend/backend merge document exists');
add('corrected_v78_audit_documented', docStatus.correctedAuditV78.found, 'corrected V78 forensic audit exists');
add('route_count_manifest_documented', docStatus.routeCountManifestDoc.found, 'route count manifest doc exists');
add('prewrite_validator_documented', docStatus.prewriteValidatorDoc.found, 'prewrite validator doc exists');
add('future_runner_contract_documented', docStatus.futureRunnerContractDoc.found, 'future runner contract doc exists');
add('all_runtime_inputs_optional_until_local_run', true, 'tmp JSON inputs are produced only when local scripts are executed');

const allDocsFound = Object.values(docStatus).every(item => item.found);
const allChecksOk = checks.every(item => item.ok);

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'dev-staging-preauthorization-consolidated-report-no-runtime-actions',
  preauthorizationStatus: allDocsFound && allChecksOk
    ? 'ready_for_local_preauthorization_report_run'
    : 'blocked_missing_documentation',
  visualBaseline: {
    prototype: 'Prototype development request CXOrbia V78.zip',
    sourceLocked: docStatus.sourceLockV78.found,
    frontendLane: 'Claude/prototype',
    backendLane: 'ChatGPT/Codex backend docs and migration scripts'
  },
  safety: {
    frontendFilesWritten: 0,
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  docStatus,
  runtimeInputs: Object.fromEntries(Object.entries(loaded).map(([key, value]) => [key, {
    path: value.path,
    found: value.found
  }])),
  checks,
  nextGates: [
    'Run local report generators only when needed.',
    'Review consolidated report output before any authorization decision.',
    'Do not create an enabled runner until Paula gives explicit DEV-only authorization.',
    'Keep V78 as visual baseline unless a newer ZIP is audited and source-locked.'
  ]
};

fs.writeFileSync(path.join(outDir, 'devStagingPreauthorizationConsolidatedReport.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA DEV staging preauthorization consolidated report',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Status',
  `- Preauthorization status: ${report.preauthorizationStatus}`,
  `- Visual baseline: ${report.visualBaseline.prototype}`,
  '- Frontend files written by backend lane: 0',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Documentation status',
  ...Object.entries(docStatus).map(([key, value]) => `- ${key}: ${value.found ? 'found' : 'missing'} (${value.path})`),
  '',
  '## Runtime inputs',
  ...Object.entries(report.runtimeInputs).map(([key, value]) => `- ${key}: ${value.found ? 'found' : 'missing'} (${value.path})`),
  '',
  '## Checks',
  '| Check | Result | Detail |',
  '|---|---|---|',
  ...checks.map(item => `| ${item.id} | ${item.ok ? 'OK' : 'BLOCKED'} | ${item.detail} |`),
  '',
  '## Next gates',
  ...report.nextGates.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'devStagingPreauthorizationConsolidatedReport.md'), md, 'utf8');
console.log(md);
