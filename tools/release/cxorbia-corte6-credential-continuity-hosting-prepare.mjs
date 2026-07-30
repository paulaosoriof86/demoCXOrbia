import fs from 'node:fs';
import path from 'node:path';
import admin from 'firebase-admin';

const expectedProject=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const expectedSite=process.env.CXORBIA_EXPECTED_SITE||'cxorbia-backend-dev';
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const requestPath=path.resolve(process.env.CXORBIA_HOSTING_REQUEST||'backend/config/corte6-credential-continuity-hosting-request.json');
const importEvidencePath=path.resolve(process.env.CXORBIA_IMPORT_EVIDENCE||'app/docs/evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json');
const outDir=path.resolve(process.env.CXORBIA_HOSTING_OUT_DIR||'.tmp/corte6-credential-continuity-hosting');
const siteDir=path.join(outDir,'site');
const firebaseConfigPath=path.join(outDir,'firebase.hosting.json');
const preflightPath=path.join(outDir,'preflight.source-safe.json');

function stop(message){
  fs.mkdirSync(outDir,{recursive:true});
  const report={schemaVersion:'cxorbia.corte6-credential-continuity-hosting-preflight.v1',generatedAt:new Date().toISOString(),decision:'HOLD',error:String(message||'unknown').replace(/[\r\n]+/g,' ').slice(0,220),providerWrites:0,production:false,merge:false};
  fs.writeFileSync(preflightPath,JSON.stringify(report,null,2)+'\n','utf8');
  throw new Error(report.error);
}
if(!credentialPath||!fs.existsSync(credentialPath))stop('credential_missing');
if(!fs.existsSync(requestPath)||!fs.existsSync(importEvidencePath))stop('request_or_import_evidence_missing');
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const imported=JSON.parse(fs.readFileSync(importEvidencePath,'utf8'));
if(request.schemaVersion!=='cxorbia.corte6.credential-continuity-hosting-request.v1'||request.enabled!==true||request.status!=='authorized_waiting_execute'||request.authorizedBy!=='Paula'||!request.authorizationText||!request.authorizationId)stop('request_not_authorized');
if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||request.firebaseProjectId!==expectedProject||request.hostingSite!==expectedSite||request.hostingTarget!=='cxorbia-dev'||request.tenantId!=='tya'||request.projectId!=='cinepolis')stop('request_identity_mismatch');
if(request.singleHostingDeployMax!==1||request.hostingDeployExecutions!==0||request.consumed!==false||request.createFirebaseProject!==false||request.createHostingSite!==false)stop('one_shot_or_target_mismatch');
for(const k of ['authWrites','firestoreWrites','rulesDeploys','storageWrites','hrWrites','legacyWrites','paymentsWrites','functionsDeploys','makeWrites','geminiCalls'])if(request[k]!==0)stop(`unsafe_scope:${k}`);
if(request.production!==false||request.merge!==false)stop('unsafe_scope');
if(imported.schemaVersion!=='cxorbia.corte6.credential-import.v1'||imported.decision!=='PASS_EXACT_AUTH_IMPORT_READBACK'||imported.imported!==91||imported.readback!==91)stop('credential_import_not_pass');
if(request.requiresCredentialImportDecision!==imported.decision||request.requiresCredentialImportCount!==imported.imported)stop('credential_import_request_mismatch');

const authSource=fs.readFileSync(path.resolve('app/core/backend-browser-auth.js'),'utf8');
const authConfigSource=fs.readFileSync(path.resolve('app/core/backend-config-preview-dev.js'),'utf8');
for(const marker of ['cxIntegratedAuthStep','Usuario','Contraseña','Administración / Coordinación','Shopper / Evaluador','authNamespace','tenant + \'\\0\' + ns + \'\\0\' + normalized','signInWithEmailAndPassword','firstAuthState','Auth.Persistence.SESSION'])if(!authSource.includes(marker))stop(`single_login_source_marker_missing:${marker}`);
for(const forbidden of ['cxBackendAuthGate','cxBackendAuthNamespace','cxBackendAuthLogin','ensureOverlay()'])if(authSource.includes(forbidden))stop(`parallel_auth_gate_regression:${forbidden}`);
if(authSource.includes('Correo</label>'))stop('email_login_regression');
if(!authConfigSource.includes("mode: 'product-login-session'"))stop('product_login_session_mode_missing');
if(authConfigSource.includes("mode: 'interactive-session'"))stop('parallel_interactive_session_regression');

