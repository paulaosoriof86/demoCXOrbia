import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/m8-human-validation/private/private-e2e.json';
const outDir=process.env.CXORBIA_M8_OUTPUT_DIR||'.tmp/m8-human-validation/runtime';
const outputFile=process.env.CXORBIA_M8_OUTPUT||path.join(outDir,'report.json');
const ACTION='M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY';
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/([?&](?:token|key|password|secret|auth|code)=)[^&\s]+/gi,'$1REDACTED').slice(0,5000);
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const persist=v=>{fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(v,null,2)+'\n','utf8');};
if(!root)throw new Error('M8_DEV_ROOT_URL_REQUIRED');
ensure(String(process.env.CXORBIA_M8_ACTION||'')===ACTION,'M8_ACTION_NOT_EXACT');
ensure(fs.existsSync(privatePath),'M8_PRIVATE_STAFF_CREDENTIAL_REQUIRED');
const cred=JSON.parse(fs.readFileSync(privatePath,'utf8'));
ensure(cred?.staff?.login&&cred?.staff?.password&&!cred?.shopper&&!cred?.client,'M8_PRIVATE_STAFF_CREDENTIAL_INVALID');
fs.mkdirSync(outDir,{recursive:true});

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
const page=await context.newPage();
const diagnostics={consoleErrors:[],pageErrors:[],requests:[]};
page.on('console',m=>{if(m.type()==='error')diagnostics.consoleErrors.push(clean(m.text()));});
page.on('pageerror',e=>diagnostics.pageErrors.push(clean(e?.stack||e?.message||e)));
page.on('request',r=>diagnostics.requests.push({method:r.method(),url:(()=>{try{const u=new URL(r.url());return u.origin+u.pathname;}catch{return clean(r.url()).slice(0,400);}})()}));

