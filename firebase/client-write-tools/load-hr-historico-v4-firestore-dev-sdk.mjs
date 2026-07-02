import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, writeBatch, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const APPROVAL_ENV = 'CXORBIA_TYA_HR_HISTORY_WRITE_DEV_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_TYA_HR_HISTORY_V4_WRITE_DEV';
const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';
const TENANT_ID = 'tya';

const EXPECTED = {
  projects: 26,
  shoppers: 188,
  visits: 573,
  questionnaires: 556,
  liquidations: 524,
  gt: 442,
  hn: 131
};

const transformedPath = process.env.CXORBIA_TYA_HR_HISTORY_V4_PATH || path.join(firebaseDir, 'private-output', 'hr-tya-historico-good-firestore-transform-v4.json');
const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(firebaseDir, 'auth-dev-tools', 'output');
const reportJsonPath = path.join(firebaseDir, 'private-output', 'hr-tya-historico-v4-firestore-load-report.json');

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorización local para cargar histórico HR GT/HN V4 en Firestore DEV.');
  process.exit(1);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function assertCount(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`Conteo inesperado para ${name}: esperado ${expected}, recibido ${actual}. Detengo carga.`);
  }
}

function readFirebaseConfig() {
  const text = readText(backendConfigPath);

  function pick(key) {
    const re = new RegExp(key + "\\s*:\\s*['\\\"]([^'\\\"]+)['\\\"]");
    const match = text.match(re);
    if (!match) throw new Error('No pude leer ' + key + ' desde backend-config.js');
    return match[1];
  }

  const enabledMatch = text.match(/enabled:\s*(true|false)/);
  const enabled = enabledMatch ? enabledMatch[1] === 'true' : null;
  if (enabled !== false) throw new Error('CX.BACKEND.enabled principal no está en false. Detengo carga.');

  return {
    apiKey: pick('apiKey'),
    authDomain: pick('authDomain'),
    projectId: pick('projectId'),
    storageBucket: pick('storageBucket'),
    messagingSenderId: pick('messagingSenderId'),
    appId: pick('appId')
  };
}

function getLocalDevPassword() {
  if (process.env.CXORBIA_DEV_PASSWORD && process.env.CXORBIA_DEV_PASSWORD.trim()) {
    return process.env.CXORBIA_DEV_PASSWORD.trim();
  }

  if (!fs.existsSync(authOutputDir)) {
    throw new Error('No existe firebase/auth-dev-tools/output. No puedo leer la clave DEV local.');
  }

  const files = fs.readdirSync(authOutputDir)
    .filter((name) => /^auth-import-users-.*\.md$/i.test(name))
    .map((name) => path.join(authOutputDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (!files.length) throw new Error('No encontré reporte local auth-import-users-*.md.');

  const text = readText(files[0]);
  const match = text.match(/Password DEV temporal compartido:[\s\S]*?```text\s*([\s\S]*?)\s*```/i);

  if (!match || !match[1] || !match[1].trim()) {
    throw new Error('No pude leer la clave DEV temporal desde el reporte local.');
  }

  return match[1].trim();
}

function derivePeriodKey(sourceSheet, projectId) {
  const text = String(sourceSheet || projectId || '').toLowerCase();

  const monthMap = {
    enero: '01',
    febrero: '02',
    marzo: '03',
    abril: '04',
    mayo: '05',
    junio: '06',
    julio: '07',
    agosto: '08',
    septiembre: '09',
    octubre: '10',
    noviembre: '11',
    diciembre: '12'
  };

  const found = Object.entries(monthMap).find(([name]) => text.includes(name));
  const yyMatch = text.match(/(25|26|27|28|29|30)/);

  if (!found || !yyMatch) return null;
  return `20${yyMatch[1]}-${found[1]}`;
}

function addDoc(items, ref, data) {
  if (!data || !data.id) return;
  items.push({ ref, data });
}

function withSyncMeta(item, extra = {}) {
  return {
    ...item,
    tenantId: TENANT_ID,
    ...extra,
    sync: {
      ...(item.sync || {}),
      source: 'hr-tya-historico-sync',
      mode: 'history-load-v4',
      lastLoadedAt: new Date().toISOString()
    }
  };
}

function validateSource(data) {
  assertCount('projects', countArray(data.projects), EXPECTED.projects);
  assertCount('shoppers', countArray(data.shoppers), EXPECTED.shoppers);
  assertCount('visits', countArray(data.visits), EXPECTED.visits);
  assertCount('questionnaires', countArray(data.questionnaires), EXPECTED.questionnaires);
  assertCount('liquidations', countArray(data.liquidations), EXPECTED.liquidations);

  const byCountry = {};
  for (const visit of data.visits || []) {
    const key = visit.country || '__VACIO__';
    byCountry[key] = (byCountry[key] || 0) + 1;
  }

  if (byCountry.GT !== EXPECTED.gt || byCountry.HN !== EXPECTED.hn) {
    throw new Error('Conteo por país inesperado: ' + JSON.stringify(byCountry));
  }
}

function buildDocs(db, data) {
  const items = [];

  addDoc(items, doc(db, 'tenants', TENANT_ID), {
    id: TENANT_ID,
    name: 'T&A',
    status: 'dev-hr-history-loaded',
    source: 'hr-tya-historico-sync',
    updatedAt: new Date().toISOString()
  });

  for (const client of data.clients || []) {
    addDoc(items, doc(db, 'tenants', TENANT_ID, 'clients', client.id), withSyncMeta(client));
  }

  for (const project of data.projects || []) {
    const periodKey = derivePeriodKey(project.sourceSheet, project.id);

    addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', project.id), withSyncMeta(project, {
      periodKey,
      isPeriodSelectable: true,
      syncMode: 'history-and-live',
      sourceType: 'hr-sheet',
      canCreateShoppersFromSource: true,
      canAssignVisitsFromSource: true
    }));
  }

  for (const shopper of data.shoppers || []) {
    addDoc(items, doc(db, 'tenants', TENANT_ID, 'shoppers', shopper.id), withSyncMeta(shopper, {
      profileStatus: 'operational-minimum',
      createdFromExternalSource: true
    }));
  }

  for (const visit of data.visits || []) {
    if (!visit.projectId) throw new Error('Visita sin projectId.');

    const periodKey = derivePeriodKey(visit.sourceSheet, visit.projectId);

    addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', visit.projectId, 'visits', visit.id), withSyncMeta(visit, {
      periodKey,
      sourceKey: `${visit.sourceSheet || ''}|${visit.country || ''}|${visit.idCinema || ''}|${visit.sucursal || ''}|${visit.numeroEncuesta || ''}|${visit.sourceRow || ''}`,
      canBeUpdatedByHrSync: true
    }));
  }

  for (const item of data.questionnaires || []) {
    if (!item.projectId) throw new Error('Cuestionario sin projectId.');
    addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'questionnaires', item.id), withSyncMeta(item));
  }

  for (const item of data.liquidations || []) {
    if (!item.projectId) throw new Error('Liquidación sin projectId.');
    addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'liquidations', item.id), withSyncMeta(item));
  }

  addDoc(items, doc(db, 'tenants', TENANT_ID, 'syncSources', 'hr-tya-historico-sync'), {
    id: 'hr-tya-historico-sync',
    tenantId: TENANT_ID,
    type: 'spreadsheet',
    mode: 'history-and-live',
    status: 'history-v4-loaded-dev',
    lastHistoryLoadAt: new Date().toISOString(),
    periods: countArray(data.projects),
    visits: countArray(data.visits),
    shoppers: countArray(data.shoppers),
    questionnaires: countArray(data.questionnaires),
    liquidations: countArray(data.liquidations),
    liveSyncPending: true,
    storageEvidencePending: true,
    adapterGlobalEnabled: false
  });

  return items;
}

