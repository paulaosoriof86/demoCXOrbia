#!/usr/bin/env node
/*
  CXOrbia Phase A R18A — canonicalize the existing live HR source-safe payload.

  This is an integration layer, not a new HR mapper:
  - it consumes the payload already produced by tya-build-live-hr-source-safe-static.mjs;
  - it applies the date semantics already implemented by the source-safe importers;
  - it applies the existing Phase A operational state-machine/domain contracts;
  - it does not re-run shopper or financial reconciliation;
  - it performs no provider writes, imports, deploy or production action.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const inputPath = path.resolve(valueOf('--input', 'app/data/tya-hr-source-safe-periods.js'));
const outputPath = path.resolve(valueOf('--out', valueOf('--input', 'app/data/tya-hr-source-safe-periods.js')));
const reportDir = path.resolve(valueOf('--report-dir', '.tmp/r18a-canonical-assets-integration'));
const globalName = valueOf('--global', 'CX_TYA_HR_SOURCE_SAFE');
const DAY_MS = 24 * 60 * 60 * 1000;

const norm = value => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const nonEmpty = value => value !== undefined && value !== null && String(value).trim() !== '';
const safeHash = value => crypto.createHash('sha256').update(String(value ?? '')).digest('hex').slice(0, 16);
const isValidDateParts = (year, month, day) => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
const isoFromParts = (year, month, day) => `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

function parseAssignment(file) {
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file, timeout: 5000 });
  const payload = sandbox.window[globalName];
  if (!payload || typeof payload !== 'object') throw new Error(`Missing window.${globalName} in ${file}`);
  return JSON.parse(JSON.stringify(payload));
}

function excelSerialToIso(serial) {
  const numeric = Number(serial);
  if (!Number.isFinite(numeric) || numeric < 1 || numeric > 100000) return null;
  const epoch = Date.UTC(1899, 11, 30);
  const date = new Date(epoch + Math.floor(numeric) * DAY_MS);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return isValidDateParts(year, month, day) ? isoFromParts(year, month, day) : null;
}

function normalizeExternalDate(value, context = {}) {
  if (!nonEmpty(value)) return { value: null, status: 'empty', sourceKind: 'empty', reason: null };

  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return { value: value.toISOString().slice(0, 10), status: 'normalized', sourceKind: 'date_object', reason: null };
  }

  const raw = String(value).trim();
  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    const iso = excelSerialToIso(raw);
    if (iso) return { value: iso, status: 'normalized', sourceKind: 'excel_serial', reason: null };
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (isValidDateParts(year, month, day)) {
      return { value: isoFromParts(year, month, day), status: 'normalized', sourceKind: 'iso', reason: null };
    }
  }

  const ymdMatch = raw.match(/^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    if (isValidDateParts(year, month, day)) {
      return { value: isoFromParts(year, month, day), status: 'normalized', sourceKind: 'year_first', reason: null };
    }
  }

  const localMatch = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);
  if (localMatch) {
    const first = Number(localMatch[1]);
    const second = Number(localMatch[2]);
    const rawYear = Number(localMatch[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    const candidates = [];
    if (isValidDateParts(year, second, first)) candidates.push({ value: isoFromParts(year, second, first), sourceKind: 'day_month_year', month: second });
    if (isValidDateParts(year, first, second)) candidates.push({ value: isoFromParts(year, first, second), sourceKind: 'month_day_year', month: first });
    const unique = [...new Map(candidates.map(item => [item.value, item])).values()];
    if (unique.length === 1) return { ...unique[0], status: 'normalized', reason: null };
    if (unique.length > 1) {
      const expectedMonth = Number(context.expectedMonth || 0);
      const expectedYear = Number(context.expectedYear || 0);
      const matching = unique.filter(item => (!expectedMonth || item.month === expectedMonth) && (!expectedYear || year === expectedYear));
      if (matching.length === 1) return { ...matching[0], status: 'normalized', reason: 'resolved_by_period_context' };
      return { value: null, status: 'review_required', sourceKind: 'ambiguous_local_date', reason: 'ambiguous_day_month_order' };
    }
  }

  return { value: null, status: 'review_required', sourceKind: 'unsupported_date', reason: 'unrecognized_date_format' };
}

function deriveCanonicalStates(visit) {
  const control = norm(visit.controlDia);
  const hasShopper = Boolean(visit.shopperId || visit.hasShopper);
  const scheduled = nonEmpty(visit.agendada);
  const realized = nonEmpty(visit.realizada);
  const questionnaire = nonEmpty(visit.cuestFecha);
  const submitted = nonEmpty(visit.submittedAt) || visit.submit === true;

  let operationalState = 'available';
  let legacyEstado = 'disponible';
  if (control.includes('fuera')) {
    operationalState = hasShopper ? 'reschedule_requested' : 'available';
    legacyEstado = 'fuera_rango';
  } else if (realized) {
    operationalState = 'completed';
    legacyEstado = 'realizada';
  } else if (scheduled) {
    operationalState = 'scheduled';
    legacyEstado = 'agendada';
  } else if (hasShopper) {
    operationalState = 'assigned_from_hr_pending_platform_sync';
    legacyEstado = 'asignada';
  }

  const questionnaireState = questionnaire ? 'questionnaire_completed' : 'not_completed';
  const submissionState = submitted ? 'submitted_by_tya' : 'not_submitted';
  const liquidationState = submitted ? 'liquidation_candidate' : 'not_ready';
  const paymentState = submitted ? 'pending_financial_source' : 'not_eligible';

  let canonicalState = operationalState;
  if (questionnaire) canonicalState = 'questionnaire_completed';
  if (submitted) canonicalState = 'submitted_by_tya';
  if (questionnaire || submitted) legacyEstado = 'cuestionario';

  return {
    canonicalState,
    operationalState,
    questionnaireState,
    submissionState,
    liquidationState,
    paymentState,
    legacyEstado,
    assignmentSource: hasShopper ? 'hr' : null,
    assignmentSyncStatus: hasShopper ? 'assigned_from_hr_pending_platform_sync' : 'not_assigned',
    liquidationEvidence: submitted ? 'submission_only_pending_financial_crosscheck' : null,
    paymentEvidence: null
  };
}

function countBy(items, field) {
  return items.reduce((acc, item) => {
    const key = item?.[field] ?? 'missing';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function canonicalize(payload) {
  if (payload.sourceSafe !== true || payload.imported === true || payload.production === true) {
    throw new Error('Input is not an eligible source-safe non-production snapshot.');
  }
  if (!Array.isArray(payload.visits) || !payload.visits.length) throw new Error('Input contains no visits.');

  const periodByKey = new Map((payload.periods || []).map(period => [String(period.key), period]));
  const reviewQueue = [];
  const normalizationStats = { normalized: 0, empty: 0, reviewRequired: 0, excelSerialNormalized: 0 };
  const dateFields = ['disponibleDesde', 'agendada', 'realizada', 'cuestFecha', 'submittedAt'];

  const visits = payload.visits.map((rawVisit, index) => {
    const visit = { ...rawVisit };
    const period = periodByKey.get(String(visit.periodKey)) || {};
    const dateNormalization = {};
    const reviewReasons = Array.isArray(visit.reviewReasons) ? [...visit.reviewReasons] : [];

    for (const field of dateFields) {
      const original = visit[field];
      const result = normalizeExternalDate(original, { expectedMonth: period.month, expectedYear: period.year });
      visit[field] = result.value;
      dateNormalization[field] = { status: result.status, sourceKind: result.sourceKind, reason: result.reason };
      if (result.status === 'empty') normalizationStats.empty += 1;
      else if (result.status === 'normalized') {
        normalizationStats.normalized += 1;
        if (result.sourceKind === 'excel_serial') normalizationStats.excelSerialNormalized += 1;
      } else {
        normalizationStats.reviewRequired += 1;
        const reason = `date:${field}:${result.reason}`;
        reviewReasons.push(reason);
        reviewQueue.push({
          queueItemId: `review_date_${safeHash(`${visit.id || index}|${field}|${String(original)}`)}`,
          queueType: 'date_normalization',
          severity: 'warning',
          status: 'review_required',
          entityType: 'visit',
          entityId: visit.id || `visit_${index + 1}`,
          stableKeys: { tenantId: payload.tenantId, projectId: payload.projectId, visitId: visit.id || null, hrRowId: visit.hrRowId || null },
          reasonCode: result.reason,
          field,
          rawValuePreview: String(original ?? '').slice(0, 40),
          sourceRef: `${visit.sourceTab || 'hr'}:${visit.sourceRow || ''}`,
          gateStatus: 'hold_until_review',
          sourceSafe: true
        });
      }
    }

    visit.submit = Boolean(visit.submittedAt);
    const states = deriveCanonicalStates(visit);
    Object.assign(visit, states, {
      estado: states.legacyEstado,
      dateNormalization,
      reviewRequired: reviewReasons.length > 0,
      reviewReasons: [...new Set(reviewReasons)],
      sourceSnapshotAt: payload.generatedAt || null,
      sourceReadMode: payload.source?.accessMode || 'source_safe_snapshot',
      runtimeSyncActive: false,
      stateModelVersion: 'phase-a-operational-state-machine-v1',
      domainMappingVersion: 'phase-a-source-safe-domain-mapping-v1'
    });
    return visit;
  });

  const shopperMap = new Map();
  for (const visit of visits) {
    if (!visit.shopperId) continue;
    const current = shopperMap.get(visit.shopperId) || {
      id: visit.shopperId,
      shopperId: visit.shopperId,
      code: visit.shopperCode || null,
      nombre: 'Shopper protegido',
      tenantId: payload.tenantId,
      projectIds: [payload.projectId],
      pais: visit.country || visit.pais || null,
      countries: [],
      dataLevel: 'protected_reference',
      operationalProfileAvailable: false,
      fullAuthorizedProfileAvailable: false,
      estado: null,
      status: null,
      rating: null,
      completion: null,
      preference: null,
      honorario: null,
      visitas: 0,
      realizadas: 0,
      submitidas: 0,
      liquidationCandidates: 0,
      liquidadas: 0,
      paymentControlStatus: 'not_eligible',
      certificationStatus: 'pending_carryover_overlay',
      sourceRef: 'hr-source-safe-protected-reference',
      reviewStatus: 'pending_operational_profile',
      sourceSafe: true,
      piiProtected: true,
      sourceSnapshotAt: payload.generatedAt || null,
      runtimeSyncActive: false
    };
    current.visitas += 1;
    const country = visit.country || visit.pais;
    if (country && !current.countries.includes(country)) current.countries.push(country);
    if (['completed', 'questionnaire_completed', 'submitted_by_tya'].includes(visit.canonicalState)) current.realizadas += 1;
    if (visit.submissionState === 'submitted_by_tya') current.submitidas += 1;
    if (visit.liquidationState === 'liquidation_candidate') {
      current.liquidationCandidates += 1;
      current.paymentControlStatus = 'pending_financial_source';
    }
    if (visit.reviewRequired) current.reviewStatus = 'review_required';
    shopperMap.set(visit.shopperId, current);
  }
  const shoppers = [...shopperMap.values()].sort((a, b) => String(a.code || a.id).localeCompare(String(b.code || b.id)));

  const numericDateResidues = visits.reduce((count, visit) => count + dateFields.filter(field => /^\d{3,6}(?:\.0+)?$/.test(String(visit[field] ?? '').trim())).length, 0);
  const submittedConflated = visits.filter(visit => visit.submissionState === 'submitted_by_tya' && (visit.estado === 'liquidada' || visit.paymentState === 'paid' || visit.paymentState === 'payment_confirmed_external')).length;
  const fakeShopperAttributes = shoppers.filter(shopper => shopper.rating !== null || shopper.estado !== null || shopper.status !== null || shopper.operationalProfileAvailable !== false).length;

  const output = {
    ...payload,
    schemaVersion: '1.1.0-r18a',
    sourceSnapshotAt: payload.generatedAt || null,
    sourceReadMode: payload.source?.accessMode || 'source_safe_snapshot',
    runtimeSyncActive: false,
    canonicalization: {
      integrationId: 'R18A_INTEGRATE_EXISTING_CANONICAL_ASSETS',
      generatedAt: new Date().toISOString(),
      reusedAssets: [
        'source_safe_import_date_semantics',
        'phase-a-operational-state-machine-v1',
        'phase-a-source-safe-domain-mapping-v1',
        'phase-a-human-review-conflict-queue-plan-v1',
        'r11d-shopper-review-queue',
        'r14c-financial-overlay'
      ],
      shopperReconciliationRecomputed: false,
      financialReconciliationRecomputed: false,
      providerWrites: false,
      importsExecuted: false,
      production: false
    },
    source: {
      ...(payload.source || {}),
      snapshotOnly: true,
      runtimeSyncActive: false,
      lastSnapshotAt: payload.generatedAt || null
    },
    visits,
    shoppers,
    reviewQueue,
    counts: {
      ...(payload.counts || {}),
      shoppers: shoppers.length,
      byStatus: countBy(visits, 'estado'),
      byCanonicalState: countBy(visits, 'canonicalState'),
      byOperationalState: countBy(visits, 'operationalState'),
      byQuestionnaireState: countBy(visits, 'questionnaireState'),
      bySubmissionState: countBy(visits, 'submissionState'),
      byLiquidationState: countBy(visits, 'liquidationState'),
      byPaymentState: countBy(visits, 'paymentState'),
      dateNormalization: normalizationStats,
      reviewQueue: reviewQueue.length
    },
    semanticValidation: {
      numericDateResidues,
      submittedConflated,
      fakeShopperAttributes,
      pass: numericDateResidues === 0 && submittedConflated === 0 && fakeShopperAttributes === 0
    }
  };

  return output;
}

function writePayload(payload) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const js = [
    '/* CXOrbia TyA canonical source-safe snapshot R18A. No PII, imports, writes or production. */\n',
    `window.${globalName} = `,
    JSON.stringify(payload, null, 2),
    ';\n'
  ].join('');
  fs.writeFileSync(outputPath, js, 'utf8');
}

