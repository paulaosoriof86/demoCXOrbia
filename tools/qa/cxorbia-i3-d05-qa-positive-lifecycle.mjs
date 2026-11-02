#!/usr/bin/env node
/* D05 on DEV: positive publish/configure/retire of a unique, isolated QA bank.
   No existing bank changes, no AI call, no Shopper visibility, no HR/production.
   The QA bank is permanently retired (tombstoned), with durable receipts. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT = 'cxorbia-backend-dev', TENANT = 'tya', PROJECT_ID = 'cinepolis';
const SOURCE = 'a363f9e4f604cba722e899bb1916c442c77c1fed';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const OUT = '.tmp/cxorbia-i3-d05-qa-lifecycle';
const str = v => String(v ?? '').trim(), arr = v => Array.isArray(v) ? v : [];
const sha = v => crypto.createHash('sha256').update(typeof v === 'string'
  ? v : JSON.stringify(v)).digest('hex');
const fail = c => { throw new Error(c); };
const isAdmin = u => {
  const c = u.customClaims || {};
  return !u.disabled && str(c.tenantId) === TENANT && str(c.role).toLowerCase() === 'admin' &&
    str(c.authNamespace).toLowerCase() === 'staff' && arr(c.projectIds).map(str).includes(PROJECT_ID);
};
const result = {
  schemaVersion: 'cxorbia.i3.d05.dev-positive-qa-lifecycle.v1',
  decision: 'HOLD', environment: PROJECT, productSourceSha: SOURCE,
  scope: 'QA_ONLY_BANK_REAL_DEV_RUNTIME_PUBLISH_CONFIGURE_RETIRE_PROVIDER_ACK',
  existingBanksModified: 'NOT_YET_VERIFIED',
  shopperVisible: false, qaBankPermanentState: 'NOT_YET_VERIFIED',
  aiCalls: 0, hrWrites: 0, authUsersCreated: 0, production: false,
  humanAcceptance: 'PENDING', fullDomainMatch: false, uiClickE2e: 'PENDING'
};
fs.mkdirSync(OUT, {recursive: true});
let qaRef = null, qaRunId = '', db = null;

async function authenticatedAdmin() {
  const secret = str(process.env.CXORBIA_D05_SA_JSON);
  if (!secret) fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_UNAVAILABLE');
  let sa;
  try { sa = JSON.parse(secret); } catch { fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_JSON_INVALID'); }
  if (sa.project_id !== PROJECT || !sa.private_key || !sa.client_email)
    fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const app = initializeApp({credential: cert(sa), projectId: PROJECT}, 'd05-qa-positive');
  const auth = getAuth(app);
  db = getFirestore(app);
  let users = [], next;
  for (let page = 0; page < 10; page++) {
    const batch = await auth.listUsers(1000, next);
    users.push(...batch.users.filter(isAdmin));
    next = batch.pageToken;
    if (!next) break;
  }
  if (next || users.length !== 1) fail('AUTH_FAILURE:D05_ADMIN_NOT_UNIQUE');
  const principal = users[0];
  const memberSnap = await db.doc(`tenants/${TENANT}/users/${principal.uid}`).get();
  const member = memberSnap.data() || {};
  if (!memberSnap.exists || member.active === false ||
      str(member.role).toLowerCase() !== 'admin' ||
      str(member.authNamespace).toLowerCase() !== 'staff' ||
      !arr(member.projectIds).map(str).includes(PROJECT_ID))
    fail('AUTH_FAILURE:D05_ADMIN_MEMBERSHIP_MISMATCH');
  const configResponse = await fetch(`${ROOT}/__/firebase/init.json`,
    {signal: AbortSignal.timeout(30000)});
  if (!configResponse.ok) fail('ENVIRONMENT_FAILURE:D05_FIREBASE_CONFIG_UNAVAILABLE');
  const config = await configResponse.json();
  if (config.projectId !== PROJECT || !config.apiKey)
    fail('AUTH_FAILURE:D05_FIREBASE_CONFIG_MISMATCH');
  const customToken = await auth.createCustomToken(principal.uid);
  const sessionResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(config.apiKey)}`,
    {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({token: customToken, returnSecureToken: true}),
      signal: AbortSignal.timeout(60000)});
  if (!sessionResponse.ok) fail('AUTH_FAILURE:D05_EXISTING_ADMIN_SIGNIN_REJECTED');
  const session = await sessionResponse.json();
  if (!session.idToken || session.isNewUser === true ||
      (await auth.verifyIdToken(session.idToken, true)).uid !== principal.uid)
    fail('AUTH_FAILURE:D05_ADMIN_TOKEN_MISMATCH');
  return {principal, idToken: session.idToken};
}

async function callLifecycle(idToken, actorUid, action, payload) {
  const idem = `qa-d05:${qaRunId}:${action}`;
  const receiptId = 'cert-bank-' + sha([TENANT, PROJECT_ID, actorUid, idem]).slice(0, 32);
  const receiptRef = db.doc(`tenants/${TENANT}/commandReceipts/${receiptId}`);
  if ((await receiptRef.get()).exists) fail('PERSISTENCE_FAILURE:D05_QA_RECEIPT_PREEXISTS');
  const response = await fetch(`${ROOT}/api/tenants/${TENANT}/projects/${PROJECT_ID}/certifications/${action}`, {
    method: 'POST', signal: AbortSignal.timeout(90000),
    headers: {'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json',
      'Idempotency-Key': idem, 'Cache-Control': 'no-store'},
    body: JSON.stringify({...payload, idempotencyKey: idem})
  });
  const data = await response.json().catch(() => ({}));
  const receipt = await receiptRef.get(), actual = await qaRef.get();
  const stored = actual.data() || {}, b = stored.bank || {};
  const stage = {
    action, httpStatus: response.status, committed: data.committed === true,
    providerAck: data.providerAck === true, readbackVerified: data.readbackVerified === true,
    receiptExists: receipt.exists, receiptAck: receipt.data()?.providerAck === true,
    actualVersion: stored.version ?? null, actualState: str(b.estado),
    actualResourceStatus: str(stored.status),
    receiptCommandType: str(receipt.data()?.commandType),
    returnedItemVersion: data.item?.version ?? null,
    returnedReceiptVersion: data.receipt?.entityVersion ?? null,
    actorCorrect: data.receipt?.actorUid === actorUid,
    qaRunIdMatches: str(stored.qaRunId) === qaRunId,
    responseCode: /^[A-Z0-9_:]+$/.test(str(data.code)) ? str(data.code) : null
  };
  result.stages = [...(result.stages || []), stage];
  if (response.status !== 200 || !data.ok || !data.committed || !data.providerAck ||
      !data.readbackVerified || !receipt.exists || !stage.receiptAck ||
      stage.receiptCommandType !== `certification.${action}` || !stage.actorCorrect ||
      !stage.qaRunIdMatches || data.item?.id !== qaRef.id ||
      data.item?.version !== stored.version || data.receipt?.entityVersion !== stored.version)
    fail('PERSISTENCE_FAILURE:D05_LIFECYCLE_ACK_OR_READBACK');
  return {stored, bank: b, response: data};
}

async function run() {
  if (str(process.env.CXORBIA_PRODUCT_SOURCE_SHA) !== SOURCE)
    fail('RELEASE_COMPOSITION_FAILURE:D05_SOURCE_PIN');
  const runId = str(process.env.GITHUB_RUN_ID);
  if (!/^\d{7,20}$/.test(runId)) fail('RELEASE_COMPOSITION_FAILURE:D05_QA_RUN_ID');
  qaRunId = runId;
  const {principal, idToken} = await authenticatedAdmin();
  const projectSnap = await db.doc(`tenants/${TENANT}/projects/${PROJECT_ID}`).get();
  if (!projectSnap.exists) fail('SOURCE_FAILURE:D05_PROJECT_NOT_FOUND');
  const project = projectSnap.data() || {};
  const col = db.collection(`tenants/${TENANT}/resources`);
  const candidateSnap = await col.where('resourceType', '==', 'certification_bank').get();
  const realBanks = candidateSnap.docs.filter(d => str(d.data().projectId) === PROJECT_ID);
  const realHashes = Object.fromEntries(realBanks.map(d => [d.id, sha(d.data())]));
  const pending = realBanks.filter(d => str(d.data().bank?.estado) === 'pending_review'
    && str(d.data().periodId).includes('2026-10') && str(d.data().status) === 'active');
  if (realBanks.length !== 4 || pending.length !== 1)
    fail('SOURCE_FAILURE:D05_QA_REAL_BANK_BASELINE_CHANGED');
  const periodId = str(pending[0].data().periodId);
  if (!periodId || periodId.includes('/')) fail('SOURCE_FAILURE:D05_PERIOD_ID_INVALID');
  const periodIds = /^\d{4}-(0[1-9]|1[0-2])$/.test(periodId)
    ? [periodId, PROJECT_ID + '-' + periodId]
    : [periodId, ...(periodId.startsWith(PROJECT_ID + '-') ? [periodId.slice(PROJECT_ID.length + 1)] : [])];
  const periods = await Promise.all(periodIds.map(id =>
    db.doc(`tenants/${TENANT}/projects/${PROJECT_ID}/periods/${id}`).get()));
  if (periods.filter(s => s.exists).length > 1)
    fail('SOURCE_FAILURE:D05_PERIOD_POLICY_AMBIGUOUS');
  const values = [project, periods.find(p => p.exists)?.data() || {}]
    .flatMap(row => ['certificationReviewPolicy','certReviewPolicy']
      .filter(key => Object.hasOwn(row, key)).map(key => str(row[key]).toLowerCase()));
  // The authorized_admin policy is already frozen; never modify project/period policy.
  if (values.some(v => v !== 'authorized_admin'))
    fail('SOURCE_FAILURE:D05_QA_REVIEW_POLICY_REQUIRES_DISTINCT_ACTOR');
  result.preflight = {role:'admin',tenant:TENANT,project:PROJECT_ID,
    periodScopePresent:true,periodPolicyDocuments:periods.filter(s=>s.exists).length,
    policy:'authorized_admin',realBanksBefore:realBanks.length,
    realPendingBanksBefore:pending.length,realBankDigestsPreflight:sha(realHashes)};

  const certId = `qa-d05-${runId}`;
  const resourceId = ('certbank-' + PROJECT_ID + '-' + periodId + '-' + certId)
    .replace(/[^a-zA-Z0-9_-]+/g, '-');
  qaRef = col.doc(resourceId);
  if ((await qaRef.get()).exists) fail('SOURCE_FAILURE:D05_QA_RESOURCE_ALREADY_EXISTS');
  const revision = sha(['D05_QA_ONLY',runId,PROJECT_ID,periodId]);
  const bank = {
    certificationId: certId, certificationName:`QA D05 - ${runId} - uso interno`,
    estado:'pending_review', generadoPorUid:principal.uid,
    preguntas:[
      {q:'Pregunta QA D05 uno',ops:['Opcion A','Opcion B'],correcta:'Opcion A',exp:'Solo QA',fuente:'QA'},
      {q:'Pregunta QA D05 dos',ops:['Opcion C','Opcion D'],correcta:'Opcion C',exp:'Solo QA',fuente:'QA'}
    ], requestedQuestionCount:2, gate:80, required:false,
    contentRevision:revision, generatedAt:new Date().toISOString()
  };
  await qaRef.create({id:resourceId, tenantId:TENANT, projectId:PROJECT_ID,
    periodId,resourceType:'certification_bank',tipo:'certification_bank',
    status:'active',version:1,n:bank.certificationName,bank,
    visibleRoles:[],targetAll:false,qaOnly:true,qaRunId,
    createdAt:new Date().toISOString(),createdByUid:principal.uid,
    updatedAt:new Date().toISOString(),updatedByUid:principal.uid});
  result.qaBankCreated = true;
  result.qaBankFingerprint = sha(resourceId);
  const common = {bankResourceId:resourceId,periodId};

  const published = await callLifecycle(idToken,principal.uid,'publish',
    {...common,expectedVersion:1,expectedContentRevision:revision});
  if (published.stored.version !== 2 || published.bank.estado !== 'published' ||
      published.bank.revisadoPorUid !== principal.uid || published.bank.contentRevision !== revision)
    fail('PERSISTENCE_FAILURE:D05_PUBLISH_STATE_INCORRECT');
  const configured = await callLifecycle(idToken,principal.uid,'configure',
    {...common,expectedVersion:2,expectedContentRevision:revision,gate:85,required:true});
  if (configured.stored.version !== 3 || configured.bank.estado !== 'published' ||
      configured.bank.gate !== 85 || configured.bank.required !== true ||
      configured.bank.contentRevision === revision)
    fail('PERSISTENCE_FAILURE:D05_CONFIGURE_STATE_INCORRECT');
  const retired = await callLifecycle(idToken,principal.uid,'retire',
    {...common,expectedVersion:3,expectedContentRevision:configured.bank.contentRevision});
  if (retired.stored.version !== 4 || retired.stored.status !== 'deleted' ||
      retired.bank.estado !== 'withdrawn')
    fail('PERSISTENCE_FAILURE:D05_RETIRE_STATE_INCORRECT');

  const allAfter = await col.where('resourceType','==','certification_bank').get();
  const preExisting = allAfter.docs.filter(d => Object.hasOwn(realHashes,d.id));
  const originalEqual = preExisting.length === realBanks.length &&
    preExisting.every(d => sha(d.data()) === realHashes[d.id]);
  result.existingBanksModified = !originalEqual;
  result.qaBankPermanentState = 'deleted_withdrawn_tombstone';
  result.qaBankVersion = retired.stored.version;
  result.commandReceiptsCreated = 3;
  result.providerWrites = 6;
  result.fixtureSeedWrite = 1;
  result.shopperVisible = false;
  if (!originalEqual || retired.stored.targetAll !== false ||
      arr(retired.stored.visibleRoles).includes('shopper'))
    fail('PERSISTENCE_FAILURE:D05_QA_VISIBILITY_OR_REAL_BANK_DRIFT');
  result.decision = 'PASS_D05_QA_ONLY_PUBLISH_CONFIGURE_RETIRE_ALL_THREE_ACK_AND_READBACK';
}

try { await run(); }
catch (error) {
  result.decision = 'HOLD_D05_QA_POSITIVE_LIFECYCLE';
  result.failureClass = /^(AUTH_FAILURE|SOURCE_FAILURE|ENVIRONMENT_FAILURE|PERSISTENCE_FAILURE|RELEASE_COMPOSITION_FAILURE):D05_[A-Z0-9_]+$/.test(str(error?.message))
    ? str(error.message) : 'ENVIRONMENT_FAILURE:D05_QA_UNCLASSIFIED';
  process.exitCode = 1;
} finally {
  // If an assertion fails mid-lifecycle, retire ONLY the unique QA-owned
  // resource. Never delete or change any pre-existing bank or HR record.
  if (qaRef && db) {
    try {
      const snap = await qaRef.get();
      if (snap.exists && snap.data()?.qaOnly === true &&
          str(snap.data()?.qaRunId) === qaRunId) {
        const row = snap.data(), bank = row.bank || {};
        if (row.status !== 'deleted' || str(bank.estado) !== 'withdrawn') {
          await qaRef.update({status:'deleted',bank:{...bank,estado:'withdrawn',qaAbortCleanup:true},
            qaAbortCleanup:true,updatedAt:new Date().toISOString()});
          result.qaEmergencyRetired = true;
          const check = await qaRef.get();
          result.qaBankPermanentState = check.data()?.status === 'deleted' &&
            check.data()?.bank?.estado === 'withdrawn' ? 'deleted_withdrawn_after_failure' : 'CLEANUP_HOLD';
        }
      }
    } catch {
      result.qaEmergencyRetired = false;
      result.qaBankPermanentState = 'CLEANUP_HOLD';
      result.decision = 'HOLD_D05_QA_CLEANUP_REQUIRED';
      process.exitCode = 1;
    }
  }
  fs.writeFileSync(`${OUT}/result.json`,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
