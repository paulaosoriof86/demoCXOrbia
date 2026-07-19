/* ============================================================
   CXOrbia · Router + shell rendering (rail, topbar, mount)
   ============================================================ */
window.CX = window.CX || {};

CX.router = {
  mount(){
    const role=CX.session.role;
    document.body.classList.toggle('role-shopper',role==='shopper');
    /* P0-1 (paquete genérico 20260711): único indicador de origen de datos en el topbar —
       antes existía un "Demo comercial" fijo (siempre visible, sin importar el modo real) MÁS un
       segundo div oculto que solo aparecía si el modo no era demo. Ambos podían mostrar información
       contradictoria (ej. "Demo comercial" fijo mientras el otro decía "Bloqueado"). Ahora un único
       elemento se pinta enteramente desde CX.dataSource.badge(). */
    try{
      const db=document.getElementById('tbDataBadge');
      if(db && CX.dataSource){
        const b=CX.dataSource.badge();
        db.innerHTML='<span class="d" style="background:'+b.c+'"></span> '+b.t;
      }
    }catch(e){}
    /* GAP1 (paquete V113→V114): ninguna de estas ramas escribe currentPeriodId/currentProjectId
       directamente — todas pasan por CX.data.setProject(periodId), el único mutador real, que
       sincroniza AMBOS campos (currentPeriodId y currentProjectId recalculado vía programKey) y
       emite 'cx:period-changed'/'cx:project-changed'. Antes estas 5 ramas escribían
       currentPeriodId a secas y dejaban currentProjectId desincronizado. */
    if(role==='shopper'){ const ok=this.resolveVisibleProjects(role); if(ok.length && !ok.some(p=>p.id===CX.data.currentPeriodId)) CX.data.setProject(ok[0].id); }
    else if(role==='cliente'){
      /* P0 (V95 reauditoría): clientBrandAdmin/clientBrandViewer con scopeCliente/scopeProjectId
         deben aterrizar en SU proyecto, no en el que haya quedado activo de otra sesión. */
      const u=CX.session.user||{};
      if(u.scopeProjectId && CX.data.projects.some(p=>p.id===u.scopeProjectId)) CX.data.setProject(u.scopeProjectId);
      else if(u.scopeCliente){
        /* P1 (V96 reauditoría): con varios proyectos para el mismo cliente, conserva el ya activo
           si sigue siendo del cliente; si no, aterriza en el primero — el portal ofrece selector. */
        const matches=CX.data.clientProjects(u.scopeCliente);
        if(matches.length && !matches.some(p=>p.id===CX.data.currentPeriodId)) CX.data.setProject(matches[0].id);
      }
    }
    else if(CX.data.scopePaises()||((CX.session.user||{}).scopeProjectId)){
      const u=CX.session.user||{};
      if(u.scopeProjectId && CX.data.projects.some(p=>p.id===u.scopeProjectId)){
        /* projectCoordinator/operationsCoordinator con proyecto único asignado */
        if(CX.data.currentPeriodId!==u.scopeProjectId) CX.data.setProject(u.scopeProjectId);
      } else {
        const ok=CX.data.scopedProjects(); if(ok.length && !ok.some(p=>p.id===CX.data.currentPeriodId)) CX.data.setProject(ok[0].id);
      }
    }
    this.buildRail(role);
    const gRole=CX.session.testRole||role;
    const first=CX.NAV[role].flatMap(g=>g.items).find(id=>CX.moduleEnabled(id)&&CX.roleCanAccess(gRole,id)&&CX.moduleVisibleForProfile(id,role));
    /* P0-4: la vista guardada solo se reutiliza si TODAS las validaciones de nav() la aceptarían
       (roles, moduleEnabled, roleCanAccess, moduleVisibleForProfile) — si alguna falla, cae al
       primer módulo permitido en vez de dejar una pantalla vacía. */
    const savedOk = CX.session.view && CX.MODULES[CX.session.view] && CX.MODULES[CX.session.view].roles.includes(role)
      && CX.moduleEnabled(CX.session.view) && CX.roleCanAccess(gRole,CX.session.view) && CX.moduleVisibleForProfile(CX.session.view,role);
    const start = savedOk ? CX.session.view : first;
    this.nav(start);
  },

  /* P0-3 / P0-2A: proyectos visibles para el selector del rail — siempre data-driven, nunca
     un nombre fijo de tenant. Cliente: scopeProjectId (uno solo) o scopeCliente (clientProjects)
     primero — nunca projectsFor(role) sin filtrar, que puede exponer proyectos de otros clientes.
     Shopper: projectsFor(role) filtrado por CX.tenantProfile.activeProjectIds/inactiveProjectIds
     cuando estén configurados (comparando contra id de periodo, programKey y p.program). */
  resolveVisibleProjects(role){
    const d=CX.data, u=CX.session.user||{};
    if(role==='cliente'){
      if(u.scopeProjectId) return d.projects.filter(p=>p.id===u.scopeProjectId);
      if(u.scopeCliente) return d.clientProjects(u.scopeCliente);
      return d.projectsFor(role);
    }
    if(role==='shopper'){
      let base=d.projectsFor(role);
      const tp=CX.tenantProfile;
      if(tp && (Array.isArray(tp.activeProjectIds)||Array.isArray(tp.inactiveProjectIds))){
        const idsOf=(p)=>{const arr=[p.id]; try{if(d.programKey)arr.push(d.programKey(p));}catch(e){} if(p.program)arr.push(p.program); return arr;};
        const activeSet=Array.isArray(tp.activeProjectIds)?tp.activeProjectIds:null;
        const inactiveSet=Array.isArray(tp.inactiveProjectIds)?tp.inactiveProjectIds:[];
        base=base.filter(p=>{
          const ids=idsOf(p);
          if(activeSet && !ids.some(x=>activeSet.includes(x))) return false;
          if(ids.some(x=>inactiveSet.includes(x))) return false;
          return true;
        });
      }
      return base;
    }
    return d.projectsFor(role);
  },

  buildRail(role){
    const d=CX.data, p=d.period();
    const rail=document.getElementById('rail');
    const u=CX.session.user||{};
    const initials=(u.name||'CX').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();

    /* project switcher: admin ve todos; shopper solo los de su país; cliente solo su alcance (P0-3) */
    const visibleProjects = this.resolveVisibleProjects(role);
    /* P0 V63/V64 — selector de Proyecto muestra PROGRAMAS (no meses); el periodo se elige aparte */
    const progs = d.programs ? d.programs().filter(pg=>visibleProjects.some(vp=>d.programKey(vp)===pg.key)) : null;
    const curKey = d.currentProgramKey ? d.currentProgramKey() : null;
    /* P0-5 (V160): helper único de etiqueta de periodo, usado en AMBAS ramas — nunca cae al
       nombre completo del proyecto. Prioriza periodo/ronda/periodLabel/measurementPeriod; si
       faltan, deriva mes/año solo de una fecha real; si no puede derivarse, muestra un rótulo
       honesto (nunca inventa mes/año ni repite el nombre del proyecto). */
    const periodLabelOf = (pr)=>{
      if(!pr) return 'Periodo actual';
      if(pr.periodo) return pr.periodo;
      if(pr.ronda) return pr.ronda;
      if(pr.periodLabel) return pr.periodLabel;
      if(pr.measurementPeriod) return pr.measurementPeriod;
      const dateStr = pr.startDate||pr.fechaInicio||pr.desde||pr.disponibleDesde||'';
      const m = /^(\d{4})-(\d{2})/.exec(String(dateStr||''));
      if(m){
        const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        const mi = parseInt(m[2],10)-1;
        if(mi>=0 && mi<12) return MESES[mi].charAt(0).toUpperCase()+MESES[mi].slice(1)+' '+m[1];
      }
      return 'Periodo sin etiqueta';
    };
    /* Ajuste B (V161): si programBase() no existe, no usar ciegamente pr.name (puede incluir el
       periodo). Fallback seguro: pr.program, o un rótulo honesto "Proyecto sin etiqueta". */
    const projectBaseLabelOf = (pr)=>{
      if(!pr) return 'Proyecto sin etiqueta';
      if(d.programBase) return d.programBase(pr);
      if(pr.program) return pr.program;
      return 'Proyecto sin etiqueta';
    };
    let projBlock;
    if(progs && progs.length){
      const progOpts=progs.map(pg=>`<option value="${pg.key}" ${pg.key===curKey?'selected':''}>${pg.name}</option>`).join('');
      const periods=d.periodsForProgram?d.periodsForProgram(curKey):[];
      /* P0-1 (V159.1): Periodo es SIEMPRE una zona separada, aunque exista un solo periodo —
         antes desaparecía por completo con periods.length<=1, dejando Proyecto como única señal. */
      const periodSel = periods.length
        ? `<div class="rail-proj-l" style="margin-top:9px">Periodo</div>
           <select id="periodSel">${periods.map(pr=>`<option value="${pr.id}" ${pr.id===d.currentPeriodId?'selected':''}>${periodLabelOf(pr)}</option>`).join('')}</select>`
        : `<div class="rail-proj-l" style="margin-top:9px">Periodo</div><div style="font-size:11px;color:var(--t3);padding:4px 0">Sin periodos disponibles</div>`;
      /* P0-2A: multiproyecto es invariante de plataforma — SIEMPRE un selector data-driven
         (aunque hoy solo tenga una opción), nunca un rótulo estático derivado del periodo. Al
         agregar un segundo proyecto autorizado, aparece solo porque progs/visibleProjects crece —
         sin tocar este archivo. */
      projBlock = `<div class="rail-proj"><div class="rail-proj-l">Proyecto${role!=='admin'&&u.code?(' · '+u.code):''}</div>
           <select id="projSel">${progOpts}</select>${periodSel}</div>`;
    } else {
      /* P0-4/P0-5 (V160): fallback sin programs() debe seguir siendo multiproyecto FUNCIONAL:
         agrupar visibleProjects por programKey real (nunca un registro de periodo por opción),
         value de #projSel = programKey, y #periodSel limitado a los periodos de ESE proyecto.
         Si falta programs() pero existen programKey()/programBase()/periodsForProgram(), se usan;
         si tampoco existen, se deriva sin concatenar proyecto y periodo. */
      const keyOf = d.programKey ? (pr=>d.programKey(pr)) : (pr=>pr.program||pr.id);
      const baseOf = (pr)=>projectBaseLabelOf(pr);
      const periodsOf = d.periodsForProgram ? (k=>d.periodsForProgram(k)) : (k=>visibleProjects.filter(pr=>keyOf(pr)===k));
      const seen={}; const groups=[];
      visibleProjects.forEach(pr=>{ const k=keyOf(pr); if(!seen[k]){ seen[k]={key:k,name:baseOf(pr)}; groups.push(seen[k]); } });
      const curGroupKey = groups.some(g=>g.key===keyOf(p)) ? keyOf(p) : (groups[0]&&groups[0].key);
      const projOpts = groups.map(g=>`<option value="${g.key}" ${g.key===curGroupKey?'selected':''}>${g.name}</option>`).join('');
      const periodsForCur = curGroupKey ? periodsOf(curGroupKey) : [];
      const periodSel = periodsForCur.length
        ? `<div class="rail-proj-l" style="margin-top:9px">Periodo</div>
           <select id="periodSel">${periodsForCur.map(pr=>`<option value="${pr.id}" ${pr.id===d.currentPeriodId?'selected':''}>${periodLabelOf(pr)}</option>`).join('')}</select>`
        : `<div class="rail-proj-l" style="margin-top:9px">Periodo</div><div style="font-size:11px;color:var(--t3);padding:4px 0">Sin periodos disponibles</div>`;
      projBlock = `<div class="rail-proj"><div class="rail-proj-l">Proyecto${role!=='admin'&&u.code?(' · '+u.code):''}</div><select id="projSel">${projOpts}</select>${periodSel}</div>`;
    }
    /* P0-1 (paquete genérico 20260711): indicador único de origen de datos — una sola función
       (CX.dataSource.badge()) resuelve modo/etiqueta/estado/color para TODA la UI. Ya no existe
       una lógica propia leyendo window.CX_BACKEND_DEV/cx_imported de forma aislada aquí — esas
       banderas ahora son solo una nota de compatibilidad dentro de CX.dataSource, nunca una
       fuente de verdad independiente que pudiera contradecir el badge del topbar. */
    const _src = (CX.dataSource ? CX.dataSource.badge() : {t:'Demo · localStorage',c:'#d97706'});
    /* OLA1 (paquete V120→V121, consumidor real de CX.data.ctx()): el tooltip del indicador de
       fuente ahora compone tenantId/countryScope desde el contrato único en vez de leer
       CX.BRAND/scopePaises() por separado en este archivo — mismo dato, una sola fuente. */
    const _ctx = CX.data.ctx ? CX.data.ctx() : null;
    const _ctxTip = _ctx ? ` · tenant: ${_ctx.tenantId||'—'}${_ctx.countryScope?(' · alcance: '+_ctx.countryScope.join('/')):''}` : '';
    projBlock += `<div class="rail-src" title="Fuente de datos del prototipo${_src.mode?(' · modo: '+_src.mode):''}${_ctxTip}" style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:10px;color:var(--t3)"><span style="width:7px;height:7px;border-radius:50%;background:${_src.c}"></span>Datos: ${_src.t}</div>`;

    const collapsed = (()=>{try{return JSON.parse(localStorage.getItem('cx_rail_col')||'{}')}catch(e){return {};}})();
    const nav=CX.NAV[role].map(group=>{
      const items=group.items.filter(id=>CX.moduleEnabled(id)&&CX.roleCanAccess(CX.session.testRole||role,id)&&CX.moduleVisibleForProfile(id,role)).map(id=>{
        const m=CX.MODULES[id]; if(!m)return '';
        const badge = (m.badge && role==='admin') ? `<span class="n-badge">${d.kpis().postPend||''}</span>`
          : (m.badgeNotif && CX.notif && CX.notif.unread(role)) ? `<span class="n-badge">${CX.notif.unread(role)}</span>` : '';
        const soon  = m.status==='soon' ? `<span class="n-soon">pronto</span>` : '';
        const lbl = typeof m.label==='function' ? m.label(role) : m.label;
        return `<div class="nav-i" id="nav-${id}" data-id="${id}" role="button" tabindex="0" aria-label="${lbl}">
          <span class="n-ic" aria-hidden="true">${m.icon}</span><span>${lbl}</span>${badge||soon}</div>`;
      }).join('');
      if(!items) return '';
      const isc = collapsed[group.sec] || false;
      return `<div class="nav-sec-wrap${isc?' nav-sec-col':''}" data-grp="${group.sec}">
        <div class="nav-sec" data-sec="${group.sec}" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none">
          <span>${group.sec}</span><span style="font-size:9px;opacity:.6;margin-left:6px">${isc?'›':'⌄'}</span></div>
        <div class="nav-sec-items">${items}</div>
      </div>`;
    }).join('');

    /* CXOrbia SIEMPRE en el sidebar (no se reemplaza). El logo del cliente va en el topbar blanco. */
    const logoHTML = `<div class="logo-mark"><span class="dot"></span></div>
         <div><div class="brand-name">CXOrbia</div><div class="brand-sub">Field Operations Platform</div></div>`;

    /* P0-2 (paquete V110→V111, 20260714): bug confirmado — para role==='shopper' este label
       mostraba SIEMPRE los países del PROYECTO activo (p.countries, que puede ser multipaís,
       ej. GT/HN), como si esos fueran el alcance del shopper — aunque el shopper real solo
       opere en UNO de esos países. Ahora, para shopper, el país activo se deriva de su propio
       registro (CX.data.getShopper) — nunca del proyecto. Coordinador/aliado con scopePaises
       (verdadero alcance multipaís asignado) conservan su indicador multipaís sin cambios. */
    const _shopperPais = role==='shopper' ? (()=>{ const sh=u.shopperId && CX.data.getShopper && CX.data.getShopper(u.shopperId); return sh&&sh.pais ? (CX.paisFlag(sh.pais)+' '+CX.paisName(sh.pais)) : 'sin país asignado'; })() : null;
    const _roleLineLbl = role==='admin'?'Administración':role==='cliente'?'Portal del cliente':('Shopper · '+(_shopperPais||'—'));
    rail.innerHTML=`
      <div class="rail-brand">
        ${logoHTML}
      </div>
      ${projBlock}
      <nav class="rail-nav">${nav}</nav>
      <div class="rail-foot">
        <div class="rail-user"><div class="rail-av">${initials}</div>
          <div><div style="font-size:12.5px;font-weight:700;color:#fff" title="${(u.name||'Usuario demo').replace(/"/g,'&quot;')}">${u.name||'Usuario demo'}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.5)" title="${_roleLineLbl+((u.scopePaises&&u.scopePaises.length)?' · 🌎 alcance multipaís: '+u.scopePaises.join('/'):'')}">${_roleLineLbl}${(u.scopePaises&&u.scopePaises.length)?' · 🌎 '+u.scopePaises.join('/'):''}</div></div></div>
        <button class="rail-logout" id="logoutBtn">Cerrar sesión</button>
      </div>`;

    rail.querySelectorAll('.nav-i').forEach(n=>{
      n.addEventListener('click',()=>this.nav(n.dataset.id));
      n.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); this.nav(n.dataset.id); } });
    });
    /* logo del cliente en topbar blanco */
    if(CX.topbar&&CX.topbar.renderLogo)CX.topbar.renderLogo();
    rail.querySelectorAll('.nav-sec').forEach(sec=>sec.addEventListener('click',e=>{
      e.stopPropagation();
      const wrap=sec.closest('.nav-sec-wrap'); if(!wrap)return;
      const items=wrap.querySelector('.nav-sec-items'); if(!items)return;
      const key=sec.dataset.sec;
      const isNowCollapsed = items.style.display!=='none';
      items.style.display = isNowCollapsed ? 'none' : '';
      sec.querySelector('span:last-child').textContent = isNowCollapsed ? '›' : '⌄';
      try{const cl=JSON.parse(localStorage.getItem('cx_rail_col')||'{}');cl[key]=isNowCollapsed;localStorage.setItem('cx_rail_col',JSON.stringify(cl));}catch(e){}
    }));
    /* restore collapsed state */
    rail.querySelectorAll('.nav-sec-wrap').forEach(wrap=>{
      const key=wrap.dataset.grp;
      if(collapsed[key]){
        const items=wrap.querySelector('.nav-sec-items');
        const arrow=wrap.querySelector('.nav-sec span:last-child');
        if(items)items.style.display='none';
        if(arrow)arrow.textContent='›';
      }
    });
    const sel=document.getElementById('projSel');
    if(sel)sel.addEventListener('change',()=>{
      /* P0-4 (V160): #projSel siempre trae un programKey (ambas ramas de projBlock ya lo garantizan).
         setProgram(programKey) si existe; si no, activar el primer periodo v\u00e1lido de ese programa
         con setProject(periodId) \u2014 nunca escribir currentProjectId/currentPeriodId directamente. */
      if(typeof d.setProgram==='function'){ d.setProgram(sel.value); }
      else {
        const key=sel.value;
        const periods=(typeof d.periodsForProgram==='function')?d.periodsForProgram(key):visibleProjects.filter(pr=>(d.programKey?d.programKey(pr):pr.program)===key);
        if(periods && periods.length) d.setProject(periods[0].id);
      }
      CX.ui.toast('Proyecto: '+(d.period()?projectBaseLabelOf(d.period()):sel.value),'ok'); this.buildRail(CX.session.role);
    });
    const psel=document.getElementById('periodSel');
    if(psel)psel.addEventListener('change',()=>{
      /* P0-4: setCurrentPeriod(periodId) \u2014 fallback a setProject(periodId) si no existe. */
      const ok = (typeof d.setCurrentPeriod==='function') ? d.setCurrentPeriod(psel.value) : false;
      if(!ok && typeof d.setProject==='function') d.setProject(psel.value);
      /* Ajuste B (V161): periodLabelOf() es la única fuente de etiqueta de periodo, también en
         este toast — nunca lee periodo/ronda/name directamente aquí. */
      CX.ui.toast('Periodo: '+periodLabelOf(d.period()),'ok');
    });
    document.getElementById('logoutBtn').addEventListener('click',()=>CX.app.logout());
  },

  nav(id){
    const role=CX.session.role, m=CX.MODULES[id];
    if(!m||!m.roles.includes(role)||!CX.moduleEnabled(id)||!CX.roleCanAccess(CX.session.testRole||role,id)||!CX.moduleVisibleForProfile(id,role)) return;
    /* P0-2 (paquete V149 fix, 20260716): detalle técnico (Diagnóstico & Readiness) solo para
       superadmin explícito (session.effectiveRole()==='super'), nunca para admin/ops/coordinador/
       aliado — sin entrada en el menú (ruta no comercial, ver buildRail). */
    if(m.superOnly && !CX.session.hasTechAccess()) return;
    CX.session.view=id; CX.session.save();
    document.querySelectorAll('.nav-i').forEach(n=>n.classList.toggle('active',n.dataset.id===id));
    document.body.classList.remove('nav-open');
    // crumb
    const group=CX.NAV[role].find(g=>g.items.includes(id));
    const crumbLbl = typeof m.label==='function' ? m.label(role) : m.label;
    document.getElementById('crumb').innerHTML=`${group?group.sec:''} <span class="sep">/</span> <b>${crumbLbl}</b>`;
    this.render(id);
    const c=document.querySelector('.content'); if(c)c.scrollTo({top:0});
  },

  render(id){
    const host=document.getElementById('view');
    const fn=CX.modules[id];
    host.classList.remove('view'); void host.offsetWidth; host.classList.add('view');
    if(typeof fn==='function'){
      const out=fn({data:CX.data, role:CX.session.role, ui:CX.ui});
      if(typeof out==='string'){host.innerHTML=out;}
      else if(out instanceof Node){host.innerHTML='';host.appendChild(out);}
      else {host.innerHTML='';}
    } else {
      host.innerHTML=CX.ui.scaffold(id);
    }
  },
};