function writeReport(payload) {
  const checks = {
    datesAreIsoOrNull: payload.semanticValidation.numericDateResidues === 0 && payload.visits.every(visit => ['disponibleDesde', 'agendada', 'realizada', 'cuestFecha', 'submittedAt'].every(field => visit[field] == null || /^\d{4}-\d{2}-\d{2}$/.test(String(visit[field])))),
    submittedNotLiquidatedOrPaid: payload.semanticValidation.submittedConflated === 0,
    canonicalStatesPresent: payload.visits.every(visit => ['operationalState', 'questionnaireState', 'submissionState', 'liquidationState', 'paymentState'].every(field => nonEmpty(visit[field]))),
    snapshotMetadataHonest: payload.runtimeSyncActive === false && payload.source?.snapshotOnly === true && nonEmpty(payload.sourceSnapshotAt),
    protectedShoppersHaveNoInventedAttributes: payload.semanticValidation.fakeShopperAttributes === 0 && payload.shoppers.every(shopper => shopper.dataLevel === 'protected_reference'),
    noReconciliationRecomputed: payload.canonicalization?.shopperReconciliationRecomputed === false && payload.canonicalization?.financialReconciliationRecomputed === false
  };
  const pass = Object.values(checks).every(Boolean);
  const report = {
    schemaVersion: '1.0.0',
    reportId: 'phase-a-r18a-canonical-assets-integration',
    generatedAt: new Date().toISOString(),
    decision: pass ? 'PASS_R18A_EXISTING_CANONICAL_ASSETS_INTEGRATED' : 'FAIL_R18A_CANONICAL_ASSETS_INTEGRATION',
    input: path.relative(process.cwd(), inputPath).replace(/\\/g, '/'),
    output: path.relative(process.cwd(), outputPath).replace(/\\/g, '/'),
    checks,
    counts: payload.counts,
    semanticValidation: payload.semanticValidation,
    safeState: {
      providerWrites: false,
      firestoreWrites: false,
      authWrites: false,
      storageWrites: false,
      hrWrites: false,
      imports: false,
      deploy: false,
      production: false,
      piiOutput: false
    }
  };
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'r18a-canonical-assets-integration.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(reportDir, 'r18a-canonical-assets-integration.md'), [
    '# R18A — integración de activos canónicos existentes',
    '',
    `Decision: **${report.decision}**`,
    `Visits: ${payload.visits.length}`,
    `Protected shopper references: ${payload.shoppers.length}`,
    `Date review items: ${payload.reviewQueue.length}`,
    `Numeric date residues: ${payload.semanticValidation.numericDateResidues}`,
    `Submitted conflated with liquidated/paid: ${payload.semanticValidation.submittedConflated}`,
    `Invented shopper attributes: ${payload.semanticValidation.fakeShopperAttributes}`,
    '',
    'Reused existing contracts/import semantics. Shopper R11D and financial R14C reconciliation were not recomputed.',
    'No writes, imports, deploy, production or PII output.'
  ].join('\n') + '\n', 'utf8');
  console.log(JSON.stringify(report, null, 2));
  return pass;
}

const payload = canonicalize(parseAssignment(inputPath));
writePayload(payload);
const pass = writeReport(payload);
process.exitCode = pass ? 0 : 4;
