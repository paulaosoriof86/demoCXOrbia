#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya';
const PROJ=process.env.PROJECT_ID||'cinepolis';
const ROOT=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=process.env.VRM083_OUT||'.tmp/i3-vrm083';
const TARGET_UID=process.env.VRM083_TARGET_UID||'cxorbia-dev-shopper-eval01';
const SOURCE_DIR=process.env.VRM083_SOURCE_DIR||process.cwd();
const PRE='YES_PAULA_20260628_PREVIEW_DEV',PROT='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const str=v=>String(v??'').trim();
fs.mkdirSync(OUT,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const db=getFirestore(),auth=getAuth();
const tenant=db.collection('tenants').doc(TENANT);
const memberSnap=await tenant.collection('users').doc(TARGET_UID).get();
if(!memberSnap.exists)throw new Error('AUTH_FAILURE:VRM083_TARGET_MEMBERSHIP_MISSING');
const member=memberSnap.data()||{};
const authUser=await auth.getUser(TARGET_UID);
const claims=authUser.customClaims||{};
const identityState={
  auth:{role:str(claims.role),authNamespace:str(claims.authNamespace),tenantId:str(claims.tenantId),shopperId:str(claims.shopperId),projectIds:Array.isArray(claims.projectIds)?claims.projectIds.map(String):[],disabled:authUser.disabled===true},
  membership:{role:str(member.role),authNamespace:str(member.authNamespace),tenantId:str(member.tenantId),shopperId:str(member.shopperId),projectIds:Array.isArray(member.projectIds)?member.projectIds.map(String):[],active:member.active===true,status:str(member.status||'active')},
  mismatches:{role:str(member.role)!==str(claims.role),authNamespace:str(member.authNamespace)!==str(claims.authNamespace),tenantId:str(member.tenantId)!==str(claims.tenantId),shopperId:str(member.shopperId)!==str(claims.shopperId)}
};
const shopperId=str(member.shopperId);
if(!shopperId)throw new Error('AUTH_FAILURE:VRM083_TARGET_SHOPPER_ID_MISSING');
const profileSnap=await tenant.collection('shoppers').doc(shopperId).get();
if(!profileSnap.exists)throw new Error('AUTH_FAILURE:VRM083_TARGET_PROFILE_MISSING');
const profile={id:profileSnap.id,...(profileSnap.data()||{})};
const credMod=await import(pathToFileURL(path.join(SOURCE_DIR,'backend/runtime/cxorbia-shopper-command-provider-v1.mjs')).href);
const credential=credMod.shopperCredentialRule(profile);
if(!credential?.ok)throw new Error('AUTH_FAILURE:VRM083_TARGET_CREDENTIAL_NOT_DERIVABLE:'+str(credential?.reason));

const direct=async url=>{
 const r=await fetch(url,{headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
 const j=await r.json().catch(()=>null);
 return {url,status:r.status,headerRevision:r.headers.get('x-cxorbia-source-revision'),bodyRevision:str(j?._runtime?.revision||j?.revision||j?.sourceRevision),cacheOrigin:r.headers.get('x-cxorbia-cache-origin'),ok:r.ok,error:str(j?.error),message:str(j?.message),refreshError:j?.refreshError??j?._runtime?.refreshError??null,refreshStartedAt:j?.refreshStartedAt??j?._runtime?.refreshStartedAt??null,refreshFinishedAt:j?.refreshFinishedAt??j?._runtime?.refreshFinishedAt??null,cacheAgeMs:j?.cacheAgeMs??j?._runtime?.cacheAgeMs??null,cacheMs:j?.cacheMs??j?._runtime?.cacheMs??null};
};
const legacyMeta=await direct(ROOT+'/api/'+TENANT+'/'+PROJ+'/hr-live?format=meta&vrm083='+Date.now());
const genericMeta=await direct(ROOT+'/api/tenants/'+TENANT+'/projects/'+PROJ+'/hr-live?format=meta&vrm083='+Date.now());
const metaSeries=[];
for(let i=0;i<12;i++){
  const route=i%2===0?'/api/'+TENANT+'/'+PROJ+'/hr-live':'/api/tenants/'+TENANT+'/projects/'+PROJ+'/hr-live';
  metaSeries.push(await direct(ROOT+route+'?format=meta&vrm083series='+Date.now()+'&i='+i));
  await sleep(250);
}

const base=ROOT+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:PRE,cxProjectId:PROJ,cxProtectedRuntime:PROT,cxHumanFullVisual:FULL});
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await ctx.newPage();
const responses=[];
page.on('response',async r=>{
 const u=r.url();
 if(!u.includes('/hr-live'))return;
 let bodyRevision='';
 try{const j=await r.json();bodyRevision=str(j?._runtime?.revision||j?.revision||j?.sourceRevision);}catch{}
 let bodyError='',bodyMessage='';try{const j=await r.json();bodyRevision=str(j?._runtime?.revision||j?.revision||j?.sourceRevision);bodyError=str(j?.error);bodyMessage=str(j?.message);}catch{} responses.push({at:new Date().toISOString(),url:u,status:r.status(),headerRevision:r.headers()['x-cxorbia-source-revision']||'',cacheOrigin:r.headers()['x-cxorbia-cache-origin']||'',bodyRevision,bodyError,bodyMessage});
});
await page.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
await page.waitForFunction(()=>typeof window.CX?.backendAuth?.selectedRole==='function'&&!!document.querySelector('.role-btn[data-role="shopper"]'),null,{timeout:90000});
await page.locator('.role-btn[data-role="shopper"]').click();
await page.locator('#lgUser').fill(credential.login);
await page.locator('#lgPass').fill(credential.password);
await page.locator('#lgSubmit').click();

const samples=[];
for(let i=0;i<15;i++){
 const s=await page.evaluate(()=>{const c=window.CX?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},b=window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||{};return{
  at:new Date().toISOString(),
  uid:String(window.firebase?.auth?.().currentUser?.uid||''),
  contextAuthenticated:c.authenticated===true,contextRole:String(c.role||''),contextShopperId:String(c.shopperId||''),
  authorityApplied:a.applied===true,authorityError:String(a.error||''),authorityHrVisits:Number(a.hrVisits??-1),authorityAttempts:Number(a.liveHrFetchAttempt??-1),
  bootReady:b.ready===true,bootCompleted:b.completed===true,bootAttempts:Number(b.attempts??-1),bootReason:String(b.reason||''),bootLastAuthorityError:String(b.lastAuthorityError||''),
  liveMetaRevision:String(window.CX_TYA_HR_LIVE_META?.revision||''),
  previewRevision:String(window.CX?.data?.previewMeta?.sourceRevision||''),
  sourceRef:String(window.CX?.dataSource?.sourceRef||''),sourceMode:String(window.CX?.data?.sourceMode||''),
  visits:Number(window.CX?.data?._visitas?.length||0),shoppers:Number(window.CX?.data?.shoppers?.length||0)
 };});
 samples.push(s);
 if(s.contextAuthenticated&&s.authorityApplied&&s.liveMetaRevision&&s.previewRevision){await sleep(5000);break;}
 await sleep(2000);
}
const token=await page.evaluate(async()=>window.firebase?.auth?.().currentUser?await window.firebase.auth().currentUser.getIdToken(false):'');
let protectedFetch=null;
if(token){
 protectedFetch=await page.evaluate(async({TENANT,PROJ,token})=>{
  const u='/api/tenants/'+encodeURIComponent(TENANT)+'/projects/'+encodeURIComponent(PROJ)+'/hr-live?format=json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV&protectedState=1&vrm083='+Date.now();
  const r=await fetch(u,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache','Authorization':'Bearer '+token}});
  const j=await r.json().catch(()=>null);
  return {status:r.status,headerRevision:r.headers.get('x-cxorbia-source-revision'),cacheOrigin:r.headers.get('x-cxorbia-cache-origin'),bodyRevision:String(j?._runtime?.revision||j?.revision||j?.sourceRevision||''),visits:Number(j?.snapshot?.visits?.length||0),shoppers:Number(j?.snapshot?.shoppers?.length||0),ok:r.ok,error:String(j?.error||''),message:String(j?.message||''),lastRefreshError:j?.lastRefreshError??j?._runtime?.lastRefreshError??null};
 },{TENANT,PROJ,token});
}
await page.screenshot({path:path.join(OUT,'shopper-boot.png'),fullPage:true});
const final=samples.at(-1)||{};
const providerRevisions=[legacyMeta.bodyRevision,genericMeta.bodyRevision,protectedFetch?.bodyRevision].filter(Boolean);
const providerCoherent=providerRevisions.length>=2&&new Set(providerRevisions).size===1;
const browserCoherent=!!final.liveMetaRevision&&!!final.previewRevision&&final.liveMetaRevision===final.previewRevision;
const browserMatchesProvider=providerRevisions.length>0&&final.liveMetaRevision===providerRevisions[0]&&final.previewRevision===providerRevisions[0];
const decision=providerCoherent&&browserCoherent&&browserMatchesProvider&&final.authorityApplied?'PASS_VRM083_HR_BROWSER_REVISION_COHERENCE':'HOLD_VRM083_HR_BROWSER_REVISION_COHERENCE';
const result={decision,generatedAt:new Date().toISOString(),target:{uid:TARGET_UID,shopperId,login:credential.login},identityState,legacyMeta,genericMeta,metaSeries,protectedFetch,responses,samples,final,analysis:{providerCoherent,browserCoherent,browserMatchesProvider,metaSeriesRevisions:[...new Set(metaSeries.map(x=>x.bodyRevision).filter(Boolean))],metaSeriesStatuses:[...new Set(metaSeries.map(x=>x.status))]},safety:{firestoreWrites:0,authWrites:0,hrWrites:0,deploys:0,production:false}};
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({decision,identityState,legacyMeta,genericMeta,metaSeries:metaSeries.map(x=>({status:x.status,bodyRevision:x.bodyRevision,cacheOrigin:x.cacheOrigin,refreshError:x.refreshError,refreshStartedAt:x.refreshStartedAt,refreshFinishedAt:x.refreshFinishedAt,cacheAgeMs:x.cacheAgeMs})),protectedFetch,final,analysis:result.analysis,safety:result.safety},null,2));
await ctx.close();await browser.close();
if(decision!=='PASS_VRM083_HR_BROWSER_REVISION_COHERENCE')process.exitCode=2;
