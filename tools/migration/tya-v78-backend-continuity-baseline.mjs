import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-v78-backend-continuity-baseline');
fs.mkdirSync(outDir, { recursive: true });

function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

const requiredDocs = [
  'app/docs/AUDITORIA-FORENSE-V78-CORREGIDA-CXORBIA-20260704.md',
  'app/docs/EMPALME-BACKEND-V78-TYA-20260704.md',
  'app/docs/DEV-STAGING-ROUTE-COUNT-MANIFEST-TYA-20260704.md',
  'app/docs/DEV-STAGING-PREWRITE-VALIDATOR-TYA-20260704.md',
  'app/docs/FUTURE-ENABLED-RUNNER-CONTRACT-TYA-20260704.md',
  'app/docs/CONTROLLED-DEV-AUTHORIZATION-PACKAGE-TYA-20260704.md'
];

const requiredScripts = [
  'tools/migration/tya-dev-staging-route-count-manifest.mjs',
  'tools/migration/tya-dev-staging-prewrite-validator.mjs',
  'tools/migration/tya-future-enabled-runner-contract.mjs',
  'tools/migration/tya-dev-staging-target-validator.mjs',
  'tools/migration/tya-dev-import-write-runner.disabled.mjs'
];

const docs = requiredDocs.map(file => ({ file, found: exists(file) }));
const scripts = requiredScripts.map(file => ({ file, found: exists(file) }));
const allFound = [...docs, ...scripts].every(item => item.found);

const baseline = {
  generatedAt: new Date().toISOString(),
  mode: 'v78-backend-continuity-baseline-no-runtime-actions',
  visualBaseline: {
    prototypeVersion: 'V78',
    status: 'accepted_for_backend_continuity_with_frontend_residuals',
    frontendCopiedIntoBackendBranch: false,
    residualFrontendItemsForClaude: [
      'novedades nvBanner input or fallback',
      'new SaaS tenant version default'
    ]
  },
  backendContinuity: {
    readinessV5: 'kept',
    controlledDevPackage: 'kept',
    disabledRunner: 'kept',
    routeCountManifest: 'kept',
    prewriteValidator: 'kept',
    futureRunnerContract: 'kept'
  },
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false,
    frontendChanges: 0
  },
  repositoryChecks: {
    docs,
    scripts,
    allFound
  },
  nextBackendBlock: 'controlled-dev-staging-preauthorization-consolidated-report'
};

fs.writeFileSync(path.join(outDir, 'v78BackendContinuityBaseline.json'), JSON.stringify(baseline, null, 2), 'utf8');

const md = [
  '# TyA V78 backend continuity baseline',
  '',
  `Generated at: ${baseline.generatedAt}`,
  '',
  '## Status',
  `- Visual baseline: ${baseline.visualBaseline.prototypeVersion}`,
  `- Baseline status: ${baseline.visualBaseline.status}`,
  '- Frontend copied into backend branch: false',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Backend continuity kept',
  ...Object.entries(baseline.backendContinuity).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Required docs',
  ...docs.map(item => `- ${item.found ? 'OK' : 'MISSING'} ${item.file}`),
  '',
  '## Required scripts',
  ...scripts.map(item => `- ${item.found ? 'OK' : 'MISSING'} ${item.file}`),
  '',
  '## Next backend block',
  `- ${baseline.nextBackendBlock}`
].join('\n');

fs.writeFileSync(path.join(outDir, 'v78BackendContinuityBaseline.md'), md, 'utf8');
console.log(md);
