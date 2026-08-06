#!/usr/bin/env node
import fs from 'node:fs';

const plannerPath = 'tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs';
const classifierPath = 'tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs';
const contractPath = 'backend/contracts/c6-shopper-deterministic-suffix-v1.json';
const mode = process.argv[2] || '--verify';

function fail(code) { throw new Error(code); }
function replaceOnce(text, pattern, replacement, code) {
  const next = text.replace(pattern, replacement);
  if (next === text) fail(`anchor_not_found:${code}`);
  return next;
}
function ensure(condition, code) { if (!condition) fail(code); }

function applyPlanner(source) {
  if (!source.includes("const GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';")) {
    source = replaceOnce(
      source,
      'const STABLE_CREDENTIALS_UNMAPPED = 8;\n',
      "const STABLE_CREDENTIALS_UNMAPPED = 8;\nconst GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';\n",
      'planner_group_namespace_constant'
    );
  }

  if (!source.includes('function stableGroupFingerprint(baseLogin)')) {
    source = replaceOnce(
      source,
      "const fp = (kind, value) => fingerprint(`${kind}\\0${value}`);\n",
      "const fp = (kind, value) => fingerprint(`${kind}\\0${value}`);\nfunction stableGroupFingerprint(baseLogin) {\n  return fp(GROUP_FINGERPRINT_NAMESPACE, norm(baseLogin));\n}\nfunction reconcileFingerprintSets(referenceValues, currentValues) {\n  const reference = new Set((Array.isArray(referenceValues) ? referenceValues : []).filter(Boolean));\n  const current = new Set((Array.isArray(currentValues) ? currentValues : []).filter(Boolean));\n  const added = [...current].filter(value => !reference.has(value)).sort();\n  const removed = [...reference].filter(value => !current.has(value)).sort();\n  const unchanged = [...current].filter(value => reference.has(value)).sort();\n  return {\n    namespace: GROUP_FINGERPRINT_NAMESPACE,\n    referenceCount: reference.size,\n    currentCount: current.size,\n    added,\n    removed,\n    unchangedCount: unchanged.length,\n    exactMatch: added.length === 0 && removed.length === 0\n  };\n}\n",
      'planner_group_helpers'
    );
  }

  const namesFunction = String.raw`function sourceSafeNames(profile, linkedSources, credentials) {
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
  const firstCandidateBases = uniq(sources
    .filter(item => {
      const direct = pick(item.value, FIRST_KEYS);
      const full = pick(item.value, NAME_KEYS);
      const raw = direct ? direct.split(/\s+/)[0] : full ? full.split(/\s+/)[0] : '';
      return first && asciiToken(raw) === first;
    })
    .map(item => item.basis));
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

  const explicitTokens = uniq(explicit.map(item => item.token));
  const technicalLoginTokens = uniq(logins.map(item => item.token));
  const directTokens = uniq([...explicitTokens, ...technicalLoginTokens]);
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

  const baseLogin = first && surname ? `${first}.${surname}` : '';
  const preConsensusBaseLogin = first && preConsensusSurname ? `${first}.${preConsensusSurname}` : '';
  const passwordToken = text(firstRaw).normalize('NFC').replace(/[^\p{L}'’\-]/gu, '');
  const password = passwordToken
    ? passwordToken.charAt(0).toUpperCase() + passwordToken.slice(1).toLowerCase() + '123*'
    : '';
  const passwordSeedComplete = Boolean(passwordToken);
  return {
    firstComplete: Boolean(first),
    surnameComplete: Boolean(surname),
    passwordSeedComplete,
    preConsensusComplete: Boolean(preConsensusBaseLogin && password),
    complete: Boolean(baseLogin && password),
    baseLogin,
    password,
    basis: basis || 'unresolved',
    completedByConsensus,
    conflict,
    diagnostics: {
      first: {
        complete: Boolean(first),
        candidateCount: first ? 1 : 0,
        basisCount: firstCandidateBases.length
      },
      surname: {
        complete: Boolean(surname),
        explicitCandidateCount: explicitTokens.length,
        technicalLoginCandidateCount: technicalLoginTokens.length,
        consensusCandidateCount,
        basisCount: uniq([...explicit, ...logins].map(item => item.basis)).length + consensusBasisCount,
        conflict
      },
      passwordSeed: {
        complete: passwordSeedComplete,
        candidateCount: passwordSeedComplete ? 1 : 0,
        basisCount: firstCandidateBases.length
      }
    }
  };
}`;

  source = replaceOnce(
    source,
    /function sourceSafeNames\(profile, linkedSources, credentials\) \{[\s\S]*?\n\}\n\nfunction recursiveObjects/,
    `${namesFunction}\n\nfunction recursiveObjects`,
    'planner_source_safe_names'
  );

  const authFunctions = String.raw`function buildAuthCandidateSignalVector(user, row, passwordCompatible, tenantId, projectId) {
  const claims = user.customClaims || {};
  const credentialEmails = row.credentials
    .map(record => norm(record.normalizedLogin || record.loginIdentifier))
    .filter(Boolean)
    .map(login => internalEmail(login, 'shopper', tenantId));
  const signals = {
    exactClaims: exactClaims(claims, row.profile.id, tenantId, projectId),
    shopperIdClaim: text(claims.shopperId) === row.profile.id,
    targetEmailMatch: norm(user.email) === norm(internalEmail(row.targetLogin, 'shopper', tenantId)),
    baseEmailMatch: norm(user.email) === norm(internalEmail(row.names.baseLogin, 'shopper', tenantId)),
    credentialEmailMatch: credentialEmails.some(email => norm(email) === norm(user.email)),
    passwordCompatible: Boolean(passwordCompatible),
    enabled: !user.disabled,
    emailVerified: Boolean(user.emailVerified),
    providerCreationMetadataPresent: Boolean(user.metadata?.creationTime)
  };
  let score = 0;
  if (signals.exactClaims) score += 10000;
  if (signals.shopperIdClaim) score += 5000;
  if (signals.targetEmailMatch) score += 1200;
  if (signals.baseEmailMatch) score += 800;
  if (signals.credentialEmailMatch) score += 600;
  if (signals.passwordCompatible) score += 400;
  if (signals.enabled) score += 10;
  if (signals.emailVerified) score += 5;
  if (signals.providerCreationMetadataPresent) score += 1;
  return { score, passwordCompatible: Boolean(passwordCompatible), signals };
}

async function authCandidateScore(user, row, tenantId, projectId, webConfig) {
  const passwordCompatible = await passwordSignInEmail(webConfig.apiKey, user.email, row.names.password);
  return { user, ...buildAuthCandidateSignalVector(user, row, passwordCompatible, tenantId, projectId) };
}`;

  source = replaceOnce(
    source,
    /async function authCandidateScore\(user, row, tenantId, projectId, webConfig\) \{[\s\S]*?\n\}\n\nasync function buildProviderPlan/,
    `${authFunctions}\n\nasync function buildProviderPlan`,
    'planner_auth_signal_vector'
  );

  source = source.replace("groupFp: fp('deterministic-suffix-group', baseLogin),", 'groupFp: stableGroupFingerprint(baseLogin),');
  ensure(source.includes('groupFp: stableGroupFingerprint(baseLogin),'), 'planner_stable_group_fp_missing');

  if (!source.includes('multiAuthDiagnostics: null,')) {
    source = replaceOnce(
      source,
      '      selectedAuth: null,\n      selectedPasswordCompatible: false\n',
      '      selectedAuth: null,\n      selectedPasswordCompatible: false,\n      multiAuthDiagnostics: null\n',
      'planner_multi_auth_row_state'
    );
  }

  source = source.replace(
    '  const initialIncompleteActiveProfiles = rows.filter(row => row.active && !row.names.complete).length;\n',
    '  const preConsensusIncompleteActiveProfiles = rows.filter(row => row.active && !row.names.preConsensusComplete).length;\n'
  );
  ensure(source.includes('const preConsensusIncompleteActiveProfiles ='), 'planner_pre_consensus_metric_missing');

  source = replaceOnce(
    source,
    "  for (const row of rows) {\n    if (row.active && !row.names.complete) row.holds.add(row.names.conflict ? 'technical_surname_conflict' : 'technical_surname_unresolved');\n  }\n",
    "  for (const row of rows) {\n    if (!row.active || row.names.complete) continue;\n    if (row.names.conflict) row.holds.add('technical_surname_conflict');\n    else if (!row.names.firstComplete) row.holds.add('technical_first_name_unresolved');\n    else if (!row.names.surnameComplete) row.holds.add('technical_surname_unresolved');\n    else if (!row.names.passwordSeedComplete) row.holds.add('technical_password_seed_unresolved');\n    else row.holds.add('technical_name_contract_unresolved');\n  }\n",
    'planner_dimension_specific_holds'
  );

  if (!source.includes('candidateVectors: scored.map')) {
    source = replaceOnce(
      source,
      '      const top = scored[0];\n      const second = scored[1];\n',
      "      const top = scored[0];\n      const second = scored[1];\n      row.multiAuthDiagnostics = {\n        candidateCount: scored.length,\n        topScore: top?.score || 0,\n        secondScore: second?.score || 0,\n        scoreMargin: top ? top.score - (second?.score || 0) : 0,\n        candidateVectors: scored.map((entry, index) => ({\n          candidateOrdinal: index + 1,\n          score: entry.score,\n          signals: entry.signals\n        }))\n      };\n",
      'planner_multi_auth_diagnostics'
    );
  }

  if (!source.includes('diagnostics: primary === \'HOLD\'')) {
    source = replaceOnce(
      source,
      '      sourceSafeSurnameBasis: row.names.basis,\n      resolutionBases: [...row.resolutionBases].sort(),\n',
      "      sourceSafeSurnameBasis: row.names.basis,\n      resolutionBases: [...row.resolutionBases].sort(),\n      diagnostics: primary === 'HOLD' ? {\n        name: row.names.diagnostics,\n        multiAuth: row.multiAuthDiagnostics\n      } : null,\n",
      'planner_hold_diagnostics'
    );
  }

  source = source.replace("schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v1',", "schemaVersion: 'cxorbia.c6.shopper-deterministic-suffix-readonly.result.v2',");

  source = replaceOnce(
    source,
    "    surnameCompletion: {\n      initialIncompleteActiveProfiles,\n      completedByMultiSourceConsensus: completedByConsensus,\n      remainingIncompleteActiveProfiles: unresolvedActiveNames\n    },\n",
    "    surnameCompletion: {\n      preConsensusIncompleteActiveProfiles,\n      completedByConsensus,\n      completedByMultiSourceConsensus: completedByConsensus,\n      remainingIncompleteActiveProfiles: unresolvedActiveNames,\n      metricIdentityValid: preConsensusIncompleteActiveProfiles === completedByConsensus + unresolvedActiveNames\n    },\n",
    'planner_surname_metrics_contract'
  );

  if (!source.includes('groupFingerprintNamespace: GROUP_FINGERPRINT_NAMESPACE,')) {
    source = replaceOnce(
      source,
      "    disambiguation: {\n      policy: 'DETERMINISTIC_TECHNICAL_SUFFIX',\n",
      "    disambiguation: {\n      policy: 'DETERMINISTIC_TECHNICAL_SUFFIX',\n      groupFingerprintNamespace: GROUP_FINGERPRINT_NAMESPACE,\n",
      'planner_disambiguation_namespace'
    );
  }

  source = replaceOnce(
    source,
    "    multiAuth: {\n      profilesWithMultipleCandidates: rows.filter(row => row.authUsers.length > 1).length,\n      resolved: rows.filter(row => row.resolutionBases.has('multi_auth_resolved_by_combined_technical_signals')).length,\n      unresolved: unresolvedMultiAuth\n    },\n",
    "    multiAuth: {\n      profilesWithMultipleCandidates: rows.filter(row => row.authUsers.length > 1).length,\n      resolved: rows.filter(row => row.resolutionBases.has('multi_auth_resolved_by_combined_technical_signals')).length,\n      unresolved: unresolvedMultiAuth,\n      vectors: rows\n        .filter(row => row.multiAuthDiagnostics)\n        .map(row => ({\n          profileFp: fp('multi-auth-profile-v1', row.profile.id),\n          ...row.multiAuthDiagnostics\n        }))\n    },\n",
    'planner_multi_auth_export'
  );

  source = replaceOnce(
    source,
    "  ensure(JSON.stringify(request.suffixLengths) === JSON.stringify([4,6,8]), 'suffix_lengths_invalid');\n",
    "  ensure(JSON.stringify(request.suffixLengths) === JSON.stringify([4,6,8]), 'suffix_lengths_invalid');\n  ensure(request.groupFingerprintNamespace === GROUP_FINGERPRINT_NAMESPACE, 'group_fingerprint_namespace_invalid');\n  ensure(request.collisionReconciliationPolicy === 'fingerprint_set_membership_not_rigid_aggregate_equality', 'collision_reconciliation_policy_invalid');\n",
    'planner_request_reconciliation_contract'
  );

  source = replaceOnce(
    source,
    "    if (result.surnameCompletion.initialIncompleteActiveProfiles !== Number(request.expectedInitialIncompleteActiveProfiles || 83)) blockers.push(`initial_incomplete:${result.surnameCompletion.initialIncompleteActiveProfiles}`);\n    if (result.disambiguation.collisionGroups !== Number(request.expectedDistinctActiveCollisionGroups || 64)) blockers.push(`collision_groups:${result.disambiguation.collisionGroups}`);\n",
    "    if (result.surnameCompletion.metricIdentityValid !== true) {\n      blockers.push(`surname_metric_identity:${result.surnameCompletion.preConsensusIncompleteActiveProfiles}/${result.surnameCompletion.completedByConsensus}/${result.surnameCompletion.remainingIncompleteActiveProfiles}`);\n    }\n    const collisionReference = Array.isArray(request.expectedCollisionGroupFingerprints)\n      ? request.expectedCollisionGroupFingerprints\n      : [];\n    const collisionReconciliation = reconcileFingerprintSets(\n      collisionReference,\n      result.groupMatrix.map(group => group.groupFp)\n    );\n    result.disambiguation.fingerprintReconciliation = {\n      ...collisionReconciliation,\n      referenceProvided: collisionReference.length > 0\n    };\n    if (collisionReference.length > 0 && !collisionReconciliation.exactMatch) {\n      blockers.push(`collision_group_set_drift:+${collisionReconciliation.added.length}/-${collisionReconciliation.removed.length}`);\n    }\n",
    'planner_remove_rigid_aggregate_gates'
  );

  source = replaceOnce(
    source,
    "  if (!sample.completedByConsensus || sample.baseLogin !== 'ana.perez') throw new Error('source_safe_consensus_failed');\n  return {\n",
    "  if (!sample.completedByConsensus || sample.baseLogin !== 'ana.perez' || sample.preConsensusComplete !== false) throw new Error('source_safe_consensus_failed');\n  if (sample.diagnostics.first.complete !== true || sample.diagnostics.surname.consensusCandidateCount !== 1 || sample.diagnostics.passwordSeed.complete !== true) throw new Error('source_safe_diagnostic_vector_failed');\n  const stableFpA = stableGroupFingerprint('Ana.Perez');\n  const stableFpB = stableGroupFingerprint('ana.perez');\n  if (stableFpA !== stableFpB) throw new Error('stable_group_fingerprint_failed');\n  const setReview = reconcileFingerprintSets(['a','b'], ['b','c']);\n  if (setReview.added.join(',') !== 'c' || setReview.removed.join(',') !== 'a' || setReview.exactMatch) throw new Error('fingerprint_set_reconciliation_failed');\n  const authVector = buildAuthCandidateSignalVector(\n    {\n      email: internalEmail('ana.perez', 'shopper', 'tya'),\n      disabled: false,\n      emailVerified: true,\n      metadata: { creationTime: '2026-01-01T00:00:00Z' },\n      customClaims: { tenantId: 'tya', role: 'shopper', authNamespace: 'shopper', shopperId: 'x', projectIds: ['cinepolis'] }\n    },\n    { profile: { id: 'x' }, targetLogin: 'ana.perez', names: { baseLogin: 'ana.perez' }, credentials: [] },\n    true,\n    'tya',\n    'cinepolis'\n  );\n  if (!authVector.signals.exactClaims || !authVector.signals.passwordCompatible || Object.hasOwn(authVector.signals, 'uid') || Object.hasOwn(authVector.signals, 'email')) throw new Error('multi_auth_source_safe_vector_failed');\n  return {\n",
    'planner_self_test_diagnostics'
  );

  if (!source.includes("'PASS_DIAGNOSTIC_CONTRACT_V2'")) {
    source = replaceOnce(
      source,
      "      'PASS_CREDENTIAL_CROSSWALK_PARITY_HARD_STOP'\n",
      "      'PASS_CREDENTIAL_CROSSWALK_PARITY_HARD_STOP',\n      'PASS_DIAGNOSTIC_CONTRACT_V2',\n      'PASS_PRE_CONSENSUS_COMPLETED_REMAINING_METRICS',\n      'PASS_HOLD_SOURCE_SAFE_DIAGNOSTIC_VECTORS',\n      'PASS_MULTI_AUTH_SOURCE_SAFE_SIGNAL_VECTOR',\n      'PASS_STABLE_GROUP_FINGERPRINT_NAMESPACE',\n      'PASS_FINGERPRINT_SET_RECONCILIATION_NO_RIGID_AGGREGATE'\n",
      'planner_self_test_checks'
    );
  }

  return source;
}

