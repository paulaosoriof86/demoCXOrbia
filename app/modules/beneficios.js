/* CXOrbia · Mis Beneficios (shopper) — derivado de la sincronía visita↔liquidación */
CX.module('beneficios', ({data,ui})=>{
  const p=data.project();
  // liquidaciones del shopper actual (demo: las del proyecto activo asociadas a shoppers asignados)
  const all=CX.liq.forProject(data);
  const cur=p.currency[p.countries[0]];
  const porCobrar=all.filter(l=>l.estado!=='pagada').reduce((a,l)=>a+l.total,0);
  const pagado=all.filter(l=>l.estado==='pagada').reduce((a,l)=>a+l.total,0);

  const row=(l)=>{
    const lb=CX.liq.label(l.estado);
    return `<tr><td><b>${l.sucursal}</b><div style="font-size:10px;color:var(--t3)">${l.shopper||''}</div></td>
      <td style="font-size:12px">${l.freal||'—'}</td>
      <td>${ui.money(l.moneda,l.honorario)}</td>
      <td>${l.boleto?ui.money(l.moneda,l.boleto):'—'}</td>
      <td>${l.combo?ui.money(l.moneda,l.combo):'—'}</td>
      <td style="font-weight:700;color:var(--t1)">${ui.money(l.moneda,l.total)}</td>
      <td>${ui.bdg(lb[0],lb[1])}</td>
      <td style="font-size:12px;${l.estado==='pagada'?'color:var(--green);font-weight:700':''}">${l.estado==='pagada'?'✓ '+(l.fechaEstimadaPago||''):(l.fechaEstimadaPago||'—')}</td></tr>`;
  };

  return `
    ${ui.ph('Mis Beneficios', p.name+' · honorarios, reembolsos y fecha estimada de pago')}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Total referencial',ui.money(cur,porCobrar+pagado),'g')}
      ${ui.kpi('Por cobrar',ui.money(cur,porCobrar),'a')}
      ${ui.kpi('Pagado',ui.money(cur,pagado),'b')}
      ${ui.kpi('Visitas',all.length,'n')}
    </div>
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div style="font-size:12.5px;color:var(--brand-dark)">Tu pago se estima según las reglas de <b>${p.name}</b>: ${(p.pago&&p.pago.logica)||'pago tras submitir el cuestionario'} (≈ ${CX.liq.diasPago(p)} días desde la realización/submit). El estado avanza solo a medida que completas cada paso de la visita.</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Detalle por visita</div><button class="btn btn-ghost btn-sm">⤓ Descargar comprobante</button></div>
      <table class="tbl"><thead><tr><th>Visita</th><th>Realizada</th><th>Honorario</th><th>Boleto</th><th>Combo</th><th>Total</th><th>Estado</th><th>Pago estimado</th></tr></thead>
      <tbody>${all.length?all.map(row).join(''):'<tr><td colspan="8">'+ui.empty('💰','Sin liquidaciones aún')+'</td></tr>'}</tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Te muestro al instante cuánto y cuándo cobras. El estado se sincroniza con tus visitas: realizada → pend. cuestionario → validada → pagada, con fecha estimada según el cliente.','Transparencia de pago sincronizada')}</div>
    </div>`;
});
