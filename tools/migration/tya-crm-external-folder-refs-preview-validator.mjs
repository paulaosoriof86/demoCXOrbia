#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'crm-external-folder-refs-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');
const emailMailboxPath = path.join(root, 'app', 'contracts', 'email-user-mailbox-preview-phase-a.tya.contract.json');
const notificationOutboxPath = path.join(root, 'app', 'contracts', 'notification-outbox-preview-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o|Content|Body)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Document|File|Link|Url|URL|Attachment|Body|Content)?/i,
  /oauth|token|secret|clientSecret/i,
  /base64/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i,
  /email/i
];

const rawUrlPattern = /^https?:\/\//i;
const riskyUrlPattern = /(sig=|token=|access_token=|auth=|signature=|download=1|sharepoint\.com|onedrive\.live|drive\.google\.com)/i;

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { input: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
    }
  }
  return args;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (child && typeof child === 'object' && !Array.isArray(child)) keys.push(...flattenKeys(child, fullKey));
  }
  return keys;
}

function flattenStrings(value, acc = []) {
  if (typeof value === 'string') acc.push(value);
  if (Array.isArray(value)) value.forEach((item) => flattenStrings(item, acc));
  if (value && typeof value === 'object') Object.values(value).forEach((item) => flattenStrings(item, acc));
  return acc;
}

function detectSensitiveKeys(payload) {
  const keys = flattenKeys(payload);
  return [...new Set(keys.filter((key) => sensitivePatterns.some((pattern) => pattern.test(key))))];
}

function crmEntityKey(entity) {
  return `${entity.tenantId || ''}::${entity.projectId || ''}::${entity.crmEntityId || ''}`;
}

function validateCrmEntity(entity, contract) {
  const failures = [];
  for (const key of contract.requiredCrmEntityFields || []) {
    if (entity[key] === undefined || entity[key] === null || entity[key] === '') failures.push(`missing_${key}`);
  }
  if (entity.crmEntityType && !contract.crmEntityTypes?.includes(entity.crmEntityType)) failures.push(`unsupported_crm_entity_type:${entity.crmEntityType}`);
  if (entity.visibilityScope && !contract.visibilityScopes?.includes(entity.visibilityScope)) failures.push(`unsupported_visibility_scope:${entity.visibilityScope}`);
  if (entity.rawName || entity.rawLabel || entity.rawNotes || entity.rawContact) failures.push('raw_entity_fields_not_allowed');
  const strings = flattenStrings(entity);
  if (strings.some((value) => riskyUrlPattern.test(value))) failures.push('risky_link_in_entity_not_allowed');
  return [...new Set(failures)];
}

function validateFolderRef(ref, entitiesByKey, contract) {
  const failures = [];
  for (const key of contract.requiredExternalFolderRefFields || []) {
    if (ref[key] === undefined || ref[key] === null || ref[key] === '') failures.push(`missing_${key}`);
  }
  if (ref.externalProviderType && !contract.externalProviderTypes?.includes(ref.externalProviderType)) failures.push(`unsupported_provider:${ref.externalProviderType}`);
  if (ref.visibilityScope && !contract.visibilityScopes?.includes(ref.visibilityScope)) failures.push(`unsupported_visibility_scope:${ref.visibilityScope}`);
  if (ref.accessStatus && !contract.accessStatuses?.includes(ref.accessStatus)) failures.push(`unsupported_access_status:${ref.accessStatus}`);

  const entity = entitiesByKey.get(`${ref.tenantId || ''}::${ref.projectId || ''}::${ref.crmEntityId || ''}`);
  if (!entity) failures.push('missing_matching_crm_entity');
  if (entity && ref.crmEntityType && entity.crmEntityType && ref.crmEntityType !== entity.crmEntityType) failures.push('crm_entity_type_mismatch');

  const linkValues = [ref.externalFolderRef, ref.externalLinkRef, ref.folderUrl, ref.rawUrl, ref.shareUrl].filter(Boolean);
  if (linkValues.some((value) => rawUrlPattern.test(String(value)))) failures.push('raw_url_not_allowed');
  if (linkValues.some((value) => riskyUrlPattern.test(String(value)))) failures.push('private_or_signed_link_blocked');
  if (ref.providerToken || ref.oauthToken || ref.clientSecret || ref.providerSecret) failures.push('provider_secret_not_allowed');
  if (ref.rawDocumentContent || ref.rawAttachment || ref.documentBase64 || ref.files) failures.push('raw_document_content_not_allowed');
  if (['finance_restricted', 'shopper_own_only'].includes(ref.visibilityScope) && ref.accessStatus === 'access_granted_future') failures.push('restricted_future_access_requires_review');
  if (ref.externalProviderType === 'provider_pending_configuration' && ref.accessStatus === 'access_granted_future') failures.push('provider_pending_cannot_grant_access');

  return [...new Set(failures)];
}

