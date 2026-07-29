/* ============================================================
   CXOrbia · Backend config placeholder (Firebase DEV)
   ------------------------------------------------------------
   Regla de oro:
   - No hardcodear T&A en módulos UI.
   - T&A entra como tenant inicial: tenantId = 'tya'.
   - El adapter permanece desactivado hasta validar identidad, vacío y Rules.
   - Corte 4 inicia en lectura estricta: cero escrituras y fail-closed.
   - No guardar API keys, secretos ni credenciales reales en repo.
   - No reutilizar cxorbia-backend-dev: la evidencia vigente lo confirmó no vacío.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const firebaseConfig = {
    apiKey: null,
    authDomain: 'cxorbia-tya-dev-260729-c4.firebaseapp.com',
    projectId: 'cxorbia-tya-dev-260729-c4',
    storageBucket: 'cxorbia-tya-dev-260729-c4.firebasestorage.app',
    messagingSenderId: null,
    appId: null,
    measurementId: null,
  };

  CX.BACKEND = Object.assign({
    provider: 'firebase',
    env: 'dev',
    enabled: false, // Candidato DEV no activado; producción permanece intacta.
    tenantId: 'tya',
    defaultProjectId: null,
    firebaseConfig,
    configSource: 'repo-placeholder-new-empty-candidate',
    sdkVersion: '10.12.5',
    readOnly: true,
    writeMode: 'disabled',
    enableDataWrites: false,
    enableOperationalWrites: false,
    allowEmptyBackend: true,
    failClosedOnReadError: true,
    preserveCxDataInterface: true,
    newCleanProjectRequired: true,
    excludedFirebaseProjectIds: ['cxorbia-backend-dev'],
    projectIdentityVerified: false,
    emptyProjectVerified: false,
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
