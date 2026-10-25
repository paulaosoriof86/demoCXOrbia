#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'shopper-communication-history-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');
const notificationOutboxPath = path.join(root, 'app', 'contracts', 'notification-outbox-preview-phase-a.tya.contract.json');
const emailMailboxPath = path.join(root, 'app', 'contracts', 'email-user-mailbox-preview-phase-a.tya.contract.json');
const crmFolderRefsPath = path.join(root, 'app', 'contracts', 'crm-external-folder-refs-preview-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Message|Body|Email|Whatsapp|Attachment|Audio|File|Phone|Address|Content)?/i,
  /oauth|token|secret|clientSecret/i,
  /base64/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i,
  /email/i
];

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/;
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

function hasAnyStableEntityRef(row) {
  return Boolean(
    row.shopperId ||
    row.visitId ||
    row.hrRowId ||
    row.sourceVisitRef ||
    row.postulationId ||
    row.assignmentId ||
    row.notificationId ||
    row.mailActionId ||
    row.crmEntityId ||
    row.externalFolderRefId
  );
}

function validateCommunication(row, contract) {
  const failures = [];
  for (const key of contract.requiredCommunicationFields || []) {
    if (row[key] === undefined || row[key] === null || row[key] === '') failures.push(`missing_${key}`);
  }
  if (row.channel && !contract.channels?.includes(row.channel)) failures.push(`unsupported_channel:${row.channel}`);
  if (row.direction && !contract.directions?.includes(row.direction)) failures.push(`unsupported_direction:${row.direction}`);
  if (row.interactionType && !contract.interactionTypes?.includes(row.interactionType)) failures.push(`unsupported_interaction_type:${row.interactionType}`);
  if (row.communicationStatus && !contract.communicationStatuses?.includes(row.communicationStatus)) failures.push(`unsupported_communication_status:${row.communicationStatus}`);
  if (row.manualConfirmationStatus && !contract.manualConfirmationStatuses?.includes(row.manualConfirmationStatus)) failures.push(`unsupported_manual_confirmation_status:${row.manualConfirmationStatus}`);

  if (!hasAnyStableEntityRef(row)) failures.push('missing_related_entity_ref');
  if (row.recipientEmail || row.senderEmail || row.email || row.toEmail || row.fromEmail) failures.push('raw_email_not_allowed');
  if (row.recipientPhone || row.senderPhone || row.phone || row.whatsapp) failures.push('raw_phone_not_allowed');
  if (row.rawBody || row.rawMessage || row.messageBody || row.rawWhatsappBody || row.rawEmailBody || row.body) failures.push('raw_message_body_not_allowed');
  if (row.rawAttachment || row.attachmentsRaw || row.attachmentBase64 || row.files) failures.push('raw_attachment_not_allowed');
  if (row.providerToken || row.oauthToken || row.clientSecret || row.providerSecret) failures.push('provider_secret_not_allowed');
  if (row.providerSent === true || row.sent === true || row.delivered === true) failures.push('provider_send_or_delivery_not_allowed');

  const strings = flattenStrings(row.safeSummary || row.templateVariables || row.metadata || {});
  strings.forEach((value, index) => {
    if (emailPattern.test(value)) failures.push(`raw_email_in_safe_fields:${index}`);
    if (phonePattern.test(value)) failures.push(`raw_phone_in_safe_fields:${index}`);
    if (riskyUrlPattern.test(value)) failures.push(`risky_link_in_safe_fields:${index}`);
  });

  if (row.channel === 'whatsapp_web_fallback_manual' && row.manualConfirmationStatus !== 'confirmed_externally_by_user' && row.communicationStatus === 'manual_log_ready') {
    failures.push('whatsapp_manual_confirmation_required');
  }

  if (row.channel === 'email_draft_preview' && row.communicationStatus !== 'draft_preview_ready') failures.push('email_draft_status_mismatch');
  if (row.channel === 'email_manual_log' && !['manual_log_ready', 'manual_confirmation_required', 'recorded_preview'].includes(row.communicationStatus)) failures.push('email_manual_log_status_mismatch');
  if (row.interactionType?.includes('payment') || row.interactionType?.includes('liquidation')) {
    if (row.templateVariables?.bankName || row.templateVariables?.accountNumber || row.safeSummary?.bank) failures.push('payment_sensitive_data_not_allowed');
  }

  return [...new Set(failures)];
}

