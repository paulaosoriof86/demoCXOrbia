import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-v78-frontend-backend-merge-guard');
fs.mkdirSync(outDir, { recursive: true });

function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

const expectedPrototypeState = [
  {
    file: 'app/app.js',
    expectedFromPrototype: 'V78 PWA install-aware behavior',
    ownership: 'frontend_claude',
    backendAction: 'do_not_edit_from_backend'
  },
  {
    file: 'app/modules/saas-console.js',
    expectedFromPrototype: 'V78 internal releases without production deploy wording',
    ownership: 'frontend_claude',
    backendAction: 'do_not_edit_from_backend'
  },
  {
    file: 'app/modules/rutas.js',
    expectedFromPrototype: 'absent in V78',
    ownership: 'frontend_claude',
    backendAction: 'do_not_delete_from_backend_but_flag_if_present'
  },
  {
    file: 'app/modules/novedades.js',
    expectedFromPrototype: 'nvBanner fixed by Claude candidate after V78',
    ownership: 'frontend_claude',
    backendAction: 'document_only'
  }
];

const backendOwned = [
  'tools/migration/tya-v78-backend-continuity-baseline.mjs',
  'tools/migration/tya-dev-staging-route-count-manifest.mjs',
  'tools/migration/tya-dev-staging-prewrite-validator.mjs',
  'tools/migration/tya-future-enabled-runner-contract.mjs',
  'tools/migration/tya-dev-staging-target-validator.mjs',
  'tools/migration/tya-dev-import-write-runner.disabled.mjs',
  'app/docs/V78-BACKEND-CONTINUITY-BASELINE-TYA-20260704.md',
  'app/docs/DEV-STAGING-ROUTE-COUNT-MANIFEST-TYA-20260704.md',
  'app/docs/DEV-STAGING-PREWRITE-VALIDATOR-TYA-20260704.md',
  'app/docs/FUTURE-ENABLED-RUNNER-CONTRACT-TYA-20260704.md'
];

const prototypeChecks = expectedPrototypeState.map(item => ({
  ...item,
  presentInRepo: exists(item.file),
  mergeStatus: item.file === 'app/modules/rutas.js'
    ? (exists(item.file) ? 'frontend_branch_must_remove_or_keep_unloaded' : 'matches_v78_absent')
    : (exists(item.file) ? 'present_to_be_owned_by_frontend_branch' : 'missing_needs_frontend_review')
}));

const backendChecks = backendOwned.map(file => ({ file, found: exists(file) }));

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'v78-frontend-backend-merge-guard-no-file-overwrite',
  mergeGuardStatus: backendChecks.every(item => item.found)
    ? 'backend_ready_to_continue_on_v78_visual_baseline'
    : 'backend_missing_required_continuity_files',
  safety: {
    frontendFilesWritten: 0,
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  rule: 'frontend V78 belongs to Claude lane; backend PR keeps backend-only files and documents handoff',
  prototypeChecks,
  backendChecks,
  next: [
    'Claude applies frontend residual fixes in frontend/prototype lane.',
    'Backend continues from V78 visual baseline using DEV staging contracts.',
    'Do not overwrite app/modules or app/core from backend lane.'
  ]
};

fs.writeFileSync(path.join(outDir, 'v78FrontendBackendMergeGuard.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA V78 frontend/backend merge guard',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Status',
  `- Merge guard status: ${report.mergeGuardStatus}`,
  '- Frontend files written by backend lane: 0',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Rule',
  `- ${report.rule}`,
  '',
  '## Prototype file checks',
  '| File | Ownership | Expected | Status |',
  '|---|---|---|---|',
  ...prototypeChecks.map(item => `| ${item.file} | ${item.ownership} | ${item.expectedFromPrototype} | ${item.mergeStatus} |`),
  '',
  '## Backend continuity checks',
  ...backendChecks.map(item => `- ${item.found ? 'OK' : 'MISSING'} ${item.file}`),
  '',
  '## Next',
  ...report.next.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'v78FrontendBackendMergeGuard.md'), md, 'utf8');
console.log(md);
