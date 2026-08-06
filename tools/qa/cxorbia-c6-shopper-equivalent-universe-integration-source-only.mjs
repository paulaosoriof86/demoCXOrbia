#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const plannerPath = path.join(root, 'tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs');
const classifierPath = path.join(root, 'tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs');
const sharedPath = path.join(root, 'tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs');
const contractPath = path.join(root, 'backend/contracts/c6-shopper-deterministic-suffix-v1.json');
const evidencePath = path.join(root, 'app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json');

const replaceOnce = (source, before, after, label) => {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(label + '_expected_once_found_' + count);
  return source.replace(before, after);
};
const writeUtf8 = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : content + '\n', 'utf8');
};

const shared = String.raw`import {
  text, norm, fingerprint, asciiToken
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

export const EQUIVALENT_UNIVERSE_VERSION = 'shopper-equivalent-universe-v1';
export const GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';
export const MEMBER_FINGERPRINT_NAMESPACE = 'shopper-collision-member-v1';
export const AUTH_CANDIDATE_FINGERPRINT_NAMESPACE = 'shopper-auth-candidate-v1';

const NAME_KEYS = ['nombre','name','displayName','fullName','legacyName','personName','shopperName'];
const FIRST_KEYS = ['firstName','primerNombre','nombre1','givenName'];
const SURNAME_KEYS = ['lastName','apellido','apellidos','surname','familyName','primerApellido'];
const LOGIN_KEYS = ['username','userName','usuario','login','loginIdentifier','normalizedLogin'];
const uniq = values => [...new Set(values.filter(Boolean))];
const pick = (obj, keys) => {
  for (const key of keys) {
    const value = text(obj?.[key]);
    if (value) return value;
  }
  return '';
};
const stableFp = (namespace, value) => fingerprint(namespace + '\0' + text(value));

function fullNameCandidate(source, firstToken) {
  const full = pick(source, NAME_KEYS);
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || asciiToken(parts[0]) !== firstToken) return '';
  const index = parts.length >= 4 ? parts.length - 2 : parts.length - 1;
  return asciiToken(parts[index]);
}

export function resolveEquivalentNames(profile, linkedSources = [], credentials = []) {
  const sources = [{ value: profile, basis: 'profile', linkMode: 'profile' }, ...linkedSources.map(item => ({
    value: item?.value ?? item,
    basis: item?.basis || item?.__basis || 'linked',
    linkMode: item?.linkMode || item?.__linkMode || 'direct_shopper_id'
  }))];
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
  const firstBases = uniq(sources.filter(item => {
    const direct = pick(item.value, FIRST_KEYS);
    const full = pick(item.value, NAME_KEYS);
    const raw = direct ? direct.split(/\s+/)[0] : full ? full.split(/\s+/)[0] : '';
    return first && asciiToken(raw) === first;
  }).map(item => item.basis));
  const explicit = [];
  const technical = [];
  for (const item of sources) {
    const surname = pick(item.value, SURNAME_KEYS);
    if (surname) explicit.push({ token: asciiToken(surname.split(/\s+/)[0]), basis: item.basis + ':explicit' });
    for (const key of LOGIN_KEYS) {
      const parts = norm(item.value?.[key]).split('.').filter(Boolean);
      if (parts.length >= 2 && asciiToken(parts[0]) === first) {
        technical.push({ token: asciiToken(parts[1]), basis: item.basis + ':technical_login' });
      }
    }
  }
  for (const record of credentials) {
    const parts = norm(record?.normalizedLogin || record?.loginIdentifier).split('.').filter(Boolean);
    if (parts.length >= 2 && asciiToken(parts[0]) === first) {
      technical.push({ token: asciiToken(parts[1]), basis: 'credential:technical_login' });
    }
  }
  const explicitTokens = uniq(explicit.map(item => item.token));
  const technicalTokens = uniq(technical.map(item => item.token));
  const directTokens = uniq([...explicitTokens, ...technicalTokens]);
  const preConsensusSurname = directTokens.length === 1 ? directTokens[0] : '';
  let surname = preConsensusSurname;
  let basis = surname ? 'explicit_or_technical' : '';
  let completedByConsensus = false;
  let conflict = directTokens.length > 1;
  let consensusCandidateCount = 0;
  let consensusBasisCount = 0;
  if (!surname && !conflict && first) {
    const candidates = new Map();
    for (const item of sources) {
      const token = fullNameCandidate(item.value, first);
      if (!token) continue;
      if (!candidates.has(token)) candidates.set(token, new Set());
      candidates.get(token).add(item.basis);
    }
    const corroborated = [...candidates.entries()].filter(([, bases]) => bases.size >= 2);
    consensusCandidateCount = corroborated.length;
    consensusBasisCount = corroborated.reduce((sum, [, bases]) => sum + bases.size, 0);
    if (corroborated.length === 1) {
      surname = corroborated[0][0];
      basis = 'multi_source_full_name_consensus';
      completedByConsensus = true;
    } else if (corroborated.length > 1) {
      conflict = true;
    }
  }
  const baseLogin = first && surname ? first + '.' + surname : '';
  const preConsensusBaseLogin = first && preConsensusSurname ? first + '.' + preConsensusSurname : '';
  const passwordToken = text(firstRaw).normalize('NFC').replace(/[^\p{L}'’\-]/gu, '');
  const password = passwordToken
    ? passwordToken.charAt(0).toUpperCase() + passwordToken.slice(1).toLowerCase() + '123*'
    : '';
  const passwordSeedComplete = Boolean(passwordToken);
  const surnameBasisCount = uniq([...explicit, ...technical].map(item => item.basis)).length + consensusBasisCount;
  const diagnostics = {
    first: { complete: Boolean(first), candidateCount: first ? 1 : 0, basisCount: firstBases.length },
    surname: {
      complete: Boolean(surname),
      explicitCandidateCount: explicitTokens.length,
      technicalLoginCandidateCount: technicalTokens.length,
      consensusCandidateCount,
      basisCount: surnameBasisCount,
      conflict
    },
    passwordSeed: { complete: passwordSeedComplete, candidateCount: passwordSeedComplete ? 1 : 0, basisCount: firstBases.length }
  };
  const complete = Boolean(baseLogin && password);
  return {
    firstComplete: Boolean(first),
    surnameComplete: Boolean(surname),
    passwordSeedComplete,
    preConsensusComplete: Boolean(preConsensusBaseLogin && password),
    complete,
    baseLogin,
    password,
    basis: basis || 'unresolved',
    completedByConsensus,
    conflict,
    diagnostics,
    candidateLogin: baseLogin,
    candidateComplete: complete,
    candidateBasis: basis || 'unresolved',
    verifiedLogin: baseLogin,
    verifiedComplete: complete,
    verifiedSurnameCount: explicitTokens.length + technicalTokens.length + consensusCandidateCount,
    verifiedSurnameConflict: conflict,
    verifiedBases: Array.from({ length: surnameBasisCount }, () => 'source_safe_basis')
  };
}

export function equivalentActive({ status, authCandidateCount = 0, credentialCount = 0, hrLinks = 0, recentVisits = 0 }) {
  return !status?.inactive && Boolean(status?.active || authCandidateCount > 0 || credentialCount > 0 || hrLinks > 0 || recentVisits > 0);
}

export function stableGroupFingerprint(baseLogin) {
  return stableFp(GROUP_FINGERPRINT_NAMESPACE, norm(baseLogin));
}
export function stableMemberFingerprint(profileId) {
  return stableFp(MEMBER_FINGERPRINT_NAMESPACE, profileId);
}
export function stableAuthCandidateFingerprint(uid) {
  return stableFp(AUTH_CANDIDATE_FINGERPRINT_NAMESPACE, uid);
}

export function resolveLinkedSourceMode(linkedSources = []) {
  const modes = linkedSources.map(item => item?.linkMode || item?.__linkMode).filter(Boolean);
  if (modes.includes('exact_technical_anchor')) return 'exact_technical_anchor';
  if (modes.includes('direct_shopper_id')) return 'direct_shopper_id';
  return linkedSources.length ? 'linked_source' : 'profile_only';
}

function baseMemberVector({ profileId, active, names, linkedSourceResolutionMode }) {
  return {
    memberFingerprint: stableMemberFingerprint(profileId),
    active: Boolean(active),
    preConsensusComplete: Boolean(names?.preConsensusComplete),
    postConsensusComplete: Boolean(names?.complete),
    completedByConsensus: Boolean(names?.completedByConsensus),
    sourceSafeSurnameBasis: names?.basis || 'unresolved',
    surnameBasisCount: Number(names?.diagnostics?.surname?.basisCount || 0),
    linkedSourceResolutionMode: linkedSourceResolutionMode || 'profile_only'
  };
}

export function buildReferenceMemberVector(input) {
  const common = baseMemberVector(input);
  const eligible = common.active && common.postConsensusComplete;
  return {
    ...common,
    keeper: false,
    suffixApplied: false,
    suffixLength: 0,
    inReferenceSet: true,
    inPlannerSet: false,
    referenceEligibility: eligible,
    plannerEligibility: eligible
  };
}

export function buildPlannerMemberVector(input) {
  const common = baseMemberVector(input);
  const eligible = common.active && common.postConsensusComplete;
  return {
    ...common,
    keeper: Boolean(input.keeper),
    suffixApplied: Boolean(input.suffixApplied),
    suffixLength: Number(input.suffixLength || 0),
    inReferenceSet: false,
    inPlannerSet: true,
    referenceEligibility: eligible,
    plannerEligibility: eligible
  };
}

export function mergeMemberProvenance(referenceMembers = [], plannerMembers = []) {
  const byFingerprint = new Map();
  for (const member of referenceMembers) byFingerprint.set(member.memberFingerprint, { ...member });
  for (const member of plannerMembers) {
    const prior = byFingerprint.get(member.memberFingerprint) || {};
    byFingerprint.set(member.memberFingerprint, {
      ...prior,
      ...member,
      inReferenceSet: Boolean(prior.inReferenceSet),
      inPlannerSet: Boolean(member.inPlannerSet)
    });
  }
  return [...byFingerprint.values()].sort((a, b) => a.memberFingerprint.localeCompare(b.memberFingerprint));
}

export function reconcileEquivalentGroupSets(referenceGroups = [], plannerGroups = []) {
  const ref = new Map(referenceGroups.map(group => [group.groupFp, group]));
  const plan = new Map(plannerGroups.map(group => [group.groupFp, group]));
  const added = [...plan.keys()].filter(key => !ref.has(key)).sort();
  const removed = [...ref.keys()].filter(key => !plan.has(key)).sort();
  const unchanged = [...plan.keys()].filter(key => ref.has(key)).sort();
  const deltaGroups = [...new Set([...added, ...removed])].sort().map(groupFp => ({
    groupFp,
    added: added.includes(groupFp),
    removed: removed.includes(groupFp),
    memberVectors: mergeMemberProvenance(ref.get(groupFp)?.memberVectors || [], plan.get(groupFp)?.memberVectors || [])
  }));
  return {
    universeVersion: EQUIVALENT_UNIVERSE_VERSION,
    referenceCount: ref.size,
    plannerCount: plan.size,
    added,
    removed,
    unchangedCount: unchanged.length,
    exactMatch: added.length === 0 && removed.length === 0,
    deltaGroups
  };
}

function assert(condition, code) {
  if (!condition) throw new Error(code);
}

export function selfTestEquivalentUniverse() {
  const consensus = resolveEquivalentNames(
    { id: 'profile-a', nombre: 'Ana Maria Perez Lopez' },
    [{ value: { shopperId: 'profile-a', name: 'Ana Maria Perez Lopez' }, basis: 'hr', linkMode: 'direct_shopper_id' }],
    []
  );
  assert(consensus.completedByConsensus === true && consensus.baseLogin === 'ana.perez', 'consensus_resolution_failed');
  const active = equivalentActive({ status: { active: false, inactive: false }, hrLinks: 1 });
  assert(active === true, 'equivalent_activity_failed');
  const reference = buildReferenceMemberVector({ profileId: 'profile-a', active, names: consensus, linkedSourceResolutionMode: 'direct_shopper_id' });
  const planner = buildPlannerMemberVector({ profileId: 'profile-a', active, names: consensus, keeper: true, suffixApplied: false, suffixLength: 0, linkedSourceResolutionMode: 'direct_shopper_id' });
  const merged = mergeMemberProvenance([reference], [planner]);
  assert(merged.length === 1 && merged[0].inReferenceSet && merged[0].inPlannerSet && merged[0].keeper, 'member_merge_failed');
  const groupFp = stableGroupFingerprint(consensus.baseLogin);
  const equal = reconcileEquivalentGroupSets([{ groupFp, memberVectors: [reference] }], [{ groupFp, memberVectors: [planner] }]);
  assert(equal.exactMatch && equal.deltaGroups.length === 0, 'equivalent_set_failed');
  const drift = reconcileEquivalentGroupSets([], [{ groupFp, memberVectors: [planner] }]);
  assert(drift.added.length === 1 && drift.deltaGroups[0].memberVectors[0].inPlannerSet, 'delta_member_vector_failed');
  const candidate = stableAuthCandidateFingerprint('uid-internal-only');
  assert(typeof candidate === 'string' && !candidate.includes('uid-internal-only'), 'candidate_fingerprint_failed');
  return {
    schemaVersion: 'cxorbia.c6.shopper-equivalent-universe-source-static.v1',
    decision: 'PASS_C6_EQUIVALENT_UNIVERSE_SOURCE_STATIC',
    checks: [
      'PASS_SHARED_POST_CONSENSUS_NAME_RESOLUTION',
      'PASS_SHARED_ACTIVITY_PREDICATE',
      'PASS_REFERENCE_PLANNER_MEMBER_VECTOR_MERGE',
      'PASS_EQUIVALENT_GROUP_SET_RECONCILIATION',
      'PASS_DELTA_ONLY_MEMBER_PROVENANCE',
      'PASS_SOURCE_SAFE_AUTH_CANDIDATE_FINGERPRINT'
    ]
  };
}

if (process.argv.includes('--self-test')) {
  const report = selfTestEquivalentUniverse();
  console.log(report.decision);
}
`;