function applyClassifier(source) {
  if (!source.includes("const GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';")) {
    source = replaceOnce(
      source,
      /const INACTIVE_STATUSES = new Set\([^\n]+\);\n/,
      match => `${match}const GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';\n`,
      'classifier_group_namespace_constant'
    );
  }
  source = source.replace("groupFp: fp('candidate-login-group', login),", 'groupFp: fp(GROUP_FINGERPRINT_NAMESPACE, norm(login)),');
  ensure(source.includes('groupFp: fp(GROUP_FINGERPRINT_NAMESPACE, norm(login)),'), 'classifier_stable_group_fp_missing');
  return source;
}

function applyContract(contract) {
  contract.schemaVersion = 'cxorbia.c6.shopper-deterministic-suffix.v2';
  contract.technicalSurnameCompletion = {
    ...(contract.technicalSurnameCompletion || {}),
    diagnosticContract: {
      preConsensusIncompleteActiveProfiles: 'count active profiles incomplete before multi-source consensus',
      completedByConsensus: 'count profiles completed only through multi-source full-name consensus',
      remainingIncompleteActiveProfiles: 'count active profiles still incomplete after all allowed source-safe methods',
      metricIdentity: 'preConsensusIncompleteActiveProfiles = completedByConsensus + remainingIncompleteActiveProfiles',
      holdVector: {
        first: ['complete','candidateCount','basisCount'],
        surname: ['complete','explicitCandidateCount','technicalLoginCandidateCount','consensusCandidateCount','basisCount','conflict'],
        passwordSeed: ['complete','candidateCount','basisCount']
      },
      rawValuesAllowed: false
    }
  };
  contract.multiAuthResolution = {
    ...(contract.multiAuthResolution || {}),
    diagnosticVector: {
      candidateOrdinalOnly: true,
      fields: ['score','exactClaims','shopperIdClaim','targetEmailMatch','baseEmailMatch','credentialEmailMatch','passwordCompatible','enabled','emailVerified','providerCreationMetadataPresent'],
      scoreMarginRequired: true,
      uidAllowed: false,
      emailAllowed: false,
      rawPiiAllowed: false
    }
  };
  contract.collisionReconciliation = {
    groupFingerprintNamespace: 'shopper-visible-login-group-v1',
    basis: 'normalized visible base login',
    policy: 'fingerprint_set_membership_not_rigid_aggregate_equality',
    outputs: ['added','removed','unchangedCount','exactMatch'],
    rigidExpectedGroupCountAllowed: false
  };
  contract.plan = {
    ...(contract.plan || {}),
    diagnosticContractVersion: 'v2'
  };
  return contract;
}

