import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/m8-human-validation/private-e2e.json';
const outDir=process.env.CXORBIA_M8_OUTPUT_DIR||'.tmp/m8-human-validation/runtime';
const outputFile=process.env.CXORBIA_M8_OUTPUT||path.join(outDir,'report.json');
const exactAction='M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY';
const action=String(process.env.CXORBIA_M8_ACTION||'').trim();

const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const clean=v=>String(v??'')
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL')
  .replace(/([?&](?:token|key|password|secret|auth|code)=)[^&\s]+/gi,'$1REDACTED')
  .slice(0,1800);
const safeUrl=value=>{try{const u=new URL(String(value));return u.origin+u.pathname;}catch{return clean(value);}};
const sha256=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const sortedUnique=a=>[...new Set(a.map(String))].sort();
const sameArray=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);

if(!root)throw new Error('M8_DEV_ROOT_URL_REQUIRED');
if(action!==exactAction)throw new Error('M8_ACTION_NOT_EXACT');
if(!fs.existsSync(privatePath))throw new Error('M8_PRIVATE_STAFF_CREDENTIAL_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password)throw new Error('M8_PRIVATE_STAFF_CREDENTIAL_INVALID');
if(credentials?.shopper||credentials?.client)throw new Error('M8_STAFF_SCOPE_EXCEEDED');
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(path.join(outDir,'screenshots'),{recursive:true});

function persist(value){
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');
}

function stableVisitKey(v){
  const s=x=>String(x??'').trim();
  const coord=s(v?.sourceTab)&&s(v?.sourceRow)?`${s(v.sourceTab)}::${s(v.sourceRow)}`:'';
  return s(v?.hrRowId)||coord||s(v?.visitId||v?.id);
}

async function waitReady(page,label){
  try{
    await page.waitForFunction(()=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
      const d=window.CX?.data||{};
      const ds=window.CX?.dataSource||{};
      return Boolean(
        ctx?.authenticated===true&&ctx?.authNamespace==='staff'&&ctx?.tenantId==='tya'&&
        Array.isArray(ctx?.projectIds)&&ctx.projectIds.includes('cinepolis')&&
        window.CX?.session?.user?.membershipVerified===true&&
        authority?.applied===true&&authority?.periods>0&&authority?.hrVisits>0&&
        handoff?.status==='entered'&&handoff?.membershipVerified===true&&
        Array.isArray(d.projects)&&d.projects.length===authority.periods&&
        Array.isArray(d._visitas)&&d._visitas.length===authority.hrVisits&&
        d.currentProjectId==='cinepolis'&&d.currentPeriodId&&
        ds.runtimeReadActive===true&&ds.runtimeSyncActive===false&&
        document.getElementById('app')?.classList.contains('on')===true&&
        document.getElementById('login')?.classList.contains('hidden')===true
      );
    },null,{timeout:90000});
  }catch{
    const s=await snapshot(page,label+'_timeout').catch(()=>({label}));
    throw new Error(label+'_READY_TIMEOUT_'+clean(JSON.stringify({
      role:s.role,tenantId:s.tenantId,projectIds:s.projectIds,periods:s.periods,visits:s.visits,
      latestPeriod:s.latestPeriod,dataMode:s.dataMode,dataSourceRef:s.dataSourceRef,sourceMode:s.sourceMode
    })));
  }
}

