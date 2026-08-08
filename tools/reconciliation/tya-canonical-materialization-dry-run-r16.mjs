#!/usr/bin/env node
/*
  CXOrbia Phase A R16 - canonical materialization reconciliation dry-run.

  Reads the existing CXOrbia Firebase DEV project with an allowlisted field mask,
  compares it in memory against the deterministic source-safe materialization
  plan and emits create/update/noop/review classifications. It never writes,
  deletes, imports, deploys or persists provider document values.
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

const readJson = relative => JSON.parse(fs.readFileSync(path.isAbsolute(relative) ? relative : path.join(root, relative), 'utf8'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const nonEmpty = value => value !== undefined && value !== null && value !== '';

function hardStop(message, code = 4) {
  console.error(message);
  process.exit(code);
}

function errorCategory(error) {
  const raw = String(error?.code || error?.response?.status || error?.status || error?.name || 'UNKNOWN');
  if (/403|permission|denied/i.test(raw)) return 'PERMISSION_DENIED';
  if (/404|not[-_ ]?found/i.test(raw)) return 'NOT_FOUND_OR_API_NOT_INITIALIZED';
  if (/401|unauth/i.test(raw)) return 'UNAUTHENTICATED';
  if (/429|quota/i.test(raw)) return 'QUOTA_OR_RATE_LIMIT';
  return raw.replace(/[^A-Z0-9_.-]/gi, '_').slice(0, 80) || 'UNKNOWN';
}

function normalize(value) {
  if (value === undefined) return null;
  if (value === null) return null;
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

function topLevelFieldNames(operations) {
  const fields = new Set();
  for (const operation of operations) {
    for (const key of Object.keys(operation.data || {})) fields.add(key);
  }
  return [...fields].sort();
}

function scanSensitiveFieldNames(value, denied, prefix = '') {
  const hits = [];
  if (!value || typeof value !== 'object') return hits;
  for (const [key, child] of Object.entries(value)) {
    const field = prefix ? `${prefix}.${key}` : key;
    const lower = key.toLowerCase();
    if (denied.some(token => lower.includes(token))) hits.push(field);
    if (child && typeof child === 'object') hits.push(...scanSensitiveFieldNames(child, denied, field));
  }
  return hits;
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

function classify(operation, snapshot, contract) {
  const pathHash = sha256(operation.documentPath).slice(0, 24);
  if (!snapshot.exists) {
    return { operationId: operation.operationId, domain: operation.domain, action: 'create', reason: 'target_missing', pathHash, changedFields: [] };
  }

  const actual = snapshot.data() || {};
  const expected = operation.data || {};
  const conflicts = [];
  for (const field of conflictFields(contract, operation.domain)) {
    if (field === 'production' || field === 'imported') {
      if (actual[field] === true) conflicts.push(`${field}_already_true`);
      continue;
    }
    if (nonEmpty(actual[field]) && nonEmpty(expected[field]) && !equal(actual[field], expected[field])) {
      conflicts.push(`${field}_mismatch`);
    }
  }
  if (conflicts.length) {
    return { operationId: operation.operationId, domain: operation.domain, action: 'review', reason: conflicts.join('|'), pathHash, changedFields: [] };
  }

  const fields = compareFieldsByDomain[operation.domain] || Object.keys(expected);
  const changedFields = fields.filter(field => !equal(actual[field], expected[field])).sort();
  if (!changedFields.length) {
    return { operationId: operation.operationId, domain: operation.domain, action: 'noop', reason: 'safe_fields_equal', pathHash, changedFields: [] };
  }
  return { operationId: operation.operationId, domain: operation.domain, action: 'update', reason: 'safe_fields_differ', pathHash, changedFields };
}

function summarize(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

async function listIds(collectionRef) {
  const snapshot = await collectionRef.select().get();
  return new Set(snapshot.docs.map(doc => doc.id));
}

async function main() {
  const contract = readJson(contractPath);
  const plan = readJson(planPath);
  const shopperGap = readJson(shopperGapPath);
  const financial = readJson(financialPath);
  const certifications = readJson(certificationPath);

  if (process.env.CXORBIA_CONFIRM !== contract.authorization.confirmation) {
    hardStop(`Blocked: CXORBIA_CONFIRM must equal ${contract.authorization.confirmation}`, 2);
  }
  if (contract.authorization.writes !== false || contract.authorization.deletes !== false || contract.authorization.imports !== false || contract.authorization.deploy !== false || contract.authorization.production !== false) {
    hardStop('Blocked: R16 contract must explicitly disable writes, deletes, imports, deploy and production.', 2);
  }
  if (plan.mode !== 'dry_run' || plan.writes !== false || plan.imported !== false || plan.production !== false) {
    hardStop('Blocked: materialization plan is not dry-run/source-safe.', 2);
  }
  if (plan.tenantId !== contract.target.tenantId || plan.projectId !== contract.target.projectId) {
    hardStop('Blocked: plan tenant/project does not match R16 target.', 2);
  }

  const operations = Array.isArray(plan.operations) ? plan.operations : [];
  if (!operations.length) hardStop('Blocked: materialization plan has no operations.', 2);
  const allowedDomains = new Set(contract.domains || []);
  const allowedActions = new Set(contract.allowedActions || []);
  const duplicatePaths = operations.length - new Set(operations.map(item => item.documentPath)).size;
  const invalidPlanDomains = operations.filter(item => !allowedDomains.has(item.domain)).length;
  const invalidPlanOperations = operations.filter(item => item.operation !== 'create' || item.precondition?.exists !== false).length;
  const deniedTokens = ['dpi', 'document', 'bank', 'account', 'iban', 'swift', 'phone', 'email', 'address', 'card', 'password', 'token', 'secret', 'apikey'];
  const sensitivePlanFields = operations.reduce((sum, item) => sum + scanSensitiveFieldNames(item.data, deniedTokens).length, 0);
  if (duplicatePaths || invalidPlanDomains || invalidPlanOperations || sensitivePlanFields) {
    hardStop(`Blocked: invalid canonical plan duplicatePaths=${duplicatePaths} invalidDomains=${invalidPlanDomains} invalidOperations=${invalidPlanOperations} sensitiveFields=${sensitivePlanFields}`, 3);
  }

  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath || !fs.existsSync(credentialPath)) hardStop('Blocked: GOOGLE_APPLICATION_CREDENTIALS is missing.', 2);
  const credentials = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  const projectIdMatch = String(credentials.project_id || '') === contract.target.firebaseProjectId;
  const serviceAccountDomainMatch = String(credentials.client_email || '').endsWith(contract.target.expectedServiceAccountEmailSuffix);
  if (!projectIdMatch || !serviceAccountDomainMatch) hardStop('Blocked: Firebase target credential mismatch.', 4);

  const [{ initializeApp, cert, deleteApp }, { getFirestore }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/firestore')
  ]);
  const app = initializeApp({ credential: cert(credentials), projectId: contract.target.firebaseProjectId }, `cxorbia-r16-${Date.now()}`);

  try {
    const db = getFirestore(app);
    const fieldMask = topLevelFieldNames(operations).filter(field => !deniedTokens.some(token => field.toLowerCase().includes(token)));
    const classifications = [];
    const providerBatchSize = 150;
    for (let start = 0; start < operations.length; start += providerBatchSize) {
      const batchOperations = operations.slice(start, start + providerBatchSize);
      const refs = batchOperations.map(item => db.doc(item.documentPath));
      const snapshots = await db.getAll(...refs, { fieldMask });
      snapshots.forEach((snapshot, index) => classifications.push(classify(batchOperations[index], snapshot, contract)));
    }

    if (classifications.some(item => !allowedActions.has(item.action))) {
      hardStop('Blocked: classifier produced an action outside the contract.', 5);
    }

    const plannedIds = {
      project: new Set(operations.filter(item => item.domain === 'project').map(item => item.data?.projectId).filter(Boolean)),
      shopper: new Set(operations.filter(item => item.domain === 'shopper').map(item => item.data?.shopperId).filter(Boolean)),
      period: new Set(operations.filter(item => item.domain === 'period').map(item => item.data?.periodId).filter(Boolean)),
      visit: new Set(operations.filter(item => item.domain === 'visit').map(item => item.data?.visitId).filter(Boolean)),
      liquidation: new Set(operations.filter(item => item.domain === 'liquidation').map(item => item.data?.liquidationId).filter(Boolean)),
      hrImport: new Set(operations.filter(item => item.domain === 'hrImport').map(item => item.data?.importId).filter(Boolean))
    };

    const tenantRef = db.collection('tenants').doc(contract.target.tenantId);
    const canonicalProjectRef = tenantRef.collection('projects').doc(contract.target.projectId);
    const existingIds = {
      project: await listIds(tenantRef.collection('projects')),
      shopper: await listIds(tenantRef.collection('shoppers')),
      period: await listIds(canonicalProjectRef.collection('periods')),
      visit: await listIds(canonicalProjectRef.collection('visits')),
      liquidation: await listIds(canonicalProjectRef.collection('liquidations')),
      hrImport: await listIds(canonicalProjectRef.collection('hrImports'))
    };
    const extraPreservedByDomain = {};
    for (const domain of Object.keys(existingIds)) {
      extraPreservedByDomain[domain] = [...existingIds[domain]].filter(id => !plannedIds[domain].has(id)).length;
    }

    const actionCounts = summarize(classifications, 'action');
    const domainCounts = {};
    for (const domain of contract.domains) {
      const rows = classifications.filter(item => item.domain === domain);
      domainCounts[domain] = {
        total: rows.length,
        actions: summarize(rows, 'action'),
        extraExistingPreserved: extraPreservedByDomain[domain] || 0
      };
    }

    const writeCandidates = classifications.filter(item => item.action === 'create' || item.action === 'update');
    const maxBatch = Number(contract.batching.maxPlannedWritesPerBatch || 400);
    const batches = [];
    for (let start = 0; start < writeCandidates.length; start += maxBatch) {
      const items = writeCandidates.slice(start, start + maxBatch);
      batches.push({
        batchId: `r16_b${String(batches.length + 1).padStart(3, '0')}`,
        sequence: batches.length + 1,
        operationCount: items.length,
        actionCounts: summarize(items, 'action'),
        operationIds: items.map(item => item.operationId),
        operationIdsSha256: sha256(items.map(item => item.operationId).join('\n'))
      });
    }

    const sourceReviewQueues = {
      shopperGapReviewItems: Number(shopperGap.counts?.reviewItems || 0),
      shopperHistoricalCount: Number(shopperGap.reviewItems?.[0]?.evidence?.r5ShopperCount || certifications.certification?.shoppers || 0),
      shopperLiveCount: Number(shopperGap.reviewItems?.[0]?.evidence?.currentShopperCount || 0),
      financialRows: Number(financial.summary?.financialLiquidationRows || 0),
      financialExactLinks: Number(financial.summary?.exactAcceptedLinks || 0),
      financialReviewRows: Number(financial.summary?.reviewLiquidationRows || 0),
      juneFinancialRows: Number(financial.june?.financialRows || financial.summary?.juneFinancialRows || 0),
      juneMissingRows: Number(financial.june?.missingRows || financial.summary?.juneMissingRows || 0),
      certificationCandidateShoppers: Number(certifications.certification?.shoppers || 0),
      certificationSourceRecords: Number(certifications.certification?.records || 0),
      noNameMatching: shopperGap.policy?.noNameMatching === true,
      noAutomaticMerge: shopperGap.policy?.noAutomaticMerge === true
    };

    const recordReviewCount = Number(actionCounts.review || 0);
    const sourceReviewCount = sourceReviewQueues.shopperGapReviewItems + sourceReviewQueues.financialReviewRows + (sourceReviewQueues.certificationCandidateShoppers > 0 && sourceReviewQueues.certificationSourceRecords === 0 ? sourceReviewQueues.certificationCandidateShoppers : 0);
    const hardBlockers = [];
    if (actionCounts.delete) hardBlockers.push('delete_action_generated');
    if (batches.some(batch => batch.operationCount > maxBatch)) hardBlockers.push('batch_limit_exceeded');
    if (classifications.length !== operations.length) hardBlockers.push('classification_count_mismatch');

    const decision = hardBlockers.length
      ? contract.decisions.hardStop
      : contract.decisions.passWithReview;

    const report = {
      schemaVersion: '1.0.0',
      reportId: 'phase-a-canonical-materialization-dry-run-r16',
      generatedAt: new Date().toISOString(),
      decision,
      target: {
        firebaseProjectIdMatch: projectIdMatch,
        serviceAccountDomainMatch,
        tenantId: contract.target.tenantId,
        projectId: contract.target.projectId
      },
      plan: {
        planId: plan.planId,
        planSha256: plan.planSha256,
        sourceSha256: plan.sourceSha256,
        operationCount: operations.length,
        domainCounts: plan.counts?.byDomain || {},
        duplicatePaths,
        invalidPlanDomains,
        invalidPlanOperations,
        sensitivePlanFields
      },
      reconciliation: {
        actionCounts,
        domainCounts,
        recordReviewCount,
        extraExistingPreservedByDomain,
        plannedWriteCandidateCount: writeCandidates.length,
        plannedBatchCount: batches.length,
        maxBatch,
        noDeleteActions: !actionCounts.delete,
        hardBlockers
      },
      sourceReviewQueues,
      reviewSummary: {
        recordReviewCount,
        sourceReviewCount,
        reviewRequired: recordReviewCount + sourceReviewCount > 0,
        reviewsExcludedFromPlannedWrites: true,
        noopsExcludedFromPlannedWrites: true
      },
      batches,
      classifications,
      nextGate: hardBlockers.length
        ? 'R16_HARD_STOP_REVIEW'
        : 'R17_MATERIALIZATION_AUTHORIZATION_PACKAGE_NOT_EXECUTE',
      safeState: {
        providerReadsExecuted: true,
        providerFieldMaskCount: fieldMask.length,
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
      '# CXOrbia Phase A R16 — canonical materialization dry-run',
      '',
      `Decision: ${decision}`,
      `Plan operations: ${operations.length}`,
      `Create: ${actionCounts.create || 0}`,
      `Update: ${actionCounts.update || 0}`,
      `Noop: ${actionCounts.noop || 0}`,
      `Record review: ${actionCounts.review || 0}`,
      `Planned write candidates: ${writeCandidates.length}`,
      `Planned batches: ${batches.length}`,
      `Extra existing records preserved: ${Object.values(extraPreservedByDomain).reduce((sum, value) => sum + value, 0)}`,
      `Shopper source review items: ${sourceReviewQueues.shopperGapReviewItems}`,
      `Financial review rows: ${sourceReviewQueues.financialReviewRows}`,
      `Certification candidates pending source: ${sourceReviewQueues.certificationCandidateShoppers}`,
      '',
      'State: READ-ONLY DRY-RUN. No writes, deletes, imports, deploy, production or payments.'
    ].join('\n'), 'utf8');

    console.log(stableJson({
      decision,
      operationCount: operations.length,
      actionCounts,
      plannedBatchCount: batches.length,
      extraExistingPreservedByDomain,
      sourceReviewQueues,
      hardBlockers,
      safeState: report.safeState
    }));
    process.exitCode = hardBlockers.length ? 2 : 0;
  } finally {
    await deleteApp(app).catch(() => {});
  }
}

main().catch(error => {
  console.error(`R16 failed safely: ${errorCategory(error)}`);
  process.exitCode = 3;
});
