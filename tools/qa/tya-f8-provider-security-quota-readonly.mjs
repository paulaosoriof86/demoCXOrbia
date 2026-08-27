#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const REGION=String(process.env.CXORBIA_CLOUD_RUN_REGION||'us-central1');
const SERVICE=String(process.env.CXORBIA_CLOUD_RUN_SERVICE||'cxorbia-live-hr-dev');
const AUTH=String(process.env.CXORBIA_F8_PROVIDER_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_PROVIDER_SECURITY_OUT||'.tmp/f8-provider-security-quota/report.json');
const RAW_CANDIDATES=[
  ['existing_dev',String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'')],
  ['dedicated_project_creator',String(process.env.CXORBIA_GCP_PROJECT_CREATOR_JSON||'')],
  ['alternate_project_creator',String(process.env.GOOGLE_CLOUD_PROJECT_CREATOR_JSON||'')]
];
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const safe={providerReads:true,providerWrites:0,dataWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,secretValuesRead:false,secretValuesExported:false,credentialsExposed:false,tokensExposed:false};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};

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
      out.push({route,present:true,shapeValid:true,accessToken:result.access_token,serviceAccountFingerprint:hash(sa.client_email).slice(0,20),credentialProjectMatchesTarget:String(sa.project_id)===PROJECT});
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
  const plaintextSensitiveEnvNames=[];
  const sensitive=/(^|_)(PASS|PASSWORD|SECRET|TOKEN|KEY|APIKEY|API_KEY|CREDENTIAL|CREDENTIALS|PRIVATE|PRIVATE_KEY|SERVICE_ACCOUNT)(_|$)/i;
  for(const c of containers){for(const e of (Array.isArray(c?.env)?c.env:[])){const name=String(e?.name||'');envCount++;if(e?.valueSource?.secretKeyRef)secretBackedEnvCount++;if(sensitive.test(name)&&Object.prototype.hasOwnProperty.call(e||{},'value'))plaintextSensitiveEnvNames.push(name);}}
  return {name:String(service?.name||''),latestReadyRevision:String(service?.latestReadyRevision||service?.traffic?.[0]?.revision||''),serviceAccountSet:Boolean(service?.template?.serviceAccount),containerCount:containers.length,envCount,secretBackedEnvCount,plaintextSensitiveKeyCount:plaintextSensitiveEnvNames.length,plaintextSensitiveEnvNames:[...new Set(plaintextSensitiveEnvNames)].sort(),envValuesPersisted:false,ingress:String(service?.ingress||''),observedGeneration:String(service?.observedGeneration||'')};
}
function summarizeSecrets(x){
  const secrets=Array.isArray(x?.secrets)?x.secrets:[];
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

async function main(){
  ensure(AUTH==='YES_PAULA_F8_PROVIDER_SECURITY_QUOTA_READONLY','F8_PROVIDER_READONLY_EXPLICIT_GATE_REQUIRED');
  const creds=await candidates();
  ensure(creds.some(c=>c.accessToken),'F8_PROVIDER_NO_USABLE_CREDENTIAL_ROUTE');
  const projectRead=await firstSuccess(creds,`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}`);
  ensure(projectRead.ok,'F8_PROVIDER_PROJECT_READ_UNAVAILABLE_ALL_ROUTES');
  const projectNumber=String(projectRead.json?.projectNumber||'');ensure(projectNumber,'F8_PROJECT_NUMBER_MISSING');
  const runName=`projects/${PROJECT}/locations/${REGION}/services/${SERVICE}`;
  const runRead=await firstSuccess(creds,`https://run.googleapis.com/v2/${runName}`);
  const iamRead=await firstSuccess(creds,`https://run.googleapis.com/v2/${runName}:getIamPolicy`);
  const secretRead=await firstSuccess(creds,`https://secretmanager.googleapis.com/v1/projects/${PROJECT}/secrets?pageSize=100`);

  const quotaServices=['run.googleapis.com','secretmanager.googleapis.com','firestore.googleapis.com','identitytoolkit.googleapis.com'];
  const quotaReadbacks=[];const serviceUsage=[];
  for(const svc of quotaServices){
    const q=await firstSuccess(creds,`https://serviceusage.googleapis.com/v1beta1/projects/${projectNumber}/services/${encodeURIComponent(svc)}/consumerQuotaMetrics?view=FULL&pageSize=200`);
    quotaReadbacks.push(q.ok?{...summarizeQuota(svc,q.json),readback:'PASS',route:q.route}:{service:svc,readback:'HOLD',attempts:q.attempts});
    const s=await firstSuccess(creds,`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/${encodeURIComponent(svc)}`);
    serviceUsage.push(s.ok?{service:svc,state:String(s.json?.state||'UNKNOWN'),route:s.route}:{service:svc,state:'HOLD',attempts:s.attempts});
  }

  const run=runRead.ok?summarizeRun(runRead.json):null;
  const iam=iamRead.ok?summarizeIam(iamRead.json):null;
  const secrets=secretRead.ok?summarizeSecrets(secretRead.json):null;
  const hardFindings=[];
  if(!runRead.ok)hardFindings.push('cloud_run_service_read_unavailable');
  if(!iamRead.ok)hardFindings.push('cloud_run_iam_read_unavailable');
  if(!secretRead.ok)hardFindings.push('secret_manager_metadata_read_unavailable');
  if(run&&run.name!==runName)hardFindings.push('cloud_run_target_mismatch');
  if(run&&!run.serviceAccountSet)hardFindings.push('cloud_run_runtime_service_account_missing');
  if(run&&run.plaintextSensitiveKeyCount>0)hardFindings.push('cloud_run_plaintext_sensitive_env_key_detected');
  if(quotaReadbacks.some(x=>x.readback!=='PASS'))hardFindings.push('quota_readback_partial');
  if(serviceUsage.some(x=>x.state==='HOLD'))hardFindings.push('service_usage_readback_partial');

  const decision=hardFindings.length?'HOLD_F8_PROVIDER_SECURITY_QUOTA_READONLY':'PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY';
  const report={
    schemaVersion:'cxorbia.f8-provider-security-quota-readonly.v2.1',generatedAt:new Date().toISOString(),decision,
    projectId:PROJECT,projectNumberFingerprint:hash(projectNumber).slice(0,20),credentialRoutes:sanitizedCreds(creds),
    readRoutes:{project:projectRead.route||null,cloudRun:runRead.route||null,cloudRunIam:iamRead.route||null,secrets:secretRead.route||null},
    cloudRun:run,cloudRunIam:iam,secrets,serviceUsage,quotaReadbacks,hardFindings,
    interpretation:decision==='PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY'?'Fresh provider-side IAM, Secret Manager metadata and quota/service-usage readbacks were completed without provider mutation.':'At least one required provider-side security readback or runtime configuration finding remains unresolved; secret values were not read or persisted.',
    safety:safe,next:decision==='PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY'?'F8_BOUNDED_LOAD_QUOTA_FAILURE_INJECTION_READONLY':'F8_PROVIDER_SECURITY_FINDING_CLASSIFICATION'
  };
  write(report);console.log(JSON.stringify(report,null,2));
  if(decision!=='PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY')process.exitCode=1;
}

main().catch(error=>{const report={schemaVersion:'cxorbia.f8-provider-security-quota-readonly.v2.1',generatedAt:new Date().toISOString(),decision:'HOLD_F8_PROVIDER_SECURITY_QUOTA_READONLY',error:String(error?.message||error).slice(0,400),safety:safe};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;});
