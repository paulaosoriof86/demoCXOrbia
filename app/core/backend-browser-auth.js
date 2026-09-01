/* ============================================================
   CXOrbia · Firebase browser Auth bridge (backend protegido)
   ------------------------------------------------------------
   Corte 6 P0 single-login:
   - Firebase Auth sigue siendo la autoridad real.
   - NO crea un gate/pantalla de autenticación separada.
   - El login normal del tenant/proyecto sigue siendo el único punto visible.
   - Una sesión Firebase válida se restaura silenciosamente.
   - Usuario + Contraseña se capturan exclusivamente en #loginForm,
     usando #lgUser y #lgPass.
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
  let selectedRole = '';

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
      source: 'custom-claims-current-rules'
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
      clienteRole: isClient ? 'director' : undefined
    };
    CX.session.view = null;
    CX.session.save();
  }

  function namespaceForSelectedRole(role){
    const r = String(role || '').trim().toLowerCase();
    if(r === 'shopper') return 'shopper';
    if(STAFF_ROLES.has(r) || r === 'cliente' || r === 'client') return 'staff';
    return '';
  }

  function selectedRoleLabel(role){
    const r = String(role || '').trim().toLowerCase();
    if(r === 'shopper') return 'Shopper / Evaluador';
    if(r === 'cliente' || r === 'client') return 'Portal del Cliente';
    if(STAFF_ROLES.has(r)) return 'Administración / Coordinación';
    return roleLabel(r);
  }

  function roleMatchesSelection(ctx, role){
    const selected = String(role || '').trim().toLowerCase();
    const actual = String(ctx && ctx.role || '').trim().toLowerCase();
    if(selected === 'shopper') return actual === 'shopper';
    if(selected === 'cliente' || selected === 'client') return actual === 'cliente' || actual === 'client';
    if(selected === 'admin') return STAFF_ROLES.has(actual);
    return selected === actual;
  }

  function authErrorMessage(err){
    const code = String(err && (err.code || err.message) || '');
    if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code) || /LOGIN_REQUIRED/i.test(code)){
      return 'Usuario o contraseña no válidos.';
    }
    if(/LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH|ROLE_SELECTION_MISMATCH/i.test(code)){
      return 'La cuenta es válida, pero no corresponde al perfil seleccionado.';
    }
    if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED/i.test(code)){
      return 'La cuenta es válida, pero no tiene el alcance necesario para este acceso. Solicita revisión al equipo TyA.';
    }
    return 'No fue posible validar el acceso. Verifica usuario y contraseña o solicita revisión al equipo TyA.';
  }

  function removeLegacyCredentialOverlay(){
    const step = document.getElementById('cxIntegratedAuthStep');
    if(step && step.parentNode) step.parentNode.removeChild(step);
  }

  function visibleLoginForm(){
    const form = document.getElementById('loginForm');
    const login = document.getElementById('lgUser');
    const password = document.getElementById('lgPass');
    const submit = document.getElementById('lgSubmit');
    return form && login && password && submit ? {form, login, password, submit} : null;
  }

  function ensureCredentialError(){
    const visible = visibleLoginForm();
    if(!visible) return null;
    let err = document.getElementById('cxIntegratedAuthError');
    if(err) return err;
    err = document.createElement('div');
    err.id = 'cxIntegratedAuthError';
    err.setAttribute('aria-live','polite');
    err.style.cssText = 'display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin:-2px 0 9px';
    visible.submit.parentNode.insertBefore(err, visible.submit);
    return err;
  }

  function setCredentialError(message){
    const err = ensureCredentialError();
    if(!err) return;
    err.textContent = message || '';
    err.style.display = message ? 'block' : 'none';
  }

  function markSelectedRole(role){
    selectedRole = String(role || '').trim().toLowerCase();
    const form = document.getElementById('loginForm');
    if(form) form.dataset.selectedRole = selectedRole;
    document.querySelectorAll('#login .role-btn[data-role]').forEach(function(button){
      const active = String(button.dataset.role || '').toLowerCase() === selectedRole;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.dataset.selected = active ? 'true' : 'false';
    });
    setCredentialError('');
  }

  async function signIn(login, password, namespace, requestedRole){
    ensureFirebase();
    const ns = normalizeNamespace(namespace);
    const providerEmail = await internalFirebaseEmail(login, ns);
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    try{
      const cred = await auth.signInWithEmailAndPassword(providerEmail, String(password || ''));
      const ctx = await contextFromUser(cred.user, ns);
      if(requestedRole && !roleMatchesSelection(ctx, requestedRole)) throw new Error('ROLE_SELECTION_MISMATCH');
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

  async function submitVisibleLogin(){
    const visible = visibleLoginForm();
    if(!visible) return;
    removeLegacyCredentialOverlay();
    setCredentialError('');
    const role = selectedRole || String(visible.form.dataset.selectedRole || '').trim().toLowerCase();
    const namespace = namespaceForSelectedRole(role);
    if(!namespace){
      setCredentialError('Selecciona primero el perfil con el que vas a ingresar.');
      return;
    }
    const login = String(visible.login.value || '').trim();
    const password = String(visible.password.value || '');
    if(!login || !password){
      setCredentialError('Completa usuario y contraseña.');
      return;
    }
    visible.submit.disabled = true;
    visible.submit.textContent = 'Validando...';
    try{
      await signIn(login, password, namespace, role);
      visible.password.value = '';
      visible.login.value = '';
      visible.submit.textContent = 'Cargando...';
    }catch(e){
      visible.password.value = '';
      setCredentialError(authErrorMessage(e));
      visible.submit.disabled = false;
      visible.submit.textContent = 'Ingresar';
      visible.password.focus();
    }
  }

  function bindVisibleLoginForm(){
    removeLegacyCredentialOverlay();
    const visible = visibleLoginForm();
    if(!visible || visible.form.__cxSingleFormAuthBound) return visible;
    visible.form.__cxSingleFormAuthBound = true;
    ensureCredentialError();
    visible.form.addEventListener('submit', function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      submitVisibleLogin();
    }, true);
    return visible;
  }

  function showCredentialStep(role){
    removeLegacyCredentialOverlay();
    const namespace = namespaceForSelectedRole(role);
    if(!namespace){
      if(CX.ui && CX.ui.toast) CX.ui.toast('Este perfil aún no tiene una identidad Firebase habilitada en Corte 6.','warn');
      return;
    }
    const visible = bindVisibleLoginForm();
    if(!visible) return;
    markSelectedRole(role);
    if(currentContext){
      if(roleMatchesSelection(currentContext, role)){
        applyCxSession(currentContext);
        if(CX.app && typeof CX.app.enter === 'function') CX.app.enter();
      }else{
        setCredentialError('La sesión activa no corresponde al perfil seleccionado. Cierra sesión e ingresa con la cuenta correcta.');
      }
      return;
    }
    visible.login.focus();
  }

  function resetVisibleLoginState(){
    selectedRole = '';
    removeLegacyCredentialOverlay();
    const visible = bindVisibleLoginForm();
    if(visible){
      visible.form.dataset.selectedRole = '';
      visible.submit.disabled = false;
      visible.submit.textContent = 'Ingresar';
    }
    document.querySelectorAll('#login .role-btn[data-role]').forEach(function(button){
      button.setAttribute('aria-pressed','false');
      button.dataset.selected = 'false';
    });
    setCredentialError('');
  }

  function enterAfterBackendReady(){
    if(!currentContext || !CX.app || typeof CX.app.enter !== 'function') return;
    applyCxSession(currentContext);
    removeLegacyCredentialOverlay();
    CX.app.enter();
  }

  function protectedLoginEnabled(){
    return cfg.enabled === true && cfg.previewMode === true && cfg.devPreviewAuth && cfg.devPreviewAuth.enabled === true;
  }

  function wrapAppLoginAndLogout(){
    if(!CX.app || CX.app.__firebaseBrowserAuthWrapped) return;
    const originalShowLogin = typeof CX.app.showLogin === 'function' ? CX.app.showLogin.bind(CX.app) : null;
    const originalLogout = typeof CX.app.logout === 'function' ? CX.app.logout.bind(CX.app) : null;
    const originalSelectRole = typeof CX.app.selectRole === 'function' ? CX.app.selectRole.bind(CX.app) : null;
    const originalEnter = typeof CX.app.enter === 'function' ? CX.app.enter.bind(CX.app) : null;

    CX.app.showLogin = function(){
      removeLegacyCredentialOverlay();
      const result = originalShowLogin ? originalShowLogin() : undefined;
      resetVisibleLoginState();
      return result;
    };

    CX.app.selectRole = function(role){
      if(protectedLoginEnabled()){
        showCredentialStep(role);
        return;
      }
      if(originalSelectRole) return originalSelectRole.apply(null, arguments);
    };

    CX.app.enter = function(){
      if(protectedLoginEnabled()){
        if(!currentContext){
          if(originalShowLogin) originalShowLogin();
          resetVisibleLoginState();
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
        selectedRole = '';
        removeLegacyCredentialOverlay();
        if(CX.session) CX.session.clear();
        if(originalShowLogin) originalShowLogin();
        resetVisibleLoginState();
        if(CX.ui && CX.ui.toast) CX.ui.toast('Sesión cerrada','');
        return;
      }
      if(originalLogout) return originalLogout();
    };

    CX.app.__firebaseBrowserAuthWrapped = true;
    bindVisibleLoginForm();
  }

  function installFinalSingleFormRoleGuard(){
    if(!CX.app || CX.app.__c6SingleFormRoleGuard) return;
    const previous = typeof CX.app.selectRole === 'function' ? CX.app.selectRole.bind(CX.app) : null;
    CX.app.selectRole = function(role){
      if(protectedLoginEnabled()){
        removeLegacyCredentialOverlay();
        showCredentialStep(role);
        return;
      }
      if(previous) return previous.apply(CX.app, arguments);
    };
    CX.app.__c6SingleFormRoleGuard = true;
    removeLegacyCredentialOverlay();
    bindVisibleLoginForm();
  }

  function bootLoginBridge(){
    wrapAppLoginAndLogout();
    setTimeout(installFinalSingleFormRoleGuard, 0);
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
      selectedRole = '';
      if(CX.session) CX.session.clear();
    },
    showForRole: showCredentialStep,
    isReady: function(){ return !!currentContext; },
    selectedRole: function(){ return selectedRole; },
    singleVisibleForm: true
  };

  if(CX.bus && typeof CX.bus.on === 'function'){
    CX.bus.on('backend-ready', enterAfterBackendReady);
    CX.bus.on('backend-error', function(payload){
      if(payload && payload.message) setCredentialError('El acceso fue validado, pero no fue posible cargar el contexto autorizado. Solicita revisión al equipo TyA.');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootLoginBridge);
  else bootLoginBridge();
})();
