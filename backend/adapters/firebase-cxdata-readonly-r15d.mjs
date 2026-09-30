/*
  CXOrbia Phase A R15D - Firestore read-only CX.data adapter.

  Provider-neutral by injection: this module does not initialize Firebase and
  performs no writes. It hydrates a source-safe snapshot and exposes a
  synchronous facade compatible with the prototype's current CX.data reads.
*/

const BLOCKED_WRITE_RESPONSE = Object.freeze({
  ok: false,
  status: 'blocked_by_gate',
  runtimeConnected: false,
  writeExecuted: false,
  messageKey: 'ACTION_PREPARED_PENDING_BACKEND_GATE',
  auditPreviewRequired: true
});

function assertNonEmpty(value, label) {
  const clean = String(value || '').trim();
  if (!clean) {
    const error = new Error(`Missing ${label}`);
    error.code = 'CXDATA_READONLY_SCOPE_MISSING';
    throw error;
  }
  return clean;
}

function limitValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function safeProjectId(item) {
  return String(item?.id || item?.projectId || '').trim();
}

function safeCountry(item) {
  return String(item?.country || item?.pais || '').trim();
}

function normalizeDocument(doc) {
  return { id: doc.id, ...doc.data() };
}

async function listSelected(collectionRef, fields, maxResults) {
  let query = collectionRef;
  if (Array.isArray(fields) && fields.length) query = query.select(...fields);
  query = query.limit(limitValue(maxResults, 1000));
  const snapshot = await query.get();
  return snapshot.docs.map(normalizeDocument);
}

function blockedWrite(method, input = null) {
  return { ...BLOCKED_WRITE_RESPONSE, method, inputAcceptedForPreview: input !== undefined };
}

export function createFirebaseCxDataReadonlyAdapter({ db, config } = {}) {
  if (!db || typeof db.collection !== 'function') {
    const error = new Error('Firestore reader is required.');
    error.code = 'CXDATA_FIRESTORE_READER_MISSING';
    throw error;
  }
  if (!config || config.status !== 'authorized_read_only') {
    const error = new Error('R15D source-safe configuration is missing or not authorized read-only.');
    error.code = 'CXDATA_READONLY_CONFIG_INVALID';
    throw error;
  }
  if (config.authorization?.writesAuthorized !== false) {
    const error = new Error('R15D configuration must explicitly block writes.');
    error.code = 'CXDATA_WRITE_GATE_NOT_CLOSED';
    throw error;
  }

  const tenantId = assertNonEmpty(config.target?.tenantId, 'tenantId');
  const preferredProjectId = assertNonEmpty(config.target?.preferredProjectId, 'preferredProjectId');
  const fallbackProjectIds = Array.isArray(config.target?.fallbackProjectIds)
    ? config.target.fallbackProjectIds.map((item) => String(item)).filter(Boolean)
    : [];
  const tenantRef = db.collection('tenants').doc(tenantId);
  const safeFields = config.safeFields || {};
  const limits = config.limits || {};

  async function hydrate() {
    const projects = await listSelected(
      tenantRef.collection('projects'),
      safeFields.projects,
      limits.projects
    );

    const projectIds = projects.map(safeProjectId).filter(Boolean);
    const preferredProjectFound = projectIds.includes(preferredProjectId);
    const fallbackProjectId = fallbackProjectIds.find((id) => projectIds.includes(id)) || null;
    const selectedProjectId = preferredProjectFound
      ? preferredProjectId
      : (fallbackProjectId || projectIds[0] || null);

    const shoppers = await listSelected(
      tenantRef.collection('shoppers'),
      safeFields.shoppers,
      limits.shoppers
    );

    const shopperBenefits = await listSelected(
      tenantRef.collection('shopperBenefits'),
      safeFields.shopperBenefits,
      limits.shopperBenefits
    );

    const visits = [];
    const postulations = [];
    const certifications = [];
    const liquidations = [];

    for (const projectId of projectIds) {
      const projectRef = tenantRef.collection('projects').doc(projectId);
      const [projectVisits, projectPosts, projectCertifications, projectLiquidations] = await Promise.all([
        listSelected(projectRef.collection('visits'), safeFields.visits, limits.visits),
        listSelected(projectRef.collection('postulations'), safeFields.postulations, limits.postulations),
        listSelected(projectRef.collection('certifications'), safeFields.certifications, limits.certifications),
        listSelected(projectRef.collection('liquidations'), safeFields.liquidations, limits.liquidations)
      ]);
      for (const row of projectVisits) visits.push({ ...row, projectId: row.projectId || projectId });
      for (const row of projectPosts) postulations.push({ ...row, projectId: row.projectId || projectId });
      for (const row of projectCertifications) certifications.push({ ...row, projectId: row.projectId || projectId });
      for (const row of projectLiquidations) liquidations.push({ ...row, projectId: row.projectId || projectId });
    }

    return {
      source: 'firebase-firestore-readonly-r15d',
      tenantId,
      preferredProjectId,
      preferredProjectFound,
      fallbackProjectId,
      selectedProjectId,
      projects,
      shoppers,
      visits,
      postulations,
      certifications,
      liquidations,
      shopperBenefits,
      safeState: {
        providerReadOnly: true,
        writesEnabled: false,
        importsEnabled: false,
        deployEnabled: false,
        productionEnabled: false
      }
    };
  }

  return {
    status: Object.freeze({
      mode: 'firestore_readonly_r15d',
      tenantId,
      preferredProjectId,
      writesEnabled: false,
      frontendConnected: false,
      productionEnabled: false
    }),
    hydrate,
    blockedWrite
  };
}

