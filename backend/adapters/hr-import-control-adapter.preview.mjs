/*
  CXOrbia - HR import control adapter preview
  Status: draft_safe_not_connected

  This file is intentionally not imported by app/index.html.
  It prepares sanitized HR import run records, staging row records and conflict
  descriptors without connecting old databases, writing Firestore or storing raw HR payloads.
*/

export const HR_IMPORT_CONTROL_ADAPTER_STATUS = Object.freeze({
  connectedToFrontend: false,
  oldDatabaseConnected: false,
  importWritesEnabled: false,
  hrWritesEnabled: false,
  safeForRepo: true
});

const REQUIRED_SCOPE_KEYS = ['tenantId', 'projectId'];
const REQUIRED_IMPORT_KEYS = ['importRunId', 'hrSourceId', 'mode', 'sourcePeriodFrom', 'sourcePeriodTo', 'auditRef'];
const REQUIRED_ROW_KEYS = ['hrRowId', 'importRunId', 'country', 'periodKey', 'quincena', 'visitSourceKey', 'shopperSourceKey', 'visitStatus', 'assignmentStatus', 'questionnaireStatus', 'paymentControlStatus', 'auditRef'];
const FORBIDDEN_FIELDS = ['rawHrWorkbook', 'rawHrCsv', 'rawDpi', 'rawPassport', 'rawBankAccount', 'rawPhone', 'rawEmail', 'signedNdaFile', 'privateHrUrl', 'hrCredential', 'serviceAccountJson', 'rawEvidenceBinary', 'base64Evidence'];
const ALLOWED_IMPORT_MODES = new Set(['dry_run', 'staging_sanitized', 'promote_reviewed', 'rollback']);

export function assertHrImportScope(scope = {}) {
  const missing = REQUIRED_SCOPE_KEYS.filter((key) => !scope[key]);
  if (missing.length) {
    const err = new Error(`Missing HR import scope: ${missing.join(', ')}`);
    err.code = 'HR_IMPORT_SCOPE_MISSING';
    err.missing = missing;
    throw err;
  }
  return {
    tenantId: String(scope.tenantId),
    projectId: String(scope.projectId),
    actorId: scope.actorId ? String(scope.actorId) : 'unknown',
    role: scope.role ? String(scope.role) : 'unknown'
  };
}

export function assertNoRawHrPayload(payload = {}) {
  for (const field of FORBIDDEN_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const err = new Error(`HR import payload includes forbidden raw/sensitive field: ${field}`);
      err.code = 'HR_IMPORT_FORBIDDEN_FIELD';
      err.field = field;
      throw err;
    }
  }
  return payload;
}

export function assertImportWriteGate(options = {}) {
  if (options.allowImportWrites !== true) {
    const err = new Error('HR import writes are blocked until an explicit gate enables them.');
    err.code = 'HR_IMPORT_WRITE_GATE_BLOCKED';
    throw err;
  }
}

export function assertHrWriteGate(options = {}) {
  if (options.allowHrWrites !== true) {
    const err = new Error('HR writeback is blocked until Make/HR sync gate enables it.');
    err.code = 'HR_WRITE_GATE_BLOCKED';
    throw err;
  }
}

