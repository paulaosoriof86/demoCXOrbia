#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fingerprint as plannerFingerprint } from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import { stableAuthCandidateFingerprint } from './cxorbia-c6-shopper-equivalent-universe.mjs';

const PROFILE_FP_NAMESPACE = 'deterministic-suffix-plan-profile';
const AUTH_CANDIDATE_FP_NAMESPACE = 'shopper-auth-candidate-v1';
const MEMBER_PROVENANCE_FP_NAMESPACE = 'shopper-collision-member-v1';
const MULTI_AUTH_PROFILE_FP_NAMESPACE = 'multi-auth-profile-v1';
const EXPECTED_CONTRACT_SCHEMA = 'cxorbia.c6.skip13-auth-access-adjudication.contract.v2';
const EXPECTED_REQUEST_SCHEMA = 'cxorbia.c6.skip13-auth-access-adjudication.request.v2';

const args = process.argv.slice(2);
const selfTestMode = args.includes('--self-test');
const requestPath = args.find(x => !x.startsWith('--')) || 'backend/config/c6-skip13-auth-access-adjudication-request-v2.json';
const root = process.cwd();
const outDir = path.join(root, '.tmp/c6-skip13-auth-access-adjudication-v2');
const genericDir = path.join(root, '.tmp/cxorbia-readonly-post-gates-runner');
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const text = value => String(value ?? '').trim();
const norm = value => text(value).toLowerCase();
const list = value => Array.isArray(value) ? value.map(text).filter(Boolean) : [];
const unique = values => [...new Set(values.filter(Boolean))];
const inactiveStatuses = new Set(['inactive','inactivo','disabled','deshabilitado','deleted','eliminado','archived','archivado','blocked','bloqueado','suspended','suspendido','cancelled','canceled','cancelado']);

export const stablePlanProfileFingerprint = profileId => plannerFingerprint(`${PROFILE_FP_NAMESPACE}\0${text(profileId)}`);
const stableMemberProvenanceFingerprintForSelfTest = profileId => plannerFingerprint(`${MEMBER_PROVENANCE_FP_NAMESPACE}\0${text(profileId)}`);
const stableMultiAuthProfileFingerprintForSelfTest = profileId => plannerFingerprint(`${MULTI_AUTH_PROFILE_FP_NAMESPACE}\0${text(profileId)}`);

function selfTest() {
  const fixture = 'shopper-fixture-namespace-check';
  const directPlannerAlgorithm = plannerFingerprint(`deterministic-suffix-plan-profile\0${fixture}`);
  const profileFp = stablePlanProfileFingerprint(fixture);
  const memberFp = stableMemberProvenanceFingerprintForSelfTest(fixture);
  const multiAuthFp = stableMultiAuthProfileFingerprintForSelfTest(fixture);
  const candidateFp = stableAuthCandidateFingerprint('auth-fixture-uid');
  const candidateDirect = plannerFingerprint(`${AUTH_CANDIDATE_FP_NAMESPACE}\0auth-fixture-uid`);
  const checks = {
    plannerAlgorithmExact: profileFp === directPlannerAlgorithm,
    profileVsMemberSeparated: profileFp !== memberFp,
    profileVsMultiAuthSeparated: profileFp !== multiAuthFp,
    memberVsMultiAuthSeparated: memberFp !== multiAuthFp,
    authCandidateNamespaceExact: candidateFp === candidateDirect,
    allFingerprintsTwentyHex: [profileFp,memberFp,multiAuthFp,candidateFp].every(v => /^[a-f0-9]{20}$/.test(v))
  };
  const failed = Object.entries(checks).filter(([,ok]) => !ok).map(([k]) => k);
  const result = {
    schemaVersion: 'cxorbia.c6.skip13-fingerprint-namespace-self-test.v1',
    decision: failed.length ? 'FAIL_C6_SKIP13_FINGERPRINT_NAMESPACE_SELF_TEST' : 'PASS_C6_SKIP13_FINGERPRINT_NAMESPACE_SELF_TEST',
    namespaces: {
      profileFingerprintNamespace: PROFILE_FP_NAMESPACE,
      authCandidateFingerprintNamespace: AUTH_CANDIDATE_FP_NAMESPACE,
      forbiddenProfileJoinNamespaces: [MEMBER_PROVENANCE_FP_NAMESPACE, MULTI_AUTH_PROFILE_FP_NAMESPACE]
    },
    checks,
    failed
  };
  process.stdout.write(JSON.stringify(result) + '\n');
  if (failed.length) process.exitCode = 1;
}

