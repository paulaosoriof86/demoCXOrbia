#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const AUTH=String(process.env.CXORBIA_F8_EXISTING_IAM_BRIDGE_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_EXISTING_IAM_BRIDGE_OUT||'.tmp/f8-existing-iam-bridge-readonly/report.json');
const RAW=String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'');
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const safe={providerReads:true,providerWrites:0,iamWrites:0,newPersistentCredentials:0,ephemeralImpersonationTokensMayBeRequested:true,secretValuesPersisted:false,tokensPersisted:false,credentialsExposed:false,tokensExposed:false,deploys:0,rebuilds:0,reimports:0,legacyDatabaseAccess:false,authorizationConsumed:false};
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
async function api(token,url,{method='GET',body=null}={}){const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});const t=await r.text();let j={};try{j=t?JSON.parse(t):{};}catch{j={};}return {ok:r.ok,status:r.status,json:j,error:r.ok?null:String(j?.error?.message||`HTTP_${r.status}`).slice(0,220)};}
async function canSetIam(token){
  const r=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`,{method:'POST',body:{permissions:['resourcemanager.projects.setIamPolicy']}});
  return {testSucceeded:r.ok,canSet:r.ok&&Array.isArray(r.json?.permissions)&&r.json.permissions.includes('resourcemanager.projects.setIamPolicy'),status:r.status};
}
async function impersonate(baseToken,email){
  const r=await api(baseToken,`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(email)}:generateAccessToken`,{method:'POST',body:{scope:['https://www.googleapis.com/auth/cloud-platform'],lifetime:'600s'}});
  if(!r.ok||!r.json?.accessToken)return {generated:false,status:r.status,error:r.error};
  const capability=await canSetIam(String(r.json.accessToken));
  return {generated:true,status:r.status,canSetIamPolicy:capability.canSet,setIamTestSucceeded:capability.testSucceeded,setIamTestStatus:capability.status};
}
async function main(){
  ensure(AUTH==='YES_PAULA_F8_EXISTING_IAM_BRIDGE_READONLY','F8_EXISTING_IAM_BRIDGE_GATE_REQUIRED');
  let sa=null;try{sa=JSON.parse(RAW);}catch{}
  ensure(sa?.type==='service_account'&&sa?.project_id===PROJECT&&sa?.client_email&&sa?.private_key,'F8_EXISTING_DEV_CREDENTIAL_SHAPE_INVALID');
  const {default:admin}=await import('firebase-admin');
  const token=(await admin.credential.cert(sa).getAccessToken())?.access_token;
  ensure(token,'F8_EXISTING_DEV_TOKEN_MISSING');
  const principalFingerprint=hash(sa.client_email).slice(0,20);
  const direct=await canSetIam(token);
  const project=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}`);
  const projectNumber=String(project.json?.projectNumber||'');
  ensure(project.ok&&projectNumber,'F8_PROJECT_NUMBER_READ_REQUIRED');

  const known=[
    sa.client_email,
    `${projectNumber}-compute@developer.gserviceaccount.com`,
    `${projectNumber}@cloudbuild.gserviceaccount.com`,
    `service-${projectNumber}@gcp-sa-firestore.iam.gserviceaccount.com`
  ];
  const unique=[...new Set(known.filter(Boolean))];
  const attempts=[];
  for(const email of unique){
    const r=await impersonate(token,email);
    attempts.push({serviceAccountFingerprint:hash(email).slice(0,20),candidateClass:email===sa.client_email?'existing_dev':email.includes('@cloudbuild.')?'cloud_build_default':email.includes('-compute@')?'compute_default':'firestore_service_agent',ephemeralTokenGenerated:r.generated,generateStatus:r.status,canSetIamPolicy:Boolean(r.canSetIamPolicy),setIamTestSucceeded:Boolean(r.setIamTestSucceeded),setIamTestStatus:r.setIamTestStatus??null,errorClass:r.generated?null:(r.status===403?'PERMISSION_DENIED':r.status===404?'NOT_FOUND':r.status?`HTTP_${r.status}`:'UNKNOWN')});
  }
  const capable=attempts.filter(x=>x.ephemeralTokenGenerated&&x.canSetIamPolicy);
  const decision=direct.canSet||capable.length?'PASS_F8_EXISTING_IAM_BRIDGE_AVAILABLE':'HOLD_F8_NO_EXISTING_AUTOMATED_IAM_BRIDGE';
  const report={
    schemaVersion:'cxorbia.f8-existing-iam-bridge-readonly.v2',generatedAt:new Date().toISOString(),projectId:PROJECT,decision,
    existingDev:{principalFingerprint,directSetIamPolicy:direct.canSet,directSetIamPermissionTestSucceeded:direct.testSucceeded,directSetIamPermissionTestStatus:direct.status},
    projectRead:{ok:project.ok,projectNumberFingerprint:hash(projectNumber).slice(0,20)},
    deterministicExistingCandidateProbe:{candidateCount:attempts.length,attempts,capableBridgeCount:capable.length,capableBridgeFingerprints:capable.map(x=>x.serviceAccountFingerprint)},
    interpretation:decision.startsWith('PASS_')?'An already-existing principal can be impersonated ephemerally from the DEV identity and can set project IAM; no new persistent credential is required.':'The DEV identity cannot set project IAM directly and cannot mint an ephemeral token for any deterministic existing project service-account candidate that can set IAM. No automated IAM bridge was proven.',
    safety:safe,
    next:decision.startsWith('PASS_')?'F8_USE_EXISTING_IAM_BRIDGE_WITH_EXPLICIT_TEMP_BINDING_AUTHORIZATION':'F8_HUMAN_OWNER_SECURE_BRIDGE_REQUIRED'
  };
  write(report);console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{const report={schemaVersion:'cxorbia.f8-existing-iam-bridge-readonly.v2',generatedAt:new Date().toISOString(),projectId:PROJECT,decision:'HOLD_F8_EXISTING_IAM_BRIDGE_READONLY_ERROR',error:String(error?.message||error).slice(0,320),safety:safe,next:'F8_HUMAN_OWNER_SECURE_BRIDGE_REQUIRED'};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;});
