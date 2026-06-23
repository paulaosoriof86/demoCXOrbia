/* CXOrbia · Finanzas (admin) — full fidelity
   Dashboard Financiero · Movimientos · Liquidaciones · Lotes de Pago
   Separación SIEMPRE por moneda y por país del proyecto (genérico, cualquier país). */

function _fin(data){
  const p=data.project(), out={};
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
  const p=data.project();
  const fp=CX.fin.porPais(data);
  const modelLbl = p.modelo==='delegado' ? 'Delegado (franquicia)' : 'Facturado directamente';

  const tile=(c)=>{const d=fp[c];return `<div class="card card-p">
    <div class="between" style="margin-bottom:10px"><div class="card-t finDrill" data-c="${c}" style="cursor:pointer">${CX.paisLabel(c)} <span class="muted" style="font-weight:500">(${d.cur})</span> <span style="font-size:11px;color:var(--brand)">ver visitas →</span></div>${ui.bdg(d.margenPct+'% margen',d.margenPct>=30?'g':'a')}</div>
    <div class="grid g2" style="gap:8px">
      ${ui.kpi('Ingresos',d.cur+' '+d.ingreso.toLocaleString(),'g')}
      ${ui.kpi('Honorarios',d.cur+' '+d.honPaga.toLocaleString(),'r')}
      ${p.modelo==='directo'?ui.kpi('ISR ('+(p.isr||0)+'%)',d.cur+' '+d.isr.toLocaleString(),'a'):ui.kpi('Reembolsos',d.cur+' '+d.reemb.toLocaleString(),'n')}
      ${p.modelo==='directo'?ui.kpi('Regalías ('+(p.regalias||0)+'%)',d.cur+' '+d.regal.toLocaleString(),'p'):ui.kpi('Por pagar (CxP)',d.cur+' '+d.cxp.toLocaleString(),'a')}
    </div>
    <div class="between" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-2)">
      <span style="font-size:12px;color:var(--t2)">Margen neto</span>
      <b style="font-family:var(--disp);font-size:18px;color:${d.margen>=0?'var(--green)':'var(--red)'}">${d.cur} ${d.margen.toLocaleString()}</b></div>
    <div class="flex" style="gap:14px;margin-top:8px;font-size:11px;color:var(--t3)">
      <span>CxC: <b style="color:var(--t2)">${d.cur} ${d.cxc.toLocaleString()}</b></span>
      <span>CxP: <b style="color:var(--t2)">${d.cur} ${d.cxp.toLocaleString()}</b></span>
      <span>Gastos fijos: <b style="color:var(--t2)">${d.cur} ${d.fijos.toLocaleString()}</b></span></div>
  </div>`;};

  const compar=(c)=>{const s=CX.fin.serieMensual(p,c),cur=p.currency[c],max=Math.max(...s.map(x=>x.ingreso));
    return `<div style="margin-bottom:10px"><div style="font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px">${c} · últimos meses (${cur})</div>
      <div class="flex" style="align-items:flex-end;gap:10px;height:90px">
      ${s.map(x=>`<div style="flex:1;text-align:center">
        <div style="display:flex;flex-direction:column;justify-content:flex-end;height:70px;gap:2px">
          <div title="margen" style="height:${Math.round(x.margen/max*68)}px;background:var(--green);border-radius:3px 3px 0 0;opacity:.85"></div>
        </div>
        <div style="background:var(--brand);height:${Math.round(x.ingreso/max*0)}px"></div>
        <div style="font-size:10px;color:var(--t3);margin-top:4px">${x.m}</div>
        <div style="font-size:10px;font-weight:700;color:var(--t1)">${(x.ingreso/1000).toFixed(0)}k</div></div>`).join('')}
      </div></div>`;};

  /* motor de análisis crítico inteligente: deriva hallazgos/estrategias de los datos */
  const analizar=()=>{
    const H=[]; const M=(cur,n)=>`${cur} ${Number(Math.round(n)).toLocaleString('es-GT')}`;
    p.countries.forEach(c=>{
      const d=fp[c], cur=d.cur;
      if(d.margenPct<20) H.push({tono:'r',icon:'⚠',titulo:`Margen crítico en ${CX.paisLabel(c)} (${d.margenPct}%)`,txt:`Por debajo del 20% objetivo. Revisa honorarios pagados (${M(cur,d.honPaga)}) o renegocia la tarifa del programa.`,accion:'Revisar estructura de costos'});
      else if(d.margenPct<30) H.push({tono:'a',icon:'⚑',titulo:`Margen ajustado en ${CX.paisLabel(c)} (${d.margenPct}%)`,txt:`Cerca del mínimo saludable (30%). Vigila los gastos fijos (${M(cur,d.fijos)}).`,accion:'Optimizar gastos fijos'});
      else H.push({tono:'g',icon:'✓',titulo:`Margen sano en ${CX.paisLabel(c)} (${d.margenPct}%)`,txt:`Rentabilidad sobre el objetivo. Hay espacio para incentivos a shoppers o inversión comercial.`,accion:'Considerar incentivos'});
      if(d.cxc>d.ingreso*0.4) H.push({tono:'a',icon:'⏳',titulo:`Cobranza alta en ${CX.paisLabel(c)}`,txt:`Por cobrar (${M(cur,d.cxc)}) supera el 40% del ingreso. Riesgo de liquidez; prioriza conciliación de reembolsos.`,accion:'Gestionar cobranza'});
    });
    const cur0=p.currency[p.countries[0]];
    const fin=CX.finStore.cxp(p.id).filter(r=>/financ/i.test(r.concepto)).reduce((s,r)=>s+(r.saldo||0),0);
    if(fin>0) H.push({tono:'a',icon:'🏦',titulo:'Financiamientos activos',txt:`Hay ${M(cur0,fin)} en financiamientos. No son utilidad operativa: van como CxP hasta devolverse. Vigila el calendario de devolución.`,accion:'Ver CxP'});
    const store=CX.finStore.pres(p.id), pres=Object.keys(store).reduce((a,k)=>a+(+store[k]||0),0);
    const fijReal=p.countries.reduce((a,c)=>a+(fp[c].fijos||0),0);
    if(pres && fijReal>pres*1.05) H.push({tono:'r',icon:'📊',titulo:'Gasto fijo sobre presupuesto',txt:`El gasto fijo real (${M(cur0,fijReal)}) excede el presupuesto (${M(cur0,pres)}) en ${Math.round((fijReal/pres-1)*100)}%.`,accion:'Ajustar presupuesto'});
    return H;
  };

  const html_fin = `
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Dashboard Financiero', p.name+' · '+modelLbl+' · '+p.countries.map(c=>c+' ('+CX.moneda(p,c)+')').join(' y ')+' separados')}</div>
    <div class="flex"><span class="bdg ${p.modelo==='directo'?'bdg-b':'bdg-p'}">${modelLbl}</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>

  <div class="card card-p" style="margin-bottom:16px;background:var(--brand-light);border-color:#cfe6f7">
    <div style="font-size:12.5px;color:var(--brand-dark)">${p.modelo==='directo'
      ? '<b>Modelo directo:</b> el margen descuenta honorarios + ISR ('+(p.isr||0)+'%) + regalías ('+(p.regalias||0)+'%). El reembolso (boleto+combo) es flujo de caja, no afecta utilidad.'
      : '<b>Modelo delegado:</b> solo se netea el honorario recibido menos lo pagado al shopper; sin ISR ni regalías locales.'}</div>
  </div>

  <div class="grid ${p.countries.length>1?'g2':''}" style="margin-bottom:16px">${p.countries.map(tile).join('')}</div>

  <div class="card card-p" style="margin-bottom:16px;border-color:#e3d9f5">
    <div class="card-h"><div class="card-t">🧠 Análisis crítico inteligente</div><span class="bdg bdg-p">IA · hallazgos & estrategias</span></div>
    <div class="grid g2" style="gap:10px">
      ${analizar().map(h=>`<div style="display:flex;gap:10px;padding:11px 12px;background:var(--${h.tono}-bg);border-radius:10px">
        <div style="font-size:17px;line-height:1">${h.icon}</div>
        <div style="flex:1"><b style="font-size:12.5px;color:var(--${h.tono})">${h.titulo}</b>
        <div style="font-size:11.5px;color:var(--t2);margin-top:3px">${h.txt}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:7px;padding:3px 9px;font-size:11px">${h.accion} →</button></div></div>`).join('')}
    </div>
    <div style="margin-top:10px">${ui.aiBox('Leo márgenes por país, cobranza (CxC), financiamientos (que NO cuento como ingreso operativo) y presupuesto vs real para sugerir acciones. Con IA conectada (Gemini), el análisis se enriquece con tendencias del trimestre.','Decisiones, no solo números')}</div>
  </div>

  <div class="card card-p" id="presAvance" style="margin-bottom:16px">
    <div class="card-h"><div class="card-t">🚦 Avance de presupuesto · semáforos</div><span class="muted" style="font-size:11px">real vs presupuestado por rubro</span></div>
    <div id="presBars"></div>
  </div>

  <div class="grid g2" style="margin-bottom:16px">
    <div class="card card-p">
      <div class="card-h"><div class="card-t">📈 Comparativo mensual (ingreso · margen)</div></div>
      ${p.countries.map(compar).join('')}
    </div>
    <div class="card card-p" id="presCard">
      <div class="card-h"><div class="card-t">📋 Presupuesto de gastos fijos</div><button class="btn btn-soft btn-sm" id="addPres">＋ Rubro</button></div>
      <div id="presList"></div>
      <div style="margin-top:10px">${ui.aiBox('Los gastos fijos se presupuestan; los variables (honorarios) van según ejecución. El dashboard compara real vs presupuesto para decidir rentabilidad y honorarios.','Presupuesto vs real')}</div>
    </div>
  </div>

  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-h"><div class="card-t">🎟️ Reembolsos mensuales · conciliación</div><span class="muted" style="font-size:11px">¿el cliente / casa matriz reembolsó bien?</span></div>
    <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>País</th><th>Reembolso del periodo</th><th>Reembolsado por cliente</th><th>Diferencia</th><th>Estado</th></tr></thead><tbody>
    ${p.countries.map(c=>{const d=fp[c];const reembolsado=Math.round(d.reemb*0.85);const dif=d.reemb-reembolsado;return `<tr><td><b>${CX.paisLabel(c)}</b></td><td>${d.cur} ${d.reemb.toLocaleString()}</td><td>${d.cur} ${reembolsado.toLocaleString()}</td><td style="color:${dif>0?'var(--red)':'var(--green)'};font-weight:700">${dif>0?'falta ':''}${d.cur} ${Math.abs(dif).toLocaleString()}</td><td>${dif>0?ui.bdg('Pendiente conciliar','a'):ui.bdg('Conciliado','g')}</td></tr>`;}).join('')}
    </tbody></table></div>
    <div style="margin-top:10px">${ui.aiBox('Los reembolsos son flujo (no utilidad): el programa cubre consumos/boletos y el cliente o casa matriz los reintegra. Aquí concilias lo gastado vs lo reembolsado para no perder dinero.','Conciliación de reembolsos')}</div>
  </div>`;

  setTimeout(()=>{
    document.querySelectorAll('.finDrill').forEach(el=>el.addEventListener('click',()=>{
      const c=el.dataset.c, liqs=CX.liq.forProject(data).filter(l=>l.pais===c);
      ui.modal('Liquidaciones · '+CX.paisLabel(c)+' ('+liqs.length+')', liqs.length?`<table class="tbl"><thead><tr><th>Visita</th><th>Shopper</th><th>Honorario</th><th>Reembolso</th><th>Total</th><th>Estado</th></tr></thead><tbody>${liqs.map(l=>{const lb=CX.liq.label(l.estado);return `<tr><td><b style="font-size:12.5px">${l.sucursal}</b></td><td style="font-size:12px">${l.shopper||'—'}</td><td style="color:var(--green)">${ui.money(l.moneda,l.honorario)}</td><td style="color:var(--purple)">${l.reembolso?ui.money(l.moneda,l.reembolso):'—'}</td><td style="font-weight:700">${ui.money(l.moneda,l.total)}</td><td>${ui.bdg(lb[0],lb[1])}</td></tr>`;}).join('')}</tbody></table>`:ui.empty('💰','Sin liquidaciones en este país.'));
    }));
    const cur=p.currency[p.countries[0]];
    const defaults={'Coordinación':4000,'Software/plataforma':1200,'Transporte':800};
    const store=CX.finStore.pres(p.id);
    if(!Object.keys(store).length) Object.assign(store,defaults);
    const draw=()=>{
      const list=document.getElementById('presList'); if(!list)return;
      const ks=Object.keys(store); const tot=ks.reduce((a,k)=>a+(+store[k]||0),0);
      list.innerHTML = (ks.length?ks.map(k=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)">
        <span style="font-size:12.5px;color:var(--t1)">${k}</span>
        <div class="flex" style="gap:8px"><b style="font-size:12.5px">${cur} ${(+store[k]).toLocaleString()}</b><button class="btn btn-ghost btn-sm" data-delp="${k}" style="color:var(--red);padding:2px 7px">✕</button></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:8px 0">Sin rubros aún</div>')
        + `<div class="between" style="padding:9px 0 0;font-weight:700"><span style="font-size:13px">Total fijo</span><b style="color:var(--t1)">${cur} ${tot.toLocaleString()}</b></div>`;
      list.querySelectorAll('[data-delp]').forEach(b=>b.addEventListener('click',()=>{delete store[b.dataset.delp];draw();}));
    };
    draw();
    // barras de avance de presupuesto con semáforos (real vs presupuestado)
    const drawAvance=()=>{
      const bars=document.getElementById('presBars'); if(!bars)return;
      const fijReal=p.countries.reduce((a,c)=>a+(fp[c].fijos||0),0);
      const ks=Object.keys(store);
      const totalPres=ks.reduce((a,k)=>a+(+store[k]||0),0)||1;
      // distribuye el real proporcional al peso presupuestado (demo) — en prod viene de movimientos por rubro
      bars.innerHTML = ks.map(k=>{
        const pres=+store[k]||0; const real=Math.round(fijReal*(pres/totalPres));
        const pct=pres?Math.round(real/pres*100):0;
        const tono=pct>105?'r':pct>90?'a':'g'; const lbl=pct>105?'Excedido':pct>90?'Al límite':'En rango';
        return `<div style="margin-bottom:11px"><div class="between" style="margin-bottom:4px"><span style="font-size:12px;color:var(--t1)">${k}</span>
          <span style="font-size:11.5px;color:var(--t2)">${cur} ${real.toLocaleString()} / ${cur} ${pres.toLocaleString()} ${ui.bdg(lbl,tono)}</span></div>
          <div style="height:9px;background:var(--border-2);border-radius:5px;overflow:hidden"><div style="height:100%;width:${Math.min(100,pct)}%;background:var(--${tono});border-radius:5px"></div></div></div>`;
      }).join('') + `<div class="between" style="margin-top:10px;padding-top:9px;border-top:1px solid var(--border-2);font-weight:700"><span style="font-size:12.5px">Total ejecutado</span><span style="font-size:12.5px">${cur} ${fijReal.toLocaleString()} / ${cur} ${(totalPres).toLocaleString()}</span></div>`;
    };
    drawAvance();
    const ap=document.getElementById('addPres');
    if(ap)ap.addEventListener('click',()=>ui.modal('Nuevo rubro de gasto fijo',`
      <div style="margin-bottom:12px"><label class="lbl">Concepto</label><input class="inp" id="prK" placeholder="Ej. Renta oficina"></div>
      <div style="margin-bottom:16px"><label class="lbl">Monto mensual (${cur})</label><input class="inp" id="prV" type="number" placeholder="0"></div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="prSave">Agregar</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#prSave').addEventListener('click',()=>{const k=ov.querySelector('#prK').value||'Rubro';store[k]=+ov.querySelector('#prV').value||0;close();draw();ui.toast('Rubro agregado al presupuesto','ok');});}}));
  },0);
  return html_fin;
});

