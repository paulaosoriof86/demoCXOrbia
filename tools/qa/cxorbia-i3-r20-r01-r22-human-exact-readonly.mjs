#!/usr/bin/env node
/* I3 human P0 focal: exact Auth + HR + WhatsApp + notification READ ONLY. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
const OUT=String(process.env.PHASEA_LIVE_OUT||'.tmp/phasea-representative-live');
const REV=String(process.env.EXPECTED_HR_REVISION||'');
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PROJECT='cxorbia-backend-dev',TENANT='tya',PROGRAM='cinepolis';
const str=v=>String(v??'').trim(),norm=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),arr=v=>Array.isArray(v)?v:[],sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex'),fp=v=>v?sha(v).slice(0,18):null;
const receipt={schemaVersion:'cxorbia.i3.r20-r01-r22.human-exact-live-readonly.v1',decision:'HOLD',revisionExpected:REV,source:'FIREBASE_AUTH_FIRESTORE_HR_SAME_REVISION',writes:0,hrWrites:0,authWrites:0,production:false,stiven:{},whatsapp:{},notifications:{}};
fs.mkdirSync(OUT,{recursive:true});
const save=()=>fs.writeFileSync(OUT+'/r20-r01-r22-focal-readonly.json',JSON.stringify(receipt,null,2)+'\n');
save();
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT);
const [metaResponse,hrResponse,users,profiles,crosswalk,bulletins,reads]=await Promise.all([
 fetch(HOST+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=meta&r20='+Date.now(),{headers:{'cache-control':'no-cache'}}),
 fetch(HOST+'/api/'+TENANT+'/'+PROGRAM+'/hr-live?format=json&view=operational-names&r20='+Date.now(),{headers:{'cache-control':'no-cache'}}),
 tenant.collection('users').get(),tenant.collection('shoppers').get(),tenant.collection('shopperIdentityCrosswalk').get(),tenant.collection('bulletins').get(),tenant.collection('bulletinReads').get()
]);
if(!metaResponse.ok||!hrResponse.ok)throw Error('PROVIDER_FAILURE:R20_FOCAL_HR_HTTP');
const meta=await metaResponse.json(),body=await hrResponse.json(),hr=body.snapshot||body.data||body,revision=str(meta.revision||hr.sourceRevision);
if(revision!==REV)throw Error('SOURCE_FAILURE:R20_FOCAL_HR_REVISION_MISMATCH');
const members=users.docs.map(doc=>({id:doc.id,...doc.data()})),local=profiles.docs.map(doc=>({id:doc.id,...doc.data()})),cr=crosswalk.docs.map(doc=>({id:doc.id,...doc.data()}));
const hrShoppers=arr(hr.shoppers),hrVisits=arr(hr.visits);
const profileMap=new Map(local.map(p=>[p.id,p]));
const full=(v)=>{const a=str(v);return /^\+?[\d ().-]+$/.test(a)&&/^[1-9]\d{8,14}$/.test(a.replace(/\D/g,''));};
const phones=row=>{const fields=['whatsapp','phone','telefono','shopperWa'];const a=fields.map(k=>str(row?.[k])).filter(Boolean);return {fieldCount:a.length,validInternational:a.filter(full).length,localEightDigit:a.filter(v=>/^\d{8}$/.test(v.replace(/\D/g,''))).length,maskedOrOther:a.filter(v=>!full(v)&&!/^\d{8}$/.test(v.replace(/\D/g,''))).length};};
const exactCandidates=members.filter(m=>['stiven.lopez'].includes(norm(m.visibleLogin||m.username||m.user||m.login))&&norm(m.role)==='shopper');
const byLoginEmail=sha(TENANT+'\0shopper\0stiven.lopez').slice(0,48)+'@auth.cxorbia.invalid';
let basePrincipal=null;try{basePrincipal=await auth.getUserByEmail(byLoginEmail);}catch(e){if(str(e?.code)!=='auth/user-not-found')throw e;}
const authReviews=[];for(const m of exactCandidates){const p=profileMap.get(str(m.shopperId));let u=null;try{u=await auth.getUser(m.id);}catch(e){if(str(e?.code)!=='auth/user-not-found')throw e;}
 const cc=u?.customClaims||{},aliases=new Set([m.shopperId,p?.legacyShopperId,p?.sourceShopperId,...arr(p?.sourceShopperIds),...arr(p?.legacyLiveShopperIds)].map(str).filter(Boolean));
 const matchingCross=cr.filter(x=>aliases.has(str(x.id||x.sourceStableKey))||str(x.shopperId)===str(m.shopperId));
 const hrMatches=hrShoppers.filter(x=>aliases.has(str(x.id||x.shopperId)));
 const ownVisits=hrVisits.filter(x=>aliases.has(str(x.shopperId||x.assignedShopperId)));
 authReviews.push({principalFingerprint:fp(m.id),active:m.active===true,disabled:u?.disabled===true,authExists:!!u,role:norm(m.role),namespace:norm(m.authNamespace),claimMatch:!!u&&str(cc.tenantId)===TENANT&&norm(cc.role)==='shopper'&&norm(cc.authNamespace)==='shopper'&&str(cc.shopperId)===str(m.shopperId)&&arr(cc.projectIds).map(str).includes(PROGRAM),membershipScope:arr(m.projectIds).map(str).includes(PROGRAM),shopperFingerprint:fp(m.shopperId),profileExists:!!p,profileCountry:!!str(p?.pais||p?.country),hrDirectMatch:hrMatches.length,matchingCrosswalk:matchingCross.length,hrAssignedVisits:ownVisits.length,profileContact:phones(p)});
}
receipt.stiven={visibleLogin:'stiven.lopez',membershipCandidates:exactCandidates.length,authByLoginExists:!!basePrincipal,authByLoginFingerprint:fp(basePrincipal?.uid),authCandidates:authReviews};
const waHr=hrVisits.filter(v=>norm(v.sucursal).includes('miraflores')||norm(v.sucursal).includes('oakland'));
const waSamples=waHr.slice(0,12).map(v=>{const id=str(v.shopperId),hrp=hrShoppers.find(x=>str(x.id||x.shopperId)===id),pr=profileMap.get(id)||null;return {branchBucket:norm(v.sucursal).includes('miraflores')?'miraflores':'oakland',visitCountry:str(v.pais||v.country),shopperIdentityPresent:!!id,hrProfileExact:!!hrp,firestoreProfileExact:!!pr,visitPhone:phones(v),hrProfilePhone:phones(hrp),firestoreProfilePhone:phones(pr)};});
receipt.whatsapp={visitSamples:waSamples.length,rows:waSamples,disposition:'SOURCE_DIAGNOSTIC_ONLY_NO_PHONE_GUESSED'};

/* Exact Stiven DEV authority smoke. Auth token verifies protected session, NOT password entry. */
receipt.stiven.browser={decision:'NOT_RUN',credentialEntry:'NOT_TESTED'};
if(exactCandidates.length===1&&basePrincipal?.uid===exactCandidates[0].id&&authReviews[0]?.claimMatch===true){
 const {chromium}=await import('playwright'),browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1280,height:900}}),page=await ctx.newPage(),started=Date.now();
 let failureStage='initial_navigation';
 try{
  const url=HOST+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+PROGRAM+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&stivenProof='+Date.now();
  failureStage='initial_navigation';await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  failureStage='firebase_sdk_boot';await page.waitForFunction(()=>!!window.firebase?.auth&&window.firebase?.apps?.length>0,null,{timeout:60000});
  failureStage='service_account_custom_token';const token=await auth.createCustomToken(basePrincipal.uid);
  failureStage='client_custom_token_signin';await page.evaluate(async jwt=>{const f=window.firebase;try{await f.auth().setPersistence(f.auth.Auth.Persistence.LOCAL);}catch(e){throw new Error('CLIENT_FIREBASE_PERSISTENCE:'+String(e?.code||'UNKNOWN').replace(/[^a-z0-9/-]/gi,'').slice(0,70));}try{await f.auth().signInWithCustomToken(jwt);}catch(e){throw new Error('CLIENT_FIREBASE_TOKEN_SIGNIN:'+String(e?.code||'UNKNOWN').replace(/[^a-z0-9/-]/gi,'').slice(0,70));}},token);
  failureStage='session_blank_reentry';await page.goto('about:blank');
  failureStage='session_dev_reentry';await page.goto(url+'&session='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  failureStage='hr_authority_readiness';await page.waitForFunction(rev=>{
   const c=window.CX?.backendAuth?.context?.()||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};
   return c.authenticated===true&&c.role==='shopper'&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(window.CX?.data?.previewMeta?.sourceRevision||'')===rev;
  },REV,{timeout:65000});
  const state=await page.evaluate(()=>({role:String(window.CX?.backendAuth?.context?.()?.role||''),view:String(window.CX?.session?.view||''),gateReady:window.CX_C6_HR_AUTHORITY_GATE?.ready===true}));
  receipt.stiven.browser={decision:'PASS_EXACT_STIVEN_DEV_AUTHORITY',elapsedMs:Date.now()-started,...state,credentialEntry:'NOT_TESTED_CUSTOM_TOKEN_ONLY'};
 }catch(error){
  const state=await page.evaluate(()=>({gateReady:window.CX_C6_HR_AUTHORITY_GATE?.ready===true,blocked:window.CX_C6_HR_AUTHORITY_GATE?.blocked===true,reason:String(window.CX_C6_HR_AUTHORITY_GATE?.reason||''),bootExhausted:window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE?.exhausted===true})).catch(()=>({}));
  receipt.stiven.browser={decision:'HOLD_EXACT_STIVEN_DEV_AUTHORITY',elapsedMs:Date.now()-started,errorKind:String(error?.name||'ERROR').replace(/[^a-z_]/gi,'').slice(0,24),failureStage,safeAuthSdkCode:String(error?.message||'').match(/CLIENT_FIREBASE_(?:PERSISTENCE|TOKEN_SIGNIN):[a-z0-9/-]{2,75}/i)?.[0]||'NO_AUTH_SDK_CODE',safeErrorCategory:/timeout/i.test(String(error?.name||'')+' '+String(error?.message||''))?'TIMEOUT':/network|net::|navigation/i.test(String(error?.message||''))?'NETWORK_OR_NAVIGATION':/auth|token|credential|firebase/i.test(String(error?.message||''))?'AUTH_TOKEN_OR_SDK':'OTHER_ERROR',...state,credentialEntry:'NOT_TESTED_CUSTOM_TOKEN_ONLY'};
 }finally{await ctx.close().catch(()=>{});await browser.close().catch(()=>{});}
}else receipt.stiven.browser={decision:'HOLD_STIVEN_EXACT_AUTH_PRECONDITIONS',credentialEntry:'NOT_TESTED'};

