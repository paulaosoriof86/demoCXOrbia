/* ============================================================
   CXOrbia · Preview DEV backend gate
   ------------------------------------------------------------
   No se carga en app/index.html.
   Solo se carga en app/index-backend-dev.html.
   Activa el adapter únicamente con token de querystring.
   Corte 4: lectura estricta, vacío permitido y cero escrituras.
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

  function safePreviewEmail(){
    const raw = (params.get('cxPreviewEmail') || '').trim();
    if(!raw) return 'admin.tya.dev@cxorbia-dev.example.com';
    if(!/^[^@\s]+@cxorbia-dev\.example\.com$/.test(raw)){
      console.warn('[CX.backend-preview] Email preview ignorado por dominio no permitido.');
      return 'admin.tya.dev@cxorbia-dev.example.com';
    }
    return raw;
  }

  function safeHrSourceEndpoint(){
    const explicit = (params.get('cxHrSourceEndpoint') || '').trim();
    if(explicit) return explicit;
    if(params.get('cxHrSourceLocal') === '1') return 'http://127.0.0.1:8787/api/hr-source';
    return '';
  }

  /* P0-C4-VIS-01: el preview backend no puede presentarse como Demo aunque Auth temporal
     ya haya sido limpiado. El modo de origen se fija en memoria como backend protegido
     antes del primer render; no se persiste ni se altera el modo normal de app/index.html. */
  function forceProtectedPreviewIdentity(){
    if(CX.dataSource){
      CX.dataSource.mode = 'connected';
      CX.dataSource.status = 'loading';
      CX.dataSource.sourceRef = 'firebase:protected-dev-corte4';
      CX.dataSource.updatedAt = new Date().toISOString();
      CX.dataSource.warnings = ['Preview DEV protegido: lectura únicamente; sin fallback a datos demo/localStorage.'];
      CX.dataSource.blockers = [];
    }
    if(CX.BRAND) CX.BRAND.demoMode = false;
  }

  forceProtectedPreviewIdentity();
  if(typeof CX.applyBrand === 'function' && !CX.__corte4PreviewApplyBrandWrapped){
    const originalApplyBrand = CX.applyBrand;
    CX.applyBrand = function(){
      const result = originalApplyBrand.apply(this, arguments);
      if(CX.BACKEND && CX.BACKEND.previewMode === true && CX.BACKEND.readOnly === true && CX.BRAND) CX.BRAND.demoMode = false;
      return result;
    };
    CX.__corte4PreviewApplyBrandWrapped = true;
  }

  CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    enabled: true,
    previewMode: true,
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
      enabled: true,
      email: safePreviewEmail(),
      passwordStorageKey: 'CXORBIA_DEV_PASSWORD',
    },
  });

  /* Reaplicar después de construir CX.BACKEND para que el wrapper de marca reconozca
     inequívocamente el contexto Corte 4. */
  forceProtectedPreviewIdentity();

  console.warn('[CX.backend-preview] Preview DEV autorizado en modo READ-ONLY estricto y sin fallback demo.');
})();
