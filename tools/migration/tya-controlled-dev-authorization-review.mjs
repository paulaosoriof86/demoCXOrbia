import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-controlled-dev-authorization-review');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function exists(file) { return fs.existsSync(file); }

const readinessPath = path.join(repoRoot, 'tmp', 'tya-readiness-consolidated-v5', 'readinessConsolidatedV5.json');
const dryRunPath = path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package', 'tyaDevImportDryRunPackage.json');
const readiness = readJson(readinessPath);
const dryRun = readJson(dryRunPath);

const ready = readiness?.readiness?.status === 'ready_for_controlled_dev_authorization_review';
const dryRunFound = exists(dryRunPath);

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'controlled-dev-authorization-review-no-runtime-actions',
  authorizationStatus: ready && dryRunFound ? 'ready_for_human_authorization_review' : 'not_ready_for_authorization_review',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  inputs: {
    readinessV5: exists(readinessPath),
    dryRunPackage: dryRunFound
  },
  counts: readiness?.counts || {},
  notes: readiness?.notes || [],
  requiredBeforeAnyRuntimeAction: [
    'Explicit written authorization from Paula for controlled DEV only.',
    'Confirm target Firebase project is new or approved DEV environment only.',
    'Confirm rollback plan and backup snapshot.',
    'Confirm no production, no deploy, no Auth real and no active external flows.'
  ],
  nextAllowedWork: [
    'Prepare disabled write-runner skeleton with executeAllowed false.',
    'Prepare rollback checklist.',
    'Prepare rules review checklist.',
    'Do not execute writes from this authorization review.'
  ]
};

fs.writeFileSync(path.join(outDir, 'controlledDevAuthorizationReview.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA controlled DEV authorization review',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Status',
  `- Authorization status: ${report.authorizationStatus}`,
  '- Safe mode: true',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Inputs',
  `- Readiness V5: ${report.inputs.readinessV5 ? 'found' : 'missing'}`,
  `- Dry-run package: ${report.inputs.dryRunPackage ? 'found' : 'missing'}`,
  '',
  '## Counts',
  `- HR tabs: ${report.counts.hrTabs || 0}`,
  `- Sanitized visits: ${report.counts.sanitizedVisits || 0}`,
  `- Sanitized shoppers: ${report.counts.sanitizedShoppers || 0}`,
  `- Shopper candidates: ${report.counts.shopperCandidates || 0}`,
  `- Legacy communications: ${report.counts.legacyCommunications || 0}`,
  `- Operative candidates: ${report.counts.operativeCandidates || 0}`,
  '',
  '## Required before any runtime action',
  ...report.requiredBeforeAnyRuntimeAction.map(item => `- ${item}`),
  '',
  '## Next allowed work',
  ...report.nextAllowedWork.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'controlledDevAuthorizationReview.md'), md, 'utf8');
console.log(md);
