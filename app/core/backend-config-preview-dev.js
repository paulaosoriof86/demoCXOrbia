/* ============================================================
   CXOrbia · Preview DEV backend gate
   ------------------------------------------------------------
   No se carga en app/index.html.
   Solo se carga en app/index-backend-dev.html.

   Dos carriles DEV explícitos y mutuamente excluyentes:
   1) human visual source-safe: prototipo sin Auth visible;
   2) protected runtime: Firebase Auth + claims + Rules + Firestore real.

   El carril protegido nunca puede ser degradado después a source-safe.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const TOKEN = 'YES_PAULA_20260628_PREVIEW_DEV';
  const PROTECTED_TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  const params = new URLSearchParams(window.location.search || '');
  const token = params.get('cxBackendPreview');
  const protectedRequested = params.get('cxProtectedRuntime') === PROTECTED_TOKEN;
  const stored = sessionStorage.getItem('CXORBIA_PREVIEW_DEV_APPROVED');
  const approved = token === TOKEN || stored === TOKEN;

  if(token === TOKEN) sessionStorage.setItem('CXORBIA_PREVIEW_DEV_APPROVED', TOKEN);

  if(!approved){
    console.warn('[CX.backend-preview] Preview DEV no autorizado. Adapter sigue desactivado.');
    return;
  }

  function ensureIdentityRollForwardRuntime(){
    if(document.getElementById('cxIdentityRollForwardRuntime')) return;
    const script = document.createElement('script');
    script.id = 'cxIdentityRollForwardRuntime';
    script.src = 'adapters/cxorbia-identity-roll-forward-v1.js';
    script.async = false;
    script.dataset.scope = 'reusable-multi-tenant-multi-project-period-independent';
    document.head.appendChild(script);
  }

  /* P0 Corte6: si se pidió runtime protegido, este archivo NO toca CX.dataSource ni desactiva
     backend. backend-protected-dev-mode.js es el único dueño de esa configuración. */
  if(protectedRequested){
    ensureIdentityRollForwardRuntime();
    window.CX_BACKEND_PREVIEW_LANE = 'protected-runtime';
    console.warn('[CX.backend-preview] Carril protegido solicitado; se omite forceHumanVisualSourceSafe().');
    return;
  }

  function safeHrSourceEndpoint(){
    const explicit = (params.get('cxHrSourceEndpoint') || '').trim();
    if(explicit) return explicit;
    if(params.get('cxHrSourceLocal') === '1') return 'http://127.0.0.1:8787/api/hr-source';
    return '';
  }

  function forceHumanVisualSourceSafe(){
    if(CX.dataSource){
      CX.dataSource.mode = 'source_safe_preview';
      CX.dataSource.status = window.CX_TYA_HR_VIVA_SOURCE_SAFE === true ? 'ready' : 'degraded';
      CX.dataSource.sourceRef = 'hr:tya-source-safe-human-visual-dev';
      CX.dataSource.updatedAt = new Date().toISOString();
      CX.dataSource.warnings = [
        'Validación humana DEV source-safe. Para identidad/perfil real usar el carril protegido autenticado.'
      ];
      CX.dataSource.blockers = [];
    }
    if(CX.BRAND) CX.BRAND.demoMode = false;
    window.CX_BACKEND_DATA_SOURCE = 'hr-source-safe';
    window.CX_BACKEND_LAST_STATE = {
      source:'hr-source-safe', at:new Date().toISOString(), tenantId:'tya',
      humanVisual:true, auth:'validated-separately', readOnly:true, writes:false, production:false
    };
  }

  forceHumanVisualSourceSafe();
  if(typeof CX.applyBrand === 'function' && !CX.__corte6PreviewApplyBrandWrapped){
    const originalApplyBrand = CX.applyBrand;
    CX.applyBrand = function(){
      const result = originalApplyBrand.apply(this, arguments);
      if(CX.BACKEND && CX.BACKEND.previewMode === true && CX.BRAND) CX.BRAND.demoMode = false;
      return result;
    };
    CX.__corte6PreviewApplyBrandWrapped = true;
  }

  CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    enabled: false,
    previewMode: true,
    humanVisualSourceSafe: true,
    readOnly: true,
    writeMode: 'disabled',
    enableDataWrites: false,
    enableOperationalWrites: false,
    allowEmptyBackend: true,
    failClosedOnReadError: true,
    preserveCxDataInterface: true,
    defaultProjectId: params.get('cxProjectId') || null,
    hrSourceEndpoint: safeHrSourceEndpoint(),
    devPreviewAuth: {
      enabled: false,
      mode: 'provider-gates-separate-from-human-visual',
      persist: 'session',
      storedCredentialFallback: false,
      requireCustomClaims: true,
      humanCredentialPrompt: false
    }
  });

  window.CX_BACKEND_PREVIEW_LANE = 'source-safe-human-visual';
  forceHumanVisualSourceSafe();
  console.warn('[CX.backend-preview] Carril source-safe humano activo; writes deshabilitados.');
})();