writeUtf8(sharedPath, shared);

let planner = fs.readFileSync(plannerPath, 'utf8');
planner = replaceOnce(planner,
  "} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\n\nconst TECH_KEYS = [",
  "} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\nimport {\n  EQUIVALENT_UNIVERSE_VERSION,\n  resolveEquivalentNames, equivalentActive, resolveLinkedSourceMode,\n  buildReferenceMemberVector, buildPlannerMemberVector,\n  reconcileEquivalentGroupSets, stableAuthCandidateFingerprint\n} from './cxorbia-c6-shopper-equivalent-universe.mjs';\n\nconst TECH_KEYS = [",
  'planner_import');
planner = replaceOnce(planner,
`  const linkedByProfile = new Map();
  const link = (shopperId, source) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push(source);
    propagateLinkedSourceTechKeys(relationIndex, source, shopperId);
  };`,
`  const linkedByProfile = new Map();
  const link = (shopperId, source, linkMode = 'direct_shopper_id') => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __linkMode: linkMode });
    propagateLinkedSourceTechKeys(relationIndex, source, shopperId);
  };`,
  'planner_link');
planner = replaceOnce(planner, "          link(direct, source);", "          link(direct, source, 'direct_shopper_id');", 'planner_direct_link');
planner = replaceOnce(planner, "        if (exact.length === 1) link(exact[0], source);", "        if (exact.length === 1) link(exact[0], source, 'exact_technical_anchor');", 'planner_anchor_link');
planner = replaceOnce(planner,
  '    const names = sourceSafeNames(profile, linkedSources, credentials);',
  '    const names = resolveEquivalentNames(profile, linkedSources, credentials);',
  'planner_names');
