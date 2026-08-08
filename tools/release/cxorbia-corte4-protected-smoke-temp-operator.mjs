#!/usr/bin/env node
/* CXOrbia · Corte 4 · protected CX.data smoke with one reversible DEV Auth principal.
   Exact authorization: "Autorizo operador DEV temporal para smoke protegido de Corte 4".
   No Firestore document writes, Storage, Hosting deploy, Functions, imports, HR writes,
   Make/Gemini, payments/lots, merge, production or TyA materialization are allowed. */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';

const args=process.argv.slice(2);
const has=name=>args.includes(name);
const arg=(name,fallback)=>{const i=args.indexOf(name);return i>=0&&args[i+1]?args[i+1]:fallback;};
const cleanupOnly=has('--cleanup-only');
const outDir=path.resolve(arg('--out','.tmp/corte4-protected-smoke'));
const privateDir=path.resolve(arg('--private','.tmp/corte4-protected-smoke-private'));
const requestPath=path.resolve(process.env.CXORBIA_REQUEST_PATH||'.github/cxorbia-firebase-requests/corte4-protected-smoke-temp-operator.json');
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const requiredConfirm='EXECUTE_CORTE4_PROTECTED_SMOKE_TEMP_OPERATOR';
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const projectId=String(request.targetProjectId||'');
const displayName=String(request.targetDisplayName||'');
const tenantId=String(request.tenantId||'');
const tempRole=String(request.temporaryRole||'');
const tempEmail=String(request.temporaryEmail||'');
const statePath=path.join(privateDir,'cleanup-state.json');
const mainReportPath=path.join(outDir,'protected-smoke.source-safe.json');
const cleanupReportPath=path.join(outDir,'cleanup.source-safe.json');
const REQUEST_TIMEOUT_MS=15000;

const report={
  schemaVersion:'1.1.1',gate:'cxorbia-corte4-protected-cxdata-smoke-temp-operator',generatedAt:new Date().toISOString(),decision:'HOLD_NOT_EXECUTED',
  authorization:{confirmed:false,exactTextMatched:false},
  target:{projectId,displayNameVerified:false,firebaseVerified:false},
  preflight:{permissionsGranted:false,missingPermissions:[],authUsersBefore:null,emailEnabledBefore:null,passwordRequiredBefore:null,firestoreEmptyBefore:null,rulesVerified:false,webAppVerified:false,browserRuntimeAvailable:false,browserRuntime:null},
  temporaryAuth:{providerEnabled:false,userCreated:false,claimsSet:false,temporaryUserIdOutput:false,passwordOutput:false},
  browserSmoke:{executed:false,passed:false,source:null,empty:null,fallbackUsed:null,readOnly:null,writeMode:null,interfacePreserved:false,claimsVerified:false,directBackendWriteBlocked:false,firestoreArraysEmpty:false,pageErrors:0,browserExitCode:null},
  cleanup:{attempted:false,userDeleted:false,emailProviderRestored:false,authUsersAfter:null,emailEnabledAfter:null,passwordRequiredAfter:null,firestoreEmptyAfter:null,complete:false},
  writes:{authConfigTransient:0,authUserCreateTransient:0,authClaimsTransient:0,authUserDeleteTransient:0,firestoreDocuments:0,storage:0,hr:0,imports:0,payments:0},
  safeState:{hostingDeploy:false,functions:false,make:false,gemini:false,merge:false,production:false,tyaDataMaterialized:false,secretsOutput:false,piiOutput:false}
};

