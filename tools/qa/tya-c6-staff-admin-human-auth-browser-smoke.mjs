import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-unified-human/private-e2e.json';
const outputFile=String(process.env.CXORBIA_HUMAN_GATE_OUTPUT||'').trim();
const exactAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const action=String(process.env.CXORBIA_C6_ACTION||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(action!==exactAction)throw new Error('STAFF_ACTION_NOT_EXACT');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password)throw new Error('PRIVATE_E2E_STAFF_CREDENTIALS_INVALID');
if(credentials?.shopper||credentials?.client)throw new Error('PRIVATE_E2E_STAFF_SCOPE_EXCEEDED');

const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,1600);
const persist=value=>{
  if(!outputFile)return;
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');
};
let lastState=null;

async function waitReady(page,label){
  try{
    await page.waitForFunction(()=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
      const d=window.CX?.data||{};
      return Boolean(
        ctx?.authenticated===true&&ctx?.authNamespace==='staff'&&
        window.CX?.session?.user?.membershipVerified===true&&
        authority?.applied===true&&authority?.periods>0&&authority?.hrVisits>0&&
        handoff?.status==='entered'&&handoff?.membershipVerified===true&&
        Array.isArray(d.projects)&&d.projects.length===authority.periods&&
        Array.isArray(d._visitas)&&d._visitas.length===authority.hrVisits&&
        d.currentProjectId&&d.currentPeriodId&&
        window.CX_BACKEND_LAST_STATE?.empty!==true&&
        window.CX_CORTE4_READONLY?.empty!==true&&
        document.getElementById('app')?.classList.contains('on')===true&&
        document.getElementById('login')?.classList.contains('hidden')===true
      );
    },null,{timeout:90000});
  }catch{
    const state=await snapshot(page,label+'_timeout');
    lastState=state;
    throw new Error(label+'_AUTH_RUNTIME_TIMEOUT_'+clean(JSON.stringify(state)));
  }
}

async function snapshot(page,label){
  return page.evaluate(label=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    const view=document.getElementById('view')?.innerText||'';
    const rail=document.getElementById('rail')?.innerText||'';
    let legal=null;
    try{legal=window.CX?.legalRuntimeHttp?.status?.()||null;}catch(_){legal=null;}
    const modalTitles=[...document.querySelectorAll('.cx-modal')].map(m=>String(m.querySelector('.card-t,h2,h3')?.textContent||m.textContent||'').trim().slice(0,80)).filter(Boolean).slice(0,5);
    const railProjectSelect=Boolean(document.getElementById('projSel'));
    const railPeriodSelect=Boolean(document.getElementById('periodSel'));
    const railMounted=Boolean(document.querySelector('#rail .rail-brand'));
    const viewMounted=Boolean(document.getElementById('view')?.children?.length);
    return {
      label,
      role:ctx?.role||null,
      namespace:ctx?.authNamespace||null,
      tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],
      membershipVerified:window.CX?.session?.user?.membershipVerified===true,
      membershipSource:window.CX?.session?.user?.membershipSource||null,
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
      frontendHandoffStatus:handoff?.status||null,
      frontendHandoffMembershipVerified:handoff?.membershipVerified===true,
      staleBackendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      staleCorte4Empty:window.CX_CORTE4_READONLY?.empty===true,
      dataStatus:ds.status||null,
      dataMode:ds.mode||null,
      dataSourceRef:ds.sourceRef||null,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      emptyShell:window.CX_C4_EMPTY_SHELL_STATE?.active===true,
      backendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      noProjectsVisible:view.includes('Sin proyectos disponibles')||rail.includes('Sin proyectos disponibles'),
      noPeriodsVisible:rail.includes('Sin periodos disponibles'),
      blockedVisible:view.includes('Fuente de datos no disponible'),
      railMounted,
      viewMounted,
      railProjectSelect,
      railPeriodSelect,
      legalRuntimePresent:Boolean(window.CX?.legalRuntimeHttp),
      legalLoaded:legal?.loaded===true,
      legalPending:legal?legal.pending===true:null,
      legalProviderAuthority:legal?.providerAuthority===true,
      legalError:legal?.error||null,
      legalModalVisible:modalTitles.some(t=>/términos|confidencialidad|legal/i.test(t)),
      modalTitles,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true,
      legacyCredentialStepVisible:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalFormVisible:Boolean(document.getElementById('cxDevEntryAuth'))
    };
  },label);
}

