import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-client-auth/private-e2e.json';
const remoteRoot=String(process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const outputFile=String(process.env.CXORBIA_CLIENT_GATE_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
const credentials=fs.existsSync(privatePath)?JSON.parse(fs.readFileSync(privatePath,'utf8')):{};
const client=credentials?.client||null;
const isLocal=/127\.0\.0\.1|localhost/i.test(root);
const persist=value=>{if(!outputFile)return;fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');};
const assert=(ok,message)=>{if(!ok)throw new Error(message);};

if(!client?.login||!client?.password){
  const hold={
    schemaVersion:'cxorbia.c6.client-auth-browser-smoke.v1',
    generatedAt:new Date().toISOString(),
    decision:'HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND',
    authenticated:false,
    existingCredentialSelected:false,
    authWrites:0,
    passwordChanges:0,
    passwordResets:0,
    credentialsExposed:false,
    tokensExposed:false,
    hostingDeploys:0,
    providerWrites:0,
    merge:false,
    production:false
  };
  persist(hold);
  console.log(JSON.stringify(hold));
  process.exit(0);
}

async function configure(context){
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

async function waitReady(page,label){
  try{
    await page.waitForFunction(()=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      const d=window.CX?.data||{};
      return Boolean(
        ctx?.authenticated===true&&ctx?.authNamespace==='staff'&&['cliente','client'].includes(String(ctx?.role||'').toLowerCase())&&
        authority?.applied===true&&authority?.periods>0&&authority?.hrVisits>0&&
        Array.isArray(d.projects)&&d.projects.length===authority.periods&&
        Array.isArray(d._visitas)&&d._visitas.length===authority.hrVisits&&
        d.currentProjectId&&d.currentPeriodId&&document.getElementById('app')?.classList.contains('on')===true
      );
    },{timeout:90000});
  }catch{
    const state=await snapshot(page,label+'_timeout');
    throw new Error(label+'_CLIENT_AUTH_RUNTIME_TIMEOUT_'+JSON.stringify(state).replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').slice(0,1200));
  }
}

async function snapshot(page,label){
  return page.evaluate(label=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const d=window.CX?.data||{};
    const view=document.getElementById('view')?.innerText||'';
    const rail=document.getElementById('rail')?.innerText||'';
    return {
      label,
      role:ctx?.role||null,
      namespace:ctx?.authNamespace||null,
      tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],
      periods:Array.isArray(d.projects)?d.projects.length:-1,
      visits:Array.isArray(d._visitas)?d._visitas.length:-1,
      currentProjectId:d.currentProjectId||null,
      currentPeriodId:d.currentPeriodId||null,
      authorityApplied:authority?.applied===true,
      authorityPeriods:Number(authority?.periods||0),
      authorityVisits:Number(authority?.hrVisits||0),
      firstPeriod:authority?.firstPeriod||null,
      latestPeriod:authority?.latestPeriod||null,
      duplicateVisitKeys:Number(authority?.duplicateVisitKeys||0),
      duplicateShopperIds:Number(authority?.duplicateShopperIds||0),
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      noProjectsVisible:view.includes('Sin proyectos disponibles')||rail.includes('Sin proyectos disponibles'),
      noPeriodsVisible:rail.includes('Sin periodos disponibles'),
      blockedVisible:view.includes('Fuente de datos no disponible'),
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true,
      credentialStepVisible:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalFormVisible:Boolean(document.getElementById('cxDevEntryAuth'))
    };
  },label);
}

function validate(state,first=null){
  assert(['cliente','client'].includes(String(state.role||'').toLowerCase()),'CLIENT_ROLE_INVALID');
  assert(state.namespace==='staff','CLIENT_NAMESPACE_INVALID');
  assert(state.tenantId==='tya','CLIENT_TENANT_INVALID');
  assert(state.projectIds.includes('cinepolis'),'CLIENT_PROJECT_SCOPE_MISSING');
  assert(state.authorityApplied&&state.periods===state.authorityPeriods&&state.visits===state.authorityVisits,'CLIENT_DYNAMIC_HR_AUTHORITY_INVALID');
  assert(state.periods>0&&state.visits>0&&state.currentProjectId&&state.currentPeriodId,'CLIENT_CONTEXT_MISSING');
  assert(state.duplicateVisitKeys===0&&state.duplicateShopperIds===0,'CLIENT_DUPLICATE_KEYS');
  assert(state.appOn&&state.loginHidden&&!state.noProjectsVisible&&!state.noPeriodsVisible&&!state.blockedVisible,'CLIENT_VISIBLE_RUNTIME_INVALID');
  assert(state.canonicalLane==='authenticated-human-canonical'&&state.technicalAuth===false,'CLIENT_HUMAN_LANE_INVALID');
  assert(!state.credentialStepVisible&&!state.technicalFormVisible,'CLIENT_CREDENTIAL_FORM_LEAKED');
  if(first){
    assert(state.periods===first.periods&&state.visits===first.visits,'CLIENT_COUNTS_CHANGED');
    assert(state.currentProjectId===first.currentProjectId&&state.currentPeriodId===first.currentPeriodId,'CLIENT_CONTEXT_CHANGED');
  }
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  await configure(context);
  const page=await context.newPage();
  await page.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="cliente"]',{state:'visible',timeout:30000});
  await page.click('.role-btn[data-role="cliente"]');
  await page.waitForSelector('#cxIntegratedAuthStep',{state:'visible',timeout:30000});
  assert(await page.locator('#cxDevEntryAuth').count()===0,'CLIENT_PARALLEL_TECHNICAL_FORM_VISIBLE');
  await page.fill('#cxIntegratedAuthLogin',client.login);
  await page.fill('#cxIntegratedAuthPassword',client.password);
  await page.click('#cxIntegratedAuthSubmit');
  await waitReady(page,'client_first');
  const first=await snapshot(page,'client_first');
  validate(first);

  const reloads=[];
  for(let i=1;i<=3;i++){
    await page.reload({waitUntil:'domcontentloaded',timeout:60000});
    await waitReady(page,'client_reload_'+i);
    const state=await snapshot(page,'client_reload_'+i);
    validate(state,first);
    reloads.push(state);
  }

  const second=await context.newPage();
  await second.goto(root+'/index-backend-dev.html',{waitUntil:'domcontentloaded',timeout:60000});
  await waitReady(second,'client_new_tab');
  const newTab=await snapshot(second,'client_new_tab');
  validate(newTab,first);
  await second.close();
  await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await context.close();

  const evidence={
    schemaVersion:'cxorbia.c6.client-auth-browser-smoke.v1',
    generatedAt:new Date().toISOString(),
    decision:'PASS_C6_CLIENT_AUTH_EXISTING_CREDENTIAL_RUNTIME',
    authenticated:true,
    existingCredentialSelected:true,
    role:first.role,
    namespace:first.namespace,
    tenantId:first.tenantId,
    projectIds:first.projectIds,
    periods:first.periods,
    visits:first.visits,
    firstPeriod:first.firstPeriod,
    latestPeriod:first.latestPeriod,
    projectId:first.currentProjectId,
    periodId:first.currentPeriodId,
    reloadsStable:reloads.length===3,
    newTabStable:newTab.appOn===true,
    authWrites:0,
    passwordChanges:0,
    passwordResets:0,
    credentialsExposed:false,
    tokensExposed:false,
    hostingDeploys:0,
    providerWrites:0,
    merge:false,
    production:false
  };
  persist(evidence);
  console.log(JSON.stringify(evidence));
}finally{
  await browser.close();
}
