/* CXOrbia TyA Phase A · financial control source-safe envelope.
   This is NOT a payment import. It records only approved operational claims
   until the sanitized movement/payment source is matched by stable keys. */
window.CX_TYA_FINANCIAL_CONTROL_SOURCE_SAFE = {
  schemaVersion:'1.0.0',
  tenantId:'tya',
  projectId:'cinepolis',
  cutPeriod:'2026-06',
  sourceStatus:'pending_financial_source',
  claims:{
    paidThroughPeriod:'2026-05',
    paidThroughState:'documented_claim_pending_source_match',
    june:{
      q1:'partially_pending_requires_item_match',
      q2:'all_pending_requires_item_match',
      unknownQuincena:'review_required'
    }
  },
  payments:[],
  batches:[],
  sourceSafe:true,
  imported:false,
  production:false,
  providerWrites:false,
  rawBankData:false
};