async function snapshot(page,label){
  return page.evaluate(label=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    const visits=Array.isArray(d._visitas)?d._visitas:[];
    const stableVisitKey=v=>{
      const s=x=>String(x??'').trim();
      const coord=s(v?.sourceTab)&&s(v?.sourceRow)?`${s(v.sourceTab)}::${s(v.sourceRow)}`:'';
      return s(v?.hrRowId)||coord||s(v?.visitId||v?.id);
    };
    const keys=visits.map(stableVisitKey);
    const periodKeys=Array.isArray(d.projects)?d.projects.map(p=>String(p?.periodKey||p?.key||'').trim()).filter(Boolean):[];
    const sourceLock=window.CX?.SOURCE_LOCK||window.CX_SOURCE_LOCK||null;
    return {
      label,
      role:ctx?.role||null,
      namespace:ctx?.authNamespace||null,
      tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],
      membershipVerified:window.CX?.session?.user?.membershipVerified===true,
      membershipSource:window.CX?.session?.user?.membershipSource||null,
      periods:Array.isArray(d.projects)?d.projects.length:-1,
      visits:visits.length,
      shoppers:Array.isArray(d.shoppers)?d.shoppers.length:-1,
      currentProjectId:d.currentProjectId||null,
      currentPeriodId:d.currentPeriodId||null,
      periodKeys,
      authorityApplied:authority?.applied===true,
      authorityPeriods:Number(authority?.periods||0),
      authorityVisits:Number(authority?.hrVisits||0),
      authorityShoppers:Number(authority?.hrShoppers||0),
      firstPeriod:authority?.firstPeriod||null,
      latestPeriod:authority?.latestPeriod||null,
      authorityUniqueVisitKeys:Number(authority?.uniqueVisitKeys||0),
      duplicateVisitKeys:Number(authority?.duplicateVisitKeys||0),
      duplicateShopperIds:Number(authority?.duplicateShopperIds||0),
      liveHrFetchAttempt:Number(authority?.liveHrFetchAttempt||0),
      authorityAt:authority?.at||null,
      sourceRevision:d?.previewMeta?.sourceRevision||window.CX_TYA_HR_LIVE_META?.revision||null,
      sourceReadAt:d?.previewMeta?.sourceReadAt||window.CX_TYA_HR_LIVE_META?.sourceReadAt||null,
      sourceMode:d?.sourceMode||null,
      dataStatus:ds.status||null,
      dataMode:ds.mode||null,
      dataSourceRef:ds.sourceRef||null,
      runtimeReadActive:ds.runtimeReadActive===true,
      runtimeSyncActive:ds.runtimeSyncActive===true,
      frontendHandoffStatus:handoff?.status||null,
      frontendHandoffMembershipVerified:handoff?.membershipVerified===true,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      currentView:window.CX?.session?.view||null,
      visitKeys:keys,
      missingVisitKeys:keys.filter(x=>!x).length,
      uniqueVisitKeys:new Set(keys.filter(Boolean)).size,
      buildId:window.CX?.BUILD_ID||null,
      sourceLock:sourceLock?{
        manifestFile:sourceLock.manifestFile||null,
        aggregateSha256:sourceLock.aggregateSha256||null,
        candidateId:sourceLock.candidateId||null,
        repository:sourceLock.repository||null,
        branch:sourceLock.branch||null,
        pullRequest:sourceLock.pullRequest||null,
        production:sourceLock.production===true
      }:null,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true
    };
  },label);
}

function validateCoreState(s,label){
  assert(s.appOn,label+'_APP_NOT_ON');
  assert(s.loginHidden,label+'_LOGIN_NOT_HIDDEN');
  assert(s.role==='admin'&&s.namespace==='staff',label+'_CANONICAL_ADMIN_STAFF_REQUIRED');
  assert(s.tenantId==='tya',label+'_TENANT_NOT_TYA');
  assert(s.projectIds.includes('cinepolis')&&s.currentProjectId==='cinepolis',label+'_PROJECT_NOT_CINEPOLIS');
  assert(s.membershipVerified&&s.frontendHandoffMembershipVerified&&s.frontendHandoffStatus==='entered',label+'_MEMBERSHIP_OR_HANDOFF_INVALID');
  assert(s.authorityApplied&&s.periods===s.authorityPeriods&&s.visits===s.authorityVisits,label+'_HR_AUTHORITY_COUNT_MISMATCH');
  assert(s.periods>0&&s.visits>0&&s.shoppers>0,label+'_LIVE_DATA_EMPTY');
  assert(s.firstPeriod==='2025-06',label+'_FIRST_PERIOD_DRIFT');
  assert(s.latestPeriod==='2026-08'&&s.periodKeys.includes('2026-08'),label+'_AUGUST_2026_NOT_LIVE');
  assert(s.missingVisitKeys===0&&s.uniqueVisitKeys===s.visits,label+'_MISSING_OR_DUPLICATE_STABLE_VISIT_KEYS');
  assert(s.authorityUniqueVisitKeys===s.visits&&s.duplicateVisitKeys===0&&s.duplicateShopperIds===0,label+'_AUTHORITY_DUPLICATE_INVARIANT_FAILED');
  assert(s.runtimeReadActive&&s.runtimeSyncActive===false,label+'_HR_RUNTIME_NOT_READONLY');
  assert(String(s.sourceMode||'').includes('tya_hr_live')&&String(s.dataSourceRef||'').includes('hr-live'),label+'_LIVE_HR_RUNTIME_SOURCE_NOT_ACTIVE');
  assert(s.dataMode==='connected'&&s.dataStatus==='ready',label+'_DATA_SOURCE_NOT_READY_CONNECTED');
  assert(s.canonicalLane==='authenticated-human-canonical'&&s.canonicalProtected===true&&s.technicalAuth===false,label+'_CANONICAL_HUMAN_LANE_INVALID');
  assert(s.sourceLock&&s.sourceLock.repository==='paulaosoriof86/demoCXOrbia'&&s.sourceLock.branch==='docs-tya-v6-v71-audit'&&Number(s.sourceLock.pullRequest)===7,label+'_SOURCE_LOCK_IDENTITY_INVALID');
  assert(s.sourceLock.production===false,label+'_SOURCE_LOCK_PRODUCTION_TRUE');
  assert(typeof s.sourceLock.aggregateSha256==='string'&&s.sourceLock.aggregateSha256.length===64,label+'_SOURCE_LOCK_SHA_INVALID');
  assert(s.buildId===s.sourceLock.aggregateSha256.slice(0,16),label+'_BUILD_ID_SOURCE_LOCK_MISMATCH');
}

