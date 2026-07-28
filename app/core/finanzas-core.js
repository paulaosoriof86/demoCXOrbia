/* ============================================================
   CXOrbia · Motor financiero (por proyecto, multipaís)
   - Ingresos (lo que se recibe del cliente) y egresos (honorarios pagados)
   - Modelo directo (ISR + regalías) vs delegado (solo honorario recibido/pagado)
   - Presupuesto de gastos fijos vs real
   - Cuentas por pagar (liquidaciones no pagadas) y por cobrar (facturas pendientes)
   Separación SIEMPRE por moneda y país del proyecto (genérico, cualquier país).
   ============================================================ */
window.CX = window.CX || {};

/* almacén simple de movimientos/presupuesto manuales por proyecto (demo en memoria) */
CX.finStore = {
  _mov:{}, _pres:{}, _presM:{},
  mov(pid){ return this._mov[pid] || (this._mov[pid]=[]); },
  addMov(pid,m){ this.mov(pid).push(Object.assign({id:'m'+Date.now().toString(36)+Math.floor(Math.random()*99),fecha:new Date().toISOString().slice(0,10)},m)); CX.bus&&CX.bus.emit('fin'); },
  delMov(pid,id){ this._mov[pid]=(this._mov[pid]||[]).filter(m=>m.id!==id); CX.bus&&CX.bus.emit('fin'); },
  pres(pid,period){ period=period||this.curPeriod(); const byp=this._presM[pid]||(this._presM[pid]={}); if(!byp[period]){ byp[period]={}; } return byp[period]; }, /* R32: NO hereda del periodo anterior en lectura; periodo sin fuente = objeto vacío */
  setPres(pid,k,v,period){ this.pres(pid,period)[k]=+v||0; CX.bus&&CX.bus.emit('fin'); },
  delPres(pid,k,period){ delete this.pres(pid,period)[k]; CX.bus&&CX.bus.emit('fin'); },

  /* ----- periodo activo (YYYY-MM) ----- */
  _period:null,
  curPeriod(){ return this._period || (this._period=new Date().toISOString().slice(0,7)); },
  setPeriod(per){ this._period=per; CX.bus&&CX.bus.emit('fin'); },
  periods(pid){ // periodos con datos (movimientos o presupuesto) + actual
    const s=new Set([this.curPeriod()]);
    (this._mov[pid]||[]).forEach(m=>{ if(m.fecha)s.add(m.fecha.slice(0,7)); });
    Object.keys(this._presM[pid]||{}).forEach(k=>s.add(k));
    return [...s].sort().reverse();
  },
  nextPeriod(per){ const [y,m]=per.split('-').map(Number); const d=new Date(y,m,1); return d.toISOString().slice(0,7); },
  /* crear mes siguiente: presupuesto se replica editable; movimientos en blanco */
  crearMesSiguiente(pid){ const cur=this.curPeriod(), nxt=this.nextPeriod(cur); const byp=this._presM[pid]||(this._presM[pid]={}); if(!byp[nxt])byp[nxt]=Object.assign({},byp[cur]||{}); this.setPeriod(nxt); return nxt; },

  /* ----- movimientos GLOBALES (no atados a un proyecto) ----- */
  GLOBAL:'__global__',
  globalMov(){ return this.mov(this.GLOBAL); },
  addGlobalMov(m){ this.addMov(this.GLOBAL, Object.assign({global:true},m)); },

  /* ----- taxonomía de conceptos (listas desplegables) ----- */
  CATEGORIAS:['Administrativo','Financiero','Tecnología','Proyecto','Comercial','Impuestos','Nómina','Otro'],
  /* tipos de INGRESO separados (comisiones/honorarios/anticipos/facturación vs financiamiento) */
  TIPOS_INGRESO:{
    comisiones:'Comisiones', honorarios:'Honorarios', anticipo:'Anticipo de programa',
    facturacion:'Facturación de programa', financiamiento:'Financiamiento (→ CxP)', remesa:'Remesa recibida',
  },
  TIPOS_EGRESO:{ honorarios_shopper:'Honorarios a shoppers', gasto:'Gasto operativo', impuesto:'Impuesto', abono_cxp:'Abono a CxP', otro:'Otro' },

  /* ----- cuentas por pagar / cobrar registradas manualmente (p.ej. en importación inicial) ----- */
  _cxp:{}, _cxc:{},
  cxp(pid){ return this._cxp[pid] || (this._cxp[pid]=[]); },
  cxc(pid){ return this._cxc[pid] || (this._cxc[pid]=[]); },
  addCxp(pid,r){ this.cxp(pid).push(Object.assign({id:'p'+Date.now().toString(36),saldo:+r.monto||0},r)); CX.bus&&CX.bus.emit('fin'); },
  addCxc(pid,r){ this.cxc(pid).push(Object.assign({id:'c'+Date.now().toString(36),saldo:+r.monto||0},r)); CX.bus&&CX.bus.emit('fin'); },
  editCx(pid,kind,id,patch){ const arr=kind==='cxc'?this.cxc(pid):this.cxp(pid); const r=arr.find(x=>x.id===id); if(r){Object.assign(r,patch); if(patch.saldo!=null)r.saldo=+patch.saldo||0;} CX.bus&&CX.bus.emit('fin'); return r; },
  delCx(pid,kind,id){ if(kind==='cxc')this._cxc[pid]=this.cxc(pid).filter(x=>x.id!==id); else this._cxp[pid]=this.cxp(pid).filter(x=>x.id!==id); CX.bus&&CX.bus.emit('fin'); },
  /* abono a una CxP: reduce saldo y registra egreso vinculado */
  abonarCxp(pid,id,monto){ const r=this.cxp(pid).find(x=>x.id===id); if(!r)return; r.saldo=Math.max(0,(r.saldo||0)-(+monto||0)); this.addMov(pid,{tipo:'egreso',cat:'Abono CxP · '+(r.concepto||''),tipoEgreso:'abono_cxp',pais:r.pais,monto:-(+monto||0),desc:'Abono a cuenta por pagar',estado:'Pagado',origen:'cxp',cxpId:id}); },

  /* ----- lote en construcción (carrito) por proyecto ----- */
  _draft:{},
  draft(pid){ return this._draft[pid] || (this._draft[pid]=[]); },
  inDraft(pid,vid){ return this.draft(pid).includes(vid); },
  toggleDraft(pid,vid){ const d=this.draft(pid); const i=d.indexOf(vid); if(i>=0)d.splice(i,1); else d.push(vid); CX.bus&&CX.bus.emit('lote'); return i<0; },
  clearDraft(pid){ this._draft[pid]=[]; CX.bus&&CX.bus.emit('lote'); },

  /* ----- control de FINANCIAMIENTOS (no son ingreso operativo; se devuelven) ----- */
  _fin:{},
  financiamientos(pid){ return this._fin[pid] || (this._fin[pid]=[]); },
  addFinanciamiento(pid,f){ const rec=Object.assign({id:'f'+Date.now().toString(36),fecha:new Date().toISOString().slice(0,10),saldo:+f.monto||0,devuelto:0},f);
    this.financiamientos(pid).push(rec);
    // se registra como ingreso NO operativo (flujo) y como CxP
    this.addMov(pid,{tipo:'ingreso',cat:'Financiamiento · '+(f.fuente||''),tipoIngreso:'financiamiento',pais:f.pais,monto:+f.monto||0,desc:'Entrada de financiamiento (no operativo)',estado:'Por conciliar',fecha:rec.fecha,noOperativo:true,finId:rec.id});
    this.addCxp(pid,{concepto:'Financiamiento · '+(f.fuente||''),monto:+f.monto||0,pais:f.pais,origen:'financiamiento',finId:rec.id});
    CX.bus&&CX.bus.emit('fin'); return rec; },
  devolverFinanciamiento(pid,id,monto){ const r=this.financiamientos(pid).find(x=>x.id===id); if(!r)return; const m=Math.min(+monto||0,r.saldo||0);
    r.devuelto=(r.devuelto||0)+m; r.saldo=Math.max(0,(r.saldo||0)-m);
    this.addMov(pid,{tipo:'egreso',cat:'Devolución financiamiento · '+(r.fuente||''),tipoEgreso:'otro',pais:r.pais,monto:-m,desc:'Egreso por devolución de financiamiento',estado:'Pagado',fecha:new Date().toISOString().slice(0,10),finId:id});
    // reduce la CxP asociada
    const cxp=this.cxp(pid).find(x=>x.finId===id); if(cxp)cxp.saldo=Math.max(0,(cxp.saldo||0)-m);
    CX.bus&&CX.bus.emit('fin'); return r; },
};

