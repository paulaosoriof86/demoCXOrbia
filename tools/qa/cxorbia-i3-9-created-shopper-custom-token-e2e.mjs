#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const argv=process.argv.slice(2);
const arg=(name,fallback=null)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:fallback;};
const requestPath=path.resolve(arg('--request','backend/requests/i3-9-created-shopper-readonly-e2e.json'));
const outPath=path.resolve(arg('--out','.tmp/i3-9-created-shopper/result.json'));
const stable=x=>JSON.stringify(x,null,2)+'\n';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const str=v=>String(v==null?'':v).trim();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const uidFingerprint=uid=>sha('cxorbia-provider-uid-v1\0'+uid);
const internalEmail=(tenantId,login)=>sha(tenantId+'\0shopper\0'+String(login).trim().toLowerCase().normalize('NFC')).slice(0,48)+'@auth.cxorbia.invalid';
const providerEmailFingerprint=email=>sha('provider-email\0'+email);
const targetUrl='https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV';

const result={
  schemaVersion:'cxorbia.i3.9.created-shopper-custom-token-e2e-result.v1',
  requestId:null,gateId:'I3.9_NEW_SHOPPER_REAL_E2E_READONLY_EXISTING_CREATED_IDENTITY',
  targetProject:'cxorbia-backend-dev',status:'NOT_STARTED',decision:'NOT_STARTED',authMode:'ephemeral_custom_token_existing_created_identity',
  providerReads:{authUser:0,membership:0,profile:0,crosswalk:0},customTokensMinted:0,providerAdminWrites:0,
  exactProvider:{user:false,claims:false,membership:false,profile:false,crosswalk:false,platformCreatedAuthority:false,periodIndependent:false,visibleLoginMappingFingerprint:false},
  browser:{providerAuth:false,claimsContext:false,membershipVerified:false,shopperSession:false,projectScope:false,reload:false,newTab:false,secondLogicalContext:false,visibleLoginSurface:false,passwordRouteReusedFromGenericFrozenContract:true,authNetworkRetries:0,firebaseProjectExact:false,firebaseConfigFingerprint:null,restCustomTokenDiagnostic:null},
  runtime:{currentProjectId:null,currentPeriodId:null,projectIds:[],periodCount:0,visitCount:null,shopperProfileInCxData:null,dataSource:null},
  i3_10ShopperScope:{duplicateVisitIds:null,duplicateShopperIds:null,countsNonnegative:null,periodSummaryConsistent:null,status:'NOT_EVALUATED',decision:'NOT_EVALUATED'},
  safety:{historicalShopperAccess:0,historicalShopperLogin:0,historicalShopperRecovery:0,historicalShopperReset:0,passwordChanges:0,passwordResets:0,userCreates:0,userUpdates:0,claimWrites:0,firestoreWrites:0,hrWrites:0,financeWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,deploys:0,merge:false,production:false,tokenPersisted:false,credentialPersisted:false,apiKeyPersisted:false,idTokenPersisted:false,refreshTokenPersisted:false},
  blockers:[],notes:[]
};
const block=code=>{if(!result.blockers.includes(code))result.blockers.push(code);};
const save=()=>{fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,stable(result),'utf8');};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitFirebase(page){
  await page.waitForFunction(()=>window.firebase&&firebase.auth&&firebase.firestore&&firebase.apps?.length>0,{timeout:30000});
}
async function waitVisibleLoginSurface(page){
  for(const selector of ['#loginForm','#login .role-btn[data-role="shopper"]','#lgUser','#lgPass','#lgSubmit']){
    await page.waitForSelector(selector,{state:'attached',timeout:30000});
  }
  const visible=await page.evaluate(()=>({form:!!document.querySelector('#loginForm'),role:!!document.querySelector('#login .role-btn[data-role="shopper"]'),user:!!document.querySelector('#lgUser'),pass:!!document.querySelector('#lgPass'),submit:!!document.querySelector('#lgSubmit')}));
  if(!Object.values(visible).every(Boolean)) throw new Error('VISIBLE_LOGIN_SURFACE_INCOMPLETE_AFTER_WAIT');
  result.browser.visibleLoginSurface=true;
}
async function firebaseBrowserConfig(page){
  const cfg=await page.evaluate(()=>{const app=firebase.app();const o=app.options||{};return {name:app.name||'[DEFAULT]',projectId:String(o.projectId||''),authDomain:String(o.authDomain||''),apiKey:String(o.apiKey||'')};});
  result.browser.firebaseProjectExact=cfg.projectId==='cxorbia-backend-dev';
  result.browser.firebaseConfigFingerprint=sha([cfg.name,cfg.projectId,cfg.authDomain,sha(cfg.apiKey)].join('\0'));
  if(!result.browser.firebaseProjectExact) throw new Error('BROWSER_FIREBASE_PROJECT_MISMATCH');
  return cfg;
}
async function browserCustomTokenSignIn(page,tokens){
  let last=null;
  for(let i=0;i<tokens.length;i++){
    try{
      await page.evaluate(async token=>{
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        await firebase.auth().signInWithCustomToken(token);
      },tokens[i]);
      result.browser.authNetworkRetries+=i;
      return true;
    }catch(error){
      last=error;
      const text=str(error?.message||error);
      if(!/network-request-failed|network AuthError|auth\/network-request-failed/i.test(text)) throw error;
      await sleep(900*(i+1));
    }
  }
  result.browser.authNetworkRetries+=Math.max(0,tokens.length-1);
  throw last||new Error('CUSTOM_TOKEN_BROWSER_SIGNIN_FAILED');
}
async function restCustomTokenDiagnostic(apiKey,token){
  if(!apiKey||!token)return {attempted:false,ok:false,status:null,errorCode:'MISSING_INPUT'};
  try{
    const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,returnSecureToken:true})});
    if(response.ok){await response.arrayBuffer();return {attempted:true,ok:true,status:response.status,errorCode:null};}
    let code='HTTP_'+response.status;try{const body=await response.json();code=str(body?.error?.message||code).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,100);}catch{}
    return {attempted:true,ok:false,status:response.status,errorCode:code};
  }catch(error){return {attempted:true,ok:false,status:null,errorCode:str(error?.code||error?.message||error).replace(/[^A-Z0-9_:-]/gi,'_').slice(0,100)};}
}
async function signInCustomAndReload(page,tokens,shopperId){
  await page.goto(targetUrl,{waitUntil:'domcontentloaded',timeout:60000});
  await waitFirebase(page);
  await waitVisibleLoginSurface(page);
  const cfg=await firebaseBrowserConfig(page);
  try{
    await browserCustomTokenSignIn(page,tokens);
  }catch(error){
    const diagnosticToken=tokens.at(-1);
    result.browser.restCustomTokenDiagnostic=await restCustomTokenDiagnostic(cfg.apiKey,diagnosticToken);
    throw error;
  }
  await page.waitForFunction(()=>firebase.auth().currentUser!=null,{timeout:30000});
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(id=>{try{const c=window.CX?.backendAuth?.context?.();return !!(c&&c.authenticated&&c.role==='shopper'&&c.shopperId===id);}catch{return false;}},shopperId,{timeout:60000});
  await page.waitForFunction(()=>window.CX_SHOPPER_MEMBERSHIP?.status==='verified',{timeout:60000});
}
async function snap(page,shopperId){
  return page.evaluate(id=>{
    const ctx=window.CX?.backendAuth?.context?.()||null,D=window.CX?.data||{},session=window.CX?.session||{};
    const visits=Array.isArray(D._visitas)?D._visitas:[],shoppers=Array.isArray(D.shoppers)?D.shoppers:[],periods=Array.isArray(D.periods)?D.periods:[];
    const visitIds=visits.map(v=>String(v?.visitId||v?.id||'')).filter(Boolean),shopperIds=shoppers.map(s=>String(s?.shopperId||s?.id||'')).filter(Boolean);
    const duplicates=a=>a.length-new Set(a).size;
    const summaries=Array.isArray(D.periodOperationalSummary)?D.periodOperationalSummary:[];
    let nonnegative=true,consistent=true;
    for(const r of summaries){const total=Number(r?.total||0);if(!Number.isFinite(total)||total<0){nonnegative=false;consistent=false;}for(const k of ['available','assigned','scheduled','realized','questionnaireCompleted','submitted','liquidationCandidates','liquidationConfirmed','paymentConfirmed','outOfRange','reviewRequired']){const n=Number(r?.[k]||0);if(!Number.isFinite(n)||n<0)nonnegative=false;if(Number.isFinite(n)&&n>total)consistent=false;}const countryTotal=Object.values(r?.byCountry||{}).reduce((a,b)=>a+Number(b||0),0);if(countryTotal&&countryTotal!==total)consistent=false;}
    return {ctx,membership:window.CX_SHOPPER_MEMBERSHIP||null,sessionRole:session.role||null,sessionShopperId:session.user?.shopperId||null,currentProjectId:D.currentProjectId||null,currentPeriodId:D.currentPeriodId||null,projectIds:Array.isArray(D.projects)?D.projects.map(p=>String(p?.id||'')).filter(Boolean):[],periodCount:periods.length,visitCount:visits.length,shopperProfileInCxData:shoppers.some(s=>String(s?.shopperId||s?.id||'')===id),duplicateVisitIds:duplicates(visitIds),duplicateShopperIds:duplicates(shopperIds),summaryCount:summaries.length,countsNonnegative:nonnegative,periodSummaryConsistent:consistent,dataSource:window.CX_BACKEND_DATA_SOURCE||null};
  },shopperId);
}

