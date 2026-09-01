import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outPath = process.env.CXORBIA_PROTECTED_IDENTITY_REPORT || 'app/docs/evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json';
const tenantId = 'tya';
const projectId = 'cinepolis';

function norm(v){ return String(v ?? '').trim().replace(/\s+/g, ' '); }
function isPlaceholder(v){ return /^shopper protegido$/i.test(norm(v)); }
function visibleName(d){
  const n = norm(d?.nombre || d?.name || d?.displayName || [d?.firstName,d?.lastName].filter(Boolean).join(' '));
  return n && !isPlaceholder(n) ? n : '';
}
function sha256(text){ return crypto.createHash('sha256').update(text).digest('hex'); }
function assert(condition, code){ if(!condition) throw new Error(code); }

assert(credentialPath && fs.existsSync(credentialPath), 'credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
assert(sa.project_id === expectedProject, `wrong_project:${sa.project_id || 'missing'}`);

if(!admin.apps.length) admin.initializeApp({credential:admin.credential.cert(sa), projectId:expectedProject});
const db = admin.firestore();

const shoppersSnap = await db.collection('tenants').doc(tenantId).collection('shoppers')
  .select('nombre','name','displayName','firstName','lastName','profileStatus','production').get();
let shopperVisibleNames = 0;
let shopperPlaceholders = 0;
let shopperMissingNames = 0;
for(const doc of shoppersSnap.docs){
  const d = doc.data() || {};
  const candidate = norm(d.nombre || d.name || d.displayName || [d.firstName,d.lastName].filter(Boolean).join(' '));
  if(isPlaceholder(candidate)) shopperPlaceholders++;
  else if(visibleName(d)) shopperVisibleNames++;
  else shopperMissingNames++;
}

const visitsSnap = await db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('visits')
  .select('shopperId','shopperName','shopper','periodId').get();
const referencedShopperIds = new Set();
let visitsWithRealName = 0;
let visitPlaceholderNames = 0;
let visitsMissingName = 0;
let visitsMissingShopperId = 0;
for(const doc of visitsSnap.docs){
  const d = doc.data() || {};
  const shopperId = norm(d.shopperId);
  const name = norm(d.shopperName || d.shopper);
  if(shopperId) referencedShopperIds.add(shopperId); else visitsMissingShopperId++;
  if(isPlaceholder(name)) visitPlaceholderNames++;
  else if(name) visitsWithRealName++;
  else visitsMissingName++;
}

const referencedRefs = [...referencedShopperIds].sort().map(id=>db.collection('tenants').doc(tenantId).collection('shoppers').doc(id));
const referencedSnaps = [];
for(let i=0;i<referencedRefs.length;i+=150){ referencedSnaps.push(...await db.getAll(...referencedRefs.slice(i,i+150))); }
let referencedExisting = 0;
let referencedWithRealName = 0;
let referencedPlaceholder = 0;
let referencedMissingName = 0;
for(const snap of referencedSnaps){
  if(!snap.exists) continue;
  referencedExisting++;
  const d = snap.data() || {};
  const candidate = norm(d.nombre || d.name || d.displayName || [d.firstName,d.lastName].filter(Boolean).join(' '));
  if(isPlaceholder(candidate)) referencedPlaceholder++;
  else if(visibleName(d)) referencedWithRealName++;
  else referencedMissingName++;
}

const rulesSource = fs.readFileSync('firestore.rules','utf8');
const adapterSource = fs.readFileSync('app/core/backend-firebase.js','utf8');
const sourceSafeSource = fs.readFileSync('app/data/tya-hr-source-safe-periods.js','utf8');
const rulesEvidence = JSON.parse(fs.readFileSync('app/docs/evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json','utf8'));

const staticChecks = {
  shopperRuleProtected: /match \/shoppers\/\{shopperIdParam\}[\s\S]*?allow read: if tenantAllowed\(tenantId\) && \(isOperator\(\) \|\| isOwnShopper\(shopperIdParam\)\)/.test(rulesSource),
  denyByDefault: /match \/\{document=\*\*\}[\s\S]*?allow read, write: if false/.test(rulesSource),
  adapterLoadsProtectedShoppers: adapterSource.includes("function shoppersCol(){ return tenantRef().collection(col.shoppers || 'shoppers'); }") && adapterSource.includes('async function loadAuthorizedShoppers(ctx)'),
  adapterUsesRealNameFields: adapterSource.includes("nombre: s.nombre || s.name || s.fullName || id || 'Shopper'"),
  publicSourceSafeStillMasked: sourceSafeSource.includes('"nombre": "Shopper protegido"') && sourceSafeSource.includes('"piiProtected": true'),
  deployedRulesVerified: rulesEvidence.decision === 'PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED' && rulesEvidence.verified === true,
  localRulesMatchDeployedEvidence: sha256(rulesSource) === rulesEvidence.sourceSha256
};

const blockers = [];
if(shoppersSnap.size !== 340) blockers.push(`tenant_shopper_count_drift:${shoppersSnap.size}`);
if(visitsSnap.size !== 616) blockers.push(`canonical_visit_count_drift:${visitsSnap.size}`);
if(referencedShopperIds.size !== 194) blockers.push(`referenced_shopper_count_drift:${referencedShopperIds.size}`);
if(referencedExisting !== referencedShopperIds.size) blockers.push(`referenced_profile_missing:${referencedShopperIds.size-referencedExisting}`);
if(referencedWithRealName !== referencedShopperIds.size) blockers.push(`referenced_profile_real_name_gap:${referencedShopperIds.size-referencedWithRealName}`);
if(referencedPlaceholder !== 0) blockers.push(`referenced_profile_placeholder:${referencedPlaceholder}`);
if(visitsWithRealName !== 616) blockers.push(`visit_real_name_gap:${616-visitsWithRealName}`);
if(visitPlaceholderNames !== 0) blockers.push(`visit_placeholder_name:${visitPlaceholderNames}`);
if(visitsMissingName !== 0) blockers.push(`visit_missing_name:${visitsMissingName}`);
if(visitsMissingShopperId !== 0) blockers.push(`visit_missing_shopper_id:${visitsMissingShopperId}`);
for(const [key,value] of Object.entries(staticChecks)) if(value !== true) blockers.push(`static:${key}`);

const report = {
  schemaVersion:'cxorbia.corte6-protected-shopper-identity-readonly.v1',
  generatedAt:new Date().toISOString(),
  decision:blockers.length ? 'HOLD_C6_PROTECTED_IDENTITY_READONLY' : 'PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY',
  target:{firebaseProjectId:expectedProject,tenantId,projectId},
  protectedFirestore:{
    tenantShopperDocs:shoppersSnap.size,
    shopperProfilesWithVisibleRealName:shopperVisibleNames,
    shopperProfilesWithPlaceholderName:shopperPlaceholders,
    shopperProfilesWithoutVisibleName:shopperMissingNames,
    canonicalVisits:visitsSnap.size,
    canonicalVisitsWithRealName:visitsWithRealName,
    canonicalVisitsWithPlaceholderName:visitPlaceholderNames,
    canonicalVisitsWithoutName:visitsMissingName,
    canonicalVisitsWithoutShopperId:visitsMissingShopperId,
    referencedCanonicalShopperIds:referencedShopperIds.size,
    referencedProfilesExisting:referencedExisting,
    referencedProfilesWithRealName:referencedWithRealName,
    referencedProfilesWithPlaceholderName:referencedPlaceholder,
    referencedProfilesWithoutVisibleName:referencedMissingName
  },
  staticChecks,
  blockers,
  releaseRule:'Source-safe public preview may remain masked; protected authenticated Admin/Operativo runtime must use Firestore identity and must not render Shopper protegido for canonical referenced shoppers.',
  safety:{providerReads:true,authWrites:0,firestoreDataWrites:0,rulesDeploys:0,hostingDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,payments:0,functionsDeploys:0,makeWrites:0,geminiCalls:0,merge:false,production:false,piiExported:false,identifiersExported:false,secretsExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(outPath, JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:report.decision, protectedFirestore:report.protectedFirestore, staticChecks, blockers, safety:report.safety}));
if(blockers.length) process.exitCode = 2;
