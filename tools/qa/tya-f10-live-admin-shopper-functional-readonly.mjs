#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||process.env.CXORBIA_DEV_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const privatePath=String(process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/phase-a-runtime-private/private-e2e.json');
const outputFile=String(process.env.CXORBIA_REMOTE_SEMANTIC_OUTPUT||'.tmp/phase-a-runtime-multirole/domain-finance-portals-reservations.json');
if(!root.startsWith('https://'))throw new Error('F10_DEV_ROOT_REQUIRED');
if(!fs.existsSync(privatePath))throw new Error('F10_PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password||credentials?.staff?.role!=='admin')throw new Error('F10_CANONICAL_ADMIN_CREDENTIAL_MISSING');
if(credentials?.shopper?.credentialMode!=='firebase_custom_token'||credentials?.shopper?.login!=='__cxorbia_f10_custom_token__'||!credentials?.shopper?.password)throw new Error('F10_SHOPPER_CUSTOM_TOKEN_MISSING');
if(!credentials?.client?.login||!credentials?.client?.password)throw new Error('F10_CLIENT_CREDENTIAL_MISSING');

const outDir=path.dirname(outputFile);
fs.mkdirSync(outDir,{recursive:true});
const safe={repositoryWrites:false,dataWrites:false,providerWrites:false,authWrites:0,passwordChanges:0,passwordResets:0,firestoreWrites:0,hrWrites:0,storageWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,deploys:0,merge:false,production:false,credentialsExposed:false,tokensExposed:false};
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,1000);
const persist=value=>fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');

async function openEntry(browser){
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  const pageErrors=[];const consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e).slice(0,300)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text().slice(0,300));});
  await page.goto(root+'/',{waitUntil:'commit',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:60000});
  const entryUrl=new URL(page.url());
  assert(entryUrl.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','F10_PROTECTED_RUNTIME_FLAG_MISSING');
  assert(entryUrl.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','F10_FULL_VISUAL_FLAG_MISSING');
  return {context,page,pageErrors,consoleErrors};
}

async function waitRuntime(page,expectedNamespace,expectedRole=null,requireHr=true){
  await page.waitForFunction(({expectedNamespace,expectedRole,requireHr})=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const authReady=Boolean(ctx?.authenticated===true&&ctx?.authNamespace===expectedNamespace&&(!expectedRole||ctx?.role===expectedRole)&&document.getElementById('app')?.classList.contains('on')===true&&document.getElementById('login')?.classList.contains('hidden')===true);
    const hrReady=Boolean(a?.applied===true&&a?.periods>0&&a?.hrVisits>0);
    return authReady&&(!requireHr||hrReady);
  },{expectedNamespace,expectedRole,requireHr},{timeout:90000});
}

async function loginUi(page,roleButton,credential,expectedNamespace,expectedRole=null,requireHr=true){
  await page.click(`.role-btn[data-role="${roleButton}"]`);
  await page.waitForFunction(role=>document.getElementById('loginForm')?.dataset.selectedRole===role,roleButton,{timeout:10000});
  for(const selector of ['#lgUser','#lgPass','#lgSubmit'])await page.waitForSelector(selector,{state:'visible',timeout:10000});
  const canonical=await page.evaluate(()=>({legacyOverlay:Boolean(document.getElementById('cxIntegratedAuthStep')),technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))}));
  assert(!canonical.legacyOverlay&&!canonical.technicalForm,'F10_NON_CANONICAL_LOGIN_SURFACE_VISIBLE');
  await page.fill('#lgUser',credential.login);
  await page.fill('#lgPass',credential.password);
  await page.press('#lgPass','Enter');
  await waitRuntime(page,expectedNamespace,expectedRole,requireHr);
}

async function loginShopperToken(page,token){
  await page.waitForFunction(()=>Boolean(window.firebase&&window.CX?.BACKEND?.firebaseConfig),null,{timeout:30000});
  await page.evaluate(async customToken=>{
    const cfg=window.CX.BACKEND.firebaseConfig;
    const app=firebase.apps.length?firebase.app():firebase.initializeApp(cfg);
    const auth=typeof app.auth==='function'?app.auth():firebase.auth();
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    await auth.signInWithCustomToken(customToken);
  },token);
  await page.reload({waitUntil:'commit',timeout:60000});
  await waitRuntime(page,'shopper','shopper',true);
}

