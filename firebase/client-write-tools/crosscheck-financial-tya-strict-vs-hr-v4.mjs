import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [arg.replace(/^--/, ''), true];
}));

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

const financialPath = path.resolve(String(args.financial || args.file || path.join(outDir, 'financial-tya-strict-dry-run.json')));
const hrPath = path.resolve(String(args.hr || path.join(outDir, 'hr-tya-historico-good-firestore-transform-v4.json')));

if (!fs.existsSync(financialPath)) {
  console.error('No existe financial strict dry-run:', financialPath);
  process.exit(1);
}
if (!fs.existsSync(hrPath)) {
  console.error('No existe HR V4 JSON:', hrPath);
  process.exit(1);
}

const financial = JSON.parse(fs.readFileSync(financialPath, 'utf8'));
const hr = JSON.parse(fs.readFileSync(hrPath, 'utf8'));

function norm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function nameKey(value) {
  return norm(value).replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
}

function slug(value) {
  return norm(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stableId(...parts) {
  return parts.map((p) => slug(String(p ?? ''))).filter(Boolean).join('__').slice(0, 220);
}

function arr(name, obj = hr) {
  return Array.isArray(obj?.[name]) ? obj[name] : [];
}

function projectPeriodId(project) {
  return project.periodId || project.period || project.monthId || project.id || null;
}

function visitPeriodId(visit) {
  return visit.periodId || visit.projectId || visit.projectRef || null;
}

function visitCountry(visit) {
  return visit.country || visit.pais || visit.countryCode || null;
}

function visitShopperId(visit) {
  return visit.shopperId || visit.evaluatorId || visit.shopper || null;
}

function visitBranchKey(visit) {
  return slug([visit.sucursal, visit.branch, visit.city, visit.ciudad].filter(Boolean).join(' '));
}

function shopperDisplayName(s) {
  return s.displayName || s.nombre || s.name || s.fullNameCanonical || s.fullName || '';
}

const shoppers = arr('shoppers');
const visits = arr('visits');
const projects = arr('projects');
const questionnaires = arr('questionnaires');
const hrLiquidations = arr('liquidations');

const shoppersById = new Map();
const shoppersByNameKey = new Map();
for (const s of shoppers) {
  const id = s.id || s.shopperId;
  if (id) shoppersById.set(id, s);
  const names = [shopperDisplayName(s), s.rawName, s.name, s.nombre, s.displayName, ...(Array.isArray(s.aliases) ? s.aliases : [])].filter(Boolean);
  for (const raw of names) {
    const k = nameKey(typeof raw === 'string' ? raw : raw.rawName || raw.name || '');
    if (!k) continue;
    const list = shoppersByNameKey.get(k) || [];
    list.push({ shopperId: id, shopper: s, rawName: raw });
    shoppersByNameKey.set(k, list);
  }
}

const visitsByShopperPeriodCountry = new Map();
const visitsByPeriodCountry = new Map();
for (const v of visits) {
  const shopperId = visitShopperId(v);
  const periodId = visitPeriodId(v);
  const country = visitCountry(v);
  const key1 = `${shopperId || 'NO_SHOPPER'}|${periodId || 'NO_PERIOD'}|${country || 'NO_COUNTRY'}`;
  const key2 = `${periodId || 'NO_PERIOD'}|${country || 'NO_COUNTRY'}`;
  if (!visitsByShopperPeriodCountry.has(key1)) visitsByShopperPeriodCountry.set(key1, []);
  if (!visitsByPeriodCountry.has(key2)) visitsByPeriodCountry.set(key2, []);
  visitsByShopperPeriodCountry.get(key1).push(v);
  visitsByPeriodCountry.get(key2).push(v);
}

const questionnairesByVisit = new Map();
for (const q of questionnaires) {
  const visitId = q.visitId || q.visitaId;
  if (!visitId) continue;
  const list = questionnairesByVisit.get(visitId) || [];
  list.push(q);
  questionnairesByVisit.set(visitId, list);
}

const benefits = Array.isArray(financial.shopperBenefits) ? financial.shopperBenefits : [];
const movements = Array.isArray(financial.financialMovements) ? financial.financialMovements : [];
const lots = Array.isArray(financial.paymentLots) ? financial.paymentLots : [];

const benefitMatches = [];
const unmatchedBenefits = [];
const ambiguousBenefits = [];
const orphanPaymentLots = [];
const movementReview = [];
const issues = [];

function resolveShopper(benefit) {
  if (benefit.shopperId && shoppersById.has(benefit.shopperId)) {
    return { status: 'byId', shopperId: benefit.shopperId, candidates: [benefit.shopperId] };
  }
  const k = benefit.shopperNameKey || nameKey(benefit.shopperRawName || '');
  if (!k) return { status: 'noName', candidates: [] };
  const exact = shoppersByNameKey.get(k) || [];
  if (exact.length === 1) return { status: 'byExactName', shopperId: exact[0].shopperId, candidates: [exact[0].shopperId] };
  if (exact.length > 1) return { status: 'ambiguousName', candidates: exact.map((x) => x.shopperId).filter(Boolean) };
  return { status: 'noShopperMatch', candidates: [] };
}

function scoreVisit(benefit, visit) {
  let score = 0;
  const reasons = [];
  if ((benefit.periodId || '') === (visitPeriodId(visit) || '')) { score += 30; reasons.push('period'); }
  if ((benefit.country || '') === (visitCountry(visit) || '')) { score += 25; reasons.push('country'); }
  if (benefit.shopperId && benefit.shopperId === visitShopperId(visit)) { score += 30; reasons.push('shopperId'); }
  const raw = norm(`${benefit.source?.rowText || ''} ${benefit.shopperRawName || ''}`);
  const branchParts = [visit.sucursal, visit.branch, visit.ciudad, visit.city].filter(Boolean).map(norm).filter(Boolean);
  if (branchParts.some((p) => p.length >= 5 && raw.includes(p))) { score += 10; reasons.push('branchText'); }
  const expectedHonorarium = Number(visit.honorario || visit.honorarium || 0);
  if (expectedHonorarium && Math.abs(expectedHonorarium - Number(benefit.honorarium || benefit.totalBenefit || 0)) <= 5) { score += 5; reasons.push('amountClose'); }
  return { score, reasons };
}

for (const b of benefits) {
  const shopperResolution = resolveShopper(b);
  const shopperId = shopperResolution.shopperId || b.shopperId || null;
  const periodId = b.periodId || null;
  const country = b.country || null;
  const key = `${shopperId || 'NO_SHOPPER'}|${periodId || 'NO_PERIOD'}|${country || 'NO_COUNTRY'}`;
  const fallbackKey = `${periodId || 'NO_PERIOD'}|${country || 'NO_COUNTRY'}`;
  const candidates = shopperId ? (visitsByShopperPeriodCountry.get(key) || []) : (visitsByPeriodCountry.get(fallbackKey) || []);
  const scored = candidates.map((v) => ({ visitId: v.id || v.visitId, projectId: v.projectId, score: scoreVisit(b, v).score, reasons: scoreVisit(b, v).reasons })).sort((a, c) => c.score - a.score);
  const top = scored[0];
  const match = {
    benefitId: b.id,
    shopperRawName: b.shopperRawName || null,
    shopperId,
    shopperResolution,
    periodId,
    country,
    currency: b.currency,
    totalBenefit: b.totalBenefit,
    status: b.status,
    candidateCount: scored.length,
    topCandidates: scored.slice(0, 5),
    source: b.source,
  };
  if (!shopperId) {
    unmatchedBenefits.push({ ...match, reason: shopperResolution.status });
    issues.push({ code: 'benefit_without_shopper_match', severity: 'review', benefitId: b.id, source: b.source });
  } else if (!top) {
    unmatchedBenefits.push({ ...match, reason: 'no_visit_candidate' });
    issues.push({ code: 'benefit_without_visit_candidate', severity: 'review', benefitId: b.id, source: b.source });
  } else if (top.score >= 75) {
    benefitMatches.push({ ...match, matchedVisitId: top.visitId, matchScore: top.score, matchReasons: top.reasons });
  } else if (top.score >= 50) {
    ambiguousBenefits.push({ ...match, reason: 'weak_visit_match', matchedVisitId: top.visitId, matchScore: top.score, matchReasons: top.reasons });
    issues.push({ code: 'benefit_weak_visit_match', severity: 'review', benefitId: b.id, source: b.source });
  } else {
    unmatchedBenefits.push({ ...match, reason: 'low_score_visit_match', matchedVisitId: top.visitId, matchScore: top.score, matchReasons: top.reasons });
    issues.push({ code: 'benefit_low_score_visit_match', severity: 'review', benefitId: b.id, source: b.source });
  }
}

const benefitIdSet = new Set(benefits.map((b) => b.id));
for (const lot of lots) {
  const ids = lot.benefitCandidateIds || lot.benefitIds || [];
  const missing = ids.filter((id) => !benefitIdSet.has(id));
  const matched = ids.filter((id) => benefitMatches.some((m) => m.benefitId === id));
  if (missing.length || matched.length !== ids.length) {
    orphanPaymentLots.push({ lotId: lot.id, periodId: lot.periodId, country: lot.country, amount: lot.amount, totalBenefitIds: ids.length, matchedBenefitIds: matched.length, missingBenefitIds: missing });
    issues.push({ code: 'payment_lot_requires_review', severity: 'review', lotId: lot.id, periodId: lot.periodId, country: lot.country });
  }
}

for (const movement of movements) {
  const text = `${movement.concept || ''} ${movement.source?.rowText || ''}`;
  const n = norm(text);
  const flags = [];
  if (/novex|restaurante|prestamo|prestamo|tarjeta|personal|costa rica|banco/.test(n)) flags.push('possible_out_of_scope');
  if (!movement.periodId) flags.push('missing_period');
  if (!movement.country) flags.push('missing_country');
  if (!movement.currency) flags.push('missing_currency');
  if (flags.length) {
    movementReview.push({ movementId: movement.id, flags, periodId: movement.periodId, country: movement.country, amount: movement.amount, source: movement.source });
    flags.forEach((flag) => issues.push({ code: `movement_${flag}`, severity: 'review', movementId: movement.id, source: movement.source }));
  }
}

function summarize(rows, keyFn, amountFn = (x) => x.totalBenefit || Math.abs(x.amount || 0)) {
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
    generatedAt: new Date().toISOString(),
    mode: 'crosscheck-read-only',
    financialPath,
    hrPath,
  },
  hrCounts: {
    projects: projects.length,
    shoppers: shoppers.length,
    visits: visits.length,
    questionnaires: questionnaires.length,
    liquidations: hrLiquidations.length,
  },
  financialCounts: {
    benefits: benefits.length,
    movements: movements.length,
    lots: lots.length,
  },
  crosscheckCounts: {
    benefitMatches: benefitMatches.length,
    ambiguousBenefits: ambiguousBenefits.length,
    unmatchedBenefits: unmatchedBenefits.length,
    orphanPaymentLots: orphanPaymentLots.length,
    movementReview: movementReview.length,
    issues: issues.length,
  },
  summaries: {
    matchedByCountry: summarize(benefitMatches, (x) => x.country),
    unmatchedByCountry: summarize(unmatchedBenefits, (x) => x.country),
    ambiguousByCountry: summarize(ambiguousBenefits, (x) => x.country),
    issuesByCode: summarize(issues, (x) => x.code, () => 1),
  },
  benefitMatches,
  ambiguousBenefits,
  unmatchedBenefits,
  orphanPaymentLots,
  movementReview,
  issues,
};

const outJson = path.join(outDir, 'financial-tya-strict-vs-hr-v4-crosscheck.json');
const outMd = path.join(outDir, 'financial-tya-strict-vs-hr-v4-crosscheck-summary.md');
const outIssues = path.join(outDir, 'financial-tya-strict-vs-hr-v4-crosscheck-issues.csv');
fs.writeFileSync(outJson, JSON.stringify(output, null, 2), 'utf8');

const money = (n) => Number(n || 0).toLocaleString('es-GT', { maximumFractionDigits: 2 });
const md = [];
md.push('# Cruce financiero TyA strict dry-run vs HR V4');
md.push('');
md.push('Modo: solo lectura. No escribe Firestore.');
md.push('');
md.push('## HR V4');
Object.entries(output.hrCounts).forEach(([k, v]) => md.push(`- ${k}: ${v}`));
md.push('');
md.push('## Financial strict');
Object.entries(output.financialCounts).forEach(([k, v]) => md.push(`- ${k}: ${v}`));
md.push('');
md.push('## Cruce');
Object.entries(output.crosscheckCounts).forEach(([k, v]) => md.push(`- ${k}: ${v}`));
md.push('');
md.push('## Matched por país');
md.push('| País | Registros | Monto |');
md.push('|---|---:|---:|');
Object.entries(output.summaries.matchedByCountry).forEach(([k, v]) => md.push(`| ${k} | ${v.count} | ${money(v.amount)} |`));
md.push('');
md.push('## Unmatched por país');
md.push('| País | Registros | Monto |');
md.push('|---|---:|---:|');
Object.entries(output.summaries.unmatchedByCountry).forEach(([k, v]) => md.push(`| ${k} | ${v.count} | ${money(v.amount)} |`));
md.push('');
md.push('## Issues por código');
md.push('| Código | Conteo |');
md.push('|---|---:|');
Object.entries(output.summaries.issuesByCode).forEach(([k, v]) => md.push(`| ${k} | ${v.count} |`));
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
md.push(`- ${outIssues}`);
md.push('');
md.push('## Reglas de decisión');
md.push('- Solo benefitMatches con score >= 75 pueden avanzar a write-plan candidato.');
md.push('- ambiguousBenefits y unmatchedBenefits requieren revisión manual o tabla de aliases.');
md.push('- paymentLots con beneficios no matcheados no pueden cargarse como pagados.');
md.push('- movementReview debe revisarse para excluir personales u otros negocios.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

const csv = ['code,severity,benefitId,lotId,movementId,periodId,country,sheetName,rowNumber'];
for (const i of issues) {
  const row = [i.code, i.severity, i.benefitId, i.lotId, i.movementId, i.periodId, i.country, i.source?.sheetName, i.source?.rowNumber]
    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`);
  csv.push(row.join(','));
}
fs.writeFileSync(outIssues, csv.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(issues.length ? 1 : 0);
