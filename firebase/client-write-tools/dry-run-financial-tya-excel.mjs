import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [arg.replace(/^--/, ''), true];
}));

const inputFile = args.file || args.f;
if (!inputFile) {
  console.error('Uso: node firebase/client-write-tools/dry-run-financial-tya-excel.mjs --file="C:\\ruta\\archivo.xlsx"');
  process.exit(1);
}

const resolvedFile = path.resolve(String(inputFile));
if (!fs.existsSync(resolvedFile)) {
  console.error('No existe el archivo:', resolvedFile);
  process.exit(1);
}

const normalize = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const slug = (value) => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const monthMap = new Map([
  ['ene', 1], ['enero', 1],
  ['feb', 2], ['febrero', 2],
  ['mar', 3], ['marzo', 3],
  ['abr', 4], ['abril', 4],
  ['may', 5], ['mayo', 5],
  ['jun', 6], ['jn', 6], ['junio', 6],
  ['jul', 7], ['julio', 7],
  ['ago', 8], ['agosto', 8],
  ['sep', 9], ['sept', 9], ['septiembre', 9],
  ['oct', 10], ['octubre', 10],
  ['nov', 11], ['noviembre', 11],
  ['dic', 12], ['diciembre', 12],
]);

function detectPeriod(sheetName) {
  const n = normalize(sheetName);
  let year = null;
  const y4 = n.match(/\b(20\d{2})\b/);
  const y2 = n.match(/\b(24|25|26|27|28|29|30)\b/);
  if (y4) year = Number(y4[1]);
  else if (y2) year = 2000 + Number(y2[1]);
  for (const [key, month] of monthMap.entries()) {
    if (new RegExp(`\\b${key}\\b`).test(n)) {
      return { year, month, periodId: year ? `${year}-${String(month).padStart(2, '0')}` : null };
    }
  }
  return { year, month: null, periodId: year ? String(year) : null };
}

function isTyaSheet(sheetName) {
  const n = normalize(sheetName);
  const hasTya = /\btya\b|\bt&a\b/.test(n);
  const isLiquidacion = /liquidacion|liquidaci/.test(n);
  const isMayHn26 = n === 'may hn 26';
  const period = detectPeriod(sheetName);
  const from2025 = period.year == null || period.year >= 2025;
  if (!from2025 && !isLiquidacion) return false;
  return hasTya || isLiquidacion || isMayHn26;
}

function detectCountry(sheetName, rowText = '') {
  const n = normalize(`${sheetName} ${rowText}`);
  if (/\bhn\b|honduras/.test(n)) return 'HN';
  if (/\bgt\b|guatemala/.test(n)) return 'GT';
  return 'GT';
}

function cellText(row) {
  return row.map((v) => String(v ?? '').trim()).filter(Boolean).join(' | ');
}

function numericValues(row) {
  return row
    .map((v) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      const s = String(v ?? '').replace(/[,QqLl$\s]/g, '').trim();
      if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return null;
      return Number(s);
    })
    .filter((n) => n !== null && Number.isFinite(n));
}

