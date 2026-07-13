#!/usr/bin/env node
/*
  CXOrbia Phase A R15B — retry the authorized creation of a brand-new empty
  Firebase DEV project using atomic project creation as the non-reuse guard.

  A 403 on project lookup does not prove that a project exists. R15B therefore
  attempts Cloud Resource Manager project creation only after explicit user
  authorization. The create operation is globally atomic:
  - success proves the project ID was new at creation time;
  - ALREADY_EXISTS stops the run and never reuses the existing project;
  - any other denial stops without further writes.

  Allowed writes: create the new DEV project and add Firebase to that project.
  Forbidden: billing link, Auth/Firestore/Storage initialization, imports,
  Hosting/Functions/rules deploy, production, deletion, or data migration.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_CONFIRMATION='CREATE_NEW_EMPTY_FIREBASE_DEV';
const args=process.argv.slice(2);
function arg(name,fallback){const i=args.indexOf(name);return i>=0?args[i+1]:fallback;}
const outDir=arg('--out','.tmp/firebase-new-empty-r15b');
const projectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const displayName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'CXOrbia TyA DEV Clean R15A').trim();
const sourceProjectId=String(process.env.CXORBIA_SOURCE_CREDENTIAL_PROJECT_ID||'cxorbia-backend-dev').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

function category(value){
  const raw=String(value?.category||value?.status||value?.code||value?.message||value||'UNKNOWN');
  if(/409|already.exists/i.test(raw))return'ALREADY_EXISTS';
  if(/403|permission|denied|forbidden/i.test(raw))return'PERMISSION_DENIED';
  if(/401|unauth/i.test(raw))return'UNAUTHENTICATED';
  if(/404|not.found/i.test(raw))return'NOT_FOUND';
  if(/429|quota|rate/i.test(raw))return'QUOTA_OR_RATE_LIMIT';
  if(/billing/i.test(raw))return'BILLING_REQUIRED_OR_RESTRICTED';
  if(/organization|folder|parent/i.test(raw))return'RESOURCE_HIERARCHY_RESTRICTION';
  if(/timeout/i.test(raw))return'TIMEOUT';
  return raw.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';
}
function validProjectId(v){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(v)&&!/--/.test(v);}
function initial(){return{
  schemaVersion:'1.0.0',gate:'cxorbia-phase-a-create-new-empty-firebase-dev-r15b',generatedAt:new Date().toISOString(),
  authorization:{explicitAuthorizationRecorded:process.env.CXORBIA_CONFIRM===REQUIRED_CONFIRMATION,scope:'create_new_empty_firebase_dev_and_sanitized_verify_only'},
  target:{projectId,displayName,environment:'DEV',production:false},
  sourceCredential:{expectedProjectId:sourceProjectId,typeValid:false,projectMatch:false,domainMatch:false,identifierOutput:false},
  checks:{},
  summary:{lookupAbsenceVerified:false,lookupPermissionDenied:false,atomicCreateGuardUsed:false,atomicCreateConfirmedNew:false,projectCreateAttempted:false,projectCreated:false,firebaseAddAttempted:false,firebaseAdded:false,projectActive:false,emptyBaselineVerified:false,appCount:null,authUserCount:null,firestoreDatabaseCount:null,storageBucketCount:null,hostingSiteCount:null},
  safeState:{authorizedProviderWriteAttempted:false,onlyAuthorizedProviderWrites:true,projectDeletionAttempted:false,billingLinkAttempted:false,authWrites:false,claimsWrites:false,firestoreWrites:false,storageWrites:false,rulesDeploy:false,functionsDeployOrInvocation:false,hostingDeploy:false,deploy:false,imports:false,dataMigration:false,production:false,piiOrCredentialsOutput:false,credentialPersisted:false}
};}
function write(report){
  const dir=path.resolve(outDir);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'firebase-new-empty-r15b-report.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');
  const md=['# CXOrbia Phase A R15B — Firebase DEV nuevo y vacío','',`Decision: **${report.decision}**`,`Project: \`${projectId}\``,`Atomic create confirmed new: ${report.summary.atomicCreateConfirmedNew}`,`Project created: ${report.summary.projectCreated}`,`Firebase added: ${report.summary.firebaseAdded}`,`Empty baseline verified: ${report.summary.emptyBaselineVerified}`,'','## Sanitized checks',...Object.entries(report.checks).map(([k,v])=>`- ${k}: ${JSON.stringify(v)}`),'','## Safe state','- No billing link','- No Auth/Firestore/Storage initialization','- No imports or data migration','- No deploy or production','- No credentials or PII in output',''].join('\n');
  fs.writeFileSync(path.join(dir,'firebase-new-empty-r15b-report.source-safe.md'),md,'utf8');
  console.log(JSON.stringify({decision:report.decision,target:report.target,summary:report.summary,safeState:report.safeState},null,2));
}

async function main(){
  const report=initial();
  if(process.env.CXORBIA_CONFIRM!==REQUIRED_CONFIRMATION){report.decision='BLOCKED_MISSING_EXPLICIT_AUTHORIZATION';return write(report);}
  if(!validProjectId(projectId)){report.decision='BLOCKED_INVALID_TARGET_PROJECT_ID';return write(report);}
  if(!credentialPath||!fs.existsSync(credentialPath)){report.decision='BLOCKED_MISSING_TEMPORARY_CREDENTIAL';return write(report);}
  let cred;
  try{cred=JSON.parse(fs.readFileSync(credentialPath,'utf8'));}catch{report.decision='BLOCKED_INVALID_CREDENTIAL_JSON';return write(report);}
  report.sourceCredential.typeValid=cred.type==='service_account';
  report.sourceCredential.projectMatch=String(cred.project_id||'')===sourceProjectId;
  report.sourceCredential.domainMatch=String(cred.client_email||'').endsWith(`@${sourceProjectId}.iam.gserviceaccount.com`);
  if(!report.sourceCredential.typeValid||!report.sourceCredential.projectMatch||!report.sourceCredential.domainMatch){report.decision='BLOCKED_SOURCE_CREDENTIAL_MISMATCH';return write(report);}

  const {GoogleAuth}=await import('google-auth-library');
  const client=await new GoogleAuth({credentials:cred,scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();
  async function token(){const r=await client.getAccessToken();const t=typeof r==='string'?r:r?.token;if(!t)throw Object.assign(new Error('token unavailable'),{category:'UNAUTHENTICATED'});return t;}
  async function request(method,url,body){
    const response=await fetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();let payload=null;if(text){try{payload=JSON.parse(text);}catch{payload=null;}}
    return{ok:response.ok,status:response.status,payload};
  }
  async function poll(base,name){
    if(!name)return;
    const url=`${base}/${String(name).replace(/^\//,'')}`;
    for(let i=0;i<90;i++){
      const r=await request('GET',url);
      if(!r.ok)throw Object.assign(new Error('operation poll failed'),{category:String(r.status)});
      if(r.payload?.done){if(r.payload?.error)throw Object.assign(new Error('operation failed'),{category:String(r.payload.error?.status||r.payload.error?.code||'OPERATION_ERROR')});return;}
      await new Promise(resolve=>setTimeout(resolve,4000));
    }
    throw Object.assign(new Error('operation timeout'),{category:'TIMEOUT'});
  }

  let parent=null;
  try{
    const source=await request('GET',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(sourceProjectId)}`);
    if(source.ok&&source.payload?.parent?.type&&source.payload?.parent?.id)parent={type:String(source.payload.parent.type),id:String(source.payload.parent.id)};
    report.checks.sourceParent={available:source.ok,parentTypePresent:Boolean(parent),parentIdOutput:false,errorCategory:source.ok?null:category(source.status)};
  }catch(error){report.checks.sourceParent={available:false,parentTypePresent:false,parentIdOutput:false,errorCategory:category(error)};}

  try{
    const lookup=await request('GET',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`);
    if(lookup.ok){report.checks.targetLookup={available:true,exists:true};report.decision='BLOCKED_TARGET_PROJECT_ALREADY_EXISTS_DO_NOT_REUSE';return write(report);}
    if(lookup.status===404){report.summary.lookupAbsenceVerified=true;report.checks.targetLookup={available:true,exists:false,statusCategory:'NOT_FOUND'};}
    else if(lookup.status===403){report.summary.lookupPermissionDenied=true;report.summary.atomicCreateGuardUsed=true;report.checks.targetLookup={available:false,exists:null,statusCategory:'PERMISSION_DENIED',proceedingWithAtomicCreateGuard:true};}
    else{report.checks.targetLookup={available:false,exists:null,statusCategory:category(lookup.status)};report.decision='BLOCKED_TARGET_PROJECT_EXISTENCE_UNVERIFIED';return write(report);}
  }catch(error){report.checks.targetLookup={available:false,exists:null,statusCategory:category(error)};report.decision='BLOCKED_TARGET_PROJECT_EXISTENCE_UNVERIFIED';return write(report);}

  report.summary.projectCreateAttempted=true;report.safeState.authorizedProviderWriteAttempted=true;
  try{
    const created=await request('POST','https://cloudresourcemanager.googleapis.com/v1/projects',{projectId,name:displayName,...(parent?{parent}:{})});
    if(created.status===409){report.checks.projectCreation={attempted:true,succeeded:false,errorCategory:'ALREADY_EXISTS'};report.decision='BLOCKED_TARGET_PROJECT_ALREADY_EXISTS_DO_NOT_REUSE';return write(report);}
    if(!created.ok)throw Object.assign(new Error('project create failed'),{category:String(created.payload?.error?.status||created.payload?.error?.code||created.status)});
    await poll('https://cloudresourcemanager.googleapis.com/v1',created.payload?.name);
    report.summary.projectCreated=true;report.summary.atomicCreateConfirmedNew=true;report.checks.projectCreation={attempted:true,succeeded:true,atomicNewProjectConfirmed:true,errorCategory:null};
  }catch(error){report.checks.projectCreation={attempted:true,succeeded:false,errorCategory:category(error)};report.decision='BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY';return write(report);}

  report.summary.firebaseAddAttempted=true;
  try{
    const added=await request('POST',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}:addFirebase`,{});
    if(!added.ok)throw Object.assign(new Error('add firebase failed'),{category:String(added.payload?.error?.status||added.payload?.error?.code||added.status)});
    await poll('https://firebase.googleapis.com/v1beta1',added.payload?.name);
    report.summary.firebaseAdded=true;report.checks.firebaseAddition={attempted:true,succeeded:true,errorCategory:null};
  }catch(error){report.checks.firebaseAddition={attempted:true,succeeded:false,errorCategory:category(error)};report.decision='PROJECT_CREATED_FIREBASE_ADDITION_BLOCKED_REVIEW_REQUIRED';return write(report);}

  async function check(id,fn){try{return{id,available:true,...await fn()};}catch(error){return{id,available:false,errorCategory:category(error)};}}
  report.checks.projectState=await check('projectState',async()=>{const r=await request('GET',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`);if(!r.ok)throw Object.assign(new Error('project state unavailable'),{category:String(r.status)});const active=r.payload?.lifecycleState==='ACTIVE';report.summary.projectActive=active;return{active,lifecycleStateCategory:active?'ACTIVE':'NON_ACTIVE',projectNumberOutput:false};});
  report.checks.firebaseProject=await check('firebaseProject',async()=>{const r=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`);if(!r.ok)throw Object.assign(new Error('firebase project unavailable'),{category:String(r.status)});return{availableAsFirebaseProject:Boolean(r.payload?.projectId),identifiersOutput:false};});

  let apps=0;
  for(const endpoint of ['androidApps','iosApps','webApps']){
    report.checks[endpoint]=await check(endpoint,async()=>{const r=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/${endpoint}?pageSize=100`);if(!r.ok)throw Object.assign(new Error('app inventory unavailable'),{category:String(r.status)});const items=Array.isArray(r.payload?.[endpoint])?r.payload[endpoint]:[];apps+=items.length;return{count:items.length,empty:items.length===0,identifiersOutput:false};});
  }
  report.summary.appCount=apps;

  report.checks.authUsers=await check('authUsers',async()=>{const r=await request('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:query`,{returnUserInfo:false,maxResults:1});if(r.status===403||r.status===404){report.summary.authUserCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}if(!r.ok)throw Object.assign(new Error('auth inventory unavailable'),{category:String(r.status)});const count=Array.isArray(r.payload?.userInfo)?r.payload.userInfo.length:0;report.summary.authUserCount=count;return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};});
  report.checks.firestoreDatabases=await check('firestoreDatabases',async()=>{const r=await request('GET',`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases?pageSize=100`);if(r.status===403||r.status===404){report.summary.firestoreDatabaseCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}if(!r.ok)throw Object.assign(new Error('firestore inventory unavailable'),{category:String(r.status)});const count=Array.isArray(r.payload?.databases)?r.payload.databases.length:0;report.summary.firestoreDatabaseCount=count;return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};});
  report.checks.storageBuckets=await check('storageBuckets',async()=>{const r=await request('GET',`https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(projectId)}&maxResults=100`);if(r.status===403||r.status===404){report.summary.storageBucketCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}if(!r.ok)throw Object.assign(new Error('storage inventory unavailable'),{category:String(r.status)});const count=Array.isArray(r.payload?.items)?r.payload.items.length:0;report.summary.storageBucketCount=count;return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};});
  report.checks.hostingSites=await check('hostingSites',async()=>{const r=await request('GET',`https://firebasehosting.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/sites?pageSize=100`);if(r.status===403||r.status===404){report.summary.hostingSiteCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}if(!r.ok)throw Object.assign(new Error('hosting inventory unavailable'),{category:String(r.status)});const count=Array.isArray(r.payload?.sites)?r.payload.sites.length:0;report.summary.hostingSiteCount=count;return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};});

  const zero=[report.summary.appCount,report.summary.authUserCount,report.summary.firestoreDatabaseCount,report.summary.storageBucketCount,report.summary.hostingSiteCount].every(v=>v===0);
  const verified=['projectState','firebaseProject','androidApps','iosApps','webApps','authUsers','firestoreDatabases','storageBuckets','hostingSites'].every(k=>report.checks[k]?.available===true);
  report.summary.emptyBaselineVerified=Boolean(report.summary.atomicCreateConfirmedNew&&report.summary.projectCreated&&report.summary.firebaseAdded&&report.summary.projectActive&&zero&&verified);
  report.decision=report.summary.emptyBaselineVerified?'NEW_EMPTY_FIREBASE_DEV_VERIFIED':'NEW_FIREBASE_DEV_CREATED_VERIFICATION_INCONCLUSIVE_REVIEW_REQUIRED';
  write(report);
}

main().catch(error=>{const report=initial();report.decision='UNEXPECTED_RUNNER_FAILURE_REVIEW_REQUIRED';report.checks.runner={available:false,errorCategory:category(error)};write(report);});
