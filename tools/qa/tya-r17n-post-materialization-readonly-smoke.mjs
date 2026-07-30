#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import admin from 'firebase-admin';

const ROOT = process.cwd();
const PROJECT_ID = 'cxorbia-backend-dev';
const TENANT_ID = 'tya';
const PROJECT_KEY = 'cinepolis';
const AUTH_ID = 'r17n-final-dev-20260730-01';
const OUT_DIR = path.join(ROOT, '.tmp/tya-r17n-post-materialization-readonly-smoke');
const OUT_JSON = path.join(OUT_DIR, 'report.json');
const OUT_MD = path.join(OUT_DIR, 'report.md');

const FILES = {
  request: '.github/cxorbia-firebase-requests/r17n-final-materialize-dev.json',
  execution: 'app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json',
  finalPlan: 'app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json',
  postPlan: 'app/docs/evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json',
  hr: 'app/data/tya-hr-source-safe-current-through-july.js',
  financial: 'app/data/tya-financial-control-source-safe.js',
  certifications: 'app/data/tya-certification-carryover-source-safe.js',
  builder: 'tools/migration/tya-phase-a-build-firestore-materialization-plan.mjs',
  data: 'app/core/data.js',
  backend: 'app/core/backend-firebase.js',
  readGuard: 'app/core/backend-cxdata-read-guard.js',
  readonlyGuard: 'app/core/backend-cxdata-readonly-corte4.js'
};

const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const text = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const sha256 = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const safeId = value => String(value ?? '').trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
const norm = value => String(value ?? '').trim();
const placeholder = value => {
  const v = norm(value).toLowerCase();
  return !v || v === 'shopper protegido' || /^evaluador\s+\d+$/.test(v) || v.includes('(demo)') || v.includes('demo.cxorbia');
};

function fail(message) { throw new Error(message); }
function check(condition, message) { if (!condition) fail(message); }
function stable(value) {
  const walk = v => Array.isArray(v)
    ? v.map(walk)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => [k, walk(v[k])]))
      : v;
  return JSON.stringify(walk(value));
}

for (const rel of Object.values(FILES)) check(fs.existsSync(path.join(ROOT, rel)), `required_file_missing:${rel}`);
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
check(credentialPath && fs.existsSync(credentialPath), 'credential_missing');
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
check(credential.project_id === PROJECT_ID, `wrong_project:${credential.project_id || 'missing'}`);

const request = readJson(FILES.request);
const execution = readJson(FILES.execution);
const finalPlan = readJson(FILES.finalPlan);
const postPlan = readJson(FILES.postPlan);
check(request.enabled === false && request.consumed === true && request.result === 'PASS_R17N_FINAL_DEV_MATERIALIZATION', 'materialization_request_not_consumed_pass');
check(request.authorizationId === AUTH_ID && request.providerWritesActual === 1406 && request.readbackVerified === 1406, 'materialization_request_drift');
check(execution.decision === 'PASS_R17N_FINAL_DEV_MATERIALIZATION', 'execution_evidence_not_pass');
check(execution.execution?.providerWritesActual === 1406 && execution.execution?.readbackVerified === 1406 && execution.execution?.readbackMismatch === 0, 'execution_readback_drift');
check(finalPlan.exactReadyWrites?.count === 1406 && finalPlan.identityResolution?.readyRefs === 208 && finalPlan.identityResolution?.holdRefs === 0, 'final_plan_drift');

