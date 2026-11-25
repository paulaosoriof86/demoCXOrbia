// I3 control only. Two fresh Admin contexts, existing committed advance and exports.
// All application mutations are blocked; no ACK is fabricated and app state is not patched.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {settleCustomRoleAuth} from '../../.github/control/RECOVERY-I3-BROWSER-AUTH-LIFECYCLE-20260919.mjs';
import {UI_SCHEMA,UI_SCOPE_PATH,str,need,digest,hashBytes,ordered,publicError,prepareMetadataCommand,validateUiEnvironment,assertCommittedAdvanceReadback,assertCurrentAdmin,assertBrowserPrincipal,assertExactMovementProjection,movementExpected,assertMovementDom,assertStableFinance,classifyUiRequest,rowDataHash,MOVEMENT_HEADERS,DASHBOARD_HEADERS,sanitizeUiDiagnostic} from './cxorbia-i3-finance-ui-readonly-contract.mjs';
import {readGoogleQaExecution} from './cxorbia-i3-google-qa-execution.mjs';
import {proveReport} from './cxorbia-i3-finance-ui-export-readonly.mjs';
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

async function installNetworkGuard(context,scope,project,host,stats){
  let closed=false;context.on('close',()=>{closed=true;});
  await context.route('**/*',async route=>{
    try{
    const request=route.request();let body=null;try{body=request.postDataJSON();}catch{}
    const action=classifyUiRequest({url:request.url(),method:request.method(),body,devOrigin:host,firebaseProject:project,tenantId:scope.tenantId,projectId:scope.projectId});
    if(action==='BLOCK_AUTOMATIC_HR'){stats.automaticHrSuppressed++;await route.abort('blockedbyclient');return;}
    if(action.startsWith('DENY_')){
      stats.unexpectedDenied++;stats.denialKinds[action]=(stats.denialKinds[action]||0)+1;
      // Never log tokens, queries, bodies, or raw finance data. Bind an asset by path hash.
      if(stats.deniedRequests.length<32){const url=new URL(request.url());stats.deniedRequests.push({kind:action,method:request.method(),resourceType:request.resourceType(),origin:url.origin,pathnameSha256:hashBytes(Buffer.from(url.pathname))});}
      await route.abort('blockedbyclient');return;
    }
    if(action==='ALLOW_AUTH')stats.allowedAuthRequests++;
    await route.continue();
    }catch(_){if(!closed)stats.routeControlFailures++;try{await route.abort('blockedbyclient');}catch{}}
  });
  return ()=>{closed=true;};
}
async function failureUi(page,scope){
  if(!page||page.isClosed())return sanitizeUiDiagnostic({});
  try{return sanitizeUiDiagnostic(await page.evaluate(({tenantId,projectId,periodId})=>{
    const data=window.CX?.data,ctx=window.CX?.backendAuth?.context?.()||{};
    return {available:true,firebaseUserPresent:!!window.firebase?.auth?.().currentUser,contextAuthenticated:ctx.authenticated===true,authorityApplied:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true,
      expectedProjectSelected:data?.currentProjectId===projectId,expectedPeriodSelected:data?.currentPeriodId===periodId,projectionLoaded:data?.__financeProjectionLoaded===true,projectionKeyMatches:data?.__financeProjectionKey===tenantId+'::'+projectId+'::'+periodId,
      movExportPresent:!!document.querySelector('#movExport'),finExportPresent:!!document.querySelector('#finExport'),reportPreviewPresent:!!document.querySelector('#rkBody table'),printTablePresent:!!document.querySelector('#cxRKPrint table'),
      route:window.CX?.session?.view,role:ctx.role,movementRowCount:document.querySelectorAll('#view [data-delm]').length,reportRowCount:document.querySelectorAll('#rkBody tbody tr').length};
  },{tenantId:scope.tenantId,projectId:scope.projectId,periodId:scope.cashPeriodId}));}catch{return sanitizeUiDiagnostic({});}
}
// Only a fixed code or a one-way digest can leave the browser. The HR owner may
// include private UID, tenant, period or provider details after a diagnostic.
export function financeHrOwnerCode(value){
  const error=String(value||'');
  const codes=['HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS','HR_LIVE_DUPLICATE_PERIOD_KEYS','HR_LIVE_NETWORK_FAILURE','HR_LIVE_NONEMPTY_REQUIRED','HR_LIVE_REVISION_CHANGED_DURING_COMPOSITION','HR_LIVE_REVISION_PUBLICATION_MISMATCH','HR_LIVE_REVISION_READBACK_MISSING','HR_LIVE_REVISION_REQUIRED','HR_LIVE_SCOPE_MISMATCH','HR_LIVE_SOURCE_SAFE_REQUIRED','HR_LIVE_UNAVAILABLE','PROJECT_SCOPE_REQUIRED','CANONICAL_COMPOSER_V2_MISSING','CANONICAL_PERIOD_LOSS','CERTIFICATION_EVIDENCE_PROJECTOR_MISSING','BACKEND_REFRESH_ATOMIC_COMPOSITION_REQUIRED','BACKEND_REFRESH_READBACK_REVISION_MISMATCH','AUTH_FAILURE:PROTECTED_HR_PRINCIPAL_REQUIRED','AUTH_FAILURE:SESSION_GENERATION_CHANGED_DURING_COMPOSITION','AUTH_FAILURE:SESSION_NO_LONGER_AUTHORIZED','AUTH_FAILURE:PROTECTED_STATE_PRINCIPAL_CHANGED_DURING_COMPOSITION','AUTH_FAILURE:SHOPPER_PRINCIPAL_CLAIMS_MEMBERSHIP_MISMATCH'];
  if(codes.includes(error))return error;
  for(const prefix of ['CANONICAL_DYNAMIC_COMPOSITION_INVARIANT_','HR_LIVE_VISIT_PERIOD_MISSING_','AUTH_FAILURE:SHOPPER_EXACT_HR_PROFILE_COUNTRY_PERIOD_REQUIRED:'])if(error.startsWith(prefix))return prefix.slice(0,-1);
  if(/^HR_LIVE_(REVISION_READBACK_)?HTTP_[1-5][0-9]{2}$/.test(error))return error;
  return error?'OTHER':'NO_OWNER_ERROR';
}
async function captureHrOwner(page){
  try{
    const state=await page.evaluate(()=>{
      const a=window.CX_PROTECTED_AUTH_HR_AUTHORITY,src=window.CX?.dataSource;
      const route=performance.getEntriesByType('resource').filter(x=>{
        try{const u=new URL(x.name);return u.origin===location.origin&&u.pathname.endsWith('/hr-live');}catch{return false;}
      });
      return {authorityPresent:!!a,applied:a?.applied===true,retryable:a?.retryable===true,ownerError:String(a?.error||''),
        sourceReady:src?.status==='ready',sourceBlocked:src?.status==='blocked',runtimeReady:typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY==='function',
        authenticatedHrHttp:route.slice(-8).map(x=>Number(x.responseStatus)||0)};
    });
    const {ownerError,...publicState}=state;
    return {...publicState,ownerCode:financeHrOwnerCode(ownerError),ownerErrorSha256:ownerError?hashBytes(Buffer.from(ownerError)):null};
  }catch{return {available:false};}
}
async function readLedger(tenant,projectId,FieldPath){
  const ledger={},versions={};
  const collections={movements:'financialMovements',accounts:'financeAccounts',lots:'paymentLots',reconciliations:'paymentReconciliations',budgets:'financeBudgets'};
  for(const [name,collection]of Object.entries(collections)){
    const rows=[],stamps=[];let cursor=null,complete=false;
    for(let page=0;page<20;page++){
      let query=tenant.collection(collection).where('projectId','==',projectId).orderBy(FieldPath.documentId()).limit(500);
      if(cursor)query=query.startAfter(cursor);
      const snap=await query.get();
      for(const doc of snap.docs){
        rows.push({...JSON.parse(JSON.stringify(doc.data())),docId:doc.id});
        stamps.push({docId:doc.id,updateTime:doc.updateTime?{seconds:doc.updateTime.seconds,nanoseconds:doc.updateTime.nanoseconds}:null});
      }
      if(snap.size<500){complete=true;break;}cursor=snap.docs.at(-1);
    }
    need(complete,'PROVIDER_FAILURE:C09_C10_READ_BOUND');ledger[name]=ordered(rows);versions[name]=ordered(stamps);
  }
  return {ledger,versions};
}
async function selectedPeriod(page,scope,uid){
  await page.locator('#periodSel').selectOption(scope.cashPeriodId);
  await page.waitForFunction(({projectId,periodId,uid})=>{
    const data=window.CX?.data,authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY,read=window.CX_TYA_HR_SOURCE_SAFE?.readScope;
    const ids=read?.freshPeriodIds||read?.periodIds,covered=!read||read.mode!=='explicit_period'||read.requestedPeriodId===periodId||Array.isArray(ids)&&ids.includes(periodId);
    return window.firebase?.auth?.().currentUser?.uid===uid&&data?.currentProjectId===projectId&&data?.currentPeriodId===periodId&&authority?.applied===true&&covered;
  },{projectId:scope.projectId,periodId:scope.cashPeriodId,uid},{timeout:150000});
}
async function readMovementPage(page,scope){
  await page.evaluate(()=>window.CX.router.nav('movimientos'));
  await page.waitForFunction(key=>window.CX?.session?.view==='movimientos'&&window.CX?.data?.__financeProjectionLoaded===true&&window.CX?.data?.__financeProjectionKey===key,
    scope.tenantId+'::'+scope.projectId+'::'+scope.cashPeriodId,{timeout:90000});
  await page.locator('#movExport').waitFor({state:'visible',timeout:30000});
  return page.evaluate(async({projectId,periodId})=>{
    const data=window.CX.data,remote=await data.getFinancialMovements({projectId,periodId,requireServerRead:true}),period=data.period();
    const rows=[...document.querySelectorAll('#view [data-delm]')].map(button=>{
      const cells=[...button.closest('tr').querySelectorAll('td')];
      return {id:button.dataset.delm,date:cells[0]?.textContent.trim()||'',concept:cells[1]?.querySelector('b')?.textContent.trim()||'',description:cells[1]?.querySelector('div')?.textContent.trim()||'',category:cells[2]?.textContent.trim()||'',typeLabel:cells[3]?.textContent.trim()||'',country:cells[4]?.textContent.trim()||'',displayedMoney:cells[5]?.textContent.trim()||'',status:cells[6]?.textContent.trim()||''};
    });
    return {projectId:data.currentProjectId,periodId:data.currentPeriodId,remote,projection:data.__financialMovements,rows,currency:period.currency,incomeLabels:window.CX.finStore.TIPOS_INGRESO,expenseLabels:window.CX.finStore.TIPOS_EGRESO,periodLabel:period.periodo||period.ronda||period.periodLabel||period.name||String(data.currentPeriodId),hrRevision:data.previewMeta?.sourceRevision};
  },{projectId:scope.projectId,periodId:scope.cashPeriodId});
}
async function dashboardProof(page,scope,privateDir,label,failureArchive){
  await page.evaluate(()=>window.CX.router.nav('financiero'));
  await page.waitForFunction(()=>window.CX?.session?.view==='financiero'&&!!document.querySelector('#finExport'),null,{timeout:90000});
  const observed=await page.evaluate(()=>{
    const data=window.CX.data,p=data.period(),fp=window.CX.fin.porPais(data),safe=n=>Number.isFinite(n)?Math.round(n):null;
    const period=window.CX.fin.canonPeriods().find(x=>x.id===window.CX.fin.canonCurrentId());
    return {projectId:data.currentProjectId,periodId:data.currentPeriodId,periodLabel:period?.label||'',
      tiles:[...document.querySelectorAll('[data-fin-country][data-fin-currency]')].map(x=>({country:x.dataset.finCountry,currency:x.dataset.finCurrency})),
      hasRows:p.countries.some(c=>fp[c]&&(fp[c].visRe>0||fp[c].ingreso>0||fp[c].honorarioDevengado>0)),
      rows:p.countries.map(c=>{const d=fp[c];return [window.CX.paisLabel(c),d.cur,safe(d.ingreso),safe(d.honorarioDevengado),safe(d.honorarioPorPagar),safe(d.honorarioPagado),safe(d.fijos),safe(d.margen),Number.isFinite(d.margenPct)?d.margenPct+'%':null,safe(d.cxc)];}),
      expectedTiles:p.countries.map(c=>({country:c,currency:fp[c].cur==='Q'?'GTQ':fp[c].cur==='L'?'HNL':String(fp[c].cur||'moneda pendiente')}))};
  });
  need(observed.projectId===scope.projectId&&observed.periodId===scope.cashPeriodId&&str(observed.periodLabel),'FUNCTIONAL_DEFECT:C09_C10_DASHBOARD_PERIOD');
  need(digest([...observed.tiles].sort((a,b)=>a.country.localeCompare(b.country)))===digest([...observed.expectedTiles].sort((a,b)=>a.country.localeCompare(b.country))),'FUNCTIONAL_DEFECT:C09_C10_DASHBOARD_COUNTRY_CURRENCY');
  if(!observed.hasRows){
    await page.locator('#finExport').click();
    await page.getByText('Sin filas financieras reales para exportar en este periodo y alcance',{exact:true}).waitFor({state:'visible',timeout:10000});
    need(await page.locator('#rkBody').count()===0,'FUNCTIONAL_DEFECT:C09_C10_EMPTY_DASHBOARD_EXPORT');
    return {decision:'NOT_APPLICABLE_NO_ELIGIBLE_ROWS',realRows:false,emptyStateObserved:true,independentHrKpisCertified:false};
  }
  const result=await proveReport({page,exportButton:'#finExport',headers:DASHBOARD_HEADERS,rows:observed.rows,periodLabel:observed.periodLabel,title:'Dashboard Financiero',privateDir,label,failureArchive});
  return {...result,realRows:true,reference:'CURRENT_FINANCE_READ_MODEL_SAME_PERIOD',independentHrKpisCertified:false};
}

