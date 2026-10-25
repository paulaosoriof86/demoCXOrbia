import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import admin from 'firebase-admin';

const root = process.cwd();
const requestPath = path.resolve(process.env.CXORBIA_HOSTING_REQUEST || 'backend/config/phase-a-hosting-dev-execution-request-v1.json');
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const outDir = path.resolve(process.env.CXORBIA_HOSTING_OUT_DIR || '.tmp/corte6-existing-hosting-dev');
const siteDir = path.join(outDir, 'site');
const firebaseConfigPath = path.join(outDir, 'firebase.hosting.json');
const preflightPath = path.join(outDir, 'preflight.source-safe.json');
const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));

function stop(message){
  const report={schemaVersion:'cxorbia.corte6-existing-hosting-dev-preflight.v1',generatedAt:new Date().toISOString(),decision:'HOLD',error:String(message||'unknown').replace(/[\r\n]+/g,' ').slice(0,220),providerWrites:0,production:false,merge:false};
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(preflightPath,JSON.stringify(report,null,2)+'\n','utf8');
  throw new Error(report.error);
}

if (!credentialPath || !fs.existsSync(credentialPath)) stop('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath,'utf8'));
if (sa.project_id !== 'cxorbia-backend-dev') stop(`wrong_service_account_project:${sa.project_id||'missing'}`);

function validateRequest(){
  if(request.schemaVersion!=='cxorbia.c5-existing-hosting-dev-visual.v1') stop('request_schema_mismatch');
  if(request.requestId!=='c5-existing-hosting-dev-visual-20260730-01') stop('request_id_mismatch');
  if(request.authorizedBy!=='Paula'||request.authorizationSource!=='current_conversation_2026-07-30') stop('authorization_identity_mismatch');
  if(request.authorizationText!=='Autorizo un único redeploy sobre el Hosting DEV de visualización ya existente, vinculando CXOrbia read-only a cxorbia-backend-dev para validar Corte 5 con datos reales; sin crear Hosting ni proyecto Firebase adicional, sin nuevos data writes, Auth/Storage/HR/legacy writes, pagos, merge ni producción.') stop('authorization_text_mismatch');
  if(request.scope!=='existing_hosting_dev_single_redeploy_readonly_visual') stop('scope_mismatch');
  if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit') stop('repo_branch_mismatch');
  if(request.targetProject!=='cxorbia-backend-dev'||request.hostingTarget!=='cxorbia-dev'||request.existingHostingRootUrl!=='https://cxorbia-backend-dev.web.app') stop('hosting_target_mismatch');
  if(request.tenantId!=='tya'||request.canonicalProjectId!=='cinepolis') stop('tenant_project_mismatch');
  if(request.singleHostingDeployMax!==1||request.hostingDeployExecutions!==0||request.consumed!==false||request.enabled!==true) stop('one_shot_state_mismatch');
  if(request.createFirebaseProject!==false||request.createHostingSite!==false||request.firestoreWrites!==0||request.authWrites!==0||request.storageWrites!==0||request.hrWrites!==0||request.legacyWrites!==0||request.paymentsWrites!==0||request.functionsDeploy!==false||request.rulesDeploy!==false||request.merge!==false||request.production!==false) stop('unsafe_scope');
}
validateRequest();

const c6Request = JSON.parse(fs.readFileSync(path.resolve('.github/cxorbia-firebase-requests/corte6-auth-rbac-activation.json'),'utf8'));
if(c6Request.consumed!==true||c6Request.enabled!==false) stop('corte6_auth_not_frozen');
const rbac = JSON.parse(fs.readFileSync(path.resolve('app/docs/evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json'),'utf8'));
const readiness = rbac?.auth?.readiness || {};
if(!(readiness.operatorLoginReady>0&&readiness.clientLoginReady===2&&readiness.shopperLoginReady===3&&readiness.allRequiredRoleFamiliesHaveAtLeastOne===true)) stop('corte6_auth_readiness_not_pass');
const rulesEvidence = JSON.parse(fs.readFileSync(path.resolve('app/docs/evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json'),'utf8'));
if(rulesEvidence.decision!=='PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED'||rulesEvidence.verified!==true) stop('corte6_rules_not_verified');

const firebaserc = JSON.parse(fs.readFileSync(path.resolve('.firebaserc'),'utf8'));
const mapped = firebaserc?.targets?.['cxorbia-backend-dev']?.hosting?.['cxorbia-dev'] || [];
if(!Array.isArray(mapped)||!mapped.includes('cxorbia-backend-dev')) stop('hosting_target_mapping_missing');

const credential = admin.credential.cert(sa);
const token = await credential.getAccessToken();
if(!token?.access_token) stop('oauth_token_unavailable');
async function req(method,url,body){
  const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text(); let payload={}; try{payload=text?JSON.parse(text):{};}catch{}
  return {ok:r.ok,status:r.status,payload};
}

const projectId='cxorbia-backend-dev';
let provider=await req('GET',`https://firebase.googleapis.com/v1beta1/projects/${projectId}`);
if(!provider.ok||provider.payload?.projectId!==projectId) stop(`firebase_project_${provider.status}`);
const apps=await req('GET',`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps?pageSize=100`);
if(!apps.ok) stop(`webapps_${apps.status}`);
const webApps=Array.isArray(apps.payload?.apps)?apps.payload.apps:[];
if(webApps.length<1) stop('webapp_missing');
const webApp=webApps.find(a=>String(a.displayName||'').toLowerCase().includes('cxorbia'))||webApps[0];
if(!webApp?.name) stop('webapp_identity_missing');
const sdk=await req('GET',`https://firebase.googleapis.com/v1beta1/${webApp.name}/config`);
if(!sdk.ok||sdk.payload?.projectId!==projectId||!sdk.payload?.apiKey||!sdk.payload?.appId) stop(`web_sdk_config_${sdk.status}`);
const sites=await req('GET',`https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites?pageSize=100`);
if(!sites.ok) stop(`hosting_sites_${sites.status}`);
const siteList=Array.isArray(sites.payload?.sites)?sites.payload.sites:[];
const hostingSite=siteList.find(s=>String(s?.name||'').endsWith('/sites/cxorbia-backend-dev'));
if(!hostingSite) stop('existing_hosting_site_missing');

fs.rmSync(outDir,{recursive:true,force:true});
fs.mkdirSync(siteDir,{recursive:true});
fs.cpSync(path.resolve('app'),siteDir,{recursive:true});
const backendConfigFile=path.join(siteDir,'core','backend-config.js');
let text=fs.readFileSync(backendConfigFile,'utf8');
const cfg={
  apiKey:String(sdk.payload.apiKey),
  authDomain:String(sdk.payload.authDomain||`${projectId}.firebaseapp.com`),
  projectId,
  storageBucket:String(sdk.payload.storageBucket||`${projectId}.firebasestorage.app`),
  messagingSenderId:String(sdk.payload.messagingSenderId||''),
  appId:String(sdk.payload.appId),
  measurementId:sdk.payload.measurementId?String(sdk.payload.measurementId):null,
};
const replacement=`const firebaseConfig = {\n    apiKey: ${JSON.stringify(cfg.apiKey)},\n    authDomain: ${JSON.stringify(cfg.authDomain)},\n    projectId: ${JSON.stringify(cfg.projectId)},\n    storageBucket: ${JSON.stringify(cfg.storageBucket)},\n    messagingSenderId: ${JSON.stringify(cfg.messagingSenderId)},\n    appId: ${JSON.stringify(cfg.appId)},\n    measurementId: ${cfg.measurementId?JSON.stringify(cfg.measurementId):'null'},\n  };`;
const before=text;
text=text.replace(/const firebaseConfig = \{[\s\S]*?\n  \};/,replacement);
if(text===before||!text.includes(`projectId: ${JSON.stringify(projectId)}`)) stop('firebase_config_injection_failed');
text=text.replace('defaultProjectId: null',"defaultProjectId: 'cinepolis'")
  .replace(/configSource: '[^']*'/,"configSource: 'runtime-existing-hosting-dev-corte6'")
  .replace('sandboxOnly: true','sandboxOnly: false')
  .replace('projectIdentityVerified: false','projectIdentityVerified: true');
fs.writeFileSync(backendConfigFile,text,'utf8');

const authLocal=path.join(siteDir,'core','backend-dev-auth.local.js');
fs.writeFileSync(authLocal,'/* Hosting DEV Corte 6: no credentials embedded; interactive Firebase Auth only. */\n','utf8');
const sourceCommit=process.env.GITHUB_SHA||'';
const proof={schemaVersion:'cxorbia.corte6-existing-hosting-proof.v1',generatedAt:new Date().toISOString(),authorizationRequestId:request.requestId,environment:'DEV',firebaseProjectId:projectId,hostingSite:'cxorbia-backend-dev',hostingTarget:'cxorbia-dev',sourceCommit,entrypoint:'index-backend-dev.html',tenantId:'tya',canonicalProjectId:'cinepolis',authMode:'firebase-email-password-interactive-session',readOnly:true,writeMode:'disabled',expected:{periods:14,visits:616,certifications:77,liquidationControls:572,payments:0},authReadiness:{operator:readiness.operatorLoginReady,client:readiness.clientLoginReady,shopper:readiness.shopperLoginReady},firestoreDataWrites:false,authWrites:false,storageWrites:false,rulesDeploy:false,functionsDeploy:false,hrWrites:false,legacyWrites:false,payments:false,merge:false,production:false,credentialsEmbedded:false};
fs.writeFileSync(path.join(siteDir,'corte6-hosting-proof.json'),JSON.stringify(proof,null,2)+'\n','utf8');

const firebaseHosting={hosting:{target:'cxorbia-dev',public:siteDir.replaceAll('\\','/'),ignore:['**/.*','**/node_modules/**'],rewrites:[{source:'**',destination:'/index-backend-dev.html'}],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-store'}]},{source:'**/*.html',headers:[{key:'Content-Type',value:'text/html; charset=utf-8'}]},{source:'**/*.js',headers:[{key:'Content-Type',value:'application/javascript; charset=utf-8'}]},{source:'**/*.css',headers:[{key:'Content-Type',value:'text/css; charset=utf-8'}]},{source:'**/*.json',headers:[{key:'Content-Type',value:'application/json; charset=utf-8'}]}]}};
fs.writeFileSync(firebaseConfigPath,JSON.stringify(firebaseHosting,null,2)+'\n','utf8');

const siteScan=fs.readFileSync(backendConfigFile,'utf8')+fs.readFileSync(path.join(siteDir,'index-backend-dev.html'),'utf8')+fs.readFileSync(path.join(siteDir,'core','backend-browser-auth.js'),'utf8');
if(/private_key|BEGIN PRIVATE KEY|service_account/i.test(siteScan)) stop('credential_material_detected');
if(!siteScan.includes('signInWithEmailAndPassword')) stop('interactive_auth_missing');

const report={schemaVersion:'cxorbia.corte6-existing-hosting-dev-preflight.v1',generatedAt:new Date().toISOString(),decision:'PASS_READY_FOR_SINGLE_EXISTING_HOSTING_DEPLOY',authorizationRequestId:request.requestId,target:{projectId,hostingTarget:'cxorbia-dev',hostingSite:'cxorbia-backend-dev',existingSiteVerified:true,newProject:false,newHosting:false},source:{branch:process.env.GITHUB_REF_NAME||'',commit:sourceCommit},provider:{firebaseVerified:true,webAppVerified:true,hostingSiteVerified:true},build:{siteDir:siteDir.replace(root,'<repo>'),firebaseConfigPath:firebaseConfigPath.replace(root,'<repo>'),entrypoint:'index-backend-dev.html',firebaseConfigInjected:true,interactiveAuth:true,credentialsEmbedded:false},readiness:{operatorLoginReady:readiness.operatorLoginReady,clientLoginReady:readiness.clientLoginReady,shopperLoginReady:readiness.shopperLoginReady},safety:{hostingDeployMax:1,firestoreDataWrites:0,authWrites:0,storageWrites:0,rulesDeploys:0,functionsDeploys:0,hrWrites:0,legacyWrites:0,payments:0,merge:false,production:false}};
fs.writeFileSync(preflightPath,JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
