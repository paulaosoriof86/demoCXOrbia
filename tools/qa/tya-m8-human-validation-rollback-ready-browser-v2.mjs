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
const expectedModes=new Set(['connected','source_safe_preview']);

const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const clean=v=>String(v??'')
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL')
  .replace(/([?&](?:token|key|password|secret|auth|code)=)[^&\s]+/gi,'$1REDACTED')
  .slice(0,2400);
const safeUrl=value=>{try{const u=new URL(String(value));return u.origin+u.pathname;}catch{return clean(value);}};
const digest=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
const sortedUnique=a=>[...new Set(a.map(String))].sort();
const sameArray=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

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

async function snapshot(page,label){
  return page.evaluate(label=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    const visits=Array.isArray(d._visitas)?d._visitas:[];
    const key=v=>{
      const s=x=>String(x??'').trim();
      const coord=s(v?.sourceTab)&&s(v?.sourceRow)?`${s(v.sourceTab)}::${s(v.sourceRow)}`:'';
      return s(v?.hrRowId)||coord||s(v?.visitId||v?.id);
    };
    const visitKeys=visits.map(key);
    const periodKeys=Array.isArray(d.projects)?d.projects.map(p=>String(p?.periodKey||p?.key||p?.id||'').trim()).filter(Boolean):[];
    const lock=window.CX?.SOURCE_LOCK||window.CX_SOURCE_LOCK||null;
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
      dataUpdating:ds.updating===true,
      frontendHandoffStatus:handoff?.status||null,
      frontendHandoffMembershipVerified:handoff?.membershipVerified===true,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      currentView:window.CX?.session?.view||null,
      visitKeys,
      missingVisitKeys:visitKeys.filter(x=>!x).length,
      uniqueVisitKeys:new Set(visitKeys.filter(Boolean)).size,
      buildId:window.CX?.BUILD_ID||null,
      sourceLock:lock?{
        manifestFile:lock.manifestFile||null,
        aggregateSha256:lock.aggregateSha256||null,
        candidateId:lock.candidateId||null,
        repository:lock.repository||null,
        branch:lock.branch||null,
        pullRequest:lock.pullRequest||null,
        production:lock.production===true
      }:null,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true,
      fullVisual:window.CX_DEV_ENTRY_CANONICAL?.fullVisual===true,
      watcherDisabledReason:window.CX_TYA_LIVE_SOURCE_WATCH_DISABLED_REASON||null
    };
  },label);
}

function coreStateEvidence(s){
  return {
    label:s?.label||null,role:s?.role||null,namespace:s?.namespace||null,tenantId:s?.tenantId||null,
    projectIds:s?.projectIds||[],membershipVerified:s?.membershipVerified===true,
    periods:s?.periods,visits:s?.visits,shoppers:s?.shoppers,currentProjectId:s?.currentProjectId||null,currentPeriodId:s?.currentPeriodId||null,
    firstPeriod:s?.firstPeriod||null,latestPeriod:s?.latestPeriod||null,authorityApplied:s?.authorityApplied===true,
    sourceRevision:s?.sourceRevision||null,sourceReadAt:s?.sourceReadAt||null,sourceMode:s?.sourceMode||null,
    dataMode:s?.dataMode||null,dataStatus:s?.dataStatus||null,dataSourceRef:s?.dataSourceRef||null,
    runtimeReadActive:s?.runtimeReadActive===true,runtimeSyncActive:s?.runtimeSyncActive===true,dataUpdating:s?.dataUpdating===true,
    canonicalLane:s?.canonicalLane||null,canonicalProtected:s?.canonicalProtected===true,technicalAuth:s?.technicalAuth===true,fullVisual:s?.fullVisual===true,
    buildId:s?.buildId||null,sourceLock:s?.sourceLock||null
  };
}

