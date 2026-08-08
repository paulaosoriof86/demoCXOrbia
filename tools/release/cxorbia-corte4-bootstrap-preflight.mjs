#!/usr/bin/env node
/* CXOrbia · Corte 4 · authorized DEV read-only bootstrap capability preflight.
   Provider READS only. No Firebase/Auth/Firestore/Rules/Hosting writes.
   Purpose: prove the exact IAM/API/location prerequisites before the authorized bootstrap. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const REQUIRED_CONFIRM='PREFLIGHT_BOOTSTRAP_DEV_READ_ONLY_C4';
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]:fallback;};
const outDir=path.resolve(arg('--out','.tmp/corte4-bootstrap-preflight'));
const projectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const expectedDisplayName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'').trim();
const authorizedLocation=String(process.env.CXORBIA_FIRESTORE_LOCATION||'').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const REQUEST_TIMEOUT_MS=Math.max(2000,Number(process.env.CXORBIA_REQUEST_TIMEOUT_MS||8000));

const requiredPermissions=[
  'resourcemanager.projects.get',
  'firebase.clients.create',
  'firebase.clients.get',
  'firebase.clients.list',
  'datastore.databases.create',
  'datastore.databases.get',
  'firebaseauth.configs.create',
  'firebaseauth.configs.get',
  'firebaseauth.users.create',
  'firebaseauth.users.get',
  'firebaseauth.users.update',
  'firebaserules.rulesets.create',
  'firebaserules.rulesets.get',
  'firebaserules.releases.create',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.get',
  'serviceusage.services.enable'
];
const bootstrapServices=[
  'firebase.googleapis.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'firebaserules.googleapis.com'
];

const report={
  schemaVersion:'1.1.0',
  gate:'cxorbia-corte4-bootstrap-dev-readonly-capability-preflight',
  generatedAt:new Date().toISOString(),
  decision:'HOLD_NOT_EXECUTED',
  target:{projectId,expectedDisplayName,projectExists:false,displayNameMatch:false,firebaseEnabled:false,providerLocationId:null,authorizedLocationId:authorizedLocation||null,locationId:null,locationSource:null},
  credential:{typeValid:false,requiredFieldsPresent:false,identifierOutput:false},
  permissions:{required:requiredPermissions,granted:[],missing:[],writePermissionsMissing:[],serviceEnablePermissionRequired:false},
  services:{},
  summary:{allRequiredPermissionsGranted:false,allRequiredServicesEnabled:false,locationResolved:false,providerWriteReady:false,missingPermissionCount:0,disabledServiceCount:0},
  safeState:{providerReads:true,providerWrites:false,webAppCreate:false,firestoreDatabaseCreate:false,authInitialize:false,authUserWrite:false,rulesDeploy:false,hostingDeploy:false,storageWrites:false,imports:false,production:false,credentialsOutput:false,piiOutput:false}
};

function validProjectId(v){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(v)&&!/--/.test(v);}
function validLocation(v){return /^[a-z][a-z0-9-]{2,31}$/.test(v);}
function base64url(v){return Buffer.from(v).toString('base64url');}
function category(value){const raw=String(value?.category||value?.status||value?.code||value?.name||value?.message||value||'UNKNOWN');if(/404|not.found/i.test(raw))return'NOT_FOUND';if(/403|permission|denied|forbidden/i.test(raw))return'PERMISSION_DENIED';if(/401|unauth|invalid_grant/i.test(raw))return'UNAUTHENTICATED';if(/429|quota|rate/i.test(raw))return'QUOTA_OR_RATE_LIMIT';if(/timeout|abort/i.test(raw))return'TIMEOUT';return raw.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';}
function write(){fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'corte4-bootstrap-preflight.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');console.log(JSON.stringify(report,null,2));}
function stop(decision){report.decision=decision;write();process.exit(0);}
function timeoutError(label){return Object.assign(new Error(`${label} timeout`),{category:'TIMEOUT'});}
async function boundedFetch(url,options={},label='provider_request'){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{return await fetch(url,{...options,signal:controller.signal});}
  catch(error){if(error?.name==='AbortError')throw timeoutError(label);throw error;}
  finally{clearTimeout(timer);}
}

async function main(){
  if(process.env.CXORBIA_CONFIRM!==REQUIRED_CONFIRM)return stop('BLOCKED_MISSING_PREFLIGHT_CONFIRMATION');
  if(!validProjectId(projectId)||!expectedDisplayName)return stop('BLOCKED_INVALID_TARGET_IDENTITY');
  if(!validLocation(authorizedLocation))return stop('BLOCKED_MISSING_OR_INVALID_AUTHORIZED_FIRESTORE_LOCATION');
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
    const claims=base64url(JSON.stringify({iss:credential.client_email,scope:'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit',aud:credential.token_uri||'https://oauth2.googleapis.com/token',iat:now,exp:now+3300}));
    const signingInput=`${header}.${claims}`;
    const signature=crypto.sign('RSA-SHA256',Buffer.from(signingInput),credential.private_key).toString('base64url');
    const assertion=`${signingInput}.${signature}`;
    const response=await boundedFetch(credential.token_uri||'https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()},'oauth_token');
    const text=await response.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}
    if(!response.ok||!payload.access_token)throw Object.assign(new Error('oauth token unavailable'),{category:String(payload.error||response.status)});
    cachedToken=payload.access_token;return cachedToken;
  }
  async function request(method,url,body){
    const response=await boundedFetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();let payload=null;if(text){try{payload=JSON.parse(text);}catch{payload=null;}}
    return{ok:response.ok,status:response.status,payload};
  }

  const project=await request('GET',`https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(projectId)}`);
  if(!project.ok)return stop(project.status===403?'BLOCKED_PROJECT_READ_PERMISSION':'BLOCKED_PROJECT_NOT_VERIFIABLE');
  const p=project.payload||{};
  const displayName=String(p.displayName||p.name||'');
  report.target.projectExists=true;
  report.target.displayNameMatch=displayName===expectedDisplayName;
  const projectNumber=String(p.name||'').replace(/^projects\//,'');
  if(!report.target.displayNameMatch)return stop('BLOCKED_TARGET_DISPLAY_NAME_MISMATCH');

  const firebaseProject=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`);
  if(!firebaseProject.ok)return stop('BLOCKED_FIREBASE_PROJECT_NOT_VERIFIABLE');
  report.target.firebaseEnabled=Boolean(firebaseProject.payload?.projectId);
  const providerLocation=String(firebaseProject.payload?.resources?.locationId||'').trim();
  report.target.providerLocationId=providerLocation||null;
  if(providerLocation&&providerLocation!==authorizedLocation)return stop('BLOCKED_PROVIDER_LOCATION_CONFLICTS_WITH_AUTHORIZED_LOCATION');
  report.target.locationId=providerLocation||authorizedLocation;
  report.target.locationSource=providerLocation?'firebase_project_resources':'current_conversation_authorized';
  report.summary.locationResolved=Boolean(report.target.locationId);

  const iam=await request('POST',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}:testIamPermissions`,{permissions:requiredPermissions});
  if(!iam.ok)return stop('BLOCKED_IAM_PERMISSION_TEST_UNAVAILABLE');
  const granted=new Set(Array.isArray(iam.payload?.permissions)?iam.payload.permissions:[]);
  report.permissions.granted=requiredPermissions.filter(x=>granted.has(x));

  let disabledServiceCount=0;
  for(const service of bootstrapServices){
    let state='UNKNOWN';
    if(projectNumber){
      const r=await request('GET',`https://serviceusage.googleapis.com/v1/projects/${encodeURIComponent(projectNumber)}/services/${encodeURIComponent(service)}`);
      if(r.ok)state=String(r.payload?.state||'UNKNOWN');
      else state=`UNAVAILABLE_${category(r.status)}`;
    }
    const enabled=state==='ENABLED';
    if(!enabled)disabledServiceCount+=1;
    report.services[service]={state,enabled};
  }
  report.summary.disabledServiceCount=disabledServiceCount;
  report.summary.allRequiredServicesEnabled=disabledServiceCount===0;
  report.permissions.serviceEnablePermissionRequired=disabledServiceCount>0;

  const effectiveRequired=requiredPermissions.filter(permission=>permission!=='serviceusage.services.enable'||disabledServiceCount>0);
  report.permissions.missing=effectiveRequired.filter(x=>!granted.has(x));
  const writePrefixes=['firebase.clients.create','datastore.databases.create','firebaseauth.configs.create','firebaseauth.users.create','firebaseauth.users.update','firebaserules.rulesets.create','firebaserules.releases.create','firebaserules.releases.update','serviceusage.services.enable'];
  report.permissions.writePermissionsMissing=report.permissions.missing.filter(x=>writePrefixes.includes(x));
  report.summary.missingPermissionCount=report.permissions.missing.length;
  report.summary.allRequiredPermissionsGranted=report.permissions.missing.length===0;
  report.summary.providerWriteReady=Boolean(report.target.projectExists&&report.target.displayNameMatch&&report.target.firebaseEnabled&&report.summary.locationResolved&&report.summary.allRequiredPermissionsGranted);

  if(!report.summary.locationResolved)return stop('BOOTSTRAP_PREFLIGHT_BLOCKED_FIRESTORE_LOCATION_UNRESOLVED');
  if(!report.summary.allRequiredPermissionsGranted)return stop('BOOTSTRAP_PREFLIGHT_BLOCKED_IAM_WRITE_PERMISSIONS');
  report.decision='BOOTSTRAP_PREFLIGHT_READY_FOR_AUTHORIZED_WRITES_C4';
  write();
}

main().catch(error=>{report.decision='UNEXPECTED_BOOTSTRAP_PREFLIGHT_FAILURE';report.errorCategory=category(error);write();});
