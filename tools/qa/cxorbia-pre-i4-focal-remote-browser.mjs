import fs from 'node:fs';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { chromium } from 'playwright';

const OUT=process.env.PREI4_OUT;
const ROOT=String(process.env.CXORBIA_PREI4_ROOT||'').replace(/\/$/,'');
const sourceSha=String(process.env.CXORBIA_PREI4_SOURCE_SHA||'');
if(!OUT||!ROOT||!sourceSha)throw new Error('ENVIRONMENT_FAILURE:PREI4_BROWSER_ENV_MISSING');
const hr=JSON.parse(fs.readFileSync(OUT+'/hr-contrast.json','utf8'));
const tenantId='tya',projectId='cinepolis',periodId=String(hr.currentPeriodId||''),hrRevision=String(hr.sourceRevision||'');
const PREVIEW='YES_PAULA_20260628_PREVIEW_DEV',PROTECTED='YES_PAULA_20260730_PROTECTED_DEV',FULL='YES_PAULA_20260731_FULL_PROFILE_DEV';
const URL=ROOT+'/index-backend-dev.html?cxBackendPreview='+PREVIEW+'&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime='+PROTECTED+'&cxHumanFullVisual='+FULL;
const str=v=>String(v??'').trim(), arr=v=>Array.isArray(v)?v:[], fp=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,16);
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
const members=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
const authExists=async m=>{try{await auth.getUser(m.id);return true;}catch(e){if(str(e?.code)==='auth/user-not-found')return false;throw e;}};
let admin=null;
for(const m of members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role).toLowerCase())&&str(x.authNamespace).toLowerCase()!=='shopper')){if(await authExists(m)){admin=m;break;}}
let shopper=null;
for(const m of members.filter(x=>x.active===true&&str(x.role).toLowerCase()==='shopper'&&str(x.authNamespace).toLowerCase()==='shopper'&&str(x.visibleLogin).toLowerCase()==='paula.osorio')){if(await authExists(m)){shopper=m;break;}}
if(!admin)throw new Error('AUTH_FAILURE:FOCAL_ADMIN_PRINCIPAL_MISSING');
if(!shopper)throw new Error('AUTH_FAILURE:FOCAL_PAULA_SHOPPER_PRINCIPAL_MISSING');

const browser=await chromium.launch({headless:true});
const evidence={schemaVersion:'cxorbia.pre-i4.focal-human-browser.v1',decision:'HOLD',sourceSha,hrRevision,periodId,preAuth:null,admin:null,shopper:null,mobile:null,production:false,authWrites:0,hrWrites:0,providerWrites:0};

async function assertClean(page,label){
  await page.waitForTimeout(1200);
  const d=await page.evaluate(()=>{const body=String(document.body?.innerText||'');const logo=[...document.querySelectorAll('img')].find(x=>/tyaconsultores\.com\/wp-content\/uploads\/2023\/05\/logo\.png/.test(String(x.src||'')));return{
    debug:!!document.getElementById('cxBackendPreviewStatus'),
    lab:!!document.getElementById('cx-dev-lab'),
    blocked:body.includes('Fuente de datos no disponible')||body.includes('No hay un adapter backend autorizado conectado'),
    staleRetail:/proyecto retail|periodo activo:\s*retail|visitas:\s*108|shoppers:\s*18|postulaciones:\s*48/i.test(body),
    gravicentra:/Gravicentra\s*CX/i.test(body),
    brandId:String(window.CX?.BRAND?.id||''),
    brandName:String(window.CX?.BRAND?.clientName||window.CX?.BRAND?.name||''),
    logoSrc:logo?String(logo.src):'',
    logoLoaded:!!(logo&&logo.complete&&logo.naturalWidth>0),
    dataMode:String(window.CX?.dataSource?.mode||''),
    dataStatus:String(window.CX?.dataSource?.status||''),
    blockers:Array.isArray(window.CX?.dataSource?.blockers)?window.CX.dataSource.blockers.slice():[],
    lane:String(window.CX_DEV_ENTRY_CANONICAL?.lane||'')
  };});
  if(d.debug||d.lab||d.blocked||d.staleRetail||d.gravicentra||d.brandId!=='tya'||d.brandName!=='T&A Consultores'||!d.logoLoaded||d.dataStatus==='blocked'||d.blockers.length||d.lane!=='authenticated-human-canonical')throw new Error('RELEASE_COMPOSITION_FAILURE:'+label+':'+JSON.stringify(d));
  return d;
}

