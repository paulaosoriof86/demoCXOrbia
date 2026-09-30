#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json');

const forbiddenFieldPatterns = [
  /dpi/i,
  /documento/i,
  /identificacion/i,
  /identificación/i,
  /passport/i,
  /pasaporte/i,
  /bank/i,
  /banco/i,
  /cuenta/i,
  /iban/i,
  /swift/i,
  /nda/i,
  /firma/i,
  /signature/i,
  /adjunto/i,
  /attachment/i,
  /raw/i
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

function normalizeAmount(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9,.-]/g, '').replace(/,/g, '');
    if (!cleaned) return 0;
    return Number(cleaned);
  }
  return Number.NaN;
}

function findForbiddenFields(value, prefix = '') {
  const found = [];
  if (!value || typeof value !== 'object') return found;

  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (forbiddenFieldPatterns.some((pattern) => pattern.test(key))) found.push(fullKey);
    if (child && typeof child === 'object') found.push(...findForbiddenFields(child, fullKey));
  }
  return found;
}

function getAmount(row, ...keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) return normalizeAmount(row[key]);
  }
  return 0;
}

function hasStableVisitKey(row) {
  return Boolean(row.visitId || row.hrRowId || row.sourceVisitRef);
}

function hasSubmitidoOrReview(row) {
  return row.submitidoStatus === 'submitido_registered'
    || row.submitidoStatus === 'submitted'
    || row.submitidoStatus === 'ok'
    || row.reviewStatus === 'approved_for_submitido'
    || row.reviewStatus === 'approved'
    || row.adminReviewStatus === 'approved_for_payment';
}

function classifyRow(row) {
  const boletoAmount = getAmount(row, 'boletoAmount', 'Boleto', 'boleto');
  const comboAmount = getAmount(row, 'comboAmount', 'Combo', 'combo');
  const honorariumAmount = getAmount(row, 'honorariumAmount', 'honorarioAmount', 'honorario');
  const reimbursementTotal = boletoAmount + comboAmount;
  const total = honorariumAmount + reimbursementTotal;
  const rowIssues = [];
  const rowWarnings = [];

  for (const key of ['tenantId', 'projectId', 'shopperId', 'periodId', 'country', 'currency']) {
    if (!row[key]) rowIssues.push(`missing_${key}`);
  }
  if (!hasStableVisitKey(row)) rowIssues.push('missing_visitId_or_hrRowId');

  for (const [fieldName, amount] of Object.entries({ boletoAmount, comboAmount, honorariumAmount })) {
    if (!Number.isFinite(amount)) rowIssues.push(`invalid_amount_${fieldName}`);
    if (Number.isFinite(amount) && amount < 0) rowIssues.push(`negative_amount_${fieldName}`);
  }

  const forbiddenFields = findForbiddenFields(row);
  if (forbiddenFields.length) rowIssues.push(`forbidden_sensitive_fields:${forbiddenFields.join(',')}`);

  let liquidationStatus = 'manual_review_required';
  let paymentStatus = 'manual_review_required';
  let movementStatus = 'draft_preview';

  if (row.visitPerformed !== true && row.visitStatus !== 'performed') {
    liquidationStatus = 'not_eligible';
    paymentStatus = 'not_scheduled';
    rowWarnings.push('visit_not_marked_performed');
  } else if (!hasSubmitidoOrReview(row)) {
    liquidationStatus = 'candidate_pending_submitido';
    paymentStatus = 'not_scheduled';
  } else if (row.paymentStatus === 'paid' && !row.historicalPaymentRef && !row.manualPaymentConfirmationRef) {
    liquidationStatus = 'held_for_conflict';
    paymentStatus = 'manual_review_required';
    movementStatus = 'conflict_review_required';
    rowIssues.push('paid_without_stable_payment_reference');
  } else if (row.paymentStatus === 'paid' || row.historicalPaymentRef || row.manualPaymentConfirmationRef) {
    liquidationStatus = 'paid';
    paymentStatus = 'paid';
    movementStatus = row.historicalPaymentRef ? 'paid_historical_confirmed' : 'paid_manual_confirmed';
  } else if (row.selectedForBatch === true) {
    liquidationStatus = 'approved_for_payment';
    paymentStatus = 'scheduled';
    movementStatus = 'pending_batch_payment';
  } else {
    liquidationStatus = 'candidate_ready';
    paymentStatus = 'pending_payment';
  }

  if (rowIssues.length) {
    liquidationStatus = liquidationStatus === 'paid' ? 'held_for_conflict' : 'manual_review_required';
    paymentStatus = 'manual_review_required';
    movementStatus = 'conflict_review_required';
  }

  return {
    sourceRowRef: row.sourceRowRef || row.hrRowId || row.visitId || 'row_without_ref',
    tenantId: row.tenantId || null,
    projectId: row.projectId || null,
    shopperId: row.shopperId || null,
    visitId: row.visitId || null,
    hrRowId: row.hrRowId || null,
    periodId: row.periodId || null,
    country: row.country || null,
    currency: row.currency || null,
    honorariumAmount,
    boletoAmount,
    comboAmount,
    reimbursementTotal,
    total,
    liquidationStatus,
    paymentStatus,
    movementStatus,
    requiresManualReview: rowIssues.length > 0 || liquidationStatus === 'manual_review_required',
    rowIssues,
    rowWarnings
  };
}

