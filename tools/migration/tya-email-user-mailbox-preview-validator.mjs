#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'email-user-mailbox-preview-phase-a.tya.contract.json');
const baseEmailContractPath = path.join(root, 'app', 'contracts', 'email-provider-agnostic-user-mailbox-phase-a.tya.contract.json');
const notificationContractPath = path.join(root, 'app', 'contracts', 'notification-outbox-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Email|Mail|Message|Whatsapp|Attachment|Audio|Body|File|Phone|Address)?/i,
  /oauth|token|secret|smtpPassword|clientSecret/i,
  /base64/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i
];

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

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

function validateMailbox(mailbox, contract) {
  const failures = [];
  for (const key of contract.requiredMailboxFields || []) {
    if (mailbox[key] === undefined || mailbox[key] === null || mailbox[key] === '') failures.push(`missing_${key}`);
  }
  if (mailbox.mailboxOwnershipType && !contract.mailboxOwnershipTypes?.includes(mailbox.mailboxOwnershipType)) failures.push(`unsupported_ownership:${mailbox.mailboxOwnershipType}`);
  if (mailbox.providerType && !contract.providerTypes?.includes(mailbox.providerType)) failures.push(`unsupported_provider:${mailbox.providerType}`);
  if (mailbox.connectionStatus && !contract.connectionStatuses?.includes(mailbox.connectionStatus)) failures.push(`unsupported_connection:${mailbox.connectionStatus}`);
  if (mailbox.emailAddress && emailPattern.test(mailbox.emailAddress)) failures.push('raw_email_address_not_allowed_in_preview');
  if (mailbox.oauthToken || mailbox.refreshToken || mailbox.smtpPassword || mailbox.clientSecret || mailbox.providerSecret) failures.push('provider_secret_not_allowed');

  const placeholder = mailbox.mailboxOwnershipType === 'fictitious_placeholder_no_send' || mailbox.connectionStatus === 'placeholder_no_send';
  const manualOnly = mailbox.mailboxOwnershipType === 'manual_contact_only' || mailbox.providerType === 'manual_log_only' || mailbox.connectionStatus === 'manual_only';
  if (placeholder && (mailbox.canSend === true || mailbox.canRead === true)) failures.push('placeholder_cannot_read_or_send');
  if (manualOnly && (mailbox.canSend === true || mailbox.canRead === true)) failures.push('manual_only_cannot_read_or_send');
  if (mailbox.connectionStatus !== 'connected_future' && (mailbox.canRead === true || mailbox.canSend === true)) failures.push('read_send_requires_future_connection');

  return [...new Set(failures)];
}

function mailboxOutcome(failures, mailbox) {
  if (failures.some((failure) => failure.includes('secret') || failure.includes('raw_email'))) return 'review_required';
  if (failures.some((failure) => failure.includes('placeholder'))) return 'mailbox_placeholder_blocked';
  if (failures.length) return 'review_required';
  if (mailbox.connectionStatus === 'manual_only' || mailbox.providerType === 'manual_log_only') return 'mailbox_manual_only_ready';
  if (['not_configured', 'connection_requested', 'oauth_pending_future', 'smtp_config_pending_future', 'unknown_to_be_configured'].includes(mailbox.connectionStatus) || mailbox.providerType === 'unknown_to_be_configured') return 'mailbox_provider_configuration_required';
  return 'mailbox_config_preview_ready';
}

function validateMailAction(action, mailboxesByKey, contract) {
  const failures = [];
  for (const key of contract.requiredMailActionFields || []) {
    if (!action[key]) failures.push(`missing_${key}`);
  }
  if (action.mailActionType && !contract.mailActionTypes?.includes(action.mailActionType)) failures.push(`unsupported_mail_action:${action.mailActionType}`);
  const mailbox = mailboxesByKey.get(`${action.tenantId || ''}::${action.userId || ''}::${action.mailboxId || ''}`);
  if (!mailbox) failures.push('missing_matching_mailbox');

  if (action.rawBody || action.rawEmailBody || action.messageBodyRaw || action.body) failures.push('raw_body_not_allowed');
  if (action.rawAttachment || action.attachmentsRaw || action.attachmentBase64) failures.push('raw_attachment_not_allowed');
  if (action.providerSent === true || action.sent === true) failures.push('provider_send_not_allowed');
  if (action.recipientEmail || action.toEmail || action.ccEmail || action.bccEmail) failures.push('raw_recipient_email_not_allowed');
  if (flattenStrings(action.templateVariables || {}).some((value) => emailPattern.test(value))) failures.push('template_variable_raw_email_not_allowed');

  if (mailbox) {
    const placeholder = mailbox.mailboxOwnershipType === 'fictitious_placeholder_no_send' || mailbox.connectionStatus === 'placeholder_no_send';
    const manualOnly = mailbox.mailboxOwnershipType === 'manual_contact_only' || mailbox.providerType === 'manual_log_only' || mailbox.connectionStatus === 'manual_only';
    if (placeholder && action.mailActionType !== 'manual_log_only') failures.push('placeholder_action_blocked');
    if (action.mailActionType?.includes('draft') && mailbox.canDraft !== true) failures.push('draft_not_allowed_for_mailbox');
    if (action.mailActionType === 'manual_log_only' && mailbox.canLogManual !== true) failures.push('manual_log_not_allowed_for_mailbox');
    if (manualOnly && action.mailActionType !== 'manual_log_only') failures.push('manual_only_requires_manual_log');
  }

  return [...new Set(failures)];
}

