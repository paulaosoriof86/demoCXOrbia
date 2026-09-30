import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [arg.replace(/^--/, ''), true];
}));

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const financialPath = path.resolve(String(args.financial || path.join(outDir, 'financial-tya-strict-dry-run.json')));
const crosscheckPath = path.resolve(String(args.crosscheck || path.join(outDir, 'financial-tya-strict-vs-hr-v4-crosscheck.json')));

if (!fs.existsSync(financialPath)) {
  console.error('No existe financial strict dry-run:', financialPath);
  process.exit(1);
}
if (!fs.existsSync(crosscheckPath)) {
  console.error('No existe crosscheck:', crosscheckPath);
  process.exit(1);
}

const financial = JSON.parse(fs.readFileSync(financialPath, 'utf8'));
const crosscheck = JSON.parse(fs.readFileSync(crosscheckPath, 'utf8'));
const generatedAt = new Date().toISOString();

function slug(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stableId(...parts) {
  return parts.map((p) => slug(String(p ?? ''))).filter(Boolean).join('__').slice(0, 220);
}

function projectIdFor(item) {
  const country = item.country || 'GT';
  const period = item.periodId || 'sin-periodo';
  return stableId('cinepolis', period, country.toLowerCase());
}

function pathFor(projectId, collection, id) {
  return `tenants/tya/projects/${projectId}/${collection}/${id}`;
}

const benefits = Array.isArray(financial.shopperBenefits) ? financial.shopperBenefits : [];
const movements = Array.isArray(financial.financialMovements) ? financial.financialMovements : [];
const lots = Array.isArray(financial.paymentLots) ? financial.paymentLots : [];
const matched = Array.isArray(crosscheck.benefitMatches) ? crosscheck.benefitMatches : [];
const matchedByBenefit = new Map(matched.map((m) => [m.benefitId, m]));

const writePlan = [];
const skipped = [];
const warnings = [];

const importBatchId = stableId('financial-tya', generatedAt.slice(0, 10), 'dry-run');

writePlan.push({
  op: 'set',
  path: `tenants/tya/auditLogs/${importBatchId}`,
  data: {
    id: importBatchId,
    tenantId: 'tya',
    type: 'financialImportDryRunWritePlan',
    status: 'plannedOnly',
    source: 'financial-tya-strict-dry-run',
    generatedAt,
    writesCount: null,
    note: 'Write-plan de solo lectura; no ejecutar sin autorizacion explicita.',
  },
});

for (const benefit of benefits) {
  const match = matchedByBenefit.get(benefit.id);
  if (!match) {
    skipped.push({ type: 'shopperBenefit', id: benefit.id, reason: 'no_crosscheck_match', source: benefit.source });
    continue;
  }
  const projectId = projectIdFor(benefit);
  const id = stableId('benefit', benefit.periodId, benefit.country, match.matchedVisitId, benefit.shopperId || match.shopperId || benefit.shopperNameKey, benefit.id);
  const data = {
    id,
    tenantId: 'tya',
    clientId: 'cinepolis',
    projectId,
    sourceBenefitId: benefit.id,
    visitId: match.matchedVisitId,
    shopperId: benefit.shopperId || match.shopperId,
    country: benefit.country,
    currency: benefit.currency,
    periodId: benefit.periodId,
    honorarium: Number(benefit.honorarium || 0),
    ticketReimbursement: Number(benefit.ticketReimbursement || 0),
    comboReimbursement: Number(benefit.comboReimbursement || 0),
    totalBenefit: Number(benefit.totalBenefit || 0),
    status: benefit.status || 'calculated',
    source: {
      type: benefit.sourceType || 'financialExcelStrictDryRun',
      sheetName: benefit.source?.sheetName || null,
      rowNumber: benefit.source?.rowNumber || null,
      importBatchId,
    },
    match: {
      score: match.matchScore,
      reasons: match.matchReasons || [],
    },
    createdAt: '__SERVER_TIMESTAMP__',
    updatedAt: '__SERVER_TIMESTAMP__',
  };
  writePlan.push({ op: 'set', path: pathFor(projectId, 'shopperBenefits', id), data });
}

for (const movement of movements) {
  const flags = [];
  const text = `${movement.concept || ''} ${movement.source?.rowText || ''}`.toLowerCase();
  if (/novex|restaurante|prestamo|préstamo|tarjeta|personal|costa rica/.test(text)) flags.push('possible_out_of_scope');
  if (flags.length) {
    skipped.push({ type: 'financialMovement', id: movement.id, reason: flags.join(','), source: movement.source });
    continue;
  }
  const projectId = projectIdFor(movement);
  const id = stableId('movement', movement.periodId, movement.country, movement.id);
  const data = {
    id,
    tenantId: 'tya',
    clientId: 'cinepolis',
    projectId,
    sourceMovementId: movement.id,
    date: movement.date || null,
    periodId: movement.periodId,
    country: movement.country,
    currency: movement.currency,
    amount: Number(movement.amount || 0),
    direction: movement.direction,
    concept: movement.concept || '',
    counterparty: movement.counterparty || null,
    category: movement.category || 'other',
    status: movement.status || 'imported',
    source: {
      sheetName: movement.source?.sheetName || null,
      rowNumber: movement.source?.rowNumber || null,
      importBatchId,
    },
    createdAt: '__SERVER_TIMESTAMP__',
    updatedAt: '__SERVER_TIMESTAMP__',
  };
  if (!data.periodId || !data.country || !data.currency) warnings.push({ type: 'financialMovement', id, reason: 'missing_period_country_or_currency' });
  writePlan.push({ op: 'set', path: pathFor(projectId, 'financialMovements', id), data });
}

for (const lot of lots) {
  const benefitIds = lot.benefitCandidateIds || lot.benefitIds || [];
  const matchedBenefitIds = benefitIds.filter((id) => matchedByBenefit.has(id));
  if (!matchedBenefitIds.length) {
    skipped.push({ type: 'paymentLot', id: lot.id, reason: 'no_matched_benefits' });
    continue;
  }
  const projectId = projectIdFor(lot);
  const id = stableId('lot', lot.periodId, lot.country, lot.id);
  const data = {
    id,
    tenantId: 'tya',
    clientId: 'cinepolis',
    projectId,
    sourceLotId: lot.id,
    periodId: lot.periodId,
    country: lot.country,
    currency: lot.currency,
    benefitIds: matchedBenefitIds.map((bid) => stableId('benefit', (benefits.find((b) => b.id === bid) || {}).periodId, (benefits.find((b) => b.id === bid) || {}).country, (matchedByBenefit.get(bid) || {}).matchedVisitId, (benefits.find((b) => b.id === bid) || {}).shopperId || (matchedByBenefit.get(bid) || {}).shopperId || (benefits.find((b) => b.id === bid) || {}).shopperNameKey, bid)),
    sourceBenefitIds: matchedBenefitIds,
    amount: Number(lot.amount || 0),
    status: lot.status || 'imported',
    source: {
      sourceSheets: lot.sourceSheets || [],
      importBatchId,
    },
    createdAt: '__SERVER_TIMESTAMP__',
    updatedAt: '__SERVER_TIMESTAMP__',
  };
  writePlan.push({ op: 'set', path: pathFor(projectId, 'paymentLots', id), data });
}

const byCollection = {};
for (const op of writePlan) {
  const parts = op.path.split('/');
  const col = parts[parts.length - 2] || 'unknown';
  byCollection[col] = (byCollection[col] || 0) + 1;
}

const output = {
  meta: {
    generatedAt,
    mode: 'write-plan-dry-run-only',
    financialPath,
    crosscheckPath,
    importBatchId,
    rules: [
      'No ejecutar sin autorizacion explicita.',
      'Solo incluye shopperBenefits con match crosscheck.',
      'Excluye movements con possible_out_of_scope.',
      'No escribe Firestore.',
    ],
  },
  counts: {
    writeOps: writePlan.length,
    skipped: skipped.length,
    warnings: warnings.length,
    byCollection,
  },
  writePlan,
  skipped,
  warnings,
};

const outJson = path.join(outDir, 'financial-tya-write-plan-dry-run.json');
const outMd = path.join(outDir, 'financial-tya-write-plan-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify(output, null, 2), 'utf8');

const md = [];
md.push('# Write-plan financiero TyA — dry-run');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push(`Import batch candidato: ${importBatchId}`);
md.push('');
md.push('## Conteos');
Object.entries(output.counts).forEach(([k, v]) => {
  if (k !== 'byCollection') md.push(`- ${k}: ${v}`);
});
md.push('');
md.push('## Operaciones por colección');
md.push('| Colección | Ops |');
md.push('|---|---:|');
Object.entries(byCollection).forEach(([k, v]) => md.push(`| ${k} | ${v} |`));
md.push('');
md.push('## Skips y warnings');
md.push(`- skipped: ${skipped.length}`);
md.push(`- warnings: ${warnings.length}`);
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
md.push('');
md.push('## Regla');
md.push('Este archivo es un plan de escritura candidato. No debe ejecutarse ni convertirse en carga real sin revisión de Paula y autorización explícita de escritura en Firestore DEV.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(skipped.length || warnings.length ? 1 : 0);
