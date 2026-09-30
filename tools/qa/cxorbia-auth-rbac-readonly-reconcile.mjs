import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outJson = process.env.CXORBIA_AUTH_RBAC_JSON || 'app/docs/evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json';
const outMd = process.env.CXORBIA_AUTH_RBAC_MD || 'app/docs/evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.md';
const tenantId = 'tya';
const canonicalProjectId = 'cinepolis';

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);

if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa), projectId: expectedProject });
const db = admin.firestore();
const auth = admin.auth();

const operatorRoles = new Set(['super','admin','ops','coordinador']);
const clientRoles = new Set(['cliente','client']);
const allowedRoles = new Set([...operatorRoles, ...clientRoles, 'shopper']);

function values(v){
  if(Array.isArray(v)) return v.map(String).map(x=>x.trim()).filter(Boolean);
  if(typeof v === 'string') return v.split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}
function inc(map, key){ if(key === undefined || key === null || key === '') return; const k=String(key); map[k] = (map[k] || 0) + 1; }
function tenantAllowedByCurrentRules(claims, role){
  return role === 'super' || claims.tenantId === tenantId || values(claims.tenants).includes(tenantId);
}
function ruleProjectIds(claims){ return [...new Set(values(claims.projectIds))]; }
function passwordProvider(u){ return (u.providerData || []).some(p => p.providerId === 'password'); }

const shopperDocs = await db.collection('tenants').doc(tenantId).collection('shoppers').listDocuments();
const shopperIds = new Set(shopperDocs.map(r=>r.id));

const roleReadiness = {};
const roleScopeValues = {};
const shopperMatchedProjectScopes = {};
let totalUsers = 0;
let activePasswordUsers = 0;
let tenantUsers = 0;
let unknownRoleUsers = 0;
let operatorLoginReady = 0;
let clientLoginReady = 0;
let shopperLoginReady = 0;
let shopperWithMatchingProfile = 0;
let usersAssignedCanonicalProject = 0;
let usersWithTenantIdsOnlyGap = 0;
let usersWithProjectIdOnlyGap = 0;
let token;

do {
  const page = await auth.listUsers(1000, token);
  totalUsers += page.users.length;
  for (const u of page.users) {
    const claims = u.customClaims || {};
    const role = typeof claims.role === 'string' ? claims.role : '';
    const roleKey = role || 'missing';
    const activePassword = !u.disabled && passwordProvider(u);
    const tenantOk = tenantAllowedByCurrentRules(claims, role);
    const projects = ruleProjectIds(claims);
    const canonicalProjectAssigned = role === 'super' || projects.includes(canonicalProjectId);
    const shopperId = typeof claims.shopperId === 'string' ? claims.shopperId : '';
    const shopperProfileMatched = !!shopperId && shopperIds.has(shopperId);
    const tenantIdsOnlyGap = role !== 'super' && !tenantOk && values(claims.tenantIds).includes(tenantId);
    const projectIdOnlyGap = !projects.includes(canonicalProjectId) && claims.projectId === canonicalProjectId;

    if(activePassword) activePasswordUsers++;
    if(tenantOk) tenantUsers++;
    if(role && !allowedRoles.has(role)) unknownRoleUsers++;
    if(canonicalProjectAssigned) usersAssignedCanonicalProject++;
    if(shopperProfileMatched) shopperWithMatchingProfile++;
    if(tenantIdsOnlyGap) usersWithTenantIdsOnlyGap++;
    if(projectIdOnlyGap) usersWithProjectIdOnlyGap++;

    if(!roleReadiness[roleKey]) roleReadiness[roleKey] = {
      users:0, activePassword:0, tenantAllowedByRules:0, canonicalProjectAssignedByRules:0,
      shopperIdPresent:0, shopperProfileMatched:0, tenantIdsOnlyGap:0, projectIdOnlyGap:0, secureReadReady:0
    };
    if(!roleScopeValues[roleKey]) roleScopeValues[roleKey] = {projectId:{}, projectIds:{}, tenantId:{}, tenants:{}, tenantIds:{}};
    const r = roleReadiness[roleKey];
    const s = roleScopeValues[roleKey];
    r.users++;
    if(activePassword) r.activePassword++;
    if(tenantOk) r.tenantAllowedByRules++;
    if(canonicalProjectAssigned) r.canonicalProjectAssignedByRules++;
    if(shopperId) r.shopperIdPresent++;
    if(shopperProfileMatched) r.shopperProfileMatched++;
    if(tenantIdsOnlyGap) r.tenantIdsOnlyGap++;
    if(projectIdOnlyGap) r.projectIdOnlyGap++;
    if(typeof claims.projectId === 'string') inc(s.projectId, claims.projectId);
    projects.forEach(v=>inc(s.projectIds, v));
    if(typeof claims.tenantId === 'string') inc(s.tenantId, claims.tenantId);
    values(claims.tenants).forEach(v=>inc(s.tenants, v));
    values(claims.tenantIds).forEach(v=>inc(s.tenantIds, v));
    if(role === 'shopper' && shopperProfileMatched) projects.forEach(v=>inc(shopperMatchedProjectScopes, v));

    let ready = false;
    if(operatorRoles.has(role)) ready = activePassword && tenantOk;
    else if(clientRoles.has(role)) ready = activePassword && tenantOk && canonicalProjectAssigned;
    else if(role === 'shopper') ready = activePassword && tenantOk && canonicalProjectAssigned && shopperProfileMatched;
    if(ready){
      r.secureReadReady++;
      if(operatorRoles.has(role)) operatorLoginReady++;
      else if(clientRoles.has(role)) clientLoginReady++;
      else if(role === 'shopper') shopperLoginReady++;
    }
  }
  token = page.pageToken;
} while (token);

