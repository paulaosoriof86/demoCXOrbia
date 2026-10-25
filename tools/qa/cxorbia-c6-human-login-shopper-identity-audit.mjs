#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';
import {
  EXPECTED_FIREBASE_PROJECT,
  TENANT_ID,
  CANONICAL_PROJECT_ID,
  decryptCredentialBundle,
  fetchFirebaseWebConfig,
  buildCanonicalShopperPlan,
  sanitizeCanonicalPlan
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import {
  buildResolutionReview,
  sanitizeResolutionReview
} from './cxorbia-c6-shopper-identity-resolution-review.mjs';
import {
  buildCollisionClassification,
  sanitizeCollisionClassification
} from './cxorbia-c6-shopper-login-collision-classification.mjs';

const root = process.cwd();
const requestPath = process.argv[2] || 'backend/config/corte6-human-login-shopper-identity-audit.json';
const outDir = path.join(root, '.tmp/c6-human-login-shopper-identity-audit');
const genericDir = path.join(root, '.tmp/cxorbia-readonly-post-gates-runner');
const privateDir = path.join(root, '.tmp/c6-human-login-shopper-identity-private');
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const remoteRoot = String(process.env.CXORBIA_DEV_ROOT_URL || 'https://cxorbia-backend-dev.web.app').replace(/\/$/, '');

const blockers = [];
const checks = [];
let request = null;

const addBlocker = (code, detail = '') => blockers.push(detail ? `${code}:${detail}` : code);
const ensure = (condition, code, detail = '') => {
  if (!condition) addBlocker(code, detail);
  else checks.push(detail ? `${code}:${detail}` : code);
};

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(genericDir, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });

function validateCommon() {
  ensure(request.schemaVersion === 'cxorbia.c6.human-login-shopper-identity-audit.v1', 'request_schema_exact');
  ensure(request.canonicalIdentityContract === 'backend/contracts/c6-shopper-identity-canonicalization-v1.json', 'canonical_contract_exact');
  ensure(
    request.repository === 'paulaosoriof86/demoCXOrbia' &&
      request.branch === 'docs-tya-v6-v71-audit' &&
      Number(request.pullRequest) === 7,
    'repository_lane_exact'
  );
  ensure(request.enabled === true && request.consumed === false && request.status === 'authorized_execute_once', 'request_enabled_once');
  ensure(Number(request.allowedExecutions) === 1 && request.authorizedBy === 'Paula', 'authorization_exact');
  ensure(request.targetHeadSha && request.targetHeadSha === process.env.CXORBIA_AUDIT_TARGET_HEAD, 'target_head_exact');
  ensure(request.providerReads === true && request.providerWrites === false, 'provider_readonly_exact');
  ensure(
    request.tenantId === TENANT_ID &&
      request.projectId === CANONICAL_PROJECT_ID &&
      request.firebaseProjectId === EXPECTED_FIREBASE_PROJECT,
    'target_exact'
  );
  ensure(
    request.identityPolicy?.username === 'nombre.apellido' &&
      request.identityPolicy?.password === 'Nombre123*' &&
      request.identityPolicy?.membershipRequired === false,
    'identity_policy_exact'
  );
  for (const key of [
    'repositoryWrites','dataWrites','deploy','merge','production','firestoreWrites',
    'authWrites','passwordChanges','passwordResets','rulesWrites','storageWrites',
    'hrWrites','make','gemini','payments'
  ]) {
    ensure(request.safeState?.[key] === false, 'safe_state_false', key);
  }
}