try{
  await page.goto(root+'/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});
  await page.fill('#lgUser',cred.staff.login);
  await page.fill('#lgPass',cred.staff.password);
  await page.press('#lgPass','Enter');
  await page.waitForFunction(()=>{
    const c=window.CX?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},h=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||{};
    return c.authenticated===true&&c.role==='admin'&&c.authNamespace==='staff'&&c.tenantId==='tya'&&Array.isArray(c.projectIds)&&c.projectIds.includes('cinepolis')&&a.applied===true&&a.latestPeriod==='2026-08'&&h.status==='entered'&&window.CX?.session?.user?.membershipVerified===true;
  },null,{timeout:90000});
  await page.waitForTimeout(1200);
  const evidence=await page.evaluate(()=>{
    const cx=window.CX||{};
    const conf=cx.confidencialidad||null;
    const app=document.getElementById('app'),rail=document.getElementById('rail'),view=document.getElementById('view');
    let pendingResult=null,pendingError=null;
    try{pendingResult=typeof conf?.pending==='function'?conf.pending(cx.session?.role):null;}catch(e){pendingError=String(e?.message||e);}
    const dialogs=[...document.querySelectorAll('[role="dialog"],.cx-ov,.modal,[class*="modal"],[id*="conf" i],[class*="conf" i]')].map((el,i)=>({
      index:i,tag:el.tagName,id:el.id||null,className:String(el.className||'').slice(0,220),visible:!!el.getClientRects().length,
      ariaLabel:el.getAttribute('aria-label')||null,
      text:String(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,1800),
      buttons:[...el.querySelectorAll('button,input[type="button"],input[type="submit"],a,[role="button"]')].map(b=>({tag:b.tagName,id:b.id||null,name:b.getAttribute('name')||null,type:b.getAttribute('type')||null,text:String(b.innerText||b.value||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,240),disabled:!!b.disabled,visible:!!b.getClientRects().length,dataset:{...b.dataset}})).slice(0,30)
    })).slice(0,20);
    const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&/(conf|nda|term|accept|privacy|session)/i.test(k))ls[k]=String(localStorage.getItem(k)||'').slice(0,1200);}
    const ss={};for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(k&&/(conf|nda|term|accept|privacy|session)/i.test(k))ss[k]=String(sessionStorage.getItem(k)||'').slice(0,1200);}
    const ownKeys=conf?Object.keys(conf):[];
    const fnSource={};for(const k of ownKeys){if(typeof conf[k]==='function'){try{fnSource[k]=String(conf[k]).slice(0,12000);}catch{}}}
    return {
      role:cx.session?.role||null,currentView:cx.session?.view||null,
      appOn:app?.classList.contains('on')===true,railExists:!!rail,railChildren:rail?.children?.length??-1,viewExists:!!view,viewText:String(view?.innerText||'').replace(/\s+/g,' ').trim().slice(0,500),
      navCount:document.querySelectorAll('.nav-i[id]').length,navDashboardExists:!!document.getElementById('nav-dashboard'),
      confidentiality:{exists:!!conf,ownKeys,pendingType:typeof conf?.pending,showType:typeof conf?.show,pendingResult,pendingError,fnSource},
      dialogs,localStorageMatches:ls,sessionStorageMatches:ss,
      source:{mode:cx.dataSource?.mode||null,status:cx.dataSource?.status||null,sourceRef:cx.dataSource?.sourceRef||null,runtimeReadActive:cx.dataSource?.runtimeReadActive===true,runtimeSyncActive:cx.dataSource?.runtimeSyncActive===true,latestPeriod:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.latestPeriod||null,periods:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.periods||0),visits:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.hrVisits||0),shoppers:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.hrShoppers||0)}
    };
  });
  await page.screenshot({path:path.join(outDir,'m8-confidentiality-root-cause.png'),fullPage:true});
  const src=JSON.stringify(evidence.confidentiality.fnSource||{});
  const classification=evidence.confidentiality.exists&&evidence.confidentiality.pendingResult===true&&evidence.navCount===0
    ?'CONFIDENTIALITY_GATE_PENDING_BEFORE_ROUTER_MOUNT'
    : evidence.navCount===0?'ROUTER_NOT_MOUNTED_CONFIDENTIALITY_NOT_PROVEN':'ROUTER_ALREADY_MOUNTED';
  const result={
    schemaVersion:'cxorbia.m8.confidentiality-root-cause-readonly.v1',
    generatedAt:new Date().toISOString(),
    decision:'DIAGNOSTIC_M8_CONFIDENTIALITY_ROOT_CAUSE_READONLY',
    classification,
    evidence:{...evidence,confidentiality:{...evidence.confidentiality,fnSourceDigest:hash(src)}},
    functionSourceReview:{containsLocalStorage:/localStorage/i.test(src),containsSessionStorage:/sessionStorage/i.test(src),containsFetch:/\bfetch\s*\(/i.test(src),containsFirebase:/firebase|firestore|backendAuth|backend\./i.test(src),containsXHR:/XMLHttpRequest/i.test(src),containsNetworkLiteral:/https?:\/\//i.test(src)},
    networkObserved:{requestCount:diagnostics.requests.length,nonGetMethods:[...new Set(diagnostics.requests.filter(x=>!['GET','HEAD','OPTIONS'].includes(x.method)).map(x=>x.method))],requestsAfterLoginNotSeparated:true},
    diagnostics:{consoleErrors:diagnostics.consoleErrors.slice(0,30),pageErrors:diagnostics.pageErrors.slice(0,20)},
    safety:{humanClickAfterLogin:false,confidentialityAccepted:false,routerDiagnosticMount:false,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},
    credentialsExposed:false,tokensExposed:false
  };
  persist(result);
  console.log(JSON.stringify(result));
  process.exitCode=3;
}catch(error){
  const result={schemaVersion:'cxorbia.m8.confidentiality-root-cause-readonly.failure.v1',generatedAt:new Date().toISOString(),decision:'FAIL_M8_CONFIDENTIALITY_ROOT_CAUSE_DIAGNOSTIC',error:clean(error?.stack||error?.message||error),safety:{humanClickAfterLogin:false,confidentialityAccepted:false,routerDiagnosticMount:false,hostingDeploys:0,cloudRunDeploys:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,merge:false,production:false},credentialsExposed:false,tokensExposed:false};persist(result);console.error(JSON.stringify(result));process.exitCode=1;
}finally{await context.close().catch(()=>{});await browser.close().catch(()=>{});}
