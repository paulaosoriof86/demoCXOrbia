import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const steps = [
  ['build-dry-run', 'Construir dry-run Config/Integraciones/Automatizaciones', 'firebase/client-write-tools/build-config-integrations-automation-dry-run.mjs', [0]],
  ['validate-dry-run', 'Validar dry-run', 'firebase/client-write-tools/validate-config-integrations-automation-dry-run.mjs', [0, 1]],
  ['build-write-plan', 'Construir write-plan dry-run', 'firebase/client-write-tools/build-config-integrations-automation-write-plan-dry-run.mjs', [0, 1]],
  ['validate-write-plan', 'Validar write-plan', 'firebase/client-write-tools/validate-config-integrations-automation-write-plan.mjs', [0, 1]],
  ['review-pack', 'Exportar paquete de revisión', 'firebase/client-write-tools/export-config-integrations-automation-review-pack.mjs', [0, 1]]
];

const results = [];
let hardFail = false;

for (const [id, label, script, acceptedCodes] of steps) {
  const startedAt = new Date().toISOString();
  const res = spawnSync('node', [script], { cwd: root, encoding: 'utf8' });
  const exitCode = typeof res.status === 'number' ? res.status : 1;
  const accepted = acceptedCodes.includes(exitCode);
  const status = accepted ? (exitCode === 0 ? 'OK' : 'REVIEW') : 'FAIL';
  results.push({ id, label, script, status, exitCode, startedAt, finishedAt: new Date().toISOString(), stdout: res.stdout || '', stderr: res.stderr || '' });
  if (!accepted) { hardFail = true; break; }
}

function readJson(fileName) {
  const p = path.join(outDir, fileName);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const dryRun = readJson('config-integrations-automation-dry-run.json');
const validation = readJson('config-integrations-automation-validation.json');
const writePlan = readJson('config-integrations-automation-write-plan-dry-run.json');
const writeValidation = readJson('config-integrations-automation-write-plan-validation.json');
const reviewPack = readJson('config-integrations-automation-review-pack.json');

const summary = {
  generatedAt: new Date().toISOString(),
  mode: 'config-integrations-automation-pipeline-dry-run-read-only',
  status: hardFail ? 'FAIL' : results.some((x) => x.status === 'REVIEW') ? 'REVIEW' : 'OK',
  results: results.map((x) => ({ id: x.id, label: x.label, status: x.status, exitCode: x.exitCode })),
  counts: {
    dryRun: dryRun?.counts || null,
    validation: validation?.counts || null,
    writePlan: writePlan?.counts || null,
    writeValidation: writeValidation?.counts || null,
    reviewPack: reviewPack?.counts || null
  },
  outputFiles: [
    'config-integrations-automation-dry-run.json',
    'config-integrations-automation-dry-run-summary.md',
    'config-integrations-automation-validation.json',
    'config-integrations-automation-validation-summary.md',
    'config-integrations-automation-write-plan-dry-run.json',
    'config-integrations-automation-write-plan-dry-run-summary.md',
    'config-integrations-automation-write-plan-validation.json',
    'config-integrations-automation-write-plan-validation-summary.md',
    'config-integrations-automation-review-pack.json',
    'config-integrations-automation-review-pack.md',
    'config-integrations-automation-review-integrations.csv',
    'config-integrations-automation-review-automations.csv'
  ].filter((f) => fs.existsSync(path.join(outDir, f))).map((f) => path.join(outDir, f))
};

const outJson = path.join(outDir, 'config-integrations-automation-pipeline-dry-run.json');
const outMd = path.join(outDir, 'config-integrations-automation-pipeline-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify({ ...summary, detailedResults: results }, null, 2), 'utf8');

const md = [];
md.push('# Pipeline Configuración / Integraciones / Automatizaciones — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore. No modifica frontend.');
md.push('');
md.push(`Estado: ${summary.status}`);
md.push('');
md.push('## Pasos');
md.push('| Paso | Estado | Exit code |');
md.push('|---|---|---:|');
for (const r of summary.results) md.push(`| ${r.label} | ${r.status} | ${r.exitCode} |`);
md.push('');
md.push('## Conteos');
for (const [k, v] of Object.entries(summary.counts)) md.push(`- ${k}: ${v ? JSON.stringify(v) : 'no disponible'}`);
md.push('');
md.push('## Archivos generados');
summary.outputFiles.forEach((f) => md.push(`- ${f}`));
md.push('');
md.push('## Próxima decisión');
md.push('- REVIEW es esperado mientras las integraciones estén en draft y las automatizaciones inactivas.');
md.push('- No cargar Firestore sin reglas DEV y autorización explícita.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(hardFail ? 2 : summary.status === 'REVIEW' ? 1 : 0);
