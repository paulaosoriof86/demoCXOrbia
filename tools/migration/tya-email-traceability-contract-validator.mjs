#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'email-traceability-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'emailReadAllowed', 'emailSendAllowed', 'oauthAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const stableKeys = contract.stableKeys || [];
  for (const key of ['tenantId', 'emailAccountId', 'threadId', 'messageId', 'provider', 'relatedEntityType', 'relatedEntityId', 'traceStatus']) {
    if (!stableKeys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const providers = contract.providersFuture || [];
  for (const provider of ['gmail_oauth_future', 'microsoft_outlook_oauth_future', 'manual_email_log']) {
    if (!providers.includes(provider)) issues.push(`Missing provider option: ${provider}`);
  }

  const statuses = contract.traceStatuses || [];
  for (const status of ['manual_logged', 'linked_to_entity', 'requires_privacy_review', 'blocked_by_gate']) {
    if (!statuses.includes(status)) issues.push(`Missing trace status: ${status}`);
  }

  const bodyPolicies = contract.bodyStoragePolicies || [];
  for (const policy of ['metadata_only', 'snippet_only', 'full_body_requires_policy_future']) {
    if (!bodyPolicies.includes(policy)) issues.push(`Missing body storage policy: ${policy}`);
  }

  const privacyRules = contract.privacyAndSecurityRules || [];
  if (!privacyRules.some((rule) => rule.includes('Do not store raw sensitive'))) issues.push('Missing sensitive data storage rule');
  if (!privacyRules.some((rule) => rule.includes('attachments'))) issues.push('Missing attachment privacy rule');

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not connect real email accounts', 'Do not read real emails', 'Do not send real emails', 'Do not write Firestore']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('admin')) warnings.push('Academy impact should include admin role');
  if (!Array.isArray(academy.newLessons) || !academy.newLessons.some((lesson) => lesson.includes('traceability'))) warnings.push('Academy should include traceability lesson');

  const report = {
    validator: 'tya-email-traceability-contract-validator',
    status: issues.length ? 'review_required' : 'email_traceability_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    emailReadAllowed: false,
    emailSendAllowed: false,
    oauthAllowed: false,
    fileChecked: path.relative(root, contractPath),
    providersFuture: providers,
    traceStatuses: statuses,
    bodyStoragePolicies: bodyPolicies,
    academyImpact: academy,
    issues,
    warnings,
    nextSafeSteps: [
      'Map manual email logging and future provider sync without connecting real accounts.',
      'Define privacy policy before storing full email bodies or attachments.',
      'Connect email trace links to postulations, visits, support, clients, training requests and payments.',
      'Update Academy manuals and role courses for email traceability.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-email-traceability-contract-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
