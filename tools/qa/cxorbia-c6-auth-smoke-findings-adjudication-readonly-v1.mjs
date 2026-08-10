#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import { norm, list, fingerprint } from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import { stableAuthCandidateFingerprint, stableMemberFingerprint } from './cxorbia-c6-shopper-equivalent-universe.mjs';

const FIREBASE_PROJECT = process.env.CXORBIA_FIREBASE_PROJECT || 'cxorbia-backend-dev';
const TARGET_TENANT = process.env.CXORBIA_TENANT_ID || 'tya';
const TARGET_PROJECT = process.env.CXORBIA_PROJECT_ID || 'cinepolis';
const EXPECTED_AUTH_USERS = Number(process.env.CXORBIA_EXPECTED_AUTH_USERS || 228);
const EXPECTED_DUPLICATE_GROUPS = Number(process.env.CXORBIA_EXPECTED_DUPLICATE_GROUPS || 5);
const EXPECTED_UNKNOWN_ENABLED_ROLES = Number(process.env.CXORBIA_EXPECTED_UNKNOWN_ENABLED_ROLES || 4);
const EXPECTED_ADMIN_TENANT_OUTLIERS = Number(process.env.CXORBIA_EXPECTED_ADMIN_TENANT_OUTLIERS || 1);
const EXPECTED_SHOPPER_SCOPE_OUTLIERS = Number(process.env.CXORBIA_EXPECTED_SHOPPER_SCOPE_OUTLIERS || 1);
const PLAN_FILE = process.env.CXORBIA_FINAL_PLAN_V4;
const FREEZE_FILE = process.env.CXORBIA_FINAL_FREEZE_V4 || 'backend/config/c6-shopper-auth-final-freeze-v4.json';
const CREDENTIAL_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const ADMIN_ROLES = new Set(['super','admin','ops','coordinador']);
const CLIENT_ROLES = new Set(['cliente','client']);
const ALLOWED_ROLES = new Set([...ADMIN_ROLES, ...CLIENT_ROLES, 'shopper']);
const PLAN_DIGEST = 'c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4';

const sha256 = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const safeError = error => {
  const raw = String(error?.message || error || 'UNKNOWN');
  return { code: (raw.split(':')[0] || 'UNKNOWN').replace(/[^A-Za-z0-9_.-]+/g,'_').slice(0,120), fingerprint: sha256(raw).slice(0,24) };
};
const ensure = (value, code) => { if (!value) throw new Error(code); };
const uniq = values => [...new Set(values.filter(Boolean))];

