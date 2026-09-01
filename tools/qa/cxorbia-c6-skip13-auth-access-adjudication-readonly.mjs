#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const root = process.cwd();
const requestPath = process.argv[2] || 'backend/config/c6-skip13-auth-access-adjudication-request.json';
const outDir = path.join(root, '.tmp/c6-skip13-auth-access-adjudication');
const genericDir = path.join(root, '.tmp/cxorbia-readonly-post-gates-runner');
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const text = value => String(value ?? '').trim();
const norm = value => text(value).toLowerCase();
const list = value => Array.isArray(value) ? value.map(text).filter(Boolean) : [];
const sha256 = value => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const fingerprint = value => sha256(value).slice(0, 20);
const stableMemberFingerprint = profileId => fingerprint(`shopper-collision-member-v1\0${text(profileId)}`);
const stableAuthCandidateFingerprint = uid => fingerprint(`shopper-auth-candidate-v1\0${text(uid)}`);
const inactiveStatuses = new Set(['inactive','inactivo','disabled','deshabilitado','deleted','eliminado','archived','archivado','blocked','bloqueado','suspended','suspendido','cancelled','canceled','cancelado']);

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(genericDir, { recursive: true });

const errors = [];
const findings = [];
const checks = [];
let request = null;
let providerReadCounters = {
  profileIdIndexQueries: 0,
  authListPages: 0,
  membershipPointReads: 0,
  membershipFieldQueries: 0,
  hrReads: 0
};

