import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const canonicalProjectId=process.env.CXORBIA_PROJECT_ID||'cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_PROFILE_FULL_ENVELOPE||'.tmp/c6-profile-identity-bridge/corte6-profile-full-bundle-v2.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_PROFILE_IDENTITY_BRIDGE_OUT||'app/docs/evidence/CORTE6-PROFILE-FULL-IDENTITY-BRIDGE-READONLY-LATEST.json';

const fail=m=>{throw new Error(m)};
const has=v=>v!==undefined&&v!==null&&(!(typeof v==='string')||v.trim()!=='');
const text=v=>has(v)?String(v).trim():'';
const safe=o=>o&&typeof o==='object'&&!Array.isArray(o)?o:{};
const pick=(o,keys)=>{for(const k of keys)if(has(o?.[k]))return o[k];return''};
const norm=v=>String(v??'').trim().toLowerCase();
const normPhone=v=>String(v??'').replace(/\D/g,'');
const normCountry=v=>{const x=norm(v);if(['gt','guatemala'].includes(x))return'GT';if(['hn','honduras'].includes(x))return'HN';return x.toUpperCase()};
const equal=(field,a,b)=>{if(field==='phone')return normPhone(a)===normPhone(b);if(field==='country')return normCountry(a)===normCountry(b);return norm(a)===norm(b)};
const sum=o=>Object.values(o||{}).reduce((a,b)=>a+Number(b||0),0);

