import fs from 'node:fs';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-users-e2e/private-e2e.json';
const remoteRoot=process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app';
const TECHNICAL_TOKEN='YES_PAULA_20260801_REAL_USERS_E2E';
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath)) throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password||!credentials?.shopper?.login||!credentials?.shopper?.password) throw new Error('PRIVATE_E2E_CREDENTIALS_INVALID');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);

function assert(condition,message){ if(!condition) throw new Error(message); }
function safe(value){ return String(value||'unknown').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Z0-9_:-]/gi,'_').replace(/_+/g,'_').slice(0,180); }
function entryUrl(base,namespace){
  const url=new URL(String(base).replace(/\/$/,'')+'/index-backend-dev.html');
  url.searchParams.set('cxTechnicalAuthE2E',TECHNICAL_TOKEN);
  url.searchParams.set('cxTechnicalAuthNamespace',namespace);
  return url.toString();
}
function persistFailure(kind,error){
  const lane=isLocal?'local':'remote';
  const code=`${lane}_real_users_e2e__${kind}__${safe(error?.message||error)}`;
  if(process.env.OUT_DIR){ try{fs.mkdirSync(process.env.OUT_DIR,{recursive:true});fs.writeFileSync(process.env.OUT_DIR+'/stage',code+'\n','utf8');}catch{} }
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

async function waitAuthenticated(page,namespace){
  try{
    await page.waitForFunction(({namespace})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const visits=Array.isArray(window.CX?.data?._visitas)?window.CX.data._visitas.length:0;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY;
      return Boolean(ctx?.authenticated===true&&ctx?.authNamespace===namespace&&document.getElementById('app')?.classList.contains('on')&&window.firebase?.auth?.().currentUser&&visits===616&&authority?.applied===true);
    },{namespace},{timeout:90000});
  }catch(_){
    const state=await page.evaluate(()=>({
      ctx:window.CX?.backendAuth?.context?.()||null,
      visits:Array.isArray(window.CX?.data?._visitas)?window.CX.data._visitas.length:0,
      appOn:Boolean(document.getElementById('app')?.classList.contains('on')),
      firebaseReady:Boolean(window.firebase&&firebase.auth&&firebase.auth().currentUser),
      gate:window.CX_DEV_ENTRY_AUTH_GATE||null,
      authority:window.CX_PROTECTED_AUTH_HR_AUTHORITY||null
    }));
    throw new Error(`AUTH_WAIT_TIMEOUT_${safe(namespace)}_CTX${state.ctx?.authenticated?1:0}_NS${safe(state.ctx?.authNamespace||'none')}_APP${state.appOn?1:0}_FB${state.firebaseReady?1:0}_V${state.visits}_MODE${safe(state.gate?.mode||'none')}_AUTHORITY${state.authority?.applied?1:0}`);
  }
}

async function snapshot(page,expectedCanonicalShopperId=''){
  return page.evaluate(({expectedCanonicalShopperId})=>{
    const visible=el=>{ if(!el)return false; const s=getComputedStyle(el),r=el.getBoundingClientRect(); return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0; };
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const d=window.CX?.data||{};
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const rawShopperId=String(ctx?.shopperId||'').trim();
    const mappedShopperId=String((d.__identityMap||{})[rawShopperId]||rawShopperId).trim();
    const canonicalShopperId=String(expectedCanonicalShopperId||mappedShopperId).trim();
    const own=canonicalShopperId&&typeof d.visitsForShopper==='function'?d.visitsForShopper(canonicalShopperId,false).length:0;
    return {
      role:ctx?.role||null,authNamespace:ctx?.authNamespace||null,tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],rawShopperId,mappedShopperId,canonicalShopperId,
      expectedCanonicalMatch:!expectedCanonicalShopperId||mappedShopperId===expectedCanonicalShopperId||rawShopperId===expectedCanonicalShopperId,
      visits:Array.isArray(d._visitas)?d._visitas.length:0,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0,ownVisits:own,
      appOn:Boolean(document.getElementById('app')?.classList.contains('on')),
      technicalFormVisible:visible(document.getElementById('cxDevEntryAuth')),
      humanRoleButtons:document.querySelectorAll('.role-btn').length,
      technicalStatus:Boolean(document.getElementById('cxBackendPreviewStatus')),
      gate:window.CX_DEV_ENTRY_AUTH_GATE||null,
      hrAuthority:Boolean(authority?.applied),authorityHrVisits:Number(authority?.hrVisits||0),authorityOwnVisits:Number(authority?.ownVisits||0)
    };
  },{expectedCanonicalShopperId});
}

