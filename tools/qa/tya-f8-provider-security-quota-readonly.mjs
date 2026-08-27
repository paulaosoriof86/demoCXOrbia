#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const REGION=String(process.env.CXORBIA_CLOUD_RUN_REGION||'us-central1');
const SERVICE=String(process.env.CXORBIA_CLOUD_RUN_SERVICE||'cxorbia-live-hr-dev');
const AUTH=String(process.env.CXORBIA_F8_PROVIDER_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_PROVIDER_SECURITY_OUT||'.tmp/f8-provider-security-quota/report.json');
const ONE_SHOT_COMMIT='execute(f8): temporary secretmanager viewer grant-readback-revoke';
const ONE_SHOT_AUTH='PAULA-F8-TEMP-SECRET-METADATA-VIEWER-20260827-01';
const VIEWER_ROLE='roles/secretmanager.viewer';
const RAW_CANDIDATES=[
  ['existing_dev',String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'')],
  ['dedicated_project_creator',String(process.env.CXORBIA_GCP_PROJECT_CREATOR_JSON||'')],
  ['alternate_project_creator',String(process.env.GOOGLE_CLOUD_PROJECT_CREATOR_JSON||'')]
];
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};
const currentCommitMessage=()=>{try{return execFileSync('git',['log','-1','--pretty=%B'],{encoding:'utf8'}).trim();}catch{return '';}};

async function candidates(){
  const {default:admin}=await import('firebase-admin');
  const out=[];
  for(const [route,raw] of RAW_CANDIDATES){
    if(!raw){out.push({route,present:false,shapeValid:false});continue;}
    let sa=null;try{sa=JSON.parse(raw);}catch{}
    const shapeValid=Boolean(sa&&sa.type==='service_account'&&sa.project_id&&sa.client_email&&sa.private_key);
    if(!shapeValid){out.push({route,present:true,shapeValid:false});continue;}
    try{
      const cred=admin.credential.cert(sa);
      const result=await cred.getAccessToken();
      if(!result?.access_token)throw new Error('token_missing');
      out.push({route,present:true,shapeValid:true,accessToken:result.access_token,serviceAccountEmail:String(sa.client_email),serviceAccountFingerprint:hash(sa.client_email).slice(0,20),credentialProjectMatchesTarget:String(sa.project_id)===PROJECT});
    }catch(error){out.push({route,present:true,shapeValid:true,tokenReady:false,error:String(error?.message||error).slice(0,180)});}
  }
  return out;
}

async function rawApi(accessToken,url,{method='GET',body=null}={}){
  const res=await fetch(url,{method,headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body)});
  const text=await res.text();
  let json=null;try{json=text?JSON.parse(text):{};}catch{json={unparsed:true};}
  if(!res.ok){const message=json?.error?.message||`HTTP_${res.status}`;return {ok:false,status:res.status,error:String(message).slice(0,220)};}
  return {ok:true,status:res.status,json};
}

async function firstSuccess(creds,url,opts={}){
  const attempts=[];
  for(const c of creds.filter(x=>x.accessToken)){
    const r=await rawApi(c.accessToken,url,opts);
    attempts.push({route:c.route,ok:r.ok,status:r.status,error:r.ok?undefined:r.error});
    if(r.ok)return {ok:true,route:c.route,serviceAccountFingerprint:c.serviceAccountFingerprint,credentialProjectMatchesTarget:c.credentialProjectMatchesTarget,json:r.json,attempts};
  }
  return {ok:false,attempts};
}

