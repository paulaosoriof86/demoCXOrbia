import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId=process.env.CXORBIA_TENANT_ID||'tya';
const canonicalProjectId=process.env.CXORBIA_PROJECT_ID||'cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_PROFILE_FULL_ENVELOPE||'.tmp/c6-profile-full-write/corte6-profile-full-bundle-v2.enc.json';
const requestPath=process.env.CXORBIA_PROFILE_FULL_WRITE_REQUEST||'backend/config/corte6-profile-full-firestore-write-request-v2.json';
const planPath=process.env.CXORBIA_PROFILE_FULL_WRITE_PLAN||'backend/config/corte6-profile-full-firestore-write-plan-v2.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_PROFILE_FULL_WRITE_OUT||'app/docs/evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json';

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

for(const p of [credentialPath,envelopePath,requestPath,planPath,publicPath,privatePath])if(!p||!fs.existsSync(p))fail(`required_file_missing:${p||'undefined'}`);
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
if(request.schemaVersion!=='cxorbia.corte6.profile-full-firestore-write-request.v2')fail('bad_request_schema');
if(plan.schemaVersion!=='cxorbia.corte6.profile-full-firestore-write-plan.v2')fail('bad_plan_schema');
if(request.firebaseProjectId!==expectedProject||request.tenantId!==tenantId||request.projectId!==canonicalProjectId)fail('request_target_mismatch');
if(plan.firebaseProjectId!==expectedProject||plan.tenantId!==tenantId||plan.projectId!==canonicalProjectId)fail('plan_target_mismatch');
if(request.enabled!==true||request.authorized!==true||request.consumed!==false||request.status!=='authorized_pending_execution')fail('request_not_authorized');
if(request.providerWritesAuthorized!==true||request.firestoreWritesAuthorized!==true||!text(request.authorizationId))fail('explicit_authorization_missing');
if(Number(request.maxFirestoreDocumentWrites)!==120||Number(request.expectedDocsWithChanges)!==120||Number(request.expectedProfileFieldValues)!==329||Number(request.expectedMissingCanonicalHold)!==31)fail('request_expected_counts_mismatch');
if(plan.enabled!==true||plan.authorized!==true||plan.consumed!==false||plan.status!=='authorized_pending_execution')fail('plan_not_authorized');
if(Number(plan.firestoreDocumentWritesMax)!==120||Number(plan.documentsWithPlannedChanges)!==120||Number(plan.profileFieldWritesPlanned)!==329||Number(plan.missingCanonicalHold)!==31)fail('plan_expected_counts_mismatch');
for(const k of ['authWrites','firebaseAuthPasswordChanges','rulesDeploys','hostingDeploys','cloudRunDeploys','storageWrites','hrWrites','legacyWrites','makeWrites','geminiCalls','paymentsWrites'])if(Number(request[k]||0)!==0)fail('unsafe_request_scope:'+k);
if(request.production!==false||request.merge!==false||plan.safety?.production!==false||plan.safety?.merge!==false)fail('production_or_merge_not_allowed');

