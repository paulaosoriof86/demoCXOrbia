#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import {
  TENANT_ID,
  CANONICAL_PROJECT_ID,
  EXPECTED_FIREBASE_PROJECT,
  text,
  norm,
  sha256,
  fingerprint,
  internalEmail,
  decryptCredentialBundle,
  fetchFirebaseWebConfig,
  passwordSignInEmail
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import {
  resolveEquivalentNames,
  stableAuthCandidateFingerprint
} from './cxorbia-c6-shopper-equivalent-universe.mjs';

const TARGET_PROFILE_FP='ac93d90d9e41512acdcd';
const TARGET_LOGIN_FP='bd8d7019d612b4421366';
const COLLISION_PEER_FP='a8dd7db89a02ff180674';
const TECH_KEYS=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'];
const root=process.cwd();
const requestPath=process.argv[2]||'backend/config/c6-auth-principal-uniqueness-rootfix-activation-dev-request-v1.json';
const exportDir=path.resolve(process.env.CXORBIA_AUTH_ACTIVATION_V2_EXPORT_DIR||path.join(root,'.tmp/c6-auth-activation-dev-v2-export'));
const privateDir=path.resolve(process.env.CXORBIA_AUTH_ACTIVATION_V2_PRIVATE_DIR||path.join(root,'.tmp/c6-auth-activation-dev-v2-private'));
const serviceAccountPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');

const uniq=values=>[...new Set(values.filter(Boolean))];
const add=(map,key,value)=>{const k=text(key);if(!k)return;if(!map.has(k))map.set(k,[]);map.get(k).push(value);};
const fp=(kind,value)=>fingerprint(`${kind}\0${value}`);
const stablePlanProfileFingerprint=profileId=>fp('deterministic-suffix-plan-profile',profileId);
const stableBaseLoginFingerprint=login=>fp('base-login',login);
const stableTargetLoginFingerprint=login=>fp('target-login',login);
const list=value=>Array.isArray(value)?value.map(text).filter(Boolean):[];
const canonicalClaims=(shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID)=>({tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId});
const exactClaims=(claims,shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID)=>claims?.tenantId===tenantId&&claims?.role==='shopper'&&claims?.authNamespace==='shopper'&&claims?.shopperId===shopperId&&Array.isArray(claims?.projectIds)&&claims.projectIds.length===1&&claims.projectIds[0]===projectId;
const effectiveShopperScope=(claims,shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID)=>{
  const tenantAllowed=text(claims?.tenantId)===tenantId||list(claims?.tenants).includes(tenantId)||list(claims?.tenantIds).includes(tenantId);
  const projectAssigned=text(claims?.projectId)===projectId||list(claims?.projectIds).includes(projectId);
  const roleShopper=norm(claims?.role)==='shopper'||list(claims?.roles).map(norm).includes('shopper');
  return tenantAllowed&&projectAssigned&&roleShopper&&text(claims?.shopperId)===shopperId;
};
const safeError=error=>String(error?.message||error).replace(/[^A-Za-z0-9_.:,/+-]+/g,'_').slice(0,500);
const asBuffer=value=>{
  if(value==null)return null;
  if(Buffer.isBuffer(value))return Buffer.from(value);
  if(value?.type==='Buffer'&&Array.isArray(value.data))return Buffer.from(value.data);
  if(ArrayBuffer.isView(value))return Buffer.from(value.buffer,value.byteOffset,value.byteLength);
  if(typeof value==='string'){
    const s=value.trim();if(!s)return Buffer.alloc(0);
    if(/^[0-9a-f]{64}$/i.test(s))return Buffer.from(s,'hex');
    try{const b=Buffer.from(s,'base64');if(b.length)return b;}catch{}
    return Buffer.from(s,'utf8');
  }
  return null;
};
const asBase64=value=>{const b=asBuffer(value);return b?b.toString('base64'):'';};