if (selfTestMode) {
  selfTest();
} else {
  await main();
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(genericDir, { recursive: true });
  const errors = [];
  const findings = [];
  const checks = [];
  const counters = {
    profileIdIndexQueries: 0,
    authListPages: 0,
    membershipPointReads: 0,
    membershipFieldQueries: 0,
    hrReads: 0
  };
  let request = null;
  const ensure = (condition, code, detail='') => {
    if (condition) checks.push(detail ? `${code}:${detail}` : code);
    else errors.push(detail ? `${code}:${detail}` : code);
  };

  try {
    ensure(Boolean(saPath && fs.existsSync(saPath)), 'service_account_present');
    ensure(fs.existsSync(requestPath), 'request_file_present');
    if (errors.length) return finish('HOLD_C6_SKIP13_V2_TECHNICAL_ERROR', null, true);

    request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
    const contractPath = text(request.contract);
    ensure(Boolean(contractPath && fs.existsSync(contractPath)), 'contract_file_present');
    const contract = contractPath && fs.existsSync(contractPath) ? JSON.parse(fs.readFileSync(contractPath, 'utf8')) : {};

    ensure(request.schemaVersion === EXPECTED_REQUEST_SCHEMA, 'request_schema_exact');
    ensure(contract.schemaVersion === EXPECTED_CONTRACT_SCHEMA, 'contract_schema_exact');
    ensure(request.repository === 'paulaosoriof86/demoCXOrbia' && request.branch === 'docs-tya-v6-v71-audit' && Number(request.pullRequest) === 7, 'repository_lane_exact');
    ensure(request.enabled === true && request.consumed === false && request.status === 'authorized_execute_once', 'request_state_exact');
    ensure(request.authorizedBy === 'Paula' && Number(request.allowedExecutions) === 1, 'one_shot_authorization_exact');
    ensure(request.firebaseProjectId === 'cxorbia-backend-dev' && request.tenantId === 'tya' && request.projectId === 'cinepolis', 'provider_target_exact');
    ensure(request.targetHeadSha === process.env.CXORBIA_TARGET_HEAD && Boolean(request.targetHeadSha), 'target_head_exact');
    ensure(request.scope?.auth === true && request.scope?.claims === true && request.scope?.memberships === true && request.scope?.profileIdIndex === true, 'authorized_reads_exact');
    ensure(request.scope?.hr === false && request.scope?.providerWrites === false, 'forbidden_reads_writes_exact');
    ensure(Array.isArray(request.profileFingerprints) && request.profileFingerprints.length === 13 && new Set(request.profileFingerprints).size === 13, 'skip13_set_exact');
    ensure(request.profileFingerprints.includes(request.blockingProfileFingerprint), 'blocking_profile_in_skip13');
    ensure(Array.isArray(request.blockingCandidateFingerprints) && request.blockingCandidateFingerprints.length === 2 && new Set(request.blockingCandidateFingerprints).size === 2, 'blocking_candidate_set_exact');

    const fpContract = contract.fingerprintContract || {};
    ensure(fpContract.profileFingerprintNamespace === PROFILE_FP_NAMESPACE, 'profile_namespace_contract_exact');
    ensure(fpContract.authCandidateFingerprintNamespace === AUTH_CANDIDATE_FP_NAMESPACE, 'auth_candidate_namespace_contract_exact');
    ensure(fpContract.memberProvenanceFingerprintNamespace === MEMBER_PROVENANCE_FP_NAMESPACE, 'member_namespace_contract_exact');
    ensure(fpContract.multiAuthProfileFingerprintNamespace === MULTI_AUTH_PROFILE_FP_NAMESPACE, 'multi_auth_namespace_contract_exact');
    ensure(Array.isArray(fpContract.forbiddenProfileJoinNamespaces) && fpContract.forbiddenProfileJoinNamespaces.includes(MEMBER_PROVENANCE_FP_NAMESPACE) && fpContract.forbiddenProfileJoinNamespaces.includes(MULTI_AUTH_PROFILE_FP_NAMESPACE), 'forbidden_profile_join_namespaces_exact');
    ensure(fpContract.crossNamespaceEqualityAllowed === false, 'cross_namespace_equality_forbidden');

    for (const key of ['authWrites','passwordChanges','passwordResets','membershipWrites','firestoreWrites','rulesWrites','storageWrites','hrWrites','deploy','merge','production','make','gemini','payments']) {
      ensure(request.safeState?.[key] === false, 'safe_state_false', key);
    }
    if (errors.length) return finish('HOLD_C6_SKIP13_V2_TECHNICAL_ERROR', null, true);

    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    ensure(serviceAccount.project_id === request.firebaseProjectId && serviceAccount.private_key && serviceAccount.client_email, 'service_account_target_exact');
    if (errors.length) return finish('HOLD_C6_SKIP13_V2_TECHNICAL_ERROR', null, true);

    const adminModule = await import('firebase-admin');
    const admin = adminModule.default || adminModule;
    if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: request.firebaseProjectId });
    const auth = admin.auth();
    const db = admin.firestore();
    const tenantRef = db.collection('tenants').doc(request.tenantId);
    const usersRef = tenantRef.collection('users');

    const targetFps = new Set(request.profileFingerprints);
    const profileIdByFp = new Map();
    const profileFpById = new Map();
    const profileSnap = await tenantRef.collection('shoppers').select().get();
    counters.profileIdIndexQueries++;
    for (const doc of profileSnap.docs) {
      const fp = stablePlanProfileFingerprint(doc.id);
      if (targetFps.has(fp)) {
        profileIdByFp.set(fp, doc.id);
        profileFpById.set(doc.id, fp);
      }
    }
    ensure(profileSnap.size === Number(request.expectedShopperProfileCount), 'shopper_id_index_baseline', String(profileSnap.size));
    ensure(profileIdByFp.size === 13, 'all_skip13_profile_ids_resolved', String(profileIdByFp.size));
    if (errors.length) return finish('HOLD_C6_SKIP13_V2_PROFILE_RESOLUTION_DRIFT', null, true);

    const authUsers = [];
    let pageToken;
    do {
      const page = await auth.listUsers(1000, pageToken);
      counters.authListPages++;
      authUsers.push(...page.users);
      pageToken = page.pageToken;
    } while (pageToken);

    const expectedBlockingCandidates = new Set(request.blockingCandidateFingerprints);
    const matched = [];
    for (const user of authUsers) {
      const claims = user.customClaims || {};
      const candidateFingerprint = stableAuthCandidateFingerprint(user.uid);
      const claimProfileFp = profileFpById.get(text(claims.shopperId)) || null;
      const expectedBlockingCandidate = expectedBlockingCandidates.has(candidateFingerprint);
      if (!claimProfileFp && !expectedBlockingCandidate) continue;
      matched.push({
        user,
        claims,
        candidateFingerprint,
        profileFingerprint: claimProfileFp || request.blockingProfileFingerprint,
        claimProfileMatched: Boolean(claimProfileFp),
        expectedBlockingCandidate
      });
    }

    const observedBlocking = matched.filter(x => x.profileFingerprint === request.blockingProfileFingerprint).map(x => x.candidateFingerprint).sort();
    const expectedBlocking = [...expectedBlockingCandidates].sort();
    if (JSON.stringify(observedBlocking) !== JSON.stringify(expectedBlocking)) findings.push(`BLOCKING_CANDIDATE_SET_DRIFT:${observedBlocking.length}/${expectedBlocking.length}`);

    const byProfile = new Map(request.profileFingerprints.map(fp => [fp, []]));
    for (const entry of matched) {
      const docs = new Map();
      const direct = await usersRef.doc(entry.user.uid).get();
      counters.membershipPointReads++;
      if (direct.exists) docs.set(direct.ref.path, direct);
      for (const field of ['uid','authUid','userId']) {
        const snap = await usersRef.where(field, '==', entry.user.uid).limit(2).get();
        counters.membershipFieldQueries++;
        for (const doc of snap.docs) docs.set(doc.ref.path, doc);
      }
      const membershipVectors = [...docs.values()].map(doc => membershipScopeValid(doc, entry.user.uid, request.tenantId, request.projectId));
      const claims = entry.claims;
      const enabled = !entry.user.disabled;
      const passwordProvider = entry.user.providerData.some(item => item.providerId === 'password');
      const tenantAllowed = hasTenantScope(claims, request.tenantId);
      const projectAssigned = hasProjectScope(claims, request.projectId);
      const roleShopper = hasShopperRole(claims);
      const shopperIdExact = text(claims.shopperId) === profileIdByFp.get(entry.profileFingerprint);
      const signInCapable = enabled && passwordProvider;
      const rulesProjectReadEffective = signInCapable && tenantAllowed && roleShopper && projectAssigned;
      const rulesOwnShopperEffective = rulesProjectReadEffective && shopperIdExact;
      const classification = rulesOwnShopperEffective
        ? 'UNPLANNED_OWN_SHOPPER_ACCESS_EFFECTIVE'
        : rulesProjectReadEffective
          ? 'UNPLANNED_PROJECT_READ_ACCESS_EFFECTIVE'
          : signInCapable
            ? 'AUTH_SIGNIN_CAPABLE_WITHOUT_TYA_CINEPOLIS_SHOPPER_SCOPE'
            : 'AUTH_NOT_SIGNIN_CAPABLE';
      byProfile.get(entry.profileFingerprint).push({
        candidateFingerprint: entry.candidateFingerprint,
        expectedBlockingCandidate: entry.expectedBlockingCandidate,
        claimProfileMatched: entry.claimProfileMatched,
        enabled,
        emailVerified: Boolean(entry.user.emailVerified),
        passwordProvider,
        tenantAllowed,
        projectAssigned,
        roleShopper,
        shopperIdExact,
        membershipPresent: membershipVectors.length > 0,
        membershipValid: membershipVectors.some(v => v.valid),
        rulesProjectReadEffective,
        rulesOwnShopperEffective,
        classification
      });
    }

    const profiles = request.profileFingerprints.map(profileFingerprint => {
      const candidates = (byProfile.get(profileFingerprint) || []).sort((a,b) => a.candidateFingerprint.localeCompare(b.candidateFingerprint));
      const effective = candidates.filter(x => x.rulesProjectReadEffective);
      const ownEffective = candidates.filter(x => x.rulesOwnShopperEffective);
      return {
        profileFingerprint,
        blockingProfile: profileFingerprint === request.blockingProfileFingerprint,
        candidateCount: candidates.length,
        effectiveProjectAccessCandidates: effective.length,
        effectiveOwnShopperAccessCandidates: ownEffective.length,
        unplannedEffectiveAccessPresent: effective.length > 0,
        classification: candidates.length === 0
          ? 'NO_MATCHED_AUTH_CANDIDATE_NO_EFFECTIVE_ACCESS_PROVEN'
          : effective.length === 0
            ? 'AUTH_CANDIDATE_PRESENT_NO_EFFECTIVE_TYA_CINEPOLIS_ACCESS'
            : effective.length === 1
              ? 'ONE_UNPLANNED_EFFECTIVE_ACCESS_CANDIDATE'
              : 'MULTIPLE_UNPLANNED_EFFECTIVE_ACCESS_CANDIDATES',
        candidates
      };
    });

    const effectiveProfiles = profiles.filter(x => x.unplannedEffectiveAccessPresent);
    if (effectiveProfiles.length) findings.push(`UNPLANNED_EFFECTIVE_ACCESS_PROFILES:${effectiveProfiles.length}`);
    const decision = findings.some(x => x.startsWith('BLOCKING_CANDIDATE_SET_DRIFT'))
      ? 'HOLD_C6_SKIP13_V2_PROVIDER_DRIFT'
      : effectiveProfiles.length
        ? 'HOLD_C6_SKIP13_V2_UNPLANNED_EFFECTIVE_ACCESS_FOUND'
        : 'PASS_C6_SKIP13_V2_NO_UNPLANNED_EFFECTIVE_ACCESS';

    const summary = {
      schemaVersion: 'cxorbia.c6.skip13-auth-access-adjudication.result.v2',
      generatedAt: new Date().toISOString(),
      decision,
      requestId: request.requestId,
      target: {
        firebaseProjectId: request.firebaseProjectId,
        tenantId: request.tenantId,
        projectId: request.projectId,
        blockingProfileFingerprint: request.blockingProfileFingerprint
      },
      fingerprintContract: {
        profileFingerprintNamespace: PROFILE_FP_NAMESPACE,
        authCandidateFingerprintNamespace: AUTH_CANDIDATE_FP_NAMESPACE,
        forbiddenProfileJoinNamespaces: [MEMBER_PROVENANCE_FP_NAMESPACE, MULTI_AUTH_PROFILE_FP_NAMESPACE]
      },
      scope: {
        requestedProfiles: 13,
        resolvedProfiles: profileIdByFp.size,
        providerAuthUsersScannedForFingerprintAndClaims: authUsers.length,
        adjudicatedAuthCandidates: profiles.reduce((sum,x) => sum + x.candidateCount, 0),
        rawIdsExported: false,
        rawClaimsExported: false,
        piiExported: false,
        hrReads: 0
      },
      aggregate: {
        profilesWithAuthCandidates: profiles.filter(x => x.candidateCount > 0).length,
        profilesWithUnplannedEffectiveAccess: effectiveProfiles.length,
        authCandidates: profiles.reduce((sum,x) => sum + x.candidateCount, 0),
        effectiveProjectAccessCandidates: profiles.reduce((sum,x) => sum + x.effectiveProjectAccessCandidates, 0),
        effectiveOwnShopperAccessCandidates: profiles.reduce((sum,x) => sum + x.effectiveOwnShopperAccessCandidates, 0),
        blockingCandidateExpected: expectedBlocking.length,
        blockingCandidateObserved: observedBlocking.length
      },
      profiles,
      findings,
      providerReadCounters: counters,
      safety: safeState()
    };
    return finish(decision, summary, false);
  } catch (error) {
    errors.push(`ADJUDICATION_EXCEPTION:${String(error?.message || error).replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,180)}`);
    return finish('HOLD_C6_SKIP13_V2_TECHNICAL_ERROR', null, true);
  }

  function finish(decision, summary=null, technicalFailure=true) {
    const report = summary || {
      schemaVersion: 'cxorbia.c6.skip13-auth-access-adjudication.result.v2',
      generatedAt: new Date().toISOString(),
      decision,
      requestId: request?.requestId || null,
      errors,
      findings,
      checks,
      providerReadCounters: counters,
      safety: safeState()
    };
    report.errors = errors;
    report.checks = checks;
    fs.writeFileSync(path.join(outDir,'report-source-safe.json'), JSON.stringify(report,null,2)+'\n','utf8');
    fs.writeFileSync(path.join(outDir,'decision.txt'), `${decision}\n`, 'utf8');
    fs.writeFileSync(path.join(genericDir,'report.json'), JSON.stringify({
      schemaVersion: 'cxorbia.readonly-post-gates-report.v1',
      generatedAt: new Date().toISOString(),
      status: technicalFailure ? 'HOLD_C6_SKIP13_V2_TECHNICAL_ERROR' : 'PASS_READONLY_ADJUDICATION_COMPLETED',
      decision,
      requestId: request?.requestId || null,
      targetHeadSha: request?.targetHeadSha || null,
      checks,
      errors,
      findings,
      safeState: report.safety
    },null,2)+'\n','utf8');
    if (technicalFailure) process.exitCode = 1;
  }
}

