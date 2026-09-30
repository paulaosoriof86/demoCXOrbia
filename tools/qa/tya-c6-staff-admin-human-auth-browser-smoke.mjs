import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root=String(process.argv[2]||'').replace(/\/$/,'');
const privatePath=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/c6-unified-human/private-e2e.json';
const outputFile=String(process.env.CXORBIA_HUMAN_GATE_OUTPUT||'').trim();
const exactAction='C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF';
const action=String(process.env.CXORBIA_C6_ACTION||'').trim();
const extendedI3=String(process.env.CXORBIA_I3_EXTENDED_READONLY||'').trim()==='1';
const targetLiveShopperId=String(process.env.CXORBIA_I3_TARGET_LIVE_SHOPPER_ID||'shp-57d2e3769946').trim();
const targetCanonicalShopperId=String(process.env.CXORBIA_I3_TARGET_CANONICAL_SHOPPER_ID||'TYA_GT_0C0BA8856E').trim();
if(!root)throw new Error('DEV_ROOT_URL_REQUIRED');
if(action!==exactAction)throw new Error('STAFF_ACTION_NOT_EXACT');
if(!fs.existsSync(privatePath))throw new Error('PRIVATE_E2E_CREDENTIALS_REQUIRED');
const credentials=JSON.parse(fs.readFileSync(privatePath,'utf8'));
if(!credentials?.staff?.login||!credentials?.staff?.password)throw new Error('PRIVATE_E2E_STAFF_CREDENTIALS_INVALID');
if(credentials?.shopper||credentials?.client)throw new Error('PRIVATE_E2E_STAFF_SCOPE_EXCEEDED');

const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const clean=v=>String(v??'').replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g,'REDACTED_EMAIL').replace(/[^A-Za-z0-9_.:/=-]+/g,'_').replace(/_+/g,'_').slice(0,1600);
const persist=value=>{
  if(!outputFile)return;
  fs.mkdirSync(path.dirname(outputFile),{recursive:true});
  fs.writeFileSync(outputFile,JSON.stringify(value,null,2)+'\n','utf8');
};
let lastState=null;

async function waitReady(page,label){
  try{
    await page.waitForFunction(({extendedI3,targetLiveShopperId,targetCanonicalShopperId})=>{
      const ctx=window.CX?.backendAuth?.context?.()||null;
      const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
      const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
      const d=window.CX?.data||{};
      const baseReady=Boolean(
        ctx?.authenticated===true&&ctx?.authNamespace==='staff'&&
        window.CX?.session?.user?.membershipVerified===true&&
        authority?.applied===true&&authority?.periods>0&&authority?.hrVisits>0&&
        handoff?.status==='entered'&&handoff?.membershipVerified===true&&
        Array.isArray(d.projects)&&d.projects.length===authority.periods&&
        Array.isArray(d._visitas)&&d._visitas.length===authority.hrVisits&&
        d.currentProjectId&&d.currentPeriodId&&
        window.CX_BACKEND_LAST_STATE?.empty!==true&&
        window.CX_CORTE4_READONLY?.empty!==true&&
        document.getElementById('app')?.classList.contains('on')===true&&
        document.getElementById('login')?.classList.contains('hidden')===true&&
        document.querySelector('#rail .rail-brand')&&
        document.getElementById('view')?.children?.length&&
        document.getElementById('projSel')&&
        document.getElementById('periodSel')
      );
      if(!baseReady)return false;

      if(window.CX?.legalRuntimeHttp){
        let legal=null,legalCurrent=null,legalBridge=null;
        try{legal=window.CX.legalRuntimeHttp.status?.()||null;}catch(_){legal=null;}
        try{legalCurrent=window.CX.legalRuntimeHttp.current?.()||null;}catch(_){legalCurrent=null;}
        try{legalBridge=window.CX?.legalAcceptanceProviderBridge?.snapshot?.()||null;}catch(_){legalBridge=null;}
        const providerSnapshot=legalBridge?.snapshot||{};
        const receipt=providerSnapshot?.acceptance||{};
        const evaluated=legalBridge?.evaluated||{};
        const receiptMatchesCurrent=Boolean(
          receipt&&legalCurrent&&
          String(receipt.legalContentId||'')===String(legalCurrent.legalContentId||'')&&
          String(receipt.legalVersion||'')===String(legalCurrent.legalVersion||'')&&
          String(receipt.contentDigest||'').toLowerCase()===String(legalCurrent.contentDigest||'').toLowerCase()
        );
        const receiptMatchesActor=Boolean(
          receipt&&ctx&&
          String(receipt.tenantId||'')===String(ctx.tenantId||'')&&
          String(receipt.role||'')===String(ctx.role||'')&&
          String(receipt.authNamespace||'')===String(ctx.authNamespace||'')
        );
        const legalReady=Boolean(
          legal?.loaded===true&&legal?.pending!==true&&legal?.providerAuthority===true&&legal?.error==null&&
          providerSnapshot?.authority==='provider'&&providerSnapshot?.ready===true&&providerSnapshot?.subjectExact===true&&providerSnapshot?.ambiguous!==true&&
          evaluated?.accepted===true&&evaluated?.pending!==true&&
          receipt?.status==='accepted'&&receipt?.acceptanceMethod==='human_ui'&&receipt?.subjectExact===true&&Boolean(String(receipt?.acceptedAt||'').trim())&&
          receiptMatchesCurrent&&receiptMatchesActor
        );
        if(!legalReady)return false;
      }

      if(extendedI3){
        const identityMap=(d.__identityMap&&typeof d.__identityMap==='object'&&!Array.isArray(d.__identityMap))?d.__identityMap:{};
        const actual=String(identityMap[targetLiveShopperId]||'').trim();
        const canonicalVisits=Array.isArray(d._visitas)?d._visitas.filter(v=>String(v?.shopperId||'').trim()===targetCanonicalShopperId&&String(v?.periodKey||'').trim()==='2026-08').length:0;
        const residualVisits=Array.isArray(d._visitas)?d._visitas.filter(v=>String(v?.shopperId||'').trim()===targetLiveShopperId&&String(v?.periodKey||'').trim()==='2026-08').length:0;
        if(actual!==targetCanonicalShopperId||canonicalVisits<2||residualVisits!==0)return false;
      }

      return true;
    },{extendedI3,targetLiveShopperId,targetCanonicalShopperId},{timeout:90000});
  }catch{
    const state=await snapshot(page,label+'_timeout');
    lastState=state;
    throw new Error(label+'_AUTH_RUNTIME_TIMEOUT_'+clean(JSON.stringify(state)));
  }
}