fs.mkdirSync(OUT_DIR, { recursive: true });
const baseDir = path.join(OUT_DIR, 'base');
const builder = spawnSync('node', [FILES.builder,
  '--hr', FILES.hr,
  '--financial', FILES.financial,
  '--certifications', FILES.certifications,
  '--out', path.relative(ROOT, baseDir)
], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
check(builder.status === 0, `base_builder_failed:${(builder.stderr || builder.stdout || '').slice(0, 500)}`);
const base = JSON.parse(fs.readFileSync(path.join(baseDir, 'firestore-materialization-plan.json'), 'utf8'));
check(base.operations?.length === 1413, `base_operation_count:${base.operations?.length}`);

const expected = [];
const addExpected = (domain, documentPath) => expected.push({ domain, documentPath });
for (const op of base.operations || []) {
  if (['project', 'hrImport', 'period', 'visit', 'liquidation'].includes(op.domain)) addExpected(op.domain, op.documentPath);
}
const legacyCreates = (postPlan.profileOperations || []).filter(x => x.planState === 'CREATE_CANDIDATE_AFTER_EXACT_AUTH');
for (const item of legacyCreates) addExpected('legacyProfile', `tenants/${TENANT_ID}/shoppers/${item.targetDocId}`);
const hrCurrentCreates = (finalPlan.shopperReferenceMapping || []).filter(x => x.targetKind === 'hr_current_create');
for (const item of hrCurrentCreates) addExpected('currentHrProfile', `tenants/${TENANT_ID}/shoppers/${item.targetShopperId}`);
const certCreates = (postPlan.certificationOperations || []).filter(x => x.state === 'CREATE_CANDIDATE_AFTER_PROFILE_RESOLUTION');
for (const item of certCreates) addExpected('certification', `tenants/${TENANT_ID}/projects/${PROJECT_KEY}/certifications/${safeId(item.certificationId)}`);

const expectedByDomain = expected.reduce((acc, item) => {
  acc[item.domain] = (acc[item.domain] || 0) + 1;
  return acc;
}, {});
const expectedDomainCounts = { project:1, hrImport:1, period:14, visit:616, liquidation:572, legacyProfile:120, currentHrProfile:5, certification:77 };
check(expected.length === 1406, `expected_paths:${expected.length}`);
check(new Set(expected.map(x => x.documentPath)).size === 1406, 'duplicate_expected_paths');
for (const [domain, count] of Object.entries(expectedDomainCounts)) check(expectedByDomain[domain] === count, `expected_domain_${domain}:${expectedByDomain[domain]}`);

admin.initializeApp({ credential: admin.credential.cert(credential), projectId: PROJECT_ID });
const db = admin.firestore();
async function getAll(refs) {
  const out = [];
  for (let i = 0; i < refs.length; i += 150) out.push(...await db.getAll(...refs.slice(i, i + 150)));
  return out;
}

const expectedSnaps = await getAll(expected.map(x => db.doc(x.documentPath)));
let missing = 0, wrongAuthorization = 0, productionTrue = 0;
const actualByDomain = {};
const domainDocs = {};
for (let i = 0; i < expectedSnaps.length; i++) {
  const snap = expectedSnaps[i], meta = expected[i];
  if (!snap.exists) { missing++; continue; }
  const d = snap.data() || {};
  actualByDomain[meta.domain] = (actualByDomain[meta.domain] || 0) + 1;
  (domainDocs[meta.domain] ||= []).push({ id:snap.id, data:d, path:meta.documentPath });
  if (d.materializationAuthorizationId !== AUTH_ID) wrongAuthorization++;
  if (d.production === true) productionTrue++;
}

const tenantSnap = await db.doc(`tenants/${TENANT_ID}`).get();
const projectSnap = await db.doc(`tenants/${TENANT_ID}/projects/${PROJECT_KEY}`).get();
const projectsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').get();
const shoppersSnap = await db.collection('tenants').doc(TENANT_ID).collection('shoppers').get();
const periodsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('periods').get();
const visitsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('visits').get();
const liquidationsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('liquidations').get();
const certificationsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('certifications').get();
const postulationsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('postulations').get();
const applicationsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('applications').get();
const paymentsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('payments').get();
const lotsSnap = await db.collection('tenants').doc(TENANT_ID).collection('projects').doc(PROJECT_KEY).collection('lots').get();

check(tenantSnap.exists, 'tenant_missing');
check(projectSnap.exists, 'canonical_project_missing');
check(missing === 0, `materialized_path_missing:${missing}`);
check(wrongAuthorization === 0, `wrong_materialization_authorization:${wrongAuthorization}`);
check(productionTrue === 0, `production_true_docs:${productionTrue}`);
for (const [domain, count] of Object.entries(expectedDomainCounts)) check(actualByDomain[domain] === count, `actual_domain_${domain}:${actualByDomain[domain]}`);
check(periodsSnap.size === 14, `canonical_period_count:${periodsSnap.size}`);
check(visitsSnap.size === 616, `canonical_visit_count:${visitsSnap.size}`);
check(liquidationsSnap.size === 572, `canonical_liquidation_count:${liquidationsSnap.size}`);
check(certificationsSnap.size === 77, `canonical_certification_count:${certificationsSnap.size}`);
check(paymentsSnap.size === 0 && lotsSnap.size === 0, `payment_or_lot_materialized:${paymentsSnap.size}:${lotsSnap.size}`);
check((tenantSnap.data() || {}).materializationAuthorizationId !== AUTH_ID, 'tenant_was_updated_by_r17n');

const shopperById = new Map(shoppersSnap.docs.map(s => [s.id, s.data() || {}]));
const visitData = visitsSnap.docs.map(s => ({ id:s.id, ...(s.data() || {}) }));
const sourceRefs = new Set();
const targetShopperIds = new Set();
let visitsWithRealName = 0, visitsWithExistingShopper = 0, placeholderVisitNames = 0;
for (const v of visitData) {
  if (v.sourceShopperRef) sourceRefs.add(String(v.sourceShopperRef));
  if (v.shopperId) targetShopperIds.add(String(v.shopperId));
  if (!placeholder(v.shopperName)) visitsWithRealName++; else placeholderVisitNames++;
  if (v.shopperId && shopperById.has(String(v.shopperId))) visitsWithExistingShopper++;
}
let referencedShopperProfilesWithRealName = 0;
for (const id of targetShopperIds) {
  const s = shopperById.get(id) || {};
  const name = s.nombre || s.name || s.displayName || [s.firstName, s.lastName].filter(Boolean).join(' ');
  if (!placeholder(name)) referencedShopperProfilesWithRealName++;
}
const certData = certificationsSnap.docs.map(s => s.data() || {});
const certificationsWithExistingShopper = certData.filter(c => c.shopperId && shopperById.has(String(c.shopperId))).length;
const liquidationData = liquidationsSnap.docs.map(s => s.data() || {});
const liquidationControlOnly = liquidationData.filter(x => x.paymentControlOnly === true).length;
const liquidationsPaid = liquidationData.filter(x => x.paid === true).length;

check(sourceRefs.size === 208, `source_ref_identity_count:${sourceRefs.size}`);
check(targetShopperIds.size === 208, `target_shopper_identity_count:${targetShopperIds.size}`);
check(visitsWithRealName === 616 && placeholderVisitNames === 0, `visit_real_name_surface:${visitsWithRealName}:${placeholderVisitNames}`);
check(visitsWithExistingShopper === 616, `visit_shopper_target_missing:${616 - visitsWithExistingShopper}`);
check(referencedShopperProfilesWithRealName === 208, `referenced_profiles_real_name:${referencedShopperProfilesWithRealName}`);
check(certificationsWithExistingShopper === 77, `cert_shopper_target_missing:${77 - certificationsWithExistingShopper}`);
check(liquidationControlOnly === 572 && liquidationsPaid === 0, `liquidation_control_semantics:${liquidationControlOnly}:${liquidationsPaid}`);

// Exact CX.data adapter smoke in a VM using live Firestore reads as an in-memory provider.
const projectDocs = projectsSnap.docs.map(s => ({ id:s.id, data:s.data() || {} }));
const shopperDocs = shoppersSnap.docs.map(s => ({ id:s.id, data:s.data() || {} }));
const visitDocs = visitsSnap.docs.map(s => ({ id:s.id, data:s.data() || {} }));
const postulationDocs = postulationsSnap.docs.map(s => ({ id:s.id, data:s.data() || {} }));
const applicationDocs = applicationsSnap.docs.map(s => ({ id:s.id, data:s.data() || {} }));
const domReady = [];
const busHandlers = new Map();
const events = [];
const memoryStorage = new Map();
const storage = {
  getItem:k => memoryStorage.has(k) ? memoryStorage.get(k) : null,
  setItem:(k,v) => memoryStorage.set(k, String(v)),
  removeItem:k => memoryStorage.delete(k)
};
const snap = list => ({ docs:list.map(x => ({ id:x.id, data:() => ({ ...x.data }) })) });
const subCollection = name => ({
  get: async () => snap(name === 'visits' ? visitDocs : name === 'postulations' ? postulationDocs : name === 'applications' ? applicationDocs : [])
});
const projectsCollection = {
  get: async () => snap(projectDocs),
  doc: id => ({ collection: name => id === PROJECT_KEY ? subCollection(name) : { get: async () => snap([]) } })
};
const shoppersCollection = { get: async () => snap(shopperDocs), doc:() => ({}) };
const tenantDoc = { collection: name => name === 'projects' ? projectsCollection : name === 'shoppers' ? shoppersCollection : { get: async () => snap([]) } };
const fakeDb = { collection: name => name === 'tenants' ? { doc:() => tenantDoc } : { get: async () => snap([]) } };
const fakeApp = {};
const fakeFirebase = {
  apps: [],
  initializeApp: () => { fakeFirebase.apps.push(fakeApp); return fakeApp; },
  app: () => fakeApp,
  firestore: () => fakeDb
};
const context = {
  console: { log(){}, info(){}, warn(){}, error(){} },
  Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map, Promise,
  setTimeout, clearTimeout,
  localStorage: storage,
  sessionStorage: storage,
  document: { readyState:'loading', addEventListener:(name, fn) => { if (name === 'DOMContentLoaded') domReady.push(fn); } },
  firebase: fakeFirebase,
  CX: {
    BRAND:{ id:'tya', demoMode:false },
    dataSource:{ showFixtures:() => false },
    bus:{
      on(name, fn){ if (!busHandlers.has(name)) busHandlers.set(name, []); busHandlers.get(name).push(fn); },
      emit(name, payload){ events.push({ name, payload }); for (const fn of busHandlers.get(name) || []) fn(payload); }
    }
  }
};
context.window = context;
vm.createContext(context);
vm.runInContext(text(FILES.data), context, { filename:FILES.data, timeout:5000 });
const interfaceBefore = Object.keys(context.CX.data).filter(k => typeof context.CX.data[k] === 'function').sort();
context.CX.BACKEND = {
  provider:'firebase', env:'dev', enabled:true, previewMode:true, readOnly:true, writeMode:'disabled',
  enableDataWrites:false, enableOperationalWrites:false, allowEmptyBackend:true, failClosedOnReadError:true,
  preserveCxDataInterface:true, tenantId:TENANT_ID, defaultProjectId:PROJECT_KEY,
  firebaseConfig:{ projectId:PROJECT_ID }, devPreviewAuth:{ enabled:false },
  collections:{ tenants:'tenants', shoppers:'shoppers', projects:'projects', visits:'visits', postulations:'postulations', applications:'applications' }
};
vm.runInContext(text(FILES.backend), context, { filename:FILES.backend, timeout:5000 });
vm.runInContext(text(FILES.readGuard), context, { filename:FILES.readGuard, timeout:5000 });
vm.runInContext(text(FILES.readonlyGuard), context, { filename:FILES.readonlyGuard, timeout:5000 });
for (const fn of domReady) fn();
const deadline = Date.now() + 10000;
while (Date.now() < deadline) {
  const state = context.CX_BACKEND_LAST_STATE;
  if (state && state.source === 'firestore' && state.empty === false) break;
  await new Promise(resolve => setTimeout(resolve, 25));
}
if (typeof context.CX_BACKEND_RUN_READ_GUARD === 'function') context.CX_BACKEND_RUN_READ_GUARD();
await new Promise(resolve => setTimeout(resolve, 20));
const interfaceAfter = Object.keys(context.CX.data).filter(k => typeof context.CX.data[k] === 'function').sort();
const canonicalPeriodIds = periodsSnap.docs.map(d => d.id).sort();
const adapterPeriodIds = (context.CX.data.periods || []).map(p => String(p.id || '')).filter(Boolean).sort();
const adapterState = {
  source: context.CX_BACKEND_DATA_SOURCE || null,
  fallbackUsed: context.CX_CORTE4_READONLY?.fallbackUsed === true,
  interfacePreserved: stable(interfaceBefore) === stable(interfaceAfter),
  projects: Array.isArray(context.CX.data.projects) ? context.CX.data.projects.length : -1,
  periods: Array.isArray(context.CX.data.periods) ? context.CX.data.periods.length : -1,
  visits: Array.isArray(context.CX.data._visitas) ? context.CX.data._visitas.length : -1,
  shoppers: Array.isArray(context.CX.data.shoppers) ? context.CX.data.shoppers.length : -1,
  posts: Array.isArray(context.CX.data._posts) ? context.CX.data._posts.length : -1,
  currentProjectId: context.CX.data.currentProjectId || null,
  currentPeriodId: context.CX.data.currentPeriodId || null,
  readOnly: context.CX.data.__corte4Readonly === true,
  writeMode: context.CX.data.__backendWriteMode || null,
  readGuardAnomalies: context.CX_BACKEND_READ_GUARD?.anomalies?.length || 0,
  providerProjectRecords: projectsSnap.size,
  canonicalPeriods: canonicalPeriodIds.length,
  adapterPeriodIdsMatchCanonical: stable(adapterPeriodIds) === stable(canonicalPeriodIds),
  currentPeriodIsCanonical: canonicalPeriodIds.includes(String(context.CX.data.currentPeriodId || '')),
  canonicalParentProjectLoaded: context.CX.data.currentProjectId === PROJECT_KEY,
  demoProjectVisible: (context.CX.data.projects || []).some(p => ['retail','banca','food'].includes(String(p.id || '')))
};

const providerComparePass = missing === 0 && wrongAuthorization === 0 && productionTrue === 0 && periodsSnap.size === 14 && visitsSnap.size === 616 && liquidationsSnap.size === 572 && certificationsSnap.size === 77;
const identityPass = sourceRefs.size === 208 && targetShopperIds.size === 208 && visitsWithRealName === 616 && visitsWithExistingShopper === 616 && referencedShopperProfilesWithRealName === 208;
const adapterCorePass = adapterState.source === 'firestore' && adapterState.fallbackUsed === false && adapterState.interfacePreserved && adapterState.visits === 616 && adapterState.canonicalParentProjectLoaded && adapterState.demoProjectVisible === false && adapterState.readOnly && adapterState.writeMode === 'disabled';
const periodModelPass = adapterState.periods === 14 && adapterState.adapterPeriodIdsMatchCanonical && adapterState.currentPeriodIsCanonical;
let decision = 'PASS_R17N_POST_MATERIALIZATION_READONLY_AND_CXDATA_SMOKE';
const blockers = [];
if (!providerComparePass) blockers.push('provider_post_compare_failed');
if (!identityPass) blockers.push('real_identity_smoke_failed');
if (!adapterCorePass) blockers.push('cxdata_core_smoke_failed');
if (!periodModelPass) blockers.push('P0_C5_CXDATA_PERIOD_MODEL_MISMATCH');
if (blockers.length) decision = blockers.includes('P0_C5_CXDATA_PERIOD_MODEL_MISMATCH') ? 'P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH' : 'HOLD_R17N_POST_MATERIALIZATION_READONLY_SMOKE';

const report = {
  schemaVersion:'cxorbia.r17n-post-materialization-readonly-smoke.v1',
  generatedAt:new Date().toISOString(),
  decision,
  target:{ projectId:PROJECT_ID, tenantId:TENANT_ID, projectIdCanonical:PROJECT_KEY },
  evidence:{ materializationAuthorizationId:AUTH_ID, materializationEvidenceSha256:sha256(text(FILES.execution)) },
  postCompare:{
    expectedPaths:1406, existingPaths:1406-missing, missing, wrongAuthorization, productionTrue,
    groups:actualByDomain,
    rootProjectRecords:projectsSnap.size,
    tenantShoppers:shoppersSnap.size,
    canonicalPeriods:periodsSnap.size,
    canonicalVisits:visitsSnap.size,
    canonicalLiquidationControls:liquidationsSnap.size,
    canonicalCertifications:certificationsSnap.size,
    payments:paymentsSnap.size,
    lots:lotsSnap.size,
    tenantUntouchedByAuthorization:(tenantSnap.data() || {}).materializationAuthorizationId !== AUTH_ID
  },
  identity:{
    sourceRefs:sourceRefs.size,
    targetShopperIds:targetShopperIds.size,
    visitsWithRealName,
    visitsWithExistingShopper,
    referencedShopperProfilesWithRealName,
    certificationsWithExistingShopper,
    placeholderVisitNames
  },
  liquidation:{ controls:liquidationData.length, paymentControlOnly:liquidationControlOnly, paidTrue:liquidationsPaid },
  cxdataSmoke:adapterState,
  expectedCxdata:{ projects:1, periods:14, visits:616, currentProjectId:PROJECT_KEY, currentPeriodFromCanonicalSubcollection:true, fallbackUsed:false, readOnly:true, writeMode:'disabled' },
  blockers,
  safety:{ providerReads:true, providerWrites:0, firestoreWrites:0, authWrites:0, storageWrites:0, hrWrites:0, legacyWrites:0, deletes:0, payments:0, deploys:0, merge:false, production:false, rawPiiWrittenToRepo:false, rawPiiWrittenToArtifacts:false }
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(OUT_MD, [
  '# R17N post-materialization read-only + CX.data smoke', '',
  `- Decision: **${decision}**.`,
  `- Provider compare: ${providerComparePass ? 'PASS' : 'HOLD'} · 1,406 exact paths.`,
  `- Identity: ${identityPass ? 'PASS' : 'HOLD'} · 208 refs · 616 visit names real · 208 referenced profiles real.`,
  `- CX.data core: ${adapterCorePass ? 'PASS' : 'HOLD'} · source=${adapterState.source} · visits=${adapterState.visits} · fallback=${adapterState.fallbackUsed}.`,
  `- Period model: ${periodModelPass ? 'PASS' : 'P0'} · canonical=${canonicalPeriodIds.length} · adapter=${adapterState.periods} · current=${adapterState.currentPeriodId || 'null'}.`,
  '- PII cruda en repo/artifact: 0.',
  '- Provider/data/Auth/Storage/HR/legacy writes: 0; deploy/merge/production: 0.',
  '', '## Blockers', ...(blockers.length ? blockers.map(x => `- ${x}`) : ['- none']), ''
].join('\n'), 'utf8');
console.log(JSON.stringify(report));
