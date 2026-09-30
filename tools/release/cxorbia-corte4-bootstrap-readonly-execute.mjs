#!/usr/bin/env node
/* CXOrbia · Corte 4 · authorized DEV read-only bootstrap executor.
   Authorized provider CONFIG writes only:
   - enable required Firebase/Firestore/Auth/Rules services;
   - create exactly one Firebase Web App DEV if none exists;
   - create the (default) Firestore Native database in the explicitly authorized location if absent;
   - verify Firebase Auth config; Spark projects that require Console initialization stay fail-closed;
   - publish backend/rules/firestore.corte4-readonly.rules to cloud.firestore.

   Forbidden here: Firestore document writes, Auth user creation, Storage, Hosting deploy,
   Functions, imports/materialization, HR writes, Make/Gemini, payments, merge, production. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const REQUIRED_CONFIRM='EXECUTE_BOOTSTRAP_DEV_READ_ONLY_C4';
const args=process.argv.slice(2);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]:fallback;};
const outDir=path.resolve(arg('--out','.tmp/corte4-bootstrap-execute'));
const projectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const expectedDisplayName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'').trim();
const firestoreLocation=String(process.env.CXORBIA_FIRESTORE_LOCATION||'').trim();
const webAppDisplayName=String(process.env.CXORBIA_WEB_APP_NAME||'CXOrbia TyA DEV Corte 4').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const rulesPath=path.resolve(process.env.CXORBIA_RULES_PATH||'backend/rules/firestore.corte4-readonly.rules');
const REQUEST_TIMEOUT_MS=Math.max(3000,Number(process.env.CXORBIA_REQUEST_TIMEOUT_MS||12000));
const OPERATION_DEADLINE_MS=Math.max(30000,Number(process.env.CXORBIA_OPERATION_DEADLINE_MS||180000));
const POLL_INTERVAL_MS=2000;
const services=['firebase.googleapis.com','firestore.googleapis.com','identitytoolkit.googleapis.com','firebaserules.googleapis.com'];
const requiredPermissions=[
  'resourcemanager.projects.get','firebase.clients.create','firebase.clients.get','firebase.clients.list',
  'datastore.databases.create','datastore.databases.get','firebaseauth.configs.create','firebaseauth.configs.get',
  'firebaserules.rulesets.create','firebaserules.rulesets.get','firebaserules.releases.create',
  'firebaserules.releases.get','firebaserules.releases.update','serviceusage.services.get','serviceusage.services.enable'
];

const report={
  schemaVersion:'1.1.0',
  gate:'cxorbia-corte4-bootstrap-dev-readonly-execute',
  generatedAt:new Date().toISOString(),
  decision:'HOLD_NOT_EXECUTED',
  authorization:{confirm:false,scope:'DEV_READONLY_BOOTSTRAP_CONFIG_ONLY'},
  target:{projectId,expectedDisplayName,firestoreLocation,webAppDisplayName,projectVerified:false,firebaseVerified:false,projectNumber:null},
  preflight:{permissionsGranted:false,missingPermissions:[]},
  services:{},
  webApp:{beforeCount:null,created:false,reused:false,appCount:null,displayNameMatch:false,configWrittenToArtifact:false,configSha256:null},
  firestore:{beforeExists:null,created:false,reused:false,locationMatch:false,typeMatch:false,collectionIdCount:null,emptyVerified:false},
  auth:{beforeInitialized:null,initialized:false,reused:false,configVerified:false,manualConsoleInitializationRequired:false,userWrites:false},
  rules:{rulesSha256:null,releaseBeforeExists:null,currentRulesMatched:false,rulesetCreated:false,releaseCreated:false,releaseUpdated:false,releaseVerified:false},
  providerWrites:{serviceEnable:0,webAppCreate:0,firestoreDatabaseCreate:0,authInitialize:0,rulesetCreate:0,releaseCreate:0,releaseUpdate:0,total:0},
  safeState:{firestoreDocumentWrites:false,authUserWrites:false,storageWrites:false,hostingDeploy:false,functions:false,imports:false,dataMigration:false,hrWrites:false,make:false,gemini:false,payments:false,merge:false,production:false,credentialsOutput:false,piiOutput:false}
};

function validProjectId(v){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(v)&&!/--/.test(v);}
function validLocation(v){return /^[a-z][a-z0-9-]{2,31}$/.test(v);}
function b64(v){return Buffer.from(v).toString('base64url');}
function sha256(v){return crypto.createHash('sha256').update(v).digest('hex');}
function category(value){const raw=String(value?.category||value?.status||value?.code||value?.name||value?.message||value||'UNKNOWN');if(/409|already.exists/i.test(raw))return'ALREADY_EXISTS';if(/404|not.found/i.test(raw))return'NOT_FOUND';if(/403|permission|denied|forbidden/i.test(raw))return'PERMISSION_DENIED';if(/401|unauth|invalid_grant/i.test(raw))return'UNAUTHENTICATED';if(/429|quota|rate/i.test(raw))return'QUOTA_OR_RATE_LIMIT';if(/billing/i.test(raw))return'BILLING_REQUIRED_OR_RESTRICTED';if(/timeout|abort/i.test(raw))return'TIMEOUT';return raw.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';}
function totalWrites(){report.providerWrites.total=Object.entries(report.providerWrites).filter(([k])=>k!=='total').reduce((sum,[,v])=>sum+Number(v||0),0);}
function write(){totalWrites();fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'corte4-bootstrap-execute.source-safe.json'),JSON.stringify(report,null,2)+'\n','utf8');console.log(JSON.stringify(report,null,2));}
function stop(decision){report.decision=decision;write();process.exit(0);}
function timeoutError(label){return Object.assign(new Error(`${label} timeout`),{category:'TIMEOUT'});}
async function boundedFetch(url,options={},label='provider_request'){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{return await fetch(url,{...options,signal:controller.signal});}
  catch(error){if(error?.name==='AbortError')throw timeoutError(label);throw error;}
  finally{clearTimeout(timer);}
}

async function main(){
  report.authorization.confirm=process.env.CXORBIA_CONFIRM===REQUIRED_CONFIRM;
  if(!report.authorization.confirm)return stop('BLOCKED_MISSING_EXPLICIT_BOOTSTRAP_AUTHORIZATION');
  if(!validProjectId(projectId)||!expectedDisplayName||!validLocation(firestoreLocation)||!webAppDisplayName)return stop('BLOCKED_INVALID_BOOTSTRAP_TARGET');
  if(!credentialPath||!fs.existsSync(credentialPath)||!fs.existsSync(rulesPath))return stop('BLOCKED_MISSING_CREDENTIAL_OR_RULES_FILE');
  let credential;try{credential=JSON.parse(fs.readFileSync(credentialPath,'utf8'));}catch{return stop('BLOCKED_INVALID_CREDENTIAL_JSON');}
  if(credential?.type!=='service_account'||!credential.client_email||!credential.private_key||!credential.token_uri)return stop('BLOCKED_CREDENTIAL_STRUCTURE_MISMATCH');
  const rulesContent=fs.readFileSync(rulesPath,'utf8');
  report.rules.rulesSha256=sha256(rulesContent);

  let cachedToken=null;
  async function token(){
    if(cachedToken)return cachedToken;
    const now=Math.floor(Date.now()/1000);
    const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}));
    const claims=b64(JSON.stringify({iss:credential.client_email,scope:'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',aud:credential.token_uri,iat:now,exp:now+3300}));
    const input=`${header}.${claims}`;
    const assertion=`${input}.${crypto.sign('RSA-SHA256',Buffer.from(input),credential.private_key).toString('base64url')}`;
    const response=await boundedFetch(credential.token_uri,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()},'oauth_token');
    const text=await response.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}
    if(!response.ok||!payload.access_token)throw Object.assign(new Error('oauth unavailable'),{category:String(payload.error||response.status)});
    cachedToken=payload.access_token;return cachedToken;
  }
  async function request(method,url,body){
    const response=await boundedFetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();let payload=null;if(text){try{payload=JSON.parse(text);}catch{payload={raw:false};}}
    return{ok:response.ok,status:response.status,payload};
  }
  async function poll(base,name,label){
    if(!name)return{attempts:0};const url=`${base}/${String(name).replace(/^\//,'')}`;const deadline=Date.now()+OPERATION_DEADLINE_MS;let attempts=0;
    while(Date.now()<deadline){attempts++;const r=await request('GET',url);if(!r.ok)throw Object.assign(new Error(`${label} poll failed`),{category:String(r.status)});if(r.payload?.done){if(r.payload?.error)throw Object.assign(new Error(`${label} operation failed`),{category:String(r.payload.error?.status||r.payload.error?.code||'OPERATION_ERROR')});return{attempts,response:r.payload?.response||null};}await new Promise(resolve=>setTimeout(resolve,POLL_INTERVAL_MS));}
    throw timeoutError(label);
  }

  const project=await request('GET',`https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(projectId)}`);
  if(!project.ok)return stop('BLOCKED_TARGET_PROJECT_NOT_VERIFIABLE');
  const displayName=String(project.payload?.displayName||project.payload?.name||'');
  if(displayName!==expectedDisplayName)return stop('BLOCKED_TARGET_DISPLAY_NAME_MISMATCH');
  report.target.projectVerified=true;
  report.target.projectNumber=String(project.payload?.name||'').replace(/^projects\//,'')||null;
  const firebase=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`);
  if(!firebase.ok||firebase.payload?.projectId!==projectId)return stop('BLOCKED_FIREBASE_PROJECT_NOT_VERIFIABLE');
  report.target.firebaseVerified=true;

  const iam=await request('POST',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}:testIamPermissions`,{permissions:requiredPermissions});
  if(!iam.ok)return stop('BLOCKED_IAM_PERMISSION_TEST_UNAVAILABLE');
  const granted=new Set(Array.isArray(iam.payload?.permissions)?iam.payload.permissions:[]);
  report.preflight.missingPermissions=requiredPermissions.filter(p=>!granted.has(p));
  report.preflight.permissionsGranted=report.preflight.missingPermissions.length===0;
  if(!report.preflight.permissionsGranted)return stop('BLOCKED_IAM_CHANGED_AFTER_PREFLIGHT');

  for(const service of services){
    const number=report.target.projectNumber;
    if(!number)return stop('BLOCKED_PROJECT_NUMBER_UNAVAILABLE');
    const getUrl=`https://serviceusage.googleapis.com/v1/projects/${encodeURIComponent(number)}/services/${encodeURIComponent(service)}`;
    let current=await request('GET',getUrl);
    let state=current.ok?String(current.payload?.state||'UNKNOWN'):`UNAVAILABLE_${category(current.status)}`;
    let enabled=state==='ENABLED';
    if(!enabled){
      const enable=await request('POST',`${getUrl}:enable`,{});
      report.providerWrites.serviceEnable+=1;
      if(!enable.ok)return stop(`BLOCKED_SERVICE_ENABLE_${service.replace(/[^a-z0-9]/gi,'_').toUpperCase()}_${category(enable.status)}`);
      await poll('https://serviceusage.googleapis.com/v1',enable.payload?.name,`enable_${service}`);
      current=await request('GET',getUrl);state=current.ok?String(current.payload?.state||'UNKNOWN'):`UNAVAILABLE_${category(current.status)}`;enabled=state==='ENABLED';
      if(!enabled)return stop(`BLOCKED_SERVICE_NOT_ENABLED_${service.replace(/[^a-z0-9]/gi,'_').toUpperCase()}`);
    }
    report.services[service]={enabled,state};
  }

  let appsResp=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/webApps?pageSize=100`);
  if(!appsResp.ok)return stop('BLOCKED_WEB_APP_LIST_UNAVAILABLE');
  let apps=Array.isArray(appsResp.payload?.apps)?appsResp.payload.apps:[];
  report.webApp.beforeCount=apps.length;
  if(apps.length===0){
    const created=await request('POST',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/webApps`,{displayName:webAppDisplayName});
    report.providerWrites.webAppCreate+=1;report.webApp.created=true;
    if(!created.ok)return stop(`BLOCKED_WEB_APP_CREATE_${category(created.status)}`);
    await poll('https://firebase.googleapis.com/v1beta1',created.payload?.name,'web_app_create');
    appsResp=await request('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/webApps?pageSize=100`);
    if(!appsResp.ok)return stop('BLOCKED_WEB_APP_POSTCREATE_LIST_UNAVAILABLE');
    apps=Array.isArray(appsResp.payload?.apps)?appsResp.payload.apps:[];
  } else if(apps.length===1&&String(apps[0]?.displayName||'')===webAppDisplayName){report.webApp.reused=true;}
  else return stop('BLOCKED_UNEXPECTED_WEB_APP_STATE_DO_NOT_REUSE');
  report.webApp.appCount=apps.length;
  const app=apps.length===1?apps[0]:null;
  report.webApp.displayNameMatch=Boolean(app&&String(app.displayName||'')===webAppDisplayName);
  if(!app||!report.webApp.displayNameMatch)return stop('BLOCKED_WEB_APP_IDENTITY_MISMATCH');
  const appName=String(app.name||`projects/${projectId}/webApps/${app.appId||''}`);
  const configResp=await request('GET',`https://firebase.googleapis.com/v1beta1/${appName}/config`);
  if(!configResp.ok||!configResp.payload?.appId||configResp.payload?.projectId!==projectId)return stop('BLOCKED_WEB_APP_CONFIG_UNAVAILABLE');
  const publicConfig={apiKey:String(configResp.payload.apiKey||''),authDomain:String(configResp.payload.authDomain||''),projectId:String(configResp.payload.projectId||''),appId:String(configResp.payload.appId||''),messagingSenderId:String(configResp.payload.messagingSenderId||'')};
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'web-config.public.json'),JSON.stringify(publicConfig,null,2)+'\n','utf8');
  report.webApp.configWrittenToArtifact=true;report.webApp.configSha256=sha256(JSON.stringify(publicConfig));

  const dbName=`projects/${projectId}/databases/(default)`;
  const dbUrl=`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/%28default%29`;
  let db=await request('GET',dbUrl);
  report.firestore.beforeExists=db.ok;
  if(db.status===404){
    const create=await request('POST',`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases?databaseId=%28default%29`,{locationId:firestoreLocation,type:'FIRESTORE_NATIVE',databaseEdition:'STANDARD'});
    report.providerWrites.firestoreDatabaseCreate+=1;report.firestore.created=true;
    if(!create.ok)return stop(`BLOCKED_FIRESTORE_CREATE_${category(create.status)}`);
    await poll('https://firestore.googleapis.com/v1',create.payload?.name,'firestore_create');
    db=await request('GET',dbUrl);
  } else if(db.ok){report.firestore.reused=true;}
  else return stop(`BLOCKED_FIRESTORE_GET_${category(db.status)}`);
  if(!db.ok)return stop('BLOCKED_FIRESTORE_POSTCREATE_VERIFY');
  report.firestore.locationMatch=String(db.payload?.locationId||'')===firestoreLocation;
  report.firestore.typeMatch=String(db.payload?.type||'')==='FIRESTORE_NATIVE';
  if(!report.firestore.locationMatch||!report.firestore.typeMatch)return stop('BLOCKED_FIRESTORE_IDENTITY_OR_LOCATION_MISMATCH');

  const collections=await request('POST',`https://firestore.googleapis.com/v1/${dbName}/documents:listCollectionIds`,{pageSize:1});
  if(!collections.ok)return stop(`BLOCKED_FIRESTORE_EMPTY_CHECK_${category(collections.status)}`);
  const collectionIds=Array.isArray(collections.payload?.collectionIds)?collections.payload.collectionIds:[];
  report.firestore.collectionIdCount=collectionIds.length;report.firestore.emptyVerified=collectionIds.length===0;
  if(!report.firestore.emptyVerified)return stop('BLOCKED_FIRESTORE_NOT_EMPTY_AFTER_BOOTSTRAP');

  const authConfig=await request('GET',`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config`);
  report.auth.beforeInitialized=authConfig.ok;
  if(authConfig.ok){report.auth.reused=true;report.auth.configVerified=true;}
  else if(authConfig.status===404){report.auth.manualConsoleInitializationRequired=true;}
  else return stop(`BLOCKED_AUTH_CONFIG_GET_${category(authConfig.status)}`);

  const releaseName=`projects/${projectId}/releases/cloud.firestore`;
  let release=await request('GET',`https://firebaserules.googleapis.com/v1/${releaseName}`);
  report.rules.releaseBeforeExists=release.ok;
  let currentMatches=false;
  if(release.ok&&release.payload?.rulesetName){
    const currentSet=await request('GET',`https://firebaserules.googleapis.com/v1/${release.payload.rulesetName}`);
    const files=Array.isArray(currentSet.payload?.source?.files)?currentSet.payload.source.files:[];
    const currentContent=files.map(f=>String(f.content||'')).join('\n');
    currentMatches=currentSet.ok&&sha256(currentContent)===sha256(rulesContent);
  }
  report.rules.currentRulesMatched=currentMatches;
  let rulesetName=release.ok?String(release.payload?.rulesetName||''):'';
  if(!currentMatches){
    const ruleset=await request('POST',`https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/rulesets`,{source:{files:[{name:'firestore.rules',content:rulesContent}]}});
    report.providerWrites.rulesetCreate+=1;report.rules.rulesetCreated=true;
    if(!ruleset.ok||!ruleset.payload?.name)return stop(`BLOCKED_RULESET_CREATE_${category(ruleset.status)}`);
    rulesetName=String(ruleset.payload.name);
    if(release.ok){
      const patched=await request('PATCH',`https://firebaserules.googleapis.com/v1/${releaseName}`,{release:{name:releaseName,rulesetName},updateMask:'rulesetName'});
      report.providerWrites.releaseUpdate+=1;report.rules.releaseUpdated=true;
      if(!patched.ok)return stop(`BLOCKED_RULES_RELEASE_UPDATE_${category(patched.status)}`);
    } else if(release.status===404){
      const createdRelease=await request('POST',`https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/releases`,{name:releaseName,rulesetName});
      report.providerWrites.releaseCreate+=1;report.rules.releaseCreated=true;
      if(!createdRelease.ok)return stop(`BLOCKED_RULES_RELEASE_CREATE_${category(createdRelease.status)}`);
    } else return stop(`BLOCKED_RULES_RELEASE_GET_${category(release.status)}`);
  }

  release=await request('GET',`https://firebaserules.googleapis.com/v1/${releaseName}`);
  if(!release.ok||!release.payload?.rulesetName)return stop('BLOCKED_RULES_RELEASE_POSTVERIFY');
  const finalSet=await request('GET',`https://firebaserules.googleapis.com/v1/${release.payload.rulesetName}`);
  const finalFiles=Array.isArray(finalSet.payload?.source?.files)?finalSet.payload.source.files:[];
  const finalContent=finalFiles.map(f=>String(f.content||'')).join('\n');
  report.rules.releaseVerified=finalSet.ok&&sha256(finalContent)===sha256(rulesContent);
  if(!report.rules.releaseVerified)return stop('BLOCKED_RULES_CONTENT_POSTVERIFY');

  report.decision=report.auth.manualConsoleInitializationRequired
    ? 'BOOTSTRAP_DEV_READONLY_PROVIDER_READY_AUTH_CONSOLE_REQUIRED_C4'
    : 'BOOTSTRAP_DEV_READONLY_COMPLETED_C4';
  write();
}

main().catch(error=>{report.errorCategory=category(error);report.decision='UNEXPECTED_BOOTSTRAP_EXECUTOR_FAILURE_REVIEW_REQUIRED';write();});
