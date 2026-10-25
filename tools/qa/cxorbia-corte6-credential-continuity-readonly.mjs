import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const tenantId = process.env.CXORBIA_TENANT_ID || 'tya';
const canonicalProjectId = process.env.CXORBIA_PROJECT_ID || 'cinepolis';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out = process.env.CXORBIA_CREDENTIAL_CONTINUITY_OUT || 'app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json';

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);
if (!admin.apps.length) admin.initializeApp({credential: admin.credential.cert(sa), projectId: expectedProject});

const db = admin.firestore();
const auth = admin.auth();
const tenantRef = db.collection('tenants').doc(tenantId);

// Presence only. Never export values, identifiers, hashes or PII.
const profilePresenceFields = [
  'user','username','login','pass','password','authUid','authEmail',
  'email','phone','whatsapp','wa','telefono',
  'firstName','lastName','name','nombre','displayName','code',
  'country','countries','pais','city','cities','ciudad','depto','departamento',
  'edad','age','sexo','sex','dpi','documentId','documento','idNumber',
  'banco','bank','ctaTipo','accountType','ctaNum','accountNumber','ctaTitular','accountHolder','ctaMoneda','accountCurrency','cuentaPago',
  'estado','status','perfilCompleto','profileStatus','rating','score','certs','certifications',
  'legacyShopperId','shopperId','sourceKey','migratedFrom','createdFromExternalSource','updatedAt','createdAt'
];
const userPresenceFields = ['user','username','login','pass','password','email','authUid','authEmail','role','rol'];
const emptyCounts = fields => Object.fromEntries(fields.map(k => [k,0]));
const shoppers = {documents:0, fieldsPresent:emptyCounts(profilePresenceFields)};
const users = {documents:0, fieldsPresent:emptyCounts(userPresenceFields)};
const canonicalShopperDocIds = new Set();

function hasValue(v){
  if(v === undefined || v === null) return false;
  if(typeof v === 'string') return v.trim().length > 0;
  if(Array.isArray(v)) return v.length > 0;
  return true;
}

async function scanCollection(ref, sink, fields, collectIds){
  const snap = await ref.get();
  sink.documents = snap.size;
  for(const d of snap.docs){
    if(collectIds) canonicalShopperDocIds.add(d.id);
    const v = d.data() || {};
    for(const k of fields) if(hasValue(v[k])) sink.fieldsPresent[k]++;
  }
}

await scanCollection(tenantRef.collection('shoppers'), shoppers, profilePresenceFields, true);
await scanCollection(tenantRef.collection('users'), users, userPresenceFields, false);

const profilePaths = [tenantRef, tenantRef.collection('profile').doc('main')];
const profile = {docsFound:0, loginConfigKeys:[]};
for(const ref of profilePaths){
  const snap = await ref.get();
  if(!snap.exists) continue;
  profile.docsFound++;
  const v = snap.data() || {};
  const keys = Object.keys(v).filter(k => /login|credential|usuario|user|auth/i.test(k));
  for(const k of keys) if(!profile.loginConfigKeys.includes(k)) profile.loginConfigKeys.push(k);
}
profile.loginConfigKeys.sort();

// Canonical visit history inventory. Only aggregate counts and state/facet names.
const visitsSnap = await tenantRef.collection('projects').doc(canonicalProjectId).collection('visits').get();
const visitStateCounts = {};
const canonicalFacetCounts = {
  available:0, assigned:0, scheduled:0, realized:0, questionnaire:0, submitted:0,
  liquidationCandidate:0, liquidationConfirmed:0, paymentConfirmed:0, outOfRange:0, cancelled:0
};
const referencedShopperIds = new Set();
let visitsWithShopperId = 0;
let visitsWithPeriod = 0;
let visitsWithCanonicalFacets = 0;
for(const doc of visitsSnap.docs){
  const v = doc.data() || {};
  const sid = String(v.shopperId || '').trim();
  if(sid){visitsWithShopperId++; referencedShopperIds.add(sid);}
  if(hasValue(v.periodId) || hasValue(v.periodKey)) visitsWithPeriod++;
  const state = String(v.estado || v.status || v.presentationState || 'missing').trim().toLowerCase() || 'missing';
  visitStateCounts[state] = (visitStateCounts[state] || 0) + 1;
  const facets = v.canonicalFacets && typeof v.canonicalFacets === 'object' ? v.canonicalFacets : null;
  if(facets){
    visitsWithCanonicalFacets++;
    for(const k of Object.keys(canonicalFacetCounts)) if(facets[k] === true) canonicalFacetCounts[k]++;
  }
}
let referencedProfilesExisting = 0;
for(const sid of referencedShopperIds) if(canonicalShopperDocIds.has(sid)) referencedProfilesExisting++;

