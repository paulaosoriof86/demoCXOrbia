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
function safeFailureCode(value){
  return String(value||'unknown')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL')
    .replace(/[^A-Z0-9_:-]/gi,'_')
    .replace(/_+/g,'_')
    .slice(0,220);
}
function persistFailure(kind,error){
  const lane=isLocal?'local':'remote';
  const code=`${lane}_real_users_e2e__${kind}__${safeFailureCode(error?.message||error)}`;
  if(process.env.OUT_DIR){
    try{fs.mkdirSync(process.env.OUT_DIR,{recursive:true});fs.writeFileSync(process.env.OUT_DIR+'/stage',code+'\n','utf8');}catch{}
  }
  return code;
}

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

async function compactAuthState(page){
  return page.evaluate(()=>{
    const visible=element=>{
      if(!element)return false;
      const style=getComputedStyle(element),rect=element.getBoundingClientRect();
      return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)!==0&&rect.width>0&&rect.height>0;
    };
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const firebaseUser=Boolean(window.firebase&&firebase.auth&&firebase.auth().currentUser);
    const data=window.CX?.data||{};
    const error=String(document.getElementById('cxDevEntryError')?.textContent||'').trim();
    const errorCategory=/usuario o contraseña/i.test(error)?'invalid':/alcance|proyecto|habilitado/i.test(error)?'scope':/cargar|contexto/i.test(error)?'context':error?'other':'none';
    return {
      contextPresent:Boolean(ctx),
      namespace:String(ctx?.authNamespace||'none'),
      role:String(ctx?.role||'none'),
      tenant:String(ctx?.tenantId||'none'),
      projectScope:Array.isArray(ctx?.projectIds)&&ctx.projectIds.includes('cinepolis'),
      firebaseUser,
      appOn:Boolean(document.getElementById('app')?.classList.contains('on')),
      loginVisible:visible(document.getElementById('cxDevEntryAuth')),
      dualChoice:Boolean(document.getElementById('cxDevDualAccess')),
      errorCategory,
      visits:Array.isArray(data._visitas)?data._visitas.length:0,
      shoppers:Array.isArray(data.shoppers)?data.shoppers.length:0,
      currentProject:String(data.currentProjectId||'none'),
      dataMode:String(window.CX?.dataSource?.mode||'none'),
      dataStatus:String(window.CX?.dataSource?.status||'none'),
      backendState:String(window.CX_BACKEND_LAST_STATE?.source||'none')
    };
  });
}

async function waitAuthenticated(page,expectedNamespace){
  try{
    await page.waitForFunction(({namespace})=>{
      const cx=window.CX;
      const ctx=cx&&cx.backendAuth&&typeof cx.backendAuth.context==='function'?cx.backendAuth.context():null;
      const appOn=document.getElementById('app')?.classList.contains('on');
      const firebaseReady=Boolean(window.firebase&&firebase.auth&&firebase.auth().currentUser);
      const visits=Array.isArray(cx?.data?._visitas)?cx.data._visitas.length:0;
      return Boolean(ctx&&ctx.authenticated===true&&ctx.authNamespace===namespace&&appOn&&firebaseReady&&visits===616);
    },{namespace:expectedNamespace},{timeout:90000});
  }catch(error){
    const s=await compactAuthState(page).catch(()=>({}));
    throw new Error(`AUTH_WAIT_TIMEOUT_NS${expectedNamespace}_CTX${s.contextPresent?1:0}_CNS${s.namespace||'NA'}_ROLE${s.role||'NA'}_TEN${s.tenant||'NA'}_PRJ${s.projectScope?1:0}_FB${s.firebaseUser?1:0}_APP${s.appOn?1:0}_FORM${s.loginVisible?1:0}_DUAL${s.dualChoice?1:0}_ERR${s.errorCategory||'NA'}_V${Number(s.visits||0)}_S${Number(s.shoppers||0)}_CP${s.currentProject||'NA'}_DM${s.dataMode||'NA'}_DS${s.dataStatus||'NA'}_BS${s.backendState||'NA'}`);
  }
}

