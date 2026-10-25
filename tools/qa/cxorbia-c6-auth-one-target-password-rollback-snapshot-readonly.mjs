#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import { fingerprint, text } from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import { stableAuthCandidateFingerprint } from './cxorbia-c6-shopper-equivalent-universe.mjs';

const TARGET_PROFILE_FP='ac93d90d9e41512acdcd';
const EXPECTED_PROJECT='cxorbia-backend-dev';
const EXPECTED_PLAN_DIGEST='acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92';
const EXPECTED_FINAL_DIGEST='68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3';
const requestPath=process.argv[2]||'backend/config/c6-auth-one-target-password-rollback-snapshot-readonly-request-v1.json';
const sourcePlanPath=process.env.CXORBIA_SOURCE_PLAN||'.tmp/c6-auth-one-target-password-rollback/source/plan-340-source-safe.json';
const outDir=process.env.CXORBIA_ONE_TARGET_ROLLBACK_OUT||'.tmp/c6-auth-one-target-password-rollback/export';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const freezePath='backend/config/c6-shopper-auth-final-freeze-v2.json';
const contractPath='backend/contracts/c6-auth-activation-dev-v1.json';
const importerPath='tools/release/cxorbia-corte6-credential-import.mjs';

const ensure=(v,c)=>{if(!v)throw new Error(c)};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha256=value=>crypto.createHash('sha256').update(Buffer.isBuffer(value)?value:Buffer.from(String(value),'utf8')).digest('hex');
const stablePlanProfileFingerprint=profileId=>fingerprint(`deterministic-suffix-plan-profile\0${profileId}`);
const asBuffer=value=>Buffer.isBuffer(value)?value:(value==null?Buffer.alloc(0):Buffer.from(String(value),'base64'));
const safeError=error=>String(error?.message||error).replace(/[^A-Za-z0-9_.:,/+-]+/g,'_').slice(0,320);

function classifySalt(user){
  const owns=Object.prototype.hasOwnProperty.call(user,'passwordSalt');
  if(!owns||typeof user.passwordSalt==='undefined')return {state:'NOT_EXPOSED',bytes:0,value:null};
  if(user.passwordSalt===null)return {state:'EXPLICIT_NULL',bytes:0,value:null};
  const buf=asBuffer(user.passwordSalt);
  if(buf.length===0)return {state:'EXPLICIT_EMPTY',bytes:0,value:buf};
  return {state:'PRESENT_NONEMPTY',bytes:buf.length,value:buf};
}

function normalizeHashConfig(raw){
  const cfg=raw?.hashConfig||raw?.hash_config||raw||{};
  const algorithm=String(cfg.algorithm||cfg.hashAlgorithm||cfg.hash_algorithm||'').toUpperCase();
  const rounds=Number(cfg.rounds??cfg.roundCount??cfg.round_count??0);
  const memoryCost=Number(cfg.memoryCost??cfg.memory_cost??0);
  const parallelization=Number(cfg.parallelization??0);
  const blockSize=Number(cfg.blockSize??cfg.block_size??0);
  const derivedKeyLength=Number(cfg.derivedKeyLength??cfg.dkLen??cfg.dk_len??0);
  return {raw:cfg,algorithm,rounds,memoryCost,parallelization,blockSize,derivedKeyLength};
}

