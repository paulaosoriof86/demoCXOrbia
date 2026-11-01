#!/usr/bin/env node
/* I3/G03 focal: read-only CRM persistence -> authenticated DEV backend projection.
   No Auth/Firestore mutations, no HR commands, no deploys, no production access. */
import fs from 'node:fs';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {chromium} from 'playwright';

const PROJECT = 'cxorbia-backend-dev';
const TENANT = 'tya';
const PROJECT_ID = 'cinepolis';
const ACCOUNT_ID = 'ac-6246c88e50534696b139';
const ROOT = 'https://cxorbia-backend-dev.web.app';
const OUT = '.tmp/cxorbia-i3-g03-protected-crm-readonly';
const array = value => Array.isArray(value) ? value : [];
const str = value => String(value ?? '').trim();
const fail = code => { throw new Error(code); };
const resultBase = {
  schemaVersion: 'cxorbia.i3.g03.protected-crm-readonly.v1',
  scope: {project: PROJECT, tenant: TENANT, projectId: PROJECT_ID, fixtureOnly: true},
  safety: {firestoreWrites: 0, authAdminWrites: 0, hrWrites: 0, deploys: 0, production: false},
};

async function inspectAuthenticatedFrontend(customToken) {
  const browser = await chromium.launch({headless: true});
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const url = `${ROOT}/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV`;
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 90000});
    await page.waitForFunction(() => !!window.firebase?.auth && Array.isArray(window.firebase.apps)
      && window.firebase.apps.length > 0, null, {timeout: 90000});
    await page.evaluate(async token => {
      const fb = window.firebase;
      await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);
      await fb.auth().signInWithCustomToken(token);
      return true;
    }, customToken);
    await page.reload({waitUntil: 'domcontentloaded', timeout: 90000});
    const applied = await page.waitForFunction(() => window.firebase?.auth?.().currentUser
      && window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, {timeout: 90000})
      .then(() => true, () => false);
    let renderedCount = null;
    if (applied) {
      await page.getByRole('button', {name: 'CRM Comercial'}).click({timeout: 30000});
      await page.getByRole('button', {name: '🏢 Cuentas'}).click({timeout: 30000});
      await page.waitForFunction(() => /Cuentas\s*\(\d+\)/.test(document.querySelector('main')?.innerText || ''),
        null, {timeout: 30000});
      renderedCount = await page.evaluate(() => {
        const matches = [...(document.querySelector('main')?.innerText || '').matchAll(/Cuentas\s*\((\d+)\)/g)];
        return matches.length ? Number(matches.at(-1)[1]) : null;
      });
    }
    const state = await page.evaluate(() => {
      const root = window.CX || {}, commercial = root.data?.__commercialState || {};
      const accounts = commercial.accounts;
      const visible = Array.isArray(accounts) ? accounts.filter(x => x?.deleted !== true) : [];
      const canonical = root.commercialCommandBoundary?.canonicalMode;
      const store = root.crmStore || {};
      // Counts and mode only: never serialize account rows, profile data or credentials.
      const countOf = fn => { try { const rows = fn(); return Array.isArray(rows) ? rows.length : null; }
        catch { return null; } };
      const storeCanonical = typeof store._canonical === 'function'
        ? (() => { try { return store._canonical(); } catch { return null; } })() : null;
      return {
        authenticated: !!window.firebase?.auth?.().currentUser,
        protectedApplied: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
        sourceRef: String(root.dataSource?.sourceRef || ''),
        project: String(root.data?.currentProjectId || ''),
        commercialArray: Array.isArray(accounts),
        commercialRawCount: Array.isArray(accounts) ? accounts.length : null,
        commercialVisibleCount: Array.isArray(accounts) ? visible.length : null,
        commercialLegacyFilterCount: Array.isArray(accounts) ? accounts.filter(x => !x?.deleted).length : null,
        commercialTruthyNonTombstones: Array.isArray(accounts)
          ? accounts.filter(x => !!x?.deleted && x.deleted !== true).length : null,
        commercialStringFalseCount: Array.isArray(accounts)
          ? accounts.filter(x => typeof x?.deleted === 'string' && x.deleted.trim().toLowerCase() === 'false').length : null,
        fixtureInState: visible.some(x => String(x?.id || '') === 'ac-6246c88e50534696b139'),
        canonicalMode: typeof canonical === 'function' ? canonical() : null,
        crmStoreCanonical: storeCanonical,
        crmStoreDirectStateCount: typeof store._state === 'function'
          ? countOf(() => store._state()?.accounts) : null,
        crmStoreDirectRowsCount: typeof store._rows === 'function'
          ? countOf(() => store._rows('accounts')) : null,
        crmStoreCount: typeof store.cuentas === 'function' ? countOf(() => store.cuentas()) : null,
        crmStoreSeedCount: Array.isArray(store._cuentas) ? store._cuentas.length : null,
        crmStoreMethodPresent: typeof store.cuentas === 'function',
      };
    });
    await context.close();
    return {...state, renderedCount, readOnly: true};
  } finally {
    await browser.close();
  }
}

