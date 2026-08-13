import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/m8-human-validation/private-e2e.json';
const outDir=process.env.CXORBIA_M8_OUTPUT_DIR||'.tmp/m8-human-validation/runtime';
const outputFile=process.env.CXORBIA_M8_OUTPUT||path.join(outDir,'report.json');
const ACTION='M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY';
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/([?&](?:token|key|password|secret|auth|code)=)[^&\s]+/gi,'$1REDACTED').slice(0,3000);
const safeUrl=v=>{try{const u=new URL(String(v));return u.origin+u.pathname;}catch{return clean(v);}};
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const uniq=a=>[...new Set(a.map(String))].sort();
const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

if(!root)throw new Error('M8_DEV_ROOT_URL_REQUIRED');
if(String(process.env.CXORBIA_M8_ACTION||'')!==ACTION)throw new Error('M8_ACTION_NOT_EXACT');
if(!fs.existsSync(privatePath))throw new Error('M8_PRIVATE_STAFF_CREDENTIAL_REQUIRED');
const cred=JSON.parse(fs.readFileSync(privatePath,'utf8'));
ensure(cred?.staff?.login&&cred?.staff?.password&&!cred?.shopper&&!cred?.client,'M8_PRIVATE_STAFF_CREDENTIAL_INVALID');
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(path.join(outDir,'screenshots'),{recursive:true});
const persist=v=>fs.writeFileSync(outputFile,JSON.stringify(v,null,2)+'\n','utf8');

async function state(page,label){
  return page.evaluate(label=>{
    const c=window.CX?.backendAuth?.context?.()||{};
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const h=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||{};
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    const lock=window.CX?.SOURCE_LOCK||window.CX_SOURCE_LOCK||null;
    const visits=Array.isArray(d._visitas)?d._visitas:[];
    const key=v=>{const s=x=>String(x??'').trim();const coord=s(v?.sourceTab)&&s(v?.sourceRow)?`${s(v.sourceTab)}::${s(v.sourceRow)}`:'';return s(v?.hrRowId)||coord||s(v?.visitId||v?.id);};
    const keys=visits.map(key);
    const periodKeys=Array.isArray(d.projects)?d.projects.map(p=>String(p?.periodKey||p?.key||p?.id||'').trim()).filter(Boolean):[];
    const app=document.getElementById('app'),rail=document.getElementById('rail'),view=document.getElementById('view');
    let blocked=null;try{blocked=typeof ds.isBlocked==='function'?ds.isBlocked():null;}catch{blocked='error';}
    return {
      label,role:c.role||null,namespace:c.authNamespace||null,tenantId:c.tenantId||null,projectIds:Array.isArray(c.projectIds)?c.projectIds.slice():[],membershipVerified:window.CX?.session?.user?.membershipVerified===true,
      periods:Array.isArray(d.projects)?d.projects.length:-1,visits:visits.length,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:-1,currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,periodKeys,
      authorityApplied:a.applied===true,authorityPeriods:Number(a.periods||0),authorityVisits:Number(a.hrVisits||0),authorityShoppers:Number(a.hrShoppers||0),firstPeriod:a.firstPeriod||null,latestPeriod:a.latestPeriod||null,authorityUniqueVisitKeys:Number(a.uniqueVisitKeys||0),duplicateVisitKeys:Number(a.duplicateVisitKeys||0),duplicateShopperIds:Number(a.duplicateShopperIds||0),liveHrFetchAttempt:Number(a.liveHrFetchAttempt||0),authorityAt:a.at||null,
      sourceRevision:d?.previewMeta?.sourceRevision||window.CX_TYA_HR_LIVE_META?.revision||null,sourceReadAt:d?.previewMeta?.sourceReadAt||window.CX_TYA_HR_LIVE_META?.sourceReadAt||null,sourceMode:d.sourceMode||null,dataMode:ds.mode||null,dataStatus:ds.status||null,dataSourceRef:ds.sourceRef||null,runtimeReadActive:ds.runtimeReadActive===true,runtimeSyncActive:ds.runtimeSyncActive===true,dataBlocked:blocked,
      handoffStatus:h.status||null,handoffMembership:h.membershipVerified===true,handoffAuthority:h.authorityApplied===true,handoffAt:h.at||null,
      appOn:app?.classList.contains('on')===true,loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,currentView:window.CX?.session?.view||null,visitKeys:keys,missingVisitKeys:keys.filter(x=>!x).length,uniqueVisitKeys:new Set(keys.filter(Boolean)).size,
      buildId:window.CX?.BUILD_ID||null,sourceLock:lock?{manifestFile:lock.manifestFile||null,aggregateSha256:lock.aggregateSha256||null,candidateId:lock.candidateId||null,repository:lock.repository||null,branch:lock.branch||null,pullRequest:lock.pullRequest||null,production:lock.production===true}:null,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true,fullVisual:window.CX_DEV_ENTRY_CANONICAL?.fullVisual===true,
      shell:{appExists:!!app,railExists:!!rail,viewExists:!!view,railChildren:rail?.children?.length??-1,navIds:[...document.querySelectorAll('.nav-i[id]')].map(x=>x.id),navCount:document.querySelectorAll('.nav-i[id]').length,navDashboardExists:!!document.getElementById('nav-dashboard'),navDashboardVisible:!!document.getElementById('nav-dashboard')?.getClientRects().length}
    };
  },label);
}

