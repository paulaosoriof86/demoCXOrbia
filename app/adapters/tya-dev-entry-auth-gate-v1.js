/* ============================================================
   CXOrbia · Corte 6 DEV entry/auth gate v2
   ------------------------------------------------------------
   Root fix P0 de usuarios:
   - un único formulario visible: Usuario + Contraseña;
   - rol, namespace, tenant y proyecto se derivan de Auth/claims;
   - solo una identidad realmente dual pide elegir perfil DESPUÉS
     de validar las credenciales;
   - Firebase Auth/claims/Rules siguen siendo autoridad;
   - no guarda credenciales, tokens, UIDs ni contraseñas;
   - elimina copy/panel técnico del flujo humano;
   - no habilita escrituras ni producción;
   - no modifica app/modules/* ni app/core/*.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const PROTECTED_TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const TENANT_ID = 'tya';
  const PROJECT_ID = 'cinepolis';
  const params = new URLSearchParams(window.location.search || '');
  if(params.get('cxProtectedRuntime') !== PROTECTED_TOKEN) return;

  let patched = false;
  let statusObserver = null;
  let pendingDual = null;

  function normalizeLogin(value){
    return String(value || '').trim().toLowerCase();
  }

  async function sha256Hex(value){
    if(!window.crypto || !crypto.subtle) throw new Error('WEB_CRYPTO_REQUIRED');
    const bytes = new TextEncoder().encode(String(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(function(x){ return x.toString(16).padStart(2,'0'); }).join('');
  }

  async function internalFirebaseEmail(login, namespace){
    const normalized = normalizeLogin(login);
    if(!normalized) throw new Error('LOGIN_REQUIRED');
    const digest = await sha256Hex(TENANT_ID + '\0' + namespace + '\0' + normalized);
    return digest.slice(0,48) + '@auth.cxorbia.invalid';
  }

  function decodeJwtPayload(token){
    const part = String(token || '').split('.')[1] || '';
    if(!part) throw new Error('INVALID_ID_TOKEN');
    const normalized = part.replace(/-/g,'+').replace(/_/g,'/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const json = decodeURIComponent(Array.from(atob(padded)).map(function(c){
      return '%' + c.charCodeAt(0).toString(16).padStart(2,'0');
    }).join(''));
    return JSON.parse(json);
  }

  function list(value){
    if(Array.isArray(value)) return value.map(String);
    if(typeof value === 'string') return value.split(',').map(function(x){ return x.trim(); }).filter(Boolean);
    return [];
  }

  function claimsMatch(payload, namespace){
    const role = String(payload && payload.role || '').trim().toLowerCase();
    const claimNamespace = String(payload && payload.authNamespace || '').trim().toLowerCase();
    const projectIds = list(payload && payload.projectIds);
    const tenantOk = payload && (payload.tenantId === TENANT_ID || list(payload.tenants).includes(TENANT_ID) || role === 'super');
    const projectOk = projectIds.includes(PROJECT_ID) || payload.projectId === PROJECT_ID || role === 'super';
    const namespaceOk = claimNamespace ? claimNamespace === namespace : (namespace === 'shopper' ? role === 'shopper' : role !== 'shopper');
    const roleOk = namespace === 'shopper'
      ? role === 'shopper' && typeof payload.shopperId === 'string' && payload.shopperId.trim() !== ''
      : ['super','admin','ops','coordinador'].includes(role);
    return tenantOk && projectOk && namespaceOk && roleOk;
  }

  async function probeNamespace(login, password, namespace){
    try{
      if(!window.firebase || !firebase.apps || !firebase.apps.length) return null;
      const apiKey = firebase.app().options && firebase.app().options.apiKey;
      if(!apiKey) return null;
      const email = await internalFirebaseEmail(login, namespace);
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(apiKey), {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:email,password:String(password || ''),returnSecureToken:true}),
        cache:'no-store',
        credentials:'omit'
      });
      if(!response.ok) return null;
      const body = await response.json();
      const payload = decodeJwtPayload(body.idToken);
      if(!claimsMatch(payload, namespace)) return null;
      return {namespace:namespace, role:String(payload.role || ''), shopperId:payload.shopperId || null};
    }catch(_){
      return null;
    }
  }

  async function resolveNamespaces(login, password){
    const results = await Promise.all([
      probeNamespace(login, password, 'staff'),
      probeNamespace(login, password, 'shopper')
    ]);
    return results.filter(Boolean);
  }

  function authErrorMessage(err){
    const code = String(err && (err.code || err.message) || '');
    if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code) || /LOGIN_REQUIRED/i.test(code)){
      return 'Usuario o contraseña no válidos.';
    }
    if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED|LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH/i.test(code)){
      return 'La cuenta es válida, pero no tiene un acceso habilitado para este proyecto. Solicita revisión al equipo TyA.';
    }
    return 'No fue posible validar el acceso. Verifica usuario y contraseña o solicita revisión al equipo TyA.';
  }

  function suppressTechnicalStatus(){
    const remove = function(){
      const pill = document.getElementById('cxBackendPreviewStatus');
      if(pill && pill.parentNode) pill.remove();
    };
    remove();
    if(statusObserver || !document.body) return;
    statusObserver = new MutationObserver(remove);
    statusObserver.observe(document.body,{childList:true,subtree:true});
  }

  function removeGenericRolePicker(card){
    const containers = new Set();
    card.querySelectorAll('.role-alt').forEach(function(el){
      const section = el.closest('div[style*="border-top"]') || el.parentElement;
      if(section) containers.add(section); else el.remove();
    });
    const guestSelect = card.querySelector('#loginUserSel');
    if(guestSelect){
      const section = guestSelect.closest('div[style*="border-top"]') || guestSelect.parentElement;
      if(section) containers.add(section);
    }
    containers.forEach(function(section){ if(section && section.parentNode) section.remove(); });
    card.querySelectorAll('.role-btn,#goReg').forEach(function(el){ if(el && el.parentNode) el.remove(); });
  }

  async function completeAuthentication(login, password, namespace, ui){
    const ctx = await CX.backendAuth.authenticate(login, password, namespace);
    pendingDual = null;
    ui.password.value = '';
    ui.login.value = '';
    ui.submit.textContent = 'Cargando...';
    if(CX.app && typeof CX.app.enter === 'function') CX.app.enter();
    return ctx;
  }

  function renderDualChoice(form, matches, loginValue, passwordValue, ui){
    pendingDual = {login:loginValue,password:passwordValue};
    ui.password.value = '';
    ui.submit.disabled = false;
    ui.submit.textContent = 'Ingresar';
    const old = form.querySelector('#cxDevDualAccess');
    if(old) old.remove();
    const box = document.createElement('div');
    box.id = 'cxDevDualAccess';
    box.style.cssText = 'margin-top:10px;padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--soft);';
    box.innerHTML = '<div style="font-size:12px;font-weight:800;margin-bottom:7px">Esta cuenta tiene dos perfiles habilitados</div>'+
      '<div style="font-size:11.5px;color:var(--t3);margin-bottom:9px">Selecciona el perfil con el que deseas ingresar.</div>'+
      '<div class="flex" style="gap:7px;flex-wrap:wrap"></div>';
    const row = box.querySelector('.flex');
    matches.forEach(function(match){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-soft btn-sm';
      button.dataset.namespace = match.namespace;
      button.textContent = match.namespace === 'shopper' ? 'Shopper / Evaluador' : 'Administración / Coordinación';
      button.addEventListener('click', async function(){
        if(!pendingDual) return;
        box.querySelectorAll('button').forEach(function(b){ b.disabled = true; });
        try{
          await completeAuthentication(pendingDual.login, pendingDual.password, match.namespace, ui);
        }catch(err){
          pendingDual = null;
          box.remove();
          ui.error.textContent = authErrorMessage(err);
          ui.error.style.display = 'block';
          ui.password.focus();
        }
      });
      row.appendChild(button);
    });
    form.appendChild(box);
  }

  function renderDirectProductLogin(){
    suppressTechnicalStatus();
    const loginRoot = document.getElementById('login');
    const card = loginRoot && loginRoot.querySelector('.login-card');
    if(!card || !window.CX || !CX.backendAuth) return false;

    removeGenericRolePicker(card);
    const oldIntegrated = card.querySelector('#cxIntegratedAuthStep');
    if(oldIntegrated) oldIntegrated.remove();
    const old = card.querySelector('#cxDevEntryAuth');
    if(old) old.remove();

    const title = card.querySelector('.login-title');
    if(title) title.textContent = 'Plataforma operativa TyA';
    const sub = card.querySelector('.login-sub');
    if(sub) sub.textContent = 'Ingresa con tu usuario y contraseña habituales.';

    const form = document.createElement('form');
    form.id = 'cxDevEntryAuth';
    form.autocomplete = 'on';
    form.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    form.innerHTML =
      '<label class="lbl" for="cxDevEntryLogin">Usuario</label>'+
      '<input class="inp" id="cxDevEntryLogin" type="text" autocomplete="username" style="width:100%;margin-bottom:9px">'+
      '<label class="lbl" for="cxDevEntryPassword">Contraseña</label>'+
      '<input class="inp" id="cxDevEntryPassword" type="password" autocomplete="current-password" style="width:100%;margin-bottom:9px">'+
      '<div id="cxDevEntryError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div>'+
      '<button class="btn btn-pr" id="cxDevEntrySubmit" type="submit" style="width:100%">Ingresar</button>';

    const footer = card.querySelector('.login-devfor') || card.querySelector('.login-poweredby');
    card.insertBefore(form, footer || null);

    const ui = {
      login:form.querySelector('#cxDevEntryLogin'),
      password:form.querySelector('#cxDevEntryPassword'),
      error:form.querySelector('#cxDevEntryError'),
      submit:form.querySelector('#cxDevEntrySubmit')
    };

    form.addEventListener('submit', async function(ev){
      ev.preventDefault();
      const dual = form.querySelector('#cxDevDualAccess');
      if(dual) dual.remove();
      pendingDual = null;
      ui.error.style.display = 'none';
      ui.error.textContent = '';
      const userValue = String(ui.login.value || '').trim();
      const passwordValue = String(ui.password.value || '');
      if(!userValue || !passwordValue){
        ui.error.textContent = 'Completa usuario y contraseña.';
        ui.error.style.display = 'block';
        return;
      }
      ui.submit.disabled = true;
      ui.submit.textContent = 'Validando...';
      try{
        const matches = await resolveNamespaces(userValue, passwordValue);
        if(matches.length === 0) throw new Error('auth/invalid-credential');
        if(matches.length > 1){
          renderDualChoice(form, matches, userValue, passwordValue, ui);
          return;
        }
        await completeAuthentication(userValue, passwordValue, matches[0].namespace, ui);
      }catch(err){
        pendingDual = null;
        ui.password.value = '';
        ui.error.textContent = authErrorMessage(err);
        ui.error.style.display = 'block';
        ui.submit.disabled = false;
        ui.submit.textContent = 'Ingresar';
        ui.password.focus();
      }
    });

    setTimeout(function(){
      if(CX.backendAuth && CX.backendAuth.isReady && CX.backendAuth.isReady()) return;
      try{ ui.login.focus(); }catch(_){ }
    }, 0);

    window.CX_DEV_ENTRY_AUTH_GATE = {
      applied:true,
      mode:'username-password-claims-derived',
      visibleRoleSelector:false,
      namespaceAutoResolution:true,
      dualChoiceOnlyAfterCredentialValidation:true,
      genericRolePickerRemoved:true,
      technicalStatusVisible:false,
      firebaseAuthAuthorityPreserved:true,
      sessionReuse:true,
      credentialsEmbedded:false,
      writes:false,
      production:false,
      at:new Date().toISOString()
    };
    return true;
  }

  function patchProductEntry(){
    suppressTechnicalStatus();
    if(patched || !CX.app || !CX.backendAuth) return false;
    const priorShowLogin = typeof CX.app.showLogin === 'function' ? CX.app.showLogin.bind(CX.app) : null;
    const priorEnter = typeof CX.app.enter === 'function' ? CX.app.enter.bind(CX.app) : null;

    CX.app.showLogin = function(){
      const result = priorShowLogin ? priorShowLogin() : undefined;
      renderDirectProductLogin();
      return result;
    };

    CX.app.enter = function(){
      suppressTechnicalStatus();
      const result = priorEnter ? priorEnter() : undefined;
      if(!(CX.backendAuth && CX.backendAuth.isReady && CX.backendAuth.isReady())){
        setTimeout(renderDirectProductLogin, 0);
      }
      return result;
    };

    CX.app.__cxDevEntryAuthGateV2 = true;
    patched = true;
    return true;
  }

  suppressTechnicalStatus();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchProductEntry);
  else patchProductEntry();
})();
