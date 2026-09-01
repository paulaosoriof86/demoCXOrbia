#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  createStateLedger,
  assertProviderStates,
  captureBrowserSnapshot,
  waitForBrowserLifecycle,
  navigateAndWait,
  sanitizeRuntimeError,
  classifyRuntimeFailure
} from './cxorbia-runtime-state-machine.mjs';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-unified-runtime/private-e2e.json';
const proofPath=process.env.CXORBIA_ACCESS_TRANSACTION_PROOF||'.tmp/c6-unified-runtime/access-proof.json';
const outputFile=String(process.env.CXORBIA_UNIFIED_RUNTIME_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
if(!fs.existsSync(proofPath))throw new Error('ACCESS_TRANSACTION_PROOF_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
for(const key of ['staff','shopper','client'])if(!credentials?.[key]?.login||!credentials?.[key]?.password)throw new Error(`PRIVATE_E2E_${key.toUpperCase()}_INVALID`);
const providerProof=JSON.parse(fs.readFileSync(proofPath,'utf8'));
const providerLedger=createStateLedger(providerProof);assertProviderStates(providerLedger);
const persist=value=>{if(!outputFile)return;fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');};
const assert=(ok,code)=>{if(!ok)throw new Error(code);};
const partial={staff:null,client:null,shopper:null};
let stage='browser_start',currentPage=null;

async function openEntry(browser){
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(root+'/index-backend-dev.html?cxUnifiedRuntime=1&ts='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  for(const role of ['admin','cliente','shopper'])await page.waitForSelector(`.role-btn[data-role="${role}"]`,{state:'visible',timeout:30000});
  return {context,page};
}
async function login(browser,principal,roleButton,credential,expected){
  const session=await openEntry(browser);currentPage=session.page;
  stage=principal+'_credential_step';
  await session.page.click(`.role-btn[data-role="${roleButton}"]`);
  await session.page.waitForSelector('#cxIntegratedAuthStep',{state:'visible',timeout:30000});
  assert(await session.page.locator('#cxDevEntryAuth').count()===0,principal.toUpperCase()+'_PARALLEL_TECHNICAL_FORM_VISIBLE');
  await session.page.fill('#cxIntegratedAuthLogin',credential.login);
  await session.page.fill('#cxIntegratedAuthPassword',credential.password);
  await session.page.click('#cxIntegratedAuthSubmit');
  stage=principal+'_lifecycle_first';
  const lifecycle=await waitForBrowserLifecycle(session.page,expected,{timeoutMs:90000});
  return {...session,expected,lifecycle};
}
async function routes(page,principal,ids,expected){
  const out=[];
  for(const id of ids){stage=principal+'_route_'+id;const r=await navigateAndWait(page,id,expected,{timeoutMs:30000});out.push({routeId:id,heading:r.snapshot.heading,navItemPresent:r.snapshot.navItemPresent,navHighlightObserved:r.navHighlightObserved,blocked:r.snapshot.blocked,state:r.snapshot.state});}
  return out;
}
async function stability(session,principal,routeId){
  const reloads=[];
  for(let i=1;i<=3;i+=1){
    stage=principal+'_reload_'+i;await session.page.reload({waitUntil:'domcontentloaded',timeout:60000});
    const lifecycle=await waitForBrowserLifecycle(session.page,session.expected,{timeoutMs:90000});
    const route=await navigateAndWait(session.page,routeId,session.expected,{timeoutMs:30000});
    reloads.push({index:i,lifecycle,route:{routeId,heading:route.snapshot.heading,state:route.snapshot.state}});
  }
  stage=principal+'_new_tab';const second=await session.context.newPage();currentPage=second;
  await second.goto(root+'/index-backend-dev.html?cxUnifiedRuntime=1&newTab=1&ts='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  const lifecycle=await waitForBrowserLifecycle(second,session.expected,{timeoutMs:90000});
  const route=await navigateAndWait(second,routeId,session.expected,{timeoutMs:30000});
  const snapshot=await captureBrowserSnapshot(second,{...session.expected,expectedRoute:routeId});
  await second.close();currentPage=session.page;
  return {reloadsStable:reloads.length===3,newTabStable:snapshot.state.DOMAIN_READY===true,reloads,newTab:{lifecycle,route:{routeId,heading:route.snapshot.heading,state:route.snapshot.state}}};
}
async function close(session){try{await session.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});}catch{}await session.context.close();}
async function domain(page,kind){
  return page.evaluate(kind=>{
    const d=window.CX?.data||{},ctx=window.CX?.backendAuth?.context?.()||{},a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},p=d.period?.()||{};
    const canonical=ctx.shopperId?((d.__identityMap||{})[ctx.shopperId]||ctx.shopperId):null;let ownVisits=0;try{ownVisits=canonical&&d.visitsForShopper?d.visitsForShopper(canonical,false).length:0;}catch{}
    let financeRows=null;try{financeRows=window.CX?.fin?.porPais?.(d)||null;}catch{}
    let reservationMutation=null;try{reservationMutation=window.CX?.reservas?.reservar?.({})||null;}catch{}
    return {kind,role:ctx.role||null,namespace:ctx.authNamespace||null,tenantId:ctx.tenantId||null,projectIds:Array.isArray(ctx.projectIds)?ctx.projectIds.slice():[],shopperId:canonical||null,ownVisits,
      periods:Array.isArray(d.projects)?d.projects.length:-1,visits:Array.isArray(d._visitas)?d._visitas.length:-1,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:-1,currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,
      authority:{applied:a.applied===true,periods:Number(a.periods||0),visits:Number(a.hrVisits||0),shoppers:Number(a.hrShoppers||0),firstPeriod:a.firstPeriod||null,latestPeriod:a.latestPeriod||null,duplicateVisitKeys:Number(a.duplicateVisitKeys||0),duplicateShopperIds:Number(a.duplicateShopperIds||0)},
      finance:{project:{modelo:p.modelo||null,billingModel:p.billingModel||null,localBilling:p.localBilling??null,royaltyApplicable:p.royaltyApplicable??null,regalias:Number(p.regalias||0)},modelContract:window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT||null,delegatedGuard:window.CX_DELEGATED_COORDINATION_FINANCE_GUARD||null,projectConfiguration:window.CX_TYA_PROJECT_FINANCIAL_CONFIGURATION||null,rows:financeRows},
      reservations:{marker:window.CX_TYA_CANONICAL_RESERVATIONS||null,mutation:reservationMutation},shopperMarker:window.CX_TYA_CANONICAL_SHOPPER_PORTAL||null,
      modules:{dashboard:typeof window.CX?.modules?.dashboard==='function',visits:typeof window.CX?.modules?.visitas==='function',applications:typeof window.CX?.modules?.postulaciones==='function',shoppers:typeof window.CX?.modules?.shoppers==='function',clientDashboard:typeof window.CX?.modules?.cli_dashboard==='function',shopperProfile:typeof window.CX?.modules?.miperfil==='function',finance:typeof window.CX?.modules?.financiero==='function',reservations:typeof window.CX?.modules?.reservas==='function'}};
  },kind);
}
function common(x){assert(x.authority.applied&&x.periods===x.authority.periods&&x.visits===x.authority.visits,'HR_AUTHORITY_PARITY_INVALID');assert(x.authority.duplicateVisitKeys===0&&x.authority.duplicateShopperIds===0,'HR_DUPLICATE_KEYS');assert(x.currentProjectId==='cinepolis'&&x.currentPeriodId,'PROJECT_PERIOD_INVALID');}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
try{
  const staffExpected={allowedRoles:['super','admin','ops','coordinador'],expectedNamespace:'staff',expectedTenantId:'tya',expectedProjectId:'cinepolis'};
  stage='staff_login';const staffSession=await login(browser,'staff','admin',credentials.staff,staffExpected);
  const staffRoutes=await routes(staffSession.page,'staff',['dashboard','visitas','postulaciones','shoppers','financiero','reservas'],staffExpected);
  const staffStability=await stability(staffSession,'staff','dashboard');const staff=await domain(staffSession.page,'staff');common(staff);
  assert(['super','admin','ops','coordinador'].includes(String(staff.role||''))&&staff.namespace==='staff'&&staff.tenantId==='tya','STAFF_SCOPE_INVALID');
  assert(Object.values(staff.modules).every(Boolean),'CANONICAL_MODULE_MISSING');
  assert(staff.finance.project.modelo==='delegado'&&staff.finance.project.billingModel==='delegated_coordination'&&staff.finance.project.localBilling===false&&staff.finance.project.royaltyApplicable===false&&staff.finance.project.regalias===0,'CINEPOLIS_FINANCIAL_MODEL_INVALID');
  assert(Number(staff.finance.modelContract?.royaltyViolations||0)===0&&staff.finance.delegatedGuard?.shopperHonorariumUsedAsIncomeFallback===false&&staff.finance.delegatedGuard?.splitValuesInvented===false&&staff.finance.projectConfiguration?.commissionSplit?.valuesInvented===false,'FINANCE_GUARD_INVALID');
  assert(staff.finance.rows&&Object.keys(staff.finance.rows).length>0,'FINANCE_ROWS_MISSING');
  assert(staff.reservations.marker?.ready===true&&staff.reservations.marker?.browserLocalStorageAsSource===false&&staff.reservations.marker?.mutationsEnabled===false&&staff.reservations.mutation?.blocked===true,'RESERVATIONS_GUARD_INVALID');
  partial.staff={...staff,routes:staffRoutes,stability:staffStability};await close(staffSession);

  const clientExpected={allowedRoles:['cliente','client'],expectedNamespace:'staff',expectedTenantId:'tya',expectedProjectId:'cinepolis'};
  stage='client_login';const clientSession=await login(browser,'client','cliente',credentials.client,clientExpected);
  const clientRoutes=await routes(clientSession.page,'client',['cli_dashboard'],clientExpected);const clientStability=await stability(clientSession,'client','cli_dashboard');const client=await domain(clientSession.page,'client');common(client);
  assert(['cliente','client'].includes(String(client.role||''))&&client.namespace==='staff'&&client.tenantId==='tya'&&client.projectIds.includes('cinepolis'),'CLIENT_SCOPE_INVALID');
  partial.client={...client,routes:clientRoutes,stability:clientStability};await close(clientSession);

  const shopperExpected={expectedRole:'shopper',expectedNamespace:'shopper',expectedTenantId:'tya',expectedProjectId:'cinepolis'};
  stage='shopper_login';const shopperSession=await login(browser,'shopper','shopper',credentials.shopper,shopperExpected);
  const shopperRoutes=await routes(shopperSession.page,'shopper',['miperfil','misvisitas','visitas','reservas'],shopperExpected);const shopperStability=await stability(shopperSession,'shopper','miperfil');const shopper=await domain(shopperSession.page,'shopper');common(shopper);
  assert(shopper.role==='shopper'&&shopper.namespace==='shopper'&&shopper.tenantId==='tya'&&shopper.shopperId&&shopper.ownVisits>0,'SHOPPER_IDENTITY_HISTORY_INVALID');
  assert(shopper.shopperMarker?.ready===true&&shopper.shopperMarker?.exactIdentityOnly===true&&shopper.shopperMarker?.fullHistory===true&&shopper.shopperMarker?.certificationVisible===true,'SHOPPER_PORTAL_INVALID');
  partial.shopper={...shopper,routes:shopperRoutes,stability:shopperStability};await close(shopperSession);

  stage='persist_pass';const evidence={schemaVersion:'cxorbia.phase-a.unified-runtime-state-machine.v1',generatedAt:new Date().toISOString(),decision:'PASS_PHASE_A_UNIFIED_RUNTIME_STATE_MACHINE',stateOrder:providerLedger.order,providerStates:providerLedger.provider,source:{periods:staff.authority.periods,visits:staff.authority.visits,shoppers:staff.authority.shoppers,firstPeriod:staff.authority.firstPeriod,latestPeriod:staff.authority.latestPeriod,revisionDynamic:true},finance:staff.finance,reservations:staff.reservations,staff:partial.staff,client:partial.client,shopper:partial.shopper,safety:{browserWrites:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploy:false,merge:false,production:false,credentialsExposed:false,tokensExposed:false}};
  persist(evidence);console.log(JSON.stringify({decision:evidence.decision,periods:evidence.source.periods,visits:evidence.source.visits,shoppers:evidence.source.shoppers,latestPeriod:evidence.source.latestPeriod}));
}catch(error){let snapshot=null;try{if(currentPage)snapshot=await captureBrowserSnapshot(currentPage,{});}catch{}
  const sanitized=sanitizeRuntimeError(error);const failure={schemaVersion:'cxorbia.phase-a.unified-runtime-state-machine.failure.v1',generatedAt:new Date().toISOString(),decision:'FAIL_PHASE_A_UNIFIED_RUNTIME_STATE_MACHINE',failedStage:stage,failedState:sanitized.state||null,failureClass:classifyRuntimeFailure(error),error:sanitized,lastSnapshot:snapshot,partial,safety:{browserWrites:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,deploy:false,merge:false,production:false,credentialsExposed:false,tokensExposed:false}};
  persist(failure);console.error(JSON.stringify({decision:failure.decision,failedStage:failure.failedStage,failedState:failure.failedState,failureClass:failure.failureClass}));process.exitCode=1;
}finally{await browser.close();}
