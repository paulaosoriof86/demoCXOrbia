// SOURCE_ONLY_INTEGRATED
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { text, norm, fingerprint, asciiToken } from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

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
  const parts = pick(source, NAME_KEYS).split(/\s+/).filter(Boolean);
  if (parts.length < 2 || asciiToken(parts[0]) !== firstToken) return '';
  return asciiToken(parts[parts.length >= 4 ? parts.length - 2 : parts.length - 1]);
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
      if (parts.length >= 2 && asciiToken(parts[0]) === first) technical.push({ token: asciiToken(parts[1]), basis: item.basis + ':technical_login' });
    }
  }
  for (const record of credentials) {
    const parts = norm(record?.normalizedLogin || record?.loginIdentifier).split('.').filter(Boolean);
    if (parts.length >= 2 && asciiToken(parts[0]) === first) technical.push({ token: asciiToken(parts[1]), basis: 'credential:technical_login' });
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
    } else if (corroborated.length > 1) conflict = true;
  }
  const baseLogin = first && surname ? first + '.' + surname : '';
  const preConsensusBaseLogin = first && preConsensusSurname ? first + '.' + preConsensusSurname : '';
  const passwordToken = text(firstRaw).normalize('NFC').replace(/[^\p{L}'’\-]/gu, '');
  const password = passwordToken ? passwordToken.charAt(0).toUpperCase() + passwordToken.slice(1).toLowerCase() + '123*' : '';
  const surnameBasisCount = uniq([...explicit, ...technical].map(item => item.basis)).length + consensusBasisCount;
  const diagnostics = {
    first: { complete: Boolean(first), candidateCount: first ? 1 : 0, basisCount: firstBases.length },
    surname: { complete: Boolean(surname), explicitCandidateCount: explicitTokens.length, technicalLoginCandidateCount: technicalTokens.length, consensusCandidateCount, basisCount: surnameBasisCount, conflict },
    passwordSeed: { complete: Boolean(passwordToken), candidateCount: passwordToken ? 1 : 0, basisCount: firstBases.length }
  };
  const complete = Boolean(baseLogin && password);
  return {
    firstComplete: Boolean(first), surnameComplete: Boolean(surname), passwordSeedComplete: Boolean(passwordToken),
    preConsensusComplete: Boolean(preConsensusBaseLogin && password), complete, baseLogin, password,
    basis: basis || 'unresolved', completedByConsensus, conflict, diagnostics,
    candidateLogin: baseLogin, candidateComplete: complete, candidateBasis: basis || 'unresolved',
    verifiedLogin: baseLogin, verifiedComplete: complete,
    verifiedSurnameCount: explicitTokens.length + technicalTokens.length + consensusCandidateCount,
    verifiedSurnameConflict: conflict,
    verifiedBases: Array.from({ length: surnameBasisCount }, () => 'source_safe_basis')
  };
}

export function equivalentActive({ status, authCandidateCount = 0, credentialCount = 0, hrLinks = 0, recentVisits = 0 }) {
  return !status?.inactive && Boolean(status?.active || authCandidateCount || credentialCount || hrLinks || recentVisits);
}
export const stableGroupFingerprint = baseLogin => stableFp(GROUP_FINGERPRINT_NAMESPACE, norm(baseLogin));
export const stableMemberFingerprint = profileId => stableFp(MEMBER_FINGERPRINT_NAMESPACE, profileId);
export const stableAuthCandidateFingerprint = uid => stableFp(AUTH_CANDIDATE_FINGERPRINT_NAMESPACE, uid);

export function resolveLinkedSourceMode(linkedSources = []) {
  const modes = linkedSources.map(item => item?.linkMode || item?.__linkMode).filter(Boolean);
  if (modes.includes('exact_technical_anchor')) return 'exact_technical_anchor';
  if (modes.includes('direct_shopper_id')) return 'direct_shopper_id';
  return linkedSources.length ? 'linked_source' : 'profile_only';
}

function baseVector({ profileId, active, names, linkedSourceResolutionMode }) {
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
  const common = baseVector(input);
  const eligible = common.active && common.postConsensusComplete;
  return { ...common, keeper: false, suffixApplied: false, suffixLength: 0, inReferenceSet: true, inPlannerSet: false, referenceEligibility: eligible, plannerEligibility: eligible };
}
export function buildPlannerMemberVector(input) {
  const common = baseVector(input);
  const eligible = common.active && common.postConsensusComplete;
  return { ...common, keeper: Boolean(input.keeper), suffixApplied: Boolean(input.suffixApplied), suffixLength: Number(input.suffixLength || 0), inReferenceSet: false, inPlannerSet: true, referenceEligibility: eligible, plannerEligibility: eligible };
}
export function mergeMemberProvenance(referenceMembers = [], plannerMembers = []) {
  const map = new Map(referenceMembers.map(item => [item.memberFingerprint, { ...item }]));
  for (const item of plannerMembers) {
    const prior = map.get(item.memberFingerprint) || {};
    map.set(item.memberFingerprint, { ...prior, ...item, inReferenceSet: Boolean(prior.inReferenceSet), inPlannerSet: Boolean(item.inPlannerSet) });
  }
  return [...map.values()].sort((a, b) => a.memberFingerprint.localeCompare(b.memberFingerprint));
}
export function reconcileEquivalentGroupSets(referenceGroups = [], plannerGroups = []) {
  const ref = new Map(referenceGroups.map(group => [group.groupFp, group]));
  const plan = new Map(plannerGroups.map(group => [group.groupFp, group]));
  const added = [...plan.keys()].filter(key => !ref.has(key)).sort();
  const removed = [...ref.keys()].filter(key => !plan.has(key)).sort();
  const unchanged = [...plan.keys()].filter(key => ref.has(key)).sort();
  const deltaGroups = [...new Set([...added, ...removed])].sort().map(groupFp => ({
    groupFp, added: added.includes(groupFp), removed: removed.includes(groupFp),
    memberVectors: mergeMemberProvenance(ref.get(groupFp)?.memberVectors || [], plan.get(groupFp)?.memberVectors || [])
  }));
  return { universeVersion: EQUIVALENT_UNIVERSE_VERSION, referenceCount: ref.size, plannerCount: plan.size, added, removed, unchangedCount: unchanged.length, exactMatch: !added.length && !removed.length, deltaGroups };
}

function assert(condition, code) { if (!condition) throw new Error(code); }
export function selfTestEquivalentUniverse() {
  const names = resolveEquivalentNames({ id: 'p1', nombre: 'Ana Maria Perez Lopez' }, [{ value: { shopperId: 'p1', name: 'Ana Maria Perez Lopez' }, basis: 'hr', linkMode: 'direct_shopper_id' }], []);
  assert(names.completedByConsensus && names.baseLogin === 'ana.perez', 'consensus_failed');
  const active = equivalentActive({ status: { active: false, inactive: false }, hrLinks: 1 });
  const ref = buildReferenceMemberVector({ profileId: 'p1', active, names, linkedSourceResolutionMode: 'direct_shopper_id' });
  const plan = buildPlannerMemberVector({ profileId: 'p1', active, names, keeper: true, suffixApplied: false, suffixLength: 0, linkedSourceResolutionMode: 'direct_shopper_id' });
  assert(mergeMemberProvenance([ref], [plan])[0].keeper, 'merge_failed');
  const groupFp = stableGroupFingerprint(names.baseLogin);
  assert(reconcileEquivalentGroupSets([{ groupFp, memberVectors: [ref] }], [{ groupFp, memberVectors: [plan] }]).exactMatch, 'set_failed');
  assert(reconcileEquivalentGroupSets([], [{ groupFp, memberVectors: [plan] }]).deltaGroups[0].memberVectors[0].inPlannerSet, 'delta_failed');
  assert(!stableAuthCandidateFingerprint('internal-uid').includes('internal-uid'), 'candidate_fp_failed');
  return { decision: 'PASS_C6_EQUIVALENT_UNIVERSE_SOURCE_STATIC' };
}

const isMainModule = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return path.resolve(entry) === path.resolve(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();

if (isMainModule && process.argv.includes('--self-test')) console.log(selfTestEquivalentUniverse().decision);