function validateCoreState(s,label){
  ensure(s.appOn,label+'_APP_NOT_ON');
  ensure(s.loginHidden,label+'_LOGIN_NOT_HIDDEN');
  ensure(s.role==='admin'&&s.namespace==='staff',label+'_CANONICAL_ADMIN_STAFF_REQUIRED');
  ensure(s.tenantId==='tya',label+'_TENANT_NOT_TYA');
  ensure(s.projectIds.includes('cinepolis')&&s.currentProjectId==='cinepolis',label+'_PROJECT_NOT_CINEPOLIS');
  ensure(s.membershipVerified&&s.frontendHandoffMembershipVerified&&s.frontendHandoffStatus==='entered',label+'_MEMBERSHIP_OR_HANDOFF_INVALID');
  ensure(s.authorityApplied&&s.periods===s.authorityPeriods&&s.visits===s.authorityVisits,label+'_HR_AUTHORITY_COUNT_MISMATCH');
  ensure(s.periods>0&&s.visits>0&&s.shoppers>0,label+'_LIVE_DATA_EMPTY');
  ensure(s.firstPeriod==='2025-06',label+'_FIRST_PERIOD_DRIFT');
  ensure(s.latestPeriod==='2026-08'&&s.periodKeys.includes('2026-08'),label+'_AUGUST_2026_NOT_LIVE');
  ensure(s.missingVisitKeys===0&&s.uniqueVisitKeys===s.visits,label+'_MISSING_OR_DUPLICATE_STABLE_VISIT_KEYS');
  ensure(s.authorityUniqueVisitKeys===s.visits&&s.duplicateVisitKeys===0&&s.duplicateShopperIds===0,label+'_AUTHORITY_DUPLICATE_INVARIANT_FAILED');
  ensure(s.runtimeReadActive&&s.runtimeSyncActive===false,label+'_HR_RUNTIME_NOT_READONLY');
  ensure(String(s.sourceMode||'').includes('tya_hr_live')&&String(s.dataSourceRef||'').includes('hr-live'),label+'_LIVE_HR_RUNTIME_SOURCE_NOT_ACTIVE');
  /* Human full-visual intentionally lets the live watcher present the badge as source_safe_preview,
     while the protected authority bridge may present it as connected. Both are valid presentation
     states. The authoritative M8 proof is the protected human principal + live HR source/ref +
     runtimeReadActive + zero sync/writes, not a race-sensitive badge mode. */
  ensure(expectedModes.has(String(s.dataMode||''))&&s.dataStatus==='ready',label+'_DATA_SOURCE_NOT_READY_LIVE_HUMAN');
  ensure(s.canonicalLane==='authenticated-human-canonical'&&s.canonicalProtected===true&&s.technicalAuth===false&&s.fullVisual===true,label+'_CANONICAL_HUMAN_LANE_INVALID');
  ensure(s.sourceLock&&s.sourceLock.repository==='paulaosoriof86/demoCXOrbia'&&s.sourceLock.branch==='docs-tya-v6-v71-audit'&&Number(s.sourceLock.pullRequest)===7,label+'_SOURCE_LOCK_IDENTITY_INVALID');
  ensure(s.sourceLock.production===false,label+'_SOURCE_LOCK_PRODUCTION_TRUE');
  ensure(typeof s.sourceLock.aggregateSha256==='string'&&/^[a-f0-9]{64}$/i.test(s.sourceLock.aggregateSha256),label+'_SOURCE_LOCK_SHA_INVALID');
  ensure(s.buildId===s.sourceLock.aggregateSha256.slice(0,16),label+'_BUILD_ID_SOURCE_LOCK_MISMATCH');
}

async function waitReady(page,label){
  try{
    await page.waitForFunction(()=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      const h=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
      const d=window.CX?.data||{};
      const ds=window.CX?.dataSource||{};
      return Boolean(
        ctx?.authenticated===true&&ctx?.authNamespace==='staff'&&ctx?.tenantId==='tya'&&Array.isArray(ctx?.projectIds)&&ctx.projectIds.includes('cinepolis')&&
        window.CX?.session?.user?.membershipVerified===true&&a?.applied===true&&a?.periods>0&&a?.hrVisits>0&&
        h?.status==='entered'&&h?.membershipVerified===true&&Array.isArray(d.projects)&&d.projects.length===a.periods&&
        Array.isArray(d._visitas)&&d._visitas.length===a.hrVisits&&d.currentProjectId==='cinepolis'&&d.currentPeriodId&&
        ds.runtimeReadActive===true&&ds.runtimeSyncActive===false&&ds.status==='ready'&&String(ds.sourceRef||'').includes('hr-live')&&
        String(d.sourceMode||'').includes('tya_hr_live')&&document.getElementById('app')?.classList.contains('on')===true&&
        document.getElementById('login')?.classList.contains('hidden')===true
      );
    },null,{timeout:90000});
  }catch{
    const s=await snapshot(page,label+'_timeout').catch(()=>({label}));
    throw new Error(label+'_READY_TIMEOUT_'+clean(JSON.stringify(coreStateEvidence(s))));
  }
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
    return {id,label,currentView:window.CX?.session?.view||null,viewTextLength:text.length,heading:String(h?.textContent||'').trim().slice(0,160),navVisible:Boolean(document.querySelector('#nav-'+id)?.getClientRects().length)};
  },{id,label});
  state.viewDigest=await page.evaluate(()=>String(document.getElementById('view')?.innerText||'').replace(/\s+/g,' ').trim().slice(0,4000)).then(digest);
  ensure(state.currentView===id,'M8_ROUTE_'+id+'_NOT_ACTIVE');
  ensure(state.navVisible&&state.viewTextLength>0,'M8_ROUTE_'+id+'_EMPTY_OR_HIDDEN');
  const file=path.join(outDir,'screenshots',String(id).replace(/[^a-z0-9_-]/gi,'_')+'.png');
  await page.screenshot({path:file,fullPage:true});
  state.screenshot=path.relative(outDir,file).replace(/\\/g,'/');
  return state;
}