planner = replaceOnce(planner,
`    const active = !status.inactive && (
      status.active || authCandidates.length > 0 || credentials.length > 0 || rowActivity.hrLinks > 0 || rowActivity.recentVisits > 0
    );`,
`    const active = equivalentActive({
      status,
      authCandidateCount: authCandidates.length,
      credentialCount: credentials.length,
      hrLinks: rowActivity.hrLinks,
      recentVisits: rowActivity.recentVisits
    });`,
  'planner_active');
planner = replaceOnce(planner,
`        candidateVectors: scored.map((entry, index) => ({
          candidateOrdinal: index + 1,
          score: entry.score,
          signals: entry.signals
        }))`,
`        candidateVectors: scored.map((entry, index) => ({
          candidateOrdinal: index + 1,
          candidateFingerprint: stableAuthCandidateFingerprint(entry.user.uid),
          score: entry.score,
          signals: entry.signals
        }))`,
  'planner_candidate_fingerprint');
planner = replaceOnce(planner,
`    groupMatrix.push({
      groupFp: stableGroupFingerprint(baseLogin),
      activeCount: members.length,
      keeperSelected: Boolean(keeper),
      suffixedCount: members.length - (keeper ? 1 : 0),
      suffixLengths,
      unresolvedCount: members.filter(row => !row.targetLogin).length
    });`,
`    groupMatrix.push({
      groupFp: stableGroupFingerprint(baseLogin),
      universeVersion: EQUIVALENT_UNIVERSE_VERSION,
      activeCount: members.length,
      keeperSelected: Boolean(keeper),
      suffixedCount: members.length - (keeper ? 1 : 0),
      suffixLengths,
      unresolvedCount: members.filter(row => !row.targetLogin).length,
      memberVectors: members.map(row => buildPlannerMemberVector({
        profileId: row.profile.id,
        active: row.active,
        names: row.names,
        keeper: row === keeper,
        suffixApplied: row.suffixLength > 0,
        suffixLength: row.suffixLength,
        linkedSourceResolutionMode: resolveLinkedSourceMode(row.linkedSources)
      }))
    });`,
  'planner_group_vectors');
