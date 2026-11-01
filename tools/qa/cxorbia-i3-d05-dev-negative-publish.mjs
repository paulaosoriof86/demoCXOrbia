#!/usr/bin/env node
/* D05 in DEV: protected Admin publish route must reject an exact stale-version
   command without changing a pre-existing certification bank or its receipts.
   Never publish/configure/retire any real bank. No new tenant/user/data. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROJECT_ID = 'cinepolis';
const SOURCE = 'e44483d895e75d5e1bf48b327d464a8c4686ddba';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const OUT = '.tmp/cxorbia-i3-d05-rejected-publish';
const str = value => String(value ?? '').trim();
const arr = value => Array.isArray(value) ? value : [];
const sha = value => crypto.createHash('sha256').update(typeof value === 'string'
  ? value : JSON.stringify(value)).digest('hex');
const fail = code => { throw new Error(code); };
const result = {
  schemaVersion: 'cxorbia.i3.d05.rejected-publish.dev.v1',
  decision: 'HOLD',
  scope: 'REAL_DEV_ADMIN_NEGATIVE_PUBLISH_NO_COMMIT_NO_BANK_MUTATION',
  sourceSha: SOURCE, environment: PROJECT, project: PROJECT_ID,
  previousPublishedBankModified: false,
  positivePublishConfigureRetire: 'NOT_TESTED_BY_THIS_PROBE',
  humanAcceptance: 'PENDING',
  safety: {authUsersCreated: 0, bankWritesExpected: 0, hrWrites: 0,
    deployments: 0, providerActivation: false, production: false}
};
fs.mkdirSync(OUT, {recursive: true});

async function run() {
  if (str(process.env.CXORBIA_PRODUCT_SOURCE_SHA) !== SOURCE)
    fail('RELEASE_COMPOSITION_FAILURE:D05_SOURCE_PIN');
  const secret = str(process.env.CXORBIA_D05_SA_JSON);
  if (!secret) fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_UNAVAILABLE');
  let credentials;
  try { credentials = JSON.parse(secret); } catch { fail('AUTH_FAILURE:D05_INVALID_SERVICE_ACCOUNT'); }
  if (credentials.project_id !== PROJECT || !credentials.private_key || !credentials.client_email)
    fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const app = initializeApp({credential: cert(credentials), projectId: PROJECT}, 'd05-dev-negative-publish');
  const auth = getAuth(app), db = getFirestore(app);

  // Select only the single already-existing scoped staff Admin used in G03/VRM286.
  let token, principals = [];
  for (let page = 0; page < 10; page++) {
    const users = await auth.listUsers(1000, token);
    principals.push(...users.users.filter(user => {
      const c = user.customClaims || {};
      return !user.disabled && str(c.tenantId) === TENANT &&
        str(c.role).toLowerCase() === 'admin' &&
        str(c.authNamespace).toLowerCase() === 'staff' &&
        arr(c.projectIds).map(str).includes(PROJECT_ID);
    }));
    token = users.pageToken;
    if (!token) break;
  }
  if (token || principals.length !== 1) fail('AUTH_FAILURE:D05_EXISTING_ADMIN_NOT_UNIQUE');
  const principal = principals[0];
  const memberSnap = await db.doc(`tenants/${TENANT}/users/${principal.uid}`).get();
  const member = memberSnap.data() || {};
  if (!memberSnap.exists || member.active === false ||
      str(member.role).toLowerCase() !== 'admin' ||
      str(member.authNamespace).toLowerCase() !== 'staff' ||
      !arr(member.projectIds).map(str).includes(PROJECT_ID))
    fail('AUTH_FAILURE:D05_ADMIN_MEMBERSHIP_MISMATCH');

  const projectSnap = await db.doc(`tenants/${TENANT}/projects/${PROJECT_ID}`).get();
  if (!projectSnap.exists) fail('SOURCE_FAILURE:D05_PROJECT_NOT_FOUND');
  const resourceCollection = db.collection(`tenants/${TENANT}/resources`);
  const allBanks = await resourceCollection.where('resourceType', '==', 'certification_bank').get();
  const inProject = allBanks.docs.filter(d => str(d.data().projectId) === PROJECT_ID);
  const pending = inProject.filter(d => {
    const row = d.data(), bank = row.bank || {};
    return str(row.status) === 'active' && str(bank.estado) === 'pending_review' &&
      str(row.periodId).includes('2026-10') &&
      Number.isInteger(row.version) && row.version >= 1 && row.version < 1000000 &&
      str(bank.contentRevision).length > 0 && str(bank.generadoPorUid).length > 0 &&
      arr(bank.preguntas).length > 0;
  });
  result.inventory = {existingProjectBanks: inProject.length, candidatePendingBanks: pending.length};
  if (pending.length !== 1) fail('SOURCE_FAILURE:D05_PENDING_CANDIDATE_NOT_UNIQUE');
  const chosen = pending[0], row = chosen.data(), bank = row.bank;
  const periodId = str(row.periodId);
  const periodIds = /^\d{4}-(0[1-9]|1[0-2])$/.test(periodId)
    ? [periodId, PROJECT_ID + '-' + periodId]
    : [periodId, ...(periodId.startsWith(PROJECT_ID + '-') ? [periodId.slice(PROJECT_ID.length + 1)] : [])];
  const periodSnaps = await Promise.all(periodIds.map(id =>
    db.doc(`tenants/${TENANT}/projects/${PROJECT_ID}/periods/${id}`).get()));
  const matchedPeriodDocs = periodSnaps.filter(x => x.exists);
  if (matchedPeriodDocs.length > 1)
    fail('SOURCE_FAILURE:D05_PERIOD_POLICY_AMBIGUOUS');
  const policySources = [projectSnap.data() || {}, matchedPeriodDocs[0]?.data() || {}];
  const aliasesFor = x => ['certificationReviewPolicy', 'certReviewPolicy']
    .filter(k => Object.hasOwn(x, k)).map(k => str(x[k]).toLowerCase());
  const explicitPolicies = policySources.flatMap(aliasesFor);
  if (explicitPolicies.some(x => !['authorized_admin', 'maker_checker',
    'distinct_reviewer', 'two_person'].includes(x)))
    fail('SOURCE_FAILURE:D05_REVIEW_POLICY_INVALID');
  if (policySources.some(row => new Set(aliasesFor(row).map(x =>
    x === 'authorized_admin' ? 'authorized_admin' : 'distinct_reviewer')).size > 1))
    fail('SOURCE_FAILURE:D05_REVIEW_POLICY_ALIAS_CONFLICT');

  const expectedVersion = row.version + 1000000;
  if (expectedVersion === row.version || expectedVersion < 1)
    fail('SOURCE_FAILURE:D05_INVALID_STALE_VERSION');
  const idem = 'd05-negative-publish:' + crypto.randomUUID();
  const receiptId = 'cert-bank-' + sha([TENANT, PROJECT_ID, principal.uid, idem]).slice(0, 32);
  const receiptRef = db.doc(`tenants/${TENANT}/commandReceipts/${receiptId}`);
  if ((await receiptRef.get()).exists) fail('PERSISTENCE_FAILURE:D05_RECEIPT_PREEXISTING');
  const before = await chosen.ref.get();
  if (!before.exists || before.data().version !== row.version ||
      str(before.data().bank?.contentRevision) !== str(bank.contentRevision))
    fail('PERSISTENCE_FAILURE:D05_PRECONDITION_CHANGED');
  const beforeDigest = sha(before.data());

  const firebaseConfigResponse = await fetch(`${ROOT}/__/firebase/init.json`,
    {signal: AbortSignal.timeout(30000)});
  if (!firebaseConfigResponse.ok) fail('ENVIRONMENT_FAILURE:D05_FIREBASE_CONFIG_HTTP');
  const config = await firebaseConfigResponse.json();
  if (config.projectId !== PROJECT || !config.apiKey)
    fail('AUTH_FAILURE:D05_FIREBASE_CONFIG_MISMATCH');
  const customToken = await auth.createCustomToken(principal.uid);
  const signIn = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(config.apiKey)}`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({token: customToken, returnSecureToken: true}),
    signal: AbortSignal.timeout(60000)
  });
  if (!signIn.ok) fail('AUTH_FAILURE:D05_ADMIN_SIGN_IN_REJECTED');
  const session = await signIn.json();
  if (!session.idToken || session.isNewUser === true)
    fail('AUTH_FAILURE:D05_EXISTING_ADMIN_SESSION_REQUIRED');
  if ((await auth.verifyIdToken(session.idToken, true)).uid !== principal.uid)
    fail('AUTH_FAILURE:D05_SESSION_UID_MISMATCH');

  // A deliberately impossible stale version. The runtime must return 409
  // *before* tx.set. No publish/configure/retire success is requested.
  const response = await fetch(`${ROOT}/api/tenants/${TENANT}/projects/${PROJECT_ID}/certifications/publish`, {
    method: 'POST',
    headers: {'Authorization':'Bearer '+session.idToken, 'Content-Type':'application/json',
      'Idempotency-Key': idem, 'Cache-Control':'no-cache, no-store'},
    body: JSON.stringify({bankResourceId: chosen.id, periodId,
      expectedVersion, expectedContentRevision: str(bank.contentRevision), idempotencyKey: idem}),
    signal: AbortSignal.timeout(90000)
  });
  const body = await response.json().catch(() => ({}));
  const after = await chosen.ref.get(), afterReceipt = await receiptRef.get();
  result.readback = {
    principalExisting: true, role: 'admin', tenant: TENANT, project: PROJECT_ID,
    periodScopeVerified: periodId.length > 0,
    periodPolicyDocuments: matchedPeriodDocs.length,
    policyAuthority: matchedPeriodDocs.length ? 'EXACT_PERIOD_OR_PROJECT_OVERRIDE' : 'PROJECT_DEFAULT_NO_PERIOD_DOCUMENT',
    reviewPolicyConfigured: explicitPolicies.length > 0,
    resourceFingerprint: sha(chosen.id), bankStateBefore: str(bank.estado),
    bankStateAfter: str(after.data()?.bank?.estado),
    versionBefore: row.version, versionAfter: after.data()?.version ?? null,
    expectedStaleVersion: expectedVersion,
    documentDigestBefore: beforeDigest,
    documentDigestAfter: after.exists ? sha(after.data()) : null,
    httpStatus: response.status,
    responseCode: /^[A-Z0-9_:]+$/.test(str(body.code)) ? str(body.code) : 'UNCLASSIFIED',
    committed: body.committed === true, providerAck: body.providerAck === true,
    successUiAllowed: body.successUiAllowed === true,
    receiptCreated: afterReceipt.exists
  };
  if (response.status !== 409 || body.code !== 'CERT_BANK_EXPECTED_VERSION_CONFLICT' ||
      body.committed !== false || body.providerAck !== false ||
      body.successUiAllowed !== false || !after.exists || afterReceipt.exists ||
      after.data().version !== row.version || sha(after.data()) !== beforeDigest)
    fail('PERSISTENCE_FAILURE:D05_NEGATIVE_PUBLISH_GUARD_OR_READBACK');
  result.decision = 'PASS_PROTECTED_ADMIN_STALE_PUBLISH_REJECTED_NO_MUTATION';
}

try { await run(); }
catch (error) {
  result.decision = 'HOLD_D05_NEGATIVE_PUBLISH';
  result.failureClass = /^(AUTH_FAILURE|SOURCE_FAILURE|ENVIRONMENT_FAILURE|PERSISTENCE_FAILURE|RELEASE_COMPOSITION_FAILURE):D05_[A-Z0-9_]+$/.test(str(error?.message))
    ? str(error.message) : 'ENVIRONMENT_FAILURE:D05_UNCLASSIFIED';
  process.exitCode = 1;
} finally {
  fs.writeFileSync(`${OUT}/result.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
}
