#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadStaffPrivateExecutionHandoff} from '../../backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs';

const REQUEST=process.env.CXORBIA_REQUEST_PATH||'backend/config/corte6-hold-profile-live-hr-readonly-request.json';
const PRIVATE_OUT=process.env.CXORBIA_PRIVATE_OUT||'.tmp/c6-hold-profile-live-hr/private.json';
const SAFE_OUT=process.env.CXORBIA_SAFE_OUT||'app/docs/evidence/CORTE6-HOLD-PROFILE-LIVE-HR-READONLY-LATEST.json';
const EXPECTED_PROJECT='cxorbia-backend-dev';
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=(ns,v)=>sha(`${ns}\0${String(v??'').trim().toLowerCase()}`).slice(0,20);
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const write=(p,x,mode)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n',{encoding:'utf8',...(mode?{mode}:{})});};

const req=JSON.parse(fs.readFileSync(REQUEST,'utf8'));
ensure(req.schemaVersion==='cxorbia.c6.hold-profile-live-hr-readonly-request.v1','REQUEST_SCHEMA');
ensure(req.mode==='p0_admin_visible_login_offline_only','REQUEST_MODE');
ensure(req.enabled===true&&req.consumed===false,'REQUEST_STATE');
ensure(req.authorizedBy==='Paula'&&req.authorizationSource==='current_conversation_2026-08-13','REQUEST_AUTH');
ensure(req.repository==='paulaosoriof86/demoCXOrbia'&&req.branch==='docs-tya-v6-v71-audit'&&req.firebaseProjectId===EXPECTED_PROJECT,'REQUEST_TARGET');
ensure(Number(req.providerReadsAuthorizedMax)===0,'PROVIDER_READ_NOT_ZERO');
for(const k of ['providerWrites','authWrites','firestoreWrites','hrWrites','rulesWrites','storageWrites','hostingDeploys','cloudRunDeploys','makeWrites','geminiCalls','paymentsWrites'])ensure(Number(req[k])===0,`UNSAFE_${k}`);
ensure(req.passwordChanges===0&&req.passwordResets===0&&req.merge===false&&req.production===false,'UNSAFE_SCOPE');

const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'';let sa;try{sa=JSON.parse(raw);}catch{}
ensure(sa?.type==='service_account'&&sa?.project_id===EXPECTED_PROJECT&&typeof sa.private_key==='string','SERVICE_ACCOUNT_INVALID');
const credentialPath=path.join(path.dirname(PRIVATE_OUT),'offline-credentials.json');
fs.mkdirSync(path.dirname(credentialPath),{recursive:true});
fs.writeFileSync(credentialPath,raw,{encoding:'utf8',mode:0o600});
let handoff;
try{
  handoff=loadStaffPrivateExecutionHandoff({credentialPath});
  const visibleLogin=String(handoff.getVisibleLogin('B')||'').trim().toLowerCase();
  ensure(visibleLogin,'ADMIN_B_VISIBLE_LOGIN_EMPTY');
  const at=new Date().toISOString();
  write(PRIVATE_OUT,{schemaVersion:'cxorbia.p0.admin-visible-login-offline.private.v1',generatedAt:at,requestId:req.requestId,canonicalAlias:'B',role:'admin',visibleLogin,passwordIncluded:false,providerReads:0},0o600);
  write(SAFE_OUT,{schemaVersion:'cxorbia.p0.admin-visible-login-offline.source-safe.v1',generatedAt:at,requestId:req.requestId,decision:'PASS_P0_ADMIN_B_VISIBLE_LOGIN_RECOVERED_OFFLINE',canonicalAlias:'B',role:'admin',visibleLoginRecovered:true,visibleLoginFingerprint:fp('admin-b-visible-login',visibleLogin),safety:{providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,passwordReads:0,passwordChanges:0,deploys:0,merge:false,production:false,visibleLoginPrivateArtifactOnly:true},nextGate:'SHOPPER_ROOT_CAUSE_STILL_REQUIRES_SEPARATE_NEW_AUTHORIZATION'},null);
  console.log(JSON.stringify({decision:'PASS_P0_ADMIN_B_VISIBLE_LOGIN_RECOVERED_OFFLINE',canonicalAlias:'B',providerReads:0,privateArtifact:true}));
}finally{
  try{handoff?.dispose?.();}catch{}
  try{fs.rmSync(credentialPath,{force:true});}catch{}
}
