#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';
import { settleCustomRoleAuth, settleVisibleShopperAuth } from './RECOVERY-I3-BROWSER-AUTH-LIFECYCLE-20260919.mjs';

const E = process.env;
const PROJECT = E.PROJECT;
const HOST = String(E.HOSTING_URL || '').replace(/\/$/, '');
const TENANT = E.TENANT_ID;
const PROJECT_ID = E.PROJECT_ID;
const PERIOD_ID = E.PERIOD_ID;
const SOURCE_SHA = E.I3_CERTIFICATION_SOURCE_SHA;
const SOURCE_TREE = E.I3_CERTIFICATION_SOURCE_TREE;
const SOURCE_DIR = E.SOURCE_DIR;
const PRIOR_DIR = E.PRIOR_DIR;
const PRIOR_RUN_ID = E.PRIOR_RUN_ID;
const CERTIFIED_ARTIFACT_SHA256 = E.CERTIFIED_ARTIFACT_SHA256;
const OUT = E.OUT || '.tmp/recovery-i3-live-fixtures';
const RUN_ID = String(E.GITHUB_RUN_ID || 'local');
const PREVIEW = 'YES_PAULA_20260628_PREVIEW_DEV';
const PROTECTED = 'YES_PAULA_20260730_PROTECTED_DEV';
const FULL = 'YES_PAULA_20260731_FULL_PROFILE_DEV';

const str = (v) => String(v ?? '').trim();
const arr = (v) => Array.isArray(v) ? v : [];
const sha = (v) => crypto.createHash('sha256').update(String(v), 'utf8').digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tests = [];
const cleanupTargets = { docs: new Set(), authUids: new Set(), receipts: new Set(), audits: new Set() };
let browser = null;
let failure = null;
let cleanupFailure = null;
fs.mkdirSync(OUT, { recursive: true });

function classify(error) {
  const m = str(error?.message || error);
  const allowed = ['SOURCE_FAILURE','MAPPING_FAILURE','PROVIDER_FAILURE','PERSISTENCE_FAILURE','AUTH_FAILURE','FUNCTIONAL_DEFECT','VISUAL_DEFECT','RELEASE_COMPOSITION_FAILURE','ENVIRONMENT_FAILURE'];
  return allowed.find((x) => m.includes(x)) || 'FUNCTIONAL_DEFECT';
}
function record(id, expected, observed, readback, cleanup, absenceReadback, ok, extra = {}) {
  tests.push({ id, expected, observed, remoteDurableReadback: readback, cleanup, absenceReadback, ok: Boolean(ok), ...extra });
}
function findFile(root, filename) {
  const stack = [root];
  while (stack.length) {
    const p = stack.pop();
    if (!p || !fs.existsSync(p)) continue;
    const s = fs.statSync(p);
    if (s.isFile() && path.basename(p) === filename) return p;
    if (s.isDirectory()) for (const n of fs.readdirSync(p)) stack.push(path.join(p, n));
  }
  return '';
}
function readPrior(filename) {
  const p = findFile(PRIOR_DIR, filename);
  if (!p) throw new Error('SOURCE_FAILURE:PRIOR_EVIDENCE_MISSING:' + filename);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function commandReceiptId(command) {
  return sha(command.tenantId + '\0' + command.projectId + '\0' + command.periodId + '\0' + command.idempotencyKey).slice(0, 40);
}
function commandAuditId(command) {
  return sha(command.idempotencyKey + '\0' + command.commandType + '\0' + str(command.entityId)).slice(0, 40);
}
function command(type, entityType, entityId, idempotencyKey, payload, expectedVersion = 'absent') {
  return {
    version: 'cxorbia-command-adapter-v1', commandType: type, entityType, entityId: entityId || null,
    tenantId: TENANT, projectId: PROJECT_ID, periodId: PERIOD_ID, expectedVersion, idempotencyKey,
    payload: payload || {}, source: 'i3-live-fixture', authorization: { providerEnforcementRequired: true, permission: type },
    audit: { reason: 'I3 live fixture run ' + RUN_ID }
  };
}
function trackCommand(c) {
  cleanupTargets.receipts.add(commandReceiptId(c));
  if (!c.commandType.startsWith('shopper.')) cleanupTargets.audits.add(commandAuditId(c));
}
function manualShopperId(key) {
  return 'shopper_manual_' + sha(TENANT + '\0' + PROJECT_ID + '\0' + key).slice(0, 24);
}
function internalEmail(login) {
  return sha(TENANT + '\0shopper\0' + String(login).toLowerCase()).slice(0, 48) + '@auth.cxorbia.invalid';
}
async function authMissing(uid) {
  try { await auth.getUser(uid); return false; }
  catch (e) { if (str(e?.code) === 'auth/user-not-found') return true; throw e; }
}
async function emailMissing(email) {
  try { await auth.getUserByEmail(email); return false; }
  catch (e) { if (str(e?.code) === 'auth/user-not-found') return true; throw e; }
}
async function firebaseApiKey() {
  const r = await fetch(HOST + '/__/firebase/init.json?ts=' + Date.now(), { cache: 'no-store' });
  const j = await r.json();
  if (!r.ok || !str(j.apiKey)) throw new Error('ENVIRONMENT_FAILURE:FIREBASE_INIT_UNAVAILABLE');
  return str(j.apiKey);
}
async function customTokenToIdToken(customToken, apiKey) {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + encodeURIComponent(apiKey), {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.idToken) throw new Error('AUTH_FAILURE:CUSTOM_TOKEN_EXCHANGE_HTTP_' + r.status);
  return j.idToken;
}
async function passwordToIdToken(email, password, apiKey) {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(apiKey), {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.idToken) throw new Error('AUTH_FAILURE:PASSWORD_LOGIN_HTTP_' + r.status);
  return j.idToken;
}
async function executeHttp(idToken, c) {
  const r = await fetch(HOST + '/v1/cxorbia/commands', {
    method: 'POST', cache: 'no-store',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + idToken, 'cache-control': 'no-store' },
    body: JSON.stringify(c)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, providerAck: false, httpStatus: r.status, ...j };
  return j;
}
function productUrl() {
  return HOST + '/index-backend-dev.html?' + new URLSearchParams({
    cxBackendPreview: PREVIEW, cxProjectId: PROJECT_ID, cxProtectedRuntime: PROTECTED, cxHumanFullVisual: FULL
  }).toString();
}
async function visibleShopperLogin(f) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  try {
    const settled = await settleVisibleShopperAuth({
      page, expectedUid: f.id, rawShopperId: f.id, canonicalShopperId: f.id,
      tenantId: TENANT, projectId: PROJECT_ID, baseUrl: productUrl(),
      login: f.credential.login, password: f.credential.password
    });
    const p = settled.profile || {};
    const c = settled.context || {};
    return { role: c.role, tenantId: c.tenantId, projectIds: c.projectIds || [], shopperId: c.shopperId,
      authority: settled.authority?.applied === true,
      profile: { id: p.id || p.shopperId || null, country: p.pais || p.country || null, phone: p.whatsapp || p.phone || null, email: p.email || '', status: p.estado || null } };
  } finally { await context.close(); }
}