function classifyRow(sheetName, row, index) {
  const text = cellText(row);
  const n = normalize(text);
  const nums = numericValues(row);
  const amountAbs = nums.length ? Math.max(...nums.map((x) => Math.abs(x))) : 0;
  const amountSignedCandidate = nums.length ? nums.find((x) => Math.abs(x) === amountAbs) : 0;

  if (!text) return { kind: 'blank', ignored: true };
  if (/^(total|saldo|subtotal|fecha|concepto|descripcion|descripcion|ingresos|egresos|presupuesto)\b/.test(n)) {
    return { kind: 'headerOrTotal', ignored: true, text };
  }

  const isLiquidationSheet = /liquidacion|liquidaci/.test(normalize(sheetName));
  const country = detectCountry(sheetName, text);
  const period = detectPeriod(sheetName);

  let direction = null;
  let category = 'other';
  let confidence = 0.35;

  if (/honorario|honorarios|shopper|evaluador|liquidacion|liquidaci|pago visitas|pago visita/.test(n)) {
    direction = 'expense';
    category = 'honorariumPayment';
    confidence = 0.75;
  }
  if (/reembolso|boleto|combo|consumo|jombo|jumbo/.test(n)) {
    category = category === 'honorariumPayment' ? 'honorariumAndReimbursement' : 'reimbursement';
    confidence = Math.max(confidence, 0.7);
  }
  if (/remesa|ingreso|factura|cobro|anticipo|recibido|deposito|transferencia.*recib/.test(n)) {
    direction = 'income';
    category = /remesa/.test(n) ? 'remittanceIn' : 'income';
    confidence = Math.max(confidence, 0.65);
  }
  if (/egreso|pago|pagado|transferencia|deposito/.test(n) && !direction) {
    direction = 'expense';
    confidence = Math.max(confidence, 0.55);
  }
  if (isLiquidationSheet) {
    category = category === 'other' ? 'liquidationRow' : category;
    confidence = Math.max(confidence, 0.65);
  }
  if (!amountAbs) confidence = Math.min(confidence, 0.35);

  const suggestedTarget = (() => {
    if (category === 'honorariumPayment' || category === 'honorariumAndReimbursement' || category === 'liquidationRow') return 'paymentLots/shopperBenefits';
    if (category === 'reimbursement' || category === 'remittanceIn' || category === 'income') return 'financialMovements';
    if (direction) return 'financialMovements';
    return 'ignoredRows';
  })();

  return {
    kind: isLiquidationSheet ? 'liquidation' : 'movementCandidate',
    ignored: suggestedTarget === 'ignoredRows',
    sheetName,
    rowNumber: index + 1,
    periodId: period.periodId,
    country,
    currency: country === 'HN' ? 'L' : 'Q',
    direction,
    category,
    amount: amountSignedCandidate || amountAbs || 0,
    amountAbs,
    confidence,
    suggestedTarget,
    text,
    row,
  };
}

