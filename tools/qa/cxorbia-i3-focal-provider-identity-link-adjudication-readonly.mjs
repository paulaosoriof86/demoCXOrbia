#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const ROOT = process.cwd();
const REQUEST_PATH = process.argv[2] || '.github/cxorbia-gate-requests/request.json';
const DETAIL_DIR = path.join(ROOT, '.tmp/i3-focal-provider-identity-link-adjudication');
const DETAIL_REPORT = path.join(DETAIL_DIR, 'report.json');
const RUNNER_DIR = path.join(ROOT, '.tmp/cxorbia-readonly-post-gates-runner');
const RUNNER_REPORT = path.join(RUNNER_DIR, 'report.json');
const EXPECTED_PROFILE = 'I3_FOCAL_PROVIDER_IDENTITY_LINK_ADJUDICATION_READONLY';
const EXPECTED_PROJECT = 'cxorbia-backend-dev';
const EXPECTED_TENANT = 'tya';
const EXPECTED_PROJECT_ID = 'cinepolis';
const EXPECTED_COLLECTION = 'tenants/tya/shopperIdentityLinks';
const EXPECTED_PRIOR_LINK_ID = 'irl_3ed1b9a65d36c5873c1306bae1621e9d';
const EXPECTED_TARGET_LIVE = 'shp-57d2e3769946';
const EXPECTED_CANONICAL = 'TYA_GT_0C0BA8856E';
const ACTIVE_STATES = new Set(['active','confirmed','approved','materialized']);
const sha256 = value => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const str = value => String(value == null ? '' : value).trim();
const norm = value => str(value).toLowerCase();
const uniq = values => [...new Set((Array.isArray(values) ? values : []).map(str).filter(Boolean))].sort();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/^\uFEFF/, ''));
}
function safeError(error) {
  const raw = String(error?.message || error || 'UNKNOWN');
  return { code: (raw.split(':')[0] || 'UNKNOWN').replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 120), fingerprint: sha256(raw).slice(0, 24) };
}
function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}
function verify(condition, code) {
  if (!condition) throw new Error(code);
}
function structuralView(id, data = {}) {
  const aliases = uniq([
    ...(Array.isArray(data.sourceIdentityAliases) ? data.sourceIdentityAliases : []),
    ...(Array.isArray(data.sourceAliases) ? data.sourceAliases : []),
    ...(Array.isArray(data.aliases) ? data.aliases : [])
  ]);
  return {
    id,
    tenantId: str(data.tenantId || data.scope?.tenantId),
    projectId: str(data.projectId),
    projectScope: str(data.projectScope || data.scope?.projectId || data.projectId || '*'),
    sourceSystem: norm(data.sourceSystem || data.sourceNamespace || data.sourceType || data.sourceIdentity?.sourceSystem),
    sourceIdentityKey: str(data.sourceIdentityKey || data.sourceIdentity?.sourceIdentityKey),
    sourceIdentityAliases: aliases,
    canonicalShopperId: str(data.canonicalShopperId || data.canonicalId || data.shopperId || data.profileId),
    status: norm(data.status || data.state),
    authorityType: norm(data.authorityType || data.authority?.type),
    authorityRefPresent: Boolean(str(data.authorityRef || data.authority?.evidenceRef || data.authority?.adjudicationId || data.authority?.providerRef || data.authority?.commandId || data.providerAckRef || data.adjudicationId || data.commandId || data.idempotencyKey || id)),
    periodIndependent: data.periodIndependent === true,
    hasPeriodScope: Boolean(data.periodKey || data.periodId || data.periodScope),
    sourceSafe: data.sourceSafe === true
  };
}
function expectedStructuralView() {
  return {
    id: EXPECTED_PRIOR_LINK_ID,
    tenantId: EXPECTED_TENANT,
    projectId: EXPECTED_PROJECT_ID,
    projectScope: EXPECTED_PROJECT_ID,
    sourceSystem: 'hr',
    sourceIdentityKey: EXPECTED_TARGET_LIVE,
    sourceIdentityAliases: [EXPECTED_TARGET_LIVE],
    canonicalShopperId: EXPECTED_CANONICAL,
    status: 'materialized',
    authorityType: 'tenant_adjudication',
    authorityRefPresent: true,
    periodIndependent: true,
    hasPeriodScope: false,
    sourceSafe: true
  };
}
function fieldDiff(actual, expected) {
  const keys = ['tenantId','projectId','projectScope','sourceSystem','sourceIdentityKey','canonicalShopperId','status','authorityType','authorityRefPresent','periodIndependent','hasPeriodScope','sourceSafe'];
  const diff = [];
  for (const key of keys) if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key])) diff.push({ field: key, expected: expected[key], actual: actual[key] });
  if (!actual.sourceIdentityAliases.includes(EXPECTED_TARGET_LIVE)) diff.push({ field: 'sourceIdentityAliases', expectedContains: EXPECTED_TARGET_LIVE, actualContains: false });
  return diff;
}
function classify(exactExists, actual, normalized, diff) {
  if (!exactExists) return 'deleted';
  if (!ACTIVE_STATES.has(actual.status)) return 'deactivated';
  if (actual.tenantId !== EXPECTED_TENANT || actual.projectScope !== EXPECTED_PROJECT_ID || (actual.projectId && actual.projectId !== EXPECTED_PROJECT_ID)) return 're_scoped';
  const mutationFields = new Set(['sourceSystem','sourceIdentityKey','sourceIdentityAliases','canonicalShopperId','authorityType','authorityRefPresent','periodIndependent','hasPeriodScope','sourceSafe']);
  if (diff.some(item => mutationFields.has(item.field))) return 'mutated';
  if (!normalized?.ok) return 'intact_but_nonapplicable';
  return 'intact_and_applicable_provider_state';
}
function writeReports(detail, runner) {
  fs.mkdirSync(DETAIL_DIR, { recursive: true });
  fs.mkdirSync(RUNNER_DIR, { recursive: true });
  fs.writeFileSync(DETAIL_REPORT, `${JSON.stringify(detail, null, 2)}\n`, 'utf8');
  fs.writeFileSync(RUNNER_REPORT, `${JSON.stringify(runner, null, 2)}\n`, 'utf8');
}

