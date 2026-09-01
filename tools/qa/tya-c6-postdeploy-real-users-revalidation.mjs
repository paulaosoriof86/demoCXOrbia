import fs from 'node:fs';
import { chromium } from 'playwright';

const root = String(process.argv[2] || '').replace(/\/$/, '');
const privatePath = process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS || '.tmp/c6-postdeploy-readonly/private-e2e.json';
const TECHNICAL_TOKEN = 'YES_PAULA_20260801_REAL_USERS_E2E';

if (!root) throw new Error('DEV_ROOT_URL_REQUIRED');
if (!fs.existsSync(privatePath)) throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');

const credentials = JSON.parse(fs.readFileSync(privatePath, 'utf8'));
if (!credentials?.staff?.login || !credentials?.staff?.password || !credentials?.shopper?.login || !credentials?.shopper?.password) {
  throw new Error('PRIVATE_E2E_CREDENTIALS_INVALID');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function safe(value) {
  return String(value || 'unknown')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, 'REDACTED_EMAIL')
    .replace(/[^A-Z0-9_:-]/gi, '_')
    .replace(/_+/g, '_')
    .slice(0, 220);
}

function entryUrl(namespace) {
  const url = new URL(root + '/index-backend-dev.html');
  url.searchParams.set('cxTechnicalAuthE2E', TECHNICAL_TOKEN);
  url.searchParams.set('cxTechnicalAuthNamespace', namespace);
  return url.toString();
}

async function waitAuthenticated(page, namespace, label) {
  try {
    await page.waitForFunction(({ namespace }) => {
      const ctx = window.CX?.backendAuth?.context?.() || null;
      const visits = Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas.length : 0;
      const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY || null;
      return Boolean(
        ctx?.authenticated === true &&
        ctx?.authNamespace === namespace &&
        document.getElementById('app')?.classList.contains('on') &&
        window.firebase?.auth?.().currentUser &&
        visits === 616 &&
        authority?.applied === true
      );
    }, { namespace }, { timeout: 120000 });
  } catch (_error) {
    const state = await page.evaluate(() => ({
      url: location.href,
      ctx: window.CX?.backendAuth?.context?.() || null,
      visits: Array.isArray(window.CX?.data?._visitas) ? window.CX.data._visitas.length : 0,
      shoppers: Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers.length : 0,
      appOn: Boolean(document.getElementById('app')?.classList.contains('on')),
      firebaseReady: Boolean(window.firebase?.auth?.().currentUser),
      gate: window.CX_DEV_ENTRY_AUTH_GATE || null,
      authority: window.CX_PROTECTED_AUTH_HR_AUTHORITY || null
    }));
    throw new Error(
      `${label}_AUTH_WAIT_TIMEOUT_${safe(namespace)}_CTX${state.ctx?.authenticated ? 1 : 0}` +
      `_NS${safe(state.ctx?.authNamespace || 'none')}_APP${state.appOn ? 1 : 0}` +
      `_FB${state.firebaseReady ? 1 : 0}_V${state.visits}_S${state.shoppers}` +
      `_MODE${safe(state.gate?.mode || 'none')}_AUTHORITY${state.authority?.applied ? 1 : 0}`
    );
  }
}

