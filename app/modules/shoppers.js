/* CXOrbia · Shoppers (admin) */
CX.module('shoppers', ({data,ui})=>{
  const list=data.shoppersFor();
  const row=(s)=>`<tr data-sid="${s.id}" style="cursor:pointer">
    <td><div class="flex"><div class="rail-av" style="width:30px;height:30px;font-size:11px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.nombre.split(' ').map(x=>x[0]).join('')}</div>
      <div><b>${s.nombre}</b><div style="font-size:11px;color:var(--t3)">${s.ciudad}, ${s.pais}</div></div></div></td>
    <td><span style="font-size:12px;font-weight:800;color:var(--amber)">★ ${s.rating}</span></td>
    <td style="font-size:12px">${s.visitas}</td>
    <td style="font-size:12px">${s.promCuest}d</td>
    <td>${s.estado==='Pendiente'?ui.bdg('Pendiente','a'):s.estado==='Certificado'?ui.bdg('Certificado','g'):ui.bdg('Activo','b')}</td>
    <td>${s.honorarioPref==='Preferente'?ui.bdg('Preferente','p'):ui.bdg('Estándar','n')}</td>
  </tr>`;

  const html=`
    ${ui.ph('Shoppers / Auditores', data.project().name+' · red de evaluadores y calificación')}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('En este proyecto',list.length,'b')}
      ${ui.kpi('Activos',list.filter(s=>s.estado!=='Pendiente').length,'g')}
      ${ui.kpi('Rating promedio',(list.reduce((a,s)=>a+s.rating,0)/list.length).toFixed(1),'a','★ sobre 5')}
      ${ui.kpi('Preferentes',list.filter(s=>s.honorarioPref==='Preferente').length,'p')}
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Base de shoppers</div><button class="btn btn-pr btn-sm">+ Nuevo shopper</button></div>
      <table class="tbl"><thead><tr><th>Shopper</th><th>Rating</th><th>Visitas</th><th>Prom. cuest.</th><th>Estado</th><th>Honorario</th></tr></thead>
      <tbody>${list.map(row).join('')}</tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Calificación calculada por cumplimiento + tiempos + alertas + certificaciones. El ranking de Top shoppers prioriza a los mejores y permite dar honorario preferente.','Calificación inteligente')}</div>
    </div>`;

  setTimeout(()=>document.querySelectorAll('[data-sid]').forEach(tr=>tr.addEventListener('click',()=>{
    const s=list.find(x=>x.id===tr.dataset.sid);
    ui.modal(s.nombre,`
      <div class="between" style="margin-bottom:14px">
        <div class="flex"><div class="rail-av" style="width:46px;height:46px;font-size:16px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.nombre.split(' ').map(x=>x[0]).join('')}</div>
        <div><div class="card-t" style="font-size:16px">${s.nombre}</div><div style="font-size:12px;color:var(--t3)">${s.ciudad}, ${s.pais} · ${s.estado}</div></div></div>
        <span style="font-size:18px;font-weight:800;color:var(--amber)">★ ${s.rating}</span>
      </div>
      <div class="grid g4" style="margin-bottom:14px">
        ${ui.kpi('Visitas',s.visitas,'b')}${ui.kpi('Postulaciones',s.postulaciones,'n')}
        ${ui.kpi('Prom. cuest.',s.promCuest+'d','g')}${ui.kpi('Certificaciones',s.certs,'p')}
      </div>
      ${ui.aiBox('Calificación = Cumplimiento + Tiempos + Alertas + Certificaciones. Asigna a los mejores; da honorario preferente a los top.','Por qué este rating')}
      <div class="flex" style="margin-top:16px;justify-content:flex-end"><button class="btn btn-ghost btn-sm">Editar honorario</button><button class="btn btn-pr btn-sm">Asignar visita</button></div>
    `);
  })),0);
  return html;
});
