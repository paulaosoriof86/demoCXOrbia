#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';
import {loadStaffPrivateExecutionHandoff} from '../../backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs';

const EXPECTED_PROJECT=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const TENANT='tya';
const PROJECT_ID='cinepolis';
const REQUEST_PATH=process.env.CXORBIA_C6_STAFF_WRITE_REQUEST||'.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write-v2.json';
const CONTRACT_PATH='backend/contracts/c6-staff-repair-bootstrap-exact-write-v2.json';
const TARGETS_PATH='backend/config/c6-staff-bootstrap-targets-v1.json';
const COLLISION_PATH='backend/config/c6-staff-provider-collision-targets-v1.json';
const PREWRITE_PATH='backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json';
const SNAPSHOT_PATH='app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json';
const HANDOFF_CONTRACT_PATH='backend/contracts/c6-staff-private-execution-handoff-v1.json';
const D_REBASE_PATH='backend/contracts/c6-staff-d-technical-login-rebase-v1.json';
const OUT=process.env.CXORBIA_C6_STAFF_WRITE_OUT||'.tmp/c6-staff-repair-bootstrap-exact-write-v2/report.json';
const SOURCE_SELF_TEST=process.argv.includes('--source-self-test');

const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const norm=v=>String(v??'').trim().toLowerCase();
const uniq=v=>[...new Set((Array.isArray(v)?v:[]).map(String).filter(Boolean))].sort();
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const nowIso=()=>new Date().toISOString();
const fp20=uid=>sha(`shopper-auth-candidate-v1\0${String(uid||'').trim()}`).slice(0,20);
const providerUidFp=uid=>sha(`cxorbia-provider-uid-v1\0${String(uid||'').trim()}`);
const providerEmailFor=c=>`${String(c.technicalLoginDigest).slice(0,48)}@auth.cxorbia.invalid`;
const claimsCanonical=role=>({authNamespace:'staff',projectIds:[PROJECT_ID],role,tenantId:TENANT});
const claimsDigest=role=>sha(JSON.stringify(claimsCanonical(role)));
const safeClaims=u=>{const c=u?.customClaims||{};const canonical={authNamespace:norm(c.authNamespace),projectIds:uniq(c.projectIds),role:norm(c.role),tenantId:norm(c.tenantId)};return {canonical,digest:sha(JSON.stringify(canonical)),shopperIdPresent:Boolean(String(c.shopperId||'').trim())};};
const exactClaims=(u,role)=>{const s=safeClaims(u),e=claimsCanonical(role);return !s.shopperIdPresent&&JSON.stringify(s.canonical)===JSON.stringify(e)&&s.digest===claimsDigest(role);};
const safeErr=e=>({code:String(e?.message||e||'UNKNOWN').split(':')[0].replace(/[^A-Za-z0-9_.-]+/g,'_').slice(0,120),fingerprint:sha(String(e?.stack||e?.message||e||'UNKNOWN')).slice(0,24)});