async function routeHuman(page,id,label){
  const selector='#nav-'+id;
  await page.waitForSelector(selector,{state:'visible',timeout:15000});
  await page.click(selector);
  await page.waitForFunction(id=>window.CX?.session?.view===id,id,{timeout:15000});
  await page.waitForFunction(()=>String(document.getElementById('view')?.innerText||'').trim().length>0,null,{timeout:15000});
  const state=await page.evaluate(({id,label})=>{
    const view=document.getElementById('view');
    const text=String(view?.innerText||'').trim();
    const h=view?.querySelector('h1,h2,h3,.page-title,.section-title');
    return {
      id,label,currentView:window.CX?.session?.view||null,
      viewTextLength:text.length,
      heading:String(h?.textContent||'').trim().slice(0,140),
      navVisible:Boolean(document.querySelector('#nav-'+id)?.getClientRects().length),
      viewDigest:null
    };
  },{id,label});
  state.viewDigest=await page.evaluate(()=>{
    const text=String(document.getElementById('view')?.innerText||'').replace(/\s+/g,' ').trim();
    return text.slice(0,4000);
  }).then(text=>sha256(text));
  assert(state.currentView===id,'M8_ROUTE_'+id+'_NOT_ACTIVE');
  assert(state.navVisible&&state.viewTextLength>0,'M8_ROUTE_'+id+'_EMPTY_OR_HIDDEN');
  const file=path.join(outDir,'screenshots',String(id).replace(/[^a-z0-9_-]/gi,'_')+'.png');
  await page.screenshot({path:file,fullPage:true});
  state.screenshot=path.relative(outDir,file).replace(/\\/g,'/');
  return state;
}