export async function runFinanceUiReadonly({project,host,out,source,env=process.env}){
  const google=readGoogleQaExecution(env,'i3-finance-focal-reproof',source,env.FOCAL_TREE);
  const destination=path.join(out,'ui-readonly');fs.mkdirSync(destination,{recursive:true});
  const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'cx-finance-ui-private-'));
  const evidence={schemaVersion:UI_SCHEMA,decision:'HOLD_C09_C10_UI_READONLY',state:'HOLD',operationKind:'READ_ONLY_WITH_APP_MUTATIONS_BLOCKED',scope:'ADVANCE_UI_AND_FINANCE_EXPORT_PARITY_ONLY',
    ...(google?{externalExecution:google}:{}),
    runId:google?.runId||String(env.GITHUB_RUN_ID||''),runAttempt:google?.runAttempt||String(env.GITHUB_RUN_ATTEMPT||''),controlSha:google?.controlSha||String(env.GITHUB_SHA||''),sourceSha:source,sourceTree:env.FOCAL_TREE,
    production:false,i4Authorized:false,fullDomain:false,newDomainMatches:0,phaseAComplete:false,privateDataExposed:false,
    independentAdminSessions:0,authIdentityOrClaimsWrites:0,directFirestoreWrites:0,providerCommandsExecuted:0,financialMutationRequestsDispatched:0,
    paymentsTested:false,benefitsRetested:false,dashboardIndependentHrKpisCertified:false,automaticHrReconciliationProven:false,
    rawExports:'PRIVATE_TEMP_PARSED_HASHED_REMOVED_FAILED_PDF_ENCRYPTED_ONLY',stage:'PREFLIGHT',sessionAttempted:0,sessions:[],network:{automaticHrSuppressed:0,unexpectedDenied:0,allowedAuthRequests:0,routeControlFailures:0,denialKinds:{},deniedRequests:[]},customTokenMints:0};
  const stage=value=>{evidence.lastCompletedStage=evidence.stage;evidence.stage=value;};
  let app,browser,deleteApp,failure;
  try{
    const scope=readJson(UI_SCOPE_PATH),plan=readJson(scope.metadataScopePath);
    const descriptor=readJson(env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),current=readJson('CXORBIA_RECOVERY_EXECUTION_CURRENT.json');
    validateUiEnvironment({scope,plan,descriptor,current,project,host,source,tree:env.FOCAL_TREE,branch:google?.branch||env.GITHUB_REF_NAME,mode:env.CXORBIA_I3_FINANCE_MODE,period:env.FINAL_FOCAL_PERIOD_ID,emulator:env.FIRESTORE_EMULATOR_HOST});
    const failureArchive={destination,publicKey:readJson('docs/checkpoints/CXORBIA_I3_FINANCE_CURRENT_READONLY_SCOPE_20261117.json').encryptionPublicKey,
      identity:{runId:evidence.runId,runAttempt:evidence.runAttempt,controlSha:evidence.controlSha,sourceSha:source,sourceTree:env.FOCAL_TREE}};
    const identity=descriptor.currentMaterialization;
    Object.assign(evidence,{scopeSha256:digest(scope),metadataScopeSha256:digest(plan),runtimeRevision:identity.runtimeRevision,runtimeDigest:identity.runtimeDigest,hostingVersion:identity.hostingVersion,prerequisiteArtifactDigest:scope.prerequisite.artifactDigest});
    need(/^[1-9][0-9]*$/.test(evidence.runId)&&/^[1-9][0-9]*$/.test(evidence.runAttempt)&&/^[a-f0-9]{40}$/.test(evidence.controlSha),'SOURCE_FAILURE:C09_C10_RUN_IDENTITY');
    stage('DEPENDENCIES');
    const appModule=await import('firebase-admin/app');deleteApp=appModule.deleteApp;
    const {getFirestore,FieldPath}=await import('firebase-admin/firestore'),{getAuth}=await import('firebase-admin/auth'),{chromium}=await import('playwright');
    app=appModule.initializeApp({credential:appModule.applicationDefault(),projectId:project,...(google?{serviceAccountId:google.signer}:{})},'finance-ui-'+evidence.runId+'-'+evidence.runAttempt);
    const db=getFirestore(app),auth=getAuth(app),tenant=db.collection('tenants').doc(scope.tenantId);
    stage('ADC_BASELINE');
    const before=await readLedger(tenant,scope.projectId,FieldPath),prepared=prepareMetadataCommand(before.ledger,plan);
    const readReceipt=async()=>{const snap=await tenant.collection('commandReceipts').doc(prepared.receiptId).get();return snap.exists?JSON.parse(JSON.stringify(snap.data())):null;};
    stage('METADATA_RECEIPT');
    const receipt=await readReceipt(),exact=assertCommittedAdvanceReadback({ledger:before.ledger,plan,receipt});
    evidence.metadataReceiptSha256=digest(receipt);
    const base=host+'/index-backend-dev.html?'+new URLSearchParams({cxBackendPreview:'YES_PAULA_20260628_PREVIEW_DEV',cxProjectId:scope.projectId,cxTenantId:scope.tenantId,cxProtectedRuntime:'YES_PAULA_20260730_PROTECTED_DEV',cxHumanFullVisual:'YES_PAULA_20260731_FULL_PROFILE_DEV'}).toString();
    const readPrincipal=async()=>{
      const snap=await tenant.collection('users').doc(exact.actorUid).get(),member=snap.exists?{...snap.data(),id:snap.id}:null,user=await auth.getUser(exact.actorUid);
      const expected=assertCurrentAdmin({uid:exact.actorUid,member,user,tenantId:scope.tenantId,projectId:scope.projectId});
      return {member,expected,principalScopeSha256:digest({member,claims:user.customClaims,disabled:user.disabled===true})};
    };
    stage('ADMIN_AUTHORITY');
    const initialPrincipal=await readPrincipal();browser=await chromium.launch({headless:true});
    for(let index=0;index<scope.independentAdminSessions;index++){
      evidence.sessionAttempted=index+1;evidence.activeSessionProgress={auth:false,period:false,serverRows:false,dom:false,advancePair:false,movementExport:false,dashboard:false,finalRead:false};
      const sessionStage=suffix=>stage('SESSION_'+(index+1)+'_'+suffix);let page,stopGuard=()=>{};
      sessionStage('AUTH');
      const principal=await readPrincipal();need(principal.principalScopeSha256===initialPrincipal.principalScopeSha256,'AUTH_FAILURE:C09_C10_PRINCIPAL_CHANGED');
      const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',serviceWorkers:'block',acceptDownloads:true});
      try{
        const initial=await context.storageState();need(initial.cookies.length===0&&initial.origins.length===0,'ENVIRONMENT_FAILURE:C09_C10_FRESH_CONTEXT');
        stopGuard=await installNetworkGuard(context,scope,project,host,evidence.network);
        page=await context.newPage();page.setDefaultTimeout(30000);
        await settleCustomRoleAuth({page,member:principal.member,role:'admin',tenantId:scope.tenantId,projectId:scope.projectId,baseUrl:base,getCustomToken:()=>{evidence.customTokenMints++;return auth.createCustomToken(exact.actorUid);}});
        const observedPrincipal=await page.evaluate(async()=>{const user=window.firebase.auth().currentUser,token=await user.getIdTokenResult(true);return {uid:user.uid,claims:token.claims,context:window.CX.backendAuth.context(),firebaseProject:window.firebase.app().options.projectId};});
        assertBrowserPrincipal({observed:observedPrincipal,expected:principal.expected,projectId:scope.projectId,firebaseProject:project});
        evidence.activeSessionProgress.auth=true;sessionStage('PERIOD');
        await selectedPeriod(page,scope,exact.actorUid);
        evidence.activeSessionProgress.period=true;sessionStage('MOVEMENTS');
        const observed=await readMovementPage(page,scope);
        need(observed.projectId===scope.projectId&&observed.periodId===scope.cashPeriodId&&/^[a-f0-9]{64}$/.test(String(observed.hrRevision||'')),'PERSISTENCE_FAILURE:C09_C10_UI_SCOPE_REVISION');
        const sourceRows=assertExactMovementProjection({adcRows:before.ledger.movements,remote:observed.remote,projection:observed.projection,projectId:scope.projectId,periodId:scope.cashPeriodId,tenantId:scope.tenantId});
        evidence.activeSessionProgress.serverRows=true;
        const expectedRows=movementExpected(sourceRows,observed);assertMovementDom(observed.rows,expectedRows);evidence.activeSessionProgress.dom=true;
        const browserPair=prepareMetadataCommand({movements:observed.remote.items.map(row=>({...row,docId:row.id}))},plan);
        need(browserPair.first.id===exact.first.id&&browserPair.second.id===exact.second.id&&digest({cat:browserPair.second.cat,fecha:browserPair.second.fecha})===digest(plan.patch),'PERSISTENCE_FAILURE:C09_C10_UI_ADVANCE_PAIR');
        evidence.activeSessionProgress.advancePair=true;sessionStage('MOVEMENT_EXPORT');
        const movementExport=await proveReport({page,exportButton:'#movExport',headers:MOVEMENT_HEADERS,rows:expectedRows.map(x=>x.cells),periodLabel:observed.periodLabel,title:'Movimientos & Tesorería',privateDir,label:'session-'+index+'-movements',failureArchive});
        evidence.activeSessionProgress.movementExport=true;sessionStage('DASHBOARD');
        const dashboard=await dashboardProof(page,scope,privateDir,'session-'+index+'-dashboard',failureArchive);
        evidence.activeSessionProgress.dashboard=true;sessionStage('FINAL_READ');
        const afterUi=await page.evaluate(async({projectId,periodId})=>window.CX.data.getFinancialMovements({projectId,periodId,requireServerRead:true}),{projectId:scope.projectId,periodId:scope.cashPeriodId});
        assertExactMovementProjection({adcRows:before.ledger.movements,remote:afterUi,projection:observed.projection,projectId:scope.projectId,periodId:scope.cashPeriodId,tenantId:scope.tenantId});
        evidence.activeSessionProgress.finalRead=true;
        evidence.sessions.push({index:index+1,newContextEmpty:true,principalScopeSha256:principal.principalScopeSha256,exactCurrentAdminClaims:true,periodId:scope.cashPeriodId,hrRevisionObserved:observed.hrRevision,serverReadConfirmed:true,advancePairExact:true,firstAdvanceUnchanged:true,secondMetadataExact:true,rowCount:sourceRows.length,semanticRowsSha256:rowDataHash(sourceRows),domRowsSha256:digest(observed.rows),movementExport,dashboard});
        evidence.independentAdminSessions++;
      }catch(error){evidence.failureUi=await failureUi(page,scope);evidence.hrOwnerDiagnostic=await captureHrOwner(page);throw error;}finally{stopGuard();await context.close();}
      need(evidence.network.unexpectedDenied===0&&evidence.network.routeControlFailures===0,'ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST');
    }
    const [a,b]=evidence.sessions;
    need(a&&b&&a.semanticRowsSha256===b.semanticRowsSha256&&a.domRowsSha256===b.domRowsSha256&&a.hrRevisionObserved===b.hrRevisionObserved&&a.movementExport.semanticRowsSha256===b.movementExport.semanticRowsSha256&&a.dashboard.decision===b.dashboard.decision&&a.dashboard.semanticRowsSha256===b.dashboard.semanticRowsSha256,'PERSISTENCE_FAILURE:C09_C10_INDEPENDENT_SESSION_DRIFT');
    stage('FINAL_LEDGER');
    const after=await readLedger(tenant,scope.projectId,FieldPath);assertStableFinance(before,after);
    const finalReceipt=await readReceipt();need(digest(finalReceipt)===digest(receipt),'PERSISTENCE_FAILURE:C09_C10_METADATA_RECEIPT_CHANGED');
    assertCommittedAdvanceReadback({ledger:after.ledger,plan,receipt:finalReceipt});
    need((await readPrincipal()).principalScopeSha256===initialPrincipal.principalScopeSha256,'AUTH_FAILURE:C09_C10_PRINCIPAL_CHANGED');
    stage('COMPLETE');
    Object.assign(evidence,{decision:'PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE',currentAdminClaimsVerified:true,browserServerReadVerified:true,committedMetadataReceiptVerified:true,firstAdvanceUnchanged:true,secondMetadataExact:true,advanceCount:2,sameCashPeriod:true,newSessionParity:true,financialDocumentsStable:true,financeBeforeSha256:digest(before),financeAfterSha256:digest(after),atomicSnapshotClaimed:false});
  }catch(error){
    evidence.failureStage=evidence.stage;
    // Report the failing operation; a prior blocked asset must not hide it.
    evidence.error=publicError(error);
    if(evidence.network.unexpectedDenied||evidence.network.routeControlFailures)evidence.networkFailure='ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST';
    if(error?.financePdfDiagnostic)evidence.failurePdf=error.financePdfDiagnostic;
    if(error?.financeExportPartial)evidence.partialExportProof=error.financeExportPartial;
    evidence.errorSha256=hashBytes(Buffer.from(String(error?.message||error)));evidence.classification=evidence.error.split(':')[0];failure=Error(evidence.error);
  }finally{
    if(browser)await browser.close().catch(()=>{});if(app&&deleteApp)await deleteApp(app).catch(()=>{});
    fs.rmSync(privateDir,{recursive:true,force:true});
    fs.writeFileSync(path.join(destination,'finance-ui-readonly.json'),JSON.stringify(evidence,null,2)+'\n');
    console.log(JSON.stringify({decision:evidence.decision,error:evidence.error||null,independentAdminSessions:evidence.independentAdminSessions,production:false}));
  }
  if(failure)throw failure;return evidence;
}
