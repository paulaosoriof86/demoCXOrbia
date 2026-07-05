#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'rule-change-changelog-notification-preview-phase-a.tya.contract.json');
const dependencyPaths = [
  'project-tenant-rule-versioning-preview-phase-a.tya.contract.json',
  'notification-outbox-preview-phase-a.tya.contract.json',
  'email-user-mailbox-preview-phase-a.tya.contract.json',
  'shopper-communication-history-preview-phase-a.tya.contract.json',
  'sensitive-data-policy-phase-a.tya.contract.json'
].map((file) => path.join(root, 'app', 'contracts', file));

const sensitiveKeyPatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco|account|cuenta|iban|swift/i,
  /phone|telefono|teléfono|whatsapp|email|recipientEmail|recipientPhone/i,
  /raw(Body|Message|Recipient|Payload|Contact|Url|Link|Attachment)?/i,
  /token|secret|clientSecret|oauth/i,
  /base64|attachment|adjunto|privateLink|signedUrl/i
];

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
  return [...new Set(keys.filter((key) => sensitiveKeyPatterns.some((pattern) => pattern.test(key))))];
}

function validateEvent(event, contract) {
  const failures = [];
  for (const key of contract.requiredChangeEventFields || []) {
    if (event[key] === undefined || event[key] === null || event[key] === '') failures.push(`missing_${key}`);
  }
  if (event.changeType && !contract.changeTypes?.includes(event.changeType)) failures.push(`unsupported_changeType:${event.changeType}`);
  if (event.impactScope && !contract.impactScopes?.includes(event.impactScope)) failures.push(`unsupported_impactScope:${event.impactScope}`);
  if (event.audienceRole && !contract.audienceRoles?.includes(event.audienceRole)) failures.push(`unsupported_audienceRole:${event.audienceRole}`);
  if (event.changelogStatus && !contract.changelogStatuses?.includes(event.changelogStatus)) failures.push(`unsupported_changelogStatus:${event.changelogStatus}`);
  if (event.notificationPreviewStatus && !contract.notificationPreviewStatuses?.includes(event.notificationPreviewStatus)) failures.push(`unsupported_notificationPreviewStatus:${event.notificationPreviewStatus}`);
  if (event.sent === true || event.delivered === true || event.published === true || event.makeSent === true || event.emailSent === true || event.whatsappSent === true) failures.push('real_send_or_publish_flag_not_allowed');
  if (event.rawBody || event.messageBody || event.rawRecipient || event.recipientEmail || event.recipientPhone || event.privateLink || event.signedUrl) failures.push('raw_message_or_recipient_not_allowed');
  if (event.secrets || event.credentials || event.providerToken || event.oauthToken) failures.push('secret_payload_not_allowed');

  const strings = flattenStrings(event.safeSummary || event.templateVariables || event.metadata || {});
  if (strings.some((value) => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value))) failures.push('raw_email_in_safe_fields');
  if (strings.some((value) => /(?:\+?\d[\d\s().-]{7,}\d)/.test(value))) failures.push('raw_phone_in_safe_fields');
  if (strings.some((value) => /(token=|sig=|access_token=|sharepoint\.com|drive\.google\.com|onedrive)/i.test(value))) failures.push('private_or_signed_link_in_safe_fields');

  const highImpact = ['breaking_change_preview', 'migration_required_preview', 'rollback_required_preview', 'payment_rule_changed_preview', 'hr_mapping_changed_preview', 'questionnaire_routing_changed_preview', 'sensitive_policy_changed_preview'];
  if (highImpact.includes(event.changeType) && (!event.reviewedByRef || !event.approvedByRef)) failures.push('high_impact_change_requires_review_and_approval');
  if (event.changeType === 'migration_required_preview' && !event.migrationPlanId) failures.push('migration_context_required');
  if (event.changeType === 'rollback_required_preview' && !event.rollbackPlanId) failures.push('rollback_context_required');
  if (event.changeType === 'academy_content_update_required' && !event.academyUpdateRef) failures.push('academy_update_ref_required');
  if (event.notificationPreviewStatus === 'notification_draft_preview' && !event.notificationTemplateId) failures.push('notification_draft_requires_template');
  return [...new Set(failures)];
}

function outcomeFor(failures, event) {
  if (failures.some((failure) => failure.includes('secret') || failure.includes('raw_') || failure.includes('private') || failure.includes('sensitive'))) return 'blocked_sensitive_payload';
  if (failures.some((failure) => failure.includes('real_send'))) return 'blocked_real_send';
  if (failures.some((failure) => failure.includes('migration'))) return 'migration_context_required';
  if (failures.some((failure) => failure.includes('rollback'))) return 'rollback_context_required';
  if (failures.some((failure) => failure.includes('academy_update'))) return 'academy_update_required';
  if (failures.some((failure) => failure.includes('review') || failure.includes('approval'))) return 'human_review_required';
  if (failures.length) return 'conflict_review_required';
  if (event.notificationPreviewStatus === 'notification_draft_preview') return 'notification_draft_preview_ready';
  if (event.changeType === 'academy_content_update_required') return 'academy_update_required';
  return 'changelog_preview_ready';
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
  const events = Array.isArray(payload.changeEvents) ? payload.changeEvents : [];
  if (!Array.isArray(payload.changeEvents)) warnings.push('input.changeEvents missing or not an array');
  const rows = events.map((event) => {
    const failures = validateEvent(event, contract);
    return {
      outcome: outcomeFor(failures, event),
      validationFailures: failures,
      tenantId: event.tenantId || null,
      projectId: event.projectId || null,
      changeEventId: event.changeEventId || null,
      changeLogId: event.changeLogId || null,
      ruleSetId: event.ruleSetId || null,
      ruleSetVersion: event.ruleSetVersion || null,
      ruleSetType: event.ruleSetType || null,
      changeType: event.changeType || null,
      impactScope: event.impactScope || null,
      audienceRole: event.audienceRole || null,
      changelogStatus: event.changelogStatus || null,
      notificationPreviewStatus: event.notificationPreviewStatus || null,
      academyUpdateRef: event.academyUpdateRef || null
    };
  });
  const counts = rows.reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });
  return { inputChecked: path.relative(root, inputPath), changeEventCount: events.length, sensitiveKeys, counts, rows, issues, warnings };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const dependencies = dependencyPaths.map(readJson);
  const issues = [];
  const warnings = [];
  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'emailSendAllowed', 'whatsappSendAllowed', 'geminiAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  dependencies.forEach((dependency, index) => {
    if (dependency.runtimeEnabled !== false && dependency.status !== 'draft_documental_no_runtime') issues.push(`Dependency runtime must remain disabled: ${path.basename(dependencyPaths[index])}`);
  });
  for (const key of ['tenantId', 'projectId', 'changeLogId', 'changeEventId', 'ruleSetId', 'ruleSetVersion', 'ruleSetType', 'impactScope']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
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
    validator: 'tya-rule-change-changelog-notification-preview-validator',
    status: issues.length ? 'review_required' : 'rule_change_changelog_notification_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    emailSendAllowed: false,
    whatsappSendAllowed: false,
    geminiAllowed: false,
    importRealDataAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: dependencyPaths.map((filePath) => path.relative(root, filePath)),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized changeEvents only.',
      'Keep changelog as draft/preview until human approval exists.',
      'Route notification drafts through outbox/mailbox future gates only.',
      'Update Claude/prototype and Academia with changelog and role notification states.'
    ]
  };
  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ validator: 'tya-rule-change-changelog-notification-preview-validator', status: 'error', runtimeEnabled: false, productionAllowed: false, firestoreWritesAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