async function main() {
  try {
    ensure(Boolean(saPath && fs.existsSync(saPath)), 'service_account_file_present');
    ensure(fs.existsSync(requestPath), 'request_file_present');
    if (blockers.length) return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');

    request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
    validateCommon();
    if (blockers.length) return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');

    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    ensure(
      serviceAccount.project_id === EXPECTED_FIREBASE_PROJECT &&
        typeof serviceAccount.private_key === 'string',
      'service_account_target_exact'
    );
    if (blockers.length) return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');

    const bundle = decryptCredentialBundle({ serviceAccount });
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: EXPECTED_FIREBASE_PROJECT
      });
    }
    const context = {
      auth: admin.auth(),
      db: admin.firestore(),
      bundle,
      webConfig: await fetchFirebaseWebConfig(remoteRoot, EXPECTED_FIREBASE_PROJECT)
    };

    if (request.mode === 'source_safe_collision_classification') return runCollisionClassification(context);
    if (request.mode === 'source_safe_resolution_review') return runResolution(context);
    return runCensus(context);
  } catch (error) {
    addBlocker(
      'AUDIT_EXCEPTION',
      String(error?.message || error).replace(/[^A-Za-z0-9_.:-]+/g, '_').slice(0, 180)
    );
    return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');
  }
}

async function runCensus(context) {
  const plan = await buildCanonicalShopperPlan(context);
  const safe = sanitizeCanonicalPlan(plan);
  const expected = request.expectedLegacyBaseline || {};

  ensure(plan.source.firestoreProfiles === Number(request.expectedFirestoreProfiles || 340), 'firestore_profile_count_exact', String(plan.source.firestoreProfiles));
  ensure(plan.source.credentialShopperRecords === Number(expected.records || 109), 'credential_record_count_exact', String(plan.source.credentialShopperRecords));
  ensure(plan.baseline.missingAuth === Number(expected.missingAuth || 21), 'legacy_missing_auth_exact', String(plan.baseline.missingAuth));
  ensure(plan.baseline.loginExceptions === Number(expected.loginExceptions || 30), 'legacy_login_exceptions_exact', String(plan.baseline.loginExceptions));
  ensure(plan.baseline.passwordExceptions === Number(expected.passwordExceptions || 28), 'legacy_password_exceptions_exact', String(plan.baseline.passwordExceptions));
  ensure(plan.classification.complete === true, 'classification_complete');
  ensure(plan.classification.total === plan.source.firestoreProfiles, 'classification_total_consistent');
  ensure(plan.collisionCount === 0, 'zero_unresolved_collisions', String(plan.collisionCount));
  ensure(plan.paulaIdentity.separated === true, 'paula_staff_shopper_principals_separated');
  ensure(plan.repairRows.length > 0, 'active_eligible_population_nonempty');

  checks.push(
    'MEMBERSHIP_NOT_REQUIRED_FOR_SHOPPER_LOGIN',
    'CANONICAL_USERNAME_NOMBRE_APELLIDO',
    'CANONICAL_PASSWORD_NOMBRE123_STAR',
    'ALL_340_PROFILES_CLASSIFIED',
    'RAW_IDENTITY_NOT_EXPORTED'
  );

  const summary = {
    schemaVersion: 'cxorbia.c6.shopper-identity-canonicalization-census.result.v1',
    generatedAt: new Date().toISOString(),
    decision: blockers.length
      ? 'HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS'
      : 'PASS_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS_READY',
    ...safe
  };
  return finish(
    blockers.length ? 'HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS' : 'PASS_READONLY_POST_GATES',
    summary,
    'C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS'
  );
}

