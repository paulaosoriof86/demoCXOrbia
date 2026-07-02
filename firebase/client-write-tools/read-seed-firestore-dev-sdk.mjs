import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPROVAL_ENV = 'CXORBIA_SEED_READ_DEV_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_20260628_SEED_READ_DEV';

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorización local para validar lectura seed DEV.');
  process.exit(1);
}

const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';
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

async function countCollection(db, pathParts) {
  const snap = await getDocs(collection(db, ...pathParts));
  return snap.size;
}

async function mustExist(db, pathParts, label) {
  const snap = await getDoc(doc(db, ...pathParts));
  if (!snap.exists()) {
    throw new Error('No existe documento esperado: ' + label);
  }
  return snap.data();
}

async function main() {
  console.log('== Validación lectura seed Firestore DEV ==');
  console.log('Alcance: solo lectura; sin escritura, sin adapter, sin Hosting, sin merge, sin producción.');

  const firebaseConfig = readFirebaseConfig();
  const password = getLocalDevPassword();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('== Login usuario DEV ficticio ==');
  await signInWithEmailAndPassword(auth, DEV_EMAIL, password);
  console.log('Login DEV OK.');

  const tenant = await mustExist(db, ['tenants', 'tya'], 'tenants/tya');
  const client = await mustExist(db, ['tenants', 'tya', 'clients', 'cinepolis-demo'], 'clients/cinepolis-demo');
  const project = await mustExist(db, ['tenants', 'tya', 'projects', 'tya-piloto'], 'projects/tya-piloto');

  const clients = await countCollection(db, ['tenants', 'tya', 'clients']);
  const projects = await countCollection(db, ['tenants', 'tya', 'projects']);
  const shoppers = await countCollection(db, ['tenants', 'tya', 'shoppers']);
  const visits = await countCollection(db, ['tenants', 'tya', 'projects', 'tya-piloto', 'visits']);
  const postulations = await countCollection(db, ['tenants', 'tya', 'projects', 'tya-piloto', 'postulations']);
  const questionnaires = await countCollection(db, ['tenants', 'tya', 'projects', 'tya-piloto', 'questionnaires']);

  console.log('== Datos leídos ==');
  console.log('Tenant:', tenant.name || tenant.id);
  console.log('Cuenta:', client.name || client.id);
  console.log('Proyecto:', project.name || project.id);
  console.log('Cuentas:', clients);
  console.log('Proyectos:', projects);
  console.log('Shoppers:', shoppers);
  console.log('Visitas:', visits);
  console.log('Postulaciones:', postulations);
  console.log('Cuestionarios:', questionnaires);

  const ok =
    clients === 1 &&
    projects === 1 &&
    shoppers === 4 &&
    visits === 8 &&
    postulations === 3 &&
    questionnaires === 1;

  if (!ok) {
    throw new Error('Conteos inesperados en lectura Firestore DEV.');
  }

  console.log('Validaciones lectura: OK');
  console.log('No se escribió en Firestore. No se activó adapter. No se hizo deploy de Hosting. No se hizo merge. No se tocó producción.');
  console.log('== Lectura seed Firestore DEV finalizada ==');
}

main().catch((error) => {
  console.error('== ERROR lectura seed Firestore DEV ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
