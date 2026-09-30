#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import {
  text, norm, sha256, fingerprint, asciiToken, internalEmail, decryptCredentialBundle
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const TENANT_ID='tya';
const PROJECT_ID='cinepolis';
const TARGET_PROFILE_FP='ac93d90d9e41512acdcd';
const TARGET_BASE_FP='493f2b26360648693c37';
const TARGET_LOGIN_FP='bd8d7019d612b4421366';
const COLLISION_PEER_FP='a8dd7db89a02ff180674';
const TARGET_SUFFIX_LENGTH=4;
const PLAN_PROFILE_NS='deterministic-suffix-plan-profile';
const AUTH_CANDIDATE_NS='shopper-auth-candidate-v1';
const CONTRACT_PATH='backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json';
const requestPath=process.argv[2]||'backend/config/c6-auth-target-adaptive-lineage-password-snapshot-readonly-request-v1.json';
const sourcePlanPath=process.env.CXORBIA_SOURCE_PLAN||'.tmp/c6-auth-target-adaptive/source/plan-340-source-safe.json';
const outDir=process.env.CXORBIA_ADAPTIVE_LINEAGE_OUT||'.tmp/c6-auth-target-adaptive/export';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

const TECH_KEYS=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'];
const NAME_KEYS=['nombre','name','displayName','fullName','legacyName','personName','shopperName'];
const FIRST_KEYS=['firstName','primerNombre','nombre1','givenName'];
const SURNAME_KEYS=['lastName','apellido','apellidos','surname','familyName','primerApellido'];
const LOGIN_KEYS=['username','userName','usuario','login','loginIdentifier','normalizedLogin'];
const CREDENTIAL_LEGACY_KEYS=['legacyId','legacyShopperId','externalShopperId','externalId','sourceId','sourceKey'];

const uniq=a=>[...new Set(a.filter(Boolean))];
const fp=(ns,v)=>fingerprint(`${ns}\0${v}`);
const profileFp=id=>fp(PLAN_PROFILE_NS,id);
const baseFp=login=>fp('base-login',login);
const targetFp=login=>fp('target-login',login);
const candidateFp=uid=>fp(AUTH_CANDIDATE_NS,uid);
const ensure=(v,c)=>{if(!v)throw new Error(c)};
const safeCode=e=>String(e?.message||e).replace(/[^A-Za-z0-9_.:,/+-]+/g,'_').slice(0,220);
const asArray=v=>Array.isArray(v)?v:[v];
const pick=(obj,keys)=>{for(const k of keys){const v=text(obj?.[k]);if(v)return v;}return '';};
const rawHashBytes=v=>v==null?Buffer.alloc(0):(Buffer.isBuffer(v)?v:Buffer.from(String(v),'base64'));

