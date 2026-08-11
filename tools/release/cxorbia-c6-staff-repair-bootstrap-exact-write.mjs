#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import admin from 'firebase-admin';

const EXPECTED_PROJECT=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const TENANT='tya';
const PROJECT_ID='cinepolis';
const REQUEST_PATH=process.env.CXORBIA_C6_STAFF_WRITE_REQUEST||'.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write.json';
const CONTRACT_PATH='backend/contracts/c6-staff-repair-bootstrap-exact-write-v1.json';
const TARGETS_PATH='backend/config/c6-staff-bootstrap-targets-v1.json';
const COLLISION_PATH='backend/config/c6-staff-provider-collision-targets-v1.json';
const PREWRITE_PATH='backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json';
const SNAPSHOT_PATH='app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json';
const ENVELOPE_PATH='backend/private-inbox/corte6-credential-bundle.enc.json';
const PUBLIC_KEY_PATH='backend/secure/corte6-credential-handoff-public.json';
const PRIVATE_KEY_PATH='backend/secure/corte6-credential-handoff-private.enc.json';
const OUT=process.env.CXORBIA_C6_STAFF_WRITE_OUT||'.tmp/c6-staff-repair-bootstrap-exact-write/report.json';

const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp20=uid=>sha(`shopper-auth-candidate-v1\0${String(uid||'').trim()}`).slice(0,20);
const providerUidFp=uid=>sha(`cxorbia-provider-uid-v1\0${String(uid||'').trim()}`);
const norm=v=>String(v??'').trim().toLowerCase();
const uniq=v=>[...new Set((Array.isArray(v)?v:[]).map(String).filter(Boolean))].sort();
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const nowIso=()=>new Date().toISOString();
const claimsCanonical=(role)=>({authNamespace:'staff',projectIds:[PROJECT_ID],role,tenantId:TENANT});
const claimsDigest=role=>sha(JSON.stringify(claimsCanonical(role)));
const safeClaims=u=>{
  const c=u?.customClaims||{};
  const canonical={authNamespace:norm(c.authNamespace),projectIds:uniq(c.projectIds),role:norm(c.role),tenantId:norm(c.tenantId)};
  return {canonical,digest:sha(JSON.stringify(canonical)),shopperIdPresent:Boolean(String(c.shopperId||'').trim())};
};
const exactClaims=(u,role)=>{
  const s=safeClaims(u),e=claimsCanonical(role);
  return !s.shopperIdPresent&&JSON.stringify(s.canonical)===JSON.stringify(e)&&s.digest===claimsDigest(role);
};
const safeErr=e=>({code:String(e?.message||e||'UNKNOWN').split(':')[0].replace(/[^A-Za-z0-9_.-]+/g,'_').slice(0,120),fingerprint:sha(String(e?.stack||e?.message||e||'UNKNOWN')).slice(0,24)});

