/* CXOrbia Corte 6 — Client Auth enter bridge v1.
   The unified Client credential step authenticates through Firebase Auth,
   but the direct authenticate() call does not itself enter the application.
   This bridge completes only the authenticated Client transition.
   Human protected DEV only; no credentials, writes, deploy or production. */
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

  function install(){
    if(!CX.backendAuth||typeof CX.backendAuth.authenticate!=='function'||CX.backendAuth.__c6ClientEnterBridge)return false;
    const original=CX.backendAuth.authenticate.bind(CX.backendAuth);
    CX.backendAuth.authenticate=async function(login,password,namespace){
      const ctx=await original(login,password,namespace);
      const role=String(ctx&&ctx.role||'').trim().toLowerCase();
      if((role==='cliente'||role==='client')&&ctx&&ctx.authenticated===true&&ctx.authNamespace==='staff'){
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
      version:'client-auth-enter-bridge-v1',
      credentialsStored:false,
      providerWrites:0,
      production:false,
      at:new Date().toISOString()
    };
    return true;
  }

  if(!install()){
    let attempts=0;
    const timer=setInterval(function(){
      attempts++;
      if(install()||attempts>=240)clearInterval(timer);
    },25);
  }
})();