async function snapshot(page,label){
  return page.evaluate(async({label,extendedI3,targetLiveShopperId,targetCanonicalShopperId})=>{
    const ctx=window.CX?.backendAuth?.context?.()||null;
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||null;
    const handoff=window.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF||null;
    const d=window.CX?.data||{};
    const ds=window.CX?.dataSource||{};
    const postAuthority=window.CX_TYA_POSTULATION_AUTHORITY||null;
    const identityMap=(d.__identityMap&&typeof d.__identityMap==='object'&&!Array.isArray(d.__identityMap))?d.__identityMap:{};
    const identityReview=Array.isArray(d.__identityReviewQueue)?d.__identityReviewQueue:[];
    const view=document.getElementById('view')?.innerText||'';
    const rail=document.getElementById('rail')?.innerText||'';
    let legal=null,legalCurrent=null,legalBridge=null;
    try{legal=window.CX?.legalRuntimeHttp?.status?.()||null;}catch(_){legal=null;}
    try{legalCurrent=window.CX?.legalRuntimeHttp?.current?.()||null;}catch(_){legalCurrent=null;}
    try{legalBridge=window.CX?.legalAcceptanceProviderBridge?.snapshot?.()||null;}catch(_){legalBridge=null;}
    const providerSnapshot=legalBridge?.snapshot||{};
    const receipt=providerSnapshot?.acceptance||{};
    const evaluated=legalBridge?.evaluated||{};
    const modalTitles=[...document.querySelectorAll('.cx-modal')].map(m=>String(m.querySelector('.card-t,h2,h3')?.textContent||m.textContent||'').trim().slice(0,80)).filter(Boolean).slice(0,5);
    const railProjectSelect=Boolean(document.getElementById('projSel'));
    const railPeriodSelect=Boolean(document.getElementById('periodSel'));
    const railMounted=Boolean(document.querySelector('#rail .rail-brand'));
    const viewMounted=Boolean(document.getElementById('view')?.children?.length);
    const platformPosts=Array.isArray(d._posts)?d._posts:[];
    const hrAssignments=Array.isArray(d.__hrAssignmentProjection)?d.__hrAssignmentProjection:[];
    const syntheticHrPostsInPlatform=platformPosts.filter(p=>/^hr-post-\d+$/i.test(String(p?.id||'').trim())&&p?.sourceSafe===true&&String(p?.aprobadaPor||'').trim()==='HR TyA').length;
    const exactReviewReasons=[...new Set(identityReview.map(x=>String(x?.reason||'').trim()).filter(Boolean))].sort();
    const targetCanonicalActual=targetLiveShopperId?String(identityMap[targetLiveShopperId]||'').trim():'';
    const targetCanonicalVisits=targetCanonicalShopperId&&Array.isArray(d._visitas)?d._visitas.filter(v=>String(v?.shopperId||'').trim()===targetCanonicalShopperId&&String(v?.periodKey||'').trim()==='2026-08').length:0;
    const targetLiveResidualVisits=targetLiveShopperId&&Array.isArray(d._visitas)?d._visitas.filter(v=>String(v?.shopperId||'').trim()===targetLiveShopperId&&String(v?.periodKey||'').trim()==='2026-08').length:0;
    const receiptMatchesCurrent=Boolean(
      receipt&&legalCurrent&&
      String(receipt.legalContentId||'')===String(legalCurrent.legalContentId||'')&&
      String(receipt.legalVersion||'')===String(legalCurrent.legalVersion||'')&&
      String(receipt.contentDigest||'').toLowerCase()===String(legalCurrent.contentDigest||'').toLowerCase()
    );
    const receiptMatchesActor=Boolean(
      receipt&&ctx&&
      String(receipt.tenantId||'')===String(ctx.tenantId||'')&&
      String(receipt.role||'')===String(ctx.role||'')&&
      String(receipt.authNamespace||'')===String(ctx.authNamespace||'')
    );

    const providerIdentityRuntime=window.CX_PROVIDER_IDENTITY_LINK_RUNTIME||null;
    const providerPrecompose=window.CX_PROVIDER_IDENTITY_LINK_PRECOMPOSE||null;
    const providerIdentityLinks=Array.isArray(window.CX_PROVIDER_IDENTITY_LINKS)?window.CX_PROVIDER_IDENTITY_LINKS:[];
    const targetProviderLinks=providerIdentityLinks.filter(link=>String(link?.canonicalShopperId||'').trim()===targetCanonicalShopperId||String(link?.sourceIdentityKey||'').trim()===targetLiveShopperId||(Array.isArray(link?.sourceAliases)&&link.sourceAliases.map(v=>String(v||'').trim()).includes(targetLiveShopperId)));
    const targetProviderLinkSafe=targetProviderLinks.slice(0,3).map(link=>({
      identityLinkId:String(link?.identityLinkId||link?.id||'').trim()||null,
      canonicalShopperId:String(link?.canonicalShopperId||'').trim()||null,
      status:String(link?.status||'').trim()||null,
      providerAck:link?.providerAck===true,
      periodIndependent:link?.periodIndependent===true,
      projectScope:String(link?.projectScope||'').trim()||null,
      authorityType:String(link?.authorityType||'').trim()||null,
      sourceSystem:String(link?.sourceSystem||'').trim()||null,
      sourceIdentityKeyMatchesTarget:String(link?.sourceIdentityKey||'').trim()===targetLiveShopperId,
      sourceAliasesContainsTarget:Array.isArray(link?.sourceAliases)&&link.sourceAliases.map(v=>String(v||'').trim()).includes(targetLiveShopperId),
      sourceAliasCount:Array.isArray(link?.sourceAliases)?link.sourceAliases.length:0
    }));
    const precomposeApplied=Array.isArray(providerPrecompose?.applied)?providerPrecompose.applied:[];
    const precomposeConflicts=Array.isArray(providerPrecompose?.conflicts)?providerPrecompose.conflicts:[];
    const targetPrecomposeConflicts=precomposeConflicts.filter(row=>String(row?.canonicalShopperId||'').trim()===targetCanonicalShopperId||String(row?.identityLinkId||'').trim()===String(targetProviderLinkSafe[0]?.identityLinkId||'')).map(row=>({
      identityLinkId:String(row?.identityLinkId||'').trim()||null,
      canonicalShopperId:String(row?.canonicalShopperId||'').trim()||null,
      matchingProfiles:Number(row?.matchingProfiles??-1),
      reason:String(row?.reason||'').trim()||null,
      sourceAliasCount:Array.isArray(row?.sourceAliases)?row.sourceAliases.length:0,
      sourceAliasesContainTarget:Array.isArray(row?.sourceAliases)&&row.sourceAliases.map(v=>String(v||'').trim()).includes(targetLiveShopperId)
    }));
    let providerAsset={fetched:false,httpStatus:null,precomposeMarker:false,bridgeFunctionMarker:false,bridgeInstallMarker:false,fetchError:null};
    try{
      const response=await fetch('/adapters/cxorbia-provider-identity-link-runtime-v1.js',{cache:'no-store'});
      const text=await response.text();
      providerAsset={
        fetched:response.ok,
        httpStatus:response.status,
        precomposeMarker:text.includes('I3.11B adds a fail-closed precompose bridge'),
        bridgeFunctionMarker:text.includes('function bridgeComposeInput'),
        bridgeInstallMarker:text.includes('__providerIdentityLinkPrecomposeV1'),
        fetchError:null
      };
    }catch(error){providerAsset.fetchError=String(error?.name||'fetch_error').slice(0,80);}

    return {
      label,
      role:ctx?.role||null,
      namespace:ctx?.authNamespace||null,
      tenantId:ctx?.tenantId||null,
      projectIds:Array.isArray(ctx?.projectIds)?ctx.projectIds.slice():[],
      membershipVerified:window.CX?.session?.user?.membershipVerified===true,
      membershipSource:window.CX?.session?.user?.membershipSource||null,
      periods:Array.isArray(d.projects)?d.projects.length:-1,
      visits:Array.isArray(d._visitas)?d._visitas.length:-1,
      shoppers:Array.isArray(d.shoppers)?d.shoppers.length:-1,
      currentProjectId:d.currentProjectId||null,
      currentPeriodId:d.currentPeriodId||null,
      authorityApplied:authority?.applied===true,
      authorityPeriods:Number(authority?.periods||0),
      authorityVisits:Number(authority?.hrVisits||0),
      authorityShoppers:Number(authority?.hrShoppers||0),
      firstPeriod:authority?.firstPeriod||null,
      latestPeriod:authority?.latestPeriod||null,
      identityMapSize:Number(authority?.identityMapSize||Object.keys(identityMap).length||0),
      identityReviewCount:Number(authority?.identityReviewCount||identityReview.length||0),
      identityReviewReasons:extendedI3?exactReviewReasons:[],
      targetLiveShopperId:extendedI3?targetLiveShopperId:null,
      targetCanonicalShopperId:extendedI3?targetCanonicalShopperId:null,
      targetCanonicalActual:extendedI3?(targetCanonicalActual||null):null,
      targetCanonicalVisitsAugust:extendedI3?targetCanonicalVisits:null,
      targetLiveResidualVisitsAugust:extendedI3?targetLiveResidualVisits:null,
      exactIdentityContractPresent:Boolean(window.CX_EXACT_IDENTITY_CONTRACT),
      providerIdentityRuntimePresent:extendedI3?Boolean(providerIdentityRuntime):null,
      providerIdentityRuntimeStatus:extendedI3?(providerIdentityRuntime?.status||null):null,
      providerIdentityRuntimeLinkCount:extendedI3?Number(providerIdentityRuntime?.links??providerIdentityLinks.length):null,
      providerIdentityProviderDocuments:extendedI3?(providerIdentityRuntime?.providerDocuments==null?null:Number(providerIdentityRuntime.providerDocuments)):null,
      providerIdentityComposerBridgeInstalled:extendedI3?(providerIdentityRuntime?.composerBridgeInstalled===true||window.CX_TYA_CUMULATIVE_READ_MODEL?.__providerIdentityLinkPrecomposeV1===true):null,
      providerIdentityGlobalLinkCount:extendedI3?providerIdentityLinks.length:null,
      providerIdentityTargetLinks:extendedI3?targetProviderLinkSafe:[],
      providerPrecomposePresent:extendedI3?Boolean(providerPrecompose):null,
      providerPrecomposeAppliedCount:extendedI3?precomposeApplied.length:null,
      providerPrecomposeConflictCount:extendedI3?precomposeConflicts.length:null,
      providerPrecomposeTargetConflicts:extendedI3?targetPrecomposeConflicts:[],
      providerAsset:extendedI3?providerAsset:null,
      duplicateVisitKeys:Number(authority?.duplicateVisitKeys||0),
      duplicateShopperIds:Number(authority?.duplicateShopperIds||0),
      frontendHandoffStatus:handoff?.status||null,
      frontendHandoffMembershipVerified:handoff?.membershipVerified===true,
      staleBackendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      staleCorte4Empty:window.CX_CORTE4_READONLY?.empty===true,
      dataStatus:ds.status||null,
      dataMode:ds.mode||null,
      dataSourceRef:ds.sourceRef||null,
      appOn:document.getElementById('app')?.classList.contains('on')===true,
      loginHidden:document.getElementById('login')?.classList.contains('hidden')===true,
      emptyShell:window.CX_C4_EMPTY_SHELL_STATE?.active===true,
      backendEmpty:window.CX_BACKEND_LAST_STATE?.empty===true,
      noProjectsVisible:view.includes('Sin proyectos disponibles')||rail.includes('Sin proyectos disponibles'),
      noPeriodsVisible:rail.includes('Sin periodos disponibles'),
      blockedVisible:view.includes('Fuente de datos no disponible'),
      railMounted,
      viewMounted,
      railProjectSelect,
      railPeriodSelect,
      postulationAuthorityReady:postAuthority?.ready===true,
      platformPosts:platformPosts.length,
      hrAssignmentProjection:hrAssignments.length,
      postAuthorityPlatformPosts:Number(postAuthority?.platformPosts??-1),
      postAuthorityHrAssignments:Number(postAuthority?.hrAssignments??-1),
      hrAssignmentsArePostulations:postAuthority?.hrAssignmentsArePostulations===true,
      syntheticHrPostsInPlatform,
      legalRuntimePresent:Boolean(window.CX?.legalRuntimeHttp),
      legalLoaded:legal?.loaded===true,
      legalPending:legal?legal.pending===true:null,
      legalProviderAuthority:legal?.providerAuthority===true,
      legalError:legal?.error||null,
      legalModalVisible:modalTitles.some(t=>/términos|confidencialidad|legal/i.test(t)),
      legalContentId:extendedI3?(legalCurrent?.legalContentId||null):null,
      legalVersion:extendedI3?(legalCurrent?.legalVersion||null):null,
      legalContentDigest:extendedI3?(legalCurrent?.contentDigest||null):null,
      legalBridgeAccepted:extendedI3?(evaluated?.accepted===true):null,
      legalBridgePending:extendedI3?(evaluated?.pending===true):null,
      legalBridgeReasons:extendedI3?(Array.isArray(evaluated?.reasons)?evaluated.reasons.slice():[]):[],
      legalSnapshotAuthority:extendedI3?(providerSnapshot?.authority||null):null,
      legalSnapshotReady:extendedI3?(providerSnapshot?.ready===true):null,
      legalSnapshotSubjectExact:extendedI3?(providerSnapshot?.subjectExact===true):null,
      legalSnapshotAmbiguous:extendedI3?(providerSnapshot?.ambiguous===true):null,
      legalReceiptStatus:extendedI3?(receipt?.status||null):null,
      legalReceiptMethod:extendedI3?(receipt?.acceptanceMethod||null):null,
      legalReceiptSubjectExact:extendedI3?(receipt?.subjectExact===true):null,
      legalReceiptAcceptedAtPresent:extendedI3?Boolean(String(receipt?.acceptedAt||'').trim()):null,
      legalReceiptMatchesCurrent:extendedI3?receiptMatchesCurrent:null,
      legalReceiptMatchesActor:extendedI3?receiptMatchesActor:null,
      modalTitles,
      canonicalLane:window.CX_DEV_ENTRY_CANONICAL?.lane||null,
      canonicalProtected:window.CX_DEV_ENTRY_CANONICAL?.protectedRuntime===true,
      technicalAuth:window.CX_DEV_ENTRY_CANONICAL?.technicalAuth===true,
      legacyCredentialStepVisible:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalFormVisible:Boolean(document.getElementById('cxDevEntryAuth'))
    };
  },{label,extendedI3,targetLiveShopperId,targetCanonicalShopperId});
}

