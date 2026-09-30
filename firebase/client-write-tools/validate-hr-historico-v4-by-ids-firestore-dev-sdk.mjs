import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const firebaseDir = path.join(__dirname, '..');

const DEV_EMAIL = 'super.dev@cxorbia-dev.example.com';
const TENANT_ID = process.env.CXORBIA_TYA_TENANT_ID || 'tya';
const transformedPath = process.env.CXORBIA_HR_V4_TRANSFORMED_PATH || path.join(firebaseDir, 'private-output', 'hr-tya-historico-good-firestore-transform-v4.json');
const backendConfigPath = path.join(__dirname, '..', '..', 'app', 'core', 'backend-config.js');
const authOutputDir = path.join(firebaseDir, 'auth-dev-tools', 'output');
const outputDir = path.join(firebaseDir, 'private-output');
const outputMarkdownPath = path.join(outputDir, 'resultado-validacion-hr-historico-v4-by-ids-firestore-dev.md');
const outputJsonPath = path.join(outputDir, 'resultado-validacion-hr-historico-v4-by-ids-firestore-dev.json');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getId(item) {
  if (!item || typeof item !== 'object') return '';
  return String(item.id || item.docId || '').trim();
}

function getProjectId(item) {
  if (!item || typeof item !== 'object') return '';
  return String(item.projectId || item.proyectoId || item.project_id || '').trim();
}

function addExpected(expected, issues, bucket, pathParts, item) {
  const id = getId(item);
  if (!id) {
    issues.push({ bucket, reason: 'registro sin id', item });
    return;
  }
  expected[bucket].push({ id, pathParts, path: pathParts.join('/') });
}

function addProjectScopedExpected(expected, issues, bucket, projectScopedName, item) {
  const id = getId(item);
  const projectId = getProjectId(item);
  if (!id) {
    issues.push({ bucket, reason: 'registro sin id', item });
    return;
  }
  if (!projectId) {
    issues.push({ bucket, id, reason: 'registro sin projectId; no se puede calcular ruta Firestore', item });
    return;
  }
  expected[bucket].push({
    id,
    projectId,
    pathParts: ['tenants', TENANT_ID, 'projects', projectId, projectScopedName, id],
    path: ['tenants', TENANT_ID, 'projects', projectId, projectScopedName, id].join('/')
  });
}

function buildExpected(data) {
  const expected = {
    tenant: [],
    clients: [],
    projects: [],
    shoppers: [],
    visits: [],
    questionnaires: [],
    liquidations: []
  };
  const issues = [];

  expected.tenant.push({ id: TENANT_ID, pathParts: ['tenants', TENANT_ID], path: ['tenants', TENANT_ID].join('/') });

  for (const item of asArray(data.clients)) {
    const id = getId(item);
    addExpected(expected, issues, 'clients', ['tenants', TENANT_ID, 'clients', id], item);
  }

  for (const item of asArray(data.projects)) {
    const id = getId(item);
    addExpected(expected, issues, 'projects', ['tenants', TENANT_ID, 'projects', id], item);
  }

  for (const item of asArray(data.shoppers)) {
    const id = getId(item);
    addExpected(expected, issues, 'shoppers', ['tenants', TENANT_ID, 'shoppers', id], item);
  }

  for (const item of asArray(data.visits)) addProjectScopedExpected(expected, issues, 'visits', 'visits', item);
  for (const item of asArray(data.questionnaires)) addProjectScopedExpected(expected, issues, 'questionnaires', 'questionnaires', item);
  for (const item of asArray(data.liquidations)) addProjectScopedExpected(expected, issues, 'liquidations', 'liquidations', item);

  return { expected, issues };
}

function countExpected(expected) {
  return Object.fromEntries(Object.entries(expected).map(([key, items]) => [key, items.length]));
}

function uniqueProjectIds(expected) {
  return [...new Set(expected.projects.map((item) => item.id).filter(Boolean))].sort();
}

async function mapWithLimit(items, limit, mapper) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(mapper));
    results.push(...chunkResults);
  }
  return results;
}

async function validateExpectedDocs(db, expected) {
  const result = {};

  for (const [bucket, items] of Object.entries(expected)) {
    const checked = await mapWithLimit(items, 25, async (item) => {
      const snapshot = await getDoc(doc(db, ...item.pathParts));
      return { ...item, exists: snapshot.exists() };
    });

    result[bucket] = {
      expected: items.length,
      found: checked.filter((item) => item.exists).length,
      missing: checked.filter((item) => !item.exists).map((item) => item.path)
    };
  }

  return result;
}

