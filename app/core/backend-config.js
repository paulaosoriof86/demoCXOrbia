/* ============================================================
   CXOrbia · Backend config (Firebase DEV)
   ------------------------------------------------------------
   Regla de oro:
   - No hardcodear T&A en módulos UI.
   - T&A entra como tenant inicial: tenantId = 'tya'.
   - El adapter permanece desactivado hasta validar reglas/importación.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const firebaseConfig = {
    apiKey: 'AIzaSyC4TUtiDuCkJCMzPukwknImUzwzRmV0tSY',
    authDomain: 'cxorbia-backend-dev.firebaseapp.com',
    projectId: 'cxorbia-backend-dev',
    storageBucket: 'cxorbia-backend-dev.firebasestorage.app',
    messagingSenderId: '87461567267',
    appId: '1:87461567267:web:9f0d340b35b9d2038a8a96',
    measurementId: 'G-KL44S2KWLD',
  };

  CX.BACKEND = Object.assign({
    provider: 'firebase',
    env: 'dev',
    enabled: false, // Cambiar a true solo tras validar reglas y piloto. No activa producción.
    tenantId: 'tya',
    defaultProjectId: null,
    firebaseConfig,
    sdkVersion: '10.12.5',
    collections: {
      tenants: 'tenants',
      users: 'users',
      clients: 'clients',
      shoppers: 'shoppers',
      projects: 'projects',
      visits: 'visits',
      postulations: 'postulations',
      questionnaires: 'questionnaires',
      responses: 'responses',
      liquidations: 'liquidations',
      lots: 'lots',
      finance: 'finance',
      documents: 'documents',
      certifications: 'certifications',
      notifications: 'notifications',
      bulletins: 'bulletins',
      bulletinReads: 'bulletinReads',
      automations: 'automations',
      auditLogs: 'auditLogs',
    },
  }, CX.BACKEND || {});
})();
