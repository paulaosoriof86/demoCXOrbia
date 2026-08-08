import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-import-write-runner-disabled');
fs.mkdirSync(outDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function exists(file) { return fs.existsSync(file); }

const authorizationPath = path.join(repoRoot, 'tmp', 'tya-controlled-dev-authorization-review', 'controlledDevAuthorizationReview.json');
const dryRunPath = path.join(repoRoot, 'tmp', 'tya-dev-import-dry-run-package', 'tyaDevImportDryRunPackage.json');
const authorization = readJson(authorizationPath);

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'disabled-controlled-dev-write-runner-skeleton',
  runnerStatus: 'disabled_by_design',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    production: 0,
    executeAllowed: false
  },
  inputs: {
    authorizationReview: exists(authorizationPath),
    dryRunPackage: exists(dryRunPath),
    authorizationStatus: authorization?.authorizationStatus || 'missing'
  },
  hardStops: [
    'This runner never writes to Firestore.',
    'This runner never imports data.',
    'This runner never deploys.',
    'This runner never activates Auth or external flows.',
    'Create a separate enabled runner only after explicit future authorization.'
  ],
  next: [
    'Keep this file as a safety skeleton.',
    'Use it to verify that accidental execution remains blocked.',
    'Prepare rules and rollback review before any future enabled runner exists.'
  ]
};

fs.writeFileSync(path.join(outDir, 'disabledWriteRunnerReport.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [
  '# TyA disabled controlled DEV write runner',
  '',
  `Generated at: ${report.generatedAt}`,
  '',
  '## Status',
  `- Runner status: ${report.runnerStatus}`,
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '- Production: 0',
  '- executeAllowed: false',
  '',
  '## Inputs',
  `- Authorization review: ${report.inputs.authorizationReview ? 'found' : 'missing'}`,
  `- Dry-run package: ${report.inputs.dryRunPackage ? 'found' : 'missing'}`,
  `- Authorization status: ${report.inputs.authorizationStatus}`,
  '',
  '## Hard stops',
  ...report.hardStops.map(item => `- ${item}`),
  '',
  '## Next',
  ...report.next.map(item => `- ${item}`)
].join('\n');

fs.writeFileSync(path.join(outDir, 'disabledWriteRunnerReport.md'), md, 'utf8');
console.log(md);