// Auth inventory with claims only. Never export uid/email/login values.
let authUsers=0, passwordUsers=0, authEmailPresent=0, pageToken;
const roleCounts = {};
const namespaceCounts = {};
let shopperClaimUsers = 0;
let shopperClaimProfilesExisting = 0;
let shopperClaimMissingProfile = 0;
let scopedToCanonicalProject = 0;
do{
  const page = await auth.listUsers(1000,pageToken);
  authUsers += page.users.length;
  for(const u of page.users){
    if((u.providerData||[]).some(p=>p.providerId==='password')) passwordUsers++;
    if(u.email) authEmailPresent++;
    const claims = u.customClaims || {};
    const role = String(claims.role || 'none');
    const namespace = String(claims.authNamespace || 'none');
    roleCounts[role] = (roleCounts[role] || 0) + 1;
    namespaceCounts[namespace] = (namespaceCounts[namespace] || 0) + 1;
    const projects = Array.isArray(claims.projectIds) ? claims.projectIds.map(String) : [];
    if(projects.includes(canonicalProjectId) || String(claims.projectId || '') === canonicalProjectId) scopedToCanonicalProject++;
    if(role === 'shopper'){
      const sid = String(claims.shopperId || '').trim();
      if(sid){
        shopperClaimUsers++;
        if(canonicalShopperDocIds.has(sid)) shopperClaimProfilesExisting++;
        else shopperClaimMissingProfile++;
      }
    }
  }
  pageToken = page.pageToken;
}while(pageToken);

const anyPresent = (...keys) => keys.some(k => (shoppers.fieldsPresent[k] || 0) > 0);
const profileCoverage = {
  identityName: Math.max(shoppers.fieldsPresent.nombre||0, shoppers.fieldsPresent.name||0, shoppers.fieldsPresent.displayName||0),
  username: Math.max(shoppers.fieldsPresent.user||0, shoppers.fieldsPresent.username||0, shoppers.fieldsPresent.login||0),
  email: shoppers.fieldsPresent.email||0,
  phoneOrWhatsapp: Math.max(shoppers.fieldsPresent.phone||0, shoppers.fieldsPresent.whatsapp||0, shoppers.fieldsPresent.wa||0, shoppers.fieldsPresent.telefono||0),
  document: Math.max(shoppers.fieldsPresent.dpi||0, shoppers.fieldsPresent.documentId||0, shoppers.fieldsPresent.documento||0, shoppers.fieldsPresent.idNumber||0),
  paymentOrBank: Math.max(shoppers.fieldsPresent.banco||0, shoppers.fieldsPresent.bank||0, shoppers.fieldsPresent.ctaNum||0, shoppers.fieldsPresent.accountNumber||0, shoppers.fieldsPresent.cuentaPago||0),
  certification: Math.max(shoppers.fieldsPresent.certs||0, shoppers.fieldsPresent.certifications||0),
  legacyStableId: shoppers.fieldsPresent.legacyShopperId||0,
};

const result = {
  schemaVersion:'cxorbia.corte6.credential-continuity-readonly.v2',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  tenantId,
  canonicalProjectId,
  mode:'READ_ONLY_SOURCE_SAFE_NO_VALUES',
  canonicalFirestore:{
    shoppers,
    users,
    tenantProfile:profile,
    profileCoverage,
    visits:{
      documents:visitsSnap.size,
      visitsWithShopperId,
      distinctReferencedShopperIds:referencedShopperIds.size,
      referencedProfilesExisting,
      visitsWithPeriod,
      visitsWithCanonicalFacets,
      stateCounts:Object.fromEntries(Object.entries(visitStateCounts).sort(([a],[b])=>a.localeCompare(b))),
      canonicalFacetCounts
    }
  },
  firebaseAuth:{
    users:authUsers,
    passwordProviderUsers:passwordUsers,
    emailIdentifierUsers:authEmailPresent,
    roleCounts:Object.fromEntries(Object.entries(roleCounts).sort(([a],[b])=>a.localeCompare(b))),
    namespaceCounts:Object.fromEntries(Object.entries(namespaceCounts).sort(([a],[b])=>a.localeCompare(b))),
    shopperClaimUsers,
    shopperClaimProfilesExisting,
    shopperClaimMissingProfile,
    scopedToCanonicalProject
  },
  conclusions:{
    canonicalShopperHasLegacyUsernameField:anyPresent('user','username','login'),
    canonicalShopperHasLegacyPasswordField:anyPresent('pass','password'),
    canonicalUserHasLegacyUsernameField:(users.fieldsPresent.user||0)>0 || (users.fieldsPresent.username||0)>0 || (users.fieldsPresent.login||0)>0,
    canonicalUserHasLegacyPasswordField:(users.fieldsPresent.pass||0)>0 || (users.fieldsPresent.password||0)>0,
    firebaseAuthCurrentlyUsesEmailIdentifier:authEmailPresent>0,
    protectedShopperAuthCanResolveStableProfile:shopperClaimUsers>0 && shopperClaimMissingProfile===0 && shopperClaimProfilesExisting===shopperClaimUsers,
    canonicalVisitHistoryCanResolveProfiles:visitsWithShopperId===visitsSnap.size && referencedProfilesExisting===referencedShopperIds.size,
    passwordValueRecoverableFromFirebaseAuth:false
  },
  safety:{providerReads:true,providerWrites:0,authWrites:0,passwordChanges:0,firestoreWrites:0,rulesDeploys:0,hostingDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,identifierValuesExported:false,credentialValuesExported:false,secretsExported:false}
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(out, JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({
  decision:'PASS_C6_PROTECTED_PROFILE_AUTH_HISTORY_READONLY_INVENTORY',
  shoppers:shoppers.documents,
  visits:visitsSnap.size,
  authUsers,
  shopperClaimUsers,
  shopperClaimProfilesExisting,
  profileCoverage,
  conclusions:result.conclusions,
  providerWrites:0,
  piiExported:false,
  credentialValuesExported:false
}));