function deterministicSuffix(shopperId,length=TARGET_SUFFIX_LENGTH){return sha256(`${TENANT_ID}\0${shopperId}`).slice(0,length);}
function fullNameCandidate(source,firstToken){
  const full=pick(source,NAME_KEYS); const parts=full.split(/\s+/).filter(Boolean);
  if(parts.length<2||asciiToken(parts[0])!==firstToken)return '';
  const index=parts.length>=4?parts.length-2:parts.length-1;
  return asciiToken(parts[index]);
}
function recursiveObjects(value,out=[],depth=0){
  if(depth>7||value==null)return out;
  if(Array.isArray(value)){for(const x of value)recursiveObjects(x,out,depth+1);return out;}
  if(typeof value!=='object')return out;
  const keys=Object.keys(value);
  if(keys.some(k=>TECH_KEYS.includes(k)||NAME_KEYS.includes(k)||FIRST_KEYS.includes(k)||SURNAME_KEYS.includes(k)||LOGIN_KEYS.includes(k)))out.push(value);
  for(const x of Object.values(value))if(x&&typeof x==='object')recursiveObjects(x,out,depth+1);
  return out;
}
function technicalValues(obj){
  const vals=[];
  for(const k of TECH_KEYS)for(const v of asArray(obj?.[k])){const t=text(v);if(t)vals.push(t);}
  return uniq(vals);
}
function sourceLinkedToTarget(obj,targetSet){return technicalValues(obj).some(v=>targetSet.has(v));}
function evaluateNameLineage(profile,linkedSources){
  const sources=[{value:profile,basis:'profile'},...linkedSources];
  let firstRaw='';
  for(const item of sources){
    const direct=pick(item.value,FIRST_KEYS); const full=pick(item.value,NAME_KEYS);
    const raw=direct?direct.split(/\s+/)[0]:full?full.split(/\s+/)[0]:'';
    if(raw){firstRaw=raw;break;}
  }
  const first=asciiToken(firstRaw);
  const explicit=[]; const technical=[];
  for(const item of sources){
    const surname=pick(item.value,SURNAME_KEYS);
    if(surname)explicit.push(asciiToken(surname.split(/\s+/)[0]));
    for(const k of LOGIN_KEYS){const parts=norm(item.value?.[k]).split('.').filter(Boolean);if(parts.length>=2&&asciiToken(parts[0])===first)technical.push(asciiToken(parts[1]));}
  }
  const directTokens=uniq([...explicit,...technical]);
  const candidates=new Map();
  if(first&&directTokens.length===0){
    for(const item of sources){
      const token=fullNameCandidate(item.value,first); if(!token)continue;
      if(!candidates.has(token))candidates.set(token,new Set()); candidates.get(token).add(item.basis);
    }
  }
  const corroborated=[...candidates.entries()].filter(([,bases])=>bases.size>=2);
  const pass=Boolean(first)&&directTokens.length===0&&corroborated.length===1;
  const surname=pass?corroborated[0][0]:'';
  const bases=pass?[...corroborated[0][1]].sort():[];
  const baseLogin=pass?`${first}.${surname}`:'';
  return {pass,firstComplete:Boolean(first),directTokenCount:directTokens.length,corroboratedCandidateCount:corroborated.length,corroboratingBases:bases,baseLogin};
}
function encryptEnvelope(payload,privateKey){
  const context='c6-auth-target-adaptive-lineage-password-snapshot-v1';
  const salt=crypto.randomBytes(32),iv=crypto.randomBytes(12);
  const key=crypto.hkdfSync('sha256',Buffer.from(privateKey,'utf8'),salt,Buffer.from(context,'utf8'),32);
  const aad=Buffer.from(`cxorbia|${EXPECTED_PROJECT}|${TARGET_PROFILE_FP}|${context}`,'utf8');
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
  const plain=Buffer.from(JSON.stringify(payload),'utf8'); const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]);
  return {schemaVersion:'cxorbia.encrypted-envelope.v1',algorithm:'AES-256-GCM',kdf:'HKDF-SHA256',context,aad:aad.toString('base64'),saltBase64:salt.toString('base64'),ivBase64:iv.toString('base64'),tagBase64:cipher.getAuthTag().toString('base64'),ciphertextBase64:ciphertext.toString('base64'),plaintextSha256:sha256(plain)};
}
function decryptEnvelope(env,privateKey){
  const key=crypto.hkdfSync('sha256',Buffer.from(privateKey,'utf8'),Buffer.from(env.saltBase64,'base64'),Buffer.from(env.context,'utf8'),32);
  const d=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(env.ivBase64,'base64'));d.setAAD(Buffer.from(env.aad,'base64'));d.setAuthTag(Buffer.from(env.tagBase64,'base64'));
  const plain=Buffer.concat([d.update(Buffer.from(env.ciphertextBase64,'base64')),d.final()]);ensure(sha256(plain)===env.plaintextSha256,'SNAPSHOT_DIGEST_MISMATCH');return JSON.parse(plain.toString('utf8'));
}
async function fetchHashConfig(credential){
  const token=await credential.getAccessToken(); const accessToken=token?.access_token||token?.accessToken; ensure(accessToken,'HASH_CONFIG_ACCESS_TOKEN_MISSING');
  const response=await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${EXPECTED_PROJECT}/config?mask=hashConfig`,{headers:{authorization:`Bearer ${accessToken}`,'cache-control':'no-cache'}});
  if(!response.ok)throw new Error(`HASH_CONFIG_HTTP_${response.status}`); const body=await response.json(); const cfg=body?.hashConfig||body?.hash_config; ensure(cfg&&typeof cfg==='object'&&Object.keys(cfg).length,'HASH_CONFIG_EMPTY'); return cfg;
}
function hashAlgorithmOf(cfg){return text(cfg?.hashAlgorithm||cfg?.algorithm||cfg?.hash_algorithm||'UNKNOWN').toUpperCase();}
function providerConfigSufficient(cfg){
  const alg=hashAlgorithmOf(cfg); if(!alg||alg==='UNKNOWN')return false;
  if(alg==='SCRYPT')return Boolean(cfg.signerKey||cfg.signer_key)&&Object.hasOwn(cfg,'rounds')&&(Object.hasOwn(cfg,'memoryCost')||Object.hasOwn(cfg,'memory_cost'));
  return Object.keys(cfg).length>0;
}
async function queryTargetLinked(ref,basis,targetSet,evidence,linkedSources){
  const seenDocs=new Set(); const specs=[];
  for(const field of TECH_KEYS)for(const value of targetSet)specs.push([field,value]);
  for(const [field,value] of specs){
    evidence.providerRead.targetLinkedQueries++;
    let snap;
    try{snap=await ref.where(field,'==',value).limit(5).get();}catch(err){evidence.providerRead.queryErrors++;continue;}
    for(const doc of snap.docs){
      if(seenDocs.has(doc.ref.path))continue; seenDocs.add(doc.ref.path); evidence.providerRead.targetLinkedDocumentsRead++;
      const root=doc.data()||{}; const objects=[root,...recursiveObjects(root)];
      for(const obj of objects){if(!sourceLinkedToTarget(obj,targetSet))continue; linkedSources.push({value:obj,basis}); for(const v of technicalValues(obj))targetSet.add(v);}
    }
    const lineage=evaluateNameLineage(evidence._targetProfile,linkedSources);
    if(lineage.pass&&baseFp(lineage.baseLogin)===TARGET_BASE_FP){const targetLogin=`${lineage.baseLogin}.${deterministicSuffix(evidence._targetProfile.id)}`;if(targetFp(targetLogin)===TARGET_LOGIN_FP)return {pass:true,lineage,targetLogin};}
  }
  return {pass:false,lineage:evaluateNameLineage(evidence._targetProfile,linkedSources),targetLogin:''};
}

fs.mkdirSync(outDir,{recursive:true});
let decision='STOP_RETRY_C6_AUTH_TARGET_ADAPTIVE_LINEAGE_PASSWORD_SNAPSHOT_READONLY_TECHNICAL';
const evidence={schemaVersion:'cxorbia.c6.auth-target-adaptive-lineage-password-snapshot-readonly.evidence.v1',generatedAt:new Date().toISOString(),decision:null,target:{profileFingerprint:TARGET_PROFILE_FP,baseLoginFingerprint:TARGET_BASE_FP,targetLoginFingerprint:TARGET_LOGIN_FP,suffixLength:TARGET_SUFFIX_LENGTH},rootCauseCircuitBreaker:{priorClaimOnlyResolverRejected:true,priorCredentialOnlyResolverRejected:true,originalCrossSourceLineageRequired:true,credentialCrosswalkRequiredAfterLineage:true,sharedBaseLoginForbiddenAsSoleTargetAnchor:true},lineage:{},resolution:{},passwordState:{},restoration:{},providerRead:{shopperIndexQueries:0,shopperDocumentsRead:0,targetLinkedQueries:0,targetLinkedDocumentsRead:0,queryErrors:0,authDirectoryPages:0,hashConfigReads:0},snapshot:{created:false},safety:{providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,cloudBuilds:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,rawNamesExported:false,rawSurnamesExported:false,rawLoginsExported:false,rawEmailsExported:false,rawUidsExported:false,rawPasswordsExported:false,rawPasswordHashExported:false,rawPasswordSaltExported:false,piiExported:false}};
try{
  ensure(fs.existsSync(requestPath),'REQUEST_MISSING'); ensure(fs.existsSync(CONTRACT_PATH),'CONTRACT_MISSING'); ensure(fs.existsSync(sourcePlanPath),'SOURCE_PLAN_MISSING'); ensure(credentialPath&&fs.existsSync(credentialPath),'SERVICE_ACCOUNT_MISSING');
  const request=JSON.parse(fs.readFileSync(requestPath,'utf8')); const contract=JSON.parse(fs.readFileSync(CONTRACT_PATH,'utf8')); const plan=JSON.parse(fs.readFileSync(sourcePlanPath,'utf8'));
  ensure(request.schemaVersion==='cxorbia.c6.auth-target-adaptive-lineage-password-snapshot-readonly.request.v1'&&request.enabled===true&&request.consumed===false&&Number(request.allowedExecutions)===1&&request.authorizedBy==='Paula','REQUEST_INVALID');
  ensure(request.firebaseProjectId===EXPECTED_PROJECT&&request.targetProfileFingerprint===TARGET_PROFILE_FP&&request.contract===CONTRACT_PATH,'REQUEST_TARGET_INVALID');
  ensure(contract.schemaVersion==='cxorbia.c6.auth-target-anchor-lineage-provider-minimum.v1','CONTRACT_SCHEMA');
  ensure(contract.target?.profileFingerprint===TARGET_PROFILE_FP&&contract.target?.baseLoginFingerprint===TARGET_BASE_FP&&contract.target?.targetLoginFingerprint===TARGET_LOGIN_FP&&Number(contract.target?.suffixLength)===TARGET_SUFFIX_LENGTH,'CONTRACT_TARGET_DRIFT');
  ensure(Array.isArray(plan)&&plan.length===340&&new Set(plan.map(r=>r.profileFp)).size===340,'SOURCE_PLAN_340_UNIQUE_REQUIRED');
  ensure(sha256(JSON.stringify(plan))===request.sourcePlanDigestSha256,'SOURCE_PLAN_DIGEST_MISMATCH');
  const targetRow=plan.find(r=>r.profileFp===TARGET_PROFILE_FP); const peerRow=plan.find(r=>r.profileFp===COLLISION_PEER_FP);
  ensure(targetRow&&targetRow.primary==='UPDATE_AUTH'&&targetRow.changes?.email===true&&targetRow.changes?.password===true&&targetRow.changes?.claims===true,'TARGET_PLAN_VECTOR_DRIFT');
  ensure(targetRow.baseLoginFp===TARGET_BASE_FP&&targetRow.targetLoginFp===TARGET_LOGIN_FP&&targetRow.suffixLength===TARGET_SUFFIX_LENGTH,'TARGET_PLAN_FP_DRIFT');
  ensure(peerRow&&peerRow.baseLoginFp===TARGET_BASE_FP&&peerRow.suffixApplied===false,'COLLISION_PEER_DRIFT');
  ensure(plan.filter(r=>r.targetLoginFp===TARGET_LOGIN_FP).length===1,'TARGET_LOGIN_NOT_UNIQUE_IN_PLAN');

  const serviceAccount=JSON.parse(fs.readFileSync(credentialPath,'utf8')); ensure(serviceAccount.project_id===EXPECTED_PROJECT&&serviceAccount.private_key,'SERVICE_ACCOUNT_PROJECT_MISMATCH');
  const credential=admin.credential.cert(serviceAccount); if(!admin.apps.length)admin.initializeApp({credential,projectId:EXPECTED_PROJECT}); const auth=admin.auth(),db=admin.firestore();
  const tenantRef=db.collection('tenants').doc(TENANT_ID),projectRef=tenantRef.collection('projects').doc(PROJECT_ID);

  const shopperSnap=await tenantRef.collection('shoppers').select(...uniq([...TECH_KEYS,...NAME_KEYS,...FIRST_KEYS,...SURNAME_KEYS,...LOGIN_KEYS])).get();
  evidence.providerRead.shopperIndexQueries=1; evidence.providerRead.shopperDocumentsRead=shopperSnap.docs.length; ensure(shopperSnap.docs.length===340,'SHOPPER_POPULATION_DRIFT');
  const profiles=shopperSnap.docs.map(d=>({id:d.id,...(d.data()||{})})); const targetProfiles=profiles.filter(p=>profileFp(p.id)===TARGET_PROFILE_FP); ensure(targetProfiles.length===1,`TARGET_PROFILE_RESOLUTION_COUNT_${targetProfiles.length}`);
  const targetProfile=targetProfiles[0]; evidence._targetProfile=targetProfile;
  const targetTechSet=new Set([targetProfile.id,...technicalValues(targetProfile)]); const linkedSources=[];
  let lineage=evaluateNameLineage(targetProfile,linkedSources); let targetLogin='';
  const defs=[['hr',projectRef.collection('hrImports')],['visit',projectRef.collection('visits')],['certification',db.collectionGroup('certifications')],['liquidation',db.collectionGroup('liquidations')]];
  for(const [basis,ref] of defs){
    if(lineage.pass&&baseFp(lineage.baseLogin)===TARGET_BASE_FP){targetLogin=`${lineage.baseLogin}.${deterministicSuffix(targetProfile.id)}`;if(targetFp(targetLogin)===TARGET_LOGIN_FP)break;}
    const result=await queryTargetLinked(ref,basis,targetTechSet,evidence,linkedSources); lineage=result.lineage; if(result.pass){targetLogin=result.targetLogin;break;}
  }
  ensure(lineage.pass,'TARGET_CONSENSUS_NOT_RECONSTRUCTED'); ensure(lineage.corroboratingBases.length>=2,'TARGET_CONSENSUS_BASIS_LT2'); ensure(baseFp(lineage.baseLogin)===TARGET_BASE_FP,'BASE_LOGIN_FP_MISMATCH');
  if(!targetLogin)targetLogin=`${lineage.baseLogin}.${deterministicSuffix(targetProfile.id)}`; ensure(targetFp(targetLogin)===TARGET_LOGIN_FP,'TARGET_LOGIN_FP_MISMATCH'); ensure(TARGET_SUFFIX_LENGTH===4,'SUFFIX_LENGTH_DRIFT');
  evidence.lineage={pass:true,corroboratingBasisCount:lineage.corroboratingBases.length,corroboratingBases:lineage.corroboratingBases,directTokenCount:lineage.directTokenCount,baseLoginFingerprintMatch:true,targetLoginFingerprintMatch:true,suffixLength:4,targetLoginUniqueInFrozenPlan:true};

  const bundle=decryptCredentialBundle({serviceAccount}); const shopperRecords=(Array.isArray(bundle.records)?bundle.records:[]).filter(r=>r?.kind==='shopper');
  const mappedCredentials=shopperRecords.filter(r=>CREDENTIAL_LEGACY_KEYS.some(k=>targetTechSet.has(text(r?.[k]))));
  const credentialLogins=uniq(mappedCredentials.map(r=>norm(r.normalizedLogin||r.loginIdentifier)));
  const credentialEmailSet=new Set(credentialLogins.map(login=>norm(internalEmail(login,'shopper',TENANT_ID))));
  const targetEmail=norm(internalEmail(targetLogin,'shopper',TENANT_ID)); const sharedBaseEmail=norm(internalEmail(lineage.baseLogin,'shopper',TENANT_ID));

  const page=await auth.listUsers(1000); evidence.providerRead.authDirectoryPages=1; ensure(!page.pageToken,'AUTH_DIRECTORY_EXCEEDS_ONE_PAGE_BUDGET');
  const planProfileSet=new Set(plan.map(r=>r.profileFp));
  const evaluated=page.users.map(user=>{
    const email=norm(user.email); const claimId=text(user.customClaims?.shopperId); const claimFp=claimId?profileFp(claimId):'';
    const targetSpecific={credentialEmailMatch:credentialEmailSet.has(email),targetEmailMatch:email===targetEmail,exactClaimMatch:claimId===targetProfile.id};
    const sharedBaseEmailMatch=email===sharedBaseEmail; const claimOtherPlanRow=Boolean(claimFp&&claimFp!==TARGET_PROFILE_FP&&planProfileSet.has(claimFp));
    const targetSpecificCount=Object.values(targetSpecific).filter(Boolean).length; const otherPlanAssociation=sharedBaseEmailMatch||claimOtherPlanRow;
    return {user,targetSpecific,targetSpecificCount,sharedBaseEmailMatch,claimOtherPlanRow,otherPlanAssociation};
  });
  const anchored=evaluated.filter(x=>x.targetSpecificCount>0); const eligible=anchored.filter(x=>!x.otherPlanAssociation);
  ensure(eligible.length===1,`TARGET_AUTH_CANDIDATE_COUNT_${eligible.length}`); const selected=eligible[0];
  ensure(!selected.targetSpecific.targetEmailMatch,'TARGET_EMAIL_CHANGE_FLAG_DRIFT');
  const selectedUser=selected.user; const cfp=candidateFp(selectedUser.uid);
  evidence.resolution={candidateCount:1,candidateFingerprint:cfp,targetSpecificAnchorCount:selected.targetSpecificCount,credentialAnchorPresent:selected.targetSpecific.credentialEmailMatch,exactClaimAnchorPresent:selected.targetSpecific.exactClaimMatch,targetEmailAnchorPresent:selected.targetSpecific.targetEmailMatch,sharedBaseEmailAssociation:false,otherPlanRowAssociationCount:0,mappedCredentialRecordCount:mappedCredentials.length,credentialLoginAnchorCount:credentialLogins.length};

  const currentHash=rawHashBytes(selectedUser.passwordHash); const currentSalt=selectedUser.passwordSalt==null?Buffer.alloc(0):rawHashBytes(selectedUser.passwordSalt); const passwordHashAvailable=currentHash.length>0;
  const legacyHashes=uniq(mappedCredentials.map(r=>String(r.passwordHashHex||'').toLowerCase()).filter(v=>/^[a-f0-9]{64}$/.test(v))); const legacyHashMatches=passwordHashAvailable&&legacyHashes.length===1&&currentHash.equals(Buffer.from(legacyHashes[0],'hex'));
  let saltState='NOT_EXPOSED_OR_UNKNOWN'; if(currentSalt.length>0)saltState='PRESENT_NONEMPTY'; else if(legacyHashMatches)saltState='EMPTY_OR_NULL_LEGITIMATE_LEGACY_SHA256';
  const hashConfig=await fetchHashConfig(credential); evidence.providerRead.hashConfigReads=1; const providerAlg=hashAlgorithmOf(hashConfig),providerCfgOk=providerConfigSufficient(hashConfig);
  const restoreMode=legacyHashMatches?'LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT':(passwordHashAvailable&&currentSalt.length>0&&providerCfgOk?'PROVIDER_HASH_CONFIG_EXACT':'UNPROVEN'); const exactRollbackReconstructible=passwordHashAvailable&&restoreMode!=='UNPROVEN';
  evidence.passwordState={passwordHashAvailable,passwordHashByteLength:currentHash.length,passwordSaltState:saltState,passwordSaltByteLength:currentSalt.length,legacyHashCandidateCount:legacyHashes.length,legacyHashMatches,providerHashConfigReadable:true,providerHashAlgorithmClass:providerAlg,providerHashConfigSufficient:providerCfgOk}; evidence.restoration={restoreMode,exactRollbackReconstructible};

  if(exactRollbackReconstructible){
    const payload={schemaVersion:'cxorbia.c6.auth-target-adaptive-lineage-password-rollback-snapshot.v1',generatedAt:new Date().toISOString(),projectId:EXPECTED_PROJECT,targetProfileFingerprint:TARGET_PROFILE_FP,candidateFingerprint:cfp,user:{uid:selectedUser.uid,email:selectedUser.email||null,emailVerified:Boolean(selectedUser.emailVerified),disabled:Boolean(selectedUser.disabled),customClaims:selectedUser.customClaims||null,providerData:(selectedUser.providerData||[]).map(p=>({providerId:p.providerId||null,uid:p.uid||null,email:p.email||null,displayName:p.displayName||null,photoURL:p.photoURL||null,phoneNumber:p.phoneNumber||null})),passwordHashBase64:currentHash.toString('base64'),passwordSaltBase64:currentSalt.length?currentSalt.toString('base64'):null,passwordSaltState:saltState},restoration:{restoreMode,legacyHash:{algorithm:'SHA256',rounds:1,saltless:true},providerHashConfig:hashConfig}};
    const env=encryptEnvelope(payload,serviceAccount.private_key); const snapshotPath=path.join(outDir,'rollback-one-target.enc.json'); fs.writeFileSync(snapshotPath,JSON.stringify(env,null,2)+'\n','utf8'); const check=decryptEnvelope(env,serviceAccount.private_key);
    ensure(check.targetProfileFingerprint===TARGET_PROFILE_FP&&check.candidateFingerprint===cfp&&check.user.passwordHashBase64===currentHash.toString('base64'),'SNAPSHOT_ROUNDTRIP_FAILED'); evidence.snapshot={created:true,encrypted:true,algorithm:'AES-256-GCM',roundtripVerified:true,digestSha256:sha256(fs.readFileSync(snapshotPath)),repositoryForbidden:true}; decision='PASS_C6_AUTH_TARGET_ADAPTIVE_LINEAGE_PASSWORD_SNAPSHOT_READONLY_EXACT_ROLLBACK';
  }else decision='STOP_RETRY_C6_AUTH_TARGET_ADAPTIVE_LINEAGE_PASSWORD_SNAPSHOT_READONLY_ROLLBACK_NOT_PROVEN';
}catch(error){evidence.error=safeCode(error);}
finally{
  delete evidence._targetProfile; evidence.decision=decision; fs.writeFileSync(path.join(outDir,'evidence-source-safe.json'),JSON.stringify(evidence,null,2)+'\n','utf8'); fs.writeFileSync(path.join(outDir,'decision.txt'),decision+'\n','utf8');
  console.log(decision); console.log(JSON.stringify({lineagePass:Boolean(evidence.lineage?.pass),basisCount:evidence.lineage?.corroboratingBasisCount||0,candidateCount:evidence.resolution?.candidateCount||0,credentialAnchorPresent:Boolean(evidence.resolution?.credentialAnchorPresent),passwordHashAvailable:Boolean(evidence.passwordState?.passwordHashAvailable),passwordSaltState:evidence.passwordState?.passwordSaltState||'UNKNOWN',legacyHashMatches:Boolean(evidence.passwordState?.legacyHashMatches),providerHashAlgorithmClass:evidence.passwordState?.providerHashAlgorithmClass||'UNKNOWN',exactRollbackReconstructible:Boolean(evidence.restoration?.exactRollbackReconstructible),snapshotCreated:Boolean(evidence.snapshot?.created),providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0})); if(!decision.startsWith('PASS_'))process.exitCode=2;
}
