/*
  CXOrbia - Real-data preview to CX.data bridge
  Status: draft_safe_not_connected

  This file is intentionally not imported by app/index.html.
  It converts source-safe TyA/Cinepolis staging metadata into a CX.data-compatible
  preview shape without touching app modules, writing Firestore or storing PII.
*/

export const CXDATA_REALDATA_PREVIEW_BRIDGE_STATUS = Object.freeze({
  connectedToFrontend: false,
  runtimePatched: false,
  firestoreWrites: false,
  importsExecuted: false,
  hrWrites: false,
  safeForRepo: true
});

const FORBIDDEN_KEYS = new Set([
  'rawHrWorkbook', 'rawCsv', 'rawDpi', 'rawBankAccount', 'rawPhone', 'rawEmail',
  'signedNdaFile', 'privateHrUrl', 'spreadsheetFileId', 'serviceAccountJson',
  'rawShopperName', 'rawObservations', 'rawEvidence'
]);

export function assertSourceSafeObject(value, path = 'root') {
  if (!value || typeof value !== 'object') return true;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      const err = new Error(`Forbidden raw/sensitive key in CX.data real-data preview bridge: ${path}.${key}`);
      err.code = 'CXDATA_REALDATA_FORBIDDEN_KEY';
      err.key = key;
      throw err;
    }
    if (child && typeof child === 'object') assertSourceSafeObject(child, `${path}.${key}`);
  }
  return true;
}

export function buildCinepolisProjectFromManifest(manifest = {}) {
  assertSourceSafeObject(manifest, 'manifest');
  const tabs = Array.isArray(manifest.manifestTabs) ? manifest.manifestTabs : [];
  const operational = tabs.filter((tab) => tab.tabType === 'operational');
  const countries = [...new Set(operational.map((tab) => tab.country).filter(Boolean))];
  const quincenas = ['Quincena 1', 'Quincena 2'];
  return {
    id: 'cinepolis',
    program: 'cinepolis',
    name: 'Cinepolis',
    client: 'TyA',
    industry: 'Mystery shopping · Cine',
    countries: countries.length ? countries : ['GT', 'HN'],
    currency: { GT: 'Q', HN: 'L' },
    accent: '#1f6feb',
    sucursales: null,
    honorario: { GT: null, HN: null },
    honRecibe: { GT: null, HN: null },
    modelo: 'project_configurable',
    isr: null,
    regalias: null,
    boleto: { GT: null, HN: null },
    combo: 'Configurable por proyecto/visita',
    comboAmt: { GT: null, HN: null },
    scenarios: ['Configurable por HR/proyecto'],
    quincenas,
    nVisitas: operational.reduce((sum, tab) => sum + Number(tab.expectedOperationalRows || 0), 0),
    canales: ['Visita presencial'],
    formato: 'Mystery shopping cine',
    ronda: 'HR source-safe preview',
    restriccion: 'Reglas Q1/Q2 y franja configurables por proyecto.',
    cuestionario: {
      modo: 'configurable',
      url: '',
      label: 'CXOrbia / TyAOnline / externo / link general / link por visita HR'
    },
    pago: {
      logica: 'Liquidacion segun submitido y cruce financiero externo.',
      diasPago: null,
      moneda: 'local'
    },
    hrMap: {
      fuente: 'Google Sheets privado',
      visibility: 'private_config_only',
      cols: ['Pais', 'ID CINEMA', 'Shopping', 'Quincena', 'Shopper Asignado', 'Disponible a partir de', 'Fecha programada', 'Fecha realizada', 'Cuestionario completado', 'Fecha submitido', 'Liquidado']
    },
    geoloc: false,
    conocimiento: 'TyA/Cinepolis. Proyecto normal configurable creado desde fuente HR source-safe preview.',
    sourceSafe: true,
    importStatus: 'manifest_only_not_imported'
  };
}

export function buildPeriodProjectsFromManifest(manifest = {}) {
  assertSourceSafeObject(manifest, 'manifest');
  const tabs = Array.isArray(manifest.manifestTabs) ? manifest.manifestTabs : [];
  return tabs
    .filter((tab) => tab.tabType === 'operational')
    .map((tab) => ({
      id: `cinepolis-${String(tab.periodKey || tab.tabName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      program: 'cinepolis',
      name: `Cinepolis ${tab.tabName}`,
      client: 'TyA',
      industry: 'Mystery shopping · Cine',
      countries: tab.country ? [tab.country] : ['GT', 'HN'],
      currency: { GT: 'Q', HN: 'L' },
      quincenas: ['Quincena 1', 'Quincena 2'],
      nVisitas: Number(tab.expectedOperationalRows || 0),
      ronda: tab.periodKey || tab.tabName,
      hrMap: {
        fuente: 'Google Sheets privado',
        tabName: tab.tabName,
        tabType: tab.tabType,
        schemaStatus: tab.schemaStatus,
        rowCountStatus: tab.rowCountStatus,
        importStatus: tab.importStatus
      },
      cuestionario: {
        modo: 'configurable',
        url: '',
        label: 'Configurable por proyecto/visita'
      },
      pago: {
        logica: 'Liquidacion segun submitido y cruce financiero externo.',
        diasPago: null,
        moneda: 'local'
      },
      sourceSafe: true,
      importStatus: tab.importStatus,
      reviewRequired: tab.importStatus === 'review_required' || tab.rowCountStatus === 'review_required'
    }));
}

export function buildCxDataPreviewShape({ manifest = {}, sanitizedVisits = [], sanitizedShoppers = [], certificationPreview = [], liquidationPreview = [] } = {}) {
  assertSourceSafeObject({ manifest, sanitizedVisits, sanitizedShoppers, certificationPreview, liquidationPreview }, 'input');
  const project = buildCinepolisProjectFromManifest(manifest);
  const periodProjects = buildPeriodProjectsFromManifest(manifest);
  return {
    status: {
      ...CXDATA_REALDATA_PREVIEW_BRIDGE_STATUS,
      mode: 'preview_readonly_not_connected',
      importStatus: 'not_imported',
      sourceSafe: true
    },
    projects: [project, ...periodProjects],
    shoppers: sanitizedShoppers,
    _visitas: sanitizedVisits,
    _posts: [],
    certifications: certificationPreview,
    liquidations: liquidationPreview,
    currentProjectId: project.id,
    warnings: [
      'Preview shape is not connected to runtime CX.data.',
      'No Firestore writes, no HR writes, no production cutover.',
      'Cinepolis is represented as a normal configurable project, not hardcoded global logic.'
    ]
  };
}

export function createCxDataRealDataPreviewBridge(options = {}) {
  return {
    status: CXDATA_REALDATA_PREVIEW_BRIDGE_STATUS,
    buildPreviewShape(input = {}) {
      if (options.allowPreviewBuild !== true) {
        const err = new Error('CX.data real-data preview bridge build is blocked until preview gate enables it.');
        err.code = 'CXDATA_REALDATA_PREVIEW_GATE_BLOCKED';
        throw err;
      }
      return buildCxDataPreviewShape(input);
    },
    canBuildPreview() {
      return options.allowPreviewBuild === true;
    },
    canPatchRuntime() {
      return false;
    },
    canWrite() {
      return false;
    }
  };
}

export default createCxDataRealDataPreviewBridge;
