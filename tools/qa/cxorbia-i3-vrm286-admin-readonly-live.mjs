#!/usr/bin/env node
/* I3/VRM-286: authenticated Admin project/period UI readback on DEV.
   Existing staff principal only. No user creation, provider mutations,
   data repair, Firebase writes, deployments or production access. */
import fs from 'node:fs';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROJECT_ID = 'cinepolis';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const SOURCE = '09eed4f012f9ad04e49d53569aabd86bd4c832a9';
const OUT = '.tmp/cxorbia-i3-vrm286-admin-readonly';
const str = x => String(x ?? '').trim();
const arr = x => Array.isArray(x) ? x : [];
const fail = code => { throw new Error(code); };
const evidence = {
  schemaVersion: 'cxorbia.i3.vrm286.admin-readonly-dev.v1',
  scope: 'EXACT_AUTHENTICATED_ADMIN_UI_VS_PROTECTED_IN_MEMORY_PERIOD_MAPPING',
  sourceSha: SOURCE,
  environment: PROJECT,
  project: PROJECT_ID,
  status: 'HOLD',
  safe: {authUsersCreated: 0, firestoreWrites: 0, hrWrites: 0,
    providerCommands: 0, deploys: 0, production: false},
  humanAcceptance: 'PENDING',
  externalHrRevisionApproval: 'NOT_EVALUATED_BY_THIS_TEST'
};
fs.mkdirSync(OUT, {recursive: true});
let browser;

