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

const TECH_KEYS = [
  'shopperId','legacyShopperId','legacyId','externalShopperId','externalId',
  'sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'
];
const root = process.cwd();
const requestPath = process.argv[2] || 'backend/config/c6-auth-activation-dev-request-v1.json';
const exportDir = path.resolve(process.env.CXORBIA_AUTH_ACTIVATION_EXPORT_DIR || path.join(root,'.tmp/c6-auth-activation-dev-export'));
const privateDir = path.resolve(process.env.CXORBIA_AUTH_ACTIVATION_PRIVATE_DIR || path.join(root,'.tmp/c6-auth-activation-dev-private'));
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const remoteRoot = String(process.env.CXORBIA_DEV_ROOT_URL || 'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');

const uniq = values => [...new Set(values.filter(Boolean))];
const add = (map,key,value) => {
  const k=text(key); if(!k)return;
  if(!map.has(k))map.set(k,[]);
  map.get(k).push(value);
};
const fp = (kind,value) => fingerprint(`${kind}\0${value}`);
const stablePlanProfileFingerprint = profileId => fp('deterministic-suffix-plan-profile',profileId);
const stableBaseLoginFingerprint = login => fp('base-login',login);
const stableTargetLoginFingerprint = login => fp('target-login',login);
const canonicalClaims = (shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID) => ({tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId});
const exactClaims = (claims,shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID) =>
  claims?.tenantId===tenantId && claims?.role==='shopper' && claims?.authNamespace==='shopper' && claims?.shopperId===shopperId && Array.isArray(claims?.projectIds) && claims.projectIds.includes(projectId);
