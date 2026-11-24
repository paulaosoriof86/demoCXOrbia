import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const watcherSource = fs.readFileSync('app/adapters/tya-live-source-refresh-watch-v2.js', 'utf8');
const authoritySource = fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js', 'utf8');

function setup({ revision = 'revision-a', publishedRevision = revision, authorityAgeMs = 0, actorUid = 'admin-1', authenticated = true, protectedRuntime = true } = {}) {
  const windowListeners = new Map();
  const timerCallbacks = [];
  const requests = [];
  const reconciliations = [];
  const ctx = { authenticated, tenantId: 'tya', projectIds: ['cinepolis'], role: 'admin' };
  const data = {
    currentProjectId: 'cinepolis',
    projects: [{ id: 'oct-2026' }], _visitas: [{ id: '705' }],
    sourceMode: 'tya_hr_live_all_periods_plus_firestore_exact_overlay_dev',
    previewMeta: { sourceRevision: publishedRevision },
    __backendAllProjectRecords: [{ id: 'cinepolis', operationalSource: { mode: 'external' } }]
  };
  const dataSource = {
    status: 'ready', updating: false,
    sourceRef: 'hr-live-all-periods+firestore-authenticated-exact-overlay',
    badge: () => ({ c: '#070', t: 'Lista' })
  };
  const CX = {
    BACKEND: { tenantId: 'tya' }, data, dataSource,
    backendAuth: { context: () => ctx }, bus: { on() {}, emit() {} }, session: { view: 'midia' }
  };
  let providerRevision = revision;
  const window = {
    CX,
    firebase: { auth: () => ({ currentUser: { uid: 'admin-1' } }) },
    CX_PROTECTED_AUTH_HR_AUTHORITY: {
      applied: true, atomicPublication: true, tenantId: 'tya', projectId: 'cinepolis',
      actorUid, sourceRevision: revision, at: new Date(Date.now() - authorityAgeMs).toISOString()
    },
    CX_PROTECTED_AUTH_HR_BOOT_RECONCILE: {
      ready: true, completed: true, sourceRevision: revision
    },
    addEventListener: (event, listener) => windowListeners.set(event, listener),
    CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE: (...args) => reconciliations.push(args)
  };
  const document = {
    readyState: 'loading', body: {},
    addEventListener() {}, getElementById() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; }
  };
  const sandbox = {
    window, CX, document,
    location: { search: protectedRuntime
      ? '?cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV'
      : '?cxProjectId=cinepolis' },
    URLSearchParams, console, Date,
    fetch: async url => {
      requests.push(String(url));
      return { ok: true, json: async () => ({ sourceSafe: true, runtimeRead: true, revision: providerRevision }) };
    },
    setTimeout: () => 0,
    setInterval: callback => { timerCallbacks.push(callback); return 1; },
    requestAnimationFrame: callback => callback()
  };
  vm.runInNewContext(watcherSource, sandbox, { filename: 'tya-live-source-refresh-watch-v2.js' });
  return {
    window, CX, document, requests, reconciliations, timerCallbacks,
    setProviderRevision: rev => { providerRevision = rev; },
    authorityReady: async () => windowListeners.get('cx:protected-auth-hr-authority-ready')?.({ detail: window.CX_PROTECTED_AUTH_HR_AUTHORITY }),
    poll: async () => timerCallbacks[0]?.()
  };
}

test('A08 reuses the exact just-verified protected HR revision without a second meta GET', async () => {
  const h = setup();
  await h.authorityReady();
  assert.equal(h.requests.length, 0);
  assert.equal(h.CX.dataSource.updating, false);
  assert.equal(h.CX.data.previewMeta.sourceRevision, 'revision-a');
});

test('A08 ordinary polling still performs fresh HR meta GET after bootstrap reuse', async () => {
  const h = setup();
  await h.authorityReady();
  await h.poll();
  assert.equal(h.requests.length, 1);
  assert.match(h.requests[0], /format=meta/);
});

test('A08 newer HR revision delegates a protected reconcile without a direct snapshot overwrite', async () => {
  const h = setup();
  await h.authorityReady();
  h.setProviderRevision('revision-b');
  await h.poll();
  assert.deepEqual(h.reconciliations, [['live_watcher_revision_change', true]]);
  assert.equal(h.CX.data.previewMeta.sourceRevision, 'revision-a');
});

test('A08 mismatched published revision blocks protected watcher reads', async () => {
  const h = setup({ publishedRevision: 'revision-other' });
  await h.authorityReady();
  assert.equal(h.requests.length, 0);
  assert.equal(h.CX.dataSource.updating, false);
});

test('A08 stale verification cannot suppress the meta GET', async () => {
  const h = setup({ authorityAgeMs: 10000 });
  await h.authorityReady();
  assert.equal(h.requests.length, 1);
});

