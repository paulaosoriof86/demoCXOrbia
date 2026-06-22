/* CXOrbia · Mi Perfil (shopper) — editable + completar perfil + histórico/KPIs */
CX.module('miperfil', ({data,ui})=>{
  const sid=(CX.session.user&&CX.session.user.shopperId)||'sh1';
  const s=data.getShopper(sid)||data.shoppers[0];
  const st=data.shopperStats(s.id);
  const incompleto=!s.perfilCompleto;
  const initials=(s.nombre||'?').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
  const ids={pais:'mp_pais',depto:'mp_depto',ciudad:'mp_ciudad'};

  const drillVisits=(fn,title)=>{
    const vs=data.visitsForShopper(s.id).filter(fn||(()=>true));
    const body=vs.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Escenario</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>
      ${vs.map(v=>`<tr><td><b>${v.sucursal}</b><div style="font-size:11px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td>
        <td style="font-size:12px">${v.escenario}</td><td>${ui.estadoBadge(v.estado)}</td>
        <td style="font-size:12px">${v.realizada||v.agendada||v.disponibleDesde||'—'}</td></tr>`).join('')}</tbody></table>`
      :ui.empty('🗒️','Aún no tienes visitas en esta categoría. Postúlate desde Visitas Disponibles.');
    ui.modal(title, body);
  };

  const editModal=()=>{
    ui.modal('Editar mi perfil', `
      <div class="grid g2" style="gap:12px 14px">
        <div><label class="lbl">Primer nombre</label><input class="inp" id="mp_first" value="${s.firstName||''}"></div>
        <div><label class="lbl">Primer apellido</label><input class="inp" id="mp_last" value="${s.lastName||''}"></div>
        ${CX.geo.fieldsHTML(ids,{pais:s.pais,depto:s.depto,ciudad:s.ciudad})}
        <div><label class="lbl">WhatsApp</label><input class="inp" id="mp_wa" value="${s.whatsapp||''}"></div>
        <div><label class="lbl">Correo</label><input class="inp" id="mp_mail" value="${s.email||''}"></div>
        <div><label class="lbl">Edad</label><input class="inp" id="mp_edad" type="number" min="16" max="99" value="${s.edad||''}"></div>
        <div><label class="lbl">Sexo</label><select class="sel" id="mp_sexo">${['','Femenino','Masculino','Otro','Prefiero no decir'].map(o=>`<option ${o===(s.sexo||'')?'selected':''}>${o||'Selecciona…'}</option>`).join('')}</select></div>
        <div><label class="lbl">Documento (DPI / ID)</label><input class="inp" id="mp_dpi" value="${s.dpi||''}"></div>
        <div><label class="lbl">Cuenta de pago</label><input class="inp" id="mp_cta" value="${s.cuentaPago||''}" placeholder="Banco / número / nombre"></div>
      </div>
      <div style="text-align:right;margin-top:16px"><button class="btn btn-green" id="mp_save">Guardar</button></div>
    `, {onMount:(ov,close)=>{
      CX.geo.wire(ov,ids,{pais:s.pais,depto:s.depto,ciudad:s.ciudad});
      ov.querySelector('#mp_save').addEventListener('click',()=>{
        const geo=CX.geo.read(ov,ids);
        const patch={
          firstName:(ov.querySelector('#mp_first').value||'').trim(),
          lastName:(ov.querySelector('#mp_last').value||'').trim(),
          pais:geo.pais, depto:geo.depto, ciudad:geo.ciudad,
          whatsapp:(ov.querySelector('#mp_wa').value||'').trim(),
          email:(ov.querySelector('#mp_mail').value||'').trim(),
          edad:(ov.querySelector('#mp_edad').value||'').trim(),
          sexo:ov.querySelector('#mp_sexo').value||'',
          dpi:(ov.querySelector('#mp_dpi').value||'').trim(),
          cuentaPago:(ov.querySelector('#mp_cta').value||'').trim(),
        };
        patch.perfilCompleto=data.shopperProfileComplete(Object.assign({},s,patch));
        data.updateShopper(s.id,patch);
        // refrescar el nombre mostrado en sesión
        const ns=data.getShopper(s.id); if(ns){CX.session.user.name=ns.nombre;CX.session.save();}
        close(); CX.ui.toast(patch.perfilCompleto?'¡Perfil completo! Ya puedes postularte sin restricciones':'Perfil actualizado','ok',3200);
        CX.router.nav('miperfil');
      });
    }});
  };

  const banner = incompleto ? `
    <div class="card card-p" style="border-left:4px solid var(--amber);background:#fff8ec;margin-bottom:16px">
      <div class="between" style="gap:12px;flex-wrap:wrap">
        <div><div class="card-t" style="font-size:14px">Completa tu perfil</div>
        <div style="font-size:12.5px;color:var(--t2);margin-top:3px">Faltan datos para habilitarte todas las visitas (ciudad, edad, sexo, cuenta de pago).</div></div>
        <button class="btn btn-pr btn-sm" id="mpComplete">Completar ahora →</button>
      </div>
    </div>` : '';

  const dato=(l,v)=>`<div style="padding:8px 0;border-bottom:1px solid var(--border)" class="between"><span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">${l}</span><b style="font-size:13px;color:var(--t1);text-align:right">${v||'<span style=\"color:var(--t3)\">— sin dato</span>'}</b></div>`;

  setTimeout(()=>{
    document.getElementById('mpComplete')?.addEventListener('click',editModal);
    document.getElementById('mpEdit')?.addEventListener('click',editModal);
    const drills={all:[null,'Todas mis visitas'],done:[v=>['realizada','cuestionario','liquidada'].includes(v.estado),'Mis visitas realizadas'],
      liq:[v=>v.estado==='liquidada','Mis visitas liquidadas'],curso:[v=>['asignada','agendada','postulada'].includes(v.estado),'Mis visitas en curso']};
    document.querySelectorAll('#mpKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{const d=drills[el.dataset.k];drillVisits(d[0],d[1]);}));
  },0);

  return `
    ${ui.ph('Mi Perfil', 'Tu información, desempeño y certificaciones')}
    ${banner}
    <div class="card card-p" style="margin-bottom:16px">
      <div class="flex" style="gap:14px">
        <div class="rail-av" style="width:54px;height:54px;font-size:20px;background:linear-gradient(135deg,var(--brand),var(--brand-dark))">${initials}</div>
        <div style="flex:1"><div class="card-t" style="font-size:18px">${s.nombre}</div>
          <div style="font-size:12px;color:var(--t3)">${s.ciudad?s.ciudad+', ':''}${CX.paisName(s.pais)||'—'} · ${s.code} · ${s.estado}</div>
          <div class="flex" style="gap:6px;margin-top:6px">${s.perfilCompleto?ui.bdg('Perfil completo','g'):ui.bdg('Perfil incompleto','a')}</div></div>
        <div style="text-align:right"><div style="font-size:22px;font-weight:800;color:var(--amber);font-family:var(--disp)">${s.rating?('★ '+s.rating):'—'}</div><div style="font-size:10.5px;color:var(--t3)">tu calificación</div></div>
      </div>
    </div>
    <div class="grid g4" style="margin-bottom:6px" id="mpKpis">
      <div data-k="all" style="cursor:pointer">${ui.kpi('Visitas',st.total,'b')}</div>
      <div data-k="done" style="cursor:pointer">${ui.kpi('Realizadas',st.realizadas,'g')}</div>
      <div data-k="liq" style="cursor:pointer">${ui.kpi('Liquidadas',st.liquidadas,'p')}</div>
      <div data-k="curso" style="cursor:pointer">${ui.kpi('En curso',st.enCurso,'a')}</div>
    </div>
    <div style="font-size:11px;color:var(--t3);text-align:right;margin-bottom:16px">↑ toca un indicador para ver el detalle</div>
    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">Mis datos</div><button class="btn btn-soft btn-sm" id="mpEdit">✎ Editar</button></div>
      ${dato('WhatsApp',s.whatsapp)}${dato('Correo',s.email)}${dato(CX.geo.deptLabel(s.pais),s.depto)}${dato('Edad',s.edad)}${dato('Sexo',s.sexo)}${dato('Documento',s.dpi)}${dato('Cuenta de pago',s.cuentaPago)}
    </div>
    <div class="card card-p">${ui.aiBox('Tu calificación se calcula por cumplimiento + tiempos + alertas + certificaciones. Mantén tu perfil completo para acceder a más visitas y honorarios preferentes.','Cómo subir tu rating')}</div>`;
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
