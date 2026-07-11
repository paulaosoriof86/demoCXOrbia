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
    if(role==='shopper'){ const ok=CX.data.projectsFor(role); if(ok.length && !ok.some(p=>p.id===CX.data.currentProjectId)) CX.data.currentProjectId=ok[0].id; }
    else if(role==='cliente'){
      /* P0 (V95 reauditoría): clientBrandAdmin/clientBrandViewer con scopeCliente/scopeProjectId
         deben aterrizar en SU proyecto, no en el que haya quedado activo de otra sesión. */
      const u=CX.session.user||{};
      if(u.scopeProjectId && CX.data.projects.some(p=>p.id===u.scopeProjectId)) CX.data.currentProjectId=u.scopeProjectId;
      else if(u.scopeCliente){
        /* P1 (V96 reauditoría): con varios proyectos para el mismo cliente, conserva el ya activo
           si sigue siendo del cliente; si no, aterriza en el primero — el portal ofrece selector. */
        const matches=CX.data.clientProjects(u.scopeCliente);
        if(matches.length && !matches.some(p=>p.id===CX.data.currentProjectId)) CX.data.currentProjectId=matches[0].id;
      }
    }
    else if(CX.data.scopePaises()||((CX.session.user||{}).scopeProjectId)){
      const u=CX.session.user||{};
      if(u.scopeProjectId && CX.data.projects.some(p=>p.id===u.scopeProjectId)){
        /* projectCoordinator/operationsCoordinator con proyecto único asignado */
        if(CX.data.currentProjectId!==u.scopeProjectId) CX.data.currentProjectId=u.scopeProjectId;
      } else {
        const ok=CX.data.scopedProjects(); if(ok.length && !ok.some(p=>p.id===CX.data.currentProjectId)) CX.data.currentProjectId=ok[0].id;
      }
    }
    this.buildRail(role);
    const gRole=CX.session.testRole||role;
    const first=CX.NAV[role].flatMap(g=>g.items).find(id=>CX.moduleEnabled(id)&&CX.roleCanAccess(gRole,id));
    const start = (CX.session.view && CX.MODULES[CX.session.view] && CX.MODULES[CX.session.view].roles.includes(role) && CX.moduleEnabled(CX.session.view))
      ? CX.session.view : first;
    this.nav(start);
  },

  buildRail(role){
    const d=CX.data, p=d.project();
    const rail=document.getElementById('rail');
    const u=CX.session.user||{};
    const initials=(u.name||'CX').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();

    /* project switcher: admin ve todos; shopper solo los de su país */
    const visibleProjects = d.projectsFor(role);
    /* P0 V63/V64 — selector de Proyecto muestra PROGRAMAS (no meses); el periodo se elige aparte */
    const progs = d.programs ? d.programs().filter(pg=>visibleProjects.some(vp=>d.programKey(vp)===pg.key)) : null;
    const curKey = d.currentProgramKey ? d.currentProgramKey() : null;
    let projBlock;
    if(progs && progs.length){
      const progOpts=progs.map(pg=>`<option value="${pg.key}" ${pg.key===curKey?'selected':''}>${pg.name}</option>`).join('');
      const periods=d.periodsForProgram?d.periodsForProgram(curKey):[];
      const periodSel = periods.length>1
        ? `<div class="rail-proj-l" style="margin-top:9px">Periodo</div>
           <select id="periodSel">${periods.map(pr=>`<option value="${pr.id}" ${pr.id===d.currentProjectId?'selected':''}>${pr.periodo||pr.name}</option>`).join('')}</select>`
        : '';
      projBlock = (role==='admin' || progs.length>1)
        ? `<div class="rail-proj"><div class="rail-proj-l">Proyecto${role!=='admin'&&u.code?(' · '+u.code):''}</div>
             <select id="projSel">${progOpts}</select>${periodSel}</div>`
        : `<div class="rail-proj"><div class="rail-proj-l">Proyecto</div>
             <div style="font-size:13px;font-weight:700">${p.name}</div>
             <div style="font-size:10.5px;color:var(--t3)">${p.industry}</div>${periodSel}</div>`;
    } else {
      const projOpts=visibleProjects.map(pr=>`<option value="${pr.id}" ${pr.id===d.currentProjectId?'selected':''}>${pr.name}</option>`).join('');
      projBlock = role==='admin'
        ? `<div class="rail-proj"><div class="rail-proj-l">Proyecto activo</div><select id="projSel">${projOpts}</select></div>`
        : `<div class="rail-proj"><div class="rail-proj-l">Proyecto</div><div style="font-size:13px;font-weight:700">${p.name}</div><div style="font-size:10.5px;color:var(--t3)">${p.industry}</div></div>`;
    }
    /* P0-1 (paquete genérico 20260711): indicador único de origen de datos — una sola función
       (CX.dataSource.badge()) resuelve modo/etiqueta/estado/color para TODA la UI. Ya no existe
       una lógica propia leyendo window.CX_BACKEND_DEV/cx_imported de forma aislada aquí — esas
       banderas ahora son solo una nota de compatibilidad dentro de CX.dataSource, nunca una
       fuente de verdad independiente que pudiera contradecir el badge del topbar. */
    const _src = (CX.dataSource ? CX.dataSource.badge() : {t:'Demo · localStorage',c:'#d97706'});
    projBlock += `<div class="rail-src" title="Fuente de datos del prototipo${_src.mode?(' · modo: '+_src.mode):''}" style="display:flex;align-items:center;gap:6px;margin-top:8px;font-size:10px;color:var(--t3)"><span style="width:7px;height:7px;border-radius:50%;background:${_src.c}"></span>Datos: ${_src.t}</div>`;

    const collapsed = (()=>{try{return JSON.parse(localStorage.getItem('cx_rail_col')||'{}')}catch(e){return {};}})();
    const nav=CX.NAV[role].map(group=>{
      const items=group.items.filter(id=>CX.moduleEnabled(id)&&CX.roleCanAccess(CX.session.testRole||role,id)).map(id=>{
        const m=CX.MODULES[id]; if(!m)return '';
        const badge = (m.badge && role==='admin') ? `<span class="n-badge">${d.kpis().postPend||''}</span>`
          : (m.badgeNotif && CX.notif && CX.notif.unread(role)) ? `<span class="n-badge">${CX.notif.unread(role)}</span>` : '';
        const soon  = m.status==='soon' ? `<span class="n-soon">pronto</span>` : '';
        return `<div class="nav-i" id="nav-${id}" data-id="${id}" role="button" tabindex="0" aria-label="${m.label}">
          <span class="n-ic" aria-hidden="true">${m.icon}</span><span>${m.label}</span>${badge||soon}</div>`;
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

    rail.innerHTML=`
      <div class="rail-brand">
        ${logoHTML}
      </div>
      ${projBlock}
      <nav class="rail-nav">${nav}</nav>
      <div class="rail-foot">
        <div class="rail-user"><div class="rail-av">${initials}</div>
          <div><div style="font-size:12.5px;font-weight:700;color:#fff" title="${(u.name||'Usuario demo').replace(/"/g,'&quot;')}">${u.name||'Usuario demo'}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.5)" title="${(role==='admin'?'Administración':role==='cliente'?'Portal del cliente':'Shopper · '+(p.countries.join('/')))+((u.scopePaises&&u.scopePaises.length)?' · 🌎 '+u.scopePaises.join('/'):'')}">${role==='admin'?'Administración':role==='cliente'?'Portal del cliente':'Shopper · '+(p.countries.join('/'))}${(u.scopePaises&&u.scopePaises.length)?' · 🌎 '+u.scopePaises.join('/'):''}</div></div></div>
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
      if(d.setProgram && d.programs){ d.setProgram(sel.value); CX.ui.toast('Proyecto: '+(d.project()?d.programBase(d.project()):sel.value),'ok'); this.buildRail(CX.session.role); }
      else { d.setProject(sel.value); CX.ui.toast('Proyecto: '+d.project().name,'ok'); }
    });
    const psel=document.getElementById('periodSel');
    if(psel)psel.addEventListener('change',()=>{ d.setProject(psel.value); CX.ui.toast('Periodo: '+(d.project().periodo||d.project().name),'ok'); });
    document.getElementById('logoutBtn').addEventListener('click',()=>CX.app.logout());
  },

  nav(id){
    const role=CX.session.role, m=CX.MODULES[id];
    if(!m||!m.roles.includes(role)||!CX.moduleEnabled(id)||!CX.roleCanAccess(CX.session.testRole||role,id)) return;
    CX.session.view=id; CX.session.save();
    document.querySelectorAll('.nav-i').forEach(n=>n.classList.toggle('active',n.dataset.id===id));
    document.body.classList.remove('nav-open');
    // crumb
    const group=CX.NAV[role].find(g=>g.items.includes(id));
    document.getElementById('crumb').innerHTML=`${group?group.sec:''} <span class="sep">/</span> <b>${m.label}</b>`;
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
