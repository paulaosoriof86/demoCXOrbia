/* CXOrbia TyA — Corte 6 protected Auth + live HR authority bridge v2.
   Dynamic source contract:
   - Firebase Auth/claims define the principal and protected scope.
   - Every period and visit detected in the current HR revision is preserved.
   - No historical count is hardcoded as a runtime invariant.
   - Firestore enriches exact identity/profile/certification/finance only.
   - Composition never appends protected visits or deduplicates by name.
   - Restored authenticated sessions in reloads/new tabs reconcile automatically.
   - Transient live-HR failures retry with a bounded fail-closed policy.
   - Read-only DEV; no provider writes, deploy, merge or production.
*/
window.CX=window.CX||{};
(function(){
  'use strict';
  const params=new URLSearchParams(location.search||'');
  const TOKEN='YES_PAULA_20260730_PROTECTED_DEV';
  if(params.get('cxProtectedRuntime')!==TOKEN)return;

  const endpoint=window.CX_TYA_LIVE_SOURCE_URL||'/api/tya/cinepolis/hr-live';
  const arr=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const str=v=>String(v==null?'':v).trim();
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let reconciling=false;
  let lastProtectedState=null;
  let bootTimer=null;
  let bootAttempt=0;
  let bootReason='initial';
  const BOOT_MAX_ATTEMPTS=180;
  const HR_MAX_ATTEMPTS=6;

  function context(){
    try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}
  }
  function authorized(ctx){
    return !!(ctx&&ctx.authenticated===true&&ctx.tenantId==='tya'&&arr(ctx.projectIds).includes('cinepolis'));
  }
  function protectedBackendReady(){
    const source=str(window.CX_BACKEND_LAST_STATE?.source||window.CX_BACKEND_DATA_SOURCE).toLowerCase();
    const ref=str(CX.dataSource?.sourceRef).toLowerCase();
    return source==='firestore'||source.startsWith('firestore/')||ref.includes('firestore');
  }
  function runtimeDependenciesReady(){
    return !!(
      CX.data&&
      typeof window.CX_TYA_APPLY_LIVE_SNAPSHOT==='function'&&
      window.CX_TYA_CUMULATIVE_READ_MODEL&&
      typeof window.CX_TYA_CUMULATIVE_READ_MODEL.compose==='function'
    );
  }
  function captureProtectedState(){
    const ctx=context();
    if(!authorized(ctx)||!CX.data)return null;
    return {
      role:str(ctx.role),authNamespace:str(ctx.authNamespace),shopperId:str(ctx.shopperId),
      projects:clone(CX.data.projects||[]),visits:clone(CX.data._visitas||[]),
      shoppers:clone(CX.data.shoppers||[]),posts:clone(CX.data._posts||[]),
      certifications:clone(CX.data.__protectedCertifications||[]),
      liquidations:clone(CX.data.__protectedLiquidations||[]),
      capturedAt:new Date().toISOString()
    };
  }
  function queryUrl(){
    const sep=endpoint.includes('?')?'&':'?';
    return endpoint+sep+new URLSearchParams({format:'json',fresh:'1',ts:String(Date.now())}).toString();
  }
  function visitKey(v){
    const coord=str(v?.sourceTab)&&str(v?.sourceRow)?`${str(v.sourceTab)}::${str(v.sourceRow)}`:'';
    return str(v?.hrRowId)||coord||str(v?.visitId||v?.id);
  }
  function validateSnapshot(snapshot){
    if(!snapshot||snapshot.sourceSafe!==true)throw new Error('HR_LIVE_SOURCE_SAFE_REQUIRED');
    const periods=arr(snapshot.periods),visits=arr(snapshot.visits),shoppers=arr(snapshot.shoppers);
    if(!periods.length||!visits.length)throw new Error('HR_LIVE_NONEMPTY_REQUIRED');
    const periodKeys=periods.map(p=>str(p.key||p.periodKey)).filter(Boolean);
    if(new Set(periodKeys).size!==periodKeys.length)throw new Error('HR_LIVE_DUPLICATE_PERIOD_KEYS');
    const keys=visits.map(visitKey).filter(Boolean);
    if(keys.length!==visits.length||new Set(keys).size!==keys.length)throw new Error('HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS');
    const visitPeriods=new Set(visits.map(v=>str(v.periodKey)).filter(Boolean));
    const periodSet=new Set(periodKeys);
    for(const key of visitPeriods)if(!periodSet.has(key))throw new Error(`HR_LIVE_VISIT_PERIOD_MISSING_${key}`);
    return {
      periods:periods.length,visits:visits.length,shoppers:shoppers.length,
      firstPeriod:periodKeys.slice().sort()[0]||null,
      latestPeriod:periodKeys.slice().sort().at(-1)||null,
      uniqueVisitKeys:keys.length
    };
  }
  function retryableStatus(status){
    return status===429||status>=500;
  }
  async function fetchHrSnapshot(){
    let lastError=null;
    for(let attempt=1;attempt<=HR_MAX_ATTEMPTS;attempt++){
      try{
        const response=await fetch(queryUrl(),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
        const payload=await response.json().catch(()=>null);
        if(!response.ok){
          const error=new Error(`HR_LIVE_HTTP_${response.status}`);
          error.status=response.status;
          throw error;
        }
        const snapshot=payload&&(payload.snapshot||payload.data||payload);
        const runtime=Object.assign({},payload&&payload._runtime||{},snapshot&&snapshot._runtime||{});
        if(snapshot&&snapshot._runtime)delete snapshot._runtime;
        return {snapshot,runtime,counts:validateSnapshot(snapshot),attempt};
      }catch(error){
        lastError=error;
        const status=Number(error?.status||0);
        const transient=status===0||retryableStatus(status)||/fetch|network|load failed/i.test(str(error?.message));
        if(!transient||attempt===HR_MAX_ATTEMPTS)break;
        await sleep(Math.min(10000,1200*attempt));
      }
    }
    throw lastError||new Error('HR_LIVE_UNAVAILABLE');
  }
  function applyComposition(hrState,protectedState,reason,counts,fetchAttempt){
    const engine=window.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!engine||typeof engine.compose!=='function')throw new Error('CANONICAL_COMPOSER_V2_MISSING');
    const result=engine.compose({
      hr:{
        projects:clone(hrState.projects),visits:clone(hrState.visits),shoppers:clone(hrState.shoppers),
        posts:clone(hrState.posts),periodOperationalSummary:clone(hrState.periodOperationalSummary),
        currentProjectId:hrState.currentProjectId,currentPeriodId:hrState.currentPeriodId,
        sourceRevision:hrState.sourceRevision
      },
      protectedPayload:{
        visits:clone(protectedState.visits),shoppers:clone(protectedState.shoppers),
        posts:clone(protectedState.posts),certifications:clone(protectedState.certifications),
        liquidations:clone(protectedState.liquidations)
      }
    });
    const d=result.diagnostics||{};
    if(d.outputVisits!==hrState.visits.length||d.duplicateVisitKeys!==0||d.duplicateShopperIds!==0||d.protectedVisitsAppended!==0){
      throw new Error('CANONICAL_DYNAMIC_COMPOSITION_INVARIANT_'+JSON.stringify({
        hrVisits:hrState.visits.length,outputVisits:d.outputVisits,
        duplicateVisits:d.duplicateVisitKeys,duplicateShoppers:d.duplicateShopperIds,
        protectedVisitsAppended:d.protectedVisitsAppended
      }));
    }
    if(result.projects.length!==hrState.projects.length)throw new Error('CANONICAL_PERIOD_LOSS');

    CX.data.projects=clone(result.projects);
    CX.data._visitas=clone(result.visits);
    CX.data.shoppers=clone(result.shoppers);
    CX.data._posts=clone(result.posts);
    CX.data.periodOperationalSummary=clone(result.periodOperationalSummary);
    CX.data.currentProjectId=result.currentProjectId||'cinepolis';
    CX.data.currentPeriodId=result.currentPeriodId||hrState.currentPeriodId||'';
    CX.data.__identityMap=clone(result.identityMap||{});
    CX.data.__identityReviewQueue=clone(result.identityReviewQueue||[]);
    CX.data.__protectedCertifications=clone(protectedState.certifications);
    CX.data.__protectedLiquidations=clone(protectedState.liquidations);
    CX.data.sourceMode='tya_hr_live_all_periods_plus_firestore_exact_overlay_dev';
    CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
      tenantId:'tya',projectId:'cinepolis',sourceRevision:hrState.sourceRevision||null,
      protectedPrincipalRole:protectedState.role,protectedAuthNamespace:protectedState.authNamespace,
      hrAuthority:true,allDetectedPeriods:true,protectedOverlay:true,readOnly:true,production:false,
      periods:CX.data.projects.length,visits:CX.data._visitas.length,shoppers:CX.data.shoppers.length,
      firstPeriod:counts.firstPeriod,latestPeriod:counts.latestPeriod,
      uniqueVisitKeys:counts.uniqueVisitKeys,
      note:'La revisión HR viva completa es autoridad. Firestore solo enriquece por llaves técnicas exactas.'
    });
    if(CX.dataSource){
      CX.dataSource.mode='connected';CX.dataSource.status='ready';
      CX.dataSource.sourceRef='hr-live-all-periods+firestore-authenticated-exact-overlay';
      CX.dataSource.updatedAt=new Date().toISOString();CX.dataSource.runtimeReadActive=true;
      CX.dataSource.runtimeSyncActive=false;CX.dataSource.updating=false;CX.dataSource.blockers=[];
      CX.dataSource.warnings=arr(result.identityReviewQueue).length
        ?[`${result.identityReviewQueue.length} identidades permanecen en revisión técnica; no se fusionaron por similitud.`]:[];
    }
    const ctx=context();
    const canonicalShopper=ctx?.shopperId?(result.identityMap||{})[ctx.shopperId]||ctx.shopperId:null;
    const ownVisits=canonicalShopper&&typeof CX.data.visitsForShopper==='function'
      ?CX.data.visitsForShopper(canonicalShopper,false).length:null;
    window.CX_PROTECTED_AUTH_HR_AUTHORITY={
      applied:true,version:'v2-dynamic-live-source-new-tab-recovery',reason:reason||'backend_ready',
      role:protectedState.role,authNamespace:protectedState.authNamespace,
      periods:CX.data.projects.length,hrVisits:CX.data._visitas.length,hrShoppers:counts.shoppers,
      firstPeriod:counts.firstPeriod,latestPeriod:counts.latestPeriod,
      uniqueVisitKeys:counts.uniqueVisitKeys,protectedVisits:protectedState.visits.length,
      protectedProfiles:protectedState.shoppers.length,identityMapSize:Object.keys(result.identityMap||{}).length,
      identityReviewCount:arr(result.identityReviewQueue).length,ownVisits,
      duplicateVisitKeys:d.duplicateVisitKeys,duplicateShopperIds:d.duplicateShopperIds,
      liveHrFetchAttempt:Number(fetchAttempt||1),restoredSessionRecovery:true,
      providerWrites:0,authWrites:0,rulesDeploys:0,production:false,at:new Date().toISOString()
    };
    window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE={
      ready:true,completed:true,attempts:bootAttempt,reason:reason||bootReason,
      authorized:true,protectedBackendReady:true,runtimeDependenciesReady:true,
      providerWrites:0,production:false,at:new Date().toISOString()
    };
    try{window.dispatchEvent(new CustomEvent('cx:protected-auth-hr-authority-ready',{detail:clone(window.CX_PROTECTED_AUTH_HR_AUTHORITY)}));}catch(_){}
    if(CX.bus?.emit)CX.bus.emit('visit-flow',{reason:'protected_auth_hr_authority_dynamic_ready',preserveUiState:true});
    return window.CX_PROTECTED_AUTH_HR_AUTHORITY;
  }
  async function reconcile(reason){
    if(reconciling)return {ok:true,skipped:true,reason:'reconcile_in_progress'};
    const ctx=context();
    if(!authorized(ctx))return {ok:false,skipped:true,reason:'principal_not_ready'};
    if(!protectedBackendReady())return {ok:false,skipped:true,reason:'protected_backend_not_ready'};
    if(!runtimeDependenciesReady())return {ok:false,skipped:true,reason:'runtime_dependencies_not_ready'};
    const protectedState=captureProtectedState()||lastProtectedState||{
      role:str(ctx.role),authNamespace:str(ctx.authNamespace),shopperId:str(ctx.shopperId),
      projects:[],visits:[],shoppers:[],posts:[],certifications:[],liquidations:[],
      capturedAt:new Date().toISOString()
    };
    lastProtectedState=protectedState;
    reconciling=true;
    try{
      const fetched=await fetchHrSnapshot();
      window.CX_TYA_APPLY_LIVE_SNAPSHOT(fetched.snapshot,fetched.runtime,{reason:'protected_auth_hr_restore_dynamic'});
      const hrState={
        projects:clone(CX.data.projects||[]),visits:clone(CX.data._visitas||[]),
        shoppers:clone(CX.data.shoppers||[]),posts:clone(CX.data._posts||[]),
        periodOperationalSummary:clone(CX.data.periodOperationalSummary||[]),
        currentProjectId:CX.data.currentProjectId||'cinepolis',currentPeriodId:CX.data.currentPeriodId||'',
        sourceRevision:CX.data.previewMeta?.sourceRevision||fetched.runtime.revision||null
      };
      return {ok:true,result:applyComposition(hrState,protectedState,reason,fetched.counts,fetched.attempt)};
    }catch(error){
      console.error('[CX.protected-auth-hr-authority-v2]',error);
      if(CX.dataSource){
        CX.dataSource.status='blocked';
        CX.dataSource.blockers=['No fue posible componer la revisión HR viva completa con el principal autenticado.'];
      }
      window.CX_PROTECTED_AUTH_HR_AUTHORITY={
        applied:false,version:'v2-dynamic-live-source-new-tab-recovery',error:str(error?.message||error),
        retryable:/HR_LIVE_HTTP_(429|5\d\d)|fetch|network|load failed/i.test(str(error?.message)),
        providerWrites:0,production:false,at:new Date().toISOString()
      };
      return {ok:false,error:str(error?.message||error)};
    }finally{reconciling=false;}
  }
  function bootDelay(attempt){
    return Math.min(2000,250+attempt*75);
  }
  function scheduleBootReconcile(reason,reset){
    bootReason=reason||bootReason;
    if(reset===true)bootAttempt=0;
    if(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true)return;
    if(bootTimer)return;
    const run=async()=>{
      bootTimer=null;
      if(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true)return;
      bootAttempt++;
      const ctx=context();
      const authReady=authorized(ctx);
      const backendReady=protectedBackendReady();
      const dependenciesReady=runtimeDependenciesReady();
      window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE={
        ready:false,completed:false,attempts:bootAttempt,reason:bootReason,
        authorized:authReady,protectedBackendReady:backendReady,runtimeDependenciesReady:dependenciesReady,
        providerWrites:0,production:false,at:new Date().toISOString()
      };
      if(authReady&&backendReady&&dependenciesReady){
        const state=await reconcile(bootReason||'authenticated_context_restore_dynamic');
        if(state?.ok&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true)return;
      }
      if(bootAttempt<BOOT_MAX_ATTEMPTS){
        bootTimer=setTimeout(run,bootDelay(bootAttempt));
      }else{
        window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE=Object.assign({},window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||{}, {
          ready:false,completed:true,exhausted:true,attempts:bootAttempt,
          lastAuthorityError:str(window.CX_PROTECTED_AUTH_HR_AUTHORITY?.error),
          providerWrites:0,production:false,at:new Date().toISOString()
        });
      }
    };
    bootTimer=setTimeout(run,0);
  }
  function bind(){
    if(CX.bus?.on){
      CX.bus.on('backend-auth-ready',()=>scheduleBootReconcile('backend_auth_ready_restored_session'));
      CX.bus.on('backend-ready',payload=>{
        if(payload&&payload.source==='firestore')scheduleBootReconcile('backend_ready_firestore_dynamic',true);
        else scheduleBootReconcile('backend_ready_dynamic');
      });
    }
    if(CX.backend&&typeof CX.backend.refresh==='function'&&!CX.backend.__hrAuthorityDynamicRefreshWrapped){
      const original=CX.backend.refresh.bind(CX.backend);
      CX.backend.refresh=async function(){
        const state=await original();
        scheduleBootReconcile('backend_refresh_dynamic',true);
        return state;
      };
      CX.backend.__hrAuthorityDynamicRefreshWrapped=true;
    }
    window.addEventListener('focus',()=>scheduleBootReconcile('window_focus_restored_session'));
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')scheduleBootReconcile('visibility_restored_session');
    });
  }
  window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY=reconcile;
  window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE=scheduleBootReconcile;
  bind();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>scheduleBootReconcile('dom_ready_authenticated_context_restore',true),{once:true});
  }else{
    scheduleBootReconcile('script_ready_authenticated_context_restore',true);
  }
})();