import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-remote-gate/private-e2e.json';
const outputFile=String(process.env.CXORBIA_REMOTE_SEMANTIC_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
for(const key of ['staff','shopper','client']){
  if(!credentials?.[key]?.login||!credentials?.[key]?.password)throw new Error('PRIVATE_E2E_'+key.toUpperCase()+'_INVALID');
}
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const persist=value=>{if(!outputFile)return;fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');};
let stage='browser_start';
const partial={staff:null,client:null,shopper:null};

async function openAndLogin(browser,roleButton,credential,expectedNamespace){
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(root+'/index-backend-dev.html?cxRemoteSemantic=1&ts='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector(`.role-btn[data-role="${roleButton}"]`,{state:'visible',timeout:30000});
  await page.click(`.role-btn[data-role="${roleButton}"]`);
  await page.waitForSelector('#cxIntegratedAuthStep',{state:'visible',timeout:30000});
  await page.fill('#cxIntegratedAuthLogin',credential.login);
  await page.fill('#cxIntegratedAuthPassword',credential.password);
  await page.click('#cxIntegratedAuthSubmit');
  await page.waitForFunction(({expectedNamespace})=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    return Boolean(ctx?.authenticated===true&&ctx?.authNamespace===expectedNamespace&&a?.applied===true&&document.getElementById('app')?.classList.contains('on')===true);
  },{expectedNamespace},{timeout:90000});
  return {context,page};
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
try{
  stage='staff_login';
  const staffSession=await openAndLogin(browser,'admin',credentials.staff,'staff');
  stage='staff_snapshot';
  const staff=await staffSession.page.evaluate(()=>{
    const d=window.CX?.data||{};
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const summaries=Array.isArray(d.periodOperationalSummary)?d.periodOperationalSummary.slice():[];
    const period=d.period?.()||{};
    const periodKey=String(period.periodKey||d.currentPeriodId||'').replace(/^cinepolis-/,'');
    const summary=summaries.find(x=>String(x.periodKey||'')===periodKey)||null;
    const kpis=d.kpis?.()||null;
    const countries=Array.isArray(period.countries)&&period.countries.length?period.countries.slice():['GT','HN'];
    const flows={};
    for(const country of countries)flows[country]=d.phaseFlow?.(country)||null;
    const sumPair=key=>countries.reduce((n,c)=>n+Number(flows[c]?.[key]?.[0]||0),0);
    let financeRows=null;
    try{financeRows=window.CX?.fin?.porPais?.(d)||null;}catch{}
    let reservationMutation=null;
    try{reservationMutation=window.CX?.reservas?.reservar?.({})||null;}catch{}
    return {
      role:ctx.role||null,namespace:ctx.authNamespace||null,tenantId:ctx.tenantId||null,projectIds:Array.isArray(ctx.projectIds)?ctx.projectIds.slice():[],
      authority:{applied:authority.applied===true,periods:Number(authority.periods||0),visits:Number(authority.hrVisits||0),shoppers:Number(authority.hrShoppers||0),firstPeriod:authority.firstPeriod||null,latestPeriod:authority.latestPeriod||null,duplicateVisitKeys:Number(authority.duplicateVisitKeys||0),duplicateShopperIds:Number(authority.duplicateShopperIds||0)},
      data:{periods:Array.isArray(d.projects)?d.projects.length:-1,visits:Array.isArray(d._visitas)?d._visitas.length:-1,shoppers:Array.isArray(d.shoppers)?d.shoppers.length:-1,currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,summaryCount:summaries.length,periodKey,summary,kpis,countries,phaseSums:{assigned:sumPair('asign'),scheduled:sumPair('agend'),realized:sumPair('real'),questionnaire:sumPair('cuest'),submitted:sumPair('submit'),liquidated:sumPair('liq')}},
      finance:{project:{modelo:period.modelo||null,billingModel:period.billingModel||null,localBilling:period.localBilling??null,royaltyApplicable:period.royaltyApplicable??null,regalias:Number(period.regalias||0),honorario:period.honorario||null},modelContract:window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT||null,delegatedGuard:window.CX_DELEGATED_COORDINATION_FINANCE_GUARD||null,projectConfiguration:window.CX_TYA_PROJECT_FINANCIAL_CONFIGURATION||null,rows:financeRows},
      reservations:{marker:window.CX_TYA_CANONICAL_RESERVATIONS||null,mutation:reservationMutation},
      modules:{cliente:typeof window.CX?.modules?.cliente==='function',shopper:typeof window.CX?.modules?.miperfil==='function',finance:typeof window.CX?.modules?.financiero==='function',reservations:typeof window.CX?.modules?.reservas==='function'}
    };
  });
  partial.staff=staff;
  stage='staff_assertions';
  const s=staff.data.summary;
  assert(['super','admin','ops','coordinador'].includes(String(staff.role||'')),'STAFF_ROLE_INVALID');
  assert(staff.namespace==='staff'&&staff.tenantId==='tya','STAFF_SCOPE_INVALID');
  assert(staff.authority.applied&&staff.data.periods===staff.authority.periods&&staff.data.visits===staff.authority.visits,'HR_AUTHORITY_PARITY_INVALID');
  assert(staff.authority.duplicateVisitKeys===0&&staff.authority.duplicateShopperIds===0,'HR_DUPLICATE_KEYS');
  assert(staff.data.summaryCount===staff.authority.periods&&s,'HISTORICAL_SUMMARY_COVERAGE_INVALID');
  assert(staff.authority.firstPeriod==='2025-06'&&staff.authority.latestPeriod==='2026-07'&&staff.data.periodKey==='2026-07','LIVE_PERIOD_RANGE_INVALID');
  assert(Number(staff.data.kpis?.total?.t)===Number(s.total),'KPI_TOTAL_MISMATCH');
  assert(Number(staff.data.kpis?.asignadas?.t)===Number(s.assigned),'KPI_ASSIGNED_MISMATCH');
  assert(Number(staff.data.kpis?.realizadas?.t)===Number(s.realized),'KPI_REALIZED_MISMATCH');
  assert(Number(staff.data.kpis?.cuestPend?.t)===Math.max(0,Number(s.realized)-Number(s.questionnaireCompleted)),'KPI_QUESTIONNAIRE_PENDING_MISMATCH');
  assert(Number(staff.data.kpis?.sinSubmitir?.t)===Math.max(0,Number(s.questionnaireCompleted)-Number(s.submitted)),'KPI_SUBMIT_PENDING_MISMATCH');
  assert(Number(staff.data.kpis?.fueraRango?.t)===Number(s.outOfRange),'KPI_OUT_OF_RANGE_MISMATCH');
  assert(staff.data.phaseSums.assigned===Number(s.assigned)&&staff.data.phaseSums.scheduled===Number(s.scheduled)&&staff.data.phaseSums.realized===Number(s.realized)&&staff.data.phaseSums.questionnaire===Number(s.questionnaireCompleted)&&staff.data.phaseSums.submitted===Number(s.submitted),'PHASE_FLOW_MISMATCH');
  assert(staff.finance.project.modelo==='delegado'&&staff.finance.project.billingModel==='delegated_coordination'&&staff.finance.project.localBilling===false&&staff.finance.project.royaltyApplicable===false&&staff.finance.project.regalias===0,'CINEPOLIS_FINANCIAL_MODEL_INVALID');
  assert(Number(staff.finance.modelContract?.royaltyViolations||0)===0&&staff.finance.modelContract?.projectClassificationSource==='project_configuration_not_name','PROJECT_MODEL_CONTRACT_INVALID');
  assert(staff.finance.delegatedGuard?.shopperHonorariumUsedAsIncomeFallback===false&&staff.finance.delegatedGuard?.splitValuesInvented===false,'DELEGATED_FINANCE_GUARD_INVALID');
  assert(staff.finance.projectConfiguration?.model==='delegado'&&Number(staff.finance.projectConfiguration?.royalty||0)===0&&staff.finance.projectConfiguration?.commissionSplit?.valuesInvented===false,'PROJECT_FINANCIAL_CONFIGURATION_INVALID');
  assert(staff.finance.rows&&Object.keys(staff.finance.rows).length>0,'FINANCE_ROWS_MISSING');
  for(const country of staff.data.countries){
    const row=staff.finance.rows[country];
    assert(row,'FINANCE_COUNTRY_ROW_MISSING_'+country);
    assert(Number(row.regal||0)===0&&Number(row.isr||0)===0&&row.valuesInvented===false,'FINANCE_COUNTRY_CONTRACT_INVALID_'+country);
  }
  assert(staff.reservations.marker?.ready===true&&staff.reservations.marker?.browserLocalStorageAsSource===false&&staff.reservations.marker?.mutationsEnabled===false,'RESERVATIONS_GUARD_INVALID');
  assert(staff.reservations.mutation?.blocked===true&&staff.reservations.mutation?.reason==='canonical_reservation_source_not_connected','RESERVATION_MUTATION_NOT_BLOCKED');
  assert(Object.values(staff.modules).every(Boolean),'CANONICAL_MODULE_MISSING');
  await staffSession.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await staffSession.context.close();

  stage='client_login';
  const clientSession=await openAndLogin(browser,'cliente',credentials.client,'staff');
  stage='client_snapshot';
  const client=await clientSession.page.evaluate(()=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const view=document.getElementById('view')?.innerText||'';
    const d=window.CX?.data||{};
    return {role:ctx.role||null,namespace:ctx.authNamespace||null,tenantId:ctx.tenantId||null,projectIds:Array.isArray(ctx.projectIds)?ctx.projectIds.slice():[],periods:Array.isArray(d.projects)?d.projects.length:-1,visits:Array.isArray(d._visitas)?d._visitas.length:-1,currentProjectId:d.currentProjectId||null,currentPeriodId:d.currentPeriodId||null,clientModule:typeof window.CX?.modules?.cliente==='function',panorama:/Panorama|Operación del periodo|Resultados de evaluación/i.test(view),blocked:/Fuente de datos no disponible|Sin proyectos disponibles/i.test(view)};
  });
  partial.client=client;
  stage='client_assertions';
  assert(['cliente','client'].includes(String(client.role||''))&&client.namespace==='staff'&&client.tenantId==='tya'&&client.projectIds.includes('cinepolis'),'CLIENT_SCOPE_INVALID');
  assert(client.periods===staff.authority.periods&&client.visits===staff.authority.visits&&client.currentProjectId==='cinepolis','CLIENT_DATA_PARITY_INVALID');
  assert(client.clientModule&&client.panorama&&!client.blocked,'CLIENT_PORTAL_INVALID');
  await clientSession.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await clientSession.context.close();

  stage='shopper_login';
  const shopperSession=await openAndLogin(browser,'shopper',credentials.shopper,'shopper');
  stage='shopper_snapshot';
  const shopper=await shopperSession.page.evaluate(()=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const d=window.CX?.data||{};
    const canonical=ctx.shopperId?((d.__identityMap||{})[ctx.shopperId]||ctx.shopperId):null;
    let ownVisits=0;try{ownVisits=canonical&&d.visitsForShopper?d.visitsForShopper(canonical,false).length:0;}catch{}
    const marker=window.CX_TYA_CANONICAL_SHOPPER_PORTAL||null;
    return {role:ctx.role||null,namespace:ctx.authNamespace||null,tenantId:ctx.tenantId||null,shopperId:canonical||null,ownVisits,periods:Array.isArray(d.projects)?d.projects.length:-1,visits:Array.isArray(d._visitas)?d._visitas.length:-1,marker,shopperModule:typeof window.CX?.modules?.miperfil==='function'};
  });
  partial.shopper=shopper;
  stage='shopper_assertions';
  assert(shopper.role==='shopper'&&shopper.namespace==='shopper'&&shopper.tenantId==='tya'&&shopper.shopperId&&shopper.ownVisits>0,'SHOPPER_IDENTITY_HISTORY_INVALID');
  assert(shopper.periods===staff.authority.periods&&shopper.visits===staff.authority.visits,'SHOPPER_DATA_PARITY_INVALID');
  assert(shopper.marker?.ready===true&&shopper.marker?.exactIdentityOnly===true&&shopper.marker?.fullHistory===true&&shopper.marker?.certificationVisible===true&&shopper.shopperModule,'SHOPPER_PORTAL_INVALID');
  await shopperSession.page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await shopperSession.context.close();

  stage='persist_pass';
  const evidence={
    schemaVersion:'cxorbia.c6.remote-domain-finance-portals-reservations.v2',
    generatedAt:new Date().toISOString(),
    decision:'PASS_C6_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS',
    source:{periods:staff.authority.periods,visits:staff.authority.visits,shoppers:staff.authority.shoppers,firstPeriod:staff.authority.firstPeriod,latestPeriod:staff.authority.latestPeriod,revisionDynamic:true},
    latestPeriod:{periodKey:staff.data.periodKey,total:Number(s.total),assigned:Number(s.assigned),scheduled:Number(s.scheduled),realized:Number(s.realized),questionnaireCompleted:Number(s.questionnaireCompleted),submitted:Number(s.submitted),outOfRange:Number(s.outOfRange)},
    finance:{model:staff.finance.project.modelo,localBilling:staff.finance.project.localBilling,royaltyPct:staff.finance.project.regalias,shopperHonorariumUsedAsIncomeFallback:false,valuesInvented:false},
    reservations:{source:'protected_canonical_or_empty',browserLocalStorageAsSource:false,mutationsEnabled:false},
    client:{authenticated:true,projectScope:'cinepolis',panoramaVisible:true},
    shopper:{authenticated:true,exactIdentity:true,ownVisits:shopper.ownVisits,fullHistory:true,certificationVisible:true},
    modules:{cliente:'cliente',shopper:'miperfil',finance:'financiero',reservations:'reservas'},
    credentialsExposed:false,tokensExposed:false,authWrites:0,firestoreWrites:0,hrWrites:0,rulesDeploys:0,storageWrites:0,cloudRunDeploys:0,hostingDeploys:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,merge:false,production:false
  };
  persist(evidence);
  console.log(JSON.stringify(evidence));
}catch(error){
  const failure={
    schemaVersion:'cxorbia.c6.remote-domain-finance-portals-reservations.failure.v2',
    generatedAt:new Date().toISOString(),
    decision:'FAIL_C6_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS',
    failedStage:stage,
    errorCode:String(error?.message||error),
    partial,
    credentialsExposed:false,tokensExposed:false,authWrites:0,firestoreWrites:0,hrWrites:0,rulesDeploys:0,storageWrites:0,cloudRunDeploys:0,hostingDeploys:0,makeWrites:0,geminiCalls:0,paymentsWrites:0,merge:false,production:false
  };
  persist(failure);
  console.error(JSON.stringify(failure));
  process.exitCode=1;
}finally{
  await browser.close();
}
