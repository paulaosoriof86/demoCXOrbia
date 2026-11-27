/* CXOrbia TyA Phase A — stable live HR watcher v4 (DEV).
   Stable content revision only; zero functional work on same revision.
   Human visual and protected technical lanes are separated explicitly.
   Protected human lane waits for the canonical Auth+Firestore+HR authority
   before it may refresh HR in place, preventing source-safe from winning boot.
*/
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  const protectedRuntime=params.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV';
  const technicalAuthE2E=protectedRuntime&&params.get('cxTechnicalAuthE2E')==='YES_PAULA_20260801_REAL_USERS_E2E';
  const fullVisual=params.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV';
  const authenticatedHumanRuntime=protectedRuntime&&fullVisual&&!technicalAuthE2E;
  if(technicalAuthE2E){const reason='protected-technical-auth-owns-cxdata';window.CX_TYA_LIVE_SOURCE_WATCH_DISABLED_REASON=reason;window.CX_TYA_CHECK_LIVE_SOURCE=async()=>({ok:false,skipped:true,reason});return;}
  function runtimeScope(){
    let ctx=null;try{ctx=CX.backendAuth?.context?.()||null;}catch(_){}
    const tenantId=String(ctx?.tenantId||params.get('cxTenantId')||CX.BACKEND?.tenantId||'').trim();
    const scoped=Array.isArray(ctx?.projectIds)?[...new Set(ctx.projectIds.map(String).map(x=>x.trim()).filter(Boolean))]:[];
    const projectId=String(params.get('cxProjectId')||CX.data?.currentProjectId||(scoped.length===1?scoped[0]:'')).trim();
    const records=Array.isArray(CX.data?.__backendAllProjectRecords)?CX.data.__backendAllProjectRecords:[];
    const project=records.find(x=>String(x?.id||x?.projectId||'').trim()===projectId)||null;
    return {tenantId,projectId,project};
  }
  function endpoint(){if(!authenticatedHumanRuntime&&window.CX_TYA_LIVE_SOURCE_URL)return String(window.CX_TYA_LIVE_SOURCE_URL);const scope=runtimeScope();if(!scope.tenantId||!scope.projectId)return '';return '/api/tenants/'+encodeURIComponent(scope.tenantId)+'/projects/'+encodeURIComponent(scope.projectId)+'/hr-live';}
  const configuredPollMs=Number(window.CX_TYA_LIVE_POLL_MS);
  const pollMs=Number.isFinite(configuredPollMs)&&configuredPollMs>0?Math.max(15000,configuredPollMs):300000;
  // Automatic checks consult the shared project projection. Only its server
  // synchronizer elects an external reader when due. Explicit refresh and
  // post-write verification keep their own strict freshness semantics.
  const automaticReasons=new Set(['poll','window_focus','visibility_resume','initial_load','backend_auth_ready','canonical_authority_ready']);
  const lastAutomaticAttempts=new Map();
  function automaticScopeKey(scope){
    let ctx=null;try{ctx=CX.backendAuth?.context?.()||null;}catch(_){}
    const uid=String(window.firebase?.auth?.().currentUser?.uid||'');
    return JSON.stringify([scope.tenantId,scope.projectId,uid,String(ctx?.role||''),String(ctx?.authNamespace||'')]);
  }
  function rememberAutomaticAttempt(scope,at=Date.now()){
    const key=automaticScopeKey(scope);lastAutomaticAttempts.delete(key);lastAutomaticAttempts.set(key,at);
    if(lastAutomaticAttempts.size>64)lastAutomaticAttempts.delete(lastAutomaticAttempts.keys().next().value);
  }
  let currentRevision=window.CX_TYA_HR_LIVE_META?.revision||null,checking=false,failures=0,pending=null,currentContentSignature=null,pendingProtectedRefresh=false;
  const VOLATILE=new Set(['generatedAt','sourceReadAt','sourceSnapshotAt','lastSnapshotAt','tabRegistryObservedAt','observedAt','refreshedAt','loadedAt','updatedAt','cacheAgeMs','refreshStartedAt','refreshFinishedAt','refreshDurationMs']);
  function stableValue(v){if(Array.isArray(v))return v.map(stableValue);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort()){if(!VOLATILE.has(k)&&k!=='_runtime')o[k]=stableValue(v[k]);}return o;}return v;}
  function signature(snapshot){try{return JSON.stringify(stableValue({periods:snapshot?.periods||[],visits:snapshot?.visits||[],shoppers:snapshot?.shoppers||[],periodOperationalSummary:snapshot?.periodOperationalSummary||[]}));}catch(_){return '';}}
  function canonicalHumanAuthReady(){
    if(!authenticatedHumanRuntime)return true;
    try{const ctx=CX.backendAuth?.context?.(),scope=runtimeScope();return !!(ctx&&ctx.authenticated===true&&scope.tenantId&&ctx.tenantId===scope.tenantId&&scope.projectId);}catch(_){return false;}
  }
  function canonicalProtectedAuthorityReady(){
    if(!authenticatedHumanRuntime)return true;
    const mode=String(CX.data?.sourceMode||'');
    const sourceRef=String(CX.dataSource?.sourceRef||'');
    const authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},dataRevision=String(CX.data?.previewMeta?.sourceRevision||'').trim(),authorityRevision=String(authority.sourceRevision||'').trim();
    return authority.applied===true
      && authority.atomicPublication===true
      && dataRevision
      && authorityRevision===dataRevision
      && (mode==='tya_hr_live_all_periods_plus_firestore_exact_overlay_dev'
        || mode==='tya_hr_live_plus_firestore_full_profile_stable_dev'
        || mode==='tya_hr_live_preparing_full_profile_stable_dev'
        || sourceRef==='hr-live-all-periods+firestore-authenticated-exact-overlay');
  }
  function refreshBadge(){CX.dataSource?.renderTopbarBadge?.();}

  function markUpdating(){if(CX.dataSource){CX.dataSource.updating=true;CX.dataSource.runtimeReadActive=true;}refreshBadge();}
  function finishProtectedCheck(meta,deferred=false){
    if(CX.dataSource){
      const ownWarning=/^(Lectura HR viva no disponible:|Hay cambios en la hoja de ruta\. Se aplicarán al cerrar la edición\.$|Esperando autoridad canónica Auth \+ Firestore \+ HR|Esperando autenticación y autoridad canónica antes de leer HR viva|Validando lectura HR viva)/;
      const otherWarnings=(Array.isArray(CX.dataSource.warnings)?CX.dataSource.warnings:[]).filter(warning=>!ownWarning.test(String(warning)));
      CX.dataSource.updating=false;CX.dataSource.runtimeReadActive=true;CX.dataSource.lastLiveCheckAt=new Date().toISOString();CX.dataSource.pendingLiveRevision=deferred?meta.revision:null;CX.dataSource.warnings=deferred?otherWarnings.concat('Hay cambios en la hoja de ruta. Se aplicarán al cerrar la edición.'):otherWarnings;
    }
    window.CX_TYA_APPLY_HR_FRESHNESS?.(meta);
    if(meta.sharedRefreshFailed&&CX.dataSource)CX.dataSource.warnings.push('Lectura HR viva no disponible: se conserva la última lectura confirmada.');
    refreshBadge();
  }
  function canonicalBaselineReady(){return !!(CX.data&&Array.isArray(CX.data.projects)&&CX.data.projects.length>0&&Array.isArray(CX.data._visitas)&&CX.data._visitas.length>0);}
  function markLive(meta){
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;
    if(CX.data){const stable=fullVisual&&window.CX_TYA_FULL_VISUAL_READY===true;CX.data.sourceMode=stable?'tya_hr_live_plus_firestore_full_profile_stable_dev':fullVisual?'tya_hr_live_preparing_full_profile_stable_dev':'tya_hr_live_runtime_source_safe_dev';CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{},{generatedAt:meta.generatedAt||null,sourceReadAt:meta.sourceReadAt||null,runtimeReadActive:true,runtimeSyncActive:false,sourceRevision:meta.revision||null,revisionStable:meta.revisionStable===true,fullProfileVisual:stable||CX.data.previewMeta?.fullProfileVisual===true,note:stable?'HR viva estable; perfil protegido compuesto desde revisión canónica.':'Lectura HR viva runtime sin recargar la página.'});}
    if(CX.dataSource){CX.dataSource.mode=(authenticatedHumanRuntime||technicalAuthE2E)?'connected':'source_safe_preview';CX.dataSource.status='ready';CX.dataSource.sourceRef=authenticatedHumanRuntime?'hr-live-all-periods+firestore-authenticated-exact-overlay':fullVisual?'hr-live+firestore-full-profile-stable+canonical-finance':('hr-live-runtime:'+runtimeScope().tenantId+':'+runtimeScope().projectId);CX.dataSource.updatedAt=meta.sourceReadAt||meta.generatedAt||new Date().toISOString();CX.dataSource.runtimeSyncActive=false;CX.dataSource.runtimeReadActive=true;CX.dataSource.updating=false;CX.dataSource.blockers=[];}
    window.CX_TYA_APPLY_HR_FRESHNESS?.(meta);
    refreshBadge();
  }
  function markFailure(error){
    failures++;
    if(CX.dataSource){
      CX.dataSource.updating=false;
      CX.dataSource.runtimeReadActive=failures<3;
      CX.dataSource.warnings=['Lectura HR viva no disponible: '+String(error?.message||error)+' · Se conserva el último dato válido.'];
      if(authenticatedHumanRuntime&&canonicalProtectedAuthorityReady()){
        CX.dataSource.mode='connected';CX.dataSource.status='ready';CX.dataSource.sourceRef='hr-live-all-periods+firestore-authenticated-exact-overlay';CX.dataSource.blockers=[];
      }else if(canonicalBaselineReady()){
        CX.dataSource.mode='source_safe_preview';CX.dataSource.status='ready';CX.dataSource.blockers=[];
      }else if(failures>=3)CX.dataSource.status='degraded';
    }
    window.CX_TYA_APPLY_HR_FRESHNESS?.({externalReadCurrent:false,sourceReadAt:CX.data?.previewMeta?.sourceReadAt||null});
    refreshBadge();
  }
  async function getJson(format,extra={}){
    const source=endpoint();
    if(!source)throw new Error('PROJECT_SOURCE_REQUIRED');
    const headers={'Cache-Control':'no-cache, no-store','Pragma':'no-cache'};
    if(authenticatedHumanRuntime){
      const user=window.firebase?.auth?.().currentUser;
      if(!user)throw new Error('AUTH_FAILURE:PROTECTED_HR_PRINCIPAL_REQUIRED');
      const token=await user.getIdToken(false);
      if(user.uid!==window.firebase?.auth?.().currentUser?.uid)throw new Error('AUTH_FAILURE:PROTECTED_HR_PRINCIPAL_CHANGED');
      headers.Authorization='Bearer '+token;
    }
    const query=new URLSearchParams({format,...extra,ts:String(Date.now())});
    const response=await fetch(source+(source.includes('?')?'&':'?')+query,{cache:'no-store',headers});
    const body=await response.json().catch(()=>null);
    if(!response.ok)throw new Error('HTTP '+response.status+(body?.message?': '+body.message:''));
    return body;
  }
  function busy(){try{const modal=[...document.querySelectorAll('dialog[open],[aria-modal="true"],.modal.show,.modal.open,.overlay.open,.drawer.open,.cx-ov')].some(x=>x.getClientRects().length);const a=document.activeElement;return modal||!!(a&&a!==document.body&&(['INPUT','TEXTAREA','SELECT'].includes(a.tagName)||a.isContentEditable));}catch(_){return false;}}
  function capture(){const content=document.querySelector('.content'),rail=document.getElementById('rail');return {periodId:CX.data?.currentPeriodId||null,projectId:CX.data?.currentProjectId||null,view:CX.session?.view||null,contentTop:content?.scrollTop||0,contentLeft:content?.scrollLeft||0,railTop:rail?.scrollTop||0,windowX:window.scrollX||0,windowY:window.scrollY||0};}
  function restoreModel(s){if(!CX.data||!s)return;if(s.periodId&&CX.data.projects?.some(p=>String(p.id)===String(s.periodId)))CX.data.currentPeriodId=s.periodId;if(s.projectId)CX.data.currentProjectId=s.projectId;if(CX.session&&s.view)CX.session.view=s.view;}
  function restoreScroll(s){if(!s)return;const run=()=>{const content=document.querySelector('.content'),rail=document.getElementById('rail');if(content){content.scrollTop=s.contentTop;content.scrollLeft=s.contentLeft;}if(rail)rail.scrollTop=s.railTop;window.scrollTo(s.windowX,s.windowY);};requestAnimationFrame(()=>requestAnimationFrame(run));}
  function emitOnce(reason,detail,state){if(!CX.bus?.emit)return {ok:false,reason:'bus_missing'};if(busy()){pending={reason,detail,state};return {ok:true,deferred:true};}pending=null;CX.bus.emit('visit-flow',Object.assign({reason,preserveUiState:true},detail||{}));restoreScroll(state);return {ok:true,deferred:false};}
  function flush(){if(busy())return false;if(pendingProtectedRefresh&&!checking){pendingProtectedRefresh=false;return check('editor_closed');}if(!pending)return false;const p=pending;pending=null;emitOnce(p.reason,p.detail,p.state);return true;}
  function applySilent(snapshot,runtime,reason){const fn=window.CX_TYA_APPLY_LIVE_SNAPSHOT;if(typeof fn!=='function')throw new Error('Adapter in-place no disponible');const state=capture(),original=CX.bus?.emit;let intercepted=0;if(original)CX.bus.emit=function(event,...args){if(event==='visit-flow'){intercepted++;return;}return original.call(CX.bus,event,...args);};try{return {result:fn(snapshot,runtime,{reason}),state,intercepted};}finally{if(original)CX.bus.emit=original;}}
  function recompose(reason){if(!fullVisual)return {ok:true,skipped:true};const fn=window.CX_TYA_REAPPLY_FULL_VISUAL_OVERLAY;if(typeof fn!=='function')return {ok:false,skipped:true,reason:'overlay_not_ready'};return fn(reason);}
  // VRM-134/A08: the protected authority bridge has just checked this revision
  // independently with HR before its atomic publish. Reuse that exact proof for
  // the immediate ready event only; regular polling must still query live HR.
  function reuseJustVerifiedProtectedRevision(){
    if(!authenticatedHumanRuntime||checking||!canonicalHumanAuthReady()||!canonicalProtectedAuthorityReady())return false;
    const scope=runtimeScope(),authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},boot=window.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE||{};
    const revision=String(authority.sourceRevision||'').trim(),published=String(CX.data?.previewMeta?.sourceRevision||'').trim();
    const user=window.firebase?.auth?.().currentUser,elapsed=Date.now()-Date.parse(authority.at||'');
    if(!revision||revision!==published||String(boot.sourceRevision||'')!==revision||boot.ready!==true||boot.completed!==true)return false;
    if(String(authority.tenantId||'')!==scope.tenantId||String(authority.projectId||'')!==scope.projectId)return false;
    if(!user?.uid||String(authority.actorUid||'')!==String(user.uid))return false;
    if(!Number.isFinite(elapsed)||elapsed<0||elapsed>5000)return false;
    const authContext=CX.backendAuth?.context?.()||{};
    if(String(authority.role||'')!==String(authContext.role||'')||String(authority.authNamespace||'')!==String(authContext.authNamespace||''))return false;
    const readAt=Date.parse(authority.sourceReadAt||'');
    if(authority.readScope?.mode==='explicit_period')return false;
    if(authority.externalReadCurrent!==true||!Number.isFinite(readAt)||readAt>Date.now()||Date.now()-readAt>=pollMs)return false;
    rememberAutomaticAttempt(scope,readAt);
    currentRevision=revision;failures=0;pendingProtectedRefresh=false;finishProtectedCheck({revision,externalReadCurrent:authority.externalReadCurrent,sourceReadAt:authority.sourceReadAt,hrFreshness:authority.hrFreshness});
    return true;
  }
  async function check(reason){
    const scope=runtimeScope();
    const automatic=automaticReasons.has(reason);
    const selectedHistory=window.CX_PROTECTED_AUTH_HR_AUTHORITY?.readScope?.mode==='explicit_period'?window.CX_PROTECTED_AUTH_HR_AUTHORITY.readScope.requestedPeriodId:null;
    if(selectedHistory&&automatic)return {ok:true,skipped:true,reason:'historical_period_on_demand_only'};
    if(selectedHistory&&authenticatedHumanRuntime&&typeof window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY==='function')return window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY('explicit_historical_refresh',{periodId:selectedHistory});
    if(automatic&&document.visibilityState==='hidden')return {ok:true,skipped:true,reason:'automatic_hr_hidden_tab'};
    if(scope.project?.operationalSource?.mode==='internal')return {ok:true,skipped:true,reason:'internal_project_firestore_authority'};
    if(!scope.projectId)return {ok:false,skipped:true,reason:'project_selection_required'};
    if(authenticatedHumanRuntime&&!canonicalHumanAuthReady())return {ok:false,skipped:true,reason:'authenticated_human_context_required'};
    if(authenticatedHumanRuntime&&!canonicalProtectedAuthorityReady()){
      if(CX.dataSource){CX.dataSource.updating=false;CX.dataSource.warnings=['Esperando autoridad canónica Auth + Firestore + HR antes de habilitar refresh HR.'];refreshBadge();}
      window.CX_TYA_LIVE_SOURCE_AUTHORITY_LOCK={ready:false,blockedDirectApply:true,reason:'canonical_protected_authority_required',providerWrites:0,production:false,at:new Date().toISOString()};
      return {ok:false,skipped:true,reason:'canonical_protected_authority_required'};
    }
    if(checking)return {ok:true,skipped:true,reason:'check_in_progress'};
    const previousAttempt=lastAutomaticAttempts.get(automaticScopeKey(scope)),now=Date.now();
    if(automatic&&Number.isFinite(previousAttempt)&&now>=previousAttempt&&now-previousAttempt<pollMs)
      return {ok:true,skipped:true,reason:'automatic_hr_interval',nextCheckInMs:pollMs-(now-previousAttempt)};
    rememberAutomaticAttempt(scope,now);checking=true;markUpdating();
    try{
      const query=authenticatedHumanRuntime?{protectedState:'1',readModel:'1'}:{};
      const sharedCheck=automatic||reason==='editor_closed';
      if(sharedCheck&&authenticatedHumanRuntime)query.sync='due';
      else Object.assign(query,{fresh:'1',...(!automatic?{inventory:'1'}:{})});
      const identity=automaticScopeKey(scope);
      const meta=await getJson('meta',query);
      if(authenticatedHumanRuntime&&identity!==automaticScopeKey(runtimeScope()))throw new Error('AUTH_FAILURE:PROTECTED_HR_SCOPE_CHANGED');if(meta.sourceSafe!==true||meta.runtimeRead!==true||!meta.revision)throw new Error('Respuesta live inválida');
      if(authenticatedHumanRuntime&&canonicalProtectedAuthorityReady()){
        const protectedRevision=String(CX.data?.previewMeta?.sourceRevision||'').trim();
        if(protectedRevision)currentRevision=protectedRevision;
        if(meta.revision!==currentRevision){
          // Keep the user's open editor intact. Only queue the need for a fresh
          // check, never a stale snapshot; session and scope are rechecked then.
          if(busy()){pendingProtectedRefresh=true;finishProtectedCheck(meta,true);failures=0;return {ok:true,changed:true,deferred:true,revision:meta.revision,authority:'protected_auth_hr_reconcile'};}
          pendingProtectedRefresh=false;
          window.CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE?.('live_watcher_revision_change',true,{expectedRevision:meta.revision});
          failures=0;
          return {ok:true,changed:true,delegated:true,revision:meta.revision,authority:'protected_auth_hr_reconcile'};
        }
        failures=0;pendingProtectedRefresh=false;finishProtectedCheck(meta);
        return {ok:true,changed:false,revision:meta.revision,authority:'protected_auth_hr_reconcile'};
      }
      const changed=!currentRevision||meta.revision!==currentRevision;
      if(!changed){markLive(meta);if(fullVisual&&!window.CX_TYA_FULL_VISUAL_READY)recompose('same_revision_before_full_visual_ready');flush();failures=0;return {ok:true,changed:false,revision:meta.revision};}
      const snapshot=await getJson('json'),runtime=snapshot?._runtime?Object.assign({},meta,snapshot._runtime):meta;if(snapshot?._runtime)delete snapshot._runtime;
      const nextSignature=signature(snapshot);
      if(!currentContentSignature&&window.CX_TYA_HR_SOURCE_SAFE)currentContentSignature=signature(window.CX_TYA_HR_SOURCE_SAFE);
      if(currentContentSignature&&nextSignature===currentContentSignature){currentRevision=meta.revision;markLive(meta);failures=0;return {ok:true,changed:false,metadataRevisionChanged:true,revision:meta.revision,contentStable:true};}
      const applied=applySilent(snapshot,runtime,reason||'live_refresh');currentRevision=meta.revision;currentContentSignature=nextSignature;restoreModel(applied.state);
      const overlay=recompose('after_live_hr_change');markLive(meta);failures=0;
      if(authenticatedHumanRuntime){window.CX_TYA_LIVE_SOURCE_AUTHORITY_LOCK={ready:true,blockedDirectApply:false,initialCanonicalAuthorityProven:true,overlayRecomposed:overlay?.ok===true,sourceRef:CX.dataSource?.sourceRef||null,providerWrites:0,production:false,at:new Date().toISOString()};}
      const preload=reason==='full_visual_preload'||(!window.CX_TYA_FULL_VISUAL_READY&&fullVisual);
      if(preload){restoreScroll(applied.state);return {ok:true,changed:true,preload:true,revision:meta.revision,applied:applied.result,overlay};}
      const render=emitOnce(reason||'live_refresh',{sourceRevision:meta.revision,stableOverlay:overlay?.ok===true},applied.state);
      return {ok:true,changed:true,revision:meta.revision,applied:applied.result,overlay,render};
    }catch(error){markFailure(error);return {ok:false,error:String(error?.message||error)};}finally{checking=false;}
  }
  window.CX_TYA_REQUEST_STABLE_RERENDER=(reason,detail)=>emitOnce(reason||'manual_stable_rerender',detail||{},capture());
  window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER=flush;window.CX_TYA_CAPTURE_UI_STATE=capture;window.CX_TYA_CHECK_LIVE_SOURCE=check;
  if(window.CX_TYA_HR_LIVE_META?.runtimeRead===true&&canonicalHumanAuthReady()&&canonicalProtectedAuthorityReady())markLive(window.CX_TYA_HR_LIVE_META);else if(CX.dataSource){CX.dataSource.warnings=[authenticatedHumanRuntime?'Esperando autenticación y autoridad canónica antes de leer HR viva…':'Validando lectura HR viva…'];refreshBadge();}
  if(CX.bus?.on)CX.bus.on('backend-auth-ready',()=>check('backend_auth_ready'));
  window.addEventListener('cx:protected-auth-hr-authority-ready',()=>reuseJustVerifiedProtectedRevision()?{ok:true,skipped:true,reason:'just_verified_protected_revision'}:check('canonical_authority_ready'));
  window.addEventListener('focus',()=>check('window_focus'));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check('visibility_resume');});document.addEventListener('focusout',()=>setTimeout(flush,0));window.addEventListener('load',()=>setTimeout(()=>check('initial_load'),300),{once:true});setInterval(()=>check('poll'),pollMs);
})();