function summarizeIam(policy){
  const bindings=Array.isArray(policy?.bindings)?policy.bindings:[];
  const publicRoles=[];let memberCount=0;
  for(const b of bindings){const members=Array.isArray(b.members)?b.members:[];memberCount+=members.length;if(members.includes('allUsers')||members.includes('allAuthenticatedUsers'))publicRoles.push(String(b.role||''));}
  return {bindingCount:bindings.length,memberCount,publicBindingCount:publicRoles.length,publicRoles:publicRoles.sort(),etagPresent:Boolean(policy?.etag)};
}
function summarizeRun(service){
  const containers=Array.isArray(service?.template?.containers)?service.template.containers:[];
  let envCount=0,secretBackedEnvCount=0;
  const plaintextSensitiveEnvNames=[],derivedSecurityMetadataEnvNames=[];
  const sensitive=/(^|_)(PASS|PASSWORD|SECRET|TOKEN|KEY|APIKEY|API_KEY|CREDENTIAL|CREDENTIALS|PRIVATE|PRIVATE_KEY|SERVICE_ACCOUNT)(_|$)/i;
  const derivedMetadata=/(_SHA(?:256|384|512)?|_HASH|_FINGERPRINT|_EXPIRES_AT|_EXPIRY|_EXPIRATION|_EXPIRES)$/i;
  for(const c of containers){for(const e of (Array.isArray(c?.env)?c.env:[])){
    const name=String(e?.name||'');envCount++;
    if(e?.valueSource?.secretKeyRef)secretBackedEnvCount++;
    if(!Object.prototype.hasOwnProperty.call(e||{},'value')||!sensitive.test(name))continue;
    if(derivedMetadata.test(name))derivedSecurityMetadataEnvNames.push(name);else plaintextSensitiveEnvNames.push(name);
  }}
  return {name:String(service?.name||''),latestReadyRevision:String(service?.latestReadyRevision||service?.traffic?.[0]?.revision||''),serviceAccountSet:Boolean(service?.template?.serviceAccount),containerCount:containers.length,envCount,secretBackedEnvCount,plaintextSensitiveKeyCount:plaintextSensitiveEnvNames.length,plaintextSensitiveEnvNames:[...new Set(plaintextSensitiveEnvNames)].sort(),derivedSecurityMetadataKeyCount:derivedSecurityMetadataEnvNames.length,derivedSecurityMetadataEnvNames:[...new Set(derivedSecurityMetadataEnvNames)].sort(),envValuesPersisted:false,ingress:String(service?.ingress||''),observedGeneration:String(service?.observedGeneration||'')};
}
function summarizeSecretArray(secrets){
  let automatic=0,userManaged=0,rotationConfigured=0;
  for(const s of secrets){if(s?.replication?.automatic)automatic++;if(s?.replication?.userManaged)userManaged++;if(s?.rotation?.rotationPeriod||s?.rotation?.nextRotationTime)rotationConfigured++;}
  return {secretCount:secrets.length,automaticReplicationCount:automatic,userManagedReplicationCount:userManaged,rotationConfiguredCount:rotationConfigured,secretValuesRead:false,namesPersisted:false};
}
function summarizeQuota(serviceName,x){
  const metrics=Array.isArray(x?.metrics)?x.metrics:[];let limitCount=0,overrideCount=0,adminOverrideCount=0;
  for(const m of metrics){for(const l of (Array.isArray(m?.consumerQuotaLimits)?m.consumerQuotaLimits:[])){limitCount++;for(const b of (Array.isArray(l?.quotaBuckets)?l.quotaBuckets:[])){if(b?.consumerOverride)overrideCount++;if(b?.adminOverride)adminOverrideCount++;}}}
  return {service:serviceName,metricCount:metrics.length,limitCount,consumerOverrideCount:overrideCount,adminOverrideCount};
}
const sanitizedCreds=creds=>creds.map(c=>({route:c.route,present:c.present,shapeValid:c.shapeValid,tokenReady:Boolean(c.accessToken),credentialProjectMatchesTarget:c.credentialProjectMatchesTarget??null,error:c.error||null}));
const hasViewerMember=(policy,member)=>Array.isArray(policy?.bindings)&&policy.bindings.some(b=>String(b?.role||'')===VIEWER_ROLE&&Array.isArray(b?.members)&&b.members.includes(member));