function validateInputPreview(inputFile, contract) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];

  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');
  if (payload.runtimeEnabled === true || payload.productionAllowed === true || payload.firestoreWritesAllowed === true || payload.hrWriteAllowed === true || payload.paymentProviderAllowed === true) {
    issues.push('input gates must not enable runtime, production, Firestore, HR or payment provider');
  }
  if (!Array.isArray(payload.rows)) issues.push('input.rows must be an array');

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const mappedRows = rows.map(classifyRow);
  const rowIssues = mappedRows.flatMap((row, index) => row.rowIssues.map((issue) => `row_${index + 1}:${issue}`));
  const manualReviewCount = mappedRows.filter((row) => row.requiresManualReview).length;
  const juneRows = mappedRows.filter((row) => String(row.periodId || '').includes('2026-06'));
  const paidRows = mappedRows.filter((row) => row.paymentStatus === 'paid');
  const pendingRows = mappedRows.filter((row) => row.paymentStatus === 'pending_payment' || row.paymentStatus === 'scheduled');

  if (!rows.length) warnings.push('input.rows is empty; validator only checked contract and safety metadata');
  if (!juneRows.length) warnings.push('No 2026-06 rows found in safe preview input');
  if (rowIssues.length) issues.push(...rowIssues);

  return {
    inputChecked: path.relative(root, inputPath),
    rowCount: rows.length,
    juneRowCount: juneRows.length,
    paidRowCount: paidRows.length,
    pendingOrScheduledRowCount: pendingRows.length,
    manualReviewCount,
    mappedRows,
    issues,
    warnings,
    contractStatus: contract.status
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'paymentProviderAllowed', 'hrWriteAllowed', 'makeEnabled', 'geminiEnabled', 'emailEnabled']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  for (const required of ['tenantId', 'projectId', 'shopperId', 'visitId', 'hrRowId', 'periodId', 'country', 'currency', 'honorariumAmount', 'boletoAmount', 'comboAmount', 'reimbursementTotal', 'batchId', 'paymentItemId', 'movementId']) {
    if (!contract.stableKeys?.includes(required)) issues.push(`Missing stable key: ${required}`);
  }

  if (!contract.sourceSafety?.requiresSyntheticOrSanitizedInput) issues.push('Contract must require synthetic/sanitized input');
  if (!contract.sourceSafety?.forbidsRawSensitiveData) issues.push('Contract must forbid raw sensitive data');
  if (!contract.sourceSafety?.manualReviewForAmbiguousMapping) issues.push('Contract must route ambiguous mapping to manual review');

  const forbiddenDeclared = contract.sourceSafety?.forbiddenSensitiveFields || [];
  for (const expected of ['DPI', 'bankAccount', 'NDA', 'rawAttachment']) {
    if (!forbiddenDeclared.includes(expected)) warnings.push(`Recommended forbidden sensitive field not declared: ${expected}`);
  }

  let inputPreview = null;
  if (args.input) {
    inputPreview = validateInputPreview(args.input, contract);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; no source rows were read or mapped');
  }

  const report = {
    validator: 'tya-liquidation-cinepolis-source-safe-preview-validator',
    status: issues.length ? 'review_required' : 'source_safe_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    paymentProviderAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Use only synthetic or sanitized local preview files with sourceSafe=true.',
      'Validate June cutoff rows before any historical source import is authorized.',
      'Keep Boleto and Combo mapping as source-safe preview until HR/fuentes are validated.',
      'Route ambiguous payment matches to manual_review_required, never visual dedupe only.',
      'Update Academy liquidations/payments lessons with the safe preview rules.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-liquidation-cinepolis-source-safe-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
