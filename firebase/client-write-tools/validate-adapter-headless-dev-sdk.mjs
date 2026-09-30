import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPROVAL_ENV = 'CXORBIA_ADAPTER_HEADLESS_DEV_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_20260628_ADAPTER_HEADLESS_DEV';
const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';
const TENANT_ID = 'tya';

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorizacion local para validar adapter headless DEV.');
  process.exit(1);
}

const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(__dirname, '..', 'auth-dev-tools', 'output');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
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

  return {
    enabled,
    firebaseConfig: {
      apiKey: pick('apiKey'),
      authDomain: pick('authDomain'),
      projectId: pick('projectId'),
      storageBucket: pick('storageBucket'),
      messagingSenderId: pick('messagingSenderId'),
      appId: pick('appId')
    }
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

  if (!files.length) throw new Error('No encontre reporte local auth-import-users-*.md.');

  const text = readText(files[0]);
  const match = text.match(/Password DEV temporal compartido:[\s\S]*?```text\s*([\s\S]*?)\s*```/i);
  if (!match || !match[1] || !match[1].trim()) {
    throw new Error('No pude leer la clave DEV temporal desde el reporte local.');
  }

  return match[1].trim();
}

function docData(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

async function getAll(queryRef) {
  const snap = await getDocs(queryRef);
  return snap.docs.map(docData);
}

async function loadTenantData(db) {
  const projects = await getAll(collection(db, 'tenants', TENANT_ID, 'projects'));
  const shoppers = await getAll(collection(db, 'tenants', TENANT_ID, 'shoppers'));
  const visits = [];
  const posts = [];

  for (const project of projects) {
    const projectId = project.id;
    const vs = await getAll(collection(db, 'tenants', TENANT_ID, 'projects', projectId, 'visits'));
    const ps = await getAll(collection(db, 'tenants', TENANT_ID, 'projects', projectId, 'postulations'));
    vs.forEach((visit) => {
      visits.push({ ...visit, projectId: visit.projectId || projectId });
    });
    ps.forEach((post) => {
      posts.push({ ...post, projectId: post.projectId || projectId });
    });
  }

  return { projects, shoppers, visits, posts };
}

function createHeadlessCXData() {
  return {
    projects: [],
    shoppers: [],
    _visitas: [],
    _posts: [],
    currentProjectId: null,
    project() {
      return this.projects.find((project) => project.id === this.currentProjectId) || this.projects[0] || null;
    },
    visitas() {
      return this._visitas.filter((visit) => visit.projectId === this.currentProjectId);
    },
    posts() {
      return this._posts.filter((post) => post.projectId === this.currentProjectId);
    },
    shoppersFor() {
      const project = this.project();
      if (!project || !Array.isArray(project.countries) || !project.countries.length) return this.shoppers;
      return this.shoppers.filter((shopper) => project.countries.includes(shopper.pais));
    }
  };
}

function applyAdapterLikeData(cxData, state, defaultProjectId) {
  if (!state || !state.projects || !state.projects.length) {
    return false;
  }

  cxData.projects = state.projects;
  cxData.shoppers = state.shoppers || [];
  cxData._visitas = state.visits || [];
  cxData._posts = state.posts || [];

  const keep = cxData.currentProjectId;
  const exists = cxData.projects.some((project) => project.id === keep);
  cxData.currentProjectId = exists ? keep : (defaultProjectId || cxData.projects[0].id);
  return true;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log('== Validacion adapter headless Firestore DEV ==');
  console.log('Alcance: solo lectura y mapeo en memoria; sin CX.BACKEND.enabled, sin escritura, sin Hosting, sin merge, sin produccion.');

  const { enabled, firebaseConfig } = readFirebaseConfig();
  assert(enabled === false, 'CX.BACKEND.enabled no esta en false. Detener validacion.');
  console.log('CX.BACKEND.enabled observado: false');

  const password = getLocalDevPassword();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('== Login usuario DEV ficticio ==');
  await signInWithEmailAndPassword(auth, DEV_EMAIL, password);
  console.log('Login DEV OK.');

  const state = await loadTenantData(db);
  const cxData = createHeadlessCXData();
  const applied = applyAdapterLikeData(cxData, state, 'tya-piloto');

  assert(applied === true, 'El adapter headless no aplico datos.');
  assert(cxData.currentProjectId === 'tya-piloto', 'currentProjectId inesperado.');
  assert(cxData.project() && cxData.project().id === 'tya-piloto', 'CX.data.project() no devuelve tya-piloto.');
  assert(cxData.visitas().length === 8, 'CX.data.visitas() no devuelve 8 visitas.');
  assert(cxData.posts().length === 3, 'CX.data.posts() no devuelve 3 postulaciones.');
  assert(cxData.shoppersFor().length === 4, 'CX.data.shoppersFor() no devuelve 4 shoppers.');

  const project = cxData.project();
  const visitStates = cxData.visitas().reduce((acc, visit) => {
    const key = visit.estado || 'sin_estado';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log('== Resultado mapeo adapter headless ==');
  console.log('Proyecto actual:', project.name || project.id);
  console.log('ProjectId:', cxData.currentProjectId);
  console.log('Proyectos:', cxData.projects.length);
  console.log('Shoppers:', cxData.shoppers.length);
  console.log('Visitas filtradas:', cxData.visitas().length);
  console.log('Postulaciones filtradas:', cxData.posts().length);
  console.log('Shoppers filtrados:', cxData.shoppersFor().length);
  console.log('Estados visitas:', JSON.stringify(visitStates));

  console.log('Validaciones adapter headless: OK');
  console.log('No se activo CX.BACKEND.enabled. No se escribio en Firestore. No se hizo deploy de Hosting. No se hizo merge. No se toco produccion.');
  console.log('== Adapter headless Firestore DEV finalizado ==');
}

main().catch((error) => {
  console.error('== ERROR adapter headless Firestore DEV ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
