'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const PROJECT_ID = 'cxorbia-backend-dev';
const APPROVAL_ENV = 'CXORBIA_AUTH_IMPORT_DEV_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_20260628_AUTH_IMPORT_DEV';

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorizacion local para auth import DEV.');
  console.error(`Define ${APPROVAL_ENV}=${APPROVAL_TOKEN}`);
  process.exit(1);
}

function makePassword() {
  return `CxO-${crypto.randomBytes(9).toString('base64url')}-Aa1!`;
}

function sha256Base64(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('base64');
}

const sharedPassword = process.env.CXORBIA_DEV_PASSWORD || makePassword();
const passwordHash = sha256Base64(sharedPassword);

const specs = [
  {
    key: 'super',
    localId: 'dev-super-tya',
    email: 'super.dev@cxorbia-dev.example.com',
    displayName: 'Super DEV CXOrbia',
    claims: { role: 'super', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'admin',
    localId: 'dev-admin-tya',
    email: 'admin.tya.dev@cxorbia-dev.example.com',
    displayName: 'Admin DEV TYA',
    claims: { role: 'admin', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'ops',
    localId: 'dev-ops-tya',
    email: 'ops.tya.dev@cxorbia-dev.example.com',
    displayName: 'Ops DEV TYA',
    claims: { role: 'ops', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'shopper',
    localId: 'dev-shopper-eval-01',
    email: 'shopper.eval01.dev@cxorbia-dev.example.com',
    displayName: 'Evaluador DEV 01',
    claims: { role: 'shopper', tenantId: 'tya', projectIds: ['tya-piloto'], shopperId: 'eval-01' }
  },
  {
    key: 'cliente',
    localId: 'dev-cliente-tya',
    email: 'cliente.tya.dev@cxorbia-dev.example.com',
    displayName: 'Cliente DEV TYA',
    claims: { role: 'cliente', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'externo-denegacion',
    localId: 'dev-externo-otro-tenant',
    email: 'externo.otro.dev@cxorbia-dev.example.com',
    displayName: 'Externo DEV Otro Tenant',
    claims: { role: 'admin', tenantId: 'otro-tenant', projectIds: ['tya-piloto'] }
  }
];

const users = specs.map((spec) => ({
  localId: spec.localId,
  email: spec.email,
  emailVerified: true,
  displayName: spec.displayName,
  passwordHash,
  disabled: false,
  customAttributes: JSON.stringify(spec.claims)
}));

const outDir = path.join(__dirname, 'output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const importPath = path.join(outDir, `auth-import-users-${stamp}.json`);
const reportPath = path.join(outDir, `auth-import-users-${stamp}.md`);

fs.writeFileSync(importPath, JSON.stringify({ users }, null, 2), 'utf8');

const reportLines = [];
reportLines.push('# Auth import DEV users');
reportLines.push('');
reportLines.push(`Proyecto: ${PROJECT_ID}`);
reportLines.push('Metodo: Firebase CLI auth:import con hash SHA256 y customAttributes.');
reportLines.push('Alcance: usuarios ficticios DEV y claims. Sin seed, sin adapter, sin Hosting, sin produccion.');
reportLines.push('');
reportLines.push('Password DEV temporal compartido:');
reportLines.push('');
reportLines.push('```text');
reportLines.push(sharedPassword);
reportLines.push('```');
reportLines.push('');
reportLines.push('| Clave | Email | UID localId | Claims |');
reportLines.push('|---|---|---|---|');
for (const spec of specs) {
  reportLines.push(`| ${spec.key} | ${spec.email} | ${spec.localId} | \`${JSON.stringify(spec.claims)}\` |`);
}
reportLines.push('');
reportLines.push('No subir este reporte a GitHub. Contiene password DEV temporal.');
fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');

console.log('== Auth import DEV preparado ==');
console.log(`Proyecto: ${PROJECT_ID}`);
console.log(`Archivo import local: ${importPath}`);
console.log(`Reporte local: ${reportPath}`);
console.log('Metodo: firebase.cmd auth:import; no usa gcloud, no usa service account.');

const firebaseCmd = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';
const args = ['auth:import', importPath, '--hash-algo=SHA256', '--project', PROJECT_ID];
console.log(`== Ejecutando: ${firebaseCmd} ${args.join(' ')} ==`);

const result = spawnSync(firebaseCmd, args, { stdio: 'inherit', shell: false });

if (result.error) {
  console.error('ERROR ejecutando firebase auth:import.');
  console.error(result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`ERROR: firebase auth:import termino con codigo ${result.status}.`);
  process.exit(result.status || 1);
}

console.log('== Auth import DEV finalizado ==');
console.log('Usuarios DEV ficticios y customAttributes importados por Firebase CLI.');
console.log('No subir archivos de output a GitHub.');
