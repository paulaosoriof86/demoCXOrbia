import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPROVAL_ENV = 'CXORBIA_SEED_WRITE_DEV_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_20260628_SEED_WRITE_DEV';

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorización local para cargar seed DEV.');
  process.exit(1);
}

const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';
const seedPath = path.join(__dirname, '..', 'seed-tya-piloto.json');
const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(__dirname, '..', 'auth-dev-tools', 'output');

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

  if (!files.length) {
    throw new Error('No encontré reporte local auth-import-users-*.md.');
  }

  const text = readText(files[0]);
  const match = text.match(/Password DEV temporal compartido:[\s\S]*?```text\s*([\s\S]*?)\s*```/i);
  if (!match || !match[1] || !match[1].trim()) {
    throw new Error('No pude leer la clave DEV temporal desde el reporte local.');
  }

  return match[1].trim();
}

function addDoc(items, ref, data) {
  items.push({ ref, data });
}

function buildDocs(db, seed) {
  const items = [];
  const tenantId = seed.tenant.id;

  addDoc(items, doc(db, 'tenants', tenantId), seed.tenant);

  for (const client of seed.clients || []) {
    addDoc(items, doc(db, 'tenants', tenantId, 'clients', client.id), client);
  }

  for (const project of seed.projects || []) {
    addDoc(items, doc(db, 'tenants', tenantId, 'projects', project.id), project);
  }

  for (const shopper of seed.shoppers || []) {
    addDoc(items, doc(db, 'tenants', tenantId, 'shoppers', shopper.id), { ...shopper, tenantId });
  }

  for (const visit of seed.visits || []) {
    addDoc(items, doc(db, 'tenants', tenantId, 'projects', visit.projectId, 'visits', visit.id), visit);
  }

  for (const postulation of seed.postulations || []) {
    addDoc(items, doc(db, 'tenants', tenantId, 'projects', postulation.projectId, 'postulations', postulation.id), postulation);
  }

  for (const questionnaire of seed.questionnaires || []) {
    addDoc(items, doc(db, 'tenants', tenantId, 'projects', questionnaire.projectId, 'questionnaires', questionnaire.id), questionnaire);
  }

  return items;
}

async function main() {
  console.log('== Carga seed Firestore DEV por Firebase Web SDK ==');
  console.log('Alcance: seed ficticio DEV; sin adapter, sin Hosting, sin merge, sin producción.');

  const firebaseConfig = readFirebaseConfig();
  const password = getLocalDevPassword();
  const seed = readJson(seedPath);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('== Login usuario DEV ficticio ==');
  await signInWithEmailAndPassword(auth, DEV_EMAIL, password);
  console.log('Login DEV OK.');

  const items = buildDocs(db, seed);

  console.log('Escrituras preparadas: ' + items.length);
  for (const item of items) {
    console.log('WRITE ' + item.ref.path);
  }

  console.log('== Escribiendo seed ficticio en Firestore DEV ==');

  const batch = writeBatch(db);
  for (const item of items) {
    batch.set(item.ref, item.data, { merge: true });
  }
  await batch.commit();

  console.log('Escrituras completadas: ' + items.length);
  console.log('No se activó adapter. No se hizo deploy de Hosting. No se hizo merge. No se tocó producción.');
  console.log('== Carga seed Firestore DEV finalizada ==');
}

main().catch((error) => {
  console.error('== ERROR carga seed Firestore DEV SDK ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
