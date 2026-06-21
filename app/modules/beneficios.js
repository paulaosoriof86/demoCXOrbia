/* CXOrbia · Mis Beneficios (shopper) — full fidelity */
CX.module('beneficios', ({data,ui})=>{
  const p=data.project();
  const cur=p.currency[p.countries[0]];
  const hon=p.honorario[p.countries[0]], bol=(p.boleto&&p.boleto[p.countries[0]])||0, com=(p.comboAmt&&p.comboAmt[p.countries[0]])||0;
  const t=(h,b,c)=>h+b+c;
  const rows=[
    ['Sucursal 03 · Guatemala','2026-06-13',hon,bol,com,'Pend. submitir','a'],
    ['Sucursal 08 · Mixco','2026-06-12',hon,bol,com,'Pend. cuestionario','a'],
    ['Sucursal 11 · Villa Nueva','2026-06-10',hon,bol,com,'Validada','g'],
    ['Sucursal 02 · Guatemala','2026-06-08',hon,bol,com,'Pagada','b'],
  ];
  const totalRef=rows.reduce((a,r)=>a+t(r[2],r[3],r[4]),0);
  const pagado=rows.filter(r=>r[6]==='b').reduce((a,r)=>a+t(r[2],r[3],r[4]),0);
  const porCobrar=totalRef-pagado;
  return `
    ${ui.ph('Mis Beneficios', 'Honorarios, reembolsos y estado de pago de cada visita')}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Total referencial',ui.money(cur,totalRef),'g')}
      ${ui.kpi('Por cobrar',ui.money(cur,porCobrar),'a')}
      ${ui.kpi('Pagado',ui.money(cur,pagado),'b')}
      ${ui.kpi('Visitas',rows.length,'n')}
    </div>
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div style="font-size:12.5px;color:var(--brand-dark)">El flujo de pago es: <b>realizada → cuestionario → submitir → validada → pagada</b>. Cada total = honorario + boleto + combo, en tu moneda local.</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Detalle por visita</div><button class="btn btn-ghost btn-sm">⤓ Descargar comprobante</button></div>
      <table class="tbl"><thead><tr><th>Visita</th><th>Fecha</th><th>Honorario</th><th>Boleto</th><th>Combo</th><th>Total</th><th>Estado</th></tr></thead><tbody>
        ${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td style="font-size:12px">${r[1]}</td>
        <td>${ui.money(cur,r[2])}</td><td>${r[3]?ui.money(cur,r[3]):'—'}</td><td>${r[4]?ui.money(cur,r[4]):'—'}</td>
        <td style="font-weight:700;color:var(--t1)">${ui.money(cur,t(r[2],r[3],r[4]))}</td><td>${ui.bdg(r[5],r[6])}</td></tr>`).join('')}
      </tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Te muestro claro y al instante cuánto y cuándo cobras, sin tener que preguntar. Cada visita refleja su estado de pago en tiempo real.','Transparencia de pago')}</div>
    </div>`;
});
