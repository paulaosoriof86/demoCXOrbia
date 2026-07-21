/* CXOrbia · Mi Perfil (shopper) — editable + completar perfil + histórico/KPIs */
CX.module('miperfil', ({data,ui})=>{
  /* P0-2 (V171): sin shopperId verificable, fail-closed — nunca 'sh1' ni primer registro. */
  const sid=(CX.session.user&&CX.session.user.shopperId)||null;
  if(!sid){
    const host=ui.el('div');
    host.innerHTML=`${ui.ph('Mi Perfil','Tu perfil de evaluador')}<div class="card card-p">${CX.ui.empty('🔒','No hay una identidad de evaluador verificable en esta sesión. Inicia sesión como shopper para ver y editar tu perfil.')}</div>`;
    return host;
  }
  const s=data.getShopper(sid);
  if(!s){
    const host=ui.el('div');
    host.innerHTML=`${ui.ph('Mi Perfil','Tu perfil de evaluador')}<div class="card card-p">${CX.ui.empty('🔒','No se encontró tu registro de evaluador. Contacta al equipo para verificar tu identidad.')}</div>`;
    return host;
  }
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
      </div>
      <div class="card-t" style="font-size:13px;margin:16px 0 8px">🏦 Datos bancarios para pagos</div>
      <div class="grid g2" style="gap:12px 14px">
        <div><label class="lbl">Banco</label><input class="inp" id="mp_banco" value="${(s.banco||'').replace(/"/g,'&quot;')}" placeholder="Nombre del banco"></div>
        <div><label class="lbl">Tipo de cuenta</label><select class="sel" id="mp_ctaTipo">${['','Monetaria/Corriente','Ahorro','Otra'].map(o=>`<option ${o===(s.ctaTipo||'')?'selected':''}>${o||'Selecciona…'}</option>`).join('')}</select></div>
        <div><label class="lbl">Número de cuenta</label><input class="inp" id="mp_ctaNum" value="${(s.ctaNum||'').replace(/"/g,'&quot;')}" placeholder="Número / IBAN / CLABE"></div>
        <div><label class="lbl">Titular</label><input class="inp" id="mp_ctaTit" value="${(s.ctaTitular||'').replace(/"/g,'&quot;')}" placeholder="Nombre del titular"></div>
        <div><label class="lbl">Moneda</label><input class="inp" id="mp_ctaMon" value="${(s.ctaMoneda||'').replace(/"/g,'&quot;')}" placeholder="Q / L / USD…"></div>
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
          banco:(ov.querySelector('#mp_banco').value||'').trim(),
          ctaTipo:ov.querySelector('#mp_ctaTipo').value||'',
          ctaNum:(ov.querySelector('#mp_ctaNum').value||'').trim(),
          ctaTitular:(ov.querySelector('#mp_ctaTit').value||'').trim(),
          ctaMoneda:(ov.querySelector('#mp_ctaMon').value||'').trim(),
        };
        patch.cuentaPago=[patch.banco,patch.ctaNum,patch.ctaTitular].filter(Boolean).join(' · ');
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
    const okrDrills={efect:[null,'Efectividad · todas tus visitas asignadas'],cuest:[v=>['cuestionario','liquidada'].includes(v.estado),'Cuestionarios completados'],atiempo:[v=>['realizada','cuestionario','liquidada'].includes(v.estado),'Visitas enviadas a tiempo'],rating:[v=>['realizada','cuestionario','liquidada'].includes(v.estado),'Visitas que cuentan para tu calificación']};
    document.querySelectorAll('#okrKpis [data-ok]').forEach(el=>el.addEventListener('click',()=>{const d=okrDrills[el.dataset.ok];drillVisits(d[0],d[1]);}));
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
    ${(()=>{const hist=data.visitsForShopper(s.id);
      const asign=hist.filter(v=>v.shopperId===s.id||['asignada','agendada','realizada','cuestionario','liquidada'].includes(v.estado));
      const realiz=hist.filter(v=>['realizada','cuestionario','liquidada'].includes(v.estado));
      const efect=asign.length?Math.round(realiz.length/asign.length*100):0;
      const aTiempo=realiz.length?Math.round(realiz.filter(v=>v.submit!==false).length/realiz.length*100):0;
      const cuestOk=realiz.length?Math.round(realiz.filter(v=>['cuestionario','liquidada'].includes(v.estado)).length/realiz.length*100):0;
      const reprog=asign.length?Math.round(asign.filter(v=>v.reprog).length/asign.length*100):0;
      const okr=(lbl,val,meta,tone,suf)=>{const pct=Math.min(100,Math.round(val/meta*100));return `<div style="margin-bottom:12px">
        <div class="between" style="margin-bottom:4px"><span style="font-size:12.5px;font-weight:600;color:var(--t1)">${lbl}</span><span style="font-size:12px;font-weight:700;color:var(--${val>=meta?'green':tone})">${val}${suf} <span class="muted" style="font-weight:500">/ meta ${meta}${suf}</span></span></div>
        <div class="bar" style="height:7px"><i style="width:${pct}%;background:var(--${val>=meta?'green':tone})"></i></div></div>`;};
      return `<div class="card card-p" style="margin-bottom:16px">
        <div class="card-h"><div class="card-t">🎯 Mi desempeño y metas (OKRs)</div><span class="muted" style="font-size:11px">para mejorar y acceder a más visitas</span></div>
        <div class="grid g4" style="margin-bottom:14px" id="okrKpis">
          <div data-ok="efect" style="cursor:pointer">${ui.kpi('Efectividad',efect+'%',efect>=85?'g':'a','realizadas/asignadas')}</div>
          <div data-ok="cuest" style="cursor:pointer">${ui.kpi('Cuest. completos',cuestOk+'%',cuestOk>=90?'g':'a')}</div>
          <div data-ok="atiempo" style="cursor:pointer">${ui.kpi('Envíos a tiempo',aTiempo+'%',aTiempo>=90?'g':'a')}</div>
          <div data-ok="rating" style="cursor:pointer">${ui.kpi('Calificación',s.rating?('★ '+s.rating):'—','p')}</div>
        </div>
        ${okr('Efectividad de visitas',efect,90,'amber','%')}
        ${okr('Cuestionarios completados',cuestOk,95,'amber','%')}
        ${okr('Envíos a tiempo',aTiempo,90,'amber','%')}
        ${okr('Baja reprogramación (menos es mejor)',Math.max(0,100-reprog),90,'amber','%')}
        <div style="margin-top:6px">${ui.aiBox('Tus metas (OKRs): efectividad, cuestionarios completos y envíos a tiempo. Cumplirlas sube tu calificación, te habilita honorarios preferentes y prioridad en nuevas visitas.','Cómo crecer como evaluador')}</div>
      </div>`;})()}
    <div class="card card-p" style="margin-bottom:16px">
      <div class="card-h"><div class="card-t">Mis datos</div><button class="btn btn-soft btn-sm" id="mpEdit">✎ Editar</button></div>
      ${dato('WhatsApp',s.whatsapp)}${dato('Correo',s.email)}${dato(CX.geo.deptLabel(s.pais),s.depto)}${dato('Edad',s.edad)}${dato('Sexo',s.sexo)}${dato('Documento',s.dpi)}
      <div class="card-t" style="font-size:12px;margin:12px 0 4px;color:var(--t2)">🏦 Datos bancarios</div>
      ${dato('Banco',s.banco)}${dato('Tipo de cuenta',s.ctaTipo)}${dato('Número de cuenta',s.ctaNum)}${dato('Titular',s.ctaTitular)}${dato('Moneda',s.ctaMoneda)}
    </div>
    <div class="card card-p">${ui.aiBox('Tu calificación se calcula por cumplimiento + tiempos + alertas + certificaciones. Mantén tu perfil completo para acceder a más visitas y honorarios preferentes.','Cómo subir tu rating')}</div>`;
});

/* CXOrbia · Hojas de Ruta (admin) — interna / importada / ONLINE con sync sin duplicar */
CX.module('rutas', ({data,ui})=>{
  const p=data.period();
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
    host.querySelector('#hrNew').addEventListener('click',()=>ui.modal('＋ Nueva parada (HR)',`
      <div class="grid g2" style="gap:8px 10px">
        <div style="grid-column:1/3"><label class="lbl">Sucursal</label><input class="inp" id="hnSuc" placeholder="Nombre de la sucursal"></div>
        <div><label class="lbl">Ciudad</label><input class="inp" id="hnCiu"></div>
        <div><label class="lbl">Fecha disponible</label><input class="inp" id="hnFec" type="date"></div>
        <div><label class="lbl">Reembolso</label><input class="inp" id="hnRe" type="number" value="0"></div>
        <div><label class="lbl">Escenario</label><input class="inp" id="hnEsc" placeholder="Escenario"></div>
      </div>
      <div style="text-align:right;margin-top:12px"><button class="btn btn-green btn-sm" id="hnOk">Agregar parada</button></div>
    `,{onMount:(ov,close)=>ov.querySelector('#hnOk').addEventListener('click',()=>{
      const suc=(ov.querySelector('#hnSuc').value||'').trim();if(!suc){ui.toast('Sucursal requerida','warn');return;}
      if(CX.hr&&CX.hr.addParada)CX.hr.addParada(p,{sucursal:suc,ciudad:ov.querySelector('#hnCiu').value,fecha:ov.querySelector('#hnFec').value,reembolso:+ov.querySelector('#hnRe').value||0,escenario:ov.querySelector('#hnEsc').value});
      else{p._hrExtra=p._hrExtra||[];p._hrExtra.push({sucursal:suc,ciudad:ov.querySelector('#hnCiu').value,fecha:ov.querySelector('#hnFec').value});}
      CX.bus&&CX.bus.emit('visit-flow');close();CX.router.nav('rutas');ui.toast('Parada "'+suc+'" agregada'+(online?' · se refleja en la HR online':''),'ok',3200);
    })}));
  },0);
  return host;
});

/* CXOrbia · Reportes & KPIs / Informes (admin) — Corte 1B
   P0: exporta SOLO el reporte seleccionado (nunca la página completa); edición
   REAL de columnas (ocultar / ordenar / renombrar) reflejada en vista previa y
   en PDF/Excel/PPT; Excel .xlsx real; ninguna métrica sin fuente confirmada se
   muestra como real (velocidad, calidad, hallazgos, score, NPS y liquidaciones
   quedan "Pendiente de fuente"). Usa la plantilla reusable CX.reportKit con la
   identidad del tenant (logo, colores, tipografía) — sin hardcode de cliente. */
CX.module('informes', ({data,ui})=>{
  const p=data.period();
  /* P0-5 (V171): estados canónicos ÚNICOS (visitFacets/visitBucketFns) y exclusión de
     canceladas/archivadas. Prohibido redefinir done/cuest aquí. Coincide con Dashboard/Panorama. */
  const F=data.visitFacets, BF=data.visitBucketFns;
  const vis=data.visitas().filter(v=>!F(v).cancelled);
  const projectLabel=data.programBase?data.programBase(p):(p.name||'Proyecto');
  const periodLabel=p.periodo||p.ronda||p.name||'Periodo';
  const SOURCE_LABEL='Operación viva · '+((CX.dataSource&&CX.dataSource.label&&CX.dataSource.label())||'Demo');
  const fecha=()=>new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'});
  const sanitize=(s)=>String(s||'reporte').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'reporte';
  const isReal=v=>BF.realizadas(v);
  const isCuest=v=>{const f=F(v);return f.questionnaire&&!f.cancelled;};

  /* --- agregados con FUENTE REAL (operación viva del periodo) --- */
  const bySuc={}; vis.forEach(v=>{const s=bySuc[v.sucursal]=bySuc[v.sucursal]||{suc:v.sucursal||'—',pais:v.pais,t:0,r:0,c:0};s.t++;if(isReal(v))s.r++;if(isCuest(v))s.c++;});
  const rankSuc=Object.values(bySuc).map(s=>({...s,pct:s.t?Math.round(s.r/s.t*100):0})).sort((a,b)=>b.pct-a.pct);
  const bySh={}; vis.filter(v=>v.shopperId).forEach(v=>{const s=bySh[v.shopperId]=bySh[v.shopperId]||{n:v.shopper||'—',code:v.shopperCode,t:0,r:0};s.t++;if(isReal(v))s.r++;});
  const rankSh=Object.values(bySh).map(s=>({...s,pct:s.t?Math.round(s.r/s.t*100):0})).sort((a,b)=>b.r-a.r);
  const estMap={}; vis.forEach(v=>{estMap[v.estado]=(estMap[v.estado]||0)+1;});
  const estRows=Object.keys(estMap).map(e=>({estado:e,visitas:estMap[e],pct:Math.round(estMap[e]/Math.max(vis.length,1)*100)+'%'})).sort((a,b)=>b.visitas-a.visitas);
  const byPais={}; vis.forEach(v=>{const c=byPais[v.pais]=byPais[v.pais]||{pais:v.pais,t:0,r:0};c.t++;if(isReal(v))c.r++;});
  const covRows=Object.values(byPais).map(c=>({pais:c.pais,realizadas:c.r,total:c.t,cobertura:Math.round(c.r/Math.max(c.t,1)*100)+'%'}));
  const totVis=vis.length, totReal=vis.filter(isReal).length;
  const cumpGlobal=totVis?Math.round(totReal/totVis*100):0;
  const efectGlobal=rankSh.length?Math.round(rankSh.reduce((a,s)=>a+s.pct,0)/rankSh.length):null;

  const REPORTS={
    cumpSuc:{icon:'📊',source:'real',label:'Cumplimiento por sucursal',desc:'Realizadas / total por sucursal',
      columns:[{key:'suc',label:'Sucursal'},{key:'pais',label:'País'},{key:'r',label:'Realizadas'},{key:'t',label:'Total'},{key:'pct',label:'Cumplimiento %'}],
      rows:()=>rankSuc.map(s=>({suc:s.suc,pais:s.pais,r:s.r,t:s.t,pct:s.pct})),
      chart:()=>({title:'Cumplimiento por sucursal (%)',data:rankSuc.slice(0,10).map(s=>({label:s.suc,value:s.pct,display:s.pct+'%'}))})},
    cobertura:{icon:'🗺️',source:'real',label:'Cobertura por país',desc:'Cobertura operativa del periodo por país',
      columns:[{key:'pais',label:'País'},{key:'realizadas',label:'Realizadas'},{key:'total',label:'Total'},{key:'cobertura',label:'Cobertura'}],
      rows:()=>covRows,
      chart:()=>({title:'Cobertura por país (%)',data:Object.values(byPais).map(c=>({label:c.pais,value:Math.round(c.r/Math.max(c.t,1)*100),display:Math.round(c.r/Math.max(c.t,1)*100)+'%'}))})},
    rankSh:{icon:'🏆',source:'real',label:'Ranking de evaluadores',desc:'Efectividad por evaluador',
      columns:[{key:'n',label:'Evaluador'},{key:'code',label:'Código'},{key:'r',label:'Realizadas'},{key:'t',label:'Asignadas'},{key:'pct',label:'Efectividad %'}],
      rows:()=>rankSh.map(s=>({n:s.n,code:s.code||'—',r:s.r,t:s.t,pct:s.pct})),
      chart:()=>({title:'Efectividad de evaluadores (%)',data:rankSh.slice(0,10).map(s=>({label:s.n,value:s.pct,display:s.pct+'%'}))})},
    estado:{icon:'📈',source:'real',label:'Estado operativo del periodo',desc:'Distribución de visitas por estado',
      columns:[{key:'estado',label:'Estado'},{key:'visitas',label:'Visitas'},{key:'pct',label:'% del total'}],
      rows:()=>estRows,
      chart:()=>({title:'Visitas por estado',data:estRows.map(r=>({label:r.estado,value:r.visitas}))})},
    hallazgos:{icon:'🔎',source:'pending',label:'Hallazgos frecuentes',requiredSource:'clasificación real de hallazgos por visita'},
    scoreSuc:{icon:'🎯',source:'pending',label:'Score por sucursal',requiredSource:'cuestionarios validados con score'},
    liq:{icon:'💰',source:'pending',label:'Liquidaciones del periodo',requiredSource:'lote de liquidaciones confirmado (ver Finanzas)'},
  };

  /* --- edición REAL de columnas + notas, persistente por periodo --- */
  const CFG_KEY='cx_inf_cfg_'+p.id;
  const loadCfg=()=>{try{return JSON.parse(localStorage.getItem(CFG_KEY)||'{}');}catch(e){return {};}};
  const saveCfg=(o)=>{try{localStorage.setItem(CFG_KEY,JSON.stringify(o));}catch(e){}};
  const effCols=(id)=>{
    const base=REPORTS[id].columns||[];
    const cc=((loadCfg()[id]||{}).columns)||{};
    return base.map((c,i)=>({key:c.key,
      label:(cc[c.key]&&cc[c.key].label!=null&&cc[c.key].label!=='')?cc[c.key].label:c.label,
      hidden:cc[c.key]?!!cc[c.key].hidden:false,
      order:(cc[c.key]&&typeof cc[c.key].order==='number')?cc[c.key].order:i}))
      .sort((a,b)=>a.order-b.order);
  };
  const notesFor=(id)=>((loadCfg()[id]||{}).notes)||'';
  const buildSpec=(id,ext)=>{
    const R=REPORTS[id];
    const cols=effCols(id).map(c=>({key:c.key,label:c.label,hidden:c.hidden}));
    const rows=R.rows?R.rows():[];
    return { title:R.label,
      meta:{title:R.label,project:projectLabel,period:periodLabel,scope:'Toda la operación',sourceLabel:SOURCE_LABEL,generatedAt:fecha()},
      columns:cols, rows, notes:notesFor(id),
      summary:['Filas en el reporte: '+rows.length,'Reporte operativo real del periodo '+periodLabel],
      chart:R.chart?R.chart():null,
      filename:[sanitize(R.label),sanitize(projectLabel),sanitize(periodLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
  };

  const editModal=(id,onDone)=>{
    const R=REPORTS[id]; const cols=effCols(id);
    ui.modal('✎ Editar columnas — '+R.label, `
      <p style="font-size:12px;color:var(--t2);margin-bottom:10px">Elige qué columnas se ven, en qué orden y con qué título. Se aplica a la vista previa y a PDF, Excel y PPT.</p>
      <div id="colEd">${cols.map((c,i)=>`<div class="flex" data-key="${c.key}" style="gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-2)">
        <input type="checkbox" class="colVis" ${c.hidden?'':'checked'} title="Mostrar columna">
        <input class="inp colName" value="${(c.label||'').replace(/"/g,'&quot;')}" style="flex:1;padding:5px 7px" placeholder="Título de la columna">
        <button class="btn btn-ghost btn-sm colUp" title="Subir" ${i===0?'disabled':''}>▲</button>
        <button class="btn btn-ghost btn-sm colDn" title="Bajar" ${i===cols.length-1?'disabled':''}>▼</button>
      </div>`).join('')}</div>
      <label class="lbl" style="margin-top:12px">Notas / encabezado del reporte</label>
      <textarea class="inp" id="edNotes" rows="2" placeholder="Ej. Corte operativo del periodo">${(notesFor(id)||'').replace(/</g,'&lt;')}</textarea>
      <div class="between" style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="edReset">Restablecer</button><button class="btn btn-pr btn-sm" id="edSave">Guardar cambios</button></div>
    `,{onMount:(ov,close)=>{
      const cont=ov.querySelector('#colEd');
      const move=(row,dir)=>{const sib=dir<0?row.previousElementSibling:row.nextElementSibling;if(!sib)return;if(dir<0)cont.insertBefore(row,sib);else cont.insertBefore(sib,row);};
      cont.querySelectorAll('.colUp').forEach(b=>b.addEventListener('click',()=>move(b.closest('[data-key]'),-1)));
      cont.querySelectorAll('.colDn').forEach(b=>b.addEventListener('click',()=>move(b.closest('[data-key]'),1)));
      ov.querySelector('#edReset').addEventListener('click',()=>{const cfg=loadCfg();delete cfg[id];saveCfg(cfg);close();onDone&&onDone();});
      ov.querySelector('#edSave').addEventListener('click',()=>{
        const cfg=loadCfg(); const colCfg={};
        [...cont.querySelectorAll('[data-key]')].forEach((row,order)=>{
          colCfg[row.dataset.key]={order,hidden:!row.querySelector('.colVis').checked,label:(row.querySelector('.colName').value||'').trim()};
        });
        cfg[id]={columns:colCfg,notes:(ov.querySelector('#edNotes').value||'').trim()};
        saveCfg(cfg); close(); ui.toast('Reporte actualizado','ok'); onDone&&onDone();
      });
    }});
  };

  const openReport=(id)=>{
    const R=REPORTS[id];
    const render=(ov)=>{ const body=ov.querySelector('#rptBody'); if(body) body.innerHTML=CX.reportKit.previewHTML(buildSpec(id,'pdf')); };
    ui.modal(R.icon+' '+R.label, `
      <div id="rptBody" style="max-height:52vh;overflow:auto">${CX.reportKit.previewHTML(buildSpec(id,'pdf'))}</div>
      <div class="between" style="margin-top:14px;flex-wrap:wrap;gap:8px">
        <button class="btn btn-soft btn-sm" id="rptEdit">✎ Editar columnas / notas</button>
        <div class="flex" style="gap:8px"><button class="btn btn-ghost btn-sm" id="rptPdf">⤓ PDF</button><button class="btn btn-soft btn-sm" id="rptXls">⤓ Excel</button><button class="btn btn-pr btn-sm" id="rptPpt">⤓ PPT</button></div>
      </div>`,
    {onMount:(ov,close)=>{
      ov.querySelector('#rptEdit').addEventListener('click',()=>editModal(id,()=>render(ov)));
      ov.querySelector('#rptPdf').addEventListener('click',()=>{ CX.reportKit.exportPDF(buildSpec(id,'pdf')); });
      ov.querySelector('#rptXls').addEventListener('click',()=>{ if(CX.reportKit.exportExcel(buildSpec(id,'xlsx')))ui.toast('Excel .xlsx generado','ok'); });
      ov.querySelector('#rptPpt').addEventListener('click',()=>{ if(CX.reportKit.exportPPT(buildSpec(id,'pptx')))ui.toast('PowerPoint generado','ok'); });
    }});
  };

  const host=ui.el('div');
  const draw=()=>{
    const pendKpi=(l)=>`<div class="card card-p"><div class="k-l" style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.4px">${l}</div><div style="margin-top:6px">${CX.ui.statusBdg('pending_source')}</div></div>`;
    const card=(id)=>{ const R=REPORTS[id];
      if(R.source!=='real') return `<div class="card card-p flex" style="gap:12px;align-items:flex-start;opacity:.9">
        <div style="font-size:22px">${R.icon}</div>
        <div style="flex:1"><div class="card-t" style="font-size:13.5px">${R.label}</div>
          <div style="margin-top:6px">${CX.ui.statusBdg('pending_source')}</div>
          <div style="font-size:11.5px;color:var(--t2);margin-top:6px;line-height:1.5">Falta la fuente: ${R.requiredSource}. No se muestran cifras inventadas.</div></div></div>`;
      return `<div class="card hov card-p flex" data-rep="${id}" style="gap:12px;cursor:pointer;align-items:flex-start">
        <div style="font-size:22px">${R.icon}</div>
        <div style="flex:1"><div class="card-t" style="font-size:13.5px">${R.label}</div>
          <div style="font-size:11.5px;color:var(--t3);margin-top:2px">${R.desc||''}</div>
          <div style="margin-top:6px">${ui.bdg('Fuente real','g')}</div></div>
        <span class="btn btn-soft btn-sm">Abrir →</span></div>`;
    };
    host.innerHTML=`
      ${ui.ph('Reportes & KPIs', projectLabel+' · '+periodLabel+' · entregables operativos reales')}
      <div class="grid g4" style="margin-bottom:16px">
        ${ui.kpi('Cumplimiento',cumpGlobal+'%',cumpGlobal>=80?'g':cumpGlobal>=50?'a':'r','realizadas/total')}
        ${ui.kpi('Efectividad',efectGlobal==null?CX.ui.statusBdg('pending_source'):efectGlobal+'%',efectGlobal!=null&&efectGlobal>=80?'g':'a','evaluadores')}
        ${pendKpi('Velocidad media')}
        ${pendKpi('Calidad de cuestionario')}
      </div>
      <div class="card card-p">
        <div class="card-t" style="margin-bottom:12px">Reportes operativos</div>
        <div class="grid g2">${['cumpSuc','cobertura','rankSh','estado'].map(card).join('')}</div>
        <div class="card-t" style="font-size:13px;margin:16px 0 8px">Pendientes de fuente</div>
        <div class="grid g2">${['scoreSuc','hallazgos','liq'].map(card).join('')}</div>
        <div style="margin-top:14px">${ui.aiBox('Cada reporte usa las visitas reales del periodo activo. Puedes ocultar, ordenar y renombrar columnas y añadir notas: los cambios se reflejan en la vista previa y en PDF, Excel y PPT. Velocidad, calidad, hallazgos, score, NPS y liquidaciones quedan Pendiente de fuente mientras no exista un origen confirmado.','Reportería honesta y editable')}</div>
      </div>`;
    host.querySelectorAll('[data-rep]').forEach(b=>b.addEventListener('click',()=>openReport(b.dataset.rep)));
  };
  draw();
  return host;
});

