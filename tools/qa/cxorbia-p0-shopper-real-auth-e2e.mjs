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
  let r20Stage='ENTRY_NAVIGATION';
  let r20ReadbackSignals={};
  const authProviderHttp=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.name||'Error').slice(0,30)));
  page.on('response',response=>{
    try{
      const host=new URL(response.url()).hostname;
      if(host==='identitytoolkit.googleapis.com'||host==='securetoken.googleapis.com'){
        authProviderHttp.push({provider:host==='identitytoolkit.googleapis.com'?'firebase_identity':'firebase_token',status:response.status()});
      }
    }catch(_){}
  });
  try{
    await page.goto(url.toString(),{waitUntil:'domcontentloaded',timeout:30000});
    r20Stage='PREAUTH_CONTRACT';
    const preAuth=await page.evaluate(()=>({
      entry:window.CX_DEV_ENTRY_CANONICAL||null,
      bundledSnapshotLoaded:Boolean(window.CX_TYA_HR_SOURCE_SAFE),
      authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true
    }));
    ensure(preAuth.entry?.preAuthOperationalData==='none','PREAUTH_OPERATIONAL_DATA_CONTRACT_MISSING');
    ensure(preAuth.bundledSnapshotLoaded===false,'STALE_BUNDLED_HR_SNAPSHOT_LOADED');
    ensure(preAuth.authorityApplied===false,'HR_AUTHORITY_APPLIED_BEFORE_AUTH');

    r20Stage='SHOPPER_ROLE_SELECTION';
    const shopperCard=page.getByText('Shopper / Evaluador',{exact:true});
    await shopperCard.click({timeout:15000});
    const userInput=page.locator('input[autocomplete="username"]:visible').last();
    const passInput=page.locator('input[autocomplete="current-password"]:visible').last();
    r20Stage='CREDENTIAL_FORM_FILL';
    await userInput.fill(login);
    await passInput.fill(password);
    r20Stage='LOGIN_SUBMIT';
    await page.getByRole('button',{name:'Ingresar',exact:true}).last().click();

    r20Stage='AUTHENTICATED_CONTEXT_WAIT';
    await page.waitForFunction(({tenantId,projectId})=>{
      const ctx=window.CX?.backendAuth?.context?.();
      return Boolean(ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&Array.isArray(ctx?.projectIds)&&ctx.projectIds.includes(projectId));
    },{tenantId,projectId},{timeout:30000});
    r20Stage='HR_AUTHORITY_WAIT';
    await page.waitForFunction(()=>window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,null,{timeout:60000});

    r20Stage='CANONICAL_IDENTITY_READBACK';
    const result=await page.evaluate(({tenantId,projectId,requireHistory})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const raw=String(ctx?.shopperId||'').trim();
      const map=window.CX?.data?.__identityMap||{};
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
      const principalUid=String(window.firebase?.auth?.().currentUser?.uid||'');
      const trustedSessionAuthority=Boolean(
        principalUid&&authority.applied===true&&authority.exactSessionShopperReady===true&&
        String(authority.actorUid||'')===principalUid&&String(authority.rawShopperId||'')===raw&&
        authority.role==='shopper'&&authority.authNamespace==='shopper'&&
        authority.tenantId===tenantId&&authority.projectId===projectId&&
        String(authority.canonicalShopperId||'')
      );
      const authorityCanonical=trustedSessionAuthority?String(authority.canonicalShopperId):'';
      const mapped=String(map[raw]||'').trim();
      const aliasConsistent=Boolean(!mapped||!authorityCanonical||mapped===authorityCanonical);
      const canonical=String(mapped||authorityCanonical||raw).trim();
      const rows=Array.isArray(window.CX?.data?.shoppers)?window.CX.data.shoppers:[];
      const contract=window.CX_EXACT_IDENTITY_CONTRACT;
      const matches=rows.filter(row=>{
        const id=String(row?.id||row?.shopperId||'').trim();
        if(id===canonical)return true;
        const aliases=contract?.collectExactValues?.(row)||[];
        return aliases.includes(raw)||aliases.includes(canonical);
      });
      const sessionProfile=window.CX?.data?.__sessionShopperProfile||null;
      const sessionProfileId=String(sessionProfile?.id||sessionProfile?.shopperId||'').trim();
      const sessionProfileBound=Boolean(trustedSessionAuthority&&sessionProfileId&&sessionProfileId===canonical);
      const canonicalResolved=Boolean(aliasConsistent&&matches.length<=1&&(matches.length===1||(matches.length===0&&sessionProfileBound)));
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
      const country=String(matches[0]?.pais||matches[0]?.country||
        (sessionProfileBound?(sessionProfile?.pais||sessionProfile?.country||authority.shopperCountry):'')).trim();
      const certRows=Array.isArray(window.CX?.data?.__protectedCertifications)?window.CX.data.__protectedCertifications:[];
      const certForPrincipal=certRows.filter(row=>{
        const id=String(row?.shopperId||row?.profileId||row?.shopperDocId||'').trim();
        if(id===raw||id===canonical)return true;
        const aliases=contract?.collectExactValues?.(row)||[];
        return aliases.includes(raw)||aliases.includes(canonical);
      }).length;
      const pass=Boolean(
        ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&ctx?.projectIds?.includes(projectId)&&
        raw&&canonicalResolved&&!inReview&&country&&
        window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&
        sourceRef.includes('hr-live-all-periods+firestore-authenticated-exact-overlay')&&
        !bodyText.includes('La identidad de esta sesión no está vinculada al read model canónico.')&&
        (!requireHistory||visits.length>0)
      );
      return {pass,tenantId,projectId,auth:true,shopperIdentityPresent:Boolean(raw),canonicalResolved,sessionProfileBound,hrListProfileMatch:matches.length===1,aliasConsistent,reviewRequired:inReview,countryAssigned:Boolean(country),historyCount:visits.length,historyRequired:requireHistory,authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,sourceRef,periods:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.periods||0),hrVisits:Number(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.hrVisits||0),identityContractVersion:contract?.version||null,certificationRecordsForPrincipal:certForPrincipal,visibleLockMessage:bodyText.includes('La identidad de esta sesión no está vinculada al read model canónico.'),safety:{providerWrites:0,writes:0,deploys:0,production:false}};
    },{tenantId,projectId,requireHistory});

    r20ReadbackSignals={
      canonicalResolved:result.canonicalResolved===true,
      sessionProfileBound:result.sessionProfileBound===true,
      hrListProfileMatch:result.hrListProfileMatch===true,
      aliasConsistent:result.aliasConsistent===true,
      reviewRequired:result.reviewRequired===true,
      countryAssigned:result.countryAssigned===true,
      authenticated:result.auth===true,
      authorityApplied:result.authorityApplied===true,
      sourceRefExact:result.sourceRef==='hr-live-all-periods+firestore-authenticated-exact-overlay',
      historyRequired:result.historyRequired===true,
      historyPresent:Number(result.historyCount)>0,
      visibleLockMessage:result.visibleLockMessage===true
    };
    ensure(pageErrors.length===0,'PAGE_ERRORS_PRESENT');
    ensure(result.pass,'REAL_SHOPPER_AUTH_TO_HR_E2E_FAILED');

    /* I3 durable checkpoint: a first-login legal/NDA gate is a real product gate, not an
       Auth/history failure. Never accept it automatically. If it is pending, certify the exact
       principal + HR/history and defer workspace route checks until the human legal gate is
       completed. If no legal gate is pending, Academia/Certification remain mandatory. */
    r20Stage='LEGAL_GATE_READBACK';
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
      r20Stage='ACADEMIA_NAVIGATION';
      academia=await verifyRoute(page,{selector:'#nav-aprendizaje',expectedView:'aprendizaje'});
      r20Stage='CERTIFICATION_NAVIGATION';
      certification=await verifyRoute(page,{selector:'#nav-cert',expectedView:'cert'});
      ensure(academia.rendered&&academia.authenticated&&academia.role==='shopper'&&!academia.lockMessage,'ACADEMIA_REAL_SHOPPER_ROUTE_FAILED');
      ensure(certification.rendered&&certification.authenticated&&certification.role==='shopper'&&!certification.lockMessage,'CERTIFICATION_REAL_SHOPPER_ROUTE_FAILED');
      academia={rendered:true,view:academia.view,sameAuthenticatedShopper:true,deferredByLegalGate:false};
      certification={rendered:true,view:certification.view,sameAuthenticatedShopper:true,recordsForPrincipal:result.certificationRecordsForPrincipal,deferredByLegalGate:false};
    }

    r20Stage='FINAL_SAME_PRINCIPAL_READBACK';
    const samePrincipal=await page.evaluate(({tenantId,projectId})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      return Boolean(ctx?.authenticated===true&&ctx?.tenantId===tenantId&&ctx?.role==='shopper'&&ctx?.projectIds?.includes(projectId)&&String(ctx?.shopperId||'').trim());
    },{tenantId,projectId});
    ensure(samePrincipal,'SHOPPER_PRINCIPAL_NOT_PRESERVED_ACROSS_WORKSPACE_GATE');

    r20Stage='FINAL_SUCCESS';
    console.log(JSON.stringify({schemaVersion:'cxorbia.p0.real-shopper-auth-e2e.result.v3',decision:'PASS_P0_REAL_SHOPPER_AUTH_TO_HR_E2E',...result,workspaceState:legalGate.pending?'legal-gate-pending':'mounted',legalGate:{supported:legalGate.supported,pending:legalGate.pending,visible:legalGate.visible,acceptanceAutomated:false},academia,certification,credentialsExposed:false,tokensExposed:false,safety:safe},null,2));
  }catch(e){
    let contextReadback={};
    try{
      contextReadback=await page.evaluate(()=>{
        const ctx=window.CX?.backendAuth?.context?.()||{};
        return {
          authenticated:ctx.authenticated===true,
          shopperRole:ctx.role==='shopper',
          tenantScoped:typeof ctx.tenantId==='string'&&ctx.tenantId.length>0,
          projectScoped:Array.isArray(ctx.projectIds)&&ctx.projectIds.length>0,
          firebasePrincipalPresent:Boolean(window.firebase?.auth?.().currentUser),
          protectedHrApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,
          loginFormPresent:Boolean(document.querySelector('#loginForm')),
          sessionProfilePresent:Boolean(window.CX?.data?.__sessionShopperProfile),
          sessionProfileExact:(()=>{
            const p=window.CX?.data?.__sessionShopperProfile||{};
            const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
            const id=String(p.id||p.shopperId||'');
            return Boolean(id&&id===String(a.canonicalShopperId||''));
          })(),
          exactSessionReady:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.exactSessionShopperReady===true,
          authorityCountryPresent:Boolean(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.shopperCountry)
        };
      });
    }catch(_){}
    const kind=String(e?.name||'');
    const safeErrorType=['TimeoutError','Error','AssertionError','TypeError'].includes(kind)?kind:'OtherError';
    console.log(JSON.stringify({
      schemaVersion:'cxorbia.p0.r20.password-stage-diagnostic.v1',
      decision:'HOLD_R20_PASSWORD_STAGE_DIAGNOSTIC_NOT_AUTH_PASS',
      stage:r20Stage,errorType:safeErrorType,
      authProviderHttp:authProviderHttp.slice(-8),
      contextReadback:{...contextReadback,identitySignals:r20ReadbackSignals},
      pageErrorCount:pageErrors.length,
      credentialsExposed:false,tokensExposed:false,
      safety:safe
    }));
    process.exitCode=1;
  }finally{
    await context.close();
    await browser.close();
  }
}
