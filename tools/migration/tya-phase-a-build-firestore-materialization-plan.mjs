#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : fallback;
};
const required = name => {
  const value = arg(name);
  if (!value) throw new Error(`Missing required argument ${name}`);
  return path.resolve(repo, value);
};
const hrPath = required('--hr');
const financialPath = required('--financial');
const certificationPath = required('--certifications');
const outDir = path.resolve(repo, arg('--out', '.tmp/firestore-materialization-plan'));
const contractPath = path.resolve(repo, arg('--contract', 'backend/contracts/phase-a-firestore-materialization-plan-v1.json'));
const mapPath = path.resolve(repo, arg('--map', 'backend/config/phase-a-firestore-collection-map-v1.json'));

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const safeId = value => String(value ?? '').trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
const deepClone = value => JSON.parse(JSON.stringify(value));
const nonEmpty = value => value !== undefined && value !== null && value !== '';
const asAmount = value => nonEmpty(value) && Number.isFinite(Number(value)) ? Number(value) : null;

function readJsAssignment(file, globalName) {
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file, timeout: 5000 });
  const value = sandbox.window[globalName];
  if (!value || typeof value !== 'object') throw new Error(`Missing ${globalName} in ${file}`);
  return deepClone(value);
}

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Missing path value ${key}`);
    return safeId(values[key]);
  });
}

function qNorm(value) {
  const text = String(value ?? '').trim().toUpperCase();
  if (/1|PRIMER/.test(text)) return 'Q1';
  if (/2|SEGUND/.test(text)) return 'Q2';
  return null;
}

function qCandidate(visit) {
  const iso = visit.realizada || visit.agendada || null;
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return Number(iso.slice(8, 10)) <= 15 ? 'Q1' : 'Q2';
}

function buildLiquidation(visit, rawVisit, finance, tenantId, projectId) {
  const honorario = asAmount(rawVisit.honorario);
  const boleto = asAmount(rawVisit.boleto);
  const combo = asAmount(rawVisit.comboAmt);
  const missing = [];
  if (honorario === null) missing.push('honorario');
  if (boleto === null) missing.push('boleto');
  if (combo === null) missing.push('combo');
  const total = [honorario, boleto, combo].filter(value => value !== null).reduce((sum, value) => sum + value, 0);
  const quincena = qNorm(visit.quincena);
  let paymentState = 'not_scheduled';
  if (String(visit.periodKey) <= '2026-05') paymentState = 'pending_historical_payment_match';
  else if (visit.periodKey === '2026-06' && quincena) paymentState = 'pending_financial_source';
  else if (visit.periodKey === '2026-06') paymentState = 'conflict';
  let liquidationState = 'not_ready';
  if (visit.estado === 'liquidada') liquidationState = 'liquidated';
  else if (visit.estado === 'cuestionario') liquidationState = 'ready_for_review';
  const reasons = [];
  if (missing.length) reasons.push(`amount_fields_missing:${missing.join(',')}`);
  if (!quincena) reasons.push('quincena_missing');
  if (!visit.realizada) reasons.push('realized_at_missing_but_execution_documented');
  if (paymentState === 'conflict') reasons.push('payment_conflict');
  if (paymentState === 'pending_historical_payment_match') reasons.push('historical_payment_source_match_required');
  const liquidationId = `liq_${safeId(tenantId)}_${safeId(projectId)}_${safeId(visit.id)}`;
  return {
    liquidationId,
    paymentItemId: `payitem_${safeId(tenantId)}_${safeId(projectId)}_${safeId(visit.id)}`,
    tenantId,
    projectId,
    periodKey: visit.periodKey,
    visitId: visit.id,
    hrRowId: visit.hrRowId || rawVisit.hrRowId || null,
    sourceTab: visit.sourceTab || rawVisit.sourceTab || null,
    shopperId: visit.shopperId,
    shopperCode: visit.shopperCode || null,
    branchId: visit.cinemaId || null,
    branchName: visit.sucursal || null,
    country: visit.pais || visit.country || null,
    currency: visit.currency || null,
    quincena,
    quincenaCandidate: quincena ? null : qCandidate(visit),
    visitState: visit.estado,
    realizedAt: visit.realizada || null,
    questionnaireAt: visit.cuestFecha || null,
    submittedAt: visit.submittedAt || null,
    liquidationState,
    paymentState,
    paid: false,
    paidAt: null,
    paymentBatchId: null,
    paymentSource: null,
    confirmedBy: null,
    auditRef: null,
    honorario: honorario ?? 0,
    boleto: boleto ?? 0,
    combo: combo ?? 0,
    reimbursement: (boleto ?? 0) + (combo ?? 0),
    totalKnown: total,
    amountStatus: missing.length ? 'partial_pending_source' : 'complete',
    missingAmountFields: missing,
    paymentClaim: String(visit.periodKey) <= '2026-05'
      ? finance.claims?.paidThroughState || 'documented_claim_pending_source_match'
      : visit.periodKey === '2026-06'
        ? quincena === 'Q2'
          ? 'all_pending_requires_item_match'
          : quincena === 'Q1'
            ? 'partially_pending_requires_item_match'
            : 'review_required'
        : null,
    lotEligible: false,
    executionState: 'executed_documented',
    reviewRequired: reasons.length > 0,
    reviewReasons: reasons,
    sourceRefs: {
      hr: 'tya:hr-live-multitab:source-safe:not-imported',
      financial: finance.sourceStatus || 'pending_financial_source'
    },
    sourceSafe: true,
    imported: false,
    production: false
  };
}

const contract = readJson(contractPath);
const collectionMap = readJson(mapPath);
const hr = readJsAssignment(hrPath, 'CX_TYA_HR_SOURCE_SAFE');
const finance = readJsAssignment(financialPath, 'CX_TYA_FINANCIAL_CONTROL_SOURCE_SAFE');
const certifications = readJsAssignment(certificationPath, 'CX_TYA_CERTIFICATION_CARRYOVER_SOURCE_SAFE');

if (!hr.sourceSafe || hr.imported || hr.production) throw new Error('HR source is not source-safe');
if (!finance.sourceSafe || finance.imported || finance.production) throw new Error('Financial source is not source-safe');
if (!certifications.sourceSafe || certifications.imported || certifications.production) throw new Error('Certification source is not source-safe');

const sourceBytes = [fs.readFileSync(hrPath), fs.readFileSync(financialPath), fs.readFileSync(certificationPath)];
const sourceSha256 = sha256(Buffer.concat(sourceBytes));
const planId = `phasea_${sourceSha256.slice(0, 16)}`;
const tenantId = hr.tenantId;
const projectId = hr.projectId;
const generatedAt = hr.generatedAt || null;
const operations = [];

function add(domain, pathTemplate, ids, data) {
  const documentPath = fill(pathTemplate, ids);
  operations.push({
    operationId: `op_${String(operations.length + 1).padStart(5, '0')}`,
    domain,
    operation: 'create',
    documentPath,
    precondition: { exists: false },
    data: {
      ...data,
      tenantId,
      sourceSafe: true,
      imported: false,
      production: false,
      materializationPlanId: planId,
      materializationState: 'planned_not_executed'
    }
  });
}

add('tenant', collectionMap.paths.tenant, { tenantId }, {
  name: hr.tenantName,
  status: 'planned_not_executed',
  configurable: true,
  sourceSnapshotAt: generatedAt,
  schemaVersion: '1.0.0'
});
add('project', collectionMap.paths.project, { tenantId, projectId }, {
  projectId,
  name: hr.projectName,
  status: 'planned_not_executed',
  configurable: true,
  countries: hr.projectConfig?.countries || [],
  currency: hr.projectConfig?.currency || {},
  questionnaireMode: hr.projectConfig?.questionnaireMode || 'configurable',
  hrSourceId: hr.projectConfig?.hrSourceId || null,
  sourceSnapshotAt: generatedAt,
  schemaVersion: '1.0.0'
});
add('hrImport', collectionMap.paths.hrImport, { tenantId, projectId, importId: planId }, {
  importId: planId,
  state: 'planned_not_executed',
  sourceType: hr.source?.type || 'source_safe_snapshot',
  sourceAccessMode: hr.source?.accessMode || 'readonly',
  sourceRef: hr.source?.spreadsheetIdMasked || 'masked',
  sourceSha256,
  sourceSnapshotAt: generatedAt,
  counts: hr.counts,
  issueCount: Array.isArray(hr.issues) ? hr.issues.length : 0,
  writes: false,
  schemaVersion: '1.0.0'
});

for (const period of hr.periods || []) {
  add('period', collectionMap.paths.period, { tenantId, projectId, periodId: period.key }, {
    projectId,
    periodId: period.key,
    key: period.key,
    label: period.label || period.fullLabel || period.key,
    month: period.month,
    monthName: period.monthName,
    year: period.year,
    countries: period.countries || {},
    tabs: period.tabs || [],
    total: period.total || 0,
    state: period.key === (hr.periods || []).at(-1)?.key ? 'active' : 'closed',
    sourceSnapshotAt: generatedAt,
    schemaVersion: '1.0.0'
  });
}

for (const shopper of hr.shoppers || []) {
  add('shopper', collectionMap.paths.shopper, { tenantId, shopperId: shopper.id }, {
    shopperId: shopper.id,
    code: shopper.code,
    displayName: shopper.nombre || 'Shopper protegido',
    country: shopper.pais || null,
    city: shopper.ciudad || null,
    state: shopper.estado || 'pending_review',
    stats: {
      visits: shopper.visitas || 0,
      completed: shopper.realizadas || 0,
      liquidated: shopper.liquidadas || 0
    },
    piiProtected: shopper.piiProtected === true,
    sourceSnapshotAt: generatedAt,
    schemaVersion: '1.0.0'
  });
}

const rawById = new Map((hr.visits || []).map(visit => [visit.id, visit]));
for (const visit of hr.visits || []) {
  add('visit', collectionMap.paths.visit, { tenantId, projectId, visitId: visit.id }, {
    projectId,
    visitId: visit.id,
    hrRowId: visit.hrRowId || null,
    sourceTab: visit.sourceTab || null,
    sourceRow: visit.sourceRow || null,
    periodId: visit.periodKey,
    periodKey: visit.periodKey,
    country: visit.pais || visit.country || null,
    branchId: visit.cinemaId || null,
    branchName: visit.sucursal || null,
    city: visit.ciudad || null,
    quincena: visit.quincena || null,
    slot: visit.franja || null,
    slotCode: visit.franjaCode || null,
    format: visit.formato || null,
    scenario: visit.escenario || null,
    comboType: visit.tipoCombo || null,
    paymentMethod: visit.metodoPago || null,
    availableFrom: visit.disponibleDesde || null,
    scheduledAt: visit.agendada || null,
    realizedAt: visit.realizada || null,
    questionnaireAt: visit.cuestFecha || null,
    submittedAt: visit.submittedAt || null,
    status: visit.estado,
    shopperId: visit.shopperId || null,
    shopperCode: visit.shopperCode || null,
    currency: visit.currency || null,
    compensation: {
      honorario: asAmount(visit.honorario),
      boleto: asAmount(visit.boleto),
      combo: asAmount(visit.comboAmt)
    },
    piiProtected: visit.piiProtected === true,
    sourceSnapshotAt: generatedAt,
    schemaVersion: '1.0.0'
  });
}

const cutPeriod = finance.cutPeriod || '2026-06';
for (const visit of (hr.visits || []).filter(visit => String(visit.periodKey) <= cutPeriod && visit.shopperId)) {
  const liquidation = buildLiquidation(visit, rawById.get(visit.id) || visit, finance, tenantId, projectId);
  add('liquidation', collectionMap.paths.liquidation, { tenantId, projectId, liquidationId: liquidation.liquidationId }, {
    projectId,
    ...liquidation,
    sourceSnapshotAt: generatedAt,
    schemaVersion: '1.0.0'
  });
}

const uniquePaths = new Set();
for (const operation of operations) {
  if (uniquePaths.has(operation.documentPath)) throw new Error(`Duplicate document path ${operation.documentPath}`);
  uniquePaths.add(operation.documentPath);
}

const batchSize = contract.writePlan.maxOperationsPerBatch;
const batches = [];
for (let index = 0; index < operations.length; index += batchSize) {
  const batchOperations = operations.slice(index, index + batchSize);
  batches.push({
    batchId: `${planId}_b${String(batches.length + 1).padStart(3, '0')}`,
    sequence: batches.length + 1,
    operationCount: batchOperations.length,
    operationIds: batchOperations.map(item => item.operationId),
    operationPathsSha256: sha256(Buffer.from(batchOperations.map(item => item.documentPath).join('\n')))
  });
}

const countsByDomain = operations.reduce((acc, item) => {
  acc[item.domain] = (acc[item.domain] || 0) + 1;
  return acc;
}, {});
const blockedDomains = {
  payments: {
    state: finance.sourceStatus || 'pending_financial_source',
    sourceRecords: Array.isArray(finance.payments) ? finance.payments.length : 0,
    plannedOperations: 0,
    reason: 'confirmed separate financial source required'
  },
  paymentLots: {
    state: 'blocked',
    sourceRecords: Array.isArray(finance.batches) ? finance.batches.length : 0,
    plannedOperations: 0,
    reason: 'no lot before confirmed item-level payments'
  },
  certifications: {
    state: certifications.sourceStatus || 'pending_certification_source',
    sourceRecords: Array.isArray(certifications.certifications) ? certifications.certifications.length : 0,
    plannedOperations: 0,
    candidateShoppers: Array.isArray(hr.shoppers) ? hr.shoppers.length : 0,
    reason: 'reviewed carryover source required'
  }
};

const planCore = {
  schemaVersion: '1.0.0',
  planId,
  contractId: contract.contractId,
  collectionMapId: collectionMap.mapId,
  tenantId,
  projectId,
  sourceSha256,
  sourceSnapshotAt: generatedAt,
  mode: 'dry_run',
  operation: 'create',
  precondition: 'exists_false',
  counts: {
    operations: operations.length,
    batches: batches.length,
    byDomain: countsByDomain,
    source: hr.counts
  },
  blockedDomains,
  batches,
  safeState: contract.safeState,
  writes: false,
  imported: false,
  production: false
};
const planSha256 = sha256(Buffer.from(stableJson(planCore)));
const plan = { ...planCore, planSha256, operations };

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, 'batches'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'firestore-materialization-plan.json'), stableJson(plan), 'utf8');
for (const batch of batches) {
  const batchOperations = batch.operationIds.map(id => operations.find(item => item.operationId === id));
  fs.writeFileSync(path.join(outDir, 'batches', `${batch.batchId}.json`), stableJson({
    schemaVersion: '1.0.0',
    planId,
    planSha256,
    ...batch,
    operations: batchOperations,
    writes: false,
    imported: false,
    production: false
  }), 'utf8');
}
const summary = {
  ...planCore,
  planSha256,
  operationPathsSha256: sha256(Buffer.from(operations.map(item => item.documentPath).join('\n'))),
  validationExpected: {
    noDuplicatePaths: true,
    noSensitiveFields: true,
    noPaidWithoutConfirmedSource: true,
    maxBatchOperations: batchSize,
    sourceSafeOnly: true
  }
};
fs.writeFileSync(path.join(outDir, 'firestore-materialization-summary.json'), stableJson(summary), 'utf8');
fs.writeFileSync(path.join(outDir, 'firestore-materialization-plan.md'), `# Phase A Firestore materialization plan\n\n- Plan: \`${planId}\`\n- Plan SHA-256: \`${planSha256}\`\n- Source SHA-256: \`${sourceSha256}\`\n- Operations: ${operations.length}\n- Batches: ${batches.length}\n- Tenant: ${tenantId}\n- Project: ${projectId}\n- Periods: ${countsByDomain.period || 0}\n- Visits: ${countsByDomain.visit || 0}\n- Shoppers: ${countsByDomain.shopper || 0}\n- Liquidations: ${countsByDomain.liquidation || 0}\n- Payments planned: 0\n- Certifications planned: 0\n\nState: **DRY-RUN ONLY — NOT EXECUTED**.\n`, 'utf8');
console.log(stableJson(summary));
