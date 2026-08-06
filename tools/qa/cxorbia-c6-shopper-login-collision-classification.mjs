import {
  TENANT_ID, CANONICAL_PROJECT_ID, text, norm, sha256, fingerprint, asciiToken,
  internalEmail, passwordSignInEmail
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

const TECH_KEYS = [
  'shopperId','legacyShopperId','legacyId','externalShopperId','externalId',
  'sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId','uid'
];
const NAME_KEYS = ['nombre','name','displayName','fullName','legacyName','personName','shopperName'];
const FIRST_KEYS = ['firstName','primerNombre','nombre1','givenName'];
const SURNAME_KEYS = ['lastName','apellido','apellidos','surname','familyName','primerApellido'];
const LOGIN_KEYS = ['username','userName','usuario','login','loginIdentifier','normalizedLogin'];
const ACTIVE_STATUSES = new Set(['active','activo','enabled','habilitado','approved','aprobado','complete','completo','completed','verified','verificado','perfil_completo','vigente']);
const INACTIVE_STATUSES = new Set(['inactive','inactivo','disabled','deshabilitado','deleted','eliminado','archived','archivado','rejected','rechazado','blocked','bloqueado','suspended','suspendido','cancelled','canceled','cancelado']);

const uniq = values => [...new Set(values.filter(Boolean))];
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
const fp = (kind, value) => fingerprint(`${kind}\0${value}`);
const exactClaims = (claims, shopperId, tenantId = TENANT_ID, projectId = CANONICAL_PROJECT_ID) =>
  claims?.tenantId === tenantId &&
  claims?.role === 'shopper' &&
  claims?.authNamespace === 'shopper' &&
  claims?.shopperId === shopperId &&
  Array.isArray(claims?.projectIds) &&
  claims.projectIds.includes(projectId);

function firstNameOf(sources) {
  for (const source of sources) {
    const direct = pick(source, FIRST_KEYS);
    if (direct) return direct.split(/\s+/)[0];
    const full = pick(source, NAME_KEYS);
    if (full) return full.split(/\s+/)[0];
  }
  return '';
}

function candidateSurnameFromFullName(source, firstName) {
  const full = pick(source, NAME_KEYS);
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || asciiToken(parts[0]) !== asciiToken(firstName)) return '';
  const index = parts.length >= 4 ? parts.length - 2 : parts.length - 1;
  return asciiToken(parts[index]);
}

function technicalSurnameCandidates(profile, linkedSources, credentialRecords, firstName) {
  const candidates = [];
  const addCandidate = (value, basis) => {
    const token = asciiToken(value);
    if (token) candidates.push({ token, basis });
  };

  for (const source of [profile, ...linkedSources]) {
    const explicit = pick(source, SURNAME_KEYS);
    if (explicit) addCandidate(explicit.split(/\s+/)[0], source === profile ? 'exact_profile_surname' : 'exact_linked_surname');

    for (const key of LOGIN_KEYS) {
      const login = norm(source?.[key]);
      const parts = login.split('.').filter(Boolean);
      if (parts.length === 2 && asciiToken(parts[0]) === asciiToken(firstName)) {
        addCandidate(parts[1], source === profile ? 'exact_profile_technical_login' : 'exact_linked_technical_login');
      }
    }
  }

  for (const record of credentialRecords) {
    const login = norm(record?.normalizedLogin || record?.loginIdentifier);
    const parts = login.split('.').filter(Boolean);
    if (parts.length === 2 && asciiToken(parts[0]) === asciiToken(firstName)) {
      addCandidate(parts[1], 'exact_credential_login');
    }
  }

  const byToken = new Map();
  for (const candidate of candidates) {
    if (!byToken.has(candidate.token)) byToken.set(candidate.token, new Set());
    byToken.get(candidate.token).add(candidate.basis);
  }
  return [...byToken.entries()].map(([token, bases]) => ({ token, bases: [...bases].sort() }));
}

