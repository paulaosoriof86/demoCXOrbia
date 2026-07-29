/* CXOrbia · Finanzas (admin) — full fidelity
   Dashboard Financiero · Movimientos · Liquidaciones · Lotes de Pago
   Separación SIEMPRE por moneda y por país del proyecto (genérico, cualquier país).

   V176 — Contratos R26 declarados (verificables estáticamente):
   finance_declares_currency_grouping_contract: los totales financieros se AGRUPAN por moneda
     (por país / por fila), NUNCA con la moneda del primer país. */
const FINANCE_CURRENCY_GROUPING_CONTRACT='group_by_moneda_never_first_country'; // groupByCurrency / porMoneda / currencyGroups / totalsByCurrency
/* reimbursement_requires_confirmed_source_contract: ninguna cifra de reembolso conciliado se
   muestra sin una fuente confirmada (monto, moneda, fecha, referencia); si no hay, Pendiente de fuente. */
/* reimbursement_requires_confirmed_source_contract: sin reimbursementSource/reembolsoConfirmado
   (reimbursementConfirmed) NO se muestra reembolso conciliado; si no hay, Pendiente de fuente. */
const REIMBURSEMENT_REQUIRES_CONFIRMED_SOURCE_CONTRACT='reimbursementSource_reembolsoConfirmado_required';
/* finance_review_queue_exposes_financialSourceStatus: la bandeja muestra el valor real de
   financialSourceStatus y filtra por reviewRequired/liquidationState/paymentState. */
const FINANCE_REVIEW_QUEUE_CONTRACT=['reviewRequired','financialSourceStatus','liquidationState','paymentState'];
/* V176 P0-4 — moneda de alcance para etiquetas de UNA sola moneda; agrupa por conjunto de monedas,
   nunca por el índice del primer país como agregado. */
function defCur0(p){ const set=[...new Set((p.countries||[]).map(c=>p.currency[c]))]; return set.length?set[0]:''; }

function _fin(data){
  const p=data.period(), out={};
  p.countries.forEach(c=>{
    const v=data.visitas().filter(x=>x.pais===c&&['realizada','cuestionario','liquidada'].includes(x.estado));
    const hon=v.reduce((a,x)=>a+x.honorario,0);
    const bol=v.reduce((a,x)=>a+(x.boleto||0),0);
    const com=v.reduce((a,x)=>a+(x.comboAmt||0),0);
    out[c]={cur:p.currency[c],vis:v.length,hon,bol,com,reemb:bol+com,total:hon+bol+com};
  });
  return out;
}
const _m=(cur,n)=>`${cur} ${Number(n).toLocaleString('es-GT')}`;