function ensure(condition, code, detail = '') {
  if (condition) checks.push(detail ? `${code}:${detail}` : code);
  else errors.push(detail ? `${code}:${detail}` : code);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasTenantScope(claims, tenantId) {
  return text(claims?.tenantId) === tenantId || list(claims?.tenants).includes(tenantId) || list(claims?.tenantIds).includes(tenantId);
}

function hasProjectScope(claims, projectId) {
  return list(claims?.projectIds).includes(projectId) || text(claims?.projectId) === projectId;
}

function hasShopperRole(claims) {
  return norm(claims?.role) === 'shopper' || list(claims?.roles).map(norm).includes('shopper');
}

function membershipScopeValid(doc, uid, tenantId, projectId) {
  const data = doc.data() || {};
  const status = norm(data.status || data.estado || data.accountStatus);
  const active = data.disabled !== true && !inactiveStatuses.has(status);
  const uidBound = doc.id === uid || [data.uid, data.authUid, data.userId].map(text).includes(uid);
  const tenantBound = text(data.tenantId) === tenantId || list(data.tenants).includes(tenantId) || doc.ref.path.startsWith(`tenants/${tenantId}/users/`);
  const roleBound = norm(data.role) === 'shopper' || list(data.roles).map(norm).includes('shopper');
  const projectBound = text(data.projectId) === projectId || list(data.projectIds).includes(projectId);
  return { active, uidBound, tenantBound, roleBound, projectBound, valid: active && uidBound && tenantBound && roleBound && projectBound };
}

async function listAllUsers(auth) {
  const users = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    providerReadCounters.authListPages++;
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

async function readMembershipsForUid(usersRef, uid) {
  const docs = new Map();
  const direct = await usersRef.doc(uid).get();
  providerReadCounters.membershipPointReads++;
  if (direct.exists) docs.set(direct.ref.path, direct);
  for (const field of ['uid', 'authUid', 'userId']) {
    const snap = await usersRef.where(field, '==', uid).limit(2).get();
    providerReadCounters.membershipFieldQueries++;
    for (const doc of snap.docs) docs.set(doc.ref.path, doc);
  }
  return [...docs.values()];
}

function validateRequest() {
  ensure(request?.schemaVersion === 'cxorbia.c6.skip13-auth-access-adjudication.request.v1', 'request_schema_exact');
  ensure(request?.repository === 'paulaosoriof86/demoCXOrbia', 'repository_exact');
  ensure(request?.branch === 'docs-tya-v6-v71-audit', 'branch_exact');
  ensure(Number(request?.pullRequest) === 7, 'pr_exact');
  ensure(request?.enabled === true && request?.consumed === false && request?.status === 'authorized_execute_once', 'request_state_exact');
  ensure(request?.authorizedBy === 'Paula' && Number(request?.allowedExecutions) === 1, 'one_shot_authorization_exact');
  ensure(request?.tenantId === 'tya' && request?.projectId === 'cinepolis' && request?.firebaseProjectId === 'cxorbia-backend-dev', 'provider_target_exact');
  ensure(request?.targetHeadSha === process.env.CXORBIA_TARGET_HEAD && Boolean(request?.targetHeadSha), 'target_head_exact');
  ensure(request?.scope?.auth === true && request?.scope?.memberships === true && request?.scope?.claims === true, 'authorized_read_domains_exact');
  ensure(request?.scope?.hr === false && request?.scope?.providerWrites === false, 'hr_and_provider_writes_forbidden');
  const fps = list(request?.profileFingerprints);
  ensure(fps.length === 13 && new Set(fps).size === 13, 'skip13_set_exact');
  ensure(fps.includes(request?.blockingProfileFingerprint), 'blocking_profile_in_skip13');
  const candidates = list(request?.blockingCandidateFingerprints);
  ensure(candidates.length === 2 && new Set(candidates).size === 2, 'blocking_candidate_set_exact');
  for (const key of ['authWrites','passwordChanges','passwordResets','membershipWrites','firestoreWrites','rulesWrites','storageWrites','hrWrites','deploy','merge','production','make','gemini','payments']) {
    ensure(request?.safeState?.[key] === false, 'safe_state_false', key);
  }
}

async function main() {
  try {
    ensure(Boolean(saPath && fs.existsSync(saPath)), 'service_account_present');
    ensure(fs.existsSync(requestPath), 'request_file_present');
    if (errors.length) return finish('HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR');
    request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
    validateRequest();
    if (errors.length) return finish('HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR');

    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    ensure(serviceAccount.project_id === request.firebaseProjectId && serviceAccount.private_key && serviceAccount.client_email, 'service_account_target_exact');
    if (errors.length) return finish('HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: request.firebaseProjectId
      });
    }
    const auth = admin.auth();
    const db = admin.firestore();
    const tenantRef = db.collection('tenants').doc(request.tenantId);
    const usersRef = tenantRef.collection('users');

    const targetFps = new Set(request.profileFingerprints);
    const profileIdByFp = new Map();
    const profileFpById = new Map();
    const profileSnap = await tenantRef.collection('shoppers').select().get();
    providerReadCounters.profileIdIndexQueries++;
    for (const doc of profileSnap.docs) {
      const fp = stableMemberFingerprint(doc.id);
      if (targetFps.has(fp)) {
        profileIdByFp.set(fp, doc.id);
        profileFpById.set(doc.id, fp);
      }
    }
    ensure(profileIdByFp.size === 13, 'all_skip13_profile_ids_resolved', String(profileIdByFp.size));
    ensure(profileSnap.size === Number(request.expectedShopperProfileCount), 'shopper_id_index_baseline', String(profileSnap.size));
    if (errors.length) return finish('HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR');

    const expectedCandidateFps = new Set(request.blockingCandidateFingerprints);
    const authUsers = await listAllUsers(auth);
    const matched = [];
    for (const user of authUsers) {
      const claims = user.customClaims || {};
      const candidateFp = stableAuthCandidateFingerprint(user.uid);
      const claimProfileFp = profileFpById.get(text(claims.shopperId)) || null;
      const expectedBlockingCandidate = expectedCandidateFps.has(candidateFp);
      if (!claimProfileFp && !expectedBlockingCandidate) continue;
      const profileFp = claimProfileFp || request.blockingProfileFingerprint;
      matched.push({ user, claims, candidateFp, profileFp, expectedBlockingCandidate, claimProfileMatched: Boolean(claimProfileFp) });
    }

    const observedBlockingCandidateFps = matched.filter(x => x.profileFp === request.blockingProfileFingerprint).map(x => x.candidateFp).sort();
    const expectedBlockingSorted = [...expectedCandidateFps].sort();
    if (JSON.stringify(observedBlockingCandidateFps) !== JSON.stringify(expectedBlockingSorted)) {
      findings.push(`BLOCKING_CANDIDATE_SET_DRIFT:${observedBlockingCandidateFps.length}/${expectedBlockingSorted.length}`);
    }

    const byProfile = new Map(request.profileFingerprints.map(fp => [fp, []]));
    for (const entry of matched) {
      const memberships = await readMembershipsForUid(usersRef, entry.user.uid);
      const membershipVectors = memberships.map(doc => membershipScopeValid(doc, entry.user.uid, request.tenantId, request.projectId));
      const claims = entry.claims;
      const enabled = !entry.user.disabled;
      const passwordProvider = entry.user.providerData.some(item => item.providerId === 'password');
      const tenantAllowed = hasTenantScope(claims, request.tenantId);
      const projectAssigned = hasProjectScope(claims, request.projectId);
      const roleShopper = hasShopperRole(claims);
      const shopperIdExact = text(claims.shopperId) === profileIdByFp.get(entry.profileFp);
      const authNamespaceShopper = norm(claims.authNamespace) === 'shopper';
      const signInCapable = enabled && passwordProvider;
      const rulesProjectReadEffective = signInCapable && tenantAllowed && roleShopper && projectAssigned;
      const rulesOwnShopperEffective = rulesProjectReadEffective && shopperIdExact;
      const membershipPresent = membershipVectors.length > 0;
      const membershipValid = membershipVectors.some(item => item.valid);
      const classification = rulesOwnShopperEffective
        ? 'UNPLANNED_OWN_SHOPPER_ACCESS_EFFECTIVE'
        : rulesProjectReadEffective
          ? 'UNPLANNED_PROJECT_READ_ACCESS_EFFECTIVE'
          : signInCapable
            ? 'AUTH_SIGNIN_CAPABLE_WITHOUT_TYA_CINEPOLIS_SHOPPER_SCOPE'
            : 'AUTH_NOT_SIGNIN_CAPABLE';
      byProfile.get(entry.profileFp).push({
        candidateFingerprint: entry.candidateFp,
        expectedBlockingCandidate: entry.expectedBlockingCandidate,
        claimProfileMatched: entry.claimProfileMatched,
        enabled,
        emailVerified: Boolean(entry.user.emailVerified),
        passwordProvider,
        tenantAllowed,
        projectAssigned,
        roleShopper,
        shopperIdExact,
        authNamespaceShopper,
        membershipPresent,
        membershipValid,
        rulesProjectReadEffective,
        rulesOwnShopperEffective,
        classification
      });
    }

    const profiles = [];
    for (const fp of request.profileFingerprints) {
      const candidates = (byProfile.get(fp) || []).sort((a, b) => a.candidateFingerprint.localeCompare(b.candidateFingerprint));
      const effective = candidates.filter(item => item.rulesProjectReadEffective);
      const ownEffective = candidates.filter(item => item.rulesOwnShopperEffective);
      const classification = candidates.length === 0
        ? 'NO_MATCHED_AUTH_CANDIDATE_NO_EFFECTIVE_ACCESS_PROVEN'
        : effective.length === 0
          ? 'AUTH_CANDIDATE_PRESENT_NO_EFFECTIVE_TYA_CINEPOLIS_ACCESS'
          : effective.length === 1
            ? 'ONE_UNPLANNED_EFFECTIVE_ACCESS_CANDIDATE'
            : 'MULTIPLE_UNPLANNED_EFFECTIVE_ACCESS_CANDIDATES';
      profiles.push({
        profileFingerprint: fp,
        blockingProfile: fp === request.blockingProfileFingerprint,
        candidateCount: candidates.length,
        effectiveProjectAccessCandidates: effective.length,
        effectiveOwnShopperAccessCandidates: ownEffective.length,
        unplannedEffectiveAccessPresent: effective.length > 0,
        classification,
        candidates
      });
    }

    const effectiveProfiles = profiles.filter(item => item.unplannedEffectiveAccessPresent);
    const totalCandidates = profiles.reduce((sum, item) => sum + item.candidateCount, 0);
    const effectiveCandidates = profiles.reduce((sum, item) => sum + item.effectiveProjectAccessCandidates, 0);
    const ownEffectiveCandidates = profiles.reduce((sum, item) => sum + item.effectiveOwnShopperAccessCandidates, 0);
    if (effectiveProfiles.length) findings.push(`UNPLANNED_EFFECTIVE_ACCESS_PROFILES:${effectiveProfiles.length}`);

    const decision = findings.some(item => item.startsWith('BLOCKING_CANDIDATE_SET_DRIFT'))
      ? 'HOLD_C6_SKIP13_AUTH_ACCESS_ADJUDICATION_PROVIDER_DRIFT'
      : effectiveProfiles.length
        ? 'HOLD_C6_SKIP13_UNPLANNED_EFFECTIVE_ACCESS_FOUND'
        : 'PASS_C6_SKIP13_NO_UNPLANNED_EFFECTIVE_ACCESS';

    const summary = {
      schemaVersion: 'cxorbia.c6.skip13-auth-access-adjudication.result.v1',
      generatedAt: new Date().toISOString(),
      decision,
      requestId: request.requestId,
      target: {
        firebaseProjectId: request.firebaseProjectId,
        tenantId: request.tenantId,
        projectId: request.projectId,
        blockingProfileFingerprint: request.blockingProfileFingerprint
      },
      scope: {
        requestedProfiles: 13,
        resolvedProfiles: profileIdByFp.size,
        providerAuthUsersScannedForFingerprintAndClaims: authUsers.length,
        adjudicatedAuthCandidates: totalCandidates,
        hrReads: 0,
        rawIdsExported: false,
        rawClaimsExported: false,
        piiExported: false
      },
      accessSemantics: {
        sourceContract: 'firestore.rules',
        membershipRequiredForShopperProjectRead: false,
        effectiveProjectReadRequires: ['enabled_password_auth','role_shopper','tenant_tya','project_cinepolis'],
        effectiveOwnShopperReadAdditionallyRequires: ['shopperId_exact']
      },
      aggregate: {
        profilesWithAuthCandidates: profiles.filter(item => item.candidateCount > 0).length,
        profilesWithUnplannedEffectiveAccess: effectiveProfiles.length,
        authCandidates: totalCandidates,
        effectiveProjectAccessCandidates: effectiveCandidates,
        effectiveOwnShopperAccessCandidates: ownEffectiveCandidates,
        blockingCandidateExpected: expectedBlockingSorted.length,
        blockingCandidateObserved: observedBlockingCandidateFps.length
      },
      profiles,
      findings,
      providerReadCounters,
      safety: {
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
      }
    };
    return finish(decision, summary, false);
  } catch (error) {
    errors.push(`ADJUDICATION_EXCEPTION:${String(error?.message || error).replace(/[^A-Za-z0-9_.:-]+/g, '_').slice(0, 180)}`);
    return finish('HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR');
  }
}

function finish(decision, summary = null, technicalFailure = true) {
  const report = summary || {
    schemaVersion: 'cxorbia.c6.skip13-auth-access-adjudication.result.v1',
    generatedAt: new Date().toISOString(),
    decision,
    requestId: request?.requestId || null,
    errors,
    findings,
    checks,
    providerReadCounters,
    safety: {
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
    }
  };
  report.errors = errors;
  report.checks = checks;
  fs.writeFileSync(path.join(outDir, 'report-source-safe.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outDir, 'decision.txt'), `${decision}\n`, 'utf8');
  fs.writeFileSync(path.join(genericDir, 'report.json'), JSON.stringify({
    schemaVersion: 'cxorbia.readonly-post-gates-report.v1',
    generatedAt: new Date().toISOString(),
    status: technicalFailure ? 'HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR' : 'PASS_READONLY_ADJUDICATION_COMPLETED',
    decision,
    requestId: request?.requestId || null,
    targetHeadSha: request?.targetHeadSha || null,
    checks,
    errors,
    findings,
    safeState: report.safety
  }, null, 2) + '\n', 'utf8');
  if (technicalFailure) process.exitCode = 1;
}

await main();
