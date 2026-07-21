/* ============================================================
   CXOrbia · Boot + login / role selection
   ============================================================ */
window.CX = window.CX || {};

/* ---------- Favicon dinámico = logo de la consultora ---------- */
CX.setFavicon = function(){
  try{
    const b=CX.BRAND||{}; const logo=b.logo||b.logoUrl;
    let href=logo;
    if(!href){
      /* genera un favicon SVG con el color de marca si no hay logo */
      const c=(b.colors&&b.colors.brand)||'#2196d3';
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${c}"/><circle cx="32" cy="32" r="15" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="60 24"/><circle cx="44" cy="22" r="4" fill="#fff"/></svg>`;
      href='data:image/svg+xml,'+encodeURIComponent(svg);
    }
    let link=document.querySelector('link[rel="icon"]');
    if(!link){ link=document.createElement('link'); link.rel='icon'; document.head.appendChild(link); }
    link.href=href;
    /* apple-touch-icon para instalación en iOS */
    let at=document.querySelector('link[rel="apple-touch-icon"]');
    if(!at){ at=document.createElement('link'); at.rel='apple-touch-icon'; document.head.appendChild(at); }
    at.href=href;
  }catch(e){}
};

/* ---------- PWA: instalación asistida según dispositivo + navegador (sin prometer descarga automática) ---------- */
CX._deferredPrompt=null;
CX.setupPWA = function(){
  /* registra el service worker para que sea instalable */
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(reg=>{ try{reg.update();}catch(e){} }).catch(()=>{});
    /* auto-recarga una sola vez cuando un SW nuevo toma el control
       (así el usuario recibe la versión corregida sin refrescar a mano) */
    let reloaded=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(reloaded)return; reloaded=true; location.reload();
    });
  }
  const ua=navigator.userAgent||'';
  const isIOS=/iPad|iPhone|iPod/.test(ua)&&!window.MSStream;
  const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;
  if(isStandalone) return; /* ya está instalada */
  /* R19 crítico 3.A (20260716): app.js YA NO escucha beforeinstallprompt — antes había DOS
     propietarios del evento (este archivo y core/pwa.js), lo que podía disparar prompt() dos
     veces. core/pwa.js (CX.pwa.init/_armFirstInteraction) es ahora el ÚNICO dueño: captura el
     evento, arma un listener de una sola vez para la primera interacción elegible y llama
     prompt() exactamente una vez. Aquí solo queda la guía discreta de iOS (Safari nunca expone
     el evento, así que no puede haber doble disparo). */
  if(isIOS && !sessionStorage.getItem('cx_pwa_ios')){
    sessionStorage.setItem('cx_pwa_ios','1');
    setTimeout(()=>{ if(CX.ui&&CX.ui.toast) CX.ui.toast('📲 Para instalar la app: Compartir → “Agregar a inicio”','',6000); },2500);
  }
};