const eventName = process.env.GITHUB_EVENT_NAME || 'local';
const currentHead = git('rev-parse', 'HEAD');
let request = null;
let detail = {
  schemaVersion: 'cxorbia.i3.focal-provider-identity-link-adjudication-readonly-result.v1',
  generatedAt: new Date().toISOString(),
  requestId: null,
  profile: EXPECTED_PROFILE,
  eventName,
  currentHead,
  sourceTruthHeadSha: null,
  sourceTruthSyncEpoch: null,
  targetProject: EXPECTED_PROJECT,
  tenantId: EXPECTED_TENANT,
  projectId: EXPECTED_PROJECT_ID,
  collection: EXPECTED_COLLECTION,
  priorIdentityLinkId: EXPECTED_PRIOR_LINK_ID,
  targetLiveShopperId: EXPECTED_TARGET_LIVE,
  expectedCanonicalShopperId: EXPECTED_CANONICAL,
  status: 'NOT_STARTED',
  decision: 'NOT_STARTED',
  adjudication: null,
  exactPriorDocument: null,
  currentApplicableProviderSet: null,
  fieldDiff: [],
  providerReads: { exactPriorDocument: 0, identityLinkCollectionObservations: 0, documentsObserved: 0 },
  providerWrites: 0,
  safety: {
    authReads: 0, authWrites: 0, userCreates: 0, userUpdates: 0, passwordChanges: 0, passwordResets: 0,
    firestoreDataWrites: 0, rulesDeploys: 0, hostingDeploys: 0, cloudRunDeploys: 0, hrWrites: 0,
    storageWrites: 0, makeCalls: 0, geminiCalls: 0, paymentWrites: 0, historicalShopperAccess: 0,
    merge: false, production: false, automaticRetry: false
  },
  checks: [], blockers: [], nextFrontierRecommendation: null
};
let exitCode = 0;
try {
  request = readJson(REQUEST_PATH);
  detail.requestId = request.requestId || null;
  detail.sourceTruthHeadSha = request.sourceTruthHeadSha || null;
  detail.sourceTruthSyncEpoch = request.sourceTruthSyncEpoch || null;
  verify(request.schemaVersion === 'cxorbia.i3.focal-provider-identity-link-readonly-request.v1', 'REQUEST_SCHEMA_MISMATCH');
  verify(request.enabled === true && request.consumed === false, 'REQUEST_NOT_ENABLED_OR_ALREADY_CONSUMED');
  verify(request.profile === EXPECTED_PROFILE, 'REQUEST_PROFILE_MISMATCH');
  verify(request.allowedExecutions === 1 && request.noAutomaticRetry === true, 'REQUEST_SINGLE_USE_CONTRACT_MISMATCH');
  verify(request.executeOnlyOnEvent === 'push', 'REQUEST_EVENT_CONTRACT_MISMATCH');
  verify(request.repository === 'paulaosoriof86/demoCXOrbia' && request.branch === 'docs-tya-v6-v71-audit' && request.pullRequest === 7, 'REQUEST_REPO_LANE_MISMATCH');
  verify(request.providerProjectId === EXPECTED_PROJECT && request.tenantId === EXPECTED_TENANT && request.projectId === EXPECTED_PROJECT_ID, 'REQUEST_PROVIDER_SCOPE_MISMATCH');
  verify(request.allowedCollection === EXPECTED_COLLECTION, 'REQUEST_COLLECTION_MISMATCH');
  verify(request.priorIdentityLinkId === EXPECTED_PRIOR_LINK_ID && request.targetLiveShopperId === EXPECTED_TARGET_LIVE && request.expectedCanonicalShopperId === EXPECTED_CANONICAL, 'REQUEST_TARGET_MISMATCH');
  verify(request.providerReads === true && request.providerWrites === false, 'REQUEST_PROVIDER_READONLY_MISMATCH');
  verify(request.safeState?.firestoreWrites === false && request.safeState?.authWrites === false && request.safeState?.hrWrites === false && request.safeState?.storageWrites === false, 'REQUEST_WRITE_SAFETY_MISMATCH');
  verify(request.safeState?.deploy === false && request.safeState?.merge === false && request.safeState?.production === false, 'REQUEST_RELEASE_SAFETY_MISMATCH');
  verify(request.historicalShopperAccess === false && request.passwordChanges === 0 && request.passwordResets === 0 && request.userCreates === 0 && request.userUpdates === 0, 'REQUEST_IDENTITY_SAFETY_MISMATCH');
  verify(/^[a-f0-9]{40}$/.test(str(request.sourceTruthHeadSha)), 'REQUEST_SOURCE_TRUTH_HEAD_INVALID');
  git('merge-base', '--is-ancestor', request.sourceTruthHeadSha, currentHead);
  const delta = git('diff', '--name-only', `${request.sourceTruthHeadSha}..${currentHead}`).split(/\r?\n/).filter(Boolean);
  const allowedDelta = new Set([
    '.github/cxorbia-gate-requests/request.json',
    '.github/workflows/cxorbia-readonly-post-gates-runner.yml',
    'tools/qa/cxorbia-i3-focal-provider-identity-link-adjudication-readonly.mjs'
  ]);
  verify(delta.every(file => allowedDelta.has(file)), `REQUEST_SOURCE_DELTA_OUT_OF_SCOPE:${delta.filter(file => !allowedDelta.has(file)).join(',')}`);
  detail.checks.push('SOURCE_TRUTH_HEAD_ANCESTOR_AND_DELTA_FOCAL');

  const verifier = spawnSync('node', ['tools/verify-cxorbia-source-truth-sync.mjs'], { cwd: ROOT, encoding: 'utf8', env: process.env });
  verify(verifier.status === 0, `SOURCE_TRUTH_VERIFIER_FAILED:${sha256(String(verifier.stdout || '') + String(verifier.stderr || '')).slice(0,24)}`);
  detail.checks.push('PASS_SOURCE_TRUTH_SYNC_BEFORE_PROVIDER_READ');

  if (eventName !== 'push') {
    detail.status = 'PASS_READONLY_POST_GATES';
    detail.decision = 'PASS_SKIPPED_NON_AUTHORIZED_EVENT_ZERO_PROVIDER_READS';
    detail.nextFrontierRecommendation = 'WAIT_FOR_AUTHORIZED_PUSH_EXECUTION';
  } else {
    const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    verify(credentialPath && fs.existsSync(credentialPath), 'EPHEMERAL_SERVICE_ACCOUNT_MISSING');
    const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
    verify(credential?.type === 'service_account' && credential?.project_id === EXPECTED_PROJECT && credential?.client_email && credential?.private_key, 'EPHEMERAL_SERVICE_ACCOUNT_INVALID');
    detail.checks.push('EXACT_DEV_PROVIDER_CREDENTIAL_READY');

    const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: EXPECTED_PROJECT });
    const db = getFirestore(app);
    const col = db.collection('tenants').doc(EXPECTED_TENANT).collection('shopperIdentityLinks');
    const exactSnap = await col.doc(EXPECTED_PRIOR_LINK_ID).get();
    detail.providerReads.exactPriorDocument = 1;
    const collectionSnap = await col.get();
    detail.providerReads.identityLinkCollectionObservations = 1;
    detail.providerReads.documentsObserved = collectionSnap.size;

    await import(pathToFileURL(path.join(ROOT, 'app/adapters/cxorbia-identity-roll-forward-v1.js')).href);
    const contract = globalThis.CX_IDENTITY_ROLL_FORWARD_CONTRACT;
    verify(contract?.version === 'cxorbia-identity-roll-forward-v1', 'IDENTITY_ROLL_FORWARD_CONTRACT_NOT_AVAILABLE');

    const rows = collectionSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    const index = contract.buildIndex(rows);
    const trusted = index.records || [];
    const rejected = index.rejected || [];
    const uniqueTrusted = trusted.length === 1 ? trusted[0] : null;
    detail.currentApplicableProviderSet = {
      documentsObserved: rows.length,
      trustedApplicableCount: trusted.length,
      rejectedCount: rejected.length,
      uniqueTrustedLink: uniqueTrusted ? {
        id: uniqueTrusted.id,
        tenantId: uniqueTrusted.tenantId,
        projectScope: uniqueTrusted.projectScope,
        sourceSystem: uniqueTrusted.sourceSystem,
        canonicalShopperId: uniqueTrusted.canonicalShopperId,
        authorityType: uniqueTrusted.authorityType,
        status: uniqueTrusted.status,
        sourceTokens: uniq(uniqueTrusted.sourceTokens)
      } : null,
      rejected: rejected.map(item => ({ id: item.id, reason: item.reason }))
    };

    const expected = expectedStructuralView();
    if (exactSnap.exists) {
      const actualData = exactSnap.data() || {};
      const actual = structuralView(exactSnap.id, actualData);
      const normalized = contract.normalizeLink({ id: exactSnap.id, ...actualData });
      const diff = fieldDiff(actual, expected);
      detail.exactPriorDocument = {
        exists: true,
        structural: actual,
        normalizedApplicable: normalized.ok === true,
        normalizedReason: normalized.ok ? 'applicable' : normalized.reason,
        pathFingerprint: sha256(exactSnap.ref.path)
      };
      detail.fieldDiff = diff;
      detail.adjudication = classify(true, actual, normalized, diff);
    } else {
      detail.exactPriorDocument = { exists: false, structural: null, normalizedApplicable: false, normalizedReason: 'missing_document', pathFingerprint: sha256(col.doc(EXPECTED_PRIOR_LINK_ID).path) };
      detail.fieldDiff = [{ field: 'document', expected: 'present', actual: 'missing' }];
      detail.adjudication = 'deleted';
    }

    verify(['deleted','deactivated','re_scoped','mutated','intact_but_nonapplicable','intact_and_applicable_provider_state'].includes(detail.adjudication), 'ADJUDICATION_UNCLASSIFIED');
    detail.checks.push(`ADJUDICATED_${detail.adjudication.toUpperCase()}`);
    if (trusted.length !== 1) detail.blockers.push(`CURRENT_APPLICABLE_LINK_COUNT_${trusted.length}_EXPECTED_1_FROM_PRIOR_RUNTIME`);

    if (detail.adjudication === 'intact_and_applicable_provider_state') {
      detail.nextFrontierRecommendation = 'RUNTIME_APPLICABILITY_OR_STALENESS_DIAGNOSTIC_NO_PROVIDER_WRITE';
    } else {
      detail.nextFrontierRecommendation = `EXACT_PROVIDER_IDENTITY_LINK_CORRECTION_GATE_REQUIRED_${detail.adjudication.toUpperCase()}`;
    }
    detail.status = 'PASS_READONLY_POST_GATES';
    detail.decision = 'PASS_I3_FOCAL_PROVIDER_IDENTITY_LINK_ADJUDICATION_READONLY';
  }
} catch (error) {
  detail.status = 'HOLD_READONLY_POST_GATES';
  detail.decision = 'HOLD_I3_FOCAL_PROVIDER_IDENTITY_LINK_ADJUDICATION_READONLY';
  detail.blockers.push(safeError(error));
  exitCode = 2;
}

