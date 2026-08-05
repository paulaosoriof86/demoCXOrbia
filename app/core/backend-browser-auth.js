/* ============================================================
   CXOrbia · Firebase browser Auth bridge (backend protegido)
   ------------------------------------------------------------
   Corte 6 P0 single-login:
   - Firebase Auth sigue siendo la autoridad real.
   - NO crea un gate/pantalla de autenticación separada.
   - El login normal del tenant/proyecto sigue siendo el unico punto visible.
   - Una sesión Firebase válida se restaura silenciosamente.
   - Si hace falta autenticar, Usuario + Contraseña se solicitan dentro
     del mismo flujo visible del login del producto.
   - Usuario + namespace se traducen a un identificador Firebase interno.
   - Nunca guarda password/token/UID en localStorage.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND || {};
  const LEGACY_ROLES = new Set(['super','admin','ops','coordinador','cliente','client','shopper']);
  const LOGIN_NAMESPACES = new Set(['staff','shopper']);
  const STAFF_ROLES = new Set(['super','admin','ops','coordinador']);
  let auth = null;
  let readyPromise = null;
  let currentContext = null;
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

  function normalizeLogin(value){
    return String(value || '').trim().toLowerCase();
  }

  async function sha256Hex(value){
    if(!window.crypto || !crypto.subtle) throw new Error('WEB_CRYPTO_REQUIRED');
    const bytes = new TextEncoder().encode(String(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');
  }

  function normalizeNamespace(value){
    const ns = String(value || '').trim().toLowerCase();
    if(!LOGIN_NAMESPACES.has(ns)) throw new Error('LOGIN_NAMESPACE_REQUIRED');
    return ns;
  }

  async function internalFirebaseEmail(login, namespace){
    const normalized = normalizeLogin(login);
    if(!normalized) throw new Error('LOGIN_REQUIRED');
    if(cfg.devPreviewAuth && cfg.devPreviewAuth.allowTechnicalEmail === true && /@cxorbia-dev\.example\.com$/i.test(normalized)) return normalized;
    const tenant = cfg.tenantId || 'tya';
    const ns = normalizeNamespace(namespace);
    const digest = await sha256Hex(tenant + '\0' + ns + '\0' + normalized);
    return digest.slice(0,48) + '@auth.cxorbia.invalid';
  }

  function tenantAllowed(claims, role){
    const tenant = cfg.tenantId || 'tya';
    return role === 'super' || claims.tenantId === tenant || list(claims.tenants).includes(tenant);
  }

  function projectsOf(claims){
    return Array.from(new Set(list(claims.projectIds)));
  }

  function expectedNamespaceForRole(role){
    return role === 'shopper' ? 'shopper' : 'staff';
  }

  async function contextFromUser(user, requestedNamespace){
    if(!user) throw new Error('AUTH_REQUIRED');
    const token = await user.getIdTokenResult(true);
    const claims = token && token.claims ? token.claims : {};
    const role = typeof claims.role === 'string' ? claims.role : '';
    if(!LEGACY_ROLES.has(role)) throw new Error('ROLE_NOT_ALLOWED');
    if(!tenantAllowed(claims, role)) throw new Error('TENANT_NOT_ALLOWED');

    const claimNamespace = typeof claims.authNamespace === 'string' ? claims.authNamespace.trim().toLowerCase() : '';
    const expectedNamespace = expectedNamespaceForRole(role);
    if(requestedNamespace){
      const requested = normalizeNamespace(requestedNamespace);
      if(claimNamespace && claimNamespace !== requested) throw new Error('LOGIN_NAMESPACE_MISMATCH');
      if(expectedNamespace !== requested) throw new Error('ROLE_NAMESPACE_MISMATCH');
    }

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
      authNamespace: claimNamespace || expectedNamespace,
      authenticated: true,
      provider: 'firebase',
      source: 'custom-claims-current-rules',
    };
  }

  function roleLabel(role){
    return ({super:'Superadministración',admin:'Administración',ops:'Operación',coordinador:'Coordinación',cliente:'Cliente',client:'Cliente',shopper:'Evaluador'})[role] || 'Usuario';
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

  function namespaceForSelectedRole(role){
    const r = String(role || '').trim().toLowerCase();
    if(r === 'shopper') return 'shopper';
    if(STAFF_ROLES.has(r)) return 'staff';
    return '';
  }

  function selectedRoleLabel(role){
    const r = String(role || '').trim().toLowerCase();
    if(r === 'shopper') return 'Shopper / Evaluador';
    if(STAFF_ROLES.has(r)) return 'Administración / Coordinación';
    return roleLabel(r);
  }

  function authErrorMessage(err){
    const code = String(err && (err.code || err.message) || '');
    if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code) || /LOGIN_REQUIRED/i.test(code)){
      return 'Usuario o contraseña no válidos.';
    }
    if(/LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH/i.test(code)){
      return 'La cuenta es válida, pero no corresponde al tipo de acceso seleccionado.';
    }
    if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED/i.test(code)){
      return 'La cuenta es válida, pero no tiene el alcance necesario para este acceso. Solicita revisión al equipo TyA.';
    }
    return 'No fue posible validar el acceso. Verifica usuario y contraseña o solicita revisión al equipo TyA.';
  }

  function clearCredentialStep(){
    const step = document.getElementById('cxIntegratedAuthStep');
    if(step && step.parentNode) step.parentNode.removeChild(step);
  }

  function setCredentialError(message){
    const err = document.getElementById('cxIntegratedAuthError');
    if(!err) return;
    err.textContent = message || '';
    err.style.display = message ? 'block' : 'none';
  }

  async function signIn(login, password, namespace){
    ensureFirebase();
    const ns = normalizeNamespace(namespace);
    const providerEmail = await internalFirebaseEmail(login, ns);
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    try{
      const cred = await auth.signInWithEmailAndPassword(providerEmail, String(password || ''));
      const ctx = await contextFromUser(cred.user, ns);
      currentContext = ctx;
      applyCxSession(ctx);
      if(resolveInteractive){
        resolveInteractive(ctx);
        resolveInteractive = null;
        rejectInteractive = null;
      }
      return ctx;
    }catch(e){
      try{await auth.signOut();}catch(_){ }
      currentContext = null;
      throw e;
    }
  }

  function waitForInteractive(){
    return new Promise(function(resolve, reject){
      resolveInteractive = resolve;
      rejectInteractive = reject;
    });
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
          currentContext = null;
        }
      }
      return waitForInteractive();
    })();
    return readyPromise;
  }

  function showCredentialStep(selectedRole){
    const namespace = namespaceForSelectedRole(selectedRole);
    if(!namespace){
      if(CX.ui && CX.ui.toast) CX.ui.toast('Este perfil aún no tiene una identidad Firebase habilitada en Corte 6.','warn');
      return;
    }
    const loginRoot = document.getElementById('login');
    const card = loginRoot && loginRoot.querySelector('.lg2-card, .login-card');
    if(!card) return;
    clearCredentialStep();

    const step = document.createElement('div');
    step.id = 'cxIntegratedAuthStep';
    step.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    step.innerHTML =
      '<div style="font-size:12px;font-weight:800;color:var(--t1);margin-bottom:3px">'+selectedRoleLabel(selectedRole)+'</div>'+
      '<div style="font-size:11.5px;color:var(--t3);line-height:1.45;margin-bottom:10px">Ingresa con tu usuario y contraseña habituales de TyA.</div>'+
      '<label class="lbl" for="cxIntegratedAuthLogin">Usuario</label>'+
      '<input class="inp" id="cxIntegratedAuthLogin" type="text" autocomplete="username" style="width:100%;margin-bottom:9px">'+
      '<label class="lbl" for="cxIntegratedAuthPassword">Contraseña</label>'+
      '<input class="inp" id="cxIntegratedAuthPassword" type="password" autocomplete="current-password" style="width:100%;margin-bottom:9px">'+
      '<div id="cxIntegratedAuthError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div>'+
      '<div class="flex" style="justify-content:flex-end;gap:8px">'+
        '<button class="btn btn-ghost btn-sm" type="button" id="cxIntegratedAuthBack">Volver</button>'+
        '<button class="btn btn-pr btn-sm" type="button" id="cxIntegratedAuthSubmit">Ingresar</button>'+
      '</div>';
    card.appendChild(step);

    const loginEl = step.querySelector('#cxIntegratedAuthLogin');
    const passEl = step.querySelector('#cxIntegratedAuthPassword');
    const submit = step.querySelector('#cxIntegratedAuthSubmit');
    const back = step.querySelector('#cxIntegratedAuthBack');
    loginEl.focus();

    back.addEventListener('click', function(){ clearCredentialStep(); });
    async function submitAuth(){
      setCredentialError('');
      const login = String(loginEl.value || '').trim();
      const password = String(passEl.value || '');
      if(!login || !password){ setCredentialError('Completa usuario y contraseña.'); return; }
      submit.disabled = true;
      submit.textContent = 'Validando...';
      try{
        await signIn(login, password, namespace);
        passEl.value = '';
        loginEl.value = '';
        submit.textContent = 'Cargando...';
      }catch(e){
        passEl.value = '';
        setCredentialError(authErrorMessage(e));
        submit.disabled = false;
        submit.textContent = 'Ingresar';
        passEl.focus();
      }
    }
    submit.addEventListener('click', submitAuth);
    passEl.addEventListener('keydown', function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); submitAuth(); } });
  }

  function enterAfterBackendReady(){
    if(!currentContext || !CX.app || typeof CX.app.enter !== 'function') return;
    applyCxSession(currentContext);
    clearCredentialStep();
    CX.app.enter();
  }

  function wrapAppLoginAndLogout(){
    if(!CX.app || CX.app.__firebaseBrowserAuthWrapped) return;
    const originalShowLogin = typeof CX.app.showLogin === 'function' ? CX.app.showLogin.bind(CX.app) : null;
    const originalLogout = typeof CX.app.logout === 'function' ? CX.app.logout.bind(CX.app) : null;
    const originalSelectRole = typeof CX.app.selectRole === 'function' ? CX.app.selectRole.bind(CX.app) : null;
    const originalEnter = typeof CX.app.enter === 'function' ? CX.app.enter.bind(CX.app) : null;

    CX.app.showLogin = function(){
      clearCredentialStep();
      if(originalShowLogin) return originalShowLogin();
    };

    CX.app.selectRole = function(role){
      if(cfg.enabled === true && cfg.previewMode === true && cfg.devPreviewAuth && cfg.devPreviewAuth.enabled === true){
        if(currentContext){
          applyCxSession(currentContext);
          return originalEnter ? originalEnter() : undefined;
        }
        showCredentialStep(role);
        return;
      }
      if(originalSelectRole) return originalSelectRole.apply(null, arguments);
    };

    CX.app.enter = function(){
      if(cfg.enabled === true && cfg.previewMode === true && cfg.devPreviewAuth && cfg.devPreviewAuth.enabled === true){
        if(!currentContext){
          if(originalShowLogin) originalShowLogin();
          return;
        }
        applyCxSession(currentContext);
      }
      if(originalEnter) return originalEnter();
    };

    CX.app.logout = async function(){
      if(cfg.enabled === true && cfg.previewMode === true){
        try{ ensureFirebase(); await auth.signOut(); }catch(_){ }
        currentContext = null;
        readyPromise = null;
        resolveInteractive = null;
        rejectInteractive = null;
        clearCredentialStep();
        if(CX.session) CX.session.clear();
        if(originalShowLogin) originalShowLogin();
        if(CX.ui && CX.ui.toast) CX.ui.toast('Sesión cerrada','');
        return;
      }
      if(originalLogout) return originalLogout();
    };

    CX.app.__firebaseBrowserAuthWrapped = true;
  }

  CX.backendAuth = {
    ensureAuthenticated: ensureAuthenticated,
    authenticate: signIn,
    context: function(){ return currentContext; },
    signOut: async function(){
      ensureFirebase();
      await auth.signOut();
      currentContext = null;
      readyPromise = null;
      resolveInteractive = null;
      rejectInteractive = null;
      if(CX.session) CX.session.clear();
    },
    showForRole: showCredentialStep,
    isReady: function(){ return !!currentContext; },
  };

  if(CX.bus && typeof CX.bus.on === 'function'){
    CX.bus.on('backend-ready', enterAfterBackendReady);
    CX.bus.on('backend-error', function(payload){
      const step = document.getElementById('cxIntegratedAuthStep');
      if(step && payload && payload.message) setCredentialError('El acceso fue validado, pero no fue posible cargar el contexto autorizado. Solicita revisión al equipo TyA.');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapAppLoginAndLogout);
  else wrapAppLoginAndLogout();
})();
