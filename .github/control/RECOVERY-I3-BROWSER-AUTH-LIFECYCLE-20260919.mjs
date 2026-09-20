// CXOrbia Recovery I3 — canonical browser/Auth lifecycle helper.
// Control-plane only. One owner for Admin/Client custom-token and visible Shopper login.
const transientAuth = /Execution context was destroyed|navigation|FIREBASE_SDK_NOT_READY|app-compat\/no-app|No Firebase App|auth\/network-request-failed|network AuthError|timeout|interrupted connection|unreachable host|Target page, context or browser has been closed/i;

const sval = (v) => String(v ?? '').trim();

async function waitFirebase(page, timeout = 90000) {
  await page.waitForFunction(() => !!window.firebase?.auth && Array.isArray(window.firebase?.apps) && window.firebase.apps.length > 0, null, { timeout });
}

async function waitEnsure(page, timeout = 90000) {
  await page.waitForFunction(() => typeof window.CX?.backendAuth?.ensureAuthenticated === 'function', null, { timeout });
  try {
    await page.evaluate(async () => { await window.CX.backendAuth.ensureAuthenticated(); });
  } catch (e) {
    const msg = sval(e?.message || e);
    if (!transientAuth.test(msg)) throw e;
  }
}

async function cleanNavigate(page, baseUrl, attempt = 1) {
  if (attempt > 1) {
    await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200 * attempt);
  }
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitFirebase(page);
}

export async function settleCustomRoleAuth({ page, member, role, tenantId, projectId, baseUrl, getCustomToken }) {
  let settled = false, lastError = '';
  const expectedUid = sval(member?.id);
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await cleanNavigate(page, baseUrl, attempt);
      const token = await getCustomToken();
      await page.evaluate(async (t) => {
        const fb = window.firebase;
        if (!fb?.auth || !Array.isArray(fb.apps) || !fb.apps.length) throw new Error('FIREBASE_SDK_NOT_READY');
        await fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL);
        await fb.auth().signInWithCustomToken(t);
      }, token);
    } catch (e) {
      const msg = sval(e?.message || e);
      if (!transientAuth.test(msg)) throw e;
      lastError = msg;
    }
    await page.waitForLoadState('domcontentloaded', { timeout: 90000 }).catch(() => {});
    if (!page.url().startsWith(baseUrl.split('?')[0])) await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await waitFirebase(page);
    const uid = await page.evaluate(() => String(window.firebase?.auth?.().currentUser?.uid || '')).catch(() => '');
    if (uid === expectedUid) { settled = true; break; }
    lastError = 'uid_not_persisted';
    if (attempt < 5) await page.waitForTimeout(1500 * attempt);
  }
  if (!settled) throw new Error('ENVIRONMENT_FAILURE:CUSTOM_AUTH_NOT_SETTLED:' + role + ':' + lastError.slice(0, 180));

  await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitFirebase(page);
  await page.waitForFunction((uid) => String(window.firebase?.auth?.().currentUser?.uid || '') === String(uid), expectedUid, { timeout: 90000 });
  await waitEnsure(page);
  await page.waitForFunction(({ tenantId, projectId, role }) => {
    const c = window.CX?.backendAuth?.context?.() || {};
    const actual = String(c.role || '').toLowerCase();
    const ps = Array.isArray(c.projectIds) ? c.projectIds.map(String) : [];
    const roleOk = role === 'admin' ? ['super','admin','ops','coordinador'].includes(actual) : ['cliente','client'].includes(actual);
    return c.authenticated === true && c.tenantId === tenantId && roleOk &&
      (actual === 'super' || ps.length === 0 || ps.includes(projectId)) &&
      window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true;
  }, { tenantId, projectId, role }, { timeout: 150000 });
  return await page.evaluate(() => window.CX?.backendAuth?.context?.() || {});
}