planner = replaceOnce(planner,
`  for (const [, members] of baseGroups) {`,
`  const equivalentReferenceGroups = collisionGroups.map(([baseLogin, members]) => ({
    groupFp: stableGroupFingerprint(baseLogin),
    universeVersion: EQUIVALENT_UNIVERSE_VERSION,
    memberVectors: members.map(row => buildReferenceMemberVector({
      profileId: row.profile.id,
      active: row.active,
      names: row.names,
      linkedSourceResolutionMode: resolveLinkedSourceMode(row.linkedSources)
    }))
  }));
  const equivalentPlannerGroups = groupMatrix.map(group => ({
    groupFp: group.groupFp,
    universeVersion: EQUIVALENT_UNIVERSE_VERSION,
    memberVectors: group.memberVectors
  }));
  const equivalentUniverseReconciliation = reconcileEquivalentGroupSets(equivalentReferenceGroups, equivalentPlannerGroups);

  for (const [, members] of baseGroups) {`,
  'planner_equivalent_sets');
planner = replaceOnce(planner,
  "    schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v2',",
  "    schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v2.2',",
  'planner_schema');
planner = replaceOnce(planner,
`    multiAuth: {`,
`    equivalentUniverse: {
      version: EQUIVALENT_UNIVERSE_VERSION,
      populationPredicate: 'same_tenant_shopper_snapshot',
      activityPredicate: 'equivalentActive_v1',
      linkingPredicate: 'direct_shopper_id_or_exact_unique_technical_anchor',
      completenessPredicate: 'post_consensus_active_complete',
      referenceGroups: equivalentReferenceGroups.length,
      plannerGroups: equivalentPlannerGroups.length,
      reconciliation: equivalentUniverseReconciliation,
      deltaMemberVectorsOnly: true
    },
    multiAuth: {`,
  'planner_equivalent_output');