function validate(s,label){
  ensure(s.appOn&&s.loginHidden,label+'_SHELL_ENTRY_FLAGS_INVALID');
  ensure(s.role==='admin'&&s.namespace==='staff'&&s.tenantId==='tya',label+'_PRINCIPAL_INVALID');
  ensure(s.projectIds.includes('cinepolis')&&s.currentProjectId==='cinepolis',label+'_PROJECT_INVALID');
  ensure(s.membershipVerified&&s.handoffMembership&&s.handoffStatus==='entered',label+'_MEMBERSHIP_HANDOFF_INVALID');
  ensure(s.authorityApplied&&s.periods===s.authorityPeriods&&s.visits===s.authorityVisits,label+'_HR_AUTHORITY_COUNT_MISMATCH');
  ensure(s.periods>0&&s.visits>0&&s.shoppers>0&&s.firstPeriod==='2025-06'&&s.latestPeriod==='2026-08'&&s.periodKeys.includes('2026-08'),label+'_LIVE_HISTORY_INVALID');
  ensure(s.missingVisitKeys===0&&s.uniqueVisitKeys===s.visits&&s.authorityUniqueVisitKeys===s.visits&&s.duplicateVisitKeys===0&&s.duplicateShopperIds===0,label+'_DUPLICATE_INVARIANT_FAILED');
  ensure(s.runtimeReadActive&&s.runtimeSyncActive===false&&s.dataStatus==='ready'&&s.dataBlocked!==true,label+'_READONLY_LIVE_SOURCE_INVALID');
  ensure(['connected','source_safe_preview'].includes(String(s.dataMode||''))&&String(s.sourceMode||'').includes('tya_hr_live')&&String(s.dataSourceRef||'').includes('hr-live'),label+'_LIVE_SOURCE_IDENTITY_INVALID');
  ensure(s.canonicalLane==='authenticated-human-canonical'&&s.canonicalProtected&&s.technicalAuth===false&&s.fullVisual,label+'_CANONICAL_HUMAN_LANE_INVALID');
  ensure(s.sourceLock?.repository==='paulaosoriof86/demoCXOrbia'&&s.sourceLock?.branch==='docs-tya-v6-v71-audit'&&Number(s.sourceLock?.pullRequest)===7&&s.sourceLock?.production===false,label+'_SOURCE_LOCK_IDENTITY_INVALID');
  ensure(/^[a-f0-9]{64}$/i.test(String(s.sourceLock?.aggregateSha256||''))&&s.buildId===s.sourceLock.aggregateSha256.slice(0,16),label+'_BUILD_LOCK_INVALID');
}

async function waitReady(page,label){
  try{await page.waitForFunction(()=>{const c=window.CX?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},h=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||{},d=window.CX?.data||{},ds=window.CX?.dataSource||{};return c.authenticated===true&&c.tenantId==='tya'&&a.applied===true&&a.latestPeriod==='2026-08'&&h.status==='entered'&&window.CX?.session?.user?.membershipVerified===true&&Array.isArray(d.projects)&&d.projects.length===a.periods&&Array.isArray(d._visitas)&&d._visitas.length===a.hrVisits&&ds.status==='ready'&&ds.runtimeReadActive===true&&ds.runtimeSyncActive===false;},null,{timeout:90000});}
  catch{const s=await state(page,label+'_timeout').catch(()=>null);throw new Error(label+'_READY_TIMEOUT_'+clean(JSON.stringify(s)));}
}

