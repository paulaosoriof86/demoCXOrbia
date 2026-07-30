/* ============================================================
   CXOrbia · Preview DEV backend gate
   ------------------------------------------------------------
   No se carga en app/index.html.
   Solo se carga en app/index-backend-dev.html.
   Activa el preview únicamente con token de querystring.

   Corte 6 · P0 visual 2026-07-30:
   - EL PROTOTIPO MANDA: la validación humana no agrega credenciales ni un login paralelo.
   - Admin/Cliente/Shopper conservan el acceso automático aprobado del producto.
   - La validación humana consume el snapshot HR source-safe ya cargado y rotulado.
   - Firebase Auth/RBAC permanece validado por gates/provider separados; no se degrada ni se abre Rules.
   - Si existe una sesión Firebase válida puede restaurarse en futuros gates, pero esta pantalla no la exige.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const TOKEN = 'YES_PAULA_20260628_PREVIEW_DEV';
  const params = new URLSearchParams(window.location.search || '');
  const token = params.get('cxBackendPreview');
  const stored = sessionStorage.getItem('CXORBIA_PREVIEW_DEV_APPROVED');
  const approved = token === TOKEN || stored === TOKEN;

  if(token === TOKEN){
    sessionStorage.setItem('CXORBIA_PREVIEW_DEV_APPROVED', TOKEN);
  }

  if(!approved){
    console.warn('[CX.backend-preview] Preview DEV no autorizado. Adapter sigue desactivado.');
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
        'Validación humana DEV: acceso UX del prototipo + HR source-safe. Firebase Auth/RBAC se valida por gates separados; no se solicitan credenciales en esta pantalla.'
      ];
      CX.dataSource.blockers = [];
    }
    if(CX.BRAND) CX.BRAND.demoMode = false;
    window.CX_BACKEND_DATA_SOURCE = 'hr-source-safe';
    window.CX_BACKEND_LAST_STATE = {
      source:'hr-source-safe',
      at:new Date().toISOString(),
      tenantId:'tya',
      humanVisual:true,
      auth:'validated-separately',
      readOnly:true,
      writes:false,
      production:false
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
    /* Deliberadamente false en el entrypoint HUMANO: evita convertir Auth en UI o bloquear el prototipo.
       Los gates técnicos de Firestore/Auth permanecen separados y ya tienen evidencia propia. */
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
      humanCredentialPrompt: false,
    },
  });

  forceHumanVisualSourceSafe();
  console.warn('[CX.backend-preview] Human visual DEV: prototipo intacto + HR source-safe; Auth/RBAC provider se valida por gates separados; writes deshabilitados.');
})();