export function createSynchronousCxDataFacade(snapshot = {}) {
  const projects = Array.isArray(snapshot.projects) ? snapshot.projects : [];
  const shoppers = Array.isArray(snapshot.shoppers) ? snapshot.shoppers : [];
  const visits = Array.isArray(snapshot.visits) ? snapshot.visits : [];
  const postulations = Array.isArray(snapshot.postulations) ? snapshot.postulations : [];
  let currentProjectId = snapshot.selectedProjectId || safeProjectId(projects[0]) || null;

  const facade = {
    projects,
    shoppers,
    _visitas: visits,
    _posts: postulations,
    get currentProjectId() { return currentProjectId; },
    set currentProjectId(value) { currentProjectId = String(value || ''); },
    project() { return this.projects.find((item) => safeProjectId(item) === currentProjectId) || null; },
    setProject(id) {
      const next = String(id || '');
      if (!this.projects.some((item) => safeProjectId(item) === next)) return null;
      currentProjectId = next;
      return this.project();
    },
    projectsFor() { return this.projects.slice(); },
    shoppersFor() {
      const project = this.project();
      const countries = Array.isArray(project?.countries)
        ? project.countries.map(String)
        : (project?.country ? [String(project.country)] : []);
      if (!countries.length) return this.shoppers.slice();
      return this.shoppers.filter((shopper) => {
        const country = safeCountry(shopper);
        return !country || countries.includes(country);
      });
    },
    visitas() { return this._visitas.filter((item) => String(item?.projectId || '') === currentProjectId); },
    posts() { return this._posts.filter((item) => String(item?.projectId || '') === currentProjectId); },
    getShopper(id) { return this.shoppers.find((item) => String(item.id) === String(id)) || null; },
    addShopper(input) { return blockedWrite('addShopper', input); },
    updateShopper(id, patch) { return blockedWrite('updateShopper', { id, patch }); },
    assignVisit(visitId, shopperId) { return blockedWrite('assignVisit', { visitId, shopperId }); },
    postularVisita(visitId, shopperId) { return blockedWrite('postularVisita', { visitId, shopperId }); },
    setVisitState(id, estado, dateField, dateVal) { return blockedWrite('setVisitState', { id, estado, dateField, dateVal }); },
    payVisits(ids, fechaPago, referencia) { return blockedWrite('payVisits', { ids, fechaPago, referencia }); },
    addProject(input) { return blockedWrite('addProject', input); }
  };

  return facade;
}

export function inspectFacadeCompatibility(facade, requiredMembers = []) {
  const missing = [];
  const memberTypes = {};
  for (const member of requiredMembers) {
    let value;
    try { value = facade[member]; } catch { value = undefined; }
    memberTypes[member] = Array.isArray(value) ? 'array' : typeof value;
    if (value === undefined || value === null) missing.push(member);
  }
  return {
    requiredCount: requiredMembers.length,
    presentCount: requiredMembers.length - missing.length,
    missing,
    memberTypes,
    compatible: missing.length === 0
  };
}

export function scanForbiddenFields(snapshot = {}, forbiddenFields = []) {
  const forbidden = new Set((forbiddenFields || []).map((item) => String(item).toLowerCase()));
  const collections = ['projects', 'shoppers', 'visits', 'postulations', 'certifications', 'liquidations', 'shopperBenefits'];
  let violationCount = 0;
  const violationCollections = new Set();
  for (const collectionName of collections) {
    for (const row of Array.isArray(snapshot[collectionName]) ? snapshot[collectionName] : []) {
      for (const key of Object.keys(row || {})) {
        if (forbidden.has(String(key).toLowerCase())) {
          violationCount += 1;
          violationCollections.add(collectionName);
        }
      }
    }
  }
  return {
    violationCount,
    violationCollectionCount: violationCollections.size,
    safe: violationCount === 0
  };
}

export default {
  createFirebaseCxDataReadonlyAdapter,
  createSynchronousCxDataFacade,
  inspectFacadeCompatibility,
  scanForbiddenFields
};
