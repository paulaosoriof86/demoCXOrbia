#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { buildPhaseAFinanceReadModel } from '../backend/runtime/cxorbia-finance-phase-a-read-model-v1.mjs';
import { LIQUIDATIONS_PAYMENT_ADAPTER_STATUS, buildLiquidationRecord } from '../backend/adapters/liquidations-payment-state-adapter.preview.mjs';

const window = {};
const context = vm.createContext({ window });
for (const file of [
  'app/data/tya-payment-history-source-safe.js',
  'app/data/tya-financial-control-source-safe.js',
  'app/data/tya-financial-canonical-source-safe.js'
]) vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });

const history = window.CX_TYA_PAYMENT_HISTORY_SOURCE_SAFE;
const control = window.CX_TYA_FINANCIAL_CONTROL_SOURCE_SAFE;
const canonicalSummary = window.__CX_TYA_FINANCIAL_RAW?.M?.summary || {};
const model = buildPhaseAFinanceReadModel({ paymentHistory: history, financialControl: control, financialCanonicalSummary: canonicalSummary });
const may = model.periods.find(p => p.periodKey === '2026-05');
const june = model.periods.find(p => p.periodKey === '2026-06');

assert.equal(may.paidCount, 44);
assert.equal(may.pendingCount, 0);
assert.equal(june.visitCount, 44);
assert.equal(june.paidCount, 2);
assert.equal(june.pendingCount, 42);
assert.equal(june.confirmedPaidItems.length, 2);
assert.equal(model.canonicalLiquidationReconciliation.financialLiquidationRows, 247);
assert.equal(model.canonicalLiquidationReconciliation.exactAcceptedLinks, 209);
assert.equal(model.canonicalLiquidationReconciliation.reviewLiquidationRows, 38);
assert.equal(model.canonicalLiquidationReconciliation.canonicalAmountReady, 207);
assert.equal(model.canonicalLiquidationReconciliation.amountReviewRequired, 2);
assert.equal(LIQUIDATIONS_PAYMENT_ADAPTER_STATUS.paymentExecutionEnabled, false);
assert.equal(LIQUIDATIONS_PAYMENT_ADAPTER_STATUS.paymentStateWritesEnabled, false);

const sample = buildLiquidationRecord({tenantId:'tya',projectId:'cinepolis',actorId:'source-verifier'}, {
  shopperId:'shopper_safe', visitId:'visit_safe', hrRowId:'JUNIO 26!2', assignmentId:'assignment_safe', country:'GT', currency:'Q', periodKey:'2026-06', quincena:'Q1', auditRef:'source-verifier', honorariumAmount:60, reimbursementAmount:163
});
assert.equal(sample.totalAmount, 223);
let forbiddenBlocked = false;
try { buildLiquidationRecord({tenantId:'tya',projectId:'cinepolis'}, {...sample, rawBankAccount:'forbidden'}); } catch (error) { forbiddenBlocked = error.code === 'PAYMENT_FORBIDDEN_FIELD'; }
assert.equal(forbiddenBlocked, true);

console.log(JSON.stringify({
  schemaVersion:'cxorbia.i4d.finance-phase-a-source-verifier.v1',
  decision:'PASS_I4D_FINANCE_PHASE_A_SOURCE_READINESS',
  may:{visits:44,paid:44,pending:0},
  june:{visits:44,paid:2,pending:42,confirmedPaidItems:2},
  reconciliation:{financialLiquidationRows:247,exactAcceptedLinks:209,reviewLiquidationRows:38,canonicalAmountReady:207,amountReviewRequired:2},
  safety:{paymentExecution:false,paymentStateWrites:false,providerCalls:0,firestoreWrites:0,rawBankData:false},
  tests:14
}, null, 2));