const sa=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if(sa.project_id!==expectedProject)stop('wrong_service_account_project');
const credential=admin.credential.cert(sa);const token=await credential.getAccessToken();if(!token?.access_token)stop('oauth_token_unavailable');
async function req(method,url,body){const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();let payload={};try{payload=text?JSON.parse(text):{};}catch{}return{ok:r.ok,status:r.status,payload};}
const provider=await req('GET',`https://firebase.googleapis.com/v1beta1/projects/${expectedProject}`);if(!provider.ok||provider.payload?.projectId!==expectedProject)stop(`firebase_project_${provider.status}`);
const apps=await req('GET',`https://firebase.googleapis.com/v1beta1/projects/${expectedProject}/webApps?pageSize=100`);if(!apps.ok)stop(`webapps_${apps.status}`);
const webApps=Array.isArray(apps.payload?.apps)?apps.payload.apps:[];const webApp=webApps.find(a=>String(a.displayName||'').toLowerCase().includes('cxorbia'))||webApps[0];if(!webApp?.name)stop('webapp_identity_missing');
const sdk=await req('GET',`https://firebase.googleapis.com/v1beta1/${webApp.name}/config`);if(!sdk.ok||sdk.payload?.projectId!==expectedProject||!sdk.payload?.apiKey||!sdk.payload?.appId)stop(`web_sdk_config_${sdk.status}`);
const sites=await req('GET',`https://firebasehosting.googleapis.com/v1beta1/projects/${expectedProject}/sites?pageSize=100`);if(!sites.ok)stop(`hosting_sites_${sites.status}`);
const siteList=Array.isArray(sites.payload?.sites)?apps.payload?.sites:[];
const verifiedSiteList=Array.isArray(sites.payload?.sites)?sites.payload.sites:[];if(!verifiedSiteList.some(s=>String(s?.name||'').endsWith(`/sites/${expectedSite}`)))stop('existing_hosting_site_missing');

