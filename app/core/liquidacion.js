/* ============================================================
   CXOrbia · Liquidación derivada de la visita (sync)
   El estado de la visita determina el estado de la liquidación,
   tanto en Beneficios (shopper) como en Liquidaciones (admin).
   Estados (alineados con un export histórico real de referencia):
     realizada            -> pendiente_cuestionario
     cuestionario realizado/completado -> pendiente_submitir
     submitida/validada   -> validada (lista para lote)
     en lote pagado       -> pagada
   Fecha estimada de pago = fecha submit + project.pago.diasPago
   ============================================================ */
window.CX = window.CX || {};

CX.liq = {
  /* mapa visita.estado -> estado de liquidación
     Bloque 3 (V103 — 20260711): 'liquidada' es un estado de FLUJO OPERATIVO local del
     prototipo (se fija cuando alguien pulsa "pagar lote" en la UI) — nunca un pago
     confirmado por una fuente real. Solo v.paymentSourceRef (campo que ÚNICAMENTE puede
     escribir un backend real, ningún flujo de este prototipo lo fabrica) habilita el
     estado final 'pagada'. Sin esa fuente, se expone 'pagada_preview': honesto, visible,
     nunca presentado como cruce financiero confirmado. */
  estadoFromVisita(v){
    switch(v.estado){
      case 'liquidada':     return v.paymentSourceRef ? 'pagada' : 'pagada_preview';
      case 'cuestionario':  return v.submit ? 'validada' : 'pendiente_submitir'; // enviado≠submitido
      case 'realizada':     return 'pendiente_cuestionario';
      default:              return null;            // aún no genera liquidación
    }
  },

  label(estado){
    return {
      pendiente_cuestionario:['Pend. cuestionario','a'],
      pendiente_submitir:    ['Pend. submitir','a'],
      validada:              ['Validada · lista para lote','b'],
      en_lote:               ['En lote','p'],
      pagada_preview:        ['Pagada (vista previa) · pendiente cruce real','a'],
      pagada:                ['Pagada (confirmado)','g'],
    }[estado] || [estado,'n'];
  },

  /* días de pago configurados en el proyecto (default 30) */
  diasPago(p){ return (p && p.pago && p.pago.diasPago) || 30; },

  addDays(iso, n){
    if(!iso) return '';
    const d=new Date(iso+'T12:00:00'); if(isNaN(d)) return '';
    d.setDate(d.getDate()+(+n||0));
    return d.toISOString().slice(0,10);
  },

  /* día de la semana de pago configurable por proyecto (5 = viernes por defecto) */
  diaPago(p){ const d=(p && p.pago && p.pago.diaSemana); return Number.isFinite(d) ? d : 5; },

  /* avanza una fecha al próximo día-de-semana indicado (incluye el mismo día) */
  snapToWeekday(iso, weekday){
    if(!iso) return '';
    const d=new Date(iso+'T12:00:00'); if(isNaN(d)) return '';
    const delta=((+weekday - d.getDay())+7)%7;
    d.setDate(d.getDate()+delta);
    return d.toISOString().slice(0,10);
  },

  /* fecha estimada de pago = submit + diasPago, ajustada al día de pago (viernes por defecto) */
  fechaEstimadaPago(p, baseISO){
    if(!baseISO) return '';
    return this.snapToWeekday(this.addDays(baseISO, this.diasPago(p)), this.diaPago(p));
  },

  /* construye el objeto liquidación derivado de una visita */
  fromVisita(p, v){
    const estado=this.estadoFromVisita(v);
    if(!estado) return null;
    const boleto=Number.isFinite(v.boleto)?v.boleto:0;
    const combo=Number.isFinite(v.comboAmt)?v.comboAmt:0;
    const reembolso=boleto+combo;
    const honorario=Number.isFinite(v.honorario)?v.honorario:null;
    const total=Number.isFinite(honorario)?honorario+reembolso:null;
    const baseISO = (v.submit&&v.cuestFecha) || v.cuestFecha || v.realizada || v.agendada || '';
    return {
      visitaId:v.id, visitId:v.visitId||v.id, hrRowId:v.hrRowId||null, projectId:p.id, periodId:v.periodId||p.id,
      shopperId:v.shopperId||null, shopper:v.shopper, shopperCode:v.shopperCode,
      sucursal:v.sucursal, pais:v.pais, moneda:v.currency, loteId:v.loteId||null,
      honorario, boleto, combo, reembolso, total,
      estado, freal:v.realizada||'', cuest:v.cuestFecha||'', submit:v.submit?(v.cuestFecha||''):'',
      fechaEstimadaPago: (estado==='pagada'||estado==='pagada_preview') ? (v.fechaPago||'') : this.fechaEstimadaPago(p, baseISO),
      pagada: estado==='pagada',
      pagadaPreview: estado==='pagada_preview',
      canonicalFacets:v.canonicalFacets||null,
      sourceRevision:v.sourceRevision||v.hrRevision||null,
      reviewRequired:v.reviewRequired===true,
      reviewReasons:Array.isArray(v.reviewReasons)?v.reviewReasons.slice():[],
      financialSourceStatus:v.financialSourceStatus||null,
      liquidationState:v.liquidationState||null,
      paymentState:v.paymentState||null,
      paymentConfirmed:v.paymentConfirmed===true,
      paymentSourceRef:v.paymentSourceRef||v.paymentRef||null,
      reimbursementSourceStatus:v.reimbursementSourceStatus||v.reimbursementStatus||null,
      reimbursementPartial:v.reimbursementPartial===true||v.reembolsoPartial===true||v.reimbursementSourceComplete===false,
    };
  },

  /* todas las liquidaciones del proyecto activo, derivadas de sus visitas */
  forProject(data){
    const p=data.period();
    return data.visitas().map(v=>this.fromVisita(p,v)).filter(Boolean);
  },

  /* resumen para KPIs de finanzas / beneficios */
  resumen(list){
    const r={pendiente_cuestionario:0,pendiente_submitir:0,validada:0,pagada:0,totalPorMoneda:{}};
    list.forEach(l=>{ r[l.estado]=(r[l.estado]||0)+1;
      if(Number.isFinite(l.total))r.totalPorMoneda[l.moneda]=(r.totalPorMoneda[l.moneda]||0)+l.total; });
    return r;
  },
};
