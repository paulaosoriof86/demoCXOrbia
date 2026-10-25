/* CXOrbia — canonical protected human Auth owner bridge v3.
   Historical path preserved to avoid source-chain churn.

   Purpose:
   - Firebase browser Auth remains the single authentication owner;
   - normal protected role cards always delegate to CX.backendAuth.showForRole();
   - protected Shopper never opens pickShopperDev();
   - protected Cliente never enters the legacy extra credential overlay;
   - no capture-click guard, no direct authenticate wrapper, no credential persistence;
   - non-protected/demo behavior is preserved unchanged.

   Source-only. No provider reads/writes, deploy, merge or production.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};

  function protectedLoginEnabled(){
    try{
      return CX.BACKEND?.enabled===true
        && CX.BACKEND?.previewMode===true
        && CX.BACKEND?.devPreviewAuth?.enabled===true
        && window.CX_DEV_ENTRY_CANONICAL?.canonical===true
        && window.CX_DEV_ENTRY_CANONICAL?.singleVisibleProductLogin===true;
    }catch(_){return false;}
  }

  function publish(status,extra){
    window.CX_C6_SHOPPER_AUTH_CLICK_GUARD=Object.assign({
      installed:true,
      version:'canonical-protected-human-auth-owner-v3',
      status,
      authOwner:'core/backend-browser-auth.js',
      singleVisibleProductLogin:true,
      captureClickGuard:false,
      directAuthenticateWrapper:false,
      directDevShopperPickerAllowed:false,
      clientLegacyCredentialOverlayAllowed:false,
      credentialValuesStored:false,
      providerReads:0,
      providerWrites:0,
      deploys:0,
      merge:false,
      production:false,
      at:new Date().toISOString()
    },extra||{});
  }

  function install(){
    if(!CX.app)return false;

    /* Prevent the old unified-runtime client overlay from becoming the effective
       owner. We intentionally install after that adapter and before app boot. */
    const previousSelectRole=typeof CX.app.selectRole==='function'?CX.app.selectRole.bind(CX.app):null;
    if(previousSelectRole && CX.app.__canonicalProtectedAuthOwner!==true){
      CX.app.selectRole=function(role){
        if(protectedLoginEnabled()){
          if(typeof CX.backendAuth?.showForRole!=='function'){
            publish('blocked',{code:'CANONICAL_BROWSER_AUTH_OWNER_NOT_READY',role:String(role||'')});
            try{CX.ui?.toast?.('El acceso protegido no está disponible. Intenta nuevamente.','err');}catch(_){}
            return;
          }
          CX.backendAuth.showForRole(role);
          publish('delegated',{role:String(role||''),backendAuthReady:CX.backendAuth?.isReady?.()===true});
          return;
        }
        return previousSelectRole.apply(CX.app,arguments);
      };
      CX.app.__canonicalProtectedAuthOwner=true;
    }

    /* app.js historically routes DEV Shopper to pickShopperDev() before selectRole().
       In the protected human lane DEV identity picking is not an authentication path,
       so make that DEV-only branch ineligible while preserving it for explicit lab/demo. */
    if(typeof CX.app._isDevAccess==='function'&&CX.app.__canonicalProtectedDevAccessGuard!==true){
      const previousIsDevAccess=CX.app._isDevAccess.bind(CX.app);
      CX.app._isDevAccess=function(){
        if(protectedLoginEnabled())return false;
        return previousIsDevAccess.apply(CX.app,arguments);
      };
      CX.app.__canonicalProtectedDevAccessGuard=true;
    }

    publish('installed_waiting_human_role');
    return true;
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){
      if(!install())setTimeout(install,0);
    },{once:true});
  }else if(!install()){
    setTimeout(install,0);
  }
})();
