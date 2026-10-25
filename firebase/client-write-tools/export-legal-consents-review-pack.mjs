import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

function readJson(name) {
  const p = path.join(outDir, name);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const dryRun = readJson('legal-consents-dry-run.json');
const validation = readJson('legal-consents-validation.json');

const docs = dryRun?.legalDocuments || [];
const reqs = dryRun?.legalAcceptanceRequirements || [];
const aiPolicies = dryRun?.aiUsagePolicies || [];

const byCountry = docs.reduce((acc, d) => { acc[d.country] = (acc[d.country] || 0) + 1; return acc; }, {});
const byType = docs.reduce((acc, d) => { acc[d.documentType] = (acc[d.documentType] || 0) + 1; return acc; }, {});
const blockers = reqs.filter((r) => r.required && r.blocking);
const inactive = reqs.filter((r) => r.active === false);

const review = {
  generatedAt: new Date().toISOString(),
  mode: 'legal-consents-review-pack-read-only',
  available: { dryRun: !!dryRun, validation: !!validation },
  counts: {
    legalDocuments: docs.length,
    requirements: reqs.length,
    blockers: blockers.length,
    inactiveRequirements: inactive.length,
    aiPolicies: aiPolicies.length,
    validationFail: validation?.fail?.length || 0,
    validationReview: validation?.review?.length || 0
  },
  byCountry,
  byType,
  queues: {
    validationFail: validation?.fail || [],
    validationReview: validation?.review || [],
    inactiveRequirements: inactive.map((r) => ({ requirementId: r.requirementId, documentId: r.documentId, documentType: r.documentType, country: r.country })),
    legalReviewNeeded: docs.map((d) => ({ documentId: d.documentId, documentType: d.documentType, country: d.country, status: d.status, title: d.title }))
  }
};

const outJson = path.join(outDir, 'legal-consents-review-pack.json');
const outMd = path.join(outDir, 'legal-consents-review-pack.md');
const matrixCsv = path.join(outDir, 'legal-consents-review-matrix.csv');

fs.writeFileSync(outJson, JSON.stringify(review, null, 2), 'utf8');

const md = [];
md.push('# Paquete de revisión Legal / Consentimientos');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Documentos: ${docs.length}`);
md.push(`Requisitos: ${reqs.length}`);
md.push(`Bloqueantes: ${blockers.length}`);
md.push(`Requisitos inactivos: ${inactive.length}`);
md.push(`Políticas IA: ${aiPolicies.length}`);
md.push('');
md.push('## Por país');
Object.entries(byCountry).forEach(([k, v]) => md.push(`- ${k}: ${v}`));
md.push('');
md.push('## Por tipo');
Object.entries(byType).forEach(([k, v]) => md.push(`- ${k}: ${v}`));
md.push('');
md.push('## Decisión');
md.push('- Todos los requisitos arrancan inactivos en dry-run hasta revisión legal.');
md.push('- No activar bloqueo de login sin autorización expresa y documentos revisados.');
md.push('- Clientes, socios y aliados requieren documentos reforzados e imprimibles.');
md.push('- Módulos IA críticos requieren aceptación previa del aviso IA.');
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
md.push(`- ${matrixCsv}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

const lines = ['documentId,documentType,country,title,subjectTypes,accessBlocks,status,required,blocking,active'];
for (const doc of docs) {
  const related = reqs.find((r) => r.documentId === doc.documentId) || {};
  const row = [doc.documentId, doc.documentType, doc.country, doc.title, (doc.subjectTypes || []).join('|'), (doc.accessBlocks || []).join('|'), doc.status, related.required, related.blocking, related.active]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  lines.push(row.join(','));
}
fs.writeFileSync(matrixCsv, lines.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit((validation?.fail || []).length ? 2 : 0);
