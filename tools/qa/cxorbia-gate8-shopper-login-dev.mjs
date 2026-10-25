#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate8';
const RUNTIME_URL=String(process.env.RUNTIME_URL||'').replace(/\/$/,'');
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV';
const PROTECTED='YES_PAULA_20260730_PROTECTED_DEV';
const TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const stable=v=>Array.isArray(v)?v.map(stable):(v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v);
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v)),'utf8').digest('hex');
const fp=v=>sha(v).slice(0,24);
const stableUid=(tenantId,shopperId)=>`cx-sh-${sha(`${tenantId}\0shopper\0${shopperId}`).slice(0,28)}`;
const receiptId=c=>sha(`${c.tenantId}\0${c.projectId}\0${c.periodId}\0${c.idempotencyKey}`).slice(0,40);
const now=()=>new Date().toISOString();
function finish(decision,extra={},code=1){
  const result={decision,gate:8,generatedAt:now(),production:false,hrWrites:0,...extra};
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(path.join(OUT,'gate8-shopper-login.json'),JSON.stringify(result,null,2)+'\n');
  console.log(decision);
  process.exit(code);
}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function jsonFetch(url,options){const response=await fetch(url,options);return {response,body:await response.json().catch(()=>null)};}
async function apiKey(){
  const response=await fetch(`${HOSTING_URL}/__/firebase/init.json`,{cache:'no-store'});
  ensure(response.ok,'ENVIRONMENT_FAILURE',{blocker:`FIREBASE_INIT_JSON_HTTP_${response.status}`});
  const config=await response.json().catch(()=>null);
  const key=str(config?.apiKey);
  ensure(key,'ENVIRONMENT_FAILURE',{blocker:'FIREBASE_WEB_API_KEY_UNAVAILABLE'});
  return key;
}
async function adminIdToken(auth,db,tenantId,projectId){
  const users=await db.collection('tenants').doc(tenantId).collection('users').get();
  const member=users.docs.map(d=>({id:d.id,...(d.data()||{})})).find(x=>x.active===true&&str(x.authNamespace)==='staff'&&['super','admin'].includes(str(x.role))&&(str(x.role)==='super'||arr(x.projectIds).map(String).includes(projectId)));
  ensure(member,'AUTH_FAILURE',{blocker:'AUTHORIZED_DEV_ADMIN_MISSING'});
  const custom=await auth.createCustomToken(member.id);
  const key=await apiKey();
  const {response,body}=await jsonFetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(response.ok&&body?.idToken,'AUTH_FAILURE',{blocker:`ADMIN_CUSTOM_TOKEN_EXCHANGE_${response.status}`,providerCode:body?.error?.message||null});
  return body.idToken;
}
async function directShopperPasswordAuth(tenantId,shopperId,password){
  const key=await apiKey();
  const normalized=str(shopperId).toLowerCase();
  const email=`${sha(`${tenantId}\0shopper\0${normalized}`).slice(0,48)}@auth.cxorbia.invalid`;
  const {response,body}=await jsonFetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:String(password||''),returnSecureToken:true})});
  ensure(response.ok&&body?.idToken,'AUTH_FAILURE',{blocker:'SHOPPER_DIRECT_PASSWORD_AUTH_FAILED',httpStatus:response.status,providerCode:body?.error?.message||null});
  return true;
}
async function allDocs(ref){const snap=await ref.get();return snap.docs.map(d=>({id:d.id,...(d.data()||{})}));}
async function browserDiagnostic(page,{tenantId,shopperId,projectId,stage}){
  try{await page.locator('#lgPass').fill('',{timeout:2000});}catch(_){ }
  const state=await page.evaluate(({tenantId,shopperId,projectId,stage})=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const err=document.getElementById('cxIntegratedAuthError');
    const submit=document.getElementById('lgSubmit');
    const form=document.getElementById('loginForm');
    const session=window.CX?.session||{};
    let firebaseCurrentUser=false;
    try{firebaseCurrentUser=!!window.firebase?.auth?.()?.currentUser;}catch(_){ }
    return {
      stage,
      firebaseCurrentUser,
      backendContextPresent:!!ctx,
      contextAuthenticated:ctx?.authenticated===true,
      contextRole:typeof ctx?.role==='string'?ctx.role:null,
      tenantMatch:ctx?.tenantId===tenantId,
      shopperMatch:ctx?.shopperId===shopperId,
      projectAllowed:Array.isArray(ctx?.projectIds)&&ctx.projectIds.map(String).includes(projectId),
      authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,
      sessionRole:String(session.role||''),
      sessionShopperMatch:String(session.user?.shopperId||'')===shopperId,
      selectedRole:String(form?.dataset?.selectedRole||''),
      submitText:String(submit?.textContent||'').trim(),
      submitDisabled:submit?.disabled===true,
      credentialError:String(err?.textContent||'').trim()||null
    };
  },{tenantId,shopperId,projectId,stage});
  try{await page.screenshot({path:path.join(OUT,`gate8-shopper-${stage}-diagnostic.png`),fullPage:true});}catch(_){ }
  return state;
}

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
ensure(RUNTIME_URL,'ENVIRONMENT_FAILURE',{blocker:'RUNTIME_URL_REQUIRED'});
const live=await jsonFetch(`${RUNTIME_URL}/api/tya/cinepolis/hr-live?fresh=1`);
ensure(live.response.ok,'ENVIRONMENT_FAILURE',{blocker:`HR_LIVE_HTTP_${live.response.status}`});
const snapshot=live.body?.snapshot||live.body?.data||live.body;
ensure(snapshot?.sourceSafe===true&&arr(snapshot.visits).length>0,'SOURCE_FAILURE',{blocker:'HR_LIVE_SOURCE_INVALID'});
const runtime=live.body?._runtime||snapshot?._runtime||{};
const tenantId=str(snapshot.tenantId||snapshot.tenantConfig?.tenantId),projectId=str(snapshot.projectId||snapshot.projectConfig?.projectId);
ensure(tenantId&&projectId,'SOURCE_FAILURE',{blocker:'HR_SCOPE_MISSING'});
const tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
const [members,visits]=await Promise.all([allDocs(tenant.collection('users')),allDocs(project.collection('visits'))]);
const visitShopperIds=new Set(visits.map(v=>str(v.shopperId)).filter(Boolean));
const candidate=members.filter(m=>m.active===true&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper'&&arr(m.projectIds).map(String).includes(projectId)&&m.id===stableUid(tenantId,str(m.shopperId))&&visitShopperIds.has(str(m.shopperId))).sort((a,b)=>str(a.shopperId).localeCompare(str(b.shopperId))).find(m=>visits.some(v=>str(v.shopperId)===str(m.shopperId)&&str(v.periodId)));
ensure(candidate,'AUTH_FAILURE',{blocker:'STABLE_GATE6_SHOPPER_WITH_VISITS_MISSING'});
const shopperId=str(candidate.shopperId),uid=candidate.id,targetVisit=visits.find(v=>str(v.shopperId)===shopperId&&str(v.periodId)),periodId=str(targetVisit.periodId);
const [profileBefore,crossBefore,userBefore]=await Promise.all([tenant.collection('shoppers').doc(shopperId).get(),tenant.collection('shopperIdentityCrosswalk').doc(shopperId).get(),auth.getUser(uid).catch(()=>null)]);
ensure(profileBefore.exists&&crossBefore.exists&&userBefore,'PERSISTENCE_FAILURE',{blocker:'SHOPPER_IDENTITY_PRECONDITION_MISSING'});
const before={uid,profile:fp(profileBefore.data()||{}),crosswalk:fp(crossBefore.data()||{}),visit:fp(targetVisit),historyCount:visits.filter(v=>str(v.shopperId)===shopperId).length};
const staffToken=await adminIdToken(auth,db,tenantId,projectId);
const command={version:'cxorbia-command-adapter-v1',commandType:'shopper.credential.reset',entityType:'shopper',entityId:shopperId,tenantId,projectId,periodId,idempotencyKey:`recovery-g8-${process.env.GITHUB_RUN_ID||Date.now()}-${fp(shopperId)}`,payload:{credentialPurpose:'gate8_login_certification',sourceRevision:runtime.revision||snapshot.sourceRevision||null},authorization:{providerEnforcementRequired:true}};
const enrolled=await jsonFetch(`${HOSTING_URL}/v1/cxorbia/commands`,{method:'POST',headers:{authorization:`Bearer ${staffToken}`,'content-type':'application/json'},body:JSON.stringify(command)});
ensure(enrolled.response.ok&&enrolled.body?.ok===true&&enrolled.body?.providerAck===true&&enrolled.body?.credentialIssued===true&&enrolled.body?.credential?.login===shopperId&&str(enrolled.body?.credential?.password).length>=24,'AUTH_FAILURE',{blocker:'SHOPPER_ENROLLMENT_ACK_INVALID',httpStatus:enrolled.response.status,providerCode:enrolled.body?.code||null});
let ephemeral=str(enrolled.body.credential.password);
const replay=await jsonFetch(`${HOSTING_URL}/v1/cxorbia/commands`,{method:'POST',headers:{authorization:`Bearer ${staffToken}`,'content-type':'application/json'},body:JSON.stringify(command)});
ensure(replay.response.ok&&replay.body?.ok===true&&replay.body?.idempotentReplay===true&&replay.body?.credentialIssued===false&&!replay.body?.credential,'PERSISTENCE_FAILURE',{blocker:'SHOPPER_ENROLLMENT_REPLAY_INVALID'});
const receipt=await tenant.collection('commandReceipts').doc(receiptId(command)).get();
ensure(receipt.exists&&receipt.data()?.credentialState==='enrolled'&&!JSON.stringify(receipt.data()||{}).includes(ephemeral),'PERSISTENCE_FAILURE',{blocker:'SHOPPER_ENROLLMENT_RECEIPT_UNSAFE'});
await directShopperPasswordAuth(tenantId,shopperId,ephemeral);

let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'PLAYWRIGHT_UNAVAILABLE'});}
const browser=await chromium.launch({headless:true});
let first,reload,browserFailure=null;
try{
  const context=await browser.newContext(),page=await context.newPage();
  const url=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('.role-btn[data-role="shopper"]').click({timeout:30000});
  await page.locator('#lgUser').fill(shopperId);
  await page.locator('#lgPass').fill(ephemeral);
  await page.locator('#lgSubmit').click();
  ephemeral='';
  const wait=()=>page.waitForFunction(({tenantId,shopperId})=>window.CX?.backendAuth?.context?.()?.tenantId===tenantId&&window.CX?.backendAuth?.context?.()?.shopperId===shopperId&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,{tenantId,shopperId},{timeout:120000});
  const read=()=>page.evaluate(({projectId,shopperId,targetId})=>{const ctx=window.CX?.backendAuth?.context?.()||{},all=Array.isArray(window.CX?.data?._visitas)?window.CX.data._visitas:[],mine=all.filter(v=>String(v?.shopperId||'')===shopperId);return {authenticated:ctx.authenticated===true,role:ctx.role||null,tenantId:ctx.tenantId||null,shopperId:ctx.shopperId||null,projectAllowed:Array.isArray(ctx.projectIds)&&ctx.projectIds.map(String).includes(projectId),sessionShopperId:String(window.CX?.session?.user?.shopperId||''),authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,shopperVisits:mine.length,targetVisitPresent:mine.some(v=>String(v?.visitId||v?.id||'')===targetId)};},{projectId,shopperId,targetId:str(targetVisit.visitId||targetVisit.id)});
  try{await wait();}catch(_){browserFailure=await browserDiagnostic(page,{tenantId,shopperId,projectId,stage:'initial'});}
  if(!browserFailure){
    first=await read();
    await page.screenshot({path:path.join(OUT,'gate8-shopper-login-first.png'),fullPage:true});
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    try{await wait();}catch(_){browserFailure=await browserDiagnostic(page,{tenantId,shopperId,projectId,stage:'reload'});}
    if(!browserFailure){
      reload=await read();
      await page.screenshot({path:path.join(OUT,'gate8-shopper-login-reload.png'),fullPage:true});
    }
  }
  await context.close();
}finally{await browser.close();}
if(browserFailure){
  const common={directPasswordAuth:true,browser:browserFailure,rawSecretPersisted:false,rawSecretLogged:false};
  if(browserFailure.stage==='reload')finish('FUNCTIONAL_DEFECT',{blocker:'SHOPPER_RELOAD_TIMEOUT',...common});
  if(!browserFailure.firebaseCurrentUser)finish('AUTH_FAILURE',{blocker:'SHOPPER_BROWSER_FIREBASE_SESSION_MISSING',...common});
  if(!browserFailure.backendContextPresent||!browserFailure.contextAuthenticated)finish('AUTH_FAILURE',{blocker:'SHOPPER_BROWSER_CONTEXT_MISSING_AFTER_FIREBASE_AUTH',...common});
  if(browserFailure.contextRole!=='shopper'||!browserFailure.tenantMatch||!browserFailure.shopperMatch||!browserFailure.projectAllowed)finish('AUTH_FAILURE',{blocker:'SHOPPER_BROWSER_CONTEXT_INVALID',...common});
  if(!browserFailure.authorityApplied)finish('FUNCTIONAL_DEFECT',{blocker:'SHOPPER_AUTH_OK_HR_AUTHORITY_NOT_APPLIED',...common});
  finish('FUNCTIONAL_DEFECT',{blocker:'SHOPPER_BROWSER_GATE8_TIMEOUT_UNCLASSIFIED',...common});
}
ensure(first?.authenticated===true&&first.role==='shopper'&&first.tenantId===tenantId&&first.shopperId===shopperId&&first.projectAllowed===true&&first.sessionShopperId===shopperId&&first.authorityApplied===true&&first.shopperVisits>0&&first.targetVisitPresent===true,'AUTH_FAILURE',{blocker:'SHOPPER_BROWSER_LOGIN_INVALID'});
ensure(reload?.authenticated===true&&reload.role==='shopper'&&reload.tenantId===tenantId&&reload.shopperId===shopperId&&reload.sessionShopperId===shopperId&&reload.authorityApplied===true&&reload.shopperVisits===first.shopperVisits&&reload.targetVisitPresent===true,'FUNCTIONAL_DEFECT',{blocker:'SHOPPER_RELOAD_INVALID'});
const [profileAfter,crossAfter,visitAfter,userAfter,memberAfter]=await Promise.all([tenant.collection('shoppers').doc(shopperId).get(),tenant.collection('shopperIdentityCrosswalk').doc(shopperId).get(),project.collection('visits').doc(targetVisit.id).get(),auth.getUser(uid),tenant.collection('users').doc(uid).get()]);
ensure(profileAfter.exists&&crossAfter.exists&&visitAfter.exists&&memberAfter.exists,'PERSISTENCE_FAILURE',{blocker:'SHOPPER_IDENTITY_READBACK_MISSING'});
const profileData=profileAfter.data()||{},crossData=crossAfter.data()||{};
const expectedProviderUidFingerprint=sha(`cxorbia-provider-uid-v1\0${uid}`);
const identityReadback={
  uidStable:userAfter.uid===before.uid,
  profileIdentityStable:str(profileData.tenantId)===tenantId&&str(profileData.shopperId||profileData.id)===shopperId&&arr(profileData.projectIds).map(String).includes(projectId),
  crosswalkIdentityStable:str(crossData.tenantId)===tenantId&&str(crossData.shopperId)===shopperId&&str(crossData.sourceStableKey||shopperId)===shopperId&&str(crossData.authNamespace)==='shopper'&&str(crossData.providerUidFingerprint)===expectedProviderUidFingerprint&&arr(crossData.projectIds).map(String).includes(projectId)&&crossData.fuzzyMatching===false,
  visitStable:fp({id:visitAfter.id,...(visitAfter.data()||{})})===before.visit,
  credentialStateValid:str(memberAfter.data()?.credentialState)==='enrolled'&&str(memberAfter.data()?.credentialVersion)==='cxorbia-shopper-credential-v1'
};
ensure(Object.values(identityReadback).every(Boolean),'PERSISTENCE_FAILURE',{blocker:'SHOPPER_IDENTITY_CHANGED',identityReadback});
const claims=userAfter.customClaims||{};
ensure(str(claims.tenantId)===tenantId&&str(claims.shopperId)===shopperId&&str(claims.role)==='shopper'&&str(claims.authNamespace)==='shopper'&&arr(claims.projectIds).map(String).includes(projectId),'AUTH_FAILURE',{blocker:'SHOPPER_CLAIMS_CHANGED'});
finish('PASS_GATE8_SECURE_SHOPPER_LOGIN',{gate6:'PASS_REGRESSION',gate7:'PASS_REGRESSION',sourceSha:process.env.SOURCE_SHA||null,tenantId,projectId,periodId,role:'shopper',sourceRevision:runtime.revision||snapshot.sourceRevision||null,shopperFingerprint:fp(shopperId),uidFingerprint:fp(uid),targetVisitFingerprint:fp(str(targetVisit.visitId||targetVisit.id)),credentialIssuedOnce:true,replayIdempotent:true,directPasswordAuth:true,browserObserved:true,sameIdentityAfterReload:true,sameHistoryAfterReload:reload.shopperVisits===first.shopperVisits&&reload.targetVisitPresent===true,historyCount:first.shopperVisits,rawSecretPersisted:false,rawSecretLogged:false,localStorageCredentialTruth:false},0);