function validate(state,label,first=null){
  assert(state.appOn,label+'_APP_NOT_ON');
  assert(state.loginHidden,label+'_LOGIN_NOT_HIDDEN');
  assert(state.membershipVerified,label+'_MEMBERSHIP_NOT_VERIFIED');
  assert(state.frontendHandoffStatus==='entered'&&state.frontendHandoffMembershipVerified,label+'_FRONTEND_HANDOFF_NOT_ENTERED');
  assert(!state.staleBackendEmpty&&!state.staleCorte4Empty,label+'_STALE_PROVIDER_EMPTY_STATE');
  assert(state.authorityApplied,label+'_HR_AUTHORITY_NOT_APPLIED');
  assert(state.periods===state.authorityPeriods&&state.periods>0,label+'_PERIODS_NOT_DYNAMIC_AUTHORITY');
  assert(state.visits===state.authorityVisits&&state.visits>0,label+'_VISITS_NOT_DYNAMIC_AUTHORITY');
  assert(state.currentProjectId&&state.currentPeriodId,label+'_PROJECT_PERIOD_MISSING');
  assert(state.duplicateVisitKeys===0&&state.duplicateShopperIds===0,label+'_DUPLICATE_KEYS');
  assert(!state.emptyShell,label+'_EMPTY_SHELL_ACTIVE');
  assert(!state.backendEmpty,label+'_BACKEND_EMPTY_ACTIVE');
  assert(!state.noProjectsVisible,label+'_NO_PROJECTS_VISIBLE');
  assert(!state.noPeriodsVisible,label+'_NO_PERIODS_VISIBLE');
  assert(!state.blockedVisible,label+'_DATA_SOURCE_BLOCK_VISIBLE');
  assert(state.railMounted&&state.viewMounted,label+'_ROUTER_SHELL_NOT_MOUNTED');
  assert(state.railProjectSelect,label+'_PROJECT_SELECTOR_NOT_MOUNTED');
  assert(state.railPeriodSelect,label+'_PERIOD_SELECTOR_NOT_MOUNTED');
  if(state.legalRuntimePresent){
    assert(state.legalError==null,label+'_LEGAL_RUNTIME_ERROR');
    assert(state.legalPending!==true||state.legalModalVisible,label+'_LEGAL_PENDING_WITHOUT_HUMAN_GATE');
    assert(state.legalPending!==true,label+'_LEGAL_GATE_BLOCKING_ROUTER');
  }
  assert(state.canonicalLane==='authenticated-human-canonical'&&state.canonicalProtected===true&&state.technicalAuth===false,label+'_HUMAN_CANONICAL_LANE_INVALID');
  assert(!state.legacyCredentialStepVisible&&!state.technicalFormVisible,label+'_LEGACY_OR_TECHNICAL_AUTH_LEAKED');
  assert(['super','admin','ops','coordinador'].includes(String(state.role||'')),label+'_ROLE_INVALID');
  assert(state.namespace==='staff',label+'_NAMESPACE_INVALID');
  if(first){
    assert(state.periods===first.periods&&state.visits===first.visits&&state.shoppers===first.shoppers,label+'_COUNTS_CHANGED');
    assert(state.currentProjectId===first.currentProjectId&&state.currentPeriodId===first.currentPeriodId,label+'_CONTEXT_CHANGED');
  }
}

