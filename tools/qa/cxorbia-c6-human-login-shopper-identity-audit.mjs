#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';
import {
  EXPECTED_FIREBASE_PROJECT,TENANT_ID,CANONICAL_PROJECT_ID,
  decryptCredentialBundle,fetchFirebaseWebConfig,buildCanonicalShopperPlan,sanitizeCanonicalPlan
} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

const root=process.cwd();
const requestPath=process.argv[2]||'backend/config/corte6-human-login-shopper-identity-audit.json';
const outDir=path.join(root,'.tmp/c6-human-login-shopper-identity-audit');
const genericDir=path.join(root,'.tmp/cxorbia-readonly-post-gates-runner');
const privateDir=path.join(root,'.tmp/c6-human-login-shopper-identity-private');
const saPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const blockers=[];
const checks=[];
let request=null;

const addBlocker=(code,detail='')=>blockers.push(detail?`${code}:${detail}`:code);
const ensure=(condition,code,detail='')=>{if(!condition)addBlocker(code,detail);else checks.push(detail?`${code}:${detail}`:code);};
fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(genericDir,{recursive:true});fs.mkdirSync(privateDir,{recursive:true});

async function main(){
try{
  ensure(Boolean(saPath&&fs.existsSync(saPath)),'service_account_file_present');
  ensure(fs.existsSync(requestPath),'request_file_present');
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS');
  request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
  const head=process.env.GITHUB_SHA||'';
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
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS');

  const sa=JSON.parse(fs.readFileSync(saPath,'utf8'));
  ensure(sa.project_id===EXPECTED_FIREBASE_PROJECT&&typeof sa.private_key==='string','service_account_target_exact');
  if(blockers.length)return finish('HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS');
  const bundle=decryptCredentialBundle({serviceAccount:sa});
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:EXPECTED_FIREBASE_PROJECT});
  const auth=admin.auth(),db=admin.firestore();
  const webConfig=await fetchFirebaseWebConfig(remoteRoot,EXPECTED_FIREBASE_PROJECT);
  const plan=await buildCanonicalShopperPlan({auth,db,bundle,webConfig});
  const safe=sanitizeCanonicalPlan(plan);
  const expected=request.expectedLegacyBaseline||{};
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
  const decision=blockers.length?'HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS':'PASS_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS_READY';
  const summary={schemaVersion:'cxorbia.c6.shopper-identity-canonicalization-census.result.v1',generatedAt:new Date().toISOString(),decision,...safe};
  return finish(blockers.length?'HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS':'PASS_READONLY_POST_GATES',summary,head);
}catch(error){
  addBlocker('AUDIT_EXCEPTION',String(error?.message||error).replace(/[^A-Za-z0-9_.:-]+/g,'_').slice(0,180));
  return finish('HOLD_C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS');
}
}

function finish(status,summaryValue=null,headValue=''){
  const report={schemaVersion:'cxorbia.readonly-post-gates-report.v1',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',generatedAt:new Date().toISOString(),status,requestId:request?.requestId||null,requestCommitSha:headValue||process.env.GITHUB_SHA||null,targetHeadSha:request?.targetHeadSha||null,profile:'C6_SHOPPER_IDENTITY_CANONICALIZATION_CENSUS',checks,blockers,summary:summaryValue,safeState:{repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,imports:false,payments:false,make:false,gemini:false,firestoreWrites:false,authWrites:false,storageWrites:false,hrWrites:false}};
  fs.writeFileSync(path.join(genericDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(summaryValue||report,null,2)+'\n','utf8');
  fs.writeFileSync(path.join(outDir,'report.md'),['# C6 Shopper Identity Canonicalization Census','',`Decision: **${summaryValue?.decision||status}**`,'','Source-safe aggregate only. No raw login, name, password, token, email or UID is exported.','',`Blockers: ${blockers.length}`].join('\n')+'\n','utf8');
  try{fs.rmSync(privateDir,{recursive:true,force:true});}catch{}
  if(status!=='PASS_READONLY_POST_GATES')process.exitCode=1;
}

await main();
