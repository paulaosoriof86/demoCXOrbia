/*
  CXOrbia - Liquidations/payment state adapter preview
  Status: draft_safe_not_connected

  This file is intentionally not imported by app/index.html.
  It prepares liquidation/payment state records and validates transitions without
  executing payments, storing bank data, calling providers or writing Firestore.
*/

export const LIQUIDATIONS_PAYMENT_ADAPTER_STATUS = Object.freeze({
  connectedToFrontend: false,
  paymentProviderConnected: false,
  paymentExecutionEnabled: false,
  paymentStateWritesEnabled: false,
  safeForRepo: true
});

const REQUIRED_SCOPE_KEYS = ['tenantId', 'projectId'];
const REQUIRED_LIQUIDATION_KEYS = ['shopperId', 'visitId', 'hrRowId', 'assignmentId', 'country', 'currency', 'periodKey', 'quincena', 'auditRef'];
const REQUIRED_BATCH_KEYS = ['paymentBatchId', 'periodKey', 'country', 'currency', 'liquidationIds', 'auditRef'];
const FORBIDDEN_FIELDS = ['rawBankAccount', 'rawAccountNumber', 'bankRoutingRaw', 'dpiRaw', 'paymentReceiptBinary', 'paymentReceiptBase64', 'paymentProviderToken', 'rawShopperEmail', 'rawShopperPhone'];
const TRANSITIONS = Object.freeze({
  calculated_preview: new Set(['review_required', 'approved_for_batch', 'cancelled_with_audit']),
  review_required: new Set(['approved_for_batch', 'cancelled_with_audit', 'disputed']),
  approved_for_batch: new Set(['batched_prepared', 'review_required', 'cancelled_with_audit']),
  batched_prepared: new Set(['payment_scheduled', 'review_required', 'cancelled_with_audit']),
  payment_scheduled: new Set(['payment_reprogrammed', 'paid_confirmed_audited', 'disputed']),
  payment_reprogrammed: new Set(['payment_scheduled', 'paid_confirmed_audited', 'disputed']),
  paid_confirmed_audited: new Set([]),
  disputed: new Set(['review_required', 'cancelled_with_audit']),
  cancelled_with_audit: new Set([])
});

export function assertPaymentScope(scope = {}) {
  const missing = REQUIRED_SCOPE_KEYS.filter((key) => !scope[key]);
  if (missing.length) {
    const err = new Error(`Missing liquidation/payment scope: ${missing.join(', ')}`);
    err.code = 'PAYMENT_SCOPE_MISSING';
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

export function assertPaymentWriteGate(options = {}) {
  if (options.allowPaymentStateWrites !== true) {
    const err = new Error('Liquidation/payment state writes are blocked until an explicit gate enables them.');
    err.code = 'PAYMENT_STATE_WRITE_GATE_BLOCKED';
    throw err;
  }
}

export function assertNoSensitivePaymentFields(payload = {}) {
  for (const field of FORBIDDEN_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const err = new Error(`Payment payload includes forbidden sensitive field: ${field}`);
      err.code = 'PAYMENT_FORBIDDEN_FIELD';
      err.field = field;
      throw err;
    }
  }
  return payload;
}

export function money(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n < 0) {
    const err = new Error('Invalid non-negative money amount.');
    err.code = 'PAYMENT_AMOUNT_INVALID';
    err.value = value;
    throw err;
  }
  return Math.round(n * 100) / 100;
}