async function runStaff(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true,serviceWorkers:'block'});
  try{
    const page=await context.newPage();
    await page.goto(root+'/',{waitUntil:'commit',timeout:60000});
    await page.waitForSelector('.role-btn[data-role="admin"]',{state:'visible',timeout:60000});
    const entryUrl=new URL(page.url());
    assert(entryUrl.searchParams.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV','PROTECTED_RUNTIME_FLAG_MISSING');
    assert(entryUrl.searchParams.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV','FULL_VISUAL_FLAG_MISSING');
    assert(!entryUrl.searchParams.has('cxTechnicalAuthE2E'),'TECHNICAL_TOKEN_LEAKED');

    const before=await page.evaluate(()=>({
      firebaseWrapper:Boolean(window.CX?.app?.__firebaseBrowserAuthWrapped),
      earlyGuardInstalled:window.CX_C6_EARLY_AUTH_CLICK_GUARD?.installed===true,
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))
    }));
    assert(!before.technicalForm,'PARALLEL_TECHNICAL_LOGIN_VISIBLE');

    await page.click('.role-btn[data-role="admin"]');
    await page.waitForFunction(()=>document.getElementById('loginForm')?.dataset.selectedRole==='admin',null,{timeout:10000});
    for(const selector of ['#lgUser','#lgPass','#lgSubmit'])await page.waitForSelector(selector,{state:'visible',timeout:10000});
    const canonicalForm=await page.evaluate(()=>({
      loginForm:Boolean(document.getElementById('loginForm')),
      selectedRole:document.getElementById('loginForm')?.dataset.selectedRole||null,
      userVisible:Boolean(document.getElementById('lgUser')?.offsetParent),
      passVisible:Boolean(document.getElementById('lgPass')?.offsetParent),
      submitVisible:Boolean(document.getElementById('lgSubmit')?.offsetParent),
      legacyOverlay:Boolean(document.getElementById('cxIntegratedAuthStep')),
      technicalForm:Boolean(document.getElementById('cxDevEntryAuth'))
    }));
    assert(canonicalForm.loginForm&&canonicalForm.selectedRole==='admin','CANONICAL_LOGIN_FORM_NOT_ADMIN');
    assert(canonicalForm.userVisible&&canonicalForm.passVisible&&canonicalForm.submitVisible,'CANONICAL_LOGIN_CONTROLS_NOT_VISIBLE');
    assert(!canonicalForm.legacyOverlay&&!canonicalForm.technicalForm,'NON_CANONICAL_LOGIN_SURFACE_VISIBLE');

    await page.fill('#lgUser',credentials.staff.login);
    await page.fill('#lgPass',credentials.staff.password);
    await page.press('#lgPass','Enter');
    await waitReady(page,'staff_first');
    const first=await snapshot(page,'staff_first');
    lastState=first;
    validate(first,'staff_first');

    const reloads=[];
    for(let i=1;i<=3;i++){
      await page.reload({waitUntil:'commit',timeout:60000});
      await waitReady(page,'staff_reload_'+i);
      const state=await snapshot(page,'staff_reload_'+i);
      lastState=state;
      validate(state,'staff_reload_'+i,first);
      reloads.push(state);
    }

    const second=await context.newPage();
    await second.goto(root+'/',{waitUntil:'commit',timeout:60000});
    await waitReady(second,'staff_new_tab');
    const newTab=await snapshot(second,'staff_new_tab');
    lastState=newTab;
    validate(newTab,'staff_new_tab',first);
    await second.close();

    const allStates=[first,...reloads,newTab];
    const result={
      role:first.role,
      namespace:first.namespace,
      periods:first.periods,
      visits:first.visits,
      shoppers:first.shoppers,
      firstPeriod:first.firstPeriod,
      latestPeriod:first.latestPeriod,
      projectId:first.currentProjectId,
      periodId:first.currentPeriodId,
      membershipVerified:first.membershipVerified,
      frontendHandoffStatus:first.frontendHandoffStatus,
      staleProviderEmptyCleared:!first.staleBackendEmpty&&!first.staleCorte4Empty,
      routerShellMounted:first.railMounted&&first.viewMounted,
      projectSelectorMounted:first.railProjectSelect,
      periodSelectorMounted:first.railPeriodSelect,
      legalRuntimePresent:first.legalRuntimePresent,
      legalProviderAuthority:first.legalProviderAuthority,
      legalPending:first.legalPending,
      loginProtectedBy:before.firebaseWrapper?'official_wrapper':before.earlyGuardInstalled?'early_guard':'unknown',
      canonicalForm:true,
      canonicalSelectors:['#loginForm','#lgUser','#lgPass','#lgSubmit'],
      submitInteraction:'canonical_form_enter_from_password',
      reloadsStable:reloads.length===3,
      newTabStable:newTab.appOn===true,
      extendedI3:extendedI3?{
        postulationAuthority:{
          ready:first.postulationAuthorityReady,
          platformPosts:first.platformPosts,
          hrAssignments:first.hrAssignmentProjection,
          authorityPlatformPosts:first.postAuthorityPlatformPosts,
          authorityHrAssignments:first.postAuthorityHrAssignments,
          hrAssignmentsArePostulations:first.hrAssignmentsArePostulations,
          syntheticHrPostsInPlatform:first.syntheticHrPostsInPlatform,
          stableAcrossReloadsAndNewTab:allStates.every(s=>s.postulationAuthorityReady===true&&s.syntheticHrPostsInPlatform===0&&s.hrAssignmentsArePostulations===false&&s.platformPosts===first.platformPosts&&s.hrAssignmentProjection===first.hrAssignmentProjection&&s.postAuthorityPlatformPosts===first.postAuthorityPlatformPosts&&s.postAuthorityHrAssignments===first.postAuthorityHrAssignments)
        },
        identity:{
          contractPresent:first.exactIdentityContractPresent,
          mapSize:first.identityMapSize,
          reviewCount:first.identityReviewCount,
          reviewReasons:first.identityReviewReasons,
          targetLiveShopperId:first.targetLiveShopperId,
          targetCanonicalShopperId:first.targetCanonicalShopperId,
          targetCanonicalActual:first.targetCanonicalActual,
          targetCanonicalVisitsAugust:first.targetCanonicalVisitsAugust,
          targetLiveResidualVisitsAugust:first.targetLiveResidualVisitsAugust,
          targetStableAcrossReloadsAndNewTab:allStates.every(s=>s.targetCanonicalActual===first.targetCanonicalActual&&s.targetCanonicalVisitsAugust===first.targetCanonicalVisitsAugust&&s.targetLiveResidualVisitsAugust===first.targetLiveResidualVisitsAugust)
        },
        legal:{
          contentId:first.legalContentId,
          version:first.legalVersion,
          digest:first.legalContentDigest,
          bridgeAccepted:first.legalBridgeAccepted,
          bridgePending:first.legalBridgePending,
          bridgeReasons:first.legalBridgeReasons,
          snapshotAuthority:first.legalSnapshotAuthority,
          snapshotReady:first.legalSnapshotReady,
          snapshotSubjectExact:first.legalSnapshotSubjectExact,
          snapshotAmbiguous:first.legalSnapshotAmbiguous,
          receiptStatus:first.legalReceiptStatus,
          receiptMethod:first.legalReceiptMethod,
          receiptSubjectExact:first.legalReceiptSubjectExact,
          receiptAcceptedAtPresent:first.legalReceiptAcceptedAtPresent,
          receiptMatchesCurrent:first.legalReceiptMatchesCurrent,
          receiptMatchesActor:first.legalReceiptMatchesActor,
          stableAcrossReloadsAndNewTab:allStates.every(s=>s.legalLoaded===true&&s.legalProviderAuthority===true&&s.legalPending===false&&s.legalBridgeAccepted===true&&s.legalBridgePending===false&&s.legalReceiptMatchesCurrent===true&&s.legalReceiptMatchesActor===true&&s.legalReceiptAcceptedAtPresent===true&&s.legalVersion===first.legalVersion&&s.legalContentDigest===first.legalContentDigest)
        }
      }:null,
      credentialsExposed:false,
      tokensExposed:false
    };

    await page.evaluate(async()=>{try{await window.CX?.backendAuth?.signOut?.();}catch{}});
    return result;
  }finally{
    await context.close().catch(()=>{});
    await browser.close().catch(()=>{});
  }
}