function ensureDirs(){fs.mkdirSync(outDir,{recursive:true});fs.mkdirSync(privateDir,{recursive:true});}
function writeJson(file,obj){ensureDirs();fs.writeFileSync(file,JSON.stringify(obj,null,2)+'\n','utf8');}
function category(v){const s=String(v?.message||v?.status||v?.code||v||'UNKNOWN');if(/403|permission|denied|forbidden/i.test(s))return'PERMISSION_DENIED';if(/401|unauth/i.test(s))return'UNAUTHENTICATED';if(/404|not.?found/i.test(s))return'NOT_FOUND';if(/409|already/i.test(s))return'ALREADY_EXISTS';if(/429|quota|rate/i.test(s))return'RATE_LIMIT';if(/timeout|abort/i.test(s))return'TIMEOUT';return s.replace(/[^A-Z0-9_.-]/gi,'_').slice(0,100)||'UNKNOWN';}
function assertRequest(){
  const exact={schemaVersion:'cxorbia.corte4-protected-smoke-temp-operator.v1',enabled:true,authorizationSource:'current_conversation',authorizationText:'Autorizo operador DEV temporal para smoke protegido de Corte 4',repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',pullRequest:7,targetProjectId:'cxorbia-tya-dev-260729-c4',targetDisplayName:'CXOrbia TyA DEV Clean Corte 4',tenantId:'tya',temporaryRole:'admin',mode:'EXECUTE_PROTECTED_CXDATA_SMOKE_WITH_REVERSIBLE_TEMP_AUTH',hostingDeploy:false,functions:false,make:false,gemini:false,merge:false,production:false};
  for(const [k,v] of Object.entries(exact))if(request[k]!==v)throw new Error(`request_mismatch_${k}`);
  if(request.allowedAuthUserWrites?.createTemporaryUser!==1||request.allowedAuthUserWrites?.setTemporaryClaims!==1||request.allowedAuthUserWrites?.deleteTemporaryUser!==1||request.allowedAuthUserWrites?.permanentUsers!==0)throw new Error('request_auth_scope_mismatch');
  if(request.allowedProviderConfigWrites?.emailPasswordEnable!==true||request.allowedProviderConfigWrites?.emailPasswordDisable!==true)throw new Error('request_provider_scope_mismatch');
  if(Object.values(request.allowedDataWrites||{}).some(v=>Number(v)!==0))throw new Error('request_data_write_scope_mismatch');
  report.authorization.exactTextMatched=true;
}

let cachedToken=null;
function b64(v){return Buffer.from(v).toString('base64url');}
async function boundedFetch(url,options={},label='request'){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{return await fetch(url,{...options,signal:controller.signal});}catch(e){if(e?.name==='AbortError')throw new Error(`${label}_timeout`);throw e;}finally{clearTimeout(timer);}
}
function loadCredential(){if(!credentialPath||!fs.existsSync(credentialPath))throw new Error('credential_missing');const c=JSON.parse(fs.readFileSync(credentialPath,'utf8'));if(c?.type!=='service_account'||!c.client_email||!c.private_key||!c.token_uri)throw new Error('credential_invalid');return c;}
const credential=loadCredential();
async function token(){
  if(cachedToken)return cachedToken;const now=Math.floor(Date.now()/1000);const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const claims=b64(JSON.stringify({iss:credential.client_email,scope:'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase',aud:credential.token_uri,iat:now,exp:now+3300}));
  const input=`${header}.${claims}`;const assertion=`${input}.${crypto.sign('RSA-SHA256',Buffer.from(input),credential.private_key).toString('base64url')}`;
  const r=await boundedFetch(credential.token_uri,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()},'oauth');
  const t=await r.text();let p={};try{p=t?JSON.parse(t):{};}catch{}if(!r.ok||!p.access_token)throw new Error(`oauth_${r.status}`);cachedToken=p.access_token;return cachedToken;
}
async function adminRequest(method,url,body){const r=await boundedFetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}return{ok:r.ok,status:r.status,payload};}
async function apiKeyRequest(method,url,body){const r=await boundedFetch(url,{method,headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(body)});const text=await r.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}return{ok:r.ok,status:r.status,payload};}

