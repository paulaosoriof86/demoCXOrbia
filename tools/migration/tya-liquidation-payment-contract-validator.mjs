#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'liquidation-payment-phase-a.tya.contract.json');

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
  for (const key of ['tenantId', 'projectId', 'visitId', 'hrRowId', 'shopperId', 'liquidationId', 'paymentStatus', 'currency']) {
    if (!keys.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  const liquidationStatuses = contract.liquidationStatuses || [];
  for (const status of ['candidate_pending_submitido', 'candidate_ready', 'approved_for_payment', 'held_for_conflict', 'paid']) {
    if (!liquidationStatuses.includes(status)) issues.push(`Missing liquidation status: ${status}`);
  }

  const paymentStatuses = contract.paymentStatuses || [];
  for (const status of ['scheduled', 'pending_payment', 'paid', 'payment_reprogrammed', 'manual_review_required']) {
    if (!paymentStatuses.includes(status)) issues.push(`Missing payment status: ${status}`);
  }

  const eligibilityRules = contract.eligibilityRules || [];
  if (!eligibilityRules.some((rule) => rule.includes('June visits already executed'))) issues.push('Missing June executed visits rule');
  if (!eligibilityRules.some((rule) => rule.includes('Questionnaire completed alone'))) issues.push('Missing questionnaire not enough rule');
  if (!eligibilityRules.some((rule) => rule.includes('Honorarium and reimbursement are separate'))) issues.push('Missing honorarium/reimbursement separation rule');

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not execute real payments', 'Do not write Firestore', 'Do not expose bank data', 'Do not mark paid']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('shopper')) warnings.push('Academy impact should include shopper role');

  const report = {
    validator: 'tya-liquidation-payment-contract-validator',
    status: issues.length ? 'review_required' : 'liquidation_payment_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    paymentProviderAllowed: false,
    fileChecked: path.relative(root, contractPath),
    liquidationStatuses,
    paymentStatuses,
    academyImpact: academy,
    issues,
    warnings,
    nextSafeSteps: [
      'Map HR submitido/review status to liquidation eligibility without enabling writes.',
      'Prepare June payment cutoff preview using mock/staging data.',
      'Keep bank data excluded/protected until privacy policy and storage rules are approved.',
      'Update Academy manuals and role courses for liquidations, payments and Mis beneficios.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-liquidation-payment-contract-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
