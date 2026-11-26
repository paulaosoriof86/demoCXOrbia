// Optional QA observation inside the two existing D08 synthetic Admin sessions.
import { createHash } from 'node:crypto';

const host = 'https://cxorbia-backend-dev.web.app';
const mode = 'MANUAL_FRESH_TWO_SHARED_PRESENTATIONS';
const revision = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const now = () => new Date().toISOString();
const check = (condition, code) => { if (!condition) throw new Error(code); };

function reason(error) {
  const text = String(error?.message || '');
  if (/^(?:AUTH_FAILURE|SOURCE_FAILURE|MAPPING_FAILURE|PERSISTENCE_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|ENVIRONMENT_FAILURE|PROVIDER_FAILURE|RELEASE_COMPOSITION_FAILURE):HR_[A-Z_]+$/.test(text)) return text;
  return error?.name === 'TimeoutError' ? 'ENVIRONMENT_FAILURE:HR_UI_TIMEOUT' : 'ENVIRONMENT_FAILURE:HR_OBSERVATION_INTERRUPTED';
}

function evaluate(page, callback, argument) {
  const evaluatePage = page.__d08NativeEvaluate || page.evaluate.bind(page);
  return evaluatePage(callback, argument);
}

async function sessionInfo(page, tenantId, projectId, runId, hrOnly=false) {
  check(new URL(page.url()).origin === host, 'RELEASE_COMPOSITION_FAILURE:HR_DEV_ORIGIN');
  const info = await evaluate(page, () => {
    const app = window.CX;
    const user = window.firebase?.auth?.().currentUser;
    const ctx = app?.backendAuth?.context?.();
    const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY;
    const data = app?.data, fresh = data?.previewMeta?.hrFreshness;
    const badge = document.getElementById('tbDataBadge');
    const badgeLabel = app?.dataSource?.badge?.()?.t;
    return {
      uid: user?.uid, sameActor: authority?.actorUid === user?.uid, role: ctx?.role,
      authenticated: ctx?.authenticated, tenant: ctx?.tenantId, project: data?.currentProjectId,
      authorizedProject: ctx?.projectIds?.includes(data?.currentProjectId),
      bound: ctx?.tenantId === authority?.tenantId && data?.currentProjectId === authority?.projectId,
      applied: authority?.applied, atomic: authority?.atomicPublication,
      revision: data?.previewMeta?.sourceRevision, authorityRevision: authority?.sourceRevision,
      scopeMode: authority?.readScope?.mode, selectedPeriod: data?.currentPeriodId || null,
      requestedPeriod: authority?.readScope?.requestedPeriodId || null,
      freshness: fresh?.state, sourceReadAt: fresh?.sourceReadAt,
      sourceMarker: document.documentElement.getAttribute('data-cx-source'),
      sourceBadge: badge?.innerText?.trim().slice(0,160) || null,
      visibleCanonicalBadge: !!(badge?.getClientRects().length && badgeLabel && badge.innerText.includes(badgeLabel))
    };
  });
  check(info.authenticated && info.sameActor && info.role === 'admin' && info.tenant === tenantId &&
    info.project === projectId && info.authorizedProject && info.bound &&
    (hrOnly ? info.uid==='qa_hr_'+runId+'_admin' : new RegExp('^qa_d08_' + runId + '_[0-9]+_admin$').test(info.uid)), 'AUTH_FAILURE:HR_SYNTHETIC_ADMIN_SCOPE');
  check(info.applied && info.atomic && revision(info.revision) && info.revision === info.authorityRevision,
    'PERSISTENCE_FAILURE:HR_APPLIED_AUTHORITY');
  const { uid, ...summary } = info;
  return { ...summary, uidSha256: createHash('sha256').update(uid).digest('hex') };
}

export function compareShared(manual, observations, pageResults) {
  check(revision(manual.revision) && revision(manual.generation) && manual.current &&
    manual.origin === 'runtime_excel_online_original' && manual.fresh &&
    manual.format === 'json' && !manual.periodParam &&
    (manual.published || manual.readModelPresent) &&
    Date.parse(manual.sourceReadAt) >= manual.start - 1000 &&
    Date.parse(manual.sourceReadAt) <= manual.received + 1000, 'PROVIDER_FAILURE:HR_MANUAL_SOURCE');
  check(observations.length === 2 && pageResults.length === 2, 'SOURCE_FAILURE:HR_SESSION_COUNT');
  for (const [index, list] of observations.entries()) {
    check(list.length === 1, 'PROVIDER_FAILURE:HR_AMBIGUOUS_SHARED_READ');
    const [read] = list;
    check(pageResults[index]?.ok === true && !pageResults[index].skipped &&
      pageResults[index].revision === manual.revision, 'FUNCTIONAL_DEFECT:HR_WATCHER_REVISION');
    check(!read.fresh && read.sync === 'due' && read.format === 'meta' && !read.periodParam &&
      read.scopeMode === 'rolling_window' && read.current === false &&
      read.origin === 'durable_internal_snapshot' && !read.published &&
      !read.sharedRefreshFailed && !read.sharedRefreshPending && read.freshnessState === 'last_confirmed' &&
      read.revision === manual.revision && read.durableGeneration === manual.generation &&
      Date.parse(read.sourceReadAt) === Date.parse(manual.sourceReadAt), 'PERSISTENCE_FAILURE:HR_SHARED_DURABLE_PROOF');
  }
  return {
    snapshotRevision: manual.revision, durableGeneration: manual.generation, sourceReadAt: manual.sourceReadAt,
    manualExternalResponseCount: 1, sharedDurableResponseCount: 2,
    genuineExternalReadsReportedBySharedResponses: 0
  };
}

