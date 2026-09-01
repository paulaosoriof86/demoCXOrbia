#!/usr/bin/env node
/* CXOrbia P0 Shopper real-auth E2E.
   Default mode is source-only self-test. Real execution requires explicit environment gate
   plus private credentials and performs browser reads only. It never calls CX.app.selectRole. */
import fs from 'node:fs';

const args=new Set(process.argv.slice(2));
const executeReal=args.has('--execute-real');
const rootUrl=String(process.env.CXORBIA_P0_E2E_ROOT_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const tenantId=String(process.env.CXORBIA_P0_E2E_TENANT_ID||'tya');
const projectId=String(process.env.CXORBIA_P0_E2E_PROJECT_ID||'cinepolis');
const requireHistory=String(process.env.CXORBIA_P0_E2E_REQUIRE_HISTORY||'1')==='1';
const authorization=String(process.env.CXORBIA_P0_REAL_AUTH_E2E_AUTHORIZED||'');
const privateCredentialsPath=String(process.env.CXORBIA_P0_E2E_PRIVATE_CREDENTIALS||'');

const safe={providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,passwordChanges:0,passwordResets:0,deploys:0,merge:false,production:false};
const ensure=(condition,code)=>{if(!condition)throw new Error(code);};

function privateCredential(){
  let login=String(process.env.CXORBIA_P0_E2E_LOGIN||'');
  let password=String(process.env.CXORBIA_P0_E2E_PASSWORD||'');
  if((!login||!password)&&privateCredentialsPath){
    ensure(fs.existsSync(privateCredentialsPath),'PRIVATE_E2E_CREDENTIAL_FILE_MISSING');
    const envelope=JSON.parse(fs.readFileSync(privateCredentialsPath,'utf8'));
    login=String(envelope?.shopper?.login||'');
    password=String(envelope?.shopper?.password||'');
  }
  ensure(login&&password,'PRIVATE_E2E_CREDENTIALS_REQUIRED');
  return {login,password};
}

function sourceSelfTest(){
  const source=fs.readFileSync(new URL(import.meta.url),'utf8');
  const realBranchMarker="}else{\n  ensure(authorization==='YES_SOURCE_APPROVED_REAL_READONLY_E2E'";
  const markerIndex=source.indexOf(realBranchMarker);
  const realExecution=markerIndex>=0?source.slice(markerIndex):'';
  const hasStaticPlaywrightImport=source.split(/\r?\n/).some(line=>/^\s*import\s+.+\s+from\s+['\"]playwright['\"]\s*;?\s*$/.test(line));
  const checks={
    noPrototypeRoleEntry:!realExecution.includes('CX.app.selectRole(')&&!realExecution.includes('window.CX.app.selectRole('),
    realCredentialFields:realExecution.includes('autocomplete="username"')&&realExecution.includes('autocomplete="current-password"'),
    privateCredentialFileSupported:source.includes('CXORBIA_P0_E2E_PRIVATE_CREDENTIALS')&&source.includes('envelope?.shopper?.login')&&source.includes('envelope?.shopper?.password'),
    canonicalAuthContextRequired:realExecution.includes('backendAuth?.context?.()'),
    hrAuthorityRequired:realExecution.includes('CX_PROTECTED_AUTH_HR_AUTHORITY'),
    identityMapRequired:realExecution.includes('__identityMap'),
    reviewQueueChecked:realExecution.includes('__identityReviewQueue'),
    historyRequired:realExecution.includes('visitsForShopper'),
    academiaRouteRequired:realExecution.includes("#nav-aprendizaje")&&realExecution.includes("expectedView:'aprendizaje'"),
    certificationRouteRequired:realExecution.includes("#nav-cert")&&realExecution.includes("expectedView:'cert'"),
    legalGateAware:realExecution.includes('confidencialidad')&&realExecution.includes("pending('shopper')")&&realExecution.includes('workspaceState'),
    legalConsentNotAutomated:!realExecution.includes('confidencialidad.accept(')&&!realExecution.includes('confidencialidad.aceptar(')&&!realExecution.includes('confidencialidad.setAccepted(')&&realExecution.includes('acceptanceAutomated:false'),
    playwrightDeferredToRealExecution:!hasStaticPlaywrightImport&&realExecution.includes("await import('playwright')"),
    explicitRealBranchFound:Boolean(realExecution),
    noWriteApis:!/(firebase-admin|admin\.auth\(|admin\.firestore\(|createUser\(|updateUser\(|deleteUser\(|setCustomUserClaims\(|firebase\s+deploy|gcloud\s+run\s+deploy)/i.test(realExecution)
  };
  const failed=Object.entries(checks).filter(([,pass])=>!pass).map(([id])=>id);
  return {schemaVersion:'cxorbia.p0.real-shopper-auth-e2e.source.v5',decision:failed.length?'FAIL_P0_REAL_SHOPPER_AUTH_E2E_SOURCE':'PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE',checks,failed,safety:safe};
}

async function verifyRoute(page,{selector,expectedView}){
  const item=page.locator(selector);
  await item.waitFor({state:'visible',timeout:15000});
  await item.click();
  await page.waitForFunction(view=>window.CX?.session?.view===view,expectedView,{timeout:15000});
  return page.evaluate(expectedView=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const text=String(document.querySelector('#view')?.innerText||'').trim();
    const lock=text.includes('La identidad de esta sesión no está vinculada al read model canónico.');
    return {view:String(window.CX?.session?.view||''),rendered:text.length>20,authenticated:ctx?.authenticated===true,role:String(ctx?.role||''),lockMessage:lock};
  },expectedView);
}

if(!executeReal){
  const result=sourceSelfTest();
  console.log(JSON.stringify(result,null,2));
  process.exitCode=result.failed.length?1:0;
}else{
  ensure(authorization==='YES_SOURCE_APPROVED_REAL_READONLY_E2E','REAL_E2E_EXPLICIT_GATE_REQUIRED');
  const {chromium}=await import('playwright');
  const {login,password}=privateCredential();

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
      const inReview=review.some(item=>{
        if(!item||typeof item!=='object')return false;
        return String(item.liveShopperId||'')===raw||String(item.profileId||'')===raw||String(item.shopperId||'')===raw||
          (Array.isArray(item.candidates)&&item.candidates.map(String).includes(raw))||
          (Array.isArray(item.shopperIds)&&item.shopperIds.map(String).includes(raw));
      });
      const visits=canonical&&typeof window.CX?.data?.visitsForShopper==='function'?window.CX.data.visitsForShopper(canonical,false):[];
      const sourceRef=String(window.CX?.dataSource?.sourceRef||'');
      const bodyText=document.body.innerText||'';
      const country=String(matches[0]?.pais||matches[0]?.country||'').trim();
      const certRows=Array.isArray(window.CX?.data?.__protectedCertifications)?window.CX.data.__protectedCertifications:[];
      const certForPrincipal=certRows.filter(row=>{
        const id=String(row?.shopperId||row?.profileId||row?.shopperDocId||'').trim();
        if(id===raw||id===canonical)return true;
        const aliases=contract?.collectExactValues?.(row)||[];
        return aliases.includes(raw)||aliases.includes(canonical);
      }).length;
      const pass=Boolean(
        ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&ctx?.projectIds?.includes(projectId)&&
        raw&&matches.length===1&&!inReview&&country&&
        window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
        sourceRef.includes('hr-live-all-periods+firestore-authenticated-exact-overlay')&&
        !bodyText.includes('La identidad de esta sesión no está vinculada al read model canónico.')&&
        (!requireHistory||visits.length>0)
      );
      return {pass,tenantId,projectId,auth:true,shopperIdentityPresent:Boolean(raw),canonicalResolved:matches.length===1,reviewRequired:inReview,countryAssigned:Boolean(country),historyCount:visits.length,historyRequired:requireHistory,authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,sourceRef,periods:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.periods||0),hrVisits:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.hrVisits||0),identityContractVersion:contract?.version||null,certificationRecordsForPrincipal:certForPrincipal,visibleLockMessage:bodyText.includes('La identidad de esta sesión no está vinculada al read model canónico.'),safety:{providerWrites:0,writes:0,deploys:0,production:false}};
    },{tenantId,projectId,requireHistory});

    ensure(pageErrors.length===0,'PAGE_ERRORS_PRESENT');
    ensure(result.pass,'REAL_SHOPPER_AUTH_TO_HR_E2E_FAILED');

    /* I3 durable checkpoint: a first-login legal/NDA gate is a real product gate, not an
       Auth/history failure. Never accept it automatically. If it is pending, certify the exact
       principal + HR/history and defer workspace route checks until the human legal gate is
       completed. If no legal gate is pending, Academia/Certification remain mandatory. */
    const legalGate=await page.evaluate(()=>{
      const c=window.CX?.confidencialidad;
      const supported=Boolean(c&&typeof c.pending==='function');
      let pending=false;
      if(supported){try{pending=Boolean(c.pending('shopper'));}catch(_){pending=false;}}
      const candidates=[...document.querySelectorAll('.cx-ov,[role="dialog"]')];
      const modal=candidates.find(el=>{
        const text=String(el.innerText||'');
        if(!/(confidencial|\bnda\b|acuerdo)/i.test(text))return false;
        const style=getComputedStyle(el);const box=el.getBoundingClientRect();
        return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)!==0&&box.width>0&&box.height>0;
      })||null;
      const ctx=window.CX?.backendAuth?.context?.()||null;
      return {supported,pending,visible:Boolean(modal),role:String(window.CX?.session?.role||''),shopperId:String(ctx?.shopperId||'')};
    });

    let academia,certification;
    if(legalGate.pending){
      ensure(legalGate.supported,'LEGAL_GATE_PENDING_WITHOUT_CANONICAL_CONTRACT');
      ensure(legalGate.visible,'LEGAL_GATE_PENDING_BUT_DIALOG_NOT_VISIBLE');
      academia={rendered:false,deferredByLegalGate:true,view:null,sameAuthenticatedShopper:true};
      certification={rendered:false,deferredByLegalGate:true,view:null,sameAuthenticatedShopper:true,recordsForPrincipal:result.certificationRecordsForPrincipal};
    }else{
      academia=await verifyRoute(page,{selector:'#nav-aprendizaje',expectedView:'aprendizaje'});
      certification=await verifyRoute(page,{selector:'#nav-cert',expectedView:'cert'});
      ensure(academia.rendered&&academia.authenticated&&academia.role==='shopper'&&!academia.lockMessage,'ACADEMIA_REAL_SHOPPER_ROUTE_FAILED');
      ensure(certification.rendered&&certification.authenticated&&certification.role==='shopper'&&!certification.lockMessage,'CERTIFICATION_REAL_SHOPPER_ROUTE_FAILED');
      academia={rendered:true,view:academia.view,sameAuthenticatedShopper:true,deferredByLegalGate:false};
      certification={rendered:true,view:certification.view,sameAuthenticatedShopper:true,recordsForPrincipal:result.certificationRecordsForPrincipal,deferredByLegalGate:false};
    }

    const samePrincipal=await page.evaluate(({tenantId,projectId})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      return Boolean(ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&ctx?.projectIds?.includes(projectId)&&String(ctx?.shopperId||'').trim());
    },{tenantId,projectId});
    ensure(samePrincipal,'SHOPPER_PRINCIPAL_NOT_PRESERVED_ACROSS_WORKSPACE_GATE');

    console.log(JSON.stringify({schemaVersion:'cxorbia.p0.real-shopper-auth-e2e.result.v3',decision:'PASS_P0_REAL_SHOPPER_AUTH_TO_HR_E2E',...result,workspaceState:legalGate.pending?'legal-gate-pending':'mounted',legalGate:{supported:legalGate.supported,pending:legalGate.pending,visible:legalGate.visible,acceptanceAutomated:false},academia,certification,credentialsExposed:false,tokensExposed:false,safety:safe},null,2));
  }finally{
    await context.close();
    await browser.close();
  }
}
