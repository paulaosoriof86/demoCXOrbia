import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'tmp', 'tya-dev-readiness-report');
const contractPath = path.join(repoRoot, 'tmp', 'tya-dev-import-contract', 'tyaDevImportContract.json');
const gatesPath = path.join(repoRoot, 'tmp', 'tya-production-gates-matrix', 'tyaProductionGatesMatrix.json');

function readJson(file){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function statusLine(ok, text){
  return `${ok ? 'OK' : 'BLOCKED'} - ${text}`;
}

fs.mkdirSync(outDir, { recursive: true });

const contract = readJson(contractPath);
const gates = readJson(gatesPath);

const checks = [
  { id: 'R01', ok: !!contract, text: 'Contrato DEV generado' },
  { id: 'R02', ok: contract?.safety?.firestoreWrites === 0, text: 'Firestore writes igual a 0' },
  { id: 'R03', ok: contract?.safety?.importsExecuted === 0, text: 'Imports executed igual a 0' },
  { id: 'R04', ok: contract?.safety?.deploy === 0, text: 'Deploy igual a 0' },
  { id: 'R05', ok: contract?.safety?.canImport === false, text: 'canImport false' },
  { id: 'R06', ok: contract?.safety?.executeAllowed === false, text: 'executeAllowed false' },
  { id: 'R07', ok: !!gates, text: 'Matriz de gates generada' },
  { id: 'R08', ok: false, text: 'Autorizacion futura no otorgada' }
];

const ready = checks.every(c => c.ok);
const summary = {
  generatedAt: new Date().toISOString(),
  status: ready ? 'ready_for_review' : 'blocked',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0
  },
  checks
};

fs.writeFileSync(path.join(outDir, 'tyaDevReadinessReport.json'), JSON.stringify(summary, null, 2), 'utf8');

const md = [
  '# TyA DEV readiness report',
  '',
  `Generated at: ${summary.generatedAt}`,
  `Status: ${summary.status}`,
  '',
  '## Checks',
  ...checks.map(c => `- ${c.id}: ${statusLine(c.ok, c.text)}`),
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '',
  '## Result',
  ready ? 'Ready for review only.' : 'Blocked. No write action is allowed.'
].join('\n');

fs.writeFileSync(path.join(outDir, 'tyaDevReadinessReport.md'), md, 'utf8');
console.log(md);
