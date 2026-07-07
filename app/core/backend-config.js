/* ============================================================
   CXOrbia · Backend config placeholder (Firebase DEV)
   ------------------------------------------------------------
   Regla de oro:
   - No hardcodear T&A en módulos UI.
   - T&A entra como tenant inicial: tenantId = 'tya'.
   - El adapter permanece desactivado hasta validar reglas/importación.
   - No guardar API keys, secretos ni credenciales reales en repo.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const firebaseConfig = {
    apiKey: null,
    authDomain: 'cxorbia-backend-dev.firebaseapp.com',
    projectId: 'cxorbia-backend-dev',
    storageBucket: 'cxorbia-backend-dev.firebasestorage.app',
    messagingSenderId: null,
    appId: null,
    measurementId: null,
  };

  CX.BACKEND = Object.assign({
    provider: 'firebase',
    env: 'dev',
    enabled: false, // Cambiar a true solo tras validar reglas y piloto. No activa producción.
    tenantId: 'tya',
    defaultProjectId: null,
    firebaseConfig,
    configSource: 'repo-placeholder',
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