async function getProjectPolicy(token){return rawApi(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}:getIamPolicy`,{method:'POST',body:{options:{requestedPolicyVersion:3}}});}
async function setProjectPolicy(token,policy){return rawApi(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}:setIamPolicy`,{method:'POST',body:{policy}});}
async function testSetIam(token){return rawApi(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}:testIamPermissions`,{method:'POST',body:{permissions:['resourcemanager.projects.setIamPolicy']}});}
async function listSecretMetadata(token){
  const secrets=[];let pageToken='';let pages=0;
  do{
    ensure(pages<20,'F8_SECRET_METADATA_PAGINATION_BOUND_EXCEEDED');
    const suffix=pageToken?`&pageToken=${encodeURIComponent(pageToken)}`:'';
    const r=await rawApi(token,`https://secretmanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}/secrets?pageSize=100${suffix}`);
    if(!r.ok)return {ok:false,status:r.status,error:r.error,pages};
    if(Array.isArray(r.json?.secrets))secrets.push(...r.json.secrets);
    pageToken=String(r.json?.nextPageToken||'');pages++;
  }while(pageToken);
  return {ok:true,pages,summary:summarizeSecretArray(secrets)};
}

async function oneShotGrantReadRevoke(dev){
  const result={mode:'TEMP_VIEWER_GRANT_READBACK_REVOKE_SINGLE_USE',authorizationId:ONE_SHOT_AUTH,principalFingerprint:dev.serviceAccountFingerprint,grantAttempted:false,grantConfirmed:false,metadataReadback:'NOT_ATTEMPTED',metadataSummary:null,revokeAttempted:false,revokeConfirmed:false,finalBindingPresent:null,providerWrites:0,secretValuesRead:false,secretValuesExported:false,secretPayloadEndpointCalled:false,error:null};
  const token=dev.accessToken;const member=`serviceAccount:${dev.serviceAccountEmail}`;let grantApplied=false;
  try{
    ensure(PROJECT==='cxorbia-backend-dev','F8_ONE_SHOT_TARGET_PROJECT_MISMATCH');
    ensure(dev.route==='existing_dev'&&dev.credentialProjectMatchesTarget===true,'F8_ONE_SHOT_EXISTING_DEV_ROUTE_REQUIRED');
    const capability=await testSetIam(token);
    ensure(capability.ok&&Array.isArray(capability.json?.permissions)&&capability.json.permissions.includes('resourcemanager.projects.setIamPolicy'),'F8_ONE_SHOT_SET_IAM_CAPABILITY_UNAVAILABLE');
    const before=await getProjectPolicy(token);ensure(before.ok,'F8_ONE_SHOT_GET_IAM_BEFORE_FAILED');
    ensure(!hasViewerMember(before.json,member),'F8_ONE_SHOT_VIEWER_ROLE_ALREADY_PRESENT');
    const policy=JSON.parse(JSON.stringify(before.json||{}));policy.bindings=Array.isArray(policy.bindings)?policy.bindings:[];
    const unconditional=policy.bindings.filter(b=>String(b?.role||'')===VIEWER_ROLE&&!b?.condition);
    ensure(unconditional.length<=1,'F8_ONE_SHOT_AMBIGUOUS_UNCONDITIONAL_VIEWER_BINDINGS');
    if(unconditional.length===1){unconditional[0].members=Array.isArray(unconditional[0].members)?unconditional[0].members:[];unconditional[0].members=[...new Set([...unconditional[0].members,member])].sort();}
    else policy.bindings.push({role:VIEWER_ROLE,members:[member]});
    result.grantAttempted=true;
    const granted=await setProjectPolicy(token,policy);ensure(granted.ok,'F8_ONE_SHOT_GRANT_SET_IAM_FAILED');result.providerWrites++;grantApplied=true;
    const grantVerify=await getProjectPolicy(token);ensure(grantVerify.ok&&hasViewerMember(grantVerify.json,member),'F8_ONE_SHOT_GRANT_VERIFY_FAILED');result.grantConfirmed=true;
    let metadata=null;
    for(let i=0;i<8;i++){metadata=await listSecretMetadata(token);if(metadata.ok)break;await sleep(2000);}
    ensure(metadata?.ok,'F8_ONE_SHOT_SECRET_METADATA_READBACK_FAILED');
    result.metadataReadback='PASS';result.metadataSummary=metadata.summary;result.metadataPages=metadata.pages;
  }catch(error){result.error=String(error?.message||error).slice(0,240);}
  finally{
    if(grantApplied){
      result.revokeAttempted=true;
      for(let i=0;i<5&&!result.revokeConfirmed;i++){
        const now=await getProjectPolicy(token);
        if(now.ok){
          if(!hasViewerMember(now.json,member)){result.revokeConfirmed=true;result.finalBindingPresent=false;break;}
          const policy=JSON.parse(JSON.stringify(now.json||{}));
          policy.bindings=(Array.isArray(policy.bindings)?policy.bindings:[]).map(b=>{
            if(String(b?.role||'')!==VIEWER_ROLE||!Array.isArray(b?.members))return b;
            return {...b,members:b.members.filter(m=>m!==member)};
          }).filter(b=>!(String(b?.role||'')===VIEWER_ROLE&&Array.isArray(b?.members)&&b.members.length===0));
          const revoked=await setProjectPolicy(token,policy);
          if(revoked.ok){result.providerWrites++;const verify=await getProjectPolicy(token);if(verify.ok&&!hasViewerMember(verify.json,member)){result.revokeConfirmed=true;result.finalBindingPresent=false;break;}}
        }
        await sleep(1500);
      }
      if(!result.revokeConfirmed){result.finalBindingPresent=true;result.error=result.error||'F8_ONE_SHOT_EMERGENCY_REVOKE_NOT_CONFIRMED';}
    }else{result.revokeConfirmed=true;result.finalBindingPresent=false;}
  }
  return result;
}

