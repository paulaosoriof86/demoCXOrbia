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
const resolveArg = (name, fallback) => path.resolve(repo, arg(name, fallback));
const hrPath = resolveArg('--hr', '.tmp/firestore-materialization-plan-full/source/tya-hr-source-safe-periods.r18b.js');
const planPath = resolveArg('--plan', '.tmp/firestore-materialization-plan-full/firestore-materialization-plan.json');
const outDir = resolveArg('--out', path.dirname(path.relative(repo, planPath)));
const reportPath = path.join(outDir, 'existing-overlays-materialization-verification.json');
const summaryPath = path.join(outDir, 'firestore-materialization-summary.json');
const markdownPath = path.join(outDir, 'firestore-materialization-plan.md');
const batchDir = path.join(outDir, 'batches');

const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const asAmount = value => value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;

function readAssignment(file, globalName) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 5000 });
  const value = sandbox.window[globalName];
  if (!value || typeof value !== 'object') throw new Error(`Missing window.${globalName} in ${file}`);
  return JSON.parse(JSON.stringify(value));
}

const hr = readAssignment(hrPath, 'CX_TYA_HR_SOURCE_SAFE');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const overlay = hr.existingOverlays;
if (overlay?.integrationId !== 'R18B_APPLY_EXISTING_R11D_R14C_AND_CERTIFICATION_OUTPUTS') {
  throw new Error('R18B existing overlays are required before materialization overlay application.');
}
if (overlay.r14c?.exactLinksApplied !== 196 || overlay.r14c?.missingVisitLinks !== 0 || overlay.r14c?.reconciledAgain !== false) {
  throw new Error('R14C existing result is not the approved 196-link fail-closed output.');
}
if (overlay.r11d?.reviewItemsApplied !== 1 || overlay.r11d?.identitiesInvented !== 0 || overlay.r11d?.reconciledAgain !== false) {
  throw new Error('R11D existing result is not the approved anti-rework output.');
}
if (overlay.certification?.carryoverConfirmed !== 0 || overlay.certification?.requestedAgainAutomatically !== 0) {
  throw new Error('Certification carryover state is not fail-closed.');
}

const visitById = new Map((hr.visits || []).map(visit => [visit.id, visit]));
let visitOverlayCount = 0;
let liquidationOverlayCount = 0;

