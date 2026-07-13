#!/usr/bin/env node
/*
  CXOrbia Phase A R15E - deterministic canonical-source drift classifier.

  This runner uses only committed source-safe summaries and repository files.
  It performs no provider calls and no writes outside the requested report dir.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = path.join(root, outIdx >= 0 ? args[outIdx + 1] : '.tmp/firestore-canonical-drift-r15e');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
function readText(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function hasScript(html, src) {
  return html.includes(`src="${src}"`) || html.includes(`src='${src}'`);
}
function delta(a, b) {
  return Number(a || 0) - Number(b || 0);
}

const r15c = readJson('backend/config/phase-a-firebase-existing-dev-provenance-r15c-result.source-safe.json');
const r15d = readJson('backend/config/phase-a-cxdata-firestore-readonly-r15d-result.source-safe.json');
const period = readJson('backend/config/phase-a-period-history-integrity-snapshot.source-safe.json');
const shopperGap = readJson('backend/config/phase-a-shopper-source-snapshot-gap-review-r11d.source-safe.json');
const finance = readJson('backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json');
const projection = readJson('backend/config/phase-a-liquidation-certification-projection-summary.source-safe.json');
const index = readText('app/index.html');
const backendIndex = readText('app/index-backend-dev.html');
const sourceSafeSmokeWorkflow = readText('.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml');
const deployWorkflow = readText('.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml');

const liveShopperCount = shopperGap.reviewItems?.[0]?.evidence?.currentShopperCount ?? 0;
const historicalShopperCount = shopperGap.reviewItems?.[0]?.evidence?.r5ShopperCount ?? projection.certification?.shoppers ?? 0;
const canonicalVisits = period.counts?.visits ?? 0;
const firestoreVisits = r15d.snapshot?.visits ?? 0;
const canonicalFinancialRows = finance.summary?.financialLiquidationRows ?? 0;
const firestoreLiquidations = r15d.snapshot?.liquidations ?? 0;
const firestoreShoppers = r15d.snapshot?.shoppers ?? 0;
const firestoreCertifications = r15d.snapshot?.certifications ?? 0;
const pendingCertificationShoppers = projection.certification?.shoppers ?? 0;

const binding = {
  rootIndexLoadsPayload: hasScript(index, 'data/tya-hr-source-safe-periods.js'),
  rootIndexLoadsBridge: hasScript(index, 'core/tya-phase-a-source-safe-preview.js'),
  backendIndexLoadsPayload: hasScript(backendIndex, 'data/tya-hr-source-safe-periods.js'),
  backendIndexLoadsBridge: hasScript(backendIndex, 'core/tya-phase-a-source-safe-preview.js'),
  sourceSafeSmokeUsesDeterministicBinder: sourceSafeSmokeWorkflow.includes('tya-source-safe-binding-build-r15f.mjs'),
  sourceSafeSmokeInjectsPayload: sourceSafeSmokeWorkflow.includes('data/tya-hr-source-safe-periods.js'),
  sourceSafeSmokeInjectsBridge: sourceSafeSmokeWorkflow.includes('core/tya-phase-a-source-safe-preview.js'),
  deployBuildsPayload: deployWorkflow.includes('tya-build-live-hr-source-safe-static.mjs'),
  deployUsesDeterministicBinder: deployWorkflow.includes('tya-source-safe-binding-build-r15f.mjs'),
  deployInjectsPayload: deployWorkflow.includes('data/tya-hr-source-safe-periods.js'),
  deployInjectsBridge: deployWorkflow.includes('core/tya-phase-a-source-safe-preview.js')
};

const drift = {
  preferredCanonicalProjectMissingInFirestore: r15d.target?.preferredProjectFound === false,
  visitCountDeltaFirestoreMinusCanonical: delta(firestoreVisits, canonicalVisits),
  shopperCountDeltaFirestoreMinusLive: delta(firestoreShoppers, liveShopperCount),
  shopperCountDeltaFirestoreMinusHistorical: delta(firestoreShoppers, historicalShopperCount),
  liquidationCountDeltaFirestoreMinusFinancialRows: delta(firestoreLiquidations, canonicalFinancialRows),
  certificationCountDeltaFirestoreMinusPendingPopulation: delta(firestoreCertifications, pendingCertificationShoppers),
  canonicalPeriods: period.counts?.periods ?? 0,
  canonicalVisits,
  liveSourceSafeShoppers: liveShopperCount,
  historicalShopperReferenceCount: historicalShopperCount,
  canonicalFinancialRows,
  exactFinancialLinks: finance.summary?.exactAcceptedLinks ?? 0,
  financialReviewRows: finance.summary?.reviewLiquidationRows ?? 0,
  firestoreProjects: r15d.snapshot?.projects ?? 0,
  firestoreVisits,
  firestoreShoppers,
  firestoreLiquidations,
  firestoreCertifications
};

const lineageValid = r15c.summary?.lineageMatched === true;
const readFacadeValid = r15d.facade?.compatible === true && r15d.writeGates?.allBlocked === true;
const canonicalDriftExists = drift.preferredCanonicalProjectMissingInFirestore ||
  drift.visitCountDeltaFirestoreMinusCanonical !== 0 ||
  drift.shopperCountDeltaFirestoreMinusLive !== 0 ||
  drift.liquidationCountDeltaFirestoreMinusFinancialRows !== 0 ||
  pendingCertificationShoppers > 0;
const rootBindingMissing = !binding.rootIndexLoadsPayload || !binding.rootIndexLoadsBridge;
const bindingPrepared = binding.deployBuildsPayload &&
  binding.deployUsesDeterministicBinder &&
  binding.deployInjectsPayload &&
  binding.deployInjectsBridge &&
  binding.sourceSafeSmokeUsesDeterministicBinder;
const deployBindingMissing = !bindingPrepared;

const decision = lineageValid && readFacadeValid && canonicalDriftExists
  ? (bindingPrepared
      ? 'HOLD_FIRESTORE_AS_CANONICAL_SOURCE_SAFE_BINDING_PREPARED_R15F'
      : 'HOLD_FIRESTORE_AS_CANONICAL_BIND_SOURCE_SAFE_R15E')
  : 'REVIEW_REQUIRED_FIRESTORE_CANONICAL_DRIFT_R15E';

const report = {
  schemaVersion: '1.0.0',
  reportId: 'phase-a-firestore-canonical-drift-r15e',
  generatedAt: new Date().toISOString(),
  decision,
  tenantId: 'tya',
  projectId: 'cinepolis',
  conclusions: {
    existingFirebaseDevOwnershipConfirmed: lineageValid,
    firestoreReadOnlyFacadeValidated: readFacadeValid,
    firestoreIsCurrentCanonicalSource: false,
    currentCanonicalReadSource: 'tya_hr_live_multitab_source_safe_plus_r14c_financial_control',
    rootSourceSafeBindingMissing: rootBindingMissing,
    deploySourceSafeBindingMissing: deployBindingMissing,
    sourceSafeBindingPreparedAtBuildTime: bindingPrepared,
    safeNextBlock: bindingPrepared
      ? 'R15F_SOURCE_SAFE_BINDING_BUILD_SMOKE_NO_DEPLOY'
      : 'R15F_CONTROLLED_SOURCE_SAFE_BINDING_BUILD_SMOKE_NO_DEPLOY'
  },
  drift,
  binding,
  gates: {
    keepExistingFirebaseProject: true,
    createNewFirebaseProject: false,
    allowFirestoreReadOnlyReference: true,
    allowFirestoreCanonicalRuntimeSwitch: false,
    allowSourceSafeReadOnlyBindingBuild: true,
    allowFirestoreWrites: false,
    allowAuthMutation: false,
    allowImport: false,
    allowDeploy: false,
    allowProduction: false
  },
  reviewQueuesPreserved: {
    shopperSourceGap: shopperGap.counts?.reviewItems ?? 0,
    financialReviewRows: finance.summary?.reviewLiquidationRows ?? 0,
    certificationPendingSource: pendingCertificationShoppers,
    noNameMatching: shopperGap.policy?.noNameMatching === true,
    noAutomaticMerge: shopperGap.policy?.noAutomaticMerge === true
  },
  classification: {
    reusableCXOrbia: 'separate provider provenance, canonical source, runtime binding and materialization gates',
    exclusiveClient: 'TyA/Cinepolis counts, HR periods, shopper gap and financial reconciliation',
    claudePrototype: 'no new frontend task; existing source-safe bridge remains the connection mechanism',
    academia: 'explain existing DEV vs canonical source vs materialized backend and why count drift blocks canonical switch',
    sinImpactoClaude: 'provider read reports, CI runners, digests and backend-only gates'
  },
  safeState: {
    providerCalls: false,
    firestoreWrites: false,
    authWrites: false,
    imports: false,
    deploy: false,
    runtimeSwitch: false,
    production: false,
    piiIncluded: false
  }
};

const expected = {
  lineageValid: true,
  readFacadeValid: true,
  canonicalDriftExists: true,
  rootBindingMissing: true,
  bindingPrepared: true,
  deployBindingMissing: false,
  decision: 'HOLD_FIRESTORE_AS_CANONICAL_SOURCE_SAFE_BINDING_PREPARED_R15F'
};
const actual = { lineageValid, readFacadeValid, canonicalDriftExists, rootBindingMissing, bindingPrepared, deployBindingMissing, decision };
const mismatches = Object.keys(expected).filter((key) => actual[key] !== expected[key]);
report.validation = { expected, actual, mismatches, pass: mismatches.length === 0 };

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'phase-a-firestore-canonical-drift-r15e.source-safe.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'phase-a-firestore-canonical-drift-r15e.source-safe.md'), [
  '# Phase A R15E - Firestore canonical drift',
  '',
  `Decision: ${decision}`,
  `Validation: ${report.validation.pass ? 'PASS' : 'FAIL'}`,
  `Existing Firebase DEV ownership confirmed: ${lineageValid}`,
  `Firestore read-only facade valid: ${readFacadeValid}`,
  `Canonical project missing in Firestore: ${drift.preferredCanonicalProjectMissingInFirestore}`,
  `Visit drift: ${drift.visitCountDeltaFirestoreMinusCanonical}`,
  `Shopper drift vs live source-safe: ${drift.shopperCountDeltaFirestoreMinusLive}`,
  `Liquidation drift vs R14C rows: ${drift.liquidationCountDeltaFirestoreMinusFinancialRows}`,
  `Root source file remains unmodified: ${rootBindingMissing}`,
  `Build-time source-safe binding prepared: ${bindingPrepared}`,
  '',
  'No provider calls, writes, imports, deploy, runtime switch, production or PII.'
].join('\n'), 'utf8');

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.validation.pass ? 0 : 2;
