export const RUNTIME_STATE_ORDER = Object.freeze([
  'AUTH_READY',
  'CLAIMS_READY',
  'MEMBERSHIP_READY',
  'DATA_READY',
  'SHELL_READY',
  'ROUTE_READY',
  'VIEW_READY',
  'DOMAIN_READY'
]);

export class RuntimeStateError extends Error {
  constructor(state, code, snapshot, timeline = []) {
    super(`${code}:${state}`);
    this.name = 'RuntimeStateError';
    this.state = state;
    this.code = code;
    this.snapshot = snapshot;
    this.timeline = timeline;
  }
}

const text = value => String(value ?? '').trim();

export function createStateLedger(providerProof = {}) {
  const claimsReady = providerProof.claimsExact === true;
  const membershipReady = providerProof.membershipExact === true;
  return {
    schemaVersion: 'cxorbia.runtime-state-ledger.v1',
    generatedAt: new Date().toISOString(),
    order: RUNTIME_STATE_ORDER.slice(),
    provider: {
      AUTH_READY: providerProof.passwordSignIn === true,
      CLAIMS_READY: claimsReady,
      MEMBERSHIP_READY: membershipReady,
      source: providerProof.source || 'provider_readback'
    },
    browser: {},
    transitions: []
  };
}

export function assertProviderStates(ledger) {
  for (const state of ['AUTH_READY', 'CLAIMS_READY', 'MEMBERSHIP_READY']) {
    if (ledger?.provider?.[state] !== true) {
      throw new RuntimeStateError(state, `PROVIDER_${state}_NOT_READY`, ledger?.provider || null, ledger?.transitions || []);
    }
  }
  return true;
}

export async function captureBrowserSnapshot(page, expected = {}) {
  return page.evaluate(expectedInput => {
    const expected = expectedInput || {};
    const ctx = window.CX?.backendAuth?.context?.() || null;
    const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY || null;
    const data = window.CX?.data || {};
    const session = window.CX?.session || {};
    const app = document.getElementById('app');
    const rail = document.getElementById('rail');
    const view = document.getElementById('view');
    const routeId = session.view || null;
    const expectedRoute = expected.expectedRoute || null;
    const expectedRole = expected.expectedRole || null;
    const allowedRoles = Array.isArray(expected.allowedRoles) ? expected.allowedRoles : [];
    const expectedNamespace = expected.expectedNamespace || null;
    const expectedTenantId = expected.expectedTenantId || null;
    const expectedProjectId = expected.expectedProjectId || null;
    const navItem = expectedRoute ? document.getElementById(`nav-${expectedRoute}`) : null;
    const pageHeader = view?.querySelector('.ph') || null;
    const viewText = (view?.innerText || '').trim();
    let confidentialityPending = false;
    try {
      confidentialityPending = Boolean(window.CX?.confidencialidad?.pending?.(session.role));
    } catch (_) {
      confidentialityPending = false;
    }
    const projectIds = Array.isArray(ctx?.projectIds) ? ctx.projectIds.slice() : [];
    const authReady = ctx?.authenticated === true;
    const roleReady = allowedRoles.length
      ? allowedRoles.includes(String(ctx?.role || ''))
      : (!expectedRole || String(ctx?.role || '') === String(expectedRole));
    const namespaceReady = !expectedNamespace || ctx?.authNamespace === expectedNamespace;
    const tenantReady = !expectedTenantId || ctx?.tenantId === expectedTenantId;
    const projectReady = !expectedProjectId || projectIds.includes(expectedProjectId);
    const claimsReady = authReady && roleReady && namespaceReady && tenantReady && projectReady;
    const dataReady = Boolean(
      authority?.applied === true &&
      Number(authority?.periods || 0) > 0 &&
      Number(authority?.hrVisits || 0) > 0 &&
      Array.isArray(data.projects) && data.projects.length === Number(authority.periods || 0) &&
      Array.isArray(data._visitas) && data._visitas.length === Number(authority.hrVisits || 0) &&
      data.currentProjectId && data.currentPeriodId
    );
    const routerAvailable = typeof window.CX?.router?.nav === 'function';
    const railBuilt = Boolean(rail && rail.querySelector('[id^="nav-"]'));
    const viewContainerPresent = Boolean(view);
    const appVisible = app?.classList.contains('on') === true;
    const shellReady = Boolean(appVisible && routerAvailable && railBuilt && viewContainerPresent && !confidentialityPending);
    const routeReady = !expectedRoute || routeId === expectedRoute;
    const navItemPresent = !expectedRoute || Boolean(navItem);
    const navActive = Boolean(navItem?.classList.contains('active'));
    const pageHeaderPresent = Boolean(pageHeader);
    const viewRendered = Boolean(view && viewText.length > 0);
    const viewReady = Boolean(routeReady && pageHeaderPresent && viewRendered);
    const blocked = /Fuente de datos no disponible|Sin proyectos disponibles|Sin periodos disponibles/i.test(viewText + ' ' + (rail?.innerText || ''));
    const domainReady = Boolean(claimsReady && dataReady && shellReady && routeReady && viewReady && !blocked);
    return {
      capturedAt: new Date().toISOString(),
      expected,
      role: ctx?.role || null,
      namespace: ctx?.authNamespace || null,
      tenantId: ctx?.tenantId || null,
      projectIds,
      shopperId: ctx?.shopperId || null,
      sessionRole: session.role || null,
      routeId,
      currentProjectId: data.currentProjectId || null,
      currentPeriodId: data.currentPeriodId || null,
      periods: Array.isArray(data.projects) ? data.projects.length : -1,
      visits: Array.isArray(data._visitas) ? data._visitas.length : -1,
      shoppers: Array.isArray(data.shoppers) ? data.shoppers.length : -1,
      authorityPeriods: Number(authority?.periods || 0),
      authorityVisits: Number(authority?.hrVisits || 0),
      authorityShoppers: Number(authority?.hrShoppers || 0),
      firstPeriod: authority?.firstPeriod || null,
      latestPeriod: authority?.latestPeriod || null,
      duplicateVisitKeys: Number(authority?.duplicateVisitKeys || 0),
      duplicateShopperIds: Number(authority?.duplicateShopperIds || 0),
      appVisible,
      routerAvailable,
      railBuilt,
      viewContainerPresent,
      confidentialityPending,
      navItemPresent,
      navActive,
      pageHeaderPresent,
      heading: pageHeader?.querySelector('.ph-t')?.textContent?.trim() || null,
      viewRendered,
      blocked,
      state: {
        AUTH_READY: authReady,
        CLAIMS_READY: claimsReady,
        DATA_READY: dataReady,
        SHELL_READY: shellReady,
        ROUTE_READY: routeReady,
        VIEW_READY: viewReady,
        DOMAIN_READY: domainReady
      }
    };
  }, expected);
}