const readsRows=reads.docs.map(doc=>doc.data()||{}),bullRows=bulletins.docs.map(doc=>({id:doc.id,...doc.data()}));
for(const [label,name] of [['priscila','priscila lopez'],['paula','paula osorio']]){
 const candidates=local.filter(p=>norm(p.nombre||p.displayName||[p.firstName,p.lastName].filter(Boolean).join(' '))===name);
 const ids=new Set(candidates.map(x=>str(x.id)));
 const principals=members.filter(u=>ids.has(str(u.shopperId))&&u.active===true&&norm(u.role)==='shopper');
 const bulletinRows=bullRows.filter(b=>arr(b.targetShopperIds).map(str).some(x=>ids.has(x)));
 receipt.notifications[label]={profileCount:candidates.length,memberCount:principals.length,targetedBulletinCount:bulletinRows.length,withExactEntity:bulletinRows.filter(b=>str(b.entityId)&&str(b.entityType)).length,withActionRoute:bulletinRows.filter(b=>str(b.actionRoute||b.nav)).length,withTechnicalVisitIdBody:bulletinRows.filter(b=>/hr_20\d{2}[-_]/i.test(str(b.body||b.text))).length,readReceipts:readsRows.filter(row=>principals.some(p=>str(row.userId)===p.id)&&bulletinRows.some(b=>b.id===str(row.bulletinId))).length};
}
receipt.decision=receipt.stiven.browser?.decision==='PASS_EXACT_STIVEN_DEV_AUTHORITY'?'PASS_R20_R01_R22_READ_ONLY_EXACT_DIAGNOSTIC':'HOLD_R20_EXACT_STIVEN_BROWSER_AUTHORITY';
save();
console.log(JSON.stringify(receipt,null,2));
if(receipt.decision!=='PASS_R20_R01_R22_READ_ONLY_EXACT_DIAGNOSTIC')throw new Error('AUTH_FAILURE:R20_STIVEN_BROWSER_'+String(receipt.stiven.browser?.failureStage||receipt.stiven.browser?.decision||'UNKNOWN'));
