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

  CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    enabled: true,
    previewMode: true,
    defaultProjectId: (new URLSearchParams(window.location.search || '')).get('cxProjectId') || 'r1',
    devPreviewAuth: {
      enabled: true,
      email: 'preview.r1.20260629081716@cxorbia-dev.example.com',
      passwordStorageKey: 'CXORBIA_DEV_PASSWORD',
      allowPrompt: false,
    },
  });

  console.warn('[CX.backend-preview] Preview DEV autorizado. Adapter Firebase activo solo en esta pagina.');
})();