async function run(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  const diagnostics={consoleErrors:[],pageErrors:[],requestFailures:[],httpErrors:[]};
  page.on('console',msg=>{if(msg.type()==='error')diagnostics.consoleErrors.push(clean(msg.text()));});
  page.on('pageerror',err=>diagnostics.pageErrors.push(clean(err?.stack||err?.message||err)));
  page.on('requestfailed',req=>diagnostics.requestFailures.push({url:safeUrl(req.url()),error:clean(req.failure()?.errorText||'request_failed')}));
  page.on('response',res=>{if(res.status()>=400){const u=new URL(res.url());const same=u.origin===new URL(root).origin;if(same)diagnostics.httpErrors.push({url:u.origin+u.pathname,status:res.status()});}});
  try{
    await page.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
    const entry=new URL(page.url());
    assert(entry.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','M8_PROTECTED_RUNTIME_FLAG_MISSING');
    assert(entry.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','M8_HUMAN_FULL_VISUAL_FLAG_MISSING');
    assert(!entry.searchParams.has('cxTechnicalAuthE2E'),'M8_TECHNICAL_AUTH_FLAG_LEAKED');

    await page.click('.role-btn[data-role="admin"]');
    await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});
    for(const selector of ['#lgUser','#lgPass','#lgSubmit'])await page.waitForSelector(selector,{state:'visible',timeout:10000});
    const loginSurface=await page.evaluate(()=>({
      canonical:Boolean(document.getElementById('loginForm')),
      role:document.getElementById('loginForm')?.dataset.selectedRole||null,
      legacyOverlay:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))
    }));
    assert(loginSurface.canonical&&loginSurface.role==='admin'&&!loginSurface.legacyOverlay&&!loginSurface.technicalForm,'M8_CANONICAL_LOGIN_SURFACE_INVALID');

    await page.fill('#lgUser',credentials.staff.login);
    await page.fill('#lgPass',credentials.staff.password);
    await page.press('#lgPass','Enter');
    await waitReady(page,'m8_initial');
    const initial=await snapshot(page,'m8_initial');
    validateCoreState(initial,'M8_INITIAL');

    const routePlan=[
      ['dashboard','Dashboard Operativo'],
      ['proyectos','Proyectos'],
      ['visitas','Visitas'],
      ['postulaciones','Postulaciones'],
      ['cert','Certificación'],
      ['financiero','Dashboard Financiero'],
      ['aprendizaje','Academia']
    ];
    const routes=[];
    for(const [id,label] of routePlan)routes.push(await routeHuman(page,id,label));
    const roleSplit=await page.evaluate(()=>({
      adminFinanceVisible:Boolean(document.querySelector('#nav-financiero')?.getClientRects().length),
      shopperBenefitsVisibleInAdmin:Boolean(document.querySelector('#nav-beneficios')?.getClientRects().length),
      benefitsModuleRoles:Array.isArray(window.CX?.MODULES?.beneficios?.roles)?window.CX.MODULES.beneficios.roles.slice():[]
    }));
    assert(roleSplit.adminFinanceVisible===true&&roleSplit.shopperBenefitsVisibleInAdmin===false&&roleSplit.benefitsModuleRoles.includes('shopper'),'M8_FINANCE_BENEFITS_ROLE_SPLIT_INVALID');

    const beforeRefresh=await snapshot(page,'m8_before_fresh_reconcile');
    validateCoreState(beforeRefresh,'M8_BEFORE_REFRESH');
    const firstReconcile=await page.evaluate(async()=>{
      if(typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY!=='function')return {ok:false,error:'RECONCILE_FUNCTION_MISSING'};
      return await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY('m8_fresh_read_reconcile_1');
    });
    assert(firstReconcile?.ok===true,'M8_FRESH_RECONCILE_1_FAILED_'+clean(JSON.stringify(firstReconcile)));
    await waitReady(page,'m8_after_fresh_reconcile_1');
    const afterFirst=await snapshot(page,'m8_after_fresh_reconcile_1');
    validateCoreState(afterFirst,'M8_AFTER_REFRESH_1');

    const secondReconcile=await page.evaluate(async()=>await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY('m8_fresh_read_reconcile_2'));
    assert(secondReconcile?.ok===true,'M8_FRESH_RECONCILE_2_FAILED_'+clean(JSON.stringify(secondReconcile)));
    await waitReady(page,'m8_after_fresh_reconcile_2');
    const afterSecond=await snapshot(page,'m8_after_fresh_reconcile_2');
    validateCoreState(afterSecond,'M8_AFTER_REFRESH_2');

    const beforeKeys=sortedUnique(beforeRefresh.visitKeys);
    const firstKeys=sortedUnique(afterFirst.visitKeys);
    const secondKeys=sortedUnique(afterSecond.visitKeys);
    const sameRevisionAfterPair=Boolean(afterFirst.sourceRevision&&afterSecond.sourceRevision&&afterFirst.sourceRevision===afterSecond.sourceRevision);
    if(sameRevisionAfterPair)assert(sameArray(firstKeys,secondKeys),'M8_SAME_REVISION_IDEMPOTENCY_FAILED');
    const addedFirst=firstKeys.filter(x=>!beforeKeys.includes(x));
    const removedFirst=beforeKeys.filter(x=>!firstKeys.includes(x));
    const addedSecond=secondKeys.filter(x=>!firstKeys.includes(x));
    const removedSecond=firstKeys.filter(x=>!secondKeys.includes(x));
    const idempotency={
      keyType:'hrRowId || sourceTab::sourceRow || visitId || id',
      beforeCount:beforeKeys.length,firstFreshCount:firstKeys.length,secondFreshCount:secondKeys.length,
      beforeRevision:beforeRefresh.sourceRevision||null,firstFreshRevision:afterFirst.sourceRevision||null,secondFreshRevision:afterSecond.sourceRevision||null,
      sameRevisionAfterPair,
      firstDelta:{added:addedFirst.length,removed:removedFirst.length},
      secondDelta:{added:addedSecond.length,removed:removedSecond.length},
      noDuplicatesAfterFirst:afterFirst.uniqueVisitKeys===afterFirst.visits&&afterFirst.duplicateVisitKeys===0,
      noDuplicatesAfterSecond:afterSecond.uniqueVisitKeys===afterSecond.visits&&afterSecond.duplicateVisitKeys===0,
      sameRevisionExactSetStable:sameRevisionAfterPair?sameArray(firstKeys,secondKeys):null
    };
    assert(idempotency.noDuplicatesAfterFirst&&idempotency.noDuplicatesAfterSecond,'M8_RECONCILE_CREATED_DUPLICATES');

    await page.screenshot({path:path.join(outDir,'screenshots','m8-after-reconcile.png'),fullPage:true});

    const fatalDiagnostics={
      pageErrors:diagnostics.pageErrors,
      sameOriginHttpErrors:diagnostics.httpErrors,
      requestFailures:diagnostics.requestFailures.filter(x=>x.url.startsWith(new URL(root).origin))
    };
    assert(fatalDiagnostics.pageErrors.length===0,'M8_PAGE_ERRORS_'+clean(JSON.stringify(fatalDiagnostics.pageErrors)));
    assert(fatalDiagnostics.sameOriginHttpErrors.length===0,'M8_HTTP_ERRORS_'+clean(JSON.stringify(fatalDiagnostics.sameOriginHttpErrors)));
    assert(fatalDiagnostics.requestFailures.length===0,'M8_REQUEST_FAILURES_'+clean(JSON.stringify(fatalDiagnostics.requestFailures)));

    const result={
      schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.v1',
      generatedAt:new Date().toISOString(),
      decision:'PASS_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',
      action:exactAction,
      devRoot:root,
      principal:{role:initial.role,namespace:initial.namespace,tenantId:initial.tenantId,projectId:initial.currentProjectId,membershipVerified:initial.membershipVerified},
      runtimeSourceMode:'live_hr_runtime',
      runtimeSourceEvidence:{sourceMode:initial.sourceMode,dataMode:initial.dataMode,dataStatus:initial.dataStatus,dataSourceRef:initial.dataSourceRef,runtimeReadActive:initial.runtimeReadActive,runtimeSyncActive:initial.runtimeSyncActive},
      liveHr:{periods:afterSecond.periods,visits:afterSecond.visits,shoppers:afterSecond.shoppers,firstPeriod:afterSecond.firstPeriod,latestPeriod:afterSecond.latestPeriod,sourceRevision:afterSecond.sourceRevision,sourceReadAt:afterSecond.sourceReadAt,liveHrFetchAttempt:afterSecond.liveHrFetchAttempt},
      routes,
      financeBenefitsRoleSplit:roleSplit,
      freshReconciliation:{first:firstReconcile?.result||firstReconcile,second:secondReconcile?.result||secondReconcile,idempotency},
      sourceLock:{buildId:afterSecond.buildId,...afterSecond.sourceLock},
      diagnostics:{
        consoleErrorCount:diagnostics.consoleErrors.length,
        consoleErrors:diagnostics.consoleErrors.slice(0,30),
        pageErrorCount:diagnostics.pageErrors.length,
        sameOriginHttpErrorCount:diagnostics.httpErrors.length,
        sameOriginRequestFailureCount:fatalDiagnostics.requestFailures.length
      },
      screenshots:['screenshots/dashboard.png','screenshots/proyectos.png','screenshots/visitas.png','screenshots/postulaciones.png','screenshots/cert.png','screenshots/financiero.png','screenshots/aprendizaje.png','screenshots/m8-after-reconcile.png'],
      safety:{hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},
      credentialsExposed:false,
      tokensExposed:false
    };
    persist(result);
    await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
    return result;
  }finally{
    await context.close().catch(()=>{});
    await browser.close().catch(()=>{});
  }
}

try{
  const result=await run();
  console.log(JSON.stringify(result));
}catch(error){
  const failure={
    schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.failure.v1',
    generatedAt:new Date().toISOString(),
    decision:'FAIL_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',
    action:exactAction,
    devRoot:root,
    error:clean(error?.stack||error?.message||error),
    safety:{hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},
    credentialsExposed:false,
    tokensExposed:false
  };
  persist(failure);
  console.error(JSON.stringify(failure));
  process.exitCode=1;
}
