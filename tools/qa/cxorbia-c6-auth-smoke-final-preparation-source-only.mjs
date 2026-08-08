#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const paths = {
  contract: argValue('--contract', 'backend/config/cxorbia-production-promotion-contract.json'),
  freeze: argValue('--freeze', 'backend/config/c6-shopper-auth-final-freeze-v1.json'),
  rollback: argValue('--rollback', 'backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json'),
  smoke: argValue('--smoke', 'backend/config/c6-accumulative-multirole-smoke-matrix-v1.json'),
  skipConfig: argValue('--skip-config', 'backend/config/corte6-shopper-auth-skip13-disposition-v1.json'),
  skipEvidence: argValue('--skip-evidence', 'app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json'),
  residualEvidence: argValue('--residual-evidence', 'app/docs/evidence/CORTE6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-LATEST.json'),
  providerEvidence: argValue('--provider-evidence', 'app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-LATEST.json'),
  out: argValue('--out', '')
};
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const hasZeroWrites = (obj) => {
  const s = obj?.safeState || obj?.safety || {};
  const numeric = ['providerWrites','hrWrites','firestoreWrites','authWrites','rulesWrites','storageWrites','hostingDeploys','cloudRunDeploys'];
  return numeric.every((k) => s[k] === 0 || s[k] === false || s[k] === undefined) &&
    s.merge !== true && s.production !== true;
};
const setEqual = (a, b) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

const report = {
  schemaVersion: 'cxorbia.c6.auth-smoke-final-preparation-source-only.v1',
  generatedAt: new Date().toISOString(),
  mode: 'SOURCE_ONLY_NO_PROVIDER_NO_WRITES_NO_DEPLOY',
  inputs: paths,
  checks: {},
  plan: {},
  skippedAccess: {},
  idempotency: {},
  smoke: {},
  decision: 'FAIL_CLOSED_C6_AUTH_SMOKE_PREPARATION',
  safeState: {
    providerReads: 0, providerWrites: 0, hrWrites: 0, firestoreWrites: 0, authWrites: 0,
    rulesWrites: 0, storageWrites: 0, hostingDeploys: 0, cloudRunDeploys: 0,
    merge: false, production: false
  }
};

