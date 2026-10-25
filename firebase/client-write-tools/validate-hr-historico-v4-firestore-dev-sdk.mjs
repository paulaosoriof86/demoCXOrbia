import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const TENANT_ID = 'tya';
const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';

const transformedPath = process.env.CXORBIA_TYA_HR_HISTORY_V4_PATH;
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

async function countExisting(refs, label) {
  let found = 0;
  let missing = 0;
  const chunkSize = 40;

  for (let i = 0; i < refs.length; i += chunkSize) {
    const chunk = refs.slice(i, i + chunkSize);
    const snaps = await Promise.all(chunk.map((ref) => getDoc(ref)));
    for (const snap of snaps) {
      if (snap.exists()) found += 1;
      else missing += 1;
    }
    console.log(`Validando ${label}: ${Math.min(i + chunkSize, refs.length)}/${refs.length}`);
  }

  return { found, missing, expected: refs.length };
}

function assertExpected(label, result, expected) {
  if (result.found !== expected || result.missing !== 0) {
    throw new Error(`${label} no coincide. Encontrados=${result.found}, faltantes=${result.missing}, esperado=${expected}`);
  }
}

async function main() {
  console.log('== Validacion lectura exacta HR historico V4 Firestore DEV ==');
  console.log('Solo lectura. No escribe Firestore. No Hosting. No merge. No produccion.');

  if (!fs.existsSync(transformedPath)) throw new Error('No encontre JSON V4: ' + transformedPath);

  const data = readJson(transformedPath);

  if (countArray(data.clients) !== EXPECTED.clients) throw new Error('Source clients inesperado.');
  if (countArray(data.projects) !== EXPECTED.projects) throw new Error('Source projects inesperado.');
  if (countArray(data.shoppers) !== EXPECTED.shoppers) throw new Error('Source shoppers inesperado.');
  if (countArray(data.visits) !== EXPECTED.visits) throw new Error('Source visits inesperado.');
  if (countArray(data.questionnaires) !== EXPECTED.questionnaires) throw new Error('Source questionnaires inesperado.');
  if (countArray(data.liquidations) !== EXPECTED.liquidations) throw new Error('Source liquidations inesperado.');

  const app = initializeApp(readFirebaseConfig());
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, DEV_EMAIL, getLocalDevPassword());
  console.log('Login DEV OK.');

  const clientRefs = (data.clients || []).map((item) => doc(db, 'tenants', TENANT_ID, 'clients', item.id));
  const projectRefs = (data.projects || []).map((item) => doc(db, 'tenants', TENANT_ID, 'projects', item.id));
  const shopperRefs = (data.shoppers || []).map((item) => doc(db, 'tenants', TENANT_ID, 'shoppers', item.id));
  const visitRefs = (data.visits || []).map((item) => doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'visits', item.id));
  const questionnaireRefs = (data.questionnaires || []).map((item) => doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'questionnaires', item.id));
  const liquidationRefs = (data.liquidations || []).map((item) => doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'liquidations', item.id));

  const results = {
    clients: await countExisting(clientRefs, 'clients'),
    projects: await countExisting(projectRefs, 'projects'),
    shoppers: await countExisting(shopperRefs, 'shoppers'),
    visits: await countExisting(visitRefs, 'visits'),
    questionnaires: await countExisting(questionnaireRefs, 'questionnaires'),
    liquidations: await countExisting(liquidationRefs, 'liquidations'),
    certifications: { found: 0, missing: 0, expected: 0 }
  };

  assertExpected('clients', results.clients, EXPECTED.clients);
  assertExpected('projects', results.projects, EXPECTED.projects);
  assertExpected('shoppers', results.shoppers, EXPECTED.shoppers);
  assertExpected('visits', results.visits, EXPECTED.visits);
  assertExpected('questionnaires', results.questionnaires, EXPECTED.questionnaires);
  assertExpected('liquidations', results.liquidations, EXPECTED.liquidations);

  const lines = [];
  lines.push('# RESULTADO VALIDACION LECTURA HR HISTORICO V4 FIRESTORE DEV 20260629');
  lines.push('');
  lines.push('## Resultado');
  lines.push('');
  lines.push('Validacion exacta contra Firestore DEV completada.');
  lines.push('');
  lines.push('## Conteos encontrados');
  lines.push('');
  lines.push(`- clients: ${results.clients.found}`);
  lines.push(`- projects: ${results.projects.found}`);
  lines.push(`- shoppers: ${results.shoppers.found}`);
  lines.push(`- visits: ${results.visits.found}`);
  lines.push(`- questionnaires: ${results.questionnaires.found}`);
  lines.push(`- liquidations: ${results.liquidations.found}`);
  lines.push(`- certifications: ${results.certifications.found}`);
  lines.push('');
  lines.push('## Faltantes');
  lines.push('');
  lines.push(`- clients faltantes: ${results.clients.missing}`);
  lines.push(`- projects faltantes: ${results.projects.missing}`);
  lines.push(`- shoppers faltantes: ${results.shoppers.missing}`);
  lines.push(`- visits faltantes: ${results.visits.missing}`);
  lines.push(`- questionnaires faltantes: ${results.questionnaires.missing}`);
  lines.push(`- liquidations faltantes: ${results.liquidations.missing}`);
  lines.push('');
  lines.push('## Nota');
  lines.push('');
  lines.push('Esta validacion confirma la carga historica inicial. No reemplaza la sincronizacion viva incremental de HR.');
  lines.push('');
  lines.push('## Restricciones conservadas');
  lines.push('');
  lines.push('- No se escribio Firestore en esta validacion.');
  lines.push('- No se hizo deploy de Hosting.');
  lines.push('- No se hizo merge.');
  lines.push('- No se toco produccion.');
  lines.push('- No se cargo Storage/evidencias.');
  lines.push('- No se activo adapter global.');
  lines.push('- No se modifico /app/modules.');

  fs.writeFileSync(outputMdPath, lines.join('\n'), 'utf8');

  console.log('');
  console.log(lines.join('\n'));
}

main().catch((error) => {
  console.error('== ERROR validacion lectura exacta HR historico V4 ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