async function shopperVisitReadback(f, visitId) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  try {
    await page.goto(productUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => !!window.firebase?.auth && Array.isArray(window.firebase?.apps) && window.firebase.apps.length > 0, null, { timeout: 90000 });
    await page.waitForFunction(() => typeof window.CX?.backendAuth?.selectedRole === 'function' && window.CX?.app?.__firebaseBrowserAuthWrapped === true && window.CX?.app?.__c6SingleFormRoleGuard === true && document.querySelector('#loginForm')?.__cxSingleFormAuthBound === true && window.CX_TYA_C6_UNIFIED_RUNTIME?.ready === true && window.CX_C6_SHOPPER_AUTH_CLICK_GUARD?.installed === true, null, { timeout: 45000 });
    await page.waitForTimeout(750);
    await page.waitForFunction(() => document.querySelector('#loginForm')?.__cxSingleFormAuthBound === true && typeof window.CX?.backendAuth?.selectedRole === 'function', null, { timeout: 15000 });
    await page.locator('.role-btn[data-role="shopper"]').click({ timeout: 30000 });
    await page.waitForFunction(() => window.CX?.backendAuth?.selectedRole?.() === 'shopper' && document.querySelector('#loginForm')?.dataset?.selectedRole === 'shopper', null, { timeout: 30000 });
    await page.waitForTimeout(500);
    await page.waitForFunction(() => window.CX?.backendAuth?.selectedRole?.() === 'shopper' && document.querySelector('#loginForm')?.dataset?.selectedRole === 'shopper', null, { timeout: 5000 });
    await page.locator('#lgUser').fill(f.credential.login); await page.locator('#lgPass').fill(f.credential.password); await page.locator('#lgSubmit').click();
    try {
      await page.waitForFunction(({ tenantId, projectId, shopperId }) => { const c=window.CX?.backendAuth?.context?.()||{}, ps=Array.isArray(c.projectIds)?c.projectIds.map(String):[]; return c.authenticated===true&&c.role==='shopper'&&c.tenantId===tenantId&&String(c.shopperId||'')===shopperId&&(ps.length===0||ps.includes(projectId)); }, { tenantId:TENANT, projectId:PROJECT_ID, shopperId:f.id }, { timeout:60000 });
    } catch (e) {
      const d=await page.evaluate(()=>({firebaseUid:String(window.firebase?.auth?.().currentUser?.uid||''),context:window.CX?.backendAuth?.context?.()||null,authError:String(document.querySelector('#cxIntegratedAuthError')?.innerText||'').slice(0,240)}));
      throw new Error('AUTH_FAILURE:SHOPPER_VISIT_CONTEXT:' + f.testId + ':' + JSON.stringify(d).slice(0,1200));
    }
    try { await page.waitForFunction(() => window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true, null, { timeout:150000 }); }
    catch (e) {
      const d=await page.evaluate(()=>({authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null,boot:window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||null,gate:window.CX_C6_HR_AUTHORITY_GATE||null,source:String(window.CX?.dataSource?.sourceRef||'')}));
      throw new Error('FUNCTIONAL_DEFECT:SHOPPER_VISIT_HR_AUTHORITY_NOT_RELEASED:' + f.testId + ':' + JSON.stringify(d).slice(0,1600));
    }
    await page.evaluate(() => window.CX.router.nav('misvisitas')); await page.waitForFunction(() => window.CX?.session?.view === 'misvisitas', null, { timeout:30000 }); await sleep(700);
    return await page.evaluate((id) => { const d=window.CX?.data||{}, mine=typeof d.visitsForShopper==='function'?d.visitsForShopper(window.CX?.backendAuth?.context?.().shopperId,false):[]; const hits=mine.filter(v=>String(v.id||v.visitId||'')===id); const all=(Array.isArray(d._visitas)?d._visitas:[]).filter(v=>String(v.id||v.visitId||'')===id); const v=all[0]||hits[0]||null; const facets=v&&typeof d.visitFacets==='function'?d.visitFacets(v):{}; return {mineCount:hits.length,allCount:all.length,available:facets.available===true,assigned:facets.assigned===true,bodyHasVisit:String(document.body?.innerText||'').includes(id)}; }, visitId);
  } finally { await context.close(); }
}