/* re-render current view + rail badges when project changes */
CX.bus.on('project',()=>{
  if(!CX.session.role)return;
  CX.router.buildRail(CX.session.role);
  CX.router.nav(CX.session.view);
});

/* ============================================================
   SINCRONÍA CENTRAL · una sola fuente de re-render para toda la
   plataforma. Cualquier mutación de datos re-renderiza la vista
   activa + recalcula badges del rail. Registrado UNA vez aquí
   (no en los módulos) para evitar fugas de listeners.
   visit-flow → asignación, cuestionario/score, sync HR, agenda
   shoppers   → alta/edición de evaluadores
   clients    → alta/edición de clientes
   programa   → edición de cuestionario ponderado (op ↔ cliente)
   ============================================================ */
(function(){
  let _busy=false;
  function reRender(){
    if(_busy || !CX.session.role || !CX.session.view) return;
    _busy=true;
    try{ CX.router.buildRail(CX.session.role); CX.router.nav(CX.session.view); }
    finally{ _busy=false; }
  }
  /* #239 — 'project' (cambio de programa/periodo) también re-renderiza el módulo activo,
     para que TODOS los módulos reflejen consistentemente el periodo/país seleccionado */
  ['visit-flow','shoppers','clients','programa','project'].forEach(ev=>CX.bus.on(ev, reRender));
  CX.router._reRender = reRender;
})();
