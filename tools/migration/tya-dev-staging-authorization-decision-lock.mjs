import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-staging-authorization-decision-lock');
fs.mkdirSync(outDir, { recursive: true });

function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

const requiredDocs = [
  'app/docs/V78-SOURCE-LOCK-BACKEND-CONTINUITY-TYA-20260704.md',
  'app/docs/EMPALME-CONTROLADO-V78-FRONTEND-BACKEND-TYA-20260704.md',
  'app/docs/DEV-STAGING-PREAUTHORIZATION-CONSOLIDATED-REPORT-TYA-20260704.md',
  'app/docs/DEV-STAGING-ROUTE-COUNT-MANIFEST-TYA-20260704.md',
  'app/docs/DEV-STAGING-PREWRITE-VALIDATOR-TYA-20260704.md',
  'app/docs/FUTURE-ENABLED-RUNNER-CONTRACT-TYA-20260704.md',
  'app/docs/SECURITY-HARD-STOPS-DEV-RUNNER-TYA-20260704.md',
  'app/docs/ROLLBACK-CHECKLIST-CONTROLLED-DEV-TYA-20260704.md',
  'app/docs/FIRESTORE-RULES-REVIEW-CHECKLIST-TYA-20260704.md'
];

const docs = requiredDocs.map(file => ({ file, found: exists(file) }));
const allDocsFound = docs.every(item => item.found);

const decisionLock = {
  generatedAt: new Date().toISOString(),
  mode: 'dev-staging-authorization-decision-lock-no-runtime-actions',
  authorizationDecisionStatus: allDocsFound
    ? 'pending_explicit_paula_authorization_dev_only'
    : 'blocked_missing_required_docs',
  visualBaseline: 'Prototype development request CXOrbia V78.zip',
  safety: {
    frontendFilesWritten: 0,
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false,
    enabledRunnerCreated: false
  },
  requiredDocs: docs,
  authorizationPhraseRequired: 'Paula authorizes one controlled DEV staging review only',
  restrictions: [
    'DEV only',
    'V78 visual baseline remains locked',
    'preview and metadata only',
    'no final operational records',
    'no financial final records',
    'no Auth users',
    'no Storage evidence',
    'no Make notifications',
    'no production',
    'rollback by batch required'
  ],
  nextIfAuthorizedLater: [
    'create separate enabled runner draft',
    'keep hard stops and batch rollback',
    'run target validator before any write attempt',
    'run prewrite validator before any write attempt',
    'write only migrationPreview and migrationBatches if all gates pass'
  ]
};

fs.writeFileSync(path.join(outDir, 'devStagingAuthorizationDecisionLock.json'), JSON.stringify(decisionLock, null, 2), 'utf8');

const md = [
  '# TyA DEV staging authorization decision lock',
  '',
  `Generated at: ${decisionLock.generatedAt}`,
  '',
  '## Status',
  `- Authorization decision status: ${decisionLock.authorizationDecisionStatus}`,
  `- Visual baseline: ${decisionLock.visualBaseline}`,
  '- Frontend files written by backend lane: 0',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '- enabledRunnerCreated: false',
  '',
  '## Required docs',
  ...docs.map(item => `- ${item.found ? 'OK' : 'MISSING'} ${item.file}`),
  '',
  '## Required authorization phrase',
  `- ${decisionLock.authorizationPhraseRequired}`,
  '',
  '## Restrictions',
  ...decisionLock.restrictions.map(item => `- ${item}`),
  '',
  '## Next only if authorized later',
  ...decisionLock.nextIfAuthorizedLater.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'devStagingAuthorizationDecisionLock.md'), md, 'utf8');
console.log(md);