function baseReport(){return {
  schemaVersion:'cxorbia.c6.staff-repair-bootstrap.exact-write.evidence.v2',generatedAt:nowIso(),projectId:EXPECTED_PROJECT,tenantId:TENANT,
  decision:'STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2',snapshotAuthority:{workflowRunId:31518927950,expectedAuthPopulationBefore:228},
  preflight:{sourceContract:false,requestAuthorized:false,privateHandoffValidated:false,privateRuntimeCredentialsValidated:false,providerStatePass:false,allCanonicalReadbackBeforeRetire:false},
  targetReadback:{A:false,B:false,C:false,D:false,R4Canonical:false},historicalReadback:{R1_SUPER:0,R2_ADMIN:0,R3_OPS:0,R4_CLIENT_HISTORICAL:0},
  writes:{authCreates:0,customClaimsWrites:0,authDisableWrites:0,tenantUserWrites:0,auditLogWrites:0,authWritesTotal:0,firestoreWritesTotal:0,authDeletes:0,firestoreDeletes:0},
  rollback:{executed:false,required:false,reason:null,authReenableWrites:0,authDisableCreatedWrites:0,userDocDeactivateWrites:0,auditRollbackWrites:0,deletes:0},
  credentialPrivacy:{source:'PRIVATE_RUNTIME_INGRESS_BCD_AND_ENCRYPTED_IDENTITY_HANDOFF',rawPasswordPersisted:false,rawPasswordLogged:false,rawPasswordExported:false,passwordHashReused:false,passwordHashPersisted:false,generatedUnrecoverablePassword:false,rawVisibleLoginInRepo:false,rawVisibleLoginInArtifact:false,rawVisibleLoginInLog:false,visibleLoginPersistedOnlyAsProtectedTenantUserData:true},
  blockers:[],safety:{hrWrites:0,rulesWrites:0,storageWrites:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,deploys:0,merge:false,production:false}
};}
let report=baseReport();
function recalc(){report.writes.authWritesTotal=report.writes.authCreates+report.writes.customClaimsWrites+report.writes.authDisableWrites;report.writes.firestoreWritesTotal=report.writes.tenantUserWrites+report.writes.auditLogWrites;}
function writeReport(){recalc();const dir=OUT.includes('/')?OUT.slice(0,OUT.lastIndexOf('/')):'.';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n','utf8');}
function fail(code,error){report.decision=code;report.generatedAt=nowIso();if(error)report.blockers.push(safeErr(error));writeReport();if(SOURCE_SELF_TEST)console.error(JSON.stringify({decision:report.decision,blockers:report.blockers}));throw Object.assign(new Error(code),{cxStop:true});}

function sourcePreflight(){
  const required=[REQUEST_PATH,CONTRACT_PATH,TARGETS_PATH,COLLISION_PATH,PREWRITE_PATH,SNAPSHOT_PATH,HANDOFF_CONTRACT_PATH,D_REBASE_PATH,'backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs','backend/private-inbox/c6-staff-private-execution-handoff.enc.json'];
  for(const p of required)ensure(fs.existsSync(p),`SOURCE_FILE_MISSING_${p}`);
  const request=readJson(REQUEST_PATH),contract=readJson(CONTRACT_PATH),targets=readJson(TARGETS_PATH),collision=readJson(COLLISION_PATH),prewrite=readJson(PREWRITE_PATH),snapshot=readJson(SNAPSHOT_PATH),handoffContract=readJson(HANDOFF_CONTRACT_PATH),dRebase=readJson(D_REBASE_PATH);
  ensure(contract.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.v2','CONTRACT_SCHEMA');
  ensure(contract.firebaseProjectId===EXPECTED_PROJECT&&contract.tenantId===TENANT&&contract.canonicalProjectId===PROJECT_ID,'CONTRACT_TARGET');
  ensure(contract.snapshotAuthority?.workflowRunId===31518927950&&contract.snapshotAuthority?.expectedAuthPopulationBefore===228&&contract.snapshotAuthority?.repeatProviderSnapshot===false,'CONTRACT_SNAPSHOT');
  const b=contract.forwardWriteBudget||{};ensure(b.authCreates===3&&b.customClaimsWrites===3&&b.authDisableWrites===8&&b.authWritesMax===14&&b.tenantUserWrites===4&&b.auditLogWrites===12&&b.firestoreWritesMax===16&&b.authDeletes===0&&b.firestoreDeletes===0,'CONTRACT_BUDGET');
  ensure(contract.privateIdentityHandoff?.legacyCredentialBundleMayResolveVisibleLogin===false&&contract.privateIdentityHandoff?.legacyCredentialBundleMayResolvePasswordHash===false,'LEGACY_CREDENTIAL_DEPENDENCY_FORBIDDEN');
  ensure(contract.credentialIngress?.generatedUnrecoverablePasswordAllowed===false&&contract.credentialIngress?.stopBeforeFirstProviderWriteIfMissing===true,'PRIVATE_CREDENTIAL_POLICY');
  ensure(snapshot.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE'&&snapshot.provider?.authPopulation===228&&snapshot.provider?.writes===0,'SNAPSHOT_AUTHORITY');
  ensure(snapshot.frozenForwardWriteBudget?.authWritesTotal===14&&snapshot.frozenForwardWriteBudget?.firestoreWritesTotal===16&&snapshot.rollbackDryRun?.decision==='PASS'&&snapshot.r4Canonical?.mutation==='FORBIDDEN','SNAPSHOT_BUDGET_ROLLBACK');
  ensure(handoffContract.schemaVersion==='cxorbia.c6.staff-private-execution-handoff.v1'&&handoffContract.writeBoundary?.authWritesMaxPreserved===14&&handoffContract.writeBoundary?.firestoreWritesMaxPreserved===16&&handoffContract.writeBoundary?.authDeletes===0&&handoffContract.writeBoundary?.firestoreDeletes===0,'HANDOFF_CONTRACT');
  ensure(dRebase.schemaVersion==='cxorbia.c6.staff-d-technical-login-rebase.v1','D_REBASE_CONTRACT');
  ensure(targets.schemaVersion==='cxorbia.c6.staff-bootstrap-targets.v1'&&targets.targets?.length===4,'TARGETS_SCHEMA');
  ensure(collision.schemaVersion==='cxorbia.c6.staff-provider-collision-targets.v1'&&collision.targets?.length===4,'COLLISION_SCHEMA');
  ensure(prewrite.schemaVersion==='cxorbia.c6.staff-repair-bootstrap-prewrite.v1'&&prewrite.legacyRepairGroups?.length===4,'PREWRITE_SCHEMA');
  const tm=new Map(targets.targets.map(x=>[x.targetAlias,x])),cm=new Map(collision.targets.map(x=>[x.targetAlias,x]));
  for(const alias of ['A','B','C','D']){
    const t=tm.get(alias),c=cm.get(alias);ensure(t&&c,`TARGET_MISSING_${alias}`);
    ensure(t.entitlementMode==='TYA_COMPLETE'&&JSON.stringify(t.projectIds)===JSON.stringify([PROJECT_ID]),`TARGET_SCOPE_${alias}`);
    ensure(t.role===c.role&&t.ownerIdentityAnchor===c.ownerIdentityAnchor&&t.expectedClaimsDigest===c.expectedClaimsDigest,`TARGET_BIND_${alias}`);
    ensure(t.expectedClaimsDigest===claimsDigest(t.role),`TARGET_CLAIMS_${alias}`);
    ensure(sha(providerEmailFor(c))===c.providerEmailSha256,`TARGET_PROVIDER_DIGEST_${alias}`);
    if(alias==='A')ensure(t.credentialStrategy==='REUSE_EXISTING_CANONICAL_SUPER_ONLY_IF_INDEPENDENT_OWNER_BINDING_MATCHES_OTHERWISE_NEW_EPHEMERAL','A_CREDENTIAL_STRATEGY');
    else ensure(t.credentialStrategy==='NEW_EPHEMERAL_AT_SEPARATELY_AUTHORIZED_EXECUTION','BCD_CREDENTIAL_STRATEGY');
  }
  const gm=new Map(prewrite.legacyRepairGroups.map(x=>[x.repairAlias,x]));
  for(const alias of ['R1_SUPER','R2_ADMIN','R3_OPS'])ensure(gm.get(alias)?.legacyPrincipalFingerprints?.length===2,`HISTORICAL_FINGERPRINTS_${alias}`);
  ensure(gm.get('R4_CLIENT_HISTORICAL')?.historicalPrincipalFingerprints?.length===2&&/^[a-f0-9]{64}$/.test(String(gm.get('R4_CLIENT_HISTORICAL')?.validatedCanonicalFingerprint||'')),'HISTORICAL_R4');
  report.preflight.sourceContract=true;
  return {request,contract,targets,collision,prewrite,snapshot,handoffContract,dRebase,tm,cm,gm};
}

function validateRequestShape(request,{active=false}={}){
  ensure(request.schemaVersion==='cxorbia.c6.staff-repair-bootstrap.exact-write.request.v2','REQUEST_SCHEMA');
  ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&request.firebaseProjectId===EXPECTED_PROJECT&&request.tenantId===TENANT&&request.pullRequest===7,'REQUEST_TARGET');
  ensure(request.snapshotWorkflowRunId===31518927950&&request.authWritesMax===14&&request.firestoreWritesMax===16&&request.authDeletes===0&&request.firestoreDeletes===0,'REQUEST_BUDGET');
  for(const k of ['rulesWrites','storageWrites','hrWrites','makeWrites','geminiCalls','paymentsWrites'])ensure(request[k]===0,`REQUEST_UNSAFE_${k}`);
  ensure(request.deploy===false&&request.merge===false&&request.production===false&&request.stopRetry===true&&request.allowedExecutions===1,'REQUEST_SCOPE');
  ensure(JSON.stringify(request.privateRuntimeCredentialsRequired)===JSON.stringify(['B','C','D'])&&request.privateRuntimeCredentialsPersisted===false,'REQUEST_CREDENTIAL_POLICY');
  if(active){
    ensure(request.enabled===true&&request.consumed===false&&request.authorizedBy==='Paula','REQUEST_NOT_ACTIVE');
    ensure(typeof request.authorizationText==='string'&&request.authorizationText.includes('STAFF REPAIR/BOOTSTRAP EXACT WRITE V2'),'REQUEST_AUTH_TEXT');
    ensure(/^[a-f0-9]{40}$/.test(String(request.targetHeadSha||'')),'REQUEST_TARGET_HEAD');
  }
  return true;
}

function loadPrivateRuntimePasswords(handoff){
  const out=new Map();
  for(const alias of ['B','C','D']){
    const value=String(process.env[`CXORBIA_C6_STAFF_PASSWORD_${alias}`]||'');
    ensure(value.length>=12,`PRIVATE_RUNTIME_CREDENTIAL_MISSING_${alias}`);
    ensure(value!==handoff.getVisibleLogin(alias),`PRIVATE_RUNTIME_CREDENTIAL_EQUALS_LOGIN_${alias}`);
    out.set(alias,value);
  }
  ensure(new Set([...out.values()]).size===3,'PRIVATE_RUNTIME_CREDENTIAL_REUSE_FORBIDDEN');
  report.preflight.privateRuntimeCredentialsValidated=true;
  return out;
}

async function providerPreflight(auth,db,source,handoff){
  const page=await auth.listUsers(1000);ensure(!page.pageToken,'AUTH_SECOND_PAGE_FORBIDDEN');ensure(page.users.length===228,`AUTH_POPULATION_DRIFT_${page.users.length}`);
  const users=page.users,byFp=new Map(users.map(u=>[fp20(u.uid),u]));
  const historical=new Map();
  for(const alias of ['R1_SUPER','R2_ADMIN','R3_OPS','R4_CLIENT_HISTORICAL']){
    const g=source.gm.get(alias),fps=alias==='R4_CLIENT_HISTORICAL'?g.historicalPrincipalFingerprints:g.legacyPrincipalFingerprints;
    const arr=[];for(const fp of fps){const u=byFp.get(fp);ensure(u,`HISTORICAL_MISSING_${alias}`);ensure(!u.disabled,`HISTORICAL_DISABLED_DRIFT_${alias}`);arr.push(u);}historical.set(alias,arr);
  }
  const tenantUsers=await db.collection('tenants').doc(TENANT).collection('users').select('visibleLogin','authNamespace').get();
  const liveLoginDigests=new Set();
  for(const doc of tenantUsers.docs){const d=doc.data()||{};if(norm(d.authNamespace||'staff')==='staff'&&norm(d.visibleLogin))liveLoginDigests.add(sha(`${TENANT}\0staff\0${norm(d.visibleLogin)}`));}
  const canonicals=new Map();
  for(const alias of ['A','B','C','D']){
    const cfg=source.cm.get(alias),login=handoff.getVisibleLogin(alias);
    ensure(sha(`${TENANT}\0staff\0${login}`)===cfg.technicalLoginDigest,`HANDOFF_POST_DECRYPT_DIGEST_${alias}`);
    const matches=users.filter(u=>sha(norm(u.email))===cfg.providerEmailSha256);
    ensure(!liveLoginDigests.has(cfg.technicalLoginDigest),`TARGET_VISIBLE_LOGIN_DOC_COLLISION_${alias}`);
    if(alias==='A'){
      ensure(matches.length===1,'A_CANONICAL_PROVIDER_MATCH');ensure(!matches[0].disabled&&exactClaims(matches[0],source.tm.get(alias).role),'A_CANONICAL_STATE_DRIFT');canonicals.set(alias,matches[0]);
    }else ensure(matches.length===0,`CANONICAL_COLLISION_${alias}`);
  }
  const r4cfg=source.gm.get('R4_CLIENT_HISTORICAL');
  const r4Matches=users.filter(u=>sha(String(u.uid))===r4cfg.validatedCanonicalFingerprint);ensure(r4Matches.length===1,'R4_CANONICAL_MATCH');
  const R4=r4Matches[0];ensure(!R4.disabled&&exactClaims(R4,'cliente'),'R4_CANONICAL_CLAIMS_DRIFT');
  const r4Doc=await db.collection('tenants').doc(TENANT).collection('users').doc(R4.uid).get();ensure(r4Doc.exists,'R4_CANONICAL_MEMBERSHIP_MISSING');
  const r4d=r4Doc.data()||{};ensure(r4d.active!==false&&norm(r4d.tenantId)===TENANT&&norm(r4d.authNamespace||'staff')==='staff'&&norm(r4d.role)==='cliente'&&JSON.stringify(uniq(r4d.projectIds))===JSON.stringify([PROJECT_ID]),'R4_CANONICAL_MEMBERSHIP_DRIFT');
  for(const alias of ['A','B','C','D']){
    const u=canonicals.get(alias);if(!u&&alias!=='A')continue;
    const ref=db.collection('tenants').doc(TENANT).collection('users').doc(u.uid);ensure(!(await ref.get()).exists,`TARGET_USER_DOC_ALREADY_EXISTS_${alias}`);
  }
  report.preflight.providerStatePass=true;report.targetReadback.R4Canonical=true;
  return {users,historical,canonicals,R4};
}

async function writeAudit(db,requestId,action,stableKey,data={}){
  const id=sha(`cxorbia-c6-staff-v2-audit\0${requestId}\0${action}\0${stableKey}`);
  const ref=db.collection('tenants').doc(TENANT).collection('auditLogs').doc(id);ensure(!(await ref.get()).exists,`AUDIT_ALREADY_EXISTS_${action}`);
  await ref.set({action,operationId:id,requestId,tenantId:TENANT,source:'C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2',...data,createdAt:admin.firestore.FieldValue.serverTimestamp()},{merge:false});
  report.writes.auditLogWrites++;
  return id;
}

async function createTenantUserDoc(db,requestId,alias,user,login,role){
  const digest=claimsDigest(role),opId=sha(`cxorbia-c6-staff-v2-userdoc\0${requestId}\0${alias}`);
  const ref=db.collection('tenants').doc(TENANT).collection('users').doc(user.uid);ensure(!(await ref.get()).exists,`TARGET_USER_DOC_ALREADY_EXISTS_${alias}`);
  await ref.set({tenantId:TENANT,authNamespace:'staff',visibleLogin:login,role,entitlementMode:'TYA_COMPLETE',projectIds:[PROJECT_ID],active:true,providerUidFingerprint:providerUidFp(user.uid),claimsDigest:digest,lastAdminActionId:opId,createdAt:admin.firestore.FieldValue.serverTimestamp(),updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:false});
  report.writes.tenantUserWrites++;
  await writeAudit(db,requestId,alias==='A'?'STAFF_CANONICAL_ADOPT':'STAFF_CANONICAL_CREATE',alias,{targetAlias:alias,role,providerUidFingerprint:providerUidFp(user.uid),claimsDigest:digest});
  return {ref,digest};
}

async function canonicalReadback(auth,db,source,created,handoff){
  for(const alias of ['A','B','C','D']){
    const u=created.get(alias);ensure(u,`CANONICAL_MISSING_${alias}`);
    const au=await auth.getUser(u.uid);ensure(!au.disabled&&exactClaims(au,source.tm.get(alias).role),`CANONICAL_AUTH_READBACK_${alias}`);
    const doc=await db.collection('tenants').doc(TENANT).collection('users').doc(u.uid).get();ensure(doc.exists,`CANONICAL_DOC_READBACK_${alias}`);
    const d=doc.data()||{};ensure(d.active===true&&norm(d.visibleLogin)===handoff.getVisibleLogin(alias)&&norm(d.role)===source.tm.get(alias).role&&d.entitlementMode==='TYA_COMPLETE'&&JSON.stringify(uniq(d.projectIds))===JSON.stringify([PROJECT_ID])&&d.claimsDigest===claimsDigest(source.tm.get(alias).role),`CANONICAL_DOC_DRIFT_${alias}`);
    report.targetReadback[alias]=true;
  }
  report.preflight.allCanonicalReadbackBeforeRetire=true;
}

async function retireHistorical(auth,db,historical,requestId,mutations){
  for(const alias of ['R1_SUPER','R2_ADMIN','R3_OPS','R4_CLIENT_HISTORICAL']){
    let count=0;
    for(const u of historical.get(alias)){
      await auth.updateUser(u.uid,{disabled:true});report.writes.authDisableWrites++;mutations.disabledHistorical.push(u.uid);
      const rb=await auth.getUser(u.uid);ensure(rb.disabled===true,`HISTORICAL_DISABLE_READBACK_${alias}`);count++;
      await writeAudit(db,requestId,'STAFF_HISTORICAL_DISABLE',`${alias}:${fp20(u.uid)}`,{repairAlias:alias,providerUidFingerprint:providerUidFp(u.uid),mode:'DISABLE_ONLY_NO_DELETE'});
    }
    report.historicalReadback[alias]=count;
  }
}

async function rollback(auth,db,requestId,mutations,error){
  report.rollback.required=true;report.rollback.reason=safeErr(error).code;
  for(const uid of [...mutations.disabledHistorical].reverse()){
    try{await auth.updateUser(uid,{disabled:false});report.rollback.authReenableWrites++;await writeRollbackAudit(db,requestId,'ROLLBACK_HISTORICAL_REENABLE',providerUidFp(uid));}catch{}
  }
  for(const [alias,u] of [...mutations.created.entries()].reverse()){
    try{await auth.updateUser(u.uid,{disabled:true});report.rollback.authDisableCreatedWrites++;}catch{}
    if(mutations.userDocs.has(u.uid)){try{await db.collection('tenants').doc(TENANT).collection('users').doc(u.uid).set({active:false,rollbackOf:requestId,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});report.rollback.userDocDeactivateWrites++;}catch{}}
    try{await writeRollbackAudit(db,requestId,'ROLLBACK_CANONICAL_DISABLE',alias);}catch{}
  }
  if(mutations.aUserDocUid&&mutations.userDocs.has(mutations.aUserDocUid)){
    try{await db.collection('tenants').doc(TENANT).collection('users').doc(mutations.aUserDocUid).set({active:false,rollbackOf:requestId,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});report.rollback.userDocDeactivateWrites++;await writeRollbackAudit(db,requestId,'ROLLBACK_CANONICAL_ADOPT_DOC','A');}catch{}
  }
  report.rollback.executed=true;
}
async function writeRollbackAudit(db,requestId,action,stableKey){
  const id=sha(`cxorbia-c6-staff-v2-rollback\0${requestId}\0${action}\0${stableKey}`);
  await db.collection('tenants').doc(TENANT).collection('auditLogs').doc(id).set({action,operationId:id,requestId,tenantId:TENANT,source:'C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_ROLLBACK',createdAt:admin.firestore.FieldValue.serverTimestamp()},{merge:false});
  report.rollback.auditRollbackWrites++;
}

async function main(){
  let source;try{source=sourcePreflight();validateRequestShape(source.request,{active:!SOURCE_SELF_TEST});}catch(error){return fail(SOURCE_SELF_TEST?'STOP_C6_STAFF_V2_SOURCE_PREFLIGHT':'STOP_RETRY_C6_STAFF_V2_SOURCE_PREFLIGHT',error);}
  if(SOURCE_SELF_TEST){report.decision='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_SOURCE_PREFLIGHT';writeReport();return;}
  report.preflight.requestAuthorized=true;
  const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;ensure(credentialPath&&fs.existsSync(credentialPath),'SERVICE_ACCOUNT_PATH_MISSING');
  const sa=readJson(credentialPath);ensure(sa.type==='service_account'&&sa.project_id===EXPECTED_PROJECT&&sa.private_key,'SERVICE_ACCOUNT_INVALID');
  let handoff,passwords;
  try{handoff=loadStaffPrivateExecutionHandoff({credentialPath});report.preflight.privateHandoffValidated=true;passwords=loadPrivateRuntimePasswords(handoff);}catch(error){return fail('STOP_RETRY_C6_STAFF_V2_PRIVATE_BOUNDARY',error);}
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED_PROJECT});
  const auth=admin.auth(),db=admin.firestore();
  const mutations={created:new Map(),disabledHistorical:[],userDocs:new Set(),aUserDocUid:null};
  try{
    const live=await providerPreflight(auth,db,source,handoff);
    const canonical=new Map();canonical.set('A',live.canonicals.get('A'));
    for(const alias of ['B','C','D']){
      const cfg=source.cm.get(alias),role=source.tm.get(alias).role,email=providerEmailFor(cfg),password=passwords.get(alias);
      const u=await auth.createUser({email,password,disabled:false});report.writes.authCreates++;mutations.created.set(alias,u);canonical.set(alias,u);
      await auth.setCustomUserClaims(u.uid,claimsCanonical(role));report.writes.customClaimsWrites++;
    }
    for(const alias of ['A','B','C','D']){
      const u=canonical.get(alias),login=handoff.getVisibleLogin(alias),role=source.tm.get(alias).role;
      await createTenantUserDoc(db,source.request.requestId,alias,u,login,role);mutations.userDocs.add(u.uid);if(alias==='A')mutations.aUserDocUid=u.uid;
    }
    await canonicalReadback(auth,db,source,canonical,handoff);
    const r4rb=await auth.getUser(live.R4.uid);ensure(!r4rb.disabled&&exactClaims(r4rb,'cliente'),'R4_READBACK_BEFORE_RETIRE');report.targetReadback.R4Canonical=true;
    await retireHistorical(auth,db,live.historical,source.request.requestId,mutations);
    const after=await auth.listUsers(1000);ensure(!after.pageToken&&after.users.length===231,`AUTH_POPULATION_AFTER_${after.users.length}`);
    recalc();ensure(report.writes.authWritesTotal===14&&report.writes.firestoreWritesTotal===16,'FINAL_WRITE_BUDGET_MISMATCH');
    ensure(Object.values(report.targetReadback).every(Boolean)&&Object.values(report.historicalReadback).every(v=>v===2),'FINAL_READBACK_MISMATCH');
    report.decision='PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK';report.generatedAt=nowIso();writeReport();
  }catch(error){
    try{await rollback(auth,db,source.request.requestId,mutations,error);}catch{}
    report.blockers.push(safeErr(error));report.decision='STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2';report.generatedAt=nowIso();writeReport();process.exitCode=1;
  }finally{
    for(const k of passwords?.keys?.()||[])passwords.set(k,'');passwords?.clear?.();handoff?.dispose?.();
  }
}

await main();