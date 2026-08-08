import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_USERNAME_DELTA_OUT||'app/docs/evidence/CORTE6-USERNAME-DELTA-READONLY-LATEST.json';
const tenantId='tya';
const projectId='cinepolis';

function fail(msg){throw new Error(msg);}
function hasValue(v){return v!==undefined&&v!==null&&String(v).trim()!=='';}
for(const p of [credentialPath,envelopePath,publicPath,privatePath]) if(!p||!fs.existsSync(p)) fail(`required_file_missing:${p||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject)fail('target_mismatch');
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)fail('key_fingerprint_mismatch');

const salt=Buffer.from(encPriv.saltBase64,'base64');
const ivPriv=Buffer.from(encPriv.ivBase64,'base64');
const tag=Buffer.from(encPriv.tagBase64,'base64');
const ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);decipher.setAuthTag(tag);
const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
const encrypted=Buffer.from(env.ciphertextBase64,'base64');
if(encrypted.length<17)fail('ciphertext_too_short');
const tagContent=encrypted.subarray(encrypted.length-16);
const ct=encrypted.subarray(0,encrypted.length-16);
const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));
dec.setAAD(Buffer.from(env.aad,'utf8'));dec.setAuthTag(tagContent);
const decrypted=Buffer.concat([dec.update(ct),dec.final()]);
const bundleBytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(decrypted):decrypted;
const bundle=JSON.parse(bundleBytes.toString('utf8'));
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion)||bundle.targetProjectId!==expectedProject||bundle.tenantId!==tenantId||bundle.canonicalProjectId!==projectId)fail('bundle_contract_mismatch');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const auth=admin.auth();
const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').select('legacyShopperId','user','username','login').get();
const byLegacy=new Map();
for(const d of shopperSnap.docs){
  const data=d.data()||{};
  const legacy=String(data.legacyShopperId||'').trim();
  if(!legacy)continue;
  if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);
  byLegacy.get(legacy).push({docId:d.id,currentUsername:String(data.username||data.user||data.login||'').trim().toLowerCase()});
}

const authByUid=new Map();
let pageToken;
do{
  const page=await auth.listUsers(1000,pageToken);
  for(const u of page.users)authByUid.set(u.uid,u);
  pageToken=page.pageToken;
}while(pageToken);

const counts={
  bundleShopperRecords:0,
  exactCanonicalLegacyMatch:0,
  exactAuthClaimBinding:0,
  plannedUsernameFillMissingExact:0,
  usernameAlreadySame:0,
  passwordHashEvidenceOnly:0,
  holds:{
    badRecord:0,
    canonicalLegacyMissing:0,
    canonicalLegacyAmbiguous:0,
    authUserMissing:0,
    authClaimMismatch:0,
    existingUsernameConflict:0
  }
};

for(const r of Array.isArray(bundle.records)?bundle.records:[]){
  if(!r||r.kind!=='shopper')continue;
  counts.bundleShopperRecords++;
  const normalizedLogin=String(r.normalizedLogin||'').trim().toLowerCase();
  const loginIdentifier=String(r.loginIdentifier||'').trim().toLowerCase();
  const legacyId=String(r.legacyId||'').trim();
  if(!normalizedLogin||normalizedLogin!==loginIdentifier||!legacyId){counts.holds.badRecord++;continue;}
  if(/^[a-f0-9]{64}$/.test(String(r.passwordHashHex||'')))counts.passwordHashEvidenceOnly++;
  const matches=byLegacy.get(legacyId)||[];
  if(matches.length===0){counts.holds.canonicalLegacyMissing++;continue;}
  if(matches.length!==1){counts.holds.canonicalLegacyAmbiguous++;continue;}
  counts.exactCanonicalLegacyMatch++;
  const match=matches[0];
  const digest=crypto.createHash('sha256').update(`${tenantId}\0shopper\0${normalizedLogin}`,'utf8').digest('hex');
  const uid=`tya-sh-${digest.slice(0,24)}`;
  const au=authByUid.get(uid);
  if(!au){counts.holds.authUserMissing++;continue;}
  const claims=au.customClaims||{};
  if(claims.role!=='shopper'||claims.authNamespace!=='shopper'||String(claims.shopperId||'')!==match.docId||claims.tenantId!==tenantId||!(Array.isArray(claims.projectIds)&&claims.projectIds.includes(projectId))){
    counts.holds.authClaimMismatch++;continue;
  }
  counts.exactAuthClaimBinding++;
  if(!match.currentUsername)counts.plannedUsernameFillMissingExact++;
  else if(match.currentUsername===normalizedLogin)counts.usernameAlreadySame++;
  else counts.holds.existingUsernameConflict++;
}

const holdTotal=Object.values(counts.holds).reduce((a,b)=>a+b,0);
const result={
  schemaVersion:'cxorbia.corte6.username-delta-readonly.v1',
  generatedAt:new Date().toISOString(),
  target:{projectId:expectedProject,tenantId,canonicalProjectId:projectId},
  source:{encryptedCredentialBundle:true,plaintextCredentialValuesPersisted:false},
  policy:{stableLegacyIdRequired:true,authClaimBindingRequired:true,nameMatchAllowed:false,phoneMatchAllowed:false,fillMissingUsernameOnly:true,overwriteExistingUsername:false,passwordToFirestore:false},
  counts,
  decision:counts.plannedUsernameFillMissingExact>0?'READY_USERNAME_FILL_MISSING_EXACT_FOR_SEPARATE_FIRESTORE_AUTHORIZATION':(holdTotal?'HOLD_USERNAME_DELTA_REVIEW':'PASS_NO_USERNAME_DELTA'),
  passwordConclusion:'Firebase Auth and the encrypted handoff prove password-hash continuity but do not provide a retrievable current plaintext password. No password value is planned for Firestore.',
  safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,rulesDeploys:0,hostingDeploys:0,hrWrites:0,legacyWrites:0,storageWrites:0,production:false,merge:false,piiExported:false,usernameValuesExported:false,passwordValuesExported:false,passwordHashesExported:false,secretsExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:result.decision,counts,safety:result.safety}));
