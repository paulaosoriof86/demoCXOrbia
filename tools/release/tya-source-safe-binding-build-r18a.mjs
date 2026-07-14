#!/usr/bin/env node
/*
  CXOrbia Phase A R18A — build-time binding for the canonical source-safe snapshot.

  The checked-in V110/V111 source remains unchanged. This builder modifies only the
  checked-out build copy, injects the already-generated source-safe payload and a
  DEV adapter that preserves CX.data compatibility without fabricating financial,
  shopper or runtime-sync facts.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const root = process.cwd();
const htmlPath = path.join(root, valueOf('--html', 'app/index.html'));
const payloadSrc = valueOf('--payload-src', 'data/tya-hr-source-safe-periods.js');
const bridgeSrc = valueOf('--bridge-src', 'core/tya-phase-a-source-safe-preview.js');
const adapterSrc = valueOf('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js');
const reportDir = path.join(root, valueOf('--out', '.tmp/source-safe-binding-r18a'));
const mode = valueOf('--mode', 'apply');

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

if (!fs.existsSync(htmlPath)) fail(`Missing HTML: ${htmlPath}`);
const appDir = path.dirname(htmlPath);
const payloadFile = path.join(appDir, payloadSrc);
const bridgeFile = path.join(appDir, bridgeSrc);
const adapterFile = path.join(appDir, adapterSrc);
if (!fs.existsSync(payloadFile)) fail(`Missing canonical source-safe payload: ${payloadFile}`);
if (!fs.existsSync(bridgeFile)) fail(`Missing source-safe bridge: ${bridgeFile}`);

const adapterCode = `/* CXOrbia Phase A R18A canonical source-safe DEV adapter. Generated at build time. */
window.CX = window.CX || {};
(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = String(window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  const snapshot = window.CX_TYA_HR_SOURCE_SAFE || null;
  const valid = !!(enabled && window.CX && CX.data && snapshot && snapshot.semanticValidation?.pass === true && Array.isArray(snapshot.periods) && snapshot.periods.length && Array.isArray(snapshot.visits));
  window.CX_TYA_VISIBLE_DATA_READY = false;
  if(!valid) return;

  const tenantId = snapshot.tenantId || snapshot.tenantConfig?.tenantId || 'tenant-pending';
  const tenantName = snapshot.tenantName || snapshot.tenantConfig?.tenantName || 'Tenant';
  const rootProjectId = snapshot.projectId || snapshot.projectConfig?.projectId || 'project-pending';
  const projectName = snapshot.projectName || snapshot.projectConfig?.projectName || 'Proyecto';
  const configuredCountries = Array.isArray(snapshot.projectConfig?.countries) ? snapshot.projectConfig.countries.filter(Boolean) : [];
  const configuredCurrency = snapshot.projectConfig?.currency && typeof snapshot.projectConfig.currency === 'object' ? snapshot.projectConfig.currency : {};
  const periodId = key => rootProjectId + '-' + String(key || 'pending');
  const nullableNumber = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
  const nullByCountry = countries => Object.fromEntries((countries || []).map(country => [country, null]));

  const rootProject = {
    id: rootProjectId,
    tenantId,
    projectId: rootProjectId,
    rootProjectId,
    program: rootProjectId,
    programLabel: projectName,
    name: projectName,
    client: tenantName,
    countries: configuredCountries,
    currency: configuredCurrency,
    configurable: true,
    hrSourceId: snapshot.projectConfig?.hrSourceId || null,
    questionnaireMode: snapshot.projectConfig?.questionnaireMode || 'configurable_by_project_or_visit',
    sourceSnapshotAt: snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
    sourceReadMode: snapshot.sourceReadMode || snapshot.source?.accessMode || 'source_safe_snapshot',
    runtimeSyncActive: false,
    sourceSafe: true,
    imported: false,
    production: false
  };

  const periods = snapshot.periods.map(p => ({
    id: periodId(p.key),
    tenantId,
    rootProjectId,
    program: rootProjectId,
    programLabel: projectName,
    projectId: periodId(p.key),
    canonicalProjectId: rootProjectId,
    periodKey: p.key,
    periodo: p.label,
    name: p.fullLabel || p.label || p.key,
    client: tenantName,
    industry: ['Mystery shopping', ...configuredCountries].join(' · '),
    countries: configuredCountries,
    currency: configuredCurrency,
    accent: '#2196d3',
    sucursales: Number(p.total || 0),
    nVisitas: Number(p.total || 0),
    honorario: nullByCountry(configuredCountries),
    honRecibe: nullByCountry(configuredCountries),
    modelo: null,
    isr: null,
    regalias: null,
    boleto: nullByCountry(configuredCountries),
    combo: 'Configurable por visita/fuente',
    comboAmt: nullByCountry(configuredCountries),
    scenarios: [],
    quincenas: ['Quincena 1','Quincena 2'],
    canales: ['Visita presencial'],
    formato: 'Mystery shopping',
    ronda: p.label,
    restriccion: 'Reglas configurables por proyecto.',
    cuestionario: {modo:'configurable',url:'',label:'CXOrbia / plataforma externa / link general / link por visita'},
    pago: {logica:'Liquidación y pago se controlan por estados separados y evidencia financiera.',diasPago:null,moneda:'local'},
    hrMap: {fuente:'Snapshot HR source-safe',cols:['País','ID visita/sucursal','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido']},
    geoloc: false,
    conocimiento: 'Proyecto configurable dentro de un tenant multi-proyecto.',
    sourceSafe: true,
    importStatus: 'source_safe_snapshot_not_imported',
    sourceSnapshotAt: snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
    sourceReadMode: snapshot.sourceReadMode || snapshot.source?.accessMode || 'source_safe_snapshot',
    runtimeSyncActive: false,
    snapshotCounts: p.countries || {}
  }));

  const visits = (snapshot.visits || []).map((v, idx) => ({
    id: v.id || ('hr-source-safe-' + (idx + 1)),
    tenantId,
    rootProjectId,
    canonicalProjectId: rootProjectId,
    projectId: periodId(v.periodKey),
    periodKey: v.periodKey,
    periodLabel: v.periodLabel,
    hrRowId: v.hrRowId,
    sourceTab: v.sourceTab,
    sourceRow: v.sourceRow,
    num: idx + 1,
    sucursal: v.sucursal || 'Sucursal protegida',
    ciudad: v.ciudad || '',
    pais: v.pais || v.country || null,
    country: v.country || v.pais || null,
    currency: v.currency || configuredCurrency[v.pais || v.country] || null,
    quincena: v.quincena || '',
    escenario: v.escenario || v.tipoCompra || '',
    franja: v.franja || '',
    franjaCode: v.franjaCode || null,
    canal: 'Visita presencial',
    formato: v.formato || 'Mystery shopping',
    honorario: nullableNumber(v.honorario),
    boleto: nullableNumber(v.boleto),
    combo: v.tipoCombo || null,
    comboAmt: nullableNumber(v.comboAmt),
    estado: v.estado || 'disponible',
    canonicalState: v.canonicalState,
    operationalState: v.operationalState,
    questionnaireState: v.questionnaireState,
    submissionState: v.submissionState,
    liquidationState: v.liquidationState,
    paymentState: v.paymentState,
    liquidationEvidence: v.liquidationEvidence || null,
    paymentEvidence: v.paymentEvidence || null,
    shopperId: v.shopperId || null,
    shopper: v.shopper || null,
    shopperCode: v.shopperCode || null,
    rango: v.quincena || '',
    disponibleDesde: v.disponibleDesde || null,
    agendada: v.agendada || null,
    realizada: v.realizada || null,
    cuestFecha: v.cuestFecha || null,
    submit: v.submissionState === 'submitted_by_tya',
    submittedAt: v.submittedAt || null,
    assignmentSource: v.assignmentSource || null,
    assignmentSyncStatus: v.assignmentSyncStatus || 'not_assigned',
    lastSyncedAt: null,
    reviewRequired: v.reviewRequired === true,
    reviewReasons: Array.isArray(v.reviewReasons) ? v.reviewReasons : [],
    dataLevel: 'source_safe_visit',
    sourceSnapshotAt: v.sourceSnapshotAt || snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
    sourceReadMode: v.sourceReadMode || snapshot.sourceReadMode || 'source_safe_snapshot',
    runtimeSyncActive: false,
    sourceSafe: true,
    piiProtected: true
  }));

  const shoppers = (snapshot.shoppers || []).map((s, idx) => ({
    id: s.id || ('shopper-protegido-' + (idx + 1)),
    shopperId: s.shopperId || s.id || null,
    code: s.code || ('SHOPPER-REF-' + (idx + 1)),
    nombre: 'Shopper protegido',
    pais: s.pais || null,
    countries: Array.isArray(s.countries) ? s.countries : [],
    ciudad: null,
    estado: null,
    status: null,
    rating: null,
    completion: null,
    preference: null,
    honorario: null,
    dataLevel: s.dataLevel || 'protected_reference',
    operationalProfileAvailable: s.operationalProfileAvailable === true,
    fullAuthorizedProfileAvailable: s.fullAuthorizedProfileAvailable === true,
    visitas: Number(s.visitas || 0),
    realizadas: Number(s.realizadas || 0),
    submitidas: Number(s.submitidas || 0),
    liquidationCandidates: Number(s.liquidationCandidates || 0),
    liquidadas: Number(s.liquidadas || 0),
    postulaciones: null,
    promCuest: null,
    certs: null,
    paymentControlStatus: s.paymentControlStatus || 'not_eligible',
    certificationStatus: s.certificationStatus || 'pending_carryover_overlay',
    reviewStatus: s.reviewStatus || 'pending_operational_profile',
    sourceSnapshotAt: s.sourceSnapshotAt || snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
    runtimeSyncActive: false,
    sourceSafe: true,
    piiProtected: true
  }));

  const posts = visits.filter(v => ['available','assigned_from_hr_pending_platform_sync','scheduled','reschedule_requested'].includes(v.operationalState)).slice(0,80).map((v,i) => ({
    id: 'hr-post-' + (i + 1),
    visitaId: v.id,
    projectId: v.projectId,
    rootProjectId,
    shopperId: v.shopperId,
    shopper: v.shopper || 'Shopper protegido',
    shopperCode: v.shopperCode || '',
    sucursal: v.sucursal,
    ciudad: v.ciudad,
    pais: v.pais,
    quincena: v.quincena,
    franjaCode: v.franjaCode,
    honorario: v.honorario,
    boleto: v.boleto,
    comboAmt: v.comboAmt,
    currency: v.currency,
    fechaProp: v.agendada || v.disponibleDesde,
    disponibleDesde: v.disponibleDesde,
    estado: v.operationalState === 'available' ? 'pendiente' : 'aprobada',
    aprobadaPor: v.shopperId ? 'Fuente HR protegida' : null,
    reprog: v.operationalState === 'reschedule_requested',
    assignmentSource: v.assignmentSource,
    assignmentSyncStatus: v.assignmentSyncStatus,
    reviewRequired: v.reviewRequired,
    sourceSafe: true,
    piiProtected: true
  }));

  const latest = periods.slice().sort((a,b) => String(a.periodKey).localeCompare(String(b.periodKey))).pop() || periods[0];
  CX.BRAND = Object.assign(CX.BRAND || {}, {
    id:tenantId,
    clientName:tenantName,
    name:tenantName,
    tagline:'Phase A controlada',
    theme:tenantId,
    demoMode:false,
    showAITag:true,
    countries:configuredCountries
  });
  CX.data.rootProjects = [rootProject];
  CX.data.projects = periods;
  CX.data.periodCatalog = periods;
  CX.data.shoppers = shoppers;
  CX.data._visitas = visits;
  CX.data._posts = posts;
  CX.data.currentRootProjectId = rootProjectId;
  CX.data.currentPeriodId = latest && latest.id;
  CX.data.currentProjectId = latest && latest.id;
  CX.data.legacyProjectIdCarriesPeriod = true;
  CX.data.sourceMode = 'source_safe_snapshot_r18a';
  CX.data.setCurrentPeriod = function(id){
    const match = this.periodCatalog.find(item => item.id === id);
    if(!match) return false;
    this.currentPeriodId = id;
    this.currentProjectId = id;
    window.dispatchEvent(new CustomEvent('cx:period-changed',{detail:{tenantId,projectId:rootProjectId,periodId:id,periodKey:match.periodKey}}));
    return true;
  };
  CX.data.previewMeta = {
    tenantId,
    projectId:rootProjectId,
    projectName,
    sourceTitle:snapshot.source && snapshot.source.title,
    sourceSnapshotAt:snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
    sourceReadMode:snapshot.sourceReadMode || snapshot.source?.accessMode || 'source_safe_snapshot',
    runtimeSyncActive:false,
    periods:periods.length,
    tabs:snapshot.counts && snapshot.counts.tabs,
    totalVisits:visits.length,
    countries:snapshot.counts && snapshot.counts.byCountry,
    reviewQueue:Number(snapshot.counts?.reviewQueue || 0),
    production:false,
    imported:false,
    sourceSafe:true,
    piiProtected:true,
    note:'Snapshot source-safe generado desde HR. No es sincronización runtime; perfiles shopper completos requieren Auth/roles y fuente autorizada.'
  };
  CX.data.programBase = function(){ return projectName; };
  CX.data.programKey = function(){ return rootProjectId; };
  CX.data.programs = function(){ return [{key:rootProjectId,name:projectName,sample:this.projects[0],periods:this.periodCatalog,project:rootProject}]; };
  CX.data.periodsForProgram = function(key){ return key === rootProjectId ? this.periodCatalog : []; };
  CX.data.currentProgramKey = function(){ return rootProjectId; };

  try {
    localStorage.setItem('cx_demo_mode','off');
    localStorage.setItem('cx_theme',tenantId);
    localStorage.setItem('cx_data_mode','source_safe_snapshot');
    localStorage.removeItem('cx_start_project');
  } catch(e) {}

  if (CX.dataSource) {
    CX.dataSource.mode = 'source_safe_snapshot';
    CX.dataSource.status = 'ready_snapshot_not_runtime';
    CX.dataSource.sourceRef = 'hr-source-safe:' + tenantId + ':' + rootProjectId;
    CX.dataSource.updatedAt = snapshot.sourceSnapshotAt || snapshot.generatedAt || new Date().toISOString();
    CX.dataSource.warnings = [];
    if (Number(snapshot.counts?.reviewQueue || 0) > 0) CX.dataSource.warnings.push('Existen fechas o registros pendientes de revisión canónica.');
    CX.dataSource.warnings.push('Snapshot source-safe: la sincronización runtime permanece inactiva.');
    CX.dataSource.blockers = ['runtime_sync_inactive'];
    CX.dataSource.legacyNote = '';
    CX.dataSource.showFixtures = function(){ return false; };
  }

  window.CX_BACKEND_DEV = true;
  window.CX_TYA_PHASE_A_PREVIEW = true;
  window.CX_TYA_HR_SOURCE_SAFE_SNAPSHOT = true;
  window.CX_TYA_HR_VIVA_SOURCE_SAFE = false;
  window.CX_TYA_RUNTIME_SYNC_ACTIVE = false;
  window.CX_TYA_VISIBLE_DATA_READY = true;
  window.CX_TYA_VISIBLE_DATA_CONTRACT = {
    tenantId,
    rootProjectId,
    projectName,
    periodCount:periods.length,
    uniquePeriodIds:new Set(periods.map(p => p.id)).size,
    visitCount:visits.length,
    shopperCount:shoppers.length,
    currentPeriodId:CX.data.currentPeriodId,
    legacyCurrentProjectId:CX.data.currentProjectId,
    currentPeriodVisits:CX.data.visitas ? CX.data.visitas().length : 0,
    sourceSnapshotAt:snapshot.sourceSnapshotAt || snapshot.generatedAt || null,
    sourceReadMode:snapshot.sourceReadMode || snapshot.source?.accessMode || 'source_safe_snapshot',
    runtimeSyncActive:false,
    numericDateResidues:snapshot.semanticValidation?.numericDateResidues,
    submittedConflated:snapshot.semanticValidation?.submittedConflated,
    inventedShopperAttributes:snapshot.semanticValidation?.fakeShopperAttributes,
    sourceSafe:true,
    imported:false,
    production:false
  };

  function markVisibleState(){
    const badge = document.querySelector('.tb-demo');
    if (badge) badge.innerHTML = '<span class="d"></span> DEV · snapshot HR source-safe';
    document.documentElement.setAttribute('data-cx-tenant',tenantId);
    document.documentElement.setAttribute('data-cx-project',rootProjectId);
    document.documentElement.setAttribute('data-cx-source','source-safe-snapshot');
    document.documentElement.setAttribute('data-cx-runtime-sync','inactive');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markVisibleState);
  else markVisibleState();
})();
`;

if (mode === 'apply') {
  fs.mkdirSync(path.dirname(adapterFile), { recursive: true });
  fs.writeFileSync(adapterFile, adapterCode, 'utf8');
}
if (!fs.existsSync(adapterFile)) fail(`Missing generated canonical source-safe adapter: ${adapterFile}`);

let html = fs.readFileSync(htmlPath, 'utf8');
const payloadTag = `<script src="${payloadSrc}"></script>`;
const bridgeTag = `<script src="${bridgeSrc}"></script>`;
const adapterTag = `<script src="${adapterSrc}"></script>`;
const count = needle => html.split(needle).length - 1;
const before = { payloadTags:count(payloadTag), bridgeTags:count(bridgeTag), adapterTags:count(adapterTag) };
if (before.payloadTags > 1 || before.bridgeTags > 1 || before.adapterTags > 1) fail('Duplicate canonical source-safe binding tags detected before build.', 3);

if (mode === 'apply') {
  if (before.payloadTags === 0) {
    const anchor = '<script src="core/build-lock.js"></script>';
    const fallbackAnchor = '<script src="core/config.js"></script>';
    if (html.includes(anchor)) html = html.replace(anchor, `${payloadTag}\n${anchor}`);
    else if (html.includes(fallbackAnchor)) html = html.replace(fallbackAnchor, `${payloadTag}\n${fallbackAnchor}`);
    else fail('Unable to locate core boot anchor for canonical source-safe payload.', 3);
  }
  if (before.bridgeTags === 0) {
    const anchor = '<script src="core/data.js"></script>';
    if (!html.includes(anchor)) fail('Unable to locate core/data.js compatibility anchor.', 3);
    html = html.replace(anchor, `${anchor}\n${bridgeTag}`);
  }
  if (before.adapterTags === 0) {
    const anchor = '<script src="core/data-source.js"></script>';
    if (!html.includes(anchor)) fail('Unable to locate core/data-source.js adapter anchor.', 3);
    html = html.replace(anchor, `${anchor}\n${adapterTag}`);
  }
  fs.writeFileSync(htmlPath, html, 'utf8');
}

const afterHtml = fs.readFileSync(htmlPath, 'utf8');
const after = {
  payloadTags: afterHtml.split(payloadTag).length - 1,
  bridgeTags: afterHtml.split(bridgeTag).length - 1,
  adapterTags: afterHtml.split(adapterTag).length - 1,
  payloadPosition: afterHtml.indexOf(payloadTag),
  dataPosition: afterHtml.indexOf('<script src="core/data.js"></script>'),
  bridgePosition: afterHtml.indexOf(bridgeTag),
  dataSourcePosition: afterHtml.indexOf('<script src="core/data-source.js"></script>'),
  adapterPosition: afterHtml.indexOf(adapterTag),
  appBootPosition: afterHtml.indexOf('<script src="app.js"></script>')
};
const adapterText = fs.readFileSync(adapterFile, 'utf8');
const semanticChecks = {
  noUniformRating: !adapterText.includes('rating: 4.3'),
  noFakeActiveShopperDefault: !adapterText.includes("estado: s.estado || 'Activo'"),
  noRuntimeLiveClaim: !adapterText.includes('HR viva source-safe'),
  snapshotMetadataPresent: adapterText.includes('runtimeSyncActive:false') && adapterText.includes('sourceSnapshotAt'),
  canonicalStatesPresent: ['operationalState','questionnaireState','submissionState','liquidationState','paymentState'].every(field => adapterText.includes(field))
};
const structuralValid = after.payloadTags === 1 && after.bridgeTags === 1 && after.adapterTags === 1 &&
  after.payloadPosition >= 0 && after.dataPosition > after.payloadPosition &&
  after.bridgePosition > after.dataPosition && after.dataSourcePosition > after.bridgePosition &&
  after.adapterPosition > after.dataSourcePosition && after.appBootPosition > after.adapterPosition;
const valid = structuralValid && Object.values(semanticChecks).every(Boolean);

const report = {
  schemaVersion:'1.0.0',
  reportId:'phase-a-source-safe-binding-build-r18a',
  generatedAt:new Date().toISOString(),
  mode,
  decision:valid ? 'PASS_R18A_CANONICAL_SOURCE_SAFE_BINDING' : 'FAIL_R18A_CANONICAL_SOURCE_SAFE_BINDING',
  html:path.relative(root,htmlPath).replace(/\\/g,'/'),
  adapter:path.relative(root,adapterFile).replace(/\\/g,'/'),
  sourceLockRepoFileModifiedByCommit:false,
  buildCopyModified:mode === 'apply',
  before,
  after,
  semanticChecks,
  gates:{frontendModulesModified:false,coreFilesModified:false,providerCalls:false,firestoreWrites:false,authWrites:false,imports:false,deploy:false,production:false}
};
fs.mkdirSync(reportDir, { recursive:true });
fs.writeFileSync(path.join(reportDir,'source-safe-binding-r18a-report.json'), JSON.stringify(report,null,2) + '\n', 'utf8');
fs.writeFileSync(path.join(reportDir,'source-safe-binding-r18a-report.md'), [
  '# Source-safe canonical binding R18A','',`Decision: ${report.decision}`,
  `HTML build copy: ${report.html}`,`Generated adapter: ${report.adapter}`,
  `Payload tags: ${after.payloadTags}`,`Bridge tags: ${after.bridgeTags}`,`Adapter tags: ${after.adapterTags}`,'',
  'No module/core source changes, provider calls, writes, imports, deploy or production.'
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report,null,2));
process.exitCode = valid ? 0 : 4;