function classifyFrontend(protectedResult, frontend) {
  if (!frontend) return 'FRONTEND_NOT_PROBED';
  if (frontend.probeFailed) return 'ENVIRONMENT_FAILURE_FRONTEND_PROBE';
  if (!frontend.authenticated || !frontend.protectedApplied) return 'AUTH_OR_RECONCILIATION_NOT_READY';
  if (!protectedResult.fixturePresent) return 'BACKEND_PROTECTED_MISSING';
  if (!frontend.commercialArray || !frontend.fixtureInState) return 'BRIDGE_OR_PUBLISHER_DROPS_COMMERCIAL';
  if (frontend.canonicalMode !== true) return 'CRM_COMMAND_BOUNDARY_NONCANONICAL';
  if (!Number.isInteger(frontend.crmStoreCount) || frontend.crmStoreCount < 1) {
    return frontend.commercialTruthyNonTombstones > 0
      ? 'CRM_STORE_TOMBSTONE_FILTER_FALSE_POSITIVE' : 'CRM_STORE_FILTER_OR_MAPPING';
  }
  if (!Number.isInteger(frontend.renderedCount) || frontend.renderedCount < 1) return 'CRM_RENDERER_STALE';
  return 'PASS_AUTHENTICATED_FRONTEND_ACCOUNT_VISIBLE';
}

