import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [arg.replace(/^--/, ''), true];
}));

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const excelFile = args.file || args.f;
if (!excelFile) {
  console.error('Uso: node firebase/client-write-tools/run-financial-tya-pipeline-dry-run.mjs --file="RUTA_EXCEL"');
  process.exit(1);
}

const excelPath = path.resolve(String(excelFile));
if (!fs.existsSync(excelPath)) {
  console.error('No existe Excel:', excelPath);
  process.exit(1);
}

const hrPath = path.resolve(String(args.hr || path.join(outDir, 'hr-tya-historico-good-firestore-transform-v4.json')));
const hasHr = fs.existsSync(hrPath);

const steps = [
  {
    id: 'strict-transform',
    label: 'Transformación estricta Excel financiero TyA',
    command: 'node',
    args: ['firebase/client-write-tools/transform-financial-tya-excel-strict-dry-run.mjs', `--file=${excelPath}`, ...(hasHr ? [`--hr=${hrPath}`] : [])],
    reviewExitCodes: [0],
  },
  {
    id: 'strict-validate',
    label: 'Validación de salida strict dry-run',
    command: 'node',
    args: ['firebase/client-write-tools/validate-financial-tya-strict-output.mjs'],
    reviewExitCodes: [0, 1],
  },
  {
    id: 'crosscheck-hr-v4',
    label: 'Cruce strict financiero contra HR V4',
    command: 'node',
    args: ['firebase/client-write-tools/crosscheck-financial-tya-strict-vs-hr-v4.mjs'],
    reviewExitCodes: [0, 1],
    skipIf: !hasHr,
    skipReason: 'No existe HR V4 JSON local para cruce.',
  },
  {
    id: 'write-plan',
    label: 'Write-plan dry-run',
    command: 'node',
    args: ['firebase/client-write-tools/build-financial-tya-write-plan-dry-run.mjs'],
    reviewExitCodes: [0, 1],
    skipIf: !hasHr,
    skipReason: 'Write-plan requiere crosscheck HR V4.',
  },
  {
    id: 'write-plan-validate',
    label: 'Validación write-plan dry-run',
    command: 'node',
    args: ['firebase/client-write-tools/validate-financial-tya-write-plan.mjs'],
    reviewExitCodes: [0, 1],
    skipIf: !hasHr,
    skipReason: 'Validación write-plan requiere write-plan.',
  },
  {
    id: 'review-pack',
    label: 'Paquete de revisión financiero TyA',
    command: 'node',
    args: ['firebase/client-write-tools/export-financial-tya-review-pack.mjs'],
    reviewExitCodes: [0, 1],
  },
];

const runStartedAt = new Date().toISOString();
const results = [];
let hardFail = false;

for (const step of steps) {
  if (step.skipIf) {
    results.push({ id: step.id, label: step.label, status: 'SKIPPED', reason: step.skipReason });
    continue;
  }
  const startedAt = new Date().toISOString();
  const res = spawnSync(step.command, step.args, { cwd: root, encoding: 'utf8', shell: false });
  const exitCode = typeof res.status === 'number' ? res.status : 1;
  const accepted = step.reviewExitCodes.includes(exitCode);
  if (!accepted) hardFail = true;
  results.push({
    id: step.id,
    label: step.label,
    command: [step.command, ...step.args].join(' '),
    status: accepted ? (exitCode === 0 ? 'OK' : 'REVIEW') : 'FAIL',
    exitCode,
    startedAt,
    finishedAt: new Date().toISOString(),
    stdout: res.stdout || '',
    stderr: res.stderr || '',
  });
  if (hardFail) break;
}

