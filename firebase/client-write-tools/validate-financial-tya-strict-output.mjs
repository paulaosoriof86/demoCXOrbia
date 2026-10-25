import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [arg.replace(/^--/, ''), true];
}));

const root = process.cwd();
const input = path.resolve(String(args.file || path.join(root, 'firebase', 'private-output', 'financial-tya-strict-dry-run.json')));
if (!fs.existsSync(input)) {
  console.error('No existe output strict dry-run:', input);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
const fail = [];
const warn = [];

function arr(name) {
  return Array.isArray(data[name]) ? data[name] : [];
}

function requireArray(name) {
  if (!Array.isArray(data[name])) fail.push(`missing_array:${name}`);
}

['financialMovements', 'shopperBenefits', 'paymentLots', 'reconciliations', 'ignoredRows', 'issues'].forEach(requireArray);

const movements = arr('financialMovements');
const benefits = arr('shopperBenefits');
const lots = arr('paymentLots');
const reconciliations = arr('reconciliations');
const issues = arr('issues');

function checkCommon(x, type) {
  if (!x.id) fail.push(`${type}:missing_id`);
  if (!x.tenantId) fail.push(`${type}:missing_tenantId:${x.id || 'no-id'}`);
  if (!x.country) warn.push(`${type}:missing_country:${x.id || 'no-id'}`);
  if (!x.currency) warn.push(`${type}:missing_currency:${x.id || 'no-id'}`);
  if (!x.periodId) warn.push(`${type}:missing_periodId:${x.id || 'no-id'}`);
}

for (const m of movements) {
  checkCommon(m, 'movement');
  if (!['income', 'expense'].includes(m.direction)) fail.push(`movement:invalid_direction:${m.id}`);
  if (typeof m.amount !== 'number') fail.push(`movement:amount_not_number:${m.id}`);
  if (m.direction === 'expense' && m.amount > 0) warn.push(`movement:expense_positive:${m.id}`);
  if (m.direction === 'income' && m.amount < 0) warn.push(`movement:income_negative:${m.id}`);
}

for (const b of benefits) {
  checkCommon(b, 'benefit');
  if (!b.shopperId) warn.push(`benefit:missing_shopperId:${b.id}`);
  if (typeof b.totalBenefit !== 'number') fail.push(`benefit:total_not_number:${b.id}`);
  if (b.totalBenefit < 0) fail.push(`benefit:negative_total:${b.id}`);
  if (!b.status) warn.push(`benefit:missing_status:${b.id}`);
}

for (const l of lots) {
  checkCommon(l, 'lot');
  if (typeof l.amount !== 'number') fail.push(`lot:amount_not_number:${l.id}`);
  if (!Array.isArray(l.benefitCandidateIds) && !Array.isArray(l.benefitIds)) warn.push(`lot:missing_benefits:${l.id}`);
}

for (const r of reconciliations) {
  if (!r.id) fail.push('reconciliation:missing_id');
  if (!r.status) warn.push(`reconciliation:missing_status:${r.id || 'no-id'}`);
  if (!Array.isArray(r.financialMovementIds)) warn.push(`reconciliation:missing_movements:${r.id || 'no-id'}`);
}

const benefitIds = new Set(benefits.map((b) => b.id));
for (const l of lots) {
  for (const bid of (l.benefitCandidateIds || l.benefitIds || [])) {
    if (!benefitIds.has(bid)) warn.push(`lot:benefit_ref_not_found:${l.id}:${bid}`);
  }
}

const personalPatterns = [/novex/i, /restaurante/i, /prestamo/i, /préstamo/i, /tarjeta/i, /costa rica/i];
for (const m of movements) {
  const txt = `${m.concept || ''} ${m.source?.rowText || ''}`;
  if (personalPatterns.some((re) => re.test(txt))) warn.push(`movement:possible_out_of_scope:${m.id}`);
}

const summary = {
  input,
  status: fail.length ? 'FAIL' : warn.length ? 'REVIEW' : 'OK',
  counts: {
    financialMovements: movements.length,
    shopperBenefits: benefits.length,
    paymentLots: lots.length,
    reconciliations: reconciliations.length,
    issues: issues.length,
    fail: fail.length,
    warn: warn.length,
  },
  fail: fail.slice(0, 500),
  warn: warn.slice(0, 1000),
};

const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'financial-tya-strict-dry-run-validation.json');
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

console.log('# Validación strict dry-run financiero TyA');
console.log('');
console.log(`Estado: ${summary.status}`);
console.log('');
console.log('## Conteos');
for (const [k, v] of Object.entries(summary.counts)) console.log(`- ${k}: ${v}`);
console.log('');
if (fail.length) {
  console.log('## FAIL');
  fail.slice(0, 80).forEach((x) => console.log(`- ${x}`));
}
if (warn.length) {
  console.log('## REVIEW');
  warn.slice(0, 120).forEach((x) => console.log(`- ${x}`));
}
console.log('');
console.log(`JSON: ${outPath}`);
process.exit(fail.length ? 2 : warn.length ? 1 : 0);