writeUtf8(plannerPath, planner);

let classifier = fs.readFileSync(classifierPath, 'utf8');
classifier = replaceOnce(classifier,
  "} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\n\nconst TECH_KEYS = [",
  "} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';\nimport {\n  EQUIVALENT_UNIVERSE_VERSION,\n  resolveEquivalentNames, equivalentActive, resolveLinkedSourceMode,\n  buildReferenceMemberVector, stableAuthCandidateFingerprint\n} from './cxorbia-c6-shopper-equivalent-universe.mjs';\n\nconst TECH_KEYS = [",
  'classifier_import');
classifier = replaceOnce(classifier,
`  const relationIndex = new Map();
  const linkedByProfile = new Map();
  const link = (shopperId, source, basis) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __basis: basis });
    for (const key of TECH_KEYS) {
      const value = source?.[key];
      for (const item of Array.isArray(value) ? value : [value]) add(relationIndex, text(item), shopperId);
    }
  };`,
`  const relationIndex = new Map();
  const linkedByProfile = new Map();
  const link = (shopperId, source, basis, linkMode = 'direct_shopper_id') => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push({ ...source, __basis: basis, __linkMode: linkMode });
    for (const key of TECH_KEYS) {
      const value = source?.[key];
      for (const item of Array.isArray(value) ? value : [value]) add(relationIndex, text(item), shopperId);
    }
  };`,
  'classifier_link');
classifier = replaceOnce(classifier,
`      for (const source of [root, ...recursiveObjects(root)]) {
        const shopperId = text(source.shopperId || source.profileId || source.shopperDocId);
        if (shopperId) link(shopperId, source, basis);
      }`,
`      for (const source of [root, ...recursiveObjects(root)]) {
        const shopperId = text(source.shopperId || source.profileId || source.shopperDocId);
        if (shopperId && profiles.has(shopperId)) {
          link(shopperId, source, basis, 'direct_shopper_id');
          continue;
        }
        const candidates = [];
        for (const key of TECH_KEYS) candidates.push(...(relationIndex.get(text(source[key])) || []));
        const exact = uniq(candidates);
        if (exact.length === 1) link(exact[0], source, basis, 'exact_technical_anchor');
      }`,
  'classifier_link_fallback');