async function run() {
  // Reuse the existing google-github-actions/auth credential in the Recovery
  // materialization job; never create or distribute another service account.
  const rawSecret = process.env.CXORBIA_G03_SA_JSON
    || (process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8') : null);
  if (!rawSecret) fail('AUTH_FAILURE:G03_DEV_SERVICE_ACCOUNT_NOT_CONFIGURED');
  let sa;
  try { sa = JSON.parse(rawSecret); } catch { fail('AUTH_FAILURE:G03_DEV_SERVICE_ACCOUNT_JSON_INVALID'); }
  if (sa.project_id !== PROJECT || !sa.private_key || !sa.client_email) {
    fail('AUTH_FAILURE:G03_DEV_SERVICE_ACCOUNT_PRIVATE_KEY_OR_PROJECT_MISMATCH');
  }
  const app = initializeApp({credential: cert(sa), projectId: PROJECT}, 'g03-readonly-diagnostic');
  const auth = getAuth(app);
  const db = getFirestore(app);

  const snap = await db.doc(`tenants/${TENANT}/crmAccounts/${ACCOUNT_ID}`).get();
  const account = snap.data() || {};
  const persisted = {exists: snap.exists, version: account.version ?? null, deleted: account.deleted === true};

  // Only the existing, uniquely identified DEV staff Admin may be used for this QA session.
  const matching = [];
  let pageToken;
  for (let page = 0; page < 10; page++) {
    const pageResult = await auth.listUsers(1000, pageToken);
    for (const user of pageResult.users) {
      const claims = user.customClaims || {};
      if (str(claims.tenantId) === TENANT && str(claims.role).toLowerCase() === 'admin'
          && str(claims.authNamespace).toLowerCase() === 'staff'
          && array(claims.projectIds).map(str).includes(PROJECT_ID) && !user.disabled) {
        matching.push(user);
      }
    }
    pageToken = pageResult.pageToken;
    if (!pageToken) break;
  }
  if (pageToken) fail('AUTH_FAILURE:G03_ADMIN_ENUMERATION_INCOMPLETE');
  if (matching.length !== 1) fail('AUTH_FAILURE:G03_ADMIN_NOT_UNIQUE');
  const principal = matching[0];
  const memberSnap = await db.doc(`tenants/${TENANT}/users/${principal.uid}`).get();
  const member = memberSnap.data() || {};
  if (!memberSnap.exists || member.active === false || str(member.role).toLowerCase() !== 'admin'
      || str(member.authNamespace).toLowerCase() !== 'staff'
      || !array(member.projectIds).map(str).includes(PROJECT_ID)) {
    fail('AUTH_FAILURE:G03_ADMIN_MEMBERSHIP_MISMATCH');
  }

  const configResponse = await fetch(`${ROOT}/__/firebase/init.json`, {signal: AbortSignal.timeout(30000)});
  if (!configResponse.ok) fail(`ENVIRONMENT_FAILURE:G03_DEV_FIREBASE_CONFIG_${configResponse.status}`);
  const config = await configResponse.json();
  if (config.projectId !== PROJECT || !config.apiKey) fail('AUTH_FAILURE:G03_DEV_FIREBASE_CONFIG_MISMATCH');

  // A temporary sign-in with an existing Admin; no account creation or IAM change.
  const customToken = await auth.createCustomToken(principal.uid);
  const signIn = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(config.apiKey)}`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({token: customToken, returnSecureToken: true}),
    signal: AbortSignal.timeout(60000),
  });
  if (!signIn.ok) fail(`AUTH_FAILURE:G03_DEV_ADMIN_SIGN_IN_HTTP_${signIn.status}`);
  const session = await signIn.json();
  if (!session.idToken || session.isNewUser === true) fail('AUTH_FAILURE:G03_DEV_ADMIN_SIGN_IN_NOT_EXISTING_USER');
  const verifiedToken = await auth.verifyIdToken(session.idToken, true);
  if (verifiedToken.uid !== principal.uid) fail('AUTH_FAILURE:G03_DEV_ADMIN_TOKEN_UID_MISMATCH');

  const url = `${ROOT}/api/tenants/${TENANT}/projects/${PROJECT_ID}/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&protectedState=1&g03ReadOnly=${Date.now()}`;
  const response = await fetch(url, {
    headers: {Authorization: `Bearer ${session.idToken}`, 'Cache-Control': 'no-cache, no-store'},
    signal: AbortSignal.timeout(150000),
  });
  if (!response.ok) fail(`AUTH_FAILURE:G03_PROTECTED_HTTP_${response.status}`);
  const envelope = await response.json();
  const commercial = envelope?._protected?.commercial;
  const accounts = commercial?.accounts;
  const hasAccountsArray = Array.isArray(accounts);
  const alive = array(accounts).filter(row => row?.deleted !== true);
  const protectedHasFixture = alive.some(row => str(row?.id) === ACCOUNT_ID);
  const protectedResult = {
    httpStatus: response.status,
    protectedState: envelope?._runtime?.protectedState === true,
    commercialAuthority: str(commercial?.authority),
    hasAccountsArray,
    rawAccounts: array(accounts).length,
    visibleAccounts: alive.length,
    fixturePresent: protectedHasFixture,
  };
  const decision = !persisted.exists || persisted.deleted ? 'HOLD_G03_PERSISTENCE'
    : !protectedResult.protectedState || !hasAccountsArray || !protectedHasFixture
      ? 'HOLD_G03_BACKEND_PROTECTED_READ_MODEL'
      : 'PASS_G03_BACKEND_PROTECTED_READ_MODEL_ONLY';
  const requireUiParity = process.env.CXORBIA_G03_REQUIRE_UI_PARITY === '1';
  let frontend = null;
  if (process.env.CXORBIA_G03_UI_TRACE === '1' && decision === 'PASS_G03_BACKEND_PROTECTED_READ_MODEL_ONLY') {
    try {
      frontend = await inspectAuthenticatedFrontend(customToken);
    } catch {
      frontend = {probeFailed: true, classification: 'ENVIRONMENT_FAILURE_FRONTEND_PROBE', readOnly: true};
    }
  }
  const frontendClassification = classifyFrontend(protectedResult, frontend);
  let independentFrontend = null;
  // A separate browser process/context and a separately minted short-lived token;
  // the existing Admin identity is never created or modified.
  if (requireUiParity && decision === 'PASS_G03_BACKEND_PROTECTED_READ_MODEL_ONLY'
      && frontendClassification === 'PASS_AUTHENTICATED_FRONTEND_ACCOUNT_VISIBLE') {
    try {
      independentFrontend = await inspectAuthenticatedFrontend(await auth.createCustomToken(principal.uid));
    } catch {
      independentFrontend = {probeFailed: true, classification: 'ENVIRONMENT_FAILURE_INDEPENDENT_FRONTEND_PROBE', readOnly: true};
    }
  }
  const independentClassification = classifyFrontend(protectedResult, independentFrontend);
  const accountExactlyOne = state => state?.authenticated === true && state?.protectedApplied === true
    && state?.fixtureInState === true && state?.canonicalMode === true
    && state?.commercialVisibleCount === 1 && state?.crmStoreCount === 1
    && state?.renderedCount === 1;
  const focalUiParity = requireUiParity
    && decision === 'PASS_G03_BACKEND_PROTECTED_READ_MODEL_ONLY'
    && protectedResult.visibleAccounts === 1
    && frontendClassification === 'PASS_AUTHENTICATED_FRONTEND_ACCOUNT_VISIBLE'
    && independentClassification === 'PASS_AUTHENTICATED_FRONTEND_ACCOUNT_VISIBLE'
    && accountExactlyOne(frontend) && accountExactlyOne(independentFrontend);
  return {...resultBase, decision, persisted, protected: protectedResult,
    frontend, frontendClassification, independentFrontend, independentClassification,
    focalUiParity, requireUiParity, frontendCertified: false,
    g03FunctionalGate: focalUiParity
      ? 'PASS_FOCAL_G03_AUTHENTICATED_CUENTAS_1__I3_HOLD'
      : 'HOLD_UNTIL_FULL_SAME_ARTIFACT_UI_AND_HUMAN_ACCEPTANCE'};
}

fs.mkdirSync(OUT, {recursive: true});
try {
  const result = await run();
  fs.writeFileSync(`${OUT}/result.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`G03_RESULT decision=${result.decision} firestoreExists=${result.persisted.exists} protectedHttp=${result.protected.httpStatus} protectedAccounts=${result.protected.visibleAccounts} fixtureInProtected=${result.protected.fixturePresent} frontendClassification=${result.frontendClassification} frontendStateAccounts=${result.frontend?.commercialVisibleCount ?? 'unknown'} frontendDomAccounts=${result.frontend?.renderedCount ?? 'unknown'} independentFrontendClassification=${result.independentClassification} independentDomAccounts=${result.independentFrontend?.renderedCount ?? 'unknown'} focalUiParity=${result.focalUiParity} frontendCertified=false`);
  console.log(JSON.stringify(result));
  if (result.requireUiParity && !result.focalUiParity) process.exitCode = 1;
} catch (error) {
  // Never print service-account material, Firebase tokens, UID, names, or payloads.
  const code = String(error?.message || '').match(/^(AUTH_FAILURE|ENVIRONMENT_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|FUNCTIONAL_DEFECT):[A-Z0-9_]+(?:_\d{3})?$/)?.[0]
    || 'ENVIRONMENT_FAILURE:G03_READONLY_DIAGNOSTIC_UNCLASSIFIED';
  const result = {...resultBase, decision: 'HOLD_G03_DIAGNOSTIC_FAILED', failureClass: code,
    frontendCertified: false, g03FunctionalGate: 'HOLD'};
  fs.writeFileSync(`${OUT}/result.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.error(JSON.stringify(result));
  process.exitCode = 1;
}
