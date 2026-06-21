/* CXOrbia · Mi Perfil (shopper) */
CX.module('miperfil', ({data,ui})=>{
  const s=data.shoppers.find(x=>x.id==='sh1');
  return `
    ${ui.ph('Mi Perfil', 'Tu información, desempeño y certificaciones')}
    <div class="card card-p" style="margin-bottom:16px">
      <div class="flex" style="gap:14px">
        <div class="rail-av" style="width:54px;height:54px;font-size:20px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${s.nombre.split(' ').map(x=>x[0]).join('')}</div>
        <div style="flex:1"><div class="card-t" style="font-size:18px">${s.nombre}</div><div style="font-size:12px;color:var(--t3)">${s.ciudad}, ${s.pais} · Shopper ${s.estado}</div></div>
        <div style="text-align:right"><div style="font-size:22px;font-weight:800;color:var(--amber);font-family:var(--disp)">★ ${s.rating}</div><div style="font-size:10.5px;color:var(--t3)">tu calificación</div></div>
      </div>
    </div>
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Visitas',s.visitas,'b')}${ui.kpi('Postulaciones',s.postulaciones,'n')}
      ${ui.kpi('Prom. cuest.',s.promCuest+'d','g')}${ui.kpi('Certificaciones',s.certs,'p')}
    </div>
    <div class="card card-p">${ui.aiBox('Tu calificación se calcula por cumplimiento + tiempos + alertas + certificaciones. Mejórala y accede a honorarios preferentes.','Cómo subir tu rating')}</div>`;
});

/* CXOrbia · Hojas de Ruta (admin) */
CX.module('rutas', ({data,ui})=>{
  const p=data.project();
  const rows=[
    ['1','Zona 10','15 jun','Daniela R.','Hecha','g'],
    ['2','Cayalá','16 jun','Marco T.','Hoy','a'],
    ['3','Miraflores','17 jun','Lucía P.','Plan','n'],
    ['4','Cayalá Norte','18 jun','— sin asignar','Plan','n'],
  ];
  return `
    ${ui.ph('Hojas de Ruta', p.name+' · planificación colaborativa, sincronizada con el estado real')}
    <div class="between" style="margin-bottom:14px">
      <div class="flex">${ui.bdg('Ruta Q2 · GT','b')} ${ui.bdg('👥 3 editando','p')}</div>
      <button class="btn btn-pr btn-sm">+ Parada</button>
    </div>
    <div class="card card-p">
      <table class="tbl"><thead><tr><th>#</th><th>Sucursal</th><th>Fecha</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>
        ${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td><b>${r[1]}</b></td><td style="font-size:12px">${r[2]}</td><td style="font-size:12px;color:var(--t2)">${r[3]}</td><td>${ui.bdg(r[4],r[5])}</td></tr>`).join('')}
      </tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Una sola fuente de verdad: ordeno la ruta y la mantengo sincronizada con el avance real de las visitas, sin Excel externo.','Sin Excel paralelo')}</div>
    </div>`;
});

/* CXOrbia · Reportes & KPIs / Informes (admin) */
CX.module('informes', ({data,ui})=>{
  const k=data.kpis(), p=data.project();
  return `
    ${ui.ph('Reportes & KPIs', p.name+' · entregables listos para dirección y cliente')}
    <div class="grid g4" style="margin-bottom:16px">
      ${ui.kpi('Cumplimiento',Math.round(k.realizadas.t/Math.max(k.total.t,1)*100)+'%','g')}
      ${ui.kpi('Velocidad media','1.4d','b')}
      ${ui.kpi('Calidad cuest.','92%','p')}
      ${ui.kpi('Rentabilidad','39.6%','a')}
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Exportables</div></div>
      <div class="grid g2">
        ${[['📊','Cumplimiento por sucursal'],['🗺️','Cobertura por país y quincena'],['🏆','Ranking de shoppers'],['💰','Liquidaciones del periodo']].map(r=>`<div class="card hov card-p flex" style="gap:12px"><div style="font-size:22px">${r[0]}</div><div style="flex:1;font-size:13px;font-weight:600;color:var(--t1)">${r[1]}</div><button class="btn btn-soft btn-sm">Exportar</button></div>`).join('')}
      </div>
      <div style="margin-top:14px">${ui.aiBox('Genero lecturas y exportables listos por proyecto, país y sucursal, y resalto tendencias y brechas — sin armar Excel a mano.','Reportería que se arma sola')}</div>
    </div>`;
});