const list = value => Array.isArray(value) ? value.map(text).filter(Boolean) : [];
const effectiveShopperScope = (claims,shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID) => {
  const tenantAllowed=text(claims?.tenantId)===tenantId||list(claims?.tenants).includes(tenantId)||list(claims?.tenantIds).includes(tenantId);
  const projectAssigned=text(claims?.projectId)===projectId||list(claims?.projectIds).includes(projectId);
  const roleShopper=norm(claims?.role)==='shopper'||list(claims?.roles).map(norm).includes('shopper');
  return tenantAllowed&&projectAssigned&&roleShopper&&text(claims?.shopperId)===shopperId;
};
const safeError = error => String(error?.message||error).replace(/[^A-Za-z0-9_.:,/+-]+/g,'_').slice(0,500);
const asBase64 = value => {
  if(value==null)return '';
  if(Buffer.isBuffer(value))return value.toString('base64');
  return String(value);
};
function recursiveObjects(value,basis,out=[],depth=0){
  if(depth>7||value==null)return out;
  if(Array.isArray(value)){for(const item of value)recursiveObjects(item,basis,out,depth+1);return out;}
  if(typeof value!=='object')return out;
  const keys=Object.keys(value);
  if(keys.some(key=>TECH_KEYS.includes(key)))out.push({value,basis});
  for(const item of Object.values(value))if(item&&typeof item==='object')recursiveObjects(item,basis,out,depth+1);
  return out;
}
function propagateTechKeys(index,source,shopperId){
  const value=source?.value??source;
  for(const key of TECH_KEYS){
    const raw=value?.[key];
    for(const item of Array.isArray(raw)?raw:[raw])add(index,text(item),shopperId);
  }
}
async function listAllUsers(auth){
  const out=[];let pageToken;
  do{const page=await auth.listUsers(1000,pageToken);out.push(...page.users);pageToken=page.pageToken;}while(pageToken);
  return out;
}
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
  const salt=crypto.randomBytes(32); const iv=crypto.randomBytes(12);
  const key=crypto.hkdfSync('sha256',Buffer.from(serviceAccountPrivateKey,'utf8'),salt,Buffer.from(context,'utf8'),32);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const aad=Buffer.from(`cxorbia-auth-activation-dev|${context}`,'utf8'); cipher.setAAD(aad);
  const plaintext=Buffer.from(JSON.stringify(payload),'utf8');
  const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  const tag=cipher.getAuthTag();
  return {schemaVersion:'cxorbia.encrypted-envelope.v1',algorithm:'AES-256-GCM',kdf:'HKDF-SHA256',context,aad:aad.toString('base64'),saltBase64:salt.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:tag.toString('base64'),ciphertextBase64:ciphertext.toString('base64'),plaintextSha256:sha256(plaintext)};
}
function decryptEnvelope(envelope,serviceAccountPrivateKey){
  const salt=Buffer.from(envelope.saltBase64,'base64'); const iv=Buffer.from(envelope.ivBase64,'base64');
  const key=crypto.hkdfSync('sha256',Buffer.from(serviceAccountPrivateKey,'utf8'),salt,Buffer.from(envelope.context,'utf8'),32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv); decipher.setAAD(Buffer.from(envelope.aad,'base64')); decipher.setAuthTag(Buffer.from(envelope.tagBase64,'base64'));
  const plaintext=Buffer.concat([decipher.update(Buffer.from(envelope.ciphertextBase64,'base64')),decipher.final()]);
  if(sha256(plaintext)!==envelope.plaintextSha256)throw new Error('ENCRYPTED_ENVELOPE_DIGEST_MISMATCH');
  return JSON.parse(plaintext.toString('utf8'));
}
async function fetchHashConfig(credential,projectId){
  const token=await credential.getAccessToken();
  const accessToken=token?.access_token||token?.accessToken;
  if(!accessToken)throw new Error('HASH_CONFIG_ACCESS_TOKEN_MISSING');
  const url=`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config?mask=hashConfig`;
  const response=await fetch(url,{headers:{authorization:`Bearer ${accessToken}`,'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`HASH_CONFIG_HTTP_${response.status}`);
  const body=await response.json();
  const hashConfig=body?.hashConfig||body?.hash_config;
  if(!hashConfig||typeof hashConfig!=='object'||Object.keys(hashConfig).length===0)throw new Error('HASH_CONFIG_EMPTY');
  return hashConfig;
}
function snapshotUser(user){
  return {
    uid:user.uid,email:user.email||null,emailVerified:Boolean(user.emailVerified),disabled:Boolean(user.disabled),
    customClaims:user.customClaims||null,providerData:(user.providerData||[]).map(p=>({providerId:p.providerId||null,uid:p.uid||null,email:p.email||null,displayName:p.displayName||null,photoURL:p.photoURL||null,phoneNumber:p.phoneNumber||null})),
    passwordHash:asBase64(user.passwordHash),passwordSalt:asBase64(user.passwordSalt)
  };
}
function userProviderHasPassword(user){return (user.providerData||[]).some(p=>p.providerId==='password')||Boolean(user.email);}
function validatePlanShape(plan,contract){
  if(plan.schemaVersion!=='cxorbia.c6.shopper-auth-final-plan.v2')throw new Error('FINAL_PLAN_SCHEMA_INVALID');
  if(plan.target?.firebaseProjectId!==EXPECTED_FIREBASE_PROJECT||plan.target?.tenantId!==TENANT_ID||plan.target?.projectId!==CANONICAL_PROJECT_ID)throw new Error('FINAL_PLAN_TARGET_DRIFT');
  if(!Array.isArray(plan.rows)||plan.rows.length!==340||new Set(plan.rows.map(r=>r.profileFp)).size!==340)throw new Error('FINAL_PLAN_340_UNIQUE_REQUIRED');
  if(rowsDigest(plan.rows)!==plan.plan?.sourceSafeRowsDigestSha256||rowsDigest(plan.rows)!==contract.finalPlan?.rowsDigestSha256)throw new Error('FINAL_PLAN_DIGEST_MISMATCH');
  const counts={CREATE_AUTH:0,UPDATE_AUTH:0,NO_OP:0,HOLD:0,PRESERVE_NO_AUTH:0};
  const sub={email:0,password:0,claims:0};
  for(const row of plan.rows){
    if(!Object.hasOwn(counts,row.primary))throw new Error('FINAL_PLAN_OPERATION_INVALID'); counts[row.primary]++;
    for(const key of Object.keys(sub))if(row.changes?.[key]===true)sub[key]++;
  }
  if(JSON.stringify(counts)!==JSON.stringify(contract.finalPlan.operationCounts))throw new Error(`FINAL_PLAN_COUNTS_DRIFT:${JSON.stringify(counts)}`);
  if(JSON.stringify(sub)!==JSON.stringify(contract.finalPlan.subchangeCounts))throw new Error(`FINAL_PLAN_SUBCHANGES_DRIFT:${JSON.stringify(sub)}`);
  if(counts.HOLD!==0)throw new Error('FINAL_PLAN_HOLD_NOT_ZERO');
  if(plan.tenantAdjudication?.keeperCandidateFingerprint!==contract.tenantAdjudication?.keeperCandidateFingerprint||plan.tenantAdjudication?.retireAccessCandidateFingerprint!==contract.tenantAdjudication?.retireAccessCandidateFingerprint)throw new Error('TENANT_ADJUDICATION_DRIFT');
  return {counts,sub,digest:rowsDigest(plan.rows)};
}

async function main(){
  fs.mkdirSync(exportDir,{recursive:true}); fs.mkdirSync(privateDir,{recursive:true});
  let decision='HOLD_C6_AUTH_ACTIVATION_DEV_TECHNICAL_ERROR';
  const state={writeBoundaryEntered:false,authCreates:0,authUpdates:0,duplicateDisables:0,providerWrites:0};
  const sourceSafe={schemaVersion:'cxorbia.c6.auth-activation-dev.evidence.v1',generatedAt:new Date().toISOString(),decision:null,requestId:null,sourceHead:process.env.CXORBIA_TARGET_HEAD||null,prewrite:{pass:false},writes:{},readback:{},rollbackDryRun:{},safety:{}};
  try{
    if(!fs.existsSync(requestPath))throw new Error('REQUEST_MISSING');
    const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
    sourceSafe.requestId=request.requestId||null;
    const contract=JSON.parse(fs.readFileSync(request.contract,'utf8'));
    const plan=JSON.parse(fs.readFileSync(request.finalPlan,'utf8'));
    if(request.schemaVersion!=='cxorbia.c6.auth-activation-dev.request.v1'||request.enabled!==true||request.consumed!==false||request.status!=='authorized_execute_once'||Number(request.allowedExecutions)!==1||request.authorizedBy!=='Paula')throw new Error('REQUEST_AUTHORIZATION_INVALID');
    if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||Number(request.pullRequest)!==7)throw new Error('REQUEST_LANE_INVALID');
    if(request.firebaseProjectId!==EXPECTED_FIREBASE_PROJECT||request.tenantId!==TENANT_ID||request.projectId!==CANONICAL_PROJECT_ID)throw new Error('REQUEST_TARGET_INVALID');
    if(contract.schemaVersion!=='cxorbia.c6.auth-activation-dev.contract.v1')throw new Error('CONTRACT_SCHEMA_INVALID');
    for(const [key,value] of Object.entries(contract.prohibited||{}))if(value!==true)throw new Error(`PROHIBITED_CONTRACT_DRIFT:${key}`);
    validatePlanShape(plan,contract);
    if(!serviceAccountPath||!fs.existsSync(serviceAccountPath))throw new Error('SERVICE_ACCOUNT_MISSING');
    const serviceAccount=JSON.parse(fs.readFileSync(serviceAccountPath,'utf8'));
    if(serviceAccount.project_id!==EXPECTED_FIREBASE_PROJECT)throw new Error('SERVICE_ACCOUNT_PROJECT_MISMATCH');
    const credential=admin.credential.cert(serviceAccount);
    if(!admin.apps.length)admin.initializeApp({credential,projectId:EXPECTED_FIREBASE_PROJECT});
    const auth=admin.auth(); const db=admin.firestore();
    const bundle=decryptCredentialBundle({serviceAccount});
    const webConfig=await fetchFirebaseWebConfig(remoteRoot,EXPECTED_FIREBASE_PROJECT);
    const tenantRef=db.collection('tenants').doc(TENANT_ID); const projectRef=tenantRef.collection('projects').doc(CANONICAL_PROJECT_ID);
    const [authUsers,profileSnap,hrSnap,visitSnap,certSnap,liqSnap]=await Promise.all([
      listAllUsers(auth),tenantRef.collection('shoppers').get(),projectRef.collection('hrImports').get(),projectRef.collection('visits').get(),db.collectionGroup('certifications').get(),db.collectionGroup('liquidations').get()
    ]);
    if(authUsers.length!==Number(contract.prewrite.expectedAuthUsersBefore))throw new Error(`AUTH_POPULATION_DRIFT:${authUsers.length}`);
    if(profileSnap.docs.length!==340)throw new Error(`SHOPPER_POPULATION_DRIFT:${profileSnap.docs.length}`);
    const profiles=new Map(profileSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));
    const profileByFp=new Map([...profiles.values()].map(profile=>[stablePlanProfileFingerprint(profile.id),profile]));
    if(profileByFp.size!==340||plan.rows.some(row=>!profileByFp.has(row.profileFp)))throw new Error('PROFILE_FINGERPRINT_SET_DRIFT');
    const relationIndex=new Map();
    for(const profile of profiles.values()){add(relationIndex,profile.id,profile.id);for(const key of TECH_KEYS)add(relationIndex,profile[key],profile.id);}
    const linkedByProfile=new Map();
    const link=(shopperId,source,mode)=>{if(!profiles.has(shopperId))return;if(!linkedByProfile.has(shopperId))linkedByProfile.set(shopperId,[]);linkedByProfile.get(shopperId).push({...source,__linkMode:mode});propagateTechKeys(relationIndex,source,shopperId);};
    for(const [basis,snap] of [['hr',hrSnap],['visit',visitSnap],['certification',certSnap],['liquidation',liqSnap]]){
      for(const doc of snap.docs){
        const rootData=doc.data()||{};
        for(const source of [{value:rootData,basis},...recursiveObjects(rootData,basis)]){
          const direct=text(source.value.shopperId||source.value.profileId||source.value.shopperDocId);
          if(direct&&profiles.has(direct)){link(direct,source,'direct_shopper_id');continue;}
          const candidates=[]; for(const key of TECH_KEYS)candidates.push(...(relationIndex.get(text(source.value[key]))||[]));
          const exact=uniq(candidates); if(exact.length===1)link(exact[0],source,'exact_technical_anchor');
        }
      }
    }
    const authByEmail=new Map(); const authByShopperId=new Map();
    for(const user of authUsers){if(user.email)add(authByEmail,norm(user.email),user);const sid=text(user.customClaims?.shopperId);if(sid)add(authByShopperId,sid,user);}
    const credentialRecords=(Array.isArray(bundle.records)?bundle.records:[]).filter(r=>r?.kind==='shopper');
    const credentialsByProfile=new Map(); let credentialsMapped=0;
    for(const record of credentialRecords){
      const login=norm(record.normalizedLogin||record.loginIdentifier); const legacy=text(record.legacyId||record.legacyShopperId||record.externalShopperId); const candidates=[];
      if(legacy)candidates.push(...(relationIndex.get(legacy)||[]));
      if(login){for(const user of authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]){const sid=text(user.customClaims?.shopperId);if(profiles.has(sid))candidates.push(sid);}}
      const exact=uniq(candidates); if(exact.length===1){credentialsMapped++;if(!credentialsByProfile.has(exact[0]))credentialsByProfile.set(exact[0],[]);credentialsByProfile.get(exact[0]).push(record);}
    }
    const credentialsUnmapped=credentialRecords.length-credentialsMapped;
    if(credentialsMapped!==101||credentialsUnmapped!==8)throw new Error(`CREDENTIAL_CROSSWALK_DRIFT:${credentialsMapped}/${credentialsUnmapped}`);
    const namesByProfile=new Map();
    for(const profile of profiles.values())namesByProfile.set(profile.id,resolveEquivalentNames(profile,linkedByProfile.get(profile.id)||[],credentialsByProfile.get(profile.id)||[]));
    const userByCandidateFp=new Map();
    for(const user of authUsers){const cfp=stableAuthCandidateFingerprint(user.uid);if(userByCandidateFp.has(cfp))throw new Error('AUTH_CANDIDATE_FINGERPRINT_COLLISION');userByCandidateFp.set(cfp,user);}
    const execution=[]; const targetEmails=new Map();
    const gatherCandidates=(profileId,credentials,baseLogin,targetLogin)=>{
      const candidates=[...(authByShopperId.get(profileId)||[])];
      for(const record of credentials){const login=norm(record.normalizedLogin||record.loginIdentifier);if(login)candidates.push(...(authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]));}
      for(const login of [baseLogin,targetLogin])if(login)candidates.push(...(authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]));
      const seen=new Set();return candidates.filter(user=>!seen.has(user.uid)&&seen.add(user.uid));
    };
    for(const planRow of plan.rows){
      const profile=profileByFp.get(planRow.profileFp); const names=namesByProfile.get(profile.id); const credentials=credentialsByProfile.get(profile.id)||[];
      let targetLogin=''; let targetEmail='';
      if(planRow.targetLoginFp){targetLogin=resolveTargetLogin(planRow,names,profile.id,TENANT_ID);targetEmail=internalEmail(targetLogin,'shopper',TENANT_ID);if(targetEmails.has(norm(targetEmail)))throw new Error(`TARGET_EMAIL_DUPLICATE_FINAL:${planRow.profileFp}`);targetEmails.set(norm(targetEmail),planRow.profileFp);}
      let selectedUser=null; let keeperUser=null; let retireUser=null;
      if(planRow.preserveAuthCandidateFingerprint){
        keeperUser=userByCandidateFp.get(planRow.preserveAuthCandidateFingerprint)||null;
        if(!keeperUser)throw new Error(`PRESERVE_CANDIDATE_MISSING:${planRow.profileFp}`);
        if(keeperUser.disabled||!userProviderHasPassword(keeperUser)||!effectiveShopperScope(keeperUser.customClaims||{},profile.id,TENANT_ID,CANONICAL_PROJECT_ID))throw new Error(`PRESERVE_CANDIDATE_SCOPE_DRIFT:${planRow.profileFp}`);
      }
      if(planRow.secondaryAuthDisposition){
        if(planRow.secondaryAuthDisposition.keeperCandidateFingerprint!==contract.tenantAdjudication.keeperCandidateFingerprint||planRow.secondaryAuthDisposition.retireAccessCandidateFingerprint!==contract.tenantAdjudication.retireAccessCandidateFingerprint)throw new Error('DUPLICATE_DISPOSITION_DRIFT');
        keeperUser=userByCandidateFp.get(planRow.secondaryAuthDisposition.keeperCandidateFingerprint)||null;
        retireUser=userByCandidateFp.get(planRow.secondaryAuthDisposition.retireAccessCandidateFingerprint)||null;
        if(!keeperUser||!retireUser||keeperUser.uid===retireUser.uid)throw new Error('DUPLICATE_PAIR_NOT_EXACT');
        if(keeperUser.disabled||retireUser.disabled)throw new Error('DUPLICATE_PAIR_PREWRITE_NOT_BOTH_ENABLED');
        if(!userProviderHasPassword(keeperUser)||!userProviderHasPassword(retireUser)||!effectiveShopperScope(keeperUser.customClaims||{},profile.id)||!effectiveShopperScope(retireUser.customClaims||{},profile.id))throw new Error('DUPLICATE_PAIR_SCOPE_DRIFT');
      }
      if(['CREATE_AUTH','UPDATE_AUTH'].includes(planRow.primary)||(planRow.primary==='NO_OP'&&planRow.targetLoginFp&&!planRow.preserveAuthCandidateFingerprint)){
        if(!names?.complete||!targetLogin||!targetEmail)throw new Error(`TARGET_RECONSTRUCTION_INCOMPLETE:${planRow.profileFp}`);
        const candidates=gatherCandidates(profile.id,credentials,names.baseLogin,targetLogin);
        if(planRow.primary==='CREATE_AUTH'){
          if(candidates.length!==0)throw new Error(`CREATE_AUTH_CANDIDATE_DRIFT:${planRow.profileFp}:${candidates.length}`);
          const owners=authByEmail.get(norm(targetEmail))||[]; if(owners.length)throw new Error(`CREATE_TARGET_EMAIL_COLLISION:${planRow.profileFp}`);
        }else{
          if(candidates.length!==1)throw new Error(`${planRow.primary}_AUTH_CANDIDATE_DRIFT:${planRow.profileFp}:${candidates.length}`);
          selectedUser=candidates[0];
          const emailDiff=norm(selectedUser.email)!==norm(targetEmail); const claimsDiff=!exactClaims(selectedUser.customClaims||{},profile.id,TENANT_ID,CANONICAL_PROJECT_ID);
          if(planRow.primary==='UPDATE_AUTH'){
            if(Boolean(planRow.changes?.email)!==emailDiff||Boolean(planRow.changes?.claims)!==claimsDiff)throw new Error(`UPDATE_CHANGE_FLAG_DRIFT:${planRow.profileFp}`);
            if(!userProviderHasPassword(selectedUser))throw new Error(`UPDATE_PASSWORD_PROVIDER_MISSING:${planRow.profileFp}`);
            const passwordCompatible=await passwordSignInEmail(webConfig.apiKey,selectedUser.email,names.password);
            if(Boolean(planRow.changes?.password)===passwordCompatible)throw new Error(`UPDATE_PASSWORD_FLAG_DRIFT:${planRow.profileFp}`);
          }else {
            if(emailDiff||claimsDiff||Object.values(planRow.changes||{}).some(Boolean))throw new Error(`NO_OP_DRIFT:${planRow.profileFp}`);
            if(!userProviderHasPassword(selectedUser)||!await passwordSignInEmail(webConfig.apiKey,selectedUser.email,names.password))throw new Error(`NO_OP_PASSWORD_DRIFT:${planRow.profileFp}`);
          }
          const owners=authByEmail.get(norm(targetEmail))||[]; if(owners.some(owner=>owner.uid!==selectedUser.uid))throw new Error(`UPDATE_TARGET_EMAIL_COLLISION:${planRow.profileFp}`);
        }
      }
      execution.push({planRow,profileId:profile.id,names,targetLogin,targetEmail,selectedUser,keeperUser,retireUser,desiredClaims:canonicalClaims(profile.id)});
    }
    const fivePreserveNoAuth=execution.filter(x=>x.planRow.primary==='PRESERVE_NO_AUTH'&&['3451d618b5d6307b87da','32e2de62067ab6ecfb7b','b31bdc0c7514acbe25ba','4a59de15805804cbe398','cfbd0c519e59f40c6239'].includes(x.planRow.profileFp));
    for(const x of fivePreserveNoAuth){const effective=(authByShopperId.get(x.profileId)||[]).filter(user=>effectiveShopperScope(user.customClaims||{},x.profileId)&&!user.disabled&&userProviderHasPassword(user));if(effective.length)throw new Error(`PRESERVE_NO_AUTH_EFFECTIVE_ACCESS_DRIFT:${x.planRow.profileFp}`);}
    const updateRows=execution.filter(x=>x.planRow.primary==='UPDATE_AUTH'); const createRows=execution.filter(x=>x.planRow.primary==='CREATE_AUTH'); const passwordUpdates=updateRows.filter(x=>x.planRow.changes?.password===true);
    if(updateRows.length!==46||createRows.length!==81||passwordUpdates.length!==14)throw new Error('EXECUTION_CARDINALITY_DRIFT');
    const special=execution.find(x=>x.planRow.profileFp===contract.tenantAdjudication.profileFingerprint); if(!special?.keeperUser||!special?.retireUser)throw new Error('SPECIAL_ADJUDICATION_NOT_RESOLVED');
    const snapshotUsers=new Map(); for(const x of updateRows)snapshotUsers.set(x.selectedUser.uid,x.selectedUser); snapshotUsers.set(special.keeperUser.uid,special.keeperUser); snapshotUsers.set(special.retireUser.uid,special.retireUser);
    for(const x of passwordUpdates){const hash=asBase64(x.selectedUser.passwordHash);const salt=asBase64(x.selectedUser.passwordSalt);if(!hash||!salt)throw new Error(`PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:${x.planRow.profileFp}`);}
    const hashConfig=await fetchHashConfig(credential,EXPECTED_FIREBASE_PROJECT);
    const membershipSnapshots=[];
    for(const user of snapshotUsers.values()){
      const snap=await tenantRef.collection('users').doc(user.uid).get();
      membershipSnapshots.push({uid:user.uid,exists:snap.exists,data:snap.exists?snap.data():null});
    }
    const snapshotPayload={schemaVersion:'cxorbia.c6.auth-activation-dev.rollback-snapshot.v1',generatedAt:new Date().toISOString(),requestId:request.requestId,projectId:EXPECTED_FIREBASE_PROJECT,planDigest:plan.plan.sourceSafeRowsDigestSha256,hashConfig,users:[...snapshotUsers.values()].map(snapshotUser),memberships:membershipSnapshots};
    const snapshotEnvelope=encryptEnvelope(snapshotPayload,serviceAccount.private_key,'c6-auth-activation-dev-prewrite-snapshot-v1');
    const snapshotPath=path.join(exportDir,'rollback-snapshot-prewrite.enc.json'); fs.writeFileSync(snapshotPath,JSON.stringify(snapshotEnvelope,null,2)+'\n','utf8');
    const decryptedCheck=decryptEnvelope(snapshotEnvelope,serviceAccount.private_key); if(decryptedCheck.users.length!==snapshotUsers.size||decryptedCheck.memberships.length!==snapshotUsers.size)throw new Error('SNAPSHOT_ENCRYPTION_READBACK_FAILED');
    sourceSafe.prewrite={pass:true,authUsersBefore:authUsers.length,shopperProfiles:profiles.size,credentialsMapped,credentialsUnmapped,planRows:plan.rows.length,planDigest:plan.plan.sourceSafeRowsDigestSha256,createRows:createRows.length,updateRows:updateRows.length,passwordUpdateRows:passwordUpdates.length,snapshotUsers:snapshotUsers.size,membershipPointReads:snapshotUsers.size,hashConfigReadable:true,encryptedSnapshotDigest:sha256(fs.readFileSync(snapshotPath)),duplicatePairExact:true};
    decision='PASS_C6_AUTH_ACTIVATION_DEV_PREWRITE';
    fs.writeFileSync(path.join(exportDir,'prewrite-source-safe.json'),JSON.stringify(sourceSafe.prewrite,null,2)+'\n','utf8');
    fs.writeFileSync(path.join(exportDir,'decision-prewrite.txt'),decision+'\n','utf8');

    // WRITE BOUNDARY: only after every prewrite circuit breaker has passed and encrypted snapshot is durable.
    state.writeBoundaryEntered=true;
    const created=[];
    const persistCreatedRollbackJournal=()=>{
      const payload={schemaVersion:'cxorbia.c6.auth-activation-dev.created-rollback-journal.v1',generatedAt:new Date().toISOString(),requestId:request.requestId,createdUsers:created.map(x=>({uid:x.uid,profileId:x.profileId,targetEmail:x.targetEmail}))};
      const envelope=encryptEnvelope(payload,serviceAccount.private_key,'c6-auth-activation-dev-created-users-v1');
      fs.writeFileSync(path.join(exportDir,'rollback-created-users.enc.json'),JSON.stringify(envelope,null,2)+'\n','utf8');
      return envelope;
    };
    let createdEnvelope=persistCreatedRollbackJournal();
    for(const x of createRows){
      const createdUser=await auth.createUser({email:x.targetEmail,password:x.names.password,emailVerified:true,disabled:false});
      state.authCreates++; state.providerWrites++; created.push({uid:createdUser.uid,profileId:x.profileId,targetEmail:x.targetEmail});
      createdEnvelope=persistCreatedRollbackJournal();
      await auth.setCustomUserClaims(createdUser.uid,x.desiredClaims); state.providerWrites++;
    }
    for(const x of updateRows){
      const update={}; if(x.planRow.changes.email)update.email=x.targetEmail; if(x.planRow.changes.password)update.password=x.names.password;
      if(Object.keys(update).length){await auth.updateUser(x.selectedUser.uid,update);state.providerWrites++;}
      if(x.planRow.changes.claims){await auth.setCustomUserClaims(x.selectedUser.uid,x.desiredClaims);state.providerWrites++;}
      state.authUpdates++;
    }
    await auth.updateUser(special.retireUser.uid,{disabled:true}); state.providerWrites++; state.duplicateDisables=1;
    const afterUsers=await listAllUsers(auth); if(afterUsers.length!==Number(contract.readback.expectedAuthUsersAfter))throw new Error(`READBACK_AUTH_POPULATION:${afterUsers.length}`);
    const afterByEmail=new Map(); const afterByCandidateFp=new Map(); for(const u of afterUsers){if(u.email)add(afterByEmail,norm(u.email),u);afterByCandidateFp.set(stableAuthCandidateFingerprint(u.uid),u);}
    let createReadback=0,updateReadback=0,passwordReadback=0;
    for(const x of createRows){const users=afterByEmail.get(norm(x.targetEmail))||[];if(users.length!==1)throw new Error(`READBACK_CREATE_EMAIL:${x.planRow.profileFp}:${users.length}`);const u=users[0];if(u.disabled||!exactClaims(u.customClaims||{},x.profileId))throw new Error(`READBACK_CREATE_SCOPE:${x.planRow.profileFp}`);if(!await passwordSignInEmail(webConfig.apiKey,u.email,x.names.password))throw new Error(`READBACK_CREATE_PASSWORD:${x.planRow.profileFp}`);createReadback++;passwordReadback++;}
    for(const x of updateRows){const u=await auth.getUser(x.selectedUser.uid);if(norm(u.email)!==norm(x.targetEmail)||u.disabled||!exactClaims(u.customClaims||{},x.profileId))throw new Error(`READBACK_UPDATE_SCOPE:${x.planRow.profileFp}`);if(x.planRow.changes.password){if(!await passwordSignInEmail(webConfig.apiKey,u.email,x.names.password))throw new Error(`READBACK_UPDATE_PASSWORD:${x.planRow.profileFp}`);passwordReadback++;}updateReadback++;}
    const keeperAfter=afterByCandidateFp.get(contract.tenantAdjudication.keeperCandidateFingerprint); const retireAfter=afterByCandidateFp.get(contract.tenantAdjudication.retireAccessCandidateFingerprint);
    if(!keeperAfter||keeperAfter.disabled||!retireAfter||!retireAfter.disabled)throw new Error('READBACK_DUPLICATE_DISPOSITION_FAILED');
    sourceSafe.writes={writeBoundaryEntered:true,authCreates:state.authCreates,authUpdates:state.authUpdates,duplicateDisables:state.duplicateDisables,providerWriteCalls:state.providerWrites,membershipWrites:0,firestoreWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,cloudBuilds:0,cloudRunDeploys:0,hostingDeploys:0};
    sourceSafe.readback={pass:true,authUsersAfter:afterUsers.length,createdValidated:createReadback,updatesValidated:updateReadback,passwordSignInsValidated:passwordReadback,keeperActive:true,duplicateDisabled:true};
    const createdDecrypted=decryptEnvelope(createdEnvelope,serviceAccount.private_key); const snapshotDecrypted=decryptEnvelope(snapshotEnvelope,serviceAccount.private_key);
    const passwordRestoreEntries=snapshotDecrypted.users.filter(u=>passwordUpdates.some(x=>x.selectedUser.uid===u.uid)&&u.passwordHash&&u.passwordSalt).length;
    if(createdDecrypted.createdUsers.length!==81||passwordRestoreEntries!==14)throw new Error('ROLLBACK_DRY_RUN_CARDINALITY_MISMATCH');
    sourceSafe.rollbackDryRun={pass:true,realRollbackExecuted:false,deleteCreatedCount:createdDecrypted.createdUsers.length,restoreExistingUserCount:snapshotDecrypted.users.length,passwordHashRestoreEntries:passwordRestoreEntries,membershipSnapshots:snapshotDecrypted.memberships.length,hashConfigPresent:Boolean(snapshotDecrypted.hashConfig),encryptedPayloadsDecryptAndDigestVerify:true};
    decision='PASS_C6_AUTH_ACTIVATION_DEV';
  }catch(error){
    sourceSafe.error=safeError(error);
    decision=state.writeBoundaryEntered?'HOLD_C6_AUTH_ACTIVATION_DEV_POSTWRITE_STOP_RETRY':'STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE';
  }finally{
    sourceSafe.decision=decision;
    sourceSafe.safety={writeBoundaryEntered:state.writeBoundaryEntered,authCreates:state.authCreates,authUpdates:state.authUpdates,duplicateDisables:state.duplicateDisables,providerWriteCalls:state.providerWrites,realRollbackExecuted:false,firestoreWrites:0,membershipWrites:0,rulesWrites:0,storageWrites:0,hrWrites:0,cloudBuilds:0,cloudRunDeploys:0,hostingDeploys:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,rawUidExported:false,rawEmailExported:false,rawPasswordExported:false,rawShopperIdExported:false,rawClaimsExported:false};
    fs.writeFileSync(path.join(exportDir,'report-source-safe.json'),JSON.stringify(sourceSafe,null,2)+'\n','utf8');
    fs.writeFileSync(path.join(exportDir,'rollback-dry-run-source-safe.json'),JSON.stringify(sourceSafe.rollbackDryRun||{},null,2)+'\n','utf8');
    fs.writeFileSync(path.join(exportDir,'decision.txt'),decision+'\n','utf8');
    try{fs.rmSync(privateDir,{recursive:true,force:true});}catch{}
    console.log(decision);
    if(decision!=='PASS_C6_AUTH_ACTIVATION_DEV')process.exitCode=2;
  }
}

await main();
