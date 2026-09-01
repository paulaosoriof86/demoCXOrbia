/* CXOrbia TyA — canonical finance/liquidation read model v2 (DEV read-only).
   Ensures every realized visit appears in Liquidaciones, including submitted visits that the
   legacy literal switch omitted. Exact financial snapshots retain authority over amounts and
   confirmed payments. Operational rows without exact financial source remain review-required
   and can never enter a payment lot silently. */
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  const entry=window.CX_DEV_ENTRY_CANONICAL||{};
  const enabled=(entry.canonical===true&&entry.protectedRuntime===true)
    ||params.get('cxTyaPhaseA')==='1';
  if(!enabled||!CX.liq||!CX.data)return;
  const engine=window.CX_TYA_CUMULATIVE_READ_MODEL;
  const facets=v=>engine?.facets?engine.facets(v):(v?.canonicalFacets||{});
  const arr=v=>Array.isArray(v)?v:[];
  const str=v=>String(v==null?'':v).trim();
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const previousForProject=typeof CX.liq.forProject==='function'?CX.liq.forProject.bind(CX.liq):()=>[];
  const previousLabel=typeof CX.liq.label==='function'?CX.liq.label.bind(CX.liq):s=>[s,'n'];
  function visitKey(v){return str(v?.id||v?.visitId)||str(v?.hrRowId);}
  function liqKey(l){return str(l?.visitaId||l?.visitId)||str(l?.hrRowId);}
  function rootProjectId(project){
    return str(project?.parentProjectId||project?.rootProjectId||project?.program||entry.projectId||project?.id)||null;
  }
  function operationalState(f){
    if(f.paymentConfirmed)return 'pagada';
    if(f.liquidationConfirmed)return 'conciliada_pendiente_pago';
    if(f.submitted)return 'pendiente_fuente_financiera';
    if(f.questionnaire)return 'pendiente_submitir';
    if(f.realized)return 'pendiente_cuestionario';
    return null;
  }
  function derive(project,v){
    const f=facets(v),estado=operationalState(f);if(!estado)return null;
    const honorario=num(v.honorario),boleto=num(v.boleto),combo=num(v.comboAmt||v.combo),reembolso=boleto+combo,total=honorario+reembolso;
    const submittedAt=v.submittedAt||((v.submit===true||f.submitted)?v.cuestFecha:null)||null;
    const exact=typeof CX.data.financialMatchForVisit==='function'?CX.data.financialMatchForVisit(v):null;
    if(exact){
      const merged=Object.assign({},exact,{
        visitaId:v.id||v.visitId,visitId:v.id||v.visitId,hrRowId:v.hrRowId||exact.hrRowId||null,
        shopperId:v.shopperId||exact.shopperId||null,shopper:v.shopper||exact.shopper||null,shopperCode:v.shopperCode||exact.shopperCode||null,
        sucursal:v.sucursal||exact.sucursal||null,pais:v.pais||v.country||exact.pais||null,moneda:exact.moneda||v.currency||v.moneda||null,
        freal:v.realizada||exact.freal||'',cuest:v.cuestFecha||exact.cuest||'',submit:submittedAt||exact.submit||'',
        operationalVisitStage:f.paymentConfirmed?'pagada':f.liquidationConfirmed?'liquidada':f.submitted?'submitida':f.questionnaire?'cuestionario':f.realized?'realizada':'pendiente',
        canonicalFacets:Object.assign({},f),readModelVersion:'canonical-finance-v2'
      });
      return merged;
    }
    return {
      visitaId:v.id||v.visitId,visitId:v.id||v.visitId,hrRowId:v.hrRowId||null,projectId:project.id,rootProjectId:rootProjectId(project),periodKey:v.periodKey||project.periodKey||null,
      shopperId:v.shopperId||null,shopper:v.shopper||null,shopperCode:v.shopperCode||null,sucursal:v.sucursal||'Visita HR',pais:v.pais||v.country||null,moneda:v.currency||v.moneda||null,loteId:null,
      honorario,boleto,combo,reembolso,total,estado,operationalVisitStage:f.submitted?'submitida':f.questionnaire?'cuestionario':f.realized?'realizada':'pendiente',
      liquidationState:'pending_financial_source',paymentState:'pending_source_confirmation',paymentConfirmed:false,paymentSourceRef:null,
      freal:v.realizada||'',cuest:v.cuestFecha||'',submit:submittedAt||'',fechaEstimadaPago:'',pagada:false,pagadaPreview:false,
      financialSourceStatus:'pending_or_review',amountSource:'hr_operational_amount_pending_financial_reconciliation',reviewRequired:true,
      canonicalFacets:Object.assign({},f),readModelVersion:'canonical-finance-v2',sourceSafe:true,imported:false,production:false
    };
  }
  CX.liq.forProject=function(data){
    const project=data.period(),visits=arr(data.visitas?.()),legacy=arr(previousForProject(data));
    const existing=new Map();for(const l of legacy){const k=liqKey(l);if(k&&!existing.has(k))existing.set(k,l);}
    const result=[];
    for(const v of visits){const f=facets(v);if(!f.realized)continue;const k=visitKey(v),prior=existing.get(k),fresh=derive(project,v);if(!fresh)continue;
      if(prior&&prior.financialSourceStatus&&prior.financialSourceStatus!=='pending_or_review')result.push(Object.assign({},fresh,prior,{visitaId:v.id||v.visitId,visitId:v.id||v.visitId,hrRowId:v.hrRowId||prior.hrRowId||null,shopperId:v.shopperId||prior.shopperId||null,shopper:v.shopper||prior.shopper||null,canonicalFacets:Object.assign({},f),operationalVisitStage:f.submitted?'submitida':f.questionnaire?'cuestionario':'realizada',readModelVersion:'canonical-finance-v2'}));
      else result.push(fresh);
    }
    const unique=new Map();for(const l of result){const k=liqKey(l);if(k&&!unique.has(k))unique.set(k,l);}
    return [...unique.values()];
  };
  CX.liq.estadoFromVisita=function(v){return operationalState(facets(v));};
  CX.liq.label=function(state){
    if(state==='pendiente_fuente_financiera')return ['Pend. cruce financiero','a'];
    if(state==='conciliada_pendiente_pago')return ['Conciliada · pago pendiente','a'];
    if(state==='pagada')return ['Pagada confirmada','g'];
    return previousLabel(state);
  };
  const originalResumen=typeof CX.liq.resumen==='function'?CX.liq.resumen.bind(CX.liq):null;
  CX.liq.resumen=function(list){const base=originalResumen?originalResumen(list):{};base.pendiente_fuente_financiera=arr(list).filter(l=>l.estado==='pendiente_fuente_financiera').length;base.realizadas=arr(list).length;base.submitidas=arr(list).filter(l=>l.canonicalFacets?.submitted===true).length;return base;};
  window.CX_TYA_CANONICAL_FINANCE_READ_MODEL={
    ready:true,
    version:'canonical-finance-v2',
    activation:'canonical-runtime-contract',
    canonicalEntry:Boolean(entry.canonical),
    runtimeProjectId:entry.projectId||null,
    realizedVisitsIncluded:true,
    submittedVisitsNeverOmitted:true,
    exactFinancialSourceAuthority:true,
    paymentExecutionAllowed:false,
    providerWrites:0,
    production:false
  };
})();
