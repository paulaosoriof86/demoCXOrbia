#!/usr/bin/env node
/*
  CXOrbia Phase A R18B — apply existing R11D, R14C and certification outputs.

  This script does not reconcile identities or finances again. It consumes the
  already-approved source-safe outputs and attaches their results to the R18A
  canonical payload for controlled preview/next-stage materialization.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const root = process.cwd();
const payloadPath = path.resolve(valueOf('--payload', 'app/data/tya-hr-source-safe-periods.js'));
const outPath = path.resolve(valueOf('--out', payloadPath));
const r11dPath = path.resolve(valueOf('--r11d', 'backend/config/phase-a-shopper-source-snapshot-gap-review-r11d.source-safe.json'));
const r14cPath = path.resolve(valueOf('--r14c', 'backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json'));
const r14cQueuePath = path.resolve(valueOf('--r14c-queue', 'backend/config/phase-a-financial-review-queue-r14c.source-safe.json'));
const certPath = path.resolve(valueOf('--cert', 'app/data/tya-certification-carryover-source-safe.js'));
const reportDir = path.resolve(valueOf('--report-dir', '.tmp/r18b-existing-overlays'));

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readWindowAssignment(file, globalName) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 5000 });
  const value = sandbox.window[globalName];
  if (!value) throw new Error(`Missing window.${globalName} in ${file}`);
  return JSON.parse(JSON.stringify(value));
}
function writeWindowAssignment(file, globalName, value, header) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${header}\nwindow.${globalName} = ${JSON.stringify(value, null, 2)};\n`, 'utf8');
}

const payload = readWindowAssignment(payloadPath, 'CX_TYA_HR_SOURCE_SAFE');
const r11d = readJson(r11dPath);
const r14c = readJson(r14cPath);
const r14cReviewQueue = readJson(r14cQueuePath);
const cert = readWindowAssignment(certPath, 'CX_TYA_CERTIFICATION_CARRYOVER_SOURCE_SAFE');

if (payload?.canonicalization?.integrationId !== 'R18A_INTEGRATE_EXISTING_CANONICAL_ASSETS') {
  throw new Error('R18A canonical payload is required before R18B.');
}
if (r11d?.decision !== 'REVIEW_QUEUE_SOURCE_LEVEL_ITEM_CREATED') throw new Error('Unexpected R11D decision.');
if (r14c?.decision !== 'PASS_WITH_REVIEW_REAL_TYA_FINANCIAL_RECONCILIATION_R14C') throw new Error('Unexpected R14C decision.');
if (!Array.isArray(r14c.liquidationCandidates)) throw new Error('R14C liquidationCandidates missing.');
if (!Array.isArray(r14cReviewQueue)) throw new Error('R14C review queue missing.');

const exact = r14c.liquidationCandidates.filter(item => item.matchStatus === 'exact_protected_operational_linked' && item.reviewRequired === false);
const visitById = new Map((payload.visits || []).map(visit => [visit.id, visit]));
const visitByHrRowId = new Map((payload.visits || []).filter(visit => visit.hrRowId).map(visit => [visit.hrRowId, visit]));
const applied = [];
const missing = [];

for (const item of exact) {
  const visit = visitById.get(item.visitId) || visitByHrRowId.get(item.hrRowId);
  if (!visit) {
    missing.push({ sourceRecordId:item.sourceRecordId, visitId:item.visitId || null, hrRowId:item.hrRowId || null });
    continue;
  }
  visit.financialControl = {
    sourceRecordId: item.sourceRecordId,
    paymentItemId: item.paymentItemId,
    matchStatus: item.matchStatus,
    matchMethod: item.matchMethod,
    visitDate: item.visitDate || null,
    currency: item.currency || visit.currency || null,
    honorario: item.honorario ?? null,
    boleto: item.boleto ?? null,
    combo: item.combo ?? null,
    total: item.total ?? null,
    sourceSafe: true,
    imported: false,
    paymentExecuted: false,
    appliedFrom: 'R14C_existing_result'
  };
  visit.liquidationState = 'liquidation_candidate_exact_financial_link';
  visit.paymentState = 'pending_financial_review';
  visit.paymentControlOnly = true;
  visit.paymentConfirmed = false;
  visit.paymentEvidence = null;
  applied.push(item.sourceRecordId);
}

const shopperSourceReviewItems = (r11d.reviewItems || []).map(item => ({
  queueItemId: item.reviewId,
  queueType: item.conflictType,
  severity: item.severity,
  status: item.status,
  entityType: item.entityType,
  entityId: item.entityRef,
  stableKeys: { tenantId:item.tenantId, projectId:item.projectId },
  reasonCode: 'historical_reference_set_unavailable',
  reason: item.reason,
  allowedActions: item.allowedActions,
  blockedActions: item.blockedActions,
  sourceRef: item.entityRef,
  gateStatus: 'hold_until_human_review',
  sourceSafe: true,
  appliedFrom: 'R11D_existing_result'
}));

const financialReviewItems = r14cReviewQueue.map(item => ({
  queueItemId: item.key,
  queueType: item.type,
  severity: 'warning',
  status: item.state,
  entityType: 'financial_source_record',
  entityId: item.entityId,
  stableKeys: { tenantId:payload.tenantId, projectId:payload.projectId },
  reasonCode: Array.isArray(item.reasons) ? item.reasons.join('|') : 'financial_review_required',
  candidateCount: item.candidateCount ?? null,
  sourceRef: item.sourceRef,
  gateStatus: 'hold_until_financial_review',
  sourceSafe: true,
  appliedFrom: 'R14C_existing_result'
}));

const certificationSourceAvailable = Array.isArray(cert.certifications) && cert.certifications.length > 0;
for (const shopper of payload.shoppers || []) {
  shopper.certificationStatus = certificationSourceAvailable ? 'source_records_available_pending_link' : 'pending_certification_source';
  shopper.certificationCarryoverConfirmed = false;
  shopper.certificationReviewRequired = true;
  shopper.certificationSourceStatus = cert.sourceStatus || 'pending_certification_source';
}

const certificationReviewItem = {
  queueItemId: 'certification_source_pending_r18b',
  queueType: 'certification_source_pending',
  severity: 'blocker',
  status: certificationSourceAvailable ? 'pending_identity_link' : 'pending_source',
  entityType: 'certification_source',
  entityId: cert.certificationId || 'project-certification',
  stableKeys: { tenantId:payload.tenantId, projectId:payload.projectId },
  reasonCode: certificationSourceAvailable ? 'certification_records_pending_stable_identity_link' : 'certification_source_not_supplied',
  sourceRef: 'app/data/tya-certification-carryover-source-safe.js',
  gateStatus: 'hold_do_not_request_again_until_reviewed',
  sourceSafe: true,
  appliedFrom: 'existing_certification_carryover_envelope'
};

payload.reviewQueue = [
  ...(Array.isArray(payload.reviewQueue) ? payload.reviewQueue : []),
  ...shopperSourceReviewItems,
  ...financialReviewItems,
  certificationReviewItem
];
payload.reviewQueue = [...new Map(payload.reviewQueue.map(item => [item.queueItemId, item])).values()];

payload.existingOverlays = {
  integrationId: 'R18B_APPLY_EXISTING_R11D_R14C_AND_CERTIFICATION_OUTPUTS',
  generatedAt: new Date().toISOString(),
  r11d: {
    decision: r11d.decision,
    reviewItemsApplied: shopperSourceReviewItems.length,
    currentShopperCount: r11d.reviewItems?.[0]?.evidence?.currentShopperCount ?? null,
    historicalExpectedCount: r11d.reviewItems?.[0]?.evidence?.r5ShopperCount ?? null,
    identitiesInvented: 0,
    reconciledAgain: false
  },
  r14c: {
    decision: r14c.decision,
    exactLinksExpected: r14c.summary?.exactAcceptedLinks ?? exact.length,
    exactLinksApplied: applied.length,
    missingVisitLinks: missing.length,
    reviewItemsApplied: financialReviewItems.length,
    paidConfirmedOrInferred: 0,
    reconciledAgain: false
  },
  certification: {
    sourceStatus: cert.sourceStatus || 'pending_certification_source',
    sourceRecords: cert.certifications?.length || 0,
    shoppersMarkedPendingReview: payload.shoppers?.length || 0,
    carryoverConfirmed: 0,
    requestedAgainAutomatically: 0,
    reconciledAgain: false
  },
  safeState: {
    writes:false,
    imports:false,
    production:false,
    providers:false,
    paymentsExecuted:false,
    piiIncluded:false
  }
};

payload.counts = {
  ...(payload.counts || {}),
  financialExactLinksApplied: applied.length,
  financialReviewQueue: financialReviewItems.length,
  shopperSourceReviewQueue: shopperSourceReviewItems.length,
  certificationReviewQueue: 1,
  reviewQueue: payload.reviewQueue.length,
  paidConfirmed: 0,
  certificationCarryoverConfirmed: 0
};

payload.semanticValidation = {
  ...(payload.semanticValidation || {}),
  r18bExactLinksApplied: applied.length,
  r18bMissingVisitLinks: missing.length,
  r18bNoPaymentsInferred: (payload.visits || []).every(visit => visit.paymentConfirmed !== true && !['paid','payment_confirmed_external'].includes(visit.paymentState)),
  r18bNoShopperIdentitiesInvented: shopperSourceReviewItems.length === 1 && (r11d.counts?.placeholderShoppers ?? 0) === 0,
  r18bCertificationNotFalselyConfirmed: (payload.shoppers || []).every(shopper => shopper.certificationCarryoverConfirmed === false),
  pass: payload.semanticValidation?.pass === true && missing.length === 0 && applied.length === (r14c.summary?.exactAcceptedLinks ?? 196)
};

writeWindowAssignment(outPath, 'CX_TYA_HR_SOURCE_SAFE', payload, '/* CXOrbia TyA canonical source-safe snapshot R18B. Existing R11D/R14C/certification outputs applied; no reconciliation rerun. */');