function tenantAllowed(claims, role) {
  return role === 'super' || norm(claims?.tenantId) === TARGET_TENANT || list(claims?.tenants).map(norm).includes(TARGET_TENANT);
}
function namespaceCompatible(claims, role) {
  const actual = norm(claims?.authNamespace);
  if (!actual) return true;
  return actual === (role === 'shopper' ? 'shopper' : 'staff');
}
function productAccessEffective(claims, role) {
  if (!ALLOWED_ROLES.has(role)) return false;
  if (!tenantAllowed(claims, role) || !namespaceCompatible(claims, role)) return false;
  const projects = uniq(list(claims?.projectIds).map(norm));
  if ((role === 'shopper' || CLIENT_ROLES.has(role)) && projects.length === 0) return false;
  if (role === 'shopper' && !String(claims?.shopperId || '').trim()) return false;
  return true;
}
function authNamespaceClass(claims) {
  const value = norm(claims?.authNamespace);
  if (!value) return 'NONE';
  if (value === 'staff') return 'STAFF';
  if (value === 'shopper') return 'SHOPPER';
  return 'OTHER';
}
function buildPlanRelations(plan, freeze) {
  ensure(plan?.schemaVersion === 'cxorbia.c6.shopper-auth-final-plan.v4', 'PLAN_SCHEMA_DRIFT');
  ensure(Array.isArray(plan?.rows) && plan.rows.length === 340, 'PLAN_ROWS_DRIFT');
  ensure(plan?.plan?.sourceSafeRowsDigestSha256 === PLAN_DIGEST, 'PLAN_DIGEST_DRIFT');
  ensure(freeze?.finalPlanV4?.rowsDigestSha256 === PLAN_DIGEST, 'FREEZE_DIGEST_DRIFT');
  ensure(freeze?.finalPlanV4?.expectedAuthUsersAfter === EXPECTED_AUTH_USERS, 'FREEZE_AUTH_POPULATION_DRIFT');
  const profiles = new Map(plan.rows.map(row => [row.profileFp, row]));
  const candidates = new Map();
  const addCandidate = (candidateFp, row, relation) => {
    if (!candidateFp) return;
    const prior = candidates.get(candidateFp);
    ensure(!prior || prior.profileFp === row.profileFp, 'PLAN_CANDIDATE_RELATION_ALIAS');
    candidates.set(candidateFp, { profileFp: row.profileFp, primary: row.primary, relation });
  };
  for (const row of plan.rows) {
    addCandidate(row.preserveAuthCandidateFingerprint, row, 'PRESERVE_AUTH_CANDIDATE');
    addCandidate(row.secondaryAuthDisposition?.keeperCandidateFingerprint, row, 'SECONDARY_KEEPER');
    addCandidate(row.secondaryAuthDisposition?.retireAccessCandidateFingerprint, row, 'SECONDARY_RETIRE');
  }
  const closed = freeze?.tenantAdjudication || {};
  return {
    profiles,
    candidates,
    closedKeeperFp: closed.keeperCandidateFingerprint || null,
    closedRetireFp: closed.retireAccessCandidateFingerprint || null,
    closedProfileFp: closed.profileFingerprint || null
  };
}
function sourceSafeUser(user, relations) {
  const claims = user.customClaims || {};
  const role = norm(claims.role);
  const projects = uniq(list(claims.projectIds).map(norm));
  const candidateFp = stableAuthCandidateFingerprint(user.uid);
  const shopperId = String(claims.shopperId || '').trim();
  const shopperProfileFp = shopperId ? stableMemberFingerprint(shopperId) : null;
  const candidateRelation = relations.candidates.get(candidateFp) || null;
  const profileRelation = shopperProfileFp && relations.profiles.has(shopperProfileFp)
    ? { profileFp: shopperProfileFp, primary: relations.profiles.get(shopperProfileFp).primary, relation: 'SHOPPER_CLAIM_PROFILE' }
    : null;
  const relation = candidateRelation || profileRelation;
  const email = norm(user.email);
  return {
    candidateFp,
    enabled: !user.disabled,
    emailGroupFp: email ? fingerprint('provider-email-group-v1\0' + email) : null,
    internalCxorbiaEmail: email.endsWith('@auth.cxorbia.invalid'),
    role,
    roleAllowed: ALLOWED_ROLES.has(role),
    roleFamily: ADMIN_ROLES.has(role) ? 'ADMIN_OPERACIONES' : (role === 'shopper' ? 'SHOPPER' : (CLIENT_ROLES.has(role) ? 'CLIENTE' : 'OUTSIDE_CONTRACT')),
    tenantAllowed: tenantAllowed(claims, role),
    hasTenantClaim: Boolean(norm(claims.tenantId) || list(claims.tenants).length),
    projectCount: projects.length,
    targetProjectScoped: projects.includes(TARGET_PROJECT),
    shopperScopePresent: Boolean(shopperId),
    namespaceClass: authNamespaceClass(claims),
    namespaceCompatible: namespaceCompatible(claims, role),
    effectiveProductAccess: productAccessEffective(claims, role),
    planRelation: relation ? { profileFp: relation.profileFp, primary: relation.primary, relation: relation.relation } : null,
    closedLineage: candidateFp === relations.closedKeeperFp ? 'CLOSED_KEEPER' : (candidateFp === relations.closedRetireFp ? 'CLOSED_RETIRED_ACCESS' : null)
  };
}
function classifyDuplicateGroup(members, relations) {
  const enabled = members.filter(member => member.enabled);
  const effective = enabled.filter(member => member.effectiveProductAccess);
  const containsClosedRetire = members.some(member => member.candidateFp === relations.closedRetireFp);
  const containsClosedKeeper = members.some(member => member.candidateFp === relations.closedKeeperFp);
  if (containsClosedRetire && containsClosedKeeper && enabled.length === 1 && effective.length === 1) {
    return { classification: 'EXPECTED_CLOSED_HISTORICAL_DUPLICATE_NO_PARALLEL_ACCESS', ambiguous: false, repairRequired: false };
  }
  if (enabled.length <= 1) {
    return { classification: 'HISTORICAL_OR_RETIRED_NO_PARALLEL_EFFECTIVE_ACCESS', ambiguous: false, repairRequired: false };
  }
  if (effective.length >= 2) {
    return { classification: 'DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS', ambiguous: false, repairRequired: true };
  }
  return { classification: 'AMBIGUOUS_MULTI_ENABLED_PROVIDER_IDENTITY_WITH_BLOCKED_MEMBER', ambiguous: true, repairRequired: false };
}
function classifyUnknownRole(member) {
  if (member.planRelation?.profileFp) {
    return { classification: 'DEFECT_REAL_ACCESS_BLOCKED_ROLE_CLAIM_FOR_PLANNED_PROFILE', ambiguous: false, repairRequired: true };
  }
  return { classification: 'SIN_ACCESO_EFECTIVO_ROLE_NOT_ALLOWED', ambiguous: false, repairRequired: false };
}
function classifyAdminTenant(member) {
  if (member.targetProjectScoped) return { classification: 'DEFECT_REAL_TENANT_SCOPE_MISMATCH_WITH_TARGET_PROJECT', ambiguous: false, repairRequired: true };
  if (member.hasTenantClaim) return { classification: 'EXPECTED_CROSS_TENANT_NO_TYA_EFFECTIVE_ACCESS', ambiguous: false, repairRequired: false };
  return { classification: 'AMBIGUOUS_ADMIN_MISSING_TENANT_SCOPE', ambiguous: true, repairRequired: false };
}
function classifyShopperScope(member) {
  if (member.planRelation?.profileFp && (!member.targetProjectScoped || !member.shopperScopePresent)) {
    return { classification: 'DEFECT_REAL_SHOPPER_SCOPE_DRIFT_FOR_PLANNED_PROFILE', ambiguous: false, repairRequired: true };
  }
  if (!member.shopperScopePresent) {
    return { classification: 'SIN_ACCESO_EFECTIVO_SHOPPER_ID_MISSING', ambiguous: false, repairRequired: false };
  }
  if (!member.targetProjectScoped) {
    return { classification: 'EXPECTED_NON_TARGET_PROJECT_SHOPPER', ambiguous: false, repairRequired: false };
  }
  return { classification: 'AMBIGUOUS_SHOPPER_SCOPE_OUTLIER', ambiguous: true, repairRequired: false };
}
function overlapCounts(issueSets) {
  const names = Object.keys(issueSets);
  const out = {};
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = issueSets[names[i]], b = issueSets[names[j]];
      out[`${names[i]}__${names[j]}`] = [...a].filter(fp => b.has(fp)).length;
    }
  }
  return out;
}
async function listAllUsersOnce(auth) {
  const first = await auth.listUsers(1000);
  ensure(!first.pageToken, 'PROVIDER_READ_WOULD_REQUIRE_SECOND_PAGE');
  return { users: first.users, providerReads: 1 };
}
function selfTest() {
  const rel = { closedKeeperFp: 'k', closedRetireFp: 'r' };
  const base = { enabled: true, effectiveProductAccess: true, candidateFp: 'x' };
  ensure(classifyDuplicateGroup([{...base,candidateFp:'k'},{...base,candidateFp:'r',enabled:false,effectiveProductAccess:false}], rel).classification === 'EXPECTED_CLOSED_HISTORICAL_DUPLICATE_NO_PARALLEL_ACCESS', 'SELFTEST_CLOSED_DUP');
  ensure(classifyDuplicateGroup([{...base,candidateFp:'a'},{...base,candidateFp:'b'}], rel).repairRequired === true, 'SELFTEST_REAL_DUP');
  ensure(classifyUnknownRole({...base,planRelation:{profileFp:'p'}}).repairRequired === true, 'SELFTEST_ROLE');
  ensure(classifyAdminTenant({...base,targetProjectScoped:true}).repairRequired === true, 'SELFTEST_ADMIN');
  ensure(classifyShopperScope({...base,planRelation:{profileFp:'p'},targetProjectScoped:false,shopperScopePresent:true}).repairRequired === true, 'SELFTEST_SHOPPER');
  return true;
}