function actionOutcome(failures, action) {
  if (failures.some((failure) => failure.includes('raw_') || failure.includes('secret') || failure.includes('sensitive'))) return 'mail_action_blocked_sensitive_payload';
  if (failures.some((failure) => failure.includes('missing_recipient'))) return 'mail_action_blocked_missing_recipient';
  if (failures.some((failure) => failure.includes('not_allowed') || failure.includes('blocked') || failure.includes('requires'))) return 'mail_action_blocked_no_permission';
  if (failures.some((failure) => failure.includes('missing_'))) return 'review_required';
  if (action.mailActionType === 'manual_log_only') return 'mail_action_manual_log_ready';
  return 'mail_action_draft_preview_ready';
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

  const mailboxes = Array.isArray(payload.mailboxes) ? payload.mailboxes : [];
  const mailActions = Array.isArray(payload.mailActions) ? payload.mailActions : [];
  if (!Array.isArray(payload.mailboxes)) warnings.push('input.mailboxes missing or not an array');
  if (!Array.isArray(payload.mailActions)) warnings.push('input.mailActions missing or not an array');

  const mailboxesByKey = new Map(mailboxes.map((mailbox) => [`${mailbox.tenantId || ''}::${mailbox.userId || ''}::${mailbox.mailboxId || ''}`, mailbox]));
  const mailboxRows = mailboxes.map((mailbox) => {
    const failures = validateMailbox(mailbox, contract);
    const outcome = mailboxOutcome(failures, mailbox);
    return {
      outcome,
      validationFailures: failures,
      tenantId: mailbox.tenantId || null,
      userId: mailbox.userId || null,
      mailboxId: mailbox.mailboxId || null,
      mailboxOwnershipType: mailbox.mailboxOwnershipType || null,
      providerType: mailbox.providerType || null,
      connectionStatus: mailbox.connectionStatus || null,
      canRead: mailbox.canRead === true,
      canSend: mailbox.canSend === true,
      canDraft: mailbox.canDraft === true,
      canLogManual: mailbox.canLogManual === true
    };
  });

  const actionRows = mailActions.map((action) => {
    const failures = validateMailAction(action, mailboxesByKey, contract);
    const outcome = actionOutcome(failures, action);
    return {
      outcome,
      validationFailures: failures,
      tenantId: action.tenantId || null,
      userId: action.userId || null,
      mailboxId: action.mailboxId || null,
      mailActionId: action.mailActionId || null,
      mailActionType: action.mailActionType || null,
      recipientRef: action.recipientRef || null,
      entityType: action.entityType || null,
      entityRef: action.entityRef || null,
      templateId: action.templateId || null,
      templateVersion: action.templateVersion || null,
      recommendedStatus: outcome === 'mail_action_draft_preview_ready' ? 'draft_ready_preview' : outcome
    };
  });

  const counts = [...mailboxRows, ...actionRows].reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    mailboxCount: mailboxes.length,
    mailActionCount: mailActions.length,
    sensitiveKeys,
    counts,
    mailboxRows,
    actionRows,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const baseEmailContract = readJson(baseEmailContractPath);
  const notificationContract = readJson(notificationContractPath);
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'emailReadAllowed', 'emailSendAllowed', 'emailDraftAllowed', 'oauthAllowed', 'smtpAllowed', 'makeWriteAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (baseEmailContract.runtimeEnabled !== false || baseEmailContract.emailReadAllowed !== false || baseEmailContract.emailSendAllowed !== false) issues.push('Base email contract gates must remain disabled');
  if (notificationContract.emailSendAllowed !== false || notificationContract.whatsappSendAllowed !== false) issues.push('Notification contract send gates must remain disabled');
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');

  for (const key of ['tenantId', 'userId', 'mailboxId', 'mailActionId', 'recipientRef', 'draftRef', 'manualLogRef']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['mailbox_config_preview_ready', 'mailbox_provider_configuration_required', 'mail_action_draft_preview_ready', 'mail_action_blocked_sensitive_payload']) {
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
    validator: 'tya-email-user-mailbox-preview-validator',
    status: issues.length ? 'review_required' : 'email_user_mailbox_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    emailReadAllowed: false,
    emailSendAllowed: false,
    emailDraftAllowed: false,
    oauthAllowed: false,
    smtpAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, baseEmailContractPath),
      path.relative(root, notificationContractPath),
      path.relative(root, sensitivePolicyPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized mailboxes and mailActions only.',
      'Keep mailbox state as manual/placeholder/provider pending while gates are off.',
      'Route raw bodies, attachments or provider secrets to review.',
      'Update Claude/prototype and Academia with mailbox states and email draft/manual-log rules.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-email-user-mailbox-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
