/* CXOrbia · Finanzas (admin) — full fidelity
   Dashboard Financiero · Movimientos · Liquidaciones · Lotes de Pago
   GT (Q) y HN (L) SIEMPRE separados, nunca se suman. */

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
  const p=data.project(), f=_fin(data);
  const rows=Object.keys(f).map(c=>{const d=f[c];
    return `<tr><td><b>${c}</b></td><td>${d.cur}</td><td>${d.vis}</td><td>${_m(d.cur,d.hon)}</td><td>${_m(d.cur,d.bol)}</td><td>${_m(d.cur,d.com)}</td><td>${_m(d.cur,d.reemb)}</td><td><b>${_m(d.cur,d.total)}</b></td><td>${d.cur} 0</td></tr>`;}).join('');
  const kpis=Object.keys(f).flatMap(c=>{const d=f[c];return [
    `<div class="kpi g"><div class="k-l">Honorarios ${c}</div><div class="k-v" style="font-size:20px">${_m(d.cur,d.hon)}</div><div class="k-s">${d.vis} visitas realizadas</div></div>`,
    `<div class="kpi b"><div class="k-l">Reembolsos ${c}</div><div class="k-v" style="font-size:20px">${_m(d.cur,d.reemb)}</div><div class="k-s">boleto + combo (flujo)</div></div>`,
  ];});
  return `
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Dashboard Financiero', p.name+' · márgenes reales · GT (Q) y HN (L) separados')}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>
  <div class="flex wrap" style="gap:8px;margin-bottom:16px">
    <select class="sel" style="width:auto"><option>Todos los proyectos</option><option selected>${p.name}</option></select>
    <select class="sel" style="width:auto"><option>JUN 2026</option></select>
    <select class="sel" style="width:auto"><option>${p.countries.join(' + ')}</option></select>
  </div>
  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-t" style="margin-bottom:8px">💰 Resumen financiero operativo desde HR</div>
    <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">Reembolsos = boleto + combo de la HR. Total shopper = honorarios + reembolsos. <b>GT y HN permanecen separados por moneda.</b></div>
    <table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Visitas real.</th><th>Honorarios</th><th>Boleto HR</th><th>Combo HR</th><th>Reembolsos</th><th>Total shoppers</th><th>Pend. pago</th></tr></thead><tbody>${rows}</tbody></table>
  </div>
  <div class="grid" style="grid-template-columns:repeat(${Math.min(4,kpis.length+1)},1fr);gap:11px;margin-bottom:16px">
    ${kpis.join('')}
    <div class="kpi a"><div class="k-l">Margen neto</div><div class="k-v" style="font-size:20px">39.6%</div><div class="k-s">Ingreso − honorario efectivo</div></div>
  </div>
  <div class="card card-p">
    <div style="font-size:12px;color:var(--t2)">Margen = Ingresos en USD × TC − Honorarios efectivos. El reembolso (combo+boleto) es flujo de caja adicional y <b>no impacta utilidad</b>. <a style="color:var(--brand);cursor:pointer">Editar tasas</a></div>
    <div style="margin-top:12px">${ui.aiBox('Conecto operación y dinero: el margen por proyecto se calcula solo. Quetzales y lempiras se mantienen separados, nunca se suman.','Margen automático')}</div>
  </div>`;
});