async function snapshot(page,expectedCanonicalShopperId=''){
  return page.evaluate(({expectedCanonicalShopperId})=>{
    const isVisible=element=>{
      if(!element) return false;
      const style=getComputedStyle(element),rect=element.getBoundingClientRect();
      return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)!==0&&rect.width>0&&rect.height>0;
    };
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const d=window.CX?.data||{};
    const rawShopperId=String(ctx?.shopperId||'').trim();
    const identityMap=d.__identityMap||{};
    const mappedShopperId=String(identityMap[rawShopperId]||rawShopperId).trim();
    const canonicalShopperId=String(expectedCanonicalShopperId||mappedShopperId).trim();
    const own=canonicalShopperId&&typeof d.visitsForShopper==='function'?d.visitsForShopper(canonicalShopperId,false).length:0;
    return {
      role:ctx?.role||null,authNamespace:ctx?.authNamespace||null,tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],shopperIdPresent:Boolean(rawShopperId),rawShopperId,mappedShopperId,canonicalShopperId,
      identityMapResolved:Boolean(rawShopperId&&mappedShopperId&&mappedShopperId!==rawShopperId),
      expectedCanonicalMatch:!expectedCanonicalShopperId||mappedShopperId===expectedCanonicalShopperId||rawShopperId===expectedCanonicalShopperId,
      currentProjectId:d.currentProjectId||null,visits:Array.isArray(d._visitas)?d._visitas.length:0,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0,ownVisits:own,
      appOn:Boolean(document.getElementById('app')?.classList.contains('on')),loginVisible:isVisible(document.getElementById('cxDevEntryAuth')),
      technicalPillPresent:Boolean(document.getElementById('cxBackendPreviewStatus')),accessSelectorPresent:Boolean(document.getElementById('cxDevEntryAccessType')),
      genericRolesPresent:document.querySelectorAll('.role-btn,.role-alt').length,dualChoicePresent:Boolean(document.getElementById('cxDevDualAccess'))
    };
  },{expectedCanonicalShopperId});
}

async function assertAuthenticatedState(page,kind,credential){
  const expectedOwnVisits=kind==='shopper'?Number(credential?.expectedOwnVisits||0):0;
  const expectedCanonicalShopperId=kind==='shopper'?String(credential?.canonicalShopperId||''):'';
  const state=await snapshot(page,expectedCanonicalShopperId);
  assert(state.tenantId==='tya',kind+'_tenant_mismatch');
  assert(state.projectIds.includes('cinepolis')||state.role==='super',kind+'_project_scope_missing');
  assert(state.visits===616,kind+`_canonical_visits_mismatch_OBS${state.visits}_EXP616`);
  assert(state.appOn===true,kind+'_app_not_entered');
  assert(state.loginVisible===false,kind+'_credential_form_still_visible');
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
    assert(state.expectedCanonicalMatch===true,kind+'_identity_map_does_not_resolve_claim_to_canonical');
    assert(state.ownVisits>0,kind+'_own_history_empty');
    if(expectedOwnVisits>0) assert(state.ownVisits===expectedOwnVisits,kind+`_own_history_count_mismatch_OBS${state.ownVisits}_EXP${expectedOwnVisits}`);
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
  const first=await assertAuthenticatedState(page,kind,credential);

  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await waitAuthenticated(page,kind==='staff'?'staff':'shopper');
  const refresh=await assertAuthenticatedState(page,kind,credential);

  const second=await context.newPage();
  await second.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await waitAuthenticated(second,kind==='staff'?'staff':'shopper');
  const newTab=await assertAuthenticatedState(second,kind,credential);

  const entryErrors=errors.filter(message=>/cxDevEntry|tya-dev-entry|invalid-credential|namespace/i.test(message));
  assert(entryErrors.length===0,kind+'_entry_runtime_error');
  await second.close();
  await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch(_){}});
  await context.close();
  return {role:first.role,namespace:first.authNamespace,visits:first.visits,shoppers:first.shoppers,ownVisits:first.ownVisits,identityMapResolved:first.identityMapResolved||first.rawShopperId===first.canonicalShopperId,refreshPreserved:refresh.appOn===true,newTabPreserved:newTab.appOn===true};
}

const browser=await chromium.launch({headless:true});
try{
  let staff;try{staff=await runPrincipal(browser,'staff',credentials.staff);}catch(error){persistFailure('staff',error);throw error;}
  let shopper;try{shopper=await runPrincipal(browser,'shopper',credentials.shopper);}catch(error){persistFailure('shopper',error);throw error;}
  console.log(JSON.stringify({decision:'PASS_C6_REAL_USERS_END_TO_END',staff,shopper,credentialsExposed:false,tokensExposed:false,writes:0,production:false}));
}finally{
  await browser.close();
}