test('A08 different principal cannot suppress the meta GET', async () => {
  const h = setup({ actorUid: 'different-user' });
  await h.authorityReady();
  assert.equal(h.requests.length, 1);
});

test('A08 other project cannot reuse a revision from this protected context', async () => {
  const h = setup();
  h.window.CX_PROTECTED_AUTH_HR_AUTHORITY.projectId = 'otro-proyecto';
  await h.authorityReady();
  assert.equal(h.requests.length, 1);
});

test('A08 other tenant cannot reuse a revision from this protected context', async () => {
  const h = setup();
  h.window.CX_PROTECTED_AUTH_HR_AUTHORITY.tenantId = 'otro-tenant';
  await h.authorityReady();
  assert.equal(h.requests.length, 1);
});

test('A08 unauthenticated human context never makes a live HR request', async () => {
  const h = setup({ authenticated: false });
  await h.authorityReady();
  assert.equal(h.requests.length, 0);
});

test('A08 non-protected preview preserves its original watcher fetch', async () => {
  const h = setup({ protectedRuntime: false });
  await h.authorityReady();
  assert.equal(h.requests.length, 2);
  assert.match(h.requests[0], /format=meta/);
  assert.match(h.requests[1], /format=json/);
});

test('A08 keeps independent HR revision validation before atomic publication', () => {
  const reconcile = authoritySource.slice(authoritySource.indexOf('async function reconcile('), authoritySource.indexOf('function schedule('));
  assert.ok(reconcile.indexOf('await verifyHrRevision(scope,hr.sourceRevision)') >= 0);
  assert.ok(reconcile.indexOf('await verifyHrRevision(scope,hr.sourceRevision)') < reconcile.indexOf('publishComposition(candidate)'));
  assert.match(authoritySource, /HR_LIVE_REVISION_CHANGED_DURING_COMPOSITION/);
});

test('VRM364 same-revision protected polling finishes the updating badge',async()=>{
  const h=setup();await h.poll();
  assert.equal(h.CX.dataSource.updating,false);
  assert.equal(h.CX.dataSource.runtimeReadActive,true);
  assert.equal(h.CX.data.previewMeta.sourceRevision,'revision-a');
});
test('VRM364 fresh HR read clears its stale warning and preserves unrelated warnings',async()=>{
  const h=setup();h.CX.dataSource.warnings=['Revisión de identidad pendiente','Lectura HR viva no disponible: HTTP 503'];
  await h.poll();
  assert.deepEqual(Array.from(h.CX.dataSource.warnings),['Revisión de identidad pendiente']);
  h.document.activeElement={tagName:'INPUT'};h.setProviderRevision('revision-b');
  await h.poll();await h.poll();
  assert.equal(h.CX.dataSource.warnings.length,2);
  assert.equal(h.CX.dataSource.warnings[0],'Revisión de identidad pendiente');
});
test('VRM364 editing defers protected recomposition and closing rereads the newest revision',async()=>{
  const h=setup();h.document.activeElement={tagName:'INPUT'};
  h.setProviderRevision('revision-b');await h.poll();
  assert.equal(h.reconciliations.length,0);assert.equal(h.CX.dataSource.updating,false);
  assert.equal(h.CX.dataSource.pendingLiveRevision,'revision-b');
  assert.equal(h.CX.data.previewMeta.sourceRevision,'revision-a');
  h.setProviderRevision('revision-c');h.document.activeElement=h.document.body;
  const result=await h.window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER();
  assert.equal(result.revision,'revision-c');assert.equal(h.requests.length,2);
  assert.deepEqual(h.reconciliations,[['live_watcher_revision_change',true]]);
  assert.equal(h.CX.data.previewMeta.sourceRevision,'revision-a');
});
test('VRM364 visible modal also defers and a reverted source causes no stale recomposition',async()=>{
  const h=setup();h.document.querySelectorAll=()=>[{getClientRects:()=>[{}]}];
  h.setProviderRevision('revision-b');await h.poll();assert.equal(h.reconciliations.length,0);
  h.setProviderRevision('revision-a');h.document.querySelectorAll=()=>[];
  await h.window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER();
  assert.equal(h.requests.length,2);assert.equal(h.reconciliations.length,0);
  assert.equal(h.CX.dataSource.pendingLiveRevision,null);
});
test('VRM364 closing an editor never reuses the former authenticated context',async()=>{
  const h=setup();h.document.activeElement={tagName:'TEXTAREA'};
  h.setProviderRevision('revision-b');await h.poll();
  h.CX.backendAuth.context=()=>({authenticated:false});h.document.activeElement=h.document.body;
  await h.window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER();
  assert.equal(h.requests.length,1);assert.equal(h.reconciliations.length,0);
});
