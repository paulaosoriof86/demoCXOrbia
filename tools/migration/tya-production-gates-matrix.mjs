import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = process.env.CXORBIA_TYA_GATES_MATRIX_OUT || path.join(repoRoot, 'tmp', 'tya-production-gates-matrix');
const contractPath = process.env.CXORBIA_TYA_IMPORT_CONTRACT_PATH || path.join(repoRoot, 'tmp', 'tya-dev-import-contract', 'tyaDevImportContract.json');
const contractValidationPath = process.env.CXORBIA_TYA_IMPORT_CONTRACT_VALIDATION_PATH || path.join(repoRoot, 'tmp', 'tya-dev-import-contract-validation', 'tyaDevImportContractValidation.json');

function readJson(file, fallback = null){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function gate(id, stage, title, owner, status, evidence, nextAction, blocks){
  return { id, stage, title, owner, status, evidence, nextAction, blocks };
}

fs.mkdirSync(outDir, { recursive: true });

const contract = readJson(contractPath, null);
const validation = readJson(contractValidationPath, null);
const validationPassed = validation?.status === 'passed';
const contractSafe = contract?.safety?.canWriteToFirestore === false && contract?.safety?.executeAllowed === false && contract?.safety?.canImport === false;
const hasCriticalBlockers = Array.isArray(contract?.blockers) && contract.blockers.some(b => b.severity === 'critical');

const gates = [
  gate('G01', 'DEV preview', 'Staging preview TyA generado localmente', 'Backend', contract ? 'ready' : 'pending', 'tmp/tya-staging-preview + contrato DEV', 'Ejecutar pipeline seguro local si falta evidencia.', ['DEV import']),
  gate('G02', 'DEV preview', 'HR Source viva validada sin guardar URL completa', 'Backend', contract?.source?.hrLiveMultitabAttached ? 'ready' : 'pending', 'hrSourceMultitabPreview.json', 'Registrar fuente privada y ejecutar multitab preview.', ['DEV import']),
  gate('G03', 'DEV preview', 'Contrato DEV bloqueado generado', 'Backend', contract ? 'ready' : 'pending', 'tyaDevImportContract.json', 'Generar contrato DEV.', ['DEV import']),
  gate('G04', 'DEV preview', 'Validador confirma que no hay escritura accidental', 'Backend', validationPassed ? 'ready' : 'pending', 'tyaDevImportContractValidation.json', 'Ejecutar validador hasta que pase.', ['DEV import']),
  gate('G05', 'DEV import', 'Resolver issues criticos de migracion', 'Backend/Data', hasCriticalBlockers ? 'blocked' : 'review_required', 'validationIssues + contrato', 'Resolver DPI, duplicados, encoding, destinatarios y fila extra antes de escribir.', ['DEV import']),
  gate('G06', 'DEV import', 'Politica PII shoppers definida', 'Backend/Seguridad', 'blocked', 'pendiente politica final', 'Definir cifrado/restriccion/coleccion privada antes de importar shoppers.', ['DEV import', 'Staging']),
  gate('G07', 'DEV import', 'Cruce financiero liquidaciones completado', 'Data/Finanzas', 'blocked', 'pendiente cruce externo', 'Cruzar liquidaciones candidatas con archivo financiero autorizado.', ['DEV import', 'Staging']),
  gate('G08', 'DEV import', 'Runner de escritura DEV separado y reversible', 'Backend', 'blocked', 'no creado aun', 'Crear runner nuevo solo cuando Paula autorice escritura DEV.', ['DEV import']),
  gate('G09', 'Staging', 'Rollback revisado y probado en DEV', 'Backend', 'blocked', 'pendiente', 'Probar rollback antes de staging.', ['Staging']),
  gate('G10', 'Staging', 'Reglas Firestore/Auth/Storage validadas', 'Backend/Seguridad', 'blocked', 'pendiente emulador/revision', 'Validar reglas multi-tenant y permisos por rol.', ['Staging', 'Produccion']),
  gate('G11', 'Staging', 'Claude incorpora estados honestos en UI', 'Claude/Frontend', 'pending_frontend', 'MEJORAS-PARA-CLAUDE-DESDE-BACKEND', 'Actualizar prototipo para mostrar preview/warning/bloqueado/importacion no autorizada.', ['Produccion']),
  gate('G12', 'Produccion', 'Base nueva limpia confirmada', 'Backend/Infra', 'blocked', 'pendiente', 'Confirmar proyecto/base nueva vacia antes de importar.', ['Produccion']),
  gate('G13', 'Produccion', 'Deploy autorizado por Paula', 'Paula', 'blocked', 'sin autorizacion', 'Solo avanzar con autorizacion explicita.', ['Produccion']),
  gate('G14', 'Produccion', 'Smoke final multi-tenant', 'Backend/QA', 'blocked', 'pendiente', 'Validar tenant/projectId/roles antes de uso real.', ['Produccion'])
];

const summary = {
  generatedAt: new Date().toISOString(),
  mode: 'production-gates-matrix-no-firestore-writes',
  safety: {
    firestoreWrites: 0,
    importsExecuted: 0,
    deploy: 0,
    contractSafe: !!contractSafe
  },
  statusCounts: gates.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {}),
  nextRecommendedGate: gates.find(g => g.status === 'blocked' || g.status === 'pending' || g.status === 'pending_frontend')?.id || 'none',
  gates
};

const jsonPath = path.join(outDir, 'tyaProductionGatesMatrix.json');
const mdPath = path.join(outDir, 'tyaProductionGatesMatrix.md');
fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf8');

const md = [
  '# TyA production gates matrix',
  '',
  `Generated at: ${summary.generatedAt}`,
  `Mode: ${summary.mode}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  `- Contract safe: ${summary.safety.contractSafe}`,
  '',
  '## Status counts',
  ...Object.entries(summary.statusCounts).map(([k,v]) => `- ${k}: ${v}`),
  '',
  '## Gates',
  '| ID | Stage | Owner | Status | Gate | Next action |',
  '|---|---|---|---|---|---|',
  ...gates.map(g => `| ${g.id} | ${g.stage} | ${g.owner} | ${g.status} | ${g.title} | ${g.nextAction} |`),
  '',
  '## Notes for Claude',
  '- UI must show honest states for preview, warning, blocked, backend pending and unauthorized import.',
  '- UI must never imply data was imported when canImport is false.',
  '- HR Source must not persist full URLs in browser storage.',
  '- Source references shown to users must be masked or backend-owned opaque refs.'
].join('\n');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(md);
console.log('');
console.log(`JSON: ${jsonPath}`);
console.log(`Markdown: ${mdPath}`);
