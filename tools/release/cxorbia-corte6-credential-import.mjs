import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const tenantId='tya';
const canonicalProjectId='cinepolis';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const envelopePath=process.env.CXORBIA_CREDENTIAL_ENVELOPE||'backend/private-inbox/corte6-credential-bundle.enc.json';
const requestPath=process.env.CXORBIA_CREDENTIAL_IMPORT_REQUEST||'backend/config/corte6-credential-import-request.json';
const dryRunPath='app/docs/evidence/CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json';
const publicPath='backend/secure/corte6-credential-handoff-public.json';
const privatePath='backend/secure/corte6-credential-handoff-private.enc.json';
const out=process.env.CXORBIA_CREDENTIAL_IMPORT_OUT||'app/docs/evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json';

function fail(msg){throw new Error(msg)}
for(const p of [credentialPath,envelopePath,requestPath,dryRunPath,publicPath,privatePath])if(!p||!fs.existsSync(p))fail(`required_file_missing:${p||'undefined'}`);
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const dryRun=JSON.parse(fs.readFileSync(dryRunPath,'utf8'));
if(request.schemaVersion!=='cxorbia.corte6.credential-import-request.v1')fail('request_contract_mismatch');
if(request.enabled!==true||request.status!=='authorized_waiting_execute'||request.authorizedBy!=='Paula'||!request.authorizationText)fail('request_not_authorized');
if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||request.firebaseProjectId!==expectedProject||request.tenantId!==tenantId||request.projectId!==canonicalProjectId)fail('request_identity_mismatch');
for(const k of ['firestoreWrites','rulesDeploys','hostingDeploys','storageWrites','hrWrites','legacyWrites'])if(request[k]!==0)fail(`unsafe_scope:${k}`);
if(request.production!==false||request.merge!==false||request.deletes!==0||request.passwordResets!==0)fail('unsafe_scope');
if(dryRun.schemaVersion!=='cxorbia.corte6.credential-handoff-dryrun.v2'||dryRun.decision!=='READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION')fail('dryrun_not_ready');
if(request.maxAuthImports!==dryRun.plannedAuthImportMax)fail('authorized_max_does_not_match_dryrun');

const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject||typeof sa.private_key!=='string')fail('wrong_or_invalid_service_account');
const pub=JSON.parse(fs.readFileSync(publicPath,'utf8'));
const encPriv=JSON.parse(fs.readFileSync(privatePath,'utf8'));
const env=JSON.parse(fs.readFileSync(envelopePath,'utf8'));
if(pub.projectId!==expectedProject||encPriv.projectId!==expectedProject||env.targetProjectId!==expectedProject)fail('target_mismatch');
if(pub.fingerprintSha256!==encPriv.fingerprintSha256||pub.fingerprintSha256!==env.keyFingerprintSha256||pub.fingerprintSha256!==dryRun.keyFingerprintSha256)fail('key_fingerprint_mismatch');

const salt=Buffer.from(encPriv.saltBase64,'base64'),ivPriv=Buffer.from(encPriv.ivBase64,'base64'),tag=Buffer.from(encPriv.tagBase64,'base64'),ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);decipher.setAuthTag(tag);
const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
const encrypted=Buffer.from(env.ciphertextBase64,'base64');
if(encrypted.length<17)fail('ciphertext_too_short');
const tagContent=encrypted.subarray(encrypted.length-16),ct=encrypted.subarray(0,encrypted.length-16);
const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));dec.setAAD(Buffer.from(env.aad,'utf8'));dec.setAuthTag(tagContent);
const decrypted=Buffer.concat([dec.update(ct),dec.final()]);
const bundleBytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(decrypted):decrypted;
const bundle=JSON.parse(bundleBytes.toString('utf8'));
if(!['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion)||bundle.targetProjectId!==expectedProject||bundle.tenantId!==tenantId||bundle.canonicalProjectId!==canonicalProjectId)fail('bundle_contract_mismatch');

if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:expectedProject});
const db=admin.firestore(),auth=admin.auth();
const shopperSnap=await db.collection('tenants').doc(tenantId).collection('shoppers').select('legacyShopperId').get();
const byLegacy=new Map();
for(const d of shopperSnap.docs){const v=d.data()?.legacyShopperId;if(typeof v==='string'&&v){if(!byLegacy.has(v))byLegacy.set(v,[]);byLegacy.get(v).push(d.id)}}
const existingUid=new Set(),existingEmail=new Set();let token,totalBefore=0;
do{const page=await auth.listUsers(1000,token);totalBefore+=page.users.length;for(const u of page.users){existingUid.add(u.uid);if(u.email)existingEmail.add(u.email.toLowerCase())}token=page.pageToken}while(token);
if(totalBefore!==dryRun.providerInventory.currentAuthUsers)fail(`provider_drift_auth_count:${totalBefore}!=${dryRun.providerInventory.currentAuthUsers}`);

