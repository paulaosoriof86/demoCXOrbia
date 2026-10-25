#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const requestPath = path.resolve(arg('--request', path.join(repo, 'backend/requests/i3-5b-provider-exact-crosswalk-one-target.json')));
const outPath = path.resolve(arg('--out', path.join(repo, '.tmp/i3-5b-provider-exact-crosswalk/result.json')));
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const str = value => String(value == null ? '' : value).trim();
const sha256 = value => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const currentHead = () => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
const gitOk = args => spawnSync('git', args, { cwd: repo, encoding: 'utf8' }).status === 0;

const SOURCE_KEYS = new Set([
  'sourceShopperId', 'sourceShopperID', 'shopperRefId', 'legacyShopperId', 'legacyShopperID',
  'externalShopperId', 'externalShopperID', 'sourceId', 'sourceRefId'
]);
const CANONICAL_KEYS = new Set([
  'canonicalShopperId', 'profileShopperId', 'shopperProfileId', 'shopperId', 'profileId'
]);
const VISIT_ANCHOR_KEYS = new Set([
  'visitId', 'hrRowId', 'sourceRowId', 'sourceVisitId', 'externalVisitId', 'visitKey', 'technicalVisitId'
]);
const PERIOD_KEYS = new Set(['periodKey', 'periodId', 'projectPeriodId', 'cycleKey', 'monthKey']);
const PROJECT_KEYS = new Set(['projectId', 'projectKey', 'programKey', 'rootProjectId']);

const result = {
  schemaVersion: 'cxorbia.i3.5b.provider-exact-crosswalk-result.v1',
  requestId: null,
  gateId: 'I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET',
  productTargetHeadSha: null,
  executorHeadSha: currentHead(),
  targetProject: 'cxorbia-backend-dev',
  tenantId: 'tya',
  projectId: 'cinepolis',
  periodKey: '2026-08',
  status: 'NOT_STARTED',
  decision: 'NOT_STARTED',
  providerAttempted: false,
  providerAck: false,
  readbackReady: false,
  exactIndependentAuthorityDemonstrated: false,
  canonicalProfileExists: false,
  exactAuthorityRecordCount: 0,
  conflictingAuthorityRecordCount: 0,
  existingRelevantIdentityLinks: 0,
  existingExactAuthorizedLink: false,
  materializedIdentityLink: false,
  authorityType: null,
  authorityEvidenceDigest: null,
  identityLinkDocumentFingerprint: null,
  providerReads: {
    tenantCollectionMetadata: 0,
    canonicalProfileCandidates: 0,
    identityLinks: 0,
    visitDocuments: 0,
    periodDocuments: 0
  },
  firestoreWrites: 0,
  shopperIdentityLinkWrites: 0,
  safety: {
    historicalShopperAccess: 0,
    historicalShopperLogin: 0,
    historicalShopperRecovery: 0,
    historicalShopperReset: 0,
    authReads: 0,
    authWrites: 0,
    userCreates: 0,
    userUpdates: 0,
    passwordChanges: 0,
    passwordResets: 0,
    hrWrites: 0,
    financeWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    makeCalls: 0,
    geminiCalls: 0,
    paymentWrites: 0,
    deploys: 0,
    merge: false,
    production: false
  },
  blockers: [],
  notes: []
};

