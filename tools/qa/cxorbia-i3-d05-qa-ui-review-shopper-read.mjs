#!/usr/bin/env node
/* I3/D05-D06 focal proof: actual Admin review-save UI on a disposable QA-only
 * bank, followed by read-only consumption in an existing Shopper role. This
 * is not a real bank publication, an exam attempt, or full D06 acceptance. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const SOURCE = 'a363f9e4f604cba722e899bb1916c442c77c1fed';
const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROJECT_ID = 'cinepolis';
const PERIOD = '2026-10';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const OUT = '.tmp/cxorbia-i3-d05-qa-ui-review-shopper';
const SHOPPER_READ_ONLY = process.env.CXORBIA_D06_READ_ONLY === '1';
const str = v => String(v ?? '').trim();
const arr = v => Array.isArray(v) ? v : [];
const sha = v => crypto.createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex');
const fail = code => { throw new Error(code); };
const runId = str(process.env.GITHUB_RUN_ID);
const result = {
  schemaVersion: 'cxorbia.i3.d05.qa-ui-review-shopper-read.v1',
  decision: 'HOLD', sourceSha: SOURCE, tenant: TENANT, project: PROJECT_ID,
  period: PERIOD, environment: PROJECT,
  scope: 'REAL_ADMIN_UI_QA_ONLY_VERSIONED_REVIEW_AND_EXISTING_SHOPPER_READ_ONLY',
  limits: {realBankPublishing: false, realBankWrites: 0, hrWrites: 0,
    authUsersCreated: 0, shopperAttemptWrites: 0, devDeploys: 0,
    production: false, fullD05Match: false, fullD06Match: false,
    humanAcceptance: 'PENDING', passwordLoginE2E: 'NOT_TESTED_CUSTOM_TOKEN'},
  qa: {created: false, saveCommitted: false, safelyRetired: false},
  shopper: {status: 'PENDING', submittedAttempt: false}
};
if (SHOPPER_READ_ONLY) {
  result.scope = 'EXISTING_SHOPPER_AUTHENTICATED_UI_PUBLISHED_BANK_READ_ONLY';
  result.qa.status = 'NOT_RUN_NO_QA_WRITES';
}
fs.mkdirSync(OUT, {recursive: true});
let browser, db, qaRef;
let originalHashes = null;
let auth;

const claimsMatch = (user, role) => {
  const c = user.customClaims || {};
  return !user.disabled && str(c.tenantId) === TENANT &&
    str(c.role).toLowerCase() === role &&
    str(c.authNamespace).toLowerCase() === (role === 'admin' ? 'staff' : 'shopper') &&
    arr(c.projectIds).map(str).includes(PROJECT_ID);
};

async function principals(role) {
  const matches = [];
  let next;
  for (let i = 0; i < 10; i++) {
    const batch = await auth.listUsers(1000, next);
    matches.push(...batch.users.filter(user => claimsMatch(user, role)));
    next = batch.pageToken;
    if (!next) break;
  }
  if (next) fail('AUTH_FAILURE:D05_PRINCIPAL_SCAN_INCOMPLETE');
  return matches.sort((a, b) => a.uid.localeCompare(b.uid));
}

async function activeMember(user, role) {
  const snap = await db.doc(`tenants/${TENANT}/users/${user.uid}`).get();
  const member = snap.data() || {};
  return snap.exists && member.active !== false &&
    str(member.role).toLowerCase() === role &&
    str(member.authNamespace).toLowerCase() === (role === 'admin' ? 'staff' : 'shopper') &&
    arr(member.projectIds).map(str).includes(PROJECT_ID);
}

async function allBanks() {
  const snapshot = await db.collection(`tenants/${TENANT}/resources`)
    .where('resourceType', '==', 'certification_bank').get();
  return snapshot.docs.filter(x => str(x.data().projectId) === PROJECT_ID)
    .map(x => ({id: x.id, row: x.data()}))
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function authenticatedPage(person, context) {
  const page = await context.newPage();
  const token = await auth.createCustomToken(person.uid);
  const url = ROOT + '/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV' +
    '&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV' +
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV&cxProjectId=cinepolis';
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => !!window.firebase?.auth &&
    Array.isArray(window.firebase.apps) && window.firebase.apps.length > 0,
  null, {timeout: 90000});
  await page.evaluate(async value => {
    await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
    await window.firebase.auth().signInWithCustomToken(value);
  }, token);
  await page.reload({waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => !!window.firebase?.auth?.().currentUser &&
    window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
  null, {timeout: 90000});
  return page;
}

async function preflight() {
  if (str(process.env.CXORBIA_PRODUCT_SOURCE_SHA) !== SOURCE ||
      !/^\d{7,20}$/.test(runId)) fail('RELEASE_COMPOSITION_FAILURE:D05_SOURCE_OR_RUN_ID');
  const expectedCertBlob = str(process.env.CXORBIA_D05_CERT_SOURCE_BLOB);
  if (!/^[0-9a-f]{40}$/.test(expectedCertBlob))
    fail('RELEASE_COMPOSITION_FAILURE:D05_CERT_SOURCE_BLOB_MISSING');
  const served = await fetch(ROOT + '/modules/cert.js?qaSource=' + encodeURIComponent(runId), {cache: 'no-store'});
  if (!served.ok) fail('ENVIRONMENT_FAILURE:D05_DEV_CERT_ASSET_FETCH');
  const assetBytes = Buffer.from(await served.arrayBuffer());
  const servedBlob = crypto.createHash('sha1').update('blob ' + assetBytes.length + '\0')
    .update(assetBytes).digest('hex');
  result.devAssetReadback = {path: 'modules/cert.js', expectedGitBlob: expectedCertBlob,
    servedGitBlob: servedBlob, exact: servedBlob === expectedCertBlob};
  if (!result.devAssetReadback.exact)
    fail('RELEASE_COMPOSITION_FAILURE:D05_DEV_CERT_SOURCE_NOT_SERVED');
  const credentialPath = str(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!credentialPath) fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_UNAVAILABLE');
  const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  if (sa.project_id !== PROJECT || !sa.client_email || !sa.private_key)
    fail('AUTH_FAILURE:D05_SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const app = initializeApp({credential: cert(sa), projectId: PROJECT}, 'd05-qa-ui-review');
  auth = getAuth(app); db = getFirestore(app);
  const admins = await principals('admin');
  if (admins.length !== 1 || !(await activeMember(admins[0], 'admin')))
    fail('AUTH_FAILURE:D05_UNIQUE_ADMIN_MEMBERSHIP_REQUIRED');
  const shoppers = await principals('shopper');
  let shopper = null;
  for (const candidate of shoppers.slice(0, 30)) {
    if (await activeMember(candidate, 'shopper')) {shopper = candidate; break;}
  }
  if (!shopper) result.shopper.status = 'HOLD_NO_EXISTING_MEMBER_ELIGIBLE_FOR_FOCAL_READ';

  const before = await allBanks();
  const real = before.filter(x => x.row.qaOnly !== true);
  const active = real.filter(x => str(x.row.status) === 'active' &&
    str(x.row.periodId).includes(PERIOD));
  const pending = active.filter(x => str(x.row.bank?.estado) === 'pending_review');
  const published = active.filter(x => str(x.row.bank?.estado) === 'published' &&
    (x.row.targetAll === true || arr(x.row.visibleRoles).map(str).includes('shopper')));
  if (real.length !== 4 || active.length !== 2 || pending.length !== 1 ||
      published.length !== 1 || arr(published[0].row.bank?.preguntas).length < 1)
    fail('SOURCE_FAILURE:D05_REAL_BANK_INVENTORY_OR_SHOPPER_PUBLISH_CHANGED');
  const periodId = str(pending[0].row.periodId);
  if (!periodId || periodId.includes('/')) fail('SOURCE_FAILURE:D05_PERIOD_SCOPE_INVALID');
  const projectSnap = await db.doc(`tenants/${TENANT}/projects/${PROJECT_ID}`).get();
  const periodIds = /^\d{4}-(0[1-9]|1[0-2])$/.test(periodId)
    ? [periodId, PROJECT_ID + '-' + periodId] : [periodId];
  const periods = await Promise.all(periodIds.map(id =>
    db.doc(`tenants/${TENANT}/projects/${PROJECT_ID}/periods/${id}`).get()));
  if (!projectSnap.exists || periods.filter(s => s.exists).length > 1)
    fail('SOURCE_FAILURE:D05_POLICY_AUTHORITY_AMBIGUOUS');
  const policies = [projectSnap.data() || {}, periods.find(x => x.exists)?.data() || {}]
    .flatMap(row => ['certificationReviewPolicy', 'certReviewPolicy']
      .filter(key => Object.hasOwn(row, key)).map(key => str(row[key]).toLowerCase()));
  if (policies.some(policy => policy !== 'authorized_admin'))
    fail('SOURCE_FAILURE:D05_POLICY_REQUIRES_DISTINCT_REVIEWER');
  originalHashes = Object.fromEntries(real.map(x => [x.id, sha(x.row)]));
  result.preflight = {realBanks: real.length, activePeriodBanks: active.length,
    publishedShopperBanks: published.length, pendingBanks: pending.length,
    policy: 'authorized_admin', realBankDigest: sha(originalHashes),
    adminUidFingerprint: sha(admins[0].uid),
    shopperUidFingerprint: shopper ? sha(shopper.uid) : null,
    publishedQuestionCount: arr(published[0].row.bank.preguntas).length};
  return {admin: admins[0], shopper, periodId, publishedId: published[0].id};
}

async function saveQaViaAdminUi({admin, periodId}) {
  const cid = `qa-d05-ui-${runId}`;
  const name = `QA D05 UI ${runId} uso interno`;
  const id = ('certbank-' + PROJECT_ID + '-' + periodId + '-' + cid)
    .replace(/[^a-zA-Z0-9_-]+/g, '-');
  qaRef = db.doc(`tenants/${TENANT}/resources/${id}`);
  if ((await qaRef.get()).exists) fail('SOURCE_FAILURE:D05_QA_ID_ALREADY_EXISTS');
  const questions = Array.from({length: 15}, (_, n) => ({
    q: `Pregunta QA numero ${n + 1}`,
    ops: ['Respuesta A', 'Respuesta B', 'Respuesta C', 'Respuesta D'],
    correcta: 'Respuesta A', exp: 'Explicacion de uso exclusivo QA',
    fuente: `Instructivo QA seccion ${n + 1}`
  }));
  const revision = sha([runId, 'D05_QA_UI_ONLY', questions]);
  const bank = {certificationId: cid, certificationName: name,
    estado: 'pending_review', generadoPorUid: admin.uid, preguntas: questions,
    requestedQuestionCount: 15, gate: 80, required: false,
    contentRevision: revision,
    documentSource: {mode: 'qa_synthetic', name: 'Instructivo sintético QA',
      source_sha256: sha('synthetic:'+runId)}, generatedAt: new Date().toISOString()};
  await qaRef.create({id, tenantId: TENANT, projectId: PROJECT_ID, periodId,
    resourceType: 'certification_bank', tipo: 'certification_bank', status: 'active',
    version: 1, n: name, bank, visibleRoles: [], targetAll: false,
    qaOnly: true, qaRunId: runId, createdAt: new Date().toISOString(),
    createdByUid: admin.uid, updatedAt: new Date().toISOString(),
    updatedByUid: admin.uid});
  result.qa.created = true;
  result.qa.idFingerprint = sha(id);
  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
  const page = await authenticatedPage(admin, context);
  const safeUiErrors = [];
  page.on('console', message => {
    const value = str(message.text());
    if (value.startsWith('CXORBIA_CERT_REVIEW_SAFE_ERROR'))
      safeUiErrors.push(value.slice(0, 170));
  });
  await page.getByRole('button', {name: 'Certificación', exact: true}).click();
  const selector = page.locator('select').filter({hasText: name});
  await selector.waitFor({state: 'visible', timeout: 30000});
  await selector.selectOption({label: `${name} · Pendiente de revisión`});
  await page.locator('#certReviewEdit').waitFor({state: 'visible', timeout: 30000});
  await page.getByRole('button', {name: 'Revisar y editar preguntas'}).click();
  const dialog = page.getByRole('dialog', {name: 'Revisión versionada del banco'});
  await dialog.waitFor({state: 'visible', timeout: 20000});
  if (await dialog.getByRole('group', {name: /^Pregunta \d+$/}).count() !== 15 ||
      !(await dialog.getByText(/versión 1/).isVisible()))
    fail('FUNCTIONAL_DEFECT:D05_QA_EDITOR_COUNT_VERSION');
  const field = dialog.locator('fieldset').first().locator('textarea').first();
  const revised = `Pregunta QA numero 1 corregida ${runId}`;
  await field.fill(revised);
  await dialog.getByRole('button', {name: 'Comparar cambios'}).click();
  if (!(await dialog.getByText(/Preguntas modificadas: 1/).isVisible()) ||
      !(await dialog.getByRole('button', {name: 'Guardar revisión sin publicar'}).isEnabled()))
    fail('FUNCTIONAL_DEFECT:D05_QA_DIFF_OR_SAVE_DISABLED');
  await dialog.screenshot({path: OUT + '/qa-review-before-save.png'});
  const success = page.getByText('Revisión guardada en servidor · publicación pendiente.', {exact: true});
  const rejection = page.getByText('No se pudo guardar la revisión. Comprueba tu sesión y vuelve a cargar el banco si alguien lo modificó.', {exact: true});
  // Install observers before clicking: the toast may be removed immediately
  // when the certification route re-renders after a successful provider ACK.
  const message = Promise.race([
    success.waitFor({state: 'visible', timeout: 15000}).then(() => 'success').catch(() => 'not_seen'),
    rejection.waitFor({state: 'visible', timeout: 15000}).then(() => 'rejected').catch(() => 'not_seen')
  ]);
  await dialog.getByRole('button', {name: 'Guardar revisión sin publicar'}).click();
  result.qa.uiMessage = await message;
  result.qa.safeErrorCodes = safeUiErrors;
  const savedSnap = await qaRef.get();
  const saved = savedSnap.data() || {}, afterBank = saved.bank || {};
  result.qa.postClickReadback = {version: saved.version ?? null,
    status: str(saved.status), bankState: str(afterBank.estado),
    reviewHistoryEntries: arr(afterBank.reviewHistory).length,
    revisionChanged: str(afterBank.contentRevision) !== revision};
  if (saved.version !== 2)
    fail('PERSISTENCE_FAILURE:D05_QA_UI_SAVE_NOT_COMMITTED');
  if (saved.version !== 2 || saved.status !== 'active' ||
      afterBank.estado !== 'pending_review' ||
      afterBank.reviewVersion !== 2 ||
      afterBank.contentRevision === revision ||
      afterBank.preguntas?.length !== 15 ||
      afterBank.preguntas[0]?.q !== revised ||
      afterBank.preguntas.slice(1).some((q, n) => JSON.stringify(q) !== JSON.stringify(questions[n + 1])) ||
      afterBank.reviewHistory?.length !== 1 ||
      afterBank.reviewHistory[0]?.fromVersion !== 1 ||
      afterBank.reviewHistory[0]?.toVersion !== 2 ||
      afterBank.ultimaRevisionPorUid !== admin.uid || saved.qaOnly !== true ||
      str(saved.qaRunId) !== runId || saved.targetAll !== false ||
      arr(saved.visibleRoles).length !== 0)
    fail('PERSISTENCE_FAILURE:D05_QA_VERSIONED_READBACK_MISMATCH');
  result.qa.saveCommitted = true;
  result.qa.versionBefore = 1;
  result.qa.versionAfter = saved.version;
  result.qa.questions = afterBank.preguntas.length;
  result.qa.reviewHistoryEntries = afterBank.reviewHistory.length;
  result.qa.pendingUnpublished = true;
  await page.reload({waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
    null, {timeout: 90000});
  await page.getByRole('button', {name: 'Certificación', exact: true}).click();
  const freshSelector = page.locator('select').filter({hasText: name});
  await freshSelector.waitFor({state: 'visible', timeout: 30000});
  await freshSelector.selectOption({label: `${name} · Pendiente de revisión`});
  await page.getByRole('button', {name: 'Revisar y editar preguntas'}).click();
  const reopened = page.getByRole('dialog', {name: 'Revisión versionada del banco'});
  await reopened.waitFor({state: 'visible', timeout: 20000});
  if (!(await reopened.getByText(/versión 2/).isVisible()) ||
      (await reopened.locator('fieldset').first().locator('textarea').first().inputValue()) !== revised)
    fail('PERSISTENCE_FAILURE:D05_QA_RELOAD_DID_NOT_RETAIN_REVIEW');
  result.qa.reloadReadback = true;
  await reopened.screenshot({path: OUT + '/qa-review-after-reload.png'});
  result.qa.uiSuccessFeedbackObserved = result.qa.uiMessage === 'success';
  await context.close();
}

async function shopperReadOnly({shopper, publishedId}) {
  if (!shopper) fail('AUTH_FAILURE:D06_EXISTING_SHOPPER_MEMBERSHIP_UNAVAILABLE');
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
  const page = await authenticatedPage(shopper, context);
  const role = await page.evaluate(() => ({
    auth: window.CX?.backendAuth?.context?.()?.authenticated === true,
    role: String(window.CX?.backendAuth?.context?.()?.role || ''),
    projectIds: window.CX?.backendAuth?.context?.()?.projectIds || []
  }));
  if (!role.auth || role.role !== 'shopper' || !role.projectIds.includes(PROJECT_ID))
    fail('AUTH_FAILURE:D06_SHOPPER_ROLE_SCOPE_MISMATCH');
  await page.locator('#nav-cert').waitFor({state: 'visible', timeout: 30000});
  await page.locator('#nav-cert').click();
  await page.waitForFunction(() => window.CX?.session?.view === 'cert', null, {timeout: 30000});
  await page.waitForFunction(expectedId =>
    (window.CX?.backendResources?.list?.({resourceType: 'certification_bank'}) || [])
      .some(x => x.id === expectedId), publishedId, {timeout: 30000});
  const observed = await page.evaluate(expectedId => {
    const banks = window.CX?.backendResources?.list?.({resourceType: 'certification_bank'}) || [];
    const published = banks.find(x => x.id === expectedId);
    return {publishedVisible: !!published && published.bank?.estado === 'published',
      publishedQuestions: published?.bank?.preguntas?.length || 0,
      qaVisible: banks.some(x => x.qaOnly === true),
      view: String(window.CX?.session?.view || ''),
      bodyText: String(document.querySelector('#view')?.innerText || '').slice(0, 2500),
      examQuestionCount: document.querySelectorAll('#examBox input[type=radio]').length / 4,
      submitButtonAvailable: !!document.querySelector('#examGo')};
  }, publishedId);
  result.shopper = {status: 'HOLD', role: 'shopper', realExistingUser: true,
    publishedVisible: observed.publishedVisible,
    publishedQuestions: observed.publishedQuestions,
    qaVisible: observed.qaVisible,
    certificationView: observed.view === 'cert',
    examQuestionCount: observed.examQuestionCount,
    submitButtonAvailable: observed.submitButtonAvailable,
    eligibilityOrExamVisible: /Certificación vigente|preguntas|certificación histórica reutilizada/i
      .test(observed.bodyText),
    submittedAttempt: false, passwordLoginE2E: 'NOT_TESTED_CUSTOM_TOKEN'};
  if (!observed.publishedVisible || observed.publishedQuestions < 1 || observed.qaVisible ||
      observed.view !== 'cert' || !result.shopper.eligibilityOrExamVisible ||
      (observed.submitButtonAvailable && observed.examQuestionCount !== observed.publishedQuestions))
    fail('FUNCTIONAL_DEFECT:D06_SHOPPER_PUBLISHED_BANK_NOT_CONSUMED');
  await page.screenshot({path: OUT + '/shopper-certification-read-only.png', fullPage: true});
  result.shopper.status = 'PASS_EXISTING_SHOPPER_ROLE_READ_ONLY';
  await context.close();
}

async function protectRealBanks() {
  if (!db || !originalHashes) return;
  const after = await allBanks();
  const actual = Object.fromEntries(after.filter(x => Object.hasOwn(originalHashes, x.id))
    .map(x => [x.id, sha(x.row)]));
  result.realBankReadback = {original: Object.keys(originalHashes).length,
    after: Object.keys(actual).length, unchanged: sha(actual) === sha(originalHashes)};
  if (!result.realBankReadback.unchanged)
    fail('PERSISTENCE_FAILURE:D05_REAL_BANK_CHANGED');
}

async function safeRetireQa() {
  if (!qaRef || !db) return;
  const snap = await qaRef.get();
  if (!snap.exists) return;
  const prior = snap.data() || {};
  if (prior.qaOnly !== true || str(prior.qaRunId) !== runId)
    fail('PERSISTENCE_FAILURE:D05_QA_CLEANUP_OWNERSHIP_MISMATCH');
  if (prior.status !== 'deleted') {
    await qaRef.update({status: 'deleted', bank: {...(prior.bank || {}), estado: 'withdrawn'},
      qaCleanup: true, updatedAt: new Date().toISOString()});
  }
  const check = (await qaRef.get()).data() || {};
  result.qa.safelyRetired = check.status === 'deleted' &&
    check.bank?.estado === 'withdrawn' && check.qaOnly === true &&
    str(check.qaRunId) === runId;
  result.qa.tombstoneRetained = result.qa.safelyRetired;
  if (!result.qa.safelyRetired) fail('PERSISTENCE_FAILURE:D05_QA_CLEANUP_READBACK');
}

try {
  const scope = await preflight();
  if (SHOPPER_READ_ONLY) {
    browser = await chromium.launch({headless: true});
    await shopperReadOnly(scope);
    await protectRealBanks();
    result.decision = 'PASS_D06_EXISTING_SHOPPER_UI_READ_ONLY_NO_ATTEMPT';
  } else {
    await saveQaViaAdminUi(scope);
    await protectRealBanks();
    await shopperReadOnly(scope);
    if (!result.qa.uiSuccessFeedbackObserved)
      fail('FUNCTIONAL_DEFECT:D05_QA_UI_SUCCESS_FEEDBACK_NOT_SEEN');
    result.decision = 'PASS_D05_QA_UI_REVIEW_VERSION_2_AND_D06_SHOPPER_ROLE_READ_ONLY';
  }
} catch (error) {
  const code = str(error?.message);
  result.decision = 'HOLD_D05_QA_UI_OR_D06_SHOPPER_READ';
  result.failureCode = /^(AUTH_FAILURE|SOURCE_FAILURE|PERSISTENCE_FAILURE|RELEASE_COMPOSITION_FAILURE|FUNCTIONAL_DEFECT|ENVIRONMENT_FAILURE):D0[56]_[A-Z0-9_]+$/.test(code)
    ? code : 'ENVIRONMENT_FAILURE:D05_QA_UI_UNCLASSIFIED';
  result.errorContext = code.slice(0, 240);
  process.exitCode = 1;
} finally {
  try { await safeRetireQa(); } catch (e) {
    result.cleanupFailure = str(e?.message).slice(0, 160); process.exitCode = 1;
  }
  try { await protectRealBanks(); } catch (e) {
    result.realBankIntegrityFailure = str(e?.message).slice(0, 160); process.exitCode = 1;
  }
  if (browser) await browser.close().catch(() => {});
  fs.writeFileSync(OUT + '/result.json', JSON.stringify(result, null, 2) + '\n');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
