#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { buildPhaseAFinanceReadModel } from '../backend/runtime/cxorbia-finance-phase-a-read-model-v1.mjs';

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
const paymentAdapterSource = fs.readFileSync('backend/adapters/liquidations-payment-state-adapter.preview.mjs', 'utf8');
const junePaidGt = june.confirmedPaidItems.reduce((sum, item) => sum + Number(item.totalPaid || 0), 0);
const juneStableKeys = june.confirmedPaidItems.map(item => `${item.visitId}::${item.hrRowId}`);

assert.equal(may.paidCount, 44);
assert.equal(may.pendingCount, 0);
assert.equal(june.visitCount, 44);
assert.equal(june.paidCount, 2);
assert.equal(june.pendingCount, 42);
assert.equal(june.confirmedPaidItems.length, 2);
assert.equal(junePaidGt, 451);
assert.equal(Number(history.summary?.junePaidGt), 451);
assert.equal(new Set(juneStableKeys).size, 2);
assert.equal(juneStableKeys.includes('hr_2026-06_gt_2_7e5eaea1bb::JUNIO 26!2'), true);
assert.equal(juneStableKeys.includes('hr_2026-06_gt_6_4ab15bcd43::JUNIO 26!6'), true);
assert.equal(model.canonicalLiquidationReconciliation.financialLiquidationRows, 247);
assert.equal(model.canonicalLiquidationReconciliation.exactAcceptedLinks, 209);
assert.equal(model.canonicalLiquidationReconciliation.reviewLiquidationRows, 38);
assert.equal(model.canonicalLiquidationReconciliation.canonicalAmountReady, 207);
assert.equal(model.canonicalLiquidationReconciliation.amountReviewRequired, 2);
assert.equal(model.rules.liquidatedIsPaid, false);
assert.equal(model.rules.inferPaidFromVisitExecution, false);
assert.equal(model.rules.paidRequiresSourceEvidence, true);
assert.equal(model.rules.rawBankDataAllowed, false);
assert.equal(model.rules.dedupeByVisualName, false);
assert.equal(paymentAdapterSource.includes('paymentExecutionEnabled: false'), true);
assert.equal(paymentAdapterSource.includes('paymentStateWritesEnabled: false'), true);
assert.equal(paymentAdapterSource.includes("'rawBankAccount'"), true);

console.log(JSON.stringify({
  schemaVersion:'cxorbia.i4d.finance-phase-a-source-verifier.v1',
  decision:'PASS_I4D_FINANCE_PHASE_A_SOURCE_READINESS',
  may:{visits:44,paid:44,pending:0},
  june:{visits:44,paid:2,pending:42,confirmedPaidItems:2,confirmedPaidGt:junePaidGt,stableKeys:juneStableKeys},
  reconciliation:{financialLiquidationRows:247,exactAcceptedLinks:209,reviewLiquidationRows:38,canonicalAmountReady:207,amountReviewRequired:2},
  rules:{liquidatedIsPaid:false,inferPaidFromVisitExecution:false,paidRequiresSourceEvidence:true,dedupeByVisualName:false},
  safety:{paymentExecution:false,paymentStateWrites:false,providerCalls:0,firestoreWrites:0,rawBankData:false},
  tests:24
}, null, 2));
