import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.replace(/^--/, '').split('=');
  return [k, rest.join('=') || true];
}));

const defaultInput = path.join(outDir, 'hr-tya-historico-good-firestore-transform-v4.json');
const inputFile = String(args.file || defaultInput);

const steps = [
  {
    id: 'build-benefits',
    label: 'Construir shopperBenefits desde HR V4',
    cmd: ['node', ['firebase/client-write-tools/build-finance-benefits-from-hr-v4-dry-run.mjs', `--file=${inputFile}`]],
    accepted: [0]
  },
  {
    id: 'validate-benefits',
    label: 'Validar shopperBenefits desde HR V4',
    cmd: ['node', ['firebase/client-write-tools/validate-finance-benefits-from-hr-v4-dry-run.mjs']],
    accepted: [0, 1]
  }
];

const results = [];
let hardFail = false;
for (const step of steps) {
  const [bin, argv] = step.cmd;
  const res = spawnSync(bin, argv, { cwd: root, encoding: 'utf8' });
  const exitCode = typeof res.status === 'number' ? res.status : 1;
  const accepted = step.accepted.includes(exitCode);
  const status = accepted ? (exitCode === 0 ? 'OK' : 'REVIEW') : 'FAIL';
  results.push({ id: step.id, label: step.label, status, exitCode, stdout: res.stdout || '', stderr: res.stderr || '' });
  if (!accepted) { hardFail = true; break; }
}

function readJson(name) {
  const p = path.join(outDir, name);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const dryRun = readJson('finance-benefits-from-hr-v4-dry-run.json');
const validation = readJson('finance-benefits-from-hr-v4-validation.json');
const status = hardFail ? 'FAIL' : results.some((x) => x.status === 'REVIEW') ? 'REVIEW' : 'OK';

const summary = {
  generatedAt: new Date().toISOString(),
  mode: 'finance-benefits-hr-v4-pipeline-dry-run-read-only',
  inputFile,
  status,
  results: results.map((x) => ({ id: x.id, label: x.label, status: x.status, exitCode: x.exitCode })),
  counts: {
    dryRun: dryRun?.counts || null,
    validation: validation?.counts || null
  },
  totals: dryRun?.totals || null,
  validationReviewSample: validation?.review?.slice?.(0, 50) || [],
  outputFiles: [
    'finance-benefits-from-hr-v4-dry-run.json',
    'finance-benefits-from-hr-v4-dry-run-summary.md',
    'finance-benefits-from-hr-v4-validation.json',
    'finance-benefits-from-hr-v4-validation-summary.md'
  ].filter((f) => fs.existsSync(path.join(outDir, f))).map((f) => path.join(outDir, f))
};

const outJson = path.join(outDir, 'finance-benefits-hr-v4-pipeline-dry-run.json');
const outMd = path.join(outDir, 'finance-benefits-hr-v4-pipeline-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify({ ...summary, detailedResults: results }, null, 2), 'utf8');

const md = [];
md.push('# Pipeline Finanzas — beneficios HR V4');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Estado: ${status}`);
md.push(`Entrada: ${inputFile}`);
md.push('');
md.push('## Pasos');
md.push('| Paso | Estado | Exit code |');
md.push('|---|---|---:|');
for (const r of summary.results) md.push(`| ${r.label} | ${r.status} | ${r.exitCode} |`);
md.push('');
md.push('## Conteos');
md.push(`- Dry-run: ${summary.counts.dryRun ? JSON.stringify(summary.counts.dryRun) : 'no disponible'}`);
md.push(`- Validación: ${summary.counts.validation ? JSON.stringify(summary.counts.validation) : 'no disponible'}`);
md.push('');
if (summary.totals) {
  md.push('## Totales');
  for (const [key, value] of Object.entries(summary.totals)) md.push(`- ${key}: ${JSON.stringify(value)}`);
  md.push('');
}
if (summary.validationReviewSample.length) {
  md.push('## Review sample');
  summary.validationReviewSample.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
md.push('## Gate');
md.push('No cargar shopperBenefits a Firestore DEV hasta que el pipeline quede OK o la revisión sea aceptada por Paula.');
md.push('');
md.push('## Archivos generados');
summary.outputFiles.forEach((f) => md.push(`- ${f}`));
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(hardFail ? 2 : status === 'REVIEW' ? 1 : 0);
