#!/usr/bin/env node
/* I3 R20 -- ONE ordinary Shopper password attempt on existing DEV only.
 * Owner: QA (control); no user creation, password reset, Auth/HR/finance writes,
 * custom tokens or alternate workflow. Never emit login or credential material.
 * Credential provenance: exact existing membership + Auth claims + sealed
 * credential proof + frozen first-name credential rule, not guessed variants.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {decryptCredentialBundle,internalEmail} from './cxorbia-c6-shopper-identity-canonical-plan.mjs';
import '../../app/core/shopper-credential-rule.js';

const PROJECT='cxorbia-backend-dev',TENANT='tya',SCOPE='cinepolis';
const SOURCE=String(process.env.R20_SOURCE_SHA||process.env.FOCAL_SOURCE||'');
const ROOT=String(process.env.R20_HOSTING_URL||'https://cxorbia-backend-dev.web.app');
const OUT=String(process.env.R20_SAFE_OUT||((process.env.PHASEA_LIVE_OUT||'.tmp')+'/r20'));
const word=v=>String(v??'').trim();
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const receipt={schemaVersion:'cxorbia.i3.r20.one-proven-credential-readonly.v2',
 sourceSha:SOURCE,decision:'HOLD_R20_PREFLIGHT',classification:'AUTH_FAILURE',
 credentialProvenance:'NOT_PROVEN',selectionPolicy:'ONE_EXACT_VERIFIED_CREDENTIAL_SORTED_SHA256',
 attemptedAccounts:0,loginAttempts:0,customTokensUsed:0,authWrites:0,
 passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,
 financeWrites:0,providerWrites:0,deploys:0,production:false};
fs.mkdirSync(OUT,{recursive:true});
function emit(decision,classification='AUTH_FAILURE'){
 receipt.decision=decision;receipt.classification=classification;
 fs.writeFileSync(OUT+'/result.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt));
}
const rootOk=(()=>{try{return new URL(ROOT).origin==='https://cxorbia-backend-dev.web.app';}catch{return false;}})();
if(!rootOk||!/^[0-9a-f]{40}$/.test(SOURCE)){
 emit('HOLD_R20_UNPINNED_SOURCE_OR_NONDEV_ORIGIN','SOURCE_FAILURE');process.exit(0);
}
const saFile=word(process.env.GOOGLE_APPLICATION_CREDENTIALS);
if(!saFile||!fs.existsSync(saFile)){
 emit('HOLD_R20_NO_DEV_SERVICE_ACCOUNT','ENVIRONMENT_FAILURE');process.exit(0);
}
let sa,bundle;
try{
 sa=JSON.parse(fs.readFileSync(saFile,'utf8'));
 if(sa.project_id!==PROJECT||!sa.private_key)throw Error('SCOPED_ACCOUNT_REQUIRED');
 bundle=decryptCredentialBundle({serviceAccount:sa});
}catch{
 emit('HOLD_R20_SEALED_CREDENTIAL_PROVENANCE_UNAVAILABLE','ENVIRONMENT_FAILURE');process.exit(0);
}
const rule=globalThis.CX_SHOPPER_CREDENTIAL_RULE?.shopperCredentialRule;
if(typeof rule!=='function'){
 emit('HOLD_R20_CANONICAL_RULE_UNAVAILABLE','SOURCE_FAILURE');process.exit(0);
}
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
let members,profiles;
try{
 const tenant=getFirestore().collection('tenants').doc(TENANT);
 const [ms,ps]=await Promise.all([tenant.collection('users').get(),tenant.collection('shoppers').get()]);
 members=ms.docs.map(d=>({uid:d.id,...d.data()}));
 profiles=new Map(ps.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
}catch{
 emit('HOLD_R20_EXACT_MEMBERSHIP_PROVIDER_READ_FAILED','PROVIDER_FAILURE');process.exit(0);
}
const sealed=new Map();
for(const record of Array.isArray(bundle.records)?bundle.records:[]){
 if(record?.kind!=='shopper')continue;
 const login=word(record.normalizedLogin||record.loginIdentifier).toLowerCase();
 const h=word(record.passwordHashHex);
 if(!login||!/^[a-f0-9]{64}$/.test(h))continue;
 const a=sealed.get(login)||[];a.push(h);sealed.set(login,a);
}
const targetLogin=word(process.env.R20_AUTHORIZED_TEST_LOGIN).toLowerCase();
const stats={activeShopperMembers:0,exactProfiles:0,ruleMatch:0,sealedProofMatch:0,authClaimMatch:0,ambiguousPrincipal:0};
let selected=null;
const sorted=members.filter(m=>m.active===true&&word(m.role).toLowerCase()==='shopper'&&word(m.authNamespace).toLowerCase()==='shopper')
 .sort((a,b)=>hash(word(a.uid)).localeCompare(hash(word(b.uid))));
for(const m of sorted){
 stats.activeShopperMembers++;
 const id=word(m.shopperId),profile=profiles.get(id);
 if(!profile||!id)continue;
 stats.exactProfiles++;
 const expected=rule(profile);
 const visible=word(m.visibleLogin||m.username||profile.visibleLogin||profile.username).toLowerCase();
 if(!expected?.ok||expected.login!==visible||(targetLogin&&visible!==targetLogin))continue;
 stats.ruleMatch++;
 const proof=sealed.get(visible)||[];
 if(proof.length!==1||hash(expected.password)!==proof[0])continue;
 stats.sealedProofMatch++;
 const same=sorted.filter(x=>word(x.shopperId)===id);
 if(same.length!==1){stats.ambiguousPrincipal++;continue;}
 try{
  const principal=await getAuth().getUser(word(m.uid||m.id||m.authUid));
  const c=principal.customClaims||{};
  if(principal.disabled||c.role!=='shopper'||c.authNamespace!=='shopper'||c.tenantId!==TENANT||
    c.shopperId!==id||!Array.isArray(c.projectIds)||!c.projectIds.includes(SCOPE)||
    word(principal.email).toLowerCase()!==internalEmail(visible,'shopper',TENANT))continue;
  stats.authClaimMatch++;
 }catch{continue;}
 selected={login:visible,password:expected.password};
 break;
}
receipt.selection={...stats,selected:Boolean(selected),exactRequested:Boolean(targetLogin)};
if(!selected){
 emit('HOLD_R20_NO_SINGLE_EXISTING_PASSWORD_PROOF','AUTH_FAILURE');process.exit(0);
}
receipt.credentialProvenance='EXACT_SEALED_HASH_CANONICAL_RULE_AND_AUTH_CLAIMS';
receipt.loginAttempts=1;
receipt.attemptedAccounts=1;
const runner=new URL('./cxorbia-p0-shopper-real-auth-e2e.mjs',import.meta.url);
const proc=spawnSync(process.execPath,[runner.pathname,'--execute-real'],{
 env:{...process.env,CXORBIA_P0_REAL_AUTH_E2E_AUTHORIZED:'YES_SOURCE_APPROVED_REAL_READONLY_E2E',
 CXORBIA_P0_E2E_LOGIN:selected.login,CXORBIA_P0_E2E_PASSWORD:selected.password,
 CXORBIA_P0_E2E_ROOT_URL:ROOT,CXORBIA_P0_E2E_REQUIRE_HISTORY:'0'},
 cwd:process.cwd(),encoding:'utf8',timeout:325000,maxBuffer:1024*1024
});
selected.login='';selected.password='';
let result=null;
try{result=JSON.parse(word(proc.stdout));}catch{}
receipt.loginAttempts=Math.max(1,Math.min(2,Number(result?.loginAttempts)||1));
if(result?.schemaVersion==='cxorbia.p0.r20.password-stage-diagnostic.v1'){
 receipt.browserStage=result.stage||'UNKNOWN';
 receipt.browserErrorType=result.errorType||'OTHER';
 receipt.authProviderHttp=Array.isArray(result.authProviderHttp)?result.authProviderHttp.slice(-8):[];
 receipt.contextReadback=result.contextReadback||{};
 receipt.pageErrorCount=Number(result.pageErrorCount)||0;
}
if(proc.status!==0){
 receipt.processState=proc.signal?'TERMINATED_OR_TIMEOUT':'NONZERO_EXIT';
 emit('HOLD_R20_ORDINARY_BROWSER_STAGE_IDENTIFIED','AUTH_FAILURE');process.exit(0);
}
if(result?.decision==='PASS_P0_REAL_SHOPPER_AUTH_TO_HR_E2E'&&result.safety?.passwordChanges===0&&
 result.safety?.authWrites===0&&result.canonicalResolved===true&&result.authorityApplied===true&&
 result.sessionLifecycle?.restore===true&&result.sessionLifecycle?.logout===true&&result.sessionLifecycle?.relogin===true){
 receipt.firstPasswordLogin=true;
 receipt.identityAndHr=true;
 receipt.historyAvailable=Number(result.historyCount)>0;
 receipt.workspaceState=result.workspaceState||'unknown';
 receipt.restorationLogoutRelogin='PASS_SAME_UID_SAME_SHOPPER_HR_AFTER_RELOGIN';
 receipt.sessionLifecycle={restore:true,logout:true,relogin:true};
 emit('PASS_R20_ORDINARY_PASSWORD_FULL_SESSION_LIFECYCLE','AUTH_FAILURE');
}else{
 receipt.browserDecisionRecognized=Boolean(result?.decision);
 emit('HOLD_R20_ORDINARY_PASSWORD_RESULT_UNVERIFIED','AUTH_FAILURE');
}