async function snapshot(page, expectedCanonicalShopperId = '') {
  return page.evaluate(({ expectedCanonicalShopperId }) => {
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const ctx = window.CX?.backendAuth?.context?.() || null;
    const data = window.CX?.data || {};
    const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY || null;
    const rawShopperId = String(ctx?.shopperId || '').trim();
    const mappedShopperId = String((data.__identityMap || {})[rawShopperId] || rawShopperId).trim();
    const canonicalShopperId = String(expectedCanonicalShopperId || mappedShopperId).trim();
    const ownVisits = canonicalShopperId && typeof data.visitsForShopper === 'function'
      ? data.visitsForShopper(canonicalShopperId, false).length
      : 0;
    return {
      role: ctx?.role || null,
      authNamespace: ctx?.authNamespace || null,
      tenantId: ctx?.tenantId || null,
      projectIds: Array.isArray(ctx?.projectIds) ? ctx.projectIds.slice() : [],
      rawShopperId,
      mappedShopperId,
      canonicalShopperId,
      expectedCanonicalMatch: !expectedCanonicalShopperId || mappedShopperId === expectedCanonicalShopperId || rawShopperId === expectedCanonicalShopperId,
      visits: Array.isArray(data._visitas) ? data._visitas.length : 0,
      shoppers: Array.isArray(data.shoppers) ? data.shoppers.length : 0,
      ownVisits,
      appOn: Boolean(document.getElementById('app')?.classList.contains('on')),
      technicalFormVisible: visible(document.getElementById('cxDevEntryAuth')),
      humanRoleButtons: document.querySelectorAll('.role-btn').length,
      technicalStatusVisible: Boolean(document.getElementById('cxBackendPreviewStatus')),
      gate: window.CX_DEV_ENTRY_AUTH_GATE || null,
      hrAuthority: Boolean(authority?.applied),
      authorityHrVisits: Number(authority?.hrVisits || 0),
      authorityOwnVisits: Number(authority?.ownVisits || 0)
    };
  }, { expectedCanonicalShopperId });
}

function assertState(state, kind, credential, label) {
  assert(state.gate?.mode === 'technical-auth-e2e-isolated', `${label}_technical_lane_not_isolated`);
  assert(state.gate?.technicalAuthEnabled === true, `${label}_technical_gate_not_enabled`);
  assert(state.gate?.humanVisual === false, `${label}_human_lane_leaked`);
  assert(state.tenantId === 'tya', `${label}_tenant_mismatch`);
  assert(state.projectIds.includes('cinepolis') || state.role === 'super', `${label}_project_scope_missing`);
  assert(state.visits === 616, `${label}_canonical_visits_OBS${state.visits}_EXP616`);
  assert(state.shoppers === 208, `${label}_canonical_shoppers_OBS${state.shoppers}_EXP208`);
  assert(state.appOn === true, `${label}_app_not_entered`);
  assert(state.technicalFormVisible === false, `${label}_technical_form_visible_after_auth`);
  assert(state.humanRoleButtons === 0, `${label}_human_role_buttons_visible`);
  assert(state.technicalStatusVisible === false, `${label}_technical_status_visible`);
  assert(state.hrAuthority === true && state.authorityHrVisits === 616, `${label}_hr_authority_not_preserved`);

  if (kind === 'staff') {
    assert(state.authNamespace === 'staff', `${label}_namespace_mismatch`);
    assert(['super', 'admin', 'ops', 'coordinador'].includes(state.role), `${label}_role_mismatch`);
    return;
  }

  const expectedOwnVisits = Number(credential?.expectedOwnVisits || 0);
  const expectedCanonicalShopperId = String(credential?.canonicalShopperId || '');
  assert(state.authNamespace === 'shopper', `${label}_namespace_mismatch`);
  assert(state.role === 'shopper', `${label}_role_mismatch`);
  assert(Boolean(state.rawShopperId), `${label}_shopper_scope_missing`);
  assert(state.expectedCanonicalMatch === true, `${label}_identity_map_mismatch`);
  assert(state.ownVisits > 0, `${label}_own_history_empty`);
  if (expectedOwnVisits > 0) {
    assert(state.ownVisits === expectedOwnVisits, `${label}_own_history_OBS${state.ownVisits}_EXP${expectedOwnVisits}`);
    assert(state.authorityOwnVisits === expectedOwnVisits, `${label}_authority_own_OBS${state.authorityOwnVisits}_EXP${expectedOwnVisits}`);
  }
  assert(
    !expectedCanonicalShopperId || state.canonicalShopperId === expectedCanonicalShopperId || state.rawShopperId === expectedCanonicalShopperId,
    `${label}_canonical_shopper_mismatch`
  );
}

async function navigateCommitted(page, url, label) {
  await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
  assert(/\/index-backend-dev\.html/.test(new URL(page.url()).pathname), `${label}_unexpected_path`);
}

