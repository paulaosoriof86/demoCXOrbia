#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'cinepolis-reimbursements-payment-batch-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'paymentProviderAllowed', 'hrWriteAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const keys = contract.stableKeys || [];
  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'shopperId', 'batchId', 'paymentItemId', 'movementId', 'boletoAmount', 'comboAmount', 'reimbursementTotal']) {
    if (!keys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const fields = contract.cinepolisReimbursementFields || {};
  if (fields.boleto?.hrColumnLabel !== 'Boleto') issues.push('Missing/incorrect Boleto HR column mapping');
  if (fields.combo?.hrColumnLabel !== 'Combo') issues.push('Missing/incorrect Combo HR column mapping');
  if (!fields.totalRule?.includes('boletoAmount + comboAmount')) issues.push('Missing Boleto + Combo total rule');

  const batchRules = contract.batchRules || [];
  if (!batchRules.some((rule) => rule.includes('select which eligible payment items'))) issues.push('Missing selectable batch item rule');
  if (!batchRules.some((rule) => rule.includes('Individual movement entries'))) issues.push('Missing individual movement after batch rule');
  if (!batchRules.some((rule) => rule.includes('May and July'))) issues.push('Missing May/July historical payment reconciliation rule');

  const movementRules = contract.movementRules || [];
  if (!movementRules.some((rule) => rule.includes('batchId'))) issues.push('Missing movement batchId rule');
  if (!movementRules.some((rule) => rule.includes('honorarium, boleto, combo'))) issues.push('Missing movement detail rule');

  const reconciliation = contract.historicalReconciliationRules || [];
  if (!reconciliation.some((rule) => rule.includes('manual review'))) warnings.push('Historical reconciliation should route ambiguous matches to manual review');

  const itemStatuses = contract.paymentItemStatuses || [];
  for (const status of ['eligible_not_selected', 'selected_for_batch', 'paid_in_batch', 'paid_historical_import', 'manual_review_required']) {
    if (!itemStatuses.includes(status)) issues.push(`Missing payment item status: ${status}`);
  }

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not execute real payments', 'Do not import raw source files', 'Do not duplicate historical May/July', 'Do not expose bank data']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const report = {
    validator: 'tya-cinepolis-reimbursements-payment-batch-validator',
    status: issues.length ? 'review_required' : 'cinepolis_reimbursement_batch_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    paymentProviderAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    sourceReferences: contract.sourceReferences,
    reimbursementFields: fields,
    paymentItemStatuses: itemStatuses,
    movementStatuses: contract.movementStatuses || [],
    issues,
    warnings,
    nextSafeSteps: [
      'Prepare safe preview for Boleto/Combo reimbursement mapping from mock/staging HR rows.',
      'Prepare batch selection preview without executing payments.',
      'Prepare individual movement ledger preview with batchId/paymentItemId references.',
      'Reconcile historical May/July paid items only after safe source mapping is available.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-cinepolis-reimbursements-payment-batch-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
