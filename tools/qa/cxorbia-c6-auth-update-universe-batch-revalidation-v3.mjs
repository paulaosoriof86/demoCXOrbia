#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
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
  decryptCredentialBundle
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import {
  resolveEquivalentNames,
  stableAuthCandidateFingerprint
} from './cxorbia-c6-shopper-equivalent-universe.mjs';

const INPUT_DIGEST='7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749';
const EXPECTED_UPDATE_ROWS=45;
const EXPECTED_SYSTEMIC_RISK_ROWS=36;
const TECH_KEYS=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'];
const root=process.cwd();
const requestPath=process.argv[2]||'backend/config/c6-auth-update-universe-batch-revalidation-request-v5.json';
const planPath=process.argv[3]||process.env.CXORBIA_C6_UPDATE_BATCH_PLAN;
const riskEvidencePath=process.argv[4]||'app/docs/evidence/C6-AUTH-ACTIVATION-V2-PREWRITE-SYSTEMIC-SUFFIX-COLLISION-RISK-20260807.json';
const exportDir=path.resolve(process.env.CXORBIA_C6_UPDATE_BATCH_OUT||path.join(root,'.tmp/c6-auth-update-universe-batch-v3'));
const serviceAccountPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

const uniq=values=>[...new Set(values.filter(Boolean))];
const add=(map,key,value)=>{const k=text(key);if(!k)return;if(!map.has(k))map.set(k,[]);map.get(k).push(value);};
const fp=(kind,value)=>fingerprint(`${kind}\0${value}`);
const stablePlanProfileFingerprint=profileId=>fp('deterministic-suffix-plan-profile',profileId);
const stableBaseLoginFingerprint=login=>fp('base-login',login);
const stableTargetLoginFingerprint=login=>fp('target-login',login);
const rowsDigest=rows=>sha256(JSON.stringify(rows));
const ensure=(v,code)=>{if(!v)throw new Error(code);};
const canonicalClaims=(shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID)=>({tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId});
const exactClaims=(claims,shopperId,tenantId=TENANT_ID,projectId=CANONICAL_PROJECT_ID)=>claims?.tenantId===tenantId&&claims?.role==='shopper'&&claims?.authNamespace==='shopper'&&claims?.shopperId===shopperId&&Array.isArray(claims?.projectIds)&&claims.projectIds.length===1&&claims.projectIds[0]===projectId;
const userProviderHasPassword=user=>(user.providerData||[]).some(p=>p.providerId==='password')||Boolean(user.email);

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
  for(const key of TECH_KEYS){const raw=value?.[key];for(const item of Array.isArray(raw)?raw:[raw])add(index,text(item),shopperId);}
}
async function listAllUsersOnePage(auth){
  const page=await auth.listUsers(1000);
  if(page.pageToken)throw new Error('AUTH_DIRECTORY_MORE_THAN_ONE_PAGE');
  return page.users;
}
function deterministicSuffix(tenantId,shopperId,length){return sha256(`${tenantId}\0${shopperId}`).slice(0,length);}
function resolveTargetLogin(planRow,names,profileId,tenantId){
  if(!planRow.targetLoginFp)return '';
  if(!names?.baseLogin)throw new Error('TARGET_LOGIN_BASE_MISSING');
  if(planRow.baseLoginFp!==stableBaseLoginFingerprint(names.baseLogin))throw new Error('BASE_LOGIN_FP_DRIFT');
  const candidates=[names.baseLogin,...[4,6,8].map(length=>`${names.baseLogin}.${deterministicSuffix(tenantId,profileId,length)}`)];
  const matches=candidates.filter(login=>stableTargetLoginFingerprint(login)===planRow.targetLoginFp);
  if(matches.length!==1)throw new Error(`TARGET_LOGIN_FP_NOT_UNIQUE_${matches.length}`);
  return matches[0];
}
function gatherCandidatesTargetSpecific(profileId,credentials,targetLogin,authByShopperId,authByEmail){
  const candidates=[...(authByShopperId.get(profileId)||[])];
  for(const record of credentials||[]){
    const login=norm(record.normalizedLogin||record.loginIdentifier);
    if(login)candidates.push(...(authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]));
  }
  if(targetLogin)candidates.push(...(authByEmail.get(norm(internalEmail(targetLogin,'shopper',TENANT_ID)))||[]));
  const seen=new Set();return candidates.filter(user=>!seen.has(user.uid)&&seen.add(user.uid));
}
function countPlan(rows){
  const operationCounts={CREATE_AUTH:0,UPDATE_AUTH:0,NO_OP:0,HOLD:0,PRESERVE_NO_AUTH:0};
  const subchangeCounts={email:0,password:0,claims:0};
  for(const row of rows){ensure(Object.hasOwn(operationCounts,row.primary),'UNKNOWN_PRIMARY');operationCounts[row.primary]++;for(const k of Object.keys(subchangeCounts))if(row.changes?.[k]===true)subchangeCounts[k]++;}
  return {operationCounts,subchangeCounts};
}
function protectedCandidateOwners(plan){
  const map=new Map();
  const claim=(candidateFp,profileFp,kind)=>{if(!candidateFp)return;const prior=map.get(candidateFp);if(prior&&prior.profileFp!==profileFp)throw new Error('SOURCE_PROTECTED_CANDIDATE_ALIAS');map.set(candidateFp,{profileFp,kind});};
  for(const row of plan.rows){
    claim(row.preserveAuthCandidateFingerprint,row.profileFp,'preserve');
    claim(row.secondaryAuthDisposition?.keeperCandidateFingerprint,row.profileFp,'secondary_keeper');
    claim(row.secondaryAuthDisposition?.retireAccessCandidateFingerprint,row.profileFp,'secondary_retire');
  }
  return map;
}
function rebuild(plan,classification,authUsersBefore){
  const next=structuredClone(plan);
  next.schemaVersion='cxorbia.c6.shopper-auth-final-plan.v4';
  next.generatedAt=new Date().toISOString();
  next.sourceLineage={...(next.sourceLineage||{}),updateUniverseBatchRevalidation:'C6_AUTH_UPDATE_UNIVERSE_BATCH_REVALIDATION_V3_FULL_45',priorPlanDigest:INPUT_DIGEST};
  const byFp=new Map(classification.map(x=>[x.profileFp,x]));
  for(const row of next.rows){
    if(row.primary!=='UPDATE_AUTH')continue;
    const c=byFp.get(row.profileFp);ensure(c,'CLASSIFICATION_ROW_MISSING');
    const priorPassword=Boolean(row.changes?.password);
    if(c.unresolved){row.primary='HOLD';row.changes={email:false,password:false,claims:false};}
    else if(c.candidateCount===0){row.primary='CREATE_AUTH';row.changes={email:false,password:false,claims:false};}
    else{
      const changes={email:Boolean(c.emailDiff),password:priorPassword,claims:Boolean(c.claimsDiff)};
      row.primary=Object.values(changes).some(Boolean)?'UPDATE_AUTH':'NO_OP';row.changes=changes;
    }
    row.batchRevalidation={
      version:'v3-full-45',priorPrimary:'UPDATE_AUTH',candidateCount:c.candidateCount,candidateClass:c.candidateClass,
      systemicRiskAdvisoryFlag:c.systemicRiskAdvisoryFlag,crossRowAssociation:c.crossRowAssociation,unresolved:c.unresolved,
      unresolvedReasons:c.unresolvedReasons,
      passwordFlagBasis:c.candidateCount===1&&!c.unresolved?'PRESERVED_V3_WITHOUT_PASSWORD_PROBE':'NOT_APPLICABLE'
    };
  }
  const summary=countPlan(next.rows),digest=rowsDigest(next.rows),holdZero=summary.operationCounts.HOLD===0;
  next.plan={rows:340,uniqueRows:340,operationCounts:summary.operationCounts,subchangeCounts:summary.subchangeCounts,sourceSafeRowsDigestSha256:digest,onePrimaryOperationPerProfile:true,holdZero,expectedAuthUsersBefore:authUsersBefore,expectedAuthUsersAfterIfFullyExecutable:authUsersBefore+summary.operationCounts.CREATE_AUTH,globalExistingPrincipalUniquenessRequired:true,executable:false,executableReason:holdZero?'BATCH_REVALIDATION_COMPLETE_PENDING_SEPARATE_PREWRITE_AUTH_AUTHORIZATION':'BATCH_REVALIDATION_HAS_UNRESOLVED_HOLD'};
  next.safety={sourceSafe:true,containsPii:false,containsRawUid:false,containsRawEmail:false,containsRawPassword:false,containsPasswordMaterial:false,repositorySafe:true};
  return next;
}
function selfTest(){
  const sample={rows:[
    {profileFp:'p0',primary:'UPDATE_AUTH',changes:{email:true,password:false,claims:true}},
    {profileFp:'p1',primary:'UPDATE_AUTH',changes:{email:true,password:true,claims:false}},
    {profileFp:'p2',primary:'UPDATE_AUTH',changes:{email:true,password:false,claims:true}}
  ],sourceLineage:{}};
  const cls=[
    {profileFp:'p0',candidateCount:0,candidateClass:'0',systemicRiskAdvisoryFlag:true,crossRowAssociation:false,unresolved:false,unresolvedReasons:[],emailDiff:null,claimsDiff:null},
    {profileFp:'p1',candidateCount:1,candidateClass:'1',systemicRiskAdvisoryFlag:false,crossRowAssociation:false,unresolved:false,unresolvedReasons:[],emailDiff:false,claimsDiff:false},
    {profileFp:'p2',candidateCount:2,candidateClass:'>1',systemicRiskAdvisoryFlag:false,crossRowAssociation:true,unresolved:true,unresolvedReasons:['MULTI_CANDIDATE'],emailDiff:null,claimsDiff:null}
  ];
  const n=rebuild(sample,cls,10);ensure(n.rows[0].primary==='CREATE_AUTH','SELFTEST_ZERO');ensure(n.rows[1].primary==='UPDATE_AUTH'&&n.rows[1].changes.password===true,'SELFTEST_ONE');ensure(n.rows[2].primary==='HOLD','SELFTEST_MULTI');
  console.log('PASS_C6_AUTH_UPDATE_UNIVERSE_BATCH_V3_SELFTEST');
}

