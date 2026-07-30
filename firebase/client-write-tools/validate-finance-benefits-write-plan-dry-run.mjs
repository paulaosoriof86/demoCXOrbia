import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
const inputPath = path.join(outDir, 'finance-benefits-write-plan-dry-run.json');

if (!fs.existsSync(inputPath)) {
  console.error('No existe write-plan:', inputPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const ops = Array.isArray(data.writeOps) ? data.writeOps : [];
const fail = [];
const review = [];
const paths = new Set();

for (const op of ops) {
  if (op.op !== 'set') fail.push(`invalid_op:${op.op}`);
  if (!op.path || !/^tenants\/[^/]+\/shopperBenefits\/[^/]+$/.test(op.path)) fail.push(`invalid_path:${op.path}`);
  if (paths.has(op.path)) fail.push(`duplicate_path:${op.path}`);
  paths.add(op.path);

  const doc = op.doc || {};
  if (!doc.tenantId || !op.path?.includes(`/tenants/${doc.tenantId}/`) && !op.path?.startsWith(`tenants/${doc.tenantId}/`)) review.push(`${doc.benefitId || op.path}:tenant_path_check`);
  if (!doc.benefitId) fail.push(`${op.path}:missing_benefitId`);
  if (!doc.visitId) fail.push(`${op.path}:missing_visitId`);
  if (!doc.shopperId) fail.push(`${op.path}:missing_shopperId`);
  if (!doc.projectId) fail.push(`${op.path}:missing_projectId`);
  if (!['GT', 'HN', 'OTHER'].includes(doc.country)) fail.push(`${op.path}:invalid_country:${doc.country}`);
  if (!['GTQ', 'HNL', 'USD', 'OTHER'].includes(doc.currency)) fail.push(`${op.path}:invalid_currency:${doc.currency}`);
  if (typeof doc.totalCalculated !== 'number') fail.push(`${op.path}:total_not_number`);
  if ((doc.totalCalculated || 0) < 0) fail.push(`${op.path}:negative_total`);
  if (doc.country === 'HN' && doc.honorariumAmount !== 200) review.push(`${doc.benefitId}:hn_honorarium_review:${doc.honorariumAmount}`);
  if (doc.country === 'GT' && doc.honorariumAmount !== 60) review.push(`${doc.benefitId}:gt_honorarium_review:${doc.honorariumAmount}`);
  if (doc.status === 'paid' && !doc.paymentLotId && !doc.financialMovementId) review.push(`${doc.benefitId}:paid_without_payment_reference`);
}

if (!ops.length) fail.push('empty_write_plan');

const byCountry = ops.reduce((acc, op) => {
  const c = op.doc?.country || 'unknown';
  acc[c] = (acc[c] || 0) + 1;
  return acc;
}, {});

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'finance-benefits-write-plan-validation-read-only',
  inputPath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: { writeOps: ops.length, fail: fail.length, review: review.length },
  byCountry,
  fail,
  review
};

const outJson = path.join(outDir, 'finance-benefits-write-plan-validation.json');
const outMd = path.join(outDir, 'finance-benefits-write-plan-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación write-plan Finanzas — shopperBenefits');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`Operaciones: ${ops.length}`);
md.push(`Fail: ${fail.length}`);
md.push(`Review: ${review.length}`);
md.push('');
md.push('## Por país');
for (const [country, count] of Object.entries(byCountry)) md.push(`- ${country}: ${count}`);
md.push('');
if (fail.length) {
  md.push('## Fail');
  fail.slice(0, 100).forEach((x) => md.push(`- ${x}`));
  if (fail.length > 100) md.push(`- ... ${fail.length - 100} adicionales`);
  md.push('');
}
if (review.length) {
  md.push('## Review');
  review.slice(0, 100).forEach((x) => md.push(`- ${x}`));
  if (review.length > 100) md.push(`- ... ${review.length - 100} adicionales`);
  md.push('');
}
md.push('## Gate');
md.push('No cargar a Firestore DEV si estado es FAIL. Si estado es REVIEW, requiere aprobacion explicita.');
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log(md.join('\n'));
process.exit(fail.length ? 2 : review.length ? 1 : 0);