async function adminPage(staffUid) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await settleCustomRoleAuth({
    page, member: { id: staffUid }, role: 'admin', tenantId: TENANT, projectId: PROJECT_ID,
    baseUrl: productUrl(), getCustomToken: () => auth.createCustomToken(staffUid)
  });
  return { context, page };
}
async function adminShopperReadback(staffUid, fixtures) {
  const { context, page } = await adminPage(staffUid);
  const ids = fixtures.map((x) => x.id);
  const capture = async () => page.evaluate((probeIds) => {
    const all = Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers : [];
    const selected = all.filter((x) => probeIds.includes(String(x.id || x.shopperId || ''))).map((x) => ({
      id: String(x.id || x.shopperId || ''), country: x.pais || x.country || null, phone: x.whatsapp || x.phone || null, email: x.email || '', status: x.estado || null
    }));
    const review = Array.isArray(window.CX?.data?.__identityReviewQueue) ? window.CX.data.__identityReviewQueue : [];
    return {
      ctx: window.CX.backendAuth.context(),
      selected,
      rows: probeIds.map((id) => Boolean(document.querySelector('tr[data-sid="' + CSS.escape(id) + '"]'))),
      totalShoppers: all.length,
      presented: (typeof window.CX?.data?.shoppersFor === 'function' ? window.CX.data.shoppersFor() : []).filter((x) => probeIds.includes(String(x.id || x.shopperId || ''))).map((x) => String(x.id || x.shopperId || '')),
      view: String(window.CX?.session?.view || ''),
      period: (() => { const p=typeof window.CX?.data?.period==='function'?window.CX.data.period():null; return { id:String(p?.id||''), countries:Array.isArray(p?.countries)?p.countries.map(String):[] }; })(),
      sourceMode: String(window.CX?.data?.sourceMode || ''),
      sourceRef: String(window.CX?.dataSource?.sourceRef || ''),
      authority: {
        applied: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
        reason: String(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.reason || ''),
        protectedProfiles: Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.protectedProfiles || 0),
        hrShoppers: Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.hrShoppers || 0),
        identityReviewCount: Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.identityReviewCount || 0),
        at: String(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.at || '')
      },
      backend: {
        source: String(window.CX_BACKEND_LAST_STATE?.source || ''),
        shoppers: Number(window.CX_BACKEND_LAST_STATE?.counts?.shoppers || 0),
        projects: Number(window.CX_BACKEND_LAST_STATE?.counts?.projects || 0)
      },
      reviewMatches: review.filter((x) => probeIds.includes(String(x?.id || x?.shopperId || x?.canonicalShopperId || ''))).map((x) => ({
        id: String(x?.id || x?.shopperId || x?.canonicalShopperId || ''),
        reason: String(x?.reason || x?.identityReviewReason || '')
      }))
    };
  }, ids);
  try {
    await page.evaluate(() => window.CX.router.nav('shoppers'));
    await page.waitForFunction(() => window.CX?.session?.view === 'shoppers', null, { timeout: 30000 });
    await sleep(900);
    const initial = await capture();

    let spontaneous = false;
    try {
      await page.waitForFunction((probeIds) => {
        const all = Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers : [];
        const present = new Set(all.map((x) => String(x.id || x.shopperId || '')));
        return probeIds.every((id) => present.has(String(id)));
      }, ids, { timeout: 10000 });
      spontaneous = true;
    } catch (_) {}

    const afterWait = await capture();
    let refreshInvoked = false;
    let refreshReadback = null;
    let postRefreshAuthority = null;
    if (!spontaneous) {
      refreshInvoked = true;
      const priorAuthorityAt = String(afterWait.authority?.at || '');
      refreshReadback = await page.evaluate(async (probeIds) => {
        if (typeof window.CX?.backend?.refresh !== 'function') return { refreshAvailable:false, selected:[], totalShoppers:0 };
        await window.CX.backend.refresh();
        const all = Array.isArray(window.CX?.data?.shoppers) ? window.CX.data.shoppers : [];
        return {
          refreshAvailable:true,
          selected: all.filter((x) => probeIds.includes(String(x.id || x.shopperId || ''))).map((x) => ({
            id:String(x.id || x.shopperId || ''), country:x.pais || x.country || null, phone:x.whatsapp || x.phone || null, email:x.email || '', status:x.estado || null
          })),
          totalShoppers:all.length,
          sourceMode:String(window.CX?.data?.sourceMode || ''),
          sourceRef:String(window.CX?.dataSource?.sourceRef || '')
        };
      }, ids);
      try {
        await page.waitForFunction((priorAt) => {
          const a = window.CX_PROTECTED_AUTH_HR_AUTHORITY || {};
          return a.applied === true && String(a.at || '') && String(a.at || '') !== String(priorAt || '');
        }, priorAuthorityAt, { timeout: 45000 });
      } catch (_) {}
      await sleep(1200);
      postRefreshAuthority = await capture();
    }

    const base = await capture();
    base.probe = { initial, afterWait, spontaneous, refreshInvoked, refreshReadback, postRefreshAuthority };
    const hn = fixtures.find((x) => x.profile.pais === 'HN');
    const row = page.locator('tr[data-sid="' + hn.id + '"]');
    if (await row.count()) { await row.first().click(); await sleep(400); base.hnDetail = await page.evaluate(() => String(document.querySelector('.cx-modal')?.innerText || '')); }
    return base;
  } finally { await context.close(); }
}
async function adminPostulationReadback(staffUid, applicationId, expectedPresent) {
  const { context, page } = await adminPage(staffUid);
  try {
    await page.evaluate(() => window.CX.router.nav('postulaciones'));
    await page.waitForFunction(() => window.CX?.session?.view === 'postulaciones', null, { timeout: 30000 });
    await sleep(800);
    return await page.evaluate(({ id, present }) => {
      const posts = Array.isArray(window.CX?.data?._posts) ? window.CX.data._posts : [];
      const count = posts.filter((x) => String(x.id || x.applicationId || x.postulationId || '') === id).length;
      return { count, expectedPresent: present, ok: present ? count === 1 : count === 0 };
    }, { id: applicationId, present: expectedPresent });
  } finally { await context.close(); }
}
async function cleanupAll() {
  for (const p of [...cleanupTargets.docs].reverse()) { const r = db.doc(p); if ((await r.get()).exists) await r.delete(); }
  for (const id of cleanupTargets.receipts) { const r = tenant.collection('commandReceipts').doc(id); if ((await r.get()).exists) await r.delete(); }
  for (const id of cleanupTargets.audits) { const r = tenant.collection('entityAuditTrail').doc(id); if ((await r.get()).exists) await r.delete(); }
  for (const uid of cleanupTargets.authUids) { try { await auth.deleteUser(uid); } catch (e) { if (str(e?.code) !== 'auth/user-not-found') throw e; } }
}
async function absenceReadback() {
  const out = { docs: {}, auth: {} };
  for (const p of cleanupTargets.docs) out.docs[p] = !(await db.doc(p).get()).exists;
  for (const id of cleanupTargets.receipts) out.docs['receipt:' + id] = !(await tenant.collection('commandReceipts').doc(id).get()).exists;
  for (const id of cleanupTargets.audits) out.docs['audit:' + id] = !(await tenant.collection('entityAuditTrail').doc(id).get()).exists;
  for (const uid of cleanupTargets.authUids) out.auth[uid] = await authMissing(uid);
  out.ok = Object.values(out.docs).every(Boolean) && Object.values(out.auth).every(Boolean);
  return out;
}

