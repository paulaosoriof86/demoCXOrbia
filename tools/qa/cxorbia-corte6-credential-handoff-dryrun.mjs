import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const canonicalProjectId='cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_CREDENTIAL_DRYRUN_OUT||'app/docs/evidence/CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json';
if(!credentialPath||!fs.existsSync(credentialPath))throw new Error('credential_missing');
if(!fs.existsSync(envelopePath))throw new Error('encrypted_bundle_missing');
for(const p of [publicPath,privatePath])if(!fs.existsSync(p))throw new Error(`key_material_missing:${p}`);
const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')throw new Error('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject)throw new Error('target_mismatch');
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256)throw new Error('key_fingerprint_mismatch');
if(!['cxorbia.corte6.credential-handoff-envelope.v1','cxorbia.corte6.credential-handoff-envelope.v2','cxorbia.corte6.credential-handoff-envelope.v3'].includes(env.schemaVersion))throw new Error('envelope_contract_mismatch');

const salt=Buffer.from(encPriv.saltBase64,'base64'),ivPriv=Buffer.from(encPriv.ivBase64,'base64'),tag=Buffer.from(encPriv.tagBase64,'base64'),ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);decipher.setAuthTag(tag);
const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
const encrypted=Buffer.from(env.ciphertextBase64,'base64');
if(encrypted.length<17)throw new Error('ciphertext_too_short');
const tagContent=encrypted.subarray(encrypted.length-16),ct=encrypted.subarray(0,encrypted.length-16);
const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));dec.setAAD(Buffer.from(env.aad,'utf8'));dec.setAuthTag(tagContent);
const decrypted=Buffer.concat([dec.update(ct),dec.final()]);
const bundleBytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(decrypted):decrypted;
const bundle=JSON.parse(bundleBytes.toString('utf8'));
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion)||bundle.targetProjectId!==expectedProject||bundle.tenantId!==tenantId||bundle.canonicalProjectId!==canonicalProjectId)throw new Error('bundle_contract_mismatch');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore(),auth=admin.auth();
const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').select('legacyShopperId').get();
const byLegacy=new Map();
for(const d of shopperSnap.docs){const v=d.data()?.legacyShopperId;if(typeof v==='string'&&v){if(!byLegacy.has(v))byLegacy.set(v,[]);byLegacy.get(v).push(d.id)}}
const existingUid=new Set(),existingEmail=new Set();let token,totalAuth=0;
do{const page=await auth.listUsers(1000,token);totalAuth+=page.users.length;for(const u of page.users){existingUid.add(u.uid);if(u.email)existingEmail.add(u.email.toLowerCase())}token=page.pageToken}while(token);

