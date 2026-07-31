/* ============================================================
   CXOrbia · Protected DEV runtime switch
   ------------------------------------------------------------
   Purpose:
   - keep the approved source-safe human preview unchanged;
   - expose a separate authenticated DEV runtime for validating
     real Firestore identities and shopper modules;
   - never weaken Auth/RBAC/Rules and never enable writes.

   Security boundary:
   - the query token is only an explicit DEV intent flag;
   - Firebase Auth + custom claims + Firestore Rules remain mandatory.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const params = new URLSearchParams(window.location.search || '');
  const TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const protectedRuntime = params.get('cxProtectedRuntime') === TOKEN;
  if(!protectedRuntime) return;

  const cfg = CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    enabled:true,
    previewMode:true,
    humanVisualSourceSafe:false,
    readOnly:true,
    writeMode:'disabled',
    enableDataWrites:false,
    enableOperationalWrites:false,
    allowEmptyBackend:false,
    failClosedOnReadError:true,
    preserveCxDataInterface:true,
    tenantId:'tya',
    defaultProjectId:params.get('cxProjectId') || 'cinepolis',
    previewProjectIds:[params.get('cxProjectId') || 'cinepolis'],
    canonicalBackendProjectId:'cxorbia-backend-dev',
    migrationTargetProjectId:'cxorbia-backend-dev',
    sandboxOnly:false,
    projectIdentityVerified:true,
    configSource:'firebase-hosting-protected-dev-runtime',
    devPreviewAuth:{
      enabled:true,
      mode:'integrated-product-login-protected-dev',
      persist:'session',
      storedCredentialFallback:false,
      requireCustomClaims:true,
      humanCredentialPrompt:true,
      allowTechnicalEmail:false
    }
  });

  if(CX.dataSource){
    CX.dataSource.mode='connected';
    CX.dataSource.status='loading';
    CX.dataSource.sourceRef='firebase:cxorbia-backend-dev:protected-readonly';
    CX.dataSource.updatedAt=new Date().toISOString();
    CX.dataSource.warnings=['DEV protegido: identidad real solo después de Firebase Auth/RBAC/Rules. Escrituras deshabilitadas.'];
    CX.dataSource.blockers=[];
  }

  window.CX_BACKEND_DATA_SOURCE='firestore-protected-pending';
  window.CX_BACKEND_LAST_STATE={
    source:'firestore-protected-pending',
    tenantId:cfg.tenantId,
    projectId:cfg.defaultProjectId,
    protectedRuntime:true,
    readOnly:true,
    writes:false,
    production:false,
    at:new Date().toISOString()
  };
  window.CX_PROTECTED_DEV_RUNTIME=true;

  console.warn('[CX.backend-protected-dev] Authenticated Firestore DEV validation enabled; writes remain disabled.');
})();