function summarizeBy(rows, keyFn) {
  const out = new Map();
  for (const r of rows) {
    const key = keyFn(r) || 'SIN_DATO';
    const cur = out.get(key) || { count: 0, amountAbs: 0 };
    cur.count += 1;
    cur.amountAbs += Number(r.amountAbs || 0);
    out.set(key, cur);
  }
  return Object.fromEntries([...out.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

const wb = XLSX.readFile(resolvedFile, { cellDates: true });
const allSheets = wb.SheetNames.map((name, index) => {
  const ws = wb.Sheets[name];
  const ref = ws['!ref'] || 'A1:A1';
  return { index: index + 1, name, ref, include: isTyaSheet(name), period: detectPeriod(name), country: detectCountry(name) };
});

const includedSheets = allSheets.filter((s) => s.include);
const excludedSheets = allSheets.filter((s) => !s.include);
const classifiedRows = [];
const sheetSummaries = [];

for (const sheet of includedSheets) {
  const ws = wb.Sheets[sheet.name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  const nonEmpty = rows.filter((row) => cellText(row)).length;
  const classifications = rows.map((row, index) => classifyRow(sheet.name, row, index));
  const useful = classifications.filter((r) => !r.ignored);
  classifiedRows.push(...useful);
  sheetSummaries.push({
    index: sheet.index,
    name: sheet.name,
    ref: sheet.ref,
    periodId: sheet.period.periodId,
    country: sheet.country,
    rows: rows.length,
    nonEmpty,
    classified: useful.length,
    liquidationRows: useful.filter((r) => r.kind === 'liquidation').length,
    movementCandidates: useful.filter((r) => r.kind === 'movementCandidate').length,
  });
}

const lowConfidence = classifiedRows.filter((r) => r.confidence < 0.6);
const byPeriod = summarizeBy(classifiedRows, (r) => r.periodId);
const byCountry = summarizeBy(classifiedRows, (r) => r.country);
const byCategory = summarizeBy(classifiedRows, (r) => r.category);
const byTarget = summarizeBy(classifiedRows, (r) => r.suggestedTarget);

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'dry-run-read-only',
  inputFile: resolvedFile,
  workbook: {
    sheetCount: allSheets.length,
    includedSheetCount: includedSheets.length,
    excludedSheetCount: excludedSheets.length,
  },
  includedSheets: sheetSummaries,
  excludedSheets: excludedSheets.map((s) => ({ index: s.index, name: s.name, ref: s.ref })),
  totals: {
    classifiedRows: classifiedRows.length,
    lowConfidenceRows: lowConfidence.length,
    liquidationRows: classifiedRows.filter((r) => r.kind === 'liquidation').length,
    movementCandidates: classifiedRows.filter((r) => r.kind === 'movementCandidate').length,
  },
  byPeriod,
  byCountry,
  byCategory,
  byTarget,
  samples: {
    lowConfidence: lowConfidence.slice(0, 100),
    classified: classifiedRows.slice(0, 100),
  },
};

const outJson = path.join(outDir, 'financial-tya-dry-run-details.json');
const outMd = path.join(outDir, 'financial-tya-dry-run-summary.md');
const outCsv = path.join(outDir, 'financial-tya-low-confidence-rows.csv');

fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const fmtMoney = (n) => Number(n || 0).toLocaleString('es-GT', { maximumFractionDigits: 2 });
const lines = [];
lines.push('# Dry-run financiero TyA');
lines.push('');
lines.push('Modo: solo lectura. No escribe Firestore. No modifica el Excel.');
lines.push('');
lines.push(`Archivo: ${resolvedFile}`);
lines.push(`Hojas totales workbook: ${allSheets.length}`);
lines.push(`Hojas incluidas TyA/TyA HN/Liquidación: ${includedSheets.length}`);
lines.push(`Hojas excluidas: ${excludedSheets.length}`);
lines.push('');
lines.push('## Totales');
lines.push('');
lines.push(`- Filas clasificadas: ${classifiedRows.length}`);
lines.push(`- Filas baja confianza: ${lowConfidence.length}`);
lines.push(`- Filas Liquidación: ${result.totals.liquidationRows}`);
lines.push(`- Candidatos movimientos: ${result.totals.movementCandidates}`);
lines.push('');
lines.push('## Hojas incluidas');
lines.push('');
lines.push('| # | Hoja | Rango | Periodo | País | Filas no vacías | Clasificadas | Liquidación | Movimiento |');
lines.push('|---:|---|---|---|---|---:|---:|---:|---:|');
for (const s of sheetSummaries) {
  lines.push(`| ${s.index} | ${s.name} | ${s.ref} | ${s.periodId || ''} | ${s.country} | ${s.nonEmpty} | ${s.classified} | ${s.liquidationRows} | ${s.movementCandidates} |`);
}
lines.push('');
lines.push('## Agrupación por país');
lines.push('');
lines.push('| País | Filas | Monto absoluto detectado |');
lines.push('|---|---:|---:|');
for (const [k, v] of Object.entries(byCountry)) lines.push(`| ${k} | ${v.count} | ${fmtMoney(v.amountAbs)} |`);
lines.push('');
lines.push('## Agrupación por periodo');
lines.push('');
lines.push('| Periodo | Filas | Monto absoluto detectado |');
lines.push('|---|---:|---:|');
for (const [k, v] of Object.entries(byPeriod)) lines.push(`| ${k} | ${v.count} | ${fmtMoney(v.amountAbs)} |`);
lines.push('');
lines.push('## Agrupación por categoría');
lines.push('');
lines.push('| Categoría | Filas | Monto absoluto detectado |');
lines.push('|---|---:|---:|');
for (const [k, v] of Object.entries(byCategory)) lines.push(`| ${k} | ${v.count} | ${fmtMoney(v.amountAbs)} |`);
lines.push('');
lines.push('## Destino sugerido');
lines.push('');
lines.push('| Destino | Filas | Monto absoluto detectado |');
lines.push('|---|---:|---:|');
for (const [k, v] of Object.entries(byTarget)) lines.push(`| ${k} | ${v.count} | ${fmtMoney(v.amountAbs)} |`);
lines.push('');
lines.push('## Advertencias');
lines.push('');
lines.push('- Este dry-run usa heurística inicial. No debe usarse para escritura directa.');
lines.push('- Debe revisarse cualquier fila de baja confianza antes de cargar datos.');
lines.push('- Debe confirmarse que no entraron datos personales ni de otros negocios.');
lines.push('- Los montos absolutos son para diagnóstico, no conciliación final.');
lines.push('');
lines.push('## Archivos generados');
lines.push('');
lines.push(`- ${outMd}`);
lines.push(`- ${outJson}`);
lines.push(`- ${outCsv}`);

fs.writeFileSync(outMd, lines.join('\n'), 'utf8');

const csvLines = ['sheetName,rowNumber,periodId,country,currency,category,suggestedTarget,confidence,amountAbs,text'];
for (const r of lowConfidence) {
  const vals = [r.sheetName, r.rowNumber, r.periodId, r.country, r.currency, r.category, r.suggestedTarget, r.confidence, r.amountAbs, r.text]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  csvLines.push(vals.join(','));
}
fs.writeFileSync(outCsv, csvLines.join('\n'), 'utf8');

console.log(lines.join('\n'));
if (lowConfidence.length) {
  console.log('');
  console.log(`Revisar filas de baja confianza: ${outCsv}`);
}
