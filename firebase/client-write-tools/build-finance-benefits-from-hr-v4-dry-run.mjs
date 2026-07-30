import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.replace(/^--/, '').split('=');
  return [k, rest.join('=') || true];
}));

const inputPath = path.resolve(String(args.file || path.join(outDir, 'hr-tya-historico-good-firestore-transform-v4.json')));
if (!fs.existsSync(inputPath)) {
  console.error('No existe archivo HR V4:', inputPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const now = new Date().toISOString();
const tenantId = data.tenantId || data.meta?.tenantId || 'tya';

function arr(...names) {
  for (const name of names) {
    const value = data[name] || data.collections?.[name] || data.output?.[name];
    if (Array.isArray(value)) return value;
  }
  return [];
}

const visits = arr('visits', 'visitas');
const liquidations = arr('liquidations', 'liquidaciones');

function idOf(row, keys) {
  for (const k of keys) if (row && row[k] != null && String(row[k]).trim()) return String(row[k]).trim();
  return null;
}

function num(...values) {
  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(String(v).replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function countryOf(row) {
  const raw = String(row.country || row.pais || row.país || row.countryCode || '').toUpperCase();
  if (raw.includes('HN') || raw.includes('HOND')) return 'HN';
  if (raw.includes('GT') || raw.includes('GUAT')) return 'GT';
  const pid = String(row.projectId || row.proyectoId || '').toLowerCase();
  if (pid.includes('hn')) return 'HN';
  return 'GT';
}

function currencyFor(country) {
  return country === 'HN' ? 'HNL' : 'GTQ';
}

function defaultHonorarium(country) {
  return country === 'HN' ? 200 : 60;
}

const liqByVisit = new Map();
for (const l of liquidations) {
  const visitId = idOf(l, ['visitId', 'visitaId', 'sourceVisitId']);
  if (!visitId) continue;
  if (!liqByVisit.has(visitId)) liqByVisit.set(visitId, []);
  liqByVisit.get(visitId).push(l);
}

const benefits = [];
const warnings = [];

for (const v of visits) {
  const visitId = idOf(v, ['visitId', 'id', 'visitaId']);
  if (!visitId) {
    warnings.push({ type: 'visit_without_id', row: v.sourceRowRef || null });
    continue;
  }

  const shopperId = idOf(v, ['shopperId', 'shopper_id', 'evaluadorId']);
  if (!shopperId) {
    warnings.push({ type: 'visit_without_shopperId', visitId });
    continue;
  }

  const country = countryOf(v);
  const currency = currencyFor(country);
  const relatedLiquidations = liqByVisit.get(visitId) || [];
  const l0 = relatedLiquidations[0] || {};

  const honorariumAmount = num(v.honorariumAmount, v.honorario, v.honorarios, l0.honorariumAmount, l0.honorario) || defaultHonorarium(country);
  const ticketReimbursementAmount = num(v.ticketReimbursementAmount, v.boleto, v.reembolsoBoleto, l0.ticketReimbursementAmount, l0.boleto);
  const comboReimbursementAmount = num(v.comboReimbursementAmount, v.combo, v.reembolsoCombo, l0.comboReimbursementAmount, l0.combo);
  const otherReimbursementAmount = num(v.otherReimbursementAmount, l0.otherReimbursementAmount);
  const totalCalculated = honorariumAmount + ticketReimbursementAmount + comboReimbursementAmount + otherReimbursementAmount;

  const projectId = idOf(v, ['projectId', 'proyectoId']) || idOf(l0, ['projectId', 'proyectoId']) || 'unknown-project';
  const periodId = idOf(v, ['periodId', 'periodoId']) || idOf(l0, ['periodId', 'periodoId']) || null;
  const status = String(l0.status || l0.estado || '').toLowerCase().includes('pag') ? 'paid' : 'calculated';

  benefits.push({
    tenantId,
    benefitId: `benefit-${visitId}`.toLowerCase().replace(/[^a-z0-9_-]+/g, '-'),
    projectId,
    periodId,
    visitId,
    shopperId,
    country,
    currency,
    honorariumAmount,
    ticketReimbursementAmount,
    comboReimbursementAmount,
    otherReimbursementAmount,
    totalCalculated,
    status,
    source: 'hr-v4-dry-run',
    sourceVisitId: visitId,
    paymentLotId: idOf(l0, ['paymentLotId', 'lotePagoId']),
    financialMovementId: idOf(l0, ['financialMovementId', 'movementId']),
    createdAt: now,
    updatedAt: now
  });
}

const totals = benefits.reduce((acc, b) => {
  const key = `${b.country}-${b.currency}`;
  acc[key] = acc[key] || { count: 0, total: 0, honorarium: 0, reimbursements: 0 };
  acc[key].count += 1;
  acc[key].total += b.totalCalculated;
  acc[key].honorarium += b.honorariumAmount;
  acc[key].reimbursements += b.ticketReimbursementAmount + b.comboReimbursementAmount + b.otherReimbursementAmount;
  return acc;
}, {});

const output = {
  meta: {
    generatedAt: now,
    mode: 'finance-benefits-from-hr-v4-dry-run-read-only',
    inputPath,
    tenantId,
    note: 'No escribe Firestore. Genera shopperBenefits candidatos desde visitas HR V4.'
  },
  counts: {
    visitsRead: visits.length,
    liquidationsRead: liquidations.length,
    shopperBenefits: benefits.length,
    warnings: warnings.length
  },
  totals,
  shopperBenefits: benefits,
  warnings
};

const outJson = path.join(outDir, 'finance-benefits-from-hr-v4-dry-run.json');
const outMd = path.join(outDir, 'finance-benefits-from-hr-v4-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify(output, null, 2), 'utf8');

const md = [];
md.push('# Finanzas beneficios desde HR V4 — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Visitas leídas: ${visits.length}`);
md.push(`Liquidaciones leídas: ${liquidations.length}`);
md.push(`Beneficios candidatos: ${benefits.length}`);
md.push(`Warnings: ${warnings.length}`);
md.push('');
md.push('## Totales por país/moneda');
for (const [key, value] of Object.entries(totals)) {
  md.push(`- ${key}: ${value.count} beneficios · total ${value.total.toFixed(2)} · honorarios ${value.honorarium.toFixed(2)} · reembolsos ${value.reimbursements.toFixed(2)}`);
}
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