/* CXOrbia · Mis Reportes (shopper) — Corte 1B
   Módulo de Reportes propio del Shopper: mismos multiformato (PDF/Excel/PPT),
   diseño del tenant y editor de columnas (elegir/ocultar/ordenar/renombrar +
   notas) que Admin y Cliente, vía CX.reportKit. Solo datos reales del shopper
   autenticado; sin métricas fabricadas. */
CX.module('mireportes', ({data,ui})=>{
  const p=data.period();
  /* P0-2 (V171): identidad fail-closed — sin shopperId verificable, cero filas y export deshabilitado.
     Prohibido el fallback 'sh1'/nombre/primer registro. */
  const sid=(CX.session.user&&CX.session.user.shopperId)||null;
  if(!sid){
    const host=ui.el('div');
    host.innerHTML=`${ui.ph('Mis Reportes','Reportes de tu actividad')}<div class="card card-p">${CX.ui.empty('🔒','No hay una identidad de evaluador verificable en esta sesión. Por seguridad no se muestran ni exportan reportes de otro usuario. Inicia sesión como shopper para ver los tuyos.')}</div>`;
    return host;
  }
  const s=(data.getShopper&&data.getShopper(sid))||{nombre:'Shopper'};
  const vis=(data.visitsForShopper?data.visitsForShopper(sid):[]);
  const projectLabel=data.programBase?data.programBase(p):(p.name||'Proyecto');
  const periodLabel=p.periodo||p.ronda||p.name||'Periodo';
  const isReal=v=>data.visitBucketFns.realizadas(v);
  const myLiq=(()=>{try{const ids=new Set(vis.map(v=>v.id));return (CX.liq&&CX.liq.forProject?CX.liq.forProject(data):[]).filter(l=>ids.has(l.visitaId));}catch(e){return [];}})();

  const REPORTS={
    misVisitas:{icon:'📋',label:'Mis visitas del periodo',desc:'Detalle de tus visitas asignadas y su estado',
      columns:[{key:'sucursal',label:'Sucursal'},{key:'ciudad',label:'Ciudad'},{key:'escenario',label:'Escenario'},{key:'estado',label:'Estado'},{key:'fecha',label:'Fecha'},{key:'honorario',label:'Honorario'}],
      rows:()=>vis.map(v=>({sucursal:v.sucursal||'—',ciudad:v.ciudad||'—',escenario:v.escenario||'—',estado:v.estado,fecha:v.realizada||v.agendada||'—',honorario:(v.honorario!=null?v.honorario:'—')})),
      chart:()=>{const by={};vis.forEach(v=>{by[v.estado]=(by[v.estado]||0)+1;});return {title:'Mis visitas por estado',data:Object.entries(by).map(([k,n])=>({label:k,value:n}))};}},
    misPagos:{icon:'💰',label:'Mis liquidaciones',desc:'Honorarios y reembolsos derivados de tus visitas',
      columns:[{key:'sucursal',label:'Sucursal'},{key:'estado',label:'Estado'},{key:'honorario',label:'Honorario'},{key:'reembolso',label:'Reembolso'},{key:'total',label:'Total'},{key:'pago',label:'Pago est.'}],
      rows:()=>myLiq.map(l=>({sucursal:l.sucursal||'—',estado:l.estado,honorario:Math.round(l.honorario||0),reembolso:Math.round(l.reembolso||0),total:Math.round(l.total||0),pago:l.fechaEstimadaPago||'—'})),
      chart:()=>{const by={};myLiq.forEach(l=>{by[l.estado]=(by[l.estado]||0)+1;});return {title:'Mis liquidaciones por estado',data:Object.entries(by).map(([k,n])=>({label:k,value:n}))};}},
  };

  const san=(x)=>String(x||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
  const buildSpec=(id,ext)=>{ const R=REPORTS[id]; const rows=R.rows();
    return { title:R.label,
      meta:{title:R.label,project:projectLabel,period:periodLabel,scope:(s.nombre||'Shopper'),sourceLabel:'Operación viva · mi actividad',generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
      columns:R.columns.map(c=>({key:c.key,label:c.label})), rows, notes:'',
      summary:['Filas: '+rows.length, R.desc],
      chart:R.chart(),
      filename:[san(R.label),san(s.nombre||'shopper'),san(periodLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
  };

  const host=ui.el('div');
  const card=(id)=>{ const R=REPORTS[id]; const n=R.rows().length;
    return `<div class="card hov card-p flex" data-mr="${id}" style="gap:12px;cursor:pointer;align-items:flex-start">
      <div style="font-size:22px">${R.icon}</div>
      <div style="flex:1"><div class="card-t" style="font-size:13.5px">${R.label}</div>
        <div style="font-size:11.5px;color:var(--t3);margin-top:2px">${R.desc}</div>
        <div style="margin-top:6px">${n?ui.bdg(n+' fila(s) · fuente real','g'):CX.ui.statusBdg('no_data')}</div></div>
      <span class="btn btn-soft btn-sm">Abrir →</span></div>`;
  };
  host.innerHTML=`
    ${ui.ph('Mis Reportes', (s.nombre||'Shopper')+' · '+projectLabel+' · '+periodLabel)}
    <div class="grid g2" style="gap:14px">${Object.keys(REPORTS).map(card).join('')}</div>
    <div style="margin-top:16px">${ui.aiBox('Genera reportes de tu propia actividad en PDF, Excel y PPT con el diseño de la marca. Puedes elegir, ocultar, ordenar y renombrar columnas y agregar notas; los cambios se reflejan en los tres formatos. Solo se usan tus datos reales del periodo.','Reportes del shopper')}</div>`;
  host.querySelectorAll('[data-mr]').forEach(b=>b.addEventListener('click',()=>{ const id=b.dataset.mr; if(!REPORTS[id].rows().length){ui.toast('Sin datos para este periodo','err');return;} CX.reportKit.openReport(buildSpec(id,'pdf'),'sh_'+id); }));
  return host;
});