async function reloadCommitted(page, namespace, label) {
  const probe = `${label}-${Date.now()}-${Math.random()}`;
  await page.evaluate(value => { window.__CX_C6_POSTDEPLOY_RELOAD_PROBE = value; }, probe);
  let navigationWarning = null;
  try {
    await page.reload({ waitUntil: 'commit', timeout: 60000 });
  } catch (error) {
    navigationWarning = safe(error?.message || error);
    assert(/\/index-backend-dev\.html/.test(new URL(page.url()).pathname), `${label}_reload_no_committed_document_${navigationWarning}`);
  }
  await page.waitForFunction(value => window.__CX_C6_POSTDEPLOY_RELOAD_PROBE !== value, probe, { timeout: 30000 });
  await waitAuthenticated(page, namespace, label + '_after_reload');
  return navigationWarning;
}

async function runPrincipal(browser, kind, credential) {
  const namespace = kind === 'shopper' ? 'shopper' : 'staff';
  const expectedCanonicalShopperId = kind === 'shopper' ? String(credential?.canonicalShopperId || '') : '';
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const page = await context.newPage();

  await navigateCommitted(page, entryUrl(namespace), `${kind}_initial_navigation`);
  await page.waitForSelector('#cxDevEntryAuth', { state: 'visible', timeout: 60000 });
  const gate = await page.evaluate(() => window.CX_DEV_ENTRY_AUTH_GATE || null);
  assert(gate?.mode === 'technical-auth-e2e-isolated', `${kind}_technical_form_not_isolated`);

  await page.fill('#cxDevEntryLogin', credential.login);
  await page.fill('#cxDevEntryPassword', credential.password);
  await page.click('#cxDevEntrySubmit');
  await waitAuthenticated(page, namespace, `${kind}_initial_auth`);
  const first = await snapshot(page, expectedCanonicalShopperId);
  assertState(first, kind, credential, `${kind}_initial`);

  const reloadNavigationWarning = await reloadCommitted(page, namespace, `${kind}_reload`);
  const refreshed = await snapshot(page, expectedCanonicalShopperId);
  assertState(refreshed, kind, credential, `${kind}_reload`);

  const second = await context.newPage();
  await navigateCommitted(second, entryUrl(namespace), `${kind}_newtab_navigation`);
  await waitAuthenticated(second, namespace, `${kind}_newtab_auth`);
  const newTab = await snapshot(second, expectedCanonicalShopperId);
  assertState(newTab, kind, credential, `${kind}_newtab`);

  await second.close();
  await page.evaluate(async () => { try { await window.CX?.backendAuth?.signOut?.(); } catch {} });
  await context.close();

  return {
    role: first.role,
    namespace: first.authNamespace,
    visits: first.visits,
    shoppers: first.shoppers,
    ownVisits: first.ownVisits,
    hrAuthorityPreserved: first.hrAuthority,
    identityMapResolved: kind === 'staff' || first.expectedCanonicalMatch,
    reloadDocumentCommitted: true,
    reloadPreserved: refreshed.appOn,
    newTabPreserved: newTab.appOn,
    navigationWarningObserved: Boolean(reloadNavigationWarning)
  };
}

const browser = await chromium.launch({ headless: true });
try {
  const staff = await runPrincipal(browser, 'staff', credentials.staff);
  const shopper = await runPrincipal(browser, 'shopper', credentials.shopper);
  console.log(JSON.stringify({
    schemaVersion: 'cxorbia.corte6.postdeploy-real-users-readonly-revalidation.v1',
    generatedAt: new Date().toISOString(),
    decision: 'PASS_C6_POSTDEPLOY_REAL_USERS_RELOAD_NEWTAB_READONLY',
    staff,
    shopper,
    credentialsExposed: false,
    tokensExposed: false,
    providerWrites: 0,
    hostingDeploys: 0,
    merge: false,
    production: false
  }));
} finally {
  await browser.close();
}
