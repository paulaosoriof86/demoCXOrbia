#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate20';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const now=()=>new Date().toISOString();
const write=(n,v)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:20,generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate20-browser-visual.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const g19=JSON.parse(fs.readFileSync(path.join(OUT,'gate19-locked.json'),'utf8'));
ensure(g19.decision==='PASS_GATE19_SHOPPER_E2E_LINEAGE'&&g19.lockedEvidence===true&&g19.noProductDrift===true,'SOURCE_FAILURE',{blocker:'GATE20_REQUIRES_LOCKED_GATE19_PASS'});
const tenantId=str(g19.tenantId||'tya'),projectId=str(g19.projectId||'cinepolis');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(projectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE20_AUTHORIZED_ADMIN_MISSING'});
let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE20_PLAYWRIGHT_UNAVAILABLE'});}

const browser=await chromium.launch({headless:true});
const humanUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}`;
const technicalUrl=`${humanUrl}&cxTechnicalAuthE2E=${TECH}`;
const pageErrors=[],captures=[];

async function capture(page,file){await page.screenshot({path:path.join(OUT,file),fullPage:true});captures.push(file);}
async function loginCheck(kind,viewport){
  const ctx=await browser.newContext({viewport}),page=await ctx.newPage(),errs=[];
  page.on('pageerror',e=>{const x=str(e?.message||e).slice(0,500);errs.push(x);pageErrors.push(`${kind}:${x}`);});
  await page.goto(humanUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForSelector('#login',{state:'visible',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#login .role-btn[data-role]').length>=3,{timeout:30000});
  let m=await page.evaluate(()=>{const d=document.documentElement,b=document.body,e=window.CX_DEV_ENTRY_CANONICAL||{};return {roles:document.querySelectorAll('#login .role-btn[data-role]').length,user:!!document.querySelector('#lgUser'),pass:!!document.querySelector('#lgPass'),submit:!!document.querySelector('#lgSubmit'),technicalAuth:e.technicalAuth===true,single:e.singleVisibleProductLogin===true,overflowX:Math.max(0,Math.max(d.scrollWidth,b.scrollWidth)-innerWidth)};});
  if(!m.user||!m.pass||!m.submit){await page.locator('#login .role-btn[data-role]').first().click();await page.waitForSelector('#lgUser',{state:'visible',timeout:10000});await page.waitForSelector('#lgPass',{state:'visible',timeout:10000});await page.waitForSelector('#lgSubmit',{state:'visible',timeout:10000});m=await page.evaluate(()=>{const d=document.documentElement,b=document.body,e=window.CX_DEV_ENTRY_CANONICAL||{};return {roles:document.querySelectorAll('#login .role-btn[data-role]').length,user:!!document.querySelector('#lgUser'),pass:!!document.querySelector('#lgPass'),submit:!!document.querySelector('#lgSubmit'),technicalAuth:e.technicalAuth===true,single:e.singleVisibleProductLogin===true,overflowX:Math.max(0,Math.max(d.scrollWidth,b.scrollWidth)-innerWidth)};});}
  await capture(page,`gate20-${kind}.png`);
  ensure(m.roles>=3&&m.user&&m.pass&&m.submit&&m.single&&m.technicalAuth===false&&m.overflowX<=16&&errs.length===0,'VISUAL_DEFECT',{blocker:'GATE20_HUMAN_LOGIN_VISUAL_INVALID',kind,metrics:m,pageErrors:errs});
  await ctx.close();
}
async function authenticate(page,token){
  await page.goto(technicalUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(t);},token);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||arr(c.projectIds).map(String).includes(projectId))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,projectId},{timeout:120000});
}
async function routeCheck(page,kind,route,expected){
  await page.evaluate(r=>window.CX.router.nav(r),route);
  await page.waitForFunction(x=>String(document.body.innerText||'').includes(x),expected,{timeout:30000});
  await page.waitForSelector('#view',{state:'visible',timeout:30000});
  await page.waitForTimeout(250);
  const m=await page.evaluate(()=>{const d=document.documentElement,b=document.body,v=document.querySelector('#view')||document.querySelector('main.content'),r=v?.getBoundingClientRect()||{width:0,height:0,bottom:0,top:0};const visibleModals=[...document.querySelectorAll('.cx-modal')].filter(x=>{const s=getComputedStyle(x),q=x.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&q.width>0&&q.height>0;}).length;return {viewVisible:r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight,overflowX:Math.max(0,Math.max(d.scrollWidth,b.scrollWidth)-innerWidth),visibleModals,tenant:d.getAttribute('data-cx-tenant'),project:d.getAttribute('data-cx-project'),source:d.getAttribute('data-cx-source'),revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,bodyTextLength:String(b.innerText||'').trim().length};});
  await capture(page,`gate20-${kind}-${route}.png`);
  ensure(m.viewVisible&&m.bodyTextLength>100&&m.visibleModals===0&&m.tenant===tenantId&&m.project===projectId&&m.source==='hr-live'&&/^[a-f0-9]{64}$/.test(m.revision)&&m.authority,'VISUAL_DEFECT',{blocker:'GATE20_ROUTE_VISUAL_STRUCTURE_INVALID',kind,route,metrics:m});
  ensure(m.overflowX<=(kind==='mobile'?24:16),'VISUAL_DEFECT',{blocker:'GATE20_GLOBAL_HORIZONTAL_OVERFLOW',kind,route,metrics:m});
  return m.overflowX;
}

let maxOverflowX=0;
try{
  await loginCheck('login-desktop',{width:1440,height:1000});
  await loginCheck('login-mobile',{width:390,height:844});
  {const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();page.on('pageerror',e=>pageErrors.push(`desktop:${str(e?.message||e).slice(0,500)}`));await authenticate(page,await auth.createCustomToken(staff.id));for(const [r,e] of [['dashboard','Dashboard'],['visitas','Visitas'],['postulaciones','Gestión de Postulaciones'],['shoppers','Shoppers / Auditores']])maxOverflowX=Math.max(maxOverflowX,await routeCheck(page,'desktop',r,e));await ctx.close();}
  {const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await ctx.newPage();page.on('pageerror',e=>pageErrors.push(`mobile:${str(e?.message||e).slice(0,500)}`));await authenticate(page,await auth.createCustomToken(staff.id));for(const [r,e] of [['dashboard','Dashboard'],['visitas','Visitas'],['shoppers','Shoppers / Auditores']])maxOverflowX=Math.max(maxOverflowX,await routeCheck(page,'mobile',r,e));await ctx.close();}
}finally{await browser.close();}
ensure(pageErrors.length===0,'VISUAL_DEFECT',{blocker:'GATE20_BROWSER_PAGE_ERRORS',pageErrors});
ensure(captures.length===9,'VISUAL_DEFECT',{blocker:'GATE20_CAPTURE_COUNT_INVALID',captureCount:captures.length});
finish('PASS_GATE20_BROWSER_VISUAL',{sourceSha:process.env.SOURCE_SHA||null,lockedGate19RunId:Number(g19.lockedRunId)||null,tenantId,projectId,periodId:str(g19.periodId),loginDesktop:true,loginMobile:true,adminDesktopRoutes:['dashboard','visitas','postulaciones','shoppers'],adminMobileRoutes:['dashboard','visitas','shoppers'],screenshots:captures,captureCount:captures.length,maxOverflowX,pageErrors,domMarkersExact:true,hrAuthorityApplied:true,blockingUnexpectedModal:false,shopperVisualContinuityFromGate19:true,humanLegalAcceptanceReexecuted:false,legalAcceptanceBypass:false},0);