function readJsonIfExists(fileName) {
  const p = path.join(outDir, fileName);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const strict = readJsonIfExists('financial-tya-strict-dry-run.json');
const validation = readJsonIfExists('financial-tya-strict-dry-run-validation.json');
const crosscheck = readJsonIfExists('financial-tya-strict-vs-hr-v4-crosscheck.json');
const writePlan = readJsonIfExists('financial-tya-write-plan-dry-run.json');
const writePlanValidation = readJsonIfExists('financial-tya-write-plan-validation.json');
const reviewPack = readJsonIfExists('financial-tya-review-pack.json');

const summary = {
  generatedAt: new Date().toISOString(),
  runStartedAt,
  mode: 'pipeline-dry-run-read-only',
  excelPath,
  hrPath: hasHr ? hrPath : null,
  status: hardFail ? 'FAIL' : results.some((r) => r.status === 'REVIEW') ? 'REVIEW' : 'OK',
  results: results.map((r) => ({ id: r.id, label: r.label, status: r.status, exitCode: r.exitCode ?? null, reason: r.reason ?? null })),
  counts: {
    strict: strict?.counts || null,
    validation: validation?.counts || null,
    crosscheck: crosscheck?.crosscheckCounts || null,
    writePlan: writePlan?.counts || null,
    writePlanValidation: writePlanValidation?.counts || null,
    reviewPack: reviewPack?.counts || null,
  },
  outputFiles: [
    'financial-tya-strict-dry-run.json',
    'financial-tya-strict-dry-run-summary.md',
    'financial-tya-strict-dry-run-issues.csv',
    'financial-tya-strict-dry-run-shopper-aliases.csv',
    'financial-tya-strict-dry-run-validation.json',
    'financial-tya-strict-vs-hr-v4-crosscheck.json',
    'financial-tya-strict-vs-hr-v4-crosscheck-summary.md',
    'financial-tya-strict-vs-hr-v4-crosscheck-issues.csv',
    'financial-tya-write-plan-dry-run.json',
    'financial-tya-write-plan-dry-run-summary.md',
    'financial-tya-write-plan-validation.json',
    'financial-tya-write-plan-validation-summary.md',
    'financial-tya-review-pack.json',
    'financial-tya-review-pack.md',
    'financial-tya-review-aliases.csv',
    'financial-tya-review-unmatched-benefits.csv',
  ].filter((f) => fs.existsSync(path.join(outDir, f))).map((f) => path.join(outDir, f)),
};

const outJson = path.join(outDir, 'financial-tya-pipeline-dry-run.json');
const outMd = path.join(outDir, 'financial-tya-pipeline-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify({ ...summary, detailedResults: results }, null, 2), 'utf8');

const md = [];
md.push('# Pipeline financiero TyA — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore. No modifica Excel.');
md.push('');
md.push(`Estado: ${summary.status}`);
md.push(`Excel: ${excelPath}`);
md.push(`HR V4: ${hasHr ? hrPath : 'no disponible'}`);
md.push('');
md.push('## Pasos');
md.push('| Paso | Estado | Exit code |');
md.push('|---|---|---:|');
for (const r of summary.results) md.push(`| ${r.label} | ${r.status}${r.reason ? ` · ${r.reason}` : ''} | ${r.exitCode ?? ''} |`);
md.push('');
md.push('## Conteos principales');
md.push('');
for (const [section, counts] of Object.entries(summary.counts)) {
  if (!counts) continue;
  md.push(`### ${section}`);
  Object.entries(counts).forEach(([k, v]) => md.push(`- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`));
  md.push('');
}
md.push('## Archivos generados');
summary.outputFiles.forEach((f) => md.push(`- ${f}`));
md.push('');
md.push('## Próxima decisión');
md.push('- Si el estado es REVIEW, revisar issues, aliases, filas fuera de alcance y write-plan antes de cualquier carga.');
md.push('- Si falta HR V4 local, ejecutar primero generación/copia de HR V4 en firebase/private-output.');
md.push('- Este pipeline no autoriza ni ejecuta escritura Firestore.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(hardFail ? 2 : summary.status === 'REVIEW' ? 1 : 0);
