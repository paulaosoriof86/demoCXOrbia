#!/usr/bin/env node
/* CXOrbia TyA - Make/outbox contract validator
   Safe validator. No Make calls, no provider calls, no DB writes. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/make-outbox-phase-a-v1.json';
const adapterPath = 'backend/adapters/make-outbox-adapter.preview.mjs';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
if (!exists(contractPath)) add(hardFails, 'make_outbox_contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (!exists(adapterPath)) add(hardFails, 'make_outbox_adapter_missing', { file: adapterPath });
else {
  const text = read(adapterPath);
  try {
    execFileSync('node', ['--check', path.join(root, adapterPath)], { stdio: 'pipe' });
    add(info, 'adapter_syntax_ok', { file: adapterPath });
  } catch (err) {
    add(hardFails, 'adapter_syntax_fail', { file: adapterPath, error: String(err.stderr || err.message).slice(0, 800) });
  }
  for (const term of [
    'connectedToFrontend: false',
    'makeProviderConnected: false',
    'webhookCallsEnabled: false',
    'messageDispatchEnabled: false',
    'hrWritesEnabled: false',
    'paymentDispatchEnabled: false',
    'assertProviderGate',
    'OUTBOX_PROVIDER_GATE_BLOCKED',
    'OUTBOX_NOT_CONNECTED',
    'assertSafePayload',
    'createMakeOutboxAdapter'
  ]) {
    if (!text.includes(term)) add(hardFails, 'adapter_required_term_missing', { term });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    makeProviderConnected: false,
    frontendConnected: false,
    webhookCallsEnabled: false,
    messageDispatchEnabled: false,
    hrWritesEnabled: false,
    paymentDispatchEnabled: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const key of ['tenantId', 'messageId', 'projectId', 'channel', 'messageType', 'status', 'gateStatus', 'dedupeKey', 'createdAt', 'createdBy', 'auditRef']) {
    if (!contract.requiredOutboxKeys?.includes(key)) add(hardFails, 'required_outbox_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'entityType', 'entityId', 'messageType', 'recipientRef', 'periodKey']) {
    if (!contract.stableDedupeKeys?.includes(key)) add(hardFails, 'stable_dedupe_key_missing', { key });
  }
  for (const channel of ['whatsapp', 'email', 'platformNotification', 'hrSync', 'paymentOps', 'geminiReview']) {
    if (!contract.channels?.[channel]?.phaseA) add(hardFails, 'channel_missing_or_disabled', { channel });
  }
  for (const type of ['applicationApproved', 'visitAssigned', 'visitRescheduleRequested', 'visitOutOfRange', 'questionnairePending', 'certificationAssigned', 'paymentBatchPrepared', 'hrAssignmentSyncPrepared', 'geminiQuestionBankDraft']) {
    if (!contract.messageTypes?.[type]) add(hardFails, 'message_type_missing', { type });
  }
  for (const gate of ['devPrepareOnly', 'devProviderDispatch', 'stagingProviderDispatch', 'productionProviderDispatch']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
  for (const forbidden of ['makeWebhookUrl', 'whatsappProviderToken', 'outlookRefreshToken', 'gmailToken', 'privateRecipientRawList', 'rawPhone', 'rawEmail', 'paymentInstructionRaw', 'providerSecret', 'geminiApiKey']) {
    if (!contract.forbiddenInRepo?.includes(forbidden)) add(hardFails, 'forbidden_repo_policy_missing', { forbidden });
  }
  if (contract.conflictPolicy?.dedupeStrategy !== 'stable_keys_only') add(hardFails, 'dedupe_strategy_must_be_stable_keys_only');
  if (contract.conflictPolicy?.visualMatchOnlyAllowed !== false) add(hardFails, 'visual_match_only_must_be_forbidden');
  if (contract.conflictPolicy?.duplicateDispatchAllowed !== false) add(hardFails, 'duplicate_dispatch_must_be_forbidden');
}

const indexPath = 'app/index.html';
if (exists(indexPath)) {
  const index = read(indexPath);
  if (index.includes('make-outbox-adapter.preview.mjs') || index.includes('make-outbox-phase-a-v1')) {
    add(hardFails, 'preview_make_outbox_adapter_must_not_be_loaded_by_frontend');
  } else {
    add(info, 'frontend_not_connected_to_make_outbox_preview_adapter');
  }
}

const report = {
  gate: 'cxorbia-tya-make-outbox-contract',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_MAKE_OUTBOX_CONTRACT' : 'GO_SAFE_MAKE_OUTBOX_CONTRACT_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    makeProviderConnected: false,
    frontendConnected: false,
    webhookCallsEnabled: false,
    messageDispatchEnabled: false,
    hrWritesEnabled: false,
    paymentDispatchEnabled: false,
    deploy: false,
    production: false,
    providerCalls: false,
    databaseWrites: false,
    imports: false
  },
  hardFails,
  warnings,
  info
};

if (outDir) {
  const abs = path.join(root, outDir);
  fs.mkdirSync(abs, { recursive: true });
  fs.writeFileSync(path.join(abs, 'make-outbox-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Make outbox contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.key ? ` · ${x.key}` : ''}${x.channel ? ` · ${x.channel}` : ''}${x.type ? ` · ${x.type}` : ''}${x.gate ? ` · ${x.gate}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Make provider not connected',
    '- Frontend not connected',
    '- Webhook calls disabled',
    '- Message dispatch disabled',
    '- HR writes disabled',
    '- Payment dispatch disabled',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'make-outbox-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