// Source-safe aggregate only: prove whether canonical visits use status vs estado and which status enums exist.
const canonicalVisits = await db.collection('tenants').doc(tenantId).collection('projects').doc(canonicalProjectId).collection('visits').select('status','estado','periodId').get();
const visitStatus = {total:canonicalVisits.size, statusPresent:0, estadoPresent:0, statusValues:{}, estadoValues:{}, byPeriod:{}};
for(const doc of canonicalVisits.docs){
  const d=doc.data()||{};
  if(d.status !== undefined){ visitStatus.statusPresent++; inc(visitStatus.statusValues,d.status); }
  if(d.estado !== undefined){ visitStatus.estadoPresent++; inc(visitStatus.estadoValues,d.estado); }
  const p=String(d.periodId||'missing');
  if(!visitStatus.byPeriod[p]) visitStatus.byPeriod[p]={total:0,statusValues:{},estadoValues:{}};
  visitStatus.byPeriod[p].total++;
  if(d.status !== undefined) inc(visitStatus.byPeriod[p].statusValues,d.status);
  if(d.estado !== undefined) inc(visitStatus.byPeriod[p].estadoValues,d.estado);
}

const allFamiliesReady = operatorLoginReady > 0 && clientLoginReady > 0 && shopperLoginReady > 0;
const readiness = {
  operatorLoginReady,
  clientLoginReady,
  shopperLoginReady,
  allRequiredRoleFamiliesHaveAtLeastOne: allFamiliesReady,
  legacyClaimsSufficientForSecureDevReadWithoutClaimMutation: allFamiliesReady,
  rulesMutationRequiredForCanonicalVisitStatusField: visitStatus.statusPresent > 0 && visitStatus.estadoPresent < visitStatus.statusPresent,
  claimMutationRequiredForDevVisualIfReady: !allFamiliesReady,
  usersWithTenantIdsOnlyGap,
  usersWithProjectIdOnlyGap,
};