for (const operation of plan.operations || []) {
  if (operation.domain === 'visit') {
    const sourceVisit = visitById.get(operation.data?.visitId);
    const control = sourceVisit?.financialControl;
    if (!control) continue;
    operation.data.financialControl = {
      sourceRecordId: control.sourceRecordId || null,
      paymentItemId: control.paymentItemId || null,
      matchStatus: control.matchStatus,
      matchMethod: control.matchMethod,
      currency: control.currency || operation.data.currency || null,
      honorario: asAmount(control.honorario),
      boleto: asAmount(control.boleto),
      combo: asAmount(control.combo),
      total: asAmount(control.total),
      sourceSafe: true,
      imported: false,
      paymentExecuted: false,
      appliedFrom: 'R14C_existing_result'
    };
    operation.data.liquidationState = sourceVisit.liquidationState || 'liquidation_candidate_exact_financial_link';
    operation.data.paymentState = 'pending_financial_review';
    operation.data.paymentConfirmed = false;
    operation.data.paymentControlOnly = true;
    visitOverlayCount += 1;
  }

  if (operation.domain === 'liquidation') {
    const sourceVisit = visitById.get(operation.data?.visitId);
    const control = sourceVisit?.financialControl;
    if (!control) continue;
    const honorario = asAmount(control.honorario);
    const boleto = asAmount(control.boleto);
    const combo = asAmount(control.combo);
    const missing = [];
    if (honorario === null) missing.push('honorario');
    if (boleto === null) missing.push('boleto');
    if (combo === null) missing.push('combo');
    operation.data.paymentItemId = control.paymentItemId || operation.data.paymentItemId;
    operation.data.currency = control.currency || operation.data.currency || null;
    operation.data.honorario = honorario ?? 0;
    operation.data.boleto = boleto ?? 0;
    operation.data.combo = combo ?? 0;
    operation.data.reimbursement = (boleto ?? 0) + (combo ?? 0);
    operation.data.totalKnown = asAmount(control.total) ?? [honorario, boleto, combo].filter(value => value !== null).reduce((sum, value) => sum + value, 0);
    operation.data.amountStatus = missing.length ? 'partial_pending_source' : 'complete';
    operation.data.missingAmountFields = missing;
    operation.data.liquidationState = sourceVisit.liquidationState || 'liquidation_candidate_exact_financial_link';
    operation.data.paymentState = 'pending_financial_review';
    operation.data.paid = false;
    operation.data.paidAt = null;
    operation.data.paymentBatchId = null;
    operation.data.lotEligible = false;
    operation.data.reviewRequired = true;
    operation.data.reviewReasons = [...new Set([...(operation.data.reviewReasons || []).filter(reason => reason !== 'historical_payment_source_match_required'), 'payment_confirmation_evidence_missing'])];
    operation.data.financialControlRef = {
      sourceRecordId: control.sourceRecordId || null,
      paymentItemId: control.paymentItemId || null,
      matchStatus: control.matchStatus,
      matchMethod: control.matchMethod,
      appliedFrom: 'R14C_existing_result'
    };
    operation.data.sourceRefs = {
      ...(operation.data.sourceRefs || {}),
      financial: 'R14C_existing_result:exact_protected_operational_linked'
    };
    liquidationOverlayCount += 1;
  }
}

if (visitOverlayCount !== 196 || liquidationOverlayCount !== 196) {
  throw new Error(`Expected 196 visit and liquidation overlays; got visits=${visitOverlayCount}, liquidations=${liquidationOverlayCount}`);
}

plan.existingOverlays = {
  integrationId: 'R18B_MATERIALIZATION_PLAN_EXISTING_OUTPUTS',
  sourceIntegrationId: overlay.integrationId,
  r14c: {
    exactLinksApplied: overlay.r14c.exactLinksApplied,
    reviewItemsApplied: overlay.r14c.reviewItemsApplied,
    missingVisitLinks: overlay.r14c.missingVisitLinks,
    paidConfirmedOrInferred: 0,
    reconciledAgain: false
  },
  r11d: {
    reviewItemsApplied: overlay.r11d.reviewItemsApplied,
    identitiesInvented: 0,
    reconciledAgain: false
  },
  certification: {
    sourceStatus: overlay.certification.sourceStatus,
    sourceRecords: overlay.certification.sourceRecords,
    carryoverConfirmed: 0,
    requestedAgainAutomatically: 0,
    reconciledAgain: false
  }
};
plan.counts = {
  ...(plan.counts || {}),
  existingOverlays: {
    financialExactLinksApplied: 196,
    financialReviewQueue: overlay.r14c.reviewItemsApplied,
    shopperSourceReviewQueue: overlay.r11d.reviewItemsApplied,
    certificationReviewQueue: 1,
    paidConfirmed: 0,
    certificationCarryoverConfirmed: 0
  }
};
plan.blockedDomains = {
  ...(plan.blockedDomains || {}),
  payments: {
    state: 'pending_financial_review',
    sourceRecords: 196,
    exactVisitLinks: 196,
    reviewItems: overlay.r14c.reviewItemsApplied,
    plannedOperations: 0,
    reason: 'exact financial-control links exist, but payment confirmation still requires item-level date, batch and actor evidence'
  },
  paymentLots: {
    state: 'blocked',
    sourceRecords: 0,
    plannedOperations: 0,
    reason: 'no lot before confirmed item-level payments'
  },
  certifications: {
    state: overlay.certification.sourceStatus || 'pending_certification_source',
    sourceRecords: overlay.certification.sourceRecords || 0,
    plannedOperations: 0,
    candidateShoppers: plan.counts?.source?.shoppers || 0,
    reason: 'reviewed carryover source required; do not request certifications again automatically'
  }
};

