#!/usr/bin/env node

const ALLOWED_SURNAME_BASES = new Set([
  'explicit_or_technical',
  'multi_source_full_name_consensus',
  'unresolved'
]);
const ALLOWED_REFERENCE_ELIGIBILITY = new Set([
  'eligible_explicit_or_technical_complete',
  'excluded_consensus_only',
  'excluded_incomplete',
  'excluded_inactive',
  'unknown_not_exported'
]);
const ALLOWED_PLANNER_ELIGIBILITY = new Set([
  'eligible_post_consensus_complete',
  'excluded_incomplete',
  'excluded_inactive',
  'unknown_not_exported'
]);
const ALLOWED_LINK_MODES = new Set([
  'direct_shopper_id',
  'exact_technical_anchor',
  'multi_source_consensus',
  'none',
  'unknown_not_exported'
]);

const ensure = (condition, code) => {
  if (!condition) throw new Error(code);
};

export function validateMemberProvenanceVector(vector) {
  ensure(vector && typeof vector === 'object' && !Array.isArray(vector), 'vector_object_required');
  const exactKeys = [
    'memberFingerprint',
    'active',
    'preConsensusComplete',
    'postConsensusComplete',
    'completedByConsensus',
    'sourceSafeSurnameBasis',
    'surnameBasisCount',
    'keeper',
    'suffixApplied',
    'suffixLength',
    'inReferenceSet',
    'inPlannerSet',
    'referenceEligibility',
    'plannerEligibility',
    'linkedSourceResolutionMode'
  ];
  ensure(JSON.stringify(Object.keys(vector).sort()) === JSON.stringify([...exactKeys].sort()), 'vector_keys_invalid');
  ensure(typeof vector.memberFingerprint === 'string' && /^[a-f0-9]{20}$/.test(vector.memberFingerprint), 'member_fingerprint_invalid');
  for (const key of ['active','preConsensusComplete','postConsensusComplete','completedByConsensus','keeper','suffixApplied','inReferenceSet','inPlannerSet']) {
    ensure(typeof vector[key] === 'boolean', `vector_boolean_invalid:${key}`);
  }
  ensure(ALLOWED_SURNAME_BASES.has(vector.sourceSafeSurnameBasis), 'surname_basis_invalid');
  ensure(Number.isInteger(vector.surnameBasisCount) && vector.surnameBasisCount >= 0, 'surname_basis_count_invalid');
  ensure([0,4,6,8].includes(vector.suffixLength), 'suffix_length_invalid');
  ensure(vector.suffixApplied === (vector.suffixLength > 0), 'suffix_flag_mismatch');
  ensure(ALLOWED_REFERENCE_ELIGIBILITY.has(vector.referenceEligibility), 'reference_eligibility_invalid');
  ensure(ALLOWED_PLANNER_ELIGIBILITY.has(vector.plannerEligibility), 'planner_eligibility_invalid');
  ensure(ALLOWED_LINK_MODES.has(vector.linkedSourceResolutionMode), 'link_mode_invalid');
  ensure(!(vector.completedByConsensus && vector.preConsensusComplete), 'consensus_and_precomplete_conflict');
  ensure(!(vector.completedByConsensus && !vector.postConsensusComplete), 'consensus_without_postcomplete');
  ensure(!Object.keys(vector).some(key => ['name','surname','login','email','uid','password'].includes(key.toLowerCase())), 'raw_identity_key_forbidden');
  return true;
}

export function classifyAddedGroup({
  referenceCount,
  currentCount,
  added,
  removed,
  referenceUniverse,
  plannerUniverse,
  memberVectors = []
}) {
  ensure(Number.isInteger(referenceCount) && Number.isInteger(currentCount), 'group_counts_invalid');
  ensure(Array.isArray(added) && Array.isArray(removed), 'group_sets_invalid');
  for (const vector of memberVectors) validateMemberProvenanceVector(vector);

  const exactMatch = added.length === 0 && removed.length === 0;
  if (exactMatch) {
    return {
      primaryClassification: 'EXACT_SET_MATCH',
      legitimateConsensusChange: false,
      universeDifference: false,
      suffixAlgorithmDefect: false,
      diagnosticComparatorDefect: false,
      exactGroupCauseProven: true
    };
  }

  const universesEquivalent = referenceUniverse === plannerUniverse;
  const exactGroupCauseProven = memberVectors.length > 0 && memberVectors.every(vector => vector.inPlannerSet);
  const consensusOnlyAddition = exactGroupCauseProven && memberVectors.every(vector =>
    vector.postConsensusComplete &&
    (!vector.preConsensusComplete || vector.completedByConsensus) &&
    vector.inPlannerSet &&
    !vector.inReferenceSet
  );

  if (!universesEquivalent) {
    return {
      primaryClassification: 'REFERENCE_UNIVERSE_MISMATCH_PROVEN',
      legitimateConsensusChange: consensusOnlyAddition,
      universeDifference: true,
      suffixAlgorithmDefect: false,
      diagnosticComparatorDefect: true,
      exactGroupCauseProven,
      exactGroupCause: consensusOnlyAddition
        ? 'LEGITIMATE_POST_CONSENSUS_GROUP_ADDITION'
        : 'NOT_PROVEN_MEMBER_PROVENANCE_MISSING'
    };
  }

  return {
    primaryClassification: 'UNEXPLAINED_SET_DRIFT_SAME_UNIVERSE',
    legitimateConsensusChange: consensusOnlyAddition,
    universeDifference: false,
    suffixAlgorithmDefect: !consensusOnlyAddition,
    diagnosticComparatorDefect: false,
    exactGroupCauseProven,
    exactGroupCause: consensusOnlyAddition
      ? 'LEGITIMATE_POST_CONSENSUS_GROUP_ADDITION'
      : 'ALGORITHM_OR_DATA_DRIFT_REQUIRES_REVIEW'
  };
}

