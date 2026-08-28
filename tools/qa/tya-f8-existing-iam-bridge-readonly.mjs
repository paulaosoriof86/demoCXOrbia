#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const AUTH=String(process.env.CXORBIA_F8_EXISTING_IAM_BRIDGE_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_EXISTING_IAM_BRIDGE_OUT||'.tmp/f8-existing-iam-bridge-readonly/report.json');
const RAW=String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'');
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const safe={providerReads:true,providerWrites:0,iamWrites:0,newCredentials:0,secretValuesPersisted:false,tokensPersisted:false,credentialsExposed:false,tokensExposed:false,deploys:0,rebuilds:0,reimports:0,legacyDatabaseAccess:false,authorizationConsumed:false};
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
async function api(token,url,{method='GET',body=null}={}){const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body)});const t=await r.text();let j={};try{j=t?JSON.parse(t):{};}catch{j={};}return {ok:r.ok,status:r.status,json:j,error:r.ok?null:String(j?.error?.message||`HTTP_${r.status}`).slice(0,220)};}
async function main(){
  ensure(AUTH==='YES_PAULA_F8_EXISTING_IAM_BRIDGE_READONLY','F8_EXISTING_IAM_BRIDGE_GATE_REQUIRED');
  let sa=null;try{sa=JSON.parse(RAW);}catch{}
  ensure(sa?.type==='service_account'&&sa?.client_email&&sa?.private_key,'F8_EXISTING_DEV_CREDENTIAL_SHAPE_INVALID');
  const {default:admin}=await import('firebase-admin');
  const token=(await admin.credential.cert(sa).getAccessToken())?.access_token;
  ensure(token,'F8_EXISTING_DEV_TOKEN_MISSING');
  const principalFingerprint=hash(sa.client_email).slice(0,20);
  const projectPerms=['resourcemanager.projects.getIamPolicy','resourcemanager.projects.setIamPolicy','iam.serviceAccounts.list'];
  const p=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`,{method:'POST',body:{permissions:projectPerms}});
  const granted=new Set(p.ok?(p.json?.permissions||[]):[]);
  const policy=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:getIamPolicy`,{method:'POST',body:{options:{requestedPolicyVersion:3}}});
  const list=await api(token,`https://iam.googleapis.com/v1/projects/${PROJECT}/serviceAccounts?pageSize=100`);
  const serviceAccounts=Array.isArray(list.json?.accounts)?list.json.accounts:[];
  const candidates=[];
  if(list.ok){
    for(const account of serviceAccounts){
      const email=String(account?.email||'');if(!email)continue;
      const test=await api(token,`https://iam.googleapis.com/v1/projects/${PROJECT}/serviceAccounts/${encodeURIComponent(email)}:testIamPermissions`,{method:'POST',body:{permissions:['iam.serviceAccounts.getAccessToken']}});
      const canImpersonate=test.ok&&Array.isArray(test.json?.permissions)&&test.json.permissions.includes('iam.serviceAccounts.getAccessToken');
      if(canImpersonate)candidates.push({serviceAccountFingerprint:hash(email).slice(0,20),canImpersonate:true});
    }
  }
  let ownerOrIamAdminImpersonable=false;
  if(policy.ok&&candidates.length){
    const fpSet=new Set(candidates.map(x=>x.serviceAccountFingerprint));
    for(const b of (policy.json?.bindings||[])){
      const role=String(b?.role||'');
      if(!['roles/owner','roles/resourcemanager.projectIamAdmin'].includes(role))continue;
      for(const member of (b?.members||[])){
        if(!String(member).startsWith('serviceAccount:'))continue;
        const email=String(member).slice('serviceAccount:'.length);
        if(fpSet.has(hash(email).slice(0,20)))ownerOrIamAdminImpersonable=true;
      }
    }
  }
  const directSetIam=granted.has('resourcemanager.projects.setIamPolicy');
  const decision=directSetIam||ownerOrIamAdminImpersonable?'PASS_F8_EXISTING_IAM_BRIDGE_AVAILABLE':'HOLD_F8_NO_EXISTING_AUTOMATED_IAM_BRIDGE';
  const report={schemaVersion:'cxorbia.f8-existing-iam-bridge-readonly.v1',generatedAt:new Date().toISOString(),projectId:PROJECT,decision,existingDev:{principalFingerprint,projectPermissionTestSucceeded:p.ok,directGetIamPolicy:granted.has('resourcemanager.projects.getIamPolicy'),directSetIamPolicy:directSetIam,serviceAccountListPermission:granted.has('iam.serviceAccounts.list')},providerReads:{projectPolicyRead:policy.ok,projectPolicyStatus:policy.status,serviceAccountListRead:list.ok,serviceAccountListStatus:list.status,serviceAccountCount:list.ok?serviceAccounts.length:null},impersonation:{impersonableServiceAccountCount:candidates.length,impersonableServiceAccountFingerprints:candidates.map(x=>x.serviceAccountFingerprint).sort(),ownerOrProjectIamAdminImpersonable},safety:safe,next:decision.startsWith('PASS_')?'F8_USE_EXISTING_IAM_BRIDGE_WITH_EXPLICIT_TEMP_BINDING_AUTHORIZATION':'F8_HUMAN_OWNER_SECURE_BRIDGE_REQUIRED'};
  write(report);console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{const report={schemaVersion:'cxorbia.f8-existing-iam-bridge-readonly.v1',generatedAt:new Date().toISOString(),projectId:PROJECT,decision:'HOLD_F8_EXISTING_IAM_BRIDGE_READONLY_ERROR',error:String(error?.message||error).slice(0,320),safety:safe,next:'F8_HUMAN_OWNER_SECURE_BRIDGE_REQUIRED'};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=1;});