function outcomeFor(failures, row) {
  if (failures.some((failure) => failure.includes('raw_') || failure.includes('secret') || failure.includes('sensitive') || failure.includes('risky'))) return 'blocked_sensitive_payload';
  if (failures.some((failure) => failure.includes('missing_'))) return 'blocked_missing_refs';
  if (failures.some((failure) => failure.includes('confirmation'))) return 'manual_confirmation_required';
  if (failures.some((failure) => failure.includes('provider'))) return 'provider_configuration_required';
  if (failures.length) return 'conflict_review_required';
  if (row.channel === 'email_draft_preview') return 'draft_preview_ready';
  if (['email_manual_log', 'phone_call_manual_note', 'support_note_preview'].includes(row.channel)) return 'manual_log_ready';
  if (row.channel === 'whatsapp_web_fallback_manual') return 'manual_confirmation_required';
  return 'communication_history_preview_ready';
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

  const communications = Array.isArray(payload.communications) ? payload.communications : [];
  if (!Array.isArray(payload.communications)) warnings.push('input.communications missing or not an array');

  const rows = communications.map((row) => {
    const failures = validateCommunication(row, contract);
    const outcome = outcomeFor(failures, row);
    return {
      outcome,
      validationFailures: failures,
      tenantId: row.tenantId || null,
      projectId: row.projectId || null,
      communicationId: row.communicationId || null,
      threadId: row.threadId || null,
      participantRef: row.participantRef || null,
      participantRole: row.participantRole || null,
      channel: row.channel || null,
      direction: row.direction || null,
      interactionType: row.interactionType || null,
      communicationStatus: row.communicationStatus || null,
      manualConfirmationStatus: row.manualConfirmationStatus || null,
      shopperId: row.shopperId || null,
      visitId: row.visitId || null,
      hrRowId: row.hrRowId || null,
      postulationId: row.postulationId || null,
      assignmentId: row.assignmentId || null,
      notificationId: row.notificationId || null,
      mailActionId: row.mailActionId || null,
      crmEntityId: row.crmEntityId || null,
      recommendedStatus: outcome === 'communication_history_preview_ready' ? 'recorded_preview' : outcome
    };
  });

  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    communicationCount: communications.length,
    sensitiveKeys,
    counts,
    rows,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const notificationOutbox = readJson(notificationOutboxPath);
  const emailMailbox = readJson(emailMailboxPath);
  const crmFolderRefs = readJson(crmFolderRefsPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'emailReadAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'externalProviderReadAllowed', 'externalProviderWriteAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');
  if (notificationOutbox.emailSendAllowed !== false || notificationOutbox.whatsappSendAllowed !== false) issues.push('Notification outbox send gates must remain disabled');
  if (emailMailbox.emailReadAllowed !== false || emailMailbox.emailSendAllowed !== false) issues.push('Email mailbox gates must remain disabled');
  if (crmFolderRefs.externalProviderReadAllowed !== false || crmFolderRefs.externalProviderWriteAllowed !== false) issues.push('CRM folder provider gates must remain disabled');

  for (const key of ['tenantId', 'projectId', 'communicationId', 'threadId', 'participantRef', 'participantRole', 'channel', 'communicationStatus']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['communication_history_preview_ready', 'manual_log_ready', 'draft_preview_ready', 'blocked_sensitive_payload', 'blocked_missing_refs']) {
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
    validator: 'tya-shopper-communication-history-preview-validator',
    status: issues.length ? 'review_required' : 'shopper_communication_history_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    makeWriteAllowed: false,
    emailReadAllowed: false,
    emailSendAllowed: false,
    whatsappSendAllowed: false,
    externalProviderReadAllowed: false,
    externalProviderWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, sensitivePolicyPath),
      path.relative(root, notificationOutboxPath),
      path.relative(root, emailMailboxPath),
      path.relative(root, crmFolderRefsPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized communications only.',
      'Keep raw bodies, phones, emails and attachments out of preview input.',
      'Route ambiguous threads or sensitive payment communications to review.',
      'Update Claude/prototype and Academia with shopper communication history states.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-shopper-communication-history-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
