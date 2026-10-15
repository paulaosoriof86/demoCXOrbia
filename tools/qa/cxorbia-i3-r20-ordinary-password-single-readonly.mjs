#!/usr/bin/env node
/* R20 focal READ-ONLY ordinary-password authentication. Exactly one authorized
   existing credential; no brute-force, reset, account creation or token substitution.
   Never emit secrets, names, emails, uid, password hash, or raw error details. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {decryptCredentialBundle,internalEmail} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';

const PROJECT='cxorbia-backend-dev',TENANT='tya',SCOPE='cinepolis';
const OUT=process.env.R20_SAFE_OUT||(process.env.PHASEA_LIVE_OUT||'.tmp')+'/r20';
const SOURCE=String(process.env.R20_SOURCE_SHA||process.env.FOCAL_SOURCE||'');
const ROOT=String(process.env.R20_HOSTING_URL||'https://cxorbia-backend-dev.web.app');
fs.mkdirSync(OUT,{recursive:true});
const receipt={schemaVersion:'cxorbia.i3.r20.existing-password-focal.v1',sourceSha:SOURCE,
 classification:null,decision:'HOLD',credentialSource:'none',credentialSearchBounded:true,
 loginAttempts:0,customTokensUsed:0,authWrites:0,passwordChanges:0,firestoreWrites:0,hrWrites:0,
 production:false,sessionRestoreAndLogout:'PENDING',populationCoverage:'PENDING'};
const emit=(decision,classification='AUTH_FAILURE')=>{
 receipt.decision=decision;receipt.classification=classification;
 fs.writeFileSync(OUT+'/result.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt));
};
const word=v=>String(v??'').trim();
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const validClaims=(c,id)=>{
 const p=Array.isArray(c?.projectIds)?c.projectIds:[];
 return c?.role==='shopper'&&c?.authNamespace==='shopper'&&c?.tenantId===TENANT
   &&c?.shopperId===id&&p.includes(SCOPE);
};
if(!/^[0-9a-f]{40}$/.test(SOURCE)){emit('HOLD_R20_SOURCE_UNPINNED','SOURCE_FAILURE');process.exit(0);}
const saFile=word(process.env.GOOGLE_APPLICATION_CREDENTIALS);
if(!saFile||!fs.existsSync(saFile)){emit('HOLD_R20_DEV_SERVICE_ACCOUNT_UNAVAILABLE','ENVIRONMENT_FAILURE');process.exit(0);}
let sa,bundle;
try{
 sa=JSON.parse(fs.readFileSync(saFile,'utf8'));
 if(sa.project_id!==PROJECT||!sa.private_key)throw Error('SERVICE_ACCOUNT_SCOPE');
 bundle=decryptCredentialBundle({serviceAccount:sa});
}catch(e){emit('HOLD_R20_SEALED_PROVENANCE_UNAVAILABLE','ENVIRONMENT_FAILURE');process.exit(0);}
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
let memberships,profiles;
try{
 const db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
 const [ms,ps]=await Promise.all([tenant.collection('users').get(),tenant.collection('shoppers').get()]);
 memberships=ms.docs.map(x=>({uid:x.id,...(x.data()||{})}));
 profiles=new Map(ps.docs.map(x=>[x.id,{id:x.id,...(x.data()||{})}]));
}catch(e){emit('HOLD_R20_MEMBERSHIP_READ_UNAVAILABLE','PROVIDER_FAILURE');process.exit(0);}
const records=new Map();
for(const item of Array.isArray(bundle.records)?bundle.records:[]){
 if(item?.kind!=='shopper')continue;
 const login=word(item.normalizedLogin||item.loginIdentifier).toLowerCase(),h=word(item.passwordHashHex);
 if(!login||!/^[0-9a-f]{64}$/.test(h))continue;
 const key=login; const rows=records.get(key)||[];rows.push(item);records.set(key,rows);
}
const envLogin=word(process.env.R20_AUTHORIZED_TEST_LOGIN).toLowerCase();
const envPass=word(process.env.R20_AUTHORIZED_TEST_PASSWORD);
if(Boolean(envLogin)!==Boolean(envPass)){emit('HOLD_R20_EXPLICIT_CREDENTIAL_PAIR_INCOMPLETE','ENVIRONMENT_FAILURE');process.exit(0);}
let selected=null,eligible=0,explicitCandidate=0,ambiguous=0;
for(const member of memberships){
 if(member.active!==true||word(member.role).toLowerCase()!=='shopper'||word(member.authNamespace).toLowerCase()!=='shopper')continue;
 const id=word(member.shopperId),profile=profiles.get(id),login=word(member.visibleLogin||member.username||profile?.visibleLogin||profile?.username).toLowerCase();
 if(!profile||!login)continue;
 if(envLogin&&login!==envLogin)continue;
 const candidates=records.get(login)||[];
 const secret=envLogin===login&&envPass ? envPass : word(profile.pass||profile.password);
 const src=envLogin===login&&envPass?'authorized_existing_test_secret':'exact_profile_password';
 if(!secret)continue;
 if(!envPass && (candidates.length!==1||hash(secret)!==word(candidates[0]?.passwordHashHex)))continue;
 try{
   const user=await getAuth().getUser(member.uid||member.id||member.uidFirebase||member.authUid);
   if(user.disabled===true||!validClaims(user.customClaims||{},id)||word(user.email).toLowerCase()!==internalEmail(login,'shopper',TENANT))continue;
   if(user.uid!==member.uid && user.uid!==member.id && user.uid!==member.authUid)continue;
 }catch(e){continue;}
 explicitCandidate++;
 const exactMembers=memberships.filter(x=>x.active===true&&word(x.role).toLowerCase()==='shopper'&&word(x.shopperId)===id);
 if(exactMembers.length!==1){ambiguous++;continue;}
 eligible++;
 if(eligible===1)selected={login,password:secret,credentialSource:src};
 if(eligible>1){selected=null;break;}
}
receipt.credentialSource=selected?.credentialSource||'none';
receipt.credentialEligibleCount=eligible>1?'multiple':eligible;
receipt.credentialAmbiguities=ambiguous;
if(!selected){
 emit(eligible>1?'HOLD_R20_MULTIPLE_AUTHORIZED_CREDENTIALS_SELECT_ONE':
   'HOLD_R20_NO_EXACT_EXISTING_PASSWORD_CREDENTIAL','AUTH_FAILURE');
 process.exit(0);
}
const runner=new URL('./cxorbia-p0-shopper-real-auth-e2e.mjs',import.meta.url);
receipt.loginAttempts=1;
const proc=spawnSync(process.execPath,[runner.pathname,'--execute-real'],{
 env:{...process.env,CXORBIA_P0_REAL_AUTH_E2E_AUTHORIZED:'YES_SOURCE_APPROVED_REAL_READONLY_E2E',
  CXORBIA_P0_E2E_LOGIN:selected.login,CXORBIA_P0_E2E_PASSWORD:selected.password,
  CXORBIA_P0_E2E_ROOT_URL:ROOT,CXORBIA_P0_E2E_REQUIRE_HISTORY:'0'},
 cwd:process.cwd(),encoding:'utf8',timeout:160000,maxBuffer:1024*1024});
selected.password='';selected.login='';
if(proc.status!==0){
 receipt.browserStatus=proc.signal==='SIGTERM'?'timeout':'failed';
 emit('HOLD_R20_ORDINARY_PASSWORD_BROWSER_FAILED','AUTH_FAILURE');
 process.exit(0);
}
let result=null;
try{result=JSON.parse(proc.stdout);}catch(e){}
if(result?.decision==='PASS_P0_REAL_SHOPPER_AUTH_TO_HR_E2E'&&result?.safety?.passwordChanges===0&&result?.safety?.authWrites===0){
 receipt.firstPasswordLogin=true;
 receipt.hrAuthorityApplied=result.authorityApplied===true;
 receipt.profileExact=result.canonicalResolved===true;
 receipt.identityReviewRequired=result.reviewRequired===true;
 receipt.historyPresent=result.historyCount>0;
 receipt.workspaceState=result.workspaceState||'unknown';
 emit('PASS_R20_ORDINARY_PASSWORD_FIRST_LOGIN_FOCAL','AUTH_FAILURE');
}else emit('HOLD_R20_ORDINARY_PASSWORD_RESULT_UNVERIFIED','AUTH_FAILURE');
