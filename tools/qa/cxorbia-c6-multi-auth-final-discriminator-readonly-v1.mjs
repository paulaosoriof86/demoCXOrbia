#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { stableAuthCandidateFingerprint } from './cxorbia-c6-shopper-equivalent-universe.mjs';

const root = process.cwd();
const requestPath = path.resolve(process.argv[2] || 'backend/config/c6-multi-auth-final-discriminator-readonly-request-v1.json');
const outDir = path.resolve(process.env.CXORBIA_MULTI_AUTH_OUT_DIR || '.tmp/c6-multi-auth-final-discriminator-readonly-v1');
const genericDir = path.resolve('.tmp/cxorbia-readonly-post-gates-runner');
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
const EXPECTED_REQUEST_SCHEMA = 'cxorbia.c6.multi-auth-final-discriminator.request.v1';
const EXPECTED_CONTRACT_SCHEMA = 'cxorbia.c6.multi-auth-final-discriminator.contract.v1';

const text = value => String(value ?? '').trim();
const norm = value => text(value).toLowerCase();
const unique = values => [...new Set(values)];
const sha256 = value => crypto.createHash('sha256').update(String(value)).digest('hex');

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function scalarValues(value) {
  if (Array.isArray(value)) return value.flatMap(scalarValues);
  if (value && typeof value === 'object') return [];
  return [value];
}

function containsExact(value, acceptedValues) {
  const accepted = new Set((acceptedValues || []).map(text));
  return scalarValues(value).some(item => accepted.has(text(item)));
}

function hasTenant(claims, tenantId) {
  return norm(claims.tenantId) === norm(tenantId) || (Array.isArray(claims.tenants) && claims.tenants.some(x => norm(x) === norm(tenantId)));
}

function hasProject(claims, projectId) {
  return norm(claims.projectId) === norm(projectId) || (Array.isArray(claims.projectIds) && claims.projectIds.some(x => norm(x) === norm(projectId)));
}

function hasRole(claims, role) {
  return norm(claims.role) === norm(role) || (Array.isArray(claims.roles) && claims.roles.some(x => norm(x) === norm(role)));
}

function writeJson(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function writeDecision(decision) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'decision.txt'), decision + '\n', 'utf8');
  fs.mkdirSync(genericDir, { recursive: true });
  fs.writeFileSync(path.join(genericDir, 'decision.txt'), decision + '\n', 'utf8');
}