function recursiveObjects(value,basis,out=[],depth=0){
  if(depth>7||value==null)return out;
  if(Array.isArray(value)){for(const item of value)recursiveObjects(item,basis,out,depth+1);return out;}
  if(typeof value!=='object')return out;
  const keys=Object.keys(value);
  if(keys.some(key=>TECH_KEYS.includes(key)))out.push({value,basis});
  for(const item of Object.values(value))if(item&&typeof item==='object')recursiveObjects(item,basis,out,depth+1);
  return out;
}
function propagateTechKeys(index,source,shopperId){const value=source?.value??source;for(const key of TECH_KEYS){const raw=value?.[key];for(const item of Array.isArray(raw)?raw:[raw])add(index,text(item),shopperId);}}
async function listAllUsers(auth){const out=[];let pageToken;do{const page=await auth.listUsers(1000,pageToken);out.push(...page.users);pageToken=page.pageToken;}while(pageToken);return out;}
function deterministicSuffix(tenantId,shopperId,length){return sha256(`${tenantId}\0${shopperId}`).slice(0,length);}
function resolveTargetLogin(planRow,names,profileId,tenantId){
  if(!planRow.targetLoginFp)return '';
  if(!names?.baseLogin)throw new Error(`TARGET_LOGIN_BASE_MISSING:${planRow.profileFp}`);
  if(planRow.baseLoginFp!==stableBaseLoginFingerprint(names.baseLogin))throw new Error(`BASE_LOGIN_FP_DRIFT:${planRow.profileFp}`);
  const candidates=[names.baseLogin,...[4,6,8].map(length=>`${names.baseLogin}.${deterministicSuffix(tenantId,profileId,length)}`)];
  const matches=candidates.filter(login=>stableTargetLoginFingerprint(login)===planRow.targetLoginFp);
  if(matches.length!==1)throw new Error(`TARGET_LOGIN_FP_NOT_UNIQUE:${planRow.profileFp}:${matches.length}`);
  return matches[0];
}
function rowsDigest(rows){return sha256(JSON.stringify(rows));}
function encryptEnvelope(payload,serviceAccountPrivateKey,context){
  const salt=crypto.randomBytes(32),iv=crypto.randomBytes(12);
  const key=crypto.hkdfSync('sha256',Buffer.from(serviceAccountPrivateKey,'utf8'),salt,Buffer.from(context,'utf8'),32);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const aad=Buffer.from(`cxorbia-auth-activation-dev-v2|${context}`,'utf8');cipher.setAAD(aad);
  const plaintext=Buffer.from(JSON.stringify(payload),'utf8');const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);const tag=cipher.getAuthTag();
  return {schemaVersion:'cxorbia.encrypted-envelope.v1',algorithm:'AES-256-GCM',kdf:'HKDF-SHA256',context,aad:aad.toString('base64'),saltBase64:salt.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:tag.toString('base64'),ciphertextBase64:ciphertext.toString('base64'),plaintextSha256:sha256(plaintext)};
}
function decryptEnvelope(envelope,serviceAccountPrivateKey){
  const salt=Buffer.from(envelope.saltBase64,'base64'),iv=Buffer.from(envelope.ivBase64,'base64');
  const key=crypto.hkdfSync('sha256',Buffer.from(serviceAccountPrivateKey,'utf8'),salt,Buffer.from(envelope.context,'utf8'),32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);decipher.setAAD(Buffer.from(envelope.aad,'base64'));decipher.setAuthTag(Buffer.from(envelope.tagBase64,'base64'));
  const plaintext=Buffer.concat([decipher.update(Buffer.from(envelope.ciphertextBase64,'base64')),decipher.final()]);if(sha256(plaintext)!==envelope.plaintextSha256)throw new Error('ENVELOPE_DIGEST');return JSON.parse(plaintext.toString('utf8'));
}
async function fetchHashConfig(credential,projectId){
  const token=await credential.getAccessToken();const accessToken=token?.access_token||token?.accessToken;if(!accessToken)throw new Error('HASH_CONFIG_ACCESS_TOKEN_MISSING');
  const response=await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config?mask=hashConfig`,{headers:{authorization:`Bearer ${accessToken}`,'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`HASH_CONFIG_HTTP_${response.status}`);const body=await response.json();const hashConfig=body?.hashConfig||body?.hash_config;if(!hashConfig||typeof hashConfig!=='object'||!Object.keys(hashConfig).length)throw new Error('HASH_CONFIG_EMPTY');return hashConfig;
}
function snapshotUser(user){return {uid:user.uid,email:user.email||null,emailVerified:Boolean(user.emailVerified),disabled:Boolean(user.disabled),customClaims:user.customClaims||null,providerData:(user.providerData||[]).map(p=>({providerId:p.providerId||null,uid:p.uid||null,email:p.email||null,displayName:p.displayName||null,photoURL:p.photoURL||null,phoneNumber:p.phoneNumber||null})),passwordHash:asBase64(user.passwordHash),passwordSalt:asBase64(user.passwordSalt)};}
function userProviderHasPassword(user){return (user.providerData||[]).some(p=>p.providerId==='password')||Boolean(user.email);}

function collectHashBuffers(value,keyPath='',out=[],depth=0){
  if(depth>6||value==null)return out;
  if(Array.isArray(value)){for(const item of value)collectHashBuffers(item,keyPath,out,depth+1);return out;}
  if(typeof value==='object'&&!Buffer.isBuffer(value)){
    for(const [k,v] of Object.entries(value))collectHashBuffers(v,keyPath?`${keyPath}.${k}`:k,out,depth+1);
    return out;
  }
  const key=keyPath.toLowerCase();
  if(!key.includes('hash')||(!key.includes('password')&&!key.includes('passwd')&&!key.includes('pwd')))return out;
  const b=asBuffer(value);if(b&&b.length===32)out.push(b);return out;
}
function legacyHashMatchCount(user,records){
  const current=asBuffer(user.passwordHash);if(!current||current.length===0)return 0;
  const unique=new Map();for(const record of records||[])for(const b of collectHashBuffers(record)){unique.set(b.toString('hex'),b);}
  let matches=0;for(const b of unique.values())if(b.length===current.length&&crypto.timingSafeEqual(b,current))matches++;return matches;
}
function providerHashAlgorithmClass(hashConfig){return text(hashConfig?.algorithm||hashConfig?.hashAlgorithm||hashConfig?.hash_algorithm||'UNKNOWN').toUpperCase()||'UNKNOWN';}
function classifyPasswordRollback(user,records,hashConfig){
  const hash=asBuffer(user.passwordHash);if(!hash||hash.length===0)throw new Error('PASSWORD_HASH_UNAVAILABLE');
  const salt=asBuffer(user.passwordSalt);const nonEmptySalt=Boolean(salt&&salt.length>0);
  if(nonEmptySalt){
    if(!hashConfig||!Object.keys(hashConfig).length)throw new Error('PROVIDER_HASH_CONFIG_REQUIRED');
    return {mode:'PROVIDER_HASH_CONFIG_EXACT',saltState:'NONEMPTY_EXPOSED',legacyHashMatches:0,providerHashAlgorithmClass:providerHashAlgorithmClass(hashConfig)};
  }
  const matches=legacyHashMatchCount(user,records);
  if(matches!==1)throw new Error(`SALTLESS_LEGACY_HASH_MATCH_COUNT_${matches}`);
  return {mode:'LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT',saltState:'EMPTY_OR_NULL_LEGITIMATE_LEGACY_SHA256',legacyHashMatches:1,providerHashAlgorithmClass:'SHA256'};
}
function assertPrincipalOwner(ownerByUid,ownerByCandidate,user,profileFp,reason){
  if(!user)return;
  const priorUid=ownerByUid.get(user.uid);if(priorUid&&priorUid!==profileFp)throw new Error(`GLOBAL_PRINCIPAL_UID_ALIAS:${reason}:${profileFp}:${priorUid}`);ownerByUid.set(user.uid,profileFp);
  const cfp=stableAuthCandidateFingerprint(user.uid);const priorCfp=ownerByCandidate.get(cfp);if(priorCfp&&priorCfp!==profileFp)throw new Error(`GLOBAL_PRINCIPAL_CANDIDATE_ALIAS:${reason}:${profileFp}:${priorCfp}`);ownerByCandidate.set(cfp,profileFp);
}
function gatherCandidatesTargetSpecific(profileId,credentials,targetLogin,authByShopperId,authByEmail){
  const candidates=[...(authByShopperId.get(profileId)||[])];
  for(const record of credentials||[]){const login=norm(record.normalizedLogin||record.loginIdentifier);if(login)candidates.push(...(authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]));}
  if(targetLogin)candidates.push(...(authByEmail.get(norm(internalEmail(targetLogin,'shopper',TENANT_ID)))||[]));
  const seen=new Set();return candidates.filter(user=>!seen.has(user.uid)&&seen.add(user.uid));
}
function validatePlanShape(plan,contract){
  if(plan.schemaVersion!=='cxorbia.c6.shopper-auth-final-plan.v3')throw new Error('FINAL_PLAN_SCHEMA');
  if(!Array.isArray(plan.rows)||plan.rows.length!==340||new Set(plan.rows.map(r=>r.profileFp)).size!==340)throw new Error('FINAL_PLAN_340_UNIQUE');
  if(rowsDigest(plan.rows)!==contract.finalPlan.rowsDigestSha256||plan.plan?.sourceSafeRowsDigestSha256!==contract.finalPlan.rowsDigestSha256)throw new Error('FINAL_PLAN_DIGEST');
  const counts={CREATE_AUTH:0,UPDATE_AUTH:0,NO_OP:0,HOLD:0,PRESERVE_NO_AUTH:0},sub={email:0,password:0,claims:0};
  for(const row of plan.rows){if(!Object.hasOwn(counts,row.primary))throw new Error('PRIMARY');counts[row.primary]++;for(const k of Object.keys(sub))if(row.changes?.[k]===true)sub[k]++;}
  if(JSON.stringify(counts)!==JSON.stringify(contract.finalPlan.operationCounts)||JSON.stringify(sub)!==JSON.stringify(contract.finalPlan.subchangeCounts))throw new Error('PLAN_COUNTS');
  if(counts.HOLD!==0)throw new Error('HOLD_NONZERO');
  const target=plan.rows.find(r=>r.profileFp===TARGET_PROFILE_FP),peer=plan.rows.find(r=>r.profileFp===COLLISION_PEER_FP);
  if(target?.primary!=='CREATE_AUTH'||target?.targetLoginFp!==TARGET_LOGIN_FP||Object.values(target?.changes||{}).some(Boolean))throw new Error('TARGET_ROOTFIX_NOT_MATERIALIZED');
  if(peer?.primary!=='UPDATE_AUTH')throw new Error('PEER_NOT_PRESERVED');
  return {counts,sub};
}

function selfTest(){
  const ownersUid=new Map(),ownersCfp=new Map();const u={uid:'u1'};assertPrincipalOwner(ownersUid,ownersCfp,u,'p1','self');
  let duplicateBlocked=false;try{assertPrincipalOwner(ownersUid,ownersCfp,u,'p2','self');}catch{duplicateBlocked=true;}if(!duplicateBlocked)throw new Error('SELFTEST_PRINCIPAL_ALIAS_NOT_BLOCKED');
  const h=crypto.randomBytes(32);const fake={passwordHash:h,passwordSalt:null};const record={passwordHash:h.toString('hex')};const mode=classifyPasswordRollback(fake,[record],{algorithm:'SCRYPT'});if(mode.mode!=='LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT')throw new Error('SELFTEST_SALTLESS');
  const salted={passwordHash:h,passwordSalt:Buffer.from('salt')};const mode2=classifyPasswordRollback(salted,[],{algorithm:'SCRYPT'});if(mode2.mode!=='PROVIDER_HASH_CONFIG_EXACT')throw new Error('SELFTEST_PROVIDER_SALT');
  console.log('PASS_C6_AUTH_ACTIVATION_V2_SELFTEST');
}

async function main(){
  fs.mkdirSync(exportDir,{recursive:true});fs.mkdirSync(privateDir,{recursive:true});
  let decision='STOP_RETRY_C6_AUTH_ACTIVATION_DEV_V2_PREWRITE';
  const state={writeBoundaryEntered:false,authCreates:0,authUpdates:0,duplicateDisables:0,providerWriteCalls:0};
  const sourceSafe={schemaVersion:'cxorbia.c6.auth-activation-dev-v2.evidence.v1',generatedAt:new Date().toISOString(),decision:null,requestId:null,prewrite:{pass:false},writes:{},readback:{},rollbackDryRun:{},safety:{}};
  try{
    if(!fs.existsSync(requestPath))throw new Error('REQUEST_MISSING');const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));sourceSafe.requestId=request.requestId||null;
    const contract=JSON.parse(fs.readFileSync(request.contract,'utf8'));const plan=JSON.parse(fs.readFileSync(process.env.CXORBIA_FINAL_PLAN_V3,'utf8'));
    if(request.schemaVersion!=='cxorbia.c6.auth-principal-uniqueness-rootfix-activation-dev.request.v1'||request.enabled!==true||request.consumed!==false||request.status!=='authorized_execute_once_after_source_phase_pass'||Number(request.allowedExecutions)!==1||request.authorizedBy!=='Paula')throw new Error('REQUEST_AUTH');
    if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||Number(request.pullRequest)!==7||request.firebaseProjectId!==EXPECTED_FIREBASE_PROJECT)throw new Error('REQUEST_LANE');
    if(contract.schemaVersion!=='cxorbia.c6.auth-activation-dev.contract.v2')throw new Error('CONTRACT_SCHEMA');for(const value of Object.values(contract.prohibited||{}))if(value!==true)throw new Error('PROHIBITED_CONTRACT_DRIFT');
    validatePlanShape(plan,contract);
    if(!serviceAccountPath||!fs.existsSync(serviceAccountPath))throw new Error('SERVICE_ACCOUNT_MISSING');const serviceAccount=JSON.parse(fs.readFileSync(serviceAccountPath,'utf8'));if(serviceAccount.project_id!==EXPECTED_FIREBASE_PROJECT)throw new Error('SERVICE_ACCOUNT_PROJECT');
    const credential=admin.credential.cert(serviceAccount);if(!admin.apps.length)admin.initializeApp({credential,projectId:EXPECTED_FIREBASE_PROJECT});const auth=admin.auth(),db=admin.firestore();
    const bundle=decryptCredentialBundle({serviceAccount});const webConfig=await fetchFirebaseWebConfig(remoteRoot,EXPECTED_FIREBASE_PROJECT);
    const tenantRef=db.collection('tenants').doc(TENANT_ID),projectRef=tenantRef.collection('projects').doc(CANONICAL_PROJECT_ID);
    const [authUsers,profileSnap,hrSnap,visitSnap,certSnap,liqSnap]=await Promise.all([listAllUsers(auth),tenantRef.collection('shoppers').get(),projectRef.collection('hrImports').get(),projectRef.collection('visits').get(),db.collectionGroup('certifications').get(),db.collectionGroup('liquidations').get()]);
    if(authUsers.length!==contract.finalPlan.expectedAuthUsersBefore)throw new Error(`AUTH_POPULATION_DRIFT:${authUsers.length}`);if(profileSnap.docs.length!==340)throw new Error(`SHOPPER_POPULATION_DRIFT:${profileSnap.docs.length}`);
    const profiles=new Map(profileSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));const profileByFp=new Map([...profiles.values()].map(profile=>[stablePlanProfileFingerprint(profile.id),profile]));if(profileByFp.size!==340||plan.rows.some(row=>!profileByFp.has(row.profileFp)))throw new Error('PROFILE_SET_DRIFT');
    const relationIndex=new Map();for(const profile of profiles.values()){add(relationIndex,profile.id,profile.id);for(const key of TECH_KEYS)add(relationIndex,profile[key],profile.id);}
    const linkedByProfile=new Map();const link=(shopperId,source,mode)=>{if(!profiles.has(shopperId))return;if(!linkedByProfile.has(shopperId))linkedByProfile.set(shopperId,[]);linkedByProfile.get(shopperId).push({...source,__linkMode:mode});propagateTechKeys(relationIndex,source,shopperId);};
    for(const [basis,snap] of [['hr',hrSnap],['visit',visitSnap],['certification',certSnap],['liquidation',liqSnap]])for(const doc of snap.docs){const rootData=doc.data()||{};for(const source of [{value:rootData,basis},...recursiveObjects(rootData,basis)]){const direct=text(source.value.shopperId||source.value.profileId||source.value.shopperDocId);if(direct&&profiles.has(direct)){link(direct,source,'direct_shopper_id');continue;}const candidates=[];for(const key of TECH_KEYS)candidates.push(...(relationIndex.get(text(source.value[key]))||[]));const exact=uniq(candidates);if(exact.length===1)link(exact[0],source,'exact_technical_anchor');}}
    const authByEmail=new Map(),authByShopperId=new Map();for(const user of authUsers){if(user.email)add(authByEmail,norm(user.email),user);const sid=text(user.customClaims?.shopperId);if(sid)add(authByShopperId,sid,user);}
    const credentialRecords=(Array.isArray(bundle.records)?bundle.records:[]).filter(r=>r?.kind==='shopper');const credentialsByProfile=new Map();let credentialsMapped=0;
    for(const record of credentialRecords){const login=norm(record.normalizedLogin||record.loginIdentifier),legacy=text(record.legacyId||record.legacyShopperId||record.externalShopperId),candidates=[];if(legacy)candidates.push(...(relationIndex.get(legacy)||[]));if(login){for(const user of authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]){const sid=text(user.customClaims?.shopperId);if(profiles.has(sid))candidates.push(sid);}}const exact=uniq(candidates);if(exact.length===1){credentialsMapped++;if(!credentialsByProfile.has(exact[0]))credentialsByProfile.set(exact[0],[]);credentialsByProfile.get(exact[0]).push(record);}}
    const credentialsUnmapped=credentialRecords.length-credentialsMapped;if(credentialsMapped!==101||credentialsUnmapped!==8)throw new Error(`CREDENTIAL_CROSSWALK_DRIFT:${credentialsMapped}/${credentialsUnmapped}`);
    const namesByProfile=new Map();for(const profile of profiles.values())namesByProfile.set(profile.id,resolveEquivalentNames(profile,linkedByProfile.get(profile.id)||[],credentialsByProfile.get(profile.id)||[]));
    const userByCandidateFp=new Map();for(const user of authUsers){const cfp=stableAuthCandidateFingerprint(user.uid);if(userByCandidateFp.has(cfp))throw new Error('AUTH_CANDIDATE_FP_COLLISION');userByCandidateFp.set(cfp,user);}
    const ownerByUid=new Map(),ownerByCandidate=new Map(),execution=[],targetEmails=new Map();
    for(const planRow of plan.rows){
      const profile=profileByFp.get(planRow.profileFp),names=namesByProfile.get(profile.id),credentials=credentialsByProfile.get(profile.id)||[];let targetLogin='',targetEmail='',selectedUser=null,keeperUser=null,retireUser=null;
      if(planRow.targetLoginFp){targetLogin=resolveTargetLogin(planRow,names,profile.id,TENANT_ID);targetEmail=internalEmail(targetLogin,'shopper',TENANT_ID);if(targetEmails.has(norm(targetEmail)))throw new Error(`TARGET_EMAIL_DUPLICATE:${planRow.profileFp}`);targetEmails.set(norm(targetEmail),planRow.profileFp);}
      if(planRow.preserveAuthCandidateFingerprint){keeperUser=userByCandidateFp.get(planRow.preserveAuthCandidateFingerprint)||null;if(!keeperUser)throw new Error(`PRESERVE_CANDIDATE_MISSING:${planRow.profileFp}`);if(keeperUser.disabled||!userProviderHasPassword(keeperUser)||!effectiveShopperScope(keeperUser.customClaims||{},profile.id))throw new Error(`PRESERVE_SCOPE_DRIFT:${planRow.profileFp}`);assertPrincipalOwner(ownerByUid,ownerByCandidate,keeperUser,planRow.profileFp,'preserve');}
      if(planRow.secondaryAuthDisposition){keeperUser=userByCandidateFp.get(planRow.secondaryAuthDisposition.keeperCandidateFingerprint)||null;retireUser=userByCandidateFp.get(planRow.secondaryAuthDisposition.retireAccessCandidateFingerprint)||null;if(!keeperUser||!retireUser||keeperUser.uid===retireUser.uid)throw new Error('DUPLICATE_PAIR_NOT_EXACT');if(keeperUser.disabled||retireUser.disabled)throw new Error('DUPLICATE_PAIR_NOT_ENABLED');if(!effectiveShopperScope(keeperUser.customClaims||{},profile.id)||!effectiveShopperScope(retireUser.customClaims||{},profile.id))throw new Error('DUPLICATE_PAIR_SCOPE');assertPrincipalOwner(ownerByUid,ownerByCandidate,keeperUser,planRow.profileFp,'duplicate_keeper');assertPrincipalOwner(ownerByUid,ownerByCandidate,retireUser,planRow.profileFp,'duplicate_retire');}
      if(['CREATE_AUTH','UPDATE_AUTH'].includes(planRow.primary)||(planRow.primary==='NO_OP'&&planRow.targetLoginFp&&!planRow.preserveAuthCandidateFingerprint)){
        if(!names?.complete||!targetLogin||!targetEmail)throw new Error(`TARGET_RECONSTRUCTION_INCOMPLETE:${planRow.profileFp}`);
        const candidates=gatherCandidatesTargetSpecific(profile.id,credentials,targetLogin,authByShopperId,authByEmail);
        if(planRow.profileFp===TARGET_PROFILE_FP&&candidates.length!==0)throw new Error(`TARGET_ROOTFIX_CANDIDATE_DRIFT:${candidates.length}`);
        if(planRow.primary==='CREATE_AUTH'){
          if(candidates.length!==0)throw new Error(`CREATE_AUTH_CANDIDATE_DRIFT:${planRow.profileFp}:${candidates.length}`);const owners=authByEmail.get(norm(targetEmail))||[];if(owners.length)throw new Error(`CREATE_TARGET_EMAIL_COLLISION:${planRow.profileFp}`);
        }else{
          if(candidates.length!==1)throw new Error(`${planRow.primary}_AUTH_CANDIDATE_DRIFT:${planRow.profileFp}:${candidates.length}`);selectedUser=candidates[0];assertPrincipalOwner(ownerByUid,ownerByCandidate,selectedUser,planRow.profileFp,'selected');
          const emailDiff=norm(selectedUser.email)!==norm(targetEmail),claimsDiff=!exactClaims(selectedUser.customClaims||{},profile.id);
          if(planRow.primary==='UPDATE_AUTH'){
            if(Boolean(planRow.changes?.email)!==emailDiff||Boolean(planRow.changes?.claims)!==claimsDiff)throw new Error(`UPDATE_FLAG_DRIFT:${planRow.profileFp}`);if(!userProviderHasPassword(selectedUser))throw new Error(`UPDATE_PASSWORD_PROVIDER_MISSING:${planRow.profileFp}`);const passwordCompatible=await passwordSignInEmail(webConfig.apiKey,selectedUser.email,names.password);if(Boolean(planRow.changes?.password)===passwordCompatible)throw new Error(`UPDATE_PASSWORD_FLAG_DRIFT:${planRow.profileFp}`);
          }else{
            if(emailDiff||claimsDiff||Object.values(planRow.changes||{}).some(Boolean))throw new Error(`NO_OP_DRIFT:${planRow.profileFp}`);if(!userProviderHasPassword(selectedUser)||!await passwordSignInEmail(webConfig.apiKey,selectedUser.email,names.password))throw new Error(`NO_OP_PASSWORD_DRIFT:${planRow.profileFp}`);
          }
          const owners=authByEmail.get(norm(targetEmail))||[];if(owners.some(owner=>owner.uid!==selectedUser.uid))throw new Error(`UPDATE_TARGET_EMAIL_COLLISION:${planRow.profileFp}`);
        }
      }
      execution.push({planRow,profileId:profile.id,names,credentials,targetLogin,targetEmail,selectedUser,keeperUser,retireUser,desiredClaims:canonicalClaims(profile.id)});
    }
    for(const x of execution.filter(x=>x.planRow.primary==='PRESERVE_NO_AUTH')){const effective=(authByShopperId.get(x.profileId)||[]).filter(user=>effectiveShopperScope(user.customClaims||{},x.profileId)&&!user.disabled&&userProviderHasPassword(user));if(effective.length)throw new Error(`PRESERVE_NO_AUTH_EFFECTIVE_ACCESS:${x.planRow.profileFp}`);}
    const updateRows=execution.filter(x=>x.planRow.primary==='UPDATE_AUTH'),createRows=execution.filter(x=>x.planRow.primary==='CREATE_AUTH'),passwordUpdates=updateRows.filter(x=>x.planRow.changes?.password===true);if(updateRows.length!==45||createRows.length!==82||passwordUpdates.length!==13)throw new Error('EXECUTION_CARDINALITY');
    const targetExecution=execution.find(x=>x.planRow.profileFp===TARGET_PROFILE_FP),peerExecution=execution.find(x=>x.planRow.profileFp===COLLISION_PEER_FP);if(targetExecution?.selectedUser)throw new Error('TARGET_HAS_EXISTING_PRINCIPAL');if(!peerExecution?.selectedUser)throw new Error('PEER_PRINCIPAL_MISSING');
    const special=execution.find(x=>x.planRow.profileFp===contract.tenantAdjudication.profileFingerprint);if(!special?.keeperUser||!special?.retireUser)throw new Error('SPECIAL_ADJUDICATION_NOT_RESOLVED');
    const hashConfig=await fetchHashConfig(credential,EXPECTED_FIREBASE_PROJECT);const rollbackModes={PROVIDER_HASH_CONFIG_EXACT:0,LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT:0};const passwordRollbackByUid=new Map();
    for(const x of passwordUpdates){const mode=classifyPasswordRollback(x.selectedUser,x.credentials,hashConfig);rollbackModes[mode.mode]++;passwordRollbackByUid.set(x.selectedUser.uid,mode);}
    if(rollbackModes.PROVIDER_HASH_CONFIG_EXACT+rollbackModes.LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT!==13)throw new Error('PASSWORD_ROLLBACK_COUNT');
    const snapshotUsers=new Map();for(const x of updateRows)snapshotUsers.set(x.selectedUser.uid,x.selectedUser);snapshotUsers.set(special.keeperUser.uid,special.keeperUser);snapshotUsers.set(special.retireUser.uid,special.retireUser);
    const membershipSnapshots=[];for(const user of snapshotUsers.values()){const snap=await tenantRef.collection('users').doc(user.uid).get();membershipSnapshots.push({uid:user.uid,exists:snap.exists,data:snap.exists?snap.data():null});}
    const snapshotPayload={schemaVersion:'cxorbia.c6.auth-activation-dev-v2.rollback-snapshot.v1',generatedAt:new Date().toISOString(),requestId:request.requestId,projectId:EXPECTED_FIREBASE_PROJECT,planDigest:plan.plan.sourceSafeRowsDigestSha256,hashConfig,users:[...snapshotUsers.values()].map(user=>({...snapshotUser(user),passwordRollback:passwordRollbackByUid.get(user.uid)||null})),memberships:membershipSnapshots};
    const snapshotEnvelope=encryptEnvelope(snapshotPayload,serviceAccount.private_key,'c6-auth-activation-dev-v2-prewrite-snapshot');const snapshotPath=path.join(exportDir,'rollback-snapshot-prewrite.enc.json');fs.writeFileSync(snapshotPath,JSON.stringify(snapshotEnvelope,null,2)+'\n','utf8');const decryptedCheck=decryptEnvelope(snapshotEnvelope,serviceAccount.private_key);if(decryptedCheck.users.length!==snapshotUsers.size||decryptedCheck.memberships.length!==snapshotUsers.size)throw new Error('SNAPSHOT_ROUNDTRIP');
    sourceSafe.prewrite={pass:true,authUsersBefore:authUsers.length,shopperProfiles:profiles.size,credentialsMapped,credentialsUnmapped,planRows:plan.rows.length,planDigest:plan.plan.sourceSafeRowsDigestSha256,createRows:createRows.length,updateRows:updateRows.length,passwordUpdateRows:passwordUpdates.length,globalPrincipalOwners:ownerByUid.size,globalCandidateOwners:ownerByCandidate.size,targetExistingCandidateCount:0,peerOwnPrincipal:true,snapshotUsers:snapshotUsers.size,membershipPointReads:snapshotUsers.size,hashConfigReadable:true,passwordRollbackModes:rollbackModes,encryptedSnapshotDigest:sha256(fs.readFileSync(snapshotPath)),duplicatePairExact:true};
    fs.writeFileSync(path.join(exportDir,'prewrite-source-safe.json'),JSON.stringify(sourceSafe.prewrite,null,2)+'\n','utf8');fs.writeFileSync(path.join(exportDir,'decision-prewrite.txt'),'PASS_C6_AUTH_ACTIVATION_DEV_V2_PREWRITE\n','utf8');

    state.writeBoundaryEntered=true;
    const created=[];const persistCreatedJournal=()=>{const payload={schemaVersion:'cxorbia.c6.auth-activation-dev-v2.created-rollback-journal.v1',generatedAt:new Date().toISOString(),requestId:request.requestId,createdUsers:created};const envelope=encryptEnvelope(payload,serviceAccount.private_key,'c6-auth-activation-dev-v2-created-users');fs.writeFileSync(path.join(exportDir,'rollback-created-users.enc.json'),JSON.stringify(envelope,null,2)+'\n','utf8');return envelope;};let createdEnvelope=persistCreatedJournal();
    for(const x of createRows){const createdUser=await auth.createUser({email:x.targetEmail,password:x.names.password,emailVerified:true,disabled:false});state.authCreates++;state.providerWriteCalls++;created.push({uid:createdUser.uid,profileId:x.profileId,targetEmail:x.targetEmail});createdEnvelope=persistCreatedJournal();await auth.setCustomUserClaims(createdUser.uid,x.desiredClaims);state.providerWriteCalls++;}
    for(const x of updateRows){const update={};if(x.planRow.changes.email)update.email=x.targetEmail;if(x.planRow.changes.password)update.password=x.names.password;if(Object.keys(update).length){await auth.updateUser(x.selectedUser.uid,update);state.providerWriteCalls++;}if(x.planRow.changes.claims){await auth.setCustomUserClaims(x.selectedUser.uid,x.desiredClaims);state.providerWriteCalls++;}state.authUpdates++;}
    await auth.updateUser(special.retireUser.uid,{disabled:true});state.providerWriteCalls++;state.duplicateDisables=1;

    const afterUsers=await listAllUsers(auth);if(afterUsers.length!==contract.readback.expectedAuthUsersAfter)throw new Error(`READBACK_AUTH_POPULATION:${afterUsers.length}`);const afterByEmail=new Map(),afterByCandidateFp=new Map();for(const u of afterUsers){if(u.email)add(afterByEmail,norm(u.email),u);afterByCandidateFp.set(stableAuthCandidateFingerprint(u.uid),u);}
    const readbackOwner=new Map();let createdValidated=0,updatesValidated=0,passwordSignInsValidated=0;
    for(const x of createRows){const users=afterByEmail.get(norm(x.targetEmail))||[];if(users.length!==1)throw new Error(`READBACK_CREATE_EMAIL:${x.planRow.profileFp}:${users.length}`);const u=users[0];if(u.disabled||!exactClaims(u.customClaims||{},x.profileId))throw new Error(`READBACK_CREATE_SCOPE:${x.planRow.profileFp}`);if(readbackOwner.has(u.uid))throw new Error('READBACK_CROSS_ROW_ALIAS');readbackOwner.set(u.uid,x.planRow.profileFp);if(!await passwordSignInEmail(webConfig.apiKey,u.email,x.names.password))throw new Error(`READBACK_CREATE_PASSWORD:${x.planRow.profileFp}`);createdValidated++;passwordSignInsValidated++;}
    for(const x of updateRows){const u=await auth.getUser(x.selectedUser.uid);if(norm(u.email)!==norm(x.targetEmail)||u.disabled||!exactClaims(u.customClaims||{},x.profileId))throw new Error(`READBACK_UPDATE_SCOPE:${x.planRow.profileFp}`);if(readbackOwner.has(u.uid)&&readbackOwner.get(u.uid)!==x.planRow.profileFp)throw new Error('READBACK_CROSS_ROW_ALIAS');readbackOwner.set(u.uid,x.planRow.profileFp);if(x.planRow.changes.password){if(!await passwordSignInEmail(webConfig.apiKey,u.email,x.names.password))throw new Error(`READBACK_UPDATE_PASSWORD:${x.planRow.profileFp}`);passwordSignInsValidated++;}updatesValidated++;}
    const keeperAfter=afterByCandidateFp.get(contract.tenantAdjudication.keeperCandidateFingerprint),retireAfter=afterByCandidateFp.get(contract.tenantAdjudication.retireAccessCandidateFingerprint);if(!keeperAfter||keeperAfter.disabled||!retireAfter||!retireAfter.disabled)throw new Error('READBACK_DUPLICATE_DISPOSITION');
    sourceSafe.writes={writeBoundaryEntered:true,authCreates:state.authCreates,authUpdates:state.authUpdates,duplicateDisables:state.duplicateDisables,providerWriteCalls:state.providerWriteCalls,membershipWrites:0,firestoreWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,cloudBuilds:0,cloudRunDeploys:0,hostingDeploys:0};
    sourceSafe.readback={pass:true,authUsersAfter:afterUsers.length,createdValidated,updatesValidated,passwordSignInsValidated,keeperActive:true,duplicateDisabled:true,noCrossRowPrincipalAlias:true};
    const createdDecrypted=decryptEnvelope(createdEnvelope,serviceAccount.private_key),snapshotDecrypted=decryptEnvelope(snapshotEnvelope,serviceAccount.private_key);const passwordRestoreEntries=snapshotDecrypted.users.filter(u=>u.passwordRollback?.mode).length;if(createdDecrypted.createdUsers.length!==82||passwordRestoreEntries!==13)throw new Error('ROLLBACK_DRY_RUN_CARDINALITY');
    sourceSafe.rollbackDryRun={pass:true,realRollbackExecuted:false,deleteCreatedCount:createdDecrypted.createdUsers.length,restoreExistingUserCount:snapshotDecrypted.users.length,passwordHashRestoreEntries:passwordRestoreEntries,membershipSnapshots:snapshotDecrypted.memberships.length,hashConfigPresent:Boolean(snapshotDecrypted.hashConfig),encryptedPayloadsDecryptAndDigestVerify:true,passwordRollbackModes:rollbackModes};
    decision='PASS_C6_AUTH_ACTIVATION_DEV_V2';
  }catch(error){sourceSafe.error=safeError(error);decision=state.writeBoundaryEntered?'HOLD_C6_AUTH_ACTIVATION_DEV_V2_POSTWRITE_STOP_RETRY':'STOP_RETRY_C6_AUTH_ACTIVATION_DEV_V2_PREWRITE';}
  finally{
    sourceSafe.decision=decision;sourceSafe.safety={writeBoundaryEntered:state.writeBoundaryEntered,authCreates:state.authCreates,authUpdates:state.authUpdates,duplicateDisables:state.duplicateDisables,providerWriteCalls:state.providerWriteCalls,realRollbackExecuted:false,firestoreWrites:0,membershipWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,cloudBuilds:0,cloudRunDeploys:0,hostingDeploys:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,rawUidExported:false,rawEmailExported:false,rawPasswordExported:false,rawShopperIdExported:false,rawClaimsExported:false,rawPasswordHashExported:false,rawPasswordSaltExported:false};fs.writeFileSync(path.join(exportDir,'report-source-safe.json'),JSON.stringify(sourceSafe,null,2)+'\n','utf8');fs.writeFileSync(path.join(exportDir,'rollback-dry-run-source-safe.json'),JSON.stringify(sourceSafe.rollbackDryRun||{},null,2)+'\n','utf8');fs.writeFileSync(path.join(exportDir,'decision.txt'),decision+'\n','utf8');try{fs.rmSync(privateDir,{recursive:true,force:true});}catch{}console.log(decision);if(decision!=='PASS_C6_AUTH_ACTIVATION_DEV_V2')process.exitCode=2;
  }
}

if(process.argv.includes('--self-test'))selfTest();else await main();
