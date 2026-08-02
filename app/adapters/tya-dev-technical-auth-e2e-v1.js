/* CXOrbia Corte 6 — technical Auth E2E adapter v1.
   Private technical lane only. It never runs on the human product route.
   Preserves automated staff/shopper Auth + claims verification without
   reintroducing the former direct-role human override.
   Read-only DEV; no credentials embedded, no provider writes, no production.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
  const TECHNICAL='YES_PAULA_20260801_REAL_USERS_E2E';
  const enabled=params.get('cxProtectedRuntime')===PROTECTED
    && params.get('cxTechnicalAuthE2E')===TECHNICAL;
  if(!enabled)return;

  const namespace=params.get('cxTechnicalAuthNamespace')==='shopper'?'shopper':'staff';
  let patched=false,statusObserver=null;

  function suppressHumanOnlyStatus(){
    const remove=()=>document.getElementById('cxBackendPreviewStatus')?.remove();
    remove();
    if(statusObserver||!document.body)return;
    statusObserver=new MutationObserver(remove);
    statusObserver.observe(document.body,{childList:true,subtree:true});
  }

  function message(error){
    const code=String(error&&(error.code||error.message)||'');
    if(/auth\/(wrong-password|invalid-credential|user-not-found|invalid-email)/i.test(code))return 'Usuario o contraseña no válidos.';
    if(/TENANT_NOT_ALLOWED|PROJECT_SCOPE_REQUIRED|SHOPPER_SCOPE_REQUIRED|ROLE_NOT_ALLOWED|LOGIN_NAMESPACE_MISMATCH|ROLE_NAMESPACE_MISMATCH/i.test(code))return 'La cuenta es válida, pero no tiene alcance para este proyecto.';
    return 'No fue posible validar el acceso técnico.';
  }

  function render(){
    suppressHumanOnlyStatus();
    const loginRoot=document.getElementById('login');
    const card=loginRoot&&loginRoot.querySelector('.login-card');
    if(!card||!CX.backendAuth)return false;
    card.querySelectorAll('.role-btn,.role-alt,#goReg').forEach(el=>el.remove());
    const guest=card.querySelector('#loginUserSel');
    if(guest){const section=guest.closest('div[style*="border-top"]')||guest.parentElement;section?.remove();}
    const title=card.querySelector('.login-title');
    if(title)title.textContent='Validación técnica protegida';
    const sub=card.querySelector('.login-sub');
    if(sub)sub.textContent='Carril E2E privado; no corresponde a la entrada humana del producto.';
    card.querySelector('#cxDevEntryAuth')?.remove();

    const form=document.createElement('form');
    form.id='cxDevEntryAuth';
    form.autocomplete='off';
    form.style.cssText='margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:left';
    form.innerHTML=
      '<label class="lbl" for="cxDevEntryLogin">Usuario técnico</label>'+
      '<input class="inp" id="cxDevEntryLogin" type="text" autocomplete="off" style="width:100%;margin-bottom:9px">'+
      '<label class="lbl" for="cxDevEntryPassword">Contraseña técnica</label>'+
      '<input class="inp" id="cxDevEntryPassword" type="password" autocomplete="off" style="width:100%;margin-bottom:9px">'+
      '<div id="cxDevEntryError" aria-live="polite" style="display:none;font-size:11.5px;color:#b42318;background:#fef3f2;border-radius:8px;padding:8px 10px;margin-bottom:9px"></div>'+
      '<button class="btn btn-pr" id="cxDevEntrySubmit" type="submit" style="width:100%">Validar</button>';
    card.insertBefore(form,card.querySelector('.login-devfor')||card.querySelector('.login-poweredby')||null);

    const login=form.querySelector('#cxDevEntryLogin');
    const password=form.querySelector('#cxDevEntryPassword');
    const error=form.querySelector('#cxDevEntryError');
    const submit=form.querySelector('#cxDevEntrySubmit');
    form.addEventListener('submit',async event=>{
      event.preventDefault();error.style.display='none';
      const user=String(login.value||'').trim(),pass=String(password.value||'');
      if(!user||!pass){error.textContent='Completa las credenciales técnicas.';error.style.display='block';return;}
      submit.disabled=true;submit.textContent='Validando...';
      try{
        await CX.backendAuth.authenticate(user,pass,namespace);
        password.value='';login.value='';submit.textContent='Cargando...';
        CX.app?.enter?.();
      }catch(authError){
        password.value='';error.textContent=message(authError);error.style.display='block';
        submit.disabled=false;submit.textContent='Validar';
      }
    });
    window.CX_TYA_TECHNICAL_AUTH_E2E={
      ready:true,version:'technical-auth-e2e-v1',namespace,
      formId:'cxDevEntryAuth',
      humanRouteAffected:false,credentialsEmbedded:false,
      providerWrites:0,production:false,at:new Date().toISOString()
    };
    return true;
  }

  function patch(){
    suppressHumanOnlyStatus();
    if(patched||!CX.app||!CX.backendAuth)return false;
    const show=typeof CX.app.showLogin==='function'?CX.app.showLogin.bind(CX.app):null;
    const enter=typeof CX.app.enter==='function'?CX.app.enter.bind(CX.app):null;
    CX.app.showLogin=function(){const result=show?.();setTimeout(render,0);return result;};
    CX.app.enter=function(){suppressHumanOnlyStatus();const result=enter?.();if(!CX.backendAuth?.isReady?.())setTimeout(render,0);return result;};
    patched=true;
    setTimeout(render,0);
    return true;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});
  else patch();
})();