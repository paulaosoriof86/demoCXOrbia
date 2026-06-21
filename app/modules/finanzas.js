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
  const p=data.project();
  const all=CX.liq.forProject(data);
  const res=CX.liq.resumen(all);
  // obligaciones por país/moneda
  const oblig=p.countries.map(c=>{
    const ls=all.filter(l=>l.pais===c);
    const hon=ls.reduce((a,l)=>a+l.honorario,0), reemb=ls.reduce((a,l)=>a+l.reembolso,0), tot=ls.reduce((a,l)=>a+l.total,0);
    const listo=ls.filter(l=>l.estado==='validada').reduce((a,l)=>a+l.total,0);
    return `<tr><td><b>${c}</b></td><td>${p.currency[c]}</td><td>${ls.length}</td><td>${ui.money(p.currency[c],hon)}</td><td>${ui.money(p.currency[c],reemb)}</td><td><b>${ui.money(p.currency[c],tot)}</b></td><td>${ui.money(p.currency[c],listo)}</td></tr>`;
  }).join('');

  const lrow=(l,i)=>{const lb=CX.liq.label(l.estado);
    return `<tr data-li="${i}"><td><b>${l.shopper||'—'}</b><div style="font-size:10px;color:var(--t3)">${l.shopperCode||''}</div></td>
      <td style="font-size:12px">${l.sucursal}</td><td style="font-size:12px">${l.freal||'—'}</td>
      <td>${ui.bdg(lb[0],lb[1])}</td><td>${l.submit?'✅':'—'}</td>
      <td>${ui.money(l.moneda,l.honorario)}</td><td>${l.boleto?ui.money(l.moneda,l.boleto):'—'}</td><td>${l.combo?ui.money(l.moneda,l.combo):'—'}</td>
      <td style="font-weight:700;color:var(--t1)">${ui.money(l.moneda,l.total)}</td>
      <td style="font-size:12px">${l.fechaEstimadaPago||'—'}</td>
      <td style="text-align:right">${l.estado==='validada'?`<button class="btn btn-ghost btn-sm" data-adv="${i}">▶ Mover</button>`:l.estado==='pendiente_cuestionario'?ui.bdg('espera shopper','n'):l.estado==='pagada'?ui.bdg('✓','g'):ui.bdg('—','n')}</td></tr>`;};

  const html=`
  <div class="between" style="margin-bottom:12px"><div>${ui.ph('Liquidaciones', p.name+' · sincronizadas con el avance de cada visita')}</div>
    <div class="flex"><span class="bdg bdg-g">● En vivo</span><button class="btn btn-ghost btn-sm">⤓ Exportar</button></div></div>

  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px">
    ${ui.kpi('Pend. cuestionario',res.pendiente_cuestionario||0,'a')}
    ${ui.kpi('Pend./Validadas',(res.pendiente_submitir||0)+(res.validada||0),'b')}
    ${ui.kpi('Listas para lote',res.validada||0,'b')}
    ${ui.kpi('Pagadas',res.pagada||0,'g')}
  </div>

  <div class="card card-p" style="margin-bottom:16px">
    <div class="card-t" style="margin-bottom:8px">📊 Obligaciones por país y moneda</div>
    <div style="background:var(--amber-bg);border-radius:9px;padding:9px 12px;font-size:11.5px;color:#8a5b00;margin-bottom:12px">No se suman quetzales y lempiras. Total = honorario + reembolso (boleto + combo). El estado y la <b>fecha estimada de pago</b> se derivan del avance de la visita.</div>
    <table class="tbl"><thead><tr><th>País</th><th>Moneda</th><th>Visitas</th><th>Honorarios</th><th>Reembolsos</th><th>Total</th><th>Listo para lote</th></tr></thead><tbody>${oblig}</tbody></table>
  </div>

  <div class="card card-p">
    <div class="between" style="margin-bottom:12px"><div><div class="card-t">💸 Liquidaciones operativas</div>
      <div style="font-size:11px;color:var(--t3)">El estado avanza solo con la visita. Al preparar lote eliges qué visitas incluir.</div></div>
      <button class="btn btn-pr btn-sm" id="prepLote">📦 Preparar lote</button></div>
    <table class="tbl"><thead><tr><th>Shopper</th><th>Sucursal</th><th>Realizada</th><th>Estado</th><th>Submit.</th><th>Honorario</th><th>Boleto</th><th>Combo</th><th>Total</th><th>Pago est.</th><th></th></tr></thead>
    <tbody id="liqBody">${all.map(lrow).join('')}</tbody></table>
    <div style="margin-top:14px">${ui.aiBox('Cada liquidación nace del avance de la visita: realizada → pend. cuestionario → validada → en lote → pagada, con fecha estimada de pago según las reglas del cliente. Cero captura manual.','Liquidación sincronizada')}</div>
  </div>`;

  setTimeout(()=>{
    document.querySelectorAll('[data-adv]').forEach(b=>b.addEventListener('click',()=>{
      const tr=b.closest('tr'); tr.children[3].innerHTML=ui.bdg('En lote','p'); tr.children[10].innerHTML=ui.bdg('—','n');
      ui.toast('Liquidación movida a "en lote"','ok');
    }));
    const prep=document.getElementById('prepLote');
    if(prep)prep.addEventListener('click',()=>{
      const validadas=all.map((l,i)=>({l,i})).filter(x=>x.l.estado==='validada');
      const rows=validadas.length?validadas.map(x=>`<label class="between" style="padding:9px 11px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer">
        <span><input type="checkbox" class="loteChk" data-i="${x.i}" checked style="margin-right:8px"><b style="font-size:13px">${x.l.shopper}</b> · ${x.l.sucursal}<div style="font-size:11px;color:var(--t3)">${x.l.pais} · pago est. ${x.l.fechaEstimadaPago}</div></span>
        <b style="color:var(--green)">${ui.money(x.l.moneda,x.l.total)}</b></label>`).join('')
        : ui.empty('📦','No hay liquidaciones validadas para incluir');
      ui.modal('Preparar lote de pago',`
        <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Selecciona las visitas <b>validadas</b> a incluir. Una sola moneda por lote (GT y HN no se mezclan). Al pagar el lote se generan los movimientos de egreso de cada shopper de una sola vez.</p>
        ${rows}
        <div class="between" style="margin-top:14px"><div id="loteTot" style="font-size:13px;font-weight:700;color:var(--t1)"></div>
        <button class="btn btn-green btn-sm" id="loteCreate" ${validadas.length?'':'disabled'}>Crear lote</button></div>
      `,{onMount:(ov,close)=>{
        const calc=()=>{let t=0,m='';ov.querySelectorAll('.loteChk:checked').forEach(c=>{const l=all[+c.dataset.i];t+=l.total;m=l.moneda;});ov.querySelector('#loteTot').textContent=validadas.length?('Total lote: '+ui.money(m||p.currency[p.countries[0]],t)):'';};
        ov.querySelectorAll('.loteChk').forEach(c=>c.addEventListener('change',calc));calc();
        const cr=ov.querySelector('#loteCreate'); if(cr)cr.addEventListener('click',()=>{const n=ov.querySelectorAll('.loteChk:checked').length;close();ui.toast('Lote creado con '+n+' visita(s) · egresos generados en Movimientos','ok');});
      }});
    });
  },0);
  return html;
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
