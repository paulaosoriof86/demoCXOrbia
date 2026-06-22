/* ============================================================
   CXOrbia · Router + shell rendering (rail, topbar, mount)
   ============================================================ */
window.CX = window.CX || {};

CX.router = {
  mount(){
    const role=CX.session.role;
    document.body.classList.toggle('role-shopper',role==='shopper');
    if(role==='shopper'){ const ok=CX.data.projectsFor(role); if(ok.length && !ok.some(p=>p.id===CX.data.currentProjectId)) CX.data.currentProjectId=ok[0].id; }
    this.buildRail(role);
    const first=CX.NAV[role].flatMap(g=>g.items).find(id=>CX.moduleEnabled(id));
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
    const projOpts=visibleProjects.map(pr=>`<option value="${pr.id}" ${pr.id===d.currentProjectId?'selected':''}>${pr.name}</option>`).join('');
    const projBlock = role==='admin'
      ? `<div class="rail-proj"><div class="rail-proj-l">Proyecto activo</div>
           <select id="projSel">${projOpts}</select></div>`
      : (visibleProjects.length>1
        ? `<div class="rail-proj"><div class="rail-proj-l">Proyecto · ${u.code||''}</div>
             <select id="projSel">${projOpts}</select></div>`
        : `<div class="rail-proj"><div class="rail-proj-l">Proyecto</div>
             <div style="font-size:13px;font-weight:700">${p.name}</div>
             <div style="font-size:10.5px;color:var(--t3)">${p.industry}</div></div>`);

    const nav=CX.NAV[role].map(group=>{
      const items=group.items.filter(id=>CX.moduleEnabled(id)).map(id=>{
        const m=CX.MODULES[id]; if(!m)return '';
        const badge = (m.badge && role==='admin') ? `<span class="n-badge">${d.kpis().postPend||''}</span>`
          : (m.badgeNotif && CX.notif && CX.notif.unread(role)) ? `<span class="n-badge">${CX.notif.unread(role)}</span>` : '';
        const soon  = m.status==='soon' ? `<span class="n-soon">pronto</span>` : '';
        return `<div class="nav-i" id="nav-${id}" data-id="${id}">
          <span class="n-ic">${m.icon}</span><span>${m.label}</span>${badge||soon}</div>`;
      }).join('');
      if(!items) return '';
      return `<div class="nav-sec">${group.sec}</div>${items}`;
    }).join('');

    const logoHTML = CX.BRAND.logoUrl
      ? `<img class="client-logo" src="${CX.BRAND.logoUrl}" alt="logo">`
      : `<div class="logo-mark"><span class="dot"></span></div>
         <div><div class="brand-name">${CX.BRAND.name}</div><div class="brand-sub">${CX.BRAND.clientName?('para '+CX.BRAND.clientName):CX.BRAND.tagline}</div></div>`;

    rail.innerHTML=`
      <div class="rail-brand">
        ${logoHTML}
      </div>
      ${projBlock}
      <nav class="rail-nav">${nav}</nav>
      <div class="rail-foot">
        <div class="rail-user"><div class="rail-av">${initials}</div>
          <div><div style="font-size:12.5px;font-weight:700;color:#fff">${u.name||'Usuario demo'}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.5)">${role==='admin'?'Administración':role==='cliente'?'Portal del cliente':'Shopper · '+(p.countries.join('/'))}</div></div></div>
        <button class="rail-logout" id="logoutBtn">Cerrar sesión</button>
      </div>`;

    rail.querySelectorAll('.nav-i').forEach(n=>n.addEventListener('click',()=>this.nav(n.dataset.id)));
    const sel=document.getElementById('projSel');
    if(sel)sel.addEventListener('change',()=>{d.setProject(sel.value);CX.ui.toast('Proyecto: '+d.project().name,'ok');});
    document.getElementById('logoutBtn').addEventListener('click',()=>CX.app.logout());
  },

  nav(id){
    const role=CX.session.role, m=CX.MODULES[id];
    if(!m||!m.roles.includes(role)||!CX.moduleEnabled(id)) return;
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
