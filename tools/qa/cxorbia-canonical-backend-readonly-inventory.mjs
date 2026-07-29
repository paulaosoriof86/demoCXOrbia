import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outJson = process.env.CXORBIA_INVENTORY_JSON || 'app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.json';
const outMd = process.env.CXORBIA_INVENTORY_MD || 'app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md';

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);

admin.initializeApp({ credential: admin.credential.cert(sa), projectId: expectedProject });
const db = admin.firestore();
const auth = admin.auth();

async function collectionCount(ref) {
  try {
    const agg = await ref.count().get();
    return Number(agg.data().count || 0);
  } catch {
    const snap = await ref.get();
    return snap.size;
  }
}

async function sampleFieldKeys(ref) {
  const snap = await ref.limit(5).get();
  const keys = new Set();
  for (const d of snap.docs) Object.keys(d.data() || {}).forEach(k => keys.add(k));
  return [...keys].sort();
}

async function authInventory() {
  let total = 0;
  const claimKeys = new Set();
  let token;
  do {
    const page = await auth.listUsers(1000, token);
    total += page.users.length;
    for (const u of page.users) Object.keys(u.customClaims || {}).forEach(k => claimKeys.add(k));
    token = page.pageToken;
  } while (token);
  return { totalUsers: total, customClaimKeys: [...claimKeys].sort() };
}

const roots = await db.listCollections();
const collections = [];
for (const ref of roots.sort((a,b)=>a.id.localeCompare(b.id))) {
  collections.push({
    name: ref.id,
    count: await collectionCount(ref),
    sampleFieldKeys: await sampleFieldKeys(ref),
  });
}

const authSummary = await authInventory();
const byName = Object.fromEntries(collections.map(c => [c.name, c.count]));
const report = {
  schemaVersion: 'cxorbia.canonical-backend-readonly-inventory.v1',
  generatedAt: new Date().toISOString(),
  projectId: expectedProject,
  classification: 'CXORBIA_CANONICAL_DEV_BACKEND_CANDIDATE__NOT_LEGACY_TYA_PLATFORM',
  readOnly: true,
  providerWrites: 0,
  auth: authSummary,
  rootCollectionCount: collections.length,
  collections,
  keyCounts: {
    tenants: byName.tenants ?? null,
    clients: byName.clients ?? byName.accounts ?? null,
    projects: byName.projects ?? null,
    visits: byName.visits ?? null,
    shoppers: byName.shoppers ?? null,
    certifications: byName.certifications ?? null,
    postulations: byName.postulations ?? byName.posts ?? null,
    notifications: byName.notifications ?? null,
    benefits: byName.benefits ?? null,
    liquidations: byName.liquidations ?? null,
    finance: byName.finance ?? null,
  },
  safety: {
    documentWrites: 0,
    authWrites: 0,
    storageWrites: 0,
    rulesWrites: 0,
    functionsWrites: 0,
    hostingDeploys: 0,
    production: false,
    merge: false,
    valuesExported: false,
    sensitiveValuesExported: false,
  }
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), { recursive: true });
fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + '\n');
const lines = [
  '# CXOrbia — inventario read-only del backend canónico DEV',
  '',
  `- Fecha: ${report.generatedAt}`,
  `- Proyecto: \`${report.projectId}\``,
  '- Clasificación: backend DEV de CXOrbia / tenant TyA; **no** plataforma legacy TyA a retirar.',
  '- Modo: read-only; provider writes=0; no valores sensibles exportados.',
  `- Auth users: ${authSummary.totalUsers}`,
  `- Colecciones raíz: ${collections.length}`,
  '',
  '## Conteos por colección raíz',
  '',
  '| Colección | Docs | Campos observados (solo nombres, sin valores) |',
  '|---|---:|---|',
  ...collections.map(c => `| ${c.name} | ${c.count} | ${c.sampleFieldKeys.join(', ')} |`),
  '',
  '## Seguridad',
  '',
  '- Firestore document writes: 0',
  '- Auth writes: 0',
  '- Storage/Rules/Functions/Hosting writes: 0',
  '- Producción/merge: false',
  '- Este reporte no contiene nombres, emails, teléfonos, DPI, bancos, NDA ni valores de documentos.',
  ''
];
fs.writeFileSync(outMd, lines.join('\n'));
console.log(JSON.stringify({projectId: report.projectId, authUsers: authSummary.totalUsers, rootCollections: collections.length, keyCounts: report.keyCounts}));
