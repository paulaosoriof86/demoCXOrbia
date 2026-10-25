import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outJson = process.env.CXORBIA_INVENTORY_JSON || 'app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.json';
const outMd = process.env.CXORBIA_INVENTORY_MD || 'app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.md';
const maxDepth = Number(process.env.CXORBIA_INVENTORY_MAX_DEPTH || 6);
const maxCollectionPaths = Number(process.env.CXORBIA_INVENTORY_MAX_COLLECTION_PATHS || 300);

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
  let disabledUsers = 0;
  let usersWithClaims = 0;
  let tenantTyaUsers = 0;
  let oldRuleOperatorUsers = 0;
  let tenantTyaOldRuleOperatorUsers = 0;
  let tenantTyaOldRuleOperatorPasswordUsers = 0;
  let currentContractRoleUsers = 0;
  let currentContractShapeUsers = 0;
  let tenantTyaCurrentContractShapeUsers = 0;
  const claimKeys = new Set();
  const providerIds = new Set();
  const roleCounts = {};
  let token;
  const oldRuleOperatorRoles = new Set(['super','admin','ops','coordinador']);
  const currentContractRoles = new Set(['tenantAdmin','projectAdmin','financeAdmin','certificationAdmin','clientAdmin','clientViewer','shopper']);
  do {
    const page = await auth.listUsers(1000, token);
    total += page.users.length;
    for (const u of page.users) {
      if (u.disabled) disabledUsers++;
      const claims = u.customClaims || {};
      const keys = Object.keys(claims);
      if (keys.length) usersWithClaims++;
      keys.forEach(k => claimKeys.add(k));
      for (const p of u.providerData || []) if (p.providerId) providerIds.add(p.providerId);
      const role = typeof claims.role === 'string' ? claims.role : '';
      if (role) roleCounts[role] = (roleCounts[role] || 0) + 1;
      const tenantAllowed = role === 'super' || claims.tenantId === 'tya' || (Array.isArray(claims.tenants) && claims.tenants.includes('tya')) || (Array.isArray(claims.tenantIds) && claims.tenantIds.includes('tya'));
      const oldRuleOperator = oldRuleOperatorRoles.has(role);
      const hasPasswordProvider = (u.providerData || []).some(p => p.providerId === 'password');
      const currentContractRole = currentContractRoles.has(role);
      const currentShape = currentContractRole && typeof claims.tenantId === 'string' && typeof claims.personaType === 'string' && typeof claims.scope === 'string' && typeof claims.permissionsVersion === 'string';
      if (tenantAllowed) tenantTyaUsers++;
      if (oldRuleOperator) oldRuleOperatorUsers++;
      if (tenantAllowed && oldRuleOperator) tenantTyaOldRuleOperatorUsers++;
      if (!u.disabled && tenantAllowed && oldRuleOperator && hasPasswordProvider) tenantTyaOldRuleOperatorPasswordUsers++;
      if (currentContractRole) currentContractRoleUsers++;
      if (currentShape) currentContractShapeUsers++;
      if (tenantAllowed && currentShape) tenantTyaCurrentContractShapeUsers++;
    }
    token = page.pageToken;
  } while (token);
  return {
    totalUsers: total,
    disabledUsers,
    usersWithClaims,
    customClaimKeys: [...claimKeys].sort(),
    providerIds: [...providerIds].sort(),
    roleCounts,
    tenantTyaUsers,
    oldRuleOperatorUsers,
    tenantTyaOldRuleOperatorUsers,
    tenantTyaOldRuleOperatorPasswordUsers,
    currentContractRoleUsers,
    currentContractShapeUsers,
    tenantTyaCurrentContractShapeUsers,
    piiExported: false,
  };
}

const collections = [];
const seen = new Set();
let truncated = false;

async function walkCollection(ref, depth = 0) {
  if (seen.has(ref.path) || collections.length >= maxCollectionPaths) {
    if (collections.length >= maxCollectionPaths) truncated = true;
    return;
  }
  seen.add(ref.path);
  const count = await collectionCount(ref);
  const sampleFieldKeysList = await sampleFieldKeys(ref);
  collections.push({ path: ref.path, name: ref.id, depth, count, sampleFieldKeys: sampleFieldKeysList });
  if (depth >= maxDepth || count === 0) return;

  const docs = await ref.listDocuments();
  for (const docRef of docs) {
    if (collections.length >= maxCollectionPaths) { truncated = true; break; }
    const children = await docRef.listCollections();
    for (const child of children.sort((a,b)=>a.path.localeCompare(b.path))) {
      await walkCollection(child, depth + 1);
      if (collections.length >= maxCollectionPaths) break;
    }
  }
}

