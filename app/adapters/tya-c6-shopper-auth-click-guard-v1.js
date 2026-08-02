/* CXOrbia TyA — C6 protected Shopper Auth click guard v1.

   Root cause addressed:
   app.js owns the approved visible role cards, but its DEV Shopper handler
   calls pickShopperDev() before CX.app.selectRole(). In the protected backend
   runtime that bypasses Firebase Auth even when the official Auth wrapper is
   installed. This capture guard intercepts only the unauthenticated Shopper
   card in the protected human lane and routes it to the existing integrated
   Usuario + Contraseña bridge.

   It does not modify UI modules/core, authenticate by itself, select a Shopper,
   persist credentials, write providers, deploy or enter production.
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
  if(!enabled||window.CX_C6_SHOPPER_AUTH_CLICK_GUARD?.installed===true)return;

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
    version:'c6-shopper-auth-click-guard-v1',
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
})();