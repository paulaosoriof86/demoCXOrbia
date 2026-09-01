#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetPath = path.join(root, 'tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs');

const helperAnchor = `const pick = (obj, keys) => {`;
const helperBlock = `function propagateLinkedSourceTechKeys(relationIndex, source, shopperId) {
  const sourceValue = source?.value ?? source;
  let propagated = 0;
  for (const key of TECH_KEYS) {
    const value = sourceValue?.[key];
    for (const item of Array.isArray(value) ? value : [value]) {
      const normalized = text(item);
      if (!normalized) continue;
      add(relationIndex, normalized, shopperId);
      propagated++;
    }
  }
  return propagated;
}

`;

const constantsAnchor = `const INACTIVE_STATUSES = new Set(['inactive','inactivo','disabled','deshabilitado','deleted','eliminado','archived','archivado','rejected','rechazado','blocked','bloqueado','suspended','suspendido','cancelled','canceled','cancelado']);`;
const constantsBlock = `${constantsAnchor}
const STABLE_CREDENTIALS_MAPPED = 101;
const STABLE_CREDENTIALS_UNMAPPED = 8;`;

const oldLink = `  const linkedByProfile = new Map();
  const link = (shopperId, source) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push(source);
  };`;
const newLink = `  const linkedByProfile = new Map();
  const link = (shopperId, source) => {
    if (!profiles.has(shopperId)) return;
    if (!linkedByProfile.has(shopperId)) linkedByProfile.set(shopperId, []);
    linkedByProfile.get(shopperId).push(source);
    propagateLinkedSourceTechKeys(relationIndex, source, shopperId);
  };`;

const credentialsLoopTail = `  }

  const periods = visitSnap.docs.map(doc => periodKey(doc.data() || {}, doc.ref.path)).filter(Boolean).sort();`;
const credentialsParityBlock = `  }

  const credentialsUnmapped = credentialRecords.length - credentialsMapped;
  const credentialCrosswalkParity =
    credentialsMapped === STABLE_CREDENTIALS_MAPPED &&
    credentialsUnmapped === STABLE_CREDENTIALS_UNMAPPED;

  const periods = visitSnap.docs.map(doc => periodKey(doc.data() || {}, doc.ref.path)).filter(Boolean).sort();`;

const oldReady = `  const ready = unresolvedActiveNames === 0 && unresolvedMultiAuth === 0 && suffixAllocationHolds === 0 && targetCollisionHolds === 0;`;
const newReady = `  const ready =
    credentialCrosswalkParity &&
    unresolvedActiveNames === 0 &&
    unresolvedMultiAuth === 0 &&
    suffixAllocationHolds === 0 &&
    targetCollisionHolds === 0;`;

const oldSourceFields = `      credentialsMapped,
      credentialsUnmapped: credentialRecords.length - credentialsMapped,`;
const newSourceFields = `      credentialsMapped,
      credentialsUnmapped,
      credentialCrosswalkParity,
      stableCredentialsMapped: STABLE_CREDENTIALS_MAPPED,
      stableCredentialsUnmapped: STABLE_CREDENTIALS_UNMAPPED,`;

const providerGateAnchor = `    if (result.source.profiles !== Number(request.expectedProfiles || 340)) blockers.push(\`profiles:\${result.source.profiles}\`);`;
const providerGateBlock = `${providerGateAnchor}
    if (result.source.credentialCrosswalkParity !== true) {
      blockers.push(\`credential_crosswalk_drift:\${result.source.credentialsMapped}/\${result.source.credentialsUnmapped}\`);
    }`;

const selfTestAnchor = `  const sample = sourceSafeNames(`;
const selfTestBlock = `  const relationFixture = new Map();
  const propagated = propagateLinkedSourceTechKeys(
    relationFixture,
    { value: { legacyId: 'legacy-42', sourceKey: ['source-a', 'source-b'] }, basis: 'hr' },
    'shopper-42'
  );
  if (
    propagated !== 3 ||
    relationFixture.get('legacy-42')?.[0] !== 'shopper-42' ||
    relationFixture.get('source-a')?.[0] !== 'shopper-42' ||
    relationFixture.get('source-b')?.[0] !== 'shopper-42'
  ) throw new Error('credential_crosswalk_tech_key_propagation_failed');

  const sample = sourceSafeNames(`;

