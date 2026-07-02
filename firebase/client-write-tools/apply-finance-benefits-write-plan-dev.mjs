import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';

const CONFIRM = 'PAULA_AUTORIZA_CARGA_BENEFICIOS_DEV_20260629';
const DEFAULT_EMAIL = 'super.dev@cxorbia-dev.example.com';
const MAX_BATCH = 450;

function arg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((x) => x.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) fail(`No existe ${label}: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function validateGate(validation, allowReview) {
  const status = validation.status || validation.result || 'UNKNOWN';
  if (status === 'FAIL') fail('La validación del write-plan está en FAIL. No se carga Firestore DEV.', 2);
  if (status === 'REVIEW' && allowReview !== true) {
    fail('La validación del write-plan está en REVIEW. Requiere --allowReview=true.', 3);
  }
  if (!['OK', 'REVIEW'].includes(status)) {
    fail(`Estado de validación no permitido: ${status}`, 4);
  }
  return status;
}

function validateWriteOps(plan) {
  const ops = Array.isArray(plan.writeOps) ? plan.writeOps : [];
  if (!ops.length) fail('El write-plan no contiene writeOps.', 5);

  const seen = new Set();
  const errors = [];
  const deniedCollections = ['paymentLots', 'financialMovements', 'reconciliations', 'finance', 'lots', 'liquidations'];

  for (const [idx, op] of ops.entries()) {
    const opPath = String(op.path || '');
    const docData = op.doc || {};

    if (op.op !== 'set') errors.push(`op_${idx}: operación no permitida ${op.op}`);
    if (!opPath.startsWith('tenants/')) errors.push(`op_${idx}: ruta fuera de tenants/: ${opPath}`);
    if (!/^tenants\/[^/]+\/shopperBenefits\/[^/]+$/.test(opPath)) errors.push(`op_${idx}: ruta no es shopperBenefits: ${opPath}`);
    if (seen.has(opPath)) errors.push(`op_${idx}: ruta duplicada: ${opPath}`);
    seen.add(opPath);

    for (const denied of deniedCollections) {
      if (opPath.includes(`/${denied}/`)) errors.push(`op_${idx}: colección prohibida: ${denied}`);
    }

    if (!docData.benefitId) errors.push(`op_${idx}: falta benefitId`);
    if (!docData.visitId) errors.push(`op_${idx}: falta visitId`);
    if (!docData.shopperId) errors.push(`op_${idx}: falta shopperId`);
    if (!docData.projectId) errors.push(`op_${idx}: falta projectId`);
    if (docData.status === 'paid') errors.push(`op_${idx}: status paid no permitido para carga de beneficios calculados`);
  }

  if (errors.length) {
    console.error(errors.slice(0, 100).join('\n'));
    if (errors.length > 100) console.error(`... ${errors.length - 100} errores adicionales`);
    fail('El write-plan no pasó validación estricta de carga DEV.', 6);
  }

  return ops;
}

function byCountry(ops) {
  return ops.reduce((acc, op) => {
    const c = op.doc?.country || 'OTHER';
    const total = Number(op.doc?.totalCalculated || 0);
    const honorarium = Number(op.doc?.honorariumAmount || 0);
    const reimbursements = Number(op.doc?.ticketReimbursementAmount || 0)
      + Number(op.doc?.comboReimbursementAmount || 0)
      + Number(op.doc?.otherReimbursementAmount || 0);

    acc[c] = acc[c] || { count: 0, total: 0, honorarium: 0, reimbursements: 0 };
    acc[c].count += 1;
    acc[c].total += total;
    acc[c].honorarium += honorarium;
    acc[c].reimbursements += reimbursements;
    return acc;
  }, {});
}

function renderSummary(result) {
  const lines = [];
  lines.push('# Resultado carga DEV — shopperBenefits');
  lines.push('');
  lines.push(`Estado: ${result.status}`);
  lines.push(`Firebase projectId: ${result.firebaseProjectId}`);
  lines.push(`Tenant: ${result.tenantId}`);
  lines.push(`Registros escritos: ${result.counts.written}`);
  lines.push(`Batches ejecutados: ${result.counts.batches}`);
  lines.push(`Confirmación usada: ${result.confirmation}`);
  lines.push('');
  lines.push('## Alcance');
  lines.push('- Solo se escribieron documentos en `tenants/{tenantId}/shopperBenefits/{benefitId}`.');
  lines.push('- No se escribieron pagos reales.');
  lines.push('- No se escribieron `paymentLots`, `financialMovements` ni `reconciliations`.');
  lines.push('- No se publicó Hosting, no se hizo merge y no se tocó producción.');
  lines.push('');
  lines.push('## Por país');
  for (const [country, item] of Object.entries(result.byCountry)) {
    lines.push(`- ${country}: ${item.count} beneficios · total ${item.total.toFixed(2)} · honorarios ${item.honorarium.toFixed(2)} · reembolsos ${item.reimbursements.toFixed(2)}`);
  }
  lines.push('');
  lines.push('## Archivos de salida');
  lines.push(`- ${result.outputs.json}`);
  lines.push(`- ${result.outputs.summary}`);
  return lines.join('\n');
}

async function main() {
  const root = process.cwd();
  const outDir = path.join(root, 'firebase', 'private-output');
  const planPath = path.join(outDir, 'finance-benefits-write-plan-dry-run.json');
  const validationPath = path.join(outDir, 'finance-benefits-write-plan-validation.json');
  const resultJsonPath = path.join(outDir, 'finance-benefits-dev-apply-result.json');
  const resultSummaryPath = path.join(outDir, 'finance-benefits-dev-apply-result-summary.md');

  const confirmValue = arg('confirm');
  if (confirmValue !== CONFIRM) {
    fail(`Confirmación inválida. Usa --confirm=${CONFIRM}`, 10);
  }

  const cfg = loadBackendConfig(root);
  const projectId = cfg.firebaseConfig?.projectId;
  if (projectId !== 'cxorbia-backend-dev') {
    fail(`Firebase projectId no es DEV esperado: ${projectId}`, 11);
  }

  const plan = readJson(planPath, 'write-plan validado');
  const validation = readJson(validationPath, 'validación del write-plan');
  const validationStatus = validateGate(validation, arg('allowReview') === 'true' || flag('allowReview'));
  const ops = validateWriteOps(plan);

  const credential = arg('credential') || process.env.CXORBIA_DEV_CREDENTIAL;
  const email = arg('email') || DEFAULT_EMAIL;
  if (!credential) fail('Falta credencial DEV local. Define CXORBIA_DEV_CREDENTIAL o usa --credential=...', 12);

  const app = initializeApp(cfg.firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, email, credential);

  const startedAt = new Date().toISOString();
  let batch = writeBatch(db);
  let batchSize = 0;
  let batches = 0;
  let written = 0;

  for (const op of ops) {
    batch.set(doc(db, op.path), {
      ...op.doc,
      devAppliedAt: startedAt,
      devAppliedBy: email,
      devApplySource: 'finance-benefits-write-plan-dry-run'
    }, { merge: true });

    batchSize += 1;
    written += 1;

    if (batchSize >= MAX_BATCH) {
      await batch.commit();
      batches += 1;
      batch = writeBatch(db);
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
    batches += 1;
  }

  const result = {
    status: 'OK',
    mode: 'apply-finance-benefits-write-plan-dev',
    firebaseProjectId: projectId,
    tenantId: cfg.tenantId || 'tya',
    confirmation: CONFIRM,
    authEmail: email,
    validationStatus,
    startedAt,
    finishedAt: new Date().toISOString(),
    counts: {
      plannedOps: ops.length,
      written,
      batches,
      maxBatchSize: MAX_BATCH
    },
    byCountry: byCountry(ops),
    safeguards: {
      onlyTenantsPaths: true,
      onlyShopperBenefits: true,
      noPaymentLots: true,
      noFinancialMovements: true,
      noReconciliations: true,
      noRealPaymentsMarked: true,
      noHostingDeploy: true,
      noProduction: true,
      noMerge: true
    },
    inputs: {
      planPath,
      validationPath
    },
    outputs: {
      json: resultJsonPath,
      summary: resultSummaryPath
    }
  };

  fs.writeFileSync(resultJsonPath, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(resultSummaryPath, renderSummary(result), 'utf8');

  console.log(renderSummary(result));
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(99);
});