export async function settleVisibleShopperAuth({ page, expectedUid, rawShopperId, canonicalShopperId, tenantId, projectId, baseUrl, login, password }) {
  const diag = async () => page.evaluate((uid) => {
    const c = window.CX?.backendAuth?.context?.() || {};
    const u = String(window.firebase?.auth?.().currentUser?.uid || '');
    const p = window.CX?.data?.__sessionShopperProfile || {};
    return {
      selectedRole: String(window.CX?.backendAuth?.selectedRole?.() || ''),
      formRole: String(document.querySelector('#loginForm')?.dataset?.selectedRole || ''),
      authError: String(document.querySelector('#cxIntegratedAuthError')?.innerText || document.querySelector('#lgError')?.innerText || '').slice(0, 200),
      firebaseUserPresent: Boolean(u), firebaseUidMatches: u === String(uid),
      contextAuthenticated: c.authenticated === true, contextRole: String(c.role || ''),
      contextTenant: String(c.tenantId || ''), contextShopperId: String(c.shopperId || ''),
      authorityApplied: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
      profile: { id: String(p.id || p.shopperId || ''), country: String(p.pais || p.country || ''), phone: String(p.whatsapp || p.phone || ''), email: String(p.email || '') }
    };
  }, expectedUid).catch(() => ({ diagnosticUnavailable: true }));

  let lastError = '', lastDiag = {};
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await cleanNavigate(page, baseUrl, attempt);
      await page.waitForFunction(() =>
        typeof window.CX?.backendAuth?.selectedRole === 'function' &&
        !!document.querySelector('.role-btn[data-role="shopper"]') &&
        !!document.querySelector('#loginForm') &&
        !!document.querySelector('#lgUser') &&
        !!document.querySelector('#lgPass') &&
        !!document.querySelector('#lgSubmit'), null, { timeout: 60000 });

      let uid = await page.evaluate(() => String(window.firebase?.auth?.().currentUser?.uid || '')).catch(() => '');
      if (uid !== String(expectedUid)) {
        if (uid) await page.evaluate(async () => { try { await window.firebase.auth().signOut(); } catch (_) {} }).catch(() => {});
        await page.locator('.role-btn[data-role="shopper"]').click({ timeout: 30000 });
        await page.waitForFunction(() =>
          String(window.CX?.backendAuth?.selectedRole?.() || '').toLowerCase() === 'shopper' &&
          String(document.querySelector('#loginForm')?.dataset?.selectedRole || '').toLowerCase() === 'shopper',
          null, { timeout: 30000 });
        await page.locator('#lgUser').fill(login);
        await page.locator('#lgPass').fill(password);
        await page.locator('#lgSubmit').click();
      }

      await page.waitForFunction((uid) => String(window.firebase?.auth?.().currentUser?.uid || '') === String(uid), expectedUid, { timeout: 60000 });
      await waitEnsure(page, 60000);
      await page.waitForFunction(({ tenantId, projectId, rawShopperId, canonicalShopperId }) => {
        const c = window.CX?.backendAuth?.context?.() || {};
        const ps = Array.isArray(c.projectIds) ? c.projectIds.map(String) : [];
        const sid = String(c.shopperId || '');
        return c.authenticated === true && String(c.role || '').toLowerCase() === 'shopper' &&
          c.tenantId === tenantId && (ps.length === 0 || ps.includes(projectId)) &&
          (!sid || sid === String(rawShopperId || '') || sid === String(canonicalShopperId || ''));
      }, { tenantId, projectId, rawShopperId, canonicalShopperId }, { timeout: 90000 });
      await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, { timeout: 150000 });
      return await page.evaluate(() => ({
        context: window.CX?.backendAuth?.context?.() || {},
        authority: window.CX_PROTECTED_AUTH_HR_AUTHORITY || null,
        profile: window.CX?.data?.__sessionShopperProfile || {}
      }));
    } catch (e) {
      lastError = sval(e?.message || e);
      lastDiag = await diag();
      const visibleError = sval(lastDiag?.authError);
      if (visibleError && /Usuario o contraseña no válidos|no corresponde al perfil seleccionado|no tiene el alcance necesario/i.test(visibleError)) {
        throw new Error('AUTH_FAILURE:VISIBLE_LOGIN_REJECTED:' + visibleError.slice(0, 180) + ':diag:' + JSON.stringify(lastDiag).slice(0, 300));
      }
      if (!transientAuth.test(lastError)) throw e;
    }
  }
  throw new Error('ENVIRONMENT_FAILURE:VISIBLE_LOGIN_NOT_SETTLED:' + lastError.slice(0, 180) + ':diag:' + JSON.stringify(lastDiag).slice(0, 300));
}
