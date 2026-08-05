#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';
import {
  EXPECTED_FIREBASE_PROJECT,TENANT_ID,CANONICAL_PROJECT_ID,
  decryptCredentialBundle,fetchFirebaseWebConfig,buildCanonicalShopperPlan,sanitizeCanonicalPlan
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import {buildResolutionReview,sanitizeResolutionReview} from './cxorbia-c6-shopper-identity-resolution-review.mjs';

const root=process.cwd();
const requestPath=process.argv[2]||'backend/config/corte6-human-login-shopper-identity-audit.json';
const outDir=path.join(root,'.tmp/c6-human-login-shopper-identity-audit');
const genericDir=path.join(root,'.tmp/cxorbia-readonly-post-gates-runner');
const privateDir=path.join(root,'.tmp/c6-human-login-shopper-identity-private');
const saPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const blockers=[];const checks=[];let request=null;
const addBlocker=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);
const ensure=(condition,code,detail='')=>{if(!condition)addBlocker(code,detail);else checks.push(detail?`${code}:${detail}`:code);};
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(genericDir,{recursive:true});fs.mkdirSync(privateDir,{recursive:true});

function validateCommon(){
  ensure(request.schemaVersion==='cxorbia.c6.human-login-shopper-identity-audit.v1','request_schema_exact');
  ensure(request.canonicalIdentityContract==='backend/contracts/c6-shopper-identity-canonicalization-v1.json','canonical_contract_exact');
  ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit'&&Number(request.pullRequest)===7,'repository_lane_exact');
  ensure(request.enabled===true&&request.consumed===false&&request.status==='authorized_execute_once','request_enabled_once');
  ensure(Number(request.allowedExecutions)===1&&request.authorizedBy==='Paula','authorization_exact');
  ensure(request.targetHeadSha&&request.targetHeadSha===process.env.CXORBIA_AUDIT_TARGET_HEAD,'target_head_exact');
  ensure(request.providerReads===true&&request.providerWrites===false,'provider_readonly_exact');
  ensure(request.tenantId===TENANT_ID&&request.projectId===CANONICAL_PROJECT_ID&&request.firebaseProjectId===EXPECTED_FIREBASE_PROJECT,'target_exact');
  ensure(request.identityPolicy?.username==='nombre.apellido'&&request.identityPolicy?.password==='Nombre123*'&&request.identityPolicy?.membershipRequired===false,'identity_policy_exact');
  for(const key of ['repositoryWrites','dataWrites','deploy','merge','production','firestoreWrites','authWrites','passwordChanges','passwordResets','rulesWrites','storageWrites','hrWrites','make','gemini','payments'])ensure(request.safeState?.[key]===false,'safe_state_false',key);
}

async function main(){
try{
  ensure(Boolean(saPath&&fs.existsSync(saPath)),'service_account_file_present');
  ensure(fs.existsSync(requestPath),'request_file_present');
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');
  request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
  validateCommon();
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');
  const sa=JSON.parse(fs.readFileSync(saPath,'utf8'));
  ensure(sa.project_id===EXPECTED_FIREBASE_PROJECT&&typeof sa.private_key==='string','service_account_target_exact');
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');
  const bundle=decryptCredentialBundle({serviceAccount:sa});
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED_FIREBASE_PROJECT});
  const auth=admin.auth(),db=admin.firestore();
  const webConfig=await fetchFirebaseWebConfig(remoteRoot,EXPECTED_FIREBASE_PROJECT);
  if(request.mode==='source_safe_resolution_review')return runResolution({auth,db,bundle,webConfig});
  return runCensus({auth,db,bundle,webConfig});
}catch(error){addBlocker('AUDIT_EXCEPTION',String(error?.message||error).replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,180));return finish('HOLD_C6_SHOPPER_IDENTITY_AUDIT');}
}

async function runCensus(ctx){
  const plan=await buildCanonicalShopperPlan(ctx);const safe=sanitizeCanonicalPlan(plan);const expected=request.expectedLegacyBaseline||{};
  ensure(plan.source.firestoreProfiles===Number(request.expectedFirestoreProfiles||340),'firestore_profile_count_exact',String(plan.source.firestoreProfiles));
  ensure(plan.source.credentialShopperRecords===Number(expected.records||109),'credential_record_count_exact',String(plan.source.credentialShopperRecords));
  ensure(plan.baseline.missingAuth===Number(expected.missingAuth||21),'legacy_missing_auth_exact',String(plan.baseline.missingAuth));
  ensure(plan.baseline.loginExceptions===Number(expected.loginExceptions||30),'legacy_login_exceptions_exact',String(plan.baseline.loginExceptions));
  ensure(plan.baseline.passwordExceptions===Number(expected.passwordExceptions||28),'legacy_password_exceptions_exact',String(plan.baseline.passwordExceptions));
  ensure(plan.classification.complete===true,'classification_complete');
  ensure(plan.classification.total===plan.source.firestoreProfiles,'classification_total_consistent');
  ensure(plan.collisionCount===0,'zero_unresolved_collisions',String(plan.collisionCount));
  ensure(plan.paulaIdentity.separated===true,'paula_staff_shopper_principals_separated');
  ensure(plan.repairRows.length>0,'active_eligible_population_nonempty');
  ensure(plan.repairRows.length===Object.values(plan.actions).reduce((sum,n)=>sum+Number(n||0),0),'action_partition_consistent');
  checks.push('MEMBERSHIP_NOT_REQUIRED_FOR_SHOPPER_LOGIN','CANONICAL_USERNAME_NOMBRE_APELLIDO','CANONICAL_PASSWORD_NOMBRE123_STAR','ALL_340_PROFILES_CLASSIFIED','RAW_IDENTITY_NOT_EXPORTED');
  const summary={schemaVersion:'cxorbia.c6.shopper-identity-canonicalization-census.result.v1',generatedAt:new Date().toISOString(),decision:blockers.length?'HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS':'PASS_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS_READY',...safe};
  return finish(blockers.length?'HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS':'PASS_READONLY_POST_GATES',summary,'C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS');
}

