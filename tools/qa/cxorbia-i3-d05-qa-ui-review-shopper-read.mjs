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

const SHOPPER_VRM297_ONLY = process.env.CXORBIA_D06_VRM297_ONLY === '1';
const SOURCE = SHOPPER_VRM297_ONLY
  ? '128272027850fa0edad710ad1451a927041815d4'
  : String(process.env.CXORBIA_PRODUCT_SOURCE_SHA || '').trim();
const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROJECT_ID = 'cinepolis';
const PERIOD = '2026-10';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const OUT = '.tmp/cxorbia-i3-d05-qa-ui-review-shopper';
const SHOPPER_READ_ONLY = process.env.CXORBIA_D06_READ_ONLY === '1';
const SHOPPER_VRM296_ONLY = process.env.CXORBIA_D06_VRM296_ONLY === '1';
const FLEX_OPTIONS_QA = process.env.CXORBIA_D05_FLEX_OPTIONS_QA === '1';
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
if (FLEX_OPTIONS_QA) result.scope =
  'D05_EXACT_QA_ONLY_TWO_THREE_TO_FOUR_OPTIONS_ADMIN_UI_AND_EXISTING_SHOPPER_READ_ONLY';
if (SHOPPER_READ_ONLY) {
  result.scope = SHOPPER_VRM297_ONLY
    ? 'VRM297_EXACT_THREE_REAL_SHOPPERS_PUBLISHED_AND_PENDING_DIRECT_GET_DENIED_SAFE_PROJECTION'
    : SHOPPER_VRM296_ONLY
      ? 'EXACT_3_REAL_SHOPPERS_PENDING_BANK_GET_DENIED_AND_PUBLISHED_RETAINED_VRM297_OPEN'
      : 'EXISTING_SHOPPER_AUTHENTICATED_UI_PUBLISHED_BANK_READ_ONLY';
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
  const eligibleShoppers = [];
  for (const candidate of shoppers.slice(0, 30)) {
    if (await activeMember(candidate, 'shopper')) eligibleShoppers.push(candidate);
    if (eligibleShoppers.length === 3) break;
  }
  const shopper = eligibleShoppers[0] || null;
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
  if (SHOPPER_VRM297_ONLY && arr(published[0].row.bank?.preguntas).length !== 8)
    fail('SOURCE_FAILURE:D06_PUBLISHED_QUESTION_COUNT_CHANGED');
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
    publishedQuestionCount: arr(published[0].row.bank.preguntas).length,
    eligibleShopperReadOnlySamples: eligibleShoppers.length};
  return {admin: admins[0], shopper, eligibleShoppers, periodId,
    publishedId: published[0].id, pendingId: pending[0].id};
}

async function selectExactBankPeriod(page, requested) {
  return page.evaluate(async period => {
    const d = window.CX?.data, candidates = [period,
      period.startsWith('cinepolis-') ? period.slice('cinepolis-'.length) : 'cinepolis-' + period];
    const actual = (d?.projects || []).find(p => candidates.includes(String(p.id)));
    const selected = !!actual && (d.setCurrentPeriod?.(actual.id) === true ||
      d.setProject?.(actual.id) === true);
    if(selected && typeof window.CX?.backendResources?.load === 'function')
      await window.CX.backendResources.load({periodId: actual.id});
    return {requestedPeriod: period, resolvedPeriod: actual?.id || null,
      selected, currentPeriod: d?.currentPeriodId || null,
      currentProject: d?.currentProjectId || null,
      resourceCount: window.CX?.backendResources?.list?.({resourceType:'certification_bank'})?.length || 0};
  }, requested);
}