CX.app = {
  init(){
    CX.applyBrand();
    CX.setFavicon();
    CX.setupPWA();
    CX.session.load();
    if(CX.session.role){ this.enter(); }
    else { this.showLogin(); }
  },

  showLogin(){
    document.getElementById('app').classList.remove('on');
    const lg=document.getElementById('login');
    lg.classList.remove('hidden');
    const b=CX.BRAND;
    const hasClientLogo = !!(b.logoUrl||b.logo);
    /* P0-2 (paquete V110→V111, 20260714): bug confirmado — sin logo, el nombre del tenant se
       mostraba DOS veces: una en brandBlock (brand-name) y otra en login-title (que reusaba
       b.clientName). Con logo tampoco existía un título funcional realmente distinto (login-title
       seguía mostrando el nombre, no una descripción de lo que hace el sistema). Ahora
       login-title SIEMPRE es un título funcional (b.tagline o un fallback neutral) y NUNCA
       repite el nombre del tenant — el nombre aparece una única vez (en el logo si existe, o en
       brand-name si no). */
    const functionalTitle = b.tagline || 'Plataforma operativa de campo';
    const brandBlock = hasClientLogo
      ? `<img class="client-logo" src="${b.logoUrl||b.logo}" alt="logo" style="max-height:64px;max-width:200px;object-fit:contain">`
      : `<div class="logo-mark"><span class="dot"></span></div>
         <div><div class="brand-name">${b.clientName||b.name}</div></div>`;
    /* banderitas SOLO de los países configurados para el tenant/franquicia.
       Si no hay países elegidos, no se muestran (no listar todos). */
    /* R21: banderitas priorizan CX.tenantProfile.countries; si no existe, se derivan de los
       proyectos activos del tenant (excluyendo inactiveProjectIds) — nunca un catálogo global. */
    const tp = CX.tenantProfile || {};
    let paises = (tp.countries && tp.countries.length) ? tp.countries : (b.countries && b.countries.length) ? b.countries : [];
    if(!paises.length){
      try{
        const prj=(CX.data&&CX.data.projects)||[];
        const active=Array.isArray(tp.activeProjectIds)?tp.activeProjectIds:null;
        const inactive=Array.isArray(tp.inactiveProjectIds)?tp.inactiveProjectIds:[];
        /* P1-2: activeProjectIds/inactiveProjectIds suelen traer programKeys de proyecto, no ids
           de periodo — comparar contra id, CX.data.programKey(p) y p.program, no solo p.id. */
        const idsOf=(pr)=>{const arr=[pr.id]; try{if(CX.data&&CX.data.programKey)arr.push(CX.data.programKey(pr));}catch(e){} if(pr.program)arr.push(pr.program); return arr;};
        const scoped = active ? prj.filter(pr=>idsOf(pr).some(x=>active.includes(x))) : prj.filter(pr=>!idsOf(pr).some(x=>inactive.includes(x)));
        const set=new Set(); scoped.forEach(p=>(p.countries||[]).forEach(c=>set.add(c))); paises=[...set];
      }catch(e){}
    }
    /* R21: roles visibles/flags gobernados por CX.tenantProfile cuando el adapter lo inyecta;
       sin perfil (entorno actual sin adapter) se preserva el comportamiento existente. */
    const visibleRoles = Array.isArray(tp.visibleLoginRoles) && tp.visibleLoginRoles.length ? tp.visibleLoginRoles : ['admin','cliente','shopper','ops','coordinador','aliado'];
    const showAdminBtn = visibleRoles.includes('admin');
    const showClienteBtn = visibleRoles.includes('cliente') && tp.clientPortalVisible!==false;
    const showShopperBtn = visibleRoles.includes('shopper');
    const showShopperReg = showShopperBtn && tp.allowShopperRegistration!==false;
    const showTestArea = tp.showRoleTestArea!==false;
    const testAreaLabel = tp.roleTestAreaLabel || 'Accesos de validación';
    const altRoleDefs = {ops:'👥 Operativo',coordinador:'🌎 Coordinador',aliado:'🤝 Aliado'};
    const altRoles = Object.keys(altRoleDefs).filter(id=>visibleRoles.includes(id));
    /* P0-1 (V161): visibleLoginRoles determina QUÉ accesos existen; showRoleTestArea solo
       controla el rótulo/separador de "validación" — nunca debe ocultar un rol autorizado.
       Con showRoleTestArea=false, Operativo/Coordinador/Aliado (si están en visibleLoginRoles)
       se siguen mostrando como accesos normales, sin texto técnico ni separador. */
    const altRolesBtnsHTML = altRoles.map(id=>`<button class="btn btn-ghost btn-sm role-alt" data-role="${id}">${altRoleDefs[id]}</button>`).join('');
    const altRolesBlock = altRoles.length
      ? (showTestArea
          ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div style="font-size:11px;color:var(--t3);text-align:center;margin-bottom:6px">${testAreaLabel}</div>
          <div class="flex" style="gap:6px;justify-content:center;flex-wrap:wrap">
            ${altRolesBtnsHTML}
          </div>
        </div>`
          : `<div class="flex" style="gap:6px;justify-content:center;flex-wrap:wrap;margin-top:12px">${altRolesBtnsHTML}</div>`)
      : '';
    const flagsRow = paises.length
      ? `<div class="login-flags">${paises.slice(0,8).map(c=>`<span class="cflag" title="${CX.paisName?CX.paisName(c):c}"><img src="https://flagcdn.com/24x18/${c.toLowerCase()}.png" alt="${c}" onerror="this.replaceWith(Object.assign(document.createElement('b'),{textContent:'${c}',className:'cflag-txt'}))"><span>${c}</span></span>`).join('')}${paises.length>8?`<span style="font-size:11px;color:var(--t3);align-self:center">+${paises.length-8}</span>`:''}</div>`
      : '';
    /* logo pequeño de CXOrbia como "desarrollado por" (siempre visible en el pie del login) */
    const cxLogo = `<svg width="16" height="16" viewBox="0 0 64 64" style="vertical-align:middle"><rect width="64" height="64" rx="14" fill="#0d2740"/><circle cx="32" cy="32" r="15" fill="none" stroke="#4ab4e6" stroke-width="6" stroke-dasharray="58 26"/><circle cx="44" cy="22" r="4.5" fill="#fff"/></svg>`;
    const devForFooter = `<div class="login-poweredby">${cxLogo} <span>Desarrollado por <b>CXOrbia</b></span></div>`;
    lg.innerHTML=`
      <div class="login-card">
        <div class="login-brand">
          ${brandBlock}
        </div>
        <div class="login-divider"></div>
        <div class="login-title">${functionalTitle}</div>
        <div class="login-sub">Selecciona un perfil para entrar al ${b.demoMode?'demo':'sistema'}</div>
        ${flagsRow}
        ${showAdminBtn?`<button class="role-btn role-admin" data-role="admin">
          <div class="r-ic">🖥️</div>
          <div><div class="r-t">Administración / Coordinación</div>
          <div class="r-d">Operación, proyectos, finanzas y configuración</div></div>
        </button>`:''}
        ${showClienteBtn?`<button class="role-btn role-cliente" data-role="cliente">
          <div class="r-ic">📈</div>
          <div><div class="r-t">Portal del Cliente (marca evaluada)</div>
          <div class="r-d">Resultados, score por sucursal, acciones y reportes</div></div>
        </button>`:''}
        ${showShopperBtn?`<button class="role-btn role-shopper" data-role="shopper">
          <div class="r-ic">📱</div>
          <div><div class="r-t">Shopper / Evaluador</div>
          <div class="r-d">Portal móvil: visitas, certificación y pagos</div></div>
        </button>`:''}
        ${showShopperReg?`<div style="text-align:center;margin-top:6px"><a id="goReg" style="font-size:12.5px;color:var(--brand);font-weight:600;cursor:pointer">¿Eres evaluador nuevo? Regístrate aquí →</a></div>`:''}
        ${altRolesBlock}
        ${(()=>{let us=[];try{us=JSON.parse(localStorage.getItem('cx_users')||'[]');}catch(e){}
          if(!us.length) return '';
          return `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
            <div style="font-size:11px;color:var(--t3);text-align:center;margin-bottom:6px">O entra como un usuario invitado (Configuración → Usuarios)</div>
            <div class="flex" style="gap:6px;justify-content:center">
              <select class="sel" id="loginUserSel" style="width:auto;max-width:220px;font-size:12px">${us.map((u,i)=>`<option value="${i}">${u.name} · ${(CX.PERSONAS.find(p=>p.id===u.persona)||{}).label||u.rol}</option>`).join('')}</select>
              <button class="btn btn-soft btn-sm" id="loginAsUser">Entrar</button>
            </div>
          </div>`;})()}
        ${(b.clientName&&hasClientLogo)?`<div class="login-devfor">Plataforma operativa para <b>${b.clientName}</b></div>`:''}
        ${devForFooter}
        ${(()=>{const std=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;const iOS=/iPad|iPhone|iPod/.test(navigator.userAgent);if(std)return '<div style="text-align:center;margin-top:14px;font-size:11px;color:var(--green)">✓ App instalada</div>';return `<div style="text-align:center;margin-top:14px"><button class="btn btn-ghost btn-sm" id="pwaBtn">📲 ${iOS?'Instalar (guía iOS)':'Instalar como app'}</button></div>`;})()}
        ${b.demoMode?`<div style="text-align:center;margin-top:10px;font-size:11px;color:var(--t3)">
          <span class="bdg bdg-a">● Demo comercial · datos ficticios</span></div>`:''}
      </div>`;
    lg.querySelectorAll('.role-btn').forEach(b=>b.addEventListener('click',()=>this.selectRole(b.dataset.role)));
    lg.querySelector('#loginAsUser')?.addEventListener('click',()=>{
      let us=[];try{us=JSON.parse(localStorage.getItem('cx_users')||'[]');}catch(e){}
      const i=+(lg.querySelector('#loginUserSel').value||0); const u=us[i]; if(!u)return;
      /* rol técnico real del usuario invitado + su scope persistido (paises) — no un rol de prueba genérico */
      this.selectRole(u.rol, null, (u.paises&&u.paises.length)?u.paises:undefined, u);
    });
    lg.querySelectorAll('.role-alt').forEach(b=>b.addEventListener('click',()=>{
      const role=b.dataset.role;
      if(role==='coordinador'||role==='aliado') return this.pickScopeAndEnter(role);
      this.selectRole(role);
    }));
    const gr=lg.querySelector('#goReg'); if(gr)gr.addEventListener('click',()=>this.showRegister());
    const pw=lg.querySelector('#pwaBtn'); if(pw)pw.addEventListener('click',()=>CX.pwa.openInstall(CX.ui));
  },

  showRegister(){
    const ids={pais:'rgPais',depto:'rgDepto',ciudad:'rgCiudad'};
    CX.ui.modal('Registro de evaluador', `
      <p style="font-size:13px;color:var(--t2);margin-bottom:14px">Crea tu cuenta. El equipo revisará tu perfil y te habilitará las visitas de tu país. Los campos marcados con <b style="color:var(--accent)">*</b> son obligatorios.</p>
      <div class="grid g2" style="gap:12px 14px">
        <div><label class="lbl">Primer nombre <b style="color:var(--accent)">*</b></label><input class="inp" id="rgFirst" placeholder="Ej. María"></div>
        <div><label class="lbl">Primer apellido <b style="color:var(--accent)">*</b></label><input class="inp" id="rgLast" placeholder="Ej. López"></div>
        ${CX.geo.fieldsHTML(ids)}
        <div><label class="lbl">WhatsApp <b style="color:var(--accent)">*</b></label><input class="inp" id="rgWa" placeholder="+502 5555 5555"></div>
        <div><label class="lbl">Correo</label><input class="inp" id="rgMail" placeholder="correo@ejemplo.com"></div>
        <div><label class="lbl">Edad</label><input class="inp" id="rgEdad" type="number" min="16" max="99" placeholder="Ej. 28"></div>
        <div><label class="lbl">Sexo</label><select class="sel" id="rgSexo"><option value="">Selecciona…</option><option>Femenino</option><option>Masculino</option><option>Otro</option><option>Prefiero no decir</option></select></div>
      </div>
      <div id="rgCreds" style="background:var(--brand-light);border-radius:10px;padding:10px 13px;font-size:12px;color:var(--brand-dark);margin:14px 0">
        Tu usuario y contraseña se generan automáticamente según el patrón del cliente
        (<b>${CX.CREDS.userExample()}</b> · <b>${CX.CREDS.passExample()}</b>). Edad y sexo se usan para automatizar la asignación de visitas.</div>
      <div style="text-align:right"><button class="btn btn-green" id="rgSave">Crear mi cuenta</button></div>
    `, {onMount:(ov,close)=>{
      CX.geo.wire(ov, ids);
      // previsualizar credenciales al escribir nombre/apellido
      const upd=()=>{
        const f=ov.querySelector('#rgFirst').value, l=ov.querySelector('#rgLast').value;
        if(f&&l) ov.querySelector('#rgCreds').innerHTML=`Tu cuenta será — usuario: <b>${CX.CREDS.user(f,l)}</b> · contraseña: <b>${CX.CREDS.pass(f,l)}</b>. Edad y sexo se usan para automatizar la asignación de visitas.`;
      };
      ov.querySelector('#rgFirst').addEventListener('input',upd);
      ov.querySelector('#rgLast').addEventListener('input',upd);
      ov.querySelector('#rgSave').addEventListener('click',()=>{
        const first=(ov.querySelector('#rgFirst').value||'').trim();
        const last =(ov.querySelector('#rgLast').value||'').trim();
        const wa   =(ov.querySelector('#rgWa').value||'').trim();
        if(!first||!last||!wa){ CX.ui.toast('Completa nombre, apellido y WhatsApp','err'); return; }
        const geo=CX.geo.read(ov, ids);
        const s=CX.data.addShopper({
          via:'registro', estado:'Pendiente',
          firstName:first, lastName:last, whatsapp:wa,
          pais:geo.pais, depto:geo.depto, ciudad:geo.ciudad,
          email:(ov.querySelector('#rgMail').value||'').trim(),
          edad:(ov.querySelector('#rgEdad').value||'').trim(),
          sexo:ov.querySelector('#rgSexo').value||'',
        });
        close();
        this.afterRegister(s);
      });
    }});
  },

  /* confirmación de registro + acceso directo al portal del nuevo shopper */
  afterRegister(s){
    CX.ui.modal('¡Cuenta creada!', `
      <div style="text-align:center;padding:6px 0 4px">
        <div style="font-size:40px;line-height:1">✅</div>
        <div class="card-t" style="font-size:17px;margin-top:8px">Bienvenido, ${s.firstName}</div>
        <div style="font-size:12.5px;color:var(--t3);margin-top:2px">Tu perfil queda en revisión del equipo.</div>
      </div>
      <div style="background:var(--brand-light);border-radius:12px;padding:14px 16px;margin:14px 0">
        <div class="between" style="margin-bottom:8px"><span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">Usuario</span><b style="font-family:var(--disp)">${s.user}</b></div>
        <div class="between"><span style="font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:.5px">Contraseña</span><b style="font-family:var(--disp)">${s.pass}</b></div>
      </div>
      <p style="font-size:12.5px;color:var(--t2);line-height:1.6">Al ingresar podrás <b>completar tu perfil</b> (documento, ciudad, cuenta de pago) y empezar a postularte a visitas de tu país.</p>
      <div class="flex" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" data-x2>Cerrar</button><button class="btn btn-pr" id="rgEnter">Entrar a mi portal →</button></div>
    `, {onMount:(ov,close)=>{
      ov.querySelector('[data-x2]').addEventListener('click',close);
      ov.querySelector('#rgEnter').addEventListener('click',()=>{ close(); this.selectRole('shopper', s.id); });
    }});
  },

  /* Fase 5: coordinador/aliado son scopeCountry — piden el/los país(es) asignado(s)
     antes de entrar, para probar de verdad el filtrado por alcance (no solo la matriz de módulos). */
  pickScopeAndEnter(role){
    const set=new Set(); (CX.data&&CX.data.projects||[]).forEach(p=>(p.countries||[]).forEach(c=>set.add(c)));
    const paises=[...set];
    const lbl=role==='coordinador'?'Coordinador / Representante':'Aliado / Franquiciado';
    CX.ui.modal('🌎 País(es) asignado(s) · '+lbl, `
      <p style="font-size:12.5px;color:var(--t2);margin-bottom:12px">Este rol solo ve proyectos, shoppers y visitas de su(s) país(es) asignado(s) (alcance real, no solo menú).</p>
      <div class="flex wrap" style="gap:8px;margin-bottom:14px">${paises.map(c=>`<label class="flex" style="gap:6px;font-size:12.5px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;cursor:pointer"><input type="checkbox" class="scPais" value="${c}"> ${CX.paisFlag(c)} ${CX.paisName(c)}</label>`).join('')}</div>
      <div style="text-align:right"><button class="btn btn-pr btn-sm" id="scGo">Entrar con este alcance</button></div>
    `,{onMount:(ov,close)=>{
      ov.querySelector('#scGo').addEventListener('click',()=>{
        const sel=[...ov.querySelectorAll('.scPais:checked')].map(c=>c.value);
        if(!sel.length){ CX.ui.toast('Elige al menos un país','warn'); return; }
        close(); this.selectRole(role, null, sel);
      });
    }});
  },

  selectRole(role, shopperId, scopePaises, invitedUser){
    CX.session.role=role;
    CX.session.testRole=null;
    if(invitedUser){
      /* usuario real invitado desde Configuración → Usuarios: entra con su identidad, rol técnico y scope persistidos.
         cliente/shopper tienen shell propio; cualquier otro rol técnico (super/admin/ops/coordinador/aliado/
         personalizado) navega sobre el shell admin, con el rol real guardado en testRole para permisos. */
      const usesAdminShell = role!=='cliente' && role!=='shopper';
      CX.session.role = usesAdminShell ? 'admin' : role;
      CX.session.testRole = (usesAdminShell && role!=='super' && role!=='admin') ? role : null;
      CX.session.user={ name:invitedUser.name, role, org:'Tu Consultora', persona:invitedUser.persona||'',
        scopeRole: CX.session.testRole||undefined, scopePaises:(scopePaises&&scopePaises.length)?scopePaises:undefined,
        scopeProjectId: invitedUser.proyectoId||undefined, scopeCliente: invitedUser.cliente||undefined,
        clienteRole: role==='cliente'?'director':undefined,
        email:invitedUser.email };
      CX.session.view=null;
      CX.session.save();
      return this.enter();
    }
    if(role==='admin'){
      CX.session.user={name:'Admin Demo', role:'super', org:'Tu Consultora'};
    } else if(role==='cliente'){
      CX.session.user={name:'Cliente Demo', role:'cliente', clienteRole:'director', org:'Marca Cliente'};
    } else if(role==='shopper'){
      /* P0 (V172): 'sh1' es semilla SOLO de modo demo, bajo guard explícito. En live/real,
         una sesión Shopper sin shopperId provisto NO recibe identidad ficticia: los módulos
         privados (Mis Visitas, Reservas, Mi Día) quedan fail-closed. La selección visual de
         rol no es autenticación ni autorización. */
      const demoMode=!!((CX.BRAND&&CX.BRAND.demoMode) || (CX.dataSource&&CX.dataSource.mode==='demo'));
      const sid=shopperId||(demoMode?'sh1':null);
      const s=(sid&&CX.data.getShopper)?CX.data.getShopper(sid):null;
      if(sid){ CX.session.user={name:(s&&s.nombre)||'Evaluador 01', role:'shopper', shopperId:sid, code:(s&&s.code)||'EVL-01'}; }
      else { CX.session.user={name:'Evaluador (sin identidad)', role:'shopper', shopperId:null}; }
    } else {
      /* roles no estándar (ops, coordinador, aliado, personalizados) — para probar la matriz de permisos.
         Navegan como el rol elegido; el router aplica roleCanAccess. Usan la vista de admin (roles:['admin']). */
      const lbl={ops:'Equipo Operativo',coordinador:'Coordinador / Representante',aliado:'Aliado / Franquiciado'}[role]||role;
      CX.session.role='admin'; /* la vista admin es la base; el scope real se aplica por matriz */
      CX.session.testRole=role; /* rol bajo prueba */
      CX.session.user={name:lbl, role:role, org:'Tu Consultora', scopeRole:role, scopePaises:(scopePaises&&scopePaises.length)?scopePaises:undefined};
    }
    CX.session.view=null;
    CX.session.save();
    this.enter();
  },

  enter(){
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.add('on');
    const go=()=>{
      /* P0.3 (V98): si el modo de datos activo no es 'demo' y no hay fuente/adapter real disponible,
         el shell se bloquea con un estado honesto en vez de dejar pasar silenciosamente a los seeds
         de demo. Solo perfiles con permiso ven el detalle técnico (diagnostics.viewSensitive). */
      if(CX.dataSource && CX.dataSource.isBlocked() && CX.dataSource.mode!=='demo'){ return CX.app.renderDataSourceBlock(); }
      CX.router.mount();try{CX.app.showBanners&&CX.app.showBanners();}catch(e){}};
    if(CX.confidencialidad && CX.confidencialidad.pending(CX.session.role)){
      CX.confidencialidad.show(CX.session.role, go);
    } else { go(); }
  },

  /* Pantalla de bloqueo honesta para source_safe_preview/connected sin fuente/adapter real —
     nunca se sustituye en silencio por los datos de demo. */
  renderDataSourceBlock(){
    const ds=CX.dataSource; const canSeeDetail = CX.session.canSeeProtectedData ? CX.session.canSeeProtectedData() : (CX.session.role==='super');
    const root=document.getElementById('app');
    root.innerHTML=`<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1b2e;padding:24px">
      <div style="max-width:520px;background:#fff;border-radius:16px;padding:32px 28px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)">
        <div style="font-size:40px;margin-bottom:10px">⛔</div>
        <div style="font-size:18px;font-weight:800;color:#1a2740;margin-bottom:6px">Fuente de datos no disponible</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:16px">Modo activo: <b>${ds.label()}</b> · ${ds.statusLabel()}</div>
        ${canSeeDetail?`<div style="text-align:left;background:#f8fafc;border-radius:10px;padding:12px 14px;font-size:12px;color:#475569;margin-bottom:18px">${ds.blockers.map(b=>'• '+b).join('<br>')}</div>`:`<div style="font-size:12.5px;color:#94a3b8;margin-bottom:18px">Contacta a un administrador para más detalle.</div>`}
        <button class="btn btn-pr btn-sm" id="dsBackDemo" style="margin-right:8px">Volver a modo Demo</button>
        <button class="btn btn-ghost btn-sm" id="dsLogout">Cerrar sesión</button>
      </div>
    </div>`;
    document.getElementById('dsBackDemo').addEventListener('click',()=>{ CX.dataSource.setMode('demo'); location.reload(); });
    document.getElementById('dsLogout').addEventListener('click',()=>this.logout());
  },

  logout(){
    CX.session.clear();
    this.showLogin();
    CX.ui.toast('Sesión cerrada','');
  },

  showBanners(){
    let b=[]; try{b=JSON.parse(localStorage.getItem('cx_banners')||'[]');}catch(e){}
    const rol=CX.session.role;
    const mine=b.filter(x=>!x.roles||x.roles.includes(rol));
    if(!mine.length)return;
    const bn=mine[0];
    const ov=document.createElement('div');ov.className='cx-ov';
    ov.innerHTML=`<div class="cx-modal" style="width:min(520px,94vw)"><div style="background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff;border-radius:14px 14px 0 0;padding:20px 24px">
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;opacity:.85">📢 RECORDATORIO</div>
      <div style="font-size:19px;font-weight:800;margin-top:4px">${bn.titulo}</div></div>
      <div style="padding:20px 24px"><div style="font-size:14px;color:var(--t2);line-height:1.6">${bn.cuerpo||''}</div>
      <div style="text-align:right;margin-top:18px"><button class="btn btn-pr btn-sm" id="bnOk">Entendido</button></div></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('#bnOk').addEventListener('click',()=>{
      try{const all=JSON.parse(localStorage.getItem('cx_banners')||'[]').filter(x=>x.id!==bn.id);localStorage.setItem('cx_banners',JSON.stringify(all));}catch(e){}
      ov.remove();
    });
  },
};
function __cxBoot(){ CX.pwa && CX.pwa.init(); CX.app.init(); }

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',__cxBoot);
else __cxBoot();
    /* colapsar sidebar */
    function __cxCollapse(){
      const btn=document.getElementById('railCollapse'); if(!btn)return;
      const rail=document.querySelector('.rail');
      if(!btn._wired){btn._wired=true;
        btn.addEventListener('click',()=>{ rail.classList.toggle('collapsed'); try{localStorage.setItem('cx_rail_collapsed',rail.classList.contains('collapsed')?'1':'0');}catch(e){} });
        if(localStorage.getItem('cx_rail_collapsed')==='1')rail.classList.add('collapsed');
      }
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',__cxCollapse);
    else __cxCollapse();
    setTimeout(__cxCollapse,200);
