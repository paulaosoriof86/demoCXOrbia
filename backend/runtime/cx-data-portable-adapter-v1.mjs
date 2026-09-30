const clone = value => {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
};

const array = value => Array.isArray(value) ? value : [];
const nonEmpty = value => value !== null && value !== undefined && String(value).trim() !== '';

function normalizeContext(input = {}) {
  const context = {
    tenantId: String(input.tenantId || '').trim(),
    projectId: String(input.projectId || '').trim(),
    periodId: String(input.periodId || '').trim(),
    countryScope: array(input.countryScope).map(String).filter(Boolean),
    role: String(input.role || '').trim() || null,
    sourceMode: String(input.sourceMode || 'source_safe_snapshot')
  };
  for (const key of ['tenantId', 'projectId', 'periodId']) {
    if (!context[key]) throw new Error(`Missing required context: ${key}`);
  }
  return context;
}

function validateProvider(provider) {
  if (!provider || typeof provider.loadSnapshot !== 'function') {
    throw new TypeError('provider.loadSnapshot(context) is required');
  }
}

function entityTenantMatches(entity, tenantId) {
  return !entity?.tenantId || entity.tenantId === tenantId;
}

function countryMatches(entity, scope) {
  if (!scope.length) return true;
  const country = entity?.country || entity?.pais || null;
  return !country || scope.includes(country);
}

function makeEmptyState(context) {
  return {
    context,
    source: {
      status: 'blocked_not_hydrated',
      sourceSnapshotAt: null,
      sourceReadMode: null,
      runtimeSyncActive: false,
      sourceRef: null,
      warnings: [],
      blockers: ['adapter_not_hydrated'],
      lastError: null
    },
    projects: [],
    periods: [],
    visits: [],
    posts: [],
    shoppers: []
  };
}

function validateAndSanitizeSnapshot(snapshot, context) {
  if (!snapshot || typeof snapshot !== 'object') throw new Error('Provider returned an invalid snapshot');
  if (snapshot.tenantId !== context.tenantId) {
    throw new Error(`Tenant mismatch: requested ${context.tenantId}, received ${snapshot.tenantId || 'missing'}`);
  }

  const projects = array(snapshot.projects)
    .filter(item => entityTenantMatches(item, context.tenantId))
    .map(clone);
  const periods = array(snapshot.periods)
    .filter(item => entityTenantMatches(item, context.tenantId))
    .map(clone);

  const project = projects.find(item => item.id === context.projectId || item.projectId === context.projectId);
  if (!project) throw new Error(`Project not available in tenant scope: ${context.projectId}`);

  const period = periods.find(item => (item.id === context.periodId || item.periodId === context.periodId) &&
    (item.projectId === context.projectId || item.rootProjectId === context.projectId || item.parentProjectId === context.projectId));
  if (!period) throw new Error(`Period ${context.periodId} does not belong to project ${context.projectId}`);

  const projectIds = new Set(projects.map(item => item.id || item.projectId).filter(Boolean));
  const periodIds = new Set(periods.map(item => item.id || item.periodId).filter(Boolean));

  const belongsToTenantAndKnownScope = entity => {
    if (!entityTenantMatches(entity, context.tenantId)) return false;
    const entityProjectId = entity?.rootProjectId || entity?.canonicalProjectId || entity?.parentProjectId || entity?.projectRootId || null;
    const entityPeriodId = entity?.periodId || (periodIds.has(entity?.projectId) ? entity.projectId : null);
    if (entityProjectId && !projectIds.has(entityProjectId)) return false;
    if (entityPeriodId && !periodIds.has(entityPeriodId)) return false;
    return true;
  };

  return {
    context: clone(context),
    source: {
      status: snapshot.runtimeSyncActive === true ? 'ready_runtime' : 'ready_snapshot',
      sourceSnapshotAt: snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
      sourceReadMode: snapshot.sourceReadMode || snapshot.source?.accessMode || context.sourceMode,
      runtimeSyncActive: snapshot.runtimeSyncActive === true,
      sourceRef: snapshot.sourceRef || snapshot.source?.ref || null,
      warnings: array(snapshot.warnings).map(String),
      blockers: array(snapshot.blockers).map(String),
      lastError: null
    },
    projects,
    periods,
    visits: array(snapshot.visits).filter(belongsToTenantAndKnownScope).map(clone),
    posts: array(snapshot.posts).filter(belongsToTenantAndKnownScope).map(clone),
    shoppers: array(snapshot.shoppers)
      .filter(item => entityTenantMatches(item, context.tenantId))
      .map(clone)
  };
}

