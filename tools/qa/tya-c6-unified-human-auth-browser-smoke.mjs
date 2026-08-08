import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-unified-human/private-e2e.json';
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const outputFile=String(process.env.CXORBIA_HUMAN_GATE_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password||!credentials?.shopper?.login||!credentials?.shopper?.password)throw new Error('PRIVATE_E2E_CREDENTIALS_INVALID');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);

const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,1200);
const persist=value=>{
  if(!outputFile)return;
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');
};
const progress={staff:null,shopper:null,client:null};

async function configureLocalRoutes(context){
  if(!isLocal)return;
  const init=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  assert(init.ok,'REMOTE_FIREBASE_INIT_UNAVAILABLE_'+init.status);
  const initScript=await init.text();
  await context.route('**/__/firebase/init.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:initScript}));
  await context.route('**/api/tya/cinepolis/hr-live**',async route=>{
    const incoming=new URL(route.request().url());
    const response=await fetch(remoteRoot+'/api/tya/cinepolis/hr-live'+incoming.search,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
    await route.fulfill({status:response.status,headers:{'content-type':response.headers.get('content-type')||'application/json; charset=utf-8','cache-control':'no-store'},body:Buffer.from(await response.arrayBuffer())});
  });
}

async function loginUiSnapshot(page,label){
  return page.evaluate(label=>{
    const early=window.CX_C6_EARLY_AUTH_CLICK_GUARD||null;
    const login=document.getElementById('login');
    return {
      label,
      readyState:document.readyState,
      url:location.href,
      backendEnabled:window.CX?.BACKEND?.enabled===true,
      previewMode:window.CX?.BACKEND?.previewMode===true,
      devPreviewAuthEnabled:window.CX?.BACKEND?.devPreviewAuth?.enabled===true,
      backendAuthPresent:Boolean(window.CX?.backendAuth),
      backendAuthReady:Boolean(window.CX?.backendAuth?.isReady?.()),
      appPresent:Boolean(window.CX?.app),
      firebaseWrapper:Boolean(window.CX?.app?.__firebaseBrowserAuthWrapped),
      clientWrapper:Boolean(window.CX?.app?.__c6UnifiedClientLogin),
      earlyGuardInstalled:early?.installed===true,
      earlyGuardIntercepts:Number(early?.intercepts||0),
      earlyGuardLastRole:early?.lastInterceptedRole||null,
      directRoleEntryAllowed:early?.directRoleEntryAllowed??null,
      integratedStep:Boolean(document.getElementById('cxIntegratedAuthStep')),
      integratedLogin:Boolean(document.getElementById('cxIntegratedAuthLogin')),
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth')),
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:login?.classList.contains('hidden')===true,
      sessionRole:window.CX?.session?.role||null,
      roleButtons:[...document.querySelectorAll('.role-btn[data-role]')].map(x=>({role:x.dataset.role||null,visible:!!(x.offsetWidth||x.offsetHeight||x.getClientRects().length)})),
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      protectedRuntime:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      loginText:(login?.innerText||'').replace(/\s+/g,' ').trim().slice(0,700)
    };
  },label);
}

async function waitReady(page,expectedNamespace,label){
  try{
    await page.waitForFunction(({expectedNamespace})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      const d=window.CX?.data||{};
      return Boolean(
        ctx?.authenticated===true&&ctx?.authNamespace===expectedNamespace&&
        authority?.applied===true&&authority?.periods>0&&authority?.hrVisits>0&&
        Array.isArray(d.projects)&&d.projects.length===authority.periods&&
        Array.isArray(d._visitas)&&d._visitas.length===authority.hrVisits&&
        d.currentProjectId&&d.currentPeriodId&&
        document.getElementById('app')?.classList.contains('on')===true
      );
    },{expectedNamespace},{timeout:90000});
  }catch{
    const state=await snapshot(page,label+'_timeout');
    throw new Error(label+'_AUTH_RUNTIME_TIMEOUT_'+clean(JSON.stringify(state)));
  }
}

async function snapshot(page,label){
  return page.evaluate(label=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    const view=document.getElementById('view')?.innerText||'';
    const rail=document.getElementById('rail')?.innerText||'';
    const canonicalShopperId=ctx?.shopperId?((d.__identityMap||{})[ctx.shopperId]||ctx.shopperId):null;
    let ownVisits=null;
    try{ownVisits=canonicalShopperId&&typeof d.visitsForShopper==='function'?d.visitsForShopper(canonicalShopperId,false).length:null;}catch{}
    return {
      label,
      role:ctx?.role||null,
      namespace:ctx?.authNamespace||null,
      tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],
      shopperId:canonicalShopperId||null,
      ownVisits,
      periods:Array.isArray(d.projects)?d.projects.length:-1,
      visits:Array.isArray(d._visitas)?d._visitas.length:-1,
      shoppers:Array.isArray(d.shoppers)?d.shoppers.length:-1,
      currentProjectId:d.currentProjectId||null,
      currentPeriodId:d.currentPeriodId||null,
      authorityApplied:authority?.applied===true,
      authorityPeriods:Number(authority?.periods||0),
      authorityVisits:Number(authority?.hrVisits||0),
      authorityShoppers:Number(authority?.hrShoppers||0),
      firstPeriod:authority?.firstPeriod||null,
      latestPeriod:authority?.latestPeriod||null,
      duplicateVisitKeys:Number(authority?.duplicateVisitKeys||0),
      duplicateShopperIds:Number(authority?.duplicateShopperIds||0),
      dataStatus:ds.status||null,
      dataMode:ds.mode||null,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      emptyShell:window.CX_C4_EMPTY_SHELL_STATE?.active===true,
      backendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      noProjectsVisible:view.includes('Sin proyectos disponibles')||rail.includes('Sin proyectos disponibles'),
      noPeriodsVisible:rail.includes('Sin periodos disponibles'),
      blockedVisible:view.includes('Fuente de datos no disponible'),
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true,
      credentialStepVisible:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalFormVisible:Boolean(document.getElementById('cxDevEntryAuth'))
    };
  },label);
}

