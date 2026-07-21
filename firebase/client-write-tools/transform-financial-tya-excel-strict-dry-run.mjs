import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [arg.replace(/^--/, ''), true];
}));

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const inputFile = args.file || args.f;
if (!inputFile) {
  console.error('Uso: node firebase/client-write-tools/transform-financial-tya-excel-strict-dry-run.mjs --file="C:\\ruta\\archivo.xlsx" [--hr="firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json"]');
  process.exit(1);
}

const excelPath = path.resolve(String(inputFile));
if (!fs.existsSync(excelPath)) {
  console.error('No existe el archivo Excel:', excelPath);
  process.exit(1);
}

const hrPath = args.hr ? path.resolve(String(args.hr)) : path.join(root, 'firebase', 'private-output', 'hr-tya-historico-good-firestore-transform-v4.json');
const hasHr = fs.existsSync(hrPath);

const now = new Date().toISOString();
const TENANT_ID = 'tya';
const CLIENT_ID = 'cinepolis';

function norm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value) {
  return norm(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function nameKey(value) {
  return norm(value).replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
}

function stableId(...parts) {
  return parts.map((p) => slug(String(p ?? ''))).filter(Boolean).join('__').slice(0, 220);
}

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
  const n = norm(sheetName);
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

function countryFromText(...parts) {
  const n = norm(parts.join(' '));
  if (/\bhn\b|honduras|lempira|\blps\b/.test(n)) return 'HN';
  if (/\bgt\b|guatemala|quetzal|\bq\b/.test(n)) return 'GT';
  return 'GT';
}

function currencyFor(country) {
  return country === 'HN' ? 'L' : 'Q';
}

function isLiquidationSheet(sheetName) {
  return /liquidacion|liquidaci/.test(norm(sheetName));
}

function isAllowedSheet(sheetName) {
  const n = norm(sheetName);
  const period = detectPeriod(sheetName);
  const from2025 = period.year == null || period.year >= 2025;
  if (!from2025) return false;
  if (/\btya\b|\bt&a\b/.test(n)) return true;
  if (isLiquidationSheet(sheetName)) return true;
  if (n === 'may hn 26') return true;
  return false;
}

function rowText(row) {
  return row.map((v) => String(v ?? '').trim()).filter(Boolean).join(' | ');
}

function numbers(row) {
  const out = [];
  for (const value of row) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      out.push(value);
      continue;
    }
    const raw = String(value ?? '').trim();
    if (!raw) continue;
    const cleaned = raw.replace(/[QqLl$]/g, '').replace(/,/g, '').replace(/\s/g, '');
    if (/^-?\d+(\.\d+)?$/.test(cleaned)) out.push(Number(cleaned));
  }
  return out;
}

function amountFromRow(row) {
  const nums = numbers(row).filter((n) => Math.abs(n) > 0);
  if (!nums.length) return 0;
  return nums.reduce((best, n) => Math.abs(n) > Math.abs(best) ? n : best, nums[0]);
}

function firstLikelyName(row) {
  const blocked = /^(concepto|descripcion|descripción|clasificacion|clasificación|valor|pendiente|observaciones|fecha|dia|día|pagador|beneficiario|total|saldo|ingresos|egresos|presupuesto|mes|pais|país)$/i;
  const bad = /(tya|t&a|cinepolis|cinépolis|honorario|honorarios|reembolso|boleto|combo|liquidacion|liquidación|factura|anticipo|remesa|shoppers|shopper|visitas|visita|pagados|pagar|pendiente)/i;
  for (const value of row) {
    const s = String(value ?? '').trim();
    if (!s || s.length < 5) continue;
    if (/\d/.test(s)) continue;
    if (blocked.test(s)) continue;
    if (bad.test(s)) continue;
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) return s;
  }
  return '';
}

function isHeaderOrNoise(text) {
  const n = norm(text);
  if (!n) return true;
  if (/^(concepto|descripcion|descripcion|ingresos|egresos|presupuesto|fecha|total|subtotal|saldo)\b/.test(n)) return true;
  if (/^[-_\s|.]+$/.test(n)) return true;
  return false;
}