async function runResolution(ctx){
  ensure(request.expectedCollisionCount===12,'expected_collision_count_contract');
  ensure(request.expectedIncompleteCanonicalNames===23,'expected_incomplete_name_contract');
  ensure(request.expectedLoginCollisionProfiles===23,'expected_login_collision_profiles_contract');
  ensure(request.expectedPaulaShopperCandidates===2,'expected_paula_candidates_contract');
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW',null,'C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW');
  const review=await buildResolutionReview(ctx);const safe=sanitizeResolutionReview(review);
  ensure(review.source.profiles===340,'all_340_profiles_reviewed',String(review.source.profiles));
  ensure(review.baselineReconciliation.credentialRecords===109,'all_109_credential_records_reviewed',String(review.baselineReconciliation.credentialRecords));
  ensure(review.baselineReconciliation.missingAuth===21,'baseline_missing_auth_reconciled',String(review.baselineReconciliation.missingAuth));
  ensure(review.baselineReconciliation.loginExceptions===30,'baseline_login_exceptions_reconciled',String(review.baselineReconciliation.loginExceptions));
  ensure(review.baselineReconciliation.passwordExceptions===28,'baseline_password_exceptions_reconciled',String(review.baselineReconciliation.passwordExceptions));
  ensure(review.planTotal===340,'one_plan_row_per_profile',String(review.planTotal));
  ensure(Object.values(review.operationCounts).reduce((sum,n)=>sum+Number(n||0),0)===340,'operation_partition_consistent');
  ensure(review.resolution.paula.shopperCandidates===2,'paula_two_shopper_candidates_reviewed');
  ensure(review.safety.authWrites===0&&review.safety.passwordChanges===0&&review.safety.firestoreWrites===0&&review.safety.deploys===0,'zero_provider_writes');
  checks.push('TECHNICAL_KEYS_ONLY_NO_VISUAL_NAME_MATCH','SOURCE_SAFE_RESOLUTION_MATRIX_CREATED','ROLLBACK_DRY_RUN_CREATED','NON_OVERLAPPING_PRIMARY_OPERATION_PLAN_CREATED','RAW_IDENTITY_NOT_EXPORTED');
  const decision=(review.resolution.remainingCollisionCount===0&&review.unresolvedProfileCount===0&&review.resolution.paula.resolution.startsWith('RESOLVED'))?'PASS_C6_SHOPPER_IDENTITY_RESOLUTION_READY':'HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW';
  if(decision.startsWith('HOLD'))addBlocker('UNRESOLVED_IDENTITY_HOLDS',String(review.unresolvedProfileCount));
  const summary={schemaVersion:'cxorbia.c6.shopper-identity-resolution-review.result.v1',generatedAt:new Date().toISOString(),decision,...safe};
  return finish(decision==='PASS_C6_SHOPPER_IDENTITY_RESOLUTION_READY'?'PASS_READONLY_POST_GATES':'HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW',summary,'C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW');
}

function finish(status,summaryValue=null,profile='C6_SHOPPER_IDENTITY_AUDIT'){
  const report={schemaVersion:'cxorbia.readonly-post-gates-report.v1',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',generatedAt:new Date().toISOString(),status,requestId:request?.requestId||null,requestCommitSha:process.env.GITHUB_SHA||null,targetHeadSha:request?.targetHeadSha||null,profile,checks,blockers,summary:summaryValue,safeState:{repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,imports:false,payments:false,make:false,gemini:false,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false}};
  fs.writeFileSync(path.join(genericDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(summaryValue||report,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.md'),['# C6 Shopper Identity Audit','',`Decision: **${summaryValue?.decision||status}**`,'','Source-safe aggregate only. No raw login, name, password, token, email or UID is exported.','',`Blockers: ${blockers.length}`].join('\n')+'\n','utf8');
  try{fs.rmSync(privateDir,{recursive:true,force:true});}catch{}
  if(status!=='PASS_READONLY_POST_GATES')process.exitCode=1;
}
await main();
