/* CXOrbia TyA · Corte 3 canonical financial source-safe adapter.
   Build-time DEV overlay only. It preserves CX.data's public interface and makes
   Finanzas and Beneficios consume the same reconciled financial truth.
   It never confirms or executes payments. */
window.CX = window.CX || {};
(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = String(window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  const snapshot = window.CX_TYA_FINANCIAL_CANONICAL_SOURCE_SAFE || null;
  const valid = !!(
    enabled && snapshot && snapshot.sourceSafe !== false &&
    window.CX && CX.data && CX.liq && CX.fin &&
    Array.isArray(snapshot.liquidations) &&
    Array.isArray(snapshot.reviewQueue) &&
    Array.isArray(snapshot.payments) && snapshot.payments.length === 0 &&
    Array.isArray(snapshot.batches) && snapshot.batches.length === 0
  );

  window.CX_TYA_FINANCIAL_CANONICAL_READY = false;
  if(!valid) return;

  const exactByVisitId = new Map();
  const exactByHrRowId = new Map();
  snapshot.liquidations.forEach(item => {
    if(item && item.reviewRequired !== true && item.paymentConfirmed !== true){
      if(item.visitId) exactByVisitId.set(String(item.visitId), item);
      if(item.hrRowId) exactByHrRowId.set(String(item.hrRowId), item);
    }
  });

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const matchForVisit = visit => {
    if(!visit) return null;
    return exactByVisitId.get(String(visit.id || visit.visitId || '')) ||
      exactByHrRowId.get(String(visit.hrRowId || '')) || null;
  };

  CX.data.financialSnapshot = snapshot;
  CX.data.financialSourceMeta = {
    snapshotId:snapshot.snapshotId,
    generatedAt:snapshot.generatedAt,
    sourceRef:snapshot.source && snapshot.source.financialWorkbookRef,
    identityVersion:snapshot.identityVersion,
    exactAcceptedLinks:snapshot.summary && snapshot.summary.exactAcceptedLinks,
    reviewLiquidationRows:snapshot.summary && snapshot.summary.reviewLiquidationRows,
    reviewQueue:snapshot.summary && snapshot.summary.reviewQueue,
    amountReviewRequired:snapshot.summary && snapshot.summary.amountReviewRequired,
    canonicalAmountReady:snapshot.summary && snapshot.summary.canonicalAmountReady,
    paymentConfirmedCount:0,
    sourceSafe:true,
    imported:false,
    production:false
  };
  CX.data.financialLiquidations = function(){ return clone(snapshot.liquidations); };
  CX.data.financialReviewQueue = function(){ return clone(snapshot.reviewQueue); };
  CX.data.financialAmountReviewQueue = function(){ return clone(snapshot.amountReviewQueue || []); };
  CX.data.paymentEvidenceCandidates = function(){ return clone(snapshot.paymentEvidenceCandidates || []); };
  CX.data.paymentBatches = function(){ return []; };
  CX.data.confirmedPayments = function(){ return []; };
  CX.data.financialMatchForVisit = function(visit){ const item=matchForVisit(visit); return item ? clone(item) : null; };

  const baseFromVisita = typeof CX.liq.fromVisita === 'function' ? CX.liq.fromVisita.bind(CX.liq) : null;
  const baseLabel = typeof CX.liq.label === 'function' ? CX.liq.label.bind(CX.liq) : null;
  const baseVisitContract = typeof CX.data.visitContract === 'function' ? CX.data.visitContract.bind(CX.data) : null;
  const basePorPais = typeof CX.fin.porPais === 'function' ? CX.fin.porPais.bind(CX.fin) : null;

  function canonicalLiquidation(project, visit, item){
    const honorario=num(item.honorario), boleto=num(item.boleto), combo=num(item.combo);
    const reembolso=boleto+combo;
    const total=num(item.total);
    return {
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
      paymentSourceRef:null,
      paymentBatchId:null,
      paidAt:null,
      confirmedBy:null,
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
  }

  function operationalPending(project, visit){
    const base = baseFromVisita ? baseFromVisita(project, visit) : null;
    if(!base) return null;
    const estado = base.estado === 'pendiente_cuestionario' || base.estado === 'pendiente_submitir'
      ? base.estado : 'pendiente_fuente_financiera';
    return Object.assign({}, base, {
      estado,
      liquidationState:'pending_financial_source',
      paymentState:'pending_source_confirmation',
      paymentConfirmed:false,
      paymentSourceRef:null,
      paymentBatchId:null,
      paidAt:null,
      confirmedBy:null,
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
    if(state === 'conciliada_pendiente_pago') return ['Conciliada · pago pendiente de confirmar','a'];
    if(state === 'pendiente_fuente_financiera') return ['Pend. fuente financiera','a'];
    if(state === 'revision_financiera') return ['Revisión financiera','r'];
    return baseLabel ? baseLabel(state) : [state,'n'];
  };

  CX.data.visitContract = function(visit){
    const contract = baseVisitContract ? baseVisitContract(visit) : {id:visit && visit.id || null};
    const item = matchForVisit(visit);
    return Object.assign({}, contract, {
      liquidationState:item ? 'reconciled_source_safe' : 'pending_financial_source',
      paymentState:'pending_source_confirmation',
      paymentConfirmed:false,
      financialSourceStatus:item ? 'exact_reconciled_source_safe' : 'pending_or_review',
      financialSourceRecordId:item && item.sourceRecordId || null,
      financialReviewRequired:!item,
      sourceSafe:true
    });
  };

  if(basePorPais){
    CX.fin.porPais = function(data){
      const out = basePorPais(data);
      Object.keys(out || {}).forEach(country => {
        const exactCount = snapshot.liquidations.filter(item => item.country === country && item.periodKey === String((data.period() || {}).periodKey || '').replace(/^cinepolis-/,'')).length;
        out[country] = Object.assign({}, out[country], {
          financialSourceStatus:'canonical_source_safe',
          exactReconciledRecords:exactCount,
          paymentConfirmedRecords:0,
          reviewQueueCount:snapshot.reviewQueue.filter(item => String(item.key || '').includes(':')).length,
          sourceSafe:true
        });
      });
      return out;
    };
  }

  if(CX.dataSource){
    CX.dataSource.financialMode = 'canonical_source_safe';
    CX.dataSource.financialStatus = 'ready_with_review';
    CX.dataSource.financialSourceRef = snapshot.source && snapshot.source.financialWorkbookRef;
    CX.dataSource.financialUpdatedAt = snapshot.generatedAt;
    CX.dataSource.financialWarnings = [
      String((snapshot.summary && snapshot.summary.reviewLiquidationRows) || 0) + ' filas financieras permanecen en revisión de vínculo.',
      String((snapshot.summary && snapshot.summary.amountReviewRequired) || 0) + ' vínculos exactos permanecen en revisión de consistencia de montos.',
      'No hay pagos confirmados ni lotes importados.'
    ];
  }

  window.CX_TYA_FINANCIAL_CANONICAL_READY = true;
  window.CX_TYA_FINANCIAL_CANONICAL_CONTRACT = {
    snapshotId:snapshot.snapshotId,
    exactAcceptedLinks:snapshot.liquidations.length,
    canonicalAmountReady:snapshot.liquidations.filter(item=>item.reviewRequired!==true).length,
    reviewQueue:snapshot.reviewQueue.length,
    amountReviewQueue:(snapshot.amountReviewQueue || []).length,
    paymentEvidenceCandidates:(snapshot.paymentEvidenceCandidates || []).length,
    confirmedPayments:0,
    batches:0,
    sameTruthForFinanzasAndBeneficios:true,
    sourceSafe:true,
    imported:false,
    production:false
  };
})();