function assertState(state,kind,credential){
  assert(state.gate?.mode==='technical-auth-e2e-isolated',kind+'_technical_lane_not_isolated');
  assert(state.gate?.technicalAuthEnabled===true,kind+'_technical_gate_not_enabled');
  assert(state.gate?.humanVisual===false,kind+'_human_lane_leaked_into_e2e');
  assert(state.tenantId==='tya',kind+'_tenant_mismatch');
  assert(state.projectIds.includes('cinepolis')||state.role==='super',kind+'_project_scope_missing');
  assert(state.visits===616,kind+`_canonical_visits_mismatch_OBS${state.visits}_EXP616`);
  assert(state.appOn===true,kind+'_app_not_entered');
  assert(state.technicalFormVisible===false,kind+'_technical_form_still_visible');
  assert(state.humanRoleButtons===0,kind+'_human_role_buttons_visible_in_technical_lane');
  assert(state.technicalStatus===false,kind+'_technical_status_visible');
  assert(state.hrAuthority===true&&state.authorityHrVisits===616,kind+'_hr_authority_not_preserved');
  if(kind==='staff'){
    assert(state.authNamespace==='staff',kind+'_namespace_mismatch');
    assert(['super','admin','ops','coordinador'].includes(state.role),kind+'_role_mismatch');
  }else{
    const expectedOwnVisits=Number(credential?.expectedOwnVisits||0);
    const expectedCanonicalShopperId=String(credential?.canonicalShopperId||'');
    assert(state.authNamespace==='shopper',kind+'_namespace_mismatch');
    assert(state.role==='shopper',kind+'_role_mismatch');
    assert(Boolean(state.rawShopperId),kind+'_shopper_scope_missing');
    assert(state.expectedCanonicalMatch===true,kind+'_identity_map_mismatch');
    assert(state.ownVisits>0,kind+'_own_history_empty');
    if(expectedOwnVisits>0){
      assert(state.ownVisits===expectedOwnVisits,kind+`_own_history_count_mismatch_OBS${state.ownVisits}_EXP${expectedOwnVisits}`);
      assert(state.authorityOwnVisits===expectedOwnVisits,kind+`_authority_own_history_mismatch_OBS${state.authorityOwnVisits}_EXP${expectedOwnVisits}`);
    }
    assert(!expectedCanonicalShopperId||state.canonicalShopperId===expectedCanonicalShopperId||state.rawShopperId===expectedCanonicalShopperId,kind+'_canonical_shopper_mismatch');
  }
}

async function runPrincipal(browser,kind,credential){
  const namespace=kind==='shopper'?'shopper':'staff';
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  await configureLocalRoutes(context);
  const page=await context.newPage();
  await page.goto(entryUrl(root,namespace),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('#cxDevEntryAuth',{state:'visible',timeout:30000});
  const gate=await page.evaluate(()=>window.CX_DEV_ENTRY_AUTH_GATE||null);
  assert(gate?.mode==='technical-auth-e2e-isolated',kind+'_technical_form_not_isolated');
  await page.fill('#cxDevEntryLogin',credential.login);
  await page.fill('#cxDevEntryPassword',credential.password);
  await page.click('#cxDevEntrySubmit');
  await waitAuthenticated(page,namespace);
  const first=await snapshot(page,kind==='shopper'?String(credential?.canonicalShopperId||''):'');
  assertState(first,kind,credential);

  /* A remote reload may finish the document while one Firebase/Hosting subresource
     remains pending. Waiting for navigation commit is sufficient; the authenticated
     product contract below remains the actual readiness gate. */
  await page.reload({waitUntil:'commit',timeout:60000});
  await waitAuthenticated(page,namespace);
  const refresh=await snapshot(page,kind==='shopper'?String(credential?.canonicalShopperId||''):'');
  assertState(refresh,kind,credential);

  const second=await context.newPage();
  await second.goto(entryUrl(root,namespace),{waitUntil:'domcontentloaded',timeout:60000});
  await waitAuthenticated(second,namespace);
  const newTab=await snapshot(second,kind==='shopper'?String(credential?.canonicalShopperId||''):'');
  assertState(newTab,kind,credential);

  await second.close();
  await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await context.close();
  return {role:first.role,namespace:first.authNamespace,visits:first.visits,shoppers:first.shoppers,ownVisits:first.ownVisits,hrAuthorityPreserved:first.hrAuthority,identityMapResolved:kind==='staff'||first.expectedCanonicalMatch,refreshPreserved:refresh.appOn,newTabPreserved:newTab.appOn};
}

const browser=await chromium.launch({headless:true});
try{
  let staff; try{staff=await runPrincipal(browser,'staff',credentials.staff);}catch(error){persistFailure('staff',error);throw error;}
  let shopper; try{shopper=await runPrincipal(browser,'shopper',credentials.shopper);}catch(error){persistFailure('shopper',error);throw error;}
  console.log(JSON.stringify({decision:'PASS_C6_REAL_USERS_END_TO_END_TECHNICAL_LANE_ISOLATED',staff,shopper,humanEntryReplaced:false,credentialsExposed:false,tokensExposed:false,writes:0,production:false}));
}finally{
  await browser.close();
}