async function main() {
  const report = {
    schemaVersion: 'cxorbia.c6.auth-smoke-findings-adjudication-readonly.v1',
    generatedAt: new Date().toISOString(),
    firebaseProjectId: FIREBASE_PROJECT,
    targetTenant: TARGET_TENANT,
    targetProject: TARGET_PROJECT,
    expectedAuthUsers: EXPECTED_AUTH_USERS,
    decision: 'STOP_RETRY_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION',
    provider: { reads: 0, writes: 0 },
    observed: { authPopulation: 0, duplicateProviderEmailGroups: 0, unknownEnabledRoles: 0, adminTenantOutliers: 0, shopperScopeOutliers: 0 },
    duplicateProviderEmailGroups: [],
    unknownEnabledRoles: [],
    adminTenantOutliers: [],
    shopperScopeOutliers: [],
    overlaps: {},
    adjudication: { ambiguousCases: 0, repairRequiredCases: 0, noEffectiveAccessCases: 0, expectedHistoricalTechnicalCases: 0 },
    safety: {
      providerReads: 0, providerWrites: 0, authWrites: 0, iamWrites: 0, firestoreWrites: 0, hrWrites: 0, rulesWrites: 0, storageWrites: 0,
      prewrite: false, activation: false, newSmoke: false, make: 0, gemini: 0, payments: 0, deploys: 0, merge: false, production: false,
      rawUidExported: false, rawEmailExported: false, rawShopperIdExported: false, rawNameExported: false, rawClaimsExported: false, rawCredentialExported: false
    }
  };
  try {
    selfTest();
    if (process.argv.includes('--source-self-test')) {
      report.decision = 'PASS_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION_SOURCE_SELFTEST';
      process.stdout.write(JSON.stringify(report) + '\n');
      return;
    }
    ensure(PLAN_FILE && fs.existsSync(PLAN_FILE), 'FINAL_PLAN_V4_MISSING');
    ensure(fs.existsSync(FREEZE_FILE), 'FREEZE_V4_MISSING');
    ensure(CREDENTIAL_FILE && fs.existsSync(CREDENTIAL_FILE), 'EPHEMERAL_CREDENTIAL_MISSING');
    const plan = JSON.parse(fs.readFileSync(PLAN_FILE,'utf8'));
    const freeze = JSON.parse(fs.readFileSync(FREEZE_FILE,'utf8'));
    const relations = buildPlanRelations(plan, freeze);
    const sa = JSON.parse(fs.readFileSync(CREDENTIAL_FILE,'utf8'));
    ensure(sa?.type === 'service_account' && sa?.project_id === FIREBASE_PROJECT && sa?.client_email && sa?.private_key, 'EPHEMERAL_CREDENTIAL_INVALID');
    if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa), projectId: FIREBASE_PROJECT });
    const { users, providerReads } = await listAllUsersOnce(admin.auth());
    report.provider.reads = providerReads;
    report.safety.providerReads = providerReads;
    report.observed.authPopulation = users.length;
    ensure(users.length === EXPECTED_AUTH_USERS, `AUTH_POPULATION_${users.length}`);
    const safeUsers = users.map(user => sourceSafeUser(user, relations));
    const byFp = new Map(safeUsers.map(member => [member.candidateFp, member]));
    const emailGroups = new Map();
    for (const member of safeUsers) {
      if (!member.emailGroupFp) continue;
      if (!emailGroups.has(member.emailGroupFp)) emailGroups.set(member.emailGroupFp, []);
      emailGroups.get(member.emailGroupFp).push(member);
    }
    const duplicateGroups = [...emailGroups.entries()].filter(([,members]) => members.length > 1).sort(([a],[b]) => a.localeCompare(b));
    report.observed.duplicateProviderEmailGroups = duplicateGroups.length;
    ensure(duplicateGroups.length === EXPECTED_DUPLICATE_GROUPS, `DUPLICATE_GROUP_COUNT_${duplicateGroups.length}`);
    const issueSets = { duplicateEmail: new Set(), unknownRole: new Set(), adminTenant: new Set(), shopperScope: new Set() };
    for (const [groupFp, members] of duplicateGroups) {
      members.forEach(member => issueSets.duplicateEmail.add(member.candidateFp));
      const c = classifyDuplicateGroup(members, relations);
      report.duplicateProviderEmailGroups.push({
        groupFp,
        memberCount: members.length,
        enabledCount: members.filter(member => member.enabled).length,
        effectiveProductAccessCount: members.filter(member => member.enabled && member.effectiveProductAccess).length,
        internalCxorbiaEmail: members.every(member => member.internalCxorbiaEmail),
        members: members.map(member => ({ candidateFp: member.candidateFp, enabled: member.enabled, roleFamily: member.roleFamily, roleAllowed: member.roleAllowed, tenantAllowed: member.tenantAllowed, targetProjectScoped: member.targetProjectScoped, shopperScopePresent: member.shopperScopePresent, namespaceCompatible: member.namespaceCompatible, effectiveProductAccess: member.effectiveProductAccess, planRelation: member.planRelation, closedLineage: member.closedLineage })),
        ...c
      });
    }
    const unknown = safeUsers.filter(member => member.enabled && !member.roleAllowed).sort((a,b) => a.candidateFp.localeCompare(b.candidateFp));
    report.observed.unknownEnabledRoles = unknown.length;
    ensure(unknown.length === EXPECTED_UNKNOWN_ENABLED_ROLES, `UNKNOWN_ENABLED_ROLE_COUNT_${unknown.length}`);
    for (const member of unknown) {
      issueSets.unknownRole.add(member.candidateFp);
      report.unknownEnabledRoles.push({ candidateFp: member.candidateFp, roleFp: fingerprint('role-v1\0' + member.role), rolePresent: Boolean(member.role), tenantAllowed: member.tenantAllowed, targetProjectScoped: member.targetProjectScoped, shopperScopePresent: member.shopperScopePresent, namespaceClass: member.namespaceClass, planRelation: member.planRelation, closedLineage: member.closedLineage, ...classifyUnknownRole(member) });
    }
    const adminOutliers = safeUsers.filter(member => member.enabled && member.roleFamily === 'ADMIN_OPERACIONES' && !member.tenantAllowed).sort((a,b) => a.candidateFp.localeCompare(b.candidateFp));
    report.observed.adminTenantOutliers = adminOutliers.length;
    ensure(adminOutliers.length === EXPECTED_ADMIN_TENANT_OUTLIERS, `ADMIN_TENANT_OUTLIER_COUNT_${adminOutliers.length}`);
    for (const member of adminOutliers) {
      issueSets.adminTenant.add(member.candidateFp);
      report.adminTenantOutliers.push({ candidateFp: member.candidateFp, roleFamily: member.roleFamily, hasTenantClaim: member.hasTenantClaim, projectCount: member.projectCount, targetProjectScoped: member.targetProjectScoped, namespaceCompatible: member.namespaceCompatible, planRelation: member.planRelation, closedLineage: member.closedLineage, ...classifyAdminTenant(member) });
    }
    const shopperOutliers = safeUsers.filter(member => member.enabled && member.roleFamily === 'SHOPPER' && (!member.targetProjectScoped || !member.shopperScopePresent)).sort((a,b) => a.candidateFp.localeCompare(b.candidateFp));
    report.observed.shopperScopeOutliers = shopperOutliers.length;
    ensure(shopperOutliers.length === EXPECTED_SHOPPER_SCOPE_OUTLIERS, `SHOPPER_SCOPE_OUTLIER_COUNT_${shopperOutliers.length}`);
    for (const member of shopperOutliers) {
      issueSets.shopperScope.add(member.candidateFp);
      report.shopperScopeOutliers.push({ candidateFp: member.candidateFp, tenantAllowed: member.tenantAllowed, projectCount: member.projectCount, targetProjectScoped: member.targetProjectScoped, shopperScopePresent: member.shopperScopePresent, namespaceCompatible: member.namespaceCompatible, planRelation: member.planRelation, closedLineage: member.closedLineage, ...classifyShopperScope(member) });
    }
    report.overlaps = overlapCounts(issueSets);
    const allCases = [
      ...report.duplicateProviderEmailGroups,
      ...report.unknownEnabledRoles,
      ...report.adminTenantOutliers,
      ...report.shopperScopeOutliers
    ];
    report.adjudication.ambiguousCases = allCases.filter(item => item.ambiguous).length;
    report.adjudication.repairRequiredCases = allCases.filter(item => item.repairRequired).length;
    report.adjudication.noEffectiveAccessCases = allCases.filter(item => String(item.classification).startsWith('SIN_ACCESO_EFECTIVO')).length;
    report.adjudication.expectedHistoricalTechnicalCases = allCases.filter(item => /EXPECTED|HISTORICAL|RETIRED/.test(String(item.classification))).length;
    ensure(report.safety.providerReads === 1, 'PROVIDER_READ_COUNT_DRIFT');
    if (report.adjudication.ambiguousCases > 0) throw new Error(`AMBIGUOUS_ADJUDICATION_${report.adjudication.ambiguousCases}`);
    report.decision = 'PASS_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION';
    process.stdout.write(JSON.stringify(report) + '\n');
  } catch (error) {
    report.error = safeError(error);
    process.stdout.write(JSON.stringify(report) + '\n');
    process.exitCode = 2;
  }
}

await main();