function canonicalNames(profile, linkedSources, credentialRecords) {
  const sources = [profile, ...linkedSources, ...credentialRecords];
  const firstRaw = firstNameOf(sources);
  const first = asciiToken(firstRaw);
  const technical = technicalSurnameCandidates(profile, linkedSources, credentialRecords, firstRaw);

  const verifiedSurname = technical.length === 1 ? technical[0].token : '';
  const verifiedLogin = first && verifiedSurname ? `${first}.${verifiedSurname}` : '';

  let candidateSurname = verifiedSurname;
  let candidateBasis = technical.length === 1 ? technical[0].bases[0] : '';
  if (!candidateSurname) {
    for (const source of [profile, ...linkedSources]) {
      const inferred = candidateSurnameFromFullName(source, firstRaw);
      if (inferred) {
        candidateSurname = inferred;
        candidateBasis = source === profile ? 'candidate_profile_full_name_position' : 'candidate_linked_full_name_position';
        break;
      }
    }
  }

  const candidateLogin = first && candidateSurname ? `${first}.${candidateSurname}` : '';
  const passwordToken = text(firstRaw).normalize('NFC').replace(/[^\p{L}'’\-]/gu, '');
  const password = passwordToken
    ? passwordToken.charAt(0).toUpperCase() + passwordToken.slice(1).toLowerCase() + '123*'
    : '';

  return {
    firstComplete: Boolean(first),
    candidateLogin,
    candidateComplete: Boolean(candidateLogin && password),
    candidateBasis: candidateBasis || 'unresolved',
    verifiedLogin,
    verifiedComplete: Boolean(verifiedLogin && password),
    verifiedSurnameCount: technical.length,
    verifiedSurnameConflict: technical.length > 1,
    verifiedBases: technical.flatMap(item => item.bases),
    password
  };
}

function statusInfo(profile) {
  const tokens = uniq(['status','estado','profileStatus','accountStatus','approvalStatus'].map(key => norm(profile?.[key])));
  return {
    active: tokens.some(token => ACTIVE_STATUSES.has(token)),
    inactive: tokens.some(token => INACTIVE_STATUSES.has(token))
  };
}

function recursiveObjects(value, out = [], depth = 0) {
  if (depth > 7 || value == null) return out;
  if (Array.isArray(value)) {
    for (const item of value) recursiveObjects(item, out, depth + 1);
    return out;
  }
  if (typeof value !== 'object') return out;
  const keys = Object.keys(value);
  if (keys.some(key => TECH_KEYS.includes(key)) || keys.some(key => NAME_KEYS.includes(key)) || keys.some(key => SURNAME_KEYS.includes(key))) out.push(value);
  for (const item of Object.values(value)) if (item && typeof item === 'object') recursiveObjects(item, out, depth + 1);
  return out;
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

async function safeGet(ref) {
  try {
    return await ref.get();
  } catch {
    return { docs: [] };
  }
}

function periodKey(data, path = '') {
  for (const value of [data?.periodKey, data?.periodId, data?.period, data?.projectPeriod]) {
    const match = text(value).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
    if (match) return `${match[1]}-${match[2]}`;
  }
  const match = text(path).match(/(20\d{2})[-_/](0[1-9]|1[0-2])/);
  return match ? `${match[1]}-${match[2]}` : '';
}

function shiftMonth(key, delta) {
  const match = text(key).match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function authScore(user, row, tenantId, projectId) {
  const claims = user.customClaims || {};
  const targetEmail = row.names.verifiedLogin ? internalEmail(row.names.verifiedLogin, 'shopper', tenantId) : '';
  const credentialEmails = row.credentials
    .map(record => norm(record.normalizedLogin || record.loginIdentifier))
    .filter(Boolean)
    .map(login => internalEmail(login, 'shopper', tenantId));
  let score = 0;
  if (exactClaims(claims, row.profile.id, tenantId, projectId)) score += 10000;
  if (text(claims.shopperId) === row.profile.id) score += 5000;
  if (claims.tenantId === tenantId) score += 1000;
  if (claims.authNamespace === 'shopper') score += 1000;
  if (claims.role === 'shopper') score += 1000;
  if (Array.isArray(claims.projectIds) && claims.projectIds.includes(projectId)) score += 500;
  if (targetEmail && norm(user.email) === norm(targetEmail)) score += 400;
  if (credentialEmails.some(email => norm(user.email) === norm(email))) score += 300;
  if (!user.disabled) score += 10;
  return score;
}

function strongAnchorSet(profile, linkedSources, credentials, authUsers) {
  const values = new Set();
  const addValue = (kind, value) => {
    const normalized = text(value);
    if (normalized) values.add(`${kind}:${normalized}`);
  };

  for (const source of [profile, ...linkedSources]) {
    for (const key of TECH_KEYS) {
      const value = source?.[key];
      for (const item of Array.isArray(value) ? value : [value]) {
        if (key !== 'shopperId' && key !== 'profileId' && key !== 'shopperDocId') addValue(key, item);
      }
    }
  }
  for (const record of credentials) {
    addValue('credential', fp('credential-anchor', `${norm(record.normalizedLogin || record.loginIdentifier)}\0${text(record.legacyId || record.legacyShopperId || record.externalShopperId)}`));
  }
  for (const user of authUsers) addValue('auth', fp('auth-anchor', user.uid));
  return values;
}

function sharedStrongAnchors(left, right) {
  const out = [];
  for (const anchor of left.strongAnchors) if (right.strongAnchors.has(anchor)) out.push(anchor);
  return out;
}

function connectedComponents(rows) {
  const components = [];
  const unvisited = new Set(rows);
  while (unvisited.size) {
    const start = unvisited.values().next().value;
    unvisited.delete(start);
    const component = [start];
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      for (const candidate of [...unvisited]) {
        if (sharedStrongAnchors(current, candidate).length) {
          unvisited.delete(candidate);
          component.push(candidate);
          queue.push(candidate);
        }
      }
    }
    components.push(component);
  }
  return components;
}

function rowScore(row, tenantId, projectId) {
  const exact = row.authUsers.some(user => exactClaims(user.customClaims || {}, row.profile.id, tenantId, projectId)) ? 10000 : 0;
  return exact +
    row.credentials.length * 500 +
    row.activity.hrLinks * 300 +
    row.activity.recentVisits * 200 +
    row.activity.visits * 5 +
    row.activity.certifications * 3 +
    row.activity.liquidations * 3 +
    (row.status.active ? 100 : 0);
}

function classifyGroup(login, members, tenantId, projectId) {
  const activeMembers = members.filter(member => member.active);
  const historicalMembers = members.filter(member => !member.active);
  const matrix = {
    groupFp: fp('candidate-login-group', login),
    memberCount: members.length,
    activeCount: activeMembers.length,
    historicalCount: historicalMembers.length,
    verifiedNameCompleteCount: members.filter(member => member.names.verifiedComplete).length,
    verifiedLoginAgreement: false,
    sharedAnchorPairCount: 0,
    activeIdentityCount: 0,
    activeAliasCount: 0,
    historicalAliasCount: 0,
    historicalDistinctCount: 0,
    resolution: 'UNRESOLVED'
  };

  const verifiedLogins = uniq(members.map(member => member.names.verifiedLogin));
  matrix.verifiedLoginAgreement = verifiedLogins.length === 1 && Boolean(verifiedLogins[0]);

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      if (sharedStrongAnchors(members[i], members[j]).length) matrix.sharedAnchorPairCount++;
    }
  }

  if (!matrix.verifiedLoginAgreement) {
    matrix.resolution = members.some(member => member.names.verifiedSurnameConflict)
      ? 'HOLD_TECHNICAL_SURNAME_CONFLICT'
      : 'HOLD_UNVERIFIED_SURNAME_OR_CANDIDATE_GROUP_SPLIT';
    for (const member of members) member.holds.add('candidate_group_not_verified');
    return matrix;
  }

  if (activeMembers.length === 0) {
    matrix.resolution = 'RESOLVED_HISTORICAL_DISTINCT_NO_AUTH';
    matrix.historicalDistinctCount = historicalMembers.length;
    for (const member of members) member.resolutionBases.add('historical_distinct_preserve_no_auth');
    return matrix;
  }

  const activeComponents = connectedComponents(activeMembers);
  matrix.activeIdentityCount = activeComponents.length;
  for (const component of activeComponents) {
    const ranked = [...component].sort((a, b) => rowScore(b, tenantId, projectId) - rowScore(a, tenantId, projectId));
    const canonical = ranked[0];
    canonical.resolutionBases.add('active_component_canonical');
    for (const alias of ranked.slice(1)) {
      alias.resolutionBases.add('active_duplicate_alias_preserve_no_auth');
      alias.activeAlias = true;
      matrix.activeAliasCount++;
    }
  }

  const activeCanonicals = activeComponents.map(component => [...component].sort((a, b) => rowScore(b, tenantId, projectId) - rowScore(a, tenantId, projectId))[0]);
  for (const historical of historicalMembers) {
    const linkedToActive = activeMembers.some(active => sharedStrongAnchors(active, historical).length);
    if (linkedToActive) {
      historical.resolutionBases.add('historical_alias_of_active_preserve_no_auth');
      matrix.historicalAliasCount++;
    } else {
      historical.resolutionBases.add('historical_distinct_preserve_no_auth');
      matrix.historicalDistinctCount++;
    }
  }

  if (activeCanonicals.length === 1) {
    matrix.resolution = activeMembers.length === 1
      ? 'RESOLVED_SINGLE_ACTIVE_CANONICAL_WITH_HISTORICAL_PRESERVED'
      : 'RESOLVED_ACTIVE_DUPLICATE_CLUSTER_WITH_HISTORICAL_PRESERVED';
    return matrix;
  }

  matrix.resolution = 'HOLD_DISTINCT_ACTIVE_PEOPLE_SHARE_VISIBLE_LOGIN';
  for (const canonical of activeCanonicals) canonical.holds.add('distinct_active_visible_login_collision');
  return matrix;
}

export async function buildCollisionClassification({
  auth, db, bundle, webConfig, tenantId = TENANT_ID, projectId = CANONICAL_PROJECT_ID
}) {
  const tenantRef = db.collection('tenants').doc(tenantId);
  const projectRef = tenantRef.collection('projects').doc(projectId);
  const [authUsers, profilesSnap, membershipsSnap, hrSnap, visitsSnap, certSnap, liqSnap] = await Promise.all([
    listAllUsers(auth),
    safeGet(tenantRef.collection('shoppers')),
    safeGet(tenantRef.collection('users')),
    safeGet(projectRef.collection('hrImports')),
    safeGet(projectRef.collection('visits')),
    safeGet(db.collectionGroup('certifications')),
    safeGet(db.collectionGroup('liquidations'))
  ]);

  const profiles = new Map(profilesSnap.docs.map(doc => [doc.id, { id: doc.id, ...(doc.data() || {}) }]));
  const authByEmail = new Map();
  const authByShopperId = new Map();
  for (const user of authUsers) {
    if (user.email) add(authByEmail, norm(user.email), user);
    const shopperId = text(user.customClaims?.shopperId);
    if (shopperId) add(authByShopperId, shopperId, user);
  }

  const relationIndex = new Map();
  const linkedByProfile = new Map();
  const link = (shopperId, source, basis) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __basis: basis });
    for (const key of TECH_KEYS) {
      const value = source?.[key];
      for (const item of Array.isArray(value) ? value : [value]) add(relationIndex, text(item), shopperId);
    }
  };

  for (const profile of profiles.values()) {
    add(relationIndex, profile.id, profile.id);
    link(profile.id, profile, 'profile');
  }

  for (const [basis, snap] of [['hr', hrSnap], ['visit', visitsSnap], ['certification', certSnap], ['liquidation', liqSnap]]) {
    for (const doc of snap.docs) {
      const root = doc.data() || {};
      for (const source of [root, ...recursiveObjects(root)]) {
        const shopperId = text(source.shopperId || source.profileId || source.shopperDocId);
        if (shopperId) link(shopperId, source, basis);
      }
    }
  }

  const periods = visitsSnap.docs.map(doc => periodKey(doc.data() || {}, doc.ref.path)).filter(Boolean).sort();
  const latestPeriod = periods.at(-1) || '';
  const recentFloor = latestPeriod ? shiftMonth(latestPeriod, -2) : '';

  const activity = new Map();
  const getActivity = shopperId => {
    if (!activity.has(shopperId)) activity.set(shopperId, { visits: 0, recentVisits: 0, hrLinks: 0, certifications: 0, liquidations: 0 });
    return activity.get(shopperId);
  };
  for (const doc of visitsSnap.docs) {
    const data = doc.data() || {};
    const shopperId = text(data.shopperId);
    if (!profiles.has(shopperId)) continue;
    const row = getActivity(shopperId);
    row.visits++;
    const key = periodKey(data, doc.ref.path);
    if (key && recentFloor && key >= recentFloor) row.recentVisits++;
  }
  for (const [shopperId, sources] of linkedByProfile) getActivity(shopperId).hrLinks = sources.filter(source => source.__basis === 'hr').length;
  for (const doc of certSnap.docs) {
    const shopperId = text(doc.data()?.shopperId);
    if (profiles.has(shopperId)) getActivity(shopperId).certifications++;
  }
  for (const doc of liqSnap.docs) {
    const shopperId = text(doc.data()?.shopperId);
    if (profiles.has(shopperId)) getActivity(shopperId).liquidations++;
  }

  const credentialRecords = (Array.isArray(bundle.records) ? bundle.records : []).filter(record => record?.kind === 'shopper');
  const credentialsByProfile = new Map();
  const credentialRows = [];
  for (const record of credentialRecords) {
    const login = norm(record.normalizedLogin || record.loginIdentifier);
    const legacy = text(record.legacyId || record.legacyShopperId || record.externalShopperId);
    const candidates = [];
    if (login) {
      for (const user of authByEmail.get(norm(internalEmail(login, 'shopper', tenantId))) || []) {
        const shopperId = text(user.customClaims?.shopperId);
        if (profiles.has(shopperId)) candidates.push(shopperId);
      }
    }
    if (legacy) candidates.push(...(relationIndex.get(legacy) || []));
    const unique = uniq(candidates);
    const shopperId = unique.length === 1 ? unique[0] : null;
    const row = {
      fp: fp('credential', `${login}\0${legacy}`),
      record,
      login,
      shopperId,
      candidateCount: unique.length
    };
    credentialRows.push(row);
    if (shopperId) {
      if (!credentialsByProfile.has(shopperId)) credentialsByProfile.set(shopperId, []);
      credentialsByProfile.get(shopperId).push(record);
    }
  }

  const rows = [];
  const candidateGroups = new Map();
  for (const profile of profiles.values()) {
    const linkedSources = linkedByProfile.get(profile.id) || [];
    const credentials = credentialsByProfile.get(profile.id) || [];
    const names = canonicalNames(profile, linkedSources, credentials);
    const status = statusInfo(profile);
    const profileActivity = activity.get(profile.id) || { visits: 0, recentVisits: 0, hrLinks: 0, certifications: 0, liquidations: 0 };

    const candidateAuth = [...(authByShopperId.get(profile.id) || [])];
    for (const record of credentials) {
      const login = norm(record.normalizedLogin || record.loginIdentifier);
      candidateAuth.push(...(authByEmail.get(norm(internalEmail(login, 'shopper', tenantId))) || []));
    }
    const seen = new Set();
    const uniqueAuth = candidateAuth.filter(user => !seen.has(user.uid) && seen.add(user.uid));

    const active = !status.inactive && (
      status.active ||
      uniqueAuth.length > 0 ||
      credentials.length > 0 ||
      profileActivity.hrLinks > 0 ||
      profileActivity.recentVisits > 0
    );
    const historical = Boolean(
      profileActivity.visits ||
      profileActivity.certifications ||
      profileActivity.liquidations ||
      TECH_KEYS.some(key => text(profile[key]))
    );

    const row = {
      profile,
      credentials,
      authUsers: uniqueAuth,
      linkedSources,
      names,
      status,
      activity: profileActivity,
      active,
      historical,
      strongAnchors: null,
      holds: new Set(),
      resolutionBases: new Set(),
      activeAlias: false,
      selectedAuth: null
    };
    row.strongAnchors = strongAnchorSet(profile, linkedSources, credentials, uniqueAuth);
    if (active && !names.verifiedComplete) row.holds.add(names.verifiedSurnameConflict ? 'technical_surname_conflict' : 'verified_canonical_name_incomplete');
    if (names.candidateLogin) add(candidateGroups, names.candidateLogin, row);
    rows.push(row);
  }

  const groupMatrix = [];
  for (const [login, members] of candidateGroups) {
    if (members.length < 2) continue;
    groupMatrix.push(classifyGroup(login, members, tenantId, projectId));
  }

  const authMatrix = [];
  for (const row of rows.filter(item => item.authUsers.length > 1)) {
    const scored = row.authUsers
      .map(user => ({ user, score: authScore(user, row, tenantId, projectId) }))
      .sort((a, b) => b.score - a.score);
    const top = scored[0];
    const second = scored[1];
    const uniqueStrong = top && top.score >= 400 && (!second || top.score - second.score >= 100);
    if (uniqueStrong) {
      row.selectedAuth = top.user;
      row.resolutionBases.add('multiple_auth_resolved_by_unique_technical_score');
    } else {
      row.holds.add('multiple_auth_candidates_unresolved');
    }
    authMatrix.push({
      profileFp: fp('multi-auth-profile', row.profile.id),
      candidateCount: scored.length,
      topScore: top?.score || 0,
      scoreMargin: top && second ? top.score - second.score : top?.score || 0,
      resolution: uniqueStrong ? 'RESOLVED_UNIQUE_TECHNICAL_AUTH_CANDIDATE' : 'HOLD_MULTIPLE_AUTH_CANDIDATES'
    });
  }

  const candidateCollisionProfiles = groupMatrix.reduce((sum, group) => sum + group.memberCount, 0);
  const distinctActiveCollisionGroups = groupMatrix.filter(group => group.resolution === 'HOLD_DISTINCT_ACTIVE_PEOPLE_SHARE_VISIBLE_LOGIN');
  const unresolvedSurnameGroups = groupMatrix.filter(group => group.resolution === 'HOLD_UNVERIFIED_SURNAME_OR_CANDIDATE_GROUP_SPLIT' || group.resolution === 'HOLD_TECHNICAL_SURNAME_CONFLICT');
  const unresolvedActiveNames = rows.filter(row => row.active && !row.names.verifiedComplete);
  const unresolvedMultiAuth = authMatrix.filter(row => row.resolution.startsWith('HOLD'));

  const operationCounts = { CREATE_AUTH: 0, UPDATE_AUTH: 0, NO_OP: 0, HOLD: 0, PRESERVE_NO_AUTH: 0 };
  const subchangeCounts = { email: 0, password: 0, claims: 0 };
  const planRows = [];
  for (const row of rows) {
    let primary = 'PRESERVE_NO_AUTH';
    const changes = { email: false, password: false, claims: false };

    if (row.activeAlias) {
      primary = 'PRESERVE_NO_AUTH';
    } else if (row.holds.size) {
      primary = 'HOLD';
    } else if (row.active) {
      const user = row.selectedAuth || row.authUsers[0] || null;
      const targetEmail = internalEmail(row.names.verifiedLogin, 'shopper', tenantId);
      const passwordCompatible = user
        ? await passwordSignInEmail(webConfig.apiKey, user.email, row.names.password)
        : false;
      changes.email = Boolean(user) && norm(user.email) !== norm(targetEmail);
      changes.password = Boolean(user) && !passwordCompatible;
      changes.claims = Boolean(user) && !exactClaims(user.customClaims || {}, row.profile.id, tenantId, projectId);
      primary = !user ? 'CREATE_AUTH' : Object.values(changes).some(Boolean) ? 'UPDATE_AUTH' : 'NO_OP';
    }

    operationCounts[primary]++;
    for (const key of Object.keys(subchangeCounts)) if (changes[key]) subchangeCounts[key]++;
    planRows.push({
      profileFp: fp('classification-plan-profile', row.profile.id),
      primary,
      changes,
      verifiedCanonicalName: row.names.verifiedComplete,
      verifiedNameBasisCount: row.names.verifiedBases.length,
      resolutionBases: [...row.resolutionBases].sort(),
      preconditions: row.holds.size
        ? [...row.holds].sort()
        : ['shopperId_exact','verified_canonical_login','provider_snapshot_required'],
      rollback: primary === 'CREATE_AUTH'
        ? 'delete_only_created_uid_if_no_downstream_write'
        : primary === 'UPDATE_AUTH'
          ? 'restore_email_disabled_and_claims_snapshot_password_compensation_only'
          : 'none'
    });
  }

  const planDigest = sha256(JSON.stringify(planRows));
  const matrix = {
    groupCount: groupMatrix.length,
    groupProfiles: candidateCollisionProfiles,
    resolvedHistoricalOnlyGroups: groupMatrix.filter(group => group.resolution === 'RESOLVED_HISTORICAL_DISTINCT_NO_AUTH').length,
    resolvedSingleActiveGroups: groupMatrix.filter(group => group.resolution === 'RESOLVED_SINGLE_ACTIVE_CANONICAL_WITH_HISTORICAL_PRESERVED').length,
    resolvedActiveDuplicateGroups: groupMatrix.filter(group => group.resolution === 'RESOLVED_ACTIVE_DUPLICATE_CLUSTER_WITH_HISTORICAL_PRESERVED').length,
    distinctActiveCollisionGroups: distinctActiveCollisionGroups.length,
    distinctActiveProfiles: distinctActiveCollisionGroups.reduce((sum, group) => sum + group.activeIdentityCount, 0),
    unresolvedSurnameGroups: unresolvedSurnameGroups.length,
    multipleAuthProfiles: authMatrix.length,
    unresolvedMultipleAuthProfiles: unresolvedMultiAuth.length,
    verifiedNameIncompleteActiveProfiles: unresolvedActiveNames.length,
    verifiedNameIncompleteHistoricalProfiles: rows.filter(row => !row.active && !row.names.verifiedComplete).length
  };

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    projectId,
    latestPeriod,
    recentFloor,
    source: {
      profiles: profiles.size,
      authUsers: authUsers.length,
      memberships: membershipsSnap.docs.length,
      credentials: credentialRecords.length,
      credentialsMapped: credentialRows.filter(row => row.shopperId).length,
      credentialsUnmapped: credentialRows.filter(row => !row.shopperId).length,
      hrImportDocs: hrSnap.docs.length,
      visits: visitsSnap.docs.length,
      certifications: certSnap.docs.length,
      liquidations: liqSnap.docs.length
    },
    classification: matrix,
    groupSizeDistribution: groupMatrix.reduce((acc, group) => {
      acc[String(group.memberCount)] = (acc[String(group.memberCount)] || 0) + 1;
      return acc;
    }, {}),
    groupMatrix,
    authMatrix,
    planTotal: planRows.length,
    operationCounts,
    subchangeCounts,
    planDigest,
    planRows,
    disambiguation: {
      required: distinctActiveCollisionGroups.length > 0,
      affectedGroups: distinctActiveCollisionGroups.length,
      affectedActiveIdentities: matrix.distinctActiveProfiles,
      alternatives: distinctActiveCollisionGroups.length > 0
        ? ['VERIFIED_SECOND_SURNAME_SUFFIX','DETERMINISTIC_TECHNICAL_SUFFIX','TENANT_MANAGED_EXCEPTION_ALIAS']
        : []
    },
    readyForAuthRepair:
      distinctActiveCollisionGroups.length === 0 &&
      unresolvedSurnameGroups.length === 0 &&
      unresolvedActiveNames.length === 0 &&
      unresolvedMultiAuth.length === 0,
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
      merge: false,
      production: false,
      rawNamesExported: false,
      rawLoginsExported: false,
      rawPasswordsExported: false,
      uidsExported: false
    }
  };
}

export const sanitizeCollisionClassification = classification => classification;