async function observe(page, label, endpoint, limits, saveDueBody) {
  const events = [], errors = [], pending = new Set(), requests = new Map();
  const matches = url => url.origin === host && url.pathname === endpoint;
  const watchRequest = request => {
    const url = new URL(request.url());
    if (url.origin === host && request.method() === 'POST' && (url.pathname === '/v1/cxorbia/commands' || matches(url))) {
      limits.operationalPostAttempts++;
    }
  };
  const intercept = async route => {
    const req = route.request(), url = new URL(req.url()), query = url.searchParams;
    if (req.method() !== 'GET' || query.get('protectedState') !== '1' || query.get('readModel') !== '1') {
      limits.blocked++;
      return route.abort('blockedbyclient');
    }
    const fresh = query.get('fresh') === '1', due = query.get('sync') === 'due';
    if (fresh || due || query.has('hrPeriodId')) {
      const allowedFresh = fresh && !due && limits.phase === 'manual' && label === 'visitas' &&
        query.get('format') === 'json' && !query.has('hrPeriodId') && limits.manual === 0;
      const allowedShared = due && !fresh && limits.phase === 'shared' && !limits.shared.includes(label) &&
        query.get('format') === 'meta' && !query.has('hrPeriodId');
      if (!allowedFresh && !allowedShared) {
        limits.blocked++;
        return route.abort('blockedbyclient');
      }
      if (allowedFresh) limits.manual++;
      if (allowedShared) limits.shared.push(label);
    }
    requests.set(req, { phase: limits.phase, start: Date.now() });
    return route.fallback();
  };
  async function collect(response) {
    const request = response.request(), timing = requests.get(request);
    if (!timing) return;
    const query = new URL(response.url()).searchParams;
    check(response.status() === 200, 'PROVIDER_FAILURE:HR_HTTP_READ');
    check(/^Bearer .+/i.test((await request.headerValue('authorization')) || ''), 'AUTH_FAILURE:HR_PROTECTED_REQUEST');
    const bytes = saveDueBody ? await response.body() : null;
    const payload = bytes ? JSON.parse(bytes.toString('utf8')) : await response.json();
    if(bytes && query.get('sync')==='due')await saveDueBody(label,bytes);
    const meta = payload._runtime || payload;
    check(meta.tenantId === limits.tenantId && meta.projectId === limits.projectId && meta.runtimeRead &&
      meta.sourceSafe && meta.production === false && meta.hrWrites === false &&
      meta.operationalWrites === false && meta.imports === false, 'MAPPING_FAILURE:HR_RESPONSE_SCOPE');
    check(revision(meta.revision) && Number.isFinite(Date.parse(meta.sourceReadAt)), 'PERSISTENCE_FAILURE:HR_RESPONSE_IDENTITY');
    events.push({
      label, ...(bytes ? {bodySha256:createHash('sha256').update(bytes).digest('hex')} : {}), ...timing, received: Date.now(), format: query.get('format'), fresh: query.get('fresh') === '1',
      sync: query.get('sync'), periodParam: query.get('hrPeriodId'), queryTimestamp: query.get('ts'),
      trace: (response.headers()['x-cloud-trace-context'] || '').split('/')[0] || null,
      scopeMode: meta.readScope?.mode, periods: meta.readScope?.periodIds, currentPeriod: meta.readScope?.currentPeriodId,
      sourceReadAt: meta.sourceReadAt, current: meta.externalReadCurrent, origin: meta.cacheOrigin,
      freshnessState: meta.hrFreshness?.state, sharedRefreshFailed: meta.sharedRefreshFailed,
      sharedRefreshPending: meta.sharedRefreshPending, operationalWrites: false, hrWrites: false,
      revision: meta.revision, published: meta.readModelWriteAck?.published === true,
      readModelPresent: meta.readModelWriteAck?.readModelPresent === true,
      durableGeneration: meta.durableReadModel?.generation || null,
      generation: meta.readModelWriteAck?.generation || meta.durableReadModel?.generation || null,
      reportedExcelPeriodReads: meta.externalReadCurrent ? meta.providerReadStats?.excelOnlineOriginal?.periodReads ?? null : null
    });
  }
  const listener = response => {
    const task = collect(response).catch(error => errors.push(reason(error))).finally(() => pending.delete(task));
    pending.add(task);
  };
  page.on('response', listener);
  page.on('request', watchRequest);
  await page.route(matches, intercept);
  return {
    events, errors,
    async settle() { await Promise.all([...pending]); },
    async stop() {
      await page.unroute(matches, intercept);
      page.off('response', listener);
      page.off('request', watchRequest);
      await Promise.all([...pending]);
    }
  };
}