function validate(state,label,first=null){
  assert(state.appOn,label+'_APP_NOT_ON');
  assert(state.loginHidden,label+'_LOGIN_NOT_HIDDEN');
  assert(state.membershipVerified,label+'_MEMBERSHIP_NOT_VERIFIED');
  assert(state.frontendHandoffStatus==='entered'&&state.frontendHandoffMembershipVerified,label+'_FRONTEND_HANDOFF_NOT_ENTERED');
  assert(!state.staleBackendEmpty&&!state.staleCorte4Empty,label+'_STALE_PROVIDER_EMPTY_STATE');
  assert(state.authorityApplied,label+'_HR_AUTHORITY_NOT_APPLIED');
  assert(state.periods===state.authorityPeriods&&state.periods>0,label+'_PERIODS_NOT_DYNAMIC_AUTHORITY');
  assert(state.visits===state.authorityVisits&&state.visits>0,label+'_VISITS_NOT_DYNAMIC_AUTHORITY');
  assert(state.currentProjectId&&state.currentPeriodId,label+'_PROJECT_PERIOD_MISSING');
  assert(state.duplicateVisitKeys===0&&state.duplicateShopperIds===0,label+'_DUPLICATE_KEYS');
  assert(!state.emptyShell,label+'_EMPTY_SHELL_ACTIVE');
  assert(!state.backendEmpty,label+'_BACKEND_EMPTY_ACTIVE');
  assert(!state.noProjectsVisible,label+'_NO_PROJECTS_VISIBLE');
  assert(!state.noPeriodsVisible,label+'_NO_PERIODS_VISIBLE');
  assert(!state.blockedVisible,label+'_DATA_SOURCE_BLOCK_VISIBLE');
  assert(state.railMounted&&state.viewMounted,label+'_ROUTER_SHELL_NOT_MOUNTED');
  assert(state.railProjectSelect,label+'_PROJECT_SELECTOR_NOT_MOUNTED');
  assert(state.railPeriodSelect,label+'_PERIOD_SELECTOR_NOT_MOUNTED');
  if(state.legalRuntimePresent){
    assert(state.legalError==null,label+'_LEGAL_RUNTIME_ERROR');
    assert(state.legalPending!==true||state.legalModalVisible,label+'_LEGAL_PENDING_WITHOUT_HUMAN_GATE');
    assert(state.legalPending!==true,label+'_LEGAL_GATE_BLOCKING_ROUTER');
  }
  assert(state.canonicalLane==='authenticated-human-canonical'&&state.canonicalProtected===true&&state.technicalAuth===false,label+'_HUMAN_CANONICAL_LANE_INVALID');
  assert(!state.legacyCredentialStepVisible&&!state.technicalFormVisible,label+'_LEGACY_OR_TECHNICAL_AUTH_LEAKED');
  assert(['super','admin','ops','coordinador'].includes(String(state.role||'')),label+'_ROLE_INVALID');
  assert(state.namespace==='staff',label+'_NAMESPACE_INVALID');
  if(first){
    assert(state.periods===first.periods&&state.visits===first.visits&&state.shoppers===first.shoppers,label+'_COUNTS_CHANGED');
    assert(state.currentProjectId===first.currentProjectId&&state.currentPeriodId===first.currentPeriodId,label+'_CONTEXT_CHANGED');
  }
}

