/* ============================================================
   CXOrbia · Firebase browser Auth gate (DEV protegido)
   ------------------------------------------------------------
   - Solo se carga desde index-backend-dev.html.
   - Usa Firebase Auth Email/Password con persistencia de SESION.
   - Nunca guarda password, token, email ni UID en localStorage.
   - La sesion CX se deriva de custom claims; el selector local de rol
     no concede acceso al backend protegido.
   - Cero Auth/Firestore/Rules writes.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND || {};
  const LEGACY_ROLES = new Set(['super','admin','ops','coordinador','cliente','client','shopper']);
  let auth = null;
  let readyPromise = null;
  let currentContext = null;
  let overlay = null;
  let resolveInteractive = null;
  let rejectInteractive = null;

  function list(value){
    if(Array.isArray(value)) return value.map(String).map(function(x){return x.trim();}).filter(Boolean);
    if(typeof value === 'string') return value.split(',').map(function(x){return x.trim();}).filter(Boolean);
    return [];
  }

  function ensureFirebase(){
    if(!window.firebase || !firebase.apps || !firebase.auth) throw new Error('Firebase Auth SDK no disponible');
    if(!cfg.firebaseConfig) throw new Error('Falta configuracion Firebase del backend DEV');
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg.firebaseConfig);
    auth = typeof app.auth === 'function' ? app.auth() : firebase.auth();
    return auth;
  }

  function firstAuthState(){
    return new Promise(function(resolve, reject){
      let done = false;
      let unsub = function(){};
      unsub = auth.onAuthStateChanged(function(user){
        if(done) return;
        done = true;
        try{unsub();}catch(_){ }
        resolve(user || null);
      }, function(err){
        if(done) return;
        done = true;
        try{unsub();}catch(_){ }
        reject(err);
      });
    });
  }

  // Debe reflejar firestore.rules vigente: tenantId o tenants[]; tenantIds[] NO autoriza por sí solo.
  function tenantAllowed(claims, role){
    const tenant = cfg.tenantId || 'tya';
    return role === 'super' || claims.tenantId === tenant || list(claims.tenants).includes(tenant);
  }

  // Debe reflejar firestore.rules vigente: projectAssigned() confía exclusivamente en projectIds[].
  function projectsOf(claims){
    return Array.from(new Set(list(claims.projectIds)));
  }

  async function contextFromUser(user){
    if(!user) throw new Error('AUTH_REQUIRED');
    const token = await user.getIdTokenResult(true);
    const claims = token && token.claims ? token.claims : {};
    const role = typeof claims.role === 'string' ? claims.role : '';
    if(!LEGACY_ROLES.has(role)) throw new Error('ROLE_NOT_ALLOWED');
    if(!tenantAllowed(claims, role)) throw new Error('TENANT_NOT_ALLOWED');

    const projectIds = projectsOf(claims);
    if((role === 'cliente' || role === 'client' || role === 'shopper') && !projectIds.length) throw new Error('PROJECT_SCOPE_REQUIRED');
    const shopperId = typeof claims.shopperId === 'string' ? claims.shopperId.trim() : '';
    if(role === 'shopper' && !shopperId) throw new Error('SHOPPER_SCOPE_REQUIRED');

    return {
      role: role,
      tenantId: cfg.tenantId || 'tya',
      projectIds: projectIds,
      shopperId: shopperId || null,
      country: typeof claims.country === 'string' ? claims.country : null,
      authenticated: true,
      provider: 'firebase',
      source: 'custom-claims-current-rules',
    };
  }

  function roleLabel(role){
    return ({super:'Superadministracion',admin:'Administracion',ops:'Operacion',coordinador:'Coordinacion',cliente:'Cliente',client:'Cliente',shopper:'Evaluador'})[role] || 'Usuario';
  }

  function applyCxSession(ctx){
    if(!CX.session) return;
    const actualRole = ctx.role;
    const isClient = actualRole === 'cliente' || actualRole === 'client';
    const isShopper = actualRole === 'shopper';
    const usesAdminShell = !isClient && !isShopper;
    CX.session.clear();
    CX.session.role = usesAdminShell ? 'admin' : (isClient ? 'cliente' : 'shopper');
    CX.session.testRole = usesAdminShell && actualRole !== 'super' && actualRole !== 'admin' ? actualRole : null;
    CX.session.user = {
      name: roleLabel(actualRole),
      role: actualRole,
      tenantId: ctx.tenantId,
      shopperId: ctx.shopperId || undefined,
      scopeRole: CX.session.testRole || undefined,
      scopeProjectId: ctx.projectIds.length === 1 ? ctx.projectIds[0] : undefined,
      projectIds: ctx.projectIds.slice(),
      scopePaises: ctx.country ? [ctx.country] : undefined,
      clienteRole: isClient ? 'director' : undefined,
    };
    CX.session.view = null;
    CX.session.save();
  }

  function ensureOverlay(){
    if(overlay && document.body.contains(overlay)) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'cxBackendAuthGate';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:#0d1b2e;font-family:Inter,Arial,sans-serif';
    overlay.innerHTML = '<form id="cxBackendAuthForm" style="width:min(420px,96vw);background:#fff;border-radius:16px;padding:28px;box-shadow:0 22px 70px rgba(0,0,0,.38)">'+
      '<div style="font:800 20px Manrope,Inter,sans-serif;color:#15243a;margin-bottom:5px">Acceso seguro</div>'+
      '<div style="font-size:12.5px;color:#64748b;line-height:1.5;margin-bottom:18px">Ingresa con tu cuenta autorizada de CXOrbia. El perfil y el alcance se validan con Firebase Auth.</div>'+
      '<label for="cxBackendAuthEmail" style="display:block;font-size:12px;font-weight:700;color:#475569;margin:0 0 5px">Correo</label>'+
      '<input id="cxBackendAuthEmail" type="email" autocomplete="username" required style="box-sizing:border-box;width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:9px;margin-bottom:12px;font:14px Inter,Arial,sans-serif">'+
      '<label for="cxBackendAuthPassword" style="display:block;font-size:12px;font-weight:700;color:#475569;margin:0 0 5px">Contraseña</label>'+
      '<input id="cxBackendAuthPassword" type="password" autocomplete="current-password" required style="box-sizing:border-box;width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:9px;margin-bottom:14px;font:14px Inter,Arial,sans-serif">'+
      '<div id="cxBackendAuthError" aria-live="polite" style="display:none;font-size:12px;color:#b42318;background:#fef3f2;border-radius:8px;padding:9px 10px;margin-bottom:12px"></div>'+
      '<button id="cxBackendAuthSubmit" type="submit" style="width:100%;border:0;border-radius:9px;padding:11px 14px;background:#176a96;color:#fff;font:700 13px Inter,Arial,sans-serif;cursor:pointer">Ingresar</button>'+
      '<div style="font-size:10.5px;color:#94a3b8;text-align:center;margin-top:12px">DEV protegido · lectura únicamente</div>'+
      '</form>';
    document.body.appendChild(overlay);
    const form = overlay.querySelector('#cxBackendAuthForm');
    form.addEventListener('submit', async function(ev){
      ev.preventDefault();
      const emailEl = overlay.querySelector('#cxBackendAuthEmail');
      const passEl = overlay.querySelector('#cxBackendAuthPassword');
      const btn = overlay.querySelector('#cxBackendAuthSubmit');
      const err = overlay.querySelector('#cxBackendAuthError');
      err.style.display = 'none';
      err.textContent = '';
      btn.disabled = true;
      const email = String(emailEl.value || '').trim();
      const password = String(passEl.value || '');
      passEl.value = '';
      try{
        await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        const cred = await auth.signInWithEmailAndPassword(email, password);
        emailEl.value = '';
        const ctx = await contextFromUser(cred.user);
        currentContext = ctx;
        applyCxSession(ctx);
        if(resolveInteractive){ resolveInteractive(ctx); resolveInteractive = null; rejectInteractive = null; }
      }catch(e){
        try{await auth.signOut();}catch(_){ }
        err.textContent = 'No fue posible validar esta cuenta o su alcance. Verifica tus credenciales o solicita revision de permisos.';
        err.style.display = 'block';
        btn.disabled = false;
      }
    });
    return overlay;
  }

  function interactiveLogin(){
    ensureOverlay();
    return new Promise(function(resolve, reject){ resolveInteractive = resolve; rejectInteractive = reject; });
  }

  async function ensureAuthenticated(){
    if(currentContext) return currentContext;
    if(readyPromise) return readyPromise;
    readyPromise = (async function(){
      ensureFirebase();
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      const restored = await firstAuthState();
      if(restored){
        try{
          currentContext = await contextFromUser(restored);
          applyCxSession(currentContext);
          return currentContext;
        }catch(_){
          try{await auth.signOut();}catch(__){ }
        }
      }
      return interactiveLogin();
    })();
    return readyPromise;
  }

  function removeOverlay(){
    if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  function enterAfterBackendReady(){
    if(!currentContext || !CX.app || typeof CX.app.enter !== 'function') return;
    applyCxSession(currentContext);
    removeOverlay();
    CX.app.enter();
  }

  function wrapAppLoginAndLogout(){
    if(!CX.app || CX.app.__firebaseBrowserAuthWrapped) return;
    const originalShowLogin = typeof CX.app.showLogin === 'function' ? CX.app.showLogin.bind(CX.app) : null;
    const originalLogout = typeof CX.app.logout === 'function' ? CX.app.logout.bind(CX.app) : null;
    CX.app.showLogin = function(){
      if(cfg.enabled === true && cfg.previewMode === true){
        if(CX.session) CX.session.clear();
        ensureOverlay();
        return;
      }
      if(originalShowLogin) return originalShowLogin();
    };
    CX.app.logout = async function(){
      if(cfg.enabled === true && cfg.previewMode === true){
        try{ ensureFirebase(); await auth.signOut(); }catch(_){ }
        currentContext = null;
        readyPromise = null;
        if(CX.session) CX.session.clear();
        location.reload();
        return;
      }
      if(originalLogout) return originalLogout();
    };
    CX.app.__firebaseBrowserAuthWrapped = true;
  }

  CX.backendAuth = {
    ensureAuthenticated: ensureAuthenticated,
    context: function(){ return currentContext; },
    signOut: async function(){ ensureFirebase(); await auth.signOut(); currentContext = null; readyPromise = null; if(CX.session) CX.session.clear(); },
    show: function(){ ensureFirebase(); return ensureOverlay(); },
    isReady: function(){ return !!currentContext; },
  };

  if(CX.bus && typeof CX.bus.on === 'function'){
    CX.bus.on('backend-ready', enterAfterBackendReady);
    CX.bus.on('backend-error', function(){ if(cfg.enabled === true && cfg.previewMode === true) ensureOverlay(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){
    if(CX.session) CX.session.clear();
    wrapAppLoginAndLogout();
    if(cfg.enabled === true && cfg.previewMode === true) ensureOverlay();
  });
  else {
    if(CX.session) CX.session.clear();
    wrapAppLoginAndLogout();
    if(cfg.enabled === true && cfg.previewMode === true) ensureOverlay();
  }
})();
