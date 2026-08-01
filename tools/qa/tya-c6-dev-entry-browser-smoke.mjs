import fs from 'node:fs';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal=/127\.0\.0\.1|localhost/i.test(root);
const stageFile=process.env.OUT_DIR?process.env.OUT_DIR+'/stage':'';
let checkpoint='bootstrap';
let browser=null;

function mark(name){ checkpoint=name; }
function assert(condition,message){ if(!condition) throw new Error(message); }
function persist(){ if(!stageFile)return; try{fs.writeFileSync(stageFile,'human_entry__'+String(checkpoint).replace(/[^a-z0-9_-]+/gi,'_')+'\n','utf8');}catch{} }

try{
  mark('launch');
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();

  if(isLocal){
    await page.route('**/__/firebase/init.js',route=>route.fulfill({status:200,contentType:'application/javascript; charset=utf-8',body:"window.firebase&&firebase.apps&&!firebase.apps.length&&firebase.initializeApp({apiKey:'local-human-entry',authDomain:'localhost',projectId:'cxorbia-backend-dev',appId:'1:1:web:local'});"}));
    await page.route('**/api/tya/cinepolis/hr-live**',route=>route.fulfill({status:200,contentType:'application/json; charset=utf-8',body:JSON.stringify({runtimeRead:true,sourceSafe:true,visits:616,tabRegistryAutoDiscovery:true})}));
  }

  const errors=[];
  page.on('pageerror',error=>errors.push(String(error?.message||error)));

  mark('goto_bare');
  await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  mark('wait_admin');
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  mark('wait_client');
  await page.waitForSelector('.role-btn[data-role="cliente"]',{state:'visible',timeout:30000});
  mark('wait_shopper');
  await page.waitForSelector('.role-btn[data-role="shopper"]',{state:'visible',timeout:30000});

  const url=new URL(page.url());
  assert(url.searchParams.get('cxBackendPreview')==='YES_PAULA_20260628_PREVIEW_DEV','canonical_preview_token_missing');
  assert(url.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','canonical_protected_token_missing');
  assert(url.searchParams.get('cxProjectId')==='cinepolis','canonical_project_missing');
  assert(url.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','canonical_full_visual_missing');
  assert(!url.searchParams.has('cxTechnicalAuthE2E'),'technical_auth_lane_leaked_into_human_entry');

  const bodyText=await page.locator('body').innerText();
  mark('assert_copy');
  assert(bodyText.includes('Selecciona un perfil para entrar'),'approved_direct_role_copy_missing');
  assert(bodyText.includes('Administración / Coordinación'),'admin_role_label_missing');
  assert(bodyText.includes('Portal del Cliente'),'client_role_label_missing');
  assert(bodyText.includes('Shopper / Evaluador'),'shopper_role_label_missing');

  mark('assert_no_credentials');
  assert(await page.locator('#cxDevEntryAuth,#cxDevEntryLogin,#cxDevEntryPassword,#cxDevEntrySubmit,#cxIntegratedAuthStep,#cxIntegratedAuthLogin,#cxIntegratedAuthPassword').count()===0,'credential_form_visible_in_human_entry');
  assert(!bodyText.includes('Ingresa con tu usuario y contraseña'),'credential_copy_visible_in_human_entry');
  assert(!bodyText.includes('Fuente de datos no disponible'),'blocked_data_source_card_visible');
  assert(await page.locator('#cxBackendPreviewStatus').count()===0,'technical_status_visible');

  mark('assert_role_count');
  assert(await page.locator('.role-btn').count()>=3,'direct_role_buttons_missing');
  const state=await page.evaluate(()=>({gate:window.CX_DEV_ENTRY_AUTH_GATE||null,backend:window.CX?.BACKEND||null}));
  const gate=state.gate;
  assert(gate?.mode==='native-direct-role-entry','human_entry_gate_wrong_mode');
  assert(gate?.visibleRoleSelector===true,'human_role_selector_not_preserved');
  assert(gate?.usernamePasswordVisible===false,'human_entry_credentials_contract_invalid');
  assert(gate?.technicalAuthEnabled===false,'technical_auth_enabled_in_human_lane');
  assert(gate?.integratedFirebaseLoginDisabled===true,'integrated_firebase_login_not_disabled');
  assert(gate?.backendFirebaseDisabledForHumanVisual===true,'backend_firebase_not_disabled_for_human_lane');
  assert(state.backend?.enabled===false,'backend_config_enabled_in_human_lane');
  assert(state.backend?.devPreviewAuth?.enabled===false,'dev_preview_auth_enabled_in_human_lane');
  assert(gate?.writes===false&&gate?.production===false,'unsafe_human_entry_scope');

  mark('click_admin');
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForFunction(()=>document.getElementById('app')?.classList.contains('on')===true,{timeout:30000});
  const session=await page.evaluate(()=>({role:window.CX?.session?.role||null,appOn:document.getElementById('app')?.classList.contains('on')===true,integratedAuth:Boolean(document.getElementById('cxIntegratedAuthStep'))}));
  assert(session.appOn===true,'admin_direct_entry_failed');
  assert(session.role==='admin','admin_direct_entry_role_mismatch');
  assert(session.integratedAuth===false,'integrated_auth_intercepted_admin_click');

  const entryErrors=errors.filter(message=>/tya-dev-entry|cxDevEntry|native-direct-role-entry|cxIntegratedAuth/i.test(message));
  assert(entryErrors.length===0,'human_entry_runtime_error:'+entryErrors.join(' | '));

  mark('pass');
  await browser.close();
  browser=null;
  console.log('PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_BROWSER_SMOKE');
}catch(error){
  persist();
  try{if(browser)await browser.close();}catch{}
  console.error('FAIL_C6_HUMAN_DIRECT_ROLE_ENTRY checkpoint='+checkpoint+' error='+(error?.message||String(error)));
  throw error;
}