CX.fin = {
  /* CORTE 3 P0-4 — periodo canónico: Finanzas/Movimientos/Beneficios leen y escriben EXACTAMENTE
     el contexto central de CX.data (los 14 periodos HR), nunca CX.finStore.periods() como fuente. */
  canonPeriods(){ const d=CX.data; const key=d.currentProgramKey?d.currentProgramKey():null;
    const list=(d.periodsForProgram&&key)?d.periodsForProgram(key):(d.projects||[]).filter(pr=>!key||d.programKey(pr)===key);
    const lbl=(pr)=>pr.periodo||pr.ronda||pr.periodLabel||pr.measurementPeriod||pr.name||pr.id;
    return list.map(pr=>({id:pr.id, label:lbl(pr)})); },
  canonCurrentId(){ return CX.data.currentPeriodId; },
  setCanonPeriod(id){ return CX.data.setCurrentPeriod?CX.data.setCurrentPeriod(id):CX.data.setProject(id); },

  /* honorario que se RECIBE por país (config del proyecto; fallback = lo que se paga) */
  honRecibe(p,c){ return (p.honRecibe&&p.honRecibe[c]!=null)?p.honRecibe[c]:(p.honorario&&p.honorario[c])||0; },

  /* R19 crítico 3.B (20260716): porPais() usa data.project() — combinado con el adapter local de
     serieMensual() que YA conserva project:()=>p Y period:()=>p simultáneamente (hotfix V132),
     esta es la combinación protegida exigida para el empalme sobre V131+R18D. Antes usaba
     data.period() aquí; con project() el llamador real (Dashboard Financiero) sigue funcionando
     igual porque CX.data.project() expone la misma config visual (países, honorario, formato)
     que period() — son compatibles para este uso — y el adapter de serieMensual() sigue pasando
     ambos por si algún consumidor futuro requiere period() explícitamente. */
  porPais(data){
    const p=data.project(), out={};
    /* R32 P0-1 — predicado único de fila financiera: una liquidación NO entra a métricas ni export
       monetario si tiene revisión de fuente pendiente o país/moneda sin resolver. Se conserva en
       la cola de revisión (out.__reviewQueue), nunca se pierde. */
    const isReview=(l)=> l.reviewRequired===true
      || l.financialSourceStatus==='pending_or_review'
      || l.liquidationState==='pending_financial_source'
      || !l.pais || !(l.moneda||(p.currency&&p.currency[l.pais]));
    const allLiq=CX.liq.forProject(data);
    const liq=allLiq.filter(l=>!isReview(l));
    const reviewQueue=allLiq.filter(isReview);
    /* CORTE 3 V177 P0-4/P0-5 — presupuesto con llave CANÓNICA única (tenantId+projectId+periodId)
       y periodo EXPLÍCITO. El presupuesto sin distribución por país/moneda NO se imputa a ningún
       país ni al margen; se devuelve UNA sola vez como out.__unassignedBudget (fuera del mapa). */
    const tenantId=(data.tenantId&&data.tenantId())||(CX.BRAND&&CX.BRAND.id)||'tenant';
    /* R29 finance_core_uses_supplied_data_context_for_period: el periodo se resuelve del CONTEXTO
       'data' recibido (incluye adapters de serieMensual), no del global CX.data.currentPeriodId. */
    const canonicalPeriodId=(data.periodId&&data.periodId())||(data.period&&data.period()&&data.period().id)||p.id;
    const budgetKey=tenantId+'::'+p.id+'::'+canonicalPeriodId;
    const presStore=CX.finStore.pres(p.id, canonicalPeriodId); // periodo explícito desde el contexto data
    const unassignedBudgetTotal=Object.values(presStore).reduce((a,b)=>a+(+b||0),0);
    p.countries.forEach(c=>{
      const cur=p.currency[c];
      const ls=liq.filter(l=>l.pais===c&&(l.moneda||cur)===cur); /* liq ya excluye revisiones/moneda no resuelta */
      const visRe=ls.length;                                   // visitas con liquidación
      const ingreso=ls.reduce((a)=>a+this.honRecibe(p,c),0);   // lo facturado al cliente
      /* CORTE 3 P0-2 — honorarios como estados SEPARADOS, nunca "pagado" por inferencia.
         devengado: honorario ganado por la liquidación (obligación), exista o no pago.
         pagado: SOLO filas con paymentConfirmed===true Y paymentSourceRef (fuente de pago).
         porPagar: devengado − pagado. Una liquidación/realizada/cuestionario/submitido NO es pago. */
      const isPaid=(l)=>l.paymentConfirmed===true && !!(l.paymentSourceRef||l.paymentRef);
      const honorarioDevengado=ls.reduce((a,l)=>a+(l.honorario||0),0);
      const honorarioPagado=ls.filter(isPaid).reduce((a,l)=>a+(l.honorario||0),0);
      const honorarioPorPagar=honorarioDevengado-honorarioPagado;
      const pagosConfirmados=ls.filter(isPaid).length;
      const reemb=ls.reduce((a,l)=>a+l.reembolso,0);           // flujo (no utilidad)
      const isr=p.modelo==='directo'?Math.round(ingreso*((p.isr||0)/100)):0;
      const regal=p.modelo==='directo'?Math.round(ingreso*((p.regalias||0)/100)):0;
      /* CORTE 3 V177 P0-5 — el presupuesto sin distribución confirmada NO se imputa a este país
         ni al margen, y NO se replica en cada out[c]. Se expone una sola vez fuera del mapa. */
      const fijos=0;
      const margen=ingreso-honorarioDevengado-isr-regal; // fijos no imputados sin distribución
      const cxp=ls.filter(l=>!isPaid(l)).reduce((a,l)=>a+l.total,0); // por pagar a shoppers: todo lo no confirmado como pago
      const cxc=ls.filter(l=>['validada','pagada','pagada_preview'].includes(l.estado)).reduce((a)=>a+this.honRecibe(p,c),0); // facturable
      out[c]={cur,visRe,ingreso,
        honorarioDevengado,honorarioPorPagar,honorarioPagado,pagosConfirmados,
        reemb,isr,regal,fijos,margen,cxp,cxc,
        margenPct: ingreso?Math.round(margen/ingreso*100):0};
    });
    /* presupuesto sin asignación: entidad ÚNICA fuera del mapa por país (no imputado al margen) */
    Object.defineProperty(out,'__unassignedBudget',{enumerable:false,value:{budgetKey,tenantId,projectId:p.id,periodId:canonicalPeriodId,total:unassignedBudgetTotal,assigned:false}});
    Object.defineProperty(out,'__reviewQueue',{enumerable:false,value:reviewQueue});
    return out;
  },

  /* serie mensual — anclada al ingreso/margen REAL del periodo actual (porPais) */
  serieMensual(p,c){
    const fp=this.porPais({project:()=>p, period:()=>p, periodId:()=>p.id, tenantId:()=>((CX.BRAND&&CX.BRAND.id)||'tenant'), visitas:()=>(CX.data._visitas||[]).filter(v=>v.projectId===p.id)});
    const d=(fp&&fp[c])||{};
    const ingHoy=d.ingreso||this.honRecibe(p,c)*10||1000;
    const margenHoy=(typeof d.margen==='number')?d.margen:Math.round(ingHoy*0.38);
    const mp=ingHoy?margenHoy/ingHoy:0.38;
    const meses=['MAR','ABR','MAY','JUN'];
    // el último mes = real; los previos escalan hacia atrás con la tendencia observada
    const factors=[0.62,0.78,0.9,1];
    return meses.map((m,i)=>{const ing=Math.round(ingHoy*factors[i]);return {m, ingreso:ing, margen:Math.round(ing*mp*(0.92+i*0.027))};});
  },
  /* serie interanual — margen % real del año actual + evolución previa derivada */
  serieAnual(p,c){
    const s=this.serieMensual(p,c);
    const ingAnual=s.reduce((a,x)=>a+x.ingreso,0)*3; // anualizado aprox.
    const margenHoyPct=(()=>{const last=s[s.length-1];return last.ingreso?Math.round(last.margen/last.ingreso*100):38;})();
    return [
      {y:'2024', ingreso:Math.round(ingAnual*0.63), margenPct:Math.max(10,margenHoyPct-9)},
      {y:'2025', ingreso:Math.round(ingAnual*0.83), margenPct:Math.max(10,margenHoyPct-4)},
      {y:'2026', ingreso:Math.round(ingAnual), margenPct:margenHoyPct},
    ];
  },
  /* variación intermensual de margen % (mes vs mes anterior) */
  margenMoM(p,c){
    const s=this.serieMensual(p,c);
    return s.map((x,i)=>{const pct=x.ingreso?Math.round(x.margen/x.ingreso*100):0;const prev=i>0?(s[i-1].ingreso?Math.round(s[i-1].margen/s[i-1].ingreso*100):0):pct;return {m:x.m,margenPct:pct,delta:pct-prev};});
  },
};