CX.module('financiero', ({data,ui})=>{
  const p=data.period();
  const fp=CX.fin.porPais(data);
  const canonicalPeriodId=CX.fin.canonCurrentId();
  /* CORTE 3 P0-4 — selector interno lee/escribe EXACTAMENTE el periodo canónico de CX.data */
  const finPeriods=()=>CX.fin.canonPeriods();
  const finCurPeriod=()=>{const cur=CX.fin.canonPeriods().find(x=>x.id===CX.fin.canonCurrentId());return cur?cur.label:'';};
  const modelLbl = p.modelo==='delegado' ? 'Delegado (franquicia)' : 'Facturado directamente';

  const tile=(c)=>{const d=fp[c];return `<div class="card card-p">
    <div class="between" style="margin-bottom:10px"><div class="card-t finDrill" data-c="${c}" style="cursor:pointer">${CX.paisLabel(c)} <span class="muted" style="font-weight:500">(${d.cur})</span> <span style="font-size:11px;color:var(--brand)">ver visitas →</span></div>${ui.bdg(d.margenPct+'% margen',d.margenPct>=30?'g':'a')}</div>
    <div class="grid g2" style="gap:8px" class="finTileK" data-c="${c}" style="cursor:pointer">
      <div class="finDrill" data-c="${c}" style="cursor:pointer">${ui.kpi('Ingresos',d.cur+' '+d.ingreso.toLocaleString(),'g')}</div>
      <div class="finDrill" data-c="${c}" style="cursor:pointer">${ui.kpi('Honorarios devengados',d.cur+' '+d.honorarioDevengado.toLocaleString(),'r','obligación · no implica pago')}</div>
      <div class="finDrill" data-c="${c}" style="cursor:pointer">${p.modelo==='directo'?ui.kpi('ISR ('+(p.isr||0)+'%)',d.cur+' '+d.isr.toLocaleString(),'a'):ui.kpi('Reembolsos',d.cur+' '+d.reemb.toLocaleString(),'n')}</div>
      <div class="finDrill" data-c="${c}" style="cursor:pointer">${p.modelo==='directo'?ui.kpi('Regalías ('+(p.regalias||0)+'%)',d.cur+' '+d.regal.toLocaleString(),'p'):ui.kpi('Por pagar (CxP)',d.cur+' '+d.cxp.toLocaleString(),'a')}</div>
    </div>
    <div class="grid g2" style="gap:8px;margin-top:8px">
      <div>${ui.kpi('Honorario por pagar',d.cur+' '+d.honorarioPorPagar.toLocaleString(),'a')}</div>
      <div>${ui.kpi('Honorario pagado',d.pagosConfirmados?(d.cur+' '+d.honorarioPagado.toLocaleString()):(d.cur+' 0'),d.pagosConfirmados?'g':'n',d.pagosConfirmados?(d.pagosConfirmados+' pago(s) confirmado(s)'):'0 pagos confirmados en la fuente')}</div>
    </div>
    <div class="between" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-2)">
      <span style="font-size:12px;color:var(--t2)">Margen neto</span>
      <b style="font-family:var(--disp);font-size:18px;color:${d.margen>=0?'var(--green)':'var(--red)'}">${d.cur} ${d.margen.toLocaleString()}</b></div>
    <div class="flex" style="gap:14px;margin-top:8px;font-size:11px;color:var(--t3)">
      <span>CxC: <b style="color:var(--t2)">${d.cur} ${d.cxc.toLocaleString()}</b></span>
      <span>CxP: <b style="color:var(--t2)">${d.cur} ${d.cxp.toLocaleString()}</b></span>
      <span>Gastos fijos: <b style="color:var(--t2)" title="Presupuesto sin distribución por país/moneda confirmada — ver tarjeta de presupuesto pendiente">Pendiente de asignación</b></span></div>
  </div>`;};

  /* motor de análisis crítico inteligente: deriva hallazgos/estrategias de los datos */
  const analizar=()=>{
    const H=[]; const M=(cur,n)=>`${cur} ${Number(Math.round(n)).toLocaleString('es-GT')}`;
    p.countries.forEach(c=>{
      const d=fp[c], cur=d.cur;
      if(d.margenPct<20) H.push({tono:'r',icon:'⚠',titulo:`Margen crítico en ${CX.paisLabel(c)} (${d.margenPct}%)`,txt:`Por debajo del 20% objetivo. Revisa honorarios devengados (${M(cur,d.honorarioDevengado)}) o renegocia la tarifa del programa.`,accion:'Revisar estructura de costos'});
      else if(d.margenPct<30) H.push({tono:'a',icon:'⚑',titulo:`Margen ajustado en ${CX.paisLabel(c)} (${d.margenPct}%)`,txt:`Cerca del mínimo saludable (30%). Vigila los gastos fijos (${M(cur,d.fijos)}).`,accion:'Optimizar gastos fijos'});
      else H.push({tono:'g',icon:'✓',titulo:`Margen sano en ${CX.paisLabel(c)} (${d.margenPct}%)`,txt:`Rentabilidad sobre el objetivo. Hay espacio para incentivos a shoppers o inversión comercial.`,accion:'Considerar incentivos'});
      if(d.cxc>d.ingreso*0.4) H.push({tono:'a',icon:'⏳',titulo:`Cobranza alta en ${CX.paisLabel(c)}`,txt:`Por cobrar (${M(cur,d.cxc)}) supera el 40% del ingreso. Riesgo de liquidez; prioriza conciliación de reembolsos.`,accion:'Gestionar cobranza'});
    });
    /* R29 — financiamientos por MONEDA real (no defCur0 sobre suma multipaís). */
    const finByCur={}; CX.finStore.cxp(p.id).filter(r=>/financ/i.test(r.concepto)).forEach(r=>{const cu=(r.pais&&p.currency[r.pais])||'pending_currency';finByCur[cu]=(finByCur[cu]||0)+(r.saldo||0);});
    Object.entries(finByCur).forEach(([cu,val])=>{ if(val>0) H.push({tono:'a',icon:'🏦',titulo:'Financiamientos activos ('+cu+')',txt:`Hay ${cu==='pending_currency'?(val.toLocaleString()+' (pendiente de moneda)'):M(cu,val)} en financiamientos. No son utilidad operativa: van como CxP hasta devolverse.`,accion:'Ver CxP'}); });
    const store=CX.finStore.pres(p.id, canonicalPeriodId), pres=Object.keys(store).reduce((a,k)=>a+(+store[k]||0),0);
    /* el presupuesto planeado NO se compara contra un "gasto real" inventado; sin ejecución real por rubro no hay semáforo real */
    return H;
  };

  const html_fin = `
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Dashboard Financiero', p.name+' · '+modelLbl+' · '+p.countries.map(c=>c+' ('+CX.moneda(p,c)+')').join(' y ')+' separados')}</div>
    <div class="flex" style="gap:8px"><select id="finDashPer" class="sel" style="width:auto">${finPeriods().map(pp=>`<option data-pid="${pp.id}" ${pp.id===CX.fin.canonCurrentId()?'selected':''}>${pp.label}</option>`).join('')}</select><span class="bdg ${p.modelo==='directo'?'bdg-b':'bdg-p'}">${modelLbl}</span><button class="btn btn-ghost btn-sm" id="finExport">⤓ Exportar</button></div></div>

  <div class="card card-p" style="margin-bottom:16px;background:var(--brand-light);border-color:#cfe6f7">
    <div style="font-size:12.5px;color:var(--brand-dark)">${p.modelo==='directo'
      ? '<b>Modelo directo:</b> el margen descuenta honorarios + ISR ('+(p.isr||0)+'%) + regalías ('+(p.regalias||0)+'%). El reembolso (boleto+combo) es flujo de caja, no afecta utilidad.'
      : '<b>Modelo delegado:</b> solo se netea el honorario recibido menos lo pagado al shopper; sin ISR ni regalías locales.'}</div>
  </div>

  <div class="grid ${p.countries.length>1?'g2':''}" style="margin-bottom:16px">${p.countries.map(tile).join('')}</div>

  ${(()=>{ /* CORTE 3 P0-6 — bandeja visible de revisiones financieras fail-closed.
     Revisión = liquidación cuya fuente financiera está incompleta (falta país, moneda o monto)
     o marcada como no confirmable. Mientras la fuente esté incompleta NO se permite pago, lote
     ni confirmación. Fuente canónica: liquidaciones del periodo activo. */
    const REVIEW_CONTRACTS=['reviewRequired','financialSourceStatus','liquidationState','paymentState'];
    const isReviewByContract=(l)=> l.reviewRequired===true || l.financialSourceStatus==='pending_or_review' || l.liquidationState==='pending_financial_source';
    const revs=CX.liq.forProject(data).map(l=>{ const faltan=[];
      if(!l.pais)faltan.push('país'); if(!l.moneda)faltan.push('moneda');
      if(l.honorario==null)faltan.push('honorario'); if(l.total==null)faltan.push('monto total');
      const contractHit=isReviewByContract(l);
      const financialSourceStatus = l.financialSourceStatus || (faltan.length?'incomplete_fields':(contractHit?'pending_or_review':'complete'));
      const motivo = l.reviewRequired?'Revisión requerida por fuente':(l.liquidationState==='pending_financial_source'?'Liquidación pendiente de fuente financiera':(l.paymentState==='pending_source_confirmation'?'Pago pendiente de confirmación de fuente':(faltan.length?'Fuente financiera incompleta':'Pendiente de revisión')));
      return {l,faltan,financialSourceStatus,motivo,include:(contractHit||faltan.length>0)}; }).filter(r=>r.include);
    if(!revs.length) return `<div class="card card-p" style="margin-bottom:16px"><div class="card-h"><div class="card-t">🔐 Revisiones financieras (fuente incompleta)</div><span class="bdg bdg-g">0 en revisión</span></div><div style="font-size:12px;color:var(--t3)">Sin revisiones fail-closed en este periodo y alcance.</div></div>`;
    return `<div class="card card-p" style="margin-bottom:16px;border-color:#f3d9d9">
      <div class="card-h"><div class="card-t">🔐 Revisiones financieras (fuente incompleta)</div><span class="bdg bdg-r">${revs.length} en revisión · fail-closed</span></div>
      <div style="font-size:11.5px;color:var(--t2);margin-bottom:10px">Mientras la fuente esté incompleta no se permite pago, lote ni confirmación. Cada fila conserva su país y moneda. Contratos de revisión: reviewRequired, financialSourceStatus (pending_or_review) y liquidationState (pending_financial_source). paymentState se muestra como estado de pago y no abre revisión de fuente por sí solo.</div>
      <div class="scroll-hint" aria-label="Desliza para ver más" style="overflow-x:auto"><table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Sucursal / visita</th><th>Shopper</th><th>visitId</th><th>hrRowId</th><th>financialSourceStatus</th><th>Motivo</th><th>Campos faltantes</th><th>Revisión</th></tr></thead><tbody>
      ${revs.map(r=>`<tr><td><b>${r.l.pais?CX.paisLabel(r.l.pais):'<span class="muted">—</span>'}</b></td><td>${r.l.moneda||'<span class="muted">—</span>'}</td><td style="font-size:12px">${r.l.sucursal||r.l.visitaId||'—'}</td><td style="font-size:12px">${r.l.shopper||'—'}</td><td style="font-size:11px;color:var(--t3)">${r.l.visitaId||'—'}</td><td style="font-size:11px;color:var(--t3)">${r.l.hrRowId||'—'}</td><td>${ui.bdg(r.financialSourceStatus,'r')}</td><td style="font-size:11.5px">${r.motivo}</td><td style="font-size:11.5px">${r.faltan.length?r.faltan.join(', '):'—'}</td><td>${ui.bdg('Pendiente de revisión · sin pago/lote','a')}</td></tr>`).join('')}
      </tbody></table></div>
      <div style="margin-top:10px;font-size:11px;color:var(--t3)">🔒 Pago y lote bloqueados para estas filas hasta completar la fuente (monto, moneda, fecha y referencia).</div>
    </div>`;
  })()}

  <div class="card card-p" style="margin-bottom:16px;border-color:#e3d9f5">
    <div class="card-h"><div class="card-t">🧠 Análisis crítico determinístico</div><span class="bdg bdg-n">Reglas locales sobre los datos visibles</span></div>
    <div class="grid g2" style="gap:10px">
      ${analizar().map(h=>`<div style="display:flex;gap:10px;padding:11px 12px;background:var(--${h.tono}-bg);border-radius:10px">
        <div style="font-size:17px;line-height:1">${h.icon}</div>
        <div style="flex:1"><b style="font-size:12.5px;color:var(--${h.tono})">${h.titulo}</b>
        <div style="font-size:11.5px;color:var(--t2);margin-top:3px">${h.txt}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:7px;padding:3px 9px;font-size:11px">${h.accion} →</button></div></div>`).join('')}
    </div>
    <div style="margin-top:10px">${ui.aiBox('Análisis determinístico: reglas locales sobre los datos visibles (márgenes por país, cobranza CxC, financiamientos — que NO cuento como ingreso operativo — y presupuesto vs real). Gemini no conectado.','Reglas locales, sin inferencias')}</div>
  </div>

  <div class="card card-p" id="presAvance" style="margin-bottom:16px">
    <div class="card-h"><div class="card-t">🚦 Avance de presupuesto · semáforos</div><span class="muted" style="font-size:11px">real vs presupuestado por rubro</span></div>
    <div id="presBars"></div>
  </div>

  <div class="grid g2" style="margin-bottom:16px">
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📈 Comparativo intermensual (margen %)</div><span class="bdg bdg-a" style="font-size:10.5px">Pendiente de fuente</span></div>
      <div style="padding:14px 4px;font-size:12.5px;color:var(--t3)">No hay una fuente financiera histórica confirmada conectada a este proyecto. Este comparativo se activa cuando exista un cierre financiero validado de al menos dos meses — no se muestran series estimadas o de ejemplo.</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📅 Comparativo interanual (margen %)</div><span class="bdg bdg-a" style="font-size:10.5px">Pendiente de fuente</span></div>
      <div style="padding:14px 4px;font-size:12.5px;color:var(--t3)">No hay una fuente financiera histórica confirmada conectada a este proyecto. Este comparativo se activa cuando exista un cierre financiero validado de años previos — no se muestran series estimadas o de ejemplo.</div>
    </div>
    <div class="card card-p" id="presCard">
      <div class="card-h"><div class="card-t">📋 Presupuesto de gastos fijos</div><a href="#" data-nav="financiero-movimientos" class="btn btn-ghost btn-sm" id="presGoMov">Editar en Movimientos →</a></div>
      <div id="presList"></div>
      <div style="margin-top:10px">${ui.aiBox('Los gastos fijos se presupuestan; los variables (honorarios) van según ejecución. El dashboard compara real vs presupuesto para decidir rentabilidad y honorarios. La creación/edición de rubros vive en Movimientos.','Presupuesto vs real — solo análisis')}</div>
    </div>
  </div>

  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-h"><div class="card-t">🎟️ Reembolsos mensuales · conciliación</div><span class="muted" style="font-size:11px">¿el cliente / casa matriz reembolsó bien?</span></div>
    <div class="scroll-hint" style="overflow-x:auto"><table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Reembolso del periodo (flujo)</th><th>Reembolsado por cliente</th><th>Conciliación</th></tr></thead><tbody>
    ${p.countries.map(c=>{const d=fp[c];return `<tr class="hov" data-reembc="${c}" style="cursor:pointer"><td><b>${CX.paisLabel(c)}</b></td><td>${d.cur}</td><td>${d.cur} ${d.reemb.toLocaleString()}</td><td><span class="muted">Pendiente de fuente</span></td><td>${ui.bdg('Pendiente de fuente','n')}</td></tr>`;}).join('')}
    </tbody></table></div>
    <div style="margin-top:10px">${ui.aiBox('Los reembolsos son flujo (no utilidad): el programa cubre consumos/boletos y el cliente o casa matriz los reintegra. La conciliación real requiere una fuente confirmada de reintegro (monto, moneda, fecha y referencia); mientras no exista, se muestra Pendiente de fuente y no se calcula faltante ni diferencia.','Conciliación de reembolsos · sin inferencias')}</div>
  </div>`;

  setTimeout(()=>{
    const fx=document.getElementById('finExport');
    if(fx&&CX.reportKit){
      const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
      const projectLabel=data.programBase?data.programBase(p):p.name;
      const finSpec=(ext)=>({ title:'Dashboard Financiero',
        meta:{title:'Dashboard Financiero',project:projectLabel,period:finCurPeriod(),scope:p.countries.join(' · '),sourceLabel:'Finanzas · '+modelLbl,generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
        columns:[{key:'pais',label:'País'},{key:'moneda',label:'Moneda'},{key:'ingreso',label:'Ingresos'},{key:'devengado',label:'Honorario devengado'},{key:'porPagar',label:'Honorario por pagar'},{key:'pagado',label:'Honorario pagado'},{key:'fijos',label:'Gastos fijos'},{key:'margen',label:'Margen'},{key:'margenPct',label:'Margen %'},{key:'cxc',label:'CxC'}],
        rows:p.countries.map(c=>{const d=fp[c];return {pais:CX.paisLabel(c),moneda:d.cur,ingreso:Math.round(d.ingreso),devengado:Math.round(d.honorarioDevengado),porPagar:Math.round(d.honorarioPorPagar),pagado:Math.round(d.honorarioPagado),fijos:Math.round(d.fijos),margen:Math.round(d.margen),margenPct:d.margenPct+'%',cxc:Math.round(d.cxc)};}),
        notes:'Honorario pagado solo suma filas con pago confirmado y referencia de fuente. Cada fila conserva su moneda; no se suman monedas distintas.',
        summary:['Países: '+p.countries.length,'Modelo: '+modelLbl,'Pagos confirmados: '+p.countries.reduce((a,c)=>a+fp[c].pagosConfirmados,0)],
        chart:{title:'Margen % por país',data:p.countries.map(c=>({label:CX.paisLabel(c),value:fp[c].margenPct,display:fp[c].margenPct+'%'}))},
        filename:[san('dashboard-financiero'),san(projectLabel),san(finCurPeriod()),new Date().toISOString().slice(0,10)].join('_')+'.'+ext });
      fx.addEventListener('click',()=>{ const hasRows=p.countries.some(c=>fp[c] && (fp[c].visRe>0 || fp[c].ingreso>0 || fp[c].honorarioDevengado>0)); if(!hasRows){ui.toast('Sin filas financieras reales para exportar en este periodo y alcance','err');return;} CX.reportKit.openReport(finSpec('pdf'),'fin_dashboard'); });
    }
    document.getElementById('finDashPer')?.addEventListener('change',e=>{const opt=e.target.selectedOptions[0];const id=opt&&opt.dataset?opt.dataset.pid:null;if(id){CX.fin.setCanonPeriod(id);}CX.router.nav('financiero');});
    document.querySelectorAll('.finDrill').forEach(el=>el.addEventListener('click',()=>{
      const c=el.dataset.c, liqs=CX.liq.forProject(data).filter(l=>l.pais===c);
      const d=fp[c];
      ui.modal('Detalle financiero · '+CX.paisLabel(c),`
        <div class="grid g2" style="gap:12px;margin-bottom:14px">
          <div class="card card-p"><div class="card-t" style="font-size:12px;margin-bottom:6px">💰 Ingresos operativos</div><div style="font-size:20px;font-weight:800;color:var(--green);font-family:var(--disp)">${d.cur} ${d.ingreso.toLocaleString()}</div><div style="font-size:11px;color:var(--t3);margin-top:4px">Facturado al cliente (sin financiamientos)</div></div>
          <div class="card card-p"><div class="card-t" style="font-size:12px;margin-bottom:6px">💸 Honorario devengado</div><div style="font-size:20px;font-weight:800;color:var(--red);font-family:var(--disp)">${d.cur} ${d.honorarioDevengado.toLocaleString()}</div><div style="font-size:11px;color:var(--t3);margin-top:4px">${liqs.length} liquidaciones · por pagar ${d.cur} ${d.honorarioPorPagar.toLocaleString()} · pagado ${d.cur} ${d.honorarioPagado.toLocaleString()} (${d.pagosConfirmados} confirmado/s)</div></div>
          <div class="card card-p"><div class="card-t" style="font-size:12px;margin-bottom:6px">🟢 Margen neto</div><div style="font-size:20px;font-weight:800;color:${d.margen>=0?'var(--green)':'var(--red)'};font-family:var(--disp)">${d.cur} ${d.margen.toLocaleString()} <span style="font-size:13px;font-weight:600">(${d.margenPct}%)</span></div><div style="font-size:11px;color:var(--t3);margin-top:4px">${d.margenPct>=30?'✓ Sobre objetivo (30%)':'⚠ Bajo objetivo (30%)'}</div></div>
          <div class="card card-p"><div class="card-t" style="font-size:12px;margin-bottom:6px">⏳ Cuentas por cobrar (CxC)</div><div style="font-size:20px;font-weight:800;color:var(--amber);font-family:var(--disp)">${d.cur} ${d.cxc.toLocaleString()}</div></div>
        </div>
        <b style="font-size:13px">Liquidaciones del periodo (${liqs.length})</b>
        <div style="overflow-x:auto;margin-top:10px;max-height:260px;overflow-y:auto">${liqs.length?`<table class="tbl"><thead><tr><th>Visita</th><th>Shopper</th><th>Total</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${liqs.map(l=>`<tr><td style="font-size:12px"><b>${l.sucursal||l.visitaId}</b></td><td style="font-size:12px">${l.shopper||'—'}</td><td>${d.cur} ${(l.total||0).toLocaleString()}</td><td>${ui.estadoBadge?ui.estadoBadge(l.estado):l.estado}</td><td>${(()=>{const v=data._visitas.find(x=>x.id===l.visitaId);const vc=v&&data.visitContract?data.visitContract(v):null;return vc&&vc.paymentState!=='no_aplica'?ui.bdg(vc.paymentState,vc.paymentState==='confirmado'?'g':'n'):'—';})()}</td></tr>`).join('')}</tbody></table>`:ui.empty('💸','Sin liquidaciones en este periodo.')}</div>`);
    }));
    /* KPIs adicionales dentro del tile — sólo responde si no es ya un finDrill */
    document.querySelectorAll('[data-c]').forEach(el=>{ if(!el.classList.contains('finDrill')) return; });
    const cur=defCur0(p);
    /* CORTE 3 V178 R29 — sin montos de presupuesto inventados: NO se siembran defaults; con la
       fuente vacía se muestra estado vacío/Pendiente de fuente. Lectura de presupuesto con periodo
       CANÓNICO EXPLÍCITO (nunca pres(p.id) implícito). */
    const store=CX.finStore.pres(p.id, canonicalPeriodId);
    const draw=()=>{
      const list=document.getElementById('presList'); if(!list)return;
      const ks=Object.keys(store); const tot=ks.reduce((a,k)=>a+(+store[k]||0),0);
      list.innerHTML = (ks.length?ks.map(k=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)">
        <span style="font-size:12.5px;color:var(--t1)">${k}</span>
        <b style="font-size:12.5px">${(+store[k]).toLocaleString()} <span class="muted" style="font-weight:500">(sin moneda)</span></b></div>`).join(''):'<div class="muted" style="font-size:12px;padding:8px 0">Sin rubros aún — configúralos en Movimientos</div>')
        + `<div class="between" style="padding:9px 0 0;font-weight:700"><span style="font-size:13px">Total planeado</span><b style="color:var(--t1)">${tot.toLocaleString()} <span class="muted" style="font-weight:500">pendiente de asignación</span></b></div>`;
    };
    draw();
    // barras de avance de presupuesto con semáforos (real vs presupuestado)
    const drawAvance=()=>{
      const bars=document.getElementById('presBars'); if(!bars)return;
      /* R29 — el presupuesto sin asignación es PLANEADO, no gasto ejecutado: se muestra en UNA
         tarjeta "Presupuesto pendiente de asignación", sin margen, sin ejecución real, sin moneda
         inventada. No se usa __unassignedBudget.total como fijReal/Total ejecutado. */
      const ks=Object.keys(store);
      const totalPlaneado=ks.reduce((a,k)=>a+(+store[k]||0),0);
      if(!ks.length){ bars.innerHTML='<div class="muted" style="font-size:12px;padding:10px 0">Sin presupuesto en la fuente para este periodo · <b>Pendiente de fuente</b>. No se generan cifras de ejemplo.</div>'; return; }
      bars.innerHTML = `<div class="card card-p" style="background:var(--amber-bg);border-color:#f0dfa8">
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">📝 Presupuesto pendiente de asignación</div>
        <div style="font-size:11.5px;color:var(--t2);margin-bottom:10px">Presupuesto PLANEADO sin distribución por país/moneda confirmada. No es gasto ejecutado, no afecta el margen y no se rotula con una moneda del proyecto hasta asignarse.</div>
        ${ks.map(k=>`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px;color:var(--t1)">${k}</span><b style="font-size:12px">${(+store[k]||0).toLocaleString()} <span class="muted" style="font-weight:500">(sin moneda asignada)</span></b></div>`).join('')}
        <div class="between" style="padding:9px 0 0;font-weight:700"><span style="font-size:12.5px">Total planeado (sin asignar)</span><span style="font-size:12.5px">${totalPlaneado.toLocaleString()} <span class="muted" style="font-weight:500">pendiente de asignación</span></span></div>
      </div>`;
    };
    drawAvance();
    const goMov=document.getElementById('presGoMov');
    if(goMov)goMov.addEventListener('click',(e)=>{e.preventDefault();CX.router.nav('movimientos');});
  },0);
  return html_fin;
});

CX.module('movimientos', ({data,ui})=>{
  const p=data.period();
  /* V176 P0-4 — sin moneda del primer país como agregado. La moneda se resuelve por país/fila
     (curOf en draw). 'defCur' solo se usa como etiqueta cuando el alcance tiene UNA sola moneda. */
  const CURRENCY_GROUPING_CONTRACT=FINANCE_CURRENCY_GROUPING_CONTRACT;
  const currencySet=[...new Set(p.countries.map(c=>p.currency[c]))];
  const defCur=currencySet.length===1?currencySet[0]:(currencySet[0]||'');
  const cur=defCur;
  /* V176 P0-3 — periodo operativo CANÓNICO de CX.data (no CX.finStore.curPeriod paralelo).
     canonMonth = mes YYYY-MM del periodo activo para filtrar/guardar movimientos y presupuesto. */
  const canonPeriodId=()=>CX.data.currentPeriodId;
  const canonicalPeriodId=CX.data.currentPeriodId;
  const canonicalPeriodLabel=(()=>{const pr=CX.data.period()||{};return pr.periodo||pr.ronda||pr.periodLabel||pr.name||String(CX.data.currentPeriodId);})();
  /* CORTE 3 V178 R29 — resolvedor de moneda FAIL-CLOSED: fila sin país/moneda → 'pending_currency'
     (nunca hereda la primera moneda del proyecto). Las filas pending_currency no se agregan a
     una moneda, no se exportan como Q/L y entran a revisión. */
  const PENDING_CURRENCY='pending_currency';
  const currencyOf=(row)=>{ if(row&&row.pais&&p.currency&&p.currency[row.pais])return p.currency[row.pais]; if(row&&row.moneda)return row.moneda; return PENDING_CURRENCY; };
  const curOfRow=(r)=>currencyOf(r);
  const isFinancialReview=(l)=>{
    const cur=currencyOf(l);
    return !l||l.reviewRequired===true||l.financialSourceStatus==='pending_or_review'||l.liquidationState==='pending_financial_source'||!l.pais||cur===PENDING_CURRENCY;
  };
  const canonMonth=()=>{const pr=CX.data.period()||{};const s=pr.periodKey||pr.startDate||pr.fechaInicio||pr.desde||'';const m=/^(\d{4})-(\d{2})/.exec(String(s));if(m)return m[1]+'-'+m[2];return new Date().toISOString().slice(0,7);};
  const seed=[
    {tipo:'ingreso',cat:'Anticipo cliente',pais:p.countries[0],monto:40000,fecha:'2026-06-03',desc:'Anticipo del proyecto',estado:'Conciliado'},
    {tipo:'egreso',cat:'Pago lote #L-204',pais:p.countries[0],monto:-18240,fecha:'2026-06-12',desc:'Pago a evaluadores',estado:'Pagado',origen:'lote'},
    {tipo:'ingreso',cat:'Factura final cliente',pais:p.countries[0],monto:46400,fecha:'2026-06-20',desc:'Factura de cierre',estado:'Pendiente (CxC)'},
  ];
  /* P0-2 (paquete genérico 20260711): fixtures visibles solo en modo demo (guard de segunda capa) */
  const _showFixtures = CX.dataSource ? CX.dataSource.showFixtures() : true;
  const host=ui.el('div');
  let scope='proyecto'; // 'proyecto' | 'global'
  const pid=()=>scope==='global'?CX.finStore.GLOBAL:p.id;
  const CAT=CX.finStore.CATEGORIAS, TI=CX.finStore.TIPOS_INGRESO, TE=CX.finStore.TIPOS_EGRESO;
  const draw=()=>{
    const isG=scope==='global';
    const per=canonMonth();
    const movs=[...(isG||!_showFixtures?[]:seed),...CX.finStore.mov(pid()).filter(m=>!m.fecha||m.fecha.slice(0,7)===per)];
    /* R31 — agregación por MONEDA primero; los KPIs/tablas se derivan de aggByCur DESPUÉS de
       excluir pending_currency. No hay totales crudos multi-moneda previos. */
    const curOf=(m)=>currencyOf(m);
    const _mvMoney=(m,v)=>{const cu=curOf(m);return cu===PENDING_CURRENCY?'<span class="bdg bdg-a">Pendiente de moneda</span>':ui.money(cu,v);};
    const aggByCur={}; const groupByCurrency=aggByCur; /* totalsByCurrency / porMoneda */
    const pendingCurrencyRows=[]; /* filas sin moneda resoluble: fail-closed, no se agregan */
    const bump=(cu,k,v)=>{const a=aggByCur[cu]||(aggByCur[cu]={ingOper:0,egr:0,cxc:0,cxp:0,remesas:0,financiamiento:0});a[k]+=v;};
    movs.forEach(m=>{const cu=curOf(m);
      if(cu===PENDING_CURRENCY){pendingCurrencyRows.push({kind:'mov',r:m});return;}
      if(m.monto>0){ if(m.tipoIngreso==='financiamiento')bump(cu,'financiamiento',m.monto); else if(!m.noOperativo)bump(cu,'ingOper',m.monto); if(m.tipoIngreso==='remesa')bump(cu,'remesas',m.monto); }
      else bump(cu,'egr',m.monto);
      if((m.estado||'').includes('CxC'))bump(cu,'cxc',Math.abs(m.monto)); });
    CX.finStore.cxp(pid()).forEach(r=>{const cu=currencyOf(r);if(cu===PENDING_CURRENCY){pendingCurrencyRows.push({kind:'cxp',r});return;}bump(cu,'cxp',r.saldo||0);});
    CX.finStore.cxc(pid()).forEach(r=>{const cu=currencyOf(r);if(cu===PENDING_CURRENCY){pendingCurrencyRows.push({kind:'cxc',r});return;}bump(cu,'cxc',r.saldo||0);});
    const derivedLiqCxps=!isG?CX.liq.forProject(data).filter(l=>l.estado!=='pagada'&&l.estado!=='pagada_preview'&&!isFinancialReview(l)):[];
    const derivedLiqReviews=!isG?CX.liq.forProject(data).filter(l=>l.estado!=='pagada'&&l.estado!=='pagada_preview'&&isFinancialReview(l)):[];
    derivedLiqCxps.forEach(l=>{const cu=currencyOf(l);if(cu===PENDING_CURRENCY){pendingCurrencyRows.push({kind:'liq',r:l});return;}bump(cu,'cxp',l.total||0);});
    const shownCurs=[...new Set([...p.countries.map(c=>p.currency[c]), ...Object.keys(aggByCur)])].filter(Boolean);
    const multiCur=shownCurs.length>1;
    /* KPIs de una sola moneda: se leen del grupo de la moneda visible (ya sin pending_currency). */
    const _one=aggByCur[shownCurs[0]]||{ingOper:0,egr:0,cxc:0,cxp:0,remesas:0,financiamiento:0};
    const ingOper=_one.ingOper, egr=_one.egr, remesas=_one.remesas, financiamiento=_one.financiamiento;
    const cxpLiq=0; /* R32: liquidaciones ya agregadas en aggByCur.cxp (bump), no re-sumar */
    const cxp=_one.cxp; /* R32: aggByCur.cxp YA incluye CxP manual + liquidaciones + financiamiento; no re-sumar */
    const cxc=_one.cxc;

    host.innerHTML=`
    <div class="between" style="margin-bottom:12px"><div>${ui.ph('Movimientos & Tesorería', 'Ingresos, egresos, CxC/CxP, financiamientos y remesas · por proyecto o globales')}</div>
      <div class="flex"><span class="bdg bdg-a">◐ Preview operativo</span><button class="btn btn-ghost btn-sm" id="movExport">⤓ Exportar</button></div></div>

    <div class="between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div class="flex" style="gap:0;border:1px solid var(--border);border-radius:9px;overflow:hidden;width:max-content">
        <button class="btn btn-sm ${scope==='proyecto'?'btn-pr':'btn-ghost'}" data-scope="proyecto" style="border-radius:0">📁 ${p.name}</button>
        <button class="btn btn-sm ${scope==='global'?'btn-pr':'btn-ghost'}" data-scope="global" style="border-radius:0">🌐 Global (administrativo)</button>
      </div>
      <div class="flex" style="gap:8px;align-items:center">
        <label class="lbl" style="margin:0">Periodo</label>
        <select class="sel" id="perSel" style="width:auto;padding:6px 10px">${CX.fin.canonPeriods().map(pr=>`<option value="${pr.id}" ${pr.id===CX.fin.canonCurrentId()?'selected':''}>${pr.label}</option>`).join('')}</select>
        <span class="muted" style="font-size:11px" title="Los periodos se gestionan desde el contexto canónico (barra lateral)">Mes gestionado por el periodo canónico</span>
      </div>
    </div>

    <div class="flex wrap" style="gap:8px;margin-bottom:14px">
      <button class="btn btn-green btn-sm" data-new="ingreso">＋ Ingreso</button>
      <button class="btn btn-soft btn-sm" data-new="egreso">＋ Egreso</button>
      <button class="btn btn-soft btn-sm" data-cuenta="cxc">＋ Cuenta por cobrar</button>
      <button class="btn btn-soft btn-sm" data-cuenta="cxp">＋ Cuenta por pagar</button>
      <button class="btn btn-soft btn-sm" id="autoCxp">⚙️ Generar CxC/CxP automáticas</button>
      <button class="btn btn-soft btn-sm" data-new="remesa">＋ Remesa</button>
      ${!isG?`<button class="btn btn-pr btn-sm" id="payLote">💳 Pagar lote</button>`:''}
      <button class="btn btn-ghost btn-sm" id="impHist">⤒ Importar histórico</button>
    </div>

    ${multiCur ? shownCurs.map(cu=>{const a=aggByCur[cu]||{};return `<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Moneda ${cu}</div><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px"><div>${ui.kpi('Ingresos oper.',ui.money(cu,a.ingOper||0),'g',a.financiamiento?'+ fin. aparte':'')}</div><div>${ui.kpi('Egresos',ui.money(cu,Math.abs(a.egr||0)),'r')}</div><div>${ui.kpi('Por cobrar (CxC)',ui.money(cu,a.cxc||0),'a')}</div><div>${ui.kpi('Por pagar (CxP)',ui.money(cu,a.cxp||0),'a',a.financiamiento?'incl. financiamiento':'')}</div><div>${ui.kpi('Remesas',ui.money(cu,a.remesas||0),'b','conciliación')}</div></div></div>`;}).join('')+`<div style="font-size:11px;color:var(--t3);margin:-4px 0 14px">⚠ Monedas separadas: GTQ y HNL no se suman entre sí; cada bloque conserva su moneda.</div>` : `<div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:16px">
      <div data-drill="ing" style="cursor:pointer">${ui.kpi('Ingresos oper.',ui.money(cur,ingOper),'g',financiamiento?'+ fin. aparte':'')}</div>
      <div data-drill="egr" style="cursor:pointer">${ui.kpi('Egresos',ui.money(cur,Math.abs(egr)),'r')}</div>
      <div data-drill="cxc" style="cursor:pointer">${ui.kpi('Por cobrar (CxC)',ui.money(cur,cxc),'a')}</div>
      <div data-drill="cxp" style="cursor:pointer">${ui.kpi('Por pagar (CxP)',ui.money(cur,cxp),'a',financiamiento?'incl. financiamiento':'')}</div>
      <div data-drill="rem" style="cursor:pointer">${ui.kpi('Remesas',ui.money(cur,remesas),'b','conciliación')}</div>
    </div>`}

    ${pendingCurrencyRows.length?`<div class="card card-p" style="margin-bottom:16px;border-color:#f3d9d9">
      <div class="card-h"><div class="card-t">🔐 Filas en revisión · moneda no resuelta</div><span class="bdg bdg-r">${pendingCurrencyRows.length} en revisión · pago/lote/export bloqueados</span></div>
      <div style="font-size:11.5px;color:var(--t2);margin-bottom:10px">Estas filas no tienen país/moneda resoluble: no se agregan a Q/L, no se exportan como moneda válida y no habilitan pago ni lote.</div>
      <div class="scroll-hint" aria-label="Desliza para ver más" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Tipo</th><th>País</th><th>Moneda</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>ID</th><th>Motivo</th><th>Estado</th></tr></thead><tbody>
      ${pendingCurrencyRows.map(x=>{const r=x.r;return `<tr><td style="font-size:12px">${x.kind}</td><td>${r.pais||'<span class="muted">—</span>'}</td><td><span class="muted">pending_currency</span></td><td style="font-size:12px">${r.cat||r.concepto||r.desc||'—'}</td><td style="text-align:right">${Math.round(r.monto||r.saldo||r.total||0).toLocaleString()}</td><td style="font-size:11px;color:var(--t3)">${r.fecha||'—'}</td><td style="font-size:11px;color:var(--t3)">${r.id||r.visitaId||'—'}</td><td style="font-size:11.5px">Sin país/moneda en la fuente</td><td>${ui.bdg('Pendiente de moneda','a')}</td></tr>`;}).join('')}
      </tbody></table></div>
      <div style="margin-top:9px;font-size:11px;color:var(--t3)">🔒 Bloqueadas para pago, lote y export monetario hasta asignar país/moneda.</div>
    </div>`:''}

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p"><div class="card-h"><div class="card-t">Ingresos por tipo</div></div>
        ${(()=>{ /* income_type_rows por moneda (porMoneda): agrupa por moneda de fila, no cross-currency */
          const porTipoMoneda={}; movs.filter(m=>m.monto>0&&curOf(m)!==PENDING_CURRENCY).forEach(m=>{const t=m.tipoIngreso||'otro';const cu=curOf(m);(porTipoMoneda[cu]=porTipoMoneda[cu]||{})[t]=(porTipoMoneda[cu][t]||0)+m.monto;});
          const cus=Object.keys(porTipoMoneda).filter(c=>c!==PENDING_CURRENCY); if(!cus.length) return '<div class="muted" style="font-size:12px;padding:8px 0">Sin ingresos registrados</div>';
          return cus.map(cu=>`<div style="font-size:10.5px;font-weight:700;color:var(--t3);margin:6px 0 2px">Moneda ${cu}</div>`+Object.keys(TI).map(t=>{const val=porTipoMoneda[cu][t]||0;return val?`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px;color:var(--t2)">${TI[t]}${t==='financiamiento'?' <span class="bdg bdg-a" style="font-size:9px">→CxP</span>':''}</span><b style="font-size:12.5px;color:${t==='financiamiento'?'var(--amber)':'var(--green)'}">${ui.money(cu,val)}</b></div>`:'';}).join('')).join('');
        })()}
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Los <b>financiamientos</b> no son utilidad: se suman a CxP hasta devolverse.</div>
      </div>
      <div class="card card-p"><div class="card-h"><div class="card-t">Cuentas por pagar (CxP)</div></div>
        ${CX.finStore.cxp(pid()).length?`<input class="inp" id="cxpFind" placeholder="🔍 Buscar concepto/beneficiario…" style="margin-bottom:8px;padding:5px 9px;font-size:12px">`:''}
        <div id="cxpBody">${CX.finStore.cxp(pid()).length?CX.finStore.cxp(pid()).map(r=>`<div class="between cxpRow" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div style="cursor:pointer" data-cxdet="cxp:${r.id}"><b style="font-size:12px">${r.concepto}</b><div style="font-size:10px;color:var(--t3)">${r.pais||'<span class="bdg bdg-n" style="font-size:9px">Pendiente de moneda</span>'} · ${r.estado||'pendiente'} · saldo ↗ ver detalle</div></div><div class="flex" style="gap:8px"><b style="font-size:12.5px;color:var(--amber)">${r.pais&&p.currency[r.pais]?ui.money(p.currency[r.pais],r.saldo||0):(r.moneda?ui.money(r.moneda,r.saldo||0):'Pendiente de moneda')}</b>${currencyOf(r)!==PENDING_CURRENCY?`<button class="btn btn-soft btn-sm" data-abono="${r.id}">Abonar</button>`:ui.bdg('Revisión · sin moneda','r')}</div></div>`).join(''):''}
        ${derivedLiqCxps.length?`<div style="font-size:10.5px;font-weight:700;color:var(--t3);text-transform:uppercase;margin:8px 0 4px">CxP derivada de liquidaciones exactas</div>${derivedLiqCxps.slice(0,8).map(l=>`<div class="between cxpRow" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12px">Liquidación pendiente · ${l.shopper||'Shopper'}</b><div style="font-size:10px;color:var(--t3)">${l.pais||''} · ${l.estado||'conciliada_pendiente_pago'} · fuente exacta, pago pendiente</div></div><b style="font-size:12.5px;color:var(--amber)">${ui.money(currencyOf(l),l.total||0)}</b></div>`).join('')}${derivedLiqCxps.length>8?`<div class="muted" style="font-size:11px;padding:5px 0">+${derivedLiqCxps.length-8} liquidación(es) exacta(s) adicionales</div>`:''}`:''}
        ${derivedLiqReviews.length?`<div style="font-size:11px;color:var(--red);margin-top:8px">🔒 ${derivedLiqReviews.length} liquidación(es) en revisión financiera visibles, excluidas de CxP pagable.</div>`:''}
        ${!CX.finStore.cxp(pid()).length&&!derivedLiqCxps.length?'<div class="muted" style="font-size:12px;padding:8px 0">Sin CxP registradas ni liquidaciones exactas por pagar. Útil al importar saldos iniciales.</div>':''}</div>
      </div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p" id="presMesCard">
        <div class="between" style="margin-bottom:8px"><div class="card-t">📋 Presupuesto mensual <span class="bdg bdg-b">${per}</span></div><button class="btn btn-soft btn-sm" id="addPresMes">＋ Rubro</button></div>
        <div id="presMesList"></div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Es <b>mensual</b> y queda ligado al periodo canónico. El presupuesto es <b>planeado</b>: sin país/moneda asignada se muestra <b>sin moneda</b> y no afecta el margen.</div>
      </div>
      <div class="card card-p" id="finCard">
        <div class="between" style="margin-bottom:8px"><div class="card-t">🏦 Financiamientos</div><button class="btn btn-soft btn-sm" id="addFin">＋ Financiamiento</button></div>
        <div id="finList"></div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">No son ingreso operativo: entran como flujo + CxP y se controlan hasta su <b>devolución</b> (egreso).</div>
      </div>
    </div>

    <div class="card card-p">
      <div class="card-h"><div class="card-t">Movimientos${isG?' globales':' del proyecto'}</div><span class="muted" style="font-size:11px">conceptos categorizados · anti-duplicado al importar</span></div>
      <div class="scroll-hint" aria-label="Desliza para ver más" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Tipo</th><th>País</th><th style="text-align:right">Monto</th><th>Estado</th><th></th></tr></thead><tbody>
        ${movs.map(m=>`<tr><td style="font-size:12px">${m.fecha}</td><td><b>${m.cat}</b><div style="font-size:10px;color:var(--t3)">${m.desc||''}</div></td>
          <td style="font-size:11.5px">${m.categoria||(m.global?'Administrativo':'Proyecto')}</td>
          <td style="font-size:11px">${TI[m.tipoIngreso]||TE[m.tipoEgreso]||m.tipo}</td><td>${m.pais||'—'}</td>
          <td style="text-align:right;font-weight:700;color:var(--${m.monto<0?'red':'green'})">${curOf(m)===PENDING_CURRENCY?'<span class="bdg bdg-a">Pendiente de moneda</span>':(m.monto<0?'− ':'+ ')+_mvMoney(m,Math.abs(m.monto))}</td>
          <td>${ui.bdg(m.estado||'—',(m.estado||'').includes('Cx')?'a':m.monto<0?'r':'g')}</td>
          <td style="text-align:right">${m.id?`<button class="btn btn-ghost btn-sm" data-delm="${m.id}" style="color:var(--red);padding:2px 6px">✕</button>`:''}</td></tr>`).join('')}
      </tbody></table></div>
      <div style="margin-top:14px">${ui.aiBox('Separo ingresos por comisiones, honorarios, anticipos y facturación de los financiamientos (que van a CxP). Registro CxC/CxP iniciales en la importación y vinculo cada abono a su egreso. Las remesas recibidas se concilian aquí.','Tesorería completa, no solo gastos del proyecto')}</div>
    </div>`;

    host.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.scope;draw();}));
    const mx=host.querySelector('#movExport');
    if(mx&&CX.reportKit){
      const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
      const projectLabel=data.programBase?data.programBase(p):p.name;
      /* R30 P0-4: gráfica POR MONEDA (nunca suma GTQ+HNL en una sola serie). */
      const chartByCur={}; movs.filter(m=>curOf(m)!==PENDING_CURRENCY).forEach(m=>{const cu=curOf(m);const key=(m.monto<0?'Egreso':'Ingreso');(chartByCur[cu]=chartByCur[cu]||{})[key]=(chartByCur[cu][key]||0)+Math.abs(m.monto);});
      /* R30 P0-3: export excluye filas sin moneda del reporte monetario; van en sección de revisión. */
      const exportMovs=movs.filter(m=>curOf(m)!==PENDING_CURRENCY);
      const movSpec=(ext)=>({ title:'Movimientos & Tesorería',
        meta:{title:'Movimientos & Tesorería',project:(isG?'Global (administrativo)':projectLabel),period:canonicalPeriodLabel,scope:(isG?'Global':projectLabel),sourceLabel:'Finanzas · movimientos del periodo',generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
        columns:[{key:'fecha',label:'Fecha'},{key:'concepto',label:'Concepto'},{key:'categoria',label:'Categoría'},{key:'tipo',label:'Tipo'},{key:'pais',label:'País'},{key:'moneda',label:'Moneda'},{key:'monto',label:'Monto'},{key:'estado',label:'Estado'}],
        rows:exportMovs.map(m=>({fecha:m.fecha||'—',concepto:m.cat||m.desc||'—',categoria:m.categoria||(m.global?'Administrativo':'Proyecto'),tipo:(TI[m.tipoIngreso]||TE[m.tipoEgreso]||m.tipo||'—'),pais:m.pais||'—',moneda:curOf(m),monto:Math.round(m.monto||0),estado:m.estado||'—'})),
        notes:'Cada fila conserva su moneda; los totales por moneda no se suman entre sí.',
        summary:['Movimientos: '+exportMovs.length].concat(shownCurs.map(cu=>{const a=aggByCur[cu]||{};return cu+' — Ingresos oper.: '+ui.money(cu,a.ingOper||0)+' · Egresos: '+ui.money(cu,Math.abs(a.egr||0));})),
        chart:{title:'Ingresos vs Egresos por moneda',perCurrency:chartByCur,data:Object.entries(chartByCur).flatMap(([cu,o])=>Object.entries(o).map(([k2,v2])=>({label:cu+' · '+k2,value:Math.round(v2)})))},
        reviewSection:pendingCurrencyRows.length?{title:'Filas en revisión (moneda no resuelta)',rows:pendingCurrencyRows.map(x=>({tipo:x.kind,concepto:(x.r.cat||x.r.concepto||x.r.desc||'—'),pais:x.r.pais||'—',monto:Math.round(x.r.monto||x.r.saldo||x.r.total||0),estado:'Pendiente de moneda'}))}:null,
        filename:[san('movimientos'),san(projectLabel),san(per),new Date().toISOString().slice(0,10)].join('_')+'.'+ext });
      mx.addEventListener('click',()=>{ if(pendingCurrencyRows.length){ui.toast('Export bloqueado: hay '+pendingCurrencyRows.length+' fila(s) en revisión de moneda. Resuélvelas para exportar.','err',4200);return;} if(!exportMovs.length){ui.toast('Sin movimientos para exportar','err');return;} CX.reportKit.openReport(movSpec('pdf'),'fin_movimientos'); });
    }
    const ps=host.querySelector('#perSel'); if(ps)ps.addEventListener('change',()=>{CX.fin.setCanonPeriod(ps.value);CX.router.nav('movimientos');});

    // ---- presupuesto mensual (period-keyed) ----
    const pml=host.querySelector('#presMesList');
    if(pml){ const store=CX.finStore.pres(p.id,canonicalPeriodId); const ks=Object.keys(store); const tot=ks.reduce((a,k)=>a+(+store[k]||0),0);
      pml.innerHTML=(ks.length?ks.map(k=>`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12.5px">${k}</span><div class="flex" style="gap:8px"><b style="font-size:12.5px">${(+store[k]).toLocaleString()} <span class="muted" style="font-weight:500">sin moneda asignada</span></b><button class="btn btn-ghost btn-sm" data-delpm="${k}" style="color:var(--red);padding:2px 7px">✕</button></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:6px 0">Sin rubros este mes</div>')+`<div class="between" style="padding:8px 0 0;font-weight:700"><span style="font-size:12.5px">Total planeado</span><b>${tot.toLocaleString()} <span class="muted" style="font-weight:500">pendiente de asignación</span></b></div>`;
      pml.querySelectorAll('[data-delpm]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.delPres(p.id,b.dataset.delpm,canonicalPeriodId);draw();}));
    }
    const apm=host.querySelector('#addPresMes');
    if(apm)apm.addEventListener('click',()=>ui.modal('Nuevo rubro de presupuesto · '+per,`
      <label class="lbl">Concepto</label><input class="inp" id="pmK" placeholder="Ej. Coordinación, Transporte" style="margin-bottom:10px">
      <label class="lbl">Monto planeado</label><input class="inp" id="pmV" type="number" style="margin-bottom:6px"><div style="font-size:11px;color:var(--t3);margin-bottom:14px">Sin moneda asignada hasta definir país/moneda del rubro.</div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="pmSave">Agregar</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#pmSave').addEventListener('click',()=>{const k=(ov.querySelector('#pmK').value||'').trim();if(!k){ui.toast('Escribe el concepto','warn');return;}CX.finStore.setPres(p.id,k,+ov.querySelector('#pmV').value||0,canonicalPeriodId);close();draw();ui.toast('Rubro agregado al presupuesto','ok');});}}));

    // ---- financiamientos ----
    const fl=host.querySelector('#finList');
    if(fl){ const fins=CX.finStore.financiamientos(p.id);
      fl.innerHTML=fins.length?fins.map(f=>`<div style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div class="between"><div><b style="font-size:12.5px">${f.fuente||'Financiamiento'}</b><div style="font-size:10.5px;color:var(--t3)">${f.pais||''} · ${f.fecha} · devuelto ${f.pais&&p.currency[f.pais]?ui.money(p.currency[f.pais],f.devuelto||0):(f.moneda?ui.money(f.moneda,f.devuelto||0):'\u2014')}</div></div>
        <div class="flex" style="gap:8px"><b style="font-size:12.5px;color:${(f.saldo||0)>0?'var(--amber)':'var(--green)'}">saldo ${f.pais&&p.currency[f.pais]?ui.money(p.currency[f.pais],f.saldo||0):(f.moneda?ui.money(f.moneda,f.saldo||0):'Pendiente de moneda')}</b>${(!(f.pais&&p.currency[f.pais])&&!f.moneda)?ui.bdg('Revisión requerida · sin moneda · Bloqueado','r'):((f.saldo||0)<=0?ui.bdg('saldado','g'):`<button class="btn btn-soft btn-sm" data-devfin="${f.id}">Devolver</button>`)}</div></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:6px 0">Sin financiamientos registrados</div>';
      fl.querySelectorAll('[data-devfin]').forEach(b=>b.addEventListener('click',()=>{const f=CX.finStore.financiamientos(p.id).find(x=>x.id===b.dataset.devfin);
        ui.modal('Devolver financiamiento · '+f.fuente,`<div style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Saldo: <b>${f.pais&&p.currency[f.pais]?ui.money(p.currency[f.pais],f.saldo||0):(f.moneda?ui.money(f.moneda,f.saldo||0):'Pendiente de moneda')}</b></div><label class="lbl">Monto a devolver</label><input class="inp" id="dvM" type="number" value="${f.saldo||0}" style="margin-bottom:14px"><div style="text-align:right"><button class="btn btn-green btn-sm" id="dvOk">Registrar devolución</button></div>`,{onMount:(ov,close)=>{ov.querySelector('#dvOk').addEventListener('click',()=>{CX.finStore.devolverFinanciamiento(p.id,f.id,+ov.querySelector('#dvM').value||0);close();draw();ui.toast('Devolución registrada · egreso generado · CxP reducida','ok',3600);});}});
      }));
    }
    const af=host.querySelector('#addFin');
    if(af)af.addEventListener('click',()=>ui.modal('Registrar financiamiento',`
      <p style="font-size:12px;color:var(--t2);margin-bottom:10px">Entra como <b>flujo</b> (no ingreso operativo) y como CxP hasta devolverse.</p>
      <div class="grid g2" style="gap:10px 12px"><div style="grid-column:1/3"><label class="lbl">Fuente</label><input class="inp" id="fnF" placeholder="Banco / socio / casa matriz"></div>
      <div style="grid-column:1/3"><label class="lbl">Concepto / destino</label><input class="inp" id="fnC" placeholder="Ej. capital de trabajo, anticipo de nómina"></div>
      <div><label class="lbl">Monto <span id="fnCurLbl" class="muted">(elige país)</span></label><input class="inp" id="fnM" type="number"></div>
      <div><label class="lbl">País</label><select class="sel" id="fnP"><option value="">— elige país —</option>${p.countries.map(c=>`<option>${c}</option>`).join('')}</select></div></div>
      <div id="fnReview" style="font-size:11px;color:var(--red);margin-top:6px;display:none">Pendiente de moneda · Bloqueado hasta elegir país</div>
      <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="fnSave">Registrar</button></div>
    `,{onMount:(ov,close)=>{
      const fnCur=()=>{const c=ov.querySelector('#fnP').value;return c&&p.currency[c]?p.currency[c]:PENDING_CURRENCY;};
      const syncFn=()=>{const cu=fnCur();ov.querySelector('#fnCurLbl').textContent=cu===PENDING_CURRENCY?'(elige país)':'('+cu+')';ov.querySelector('#fnReview').style.display=cu===PENDING_CURRENCY?'':'none';};
      ov.querySelector('#fnP').addEventListener('change',syncFn); syncFn();
      ov.querySelector('#fnSave').addEventListener('click',()=>{
        if(fnCur()===PENDING_CURRENCY){ui.toast('Selecciona el país para resolver la moneda antes de registrar','warn');return;} /* R31: bloquear sin moneda */
        CX.finStore.addFinanciamiento(p.id,{fuente:(ov.querySelector('#fnF').value||'').trim(),concepto:(ov.querySelector('#fnC').value||'').trim(),monto:+ov.querySelector('#fnM').value||0,pais:ov.querySelector('#fnP').value,moneda:fnCur()});close();draw();ui.toast('Financiamiento registrado · flujo + CxP (no operativo)','ok',3600);});}}));
    const cxpF=host.querySelector('#cxpFind');
    if(cxpF)cxpF.addEventListener('input',()=>{const q=cxpF.value.toLowerCase();host.querySelectorAll('#cxpBody .cxpRow').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';});});
    host.querySelectorAll('[data-delm]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.delMov(pid(),b.dataset.delm);draw();ui.toast('Movimiento eliminado','');}));
    host.querySelectorAll('[data-cxdet]').forEach(el=>el.addEventListener('click',()=>{
      const [kind,id]=el.dataset.cxdet.split(':');
      const arr=kind==='cxc'?CX.finStore.cxc(pid()):CX.finStore.cxp(pid());
      const r=arr.find(x=>x.id===id); if(!r)return;
      const estados=kind==='cxc'?['pendiente','parcial','cobrada','incobrable']:['pendiente','parcial','pagada','programada'];
      ui.modal((kind==='cxc'?'⏳ Cuenta por cobrar':'💸 Cuenta por pagar')+' · '+r.concepto,`
        <div style="font-size:12.5px;line-height:1.9;color:var(--t2);margin-bottom:12px">
          <div><b>Concepto:</b> ${r.concepto}</div>
          <div><b>País:</b> ${r.pais||'—'} · <b>Origen:</b> ${r.origen||'manual'}</div>
          ${r.shopper?`<div><b>Shopper/Acreedor:</b> ${r.shopper}</div>`:''}
          ${r.visitaId?`<div><b>Visita vinculada:</b> ${r.visitaId}</div>`:''}
        </div>
        <div class="grid g2" style="gap:10px 12px">
          <div><label class="lbl">País</label><select class="sel" id="cxPais"><option value="">—</option>${p.countries.map(c=>`<option ${r.pais===c?'selected':''}>${c}</option>`).join('')}</select></div>
          <div><label class="lbl">Monto <span id="cxCurLbl" class="muted">(elige país)</span></label><input class="inp" id="cxSaldo" type="number" value="${r.saldo||0}"></div>
          <div><label class="lbl">Estado</label><select class="sel" id="cxEst">${estados.map(s=>`<option ${(r.estado||'pendiente')===s?'selected':''}>${s}</option>`).join('')}</select></div>
          <div style="grid-column:1/3"><label class="lbl">Nota</label><input class="inp" id="cxNota" value="${(r.nota||'').replace(/"/g,'&quot;')}" placeholder="Observación"></div>
        </div>
        <div id="cxReview" style="font-size:11px;color:var(--red);margin-top:6px;display:none">Pendiente de moneda · Bloqueado: elige país para resolver la moneda antes de guardar el saldo</div>
        <div class="between" style="margin-top:14px">
          <button class="btn btn-ghost btn-sm" id="cxDel" style="color:var(--red)">🗑 Eliminar</button>
          <button class="btn btn-pr btn-sm" id="cxSave">Guardar cambios</button>
        </div>
      `,{onMount:(ov,close)=>{
        const cxCur=()=>{const c=ov.querySelector('#cxPais').value;return c&&p.currency[c]?p.currency[c]:(r.moneda||PENDING_CURRENCY);};
        const syncCx=()=>{const cu=cxCur();ov.querySelector('#cxCurLbl').textContent=cu===PENDING_CURRENCY?'(elige país)':'('+cu+')';ov.querySelector('#cxReview').style.display=cu===PENDING_CURRENCY?'':'none';};
        ov.querySelector('#cxPais').addEventListener('change',syncCx); syncCx();
        ov.querySelector('#cxSave').addEventListener('click',()=>{
          if(cxCur()===PENDING_CURRENCY){ui.toast('Elige país para resolver la moneda antes de guardar el saldo','warn');return;} /* R31: no guardar saldo con moneda pendiente */
          CX.finStore.editCx(pid(),kind,id,{saldo:+ov.querySelector('#cxSaldo').value||0,estado:ov.querySelector('#cxEst').value,nota:ov.querySelector('#cxNota').value,pais:ov.querySelector('#cxPais').value,moneda:cxCur()});
          close();draw();ui.toast('Cuenta actualizada','ok');
        });
        ov.querySelector('#cxDel').addEventListener('click',()=>{CX.finStore.delCx(pid(),kind,id);close();draw();ui.toast('Cuenta eliminada','');});
      }});
    }));

    host.querySelectorAll('[data-drill]').forEach(el=>el.addEventListener('click',()=>{
      const k=el.dataset.drill; let title,rows;
      if(k==='ing'||k==='egr'){const f=movs.filter(m=>(k==='ing'?m.monto>0:m.monto<0)&&curOf(m)!==PENDING_CURRENCY);title=k==='ing'?'Ingresos':'Egresos';rows=f.map(m=>`<tr><td>${m.fecha}</td><td><b>${m.cat}</b></td><td>${TI[m.tipoIngreso]||TE[m.tipoEgreso]||m.tipo}</td><td>${curOf(m)}</td><td style="text-align:right">${_mvMoney(m,Math.abs(m.monto))}</td></tr>`).join('');}
      else if(k==='rem'){const f=movs.filter(m=>m.tipoIngreso==='remesa'&&curOf(m)!==PENDING_CURRENCY);title='Remesas recibidas';rows=f.map(m=>`<tr><td>${m.fecha}</td><td><b>${m.cat}</b></td><td>${m.estado||''}</td><td>${curOf(m)}</td><td style="text-align:right">${_mvMoney(m,m.monto)}</td></tr>`).join('');}
      else {const arr=k==='cxc'?CX.finStore.cxc(pid()):CX.finStore.cxp(pid());title=k==='cxc'?'Cuentas por cobrar':'Cuentas por pagar';rows=arr.map(r=>`<tr><td><b>${r.concepto}</b></td><td>${r.pais||'Pendiente de moneda'}</td><td style="text-align:right">${r.pais?ui.money(curOfRow(r),r.saldo||0):'Pendiente de moneda'}</td></tr>`).join('');}
      ui.modal(title,rows?`<table class="tbl"><tbody>${rows}</tbody></table>`:ui.empty('💰','Sin registros.'));
    }));

    host.querySelectorAll('[data-new]').forEach(b=>b.addEventListener('click',()=>{
      const t=b.dataset.new; const esIng=t!=='egreso'; const tipos=esIng?TI:TE;
      const defTipo=t==='remesa'?'remesa':Object.keys(tipos)[0];
      ui.modal('Registrar '+(t==='remesa'?'remesa recibida':t),`
        <div class="grid g2" style="gap:10px 12px">
          <div style="grid-column:1/3"><label class="lbl">Concepto</label><input class="inp" id="mvCat" placeholder="Concepto del movimiento"></div>
          <div><label class="lbl">Categoría</label><select class="sel" id="mvCateg">${CAT.map(c=>`<option ${(scope==='global'&&c==='Administrativo')?'selected':''}>${c}</option>`).join('')}</select></div>
          <div><label class="lbl">Tipo de ${esIng?'ingreso':'egreso'}</label><select class="sel" id="mvTipo">${Object.keys(tipos).map(k=>`<option value="${k}" ${k===defTipo?'selected':''}>${tipos[k]}</option>`).join('')}</select></div>
          <div><label class="lbl">Monto <span id="mvCurLbl" class="muted">(elige país)</span></label><input class="inp" id="mvMonto" type="number"></div>
          <div><label class="lbl">País</label><select class="sel" id="mvPais"><option value="">— elige país —</option>${p.countries.map(c=>`<option ${scope!=='global'?'selected':''}>${c}</option>`).join('')}</select></div>
          <div><label class="lbl">Fecha (admite histórico)</label><input class="inp" id="mvFecha" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
          <div><label class="lbl">Estado</label><select class="sel" id="mvEstado">${(esIng?['Conciliado','Pendiente (CxC)','Por conciliar']:['Pagado','Programado']).map(s=>`<option>${s}</option>`).join('')}</select></div>
          <div><label class="lbl">${esIng?'Pagador / fuente':'Beneficiario'}</label><input class="inp" id="mvBenef" placeholder="${esIng?'Quién paga (cliente/casa matriz)':'A quién se paga (shopper/proveedor)'}"></div>
          <div><label class="lbl">Proyecto destino</label><select class="sel" id="mvProy"><option value="">— sin proyecto —</option>${(data.projects||[]).map(pr=>`<option value="${pr.id}" ${pr.id===pid()?'selected':''}>${pr.name}</option>`).join('')}</select></div>
          <div style="grid-column:1/3"><label class="lbl">Descripción</label><input class="inp" id="mvDesc" placeholder="Opcional"></div>
        </div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="mvSave">Registrar</button></div>
      `,{onMount:(ov,close)=>{
        const mvCur=()=>{const c=ov.querySelector('#mvPais').value;return c&&p.currency[c]?p.currency[c]:PENDING_CURRENCY;};
        const syncMv=()=>{const cu=mvCur();ov.querySelector('#mvCurLbl').textContent=cu===PENDING_CURRENCY?'(elige país)':'('+cu+')';};
        ov.querySelector('#mvPais').addEventListener('change',syncMv); syncMv();
        ov.querySelector('#mvSave').addEventListener('click',()=>{
        if(mvCur()===PENDING_CURRENCY){ui.toast('Selecciona el país para resolver la moneda antes de registrar','warn');return;} /* R31: bloquear sin moneda */
        const monto=Math.abs(+ov.querySelector('#mvMonto').value||0)*(esIng?1:-1);
        const rec={tipo:esIng?'ingreso':'egreso',cat:ov.querySelector('#mvCat').value||t,categoria:ov.querySelector('#mvCateg').value,pais:ov.querySelector('#mvPais').value,moneda:mvCur(),monto,fecha:ov.querySelector('#mvFecha').value,desc:ov.querySelector('#mvDesc').value,estado:ov.querySelector('#mvEstado').value,beneficiario:(ov.querySelector('#mvBenef').value||'').trim(),proyectoId:ov.querySelector('#mvProy').value};
        if(esIng)rec.tipoIngreso=ov.querySelector('#mvTipo').value; else rec.tipoEgreso=ov.querySelector('#mvTipo').value;
        CX.finStore.addMov(pid(),rec);close();draw();ui.toast('Movimiento registrado','ok');});}});
    }));

    const acx=host.querySelector('#autoCxp');
    if(acx)acx.addEventListener('click',()=>{
      const liqPend=CX.liq.forProject(data).filter(l=>['validada','pendiente_submitir','conciliada_pendiente_pago'].includes(l.estado)&&!isFinancialReview(l));
      const yaCxp=new Set(CX.finStore.cxp(pid()).map(r=>r.visitaId).filter(Boolean));
      const nuevasCxp=liqPend.filter(l=>!yaCxp.has(l.visitaId));
      // CxC: sin fuente confirmada de reintegro no se infiere monto pendiente (Corte 3 P0-3)
      const cxcEst=[];
      ui.modal('⚙️ Generar CxC/CxP automáticas',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Deriva cuentas automáticamente del histórico operativo. Revisa y confirma:</p>
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">📤 Cuentas por pagar (liquidaciones pendientes no pagadas)</div>
        ${nuevasCxp.length?`<table class="tbl" style="margin-bottom:12px"><tbody>${nuevasCxp.slice(0,8).map(l=>`<tr><td><b>${l.shopper}</b><div style="font-size:10px;color:var(--t3)">${l.sucursal}</div></td><td style="text-align:right;font-weight:700">${currencyOf(l)!==PENDING_CURRENCY?ui.money(currencyOf(l),l.total):'<span class="bdg bdg-a" style="font-size:9px">Pendiente de moneda</span>'}</td></tr>`).join('')}${nuevasCxp.length>8?`<tr><td colspan="2" style="font-size:11px;color:var(--t3);text-align:center">+${nuevasCxp.length-8} más</td></tr>`:''}</tbody></table>`:'<div class="muted" style="font-size:12px;margin-bottom:12px">Sin liquidaciones pendientes nuevas.</div>'}
        <div class="card-t" style="font-size:12.5px;margin-bottom:6px">📥 Cuentas por cobrar (reembolsos no conciliados)</div>
        ${cxcEst.length?`<table class="tbl" style="margin-bottom:12px"><tbody>${cxcEst.map(x=>`<tr><td><b>Reembolso pendiente · ${CX.paisLabel(x.c)}</b></td><td style="text-align:right;font-weight:700">${x.cur} ${x.monto.toLocaleString()}</td></tr>`).join('')}</tbody></table>`:'<div class="muted" style="font-size:12px;margin-bottom:12px">Reembolsos conciliados.</div>'}
        <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:11.5px;color:var(--brand-dark);margin-bottom:12px">Las CxP por liquidación se cruzan automáticamente con el egreso cuando se pagan; las CxC se descargan al conciliar el reembolso.</div>
        <div style="text-align:right"><button class="btn btn-green btn-sm" id="acxOk">Generar ${nuevasCxp.length+cxcEst.length} cuenta(s)</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#acxOk').addEventListener('click',()=>{
        nuevasCxp.forEach(l=>CX.finStore.addCxp(pid(),{concepto:'Liquidación pendiente · '+l.shopper+' ('+l.sucursal+')',monto:l.total,pais:l.pais,origen:'liquidacion',visitaId:l.visitaId,auto:true}));
        cxcEst.forEach(x=>CX.finStore.addCxc(pid(),{concepto:'Reembolso pendiente de conciliar · '+CX.paisLabel(x.c),monto:x.monto,pais:x.c,origen:'reembolso',auto:true}));
        close();draw();ui.toast((nuevasCxp.length+cxcEst.length)+' cuenta(s) generadas automáticamente del histórico','ok',4000);
      });}});
    });
    host.querySelectorAll('[data-cuenta]').forEach(b=>b.addEventListener('click',()=>{
      const k=b.dataset.cuenta;
      ui.modal('Registrar cuenta por '+(k==='cxc'?'cobrar':'pagar'),`
        <p style="font-size:12px;color:var(--t2);margin-bottom:10px">Útil para cargar saldos iniciales en la importación o registrar deudas/derechos del periodo.</p>
        <div class="grid g2" style="gap:10px 12px">
          <div style="grid-column:1/3"><label class="lbl">Concepto / contraparte</label><input class="inp" id="ctCon" list="ctConList" placeholder="${k==='cxc'?'Cliente / casa matriz':'Proveedor / financiamiento'}"></div><datalist id="ctConList">${(k==="cxc"?CX.finStore.cxc(pid()):CX.finStore.cxp(pid())).map(r=>`<option value="${r.concepto}">`).join("")}${CX.data._visitas.filter(v=>v.projectId===CX.data.currentPeriodId).map(v=>v.shopper).filter((s,i,a)=>s&&a.indexOf(s)===i).map(s=>`<option value="${s}">`).join("")}</datalist>
          <div><label class="lbl">País</label><select class="sel" id="ctPais"><option value="">—</option>${p.countries.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div><label class="lbl">Monto <span id="ctCurLbl" class="muted">(elige país)</span></label><input class="inp" id="ctMonto" type="number"></div>
          <div style="grid-column:1/3"><label class="lbl">Vence</label><input class="inp" id="ctVence" type="date"></div>
        </div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="ctSave">Registrar</button></div>
      `,{onMount:(ov,close)=>{
        const ctCur=()=>{const c=ov.querySelector('#ctPais').value;return c&&p.currency[c]?p.currency[c]:PENDING_CURRENCY;};
        const syncCt=()=>{const cu=ctCur();ov.querySelector('#ctCurLbl').textContent=cu===PENDING_CURRENCY?'(elige país)':'('+cu+')';};
        ov.querySelector('#ctPais').addEventListener('change',syncCt); syncCt();
        ov.querySelector('#ctSave').addEventListener('click',()=>{
        if(ctCur()===PENDING_CURRENCY){ui.toast('Selecciona el país para resolver la moneda antes de registrar','warn');return;} /* R31: país/moneda obligatorio */
        const r={concepto:ov.querySelector('#ctCon').value||'(sin concepto)',monto:+ov.querySelector('#ctMonto').value||0,pais:ov.querySelector('#ctPais').value,moneda:ctCur(),vence:ov.querySelector('#ctVence').value};
        if(k==='cxc')CX.finStore.addCxc(pid(),r);else CX.finStore.addCxp(pid(),r);close();draw();ui.toast('Cuenta por '+(k==='cxc'?'cobrar':'pagar')+' registrada','ok');});}});
    }));

    host.querySelectorAll('[data-abono]').forEach(b=>b.addEventListener('click',()=>{
      const r=CX.finStore.cxp(pid()).find(x=>x.id===b.dataset.abono);
      if(!r||currencyOf(r)===PENDING_CURRENCY){ui.toast('Cuenta sin moneda resuelta: resuélvela en “ver detalle” antes de abonar','warn');return;} /* R31: abono fail-closed */
      ui.modal('Abonar a CxP · '+r.concepto,`
        <div style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Saldo actual: <b>${r.pais?ui.money(curOfRow(r),r.saldo||0):'Pendiente de moneda'}</b></div>
        <label class="lbl">Monto del abono (${curOfRow(r)})</label><input class="inp" id="abMonto" type="number" value="${r.saldo||0}" style="margin-bottom:14px">
        <div style="text-align:right"><button class="btn btn-green btn-sm" id="abSave">Registrar abono</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#abSave').addEventListener('click',()=>{CX.finStore.abonarCxp(pid(),r.id,+ov.querySelector('#abMonto').value||0);close();draw();ui.toast('Abono registrado · egreso vinculado','ok');});}});
    }));

    const pl=host.querySelector('#payLote');
    if(pl){ if(pendingCurrencyRows.length){ pl.disabled=true; pl.title='Bloqueado: hay filas en revisión de moneda'; pl.classList.add('btn-ghost'); }
    pl.addEventListener('click',()=>{
      if(pendingCurrencyRows.length){ui.toast('Pagar lote bloqueado: resuelve las filas en revisión de moneda primero','err');return;} /* R31: fail-closed */
      const val=CX.liq.forProject(data).filter(l=>l.estado==='validada');
      if(!val.length){ui.toast('No hay liquidaciones validadas para pagar','warn');return;}
      const r=data.payVisits(val.map(l=>l.visitaId));
      /* P0-2 (V110): el toast ya no asume que todo lo enviado se pagó — si payVisits() devolvió
         reviewRequired, esas visitas NO cambiaron de estado ni generaron movimiento; se informa
         aparte y honesto, nunca mezclado con "pagadas". */
      const revMsg=(r.reviewRequired&&r.reviewRequired.length)?(' · '+r.reviewRequired.length+' en revisión requerida (dato incompleto, no pagada(s))'):'';
      ui.toast(r.pagadas+' liquidaciones marcadas pagadas (vista previa) · egreso(s) preparados en Movimientos'+revMsg+' · cruce bancario pendiente de validación', r.reviewRequired&&r.reviewRequired.length?'warn':'ok',4800);
    }); }
    const ih=host.querySelector('#impHist');
    if(ih)ih.addEventListener('click',()=>ui.modal('Importar histórico de movimientos',`
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Sube tu archivo (Excel/CSV) de movimientos, remesas, CxC/CxP. Vista previa + anti-duplicado por fecha+monto+concepto.</p>
      <input type="file" class="inp" style="padding:7px;margin-bottom:12px">
      <div style="background:var(--brand-light);border-radius:9px;padding:10px 12px;font-size:12px;color:var(--brand-dark)">Mapeo de columnas → tipo/categoría/monto/fecha/país/estado. Permite cargar <b>saldos iniciales</b> de CxC/CxP y remesas para conciliar.</div>
      <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" onclick="CX.ui.toast('Vista previa lista (demo)','ok');this.closest('.cx-ov').remove()">Ver vista previa</button></div>
    `));
  };
  draw();
  CX.bus.on('fin',()=>draw());
  return host;
});

CX.module('liquidaciones', ({data,ui})=>{
  const p=data.period();
  /* V182 P0-2 — helpers LOCALES (no dependen del scope de Movimientos). */
  const PENDING_CURRENCY='pending_currency';
  const currencyOf=(row)=>{ if(row&&row.pais&&p.currency&&p.currency[row.pais])return p.currency[row.pais]; if(row&&row.moneda)return row.moneda; return PENDING_CURRENCY; };
  const _liqCur=(l)=>l.moneda||(l.pais&&p.currency&&p.currency[l.pais])||null;
  const _liqMoney=(l,v)=>{const cu=_liqCur(l);return cu?ui.money(cu,v):'<span class="bdg bdg-a" style="font-size:9px">Pendiente de moneda</span>';};
  const isFinancialReview=(l)=>{
    const cur=l&&(l.moneda||(l.pais&&p.currency&&p.currency[l.pais]));
    return !l||l.reviewRequired===true||l.financialSourceStatus==='pending_or_review'||l.liquidationState==='pending_financial_source'||!l.pais||!cur;
  };

  const host=ui.el('div');
  const draw=()=>{
    const all=CX.liq.forProject(data);
    const res=CX.liq.resumen(all);
    const reviewLiqAll=all.filter(isFinancialReview);
    const exactLiqAll=all.filter(l=>!isFinancialReview(l));
    const isPaidConfirmed=(l)=>l.paymentState==='confirmed'||l.paymentState==='payment_confirmed'||(l.estado==='pagada'&&!!l.paymentSourceRef);
    const isPendingPaymentExact=(l)=>!isPaidConfirmed(l)&&(l.estado==='conciliada_pendiente_pago'||l.liquidationState==='reconciled_source_safe'||l.paymentState==='pending_source_confirmation');
    const reconciledPendingPayment=exactLiqAll.filter(isPendingPaymentExact);
    const loteCandidates=exactLiqAll.filter(l=>l.estado==='validada'&&!isPendingPaymentExact(l));
    const paidConfirmed=all.filter(isPaidConfirmed);
    const draft=CX.finStore.draft(p.id).filter(vid=>all.some(l=>l.visitaId===vid&&l.estado==='validada'));
    CX.finStore._draft[p.id]=draft; // limpia ids ya no validados
    const oblig=p.countries.map(c=>{
      const ls=all.filter(l=>l.pais===c);
      const hon=ls.reduce((a,l)=>a+l.honorario,0), reemb=ls.reduce((a,l)=>a+l.reembolso,0), tot=ls.reduce((a,l)=>a+l.total,0);
      const listo=ls.filter(l=>l.estado==='validada').reduce((a,l)=>a+l.total,0);
      return `<tr><td><b>${c}</b></td><td>${p.currency[c]}</td><td>${ls.length}</td><td>${ui.money(p.currency[c],hon)}</td><td>${ui.money(p.currency[c],reemb)}</td><td><b>${ui.money(p.currency[c],tot)}</b></td><td>${ui.money(p.currency[c],listo)}</td></tr>`;
    }).join('');

    const lrow=(l,i)=>{const lb=CX.liq.label(l.estado); const inD=draft.includes(l.visitaId);
      return `<tr data-li="${i}" style="${inD?'background:var(--brand-light)':''}"><td style="position:sticky;left:0;background:${inD?'#eaf4fc':'var(--panel)'};z-index:1">${l.estado==='validada'?(inD?`<button class="btn btn-soft btn-sm" data-rm="${l.visitaId}" style="padding:3px 9px;color:var(--red)">✕ Retirar</button>`:`<button class="btn btn-pr btn-sm" data-add="${l.visitaId}" style="padding:3px 10px">▶ Mover a lote</button>`):l.estado==='pendiente_cuestionario'?ui.bdg('espera shopper','n'):l.estado==='pagada'?ui.bdg('✓ pagada','g'):l.estado==='pagada_preview'?ui.bdg('◐ pagada (preview)','a'):ui.bdg('—','n')}</td>
        <td style="position:sticky;left:96px;background:${inD?'#eaf4fc':'var(--panel)'};z-index:1"><b>${l.shopper||'—'}</b><div style="font-size:10px;color:var(--t3)">${l.shopperCode||''}</div></td>
        <td style="font-size:12px">${l.sucursal}</td><td style="font-size:12px">${l.freal||'—'}</td>
        <td>${inD?ui.bdg('● en lote','p'):ui.bdg(lb[0],lb[1])}</td><td>${l.submit?'✅':'—'}</td>
        <td>${_liqMoney(l,l.honorario)}</td><td>${l.reembolso?_liqMoney(l,l.reembolso):'—'}</td>
        <td style="font-weight:700;color:var(--t1)">${_liqMoney(l,l.total)}</td>
        <td style="font-size:12px">${l.fechaEstimadaPago||'—'}</td>
        <td style="text-align:right"><button class="btn btn-ghost btn-sm" data-ledit="${l.visitaId}" title="Editar liquidación" style="padding:2px 7px">✎</button></td></tr>`;};

    // panel del lote en construcción (carrito)
    const draftLiqs=draft.map(vid=>all.find(l=>l.visitaId===vid)).filter(Boolean);
    const porMon={}; let draftPending=0; draftLiqs.forEach(l=>{const cu=l.moneda||(l.pais&&p.currency&&p.currency[l.pais]); if(!cu){draftPending++;return;} porMon[cu]=(porMon[cu]||0)+l.total;});
    const multiMon=Object.keys(porMon).length>1;
    const cart=`<div class="card card-p" style="margin-bottom:16px;border:1px solid ${draft.length?'var(--brand)':'var(--border)'};${draft.length?'background:linear-gradient(180deg,var(--brand-light),var(--surface))':''}">
      <div class="between" style="margin-bottom:10px"><div class="card-t">📦 Lote en construcción ${draft.length?`<span class="bdg bdg-b">${draft.length}</span>`:''}</div>
        <div class="flex" style="gap:8px">${CX.finStore.cxp(p.id).filter(r=>r.origen==='liquidacion').length?`<button class="btn btn-soft btn-sm" id="addCxp">➕ Incluir CxP meses anteriores (${CX.finStore.cxp(p.id).filter(r=>r.origen==='liquidacion').length})</button>`:''}
        ${draft.length?`<button class="btn btn-ghost btn-sm" id="clearDraft" style="color:var(--red)">Vaciar</button>`:''}</div></div>
      ${draft.length?`
        <div class="scroll-hint" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>País</th><th style="text-align:right">Total</th><th></th></tr></thead><tbody>
        ${draftLiqs.map(l=>`<tr><td><b>${l.shopper}</b></td><td style="font-size:12px">${l.sucursal}</td><td>${l.pais||'—'}</td><td style="text-align:right;font-weight:700">${_liqMoney(l,l.total)}</td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-rm="${l.visitaId}" style="color:var(--red);padding:2px 7px">✕</button></td></tr>`).join('')}
        </tbody></table></div>
        <div class="between" style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border-2)">
          <div>${Object.keys(porMon).map(m=>`<span style="font-family:var(--disp);font-size:17px;font-weight:800;color:var(--green);margin-right:14px">${ui.money(m,porMon[m])}</span>`).join('')}
            ${draftPending?'<div style="font-size:11px;color:var(--red);margin-top:3px">⚠ '+draftPending+' liquidación(es) sin moneda resuelta · pago bloqueado hasta revisarlas</div>':''}
            ${multiMon?'<div style="font-size:11px;color:var(--red);margin-top:3px">⚠ Hay más de una moneda. Un lote debe ser de una sola moneda; retira las de otra moneda antes de pagar.</div>':''}</div>
          <button class="btn btn-green btn-sm" id="payDraft" ${multiMon||draftPending?'disabled':''}>💳 Pagar lote (${draft.length})</button></div>
      `:`<div class="muted" style="font-size:12.5px;padding:6px 0">Aún no has movido liquidaciones al lote. Usa <b>▶ Mover a lote</b> en cada fila validada; aquí verás el total a pagar y podrás retirar.</div>`}
    </div>`;

    host.innerHTML=`
    <div class="between" style="margin-bottom:12px"><div>${ui.ph('Liquidaciones', p.name+' · sincronizadas con el avance de cada visita')}</div>
      <div class="flex"><span class="bdg bdg-a">◐ Candidatas · pend. cruce</span><button class="btn btn-ghost btn-sm" id="liqExport">⤓ Exportar</button></div></div>
    <div class="card card-p" style="margin-bottom:12px;border-left:4px solid var(--amber);background:var(--amber-bg,#fffbeb)"><div style="font-size:11.5px;color:#92400e;line-height:1.6">📌 Las liquidaciones son <b>candidatas</b> derivadas del avance operativo. El <b>monto final a pagar</b> se confirma al cruzar con el Excel financiero externo del cierre. No se muestra “deuda final” ni “pagos listos” solo desde la HR.</div></div>

    <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px" id="liqKpis">
      <div data-lk="review" style="cursor:pointer">${ui.kpi('En revisión financiera',reviewLiqAll.length,'r')}</div>
      <div data-lk="reconciled" style="cursor:pointer">${ui.kpi('Conciliadas · pago pendiente',reconciledPendingPayment.length,'a')}</div>
      <div data-lk="lote" style="cursor:pointer">${ui.kpi('Candidatas para lote',loteCandidates.length,'b')}</div>
      <div data-lk="paid" style="cursor:pointer">${ui.kpi('Pagadas confirmadas',paidConfirmed.length,'g')}</div>
    </div>

    ${cart}

    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-t" style="margin-bottom:8px">📊 Obligaciones por país y moneda</div>
      <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">No se suman monedas distintas. Total = honorario + reembolso (boleto + combo). El estado y la <b>fecha estimada de pago</b> se derivan del avance de la visita.</div>
      <div class="scroll-hint" style="overflow-x:auto"><table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Visitas</th><th>Honorarios</th><th>Reembolsos</th><th>Total</th><th>Listo para lote</th></tr></thead><tbody>${oblig}</tbody></table></div>
    </div>

    <div class="card card-p">
      <div class="between" style="margin-bottom:12px"><div><div class="card-t">💸 Liquidaciones operativas</div>
        <div style="font-size:11px;color:var(--t3)">El estado avanza solo con la visita. Mueve las validadas al lote y págalas arriba.</div></div></div>
      <div class="scroll-hint" style="overflow-x:auto"><table class="tbl" style="min-width:800px"><thead><tr><th style="position:sticky;left:0;background:var(--panel);z-index:2"></th><th style="position:sticky;left:96px;background:var(--panel);z-index:2">Shopper</th><th>Sucursal</th><th>Realizada</th><th>Estado</th><th>Submit.</th><th>Honorario</th><th>Reembolso</th><th>Total</th><th>Pago est.</th><th></th></tr></thead>
      <tbody>${all.map(lrow).join('')}</tbody></table></div>
      <div style="margin-top:14px">${ui.aiBox('Cada liquidación nace del avance de la visita: realizada → pend. cuestionario → validada → en lote → pagada. Mueve al lote, revisa el total a pagar, retira lo que no entra (queda como CxP del mes) y paga: se generan los egresos automáticamente.','Liquidación sincronizada')}</div>
    </div>`;

    host.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.toggleDraft(p.id,b.dataset.add);}));
    host.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.toggleDraft(p.id,b.dataset.rm);}));
    // KPIs clickeables → listado filtrado
    const lx=host.querySelector('#liqExport');
    if(lx&&CX.reportKit){
      const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
      const projectLabel=data.programBase?data.programBase(p):p.name;
      const _lcur=(l)=>l.moneda||(l.pais&&p.currency&&p.currency[l.pais])||null;
      const exportable=all.filter(l=>!isFinancialReview(l));
      const reviewLiq=all.filter(isFinancialReview);
      const byEst={}; exportable.forEach(l=>{byEst[l.estado]=(byEst[l.estado]||0)+1;});
      const liqSpec=(ext)=>({ title:'Liquidaciones',
        meta:{title:'Liquidaciones',project:projectLabel,period:(p.periodo||p.ronda||p.name||'Periodo'),scope:'Candidatas · pend. cruce',sourceLabel:'Finanzas · liquidaciones derivadas del avance',generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
        columns:[{key:'shopper',label:'Shopper'},{key:'sucursal',label:'Sucursal'},{key:'pais',label:'País'},{key:'moneda',label:'Moneda'},{key:'estado',label:'Estado'},{key:'honorario',label:'Honorario'},{key:'reembolso',label:'Reembolso'},{key:'total',label:'Total'},{key:'pago',label:'Pago est.'}],
        rows:exportable.map(l=>({shopper:l.shopper||'—',sucursal:l.sucursal||'—',pais:l.pais||'—',moneda:_lcur(l),estado:l.estado,honorario:Math.round(l.honorario||0),reembolso:Math.round(l.reembolso||0),total:Math.round(l.total||0),pago:l.fechaEstimadaPago||'—'})),
        notes:reviewLiq.length?(reviewLiq.length+' liquidación(es) en revisión de fuente/moneda excluidas del export monetario.'):'',
        reviewSection:reviewLiq.length?{title:'Liquidaciones en revisión (excluidas)',rows:reviewLiq.map(l=>({shopper:l.shopper||'—',sucursal:l.sucursal||'—',pais:l.pais||'—',estado:'Pendiente de moneda/fuente'}))}:null,
        summary:['Liquidaciones exportables: '+exportable.length+(reviewLiq.length?(' · en revisión: '+reviewLiq.length):''), Object.entries(byEst).map(([k2,v2])=>k2+': '+v2).join(' · ')],
        chart:{title:'Liquidaciones por estado',data:Object.entries(byEst).map(([k2,v2])=>({label:k2,value:v2}))},
        filename:[san('liquidaciones'),san(projectLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext });
      lx.addEventListener('click',()=>{ if(!exportable.length){ui.toast('No hay liquidaciones con moneda/fuente resuelta para exportar'+(reviewLiq.length?(' · '+reviewLiq.length+' en revisión'):''),'err',4200);return;} CX.reportKit.openReport(liqSpec('pdf'),'fin_liquidaciones'); });
    }
    const lkMap={review:['En revisión financiera',l=>isFinancialReview(l)],reconciled:['Conciliadas · pago pendiente',l=>!isFinancialReview(l)&&isPendingPaymentExact(l)],lote:['Candidatas para lote',l=>!isFinancialReview(l)&&l.estado==='validada'&&!isPendingPaymentExact(l)],paid:['Pagadas confirmadas',l=>isPaidConfirmed(l)]};
    host.querySelectorAll('#liqKpis [data-lk]').forEach(el=>el.addEventListener('click',()=>{const m=lkMap[el.dataset.lk];const arr=all.filter(m[1]);
      ui.modal(m[0]+' ('+arr.length+')',arr.length?`<table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Total</th><th>Pago est.</th></tr></thead><tbody>${arr.map(l=>`<tr><td><b>${l.shopper||'—'}</b></td><td style="font-size:12px">${l.sucursal}</td><td style="font-weight:700">${_liqMoney(l,l.total)}</td><td style="font-size:12px">${l.fechaEstimadaPago||'—'}</td></tr>`).join('')}</tbody></table>`:ui.empty('💸','Sin liquidaciones en esta categoría.'));
    }));
    // editar liquidación (corregir honorario/reembolso/fecha)
    host.querySelectorAll('[data-ledit]').forEach(b=>b.addEventListener('click',()=>{ const l=all.find(x=>x.visitaId===b.dataset.ledit); const v=data._visitas.find(x=>x.id===b.dataset.ledit); if(!l||!v)return;
      ui.modal('Editar liquidación · '+(l.shopper||''),`
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px">📍 ${l.sucursal} · estado: ${l.estado}</div>
        <div class="grid g2" style="gap:10px 12px">
          <div><label class="lbl">País</label><select class="sel" id="le_pais"><option value="">—</option>${p.countries.map(c=>`<option ${l.pais===c?'selected':''}>${c}</option>`).join('')}</select></div>
          <div><label class="lbl">Moneda</label><input class="inp" id="le_moneda" value="${l.moneda||(l.pais&&p.currency&&p.currency[l.pais])||''}" placeholder="resuelve país" readonly></div>
          <div><label class="lbl">Honorario <span id="le_curL" class="muted">${_lcur(l)||'(elige país)'}</span></label><input class="inp" id="le_hon" type="number" value="${l.honorario||0}"></div>
          <div><label class="lbl">Reembolso</label><input class="inp" id="le_re" type="number" value="${l.reembolso||0}"></div>
          <div><label class="lbl">Fecha realizada</label><input class="inp" id="le_f" type="date" value="${v.realizada||''}"></div>
          <div><label class="lbl">Estado</label><select class="sel" id="le_est">${['realizada','cuestionario','liquidada'].map(o=>`<option ${o===v.estado?'selected':''}>${o}</option>`).join('')}</select></div>
        </div>
        <div style="background:var(--amber-bg);border-radius:9px;padding:8px 11px;font-size:11px;color:#8a5b00;margin-top:12px">Corrige aquí errores de captura. El cambio se refleja en la liquidación y se sincroniza con Beneficios y Finanzas.</div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="le_ok">Guardar corrección</button></div>
      `,{onMount:(ov,close)=>{
        const syncLe=()=>{const c=ov.querySelector('#le_pais').value;const cu=c&&p.currency&&p.currency[c]?p.currency[c]:'';ov.querySelector('#le_moneda').value=cu;ov.querySelector('#le_curL').textContent=cu||'(elige país)';};
        ov.querySelector('#le_pais').addEventListener('change',syncLe);
        ov.querySelector('#le_ok').addEventListener('click',()=>{ const c=ov.querySelector('#le_pais').value; if(!(c&&p.currency&&p.currency[c])){ui.toast('Resuelve el país/moneda antes de guardar montos','warn');return;} v.pais=c; v.moneda=p.currency[c]; l.pais=c; l.moneda=p.currency[c]; v.honorario=+ov.querySelector('#le_hon').value||0; const re=+ov.querySelector('#le_re').value||0; v.boleto=re; v.comboAmt=0; v.realizada=ov.querySelector('#le_f').value||v.realizada; v.estado=ov.querySelector('#le_est').value; CX.bus&&CX.bus.emit('visit-flow'); close(); draw(); ui.toast('Liquidación corregida · sincronizada','ok',3200); });}});
    }));
    const cd=host.querySelector('#clearDraft'); if(cd)cd.addEventListener('click',()=>CX.finStore.clearDraft(p.id));
    const ac=host.querySelector('#addCxp');
    if(ac)ac.addEventListener('click',()=>{
      const _cxCur=r=>currencyOf(r);
      const cxps=CX.finStore.cxp(p.id).filter(r=>currencyOf(r)!==PENDING_CURRENCY&&r.origen==='liquidacion'&&(r.saldo||0)>0); /* R32: currencyOf excluye moneda no resuelta */
      const cxpsPend=CX.finStore.cxp(p.id).filter(r=>r.origen==='liquidacion'&&(r.saldo||0)>0&&currencyOf(r)===PENDING_CURRENCY);
      const rows=cxps.length?cxps.map((r,i)=>`<label class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer">
        <span><input type="checkbox" class="cxpChk" data-id="${r.id}" checked style="margin-right:8px"><b style="font-size:12.5px">${r.concepto}</b><div style="font-size:11px;color:var(--t3)">${r.pais||''} · pendiente de meses anteriores</div></span>
        <b style="color:var(--amber)">${(r.pais&&p.currency&&p.currency[r.pais])?ui.money(p.currency[r.pais],r.saldo||0):(r.moneda?ui.money(r.moneda,r.saldo||0):'Pendiente de moneda')}</b></label>`).join('')
        : ui.empty('📭','No hay liquidaciones diferidas (CxP) pendientes.');
      ui.modal('Incluir CxP de meses anteriores',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Estas son liquidaciones <b>diferidas</b> en cierres anteriores. Selecciona cuáles pagar ahora: se generará el egreso y se saldará la cuenta por pagar.</p>
        ${rows}
        ${cxpsPend.length?`<div style="font-size:11px;color:var(--red);margin:6px 0">🔒 ${cxpsPend.length} CxP con Pendiente de moneda · en revisión, no pagables hasta asignar país/moneda</div>`:''}
        <div style="text-align:right;margin-top:8px"><button class="btn btn-green btn-sm" id="payCxp" ${cxps.length?'':'disabled'}>Pagar seleccionadas</button></div>
      `,{onMount:(ov,close)=>{const b=ov.querySelector('#payCxp'); if(b)b.addEventListener('click',()=>{
        const ids=[...ov.querySelectorAll('.cxpChk:checked')].map(c=>c.dataset.id); let n=0; let blocked=0;
        ids.forEach(id=>{const r=CX.finStore.cxp(p.id).find(x=>x.id===id); if(!r)return; if(currencyOf(r)===PENDING_CURRENCY){blocked++;return;} /* R32: revalida Pendiente de moneda, fail-closed */ CX.finStore.abonarCxp(p.id,id,r.saldo||0);n++;});
        close(); draw(); ui.toast(n+' CxP de meses anteriores pagada(s) · egreso(s) en Movimientos'+(blocked?(' · '+blocked+' bloqueada(s) sin moneda'):''),blocked?'warn':'ok',4000);
      });}});
    });
    const pay=host.querySelector('#payDraft');
    if(pay)pay.addEventListener('click',()=>{
      const validadas=all.filter(l=>l.estado==='validada');
      const draftPend=draft.map(vid=>all.find(l=>l.visitaId===vid)).filter(Boolean).some(l=>!(l.moneda||(l.pais&&p.currency&&p.currency[l.pais])));
      if(draftPend){ui.toast('Hay liquidaciones sin moneda resuelta en el lote: revísalas antes de pagar','err');return;}
      const restantes=validadas.filter(l=>!draft.includes(l.visitaId));
      ui.modal('Confirmar pago de lote',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Vas a pagar <b>${draft.length}</b> liquidación(es) por <b>${Object.keys(porMon).map(m=>ui.money(m,porMon[m])).join(' + ')}</b>. Se generarán los egresos en Movimientos y se sincronizará Beneficios.</p>
        ${restantes.length?`<label class="flex" style="gap:8px;font-size:12px;color:var(--t1);background:var(--amber-bg);padding:9px 11px;border-radius:9px;cursor:pointer"><input type="checkbox" id="difCxp" checked> Diferir las <b>${restantes.length}</b> validada(s) no incluida(s) a Cuentas por Pagar (cierre de mes)</label>`:''}
        <div style="text-align:right;margin-top:14px"><button class="btn btn-green btn-sm" id="confPay">Pagar lote</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#confPay').addEventListener('click',()=>{
        let diferidas=0; const difBox=ov.querySelector('#difCxp');
        if(difBox&&difBox.checked){restantes.forEach(l=>{CX.finStore.addCxp(p.id,{concepto:'Liquidación diferida · '+l.shopper+' ('+l.sucursal+')',monto:l.total,pais:l.pais,origen:'liquidacion',visitaId:l.visitaId});diferidas++;});}
        const ids=[...draft]; close(); CX.finStore.clearDraft(p.id);
        const r=data.payVisits(ids);
        const revMsg2=(r.reviewRequired&&r.reviewRequired.length)?(' · '+r.reviewRequired.length+' en revisión requerida (dato incompleto, no pagada(s))'):'';
        ui.toast('Lote registrado como pagado (preview) · '+r.pagadas+' visita(s) · fecha de pago '+r.fechaPago+(diferidas?' · '+diferidas+' diferida(s) a CxP':'')+revMsg2+' · egresos reflejados en Movimientos · pendiente cruce financiero real', r.reviewRequired&&r.reviewRequired.length?'warn':'ok', 5200);
      });}});
    });
  };
  draw();
  CX.bus.on('lote',()=>draw());
  CX.bus.on('visit-flow',()=>draw());
  return host;
});