function baseReport(){return {
  schemaVersion:'cxorbia.c6.staff-repair-bootstrap.exact-write.evidence.v1',
  generatedAt:nowIso(),projectId:EXPECTED_PROJECT,tenantId:TENANT,
  decision:'STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE',
  snapshotAuthority:{workflowRunId:31518927950,expectedAuthPopulationBefore:228},
  preflight:{sourceContract:false,requestAuthorized:false,credentialPrivacyPass:false,identityResolutionPass:false,providerStatePass:false},
  targetReadback:{A:false,B:false,C:false,D:false,R4Canonical:false},
  historicalReadback:{R1_SUPER:0,R2_ADMIN:0,R3_OPS:0,R4_CLIENT_HISTORICAL:0},
  writes:{authCreates:0,customClaimsWrites:0,authDisableWrites:0,authReenableRollbackWrites:0,authDisableCreatedRollbackWrites:0,authWritesTotal:0,tenantUserWrites:0,auditLogWrites:0,firestoreWritesTotal:0,authDeletes:0,firestoreDeletes:0},
  credentialPrivacy:{source:'EXISTING_ENCRYPTED_PROTECTED_BUNDLE_MEMORY_ONLY',rawPasswordMaterialized:false,rawPasswordPersisted:false,passwordHashPersisted:false,passwordHashLogged:false,passwordHashExported:false,rawVisibleLoginPersisted:false,rawVisibleLoginLogged:false,rawVisibleLoginExported:false,privateCredentialArtifact:false},
  blockers:[],rollback:{dryRunAuthority:'PASS',snapshotHeldInMemory:false,executed:false,required:false,reason:null},
  safety:{hrWrites:0,rulesWrites:0,storageWrites:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,deploys:0,merge:false,production:false}
};}
let report=baseReport();
function recalc(){report.writes.authWritesTotal=report.writes.authCreates+report.writes.customClaimsWrites+report.writes.authDisableWrites+report.writes.authReenableRollbackWrites+report.writes.authDisableCreatedRollbackWrites;report.writes.firestoreWritesTotal=report.writes.tenantUserWrites+report.writes.auditLogWrites;}
function writeReport(){recalc();fs.mkdirSync(OUT.substring(0,OUT.lastIndexOf('/')),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n','utf8');}
function stop(code,error){report.decision=code;report.generatedAt=nowIso();if(error)report.blockers.push(safeErr(error));writeReport();throw new Error(code);}

function sourcePreflight(){
  for(const p of [REQUEST_PATH,CONTRACT_PATH,TARGETS_PATH,COLLISION_PATH,PREWRITE_PATH,SNAPSHOT_PATH,ENVELOPE_PATH,PUBLIC_KEY_PATH,PRIVATE_KEY_PATH])ensure(fs.existsSync(p),`SOURCE_FILE_MISSING_${p}`);
  const request=readJson(REQUEST_PATH),contract=readJson(CONTRACT_PATH),targets=readJson(TARGETS_PATH),collision=readJson(COLLISION_PATH),prewrite=readJson(PREWRITE_PATH),snapshot=readJson(SNAPSHOT_PATH);
  ensure(contract.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.v1','CONTRACT_SCHEMA');
  ensure(contract.firebaseProjectId===EXPECTED_PROJECT&&contract.tenantId===TENANT,'CONTRACT_TARGET');
  ensure(contract.snapshotAuthority?.workflowRunId===31518927950&&contract.snapshotAuthority?.expectedAuthPopulationBefore===228,'CONTRACT_SNAPSHOT');
  ensure(contract.forwardWriteBudget?.authCreates===3&&contract.forwardWriteBudget?.customClaimsWrites===3&&contract.forwardWriteBudget?.authDisableWrites===8&&contract.forwardWriteBudget?.authWritesMax===14,'CONTRACT_AUTH_BUDGET');
  ensure(contract.forwardWriteBudget?.tenantUserWrites===4&&contract.forwardWriteBudget?.auditLogWrites===12&&contract.forwardWriteBudget?.firestoreWritesMax===16,'CONTRACT_FIRESTORE_BUDGET');
  ensure(contract.forwardWriteBudget?.authDeletes===0&&contract.forwardWriteBudget?.firestoreDeletes===0,'CONTRACT_DELETE_BUDGET');
  ensure(snapshot.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE'&&snapshot.provider?.authPopulation===228&&snapshot.provider?.writes===0,'SNAPSHOT_AUTHORITY');
  ensure(snapshot.frozenForwardWriteBudget?.authWritesTotal===14&&snapshot.frozenForwardWriteBudget?.firestoreWritesTotal===16,'SNAPSHOT_BUDGET');
  ensure(snapshot.rollbackDryRun?.decision==='PASS'&&snapshot.r4Canonical?.mutation==='FORBIDDEN','SNAPSHOT_ROLLBACK_R4');
  ensure(targets.schemaVersion==='cxorbia.c6.staff-bootstrap-targets.v1'&&targets.targets?.length===4,'TARGETS_SCHEMA');
  ensure(collision.schemaVersion==='cxorbia.c6.staff-provider-collision-targets.v1'&&collision.targets?.length===4,'COLLISION_SCHEMA');
  ensure(prewrite.schemaVersion==='cxorbia.c6.staff-repair-bootstrap-prewrite.v1','PREWRITE_SCHEMA');
  const aliases=['A','B','C','D'];
  const tm=new Map(targets.targets.map(x=>[x.targetAlias,x])),cm=new Map(collision.targets.map(x=>[x.targetAlias,x]));
  for(const a of aliases){const t=tm.get(a),c=cm.get(a);ensure(t&&c,`TARGET_MISSING_${a}`);ensure(t.tenantId===TENANT&&t.authNamespace==='staff'&&JSON.stringify(t.projectIds)===JSON.stringify([PROJECT_ID])&&t.entitlementMode==='TYA_COMPLETE',`TARGET_SCOPE_${a}`);ensure(c.role===t.role&&c.ownerIdentityAnchor===t.ownerIdentityAnchor&&c.expectedClaimsDigest===t.expectedClaimsDigest,`TARGET_COLLISION_BIND_${a}`);ensure(t.expectedClaimsDigest===claimsDigest(t.role),`TARGET_CLAIMS_DIGEST_${a}`);ensure(sha(`${c.technicalLoginDigest.slice(0,48)}@auth.cxorbia.invalid`)===c.providerEmailSha256,`TARGET_PROVIDER_DIGEST_${a}`);}
  ensure(prewrite.legacyRepairGroups?.length===4,'PREWRITE_GROUPS');
  report.preflight.sourceContract=true;
  return {request,contract,targets,collision,prewrite,snapshot,tm,cm};
}

function validateRequest(request){
  ensure(request.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.request.v1','REQUEST_SCHEMA');
  ensure(request.enabled===true&&request.consumed===false&&request.authorizedBy==='Paula','REQUEST_NOT_ACTIVE');
  ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&request.firebaseProjectId===EXPECTED_PROJECT&&request.tenantId===TENANT,'REQUEST_TARGET');
  ensure(request.snapshotWorkflowRunId===31518927950,'REQUEST_SNAPSHOT');
  ensure(request.authWritesMax===14&&request.firestoreWritesMax===16&&request.authDeletes===0&&request.firestoreDeletes===0,'REQUEST_BUDGET');
  ensure(request.rulesWrites===0&&request.storageWrites===0&&request.hrWrites===0&&request.makeWrites===0&&request.geminiCalls===0&&request.paymentsWrites===0&&request.deploy===false&&request.merge===false&&request.production===false,'REQUEST_FORBIDDEN_SCOPE');
  ensure(request.stopRetry===true&&request.allowedExecutions===1,'REQUEST_ONE_SHOT');
  ensure(typeof request.authorizationText==='string'&&request.authorizationText.includes('STAFF REPAIR/BOOTSTRAP EXACT WRITE'),'REQUEST_AUTH_TEXT');
  report.preflight.requestAuthorized=true;
}

function decryptProtectedBundle(sa){
  const pub=readJson(PUBLIC_KEY_PATH),encPriv=readJson(PRIVATE_KEY_PATH),env=readJson(ENVELOPE_PATH);
  ensure(pub.projectId===EXPECTED_PROJECT&&encPriv.projectId===EXPECTED_PROJECT&&env.targetProjectId===EXPECTED_PROJECT,'CREDENTIAL_TARGET');
  ensure(pub.fingerprintSha256===encPriv.fingerprintSha256&&pub.fingerprintSha256===env.keyFingerprintSha256,'CREDENTIAL_KEY_FINGERPRINT');
  const salt=Buffer.from(encPriv.saltBase64,'base64'),ivPriv=Buffer.from(encPriv.ivBase64,'base64'),tag=Buffer.from(encPriv.tagBase64,'base64'),ciphertextPriv=Buffer.from(encPriv.ciphertextBase64,'base64');
  const kek=crypto.hkdfSync('sha256',Buffer.from(sa.private_key,'utf8'),salt,Buffer.from('cxorbia-c6-credential-handoff-kek-v1','utf8'),32);
  const decipher=crypto.createDecipheriv('aes-256-gcm',kek,ivPriv);decipher.setAuthTag(tag);
  const privateDer=Buffer.concat([decipher.update(ciphertextPriv),decipher.final()]);
  const privateKey=crypto.createPrivateKey({key:privateDer,format:'der',type:'pkcs8'});
  const rawAes=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(env.wrappedKeyBase64,'base64'));
  const encrypted=Buffer.from(env.ciphertextBase64,'base64');ensure(encrypted.length>16,'CREDENTIAL_CIPHERTEXT');
  const contentTag=encrypted.subarray(encrypted.length-16),ct=encrypted.subarray(0,encrypted.length-16);
  const dec=crypto.createDecipheriv('aes-256-gcm',rawAes,Buffer.from(env.ivBase64,'base64'));dec.setAAD(Buffer.from(env.aad,'utf8'));dec.setAuthTag(contentTag);
  const plain=Buffer.concat([dec.update(ct),dec.final()]);
  const bytes=env.algorithms?.compression==='gzip'?zlib.gunzipSync(plain):plain;
  const bundle=JSON.parse(bytes.toString('utf8'));
  ensure(['cxorbia.legacy-credential-hash-bundle.v1','cxorbia.legacy-credential-hash-bundle.v2'].includes(bundle.schemaVersion)&&bundle.targetProjectId===EXPECTED_PROJECT&&bundle.tenantId===TENANT&&bundle.canonicalProjectId===PROJECT_ID,'CREDENTIAL_BUNDLE_CONTRACT');
  report.preflight.credentialPrivacyPass=true;
  return bundle;
}

async function resolvePrivateIdentities(db,bundle,cm){
  const candidateMap=new Map();
  const add=(digest,login)=>{if(!digest||!login)return;if(!candidateMap.has(digest))candidateMap.set(digest,new Set());candidateMap.get(digest).add(norm(login));};
  for(const r of Array.isArray(bundle.records)?bundle.records:[]){
    const ns=norm(r.authNamespace||(r.kind==='shopper'?'shopper':'staff'));if(r.kind!=='user'||ns!=='staff')continue;
    const login=norm(r.normalizedLogin||r.loginIdentifier);if(!login)continue;
    const digest=sha(`${TENANT}\0staff\0${login}`);add(digest,login);
  }
  const live=await db.collection('tenants').doc(TENANT).collection('users').select('visibleLogin','authNamespace').get();
  for(const d of live.docs){const x=d.data()||{},login=norm(x.visibleLogin);if(!login||norm(x.authNamespace||'staff')!=='staff')continue;add(sha(`${TENANT}\0staff\0${login}`),login);}
  const resolved=new Map(),bundleCredential=new Map();
  for(const alias of ['A','B','C','D']){
    const c=cm.get(alias),vals=[...(candidateMap.get(c.technicalLoginDigest)||new Set())];
    ensure(vals.length===1,`PRIVATE_VISIBLE_LOGIN_${vals.length===0?'UNRESOLVED':'AMBIGUOUS'}_${alias}`);
    const login=vals[0];ensure(sha(`${TENANT}\0staff\0${login}`)===c.technicalLoginDigest,`PRIVATE_VISIBLE_LOGIN_DIGEST_${alias}`);resolved.set(alias,login);
    if(alias!=='A'){
      const rows=(Array.isArray(bundle.records)?bundle.records:[]).filter(r=>r?.kind==='user'&&norm(r.authNamespace||'staff')==='staff'&&sha(`${TENANT}\0staff\0${norm(r.normalizedLogin||r.loginIdentifier)}`)===c.technicalLoginDigest);
      ensure(rows.length===1,`PRIVATE_CREDENTIAL_${rows.length===0?'UNRESOLVED':'AMBIGUOUS'}_${alias}`);
      const r=rows[0];ensure(/^[a-f0-9]{64}$/.test(String(r.passwordHashHex||''))&&r.passwordHashAlgorithm==='SHA256'&&r.passwordHashRounds===1,`PRIVATE_CREDENTIAL_HASH_CONTRACT_${alias}`);
      bundleCredential.set(alias,Buffer.from(r.passwordHashHex,'hex'));
    }
  }
  report.preflight.identityResolutionPass=true;
  return {resolved,bundleCredential};
}

async function providerPreflight(auth,db,source,privateData){
  const page=await auth.listUsers(1000);ensure(!page.pageToken,'AUTH_SECOND_PAGE_FORBIDDEN');ensure(page.users.length===228,`AUTH_POPULATION_DRIFT_${page.users.length}`);
  const users=page.users,byFp=new Map(users.map(u=>[fp20(u.uid),u]));
  const legacy=new Map(source.prewrite.legacyRepairGroups.map(g=>[g.repairAlias,g]));
  const historical=new Map();
  for(const alias of ['R1_SUPER','R2_ADMIN','R3_OPS','R4_CLIENT_HISTORICAL']){
    const g=legacy.get(alias);ensure(g?.currentCandidateFingerprints?.length===2,`HISTORICAL_GROUP_${alias}`);const arr=[];
    for(const fp of g.currentCandidateFingerprints){const u=byFp.get(fp);ensure(u,`HISTORICAL_MISSING_${alias}`);ensure(!u.disabled,`HISTORICAL_DISABLED_DRIFT_${alias}`);arr.push(u);}
    historical.set(alias,arr);
  }
  const aCfg=source.cm.get('A');const aMatches=users.filter(u=>sha(norm(u.email))===aCfg.providerEmailSha256);ensure(aMatches.length===1,'A_CANONICAL_PROVIDER_MATCH');const A=aMatches[0];ensure(!A.disabled&&exactClaims(A,'super'),'A_CANONICAL_STATE_DRIFT');
  const r4Matches=users.filter(u=>sha(String(u.uid))===source.prewrite.r4ClientHistorical?.validatedCanonicalUidFingerprint);ensure(r4Matches.length===1,'R4_CANONICAL_MATCH');const R4=r4Matches[0];ensure(!R4.disabled&&exactClaims(R4,'cliente'),'R4_CANONICAL_AUTH_DRIFT');
  for(const [group,arr] of historical){for(const u of arr){ensure(u.uid!==A.uid,`A_OVERLAPS_${group}`);ensure(u.uid!==R4.uid,`R4_OVERLAPS_${group}`);}}
  const r4Doc=await db.collection('tenants').doc(TENANT).collection('users').doc(R4.uid).get();ensure(r4Doc.exists,'R4_CANONICAL_DOC_MISSING');const r4d=r4Doc.data()||{};ensure(r4d.tenantId===TENANT&&norm(r4d.role)==='cliente'&&JSON.stringify(uniq(r4d.projectIds))===JSON.stringify([PROJECT_ID])&&r4d.active!==false,'R4_CANONICAL_DOC_DRIFT');
  const projectDoc=await db.collection('tenants').doc(TENANT).collection('projects').doc(PROJECT_ID).get();ensure(projectDoc.exists,'CANONICAL_PROJECT_MISSING');
  const targetUsers=new Map([['A',A]]);
  for(const alias of ['B','C','D']){
    const c=source.cm.get(alias),matches=users.filter(u=>sha(norm(u.email))===c.providerEmailSha256);ensure(matches.length===0,`TARGET_PROVIDER_COLLISION_${alias}`);
    const uid=`tya-usr-${c.technicalLoginDigest.slice(0,24)}`;ensure(!users.some(u=>u.uid===uid),`TARGET_UID_COLLISION_${alias}`);targetUsers.set(alias,{uid,email:`${c.technicalLoginDigest.slice(0,48)}@auth.cxorbia.invalid`});
  }
  for(const alias of ['A','B','C','D']){
    const u=targetUsers.get(alias),doc=await db.collection('tenants').doc(TENANT).collection('users').doc(u.uid).get();ensure(!doc.exists,`TARGET_USER_DOC_DRIFT_${alias}`);
  }
  // Private resolution must be proven before this function returns; no raw values escape report.
  ensure(privateData.resolved.size===4&&privateData.bundleCredential.size===3,'PRIVATE_IDENTITY_PRECONDITION');
  report.preflight.providerStatePass=true;report.rollback.snapshotHeldInMemory=true;
  report.targetReadback.R4Canonical=true;
  return {historical,A,R4,targetUsers};
}

function userDoc(alias,uid,source,privateData,actionId,ts){
  const t=source.tm.get(alias);return {tenantId:TENANT,authNamespace:'staff',visibleLogin:privateData.resolved.get(alias),role:t.role,entitlementMode:'TYA_COMPLETE',projectIds:[PROJECT_ID],active:true,createdAt:ts,updatedAt:ts,providerUidFingerprint:providerUidFp(uid),claimsDigest:t.expectedClaimsDigest,lastAdminActionId:actionId};
}
function auditDoc(kind,actionId,payload,ts){return {schemaVersion:'cxorbia.audit.user-admin.v1',tenantId:TENANT,kind,actionId,source:'C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE',createdAt:ts,...payload};}
async function readbackCanonical(auth,db,alias,uid,role,source){const u=await auth.getUser(uid);ensure(!u.disabled&&exactClaims(u,role),`CANONICAL_AUTH_READBACK_${alias}`);const d=await db.collection('tenants').doc(TENANT).collection('users').doc(uid).get();ensure(d.exists,`CANONICAL_DOC_READBACK_${alias}`);const x=d.data()||{};ensure(x.tenantId===TENANT&&norm(x.authNamespace)==='staff'&&norm(x.role)===role&&x.entitlementMode==='TYA_COMPLETE'&&JSON.stringify(uniq(x.projectIds))===JSON.stringify([PROJECT_ID])&&x.active===true&&x.claimsDigest===source.tm.get(alias).expectedClaimsDigest,`CANONICAL_DOC_CONTENT_${alias}`);report.targetReadback[alias]=true;return u;}

async function rollbackCreatedWithinCap(auth,uids,reason){report.rollback.required=true;report.rollback.reason=reason;const remaining=14-report.writes.authWritesTotal;if(uids.length>remaining)return false;for(const uid of uids){await auth.updateUser(uid,{disabled:true});report.writes.authDisableCreatedRollbackWrites++;}report.rollback.executed=true;recalc();return true;}

async function execute(){
  const source=sourcePreflight();
  if(process.argv.includes('--source-self-test')){report.decision='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_SOURCE_PREFLIGHT';writeReport();return report;}
  validateRequest(source.request);
  const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;ensure(credentialPath&&fs.existsSync(credentialPath),'SERVICE_ACCOUNT_MISSING');const sa=readJson(credentialPath);ensure(sa?.type==='service_account'&&sa.project_id===EXPECTED_PROJECT&&sa.private_key,'SERVICE_ACCOUNT_INVALID');
  const bundle=decryptProtectedBundle(sa);
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED_PROJECT});const auth=admin.auth(),db=admin.firestore();
  const privateData=await resolvePrivateIdentities(db,bundle,source.cm);
  const state=await providerPreflight(auth,db,source,privateData);
  // No provider write occurs above this line. All private identity and credential requirements are now proven in memory.
  const created=[];
  const records=['B','C','D'].map(alias=>{const u=state.targetUsers.get(alias);return {uid:u.uid,email:u.email,emailVerified:false,disabled:false,passwordHash:privateData.bundleCredential.get(alias)};});
  const importResult=await auth.importUsers(records,{hash:{algorithm:'SHA256',rounds:1}});
  report.writes.authCreates+=Number(importResult.successCount||0);recalc();
  if(importResult.failureCount!==0||importResult.successCount!==3){
    const failed=new Set((importResult.errors||[]).map(e=>e.index));const succeeded=records.filter((_,i)=>!failed.has(i)).map(r=>r.uid);await rollbackCreatedWithinCap(auth,succeeded,'PARTIAL_IMPORT');stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_PARTIAL_IMPORT');
  }
  created.push(...records.map(r=>r.uid));
  for(const alias of ['B','C','D']){
    try{await auth.setCustomUserClaims(state.targetUsers.get(alias).uid,claimsCanonical(source.tm.get(alias).role));report.writes.customClaimsWrites++;recalc();}
    catch(e){await rollbackCreatedWithinCap(auth,created,'CLAIMS_WRITE_FAILURE');stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_CLAIMS_WRITE',e);}
  }
  // Verify B/C/D Auth state before any Firestore write.
  for(const alias of ['B','C','D']){const u=await auth.getUser(state.targetUsers.get(alias).uid);if(u.disabled||!exactClaims(u,source.tm.get(alias).role)){await rollbackCreatedWithinCap(auth,created,'CLAIMS_READBACK_FAILURE');stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_CLAIMS_READBACK');}}
  // A must still be untouched and exact immediately before canonical Firestore materialization.
  const aNow=await auth.getUser(state.A.uid);if(aNow.disabled||!exactClaims(aNow,'super')){await rollbackCreatedWithinCap(auth,created,'A_DRIFT_BEFORE_FIRESTORE');stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_A_DRIFT');}
  const actionId=`c6-staff-repair-bootstrap-${sha(source.request.requestId).slice(0,20)}`;const ts=admin.firestore.Timestamp.now();const batch=db.batch();
  for(const alias of ['A','B','C','D']){const uid=alias==='A'?state.A.uid:state.targetUsers.get(alias).uid;batch.create(db.collection('tenants').doc(TENANT).collection('users').doc(uid),userDoc(alias,uid,source,privateData,actionId,ts));batch.create(db.collection('tenants').doc(TENANT).collection('auditLogs').doc(`${actionId}-canonical-${alias}`),auditDoc('staffCanonicalBootstrap',actionId,{targetAlias:alias,role:source.tm.get(alias).role,projectIds:[PROJECT_ID],providerUidFingerprint:providerUidFp(uid)},ts));}
  try{await batch.commit();report.writes.tenantUserWrites+=4;report.writes.auditLogWrites+=4;recalc();}
  catch(e){await rollbackCreatedWithinCap(auth,created,'CANONICAL_FIRESTORE_BATCH_FAILURE');stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_FIRESTORE_BATCH',e);}
  for(const alias of ['A','B','C','D']){const uid=alias==='A'?state.A.uid:state.targetUsers.get(alias).uid;await readbackCanonical(auth,db,alias,uid,source.tm.get(alias).role,source);}
  // Reverify immutable R4 canonical immediately before any R4 historical retirement.
  const r4u=await auth.getUser(state.R4.uid);const r4doc=await db.collection('tenants').doc(TENANT).collection('users').doc(state.R4.uid).get();if(r4u.disabled||!exactClaims(r4u,'cliente')||!r4doc.exists||r4doc.data()?.active===false)stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_R4_DRIFT_PRE_RETIRE');report.targetReadback.R4Canonical=true;
  const groupCanonicalPass={R1_SUPER:report.targetReadback.A,R2_ADMIN:report.targetReadback.B,R3_OPS:report.targetReadback.C,R4_CLIENT_HISTORICAL:report.targetReadback.R4Canonical};
  const disabledAudit=[];
  for(const group of ['R1_SUPER','R2_ADMIN','R3_OPS','R4_CLIENT_HISTORICAL']){
    ensure(groupCanonicalPass[group]===true,`CANONICAL_GATE_NOT_PASS_${group}`);
    const members=state.historical.get(group);
    for(const u of members){
      try{await auth.updateUser(u.uid,{disabled:true});report.writes.authDisableWrites++;recalc();const rb=await auth.getUser(u.uid);ensure(rb.disabled===true,`HISTORICAL_DISABLE_READBACK_${group}`);report.historicalReadback[group]++;disabledAudit.push({group,candidateFp:fp20(u.uid),providerUidFingerprint:providerUidFp(u.uid)});}
      catch(e){report.rollback.required=true;report.rollback.reason=`HISTORICAL_DISABLE_FAILURE_${group}`;stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_HISTORICAL_DISABLE',e);}
    }
  }
  ensure(report.writes.authCreates===3&&report.writes.customClaimsWrites===3&&report.writes.authDisableWrites===8&&report.writes.authWritesTotal===14,'FINAL_AUTH_BUDGET_MISMATCH');
  ensure(disabledAudit.length===8,'DISABLE_AUDIT_COUNT');
  const auditBatch=db.batch();const auditTs=admin.firestore.Timestamp.now();for(let i=0;i<disabledAudit.length;i++){const x=disabledAudit[i];auditBatch.create(db.collection('tenants').doc(TENANT).collection('auditLogs').doc(`${actionId}-retire-${String(i+1).padStart(2,'0')}`),auditDoc('staffHistoricalDisable',actionId,{repairAlias:x.group,candidateFingerprint:x.candidateFp,providerUidFingerprint:x.providerUidFingerprint,mode:'DISABLE_ONLY_NO_DELETE'},auditTs));}
  try{await auditBatch.commit();report.writes.auditLogWrites+=8;recalc();}catch(e){report.rollback.required=true;report.rollback.reason='RETIRE_AUDIT_BATCH_FAILURE';stop('STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_AUDIT_WRITE',e);}
  ensure(report.writes.firestoreWritesTotal===16,'FINAL_FIRESTORE_BUDGET_MISMATCH');
  // Final cumulative readback.
  for(const alias of ['A','B','C','D']){const uid=alias==='A'?state.A.uid:state.targetUsers.get(alias).uid;await readbackCanonical(auth,db,alias,uid,source.tm.get(alias).role,source);}
  const finalR4=await auth.getUser(state.R4.uid);ensure(!finalR4.disabled&&exactClaims(finalR4,'cliente'),'FINAL_R4_CANONICAL_DRIFT');
  for(const group of ['R1_SUPER','R2_ADMIN','R3_OPS','R4_CLIENT_HISTORICAL'])for(const u of state.historical.get(group)){const rb=await auth.getUser(u.uid);ensure(rb.disabled===true,`FINAL_HISTORICAL_NOT_DISABLED_${group}`);}
  const finalPage=await auth.listUsers(1000);ensure(!finalPage.pageToken&&finalPage.users.length===231,`FINAL_AUTH_POPULATION_${finalPage.users.length}`);
  report.decision='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_READBACK';report.generatedAt=nowIso();report.finalAuthPopulation=231;report.rollback.required=false;report.rollback.reason=null;writeReport();return report;
}

try{const r=await execute();console.log(JSON.stringify({decision:r.decision,authWrites:r.writes.authWritesTotal,firestoreWrites:r.writes.firestoreWritesTotal,authDeletes:r.writes.authDeletes,firestoreDeletes:r.writes.firestoreDeletes,finalAuthPopulation:r.finalAuthPopulation||null,credentialPrivacyPass:r.preflight.credentialPrivacyPass,identityResolutionPass:r.preflight.identityResolutionPass}));process.exit(r.decision.startsWith('PASS_')?0:2);}catch(e){if(!fs.existsSync(OUT)){report.blockers.push(safeErr(e));writeReport();}console.error(JSON.stringify({decision:report.decision,blockers:report.blockers.map(x=>x.code),authWrites:report.writes.authWritesTotal,firestoreWrites:report.writes.firestoreWritesTotal}));process.exit(2);}
