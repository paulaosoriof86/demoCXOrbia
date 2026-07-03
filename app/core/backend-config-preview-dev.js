/* ============================================================
   CXOrbia · Preview DEV backend gate
   ------------------------------------------------------------
   No se carga en app/index.html.
   Solo se carga en app/index-backend-dev.html.
   Activa el adapter únicamente con token de querystring.
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

  CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    enabled: true,
    previewMode: true,
    defaultProjectId: params.get('cxProjectId') || null,
    hrSourceEndpoint: safeHrSourceEndpoint(),
    devPreviewAuth: {
      enabled: true,
      email: safePreviewEmail(),
      passwordStorageKey: 'CXORBIA_DEV_PASSWORD',
    },
  });

  console.warn('[CX.backend-preview] Preview DEV autorizado. Adapter Firebase activo solo en esta pagina.');
})();