export function createCxDataPortableAdapter(options = {}) {
  const provider = options.provider;
  validateProvider(provider);
  const state = makeEmptyState(normalizeContext(options.context));
  let writeGateActive = options.writeGateActive === true;
  const clock = typeof options.clock === 'function' ? options.clock : () => new Date().toISOString();

  const currentProject = () => state.projects.find(item => item.id === state.context.projectId || item.projectId === state.context.projectId) || null;
  const currentPeriod = () => state.periods.find(item => (item.id === state.context.periodId || item.periodId === state.context.periodId) &&
    (item.projectId === state.context.projectId || item.rootProjectId === state.context.projectId || item.parentProjectId === state.context.projectId)) || null;

  const periodIdOf = entity => entity?.periodId || (state.periods.some(period => (period.id || period.periodId) === entity?.projectId) ? entity.projectId : null);
  const projectIdOf = entity => entity?.rootProjectId || entity?.canonicalProjectId || entity?.parentProjectId || entity?.projectRootId ||
    state.periods.find(period => (period.id || period.periodId) === periodIdOf(entity))?.projectId || null;

  const inCurrentContext = entity => projectIdOf(entity) === state.context.projectId && periodIdOf(entity) === state.context.periodId &&
    countryMatches(entity, state.context.countryScope);

  const status = () => clone({
    ...state.source,
    tenantId: state.context.tenantId,
    projectId: state.context.projectId,
    periodId: state.context.periodId,
    countryScope: state.context.countryScope,
    role: state.context.role,
    hydrated: state.source.status === 'ready_snapshot' || state.source.status === 'ready_runtime',
    writeGateActive,
    demoFallback: false
  });

  async function hydrate(nextContext = null) {
    if (nextContext) state.context = normalizeContext({ ...state.context, ...nextContext });
    state.source = {
      ...state.source,
      status: 'loading',
      blockers: [],
      lastError: null
    };
    try {
      const snapshot = await provider.loadSnapshot(clone(state.context));
      const sanitized = validateAndSanitizeSnapshot(snapshot, state.context);
      Object.assign(state, sanitized);
      return { ok: true, status: status() };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const empty = makeEmptyState(state.context);
      Object.assign(state, empty);
      state.source.status = 'blocked_provider_error';
      state.source.lastError = message;
      state.source.blockers = ['provider_read_failed'];
      return { ok: false, code: 'PROVIDER_READ_FAILED', error: message, status: status() };
    }
  }

  function projects() {
    return clone(state.projects.filter(item => entityTenantMatches(item, state.context.tenantId)));
  }

  function periodsForProject(projectId = state.context.projectId) {
    return clone(state.periods.filter(item => item.projectId === projectId || item.rootProjectId === projectId || item.parentProjectId === projectId));
  }

  function setCurrentProject(projectId) {
    const project = state.projects.find(item => item.id === projectId || item.projectId === projectId);
    if (!project) return { ok: false, code: 'PROJECT_OUT_OF_SCOPE', projectId };
    const periods = periodsForProject(projectId);
    if (!periods.length) return { ok: false, code: 'PROJECT_WITHOUT_PERIODS', projectId };
    const previousProjectId = state.context.projectId;
    const previousPeriodId = state.context.periodId;
    state.context.projectId = projectId;
    if (!periods.some(item => (item.id || item.periodId) === state.context.periodId)) {
      state.context.periodId = periods[periods.length - 1].id || periods[periods.length - 1].periodId;
    }
    return {
      ok: true,
      changed: previousProjectId !== state.context.projectId || previousPeriodId !== state.context.periodId,
      projectId: state.context.projectId,
      periodId: state.context.periodId
    };
  }

  function setCurrentPeriod(periodId) {
    const period = state.periods.find(item => (item.id === periodId || item.periodId === periodId) &&
      (item.projectId === state.context.projectId || item.rootProjectId === state.context.projectId || item.parentProjectId === state.context.projectId));
    if (!period) return { ok: false, code: 'PERIOD_OUT_OF_PROJECT_SCOPE', periodId, projectId: state.context.projectId };
    const changed = state.context.periodId !== periodId;
    state.context.periodId = periodId;
    return { ok: true, changed, projectId: state.context.projectId, periodId: state.context.periodId };
  }

  function shoppers() {
    return clone(state.shoppers.filter(item => entityTenantMatches(item, state.context.tenantId) && countryMatches(item, state.context.countryScope)));
  }

  function shoppersFor() {
    const relevantIds = new Set(state.visits.filter(inCurrentContext).map(item => item.shopperId).filter(Boolean));
    return clone(state.shoppers.filter(item => relevantIds.has(item.id || item.shopperId) && countryMatches(item, state.context.countryScope)));
  }

  function getShopper(id) {
    if (!nonEmpty(id)) return null;
    const found = state.shoppers.find(item => (item.id === id || item.shopperId === id || item.code === id) && entityTenantMatches(item, state.context.tenantId));
    return found ? clone(found) : null;
  }

  async function mutate(operation, payload) {
    if (!writeGateActive) {
      return { ok: false, code: 'WRITE_GATE_HOLD', operation, queued: false, providerCalled: false };
    }
    if (typeof provider.mutate !== 'function') {
      return { ok: false, code: 'PROVIDER_MUTATION_UNAVAILABLE', operation, queued: false, providerCalled: false };
    }
    const command = {
      operation,
      tenantId: state.context.tenantId,
      projectId: state.context.projectId,
      periodId: state.context.periodId,
      requestedAt: clock(),
      payload: clone(payload || {})
    };
    const result = await provider.mutate(command);
    return { ok: result?.ok === true, providerCalled: true, command, result: clone(result) };
  }

  const api = {
    hydrate,
    status,
    project: () => clone(currentProject()),
    period: () => clone(currentPeriod()),
    projects,
    periodsForProject,
    setCurrentProject,
    setCurrentPeriod,
    setProject: setCurrentPeriod,
    visitas: () => clone(state.visits.filter(inCurrentContext)),
    posts: () => clone(state.posts.filter(inCurrentContext)),
    shoppers,
    shoppersFor,
    getShopper,
    addShopper: payload => mutate('addShopper', payload),
    updateShopper: payload => mutate('updateShopper', payload),
    assignVisit: payload => mutate('assignVisit', payload),
    postularVisita: payload => mutate('postularVisita', payload),
    setWriteGate(active) {
      writeGateActive = active === true;
      return status();
    }
  };

  Object.defineProperties(api, {
    currentProjectId: { enumerable: true, get: () => state.context.projectId },
    currentPeriodId: { enumerable: true, get: () => state.context.periodId },
    _visitas: { enumerable: true, get: () => clone(state.visits.filter(inCurrentContext)) },
    _posts: { enumerable: true, get: () => clone(state.posts.filter(inCurrentContext)) }
  });

  return Object.freeze(api);
}
