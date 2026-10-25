import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-remote-gate/private-e2e.json';
const outputFile=String(process.env.CXORBIA_REMOTE_FINANCE_DIAGNOSTIC_OUTPUT||'').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password)throw new Error('PRIVATE_E2E_STAFF_INVALID');

const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  const page=await context.newPage();
  await page.goto(root+'/index-backend-dev.html?cxRemoteFinanceDiagnostic=1&ts='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:30000});
  await page.click('.role-btn[data-role="admin"]');
  await page.waitForSelector('#cxIntegratedAuthStep',{state:'visible',timeout:30000});
  await page.fill('#cxIntegratedAuthLogin',credentials.staff.login);
  await page.fill('#cxIntegratedAuthPassword',credentials.staff.password);
  await page.click('#cxIntegratedAuthSubmit');
  await page.waitForFunction(()=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    return Boolean(ctx?.authenticated===true&&ctx?.authNamespace==='staff'&&a?.applied===true&&document.getElementById('app')?.classList.contains('on')===true);
  },null,{timeout:90000});
  const diagnostic=await page.evaluate(()=>{
    const d=window.CX?.data||{};
    const period=d.period?.()||null;
    const project=d.project?.()||null;
    const currentById=Array.isArray(d.projects)?d.projects.find(x=>x&&x.id===d.currentPeriodId)||null:null;
    const modelFields=x=>x?{
      id:x.id??null,
      parentProjectId:x.parentProjectId??null,
      program:x.program??null,
      periodKey:x.periodKey??null,
      modelo:x.modelo??null,
      billingModel:x.billingModel??null,
      projectModel:x.projectModel??null,
      localBilling:x.localBilling??null,
      royaltyApplicable:x.royaltyApplicable??null,
      regalias:x.regalias??null,
      compensationModel:x.compensationModel??null,
      financialModelReviewRequired:x.financialModelReviewRequired??null,
      financialModelContractVersion:x.financialModelContractVersion??null
    }:null;
    return {
      schemaVersion:'cxorbia.c6.remote-finance-model-diagnostic.v1',
      generatedAt:new Date().toISOString(),
      decision:'DIAGNOSTIC_C6_REMOTE_FINANCE_MODEL_CAPTURED',
      currentProjectId:d.currentProjectId||null,
      currentPeriodId:d.currentPeriodId||null,
      period:modelFields(period),
      project:modelFields(project),
      currentById:modelFields(currentById),
      projectFinancialModelContract:window.CX_PROJECT_FINANCIAL_MODEL_CONTRACT||null,
      projectFinancialConfiguration:window.CX_TYA_PROJECT_FINANCIAL_CONFIGURATION||null,
      delegatedCoordinationGuard:window.CX_DELEGATED_COORDINATION_FINANCE_GUARD||null,
      projectCount:Array.isArray(d.projects)?d.projects.length:-1,
      credentialsExposed:false,
      tokensExposed:false,
      hostingDeploys:0,
      providerWrites:0,
      authWrites:0,
      firestoreWrites:0,
      hrWrites:0,
      merge:false,
      production:false
    };
  });
  if(outputFile){
    fs.mkdirSync(path.dirname(outputFile),{recursive:true});
    fs.writeFileSync(outputFile,JSON.stringify(diagnostic,null,2)+'\n','utf8');
  }
  console.log(JSON.stringify(diagnostic));
  await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
  await context.close();
}finally{
  await browser.close();
}