function validate(state,kind,first=null){
  assert(state.appOn,kind+'_APP_NOT_ON');
  assert(state.loginHidden,kind+'_LOGIN_NOT_HIDDEN');
  assert(state.authorityApplied,kind+'_HR_AUTHORITY_NOT_APPLIED');
  assert(state.periods===state.authorityPeriods&&state.periods>0,kind+'_PERIODS_NOT_DYNAMIC_AUTHORITY');
  assert(state.visits===state.authorityVisits&&state.visits>0,kind+'_VISITS_NOT_DYNAMIC_AUTHORITY');
  assert(state.currentProjectId&&state.currentPeriodId,kind+'_PROJECT_PERIOD_MISSING');
  assert(state.duplicateVisitKeys===0&&state.duplicateShopperIds===0,kind+'_DUPLICATE_KEYS');
  assert(!state.emptyShell&&!state.backendEmpty&&!state.noProjectsVisible&&!state.noPeriodsVisible&&!state.blockedVisible,kind+'_VISIBLE_SHELL_OR_SOURCE_BLOCK');
  assert(state.canonicalLane==='authenticated-human-canonical'&&state.canonicalProtected===true&&state.technicalAuth===false,kind+'_HUMAN_CANONICAL_LANE_INVALID');
  assert(!state.credentialStepVisible&&!state.technicalFormVisible,kind+'_CREDENTIAL_OR_TECHNICAL_FORM_LEAKED');
  if(first){
    assert(state.periods===first.periods&&state.visits===first.visits&&state.shoppers===first.shoppers,kind+'_COUNTS_CHANGED');
    assert(state.currentProjectId===first.currentProjectId&&state.currentPeriodId===first.currentPeriodId,kind+'_CONTEXT_CHANGED');
  }
}

