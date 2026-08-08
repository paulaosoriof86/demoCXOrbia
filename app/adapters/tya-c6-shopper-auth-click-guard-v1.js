/* CXOrbia TyA — C6 protected role Auth guards v2.

   Root causes addressed:
   1. app.js owns the approved visible role cards, but its DEV Shopper handler
      calls pickShopperDev() before CX.app.selectRole(). In the protected backend
      runtime that bypasses Firebase Auth even when the official Auth wrapper is
      installed.
   2. The unified Client credential step calls CX.backendAuth.authenticate()
      directly. Authentication and claims succeeded, but that direct call did not
      complete CX.app.enter(), leaving the authenticated Client on the login view.

   This adapter intercepts only the unauthenticated Shopper card in the protected
   human lane and completes only an already-authenticated Client transition.

   It does not modify UI modules/core, persist credentials, write providers,
   deploy, merge or enter production.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
  const FULL_VISUAL='YES_PAULA_20260731_FULL_PROFILE_DEV';
  const TECHNICAL='YES_PAULA_20260801_REAL_USERS_E2E';
  const enabled=params.get('cxProtectedRuntime')===PROTECTED
    && params.get('cxHumanFullVisual')===FULL_VISUAL
    && params.get('cxTechnicalAuthE2E')!==TECHNICAL;
  if(!enabled)return;

  function installShopperGuard(){
    if(window.CX_C6_SHOPPER_AUTH_CLICK_GUARD?.installed===true)return true;
    const handler=event=>{
      const target=event.target&&event.target.closest?event.target.closest('.role-btn[data-role="shopper"]'):null;
      if(!target)return;
      const protectedLogin=CX.BACKEND?.enabled===true
        && CX.BACKEND?.previewMode===true
        && CX.BACKEND?.devPreviewAuth?.enabled===true;
      if(!protectedLogin||CX.backendAuth?.isReady?.()===true||typeof CX.backendAuth?.showForRole!=='function')return;
      event.preventDefault();
      event.stopImmediatePropagation();
      CX.backendAuth.showForRole('shopper');
      const state=window.CX_C6_SHOPPER_AUTH_CLICK_GUARD;
      state.intercepts+=1;
      state.lastInterceptedAt=new Date().toISOString();
    };

    document.addEventListener('click',handler,true);
    window.CX_C6_SHOPPER_AUTH_CLICK_GUARD={
      installed:true,
      version:'c6-protected-role-auth-guards-v2',
      reason:'prevent_app_dev_picker_from_bypassing_protected_firebase_auth',
      role:'shopper',
      integratedCredentialBridge:true,
      directDevShopperPickerAllowed:false,
      intercepts:0,
      credentialValuesStored:false,
      providerWrites:0,
      deploys:0,
      merge:false,
      production:false,
      at:new Date().toISOString()
    };
    return true;
  }

  function installClientEnterBridge(){
    if(!CX.backendAuth||typeof CX.backendAuth.authenticate!=='function')return false;
    if(CX.backendAuth.__c6ClientEnterBridge===true)return true;
    const original=CX.backendAuth.authenticate.bind(CX.backendAuth);
    CX.backendAuth.authenticate=async function(login,password,namespace){
      const ctx=await original(login,password,namespace);
      const role=String(ctx&&ctx.role||'').trim().toLowerCase();
      if((role==='cliente'||role==='client')&&ctx?.authenticated===true&&ctx.authNamespace==='staff'){
        queueMicrotask(function(){
          try{
            const app=document.getElementById('app');
            if(!app?.classList.contains('on')&&CX.app&&typeof CX.app.enter==='function')CX.app.enter();
            window.CX_C6_CLIENT_AUTH_ENTER={
              completed:Boolean(document.getElementById('app')?.classList.contains('on')),
              role,
              authNamespace:ctx.authNamespace,
              tenantId:ctx.tenantId||null,
              projectIds:Array.isArray(ctx.projectIds)?ctx.projectIds.slice():[],
              credentialsStored:false,
              providerWrites:0,
              deploys:0,
              merge:false,
              production:false,
              at:new Date().toISOString()
            };
          }catch(_){}
        });
      }
      return ctx;
    };
    CX.backendAuth.__c6ClientEnterBridge=true;
    window.CX_C6_CLIENT_AUTH_ENTER_BRIDGE={
      installed:true,
      version:'c6-protected-role-auth-guards-v2',
      reason:'complete_authenticated_client_transition_after_direct_authenticate_call',
      credentialsStored:false,
      providerWrites:0,
      deploys:0,
      merge:false,
      production:false,
      at:new Date().toISOString()
    };
    return true;
  }

  installShopperGuard();
  if(!installClientEnterBridge()){
    let attempts=0;
    const timer=setInterval(function(){
      attempts++;
      if(installClientEnterBridge()||attempts>=240)clearInterval(timer);
    },25);
  }
})();
