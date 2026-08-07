#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import {decryptCredentialBundle} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

const TARGET_PROFILE_FP='ac93d90d9e41512acdcd';
const EXPECTED_PROJECT='cxorbia-backend-dev';
const TENANT_ID='tya';
const PLAN_PROFILE_NS='deterministic-suffix-plan-profile';
const AUTH_CANDIDATE_NS='shopper-auth-candidate-v1';
const sourcePlanPath=process.env.CXORBIA_SOURCE_PLAN||'.tmp/c6-auth-one-target-resolver-password/source/plan-340-source-safe.json';
const outDir=process.env.CXORBIA_ONE_TARGET_RESOLVER_OUT||'.tmp/c6-auth-one-target-resolver-password/export';
const requestPath=process.argv[2]||'backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v1.json';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

const text=v=>String(v??'').trim();
const norm=v=>text(v).toLowerCase();
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const fp=(ns,v)=>sha(`${ns}\0${String(v)}`).slice(0,20);
const profileFp=id=>fp(PLAN_PROFILE_NS,id);
const candidateFp=uid=>fp(AUTH_CANDIDATE_NS,uid);
const baseLoginFp=login=>fp('base-login',login);
const targetLoginFp=login=>fp('target-login',login);
const internalEmail=login=>sha(`${TENANT_ID}\0shopper\0${norm(login)}`).slice(0,48)+'@auth.cxorbia.invalid';
const deterministicSuffix=(shopperId,length)=>sha(`${TENANT_ID}\0${shopperId}`).slice(0,length);
const ensure=(v,c)=>{if(!v)throw new Error(c)};
const uniq=a=>[...new Set(a.filter(Boolean))];
const LEGACY_KEYS=['legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey'];
const USERNAME_KEYS=['username','userName','usuario','login','loginIdentifier','normalizedLogin'];
const rawHashBytes=v=>v==null?Buffer.alloc(0):(Buffer.isBuffer(v)?v:Buffer.from(String(v),'base64'));
const safeCode=e=>String(e?.message||e).replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,180);

