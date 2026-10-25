import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const canonicalProjectId=process.env.CXORBIA_PROJECT_ID||'cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_PROFILE_FULL_ENVELOPE||'.tmp/c6-profile-identity-bridge-v3/corte6-profile-full-bundle-v2.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_PROFILE_IDENTITY_BRIDGE_OUT||'app/docs/evidence/CORTE6-PROFILE-FULL-IDENTITY-BRIDGE-V3-READONLY-LATEST.json';

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
const docsById=new Map(),byLegacy=new Map(),byTechnical=new Map();
const technicalFields=['sourceKey','shopperId','legacyId','externalId','externalShopperId','sourceId'];
function addTech(key,doc){const k=text(key);if(!k)return;if(!byTechnical.has(k))byTechnical.set(k,new Map());byTechnical.get(k).set(doc.id,doc);}
for(const d of snap.docs){
  const v=d.data()||{},doc={id:d.id,data:v};docsById.set(d.id,doc);
  const legacy=text(v.legacyShopperId);if(legacy){if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push(doc);}
  addTech(d.id,doc);for(const f of technicalFields)addTech(v[f],doc);
}

const records=Array.isArray(bundle.records)?bundle.records:[];
const usernameFreq=new Map();
for(const rec of records){const u=norm(pick(safe(rec?.profile),['username','login','user']));if(u&&!u.includes('@'))usernameFreq.set(u,(usernameFreq.get(u)||0)+1);}
const authByUid=new Map();let pageToken;
do{const page=await auth.listUsers(1000,pageToken);for(const u of page.users)authByUid.set(u.uid,u);pageToken=page.pageToken;}while(pageToken);

const fields={
  name:{src:p=>pick(p,['nombre','name','fullName']),dst:o=>pick(o,['nombre','name','fullName'])},
  username:{src:p=>pick(p,['username','login','user']),dst:o=>pick(o,['username','login','user'])},
  password:{src:p=>pick(p,['pass','password']),dst:o=>pick(o,['pass','password'])},
  phone:{src:p=>pick(p,['wa','whatsapp','phone','telefono']),dst:o=>pick(o,['whatsapp','wa','phone','telefono'])},
  email:{src:p=>pick(p,['email','correo']),dst:o=>pick(o,['email','correo'])},
  country:{src:p=>pick(p,['pais','country']),dst:o=>pick(o,['pais','country'])},
  city:{src:p=>pick(p,['ciudad','city']),dst:o=>pick(o,['ciudad','city'])},
  department:{src:p=>pick(p,['departamento','depto','department']),dst:o=>pick(o,['departamento','depto','department'])},
  document:{src:p=>pick(p,['dpi','documentId','documento','idNumber']),dst:o=>pick(o,['dpi','documentId','documento','idNumber'])},
  address:{src:p=>pick(p,['direccion','address']),dst:o=>pick(o,['direccion','address'])},
  birthDate:{src:p=>pick(p,['fecha_nac','fechaNacimiento','birthDate']),dst:o=>pick(o,['fecha_nac','fechaNacimiento','birthDate'])},
  acceptedTerms:{src:p=>pick(p,['accepted_terms','acceptedTerms']),dst:o=>pick(o,['accepted_terms','acceptedTerms'])},
  accountApproval:{src:p=>pick(p,['aprobacionCuenta','accountApproval']),dst:o=>pick(o,['aprobacionCuenta','accountApproval'])},
  registrationOrigin:{src:p=>pick(p,['registroOrigen','registrationOrigin']),dst:o=>pick(o,['registroOrigen','registrationOrigin'])}
};

const counts={sourceRecords:0,legacyExact:0,legacyMissing:0,legacyAmbiguous:0,technicalBridge:{considered:0,uniqueCandidate:0,ambiguousCandidate:0,targetLegacyCollision:0,resolvedExact:0},authBridge:{considered:0,sourceUsernameMissing:0,sourceUsernameDuplicate:0,authUserMissing:0,authClaimInvalid:0,targetProfileMissing:0,targetLegacyCollision:0,targetReused:0,resolvedExact:0},final:{exactProfiles:0,remainingHold:0,identityLinksPlanned:0,docsWithProfileFieldChanges:0,docsWithAnyWrite:0,profileFieldValuesPlanned:0}};
const plannedByField=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const resolved=[],remaining=[];
for(const rec of records){
  counts.sourceRecords++;
  if(!rec||typeof rec!=='object'||!text(rec.legacyShopperId)||!rec.profile||typeof rec.profile!=='object'){remaining.push({rec,reason:'bad'});continue;}
  const legacyId=text(rec.legacyShopperId),matches=byLegacy.get(legacyId)||[];
  if(matches.length===1){counts.legacyExact++;resolved.push({rec,target:matches[0],linkLegacy:false,method:'legacy'});continue;}
  if(matches.length>1){counts.legacyAmbiguous++;remaining.push({rec,reason:'legacy_ambiguous'});continue;}
  counts.legacyMissing++;
  counts.technicalBridge.considered++;
  const tech=[...(byTechnical.get(legacyId)?.values()||[])];
  if(tech.length===1){
    counts.technicalBridge.uniqueCandidate++;
    const existing=text(tech[0].data.legacyShopperId);
    if(existing&&existing!==legacyId){counts.technicalBridge.targetLegacyCollision++;remaining.push({rec,reason:'technical_collision'});continue;}
    counts.technicalBridge.resolvedExact++;resolved.push({rec,target:tech[0],linkLegacy:!existing,method:'technical'});continue;
  }
  if(tech.length>1){counts.technicalBridge.ambiguousCandidate++;remaining.push({rec,reason:'technical_ambiguous'});continue;}
  remaining.push({rec,reason:'needs_auth'});
}