CX.module('movimientos', ({data,ui})=>{
  const p=data.project(), cur=p.currency[p.countries[0]];
  const rows=[
    ['2026-06-03','Anticipo cliente','Ingreso','Cliente (demo)',p.countries[0],40000,'Conciliado','g'],
    ['2026-06-12','Pago lote #L-204','Egreso','Evaluadores',p.countries[0],-18240,'Pagado','r'],
    ['2026-06-15','Reembolso combo','Egreso','Evaluadores',p.countries[0],-3110,'Pagado','r'],
    ['2026-06-20','Factura final cliente','Ingreso','Cliente (demo)',p.countries[0],46400,'Pendiente','a'],
  ];
  const ing=rows.filter(r=>r[5]>0).reduce((a,r)=>a+r[5],0), egr=rows.filter(r=>r[5]<0).reduce((a,r)=>a+r[5],0);
  return `
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Movimientos', p.name+' · ingresos y egresos · saldos separados por moneda')}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>
  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-t" style="margin-bottom:8px">⚡ Inicio financiero operativo</div>
    <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:11.5px;color:var(--brand-dark);margin-bottom:12px">Registra anticipos y pagos; la importación histórica se revisa primero en vista previa para evitar duplicados.</div>
    <div class="flex wrap"><button class="btn btn-green btn-sm">＋ Registrar anticipo</button><button class="btn btn-pr btn-sm">💳 Registrar pago shopper</button><button class="btn btn-ghost btn-sm">⤓ Exportar movimientos</button><button class="btn btn-ghost btn-sm">👁 Vista previa histórico</button></div>
  </div>
  <div class="grid g4" style="margin-bottom:16px">
    ${ui.kpi('Ingresos',_m(cur,ing),'g')}${ui.kpi('Egresos',_m(cur,Math.abs(egr)),'r')}
    ${ui.kpi('Saldo neto',_m(cur,ing+egr),'b')}${ui.kpi('Movimientos',rows.length,'n')}
  </div>
  <div class="card card-p">
    <div class="between" style="margin-bottom:12px"><div class="card-t">Movimientos del periodo</div>
      <div class="flex"><select class="sel btn-sm" style="width:auto"><option>Todos los países</option></select><select class="sel btn-sm" style="width:auto"><option>Todos</option></select><button class="btn btn-green btn-sm">＋ Nuevo movimiento</button></div></div>
    <table class="tbl"><thead><tr><th>Fecha</th><th>Concepto</th><th>Clasificación</th><th>Beneficiario</th><th>País</th><th style="text-align:right">Valor</th><th>Estado</th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td style="font-size:12px">${r[0]}</td><td><b>${r[1]}</b></td><td>${ui.bdg(r[2],r[2]==='Ingreso'?'g':'r')}</td><td style="font-size:12px">${r[3]}</td><td>${r[4]}</td><td style="text-align:right;font-weight:700;color:var(--${r[5]<0?'red':'green'})">${r[5]<0?'− ':'+ '}${_m(cur,Math.abs(r[5]))}</td><td>${ui.bdg(r[6],r[7])}</td></tr>`).join('')}
    </tbody></table>
  </div>`;
});

CX.module('liquidaciones', ({data,ui})=>{
  const p=data.project(), f=_fin(data);
  const oblig=Object.keys(f).map(c=>{const d=f[c];return `<tr><td><b>${c}</b></td><td>${d.cur}</td><td>${d.vis}</td><td>${_m(d.cur,d.hon)}</td><td>${_m(d.cur,d.reemb)}</td><td><b>${_m(d.cur,d.total)}</b></td><td>${d.cur} 0</td></tr>`;}).join('');
  const liq=data.visitas().filter(v=>['realizada','cuestionario','liquidada'].includes(v.estado)).slice(0,8);
  const lrow=(v)=>{const total=v.honorario+(v.boleto||0)+(v.comboAmt||0);const est=v.estado==='liquidada'?['Liquidada','g']:v.estado==='cuestionario'?['Pend. submitir','a']:['Pend. cuestionario','a'];
    return `<tr><td><b>${v.shopper||'—'}</b><div style="font-size:10px;color:var(--t3)">${v.shopperCode||''}</div></td><td style="font-size:12px">${v.sucursal}</td><td style="font-size:12px">${v.realizada||'—'}</td><td>${ui.bdg(est[0],est[1])}</td><td>${v.submit?'✅':'—'}</td><td>${_m(v.currency,v.honorario)}</td><td>${v.boleto?_m(v.currency,v.boleto):'—'}</td><td>${v.comboAmt?_m(v.currency,v.comboAmt):'—'}</td><td style="font-weight:700;color:var(--t1)">${_m(v.currency,total)}</td></tr>`;};
  return `
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Liquidaciones', p.name+' · honorarios por pagar a shoppers')}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>
  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-t" style="margin-bottom:8px">📊 Obligaciones derivadas de HR por país y moneda</div>
    <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">No se suman quetzales y lempiras. Reembolso = boleto + combo. Total shopper = honorario + reembolso.</div>
    <table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Visitas</th><th>Honorarios</th><th>Reembolsos</th><th>Total</th><th>Listo para pago</th></tr></thead><tbody>${oblig}</tbody></table>
  </div>
  <div class="card card-p">
    <div class="between" style="margin-bottom:12px"><div><div class="card-t">💸 Liquidaciones operativas</div><div style="font-size:11px;color:var(--t3)">Las visitas aparecen automáticamente desde HR. Solo el marcado de pago persiste y crea el egreso.</div></div>
      <div class="flex"><select class="sel btn-sm" style="width:auto"><option>Todos los estados</option></select><button class="btn btn-ghost btn-sm">⤓ Excel</button><button class="btn btn-pr btn-sm">📦 Preparar lote</button></div></div>
    <table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Visita</th><th>Estado</th><th>Submit.</th><th>Honorario</th><th>Boleto</th><th>Combo</th><th>Total</th></tr></thead><tbody>${liq.map(lrow).join('')}</tbody></table>
    <div style="margin-top:14px">${ui.aiBox('Calculo honorarios y reembolsos solo y armo el lote sin Excel. Ahorra horas administrativas: ROI directo para consultoras con muchos shoppers.','Liquidación automática')}</div>
  </div>`;
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