async function fetchHashConfig(credential){
  const token=await credential.getAccessToken();
  const accessToken=token?.access_token||token?.accessToken;
  ensure(accessToken,'HASH_CONFIG_ACCESS_TOKEN_MISSING');
  const response=await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${EXPECTED_PROJECT}/config?mask=hashConfig`,{
    headers:{authorization:`Bearer ${accessToken}`,'cache-control':'no-cache'}
  });
  ensure(response.ok,`HASH_CONFIG_HTTP_${response.status}`);
  const body=await response.json();
  const cfg=normalizeHashConfig(body);
  ensure(cfg.algorithm,'HASH_CONFIG_ALGORITHM_MISSING');
  return cfg;
}

function encryptEnvelope(payload,privateKey){
  const context='c6-auth-one-target-password-rollback-snapshot-v1';
  const salt=crypto.randomBytes(32),iv=crypto.randomBytes(12);
  const key=crypto.hkdfSync('sha256',Buffer.from(privateKey,'utf8'),salt,Buffer.from(context,'utf8'),32);
  const aad=Buffer.from(context,'utf8');
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
  const plaintext=Buffer.from(JSON.stringify(payload),'utf8');
  const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  const tag=cipher.getAuthTag();
  return {schemaVersion:'cxorbia.encrypted-envelope.v1',algorithm:'AES-256-GCM',kdf:'HKDF-SHA256',context,aad:aad.toString('base64'),saltBase64:salt.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:tag.toString('base64'),ciphertextBase64:ciphertext.toString('base64'),plaintextSha256:sha256(plaintext)};
}

function decryptEnvelope(envelope,privateKey){
  const salt=Buffer.from(envelope.saltBase64,'base64'),iv=Buffer.from(envelope.ivBase64,'base64');
  const key=crypto.hkdfSync('sha256',Buffer.from(privateKey,'utf8'),salt,Buffer.from(envelope.context,'utf8'),32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);decipher.setAAD(Buffer.from(envelope.aad,'base64'));decipher.setAuthTag(Buffer.from(envelope.tagBase64,'base64'));
  const plaintext=Buffer.concat([decipher.update(Buffer.from(envelope.ciphertextBase64,'base64')),decipher.final()]);
  ensure(sha256(plaintext)===envelope.plaintextSha256,'SNAPSHOT_ENVELOPE_DIGEST_MISMATCH');
  return JSON.parse(plaintext.toString('utf8'));
}

function sourceRestorePrimitiveValidated(){
  const source=fs.readFileSync(importerPath,'utf8');
  return source.includes('auth.importUsers(records')&&source.includes('Firebase importUsers can replace a colliding UID')&&source.includes("passwordHash:Buffer.from(r.passwordHashHex,'hex')");
}

async function main(){
  fs.mkdirSync(outDir,{recursive:true});
  let decision='STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_TECHNICAL';
  let evidence=null;
  let providerReadCalls=0;
  try{
    for(const p of [requestPath,sourcePlanPath,credentialPath,freezePath,contractPath,importerPath])ensure(p&&fs.existsSync(p),`REQUIRED_FILE_MISSING:${p||'undefined'}`);
    const request=readJson(requestPath),plan=readJson(sourcePlanPath),freeze=readJson(freezePath),contract=readJson(contractPath),sa=readJson(credentialPath);
    ensure(request.schemaVersion==='cxorbia.c6.auth-one-target-password-rollback-snapshot-readonly.request.v1','REQUEST_SCHEMA');
    ensure(request.enabled===true&&request.consumed===false&&request.status==='authorized_execute_once'&&Number(request.allowedExecutions)===1&&request.authorizedBy==='Paula','REQUEST_NOT_AUTHORIZED');
    ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&Number(request.pullRequest)===7,'REQUEST_LANE');
    ensure(request.firebaseProjectId===EXPECTED_PROJECT&&request.targetProfileFingerprint===TARGET_PROFILE_FP,'REQUEST_TARGET');
    ensure(Array.isArray(plan)&&plan.length===340&&new Set(plan.map(r=>r.profileFp)).size===340,'SOURCE_PLAN_340');
    ensure(sha256(JSON.stringify(plan))===EXPECTED_PLAN_DIGEST,'SOURCE_PLAN_DIGEST');
    ensure(freeze.finalPlan?.compactRowsDigestSha256===EXPECTED_FINAL_DIGEST&&freeze.finalPlan?.operationCounts?.HOLD===0,'FREEZE_DRIFT');
    ensure(contract.prewrite?.passwordRollbackHardStop===true,'PREWRITE_HARDSTOP_DRIFT');
    const targetRow=plan.find(r=>r.profileFp===TARGET_PROFILE_FP);
    ensure(targetRow?.primary==='UPDATE_AUTH'&&targetRow?.changes?.password===true,'TARGET_PLAN_ROW');
    ensure(sa.project_id===EXPECTED_PROJECT&&typeof sa.private_key==='string','SERVICE_ACCOUNT_TARGET');
    ensure(sourceRestorePrimitiveValidated(),'RESTORE_PRIMITIVE_SOURCE_NOT_VALIDATED');

    if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED_PROJECT});
    const auth=admin.auth();
    const page=await auth.listUsers(1000);providerReadCalls++;
    ensure(!page.pageToken,'AUTH_DIRECTORY_MORE_THAN_ONE_PAGE_STOP');
    const matches=[];
    for(const user of page.users){
      const shopperId=text(user.customClaims?.shopperId);
      if(shopperId&&stablePlanProfileFingerprint(shopperId)===TARGET_PROFILE_FP)matches.push(user);
    }
    ensure(matches.length===1,`TARGET_AUTH_RESOLUTION_COUNT_${matches.length}`);
    const user=matches[0];
    ensure((user.providerData||[]).some(p=>p.providerId==='password')||Boolean(user.email),'TARGET_PASSWORD_PROVIDER_MISSING');

    const passwordHashBuffer=asBuffer(user.passwordHash);
    const hashAvailable=passwordHashBuffer.length>0;
    const salt=classifySalt(user);
    const hashConfig=await fetchHashConfig(admin.credential.cert(sa));providerReadCalls++;
    const unsaltedSha256Allowed=hashConfig.algorithm==='SHA256'&&Number(hashConfig.rounds||1)===1;
    const saltExactAvailable=salt.state==='PRESENT_NONEMPTY'||((salt.state==='EXPLICIT_EMPTY'||salt.state==='EXPLICIT_NULL')&&unsaltedSha256Allowed);
    const currentPriorPasswordStateProven=hashAvailable&&saltExactAvailable&&Boolean(hashConfig.algorithm);
    const exactRollbackReconstructible=currentPriorPasswordStateProven&&sourceRestorePrimitiveValidated();

    const snapshotPayload={
      schemaVersion:'cxorbia.c6.auth-one-target-password-rollback.snapshot.v1',generatedAt:new Date().toISOString(),projectId:EXPECTED_PROJECT,
      target:{uid:user.uid,email:user.email||null,emailVerified:Boolean(user.emailVerified),disabled:Boolean(user.disabled),customClaims:user.customClaims||null,providerData:(user.providerData||[]).map(p=>({providerId:p.providerId||null,uid:p.uid||null,email:p.email||null,displayName:p.displayName||null,photoURL:p.photoURL||null,phoneNumber:p.phoneNumber||null})),passwordHashBase64:hashAvailable?passwordHashBuffer.toString('base64'):null,passwordSaltState:salt.state,passwordSaltBase64:salt.state==='PRESENT_NONEMPTY'?salt.value.toString('base64'):(salt.state==='EXPLICIT_EMPTY'?'':null)},
      hashConfig:hashConfig.raw,
      restoration:{primitive:'FirebaseAuthImportUsersSameUid',sourceValidated:true,exactRollbackReconstructible}
    };
    const envelope=encryptEnvelope(snapshotPayload,sa.private_key);
    const encryptedPath=path.join(outDir,'rollback-snapshot-target.enc.json');
    fs.writeFileSync(encryptedPath,JSON.stringify(envelope,null,2)+'\n','utf8');
    const decrypted=decryptEnvelope(envelope,sa.private_key);
    ensure(decrypted.target.uid===user.uid,'SNAPSHOT_TARGET_ROUNDTRIP');
    ensure(decrypted.target.passwordHashBase64===snapshotPayload.target.passwordHashBase64,'SNAPSHOT_HASH_ROUNDTRIP');
    ensure(decrypted.target.passwordSaltState===salt.state,'SNAPSHOT_SALT_STATE_ROUNDTRIP');

    decision=exactRollbackReconstructible?'PASS_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_EXACT_REVERSIBILITY':'STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_EXACT_REVERSIBILITY_NOT_PROVEN';
    evidence={
      schemaVersion:'cxorbia.c6.auth-one-target-password-rollback-snapshot-readonly.evidence.v1',generatedAt:new Date().toISOString(),decision,
      repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',pullRequest:7,
      target:{profileFingerprint:TARGET_PROFILE_FP,authCandidateFingerprint:stableAuthCandidateFingerprint(user.uid),resolvedAuthTargetCount:1,planClass:targetRow.primary,passwordChange:true},
      lineage:{sourcePlanRows:340,sourcePlanDigest:EXPECTED_PLAN_DIGEST,finalPlanDigest:EXPECTED_FINAL_DIGEST,prewriteHardStopPreserved:true},
      providerRead:{authDirectoryPages:1,authDirectoryRecordsScanned:page.users.length,targetRecordsRetained:1,hashConfigReads:1,totalProviderReadCalls:providerReadCalls,firestoreReads:0,hrReads:0},
      passwordState:{passwordHashAvailable:hashAvailable,passwordHashBytes:passwordHashBuffer.length,passwordSaltState:salt.state,passwordSaltBytes:salt.bytes,hashConfigReadable:true,algorithm:hashConfig.algorithm,rounds:hashConfig.rounds,memoryCostPresent:hashConfig.memoryCost>0,parallelizationPresent:hashConfig.parallelization>0,blockSizePresent:hashConfig.blockSize>0,derivedKeyLengthPresent:hashConfig.derivedKeyLength>0,unsaltedSha256Allowed,saltExactAvailable,currentPriorPasswordStateProven},
      snapshot:{encrypted:true,algorithm:'AES-256-GCM',kdf:'HKDF-SHA256',roundTripPass:true,encryptedArtifactFile:'rollback-snapshot-target.enc.json',encryptedArtifactSha256:sha256(fs.readFileSync(encryptedPath)),plaintextDigestRecordedInsideEnvelope:true,rawValuesInEvidence:false},
      restoration:{restorePrimitiveSourceValidated:true,primitive:'FirebaseAuthImportUsersSameUid',exactRollbackReconstructible,contractMutationAuthorized:false,authActivationExecuted:false},
      safety:{providerWrites:0,authWrites:0,firestoreReads:0,firestoreWrites:0,hrReads:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,cloudBuilds:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,uidExportedInEvidence:false,emailExportedInEvidence:false,loginExportedInEvidence:false,passwordExported:false,passwordHashExportedInEvidence:false,passwordSaltExportedInEvidence:false,piiExportedInEvidence:false}
    };
  }catch(error){
    evidence={schemaVersion:'cxorbia.c6.auth-one-target-password-rollback-snapshot-readonly.evidence.v1',generatedAt:new Date().toISOString(),decision,error:safeError(error),target:{profileFingerprint:TARGET_PROFILE_FP},providerRead:{totalProviderReadCalls:providerReadCalls,firestoreReads:0,hrReads:0},safety:{providerWrites:0,authWrites:0,firestoreReads:0,firestoreWrites:0,hrReads:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,cloudBuilds:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,uidExportedInEvidence:false,emailExportedInEvidence:false,loginExportedInEvidence:false,passwordExported:false,passwordHashExportedInEvidence:false,passwordSaltExportedInEvidence:false,piiExportedInEvidence:false}};
  }finally{
    fs.writeFileSync(path.join(outDir,'evidence-source-safe.json'),JSON.stringify(evidence,null,2)+'\n','utf8');
    fs.writeFileSync(path.join(outDir,'decision.txt'),decision+'\n','utf8');
    console.log(decision);
    console.log(JSON.stringify({providerReadCalls:evidence?.providerRead?.totalProviderReadCalls??providerReadCalls,targetRecordsRetained:evidence?.providerRead?.targetRecordsRetained??0,hashAvailable:evidence?.passwordState?.passwordHashAvailable??false,saltState:evidence?.passwordState?.passwordSaltState??'UNKNOWN',hashAlgorithm:evidence?.passwordState?.algorithm??'UNKNOWN',exactRollbackReconstructible:evidence?.restoration?.exactRollbackReconstructible??false,providerWrites:0,authWrites:0,firestoreReads:0,hrReads:0}));
    if(!decision.startsWith('PASS_'))process.exitCode=2;
  }
}

await main();
