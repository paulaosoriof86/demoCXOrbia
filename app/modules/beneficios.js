/* CXOrbia · Mis Beneficios (shopper) — honorarios vs reembolsos + beneficios en especie */
CX.module('beneficios', ({data,ui})=>{
  const p=data.period();
  /* P0-D (paquete 20260711): shopper obligatorio — el fallback previo a 'sh1' hacía que
     cualquier sesión sin shopperId (ej. un rol mal mapeado) heredara los beneficios de un
     shopper fijo. Sin identidad de shopper autenticada, la vista se muestra vacía/pending,
     nunca con datos de otro shopper. */
  const sid = CX.session.user && CX.session.user.shopperId;
  if(!sid){
    return `<div class="card card-p">${ui.empty('👤','No hay un shopper autenticado en esta sesión — no se muestran beneficios de otra identidad.')}</div>`;
  }
  const myVisitIds=new Set((data.visitsForShopper?data.visitsForShopper(sid):[]).map(v=>v.id));
  const allProj=CX.liq.forProject(data);
  const all=allProj.filter(l=>myVisitIds.has(l.visitaId));
  /* V177 P0-3 — SIN moneda primaria del proyecto en ninguna zona. Todo se agrupa por l.moneda.
     benefits_declares_currency_grouping_contract: groupByCurrency / porMoneda / currencyGroups. */
  const isPaid=(l)=>l.paymentConfirmed===true && !!(l.paymentSourceRef||l.paymentRef);
  const curOfL=(l)=>l.moneda||(l.pais&&p.currency&&p.currency[l.pais])||null;
  const _bmoney=(l,v)=>{const cu=curOfL(l);return cu?ui.money(cu,v):'<span class="bdg bdg-a" style="font-size:9px">Pendiente de moneda</span>';};
  const BENEFITS_CURRENCY_GROUPING_CONTRACT='group_by_moneda_never_first_country';
  /* R32 P0-6 — filas sin moneda resoluble: bandeja visible de revisión, NO entran a KPIs/barras/total. */
  const pendingCurrency=all.filter(l=>!curOfL(l));
  const resolved=all.filter(l=>curOfL(l));
  const byCur={}; const groupByCurrency=byCur; /* totalsByCurrency / porMoneda */
  const bump=(cu,k,v)=>{const a=byCur[cu]||(byCur[cu]={hon:0,reemb:0,porCobrar:0,pagado:0,combo:0,boleto:0,n:0});a[k]+=v;};
  all.forEach(l=>{const cu=curOfL(l); if(!cu){return;} /* R32 P0-6: sin moneda no entra a KPIs/barras/total */ bump(cu,'n',1); bump(cu,'hon',l.honorario||0); bump(cu,'reemb',l.reembolso||0); bump(cu,'combo',l.combo||0); bump(cu,'boleto',l.boleto||0);
    if(isPaid(l))bump(cu,'pagado',l.total||0); else bump(cu,'porCobrar',l.total||0); });
  const curList=[...new Set(resolved.map(curOfL))].filter(Boolean);
  const multiCur=curList.length>1;

  const row=(l)=>{
    const lb=CX.liq.label(l.estado);
    const v=data._visitas.find(x=>x.id===l.visitaId);
    const vc=v&&data.visitContract?data.visitContract(v):null;
    return `<tr><td><b>${l.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(l.pais)} ${l.shopper||''}</div></td>
      <td style="font-size:12px">${l.freal||'—'}</td>
      <td style="color:var(--green);font-weight:700">${_bmoney(l,l.honorario)}</td>
      <td style="color:var(--purple);font-weight:600">${l.reembolso?_bmoney(l,l.reembolso):'—'}</td>
      <td style="font-weight:700;color:var(--t1)">${_bmoney(l,l.total)}</td>
      <td>${ui.bdg(lb[0],lb[1])}</td>
      <td style="font-size:12px;${isPaid(l)?'color:var(--green);font-weight:700':''}">${isPaid(l)?'✓ '+(l.fechaEstimadaPago||''):(l.fechaEstimadaPago||'—')}</td>
      <td>${vc&&vc.paymentState!=='no_aplica'?ui.bdg(vc.paymentState,vc.paymentState==='confirmado'?'g':'n'):'—'}</td></tr>`;
  };

  /* conceptos de reembolso GENÉRICOS por moneda (sin moneda primaria). */
  const conceptoReemb = p.combo || 'Consumo del programa';

  setTimeout(()=>{
    const benDrill=(title,arr)=>ui.modal(title+' · '+arr.length+' visita(s)', arr.length?`<table class="tbl"><thead><tr><th>Visita</th><th>Honorario</th><th>Reembolso</th><th>Total</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${arr.map(l=>{const lb=CX.liq.label(l.estado);return `<tr><td><b style="font-size:12.5px">${l.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(l.pais)} ${l.freal||''}</div></td><td style="color:var(--green);font-weight:700">${_bmoney(l,l.honorario)}</td><td style="color:var(--purple)">${l.reembolso?_bmoney(l,l.reembolso):'—'}</td><td style="font-weight:700">${_bmoney(l,l.total)}</td><td>${ui.bdg(lb[0],lb[1])}</td><td style="font-size:11px">${l.fechaEstimadaPago||'—'}</td></tr>`;}).join('')}</tbody></table>`:ui.empty('💰','Sin visitas en esta categoría.'));
    const benKp={hon:['💵 Honorarios',resolved],reemb:['🎁 Reembolsos',resolved.filter(l=>l.reembolso>0)],cobrar:['⏳ Por cobrar',resolved.filter(l=>!isPaid(l))],pagado:['✅ Pagado',resolved.filter(l=>isPaid(l))]};
    document.querySelectorAll('#benKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{const d=benKp[el.dataset.k];const cu=el.dataset.cur;const arr=cu?d[1].filter(l=>(l.moneda||'—')===cu):d[1];benDrill(d[0]+(cu?(' · '+cu):''),arr);}));
  },0);

  return `
    ${ui.ph('Mis Beneficios', p.name+' · lo que ganas y lo que disfrutas, claro y separado')}

    <div id="benKpis">${curList.length?curList.map(cu=>{const a=byCur[cu];return `<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Moneda ${cu}</div><div class="grid g4"><div data-k="hon" data-cur="${cu}" style="cursor:pointer">${ui.kpi('💵 Honorarios',ui.money(cu,a.hon),'g','tu ganancia en efectivo')}</div><div data-k="reemb" data-cur="${cu}" style="cursor:pointer">${ui.kpi('🎁 Reembolsos',ui.money(cu,a.reemb),'p','gastos del programa cubiertos')}</div><div data-k="cobrar" data-cur="${cu}" style="cursor:pointer">${ui.kpi('⏳ Por cobrar',ui.money(cu,a.porCobrar),'a')}</div><div data-k="pagado" data-cur="${cu}" style="cursor:pointer">${ui.kpi('✅ Pagado',ui.money(cu,a.pagado),'b','solo con pago confirmado')}</div></div></div>`;}).join(''):`<div class="muted" style="font-size:12px;padding:8px 0">Sin liquidaciones en este periodo.</div>`}</div>
    ${curList.length>1?`<div style="font-size:10.5px;color:var(--t3);margin-top:2px">Cada liquidación conserva su moneda; GTQ y HNL no se suman entre sí.</div>`:''}
    ${pendingCurrency.length?`<div class="card card-p" style="margin:10px 0;border-left:3px solid var(--red)"><div class="flex" style="gap:8px;align-items:center;margin-bottom:4px"><span style="font-size:16px">🔒</span><b style="font-size:12.5px">Revisión · ${pendingCurrency.length} liquidación(es) sin moneda</b></div><div style="font-size:11.5px;color:var(--t2)">Estas visitas no tienen moneda resuelta en la fuente; no se incluyen en tus totales ni barras hasta que se corrijan. ${pendingCurrency.map(l=>l.sucursal||l.visitaId).join(', ')}</div></div>`:''}
    <div style="font-size:10.5px;color:var(--t3);margin-top:6px">"Pagado" solo cuenta liquidaciones con pago confirmado y referencia de fuente; hoy la fuente mantiene 0 pagos confirmados.</div>

    <div class="grid g2" style="margin-bottom:16px">
      <div class="card card-p" style="background:linear-gradient(135deg,#eafaf1,#f3eeff);border-color:#d7ead9">
        <div class="card-t" style="margin-bottom:6px">🎉 Tu beneficio total como evaluador</div>
        <div style="font-size:12.5px;color:var(--t2);margin-bottom:12px">No solo cobras honorarios: el programa también <b>cubre los gastos/consumos requeridos por la evaluación</b>. Beneficio percibido <b>por moneda</b> (no se suman entre sí):</div>
        ${curList.length?curList.map(cu=>{const a=byCur[cu];return `<div class="between" style="padding:9px 0;border-bottom:1px solid var(--border-2)"><span style="font-size:13px;color:var(--t1)">Moneda ${cu} · 💵 honorario + 🎁 reembolso</span><b style="font-family:var(--disp);font-size:18px;color:var(--green)">${ui.money(cu,a.hon+a.reemb)}</b></div>`;}).join(''):'<div class="muted" style="font-size:12px;padding:8px 0">Sin liquidaciones en este periodo.</div>'}
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:10px">💡 Honorarios vs reembolsos · por moneda</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:12px">El <b style="color:var(--green)">honorario</b> es tu pago por evaluar. El <b style="color:var(--purple)">reembolso</b> te devuelve los gastos o consumos que el programa requiere. Cada moneda se muestra por separado (no se suman).</div>
        ${curList.length?curList.map(cu=>{const a=byCur[cu];const t=a.hon+a.reemb;return `<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;color:var(--t2);margin-bottom:4px">Moneda ${cu}</div>${ui.bar(t?Math.round(a.hon/t*100):0,'Honorario',ui.money(cu,a.hon))}${ui.bar(t?Math.round(a.reemb/t*100):0,'Reembolso',ui.money(cu,a.reemb))}</div>`;}).join(''):'<div class="muted" style="font-size:12px">Sin liquidaciones.</div>'}
        <div style="margin-top:12px">${ui.aiBox('El reembolso es flujo: te devuelve los gastos/consumos que el programa requiere. El honorario es tu ganancia real. Cada proyecto define sus conceptos de reembolso (genérico, no fijo).','Beneficio claro')}</div>
      </div>
    </div>

    <div class="card card-p">
      <div class="card-h"><div class="card-t">Detalle por visita</div><button class="btn btn-ghost btn-sm">⤓ Descargar comprobante</button></div>
      <div class="scroll-hint" aria-label="Desliza para ver más" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Visita</th><th>Realizada</th><th>💵 Honorario</th><th>🎁 Reembolso</th><th>Total</th><th>Estado</th><th>Pago estimado</th><th>Pago (contrato)</th></tr></thead>
      <tbody>${all.length?all.map(row).join(''):'<tr><td colspan="8">'+ui.empty('💰','Sin liquidaciones aún')+'</td></tr>'}</tbody></table></div>
    </div>`;
});
