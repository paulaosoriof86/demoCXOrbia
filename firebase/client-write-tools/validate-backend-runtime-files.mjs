import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'app/core/backend-firebase.js',
  'app/core/backend-finance-benefits.js',
  'app/core/backend-operational-actions.js',
  'app/core/backend-cxdata-finance-read.js',
  'app/index-backend-dev.html',
  'app/core/backend-config-preview-dev.js'
];

const optional = [
  'firebase/schema/cxorbia-finance-benefits-v2.json',
  'firebase/contracts/cx-data-finance-benefits-contract-v2.json',
  'firebase/contracts/cx-data-operational-actions-contract-v1.json'
];

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'backend-runtime-files-static-validation',
  required: [],
  optional: [],
  status: 'OK',
  errors: [],
  warnings: []
};

for (const rel of required) {
  const abs = path.join(root, rel);
  const exists = fs.existsSync(abs);
  result.required.push({path: rel, exists});
  if (!exists) result.errors.push(`missing:${rel}`);
}

for (const rel of optional) {
  const abs = path.join(root, rel);
  result.optional.push({path: rel, exists: fs.existsSync(abs)});
}

const modulesDir = path.join(root, 'app', 'modules');
if (!fs.existsSync(modulesDir)) result.warnings.push('modules-dir-not-found');

const backendDev = path.join(root, 'app', 'index-backend-dev.html');
if (fs.existsSync(backendDev)) {
  const html = fs.readFileSync(backendDev, 'utf8');
  if (!html.includes('backend-firebase.js')) result.errors.push('preview-missing-backend-firebase');
  if (!html.includes('charset="UTF-8"') && !html.includes("charset='UTF-8'")) result.warnings.push('preview-charset-check');
}

if (result.errors.length) result.status = 'FAIL';
else if (result.warnings.length) result.status = 'REVIEW';

const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, {recursive:true});
const outJson = path.join(outDir, 'backend-runtime-files-validation.json');
const outMd = path.join(outDir, 'backend-runtime-files-validation-summary.md');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

const md = [];
md.push('# Validación estática runtime backend');
md.push('');
md.push(`Estado: ${result.status}`);
md.push('');
md.push('## Requeridos');
result.required.forEach(x => md.push(`- ${x.exists ? 'OK' : 'FALTA'} ${x.path}`));
md.push('');
md.push('## Opcionales');
result.optional.forEach(x => md.push(`- ${x.exists ? 'OK' : 'FALTA'} ${x.path}`));
if (result.errors.length) { md.push(''); md.push('## Errores'); result.errors.forEach(x => md.push(`- ${x}`)); }
if (result.warnings.length) { md.push(''); md.push('## Revisar'); result.warnings.forEach(x => md.push(`- ${x}`)); }
md.push('');
md.push('No ejecuta Firebase, no escribe datos y no modifica archivos.');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log(md.join('\n'));
process.exit(result.status === 'FAIL' ? 2 : result.status === 'REVIEW' ? 1 : 0);
