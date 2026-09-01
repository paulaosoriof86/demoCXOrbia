import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const contractDir = process.env.CXORBIA_TYA_IMPORT_CONTRACT_OUT || path.join(repoRoot, 'tmp', 'tya-dev-import-contract');
const contractPath = process.env.CXORBIA_TYA_IMPORT_CONTRACT_PATH || path.join(contractDir, 'tyaDevImportContract.json');
const outDir = process.env.CXORBIA_TYA_IMPORT_CONTRACT_VALIDATION_OUT || path.join(repoRoot, 'tmp', 'tya-dev-import-contract-validation');

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function check(condition, code, severity, message, expected = '', detected = ''){
  if(condition) return null;
  return { code, severity, message, expected, detected };
}

function valueAt(obj, pathExpr){
  return pathExpr.split('.').reduce((cur, key) => cur && cur[key], obj);
}

fs.mkdirSync(outDir, { recursive: true });

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'contract-validation-no-firestore-writes',
  contractPath,
  status: 'failed',
  firestoreWrites: 0,
  importsExecuted: 0,
  deploy: 0,
  checks: [],
  failures: []
};

try{
  if(!fs.existsSync(contractPath)){
    throw new Error(`Missing import contract: ${contractPath}`);
  }

  const contract = readJson(contractPath);
  const assertions = [
    ['contractVersion', typeof contract.contractVersion === 'string' && contract.contractVersion.length > 0, 'contractVersion presente'],
    ['mode_locked', contract.mode === 'PLAN_ONLY_LOCKED', 'mode debe ser PLAN_ONLY_LOCKED'],
    ['tenant_tya', contract.tenantId === 'tya', 'tenantId debe ser tya'],
    ['project_present', typeof contract.projectId === 'string' && contract.projectId.length > 0, 'projectId presente'],
    ['safety_firestore_zero', valueAt(contract, 'safety.firestoreWrites') === 0, 'Firestore writes debe ser 0'],
    ['safety_imports_zero', valueAt(contract, 'safety.importsExecuted') === 0, 'importsExecuted debe ser 0'],
    ['safety_deploy_zero', valueAt(contract, 'safety.deploy') === 0, 'deploy debe ser 0'],
    ['safety_can_write_false', valueAt(contract, 'safety.canWriteToFirestore') === false, 'canWriteToFirestore debe ser false'],
    ['safety_can_import_false', valueAt(contract, 'safety.canImport') === false, 'canImport debe ser false'],
    ['safety_execute_false', valueAt(contract, 'safety.executeAllowed') === false, 'executeAllowed debe ser false'],
    ['future_approval_required', valueAt(contract, 'safety.requiresExplicitFutureApproval') === true, 'requiresExplicitFutureApproval debe ser true'],
    ['collections_array', Array.isArray(contract.collections), 'collections debe ser arreglo'],
    ['blockers_array', Array.isArray(contract.blockers), 'blockers debe ser arreglo'],
    ['gates_array', Array.isArray(contract.gates?.requiredBeforeAnyWrite), 'gates.requiredBeforeAnyWrite debe ser arreglo']
  ];

  for(const [code, ok, message] of assertions){
    const item = check(ok, code, 'critical', message, 'valid', 'invalid');
    result.checks.push({ code, ok, message });
    if(item) result.failures.push(item);
  }

  for(const collection of contract.collections || []){
    const okWrite = collection.writeAllowed === false;
    result.checks.push({ code: `collection_${collection.kind}_write_blocked`, ok: okWrite, message: `${collection.kind} writeAllowed=false` });
    if(!okWrite){
      result.failures.push({ code: 'collection_write_allowed', severity: 'critical', message: `Collection ${collection.kind} permite escritura.`, expected: false, detected: collection.writeAllowed });
    }
    const okPath = typeof collection.path === 'string' && collection.path.startsWith(`tenants/${contract.tenantId}/projects/${contract.projectId}/`);
    result.checks.push({ code: `collection_${collection.kind}_path_scope`, ok: okPath, message: `${collection.kind} path multi-tenant` });
    if(!okPath){
      result.failures.push({ code: 'collection_path_out_of_scope', severity: 'critical', message: `Collection ${collection.kind} tiene ruta fuera de scope.`, expected: `tenants/${contract.tenantId}/projects/${contract.projectId}/...`, detected: collection.path });
    }
  }

  const requiredGates = [
    'clean_migration_preview_without_critical_issues',
    'pii_policy_for_shoppers',
    'rollback_plan_reviewed',
    'dev_only_write_runner_created_separately'
  ];
  for(const gate of requiredGates){
    const ok = (contract.gates?.requiredBeforeAnyWrite || []).includes(gate);
    result.checks.push({ code: `gate_${gate}`, ok, message: `gate requerido ${gate}` });
    if(!ok){
      result.failures.push({ code: 'required_gate_missing', severity: 'critical', message: `Falta gate requerido: ${gate}`, expected: gate, detected: 'missing' });
    }
  }

  const statusOk = ['blocked', 'review_required'].includes(contract.gates?.currentStatus);
  result.checks.push({ code: 'status_safe', ok: statusOk, message: 'estado debe ser blocked o review_required' });
  if(!statusOk){
    result.failures.push({ code: 'unsafe_contract_status', severity: 'critical', message: 'Estado de contrato no permitido para fase bloqueada.', expected: 'blocked|review_required', detected: contract.gates?.currentStatus });
  }

  result.status = result.failures.length ? 'failed' : 'passed';
}catch(err){
  result.status = 'failed';
  result.failures.push({ code: 'validator_exception', severity: 'critical', message: err.message || String(err), expected: 'valid contract', detected: 'exception' });
}

const jsonPath = path.join(outDir, 'tyaDevImportContractValidation.json');
const mdPath = path.join(outDir, 'tyaDevImportContractValidation.md');
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

const md = [
  '# TyA DEV import contract validation',
  '',
  `Generated at: ${result.generatedAt}`,
  `Status: ${result.status}`,
  `Contract: ${result.contractPath}`,
  '',
  '## Safety',
  '- Firestore writes: 0',
  '- Imports executed: 0',
  '- Deploy: 0',
  '',
  '## Checks',
  ...result.checks.map(c => `- ${c.ok ? 'OK' : 'FAIL'} ${c.code}: ${c.message}`),
  '',
  '## Failures',
  ...(result.failures.length ? result.failures.map(f => `- ${f.severity}: ${f.code} — ${f.message}`) : ['- none'])
].join('\n');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(md);
console.log('');
console.log(`JSON: ${jsonPath}`);
console.log(`Markdown: ${mdPath}`);

if(result.status !== 'passed') process.exitCode = 1;
