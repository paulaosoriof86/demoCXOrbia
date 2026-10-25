import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const root=String(process.env.CXORBIA_DEV_ROOT_URL||process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/m8-human-validation/private/private-e2e.json';
const outDir=process.env.CXORBIA_M8_DIAGNOSTIC_DIR||'.tmp/m8-human-validation/shell-diagnostic';
const outFile=path.join(outDir,'report.json');
const exactAction='M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY';
const action=String(process.env.CXORBIA_M8_ACTION||'').trim();
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/([?&](?:token|key|password|secret|auth|code)=)[^&\s]+/gi,'$1REDACTED').slice(0,2500);
const digest=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const write=v=>{fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(outFile,JSON.stringify(v,null,2)+'\n','utf8');};
if(!root)throw new Error('M8_DIAGNOSTIC_DEV_ROOT_REQUIRED');
if(action!==exactAction)throw new Error('M8_DIAGNOSTIC_ACTION_NOT_EXACT');
if(!fs.existsSync(privatePath))throw new Error('M8_DIAGNOSTIC_PRIVATE_CREDENTIAL_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password)throw new Error('M8_DIAGNOSTIC_PRIVATE_CREDENTIAL_INVALID');
fs.mkdirSync(outDir,{recursive:true});

async function collect(page,label){
  return page.evaluate(label=>{
    const app=document.getElementById('app');
    const rail=document.getElementById('rail');
    const view=document.getElementById('view');
    const ds=window.CX?.dataSource||{};
    const guard=window.CX_C4_EMPTY_SHELL_GUARD||null;
    const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const ids=[...document.querySelectorAll('[id]')].map(x=>x.id).filter(Boolean);
    const navIds=[...document.querySelectorAll('.nav-i[id]')].map(x=>x.id);
    const appText=String(app?.innerText||'').replace(/\s+/g,' ').trim();
    const railText=String(rail?.innerText||'').replace(/\s+/g,' ').trim();
    let protectedEmpty=null;try{protectedEmpty=typeof guard?.isProtectedEmpty==='function'?guard.isProtectedEmpty():null;}catch(e){protectedEmpty='error:'+String(e?.message||e);}
    let dataBlocked=null;try{dataBlocked=typeof ds.isBlocked==='function'?ds.isBlocked():null;}catch(e){dataBlocked='error:'+String(e?.message||e);}
    return {
      label,
      appExists:!!app,appOn:app?.classList.contains('on')===true,
      appDirectChildIds:app?[...app.children].map(x=>x.id||x.className||x.tagName):[],
      appTextPrefix:appText.slice(0,420),
      railExists:!!rail,railChildCount:rail?.children?.length??-1,railTextPrefix:railText.slice(0,420),
      viewExists:!!view,viewTextPrefix:String(view?.innerText||'').replace(/\s+/g,' ').trim().slice(0,420),
      navCount:navIds.length,navIds,
      navDashboardExists:!!document.getElementById('nav-dashboard'),
      navDashboardVisible:!!document.getElementById('nav-dashboard')?.getClientRects().length,
      dataSource:{mode:ds.mode||null,status:ds.status||null,sourceRef:ds.sourceRef||null,blockers:Array.isArray(ds.blockers)?ds.blockers.slice():[],runtimeReadActive:ds.runtimeReadActive===true,runtimeSyncActive:ds.runtimeSyncActive===true,isBlocked:dataBlocked},
      backendLastState:{source:window.CX_BACKEND_LAST_STATE?.source||null,empty:window.CX_BACKEND_LAST_STATE?.empty,reason:window.CX_BACKEND_LAST_STATE?.reason||null,counts:window.CX_BACKEND_LAST_STATE?.counts||null},
      corte4:{ready:window.CX_CORTE4_READONLY?.ready,source:window.CX_CORTE4_READONLY?.source||null,empty:window.CX_CORTE4_READONLY?.empty,state:window.CX_CORTE4_READONLY?.state||null},
      emptyShell:{guardInstalled:guard?.installed===true,protectedEmpty,active:window.CX_C4_EMPTY_SHELL_STATE?.active===true,state:window.CX_C4_EMPTY_SHELL_STATE||null},
      handoff:{status:handoff?.status||null,membershipVerified:handoff?.membershipVerified===true,authorityApplied:handoff?.authorityApplied===true,appOn:handoff?.appOn===true,loginHidden:handoff?.loginHidden===true,reason:handoff?.reason||null,at:handoff?.at||null},
      authority:{applied:authority?.applied===true,periods:Number(authority?.periods||0),visits:Number(authority?.hrVisits||0),latestPeriod:authority?.latestPeriod||null,at:authority?.at||null},
      session:{role:window.CX?.session?.role||null,view:window.CX?.session?.view||null,membershipVerified:window.CX?.session?.user?.membershipVerified===true},
      router:{available:!!window.CX?.router,mountType:typeof window.CX?.router?.mount,buildRailType:typeof window.CX?.router?.buildRail},
      shellMarkers:{dataSourceBlock:!!document.getElementById('dsBackDemo'),emptyProjectText:/Sin proyectos disponibles/i.test(appText),dataSourceUnavailableText:/Fuente de datos no disponible/i.test(appText)},
      domIdCount:ids.length
    };
  },label);
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
const page=await context.newPage();
const diagnostics={consoleErrors:[],pageErrors:[],requestFailures:[],httpErrors:[]};
page.on('console',m=>{if(m.type()==='error')diagnostics.consoleErrors.push(clean(m.text()));});
page.on('pageerror',e=>diagnostics.pageErrors.push(clean(e?.stack||e?.message||e)));
page.on('requestfailed',r=>diagnostics.requestFailures.push({url:clean(r.url()).slice(0,300),error:clean(r.failure()?.errorText||'request_failed')}));
page.on('response',r=>{if(r.status()>=400){try{const u=new URL(r.url());if(u.origin===new URL(root).origin)diagnostics.httpErrors.push({url:u.origin+u.pathname,status:r.status()});}catch{}}});
try{
  await page.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});
  await page.fill('#lgUser',credentials.staff.login);
  await page.fill('#lgPass',credentials.staff.password);
  await page.press('#lgPass','Enter');
  await page.waitForFunction(()=>{
    const c=window.CX?.backendAuth?.context?.()||{};
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const h=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||{};
    return c.authenticated===true&&c.tenantId==='tya'&&a.applied===true&&a.latestPeriod==='2026-08'&&h.status==='entered'&&window.CX?.session?.user?.membershipVerified===true;
  },null,{timeout:90000});
  await page.waitForTimeout(1500);
  const state=await collect(page,'post_canonical_handoff_stable');
  await page.screenshot({path:path.join(outDir,'post-canonical-handoff.png'),fullPage:true});
  const classification=state.navDashboardExists&&state.navDashboardVisible
    ?'SHELL_NAV_VISIBLE'
    : state.shellMarkers.dataSourceBlock||!state.railExists
      ?'SHELL_REPLACED_BY_DATASOURCE_BLOCK'
      : state.emptyShell.active||state.shellMarkers.emptyProjectText
        ?'SHELL_RENDERED_EMPTY_GUARD'
        : state.railExists&&state.navCount===0
          ?'SHELL_RAIL_PRESENT_NAV_NOT_MOUNTED'
          :'SHELL_NAV_DASHBOARD_NOT_VISIBLE_OTHER';
  let diagnosticMount=null;
  if(!state.navDashboardVisible&&state.railExists&&typeof state.router?.mountType==='string'){
    diagnosticMount=await page.evaluate(()=>{
      try{
        const before={navCount:document.querySelectorAll('.nav-i').length,view:window.CX?.session?.view||null};
        window.CX.router.mount();
        const after={navCount:document.querySelectorAll('.nav-i').length,navDashboard:!!document.getElementById('nav-dashboard'),view:window.CX?.session?.view||null};
        return {attempted:true,ok:true,before,after};
      }catch(error){return {attempted:true,ok:false,error:String(error?.message||error).slice(0,500)};}
    });
    await page.screenshot({path:path.join(outDir,'after-diagnostic-router-mount.png'),fullPage:true});
  }
  const afterDiagnostic=diagnosticMount?await collect(page,'after_diagnostic_router_mount'):null;
  const result={
    schemaVersion:'cxorbia.m8.visible-shell-diagnostic.v1',generatedAt:new Date().toISOString(),
    decision:state.navDashboardExists&&state.navDashboardVisible?'PASS_M8_VISIBLE_SHELL_DIAGNOSTIC':'FAIL_M8_VISIBLE_SHELL_DIAGNOSTIC',
    classification,state,diagnosticMount,afterDiagnostic,
    fingerprints:{appText: digest(state.appTextPrefix||''),railText:digest(state.railTextPrefix||''),navIds:digest(JSON.stringify(state.navIds||[]))},
    diagnostics:{consoleErrors:diagnostics.consoleErrors.slice(0,30),pageErrors:diagnostics.pageErrors.slice(0,20),sameOriginHttpErrors:diagnostics.httpErrors.slice(0,20),requestFailures:diagnostics.requestFailures.slice(0,20)},
    safety:{hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false,diagnosticDomMountOnly:diagnosticMount?.attempted===true},
    credentialsExposed:false,tokensExposed:false
  };
  write(result);
  console.log(JSON.stringify(result));
  if(result.decision!=='PASS_M8_VISIBLE_SHELL_DIAGNOSTIC')process.exitCode=2;
}finally{
  await context.close().catch(()=>{});
  await browser.close().catch(()=>{});
}
