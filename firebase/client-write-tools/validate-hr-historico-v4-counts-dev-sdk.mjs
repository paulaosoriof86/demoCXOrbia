import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getCountFromServer,
  doc,
  getDoc
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const TENANT_ID = 'tya';
const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';

const jsonPath = process.env.CXORBIA_TYA_HR_HISTORY_V4_PATH;
const outputMdPath = process.env.CXORBIA_TYA_HR_HISTORY_VALIDATE_MD;

const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(firebaseDir, 'auth-dev-tools', 'output');

const EXPECTED = {
  clients: 1,
  projects: 26,
  shoppers: 188,
  visits: 573,
  questionnaires: 556,
  liquidations: 524,
  certifications: 0
};

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
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

  if (enabled !== false) {
    throw new Error('CX.BACKEND.enabled principal no esta en false. Detengo validacion.');
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

  if (!files.length) throw new Error('No encontre reporte local auth-import-users-*.md.');

  const text = readText(files[0]);
  const match = text.match(/Password DEV temporal compartido:[\s\S]*?```text\s*([\s\S]*?)\s*```/i);

  if (!match || !match[1] || !match[1].trim()) {
    throw new Error('No pude leer la clave DEV temporal desde el reporte local.');
  }

  return match[1].trim();
}

async function countCol(db, ...segments) {
  const snap = await getCountFromServer(collection(db, ...segments));
  return snap.data().count;
}

async function main() {
  console.log('== Validación compacta HR histórico V4 Firestore DEV ==');
  console.log('Solo lectura. No escribe Firestore. No Hosting. No merge. No producción.');

  if (!jsonPath || !fs.existsSync(jsonPath)) {
    throw new Error('No encontré JSON V4: ' + jsonPath);
  }

  const data = readJson(jsonPath);

  if (countArray(data.projects) !== EXPECTED.projects) throw new Error('JSON local no tiene 26 proyectos.');
  if (countArray(data.visits) !== EXPECTED.visits) throw new Error('JSON local no tiene 573 visitas.');

  const app = initializeApp(readFirebaseConfig());
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, DEV_EMAIL, getLocalDevPassword());
  console.log('Login DEV OK.');

  const tenantSnap = await getDoc(doc(db, 'tenants', TENANT_ID));
  const syncSnap = await getDoc(doc(db, 'tenants', TENANT_ID, 'syncSources', 'hr-tya-historico-sync'));

  const counts = {
    tenantExists: tenantSnap.exists(),
    syncSourceExists: syncSnap.exists(),
    clients: await countCol(db, 'tenants', TENANT_ID, 'clients'),
    projects: await countCol(db, 'tenants', TENANT_ID, 'projects'),
    shoppers: await countCol(db, 'tenants', TENANT_ID, 'shoppers'),
    visits: 0,
    questionnaires: 0,
    liquidations: 0,
    certifications: 0
  };

  for (const project of data.projects || []) {
    counts.visits += await countCol(db, 'tenants', TENANT_ID, 'projects', project.id, 'visits');
    counts.questionnaires += await countCol(db, 'tenants', TENANT_ID, 'projects', project.id, 'questionnaires');
    counts.liquidations += await countCol(db, 'tenants', TENANT_ID, 'projects', project.id, 'liquidations');
  }

  const mismatches = [];

  for (const key of ['clients', 'projects', 'shoppers', 'visits', 'questionnaires', 'liquidations', 'certifications']) {
    if (counts[key] !== EXPECTED[key]) {
      mismatches.push(`${key}: esperado ${EXPECTED[key]}, leído ${counts[key]}`);
    }
  }

  if (!counts.tenantExists) mismatches.push('tenant tya no existe');
  if (!counts.syncSourceExists) mismatches.push('syncSource hr-tya-historico-sync no existe');

  const lines = [];

  lines.push('# RESULTADO-VALIDACION-CONTEOS-HR-HISTORICO-V4-FIRESTORE-DEV-20260629');
  lines.push('');
  lines.push('## Resultado');
  lines.push('');
  lines.push(mismatches.length === 0 ? 'Validación compacta correcta contra Firestore DEV.' : 'Validación con diferencias contra Firestore DEV.');
  lines.push('');
  lines.push('## Conteos Firestore DEV');
  lines.push('');
  lines.push(`- tenant tya existe: ${counts.tenantExists}`);
  lines.push(`- syncSource HR existe: ${counts.syncSourceExists}`);
  lines.push(`- clients: ${counts.clients}`);
  lines.push(`- projects: ${counts.projects}`);
  lines.push(`- shoppers: ${counts.shoppers}`);
  lines.push(`- visits: ${counts.visits}`);
  lines.push(`- questionnaires: ${counts.questionnaires}`);
  lines.push(`- liquidations: ${counts.liquidations}`);
  lines.push(`- certifications: ${counts.certifications}`);
  lines.push('');
  lines.push('## Esperado');
  lines.push('');
  lines.push(`- clients: ${EXPECTED.clients}`);
  lines.push(`- projects: ${EXPECTED.projects}`);
  lines.push(`- shoppers: ${EXPECTED.shoppers}`);
  lines.push(`- visits: ${EXPECTED.visits}`);
  lines.push(`- questionnaires: ${EXPECTED.questionnaires}`);
  lines.push(`- liquidations: ${EXPECTED.liquidations}`);
  lines.push(`- certifications: ${EXPECTED.certifications}`);
  lines.push('');
  lines.push('## Diferencias');
  lines.push('');

  if (mismatches.length === 0) {
    lines.push('- Ninguna.');
  } else {
    for (const item of mismatches) lines.push(`- ${item}`);
  }

  lines.push('');
  lines.push('## Nota');
  lines.push('');
  lines.push('Esta validación confirma la carga histórica inicial. No reemplaza la sincronización viva incremental de HR.');
  lines.push('');
  lines.push('## Restricciones conservadas');
  lines.push('');
  lines.push('- No se escribió Firestore en esta validación.');
  lines.push('- No se hizo deploy de Hosting.');
  lines.push('- No se hizo merge.');
  lines.push('- No se tocó producción.');
  lines.push('- No se cargó Storage/evidencias.');
  lines.push('- No se activó adapter global.');
  lines.push('- No se modificó /app/modules.');

  fs.writeFileSync(outputMdPath, lines.join('\n'), 'utf8');

  console.log('');
  console.log(lines.join('\n'));

  if (mismatches.length > 0) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error('== ERROR validación compacta HR histórico V4 ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