const roleMap={superadmin:'super',super:'super',admin:'admin',coordinador:'coordinador',ops:'ops',cliente:'cliente',client:'cliente'};
const seen=new Set(),records=[],roleCounts={},namespaceCounts={},holds={bad_record:0,bad_hash:0,bad_namespace:0,duplicate_login_namespace:0,shopper_legacy_missing:0,shopper_legacy_ambiguous:0,unknown_user_role:0,auth_uid_collision:0,auth_email_collision:0};
for(const r of Array.isArray(bundle.records)?bundle.records:[]){
  if(!r||!['shopper','user'].includes(r.kind)||typeof r.normalizedLogin!=='string'||!r.normalizedLogin||r.normalizedLogin!==String(r.loginIdentifier||'').trim().toLowerCase()){holds.bad_record++;continue}
  if(!/^[a-f0-9]{64}$/.test(String(r.passwordHashHex||''))||r.passwordHashAlgorithm!=='SHA256'||r.passwordHashRounds!==1){holds.bad_hash++;continue}
  const namespace=String(r.authNamespace||(r.kind==='shopper'?'shopper':'staff')).trim().toLowerCase();
  if((r.kind==='shopper'&&namespace!=='shopper')||(r.kind==='user'&&namespace!=='staff')){holds.bad_namespace++;continue}
  const seenKey=`${namespace}\0${r.normalizedLogin}`;if(seen.has(seenKey)){holds.duplicate_login_namespace++;continue}seen.add(seenKey);
  const digest=crypto.createHash('sha256').update(`${tenantId}\0${namespace}\0${r.normalizedLogin}`,'utf8').digest('hex');
  const uid=`tya-${r.kind==='shopper'?'sh':'usr'}-${digest.slice(0,24)}`;
  const internalEmail=`${digest.slice(0,48)}@auth.cxorbia.invalid`;
  if(existingUid.has(uid)){holds.auth_uid_collision++;continue}
  if(existingEmail.has(internalEmail)){holds.auth_email_collision++;continue}
  let role,shopperId=null;
  if(r.kind==='shopper'){
    const matches=byLegacy.get(String(r.legacyId||''))||[];
    if(matches.length===0){holds.shopper_legacy_missing++;continue}
    if(matches.length!==1){holds.shopper_legacy_ambiguous++;continue}
    role='shopper';shopperId=matches[0];
  }else{
    role=roleMap[String(r.legacyRole||'').toLowerCase()]||null;
    if(!role){holds.unknown_user_role++;continue}
  }
  const customClaims={tenantId,role,projectId:canonicalProjectId,projectIds:[canonicalProjectId],authNamespace:namespace};
  if(shopperId)customClaims.shopperId=shopperId;
  records.push({uid,email:internalEmail,emailVerified:false,disabled:false,passwordHash:Buffer.from(r.passwordHashHex,'hex'),customClaims});
  roleCounts[role]=(roleCounts[role]||0)+1;namespaceCounts[namespace]=(namespaceCounts[namespace]||0)+1;
}

const sorted=o=>JSON.stringify(Object.fromEntries(Object.entries(o).sort()));
if(records.length!==dryRun.plannedAuthImportMax||records.length!==request.maxAuthImports)fail(`plan_count_mismatch:${records.length}`);
if(sorted(roleCounts)!==sorted(dryRun.targetRoleCounts))fail('role_count_mismatch');
if(sorted(namespaceCounts)!==sorted(dryRun.targetNamespaceCounts))fail('namespace_count_mismatch');
const expectedHolds=dryRun.dryRun.holds||{};
for(const [k,v] of Object.entries(holds))if(v!==(expectedHolds[k]||0))fail(`hold_drift:${k}:${v}!=${expectedHolds[k]||0}`);