fs.rmSync(outDir,{recursive:true,force:true});fs.mkdirSync(siteDir,{recursive:true});fs.cpSync(path.resolve('app'),siteDir,{recursive:true});
const backendConfigFile=path.join(siteDir,'core','backend-config.js');let text=fs.readFileSync(backendConfigFile,'utf8');
const cfg={apiKey:String(sdk.payload.apiKey),authDomain:String(sdk.payload.authDomain||`${expectedProject}.firebaseapp.com`),projectId:expectedProject,storageBucket:String(sdk.payload.storageBucket||`${expectedProject}.firebasestorage.app`),messagingSenderId:String(sdk.payload.messagingSenderId||''),appId:String(sdk.payload.appId),measurementId:sdk.payload.measurementId?String(sdk.payload.measurementId):null};
const replacement=`const firebaseConfig = {\n    apiKey: ${JSON.stringify(cfg.apiKey)},\n    authDomain: ${JSON.stringify(cfg.authDomain)},\n    projectId: ${JSON.stringify(cfg.projectId)},\n    storageBucket: ${JSON.stringify(cfg.storageBucket)},\n    messagingSenderId: ${JSON.stringify(cfg.messagingSenderId)},\n    appId: ${JSON.stringify(cfg.appId)},\n    measurementId: ${cfg.measurementId?JSON.stringify(cfg.measurementId):'null'},\n  };`;
const before=text;text=text.replace(/const firebaseConfig = \{[\s\S]*?\n  \};/,replacement);if(text===before||!text.includes(`projectId: ${JSON.stringify(expectedProject)}`))stop('firebase_config_injection_failed');
text=text.replace('defaultProjectId: null',"defaultProjectId: 'cinepolis'").replace(/configSource: '[^']*'/,"configSource: 'runtime-existing-hosting-dev-corte6-single-login'").replace('sandboxOnly: true','sandboxOnly: false').replace('projectIdentityVerified: false','projectIdentityVerified: true');
fs.writeFileSync(backendConfigFile,text,'utf8');
fs.writeFileSync(path.join(siteDir,'core','backend-dev-auth.local.js'),'/* Corte 6 single-login: no credentials embedded; Firebase Auth stays behind the product login adapter. */\n','utf8');
const proof={schemaVersion:'cxorbia.corte6-credential-continuity-hosting-proof.v1',generatedAt:new Date().toISOString(),authorizationId:request.authorizationId,environment:'DEV',firebaseProjectId:expectedProject,hostingSite:expectedSite,hostingTarget:'cxorbia-dev',sourceCommit:process.env.GITHUB_SHA||'',entrypoint:'index-backend-dev.html',tenantId:'tya',canonicalProjectId:'cinepolis',authMode:'firebase-username-password-namespaced-product-login',authNamespaces:['staff','shopper'],singleVisibleLogin:true,parallelAuthGate:false,preservedLegacyAuthUsers:imported.imported,roleCounts:imported.targetRoleCounts,readOnly:true,writeMode:'disabled',credentialsEmbedded:false,firestoreDataWrites:false,authWrites:false,storageWrites:false,rulesDeploy:false,functionsDeploy:false,hrWrites:false,legacyWrites:false,payments:false,merge:false,production:false};
fs.writeFileSync(path.join(siteDir,'corte6-credential-continuity-proof.json'),JSON.stringify(proof,null,2)+'\n','utf8');
const firebaseHosting={hosting:{target:'cxorbia-dev',public:siteDir.replaceAll('\\','/'),ignore:['**/.*','**/node_modules/**'],rewrites:[{source:'**',destination:'/index-backend-dev.html'}],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-store'}]},{source:'**/*.html',headers:[{key:'Content-Type',value:'text/html; charset=utf-8'}]},{source:'**/*.js',headers:[{key:'Content-Type',value:'application/javascript; charset=utf-8'}]},{source:'**/*.css',headers:[{key:'Content-Type',value:'text/css; charset=utf-8'}]},{source:'**/*.json',headers:[{key:'Content-Type',value:'application/json; charset=utf-8'}]}]}};
fs.writeFileSync(firebaseConfigPath,JSON.stringify(firebaseHosting,null,2)+'\n','utf8');
const siteScan=fs.readFileSync(backendConfigFile,'utf8')+fs.readFileSync(path.join(siteDir,'index-backend-dev.html'),'utf8')+fs.readFileSync(path.join(siteDir,'core','backend-browser-auth.js'),'utf8')+fs.readFileSync(path.join(siteDir,'core','backend-config-preview-dev.js'),'utf8');
if(/BEGIN PRIVATE KEY|service_account/i.test(siteScan))stop('credential_material_detected');
for(const marker of ['cxIntegratedAuthStep','signInWithEmailAndPassword',"mode: 'product-login-session'"])if(!siteScan.includes(marker))stop(`runtime_auth_marker_missing:${marker}`);
for(const forbidden of ['cxBackendAuthGate','cxBackendAuthNamespace','cxBackendAuthLogin'])if(siteScan.includes(forbidden))stop(`parallel_auth_gate_runtime_regression:${forbidden}`);
const report={schemaVersion:'cxorbia.corte6-existing-hosting-dev-preflight.v1',generatedAt:new Date().toISOString(),decision:'PASS_READY_FOR_SINGLE_EXISTING_HOSTING_DEPLOY',authorizationRequestId:request.requestId,target:{projectId:expectedProject,hostingTarget:'cxorbia-dev',hostingSite:expectedSite,existingSiteVerified:true,newProject:false,newHosting:false},source:{branch:process.env.GITHUB_REF_NAME||'',commit:process.env.GITHUB_SHA||''},provider:{firebaseVerified:true,webAppVerified:true,hostingSiteVerified:true},build:{siteDir:siteDir.replace(process.cwd(),'<repo>'),firebaseConfigPath:firebaseConfigPath.replace(process.cwd(),'<repo>'),entrypoint:'index-backend-dev.html',firebaseConfigInjected:true,credentialContinuityLogin:true,singleVisibleLogin:true,parallelAuthGate:false,credentialsEmbedded:false},authContinuity:{imported:imported.imported,readback:imported.readback,namespaces:imported.targetNamespaceCounts,roles:imported.targetRoleCounts},safety:{hostingDeployMax:1,firestoreDataWrites:0,authWrites:0,storageWrites:0,rulesDeploys:0,functionsDeploys:0,hrWrites:0,legacyWrites:0,payments:0,merge:false,production:false}};
fs.writeFileSync(preflightPath,JSON.stringify(report,null,2)+'\n','utf8');console.log(JSON.stringify(report));
