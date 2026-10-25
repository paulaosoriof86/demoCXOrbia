/*
  CXOrbia - Firebase Storage evidence adapter preview
  Status: draft_safe_not_connected

  This file is intentionally not imported by app/index.html.
  It is a backend-side adapter blueprint for visit evidence, shopper documents,
  NDA metadata and restricted operational attachments.

  No Storage connection. No provider calls. No uploads/downloads by default.
*/

export const STORAGE_EVIDENCE_ADAPTER_STATUS = Object.freeze({
  connectedToFrontend: false,
  storageProviderConnected: false,
  uploadsEnabled: false,
  downloadsEnabled: false,
  signedUrlsEnabled: false,
  safeForRepo: true
});

const REQUIRED_SCOPE_KEYS = ['tenantId', 'projectId'];
const REQUIRED_DOCUMENT_KEYS = ['bucketScope', 'entityId', 'documentId'];
const FORBIDDEN_FILENAME_PATTERNS = [
  /dpi/i,
  /passport/i,
  /bank/i,
  /cuenta/i,
  /banco/i,
  /nda-firmad/i,
  /signed-nda/i
];

export function assertStorageScope(scope = {}) {
  const missing = REQUIRED_SCOPE_KEYS.filter((key) => !scope[key]);
  if (missing.length) {
    const err = new Error(`Missing Storage evidence scope: ${missing.join(', ')}`);
    err.code = 'STORAGE_SCOPE_MISSING';
    err.missing = missing;
    throw err;
  }
  return {
    tenantId: String(scope.tenantId),
    projectId: String(scope.projectId),
    role: scope.role ? String(scope.role) : 'unknown',
    actorId: scope.actorId ? String(scope.actorId) : 'unknown'
  };
}

export function assertStorageGate(options = {}, action = 'storage') {
  const gateKey = action === 'download' ? 'allowDownloads' : action === 'signedUrl' ? 'allowSignedUrls' : 'allowUploads';
  if (options[gateKey] !== true) {
    const err = new Error(`Storage evidence ${action} is blocked until an explicit gate enables it.`);
    err.code = 'STORAGE_EVIDENCE_GATE_BLOCKED';
    err.action = action;
    throw err;
  }
}

export function assertSafeFileName(fileName = '') {
  const value = String(fileName || '').trim();
  if (!value) {
    const err = new Error('Missing safe file name.');
    err.code = 'STORAGE_FILENAME_MISSING';
    throw err;
  }
  const blocked = FORBIDDEN_FILENAME_PATTERNS.find((pattern) => pattern.test(value));
  if (blocked) {
    const err = new Error('File name appears to contain sensitive or forbidden terms.');
    err.code = 'STORAGE_FILENAME_FORBIDDEN';
    err.fileName = value;
    throw err;
  }
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function evidencePath(scope, descriptor = {}) {
  const s = assertStorageScope(scope);
  const missing = REQUIRED_DOCUMENT_KEYS.filter((key) => !descriptor[key]);
  if (missing.length) {
    const err = new Error(`Missing evidence descriptor keys: ${missing.join(', ')}`);
    err.code = 'STORAGE_EVIDENCE_DESCRIPTOR_MISSING';
    err.missing = missing;
    throw err;
  }
  const fileName = assertSafeFileName(descriptor.fileName || `${descriptor.documentId}.${descriptor.extension || 'bin'}`);
  return [
    'tenants',
    s.tenantId,
    'projects',
    s.projectId,
    String(descriptor.bucketScope),
    String(descriptor.entityId),
    fileName
  ].join('/');
}

export function metadataPath(scope, documentId) {
  const s = assertStorageScope(scope);
  if (!documentId) {
    const err = new Error('Missing documentId for metadata path.');
    err.code = 'STORAGE_METADATA_DOCUMENT_ID_MISSING';
    throw err;
  }
  return `tenants/${s.tenantId}/projects/${s.projectId}/documents/${String(documentId)}`;
}

export function createFirebaseStorageEvidenceAdapter({ storage = null, firestore = null, scope = {}, options = {} } = {}) {
  const safeScope = assertStorageScope(scope);

  async function notConnected(method) {
    if (!storage && method !== 'metadata') {
      const err = new Error(`Storage adapter not connected for ${method}.`);
      err.code = 'STORAGE_EVIDENCE_NOT_CONNECTED';
      throw err;
    }
    if (!firestore && method === 'metadata') {
      const err = new Error('Firestore metadata adapter not connected for Storage evidence metadata.');
      err.code = 'STORAGE_METADATA_NOT_CONNECTED';
      throw err;
    }
  }

  return {
    status: {
      ...STORAGE_EVIDENCE_ADAPTER_STATUS,
      uploadsEnabled: options.allowUploads === true,
      downloadsEnabled: options.allowDownloads === true,
      signedUrlsEnabled: options.allowSignedUrls === true
    },
    scope: safeScope,

    async prepareUpload(descriptor = {}) {
      assertStorageGate(options, 'upload');
      await notConnected('upload');
      return {
        storagePath: evidencePath(safeScope, descriptor),
        metadataPath: metadataPath(safeScope, descriptor.documentId),
        pendingImplementation: true
      };
    },

    async prepareDownload(descriptor = {}) {
      assertStorageGate(options, 'download');
      await notConnected('download');
      return {
        storagePath: evidencePath(safeScope, descriptor),
        pendingImplementation: true
      };
    },

    async createSignedUrl(descriptor = {}) {
      assertStorageGate(options, 'signedUrl');
      await notConnected('signedUrl');
      return {
        storagePath: evidencePath(safeScope, descriptor),
        ttlSeconds: Math.min(Number(options.ttlSeconds || 300), 900),
        pendingImplementation: true
      };
    },

    async writeMetadata(documentId, metadata = {}) {
      assertStorageGate(options, 'upload');
      await notConnected('metadata');
      return {
        metadataPath: metadataPath(safeScope, documentId),
        metadata: {
          ...metadata,
          tenantId: safeScope.tenantId,
          projectId: safeScope.projectId,
          documentId: String(documentId),
          auditRequired: true
        },
        pendingImplementation: true
      };
    },

    canUpload() {
      return options.allowUploads === true;
    },

    canDownload() {
      return options.allowDownloads === true;
    },

    canCreateSignedUrl() {
      return options.allowSignedUrls === true;
    }
  };
}

export default createFirebaseStorageEvidenceAdapter;
