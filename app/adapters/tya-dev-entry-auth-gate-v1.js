/* ============================================================
   CXOrbia · Corte 6 DEV entry lane split v3
   ------------------------------------------------------------
   Human visual lane (default):
   - preserves the native app.js direct role cards;
   - Administration / Client / Shopper remain visible by tenant config;
   - never asks Paula for username or password.

   Technical Auth lane (explicit query gate only):
   - validates existing Firebase users without changing the human UX;
   - role, tenant, project and shopper scope still come from claims;
   - namespace is supplied by the private E2E harness, never by a user control;
   - no credentials, tokens or UIDs are persisted or logged;
   - no writes and no production.

   This adapter does not modify app/modules/* or app/core/*.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  'use strict';

  const PROTECTED_TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const TECHNICAL_TOKEN = 'YES_PAULA_20260801_REAL_USERS_E2E';
  const params = new URLSearchParams(window.location.search || '');
  if(params.get('cxProtectedRuntime') !== PROTECTED_TOKEN) return;

  const technicalAuthEnabled = params.get('cxTechnicalAuthE2E') === TECHNICAL_TOKEN;
  const technicalNamespace = params.get('cxTechnicalAuthNamespace') === 'shopper' ? 'shopper' : 'staff';
  let patched = false;
  let statusObserver = null;

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

  function setHumanLaneState(){
    window.CX_DEV_ENTRY_AUTH_GATE = {
      applied:true,
      mode:'native-direct-role-entry',
      humanVisual:true,
      visibleRoleSelector:true,
      usernamePasswordVisible:false,
      technicalAuthEnabled:false,
      firebaseAuthAuthorityPreserved:true,
      writes:false,
      production:false,
      at:new Date().toISOString()
    };
  }

  function authErrorMessage(err){
    const code = String(err && (err.code || err.message) || '');
    if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code)){
      return 'Usuario o contraseña no válidos.';
    }
    if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED|LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH/i.test(code)){
      return 'La cuenta es válida, pero no tiene alcance para este proyecto.';
    }
    return 'No fue posible validar el acceso técnico.';
  }

  function renderTechnicalAuth(){
    suppressTechnicalStatus();
    const loginRoot = document.getElementById('login');
    const card = loginRoot && loginRoot.querySelector('.login-card');
    if(!card || !window.CX || !CX.backendAuth) return false;

    card.querySelectorAll('.role-btn,.role-alt,#goReg').forEach(function(el){
      if(el && el.parentNode) el.remove();
    });
    const guest = card.querySelector('#loginUserSel');
    if(guest){
      const section = guest.closest('div[style*="border-top"]') || guest.parentElement;
      if(section && section.parentNode) section.remove();
    }

    const title = card.querySelector('.login-title');
    if(title) title.textContent = 'Validación técnica protegida';
    const sub = card.querySelector('.login-sub');
    if(sub) sub.textContent = 'Carril E2E privado; no corresponde a la entrada humana del producto.';

    const old = card.querySelector('#cxDevEntryAuth');
    if(old) old.remove();

    const form = document.createElement('form');
    form.id = 'cxDevEntryAuth';
    form.autocomplete = 'off';
    form.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    form.innerHTML =
      '<label class="lbl" for="cxDevEntryLogin">Usuario técnico</label>'+
      '<input class="inp" id="cxDevEntryLogin" type="text" autocomplete="off" style="width:100%;margin-bottom:9px">'+
      '<label class="lbl" for="cxDevEntryPassword">Contraseña técnica</label>'+
      '<input class="inp" id="cxDevEntryPassword" type="password" autocomplete="off" style="width:100%;margin-bottom:9px">'+
      '<div id="cxDevEntryError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div>'+
      '<button class="btn btn-pr" id="cxDevEntrySubmit" type="submit" style="width:100%">Validar</button>';

    const footer = card.querySelector('.login-devfor') || card.querySelector('.login-poweredby');
    card.insertBefore(form, footer || null);

    const login = form.querySelector('#cxDevEntryLogin');
    const password = form.querySelector('#cxDevEntryPassword');
    const error = form.querySelector('#cxDevEntryError');
    const submit = form.querySelector('#cxDevEntrySubmit');

    form.addEventListener('submit', async function(ev){
      ev.preventDefault();
      error.style.display = 'none';
      error.textContent = '';
      const userValue = String(login.value || '').trim();
      const passwordValue = String(password.value || '');
      if(!userValue || !passwordValue){
        error.textContent = 'Completa las credenciales técnicas.';
        error.style.display = 'block';
        return;
      }
      submit.disabled = true;
      submit.textContent = 'Validando...';
      try{
        await CX.backendAuth.authenticate(userValue, passwordValue, technicalNamespace);
        password.value = '';
        login.value = '';
        submit.textContent = 'Cargando...';
        if(CX.app && typeof CX.app.enter === 'function') CX.app.enter();
      }catch(err){
        password.value = '';
        error.textContent = authErrorMessage(err);
        error.style.display = 'block';
        submit.disabled = false;
        submit.textContent = 'Validar';
      }
    });

    window.CX_DEV_ENTRY_AUTH_GATE = {
      applied:true,
      mode:'technical-auth-e2e-isolated',
      humanVisual:false,
      visibleRoleSelector:false,
      usernamePasswordVisible:true,
      technicalAuthEnabled:true,
      technicalNamespace:technicalNamespace,
      namespaceUserSelectable:false,
      firebaseAuthAuthorityPreserved:true,
      credentialsEmbedded:false,
      writes:false,
      production:false,
      at:new Date().toISOString()
    };
    return true;
  }

  function patchTechnicalLane(){
    suppressTechnicalStatus();
    if(patched || !CX.app || !CX.backendAuth) return false;
    const priorShowLogin = typeof CX.app.showLogin === 'function' ? CX.app.showLogin.bind(CX.app) : null;
    const priorEnter = typeof CX.app.enter === 'function' ? CX.app.enter.bind(CX.app) : null;

    CX.app.showLogin = function(){
      const result = priorShowLogin ? priorShowLogin() : undefined;
      renderTechnicalAuth();
      return result;
    };
    CX.app.enter = function(){
      suppressTechnicalStatus();
      const result = priorEnter ? priorEnter() : undefined;
      if(!(CX.backendAuth && CX.backendAuth.isReady && CX.backendAuth.isReady())){
        setTimeout(renderTechnicalAuth,0);
      }
      return result;
    };

    patched = true;
    return true;
  }

  suppressTechnicalStatus();

  if(!technicalAuthEnabled){
    setHumanLaneState();
    return;
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchTechnicalLane);
  else patchTechnicalLane();
})();
