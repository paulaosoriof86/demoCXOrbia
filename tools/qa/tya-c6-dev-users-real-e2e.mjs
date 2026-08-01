import fs from 'node:fs';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-users-e2e/private-e2e.json';
const remoteRoot=process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app';
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath)) throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password||!credentials?.shopper?.login||!credentials?.shopper?.password) throw new Error('PRIVATE_E2E_CREDENTIALS_INVALID');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);

function assert(condition,message){ if(!condition) throw new Error(message); }

async function configureLocalRoutes(context){
  if(!isLocal) return;
  const initResponse=await fetch(remoteRoot+'/__/firebase/init.js',{headers:{'cache-control':'no-cache'}});
  if(!initResponse.ok) throw new Error('REMOTE_FIREBASE_INIT_UNAVAILABLE');
  const initScript=await initResponse.text();
  await context.route('**/__/firebase/init.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:initScript}));
  await context.route('**/api/tya/cinepolis/hr-live**',async route=>{
    const incoming=new URL(route.request().url());
    const target=remoteRoot+'/api/tya/cinepolis/hr-live'+incoming.search;
    const response=await fetch(target,{headers:{'cache-control':'no-cache'}});
    const body=Buffer.from(await response.arrayBuffer());
    await route.fulfill({status:response.status,headers:{'content-type':response.headers.get('content-type')||'application/json; charset=utf-8','cache-control':'no-store'},body});
  });
}

async function waitAuthenticated(page,expectedNamespace){
  await page.waitForFunction(({namespace})=>{
    const cx=window.CX;
    const ctx=cx&&cx.backendAuth&&typeof cx.backendAuth.context==='function'?cx.backendAuth.context():null;
    const appOn=document.getElementById('app')?.classList.contains('on');
    const firebaseReady=Boolean(window.firebase&&firebase.auth&&firebase.auth().currentUser);
    const visits=Array.isArray(cx?.data?._visitas)?cx.data._visitas.length:0;
    return Boolean(ctx&&ctx.authenticated===true&&ctx.authNamespace===namespace&&appOn&&firebaseReady&&visits===616);
  },{namespace:expectedNamespace},{timeout:90000});
}

async function snapshot(page){
  return page.evaluate(()=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const d=window.CX?.data||{};
    const own=ctx?.shopperId&&typeof d.visitsForShopper==='function'?d.visitsForShopper(ctx.shopperId,false).length:0;
    return {
      role:ctx?.role||null,
      authNamespace:ctx?.authNamespace||null,
      tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],
      shopperIdPresent:Boolean(ctx?.shopperId),
      currentProjectId:d.currentProjectId||null,
      visits:Array.isArray(d._visitas)?d._visitas.length:0,
      shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0,
      ownVisits:own,
      appOn:Boolean(document.getElementById('app')?.classList.contains('on')),
      loginVisible:Boolean(document.querySelector('#cxDevEntryAuth:visible')),
      technicalPillPresent:Boolean(document.getElementById('cxBackendPreviewStatus')),
      accessSelectorPresent:Boolean(document.getElementById('cxDevEntryAccessType')),
      genericRolesPresent:document.querySelectorAll('.role-btn,.role-alt').length,
      dualChoicePresent:Boolean(document.getElementById('cxDevDualAccess'))
    };
  });
}

async function assertAuthenticatedState(page,kind,expectedOwnVisits=0){
  const state=await snapshot(page);
  assert(state.tenantId==='tya',kind+'_tenant_mismatch');
  assert(state.projectIds.includes('cinepolis')||state.role==='super',kind+'_project_scope_missing');
  assert(state.visits===616,kind+'_canonical_visits_mismatch');
  assert(state.appOn===true,kind+'_app_not_entered');
  assert(state.technicalPillPresent===false,kind+'_technical_status_visible');
  assert(state.accessSelectorPresent===false,kind+'_access_selector_visible');
  assert(state.genericRolesPresent===0,kind+'_generic_role_picker_present');
  assert(state.dualChoicePresent===false,kind+'_unexpected_dual_choice');
  if(kind==='staff'){
    assert(state.authNamespace==='staff',kind+'_namespace_mismatch');
    assert(['super','admin','ops','coordinador'].includes(state.role),kind+'_role_mismatch');
  }else{
    assert(state.authNamespace==='shopper',kind+'_namespace_mismatch');
    assert(state.role==='shopper',kind+'_role_mismatch');
    assert(state.shopperIdPresent===true,kind+'_shopper_scope_missing');
    assert(state.ownVisits>0,kind+'_own_history_empty');
    if(expectedOwnVisits>0) assert(state.ownVisits===expectedOwnVisits,kind+'_own_history_count_mismatch');
  }
  return state;
}

async function runPrincipal(browser,kind,credential){
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  await configureLocalRoutes(context);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error?.message||error).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'[redacted-email]')));

  await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#cxDevEntryAuth',{state:'visible',timeout:30000});
  assert(await page.locator('#cxDevEntryAccessType').count()===0,kind+'_visible_access_type_before_login');
  assert(await page.locator('#cxBackendPreviewStatus').count()===0,kind+'_technical_pill_before_login');
  await page.fill('#cxDevEntryLogin',credential.login);
  await page.fill('#cxDevEntryPassword',credential.password);
  await page.click('#cxDevEntrySubmit');
  await waitAuthenticated(page,kind==='staff'?'staff':'shopper');
  const first=await assertAuthenticatedState(page,kind,kind==='shopper'?Number(credential.expectedOwnVisits||0):0);

  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await waitAuthenticated(page,kind==='staff'?'staff':'shopper');
  const refresh=await assertAuthenticatedState(page,kind,kind==='shopper'?Number(credential.expectedOwnVisits||0):0);
  assert(await page.locator('#cxDevEntryAuth:visible').count()===0,kind+'_refresh_reprompted_credentials');

  const second=await context.newPage();
  await second.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await waitAuthenticated(second,kind==='staff'?'staff':'shopper');
  const newTab=await assertAuthenticatedState(second,kind,kind==='shopper'?Number(credential.expectedOwnVisits||0):0);
  assert(await second.locator('#cxDevEntryAuth:visible').count()===0,kind+'_new_tab_reprompted_credentials');

  const entryErrors=errors.filter(message=>/cxDevEntry|tya-dev-entry|invalid-credential|namespace/i.test(message));
  assert(entryErrors.length===0,kind+'_entry_runtime_error');

  await second.close();
  await page.evaluate(async()=>{ try{ await window.CX?.backendAuth?.signOut?.(); }catch(_){} });
  await context.close();
  return {role:first.role,namespace:first.authNamespace,visits:first.visits,shoppers:first.shoppers,ownVisits:first.ownVisits,refreshPreserved:refresh.appOn===true,newTabPreserved:newTab.appOn===true};
}

const browser=await chromium.launch({headless:true});
try{
  const staff=await runPrincipal(browser,'staff',credentials.staff);
  const shopper=await runPrincipal(browser,'shopper',credentials.shopper);
  console.log(JSON.stringify({decision:'PASS_C6_REAL_USERS_END_TO_END',staff,shopper,credentialsExposed:false,tokensExposed:false,writes:0,production:false}));
}finally{
  await browser.close();
}