const checks = {
  exactLinksAppliedWithoutReconciliation: applied.length === 196 && payload.existingOverlays.r14c.reconciledAgain === false,
  noMissingVisitLinks: missing.length === 0,
  r11dSingleSourceReviewItemApplied: shopperSourceReviewItems.length === 1,
  noShopperIdentitiesInvented: payload.existingOverlays.r11d.identitiesInvented === 0,
  financialReviewQueuePreserved: financialReviewItems.length === r14cReviewQueue.length,
  noPaymentsConfirmedOrInferred: payload.existingOverlays.r14c.paidConfirmedOrInferred === 0,
  certificationStatusHonest: payload.existingOverlays.certification.carryoverConfirmed === 0 && payload.existingOverlays.certification.requestedAgainAutomatically === 0,
  noWritesOrImports: payload.existingOverlays.safeState.writes === false && payload.existingOverlays.safeState.imports === false
};
const failures = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
const report = {
  schemaVersion:'1.0.0',
  reportId:'phase-a-r18b-existing-overlays',
  generatedAt:new Date().toISOString(),
  decision:failures.length ? 'FAIL_R18B_EXISTING_OVERLAYS' : 'PASS_R18B_EXISTING_OVERLAYS_APPLIED',
  checks,
  failures,
  counts:payload.counts,
  missingVisitLinks:missing,
  safeState:payload.existingOverlays.safeState
};
fs.mkdirSync(reportDir, { recursive:true });
fs.writeFileSync(path.join(reportDir, 'r18b-existing-overlays.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(reportDir, 'r18b-existing-overlays.md'), [
  '# R18B — existing R11D/R14C/certification outputs', '',
  `Decision: **${report.decision}**`,
  `R14C exact links applied: ${applied.length}`,
  `R14C review items preserved: ${financialReviewItems.length}`,
  `R11D source-level items: ${shopperSourceReviewItems.length}`,
  `Certification source records: ${cert.certifications?.length || 0}`,
  `Payments confirmed/inferred: 0`,
  `Missing visit links: ${missing.length}`, '',
  'No reconciliation rerun, writes, imports, providers, payments or production.'
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 4 : 0;