const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject||env.tenantId!==tenantId)fail('encrypted_target_mismatch');
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
const shoppers=db.collection('tenants').doc(tenantId).collection('shoppers');
const snap=await shoppers.get();
const byLegacy=new Map();
for(const d of snap.docs){const v=d.data()||{},legacy=text(v.legacyShopperId);if(!legacy)continue;if(!byLegacy.has(legacy))byLegacy.set(legacy,[]);byLegacy.get(legacy).push({id:d.id,ref:d.ref,data:v});}

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
const expectedByField={name:0,username:113,password:118,phone:0,email:0,country:0,city:0,department:2,document:17,address:1,birthDate:2,acceptedTerms:72,accountApproval:2,registrationOrigin:2};
const plannedByField=Object.fromEntries(Object.keys(fields).map(k=>[k,0]));
const updates=[];
let input=0,exact=0,missing=0,ambiguous=0,bad=0;
for(const rec of Array.isArray(bundle.records)?bundle.records:[]){
  input++;
  if(!rec||typeof rec!=='object'||!text(rec.legacyShopperId)||!rec.profile||typeof rec.profile!=='object'){bad++;continue;}
  const id=text(rec.legacyShopperId),matches=byLegacy.get(id)||[],profile=safe(rec.profile);
  if(matches.length===0){missing++;continue;}
  if(matches.length!==1){ambiguous++;continue;}
  exact++;
  const current=matches[0].data,patch={};let sourceChanges=0;
  for(const [name,c] of Object.entries(fields)){
    const src=c.src(profile),dst=c.dst(current);
    if(!has(src)||equal(name,src,dst))continue;
    patch[c.writeKey]=src;
    plannedByField[name]++;
    sourceChanges++;
  }
  if(sourceChanges>0){
    patch.legacyProfileCurrent=true;
    patch.legacyProfileSource='tya-plataforma-export-20260730';
    patch.legacyProfileCurrentAt=admin.firestore.FieldValue.serverTimestamp();
    updates.push({legacyShopperId:id,ref:matches[0].ref,patch,sourceChanges,profile});
  }
}
if(input!==151||exact!==120||missing!==31||ambiguous!==0||bad!==0)fail(`identity_counts_drift:${JSON.stringify({input,exact,missing,ambiguous,bad})}`);
for(const [k,v] of Object.entries(expectedByField))if(Number(plannedByField[k]||0)!==v)fail(`field_plan_drift:${k}:${plannedByField[k]}!=${v}`);
const fieldChanges=sum(plannedByField);
if(updates.length!==120||fieldChanges!==329)fail(`write_plan_drift:${updates.length}:${fieldChanges}`);
if(updates.length>Number(request.maxFirestoreDocumentWrites))fail('write_limit_exceeded');

const batch=db.batch();
for(const u of updates)batch.update(u.ref,u.patch);
await batch.commit();

let readbackDocs=0,readbackFields=0,mismatches=0;
for(const u of updates){
  const d=await u.ref.get();
  if(!d.exists){mismatches++;continue;}
  readbackDocs++;
  const current=d.data()||{};
  for(const [name,c] of Object.entries(fields)){
    const src=c.src(u.profile);
    if(!has(src))continue;
    const wasPlanned=Object.prototype.hasOwnProperty.call(u.patch,c.writeKey);
    if(!wasPlanned)continue;
    readbackFields++;
    const got=c.dst(current);
    if(!equal(name,src,got))mismatches++;
  }
  if(current.legacyProfileCurrent!==true||current.legacyProfileSource!=='tya-plataforma-export-20260730')mismatches++;
}

const decision=mismatches===0?'PASS_C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK':'FAIL_C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK_MISMATCH';
const result={
  schemaVersion:'cxorbia.corte6.profile-full-firestore-write-evidence.v2',
  generatedAt:new Date().toISOString(),
  authorizationId:request.authorizationId,
  target:{projectId:expectedProject,tenantId,canonicalProjectId},
  source:{encrypted:true,plaintextPersisted:false,keyFingerprintSha256:pub.fingerprintSha256,records:input},
  identity:{exact,missingCanonicalHold:missing,ambiguousCanonical:ambiguous,badRecord:bad},
  executed:{firestoreDocumentWrites:updates.length,profileFieldValuesWritten:fieldChanges,readbackDocs,readbackFields,mismatches},
  fieldCounts:plannedByField,
  decision,
  safety:{authWrites:0,firebaseAuthPasswordChanges:0,rulesDeploys:0,hostingDeploys:0,cloudRunDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,production:false,merge:false,piiExported:false,passwordValuesExported:false,profileValuesExported:false,secretsExported:false}
};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({decision,identity:result.identity,executed:result.executed,safety:result.safety}));
if(mismatches!==0)fail('readback_mismatch_after_provider_write');
