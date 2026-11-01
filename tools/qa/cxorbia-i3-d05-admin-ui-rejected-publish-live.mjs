#!/usr/bin/env node
/* Recovery I3 / D05: natural authenticated Admin UI click, with a hard
   network barrier before any business-bank mutation. This is a UI-negative
   response test, not a positive provider lifecycle or human acceptance. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const SOURCE = 'e44483d895e75d5e1bf48b327d464a8c4686ddba';
const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROJECT_ID = 'cinepolis';
const PERIOD = '2026-10';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const OUT = '.tmp/cxorbia-i3-d05-admin-ui-negative';
const str = value => String(value ?? '').trim();
const arr = value => Array.isArray(value) ? value : [];
const sha = value => crypto.createHash('sha256').update(
  typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const fail = code => { throw new Error(code); };
const result = {
  schemaVersion: 'cxorbia.i3.d05.admin-ui-rejected-publish.dev.v1',
  status: 'HOLD',
  scope: 'REAL_AUTHENTICATED_ADMIN_UI_EDITOR_AND_CLICK_WITH_ISOLATED_409_RESPONSE',
  sourceSha: SOURCE, environment: PROJECT, tenant: TENANT, project: PROJECT_ID,
  period: PERIOD,
  safe: {authUsersCreated: 0, businessBankWrites: 0, providerCommands: 0,
    interceptedPublishRequests: 0, otherWriteRequests: 0,
    hrWrites: 0, devDeploys: 0, production: false},
  simulatedProviderResponse: true,
  realProviderNegativeAlreadyProvenRun: 41338635392,
  realProviderQaPositiveAlreadyProvenRun: 41339292153,
  fullDomainMatch: false, humanAcceptance: 'PENDING',
  shopperRoleConsumption: 'PENDING', distinctReviewerRole: 'PENDING'
};
fs.mkdirSync(OUT, {recursive: true});
let browser;

async function run() {
  if (str(process.env.CXORBIA_PRODUCT_SOURCE_SHA) !== SOURCE)
    fail('RELEASE_COMPOSITION_FAILURE:D05_UI_SOURCE_PIN');
  const path = str(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!path) fail('AUTH_FAILURE:D05_UI_SERVICE_ACCOUNT_UNAVAILABLE');
  const sa = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (sa.project_id !== PROJECT || !sa.private_key || !sa.client_email)
    fail('AUTH_FAILURE:D05_UI_SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const app = initializeApp({credential: cert(sa), projectId: PROJECT}, 'd05-admin-ui-negative');
  const auth = getAuth(app), db = getFirestore(app);
  const matching = [];
  let pageToken;
  for (let index = 0; index < 10; index++) {
    const batch = await auth.listUsers(1000, pageToken);
    matching.push(...batch.users.filter(user => {
      const claims = user.customClaims || {};
      return !user.disabled && str(claims.tenantId) === TENANT &&
        str(claims.role).toLowerCase() === 'admin' &&
        str(claims.authNamespace).toLowerCase() === 'staff' &&
        arr(claims.projectIds).map(str).includes(PROJECT_ID);
    }));
    pageToken = batch.pageToken;
    if (!pageToken) break;
  }
  if (pageToken || matching.length !== 1) fail('AUTH_FAILURE:D05_UI_ADMIN_NOT_UNIQUE');
  const admin = matching[0];
  const membership = await db.doc(`tenants/${TENANT}/users/${admin.uid}`).get();
  const member = membership.data() || {};
  if (!membership.exists || member.active === false ||
    str(member.role).toLowerCase() !== 'admin' ||
    str(member.authNamespace).toLowerCase() !== 'staff' ||
    !arr(member.projectIds).map(str).includes(PROJECT_ID))
    fail('AUTH_FAILURE:D05_UI_ADMIN_MEMBERSHIP_MISMATCH');

  const banksRef = db.collection(`tenants/${TENANT}/resources`);
  async function inventory() {
    const snap = await banksRef.where('resourceType', '==', 'certification_bank').get();
    return snap.docs.filter(doc => str(doc.data().projectId) === PROJECT_ID)
      .map(doc => ({id: doc.id, row: doc.data()}))
      .sort((left, right) => left.id.localeCompare(right.id));
  }
  const before = await inventory();
  const active = before.filter(x => str(x.row.status) === 'active' &&
    str(x.row.periodId).includes(PERIOD));
  const pending = active.filter(x => str(x.row.bank?.estado) === 'pending_review' &&
    str(x.row.bank?.certificationName) === 'Banco IA pendiente de revisión');
  const published = active.filter(x => str(x.row.bank?.estado) === 'published');
  if (pending.length !== 1 || published.length < 1 || active.length !== 2)
    fail('SOURCE_FAILURE:D05_UI_BANK_INVENTORY_CHANGED');
  const chosen = pending[0], bank = chosen.row.bank;
  if (arr(bank.preguntas).length !== 15 || Number(chosen.row.version) !== 1 ||
    !str(bank.documentSource?.source_sha256) || !str(bank.contentRevision))
    fail('SOURCE_FAILURE:D05_UI_PENDING_BANK_UNEXPECTED');
  const beforeDigest = sha(before);
  const receiptsRef = db.collection(`tenants/${TENANT}/commandReceipts`);
  const receiptsBefore = await receiptsRef.where('entityId', '==', chosen.id).get();

  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const page = await context.newPage();
  let observedPayload = null;
  let unsafeRequests = 0;
  // Installed BEFORE loading the site. Every certificate POST is prevented
  // from reaching the real provider. Only the expected publish gets HTTP409.
  await context.route('**/api/tenants/tya/projects/cinepolis/certifications/**', async route => {
    const request = route.request();
    if (request.method() === 'GET') return route.continue();
    const isPublish = request.method() === 'POST' &&
      new URL(request.url()).pathname.endsWith('/certifications/publish');
    if (!isPublish) {
      unsafeRequests++;
      return route.fulfill({status: 423, contentType: 'application/json',
        body: JSON.stringify({ok: false, committed: false, providerAck: false,
          successUiAllowed: false, code: 'D05_UI_UNEXPECTED_MUTATION_BLOCKED'})});
    }
    result.safe.interceptedPublishRequests++;
    let payload = {};
    try { payload = request.postDataJSON(); } catch { /* reject invalid */ }
    observedPayload = {
      sameResource: str(payload.bankResourceId) === chosen.id,
      samePeriod: str(payload.periodId) === str(chosen.row.periodId),
      expectedVersion: payload.expectedVersion,
      sameContentRevision: str(payload.expectedContentRevision) === str(bank.contentRevision),
      idempotencyPresent: /^certbank\.publish:[0-9a-f]{64}$/.test(str(payload.idempotencyKey)),
      bearerPresent: /^Bearer\s+\S+/.test(str(request.headers().authorization))
    };
    return route.fulfill({status: 409, contentType: 'application/json',
      headers: {'cache-control': 'no-store'},
      body: JSON.stringify({ok: false, committed: false, providerAck: false,
        successUiAllowed: false, code: 'CERT_BANK_EXPECTED_VERSION_CONFLICT'})});
  });

  const customToken = await auth.createCustomToken(admin.uid);
  const url = ROOT + '/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV' +
    '&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV' +
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => !!window.firebase?.auth &&
    Array.isArray(window.firebase.apps) && window.firebase.apps.length > 0,
  null, {timeout: 90000});
  await page.evaluate(async token => {
    await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
    await window.firebase.auth().signInWithCustomToken(token);
  }, customToken);
  await page.reload({waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => !!window.firebase?.auth?.().currentUser &&
    window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
  null, {timeout: 90000});
  await page.getByRole('button', {name: 'Certificación', exact: true}).click();
  const chooser = page.getByRole('combobox').nth(2);
  await chooser.waitFor({state: 'visible', timeout: 30000});
  await chooser.selectOption({label: 'Banco IA pendiente de revisión · Pendiente de revisión'});
  await page.locator('#certPublish').waitFor({state: 'visible', timeout: 30000});
  if (!(await page.getByText('Banco pendiente de revisión', {exact: true}).isVisible()))
    fail('UI_FAILURE:D05_UI_PENDING_STATE_NOT_VISIBLE');
  await page.getByRole('button', {name: 'Revisar y editar preguntas'}).click();
  const dialog = page.getByRole('dialog', {name: 'Revisión versionada del banco'});
  await dialog.waitFor({state: 'visible', timeout: 20000});
  const questionCount = await dialog.getByRole('group', {name: /^Pregunta \d+$/}).count();
  if (questionCount !== 15 ||
    !(await dialog.getByText(/versión 1/).isVisible()))
    fail('UI_FAILURE:D05_UI_EDITOR_SOURCE_VERSION_OR_QUESTIONS');
  await dialog.getByRole('button', {name: 'Comparar cambios'}).click();
  if (!(await dialog.getByText('No hay cambios para guardar.').isVisible()) ||
    await dialog.getByRole('button', {name: 'Guardar revisión sin publicar'}).isEnabled())
    fail('UI_FAILURE:D05_UI_EMPTY_REVIEW_ENABLED');
  await page.screenshot({path: OUT + '/editor-unchanged.png'});
  await dialog.getByRole('button', {name: 'Cerrar'}).click();

  const warning = page.getByText('El banco cambió. Vuelve a cargarlo y revisa la versión actual antes de publicar.');
  const warningPromise = warning.waitFor({state: 'visible', timeout: 20000});
  await page.locator('#certPublish').click();
  await warningPromise;
  if (result.safe.interceptedPublishRequests !== 1 || unsafeRequests !== 0 ||
    !observedPayload || Object.values(observedPayload).some(value => value === false) ||
    observedPayload.expectedVersion !== chosen.row.version)
    fail('UI_FAILURE:D05_UI_PUBLISH_REQUEST_CONTRACT');
  const falseSuccess = await page.getByText(
    'Banco revisado y publicado con confirmación del servidor.', {exact: true}).count();
  if (falseSuccess !== 0 ||
    !(await page.getByText('Banco pendiente de revisión', {exact: true}).isVisible()))
    fail('UI_FAILURE:D05_UI_FALSE_SUCCESS_AFTER_REJECTED_ACK');
  await page.screenshot({path: OUT + '/rejected-publish-warning.png'});

  const after = await inventory();
  const receiptsAfter = await receiptsRef.where('entityId', '==', chosen.id).get();
  const afterDigest = sha(after);
  result.safe.otherWriteRequests = unsafeRequests;
  result.readback = {
    existingStaffAdmin: true, protectedAuthorityApplied: true,
    activePeriodBanks: active.length, publishedPeriodBanks: published.length,
    pendingPeriodBanks: pending.length, editorQuestions: questionCount,
    editorResourceVersion: chosen.row.version,
    sourceDocumentDigest: str(bank.documentSource.source_sha256),
    bankIdFingerprint: sha(chosen.id),
    request: observedPayload,
    interceptedHttpStatus: 409, visibleWarning: true, falseSuccessToast: false,
    businessBanksDigestBefore: beforeDigest, businessBanksDigestAfter: afterDigest,
    receiptCountBefore: receiptsBefore.size, receiptCountAfter: receiptsAfter.size,
    businessBanksUnchanged: beforeDigest === afterDigest
  };
  if (beforeDigest !== afterDigest || receiptsBefore.size !== receiptsAfter.size)
    fail('PERSISTENCE_FAILURE:D05_UI_BANK_OR_RECEIPT_MUTATION');
  result.status = 'PASS_D05_ADMIN_UI_EDITOR_AND_NEGATIVE_CLICK_409_NO_FALSE_SUCCESS';
  await context.close();
}

try { await run(); }
catch (error) {
  result.status = 'HOLD_D05_ADMIN_UI_NEGATIVE';
  const code = str(error?.message);
  result.failureCode = /^(AUTH_FAILURE|SOURCE_FAILURE|UI_FAILURE|PERSISTENCE_FAILURE|RELEASE_COMPOSITION_FAILURE):D05_UI_[A-Z0-9_]+$/.test(code)
    ? code : 'ENVIRONMENT_FAILURE:D05_UI_UNCLASSIFIED';
  result.errorContext = str(error?.message).slice(0, 300);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  fs.writeFileSync(OUT + '/result.json', JSON.stringify(result, null, 2) + '\n');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