async function readActualIds(db, expected) {
  const actual = {
    clients: new Set(),
    projects: new Set(),
    shoppers: new Set(),
    visits: new Set(),
    questionnaires: new Set(),
    liquidations: new Set()
  };

  for (const bucket of ['clients', 'projects', 'shoppers']) {
    const snapshot = await getDocs(collection(db, 'tenants', TENANT_ID, bucket));
    snapshot.forEach((docSnap) => actual[bucket].add(docSnap.id));
  }

  for (const projectId of uniqueProjectIds(expected)) {
    for (const bucket of ['visits', 'questionnaires', 'liquidations']) {
      const snapshot = await getDocs(collection(db, 'tenants', TENANT_ID, 'projects', projectId, bucket));
      snapshot.forEach((docSnap) => actual[bucket].add(projectId + '/' + docSnap.id));
    }
  }

  return actual;
}

function buildExpectedIdSets(expected) {
  const sets = {
    clients: new Set(expected.clients.map((item) => item.id)),
    projects: new Set(expected.projects.map((item) => item.id)),
    shoppers: new Set(expected.shoppers.map((item) => item.id)),
    visits: new Set(expected.visits.map((item) => item.projectId + '/' + item.id)),
    questionnaires: new Set(expected.questionnaires.map((item) => item.projectId + '/' + item.id)),
    liquidations: new Set(expected.liquidations.map((item) => item.projectId + '/' + item.id))
  };
  return sets;
}

function compareActualVsExpected(actual, expectedSets) {
  const result = {};
  for (const bucket of Object.keys(expectedSets)) {
    const expected = expectedSets[bucket];
    const actualSet = actual[bucket];
    const extras = [...actualSet].filter((id) => !expected.has(id)).sort();
    const missingBySet = [...expected].filter((id) => !actualSet.has(id)).sort();
    result[bucket] = {
      expectedIds: expected.size,
      actualIdsRead: actualSet.size,
      missingByIdSet: missingBySet,
      extrasInDevScope: extras
    };
  }
  return result;
}

function sample(items, max = 25) {
  return items.slice(0, max);
}