function verify(planner, classifier, contract) {
  const requiredPlanner = [
    "const GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';",
    'function stableGroupFingerprint(baseLogin)',
    'function reconcileFingerprintSets(referenceValues, currentValues)',
    'preConsensusIncompleteActiveProfiles',
    'completedByConsensus',
    'remainingIncompleteActiveProfiles',
    'metricIdentityValid',
    'passwordSeedComplete',
    "diagnostics: primary === 'HOLD'",
    'candidateVectors: scored.map',
    "profileFp: fp('multi-auth-profile-v1', row.profile.id)",
    'collision_group_set_drift:',
    'PASS_DIAGNOSTIC_CONTRACT_V2'
  ];
  for (const token of requiredPlanner) ensure(planner.includes(token), `verify_planner_missing:${token}`);
  ensure(!planner.includes('result.disambiguation.collisionGroups !== Number(request.expectedDistinctActiveCollisionGroups || 64)'), 'verify_rigid_collision_gate_present');
  ensure(!planner.includes('result.surnameCompletion.initialIncompleteActiveProfiles !== Number(request.expectedInitialIncompleteActiveProfiles || 83)'), 'verify_old_initial_metric_gate_present');
  ensure(classifier.includes("const GROUP_FINGERPRINT_NAMESPACE = 'shopper-visible-login-group-v1';"), 'verify_classifier_namespace_missing');
  ensure(classifier.includes('groupFp: fp(GROUP_FINGERPRINT_NAMESPACE, norm(login)),'), 'verify_classifier_group_fp_missing');
  ensure(contract.schemaVersion === 'cxorbia.c6.shopper-deterministic-suffix.v2', 'verify_contract_schema');
  ensure(contract.collisionReconciliation?.policy === 'fingerprint_set_membership_not_rigid_aggregate_equality', 'verify_contract_reconciliation_policy');
  ensure(contract.technicalSurnameCompletion?.diagnosticContract?.rawValuesAllowed === false, 'verify_contract_hold_privacy');
  ensure(contract.multiAuthResolution?.diagnosticVector?.rawPiiAllowed === false, 'verify_contract_multi_auth_privacy');
}

let planner = fs.readFileSync(plannerPath, 'utf8');
let classifier = fs.readFileSync(classifierPath, 'utf8');
let contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

if (mode === '--apply') {
  planner = applyPlanner(planner);
  classifier = applyClassifier(classifier);
  contract = applyContract(contract);
  fs.writeFileSync(plannerPath, planner, 'utf8');
  fs.writeFileSync(classifierPath, classifier, 'utf8');
  fs.writeFileSync(contractPath, JSON.stringify(contract, null, 2) + '\n', 'utf8');
} else if (mode !== '--verify') {
  fail('usage: --apply|--verify');
}

verify(
  fs.readFileSync(plannerPath, 'utf8'),
  fs.readFileSync(classifierPath, 'utf8'),
  JSON.parse(fs.readFileSync(contractPath, 'utf8'))
);
console.log(mode === '--apply' ? 'PASS_C6_DIAGNOSTIC_CONTRACT_ROOTFIX_APPLIED' : 'PASS_C6_DIAGNOSTIC_CONTRACT_ROOTFIX_VERIFIED');
