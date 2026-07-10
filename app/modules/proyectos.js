/* CXOrbia · Proyectos (admin) — the IA-adaptive core.
   Selecting/creating a project reconfigures the whole platform. */
CX.module('proyectos', ({data,ui})=>{
  const groups = data.scopedProyectos().map(pg=>{
    const periods = data.periodosDe(pg.key);
    const rep = pg.sample;
    const totalV = periods.reduce((a,p)=>a+data._visitas.filter(x=>x.projectId===p.id).length,0);
    const activePeriod = periods.find(p=>p.id===data.currentProjectId);
    const isActiveGroup = !!activePeriod;
    return `<div class="card hov card-p" data-pgkey="${pg.key}" style="cursor:pointer;${isActiveGroup?'border-color:var(--brand);box-shadow:0 0 0 2px var(--brand-light)':''}">
      <div class="between" style="margin-bottom:10px">
        <div class="flex" style="gap:10px"><div style="width:34px;height:34px;border-radius:9px;background:${rep.accent}1a;display:flex;align-items:center;justify-content:center;color:${rep.accent};font-weight:800;font-family:var(--disp)">${pg.name[0]}</div>
        <div><div class="card-t" style="font-size:15px">${pg.name}</div><div style="font-size:11px;color:var(--t3)">${rep.industry}</div></div></div>
        <div class="flex" style="gap:6px">${isActiveGroup?ui.bdg('Activo','g'):ui.bdg('Cambiar','n')}<button class="btn btn-ghost btn-sm" data-cfg="${rep.id}" title="Ver/editar configuración">⚙️</button></div>
      </div>
      <div class="flex wrap" style="gap:6px;margin-bottom:10px">
        ${rep.countries.map(c=>ui.bdg(CX.paisFlag(c)+' '+c,'b')).join('')}
        ${ui.bdg(rep.sucursales+' sucursales','n')}
        ${ui.bdg(totalV+' visitas','n')}
      </div>
      <div style="font-size:11.5px;color:var(--t2);margin-bottom:${periods.length>1?'8px':'0'}">Escenarios: ${rep.scenarios.join(' · ')}</div>
      ${periods.length>1?`<div style="border-top:1px solid var(--border-2);padding-top:8px;margin-top:2px">
        <div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.03em;margin-bottom:6px">${periods.length} periodos</div>
        <div class="flex wrap" style="gap:6px">${periods.map(pr=>`<span data-pid="${pr.id}" class="bdg ${pr.id===data.currentProjectId?'bdg-g':'bdg-n'}" style="cursor:pointer">${pr.periodo||pr.name}${data.periodState(pr.id)!=='activo'?' · '+data.periodState(pr.id):''}</span>`).join('')}</div>
      </div>`:`<div data-pid="${periods[0].id}" style="display:none"></div>`}
    </div>`;
  }).join('');

  const p=data.project();
  const html=`
  ${ui.ph('Proyectos', 'Cada proyecto reconfigura dashboard, KPIs, reglas y cuestionarios — sin tocar código. Los periodos (rondas) viven dentro de su proyecto.')}
  <div class="between" style="margin-bottom:14px">
    <div class="flex">${ui.bdg(data.programs().length+' proyectos','n')} ${ui.bdg((data.programs().length!==data.projects.length?data.projects.length+' periodos totales · ':'')+'Activo: '+p.name,'b')}</div>
    <button class="btn btn-pr" id="newProj">+ Nuevo proyecto</button>
  </div>
  <div class="grid g3" style="margin-bottom:18px">${groups}</div>
  <div class="card card-p">
    ${ui.aiBox('Al cambiar o crear un proyecto, la plataforma se adapta sola: el dashboard, el mapeo, las reglas de quincena/franja, los honorarios por país y los cuestionarios por escenario se reconfiguran para ese cliente. El periodo (ronda) es un filtro/estado DENTRO del proyecto — nunca un proyecto nuevo.','Proyectos adaptativos')}
  </div>`;

  // attach interactions after render via microtask
  setTimeout(()=>{
    document.querySelectorAll('[data-pid]').forEach(c=>c.addEventListener('click',(e)=>{
      e.stopPropagation();
      data.setProject(c.dataset.pid); ui.toast('Plataforma adaptada a: '+data.project().name+(data.project().periodo?' · '+data.project().periodo:''),'ok');
    }));
    document.querySelectorAll('[data-pgkey]').forEach(c=>c.addEventListener('click',()=>{
      if(!data.setProgram) return; data.setProgram(c.dataset.pgkey); ui.toast('Plataforma adaptada a: '+data.project().name,'ok');
    }));
    /* ver/editar configuración del proyecto */
    document.querySelectorAll('[data-cfg]').forEach(b=>b.addEventListener('click',(e)=>{ e.stopPropagation(); const pr=data.projects.find(x=>x.id===b.dataset.cfg); if(!pr)return; projConfig(pr); }));
    const projConfig=(pr)=>{ const v=data._visitas.filter(x=>x.projectId===pr.id);
      const INDS=['Retail · Cadena de tiendas','Banca · Red de agencias','Restaurantes · Multimarca','Salud · Clínicas','Telecomunicaciones','Automotriz · Concesionarios','Seguros','Combustibles · Estaciones','Hotelería','Educación','Supermercados','Farmacias','Otra'];
      const indOpts=INDS.map(o=>`<option ${o===pr.industry?'selected':''}>${o}</option>`).join('')+(INDS.includes(pr.industry)?'':`<option selected>${pr.industry||''}</option>`);
      const RONDAS=['Mensual','Bimensual','Trimestral','Semestral','Anual','Quincenal','Por campaña'];
      const CUMPL=['Igual a la ronda','Semanal','Quincenal','Mensual'];
      const paisChecks=CX.COUNTRIES.map(co=>`<label class="flex" style="gap:5px;font-size:12px;padding:3px 7px;border:1px solid var(--border);border-radius:7px;cursor:pointer"><input type="checkbox" class="cf_pais" value="${co.c}" ${pr.countries.includes(co.c)?'checked':''}>${CX.paisFlag(co.c)} ${co.c} (${co.cur})</label>`).join('');
      ui.modal('⚙️ Configuración · '+pr.name,`
        <div class="grid g2" style="gap:10px 14px">
          <div><label class="lbl">Nombre del proyecto</label><input class="inp" id="cf_name" value="${(pr.name||'').replace(/"/g,'&quot;')}"></div>
          <div><label class="lbl">Industria</label><select class="sel" id="cf_ind">${indOpts}</select></div>
          <div><label class="lbl">Cliente</label><input class="inp" id="cf_cli" value="${(pr.client||'').replace(/"/g,'&quot;')}"></div>
          <div><label class="lbl">Nº de sucursales</label><input class="inp" id="cf_suc" type="number" value="${pr.sucursales||0}"></div>
          <div><label class="lbl">Periodicidad de rondas</label><select class="sel" id="cf_ronda">${RONDAS.map(o=>`<option ${(pr.periodicidad||pr.ronda||'').toLowerCase().includes(o.toLowerCase())?'selected':''}>${o}</option>`).join('')}</select></div>
          <div><label class="lbl">Periodo de cumplimiento / medición</label><select class="sel" id="cf_cumpl">${CUMPL.map(o=>`<option ${o===(pr.periodoCumpl||'Igual a la ronda')?'selected':''}>${o}</option>`).join('')}</select></div>
        </div>
        <div style="font-size:11px;color:var(--t3);margin-top:4px">Ej.: ronda <b>mensual</b> con cumplimiento <b>quincenal</b> = cada quincena debe cubrirse la mitad de las visitas del mes (meta obligatoria por quincena).</div>

        <label class="lbl" style="margin-top:12px">Países / moneda</label>
        <div class="flex wrap" style="gap:6px">${paisChecks}</div>

        <div class="between" style="margin-top:12px"><label class="lbl" style="margin:0">Escenarios evaluados</label><button class="btn btn-soft btn-sm" id="cf_iaEsc">🤖 Extraer del instructivo (IA)</button></div>
        <div id="cf_escChips" class="flex wrap" style="gap:6px;margin:6px 0"></div>
        <div class="flex" style="gap:6px"><input class="inp" id="cf_escNew" placeholder="Agregar escenario…" style="flex:1"><button class="btn btn-soft btn-sm" id="cf_escAdd">＋</button></div>

        <div style="border-top:1px solid var(--border-2);margin:16px 0 10px;padding-top:12px"><b style="font-size:12.5px">⚙️ Revisión, submitido y fuentes (Phase A)</b></div>
        <div class="grid g2" style="gap:8px 12px">
          <label class="flex" style="gap:7px;font-size:12px"><input type="checkbox" id="cf_revCons" ${(pr.revision&&pr.revision.consultora)?'checked':''}> La consultora revisa cuestionario/evidencias</label>
          <label class="flex" style="gap:7px;font-size:12px"><input type="checkbox" id="cf_revCli" ${(pr.revision&&pr.revision.cliente)?'checked':''}> El cliente revisa cuestionario/evidencias</label>
          <div><label class="lbl">¿Quién submite/cierra ante el externo?</label><select class="sel" id="cf_submQuien"><option value="plataforma" ${((pr.submitido||{}).quien)==='plataforma'?'selected':''}>Plataforma</option><option value="consultora" ${((pr.submitido||{}).quien)==='consultora'?'selected':''}>Consultora (fuera de plataforma)</option><option value="cliente" ${((pr.submitido||{}).quien)==='cliente'?'selected':''}>Cliente</option></select></div>
          <div><label class="lbl">Rol de la plataforma en submitido</label><select class="sel" id="cf_submRol"><option value="submite" ${((pr.submitido||{}).rol)==='submite'?'selected':''}>Submite</option><option value="monitorea" ${((pr.submitido||{}).rol)==='monitorea'?'selected':''}>Solo monitorea</option><option value="hr" ${((pr.submitido||{}).rol||'hr')==='hr'?'selected':''}>Toma fecha desde HR</option></select></div>
        </div>
        <div class="grid g2" style="gap:8px 12px;margin-top:8px">
          <div><label class="lbl">Origen de HR</label><select class="sel" id="cf_hrOrigen"><option value="externa" ${((pr.hrFuente||{}).origen||'externa')==='externa'?'selected':''}>Externa (hoja en línea)</option><option value="nativa" ${((pr.hrFuente||{}).origen)==='nativa'?'selected':''}>Nativa (plataforma)</option></select></div>
          <div><label class="lbl">Etiqueta de plataforma externa (visible)</label><input class="inp" id="cf_hrEtiq" value="${((pr.hrFuente||{}).etiqueta||'').replace(/"/g,'&quot;')}" placeholder="Ej. Hoja compartida del cliente"></div>
          <div><label class="lbl">Origen del cuestionario</label><select class="sel" id="cf_cueOrigen"><option value="interna" ${((pr.cuestionario||{}).modo||'interna')==='interna'?'selected':''}>Interno (plataforma)</option><option value="externo_general" ${((pr.cuestionario||{}).modo)==='externo_general'?'selected':''}>Externo · link general</option><option value="externo_visita" ${((pr.cuestionario||{}).modo)==='externo_visita'?'selected':''}>Externo · link por visita (desde HR)</option></select></div>
          <div><label class="lbl">Etiqueta cuestionario externo</label><input class="inp" id="cf_cueEtiq" value="${((pr.cuestionario||{}).etiqueta||'').replace(/"/g,'&quot;')}" placeholder="Ej. Formulario del cliente"></div>
        </div>
        <div style="font-size:10.5px;color:var(--t3);margin-top:5px">Las URLs privadas de HR/cuestionario se registran de forma segura por backend (Fuente de HR); aquí solo etiqueta y origen.</div>
        <div style="margin-top:12px"><b style="font-size:12px">📲 Contactos WhatsApp por tipo de gestión</b></div>
        <div class="grid g2" style="gap:8px 12px;margin-top:6px">
          ${[['evidencias','Evidencias'],['soporte','Soporte'],['cuestionario','Cuestionario'],['reprog','Reprogramación/cancelación'],['pagos','Pagos/liquidaciones'],['coordinacion','Coordinación general']].map(([k,l])=>`<div><label class="lbl">${l}</label><input class="inp cf_contacto" data-ck="${k}" value="${((pr.contactos||{})[k]||'').replace(/"/g,'&quot;')}" placeholder="+502…"></div>`).join('')}
        </div>

        <label class="lbl" style="margin-top:12px">Quincenas / periodos</label>
        <input class="inp" id="cf_quin" value="${(pr.quincenas||[]).join(' · ').replace(/"/g,'&quot;')}">

        <div class="grid g3" style="gap:8px;margin:14px 0">${ui.kpi('Visitas',v.length,'b')}${ui.kpi('Sucursales',pr.sucursales||0,'n')}${ui.kpi('Escenarios',(pr.scenarios||[]).length,'p')}</div>
        <div style="background:var(--brand-light);border-radius:9px;padding:9px 12px;font-size:11.5px;color:var(--brand-dark);margin-bottom:10px">El <b>set-up completo</b> se gestiona en las secciones de <b>Admin del Proyecto</b>:</div>
        <div class="flex wrap" style="gap:8px;margin-bottom:14px"><button class="btn btn-ghost btn-sm" data-goto="rutas">🗺️ Hojas de Ruta / mapeo HR</button><button class="btn btn-ghost btn-sm" data-goto="cuestionarios">🧩 Cuestionarios por escenario</button><button class="btn btn-ghost btn-sm" data-goto="importador">📥 Importar set-up</button></div>
        <div class="flex" style="justify-content:flex-end;gap:8px"><button class="btn btn-soft btn-sm" id="cf_open">Activar este proyecto</button><button class="btn btn-pr btn-sm" id="cf_save">Guardar cambios</button></div>
      `,{onMount:(ov,close)=>{
        let esc=(pr.scenarios||[]).slice();
        const renderEsc=()=>{ov.querySelector('#cf_escChips').innerHTML=esc.length?esc.map((s,i)=>`<span class="bdg bdg-b" style="display:inline-flex;align-items:center;gap:5px">${s}<b data-delesc="${i}" style="cursor:pointer;color:var(--red)">✕</b></span>`).join(''):'<span class="muted" style="font-size:11.5px">Sin escenarios — agrégalos o extráelos del instructivo.</span>';
          ov.querySelectorAll('[data-delesc]').forEach(b=>b.addEventListener('click',()=>{esc.splice(+b.dataset.delesc,1);renderEsc();}));};
        renderEsc();
        ov.querySelector('#cf_escAdd').addEventListener('click',()=>{const val=ov.querySelector('#cf_escNew').value.trim();if(val){esc.push(val);ov.querySelector('#cf_escNew').value='';renderEsc();}});
        ov.querySelector('#cf_escNew').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ov.querySelector('#cf_escAdd').click();}});
        ov.querySelector('#cf_iaEsc').addEventListener('click',()=>{ const sug=['Atención y bienvenida','Tiempos de espera','Limpieza e imagen','Cierre y despedida'].filter(s=>!esc.includes(s)); esc=esc.concat(sug); renderEsc(); ui.toast(CX.ai&&CX.ai.ready()?'Escenarios extraídos del instructivo con IA':'Sugeridos por IA (configura Gemini para extracción real del instructivo)','ok',3600); });
        ov.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>{close();data.setProject(pr.id);CX.router.nav(b.dataset.goto);}));
        ov.querySelector('#cf_open').addEventListener('click',()=>{close();data.setProject(pr.id);ui.toast('Proyecto activo: '+pr.name,'ok');});
        ov.querySelector('#cf_save').addEventListener('click',()=>{ pr.name=ov.querySelector('#cf_name').value.trim()||pr.name; pr.industry=ov.querySelector('#cf_ind').value; pr.client=ov.querySelector('#cf_cli').value.trim(); pr.sucursales=+ov.querySelector('#cf_suc').value||pr.sucursales; pr.periodicidad=ov.querySelector('#cf_ronda').value; pr.ronda=ov.querySelector('#cf_ronda').value+' '+(pr.ronda||'').replace(/^[A-Za-zÁ-úñ]+\s?/,''); pr.periodoCumpl=ov.querySelector('#cf_cumpl').value; const ps=[...ov.querySelectorAll('.cf_pais:checked')].map(c=>c.value); if(ps.length){pr.countries=ps; pr.currency=pr.currency||{}; ps.forEach(c=>{if(!pr.currency[c])pr.currency[c]=(CX.COUNTRIES.find(x=>x.c===c)||{}).cur||'$';});} pr.scenarios=esc; pr.quincenas=ov.querySelector('#cf_quin').value.split('·').map(s=>s.trim()).filter(Boolean);
        /* PhaseA-2/3/4: revisión, submitido, fuentes y contactos por proyecto */
        if(ov.querySelector('#cf_revCons')){pr.revision={consultora:ov.querySelector('#cf_revCons').checked, cliente:ov.querySelector('#cf_revCli').checked};
        pr.submitido={quien:ov.querySelector('#cf_submQuien').value, rol:ov.querySelector('#cf_submRol').value};
        pr.hrFuente=Object.assign(pr.hrFuente||{},{origen:ov.querySelector('#cf_hrOrigen').value, etiqueta:ov.querySelector('#cf_hrEtiq').value.trim()});
        pr.cuestionario=Object.assign(pr.cuestionario||{},{modo:ov.querySelector('#cf_cueOrigen').value, etiqueta:ov.querySelector('#cf_cueEtiq').value.trim()});
        pr.contactos=pr.contactos||{}; ov.querySelectorAll('.cf_contacto').forEach(i=>{pr.contactos[i.dataset.ck]=i.value.trim();});}
        /* #157 — vincular el proyecto con la Cuenta/Cliente del CRM (trazabilidad bidireccional) */
        try{ if(pr.client && CX.crmStore){ const cuentas=CX.crmStore.cuentas(); let cu=cuentas.find(x=>(x.nombre||'').toLowerCase()===pr.client.toLowerCase());
          if(cu){ cu.proyectos=cu.proyectos||[]; if(!cu.proyectos.includes(pr.id))cu.proyectos.push(pr.id); CX.crmStore.saveCuentas(); } } }catch(e){}
        /* P0-2 (V94 reauditoría): si el proyecto/periodo fue creado desde la UI (no es seed),
           persiste el cambio para que sobreviva un reload — nunca reescribe los 3 seeds de ejemplo. */
        data._saveCustomProjects&&data._saveCustomProjects();
        CX.bus&&CX.bus.emit('visit-flow'); close(); CX.router.nav('proyectos');
        ui.toast('Configuración de '+pr.name+' actualizada'+(['retail','banca','food'].includes(pr.id)?' (seed de ejemplo · no persiste tras recargar)':' · guardado local preview · backend pendiente'),'ok',3600); });
      }});
    };
    const nb=document.getElementById('newProj');
    if(nb)nb.addEventListener('click',()=>CX.projectWizard(data,ui));
  },0);
  return html;
});
