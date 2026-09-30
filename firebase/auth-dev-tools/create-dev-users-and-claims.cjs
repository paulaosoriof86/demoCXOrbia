'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

const PROJECT_ID = 'cxorbia-backend-dev';
const APPROVAL_TOKEN = 'YES_PAULA_20260628_AUTH_DEV';
const APPROVAL_ENV = 'CXORBIA_AUTH_DEV_APPROVED';

const approved = process.env[APPROVAL_ENV];
if (approved !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorizacion local.');
  console.error(`Define ${APPROVAL_ENV}=${APPROVAL_TOKEN} para ejecutar este gate.`);
  process.exit(1);
}

function makePassword() {
  return `CxO-${crypto.randomBytes(9).toString('base64url')}-Aa1!`;
}

const sharedPassword = process.env.CXORBIA_DEV_PASSWORD || makePassword();

const users = [
  {
    key: 'super',
    email: 'super.dev@cxorbia-dev.example.com',
    displayName: 'Super DEV CXOrbia',
    claims: { role: 'super', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'admin',
    email: 'admin.tya.dev@cxorbia-dev.example.com',
    displayName: 'Admin DEV TYA',
    claims: { role: 'admin', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'ops',
    email: 'ops.tya.dev@cxorbia-dev.example.com',
    displayName: 'Ops DEV TYA',
    claims: { role: 'ops', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'shopper',
    email: 'shopper.eval01.dev@cxorbia-dev.example.com',
    displayName: 'Evaluador DEV 01',
    claims: { role: 'shopper', tenantId: 'tya', projectIds: ['tya-piloto'], shopperId: 'eval-01' }
  },
  {
    key: 'cliente',
    email: 'cliente.tya.dev@cxorbia-dev.example.com',
    displayName: 'Cliente DEV TYA',
    claims: { role: 'cliente', tenantId: 'tya', projectIds: ['tya-piloto'] }
  },
  {
    key: 'externo-denegacion',
    email: 'externo.otro.dev@cxorbia-dev.example.com',
    displayName: 'Externo DEV Otro Tenant',
    claims: { role: 'admin', tenantId: 'otro-tenant', projectIds: ['tya-piloto'] }
  }
];

admin.initializeApp({ projectId: PROJECT_ID });

async function upsertUser(auth, spec) {
  let userRecord;
  let action;

  try {
    userRecord = await auth.getUserByEmail(spec.email);
    action = 'updated';
    userRecord = await auth.updateUser(userRecord.uid, {
      displayName: spec.displayName,
      password: sharedPassword,
      disabled: false,
      emailVerified: true
    });
  } catch (error) {
    if (error && error.code !== 'auth/user-not-found') {
      throw error;
    }
    action = 'created';
    userRecord = await auth.createUser({
      email: spec.email,
      displayName: spec.displayName,
      password: sharedPassword,
      disabled: false,
      emailVerified: true
    });
  }

  await auth.setCustomUserClaims(userRecord.uid, spec.claims);
  const refreshed = await auth.getUser(userRecord.uid);

  return {
    key: spec.key,
    action,
    uid: refreshed.uid,
    email: refreshed.email,
    displayName: refreshed.displayName,
    claims: spec.claims
  };
}

function writeReports(results) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonReport = {
    projectId: PROJECT_ID,
    createdAt: now.toISOString(),
    scope: 'usuarios DEV ficticios y custom claims; sin seed, sin adapter, sin produccion',
    sharedPassword,
    users: results
  };

  const jsonPath = path.join(outDir, `usuarios-dev-claims-${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');

  const rows = results.map((item) => `| ${item.key} | ${item.action} | ${item.email} | ${item.uid} | \`${JSON.stringify(item.claims)}\` |`).join('\n');
  const md = `# Resultado usuarios DEV y claims\n\nFecha: ${now.toISOString()}\n\nProyecto Firebase DEV: \`${PROJECT_ID}\`\n\nAlcance: usuarios ficticios DEV y custom claims. No se cargo seed, no se activo adapter y no se toco produccion.\n\nPassword DEV temporal compartido para estas cuentas:\n\n\`\`\`text\n${sharedPassword}\n\`\`\`\n\n| Rol/clave | Accion | Email | UID | Claims |\n|---|---|---|---|---|\n${rows}\n\nArchivo local generado por script. No subir este reporte a GitHub porque contiene password DEV.\n`;

  const mdPath = path.join(outDir, `usuarios-dev-claims-${stamp}.md`);
  fs.writeFileSync(mdPath, md, 'utf8');

  return { jsonPath, mdPath };
}

async function main() {
  console.log(`== Auth DEV usuarios y claims ==`);
  console.log(`Proyecto: ${PROJECT_ID}`);
  console.log('Alcance: usuarios ficticios DEV, claims DEV; sin seed, sin adapter, sin produccion.');

  const auth = admin.auth();
  const results = [];

  for (const spec of users) {
    const result = await upsertUser(auth, spec);
    results.push(result);
    console.log(`${result.action.toUpperCase()} ${result.email} uid=${result.uid} claims=${JSON.stringify(result.claims)}`);
  }

  const reports = writeReports(results);

  console.log('== Usuarios DEV y claims finalizados ==');
  console.log(`Reporte local JSON: ${reports.jsonPath}`);
  console.log(`Reporte local MD: ${reports.mdPath}`);
  console.log('No subir el reporte local a GitHub porque contiene password DEV.');
}

main().catch((error) => {
  console.error('== ERROR usuarios DEV y claims ==');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