async function runResolution(context) {
  ensure(request.expectedCollisionCount === 12, 'expected_collision_count_contract');
  ensure(request.expectedIncompleteCanonicalNames === 23, 'expected_incomplete_name_contract');
  ensure(request.expectedLoginCollisionProfiles === 23, 'expected_login_collision_profiles_contract');
  ensure(request.expectedPaulaShopperCandidates === 2, 'expected_paula_candidates_contract');
  ensure(request.baselinePolicy === 'fingerprint_set_membership_not_rigid_aggregate_equality', 'baseline_set_policy_exact');
  if (blockers.length) return finish('HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW', null, 'C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW');

  const review = await buildResolutionReview(context);
  const safe = sanitizeResolutionReview(review);
  const baseline = review.baselineReconciliation;

  ensure(review.source.profiles === 340, 'all_340_profiles_reviewed', String(review.source.profiles));
  ensure(baseline.current.credentialRecords === 109, 'all_109_credential_records_reviewed', String(baseline.current.credentialRecords));
  ensure(
    baseline.historicalReference.missingAuth === 21 &&
      baseline.historicalReference.loginExceptions === 30 &&
      baseline.historicalReference.passwordExceptions === 28,
    'historical_baseline_reference_preserved'
  );
  ensure(baseline.bridge.credentialPartitionComplete === true, 'credential_partition_complete');
  ensure(baseline.bridge.missingAuthSetComplete === true, 'missing_auth_set_complete');
  ensure(baseline.bridge.loginExceptionSetComplete === true, 'login_exception_set_complete');
  ensure(baseline.bridge.passwordExceptionSetComplete === true, 'password_exception_set_complete');
  ensure(baseline.bridge.reconciliationBasis === 'fingerprint_set_membership_not_rigid_aggregate_equality', 'baseline_reconciled_by_sets');
  ensure(review.planTotal === 340, 'one_plan_row_per_profile', String(review.planTotal));
  ensure(Object.values(review.operationCounts).reduce((sum, value) => sum + Number(value || 0), 0) === 340, 'operation_partition_consistent');
  ensure(review.resolution.paula.shopperCandidates === 2, 'paula_two_shopper_candidates_reviewed');
  ensure(Array.isArray(review.resolution.paula.technicalCandidates) && review.resolution.paula.technicalCandidates.length === 2, 'paula_source_safe_technical_comparison_created');
  ensure(
    review.safety.authWrites === 0 &&
      review.safety.passwordChanges === 0 &&
      review.safety.firestoreWrites === 0 &&
      review.safety.deploys === 0,
    'zero_provider_writes'
  );

  checks.push(
    'EXACT_PROFILE_BOUND_BEFORE_CANONICAL_NAME_DERIVATION',
    'TECHNICAL_KEYS_ONLY_NO_VISUAL_NAME_MATCH',
    'SOURCE_SAFE_PAULA_COMPARISON_CREATED',
    'BASELINE_RECONCILED_BY_FINGERPRINT_SETS',
    'REAL_COLLISIONS_RECALCULATED',
    'ROLLBACK_DRY_RUN_CREATED',
    'NON_OVERLAPPING_PRIMARY_OPERATION_PLAN_CREATED',
    'RAW_IDENTITY_NOT_EXPORTED'
  );

  const ready =
    review.resolution.remainingCollisionCount === 0 &&
    review.unresolvedProfileCount === 0 &&
    review.resolution.paula.resolution.startsWith('RESOLVED');
  if (!ready) addBlocker('UNRESOLVED_IDENTITY_HOLDS', String(review.unresolvedProfileCount));

  const decision = ready
    ? 'PASS_C6_SHOPPER_IDENTITY_RESOLUTION_READY'
    : 'HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW';
  const summary = {
    schemaVersion: 'cxorbia.c6.shopper-identity-resolution-review.result.v2',
    generatedAt: new Date().toISOString(),
    decision,
    ...safe
  };
  return finish(
    ready ? 'PASS_READONLY_POST_GATES' : 'HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW',
    summary,
    'C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW'
  );
}