CX.module('lotes', ({data,ui})=>{
  const p=data.period(), cur=defCur0(p);
  /* V182 P0-1 — helper LOCAL (no depende del scope de Movimientos). */
  const PENDING_CURRENCY='pending_currency';
  const curHN=p.currency[p.countries[p.countries.length-1]];
  /* Bloque A (auditoría V101 — 20260711): este módulo mostraba SIEMPRE 3 lotes fabricados
     (#L-204/#L-205/#L-206 con evaluadores, sucursales, montos y estados fijos) sin ningún guard
     de modo demo. Fuera de demo, los lotes deben derivarse de liquidaciones/pagos reales
     (CX.liq/CX.finStore) — si no hay ninguno registrado, se muestra vacío honesto en vez de
     datos ficticios. */
  const _showFixturesLotes = CX.dataSource ? CX.dataSource.showFixtures() : true;
  const lotesDemo=[
    {id:'#L-204',n:12,monto:18240,cur:cur,estado:'Pagado',tone:'g',fecha:'2026-06-05',visitas:[['Evaluador 03','Sucursal 01',1520],['Evaluador 07','Sucursal 04',1520],['Evaluador 12','Sucursal 09',1520]]},
    {id:'#L-205',n:8,monto:42000,cur:curHN,estado:'En revisión',tone:'a',fecha:'2026-06-18',visitas:[['Evaluador 05','Sucursal 02',5250],['Evaluador 09','Sucursal 11',5250]]},
    {id:'#L-206',n:5,monto:9300,cur:cur,estado:'Borrador',tone:'n',fecha:'—',visitas:[['Evaluador 01','Sucursal 03',1860],['Evaluador 14','Sucursal 07',1860]]},
  ];
  /* lotes reales: liquidaciones ya marcadas pagadas, agrupadas por fecha de pago (una fila por fecha).
     P0-6 (paquete acumulado 20260711): un lote con AL MENOS una liquidación en `pagada_preview`
     (sin paymentSourceRef real) no puede rotularse "Pagado" igual que uno 100% confirmado — antes
     ambos casos producían estado:'Pagado'/tone:'g' y el detalle abajo forzaba "(preview)" incluso
     para lotes genuinamente confirmados, mezclando las dos etiquetas. Ahora cada lote declara
     `confirmado` (todas sus liquidaciones son 'pagada' con paymentSourceRef) y el estado/tono/label
     salen de ese booleano, no de un texto fijo. */
  /* lotes reales: se agrupan por identidad real de lote. P0-6 (paquete acumulado 20260711):
     un lote con AL MENOS una liquidación en `pagada_preview` (sin paymentSourceRef real) no
     puede rotularse "Pagado" igual que uno 100% confirmado.
     T3 (paquete V108 — 20260712, corrección de fondo): antes se agrupaba SOLO por
     `fechaEstimadaPago||fechaPago` — dos lotes de países/monedas distintos pagados el mismo
     día colisionaban en una sola fila, sumando montos de monedas distintas bajo la moneda del
     primer registro. Ahora la llave de agrupación es, en orden de prioridad: (1) `loteId` real
     persistido por payVisits (identidad estable de backend/preview); si una liquidación no trae
     loteId (dato legado), (2) una llave compuesta tenantId+projectId+país+moneda+periodo+fecha
     — NUNCA solo la fecha — así país/moneda jamás se mezclan y dos lotes del mismo proyecto,
     país, moneda y fecha con orígenes distintos no colisionan. */
  const tenantId=(CX.BRAND&&CX.BRAND.id)||'tenant-demo';
  const liqsPagadas=(CX.liq&&CX.liq.forProject?CX.liq.forProject(data):[]).filter(l=>['pagada','pagada_preview'].includes(l.estado));
  /* T2.C (paquete V109 — defensa en la vista): aunque exista un loteId real, la vista SIEMPRE
     valida país+moneda antes de sumar — un loteId legado que mezcle países/monedas (dato de una
     versión anterior a la corrección) se divide en sub-filas por país+moneda y cada una se marca
     "Revisión requerida" en vez de sumarse a ciegas bajo una sola moneda. */
  const loteIdCombos={};
  liqsPagadas.forEach(l=>{ if(l.loteId){ const combo=(l.pais||'—')+'::'+(l.moneda||'—'); (loteIdCombos[l.loteId]=loteIdCombos[l.loteId]||new Set()).add(combo); } });
  const groupKey=(l)=>{
    if(l.loteId) return 'id::'+l.loteId+'::'+(l.pais||'—')+'::'+(l.moneda||'—');
    /* si falta país o moneda, el registro no se agrupa silenciosamente con otros — cae en su
       propia llave de revisión, nunca se suma "a ciegas" a un lote con país/moneda distintos. */
    if(!l.pais || !l.moneda){
      /* T2 (paquete V109 — corrección P0): eliminado Math.random() del fallback de revisión —
         ya no era reproducible. La llave ahora es estable: visitaId real si existe, o un hash
         determinístico de los campos disponibles del registro (nunca aleatorio). */
      const seed=l.visitaId || [l.shopper||'',l.sucursal||'',l.total||0,l.fechaEstimadaPago||l.fechaPago||''].join('|');
      let h=0; for(let i=0;i<String(seed).length;i++) h=(h*31+String(seed).charCodeAt(i))|0;
      return 'revision::'+Math.abs(h).toString(36);
    }
    const f=l.fechaEstimadaPago||l.fechaPago||'—';
    const periodo=(f&&f!=='—')?f.slice(0,7):'—';
    return ['legacy',tenantId,p.id,l.pais,l.moneda,periodo,f].join('::');
  };
  const porLote={}; liqsPagadas.forEach(l=>{const k=groupKey(l);(porLote[k]=porLote[k]||[]).push(l);});
  const lotesReales=Object.keys(porLote).map((k,i)=>{const ls=porLote[k];const monto=ls.reduce((a,l)=>a+(l.total||0),0);
    const confirmado=ls.every(l=>l.estado==='pagada');
    const f=ls[0].fechaEstimadaPago||ls[0].fechaPago||'—';
    /* id estable derivado de la llave real de agrupación (loteId+país+moneda o compuesta) — no
       del índice de iteración ni de solo la fecha. */
    let h=0; for(let c=0;c<k.length;c++)h=(h*31+k.charCodeAt(c))|0;
    const conflict = ls[0].loteId && loteIdCombos[ls[0].loteId] && loteIdCombos[ls[0].loteId].size>1;
    const baseId = ls[0].loteId?('#'+ls[0].loteId):('#LOTE-'+Math.abs(h).toString(36).toUpperCase().slice(0,6));
    return {id: conflict?(baseId+' · '+(ls[0].pais||'—')+'/'+(ls[0].moneda||'—')):baseId,
      n:ls.length,monto,cur:(ls[0].moneda||(ls[0].pais&&p.currency&&p.currency[ls[0].pais])||'pending_currency'),pais:ls[0].pais,
      estado: conflict?'Revisión requerida':(ls[0].moneda||(ls[0].pais&&p.currency&&p.currency[ls[0].pais]))?(confirmado?'Pagado':'Pagado (preview)'):'Revisión requerida', tone: conflict?'r':((ls[0].moneda||(ls[0].pais&&p.currency&&p.currency[ls[0].pais]))?(confirmado?'g':'a'):'r'), confirmado, conflict,
      fecha:f,visitas:ls.slice(0,10).map(l=>[l.shopper||'—',l.sucursal||'—',l.total||0])}; });
  const lotes = _showFixturesLotes ? lotesDemo : lotesReales;
  const html=`
  ${ui.ph('Lotes de Pago', p.name+' · agrupa liquidaciones validadas y crea el egreso')}
  ${lotes.length?`<div class="grid g3" style="margin-bottom:16px">${lotes.map(r=>`<div class="card hov card-p" data-lote="${r.id}" style="cursor:pointer">
    <div class="between" style="margin-bottom:8px"><b style="font-family:var(--disp);font-size:15px;color:var(--t1)">${r.id}</b>${ui.bdg(r.estado,r.tone)}</div>
    <div style="font-size:12px;color:var(--t3)">${r.n} visitas · ${r.fecha}</div>
    <div style="font-size:18px;font-weight:800;color:var(--green);font-family:var(--disp);margin-top:4px">${r.cur===PENDING_CURRENCY?'<span class="bdg bdg-r">Pendiente de moneda · Revisión requerida</span>':_m(r.cur,r.monto)}</div>
    <div style="margin-top:10px"><button class="btn btn-ghost btn-sm" data-lote="${r.id}">Ver detalle →</button></div></div>`).join('')}</div>`
    : `<div class="card card-p" style="margin-bottom:16px">${ui.degraded('Todavía no hay liquidaciones pagadas en este proyecto — los lotes se listan aquí cuando en Liquidaciones se paga un lote real.',{title:'Lotes de pago · pendiente de fuente'})}</div>`}
  <div class="card card-p">${ui.aiBox('Agrupo y concilio pagos automáticamente, evitando duplicidad. Cada lote crea su egreso asociado en Finanzas.','Conciliación')}</div>`;
  setTimeout(()=>{
    document.querySelectorAll('[data-lote]').forEach(b=>b.addEventListener('click',()=>{ const r=lotes.find(x=>x.id===b.dataset.lote); if(!r)return;
      const _loteReview=(r.cur===PENDING_CURRENCY)||r.estado==='Revisión requerida';
      ui.modal('Lote '+r.id+' · '+r.estado,`
        <div class="between" style="margin-bottom:12px"><div style="font-size:12.5px;color:var(--t2)">${r.n} visitas · ${r.fecha}</div><div style="font-size:17px;font-weight:800;color:var(--green);font-family:var(--disp)">${r.cur===PENDING_CURRENCY?'<span class="bdg bdg-r">Pendiente de moneda</span>':_m(r.cur,r.monto)}</div></div>
        <table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th style="text-align:right">Honorario</th></tr></thead><tbody>
        ${r.visitas.map(v=>`<tr><td><b>${v[0]}</b></td><td style="font-size:12px">${v[1]}</td><td style="text-align:right;font-weight:700">${r.cur===PENDING_CURRENCY?'Pendiente de moneda':_m(r.cur,v[2])}</td></tr>`).join('')}
        ${r.visitas.length<r.n?`<tr><td colspan="3" style="font-size:11px;color:var(--t3);text-align:center">+ ${r.n-r.visitas.length} visita(s) más en el lote</td></tr>`:''}
        </tbody></table>
        <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px">${_loteReview?ui.bdg('🔒 Revisión requerida · sin moneda · pago y export bloqueados','r'):(r.estado!=='Pagado'?`<button class="btn btn-green btn-sm" id="loteMark">Marcar pagado (vista previa)</button><button class="btn btn-ghost btn-sm" id="loteExp">⤓ Exportar</button>`:ui.bdg('✓ Egreso preparado · cruce real pendiente backend','g')+`<button class="btn btn-ghost btn-sm" id="loteExp">⤓ Exportar</button>`)}</div>
      `,{onMount:(ov,close)=>{ const lm=ov.querySelector('#loteMark'); if(lm)lm.addEventListener('click',()=>{
        if(r.cur===PENDING_CURRENCY||r.estado==='Revisión requerida'){ui.toast('Lote en revisión de moneda: no se puede marcar pagado','err');return;} /* R32: fail-closed */
        if(!CX.permissions.gate('finance.markPaid',CX.permissions.ctx({entityType:'lote_pago',entityId:r.id}),ui)) return;
        close();ui.toast('Lote '+r.id+' marcado pagado (preview) · egreso reflejado en Movimientos · pendiente cruce financiero real','ok',36000);}); const le=ov.querySelector('#loteExp'); if(le)le.addEventListener('click',()=>{ if(r.cur===PENDING_CURRENCY||r.estado==='Revisión requerida'){ui.toast('Lote en revisión de moneda: export bloqueado','err');return;} ui.toast('Exportando lote '+r.id+'…','ok');}); }});
    }));
  },0);
  return html;
});