async function signInMember(member,kind,route){
  const ctx=await browser.newContext({viewport:{width:1440,height:980}});
  const page=await ctx.newPage(),pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(str(e?.message||e)));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.firebase?.auth&&Array.isArray(window.firebase?.apps)&&window.firebase.apps.length>0,null,{timeout:90000});
  const token=await auth.createCustomToken(member.id);
  await page.evaluate(async t=>{const a=window.firebase.auth();await a.setPersistence(window.firebase.auth.Auth.Persistence.SESSION);await a.signInWithCustomToken(t);},token);
  await page.goto('about:blank');
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(uid=>String(window.firebase?.auth?.().currentUser?.uid||'')===uid,String(member.id),{timeout:90000});
  await page.waitForFunction(()=>typeof window.CX?.backendAuth?.ensureAuthenticated==='function',null,{timeout:90000});
  await page.evaluate(async()=>{await window.CX.backendAuth.ensureAuthenticated();});
  await page.waitForFunction(({kind,tenantId})=>{const c=window.CX?.backendAuth?.context?.()||{},role=String(c.role||'').toLowerCase();return c.authenticated===true&&c.tenantId===tenantId&&(kind==='shopper'?role==='shopper':role!=='shopper'&&role!=='cliente');},{kind,tenantId},{timeout:120000});
  await page.waitForFunction(({projectId,periodId,hrRevision})=>{const d=window.CX?.data||{},g=window.CX_C6_HR_AUTHORITY_GATE||{};return window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&g.blocked!==true&&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===hrRevision;},{projectId,periodId,hrRevision},{timeout:120000});
  await page.evaluate(r=>{window.CX.router.nav(r);},route);
  await page.waitForTimeout(700);
  const one=await page.evaluate(({kind,route})=>{const c=window.CX?.backendAuth?.context?.()||{},d=window.CX?.data||{},body=String(document.body?.innerText||'');const stats=kind==='shopper'&&c.shopperId&&typeof d.shopperStats==='function'?d.shopperStats(c.shopperId):null;return{
    role:String(c.role||''),route:String(window.CX?.session?.view||route),projectId:String(d.currentProjectId||''),periodId:String(d.currentPeriodId||''),sourceRevision:String(d.previewMeta?.sourceRevision||''),authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,debug:!!document.getElementById('cxBackendPreviewStatus'),lab:!!document.getElementById('cx-dev-lab'),blocked:body.includes('Fuente de datos no disponible'),stats
  };},{kind,route});
  if(pageErrors.length||one.debug||one.lab||one.blocked||!one.authority||one.projectId!==projectId||one.periodId!==periodId||one.sourceRevision!==hrRevision||one.route!==route)throw new Error('FUNCTIONAL_DEFECT:'+kind+'_FOCAL_ROUTE:'+JSON.stringify({pageErrors,one}));
  if(kind==='shopper'&&Number(one.stats?.total||0)<7)throw new Error('MAPPING_FAILURE:PAULA_HISTORY_REGRESSION:'+JSON.stringify(one.stats));
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(({projectId,periodId,hrRevision})=>{const d=window.CX?.data||{};return window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&String(d.currentProjectId||'')===projectId&&String(d.currentPeriodId||'')===periodId&&String(d.previewMeta?.sourceRevision||'')===hrRevision;},{projectId,periodId,hrRevision},{timeout:120000});
  const refresh=await page.evaluate(()=>({debug:!!document.getElementById('cxBackendPreviewStatus'),lab:!!document.getElementById('cx-dev-lab'),blocked:String(document.body?.innerText||'').includes('Fuente de datos no disponible'),view:String(window.CX?.session?.view||''),source:String(window.CX?.dataSource?.sourceRef||'')}));
  if(refresh.debug||refresh.lab||refresh.blocked)throw new Error('RELEASE_COMPOSITION_FAILURE:'+kind+'_REFRESH_REGRESSION:'+JSON.stringify(refresh));
  await ctx.close();
  return {principalFingerprint:fp(member.id),route,projectId:one.projectId,periodId:one.periodId,sourceRevision:one.sourceRevision,historyTotal:kind==='shopper'?Number(one.stats?.total||0):null,refreshPreserved:true};
}

try{
  const preCtx=await browser.newContext({viewport:{width:1440,height:980}});
  const pre=await preCtx.newPage();
  await pre.goto(ROOT+'/?prei4='+Date.now(),{waitUntil:'networkidle',timeout:90000});
  evidence.preAuth=await assertClean(pre,'PREAUTH_DESKTOP');
  await preCtx.close();

  evidence.admin=await signInMember(admin,'admin','dashboard');
  evidence.shopper=await signInMember(shopper,'shopper','miperfil');

  const mctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const mobile=await mctx.newPage();
  await mobile.goto(ROOT+'/?prei4mobile='+Date.now(),{waitUntil:'networkidle',timeout:90000});
  const clean=await assertClean(mobile,'PREAUTH_MOBILE');
  const layout=await mobile.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,logoVisible:!![...document.querySelectorAll('img')].find(x=>/tyaconsultores\.com\/wp-content\/uploads\/2023\/05\/logo\.png/.test(String(x.src||''))&&x.getBoundingClientRect().width>0&&x.getBoundingClientRect().height>0)}));
  if(layout.scrollWidth>layout.innerWidth+2||!layout.logoVisible)throw new Error('VISUAL_DEFECT:MOBILE_LOGIN_LAYOUT:'+JSON.stringify(layout));
  evidence.mobile={...clean,layout};
  await mctx.close();

  evidence.decision='PASS_PRE_I4_FOCAL_HUMAN_BROWSER';
  fs.writeFileSync(OUT+'/browser-focal.json',JSON.stringify(evidence,null,2)+'\n');
} finally {
  await browser.close();
}
