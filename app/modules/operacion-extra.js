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

/* CXOrbia · Hojas de Ruta (admin) — interna / importada / ONLINE con sync sin duplicar */
CX.module('rutas', ({data,ui})=>{
  const p=data.project();
  const online=CX.hr.esOnline(p);
  const rows=CX.hr.external(p);
  const d=CX.hr.diff(p);
  const fuentes=['Hoja creada en plataforma','Google Sheets (online)','Excel Online','Excel importado'];
  const flag=(r)=>{ if(!r.visitId) return ui.bdg('Nuevo en HR','a'); const u=d.updates.find(x=>x.row.extId===r.extId); return u?ui.bdg('Cambió','b'):ui.bdg('Sincronizado','g'); };
  const row=(r)=>`<tr>
    <td style="font-size:11px;color:var(--t3)">${r.extId}</td>
    <td><b style="font-size:12.5px">${r.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(r.pais)} ${r.ciudad} · ${r.quincena} · ${r.escenario}</div></td>
    <td><input class="inp hrF" data-id="${r.extId}" type="date" value="${(r.fecha||'').slice(0,10)}" style="padding:5px 7px;width:140px"></td>
    <td><input class="inp hrR" data-id="${r.extId}" type="number" value="${r.reembolso||0}" style="padding:5px 7px;width:84px"></td>
    <td style="font-size:12px">${r.shopper||'<span class="muted">—</span>'}</td>
    <td>${r.origen==='hr'?ui.bdg('Alta en HR','t'):ui.bdg('Plataforma','n')}</td>
    <td>${flag(r)}</td>
  </tr>`;

  const syncBar = online ? `
    <div class="card card-p" style="margin-bottom:14px;background:var(--brand-light);border-color:#cfe6f7">
      <div class="between" style="flex-wrap:wrap;gap:10px">
        <div style="font-size:12.5px;color:var(--brand-dark)">Lectura en vivo de la HR externa. Detecté
          <b>${d.nuevos.length}</b> alta(s) hecha(s) directamente en la hoja y <b>${d.updates.length}</b> cambio(s) de fecha/reembolso.
          Se sincronizan a la plataforma <b>sin duplicar</b>.</div>
        <div class="flex" style="gap:8px"><button class="btn btn-ghost btn-sm" id="hrRead">🔄 Leer en vivo</button>
          <button class="btn btn-green btn-sm" id="hrSync">⇄ Sincronizar (${d.nuevos.length+d.updates.length})</button></div>
      </div>
    </div>` : '';

  const host=ui.el('div');
  host.innerHTML=`
    ${ui.ph('Hojas de Ruta', p.name+' · las Visitas Disponibles se derivan de la HR activa')}
    <div class="card card-p" style="margin-bottom:14px">
      <div class="between" style="flex-wrap:wrap;gap:12px;align-items:flex-end">
        <div><label class="lbl">Origen de la HR</label><select class="sel" id="hrSrc" style="width:auto;min-width:230px">${fuentes.map(f=>`<option ${f===CX.hr.fuente(p)?'selected':''}>${f}</option>`).join('')}</select></div>
        <div class="flex" style="gap:8px">
          <button class="btn btn-soft btn-sm" id="hrImport">📥 Importar archivo</button>
          <button class="btn btn-ghost btn-sm" id="hrNew">＋ Parada</button>
        </div>
      </div>
      <div style="font-size:11.5px;color:var(--t3);margin-top:10px">${online?'🟢 HR externa conectada: el equipo puede asignar/editar en Sheets/Excel y la plataforma se alimenta de ahí.':'🗂️ HR interna: se trabaja dentro de la plataforma.'}</div>
    </div>
    ${syncBar}
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Filas de la hoja de ruta</div><span class="bdg bdg-b">${rows.length} paradas</span></div>
      <table class="tbl"><thead><tr><th>ID</th><th>Sucursal</th><th>Fecha</th><th>Reembolso</th><th>Shopper</th><th>Origen</th><th>Estado sync</th></tr></thead>
      <tbody>${rows.map(row).join('')}</tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Una sola fuente de verdad: edita fechas y reembolsos aquí o en la hoja externa; la plataforma se mantiene sincronizada y no duplica visitas (match por ID de fila).','HR viva, sin Excel paralelo')}</div>
    </div>`;

  setTimeout(()=>{
    host.querySelector('#hrSrc').addEventListener('change',e=>{ CX.hr.setFuente(p,e.target.value); CX.hr.invalidate(p); CX.ui.toast('Origen de HR: '+e.target.value,'ok'); CX.router.nav('rutas'); });
    host.querySelectorAll('.hrF').forEach(i=>i.addEventListener('change',()=>CX.hr.editRow(p,i.dataset.id,{fecha:i.value})));
    host.querySelectorAll('.hrR').forEach(i=>i.addEventListener('change',()=>CX.hr.editRow(p,i.dataset.id,{reembolso:+i.value||0})));
    const rd=host.querySelector('#hrRead'); if(rd)rd.addEventListener('click',()=>{ const dd=CX.hr.diff(p); CX.ui.toast('Leída en vivo · '+dd.total+' filas ('+dd.nuevos.length+' nuevas, '+dd.updates.length+' cambios)','ok',3200); CX.router.nav('rutas'); });
    const sy=host.querySelector('#hrSync'); if(sy)sy.addEventListener('click',()=>{ const res=CX.hr.sync(p); CX.ui.toast('Sincronizado · '+res.creadas+' visita(s) creada(s), '+res.actualizadas+' actualizada(s)','ok',3600); CX.router.nav('rutas'); });
    host.querySelector('#hrImport').addEventListener('click',()=>ui.modal('Importar Hoja de Ruta', `
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:10px">Sube tu HR (Excel/CSV). El sistema detecta columnas y las <b>mapea</b> a los campos de visita (sucursal, ciudad, fecha, escenario, honorario, reembolso). Anti-duplicado por sucursal+quincena.</p>
      <input type="file" accept=".csv,.xlsx,.xls" class="inp" style="padding:7px;margin-bottom:12px">
      <div style="background:var(--panel-2);border:1px solid var(--border);border-radius:9px;padding:10px;font-size:11.5px;color:var(--t3)">Vista previa de mapeo: Columna A→Sucursal · B→Ciudad · C→Fecha · D→Escenario · E→Honorario (editable en demo).</div>
      <div style="text-align:right;margin-top:14px"><button class="btn btn-green btn-sm" onclick="CX.ui.toast('HR importada y mapeada (demo)','ok');this.closest('.cx-ov').remove()">Importar y mapear</button></div>`));
    host.querySelector('#hrNew').addEventListener('click',()=>CX.ui.toast('Agrega paradas internas o impórtalas; en HR online se crean en la hoja','ok',3200));
  },0);
  return host;
});

