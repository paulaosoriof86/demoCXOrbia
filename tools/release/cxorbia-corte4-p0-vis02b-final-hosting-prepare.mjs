#!/usr/bin/env node
/* CXOrbia · Corte 4 · P0-C4-VIS-02B · final Hosting DEV revalidation preflight/build.
   Scope: provider reads + local build only. No provider write is executed here. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const requestPath=path.resolve(process.env.CXORBIA_REQUEST_PATH||'.github/cxorbia-firebase-requests/corte4-p0-vis02b-final-revalidate.json');
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outDir=path.resolve(process.env.CXORBIA_OUT_DIR||'.tmp/corte4-p0-vis02b-final');
const siteDir=path.join(outDir,'site');
const configPath=path.join(outDir,'firebase.corte4-p0-vis02b-final.json');
const reportPath=path.join(outDir,'preflight.source-safe.json');
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const projectId=String(request.targetProjectId||'');
const displayName=String(request.targetDisplayName||'');
const expectedWebAppName=String(request.webAppDisplayName||'');
const authorizationId=String(request.authorizationId||'');
const timeoutMs=15000;
let cachedToken=null;

const report={schemaVersion:'1.0.0',gate:'cxorbia-corte4-p0-vis02b-final-preflight',generatedAt:new Date().toISOString(),decision:'HOLD_NOT_EXECUTED',authorization:{id:authorizationId,exactTextMatched:false,hostingDeployAllowed:false,maxDeployExecutions:0},target:{projectId,displayNameVerified:false,firebaseVerified:false},source:{branch:process.env.GITHUB_REF_NAME||'',commit:process.env.GITHUB_SHA||'',deployedBase:request.deployedBaseCommit||'',runtimeDelta:[]},provider:{webAppVerified:false,firestoreEmpty:null,authUsers:null,emailPasswordEnabled:null,rulesVerified:false,previousHostingProofVerified:false,defaultHostingSite:null},entrypoint:{integrity:false,danglingAdapterAbsent:false},build:{prepared:false,publicDir:null,configPath:null,configInjected:false,proofCreated:false,credentialsEmbedded:false},safety:{hostingOnly:true,firestoreDocumentWrites:0,authUserWrites:0,authConfigWrites:0,storageWrites:0,rulesDeploys:0,functionsDeploys:0,imports:0,hrWrites:0,make:0,gemini:0,payments:0,merge:false,production:false,secretsOutput:false}};

function ensureDir(){fs.mkdirSync(outDir,{recursive:true});}
function writeReport(){ensureDir();fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n','utf8');}
function stop(message){report.decision='HOLD_C4_P0_VIS02B_FINAL_PREFLIGHT';report.error=String(message||'unknown').replace(/[^A-Za-z0-9_.:-]/g,'_').slice(0,180);writeReport();throw new Error(report.error);}
function assertRequest(){
  const exact={schemaVersion:'cxorbia.corte4-p0-vis02b-final-revalidate.v1',enabled:true,authorizationSource:'current_conversation',authorizationText:'Autorizo un único Hosting DEV final para revalidación de P0-C4-VIS-02B, sin data writes ni producción',authorizationId:'c4-p0-vis02b-final-20260729-01',repository:'paulaosoriof86/demoCXOrbia',branch:'docs-tya-v6-v71-audit',pullRequest:7,targetProjectId:'cxorbia-tya-dev-260729-c4',targetDisplayName:'CXOrbia TyA DEV Clean Corte 4',webAppDisplayName:'CXOrbia TyA DEV Corte 4',deployedBaseCommit:'548e5f89c5d077686611d1904f4166d3188a2ccd',p0Id:'P0-C4-VIS-02B',mode:'P0_C4_VIS02B_FINAL_DANGLING_SCRIPT_FIX_ONE_HOSTING_REVALIDATION',hostingOnly:true,production:false,merge:false};
  for(const [k,v] of Object.entries(exact)) if(request[k]!==v) stop(`request_mismatch_${k}`);
  if(request.allowedProviderWrites?.hostingDeployExecutions!==1) stop('hosting_deploy_execution_scope_mismatch');
  for(const k of ['firestoreDocuments','authUsers','authConfig','storage','rules','functions','imports','hr','make','gemini','payments']) if(Number(request.allowedProviderWrites?.[k]||0)!==0) stop(`forbidden_write_scope_${k}`);
  report.authorization.exactTextMatched=true;report.authorization.hostingDeployAllowed=true;report.authorization.maxDeployExecutions=1;
}
function assertFocusedRuntimeDelta(){
  const base=String(request.deployedBaseCommit||'');
  if(spawnSync('git',['merge-base','--is-ancestor',base,'HEAD'],{stdio:'ignore'}).status!==0) stop('deployed_base_not_ancestor');
  const r=spawnSync('git',['diff','--name-only',base,'HEAD','--','app',':!app/docs/**'],{encoding:'utf8'});
  if(r.status!==0) stop('runtime_diff_failed');
  const files=String(r.stdout||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).sort();
  const allowed=['app/index-backend-dev.html'];
  report.source.runtimeDelta=files;
  if(JSON.stringify(files)!==JSON.stringify(allowed)) stop('runtime_delta_not_focused');
  const html=fs.readFileSync('app/index-backend-dev.html','utf8');
  report.entrypoint.danglingAdapterAbsent=!html.includes('adapters/tya-phase-a-source-safe-dev-adapter.js');
  if(!report.entrypoint.danglingAdapterAbsent) stop('dangling_adapter_reference_still_present');
  const qa=spawnSync(process.execPath,['tools/qa/cxorbia-corte4-entrypoint-script-integrity.mjs'],{encoding:'utf8'});
  report.entrypoint.integrity=qa.status===0;
  if(!report.entrypoint.integrity) stop('entrypoint_script_integrity_failed');
}
function loadCredential(){if(!credentialPath||!fs.existsSync(credentialPath))stop('credential_missing');const c=JSON.parse(fs.readFileSync(credentialPath,'utf8'));if(c?.type!=='service_account'||!c.client_email||!c.private_key||!c.token_uri)stop('credential_invalid');return c;}
const credential=loadCredential();
function b64(v){return Buffer.from(v).toString('base64url');}
async function boundedFetch(url,options={}){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
async function token(){if(cachedToken)return cachedToken;const now=Math.floor(Date.now()/1000);const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}));const claims=b64(JSON.stringify({iss:credential.client_email,scope:'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase',aud:credential.token_uri,iat:now,exp:now+3300}));const input=`${header}.${claims}`;const assertion=`${input}.${crypto.sign('RSA-SHA256',Buffer.from(input),credential.private_key).toString('base64url')}`;const r=await boundedFetch(credential.token_uri,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()});const text=await r.text();let p={};try{p=text?JSON.parse(text):{};}catch{}if(!r.ok||!p.access_token)stop(`oauth_${r.status}`);cachedToken=p.access_token;return cachedToken;}
async function req(method,url,body){const r=await boundedFetch(url,{method,headers:{Authorization:`Bearer ${await token()}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}return{ok:r.ok,status:r.status,payload};}
async function verifyPreviousHostingProof(){
  const url=`https://${projectId}.web.app/corte4-p0-vis02-proof.json?baseline=${encodeURIComponent(request.deployedBaseCommit)}`;
  const r=await boundedFetch(url,{headers:{'Cache-Control':'no-cache'}});if(!r.ok)stop(`previous_hosting_proof_${r.status}`);let p={};try{p=await r.json();}catch{stop('previous_hosting_proof_invalid_json');}
  report.provider.previousHostingProofVerified=p.firebaseProjectId===projectId&&p.sourceCommit===request.deployedBaseCommit&&p.hostingOnly===true&&p.production===false;
  if(!report.provider.previousHostingProofVerified)stop('previous_hosting_proof_mismatch');
}
async function verifyProvider(){
  let r=await req('GET',`https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(projectId)}`);if(!r.ok)stop(`project_${r.status}`);report.target.displayNameVerified=String(r.payload?.displayName||r.payload?.name||'')===displayName;if(!report.target.displayNameVerified)stop('project_display_name_mismatch');
  r=await req('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}`);report.target.firebaseVerified=Boolean(r.ok&&r.payload?.projectId===projectId);if(!report.target.firebaseVerified)stop(`firebase_project_${r.status}`);
  const apps=await req('GET',`https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/webApps?pageSize=100`);if(!apps.ok)stop(`webapps_${apps.status}`);const list=Array.isArray(apps.payload?.apps)?apps.payload.apps:[];const app=list.find(x=>String(x.displayName||'')===expectedWebAppName);if(list.length!==1||!app?.name)stop('webapp_identity_mismatch');const cfg=await req('GET',`https://firebase.googleapis.com/v1beta1/${app.name}/config`);if(!cfg.ok||cfg.payload?.projectId!==projectId||!cfg.payload?.apiKey||!cfg.payload?.appId)stop('web_config_unavailable');report.provider.webAppVerified=true;
  const auth=await req('GET',`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config`);if(!auth.ok)stop(`auth_config_${auth.status}`);report.provider.emailPasswordEnabled=Boolean(auth.payload?.signIn?.email?.enabled);if(report.provider.emailPasswordEnabled!==false)stop('email_password_must_be_disabled');
  const users=await req('POST',`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:query`,{returnUserInfo:false});if(!users.ok)stop(`auth_users_${users.status}`);report.provider.authUsers=Number(users.payload?.recordsCount||0);if(report.provider.authUsers!==0)stop('auth_users_must_be_zero');
  const empty=await req('POST',`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/%28default%29/documents:listCollectionIds`,{pageSize:1});if(!empty.ok)stop(`firestore_empty_${empty.status}`);report.provider.firestoreEmpty=!Array.isArray(empty.payload?.collectionIds)||empty.payload.collectionIds.length===0;if(!report.provider.firestoreEmpty)stop('firestore_not_empty');
  const localRules=fs.readFileSync(path.resolve('backend/rules/firestore.corte4-readonly.rules'),'utf8');const rel=await req('GET',`https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/releases/cloud.firestore`);if(!rel.ok||!rel.payload?.rulesetName)stop('rules_release_unavailable');const rs=await req('GET',`https://firebaserules.googleapis.com/v1/${rel.payload.rulesetName}`);if(!rs.ok)stop('ruleset_unavailable');const deployed=(Array.isArray(rs.payload?.source?.files)?rs.payload.source.files:[]).map(f=>String(f.content||'')).join('\n');report.provider.rulesVerified=crypto.createHash('sha256').update(deployed).digest('hex')===crypto.createHash('sha256').update(localRules).digest('hex');if(!report.provider.rulesVerified)stop('deployed_rules_mismatch');
  const sites=await req('GET',`https://firebasehosting.googleapis.com/v1beta1/projects/${encodeURIComponent(projectId)}/sites?pageSize=100`);if(!sites.ok)stop(`hosting_sites_${sites.status}`);const siteList=Array.isArray(sites.payload?.sites)?sites.payload.sites:[];const def=siteList.find(s=>String(s?.name||'').endsWith(`/sites/${projectId}`))||siteList[0];if(!def?.name)stop('default_hosting_site_missing');report.provider.defaultHostingSite=String(def.name).split('/').pop();return cfg.payload;
}
function prepareSite(cfg){
  fs.rmSync(outDir,{recursive:true,force:true});fs.mkdirSync(siteDir,{recursive:true});fs.cpSync(path.resolve('app'),siteDir,{recursive:true});
  const p=path.join(siteDir,'core','backend-config.js');let text=fs.readFileSync(p,'utf8');text=text.replace('apiKey: null',`apiKey: ${JSON.stringify(String(cfg.apiKey))}`).replace('messagingSenderId: null',`messagingSenderId: ${JSON.stringify(String(cfg.messagingSenderId||''))}`).replace('appId: null',`appId: ${JSON.stringify(String(cfg.appId))}`).replace("configSource: 'repo-placeholder-new-empty-candidate'","configSource: 'runtime-provider-hosting-dev-corte4-p0-vis02b-final'").replace('projectIdentityVerified: false','projectIdentityVerified: true').replace('emptyProjectVerified: false','emptyProjectVerified: true');if(text.includes('apiKey: null')||text.includes('appId: null'))stop('runtime_config_injection_failed');fs.writeFileSync(p,text,'utf8');
  fs.writeFileSync(path.join(siteDir,'core','backend-dev-auth.local.js'),"/* Corte 4 P0 VIS-02B final revalidation: no credential embedded; Auth remains disabled. */\n",'utf8');
  const proof={schemaVersion:'1.0.0',authorizationId,environment:'DEV',cut:4,p0:'P0-C4-VIS-02B',mode:'final-dangling-script-fix-role-switch-revalidation',firebaseProjectId:projectId,sourceCommit:process.env.GITHUB_SHA||'',deployedBaseCommit:request.deployedBaseCommit,hostingOnly:true,readOnly:true,writeMode:'disabled',expectedProjects:0,expectedFallbackUsed:false,firestoreDocumentWrites:false,authUsersExpected:0,emailPasswordExpected:false,storageWrites:false,rulesDeploy:false,functionsDeploy:false,imports:false,hrWrites:false,make:false,gemini:false,payments:false,merge:false,production:false};fs.writeFileSync(path.join(siteDir,'corte4-p0-vis02b-proof.json'),JSON.stringify(proof,null,2)+'\n','utf8');
  const firebaseConfig={hosting:{public:siteDir.replaceAll('\\','/'),ignore:['**/.*','**/node_modules/**'],rewrites:[{source:'**',destination:'/index-backend-dev.html'}],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-store'}]},{source:'**/*.html',headers:[{key:'Content-Type',value:'text/html; charset=utf-8'}]},{source:'**/*.js',headers:[{key:'Content-Type',value:'application/javascript; charset=utf-8'}]},{source:'**/*.css',headers:[{key:'Content-Type',value:'text/css; charset=utf-8'}]},{source:'**/*.json',headers:[{key:'Content-Type',value:'application/json; charset=utf-8'}]}]}};fs.writeFileSync(configPath,JSON.stringify(firebaseConfig,null,2)+'\n','utf8');report.build={prepared:true,publicDir:siteDir.replace(root,'<repo>'),configPath:configPath.replace(root,'<repo>'),configInjected:true,proofCreated:true,credentialsEmbedded:false};
}

try{assertRequest();assertFocusedRuntimeDelta();await verifyPreviousHostingProof();const cfg=await verifyProvider();prepareSite(cfg);report.decision='PASS_C4_P0_VIS02B_FINAL_PREFLIGHT_READY_FOR_ONE_DEPLOY';writeReport();console.log(JSON.stringify(report,null,2));}catch(e){if(!fs.existsSync(reportPath))writeReport();console.error(String(e?.message||e));process.exitCode=1;}