function loadHrIndex() {
  const empty = { shoppers: [], byNameKey: new Map(), byId: new Map() };
  if (!hasHr) return empty;
  try {
    const data = JSON.parse(fs.readFileSync(hrPath, 'utf8'));
    const shoppers = Array.isArray(data.shoppers) ? data.shoppers : [];
    const index = { shoppers, byNameKey: new Map(), byId: new Map() };
    for (const s of shoppers) {
      const id = s.id || s.shopperId || '';
      const names = [s.nombre, s.name, s.displayName, s.fullNameCanonical, s.fullName, s.rawName].filter(Boolean);
      if (id) index.byId.set(id, s);
      for (const name of names) {
        const k = nameKey(name);
        if (!k) continue;
        const arr = index.byNameKey.get(k) || [];
        arr.push({ id, shopper: s, sourceName: name, score: 1 });
        index.byNameKey.set(k, arr);
      }
    }
    return index;
  } catch (err) {
    return empty;
  }
}

function matchShopper(rawName, hrIndex) {
  const k = nameKey(rawName);
  if (!k) return { status: 'noName', rawName: '', nameKey: '' };
  const exact = hrIndex.byNameKey.get(k) || [];
  if (exact.length === 1) return { status: 'exact', rawName, nameKey: k, shopperId: exact[0].id, score: 1 };
  if (exact.length > 1) return { status: 'ambiguousExact', rawName, nameKey: k, candidates: exact.map((x) => x.id).filter(Boolean) };

  const tokens = new Set(k.split(' ').filter((t) => t.length > 2));
  const candidates = [];
  for (const [otherKey, arr] of hrIndex.byNameKey.entries()) {
    const otherTokens = new Set(otherKey.split(' ').filter((t) => t.length > 2));
    const common = [...tokens].filter((t) => otherTokens.has(t)).length;
    const score = common / Math.max(tokens.size, otherTokens.size, 1);
    if (score >= 0.67) {
      for (const item of arr) candidates.push({ id: item.id, score, sourceKey: otherKey });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  if (!top) return { status: 'noMatch', rawName, nameKey: k };
  const tied = candidates.filter((c) => Math.abs(c.score - top.score) < 0.01);
  if (tied.length === 1) return { status: 'fuzzy', rawName, nameKey: k, shopperId: top.id, score: top.score, sourceKey: top.sourceKey };
  return { status: 'ambiguousFuzzy', rawName, nameKey: k, candidates: tied.slice(0, 5) };
}

function statusFromText(text) {
  const n = norm(text);
  if (/por pagar|pendiente|saldo/.test(n)) return 'pending';
  if (/pagado|pagada|liquidado|liquidada|cancelado/.test(n)) return 'paid';
  if (/programado/.test(n)) return 'scheduled';
  return 'imported';
}

function classifyStrict({ sheetName, row, rowNumber, hrIndex }) {
  const text = rowText(row);
  if (isHeaderOrNoise(text)) return { target: 'ignoredRows', reason: 'blank_or_header', text };

  const n = norm(text);
  const period = detectPeriod(sheetName);
  const country = countryFromText(sheetName, text);
  const currency = currencyFor(country);
  const amount = amountFromRow(row);
  const rawName = firstLikelyName(row);
  const shopperMatch = matchShopper(rawName, hrIndex);
  const status = statusFromText(text);
  const liquidSheet = isLiquidationSheet(sheetName);

  const source = {
    sheetName,
    rowNumber,
    rowText: text,
    rawRow: row,
  };

  const base = {
    tenantId: TENANT_ID,
    clientId: CLIENT_ID,
    projectFamily: 'cinepolis',
    periodId: period.periodId,
    country,
    currency,
    amountAbs: Math.abs(amount || 0),
    source,
    createdFrom: 'financialExcelStrictDryRun',
    dryRunGeneratedAt: now,
  };

  const issues = [];
  if (!period.periodId) issues.push('period_not_detected');
  if (!amount) issues.push('amount_not_detected');
  if (rawName && !['exact', 'fuzzy'].includes(shopperMatch.status)) issues.push(`shopper_${shopperMatch.status}`);
  if (!rawName && (/honorario|shopper|liquidacion|liquidaci/.test(n) || liquidSheet)) issues.push('shopper_name_not_detected');

  const isHonorarium = /honorario|honorarios|pago visita|pago visitas|shopper|evaluador/.test(n);
  const isReimbursement = /reembolso|boleto|combo|jumbo|consumo/.test(n);
  const isIncome = /ingreso|anticipo|factura|remesa|recibido|cobro|deposito recibido|transferencia recibida|pagador/.test(n);
  const isExpense = /egreso|pago|pagado|transferencia|deposito/.test(n);

  if (liquidSheet || isHonorarium) {
    const benefit = {
      id: stableId('benefit', sheetName, rowNumber, period.periodId, rawName || 'sin-shopper', amount),
      ...base,
      visitId: null,
      shopperId: shopperMatch.shopperId || null,
      shopperRawName: rawName || null,
      shopperNameKey: shopperMatch.nameKey || null,
      shopperMatch,
      honorarium: isHonorarium || liquidSheet ? Math.abs(amount || 0) : 0,
      ticketReimbursement: isReimbursement ? Math.abs(amount || 0) : 0,
      comboReimbursement: 0,
      totalBenefit: Math.abs(amount || 0),
      status: status === 'paid' ? 'paid' : status === 'pending' ? 'readyForPayment' : 'calculated',
      sourceType: liquidSheet ? 'liquidacionSheet' : 'tyaFinancialSheet',
      issues,
    };

    const lot = {
      id: stableId('lot', sheetName, period.periodId, country, status),
      tenantId: TENANT_ID,
      clientId: CLIENT_ID,
      projectFamily: 'cinepolis',
      periodId: period.periodId,
      country,
      currency,
      status: status === 'paid' ? 'paid' : status === 'pending' ? 'draft' : 'imported',
      sourceSheets: [sheetName],
      benefitCandidateIds: [benefit.id],
      amount: Math.abs(amount || 0),
      createdFrom: 'financialExcelStrictDryRun',
      dryRunGeneratedAt: now,
    };

    return {
      target: 'shopperBenefits/paymentLots',
      benefit,
      paymentLot: lot,
      issues,
    };
  }

  if (isIncome || isExpense || isReimbursement) {
    const direction = isIncome && !isExpense ? 'income' : 'expense';
    const category = isReimbursement ? (direction === 'income' ? 'reimbursementIn' : 'reimbursementOut')
      : /remesa/.test(n) ? 'remittanceIn'
      : isHonorarium ? 'honorariumPayment'
      : direction === 'income' ? 'income' : 'operatingExpense';

    const movement = {
      id: stableId('movement', sheetName, rowNumber, period.periodId, country, amount),
      ...base,
      date: null,
      direction,
      amount: direction === 'expense' ? -Math.abs(amount || 0) : Math.abs(amount || 0),
      concept: text.slice(0, 240),
      counterparty: rawName || null,
      category,
      status,
      issues,
    };
    return { target: 'financialMovements', movement, issues };
  }

  return {
    target: 'ignoredRows',
    ignoredRow: {
      id: stableId('ignored', sheetName, rowNumber),
      ...base,
      reason: 'no_strict_category_match',
      text,
      issues,
    },
    issues,
  };
}

function addIssue(issues, item, code, severity = 'review') {
  issues.push({
    code,
    severity,
    ref: item?.id || null,
    source: item?.source || null,
    periodId: item?.periodId || null,
    country: item?.country || null,
    amountAbs: item?.amountAbs || null,
  });
}

const hrIndex = loadHrIndex();
const wb = XLSX.readFile(excelPath, { cellDates: true });
const allowedSheets = wb.SheetNames
  .map((name, idx) => ({ name, index: idx + 1, ref: wb.Sheets[name]?.['!ref'] || 'A1:A1' }))
  .filter((s) => isAllowedSheet(s.name));

const financialMovements = [];
const shopperBenefits = [];
const paymentLotsMap = new Map();
const ignoredRows = [];
const issues = [];
const sheetSummaries = [];

for (const sheet of allowedSheets) {
  const ws = wb.Sheets[sheet.name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  const summary = { sheetName: sheet.name, index: sheet.index, ref: sheet.ref, rows: rows.length, movements: 0, benefits: 0, ignored: 0, issues: 0 };

  rows.forEach((row, idx) => {
    const classified = classifyStrict({ sheetName: sheet.name, row, rowNumber: idx + 1, hrIndex });
    if (classified.movement) {
      financialMovements.push(classified.movement);
      summary.movements += 1;
      for (const code of classified.issues || []) addIssue(issues, classified.movement, code);
    } else if (classified.benefit) {
      shopperBenefits.push(classified.benefit);
      summary.benefits += 1;
      const existing = paymentLotsMap.get(classified.paymentLot.id) || classified.paymentLot;
      existing.amount = (existing.amount || 0) + (classified.paymentLot.amount || 0);
      existing.benefitCandidateIds = Array.from(new Set([...(existing.benefitCandidateIds || []), classified.benefit.id]));
      existing.sourceSheets = Array.from(new Set([...(existing.sourceSheets || []), sheet.name]));
      paymentLotsMap.set(existing.id, existing);
      for (const code of classified.issues || []) addIssue(issues, classified.benefit, code);
    } else if (classified.ignoredRow) {
      ignoredRows.push(classified.ignoredRow);
      summary.ignored += 1;
      for (const code of classified.issues || []) addIssue(issues, classified.ignoredRow, code);
    } else {
      summary.ignored += 1;
    }
  });
  summary.issues = issues.filter((i) => i.source?.sheetName === sheet.name).length;
  sheetSummaries.push(summary);
}

const paymentLots = [...paymentLotsMap.values()];

const reconciliations = [];
for (const lot of paymentLots) {
  const movements = financialMovements.filter((m) => m.periodId === lot.periodId && m.country === lot.country && Math.abs(Math.abs(m.amount || 0) - Math.abs(lot.amount || 0)) <= Math.max(5, Math.abs(lot.amount || 0) * 0.03));
  if (movements.length) {
    reconciliations.push({
      id: stableId('reconciliation', lot.id),
      tenantId: TENANT_ID,
      clientId: CLIENT_ID,
      paymentLotId: lot.id,
      financialMovementIds: movements.map((m) => m.id),
      benefitIds: lot.benefitCandidateIds,
      status: movements.length === 1 ? 'matchedCandidate' : 'multipleCandidates',
      difference: Math.min(...movements.map((m) => Math.abs(Math.abs(m.amount || 0) - Math.abs(lot.amount || 0)))),
      periodId: lot.periodId,
      country: lot.country,
      currency: lot.currency,
      createdFrom: 'financialExcelStrictDryRun',
      dryRunGeneratedAt: now,
    });
  }
}

function summarize(rows, keyFn, amountFn = (x) => x.amountAbs || Math.abs(x.amount || x.totalBenefit || 0)) {
  const out = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'SIN_DATO';
    const cur = out.get(key) || { count: 0, amount: 0 };
    cur.count += 1;
    cur.amount += Number(amountFn(row) || 0);
    out.set(key, cur);
  }
  return Object.fromEntries([...out.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

const output = {
  meta: {
    generatedAt: now,
    mode: 'strict-dry-run-read-only',
    inputFile: excelPath,
    hrIndexUsed: hasHr,
    hrPath: hasHr ? hrPath : null,
    tenantId: TENANT_ID,
    clientId: CLIENT_ID,
    projectFamily: 'cinepolis',
  },
  counts: {
    allowedSheets: allowedSheets.length,
    financialMovements: financialMovements.length,
    shopperBenefits: shopperBenefits.length,
    paymentLots: paymentLots.length,
    reconciliations: reconciliations.length,
    ignoredRows: ignoredRows.length,
    issues: issues.length,
    shopperExactOrFuzzyMatches: shopperBenefits.filter((b) => ['exact', 'fuzzy'].includes(b.shopperMatch?.status)).length,
    shopperUnmatchedOrAmbiguous: shopperBenefits.filter((b) => !['exact', 'fuzzy'].includes(b.shopperMatch?.status)).length,
  },
  summaries: {
    bySheet: sheetSummaries,
    movementsByCountry: summarize(financialMovements, (x) => x.country),
    benefitsByCountry: summarize(shopperBenefits, (x) => x.country, (x) => x.totalBenefit),
    benefitsByStatus: summarize(shopperBenefits, (x) => x.status, (x) => x.totalBenefit),
    issuesByCode: summarize(issues, (x) => x.code, () => 1),
    lotsByCountry: summarize(paymentLots, (x) => x.country, (x) => x.amount),
  },
  financialMovements,
  shopperBenefits,
  paymentLots,
  reconciliations,
  ignoredRows,
  issues,
};

const baseName = 'financial-tya-strict-dry-run';
const jsonPath = path.join(outDir, `${baseName}.json`);
const summaryPath = path.join(outDir, `${baseName}-summary.md`);
const issuesCsvPath = path.join(outDir, `${baseName}-issues.csv`);
const aliasesCsvPath = path.join(outDir, `${baseName}-shopper-aliases.csv`);

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

const money = (n) => Number(n || 0).toLocaleString('es-GT', { maximumFractionDigits: 2 });
const md = [];
md.push('# Transformación estricta financiera TyA — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore. No modifica el Excel.');
md.push('');
md.push(`Archivo: ${excelPath}`);
md.push(`HR index usado: ${hasHr ? 'sí' : 'no'}`);
md.push('');
md.push('## Conteos');
md.push('');
for (const [k, v] of Object.entries(output.counts)) md.push(`- ${k}: ${v}`);
md.push('');
md.push('## Movimientos por país');
md.push('');
md.push('| País | Registros | Monto |');
md.push('|---|---:|---:|');
for (const [k, v] of Object.entries(output.summaries.movementsByCountry)) md.push(`| ${k} | ${v.count} | ${money(v.amount)} |`);
md.push('');
md.push('## Beneficios por país');
md.push('');
md.push('| País | Registros | Monto |');
md.push('|---|---:|---:|');
for (const [k, v] of Object.entries(output.summaries.benefitsByCountry)) md.push(`| ${k} | ${v.count} | ${money(v.amount)} |`);
md.push('');
md.push('## Beneficios por estado');
md.push('');
md.push('| Estado | Registros | Monto |');
md.push('|---|---:|---:|');
for (const [k, v] of Object.entries(output.summaries.benefitsByStatus)) md.push(`| ${k} | ${v.count} | ${money(v.amount)} |`);
md.push('');
md.push('## Issues por código');
md.push('');
md.push('| Código | Conteo |');
md.push('|---|---:|');
for (const [k, v] of Object.entries(output.summaries.issuesByCode)) md.push(`| ${k} | ${v.count} |`);
md.push('');
md.push('## Salidas');
md.push('');
md.push(`- ${jsonPath}`);
md.push(`- ${summaryPath}`);
md.push(`- ${issuesCsvPath}`);
md.push(`- ${aliasesCsvPath}`);
md.push('');
md.push('## Revisión requerida antes de escritura');
md.push('');
md.push('- Resolver nombres de shoppers sin match o ambiguos.');
md.push('- Confirmar que los lotes agrupados por hoja/periodo/país corresponden a pagos reales.');
md.push('- Confirmar que movimientos financieros no incluyan datos personales u otros negocios.');
md.push('- Cruzar con HR V4 por periodo, país, shopper y visita antes de crear Firestore writes.');
fs.writeFileSync(summaryPath, md.join('\n'), 'utf8');

const issueLines = ['code,severity,ref,periodId,country,amountAbs,sheetName,rowNumber'];
for (const i of issues) {
  const row = [i.code, i.severity, i.ref, i.periodId, i.country, i.amountAbs, i.source?.sheetName, i.source?.rowNumber]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  issueLines.push(row.join(','));
}
fs.writeFileSync(issuesCsvPath, issueLines.join('\n'), 'utf8');

const aliasLines = ['benefitId,rawName,nameKey,matchStatus,shopperId,periodId,country,amount,sheetName,rowNumber'];
for (const b of shopperBenefits) {
  const row = [b.id, b.shopperRawName, b.shopperNameKey, b.shopperMatch?.status, b.shopperId, b.periodId, b.country, b.totalBenefit, b.source?.sheetName, b.source?.rowNumber]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  aliasLines.push(row.join(','));
}
fs.writeFileSync(aliasesCsvPath, aliasLines.join('\n'), 'utf8');

console.log(md.join('\n'));