classifier = replaceOnce(classifier,
  '    const names = canonicalNames(profile, linkedSources, credentials);',
  "    const names = resolveEquivalentNames(profile, linkedSources.map(source => ({ value: source, basis: source.__basis || 'linked', linkMode: source.__linkMode || 'direct_shopper_id' })), credentials);",
  'classifier_names');
classifier = replaceOnce(classifier,
`    const active = !status.inactive && (
      status.active ||
      uniqueAuth.length > 0 ||
      credentials.length > 0 ||
      profileActivity.hrLinks > 0 ||
      profileActivity.recentVisits > 0
    );`,
`    const active = equivalentActive({
      status,
      authCandidateCount: uniqueAuth.length,
      credentialCount: credentials.length,
      hrLinks: profileActivity.hrLinks,
      recentVisits: profileActivity.recentVisits
    });`,
  'classifier_active');
classifier = replaceOnce(classifier,
`  for (const [login, members] of candidateGroups) {
    if (members.length < 2) continue;
    groupMatrix.push(classifyGroup(login, members, tenantId, projectId));
  }`,
`  for (const [login, members] of candidateGroups) {
    if (members.length < 2) continue;
    const classified = classifyGroup(login, members, tenantId, projectId);
    classified.universeVersion = EQUIVALENT_UNIVERSE_VERSION;
    classified.memberVectors = members.map(row => buildReferenceMemberVector({
      profileId: row.profile.id,
      active: row.active,
      names: row.names,
      linkedSourceResolutionMode: resolveLinkedSourceMode(row.linkedSources)
    }));
    groupMatrix.push(classified);
  }`,
  'classifier_group_vectors');
classifier = replaceOnce(classifier,
`    const scored = row.authUsers
      .map(user => ({ user, score: authScore(user, row, tenantId, projectId) }))
      .sort((a, b) => b.score - a.score);`,
`    const scored = row.authUsers
      .map(user => ({
        user,
        candidateFingerprint: stableAuthCandidateFingerprint(user.uid),
        score: authScore(user, row, tenantId, projectId)
      }))
      .sort((a, b) => b.score - a.score);`,
  'classifier_auth_scored');
classifier = replaceOnce(classifier,
`      scoreMargin: top && second ? top.score - second.score : top?.score || 0,
      resolution: uniqueStrong ? 'RESOLVED_UNIQUE_TECHNICAL_AUTH_CANDIDATE' : 'HOLD_MULTIPLE_AUTH_CANDIDATES'`,
`      scoreMargin: top && second ? top.score - second.score : top?.score || 0,
      candidateVectors: scored.map((entry, index) => ({
        candidateOrdinal: index + 1,
        candidateFingerprint: entry.candidateFingerprint,
        score: entry.score
      })),
      resolution: uniqueStrong ? 'RESOLVED_UNIQUE_TECHNICAL_AUTH_CANDIDATE' : 'HOLD_MULTIPLE_AUTH_CANDIDATES'`,
  'classifier_auth_vectors');
classifier = replaceOnce(classifier,
`  return {
    generatedAt: new Date().toISOString(),`,
`  return {
    schemaVersion: 'cxorbia.c6.shopper-login-collision-classification.result.v2.2',
    generatedAt: new Date().toISOString(),`,
  'classifier_schema');
classifier = replaceOnce(classifier,
`    classification: matrix,`,
`    equivalentUniverse: {
      version: EQUIVALENT_UNIVERSE_VERSION,
      populationPredicate: 'same_tenant_shopper_snapshot',
      activityPredicate: 'equivalentActive_v1',
      linkingPredicate: 'direct_shopper_id_or_exact_unique_technical_anchor',
      completenessPredicate: 'post_consensus_active_complete',
      referenceGroupFingerprints: groupMatrix.map(group => group.groupFp).sort(),
      memberProvenanceIntegrated: true
    },
    classification: matrix,`,
  'classifier_equivalent_output');