CX.module('movimientos', ({data,ui})=>{
  const p=data.project(), cur=p.currency[p.countries[0]];
  const seed=[
    {tipo:'ingreso',cat:'Anticipo cliente',pais:p.countries[0],monto:40000,fecha:'2026-06-03',desc:'Anticipo del proyecto',estado:'Conciliado'},
    {tipo:'egreso',cat:'Pago lote #L-204',pais:p.countries[0],monto:-18240,fecha:'2026-06-12',desc:'Pago a evaluadores',estado:'Pagado',origen:'lote'},
    {tipo:'ingreso',cat:'Factura final cliente',pais:p.countries[0],monto:46400,fecha:'2026-06-20',desc:'Factura de cierre',estado:'Pendiente (CxC)'},
  ];
  const host=ui.el('div');
  let scope='proyecto'; // 'proyecto' | 'global'
  const pid=()=>scope==='global'?CX.finStore.GLOBAL:p.id;
  const CAT=CX.finStore.CATEGORIAS, TI=CX.finStore.TIPOS_INGRESO, TE=CX.finStore.TIPOS_EGRESO;
  const draw=()=>{
    const isG=scope==='global';
    const per=CX.finStore.curPeriod();
    const movs=[...(isG?[]:seed),...CX.finStore.mov(pid()).filter(m=>!m.fecha||m.fecha.slice(0,7)===per)];
    const ing=movs.filter(m=>m.monto>0).reduce((a,m)=>a+m.monto,0);
    const egr=movs.filter(m=>m.monto<0).reduce((a,m)=>a+m.monto,0);
    // ingresos por tipo (separar financiamiento del resto)
    const porTipoIng={}; movs.filter(m=>m.monto>0).forEach(m=>{const t=m.tipoIngreso||'otro';porTipoIng[t]=(porTipoIng[t]||0)+m.monto;});
    const financiamiento=porTipoIng.financiamiento||0;
    const ingOper=movs.filter(m=>m.monto>0&&!m.noOperativo&&m.tipoIngreso!=='financiamiento').reduce((a,m)=>a+m.monto,0);
    const remesas=movs.filter(m=>m.tipoIngreso==='remesa').reduce((a,m)=>a+m.monto,0);
    // CxC/CxP: manuales (importación) + financiamiento + liquidaciones no pagadas (solo proyecto)
    const cxpManual=CX.finStore.cxp(pid()).reduce((a,r)=>a+(r.saldo||0),0);
    const cxpLiq=isG?0:CX.liq.forProject(data).filter(l=>l.estado!=='pagada').reduce((a,l)=>a+l.total,0);
    const cxp=cxpManual+cxpLiq+financiamiento;
    const cxc=CX.finStore.cxc(pid()).reduce((a,r)=>a+(r.saldo||0),0) + (isG?0:movs.filter(m=>(m.estado||'').includes('CxC')).reduce((a,m)=>a+Math.abs(m.monto),0));

    host.innerHTML=`
    <div class="between" style="margin-bottom:12px"><div>${ui.ph('Movimientos & Tesorería', 'Ingresos, egresos, CxC/CxP, financiamientos y remesas · por proyecto o globales')}</div>
      <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>

    <div class="between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div class="flex" style="gap:0;border:1px solid var(--border);border-radius:9px;overflow:hidden;width:max-content">
        <button class="btn btn-sm ${scope==='proyecto'?'btn-pr':'btn-ghost'}" data-scope="proyecto" style="border-radius:0">📁 ${p.name}</button>
        <button class="btn btn-sm ${scope==='global'?'btn-pr':'btn-ghost'}" data-scope="global" style="border-radius:0">🌐 Global (administrativo)</button>
      </div>
      <div class="flex" style="gap:8px;align-items:center">
        <label class="lbl" style="margin:0">Periodo</label>
        <select class="sel" id="perSel" style="width:auto;padding:6px 10px">${CX.finStore.periods(pid()).map(pr=>`<option value="${pr}" ${pr===per?'selected':''}>${pr}</option>`).join('')}</select>
        <button class="btn btn-soft btn-sm" id="nextMonth" title="Crear mes siguiente (replica presupuesto, movimientos en blanco)">＋ Mes siguiente</button>
      </div>
    </div>

    <div class="flex wrap" style="gap:8px;margin-bottom:14px">
      <button class="btn btn-green btn-sm" data-new="ingreso">＋ Ingreso</button>
      <button class="btn btn-soft btn-sm" data-new="egreso">＋ Egreso</button>
      <button class="btn btn-soft btn-sm" data-cuenta="cxc">＋ Cuenta por cobrar</button>
      <button class="btn btn-soft btn-sm" data-cuenta="cxp">＋ Cuenta por pagar</button>
      <button class="btn btn-soft btn-sm" data-new="remesa">＋ Remesa</button>
      ${!isG?`<button class="btn btn-pr btn-sm" id="payLote">💳 Pagar lote</button>`:''}
      <button class="btn btn-ghost btn-sm" id="impHist">⤒ Importar histórico</button>
    </div>

    <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:16px">
      <div data-drill="ing" style="cursor:pointer">${ui.kpi('Ingresos oper.',ui.money(cur,ingOper),'g',financiamiento?'+ fin. aparte':'')}</div>
      <div data-drill="egr" style="cursor:pointer">${ui.kpi('Egresos',ui.money(cur,Math.abs(egr)),'r')}</div>
      <div data-drill="cxc" style="cursor:pointer">${ui.kpi('Por cobrar (CxC)',ui.money(cur,cxc),'a')}</div>
      <div data-drill="cxp" style="cursor:pointer">${ui.kpi('Por pagar (CxP)',ui.money(cur,cxp),'a',financiamiento?'incl. financiamiento':'')}</div>
      <div data-drill="rem" style="cursor:pointer">${ui.kpi('Remesas',ui.money(cur,remesas),'b','conciliación')}</div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p"><div class="card-h"><div class="card-t">Ingresos por tipo</div></div>
        ${Object.keys(TI).map(t=>{const val=porTipoIng[t]||0;return val?`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12px;color:var(--t2)">${TI[t]}${t==='financiamiento'?' <span class="bdg bdg-a" style="font-size:9px">→CxP</span>':''}</span><b style="font-size:12.5px;color:${t==='financiamiento'?'var(--amber)':'var(--green)'}">${ui.money(cur,val)}</b></div>`:'';}).join('')||'<div class="muted" style="font-size:12px;padding:8px 0">Sin ingresos registrados</div>'}
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Los <b>financiamientos</b> no son utilidad: se suman a CxP hasta devolverse.</div>
      </div>
      <div class="card card-p"><div class="card-h"><div class="card-t">Cuentas por pagar (CxP)</div></div>
        ${CX.finStore.cxp(pid()).length?CX.finStore.cxp(pid()).map(r=>`<div class="between" style="padding:7px 0;border-bottom:1px solid var(--border-2)"><div><b style="font-size:12px">${r.concepto}</b><div style="font-size:10px;color:var(--t3)">${r.pais||''} · saldo</div></div><div class="flex" style="gap:8px"><b style="font-size:12.5px;color:var(--amber)">${ui.money(cur,r.saldo||0)}</b><button class="btn btn-soft btn-sm" data-abono="${r.id}">Abonar</button></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:8px 0">Sin CxP registradas. Útil al importar saldos iniciales.</div>'}
      </div>
    </div>

    <div class="grid g2" style="gap:14px;margin-bottom:16px">
      <div class="card card-p" id="presMesCard">
        <div class="between" style="margin-bottom:8px"><div class="card-t">📋 Presupuesto mensual <span class="bdg bdg-b">${per}</span></div><button class="btn btn-soft btn-sm" id="addPresMes">＋ Rubro</button></div>
        <div id="presMesList"></div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">Es <b>mensual</b>: alimenta el semáforo y el análisis del Dashboard. Con <b>＋ Mes siguiente</b> (arriba) se replica al mes nuevo y queda editable.</div>
      </div>
      <div class="card card-p" id="finCard">
        <div class="between" style="margin-bottom:8px"><div class="card-t">🏦 Financiamientos</div><button class="btn btn-soft btn-sm" id="addFin">＋ Financiamiento</button></div>
        <div id="finList"></div>
        <div style="font-size:11px;color:var(--t3);margin-top:8px">No son ingreso operativo: entran como flujo + CxP y se controlan hasta su <b>devolución</b> (egreso).</div>
      </div>
    </div>

    <div class="card card-p">
      <div class="card-h"><div class="card-t">Movimientos${isG?' globales':' del proyecto'}</div><span class="muted" style="font-size:11px">conceptos categorizados · anti-duplicado al importar</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Tipo</th><th>País</th><th style="text-align:right">Monto</th><th>Estado</th><th></th></tr></thead><tbody>
        ${movs.map(m=>`<tr><td style="font-size:12px">${m.fecha}</td><td><b>${m.cat}</b><div style="font-size:10px;color:var(--t3)">${m.desc||''}</div></td>
          <td style="font-size:11.5px">${m.categoria||(m.global?'Administrativo':'Proyecto')}</td>
          <td style="font-size:11px">${TI[m.tipoIngreso]||TE[m.tipoEgreso]||m.tipo}</td><td>${m.pais||'—'}</td>
          <td style="text-align:right;font-weight:700;color:var(--${m.monto<0?'red':'green'})">${m.monto<0?'− ':'+ '}${ui.money(cur,Math.abs(m.monto))}</td>
          <td>${ui.bdg(m.estado||'—',(m.estado||'').includes('Cx')?'a':m.monto<0?'r':'g')}</td>
          <td style="text-align:right">${m.id?`<button class="btn btn-ghost btn-sm" data-delm="${m.id}" style="color:var(--red);padding:2px 6px">✕</button>`:''}</td></tr>`).join('')}
      </tbody></table></div>
      <div style="margin-top:14px">${ui.aiBox('Separo ingresos por comisiones, honorarios, anticipos y facturación de los financiamientos (que van a CxP). Registro CxC/CxP iniciales en la importación y vinculo cada abono a su egreso. Las remesas recibidas se concilian aquí.','Tesorería completa, no solo gastos del proyecto')}</div>
    </div>`;

    host.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.scope;draw();}));
    const ps=host.querySelector('#perSel'); if(ps)ps.addEventListener('change',()=>{CX.finStore.setPeriod(ps.value);draw();});
    const nm=host.querySelector('#nextMonth'); if(nm)nm.addEventListener('click',()=>{const nx=CX.finStore.crearMesSiguiente(pid());draw();ui.toast('Mes '+nx+' creado · presupuesto replicado (editable) · movimientos en blanco','ok',3600);});

    // ---- presupuesto mensual (period-keyed) ----
    const pml=host.querySelector('#presMesList');
    if(pml){ const store=CX.finStore.pres(p.id,per); const ks=Object.keys(store); const tot=ks.reduce((a,k)=>a+(+store[k]||0),0);
      pml.innerHTML=(ks.length?ks.map(k=>`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:12.5px">${k}</span><div class="flex" style="gap:8px"><b style="font-size:12.5px">${cur} ${(+store[k]).toLocaleString()}</b><button class="btn btn-ghost btn-sm" data-delpm="${k}" style="color:var(--red);padding:2px 7px">✕</button></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:6px 0">Sin rubros este mes</div>')+`<div class="between" style="padding:8px 0 0;font-weight:700"><span style="font-size:12.5px">Total presupuestado</span><b>${cur} ${tot.toLocaleString()}</b></div>`;
      pml.querySelectorAll('[data-delpm]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.delPres(p.id,b.dataset.delpm,per);draw();}));
    }
    const apm=host.querySelector('#addPresMes');
    if(apm)apm.addEventListener('click',()=>ui.modal('Nuevo rubro de presupuesto · '+per,`
      <label class="lbl">Concepto</label><input class="inp" id="pmK" placeholder="Ej. Coordinación, Transporte" style="margin-bottom:10px">
      <label class="lbl">Monto mensual (${cur})</label><input class="inp" id="pmV" type="number" style="margin-bottom:14px">
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="pmSave">Agregar</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#pmSave').addEventListener('click',()=>{const k=(ov.querySelector('#pmK').value||'').trim();if(!k){ui.toast('Escribe el concepto','warn');return;}CX.finStore.setPres(p.id,k,+ov.querySelector('#pmV').value||0,per);close();draw();ui.toast('Rubro agregado al presupuesto de '+per,'ok');});}}));

    // ---- financiamientos ----
    const fl=host.querySelector('#finList');
    if(fl){ const fins=CX.finStore.financiamientos(p.id);
      fl.innerHTML=fins.length?fins.map(f=>`<div style="padding:8px 0;border-bottom:1px solid var(--border-2)"><div class="between"><div><b style="font-size:12.5px">${f.fuente||'Financiamiento'}</b><div style="font-size:10.5px;color:var(--t3)">${f.pais||''} · ${f.fecha} · devuelto ${ui.money(p.currency[f.pais]||cur,f.devuelto||0)}</div></div>
        <div class="flex" style="gap:8px"><b style="font-size:12.5px;color:${(f.saldo||0)>0?'var(--amber)':'var(--green)'}">saldo ${ui.money(p.currency[f.pais]||cur,f.saldo||0)}</b>${(f.saldo||0)>0?`<button class="btn btn-soft btn-sm" data-devfin="${f.id}">Devolver</button>`:ui.bdg('saldado','g')}</div></div></div>`).join(''):'<div class="muted" style="font-size:12px;padding:6px 0">Sin financiamientos registrados</div>';
      fl.querySelectorAll('[data-devfin]').forEach(b=>b.addEventListener('click',()=>{const f=CX.finStore.financiamientos(p.id).find(x=>x.id===b.dataset.devfin);
        ui.modal('Devolver financiamiento · '+f.fuente,`<div style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Saldo: <b>${ui.money(p.currency[f.pais]||cur,f.saldo||0)}</b></div><label class="lbl">Monto a devolver</label><input class="inp" id="dvM" type="number" value="${f.saldo||0}" style="margin-bottom:14px"><div style="text-align:right"><button class="btn btn-green btn-sm" id="dvOk">Registrar devolución</button></div>`,{onMount:(ov,close)=>{ov.querySelector('#dvOk').addEventListener('click',()=>{CX.finStore.devolverFinanciamiento(p.id,f.id,+ov.querySelector('#dvM').value||0);close();draw();ui.toast('Devolución registrada · egreso generado · CxP reducida','ok',3600);});}});
      }));
    }
    const af=host.querySelector('#addFin');
    if(af)af.addEventListener('click',()=>ui.modal('Registrar financiamiento',`
      <p style="font-size:12px;color:var(--t2);margin-bottom:10px">Entra como <b>flujo</b> (no ingreso operativo) y como CxP hasta devolverse.</p>
      <div class="grid g2" style="gap:10px 12px"><div style="grid-column:1/3"><label class="lbl">Fuente</label><input class="inp" id="fnF" placeholder="Banco / socio / casa matriz"></div>
      <div><label class="lbl">Monto (${cur})</label><input class="inp" id="fnM" type="number"></div>
      <div><label class="lbl">País</label><select class="sel" id="fnP">${p.countries.map(c=>`<option>${c}</option>`).join('')}</select></div></div>
      <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="fnSave">Registrar</button></div>
    `,{onMount:(ov,close)=>{ov.querySelector('#fnSave').addEventListener('click',()=>{CX.finStore.addFinanciamiento(p.id,{fuente:(ov.querySelector('#fnF').value||'').trim(),monto:+ov.querySelector('#fnM').value||0,pais:ov.querySelector('#fnP').value});close();draw();ui.toast('Financiamiento registrado · flujo + CxP (no operativo)','ok',3600);});}}));
    host.querySelectorAll('[data-delm]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.delMov(pid(),b.dataset.delm);draw();ui.toast('Movimiento eliminado','');}));
    host.querySelectorAll('[data-drill]').forEach(el=>el.addEventListener('click',()=>{
      const k=el.dataset.drill; let title,rows;
      if(k==='ing'||k==='egr'){const f=movs.filter(m=>k==='ing'?m.monto>0:m.monto<0);title=k==='ing'?'Ingresos':'Egresos';rows=f.map(m=>`<tr><td>${m.fecha}</td><td><b>${m.cat}</b></td><td>${TI[m.tipoIngreso]||TE[m.tipoEgreso]||m.tipo}</td><td style="text-align:right">${ui.money(cur,Math.abs(m.monto))}</td></tr>`).join('');}
      else if(k==='rem'){const f=movs.filter(m=>m.tipoIngreso==='remesa');title='Remesas recibidas';rows=f.map(m=>`<tr><td>${m.fecha}</td><td><b>${m.cat}</b></td><td>${m.estado||''}</td><td style="text-align:right">${ui.money(cur,m.monto)}</td></tr>`).join('');}
      else {const arr=k==='cxc'?CX.finStore.cxc(pid()):CX.finStore.cxp(pid());title=k==='cxc'?'Cuentas por cobrar':'Cuentas por pagar';rows=arr.map(r=>`<tr><td><b>${r.concepto}</b></td><td>${r.pais||''}</td><td style="text-align:right">${ui.money(cur,r.saldo||0)}</td></tr>`).join('');}
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
          <div><label class="lbl">Monto (${cur})</label><input class="inp" id="mvMonto" type="number"></div>
          <div><label class="lbl">País</label><select class="sel" id="mvPais"><option value="">— global —</option>${p.countries.map(c=>`<option ${scope!=='global'?'selected':''}>${c}</option>`).join('')}</select></div>
          <div><label class="lbl">Fecha (admite histórico)</label><input class="inp" id="mvFecha" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
          <div><label class="lbl">Estado</label><select class="sel" id="mvEstado">${(esIng?['Conciliado','Pendiente (CxC)','Por conciliar']:['Pagado','Programado']).map(s=>`<option>${s}</option>`).join('')}</select></div>
          <div style="grid-column:1/3"><label class="lbl">Descripción</label><input class="inp" id="mvDesc" placeholder="Opcional"></div>
        </div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="mvSave">Registrar</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#mvSave').addEventListener('click',()=>{
        const monto=Math.abs(+ov.querySelector('#mvMonto').value||0)*(esIng?1:-1);
        const rec={tipo:esIng?'ingreso':'egreso',cat:ov.querySelector('#mvCat').value||t,categoria:ov.querySelector('#mvCateg').value,pais:ov.querySelector('#mvPais').value,monto,fecha:ov.querySelector('#mvFecha').value,desc:ov.querySelector('#mvDesc').value,estado:ov.querySelector('#mvEstado').value};
        if(esIng)rec.tipoIngreso=ov.querySelector('#mvTipo').value; else rec.tipoEgreso=ov.querySelector('#mvTipo').value;
        CX.finStore.addMov(pid(),rec);close();draw();ui.toast('Movimiento registrado','ok');});}});
    }));

    host.querySelectorAll('[data-cuenta]').forEach(b=>b.addEventListener('click',()=>{
      const k=b.dataset.cuenta;
      ui.modal('Registrar cuenta por '+(k==='cxc'?'cobrar':'pagar'),`
        <p style="font-size:12px;color:var(--t2);margin-bottom:10px">Útil para cargar saldos iniciales en la importación o registrar deudas/derechos del periodo.</p>
        <div class="grid g2" style="gap:10px 12px">
          <div style="grid-column:1/3"><label class="lbl">Concepto / contraparte</label><input class="inp" id="ctCon" placeholder="${k==='cxc'?'Cliente / casa matriz':'Proveedor / financiamiento'}"></div>
          <div><label class="lbl">Monto (${cur})</label><input class="inp" id="ctMonto" type="number"></div>
          <div><label class="lbl">País</label><select class="sel" id="ctPais"><option value="">—</option>${p.countries.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div style="grid-column:1/3"><label class="lbl">Vence</label><input class="inp" id="ctVence" type="date"></div>
        </div>
        <div style="text-align:right;margin-top:14px"><button class="btn btn-pr btn-sm" id="ctSave">Registrar</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#ctSave').addEventListener('click',()=>{
        const r={concepto:ov.querySelector('#ctCon').value||'(sin concepto)',monto:+ov.querySelector('#ctMonto').value||0,pais:ov.querySelector('#ctPais').value,vence:ov.querySelector('#ctVence').value};
        if(k==='cxc')CX.finStore.addCxc(pid(),r);else CX.finStore.addCxp(pid(),r);close();draw();ui.toast('Cuenta por '+(k==='cxc'?'cobrar':'pagar')+' registrada','ok');});}});
    }));

    host.querySelectorAll('[data-abono]').forEach(b=>b.addEventListener('click',()=>{
      const r=CX.finStore.cxp(pid()).find(x=>x.id===b.dataset.abono);
      ui.modal('Abonar a CxP · '+r.concepto,`
        <div style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Saldo actual: <b>${ui.money(cur,r.saldo||0)}</b></div>
        <label class="lbl">Monto del abono (${cur})</label><input class="inp" id="abMonto" type="number" value="${r.saldo||0}" style="margin-bottom:14px">
        <div style="text-align:right"><button class="btn btn-green btn-sm" id="abSave">Registrar abono</button></div>
      `,{onMount:(ov,close)=>{ov.querySelector('#abSave').addEventListener('click',()=>{CX.finStore.abonarCxp(pid(),r.id,+ov.querySelector('#abMonto').value||0);close();draw();ui.toast('Abono registrado · egreso vinculado','ok');});}});
    }));

    const pl=host.querySelector('#payLote');
    if(pl)pl.addEventListener('click',()=>{
      const val=CX.liq.forProject(data).filter(l=>l.estado==='validada');
      if(!val.length){ui.toast('No hay liquidaciones validadas para pagar','warn');return;}
      const r=data.payVisits(val.map(l=>l.visitaId));
      ui.toast(r.pagadas+' liquidaciones pagadas · egreso(s) automáticos · Beneficios y Finanzas sincronizados','ok',4200);
    });
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
  const p=data.project();

  const host=ui.el('div');
  const draw=()=>{
    const all=CX.liq.forProject(data);
    const res=CX.liq.resumen(all);
    const draft=CX.finStore.draft(p.id).filter(vid=>all.some(l=>l.visitaId===vid&&l.estado==='validada'));
    CX.finStore._draft[p.id]=draft; // limpia ids ya no validados
    const oblig=p.countries.map(c=>{
      const ls=all.filter(l=>l.pais===c);
      const hon=ls.reduce((a,l)=>a+l.honorario,0), reemb=ls.reduce((a,l)=>a+l.reembolso,0), tot=ls.reduce((a,l)=>a+l.total,0);
      const listo=ls.filter(l=>l.estado==='validada').reduce((a,l)=>a+l.total,0);
      return `<tr><td><b>${c}</b></td><td>${p.currency[c]}</td><td>${ls.length}</td><td>${ui.money(p.currency[c],hon)}</td><td>${ui.money(p.currency[c],reemb)}</td><td><b>${ui.money(p.currency[c],tot)}</b></td><td>${ui.money(p.currency[c],listo)}</td></tr>`;
    }).join('');

    const lrow=(l,i)=>{const lb=CX.liq.label(l.estado); const inD=draft.includes(l.visitaId);
      return `<tr data-li="${i}" style="${inD?'background:var(--brand-light)':''}"><td style="position:sticky;left:0;background:${inD?'#eaf4fc':'var(--surface)'};z-index:1">${l.estado==='validada'?(inD?`<button class="btn btn-soft btn-sm" data-rm="${l.visitaId}" style="padding:3px 9px;color:var(--red)">✕ Retirar</button>`:`<button class="btn btn-pr btn-sm" data-add="${l.visitaId}" style="padding:3px 10px">▶ Mover a lote</button>`):l.estado==='pendiente_cuestionario'?ui.bdg('espera shopper','n'):l.estado==='pagada'||l.estado==='liquidada'?ui.bdg('✓ pagada','g'):ui.bdg('—','n')}</td>
        <td style="position:sticky;left:96px;background:${inD?'#eaf4fc':'var(--surface)'};z-index:1"><b>${l.shopper||'—'}</b><div style="font-size:10px;color:var(--t3)">${l.shopperCode||''}</div></td>
        <td style="font-size:12px">${l.sucursal}</td><td style="font-size:12px">${l.freal||'—'}</td>
        <td>${inD?ui.bdg('● en lote','p'):ui.bdg(lb[0],lb[1])}</td><td>${l.submit?'✅':'—'}</td>
        <td>${ui.money(l.moneda,l.honorario)}</td><td>${l.reembolso?ui.money(l.moneda,l.reembolso):'—'}</td>
        <td style="font-weight:700;color:var(--t1)">${ui.money(l.moneda,l.total)}</td>
        <td style="font-size:12px">${l.fechaEstimadaPago||'—'}</td></tr>`;};

    // panel del lote en construcción (carrito)
    const draftLiqs=draft.map(vid=>all.find(l=>l.visitaId===vid)).filter(Boolean);
    const porMon={}; draftLiqs.forEach(l=>{porMon[l.moneda]=(porMon[l.moneda]||0)+l.total;});
    const multiMon=Object.keys(porMon).length>1;
    const cart=`<div class="card card-p" style="margin-bottom:16px;border:1px solid ${draft.length?'var(--brand)':'var(--border)'};${draft.length?'background:linear-gradient(180deg,var(--brand-light),var(--surface))':''}">
      <div class="between" style="margin-bottom:10px"><div class="card-t">📦 Lote en construcción ${draft.length?`<span class="bdg bdg-b">${draft.length}</span>`:''}</div>
        <div class="flex" style="gap:8px">${CX.finStore.cxp(p.id).filter(r=>r.origen==='liquidacion').length?`<button class="btn btn-soft btn-sm" id="addCxp">➕ Incluir CxP meses anteriores (${CX.finStore.cxp(p.id).filter(r=>r.origen==='liquidacion').length})</button>`:''}
        ${draft.length?`<button class="btn btn-ghost btn-sm" id="clearDraft" style="color:var(--red)">Vaciar</button>`:''}</div></div>
      ${draft.length?`
        <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>País</th><th style="text-align:right">Total</th><th></th></tr></thead><tbody>
        ${draftLiqs.map(l=>`<tr><td><b>${l.shopper}</b></td><td style="font-size:12px">${l.sucursal}</td><td>${l.pais}</td><td style="text-align:right;font-weight:700">${ui.money(l.moneda,l.total)}</td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-rm="${l.visitaId}" style="color:var(--red);padding:2px 7px">✕</button></td></tr>`).join('')}
        </tbody></table></div>
        <div class="between" style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border-2)">
          <div>${Object.keys(porMon).map(m=>`<span style="font-family:var(--disp);font-size:17px;font-weight:800;color:var(--green);margin-right:14px">${ui.money(m,porMon[m])}</span>`).join('')}
            ${multiMon?'<div style="font-size:11px;color:var(--red);margin-top:3px">⚠ Hay más de una moneda. Un lote debe ser de una sola moneda; retira las de otra moneda antes de pagar.</div>':''}</div>
          <button class="btn btn-green btn-sm" id="payDraft" ${multiMon?'disabled':''}>💳 Pagar lote (${draft.length})</button></div>
      `:`<div class="muted" style="font-size:12.5px;padding:6px 0">Aún no has movido liquidaciones al lote. Usa <b>▶ Mover a lote</b> en cada fila validada; aquí verás el total a pagar y podrás retirar.</div>`}
    </div>`;

    host.innerHTML=`
    <div class="between" style="margin-bottom:12px"><div>${ui.ph('Liquidaciones', p.name+' · sincronizadas con el avance de cada visita')}</div>
      <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>

    <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px">
      ${ui.kpi('Pend. cuestionario',res.pendiente_cuestionario||0,'a')}
      ${ui.kpi('Pend./Validadas',(res.pendiente_submitir||0)+(res.validada||0),'b')}
      ${ui.kpi('Listas para lote',res.validada||0,'b')}
      ${ui.kpi('Pagadas',res.pagada||0,'g')}
    </div>

    ${cart}

    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-t" style="margin-bottom:8px">📊 Obligaciones por país y moneda</div>
      <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">No se suman monedas distintas. Total = honorario + reembolso (boleto + combo). El estado y la <b>fecha estimada de pago</b> se derivan del avance de la visita.</div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Visitas</th><th>Honorarios</th><th>Reembolsos</th><th>Total</th><th>Listo para lote</th></tr></thead><tbody>${oblig}</tbody></table></div>
    </div>

    <div class="card card-p">
      <div class="between" style="margin-bottom:12px"><div><div class="card-t">💸 Liquidaciones operativas</div>
        <div style="font-size:11px;color:var(--t3)">El estado avanza solo con la visita. Mueve las validadas al lote y págalas arriba.</div></div></div>
      <div style="overflow-x:auto"><table class="tbl" style="min-width:760px"><thead><tr><th style="position:sticky;left:0;background:var(--surface);z-index:2"></th><th style="position:sticky;left:96px;background:var(--surface);z-index:2">Shopper</th><th>Sucursal</th><th>Realizada</th><th>Estado</th><th>Submit.</th><th>Honorario</th><th>Reembolso</th><th>Total</th><th>Pago est.</th></tr></thead>
      <tbody>${all.map(lrow).join('')}</tbody></table></div>
      <div style="margin-top:14px">${ui.aiBox('Cada liquidación nace del avance de la visita: realizada → pend. cuestionario → validada → en lote → pagada. Mueve al lote, revisa el total a pagar, retira lo que no entra (queda como CxP del mes) y paga: se generan los egresos automáticamente.','Liquidación sincronizada')}</div>
    </div>`;

    host.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.toggleDraft(p.id,b.dataset.add);}));
    host.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{CX.finStore.toggleDraft(p.id,b.dataset.rm);}));
    const cd=host.querySelector('#clearDraft'); if(cd)cd.addEventListener('click',()=>CX.finStore.clearDraft(p.id));
    const ac=host.querySelector('#addCxp');
    if(ac)ac.addEventListener('click',()=>{
      const cxps=CX.finStore.cxp(p.id).filter(r=>r.origen==='liquidacion'&&(r.saldo||0)>0);
      const rows=cxps.length?cxps.map((r,i)=>`<label class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer">
        <span><input type="checkbox" class="cxpChk" data-id="${r.id}" checked style="margin-right:8px"><b style="font-size:12.5px">${r.concepto}</b><div style="font-size:11px;color:var(--t3)">${r.pais||''} · pendiente de meses anteriores</div></span>
        <b style="color:var(--amber)">${ui.money(p.currency[r.pais]||p.currency[p.countries[0]],r.saldo||0)}</b></label>`).join('')
        : ui.empty('📭','No hay liquidaciones diferidas (CxP) pendientes.');
      ui.modal('Incluir CxP de meses anteriores',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Estas son liquidaciones <b>diferidas</b> en cierres anteriores. Selecciona cuáles pagar ahora: se generará el egreso y se saldará la cuenta por pagar.</p>
        ${rows}
        <div style="text-align:right;margin-top:8px"><button class="btn btn-green btn-sm" id="payCxp" ${cxps.length?'':'disabled'}>Pagar seleccionadas</button></div>
      `,{onMount:(ov,close)=>{const b=ov.querySelector('#payCxp'); if(b)b.addEventListener('click',()=>{
        const ids=[...ov.querySelectorAll('.cxpChk:checked')].map(c=>c.dataset.id); let n=0;
        ids.forEach(id=>{const r=CX.finStore.cxp(p.id).find(x=>x.id===id); if(r){CX.finStore.abonarCxp(p.id,id,r.saldo||0);n++;}});
        close(); draw(); ui.toast(n+' CxP de meses anteriores pagada(s) · egreso(s) en Movimientos','ok',4000);
      });}});
    });
    const pay=host.querySelector('#payDraft');
    if(pay)pay.addEventListener('click',()=>{
      const validadas=all.filter(l=>l.estado==='validada');
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
        ui.toast('Lote pagado · '+r.pagadas+' visita(s) · fecha de pago '+r.fechaPago+(diferidas?' · '+diferidas+' diferida(s) a CxP':'')+' · egresos en Movimientos · Beneficios actualizado','ok',4600);
      });}});
    });
  };
  draw();
  CX.bus.on('lote',()=>draw());
  CX.bus.on('visit-flow',()=>draw());
  return host;
});