const roots = await db.listCollections();
for (const ref of roots.sort((a,b)=>a.id.localeCompare(b.id))) await walkCollection(ref, 0);
collections.sort((a,b)=>a.path.localeCompare(b.path));

const authSummary = await authInventory();
const totalsByLeafName = {};
for (const c of collections) totalsByLeafName[c.name] = (totalsByLeafName[c.name] || 0) + c.count;
const pick = (...names) => {
  for (const n of names) if (Object.prototype.hasOwnProperty.call(totalsByLeafName, n)) return totalsByLeafName[n];
  return null;
};

const tenantRef = db.collection('tenants').doc('tya');

// Safe shopper reconciliation: counts and field names only; never values/identities.
const shopperSnap = await tenantRef.collection('shoppers').get();
const shopperFieldNames = new Set();
const certificationLikeFieldCounts = {};
const embeddedCertificationItemCounts = {};
let shoppersWithCertificationLikeFields = 0;
for (const doc of shopperSnap.docs) {
  const data = doc.data() || {};
  let hasCertLike = false;
  for (const [key, value] of Object.entries(data)) {
    shopperFieldNames.add(key);
    if (/cert|curso|academy|academ/i.test(key)) {
      hasCertLike = true;
      certificationLikeFieldCounts[key] = (certificationLikeFieldCounts[key] || 0) + 1;
      if (Array.isArray(value)) embeddedCertificationItemCounts[key] = (embeddedCertificationItemCounts[key] || 0) + value.length;
    }
  }
  if (hasCertLike) shoppersWithCertificationLikeFields++;
}

// Safe project reconciliation: IDs + operational metadata only, no client/shopper PII.
const projectSnap = await tenantRef.collection('projects').get();
const projectReconciliation = [];
const projectSubcollections = ['visits','questionnaires','liquidations','postulations','applications','periods','certifications'];
const periodCountryPattern = /^cinepolis-(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)-\d{2}(-hn)?$/i;
for (const doc of projectSnap.docs.sort((a,b)=>a.id.localeCompare(b.id))) {
  const data = doc.data() || {};
  const childCounts = {};
  for (const child of projectSubcollections) childCounts[child] = await collectionCount(doc.ref.collection(child));
  projectReconciliation.push({
    id: doc.id,
    idPattern: periodCountryPattern.test(doc.id) ? 'period-country' : 'non-period-pattern',
    country: data.country || data.pais || null,
    periodKey: data.periodKey || data.periodId || null,
    source: data.source || null,
    sourceType: data.sourceType || null,
    status: data.status || null,
    isPeriodSelectable: data.isPeriodSelectable === true,
    childCounts,
  });
}
const projectPatternSummary = projectReconciliation.reduce((acc,p)=>{
  const k=p.idPattern;
  if(!acc[k]) acc[k]={projects:0,visits:0,questionnaires:0,liquidations:0,postulations:0,applications:0,periods:0,certifications:0,ids:[]};
  acc[k].projects++;
  acc[k].ids.push(p.id);
  for (const key of ['visits','questionnaires','liquidations','postulations','applications','periods','certifications']) acc[k][key]+=Number(p.childCounts[key]||0);
  return acc;
},{});

