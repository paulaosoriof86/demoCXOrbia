/* CXOrbia TyA · Corte 3 canonical financial + historical payment source-safe adapter.
   Build-time DEV overlay only. It preserves CX.data's public interface and makes
   Finanzas and Beneficios consume the same reconciled financial and payment truth.
   Historical payments are read-only evidence; this adapter never executes payments. */
window.CX = window.CX || {};
(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = String(window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  const snapshot = window.CX_TYA_FINANCIAL_CANONICAL_SOURCE_SAFE || null;
  const paymentHistory = window.CX_TYA_PAYMENT_HISTORY_SOURCE_SAFE || null;
  const valid = !!(
    enabled && snapshot && snapshot.sourceSafe !== false &&
    paymentHistory && paymentHistory.sourceSafe !== false &&
    window.CX && CX.data && CX.liq && CX.fin &&
    Array.isArray(snapshot.liquidations) &&
    Array.isArray(snapshot.reviewQueue) &&
    Array.isArray(snapshot.payments) && snapshot.payments.length === 0 &&
    Array.isArray(snapshot.batches) && snapshot.batches.length === 0 &&
    Array.isArray(paymentHistory.paidItems) &&
    Array.isArray(paymentHistory.historicalPaymentGroups)
  );

  window.CX_TYA_FINANCIAL_CANONICAL_READY = false;
  window.CX_TYA_PAYMENT_HISTORY_READY = false;
  if(!valid) return;

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const periodKeyOf = (visit,item) => String(
    (item && item.periodKey) ||
    (visit && (visit.periodKey || visit.periodId)) ||
    ''
  ).replace(/^cinepolis-/,'');
  const exactByVisitId = new Map();
  const exactByHrRowId = new Map();
  snapshot.liquidations.forEach(item => {
    if(item && item.reviewRequired !== true){
      if(item.visitId) exactByVisitId.set(String(item.visitId), item);
      if(item.hrRowId) exactByHrRowId.set(String(item.hrRowId), item);
    }
  });

  const paymentByVisitId = new Map();
  const paymentByHrRowId = new Map();
  paymentHistory.paidItems.forEach(item => {
    if(item && item.paymentConfirmed === true){
      if(item.visitId) paymentByVisitId.set(String(item.visitId), item);
      if(item.hrRowId) paymentByHrRowId.set(String(item.hrRowId), item);
    }
  });
  const periodPolicies = paymentHistory.periodPolicies || {};

  const matchForVisit = visit => {
    if(!visit) return null;
    return exactByVisitId.get(String(visit.id || visit.visitId || '')) ||
      exactByHrRowId.get(String(visit.hrRowId || '')) || null;
  };

  function paymentTruthFor(visit,item){
    const explicit = paymentByVisitId.get(String(
      (item && item.visitId) || (visit && (visit.id || visit.visitId)) || ''
    )) || paymentByHrRowId.get(String(
      (item && item.hrRowId) || (visit && visit.hrRowId) || ''
    ));
    if(explicit) return explicit;
    const periodKey = periodKeyOf(visit,item);
    const policy = periodPolicies[periodKey];
    return policy && policy.paymentConfirmed === true ? policy : null;
  }

  function applyHistoricalPaymentTruth(liquidation, visit, item){
    if(!liquidation) return liquidation;
    const truth = paymentTruthFor(visit,item || liquidation);
    if(!truth) return liquidation;
    const paidDay = Number.isFinite(Number(truth.paidDay)) ? Number(truth.paidDay) : null;
    const explicitRow = !!truth.paymentItemId;
    const explicitIdentityAndAmounts = explicitRow ? {
      visitaId:truth.visitId || liquidation.visitaId || liquidation.visitId || null,
      visitId:truth.visitId || liquidation.visitId || liquidation.visitaId || null,
      hrRowId:truth.hrRowId || liquidation.hrRowId || (visit && visit.hrRowId) || null,
      paymentItemId:truth.paymentItemId,
      pais:truth.country || liquidation.pais || null,
      moneda:truth.currency || liquidation.moneda || null,
      honorario:num(truth.honorarioPaid),
      reembolso:num(truth.reimbursementPaid),
      total:num(truth.totalPaid),
      amountSource:'historical_payment_source_safe'
    } : {};
    return Object.assign({}, liquidation, explicitIdentityAndAmounts, {
      estado:'pagada',
      paymentState:'payment_confirmed',
      paymentConfirmed:true,
      honorarioPaymentState:'paid',
      reimbursementPaymentState:'paid',
      paymentSourceRef:truth.paymentSourceRef,
      historicalPaymentGroupId:truth.historicalPaymentGroupId || null,
      paymentBatchId:null,
      paidAt:truth.paidAt || null,
      paidAtPrecision:truth.paidAtPrecision || null,
      paidDay,
      confirmedBy:'historical_source_safe',
      confirmationScope:truth.confirmationScope || 'source_row_confirmation',
      auditRef:truth.auditRef || null,
      paymentHistoryMode:'historical_source_safe',
      paymentExecutionAllowed:false,
      pagada:true,
      pagadaPreview:false,
      fechaEstimadaPago:paidDay ? ('Confirmado · día '+paidDay) : 'Pago histórico confirmado',
      sourceSafe:true,
      imported:false,
      production:false
    });
  }

  function enrichSnapshotItem(item){
    if(!item) return item;
    return applyHistoricalPaymentTruth(Object.assign({}, item), null, item);
  }

  CX.data.financialSnapshot = snapshot;
  CX.data.paymentHistorySnapshot = paymentHistory;
  CX.data.financialSourceMeta = {
    snapshotId:snapshot.snapshotId,
    generatedAt:snapshot.generatedAt,
    sourceRef:snapshot.source && snapshot.source.financialWorkbookRef,
    paymentHistorySourceRef:paymentHistory.source && paymentHistory.source.workbookSha256,
    identityVersion:snapshot.identityVersion,
    paymentHistoryVersion:paymentHistory.schemaVersion,
    exactAcceptedLinks:snapshot.summary && snapshot.summary.exactAcceptedLinks,
    reviewLiquidationRows:snapshot.summary && snapshot.summary.reviewLiquidationRows,
    reviewQueue:snapshot.summary && snapshot.summary.reviewQueue,
    amountReviewRequired:snapshot.summary && snapshot.summary.amountReviewRequired,
    canonicalAmountReady:snapshot.summary && snapshot.summary.canonicalAmountReady,
    paymentConfirmedCount:paymentHistory.summary && paymentHistory.summary.confirmedPaymentVisits || 0,
    historicalPaymentGroups:paymentHistory.historicalPaymentGroups.length,
    sourceSafe:true,
    imported:false,
    production:false
  };
  CX.data.financialLiquidations = function(){ return clone(snapshot.liquidations.map(enrichSnapshotItem)); };
  CX.data.financialReviewQueue = function(){ return clone(snapshot.reviewQueue); };
  CX.data.financialAmountReviewQueue = function(){ return clone(snapshot.amountReviewQueue || []); };
  CX.data.paymentEvidenceCandidates = function(){ return clone(snapshot.paymentEvidenceCandidates || []); };
  CX.data.paymentBatches = function(){ return []; };
  CX.data.confirmedPayments = function(){ return clone(paymentHistory.paidItems); };
  CX.data.historicalPaymentGroups = function(){ return clone(paymentHistory.historicalPaymentGroups); };
  CX.data.paymentHistoryTruthForVisit = function(visit){
    const item=matchForVisit(visit);
    const truth=paymentTruthFor(visit,item);
    return truth ? clone(truth) : null;
  };
  CX.data.financialMatchForVisit = function(visit){
    const item=matchForVisit(visit);
    return item ? clone(enrichSnapshotItem(item)) : null;
  };

  const baseFromVisita = typeof CX.liq.fromVisita === 'function' ? CX.liq.fromVisita.bind(CX.liq) : null;
  const baseLabel = typeof CX.liq.label === 'function' ? CX.liq.label.bind(CX.liq) : null;
  const baseVisitContract = typeof CX.data.visitContract === 'function' ? CX.data.visitContract.bind(CX.data) : null;
  const basePorPais = typeof CX.fin.porPais === 'function' ? CX.fin.porPais.bind(CX.fin) : null;

  function canonicalLiquidation(project, visit, item){
    const honorario=num(item.honorario), boleto=num(item.boleto), combo=num(item.combo);
    const reembolso=boleto+combo;
    const total=num(item.total);
    const liquidation = {
      visitaId:visit.id,
      visitId:visit.id,
      hrRowId:item.hrRowId || visit.hrRowId || null,
      paymentItemId:item.paymentItemId || null,
      sourceRecordId:item.sourceRecordId || null,
      projectId:project.id,
      rootProjectId:'cinepolis',
      periodKey:item.periodKey || visit.periodKey || null,
      shopper:visit.shopper || null,
      shopperCode:visit.shopperCode || null,
      shopperId:visit.shopperId || null,
      sucursal:visit.sucursal || 'Visita HR',
      pais:item.country || visit.pais || visit.country || null,
      moneda:item.currency || visit.currency || '',
      loteId:null,
      honorario,
      boleto,
      combo,
      reembolso,
      total,
      estado:'conciliada_pendiente_pago',
      liquidationState:'reconciled_source_safe',
      paymentState:'pending_source_confirmation',
      paymentConfirmed:false,
      honorarioPaymentState:'pending_source_confirmation',
      reimbursementPaymentState:'pending_source_confirmation',
      paymentSourceRef:null,
      historicalPaymentGroupId:null,
      paymentBatchId:null,
      paidAt:null,
      paidAtPrecision:null,
      paidDay:null,
      confirmedBy:null,
      confirmationScope:null,
      auditRef:null,
      freal:visit.realizada || item.visitDate || '',
      cuest:visit.cuestFecha || '',
      submit:visit.submit ? (visit.submittedAt || visit.cuestFecha || '') : '',
      fechaEstimadaPago:'',
      pagada:false,
      pagadaPreview:false,
      financialSourceStatus:'exact_reconciled_source_safe',
      amountSource:item.amountSource || 'financial_workbook_reconciled_source_safe',
      reviewRequired:false,
      sourceSafe:true,
      imported:false,
      production:false
    };
    return applyHistoricalPaymentTruth(liquidation, visit, item);
  }

  function operationalPending(project, visit){
    const base = baseFromVisita ? baseFromVisita(project, visit) : null;
    if(!base) return null;
    const estado = base.estado === 'pendiente_cuestionario' || base.estado === 'pendiente_submitir'
      ? base.estado : 'pendiente_fuente_financiera';
    const liquidation = Object.assign({}, base, {
      visitaId:visit.id || base.visitaId || null,
      visitId:visit.id || base.visitId || base.visitaId || null,
      hrRowId:visit.hrRowId || base.hrRowId || null,
      periodKey:visit.periodKey || base.periodKey || null,
      pais:visit.pais || visit.country || base.pais || null,
      moneda:visit.moneda || visit.currency || base.moneda || null,
      estado,
      liquidationState:'pending_financial_source',
      paymentState:'pending_source_confirmation',
      paymentConfirmed:false,
      honorarioPaymentState:'pending_source_confirmation',
      reimbursementPaymentState:'pending_source_confirmation',
      paymentSourceRef:null,
      historicalPaymentGroupId:null,
      paymentBatchId:null,
      paidAt:null,
      paidAtPrecision:null,
      paidDay:null,
      confirmedBy:null,
      confirmationScope:null,
      auditRef:null,
      fechaEstimadaPago:'',
      pagada:false,
      pagadaPreview:false,
      financialSourceStatus:'pending_or_review',
      amountSource:'hr_operational_amount_pending_financial_reconciliation',
      reviewRequired:true,
      sourceSafe:true,
      imported:false,
      production:false
    });
    return applyHistoricalPaymentTruth(liquidation, visit, null);
  }

  CX.liq.forProject = function(data){
    const project = data.period();
    const visits = typeof data.visitas === 'function' ? data.visitas() : [];
    return visits.map(visit => {
      const item = matchForVisit(visit);
      return item ? canonicalLiquidation(project, visit, item) : operationalPending(project, visit);
    }).filter(Boolean);
  };

  CX.liq.label = function(state){
    if(state === 'pagada') return ['Pagada confirmada','g'];
    if(state === 'conciliada_pendiente_pago') return ['Conciliada · pago pendiente de confirmar','a'];
    if(state === 'pendiente_fuente_financiera') return ['Pend. fuente financiera','a'];
    if(state === 'revision_financiera') return ['Revisión financiera','r'];
    return baseLabel ? baseLabel(state) : [state,'n'];
  };

  CX.data.visitContract = function(visit){
    const contract = baseVisitContract ? baseVisitContract(visit) : {id:visit && visit.id || null};
    const item = matchForVisit(visit);
    const truth = paymentTruthFor(visit,item);
    return Object.assign({}, contract, {
      liquidationState:item ? 'reconciled_source_safe' : 'pending_financial_source',
      paymentState:truth ? 'payment_confirmed' : 'pending_source_confirmation',
      paymentConfirmed:!!truth,
      paymentSourceRef:truth && truth.paymentSourceRef || null,
      historicalPaymentGroupId:truth && truth.historicalPaymentGroupId || null,
      paidAt:truth && truth.paidAt || null,
      paidAtPrecision:truth && truth.paidAtPrecision || null,
      financialSourceStatus:item ? 'exact_reconciled_source_safe' : 'pending_or_review',
      financialSourceRecordId:item && item.sourceRecordId || null,
      financialReviewRequired:!item,
      paymentHistoryMode:truth ? 'historical_source_safe' : null,
      paymentExecutionAllowed:false,
      sourceSafe:true
    });
  };

  if(basePorPais){
    CX.fin.porPais = function(data){
      const out = basePorPais(data);
      const activePeriodKey=String((data.period() || {}).periodKey || '').replace(/^cinepolis-/,'');
      Object.keys(out || {}).forEach(country => {
        const exactCount = snapshot.liquidations.filter(item =>
          item.country === country && item.periodKey === activePeriodKey
        ).length;
        out[country] = Object.assign({}, out[country], {
          financialSourceStatus:'canonical_source_safe',
          exactReconciledRecords:exactCount,
          paymentConfirmedRecords:num(out[country] && out[country].pagosConfirmados),
          reviewQueueCount:CX.liq.forProject(data).filter(item =>
            item.pais===country && item.reviewRequired===true
          ).length,
          paymentHistoryMode:'historical_source_safe',
          sourceSafe:true
        });
      });
      return out;
    };
  }

  if(CX.dataSource){
    CX.dataSource.financialMode = 'canonical_source_safe_with_historical_payments';
    CX.dataSource.financialStatus = 'ready_with_review_and_payment_history';
    CX.dataSource.financialSourceRef = snapshot.source && snapshot.source.financialWorkbookRef;
    CX.dataSource.paymentHistorySourceRef = paymentHistory.source && paymentHistory.source.workbookSha256;
    CX.dataSource.financialUpdatedAt = snapshot.generatedAt;
    CX.dataSource.financialWarnings = [
      String((snapshot.summary && snapshot.summary.reviewLiquidationRows) || 0) + ' filas financieras permanecen en revisión de vínculo.',
      String((snapshot.summary && snapshot.summary.amountReviewRequired) || 0) + ' vínculos exactos permanecen en revisión de consistencia de montos.',
      'Histórico source-safe: mayo 2026 completo y junio 2026 parcialmente confirmado.',
      'Los grupos históricos son inmutables y no ejecutan pagos ni lotes.'
    ];
  }

  window.CX_TYA_FINANCIAL_CANONICAL_READY = true;
  window.CX_TYA_PAYMENT_HISTORY_READY = true;
  window.CX_TYA_FINANCIAL_CANONICAL_CONTRACT = {
    snapshotId:snapshot.snapshotId,
    exactAcceptedLinks:snapshot.liquidations.length,
    canonicalAmountReady:snapshot.liquidations.filter(item=>item.reviewRequired!==true).length,
    reviewQueue:snapshot.reviewQueue.length,
    amountReviewQueue:(snapshot.amountReviewQueue || []).length,
    paymentEvidenceCandidates:(snapshot.paymentEvidenceCandidates || []).length,
    confirmedPayments:paymentHistory.summary && paymentHistory.summary.confirmedPaymentVisits || 0,
    historicalPaymentGroups:paymentHistory.historicalPaymentGroups.length,
    batches:0,
    paymentExecutionAllowed:false,
    sameTruthForFinanzasAndBeneficios:true,
    sourceSafe:true,
    imported:false,
    production:false
  };
})();