CX.module('lotes', ({data,ui})=>{
  const p=data.project(), cur=p.currency[p.countries[0]];
  const rows=[['#L-204','12 visitas',_m(cur,18240),'Pagado','g'],['#L-205','8 visitas',_m(p.currency[p.countries[p.countries.length-1]],42000),'En revisión','a'],['#L-206','5 visitas',_m(cur,9300),'Borrador','n']];
  return `
  ${ui.ph('Lotes de Pago', p.name+' · agrupa liquidaciones validadas y crea el egreso')}
  <div class="grid g3" style="margin-bottom:16px">${rows.map(r=>`<div class="card hov card-p">
    <div class="between" style="margin-bottom:8px"><b style="font-family:var(--disp);font-size:15px;color:var(--t1)">${r[0]}</b>${ui.bdg(r[3],r[4])}</div>
    <div style="font-size:12px;color:var(--t3)">${r[1]}</div>
    <div style="font-size:18px;font-weight:800;color:var(--green);font-family:var(--disp);margin-top:4px">${r[2]}</div>
    <div style="margin-top:10px"><button class="btn btn-ghost btn-sm">Ver detalle</button></div></div>`).join('')}</div>
  <div class="card card-p">${ui.aiBox('Agrupo y concilio pagos automáticamente, evitando duplicidad. Cada lote crea su egreso asociado en Finanzas.','Conciliación')}</div>`;
});