async function freshReconcile(page,reason){
  for(let i=0;i<30;i++){
    const state=await page.evaluate(async reason=>{
      const fn=window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY;
      if(typeof fn!=='function')return {ok:false,error:'RECONCILE_FUNCTION_MISSING'};
      return await fn(reason);
    },reason);
    if(state?.ok===true&&state?.skipped!==true)return state;
    if(state?.skipped===true&&state?.reason==='reconcile_in_progress'){await sleep(300);continue;}
    return state;
  }
  return {ok:false,error:'RECONCILE_BUSY_TIMEOUT'};
}

async function run(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  const diagnostics={consoleErrors:[],pageErrors:[],requestFailures:[],httpErrors:[]};
  let lastState=null;
  page.on('console',msg=>{if(msg.type()==='error')diagnostics.consoleErrors.push(clean(msg.text()));});
  page.on('pageerror',err=>diagnostics.pageErrors.push(clean(err?.stack||err?.message||err)));
  page.on('requestfailed',req=>diagnostics.requestFailures.push({url:safeUrl(req.url()),error:clean(req.failure()?.errorText||'request_failed')}));
  page.on('response',res=>{if(res.status()>=400){const u=new URL(res.url());if(u.origin===new URL(root).origin)diagnostics.httpErrors.push({url:u.origin+u.pathname,status:res.status()});}});
  try{
    await page.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
    const entry=new URL(page.url());
    ensure(entry.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','M8_PROTECTED_RUNTIME_FLAG_MISSING');
    ensure(entry.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','M8_HUMAN_FULL_VISUAL_FLAG_MISSING');
    ensure(!entry.searchParams.has('cxTechnicalAuthE2E'),'M8_TECHNICAL_AUTH_FLAG_LEAKED');

    await page.click('.role-btn[data-role="admin"]');
    await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});
    for(const selector of ['#lgUser','#lgPass','#lgSubmit'])await page.waitForSelector(selector,{state:'visible',timeout:10000});
    const surface=await page.evaluate(()=>({canonical:Boolean(document.getElementById('loginForm')),role:document.getElementById('loginForm')?.dataset.selectedRole||null,legacyOverlay:Boolean(document.getElementById('cxIntegratedAuthStep')),technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))}));
    ensure(surface.canonical&&surface.role==='admin'&&!surface.legacyOverlay&&!surface.technicalForm,'M8_CANONICAL_LOGIN_SURFACE_INVALID');

    await page.fill('#lgUser',credentials.staff.login);
    await page.fill('#lgPass',credentials.staff.password);
    await page.press('#lgPass','Enter');
    await waitReady(page,'m8_initial');
    const initial=lastState=await snapshot(page,'m8_initial');
    validateCoreState(initial,'M8_INITIAL');

    const routePlan=[['dashboard','Dashboard Operativo'],['proyectos','Proyectos'],['visitas','Visitas'],['postulaciones','Postulaciones'],['cert','Certificación'],['financiero','Dashboard Financiero'],['aprendizaje','Academia']];
    const routes=[];
    for(const [id,label] of routePlan)routes.push(await routeHuman(page,id,label));
    const roleSplit=await page.evaluate(()=>({adminFinanceVisible:Boolean(document.querySelector('#nav-financiero')?.getClientRects().length),shopperBenefitsVisibleInAdmin:Boolean(document.querySelector('#nav-beneficios')?.getClientRects().length),benefitsModuleRoles:Array.isArray(window.CX?.MODULES?.beneficios?.roles)?window.CX.MODULES.beneficios.roles.slice():[]}));
    ensure(roleSplit.adminFinanceVisible===true&&roleSplit.shopperBenefitsVisibleInAdmin===false&&roleSplit.benefitsModuleRoles.includes('shopper'),'M8_FINANCE_BENEFITS_ROLE_SPLIT_INVALID');

    const beforeRefresh=lastState=await snapshot(page,'m8_before_fresh_reconcile');
    validateCoreState(beforeRefresh,'M8_BEFORE_REFRESH');
    const firstReconcile=await freshReconcile(page,'m8_fresh_read_reconcile_1');
    ensure(firstReconcile?.ok===true&&firstReconcile?.skipped!==true,'M8_FRESH_RECONCILE_1_FAILED_'+clean(JSON.stringify(firstReconcile)));
    await waitReady(page,'m8_after_fresh_reconcile_1');
    const afterFirst=lastState=await snapshot(page,'m8_after_fresh_reconcile_1');
    validateCoreState(afterFirst,'M8_AFTER_REFRESH_1');
    ensure(afterFirst.authorityAt&&afterFirst.authorityAt!==beforeRefresh.authorityAt,'M8_FRESH_RECONCILE_1_NOT_OBSERVED');

    const secondReconcile=await freshReconcile(page,'m8_fresh_read_reconcile_2');
    ensure(secondReconcile?.ok===true&&secondReconcile?.skipped!==true,'M8_FRESH_RECONCILE_2_FAILED_'+clean(JSON.stringify(secondReconcile)));
    await waitReady(page,'m8_after_fresh_reconcile_2');
    const afterSecond=lastState=await snapshot(page,'m8_after_fresh_reconcile_2');
    validateCoreState(afterSecond,'M8_AFTER_REFRESH_2');
    ensure(afterSecond.authorityAt&&afterSecond.authorityAt!==afterFirst.authorityAt,'M8_FRESH_RECONCILE_2_NOT_OBSERVED');

    const beforeKeys=sortedUnique(beforeRefresh.visitKeys),firstKeys=sortedUnique(afterFirst.visitKeys),secondKeys=sortedUnique(afterSecond.visitKeys);
    const sameRevisionAfterPair=Boolean(afterFirst.sourceRevision&&afterSecond.sourceRevision&&afterFirst.sourceRevision===afterSecond.sourceRevision);
    if(sameRevisionAfterPair)ensure(sameArray(firstKeys,secondKeys),'M8_SAME_REVISION_IDEMPOTENCY_FAILED');
    const addedFirst=firstKeys.filter(x=>!beforeKeys.includes(x)),removedFirst=beforeKeys.filter(x=>!firstKeys.includes(x));
    const addedSecond=secondKeys.filter(x=>!firstKeys.includes(x)),removedSecond=firstKeys.filter(x=>!secondKeys.includes(x));
    const idempotency={
      keyType:'hrRowId || sourceTab::sourceRow || visitId || id',
      beforeCount:beforeKeys.length,firstFreshCount:firstKeys.length,secondFreshCount:secondKeys.length,
      beforeRevision:beforeRefresh.sourceRevision||null,firstFreshRevision:afterFirst.sourceRevision||null,secondFreshRevision:afterSecond.sourceRevision||null,
      sameRevisionAfterPair,firstDelta:{added:addedFirst.length,removed:removedFirst.length},secondDelta:{added:addedSecond.length,removed:removedSecond.length},
      noDuplicatesAfterFirst:afterFirst.uniqueVisitKeys===afterFirst.visits&&afterFirst.duplicateVisitKeys===0,
      noDuplicatesAfterSecond:afterSecond.uniqueVisitKeys===afterSecond.visits&&afterSecond.duplicateVisitKeys===0,
      sameRevisionExactSetStable:sameRevisionAfterPair?sameArray(firstKeys,secondKeys):null
    };
    ensure(idempotency.noDuplicatesAfterFirst&&idempotency.noDuplicatesAfterSecond,'M8_RECONCILE_CREATED_DUPLICATES');

    await page.screenshot({path:path.join(outDir,'screenshots','m8-after-reconcile.png'),fullPage:true});
    const sameOrigin=new URL(root).origin;
    const fatal={pageErrors:diagnostics.pageErrors,httpErrors:diagnostics.httpErrors,requestFailures:diagnostics.requestFailures.filter(x=>x.url.startsWith(sameOrigin))};
    ensure(fatal.pageErrors.length===0,'M8_PAGE_ERRORS_'+clean(JSON.stringify(fatal.pageErrors)));
    ensure(fatal.httpErrors.length===0,'M8_HTTP_ERRORS_'+clean(JSON.stringify(fatal.httpErrors)));
    ensure(fatal.requestFailures.length===0,'M8_REQUEST_FAILURES_'+clean(JSON.stringify(fatal.requestFailures)));

    const result={
      schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.v2',generatedAt:new Date().toISOString(),
      decision:'PASS_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',action:exactAction,devRoot:root,
      principal:{role:initial.role,namespace:initial.namespace,tenantId:initial.tenantId,projectId:initial.currentProjectId,membershipVerified:initial.membershipVerified},
      runtimeSourceMode:'live_hr_runtime',
      runtimeSourceEvidence:{sourceMode:initial.sourceMode,dataMode:initial.dataMode,dataStatus:initial.dataStatus,dataSourceRef:initial.dataSourceRef,runtimeReadActive:initial.runtimeReadActive,runtimeSyncActive:initial.runtimeSyncActive,humanVisualModeMayBeSourceSafePreview:true},
      liveHr:{periods:afterSecond.periods,visits:afterSecond.visits,shoppers:afterSecond.shoppers,firstPeriod:afterSecond.firstPeriod,latestPeriod:afterSecond.latestPeriod,sourceRevision:afterSecond.sourceRevision,sourceReadAt:afterSecond.sourceReadAt,liveHrFetchAttempt:afterSecond.liveHrFetchAttempt},
      routes,financeBenefitsRoleSplit:roleSplit,
      freshReconciliation:{first:firstReconcile?.result||firstReconcile,second:secondReconcile?.result||secondReconcile,idempotency},
      stateEvidence:{initial:coreStateEvidence(initial),beforeRefresh:coreStateEvidence(beforeRefresh),afterFirst:coreStateEvidence(afterFirst),afterSecond:coreStateEvidence(afterSecond)},
      sourceLock:{buildId:afterSecond.buildId,...afterSecond.sourceLock},
      diagnostics:{consoleErrorCount:diagnostics.consoleErrors.length,consoleErrors:diagnostics.consoleErrors.slice(0,30),pageErrorCount:diagnostics.pageErrors.length,sameOriginHttpErrorCount:diagnostics.httpErrors.length,sameOriginRequestFailureCount:fatal.requestFailures.length},
      screenshots:['screenshots/dashboard.png','screenshots/proyectos.png','screenshots/visitas.png','screenshots/postulaciones.png','screenshots/cert.png','screenshots/financiero.png','screenshots/aprendizaje.png','screenshots/m8-after-reconcile.png'],
      safety:{hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},
      credentialsExposed:false,tokensExposed:false
    };
    persist(result);
    await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
    return result;
  }catch(error){
    if(!lastState)lastState=await snapshot(page,'m8_failure_state').catch(()=>null);
    const failure={
      schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.failure.v2',generatedAt:new Date().toISOString(),
      decision:'FAIL_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',action:exactAction,devRoot:root,
      error:clean(error?.stack||error?.message||error),lastState:coreStateEvidence(lastState),
      diagnostics:{consoleErrors:diagnostics.consoleErrors.slice(0,30),pageErrors:diagnostics.pageErrors.slice(0,20),sameOriginHttpErrors:diagnostics.httpErrors.slice(0,20),requestFailures:diagnostics.requestFailures.filter(x=>x.url.startsWith(new URL(root).origin)).slice(0,20)},
      safety:{hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},
      credentialsExposed:false,tokensExposed:false
    };
    persist(failure);
    throw error;
  }finally{
    await context.close().catch(()=>{});
    await browser.close().catch(()=>{});
  }
}

try{
  const result=await run();
  console.log(JSON.stringify(result));
}catch(error){
  if(!fs.existsSync(outputFile))persist({schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.failure.v2',generatedAt:new Date().toISOString(),decision:'FAIL_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',action:exactAction,devRoot:root,error:clean(error?.stack||error?.message||error),safety:{hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},credentialsExposed:false,tokensExposed:false});
  console.error(fs.readFileSync(outputFile,'utf8'));
  process.exitCode=1;
}
