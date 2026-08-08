/* ============================================================
   CXOrbia · Corte 4 · P0-C4-VIS-02
   Empty-backend shell guard for Backend DEV preview only.
   ------------------------------------------------------------
   Purpose:
   - treat "Firestore connected + zero projects" as a valid state;
   - never mount project-dependent modules when no project exists;
   - clear stale shell DOM before login/role switches;
   - keep core data helpers null-safe while the dataset is empty.
   No provider writes, no demo fallback, no app/modules changes.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  function isPreview(){
    try{
      const q=new URLSearchParams(window.location.search||'');
      return q.get('cxBackendPreview')==='YES_PAULA_20260628_PREVIEW_DEV';
    }catch(e){ return false; }
  }

  function isProtectedEmpty(){
    try{
      if(!isPreview() || !CX.data || !Array.isArray(CX.data.projects)) return false;
      const explicitEmpty = CX.data.projects.length===0 || window.CX_CORTE4_READONLY?.empty===true || window.CX_BACKEND_LAST_STATE?.empty===true;
      const corte4EmptyContract = !!(CX.BACKEND && CX.BACKEND.previewMode===true && CX.BACKEND.readOnly===true && CX.BACKEND.allowEmptyBackend===true && window.CX_CORTE4_READONLY?.empty!==false);
      return explicitEmpty || corte4EmptyContract;
    }catch(e){ return false; }
  }

  function clearShellDom(){
    const rail=document.getElementById('rail'); if(rail) rail.innerHTML='';
    const view=document.getElementById('view'); if(view) view.innerHTML='';
    const crumb=document.getElementById('crumb'); if(crumb) crumb.innerHTML='';
    document.body.classList.remove('role-shopper','nav-open');
    window.CX_C4_EMPTY_SHELL_STATE={active:false,role:null,projects:(CX.data&&Array.isArray(CX.data.projects))?CX.data.projects.length:null};
  }

  function dataBadge(){
    try{return CX.dataSource&&CX.dataSource.badge?CX.dataSource.badge():{t:'Conectado',c:'#2196d3'};}
    catch(e){return {t:'Conectado',c:'#2196d3'};}
  }

  function renderEmptyShell(role){
    const rail=document.getElementById('rail');
    const view=document.getElementById('view');
    const crumb=document.getElementById('crumb');
    const badge=document.getElementById('tbDataBadge');
    document.body.classList.toggle('role-shopper',role==='shopper');

    const b=dataBadge();
    if(badge) badge.innerHTML='<span class="d" style="background:'+(b.c||'#2196d3')+'"></span> '+(b.t||'Conectado');
    if(crumb) crumb.innerHTML='Sistema <span class="sep">/</span> <b>Sin datos disponibles</b>';

    const userRole=role==='admin'?'Administración':role==='cliente'?'Portal del cliente':role==='shopper'?'Shopper / Evaluador':'Acceso operativo';
    const initials=role==='admin'?'AD':role==='cliente'?'CL':role==='shopper'?'EV':'CX';
    if(rail){
      rail.innerHTML=`
        <div class="rail-brand">
          <div class="logo-mark"><span class="dot"></span></div>
          <div><div class="brand-name">CXOrbia</div><div class="brand-sub">Field Operations Platform</div></div>
        </div>
        <div class="rail-proj">
          <div class="rail-proj-l">Proyecto</div>
          <div style="font-size:11px;color:var(--t3);padding:5px 0">Sin proyectos disponibles</div>
          <div class="rail-proj-l" style="margin-top:9px">Periodo</div>
          <div style="font-size:11px;color:var(--t3);padding:5px 0">Sin periodos disponibles</div>
        </div>
        <div class="rail-src" style="display:flex;align-items:center;gap:6px;margin:8px 18px 0;font-size:10px;color:var(--t3)">
          <span style="width:7px;height:7px;border-radius:50%;background:${b.c||'#2196d3'}"></span>Datos: ${b.t||'Conectado'}
        </div>
        <nav class="rail-nav"></nav>
        <div class="rail-foot">
          <div class="rail-user"><div class="rail-av">${initials}</div>
            <div><div style="font-size:12.5px;font-weight:700;color:#fff">${userRole}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,.5)">Sin proyecto asignado</div></div></div>
          <button class="rail-logout" id="logoutBtn">Cerrar sesión</button>
        </div>`;
      const out=rail.querySelector('#logoutBtn'); if(out) out.addEventListener('click',()=>CX.app.logout());
    }

    if(view){
      const roleText=role==='shopper'?'No hay proyectos ni visitas disponibles para este perfil todavía.':'No hay proyectos materializados en este entorno todavía.';
      view.innerHTML=`
        <div style="max-width:720px;margin:44px auto;padding:0 18px">
          <div class="card card-p" style="text-align:center;padding:38px 30px">
            <div style="font-size:38px;line-height:1;margin-bottom:12px">📂</div>
            <div class="card-t" style="font-size:19px;margin-bottom:7px">Sin proyectos disponibles</div>
            <div style="font-size:13px;line-height:1.65;color:var(--t2)">${roleText}</div>
            <div style="font-size:12px;line-height:1.55;color:var(--t3);margin-top:9px">La conexión al backend está activa y no se están usando datos de demostración.</div>
          </div>
        </div>`;
    }

    try{ if(CX.topbar&&CX.topbar.renderLogo) CX.topbar.renderLogo(); }catch(e){}
    window.CX_C4_EMPTY_SHELL_STATE={active:true,role:role||null,projects:0,periodId:null,projectId:null,staleShell:false};
    return true;
  }

  function install(){
    if(!isPreview() || !CX.data || !CX.router || !CX.app) return;

    /* Defensive null guards for core helpers during an intentionally empty dataset. */
    if(!CX.data.__c4Vis02NullSafe){
      const originalProgramBase=typeof CX.data.programBase==='function'?CX.data.programBase:null;
      const originalProgramKey=typeof CX.data.programKey==='function'?CX.data.programKey:null;
      if(originalProgramBase) CX.data.programBase=function(p){ return p ? originalProgramBase.call(this,p) : ''; };
      if(originalProgramKey) CX.data.programKey=function(p){ return p ? originalProgramKey.call(this,p) : null; };
      CX.data.__c4Vis02NullSafe=true;
    }

    const originalMount=CX.router.mount.bind(CX.router);
    CX.router.mount=function(){
      if(isProtectedEmpty()) return renderEmptyShell(CX.session&&CX.session.role);
      return originalMount.apply(CX.router,arguments);
    };

    const originalShowLogin=CX.app.showLogin.bind(CX.app);
    CX.app.showLogin=function(){
      clearShellDom();
      return originalShowLogin.apply(CX.app,arguments);
    };

    const originalEnter=CX.app.enter.bind(CX.app);
    CX.app.enter=function(){
      clearShellDom();
      if(isProtectedEmpty()){
        const lg=document.getElementById('login'); if(lg) lg.classList.add('hidden');
        const app=document.getElementById('app'); if(app) app.classList.add('on');
        return renderEmptyShell(CX.session&&CX.session.role);
      }
      return originalEnter.apply(CX.app,arguments);
    };

    window.CX_C4_EMPTY_SHELL_GUARD={installed:true,isProtectedEmpty,renderEmptyShell,clearShellDom};
  }

  /* This script loads before app.js. Register first so the guard installs before app boot. */
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
