#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const project='cxorbia-backend-dev';
const hostingSite='cxorbia-backend-dev';
const cloudRunService='cxorbia-live-hr-dev';
const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';
if(!raw) throw new Error('service_account_secret_missing');
const sa=JSON.parse(raw);
if(sa.type!=='service_account'||sa.project_id!==project) throw new Error('wrong_service_account');

const b64=v=>Buffer.from(v).toString('base64url');
const hash=v=>v?crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,16):null;
const basename=v=>String(v||'').split('/').filter(Boolean).at(-1)||null;
const validTime=v=>{const n=Date.parse(String(v||''));return Number.isFinite(n)?n:null;};
const normalizeSa=v=>String(v||'').replace(/^projects\/[^/]+\/serviceAccounts\//,'')||null;
const sanitizeRepo=x=>({name:x?.name||null,format:x?.format||null,mode:x?.mode||null,location:String(x?.name||'').split('/locations/')[1]?.split('/')[0]||null});
const sanitizeBuild=b=>({
  id:b?.id||null,
  status:b?.status||null,
  createTime:b?.createTime||null,
  finishTime:b?.finishTime||null,
  serviceAccountHash:hash(normalizeSa(b?.serviceAccount)),
  imageNames:[...(b?.results?.images||[]).map(x=>x?.name).filter(Boolean),...(b?.images||[]).filter(Boolean)].slice(0,10),
  imageDigests:(b?.results?.images||[]).map(x=>x?.digest).filter(Boolean).slice(0,10)
});

async function json(url,options={}){
  try{
    const r=await fetch(url,options);
    let body=null; try{body=await r.json();}catch{}
    return {status:r.status,ok:r.ok,body};
  }catch(error){return {status:0,ok:false,body:{error:{message:String(error?.message||error)}}};}
}
async function safePost(url){
  try{
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',redirect:'manual'});
    let body=null; try{body=await r.json();}catch{}
    return {status:r.status,ok:r.ok,error:typeof body?.error==='string'?body.error:null};
  }catch{return {status:0,ok:false,error:'NETWORK_READ_FAILED'};}
}

const now=Math.floor(Date.now()/1000);
const scopes=['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/spreadsheets.readonly','https://www.googleapis.com/auth/drive.metadata.readonly'].join(' ');
const unsigned=`${b64(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64(JSON.stringify({iss:sa.client_email,scope:scopes,aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+1800}))}`;
const signer=crypto.createSign('RSA-SHA256'); signer.update(unsigned); signer.end();
const assertion=`${unsigned}.${signer.sign(sa.private_key).toString('base64url')}`;
const tokenResp=await json('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
if(!tokenResp.ok||!tokenResp.body?.access_token) throw new Error(`oauth_failed:${tokenResp.status}:${JSON.stringify(tokenResp.body).slice(0,300)}`);
const token=tokenResp.body.access_token;
const h={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
const hQuota={...h,'x-goog-user-project':project};

const crm=await json(`https://cloudresourcemanager.googleapis.com/v1/projects/${project}`,{headers:h});
const projectNumber=String(crm.body?.projectNumber||'');
if(!projectNumber) throw new Error(`project_number_unavailable:${crm.status}`);

async function testPerm(permission){
  const r=await json(`https://cloudresourcemanager.googleapis.com/v1/projects/${project}:testIamPermissions`,{method:'POST',headers:h,body:JSON.stringify({permissions:[permission]})});
  return {permission,httpStatus:r.status,validProbe:r.status!==400,granted:Boolean(r.ok&&(r.body?.permissions||[]).includes(permission)),errorStatus:r.body?.error?.status||null};
}
const permissionList=[
  'serviceusage.services.get','serviceusage.services.enable',
  'run.services.get','run.services.update','iam.serviceAccounts.actAs',
  'cloudbuild.builds.create','cloudbuild.builds.get','cloudbuild.builds.list',
  'resourcemanager.projects.getIamPolicy','policytroubleshooter.iam.troubleshoot',
  'artifactregistry.repositories.get','artifactregistry.repositories.list','artifactregistry.repositories.uploadArtifacts',
  'apikeys.keys.get','apikeys.keys.list','apikeys.keys.lookup',
  'firebasehosting.sites.get','firebasehosting.sites.list','firebasehosting.sites.update'
];
const permissionProbes=[];
for(const permission of permissionList) permissionProbes.push(await testPerm(permission));
const granted=new Set(permissionProbes.filter(x=>x.granted).map(x=>x.permission));
const invalidPermissionProbes=permissionProbes.filter(x=>!x.validProbe).map(x=>x.permission);

const iamPolicy=await json(`https://cloudresourcemanager.googleapis.com/v1/projects/${project}:getIamPolicy`,{method:'POST',headers:h,body:'{}'});
function rolesFor(member){
  if(!member||!iamPolicy.ok) return [];
  const needle=`serviceAccount:${member}`.toLowerCase(),out=[];
  for(const b of iamPolicy.body?.bindings||[]) if((b.members||[]).some(m=>String(m).toLowerCase()===needle)) out.push(String(b.role||''));
  return out.sort();
}
const callerRoles=rolesFor(sa.client_email);

const cbDefault=await json(`https://cloudbuild.googleapis.com/v1/projects/${project}/locations/global/defaultServiceAccount`,{headers:h});
const buildSa=normalizeSa(cbDefault.body?.serviceAccountEmail||cbDefault.body?.serviceAccount);
const buildSaRoles=rolesFor(buildSa);
const buildIdentityKind=!buildSa?'UNKNOWN':buildSa===`${projectNumber}-compute@developer.gserviceaccount.com`?'COMPUTE_DEFAULT':buildSa===`${projectNumber}@cloudbuild.gserviceaccount.com`?'LEGACY_CLOUDBUILD':'OTHER';

const buildsGlobal=await json(`https://cloudbuild.googleapis.com/v1/projects/${project}/locations/global/builds?pageSize=100`,{headers:h});
const buildsLegacy=buildsGlobal.ok?null:await json(`https://cloudbuild.googleapis.com/v1/projects/${project}/builds?pageSize=100`,{headers:h});
const buildsResponse=buildsGlobal.ok?buildsGlobal:buildsLegacy;
const recentBuilds=Array.isArray(buildsResponse?.body?.builds)?buildsResponse.body.builds:[];
const targetImagePrefix=`gcr.io/${project}/${cloudRunService}`;
const targetSuccessfulBuilds=recentBuilds.filter(b=>{
  if(b?.status!=='SUCCESS') return false;
  const names=[...(b?.results?.images||[]).map(x=>x?.name).filter(Boolean),...(b?.images||[]).filter(Boolean)];
  return names.some(n=>String(n).startsWith(targetImagePrefix));
});
const exactIdentitySuccessfulBuilds=targetSuccessfulBuilds.filter(b=>{
  const actual=normalizeSa(b?.serviceAccount);
  return actual&&buildSa&&actual===buildSa;
});
const latestTargetBuild=(exactIdentitySuccessfulBuilds[0]||targetSuccessfulBuilds[0]||null);
const historicalArtifactPushProof=Boolean(latestTargetBuild);
const historicalArtifactPushExactIdentityProof=Boolean(exactIdentitySuccessfulBuilds.length);

const arUs=await json(`https://artifactregistry.googleapis.com/v1/projects/${project}/locations/us/repositories?pageSize=100`,{headers:h});
const arCentral=await json(`https://artifactregistry.googleapis.com/v1/projects/${project}/locations/us-central1/repositories?pageSize=100`,{headers:h});
const repos=[...(arUs.body?.repositories||[]),...(arCentral.body?.repositories||[])].map(sanitizeRepo);
const gcrBackedRepoObserved=repos.some(r=>/\/repositories\/gcr\.io$/i.test(String(r.name||'')));

let policyTroubleshooter={httpStatus:0,overallAccessState:null,permission:'artifactregistry.repositories.uploadArtifacts',resource:`//artifactregistry.googleapis.com/projects/${project}/locations/us/repositories/gcr.io`,principalHash:hash(buildSa),available:false};
if(buildSa){
  const pt=await json('https://policytroubleshooter.googleapis.com/v3/iam:troubleshoot',{method:'POST',headers:hQuota,body:JSON.stringify({accessTuple:{principal:buildSa,fullResourceName:policyTroubleshooter.resource,permission:policyTroubleshooter.permission}})});
  policyTroubleshooter={...policyTroubleshooter,httpStatus:pt.status,overallAccessState:pt.body?.overallAccessState||null,available:pt.ok,errorStatus:pt.body?.error?.status||null};
}
const policyTroubleshooterArtifactPushGranted=policyTroubleshooter.overallAccessState==='GRANTED';
const artifactPushReady=Boolean(policyTroubleshooterArtifactPushGranted||historicalArtifactPushExactIdentityProof||historicalArtifactPushProof);
const artifactPushAssessment=policyTroubleshooterArtifactPushGranted?'PROVEN_BY_POLICY_TROUBLESHOOTER':historicalArtifactPushExactIdentityProof?'PROVEN_BY_SUCCESSFUL_BUILD_SAME_EXECUTION_IDENTITY':historicalArtifactPushProof?'PROVEN_BY_SUCCESSFUL_TARGET_IMAGE_BUILD':'NOT_PROVEN_READONLY';

const apiKeysList=await json(`https://apikeys.googleapis.com/v2/projects/${projectNumber}/locations/global/keys?pageSize=1`,{headers:h});
const firebaseCliApiKeyReady=apiKeysList.ok;
const hostingReleases=await json(`https://firebasehosting.googleapis.com/v1beta1/sites/${hostingSite}/releases?pageSize=10`,{headers:h});
const releases=Array.isArray(hostingReleases.body?.releases)?hostingReleases.body.releases:[];
const latestRelease=releases[0]||null;
const latestReleaseTime=latestRelease?.releaseTime||null;
const latestReleaseName=latestRelease?.name||null;
const latestVersionName=latestRelease?.version?.name||null;
const latestVersion=latestVersionName?await json(`https://firebasehosting.googleapis.com/v1beta1/${latestVersionName}`,{headers:h}):{status:0,ok:false,body:null};
const callerHash=hash(sa.client_email);
const recentReleaseSameCaller=releases.some(r=>hash(r?.releaseUser?.email)===callerHash);
const latestVersionSameCaller=Boolean(latestVersion.ok&&(hash(latestVersion.body?.createUser?.email)===callerHash||hash(latestVersion.body?.finalizeUser?.email)===callerHash));
const historicalHostingSameCallerWriteProof=recentReleaseSameCaller||latestVersionSameCaller;
const hostingSiteGetReady=granted.has('firebasehosting.sites.get');
const hostingSiteUpdateReady=granted.has('firebasehosting.sites.update');
const hostingRestReadReady=hostingReleases.ok&&latestVersion.ok;
const hostingRestDeployReady=Boolean(hostingSiteGetReady&&hostingSiteUpdateReady&&hostingRestReadReady);
const hostingRestReadinessBasis=hostingRestDeployReady?(historicalHostingSameCallerWriteProof?'CURRENT_SITES_UPDATE_PLUS_READBACK_PLUS_SAME_CALLER_HISTORY':'CURRENT_SITES_UPDATE_PLUS_READBACK'):'NOT_READY_OR_NOT_PROVEN';
const firebaseCliDeployReady=Boolean(firebaseCliApiKeyReady&&hostingRestDeployReady);

const serviceName=`projects/${projectNumber}/services/sheets.googleapis.com`;
const sheetsService=await json(`https://serviceusage.googleapis.com/v1/${serviceName}`,{headers:h});
const sheetId='1h307t37LxM1nZNh_9Odt6wHUQhROG6cYbsbMKr48vU4';
const sheetsDoc=await json(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=false&fields=spreadsheetId,properties(title),sheets(properties(sheetId,title,index))`,{headers:h});
const drive=await json(`https://www.googleapis.com/drive/v3/files/${sheetId}?fields=id,name,mimeType&supportsAllDrives=true`,{headers:h});
const titles=(sheetsDoc.body?.sheets||[]).map(s=>s?.properties?.title).filter(Boolean);
const monthlyTitles=titles.filter(t=>!/^(DASHBOARD|DASHBOARD HN)$/i.test(t));
const apiEnabled=sheetsService.body?.state==='ENABLED';
const sheetAccessible=sheetsDoc.ok&&sheetsDoc.body?.spreadsheetId===sheetId;

const executeSha='0f2000b62844fe56f0167285ebaffe4208af03be';
const executeAt='2026-08-21T14:31:20Z';
const baselineRevision='cxorbia-live-hr-dev-00010-n78';
const commandPath='/api/tenants/tya/projects/cinepolis/g2b-synthetic/commands';
const cloudRun=await json(`https://run.googleapis.com/v2/projects/${project}/locations/us-central1/services/${cloudRunService}`,{headers:h});
const latestReadyRevision=basename(cloudRun.body?.latestReadyRevision);
const latestCreatedRevision=basename(cloudRun.body?.latestCreatedRevision);
const serviceUri=String(cloudRun.body?.uri||'').replace(/\/$/,'');
const cloudRunUpdateTime=cloudRun.body?.updateTime||null;
const directProbe=serviceUri?await safePost(serviceUri+commandPath):{status:0,ok:false,error:'CLOUD_RUN_URI_UNAVAILABLE'};
const hostingProbe=await safePost(`https://${hostingSite}.web.app${commandPath}`);
const executeMs=validTime(executeAt),releaseMs=validTime(latestReleaseTime),updateMs=validTime(cloudRunUpdateTime);
const cloudRunChanged=Boolean(cloudRun.ok&&latestReadyRevision&&latestReadyRevision!==baselineRevision);
const cloudRunChangedAfterExecute=Boolean(cloudRunChanged&&updateMs!==null&&executeMs!==null&&updateMs>=executeMs);
const directSourceLive=directProbe.status===401&&directProbe.error==='G2B_SYNTHETIC_AUTHORIZATION_REQUIRED';
const directSourcePresentGateClosed=directProbe.status===423&&directProbe.error==='G2B_SYNTHETIC_WRITE_GATE_DISABLED';
const hostingSourceLive=hostingProbe.status===401&&hostingProbe.error==='G2B_SYNTHETIC_AUTHORIZATION_REQUIRED';
const hostingSourcePresentGateClosed=hostingProbe.status===423&&hostingProbe.error==='G2B_SYNTHETIC_WRITE_GATE_DISABLED';
const hostingReleaseAfterExecute=Boolean(hostingReleases.ok&&releaseMs!==null&&executeMs!==null&&releaseMs>=executeMs);
const readsSufficient=cloudRun.ok&&hostingReleases.ok&&directProbe.status>0&&hostingProbe.status>0;
let classification='HOLD_PROVIDER_RECONCILIATION_INSUFFICIENT_READBACK';
if(readsSufficient){
  if(!cloudRunChanged&&!directSourceLive&&!directSourcePresentGateClosed&&!hostingReleaseAfterExecute) classification='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED';
  else if(cloudRunChanged&&cloudRunChangedAfterExecute&&directSourceLive&&hostingSourceLive&&hostingReleaseAfterExecute) classification='C_G2B_CLOUD_RUN_AND_HOSTING_DEPLOY_MATERIALIZED';
  else classification='B_G2B_PROVIDER_DEPLOY_PARTIAL_OR_NONTERMINAL';
}

const cloudBuildCallerReady=granted.has('cloudbuild.builds.create');
const cloudRunUpdateReady=granted.has('run.services.update')&&granted.has('iam.serviceAccounts.actAs');
const recoveryProviderLaneReady=Boolean(cloudBuildCallerReady&&buildSa&&artifactPushReady&&cloudRunUpdateReady&&hostingRestDeployReady&&classification==='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED');
const safety={providerReads:true,providerWrites:0,cloudBuildExecutions:0,hostingDeploys:0,cloudRunDeploys:0,firestoreWrites:0,authWrites:0,storageWrites:0,hrWrites:0,externalHrWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,merge:false,secretsExported:false};
const readiness={
  schemaVersion:'cxorbia.provider-forensic-readiness.v3.2',generatedAt:new Date().toISOString(),decision:recoveryProviderLaneReady?'FORENSIC_PROVIDER_LANE_READY':'FORENSIC_READONLY_COMPLETE_WITH_HOLDS',
  target:{projectId:project,projectNumber},
  caller:{serviceAccountEmailHash:callerHash,iamPolicyHttpStatus:iamPolicy.status,roles:callerRoles,permissionProbes,invalidPermissionProbes},
  cloudRun:{readable:cloudRun.ok,updateReady:cloudRunUpdateReady,latestReadyRevision,latestCreatedRevision,updateTime:cloudRunUpdateTime},
  cloudBuild:{callerCanCreate:cloudBuildCallerReady,buildsListHttpStatus:buildsResponse?.status||0,buildsInspected:recentBuilds.length,defaultServiceAccountLookupHttpStatus:cbDefault.status,executionIdentityKnown:Boolean(buildSa),executionIdentityKind:buildIdentityKind,executionServiceAccountHash:hash(buildSa),executionServiceAccountRoles:buildSaRoles,artifactRepositoriesReadHttpStatus:{us:arUs.status,usCentral1:arCentral.status},artifactRepositories:repos,gcrBackedRepoObserved,historicalArtifactPushProof,historicalArtifactPushExactIdentityProof,latestSuccessfulTargetBuild:latestTargetBuild?sanitizeBuild(latestTargetBuild):null,policyTroubleshooter,artifactPushReady,artifactPushAssessment},
  hosting:{releasesReadHttpStatus:hostingReleases.status,releasesInspected:releases.length,latestReleaseName,latestVersionName,latestReleaseTime,latestVersionReadHttpStatus:latestVersion.status,latestReleaseUserHash:hash(latestRelease?.releaseUser?.email),latestVersionCreateUserHash:hash(latestVersion.body?.createUser?.email),latestVersionFinalizeUserHash:hash(latestVersion.body?.finalizeUser?.email),historicalSameCallerWriteProof:historicalHostingSameCallerWriteProof,sitesGetReady:hostingSiteGetReady,sitesUpdateReady:hostingSiteUpdateReady,restReadReady:hostingRestReadReady,restDeployReady:hostingRestDeployReady,restReadinessBasis:hostingRestReadinessBasis,apiKeysListHttpStatus:apiKeysList.status,firebaseCliApiKeyReady,firebaseCliDeployReady},
  hr:{sheetsApiEnabled:apiEnabled,spreadsheetAccessible:sheetAccessible,driveMetadataAccessible:drive.ok,totalTabs:titles.length,monthlyTabs:monthlyTitles.length,latestMonthlyTab:monthlyTitles.at(-1)||null},
  g2b:{providerDecision:classification,directRouteHttpStatus:directProbe.status,directRouteError:directProbe.error||null,hostingRouteHttpStatus:hostingProbe.status,hostingRouteError:hostingProbe.error||null,providerStillBaseline:classification==='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED'},
  gates:{firebaseCliDeployReady,hostingRestDeployReady,cloudBuildCallerReady,cloudBuildExecutionIdentityKnown:Boolean(buildSa),cloudBuildArtifactPushReady:artifactPushReady,cloudRunUpdateReady,g2bProviderStillBaseline:classification==='A_NO_G2B_PROVIDER_DEPLOY_OBSERVED',recoveryProviderLaneReady},
  safety
};
fs.mkdirSync('app/docs/evidence',{recursive:true});
fs.writeFileSync('app/docs/evidence/I5-G2B-PROVIDER-FORENSIC-READINESS-LATEST.json',JSON.stringify(readiness,null,2)+'\n');
const cap={schemaVersion:'cxorbia.live-hr-provider-capability-preflight.v3.2',generatedAt:readiness.generatedAt,decision:apiEnabled&&sheetAccessible?'PASS_SHEETS_API_AND_CANONICAL_HR_READER':'HOLD_PROVIDER_CAPABILITY_OR_HR_READER',target:{projectId:project,projectNumber},googleSheetsApi:{httpStatus:sheetsService.status,state:sheetsService.body?.state||null,enabled:apiEnabled},spreadsheetAccess:{httpStatus:sheetsDoc.status,accessible:sheetAccessible,title:sheetsDoc.body?.properties?.title||null,totalTabs:titles.length,monthlyTabs:monthlyTitles.length,latestMonthlyTab:monthlyTitles.at(-1)||null},driveMetadataAccess:{httpStatus:drive.status,accessible:drive.ok&&drive.body?.id===sheetId},iam:{permissionProbes,invalidPermissionProbes,canUpdateCloudRun:cloudRunUpdateReady,canStartCloudBuild:cloudBuildCallerReady},forensicEvidence:'app/docs/evidence/I5-G2B-PROVIDER-FORENSIC-READINESS-LATEST.json',safety};
fs.writeFileSync('app/docs/evidence/LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json',JSON.stringify(cap,null,2)+'\n');
const g2b={schemaVersion:'cxorbia.g2b.provider-readonly-reconciliation.v2',generatedAt:readiness.generatedAt,decision:classification,execution:{sha:executeSha,requestedAt:executeAt,automaticRetryAllowed:false},baseline:{cloudRunRevision:baselineRevision},cloudRun:{httpStatus:cloudRun.status,readable:cloudRun.ok,latestReadyRevision,latestCreatedRevision,updateTime:cloudRunUpdateTime,changedFromBaseline:cloudRunChanged,changedAfterExecute:cloudRunChangedAfterExecute},directCloudRunProbe:{httpStatus:directProbe.status,error:directProbe.error||null,expectedUnauthenticatedStatus:401,sourceLive:directSourceLive,sourcePresentButGateClosed:directSourcePresentGateClosed},hosting:{httpStatus:hostingReleases.status,readable:hostingReleases.ok,latestReleaseName,latestVersionName,latestReleaseTime,releaseAfterExecute:hostingReleaseAfterExecute,releasesInspected:releases.length},hostingRouteProbe:{httpStatus:hostingProbe.status,error:hostingProbe.error||null,expectedUnauthenticatedStatus:401,sourceLive:hostingSourceLive,sourcePresentButGateClosed:hostingSourcePresentGateClosed},safety};
fs.writeFileSync('app/docs/evidence/I5-G2B-PROVIDER-READONLY-RECONCILIATION-LATEST.json',JSON.stringify(g2b,null,2)+'\n');
console.log(JSON.stringify({decision:readiness.decision,gates:readiness.gates,artifactPushAssessment,hostingRestReadinessBasis,safety}));