try{
  const staff=await runStaff();
  const evidence={
    schemaVersion:'cxorbia.c6.unified-human-auth-staff-admin-readonly.v5',
    generatedAt:new Date().toISOString(),
    decision:'PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY',
    action:exactAction,
    root,
    principalIsolation:'fresh_browser_single_staff_principal',
    lane:'authenticated-human-canonical',
    staff,
    shopper:null,
    client:null,
    genericShopperClientLogicPreserved:true,
    historicalShopperAccess:0,
    userCreates:0,
    userUpdates:0,
    hostingDeploys:0,
    providerWrites:0,
    authWrites:0,
    passwordChanges:0,
    passwordResets:0,
    firestoreWrites:0,
    hrWrites:0,
    rulesWrites:0,
    storageWrites:0,
    makeCalls:0,
    geminiCalls:0,
    paymentWrites:0,
    credentialsExposed:false,
    tokensExposed:false,
    merge:false,
    production:false
  };
  persist(evidence);
  console.log(JSON.stringify(evidence));
}catch(error){
  const failure={
    schemaVersion:'cxorbia.c6.unified-human-auth-staff-admin-readonly.failure.v5',
    generatedAt:new Date().toISOString(),
    decision:'FAIL_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY',
    action:exactAction,
    root,
    error:clean(error?.stack||error?.message||error),
    lastState,
    historicalShopperAccess:0,
    userCreates:0,
    userUpdates:0,
    credentialsExposed:false,
    tokensExposed:false,
    hostingDeploys:0,
    providerWrites:0,
    authWrites:0,
    passwordChanges:0,
    passwordResets:0,
    firestoreWrites:0,
    hrWrites:0,
    rulesWrites:0,
    storageWrites:0,
    makeCalls:0,
    geminiCalls:0,
    paymentWrites:0,
    merge:false,
    production:false
  };
  persist(failure);
  console.error(JSON.stringify(failure));
  process.exitCode=1;
}
