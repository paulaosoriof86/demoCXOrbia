import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const outputFile=String(process.env.CXORBIA_LOGIN_DIAGNOSTIC_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);
const persist=value=>{if(!outputFile)return;fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');};

async function configure(context){
  if(!isLocal)return;
  const init=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!init.ok)throw new Error('REMOTE_FIREBASE_INIT_UNAVAILABLE_'+init.status);
  const initScript=await init.text();
  await context.route('**/__/firebase/init.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:initScript}));
  await context.route('**/api/tya/cinepolis/hr-live**',async route=>{
    const incoming=new URL(route.request().url());
    const response=await fetch(remoteRoot+'/api/tya/cinepolis/hr-live'+incoming.search,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
    await route.fulfill({status:response.status,headers:{'content-type':response.headers.get('content-type')||'application/json; charset=utf-8','cache-control':'no-store'},body:Buffer.from(await response.arrayBuffer())});
  });
}

async function state(page,label){
  return page.evaluate(label=>{
    const cfg=window.CX?.BACKEND||{};
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const login=document.getElementById('login');
    const app=document.getElementById('app');
    const early=window.CX_C6_EARLY_AUTH_CLICK_GUARD||null;
    return {
      label,
      url:location.href,
      readyState:document.readyState,
      backendEnabled:cfg.enabled===true,
      previewMode:cfg.previewMode===true,
      devPreviewAuthEnabled:cfg.devPreviewAuth?.enabled===true,
      devPreviewAuthMode:cfg.devPreviewAuth?.mode||null,
      backendAuthPresent:Boolean(window.CX?.backendAuth),
      backendAuthReady:Boolean(window.CX?.backendAuth?.isReady?.()),
      authContext:ctx?{authenticated:ctx.authenticated===true,role:ctx.role||null,namespace:ctx.authNamespace||null}:null,
      appPresent:Boolean(window.CX?.app),
      firebaseWrapper:Boolean(window.CX?.app?.__firebaseBrowserAuthWrapped),
      unifiedClientWrapper:Boolean(window.CX?.app?.__c6UnifiedClientLogin),
      earlyGuardInstalled:early?.installed===true,
      earlyGuardIntercepts:Number(early?.intercepts||0),
      earlyGuardLastRole:early?.lastInterceptedRole||null,
      directRoleEntryAllowed:early?.directRoleEntryAllowed??null,
      integratedStep:Boolean(document.getElementById('cxIntegratedAuthStep')),
      integratedLogin:Boolean(document.getElementById('cxIntegratedAuthLogin')),
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth')),
      roleButtons:document.querySelectorAll('.role-btn').length,
      appOn:app?.classList.contains('on')===true,
      loginHidden:login?.classList.contains('hidden')===true,
      sessionRole:window.CX?.session?.role||null,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      loginText:(login?.innerText||'').replace(/\s+/g,' ').trim().slice(0,600)
    };
  },label);
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  await configure(context);
  const page=await context.newPage();
  await page.goto(root+'/index-backend-dev.html',{waitUntil:'commit',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  const before=await state(page,'before_immediate_admin_click');
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForSelector('#cxIntegratedAuthStep',{state:'visible',timeout:5000});
  const after=await state(page,'after_immediate_admin_click');
  const wrapperProtected=before.firebaseWrapper||before.earlyGuardInstalled;
  const pass=wrapperProtected&&after.integratedStep&&after.integratedLogin&&!after.technicalForm&&!after.appOn&&after.directRoleEntryAllowed===false;
  const evidence={
    schemaVersion:'cxorbia.c6.human-login-wrapper-diagnostic.v2',
    generatedAt:new Date().toISOString(),
    decision:pass?'PASS_C6_HUMAN_LOGIN_IMMEDIATE_CLICK_GUARDED':'FAIL_C6_HUMAN_LOGIN_IMMEDIATE_CLICK_BYPASS',
    testMode:'immediate_click_after_first_visible_role_card',
    before,
    after,
    protectedBy:before.firebaseWrapper?'official_firebase_wrapper':before.earlyGuardInstalled?'early_capture_guard':'none',
    inference:pass?null:(after.appOn?'direct_role_entry_bypassed_integrated_auth':(!wrapperProtected?'no_auth_guard_installed':'integrated_auth_step_not_rendered')),
    hostingDeploys:0,
    providerWrites:0,
    authWrites:0,
    firestoreWrites:0,
    hrWrites:0,
    credentialsUsed:false,
    credentialsExposed:false,
    tokensExposed:false,
    merge:false,
    production:false
  };
  persist(evidence);
  console.log(JSON.stringify(evidence));
  if(!pass)process.exitCode=2;
  await context.close();
}finally{
  await browser.close();
}