function hasTenantScope(claims, tenantId) {
  return text(claims?.tenantId) === tenantId || list(claims?.tenants).includes(tenantId) || list(claims?.tenantIds).includes(tenantId);
}
function hasProjectScope(claims, projectId) {
  return text(claims?.projectId) === projectId || list(claims?.projectIds).includes(projectId);
}
function hasShopperRole(claims) {
  return norm(claims?.role) === 'shopper' || list(claims?.roles).map(norm).includes('shopper');
}
function membershipScopeValid(doc, uid, tenantId, projectId) {
  const data = doc.data() || {};
  const status = norm(data.status || data.estado || data.accountStatus);
  const active = data.disabled !== true && !inactiveStatuses.has(status);
  const uidBound = doc.id === uid || [data.uid,data.authUid,data.userId].map(text).includes(uid);
  const tenantBound = text(data.tenantId) === tenantId || list(data.tenants).includes(tenantId) || doc.ref.path.startsWith(`tenants/${tenantId}/users/`);
  const roleBound = norm(data.role) === 'shopper' || list(data.roles).map(norm).includes('shopper');
  const projectBound = text(data.projectId) === projectId || list(data.projectIds).includes(projectId);
  return { active, uidBound, tenantBound, roleBound, projectBound, valid: active && uidBound && tenantBound && roleBound && projectBound };
}
function safeState() {
  return {
    providerWrites: 0,
    authWrites: 0,
    passwordChanges: 0,
    passwordResets: 0,
    membershipWrites: 0,
    firestoreWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    hrReads: 0,
    hrWrites: 0,
    deploys: 0,
    merge: false,
    production: false
  };
}
