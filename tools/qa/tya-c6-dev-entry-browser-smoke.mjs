import fs from 'node:fs';
import { chromium } from 'playwright';

const root = String(process.argv[2] || '').replace(/\/$/, '');
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal = /127\.0\.0\.1|localhost/i.test(root);
const stageFile = process.env.OUT_DIR ? process.env.OUT_DIR + '/stage' : '';
let checkpoint = 'bootstrap';
let browser = null;

function mark(name){ checkpoint = name; }
function assert(condition, message){ if(!condition) throw new Error(message); }
function persistCheckpoint(){
  if(!stageFile) return;
  const safe = String(checkpoint || 'unknown').replace(/[^a-z0-9_-]+/gi,'_').slice(0,80);
  try{ fs.writeFileSync(stageFile, 'local_browser__' + safe + '\n', 'utf8'); }catch(_){ }
}

try{
  mark('launch_chromium');
  browser = await chromium.launch({headless:true});
  const context = await browser.newContext({
    viewport:{width:1440,height:1000},
    ignoreHTTPSErrors:true,
    serviceWorkers:'block'
  });

  await context.addInitScript(() => {
    try{
      localStorage.setItem('cx_data_mode','connected');
      sessionStorage.removeItem('CXORBIA_PREVIEW_DEV_APPROVED');
    }catch(_){ }
  });

  const page = await context.newPage();
  if(isLocal){
    await page.route('**/__/firebase/init.js', route => route.fulfill({
      status:200,
      contentType:'application/javascript; charset=utf-8',
      body:"window.firebase&&firebase.apps&&!firebase.apps.length&&firebase.initializeApp({apiKey:'local-browser-smoke',authDomain:'localhost',projectId:'cxorbia-backend-dev',appId:'1:1:web:local'});"
    }));
    await page.route('**/api/tya/cinepolis/hr-live**', route => route.fulfill({
      status:200,
      contentType:'application/json; charset=utf-8',
      body:JSON.stringify({runtimeRead:true,sourceSafe:true,visits:616,tabRegistryAutoDiscovery:true})
    }));
  }

  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(String(err && err.message || err)));

  mark('goto_bare_entry');
  await page.goto(root + '/index-backend-dev.html', {waitUntil:'domcontentloaded', timeout:60000});
  mark('wait_direct_form');
  await page.waitForSelector('#cxDevEntryAuth', {state:'visible', timeout:30000});
  mark('wait_username');
  await page.waitForSelector('#cxDevEntryLogin', {state:'visible', timeout:30000});
  mark('wait_password');
  await page.waitForSelector('#cxDevEntryPassword', {state:'visible', timeout:30000});
  mark('wait_access_type');
  await page.waitForSelector('#cxDevEntryAccessType', {state:'visible', timeout:30000});
  mark('wait_submit');
  await page.waitForSelector('#cxDevEntrySubmit', {state:'visible', timeout:30000});

  const url = new URL(page.url());
  mark('assert_preview_token');
  assert(url.searchParams.get('cxBackendPreview') === 'YES_PAULA_20260628_PREVIEW_DEV', 'canonical_preview_token_missing');
  mark('assert_protected_token');
  assert(url.searchParams.get('cxProtectedRuntime') === 'YES_PAULA_20260730_PROTECTED_DEV', 'canonical_protected_token_missing');
  mark('assert_project');
  assert(url.searchParams.get('cxProjectId') === 'cinepolis', 'canonical_project_missing');

  const bodyText = await page.locator('body').innerText();
  mark('assert_no_blocked_card');
  assert(!bodyText.includes('Fuente de datos no disponible'), 'blocked_data_source_card_visible');
  mark('assert_no_technical_login');
  assert(!bodyText.includes('Acceso seguro'), 'technical_second_login_visible');
  mark('assert_no_generic_copy');
  assert(!bodyText.includes('Selecciona un perfil para entrar'), 'generic_role_picker_copy_visible');

  mark('assert_no_generic_roles');
  const visibleGenericRoles = await page.locator('.role-btn:visible,.role-alt:visible').count();
  assert(visibleGenericRoles === 0, 'generic_role_picker_visible');

  mark('assert_password_type');
  const type = await page.locator('#cxDevEntryPassword').getAttribute('type');
  assert(type === 'password', 'password_field_not_protected');
  mark('assert_autocomplete');
  const userAutocomplete = await page.locator('#cxDevEntryLogin').getAttribute('autocomplete');
  const passAutocomplete = await page.locator('#cxDevEntryPassword').getAttribute('autocomplete');
  assert(userAutocomplete === 'username', 'username_autocomplete_missing');
  assert(passAutocomplete === 'current-password', 'password_autocomplete_missing');

  mark('assert_gate_state');
  const gate = await page.evaluate(() => window.CX_DEV_ENTRY_AUTH_GATE || null);
  assert(gate && gate.applied === true, 'entry_auth_gate_not_applied');
  assert(gate.mode === 'single-product-login', 'entry_auth_gate_wrong_mode');
  assert(gate.genericRolePickerHidden === true, 'generic_role_picker_not_hidden');
  assert(gate.credentialsEmbedded === false, 'credentials_embedded_flag_invalid');
  assert(gate.writes === false && gate.production === false, 'unsafe_entry_gate_scope');

  mark('assert_no_entry_errors');
  const entryFatal = consoleErrors.filter(x => /tya-dev-entry|cxDevEntry|patchProductEntry|renderDirectProductLogin/i.test(x));
  assert(entryFatal.length === 0, 'entry_gate_page_errors:'+entryFatal.join(' | '));

  mark('pass');
  await browser.close();
  browser = null;
  console.log('PASS_C6_DEV_ENTRY_BROWSER_SMOKE');
}catch(error){
  persistCheckpoint();
  try{ if(browser) await browser.close(); }catch(_){ }
  console.error('FAIL_C6_DEV_ENTRY_BROWSER_SMOKE checkpoint='+checkpoint+' error='+(error&&error.message?error.message:String(error)));
  throw error;
}