export function classifySurnameEvidenceMechanism(vector) {
  ensure(vector?.first?.complete === true, 'first_not_complete');
  ensure(vector?.passwordSeed?.complete === true, 'password_seed_not_complete');
  const surname = vector?.surname || {};
  const zeroEvidence =
    surname.complete === false &&
    Number(surname.explicitCandidateCount) === 0 &&
    Number(surname.technicalLoginCandidateCount) === 0 &&
    Number(surname.consensusCandidateCount) === 0 &&
    Number(surname.basisCount) === 0 &&
    surname.conflict === false;
  return zeroEvidence
    ? {
        classification: 'AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED',
        automaticInferenceAllowed: false,
        minimumAcceptedEvidence: [
          'explicit surname linked by exact shopperId or strong technical anchor',
          'exact mapped credential login',
          'two independent linked full-name sources with matching surname token',
          'explicit tenant adjudication recorded against a source-safe profile fingerprint'
        ]
      }
    : {
        classification: 'REVIEW_EXISTING_SURNAME_EVIDENCE',
        automaticInferenceAllowed: false,
        minimumAcceptedEvidence: []
      };
}

export function classifyMultiAuthTieMechanism(vector) {
  ensure(Number(vector?.candidateCount) >= 2, 'multi_auth_candidate_count_invalid');
  const exactTie =
    Number(vector.topScore) === Number(vector.secondScore) &&
    Number(vector.scoreMargin) === 0 &&
    vector.candidateSignalsIdentical === true;
  return exactTie
    ? {
        classification: 'SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED',
        automaticSelectionAllowed: false,
        forbiddenSelectors: ['creationTime','candidateOrdinal','firstReturned','enabledStateAlone','emailVerifiedAlone'],
        minimumAcceptedDiscriminator: [
          'exact canonical claims unique to one candidate',
          'exact credential or target-email anchor unique to one candidate',
          'password compatibility unique to one candidate',
          'explicit tenant adjudication against stable candidate fingerprints'
        ]
      }
    : {
        classification: 'REVIEW_AVAILABLE_TECHNICAL_DISCRIMINATORS',
        automaticSelectionAllowed: false,
        forbiddenSelectors: ['creationTime','candidateOrdinal','firstReturned'],
        minimumAcceptedDiscriminator: []
      };
}

function selfTest() {
  const vector = {
    memberFingerprint: '0123456789abcdefabcd',
    active: true,
    preConsensusComplete: false,
    postConsensusComplete: true,
    completedByConsensus: true,
    sourceSafeSurnameBasis: 'multi_source_full_name_consensus',
    surnameBasisCount: 2,
    keeper: true,
    suffixApplied: false,
    suffixLength: 0,
    inReferenceSet: false,
    inPlannerSet: true,
    referenceEligibility: 'excluded_consensus_only',
    plannerEligibility: 'eligible_post_consensus_complete',
    linkedSourceResolutionMode: 'multi_source_consensus'
  };
  validateMemberProvenanceVector(vector);
  const group = classifyAddedGroup({
    referenceCount: 64,
    currentCount: 65,
    added: ['ebbcc231fcf415cbaf77'],
    removed: [],
    referenceUniverse: 'explicit_or_technical_verified_active_groups_v1',
    plannerUniverse: 'post_consensus_active_complete_groups_v2',
    memberVectors: []
  });
  ensure(group.primaryClassification === 'REFERENCE_UNIVERSE_MISMATCH_PROVEN', 'group_classification_failed');
  ensure(group.exactGroupCauseProven === false, 'group_observability_failed');
  const surname = classifySurnameEvidenceMechanism({
    first: { complete: true },
    surname: { complete: false, explicitCandidateCount: 0, technicalLoginCandidateCount: 0, consensusCandidateCount: 0, basisCount: 0, conflict: false },
    passwordSeed: { complete: true }
  });
  ensure(surname.classification === 'AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED', 'surname_classification_failed');
  const auth = classifyMultiAuthTieMechanism({ candidateCount: 2, topScore: 5016, secondScore: 5016, scoreMargin: 0, candidateSignalsIdentical: true });
  ensure(auth.classification === 'SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED', 'multi_auth_classification_failed');
  console.log('PASS_C6_GROUP_PROVENANCE_RESIDUAL_IDENTITY_SOURCE_ONLY');
}

if (process.argv.includes('--self-test')) selfTest();