const refreshedBatches = [];
for (const batch of plan.batches || []) {
  const batchOperations = batch.operationIds.map(id => plan.operations.find(item => item.operationId === id));
  const refreshed = {
    ...batch,
    operationCount: batchOperations.length,
    operationPathsSha256: sha256(Buffer.from(batchOperations.map(item => item.documentPath).join('\n')))
  };
  refreshedBatches.push(refreshed);
}
plan.batches = refreshedBatches;
const { planSha256: _oldPlanSha, operations: _operations, ...planCore } = plan;
plan.planSha256 = sha256(Buffer.from(stableJson(planCore)));

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(batchDir, { recursive: true });
fs.writeFileSync(planPath, stableJson(plan), 'utf8');
for (const batch of plan.batches) {
  const batchOperations = batch.operationIds.map(id => plan.operations.find(item => item.operationId === id));
  fs.writeFileSync(path.join(batchDir, `${batch.batchId}.json`), stableJson({
    schemaVersion: '1.0.0',
    planId: plan.planId,
    planSha256: plan.planSha256,
    ...batch,
    operations: batchOperations,
    writes: false,
    imported: false,
    production: false
  }), 'utf8');
}
const operationPathsSha256 = sha256(Buffer.from(plan.operations.map(item => item.documentPath).join('\n')));
const summary = { ...planCore, planSha256: plan.planSha256, operationPathsSha256 };
fs.writeFileSync(summaryPath, stableJson(summary), 'utf8');
fs.writeFileSync(markdownPath, `# Phase A Firestore materialization plan with existing overlays\n\n- Plan: \`${plan.planId}\`\n- Plan SHA-256: \`${plan.planSha256}\`\n- Operations: ${plan.operations.length}\n- Batches: ${plan.batches.length}\n- Periods: ${plan.counts.byDomain.period || 0}\n- Visits: ${plan.counts.byDomain.visit || 0}\n- Shoppers: ${plan.counts.byDomain.shopper || 0}\n- Liquidations: ${plan.counts.byDomain.liquidation || 0}\n- Exact R14C financial-control links applied: 196\n- Financial review items preserved: ${overlay.r14c.reviewItemsApplied}\n- Shopper source review items preserved: ${overlay.r11d.reviewItemsApplied}\n- Payments planned: 0\n- Certifications planned: 0\n\nState: **DRY-RUN ONLY — NOT EXECUTED**.\n`, 'utf8');

const report = {
  schemaVersion: '1.0.0',
  reportId: 'phase-a-materialization-existing-overlays',
  decision: 'PASS_EXISTING_R11D_R14C_CERTIFICATION_OUTPUTS_APPLIED_TO_PLAN',
  planId: plan.planId,
  planSha256: plan.planSha256,
  operationPathsSha256,
  counts: plan.counts,
  checks: {
    r18bSourcePresent: true,
    exactVisitOverlays: visitOverlayCount === 196,
    exactLiquidationOverlays: liquidationOverlayCount === 196,
    financialReviewQueuePreserved: overlay.r14c.reviewItemsApplied === 92,
    shopperReviewPreserved: overlay.r11d.reviewItemsApplied === 1,
    noPaymentsConfirmed: !plan.operations.some(item => item.data?.paid === true || item.data?.paymentConfirmed === true),
    noCertificationOperations: !plan.operations.some(item => item.domain === 'certification'),
    noReconciliationRerun: overlay.r14c.reconciledAgain === false && overlay.r11d.reconciledAgain === false
  },
  safeState: {
    writes: false,
    imported: false,
    production: false,
    providers: false,
    paymentsExecuted: false
  }
};
fs.writeFileSync(reportPath, stableJson(report), 'utf8');
console.log(stableJson(report));
