#!/usr/bin/env node
/* CXOrbia · Corte 4 · Firebase project identity probe.
   Native service-account OAuth, one provider read, zero writes. */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const outDir=path.resolve(process.argv[process.argv.indexOf('--out')+1]||'.tmp/corte4-firebase-identity-probe');
const projectId=String(process.env.CXORBIA_NEW_PROJECT_ID||'').trim();
const expectedName=String(process.env.CXORBIA_NEW_PROJECT_NAME||'').trim();
const credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS;
const timeoutMs=5000;
const report={
  schemaVersion:'1.0.0',
  gate:'cxorbia-corte4-firebase-project-identity-probe',
  generatedAt:new Date().toISOString(),
  decision:'HOLD_NOT_EXECUTED',
  target:{projectId,expectedName,exists:false,accessible:false,nameMatch:false,active:false,createTimePresent:false},
  checks:{},
  safeState:{providerReads:true,providerWrites:false,firestoreWrites:false,authWrites:false,storageWrites:false,rulesDeploy:false,hostingDeploy:false,imports:false,production:false,credentialOutput:false}
};
function write(){fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'identity-probe.source-safe.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
function stop(decision){report.decision=decision;write();process.exit(0);}
function b64(value){return Buffer.from(value).toString('base64url');}
async function boundedFetch(url,options={}){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
async function main(){
  if(process.env.CXORBIA_CONFIRM!=='PROBE_FIREBASE_PROJECT_IDENTITY_READ_ONLY')return stop('BLOCKED_MISSING_CONFIRMATION');
  if(!credentialPath||!fs.existsSync(credentialPath))return stop('BLOCKED_MISSING_CREDENTIAL');
  let c;try{c=JSON.parse(fs.readFileSync(credentialPath,'utf8'));}catch{return stop('BLOCKED_INVALID_CREDENTIAL_JSON');}
  if(c.type!=='service_account'||!c.client_email||!c.private_key||!c.token_uri)return stop('BLOCKED_INVALID_CREDENTIAL_SHAPE');
  const now=Math.floor(Date.now()/1000);
  const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const claims=b64(JSON.stringify({iss:c.client_email,scope:'https://www.googleapis.com/auth/cloud-platform.read-only',aud:c.token_uri,iat:now,exp:now+1800}));
  const input=`${header}.${claims}`;
  const assertion=`${input}.${crypto.sign('RSA-SHA256',Buffer.from(input),c.private_key).toString('base64url')}`;
  let tokenResponse;
  try{tokenResponse=await boundedFetch(c.token_uri,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}).toString()});}
  catch(error){report.checks.oauth={available:false,errorCategory:error?.name==='AbortError'?'TIMEOUT':'NETWORK_ERROR'};return stop('BLOCKED_OAUTH_UNAVAILABLE');}
  const tokenText=await tokenResponse.text();let tokenPayload={};try{tokenPayload=JSON.parse(tokenText);}catch{}
  if(!tokenResponse.ok||!tokenPayload.access_token){report.checks.oauth={available:false,errorCategory:String(tokenPayload.error||tokenResponse.status),tokenOutput:false};return stop('BLOCKED_OAUTH_REJECTED');}
  report.checks.oauth={available:true,tokenOutput:false};
  let response;
  try{response=await boundedFetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`,{headers:{Authorization:`Bearer ${tokenPayload.access_token}`,Accept:'application/json'}});}
  catch(error){report.checks.projectLookup={available:false,errorCategory:error?.name==='AbortError'?'TIMEOUT':'NETWORK_ERROR'};return stop('BLOCKED_PROJECT_LOOKUP_UNAVAILABLE');}
  const text=await response.text();let payload={};try{payload=JSON.parse(text);}catch{}
  if(response.status===404){report.checks.projectLookup={available:true,status:404,exists:false};return stop('TARGET_PROJECT_NOT_FOUND_C4');}
  if(response.status===403){report.checks.projectLookup={available:false,status:403,errorCategory:'PERMISSION_DENIED'};return stop('TARGET_PROJECT_PERMISSION_DENIED_C4');}
  if(!response.ok){report.checks.projectLookup={available:false,status:response.status,errorCategory:'HTTP_ERROR'};return stop('TARGET_PROJECT_LOOKUP_FAILED_C4');}
  const actualId=String(payload.projectId||'');
  const actualName=String(payload.name||'');
  const lifecycle=String(payload.lifecycleState||'');
  const createTime=String(payload.createTime||'');
  Object.assign(report.target,{exists:true,accessible:true,nameMatch:actualName===expectedName,active:lifecycle==='ACTIVE',createTimePresent:Boolean(createTime)});
  report.checks.projectLookup={available:true,status:200,exists:true,idMatch:actualId===projectId,nameMatch:actualName===expectedName,active:lifecycle==='ACTIVE',createTimePresent:Boolean(createTime),projectNumberOutput:false,parentOutput:false};
  report.decision=(actualId===projectId&&actualName===expectedName&&lifecycle==='ACTIVE')?'TARGET_PROJECT_IDENTITY_VERIFIED_C4':'TARGET_PROJECT_IDENTITY_MISMATCH_C4';
  write();
}
main().catch(error=>{report.checks.runner={available:false,errorCategory:String(error?.name||'UNEXPECTED')};report.decision='UNEXPECTED_IDENTITY_PROBE_FAILURE';write();});
