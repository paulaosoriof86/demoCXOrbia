/* ============================================================
   CXOrbia · Corte 6 protected Auth + HR authority bridge v1
   ------------------------------------------------------------
   P0 root fix:
   - Firebase Auth/claims define the principal and protected scope.
   - HR live remains the immutable authority for all 616 operational visits.
   - Shopper-scoped Firestore reads enrich exact identity/profile only;
     they must never replace CX.data with one scoped visit.
   - Composition uses the existing exact-key canonical composer v2.
   - No provider writes, no Rules/Auth changes, no production.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  'use strict';
  const params = new URLSearchParams(window.location.search || '');
  const TOKEN = 'YES_PAULA_20260730_PROTECTED_DEV';
  if(params.get('cxProtectedRuntime') !== TOKEN) return;

  const endpoint = window.CX_TYA_LIVE_SOURCE_URL || '/api/tya/cinepolis/hr-live';
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const arr = value => Array.isArray(value) ? value : [];
  const str = value => String(value == null ? '' : value).trim();
  let reconciling = false;
  let lastSignature = '';
  let lastProtectedState = null;

  function context(){
    try{return CX.backendAuth && typeof CX.backendAuth.context === 'function' ? CX.backendAuth.context() : null;}
    catch(_){return null;}
  }

  function isProtectedPrincipal(ctx){
    return !!(ctx && ctx.authenticated === true && ctx.tenantId === 'tya' && arr(ctx.projectIds).includes('cinepolis'));
  }

  function captureProtectedState(){
    const ctx = context();
    if(!isProtectedPrincipal(ctx) || !CX.data) return null;
    const state = {
      role:str(ctx.role),
      authNamespace:str(ctx.authNamespace),
      shopperId:str(ctx.shopperId),
      projects:clone(CX.data.projects || []),
      visits:clone(CX.data._visitas || []),
      shoppers:clone(CX.data.shoppers || []),
      posts:clone(CX.data._posts || []),
      certifications:clone(CX.data.__protectedCertifications || []),
      liquidations:clone(CX.data.__protectedLiquidations || []),
      capturedAt:new Date().toISOString()
    };
    if(!state.visits.length || !state.shoppers.length) return null;
    return state;
  }

  function queryUrl(){
    const separator = endpoint.includes('?') ? '&' : '?';
    return endpoint + separator + new URLSearchParams({format:'json',fresh:'1',ts:String(Date.now())}).toString();
  }

  async function fetchHrSnapshot(){
    const response = await fetch(queryUrl(), {
      cache:'no-store',
      headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}
    });
    const payload = await response.json().catch(()=>null);
    if(!response.ok) throw new Error('HR_LIVE_HTTP_' + response.status);
    const snapshot = payload && (payload.snapshot || payload.data || payload);
    const runtime = Object.assign({}, payload && payload._runtime || {}, snapshot && snapshot._runtime || {});
    if(snapshot && snapshot._runtime) delete snapshot._runtime;
    if(!snapshot || snapshot.sourceSafe !== true || arr(snapshot.visits).length !== 616) {
      throw new Error('HR_LIVE_BASELINE_INVALID_' + arr(snapshot && snapshot.visits).length);
    }
    return {snapshot, runtime};
  }

  function installHistoryMethods(){
    if(!CX.data) return;
    CX.data.visitsForShopper = function(id, onlyCurrentProject){
      const target = str(id);
      return arr(this._visitas).filter(v => {
        if(str(v && v.shopperId) !== target) return false;
        if(!onlyCurrentProject) return true;
        const active = str(this.currentProjectId);
        return !active || str(v.rootProjectId) === active || str(v.projectId) === active || str(v.projectId).startsWith(active + '-');
      });
    };
  }

  function applyComposed(hrState, protectedState, reason){
    const engine = window.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!engine || typeof engine.compose !== 'function') throw new Error('CANONICAL_COMPOSER_V2_MISSING');
    const result = engine.compose({
      hr:{
        projects:clone(hrState.projects),
        visits:clone(hrState.visits),
        shoppers:clone(hrState.shoppers),
        posts:clone(hrState.posts),
        periodOperationalSummary:clone(hrState.periodOperationalSummary),
        currentProjectId:hrState.currentProjectId,
        currentPeriodId:hrState.currentPeriodId,
        sourceRevision:hrState.sourceRevision
      },
      protectedPayload:{
        visits:clone(protectedState.visits),
        shoppers:clone(protectedState.shoppers),
        posts:clone(protectedState.posts),
        certifications:clone(protectedState.certifications),
        liquidations:clone(protectedState.liquidations)
      }
    });
    const d = result.diagnostics || {};
    if(d.outputVisits !== 616 || d.duplicateVisitKeys !== 0 || d.duplicateShopperIds !== 0 || d.protectedVisitsAppended !== 0) {
      throw new Error('CANONICAL_COMPOSITION_INVARIANT_' + JSON.stringify({visits:d.outputVisits,duplicateVisits:d.duplicateVisitKeys,duplicateShoppers:d.duplicateShopperIds,appended:d.protectedVisitsAppended}));
    }

    CX.data.projects = clone(result.projects);
    CX.data._visitas = clone(result.visits);
    CX.data.shoppers = clone(result.shoppers);
    CX.data._posts = clone(result.posts);
    CX.data.periodOperationalSummary = clone(result.periodOperationalSummary);
    CX.data.currentProjectId = result.currentProjectId || 'cinepolis';
    CX.data.currentPeriodId = result.currentPeriodId || hrState.currentPeriodId || '';
    CX.data.__identityMap = clone(result.identityMap || {});
    CX.data.__identityReviewQueue = clone(result.identityReviewQueue || []);
    CX.data.__protectedCertifications = clone(protectedState.certifications);
    CX.data.__protectedLiquidations = clone(protectedState.liquidations);
    CX.data.sourceMode = 'tya_hr_live_authority_plus_firestore_principal_overlay_dev';
    CX.data.previewMeta = Object.assign({}, CX.data.previewMeta || {}, {
      tenantId:'tya',projectId:'cinepolis',sourceRevision:hrState.sourceRevision || null,
      protectedPrincipalRole:protectedState.role,protectedAuthNamespace:protectedState.authNamespace,
      hrAuthority:true,protectedOverlay:true,readOnly:true,production:false,
      visits:CX.data._visitas.length,shoppers:CX.data.shoppers.length,
      note:'HR viva conserva todas las visitas; Firestore autenticado solo enriquece identidad/perfil por llaves técnicas exactas.'
    });
    installHistoryMethods();

    if(CX.dataSource){
      CX.dataSource.mode = 'connected';
      CX.dataSource.status = 'ready';
      CX.dataSource.sourceRef = 'hr-live-authority+firestore-authenticated-overlay';
      CX.dataSource.updatedAt = new Date().toISOString();
      CX.dataSource.runtimeReadActive = true;
      CX.dataSource.runtimeSyncActive = false;
      CX.dataSource.updating = false;
      CX.dataSource.blockers = [];
      CX.dataSource.warnings = arr(result.identityReviewQueue).length ? [result.identityReviewQueue.length + ' identidades protegidas permanecen en revisión; no se fusionaron por similitud.'] : [];
    }

    const ctx = context();
    const ownVisits = ctx && ctx.shopperId && typeof CX.data.visitsForShopper === 'function'
      ? CX.data.visitsForShopper((result.identityMap || {})[ctx.shopperId] || ctx.shopperId, false).length
      : null;
    const signature = engine.signature(result);
    lastSignature = signature;
    window.CX_PROTECTED_AUTH_HR_AUTHORITY = {
      applied:true,reason:reason || 'backend_ready',role:protectedState.role,authNamespace:protectedState.authNamespace,
      hrVisits:CX.data._visitas.length,protectedVisits:protectedState.visits.length,
      protectedProfiles:protectedState.shoppers.length,matchedProtectedVisits:d.matchedProtectedVisits || 0,
      identityMapSize:Object.keys(result.identityMap || {}).length,ownVisits,
      duplicateVisitKeys:d.duplicateVisitKeys,duplicateShopperIds:d.duplicateShopperIds,
      providerWrites:0,authWrites:0,rulesDeploys:0,production:false,
      at:new Date().toISOString()
    };
    try{window.dispatchEvent(new CustomEvent('cx:protected-auth-hr-authority-ready',{detail:clone(window.CX_PROTECTED_AUTH_HR_AUTHORITY)}));}catch(_){ }
    if(CX.bus && typeof CX.bus.emit === 'function') CX.bus.emit('visit-flow',{reason:'protected_auth_hr_authority_ready',preserveUiState:true});
    return window.CX_PROTECTED_AUTH_HR_AUTHORITY;
  }

  async function reconcile(reason){
    if(reconciling) return {ok:true,skipped:true,reason:'reconcile_in_progress'};
    const ctx = context();
    if(!isProtectedPrincipal(ctx)) return {ok:false,skipped:true,reason:'principal_not_ready'};
    const protectedState = captureProtectedState() || lastProtectedState;
    if(!protectedState) return {ok:false,skipped:true,reason:'protected_state_missing'};
    lastProtectedState = protectedState;
    reconciling = true;
    try{
      const fetched = await fetchHrSnapshot();
      if(typeof window.CX_TYA_APPLY_LIVE_SNAPSHOT !== 'function') throw new Error('HR_INPLACE_ADAPTER_MISSING');
      window.CX_TYA_APPLY_LIVE_SNAPSHOT(fetched.snapshot, fetched.runtime, {reason:'protected_auth_hr_restore'});
      const hrState = {
        projects:clone(CX.data.projects || []),visits:clone(CX.data._visitas || []),shoppers:clone(CX.data.shoppers || []),posts:clone(CX.data._posts || []),
        periodOperationalSummary:clone(CX.data.periodOperationalSummary || []),currentProjectId:CX.data.currentProjectId || 'cinepolis',
        currentPeriodId:CX.data.currentPeriodId || '',sourceRevision:CX.data.previewMeta && CX.data.previewMeta.sourceRevision || fetched.runtime.revision || null
      };
      const result = applyComposed(hrState, protectedState, reason);
      return {ok:true,result};
    }catch(error){
      console.error('[CX.protected-auth-hr-authority]', error);
      if(CX.dataSource){
        CX.dataSource.status='blocked';
        CX.dataSource.blockers=['No fue posible restaurar la HR viva como autoridad operacional después de autenticar.'];
      }
      window.CX_PROTECTED_AUTH_HR_AUTHORITY = {applied:false,error:String(error && error.message || error),providerWrites:0,production:false,at:new Date().toISOString()};
      return {ok:false,error:String(error && error.message || error)};
    }finally{
      reconciling = false;
    }
  }

  function bind(){
    if(CX.bus && typeof CX.bus.on === 'function'){
      CX.bus.on('backend-ready', payload => {
        if(payload && payload.source === 'firestore') setTimeout(()=>reconcile('backend_ready_firestore'),0);
      });
    }
    if(CX.backend && typeof CX.backend.refresh === 'function' && !CX.backend.__hrAuthorityRefreshWrapped){
      const original = CX.backend.refresh.bind(CX.backend);
      CX.backend.refresh = async function(){
        const state = await original();
        await reconcile('backend_refresh');
        return state;
      };
      CX.backend.__hrAuthorityRefreshWrapped = true;
    }
  }

  window.CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY = reconcile;
  bind();
})();