export function liquidationPath(scope, liquidationId) {
  const s = assertPaymentScope(scope);
  if (!liquidationId) {
    const err = new Error('Missing liquidationId.');
    err.code = 'LIQUIDATION_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/projects/${s.projectId}/liquidations/${String(liquidationId)}`;
}

export function paymentBatchPath(scope, paymentBatchId) {
  const s = assertPaymentScope(scope);
  if (!paymentBatchId) {
    const err = new Error('Missing paymentBatchId.');
    err.code = 'PAYMENT_BATCH_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/projects/${s.projectId}/paymentBatches/${String(paymentBatchId)}`;
}

export function buildLiquidationRecord(scope = {}, descriptor = {}) {
  const s = assertPaymentScope(scope);
  const missing = REQUIRED_LIQUIDATION_KEYS.filter((key) => !descriptor[key]);
  if (missing.length) {
    const err = new Error(`Missing liquidation descriptor keys: ${missing.join(', ')}`);
    err.code = 'LIQUIDATION_DESCRIPTOR_MISSING';
    err.missing = missing;
    throw err;
  }
  assertNoSensitivePaymentFields(descriptor);
  const honorariumAmount = money(descriptor.honorariumAmount);
  const reimbursementAmount = money(descriptor.reimbursementAmount);
  const totalAmount = money(descriptor.totalAmount ?? honorariumAmount + reimbursementAmount);
  const liquidationId = descriptor.liquidationId || [s.tenantId, s.projectId, descriptor.visitId, descriptor.shopperId, descriptor.periodKey].join('_').replace(/[^a-zA-Z0-9._-]/g, '_');
  return {
    tenantId: s.tenantId,
    projectId: s.projectId,
    liquidationId,
    shopperId: String(descriptor.shopperId),
    visitId: String(descriptor.visitId),
    hrRowId: String(descriptor.hrRowId),
    assignmentId: String(descriptor.assignmentId),
    country: String(descriptor.country),
    currency: String(descriptor.currency),
    periodKey: String(descriptor.periodKey),
    quincena: String(descriptor.quincena),
    honorariumAmount,
    reimbursementAmount,
    totalAmount,
    status: descriptor.status || 'calculated_preview',
    source: descriptor.source || 'backend_contract_preview',
    auditRef: descriptor.auditRef,
    createdAt: descriptor.createdAt || new Date().toISOString(),
    createdBy: s.actorId,
    payment: {
      scheduledFor: descriptor.scheduledFor || null,
      paidAt: null,
      evidenceRef: null,
      externalPaymentRef: null
    }
  };
}

export function buildPaymentBatchRecord(scope = {}, descriptor = {}) {
  const s = assertPaymentScope(scope);
  const missing = REQUIRED_BATCH_KEYS.filter((key) => !descriptor[key]);
  if (missing.length) {
    const err = new Error(`Missing payment batch descriptor keys: ${missing.join(', ')}`);
    err.code = 'PAYMENT_BATCH_DESCRIPTOR_MISSING';
    err.missing = missing;
    throw err;
  }
  assertNoSensitivePaymentFields(descriptor);
  if (!Array.isArray(descriptor.liquidationIds) || !descriptor.liquidationIds.length) {
    const err = new Error('paymentBatch requires at least one liquidationId.');
    err.code = 'PAYMENT_BATCH_EMPTY';
    throw err;
  }
  return {
    tenantId: s.tenantId,
    projectId: s.projectId,
    paymentBatchId: String(descriptor.paymentBatchId),
    periodKey: String(descriptor.periodKey),
    country: String(descriptor.country),
    currency: String(descriptor.currency),
    status: descriptor.status || 'draft_preview',
    liquidationIds: descriptor.liquidationIds.map(String),
    totalAmount: money(descriptor.totalAmount),
    createdBy: s.actorId,
    createdAt: descriptor.createdAt || new Date().toISOString(),
    auditRef: descriptor.auditRef
  };
}

export function assertTransition(fromStatus, toStatus) {
  const allowed = TRANSITIONS[fromStatus];
  if (!allowed || !allowed.has(toStatus)) {
    const err = new Error(`Invalid liquidation status transition: ${fromStatus} -> ${toStatus}`);
    err.code = 'PAYMENT_STATE_TRANSITION_INVALID';
    err.fromStatus = fromStatus;
    err.toStatus = toStatus;
    throw err;
  }
  return true;
}

export function createLiquidationsPaymentStateAdapter({ firestore = null, scope = {}, options = {} } = {}) {
  const safeScope = assertPaymentScope(scope);

  async function notConnected(method) {
    if (!firestore) {
      const err = new Error(`Liquidations/payment adapter not connected for ${method}.`);
      err.code = 'PAYMENT_ADAPTER_NOT_CONNECTED';
      throw err;
    }
  }

  return {
    status: {
      ...LIQUIDATIONS_PAYMENT_ADAPTER_STATUS,
      paymentStateWritesEnabled: options.allowPaymentStateWrites === true,
      paymentExecutionEnabled: false
    },
    scope: safeScope,

    prepareLiquidation(descriptor = {}) {
      return buildLiquidationRecord(safeScope, descriptor);
    },

    prepareBatch(descriptor = {}) {
      return buildPaymentBatchRecord(safeScope, descriptor);
    },

    async saveLiquidation(descriptor = {}) {
      assertPaymentWriteGate(options);
      await notConnected('saveLiquidation');
      const record = buildLiquidationRecord(safeScope, descriptor);
      return {
        path: liquidationPath(safeScope, record.liquidationId),
        record,
        pendingImplementation: true
      };
    },

    async saveBatch(descriptor = {}) {
      assertPaymentWriteGate(options);
      await notConnected('saveBatch');
      const record = buildPaymentBatchRecord(safeScope, descriptor);
      return {
        path: paymentBatchPath(safeScope, record.paymentBatchId),
        record,
        pendingImplementation: true
      };
    },

    async transitionLiquidation(record = {}, toStatus, reason = '') {
      assertPaymentWriteGate(options);
      await notConnected('transitionLiquidation');
      assertTransition(record.status, toStatus);
      if (!reason) {
        const err = new Error('Payment state transition requires reason.');
        err.code = 'PAYMENT_STATE_REASON_REQUIRED';
        throw err;
      }
      if (toStatus === 'paid_confirmed_audited' && !record.payment?.evidenceRef && !record.payment?.externalPaymentRef) {
        const err = new Error('Paid state requires evidenceRef or externalPaymentRef.');
        err.code = 'PAYMENT_PAID_EVIDENCE_REQUIRED';
        throw err;
      }
      return {
        path: liquidationPath(safeScope, record.liquidationId),
        fromStatus: record.status,
        toStatus,
        reason,
        auditRequired: true,
        pendingImplementation: true
      };
    },

    canWritePaymentState() {
      return options.allowPaymentStateWrites === true;
    },

    canExecutePayment() {
      return false;
    }
  };
}

export default createLiquidationsPaymentStateAdapter;
