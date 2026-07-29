#!/usr/bin/env node
/* CXOrbia · Corte 4 · sanitized new/empty Firebase DEV verification.
   Provider READS only. Native service-account OAuth; no npm dependency.
   No project creation, Firebase addition, API enablement, Rules/Hosting deploy,
   Auth/Firestore/Storage writes, imports or production. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const REQUIRED_CONFIRM='VERIFY_NEW_EMPTY_FIREBASE_DEV_READ_ONLY';
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]:fallback;};
const outDir=path.resolve(arg('--out','.tmp/corte4-new-empty-firebase-verify'));
const targetProjectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const expectedDisplayName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'').trim();
const minimumCreateTime=String(process.env.CXORBIA_MIN_CREATE_TIME||'2026-07-29T03:45:00Z').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const REQUEST_TIMEOUT_MS=Math.max(2000,Number(process.env.CXORBIA_PROVIDER_REQUEST_TIMEOUT_MS||8000));

const report={
  schemaVersion:'1.2.0',
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
  credential:{typeValid:false,requiredFieldsPresent:false,identifierOutput:false},
  networkPolicy:{requestTimeoutMs:REQUEST_TIMEOUT_MS,oauthImplementation:'native-rs256-jwt'},
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
  const raw=String(value?.category||value?.status||value?.code||value?.name||value?.message||value||'UNKNOWN');
  if(/404|not.found/i.test(raw))return'NOT_FOUND_OR_NOT_INITIALIZED';
  if(/403|permission|denied|forbidden/i.test(raw))return'PERMISSION_DENIED';
  if(/401|unauth|invalid_grant/i.test(raw))return'UNAUTHENTICATED';
  if(/429|quota|rate/i.test(raw))return'QUOTA_OR_RATE_LIMIT';
  if(/timeout|abort/i.test(raw))return'TIMEOUT';
  return raw.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';
}
function write(){
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'corte4-new-empty-firebase-verification.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');
  console.log(JSON.stringify(report,null,2));
}
function stop(decision){report.decision=decision;write();process.exit(0);}
function validProjectId(value){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)&&!/--/.test(value);}
function base64url(value){return Buffer.from(value).toString('base64url');}
function timeoutError(label){return Object.assign(new Error(`${label} timeout`),{category:'TIMEOUT'});}
async function boundedFetch(url,options={},label='provider_request'){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{return await fetch(url,{...options,signal:controller.signal});}
  catch(error){if(error?.name==='AbortError')throw timeoutError(label);throw error;}
  finally{clearTimeout(timer);}
}

async function main(){
  if(process.env.CXORBIA_CONFIRM!==REQUIRED_CONFIRM)return stop('BLOCKED_MISSING_READONLY_CONFIRMATION');
  if(!validProjectId(targetProjectId)||!expectedDisplayName)return stop('BLOCKED_INVALID_TARGET_IDENTITY');
  if(!credentialPath||!fs.existsSync(credentialPath))return stop('BLOCKED_MISSING_TEMPORARY_CREDENTIAL');
  let credential;
  try{credential=JSON.parse(fs.readFileSync(credentialPath,'utf8'));}catch{return stop('BLOCKED_INVALID_CREDENTIAL_JSON');}
  report.credential.typeValid=credential.type==='service_account';
  report.credential.requiredFieldsPresent=Boolean(credential.client_email&&credential.private_key&&credential.token_uri);
  if(!report.credential.typeValid||!report.credential.requiredFieldsPresent)return stop('BLOCKED_CREDENTIAL_STRUCTURE_MISMATCH');

  let cachedToken=null;
  async function token(){
    if(cachedToken)return cachedToken;
    const now=Math.floor(Date.now()/1000);
    const header=base64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
    const claims=base64url(JSON.stringify({
      iss:credential.client_email,
      scope:'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit',
      aud:credential.token_uri||'https://oauth2.googleapis.com/token',
      iat:now,
      exp:now+3300
    }));
    const signingInput=`${header}.${claims}`;
    const signature=crypto.sign('RSA-SHA256',Buffer.from(signingInput),credential.private_key).toString('base64url');
    const assertion=`${signingInput}.${signature}`;
    const response=await boundedFetch(credential.token_uri||'https://oauth2.googleapis.com/token',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()
    },'oauth_token');
    const text=await response.text();
    let payload={};try{payload=text?JSON.parse(text):{};}catch{}
    if(!response.ok||!payload.access_token)throw Object.assign(new Error('oauth token unavailable'),{category:String(payload.error||response.status)});
    cachedToken=payload.access_token;
    report.checks.oauth={available:true,implementation:'native-rs256-jwt',tokenOutput:false};
    return cachedToken;
  }
  async function request(method,url,body){
    const response=await boundedFetch(url,{
      method,
      headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},
      body:body===undefined?undefined:JSON.stringify(body)
    });
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