async function main(){
  ensure(AUTH==='YES_PAULA_F8_PROVIDER_SECURITY_QUOTA_READONLY','F8_PROVIDER_READONLY_EXPLICIT_GATE_REQUIRED');
  const commitMessage=currentCommitMessage();const oneShot=commitMessage===ONE_SHOT_COMMIT;
  const creds=await candidates();ensure(creds.some(c=>c.accessToken),'F8_PROVIDER_NO_USABLE_CREDENTIAL_ROUTE');
  const dev=creds.find(c=>c.route==='existing_dev'&&c.accessToken);
  let temporaryIam=null;let secretSummary=null;
  if(oneShot){ensure(dev,'F8_ONE_SHOT_EXISTING_DEV_CREDENTIAL_REQUIRED');temporaryIam=await oneShotGrantReadRevoke(dev);if(temporaryIam.metadataReadback==='PASS')secretSummary=temporaryIam.metadataSummary;}
  const projectRead=await firstSuccess(creds,`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}`);ensure(projectRead.ok,'F8_PROVIDER_PROJECT_READ_UNAVAILABLE_ALL_ROUTES');
  const projectNumber=String(projectRead.json?.projectNumber||'');ensure(projectNumber,'F8_PROJECT_NUMBER_MISSING');
  const runName=`projects/${PROJECT}/locations/${REGION}/services/${SERVICE}`;
  const runRead=await firstSuccess(creds,`https://run.googleapis.com/v2/${runName}`);
  const iamRead=await firstSuccess(creds,`https://run.googleapis.com/v2/${runName}:getIamPolicy`);
  let secretRead=null;
  if(!oneShot){secretRead=await firstSuccess(creds,`https://secretmanager.googleapis.com/v1/projects/${PROJECT}/secrets?pageSize=100`);if(secretRead.ok)secretSummary=summarizeSecretArray(Array.isArray(secretRead.json?.secrets)?secretRead.json.secrets:[]);}
  const quotaServices=['run.googleapis.com','secretmanager.googleapis.com','firestore.googleapis.com','identitytoolkit.googleapis.com'];
  const quotaReadbacks=[];const serviceUsage=[];
  for(const svc of quotaServices){
    const q=await firstSuccess(creds,`https://serviceusage.googleapis.com/v1beta1/projects/${projectNumber}/services/${encodeURIComponent(svc)}/consumerQuotaMetrics?view=FULL&pageSize=200`);
    quotaReadbacks.push(q.ok?{...summarizeQuota(svc,q.json),readback:'PASS',route:q.route}:{service:svc,readback:'HOLD',attempts:q.attempts});
    const s=await firstSuccess(creds,`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/${encodeURIComponent(svc)}`);
    serviceUsage.push(s.ok?{service:svc,state:String(s.json?.state||'UNKNOWN'),route:s.route}:{service:svc,state:'HOLD',attempts:s.attempts});
  }
  const run=runRead.ok?summarizeRun(runRead.json):null;const iam=iamRead.ok?summarizeIam(iamRead.json):null;const hardFindings=[];
  if(!runRead.ok)hardFindings.push('cloud_run_service_read_unavailable');
  if(!iamRead.ok)hardFindings.push('cloud_run_iam_read_unavailable');
  if(oneShot){
    if(!temporaryIam?.grantConfirmed)hardFindings.push('temporary_secretmanager_viewer_grant_not_confirmed');
    if(temporaryIam?.metadataReadback!=='PASS')hardFindings.push('secret_manager_metadata_read_unavailable');
    if(!temporaryIam?.revokeConfirmed||temporaryIam?.finalBindingPresent!==false)hardFindings.push('temporary_secretmanager_viewer_revoke_not_confirmed');
  }else if(!secretRead?.ok)hardFindings.push('secret_manager_metadata_read_unavailable');
  if(run&&run.name!==runName)hardFindings.push('cloud_run_target_mismatch');
  if(run&&!run.serviceAccountSet)hardFindings.push('cloud_run_runtime_service_account_missing');
  if(run&&run.plaintextSensitiveKeyCount>0)hardFindings.push('cloud_run_plaintext_sensitive_env_key_detected');
  if(quotaReadbacks.some(x=>x.readback!=='PASS'))hardFindings.push('quota_readback_partial');
  if(serviceUsage.some(x=>x.state==='HOLD'))hardFindings.push('service_usage_readback_partial');
  const decision=hardFindings.length?'HOLD_F8_PROVIDER_SECURITY_QUOTA_READONLY':'PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY';
  const safety={providerReads:true,providerWrites:temporaryIam?.providerWrites||0,dataWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,secretValuesRead:false,secretValuesExported:false,secretPayloadEndpointCalled:false,credentialsExposed:false,tokensExposed:false};
  const report={schemaVersion:'cxorbia.f8-provider-security-quota-readonly.v3.0',generatedAt:new Date().toISOString(),decision,mode:oneShot?'TEMP_VIEWER_GRANT_READBACK_REVOKE_SINGLE_USE':'READ_ONLY',authorizationId:oneShot?ONE_SHOT_AUTH:null,projectId:PROJECT,projectNumberFingerprint:hash(projectNumber).slice(0,20),credentialRoutes:sanitizedCreds(creds),readRoutes:{project:projectRead.route||null,cloudRun:runRead.route||null,cloudRunIam:iamRead.route||null,secrets:oneShot?'temporary_viewer_one_shot':(secretRead?.route||null)},cloudRun:run,cloudRunIam:iam,secrets:secretSummary,temporaryIam,serviceUsage,quotaReadbacks,hardFindings,interpretation:decision==='PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY'?(oneShot?'Temporary metadata-view IAM grant, Secret Manager metadata readback and immediate revocation completed; no secret payload endpoint was called.':'Fresh provider-side IAM, Secret Manager metadata and quota/service-usage readbacks completed without provider mutation.'):'At least one required provider security control remains unresolved; any successful temporary viewer grant was subject to immediate revocation in the same single-use operation.',safety,next:decision==='PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY'?'F8_BOUNDED_LOAD_QUOTA_FAILURE_INJECTION_READONLY':'F8_PROVIDER_SECURITY_FINDING_CLASSIFICATION'};
  write(report);console.log(JSON.stringify(report,null,2));if(decision!=='PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY')process.exitCode=1;
}

main().catch(error=>{const report={schemaVersion:'cxorbia.f8-provider-security-quota-readonly.v3.0',generatedAt:new Date().toISOString(),decision:'HOLD_F8_PROVIDER_SECURITY_QUOTA_READONLY',error:String(error?.message||error).slice(0,400),safety:{providerReads:true,providerWrites:0,dataWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,secretValuesRead:false,secretValuesExported:false,secretPayloadEndpointCalled:false,credentialsExposed:false,tokensExposed:false}};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;});
