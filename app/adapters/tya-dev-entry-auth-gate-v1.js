/* ============================================================
   CXOrbia · Corte 6 DEV entry/auth gate v1
   ------------------------------------------------------------
   P0 probado por validación humana:
   - la ruta DEV podía abrir el selector genérico de perfiles;
   - el login real de Usuario + Contraseña quedaba detrás de otro clic;
   - una sesión CX persistida sin contexto Firebase podía volver a ese selector;
   - el smoke técnico anterior no probaba el arranque real del navegador.

   Este adapter corrige únicamente el carril DEV protegido:
   - mantiene Firebase Auth/claims/Rules como autoridad;
   - reutiliza una sesión Firebase válida si existe;
   - si no existe, muestra UN solo login de producto con Tipo de acceso,
     Usuario y Contraseña, sin pantalla técnica ni selector genérico previo;
   - no guarda credenciales, tokens, UIDs ni contraseñas;
   - no habilita escrituras ni producción;
   - no modifica app/modules/* ni app/core/*.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const PROTECTED_TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const params = new URLSearchParams(window.location.search || '');
  if(params.get('cxProtectedRuntime') !== PROTECTED_TOKEN) return;

  let patched = false;

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

  function removeGenericRolePicker(card){
    const containers = new Set();

    card.querySelectorAll('.role-alt').forEach(function(el){
      const section = el.closest('div[style*="border-top"]') || el.parentElement;
      if(section) containers.add(section);
      else el.remove();
    });

    const guestSelect = card.querySelector('#loginUserSel');
    if(guestSelect){
      const section = guestSelect.closest('div[style*="border-top"]') || guestSelect.parentElement;
      if(section) containers.add(section);
    }

    containers.forEach(function(section){
      if(section && section.parentNode) section.remove();
    });

    card.querySelectorAll('.role-btn,#goReg').forEach(function(el){
      if(el && el.parentNode) el.remove();
    });
  }

  function renderDirectProductLogin(){
    const loginRoot = document.getElementById('login');
    const card = loginRoot && loginRoot.querySelector('.login-card');
    if(!card || !window.CX || !CX.backendAuth) return false;

    removeGenericRolePicker(card);
    const oldIntegrated = card.querySelector('#cxIntegratedAuthStep');
    if(oldIntegrated) oldIntegrated.remove();
    const old = card.querySelector('#cxDevEntryAuth');
    if(old) old.remove();

    const sub = card.querySelector('.login-sub');
    if(sub) sub.textContent = 'Ingresa con tu usuario y contraseña habituales de TyA.';

    const form = document.createElement('form');
    form.id = 'cxDevEntryAuth';
    form.autocomplete = 'on';
    form.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    form.innerHTML =
      '<label class="lbl" for="cxDevEntryAccessType">Tipo de acceso</label>'+
      '<select class="sel" id="cxDevEntryAccessType" autocomplete="off" style="width:100%;margin-bottom:9px">'+
        '<option value="staff">Administración / Coordinación</option>'+
        '<option value="shopper">Shopper / Evaluador</option>'+
      '</select>'+
      '<label class="lbl" for="cxDevEntryLogin">Usuario</label>'+
      '<input class="inp" id="cxDevEntryLogin" type="text" autocomplete="username" style="width:100%;margin-bottom:9px">'+
      '<label class="lbl" for="cxDevEntryPassword">Contraseña</label>'+
      '<input class="inp" id="cxDevEntryPassword" type="password" autocomplete="current-password" style="width:100%;margin-bottom:9px">'+
      '<div id="cxDevEntryError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div>'+
      '<button class="btn btn-pr" id="cxDevEntrySubmit" type="submit" style="width:100%">Ingresar</button>';

    const footer = card.querySelector('.login-devfor') || card.querySelector('.login-poweredby');
    card.insertBefore(form, footer || null);

    const access = form.querySelector('#cxDevEntryAccessType');
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
      const namespace = access.value === 'shopper' ? 'shopper' : 'staff';
      if(!userValue || !passwordValue){
        error.textContent = 'Completa usuario y contraseña.';
        error.style.display = 'block';
        return;
      }
      submit.disabled = true;
      submit.textContent = 'Validando...';
      try{
        await CX.backendAuth.authenticate(userValue, passwordValue, namespace);
        password.value = '';
        login.value = '';
        submit.textContent = 'Cargando...';
      }catch(err){
        password.value = '';
        error.textContent = authErrorMessage(err);
        error.style.display = 'block';
        submit.disabled = false;
        submit.textContent = 'Ingresar';
        password.focus();
      }
    });

    setTimeout(function(){
      if(CX.backendAuth && CX.backendAuth.isReady && CX.backendAuth.isReady()) return;
      try{ login.focus(); }catch(_){ }
    }, 0);

    window.CX_DEV_ENTRY_AUTH_GATE = {
      applied:true,
      mode:'single-product-login',
      genericRolePickerHidden:true,
      genericRolePickerRemoved:true,
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
    if(patched || !CX.app || !CX.backendAuth) return false;
    const priorShowLogin = typeof CX.app.showLogin === 'function' ? CX.app.showLogin.bind(CX.app) : null;
    const priorEnter = typeof CX.app.enter === 'function' ? CX.app.enter.bind(CX.app) : null;

    CX.app.showLogin = function(){
      const result = priorShowLogin ? priorShowLogin() : undefined;
      renderDirectProductLogin();
      return result;
    };

    CX.app.enter = function(){
      const result = priorEnter ? priorEnter() : undefined;
      if(!(CX.backendAuth && CX.backendAuth.isReady && CX.backendAuth.isReady())){
        setTimeout(renderDirectProductLogin, 0);
      }
      return result;
    };

    CX.app.__cxDevEntryAuthGateV1 = true;
    patched = true;
    return true;
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchProductEntry);
  else patchProductEntry();
})();