function block(code) {
  if (!result.blockers.includes(code)) result.blockers.push(code);
}
function save() {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, stableJson(result), 'utf8');
}
function scalarMatchesByKey(value, keys, expected, depth = 0, hits = []) {
  if (!value || typeof value !== 'object' || depth > 5) return hits;
  if (Array.isArray(value)) {
    for (const item of value) scalarMatchesByKey(item, keys, expected, depth + 1, hits);
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (keys.has(key) && str(child) === expected) hits.push(key);
    if (child && typeof child === 'object') scalarMatchesByKey(child, keys, expected, depth + 1, hits);
  }
  return hits;
}
function scalarValuesByKey(value, keys, depth = 0, values = []) {
  if (!value || typeof value !== 'object' || depth > 5) return values;
  if (Array.isArray(value)) {
    for (const item of value) scalarValuesByKey(item, keys, depth + 1, values);
    return values;
  }
  for (const [key, child] of Object.entries(value)) {
    if (keys.has(key) && child != null && typeof child !== 'object') values.push(str(child));
    if (child && typeof child === 'object') scalarValuesByKey(child, keys, depth + 1, values);
  }
  return values;
}
function periodMatches(data, docPath, periodKey) {
  const values = scalarValuesByKey(data, PERIOD_KEYS);
  if (values.some(v => v === periodKey || v === `cinepolis-${periodKey}`)) return true;
  return docPath.includes(periodKey) || docPath.includes(`cinepolis-${periodKey}`);
}
function projectMatches(data, docPath, projectId) {
  const values = scalarValuesByKey(data, PROJECT_KEYS);
  if (values.length && values.some(v => v === projectId)) return true;
  return docPath.split('/').includes(projectId);
}
function independentVisitAnchor(data, doc) {
  const values = scalarValuesByKey(data, VISIT_ANCHOR_KEYS).filter(Boolean);
  if (values.length) return { type: 'explicit_visit_technical_key', digest: sha256(values.sort().join('\u0000')) };
  const id = str(doc.id);
  if (id && id !== request.targetSourceSafeId && id !== request.expectedCanonicalShopperId) {
    return { type: 'provider_document_identity', digest: sha256(doc.ref.path) };
  }
  return null;
}
function exactDualIdentityEvidence(doc, data) {
  if (!periodMatches(data, doc.ref.path, request.periodKey)) return null;
  if (!projectMatches(data, doc.ref.path, request.projectId)) return null;
  const sourceHits = scalarMatchesByKey(data, SOURCE_KEYS, request.targetSourceSafeId);
  if (!sourceHits.length) return null;
  const canonicalHits = scalarMatchesByKey(data, CANONICAL_KEYS, request.expectedCanonicalShopperId);
  if (!canonicalHits.length) return null;
  const anchor = independentVisitAnchor(data, doc);
  if (!anchor) return null;
  return {
    sourceFieldFingerprint: sha256(sourceHits.sort().join('|')),
    canonicalFieldFingerprint: sha256(canonicalHits.sort().join('|')),
    anchorType: anchor.type,
    anchorDigest: anchor.digest,
    recordDigest: sha256(`${doc.ref.path}\u0000${anchor.digest}\u0000${request.targetSourceSafeId}\u0000${request.expectedCanonicalShopperId}`)
  };
}
function exactConflictEvidence(doc, data) {
  if (!periodMatches(data, doc.ref.path, request.periodKey)) return null;
  if (!projectMatches(data, doc.ref.path, request.projectId)) return null;
  const sourceHits = scalarMatchesByKey(data, SOURCE_KEYS, request.targetSourceSafeId);
  if (!sourceHits.length) return null;
  const canonicalValues = [...new Set(scalarValuesByKey(data, CANONICAL_KEYS).filter(Boolean))];
  const conflicting = canonicalValues.filter(v => v !== request.expectedCanonicalShopperId && v !== request.targetSourceSafeId);
  if (!conflicting.length) return null;
  const anchor = independentVisitAnchor(data, doc);
  return anchor ? sha256(`${doc.ref.path}\u0000${anchor.digest}\u0000${conflicting.sort().join('|')}`) : sha256(doc.ref.path);
}