const report = {
  schemaVersion: 'cxorbia.canonical-backend-readonly-inventory.v4',
  generatedAt: new Date().toISOString(),
  projectId: expectedProject,
  classification: 'CXORBIA_CANONICAL_DEV_BACKEND_CANDIDATE__NOT_LEGACY_TYA_PLATFORM',
  readOnly: true,
  providerWrites: 0,
  auth: authSummary,
  rootCollectionCount: roots.length,
  discoveredCollectionPaths: collections.length,
  traversal: { maxDepth, maxCollectionPaths, truncated },
  totalsByLeafName,
  collections,
  keyCounts: {
    tenants: pick('tenants'),
    clients: pick('clients','accounts'),
    projects: pick('projects'),
    visits: pick('visits'),
    shoppers: pick('shoppers'),
    certifications: pick('certifications','certs'),
    postulations: pick('postulations','posts'),
    notifications: pick('notifications'),
    shopperBenefits: pick('shopperBenefits','benefits'),
    liquidations: pick('liquidations'),
    finance: pick('finance','finances'),
  },
  shopperReconciliation: {
    total: shopperSnap.size,
    allFieldNames: [...shopperFieldNames].sort(),
    shoppersWithCertificationLikeFields,
    certificationLikeFieldCounts,
    embeddedCertificationItemCounts,
  },
  projectReconciliation,
  projectPatternSummary,
  safety: {
    documentWrites: 0,
    authWrites: 0,
    storageWrites: 0,
    rulesWrites: 0,
    functionsWrites: 0,
    hostingDeploys: 0,
    production: false,
    merge: false,
    sensitiveValuesExported: false,
    shopperIdentityValuesExported: false,
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
  `- Auth users disabled: ${authSummary.disabledUsers}`,
  `- Auth users with claims: ${authSummary.usersWithClaims}`,
  `- Auth users tenant TyA: ${authSummary.tenantTyaUsers}`,
  `- Old-rules operator users for TyA: ${authSummary.tenantTyaOldRuleOperatorUsers}`,
  `- Old-rules TyA operator users with password provider: ${authSummary.tenantTyaOldRuleOperatorPasswordUsers}`,
  `- Current-contract claim-shape users: ${authSummary.currentContractShapeUsers}`,
  `- Current-contract claim-shape users for TyA: ${authSummary.tenantTyaCurrentContractShapeUsers}`,
  `- Auth provider IDs observed: ${authSummary.providerIds.join(', ') || 'none'}`,
  `- Auth role counts (sanitized): ${Object.keys(authSummary.roleCounts).length ? Object.entries(authSummary.roleCounts).map(([k,v])=>`${k}:${v}`).join(', ') : 'none'}`,
  `- Colecciones raíz: ${roots.length}`,
  `- Rutas de colección descubiertas: ${collections.length}`,
  `- Traversal truncado: ${truncated ? 'sí' : 'no'}`,
  '',
  '## Conteos clave por nombre de colección',
  '',
  ...Object.entries(report.keyCounts).map(([k,v]) => `- ${k}: ${v === null ? 'no localizado' : v}`),
  '',
  '## Reconciliación segura de shoppers/certificaciones',
  '',
  `- Shoppers: ${shopperSnap.size}`,
  `- Shoppers con algún campo cuyo nombre parece de certificación/curso/Academia: ${shoppersWithCertificationLikeFields}`,
  `- Campos de certificación/curso detectados: ${Object.keys(certificationLikeFieldCounts).length ? Object.entries(certificationLikeFieldCounts).map(([k,v])=>`${k}(${v})`).join(', ') : 'ninguno'}`,
  `- Ítems embebidos contados en arrays de esos campos: ${Object.keys(embeddedCertificationItemCounts).length ? Object.entries(embeddedCertificationItemCounts).map(([k,v])=>`${k}:${v}`).join(', ') : '0'}`,
  '- No se exportaron nombres, emails, teléfonos, documentos ni valores de shopper.',
  '',
  '## Reconciliación segura de proyectos',
  '',
  ...Object.entries(projectPatternSummary).map(([k,v])=>`- ${k}: proyectos=${v.projects}, visitas=${v.visits}, cuestionarios=${v.questionnaires}, liquidaciones=${v.liquidations}, postulaciones=${v.postulations}, applications=${v.applications}, periods=${v.periods}, certifications=${v.certifications}; ids=${v.ids.join(', ')}`),
  '',
  '| Project ID | Patrón | País | Period key | Source | Status | Visits | Questionnaires | Liquidations | Posts | Apps | Periods | Certs |',
  '|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|',
  ...projectReconciliation.map(p => `| ${p.id} | ${p.idPattern} | ${p.country || ''} | ${p.periodKey || ''} | ${p.source || ''} | ${p.status || ''} | ${p.childCounts.visits} | ${p.childCounts.questionnaires} | ${p.childCounts.liquidations} | ${p.childCounts.postulations} | ${p.childCounts.applications} | ${p.childCounts.periods} | ${p.childCounts.certifications} |`),
  '',
  '## Árbol de colecciones',
  '',
  '| Ruta | Docs | Campos observados (solo nombres, sin valores) |',
  '|---|---:|---|',
  ...collections.map(c => `| ${c.path} | ${c.count} | ${c.sampleFieldKeys.join(', ')} |`),
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
console.log(JSON.stringify({projectId: report.projectId, authUsers: authSummary.totalUsers, auth: authSummary, collectionPaths: collections.length, keyCounts: report.keyCounts, shopperReconciliation: report.shopperReconciliation, projectPatternSummary}));
