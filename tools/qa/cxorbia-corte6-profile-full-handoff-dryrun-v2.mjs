import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const canonicalProjectId=process.env.CXORBIA_PROJECT_ID||'cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_PROFILE_FULL_ENVELOPE||'backend/private-inbox/corte6-profile-full-bundle-v2.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_PROFILE_FULL_OUT||'app/docs/evidence/CORTE6-PROFILE-FULL-HANDOFF-READONLY-LATEST.json';

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
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').get();
const byLegacy=new Map();
for(const d of snap.docs){const v=d.data()||{},legacy=text(v.legacyShopperId);if(!legacy)continue;if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push({id:d.id,data:v});}

const fieldContracts={
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
const counts={sourcePresent:{},alreadySame:{},plannedSetOrRefresh:{},currentPresent:{}};
for(const k of Object.keys(fieldContracts))for(const bucket of Object.values(counts))bucket[k]=0;
let input=0,exact=0,missingCanonical=0,ambiguousCanonical=0,badRecord=0,sourceConflictGroups=0,sourceConflictFields=0,docsWithPlannedChanges=0,passwordPresent=0,sensitivePresent=0;
for(const rec of Array.isArray(bundle.records)?bundle.records:[]){
  input++;
  if(!rec||typeof rec!=='object'||!text(rec.legacyShopperId)||!rec.profile||typeof rec.profile!=='object'){badRecord++;continue;}
  const id=text(rec.legacyShopperId),matches=byLegacy.get(id)||[],profile=safe(rec.profile);
  const conflictKeys=Object.keys(safe(rec.conflicts));if(conflictKeys.length){sourceConflictGroups++;sourceConflictFields+=conflictKeys.length;}
  if(has(pick(profile,['pass','password'])))passwordPresent++;
  if(has(pick(profile,['dpi','documentId','documento','idNumber']))||has(pick(profile,['direccion','address']))||has(pick(profile,['fecha_nac','fechaNacimiento','birthDate'])))sensitivePresent++;
  for(const [name,c] of Object.entries(fieldContracts))if(has(c.src(profile)))counts.sourcePresent[name]++;
  if(matches.length===0){missingCanonical++;continue;}if(matches.length!==1){ambiguousCanonical++;continue;}exact++;
  const current=matches[0].data;let changed=false;
  for(const [name,c] of Object.entries(fieldContracts)){
    const src=c.src(profile),dst=c.dst(current);if(has(dst))counts.currentPresent[name]++;if(!has(src))continue;
    if(has(dst)&&equal(name,src,dst))counts.alreadySame[name]++;else{counts.plannedSetOrRefresh[name]++;changed=true;}
  }
  if(!current.legacyProfileCurrent)changed=true;
  if(changed)docsWithPlannedChanges++;
}
const identityBlockers=badRecord+ambiguousCanonical;
let decision='HOLD_NO_EXACT_PROFILE_MATCH';
if(exact>0)decision=identityBlockers?'HOLD_PROFILE_FULL_IDENTITY_REVIEW':'READY_PROFILE_FULL_WRITE_PLAN_EXACT_MATCH_WITH_SEPARATE_FIRESTORE_AUTHORIZATION';
const result={
  schemaVersion:'cxorbia.corte6.profile-full-handoff-readonly.v2',generatedAt:new Date().toISOString(),target:{projectId:expectedProject,tenantId,canonicalProjectId},
  encryptedSource:{records:input,keyFingerprintSha256:pub.fingerprintSha256,sourceContainer:bundle.sourceContainer||null,plaintextPersisted:false,passwordIncludedEncrypted:true,piiIncludedEncrypted:true},
  matching:{stableKey:'legacyShopperId exact',nameMatchAllowed:false,phoneMatchAllowed:false,emailMatchAllowed:false,exact,missingCanonical,ambiguousCanonical,badRecord},
  sourceMerge:{conflictGroups:sourceConflictGroups,conflictFields:sourceConflictFields,duplicatePolicy:bundle.contract?.duplicatePolicy||null},
  profileCounts:counts,
  totals:{docsWithPlannedChanges,fieldWritesPlanned:sum(counts.plannedSetOrRefresh),passwordProfilesPresent:passwordPresent,sensitiveProfilesPresent:sensitivePresent},
  decision,
  policy:{profileSourceOfTruth:'current legacy export for profile fields',sourceWinsOnProfileFieldDifference:true,canonicalHistoryPreserved:true,legacyProfileCurrentStored:true,legacyHistoryFieldsNotOverwritingCanonical:['certs','histCerts','visitas','activo','rating'],passwordStoredInProtectedShopperProfileForCurrentOperationalParity:true,passwordNeverWrittenToRepoLogsOrEvidence:true,sensitiveFieldsAllowedForOperatorReadPerCurrentUserAuthorization:true},
  safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,rulesDeploys:0,hostingDeploys:0,cloudRunDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,passwordValuesExported:false,profileValuesExported:false,secretsExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');console.log(JSON.stringify({decision:result.decision,matching:result.matching,totals:result.totals,sourceMerge:result.sourceMerge,safety:result.safety}));
