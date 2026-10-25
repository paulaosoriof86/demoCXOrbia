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

const inputFile = String(args.file || path.join(outDir, 'hr-tya-historico-good-firestore-transform-v4.json'));

const steps = [
  ['build-benefits', 'Construir beneficios desde HR V4', 'firebase/client-write-tools/build-finance-benefits-from-hr-v4-dry-run.mjs', [`--file=${inputFile}`], [0]],
  ['validate-benefits', 'Validar beneficios desde HR V4', 'firebase/client-write-tools/validate-finance-benefits-from-hr-v4-dry-run.mjs', [], [0, 1]],
  ['build-write-plan', 'Construir write-plan de beneficios', 'firebase/client-write-tools/build-finance-benefits-write-plan-dry-run.mjs', [], [0]],
  ['validate-write-plan', 'Validar write-plan de beneficios', 'firebase/client-write-tools/validate-finance-benefits-write-plan-dry-run.mjs', [], [0, 1]]
];

const results = [];
let hardFail = false;

for (const [id, label, script, extraArgs, acceptedCodes] of steps) {
  const res = spawnSync('node', [script, ...extraArgs], { cwd: root, encoding: 'utf8' });
  const exitCode = typeof res.status === 'number' ? res.status : 1;
  const accepted = acceptedCodes.includes(exitCode);
  const status = accepted ? (exitCode === 0 ? 'OK' : 'REVIEW') : 'FAIL';
  results.push({ id, label, script, status, exitCode, stdout: res.stdout || '', stderr: res.stderr || '' });
  if (!accepted) { hardFail = true; break; }
}

function readJson(name) {
  const p = path.join(outDir, name);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const benefitsDryRun = readJson('finance-benefits-from-hr-v4-dry-run.json');
const benefitsValidation = readJson('finance-benefits-from-hr-v4-validation.json');
const writePlan = readJson('finance-benefits-write-plan-dry-run.json');
const writePlanValidation = readJson('finance-benefits-write-plan-validation.json');

const status = hardFail ? 'FAIL' : results.some((x) => x.status === 'REVIEW') ? 'REVIEW' : 'OK';

const outputFiles = [
  'finance-benefits-from-hr-v4-dry-run.json',
  'finance-benefits-from-hr-v4-dry-run-summary.md',
  'finance-benefits-from-hr-v4-validation.json',
  'finance-benefits-from-hr-v4-validation-summary.md',
  'finance-benefits-write-plan-dry-run.json',
  'finance-benefits-write-plan-dry-run-summary.md',
  'finance-benefits-write-plan-validation.json',
  'finance-benefits-write-plan-validation-summary.md'
].filter((f) => fs.existsSync(path.join(outDir, f))).map((f) => path.join(outDir, f));

const summary = {
  generatedAt: new Date().toISOString(),
  mode: 'finance-benefits-full-pipeline-dry-run-read-only',
  inputFile,
  status,
  results: results.map((x) => ({ id: x.id, label: x.label, status: x.status, exitCode: x.exitCode })),
  counts: {
    benefitsDryRun: benefitsDryRun?.counts || null,
    benefitsValidation: benefitsValidation?.counts || null,
    writePlan: writePlan?.counts || null,
    writePlanValidation: writePlanValidation?.counts || null
  },
  totals: benefitsDryRun?.totals || null,
  review: {
    benefits: benefitsValidation?.review?.slice?.(0, 50) || [],
    writePlan: writePlanValidation?.review?.slice?.(0, 50) || []
  },
  outputFiles
};

const outJson = path.join(outDir, 'finance-benefits-full-pipeline-dry-run.json');
const outMd = path.join(outDir, 'finance-benefits-full-pipeline-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify({ ...summary, detailedResults: results }, null, 2), 'utf8');

const md = [];
md.push('# Pipeline completo Finanzas — shopperBenefits');
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
for (const [k, v] of Object.entries(summary.counts)) md.push(`- ${k}: ${v ? JSON.stringify(v) : 'no disponible'}`);
md.push('');
if (summary.totals) {
  md.push('## Totales');
  for (const [key, value] of Object.entries(summary.totals)) md.push(`- ${key}: ${JSON.stringify(value)}`);
  md.push('');
}
if (summary.review.benefits.length || summary.review.writePlan.length) {
  md.push('## Review sample');
  summary.review.benefits.forEach((x) => md.push(`- benefits: ${x}`));
  summary.review.writePlan.forEach((x) => md.push(`- writePlan: ${x}`));
  md.push('');
}
md.push('## Gate');
md.push('No cargar a Firestore DEV si estado es FAIL. Si estado es REVIEW, requiere aprobacion explicita de Paula.');
md.push('');
md.push('## Archivos generados');
summary.outputFiles.forEach((f) => md.push(`- ${f}`));
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(hardFail ? 2 : status === 'REVIEW' ? 1 : 0);
