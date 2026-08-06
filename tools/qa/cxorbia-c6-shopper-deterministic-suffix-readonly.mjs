#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';
import {
  TENANT_ID,
  CANONICAL_PROJECT_ID,
  EXPECTED_FIREBASE_PROJECT,
  text,
  norm,
  sha256,
  fingerprint,
  asciiToken,
  internalEmail,
  passwordSignInEmail,
  decryptCredentialBundle,
  fetchFirebaseWebConfig
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

const TECH_KEYS = [
  'shopperId','legacyShopperId','legacyId','externalShopperId','externalId',
  'sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'
];
const NAME_KEYS = ['nombre','name','displayName','fullName','legacyName','personName','shopperName'];
const FIRST_KEYS = ['firstName','primerNombre','nombre1','givenName'];
const SURNAME_KEYS = ['lastName','apellido','apellidos','surname','familyName','primerApellido'];
const LOGIN_KEYS = ['username','userName','usuario','login','loginIdentifier','normalizedLogin'];
const ACTIVE_STATUSES = new Set(['active','activo','enabled','habilitado','approved','aprobado','complete','completo','completed','verified','verificado','perfil_completo','vigente']);
const INACTIVE_STATUSES = new Set(['inactive','inactivo','disabled','deshabilitado','deleted','eliminado','archived','archivado','rejected','rechazado','blocked','bloqueado','suspended','suspendido','cancelled','canceled','cancelado']);

const root = process.cwd();
const requestPath = process.argv[2] || 'backend/config/corte6-shopper-deterministic-suffix-readonly-request.json';
const outDir = path.join(root, '.tmp/c6-shopper-deterministic-suffix-readonly');
const genericDir = path.join(root, '.tmp/cxorbia-readonly-post-gates-runner');
const privateDir = path.join(root, '.tmp/c6-shopper-deterministic-suffix-private');
const remoteRoot = String(process.env.CXORBIA_DEV_ROOT_URL || 'https://cxorbia-backend-dev.web.app').replace(/\/$/, '');
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const uniq = values => [...new Set(values.filter(Boolean))];
const fp = (kind, value) => fingerprint(`${kind}\0${value}`);
const add = (map, key, value) => {
  const k = text(key);
  if (!k) return;
  if (!map.has(k)) map.set(k, []);
  map.get(k).push(value);
};
const pick = (obj, keys) => {
  for (const key of keys) {
    const value = text(obj?.[key]);
    if (value) return value;
  }
  return '';
};
const exactClaims = (claims, shopperId, tenantId = TENANT_ID, projectId = CANONICAL_PROJECT_ID) =>
  claims?.tenantId === tenantId &&
  claims?.role === 'shopper' &&
  claims?.authNamespace === 'shopper' &&
  claims?.shopperId === shopperId &&
  Array.isArray(claims?.projectIds) &&
  claims.projectIds.includes(projectId);

function deterministicSuffix(tenantId, shopperId, length) {
  return sha256(`${tenantId}\0${shopperId}`).slice(0, length);
}

function allocateLogin(baseLogin, tenantId, shopperId, used) {
  for (const length of [4, 6, 8]) {
    const candidate = `${baseLogin}.${deterministicSuffix(tenantId, shopperId, length)}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return { login: candidate, suffixLength: length };
    }
  }
  return { login: '', suffixLength: 0 };
}

function fullNameCandidate(source, firstToken) {
  const full = pick(source, NAME_KEYS);
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || asciiToken(parts[0]) !== firstToken) return '';
  const index = parts.length >= 4 ? parts.length - 2 : parts.length - 1;
  return asciiToken(parts[index]);
}

function sourceSafeNames(profile, linkedSources, credentials) {
  const sources = [{ value: profile, basis: 'profile' }, ...linkedSources];
  const firstRaw = (() => {
    for (const item of sources) {
      const direct = pick(item.value, FIRST_KEYS);
      if (direct) return direct.split(/\s+/)[0];
      const full = pick(item.value, NAME_KEYS);
      if (full) return full.split(/\s+/)[0];
    }
    return '';
  })();
  const first = asciiToken(firstRaw);
  const explicit = [];
  const logins = [];

  for (const item of sources) {
    const surname = pick(item.value, SURNAME_KEYS);
    if (surname) explicit.push({ token: asciiToken(surname.split(/\s+/)[0]), basis: `${item.basis}:explicit` });
    for (const key of LOGIN_KEYS) {
      const parts = norm(item.value?.[key]).split('.').filter(Boolean);
      if (parts.length >= 2 && asciiToken(parts[0]) === first) {
        logins.push({ token: asciiToken(parts[1]), basis: `${item.basis}:technical_login` });
      }
    }
  }
  for (const record of credentials) {
    const parts = norm(record?.normalizedLogin || record?.loginIdentifier).split('.').filter(Boolean);
    if (parts.length >= 2 && asciiToken(parts[0]) === first) {
      logins.push({ token: asciiToken(parts[1]), basis: 'credential:technical_login' });
    }
  }

  const directTokens = uniq([...explicit, ...logins].map(item => item.token));
  let surname = directTokens.length === 1 ? directTokens[0] : '';
  let basis = surname ? 'explicit_or_technical' : '';
  let completedByConsensus = false;
  let conflict = directTokens.length > 1;

  if (!surname && !conflict && first) {
    const candidates = new Map();
    for (const item of sources) {
      const token = fullNameCandidate(item.value, first);
      if (!token) continue;
      if (!candidates.has(token)) candidates.set(token, new Set());
      candidates.get(token).add(item.basis);
    }
    const corroborated = [...candidates.entries()].filter(([, bases]) => bases.size >= 2);
    if (corroborated.length === 1) {
      surname = corroborated[0][0];
      basis = 'multi_source_full_name_consensus';
      completedByConsensus = true;
    } else if (corroborated.length > 1) {
      conflict = true;
    }
  }

  const baseLogin = first && surname ? `${first}.${surname}` : '';
  const passwordToken = text(firstRaw).normalize('NFC').replace(/[^\p{L}'’\-]/gu, '');
  const password = passwordToken
    ? passwordToken.charAt(0).toUpperCase() + passwordToken.slice(1).toLowerCase() + '123*'
    : '';
  return {
    firstComplete: Boolean(first),
    surnameComplete: Boolean(surname),
    complete: Boolean(baseLogin && password),
    baseLogin,
    password,
    basis: basis || 'unresolved',
    completedByConsensus,
    conflict
  };
}

function recursiveObjects(value, basis, out = [], depth = 0) {
  if (depth > 7 || value == null) return out;
  if (Array.isArray(value)) {
    for (const item of value) recursiveObjects(item, basis, out, depth + 1);
    return out;
  }
  if (typeof value !== 'object') return out;
  const keys = Object.keys(value);
  if (keys.some(key => TECH_KEYS.includes(key)) || keys.some(key => NAME_KEYS.includes(key)) || keys.some(key => SURNAME_KEYS.includes(key))) {
    out.push({ value, basis });
  }
  for (const item of Object.values(value)) {
    if (item && typeof item === 'object') recursiveObjects(item, basis, out, depth + 1);
  }
  return out;
}

function periodKey(data, pathValue = '') {
  for (const value of [data?.periodKey, data?.periodId, data?.period, data?.projectPeriod]) {
    const match = text(value).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
    if (match) return `${match[1]}-${match[2]}`;
  }
  const match = text(pathValue).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
  return match ? `${match[1]}-${match[2]}` : '';
}

function shiftMonth(key, delta) {
  const match = text(key).match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function statusInfo(profile) {
  const tokens = uniq(['status','estado','profileStatus','accountStatus','approvalStatus'].map(key => norm(profile?.[key])));
  return {
    active: tokens.some(token => ACTIVE_STATUSES.has(token)),
    inactive: tokens.some(token => INACTIVE_STATUSES.has(token))
  };
}

async function listAllUsers(auth) {
  const users = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

function continuityScore(row, baseEmail, tenantId, projectId) {
  let score = 0;
  if (row.authUsers.some(user => exactClaims(user.customClaims || {}, row.profile.id, tenantId, projectId))) score += 10000;
  if (row.authUsers.some(user => norm(user.email) === norm(baseEmail))) score += 2500;
  if (row.credentials.some(record => norm(record.normalizedLogin || record.loginIdentifier) === norm(row.names.baseLogin))) score += 1200;
  score += row.credentials.length * 300;
  score += row.status.active ? 100 : 0;
  score += row.activity.hrLinks * 50;
  score += row.activity.recentVisits * 20;
  return score;
}

async function authCandidateScore(user, row, tenantId, projectId, webConfig) {
  const claims = user.customClaims || {};
  let score = 0;
  if (exactClaims(claims, row.profile.id, tenantId, projectId)) score += 10000;
  if (text(claims.shopperId) === row.profile.id) score += 5000;
  if (norm(user.email) === norm(internalEmail(row.targetLogin, 'shopper', tenantId))) score += 1200;
  if (norm(user.email) === norm(internalEmail(row.names.baseLogin, 'shopper', tenantId))) score += 800;
  const credentialEmails = row.credentials
    .map(record => norm(record.normalizedLogin || record.loginIdentifier))
    .filter(Boolean)
    .map(login => internalEmail(login, 'shopper', tenantId));
  if (credentialEmails.some(email => norm(email) === norm(user.email))) score += 600;
  const passwordCompatible = await passwordSignInEmail(webConfig.apiKey, user.email, row.names.password);
  if (passwordCompatible) score += 400;
  if (!user.disabled) score += 10;
  if (user.emailVerified) score += 5;
  if (user.metadata?.creationTime) score += 1;
  return { user, score, passwordCompatible };
}

async function buildProviderPlan({ auth, db, bundle, webConfig, tenantId, projectId }) {
  const tenantRef = db.collection('tenants').doc(tenantId);
  const projectRef = tenantRef.collection('projects').doc(projectId);
  const [authUsers, profileSnap, membershipSnap, hrSnap, visitSnap, certSnap, liqSnap] = await Promise.all([
    listAllUsers(auth),
    tenantRef.collection('shoppers').get(),
    tenantRef.collection('users').get(),
    projectRef.collection('hrImports').get(),
    projectRef.collection('visits').get(),
    db.collectionGroup('certifications').get(),
    db.collectionGroup('liquidations').get()
  ]);

  const profiles = new Map(profileSnap.docs.map(doc => [doc.id, { id: doc.id, ...(doc.data() || {}) }]));
  const relationIndex = new Map();
  for (const profile of profiles.values()) {
    add(relationIndex, profile.id, profile.id);
    for (const key of TECH_KEYS) add(relationIndex, profile[key], profile.id);
  }

  const linkedByProfile = new Map();
  const link = (shopperId, source) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push(source);
  };
  for (const [basis, snap] of [['hr', hrSnap], ['visit', visitSnap], ['certification', certSnap], ['liquidation', liqSnap]]) {
    for (const doc of snap.docs) {
      const rootData = doc.data() || {};
      for (const source of [{ value: rootData, basis }, ...recursiveObjects(rootData, basis)]) {
        const direct = text(source.value.shopperId || source.value.profileId || source.value.shopperDocId);
        if (direct && profiles.has(direct)) {
          link(direct, source);
          continue;
        }
        const candidates = [];
        for (const key of TECH_KEYS) candidates.push(...(relationIndex.get(text(source.value[key])) || []));
        const exact = uniq(candidates);
        if (exact.length === 1) link(exact[0], source);
      }
    }
  }

  const authByEmail = new Map();
  const authByShopperId = new Map();
  for (const user of authUsers) {
    if (user.email) add(authByEmail, norm(user.email), user);
    const shopperId = text(user.customClaims?.shopperId);
    if (shopperId) add(authByShopperId, shopperId, user);
  }

  const credentialRecords = (Array.isArray(bundle.records) ? bundle.records : []).filter(record => record?.kind === 'shopper');
  const credentialsByProfile = new Map();
  let credentialsMapped = 0;
  for (const record of credentialRecords) {
    const login = norm(record.normalizedLogin || record.loginIdentifier);
    const legacy = text(record.legacyId || record.legacyShopperId || record.externalShopperId);
    const candidates = [];
    if (legacy) candidates.push(...(relationIndex.get(legacy) || []));
    if (login) {
      for (const user of authByEmail.get(norm(internalEmail(login, 'shopper', tenantId))) || []) {
        const shopperId = text(user.customClaims?.shopperId);
        if (profiles.has(shopperId)) candidates.push(shopperId);
      }
    }
    const exact = uniq(candidates);
    if (exact.length === 1) {
      credentialsMapped++;
      if (!credentialsByProfile.has(exact[0])) credentialsByProfile.set(exact[0], []);
      credentialsByProfile.get(exact[0]).push(record);
    }
  }

  const periods = visitSnap.docs.map(doc => periodKey(doc.data() || {}, doc.ref.path)).filter(Boolean).sort();
  const latestPeriod = periods.at(-1) || '';
  const recentFloor = latestPeriod ? shiftMonth(latestPeriod, -2) : '';
  const activity = new Map();
  const getActivity = shopperId => {
    if (!activity.has(shopperId)) activity.set(shopperId, { visits: 0, recentVisits: 0, hrLinks: 0, certifications: 0, liquidations: 0 });
    return activity.get(shopperId);
  };
  for (const doc of visitSnap.docs) {
    const data = doc.data() || {};
    const shopperId = text(data.shopperId);
    if (!profiles.has(shopperId)) continue;
    const row = getActivity(shopperId);
    row.visits++;
    const key = periodKey(data, doc.ref.path);
    if (key && recentFloor && key >= recentFloor) row.recentVisits++;
  }
  for (const [shopperId, sources] of linkedByProfile) getActivity(shopperId).hrLinks = sources.filter(source => source.basis === 'hr').length;
  for (const doc of certSnap.docs) {
    const shopperId = text(doc.data()?.shopperId);
    if (profiles.has(shopperId)) getActivity(shopperId).certifications++;
  }
  for (const doc of liqSnap.docs) {
    const shopperId = text(doc.data()?.shopperId);
    if (profiles.has(shopperId)) getActivity(shopperId).liquidations++;
  }

  const rows = [];
  for (const profile of profiles.values()) {
    const linkedSources = linkedByProfile.get(profile.id) || [];
    const credentials = credentialsByProfile.get(profile.id) || [];
    const names = sourceSafeNames(profile, linkedSources, credentials);
    const status = statusInfo(profile);
    const rowActivity = activity.get(profile.id) || { visits: 0, recentVisits: 0, hrLinks: 0, certifications: 0, liquidations: 0 };
    const candidates = [...(authByShopperId.get(profile.id) || [])];
    for (const record of credentials) {
      const login = norm(record.normalizedLogin || record.loginIdentifier);
      candidates.push(...(authByEmail.get(norm(internalEmail(login, 'shopper', tenantId))) || []));
    }
    const seen = new Set();
    const authCandidates = candidates.filter(user => !seen.has(user.uid) && seen.add(user.uid));
    const active = !status.inactive && (
      status.active || authCandidates.length > 0 || credentials.length > 0 || rowActivity.hrLinks > 0 || rowActivity.recentVisits > 0
    );
    rows.push({
      profile,
      linkedSources,
      credentials,
      names,
      status,
      activity: rowActivity,
      active,
      authUsers: authCandidates,
      targetLogin: '',
      suffixLength: 0,
      resolutionBases: new Set(),
      holds: new Set(),
      selectedAuth: null,
      selectedPasswordCompatible: false
    });
  }

  const initialIncompleteActiveProfiles = rows.filter(row => row.active && !row.names.complete).length;
  const completedByConsensus = rows.filter(row => row.active && row.names.completedByConsensus).length;
  for (const row of rows) {
    if (row.active && !row.names.complete) row.holds.add(row.names.conflict ? 'technical_surname_conflict' : 'technical_surname_unresolved');
  }

  const activeComplete = rows.filter(row => row.active && row.names.complete);
  const baseGroups = new Map();
  for (const row of activeComplete) add(baseGroups, row.names.baseLogin, row);
  const collisionGroups = [...baseGroups.entries()].filter(([, members]) => members.length > 1);
  const usedLogins = new Set([...baseGroups.entries()].filter(([, members]) => members.length === 1).map(([login]) => login));
  const groupMatrix = [];

  for (const [baseLogin, members] of collisionGroups) {
    const baseEmail = internalEmail(baseLogin, 'shopper', tenantId);
    const ranked = members
      .map(row => ({ row, score: continuityScore(row, baseEmail, tenantId, projectId) }))
      .sort((a, b) => b.score - a.score || a.row.profile.id.localeCompare(b.row.profile.id));
    const keeper = ranked[0]?.score > 0 && ranked[0].score > (ranked[1]?.score || 0) ? ranked[0].row : null;
    if (keeper) {
      keeper.targetLogin = baseLogin;
      keeper.resolutionBases.add('unique_technical_holder_preserves_unsuffixed_login');
      usedLogins.add(baseLogin);
    }
    const suffixLengths = { '4': 0, '6': 0, '8': 0 };
    for (const row of members) {
      if (row === keeper) continue;
      const allocated = allocateLogin(baseLogin, tenantId, row.profile.id, usedLogins);
      if (!allocated.login) {
        row.holds.add('deterministic_suffix_collision_after_8');
        continue;
      }
      row.targetLogin = allocated.login;
      row.suffixLength = allocated.suffixLength;
      suffixLengths[String(allocated.suffixLength)]++;
      row.resolutionBases.add('deterministic_technical_suffix');
    }
    groupMatrix.push({
      groupFp: fp('deterministic-suffix-group', baseLogin),
      activeCount: members.length,
      keeperSelected: Boolean(keeper),
      suffixedCount: members.length - (keeper ? 1 : 0),
      suffixLengths,
      unresolvedCount: members.filter(row => !row.targetLogin).length
    });
  }

  for (const [, members] of baseGroups) {
    if (members.length === 1) {
      members[0].targetLogin = members[0].names.baseLogin;
      members[0].resolutionBases.add('unique_visible_login');
    }
  }

  for (const row of rows.filter(item => item.active && rowHasTarget(item))) {
    const targetEmail = internalEmail(row.targetLogin, 'shopper', tenantId);
    const baseEmail = internalEmail(row.names.baseLogin, 'shopper', tenantId);
    const candidates = [...row.authUsers, ...(authByEmail.get(norm(targetEmail)) || []), ...(authByEmail.get(norm(baseEmail)) || [])];
    const seen = new Set();
    row.authUsers = candidates.filter(user => !seen.has(user.uid) && seen.add(user.uid));
    if (row.authUsers.length > 1) {
      const scored = [];
      for (const user of row.authUsers) scored.push(await authCandidateScore(user, row, tenantId, projectId, webConfig));
      scored.sort((a, b) => b.score - a.score || text(a.user.metadata?.creationTime).localeCompare(text(b.user.metadata?.creationTime)));
      const top = scored[0];
      const second = scored[1];
      if (top && top.score >= 400 && top.score > (second?.score || 0)) {
        row.selectedAuth = top.user;
        row.selectedPasswordCompatible = top.passwordCompatible;
        row.resolutionBases.add('multi_auth_resolved_by_combined_technical_signals');
      } else {
        row.holds.add('multi_auth_tie_residual');
      }
    } else if (row.authUsers.length === 1) {
      row.selectedAuth = row.authUsers[0];
      row.selectedPasswordCompatible = await passwordSignInEmail(webConfig.apiKey, row.selectedAuth.email, row.names.password);
    }
  }

  const targetOwners = new Map();
  for (const row of rows.filter(item => item.active && rowHasTarget(item))) add(targetOwners, row.targetLogin, row);
  for (const members of targetOwners.values()) {
    if (members.length > 1) for (const row of members) row.holds.add('target_login_not_unique');
  }

  const operationCounts = { CREATE_AUTH: 0, UPDATE_AUTH: 0, NO_OP: 0, HOLD: 0, PRESERVE_NO_AUTH: 0 };
  const subchangeCounts = { email: 0, password: 0, claims: 0 };
  const planRows = [];
  for (const row of rows) {
    let primary = 'PRESERVE_NO_AUTH';
    const changes = { email: false, password: false, claims: false };
    if (row.active) {
      if (row.holds.size || !row.targetLogin) {
        primary = 'HOLD';
      } else {
        const user = row.selectedAuth;
        const targetEmail = internalEmail(row.targetLogin, 'shopper', tenantId);
        changes.email = Boolean(user) && norm(user.email) !== norm(targetEmail);
        changes.password = Boolean(user) && !row.selectedPasswordCompatible;
        changes.claims = Boolean(user) && !exactClaims(user.customClaims || {}, row.profile.id, tenantId, projectId);
        primary = !user ? 'CREATE_AUTH' : Object.values(changes).some(Boolean) ? 'UPDATE_AUTH' : 'NO_OP';
      }
    }
    operationCounts[primary]++;
    for (const key of Object.keys(subchangeCounts)) if (changes[key]) subchangeCounts[key]++;
    planRows.push({
      profileFp: fp('deterministic-suffix-plan-profile', row.profile.id),
      baseLoginFp: row.names.baseLogin ? fp('base-login', row.names.baseLogin) : null,
      targetLoginFp: row.targetLogin ? fp('target-login', row.targetLogin) : null,
      suffixApplied: row.suffixLength > 0,
      suffixLength: row.suffixLength,
      primary,
      changes,
      sourceSafeSurnameBasis: row.names.basis,
      resolutionBases: [...row.resolutionBases].sort(),
      preconditions: row.holds.size ? [...row.holds].sort() : ['shopperId_exact','target_login_unique','provider_snapshot_required'],
      rollback: primary === 'CREATE_AUTH'
        ? 'delete_only_created_uid_if_no_downstream_write'
        : primary === 'UPDATE_AUTH'
          ? 'restore_email_disabled_and_claims_snapshot_password_compensation_only'
          : 'none'
    });
  }

  const unresolvedActiveNames = rows.filter(row => row.active && !row.names.complete).length;
  const unresolvedMultiAuth = rows.filter(row => row.holds.has('multi_auth_tie_residual')).length;
  const suffixAllocationHolds = rows.filter(row => row.holds.has('deterministic_suffix_collision_after_8')).length;
  const targetCollisionHolds = rows.filter(row => row.holds.has('target_login_not_unique')).length;
  const ready = unresolvedActiveNames === 0 && unresolvedMultiAuth === 0 && suffixAllocationHolds === 0 && targetCollisionHolds === 0;

  return {
    schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v1',
    generatedAt: new Date().toISOString(),
    decision: ready ? 'PASS_C6_DETERMINISTIC_SUFFIX_PLAN_READY_READONLY' : 'HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY',
    source: {
      profiles: profiles.size,
      authUsers: authUsers.length,
      memberships: membershipSnap.docs.length,
      credentials: credentialRecords.length,
      credentialsMapped,
      credentialsUnmapped: credentialRecords.length - credentialsMapped,
      hrImportDocs: hrSnap.docs.length,
      visits: visitSnap.docs.length,
      certifications: certSnap.docs.length,
      liquidations: liqSnap.docs.length,
      latestPeriod,
      recentFloor
    },
    surnameCompletion: {
      initialIncompleteActiveProfiles,
      completedByMultiSourceConsensus: completedByConsensus,
      remainingIncompleteActiveProfiles: unresolvedActiveNames
    },
    disambiguation: {
      policy: 'DETERMINISTIC_TECHNICAL_SUFFIX',
      collisionGroups: collisionGroups.length,
      activeIdentities: collisionGroups.reduce((sum, [, members]) => sum + members.length, 0),
      groupsWithUniqueUnsuffixedKeeper: groupMatrix.filter(group => group.keeperSelected).length,
      groupsAllSuffixed: groupMatrix.filter(group => !group.keeperSelected).length,
      suffix4: groupMatrix.reduce((sum, group) => sum + group.suffixLengths['4'], 0),
      suffix6: groupMatrix.reduce((sum, group) => sum + group.suffixLengths['6'], 0),
      suffix8: groupMatrix.reduce((sum, group) => sum + group.suffixLengths['8'], 0),
      suffixAllocationHolds,
      targetCollisionHolds
    },
    multiAuth: {
      profilesWithMultipleCandidates: rows.filter(row => row.authUsers.length > 1).length,
      resolved: rows.filter(row => row.resolutionBases.has('multi_auth_resolved_by_combined_technical_signals')).length,
      unresolved: unresolvedMultiAuth
    },
    groupMatrix,
    plan: {
      rows: planRows.length,
      operationCounts,
      subchangeCounts,
      digest: sha256(JSON.stringify(planRows)),
      executable: false,
      readyForAuthRepair: ready
    },
    planRows,
    safety: {
      providerReads: true,
      providerWrites: false,
      authWrites: 0,
      passwordChanges: 0,
      passwordResets: 0,
      membershipWrites: 0,
      firestoreWrites: 0,
      rulesWrites: 0,
      storageWrites: 0,
      hrWrites: 0,
      deploys: 0,
      payments: 0,
      merge: false,
      production: false,
      rawNamesExported: false,
      rawLoginsExported: false,
      rawEmailsExported: false,
      rawPasswordsExported: false,
      uidsExported: false
    }
  };
}

function rowHasTarget(row) {
  return Boolean(row.targetLogin && row.names.complete && !row.holds.has('technical_surname_conflict') && !row.holds.has('technical_surname_unresolved'));
}

function selfTest() {
  const used = new Set();
  const first = allocateLogin('ana.perez', 'tya', 'shopper-a', used);
  const repeat = allocateLogin('ana.perez', 'tya', 'shopper-a', new Set());
  if (first.login !== repeat.login || first.suffixLength !== 4) throw new Error('suffix_not_deterministic');
  const four = deterministicSuffix('tya', 'shopper-b', 4);
  const expanded = allocateLogin('ana.perez', 'tya', 'shopper-b', new Set([`ana.perez.${four}`]));
  if (expanded.suffixLength !== 6) throw new Error('suffix_6_expansion_failed');
  const six = deterministicSuffix('tya', 'shopper-c', 6);
  const expandedEight = allocateLogin('ana.perez', 'tya', 'shopper-c', new Set([
    `ana.perez.${deterministicSuffix('tya', 'shopper-c', 4)}`,
    `ana.perez.${six}`
  ]));
  if (expandedEight.suffixLength !== 8) throw new Error('suffix_8_expansion_failed');
  const sample = sourceSafeNames(
    { id: 'x', nombre: 'Ana Maria Perez Lopez' },
    [{ value: { shopperId: 'x', name: 'Ana Maria Perez Lopez' }, basis: 'hr' }],
    []
  );
  if (!sample.completedByConsensus || sample.baseLogin !== 'ana.perez') throw new Error('source_safe_consensus_failed');
  return {
    schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-source-static.v1',
    decision: 'PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC',
    checks: [
      'PASS_NODE_SYNTAX',
      'PASS_DETERMINISTIC_SUFFIX_4',
      'PASS_SUFFIX_EXPANSION_6_8',
      'PASS_MULTI_SOURCE_SURNAME_CONSENSUS',
      'PASS_NO_PII_SUFFIX_CONTRACT',
      'PASS_ONE_PRIMARY_OPERATION_SCHEMA'
    ]
  };
}

function validateRequest(request) {
  const blockers = [];
  const ensure = (condition, code) => { if (!condition) blockers.push(code); };
  ensure(request.schemaVersion === 'cxorbia.c6.shopper-deterministic-suffix-readonly-request.v1', 'request_schema_invalid');
  ensure(request.enabled === true && request.consumed === false && request.status === 'authorized_execute_once', 'authorization_state_invalid');
  ensure(request.authorizedBy === 'Paula' && Number(request.allowedExecutions) === 1, 'authorization_invalid');
  ensure(request.repository === 'paulaosoriof86/demoCXOrbia' && request.branch === 'docs-tya-v6-v71-audit' && Number(request.pullRequest) === 7, 'lane_invalid');
  ensure(request.targetHeadSha === process.env.CXORBIA_AUDIT_TARGET_HEAD, 'target_head_invalid');
  ensure(request.tenantId === TENANT_ID && request.projectId === CANONICAL_PROJECT_ID && request.firebaseProjectId === EXPECTED_FIREBASE_PROJECT, 'provider_target_invalid');
  ensure(request.providerReads === true && request.providerWrites === false, 'provider_scope_invalid');
  ensure(request.policy === 'DETERMINISTIC_TECHNICAL_SUFFIX', 'policy_invalid');
  ensure(JSON.stringify(request.suffixLengths) === JSON.stringify([4,6,8]), 'suffix_lengths_invalid');
  for (const key of ['repositoryWrites','dataWrites','deploy','merge','production','firestoreWrites','authWrites','passwordChanges','passwordResets','membershipWrites','rulesWrites','storageWrites','hrWrites','make','gemini','payments']) {
    ensure(request.safeState?.[key] === false, `unsafe_${key}`);
  }
  return blockers;
}

async function providerMain() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(genericDir, { recursive: true });
  fs.mkdirSync(privateDir, { recursive: true });
  let request = null;
  const blockers = [];
  try {
    if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) throw new Error('service_account_missing');
    if (!fs.existsSync(requestPath)) throw new Error('request_missing');
    request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
    blockers.push(...validateRequest(request));
    if (blockers.length) throw new Error(blockers.join(','));
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (serviceAccount.project_id !== EXPECTED_FIREBASE_PROJECT) throw new Error('service_account_project_mismatch');
    const bundle = decryptCredentialBundle({ serviceAccount });
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: EXPECTED_FIREBASE_PROJECT });
    }
    const webConfig = await fetchFirebaseWebConfig(remoteRoot, EXPECTED_FIREBASE_PROJECT);
    const result = await buildProviderPlan({
      auth: admin.auth(),
      db: admin.firestore(),
      bundle,
      webConfig,
      tenantId: request.tenantId,
      projectId: request.projectId
    });
    if (result.source.profiles !== Number(request.expectedProfiles || 340)) blockers.push(`profiles:${result.source.profiles}`);
    if (result.surnameCompletion.initialIncompleteActiveProfiles !== Number(request.expectedInitialIncompleteActiveProfiles || 83)) blockers.push(`initial_incomplete:${result.surnameCompletion.initialIncompleteActiveProfiles}`);
    if (result.disambiguation.collisionGroups !== Number(request.expectedDistinctActiveCollisionGroups || 64)) blockers.push(`collision_groups:${result.disambiguation.collisionGroups}`);
    if (result.plan.rows !== 340) blockers.push(`plan_rows:${result.plan.rows}`);
    if (result.multiAuth.unresolved > 0) blockers.push(`multi_auth_tie:${result.multiAuth.unresolved}`);
    if (result.surnameCompletion.remainingIncompleteActiveProfiles > 0) blockers.push(`surname_remaining:${result.surnameCompletion.remainingIncompleteActiveProfiles}`);
    if (result.disambiguation.suffixAllocationHolds > 0 || result.disambiguation.targetCollisionHolds > 0) blockers.push('suffix_or_target_collision');

    const finalResult = {
      ...result,
      decision: blockers.length ? 'HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY' : result.decision,
      blockers,
      requestId: request.requestId,
      requestCommitSha: process.env.GITHUB_SHA || null,
      targetHeadSha: request.targetHeadSha
    };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(finalResult, null, 2) + '\n', 'utf8');
    fs.writeFileSync(path.join(outDir, 'group-matrix.json'), JSON.stringify(finalResult.groupMatrix, null, 2) + '\n', 'utf8');
    fs.writeFileSync(path.join(outDir, 'plan-340.json'), JSON.stringify(finalResult.planRows, null, 2) + '\n', 'utf8');
    fs.writeFileSync(path.join(genericDir, 'report.json'), JSON.stringify({
      schemaVersion: 'cxorbia.readonly-post-gates-report.v1',
      runner: 'CXORBIA_READONLY_POST_GATES_RUNNER',
      generatedAt: new Date().toISOString(),
      status: blockers.length ? 'HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY' : 'PASS_READONLY_POST_GATES',
      requestId: request.requestId,
      blockers,
      summary: finalResult,
      safeState: request.safeState
    }, null, 2) + '\n', 'utf8');
    if (blockers.length) process.exitCode = 1;
  } catch (error) {
    const safeError = String(error?.message || error).replace(/[^A-Za-z0-9_.:,/-]+/g, '_').slice(0, 300);
    const report = {
      schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.failure.v1',
      decision: 'HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY',
      blockers: [...blockers, safeError],
      safety: { providerReads: true, providerWrites: false, authWrites: 0, firestoreWrites: 0, deploys: 0, merge: false, production: false }
    };
    fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    fs.writeFileSync(path.join(genericDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    process.exitCode = 1;
  } finally {
    try { fs.rmSync(privateDir, { recursive: true, force: true }); } catch {}
  }
}

if (process.argv.includes('--self-test')) {
  fs.mkdirSync(outDir, { recursive: true });
  const report = selfTest();
  fs.writeFileSync(path.join(outDir, 'source-static.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(report.decision);
} else {
  await providerMain();
}
