import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
const inputPath = path.join(outDir, 'finance-benefits-from-hr-v4-dry-run.json');

if (!fs.existsSync(inputPath)) {
  console.error('No existe dry-run de beneficios:', inputPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const benefits = Array.isArray(data.shopperBenefits) ? data.shopperBenefits : [];
const fail = [];
const review = [];

const ids = new Set();
for (const b of benefits) {
  if (!b.benefitId) fail.push('benefit_missing_id');
  if (ids.has(b.benefitId)) fail.push(`${b.benefitId}:duplicate_benefitId`);
  ids.add(b.benefitId);
  if (!b.tenantId) fail.push(`${b.benefitId}:missing_tenantId`);
  if (!b.projectId) fail.push(`${b.benefitId}:missing_projectId`);
  if (!b.visitId) fail.push(`${b.benefitId}:missing_visitId`);
  if (!b.shopperId) fail.push(`${b.benefitId}:missing_shopperId`);
  if (!['GT', 'HN', 'OTHER'].includes(b.country)) fail.push(`${b.benefitId}:invalid_country:${b.country}`);
  if (!['GTQ', 'HNL', 'USD', 'OTHER'].includes(b.currency)) fail.push(`${b.benefitId}:invalid_currency:${b.currency}`);
  if (typeof b.totalCalculated !== 'number') fail.push(`${b.benefitId}:total_not_number`);
  if (b.totalCalculated < 0) fail.push(`${b.benefitId}:negative_total`);
  if (b.country === 'HN' && b.currency !== 'HNL') fail.push(`${b.benefitId}:hn_currency_not_hnl`);
  if (b.country === 'GT' && b.currency !== 'GTQ') fail.push(`${b.benefitId}:gt_currency_not_gtq`);
  if (b.country === 'HN' && b.honorariumAmount !== 200) review.push(`${b.benefitId}:hn_honorarium_not_200:${b.honorariumAmount}`);
  if (b.country === 'GT' && b.honorariumAmount !== 60) review.push(`${b.benefitId}:gt_honorarium_not_60:${b.honorariumAmount}`);
  if (b.status === 'paid' && !b.paymentLotId && !b.financialMovementId) review.push(`${b.benefitId}:paid_without_lot_or_movement`);
}

if (!benefits.length) fail.push('no_benefits_generated');

const byCountry = benefits.reduce((acc, b) => {
  acc[b.country] = acc[b.country] || { count: 0, total: 0 };
  acc[b.country].count += 1;
  acc[b.country].total += b.totalCalculated || 0;
  return acc;
}, {});

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'finance-benefits-from-hr-v4-validation-read-only',
  inputPath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: {
    shopperBenefits: benefits.length,
    fail: fail.length,
    review: review.length
  },
  byCountry,
  fail,
  review
};

const outJson = path.join(outDir, 'finance-benefits-from-hr-v4-validation.json');
const outMd = path.join(outDir, 'finance-benefits-from-hr-v4-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación beneficios desde HR V4');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`Beneficios: ${benefits.length}`);
md.push(`Fail: ${fail.length}`);
md.push(`Review: ${review.length}`);
md.push('');
md.push('## Por país');
for (const [country, v] of Object.entries(byCountry)) md.push(`- ${country}: ${v.count} · total ${v.total.toFixed(2)}`);
md.push('');
if (fail.length) {
  md.push('## Fail');
  fail.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
if (review.length) {
  md.push('## Review');
  review.slice(0, 100).forEach((x) => md.push(`- ${x}`));
  if (review.length > 100) md.push(`- ... ${review.length - 100} adicionales`);
  md.push('');
}
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log(md.join('\n'));
process.exit(fail.length ? 2 : review.length ? 1 : 0);
