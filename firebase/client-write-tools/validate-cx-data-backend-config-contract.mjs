import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'firebase', 'contracts', 'cx-data-backend-config-contract-v1.json');
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(contractPath)) {
  console.error('No existe contrato:', contractPath);
  process.exit(1);
}

const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const fail = [];
const review = [];

const requiredMethods = [
  'getTenantConfig',
  'saveTenantConfig',
  'getProjectConfig',
  'saveProjectConfig',
  'getIntegrationCatalog',
  'getTenantIntegrations',
  'saveIntegrationConfig',
  'testIntegration',
  'getAutomationRules',
  'saveAutomationRule',
  'testAutomationRule',
  'getAutomationRuns',
  'getConfigAuditLogs'
];

if (!contract.contractVersion) fail.push('missing_contractVersion');
if (!contract.methods || typeof contract.methods !== 'object') fail.push('missing_methods');

for (const method of requiredMethods) {
  const spec = contract.methods?.[method];
  if (!spec) {
    fail.push(`missing_method:${method}`);
    continue;
  }
  if (!spec.scope) fail.push(`${method}:missing_scope`);
  if (!spec.mode) fail.push(`${method}:missing_mode`);
  if (!spec.input) fail.push(`${method}:missing_input`);
  if (!spec.output) fail.push(`${method}:missing_output`);
  if (method.startsWith('save') && !Array.isArray(spec.requires)) review.push(`${method}:write_method_without_requires_array`);
  if (method.startsWith('test') && !Array.isArray(spec.requires)) review.push(`${method}:action_method_without_requires_array`);
}

const text = JSON.stringify(contract);
if (/localStorage|Firestore path|collection path/i.test(text)) review.push('contract_mentions_implementation_detail');
if (!/privateRef/.test(text)) fail.push('contract_missing_privateRef_concept');
if (!/audit/i.test(text)) fail.push('contract_missing_audit_concept');
if (!/simulation/.test(text)) review.push('contract_missing_simulation_status');

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'contract-validation-read-only',
  contractPath,
  status: fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'OK',
  counts: {
    methods: Object.keys(contract.methods || {}).length,
    fail: fail.length,
    review: review.length
  },
  fail,
  review
};

const outJson = path.join(outDir, 'cx-data-backend-config-contract-validation.json');
const outMd = path.join(outDir, 'cx-data-backend-config-contract-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación contrato CX.data backend config');
md.push('');
md.push('Modo: solo lectura. No modifica frontend ni Firestore.');
md.push('');
md.push(`Estado: ${result.status}`);
md.push(`Métodos: ${result.counts.methods}`);
md.push(`Fail: ${result.counts.fail}`);
md.push(`Review: ${result.counts.review}`);
md.push('');
if (fail.length) {
  md.push('## Fail');
  fail.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
if (review.length) {
  md.push('## Review');
  review.forEach((x) => md.push(`- ${x}`));
  md.push('');
}
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log(md.join('\n'));
process.exit(fail.length ? 2 : review.length ? 1 : 0);