async function saveQaViaAdminUi({admin, periodId}) {
  const cid = `qa-d05-ui-${runId}`;
  const name = `QA D05 UI ${runId} uso interno`;
  const id = ('certbank-' + PROJECT_ID + '-' + periodId + '-' + cid)
    .replace(/[^a-zA-Z0-9_-]+/g, '-');
  qaRef = db.doc(`tenants/${TENANT}/resources/${id}`);
  if ((await qaRef.get()).exists) fail('SOURCE_FAILURE:D05_QA_ID_ALREADY_EXISTS');
  const fourOptions = ['Respuesta A', 'Respuesta B', 'Respuesta C', 'Respuesta D'];
  const questions = Array.from({length: 15}, (_, n) => ({
    q: `Pregunta QA numero ${n + 1}`,
    ops: fourOptions.slice(0, FLEX_OPTIONS_QA ? (n % 2 === 0 ? 2 : 3) : 4),
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
  // A QA bank is created in the exact existing period; an authenticated
  // browser can default to the latest *other* period. Select and rehydrate the
  // same period before asserting its presence in Admin's bank selector.
  result.qa.periodSelection = await selectExactBankPeriod(page, periodId);
  if(!result.qa.periodSelection.selected || result.qa.periodSelection.currentProject !== PROJECT_ID)
    fail('SOURCE_FAILURE:D05_QA_EXACT_PERIOD_SELECTION_UNAVAILABLE');
  await page.waitForFunction(expectedName =>
    (window.CX?.backendResources?.list?.({resourceType:'certification_bank'}) || [])
      .some(x => x.bank?.certificationName === expectedName), name, {timeout: 30000});
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
  if (FLEX_OPTIONS_QA) {
    const fields = dialog.locator('fieldset');
    for (let n = 0; n < questions.length; n++) {
      const inputs = fields.nth(n).locator('input');
      if (await inputs.count() !== 5)
        fail('FUNCTIONAL_DEFECT:D05_QA_FLEX_EDITOR_FOUR_OPTIONS_NOT_RENDERED');
      for (let option = questions[n].ops.length; option < fourOptions.length; option++) {
        const empty = inputs.nth(option);
        if ((await empty.inputValue()).trim())
          fail('FUNCTIONAL_DEFECT:D05_QA_FLEX_EDITOR_EXTRA_OPTION_NOT_EMPTY');
        await empty.fill(fourOptions[option]);
      }
    }
    result.qa.flexOptionInputCounts = {two: questions.filter(q => q.ops.length === 2).length,
      three: questions.filter(q => q.ops.length === 3).length, completed: questions.length};
  }
  const field = dialog.locator('fieldset').first().locator('textarea').first();
  const revised = `Pregunta QA numero 1 corregida ${runId}`;
  await field.fill(revised);
  await dialog.getByRole('button', {name: 'Comparar cambios'}).click();
  const expectedDiff = FLEX_OPTIONS_QA
    ? `Preguntas modificadas: ${questions.map((_, n) => n + 1).join(', ')}`
    : 'Preguntas modificadas: 1';
  if (!(await dialog.getByText(expectedDiff, {exact: false}).isVisible()) ||
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
  // Compare meaningful question fields, not JSON property-insertion order.
  // Extra persisted metadata is allowed; altered questions or scope are not.
  const questionFields = ['q', 'ops', 'correcta', 'exp', 'fuente'];
  const expectedQuestions = FLEX_OPTIONS_QA
    ? questions.map(q => ({...q, ops: fourOptions})) : questions;
  const questionsUnchanged = arr(afterBank.preguntas).slice(1).every((q, n) =>
    questionFields.every(key => JSON.stringify(q?.[key]) === JSON.stringify(expectedQuestions[n + 1]?.[key])));
  const flexOptionReadback = !FLEX_OPTIONS_QA ||
    (arr(afterBank.preguntas).length === 15 && arr(afterBank.preguntas).every((q, n) =>
      JSON.stringify(q?.ops) === JSON.stringify(fourOptions) &&
      JSON.stringify(q?.ops?.slice(0, questions[n].ops.length)) === JSON.stringify(questions[n].ops) &&
      q.correcta === questions[n].correcta));
  const checks = {
    version2: saved.version === 2,
    resourceActive: saved.status === 'active',
    pendingUnpublished: afterBank.estado === 'pending_review',
    reviewVersion2: afterBank.reviewVersion === 2,
    contentRevisionChanged: afterBank.contentRevision !== revision,
    questionCount15: afterBank.preguntas?.length === 15,
    revisedFirstQuestion: afterBank.preguntas?.[0]?.q === revised,
    otherQuestionsUnchanged: questionsUnchanged,
    singleReviewHistory: afterBank.reviewHistory?.length === 1,
    historyFrom1: afterBank.reviewHistory?.[0]?.fromVersion === 1,
    historyTo2: afterBank.reviewHistory?.[0]?.toVersion === 2,
    reviewerIsAuthorizedAdmin: afterBank.ultimaRevisionPorUid === admin.uid,
    qaOnly: saved.qaOnly === true,
    qaRunIdExact: str(saved.qaRunId) === runId,
    notTargetAll: saved.targetAll === false,
    noShopperVisibleRoles: arr(saved.visibleRoles).length === 0
  };
  if (FLEX_OPTIONS_QA) checks.twoAndThreeToFourOptionsPersisted = flexOptionReadback;
  result.qa.readbackChecks = checks;
  result.qa.failedReadbackChecks = Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key);
  if (result.qa.failedReadbackChecks.length)
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
  result.qa.reloadPeriodSelection = await selectExactBankPeriod(page, periodId);
  if(!result.qa.reloadPeriodSelection.selected ||
      result.qa.reloadPeriodSelection.currentPeriod !== result.qa.periodSelection.currentPeriod)
    fail('SOURCE_FAILURE:D05_QA_RELOAD_PERIOD_NOT_RESTORED');
  await page.waitForFunction(expectedName =>
    (window.CX?.backendResources?.list?.({resourceType:'certification_bank'}) || [])
      .some(x => x.bank?.certificationName === expectedName), name, {timeout: 30000});
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
  if (FLEX_OPTIONS_QA) {
    const reloadedFields = reopened.locator('fieldset');
    for (let n = 0; n < questions.length; n++) {
      const inputs = reloadedFields.nth(n).locator('input');
      for (let option = 0; option < fourOptions.length; option++) {
        if ((await inputs.nth(option).inputValue()).trim() !== fourOptions[option])
          fail('PERSISTENCE_FAILURE:D05_QA_FLEX_OPTION_RELOAD_MISMATCH');
      }
    }
    result.qa.flexOptionsReloadReadback = true;
  }
  result.qa.reloadReadback = true;
  await reopened.screenshot({path: OUT + '/qa-review-after-reload.png'});
  result.qa.uiSuccessFeedbackObserved = result.qa.uiMessage === 'success';
  await context.close();
}

async function shopperReadOnly({shopper, publishedId, pendingId, periodId}, sessionIndex=1) {
  if (!shopper) fail('AUTH_FAILURE:D06_EXISTING_SHOPPER_MEMBERSHIP_UNAVAILABLE');
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
  const page = await authenticatedPage(shopper, context);
  const selectedPeriod = await selectExactBankPeriod(page, periodId);
  if(!selectedPeriod.selected || selectedPeriod.currentProject !== PROJECT_ID)
    fail('SOURCE_FAILURE:D06_SHOPPER_EXACT_PERIOD_SELECTION_UNAVAILABLE');
  result.shopper.periodSelection = selectedPeriod;
  const role = await page.evaluate(() => ({
    auth: window.CX?.backendAuth?.context?.()?.authenticated === true,
    role: String(window.CX?.backendAuth?.context?.()?.role || ''),
    projectIds: window.CX?.backendAuth?.context?.()?.projectIds || []
  }));
  if (!role.auth || role.role !== 'shopper' || !role.projectIds.includes(PROJECT_ID))
    fail('AUTH_FAILURE:D06_SHOPPER_ROLE_SCOPE_MISMATCH');
  const directGets = await page.evaluate(async ({pendingId, publishedId}) => {
    if (typeof window.firebase?.firestore !== 'function') return 'SDK_UNAVAILABLE';
    const check = async id => {
      try {
        await window.firebase.firestore().doc(`tenants/tya/resources/${id}`).get();
        return 'UNEXPECTED_ALLOWED';
      } catch (error) {
        return String(error?.code || '') === 'permission-denied'
          ? 'DENIED' : 'UNEXPECTED_ERROR_' + String(error?.code || 'unknown');
      }
    };
    return {pending: await check(pendingId), published: await check(publishedId)};
  }, {pendingId, publishedId});
  const pendingDirectGet = directGets.pending;
  const publishedDirectGet = directGets.published;
  if (pendingDirectGet !== 'DENIED')
    fail('FUNCTIONAL_DEFECT:D06_PENDING_BANK_DIRECT_GET_NOT_DENIED');
  if (SHOPPER_VRM297_ONLY && publishedDirectGet !== 'DENIED')
    fail('FUNCTIONAL_DEFECT:D06_PUBLISHED_BANK_DIRECT_GET_NOT_DENIED');
  await page.locator('#nav-cert').waitFor({state: 'visible', timeout: 30000});
  await page.locator('#nav-cert').click();
  await page.waitForFunction(() => window.CX?.session?.view === 'cert', null, {timeout: 30000});
  await page.waitForFunction(expectedId =>
    (window.CX?.backendResources?.list?.({resourceType: 'certification_bank'}) || [])
      .some(x => x.id === expectedId), publishedId, {timeout: 30000});
  const observed = await page.evaluate(({expectedId, unpublishedId}) => {
    const banks = window.CX?.backendResources?.list?.({resourceType: 'certification_bank'}) || [];
    const published = banks.find(x => x.id === expectedId);
    return {publishedVisible: !!published && published.bank?.estado === 'published',
      publishedQuestions: published?.bank?.preguntas?.length || 0,
      publishedAnswerKeysInBrowser: (published?.bank?.preguntas || []).some(q =>
        typeof q.correcta === 'string' && q.correcta.length > 0),
      publishedRestrictedFieldsInBrowser: (published?.bank?.preguntas || []).some(q =>
        ['correcta', 'exp', 'fuente', 'answer', 'answerKey'].some(key =>
          Object.prototype.hasOwnProperty.call(q, key))) ||
        ['answerKey', 'documentSource'].some(key =>
          Object.prototype.hasOwnProperty.call(published || {}, key)),
      resourceSource: String(window.CX_BACKEND_RESOURCES_STATUS?.source || ''),
      ordinaryProjectResourceCount: (window.CX?.backendResources?.list?.({resourceType: 'project_resource'}) || []).length,
      qaVisible: banks.some(x => x.qaOnly === true),
      unpublishedVisible: banks.some(x => x.id === unpublishedId),
      unpublishedQuestionsInBrowser: banks.find(x => x.id === unpublishedId)?.bank?.preguntas?.length || 0,
      unpublishedAnswerKeysInBrowser: (banks.find(x => x.id === unpublishedId)?.bank?.preguntas || [])
        .some(q => typeof q.correcta === 'string' && q.correcta.length > 0),
      adminControlsVisible: !!document.querySelector('#certPublish, #certReviewEdit'),
      view: String(window.CX?.session?.view || ''),
      bodyText: String(document.querySelector('#view')?.innerText || '').slice(0, 2500),
      examQuestionCount: document.querySelectorAll('#examBox input[type=radio]').length / 4,
      submitButtonAvailable: !!document.querySelector('#examGo')};
  }, {expectedId: publishedId, unpublishedId: pendingId});
  result.shopper = {status: 'HOLD', role: 'shopper', realExistingUser: true,
    publishedVisible: observed.publishedVisible,
    pendingDirectGet,
    publishedDirectGet,
    publishedQuestions: observed.publishedQuestions,
    publishedAnswerKeysInBrowser: observed.publishedAnswerKeysInBrowser,
    publishedRestrictedFieldsInBrowser: observed.publishedRestrictedFieldsInBrowser,
    resourceSource: observed.resourceSource,
    ordinaryProjectResourceCount: observed.ordinaryProjectResourceCount,
    qaVisible: observed.qaVisible,
    unpublishedVisible: observed.unpublishedVisible,
    unpublishedQuestionsInBrowser: observed.unpublishedQuestionsInBrowser,
    unpublishedAnswerKeysInBrowser: observed.unpublishedAnswerKeysInBrowser,
    adminControlsVisible: observed.adminControlsVisible,
    certificationView: observed.view === 'cert',
    examQuestionCount: observed.examQuestionCount,
    submitButtonAvailable: observed.submitButtonAvailable,
    eligibilityOrExamVisible: /Certificación vigente|preguntas|certificación histórica reutilizada/i
      .test(observed.bodyText),
    submittedAttempt: false, passwordLoginE2E: 'NOT_TESTED_CUSTOM_TOKEN'};
  if (!observed.publishedVisible || observed.publishedQuestions < 1 || observed.qaVisible ||
      observed.adminControlsVisible ||
      observed.view !== 'cert' || !result.shopper.eligibilityOrExamVisible ||
      (observed.submitButtonAvailable && observed.examQuestionCount !== observed.publishedQuestions))
    fail('FUNCTIONAL_DEFECT:D06_SHOPPER_PUBLISHED_BANK_NOT_CONSUMED');
  if (SHOPPER_VRM297_ONLY && (observed.publishedQuestions !== 8 ||
      observed.publishedRestrictedFieldsInBrowser ||
      observed.resourceSource !== 'verified-server-projection'))
    fail('FUNCTIONAL_DEFECT:D06_SHOPPER_PROJECTION_EXPOSES_PRIVATE_CONTENT_OR_MISSING_SOURCE');
  await page.screenshot({path: OUT + (sessionIndex === 1 ? '/shopper-certification-read-only.png'
    : '/shopper-certification-read-only-' + sessionIndex + '.png'), fullPage: true});
  result.shopper.status = SHOPPER_READ_ONLY && (observed.unpublishedVisible || observed.unpublishedAnswerKeysInBrowser)
    ? 'FAIL_UNPUBLISHED_BANK_CONTENT_EXPOSED_TO_SHOPPER'
    : 'PASS_EXISTING_SHOPPER_ROLE_READ_ONLY';
  await context.close();
  return result.shopper;
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
    const shopperReads = [];
    for (const [index, person] of scope.eligibleShoppers.entries()) {
      const readback = await shopperReadOnly({...scope, shopper: person}, index + 1);
      shopperReads.push({...readback, shopperUidFingerprint: sha(person.uid)});
    }
    if (!shopperReads.length) fail('AUTH_FAILURE:D06_EXISTING_SHOPPER_MEMBERSHIP_UNAVAILABLE');
    if ((SHOPPER_VRM296_ONLY || SHOPPER_VRM297_ONLY) && shopperReads.length !== 3)
      fail('AUTH_FAILURE:D06_THREE_REAL_SHOPPERS_REQUIRED');
    result.independentShopperReads = shopperReads;
    result.shopper = shopperReads[0];
    await protectRealBanks();
    if (shopperReads.some(x => x.unpublishedVisible || x.unpublishedAnswerKeysInBrowser))
      fail('FUNCTIONAL_DEFECT:D06_UNPUBLISHED_BANK_CONTENT_VISIBLE_TO_SHOPPER');
    if (SHOPPER_VRM297_ONLY && shopperReads.some(x =>
      x.pendingDirectGet !== 'DENIED' || x.publishedDirectGet !== 'DENIED' ||
      x.publishedQuestions !== 8 || x.publishedRestrictedFieldsInBrowser ||
      x.resourceSource !== 'verified-server-projection'))
      fail('FUNCTIONAL_DEFECT:D06_VRM297_THREE_SHOPPERS_SECURE_PROJECTION_FAILED');
    if (shopperReads.some(x => x.publishedAnswerKeysInBrowser)) {
      if (!SHOPPER_VRM296_ONLY)
        fail('FUNCTIONAL_DEFECT:D06_PUBLISHED_BANK_ANSWER_KEYS_VISIBLE_TO_SHOPPER');
      result.unresolvedP0 = 'VRM-297_PUBLISHED_BANK_ANSWER_KEYS_REACH_SHOPPER';
      result.decision = 'PASS_D06_VRM296_THREE_REAL_SHOPPERS_PENDING_DENIED_VRM297_OPEN';
    } else {
      result.decision = SHOPPER_VRM297_ONLY
        ? 'PASS_D06_VRM297_THREE_REAL_SHOPPERS_PUBLISHED_PENDING_DENIED_SAFE_PROJECTION'
        : 'PASS_D06_MULTI_SHOPPER_PUBLISHED_ONLY_AND_NEGATIVE_VISIBILITY_READ_ONLY';
    }
  } else {
    await saveQaViaAdminUi(scope);
    await protectRealBanks();
    await shopperReadOnly(scope);
    if (!result.qa.uiSuccessFeedbackObserved)
      fail('FUNCTIONAL_DEFECT:D05_QA_UI_SUCCESS_FEEDBACK_NOT_SEEN');
    result.decision = FLEX_OPTIONS_QA
      ? 'PASS_D05_QA_UI_TWO_THREE_TO_FOUR_OPTIONS_VERSION_2_AND_D06_SHOPPER_ROLE_READ_ONLY'
      : 'PASS_D05_QA_UI_REVIEW_VERSION_2_AND_D06_SHOPPER_ROLE_READ_ONLY';
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

