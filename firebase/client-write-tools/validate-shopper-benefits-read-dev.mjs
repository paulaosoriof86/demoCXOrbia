import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  where
} from 'firebase/firestore';

const EXPECTED_PROJECT_ID = 'cxorbia-backend-dev';
const DEFAULT_ADMIN_EMAIL = 'admin.tya.dev@cxorbia-dev.example.com';
const DEFAULT_SHOPPER_EMAIL = 'shopper.eval01.dev@cxorbia-dev.example.com';
const DEFAULT_TENANT_ID = 'tya';

function arg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((x) => x.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function loadBackendConfig(root) {
  const configPath = path.join(root, 'app', 'core', 'backend-config.js');
  if (!fs.existsSync(configPath)) fail(`No existe backend-config.js: ${configPath}`);

  const code = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
  const sandbox = {
    window: {},
    CX: {},
    console: { log(){}, warn(){}, error(){} }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: configPath });

  const cfg = sandbox.CX && sandbox.CX.BACKEND;
  if (!cfg || !cfg.firebaseConfig) fail('backend-config.js no expuso CX.BACKEND.firebaseConfig');
  return cfg;
}

function summarize(snapshot) {
  const rows = [];
  snapshot.forEach((item) => rows.push({ id: item.id, ...item.data() }));

  const byCountry = rows.reduce((acc, row) => {
    const country = row.country || 'OTHER';
    const total = Number(row.totalCalculated || 0);
    acc[country] = acc[country] || { count: 0, total: 0 };
    acc[country].count += 1;
    acc[country].total += total;
    return acc;
  }, {});

  const uniqueShoppers = new Set(rows.map((row) => row.shopperId).filter(Boolean));
  const statuses = rows.reduce((acc, row) => {
    const status = row.status || 'EMPTY';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return { rows, byCountry, uniqueShopperCount: uniqueShoppers.size, statuses };
}

async function expectDenied(label, fn) {
  try {
    await fn();
    return { label, denied: false, message: 'UNEXPECTED_ALLOWED' };
  } catch (error) {
    const msg = String(error && error.message ? error.message : error);
    const denied = msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED') || msg.includes('Missing or insufficient permissions');
    return { label, denied, message: msg };
  }
}

function renderMarkdown(result) {
  const lines = [];
  lines.push('# RESULTADO-VALIDACION-LECTURA-BENEFICIOS-FIRESTORE-DEV');
  lines.push('');
  lines.push(`Estado: ${result.status}`);
  lines.push(`Firebase projectId: ${result.firebaseProjectId}`);
  lines.push(`Tenant: ${result.tenantId}`);
  lines.push(`Admin email: ${result.adminEmail}`);
  lines.push(`Shopper email: ${result.shopperEmail}`);
  lines.push('');
  lines.push('## Lectura admin');
  lines.push(`- Total leido: ${result.admin.total}`);
  lines.push(`- Shoppers unicos: ${result.admin.uniqueShopperCount}`);
  for (const [country, item] of Object.entries(result.admin.byCountry)) {
    lines.push(`- ${country}: ${item.count} beneficios - total ${item.total.toFixed(2)}`);
  }
  lines.push('');
  lines.push('## Lectura shopper');
  lines.push(`- Query propia permitida: ${result.shopper.ownQueryAllowed}`);
  lines.push(`- Registros propios para shopperId ${result.shopper.shopperId}: ${result.shopper.ownCount}`);
  lines.push(`- Lectura global shopper bloqueada: ${result.shopper.globalDenied}`);
  lines.push(`- Lectura directa de beneficio ajeno bloqueada: ${result.shopper.foreignDocDenied}`);
  lines.push('');
  lines.push('## Validaciones');
  for (const item of result.validations) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Alcance');
  lines.push('- Solo lectura en Firestore DEV.');
  lines.push('- No se escribieron documentos.');
  lines.push('- No se publico Hosting.');
  lines.push('- No se hizo merge.');
  lines.push('- No se toco produccion.');
  lines.push('- No se modifico /app/modules.');
  return lines.join('\n');
}

async function main() {
  const root = process.cwd();
  const outDir = path.join(root, 'firebase', 'private-output');
  fs.mkdirSync(outDir, { recursive: true });

  const cfg = loadBackendConfig(root);
  const projectId = cfg.firebaseConfig?.projectId;
  if (projectId !== EXPECTED_PROJECT_ID) fail(`Firebase projectId no es DEV esperado: ${projectId}`, 10);

  const tenantId = arg('tenant') || cfg.tenantId || DEFAULT_TENANT_ID;
  const credential = arg('credential') || process.env.CXORBIA_DEV_CREDENTIAL;
  if (!credential) fail('Falta CXORBIA_DEV_CREDENTIAL o --credential=...', 11);

  const adminEmail = arg('adminEmail') || DEFAULT_ADMIN_EMAIL;
  const shopperEmail = arg('shopperEmail') || DEFAULT_SHOPPER_EMAIL;
  const shopperId = arg('shopperId') || 'eval-01';

  const app = initializeApp(cfg.firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const benefitsRef = collection(db, 'tenants', tenantId, 'shopperBenefits');

  await signInWithEmailAndPassword(auth, adminEmail, credential);
  const adminSnapshot = await getDocs(benefitsRef);
  const adminSummary = summarize(adminSnapshot);
  const foreignSample = adminSummary.rows.find((row) => row.shopperId && row.shopperId !== shopperId) || adminSummary.rows[0] || null;

  await signInWithEmailAndPassword(auth, shopperEmail, credential);
  const ownSnapshot = await getDocs(query(benefitsRef, where('shopperId', '==', shopperId), limit(25)));

  const globalRead = await expectDenied('shopper_global_collection', async () => {
    await getDocs(query(benefitsRef, limit(1)));
  });

  let foreignRead = { denied: true, message: 'NO_FOREIGN_SAMPLE' };
  if (foreignSample) {
    foreignRead = await expectDenied('shopper_foreign_doc', async () => {
      await getDoc(doc(db, 'tenants', tenantId, 'shopperBenefits', foreignSample.id));
    });
  }

  const validations = [];
  validations.push(adminSummary.rows.length === 572 ? 'OK admin leyo 572 beneficios.' : `REVIEW admin leyo ${adminSummary.rows.length}, esperado 572.`);
  validations.push(adminSummary.byCountry.GT?.count === 441 ? 'OK GT 441.' : `REVIEW GT ${adminSummary.byCountry.GT?.count || 0}, esperado 441.`);
  validations.push(adminSummary.byCountry.HN?.count === 131 ? 'OK HN 131.' : `REVIEW HN ${adminSummary.byCountry.HN?.count || 0}, esperado 131.`);
  validations.push(globalRead.denied ? 'OK shopper no puede leer coleccion global.' : 'FAIL shopper pudo leer coleccion global.');
  validations.push(foreignRead.denied ? 'OK shopper no puede leer beneficio ajeno.' : 'FAIL shopper pudo leer beneficio ajeno.');

  const hasFail = validations.some((x) => x.startsWith('FAIL'));
  const hasReview = validations.some((x) => x.startsWith('REVIEW'));

  const result = {
    status: hasFail ? 'FAIL' : hasReview ? 'REVIEW' : 'OK',
    firebaseProjectId: projectId,
    tenantId,
    adminEmail,
    shopperEmail,
    admin: {
      total: adminSummary.rows.length,
      byCountry: adminSummary.byCountry,
      uniqueShopperCount: adminSummary.uniqueShopperCount,
      statuses: adminSummary.statuses
    },
    shopper: {
      shopperId,
      ownQueryAllowed: true,
      ownCount: ownSnapshot.size,
      globalDenied: globalRead.denied,
      foreignDocDenied: foreignRead.denied
    },
    validations,
    generatedAt: new Date().toISOString()
  };

  const jsonPath = path.join(outDir, 'shopper-benefits-read-validation-dev.json');
  const mdPath = path.join(outDir, 'shopper-benefits-read-validation-dev.md');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(mdPath, renderMarkdown(result), 'utf8');

  console.log(renderMarkdown(result));
  if (result.status === 'FAIL') process.exit(2);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(99);
});