const roleMap={superadmin:'super',super:'super',admin:'admin',coordinador:'coordinador',ops:'ops',cliente:'cliente',client:'cliente'};
const counters={inputRecords:0,eligible:0,shopperEligible:0,userEligible:0,shopperExactLegacyMatch:0,holds:{bad_record:0,bad_hash:0,bad_namespace:0,duplicate_login_namespace:0,shopper_legacy_missing:0,shopper_legacy_ambiguous:0,unknown_user_role:0,auth_uid_collision:0,auth_email_collision:0}};
const seenLoginNamespace=new Set();const roleTargets={};const namespaceTargets={};
const plan=[];
for(const r of Array.isArray(bundle.records)?bundle.records:[]){
  counters.inputRecords++;
  if(!r||!['shopper','user'].includes(r.kind)||typeof r.normalizedLogin!=='string'||!r.normalizedLogin||r.normalizedLogin!==String(r.loginIdentifier||'').trim().toLowerCase()){counters.holds.bad_record++;continue}
  if(!/^[a-f0-9]{64}$/.test(String(r.passwordHashHex||''))||r.passwordHashAlgorithm!=='SHA256'||r.passwordHashRounds!==1){counters.holds.bad_hash++;continue}
  const namespace=String(r.authNamespace||(r.kind==='shopper'?'shopper':'staff')).trim().toLowerCase();
  if((r.kind==='shopper'&&namespace!=='shopper')||(r.kind==='user'&&namespace!=='staff')){counters.holds.bad_namespace++;continue}
  const seenKey=`${namespace}\0${r.normalizedLogin}`;
  if(seenLoginNamespace.has(seenKey)){counters.holds.duplicate_login_namespace++;continue}
  seenLoginNamespace.add(seenKey);
  const digest=crypto.createHash('sha256').update(`${tenantId}\0${namespace}\0${r.normalizedLogin}`,'utf8').digest('hex');
  const uid=`tya-${r.kind==='shopper'?'sh':'usr'}-${digest.slice(0,24)}`;
  const internalEmail=`${digest.slice(0,48)}@auth.cxorbia.invalid`;
  if(existingUid.has(uid)){counters.holds.auth_uid_collision++;continue}
  if(existingEmail.has(internalEmail)){counters.holds.auth_email_collision++;continue}
  let role,shopperId=null;
  if(r.kind==='shopper'){
    const matches=byLegacy.get(String(r.legacyId||''))||[];
    if(matches.length===0){counters.holds.shopper_legacy_missing++;continue}
    if(matches.length!==1){counters.holds.shopper_legacy_ambiguous++;continue}
    role='shopper';shopperId=matches[0];counters.shopperExactLegacyMatch++;
  }else{
    role=roleMap[String(r.legacyRole||'').toLowerCase()]||null;
    if(!role){counters.holds.unknown_user_role++;continue}
  }
  const claims={tenantId,role,projectId:canonicalProjectId,projectIds:[canonicalProjectId],authNamespace:namespace};
  if(shopperId)claims.shopperId=shopperId;
  plan.push({uid,internalEmail,passwordHashHex:r.passwordHashHex,claims,kind:r.kind,authNamespace:namespace});
  counters.eligible++;if(r.kind==='shopper')counters.shopperEligible++;else counters.userEligible++;
  roleTargets[role]=(roleTargets[role]||0)+1;namespaceTargets[namespace]=(namespaceTargets[namespace]||0)+1;
}
const summary={schemaVersion:'cxorbia.corte6.credential-handoff-dryrun.v2',generatedAt:new Date().toISOString(),projectId:expectedProject,tenantId,canonicalProjectId,keyFingerprintSha256:pub.fingerprintSha256,decision:counters.eligible>0?'READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION':'HOLD_NO_ELIGIBLE_CREDENTIALS',legacySourceSummary:{shoppers:bundle.records.filter(r=>r.kind==='shopper').length,users:bundle.records.filter(r=>r.kind==='user').length,localHolds:bundle.holds||{}},providerInventory:{currentAuthUsers:totalAuth,canonicalShopperDocs:shopperSnap.size,canonicalProfilesWithLegacyShopperId:byLegacy.size},dryRun:counters,targetRoleCounts:roleTargets,targetNamespaceCounts:namespaceTargets,plannedAuthImportMax:counters.eligible,collisionPolicy:'FAIL_CLOSED_NO_OVERWRITE',identifierContract:'visible profile + username/password -> deterministic namespaced internal Firebase email',namespaceContract:'staff|shopper',hashContract:{algorithm:'SHA256',rounds:1},authorizationRequiredBeforeWrite:true,safety:{providerWrites:0,authWrites:0,firestoreWrites:0,rulesDeploys:0,hostingDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,loginIdentifiersExported:false,passwordHashesExported:false,secretsExported:false}};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});
fs.writeFileSync(out,JSON.stringify(summary,null,2)+'\n','utf8');
// Never persist `plan`; it exists only in memory for dry-run validation.
console.log(JSON.stringify({decision:summary.decision,plannedAuthImportMax:summary.plannedAuthImportMax,shopperExactLegacyMatch:counters.shopperExactLegacyMatch,holds:counters.holds,targetRoleCounts:roleTargets,targetNamespaceCounts:namespaceTargets,providerWrites:0,piiExported:false,passwordHashesExported:false}));
