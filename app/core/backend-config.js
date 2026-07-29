/* ============================================================
   CXOrbia · Backend config placeholder (Firebase DEV)
   ------------------------------------------------------------
   Regla de oro:
   - No hardcodear T&A en módulos UI.
   - T&A entra como tenant inicial: tenantId = 'tya'.
   - El adapter permanece desactivado hasta validar el gate del bloque activo.
   - Corte 4 mantiene lectura estricta: cero escrituras y fail-closed.
   - No guardar API keys, secretos ni credenciales reales en repo.
   - `cxorbia-backend-dev` es el backend DEV canónico de CXOrbia/tenant TyA,
     NO la plataforma legacy TyA a retirar.
   - `cxorbia-tya-dev-260729-c4` queda como sandbox técnico de validación
     y no como destino de materialización Phase A.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const firebaseConfig = {
    // Se conserva el sandbox en este placeholder para reproducibilidad de las
    // pruebas Corte 4 ya ejecutadas. El binding canónico se hará por gate
    // específico después del inventario read-only de cxorbia-backend-dev.
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
    enabled: false, // No runtime switch ni producción desde este placeholder.
    tenantId: 'tya',
    defaultProjectId: null,
    firebaseConfig,
    configSource: 'repo-placeholder-corte4-sandbox-preserved-after-architecture-correction',
    sdkVersion: '10.12.5',
    readOnly: true,
    writeMode: 'disabled',
    enableDataWrites: false,
    enableOperationalWrites: false,
    allowEmptyBackend: true,
    failClosedOnReadError: true,
    preserveCxDataInterface: true,

    // Identidades explícitas para evitar volver a confundir legacy, backend y sandbox.
    canonicalBackendProjectId: 'cxorbia-backend-dev',
    migrationTargetProjectId: 'cxorbia-backend-dev',
    validationSandboxProjectId: 'cxorbia-tya-dev-260729-c4',
    sandboxOnly: true,
    newCleanProjectRequired: false,
    excludedFirebaseProjectIds: [],

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