for(const p of [credentialPath,envelopePath,publicPath,privatePath])if(!p||!fs.existsSync(p))fail(`required_file_missing:${p||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject||env.tenantId!==tenantId)fail('target_mismatch');
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)fail('key_fingerprint_mismatch');
if(env.schemaVersion!=='cxorbia.corte6.profile-full-handoff-envelope.v2')fail('envelope_contract_mismatch');
const expectedAad='cxorbia-c6-profile-full-handoff-v2:'+pub.fingerprintSha256;
if(env.aad!==expectedAad)fail('aad_mismatch');

const salt=Buffer.from(encPriv.saltBase64,'base64');
const ivPriv=Buffer.from(encPriv.ivBase64,'base64');
const tagPriv=Buffer.from(encPriv.tagBase64,'base64');
const ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const decipherPriv=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);decipherPriv.setAuthTag(tagPriv);
const privateDer=Buffer.concat([decipherPriv.update(ciphertextPriv),decipherPriv.final()]);
const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
const encrypted=Buffer.from(env.ciphertextBase64,'base64');
if(encrypted.length<17)fail('ciphertext_too_short');
const tag=encrypted.subarray(encrypted.length-16),ct=encrypted.subarray(0,encrypted.length-16);
const decipher=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));decipher.setAAD(Buffer.from(env.aad,'utf8'));decipher.setAuthTag(tag);
const bundle=JSON.parse(Buffer.concat([decipher.update(ct),decipher.final()]).toString('utf8'));
if(bundle.schemaVersion!=='cxorbia.corte6.profile-full-handoff-bundle.v2'||bundle.targetProjectId!==expectedProject||bundle.tenantId!==tenantId||bundle.canonicalProjectId!==canonicalProjectId)fail('bundle_contract_mismatch');
if(bundle.contract?.stableMatch!=='legacyShopperId_only'||bundle.contract?.passwordIncludedEncrypted!==true||bundle.contract?.piiIncludedEncrypted!==true||bundle.contract?.noNamePhoneEmailIdentityMatching!==true)fail('unsafe_bundle_contract');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const auth=admin.auth();
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').get();
const docsById=new Map();
const byLegacy=new Map();
for(const d of snap.docs){
  const v=d.data()||{};
  docsById.set(d.id,{id:d.id,data:v});
  const legacy=text(v.legacyShopperId);
  if(legacy){if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push({id:d.id,data:v});}
}

const records=Array.isArray(bundle.records)?bundle.records:[];
const usernameFreq=new Map();
for(const rec of records){
  const p=safe(rec?.profile);
  const u=norm(pick(p,['username','login','user']));
  if(u&&!u.includes('@'))usernameFreq.set(u,(usernameFreq.get(u)||0)+1);
}

const authByUid=new Map();
let pageToken;
do{
  const page=await auth.listUsers(1000,pageToken);
  for(const u of page.users)authByUid.set(u.uid,u);
  pageToken=page.pageToken;
}while(pageToken);

const fields={
  name:{src:p=>pick(p,['nombre','name','fullName']),dst:o=>pick(o,['nombre','name','fullName']),writeKey:'nombre'},
  username:{src:p=>pick(p,['username','login','user']),dst:o=>pick(o,['username','login','user']),writeKey:'username'},
  password:{src:p=>pick(p,['pass','password']),dst:o=>pick(o,['pass','password']),writeKey:'pass'},
  phone:{src:p=>pick(p,['wa','whatsapp','phone','telefono']),dst:o=>pick(o,['whatsapp','wa','phone','telefono']),writeKey:'whatsapp'},
  email:{src:p=>pick(p,['email','correo']),dst:o=>pick(o,['email','correo']),writeKey:'email'},
  country:{src:p=>pick(p,['pais','country']),dst:o=>pick(o,['pais','country']),writeKey:'pais'},
  city:{src:p=>pick(p,['ciudad','city']),dst:o=>pick(o,['ciudad','city']),writeKey:'ciudad'},
  department:{src:p=>pick(p,['departamento','depto','department']),dst:o=>pick(o,['departamento','depto','department']),writeKey:'depto'},
  document:{src:p=>pick(p,['dpi','documentId','documento','idNumber']),dst:o=>pick(o,['dpi','documentId','documento','idNumber']),writeKey:'dpi'},
  address:{src:p=>pick(p,['direccion','address']),dst:o=>pick(o,['direccion','address']),writeKey:'direccion'},
  birthDate:{src:p=>pick(p,['fecha_nac','fechaNacimiento','birthDate']),dst:o=>pick(o,['fecha_nac','fechaNacimiento','birthDate']),writeKey:'fecha_nac'},
  acceptedTerms:{src:p=>pick(p,['accepted_terms','acceptedTerms']),dst:o=>pick(o,['accepted_terms','acceptedTerms']),writeKey:'accepted_terms'},
  accountApproval:{src:p=>pick(p,['aprobacionCuenta','accountApproval']),dst:o=>pick(o,['aprobacionCuenta','accountApproval']),writeKey:'aprobacionCuenta'},
  registrationOrigin:{src:p=>pick(p,['registroOrigen','registrationOrigin']),dst:o=>pick(o,['registroOrigen','registrationOrigin']),writeKey:'registroOrigen'}
};

const counts={
  sourceRecords:0,
  legacyExact:0,
  legacyMissing:0,
  legacyAmbiguous:0,
  authBridge:{
    considered:0,
    sourceUsernameMissing:0,
    sourceUsernameDuplicate:0,
    authUserMissing:0,
    authClaimInvalid:0,
    targetProfileMissing:0,
    targetAlreadyLinkedSameLegacy:0,
    targetLegacyCollision:0,
    targetClaimReusedByMultipleSourceRecords:0,
    resolvedExact:0
  },
  final:{exactProfiles:0,remainingHold:0,identityLinksPlanned:0,docsWithPlannedChanges:0,profileFieldValuesPlanned:0}
};
const plannedByField=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const targetUse=new Map();
const resolved=[];
const pendingBridge=[];

for(const rec of records){
  counts.sourceRecords++;
  if(!rec||typeof rec!=='object'||!text(rec.legacyShopperId)||!rec.profile||typeof rec.profile!=='object'){pendingBridge.push({rec,reason:'bad'});continue;}
  const legacyId=text(rec.legacyShopperId),matches=byLegacy.get(legacyId)||[];
  if(matches.length===1){counts.legacyExact++;resolved.push({rec,target:matches[0],linkLegacy:false,method:'legacyShopperId'});continue;}
  if(matches.length>1){counts.legacyAmbiguous++;pendingBridge.push({rec,reason:'legacy_ambiguous'});continue;}
  counts.legacyMissing++;pendingBridge.push({rec,reason:'legacy_missing'});
}

for(const item of pendingBridge){
  if(item.reason!=='legacy_missing')continue;
  counts.authBridge.considered++;
  const rec=item.rec,profile=safe(rec.profile),legacyId=text(rec.legacyShopperId);
  const username=norm(pick(profile,['username','login','user']));
  if(!username||username.includes('@')){counts.authBridge.sourceUsernameMissing++;continue;}
  if((usernameFreq.get(username)||0)!==1){counts.authBridge.sourceUsernameDuplicate++;continue;}
  const digest=crypto.createHash('sha256').update(`${tenantId}\0shopper\0${username}`,'utf8').digest('hex');
  const uid=`tya-sh-${digest.slice(0,24)}`;
  const au=authByUid.get(uid);
  if(!au){counts.authBridge.authUserMissing++;continue;}
  const claims=au.customClaims||{};
  if(claims.role!=='shopper'||claims.authNamespace!=='shopper'||claims.tenantId!==tenantId||!text(claims.shopperId)||!(Array.isArray(claims.projectIds)&&claims.projectIds.includes(canonicalProjectId))){counts.authBridge.authClaimInvalid++;continue;}
  const target=docsById.get(text(claims.shopperId));
  if(!target){counts.authBridge.targetProfileMissing++;continue;}
  const existingLegacy=text(target.data.legacyShopperId);
  if(existingLegacy===legacyId){counts.authBridge.targetAlreadyLinkedSameLegacy++;resolved.push({rec,target,linkLegacy:false,method:'authClaim'});continue;}
  if(existingLegacy&&existingLegacy!==legacyId){counts.authBridge.targetLegacyCollision++;continue;}
  const used=targetUse.get(target.id)||[];used.push(legacyId);targetUse.set(target.id,used);
  resolved.push({rec,target,linkLegacy:true,method:'authClaim'});
}

const reusedTargets=new Set([...targetUse.entries()].filter(([,ids])=>new Set(ids).size>1).map(([id])=>id));
const finalResolved=[];
for(const x of resolved){
  if(x.method==='authClaim'&&reusedTargets.has(x.target.id)){counts.authBridge.targetClaimReusedByMultipleSourceRecords++;continue;}
  if(x.method==='authClaim'&&x.linkLegacy)counts.authBridge.resolvedExact++;
  finalResolved.push(x);
}

let identityLinksPlanned=0,docsWithChanges=0;
for(const x of finalResolved){
  const profile=safe(x.rec.profile),current=x.target.data;let changed=false;
  for(const [name,c] of Object.entries(fields)){
    const src=c.src(profile),dst=c.dst(current);
    if(!has(src)||equal(name,src,dst))continue;
    plannedByField[name]++;changed=true;
  }
  if(x.linkLegacy){identityLinksPlanned++;changed=true;}
  if(changed)docsWithChanges++;
}
counts.final.exactProfiles=finalResolved.length;
counts.final.remainingHold=counts.sourceRecords-finalResolved.length;
counts.final.identityLinksPlanned=identityLinksPlanned;
counts.final.docsWithPlannedChanges=docsWithChanges;
counts.final.profileFieldValuesPlanned=sum(plannedByField);

const result={
  schemaVersion:'cxorbia.corte6.profile-full-identity-bridge-readonly.v2',
  generatedAt:new Date().toISOString(),
  target:{projectId:expectedProject,tenantId,canonicalProjectId},
  source:{encryptedV2Bundle:true,records:counts.sourceRecords,plaintextPersisted:false},
  policy:{primaryIdentity:'legacyShopperId exact',secondaryIdentityBridge:'deterministic Auth UID from unique legacy username -> validated shopper custom claim -> existing Firestore shopper doc',nameMatchAllowed:false,phoneMatchAllowed:false,emailMatchAllowed:false,usernameAloneMatchAllowed:false,authClaimRequired:true,existingDifferentLegacyIdCollisionHold:true,duplicateSourceUsernameHold:true,reusedTargetHold:true},
  counts,
  plannedProfileFields:plannedByField,
  decision:counts.final.remainingHold===0?'READY_FULL_PROFILE_ALL_SOURCE_RECORDS_EXACT':'READY_FULL_PROFILE_PARTIAL_EXACT_WITH_REMAINING_IDENTITY_HOLD',
  safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,rulesDeploys:0,hostingDeploys:0,cloudRunDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,usernameValuesExported:false,passwordValuesExported:false,profileValuesExported:false,secretsExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:result.decision,counts:result.counts,plannedProfileFields:result.plannedProfileFields,safety:result.safety}));