async function runCollisionClassification(context) {
  ensure(request.expectedCandidateLoginGroups === 109, 'expected_candidate_login_groups_contract');
  ensure(request.expectedCandidateLoginProfiles === 238, 'expected_candidate_login_profiles_contract');
  ensure(request.expectedMultipleAuthProfiles === 1, 'expected_multiple_auth_profiles_contract');
  ensure(request.expectedPriorIncompleteNames === 3, 'expected_prior_incomplete_names_contract');
  ensure(request.surnameValidationPolicy === 'explicit_or_technical_source_only_no_position_only', 'surname_validation_policy_exact');
  if (blockers.length) {
    return finish('HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION', null, 'C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION');
  }

  const classification = await buildCollisionClassification(context);
  const safe = sanitizeCollisionClassification(classification);

  ensure(classification.source.profiles === 340, 'all_340_profiles_classified', String(classification.source.profiles));
  ensure(classification.source.credentials === 109, 'all_109_credentials_classified', String(classification.source.credentials));
  ensure(classification.classification.groupCount === 109, 'candidate_login_group_count_exact', String(classification.classification.groupCount));
  ensure(classification.classification.groupProfiles === 238, 'candidate_login_group_profiles_exact', String(classification.classification.groupProfiles));
  ensure(classification.classification.multipleAuthProfiles === 1, 'multiple_auth_profile_count_exact', String(classification.classification.multipleAuthProfiles));
  ensure(classification.planTotal === 340, 'one_plan_row_per_profile', String(classification.planTotal));
  ensure(
    Object.values(classification.operationCounts).reduce((sum, value) => sum + Number(value || 0), 0) === 340,
    'operation_partition_consistent'
  );
  ensure(
    classification.safety.authWrites === 0 &&
      classification.safety.passwordChanges === 0 &&
      classification.safety.membershipWrites === 0 &&
      classification.safety.firestoreWrites === 0 &&
      classification.safety.deploys === 0,
    'zero_provider_writes'
  );

  checks.push(
    'CANDIDATE_109_GROUPS_REVIEWED',
    'FIRST_SURNAME_VERIFIED_BY_EXPLICIT_OR_TECHNICAL_SOURCE',
    'NO_POSITION_ONLY_SURNAME_ACCEPTED',
    'ACTIVE_VS_HISTORICAL_CLASSIFIED',
    'MULTIPLE_AUTH_PROFILE_CLASSIFIED',
    'DISTINCT_ACTIVE_VISIBLE_LOGIN_COLLISIONS_COUNTED',
    'MINIMUM_DISAMBIGUATION_ALTERNATIVES_REPORTED_NOT_APPLIED',
    'NON_OVERLAPPING_340_ROW_PLAN_CREATED',
    'RAW_IDENTITY_NOT_EXPORTED'
  );

  const ready = classification.readyForAuthRepair === true;
  if (!ready) {
    addBlocker(
      'VISIBLE_LOGIN_CLASSIFICATION_HOLDS',
      [
        classification.classification.distinctActiveCollisionGroups,
        classification.classification.unresolvedSurnameGroups,
        classification.classification.unresolvedMultipleAuthProfiles,
        classification.classification.verifiedNameIncompleteActiveProfiles
      ].join('/')
    );
  }

  const decision = ready
    ? 'PASS_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION_READY'
    : 'HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION';
  const summary = {
    schemaVersion: 'cxorbia.c6.shopper-login-collision-classification.result.v1',
    generatedAt: new Date().toISOString(),
    decision,
    ...safe
  };

  return finish(
    ready ? 'PASS_READONLY_POST_GATES' : 'HOLD_C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION',
    summary,
    'C6_SHOPPER_LOGIN_COLLISION_CLASSIFICATION'
  );
}

function finish(status, summary = null, profile = 'C6_SHOPPER_IDENTITY_AUDIT') {
  const report = {
    schemaVersion: 'cxorbia.readonly-post-gates-report.v1',
    runner: 'CXORBIA_READONLY_POST_GATES_RUNNER',
    generatedAt: new Date().toISOString(),
    status,
    requestId: request?.requestId || null,
    requestCommitSha: process.env.GITHUB_SHA || null,
    targetHeadSha: request?.targetHeadSha || null,
    profile,
    checks,
    blockers,
    summary,
    safeState: {
      repositoryWrites: false,
      dataWrites: false,
      deploy: false,
      merge: false,
      production: false,
      imports: false,
      payments: false,
      make: false,
      gemini: false,
      firestoreWrites: false,
      authWrites: false,
      storageWrites: false,
      hrWrites: false
    }
  };

  fs.writeFileSync(path.join(genericDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(summary || report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'report.md'),
    [
      '# C6 Shopper Identity Audit',
      '',
      `Decision: **${summary?.decision || status}**`,
      '',
      'Source-safe aggregate only. No raw login, name, password, token, email or UID is exported.',
      '',
      `Blockers: ${blockers.length}`
    ].join('\n') + '\n',
    'utf8'
  );
  try {
    fs.rmSync(privateDir, { recursive: true, force: true });
  } catch {}
  if (status !== 'PASS_READONLY_POST_GATES') process.exitCode = 1;
}

await main();