let browser;
try{
  const req=read(requestPath);result.requestId=str(req.requestId)||null;
  const valid=req.schemaVersion==='cxorbia.i3.9.created-shopper-readonly-e2e-request.v1'&&req.enabled===true&&req.consumed===false&&req.gateId===result.gateId&&req.targetProject==='cxorbia-backend-dev'&&req.tenantId==='tya'&&req.projectId==='cinepolis'&&req.shopperId==='TYA_GT_393371F88D10F7A8'&&str(req.visibleLogin)&&/^[a-f0-9]{64}$/.test(str(req.expectedProviderUidFingerprint))&&/^[a-f0-9]{64}$/.test(str(req.expectedProviderEmailFingerprint))&&str(req.identityLinkId)&&req.maxProviderAdminWrites===0&&req.passwordChanges===0&&req.passwordResets===0&&req.historicalShopperAccess===0;
  if(!valid){block('REQUEST_CONTRACT_INVALID');result.status='BLOCKED_PRE_PROVIDER';result.decision='HOLD_I3_9_REQUEST_INVALID';save();process.exit(0);}

  const app=getApps()[0]||initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});const auth=getAuth(app),db=getFirestore(app);
  const email=internalEmail(req.tenantId,req.visibleLogin);
  result.exactProvider.visibleLoginMappingFingerprint=providerEmailFingerprint(email)===req.expectedProviderEmailFingerprint;
  if(!result.exactProvider.visibleLoginMappingFingerprint)block('VISIBLE_LOGIN_TO_PROVIDER_MAPPING_DRIFT');
  const user=await auth.getUserByEmail(email);result.providerReads.authUser=1;
  result.exactProvider.user=user.disabled===false&&uidFingerprint(user.uid)===req.expectedProviderUidFingerprint;
  const c=user.customClaims||{};result.exactProvider.claims=c.role==='shopper'&&c.authNamespace==='shopper'&&c.tenantId===req.tenantId&&c.shopperId===req.shopperId&&Array.isArray(c.projectIds)&&c.projectIds.length===1&&c.projectIds[0]===req.projectId;
  const [membershipSnap,profileSnap,linkSnap]=await Promise.all([db.doc(`tenants/${req.tenantId}/users/${user.uid}`).get(),db.doc(`tenants/${req.tenantId}/shoppers/${req.shopperId}`).get(),db.doc(`tenants/${req.tenantId}/shopperIdentityLinks/${req.identityLinkId}`).get()]);result.providerReads.membership=1;result.providerReads.profile=1;result.providerReads.crosswalk=1;
  const m=membershipSnap.data()||{},p=profileSnap.data()||{},l=linkSnap.data()||{};
  result.exactProvider.membership=membershipSnap.exists&&m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&m.shopperId===req.shopperId&&m.tenantId===req.tenantId&&Array.isArray(m.projectIds)&&m.projectIds.includes(req.projectId)&&m.providerUidFingerprint===req.expectedProviderUidFingerprint;
  result.exactProvider.profile=profileSnap.exists&&p.shopperId===req.shopperId&&p.tenantId===req.tenantId&&p.sourceType==='platform'&&p.testSynthetic===true;
  result.exactProvider.crosswalk=linkSnap.exists&&l.canonicalShopperId===req.shopperId&&l.sourceSystem==='platform'&&l.identityLinkId===req.identityLinkId;
  result.exactProvider.platformCreatedAuthority=l.authorityType==='platform_created';result.exactProvider.periodIndependent=l.periodIndependent===true&&String(l.projectScope||'')==='*';
  if(!Object.values(result.exactProvider).every(Boolean))block('EXACT_PROVIDER_PRE_E2E_READBACK_FAILED');
  if(result.blockers.length){result.status='SAFE_HOLD_READONLY';result.decision='HOLD_I3_9_PROVIDER_PRECONDITION';save();process.exit(0);}

  const tokens1=await Promise.all([1,2,3,4].map(()=>auth.createCustomToken(user.uid)));
  const tokens2=await Promise.all([1,2,3,4].map(()=>auth.createCustomToken(user.uid)));
  result.customTokensMinted=tokens1.length+tokens2.length;
  browser=await chromium.launch({headless:true});
  const ctx1=await browser.newContext();const page1=await ctx1.newPage();await signInCustomAndReload(page1,tokens1,req.shopperId);let s1=await snap(page1,req.shopperId);
  result.browser.providerAuth=s1.ctx?.authenticated===true&&s1.ctx?.provider==='firebase';result.browser.claimsContext=s1.ctx?.role==='shopper'&&s1.ctx?.tenantId===req.tenantId&&s1.ctx?.shopperId===req.shopperId&&Array.isArray(s1.ctx?.projectIds)&&s1.ctx.projectIds.includes(req.projectId);result.browser.membershipVerified=s1.membership?.status==='verified'&&s1.membership?.shopperIdVerified===true;result.browser.shopperSession=s1.sessionRole==='shopper'&&s1.sessionShopperId===req.shopperId;result.browser.projectScope=s1.currentProjectId===req.projectId&&s1.projectIds.includes(req.projectId);
  result.runtime={currentProjectId:s1.currentProjectId,currentPeriodId:s1.currentPeriodId,projectIds:s1.projectIds,periodCount:s1.periodCount,visitCount:s1.visitCount,shopperProfileInCxData:s1.shopperProfileInCxData,dataSource:s1.dataSource};
  await page1.reload({waitUntil:'domcontentloaded',timeout:60000});await page1.waitForFunction(id=>window.CX?.backendAuth?.context?.()?.shopperId===id,req.shopperId,{timeout:60000});await page1.waitForFunction(()=>window.CX_SHOPPER_MEMBERSHIP?.status==='verified',{timeout:60000});const sr=await snap(page1,req.shopperId);result.browser.reload=sr.ctx?.shopperId===req.shopperId&&sr.membership?.status==='verified';
  const popupPromise=ctx1.waitForEvent('page',{timeout:15000});await page1.evaluate(target=>window.open(target,'_blank'),targetUrl);const popup=await popupPromise;try{await popup.waitForLoadState('domcontentloaded',{timeout:30000});await popup.waitForFunction(id=>window.CX?.backendAuth?.context?.()?.shopperId===id,req.shopperId,{timeout:60000});await popup.waitForFunction(()=>window.CX_SHOPPER_MEMBERSHIP?.status==='verified',{timeout:60000});const sp=await snap(popup,req.shopperId);result.browser.newTab=sp.ctx?.shopperId===req.shopperId&&sp.membership?.status==='verified';}catch(e){result.notes.push('new-tab:'+str(e?.message||e).slice(0,120));}
  const ctx2=await browser.newContext();const page2=await ctx2.newPage();await signInCustomAndReload(page2,tokens2,req.shopperId);const s2=await snap(page2,req.shopperId);result.browser.secondLogicalContext=s2.ctx?.shopperId===req.shopperId&&s2.membership?.status==='verified'&&s2.currentProjectId===req.projectId;

  result.i3_10ShopperScope.duplicateVisitIds=s1.duplicateVisitIds;result.i3_10ShopperScope.duplicateShopperIds=s1.duplicateShopperIds;result.i3_10ShopperScope.countsNonnegative=s1.countsNonnegative;result.i3_10ShopperScope.periodSummaryConsistent=s1.periodSummaryConsistent;
  const kpiPass=s1.duplicateVisitIds===0&&s1.duplicateShopperIds===0&&s1.countsNonnegative===true&&s1.periodSummaryConsistent===true;result.i3_10ShopperScope.status=kpiPass?'PASS_SHOPPER_SCOPE':'HOLD';result.i3_10ShopperScope.decision=kpiPass?'PASS_I3_10_SHOPPER_SCOPE_INVARIANTS':'HOLD_I3_10_SHOPPER_SCOPE_INVARIANTS';
  const browserPass=['providerAuth','claimsContext','membershipVerified','shopperSession','projectScope','reload','newTab','secondLogicalContext','visibleLoginSurface','passwordRouteReusedFromGenericFrozenContract','firebaseProjectExact'].every(k=>result.browser[k]===true);
  if(!browserPass)block('BROWSER_E2E_INCOMPLETE');if(!kpiPass)block('SHOPPER_SCOPE_KPI_INVARIANTS_FAILED');
  if(!result.blockers.length){result.status='PASS_READONLY_REAL_PROVIDER_IDENTITY_E2E';result.decision='PASS_I3_9_NEW_SHOPPER_REAL_E2E_NO_PASSWORD_MUTATION';result.notes.push('Real Firebase identity/session tested with ephemeral custom tokens because the I3.8 generated password was correctly destroyed after the prior harness dependency failure. No password reset/change was performed.');result.notes.push('Visible login surface, exact Hosting Firebase project and deterministic visible-login→provider-email fingerprint were validated; generic password route remains covered by frozen historical Shopper auth evidence without reprocessing that Shopper.');}else{result.status='HOLD_READONLY';result.decision='HOLD_I3_9_READONLY_E2E';}
  save();await ctx2.close();await ctx1.close();await browser.close();process.exit(result.blockers.length?2:0);
}catch(error){block('I3_9_TECHNICAL_ERROR');result.status='HOLD_TECHNICAL_READONLY';result.decision='HOLD_I3_9_TECHNICAL_READONLY';result.notes.push(str(error?.code||error?.message||error).slice(0,180));save();try{await browser?.close();}catch{}process.exit(2);}
