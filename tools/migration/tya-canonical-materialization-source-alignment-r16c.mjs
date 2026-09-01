#!/usr/bin/env node
/*
  CXOrbia Phase A R16C — offline canonical-source alignment gate.

  No provider calls. It verifies that HR-derived settlement controls are not
  confused with R14C financial rows and that certifications/payments remain
  blocked until their source records are materializable.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const contractPath = arg('--contract', 'backend/contracts/phase-a-canonical-materialization-source-alignment-r16c-v1.json');
const planPath = arg('--plan', '.tmp/r16c-materialization-plan/firestore-materialization-plan.json');
const financialPath = arg('--financial', 'backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json');
const shopperGapPath = arg('--shopper-gap', 'backend/config/phase-a-shopper-source-snapshot-gap-review-r11d.source-safe.json');
const certificationPath = arg('--certifications', 'backend/config/phase-a-liquidation-certification-projection-summary.source-safe.json');
const outDirArg = arg('--out', '.tmp/canonical-materialization-source-alignment-r16c');
const outDir = path.isAbsolute(outDirArg) ? outDirArg : path.join(root, outDirArg);

const readJson = file => JSON.parse(fs.readFileSync(path.isAbsolute(file) ? file : path.join(root, file), 'utf8'));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const countBy = (items, getter) => items.reduce((acc, item) => {
  const key = getter(item) || 'unknown';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const contract = readJson(contractPath);
const plan = readJson(planPath);
const financial = readJson(financialPath);
const shopperGap = readJson(shopperGapPath);
const certifications = readJson(certificationPath);
const operations = Array.isArray(plan.operations) ? plan.operations : [];

const byDomain = countBy(operations, operation => operation.domain);
const liquidations = operations.filter(operation => operation.domain === 'liquidation');
const visits = operations.filter(operation => operation.domain === 'visit');
const shoppers = operations.filter(operation => operation.domain === 'shopper');
const certificationOps = operations.filter(operation => operation.domain === 'certification');
const paymentOps = operations.filter(operation => ['payment', 'paymentLot', 'financeMovement'].includes(operation.domain));

const financialOverlayOps = liquidations.filter(operation => {
  const data = operation.data || {};
  const source = String(data.sourceRefs?.financial || data.financialSource || data.paymentSource || '');
  return source.includes('r14') || source.includes('financial_reconciliation') || source.includes('exact_protected_operational_linked');
});
const paidInferredOps = liquidations.filter(operation => operation.data?.paid === true || operation.data?.paymentState === 'paid');
const certificationInferredOps = certificationOps.filter(operation => operation.data?.status === 'approved' || operation.data?.certificationStatus === 'approved');

const sourceCounts = {
  hrVisits: Number(financial.summary?.hrVisits || 0),
  liveShoppers: Number(shopperGap.reviewItems?.[0]?.evidence?.currentShopperCount || 0),
  historicalShopperReferences: Number(shopperGap.reviewItems?.[0]?.evidence?.r5ShopperCount || certifications.certification?.shoppers || 0),
  financialRows: Number(financial.summary?.financialLiquidationRows || 0),
  financialExactLinks: Number(financial.summary?.exactAcceptedLinks || 0),
  financialReviewRows: Number(financial.summary?.reviewLiquidationRows || 0),
  financialReviewQueue: Number(financial.summary?.reviewQueue || 0),
  certificationCandidateShoppers: Number(certifications.certification?.shoppers || 0),
  certificationSourceRecords: Number(certifications.certification?.records || 0)
};

const requiredMismatches = [];
for (const [key, expected] of Object.entries(contract.required || {})) {
  const actual = sourceCounts[key];
  if (actual !== Number(expected)) requiredMismatches.push({ key, expected: Number(expected), actual });
}

const planChecks = {
  dryRun: plan.mode === 'dry_run' && plan.writes === false && plan.imported === false && plan.production === false,
  tenantMatches: plan.tenantId === contract.required?.tenantId || plan.tenantId === 'tya',
  projectMatches: plan.projectId === contract.required?.projectId || plan.projectId === 'cinepolis',
  visitCountMatchesCanonical: visits.length === sourceCounts.hrVisits,
  shopperCountMatchesLive: shoppers.length === sourceCounts.liveShoppers,
  visitDerivedSettlementControls: liquidations.length > sourceCounts.financialRows,
  financialOverlayCount: financialOverlayOps.length,
  expectedFinancialOverlayCount: sourceCounts.financialExactLinks,
  financialOverlayComplete: financialOverlayOps.length === sourceCounts.financialExactLinks,
  financialReviewRowsHeld: sourceCounts.financialReviewRows > 0,
  financialReviewQueueHeld: sourceCounts.financialReviewQueue > 0,
  certificationsBlocked: certificationOps.length === 0 && sourceCounts.certificationSourceRecords === 0,
  paymentsBlocked: paymentOps.length === 0,
  paidNotInferred: paidInferredOps.length === 0,
  certificationNotInferred: certificationInferredOps.length === 0,
  noNameMatching: shopperGap.policy?.noNameMatching === true,
  noAutomaticMerge: shopperGap.policy?.noAutomaticMerge === true
};

const unsafe = !planChecks.dryRun ||
  !planChecks.visitCountMatchesCanonical ||
  !planChecks.shopperCountMatchesLive ||
  !planChecks.certificationsBlocked ||
  !planChecks.paymentsBlocked ||
  !planChecks.paidNotInferred ||
  !planChecks.certificationNotInferred ||
  requiredMismatches.length > 0;

const overlayMissing = !unsafe && !planChecks.financialOverlayComplete;
const decision = unsafe
  ? contract.decisions.unsafe
  : overlayMissing
    ? contract.decisions.overlayMissing
    : contract.decisions.aligned;

const writeEligible = decision === contract.decisions.aligned;
const controlOnlyLiquidations = liquidations.length - financialOverlayOps.length;

const report = {
  schemaVersion: '1.0.0',
  reportId: 'phase-a-canonical-materialization-source-alignment-r16c',
  generatedAt: new Date().toISOString(),
  decision,
  tenantId: plan.tenantId,
  projectId: plan.projectId,
  plan: {
    planId: plan.planId,
    operationCount: operations.length,
    byDomain,
    plannedBatchCount: Array.isArray(plan.batches) ? plan.batches.length : 0,
    liquidationRecordMeaning: 'visit_level_settlement_control_not_payment_confirmation',
    settlementControlRecords: liquidations.length,
    controlOnlyLiquidations,
    financialOverlayOps: financialOverlayOps.length,
    certificationOps: certificationOps.length,
    paymentOps: paymentOps.length
  },
  canonicalSources: sourceCounts,
  checks: planChecks,
  requiredMismatches,
  readiness: {
    providerComparisonCompleted: false,
    providerComparisonBlocker: 'RESOURCE_EXHAUSTED_FIRESTORE_QUOTA',
    sourceAlignmentCompleted: true,
    writeEligible,
    materializationAuthorizationEligible: false,
    nextBlock: overlayMissing
      ? 'R16D_BUILD_R14C_FINANCIAL_OVERLAY_AND_REVIEW_QUEUE_PLAN'
      : writeEligible
        ? 'R17_MATERIALIZATION_AUTHORIZATION_PACKAGE_NOT_EXECUTE'
        : 'R16C_HARD_STOP_REVIEW'
  },
  reviewQueuesPreserved: {
    shopperGapItems: Number(shopperGap.counts?.reviewItems || 0),
    shopperGapCount: Math.max(0, sourceCounts.historicalShopperReferences - sourceCounts.liveShoppers),
    financialReviewRows: sourceCounts.financialReviewRows,
    financialReviewQueue: sourceCounts.financialReviewQueue,
    certificationCandidatesPendingSource: sourceCounts.certificationCandidateShoppers,
    noNameMatching: planChecks.noNameMatching,
    noAutomaticMerge: planChecks.noAutomaticMerge
  },
  classification: {
    reusableCXOrbia: 'separate visit settlement controls, source-linked financial overlays, review queues and payment confirmation',
    exclusiveClient: 'TyA/Cinepolis counts and R14C matching outcomes',
    claudePrototype: 'no P0 frontend change; keep payment and certification states honest',
    academia: 'teach control record versus financial source row versus confirmed payment',
    sinImpactoClaude: 'offline validator, hashes and provider quota gate'
  },
  safeState: contract.safeState
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'canonical-materialization-source-alignment-r16c-report.json'), stableJson(report), 'utf8');
fs.writeFileSync(path.join(outDir, 'canonical-materialization-source-alignment-r16c-report.md'), [
  '# CXOrbia Phase A R16C — canonical source alignment',
  '',
  `Decision: ${decision}`,
  `Plan operations: ${operations.length}`,
  `Visits: ${visits.length}`,
  `Shoppers: ${shoppers.length}`,
  `Settlement-control records: ${liquidations.length}`,
  `R14C financial rows: ${sourceCounts.financialRows}`,
  `R14C exact links: ${sourceCounts.financialExactLinks}`,
  `Financial overlays currently in plan: ${financialOverlayOps.length}`,
  `R14C review rows: ${sourceCounts.financialReviewRows}`,
  `R14C review queue: ${sourceCounts.financialReviewQueue}`,
  `Certification candidates pending source: ${sourceCounts.certificationCandidateShoppers}`,
  `Write eligible: ${writeEligible}`,
  `Next block: ${report.readiness.nextBlock}`,
  '',
  'No provider calls, writes, deletes, imports, deploy, production, payments or PII.'
].join('\n'), 'utf8');

console.log(stableJson({
  decision,
  operationCount: operations.length,
  byDomain,
  settlementControlRecords: liquidations.length,
  financialRows: sourceCounts.financialRows,
  financialExactLinks: sourceCounts.financialExactLinks,
  financialOverlayOps: financialOverlayOps.length,
  financialReviewRows: sourceCounts.financialReviewRows,
  financialReviewQueue: sourceCounts.financialReviewQueue,
  certificationCandidatesPendingSource: sourceCounts.certificationCandidateShoppers,
  writeEligible,
  nextBlock: report.readiness.nextBlock,
  safeState: report.safeState
}));

process.exitCode = unsafe ? 2 : 0;
