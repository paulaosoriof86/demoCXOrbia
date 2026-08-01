import { chromium } from 'playwright';

const root = String(process.argv[2] || '').replace(/\/$/, '');
if(!root) throw new Error('DEV_ROOT_URL_REQUIRED');
const isLocal = /127\.0\.0\.1|localhost/i.test(root);

const browser = await chromium.launch({headless:true});
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

await page.goto(root + '/index-backend-dev.html', {waitUntil:'domcontentloaded', timeout:60000});
await page.waitForSelector('#cxDevEntryAuth', {state:'visible', timeout:30000});
await page.waitForSelector('#cxDevEntryLogin', {state:'visible', timeout:30000});
await page.waitForSelector('#cxDevEntryPassword', {state:'visible', timeout:30000});
await page.waitForSelector('#cxDevEntryAccessType', {state:'visible', timeout:30000});
await page.waitForSelector('#cxDevEntrySubmit', {state:'visible', timeout:30000});

const url = new URL(page.url());
function assert(condition, message){ if(!condition) throw new Error(message); }

assert(url.searchParams.get('cxBackendPreview') === 'YES_PAULA_20260628_PREVIEW_DEV', 'canonical_preview_token_missing');
assert(url.searchParams.get('cxProtectedRuntime') === 'YES_PAULA_20260730_PROTECTED_DEV', 'canonical_protected_token_missing');
assert(url.searchParams.get('cxProjectId') === 'cinepolis', 'canonical_project_missing');

const bodyText = await page.locator('body').innerText();
assert(!bodyText.includes('Fuente de datos no disponible'), 'blocked_data_source_card_visible');
assert(!bodyText.includes('Acceso seguro'), 'technical_second_login_visible');
assert(!bodyText.includes('Selecciona un perfil para entrar'), 'generic_role_picker_copy_visible');

const visibleGenericRoles = await page.locator('.role-btn:visible,.role-alt:visible').count();
assert(visibleGenericRoles === 0, 'generic_role_picker_visible');

const type = await page.locator('#cxDevEntryPassword').getAttribute('type');
assert(type === 'password', 'password_field_not_protected');
const userAutocomplete = await page.locator('#cxDevEntryLogin').getAttribute('autocomplete');
const passAutocomplete = await page.locator('#cxDevEntryPassword').getAttribute('autocomplete');
assert(userAutocomplete === 'username', 'username_autocomplete_missing');
assert(passAutocomplete === 'current-password', 'password_autocomplete_missing');

const gate = await page.evaluate(() => window.CX_DEV_ENTRY_AUTH_GATE || null);
assert(gate && gate.applied === true, 'entry_auth_gate_not_applied');
assert(gate.mode === 'single-product-login', 'entry_auth_gate_wrong_mode');
assert(gate.genericRolePickerHidden === true, 'generic_role_picker_not_hidden');
assert(gate.credentialsEmbedded === false, 'credentials_embedded_flag_invalid');
assert(gate.writes === false && gate.production === false, 'unsafe_entry_gate_scope');

const fatal = consoleErrors.filter(x => !/Firebase|auth|firestore|Failed to fetch|404|network-request-failed|API key not valid/i.test(x));
assert(fatal.length === 0, 'unexpected_page_errors:'+fatal.join(' | '));

await browser.close();
console.log('PASS_C6_DEV_ENTRY_BROWSER_SMOKE');
