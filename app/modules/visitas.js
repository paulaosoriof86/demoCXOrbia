/* CXOrbia · Visitas (admin: tabla operativa editable · shopper: marketplace) */
CX.module('visitas', ({data,role,ui})=>{
  const p=data.period();

  /* ---------------- SHOPPER: marketplace de oportunidades (TODOS los proyectos) ---------------- */
  if(role==='shopper'){
    /* P0-2: proyecto = programa (nombre base), nunca el nombre del PERIODO (que ya incluye el mes).
       Debe resolver tanto si v.projectId trae el id del periodo como si trae la programKey raíz. */
    const projByAny=(id)=>{let pr=data.projects.find(x=>x.id===id); if(!pr) pr=data.projects.find(x=>data.programKey(x)===id); return pr;};
    const projName=(id)=>{const pr=projByAny(id);return pr?data.programBase(pr):'';};
    const projAccent=(id)=>{const pr=projByAny(id);return pr?pr.accent:p.accent;};
    /* Ajuste B (V159.1): agrupar por programKey real, no por projectId — projectId puede traer
       ids de distintos periodos del MISMO proyecto, duplicando la opción en el filtro. */
    const progKeyOf=(v)=>{const pr=projByAny(v.projectId); return pr?data.programKey(pr):v.projectId;};
    /* P0-1 (V160) / Ajuste A (V161): franja comercial única — WK/RH WK → Lunes a viernes; WKND/RH
       WKND → Sábado o domingo; P1Q, valores desconocidos o códigos no reconocidos ('other') →
       Pendiente de validación. Nunca "feriado", nunca el valor crudo de una categoría 'other'.
       Colapsa espacios internos antes de comparar. Normaliza sobre franjaCode y, si no existe,
       sobre v.franja; también acepta texto ya comercial. */
    const franjaCategory=(v)=>{
      const raw=(v.franjaCode!=null?v.franjaCode:v.franja);
      const t=String(raw||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(!t) return 'pending';
      if(t==='WK'||t==='RH WK') return 'weekday';
      if(t==='WKND'||t==='RH WKND') return 'weekend';
      if(t==='P1Q') return 'pending';
      if(t==='SEMANA'||t==='LUNES A VIERNES') return 'weekday';
      if(t==='FIN DE SEMANA'||t==='SÁBADO O DOMINGO'||t==='SABADO O DOMINGO') return 'weekend';
      return 'other';
    };
    const franjaDisplay=(v)=>{
      const cat=franjaCategory(v);
      if(cat==='weekday') return 'Lunes a viernes';
      if(cat==='weekend') return 'Sábado o domingo';
      return 'Pendiente de validación';
    };
    /* P0-1: available solo es canónico cuando visitFacets() lo expone como boolean explícito
       (contrato R21). Sin ese contrato (adapter no cargado), preserva el criterio anterior
       (v.estado==='disponible') — nunca tratar la sola existencia del objeto como disponibilidad. */
    const isAvailable=(v)=>{
      const f=typeof data.visitFacets==='function'?data.visitFacets(v):null;
      const hasCanonical=!!f&&typeof f.available==='boolean';
      return hasCanonical ? (f.available===true && f.eligibilityBlocked!==true) : v.estado==='disponible';
    };
    /* P0-2 (V160): el marketplace debe limitarse a los proyectos ACTIVOS/AUTORIZADOS del shopper,
       no solo al país. Reusa la misma regla del router (resolveVisibleProjects) que ya respeta
       CX.tenantProfile.activeProjectIds/inactiveProjectIds; si no existe, cae a projectsFor('shopper')
       y aplica el mismo filtro de tenantProfile aquí mismo. Un proyecto pausado/inactivo no debe
       ofrecer nuevas visitas — el histórico no se toca (esto solo filtra el marketplace operativo). */
    const shopperProjects=(CX.router && typeof CX.router.resolveVisibleProjects==='function')
      ? CX.router.resolveVisibleProjects('shopper')
      : (()=>{
          let base=(typeof data.projectsFor==='function')?data.projectsFor('shopper'):data.projects;
          const tp=CX.tenantProfile;
          if(tp && (Array.isArray(tp.activeProjectIds)||Array.isArray(tp.inactiveProjectIds))){
            const idsOf=(pr)=>{const arr=[pr.id]; try{if(data.programKey)arr.push(data.programKey(pr));}catch(e){} if(pr.program)arr.push(pr.program); return arr;};
            const activeSet=Array.isArray(tp.activeProjectIds)?tp.activeProjectIds:null;
            const inactiveSet=Array.isArray(tp.inactiveProjectIds)?tp.inactiveProjectIds:[];
            base=base.filter(pr=>{
              const ids=idsOf(pr);
              if(activeSet && !ids.some(x=>activeSet.includes(x))) return false;
              if(ids.some(x=>inactiveSet.includes(x))) return false;
              return true;
            });
          }
          return base;
        })();
    const allowedProgramKeys=new Set(shopperProjects.map(pr=>data.programKey(pr)));
    // ofertas de TODOS los proyectos autorizados para el shopper (alcance por país Y proyecto activo),
    // usando el contrato real de disponibilidad cuando exista — nunca estado textual ni ausencia de shopper.
    const scopePool=data._visitas.filter(v=>(!data.inScope||data.inScope(v.pais)) && allowedProgramKeys.has(progKeyOf(v)));
    const list=(typeof data.availableVisits==='function')
      ? data.availableVisits(scopePool)
      : scopePool.filter(isAvailable);
    const allProjects=[...new Map(list.map(v=>[progKeyOf(v),{key:progKeyOf(v),name:projName(v.projectId)}])).values()];
    const escEmoji=(s)=>{const t=(s||'').toLowerCase();
      if(t.includes('fin de semana')||t.includes('estreno'))return '🎉';
      if(t.includes('incógnito')||t.includes('incognito'))return '🕵️';
      if(t.includes('almuerzo')||t.includes('cena')||t.includes('combo'))return '🍽️';
      if(t.includes('drive'))return '🚗'; if(t.includes('préstamo')||t.includes('cuenta'))return '🏦';
      if(t.includes('telef'))return '📞'; return '🎯';};
    const cell=(lbl,val)=>`<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3)">${lbl}</div><div style="font-size:13px;font-weight:700;color:var(--t1)">${val}</div></div>`;
    const card=(v)=>`<div class="card hov" style="overflow:hidden;display:flex;flex-direction:column">
      <div style="background:linear-gradient(135deg,${projAccent(v.projectId)},var(--brand-dark));color:#fff;padding:12px 15px" class="between">
        <div><b style="font-size:14px">${v.sucursal.split(' · ')[0]}</b><div style="font-size:11px;opacity:.9">📍 ${v.ciudad}, ${CX.paisName(v.pais)}</div></div>
        <span style="background:rgba(255,255,255,.22);border-radius:20px;padding:3px 11px;font-size:11px;font-weight:700">Disponible</span></div>
      <div class="card-p" style="padding:13px 15px;flex:1">
        <div style="font-size:10px;font-weight:700;color:var(--brand);background:var(--brand-light);display:inline-block;padding:2px 8px;border-radius:6px;margin-bottom:10px">🗂️ ${projName(v.projectId)}</div>
        <div class="grid g2" style="gap:11px;margin-bottom:11px">
          ${cell('Quincena',v.quincena)}${cell('Franja',(franjaDisplay(v)==='Sábado o domingo'?'🎉 ':'📅 ')+franjaDisplay(v))}
          ${cell('Canal',v.canal||'—')}${cell('Escenario',escEmoji(v.escenario)+' '+v.escenario)}
        </div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3)">📅 Disponible desde</div>
        <div style="font-size:12.5px;font-weight:600;color:var(--t1);margin-bottom:10px">${/^\d{4}-\d{2}-\d{2}$/.test(v.disponibleDesde||'')?v.disponibleDesde:'Pendiente de validación'}</div>
        ${v.combo?`<div style="background:var(--amber-bg);border-radius:8px;padding:7px 10px;font-size:11.5px;color:#8a5b00;margin-bottom:11px">🍿 ${v.combo}</div>`:''}
        <div class="between">
          <div><span style="font-size:16px;font-weight:800;color:var(--green);font-family:var(--disp)">${ui.money(v.currency,v.honorario)}</span>
          <div style="font-size:10.5px;color:var(--t3)">${v.reembolso||v.boleto||v.comboAmt?'+ reembolso':'honorario base'}</div></div>
          <button class="btn btn-pr btn-sm" data-detail="${v.id}">Ver detalle →</button>
        </div>
      </div></div>`;
    const html=`
      ${ui.ph('Visitas Disponibles', list.length+' oportunidades en '+allProjects.length+' proyecto(s) para tu perfil')}
      <div class="flex wrap" style="gap:8px;margin-bottom:12px">
        <select class="sel" id="fProj" style="width:auto"><option value="">🗂️ Todos los proyectos</option>${allProjects.map(pr=>`<option value="${pr.key}">${pr.name}</option>`).join('')}</select>
        <select class="sel" id="fQuin" style="width:auto"><option value="">📆 Toda quincena</option>${[...new Set(list.map(v=>v.quincena))].map(q=>`<option>${q}</option>`).join('')}</select>
        <select class="sel" id="fEsc" style="width:auto"><option value="">🎯 Todo escenario</option>${[...new Set(list.map(v=>v.escenario))].map(s=>`<option>${s}</option>`).join('')}</select>
        <select class="sel" id="fCanal" style="width:auto"><option value="">📲 Todo canal</option>${[...new Set(list.map(v=>v.canal).filter(Boolean))].map(s=>`<option>${s}</option>`).join('')}</select>
      </div>
      ${ui.aiBox('Ahora ves la oferta de <b>todos los proyectos</b> a la vez. Filtra por proyecto, quincena, escenario o canal. Las visitas se derivan de cada hoja de ruta (online, importada o creada en la plataforma).','Toda la oferta ✨')}
      <div id="vList" style="margin-top:14px">${list.length?`<div class="grid g3">${list.map(card).join('')}</div>`:ui.empty('🔍','Sin visitas disponibles')}</div>`;
    /* P0-3 (V160): resolver el periodo/proyecto REAL de la visita en vez de caer al proyecto
       actualmente seleccionado. Prioridad: 1) v.periodId exacto; 2) v.projectId exacto (id de
       periodo); 3) programKey de la visita + periodo activo/compatible de ESE programa;
       4) el periodo actual, pero solo si pertenece al mismo programKey. Si no se puede resolver
       con seguridad, no se abre la ficha \u2014 se avisa honestamente. Usado tanto al abrir el detalle
       inicial como tras aplicar filtros (bind() se reusa en apply()). */
    /* P0 (V161C): la resolución NUNCA debe buscar periodId/measurementWindowId globalmente
       antes de aislar por proyecto — dos programas distintos pueden compartir el mismo
       identificador lógico de periodo (ej. ambos "2026-07"), y una búsqueda global puede
       devolver el periodo del proyecto equivocado si este aparece antes en data.projects.
       Orden obligatorio:
       1) derivar el programKey de la visita SIN mirar periodId/measurementWindowId — solo
          v.projectId (id exacto de periodo o programKey), v.programKey o v.program;
       2) construir el conjunto de periodos candidatos SOLO de ese programa;
       3) dentro de ese conjunto: v.periodId (alias id/periodId/periodKey/measurementPeriod/
          periodo) → v.measurementWindowId → id exacto de v.projectId → periodo activo/actual
          del programa → único periodo del programa → exactamente un periodo active/current;
       4) un alias solo cuenta si resuelve a EXACTAMENTE un registro dentro del programa;
       5) si no se puede derivar el programa, o quedan varias coincidencias, null (mensaje
          honesto) — nunca periods[0] ni el proyecto actualmente seleccionado de otro programKey. */
    const resolveVisitProject=(v)=>{
      let key=null;
      if(v.projectId){
        const byId=data.projects.find(pr=>pr.id===v.projectId);
        if(byId){ key=data.programKey(byId); }
        else if(data.projects.some(pr=>data.programKey(pr)===v.projectId)){ key=v.projectId; }
      }
      if(!key && v.programKey) key=v.programKey;
      if(!key && v.program) key=v.program;
      if(!key) return null;
      const periods=(typeof data.periodsForProgram==='function')?data.periodsForProgram(key):data.projects.filter(x=>data.programKey(x)===key);
      if(!periods||!periods.length) return null;
      const aliasMatch=(matcher)=>{ const m=periods.filter(matcher); return m.length===1?m[0]:null; };
      if(v.periodId){
        const m=aliasMatch(pr=>pr.id===v.periodId||pr.periodId===v.periodId||pr.periodKey===v.periodId||pr.measurementPeriod===v.periodId||pr.periodo===v.periodId);
        if(m) return m;
      }
      if(v.measurementWindowId){
        const m=aliasMatch(pr=>pr.measurementWindowId===v.measurementWindowId);
        if(m) return m;
      }
      if(v.projectId){ const byId=periods.find(pr=>pr.id===v.projectId); if(byId) return byId; }
      if(p && data.programKey(p)===key){
        const cur=periods.find(pr=>pr.id===data.currentPeriodId);
        if(cur) return cur;
      }
      if(periods.length===1) return periods[0];
      const activePeriodId = periods.map(pr=>pr.activePeriodId).find(Boolean);
      if(activePeriodId){ const act=periods.find(pr=>pr.id===activePeriodId); if(act) return act; }
      const flagged = periods.filter(pr=>pr.active===true||pr.current===true||pr.isActive===true||pr.isCurrent===true);
      if(flagged.length===1) return flagged[0];
      return null;
    };
    setTimeout(()=>{
      const bind=()=>document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>{
        const v=list.find(x=>x.id===b.dataset.detail); if(!v) return;
        const proj=resolveVisitProject(v);
        if(!proj){ ui.toast('No se pudo determinar el proyecto de esta oportunidad con seguridad.','err'); return; }
        CX.shopperVisitDetail(data,proj,v,ui);
      }));
      const apply=()=>{const fpr=document.getElementById('fProj').value,fq=document.getElementById('fQuin').value,fe=document.getElementById('fEsc').value,fc=document.getElementById('fCanal').value;const a=list.filter(v=>(!fpr||progKeyOf(v)===fpr)&&(!fq||v.quincena===fq)&&(!fe||v.escenario===fe)&&(!fc||v.canal===fc));document.getElementById('vList').innerHTML=a.length?`<div class="grid g3">${a.map(card).join('')}</div>`:ui.empty('🔍','Sin resultados');bind();};
      ['fProj','fQuin','fEsc','fCanal'].forEach(id=>document.getElementById(id).addEventListener('change',apply));bind();
    },0);
    return html;
  }

  /* ---------------- ADMIN: tabla operativa completa ---------------- */
  const ALL=!!CX.session._visAll;
  const all=ALL?data._visitas.filter(v=>data.inScope(v.pais)):data.visitas();
  const projName=(id)=>{let pr=data.projects.find(x=>x.id===id); if(!pr) pr=data.projects.find(x=>data.programKey(x)===id); return pr?data.programBase(pr):'';};
  /* P0-1: mismo criterio de disponibilidad canónica que en el marketplace del shopper. */
  const isAvailableAdmin=(v)=>{
    const f=typeof data.visitFacets==='function'?data.visitFacets(v):null;
    const hasCanonical=!!f&&typeof f.available==='boolean';
    return hasCanonical ? (f.available===true && f.eligibilityBlocked!==true) : v.estado==='disponible';
  };
  const k=data.kpis();
  const row=(v)=>`<tr data-vid="${v.id}">
    <td><b style="color:var(--brand)">#${v.num}</b>${ALL?`<div style="font-size:9px;color:var(--t3)">${projName(v.projectId)}</div>`:''}</td>
    <td><b>${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${v.ciudad} · ${v.pais}</div></td>
    <td style="font-size:12px">${v.escenario}</td>
    <td style="font-size:11.5px;color:var(--t2)">${data.measurementWindow(v).label}</td>
    <td>${v.shopper?`<b style="font-size:12px">${v.shopper}</b><div style="font-size:10px;color:var(--t3)">${v.shopperCode}</div>`:'<span class="muted">— sin asignar</span>'}</td>
    <td>${ui.estadoBadge(v.estado)}</td>
    <td style="font-size:12px">${v.agendada||'<span class="muted">—</span>'}</td>
    <td style="font-size:12px;font-weight:600;color:var(--green)">${ui.money(v.currency,v.honorario)}</td>
    <td style="text-align:right"><button class="btn btn-ghost btn-sm" data-vdetail="${v.id}" title="Ver detalle completo">🔍</button> ${!v.shopper&&v.estado!=='fuera_rango'?`<button class="btn btn-soft btn-sm" data-assign="${v.id}">Asignar</button> `:''}<button class="btn btn-ghost btn-sm" data-edit="${v.id}">✏️</button></td>
  </tr>`;
  const html=`
    <div class="between" style="margin-bottom:6px"><div>${ui.ph('Visitas', (ALL?('Todos los proyectos · '+all.length+' visitas'):(p.name+' · base operativa'))+' · publica, asigna y edita cada visita')}</div>
      <div class="flex"><span class="bdg bdg-b">● Preview operativo</span><span class="bdg bdg-b">${all.length} visitas</span></div></div>
    <div class="flex wrap" style="gap:8px;margin-bottom:12px">
      <button class="btn btn-green btn-sm" id="addV">＋ Publicar visita</button>
      <button class="btn btn-soft btn-sm">⤒ Importar HR</button>
      <button class="btn btn-ghost btn-sm" id="vExport">⤓ Exportar</button>
      <div class="spacer"></div>
      <input class="inp" id="vSearch" placeholder="🔎 Sucursal, shopper, ciudad…" style="max-width:240px">
      <select class="sel" id="vProj" style="width:auto"><option value="all" ${ALL?'selected':''}>🌐 Todos los proyectos</option>${data.scopedProyectos().map(pg=>`<option value="${pg.key}" ${(!ALL&&pg.key===data.currentProgramKey())?'selected':''}>${pg.name}</option>`).join('')}</select>
      <select class="sel" id="vEst" style="width:auto"><option value="">Todos los estados</option>${['disponible','postulada','asignada','agendada','realizada','cuestionario','liquidada','fuera_rango'].map(e=>`<option value="${e}">${e}</option>`).join('')}</select>
      <select class="sel" id="vPais" style="width:auto"><option value="">País</option>${[...new Set(all.map(v=>v.pais))].map(c=>`<option>${c}</option>`).join('')}</select>
    </div>
    <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:11px;margin-bottom:16px" id="vKpis">
      <div data-k="disp" style="cursor:pointer">${ui.kpi('Disponibles',all.filter(isAvailableAdmin).length,'b')}</div>
      <div data-k="asig" style="cursor:pointer">${ui.kpi('Asignadas',k.asignadas.t,'b')}</div>
      <div data-k="real" style="cursor:pointer">${ui.kpi('Realizadas',k.realizadas.t,'g')}</div>
      <div data-k="sinasig" style="cursor:pointer">${ui.kpi('Sin asignar',k.sinAsignar.t,'r')}</div>
      <div data-k="fuera" style="cursor:pointer">${ui.kpi('Fuera de rango',k.fueraRango.t,'a')}</div>
    </div>
    <div class="card card-p">
      <table class="tbl"><thead><tr><th>#</th><th>Sucursal</th><th>Escenario</th><th>Periodo de medición</th><th>Shopper</th><th>Estado</th><th>Agenda</th><th>Honorario</th><th></th></tr></thead>
      <tbody id="vBody">${all.map(row).join('')}</tbody></table>
      <div style="margin-top:14px">${ui.aiBox('Cada visita es editable: sucursal, escenario, honorario, shopper y estado. Detecto solapamientos, fuera de rango y faltantes de cobertura antes de publicar.','Base operativa inteligente')}</div>
    </div>`;
  setTimeout(()=>{
    const vx=document.getElementById('vExport');
    if(vx&&CX.reportKit){
      const vSpec=(ext)=>{
        const byEst={}; all.forEach(v=>{byEst[v.estado]=(byEst[v.estado]||0)+1;});
        const san=(s)=>String(s||'r').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase()||'r';
        const projectLabel=ALL?'Todos los proyectos':(data.programBase?data.programBase(p):p.name);
        const periodLabel=(p.periodo||p.ronda||p.name||'Periodo');
        return { title:'Visitas · base operativa',
          meta:{title:'Visitas · base operativa',project:projectLabel,period:periodLabel,scope:(ALL?'Todos los proyectos':p.name),sourceLabel:'Operación viva del periodo',generatedAt:new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})},
          columns:[{key:'sucursal',label:'Sucursal'},{key:'pais',label:'País'},{key:'escenario',label:'Escenario'},{key:'shopper',label:'Shopper'},{key:'estado',label:'Estado'},{key:'agendada',label:'Agenda'},{key:'honorario',label:'Honorario'}],
          rows:all.map(v=>({sucursal:v.sucursal||'—',pais:v.pais||'—',escenario:v.escenario||'—',shopper:v.shopper||'—',estado:v.estado,agendada:v.agendada||'—',honorario:(v.honorario!=null?v.honorario:'—')})),
          notes:'',
          summary:['Visitas: '+all.length, Object.entries(byEst).map(([k2,v2])=>k2+': '+v2).join(' · ')],
          chart:{title:'Visitas por estado',data:Object.entries(byEst).map(([k2,v2])=>({label:k2,value:v2}))},
          filename:[san('visitas'),san(projectLabel),san(periodLabel),new Date().toISOString().slice(0,10)].join('_')+'.'+ext };
      };
      vx.addEventListener('click',()=>CX.ui.modal('⤓ Exportar visitas',`<p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Genera el reporte de visitas del alcance actual con el diseño del tenant.</p><div class="flex" style="gap:8px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="vxPdf">⤓ PDF</button><button class="btn btn-soft btn-sm" id="vxXls">⤓ Excel</button><button class="btn btn-pr btn-sm" id="vxPpt">⤓ PPT</button></div>`,{onMount:(ov)=>{ov.querySelector('#vxPdf').addEventListener('click',()=>CX.reportKit.exportPDF(vSpec('pdf')));ov.querySelector('#vxXls').addEventListener('click',()=>{if(CX.reportKit.exportExcel(vSpec('xlsx')))CX.ui.toast('Excel .xlsx generado','ok');});ov.querySelector('#vxPpt').addEventListener('click',()=>{if(CX.reportKit.exportPPT(vSpec('pptx')))CX.ui.toast('PowerPoint generado','ok');});}}));
    }
    const filt=()=>{const q=(document.getElementById('vSearch').value||'').toLowerCase(),fe=document.getElementById('vEst').value,fp=document.getElementById('vPais').value;
      document.querySelectorAll('#vBody tr').forEach(tr=>{const v=all.find(z=>z.id===tr.dataset.vid);const ok=(!q||(v.sucursal+(v.shopper||'')+v.ciudad).toLowerCase().includes(q))&&(!fe||v.estado===fe)&&(!fp||v.pais===fp);tr.style.display=ok?'':'none';});};
    ['vSearch','vEst','vPais'].forEach(id=>document.getElementById(id).addEventListener('input',filt));
    const vp=document.getElementById('vProj');
    if(vp)vp.addEventListener('change',()=>{ if(vp.value==='all'){CX.session._visAll=true;} else {CX.session._visAll=false;data.setProgram?data.setProgram(vp.value):data.setProject(vp.value);} CX.router.nav('visitas'); });
    const vKp={disp:['Visitas disponibles',isAvailableAdmin],asig:['Visitas asignadas',data.visitBucketFns.asignadas],real:['Visitas realizadas',data.visitBucketFns.realizadas],sinasig:['Visitas sin asignar',data.visitBucketFns.sinAsignar],fuera:['Fuera de rango',data.visitBucketFns.fueraRango]};
    document.querySelectorAll('#vKpis [data-k]').forEach(el=>el.addEventListener('click',()=>{ const d=vKp[el.dataset.k]; const L=all.filter(d[1]);
      ui.modal(d[0]+' ('+L.length+')', L.length?`<table class="tbl"><thead><tr><th>Sucursal</th><th>Shopper</th><th>Estado</th><th>Honorario</th></tr></thead><tbody>${L.map(v=>`<tr><td><b style="font-size:12.5px">${v.sucursal}</b><div style="font-size:10px;color:var(--t3)">${CX.paisFlag(v.pais)} ${v.ciudad}</div></td><td style="font-size:12px">${v.shopper||'<span class="muted">—</span>'}</td><td>${ui.estadoBadge(v.estado)}</td><td style="font-size:12px;color:var(--green)">${ui.money(v.currency,v.honorario)}</td></tr>`).join('')}</tbody></table>`:ui.empty('🔍','Sin visitas en esta categoría.')); }));
    const editor=(v)=>ui.modal((v?'Editar':'Publicar')+' visita',`
      <div class="grid g2" style="gap:12px">
        <div style="grid-column:1/3"><label class="lbl">Sucursal (elige o escribe nueva)</label>
         <select class="sel" id="vSucSel" style="margin-bottom:5px"><option value="">— elegir existente —</option>${[...new Set(data._visitas.filter(x=>x.projectId===p.id).map(z=>z.sucursal)),(CX.hr?CX.hr.external(p).map(r=>r.sucursal).filter(Boolean):[])].flat().filter((s,i,a)=>s&&a.indexOf(s)===i).map(s=>`<option ${v&&v.sucursal===s?'selected':''}>${s}</option>`).join('')}</select>
         <input class="inp" id="vSucFree" value="${v?v.sucursal:''}" placeholder="o escribe una nueva sucursal · Ciudad"></div>
        <div><label class="lbl">País</label><select class="sel">${p.countries.map(c=>`<option ${v&&v.pais===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div><label class="lbl">Quincena</label><select class="sel">${p.quincenas.map(q=>`<option ${v&&v.quincena===q?'selected':''}>${q}</option>`).join('')}</select></div>
        <div><label class="lbl">Escenario</label><select class="sel">${p.scenarios.map(s=>`<option ${v&&v.escenario===s?'selected':''}>${s}</option>`).join('')}</select></div>
        <div><label class="lbl">Honorario</label><input class="inp" type="number" value="${v?v.honorario:''}"></div>
        <div><label class="lbl">Shopper asignado</label><select class="sel"><option value="">— sin asignar</option>${data.shoppersFor().map(s=>`<option ${v&&v.shopperId===s.id?'selected':''}>${s.nombre}</option>`).join('')}</select></div>
      </div>
      <div style="text-align:right;margin-top:16px"><button class="btn btn-pr btn-sm" onclick="CX.ui.toast('Visita guardada','ok');this.closest('.cx-ov').remove()">💾 Guardar</button></div>`);
    document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editor(all.find(z=>z.id===b.dataset.edit))));
    document.getElementById('addV').addEventListener('click',()=>editor(null));
    const assignModal=(v)=>{
      const shoppers=data.shoppersFor();
      ui.modal('Asignar visita · '+v.sucursal, `
        <div style="background:var(--brand-light);border-radius:10px;padding:9px 12px;font-size:12px;color:var(--brand-dark);margin-bottom:12px">${v.escenario} · ${v.ciudad} · ${ui.money(v.currency,v.honorario)} · ${v.quincena}</div>
        <div class="flex" style="gap:0;border:1px solid var(--border);border-radius:9px;overflow:hidden;margin-bottom:12px">
          <button class="btn btn-sm btn-pr asgTab" data-t="exist" style="border-radius:0;flex:1">Shopper existente</button>
          <button class="btn btn-sm btn-ghost asgTab" data-t="new" style="border-radius:0;flex:1">Crear nuevo</button>
        </div>
        <div id="asgExist"><input class="inp" id="asgSearch" placeholder="Buscar shopper…" style="margin-bottom:8px"><div id="asgList" style="max-height:240px;overflow:auto"></div></div>
        <div id="asgNew" style="display:none"><div class="grid g2" style="gap:10px 12px">
          <div><label class="lbl">Primer nombre <b style="color:var(--accent)">*</b></label><input class="inp" id="an_f"></div>
          <div><label class="lbl">Primer apellido <b style="color:var(--accent)">*</b></label><input class="inp" id="an_l"></div>
          <div style="grid-column:1/3"><label class="lbl">WhatsApp <b style="color:var(--accent)">*</b></label><input class="inp" id="an_w" placeholder="+502 ..."></div>
        </div><div style="text-align:right;margin-top:12px"><button class="btn btn-green btn-sm" id="an_save">Crear y asignar</button></div></div>
      `, {onMount:(ov,close)=>{
        const renderList=(q)=>{ const f=shoppers.filter(s=>!q||s.nombre.toLowerCase().includes(q.toLowerCase()));
          ov.querySelector('#asgList').innerHTML=f.length?f.map(s=>`<button class="btn btn-ghost btn-sm asgPick" data-id="${s.id}" style="width:100%;justify-content:space-between;margin-bottom:6px">${s.nombre}<span class="bdg bdg-n">${s.ciudad||CX.paisName(s.pais)}</span></button>`).join(''):ui.empty('🔍','Sin shoppers en este país. Crea uno nuevo.');
          ov.querySelectorAll('.asgPick').forEach(b=>b.addEventListener('click',()=>{ data.assignVisit(v.id,b.dataset.id); close(); ui.toast('Visita asignada a '+data.getShopper(b.dataset.id).nombre,'ok'); CX.router.nav('visitas'); })); };
        renderList('');
        ov.querySelector('#asgSearch').addEventListener('input',e=>renderList(e.target.value));
        ov.querySelectorAll('.asgTab').forEach(b=>b.addEventListener('click',()=>{ ov.querySelectorAll('.asgTab').forEach(x=>x.classList.replace('btn-pr','btn-ghost')); b.classList.replace('btn-ghost','btn-pr'); ov.querySelector('#asgExist').style.display=b.dataset.t==='exist'?'':'none'; ov.querySelector('#asgNew').style.display=b.dataset.t==='new'?'':'none'; }));
        ov.querySelector('#an_save').addEventListener('click',()=>{ const f=ov.querySelector('#an_f').value.trim(),l=ov.querySelector('#an_l').value.trim(),w=ov.querySelector('#an_w').value.trim(); if(!f||!l||!w){ui.toast('Nombre, apellido y WhatsApp','err');return;} const s=data.addShopper({via:'asignacion',estado:'Pendiente',firstName:f,lastName:l,whatsapp:w,pais:v.pais,ciudad:v.ciudad}); data.assignVisit(v.id,s.id); close(); ui.toast('Shopper creado y visita asignada','ok',3200); CX.router.nav('visitas'); });
      }});
    };
    document.querySelectorAll('[data-assign]').forEach(b=>b.addEventListener('click',()=>assignModal(all.find(z=>z.id===b.dataset.assign))));
    /* P0-12 (paquete acumulado 20260711): el botón "Ver detalle completo" (🔍) no tenía handler —
       regresión que además había eliminado la tarjeta "Historial de estados". Se restaura con un
       historial construido SOLO a partir de datos reales ya presentes en la visita (fechas de
       cada transición que el propio dato guarda: disponibleDesde→agendada→realizada→cuestFecha→
       pagada/pagada_preview) más los eventos realmente auditados (CX.automations.audit(), p.ej.
       archivado). Si una visita no tiene ninguna transición registrada, se muestra empty state —
       nunca se inventan eventos que no ocurrieron. */
    const detailModal=(v)=>{
      if(!v) return;
      const steps=[];
      if(v.disponibleDesde) steps.push({t:v.disponibleDesde, l:'Publicada / disponible'});
      if(v.agendada) steps.push({t:v.agendada, l:'Agendada'+(v.shopper?' · '+v.shopper:'')});
      if(v.realizada) steps.push({t:v.realizada, l:'Realizada'});
      if(v.cuestFecha) steps.push({t:v.cuestFecha, l:'Cuestionario enviado'});
      if(v.estado==='liquidada'){
        const pagLabel=v.paymentSourceRef?'Pago confirmado':'Liquidada (preview, pendiente de pago confirmado)';
        steps.push({t:v.fechaPago||v.fechaEstimadaPago||v.cuestFecha||'—', l:pagLabel});
      }
      if(v._archived) steps.push({t:(v._archivedFecha||'').slice(0,10)||'—', l:'Archivada · motivo: '+(v._archivedMotivo||'—')+' · '+(v._archivedPor||'—')});
      const auditEvents=(CX.automations&&CX.automations.audit?CX.automations.audit():[]).filter(e=>e.ref===v.id);
      auditEvents.forEach(e=>steps.push({t:(e.fecha||'').slice(0,10)||'—', l:(e.accion||'Evento')+(e.detalle?' · '+e.detalle:'')+' · '+(e.por||'—')}));
      steps.sort((a,b)=>(a.t||'').localeCompare(b.t||''));
      ui.modal('Detalle · '+v.sucursal, `
        <div class="grid g2" style="gap:10px;margin-bottom:14px">
          <div style="font-size:12px;color:var(--t3)">Estado actual</div><div>${ui.estadoBadge(v.estado)}</div>
          ${(()=>{const vc=data.visitContract?data.visitContract(v):null;return vc&&vc.paymentState!=='no_aplica'?`<div style="font-size:12px;color:var(--t3)">Pago (contrato)</div><div>${ui.bdg(vc.paymentState,vc.paymentState==='confirmado'?'g':'n')}</div>`:'';})()}
          <div style="font-size:12px;color:var(--t3)">Shopper</div><div style="font-size:13px;font-weight:700">${v.shopper||'— sin asignar'}</div>
          <div style="font-size:12px;color:var(--t3)">Honorario</div><div style="font-size:13px;font-weight:700;color:var(--green)">${ui.money(v.currency,v.honorario)}</div>
        </div>
        <div class="card-h" style="padding:0;margin-bottom:8px"><div class="card-t">🕘 Historial de estados</div></div>
        ${steps.length?`<div style="display:flex;flex-direction:column;gap:0">${steps.map((s,i)=>`
          <div class="flex" style="gap:10px;align-items:flex-start;padding:8px 0;${i<steps.length-1?'border-bottom:1px dashed var(--border)':''}">
            <div style="font-size:11px;color:var(--t3);min-width:78px">${s.t}</div>
            <div style="font-size:12.5px;color:var(--t1)">${s.l}</div>
          </div>`).join('')}</div>`
          : ui.empty('🕘','Esta visita todavía no tiene transiciones de estado registradas.')}
        <div style="text-align:right;margin-top:14px"><button class="btn btn-ghost btn-sm" data-x4>Cerrar</button></div>
      `,{onMount:(ov,close)=>{ ov.querySelector('[data-x4]').addEventListener('click',close); }});
    };
    document.querySelectorAll('[data-vdetail]').forEach(b=>b.addEventListener('click',()=>detailModal(all.find(z=>z.id===b.dataset.vdetail))));
  },0);
  return html;
});