async function openEntry(browser){
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  await configureLocalRoutes(context);
  const page=await context.newPage();
  await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  for(const role of ['admin','cliente','shopper'])await page.waitForSelector(`.role-btn[data-role="${role}"]`,{state:'visible',timeout:30000});
  const url=new URL(page.url());
  assert(url.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','PROTECTED_RUNTIME_FLAG_MISSING');
  assert(url.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','FULL_VISUAL_FLAG_MISSING');
  assert(!url.searchParams.has('cxTechnicalAuthE2E'),'TECHNICAL_TOKEN_LEAKED');
  return {context,page};
}

async function openCredentialStep(page,kind,roleButton){
  const before=await loginUiSnapshot(page,kind+'_before_role_click');
  await page.click(`.role-btn[data-role="${roleButton}"]`);
  await page.waitForTimeout(500);
  const after=await loginUiSnapshot(page,kind+'_after_role_click');
  if(!after.integratedStep||!after.integratedLogin){
    const failure={
      schemaVersion:'cxorbia.c6.unified-human-auth-browser-smoke-failure.v2',
      generatedAt:new Date().toISOString(),
      decision:'FAIL_C6_UNIFIED_HUMAN_AUTH_CREDENTIAL_STEP',
      failedPrincipal:kind,
      before,
      after,
      progress,
      credentialsExposed:false,
      tokensExposed:false,
      hostingDeploys:0,
      providerWrites:0,
      authWrites:0,
      firestoreWrites:0,
      hrWrites:0,
      merge:false,
      production:false
    };
    persist(failure);
    throw new Error(kind+'_INTEGRATED_CREDENTIAL_STEP_MISSING_'+clean(JSON.stringify({before,after})));
  }
  assert(!after.technicalForm,kind+'_PARALLEL_TECHNICAL_LOGIN_VISIBLE');
  return {before,after};
}

async function loginPrincipal(browser,kind,roleButton,credential,expectedNamespace){
  const {context,page}=await openEntry(browser);
  const loginUi=await openCredentialStep(page,kind,roleButton);
  await page.fill('#cxIntegratedAuthLogin',credential.login);
  await page.fill('#cxIntegratedAuthPassword',credential.password);
  await page.click('#cxIntegratedAuthSubmit');
  await waitReady(page,expectedNamespace,kind+'_first');
  const first=await snapshot(page,kind+'_first');
  validate(first,kind+'_first');
  if(kind==='staff'){
    assert(['super','admin','ops','coordinador'].includes(first.role),kind+'_ROLE_INVALID_'+clean(first.role));
    assert(first.namespace==='staff',kind+'_NAMESPACE_INVALID');
  }else{
    assert(first.role==='shopper'&&first.namespace==='shopper',kind+'_ROLE_NAMESPACE_INVALID');
    assert(first.shopperId&&Number(first.ownVisits||0)>0,kind+'_IDENTITY_OR_HISTORY_MISSING');
  }

  const reloads=[];
  for(let i=1;i<=3;i++){
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await waitReady(page,expectedNamespace,kind+'_reload_'+i);
    const state=await snapshot(page,kind+'_reload_'+i);
    validate(state,kind+'_reload_'+i,first);
    reloads.push(state);
  }

  const second=await context.newPage();
  await second.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await waitReady(second,expectedNamespace,kind+'_new_tab');
  const newTab=await snapshot(second,kind+'_new_tab');
  validate(newTab,kind+'_new_tab',first);
  await second.close();
  await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await context.close();
  const result={
    role:first.role,
    namespace:first.namespace,
    periods:first.periods,
    visits:first.visits,
    shoppers:first.shoppers,
    firstPeriod:first.firstPeriod,
    latestPeriod:first.latestPeriod,
    ownVisits:first.ownVisits,
    projectId:first.currentProjectId,
    periodId:first.currentPeriodId,
    loginProtectedBy:loginUi.before.firebaseWrapper?'official_wrapper':loginUi.before.earlyGuardInstalled?'early_guard':'unknown',
    reloadsStable:reloads.length===3,
    newTabStable:newTab.appOn===true,
    credentialsExposed:false,
    tokensExposed:false
  };
  progress[kind]=result;
  persist({
    schemaVersion:'cxorbia.c6.unified-human-auth-browser-smoke-progress.v1',
    generatedAt:new Date().toISOString(),
    decision:'HOLD_C6_UNIFIED_HUMAN_AUTH_IN_PROGRESS',
    progress,
    credentialsExposed:false,
    tokensExposed:false,
    hostingDeploys:0,
    providerWrites:0,
    authWrites:0,
    firestoreWrites:0,
    hrWrites:0,
    merge:false,
    production:false
  });
  return result;
}

async function validateClientRoute(browser){
  const {context,page}=await openEntry(browser);
  const loginUi=await openCredentialStep(page,'client_route','cliente');
  const result=await page.evaluate(()=>({
    heading:document.getElementById('cxIntegratedAuthStep')?.innerText||'',
    loginPresent:Boolean(document.getElementById('cxIntegratedAuthLogin')),
    passwordPresent:Boolean(document.getElementById('cxIntegratedAuthPassword')),
    technicalFormPresent:Boolean(document.getElementById('cxDevEntryAuth')),
    canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
    protectedRuntime:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true
  }));
  assert(result.heading.includes('Portal del Cliente'),'CLIENT_ROUTE_LABEL_MISSING');
  assert(result.loginPresent&&result.passwordPresent&&!result.technicalFormPresent,'CLIENT_ROUTE_NOT_SINGLE_INTEGRATED_LOGIN');
  assert(result.canonicalLane==='authenticated-human-canonical'&&result.protectedRuntime,'CLIENT_ROUTE_NOT_CANONICAL');
  await context.close();
  const client={integratedCredentialRoute:true,authenticated:false,loginProtectedBy:loginUi.before.firebaseWrapper?'official_wrapper':loginUi.before.earlyGuardInstalled?'early_guard':'unknown',reason:'existing_client_credential_not_selected_by_current_private_selector'};
  progress.client=client;
  return client;
}

async function launchIsolated(run){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  try{return await run(browser);}finally{await browser.close();}
}

try{
  const staff=await launchIsolated(browser=>loginPrincipal(browser,'staff','admin',credentials.staff,'staff'));
  const shopper=await launchIsolated(browser=>loginPrincipal(browser,'shopper','shopper',credentials.shopper,'shopper'));
  const client=await launchIsolated(browser=>validateClientRoute(browser));
  const evidence={
    schemaVersion:'cxorbia.c6.unified-human-auth-browser-smoke.v3',
    generatedAt:new Date().toISOString(),
    decision:'PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY',
    root,
    local:isLocal,
    principalIsolation:'fresh_browser_per_principal',
    lane:'authenticated-human-canonical',
    staff,
    shopper,
    client,
    fullClientAuthenticationGatePassed:false,
    remainingBlocker:'EXISTING_CLIENT_CREDENTIAL_NOT_SELECTED',
    hostingDeploys:0,
    providerWrites:0,
    authWrites:0,
    firestoreWrites:0,
    hrWrites:0,
    credentialsExposed:false,
    tokensExposed:false,
    merge:false,
    production:false
  };
  persist(evidence);
  console.log(JSON.stringify(evidence));
}catch(error){
  if(!outputFile||!fs.existsSync(outputFile)){
    persist({
      schemaVersion:'cxorbia.c6.unified-human-auth-browser-smoke-failure.v3',
      generatedAt:new Date().toISOString(),
      decision:'FAIL_C6_UNIFIED_HUMAN_AUTH_RUNTIME',
      principalIsolation:'fresh_browser_per_principal',
      error:clean(error&&error.message),
      progress,
      credentialsExposed:false,
      tokensExposed:false,
      hostingDeploys:0,
      providerWrites:0,
      authWrites:0,
      firestoreWrites:0,
      hrWrites:0,
      merge:false,
      production:false
    });
  }
  throw error;
}
