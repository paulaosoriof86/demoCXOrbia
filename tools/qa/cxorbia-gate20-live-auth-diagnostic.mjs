#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate20';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT='tya', PROJECT_ID='cinepolis';
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const write=(n,v)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=(await db.collection('tenants').doc(TENANT).collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(PROJECT_ID)));
if(!staff){write('gate20-live-auth-diagnostic.json',{decision:'AUTH_FAILURE',blocker:'AUTHORIZED_ADMIN_MISSING',production:false,readOnly:true});process.exit(0);}

const token=await auth.createCustomToken(staff.id);
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true});
const url=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(PROJECT_ID)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
const pageErrors=[],consoleErrors=[];
let result={};

function classify(s,hr){
  if(!s.firebaseUser)return ['AUTH_FAILURE','FIREBASE_SESSION_NOT_RESTORED'];
  if(!s.auth.authenticated)return ['AUTH_FAILURE','BACKEND_AUTH_CONTEXT_NOT_AUTHENTICATED'];
  if(s.auth.tenantId!==TENANT||!['super','admin'].includes(s.auth.role)||(s.auth.role!=='super'&&!s.auth.projectIds.includes(PROJECT_ID)))return ['AUTH_FAILURE','BACKEND_AUTH_SCOPE_MISMATCH'];
  if(!hr.ok)return ['SOURCE_FAILURE',`HR_LIVE_HTTP_${hr.status}`];
  if(s.authority.applied)return ['PASS','AUTHORITY_APPLIED'];
  if(s.boot.authorized===true&&s.boot.protectedBackendReady===false)return ['PROVIDER_FAILURE','PROTECTED_BACKEND_READY_PREDICATE_FALSE'];
  if(s.boot.authorized===true&&s.boot.runtimeDependenciesReady===false)return ['RELEASE_COMPOSITION_FAILURE','RUNTIME_DEPENDENCIES_NOT_READY'];
  if(s.authority.error)return [/^HR_LIVE_/.test(s.authority.error)?'SOURCE_FAILURE':'PROVIDER_FAILURE',s.authority.error];
  return ['PROVIDER_FAILURE','AUTHORITY_NOT_APPLIED_UNCLASSIFIED'];
}

try{
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e).slice(0,500)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(str(m.text()).slice(0,500));});

  const snapshot=()=>page.evaluate(()=>{
    const c=window.CX?.backendAuth?.context?.()||{};
    const b=window.CX_BACKEND_LAST_STATE||{};
    const boot=window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||{};
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    return {
      firebaseUser:!!window.firebase?.auth?.()?.currentUser,
      auth:{authenticated:c.authenticated===true,provider:String(c.provider||''),role:String(c.role||''),authNamespace:String(c.authNamespace||''),tenantId:String(c.tenantId||''),projectIds:Array.isArray(c.projectIds)?c.projectIds.map(String):[]},
      backend:{source:String(b.source||window.CX_BACKEND_DATA_SOURCE||''),empty:b.empty??null,counts:b.counts||null,ready:b.ready??null,error:String(b.error||'')},
      boot:{ready:boot.ready??null,completed:boot.completed??null,exhausted:boot.exhausted??null,attempts:Number(boot.attempts||0),authorized:boot.authorized??null,protectedBackendReady:boot.protectedBackendReady??null,runtimeDependenciesReady:boot.runtimeDependenciesReady??null,lastAuthorityError:String(boot.lastAuthorityError||'')},
      authority:{applied:a.applied===true,error:String(a.error||''),retryable:a.retryable??null,periods:Number(a.periods||0),hrVisits:Number(a.hrVisits||0),hrShoppers:Number(a.hrShoppers||0),liveHrFetchAttempt:Number(a.liveHrFetchAttempt||0)},
      data:{currentProjectId:String(d.currentProjectId||''),currentPeriodId:String(d.currentPeriodId||''),sourceMode:String(d.sourceMode||''),previewProjectId:String(d.previewMeta?.projectId||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),visits:Array.isArray(d._visitas)?d._visitas.length:null,posts:Array.isArray(d._posts)?d._posts.length:null,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:null},
      dataSource:{status:String(ds.status||''),sourceRef:String(ds.sourceRef||''),blockers:Array.isArray(ds.blockers)?ds.blockers.map(String).slice(0,5):[]},
      dom:{tenant:document.documentElement.getAttribute('data-cx-tenant'),project:document.documentElement.getAttribute('data-cx-project'),source:document.documentElement.getAttribute('data-cx-source')}
    };
  });

  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  const before=await snapshot();
  let signIn={ok:false,error:null};
  try{
    signIn=await page.evaluate(async t=>{try{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);const r=await firebase.auth().signInWithCustomToken(t);return {ok:!!r?.user,error:null};}catch(e){return {ok:false,error:String(e?.code||e?.message||e)}};},token);
  }catch(e){signIn={ok:false,error:str(e?.message||e).slice(0,300)};}
  const afterSignIn=await snapshot();
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});

  const timeline=[];let previous='';
  for(let i=0;i<30;i++){
    const s=await snapshot();
    const key=JSON.stringify(s);
    if(key!==previous){timeline.push({second:i*2,state:s});previous=key;}
    if(s.authority.applied)break;
    await sleep(2000);
  }
  const final=await snapshot();
  const hr=await page.evaluate(async()=>{try{const r=await fetch('/api/tya/cinepolis/hr-live?format=json&fresh=1&ts='+Date.now(),{cache:'no-store'});const p=await r.json().catch(()=>null);const s=p&&(p.snapshot||p.data||p);return {ok:r.ok,status:r.status,sourceSafe:s?.sourceSafe===true,periods:Array.isArray(s?.periods)?s.periods.length:null,visits:Array.isArray(s?.visits)?s.visits.length:null,shoppers:Array.isArray(s?.shoppers)?s.shoppers.length:null,revision:String(p?._runtime?.revision||s?._runtime?.revision||'')};}catch(e){return {ok:false,status:0,error:String(e?.message||e)}};});
  await page.screenshot({path:path.join(OUT,'gate20-live-auth-diagnostic.png'),fullPage:true});
  const [decision,blocker]=classify(final,hr);
  result={decision,blocker,generatedAt:new Date().toISOString(),tenantId:TENANT,projectId:PROJECT_ID,signIn,before,afterSignIn,timeline,final,hr,pageErrors,consoleErrors,production:false,readOnly:true,providerWrites:0,hrWrites:0};
  await ctx.close();
} catch(e){
  result={decision:'ENVIRONMENT_FAILURE',blocker:'DIAGNOSTIC_EXECUTION_FAILED',error:str(e?.message||e).slice(0,500),pageErrors,consoleErrors,production:false,readOnly:true,providerWrites:0,hrWrites:0};
} finally {await browser.close();}
write('gate20-live-auth-diagnostic.json',result);
console.log(JSON.stringify({decision:result.decision,blocker:result.blocker,signInOk:result.signIn?.ok??null,final:result.final?{firebaseUser:result.final.firebaseUser,auth:result.final.auth,backend:result.final.backend,boot:result.final.boot,authority:result.final.authority,data:result.final.data,dataSource:result.final.dataSource,dom:result.final.dom}:null,hr:result.hr||null,pageErrorCount:pageErrors.length,consoleErrorCount:consoleErrors.length,production:false}));
