#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'notification-outbox-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'makeWriteAllowed', 'whatsappApiAllowed', 'emailSendAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const stableKeys = contract.stableKeys || [];
  for (const key of ['tenantId', 'projectId', 'notificationId', 'outboxId', 'templateId', 'recipientUserId', 'eventType', 'channel', 'deliveryStatus']) {
    if (!stableKeys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const channels = contract.channels || [];
  for (const channel of ['in_app', 'whatsapp_web', 'make_messaging_future']) {
    if (!channels.includes(channel)) issues.push(`Missing channel: ${channel}`);
  }

  const statuses = contract.deliveryStatuses || [];
  for (const status of ['prepared_whatsapp_web', 'manual_send_required', 'blocked_by_gate', 'requires_recipient_contact_review']) {
    if (!statuses.includes(status)) issues.push(`Missing delivery status: ${status}`);
  }

  const events = contract.eventTypesPhaseA || [];
  for (const eventType of ['postulation_approved', 'date_adjustment_requested', 'date_confirmation_requested', 'assignment_created', 'academy_manual_updated']) {
    if (!events.includes(eventType)) issues.push(`Missing event type: ${eventType}`);
  }

  const templateRules = contract.templateRules || [];
  if (!templateRules.some((rule) => rule.includes('Soft non-selection'))) warnings.push('Soft non-selection template rule should be explicit');
  if (!templateRules.some((rule) => rule.includes('raw HR'))) issues.push('Missing no raw HR columns rule');

  const gate = contract.automationGate || {};
  if (gate.makeEnabled !== false) issues.push('makeEnabled must remain false');
  if (gate.whatsappApiEnabled !== false) issues.push('whatsappApiEnabled must remain false');
  if (gate.manualWhatsappWebAllowed !== true) warnings.push('Manual WhatsApp Web fallback should remain allowed for Phase A');

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not send real WhatsApp API', 'Do not call Make', 'Do not write Firestore', 'Do not mark manual WhatsApp Web text as API sent']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('ops')) warnings.push('Academy impact should include ops role');
  if (!Array.isArray(academy.newLessons) || !academy.newLessons.some((lesson) => lesson.includes('WhatsApp Web'))) warnings.push('Academy should include WhatsApp Web lesson');

  const report = {
    validator: 'tya-notification-outbox-contract-validator',
    status: issues.length ? 'review_required' : 'notification_outbox_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    makeWriteAllowed: false,
    whatsappApiAllowed: false,
    fileChecked: path.relative(root, contractPath),
    channels,
    deliveryStatuses: statuses,
    eventTypesPhaseA: events,
    automationGate: gate,
    academyImpact: academy,
    issues,
    warnings,
    nextSafeSteps: [
      'Map existing notification UI text to templates without sending messages.',
      'Prepare WhatsApp Web copy generation and manual confirmation states.',
      'Use outbox statuses in postulation, assignment, visit and Academy workflows.',
      'Update Academy manuals and role courses for notifications and fallbacks.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-notification-outbox-contract-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
