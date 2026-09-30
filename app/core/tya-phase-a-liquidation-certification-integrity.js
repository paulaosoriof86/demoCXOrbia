/* ============================================================
   CXOrbia · TyA Phase A · liquidation/payment + certification integrity
   ------------------------------------------------------------
   Source-safe runtime adapter loaded only by the TyA Phase A entry.

   It makes previously documented business rules operational without
   pretending that HR proves payment or certification:
   - HR drives execution/liquidation candidates.
   - A separate financial source must confirm paid items.
   - A separate certification source + human review must confirm carryover.
   - Existing UI modules keep the CX.liq interface, but no HR `liquidada`
     record is exposed as `pagada`.
   - Source-safe payment actions are blocked instead of writing local fake
     movements or dates.
   ============================================================ */
window.CX = window.CX || {};
(function(){
  const enabled=!!(window.CX_TYA_PHASE_A_PREVIEW && CX.data && CX.liq);
  if(!enabled) return;

  const hr=window.CX_TYA_HR_SOURCE_SAFE||{};
  const finance=window.CX_TYA_FINANCIAL_CONTROL_SOURCE_SAFE||{sourceStatus:'pending_financial_source',claims:{},payments:[],batches:[]};
  const certSource=window.CX_TYA_CERTIFICATION_CARRYOVER_SOURCE_SAFE||{sourceStatus:'pending_certification_source',certifications:[]};
  const tenantId=hr.tenantId||'tya';
  const baseProjectId=hr.projectId||'cinepolis';
  const cutPeriod=finance.cutPeriod||'2026-06';
  const rawById=new Map((hr.visits||[]).map(v=>[v.id,v]));
  const normalizedVisits=Array.isArray(CX.data._visitas)?CX.data._visitas:[];
  const paymentByVisit=new Map((finance.payments||[]).filter(p=>p&&p.visitId).map(p=>[p.visitId,p]));
  const certByShopper=new Map((certSource.certifications||[]).filter(c=>c&&c.shopperId).map(c=>[c.shopperId,c]));
  const old={
    fromVisita:CX.liq.fromVisita&&CX.liq.fromVisita.bind(CX.liq),
    forProject:CX.liq.forProject&&CX.liq.forProject.bind(CX.liq),
    resumen:CX.liq.resumen&&CX.liq.resumen.bind(CX.liq),
    label:CX.liq.label&&CX.liq.label.bind(CX.liq),
    payVisits:CX.data.payVisits&&CX.data.payVisits.bind(CX.data)
  };

  const nonEmpty=v=>v!==undefined&&v!==null&&v!=='';
  const asAmount=v=>nonEmpty(v)&&Number.isFinite(Number(v))?Number(v):null;
  const stable=id=>String(id||'').replace(/[^a-zA-Z0-9_-]+/g,'_');
  const periodBase=id=>String(id||'').replace(new RegExp('^'+baseProjectId+'-'),'');
  const isHistoricalCut=v=>String(v.periodKey||periodBase(v.projectId))<=cutPeriod;
  const qNorm=q=>{
    const t=String(q||'').trim().toUpperCase();
    if(/1|PRIMER/.test(t))return 'Q1';
    if(/2|SEGUND/.test(t))return 'Q2';
    return null;
  };
  const qCandidate=v=>{
    const iso=v.realizada||v.agendada||null;
    if(!iso||!/^\d{4}-\d{2}-\d{2}$/.test(iso))return null;
    return Number(iso.slice(8,10))<=15?'Q1':'Q2';
  };
  const paymentState=(v,q,payment)=>{
    if(payment){
      if(payment.paymentState==='paid'){
        const ok=nonEmpty(payment.paidAt)&&nonEmpty(payment.paymentBatchId)&&nonEmpty(payment.paymentSource)&&nonEmpty(payment.confirmedBy)&&nonEmpty(payment.auditRef)&&payment.paidAt!==v.realizada;
        return ok?'paid':'conflict';
      }
      return payment.paymentState||'pending_financial_source';
    }
    if(String(v.periodKey)<='2026-05') return 'pending_historical_payment_match';
    if(v.periodKey==='2026-06'&&q==='Q2') return 'pending_financial_source';
    if(v.periodKey==='2026-06'&&q==='Q1') return 'pending_financial_source';
    if(v.periodKey==='2026-06'&&!q) return 'conflict';
    return 'not_scheduled';
  };
  const liquidationState=v=>{
    if(v.estado==='liquidada')return 'liquidated';
    if(v.estado==='cuestionario')return 'ready_for_review';
    if(v.estado==='realizada')return 'not_ready';
    return 'not_ready';
  };
  const uiState=r=>{
    if(r.paymentState==='paid')return 'pagada';
    if(r.liquidationState==='liquidated'&&r.amountStatus==='complete'&&r.paymentState==='pending_financial_source')return 'validada';
    if(r.liquidationState==='ready_for_review'||r.liquidationState==='liquidated')return 'pendiente_submitir';
    return 'pendiente_cuestionario';
  };

  const ledger=normalizedVisits.filter(v=>isHistoricalCut(v)&&v.shopperId).map(v=>{
    const raw=rawById.get(v.id)||{};
    const honorario=asAmount(raw.honorario);
    const boleto=asAmount(raw.boleto);
    const combo=asAmount(raw.comboAmt);
    const known=[honorario,boleto,combo].filter(x=>x!==null).reduce((a,b)=>a+b,0);
    const missing=[];
    if(honorario===null)missing.push('honorario');
    if(boleto===null)missing.push('boleto');
    if(combo===null)missing.push('combo');
    const q=qNorm(v.quincena);
    const pay=paymentByVisit.get(v.id)||null;
    const pState=paymentState(v,q,pay);
    const lState=liquidationState(v);
    const record={
      liquidationId:`liq_${stable(tenantId)}_${stable(baseProjectId)}_${stable(v.id)}`,
      paymentItemId:`payitem_${stable(tenantId)}_${stable(baseProjectId)}_${stable(v.id)}`,
      tenantId,
      projectId:v.projectId,
      externalProjectId:baseProjectId,
      periodKey:v.periodKey,
      visitaId:v.id,
      visitId:v.id,
      hrRowId:v.hrRowId||raw.hrRowId||null,
      sourceTab:v.sourceTab||raw.sourceTab||null,
      shopperId:v.shopperId,
      shopper:v.shopper,
      shopperCode:v.shopperCode,
      sucursal:v.sucursal,
      pais:v.pais,
      moneda:v.currency,
      quincena:q,
      quincenaCandidate:q?null:qCandidate(v),
      visitState:v.estado,
      realizedAt:v.realizada,
      questionnaireAt:v.cuestFecha||null,
      submittedAt:v.submittedAt||null,
      liquidationState:lState,
      paymentState:pState,
      paid:pState==='paid',
      pagada:pState==='paid',
      paidAt:pState==='paid'?pay.paidAt:null,
      paymentBatchId:pState==='paid'?pay.paymentBatchId:null,
      paymentSource:pState==='paid'?pay.paymentSource:null,
      confirmedBy:pState==='paid'?pay.confirmedBy:null,
      auditRef:pState==='paid'?pay.auditRef:null,
      honorario:honorario===null?0:honorario,
      boleto:boleto===null?0:boleto,
      combo:combo===null?0:combo,
      comboAmt:combo===null?0:combo,
      reembolso:(boleto||0)+(combo||0),
      knownTotal:known,
      total:known,
      amountStatus:missing.length?'partial_pending_source':'complete',
      missingAmountFields:missing,
      paymentClaim:String(v.periodKey)<='2026-05'?(finance.claims&&finance.claims.paidThroughState)||'documented_claim_pending_source_match':(v.periodKey==='2026-06'?(q==='Q2'?'all_pending_requires_item_match':q==='Q1'?'partially_pending_requires_item_match':'review_required'):null),
      loteEligible:false,
      executionState:'executed_documented',
      executionDateStatus:v.realizada?'source_present':'pending_source',
      reviewRequired:missing.length>0||!q||!v.realizada||pState==='conflict'||pState==='pending_historical_payment_match',
      reviewReasons:[
        ...(missing.length?['amount_fields_missing:'+missing.join(',')]:[]),
        ...(!q?['quincena_missing']:[]),
        ...(!v.realizada?['realized_at_missing_but_execution_documented']:[]),
        ...(pState==='conflict'?['payment_conflict']:[]),
        ...(pState==='pending_historical_payment_match'?['historical_payment_source_match_required']:[])
      ],
      sourceRefs:{hr:'tya:hr-live-multitab:source-safe:not-imported',financial:finance.sourceStatus||'pending_financial_source'},
      sourceSafe:true,
      imported:false,
      production:false
    };
    record.estado=uiState(record);
    record.fechaEstimadaPago=null;
    record.freal=record.realizedAt||'';
    record.cuest=record.questionnaireAt||'';
    record.submit=record.submittedAt||'';
    return Object.freeze(record);
  });

  const ledgerByVisit=new Map(ledger.map(r=>[r.visitId,r]));
  const byPeriod=ledger.reduce((acc,r)=>{(acc[r.periodKey]||(acc[r.periodKey]=[])).push(r);return acc;},{});
  const financeSummary={
    records:ledger.length,
    paidConfirmed:ledger.filter(r=>r.paymentState==='paid').length,
    historicalPaymentMatchPending:ledger.filter(r=>r.paymentState==='pending_historical_payment_match').length,
    junePendingFinancialSource:ledger.filter(r=>r.periodKey==='2026-06'&&r.paymentState==='pending_financial_source').length,
    conflicts:ledger.filter(r=>r.paymentState==='conflict').length,
    amountComplete:ledger.filter(r=>r.amountStatus==='complete').length,
    amountPartial:ledger.filter(r=>r.amountStatus!=='complete').length,
    loteEligible:ledger.filter(r=>r.loteEligible).length,
    byPeriod:Object.fromEntries(Object.entries(byPeriod).map(([k,rows])=>[k,{records:rows.length,paid:rows.filter(r=>r.paid).length,pending:rows.filter(r=>!r.paid).length,review:rows.filter(r=>r.reviewRequired).length,GT:rows.filter(r=>r.pais==='GT').length,HN:rows.filter(r=>r.pais==='HN').length}]))
  };

  const certCandidates=(CX.data.shoppers||[]).map(s=>{
    const src=certByShopper.get(s.id)||null;
    const carried=!!(src&&src.state==='carried_over'&&src.presentedAt&&src.reviewedBy&&src.reviewedAt&&src.auditRef&&src.sourceRef);
    return Object.freeze({
      tenantId,
      projectId:baseProjectId,
      shopperId:s.id,
      shopperCode:s.code,
      certificationId:(src&&src.certificationId)||certSource.certificationId||'cinepolis-main',
      state:carried?'carried_over':src&&src.state?src.state:'pending_source',
      eligible:carried,
      presentedAt:carried?src.presentedAt:null,
      reviewedBy:carried?src.reviewedBy:null,
      reviewedAt:carried?src.reviewedAt:null,
      auditRef:carried?src.auditRef:null,
      sourceRef:carried?src.sourceRef:null,
      reviewRequired:!carried,
      reviewReason:carried?null:(src?'carryover_fields_or_state_incomplete':'certification_source_missing'),
      sourceSafe:true,
      imported:false,
      production:false
    });
  });
  const certSummary={
    shoppers:certCandidates.length,
    sourceRecords:(certSource.certifications||[]).length,
    eligible:certCandidates.filter(c=>c.eligible).length,
    pendingSource:certCandidates.filter(c=>c.state==='pending_source').length,
    pendingReview:certCandidates.filter(c=>c.reviewRequired&&c.state!=='pending_source').length,
    sourceStatus:certSource.sourceStatus||'pending_certification_source'
  };

  CX.liq.fromVisita=function(p,v){ return ledgerByVisit.get(v&&v.id)||null; };
  CX.liq.forProject=function(data){
    const pid=data&&data.currentProjectId;
    const rows=pid?ledger.filter(r=>r.projectId===pid):ledger;
    const scoped=data&&typeof data.scopePaises==='function'?data.scopePaises():null;
    return scoped?rows.filter(r=>scoped.includes(r.pais)):rows;
  };
  CX.liq.resumen=function(list){
    const r={pendiente_cuestionario:0,pendiente_submitir:0,validada:0,pagada:0,totalPorMoneda:{},pending_financial_source:0,pending_historical_payment_match:0,conflict:0};
    (list||[]).forEach(l=>{
      r[l.estado]=(r[l.estado]||0)+1;
      r[l.paymentState]=(r[l.paymentState]||0)+1;
      r.totalPorMoneda[l.moneda]=(r.totalPorMoneda[l.moneda]||0)+(l.knownTotal||0);
    });
    return r;
  };
  CX.liq.label=function(estado){
    return {
      pendiente_cuestionario:['Pend. cuestionario','a'],
      pendiente_submitir:['Pend. cruce / revisión','a'],
      validada:['Candidata · fuente financiera pendiente','b'],
      en_lote:['En lote preview','p'],
      pagada:['Pagada confirmada','g']
    }[estado]||(old.label?old.label(estado):[estado,'n']);
  };
  CX.liq.paymentLabel=function(state){
    return {
      paid:['Pagado confirmado','g'],
      pending_financial_source:['Fuente financiera pendiente','a'],
      pending_historical_payment_match:['Histórico pagado · cruce pendiente','a'],
      conflict:['Revisión obligatoria','r'],
      not_scheduled:['No programado','n']
    }[state]||[state,'n'];
  };

  CX.data.phaseALiquidationLedger=Object.freeze(ledger);
  CX.data.phaseACertificationCarryover=Object.freeze(certCandidates);
  CX.data.liquidationsForPeriod=periodKey=>Object.freeze([...(byPeriod[periodKey]||[])]);
  CX.data.paymentControlForPeriod=periodKey=>Object.freeze(financeSummary.byPeriod[periodKey]||{records:0,paid:0,pending:0,review:0,GT:0,HN:0});
  CX.data.certificationCarryoverForShopper=shopperId=>certCandidates.find(c=>c.shopperId===shopperId)||null;
  CX.data.payVisits=function(ids,fechaPago){
    const blocked={pagadas:0,fechaPago:null,porPais:{},detalle:[],blocked:true,reason:'source_safe_payment_gate_off',requestedIds:[...(ids||[])]};
    CX.bus&&CX.bus.emit('payment-gate',blocked);
    return blocked;
  };

  const reviewQueue={
    liquidation:ledger.map(r=>({key:`liquidation:${r.tenantId}:${r.externalProjectId}:${r.periodKey}:${r.visitId}`,type:'liquidation',entityId:r.liquidationId,visitId:r.visitId,periodKey:r.periodKey,state:r.liquidationState,amountStatus:r.amountStatus,reviewRequired:r.reviewRequired,sourceRef:r.sourceRefs.hr,auditRef:null})),
    payment:ledger.map(r=>({key:`payment:${r.tenantId}:${r.externalProjectId}:${r.periodKey}:${r.visitId}`,type:'payment',entityId:r.paymentItemId,visitId:r.visitId,periodKey:r.periodKey,state:r.paymentState,reviewRequired:true,sourceRef:r.sourceRefs.financial,auditRef:r.auditRef})),
    certification:certCandidates.map(r=>({key:`certification:${r.tenantId}:${r.projectId}:${r.shopperId}:${r.certificationId}`,type:'certification_carryover',entityId:r.shopperId,state:r.state,reviewRequired:r.reviewRequired,sourceRef:r.sourceRef||certSummary.sourceStatus,auditRef:r.auditRef}))
  };

  const report={
    ready:true,
    generatedAt:new Date().toISOString(),
    tenantId,
    projectId:baseProjectId,
    cutPeriod,
    financeSourceStatus:finance.sourceStatus||'pending_financial_source',
    certificationSourceStatus:certSummary.sourceStatus,
    liquidation:financeSummary,
    certification:certSummary,
    reviewQueueCounts:{liquidation:reviewQueue.liquidation.length,payment:reviewQueue.payment.length,certification:reviewQueue.certification.length,total:reviewQueue.liquidation.length+reviewQueue.payment.length+reviewQueue.certification.length},
    hardRules:{
      hrLiquidatedIsPaid:false,
      realizedAtIsPaidAt:false,
      paymentRequiresSeparateSource:true,
      previewCertificationEligible:false,
      carryoverRequiresReviewedSource:true,
      payActionBlockedInSourceSafe:true
    },
    sourceSafe:true,
    imported:false,
    production:false,
    writes:false,
    providers:false
  };
  CX.phaseAFinanceCertification=Object.freeze(report);
  CX.phaseAReviewQueue=Object.freeze(reviewQueue);
  if(CX.data.previewMeta){
    CX.data.previewMeta=Object.assign({},CX.data.previewMeta,{
      financeControlReady:true,
      financeSourceStatus:report.financeSourceStatus,
      certificationCarryoverControlReady:true,
      certificationSourceStatus:report.certificationSourceStatus,
      paidConfirmed:financeSummary.paidConfirmed,
      paymentGate:'off',
      certificationEligibleConfirmed:certSummary.eligible
    });
  }
  if(CX.dataSource){
    CX.dataSource.warnings=[...(CX.dataSource.warnings||[]),
      `Liquidaciones source-safe: ${financeSummary.records}; pagos confirmados: ${financeSummary.paidConfirmed}; fuente financiera: ${report.financeSourceStatus}.`,
      `Carryover certificaciones: ${certSummary.eligible} confirmado(s); fuente: ${certSummary.sourceStatus}.`
    ];
  }
  CX.bus&&CX.bus.emit('phase-a-finance-certification',report);
  CX.bus&&CX.bus.emit('datasource',CX.dataSource);
})();