export function importRunPath(scope, importRunId) {
  const s = assertHrImportScope(scope);
  if (!importRunId) {
    const err = new Error('Missing importRunId.');
    err.code = 'HR_IMPORT_RUN_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/projects/${s.projectId}/hrImportRuns/${String(importRunId)}`;
}

export function stagingRowPath(scope, hrRowId) {
  const s = assertHrImportScope(scope);
  if (!hrRowId) {
    const err = new Error('Missing hrRowId.');
    err.code = 'HR_ROW_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/projects/${s.projectId}/hrRowsStaging/${String(hrRowId)}`;
}

export function importConflictPath(scope, conflictId) {
  const s = assertHrImportScope(scope);
  if (!conflictId) {
    const err = new Error('Missing conflictId.');
    err.code = 'HR_IMPORT_CONFLICT_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/projects/${s.projectId}/importConflicts/${String(conflictId)}`;
}

export function makeSourceKey(parts = []) {
  return parts.map((part) => String(part || 'unknown').trim().replace(/[^a-zA-Z0-9._-]/g, '_')).join('::');
}

export function buildImportRun(scope = {}, descriptor = {}) {
  const s = assertHrImportScope(scope);
  const missing = REQUIRED_IMPORT_KEYS.filter((key) => !descriptor[key]);
  if (missing.length) {
    const err = new Error(`Missing HR import descriptor keys: ${missing.join(', ')}`);
    err.code = 'HR_IMPORT_DESCRIPTOR_MISSING';
    err.missing = missing;
    throw err;
  }
  assertNoRawHrPayload(descriptor);
  if (!ALLOWED_IMPORT_MODES.has(descriptor.mode)) {
    const err = new Error(`Unsupported HR import mode: ${descriptor.mode}`);
    err.code = 'HR_IMPORT_MODE_UNSUPPORTED';
    err.mode = descriptor.mode;
    throw err;
  }
  return {
    tenantId: s.tenantId,
    projectId: s.projectId,
    importRunId: String(descriptor.importRunId),
    hrSourceId: String(descriptor.hrSourceId),
    mode: descriptor.mode,
    status: descriptor.status || 'pending_source_review',
    sourcePeriodFrom: String(descriptor.sourcePeriodFrom),
    sourcePeriodTo: String(descriptor.sourcePeriodTo),
    createdAt: descriptor.createdAt || new Date().toISOString(),
    createdBy: s.actorId,
    auditRef: descriptor.auditRef,
    summary: descriptor.summary || {
      rowsTotal: 0,
      rowsSanitized: 0,
      rowsBlocked: 0,
      conflicts: 0
    }
  };
}

export function buildSanitizedHrRow(scope = {}, row = {}) {
  const s = assertHrImportScope(scope);
  const missing = REQUIRED_ROW_KEYS.filter((key) => !row[key]);
  if (missing.length) {
    const err = new Error(`Missing sanitized HR row keys: ${missing.join(', ')}`);
    err.code = 'HR_ROW_DESCRIPTOR_MISSING';
    err.missing = missing;
    throw err;
  }
  assertNoRawHrPayload(row);
  return {
    tenantId: s.tenantId,
    projectId: s.projectId,
    hrRowId: String(row.hrRowId),
    importRunId: String(row.importRunId),
    country: String(row.country),
    periodKey: String(row.periodKey),
    quincena: String(row.quincena),
    visitSourceKey: String(row.visitSourceKey),
    shopperSourceKey: String(row.shopperSourceKey),
    visitStatus: String(row.visitStatus),
    assignmentStatus: String(row.assignmentStatus),
    questionnaireStatus: String(row.questionnaireStatus),
    submitStatus: row.submitStatus ? String(row.submitStatus) : 'unknown',
    paymentControlStatus: String(row.paymentControlStatus),
    honorariumAmount: Number(row.honorariumAmount || 0),
    reimbursementAmount: Number(row.reimbursementAmount || 0),
    currency: row.currency ? String(row.currency) : null,
    questionnaireRouteType: row.questionnaireRouteType ? String(row.questionnaireRouteType) : null,
    sanitizationStatus: row.sanitizationStatus || 'sanitized_preview',
    auditRef: row.auditRef
  };
}

export function buildImportConflict(scope = {}, descriptor = {}) {
  const s = assertHrImportScope(scope);
  const conflictId = descriptor.conflictId || makeSourceKey([s.tenantId, s.projectId, descriptor.entityType, descriptor.entityId, descriptor.reasonCode || 'conflict']);
  return {
    tenantId: s.tenantId,
    projectId: s.projectId,
    conflictId,
    entityType: descriptor.entityType || 'unknown',
    entityId: descriptor.entityId || 'unknown',
    reasonCode: descriptor.reasonCode || 'review_required',
    status: descriptor.status || 'review_required',
    sourceRefs: descriptor.sourceRefs || [],
    createdAt: descriptor.createdAt || new Date().toISOString(),
    createdBy: s.actorId,
    auditRef: descriptor.auditRef || `audit_${conflictId}`
  };
}

export function createHrImportControlAdapter({ firestore = null, scope = {}, options = {} } = {}) {
  const safeScope = assertHrImportScope(scope);

  async function notConnected(method) {
    if (!firestore) {
      const err = new Error(`HR import adapter not connected for ${method}.`);
      err.code = 'HR_IMPORT_ADAPTER_NOT_CONNECTED';
      throw err;
    }
  }

  return {
    status: {
      ...HR_IMPORT_CONTROL_ADAPTER_STATUS,
      importWritesEnabled: options.allowImportWrites === true,
      hrWritesEnabled: options.allowHrWrites === true
    },
    scope: safeScope,

    prepareImportRun(descriptor = {}) {
      return buildImportRun(safeScope, descriptor);
    },

    prepareSanitizedRow(row = {}) {
      return buildSanitizedHrRow(safeScope, row);
    },

    prepareConflict(descriptor = {}) {
      return buildImportConflict(safeScope, descriptor);
    },

    async saveImportRun(descriptor = {}) {
      assertImportWriteGate(options);
      await notConnected('saveImportRun');
      const record = buildImportRun(safeScope, descriptor);
      return { path: importRunPath(safeScope, record.importRunId), record, pendingImplementation: true };
    },

    async saveSanitizedRow(row = {}) {
      assertImportWriteGate(options);
      await notConnected('saveSanitizedRow');
      const record = buildSanitizedHrRow(safeScope, row);
      return { path: stagingRowPath(safeScope, record.hrRowId), record, pendingImplementation: true };
    },

    async requestHrWriteBack(payload = {}) {
      assertHrWriteGate(options);
      await notConnected('requestHrWriteBack');
      assertNoRawHrPayload(payload);
      return { nextStatus: 'hr_write_requested', payload, pendingImplementation: true };
    },

    canWriteImports() {
      return options.allowImportWrites === true;
    },

    canWriteHr() {
      return options.allowHrWrites === true;
    }
  };
}

export default createHrImportControlAdapter;
