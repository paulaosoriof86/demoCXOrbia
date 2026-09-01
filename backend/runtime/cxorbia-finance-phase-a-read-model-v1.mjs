/* CXOrbia Phase A finance read model. Source-only: no payment/provider/Firestore writes. */
export const VERSION = 'cxorbia-finance-phase-a-read-model-v1';

const int = value => Number.parseInt(value, 10);
const invariant = (condition, code) => { if (!condition) { const e = new Error(code); e.code = code; throw e; } };

export function buildPhaseAFinanceReadModel({ paymentHistory = {}, financialControl = {}, financialCanonicalSummary = {} } = {}) {
  invariant(paymentHistory.sourceSafe === true, 'FINANCE_PAYMENT_HISTORY_NOT_SOURCE_SAFE');
  invariant(paymentHistory.executionAllowed === false, 'FINANCE_PAYMENT_HISTORY_EXECUTION_MUST_BE_BLOCKED');
  invariant(paymentHistory.tenantId === 'tya' && paymentHistory.projectId === 'cinepolis', 'FINANCE_SCOPE_MISMATCH');

  const mayPolicy = paymentHistory.periodPolicies?.['2026-05'];
  const summary = paymentHistory.summary || {};
  invariant(mayPolicy?.paymentConfirmed === true && int(mayPolicy.visitCount) === 44, 'FINANCE_MAY_COMPLETE_CONFIRMATION_MISSING');
  invariant(int(summary.mayVisits) === 44 && int(summary.mayPaid) === 44 && int(summary.mayPending) === 0, 'FINANCE_MAY_SUMMARY_INVALID');
  invariant(int(summary.juneVisits) === 44 && int(summary.junePaid) === 2 && int(summary.junePending) === 42, 'FINANCE_JUNE_SUMMARY_INVALID');
  invariant(Array.isArray(paymentHistory.paidItems) && paymentHistory.paidItems.length === 2, 'FINANCE_JUNE_PAID_ITEMS_INVALID');
  invariant(paymentHistory.paidItems.every(item => item.periodKey === '2026-06' && item.paymentConfirmed === true && item.executionAllowed === false && item.visitId && item.hrRowId), 'FINANCE_JUNE_PAID_ITEM_IDENTITY_INVALID');
  invariant(financialControl.cutPeriod === '2026-06', 'FINANCE_CONTROL_CUT_INVALID');
  invariant(financialControl.claims?.paidThroughPeriod === '2026-05', 'FINANCE_PAID_THROUGH_CLAIM_INVALID');
  invariant(financialControl.claims?.june?.q1 === 'partially_pending_requires_item_match', 'FINANCE_JUNE_Q1_CONTROL_INVALID');
  invariant(financialControl.claims?.june?.q2 === 'all_pending_requires_item_match', 'FINANCE_JUNE_Q2_CONTROL_INVALID');

  return Object.freeze({
    schemaVersion: VERSION,
    tenantId: 'tya',
    projectId: 'cinepolis',
    sourceSafe: true,
    paymentExecutionEnabled: false,
    paymentStateWritesEnabled: false,
    periods: [
      {
        periodKey: '2026-05',
        visitCount: 44,
        paidCount: 44,
        pendingCount: 0,
        state: 'paid_historical_confirmed',
        confirmationScope: mayPolicy.confirmationScope,
        paymentSourceRef: mayPolicy.paymentSourceRef,
        auditRef: mayPolicy.auditRef
      },
      {
        periodKey: '2026-06',
        visitCount: 44,
        paidCount: 2,
        pendingCount: 42,
        state: 'partially_paid_pending',
        q1Control: financialControl.claims.june.q1,
        q2Control: financialControl.claims.june.q2,
        confirmedPaidItems: paymentHistory.paidItems.map(item => ({
          visitId: item.visitId,
          hrRowId: item.hrRowId,
          country: item.country,
          currency: item.currency,
          totalPaid: item.totalPaid,
          paymentSourceRef: item.paymentSourceRef,
          auditRef: item.auditRef
        }))
      }
    ],
    canonicalLiquidationReconciliation: {
      financialLiquidationRows: int(financialCanonicalSummary.financialLiquidationRows || 0),
      exactAcceptedLinks: int(financialCanonicalSummary.exactAcceptedLinks || 0),
      reviewLiquidationRows: int(financialCanonicalSummary.reviewLiquidationRows || 0),
      canonicalAmountReady: int(financialCanonicalSummary.canonicalAmountReady || 0),
      amountReviewRequired: int(financialCanonicalSummary.amountReviewRequired || 0)
    },
    rules: {
      liquidatedIsPaid: false,
      inferPaidFromVisitExecution: false,
      paidRequiresSourceEvidence: true,
      rawBankDataAllowed: false,
      dedupeByVisualName: false
    }
  });
}

export default buildPhaseAFinanceReadModel;
