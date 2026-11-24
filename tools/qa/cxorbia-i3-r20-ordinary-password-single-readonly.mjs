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
import {assessExactPasswordProof,assessCurrentProviderPasswordProof,sameKeeperSealedHashes,A08_PASSWORD_EXCEPTION_IDS} from './cxorbia-i3-a08-exact-password-proof.mjs';

const PROJECT='cxorbia-backend-dev',TENANT='tya',SCOPE='cinepolis';
const SOURCE=String(process.env.R20_SOURCE_SHA||process.env.FOCAL_SOURCE||'');
const ROOT=String(process.env.R20_HOSTING_URL||'https://cxorbia-backend-dev.web.app');
const OUT=String(process.env.R20_SAFE_OUT||((process.env.PHASEA_LIVE_OUT||'.tmp')+'/r20'));
const targetShopperId=String(process.env.R20_AUTHORIZED_TEST_SHOPPER_ID||'').trim();
const currentProviderMode=process.env.R20_CREDENTIAL_AUTHORITY==='CURRENT_PROVIDER_VERIFIED_RULE_V1';
if(currentProviderMode&&!A08_PASSWORD_EXCEPTION_IDS.includes(targetShopperId))throw Error('SOURCE_FAILURE:A08_CURRENT_PROVIDER_TARGET_NOT_AUTHORIZED');
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
 if(targetShopperId){
  if(!/^[A-Za-z0-9_-]{1,120}$/.test(targetShopperId))throw Error('EXACT_SHOPPER_ID_REQUIRED');
  const [ms,ps]=await Promise.all([tenant.collection('users').where('shopperId','==',targetShopperId).limit(9).get(),tenant.collection('shoppers').doc(targetShopperId).get()]);
  if(ms.size===9)throw Error('EXACT_MEMBERSHIP_QUERY_TRUNCATED');
  members=ms.docs.map(d=>({...d.data(),uid:d.id}));
  profiles=new Map(ps.exists?[[ps.id,{id:ps.id,...ps.data()}]]:[]);
 }else{
  const [ms,ps]=await Promise.all([tenant.collection('users').get(),tenant.collection('shoppers').get()]);
  members=ms.docs.map(d=>({uid:d.id,...d.data()}));
  profiles=new Map(ps.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
 }
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
const stats={activeShopperMembers:0,exactProfiles:0,ruleMatch:0,sealedProofMatch:0,authClaimMatch:0,ambiguousPrincipal:0,canonicalLoginMismatch:0,credentialReasonCounts:{}};
let selected=null;
const sorted=members.filter(m=>m.active===true&&word(m.role).toLowerCase()==='shopper'&&word(m.authNamespace).toLowerCase()==='shopper')
 .sort((a,b)=>hash(word(a.uid)).localeCompare(hash(word(b.uid))));
for(const m of sorted){
 stats.activeShopperMembers++;
 const id=word(m.shopperId),profile=profiles.get(id);
 if(!profile||!id||(targetShopperId&&id!==targetShopperId))continue;
 stats.exactProfiles++;
 const expected=rule(profile);
 const visible=word(m.visibleLogin||m.username||profile.visibleLogin||profile.username).toLowerCase();
 if(targetLogin&&visible!==targetLogin)continue;
 let principal=null,proof;
 if(currentProviderMode){
  try{
   const tenant=getFirestore().collection('tenants').doc(TENANT);
   principal=await getAuth().getUser(m.uid);
   const crossSnap=await tenant.collection('shopperIdentityCrosswalk').doc(id).get();
   let adjudication=null,link=null;
   if(profile.identityAuthority==='tenant_adjudication'&&/^[a-f0-9]{40}$/.test(word(profile.identityAuthorityRef))){
    const doc=await tenant.collection('commandReceipts').doc(profile.identityAuthorityRef).get();adjudication=doc.exists?doc.data():null;
    if(/^irl_[a-f0-9]{32}$/.test(word(adjudication?.identityLinkId))){const ls=await tenant.collection('shopperIdentityLinks').doc(adjudication.identityLinkId).get();link=ls.exists?ls.data():null;}
   }
   proof=assessCurrentProviderPasswordProof({shopperId:id,uid:m.uid,member:m,profile,authUser:principal,expected,
    cross:crossSnap.exists?crossSnap.data():null,receipt:adjudication,link,sealedHashes:sameKeeperSealedHashes(bundle.records,m.uid)});
  }catch{proof={allowed:false,ruleAvailable:expected?.ok===true,reason:'CURRENT_PROVIDER_PROVENANCE_READ_FAILED'};}
 }else proof=assessExactPasswordProof({shopperId:targetShopperId===id?id:'',expected,visibleLogin:visible,sealedHashes:sealed.get(visible)||[]});
 stats.credentialReasonCounts[proof.reason]=(stats.credentialReasonCounts[proof.reason]||0)+1;
 if(proof.ruleAvailable)stats.ruleMatch++;
 if(proof.ruleAvailable&&!proof.canonicalLoginMatches)stats.canonicalLoginMismatch++;
 if(!proof.allowed)continue;
 if(proof.credentialHashMatches)stats.sealedProofMatch++;
 if(proof.durableProviderProof)stats.durableProviderProofMatch=(stats.durableProviderProofMatch||0)+1;
 const same=sorted.filter(x=>word(x.shopperId)===id);
 if(same.length!==1){stats.ambiguousPrincipal++;continue;}
 try{
  principal=principal||await getAuth().getUser(word(m.uid||m.id||m.authUid));
  const c=principal.customClaims||{};
  const checks={AUTH_DISABLED:principal.disabled!==true,AUTH_ROLE:c.role==='shopper',AUTH_NAMESPACE:c.authNamespace==='shopper',
    AUTH_TENANT:c.tenantId===TENANT,AUTH_SHOPPER:c.shopperId===id,AUTH_PROJECT:Array.isArray(c.projectIds)&&c.projectIds.includes(SCOPE),
    AUTH_LOGIN_EMAIL:word(principal.email).toLowerCase()===internalEmail(visible,'shopper',TENANT)};
  const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([code])=>code);
  for(const code of failed)stats.credentialReasonCounts[code]=(stats.credentialReasonCounts[code]||0)+1;
  if(failed.length)continue;
  stats.authClaimMatch++;
 }catch{stats.credentialReasonCounts.AUTH_LOOKUP_FAILED=(stats.credentialReasonCounts.AUTH_LOOKUP_FAILED||0)+1;continue;}
 selected={login:visible,password:expected.password,shopperId:id,uid:m.uid,authBefore:principal,credentialProvenance:proof.provenance,canonicalLoginMatches:proof.canonicalLoginMatches,exactAliasAllowed:proof.exactAliasAllowed,durableProviderProof:proof.durableProviderProof===true,credentialHashSource:proof.credentialHashSource||'EXACT_C6_VISIBLE_LOGIN_SEAL'};
 break;
}
receipt.selection={...stats,selected:Boolean(selected),exactRequested:Boolean(targetLogin||targetShopperId),
 boundedShopperIdQuery:Boolean(targetShopperId),requestedShopperId:targetShopperId||null,
 selectedShopperMatchesRequested:targetShopperId?selected?.shopperId===targetShopperId:null,
 canonicalLoginMatches:selected?.canonicalLoginMatches??null,exactExistingAliasProven:selected?.exactAliasAllowed===true,
 usernameCanonizationProven:false,durableProviderProof:selected?.durableProviderProof===true,credentialHashSource:selected?.credentialHashSource||'NOT_PROVEN',credentialAuthorityMode:currentProviderMode?'CURRENT_PROVIDER_VERIFIED_RULE_V1':'LEGACY_SEALED_V1'};
if(!selected){
 emit('HOLD_R20_NO_SINGLE_EXISTING_PASSWORD_PROOF','AUTH_FAILURE');process.exit(0);
}
receipt.credentialProvenance=selected.credentialProvenance;
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
try{
 const after=await getAuth().getUser(selected.uid),before=selected.authBefore;
 receipt.identityPreservedAfter=after.uid===before.uid&&after.email===before.email&&after.disabled===before.disabled&&
  after.tokensValidAfterTime===before.tokensValidAfterTime&&JSON.stringify(after.customClaims||{})===JSON.stringify(before.customClaims||{});
}catch{receipt.identityPreservedAfter=false;}
if(!receipt.identityPreservedAfter){emit('HOLD_R20_AUTH_IDENTITY_CHANGED_DURING_SESSION','AUTH_FAILURE');process.exit(0);}
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
