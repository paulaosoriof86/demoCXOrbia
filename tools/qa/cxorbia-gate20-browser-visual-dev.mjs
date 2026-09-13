#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-gate20-focal';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',TECH='YES_PAULA_20260801_REAL_USERS_E2E';
const str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const now=()=>new Date().toISOString();
const write=(n,v)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');};
function finish(decision,extra={},code=1){const out={decision,gate:20,mode:'FOCAL_VISUAL_DRIFT_REVALIDATION',generatedAt:now(),production:false,readOnly:true,providerWrites:0,hrWrites:0,localStorageTruth:false,...extra};write('gate20-browser-visual.json',out);console.log(decision);process.exit(code);}
const ensure=(ok,decision,extra={})=>{if(!ok)finish(decision,extra);};
async function allDocs(ref){const s=await ref.get();return s.docs.map(d=>({id:d.id,...(d.data()||{})}));}

const lock=JSON.parse(fs.readFileSync(path.join(OUT,'gate20-locked.json'),'utf8'));
ensure(lock.decision==='PASS_LOCKED_GATE20_BASELINE'&&lock.lockedEvidence===true,'SOURCE_FAILURE',{blocker:'GATE20_FOCAL_REQUIRES_LOCKED_GATE20_PASS'});
const tenantId=str(lock.tenantId||'tya'),projectId=str(lock.projectId||'cinepolis'),periodId=str(lock.periodId||'cinepolis-2026-09');
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const members=await allDocs(db.collection('tenants').doc(tenantId).collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(projectId)));
ensure(staff,'AUTH_FAILURE',{blocker:'GATE20_FOCAL_ADMIN_MISSING'});
let shopper=null;
for(const m of members.filter(x=>x.active===true&&str(x.authNamespace)==='shopper'&&str(x.role)==='shopper'&&str(x.shopperId)&&(arr(x.projectIds).length===0||arr(x.projectIds).map(String).includes(projectId)))){
  try{await auth.getUser(m.id);shopper=m;break;}catch(error){if(str(error?.code)!=='auth/user-not-found')throw error;}
}
ensure(shopper,'AUTH_FAILURE',{blocker:'GATE20_FOCAL_SHOPPER_AUTH_USER_MISSING'});
let chromium;try{({chromium}=await import('playwright'));}catch{finish('ENVIRONMENT_FAILURE',{blocker:'GATE20_PLAYWRIGHT_UNAVAILABLE'});}

const browser=await chromium.launch({headless:true});
const base=`${HOSTING_URL}/index-backend-dev.html?cxBackendPreview=${PREVIEW}&cxProjectId=${encodeURIComponent(projectId)}&cxProtectedRuntime=${PROTECTED}`;
const technicalUrl=`${base}&cxTechnicalAuthE2E=${TECH}`;
const pageErrors=[],captures=[];
async function capture(page,file){await page.screenshot({path:path.join(OUT,file),fullPage:true});captures.push(file);}
async function authenticate(page,token,expectedRole){
  await page.goto(technicalUrl,{waitUntil:'domcontentloaded',timeout:90000});
  await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);await firebase.auth().signInWithCustomToken(t);},token);
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({tenantId,projectId,expectedRole})=>{const c=window.CX?.backendAuth?.context?.()||{};const projects=Array.isArray(c.projectIds)?c.projectIds.map(String):[];const role=String(c.role||'');const roleOk=expectedRole==='staff'?['super','admin'].includes(role):role===expectedRole;const projectOk=role==='super'||projects.length===0||projects.includes(projectId);return c.authenticated===true&&c.tenantId===tenantId&&roleOk&&projectOk&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true;},{tenantId,projectId,expectedRole},{timeout:120000});
}
async function routeCheck(page,kind,route,expected){
  await page.evaluate(r=>window.CX.router.nav(r),route);
  await page.waitForFunction(x=>String(document.body.innerText||'').includes(x),expected,{timeout:30000});
  await page.waitForSelector('#view',{state:'visible',timeout:30000});
  await page.waitForTimeout(500);
  const m=await page.evaluate(()=>{const d=document.documentElement,b=document.body,v=document.querySelector('#view')||document.querySelector('main.content'),r=v?.getBoundingClientRect()||{width:0,height:0,bottom:0,top:0};const visibleModals=[...document.querySelectorAll('.cx-modal')].filter(x=>{const s=getComputedStyle(x),q=x.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&q.width>0&&q.height>0;}).length;return {viewVisible:r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight,overflowX:Math.max(0,Math.max(d.scrollWidth,b.scrollWidth)-innerWidth),visibleModals,tenant:d.getAttribute('data-cx-tenant'),project:d.getAttribute('data-cx-project'),source:d.getAttribute('data-cx-source'),revision:String(window.CX?.data?.previewMeta?.sourceRevision||''),authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,bodyTextLength:String(b.innerText||'').trim().length};});
  await capture(page,`gate20-focal-${kind}-${route}.png`);
  ensure(m.viewVisible&&m.bodyTextLength>100&&m.visibleModals===0&&m.tenant===tenantId&&m.project===projectId&&m.source==='hr-live'&&/^[a-f0-9]{64}$/.test(m.revision)&&m.authority,'VISUAL_DEFECT',{blocker:'GATE20_FOCAL_ROUTE_STRUCTURE_INVALID',kind,route,metrics:m});
  ensure(m.overflowX<=(kind.includes('mobile')?24:16),'VISUAL_DEFECT',{blocker:'GATE20_FOCAL_HORIZONTAL_OVERFLOW',kind,route,metrics:m});
  return m.overflowX;
}