async function main(){
  fs.mkdirSync(exportDir,{recursive:true});
  const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
  const contract=JSON.parse(fs.readFileSync(request.contract,'utf8'));
  const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
  const riskEvidence=JSON.parse(fs.readFileSync(riskEvidencePath,'utf8'));
  ensure(request.schemaVersion==='cxorbia.c6.auth-update-universe-batch-revalidation.request.v1','REQUEST_SCHEMA');
  ensure(request.enabled===true&&request.consumed===false&&request.allowedExecutions===1&&request.authorizedBy==='Paula','REQUEST_AUTH');
  ensure(contract.schemaVersion==='cxorbia.c6.auth-update-universe-batch-revalidation.contract.v1','CONTRACT_SCHEMA');
  ensure(plan.schemaVersion==='cxorbia.c6.shopper-auth-final-plan.v3'&&plan.rows?.length===340&&new Set(plan.rows.map(r=>r.profileFp)).size===340,'PLAN_SHAPE');
  ensure(rowsDigest(plan.rows)===INPUT_DIGEST&&plan.plan?.sourceSafeRowsDigestSha256===INPUT_DIGEST,'PLAN_DIGEST');
  const updateRows=plan.rows.filter(r=>r.primary==='UPDATE_AUTH');ensure(updateRows.length===EXPECTED_UPDATE_ROWS,'UPDATE_SCOPE_NOT_45');
  ensure(riskEvidence.classification==='SYSTEMIC_SUFFIXED_UPDATE_SHARED_BASELOGIN_ALIAS_RISK','RISK_CLASSIFICATION_DRIFT');
  ensure(riskEvidence.systemicFinding?.remainingCurrentUpdateRowsInSameStructuralRiskClass===EXPECTED_SYSTEMIC_RISK_ROWS,'RISK_SUMMARY_NOT_36');
  const advisoryRiskRows=new Set((riskEvidence.remainingRiskRows||[]).map(r=>r.profileFp).filter(Boolean));
  ensure(serviceAccountPath&&fs.existsSync(serviceAccountPath),'SERVICE_ACCOUNT_MISSING');
  const serviceAccount=JSON.parse(fs.readFileSync(serviceAccountPath,'utf8'));ensure(serviceAccount.project_id===EXPECTED_FIREBASE_PROJECT,'SERVICE_ACCOUNT_PROJECT');
  const credential=admin.credential.cert(serviceAccount);if(!admin.apps.length)admin.initializeApp({credential,projectId:EXPECTED_FIREBASE_PROJECT});
  const auth=admin.auth(),db=admin.firestore();
  const bundle=decryptCredentialBundle({serviceAccount});
  const tenantRef=db.collection('tenants').doc(TENANT_ID),projectRef=tenantRef.collection('projects').doc(CANONICAL_PROJECT_ID);
  const [authUsers,profileSnap,hrSnap,visitSnap,certSnap,liqSnap]=await Promise.all([
    listAllUsersOnePage(auth),tenantRef.collection('shoppers').get(),projectRef.collection('hrImports').get(),projectRef.collection('visits').get(),db.collectionGroup('certifications').get(),db.collectionGroup('liquidations').get()
  ]);
  ensure(authUsers.length===110,'AUTH_POPULATION_DRIFT');ensure(profileSnap.docs.length===340,'SHOPPER_POPULATION_DRIFT');
  const profiles=new Map(profileSnap.docs.map(doc=>[doc.id,{id:doc.id,...(doc.data()||{})}]));
  const profileByFp=new Map([...profiles.values()].map(profile=>[stablePlanProfileFingerprint(profile.id),profile]));ensure(profileByFp.size===340&&updateRows.every(row=>profileByFp.has(row.profileFp)),'PROFILE_SET_DRIFT');
  const relationIndex=new Map();for(const profile of profiles.values()){add(relationIndex,profile.id,profile.id);for(const key of TECH_KEYS)add(relationIndex,profile[key],profile.id);}
  const linkedByProfile=new Map();
  const link=(shopperId,source,mode)=>{if(!profiles.has(shopperId))return;if(!linkedByProfile.has(shopperId))linkedByProfile.set(shopperId,[]);linkedByProfile.get(shopperId).push({...source,__linkMode:mode});propagateTechKeys(relationIndex,source,shopperId);};
  for(const [basis,snap] of [['hr',hrSnap],['visit',visitSnap],['certification',certSnap],['liquidation',liqSnap]])for(const doc of snap.docs){
    const rootData=doc.data()||{};
    for(const source of [{value:rootData,basis},...recursiveObjects(rootData,basis)]){
      const direct=text(source.value.shopperId||source.value.profileId||source.value.shopperDocId);
      if(direct&&profiles.has(direct)){link(direct,source,'direct_shopper_id');continue;}
      const candidates=[];for(const key of TECH_KEYS)candidates.push(...(relationIndex.get(text(source.value[key]))||[]));const exact=uniq(candidates);if(exact.length===1)link(exact[0],source,'exact_technical_anchor');
    }
  }
  const authByEmail=new Map(),authByShopperId=new Map();
  for(const user of authUsers){if(user.email)add(authByEmail,norm(user.email),user);const sid=text(user.customClaims?.shopperId);if(sid)add(authByShopperId,sid,user);}
  const credentialRecords=(Array.isArray(bundle.records)?bundle.records:[]).filter(r=>r?.kind==='shopper');const credentialsByProfile=new Map();let credentialsMapped=0;
  for(const record of credentialRecords){
    const login=norm(record.normalizedLogin||record.loginIdentifier),legacy=text(record.legacyId||record.legacyShopperId||record.externalShopperId),candidates=[];
    if(legacy)candidates.push(...(relationIndex.get(legacy)||[]));
    if(login){for(const user of authByEmail.get(norm(internalEmail(login,'shopper',TENANT_ID)))||[]){const sid=text(user.customClaims?.shopperId);if(profiles.has(sid))candidates.push(sid);}}
    const exact=uniq(candidates);if(exact.length===1){credentialsMapped++;if(!credentialsByProfile.has(exact[0]))credentialsByProfile.set(exact[0],[]);credentialsByProfile.get(exact[0]).push(record);}
  }
  const credentialsUnmapped=credentialRecords.length-credentialsMapped;ensure(credentialsMapped===101&&credentialsUnmapped===8,'CREDENTIAL_CROSSWALK_DRIFT');
  const namesByProfile=new Map();for(const profile of profiles.values())namesByProfile.set(profile.id,resolveEquivalentNames(profile,linkedByProfile.get(profile.id)||[],credentialsByProfile.get(profile.id)||[]));
  const protectedOwners=protectedCandidateOwners(plan),raw=[];
  for(const planRow of updateRows){
    const profile=profileByFp.get(planRow.profileFp),credentials=credentialsByProfile.get(profile.id)||[],names=namesByProfile.get(profile.id);
    let targetLogin='',targetEmail='',reconstructionError=null,candidates=[];
    try{ensure(names?.complete,'NAMES_INCOMPLETE');targetLogin=resolveTargetLogin(planRow,names,profile.id,TENANT_ID);targetEmail=internalEmail(targetLogin,'shopper',TENANT_ID);candidates=gatherCandidatesTargetSpecific(profile.id,credentials,targetLogin,authByShopperId,authByEmail);}catch(error){reconstructionError=String(error?.message||error).replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,160);}
    raw.push({planRow,profileId:profile.id,targetEmail,reconstructionError,candidates,systemicRiskAdvisoryFlag:advisoryRiskRows.has(planRow.profileFp)});
  }
  ensure(raw.length===EXPECTED_UPDATE_ROWS,'BATCH_CLASSIFICATION_INCOMPLETE');
  const candidateRows=new Map(),uidRows=new Map();
  for(const item of raw)for(const user of item.candidates){
    const cfp=stableAuthCandidateFingerprint(user.uid);if(!candidateRows.has(cfp))candidateRows.set(cfp,new Set());candidateRows.get(cfp).add(item.planRow.profileFp);
    if(!uidRows.has(user.uid))uidRows.set(user.uid,new Set());uidRows.get(user.uid).add(item.planRow.profileFp);
  }
  const classification=[];
  for(const item of raw){
    const candidateFps=item.candidates.map(u=>stableAuthCandidateFingerprint(u.uid));
    const candidateCount=item.reconstructionError?null:item.candidates.length;
    const candidateClass=item.reconstructionError?'UNRESOLVED':candidateCount===0?'0':candidateCount===1?'1':'>1';
    const unresolvedReasons=[];
    if(item.reconstructionError)unresolvedReasons.push(`TARGET_RECONSTRUCTION:${item.reconstructionError}`);
    if(!item.reconstructionError&&candidateCount>1)unresolvedReasons.push('MULTI_CANDIDATE');
    let emailDiff=null,claimsDiff=null,crossRowAssociation=false,claimOwnerProfileFp=null,targetEmailCollision=false,passwordProviderMissing=false,protectedOwnerProfileFp=null;
    if(!item.reconstructionError&&candidateCount===1){
      const user=item.candidates[0],cfp=candidateFps[0];
      if((candidateRows.get(cfp)||new Set()).size>1){crossRowAssociation=true;unresolvedReasons.push('BATCH_CROSS_ROW_CANDIDATE_ALIAS');}
      if((uidRows.get(user.uid)||new Set()).size>1){crossRowAssociation=true;unresolvedReasons.push('BATCH_CROSS_ROW_UID_ALIAS');}
      const claimSid=text(user.customClaims?.shopperId);
      if(claimSid&&profiles.has(claimSid)){claimOwnerProfileFp=stablePlanProfileFingerprint(claimSid);if(claimOwnerProfileFp!==item.planRow.profileFp){crossRowAssociation=true;unresolvedReasons.push('CURRENT_CLAIM_POINTS_TO_OTHER_PROFILE');}}
      const protectedOwner=protectedOwners.get(cfp);
      if(protectedOwner&&protectedOwner.profileFp!==item.planRow.profileFp){protectedOwnerProfileFp=protectedOwner.profileFp;crossRowAssociation=true;unresolvedReasons.push('PROTECTED_SOURCE_OWNER_CONFLICT');}
      const owners=authByEmail.get(norm(item.targetEmail))||[];
      if(owners.some(owner=>owner.uid!==user.uid)){targetEmailCollision=true;unresolvedReasons.push('TARGET_EMAIL_COLLISION');}
      passwordProviderMissing=!userProviderHasPassword(user);if(passwordProviderMissing)unresolvedReasons.push('PASSWORD_PROVIDER_MISSING');
      emailDiff=norm(user.email)!==norm(item.targetEmail);claimsDiff=!exactClaims(user.customClaims||{},item.profileId);
    }
    const unresolved=unresolvedReasons.length>0;
    classification.push({profileFp:item.planRow.profileFp,currentPrimary:'UPDATE_AUTH',systemicRiskAdvisoryFlag:item.systemicRiskAdvisoryFlag,candidateCount,candidateClass,candidateFingerprints:candidateFps,crossRowAssociation,claimOwnerProfileFp,protectedOwnerProfileFp,targetEmailCollision,passwordProviderMissing,emailDiff,claimsDiff,currentPasswordChangeFlag:Boolean(item.planRow.changes?.password),unresolved,unresolvedReasons});
  }
  ensure(classification.length===EXPECTED_UPDATE_ROWS,'CLASSIFICATION_OUTPUT_NOT_45');
  const counts={zero:classification.filter(x=>x.candidateClass==='0').length,one:classification.filter(x=>x.candidateClass==='1').length,multi:classification.filter(x=>x.candidateClass==='>1').length,unresolvedReconstruction:classification.filter(x=>x.candidateClass==='UNRESOLVED').length,crossRow:classification.filter(x=>x.crossRowAssociation).length,unresolved:classification.filter(x=>x.unresolved).length};
  const rebuilt=rebuild(plan,classification,authUsers.length);
  const decision=counts.unresolved>0?'STOP_RETRY_C6_AUTH_UPDATE_UNIVERSE_BATCH_REVALIDATION_UNRESOLVED':'PASS_C6_AUTH_UPDATE_UNIVERSE_BATCH_REVALIDATION_PLAN_V4';
  const advisoryCurrentUpdates=classification.filter(x=>x.systemicRiskAdvisoryFlag).length;
  const evidence={
    schemaVersion:'cxorbia.c6.auth-update-universe-batch-revalidation.evidence.v3',generatedAt:new Date().toISOString(),decision,requestId:request.requestId,
    inputPlan:{rows:340,updateRows:45,digest:INPUT_DIGEST},
    providerRead:{attempts:1,authDirectoryPages:1,authUsers:authUsers.length,shopperDocuments:profileSnap.docs.length,hrDocuments:hrSnap.docs.length,visitDocuments:visitSnap.docs.length,certificationDocuments:certSnap.docs.length,liquidationDocuments:liqSnap.docs.length,credentialRecords:credentialRecords.length,credentialsMapped,credentialsUnmapped},
    systemicRisk:{classification:'SYSTEMIC_SUFFIXED_UPDATE_SHARED_BASELOGIN_ALIAS_RISK',expectedRows:EXPECTED_SYSTEMIC_RISK_ROWS,expectedCountSource:'VERSIONED_SYSTEMIC_FINDING',advisoryRowsIntersectingCurrentUpdates:advisoryCurrentUpdates,exactRiskMembershipNotRequiredForExecution:true,coveredByFullUpdateUniverse:true,coverageProof:'ALL_45_CURRENT_UPDATE_AUTH_ROWS_CLASSIFIED_AS_SUPERSET_OF_36_RISK_ROWS'},
    classificationSummary:{rows:45,all45UpdateRowsClassified:true,riskUniverseExpected:EXPECTED_SYSTEMIC_RISK_ROWS,systemicRiskUniverseIncludedByFullUpdateScope:true,...counts},classification,
    rebuiltPlan:{rows:340,uniqueRows:340,operationCounts:rebuilt.plan.operationCounts,subchangeCounts:rebuilt.plan.subchangeCounts,expectedAuthUsersBefore:rebuilt.plan.expectedAuthUsersBefore,expectedAuthUsersAfterIfFullyExecutable:rebuilt.plan.expectedAuthUsersAfterIfFullyExecutable,digest:rebuilt.plan.sourceSafeRowsDigestSha256,holdZero:rebuilt.plan.holdZero,executable:false,executableReason:rebuilt.plan.executableReason},
    passwordPolicy:{materialInspected:false,signInProbeUsed:false,flagsForRowsRemainingUniqueUpdate:'PRESERVED_FROM_V3',flagsClearedWhenReclassified:true},
    safety:{providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,visitsWrites:0,certificationsWrites:0,liquidationsWrites:0,rulesWrites:0,storageWrites:0,cloudBuild:0,cloudRun:0,hosting:0,make:0,gemini:0,payments:0,merge:false,production:false,rawUidExported:false,rawEmailExported:false,rawPasswordExported:false,rawClaimsExported:false,passwordMaterialExported:false}
  };
  fs.writeFileSync(path.join(exportDir,'batch-classification-source-safe.json'),JSON.stringify(evidence,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(exportDir,'final-plan-v4-source-safe.json'),JSON.stringify(rebuilt,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(exportDir,'decision.txt'),decision+'\n','utf8');
  console.log(decision);console.log(JSON.stringify({classificationSummary:evidence.classificationSummary,rebuiltPlan:evidence.rebuiltPlan}));
}

if(process.argv.includes('--self-test'))selfTest();else main().catch(error=>{
  fs.mkdirSync(exportDir,{recursive:true});
  const decision='STOP_RETRY_C6_AUTH_UPDATE_UNIVERSE_BATCH_REVALIDATION_TECHNICAL';
  fs.writeFileSync(path.join(exportDir,'decision.txt'),decision+'\n','utf8');
  fs.writeFileSync(path.join(exportDir,'batch-classification-source-safe.json'),JSON.stringify({schemaVersion:'cxorbia.c6.auth-update-universe-batch-revalidation.evidence.v3',decision,error:String(error?.message||error).replace(/[^A-Za-z0-9_.:,/+-]+/g,'_').slice(0,400),safety:{providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,merge:false,production:false}},null,2)+'\n','utf8');
  console.error(decision,error?.message||error);process.exitCode=2;
});
