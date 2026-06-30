import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

function readJson(fileName) {
  const p = path.join(outDir, fileName);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const strict = readJson('financial-tya-strict-dry-run.json');
const validation = readJson('financial-tya-strict-dry-run-validation.json');
const crosscheck = readJson('financial-tya-strict-vs-hr-v4-crosscheck.json');
const writePlan = readJson('financial-tya-write-plan-dry-run.json');
const planValidation = readJson('financial-tya-write-plan-validation.json');

const review = {
  generatedAt: new Date().toISOString(),
  available: {
    strict: !!strict,
    validation: !!validation,
    crosscheck: !!crosscheck,
    writePlan: !!writePlan,
    planValidation: !!planValidation,
  },
  counts: {
    strict: strict?.counts || null,
    validation: validation?.counts || null,
    crosscheck: crosscheck?.crosscheckCounts || null,
    writePlan: writePlan?.counts || null,
    planValidation: planValidation?.counts || null,
  },
  reviewQueues: {
    shopperAliases: strict?.shopperBenefits?.filter((b) => !['exact', 'fuzzy'].includes(b.shopperMatch?.status)).slice(0, 500) || [],
    ambiguousBenefits: crosscheck?.ambiguousBenefits?.slice(0, 500) || [],
    unmatchedBenefits: crosscheck?.unmatchedBenefits?.slice(0, 500) || [],
    movementReview: crosscheck?.movementReview?.slice(0, 500) || [],
    writePlanSkipped: writePlan?.skipped?.slice(0, 500) || [],
    writePlanWarnings: writePlan?.warnings?.slice(0, 500) || [],
    validationFail: planValidation?.fail?.slice(0, 500) || [],
    validationReview: planValidation?.review?.slice(0, 500) || [],
  },
};

const outJson = path.join(outDir, 'financial-tya-review-pack.json');
const outMd = path.join(outDir, 'financial-tya-review-pack.md');
const aliasCsv = path.join(outDir, 'financial-tya-review-aliases.csv');
const unmatchedCsv = path.join(outDir, 'financial-tya-review-unmatched-benefits.csv');
fs.writeFileSync(outJson, JSON.stringify(review, null, 2), 'utf8');

const md = [];
md.push('# Paquete de revisión financiera TyA');
md.push('');
md.push('Modo: solo lectura. Este paquete resume qué debe revisarse antes de cualquier carga.');
md.push('');
md.push('## Disponibilidad de insumos');
Object.entries(review.available).forEach(([k, v]) => md.push(`- ${k}: ${v ? 'sí' : 'no'}`));
md.push('');
md.push('## Conteos');
for (const [k, v] of Object.entries(review.counts)) {
  md.push(`### ${k}`);
  if (!v) md.push('- no disponible');
  else Object.entries(v).forEach(([a, b]) => md.push(`- ${a}: ${typeof b === 'object' ? JSON.stringify(b) : b}`));
  md.push('');
}
md.push('## Colas de revisión');
Object.entries(review.reviewQueues).forEach(([k, v]) => md.push(`- ${k}: ${Array.isArray(v) ? v.length : 0}`));
md.push('');
md.push('## Archivos');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
md.push(`- ${aliasCsv}`);
md.push(`- ${unmatchedCsv}`);
md.push('');
md.push('## Decisión requerida');
md.push('Resolver o aceptar manualmente las colas de revisión antes de autorizar una carga real en Firestore DEV.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

const aliasLines = ['source,benefitId,rawName,nameKey,matchStatus,shopperId,periodId,country,amount,sheetName,rowNumber'];
for (const b of review.reviewQueues.shopperAliases) {
  const row = ['strict', b.id, b.shopperRawName, b.shopperNameKey, b.shopperMatch?.status, b.shopperId, b.periodId, b.country, b.totalBenefit, b.source?.sheetName, b.source?.rowNumber]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  aliasLines.push(row.join(','));
}
fs.writeFileSync(aliasCsv, aliasLines.join('\n'), 'utf8');

const unmatchedLines = ['source,benefitId,reason,rawName,shopperId,periodId,country,amount,sheetName,rowNumber'];
for (const b of review.reviewQueues.unmatchedBenefits) {
  const row = ['crosscheck', b.benefitId, b.reason, b.shopperRawName, b.shopperId, b.periodId, b.country, b.totalBenefit, b.source?.sheetName, b.source?.rowNumber]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  unmatchedLines.push(row.join(','));
}
fs.writeFileSync(unmatchedCsv, unmatchedLines.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(Object.values(review.reviewQueues).some((v) => Array.isArray(v) && v.length) ? 1 : 0);
