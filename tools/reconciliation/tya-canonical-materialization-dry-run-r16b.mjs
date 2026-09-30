#!/usr/bin/env node
/*
  CXOrbia Phase A R16B — canonical materialization reconciliation dry-run.

  Reads only allowlisted source-safe fields from the existing CXOrbia Firebase
  DEV project, compares them in memory with the deterministic canonical plan,
  and classifies create/update/noop/review. No writes, deletes, imports, deploy,
  production access, payments, raw provider payloads or PII are persisted.
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const contractPath = arg('--contract', 'backend/contracts/phase-a-canonical-materialization-dry-run-r16-v1.json');
const planPath = arg('--plan', '.tmp/r16-materialization-plan/firestore-materialization-plan.json');
const shopperGapPath = arg('--shopper-gap', 'backend/config/phase-a-shopper-source-snapshot-gap-review-r11d.source-safe.json');
const financialPath = arg('--financial', 'backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json');
const certificationPath = arg('--certifications', 'backend/config/phase-a-liquidation-certification-projection-summary.source-safe.json');
const outDirArg = arg('--out', '.tmp/canonical-materialization-dry-run-r16');
const outDir = path.isAbsolute(outDirArg) ? outDirArg : path.join(root, outDirArg);

const readJson = file => JSON.parse(fs.readFileSync(path.isAbsolute(file) ? file : path.join(root, file), 'utf8'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const nonEmpty = value => value !== undefined && value !== null && value !== '';

let stage = 'startup';

function errorCategory(error) {
  const raw = String(error?.code || error?.response?.status || error?.status || error?.name || 'UNKNOWN');
  if (/403|permission|denied/i.test(raw)) return 'PERMISSION_DENIED';
  if (/404|not[-_ ]?found/i.test(raw)) return 'NOT_FOUND_OR_API_NOT_INITIALIZED';
  if (/401|unauth/i.test(raw)) return 'UNAUTHENTICATED';
  if (/429|quota/i.test(raw)) return 'QUOTA_OR_RATE_LIMIT';
  if (/invalid.argument|invalid_argument|3/i.test(raw)) return 'INVALID_ARGUMENT';
  return raw.replace(/[^A-Z0-9_.-]/gi, '_').slice(0, 80) || 'UNKNOWN';
}

function safeMessage(error) {
  return String(error?.message || error || 'unknown error')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email-redacted]')
    .replace(/-----BEGIN[\s\S]*?PRIVATE KEY-----/gi, '[credential-redacted]')
    .replace(/https?:\/\/\S+/gi, '[url-redacted]')
    .slice(0, 500);
}

function writeFailure(error) {
  fs.mkdirSync(outDir, { recursive: true });
  const report = {
    schemaVersion: '1.0.0',
    reportId: 'phase-a-canonical-materialization-dry-run-r16-failure',
    generatedAt: new Date().toISOString(),
    decision: 'BLOCKED_SAFE_FAILURE_CANONICAL_MATERIALIZATION_DRY_RUN_R16',
    stage,
    errorCategory: errorCategory(error),
    errorMessageSafe: safeMessage(error),
    safeState: {
      providerReadsMayHaveExecuted: stage.startsWith('provider_'),
      providerDocumentValuesPersisted: false,
      rawProviderResponsesPersisted: false,
      credentialsPersisted: false,
      writes: false,
      deletes: false,
      imported: false,
      deploy: false,
      production: false,
      paymentsExecuted: false,
      piiOutput: false
    }
  };
  fs.writeFileSync(path.join(outDir, 'canonical-materialization-dry-run-r16-failure.json'), stableJson(report), 'utf8');
  fs.writeFileSync(path.join(outDir, 'canonical-materialization-dry-run-r16-failure.md'), [
    '# R16 safe failure', '',
    `Stage: ${report.stage}`,
    `Category: ${report.errorCategory}`,
    `Safe message: ${report.errorMessageSafe}`,
    '',
    'No writes, deletes, imports, deploy, production, payments, PII or credentials persisted.'
  ].join('\n'), 'utf8');
  console.error(stableJson(report));
}

function normalize(value) {
  if (value === undefined || value === null) return null;
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]));
  }
  if (typeof value === 'number' && Number.isNaN(value)) return null;
  return value;
}

function equal(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

function summarize(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function chunks(values, size) {
  const output = [];
  for (let index = 0; index < values.length; index += size) output.push(values.slice(index, index + size));
  return output;
}

function documentParts(documentPath) {
  const segments = String(documentPath || '').split('/').filter(Boolean);
  if (segments.length < 2 || segments.length % 2 !== 0) throw new Error('invalid planned document path shape');
  const documentId = segments.at(-1);
  const collectionPath = segments.slice(0, -1).join('/');
  return { collectionPath, documentId };
}

const compareFieldsByDomain = {
  tenant: ['name', 'configurable', 'schemaVersion'],
  project: ['projectId', 'name', 'configurable', 'countries', 'currency', 'questionnaireMode', 'hrSourceId', 'schemaVersion'],
  hrImport: ['importId', 'state', 'sourceType', 'sourceAccessMode', 'sourceRef', 'sourceSha256', 'counts', 'issueCount', 'writes', 'schemaVersion'],
  period: ['projectId', 'periodId', 'key', 'label', 'month', 'monthName', 'year', 'countries', 'tabs', 'total', 'state', 'schemaVersion'],
  shopper: ['shopperId', 'code', 'country', 'city', 'state', 'stats', 'piiProtected', 'schemaVersion'],
  visit: ['projectId', 'visitId', 'hrRowId', 'sourceTab', 'sourceRow', 'periodId', 'periodKey', 'country', 'branchId', 'branchName', 'city', 'quincena', 'slot', 'slotCode', 'format', 'scenario', 'comboType', 'paymentMethod', 'availableFrom', 'scheduledAt', 'realizedAt', 'questionnaireAt', 'submittedAt', 'status', 'shopperId', 'shopperCode', 'currency', 'compensation', 'piiProtected', 'schemaVersion'],
  liquidation: ['projectId', 'liquidationId', 'paymentItemId', 'periodKey', 'visitId', 'hrRowId', 'sourceTab', 'shopperId', 'shopperCode', 'branchId', 'branchName', 'country', 'currency', 'quincena', 'visitState', 'realizedAt', 'questionnaireAt', 'submittedAt', 'liquidationState', 'paymentState', 'paid', 'paidAt', 'paymentBatchId', 'paymentSource', 'honorario', 'boleto', 'combo', 'reimbursement', 'totalKnown', 'amountStatus', 'missingAmountFields', 'paymentClaim', 'lotEligible', 'executionState', 'reviewRequired', 'reviewReasons', 'schemaVersion']
};

function conflictFields(contract, domain) {
  return [...new Set([...(contract.conflictFields?.all || []), ...(contract.conflictFields?.[domain] || [])])];
}

function selectedFields(contract, domain) {
  return [...new Set([...(compareFieldsByDomain[domain] || []), ...conflictFields(contract, domain), 'production', 'imported'])]
    .filter(Boolean)
    .sort();
}

function classify(operation, actual, exists, contract) {
  const pathHash = sha256(operation.documentPath).slice(0, 24);
  if (!exists) {
    return { operationId: operation.operationId, domain: operation.domain, action: 'create', reason: 'target_missing', pathHash, changedFields: [] };
  }
  const expected = operation.data || {};
  const conflicts = [];
  for (const field of conflictFields(contract, operation.domain)) {
    if (field === 'production' || field === 'imported') {
      if (actual[field] === true) conflicts.push(`${field}_already_true`);
      continue;
    }
    if (nonEmpty(actual[field]) && nonEmpty(expected[field]) && !equal(actual[field], expected[field])) conflicts.push(`${field}_mismatch`);
  }
  if (conflicts.length) {
    return { operationId: operation.operationId, domain: operation.domain, action: 'review', reason: conflicts.join('|'), pathHash, changedFields: [] };
  }
  const changedFields = (compareFieldsByDomain[operation.domain] || Object.keys(expected))
    .filter(field => !equal(actual[field], expected[field]))
    .sort();
  if (!changedFields.length) {
    return { operationId: operation.operationId, domain: operation.domain, action: 'noop', reason: 'safe_fields_equal', pathHash, changedFields: [] };
  }
  return { operationId: operation.operationId, domain: operation.domain, action: 'update', reason: 'safe_fields_differ', pathHash, changedFields };
}

async function readClassifications(db, FieldPath, operations, contract) {
  const groups = new Map();
  for (const operation of operations) {
    const { collectionPath, documentId } = documentParts(operation.documentPath);
    const key = `${operation.domain}|${collectionPath}`;
    if (!groups.has(key)) groups.set(key, { domain: operation.domain, collectionPath, operations: [] });
    groups.get(key).operations.push({ ...operation, documentId });
  }

  const classifications = [];
  const readMetrics = [];
  for (const group of groups.values()) {
    const fields = selectedFields(contract, group.domain);
    let queryCount = 0;
    for (const batch of chunks(group.operations, 10)) {
      stage = `provider_query_${group.domain}`;
      const ids = batch.map(item => item.documentId);
      let query = db.collection(group.collectionPath)
        .where(FieldPath.documentId(), 'in', ids)
        .select(...fields);
      const snapshot = await query.get();
      queryCount += 1;
      const existing = new Map(snapshot.docs.map(doc => [doc.id, doc.data() || {}]));
      for (const operation of batch) {
        classifications.push(classify(operation, existing.get(operation.documentId) || {}, existing.has(operation.documentId), contract));
      }
    }
    readMetrics.push({ domain: group.domain, plannedDocuments: group.operations.length, queryCount, selectedFieldCount: fields.length });
  }
  return { classifications, readMetrics };
}

async function listIds(collectionRef) {
  const snapshot = await collectionRef.select().get();
  return new Set(snapshot.docs.map(doc => doc.id));
}

async function main() {
  stage = 'read_inputs';
  const contract = readJson(contractPath);
  const plan = readJson(planPath);
  const shopperGap = readJson(shopperGapPath);
  const financial = readJson(financialPath);
  const certifications = readJson(certificationPath);

  stage = 'validate_contract_plan';
  if (process.env.CXORBIA_CONFIRM !== contract.authorization.confirmation) throw new Error('confirmation mismatch');
  if (contract.authorization.writes !== false || contract.authorization.deletes !== false || contract.authorization.imports !== false || contract.authorization.deploy !== false || contract.authorization.production !== false) throw new Error('R16 write/deploy gates are not closed');
  if (plan.mode !== 'dry_run' || plan.writes !== false || plan.imported !== false || plan.production !== false) throw new Error('materialization plan is not dry-run/source-safe');
  if (plan.tenantId !== contract.target.tenantId || plan.projectId !== contract.target.projectId) throw new Error('plan tenant/project mismatch');

  const operations = Array.isArray(plan.operations) ? plan.operations : [];
  if (!operations.length) throw new Error('materialization plan has no operations');
  const allowedDomains = new Set(contract.domains || []);
  const allowedActions = new Set(contract.allowedActions || []);
  const duplicatePaths = operations.length - new Set(operations.map(item => item.documentPath)).size;
  const invalidPlanDomains = operations.filter(item => !allowedDomains.has(item.domain)).length;
  const invalidPlanOperations = operations.filter(item => item.operation !== 'create' || item.precondition?.exists !== false).length;
  if (duplicatePaths || invalidPlanDomains || invalidPlanOperations) throw new Error(`invalid canonical plan counts ${duplicatePaths}/${invalidPlanDomains}/${invalidPlanOperations}`);

  stage = 'validate_credential';
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('GOOGLE_APPLICATION_CREDENTIALS missing');
  const credentials = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  const projectIdMatch = String(credentials.project_id || '') === contract.target.firebaseProjectId;
  const serviceAccountDomainMatch = String(credentials.client_email || '').endsWith(contract.target.expectedServiceAccountEmailSuffix);
  if (!projectIdMatch || !serviceAccountDomainMatch) throw new Error('Firebase target credential mismatch');

  stage = 'initialize_firebase';
  const [{ initializeApp, cert, deleteApp }, { getFirestore, FieldPath }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/firestore')
  ]);
  const app = initializeApp({ credential: cert(credentials), projectId: contract.target.firebaseProjectId }, `cxorbia-r16b-${Date.now()}`);

  try {
    const db = getFirestore(app);
    const { classifications, readMetrics } = await readClassifications(db, FieldPath, operations, contract);
    if (classifications.some(item => !allowedActions.has(item.action))) throw new Error('classifier produced an action outside contract');

    stage = 'provider_list_existing_ids';
    const plannedIds = {
      project: new Set(operations.filter(item => item.domain === 'project').map(item => item.data?.projectId).filter(Boolean)),
      shopper: new Set(operations.filter(item => item.domain === 'shopper').map(item => item.data?.shopperId).filter(Boolean)),
      period: new Set(operations.filter(item => item.domain === 'period').map(item => item.data?.periodId).filter(Boolean)),
      visit: new Set(operations.filter(item => item.domain === 'visit').map(item => item.data?.visitId).filter(Boolean)),
      liquidation: new Set(operations.filter(item => item.domain === 'liquidation').map(item => item.data?.liquidationId).filter(Boolean)),
      hrImport: new Set(operations.filter(item => item.domain === 'hrImport').map(item => item.data?.importId).filter(Boolean))
    };
    const tenantRef = db.collection('tenants').doc(contract.target.tenantId);
    const projectRef = tenantRef.collection('projects').doc(contract.target.projectId);
    const existingIds = {
      project: await listIds(tenantRef.collection('projects')),
      shopper: await listIds(tenantRef.collection('shoppers')),
      period: await listIds(projectRef.collection('periods')),
      visit: await listIds(projectRef.collection('visits')),
      liquidation: await listIds(projectRef.collection('liquidations')),
      hrImport: await listIds(projectRef.collection('hrImports'))
    };
    const extraExistingPreservedByDomain = {};
    for (const domain of Object.keys(existingIds)) extraExistingPreservedByDomain[domain] = [...existingIds[domain]].filter(id => !plannedIds[domain].has(id)).length;

    stage = 'build_source_safe_report';
    const actionCounts = summarize(classifications, 'action');
    const domainCounts = {};
    for (const domain of contract.domains) {
      const rows = classifications.filter(item => item.domain === domain);
      domainCounts[domain] = { total: rows.length, actions: summarize(rows, 'action'), extraExistingPreserved: extraExistingPreservedByDomain[domain] || 0 };
    }
    const writeCandidates = classifications.filter(item => item.action === 'create' || item.action === 'update');
    const maxBatch = Number(contract.batching.maxPlannedWritesPerBatch || 400);
    const batches = chunks(writeCandidates, maxBatch).map((items, index) => ({
      batchId: `r16_b${String(index + 1).padStart(3, '0')}`,
      sequence: index + 1,
      operationCount: items.length,
      actionCounts: summarize(items, 'action'),
      operationIds: items.map(item => item.operationId),
      operationIdsSha256: sha256(items.map(item => item.operationId).join('\n'))
    }));

    const june = financial.coverageByPeriodCountry?.['2026-06'] || {};
    const juneFinancialRows = Number(june.GT?.financialRows || 0) + Number(june.HN?.financialRows || 0);
    const juneMissingRows = Number(june.GT?.sourceCountGap || 0) + Number(june.HN?.sourceCountGap || 0);
    const sourceReviewQueues = {
      shopperGapReviewItems: Number(shopperGap.counts?.reviewItems || 0),
      shopperHistoricalCount: Number(shopperGap.reviewItems?.[0]?.evidence?.r5ShopperCount || certifications.certification?.shoppers || 0),
      shopperLiveCount: Number(shopperGap.reviewItems?.[0]?.evidence?.currentShopperCount || 0),
      financialRows: Number(financial.summary?.financialLiquidationRows || 0),
      financialExactLinks: Number(financial.summary?.exactAcceptedLinks || 0),
      financialReviewRows: Number(financial.summary?.reviewLiquidationRows || 0),
      financialReviewQueueTotal: Number(financial.summary?.reviewQueue || 0),
      juneFinancialRows,
      juneMissingRows,
      certificationCandidateShoppers: Number(certifications.certification?.shoppers || 0),
      certificationSourceRecords: Number(certifications.certification?.records || 0),
      noNameMatching: shopperGap.policy?.noNameMatching === true,
      noAutomaticMerge: shopperGap.policy?.noAutomaticMerge === true
    };

    const hardBlockers = [];
    if (actionCounts.delete) hardBlockers.push('delete_action_generated');
    if (batches.some(batch => batch.operationCount > maxBatch)) hardBlockers.push('batch_limit_exceeded');
    if (classifications.length !== operations.length) hardBlockers.push('classification_count_mismatch');
    const decision = hardBlockers.length ? contract.decisions.hardStop : contract.decisions.passWithReview;

    const report = {
      schemaVersion: '1.0.0',
      reportId: 'phase-a-canonical-materialization-dry-run-r16',
      generatedAt: new Date().toISOString(),
      decision,
      target: { firebaseProjectIdMatch: projectIdMatch, serviceAccountDomainMatch, tenantId: contract.target.tenantId, projectId: contract.target.projectId },
      plan: { planId: plan.planId, planSha256: plan.planSha256, sourceSha256: plan.sourceSha256, operationCount: operations.length, domainCounts: plan.counts?.byDomain || {}, duplicatePaths, invalidPlanDomains, invalidPlanOperations },
      reconciliation: {
        actionCounts,
        domainCounts,
        recordReviewCount: Number(actionCounts.review || 0),
        extraExistingPreservedByDomain,
        extraExistingPreservedTotal: Object.values(extraExistingPreservedByDomain).reduce((sum, value) => sum + value, 0),
        plannedWriteCandidateCount: writeCandidates.length,
        plannedBatchCount: batches.length,
        maxBatch,
        noDeleteActions: !actionCounts.delete,
        hardBlockers,
        readMetrics
      },
      sourceReviewQueues,
      reviewSummary: {
        recordReviewCount: Number(actionCounts.review || 0),
        sourceReviewCount: sourceReviewQueues.shopperGapReviewItems + sourceReviewQueues.financialReviewRows + (sourceReviewQueues.certificationCandidateShoppers > 0 && sourceReviewQueues.certificationSourceRecords === 0 ? sourceReviewQueues.certificationCandidateShoppers : 0),
        reviewRequired: true,
        reviewsExcludedFromPlannedWrites: true,
        noopsExcludedFromPlannedWrites: true
      },
      batches,
      classifications,
      nextGate: hardBlockers.length ? 'R16_HARD_STOP_REVIEW' : 'R17_MATERIALIZATION_AUTHORIZATION_PACKAGE_NOT_EXECUTE',
      safeState: {
        providerReadsExecuted: true,
        providerDocumentValuesPersisted: false,
        rawProviderResponsesPersisted: false,
        credentialsPersisted: false,
        writes: false,
        deletes: false,
        imported: false,
        deploy: false,
        production: false,
        paymentsExecuted: false,
        piiOutput: false
      }
    };

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'canonical-materialization-dry-run-r16-report.json'), stableJson(report), 'utf8');
    fs.writeFileSync(path.join(outDir, 'canonical-materialization-dry-run-r16-report.md'), [
      '# CXOrbia Phase A R16 — canonical materialization dry-run', '',
      `Decision: ${decision}`,
      `Plan operations: ${operations.length}`,
      `Create: ${actionCounts.create || 0}`,
      `Update: ${actionCounts.update || 0}`,
      `Noop: ${actionCounts.noop || 0}`,
      `Record review: ${actionCounts.review || 0}`,
      `Planned write candidates: ${writeCandidates.length}`,
      `Planned batches: ${batches.length}`,
      `Extra existing records preserved: ${report.reconciliation.extraExistingPreservedTotal}`,
      `Shopper source review items: ${sourceReviewQueues.shopperGapReviewItems}`,
      `Financial review rows: ${sourceReviewQueues.financialReviewRows}`,
      `June financial rows: ${sourceReviewQueues.juneFinancialRows}`,
      `June missing rows: ${sourceReviewQueues.juneMissingRows}`,
      `Certification candidates pending source: ${sourceReviewQueues.certificationCandidateShoppers}`,
      '',
      'State: READ-ONLY DRY-RUN. No writes, deletes, imports, deploy, production or payments.'
    ].join('\n'), 'utf8');

    console.log(stableJson({ decision, operationCount: operations.length, actionCounts, plannedBatchCount: batches.length, extraExistingPreservedByDomain, sourceReviewQueues, hardBlockers, safeState: report.safeState }));
    process.exitCode = hardBlockers.length ? 2 : 0;
  } finally {
    await deleteApp(app).catch(() => {});
  }
}

main().catch(error => {
  writeFailure(error);
  process.exitCode = 3;
});
