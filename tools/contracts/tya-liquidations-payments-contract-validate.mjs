#!/usr/bin/env node
/* CXOrbia TyA - Liquidations/payments contract validator
   Safe validator. No payment calls, no provider calls, no DB writes. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : null;

const contractPath = 'backend/contracts/liquidations-payments-phase-a-v1.json';
const adapterPath = 'backend/adapters/liquidations-payment-state-adapter.preview.mjs';
const hardFails = [];
const warnings = [];
const info = [];
function add(list, message, extra = {}) { list.push({ message, ...extra }); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function readJson(rel) { return JSON.parse(read(rel)); }

let contract = null;
if (!exists(contractPath)) add(hardFails, 'liquidations_payments_contract_missing', { file: contractPath });
else {
  try {
    contract = readJson(contractPath);
    add(info, 'contract_json_valid', { file: contractPath });
  } catch (err) {
    add(hardFails, 'contract_json_invalid', { file: contractPath, error: String(err.message || err) });
  }
}

if (!exists(adapterPath)) add(hardFails, 'liquidations_payment_adapter_missing', { file: adapterPath });
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
    'paymentProviderConnected: false',
    'paymentExecutionEnabled: false',
    'paymentStateWritesEnabled: false',
    'assertPaymentWriteGate',
    'PAYMENT_STATE_WRITE_GATE_BLOCKED',
    'PAYMENT_ADAPTER_NOT_CONNECTED',
    'assertNoSensitivePaymentFields',
    'createLiquidationsPaymentStateAdapter'
  ]) {
    if (!text.includes(term)) add(hardFails, 'adapter_required_term_missing', { term });
  }
}

if (contract) {
  if (contract.status !== 'draft_safe_not_connected') add(hardFails, 'contract_status_not_safe', { status: contract.status });
  for (const [key, expected] of Object.entries({
    paymentProviderConnected: false,
    frontendConnected: false,
    paymentExecutionEnabled: false,
    paymentStateWritesEnabled: false,
    bankDataStoredInRepo: false,
    productionEnabled: false,
    containsSecrets: false,
    containsSensitiveData: false
  })) {
    if (contract.safeState?.[key] !== expected) add(hardFails, 'safe_state_invalid', { key, expected, actual: contract.safeState?.[key] });
  }
  for (const collection of ['liquidations', 'paymentBatches', 'paymentStateAudit', 'paymentConflicts']) {
    if (!contract.collections?.[collection]?.phaseA) add(hardFails, 'collection_missing_or_disabled', { collection });
  }
  for (const key of ['tenantId', 'projectId', 'liquidationId', 'shopperId', 'visitId', 'hrRowId', 'assignmentId', 'country', 'currency', 'periodKey', 'quincena', 'honorariumAmount', 'reimbursementAmount', 'totalAmount', 'status', 'source', 'auditRef']) {
    if (!contract.requiredLiquidationKeys?.includes(key)) add(hardFails, 'required_liquidation_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'paymentBatchId', 'periodKey', 'country', 'currency', 'status', 'liquidationIds', 'totalAmount', 'createdBy', 'createdAt', 'auditRef']) {
    if (!contract.requiredPaymentBatchKeys?.includes(key)) add(hardFails, 'required_payment_batch_key_missing', { key });
  }
  for (const key of ['tenantId', 'projectId', 'liquidationId', 'paymentBatchId', 'shopperId', 'visitId', 'hrRowId', 'assignmentId', 'periodKey', 'country', 'currency']) {
    if (!contract.stableKeys?.includes(key)) add(hardFails, 'stable_key_missing', { key });
  }
  for (const status of ['pending_source_review', 'calculated_preview', 'review_required', 'approved_for_batch', 'batched_prepared', 'payment_scheduled', 'payment_reprogrammed', 'paid_confirmed_audited', 'disputed', 'cancelled_with_audit']) {
    if (!contract.statusModel?.liquidationStatuses?.[status]) add(hardFails, 'liquidation_status_missing', { status });
  }
  for (const status of ['draft_preview', 'review_required', 'approved_prepared', 'scheduled', 'partially_paid_audited', 'paid_confirmed_audited', 'cancelled_with_audit']) {
    if (!contract.statusModel?.paymentBatchStatuses?.[status]) add(hardFails, 'payment_batch_status_missing', { status });
  }
  for (const forbidden of ['rawBankAccount', 'rawAccountNumber', 'bankRoutingRaw', 'dpiRaw', 'paymentReceiptBinary', 'paymentReceiptBase64', 'privateBankPortalUrl', 'paymentProviderToken', 'signedPaymentInstruction', 'rawShopperEmail', 'rawShopperPhone']) {
    if (!contract.forbiddenInRepo?.includes(forbidden)) add(hardFails, 'forbidden_repo_policy_missing', { forbidden });
  }
  for (const gate of ['devCalculationPreview', 'devPaymentStateWrite', 'stagingPaymentOps', 'productionPaymentState', 'realPaymentExecution']) {
    if (!contract.gates?.[gate]) add(hardFails, 'gate_missing', { gate });
  }
  if (contract.phaseAContext?.visitsThroughJuneExecuted !== true) add(hardFails, 'phase_a_june_visits_context_missing');
  if (contract.phaseAContext?.junePendingIsPaymentsNotVisits !== true) add(hardFails, 'phase_a_june_payment_context_missing');
  if (contract.sourceValidation?.hrQuestionnaireCompletedRequired !== true) add(hardFails, 'hr_questionnaire_validation_missing');
  if (contract.sourceValidation?.hrSubmittedDateRequiredForFinalPayment !== true) add(hardFails, 'hr_submit_validation_missing');
}

const indexPath = 'app/index.html';
if (exists(indexPath)) {
  const index = read(indexPath);
  if (index.includes('liquidations-payment-state-adapter.preview.mjs') || index.includes('liquidations-payments-phase-a-v1')) {
    add(hardFails, 'preview_liquidations_payment_adapter_must_not_be_loaded_by_frontend');
  } else {
    add(info, 'frontend_not_connected_to_liquidations_payment_preview_adapter');
  }
}

const report = {
  gate: 'cxorbia-tya-liquidations-payments-contract',
  generatedAt: new Date().toISOString(),
  verdict: hardFails.length ? 'NO_GO_LIQUIDATIONS_PAYMENTS_CONTRACT' : 'GO_SAFE_LIQUIDATIONS_PAYMENTS_CONTRACT_NOT_CONNECTED',
  hardFailCount: hardFails.length,
  warningCount: warnings.length,
  safeState: {
    paymentProviderConnected: false,
    frontendConnected: false,
    paymentExecutionEnabled: false,
    paymentStateWritesEnabled: false,
    bankDataStoredInRepo: false,
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
  fs.writeFileSync(path.join(abs, 'liquidations-payments-contract-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia TyA Liquidations payments contract report',
    '',
    `Generated: ${report.generatedAt}`,
    `Verdict: ${report.verdict}`,
    `Hard fails: ${hardFails.length}`,
    `Warnings: ${warnings.length}`,
    '',
    '## Hard fails',
    ...(hardFails.length ? hardFails.map(x => `- ${x.message}${x.key ? ` · ${x.key}` : ''}${x.collection ? ` · ${x.collection}` : ''}${x.status ? ` · ${x.status}` : ''}${x.gate ? ` · ${x.gate}` : ''}`) : ['- none']),
    '',
    '## Safe state',
    '- Payment provider not connected',
    '- Frontend not connected',
    '- Payment execution disabled',
    '- Payment state writes disabled',
    '- No bank data in repo',
    '- No deploy',
    '- No production',
    '- No provider calls',
    '- No database writes',
    '- No imports',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(abs, 'liquidations-payments-contract-report.md'), md, 'utf8');
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = hardFails.length ? 1 : 0;