let request;
try {
  request = readJson(requestPath);
  result.requestId = str(request.requestId) || null;
  result.productTargetHeadSha = str(request.productTargetHeadSha) || null;

  const requestValid = request.schemaVersion === 'cxorbia.i3.5b.provider-exact-crosswalk-request.v1'
    && request.enabled === true
    && request.consumed === false
    && request.gateId === result.gateId
    && request.targetProject === 'cxorbia-backend-dev'
    && request.tenantId === 'tya'
    && request.projectId === 'cinepolis'
    && request.periodKey === '2026-08'
    && request.maxProviderWrites === 1
    && request.allowedCollection === 'tenants/tya/shopperIdentityLinks'
    && request.expectedWriteBudget?.firestoreWrites === 1
    && request.expectedWriteBudget?.shopperIdentityLinkWrites === 1
    && request.expectedWriteBudget?.authWrites === 0
    && request.expectedWriteBudget?.passwordResets === 0
    && request.expectedWriteBudget?.historicalShopperAccess === 0
    && request.expectedWriteBudget?.hrWrites === 0
    && request.expectedWriteBudget?.financeWrites === 0
    && request.expectedWriteBudget?.rulesWrites === 0
    && request.expectedWriteBudget?.storageWrites === 0
    && request.expectedWriteBudget?.makeCalls === 0
    && request.expectedWriteBudget?.geminiCalls === 0
    && request.expectedWriteBudget?.paymentWrites === 0
    && request.expectedWriteBudget?.deploys === 0
    && /^[a-f0-9]{40}$/.test(str(request.productTargetHeadSha))
    && /^shp-[a-f0-9]+$/.test(str(request.targetSourceSafeId))
    && /^TYA_[A-Z]{2}_[A-F0-9]+$/.test(str(request.expectedCanonicalShopperId));
  if (!requestValid) block('REQUEST_CONTRACT_INVALID');

  if (!gitOk(['cat-file', '-e', `${request.productTargetHeadSha}^{commit}`])) block('PRODUCT_TARGET_HEAD_NOT_RESOLVABLE');
  if (!gitOk(['merge-base', '--is-ancestor', request.productTargetHeadSha, result.executorHeadSha])) block('PRODUCT_TARGET_HEAD_NOT_ANCESTOR_OF_EXECUTOR');

  const diff = gitOk(['cat-file', '-e', `${request.productTargetHeadSha}^{commit}`])
    ? execFileSync('git', ['diff', '--name-only', `${request.productTargetHeadSha}..${result.executorHeadSha}`], { cwd: repo, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
    : [];
  const allowedExecutorDelta = new Set([
    'tools/migration/tya-i3-5b-provider-exact-crosswalk-one-target.mjs',
    'tools/migration/tya-i3-5b-provider-exact-crosswalk-request-control.mjs',
    'backend/requests/i3-5b-provider-exact-crosswalk-one-target.json',
    '.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml'
  ]);
  const unexpectedDelta = diff.filter(file => !allowedExecutorDelta.has(file));
  if (unexpectedDelta.length) block('UNEXPECTED_PRODUCT_DELTA_AFTER_AUTHORIZED_HEAD');

  if (result.blockers.length) {
    result.status = 'BLOCKED_PRE_PROVIDER';
    result.decision = 'HOLD_I3_5B_PRE_PROVIDER_CONTRACT';
    save();
    process.exit(0);
  }

  result.providerAttempted = true;
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: 'cxorbia-backend-dev' });
  const db = getFirestore(app);
  const tenantRef = db.collection('tenants').doc('tya');

  const tenantCollections = await tenantRef.listCollections();
  result.providerReads.tenantCollectionMetadata = tenantCollections.length;

  const profilePaths = [
    `tenants/tya/shoppers/${request.expectedCanonicalShopperId}`,
    `tenants/tya/shopperProfiles/${request.expectedCanonicalShopperId}`,
    `tenants/tya/profiles/${request.expectedCanonicalShopperId}`,
    `tenants/tya/projects/cinepolis/shoppers/${request.expectedCanonicalShopperId}`,
    `tenants/tya/projects/cinepolis/shopperProfiles/${request.expectedCanonicalShopperId}`
  ];
  for (const candidatePath of profilePaths) {
    const snap = await db.doc(candidatePath).get();
    result.providerReads.canonicalProfileCandidates += 1;
    if (snap.exists) result.canonicalProfileExists = true;
  }

  const linkCollection = db.collection('tenants/tya/shopperIdentityLinks');
  const linkSnap = await linkCollection.get();
  result.providerReads.identityLinks = linkSnap.size;
  const relevantLinks = [];
  const conflictingLinks = [];
  for (const doc of linkSnap.docs) {
    const data = doc.data() || {};
    const sourceMatch = scalarMatchesByKey(data, SOURCE_KEYS, request.targetSourceSafeId).length > 0;
    if (!sourceMatch) continue;
    relevantLinks.push(doc);
    const canonicalExpected = scalarMatchesByKey(data, CANONICAL_KEYS, request.expectedCanonicalShopperId).length > 0;
    if (!canonicalExpected) conflictingLinks.push(doc);
  }
  result.existingRelevantIdentityLinks = relevantLinks.length;
  if (conflictingLinks.length) block('EXISTING_IDENTITY_LINK_CONFLICT');

  const exactExisting = relevantLinks.find(doc => {
    const data = doc.data() || {};
    const canonicalExpected = scalarMatchesByKey(data, CANONICAL_KEYS, request.expectedCanonicalShopperId).length > 0;
    const independent = Boolean(str(data.independentAnchorDigest))
      && ['exact_visit_identity_provider', 'exact_provider_identity_link', 'exact_technical_anchor_provider'].includes(str(data.authorityType));
    return canonicalExpected && independent;
  });
  if (exactExisting) {
    const data = exactExisting.data() || {};
    result.existingExactAuthorizedLink = true;
    result.exactIndependentAuthorityDemonstrated = true;
    result.authorityType = str(data.authorityType);
    result.authorityEvidenceDigest = str(data.independentAnchorDigest);
    result.identityLinkDocumentFingerprint = sha256(exactExisting.ref.path);
    result.providerAck = true;
    result.readbackReady = true;
    result.status = 'PASS_EXISTING_EXACT_LINK_READBACK';
    result.decision = 'PASS_I3_5B_EXISTING_PROVIDER_EXACT_CROSSWALK';
    save();
    process.exit(0);
  }

  const visitDocs = new Map();
  const addVisitCollection = async collectionRef => {
    const snap = await collectionRef.get();
    for (const doc of snap.docs) visitDocs.set(doc.ref.path, doc);
  };

  const tenantVisitCollections = tenantCollections.filter(c => /visit/i.test(c.id));
  for (const collectionRef of tenantVisitCollections) await addVisitCollection(collectionRef);

  const projectsRef = tenantRef.collection('projects');
  const projectRef = projectsRef.doc('cinepolis');
  const projectSnap = await projectRef.get();
  if (projectSnap.exists) {
    const projectCollections = await projectRef.listCollections();
    result.providerReads.tenantCollectionMetadata += projectCollections.length;
    for (const collectionRef of projectCollections.filter(c => /visit/i.test(c.id))) await addVisitCollection(collectionRef);
    const periodCollections = projectCollections.filter(c => /period/i.test(c.id));
    for (const periodCollection of periodCollections) {
      const periods = await periodCollection.get();
      result.providerReads.periodDocuments += periods.size;
      for (const periodDoc of periods.docs) {
        const pdata = periodDoc.data() || {};
        if (!periodMatches(pdata, periodDoc.ref.path, request.periodKey)) continue;
        const nested = await periodDoc.ref.listCollections();
        result.providerReads.tenantCollectionMetadata += nested.length;
        for (const collectionRef of nested.filter(c => /visit/i.test(c.id))) await addVisitCollection(collectionRef);
      }
    }
  }

  // Explicit canonical paths are attempted even when collection metadata is sparse.
  for (const explicitPath of ['tenants/tya/visits', 'tenants/tya/projects/cinepolis/visits']) {
    try { await addVisitCollection(db.collection(explicitPath)); } catch { /* fail closed below if no authority */ }
  }

  result.providerReads.visitDocuments = visitDocs.size;
  const exactEvidence = [];
  const conflictingEvidence = [];
  for (const doc of visitDocs.values()) {
    const data = doc.data() || {};
    const exact = exactDualIdentityEvidence(doc, data);
    if (exact) exactEvidence.push(exact);
    const conflict = exactConflictEvidence(doc, data);
    if (conflict) conflictingEvidence.push(conflict);
  }
  result.exactAuthorityRecordCount = exactEvidence.length;
  result.conflictingAuthorityRecordCount = conflictingEvidence.length;
  if (conflictingEvidence.length) block('CONFLICTING_PROVIDER_CANONICAL_AUTHORITY');
  if (!result.canonicalProfileExists) block('EXPECTED_CANONICAL_PROFILE_NOT_FOUND_IN_ALLOWED_PROVIDER_PATHS');
  if (!exactEvidence.length) block('NO_INDEPENDENT_EXACT_PROVIDER_AUTHORITY_FOR_AUGUST_TARGET');

  if (result.blockers.length) {
    result.status = 'SAFE_HOLD_ZERO_WRITES';
    result.decision = result.blockers.includes('NO_INDEPENDENT_EXACT_PROVIDER_AUTHORITY_FOR_AUGUST_TARGET')
      ? 'HOLD_I3_5B_NO_INDEPENDENT_PROVIDER_AUTHORITY'
      : 'HOLD_I3_5B_PROVIDER_VALIDATION_FAILED';
    result.notes.push('Provider validation completed fail-closed; request is consumed without retry and without materialization.');
    save();
    process.exit(0);
  }

  result.exactIndependentAuthorityDemonstrated = true;
  result.authorityType = 'exact_visit_identity_provider';
  result.authorityEvidenceDigest = sha256(exactEvidence.map(e => e.recordDigest).sort().join('\u0000'));
  const docId = `i35b_${sha256(`tya\u0000cinepolis\u0000${request.targetSourceSafeId}`).slice(0, 32)}`;
  const linkRef = linkCollection.doc(docId);
  const payload = {
    schemaVersion: 'cxorbia.shopper-identity-link.v1',
    tenantId: 'tya',
    projectId: 'cinepolis',
    sourceSystem: 'tya_hr_source_safe',
    sourceShopperId: request.targetSourceSafeId,
    canonicalShopperId: request.expectedCanonicalShopperId,
    authorityType: 'exact_visit_identity_provider',
    independentAnchorType: exactEvidence.length > 1 ? 'provider_exact_visit_set' : exactEvidence[0].anchorType,
    independentAnchorDigest: result.authorityEvidenceDigest,
    periodKey: request.periodKey,
    gateId: result.gateId,
    requestId: request.requestId,
    productTargetHeadSha: request.productTargetHeadSha,
    materializedAt: FieldValue.serverTimestamp(),
    sourceSafe: true,
    fuzzyMatching: false,
    piiAuthorityUsed: false
  };

  await db.runTransaction(async tx => {
    const current = await tx.get(linkRef);
    if (current.exists) throw new Error('DETERMINISTIC_IDENTITY_LINK_ALREADY_EXISTS');
    tx.create(linkRef, payload);
  });
  result.firestoreWrites = 1;
  result.shopperIdentityLinkWrites = 1;
  result.materializedIdentityLink = true;
  result.providerAck = true;
  result.identityLinkDocumentFingerprint = sha256(linkRef.path);

  const readback = await linkRef.get();
  if (!readback.exists) block('PROVIDER_READBACK_MISSING_AFTER_COMMIT');
  else {
    const data = readback.data() || {};
    const readbackExact = str(data.sourceShopperId) === request.targetSourceSafeId
      && str(data.canonicalShopperId) === request.expectedCanonicalShopperId
      && str(data.authorityType) === 'exact_visit_identity_provider'
      && str(data.independentAnchorDigest) === result.authorityEvidenceDigest
      && data.fuzzyMatching === false
      && data.piiAuthorityUsed === false;
    if (!readbackExact) block('PROVIDER_READBACK_MISMATCH');
    else result.readbackReady = true;
  }

  if (result.firestoreWrites !== 1 || result.shopperIdentityLinkWrites !== 1) block('WRITE_BUDGET_MISMATCH');
  if (result.safety.authWrites !== 0 || result.safety.passwordResets !== 0 || result.safety.historicalShopperAccess !== 0) block('FORBIDDEN_IDENTITY_SIDE_EFFECT');

  result.status = result.blockers.length ? 'WRITE_COMMITTED_READBACK_FAILED' : 'PASS_COMMITTED_READBACK';
  result.decision = result.blockers.length ? 'HOLD_I3_5B_WRITE_COMMITTED_READBACK_NOT_CERTIFIED' : 'PASS_I3_5B_PROVIDER_EXACT_CROSSWALK_MATERIALIZED';
  save();
  process.exit(0);
} catch (error) {
  block(str(error?.code || error?.message || 'UNEXPECTED_EXECUTOR_FAILURE'));
  if (result.firestoreWrites === 0) {
    result.status = 'SAFE_HOLD_ZERO_WRITES';
    result.decision = 'HOLD_I3_5B_EXECUTOR_ERROR_ZERO_WRITES';
  } else {
    result.status = 'WRITE_COMMITTED_EXECUTOR_ERROR';
    result.decision = 'HOLD_I3_5B_WRITE_COMMITTED_NOT_CERTIFIED';
  }
  save();
  process.exit(0);
}