export async function runSharedHrAcceptance({ first, second, tenantId, projectId, runId, scope, sealedSource, saveDueBody, save = () => {} }) {
  const report = {
    schemaVersion: 'cxorbia.i3.hr-shared-live-observation.v1', decision: 'HOLD', startedAt: now(),
    runId, tenantId, projectId, sourceSha: scope?.sourceSha, pairedRunId: scope?.pairedRunId,
    application: { status: 'PENDING' }, make: { status: 'PENDING_INDEPENDENT_EXECUTION_WINDOW', measuredCredits: null },
    coldStart: { status: 'PENDING_NATIVE_INSTANCE_CORRELATION' }, production: false
  };
  const limits = { tenantId, projectId, phase: 'setup', manual: 0, shared: [], blocked: 0, operationalPostAttempts: 0 };
  const watches = [], pages = [first, second], hrOnly=scope?.syntheticNamespace==='HR_ONLY';
  try {
    check(scope?.mode === mode && scope.sourceSha === sealedSource && /^[a-f0-9]{40}$/.test(sealedSource || '') &&
      /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(scope.pairedRunId) &&
      scope.maxManualReads === 1 && scope.maxSharedChecks === 2 && /^[0-9]{8,}$/.test(runId) &&
      tenantId && projectId, 'SOURCE_FAILURE:HR_OBSERVATION_CONFIG');
    check(first && second && first.context() !== second.context() &&
      first.context().browser() && first.context().browser() === second.context().browser(), 'AUTH_FAILURE:HR_INDEPENDENT_CONTEXTS');
    report.before = await Promise.all(pages.map(page => sessionInfo(page, tenantId, projectId, runId, hrOnly)));
    check(report.before[0].uidSha256 === report.before[1].uidSha256, 'AUTH_FAILURE:HR_SYNTHETIC_ADMIN_MISMATCH');
    check(report.before.every(s => s.scopeMode === 'rolling_window' && !s.requestedPeriod && s.selectedPeriod),
      'MAPPING_FAILURE:HR_ROLLING_PRESENTATIONS_REQUIRED');
    const endpoint = '/api/tenants/' + encodeURIComponent(tenantId) + '/projects/' + encodeURIComponent(projectId) + '/hr-live';
    for (const [index, page] of pages.entries()) watches.push(await observe(page, ['visitas',hrOnly?'segunda-sesion':'academia'][index], endpoint, limits, saveDueBody));
    await evaluate(first, () => { window.CX.router.nav('visitas'); });
    const button = first.locator('#vRefreshHR');
    await button.waitFor({ state: 'visible', timeout: 10000 });
    check(await button.isEnabled(), 'FUNCTIONAL_DEFECT:HR_REFRESH_BUTTON_DISABLED');
    limits.phase = 'manual';
    report.manualWindowStart = now();
    await save(report);
    await button.click({ timeout: 10000 });
    await first.getByText('HR viva actualizada', { exact: true }).waitFor({ timeout: 95000 });
    await watches[0].settle();
    const fresh = watches[0].events.filter(r => r.phase === 'manual' && r.fresh);
    check(fresh.length === 1 && limits.manual === 1, 'PROVIDER_FAILURE:HR_MANUAL_READ_COUNT');
    const manual = fresh[0];
    const afterClick = await sessionInfo(first, tenantId, projectId, runId, hrOnly);
    check(manual.scopeMode === 'rolling_window' && Array.isArray(manual.periods) && manual.periods.includes(afterClick.selectedPeriod) &&
      afterClick.selectedPeriod === report.before[0].selectedPeriod && afterClick.uidSha256 === report.before[0].uidSha256 &&
      afterClick.revision === manual.revision, 'MAPPING_FAILURE:HR_MANUAL_PERIOD_OR_REVISION');
    report.manual = { buttonId: 'vRefreshHR', toast: 'HR viva actualizada', observed: manual, applied: afterClick };
    limits.phase = 'shared';
    report.sharedWindowStart = now();
    await save(report);
    // The existing editor_closed consumer asks the real synchronizer whether a refresh is due.
    // It bypasses only per-tab throttling; it does not force an external read.
    const sharedResults = await Promise.allSettled(pages.map(page => evaluate(page, async () => {
      if (typeof window.CX_TYA_CHECK_LIVE_SOURCE !== 'function') return { ok: false };
      // Keep the optional observer bounded independently of D08's own deadlines.
      let timer;
      try {
        const result = await Promise.race([
          window.CX_TYA_CHECK_LIVE_SOURCE('editor_closed'),
          new Promise(resolve => { timer = setTimeout(() => resolve({ ok: false, reason: 'timed_out' }), 60000); })
        ]);
        return { ok: result?.ok, skipped: result?.skipped === true, changed: result?.changed === true,
          revision: result?.revision || null, delegated: result?.delegated === true, deferred: result?.deferred === true,
          timedOut: result?.reason === 'timed_out' };
      } finally { clearTimeout(timer); }
    })));
    check(sharedResults.every(x => x.status === 'fulfilled'), 'ENVIRONMENT_FAILURE:HR_WATCHER_OBSERVATION');
    report.watcherResults = sharedResults.map(x => x.value);
    await Promise.all(watches.map(w => w.settle()));
    check(watches.every(w => !w.errors.length) && !limits.blocked && !limits.operationalPostAttempts,
      'PROVIDER_FAILURE:HR_UNEXPECTED_REQUEST');
    report.proof = compareShared(manual, watches.map(w => w.events.filter(x => x.sync === 'due')), report.watcherResults);
    // A delegated watcher returns before the protected bridge publishes its JSON and meta readback.
    // Observe completion in the page without issuing another sync or external read.
    await Promise.all(report.watcherResults.map(async (watcher, i) => {
      if (!watcher.delegated) return;
      try {
        await pages[i].waitForFunction(expected => {
          const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY;
          return authority?.applied && authority.atomicPublication && authority.sourceRevision === expected &&
            window.CX?.data?.previewMeta?.sourceRevision === expected;
        }, manual.revision, { timeout: 30000 });
      } catch (error) {
        if (error?.name !== 'TimeoutError') throw error;
      }
    }));
    await Promise.all(watches.map(w => w.settle()));
    check(watches.every(w => !w.errors.length) && !limits.blocked && !limits.operationalPostAttempts,
      'PROVIDER_FAILURE:HR_UNEXPECTED_REQUEST');
    const auxiliary = watches.flatMap(w => w.events).filter(r => !r.fresh && r.sync !== 'due');
    check(auxiliary.every(r => r.current === false && r.origin === 'durable_internal_snapshot' && !r.published),
      'PROVIDER_FAILURE:HR_AUXILIARY_EXTERNAL_READ');
    report.auxiliaryDurableResponses = auxiliary.length;
    report.after = await Promise.all(pages.map(page => sessionInfo(page, tenantId, projectId, runId, hrOnly)));
    check(report.after.every((s, i) => s.revision === manual.revision && s.uidSha256 === report.before[i].uidSha256 &&
      s.selectedPeriod === report.before[i].selectedPeriod), 'PERSISTENCE_FAILURE:HR_APPLIED_SESSION_REVISION');
    report.proof.appliedSessionRevisions = report.after.map(s => ({ revision: s.revision, period: s.selectedPeriod }));
    check(report.after.every(s => s.freshness === 'last_confirmed' && s.sourceReadAt === manual.sourceReadAt &&
      s.sourceMarker === 'hr-last-confirmed' && s.visibleCanonicalBadge &&
      s.sourceBadge?.includes('última sincronización') && !s.sourceBadge.includes('sin fecha confirmada')),
      'VISUAL_DEFECT:HR_LAST_CONFIRMED_BADGE');
    report.application.status = 'PASS_MANUAL_AND_TWO_SHARED_DURABLE_PRESENTATIONS';
  } catch (error) {
    report.application = { status: 'HOLD', cause: reason(error) };
  } finally {
    const ended = await Promise.allSettled(watches.map(w => w.stop()));
    if (ended.some(item => item.status === 'rejected')) report.application = { status: 'HOLD', cause: 'ENVIRONMENT_FAILURE:HR_OBSERVER_RELEASE' };
    report.finishedAt = now();
    report.requests = { manualFresh: limits.manual, sharedDue: limits.shared.length,
      blockedOutOfScope: limits.blocked, operationalPostAttempts: limits.operationalPostAttempts };
    report.events = watches.flatMap(w => w.events);
    report.observationErrors = watches.flatMap(w => w.errors);
    await save(report);
  }
  return report;
}