// Final collision guard immediately before the destructive provider API. Firebase importUsers can replace a colliding UID,
// therefore ANY collision aborts before import.
if(holds.auth_uid_collision||holds.auth_email_collision)fail('collision_guard_failed');

const result=await auth.importUsers(records,{hash:{algorithm:'SHA256',rounds:1}});
const errorReasons={};for(const e of result.errors||[]){const reason=String(e.error?.code||e.error?.message||'unknown');errorReasons[reason]=(errorReasons[reason]||0)+1}
if(result.failureCount!==0||result.successCount!==records.length){
  const partial={schemaVersion:'cxorbia.corte6.credential-import.v1',generatedAt:new Date().toISOString(),projectId:expectedProject,decision:'HOLD_PARTIAL_AUTH_IMPORT',authorizedMax:request.maxAuthImports,attempted:records.length,successCount:result.successCount,failureCount:result.failureCount,errorReasons,safety:{firestoreDataWrites:0,rulesDeploys:0,hostingDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,loginIdentifiersExported:false,passwordHashesExported:false,secretsExported:false}};
  fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(partial,null,2)+'\n','utf8');
  fail('partial_auth_import');
}

let readback=0,roleReadback={},namespaceReadback={};
for(const rec of records){
  const u=await auth.getUser(rec.uid);
  if((u.email||'').toLowerCase()!==rec.email.toLowerCase())fail('readback_email_mismatch');
  const claims=u.customClaims||{};
  if(claims.tenantId!==tenantId||claims.role!==rec.customClaims.role||claims.authNamespace!==rec.customClaims.authNamespace||!Array.isArray(claims.projectIds)||!claims.projectIds.includes(canonicalProjectId))fail('readback_claim_mismatch');
  if(rec.customClaims.shopperId&&claims.shopperId!==rec.customClaims.shopperId)fail('readback_shopper_scope_mismatch');
  if(!(u.providerData||[]).some(p=>p.providerId==='password'))fail('readback_password_provider_missing');
  readback++;roleReadback[claims.role]=(roleReadback[claims.role]||0)+1;namespaceReadback[claims.authNamespace]=(namespaceReadback[claims.authNamespace]||0)+1;
}
let totalAfter=0;token=undefined;do{const page=await auth.listUsers(1000,token);totalAfter+=page.users.length;token=page.pageToken}while(token);
if(totalAfter!==totalBefore+records.length)fail(`auth_total_readback_mismatch:${totalAfter}`);

const evidence={schemaVersion:'cxorbia.corte6.credential-import.v1',generatedAt:new Date().toISOString(),projectId:expectedProject,tenantId,canonicalProjectId,decision:'PASS_EXACT_AUTH_IMPORT_READBACK',authorizationId:request.authorizationId,authorizedMax:request.maxAuthImports,imported:result.successCount,readback,authUsersBefore:totalBefore,authUsersAfter:totalAfter,targetRoleCounts:roleReadback,targetNamespaceCounts:namespaceReadback,hashContract:{algorithm:'SHA256',rounds:1},identifierContract:'visible profile + username/password -> deterministic namespaced internal Firebase email',collisionPolicy:'FAIL_CLOSED_NO_OVERWRITE',safety:{newAuthUsers:result.successCount,passwordResets:0,deletes:0,firestoreDataWrites:0,rulesDeploys:0,hostingDeploys:0,storageWrites:0,hrWrites:0,legacyWrites:0,production:false,merge:false,piiExported:false,loginIdentifiersExported:false,passwordHashesExported:false,secretsExported:false}};
fs.mkdirSync(new URL('../../app/docs/evidence/',import.meta.url),{recursive:true});fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n','utf8');
console.log(JSON.stringify({decision:evidence.decision,imported:evidence.imported,readback:evidence.readback,authUsersBefore:totalBefore,authUsersAfter:totalAfter,targetRoleCounts:roleReadback,targetNamespaceCounts:namespaceReadback}));