async function runStaff(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  try{
    const page=await context.newPage();
    await page.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
    const entryUrl=new URL(page.url());
    assert(entryUrl.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','PROTECTED_RUNTIME_FLAG_MISSING');
    assert(entryUrl.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','FULL_VISUAL_FLAG_MISSING');
    assert(!entryUrl.searchParams.has('cxTechnicalAuthE2E'),'TECHNICAL_TOKEN_LEAKED');

    const before=await page.evaluate(()=>({
      firebaseWrapper:Boolean(window.CX?.app?.__firebaseBrowserAuthWrapped),
      earlyGuardInstalled:window.CX_C6_EARLY_AUTH_CLICK_GUARD?.installed===true,
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))
    }));
    assert(!before.technicalForm,'PARALLEL_TECHNICAL_LOGIN_VISIBLE');

    await page.click('.role-btn[data-role="admin"]');
    await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});
    for(const selector of ['#lgUser','#lgPass','#lgSubmit'])await page.waitForSelector(selector,{state:'visible',timeout:10000});
    const canonicalForm=await page.evaluate(()=>({
      loginForm:Boolean(document.getElementById('loginForm')),
      selectedRole:document.getElementById('loginForm')?.dataset.selectedRole||null,
      userVisible:Boolean(document.getElementById('lgUser')?.offsetParent),
      passVisible:Boolean(document.getElementById('lgPass')?.offsetParent),
      submitVisible:Boolean(document.getElementById('lgSubmit')?.offsetParent),
      legacyOverlay:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))
    }));
    assert(canonicalForm.loginForm&&canonicalForm.selectedRole==='admin','CANONICAL_LOGIN_FORM_NOT_ADMIN');
    assert(canonicalForm.userVisible&&canonicalForm.passVisible&&canonicalForm.submitVisible,'CANONICAL_LOGIN_CONTROLS_NOT_VISIBLE');
    assert(!canonicalForm.legacyOverlay&&!canonicalForm.technicalForm,'NON_CANONICAL_LOGIN_SURFACE_VISIBLE');

    await page.fill('#lgUser',credentials.staff.login);
    await page.fill('#lgPass',credentials.staff.password);
    await page.press('#lgPass','Enter');
    await waitReady(page,'staff_first');
    const first=await snapshot(page,'staff_first');
    lastState=first;
    validate(first,'staff_first');

    const reloads=[];
    for(let i=1;i<=3;i++){
      await page.reload({waitUntil:'domcontentloaded',timeout:60000});
      await waitReady(page,'staff_reload_'+i);
      const state=await snapshot(page,'staff_reload_'+i);
      lastState=state;
      validate(state,'staff_reload_'+i,first);
      reloads.push(state);
    }

    const second=await context.newPage();
    await second.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});
    await waitReady(second,'staff_new_tab');
    const newTab=await snapshot(second,'staff_new_tab');
    lastState=newTab;
    validate(newTab,'staff_new_tab',first);
    await second.close();

    const result={
      role:first.role,
      namespace:first.namespace,
      periods:first.periods,
      visits:first.visits,
      shoppers:first.shoppers,
      firstPeriod:first.firstPeriod,
      latestPeriod:first.latestPeriod,
      projectId:first.currentProjectId,
      periodId:first.currentPeriodId,
      membershipVerified:first.membershipVerified,
      frontendHandoffStatus:first.frontendHandoffStatus,
      staleProviderEmptyCleared:!first.staleBackendEmpty&&!first.staleCorte4Empty,
      routerShellMounted:first.railMounted&&first.viewMounted,
      projectSelectorMounted:first.railProjectSelect,
      periodSelectorMounted:first.railPeriodSelect,
      legalRuntimePresent:first.legalRuntimePresent,
      legalProviderAuthority:first.legalProviderAuthority,
      legalPending:first.legalPending,
      loginProtectedBy:before.firebaseWrapper?'official_wrapper':before.earlyGuardInstalled?'early_guard':'unknown',
      canonicalForm:true,
      canonicalSelectors:['#loginForm','#lgUser','#lgPass','#lgSubmit'],
      submitInteraction:'canonical_form_enter_from_password',
      reloadsStable:reloads.length===3,
      newTabStable:newTab.appOn===true,
      credentialsExposed:false,
      tokensExposed:false
    };

    await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
    return result;
  }finally{
    await context.close().catch(()=>{});
    await browser.close().catch(()=>{});
  }
}

try{
  const staff=await runStaff();
  const evidence={
    schemaVersion:'cxorbia.c6.unified-human-auth-staff-admin-readonly.v4',
    generatedAt:new Date().toISOString(),
    decision:'PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY',
    action:exactAction,
    root,
    principalIsolation:'fresh_browser_single_staff_principal',
    lane:'authenticated-human-canonical',
    staff,
    shopper:null,
    client:null,
    genericShopperClientLogicPreserved:true,
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
  const failure={
    schemaVersion:'cxorbia.c6.unified-human-auth-staff-admin-readonly.failure.v4',
    generatedAt:new Date().toISOString(),
    decision:'FAIL_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY',
    action:exactAction,
    root,
    error:clean(error?.stack||error?.message||error),
    lastState,
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
  console.error(JSON.stringify(failure));
  process.exitCode=1;
}