/* CXOrbia · Reportes & KPIs / Informes (admin) */
CX.module('informes', ({data,ui})=>{
  const k=data.kpis(), p=data.project();
  setTimeout(()=>{
    const cump=p.countries.map(c=>`<tr><td><b>${CX.paisLabel(c)}</b></td><td>${k.realizadas[c]||0}/${k.total[c]||0}</td><td>${ui.bdg(Math.round((k.realizadas[c]||0)/Math.max(k.total[c]||1,1)*100)+'%','g')}</td></tr>`).join('');
    const drills={
      cump:['Cumplimiento por país',`<table class="tbl"><thead><tr><th>País</th><th>Realizadas/Total</th><th>%</th></tr></thead><tbody>${cump}</tbody></table>`],
      vel:['Velocidad media','<p style="font-size:13px;color:var(--t2);line-height:1.7">Tiempo medio entre agendar y enviar el cuestionario. Calculado sobre las visitas realizadas del periodo; baja con recordatorios automáticos.</p>'],
      cal:['Calidad del cuestionario','<p style="font-size:13px;color:var(--t2);line-height:1.7">Porcentaje de cuestionarios sin observaciones de QA (campos completos, evidencia válida, sin contradicciones). El editor con pesos y evidencia mejora este indicador.</p>'],
      rent:['Rentabilidad','<p style="font-size:13px;color:var(--t2);line-height:1.7">Margen del proyecto según el modelo (directo: ingreso − honorarios − ISR/regalías; delegado: neto). Detalle por país en el Dashboard Financiero.</p>'],
    };
    document.querySelectorAll('#infKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{const d=drills[el.dataset.k];ui.modal(d[0],d[1]);}));
  },0);
  return `
    ${ui.ph('Reportes & KPIs', p.name+' · entregables listos para dirección y cliente')}
    <div class="grid g4" style="margin-bottom:16px" id="infKpis">
      <div data-k="cump" style="cursor:pointer">${ui.kpi('Cumplimiento',Math.round(k.realizadas.t/Math.max(k.total.t,1)*100)+'%','g')}</div>
      <div data-k="vel" style="cursor:pointer">${ui.kpi('Velocidad media','1.4d','b')}</div>
      <div data-k="cal" style="cursor:pointer">${ui.kpi('Calidad cuest.','92%','p')}</div>
      <div data-k="rent" style="cursor:pointer">${ui.kpi('Rentabilidad','39.6%','a')}</div>
    </div>
    <div class="card card-p">
      <div class="card-h"><div class="card-t">Exportables</div></div>
      <div class="grid g2">
        ${[['📊','Cumplimiento por sucursal'],['🗺️','Cobertura por país y quincena'],['🏆','Ranking de shoppers'],['💰','Liquidaciones del periodo']].map(r=>`<div class="card hov card-p flex" style="gap:12px"><div style="font-size:22px">${r[0]}</div><div style="flex:1;font-size:13px;font-weight:600;color:var(--t1)">${r[1]}</div><button class="btn btn-soft btn-sm">Exportar</button></div>`).join('')}
      </div>
      <div style="margin-top:14px">${ui.aiBox('Genero lecturas y exportables listos por proyecto, país y sucursal, y resalto tendencias y brechas — sin armar Excel a mano.','Reportería que se arma sola')}</div>
    </div>`;
});