const report = {
  schemaVersion: 'cxorbia.corte6-auth-rbac-readonly-reconciliation.v4',
  generatedAt: new Date().toISOString(),
  projectId: expectedProject,
  tenantId,
  canonicalProjectId,
  mode: 'READ_ONLY_SOURCE_SAFE',
  providerWrites: 0,
  authorizationSemantics: {
    tenant: 'super OR tenantId==tya OR tenants[] contains tya',
    project: 'projectIds[] contains cinepolis for client/shopper',
    shopper: 'shopperId claim matches Firestore shopper document ID',
  },
  auth: {
    totalUsers,
    activePasswordUsers,
    tenantUsers,
    usersAssignedCanonicalProject,
    shopperWithMatchingProfile,
    shopperMatchedProjectScopes,
    usersWithTenantIdsOnlyGap,
    usersWithProjectIdOnlyGap,
    unknownRoleUsers,
    roleReadiness,
    roleScopeValues,
    readiness,
    piiExported: false,
  },
  canonicalVisitStatus: visitStatus,
  safety: {
    authWrites: 0,
    firestoreWrites: 0,
    rulesDeploys: 0,
    hostingDeploys: 0,
    storageWrites: 0,
    production: false,
    merge: false,
    identitiesExported: false,
    sensitiveValuesExported: false,
  }
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + '\n', 'utf8');
const scopeLines = Object.entries(roleScopeValues).sort(([a],[b])=>a.localeCompare(b)).flatMap(([role,s])=>[
  `- ${role}: projectId=${JSON.stringify(s.projectId)}; projectIds=${JSON.stringify(s.projectIds)}; tenantId=${JSON.stringify(s.tenantId)}; tenants=${JSON.stringify(s.tenants)}; tenantIds=${JSON.stringify(s.tenantIds)}`
]);
const statusLines = Object.entries(visitStatus.byPeriod).sort(([a],[b])=>a.localeCompare(b)).map(([p,s])=>`- ${p}: total=${s.total}; status=${JSON.stringify(s.statusValues)}; estado=${JSON.stringify(s.estadoValues)}`);
const lines = [
  '# Corte 6 — reconciliación Auth/RBAC read-only source-safe',
  '',
  `- Fecha: ${report.generatedAt}`,
  `- Firebase DEV canónico: \`${expectedProject}\``,
  `- Tenant: \`${tenantId}\``,
  `- Proyecto canónico: \`${canonicalProjectId}\``,
  '- Modo: read-only; provider writes=0; sin identidades ni PII exportadas.',
  '- Semántica evaluada: exactamente la de firestore.rules vigente, no aliases históricos no autorizadores.',
  '',
  '## Readiness agregado',
  '',
  `- Auth users totales: ${totalUsers}`,
  `- Usuarios activos con password provider: ${activePasswordUsers}`,
  `- Usuarios autorizables a tenant TyA por reglas actuales: ${tenantUsers}`,
  `- Usuarios con proyecto canónico por projectIds[] (super cuenta global): ${usersAssignedCanonicalProject}`,
  `- Shopper claims con shopperId que coincide con perfil Firestore: ${shopperWithMatchingProfile}`,
  `- Shopper con perfil exacto por scopes legacy: ${JSON.stringify(shopperMatchedProjectScopes)}`,
  `- Login operador listo bajo reglas actuales: ${operatorLoginReady}`,
  `- Login cliente listo bajo reglas actuales: ${clientLoginReady}`,
  `- Login shopper listo bajo reglas actuales: ${shopperLoginReady}`,
  `- Familias mínimas listas: ${readiness.allRequiredRoleFamiliesHaveAtLeastOne ? 'sí' : 'no'}`,
  '',
  '## Por rol — solo conteos',
  '',
  '| Rol | Users | Password activos | Tenant por reglas | Proyecto por reglas | shopperId | Perfil shopper coincide | Secure read ready |',
  '|---|---:|---:|---:|---:|---:|---:|---:|',
  ...Object.entries(roleReadiness).sort(([a],[b])=>a.localeCompare(b)).map(([role,r])=>`| ${role} | ${r.users} | ${r.activePassword} | ${r.tenantAllowedByRules} | ${r.canonicalProjectAssignedByRules} | ${r.shopperIdPresent} | ${r.shopperProfileMatched} | ${r.secureReadReady} |`),
  '',
  '## Distribución de scopes no PII',
  '',
  ...scopeLines,
  '',
  '## Status canónico de visitas — agregado no PII',
  '',
  `- Total: ${visitStatus.total}; status presente=${visitStatus.statusPresent}; estado presente=${visitStatus.estadoPresent}`,
  `- status values: ${JSON.stringify(visitStatus.statusValues)}`,
  `- estado values: ${JSON.stringify(visitStatus.estadoValues)}`,
  ...statusLines,
  '',
  '## Seguridad',
  '',
  '- Auth/Firestore/Rules/Hosting/Storage writes: 0.',
  '- Producción/merge: false.',
  '- Los valores de scope/status son IDs/estados operativos, no identidades de personas.',
  '- No se exportaron email, UID, nombre, teléfono, DPI, banco, contraseña, token ni shopperId.',
  ''
];
fs.writeFileSync(outMd, lines.join('\n'), 'utf8');
console.log(JSON.stringify({projectId: expectedProject, readiness, roleReadiness, roleScopeValues, shopperMatchedProjectScopes, visitStatus, providerWrites:0, piiExported:false}));