function makeMarkdown(report) {
  const lines = [];
  lines.push('# RESULTADO-VALIDACION-HR-HISTORICO-V4-BY-IDS-FIRESTORE-DEV');
  lines.push('');
  lines.push('## Alcance');
  lines.push('');
  lines.push('- Validación de solo lectura contra Firestore DEV.');
  lines.push('- Fuente esperada: JSON HR histórico V4 local.');
  lines.push('- Comparación por rutas e IDs exactos esperados.');
  lines.push('- No se escribió Firestore.');
  lines.push('- No se hizo Hosting.');
  lines.push('- No se hizo merge.');
  lines.push('- No se tocó producción.');
  lines.push('- No se activó adapter global.');
  lines.push('- No se modificó `/app/modules`.');
  lines.push('');
  lines.push('## Resultado');
  lines.push('');
  lines.push('- Estado: `' + report.status + '`.');
  lines.push('- Fecha de validación: `' + report.generatedAt + '`.');
  lines.push('- Tenant validado: `' + report.tenantId + '`.');
  lines.push('- Archivo origen: `' + report.sourcePath + '`.');
  lines.push('');
  lines.push('## Conteos esperados desde JSON V4');
  lines.push('');
  for (const [bucket, count] of Object.entries(report.expectedCounts)) {
    lines.push('- ' + bucket + ': ' + count);
  }
  lines.push('');
  lines.push('## Validación por documentos esperados');
  lines.push('');
  lines.push('| Colección | Esperados | Encontrados | Faltantes |');
  lines.push('|---|---:|---:|---:|');
  for (const [bucket, item] of Object.entries(report.expectedDocValidation)) {
    lines.push('| ' + bucket + ' | ' + item.expected + ' | ' + item.found + ' | ' + item.missing.length + ' |');
  }
  lines.push('');
  lines.push('## Lectura adicional de IDs dentro del alcance DEV');
  lines.push('');
  lines.push('Los extras no bloquean por sí solos porque Firestore DEV ya puede contener seed/piloto previo. Sirven para no confundir conteos globales con validación del histórico HR V4.');
  lines.push('');
  lines.push('| Colección | IDs esperados | IDs leídos en DEV | Faltantes por set | Extras DEV no bloqueantes |');
  lines.push('|---|---:|---:|---:|---:|');
  for (const [bucket, item] of Object.entries(report.actualVsExpectedIds)) {
    lines.push('| ' + bucket + ' | ' + item.expectedIds + ' | ' + item.actualIdsRead + ' | ' + item.missingByIdSet.length + ' | ' + item.extrasInDevScope.length + ' |');
  }
  lines.push('');

  const missingPaths = Object.entries(report.expectedDocValidation)
    .flatMap(([bucket, item]) => item.missing.map((path) => ({ bucket, path })));
  if (missingPaths.length) {
    lines.push('## Faltantes detectados');
    lines.push('');
    for (const item of sample(missingPaths)) lines.push('- ' + item.bucket + ': `' + item.path + '`');
    if (missingPaths.length > 25) lines.push('- ... ' + (missingPaths.length - 25) + ' faltantes adicionales.');
    lines.push('');
  }

  const invalid = report.sourceIssues || [];
  if (invalid.length) {
    lines.push('## Registros del JSON con problema de ruta');
    lines.push('');
    for (const item of sample(invalid)) lines.push('- ' + item.bucket + ': ' + item.reason + (item.id ? ' (`' + item.id + '`)' : ''));
    if (invalid.length > 25) lines.push('- ... ' + (invalid.length - 25) + ' registros adicionales.');
    lines.push('');
  }

  lines.push('## Interpretación');
  lines.push('');
  if (report.status === 'OK') {
    lines.push('La carga HR histórico V4 queda validada por IDs exactos esperados en Firestore DEV. Cualquier extra reportado debe tratarse como dato DEV previo, no como falla de la carga V4, salvo que corresponda al mismo periodo/proyecto y deba depurarse en un gate posterior.');
  } else {
    lines.push('La carga HR histórico V4 no debe declararse validada todavía. Se debe revisar la lista de faltantes o registros sin ruta antes de repetir cualquier carga o avanzar a integración visual.');
  }
  lines.push('');
  lines.push('## Clasificación doble documentación');
  lines.push('');
  lines.push('- TyA específico: validación de HR histórico GT/HN V4 y tenant `tya`.');
  lines.push('- CXOrbia generalizable: patrón de validación por IDs exactos después de migraciones, sin depender de conteos globales contaminados por seed/piloto DEV.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  console.log('== Validación HR histórico V4 por IDs contra Firestore DEV ==');
  console.log('Alcance: solo lectura; sin repetir carga, sin Hosting, sin merge, sin producción.');

  if (!fs.existsSync(transformedPath)) throw new Error('No encontré JSON HR histórico V4: ' + transformedPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const firebaseConfig = readFirebaseConfig();
  const password = getLocalDevPassword();
  const data = readJson(transformedPath);
  const { expected, issues } = buildExpected(data);
  const expectedCounts = countExpected(expected);

  console.log('Archivo origen:', transformedPath);
  console.log('Tenant:', TENANT_ID);
  console.log('Conteos esperados:', JSON.stringify(expectedCounts));

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('== Login usuario DEV ficticio ==');
  await signInWithEmailAndPassword(auth, DEV_EMAIL, password);
  console.log('Login DEV OK.');

  const expectedDocValidation = await validateExpectedDocs(db, expected);
  const actual = await readActualIds(db, expected);
  const actualVsExpectedIds = compareActualVsExpected(actual, buildExpectedIdSets(expected));

  const missingCount = Object.values(expectedDocValidation).reduce((sum, item) => sum + item.missing.length, 0);
  const missingBySetCount = Object.values(actualVsExpectedIds).reduce((sum, item) => sum + item.missingByIdSet.length, 0);
  const status = missingCount === 0 && missingBySetCount === 0 && issues.length === 0 ? 'OK' : 'REVISAR';

  const report = {
    status,
    generatedAt: new Date().toISOString(),
    tenantId: TENANT_ID,
    sourcePath: transformedPath,
    expectedCounts,
    expectedDocValidation,
    actualVsExpectedIds,
    sourceIssues: issues
  };

  fs.writeFileSync(outputJsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(outputMarkdownPath, makeMarkdown(report) + '\n', 'utf8');

  console.log('== Resumen validación ==');
  console.log('Estado:', status);
  console.log('Faltantes por rutas esperadas:', missingCount);
  console.log('Faltantes por sets de IDs:', missingBySetCount);
  console.log('Registros con problema de ruta en JSON:', issues.length);
  console.log('Reporte Markdown:', outputMarkdownPath);
  console.log('Reporte JSON:', outputJsonPath);
  console.log('No se escribió Firestore. No se hizo Hosting. No se hizo merge. No se tocó producción.');

  if (status !== 'OK') process.exit(2);
}

main().catch((error) => {
  console.error('== ERROR validación HR histórico V4 por IDs ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
