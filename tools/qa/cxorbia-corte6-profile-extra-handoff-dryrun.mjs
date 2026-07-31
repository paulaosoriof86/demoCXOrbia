import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const canonicalProjectId=process.env.CXORBIA_PROJECT_ID||'cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_PROFILE_EXTRA_ENVELOPE||'backend/private-inbox/corte6-profile-extra-bundle.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_PROFILE_EXTRA_OUT||'app/docs/evidence/CORTE6-PROFILE-EXTRA-HANDOFF-READONLY-LATEST.json';

function fail(message){throw new Error(message);}
function has(value){return value!==undefined&&value!==null&&String(value).trim()!=='';}
function text(value){return has(value)?String(value).trim():'';}
function normalizeSimple(value){return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();}
function normalizeCountry(value){const v=normalizeSimple(value);if(['gt','guatemala'].includes(v))return'GT';if(['hn','honduras'].includes(v))return'HN';return v.toUpperCase();}
function normalizePhone(value){return text(value).replace(/[^0-9]/g,'');}
function normalizeEmail(value){return text(value).toLowerCase();}
function normalizeUsername(value){return text(value).toLowerCase();}
function normalizeArray(value){if(!Array.isArray(value))return text(value);return JSON.stringify(value.map(v=>normalizeSimple(typeof v==='object'?JSON.stringify(v):v)).sort());}
function normalizeBooleanish(value){if(value===true)return'true';if(value===false)return'false';const v=normalizeSimple(value);if(['1','si','sí','true','activo','active','aprobado','approved'].includes(v))return'true';if(['0','no','false','inactivo','inactive','rechazado','rejected'].includes(v))return'false';return v;}
function normalizeNumber(value){const n=Number(value);return Number.isFinite(n)?String(n):text(value);}
function pick(obj,keys){for(const key of keys)if(has(obj&&obj[key]))return obj[key];return'';}
function emptyCounts(keys){return Object.fromEntries(keys.map(key=>[key,0]));}
function sum(obj){return Object.values(obj||{}).reduce((total,value)=>total+Number(value||0),0);}

