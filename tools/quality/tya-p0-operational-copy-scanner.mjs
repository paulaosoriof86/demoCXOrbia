#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const targets = ['app/modules', 'app/core'];
const outDir = path.join(root, '_diagnosticos', 'tya-p0-operational-copy-scan');
const now = new Date().toISOString();

const patterns = [
  { id: 'whatsapp_sent', severity: 'P0', re: /\b(WhatsApp|WA)\b.{0,50}\benviad[oa]s?\b/iu, suggestion: 'Usar plantilla/listo/preparado/pendiente backend.' },
  { id: 'email_sent', severity: 'P0', re: /\b(correo|email)\b.{0,50}\benviad[oa]s?\b/iu, suggestion: 'Usar correo preparado o envio real pendiente backend.' },
  { id: 'hr_synced', severity: 'P0', re: /\bHR\b.{0,60}\b(sincronizad[oa]|actualizad[oa])\b/iu, suggestion: 'Usar pendiente de sincronizacion backend.' },
  { id: 'external_sync', severity: 'P0', re: /\b(sincroniza|sincronizado|sincronizada)\b.{0,80}\b(HR|Google Sheets|Sheets|Make)\b/iu, suggestion: 'Aclarar que la sincronizacion real esta pendiente.' },
  { id: 'questionnaire_sent', severity: 'P0', re: /\bcuestionario\b.{0,50}\benviad[oa]\b/iu, suggestion: 'Usar cuestionario realizado/completado o pendiente revision.' },
  { id: 'make_real_action', severity: 'P0', re: /\bMake\b.{0,70}\b(envia|enviado|notifica|sincroniza|actualiza)\b/iu, suggestion: 'Aclarar pendiente de integracion real.' },
  { id: 'automatic_notification', severity: 'P1', re: /\bnotificaci[oó]n\b.{0,40}\bautom[aá]tic[ao]\b/iu, suggestion: 'Verificar si es real o preparado.' }
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    if (entry.isFile() && /\.(js|html|md)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  return text.split(/\r?\n/).flatMap((line, index) => {
    return patterns.filter((p) => p.re.test(line)).map((p) => ({
      id: p.id,
      severity: p.severity,
      file: path.relative(root, file).replaceAll('\\\\', '/'),
      line: index + 1,
      snippet: line.trim().slice(0, 260),
      suggestion: p.suggestion
    }));
  });
}

const files = targets.flatMap((target) => walk(path.join(root, target)));
const findings = files.flatMap(scanFile);
const bySeverity = findings.reduce((acc, f) => {
  acc[f.severity] = (acc[f.severity] || 0) + 1;
  return acc;
}, {});

const result = {
  generatedAt: now,
  status: findings.some((f) => f.severity === 'P0') ? 'review_required' : 'no_p0_findings',
  targets,
  filesScanned: files.length,
  findingsCount: findings.length,
  bySeverity,
  findings
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'p0-operational-copy-scan.json'), JSON.stringify(result, null, 2));

const md = [
  '# P0 operational copy scan',
  '',
  `Generated: ${now}`,
  `Status: ${result.status}`,
  `Files scanned: ${files.length}`,
  `Findings: ${findings.length}`,
  '',
  '## Findings',
  findings.length ? findings.map((f) => `- ${f.severity} ${f.id} ${f.file}:${f.line} — ${f.snippet}`).join('\n') : 'No findings.',
  '',
  '## Safety',
  'This scanner does not modify frontend, backend, providers, data, production, or remote services.'
].join('\n');

fs.writeFileSync(path.join(outDir, 'p0-operational-copy-scan.md'), md);
console.log(JSON.stringify({ status: result.status, filesScanned: files.length, findingsCount: findings.length, outDir: path.relative(root, outDir) }, null, 2));
if (result.status === 'review_required') process.exitCode = 2;
