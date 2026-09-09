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
const baseUrl=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}&cxTechnicalAuthE2E=${TECH}`;
const allPageErrors=[];
const captures=[];

async function shellMetrics(page,label){
  return page.evaluate(label=>{
    const de=document.documentElement,b=document.body;
    const main=document.querySelector('#main,#content,.main,.content,main')||b;
    const r=main.getBoundingClientRect();
    const visibleModals=[...document.querySelectorAll('.cx-modal')].filter(el=>{const s=getComputedStyle(el);const q=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&q.width>0&&q.height>0;}).length;
    return {label,innerWidth:window.innerWidth,innerHeight:window.innerHeight,scrollWidth:Math.max(de.scrollWidth,b?.scrollWidth||0),overflowX:Math.max(0,Math.max(de.scrollWidth,b?.scrollWidth||0)-window.innerWidth),bodyTextLength:String(b?.innerText||'').trim().length,mainVisible:r.width>0&&r.height>0&&r.bottom>0&&r.top<window.innerHeight,visibleModals,tenant:de.getAttribute('data-cx-tenant'),project:de.getAttribute('data-cx-project'),source:de.getAttribute('data-cx-source'),revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true};
  },label);
}

async function authenticateAdmin(page,token){
  await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(t);},token);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId})=>{const c=window.CX?.backendAuth?.context?.()||{};return c.authenticated===true&&c.tenantId===tenantId&&['super','admin'].includes(String(c.role||''))&&(c.role==='super'||(Array.isArray(c.projectIds)&&c.projectIds.map(String).includes(projectId)))&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,projectId},{timeout:120000});
}

async function routeCapture(page,kind,route,expected){
  await page.evaluate(route=>window.CX.router.nav(route),route);
  await page.waitForFunction(expected=>String(document.body.innerText||'').includes(expected),expected,{timeout:30000});
  await page.waitForTimeout(250);
  const metrics=await shellMetrics(page,`${kind}:${route}`);
  const file=`gate20-${kind}-${route}.png`;
  await page.screenshot({path:path.join(OUT,file),fullPage:true});
  captures.push({file,...metrics});
  ensure(metrics.bodyTextLength>100&&metrics.mainVisible&&metrics.visibleModals===0&&metrics.tenant===tenantId&&metrics.project===projectId&&metrics.source==='hr-live'&&/^[a-f0-9]{64}$/.test(metrics.revision)&&metrics.authorityApplied===true,'VISUAL_DEFECT',{blocker:'GATE20_ROUTE_VISUAL_STRUCTURE_INVALID',route,kind,metrics});
  const limit=kind==='mobile'?24:16;
  ensure(metrics.overflowX<=limit,'VISUAL_DEFECT',{blocker:'GATE20_GLOBAL_HORIZONTAL_OVERFLOW',route,kind,overflowX:metrics.overflowX,limit,metrics});
}

try{
  // Fresh unauthenticated login shell, desktop and mobile.
  for(const cfg of [{kind:'login-desktop',viewport:{width:1440,height:1000}},{kind:'login-mobile',viewport:{width:390,height:844}}]){
    const ctx=await browser.newContext({viewport:cfg.viewport}),page=await ctx.newPage(),errs=[];
    page.on('pageerror',e=>{const msg=str(e?.message||e).slice(0,500);errs.push(msg);allPageErrors.push(`${cfg.kind}:${msg}`);});
    await page.goto(baseUrl,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForSelector('#login',{state:'visible',timeout:30000});
    const m=await page.evaluate(()=>{const login=document.querySelector('#login'),r=login?.getBoundingClientRect(),de=document.documentElement,b=document.body;return {loginVisible:!!login&&r.width>0&&r.height>0,hasRoleChoice:document.querySelectorAll('.lg2-role,.role-btn').length>0,hasInput:document.querySelectorAll('input').length>0,overflowX:Math.max(0,Math.max(de.scrollWidth,b?.scrollWidth||0)-window.innerWidth),width:window.innerWidth,height:window.innerHeight};});
    await page.screenshot({path:path.join(OUT,`gate20-${cfg.kind}.png`),fullPage:true});
    captures.push({file:`gate20-${cfg.kind}.png`,...m,pageErrors:errs});
    ensure(m.loginVisible&&m.hasRoleChoice&&m.hasInput&&m.overflowX<=16&&errs.length===0,'VISUAL_DEFECT',{blocker:'GATE20_LOGIN_VISUAL_INVALID',kind:cfg.kind,metrics:m,pageErrors:errs});
    await ctx.close();
  }

  // Desktop current Admin surfaces.
  {
    const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
    page.on('pageerror',e=>allPageErrors.push(`desktop:${str(e?.message||e).slice(0,500)}`));
    await authenticateAdmin(page,await auth.createCustomToken(staff.id));
    for(const [route,expected] of [['dashboard','Dashboard'],['visitas','Visitas'],['postulaciones','Gestión de Postulaciones'],['shoppers','Shoppers / Auditores']])await routeCapture(page,'desktop',route,expected);
    await ctx.close();
  }

  // Mobile current Admin surfaces: navigation is programmatic so the test evaluates rendered layout, not sidebar click mechanics.
  {
    const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await ctx.newPage();
    page.on('pageerror',e=>allPageErrors.push(`mobile:${str(e?.message||e).slice(0,500)}`));
    await authenticateAdmin(page,await auth.createCustomToken(staff.id));
    for(const [route,expected] of [['dashboard','Dashboard'],['visitas','Visitas'],['shoppers','Shoppers / Auditores']])await routeCapture(page,'mobile',route,expected);
    await ctx.close();
  }
}finally{await browser.close();}

ensure(allPageErrors.length===0,'VISUAL_DEFECT',{blocker:'GATE20_BROWSER_PAGE_ERRORS',pageErrors:allPageErrors});
finish('PASS_GATE20_BROWSER_VISUAL',{
  sourceSha:process.env.SOURCE_SHA||null,lockedGate19RunId:Number(g19.lockedRunId)||null,tenantId,projectId,periodId:str(g19.periodId),
  loginDesktop:true,loginMobile:true,adminDesktopRoutes:['dashboard','visitas','postulaciones','shoppers'],adminMobileRoutes:['dashboard','visitas','shoppers'],
  screenshots:captures.map(x=>x.file),captureCount:captures.length,maxOverflowX:Math.max(...captures.map(x=>Number(x.overflowX||0))),pageErrors:allPageErrors,
  domMarkersExact:true,hrAuthorityApplied:true,blockingUnexpectedModal:false,shopperVisualContinuityFromGate19:true,humanLegalAcceptanceReexecuted:false,legalAcceptanceBypass:false
},0);
