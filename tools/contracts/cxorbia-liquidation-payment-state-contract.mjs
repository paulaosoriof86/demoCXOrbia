#!/usr/bin/env node
/*
  CXOrbia - reusable liquidation/payment state contract
  Synthetic validation only. No deploy, no provider calls, no DB writes, no imports, no payment execution.
*/

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxorbia-liquidation-payment-state-contract';

const statuses = new Set(['pending_calculation', 'pending_review', 'scheduled', 'paid_confirmed', 'blocked_review', 'carried_forward', 'voided']);
const amountFields = ['honorariumAmount', 'reimbursementAmount', 'adjustmentAmount', 'totalAmount'];
const forbiddenSensitiveFields = ['bankAccount', 'bankNumber', 'dpi', 'documentNumber', 'ndaFile', 'rawAttachment', 'paymentCredential'];

const items = [
  { liquidationId: 'liq-001', tenantId: 'tenant-demo', projectId: 'project-demo', periodId: '2026-06', country: 'GT', currency: 'GTQ', shopperId: 'shopper-demo-001', visitRef: 'visit-001', sourceRef: 'hr-row-001', honorariumAmount: 50, reimbursementAmount: 35, adjustmentAmount: 0, totalAmount: 85, paymentStatus: 'pending_review', evidenceRefs: ['hr-preview'], reviewedBy: null, paidAt: null },
  { liquidationId: 'liq-002', tenantId: 'tenant-demo', projectId: 'project-demo', periodId: '2026-06', country: 'GT', currency: 'GTQ', shopperId: 'shopper-demo-002', visitRef: 'visit-002', sourceRef: 'hr-row-002', honorariumAmount: 50, reimbursementAmount: 0, adjustmentAmount: 0, totalAmount: 50, paymentStatus: 'scheduled', evidenceRefs: ['batch-preview'], reviewedBy: 'finance-reviewer', paidAt: null },
  { liquidationId: 'liq-003', tenantId: 'tenant-demo', projectId: 'project-demo', periodId: '2026-05', country: 'GT', currency: 'GTQ', shopperId: 'shopper-demo-003', visitRef: 'visit-003', sourceRef: 'movement-ref-003', honorariumAmount: 50, reimbursementAmount: 25, adjustmentAmount: 0, totalAmount: 75, paymentStatus: 'paid_confirmed', evidenceRefs: ['movement-control'], reviewedBy: 'finance-reviewer', paidAt: '2026-06-15' },
  { liquidationId: 'liq-004', tenantId: 'tenant-demo', projectId: 'project-demo', periodId: '2026-06', country: 'GT', currency: 'GTQ', shopperId: 'shopper-demo-004', visitRef: 'visit-004', sourceRef: null, honorariumAmount: 50, reimbursementAmount: 35, adjustmentAmount: 0, totalAmount: 85, paymentStatus: 'blocked_review', evidenceRefs: ['missing-source-ref'], reviewedBy: null, paidAt: null }
];

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateItem(item) {
  const errors = [];
  const warnings = [];
  for (const field of ['liquidationId', 'tenantId', 'projectId', 'periodId', 'country', 'currency', 'shopperId', 'visitRef']) {
    if (!item[field]) errors.push(`missing_${field}`);
  }
  for (const field of amountFields) {
    if (!isNumber(item[field])) errors.push(`invalid_${field}`);
  }
  const calculated = (item.honorariumAmount || 0) + (item.reimbursementAmount || 0) + (item.adjustmentAmount || 0);
  if (isNumber(item.totalAmount) && Math.abs(calculated - item.totalAmount) > 0.0001) errors.push('total_mismatch');
  if (!statuses.has(item.paymentStatus)) errors.push('invalid_paymentStatus');
  if (!Array.isArray(item.evidenceRefs)) errors.push('invalid_evidenceRefs');
  if (item.paymentStatus === 'paid_confirmed' && !item.paidAt) errors.push('paid_confirmed_missing_paidAt');
  if (item.paymentStatus === 'paid_confirmed' && !item.reviewedBy) errors.push('paid_confirmed_missing_reviewedBy');
  if (item.paymentStatus === 'scheduled' && !item.reviewedBy) errors.push('scheduled_missing_reviewedBy');
  if (!item.sourceRef && item.paymentStatus !== 'blocked_review') warnings.push('missing_sourceRef_should_be_blocked_review');
  for (const field of forbiddenSensitiveFields) {
    if (Object.prototype.hasOwnProperty.call(item, field)) errors.push(`forbidden_sensitive_field_${field}`);
  }
  return { liquidationId: item.liquidationId || null, ok: errors.length === 0, errors, warnings, periodId: item.periodId, paymentStatus: item.paymentStatus, totalAmount: item.totalAmount, currency: item.currency };
}

const results = items.map(validateItem);
const failures = results.filter(r => !r.ok);
const byStatus = results.reduce((acc, r) => {
  acc[r.paymentStatus] = (acc[r.paymentStatus] || 0) + 1;
  return acc;
}, {});

const report = {
  gate: 'cxorbia-liquidation-payment-state-contract',
  generatedAt: new Date().toISOString(),
  verdict: failures.length ? 'NO_GO_LIQUIDATION_PAYMENT_CONTRACT' : 'GO_LIQUIDATION_PAYMENT_CONTRACT_PREVIEW_ONLY',
  itemCount: items.length,
  failureCount: failures.length,
  byStatus,
  statuses: [...statuses],
  forbiddenSensitiveFields,
  results,
  reusableCxorbia: true,
  exclusiveClient: false,
  safeState: { deploy: false, providerCalls: false, dbWrites: false, imports: false, production: false, paymentExecution: false, sensitiveData: false }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'cxorbia-liquidation-payment-state-contract.json'), JSON.stringify(report, null, 2), 'utf8');
const md = [
  '# CXOrbia liquidation payment state contract', '',
  `Generated: ${report.generatedAt}`,
  `Verdict: ${report.verdict}`,
  `Items: ${report.itemCount}`,
  `Failures: ${report.failureCount}`,
  '',
  '## Status summary',
  ...Object.entries(byStatus).map(([status, count]) => `- ${status}: ${count}`), '',
  '## Results',
  ...results.map(r => `- ${r.liquidationId}: ${r.paymentStatus} / ${r.currency} ${r.totalAmount} / ${r.ok ? 'ok' : r.errors.join(', ')}`), '',
  '## Safe state',
  '- No deploy', '- No provider calls', '- No DB writes', '- No imports', '- No production', '- No payment execution', '- No sensitive data', ''
].join('\n');
fs.writeFileSync(path.join(outDir, 'cxorbia-liquidation-payment-state-contract.md'), md, 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