async function navRoute(page,routeId){
  const result=await page.evaluate(async routeId=>{
    const modulePresent=typeof window.CX?.modules?.[routeId]==='function';
    const routerPresent=typeof window.CX?.router?.nav==='function';
    let thrown=null;
    try{if(modulePresent&&routerPresent)window.CX.router.nav(routeId);}catch(e){thrown=String(e?.message||e);}
    await new Promise(r=>setTimeout(r,500));
    const view=document.getElementById('view');
    const text=String(view?.innerText||'').trim();
    const heading=view?.querySelector('.ph-t,.ph h1,.ph h2,h1,h2')?.textContent?.trim()||null;
    const fatal=/Fuente de datos no disponible|Error inesperado|No se pudo cargar/i.test(text);
    return {routeId,modulePresent,routerPresent,sessionView:window.CX?.session?.view||null,viewExists:Boolean(view),viewTextLength:text.length,heading,thrown,fatal};
  },routeId);
  return {...result,ok:result.modulePresent&&result.routerPresent&&result.sessionView===routeId&&result.viewExists&&result.viewTextLength>0&&!result.thrown&&!result.fatal};
}

async function captureKpiScreenshot(page){
  try{
    const boxes=await page.locator('#view .kpi').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}).filter(r=>r.width>0&&r.height>0));
    if(!boxes.length)return null;
    const x=Math.max(0,Math.min(...boxes.map(b=>b.x)));const y=Math.max(0,Math.min(...boxes.map(b=>b.y)));
    const right=Math.max(...boxes.map(b=>b.x+b.width));const bottom=Math.max(...boxes.map(b=>b.y+b.height));
    const file=path.join(outDir,'admin-dashboard-kpis.png');
    await page.screenshot({path:file,clip:{x,y,width:Math.max(1,Math.min(1440,right-x)),height:Math.max(1,Math.min(1000,bottom-y))}});
    return file;
  }catch{return null;}
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
let admin=null,client=null,shopper=null,finance=null,reservations=null,source=null,latestPeriod=null,adminRoutes=[],shopperRoutes=[],visual=null,stage='init';
try{
  stage='admin_entry';
  const staffSession=await openEntry(browser);
  stage='admin_login';
  await loginUi(staffSession.page,'admin',credentials.staff,'staff','admin',true);
  stage='admin_snapshot';
  admin=await staffSession.page.evaluate(()=>{
    const d=window.CX?.data||{};const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};const ctx=window.CX?.backendAuth?.context?.()||{};
    const summaries=Array.isArray(d.periodOperationalSummary)?d.periodOperationalSummary.slice():[];
    const period=d.period?.()||{};const periodKey=String(period.periodKey||d.currentPeriodId||'').replace(/^cinepolis-/,'');
    const summary=summaries.find(x=>String(x.periodKey||'')===periodKey)||null;
    const k=d.kpis?.()||{};const BF=d.visitBucketFns||{};const rows=typeof d.visitas==='function'?d.visitas():[];const countries=Array.isArray(period.countries)&&period.countries.length?period.countries.slice():['GT','HN'];
    const bucket=fn=>{const f=typeof fn==='function'?fn:()=>false;const out={total:rows.filter(f).length,byCountry:{}};for(const c of countries)out.byCountry[c]=rows.filter(v=>v?.pais===c&&f(v)).length;return out;};
    const dashboardKpis={
      total:{total:rows.length,byCountry:Object.fromEntries(countries.map(c=>[c,rows.filter(v=>v?.pais===c).length]))},
      asignadas:bucket(BF.asignadas),sinAsignar:bucket(BF.sinAsignar),sinAgendar:bucket(BF.sinAgendar),agendadas:bucket(BF.agendadas),realizadas:bucket(BF.realizadas),pendRealizar:bucket(BF.pendRealizar),cuestPend:bucket(BF.cuestPend),sinSubmitir:bucket(BF.sinSubmitir),liquidadas:bucket(BF.liquidadas),fueraRango:bucket(BF.fueraRango),
      postulacionesPendientes:Array.isArray(d._posts)?d._posts.filter(p=>p?.estado==='pendiente'&&!p?._archived).length:0
    };
    let financeRows=null;try{financeRows=window.CX?.fin?.porPais?.(d)||null;}catch{}
    let reservationMutation=null;try{reservationMutation=window.CX?.reservas?.reservar?.({})||null;}catch{}
    return {
      role:ctx.role||null,namespace:ctx.authNamespace||null,tenantId:ctx.tenantId||null,projectIds:Array.isArray(ctx.projectIds)?ctx.projectIds.slice():[],
      periods:Number(a.periods||0),visits:Number(a.hrVisits||0),shoppers:Number(a.hrShoppers||0),firstPeriod:a.firstPeriod||null,latestPeriod:a.latestPeriod||null,duplicateVisitKeys:Number(a.duplicateVisitKeys||0),duplicateShopperIds:Number(a.duplicateShopperIds||0),
      currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,periodKey,periodKeys:summaries.map(x=>x.periodKey),summary,kpis:k,dashboardKpis,
      septemberPresent:summaries.some(x=>x.periodKey==='2026-09'),
      finance:{project:{modelo:period.modelo||null,billingModel:period.billingModel||null,localBilling:period.localBilling??null,royaltyApplicable:period.royaltyApplicable??null,regalias:Number(period.regalias||0)},modelContract:window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT||null,delegatedGuard:window.CX_DELEGATED_COORDINATION_FINANCE_GUARD||null,projectConfiguration:window.CX_TYA_PROJECT_FINANCIAL_CONFIGURATION||null,rows:financeRows},
      reservations:{marker:window.CX_TYA_CANONICAL_RESERVATIONS||null,mutation:reservationMutation}
    };
  });
  assert(admin.role==='admin'&&admin.namespace==='staff'&&admin.tenantId==='tya','F10_ADMIN_SCOPE_INVALID');
  assert(admin.periods>0&&admin.visits>0&&admin.shoppers>0&&admin.duplicateVisitKeys===0&&admin.duplicateShopperIds===0,'F10_ADMIN_LIVE_HR_AUTHORITY_INVALID');
  assert(admin.periodKey===admin.latestPeriod,'F10_ADMIN_CURRENT_PERIOD_NOT_LIVE_LATEST');
  assert(admin.summary&&Number(admin.dashboardKpis?.total?.total||0)===Number(admin.summary?.total||0),'F10_ADMIN_KPI_TOTAL_PARITY_INVALID');
  assert(Number(admin.kpis?.total?.t||0)===Number(admin.summary?.total||0),'F10_ADMIN_CANONICAL_KPI_TOTAL_INVALID');
  assert(Number(admin.kpis?.asignadas?.t||0)===Number(admin.summary?.assigned||0),'F10_ADMIN_CANONICAL_KPI_ASSIGNED_INVALID');
  assert(Number(admin.kpis?.realizadas?.t||0)===Number(admin.summary?.realized||0),'F10_ADMIN_CANONICAL_KPI_REALIZED_INVALID');
  assert(Number(admin.kpis?.cuestPend?.t||0)===Math.max(0,Number(admin.summary?.realized||0)-Number(admin.summary?.questionnaireCompleted||0)),'F10_ADMIN_CANONICAL_KPI_QUESTIONNAIRE_INVALID');
  assert(Number(admin.kpis?.sinSubmitir?.t||0)===Math.max(0,Number(admin.summary?.questionnaireCompleted||0)-Number(admin.summary?.submitted||0)),'F10_ADMIN_CANONICAL_KPI_SUBMIT_INVALID');
  assert(Number(admin.kpis?.fueraRango?.t||0)===Number(admin.summary?.outOfRange||0),'F10_ADMIN_CANONICAL_KPI_OUT_OF_RANGE_INVALID');

  stage='admin_routes';
  for(const route of ['dashboard','hrsource','proyectos','periodos','historico','visitas','postulaciones','reservas','shoppers','financiero','liquidaciones','documentos','aprendizaje'])adminRoutes.push(await navRoute(staffSession.page,route));
  const criticalAdmin=['dashboard','historico','visitas','postulaciones','reservas','shoppers','financiero','liquidaciones'];
  assert(criticalAdmin.every(id=>adminRoutes.find(x=>x.routeId===id)?.ok===true),'F10_ADMIN_CRITICAL_ROUTE_FAILURE_'+criticalAdmin.filter(id=>adminRoutes.find(x=>x.routeId===id)?.ok!==true).join('_'));
  await staffSession.page.evaluate(()=>window.CX?.router?.nav?.('dashboard'));
  await staffSession.page.waitForTimeout(500);
  visual={adminKpiScreenshot:await captureKpiScreenshot(staffSession.page),containsIdentityData:false};
  assert(staffSession.pageErrors.length===0,'F10_ADMIN_PAGE_ERRORS_'+staffSession.pageErrors.length);

  finance={model:admin.finance?.project?.modelo||null,localBilling:admin.finance?.project?.localBilling??null,royaltyPct:Number(admin.finance?.project?.regalias||0),shopperHonorariumUsedAsIncomeFallback:admin.finance?.delegatedGuard?.shopperHonorariumUsedAsIncomeFallback===true,valuesInvented:admin.finance?.delegatedGuard?.splitValuesInvented===true};
  reservations={browserLocalStorageAsSource:admin.reservations?.marker?.browserLocalStorageAsSource===true,mutationsEnabled:admin.reservations?.marker?.mutationsEnabled===true,blocked:admin.reservations?.mutation?.blocked===true,reason:admin.reservations?.mutation?.reason||null};
  assert(finance.model==='delegado'&&finance.royaltyPct===0&&finance.valuesInvented===false,'F10_FINANCE_CONTRACT_INVALID');
  assert(reservations.browserLocalStorageAsSource===false&&reservations.mutationsEnabled===false,'F10_RESERVATIONS_NOT_FAIL_CLOSED');
  source={periods:admin.periods,visits:admin.visits,shoppers:admin.shoppers,firstPeriod:admin.firstPeriod,latestPeriod:admin.latestPeriod,periodKeys:admin.periodKeys,septemberPresent:admin.septemberPresent,revisionDynamic:true};
  const s=admin.summary||{};
  latestPeriod={periodKey:admin.periodKey,total:Number(s.total||0),assigned:Number(s.assigned||0),unassigned:Number(s.unassigned||0),scheduled:Number(s.scheduled||0),pendingSchedule:Number(s.pendingSchedule||0),realized:Number(s.realized||0),pendingQuestionnaire:Number(s.pendingQuestionnaire||0),questionnaireCompleted:Number(s.questionnaireCompleted||0),pendingSubmission:Number(s.pendingSubmission||0),submitted:Number(s.submitted||0),liquidationCandidates:Number(s.liquidationCandidates||0),paymentConfirmed:Number(s.paymentConfirmed||0),outOfRange:Number(s.outOfRange||0),dashboardKpis:admin.dashboardKpis};
  await staffSession.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});await staffSession.context.close();

  stage='client_entry';
  const clientSession=await openEntry(browser);
  stage='client_login';
  await loginUi(clientSession.page,'cliente',credentials.client,'staff',null,false);
  stage='client_route';
  const clientRoute=await navRoute(clientSession.page,'cli_dashboard');
  client={authenticated:true,projectScope:'cinepolis',clientModule:clientRoute.modulePresent,route:clientRoute.sessionView==='cli_dashboard',routeAccepted:clientRoute.sessionView==='cli_dashboard',routeId:clientRoute.sessionView,viewExists:clientRoute.viewExists,pageHeader:Boolean(clientRoute.heading),viewTextLength:clientRoute.viewTextLength,renderException:clientRoute.thrown,panorama:true,panoramaVisible:clientRoute.ok,blocked:clientRoute.fatal,heading:clientRoute.heading,predicateVersion:'session-view-canonical-render-v1'};
  assert(client.routeAccepted&&client.viewExists&&client.viewTextLength>0&&client.renderException===null&&client.panoramaVisible&&!client.blocked,'F10_CLIENT_ROUTE_INVALID');
  assert(clientSession.pageErrors.length===0,'F10_CLIENT_PAGE_ERRORS_'+clientSession.pageErrors.length);
  await clientSession.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});await clientSession.context.close();

  stage='shopper_entry';
  const shopperSession=await openEntry(browser);
  stage='shopper_login';
  await loginShopperToken(shopperSession.page,credentials.shopper.password);
  stage='shopper_snapshot';
  shopper=await shopperSession.page.evaluate(()=>{
    const ctx=window.CX?.backendAuth?.context?.()||{};const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};const d=window.CX?.data||{};
    const raw=String(ctx.shopperId||'').trim();const canonical=String((d.__identityMap||{})[raw]||raw).trim();let own=[];try{own=typeof d.visitsForShopper==='function'?d.visitsForShopper(canonical,false):[];}catch{}
    const marker=window.CX_TYA_CANONICAL_SHOPPER_PORTAL||{};let legalPending=false;try{legalPending=Boolean(window.CX?.confidencialidad?.pending?.('shopper'));}catch{}
    const legalVisible=[...document.querySelectorAll('.cx-ov,[role="dialog"]')].some(el=>{const t=String(el.innerText||'');const r=el.getBoundingClientRect();const st=getComputedStyle(el);return /(confidencial|\bnda\b|acuerdo)/i.test(t)&&r.width>0&&r.height>0&&st.display!=='none'&&st.visibility!=='hidden';});
    return {authenticated:ctx.authenticated===true,role:ctx.role||null,namespace:ctx.authNamespace||null,tenantId:ctx.tenantId||null,exactIdentity:Boolean(raw&&canonical),ownVisits:own.length,fullHistory:marker.fullHistory===true,certificationVisible:marker.certificationVisible===true,periods:Number(a.periods||0),visits:Number(a.hrVisits||0),shoppers:Number(a.hrShoppers||0),latestPeriod:a.latestPeriod||null,legalGate:{pending:legalPending,visible:legalVisible,acceptanceAutomated:false},sourceRef:String(window.CX?.dataSource?.sourceRef||'')};
  });
  assert(shopper.authenticated&&shopper.role==='shopper'&&shopper.namespace==='shopper'&&shopper.tenantId==='tya','F10_SHOPPER_SCOPE_INVALID');
  assert(shopper.exactIdentity&&shopper.ownVisits>0&&shopper.fullHistory&&shopper.certificationVisible,'F10_SHOPPER_IDENTITY_HISTORY_INVALID');
  assert(shopper.periods===admin.periods&&shopper.visits===admin.visits&&shopper.latestPeriod===admin.latestPeriod,'F10_SHOPPER_LIVE_HR_PARITY_INVALID');
  if(shopper.legalGate.pending)assert(shopper.legalGate.visible===true,'F10_SHOPPER_LEGAL_GATE_NOT_VISIBLE');
  stage='shopper_routes';
  for(const route of ['miperfil','misvisitas','visitas','reservas','beneficios','mireportes','cert','aprendizaje','documentos'])shopperRoutes.push(await navRoute(shopperSession.page,route));
  const criticalShopper=['miperfil','misvisitas','visitas','reservas','beneficios'];
  assert(criticalShopper.every(id=>shopperRoutes.find(x=>x.routeId===id)?.ok===true),'F10_SHOPPER_CRITICAL_ROUTE_FAILURE_'+criticalShopper.filter(id=>shopperRoutes.find(x=>x.routeId===id)?.ok!==true).join('_'));
  assert(shopperSession.pageErrors.length===0,'F10_SHOPPER_PAGE_ERRORS_'+shopperSession.pageErrors.length);
  await shopperSession.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});await shopperSession.context.close();

  stage='complete';
  const evidence={schemaVersion:'cxorbia.f10.live-admin-shopper-functional-readonly.v1',generatedAt:new Date().toISOString(),decision:'PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC',qaMode:'real_hosting_playwright_admin_and_checkpoint_backed_shopper',stage,source,latestPeriod,admin:{authenticated:true,role:admin.role,currentProjectId:admin.currentProjectId,currentPeriodId:admin.currentPeriodId,septemberPresent:admin.septemberPresent,dashboardKpis:admin.dashboardKpis,routes:adminRoutes},client,shopper:{...shopper,routes:shopperRoutes,credentialMode:'checkpoint_backed_firebase_custom_token',humanPasswordRouteFresh:false},finance,reservations,visual,safety:safe};
  persist(evidence);console.log(JSON.stringify(evidence));
}catch(error){
  const evidence={schemaVersion:'cxorbia.f10.live-admin-shopper-functional-readonly.v1',generatedAt:new Date().toISOString(),decision:'HOLD_F10_LIVE_ADMIN_SHOPPER_FUNCTIONAL_READONLY',stage,error:clean(error?.message||error),source,latestPeriod,admin,client,shopper,finance,reservations,adminRoutes,shopperRoutes,visual,safety:safe};persist(evidence);console.error(JSON.stringify(evidence));process.exitCode=1;
}finally{try{await browser.close();}catch{}}
