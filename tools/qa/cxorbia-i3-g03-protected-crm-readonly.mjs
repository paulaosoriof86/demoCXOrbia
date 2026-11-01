#!/usr/bin/env node
/* I3/G03 focal: read-only CRM persistence -> authenticated DEV backend projection.
   No Auth/Firestore mutations, no HR commands, no deploys, no production access. */
import fs from 'node:fs';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

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

async function run() {
  const rawSecret = process.env.CXORBIA_G03_SA_JSON;
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
  return {...resultBase, decision, persisted, protected: protectedResult,
    frontendCertified: false, g03FunctionalGate: 'HOLD_UNTIL_AUTHENTICATED_UI_READBACK'};
}

fs.mkdirSync(OUT, {recursive: true});
try {
  const result = await run();
  fs.writeFileSync(`${OUT}/result.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`G03_RESULT decision=${result.decision} firestoreExists=${result.persisted.exists} protectedHttp=${result.protected.httpStatus} protectedAccounts=${result.protected.visibleAccounts} fixtureInProtected=${result.protected.fixturePresent} frontendCertified=false`);
  console.log(JSON.stringify(result));
} catch (error) {
  // Never print service-account material, Firebase tokens, UID, names, or payloads.
  const code = String(error?.message || '').match(/^(AUTH_FAILURE|ENVIRONMENT_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE):[A-Z0-9_]+(?:_\d{3})?$/)?.[0]
    || 'ENVIRONMENT_FAILURE:G03_READONLY_DIAGNOSTIC_UNCLASSIFIED';
  const result = {...resultBase, decision: 'HOLD_G03_DIAGNOSTIC_FAILED', failureClass: code,
    frontendCertified: false, g03FunctionalGate: 'HOLD'};
  fs.writeFileSync(`${OUT}/result.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.error(JSON.stringify(result));
  process.exitCode = 1;
}