async function getProject(){
  const r=await adminRequest('GET',`https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(projectId)}`);if(!r.ok)throw new Error(`project_get_${r.status}`);
  report.target.displayNameVerified=String(r.payload?.displayName||r.payload?.name||'')===displayName;if(!report.target.displayNameVerified)throw new Error('target_display_name_mismatch');
  const f=await adminRequest('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`);report.target.firebaseVerified=Boolean(f.ok&&f.payload?.projectId===projectId);if(!report.target.firebaseVerified)throw new Error('firebase_project_mismatch');
}
async function testPermissions(){
  const required=['resourcemanager.projects.get','firebase.clients.get','firebase.clients.list','firebaseauth.configs.get','firebaseauth.configs.update','firebaseauth.users.create','firebaseauth.users.update','firebaseauth.users.delete','firebaseauth.users.get','firebaserules.releases.get','firebaserules.rulesets.get','datastore.databases.get'];
  const r=await adminRequest('POST',`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}:testIamPermissions`,{permissions:required});if(!r.ok)throw new Error(`iam_test_${r.status}`);
  const granted=new Set(Array.isArray(r.payload?.permissions)?r.payload.permissions:[]);report.preflight.missingPermissions=required.filter(p=>!granted.has(p));report.preflight.permissionsGranted=report.preflight.missingPermissions.length===0;if(!report.preflight.permissionsGranted)throw new Error('missing_required_iam');
}
async function authConfig(){const r=await adminRequest('GET',`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config`);if(!r.ok)throw new Error(`auth_config_get_${r.status}`);return r.payload||{};}
function emailState(config){return{enabled:Boolean(config?.signIn?.email?.enabled),passwordRequired:Boolean(config?.signIn?.email?.passwordRequired)};}
async function setEmailState(enabled,passwordRequired){const mask='signIn.email.enabled,signIn.email.passwordRequired';const r=await adminRequest('PATCH',`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config?updateMask=${encodeURIComponent(mask)}`,{signIn:{email:{enabled:Boolean(enabled),passwordRequired:Boolean(passwordRequired)}}});report.writes.authConfigTransient+=1;if(!r.ok)throw new Error(`auth_config_patch_${r.status}_${category(r.payload?.error?.message)}`);}
async function authUserCount(){const r=await adminRequest('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:query`,{returnUserInfo:false});if(!r.ok)throw new Error(`auth_query_${r.status}`);return Number(r.payload?.recordsCount||0);}
async function lookupTempUser(){const r=await adminRequest('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:lookup`,{email:[tempEmail]});if(!r.ok&&r.status!==404)throw new Error(`auth_lookup_${r.status}`);const users=Array.isArray(r.payload?.users)?r.payload.users:[];return users[0]?.localId||null;}
async function firestoreEmpty(){const r=await adminRequest('POST',`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/%28default%29/documents:listCollectionIds`,{pageSize:1});if(!r.ok)throw new Error(`firestore_empty_${r.status}`);return !Array.isArray(r.payload?.collectionIds)||r.payload.collectionIds.length===0;}
async function rulesVerified(){const local=fs.readFileSync(path.resolve('backend/rules/firestore.corte4-readonly.rules'),'utf8');const release=await adminRequest('GET',`https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/releases/cloud.firestore`);if(!release.ok||!release.payload?.rulesetName)return false;const set=await adminRequest('GET',`https://firebaserules.googleapis.com/v1/${release.payload.rulesetName}`);if(!set.ok)return false;const content=(Array.isArray(set.payload?.source?.files)?set.payload.source.files:[]).map(f=>String(f.content||'')).join('\n');return crypto.createHash('sha256').update(content).digest('hex')===crypto.createHash('sha256').update(local).digest('hex');}
async function webConfig(){const apps=await adminRequest('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/webApps?pageSize=100`);if(!apps.ok)throw new Error(`webapps_${apps.status}`);const list=Array.isArray(apps.payload?.apps)?apps.payload.apps:[];const app=list.find(x=>String(x.displayName||'')==='CXOrbia TyA DEV Corte 4');if(list.length!==1||!app?.name)throw new Error('webapp_identity_mismatch');const cfg=await adminRequest('GET',`https://firebase.googleapis.com/v1beta1/${app.name}/config`);if(!cfg.ok||cfg.payload?.projectId!==projectId||!cfg.payload?.apiKey||!cfg.payload?.appId)throw new Error('web_config_unavailable');report.preflight.webAppVerified=true;return{apiKey:String(cfg.payload.apiKey),authDomain:String(cfg.payload.authDomain||`${projectId}.firebaseapp.com`),projectId:String(cfg.payload.projectId),appId:String(cfg.payload.appId),messagingSenderId:String(cfg.payload.messagingSenderId||'')};}
async function createTempUser(apiKey,password){const url=`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`;const r=await apiKeyRequest('POST',url,{email:tempEmail,password,returnSecureToken:false});report.writes.authUserCreateTransient+=1;if(!r.ok||!r.payload?.localId)throw new Error(`auth_user_create_${r.status}_${category(r.payload?.error?.message)}`);report.temporaryAuth.userCreated=true;writeJson(statePath,{schemaVersion:'1.0.0',projectId,tempEmail,localId:String(r.payload.localId),emailBefore:report.preflight.emailEnabledBefore,passwordRequiredBefore:report.preflight.passwordRequiredBefore});return String(r.payload.localId);}
async function setClaims(localId){const r=await adminRequest('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:update`,{localId,customAttributes:JSON.stringify({role:tempRole,tenantId}),returnSecureToken:false});report.writes.authClaimsTransient+=1;if(!r.ok)throw new Error(`auth_claims_${r.status}_${category(r.payload?.error?.message)}`);report.temporaryAuth.claimsSet=true;}
async function deleteTempUser(localId){if(!localId)return false;const r=await adminRequest('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:delete`,{localId});report.writes.authUserDeleteTransient+=1;if(!r.ok&&r.status!==404)throw new Error(`auth_user_delete_${r.status}`);return true;}

function findBrowser(){for(const candidate of [process.env.CHROME_BIN,'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean)){const r=spawnSync('which',[candidate],{encoding:'utf8'});if(r.status===0&&r.stdout.trim())return r.stdout.trim();}return null;}
function contentType(file){const ext=path.extname(file).toLowerCase();return({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'}[ext]||'application/octet-stream');}
function prepareSmokeSite(cfg,password){
  const site=path.join(privateDir,'site');fs.rmSync(site,{recursive:true,force:true});fs.cpSync(path.resolve('app'),site,{recursive:true});
  const configPath=path.join(site,'core','backend-config.js');let text=fs.readFileSync(configPath,'utf8');
  text=text.replace('apiKey: null',`apiKey: ${JSON.stringify(cfg.apiKey)}`).replace("authDomain: 'cxorbia-tya-dev-260729-c4.firebaseapp.com'",`authDomain: ${JSON.stringify(cfg.authDomain)}`).replace("projectId: 'cxorbia-tya-dev-260729-c4'",`projectId: ${JSON.stringify(cfg.projectId)}`).replace('messagingSenderId: null',`messagingSenderId: ${JSON.stringify(cfg.messagingSenderId)}`).replace('appId: null',`appId: ${JSON.stringify(cfg.appId)}`).replace("configSource: 'repo-placeholder-new-empty-candidate'","configSource: 'runtime-provider-protected-smoke'").replace('projectIdentityVerified: false','projectIdentityVerified: true').replace('emptyProjectVerified: false','emptyProjectVerified: true');
  fs.writeFileSync(configPath,text,'utf8');
  fs.writeFileSync(path.join(site,'core','backend-dev-auth.local.js'),`window.__C4_PAGE_ERRORS=[];window.addEventListener('error',e=>window.__C4_PAGE_ERRORS.push(String(e.message||'error').slice(0,160)));window.addEventListener('unhandledrejection',e=>window.__C4_PAGE_ERRORS.push(String(e.reason?.message||e.reason||'rejection').slice(0,160)));sessionStorage.setItem('CXORBIA_DEV_PASSWORD',${JSON.stringify(password)});`,'utf8');
  const harness=`(function(){const deadline=Date.now()+30000;function emit(result){const m=document.createElement('meta');m.name='c4-smoke-result';m.content=btoa(unescape(encodeURIComponent(JSON.stringify(result))));document.head.appendChild(m);document.documentElement.setAttribute('data-c4-smoke',result.pass?'pass':'fail');}async function check(){try{if(window.CX_CORTE4_READONLY&&window.CX_CORTE4_READONLY.source==='firestore'&&window.CX_CORTE4_READONLY.empty===true){const names=['addProject','setVisitState','assignVisit','payVisits','addShopper','updateShopper'];const types=Object.fromEntries(names.map(n=>[n,typeof (window.CX?.data||{})[n]]));let blocked=null;if(window.CX?.backend?.writeProject)blocked=await window.CX.backend.writeProject({id:'c4-smoke-no-write'});const auth=window.firebase?.auth?.();const tr=auth?.currentUser?await auth.currentUser.getIdTokenResult(true):null;const result={source:window.CX_BACKEND_DATA_SOURCE||null,lastState:window.CX_BACKEND_LAST_STATE||null,readonly:window.CX_CORTE4_READONLY||null,interface:{methodTypes:types,corte4Readonly:Boolean(window.CX?.data?.__corte4Readonly),writeMode:window.CX?.data?.__backendWriteMode||null},arrays:{projects:(window.CX?.data?.projects||[]).length,periods:(window.CX?.data?.periods||[]).length,shoppers:(window.CX?.data?.shoppers||[]).length,visits:(window.CX?.data?._visitas||[]).length,posts:(window.CX?.data?._posts||[]).length},claims:tr?{role:tr.claims?.role||null,tenantId:tr.claims?.tenantId||null}:null,directBackendWriteBlocked:Boolean(blocked&&blocked.status==='blocked'&&blocked.readOnly===true),pageErrors:(window.__C4_PAGE_ERRORS||[]).length};result.pass=result.source==='firestore'&&result.readonly?.empty===true&&result.lastState?.empty===true&&result.readonly?.fallbackUsed===false&&result.lastState?.fallbackUsed===false&&result.readonly?.readOnly===true&&result.readonly?.writeMode==='disabled'&&result.interface.corte4Readonly===true&&Object.values(result.interface.methodTypes).every(v=>v==='function')&&result.claims?.role==='admin'&&result.claims?.tenantId==='tya'&&result.directBackendWriteBlocked===true&&Object.values(result.arrays).every(v=>Number(v)===0)&&result.pageErrors===0;return emit(result);}}catch(e){if(Date.now()>=deadline)return emit({pass:false,error:String(e?.message||e).slice(0,160),pageErrors:(window.__C4_PAGE_ERRORS||[]).length});}if(Date.now()<deadline)return setTimeout(check,250);emit({pass:false,error:'timeout_waiting_for_firestore_readonly',source:window.CX_BACKEND_DATA_SOURCE||null,readonly:window.CX_CORTE4_READONLY||null,lastState:window.CX_BACKEND_LAST_STATE||null,pageErrors:(window.__C4_PAGE_ERRORS||[]).length});}setTimeout(check,0);})();`;
  fs.writeFileSync(path.join(site,'core','c4-protected-smoke-harness.local.js'),harness,'utf8');
  const htmlPath=path.join(site,'index-backend-dev.html');let html=fs.readFileSync(htmlPath,'utf8');html=html.replace('</body>','<script src="core/c4-protected-smoke-harness.local.js"></script>\n</body>');fs.writeFileSync(htmlPath,html,'utf8');
  return site;
}
async function runBrowserSmoke(cfg,password,browserBin){
  const site=prepareSmokeSite(cfg,password);
  const server=http.createServer((req,res)=>{try{const u=new URL(req.url||'/','http://127.0.0.1');let rel=decodeURIComponent(u.pathname).replace(/^\/+/, '')||'index-backend-dev.html';const candidate=path.resolve(site,rel);if(!candidate.startsWith(path.resolve(site)+path.sep)&&candidate!==path.resolve(site)){res.writeHead(403);return res.end();}if(!fs.existsSync(candidate)||!fs.statSync(candidate).isFile()){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':contentType(candidate),'cache-control':'no-store'});res.end(fs.readFileSync(candidate));}catch{res.writeHead(500);res.end();}});
  await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
  const port=server.address().port;const profile=path.join(privateDir,'chrome-profile');fs.mkdirSync(profile,{recursive:true});
  const url=`http://127.0.0.1:${port}/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV`;
  let stdout='';let stderr='';let code=null;let timer=null;
  try{
    const child=spawn(browserBin,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--user-data-dir=${profile}`,'--dump-dom','--virtual-time-budget=35000',url],{stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',d=>{if(stdout.length<4_000_000)stdout+=d.toString();});child.stderr.on('data',d=>{if(stderr.length<200_000)stderr+=d.toString();});
    code=await new Promise((resolve,reject)=>{timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('chrome_timeout'));},60000);child.on('error',reject);child.on('close',resolve);});
    report.browserSmoke.browserExitCode=code;
    const match=stdout.match(/<meta\s+name="c4-smoke-result"\s+content="([^"]+)"/i)||stdout.match(/<meta\s+content="([^"]+)"\s+name="c4-smoke-result"/i);
    if(!match)throw new Error(`chrome_result_missing_exit_${code}`);
    let result;try{result=JSON.parse(Buffer.from(match[1],'base64').toString('utf8'));}catch{throw new Error('chrome_result_decode_failed');}
    report.browserSmoke.executed=true;report.browserSmoke.source=result.source||null;report.browserSmoke.empty=Boolean(result.readonly?.empty===true&&result.lastState?.empty===true);report.browserSmoke.fallbackUsed=Boolean(result.readonly?.fallbackUsed||result.lastState?.fallbackUsed);report.browserSmoke.readOnly=Boolean(result.readonly?.readOnly===true&&result.interface?.corte4Readonly===true);report.browserSmoke.writeMode=result.readonly?.writeMode||result.interface?.writeMode||null;report.browserSmoke.interfacePreserved=Object.values(result.interface?.methodTypes||{}).every(v=>v==='function');report.browserSmoke.claimsVerified=result.claims?.role===tempRole&&result.claims?.tenantId===tenantId;report.browserSmoke.directBackendWriteBlocked=result.directBackendWriteBlocked===true;report.browserSmoke.firestoreArraysEmpty=Object.values(result.arrays||{}).every(v=>Number(v)===0);report.browserSmoke.pageErrors=Number(result.pageErrors||0);report.browserSmoke.passed=result.pass===true&&code===0;
  }finally{if(timer)clearTimeout(timer);await new Promise(resolve=>server.close(()=>resolve()));fs.rmSync(site,{recursive:true,force:true});}
}

async function cleanup(localId,before){
  report.cleanup.attempted=true;let id=localId||null;try{if(!id)id=await lookupTempUser();}catch{}
  if(id){try{report.cleanup.userDeleted=await deleteTempUser(id);}catch{report.cleanup.userDeleted=false;}}else report.cleanup.userDeleted=true;
  try{const current=emailState(await authConfig());const desiredEnabled=Boolean(before?.enabled);const desiredPasswordRequired=Boolean(before?.passwordRequired);if(current.enabled!==desiredEnabled||current.passwordRequired!==desiredPasswordRequired)await setEmailState(desiredEnabled,desiredPasswordRequired);const final=emailState(await authConfig());report.cleanup.emailProviderRestored=final.enabled===desiredEnabled&&final.passwordRequired===desiredPasswordRequired;report.cleanup.emailEnabledAfter=final.enabled;report.cleanup.passwordRequiredAfter=final.passwordRequired;}catch{report.cleanup.emailProviderRestored=false;}
  try{report.cleanup.authUsersAfter=await authUserCount();}catch{report.cleanup.authUsersAfter=null;}try{report.cleanup.firestoreEmptyAfter=await firestoreEmpty();}catch{report.cleanup.firestoreEmptyAfter=null;}
  report.cleanup.complete=report.cleanup.userDeleted===true&&report.cleanup.emailProviderRestored===true&&report.cleanup.authUsersAfter===0&&report.cleanup.emailEnabledAfter===false&&report.cleanup.firestoreEmptyAfter===true;
}
async function cleanupOnlyRun(){ensureDirs();assertRequest();let state={};try{state=JSON.parse(fs.readFileSync(statePath,'utf8'));}catch{}const before={enabled:Boolean(state.emailBefore),passwordRequired:Boolean(state.passwordRequiredBefore)};await cleanup(state.localId||null,before);writeJson(cleanupReportPath,{generatedAt:new Date().toISOString(),decision:report.cleanup.complete?'CLEANUP_VERIFIED_C4':'CLEANUP_REVIEW_REQUIRED_C4',cleanup:report.cleanup,writes:{authConfigTransient:report.writes.authConfigTransient,authUserDeleteTransient:report.writes.authUserDeleteTransient},safeState:report.safeState});if(!report.cleanup.complete)process.exitCode=2;}

async function main(){
  ensureDirs();if(cleanupOnly)return cleanupOnlyRun();let localId=null;let before={enabled:false,passwordRequired:false};let failed=null;
  try{
    assertRequest();report.authorization.confirmed=process.env.CXORBIA_CONFIRM===requiredConfirm;if(!report.authorization.confirmed)throw new Error('missing_exact_confirmation');if(process.env.GITHUB_REF_NAME&&process.env.GITHUB_REF_NAME!==request.branch)throw new Error('wrong_branch');
    const browserBin=findBrowser();report.preflight.browserRuntimeAvailable=Boolean(browserBin);report.preflight.browserRuntime=browserBin?path.basename(browserBin):null;if(!browserBin)throw new Error('browser_runtime_unavailable');
    await getProject();await testPermissions();const cfgBefore=await authConfig();before=emailState(cfgBefore);report.preflight.emailEnabledBefore=before.enabled;report.preflight.passwordRequiredBefore=before.passwordRequired;report.preflight.authUsersBefore=await authUserCount();report.preflight.firestoreEmptyBefore=await firestoreEmpty();report.preflight.rulesVerified=await rulesVerified();
    if(report.preflight.authUsersBefore!==0)throw new Error('auth_not_empty_before');if(before.enabled!==false)throw new Error('email_provider_unexpectedly_enabled_before');if(report.preflight.firestoreEmptyBefore!==true)throw new Error('firestore_not_empty_before');if(report.preflight.rulesVerified!==true)throw new Error('readonly_rules_not_verified');
    const cfg=await webConfig();await setEmailState(true,true);report.temporaryAuth.providerEnabled=true;const password=`C4!${crypto.randomBytes(24).toString('base64url')}aA7`;localId=await createTempUser(cfg.apiKey,password);await setClaims(localId);await runBrowserSmoke(cfg,password,browserBin);if(!report.browserSmoke.passed)throw new Error('protected_browser_smoke_failed');
  }catch(e){failed=category(e);}finally{try{await cleanup(localId,before);}catch(e){failed=failed||`cleanup_${category(e)}`;}fs.rmSync(privateDir,{recursive:true,force:true});}
  if(!failed&&report.browserSmoke.passed&&report.cleanup.complete){report.decision='PASS_CORTE4_PROTECTED_CXDATA_SMOKE_TEMP_OPERATOR_CLEANED';writeJson(mainReportPath,report);}else{report.decision=report.cleanup.complete?'HOLD_PROTECTED_SMOKE_FAILED_CLEANUP_COMPLETE':'P0_CLEANUP_NOT_VERIFIED_REVIEW_REQUIRED';report.errorCategory=failed||'UNKNOWN';writeJson(mainReportPath,report);process.exitCode=3;}
}
main().catch(e=>{report.decision='P0_UNEXPECTED_EXECUTOR_FAILURE_REVIEW_REQUIRED';report.errorCategory=category(e);writeJson(mainReportPath,report);process.exitCode=4;});