async function commitInChunks(db, items) {
  const chunkSize = 400;
  let written = 0;

  for (let i = 0; i < items.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + chunkSize);

    for (const item of chunk) {
      batch.set(item.ref, item.data, { merge: true });
    }

    await batch.commit();
    written += chunk.length;
    console.log('Escrituras completadas acumuladas:', written);
  }

  return written;
}

async function countCollection(ref) {
  const snap = await getDocs(ref);
  return snap.size;
}

async function validateRead(db, data) {
  const projectIds = (data.projects || []).map((p) => p.id);

  const report = {
    tenantId: TENANT_ID,
    clients: await countCollection(collection(db, 'tenants', TENANT_ID, 'clients')),
    projects: await countCollection(collection(db, 'tenants', TENANT_ID, 'projects')),
    shoppers: await countCollection(collection(db, 'tenants', TENANT_ID, 'shoppers')),
    visits: 0,
    questionnaires: 0,
    liquidations: 0,
    periodProjectsRead: projectIds.length
  };

  for (const projectId of projectIds) {
    report.visits += await countCollection(collection(db, 'tenants', TENANT_ID, 'projects', projectId, 'visits'));
    report.questionnaires += await countCollection(collection(db, 'tenants', TENANT_ID, 'projects', projectId, 'questionnaires'));
    report.liquidations += await countCollection(collection(db, 'tenants', TENANT_ID, 'projects', projectId, 'liquidations'));
  }

  return report;
}

async function main() {
  console.log('== Carga histórico HR GT/HN V4 Firestore DEV ==');
  console.log('Alcance: DEV; 573 visitas, 188 shoppers, 26 periodos; sin adapter global, sin Hosting, sin merge, sin producción, sin Storage.');

  if (!fs.existsSync(transformedPath)) {
    throw new Error('No encontré archivo transformado V4: ' + transformedPath);
  }

  const firebaseConfig = readFirebaseConfig();
  const password = getLocalDevPassword();
  const data = readJson(transformedPath);

  validateSource(data);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('== Login usuario DEV ficticio ==');
  await signInWithEmailAndPassword(auth, DEV_EMAIL, password);
  console.log('Login DEV OK.');

  const items = buildDocs(db, data);
  console.log('Escrituras preparadas:', items.length);

  const written = await commitInChunks(db, items);
  console.log('Escrituras completadas:', written);

  console.log('== Validando lectura Firestore DEV ==');
  const readReport = await validateRead(db, data);
  fs.writeFileSync(reportJsonPath, JSON.stringify({ written, readReport }, null, 2), 'utf8');

  console.log('Lectura DEV:', JSON.stringify(readReport, null, 2));
  console.log('Reporte JSON:', reportJsonPath);
  console.log('No se activó CX.BACKEND.enabled. No se hizo deploy de Hosting. No se hizo merge. No se tocó producción. No se cargó Storage/evidencias.');
  console.log('== Carga histórico HR GT/HN V4 Firestore DEV finalizada ==');
}

main().catch((error) => {
  console.error('== ERROR carga histórico HR GT/HN V4 Firestore DEV ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