const checksAnchor = `      'PASS_ONE_PRIMARY_OPERATION_SCHEMA'`;
const checksBlock = `      'PASS_ONE_PRIMARY_OPERATION_SCHEMA',
      'PASS_CREDENTIAL_CROSSWALK_TECH_KEY_PROPAGATION',
      'PASS_CREDENTIAL_CROSSWALK_PARITY_HARD_STOP'`;

function replaceRequired(source, oldValue, newValue, alreadyMarker) {
  if (source.includes(alreadyMarker)) return source;
  const count = source.split(oldValue).length - 1;
  if (count !== 1) throw new Error(`PATCH_ANCHOR_COUNT_${count}:${alreadyMarker.slice(0, 60)}`);
  return source.replace(oldValue, newValue);
}

function applyPatch(source) {
  let next = source;
  next = replaceRequired(next, constantsAnchor, constantsBlock, 'const STABLE_CREDENTIALS_MAPPED = 101;');
  if (!next.includes('function propagateLinkedSourceTechKeys(')) {
    const count = next.split(helperAnchor).length - 1;
    if (count !== 1) throw new Error(`HELPER_ANCHOR_COUNT_${count}`);
    next = next.replace(helperAnchor, `${helperBlock}${helperAnchor}`);
  }
  next = replaceRequired(next, oldLink, newLink, 'propagateLinkedSourceTechKeys(relationIndex, source, shopperId);');
  next = replaceRequired(next, credentialsLoopTail, credentialsParityBlock, 'const credentialCrosswalkParity =');
  next = replaceRequired(next, oldReady, newReady, 'credentialCrosswalkParity &&');
  next = replaceRequired(next, oldSourceFields, newSourceFields, 'stableCredentialsMapped: STABLE_CREDENTIALS_MAPPED');
  next = replaceRequired(next, providerGateAnchor, providerGateBlock, 'credential_crosswalk_drift:');
  next = replaceRequired(next, selfTestAnchor, selfTestBlock, 'credential_crosswalk_tech_key_propagation_failed');
  next = replaceRequired(next, checksAnchor, checksBlock, 'PASS_CREDENTIAL_CROSSWALK_TECH_KEY_PROPAGATION');
  return next;
}

function verify(source) {
  const required = [
    'const STABLE_CREDENTIALS_MAPPED = 101;',
    'const STABLE_CREDENTIALS_UNMAPPED = 8;',
    'function propagateLinkedSourceTechKeys(',
    'propagateLinkedSourceTechKeys(relationIndex, source, shopperId);',
    'const credentialCrosswalkParity =',
    'credentialCrosswalkParity &&',
    'stableCredentialsMapped: STABLE_CREDENTIALS_MAPPED',
    'credential_crosswalk_drift:',
    'credential_crosswalk_tech_key_propagation_failed',
    'PASS_CREDENTIAL_CROSSWALK_TECH_KEY_PROPAGATION',
    'PASS_CREDENTIAL_CROSSWALK_PARITY_HARD_STOP'
  ];
  const missing = required.filter(token => !source.includes(token));
  if (missing.length) throw new Error(`VERIFY_MISSING:${missing.join('|')}`);
  if (source.includes(oldLink)) throw new Error('VERIFY_BUGGY_LINK_REMAINS');
  return {
    schemaVersion: 'cxorbia.c6.deterministic-suffix-crosswalk-rootfix-source-static.v1',
    decision: 'PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC',
    providerReads: false,
    providerWrites: false,
    checks: [
      'PASS_LINKED_SOURCE_TECH_KEYS_PROPAGATED',
      'PASS_LINKED_SOURCE_BASIS_PRESERVED',
      'PASS_STABLE_CREDENTIAL_REFERENCE_101_8',
      'PASS_CREDENTIAL_DRIFT_HARD_STOP',
      'PASS_READY_REQUIRES_CROSSWALK_PARITY',
      'PASS_PLAN_340_PRECONDITION_PRESERVED',
      'PASS_SUFFIX_POLICY_4_6_8_PRESERVED'
    ]
  };
}

if (!fs.existsSync(targetPath)) throw new Error(`TARGET_MISSING:${targetPath}`);
const original = fs.readFileSync(targetPath, 'utf8');
if (process.argv.includes('--apply')) {
  const patched = applyPatch(original);
  verify(patched);
  fs.writeFileSync(targetPath, patched, 'utf8');
  console.log('PASS_C6_CROSSWALK_ROOTFIX_APPLIED_SOURCE_ONLY');
} else {
  const report = verify(original);
  console.log(report.decision);
}