function encryptEnvelope(payload,privateKey){
  const context='c6-auth-one-target-password-rollback-snapshot-v1';
  const salt=crypto.randomBytes(32),iv=crypto.randomBytes(12);
  const key=crypto.hkdfSync('sha256',Buffer.from(privateKey,'utf8'),salt,Buffer.from(context,'utf8'),32);
  const aad=Buffer.from(`cxorbia|${EXPECTED_PROJECT}|${TARGET_PROFILE_FP}|${context}`,'utf8');
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
  const plain=Buffer.from(JSON.stringify(payload),'utf8');
  const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]);
  return {schemaVersion:'cxorbia.encrypted-envelope.v1',algorithm:'AES-256-GCM',kdf:'HKDF-SHA256',context,aad:aad.toString('base64'),saltBase64:salt.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:cipher.getAuthTag().toString('base64'),ciphertextBase64:ciphertext.toString('base64'),plaintextSha256:sha(plain)};
}
function decryptEnvelope(env,privateKey){
  const key=crypto.hkdfSync('sha256',Buffer.from(privateKey,'utf8'),Buffer.from(env.saltBase64,'base64'),Buffer.from(env.context,'utf8'),32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(env.ivBase64,'base64'));decipher.setAAD(Buffer.from(env.aad,'base64'));decipher.setAuthTag(Buffer.from(env.tagBase64,'base64'));
  const plain=Buffer.concat([decipher.update(Buffer.from(env.ciphertextBase64,'base64')),decipher.final()]);
  ensure(sha(plain)===env.plaintextSha256,'SNAPSHOT_DIGEST_MISMATCH');
  return JSON.parse(plain.toString('utf8'));
}
async function fetchHashConfig(credential){
  const token=await credential.getAccessToken();
  const accessToken=token?.access_token||token?.accessToken;
  ensure(accessToken,'HASH_CONFIG_ACCESS_TOKEN_MISSING');
  const response=await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${EXPECTED_PROJECT}/config?mask=hashConfig`,{headers:{authorization:`Bearer ${accessToken}`,'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`HASH_CONFIG_HTTP_${response.status}`);
  const body=await response.json();
  const cfg=body?.hashConfig||body?.hash_config;
  ensure(cfg&&typeof cfg==='object'&&Object.keys(cfg).length>0,'HASH_CONFIG_EMPTY');
  return cfg;
}
function hashAlgorithmOf(cfg){return text(cfg?.hashAlgorithm||cfg?.algorithm||cfg?.hash_algorithm||'UNKNOWN').toUpperCase();}
function providerConfigSufficient(cfg){
  const alg=hashAlgorithmOf(cfg);
  if(!alg||alg==='UNKNOWN')return false;
  if(alg==='SCRYPT')return Boolean(cfg.signerKey||cfg.signer_key)&&Object.hasOwn(cfg,'rounds')&&Object.hasOwn(cfg,'memoryCost')||Object.hasOwn(cfg,'memory_cost');
  return true;
}

fs.mkdirSync(outDir,{recursive:true});
let evidence={schemaVersion:'cxorbia.c6.auth-one-target-resolver-password-snapshot-readonly.evidence.v1',generatedAt:new Date().toISOString(),decision:null,target:{profileFingerprint:TARGET_PROFILE_FP},resolution:{},passwordState:{},restoration:{},providerRead:{authDirectoryPages:0,shopperIndexQueries:0,shopperDocumentsRead:0,hashConfigReads:0},snapshot:{created:false},safety:{providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,cloudBuilds:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,rawUidExported:false,rawEmailExported:false,rawLoginExported:false,rawPasswordExported:false,rawPasswordHashExported:false,rawPasswordSaltExported:false,piiExported:false}};
let decision='STOP_RETRY_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_TECHNICAL';
try{
  ensure(fs.existsSync(requestPath),'REQUEST_MISSING');
  ensure(fs.existsSync(sourcePlanPath),'SOURCE_PLAN_MISSING');
  ensure(credentialPath&&fs.existsSync(credentialPath),'SERVICE_ACCOUNT_MISSING');
  const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
  ensure(request.schemaVersion==='cxorbia.c6.auth-one-target-resolver-password-snapshot-readonly.request.v1'&&request.enabled===true&&request.consumed===false&&request.authorizedBy==='Paula'&&Number(request.allowedExecutions)===1,'REQUEST_INVALID');
  ensure(request.firebaseProjectId===EXPECTED_PROJECT&&request.targetProfileFingerprint===TARGET_PROFILE_FP,'REQUEST_TARGET_INVALID');
  const plan=JSON.parse(fs.readFileSync(sourcePlanPath,'utf8'));
  ensure(Array.isArray(plan)&&plan.length===340&&new Set(plan.map(r=>r.profileFp)).size===340,'SOURCE_PLAN_340_UNIQUE_REQUIRED');
  ensure(sha(JSON.stringify(plan))===request.sourcePlanDigestSha256,'SOURCE_PLAN_DIGEST_MISMATCH');
  const targetRow=plan.find(r=>r.profileFp===TARGET_PROFILE_FP);
  ensure(targetRow&&targetRow.primary==='UPDATE_AUTH'&&targetRow.changes?.email===true&&targetRow.changes?.password===true&&targetRow.changes?.claims===true,'TARGET_PLAN_VECTOR_DRIFT');
  ensure(plan.filter(r=>r.targetLoginFp&&r.targetLoginFp===targetRow.targetLoginFp).length===1,'TARGET_LOGIN_FP_NOT_UNIQUE_IN_PLAN');

  const serviceAccount=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
  ensure(serviceAccount.project_id===EXPECTED_PROJECT&&serviceAccount.private_key,'SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const credential=admin.credential.cert(serviceAccount);
  if(!admin.apps.length)admin.initializeApp({credential,projectId:EXPECTED_PROJECT});
  const auth=admin.auth(),db=admin.firestore();

  const shopperSnap=await db.collection('tenants').doc(TENANT_ID).collection('shoppers').select(...LEGACY_KEYS,...USERNAME_KEYS).get();
  evidence.providerRead.shopperIndexQueries=1;evidence.providerRead.shopperDocumentsRead=shopperSnap.docs.length;
  ensure(shopperSnap.docs.length===340,'SHOPPER_POPULATION_DRIFT');
  const docs=shopperSnap.docs.map(d=>({id:d.id,...(d.data()||{})}));
  const targetProfiles=docs.filter(d=>profileFp(d.id)===TARGET_PROFILE_FP);
  ensure(targetProfiles.length===1,`TARGET_PROFILE_RESOLUTION_COUNT_${targetProfiles.length}`);
  const targetProfile=targetProfiles[0];
  const targetTechnicalIds=new Set([targetProfile.id,...LEGACY_KEYS.map(k=>text(targetProfile[k]))].filter(Boolean));
  const targetProfileLogins=uniq(USERNAME_KEYS.map(k=>norm(targetProfile[k])));

  const legacyIndex=new Map();
  for(const d of docs){for(const raw of [d.id,...LEGACY_KEYS.map(k=>text(d[k]))]){const k=text(raw);if(!k)continue;if(!legacyIndex.has(k))legacyIndex.set(k,[]);legacyIndex.get(k).push(d.id);}}

  const bundle=decryptCredentialBundle({serviceAccount});
  const shopperRecords=(Array.isArray(bundle.records)?bundle.records:[]).filter(r=>r?.kind==='shopper');
  const matchingRecords=shopperRecords.filter(r=>{
    const legacy=text(r.legacyId||r.legacyShopperId||r.externalShopperId||r.externalId||r.sourceId||r.sourceKey);
    const login=norm(r.normalizedLogin||r.loginIdentifier);
    return (legacy&&targetTechnicalIds.has(legacy))||(login&&targetProfileLogins.includes(login));
  });
  const credentialLogins=uniq(matchingRecords.map(r=>norm(r.normalizedLogin||r.loginIdentifier)));
  ensure(credentialLogins.length>=1,'TARGET_CREDENTIAL_LOGIN_ANCHOR_MISSING');
  const baseCandidates=uniq([...credentialLogins,...targetProfileLogins]).filter(login=>baseLoginFp(login)===targetRow.baseLoginFp);
  const targetLoginCandidates=[];
  for(const base of baseCandidates){for(const length of [4,6,8]){const login=`${base}.${deterministicSuffix(targetProfile.id,length)}`;if(targetLoginFp(login)===targetRow.targetLoginFp)targetLoginCandidates.push(login);}}
  const exactTargetLogins=uniq(targetLoginCandidates);
  ensure(exactTargetLogins.length<=1,'TARGET_LOGIN_RECONSTRUCTION_AMBIGUOUS');
  const emailAnchors=new Map();
  for(const login of credentialLogins)emailAnchors.set(norm(internalEmail(login)),'credential_login');
  for(const login of targetProfileLogins)emailAnchors.set(norm(internalEmail(login)),'profile_login');
  for(const login of exactTargetLogins)emailAnchors.set(norm(internalEmail(login)),'final_target_login');

  const page=await auth.listUsers(1000);evidence.providerRead.authDirectoryPages=1;
  ensure(!page.pageToken,'AUTH_DIRECTORY_EXCEEDS_ONE_PAGE_BUDGET');
  const candidates=page.users.filter(u=>emailAnchors.has(norm(u.email))||text(u.customClaims?.shopperId)===targetProfile.id);
  const byUid=new Map(candidates.map(u=>[u.uid,u]));
  const uniqueCandidates=[...byUid.values()];
  evidence.resolution.candidateCount=uniqueCandidates.length;
  ensure(uniqueCandidates.length===1,`TARGET_AUTH_CANDIDATE_COUNT_${uniqueCandidates.length}`);
  const user=uniqueCandidates[0];
  const cfp=candidateFp(user.uid);

  const credentialAssociations=[];
  for(const r of shopperRecords){const login=norm(r.normalizedLogin||r.loginIdentifier);if(!login||norm(internalEmail(login))!==norm(user.email))continue;const legacy=text(r.legacyId||r.legacyShopperId||r.externalShopperId||r.externalId||r.sourceId||r.sourceKey);for(const pid of legacyIndex.get(legacy)||[])credentialAssociations.push(profileFp(pid));}
  const finalLoginAssociation=exactTargetLogins.some(login=>norm(internalEmail(login))===norm(user.email))?[TARGET_PROFILE_FP]:[];
  const claimShopperId=text(user.customClaims?.shopperId);
  const claimKnownProfiles=claimShopperId&&docs.some(d=>d.id===claimShopperId)?[profileFp(claimShopperId)]:[];
  const associatedRows=uniq([...credentialAssociations,...finalLoginAssociation,...claimKnownProfiles]);
  const nonTargetAssociations=associatedRows.filter(x=>x!==TARGET_PROFILE_FP);
  ensure(associatedRows.includes(TARGET_PROFILE_FP),'TARGET_CANDIDATE_NOT_TECHNICALLY_BOUND');
  ensure(nonTargetAssociations.length===0,`TARGET_CANDIDATE_ASSOCIATED_TO_OTHER_ROWS_${nonTargetAssociations.length}`);

  const targetMappedRecords=matchingRecords.filter(r=>norm(internalEmail(norm(r.normalizedLogin||r.loginIdentifier)))===norm(user.email));
  const legacyHashes=uniq(targetMappedRecords.map(r=>String(r.passwordHashHex||'').toLowerCase()).filter(v=>/^[a-f0-9]{64}$/.test(v)&&r=>r));
  const currentHash=rawHashBytes(user.passwordHash);
  const passwordHashAvailable=currentHash.length>0;
  const rawSalt=user.passwordSalt;
  const saltBytes=rawSalt==null?Buffer.alloc(0):rawHashBytes(rawSalt);
  let passwordSaltState='NOT_EXPOSED_OR_UNKNOWN';
  if(saltBytes.length>0)passwordSaltState='PRESENT_NONEMPTY';
  else if(passwordHashAvailable&&legacyHashes.length===1&&currentHash.equals(Buffer.from(legacyHashes[0],'hex')))passwordSaltState='EMPTY_OR_NULL_LEGITIMATE_LEGACY_SHA256';
  const legacyHashMatches=passwordHashAvailable&&legacyHashes.length===1&&currentHash.equals(Buffer.from(legacyHashes[0],'hex'));

  const hashConfig=await fetchHashConfig(credential);evidence.providerRead.hashConfigReads=1;
  const providerHashAlgorithm=hashAlgorithmOf(hashConfig);
  const providerCfgSufficient=providerConfigSufficient(hashConfig);
  const restoreMode=legacyHashMatches?'LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT':(passwordHashAvailable&&passwordSaltState==='PRESENT_NONEMPTY'&&providerCfgSufficient?'PROVIDER_HASH_CONFIG_EXACT':'UNPROVEN');
  const exactRollbackReconstructible=passwordHashAvailable&&restoreMode!=='UNPROVEN';

  evidence.resolution={candidateCount:1,candidateFingerprint:cfp,anchorTypes:uniq([emailAnchors.get(norm(user.email)),claimShopperId===targetProfile.id?'current_claim_exact':null].filter(Boolean)),credentialRecordMatches:matchingRecords.length,targetCredentialRecordMatches:targetMappedRecords.length,associatedPlanRowCount:associatedRows.length,nonTargetAssociationCount:0,uniquePlanAssociation:true};
  evidence.passwordState={passwordHashAvailable,passwordHashByteLength:currentHash.length,passwordSaltState,passwordSaltByteLength:saltBytes.length,legacyHashMatches,providerHashConfigReadable:true,providerHashAlgorithmClass:providerHashAlgorithm,providerHashConfigSufficient:providerCfgSufficient};
  evidence.restoration={restoreMode,exactRollbackReconstructible};

  if(exactRollbackReconstructible){
    const snapshotPayload={schemaVersion:'cxorbia.c6.auth-one-target-password-rollback-snapshot.v1',generatedAt:new Date().toISOString(),projectId:EXPECTED_PROJECT,targetProfileFingerprint:TARGET_PROFILE_FP,candidateFingerprint:cfp,user:{uid:user.uid,email:user.email||null,emailVerified:Boolean(user.emailVerified),disabled:Boolean(user.disabled),customClaims:user.customClaims||null,providerData:(user.providerData||[]).map(p=>({providerId:p.providerId||null,uid:p.uid||null,email:p.email||null,displayName:p.displayName||null,photoURL:p.photoURL||null,phoneNumber:p.phoneNumber||null})),passwordHashBase64:currentHash.toString('base64'),passwordSaltBase64:saltBytes.length?saltBytes.toString('base64'):null,passwordSaltState},restoration:{restoreMode,legacyHash:{algorithm:'SHA256',rounds:1,saltless:true},providerHashConfig:hashConfig}};
    const env=encryptEnvelope(snapshotPayload,serviceAccount.private_key);
    const snapshotPath=path.join(outDir,'rollback-one-target.enc.json');fs.writeFileSync(snapshotPath,JSON.stringify(env,null,2)+'\n','utf8');
    const check=decryptEnvelope(env,serviceAccount.private_key);
    ensure(check.targetProfileFingerprint===TARGET_PROFILE_FP&&check.candidateFingerprint===cfp&&check.user.passwordHashBase64===currentHash.toString('base64'),'SNAPSHOT_ROUNDTRIP_FAILED');
    evidence.snapshot={created:true,encrypted:true,algorithm:'AES-256-GCM',roundtripVerified:true,digestSha256:sha(fs.readFileSync(snapshotPath)),repositoryForbidden:true};
    decision='PASS_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_EXACT_ROLLBACK';
  } else {
    decision='STOP_RETRY_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_ROLLBACK_NOT_PROVEN';
  }
}catch(error){evidence.error=safeCode(error);}
finally{
  evidence.decision=decision;
  fs.writeFileSync(path.join(outDir,'evidence-source-safe.json'),JSON.stringify(evidence,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'decision.txt'),decision+'\n','utf8');
  console.log(decision);
  console.log(JSON.stringify({candidateCount:evidence.resolution?.candidateCount??0,uniquePlanAssociation:Boolean(evidence.resolution?.uniquePlanAssociation),passwordHashAvailable:Boolean(evidence.passwordState?.passwordHashAvailable),passwordSaltState:evidence.passwordState?.passwordSaltState||'UNKNOWN',legacyHashMatches:Boolean(evidence.passwordState?.legacyHashMatches),providerHashAlgorithmClass:evidence.passwordState?.providerHashAlgorithmClass||'UNKNOWN',exactRollbackReconstructible:Boolean(evidence.restoration?.exactRollbackReconstructible),snapshotCreated:Boolean(evidence.snapshot?.created),providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0}));
  if(!decision.startsWith('PASS_'))process.exitCode=2;
}
