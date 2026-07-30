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

const presenceFields = ['user','username','login','pass','password','email','authUid','authEmail'];
const emptyCounts = () => Object.fromEntries(presenceFields.map(k => [k,0]));
const shoppers = {documents:0, fieldsPresent:emptyCounts()};
const users = {documents:0, fieldsPresent:emptyCounts()};

async function scanCollection(ref, sink){
  const snap = await ref.get();
  sink.documents = snap.size;
  for(const d of snap.docs){
    const v = d.data() || {};
    for(const k of presenceFields){
      if(v[k] !== undefined && v[k] !== null && String(v[k]).length > 0) sink.fieldsPresent[k]++;
    }
  }
}

await scanCollection(db.collection('tenants').doc(tenantId).collection('shoppers'), shoppers);
await scanCollection(db.collection('tenants').doc(tenantId).collection('users'), users);

const profilePaths = [
  db.collection('tenants').doc(tenantId),
  db.collection('tenants').doc(tenantId).collection('profile').doc('main')
];
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

let authUsers=0, passwordUsers=0, authEmailPresent=0, pageToken;
do{
  const page = await auth.listUsers(1000,pageToken);
  authUsers += page.users.length;
  for(const u of page.users){
    if((u.providerData||[]).some(p=>p.providerId==='password')) passwordUsers++;
    if(u.email) authEmailPresent++;
  }
  pageToken = page.pageToken;
}while(pageToken);

const result = {
  schemaVersion:'cxorbia.corte6.credential-continuity-readonly.v1',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  tenantId,
  canonicalProjectId,
  mode:'READ_ONLY_SOURCE_SAFE',
  canonicalFirestore:{shoppers,users,tenantProfile:profile},
  firebaseAuth:{users:authUsers,passwordProviderUsers:passwordUsers,emailIdentifierUsers:authEmailPresent},
  conclusions:{
    canonicalShopperHasLegacyUsernameField: shoppers.fieldsPresent.user>0 || shoppers.fieldsPresent.username>0 || shoppers.fieldsPresent.login>0,
    canonicalShopperHasLegacyPasswordField: shoppers.fieldsPresent.pass>0 || shoppers.fieldsPresent.password>0,
    canonicalUserHasLegacyUsernameField: users.fieldsPresent.user>0 || users.fieldsPresent.username>0 || users.fieldsPresent.login>0,
    canonicalUserHasLegacyPasswordField: users.fieldsPresent.pass>0 || users.fieldsPresent.password>0,
    firebaseAuthCurrentlyUsesEmailIdentifier: authEmailPresent>0
  },
  safety:{providerWrites:0,authWrites:0,passwordChanges:0,firestoreWrites:0,rulesDeploys:0,hostingDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,credentialValuesExported:false,secretsExported:false}
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(out, JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:'PASS_READONLY_CREDENTIAL_CONTINUITY_INVENTORY',shoppers:shoppers.documents,users:users.documents,authUsers,passwordUsers,conclusions:result.conclusions,providerWrites:0,piiExported:false,credentialValuesExported:false}));
