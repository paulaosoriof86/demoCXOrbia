#!/usr/bin/env node
/* CXOrbia Phase A · Corte 4 — atomic creation of a brand-new empty Firebase DEV.
   Atomic project create is the non-reuse guard:
   - success proves the ID was new;
   - ALREADY_EXISTS stops and never reuses it;
   - any denial stops without further writes.
   Allowed provider writes: project create and addFirebase only.
   Forbidden: billing, Auth/Firestore/Storage initialization, Rules/Hosting/
   Functions deploy, imports, migration, deletion and production. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const REQUIRED_CONFIRMATION='CREATE_NEW_EMPTY_FIREBASE_DEV';
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]:fallback;};
const outDir=path.resolve(arg('--out','.tmp/firebase-new-empty-r15b'));
const projectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const displayName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'CXOrbia TyA DEV Clean Corte 4').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const REQUEST_TIMEOUT_MS=8000;
const OPERATION_DEADLINE_MS=90000;
const POLL_INTERVAL_MS=2000;

const report={
  schemaVersion:'1.2.0',
  gate:'cxorbia-phase-a-create-new-empty-firebase-dev-r15b',
  generatedAt:new Date().toISOString(),
  decision:'HOLD_NOT_EXECUTED',
  authorization:{explicitAuthorizationRecorded:process.env.CXORBIA_CONFIRM===REQUIRED_CONFIRMATION,scope:'create_new_empty_firebase_dev_and_sanitized_verify_only'},
  target:{projectId,displayName,environment:'DEV',production:false},
  sourceCredential:{typeValid:false,requiredFieldsPresent:false,identifierOutput:false},
  checks:{},
  summary:{lookupAbsenceVerified:false,lookupPermissionDenied:false,atomicCreateGuardUsed:false,atomicCreateConfirmedNew:false,projectCreateAttempted:false,projectCreated:false,firebaseAddAttempted:false,firebaseAdded:false,projectActive:false,emptyBaselineVerified:false,appCount:null,authUserCount:null,firestoreDatabaseCount:null,storageBucketCount:null,hostingSiteCount:null},
  safeState:{authorizedProviderWriteAttempted:false,onlyAuthorizedProviderWrites:true,projectDeletionAttempted:false,billingLinkAttempted:false,authWrites:false,claimsWrites:false,firestoreWrites:false,storageWrites:false,rulesDeploy:false,functionsDeployOrInvocation:false,hostingDeploy:false,deploy:false,imports:false,dataMigration:false,production:false,piiOrCredentialsOutput:false,credentialPersisted:false}
};

function category(value){const raw=String(value?.category||value?.status||value?.code||value?.name||value?.message||value||'UNKNOWN');if(/409|already.exists/i.test(raw))return'ALREADY_EXISTS';if(/403|permission|denied|forbidden/i.test(raw))return'PERMISSION_DENIED';if(/401|unauth|invalid_grant/i.test(raw))return'UNAUTHENTICATED';if(/404|not.found/i.test(raw))return'NOT_FOUND';if(/429|quota|rate/i.test(raw))return'QUOTA_OR_RATE_LIMIT';if(/billing/i.test(raw))return'BILLING_REQUIRED_OR_RESTRICTED';if(/organization|folder|parent/i.test(raw))return'RESOURCE_HIERARCHY_RESTRICTION';if(/timeout|abort/i.test(raw))return'TIMEOUT';return raw.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';}
function validProjectId(v){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(v)&&!/--/.test(v);}
function b64(value){return Buffer.from(value).toString('base64url');}
function write(){fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'firebase-new-empty-r15b-report.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');console.log(JSON.stringify(report,null,2));}
function stop(decision){report.decision=decision;write();process.exit(0);}
function timeoutError(label){return Object.assign(new Error(`${label} timeout`),{category:'TIMEOUT'});}
async function boundedFetch(url,options={},ms=REQUEST_TIMEOUT_MS){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ms);try{return await fetch(url,{...options,signal:controller.signal});}catch(error){if(error?.name==='AbortError')throw timeoutError('provider_request');throw error;}finally{clearTimeout(timer);}}

async function main(){
  if(process.env.CXORBIA_CONFIRM!==REQUIRED_CONFIRMATION)return stop('BLOCKED_MISSING_EXPLICIT_AUTHORIZATION');
  if(!validProjectId(projectId))return stop('BLOCKED_INVALID_TARGET_PROJECT_ID');
  if(!credentialPath||!fs.existsSync(credentialPath))return stop('BLOCKED_MISSING_TEMPORARY_CREDENTIAL');
  let c;try{c=JSON.parse(fs.readFileSync(credentialPath,'utf8'));}catch{return stop('BLOCKED_INVALID_CREDENTIAL_JSON');}
  report.sourceCredential.typeValid=c.type==='service_account';
  report.sourceCredential.requiredFieldsPresent=Boolean(c.client_email&&c.private_key&&c.token_uri&&c.project_id);
  if(!report.sourceCredential.typeValid||!report.sourceCredential.requiredFieldsPresent)return stop('BLOCKED_SOURCE_CREDENTIAL_MISMATCH');

  let cachedToken=null;
  async function token(){
    if(cachedToken)return cachedToken;
    const now=Math.floor(Date.now()/1000);
    const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}));
    const claims=b64(JSON.stringify({iss:c.client_email,scope:'https://www.googleapis.com/auth/cloud-platform',aud:c.token_uri,iat:now,exp:now+3300}));
    const input=`${header}.${claims}`;
    const assertion=`${input}.${crypto.sign('RSA-SHA256',Buffer.from(input),c.private_key).toString('base64url')}`;
    const response=await boundedFetch(c.token_uri,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()});
    const text=await response.text();let payload={};try{payload=JSON.parse(text);}catch{}
    if(!response.ok||!payload.access_token)throw Object.assign(new Error('oauth token unavailable'),{category:String(payload.error||response.status)});
    cachedToken=payload.access_token;report.checks.oauth={available:true,implementation:'native-rs256-jwt',tokenOutput:false};return cachedToken;
  }
  async function request(method,url,body){const response=await boundedFetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await response.text();let payload=null;if(text){try{payload=JSON.parse(text);}catch{}}return{ok:response.ok,status:response.status,payload};}
  async function poll(base,name){if(!name)return{attempts:0};const url=`${base}/${String(name).replace(/^\//,'')}`;const deadline=Date.now()+OPERATION_DEADLINE_MS;let attempts=0;while(Date.now()<deadline){attempts++;const r=await request('GET',url);if(!r.ok)throw Object.assign(new Error('operation poll failed'),{category:String(r.status)});if(r.payload?.done){if(r.payload?.error)throw Object.assign(new Error('operation failed'),{category:String(r.payload.error?.status||r.payload.error?.code||'OPERATION_ERROR')});return{attempts};}await new Promise(resolve=>setTimeout(resolve,POLL_INTERVAL_MS));}throw Object.assign(new Error('operation timeout'),{category:'TIMEOUT'});}

  let parent=null;
  try{const source=await request('GET',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(c.project_id)}`);if(source.ok&&source.payload?.parent?.type&&source.payload?.parent?.id)parent={type:String(source.payload.parent.type),id:String(source.payload.parent.id)};report.checks.sourceParent={available:source.ok,parentTypePresent:Boolean(parent),parentIdOutput:false,errorCategory:source.ok?null:category(source.status)};}catch(error){report.checks.sourceParent={available:false,parentTypePresent:false,parentIdOutput:false,errorCategory:category(error)};}

  try{
    const lookup=await request('GET',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`);
    if(lookup.ok){report.checks.targetLookup={available:true,exists:true};return stop('BLOCKED_TARGET_PROJECT_ALREADY_EXISTS_DO_NOT_REUSE');}
    if(lookup.status===404){report.summary.lookupAbsenceVerified=true;report.checks.targetLookup={available:true,exists:false,statusCategory:'NOT_FOUND'};}
    else if(lookup.status===403){report.summary.lookupPermissionDenied=true;report.summary.atomicCreateGuardUsed=true;report.checks.targetLookup={available:false,exists:null,statusCategory:'PERMISSION_DENIED',proceedingWithAtomicCreateGuard:true};}
    else{report.checks.targetLookup={available:false,exists:null,statusCategory:category(lookup.status)};return stop('BLOCKED_TARGET_PROJECT_EXISTENCE_UNVERIFIED');}
  }catch(error){report.checks.targetLookup={available:false,exists:null,statusCategory:category(error)};return stop('BLOCKED_TARGET_PROJECT_EXISTENCE_UNVERIFIED');}

  report.summary.projectCreateAttempted=true;report.safeState.authorizedProviderWriteAttempted=true;
  try{
    const created=await request('POST','https://cloudresourcemanager.googleapis.com/v1/projects',{projectId,name:displayName,...(parent?{parent}:{})});
    if(created.status===409){report.checks.projectCreation={attempted:true,succeeded:false,errorCategory:'ALREADY_EXISTS'};return stop('BLOCKED_TARGET_PROJECT_ALREADY_EXISTS_DO_NOT_REUSE');}
    if(!created.ok)throw Object.assign(new Error('project create failed'),{category:String(created.payload?.error?.status||created.payload?.error?.code||created.status)});
    const p=await poll('https://cloudresourcemanager.googleapis.com/v1',created.payload?.name);
    report.summary.projectCreated=true;report.summary.atomicCreateConfirmedNew=true;report.checks.projectCreation={attempted:true,succeeded:true,atomicNewProjectConfirmed:true,pollAttempts:p.attempts,errorCategory:null};
  }catch(error){report.checks.projectCreation={attempted:true,succeeded:false,errorCategory:category(error)};return stop('BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY');}

  report.summary.firebaseAddAttempted=true;
  try{
    const added=await request('POST',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}:addFirebase`,{});
    if(!added.ok)throw Object.assign(new Error('add firebase failed'),{category:String(added.payload?.error?.status||added.payload?.error?.code||added.status)});
    const p=await poll('https://firebase.googleapis.com/v1beta1',added.payload?.name);
    report.summary.firebaseAdded=true;report.checks.firebaseAddition={attempted:true,succeeded:true,pollAttempts:p.attempts,errorCategory:null};
  }catch(error){report.checks.firebaseAddition={attempted:true,succeeded:false,errorCategory:category(error)};return stop('PROJECT_CREATED_FIREBASE_ADDITION_BLOCKED_REVIEW_REQUIRED');}

  report.decision='NEW_FIREBASE_DEV_CREATED_PENDING_INDEPENDENT_EMPTY_VERIFICATION';
  write();
}
main().catch(error=>{report.checks.runner={available:false,errorCategory:category(error)};report.decision='UNEXPECTED_RUNNER_FAILURE_REVIEW_REQUIRED';write();});