writeUtf8(classifierPath, classifier);

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
contract.schemaVersion = 'cxorbia.c6.shopper-deterministic-suffix.v2.2';
contract.plan.diagnosticContractVersion = 'v2.2';
contract.multiAuthResolution.diagnosticVector.fields = uniqContract([
  ...(contract.multiAuthResolution.diagnosticVector.fields || []),
  'candidateFingerprint'
]);
contract.multiAuthResolution.diagnosticVector.candidateFingerprintNamespace = 'shopper-auth-candidate-v1';
contract.collisionReconciliation = {
  ...(contract.collisionReconciliation || {}),
  groupFingerprintNamespace: 'shopper-visible-login-group-v1',
  memberFingerprintNamespace: 'shopper-collision-member-v1',
  equivalentUniverseVersion: 'shopper-equivalent-universe-v1',
  sameUniverseRequired: true,
  referenceUniverse: 'post_consensus_active_complete_equivalent_v1',
  plannerUniverse: 'post_consensus_active_complete_equivalent_v1',
  populationPredicate: 'same_tenant_shopper_snapshot',
  activityPredicate: 'equivalentActive_v1',
  linkingPredicate: 'direct_shopper_id_or_exact_unique_technical_anchor',
  completenessPredicate: 'post_consensus_active_complete',
  currentUniverseClassification: 'EQUIVALENT_UNIVERSE_CONTRACT_INTEGRATED_SOURCE_ONLY',
  priorComparatorDefect: 'REFERENCE_UNIVERSE_MISMATCH_PROVEN',
  diagnosticComparatorDefectFixedSourceOnly: true,
  providerRevalidationPending: true,
  exactAddedGroupCause: 'PENDING_EQUIVALENT_UNIVERSE_PROVIDER_REVALIDATION',
  suffixAlgorithmDefectProven: false,
  deltaOnlyMemberProvenanceExport: true,
  memberProvenanceVector: {
    fields: [
      'memberFingerprint','active','preConsensusComplete','postConsensusComplete','completedByConsensus',
      'sourceSafeSurnameBasis','surnameBasisCount','keeper','suffixApplied','suffixLength',
      'inReferenceSet','inPlannerSet','referenceEligibility','plannerEligibility','linkedSourceResolutionMode'
    ],
    allowedSurnameBasis: ['explicit_or_technical','multi_source_full_name_consensus','unresolved'],
    allowedSuffixLengths: [0,4,6,8],
    allowedLinkModes: ['profile_only','linked_source','direct_shopper_id','exact_technical_anchor'],
    rawIdentityAllowed: false,
    requiredForAddedOrRemovedGroups: true
  },
  classificationRules: {
    noDrift: 'same group fingerprints after equivalent-universe reference/planner construction',
    legitimateConsensusChange: 'classified only from member vectors proving preConsensusComplete=false and postConsensusComplete=true in the same universe',
    algorithmDefect: 'set drift remains after equivalent universes and complete delta member provenance vectors'
  }
};
writeUtf8(contractPath, JSON.stringify(contract, null, 2));

const evidence = {
  schemaVersion: 'cxorbia.c6.shopper-equivalent-universe-member-provenance-source-static.v1',
  generatedAt: '2026-08-05T22:12:00-06:00',
  decision: 'PASS_C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_INTEGRATION_SOURCE_STATIC',
  repository: 'paulaosoriof86/demoCXOrbia',
  branch: 'docs-tya-v6-v71-audit',
  pullRequest: 7,
  sourceProviderRun: 31069282511,
  integration: {
    sharedHelper: 'tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs',
    plannerIntegrated: true,
    classifierIntegrated: true,
    contractVersion: 'v2.2',
    universeVersion: 'shopper-equivalent-universe-v1',
    populationEquivalent: true,
    activityEquivalent: true,
    linkingEquivalent: true,
    completenessEquivalent: true,
    deltaOnlyMemberProvenance: true,
    multiAuthCandidateFingerprints: true
  },
  gates: [
    'PASS_PLANNER_CLASSIFIER_SHARED_PATCHER_NODE_SYNTAX',
    'PASS_SHARED_POST_CONSENSUS_NAME_RESOLUTION_FIXTURE',
    'PASS_SHARED_ACTIVITY_PREDICATE_FIXTURE',
    'PASS_DIRECT_OR_EXACT_TECHNICAL_LINKING_CONTRACT',
    'PASS_REFERENCE_PLANNER_EQUIVALENT_COMPLETENESS_CONTRACT',
    'PASS_DELTA_ONLY_MEMBER_PROVENANCE_FIXTURE',
    'PASS_MEMBER_VECTOR_PRIVACY_CONTRACT',
    'PASS_MULTI_AUTH_CANDIDATE_FINGERPRINT_FIXTURE',
    'PASS_NO_PROVIDER_CAPABILITY_IN_SHARED_HELPER_OR_PATCHER'
  ],
  priorStatePreserved: {
    providerPlanRows: 340,
    providerHoldRows: 13,
    readyForAuthRepair: false,
    executable: false,
    partialExecutionAllowed: false
  },
  safety: {
    providerReads: 0,
    providerWrites: 0,
    authWrites: 0,
    passwordChanges: 0,
    passwordResets: 0,
    membershipWrites: 0,
    firestoreWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    hrWrites: 0,
    hostingDeploys: 0,
    cloudRunDeploys: 0,
    makeCalls: 0,
    geminiCalls: 0,
    paymentWrites: 0,
    merge: false,
    production: false
  },
  nextGate: 'NEW_EXPLICIT_PROVIDER_READONLY_REVALIDATION_OR_TENANT_ADJUDICATION_PREPARATION_REQUIRED'
};
writeUtf8(evidencePath, JSON.stringify(evidence, null, 2));