async function run() {
  if (str(process.env.CXORBIA_PRODUCT_SOURCE_SHA) !== SOURCE)
    fail('RELEASE_COMPOSITION_FAILURE:VRM286_SOURCE_PIN');
  const credentialFile = str(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!credentialFile) fail('AUTH_FAILURE:DEV_SERVICE_ACCOUNT_NOT_AVAILABLE');
  const sa = JSON.parse(fs.readFileSync(credentialFile, 'utf8'));
  if (sa.project_id !== PROJECT || !sa.private_key || !sa.client_email)
    fail('AUTH_FAILURE:DEV_SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const app = initializeApp({credential: cert(sa), projectId: PROJECT}, 'vrm286-readonly');
  const auth = getAuth(app);
  const db = getFirestore(app);
  const matching = [];
  let pageToken;
  for (let page = 0; page < 10; page++) {
    const batch = await auth.listUsers(1000, pageToken);
    for (const user of batch.users) {
      const claims = user.customClaims || {};
      if (str(claims.tenantId) === TENANT && str(claims.role).toLowerCase() === 'admin'
          && str(claims.authNamespace).toLowerCase() === 'staff'
          && arr(claims.projectIds).map(str).includes(PROJECT_ID) && !user.disabled)
        matching.push(user);
    }
    pageToken = batch.pageToken;
    if (!pageToken) break;
  }
  if (pageToken || matching.length !== 1) fail('AUTH_FAILURE:VRM286_ADMIN_NOT_UNIQUE');
  const admin = matching[0];
  const membership = await db.doc('tenants/' + TENANT + '/users/' + admin.uid).get();
  const member = membership.data() || {};
  if (!membership.exists || member.active === false ||
      str(member.role).toLowerCase() !== 'admin' ||
      str(member.authNamespace).toLowerCase() !== 'staff' ||
      !arr(member.projectIds).map(str).includes(PROJECT_ID))
    fail('AUTH_FAILURE:VRM286_ADMIN_MEMBERSHIP_MISMATCH');

  const customToken = await auth.createCustomToken(admin.uid);
  browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  const page = await context.newPage();
  const url = ROOT + '/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV' +
    '&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV' +
    '&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => !!window.firebase?.auth && Array.isArray(window.firebase.apps)
    && window.firebase.apps.length > 0, null, {timeout: 90000});
  await page.evaluate(async token => {
    await window.firebase.auth().setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
    await window.firebase.auth().signInWithCustomToken(token);
  }, customToken);
  await page.reload({waitUntil: 'domcontentloaded', timeout: 90000});
  await page.waitForFunction(() => !!window.firebase?.auth?.().currentUser &&
    window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, {timeout: 90000});
  await page.waitForFunction(() => !!window.CX?.data?.periodosDe &&
    Array.isArray(window.CX?.data?._visitas) && window.CX.data._visitas.length > 0 &&
    window.CX.data.periodosDe('cinepolis').length > 0, null, {timeout: 90000});
  const nav = page.locator('#nav-proyectos');
  if (!(await nav.isVisible())) fail('UI_FAILURE:VRM286_PROJECTS_NAV_NOT_VISIBLE');
  await nav.click({timeout: 30000});
  await page.waitForFunction(() => !!document.querySelector('[data-pgkey="cinepolis"]'),
    null, {timeout: 30000});
  const readback = await page.evaluate(() => {
    const cx = window.CX;
    const data = cx.data;
    const periods = data.periodosDe('cinepolis');
    const periodIds = new Set(periods.map(x => String(x.id)));
    const visits = data._visitas;
    const eligible = visits.filter(row => {
      const pid = typeof data.recordPeriodId === 'function'
        ? data.recordPeriodId(row) : (row.periodId || row.projectId);
      return periodIds.has(String(pid)) &&
        (typeof data.inScope !== 'function' || data.inScope(row.pais));
    });
    const group = document.querySelector('[data-pgkey="cinepolis"]');
    const text = group?.innerText || '';
    const countBadge = [...(group?.querySelectorAll('.bdg') || [])]
      .map(x => String(x.textContent || '').trim()).find(x => /visitas/i.test(x));
    const countMatch = countBadge?.match(/([0-9]+) visitas/i);
    return {
      authenticated: !!window.firebase.auth().currentUser,
      protectedApplied: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
      role: String(cx.backendAuth?.context?.()?.role || '').toLowerCase(),
      groupVisible: !!group,
      visitRowsHydrated: visits.length,
      approvedProjectPeriodCount: periods.length,
      periodChipsRendered: group?.querySelectorAll('[data-pid]')?.length ?? null,
      sourceDerivedVisitCount: eligible.length,
      renderedVisitCount: countMatch ? Number(countMatch[1]) : null,
      renderedPeriodLabel: /periodos/i.test(text),
      sourceRefPresent: !!String(cx.dataSource?.sourceRef || '')
    };
  });
  if (!readback.authenticated || !readback.protectedApplied ||
      !['admin','super'].includes(readback.role))
    fail('AUTH_FAILURE:VRM286_PROTECTED_ADMIN_CONTEXT');
  if (!readback.groupVisible || readback.approvedProjectPeriodCount < 1 ||
      readback.visitRowsHydrated < 1)
    fail('SOURCE_FAILURE:VRM286_PROJECTS_NOT_HYDRATED');
  if (!Number.isInteger(readback.renderedVisitCount) ||
      readback.renderedVisitCount !== readback.sourceDerivedVisitCount)
    fail('UI_FAILURE:VRM286_VISIT_COUNT_DIVERGENCE');
  if (readback.periodChipsRendered !== readback.approvedProjectPeriodCount)
    fail('UI_FAILURE:VRM286_PERIOD_CHIP_COUNT_DIVERGENCE');
  evidence.status = 'PASS_AUTHENTICATED_ADMIN_PROJECT_PERIOD_READ_MODEL_UI';
  evidence.readback = readback;
  evidence.fullDomainMatch = false;
  evidence.production = false;
  await context.close();
}

try {
  await run();
} catch (error) {
  evidence.status = 'HOLD_VRM286_READONLY_E2E';
  evidence.failureCode = /^[A-Z_]+:[A-Z0-9_]+$/.test(str(error?.message))
    ? str(error.message) : 'ENVIRONMENT_FAILURE:VRM286_E2E_UNCLASSIFIED';
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  fs.writeFileSync(OUT + '/result.json', JSON.stringify(evidence, null, 2) + '\n');
  process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
}
