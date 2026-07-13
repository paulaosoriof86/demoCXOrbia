#!/usr/bin/env node
/*
  CXOrbia Phase A R16D — R14C financial overlay and review plan.

  Offline/source-safe only. It overlays the 196 exact financial links onto the
  corresponding visit-level settlement controls, keeps unresolved financial
  rows in review, preserves the shopper gap and certification-source blocker,
  and never infers paid/certified states.
*/

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const contractPath = arg('--contract', 'backend/contracts/phase-a-r14c-financial-overlay-review-plan-r16d-v1.json');
const basePlanPath = arg('--plan', '.tmp/r16d-base-plan/firestore-materialization-plan.json');
const financialPath = arg('--financial', 'backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json');
const shopperGapPath = arg('--shopper-gap', 'backend/config/phase-a-shopper-source-snapshot-gap-review-r11d.source-safe.json');
const certificationPath = arg('--certifications', 'backend/config/phase-a-liquidation-certification-projection-summary.source-safe.json');
const outDirArg = arg('--out', '.tmp/r14c-financial-overlay-review-plan-r16d');
const outDir = path.isAbsolute(outDirArg) ? outDirArg : path.join(root, outDirArg);

const readJson = file => JSON.parse(fs.readFileSync(path.isAbsolute(file) ? file : path.join(root, file), 'utf8'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const safeArray = value => Array.isArray(value) ? value : [];
const compact = value => value === undefined ? null : value;

function deterministicId(prefix, value) {
  return `${prefix}_${sha256(JSON.stringify(value)).slice(0, 20)}`;
}

function summarize(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function safeReviewItem(item, index) {
  const reviewReasons = safeArray(item.reviewReasons || item.reasons || item.reviewReason).map(String).slice(0, 20);
  const safe = {
    reviewId: String(item.reviewId || item.id || deterministicId('finrev', { index, sourceRecordId: item.sourceRecordId, evidenceId: item.evidenceId, matchStatus: item.matchStatus, periodKey: item.periodKey, country: item.country })),
    kind: String(item.kind || item.type || item.reviewType || 'financial_reconciliation'),
    sourceRecordId: compact(item.sourceRecordId || item.financialRecordId || item.recordId),
    paymentItemId: compact(item.paymentItemId),
    evidenceId: compact(item.evidenceId || item.ledgerEvidenceId),
    visitId: compact(item.visitId),
    hrRowId: compact(item.hrRowId),
    shopperId: compact(item.shopperId),
    periodKey: compact(item.periodKey),
    country: compact(item.country),
    matchStatus: compact(item.matchStatus || item.status),
    candidateCount: Number(item.candidateCount || 0),
    amountStatus: compact(item.amountStatus),
    reviewReasons,
    sourceRefHash: sha256(JSON.stringify(item)),
    state: 'review_required',
    autoResolutionAllowed: false,
    materializationEligible: false
  };
  return safe;
}

function findFinancialReviewQueue(financial) {
  const directKeys = ['reviewQueue', 'reviewQueueItems', 'financialReviewQueue', 'reconciliationReviewQueue'];
  for (const key of directKeys) {
    if (Array.isArray(financial[key])) return { key, items: financial[key] };
  }

  const reviewCandidates = safeArray(financial.liquidationCandidates).filter(item => item.reviewRequired === true);
  const ledgerKeys = ['ledgerEvidenceCandidates', 'ledgerCandidates', 'paymentEvidenceCandidates', 'ledgerEvidence'];
  let ledgerReview = [];
  let ledgerKey = null;
  for (const key of ledgerKeys) {
    if (Array.isArray(financial[key])) {
      ledgerKey = key;
      ledgerReview = financial[key].filter(item => item.reviewRequired === true || item.matchStatus !== 'unique_linked');
      break;
    }
  }
  return { key: `fallback:liquidationCandidates+${ledgerKey || 'none'}`, items: [...reviewCandidates, ...ledgerReview] };
}

const contract = readJson(contractPath);
const basePlan = readJson(basePlanPath);
const financial = readJson(financialPath);
const shopperGap = readJson(shopperGapPath);
const certifications = readJson(certificationPath);
const operations = safeArray(basePlan.operations);
const expected = contract.expected || {};

const hardStops = [];
if (basePlan.mode !== 'dry_run' || basePlan.writes !== false || basePlan.imported !== false || basePlan.production !== false) hardStops.push('base_plan_not_dry_run');
if (basePlan.tenantId !== contract.scope.tenantId || basePlan.projectId !== contract.scope.projectId) hardStops.push('scope_mismatch');
if (operations.length !== Number(expected.baseOperations)) hardStops.push('base_operation_count_mismatch');

const liquidationOperations = operations.filter(operation => operation.domain === 'liquidation');
const liquidationByVisitId = new Map();
for (const operation of liquidationOperations) {
  const visitId = String(operation.data?.visitId || '');
  if (!visitId) hardStops.push(`liquidation_missing_visit_id:${operation.operationId}`);
  else if (liquidationByVisitId.has(visitId)) hardStops.push(`duplicate_liquidation_visit_id:${visitId}`);
  else liquidationByVisitId.set(visitId, operation);
}

const candidates = safeArray(financial.liquidationCandidates);
const exactCandidates = candidates.filter(item => item.reviewRequired === false && String(item.matchStatus || '').includes('exact'));
const reviewCandidates = candidates.filter(item => item.reviewRequired === true);
const exactByVisitId = new Map();
for (const item of exactCandidates) {
  const visitId = String(item.visitId || '');
  if (!visitId) hardStops.push(`exact_financial_missing_visit_id:${item.sourceRecordId || 'unknown'}`);
  else if (exactByVisitId.has(visitId)) hardStops.push(`duplicate_exact_financial_visit_id:${visitId}`);
  else exactByVisitId.set(visitId, item);
}

if (candidates.length !== Number(expected.financialRows)) hardStops.push('financial_row_count_mismatch');
if (exactCandidates.length !== Number(expected.exactFinancialOverlays)) hardStops.push('financial_exact_count_mismatch');
if (reviewCandidates.length !== Number(expected.financialReviewRows)) hardStops.push('financial_review_count_mismatch');

const unmatchedExactVisitIds = [...exactByVisitId.keys()].filter(visitId => !liquidationByVisitId.has(visitId));
if (unmatchedExactVisitIds.length) hardStops.push(`unmatched_exact_financial_visits:${unmatchedExactVisitIds.length}`);

const overlayedOperations = operations.map(operation => {
  if (operation.domain !== 'liquidation') return operation;
  const visitId = String(operation.data?.visitId || '');
  const financialRow = exactByVisitId.get(visitId);
  if (!financialRow) {
    return {
      ...operation,
      data: {
        ...operation.data,
        financialOverlayState: 'pending_exact_source_link',
        paymentConfirmationStatus: 'not_confirmed',
        paid: false,
        paidAt: null
      }
    };
  }

  const requestedPaymentState = String(financialRow.paymentState || 'scheduled');
  const safePaymentState = requestedPaymentState === 'paid' ? 'payment_confirmation_required' : requestedPaymentState;
  return {
    ...operation,
    data: {
      ...operation.data,
      paymentItemId: financialRow.paymentItemId || operation.data?.paymentItemId,
      financialSourceRecordId: financialRow.sourceRecordId || null,
      financialOverlayState: 'r14c_exact_protected_operational_linked',
      financialMatchStatus: financialRow.matchStatus || 'exact_protected_operational_linked',
      paymentState: safePaymentState,
      paymentControlOnly: true,
      paymentConfirmationStatus: 'not_confirmed',
      paid: false,
      paidAt: null,
      paymentBatchId: null,
      paymentSource: 'r14c_control_row_unconfirmed',
      honorario: compact(financialRow.honorario),
      boleto: compact(financialRow.boleto),
      combo: compact(financialRow.combo),
      reimbursement: compact(financialRow.reimbursement),
      totalKnown: compact(financialRow.totalKnown),
      amountStatus: compact(financialRow.amountStatus),
      missingAmountFields: safeArray(financialRow.missingAmountFields).map(String),
      reviewRequired: false,
      reviewReasons: [],
      sourceRefs: {
        ...(operation.data?.sourceRefs || {}),
        financial: 'r14c_exact_protected_operational_linked'
      }
    }
  };
});

const queueSource = findFinancialReviewQueue(financial);
const financialReviewItems = queueSource.items.map(safeReviewItem);
const dedupedFinancialReviewItems = [...new Map(financialReviewItems.map(item => [item.reviewId, item])).values()];
if (dedupedFinancialReviewItems.length !== Number(expected.financialReviewQueue)) hardStops.push(`financial_review_queue_count_mismatch:${dedupedFinancialReviewItems.length}`);

const shopperReviewItems = safeArray(shopperGap.reviewItems).map((item, index) => ({
  reviewId: String(item.id || deterministicId('shopgap', { index, type: item.type, evidence: item.evidence })),
  kind: String(item.type || 'shopper_source_gap'),
  state: String(item.status || 'review_required'),
  historicalCount: Number(item.evidence?.r5ShopperCount || 0),
  liveCount: Number(item.evidence?.currentShopperCount || 0),
  missingCount: Math.max(0, Number(item.evidence?.r5ShopperCount || 0) - Number(item.evidence?.currentShopperCount || 0)),
  noNameMatching: shopperGap.policy?.noNameMatching === true,
  noAutomaticMerge: shopperGap.policy?.noAutomaticMerge === true,
  materializationEligible: false
}));
if (shopperReviewItems.length !== Number(expected.shopperGapItems)) hardStops.push('shopper_review_item_count_mismatch');

const certificationReviewItems = [{
  reviewId: 'certification_carryover_source_required',
  kind: 'certification_carryover_source_missing',
  state: 'source_required',
  candidateShoppers: Number(certifications.certification?.shoppers || 0),
  sourceRecords: Number(certifications.certification?.records || 0),
  certificationInferred: false,
  materializationEligible: false
}];
if (certificationReviewItems[0].candidateShoppers !== Number(expected.certificationCandidateShoppers)) hardStops.push('certification_candidate_count_mismatch');
if (certificationReviewItems[0].sourceRecords !== Number(expected.certificationSourceRecords)) hardStops.push('certification_source_record_count_mismatch');

const overlayCount = overlayedOperations.filter(operation => operation.domain === 'liquidation' && operation.data?.financialOverlayState === 'r14c_exact_protected_operational_linked').length;
const pendingControlCount = overlayedOperations.filter(operation => operation.domain === 'liquidation' && operation.data?.financialOverlayState === 'pending_exact_source_link').length;
const paidInferredCount = overlayedOperations.filter(operation => operation.domain === 'liquidation' && operation.data?.paid === true).length;
if (overlayCount !== Number(expected.exactFinancialOverlays)) hardStops.push('overlay_count_mismatch');
if (paidInferredCount !== 0) hardStops.push('paid_inference_detected');

const maxBatch = 400;
const writeEligibleOperations = overlayedOperations;
const batches = [];
for (let start = 0; start < writeEligibleOperations.length; start += maxBatch) {
  const items = writeEligibleOperations.slice(start, start + maxBatch);
  batches.push({
    batchId: `r16d_b${String(batches.length + 1).padStart(3, '0')}`,
    sequence: batches.length + 1,
    operationCount: items.length,
    operationIds: items.map(item => item.operationId),
    operationIdsSha256: sha256(items.map(item => item.operationId).join('\n'))
  });
}

const decision = hardStops.length ? contract.decisions.hardStop : contract.decisions.pass;
const plan = {
  schemaVersion: '1.0.0',
  planId: `r16d_${sha256(JSON.stringify({ basePlanId: basePlan.planId, overlayIds: exactCandidates.map(item => item.sourceRecordId), reviewIds: dedupedFinancialReviewItems.map(item => item.reviewId) })).slice(0, 20)}`,
  contractId: contract.contractId,
  generatedAt: new Date().toISOString(),
  mode: 'dry_run',
  tenantId: contract.scope.tenantId,
  projectId: contract.scope.projectId,
  decision,
  basePlanId: basePlan.planId,
  basePlanSha256: basePlan.planSha256,
  operations: overlayedOperations,
  reviewQueues: {
    financial: dedupedFinancialReviewItems,
    shopper: shopperReviewItems,
    certification: certificationReviewItems
  },
  counts: {
    baseOperations: operations.length,
    operations: overlayedOperations.length,
    byDomain: summarize(overlayedOperations, 'domain'),
    settlementControls: liquidationOperations.length,
    financialRows: candidates.length,
    exactFinancialOverlays: overlayCount,
    pendingControlRecords: pendingControlCount,
    financialReviewRows: reviewCandidates.length,
    financialReviewQueue: dedupedFinancialReviewItems.length,
    shopperReviewItems: shopperReviewItems.length,
    shopperGapCount: shopperReviewItems.reduce((sum, item) => sum + item.missingCount, 0),
    certificationReviewItems: certificationReviewItems.length,
    certificationCandidateShoppers: certificationReviewItems[0].candidateShoppers,
    paymentConfirmed: paidInferredCount,
    batches: batches.length
  },
  batches,
  hardStops,
  readiness: {
    sourceAligned: hardStops.length === 0,
    providerComparisonCompleted: false,
    providerComparisonBlocker: 'RESOURCE_EXHAUSTED_FIRESTORE_QUOTA',
    materializationAuthorizationEligible: false,
    nextBlock: hardStops.length ? 'R16D_HARD_STOP_REVIEW' : 'R16E_PROVIDER_COMPARISON_AFTER_QUOTA_RESET'
  },
  safeState: contract.safeState
};
plan.planSha256 = sha256(JSON.stringify({ ...plan, planSha256: undefined }));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'r14c-financial-overlay-review-plan-r16d.json'), stableJson(plan), 'utf8');
fs.writeFileSync(path.join(outDir, 'r14c-financial-overlay-review-plan-r16d-summary.json'), stableJson({
  schemaVersion: plan.schemaVersion,
  planId: plan.planId,
  planSha256: plan.planSha256,
  decision: plan.decision,
  counts: plan.counts,
  reviewQueueSource: queueSource.key,
  hardStops: plan.hardStops,
  readiness: plan.readiness,
  safeState: plan.safeState
}), 'utf8');
fs.writeFileSync(path.join(outDir, 'r14c-financial-overlay-review-plan-r16d.md'), [
  '# CXOrbia Phase A R16D — R14C overlay and review plan', '',
  `Decision: ${decision}`,
  `Base operations: ${operations.length}`,
  `Settlement controls: ${liquidationOperations.length}`,
  `Financial rows: ${candidates.length}`,
  `Exact financial overlays: ${overlayCount}`,
  `Pending control records: ${pendingControlCount}`,
  `Financial review rows: ${reviewCandidates.length}`,
  `Financial review queue: ${dedupedFinancialReviewItems.length}`,
  `Shopper gap: ${plan.counts.shopperGapCount}`,
  `Certification candidates pending source: ${plan.counts.certificationCandidateShoppers}`,
  `Payment confirmed/inferred: ${paidInferredCount}`,
  `Batches: ${batches.length}`,
  `Next block: ${plan.readiness.nextBlock}`,
  '',
  'No provider calls, writes, deletes, imports, deploy, production, payments or PII.'
].join('\n'), 'utf8');

console.log(stableJson({
  decision,
  planId: plan.planId,
  counts: plan.counts,
  reviewQueueSource: queueSource.key,
  hardStops,
  readiness: plan.readiness,
  safeState: plan.safeState
}));

process.exitCode = hardStops.length ? 2 : 0;