function safeError(error) {
  return String(error?.message || error || 'unknown').replace(/[\r\n]+/g, ' ').slice(0, 240);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(genericDir, { recursive: true });
  const checks = {};
  const failures = [];
  const ensure = (condition, key) => {
    checks[key] = Boolean(condition);
    if (!condition) failures.push(key);
  };

  ensure(fs.existsSync(requestPath), 'requestFilePresent');
  if (!checks.requestFilePresent) throw new Error('REQUEST_FILE_MISSING');
  const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
  const contractPath = path.resolve(request.contract || 'backend/contracts/c6-multi-auth-final-discriminator-readonly-v1.json');
  ensure(fs.existsSync(contractPath), 'contractFilePresent');
  if (!checks.contractFilePresent) throw new Error('CONTRACT_FILE_MISSING');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  const freezePath = path.resolve(contract.sourceLocks?.freeze || '');
  const priorOverlayPath = path.resolve(contract.sourceLocks?.priorOverlay || '');
  const providerEvidencePath = path.resolve(contract.sourceLocks?.providerEvidence || '');
  const importEvidencePath = path.resolve(contract.sourceLocks?.credentialImportEvidence || '');
  for (const [key, file] of [['freeze', freezePath], ['priorOverlay', priorOverlayPath], ['providerEvidence', providerEvidencePath], ['credentialImportEvidence', importEvidencePath]]) {
    ensure(Boolean(file && fs.existsSync(file)), `${key}Present`);
  }
  if (failures.length) throw new Error(`SOURCE_LOCK_FILE_MISSING:${failures.join(',')}`);

  const freeze = JSON.parse(fs.readFileSync(freezePath, 'utf8'));
  const priorOverlay = JSON.parse(fs.readFileSync(priorOverlayPath, 'utf8'));
  const providerEvidence = JSON.parse(fs.readFileSync(providerEvidencePath, 'utf8'));
  const importEvidence = JSON.parse(fs.readFileSync(importEvidencePath, 'utf8'));

  ensure(request.schemaVersion === EXPECTED_REQUEST_SCHEMA, 'requestSchemaExact');
  ensure(contract.schemaVersion === EXPECTED_CONTRACT_SCHEMA, 'contractSchemaExact');
  ensure(request.enabled === true && request.consumed === false && request.status === 'authorized_execute_once' && Number(request.allowedExecutions) === 1, 'oneShotStateExact');
  ensure(request.authorizedBy === 'Paula', 'authorizedByExact');
  ensure(request.repository === 'paulaosoriof86/demoCXOrbia' && request.branch === 'docs-tya-v6-v71-audit' && Number(request.pullRequest) === 7, 'repositoryLaneExact');
  ensure(request.firebaseProjectId === 'cxorbia-backend-dev', 'firebaseProjectExact');
  ensure(request.profileFingerprint === '7cc28c78de9bfda01d14', 'profileFingerprintExact');
  const expectedCandidates = ['4e6d26551d11db444bd0', '9b2b7ca1bd72c1301d29'].sort();
  ensure(JSON.stringify([...(request.candidateFingerprints || [])].sort()) === JSON.stringify(expectedCandidates), 'candidateFingerprintsExact');
  ensure(request.targetHeadSha === process.env.CXORBIA_TARGET_HEAD && Boolean(request.targetHeadSha), 'targetHeadExact');
  ensure(request.contract === path.relative(root, contractPath).replaceAll('\\', '/'), 'contractPathExact');
  ensure(request.scope?.auth === true && request.scope?.customClaims === true, 'authorizedReadScopeExact');
  for (const key of ['firestore', 'memberships', 'hr', 'visits', 'certifications', 'liquidations', 'storage', 'legacyCredentials']) ensure(request.scope?.[key] === false, `forbiddenReadFalse_${key}`);
  for (const key of ['providerWrites', 'authWrites', 'passwordChanges', 'passwordResets', 'claimsWrites', 'membershipWrites', 'firestoreWrites', 'rulesWrites', 'storageWrites', 'hrWrites', 'cloudBuilds', 'cloudRunDeploys', 'hostingDeploys']) ensure(Number(request.safeState?.[key]) === 0, `zero_${key}`);
  ensure(request.safeState?.merge === false && request.safeState?.production === false, 'releaseSafe');

  ensure(freeze.planFreeze?.rows === 340 && freeze.planFreeze?.uniqueRows === 340, 'freeze340Exact');
  ensure(freeze.planFreeze?.planDigestSha256 === contract.sourceLocks.freezeDigest, 'freezeDigestExact');
  ensure(freeze.planFreeze?.operationCounts?.HOLD === 0, 'freezeHoldZeroPreserved');
  ensure(priorOverlay.decision === 'STOP_RETRY_C6_SKIP13_ACCESS_RECONCILIATION_MULTI_AUTH_KEEPER_UNRESOLVED', 'priorOverlayDecisionExact');
  const priorSpecial = (priorOverlay.profiles || []).find(x => x.profileFingerprint === request.profileFingerprint);
  ensure(Boolean(priorSpecial), 'priorSpecialProfilePresent');
  ensure(JSON.stringify([...(priorSpecial?.candidateFingerprints || [])].sort()) === JSON.stringify(expectedCandidates), 'priorSpecialCandidatesExact');
  ensure(priorSpecial?.keeper == null || (priorSpecial?.candidateDispositions || []).every(x => x.keeper == null), 'priorKeeperUnresolved');
  ensure(providerEvidence.decision === 'HOLD_C6_SKIP13_V2_UNPLANNED_EFFECTIVE_ACCESS_FOUND', 'providerEvidenceDecisionExact');
  ensure(importEvidence.decision === contract.sourceLocks.credentialImportDecision, 'credentialImportDecisionExact');
  ensure(importEvidence.authorizationId === contract.sourceLocks.credentialImportAuthorizationId, 'credentialImportAuthorizationExact');
  if (failures.length) throw new Error(`SOURCE_GATE_FAILED:${failures.join(',')}`);

  ensure(Boolean(saPath && fs.existsSync(saPath)), 'serviceAccountPresent');
  if (!checks.serviceAccountPresent) throw new Error('SERVICE_ACCOUNT_MISSING');
  const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  ensure(serviceAccount.type === 'service_account' && serviceAccount.project_id === request.firebaseProjectId && Boolean(serviceAccount.client_email) && Boolean(serviceAccount.private_key), 'serviceAccountTargetExact');
  if (!checks.serviceAccountTargetExact) throw new Error('SERVICE_ACCOUNT_TARGET_INVALID');

  const adminModule = await import('firebase-admin');
  const admin = adminModule.default || adminModule;
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: request.firebaseProjectId });
  const auth = admin.auth();

  const page = await auth.listUsers(1000);
  const authListPages = 1;
  ensure(!page.pageToken, 'singleAuthPageWithinBudget');
  if (!checks.singleAuthPageWithinBudget) throw new Error('AUTH_LIST_REQUIRES_SECOND_PAGE_FORBIDDEN');

  const targetSet = new Set(request.candidateFingerprints);
  const matched = [];
  for (const user of page.users) {
    const candidateFingerprint = stableAuthCandidateFingerprint(user.uid);
    if (!targetSet.has(candidateFingerprint)) continue;
    matched.push({ candidateFingerprint, user });
  }
  ensure(matched.length === 2 && new Set(matched.map(x => x.candidateFingerprint)).size === 2, 'exactTwoTargetCandidatesFound');
  ensure(JSON.stringify(matched.map(x => x.candidateFingerprint).sort()) === JSON.stringify(expectedCandidates), 'providerCandidateSetExact');
  if (!checks.exactTwoTargetCandidatesFound || !checks.providerCandidateSetExact) {
    const result = {
      schemaVersion: 'cxorbia.c6.multi-auth-final-discriminator.result.v1',
      generatedAt: new Date().toISOString(),
      decision: 'STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_CANDIDATE_SET_DRIFT',
      target: { profileFingerprint: request.profileFingerprint, candidateFingerprints: request.candidateFingerprints },
      providerRead: { authListPages, authUsersScannedForFingerprintOnly: page.users.length, targetCandidatesInspected: matched.length },
      checks,
      failures: failures.concat(['providerCandidateSetExact']),
      safety: request.safeState
    };
    writeJson(path.join(outDir, 'result.json'), result);
    writeDecision(result.decision);
    console.log(result.decision);
    return;
  }

  const allowlist = new Set(contract.readPolicy.inspectCustomClaimsAllowlist || []);
  const scopeKeys = new Set(['shopperId','tenantId','tenants','projectId','projectIds','role','roles','authNamespace','namespace']);
  const decisiveAnchors = contract.canonicalAnchorPolicy?.decisiveAnchors || [];
  const vectors = matched.map(({ candidateFingerprint, user }) => {
    const claims = user.customClaims && typeof user.customClaims === 'object' ? user.customClaims : {};
    const inspectedKeys = Object.keys(claims).filter(key => allowlist.has(key)).sort();
    const markerFingerprints = inspectedKeys.filter(key => !scopeKeys.has(key)).map(key => ({
      key,
      valueFingerprint: sha256(`${key}\0${stableJson(claims[key])}`).slice(0, 24)
    }));
    const decisiveMatches = [];
    for (const anchor of decisiveAnchors) {
      for (const key of anchor.keys || []) {
        if (!allowlist.has(key) || !Object.prototype.hasOwnProperty.call(claims, key)) continue;
        if (containsExact(claims[key], anchor.acceptedValues || [])) decisiveMatches.push({ anchorId: anchor.id, key });
      }
    }
    const providerIds = unique((user.providerData || []).map(item => text(item?.providerId)).filter(Boolean));
    const shopperIdValue = Object.prototype.hasOwnProperty.call(claims, 'shopperId') ? claims.shopperId : null;
    return {
      candidateFingerprint,
      baseline: {
        tenantAllowed: hasTenant(claims, contract.target.tenantId),
        projectAssigned: hasProject(claims, contract.target.projectId),
        roleShopper: hasRole(claims, 'shopper'),
        passwordProvider: providerIds.includes('password'),
        shopperIdPresent: typeof shopperIdValue === 'string' && text(shopperIdValue).length > 0,
        shopperIdValueFingerprint: typeof shopperIdValue === 'string' && text(shopperIdValue) ? sha256(`shopperId\0${text(shopperIdValue)}`).slice(0, 24) : null,
        namespaceShopper: norm(claims.authNamespace) === 'shopper' || norm(claims.namespace) === 'shopper'
      },
      inspectedAllowlistedClaimKeys: inspectedKeys,
      sourceSafeMarkerFingerprints: markerFingerprints,
      decisiveMatches,
      decisiveMatchCount: decisiveMatches.length
    };
  }).sort((a,b) => a.candidateFingerprint.localeCompare(b.candidateFingerprint));

  const baselineAllExact = vectors.every(v => v.baseline.tenantAllowed && v.baseline.projectAssigned && v.baseline.roleShopper && v.baseline.passwordProvider && v.baseline.shopperIdPresent);
  const shopperHashes = vectors.map(v => v.baseline.shopperIdValueFingerprint);
  const sameShopperIdClaim = shopperHashes.every(Boolean) && new Set(shopperHashes).size === 1;
  checks.bothCandidatesRetainExpectedTechnicalScope = baselineAllExact;
  checks.bothCandidatesShareSameShopperIdClaimFingerprint = sameShopperIdClaim;

  let decision;
  let keeper = null;
  let accessToRetire = null;
  let reason;
  const decisiveCandidates = vectors.filter(v => v.decisiveMatchCount > 0);
  if (!baselineAllExact || !sameShopperIdClaim) {
    decision = 'STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_PROVIDER_SCOPE_DRIFT';
    reason = 'Prior exact technical scope or shared shopperId claim no longer reconciles for both target candidates.';
  } else if (decisiveCandidates.length === 1) {
    keeper = decisiveCandidates[0].candidateFingerprint;
    accessToRetire = vectors.find(v => v.candidateFingerprint !== keeper)?.candidateFingerprint || null;
    decision = keeper && accessToRetire
      ? 'PASS_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_UNIQUE_KEEPER_PROVEN'
      : 'STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_CANDIDATE_SET_DRIFT';
    reason = 'Exactly one candidate matches at least one versioned decisive credential-import anchor; the competing candidate matches none.';
  } else if (decisiveCandidates.length === 2) {
    decision = 'STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_CONTRADICTORY_OR_NONUNIQUE_ANCHORS';
    reason = 'Both target candidates match decisive accepted anchors, so the anchor set is not unique.';
  } else {
    decision = 'STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_TENANT_ADJUDICATION_REQUIRED';
    reason = 'No target candidate has a unique accepted versioned decisive anchor. Unknown technical differences are intentionally non-decisive.';
  }

  const result = {
    schemaVersion: 'cxorbia.c6.multi-auth-final-discriminator.result.v1',
    generatedAt: new Date().toISOString(),
    decision,
    target: {
      firebaseProjectId: request.firebaseProjectId,
      profileFingerprint: request.profileFingerprint,
      candidateFingerprints: request.candidateFingerprints
    },
    providerRead: {
      authListPages,
      authUsersScannedForFingerprintOnly: page.users.length,
      targetCandidatesInspected: vectors.length,
      nonTargetAttributesInspected: false,
      firestoreReads: 0,
      membershipReads: 0,
      hrReads: 0,
      storageReads: 0,
      legacyCredentialReads: 0
    },
    discriminator: {
      forbiddenSelectorsUsed: false,
      decisiveAnchorPolicy: decisiveAnchors.map(anchor => ({ id: anchor.id, keys: anchor.keys, acceptedValueCount: (anchor.acceptedValues || []).length })),
      vectors,
      decisiveCandidateCount: decisiveCandidates.length,
      keeperCandidateFingerprint: keeper,
      accessToRetireCandidateFingerprint: accessToRetire,
      reason
    },
    checks,
    freeze: {
      rows: freeze.planFreeze.rows,
      uniqueRows: freeze.planFreeze.uniqueRows,
      digest: freeze.planFreeze.planDigestSha256,
      modified: false,
      executed: false
    },
    finalPlan: decision.startsWith('PASS_') ? {
      rows: contract.passPlanContract.rows,
      uniqueRows: contract.passPlanContract.uniqueRows,
      onePrimaryOperationPerProfile: contract.passPlanContract.onePrimaryOperationPerProfile,
      operationCounts: contract.passPlanContract.operationCounts,
      holdProfiles: [],
      targetHoldZeroSatisfied: true,
      executable: false,
      writesRequireSeparateAuthorization: true
    } : {
      produced: false,
      targetHoldZeroSatisfied: false,
      executable: false
    },
    safety: request.safeState
  };

  writeJson(path.join(outDir, 'result.json'), result);
  writeJson(path.join(outDir, 'candidate-vectors-source-safe.json'), { schemaVersion: 'cxorbia.c6.multi-auth-final-discriminator.candidate-vectors.v1', generatedAt: result.generatedAt, profileFingerprint: request.profileFingerprint, vectors });

  if (decision.startsWith('PASS_')) {
    const finalProfiles = (priorOverlay.profiles || []).map(profile => {
      if (profile.profileFingerprint !== request.profileFingerprint) return profile;
      return {
        ...profile,
        classification: 'IDENTIDAD_CANONICA_VIGENTE_CON_DUPLICADO_A_RETIRAR',
        technicalClass: 'UNIQUE_KEEPER_PROVEN_BY_VERSIONED_AUTH_CLAIM_ANCHOR',
        disposition: 'PRESERVE_EXISTING_KEEPER_AUTH_NO_REPAIR',
        primaryTransition: 'PRESERVE_NO_AUTH_TO_NO_OP',
        keeperCandidateFingerprint: keeper,
        accessToRetireCandidateFingerprint: accessToRetire,
        candidateDispositions: (profile.candidateFingerprints || []).map(candidateFingerprint => ({
          candidateFingerprint,
          classification: candidateFingerprint === keeper ? 'IDENTIDAD_CANONICA_VIGENTE' : 'ACCESO_DUPLICADO_A_RETIRAR',
          keeper: candidateFingerprint === keeper,
          retireAccess: candidateFingerprint === accessToRetire,
          writeAuthorized: false
        })),
        unresolvedReason: null
      };
    });
    const finalOverlay = {
      schemaVersion: 'cxorbia.c6.skip13-access-reconciliation-final-overlay.v1',
      generatedAt: result.generatedAt,
      authorizationSource: request.authorizationSource,
      repository: request.repository,
      branch: request.branch,
      pullRequest: request.pullRequest,
      sourceFreezeDigest: contract.sourceLocks.freezeDigest,
      sourcePriorOverlay: contract.sourceLocks.priorOverlay,
      sourceDiscriminatorContract: request.contract,
      profileFingerprint: request.profileFingerprint,
      keeperCandidateFingerprint: keeper,
      accessToRetireCandidateFingerprint: accessToRetire,
      profiles: finalProfiles,
      unmatchedSkipProfilesPreserved: priorOverlay.unmatchedSkipProfilesPreserved || [],
      derivedFinalPlanState: {
        rows: contract.passPlanContract.rows,
        uniqueRows: contract.passPlanContract.uniqueRows,
        onePrimaryOperationPerProfile: true,
        operationCounts: contract.passPlanContract.operationCounts,
        holdProfiles: [],
        targetHoldZeroSatisfied: true,
        executable: false,
        writesRequireSeparateAuthorization: true
      },
      pendingWrite: {
        type: 'RETIRE_DUPLICATE_AUTH_ACCESS',
        candidateFingerprint: accessToRetire,
        authorizedByThisBlock: false,
        requiresSnapshotReadbackAndSeparateAuthorization: true
      },
      preservation: {
        frozenPlanModified: false,
        historicalProfilesDeleted: 0,
        providerAccountsChanged: 0
      },
      decision
    };
    writeJson(path.join(outDir, 'final-overlay.json'), finalOverlay);
  }

  writeDecision(decision);
  console.log(decision);
}

main().catch(error => {
  const decision = 'HOLD_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_TECHNICAL_ERROR';
  const payload = {
    schemaVersion: 'cxorbia.c6.multi-auth-final-discriminator.result.v1',
    generatedAt: new Date().toISOString(),
    decision,
    error: safeError(error),
    safety: {
      providerWrites: 0,
      authWrites: 0,
      passwordChanges: 0,
      passwordResets: 0,
      claimsWrites: 0,
      membershipReads: 0,
      membershipWrites: 0,
      firestoreReads: 0,
      firestoreWrites: 0,
      hrReads: 0,
      hrWrites: 0,
      rulesWrites: 0,
      storageReads: 0,
      storageWrites: 0,
      cloudBuilds: 0,
      cloudRunDeploys: 0,
      hostingDeploys: 0,
      merge: false,
      production: false
    }
  };
  writeJson(path.join(outDir, 'result.json'), payload);
  writeDecision(decision);
  console.log(decision);
  process.exitCode = 2;
});
