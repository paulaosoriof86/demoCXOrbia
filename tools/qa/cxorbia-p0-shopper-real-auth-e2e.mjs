#!/usr/bin/env node
/* CXOrbia P0 Shopper real-auth E2E.
   Default mode is source-only self-test. Real execution requires explicit environment gate
   plus private credentials and performs browser reads only. It never calls CX.app.selectRole. */
import fs from 'node:fs';
import { chromium } from 'playwright';

const args=new Set(process.argv.slice(2));
const executeReal=args.has('--execute-real');
const rootUrl=String(process.env.CXORBIA_P0_E2E_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const tenantId=String(process.env.CXORBIA_P0_E2E_TENANT_ID||'tya');
const projectId=String(process.env.CXORBIA_P0_E2E_PROJECT_ID||'cinepolis');
const requireHistory=String(process.env.CXORBIA_P0_E2E_REQUIRE_HISTORY||'1')==='1';
const authorization=String(process.env.CXORBIA_P0_REAL_AUTH_E2E_AUTHORIZED||'');

const safe={providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,deploys:0,merge:false,production:false};
const ensure=(condition,code)=>{if(!condition)throw new Error(code);};

function sourceSelfTest(){
  const source=fs.readFileSync(new URL(import.meta.url),'utf8');
  const realBranchMarker="}else{\n  ensure(authorization==='YES_SOURCE_APPROVED_REAL_READONLY_E2E'";
  const markerIndex=source.indexOf(realBranchMarker);
  const realExecution=markerIndex>=0?source.slice(markerIndex):'';
  const checks={
    noPrototypeRoleEntry:!realExecution.includes('CX.app.selectRole(')&&!realExecution.includes('window.CX.app.selectRole('),
    realCredentialFields:realExecution.includes('autocomplete="username"')&&realExecution.includes('autocomplete="current-password"'),
    canonicalAuthContextRequired:realExecution.includes('backendAuth?.context?.()'),
    hrAuthorityRequired:realExecution.includes('CX_PROTECTED_AUTH_HR_AUTHORITY'),
    identityMapRequired:realExecution.includes('__identityMap'),
    reviewQueueChecked:realExecution.includes('__identityReviewQueue'),
    historyRequired:realExecution.includes('visitsForShopper'),
    explicitRealBranchFound:Boolean(realExecution),
    noWriteApis:!/(firebase-admin|admin\.auth\(|admin\.firestore\(|createUser\(|updateUser\(|deleteUser\(|setCustomUserClaims\(|firebase\s+deploy|gcloud\s+run\s+deploy)/i.test(realExecution)
  };
  const failed=Object.entries(checks).filter(([,pass])=>!pass).map(([id])=>id);
  return {schemaVersion:'cxorbia.p0.real-shopper-auth-e2e.source.v1',decision:failed.length?'FAIL_P0_REAL_SHOPPER_AUTH_E2E_SOURCE':'PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE',checks,failed,safety:safe};
}

if(!executeReal){
  const result=sourceSelfTest();
  console.log(JSON.stringify(result,null,2));
  process.exitCode=result.failed.length?1:0;
}else{
  ensure(authorization==='YES_SOURCE_APPROVED_REAL_READONLY_E2E','REAL_E2E_EXPLICIT_GATE_REQUIRED');
  const login=String(process.env.CXORBIA_P0_E2E_LOGIN||'');
  const password=String(process.env.CXORBIA_P0_E2E_PASSWORD||'');
  ensure(login&&password,'PRIVATE_E2E_CREDENTIALS_REQUIRED');

  const url=new URL(rootUrl+'/index-backend-dev.html');
  url.searchParams.set('cxProjectId',projectId);
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'block'});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.message||error)));
  try{
    await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:30000});
    const preAuth=await page.evaluate(()=>({
      entry:window.CX_DEV_ENTRY_CANONICAL||null,
      bundledSnapshotLoaded:Boolean(window.CX_TYA_HR_SOURCE_SAFE),
      authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true
    }));
    ensure(preAuth.entry?.preAuthOperationalData==='none','PREAUTH_OPERATIONAL_DATA_CONTRACT_MISSING');
    ensure(preAuth.bundledSnapshotLoaded===false,'STALE_BUNDLED_HR_SNAPSHOT_LOADED');
    ensure(preAuth.authorityApplied===false,'HR_AUTHORITY_APPLIED_BEFORE_AUTH');

    const shopperCard=page.getByText('Shopper / Evaluador',{exact:true});
    await shopperCard.click({timeout:15000});
    const userInput=page.locator('input[autocomplete="username"]:visible').last();
    const passInput=page.locator('input[autocomplete="current-password"]:visible').last();
    await userInput.fill(login);
    await passInput.fill(password);
    await page.getByRole('button',{name:'Ingresar',exact:true}).last().click();

    await page.waitForFunction(({tenantId,projectId})=>{
      const ctx=window.CX?.backendAuth?.context?.();
      return Boolean(ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&Array.isArray(ctx?.projectIds)&&ctx.projectIds.includes(projectId));
    },{tenantId,projectId},{timeout:30000});
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:60000});

    const result=await page.evaluate(({tenantId,projectId,requireHistory})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const raw=String(ctx?.shopperId||'').trim();
      const map=window.CX?.data?.__identityMap||{};
      const canonical=String(map[raw]||raw).trim();
      const rows=Array.isArray(window.CX?.data?.shoppers)?window.CX.data.shoppers:[];
      const contract=window.CX_EXACT_IDENTITY_CONTRACT;
      const matches=rows.filter(row=>{
        const id=String(row?.id||row?.shopperId||'').trim();
        if(id===canonical)return true;
        const aliases=contract?.collectExactValues?.(row)||[];
        return aliases.includes(raw)||aliases.includes(canonical);
      });
      const review=Array.isArray(window.CX?.data?.__identityReviewQueue)?window.CX.data.__identityReviewQueue:[];
      const inReview=review.some(item=>JSON.stringify(item).includes(raw)||JSON.stringify(item).includes(canonical));
      const visits=canonical&&typeof window.CX?.data?.visitsForShopper==='function'?window.CX.data.visitsForShopper(canonical,false):[];
      const sourceRef=String(window.CX?.dataSource?.sourceRef||'');
      const bodyText=document.body.innerText||'';
      const country=String(matches[0]?.pais||matches[0]?.country||'').trim();
      const pass=Boolean(
        ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&ctx?.projectIds?.includes(projectId)&&
        raw&&matches.length===1&&!inReview&&country&&
        window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
        sourceRef.includes('hr-live-all-periods+firestore-authenticated-exact-overlay')&&
        !bodyText.includes('La identidad de esta sesión no está vinculada al read model canónico.')&&
        (!requireHistory||visits.length>0)
      );
      return {pass,tenantId,projectId,auth:true,shopperIdentityPresent:Boolean(raw),canonicalResolved:matches.length===1,reviewRequired:inReview,countryAssigned:Boolean(country),historyCount:visits.length,historyRequired:requireHistory,authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,sourceRef,periods:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.periods||0),hrVisits:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.hrVisits||0),identityContractVersion:contract?.version||null,visibleLockMessage:bodyText.includes('La identidad de esta sesión no está vinculada al read model canónico.'),safety:{providerWrites:0,writes:0,deploys:0,production:false}};
    },{tenantId,projectId,requireHistory});
    ensure(pageErrors.length===0,'PAGE_ERRORS_PRESENT');
    ensure(result.pass,'REAL_SHOPPER_AUTH_TO_HR_E2E_FAILED');
    console.log(JSON.stringify({schemaVersion:'cxorbia.p0.real-shopper-auth-e2e.result.v1',decision:'PASS_P0_REAL_SHOPPER_AUTH_TO_HR_E2E',...result,safety:safe},null,2));
  }finally{
    await context.close();
    await browser.close();
  }
}
