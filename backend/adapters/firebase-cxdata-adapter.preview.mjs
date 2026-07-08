/*
  CXOrbia - Firebase CX.data adapter preview
  Status: draft_safe_not_connected

  This file is intentionally not imported by app/index.html.
  It is a backend-side adapter blueprint to preserve the existing CX.data facade
  while moving storage to a clean Firestore backend later.

  No old database connection. No provider calls. No writes by default.
*/

export const CXDATA_FIRESTORE_ADAPTER_STATUS = Object.freeze({
  connectedToFrontend: false,
  writesEnabled: false,
  importsEnabled: false,
  providersEnabled: false,
  safeForRepo: true
});

const REQUIRED_SCOPE_KEYS = ['tenantId', 'projectId'];
const WRITE_METHODS = new Set(['set', 'remove', 'upsert', 'seed']);

export function assertScope(scope = {}) {
  const missing = REQUIRED_SCOPE_KEYS.filter((key) => !scope[key]);
  if (missing.length) {
    const err = new Error(`Missing CX.data backend scope: ${missing.join(', ')}`);
    err.code = 'CXDATA_SCOPE_MISSING';
    err.missing = missing;
    throw err;
  }
  return {
    tenantId: String(scope.tenantId),
    projectId: String(scope.projectId),
    role: scope.role ? String(scope.role) : 'unknown'
  };
}

export function assertWriteGate(options = {}) {
  if (options.allowWrites !== true) {
    const err = new Error('CX.data Firestore writes are blocked until an explicit gate enables them.');
    err.code = 'CXDATA_WRITES_BLOCKED';
    throw err;
  }
}

export function entityPath(scope, entityType, entityId = null) {
  const s = assertScope(scope);
  const cleanType = String(entityType || '').trim();
  if (!cleanType) {
    const err = new Error('Missing CX.data entityType.');
    err.code = 'CXDATA_ENTITY_TYPE_MISSING';
    throw err;
  }
  const base = `tenants/${s.tenantId}/projects/${s.projectId}/${cleanType}`;
  return entityId ? `${base}/${String(entityId)}` : base;
}

export function createCxDataFirestoreAdapter({ firestore = null, scope = {}, options = {} } = {}) {
  const safeScope = assertScope(scope);
  const allowWrites = options.allowWrites === true;

  async function notConnected(method) {
    if (!firestore) {
      const err = new Error(`Firestore adapter not connected for CX.data.${method}.`);
      err.code = 'CXDATA_FIRESTORE_NOT_CONNECTED';
      throw err;
    }
  }

  return {
    status: { ...CXDATA_FIRESTORE_ADAPTER_STATUS, writesEnabled: allowWrites },
    scope: safeScope,

    async get(entityType, entityId) {
      await notConnected('get');
      return { path: entityPath(safeScope, entityType, entityId), pendingImplementation: true };
    },

    async list(entityType, query = {}) {
      await notConnected('list');
      return { path: entityPath(safeScope, entityType), query, pendingImplementation: true };
    },

    async set(entityType, entityId, value) {
      await notConnected('set');
      assertWriteGate({ allowWrites });
      return { path: entityPath(safeScope, entityType, entityId), value, pendingImplementation: true };
    },

    async upsert(entityType, entityId, patch) {
      await notConnected('upsert');
      assertWriteGate({ allowWrites });
      return { path: entityPath(safeScope, entityType, entityId), patch, pendingImplementation: true };
    },

    async remove(entityType, entityId) {
      await notConnected('remove');
      assertWriteGate({ allowWrites });
      return { path: entityPath(safeScope, entityType, entityId), pendingImplementation: true };
    },

    async seed(entityType, rows = []) {
      await notConnected('seed');
      assertWriteGate({ allowWrites });
      return { path: entityPath(safeScope, entityType), count: Array.isArray(rows) ? rows.length : 0, pendingImplementation: true };
    },

    async export(entityType) {
      await notConnected('export');
      return { path: entityPath(safeScope, entityType), pendingImplementation: true };
    },

    canWrite(method) {
      return WRITE_METHODS.has(method) ? allowWrites : false;
    }
  };
}

export default createCxDataFirestoreAdapter;