try {
  const contract = read(paths.contract);
  const freeze = read(paths.freeze);
  const rollback = read(paths.rollback);
  const smoke = read(paths.smoke);
  const skipConfig = read(paths.skipConfig);
  const skipEvidence = read(paths.skipEvidence);
  const residual = read(paths.residualEvidence);
  const provider = read(paths.providerEvidence);

  Object.assign(report.checks, {
    productionContractPass:
      contract.authorized === true &&
      contract.strategy === 'PROMOTE_EXISTING_CLEAN_PROJECT' &&
      contract.productionProjectId === 'cxorbia-backend-dev' &&
      contract.acceptCurrentIdentifiersAndUrlAsProduction === true &&
      contract.writesAuthorizedByThisContract === false &&
      contract.deployAuthorizedByThisContract === false &&
      contract.productionCutoverAuthorizedByThisContract === false,
    freezeSchema: freeze.schemaVersion === 'cxorbia.c6.shopper-auth-final-freeze.v1',
    freezeRows340: freeze.planFreeze?.rows === 340 && freeze.planFreeze?.uniqueRows === 340,
    freezeHold0: freeze.planFreeze?.operationCounts?.HOLD === 0,
    freezeDigestMatchesSkipConfig:
      freeze.planFreeze?.planDigestSha256 === skipConfig.expectedOutputPlanDigest,
    freezeDigestMatchesSkipEvidence:
      freeze.planFreeze?.planDigestSha256 === skipEvidence.plan?.planDigestAfter,
    sourceArtifactMatches:
      freeze.planFreeze?.sourceArtifact?.artifactId === provider.artifactId &&
      freeze.planFreeze?.sourceArtifact?.artifactDigest === provider.artifactDigest,
    providerSourcePlanMatches:
      provider.plan?.rows === 340 &&
      provider.plan?.digest === freeze.planFreeze?.sourcePlanDigestBeforeSkip,
    operationCountsMatch:
      JSON.stringify(freeze.planFreeze?.operationCounts) === JSON.stringify(skipEvidence.plan?.operationCounts),
    skipCount13:
      freeze.skip13?.count === 13 &&
      skipConfig.expectedCount === 13 &&
      skipEvidence.disposition?.matchedProfiles === 13,
    rollbackBound:
      rollback.planDigestSha256 === freeze.planFreeze?.planDigestSha256 &&
      rollback.idempotencyKey === freeze.idempotency?.key &&
      rollback.snapshotRequiredBeforeAnyWrite === true,
    smokeBound:
      smoke.planDigestSha256 === freeze.planFreeze?.planDigestSha256 &&
      smoke.productionStrategy === 'PROMOTE_EXISTING_CLEAN_PROJECT' &&
      smoke.personas?.length === 3,
    zeroWriteContracts:
      [freeze, rollback, smoke, skipConfig, skipEvidence].every(hasZeroWrites)
  });

  const residualSet = [
    ...(residual.surnameHolds?.fingerprints || []),
    residual.multiAuthHold?.profileFp
  ].filter(Boolean);
  const skipSet = freeze.skip13?.profileFingerprints || [];
  report.checks.skipSetMatchesResidualLineage = setEqual(skipSet, residualSet);

  const expectedIdempotency = sha([
    freeze.sourceHead,
    freeze.planFreeze?.planDigestSha256,
    freeze.target?.promotionAuthorizationId,
    freeze.authorizationId
  ].join('|'));
  report.idempotency = {
    expectedKey: expectedIdempotency,
    declaredKey: freeze.idempotency?.key || null,
    keyMatches: expectedIdempotency === freeze.idempotency?.key,
    duplicateExecutionForbidden: freeze.idempotency?.duplicateExecutionForbidden === true,
    runMarkerRequired: freeze.idempotency?.runMarkerRequired === true,
    decision: 'HOLD'
  };
  report.checks.idempotencyContractPass =
    report.idempotency.keyMatches &&
    report.idempotency.duplicateExecutionForbidden &&
    report.idempotency.runMarkerRequired;
  if (report.checks.idempotencyContractPass) {
    report.idempotency.decision = 'PASS_PREWRITE_IDEMPOTENCY_CONTRACT';
  }

  const providerCandidates = provider.multiAuthResidual?.candidates || [];
  const enabledCandidates = providerCandidates.filter((c) => c?.signals?.enabled === true);
  const emailVerifiedCandidates = providerCandidates.filter((c) => c?.signals?.emailVerified === true);
  const blockingFp = residual.multiAuthHold?.profileFp || null;
  const blockingIsSkipped = skipSet.includes(blockingFp);
  report.skippedAccess = {
    skippedProfiles: skipSet.length,
    surnameResidualProfiles: residual.surnameHolds?.count || 0,
    multiAuthResidualProfiles: provider.multiAuthResidual?.count || 0,
    blockingFingerprint: blockingFp,
    blockingFingerprintIsSkipped: blockingIsSkipped,
    providerCandidates: providerCandidates.length,
    enabledCandidates: enabledCandidates.length,
    emailVerifiedCandidates: emailVerifiedCandidates.length,
    unplannedEffectiveAccessProvenAbsent: false,
    classification: 'SKIPPED_MULTI_AUTH_PROFILE_HAS_ENABLED_PROVIDER_CANDIDATES',
    requiredNextEvidence: 'READ_ONLY_AUTH_MEMBERSHIP_AND_CLAIMS_ADJUDICATION_FOR_SKIPPED_SET_ONLY'
  };

  const structuralFailures = Object.entries(report.checks)
    .filter(([key, value]) => key !== 'idempotencyContractPass' && value !== true)
    .map(([key]) => key);
  report.failedChecks = structuralFailures;

  report.plan = {
    sourceHead: freeze.sourceHead,
    rows: freeze.planFreeze?.rows,
    uniqueRows: freeze.planFreeze?.uniqueRows,
    digest: freeze.planFreeze?.planDigestSha256,
    operationCounts: freeze.planFreeze?.operationCounts,
    subchangeCounts: freeze.planFreeze?.subchangeCounts,
    rawRowsCopiedToRepository: freeze.planFreeze?.rawRowsCopiedToRepository,
    freezeDecision: structuralFailures.length === 0
      ? 'PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE'
      : 'FAIL_AUTH_PLAN_FREEZE'
  };
  report.smoke = {
    personas: smoke.personas?.map((p) => p.persona),
    globalChecks: smoke.globalChecks?.length || 0,
    executed: smoke.currentStatus?.executed === true,
    decision: smoke.currentStatus?.decision || null
  };

  if (structuralFailures.length > 0 || !report.checks.idempotencyContractPass) {
    report.decision = 'FAIL_CLOSED_C6_AUTH_SMOKE_PREPARATION_STRUCTURE';
  } else if (
    blockingIsSkipped &&
    enabledCandidates.length >= 1 &&
    emailVerifiedCandidates.length >= 1
  ) {
    report.decision = 'HOLD_C6_AUTH_PREWRITE_SKIPPED_ACCESS_RISK_UNRESOLVED';
  } else {
    report.skippedAccess.unplannedEffectiveAccessProvenAbsent = true;
    report.decision = 'PASS_C6_AUTH_SMOKE_FINAL_PREPARATION_SOURCE_ONLY';
  }
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
}

const output = `${JSON.stringify(report, null, 2)}\n`;
if (paths.out) {
  fs.mkdirSync(path.dirname(paths.out), { recursive: true });
  fs.writeFileSync(paths.out, output, 'utf8');
}
process.stdout.write(output);
if (!report.decision.startsWith('PASS_')) process.exitCode = 2;
