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

const jsonPath = process.env.CXORBIA_TYA_HR_HISTORY_V4_PATH;
const outputMdPath = process.env.CXORBIA_TYA_HR_HISTORY_VALIDATE_MD;

const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(firebaseDir, 'auth-dev-tools', 'output');

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
  if (enabled !== false) {
    throw new Error('CX.BACKEND.enabled principal no está en false. Detengo validación.');
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

  if (!files.length) throw new Error('No encontré reporte local auth-import-users-*.md.');

  const text = readText(files[0]);
  const match = text.match(/Password DEV temporal compartido:[\s\S]*?```text\s*([\s\S]*?)\s*```/i);

  if (!match || !match[1] || !match[1].trim()) {
    throw new Error('No pude leer la clave DEV temporal desde el reporte local.');
  }

  return match[1].trim();
}

async function validateRefs(refs, label) {
  let found = 0;
  let missing = 0;
  const missingExamples = [];
  const chunkSize = 40;

  for (let i = 0; i < refs.length; i += chunkSize) {
    const chunk = refs.slice(i, i + chunkSize);
    const snaps = await Promise.all(chunk.map((item) => getDoc(item.ref)));

    for (let j = 0; j < snaps.length; j++) {
      if (snaps[j].exists()) {
        found += 1;
      } else {
        missing += 1;
        if (missingExamples.length < 10) missingExamples.push(chunk[j].label);
      }
    }

    console.log(`Validando ${label}: ${Math.min(i + chunkSize, refs.length)}/${refs.length}`);
  }

  return { expected: refs.length, found, missing, missingExamples };
}

function refItem(ref, label) {
  return { ref, label };
}

async function main() {
  console.log('== Validación exacta por IDs HR histórico V4 Firestore DEV ==');
  console.log('Solo lectura. No escribe Firestore. No Hosting. No merge. No producción.');

  if (!jsonPath || !fs.existsSync(jsonPath)) {
    throw new Error('No encontré JSON V4: ' + jsonPath);
  }

  const data = readJson(jsonPath);

  const app = initializeApp(readFirebaseConfig());
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, DEV_EMAIL, getLocalDevPassword());
  console.log('Login DEV OK.');

  const tenantRef = doc(db, 'tenants', TENANT_ID);
  const syncSourceRef = doc(db, 'tenants', TENANT_ID, 'syncSources', 'hr-tya-historico-sync');

  const clients = (data.clients || []).map((item) =>
    refItem(doc(db, 'tenants', TENANT_ID, 'clients', item.id), item.id)
  );

  const projects = (data.projects || []).map((item) =>
    refItem(doc(db, 'tenants', TENANT_ID, 'projects', item.id), item.id)
  );

  const shoppers = (data.shoppers || []).map((item) =>
    refItem(doc(db, 'tenants', TENANT_ID, 'shoppers', item.id), item.id)
  );

  const visits = (data.visits || []).map((item) =>
    refItem(doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'visits', item.id), `${item.projectId}/${item.id}`)
  );

  const questionnaires = (data.questionnaires || []).map((item) =>
    refItem(doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'questionnaires', item.id), `${item.projectId}/${item.id}`)
  );

  const liquidations = (data.liquidations || []).map((item) =>
    refItem(doc(db, 'tenants', TENANT_ID, 'projects', item.projectId, 'liquidations', item.id), `${item.projectId}/${item.id}`)
  );

  const tenantSnap = await getDoc(tenantRef);
  const syncSnap = await getDoc(syncSourceRef);

  const results = {
    tenantExists: tenantSnap.exists(),
    syncSourceExists: syncSnap.exists(),
    clients: await validateRefs(clients, 'clients'),
    projects: await validateRefs(projects, 'projects'),
    shoppers: await validateRefs(shoppers, 'shoppers'),
    visits: await validateRefs(visits, 'visits'),
    questionnaires: await validateRefs(questionnaires, 'questionnaires'),
    liquidations: await validateRefs(liquidations, 'liquidations'),
    certifications: { expected: 0, found: 0, missing: 0, missingExamples: [] }
  };

  const differences = [];

  if (!results.tenantExists) differences.push('tenant tya no existe');
  if (!results.syncSourceExists) differences.push('syncSource hr-tya-historico-sync no existe');

  for (const key of ['clients', 'projects', 'shoppers', 'visits', 'questionnaires', 'liquidations']) {
    if (results[key].missing !== 0 || results[key].found !== results[key].expected) {
      differences.push(`${key}: esperados ${results[key].expected}, encontrados ${results[key].found}, faltantes ${results[key].missing}`);
    }
  }

  const lines = [];

  lines.push('# RESULTADO-VALIDACION-IDS-HR-HISTORICO-V4-FIRESTORE-DEV-20260629');
  lines.push('');
  lines.push('## Resultado');
  lines.push('');
  lines.push(differences.length === 0 ? 'Validación exacta por IDs correcta contra Firestore DEV.' : 'Validación exacta por IDs encontró diferencias.');
  lines.push('');
  lines.push('## Conteos por IDs esperados');
  lines.push('');
  lines.push(`- tenant tya existe: ${results.tenantExists}`);
  lines.push(`- syncSource HR existe: ${results.syncSourceExists}`);
  lines.push(`- clients: ${results.clients.found}/${results.clients.expected}`);
  lines.push(`- projects: ${results.projects.found}/${results.projects.expected}`);
  lines.push(`- shoppers: ${results.shoppers.found}/${results.shoppers.expected}`);
  lines.push(`- visits: ${results.visits.found}/${results.visits.expected}`);
  lines.push(`- questionnaires: ${results.questionnaires.found}/${results.questionnaires.expected}`);
  lines.push(`- liquidations: ${results.liquidations.found}/${results.liquidations.expected}`);
  lines.push(`- certifications: 0/0`);
  lines.push('');
  lines.push('## Diferencias');
  lines.push('');

  if (differences.length === 0) {
    lines.push('- Ninguna.');
  } else {
    for (const diff of differences) lines.push(`- ${diff}`);
  }

  lines.push('');
  lines.push('## Ejemplos faltantes');
  lines.push('');

  for (const key of ['clients', 'projects', 'shoppers', 'visits', 'questionnaires', 'liquidations']) {
    if (results[key].missingExamples.length) {
      lines.push(`### ${key}`);
      for (const example of results[key].missingExamples) lines.push(`- ${example}`);
      lines.push('');
    }
  }

  if (!['clients', 'projects', 'shoppers', 'visits', 'questionnaires', 'liquidations'].some((key) => results[key].missingExamples.length)) {
    lines.push('- Ninguno.');
  }

  lines.push('');
  lines.push('## Nota');
  lines.push('');
  lines.push('Esta validación confirma por IDs exactos la carga histórica inicial. Los datos previos de seed/piloto en DEV no afectan este resultado.');
  lines.push('La sincronización viva incremental de HR sigue pendiente.');
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
}

main().catch((error) => {
  console.error('== ERROR validación exacta por IDs HR histórico V4 ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