const runner = {
  schemaVersion: 'cxorbia.readonly-post-gates-runner.report.v1',
  runner: 'CXORBIA_READONLY_POST_GATES_RUNNER',
  generatedAt: detail.generatedAt,
  status: detail.status,
  repository: process.env.GITHUB_REPOSITORY || 'paulaosoriof86/demoCXOrbia',
  branch: process.env.GITHUB_REF_NAME || 'docs-tya-v6-v71-audit',
  requestPath: REQUEST_PATH,
  requestId: detail.requestId,
  requestCommitSha: currentHead,
  targetHeadSha: request?.sourceTruthHeadSha || null,
  profile: EXPECTED_PROFILE,
  profileDefinition: { browserRequired: false, providerReadOnly: true, focalIdentityLinkAdjudication: true },
  checks: detail.checks,
  blockers: detail.blockers,
  commands: ['node tools/verify-cxorbia-source-truth-sync.mjs', eventName === 'push' ? 'firebase-admin: exact doc + tenant identity-link collection read' : 'provider read skipped on non-push'],
  artifacts: ['.tmp/i3-focal-provider-identity-link-adjudication/report.json'],
  summary: {
    decision: detail.decision,
    adjudication: detail.adjudication,
    providerReads: detail.providerReads,
    providerWrites: 0,
    nextFrontierRecommendation: detail.nextFrontierRecommendation,
    eventName
  },
  safeState: {
    repositoryWrites: false, dataWrites: false, deploy: false, merge: false, production: false, imports: false,
    payments: false, make: false, gemini: false, firestoreWrites: false, authWrites: false, storageWrites: false, hrWrites: false
  }
};
writeReports(detail, runner);
console.log(JSON.stringify(detail));
process.exit(exitCode);