for(const path of [credentialPath,envelopePath,publicPath,privatePath])if(!path||!fs.existsSync(path))fail(`required_file_missing:${path||'undefined'}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject||env.tenantId!==tenantId)fail('target_mismatch');
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)fail('key_fingerprint_mismatch');
if(env.schemaVersion!=='cxorbia.corte6.profile-extra-handoff-envelope.v1')fail('envelope_contract_mismatch');
const expectedAad='cxorbia-c6-profile-extra-handoff-v1:'+pub.fingerprintSha256;
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
if(bundle.schemaVersion!=='cxorbia.corte6.profile-extra-handoff-bundle.v1'||bundle.targetProjectId!==expectedProject||bundle.tenantId!==tenantId||bundle.canonicalProjectId!==canonicalProjectId)fail('bundle_contract_mismatch');
if(bundle.contract?.stableMatch!=='legacyShopperId_only'||bundle.contract?.nameMatchAllowed!==false||bundle.contract?.phoneMatchAllowed!==false||bundle.contract?.emailMatchAllowed!==false||bundle.contract?.fillMissingOnly!==true||bundle.contract?.passwordExcluded!==true||bundle.contract?.legacyUidExcluded!==true)fail('unsafe_bundle_contract');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore();
const snap=await db.collection('tenants').doc(tenantId).collection('shoppers').select(
  'legacyShopperId','username','user','login','phone','whatsapp','wa','telefono','email','correo','country','pais','city','ciudad','department','departamento','depto','dpi','documentId','documento','idNumber','address','direccion','birthDate','fechaNacimiento','fecha_nac','certs','certifications','visitas','activo','estado','status','acceptedTerms','accepted_terms','accountApproval','aprobacionCuenta','registrationOrigin','registroOrigen','rating'
).get();
const byLegacy=new Map();
for(const d of snap.docs){const value=d.data()||{},legacy=text(value.legacyShopperId);if(!legacy)continue;if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push({id:d.id,data:value});}

const operational={
  username:{src:r=>r.username,dst:o=>pick(o,['username','user','login']),norm:normalizeUsername},
  phone:{src:r=>r.phone,dst:o=>pick(o,['phone','whatsapp','wa','telefono']),norm:normalizePhone},
  email:{src:r=>r.email,dst:o=>pick(o,['email','correo']),norm:normalizeEmail},
  country:{src:r=>r.country,dst:o=>pick(o,['country','pais']),norm:normalizeCountry},
  city:{src:r=>r.city,dst:o=>pick(o,['city','ciudad']),norm:normalizeSimple},
  department:{src:r=>r.department,dst:o=>pick(o,['department','departamento','depto']),norm:normalizeSimple}
};
const sensitive={
  document:{src:r=>r.document,dst:o=>pick(o,['dpi','documentId','documento','idNumber']),norm:normalizeSimple},
  address:{src:r=>r.address,dst:o=>pick(o,['address','direccion']),norm:normalizeSimple},
  birthDate:{src:r=>r.birthDate,dst:o=>pick(o,['birthDate','fechaNacimiento','fecha_nac']),norm:text}
};
const evidenceOnly={
  certifications:{src:r=>r.certifications,dst:o=>pick(o,['certs','certifications']),norm:normalizeArray},
  certificationHistoryCount:{src:r=>r.certificationHistoryCount,dst:()=>'',norm:normalizeNumber},
  visits:{src:r=>r.visits,dst:o=>pick(o,['visitas']),norm:normalizeNumber},
  active:{src:r=>r.active,dst:o=>pick(o,['activo','estado','status']),norm:normalizeBooleanish},
  acceptedTerms:{src:r=>r.acceptedTerms,dst:o=>pick(o,['acceptedTerms','accepted_terms']),norm:text},
  accountApproval:{src:r=>r.accountApproval,dst:o=>pick(o,['accountApproval','aprobacionCuenta']),norm:normalizeSimple},
  registrationOrigin:{src:r=>r.registrationOrigin,dst:o=>pick(o,['registrationOrigin','registroOrigen']),norm:normalizeSimple},
  rating:{src:r=>r.rating,dst:o=>pick(o,['rating']),norm:normalizeNumber}
};
const groups={operationalFillMissing:operational,sensitiveProtectedHold:sensitive,evidenceOnly};
const metrics={};
for(const [name,group] of Object.entries(groups))metrics[name]={sourcePresence:emptyCounts(Object.keys(group)),currentPresence:emptyCounts(Object.keys(group)),plannedFillMissing:emptyCounts(Object.keys(group)),alreadySame:emptyCounts(Object.keys(group)),conflicts:emptyCounts(Object.keys(group))};

let inputRecords=0,exact=0,missingCanonical=0,ambiguousCanonical=0,duplicateStableIds=0,keyIdMismatches=0,badRecord=0;
const seen=new Set();
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
  inputRecords++;
  if(!record||typeof record!=='object'||!text(record.legacyShopperId)){badRecord++;continue;}
  const stableId=text(record.legacyShopperId);
  if(seen.has(stableId)){duplicateStableIds++;continue;}seen.add(stableId);
  if(record.sourceKeyIdMismatch===true)keyIdMismatches++;
  const matches=byLegacy.get(stableId)||[];
  for(const [groupName,group] of Object.entries(groups))for(const [fieldName,contract] of Object.entries(group))if(has(contract.src(record))||(Array.isArray(contract.src(record))&&contract.src(record).length))metrics[groupName].sourcePresence[fieldName]++;
  if(matches.length===0){missingCanonical++;continue;}
  if(matches.length!==1){ambiguousCanonical++;continue;}
  exact++;
  const current=matches[0].data;
  for(const [groupName,group] of Object.entries(groups)){
    for(const [fieldName,contract] of Object.entries(group)){
      const src=contract.src(record),dst=contract.dst(current);
      if(has(dst)||(Array.isArray(dst)&&dst.length))metrics[groupName].currentPresence[fieldName]++;
      const srcPresent=Array.isArray(src)?src.length>0:has(src);
      if(!srcPresent)continue;
      if(!has(dst)&&!(Array.isArray(dst)&&dst.length)){metrics[groupName].plannedFillMissing[fieldName]++;continue;}
      if(contract.norm(src)===contract.norm(dst))metrics[groupName].alreadySame[fieldName]++;else metrics[groupName].conflicts[fieldName]++;
    }
  }
}

const identityBlockers=badRecord+duplicateStableIds+keyIdMismatches+ambiguousCanonical;
const totals={
  operationalPlannedFillMissing:sum(metrics.operationalFillMissing.plannedFillMissing),
  operationalConflictsHeld:sum(metrics.operationalFillMissing.conflicts),
  sensitiveFillMissingHeldPendingProtectedStoragePolicy:sum(metrics.sensitiveProtectedHold.plannedFillMissing),
  sensitiveConflictsHeld:sum(metrics.sensitiveProtectedHold.conflicts),
  evidenceOnlyPresent:sum(metrics.evidenceOnly.sourcePresence)
};
let decision='HOLD_NO_EXACT_PROFILE_EXTRA_MATCH';
if(exact>0)decision=identityBlockers?'HOLD_PROFILE_EXTRA_IDENTITY_CONFLICT_REVIEW':'READY_PROFILE_EXTRA_OPERATIONAL_DELTA_PLAN_WITH_HOLDS_NO_WRITE';

const result={
  schemaVersion:'cxorbia.corte6.profile-extra-handoff-readonly.v1',
  generatedAt:new Date().toISOString(),
  target:{projectId:expectedProject,tenantId,canonicalProjectId},
  encryptedSource:{records:inputRecords,keyFingerprintSha256:pub.fingerprintSha256,sourceContainer:bundle.sourceContainer||null,plaintextPersisted:false},
  matching:{stableKey:'legacyShopperId exact',nameMatchAllowed:false,phoneMatchAllowed:false,emailMatchAllowed:false,exact,missingCanonical,ambiguousCanonical,badRecord,duplicateStableIds,keyIdMismatches},
  fieldGroups:metrics,
  totals,
  decision,
  policy:{
    fillMissingOnly:true,
    overwriteExisting:false,
    operationalFields:Object.keys(operational),
    sensitiveFieldsHeld:Object.keys(sensitive),
    sensitiveReason:'current shoppers docs are operator-readable; high-sensitivity fields require protected storage/RBAC before any write',
    evidenceOnlyFields:Object.keys(evidenceOnly),
    certificationsCanonicalAuthority:'77 canonical certification records; no legacy history duplication',
    visitsCanonicalAuthority:'616 canonical visits; no legacy count overwrite',
    passwordExcluded:true,
    legacyUidExcluded:true
  },
  safety:{providerReads:true,providerWrites:0,firestoreWrites:0,authWrites:0,passwordChanges:0,rulesDeploys:0,hostingDeploys:0,cloudRunDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,profileValuesExported:false,passwordValuesExported:false,legacyUidValuesExported:false,secretsExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:result.decision,matching:result.matching,totals:result.totals,safety:result.safety}));