let maxOverflowX=0;
try{
  for(const cfg of [
    {kind:'admin-desktop',viewport:{width:1440,height:1000},role:'staff',member:staff,routes:[['shoppers','Shoppers / Auditores'],['financiero','Dashboard Financiero']]},
    {kind:'admin-mobile',viewport:{width:390,height:844},role:'staff',member:staff,routes:[['shoppers','Shoppers / Auditores'],['financiero','Dashboard Financiero']]},
    {kind:'shopper-desktop',viewport:{width:1440,height:1000},role:'shopper',member:shopper,routes:[['miperfil','Mi Perfil']]},
    {kind:'shopper-mobile',viewport:{width:390,height:844},role:'shopper',member:shopper,routes:[['miperfil','Mi Perfil']]}
  ]){
    const ctx=await browser.newContext({viewport:cfg.viewport,isMobile:cfg.kind.includes('mobile'),hasTouch:cfg.kind.includes('mobile')});
    const page=await ctx.newPage();
    page.on('pageerror',e=>pageErrors.push(`${cfg.kind}:${str(e?.message||e).slice(0,500)}`));
    await authenticate(page,await auth.createCustomToken(cfg.member.id),cfg.role);
    for(const [route,expected] of cfg.routes)maxOverflowX=Math.max(maxOverflowX,await routeCheck(page,cfg.kind,route,expected));
    await ctx.close();
  }
}finally{await browser.close();}
ensure(pageErrors.length===0,'VISUAL_DEFECT',{blocker:'GATE20_FOCAL_BROWSER_PAGE_ERRORS',pageErrors});
ensure(captures.length===6,'VISUAL_DEFECT',{blocker:'GATE20_FOCAL_CAPTURE_COUNT_INVALID',captureCount:captures.length});
finish('PASS_GATE20_FOCAL_VISUAL_DRIFT',{sourceSha:process.env.SOURCE_SHA||null,lockedGate20RunId:Number(lock.lockedRunId)||null,lockedGate20SourceSha:str(lock.lockedSourceSha),tenantId,projectId,periodId,changedSurfaceOwners:['app/modules/shoppers.js','app/modules/finanzas.js','app/modules/operacion-extra.js'],validatedRoutes:{admin:['shoppers','financiero'],shopper:['miperfil']},desktop:true,mobile:true,screenshots:captures,captureCount:captures.length,maxOverflowX,pageErrors,domMarkersExact:true,hrAuthorityApplied:true,blockingUnexpectedModal:false,humanLegalAcceptanceReexecuted:false,legalAcceptanceBypass:false},0);
