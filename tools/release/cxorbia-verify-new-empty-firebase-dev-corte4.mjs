#!/usr/bin/env node
/* CXOrbia · Corte 4 · sanitized new/empty Firebase DEV verification.
   Provider READS only. No project creation, Firebase addition, API enablement,
   Rules/Hosting deploy, Auth/Firestore/Storage writes, imports or production. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_CONFIRM='VERIFY_NEW_EMPTY_FIREBASE_DEV_READ_ONLY';
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]:fallback;};
const outDir=path.resolve(arg('--out','.tmp/corte4-new-empty-firebase-verify'));
const targetProjectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const expectedDisplayName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'').trim();
const minimumCreateTime=String(process.env.CXORBIA_MIN_CREATE_TIME||'2026-07-29T03:45:00Z').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;

const report={
  schemaVersion:'1.0.0',
  gate:'cxorbia-corte4-new-empty-firebase-dev-readonly-verify',
  generatedAt:new Date().toISOString(),
  decision:'HOLD_NOT_EXECUTED',
  target:{
    projectId:targetProjectId,
    expectedDisplayName,
    environment:'DEV',
    production:false,
    projectExists:false,
    firebaseEnabled:false,
    displayNameMatch:false,
    active:false,
    createTimePresent:false,
    createdWithinAuthorizedWindow:false
  },
  checks:{},
  summary:{
    mandatoryChecks:0,
    unavailableMandatoryCount:0,
    nonEmptySignalCount:0,
    allMandatoryAvailable:false,
    newIdentityConfirmed:false,
    emptyBaselineVerified:false,
    appCount:null,
    authUserCount:null,
    firestoreDatabaseCount:null,
    storageBucketCount:null,
    hostingSiteCount:null
  },
  safeState:{
    providerReads:true,
    providerWrites:false,
    projectCreate:false,
    firebaseAdd:false,
    apiEnablement:false,
    authWrites:false,
    firestoreWrites:false,
    storageWrites:false,
    rulesDeploy:false,
    hostingDeploy:false,
    functionsDeploy:false,
    imports:false,
    production:false,
    piiOutput:false,
    credentialOutput:false
  }
};

function category(value){
  const raw=String(value?.category||value?.status||value?.code||value?.message||value||'UNKNOWN');
  if(/404|not.found/i.test(raw))return'NOT_FOUND_OR_NOT_INITIALIZED';
  if(/403|permission|denied|forbidden/i.test(raw))return'PERMISSION_DENIED';
  if(/401|unauth/i.test(raw))return'UNAUTHENTICATED';
  if(/429|quota|rate/i.test(raw))return'QUOTA_OR_RATE_LIMIT';
  return raw.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';
}
function write(){
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'corte4-new-empty-firebase-verification.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');
  console.log(JSON.stringify(report,null,2));
}
function stop(decision){report.decision=decision;write();process.exit(0);}
function validProjectId(value){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)&&!/--/.test(value);}

async function main(){
  if(process.env.CXORBIA_CONFIRM!==REQUIRED_CONFIRM)return stop('BLOCKED_MISSING_READONLY_CONFIRMATION');
  if(!validProjectId(targetProjectId)||!expectedDisplayName)return stop('BLOCKED_INVALID_TARGET_IDENTITY');
  if(!credentialPath||!fs.existsSync(credentialPath))return stop('BLOCKED_MISSING_TEMPORARY_CREDENTIAL');
  let credential;
  try{credential=JSON.parse(fs.readFileSync(credentialPath,'utf8'));}catch{return stop('BLOCKED_INVALID_CREDENTIAL_JSON');}
  if(credential.type!=='service_account'||!credential.project_id||!credential.client_email)return stop('BLOCKED_CREDENTIAL_STRUCTURE_MISMATCH');

  const {GoogleAuth}=await import('google-auth-library');
  const client=await new GoogleAuth({credentials:credential,scopes:['https://www.googleapis.com/auth/cloud-platform.read-only','https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/identitytoolkit']}).getClient();
  async function token(){const result=await client.getAccessToken();const value=typeof result==='string'?result:result?.token;if(!value)throw Object.assign(new Error('token unavailable'),{category:'UNAUTHENTICATED'});return value;}
  async function request(method,url,body){
    const response=await fetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();let payload=null;if(text){try{payload=JSON.parse(text);}catch{payload=null;}}
    return{ok:response.ok,status:response.status,payload};
  }
  async function mandatory(id,fn){
    report.summary.mandatoryChecks+=1;
    try{const data=await fn();report.checks[id]={available:true,...data};return report.checks[id];}
    catch(error){report.summary.unavailableMandatoryCount+=1;report.checks[id]={available:false,errorCategory:category(error)};return report.checks[id];}
  }

  const project=await mandatory('projectIdentity',async()=>{
    let result=await request('GET',`https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(targetProjectId)}`);
    if(!result.ok)result=await request('GET',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}`);
    if(!result.ok)throw Object.assign(new Error('project lookup failed'),{category:String(result.status)});
    const payload=result.payload||{};
    const displayName=String(payload.displayName||payload.name||'');
    const lifecycle=String(payload.state||payload.lifecycleState||'');
    const createTime=String(payload.createTime||'');
    const displayNameMatch=displayName===expectedDisplayName;
    const active=/ACTIVE/i.test(lifecycle);
    const createTimePresent=Boolean(createTime&&Number.isFinite(Date.parse(createTime)));
    const createdWithinAuthorizedWindow=createTimePresent&&Date.parse(createTime)>=Date.parse(minimumCreateTime);
    Object.assign(report.target,{projectExists:true,displayNameMatch,active,createTimePresent,createdWithinAuthorizedWindow});
    return{exists:true,displayNameMatch,active,createTimePresent,createdWithinAuthorizedWindow,projectNumberOutput:false,parentOutput:false};
  });

  if(!project.available||!report.target.projectExists){
    report.summary.allMandatoryAvailable=false;
    return stop('BLOCKED_TARGET_PROJECT_NOT_VERIFIABLE');
  }

  await mandatory('firebaseProject',async()=>{
    const result=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}`);
    if(!result.ok)throw Object.assign(new Error('firebase project lookup failed'),{category:String(result.status)});
    const enabled=Boolean(result.payload?.projectId);
    report.target.firebaseEnabled=enabled;
    return{firebaseEnabled:enabled,identifiersOutput:false};
  });

  let apps=0;
  for(const endpoint of ['androidApps','iosApps','webApps']){
    await mandatory(endpoint,async()=>{
      const result=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}/${endpoint}?pageSize=100`);
      if(!result.ok)throw Object.assign(new Error(`${endpoint} lookup failed`),{category:String(result.status)});
      const items=Array.isArray(result.payload?.[endpoint])?result.payload[endpoint]:[];
      apps+=items.length;
      return{count:items.length,empty:items.length===0,identifiersOutput:false};
    });
  }
  report.summary.appCount=apps;

  await mandatory('authUsers',async()=>{
    const result=await request('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}/accounts:query`,{returnUserInfo:false,maxResults:1});
    if(result.status===403||result.status===404){report.summary.authUserCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}
    if(!result.ok)throw Object.assign(new Error('auth inventory failed'),{category:String(result.status)});
    const count=Array.isArray(result.payload?.userInfo)?result.payload.userInfo.length:0;
    report.summary.authUserCount=count;
    return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};
  });

  await mandatory('firestoreDatabases',async()=>{
    const result=await request('GET',`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}/databases?pageSize=100`);
    if(result.status===403||result.status===404){report.summary.firestoreDatabaseCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}
    if(!result.ok)throw Object.assign(new Error('firestore inventory failed'),{category:String(result.status)});
    const count=Array.isArray(result.payload?.databases)?result.payload.databases.length:0;
    report.summary.firestoreDatabaseCount=count;
    return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};
  });

  await mandatory('storageBuckets',async()=>{
    const result=await request('GET',`https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(targetProjectId)}&maxResults=100`);
    if(result.status===403||result.status===404){report.summary.storageBucketCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}
    if(!result.ok)throw Object.assign(new Error('storage inventory failed'),{category:String(result.status)});
    const count=Array.isArray(result.payload?.items)?result.payload.items.length:0;
    report.summary.storageBucketCount=count;
    return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};
  });

  await mandatory('hostingSites',async()=>{
    const result=await request('GET',`https://firebasehosting.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}/sites?pageSize=100`);
    if(result.status===403||result.status===404){report.summary.hostingSiteCount=0;return{count:0,empty:true,state:'NOT_INITIALIZED_OR_API_DISABLED',identifiersOutput:false};}
    if(!result.ok)throw Object.assign(new Error('hosting inventory failed'),{category:String(result.status)});
    const count=Array.isArray(result.payload?.sites)?result.payload.sites.length:0;
    report.summary.hostingSiteCount=count;
    return{count,empty:count===0,state:'AVAILABLE',identifiersOutput:false};
  });

  const values=[report.summary.appCount,report.summary.authUserCount,report.summary.firestoreDatabaseCount,report.summary.storageBucketCount,report.summary.hostingSiteCount];
  report.summary.nonEmptySignalCount=values.filter(value=>Number(value)>0).length;
  report.summary.allMandatoryAvailable=report.summary.unavailableMandatoryCount===0;
  report.summary.newIdentityConfirmed=Boolean(report.target.projectExists&&report.target.firebaseEnabled&&report.target.displayNameMatch&&report.target.active&&report.target.createdWithinAuthorizedWindow);
  report.summary.emptyBaselineVerified=Boolean(report.summary.newIdentityConfirmed&&report.summary.allMandatoryAvailable&&report.summary.nonEmptySignalCount===0&&values.every(value=>Number(value)===0));
  report.decision=report.summary.emptyBaselineVerified?'NEW_EMPTY_FIREBASE_DEV_VERIFIED_C4':'NEW_FIREBASE_DEV_REVIEW_REQUIRED_C4';
  write();
}

main().catch(error=>{report.checks.runner={available:false,errorCategory:category(error)};report.decision='UNEXPECTED_READONLY_VERIFIER_FAILURE';write();});
