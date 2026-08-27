#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const REGION=String(process.env.CXORBIA_CLOUD_RUN_REGION||'us-central1');
const SERVICE=String(process.env.CXORBIA_CLOUD_RUN_SERVICE||'cxorbia-live-hr-dev');
const AUTH=String(process.env.CXORBIA_F8_PROVIDER_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_PROVIDER_SECURITY_OUT||'.tmp/f8-provider-security-quota/report.json');
const SA_RAW=String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'');
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const safe={providerReads:true,providerWrites:0,dataWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,rebuilds:0,reimports:0,merge:false,secretValuesRead:false,secretValuesExported:false,credentialsExposed:false,tokensExposed:false};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};

async function token(){
  let sa=null;try{sa=JSON.parse(SA_RAW);}catch{}
  ensure(sa&&sa.type==='service_account'&&sa.project_id===PROJECT&&sa.client_email&&sa.private_key,'F8_PROVIDER_CREDENTIAL_INVALID');
  const {default:admin}=await import('firebase-admin');
  const cred=admin.credential.cert(sa);
  const result=await cred.getAccessToken();
  ensure(result?.access_token,'F8_PROVIDER_ACCESS_TOKEN_MISSING');
  return {accessToken:result.access_token,serviceAccountFingerprint:hash(sa.client_email).slice(0,20)};
}

async function api(accessToken,url,{method='GET',body=null}={}){
  const res=await fetch(url,{method,headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body)});
  const text=await res.text();
  let json=null;try{json=text?JSON.parse(text):{};}catch{json={unparsed:true};}
  if(!res.ok){const message=json?.error?.message||`HTTP_${res.status}`;throw new Error(`F8_PROVIDER_READ_FAILED_${res.status}:${message}`);}
  return json;
}

function summarizeIam(policy){
  const bindings=Array.isArray(policy?.bindings)?policy.bindings:[];
  const publicRoles=[];let memberCount=0;
  for(const b of bindings){const members=Array.isArray(b.members)?b.members:[];memberCount+=members.length;if(members.includes('allUsers')||members.includes('allAuthenticatedUsers'))publicRoles.push(String(b.role||''));}
  return {bindingCount:bindings.length,memberCount,publicBindingCount:publicRoles.length,publicRoles:publicRoles.sort(),etagPresent:Boolean(policy?.etag)};
}
function summarizeRun(service){
  const containers=Array.isArray(service?.template?.containers)?service.template.containers:[];
  let envCount=0,secretBackedEnvCount=0,plaintextSensitiveKeyCount=0;
  const sensitive=/pass|secret|token|key|credential|private/i;
  for(const c of containers){for(const e of (Array.isArray(c?.env)?c.env:[])){envCount++;if(e?.valueSource?.secretKeyRef)secretBackedEnvCount++;if(sensitive.test(String(e?.name||''))&&Object.prototype.hasOwnProperty.call(e||{},'value'))plaintextSensitiveKeyCount++;}}
  return {name:String(service?.name||''),latestReadyRevision:String(service?.latestReadyRevision||service?.traffic?.[0]?.revision||''),serviceAccountSet:Boolean(service?.template?.serviceAccount),containerCount:containers.length,envCount,secretBackedEnvCount,plaintextSensitiveKeyCount,ingress:String(service?.ingress||''),observedGeneration:String(service?.observedGeneration||'')};
}
function summarizeSecrets(x){
  const secrets=Array.isArray(x?.secrets)?x.secrets:[];
  let automatic=0,userManaged=0,rotationConfigured=0;
  for(const s of secrets){if(s?.replication?.automatic)automatic++;if(s?.replication?.userManaged)userManaged++;if(s?.rotation?.rotationPeriod||s?.rotation?.nextRotationTime)rotationConfigured++;}
  return {secretCount:secrets.length,automaticReplicationCount:automatic,userManagedReplicationCount:userManaged,rotationConfiguredCount:rotationConfigured,secretValuesRead:false,namesPersisted:false};
}
function summarizeQuota(serviceName,x){
  const metrics=Array.isArray(x?.metrics)?x.metrics:[];let limitCount=0,overrideCount=0,adminOverrideCount=0;
  for(const m of metrics){for(const l of (Array.isArray(m?.consumerQuotaLimits)?m.consumerQuotaLimits:[])){limitCount++;overrideCount+=(Array.isArray(l?.quotaBuckets)?l.quotaBuckets:[]).reduce((n,b)=>n+(Array.isArray(b?.consumerOverride)?b.consumerOverride.length:0),0);adminOverrideCount+=(Array.isArray(l?.quotaBuckets)?l.quotaBuckets:[]).reduce((n,b)=>n+(Array.isArray(b?.adminOverride)?b.adminOverride.length:0),0);}}
  return {service:serviceName,metricCount:metrics.length,limitCount,consumerOverrideCount:overrideCount,adminOverrideCount};
}

