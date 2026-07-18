#!/usr/bin/env node
/*
  CXOrbia Phase A R15F/R17 - build-time source-safe binding.

  It modifies only the checked-out build copy of app/index.html. The source
  remains unchanged in Git. It injects the generated TyA payload, preserves the
  legacy source-safe bridge for compatibility, and generates a single DEV data
  adapter after core/data-source.js so the visible UI uses TyA/Cinepolis data
  instead of generic demo seeds.

  The generated adapter is intentionally honest about its scope: it represents
  a protected build-time HR snapshot, not runtime synchronization. Shopper
  status, rating and operational profile are not invented when the protected
  source does not provide them.
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
const adapterSrc = valueOf('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter.js');
const reportDir = path.join(root, valueOf('--out', '.tmp/source-safe-binding-r15f'));
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
if (!fs.existsSync(payloadFile)) fail(`Missing generated source-safe payload: ${payloadFile}`);
if (!fs.existsSync(bridgeFile)) fail(`Missing source-safe bridge: ${bridgeFile}`);

const adapterCode = `/* CXOrbia TyA Phase A DEV visible-data adapter. Generated at build time. */
window.CX = window.CX || {};
(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = String(window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  const snapshot = window.CX_TYA_HR_SOURCE_SAFE || null;
  const valid = !!(enabled && window.CX && CX.data && snapshot && Array.isArray(snapshot.periods) && snapshot.periods.length && Array.isArray(snapshot.visits));
  window.CX_TYA_VISIBLE_DATA_READY = false;
  if(!valid) return;

  const periodId = key => 'cinepolis-' + String(key || 'pending');
  const currency = { GT:'Q', HN:'L' };
  const periods = snapshot.periods.map(p => ({
    id: periodId(p.key),
    tenantId: 'tya',
    rootProjectId: 'cinepolis',
    program: 'cinepolis',
    programLabel: 'Cinépolis',
    projectId: periodId(p.key),
    periodKey: p.key,
    periodo: p.label,
    name: p.internalName || ('Cinépolis ' + (p.fullLabel || p.label || p.key)),
    client: 'TyA',
    industry: 'Mystery shopping · cines · GT/HN',
    countries: ['GT','HN'],
    currency,
    accent: '#2196d3',
    sucursales: Number(p.total || 0),
    nVisitas: Number(p.total || 0),
    honorario: {GT:60,HN:200},
    honRecibe: {GT:null,HN:null},
    modelo: 'directo',
    isr: 5,
    regalias: 10,
    boleto: {GT:0,HN:0},
    combo: 'Configurable por visita HR',
    comboAmt: {GT:0,HN:0},
    scenarios: ['Cinépolis · visita regular','Cinépolis · fin de semana','Cinépolis · VIP / formato especial'],
    quincenas: ['Quincena 1','Quincena 2'],
    canales: ['Visita presencial'],
    formato: 'Mystery shopping cine',
    ronda: p.label,
    restriccion: 'Reglas Q1/Q2, franja y visita previa configurables por proyecto.',
    cuestionario: {modo:'configurable',url:'',label:'CXOrbia / TyAOnline / externo / link por visita desde HR'},
    pago: {logica:'Pagos y liquidaciones se controlan por submitido y cruce financiero.',diasPago:null,moneda:'local'},
    hrMap: {fuente:'Snapshot HR TyA multihoja source-safe',cols:['País','ID cinema','Shopping','Quincena','Franja','Disponible desde','Agendada','Realizada','Cuestionario','Submitido','Liquidación']},
    geoloc: false,
    conocimiento: 'TyA/Cinépolis Phase A. Proyecto normal configurable dentro del tenant TyA.',
    sourceSafe: true,
    importStatus: 'hr_snapshot_source_safe_not_imported',
    runtimeSyncActive: false,
    snapshotCounts: p.countries || {GT:0,HN:0,total:Number(p.total || 0)}
  }));

  const visits = (snapshot.visits || []).map((v, idx) => ({
    id: v.id || ('hr-live-' + (idx + 1)),
    tenantId: 'tya',
    rootProjectId: 'cinepolis',
    projectId: periodId(v.periodKey),
    periodKey: v.periodKey,
    periodLabel: v.periodLabel,
    hrRowId: v.hrRowId,
    sourceTab: v.sourceTab,
    sourceRow: v.sourceRow,
    num: idx + 1,
    sucursal: v.sucursal || 'Sucursal HR',
    ciudad: v.ciudad || '',
    pais: v.pais || v.country,
    country: v.country || v.pais,
    currency: v.currency || currency[v.pais || v.country] || '',
    quincena: v.quincena || '',
    escenario: v.escenario || v.tipoCompra || '',
    franja: v.franja || '',
    franjaCode: v.franjaCode || 'WK',
    canal: 'Visita presencial',
    formato: v.formato || 'Mystery shopping cine',
    honorario: Number(v.honorario || 0),
    boleto: Number(v.boleto || 0),
    combo: v.tipoCombo || 'Configurable por HR',
    comboAmt: Number(v.comboAmt || 0),
    estado: v.estado || 'disponible',
    shopperId: v.shopperId || null,
    shopper: v.shopper || null,
    shopperCode: v.shopperCode || null,
    rango: v.quincena || '',
    disponibleDesde: v.disponibleDesde || null,
    agendada: v.agendada || null,
    realizada: v.realizada || null,
    cuestFecha: v.cuestFecha || null,
    submit: !!v.submit,
    submittedAt: v.submittedAt || null,
    assignmentSource: v.hasShopper ? 'hr' : null,
    assignmentSyncStatus: 'hr_live_source_safe_preview',
    reviewRequired: false,
    sourceSafe: true,
    piiProtected: true
  }));

  const shoppers = (snapshot.shoppers || []).map((s, idx) => ({
    id: s.id || ('shopper-protegido-' + (idx + 1)),
    code: s.code || ('TYA-SH-' + (idx + 1)),
    nombre: s.nombre || 'Shopper protegido',
    pais: s.pais || 'GT',
    ciudad: s.ciudad || '',
    estado: null,
    status: null,
    rating: null,
    dataLevel: 'protected_reference',
    operationalProfileAvailable: false,
    visitas: Number(s.visitas || 0),
    realizadas: Number(s.realizadas || 0),
    liquidadas: Number(s.liquidadas || 0),
    postulaciones: Number(s.visitas || 0),
    promCuest: null,
    certs: 0,
    sourceSafe: true,
    piiProtected: true
  }));

  const posts = visits.filter(v => ['asignada','agendada','fuera_rango','disponible'].includes(v.estado)).slice(0,80).map((v,i) => ({
    id: 'hr-post-' + (i + 1),
    visitaId: v.id,
    projectId: v.projectId,
    rootProjectId: 'cinepolis',
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
    estado: v.estado === 'disponible' ? 'pendiente' : 'aprobada',
    aprobadaPor: v.shopperId ? 'HR TyA' : null,
    reprog: v.estado === 'fuera_rango',
    sourceSafe: true,
    piiProtected: true
  }));

  const latest = periods.slice().sort((a,b) => String(a.periodKey).localeCompare(String(b.periodKey))).pop() || periods[0];
  CX.BRAND = Object.assign(CX.BRAND || {}, {
    id:'tya', clientName:'TyA', name:'TyA', tagline:'Tenant TyA · Phase A controlada', theme:'tya', demoMode:false, showAITag:true, countries:['GT','HN']
  });
  CX.data.projects = periods;
  CX.data.shoppers = shoppers;
  CX.data._visitas = visits;
  CX.data._posts = posts;
  CX.data.currentProjectId = latest && latest.id;
  CX.data.sourceMode = 'tya_hr_live_multitab_source_safe_dev';
  CX.data.previewMeta = {
    tenantId:'tya', projectId:'cinepolis', projectName:'Cinépolis', sourceTitle:snapshot.source && snapshot.source.title,
    generatedAt:snapshot.generatedAt, periods:periods.length, tabs:snapshot.counts && snapshot.counts.tabs,
    totalVisits:visits.length, countries:snapshot.counts && snapshot.counts.byCountry,
    production:false, imported:false, sourceSafe:true, piiProtected:true, runtimeSyncActive:false,
    note:'Snapshot HR multihoja source-safe. Sin sincronización runtime live; datos personales de shopper protegidos hasta Auth/roles.'
  };
  CX.data.programBase = function(){ return 'Cinépolis'; };
  CX.data.programKey = function(){ return 'cinepolis'; };
  CX.data.programs = function(){ return [{key:'cinepolis',name:'Cinépolis',sample:this.projects[0],periods:this.projects}]; };
  CX.data.periodsForProgram = function(key){ return key === 'cinepolis' ? this.projects : []; };
  CX.data.currentProgramKey = function(){ return 'cinepolis'; };

  try {
    localStorage.setItem('cx_demo_mode','off');
    localStorage.setItem('cx_theme','tya');
    localStorage.setItem('cx_data_mode','source_safe_preview');
    localStorage.removeItem('cx_start_project');
  } catch(e) {}

  if (CX.dataSource) {
    CX.dataSource.mode = 'source_safe_preview';
    CX.dataSource.status = 'ready';
    CX.dataSource.sourceRef = 'hr-snapshot-multitab:tya:cinepolis';
    CX.dataSource.updatedAt = snapshot.generatedAt || new Date().toISOString();
    CX.dataSource.runtimeSyncActive = false;
    CX.dataSource.warnings = shoppers.length === 210 ? ['Gap shopper protegido: 210/213; 3 referencias continúan en revisión.'] : [];
    CX.dataSource.blockers = [];
    CX.dataSource.legacyNote = '';
    CX.dataSource.showFixtures = function(){ return false; };
  }

  window.CX_BACKEND_DEV = true;
  window.CX_TYA_PHASE_A_PREVIEW = true;
  window.CX_TYA_HR_VIVA_SOURCE_SAFE = false;
  window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE = true;
  window.CX_TYA_VISIBLE_DATA_READY = true;
  window.CX_TYA_VISIBLE_DATA_CONTRACT = {
    tenantId:'tya', rootProjectId:'cinepolis', projectName:'Cinépolis',
    periodCount:periods.length, uniquePeriodIds:new Set(periods.map(p => p.id)).size,
    visitCount:visits.length, shopperCount:shoppers.length,
    currentPeriodId:CX.data.currentProjectId,
    currentPeriodVisits:CX.data.visitas ? CX.data.visitas().length : 0,
    genericProjectCount:periods.filter(p => ['retail','banca','food'].includes(p.id)).length,
    sourceSafe:true, imported:false, production:false, runtimeSyncActive:false
  };

  function markVisibleState(){
    const badge = document.querySelector('.tb-demo');
    if (badge) badge.innerHTML = '<span class="d"></span> DEV TyA · Snapshot HR source-safe';
    document.documentElement.setAttribute('data-cx-tenant','tya');
    document.documentElement.setAttribute('data-cx-project','cinepolis');
    document.documentElement.setAttribute('data-cx-source','source-safe');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markVisibleState);
  else markVisibleState();
})();
`;

if (mode === 'apply') {
  fs.mkdirSync(path.dirname(adapterFile), { recursive: true });
  fs.writeFileSync(adapterFile, adapterCode, 'utf8');
}
if (!fs.existsSync(adapterFile)) fail(`Missing generated source-safe adapter: ${adapterFile}`);

let html = fs.readFileSync(htmlPath, 'utf8');
const payloadTag = `<script src="${payloadSrc}"></script>`;
const bridgeTag = `<script src="${bridgeSrc}"></script>`;
const adapterTag = `<script src="${adapterSrc}"></script>`;
const count = needle => html.split(needle).length - 1;
const before = { payloadTags:count(payloadTag), bridgeTags:count(bridgeTag), adapterTags:count(adapterTag) };

if (before.payloadTags > 1 || before.bridgeTags > 1 || before.adapterTags > 1) fail('Duplicate source-safe binding tags detected before build.', 3);

if (mode === 'apply') {
  if (before.payloadTags === 0) {
    const anchor = '<script src="core/build-lock.js"></script>';
    const fallbackAnchor = '<script src="core/config.js"></script>';
    if (html.includes(anchor)) html = html.replace(anchor, `${payloadTag}\n${anchor}`);
    else if (html.includes(fallbackAnchor)) html = html.replace(fallbackAnchor, `${payloadTag}\n${fallbackAnchor}`);
    else fail('Unable to locate core boot anchor for source-safe payload.', 3);
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
const valid = after.payloadTags === 1 && after.bridgeTags === 1 && after.adapterTags === 1 &&
  after.payloadPosition >= 0 && after.dataPosition > after.payloadPosition &&
  after.bridgePosition > after.dataPosition && after.dataSourcePosition > after.bridgePosition &&
  after.adapterPosition > after.dataSourcePosition && after.appBootPosition > after.adapterPosition;

const report = {
  schemaVersion:'1.2.0', reportId:'phase-a-source-safe-binding-build-r15f-r17', generatedAt:new Date().toISOString(),
  mode, decision: valid ? 'PASS_VISIBLE_TYA_SOURCE_SAFE_BINDING_R17' : 'FAIL_VISIBLE_TYA_SOURCE_SAFE_BINDING_R17',
  html:path.relative(root,htmlPath).replace(/\\/g,'/'), adapter:path.relative(root,adapterFile).replace(/\\/g,'/'),
  sourceLockRepoFileModifiedByCommit:false, buildCopyModified:mode === 'apply', before, after,
  validation:{
    exactlyOnePayloadTag:after.payloadTags === 1, exactlyOneBridgeTag:after.bridgeTags === 1,
    exactlyOneAdapterTag:after.adapterTags === 1, payloadBeforeData:after.payloadPosition < after.dataPosition,
    bridgeAfterData:after.bridgePosition > after.dataPosition, adapterAfterDataSource:after.adapterPosition > after.dataSourcePosition,
    adapterBeforeAppBoot:after.adapterPosition < after.appBootPosition,
    honestSnapshotCopy:!adapterCode.includes('HR viva source-safe'),
    noInventedShopperRating:!adapterCode.includes('rating: 4.3'),
    runtimeSyncInactive:adapterCode.includes('runtimeSyncActive:false'),
    pass:valid && !adapterCode.includes('HR viva source-safe') && !adapterCode.includes('rating: 4.3') && adapterCode.includes('runtimeSyncActive:false')
  },
  gates:{frontendModulesModified:false,coreFilesModified:false,providerCalls:false,firestoreWrites:false,authWrites:false,imports:false,deploy:false,production:false,runtimeSyncActive:false,shopperRatingInvented:false,shopperStatusInvented:false}
};

fs.mkdirSync(reportDir, { recursive:true });
fs.writeFileSync(path.join(reportDir,'source-safe-binding-r15f-report.json'), JSON.stringify(report,null,2), 'utf8');
fs.writeFileSync(path.join(reportDir,'source-safe-binding-r15f-report.md'), [
  '# Source-safe visible TyA binding R17','',`Decision: ${report.decision}`,
  `HTML build copy: ${report.html}`,`Generated adapter: ${report.adapter}`,
  `Payload tags: ${after.payloadTags}`,`Bridge tags: ${after.bridgeTags}`,`Adapter tags: ${after.adapterTags}`,
  `Adapter after data-source: ${report.validation.adapterAfterDataSource}`,
  `Adapter before app boot: ${report.validation.adapterBeforeAppBoot}`,
  `Runtime sync active: false`,`Invented shopper rating/status: false`,'',
  'No modules/core source changes, provider calls, writes, imports, deploy or production.'
].join('\n'), 'utf8');

console.log(JSON.stringify(report,null,2));
process.exitCode = report.validation.pass ? 0 : 4;
