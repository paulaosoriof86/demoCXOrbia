import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const steps = [
  ['build-legal', 'Construir dry-run legal', 'firebase/client-write-tools/build-legal-consents-dry-run.mjs', [0]],
  ['validate-legal', 'Validar dry-run legal', 'firebase/client-write-tools/validate-legal-consents-dry-run.mjs', [0, 1]],
  ['review-pack', 'Exportar paquete de revisión legal', 'firebase/client-write-tools/export-legal-consents-review-pack.mjs', [0]]
];

const results = [];
let hardFail = false;

for (const [id, label, script, acceptedCodes] of steps) {
  const res = spawnSync('node', [script], { cwd: root, encoding: 'utf8' });
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

const dryRun = readJson('legal-consents-dry-run.json');
const validation = readJson('legal-consents-validation.json');
const review = readJson('legal-consents-review-pack.json');

const summary = {
  generatedAt: new Date().toISOString(),
  mode: 'legal-consents-pipeline-dry-run-read-only',
  status: hardFail ? 'FAIL' : results.some((x) => x.status === 'REVIEW') ? 'REVIEW' : 'OK',
  results: results.map((x) => ({ id: x.id, label: x.label, status: x.status, exitCode: x.exitCode })),
  counts: {
    dryRun: dryRun?.counts || null,
    validation: validation?.counts || null,
    review: review?.counts || null
  },
  outputFiles: [
    'legal-consents-dry-run.json',
    'legal-consents-dry-run-summary.md',
    'legal-consents-validation.json',
    'legal-consents-validation-summary.md',
    'legal-consents-review-pack.json',
    'legal-consents-review-pack.md',
    'legal-consents-review-matrix.csv'
  ].filter((f) => fs.existsSync(path.join(outDir, f))).map((f) => path.join(outDir, f))
};

const outJson = path.join(outDir, 'legal-consents-pipeline-dry-run.json');
const outMd = path.join(outDir, 'legal-consents-pipeline-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify({ ...summary, detailedResults: results }, null, 2), 'utf8');

const md = [];
md.push('# Pipeline Legal / Consentimientos — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore. No bloquea usuarios.');
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
md.push('## Gate');
md.push('No activar requisitos legales bloqueantes sin revisión jurídica y autorización explícita.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(hardFail ? 2 : summary.status === 'REVIEW' ? 1 : 0);
