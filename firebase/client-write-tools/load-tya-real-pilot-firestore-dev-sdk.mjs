import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const APPROVAL_ENV = 'CXORBIA_TYA_REAL_WRITE_DEV_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_TYA_REAL_WRITE_DEV';
const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';
const TENANT_ID = 'tya';

const transformedPath = process.env.CXORBIA_TYA_TRANSFORMED_PATH || path.join(firebaseDir, 'private-output', 'tya-real-transformed-firestore.json');
const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(firebaseDir, 'auth-dev-tools', 'output');
const maxVisits = Number(process.env.CXORBIA_TYA_REAL_MAX_VISITS || 20);
const pilotProjectId = process.env.CXORBIA_TYA_REAL_PILOT_PROJECT_ID || '';

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorización local para cargar piloto real T&A en Firestore DEV.');
  process.exit(1);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
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
  if (!match || !match[1] || !match[1].trim()) throw new Error('No pude leer la clave DEV temporal desde el reporte local.');
  return match[1].trim();
}

function addDoc(items, ref, data) {
  if (!data || !data.id) return;
  items.push({ ref, data });
}

function filterPilot(data) {
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const selectedProjectId = pilotProjectId || (projects[0] && projects[0].id);
  if (!selectedProjectId) throw new Error('No hay proyecto para piloto real T&A.');

  const visitsAll = (Array.isArray(data.visits) ? data.visits : []).filter((visit) => visit.projectId === selectedProjectId);
  const visits = visitsAll.slice(0, maxVisits);
  const visitIds = new Set(visits.map((visit) => visit.id));
  const shopperIds = new Set(visits.map((visit) => visit.shopperId).filter(Boolean));

  const postulations = (Array.isArray(data.postulations) ? data.postulations : []).filter((item) => visitIds.has(item.visitaId));
  postulations.forEach((item) => { if (item.shopperId) shopperIds.add(item.shopperId); });

  const questionnaires = (Array.isArray(data.questionnaires) ? data.questionnaires : []).filter((item) => visitIds.has(item.visitaId));
  questionnaires.forEach((item) => { if (item.shopperId) shopperIds.add(item.shopperId); });

  const shoppers = (Array.isArray(data.shoppers) ? data.shoppers : []).filter((shopper) => shopperIds.has(shopper.id));
  const project = projects.find((item) => item.id === selectedProjectId);
  const clientIds = new Set([project?.clientId, project?.accountId].filter(Boolean));
  const clients = (Array.isArray(data.clients) ? data.clients : []).filter((client) => clientIds.has(client.id));

  const liquidations = (Array.isArray(data.liquidations) ? data.liquidations : []).filter((item) => visitIds.has(item.visitaId || item.visitId));
  const lots = (Array.isArray(data.lots) ? data.lots : []).slice(0, 20);
  const certifications = (Array.isArray(data.certifications) ? data.certifications : []).filter((item) => !item.shopperId || shopperIds.has(item.shopperId));
  const notifications = (Array.isArray(data.notifications) ? data.notifications : []).slice(0, 20);

  return {
    tenant: data.tenant,
    clients,
    projects: [project].filter(Boolean),
    shoppers,
    visits,
    postulations,
    questionnaires,
    certifications,
    liquidations,
    lots,
    notifications,
    selectedProjectId,
    sourceCounts: {
      projectsTotal: projects.length,
      visitsTotal: visitsAll.length,
      visitsPilot: visits.length,
      shoppersPilot: shoppers.length,
      postulationsPilot: postulations.length,
      questionnairesPilot: questionnaires.length
    }
  };
}

function buildDocs(db, pilot) {
  const items = [];
  const tenant = { ...(pilot.tenant || {}), id: TENANT_ID, status: 'real-dev-pilot' };
  addDoc(items, doc(db, 'tenants', TENANT_ID), tenant);

  for (const client of pilot.clients || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'clients', client.id), client);
  for (const project of pilot.projects || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', project.id), project);
  for (const shopper of pilot.shoppers || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'shoppers', shopper.id), { ...shopper, tenantId: TENANT_ID });
  for (const visit of pilot.visits || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', visit.projectId, 'visits', visit.id), visit);
  for (const item of pilot.postulations || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'postulations', item.id), item);
  for (const item of pilot.questionnaires || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'questionnaires', item.id), item);
  for (const item of pilot.certifications || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId || pilot.selectedProjectId, 'certifications', item.id || ('cert-' + Math.random().toString(36).slice(2))), item);
  for (const item of pilot.liquidations || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId || pilot.selectedProjectId, 'liquidations', item.id || ('liq-' + Math.random().toString(36).slice(2))), item);
  for (const item of pilot.lots || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'projects', item.projectId || pilot.selectedProjectId, 'lots', item.id || ('lot-' + Math.random().toString(36).slice(2))), item);
  for (const item of pilot.notifications || []) addDoc(items, doc(db, 'tenants', TENANT_ID, 'notifications', item.id || ('notif-' + Math.random().toString(36).slice(2))), item);

  return items;
}

async function commitInChunks(db, items) {
  const chunkSize = 400;
  let written = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + chunkSize);
    for (const item of chunk) batch.set(item.ref, item.data, { merge: true });
    await batch.commit();
    written += chunk.length;
    console.log('Escrituras completadas acumuladas:', written);
  }
  return written;
}

async function main() {
  console.log('== Carga piloto real T&A Firestore DEV por Firebase Web SDK ==');
  console.log('Alcance: DEV, piloto limitado; sin adapter global, sin Hosting, sin merge, sin producción.');

  if (!Number.isFinite(maxVisits) || maxVisits < 1 || maxVisits > 50) {
    throw new Error('CXORBIA_TYA_REAL_MAX_VISITS debe estar entre 1 y 50.');
  }
  if (!fs.existsSync(transformedPath)) throw new Error('No encontré archivo transformado: ' + transformedPath);

  const firebaseConfig = readFirebaseConfig();
  const password = getLocalDevPassword();
  const data = readJson(transformedPath);
  const pilot = filterPilot(data);

  console.log('Proyecto piloto:', pilot.selectedProjectId);
  console.log('Conteos piloto:', JSON.stringify(pilot.sourceCounts));

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('== Login usuario DEV ficticio ==');
  await signInWithEmailAndPassword(auth, DEV_EMAIL, password);
  console.log('Login DEV OK.');

  const items = buildDocs(db, pilot);
  console.log('Escrituras preparadas:', items.length);
  for (const item of items) console.log('WRITE ' + item.ref.path);

  const written = await commitInChunks(db, items);
  console.log('Escrituras completadas:', written);
  console.log('No se activó CX.BACKEND.enabled. No se hizo deploy de Hosting. No se hizo merge. No se tocó producción.');
  console.log('== Carga piloto real T&A Firestore DEV finalizada ==');
}

main().catch((error) => {
  console.error('== ERROR carga piloto real T&A Firestore DEV ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