if (!PROJECT || !HOST || !TENANT || !PROJECT_ID || !PERIOD_ID || !SOURCE_SHA || !SOURCE_TREE || !SOURCE_DIR || !PRIOR_DIR) throw new Error('ENVIRONMENT_FAILURE:LIVE_FIXTURE_ENV_INCOMPLETE');
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const auth = getAuth();
const db = getFirestore();
const tenant = db.collection('tenants').doc(TENANT);
const project = tenant.collection('projects').doc(PROJECT_ID);
const shopperModule = await import(pathToFileURL(path.join(SOURCE_DIR, 'backend/runtime/cxorbia-shopper-command-provider-v1.mjs')).href);
let hrRevision = '';
let certifiedProofHrRevision = '';
let certificationLiveReadbackRevision = '';

try {
  const manifest = readPrior('i3-certification-manifest.json');
  const human = readPrior('human-live-acceptance.json');
  const probes = readPrior('i3-functional-probes.json');
  const probe = probes.probe || {};
  if (!(manifest.decision === 'PASS_I3_ONE_ARTIFACT_READY_FOR_GATE21' && manifest.i3CertificationSourceSha === SOURCE_SHA && manifest.i3CertificationSourceTree === SOURCE_TREE && manifest.artifactSha256 === CERTIFIED_ARTIFACT_SHA256 && manifest.buildCount === 1 && manifest.rebuildAfterCertification === false && manifest.production === false && human.decision === 'PASS_I3_HUMAN_LIVE_ACCEPTANCE' && probes.decision === 'PASS_I3_ATOMIC_FUNCTIONAL_PROBES' && human.routeInventory?.expectedRoleRouteEntries === 56)) throw new Error('RELEASE_COMPOSITION_FAILURE:RUN238_BINDING_MISMATCH');

  const shopperRoutes = arr(human.routes).filter((x) => x.role === 'shopper' && !x.failed);
  const clientRoutes = arr(human.routes).filter((x) => x.role === 'cliente' && !x.failed);
  const historyOk = arr(human.historyCandidates).length > 0 && shopperRoutes.some((x) => x.id === 'miperfil') && shopperRoutes.some((x) => x.id === 'misvisitas') && probe.dashboardPeriodsOk === true;
  record('6_HISTORICO_KPIS', 'Same live HR revision drives profile/history/multiple periods/KPIs', { historyCandidates: human.historyCandidates, dashboardPeriodsOk: probe.dashboardPeriodsOk }, { priorRunId: PRIOR_RUN_ID, sourceSha: SOURCE_SHA }, 'No HR fixture written', 'No HR cleanup required', historyOk, { inheritedFromRun238: true });
  const reservationOk = probe.reservations?.ok === true && probe.reservations?.source === 'durable_provider';
  record('9_RESERVA', 'create/status/delete with provider ACK and durable readback', probe.reservations || null, { priorRunId: PRIOR_RUN_ID, sourceSha: SOURCE_SHA }, 'Run 238 reservation cleanup already executed', 'Run 238 evidence reports deleted=true', reservationOk, { inheritedFromRun238: true });
  record('10_CLIENTE', 'Client login/scope/authorized modules; no cross-role access', { clientRouteCount: clientRoutes.length, decision: human.decision }, { priorRunId: PRIOR_RUN_ID, sourceSha: SOURCE_SHA }, 'No client mutation', 'No cleanup required', clientRoutes.length > 0, { inheritedFromRun238: true });

  const apiKey = await firebaseApiKey();
  const members = (await tenant.collection('users').get()).docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
  const staff = members.find((m) => m.active === true && m.authNamespace === 'staff' && m.role === 'super') || members.find((m) => m.active === true && m.authNamespace === 'staff' && m.role === 'admin' && arr(m.projectIds).map(String).includes(PROJECT_ID));
  if (!staff) throw new Error('AUTH_FAILURE:STAFF_PRINCIPAL_MISSING');
  await auth.getUser(staff.id);
  const staffToken = await customTokenToIdToken(await auth.createCustomToken(staff.id), apiKey);

  const proofPayload = readPrior('hr-proof-run387.json');
  const proofHr = proofPayload.snapshot || proofPayload.data || proofPayload;
  certifiedProofHrRevision = str(proofHr?._runtime?.revision || proofHr?.sourceRevision || proofPayload?._runtime?.revision);
  certificationLiveReadbackRevision = str(manifest.currentLiveHrRevisionAtCertification);
  if (!/^[a-f0-9]{64}$/.test(certifiedProofHrRevision)) throw new Error('SOURCE_FAILURE:CERTIFIED_PROOF_HR_REVISION_INVALID');
  if (!/^[a-f0-9]{64}$/.test(certificationLiveReadbackRevision)) throw new Error('SOURCE_FAILURE:CERTIFICATION_LIVE_HR_REVISION_INVALID');
  if (str(manifest.certifiedProofHrRevision) !== certifiedProofHrRevision) throw new Error('RELEASE_COMPOSITION_FAILURE:CERTIFIED_PROOF_HR_MANIFEST_MISMATCH');
  if (str(human.sourceRevision) !== certificationLiveReadbackRevision) throw new Error('RELEASE_COMPOSITION_FAILURE:CERTIFICATION_LIVE_HR_HUMAN_MISMATCH');

  const liveUrl = HOST + '/api/' + encodeURIComponent(TENANT) + '/' + encodeURIComponent(PROJECT_ID) + '/hr-live?format=json&livefixture=' + encodeURIComponent(RUN_ID) + '&ts=' + Date.now();
  const liveResp = await fetch(liveUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache, no-store, max-age=0' } });
  if (!liveResp.ok) throw new Error('PROVIDER_FAILURE:LIVE_FIXTURE_HR_HTTP_' + liveResp.status);
  const hrPayload = await liveResp.json();
  const hr = hrPayload.snapshot || hrPayload.data || hrPayload;
  hrRevision = str(hr?._runtime?.revision || hr?.sourceRevision || hrPayload?._runtime?.revision);
  if (!/^[a-f0-9]{64}$/.test(hrRevision)) throw new Error('SOURCE_FAILURE:LIVE_FIXTURE_HR_REVISION_INVALID');
  fs.writeFileSync(path.join(OUT, 'hr-live-fixture.json'), JSON.stringify(hrPayload, null, 2) + '\n');

  const metaResp = await fetch(HOST + '/api/' + encodeURIComponent(TENANT) + '/' + encodeURIComponent(PROJECT_ID) + '/hr-live?format=meta&livefixture=' + encodeURIComponent(RUN_ID) + '&ts=' + Date.now(), { cache: 'no-store', headers: { 'cache-control': 'no-cache, no-store, max-age=0' } });
  if (!metaResp.ok) throw new Error('PROVIDER_FAILURE:LIVE_FIXTURE_HR_META_HTTP_' + metaResp.status);
  const hrMeta = await metaResp.json();
  if (str(hrMeta.revision) !== hrRevision) throw new Error('PROVIDER_FAILURE:LIVE_FIXTURE_HR_META_REVISION_MISMATCH');
  if (!(hrMeta.ok === true && hrMeta.revisionStable === true && hrMeta.sourceSafe === true && hrMeta.shopperReconciliation?.providerAck === true && hrMeta.visitReconciliation?.providerAck === true && hrMeta.hrWrites === false && hrMeta.production === false && hrMeta.refreshError == null)) {
    throw new Error('PROVIDER_FAILURE:LIVE_FIXTURE_HR_HEALTH_INVALID');
  }
  fs.writeFileSync(path.join(OUT, 'hr-live-fixture-meta.json'), JSON.stringify(hrMeta, null, 2) + '\n');

  const suffix = RUN_ID.slice(-6);
  const fixtureDefs = [
    { testId: '1_SHOPPER_GT', key: 'i3-gt-' + RUN_ID, profile: { firstName: 'Nora', lastName: 'Pruebag' + suffix, nombre: 'Nora Pruebag' + suffix, whatsapp: '+50255550101', phone: '+50255550101', pais: 'GT', country: 'GT', email: '', estado: 'Activo', sourceType: 'platform', createdVia: 'live-fixture' } },
    { testId: '2_SHOPPER_HN', key: 'i3-hn-' + RUN_ID, profile: { firstName: 'Bruno', lastName: 'Pruebah' + suffix, nombre: 'Bruno Pruebah' + suffix, whatsapp: '+50499990101', phone: '+50499990101', pais: 'HN', country: 'HN', email: 'fixture.hn.' + RUN_ID + '@example.invalid', estado: 'Activo', sourceType: 'platform', createdVia: 'live-fixture' } },
    { testId: '3_NOMBRE_TILDE', key: 'i3-accent-' + RUN_ID, profile: { firstName: 'César', lastName: 'CastilloI3' + suffix, nombre: 'César CastilloI3' + suffix, whatsapp: '+50255550102', phone: '+50255550102', pais: 'GT', country: 'GT', email: '', estado: 'Activo', sourceType: 'platform', createdVia: 'live-fixture' } },
    { testId: '4_NOMBRE_COMPUESTO', key: 'i3-compound-' + RUN_ID, profile: { firstName: 'Zoraida María', lastName: 'Pruebac' + suffix + ' López', nombre: 'Zoraida María Pruebac' + suffix + ' López', whatsapp: '+50255550103', phone: '+50255550103', pais: 'GT', country: 'GT', email: '', estado: 'Activo', sourceType: 'platform', createdVia: 'live-fixture' } }
  ];
  for (const f of fixtureDefs) {
    f.credential = shopperModule.shopperCredentialRule(f.profile);
    f.id = manualShopperId(f.key);
    f.uid = shopperModule.stableShopperUid(TENANT, f.id);
    f.internalEmail = internalEmail(f.credential.login);
    if (!f.credential.ok || !(await authMissing(f.uid)) || !(await emailMissing(f.internalEmail)) || (await tenant.collection('shoppers').doc(f.id).get()).exists) throw new Error('ENVIRONMENT_FAILURE:FIXTURE_COLLISION:' + f.testId);
  }
  const accent = fixtureDefs.find((x) => x.testId === '3_NOMBRE_TILDE');
  const compound = fixtureDefs.find((x) => x.testId === '4_NOMBRE_COMPUESTO');
  const exactAccent = shopperModule.shopperCredentialRule({ firstName: 'César', lastName: 'Castillo', nombre: 'César Castillo' });
  if (!exactAccent.ok || exactAccent.login !== 'cesar.castillo' || exactAccent.password !== 'Cesar123*') throw new Error('FUNCTIONAL_DEFECT:ACCENT_CREDENTIAL_RULE_EXACT_OWNER');
  if (!accent.credential.login.startsWith('cesar.castilloi3') || accent.credential.password !== 'Cesar123*') throw new Error('FUNCTIONAL_DEFECT:ACCENT_CREDENTIAL_RULE_LIVE_FIXTURE');
  if (compound.credential.login.includes('maria') || compound.credential.login.includes('lopez') || compound.credential.login.split('.').length !== 2) throw new Error('FUNCTIONAL_DEFECT:COMPOUND_CREDENTIAL_RULE');

  for (const f of fixtureDefs) {
    const c = command('shopper.create', 'shopper', null, f.key, { profile: f.profile }); trackCommand(c);
    const ack = await executeHttp(staffToken, c);
    if (!(ack.ok === true && ack.providerAck === true && ack.entityId === f.id)) throw new Error('PROVIDER_FAILURE:SHOPPER_CREATE:' + f.testId + ':' + str(ack.code));
    cleanupTargets.authUids.add(f.uid);
    cleanupTargets.docs.add('tenants/' + TENANT + '/users/' + f.uid);
    cleanupTargets.docs.add('tenants/' + TENANT + '/shoppers/' + f.id);
    cleanupTargets.docs.add('tenants/' + TENANT + '/shopperIdentityCrosswalk/' + f.id);
    if (!str(ack.identityLinkId) || ack.platformCreatedAuthority !== true) throw new Error('PERSISTENCE_FAILURE:SHOPPER_PLATFORM_IDENTITY_AUTHORITY_ACK:' + f.testId);
    cleanupTargets.docs.add('tenants/' + TENANT + '/shopperIdentityLinks/' + str(ack.identityLinkId));
    const [ps, ms, ls] = await Promise.all([
      tenant.collection('shoppers').doc(f.id).get(),
      tenant.collection('users').doc(f.uid).get(),
      tenant.collection('shopperIdentityLinks').doc(str(ack.identityLinkId)).get()
    ]);
    const p = ps.data() || {}, m = ms.data() || {}, l = ls.data() || {};
    const linkOk = ls.exists && str(l.canonicalShopperId) === f.id && str(l.sourceSystem) === 'platform' && str(l.authorityType) === 'platform_created' && l.periodIndependent === true && l.providerAck === true;
    const readbackOk = ps.exists && ms.exists && linkOk && str(p.visibleLogin) === f.credential.login && str(p.pais || p.country) === f.profile.pais && str(p.whatsapp || p.phone) === f.profile.whatsapp && str(p.email) === str(f.profile.email) && str(m.role) === 'shopper' && str(m.authNamespace) === 'shopper';
    if (!readbackOk) throw new Error('PERSISTENCE_FAILURE:SHOPPER_READBACK:' + f.testId);
  }

  browser = await chromium.launch({ headless: true });
  for (const f of fixtureDefs) {
    const login = await visibleShopperLogin(f);
    const ok = login.authority === true && login.role === 'shopper' && login.tenantId === TENANT && login.shopperId === f.id && login.profile.id === f.id && login.profile.country === f.profile.pais && str(login.profile.phone) === f.profile.whatsapp && str(login.profile.email) === str(f.profile.email);
    if (!ok) throw new Error('AUTH_FAILURE:VISIBLE_SHOPPER_LOGIN:' + f.testId);
    const expected = f.testId === '3_NOMBRE_TILDE' ? { exactCanonicalLogin: 'cesar.castillo', liveLogin: f.credential.login, password: 'Cesar123*', accentRemoved: true } : f.testId === '4_NOMBRE_COMPUESTO' ? { login: f.credential.login, rule: 'first name + first surname only' } : { country: f.profile.pais, phone: f.profile.whatsapp, emailOptional: true };
    record(f.testId, expected, { providerAck: true, login: f.credential.login, passwordLoginPassed: true, visibleProfile: login.profile }, { authUidFingerprint: sha(f.uid).slice(0, 18), projectScope: login.projectIds }, 'Shared synthetic cleanup pending', 'Shared absence readback pending', true);
  }

  const admin = await adminShopperReadback(staff.id, fixtureDefs);
  const hn = fixtureDefs.find((x) => x.profile.pais === 'HN');
  const rowChecks = fixtureDefs.map((f, i) => ({ id: f.id, rowVisible: admin.rows[i] === true }));
  const selectedChecks = fixtureDefs.map((f) => {
    const row = admin.selected.find((x) => x.id === f.id) || null;
    return {
      id: f.id,
      present: !!row,
      countryOk: !!row && row.country === f.profile.pais,
      phoneOk: !!row && str(row.phone) === f.profile.whatsapp,
      emailOk: !!row && str(row.email) === str(f.profile.email),
      statusOk: !!row && str(row.status) === 'Activo'
    };
  });
  const rowsVisible = rowChecks.every((x) => x.rowVisible);
  const selectedProfilesOk = selectedChecks.every((x) => x.present && x.countryOk && x.phoneOk && x.emailOk && x.statusOk);
  const hnDetailPhoneOk = str(admin.hnDetail).includes(hn.profile.whatsapp);
  const hnDetailEmailOk = str(admin.hnDetail).includes(hn.profile.email);
  const denied = command('shopper.create', 'shopper', null, 'i3-cross-project-' + RUN_ID, { profile: { firstName: 'Scope', lastName: 'Denied', nombre: 'Scope Denied', whatsapp: '0', pais: 'GT' } });
  denied.projectId = 'not-' + PROJECT_ID;
  const deniedAck = await executeHttp(staffToken, denied);
  const crossProjectBlocked = deniedAck.ok !== true && deniedAck.providerAck !== true;
  const adminDiagnostic = {
    schemaVersion: 'cxorbia.i3.admin-fixture-diagnostic.v1',
    rowsVisible,
    selectedProfilesOk,
    hnDetailPhoneOk,
    hnDetailEmailOk,
    crossProjectBlocked,
    rowChecks,
    selectedChecks,
    selected: admin.selected,
    context: { role: admin.ctx.role, tenantId: admin.ctx.tenantId, projectIds: admin.ctx.projectIds },
    crossProject: { ok: deniedAck.ok === true, providerAck: deniedAck.providerAck === true, code: str(deniedAck.code) },
    probe: admin.probe || {},
    finalPresentation: { presented: admin.presented || [], view: admin.view || '', period: admin.period || null, sourceMode: admin.sourceMode || '', sourceRef: admin.sourceRef || '', authority: admin.authority || {}, backend: admin.backend || {} },
    production: false
  };
  fs.writeFileSync(path.join(OUT, 'admin-fixture-diagnostic.json'), JSON.stringify(adminDiagnostic, null, 2) + '\n');
  const adminOk = rowsVisible && selectedProfilesOk && hnDetailPhoneOk && hnDetailEmailOk && crossProjectBlocked;
  record('5_PERFIL_ADMIN', 'Authorized Admin sees identity/country/phone/email/status; cross-project command blocked', adminDiagnostic, { role: admin.ctx.role, tenantId: admin.ctx.tenantId, projectIds: admin.ctx.projectIds }, 'Shared synthetic cleanup pending', 'Shared absence readback pending', adminOk, { diagnosticVersion: 'v1' });
  const adminProbe = admin.probe || {};
  const refreshSelected = Array.isArray(adminProbe.refreshReadback?.selected) ? adminProbe.refreshReadback.selected.length : 0;
  const postRefreshSelected = Array.isArray(adminProbe.postRefreshAuthority?.selected) ? adminProbe.postRefreshAuthority.selected.length : 0;
  const postProtectedProfiles = Number(adminProbe.postRefreshAuthority?.authority?.protectedProfiles || 0);
  if (!rowsVisible || !selectedProfilesOk) {
    if (adminProbe.spontaneous === true) {
      if (!selectedProfilesOk) throw new Error('FUNCTIONAL_DEFECT:ADMIN_FIXTURE_READ_MODEL_MISMATCH_AFTER_AUTOMATIC_SYNC');
      throw new Error('VISUAL_DEFECT:ADMIN_FIXTURE_ROWS_NOT_VISIBLE_AFTER_AUTOMATIC_SYNC');
    }
    if (adminProbe.refreshInvoked === true && refreshSelected === fixtureDefs.length && postRefreshSelected === fixtureDefs.length) {
      const authorityAdvanced = String(adminProbe.postRefreshAuthority?.authority?.at || '') && String(adminProbe.postRefreshAuthority?.authority?.at || '') !== String(adminProbe.afterWait?.authority?.at || '');
      const presentedCount = Array.isArray(admin.presented) ? admin.presented.length : 0;
      if (!authorityAdvanced) throw new Error('RELEASE_COMPOSITION_FAILURE:ADMIN_AUTHORITY_NOT_RECOMPOSED_AFTER_BACKEND_REFRESH');
      if (presentedCount < fixtureDefs.length) throw new Error('FUNCTIONAL_DEFECT:ADMIN_SHOPPERSFOR_SCOPE_EXCLUDES_CREATED_PROFILES');
      if (!rowsVisible) throw new Error('VISUAL_DEFECT:ADMIN_ROWS_NOT_RERENDERED_AFTER_COMPOSITION');
      throw new Error('FUNCTIONAL_DEFECT:ADMIN_FIXTURE_REQUIRES_EXPLICIT_BACKEND_REFRESH');
    }
    if (adminProbe.refreshInvoked === true && refreshSelected === fixtureDefs.length && postRefreshSelected < fixtureDefs.length) {
      if (postProtectedProfiles >= fixtureDefs.length) throw new Error('RELEASE_COMPOSITION_FAILURE:ADMIN_PLATFORM_PROFILES_LOST_AFTER_AUTHORITY_RECOMPOSE');
      throw new Error('FUNCTIONAL_DEFECT:ADMIN_AUTHORITY_CAPTURE_DROPS_REFRESHED_PROFILES');
    }
    if (adminProbe.refreshInvoked === true && refreshSelected < fixtureDefs.length) {
      throw new Error('AUTH_FAILURE:ADMIN_FIRESTORE_REFRESH_SCOPE_EXCLUDES_CREATED_PROFILES');
    }
    throw new Error('FUNCTIONAL_DEFECT:ADMIN_FIXTURE_ROWS_NOT_VISIBLE');
  }
  if (!hnDetailPhoneOk || !hnDetailEmailOk) throw new Error('VISUAL_DEFECT:ADMIN_FIXTURE_HN_DETAIL_NOT_VISIBLE');
  if (!crossProjectBlocked) throw new Error('AUTH_FAILURE:ADMIN_CROSS_PROJECT_COMMAND_NOT_BLOCKED');

  const visitKey = (v) => str(v.visitId || v.id || v.hrRowId || (str(v.sourceTab) && str(v.sourceRow) ? str(v.sourceTab) + '::' + str(v.sourceRow) : ''));
  const activePeriod = arr(hr.periods).find((p) => str(p.id || p.periodId) === PERIOD_ID) || null;
  const activePeriodKey = str(activePeriod?.key || activePeriod?.periodKey);
  if (!activePeriodKey) throw new Error('MAPPING_FAILURE:ACTIVE_PERIOD_NOT_FOUND_IN_HR');
  const rawAvailable = arr(hr.visits).filter((v) =>
    str(v.periodKey) === activePeriodKey &&
    ['disponible','available'].includes(str(v.estado || v.status).toLowerCase()) &&
    !str(v.shopperId)
  );
  const availability = [];
  for (const visit of rawAvailable) {
    const id = visitKey(visit);
    if (!id) throw new Error('MAPPING_FAILURE:AVAILABLE_HR_VISIT_KEY_MISSING');
    const ref = project.collection('visits').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('PERSISTENCE_FAILURE:AVAILABLE_HR_VISIT_NOT_MATERIALIZED');
    const durable = snap.data() || {};
    if (hrRevision && str(durable.hrSourceRevision) && str(durable.hrSourceRevision) !== hrRevision) {
      throw new Error('PERSISTENCE_FAILURE:HR_DURABLE_REVISION_DIVERGENCE:' + sha(id).slice(0, 18));
    }
    const durableAvailable = !str(durable.shopperId) && ['disponible','available'].includes(str(durable.estado || durable.status).toLowerCase());
    const pendingPlatform = !!(str(durable.shopperId) && str(durable.assignmentSource) === 'platform' && str(durable.assignmentSyncStatus) === 'pending_hr');
    if (!durableAvailable && !pendingPlatform) {
      throw new Error('PERSISTENCE_FAILURE:HR_DURABLE_AVAILABILITY_DIVERGENCE:' + sha(id).slice(0, 18));
    }
    availability.push({ visit, id, ref, durable, durableAvailable, pendingPlatform });
  }
  const available = availability.filter((x) => x.durableAvailable);
  if (available.length < 2) throw new Error('ENVIRONMENT_FAILURE:NOT_ENOUGH_CANONICAL_AVAILABLE_VISITS_ACTIVE_PERIOD');
  const assignCandidate = available[0], postCandidate = available[1];
  const assignVisit = assignCandidate.visit, postVisit = postCandidate.visit;
  const assignId = assignCandidate.id, postId = postCandidate.id;
  const assignRef = assignCandidate.ref, postRef = postCandidate.ref;
  const assignBefore = assignCandidate.durable, postBefore = postCandidate.durable;

  const gt = fixtureDefs.find((x) => x.testId === '1_SHOPPER_GT');
  const assignCommand = command('visit.assign', 'visit', assignId, 'i3-assign-' + RUN_ID, { visitId: assignId, hrRowId: assignBefore.hrRowId || assignVisit.hrRowId || null, shopperId: gt.id, assignmentSource: 'platform' }, assignBefore.version ?? assignBefore.updatedAt ?? assignBefore.lastSyncedAt ?? 'source-current');
  trackCommand(assignCommand);
  const assignAck = await executeHttp(staffToken, assignCommand);
  const assignAfter = (await assignRef.get()).data() || {};
  const owned = await project.collection('visits').where('shopperId', '==', gt.id).get();
  const exactOwned = owned.docs.filter((d) => d.id === assignId).length;
  const shopperVisit = await shopperVisitReadback(gt, assignId);
  const assignedOk = assignAck.ok === true && assignAck.providerAck === true && str(assignAfter.shopperId) === gt.id && !['disponible','available'].includes(str(assignAfter.estado || assignAfter.status).toLowerCase()) && exactOwned === 1 && shopperVisit.mineCount === 1 && shopperVisit.assigned === true && shopperVisit.available === false;
  if (!assignedOk) throw new Error('PROVIDER_FAILURE:ASSIGNMENT_ACK_OR_READBACK');
  await assignRef.set(assignBefore, { merge: false });
  cleanupTargets.receipts.add(commandReceiptId(assignCommand)); cleanupTargets.audits.add(commandAuditId(assignCommand));
  const restored = (await assignRef.get()).data() || {};
  record('7_DISPONIBILIDAD_ASIGNACION', 'Active-period HR-eligible + durable-available visit → provider ACK assignment → removed from available state → appears exactly once to shopper', { providerAck: assignAck.providerAck, shopperId: assignAfter.shopperId, state: assignAfter.estado || assignAfter.status, exactOwned, shopperVisible: shopperVisit, activePeriodKey, rawHrAvailable: rawAvailable.length, canonicalAvailable: available.length, pendingPlatformExcluded: availability.filter((x) => x.pendingPlatform).length }, { assignmentSource: assignAfter.assignmentSource, assignmentSyncStatus: assignAfter.assignmentSyncStatus, hrRowId: assignAfter.hrRowId || null, hrSourceRevision: assignBefore.hrSourceRevision || null }, 'Original DEV Firestore visit snapshot restored; HR untouched', { shopperId: restored.shopperId || null, state: restored.estado || restored.status }, !str(restored.shopperId) && ['disponible','available'].includes(str(restored.estado || restored.status).toLowerCase()));

  const shopperToken = await passwordToIdToken(gt.internalEmail, gt.credential.password, apiKey);
  const createPost = command('application.create', 'application', null, 'i3-post-create-' + RUN_ID, { visitId: postId, hrRowId: postBefore.hrRowId || postVisit.hrRowId || null, shopperId: gt.id, proposedDate: '2026-09-30', note: 'I3 live fixture' });
  trackCommand(createPost);
  const postAck = await executeHttp(shopperToken, createPost);
  if (!(postAck.ok === true && postAck.providerAck === true && postAck.entityId)) throw new Error('PROVIDER_FAILURE:POSTULATION_CREATE:' + str(postAck.code));
  const postulationRef = project.collection('postulations').doc(postAck.entityId); cleanupTargets.docs.add(postulationRef.path);
  const postData = (await postulationRef.get()).data() || {};
  const adminPresent = await adminPostulationReadback(staff.id, postAck.entityId, true);
  const deletePost = command('application.delete', 'application', postAck.entityId, 'i3-post-delete-' + RUN_ID, { applicationId: postAck.entityId, visitId: postId }, postData.version ?? postData.updatedAt ?? 'source-current');
  trackCommand(deletePost);
  const deleteAck = await executeHttp(shopperToken, deletePost);
  const absentPost = !(await postulationRef.get()).exists;
  const adminAbsent = await adminPostulationReadback(staff.id, postAck.entityId, false);
  if (!(adminPresent.ok && deleteAck.ok === true && deleteAck.providerAck === true && absentPost && adminAbsent.ok)) throw new Error('PERSISTENCE_FAILURE:POSTULATION_DELETE_OR_REAPPEAR');
  record('8_POSTULACION', 'Create application ACK → visible in Gestión de Postulaciones → delete ACK → absent and does not reappear', { createAck: postAck.providerAck, adminVisible: adminPresent, deleteAck: deleteAck.providerAck, adminAbsent }, { applicationFingerprint: sha(postAck.entityId).slice(0, 18), source: postData.source || null }, 'Postulation deleted through provider; receipts/audits cleaned after test', { firestoreAbsent: absentPost, adminReadModelAbsent: adminAbsent.ok }, true);
} catch (e) {
  failure = e;
} finally {
  try { if (browser) await browser.close(); } catch {}
  try { await cleanupAll(); } catch (e) { cleanupFailure = e; }
  let absence = { ok: false };
  try { absence = await absenceReadback(); } catch (e) { absence = { ok: false, error: str(e?.message || e) }; }
  for (const t of tests) {
    if (t.cleanup === 'Shared synthetic cleanup pending') t.cleanup = 'Synthetic shopper/profile/crosswalk/Auth teardown executed after all tests';
    if (t.absenceReadback === 'Shared absence readback pending') t.absenceReadback = { sharedAbsenceReadback: absence.ok };
  }
  if (cleanupFailure || !absence.ok) failure = failure || new Error('PERSISTENCE_FAILURE:CLEANUP_INCOMPLETE');
  const required = ['1_SHOPPER_GT','2_SHOPPER_HN','3_NOMBRE_TILDE','4_NOMBRE_COMPUESTO','5_PERFIL_ADMIN','6_HISTORICO_KPIS','7_DISPONIBILIDAD_ASIGNACION','8_POSTULACION','9_RESERVA','10_CLIENTE'];
  const missing = required.filter((id) => !tests.some((t) => t.id === id && t.ok));
  if (missing.length && !failure) failure = new Error('FUNCTIONAL_DEFECT:MISSING_REQUIRED_TESTS:' + missing.join(','));
  const result = {
    schemaVersion: 'cxorbia.i3.live-fixtures.v2',
    decision: failure ? 'HOLD_I3_LIVE_FIXTURES_V2' : 'PASS_I3_LIVE_FIXTURES_V2',
    generatedAt: new Date().toISOString(), priorRunId: PRIOR_RUN_ID,
    certificationSourceSha: SOURCE_SHA, certificationSourceTree: SOURCE_TREE, certifiedArtifactSha256: CERTIFIED_ARTIFACT_SHA256,
    buildCountThisRun: 0, deployCountThisRun: 0, rebuildAfterCertification: false, productSourceChanged: false,
    production: false, hrWrites: 0, fuzzyMatching: false, hrRevision, liveFixtureHrRevision: hrRevision,
    certifiedProofHrRevision,
    certificationLiveReadbackRevision,
    crossRunHrRevisionEqualityRequired: false, sameRevisionWithinThisLiveFixtureRun: true, tests, cleanup: absence,
    classification: failure ? classify(failure) : null, code: failure ? str(failure.message).slice(0, 900) : null,
    cleanupError: cleanupFailure ? str(cleanupFailure.message).slice(0, 400) : null
  };
  fs.writeFileSync(path.join(OUT, 'i3-live-fixtures-result.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(result.decision + ' tests=' + tests.filter((x) => x.ok).length + '/10 cleanup=' + absence.ok + ' build=0 deploy=0 production=false');
  if (failure) { console.error(result.classification + ':' + result.code); }
}