function entityOutcome(failures) {
  if (failures.some((failure) => failure.includes('raw_') || failure.includes('risky'))) return 'blocked_sensitive_content';
  if (failures.some((failure) => failure.includes('missing_'))) return 'manual_review_required';
  if (failures.length) return 'conflict_review_required';
  return 'crm_entity_preview_ready';
}

function folderOutcome(failures, ref) {
  if (failures.some((failure) => failure.includes('private_or_signed') || failure.includes('raw_url'))) return 'blocked_private_link';
  if (failures.some((failure) => failure.includes('raw_document') || failure.includes('secret'))) return 'blocked_sensitive_content';
  if (failures.some((failure) => failure.includes('permission') || failure.includes('restricted'))) return 'permission_review_required';
  if (failures.some((failure) => failure.includes('missing_'))) return 'manual_review_required';
  if (failures.length) return 'conflict_review_required';
  if (ref.externalProviderType === 'provider_pending_configuration' || ref.accessStatus === 'provider_pending_configuration') return 'provider_configuration_required';
  return 'folder_ref_preview_ready';
}

function validatePreviewInput(inputFile, contract) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];

  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');

  const sensitiveKeys = detectSensitiveKeys(payload);
  if (sensitiveKeys.length) issues.push(`sensitive_or_raw_field_keys_detected:${sensitiveKeys.join(',')}`);

  const crmEntities = Array.isArray(payload.crmEntities) ? payload.crmEntities : [];
  const externalFolderRefs = Array.isArray(payload.externalFolderRefs) ? payload.externalFolderRefs : [];
  if (!Array.isArray(payload.crmEntities)) warnings.push('input.crmEntities missing or not an array');
  if (!Array.isArray(payload.externalFolderRefs)) warnings.push('input.externalFolderRefs missing or not an array');

  const entitiesByKey = new Map(crmEntities.map((entity) => [crmEntityKey(entity), entity]));
  const entityRows = crmEntities.map((entity) => {
    const failures = validateCrmEntity(entity, contract);
    return {
      outcome: entityOutcome(failures),
      validationFailures: failures,
      tenantId: entity.tenantId || null,
      projectId: entity.projectId || null,
      crmEntityId: entity.crmEntityId || null,
      crmEntityType: entity.crmEntityType || null,
      crmPipelineId: entity.crmPipelineId || null,
      crmStageId: entity.crmStageId || null,
      ownerRole: entity.ownerRole || null,
      visibilityScope: entity.visibilityScope || null,
      reviewStatus: entity.reviewStatus || null
    };
  });

  const folderRows = externalFolderRefs.map((ref) => {
    const failures = validateFolderRef(ref, entitiesByKey, contract);
    const outcome = folderOutcome(failures, ref);
    return {
      outcome,
      validationFailures: failures,
      tenantId: ref.tenantId || null,
      projectId: ref.projectId || null,
      crmEntityId: ref.crmEntityId || null,
      crmEntityType: ref.crmEntityType || null,
      externalFolderRefId: ref.externalFolderRefId || null,
      externalProviderType: ref.externalProviderType || null,
      externalFolderRef: ref.externalFolderRef || null,
      visibilityScope: ref.visibilityScope || null,
      accessStatus: ref.accessStatus || null,
      recommendedAccessStatus: outcome === 'folder_ref_preview_ready' ? 'ref_preview_only' : outcome
    };
  });

  const counts = [...entityRows, ...folderRows].reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    crmEntityCount: crmEntities.length,
    externalFolderRefCount: externalFolderRefs.length,
    sensitiveKeys,
    counts,
    entityRows,
    folderRows,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const emailMailbox = readJson(emailMailboxPath);
  const notificationOutbox = readJson(notificationOutboxPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'externalProviderReadAllowed', 'externalProviderWriteAllowed', 'oauthAllowed', 'makeWriteAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');
  if (emailMailbox.emailReadAllowed !== false || emailMailbox.emailSendAllowed !== false) issues.push('Email mailbox gates must remain disabled');
  if (notificationOutbox.emailSendAllowed !== false || notificationOutbox.whatsappSendAllowed !== false) issues.push('Notification outbox send gates must remain disabled');

  for (const key of ['tenantId', 'projectId', 'crmEntityId', 'externalFolderRefId', 'externalProviderType', 'externalFolderRef', 'visibilityScope', 'accessStatus']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['crm_entity_preview_ready', 'folder_ref_preview_ready', 'blocked_private_link', 'blocked_sensitive_content', 'manual_review_required']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input, contract);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-crm-external-folder-refs-preview-validator',
    status: issues.length ? 'review_required' : 'crm_external_folder_refs_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    externalProviderReadAllowed: false,
    externalProviderWriteAllowed: false,
    oauthAllowed: false,
    makeWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, sensitivePolicyPath),
      path.relative(root, emailMailboxPath),
      path.relative(root, notificationOutboxPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized CRM entities and folder refs only.',
      'Keep folder state as ref preview/provider pending while gates are off.',
      'Route raw URLs, signed links, provider tokens and document contents to review.',
      'Update Claude/prototype and Academia with CRM folder reference states and permission review.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-crm-external-folder-refs-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