async function main(){
  ensure(AUTH==='YES_PAULA_F8_PROVIDER_SECURITY_QUOTA_READONLY','F8_PROVIDER_READONLY_EXPLICIT_GATE_REQUIRED');
  const {accessToken,serviceAccountFingerprint}=await token();
  const project=await api(accessToken,`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}`);
  const projectNumber=String(project?.projectNumber||'');ensure(projectNumber,'F8_PROJECT_NUMBER_MISSING');
  const runName=`projects/${PROJECT}/locations/${REGION}/services/${SERVICE}`;
  const runService=await api(accessToken,`https://run.googleapis.com/v2/${runName}`);
  const runIam=await api(accessToken,`https://run.googleapis.com/v2/${runName}:getIamPolicy`,{method:'POST',body:{}});
  const secretList=await api(accessToken,`https://secretmanager.googleapis.com/v1/projects/${PROJECT}/secrets?pageSize=100`);
  const quotaServices=['run.googleapis.com','secretmanager.googleapis.com','firestore.googleapis.com','identitytoolkit.googleapis.com'];
  const quotas=[];
  for(const svc of quotaServices){
    try{
      const q=await api(accessToken,`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/${encodeURIComponent(svc)}/consumerQuotaMetrics?view=FULL&pageSize=200`);
      quotas.push({...summarizeQuota(svc,q),readback:'PASS'});
    }catch(error){quotas.push({service:svc,readback:'HOLD',error:String(error?.message||error).slice(0,240)});}
  }
  const enabledChecks=[];
  for(const svc of quotaServices){
    try{const s=await api(accessToken,`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/${encodeURIComponent(svc)}`);enabledChecks.push({service:svc,state:String(s?.state||'UNKNOWN')});}
    catch(error){enabledChecks.push({service:svc,state:'HOLD',error:String(error?.message||error).slice(0,240)});}
  }
  const run=summarizeRun(runService),iam=summarizeIam(runIam),secrets=summarizeSecrets(secretList);
  ensure(run.name===runName,'F8_CLOUD_RUN_TARGET_MISMATCH');
  ensure(run.serviceAccountSet,'F8_CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT_MISSING');
  ensure(run.plaintextSensitiveKeyCount===0,'F8_CLOUD_RUN_PLAINTEXT_SENSITIVE_ENV_KEY_DETECTED');
  ensure(secrets.secretValuesRead===false,'F8_SECRET_VALUE_READ_FORBIDDEN');
  const quotaHolds=quotas.filter(q=>q.readback!=='PASS');
  const serviceHolds=enabledChecks.filter(q=>q.state==='HOLD');
  const decision=(quotaHolds.length||serviceHolds.length)?'GO_WITH_WARNING_F8_PROVIDER_SECURITY_READBACK_QUOTA_PARTIAL':'PASS_F8_PROVIDER_SECURITY_QUOTA_READONLY';
  const report={schemaVersion:'cxorbia.f8-provider-security-quota-readonly.v1',generatedAt:new Date().toISOString(),decision,projectId:PROJECT,projectNumberFingerprint:hash(projectNumber).slice(0,20),serviceAccountFingerprint,cloudRun:run,cloudRunIam:iam,secrets,serviceUsage:enabledChecks,quotaReadbacks:quotas,warnings:[...quotaHolds.map(x=>`quota:${x.service}:${x.error}`),...serviceHolds.map(x=>`service:${x.service}:${x.error}`)],safety:safe,next:quotaHolds.length?'F8_CLASSIFY_QUOTA_READBACK_GAP':'F8_BOUNDED_LOAD_QUOTA_FAILURE_INJECTION_READONLY'};
  write(report);console.log(JSON.stringify(report,null,2));
}

main().catch(error=>{const report={schemaVersion:'cxorbia.f8-provider-security-quota-readonly.v1',generatedAt:new Date().toISOString(),decision:'HOLD_F8_PROVIDER_SECURITY_QUOTA_READONLY',error:String(error?.message||error).slice(0,400),safety:safe};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;});