function statePredicate(snapshot, state) {
  if (state === 'MEMBERSHIP_READY') return true;
  return snapshot?.state?.[state] === true;
}

export async function waitForRuntimeState(page, state, expected = {}, options = {}) {
  if (!RUNTIME_STATE_ORDER.includes(state)) throw new Error(`UNKNOWN_RUNTIME_STATE:${state}`);
  if (state === 'MEMBERSHIP_READY') throw new Error('MEMBERSHIP_READY_IS_PROVIDER_STATE');
  const timeoutMs = Number(options.timeoutMs || 90000);
  const pollMs = Number(options.pollMs || 250);
  const started = Date.now();
  const timeline = [];
  let last = null;
  let lastDigest = '';
  while (Date.now() - started <= timeoutMs) {
    last = await captureBrowserSnapshot(page, expected);
    const digest = JSON.stringify({ state: last.state, routeId: last.routeId, confidentialityPending: last.confidentialityPending, navItemPresent: last.navItemPresent, navActive: last.navActive, heading: last.heading });
    if (digest !== lastDigest) {
      timeline.push({ elapsedMs: Date.now() - started, state, snapshot: last });
      lastDigest = digest;
    }
    if (statePredicate(last, state)) {
      return { state, elapsedMs: Date.now() - started, snapshot: last, timeline };
    }
    await page.waitForTimeout(pollMs);
  }
  throw new RuntimeStateError(state, `TIMEOUT_${state}`, last, timeline);
}

export async function waitForBrowserLifecycle(page, expected = {}, options = {}) {
  const ledger = [];
  for (const state of ['AUTH_READY', 'CLAIMS_READY', 'DATA_READY', 'SHELL_READY']) {
    const transition = await waitForRuntimeState(page, state, expected, options);
    ledger.push(transition);
  }
  return ledger;
}

export async function navigateAndWait(page, routeId, expected = {}, options = {}) {
  const shell = await waitForRuntimeState(page, 'SHELL_READY', expected, options);
  const navigation = await page.evaluate(id => {
    const routerAvailable = typeof window.CX?.router?.nav === 'function';
    const moduleAvailable = typeof window.CX?.modules?.[id] === 'function';
    if (!routerAvailable) return { requested: false, routerAvailable, moduleAvailable, routeAfterRequest: window.CX?.session?.view || null };
    window.CX.router.nav(id);
    return { requested: true, routerAvailable, moduleAvailable, routeAfterRequest: window.CX?.session?.view || null };
  }, routeId);
  if (!navigation.requested) {
    const snapshot = await captureBrowserSnapshot(page, { ...expected, expectedRoute: routeId });
    throw new RuntimeStateError('ROUTE_READY', 'ROUTER_NAV_UNAVAILABLE', snapshot, [shell]);
  }
  const routeExpected = { ...expected, expectedRoute: routeId };
  const route = await waitForRuntimeState(page, 'ROUTE_READY', routeExpected, options);
  const view = await waitForRuntimeState(page, 'VIEW_READY', routeExpected, options);
  const domain = await waitForRuntimeState(page, 'DOMAIN_READY', routeExpected, options);
  return {
    navigation,
    shell,
    route,
    view,
    domain,
    navHighlightObserved: domain.snapshot.navActive === true,
    snapshot: domain.snapshot
  };
}

export function sanitizeRuntimeError(error) {
  const raw = {
    name: error?.name || 'Error',
    message: text(error?.message || error),
    code: error?.code || null,
    state: error?.state || null,
    snapshot: error?.snapshot || null,
    timeline: Array.isArray(error?.timeline) ? error.timeline : []
  };
  return JSON.parse(JSON.stringify(raw).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, 'REDACTED_EMAIL'));
}

export function classifyRuntimeFailure(error) {
  const state = error?.state || null;
  if (['AUTH_READY', 'CLAIMS_READY', 'MEMBERSHIP_READY'].includes(state)) return 'PRODUCT_ACCESS_OR_CONFIGURATION';
  if (state === 'DATA_READY') return 'PRODUCT_DATA_AUTHORITY';
  if (['SHELL_READY', 'ROUTE_READY', 'VIEW_READY'].includes(state)) return 'PRODUCT_RUNTIME_LIFECYCLE';
  if (state === 'DOMAIN_READY') return 'PRODUCT_DOMAIN';
  if (/HARNESS|SCRIPT|SYNTAX|CONTRACT|REQUEST/i.test(String(error?.message || ''))) return 'TEST_HARNESS_OR_GOVERNANCE';
  return 'UNCLASSIFIED_REQUIRES_REVIEW';
}
