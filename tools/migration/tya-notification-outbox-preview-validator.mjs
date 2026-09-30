#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'notification-outbox-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');
const postulationContractPath = path.join(root, 'app', 'contracts', 'postulation-dynamic-form-preview-phase-a.tya.contract.json');
const assignmentContractPath = path.join(root, 'app', 'contracts', 'assignment-sync-conflict-preview-phase-a.tya.contract.json');
const visitContractPath = path.join(root, 'app', 'contracts', 'visit-lifecycle-reservation-preview-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Email|Whatsapp|Attachment|Audio|Body|File|Phone|Address)?/i,
  /base64/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i,
  /emailRaw|rawEmail/i
];

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/;

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

function detectRawRecipientValues(notification) {
  const issues = [];
  for (const key of ['recipientEmail', 'recipientPhone', 'phone', 'email', 'whatsapp', 'rawRecipient', 'recipientAddress']) {
    if (notification[key]) issues.push(`raw_recipient_field:${key}`);
  }
  const strings = flattenStrings(notification.templateVariables || {});
  strings.forEach((value, index) => {
    if (emailPattern.test(value)) issues.push(`template_variable_raw_email:${index}`);
    if (phonePattern.test(value)) issues.push(`template_variable_raw_phone:${index}`);
  });
  return issues;
}

function validateNotification(notification, contract) {
  const failures = [];
  for (const key of contract.requiredNotificationFields || []) {
    if (!notification[key]) failures.push(`missing_${key}`);
  }

  if (notification.channel && !contract.channels?.includes(notification.channel)) failures.push(`unsupported_channel:${notification.channel}`);
  if (notification.eventType && !contract.notificationEvents?.includes(notification.eventType)) failures.push(`unsupported_event_type:${notification.eventType}`);
  if (notification.outboxStatus && !contract.outboxStatuses?.includes(notification.outboxStatus)) failures.push(`unsupported_outbox_status:${notification.outboxStatus}`);

  failures.push(...detectRawRecipientValues(notification));

  if (notification.rawBody || notification.rawEmailBody || notification.rawWhatsappBody || notification.bodyRaw) failures.push('raw_body_not_allowed');
  if (notification.rawAttachment || notification.attachmentsRaw || notification.attachmentBase64) failures.push('raw_attachment_not_allowed');
  if (notification.sent === true || notification.providerSent === true) failures.push('provider_send_not_allowed');
  if (notification.channel === 'email_draft' && notification.outboxStatus === 'sent_external_confirmed_manual') failures.push('email_draft_cannot_be_auto_sent');
  if (notification.channel === 'whatsapp_web_fallback' && notification.manualFallbackStatus !== 'user_confirmed_sent_externally' && notification.outboxStatus === 'sent_external_confirmed_manual') failures.push('manual_confirmation_required');

  if (notification.eventType?.includes('payment') || notification.eventType?.includes('liquidation')) {
    if (notification.templateVariables?.bankName || notification.templateVariables?.accountNumber) failures.push('payment_notification_bank_data_not_allowed');
  }

  return [...new Set(failures)];
}

function outcomeFor(failures, notification) {
  if (failures.some((failure) => failure.includes('sensitive') || failure.includes('raw_') || failure.includes('bank') || failure.includes('recipient'))) return 'blocked_sensitive_payload';
  if (failures.some((failure) => failure.includes('missing_recipient') || failure === 'missing_recipientRef' || failure === 'missing_recipientRole')) return 'blocked_missing_recipient';
  if (failures.some((failure) => failure.includes('missing_template') || failure.includes('unsupported_event') || failure.includes('unsupported_channel'))) return 'template_review_required';
  if (failures.some((failure) => failure.includes('manual_confirmation'))) return 'manual_confirmation_required';
  if (failures.length) return 'conflict_review_required';
  if (notification.channel && notification.channel.includes('provider_pending')) return 'provider_configuration_required';
  if (notification.channel === 'whatsapp_web_fallback' || notification.channel === 'manual_task' || notification.channel === 'email_draft') return 'manual_action_required';
  return 'outbox_preview_ready';
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

  const notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
  if (!Array.isArray(payload.notifications)) warnings.push('input.notifications missing or not an array');

  const rows = notifications.map((notification) => {
    const failures = validateNotification(notification, contract);
    const outcome = outcomeFor(failures, notification);
    return {
      outcome,
      validationFailures: failures,
      tenantId: notification.tenantId || null,
      projectId: notification.projectId || null,
      notificationId: notification.notificationId || null,
      eventType: notification.eventType || null,
      channel: notification.channel || null,
      templateId: notification.templateId || null,
      templateVersion: notification.templateVersion || null,
      recipientRole: notification.recipientRole || null,
      recipientRef: notification.recipientRef || null,
      shopperId: notification.shopperId || null,
      visitId: notification.visitId || null,
      hrRowId: notification.hrRowId || null,
      postulationId: notification.postulationId || null,
      assignmentId: notification.assignmentId || null,
      recommendedOutboxStatus: outcome === 'outbox_preview_ready' ? 'queued_preview_only' : outcome,
      recommendedManualFallbackStatus: notification.channel === 'whatsapp_web_fallback' || notification.channel === 'email_draft' ? 'copy_button_available' : 'not_required'
    };
  });

  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    notificationCount: notifications.length,
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
  const postulationContract = readJson(postulationContractPath);
  const assignmentContract = readJson(assignmentContractPath);
  const visitContract = readJson(visitContractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'pushSendAllowed', 'hrWriteAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');
  if (postulationContract.runtimeEnabled !== false) issues.push('Postulation dependency must keep runtime disabled');
  if (assignmentContract.runtimeEnabled !== false) issues.push('Assignment dependency must keep runtime disabled');
  if (visitContract.runtimeEnabled !== false) issues.push('Visit lifecycle dependency must keep runtime disabled');

  for (const key of ['tenantId', 'projectId', 'notificationId', 'templateId', 'templateVersion', 'recipientRole', 'recipientRef', 'channel', 'outboxStatus']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['outbox_preview_ready', 'manual_action_required', 'blocked_sensitive_payload', 'blocked_missing_recipient', 'template_review_required']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  for (const channel of ['in_app', 'email_draft', 'whatsapp_web_fallback', 'manual_task']) {
    if (!contract.channels?.includes(channel)) issues.push(`Missing channel: ${channel}`);
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
    validator: 'tya-notification-outbox-preview-validator',
    status: issues.length ? 'review_required' : 'notification_outbox_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    makeWriteAllowed: false,
    emailSendAllowed: false,
    whatsappSendAllowed: false,
    pushSendAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, sensitivePolicyPath),
      path.relative(root, postulationContractPath),
      path.relative(root, assignmentContractPath),
      path.relative(root, visitContractPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized notifications only.',
      'Keep external sends as draft/manual fallback while providers are off.',
      'Route sensitive payloads to review before creating templates.',
      'Update Claude/prototype and Academia with notification outbox states.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-notification-outbox-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