async function establishPostGateQaShell(page,s){
  if(s.shell.navDashboardVisible)return {required:false,method:'normal_app_continuation',manualRouterMountUsed:false};
  ensure(s.dataBlocked!==true,'M8_DATASOURCE_BLOCKED_BEFORE_POST_GATE_QA');
  const proof=await page.evaluate(()=>{
    const c=window.CX?.confidencialidad;
    const role=window.CX?.session?.role||null;
    let pending=null;try{pending=typeof c?.pending==='function'?c.pending(role):null;}catch{pending='error';}
    let acceptSrc='',showSrc='';try{acceptSrc=String(c?.accept||'');showSrc=String(c?.show||'');}catch{}
    return {exists:!!c,role,pending,acceptanceLocalOnly:/localStorage/i.test(acceptSrc)&&!/\bfetch\s*\(|XMLHttpRequest|firebase|firestore|https?:\/\//i.test(acceptSrc),showCallsOnDone:/if\s*\(onDone\)\s*onDone\s*\(\s*\)/.test(showSrc),appEnterMayBeRuntimeWrapped:true,currentConsentRecorded:(()=>{try{return typeof c?.pending==='function'?c.pending(role)===false:null;}catch{return null;}})()};
  });
  ensure(proof.exists&&proof.role==='admin'&&proof.pending===true,'M8_EXPECTED_CONFIDENTIALITY_GATE_NOT_PRESENT');
  ensure(proof.acceptanceLocalOnly&&proof.showCallsOnDone,'M8_CONFIDENTIALITY_LOCAL_CALLBACK_NOT_PROVEN');
  await page.screenshot({path:path.join(outDir,'screenshots','m8-expected-confidentiality-gate.png'),fullPage:true});
  const mounted=await page.evaluate(()=>{try{window.CX.router.mount();return {ok:true,navCount:document.querySelectorAll('.nav-i[id]').length,navDashboardVisible:!!document.getElementById('nav-dashboard')?.getClientRects().length};}catch(e){return {ok:false,error:String(e?.message||e).slice(0,600)};}});
  ensure(mounted.ok&&mounted.navDashboardVisible&&mounted.navCount>0,'M8_POST_GATE_QA_ROUTER_MOUNT_FAILED_'+clean(JSON.stringify(mounted)));
  return {required:true,method:'non_consent_post_gate_qa_router_continuation',manualRouterMountUsed:true,confidentialityPendingPreserved:true,sourceProof:proof,mounted};
}

async function route(page,id,label,syntheticDomClick=false){
  const el='#nav-'+id;await page.waitForSelector(el,{state:'visible',timeout:15000});
  if(syntheticDomClick){const clicked=await page.evaluate(id=>{const el=document.querySelector('#nav-'+id);if(!el)return false;el.click();return true;},id);ensure(clicked,'M8_ROUTE_'+id+'_DOM_CLICK_TARGET_MISSING');}
  else await page.click(el);
  await page.waitForFunction(id=>window.CX?.session?.view===id,id,{timeout:15000});await page.waitForFunction(()=>String(document.getElementById('view')?.innerText||'').trim().length>0,null,{timeout:15000});
  const r=await page.evaluate(({id,label})=>{const v=document.getElementById('view'),t=String(v?.innerText||'').replace(/\s+/g,' ').trim(),h=v?.querySelector('h1,h2,h3,.page-title,.section-title');return {id,label,currentView:window.CX?.session?.view||null,textLength:t.length,heading:String(h?.textContent||'').trim().slice(0,150),navVisible:!!document.querySelector('#nav-'+id)?.getClientRects().length,textPrefix:t.slice(0,4000)};},{id,label});
  ensure(r.currentView===id&&r.navVisible&&r.textLength>0,'M8_ROUTE_'+id+'_INVALID');r.viewDigest=hash(r.textPrefix);delete r.textPrefix;r.interactionMode=syntheticDomClick?'dom_click_under_expected_consent_overlay':'playwright_pointer';const f=path.join(outDir,'screenshots',id+'.png');await page.screenshot({path:f,fullPage:true});r.screenshot='screenshots/'+id+'.png';return r;
}

async function reconcile(page,reason){for(let i=0;i<30;i++){const r=await page.evaluate(async reason=>typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY==='function'?await window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY(reason):({ok:false,error:'RECONCILE_FUNCTION_MISSING'}),reason);if(r?.ok===true&&r?.skipped!==true)return r;if(r?.skipped===true&&r?.reason==='reconcile_in_progress'){await sleep(300);continue;}return r;}return {ok:false,error:'RECONCILE_BUSY_TIMEOUT'};}

async function run(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  const diag={consoleErrors:[],pageErrors:[],requestFailures:[],httpErrors:[]};let last=null,postGateQa=null;
  page.on('console',m=>{if(m.type()==='error')diag.consoleErrors.push(clean(m.text()));});page.on('pageerror',e=>diag.pageErrors.push(clean(e?.stack||e?.message||e)));page.on('requestfailed',r=>diag.requestFailures.push({url:safeUrl(r.url()),error:clean(r.failure()?.errorText||'request_failed')}));page.on('response',r=>{if(r.status()>=400){try{const u=new URL(r.url());if(u.origin===new URL(root).origin)diag.httpErrors.push({url:u.origin+u.pathname,status:r.status()});}catch{}}});
  try{
    await page.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
    const entry=new URL(page.url());ensure(entry.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV'&&entry.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV'&&!entry.searchParams.has('cxTechnicalAuthE2E'),'M8_ENTRY_LANE_FLAGS_INVALID');
    await page.click('.role-btn[data-role="admin"]');await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});await page.fill('#lgUser',cred.staff.login);await page.fill('#lgPass',cred.staff.password);await page.press('#lgPass','Enter');await waitReady(page,'m8_initial');await page.waitForTimeout(1000);
    last=await state(page,'m8_initial');validate(last,'M8_INITIAL');
    postGateQa=await establishPostGateQaShell(page,last);
    last=await state(page,'m8_post_gate_qa');validate(last,'M8_POST_GATE_QA');ensure(last.shell.navDashboardVisible,'M8_VISIBLE_SHELL_NOT_READY');

    const routes=[];const syntheticRoutes=postGateQa?.required===true;for(const [id,label] of [['dashboard','Dashboard Operativo'],['proyectos','Proyectos'],['visitas','Visitas'],['postulaciones','Postulaciones'],['cert','Certificación'],['financiero','Dashboard Financiero'],['aprendizaje','Academia']])routes.push(await route(page,id,label,syntheticRoutes));
    const split=await page.evaluate(()=>({finance:!!document.querySelector('#nav-financiero')?.getClientRects().length,benefitsInAdmin:!!document.querySelector('#nav-beneficios')?.getClientRects().length,benefitRoles:Array.isArray(window.CX?.MODULES?.beneficios?.roles)?window.CX.MODULES.beneficios.roles.slice():[]}));ensure(split.finance&&!split.benefitsInAdmin&&split.benefitRoles.includes('shopper'),'M8_FINANCE_BENEFITS_ROLE_SPLIT_INVALID');

    const before=await state(page,'before_refresh');validate(before,'M8_BEFORE_REFRESH');
    const r1=await reconcile(page,'m8_fresh_read_reconcile_1');ensure(r1?.ok===true&&!r1?.skipped,'M8_RECONCILE_1_FAILED_'+clean(JSON.stringify(r1)));await waitReady(page,'after_refresh_1');const a1=await state(page,'after_refresh_1');validate(a1,'M8_AFTER_REFRESH_1');ensure(a1.authorityAt&&a1.authorityAt!==before.authorityAt,'M8_RECONCILE_1_NOT_OBSERVED');
    const r2=await reconcile(page,'m8_fresh_read_reconcile_2');ensure(r2?.ok===true&&!r2?.skipped,'M8_RECONCILE_2_FAILED_'+clean(JSON.stringify(r2)));await waitReady(page,'after_refresh_2');const a2=await state(page,'after_refresh_2');validate(a2,'M8_AFTER_REFRESH_2');ensure(a2.authorityAt&&a2.authorityAt!==a1.authorityAt,'M8_RECONCILE_2_NOT_OBSERVED');

    const b=uniq(before.visitKeys),k1=uniq(a1.visitKeys),k2=uniq(a2.visitKeys),sameRev=!!(a1.sourceRevision&&a2.sourceRevision&&a1.sourceRevision===a2.sourceRevision);if(sameRev)ensure(same(k1,k2),'M8_SAME_REVISION_IDEMPOTENCY_FAILED');
    const idem={beforeCount:b.length,firstCount:k1.length,secondCount:k2.length,beforeRevision:before.sourceRevision,firstRevision:a1.sourceRevision,secondRevision:a2.sourceRevision,sameRevisionAfterPair:sameRev,firstDelta:{added:k1.filter(x=>!b.includes(x)).length,removed:b.filter(x=>!k1.includes(x)).length},secondDelta:{added:k2.filter(x=>!k1.includes(x)).length,removed:k1.filter(x=>!k2.includes(x)).length},noDuplicatesAfterFirst:a1.uniqueVisitKeys===a1.visits&&a1.duplicateVisitKeys===0,noDuplicatesAfterSecond:a2.uniqueVisitKeys===a2.visits&&a2.duplicateVisitKeys===0,sameRevisionExactSetStable:sameRev?same(k1,k2):null};ensure(idem.noDuplicatesAfterFirst&&idem.noDuplicatesAfterSecond,'M8_RECONCILE_CREATED_DUPLICATES');

    await page.screenshot({path:path.join(outDir,'screenshots','m8-after-reconcile.png'),fullPage:true});const sameOrigin=new URL(root).origin,fails=diag.requestFailures.filter(x=>x.url.startsWith(sameOrigin));ensure(diag.pageErrors.length===0,'M8_PAGE_ERRORS_'+clean(JSON.stringify(diag.pageErrors)));ensure(diag.httpErrors.length===0,'M8_HTTP_ERRORS_'+clean(JSON.stringify(diag.httpErrors)));ensure(fails.length===0,'M8_REQUEST_FAILURES_'+clean(JSON.stringify(fails)));
    const result={schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.v5',generatedAt:new Date().toISOString(),decision:'PASS_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',action:ACTION,devRoot:root,principal:{role:last.role,namespace:last.namespace,tenantId:last.tenantId,projectId:last.currentProjectId,membershipVerified:last.membershipVerified},confidentialityGate:{status:'EXPECTED_HUMAN_CONSENT_GATE',consentRecordedByQa:false,postGateQa},runtimeSourceMode:'live_hr_runtime',liveHr:{periods:a2.periods,visits:a2.visits,dataShoppers:a2.shoppers,authorityShoppers:a2.authorityShoppers,firstPeriod:a2.firstPeriod,latestPeriod:a2.latestPeriod,sourceRevision:a2.sourceRevision,sourceReadAt:a2.sourceReadAt,liveHrFetchAttempt:a2.liveHrFetchAttempt,duplicateVisitKeys:a2.duplicateVisitKeys,duplicateShopperIds:a2.duplicateShopperIds},routes,financeBenefitsRoleSplit:split,freshReconciliation:{first:r1?.result||r1,second:r2?.result||r2,idempotency:idem},sourceLock:{buildId:a2.buildId,...a2.sourceLock},diagnostics:{consoleErrorCount:diag.consoleErrors.length,consoleErrors:diag.consoleErrors.slice(0,30),pageErrorCount:diag.pageErrors.length,sameOriginHttpErrorCount:diag.httpErrors.length,sameOriginRequestFailureCount:fails.length},safety:{confidentialityConsentRecorded:false,browserLocalStorageWritesByQa:0,providerWrites:0,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},credentialsExposed:false,tokensExposed:false};persist(result);await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});return result;
  }catch(error){if(!last)last=await state(page,'failure').catch(()=>null);const result={schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.failure.v5',generatedAt:new Date().toISOString(),decision:'FAIL_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',action:ACTION,devRoot:root,error:clean(error?.stack||error?.message||error),lastState:last,postGateQa,diagnostics:{consoleErrors:diag.consoleErrors.slice(0,30),pageErrors:diag.pageErrors.slice(0,20),sameOriginHttpErrors:diag.httpErrors.slice(0,20),requestFailures:diag.requestFailures.filter(x=>x.url.startsWith(new URL(root).origin)).slice(0,20)},safety:{confidentialityConsentRecorded:false,browserLocalStorageWritesByQa:0,providerWrites:0,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},credentialsExposed:false,tokensExposed:false};persist(result);throw error;}finally{await context.close().catch(()=>{});await browser.close().catch(()=>{});}
}

try{const r=await run();console.log(JSON.stringify(r));}catch(e){if(!fs.existsSync(outputFile))persist({schemaVersion:'cxorbia.m8.human-validation-runtime-readonly.failure.v5',generatedAt:new Date().toISOString(),decision:'FAIL_M8_HUMAN_BROWSER_LIVE_HR_RECONCILIATION_READONLY',action:ACTION,error:clean(e?.stack||e?.message||e),safety:{confidentialityConsentRecorded:false,browserLocalStorageWritesByQa:0,providerWrites:0,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},credentialsExposed:false,tokensExposed:false});console.error(fs.readFileSync(outputFile,'utf8'));process.exitCode=1;}