const authCandidateTargetUse=new Map(),authResolved=[];
for(const item of remaining){
  if(item.reason!=='needs_auth')continue;
  counts.authBridge.considered++;
  const rec=item.rec,profile=safe(rec.profile),legacyId=text(rec.legacyShopperId),username=norm(pick(profile,['username','login','user']));
  if(!username||username.includes('@')){counts.authBridge.sourceUsernameMissing++;continue;}
  if((usernameFreq.get(username)||0)!==1){counts.authBridge.sourceUsernameDuplicate++;continue;}
  const digest=crypto.createHash('sha256').update(`${tenantId}\0shopper\0${username}`,'utf8').digest('hex');
  const uid=`tya-sh-${digest.slice(0,24)}`,au=authByUid.get(uid);
  if(!au){counts.authBridge.authUserMissing++;continue;}
  const claims=au.customClaims||{};
  if(claims.role!=='shopper'||claims.authNamespace!=='shopper'||claims.tenantId!==tenantId||!text(claims.shopperId)||!(Array.isArray(claims.projectIds)&&claims.projectIds.includes(canonicalProjectId))){counts.authBridge.authClaimInvalid++;continue;}
  const target=docsById.get(text(claims.shopperId));if(!target){counts.authBridge.targetProfileMissing++;continue;}
  const existing=text(target.data.legacyShopperId);if(existing&&existing!==legacyId){counts.authBridge.targetLegacyCollision++;continue;}
  if(!authCandidateTargetUse.has(target.id))authCandidateTargetUse.set(target.id,[]);authCandidateTargetUse.get(target.id).push({rec,target,linkLegacy:!existing,method:'auth'});
}
for(const arr of authCandidateTargetUse.values()){
  if(arr.length!==1){counts.authBridge.targetReused+=arr.length;continue;}
  counts.authBridge.resolvedExact++;authResolved.push(arr[0]);
}
resolved.push(...authResolved);

let identityLinks=0,docsWithFields=0,docsWithAny=0;
for(const x of resolved){
  const p=safe(x.rec.profile),current=x.target.data;let fieldChanged=false;
  for(const [name,c] of Object.entries(fields)){const src=c.src(p),dst=c.dst(current);if(!has(src)||equal(name,src,dst))continue;plannedByField[name]++;fieldChanged=true;}
  if(fieldChanged)docsWithFields++;
  if(x.linkLegacy)identityLinks++;
  if(fieldChanged||x.linkLegacy||current.legacyProfileCurrent!==true||current.legacyProfileSource!=='tya-plataforma-export-20260730')docsWithAny++;
}
counts.final.exactProfiles=resolved.length;counts.final.remainingHold=counts.sourceRecords-resolved.length;counts.final.identityLinksPlanned=identityLinks;counts.final.docsWithProfileFieldChanges=docsWithFields;counts.final.docsWithAnyWrite=docsWithAny;counts.final.profileFieldValuesPlanned=sum(plannedByField);

const result={schemaVersion:'cxorbia.corte6.profile-full-identity-bridge-readonly.v3',generatedAt:new Date().toISOString(),target:{projectId:expectedProject,tenantId,canonicalProjectId},source:{encryptedV2Bundle:true,records:counts.sourceRecords,plaintextPersisted:false},policy:{primaryIdentity:'legacyShopperId exact',secondaryTechnicalBridge:'exact unique Firestore document id/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId equals legacyShopperId',tertiaryAuthBridge:'deterministic Auth UID from unique legacy username -> validated shopper custom claim -> existing Firestore shopper doc',nameMatchAllowed:false,phoneMatchAllowed:false,emailMatchAllowed:false,usernameAloneMatchAllowed:false,technicalKeyMustBeUnique:true,authClaimRequired:true,differentLegacyIdCollisionHold:true,reusedTargetHold:true},counts,plannedProfileFields:plannedByField,decision:counts.final.remainingHold===0?'READY_FULL_PROFILE_ALL_SOURCE_RECORDS_EXACT':'READY_FULL_PROFILE_PARTIAL_EXACT_WITH_REMAINING_IDENTITY_HOLD',safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,rulesDeploys:0,hostingDeploys:0,cloudRunDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,identifierValuesExported:false,usernameValuesExported:false,passwordValuesExported:false,profileValuesExported:false,secretsExported:false}};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');console.log(JSON.stringify({decision:result.decision,counts:result.counts,plannedProfileFields:result.plannedProfileFields,safety:result.safety}));