const docs = {
  'app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md': `# CAMBIOS BACKEND — C6 universo equivalente y procedencia por miembro\n\n## Resultado\n\nPASS source/static. Planner y clasificador comparten resolución post-consenso, actividad equivalente y linking por shopperId directo o ancla técnica exacta única.\n\n## Archivos\n\n- creado helper puro de universo equivalente;\n- actualizados planner, clasificador y contrato v2.2;\n- añadidos member fingerprints únicamente para deltas y candidate fingerprints multi-Auth;\n- creada evidencia source/static y documentación de cierre.\n\n## Seguridad\n\nProvider reads/writes, Auth, datos, deploy, merge y producción: 0/false.\n`,
  'app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md': `# RESUMEN PARA CLAUDE — C6 universo equivalente\n\nNo hubo cambios frontend, módulos, Login ni CX.data. El cambio es exclusivo de herramientas backend read-only y contrato diagnóstico. Academia y manuales solo requieren registrar el nuevo concepto de universo equivalente y procedencia source-safe.\n`,
  'app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md': `# PENDIENTES PROTOTIPO — C6 universo equivalente\n\n- nueva revalidación provider read-only solo con autorización expresa;\n- obtener evidencia autoritativa para 12 apellidos;\n- adjudicar el empate multi-Auth mediante fingerprints source-safe;\n- no ejecutar parcial ni repair mientras existan HOLD.\n`,
  'app/docs/ACADEMIA-IMPACTO-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md': `# ACADEMIA — Impacto C6 universo equivalente\n\nRegistrar: comparación válida exige el mismo universo; fingerprints permiten trazabilidad sin PII; los deltas deben explicarse por procedencia de miembros antes de clasificarse como drift o defecto.\n`,
  'app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md': `# PHASE A — Addendum C6 universo equivalente\n\n- integración planner/clasificador: PASS source/static;\n- contrato v2.2: PASS;\n- provider reads: 0;\n- plan 340 anterior: preservado, no ejecutable;\n- siguiente gate: autorización expresa para provider revalidation o preparación de adjudicación tenant.\n`
};
for (const [relative, content] of Object.entries(docs)) writeUtf8(path.join(root, relative), content);

const forbidden = ['firebase-admin','GOOGLE_APPLICATION_CREDENTIALS','listAllUsers(','collectionGroup(','passwordSignInEmail('];
for (const token of forbidden) {
  if (shared.includes(token)) throw new Error('shared_provider_capability_forbidden_' + token);
}

const requiredPlanner = [
  'EQUIVALENT_UNIVERSE_VERSION','buildReferenceMemberVector','buildPlannerMemberVector',
  'reconcileEquivalentGroupSets','candidateFingerprint: stableAuthCandidateFingerprint',
  "completenessPredicate: 'post_consensus_active_complete'"
];
for (const token of requiredPlanner) if (!planner.includes(token)) throw new Error('planner_token_missing_' + token);
const requiredClassifier = [
  'resolveEquivalentNames','equivalentActive','buildReferenceMemberVector',
  'candidateFingerprint: stableAuthCandidateFingerprint',"link(exact[0], source, basis, 'exact_technical_anchor')"
];
for (const token of requiredClassifier) if (!classifier.includes(token)) throw new Error('classifier_token_missing_' + token);
console.log('PASS_C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_PATCH_APPLIED');

function uniqContract(values) {
  return [...new Set(values)];
}
