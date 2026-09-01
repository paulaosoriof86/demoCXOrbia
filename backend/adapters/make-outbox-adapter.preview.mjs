/*
  CXOrbia - Make/outbox adapter preview
  Status: draft_safe_not_connected

  This file is intentionally not imported by app/index.html.
  It prepares outbox records and validates dispatch gates without calling Make,
  WhatsApp, Outlook, HR, payment providers or Gemini.
*/

export const MAKE_OUTBOX_ADAPTER_STATUS = Object.freeze({
  connectedToFrontend: false,
  makeProviderConnected: false,
  webhookCallsEnabled: false,
  messageDispatchEnabled: false,
  hrWritesEnabled: false,
  paymentDispatchEnabled: false,
  safeForRepo: true
});

const REQUIRED_SCOPE_KEYS = ['tenantId', 'projectId'];
const REQUIRED_OUTBOX_KEYS = ['channel', 'messageType', 'entityType', 'entityId', 'recipientRef', 'auditRef'];
const ALLOWED_CHANNELS = new Set(['whatsapp', 'email', 'platformNotification', 'hrSync', 'paymentOps', 'geminiReview']);
const BLOCKED_RAW_FIELDS = ['rawPhone', 'rawEmail', 'makeWebhookUrl', 'providerToken', 'paymentInstructionRaw', 'geminiApiKey'];

export function assertOutboxScope(scope = {}) {
  const missing = REQUIRED_SCOPE_KEYS.filter((key) => !scope[key]);
  if (missing.length) {
    const err = new Error(`Missing Make/outbox scope: ${missing.join(', ')}`);
    err.code = 'OUTBOX_SCOPE_MISSING';
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

export function assertProviderGate(options = {}, channel = 'unknown') {
  if (options.allowProviderDispatch !== true) {
    const err = new Error(`Provider dispatch is blocked for ${channel} until an explicit gate enables it.`);
    err.code = 'OUTBOX_PROVIDER_GATE_BLOCKED';
    err.channel = channel;
    throw err;
  }
}

export function assertSafePayload(payload = {}) {
  for (const field of BLOCKED_RAW_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const err = new Error(`Outbox payload includes forbidden raw/provider field: ${field}`);
      err.code = 'OUTBOX_FORBIDDEN_PAYLOAD_FIELD';
      err.field = field;
      throw err;
    }
  }
  return payload;
}

export function makeDedupeKey(scope, descriptor = {}) {
  const s = assertOutboxScope(scope);
  const parts = [
    s.tenantId,
    s.projectId,
    descriptor.entityType || 'entity',
    descriptor.entityId || 'unknown',
    descriptor.messageType || 'message',
    descriptor.recipientRef || 'recipient',
    descriptor.periodKey || 'open'
  ];
  return parts.map((part) => String(part).replace(/[^a-zA-Z0-9._-]/g, '_')).join('::');
}

export function outboxPath(scope, messageId) {
  const s = assertOutboxScope(scope);
  if (!messageId) {
    const err = new Error('Missing messageId for outbox path.');
    err.code = 'OUTBOX_MESSAGE_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/outbox/${String(messageId)}`;
}

export function buildOutboxRecord(scope = {}, descriptor = {}) {
  const s = assertOutboxScope(scope);
  const missing = REQUIRED_OUTBOX_KEYS.filter((key) => !descriptor[key]);
  if (missing.length) {
    const err = new Error(`Missing outbox descriptor keys: ${missing.join(', ')}`);
    err.code = 'OUTBOX_DESCRIPTOR_MISSING';
    err.missing = missing;
    throw err;
  }
  if (!ALLOWED_CHANNELS.has(descriptor.channel)) {
    const err = new Error(`Unsupported outbox channel: ${descriptor.channel}`);
    err.code = 'OUTBOX_CHANNEL_UNSUPPORTED';
    err.channel = descriptor.channel;
    throw err;
  }
  assertSafePayload(descriptor.payload || {});
  const messageId = descriptor.messageId || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const dedupeKey = descriptor.dedupeKey || makeDedupeKey(s, descriptor);
  return {
    tenantId: s.tenantId,
    projectId: s.projectId,
    messageId,
    channel: descriptor.channel,
    messageType: descriptor.messageType,
    entityType: descriptor.entityType,
    entityId: String(descriptor.entityId),
    recipientRef: String(descriptor.recipientRef),
    periodKey: descriptor.periodKey || 'open',
    status: descriptor.status || 'prepared_pending_gate',
    gateStatus: descriptor.gateStatus || 'blocked_missing_gate',
    dedupeKey,
    payload: descriptor.payload || {},
    createdAt: descriptor.createdAt || new Date().toISOString(),
    createdBy: s.actorId,
    source: descriptor.source || 'platform_preview',
    reason: descriptor.reason || 'prepared_by_backend_contract',
    auditRef: descriptor.auditRef,
    dispatch: {
      providerRef: null,
      attemptCount: 0,
      lastAttemptAt: null,
      confirmedAt: null
    }
  };
}

export function createMakeOutboxAdapter({ firestore = null, scope = {}, options = {} } = {}) {
  const safeScope = assertOutboxScope(scope);

  async function notConnected(method) {
    if (!firestore) {
      const err = new Error(`Outbox persistence adapter not connected for ${method}.`);
      err.code = 'OUTBOX_NOT_CONNECTED';
      throw err;
    }
  }

  return {
    status: {
      ...MAKE_OUTBOX_ADAPTER_STATUS,
      webhookCallsEnabled: options.allowProviderDispatch === true,
      messageDispatchEnabled: options.allowProviderDispatch === true,
      hrWritesEnabled: options.allowHrWrites === true,
      paymentDispatchEnabled: options.allowPaymentDispatch === true
    },
    scope: safeScope,

    prepareRecord(descriptor = {}) {
      return buildOutboxRecord(safeScope, descriptor);
    },

    async savePrepared(descriptor = {}) {
      await notConnected('savePrepared');
      const record = buildOutboxRecord(safeScope, descriptor);
      return {
        path: outboxPath(safeScope, record.messageId),
        record,
        pendingImplementation: true
      };
    },

    async requestDispatch(record = {}) {
      assertProviderGate(options, record.channel || 'unknown');
      await notConnected('requestDispatch');
      return {
        path: outboxPath(safeScope, record.messageId),
        nextStatus: 'dispatch_requested',
        providerGate: 'active',
        pendingImplementation: true
      };
    },

    async markConfirmed(record = {}, providerRef = null) {
      assertProviderGate(options, record.channel || 'unknown');
      await notConnected('markConfirmed');
      if (!providerRef) {
        const err = new Error('Provider confirmation requires providerRef.');
        err.code = 'OUTBOX_PROVIDER_REF_MISSING';
        throw err;
      }
      return {
        path: outboxPath(safeScope, record.messageId),
        nextStatus: 'dispatch_confirmed',
        providerRef,
        pendingImplementation: true
      };
    },

    canDispatch() {
      return options.allowProviderDispatch === true;
    },

    canWriteHr() {
      return options.allowHrWrites === true;
    },

    canDispatchPayment() {
      return options.allowPaymentDispatch === true;
    }
  };
}

export default createMakeOutboxAdapter;
