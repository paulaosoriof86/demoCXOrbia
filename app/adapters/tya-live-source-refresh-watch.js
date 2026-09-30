/* CXOrbia TyA Phase A — stable live HR freshness watcher.
   No document reload. No UI-module patch. Background refresh preserves user context.

   Corte 6 stability lock:
   - same revision => no snapshot apply, no overlay reapply, no functional rerender;
   - changed revision => apply HR exactly once, then recompose protected overlay exactly once;
   - visit-flow rerender is intercepted and replayed through a UI-state preserving gate;
   - modal/form interaction defers rerender instead of interrupting the user. */
window.CX = window.CX || {};
(function(){
  'use strict';
  const params=new URLSearchParams(window.location.search||'');
  const protectedRuntimeRequested=params.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV';
  const fullVisualRequested=params.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV';
  if(protectedRuntimeRequested){
    const reason='protected-runtime-owns-cxdata';
    window.CX_TYA_LIVE_SOURCE_WATCH_DISABLED_REASON=reason;
    window.CX_TYA_CHECK_LIVE_SOURCE=async function(){return {ok:false,skipped:true,reason};};
    console.warn('[CX.live-source] Watcher source-safe omitido: '+reason+'.');
    return;
  }

  const endpoint=window.CX_TYA_LIVE_SOURCE_URL||'/api/tya/cinepolis/hr-live';
  const pollMs=Math.max(15000,Number(window.CX_TYA_LIVE_POLL_MS||20000));
  let currentRevision=window.CX_TYA_HR_LIVE_META&&window.CX_TYA_HR_LIVE_META.revision||null;
  let checking=false;
  let consecutiveFailures=0;
  let pendingRender=null;

  function refreshBadge(){
    try{
      const db=document.getElementById('tbDataBadge');
      if(db&&CX.dataSource){const b=CX.dataSource.badge();db.innerHTML='<span class="d" style="background:'+b.c+'"></span> '+b.t;}
    }catch(_){ }
  }
  function markUpdating(){if(CX.dataSource){CX.dataSource.updating=true;CX.dataSource.runtimeReadActive=true;}refreshBadge();}
  function markLive(meta){
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;
    window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;
    if(CX.data){
      const stable=fullVisualRequested&&window.CX_TYA_FULL_VISUAL_READY===true;
      CX.data.sourceMode=stable?'tya_hr_live_plus_firestore_full_profile_stable_dev':(fullVisualRequested?'tya_hr_live_preparing_full_profile_stable_dev':'tya_hr_live_runtime_source_safe_dev');
      CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
        generatedAt:meta.generatedAt||null,sourceReadAt:meta.sourceReadAt||null,
        runtimeReadActive:true,runtimeSyncActive:false,sourceRevision:meta.revision||null,revisionStable:meta.revisionStable===true,
        fullProfileVisual:stable||CX.data.previewMeta&&CX.data.previewMeta.fullProfileVisual===true,
        note:stable?'HR viva estable; perfil protegido compuesto de forma idempotente.':'Lectura HR viva runtime sin recargar la página.'
      });
    }
    if(CX.dataSource){
      CX.dataSource.mode='connected';CX.dataSource.status='ready';
      CX.dataSource.sourceRef=fullVisualRequested?'hr-live+firestore-full-profile-stable+canonical-finance':'hr-live-runtime:tya:cinepolis';
      CX.dataSource.updatedAt=meta.sourceReadAt||meta.generatedAt||new Date().toISOString();
      CX.dataSource.runtimeSyncActive=false;CX.dataSource.runtimeReadActive=true;CX.dataSource.updating=false;
      if(!CX.dataSource.blockers||!CX.dataSource.blockers.length)CX.dataSource.blockers=[];
      try{localStorage.setItem('cx_data_mode','connected');}catch(_){ }
    }
    refreshBadge();
  }
  function markFailure(error){
    consecutiveFailures++;
    const message='Lectura HR viva no disponible: '+String(error&&error.message||error);
    if(CX.dataSource){
      CX.dataSource.updating=false;CX.dataSource.runtimeReadActive=consecutiveFailures<3;
      CX.dataSource.warnings=[message+' · Se conserva el último dato válido.'];
      if(consecutiveFailures>=3)CX.dataSource.status='degraded';
    }
    refreshBadge();
  }
  async function getJson(format,paramsInput={}){
    const query=new URLSearchParams({format,...paramsInput,ts:String(Date.now())});
    const response=await fetch(endpoint+(endpoint.includes('?')?'&':'?')+query.toString(),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
    const json=await response.json().catch(()=>null);
    if(!response.ok)throw new Error('HTTP '+response.status+(json&&json.message?': '+json.message:''));
    return json;
  }

  function visible(el){
    if(!el)return false;
    const style=window.getComputedStyle?window.getComputedStyle(el):null;
    return (!style||style.display!=='none')&&(!style||style.visibility!=='hidden')&&el.getClientRects().length>0;
  }
  function interactionBusy(){
    try{
      const modal=[...document.querySelectorAll('dialog[open],[aria-modal="true"],.modal.show,.modal.open,.overlay.open,.drawer.open')].some(visible);
      const active=document.activeElement;
      const editing=!!(active&&active!==document.body&&(['INPUT','TEXTAREA','SELECT'].includes(active.tagName)||active.isContentEditable));
      return modal||editing;
    }catch(_){return false;}
  }
  function controlKey(el,index){
    if(el.id)return 'id:'+el.id;
    if(el.name)return 'name:'+el.name+':'+index;
    return 'index:'+index;
  }
  function captureUiState(){
    const state={x:window.scrollX||0,y:window.scrollY||0,view:CX.session&&CX.session.view||null,controls:[],active:null,capturedAt:Date.now()};
    try{
      const controls=[...document.querySelectorAll('#view input,#view textarea,#view select,#rail select')];
      controls.forEach((el,index)=>state.controls.push({key:controlKey(el,index),id:el.id||null,name:el.name||null,index,value:el.value,checked:!!el.checked,type:el.type||'',tag:el.tagName}));
      const active=document.activeElement;
      if(active&&active!==document.body){state.active={id:active.id||null,name:active.name||null};}
    }catch(_){ }
    return state;
  }
  function findControl(saved){
    if(saved.id)return document.getElementById(saved.id);
    if(saved.name){const list=[...document.querySelectorAll(`[name="${String(saved.name).replace(/"/g,'\\"')}"]`)];return list[saved.index]||list[0]||null;}
    const list=[...document.querySelectorAll('#view input,#view textarea,#view select,#rail select')];return list[saved.index]||null;
  }
  function restoreUiState(state){
    if(!state)return;
    const restore=()=>{
      try{
        for(const saved of state.controls||[]){
          const el=findControl(saved);if(!el)continue;
          if(saved.tag==='SELECT'){
            const hasOption=[...el.options].some(o=>String(o.value)===String(saved.value));
            if(hasOption)el.value=saved.value;
          }else if(saved.type==='checkbox'||saved.type==='radio')el.checked=saved.checked;
          else el.value=saved.value;
        }
        window.scrollTo(state.x,state.y);
        let active=null;
        if(state.active&&state.active.id)active=document.getElementById(state.active.id);
        if(!active&&state.active&&state.active.name)active=document.querySelector(`[name="${String(state.active.name).replace(/"/g,'\\"')}"]`);
        if(active&&typeof active.focus==='function'&&!interactionBusy())active.focus({preventScroll:true});
      }catch(_){ }
    };
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(restore));
    else setTimeout(restore,0);
  }
  function emitVisitFlowPreservingUi(reason,detail,state){
    if(!CX.bus||typeof CX.bus.emit!=='function')return {ok:false,skipped:true,reason:'bus_missing'};
    const snapshot=state||captureUiState();
    if(interactionBusy()){
      pendingRender={reason:reason||'deferred_live_refresh',detail:detail||{},state:snapshot};
      return {ok:true,deferred:true,reason:'active_user_interaction'};
    }
    pendingRender=null;
    CX.bus.emit('visit-flow',Object.assign({reason:reason||'stable_live_refresh',preserveUiState:true},detail||{}));
    restoreUiState(snapshot);
    return {ok:true,deferred:false};
  }
  function flushPendingRender(){
    if(!pendingRender||interactionBusy())return false;
    const pending=pendingRender;pendingRender=null;
    emitVisitFlowPreservingUi(pending.reason,pending.detail,pending.state);
    return true;
  }
  function applyWithoutImmediateRerender(snapshot,runtime,reason){
    const apply=window.CX_TYA_APPLY_LIVE_SNAPSHOT;
    if(typeof apply!=='function')throw new Error('Adapter in-place no disponible');
    const state=captureUiState();
    let intercepted=null;
    if(!CX.bus||typeof CX.bus.emit!=='function')return {result:apply(snapshot,runtime,{reason}),state,intercepted};
    const original=CX.bus.emit;
    CX.bus.emit=function(event,...args){
      if(event==='visit-flow'){intercepted={event,args};return;}
      return original.call(CX.bus,event,...args);
    };
    try{return {result:apply(snapshot,runtime,{reason}),state,intercepted};}
    finally{CX.bus.emit=original;}
  }
  function reapplyFullVisual(reason){
    if(!fullVisualRequested)return {ok:true,skipped:true,reason:'full_visual_not_requested'};
    const fn=window.CX_TYA_REAPPLY_FULL_VISUAL_OVERLAY;
    if(typeof fn!=='function')return {ok:false,skipped:true,reason:'stable_overlay_not_ready'};
    return fn(reason||'after_live_hr_change');
  }

  async function check(reason){
    if(checking)return {ok:true,skipped:true,reason:'check_in_progress'};
    checking=true;markUpdating();
    try{
      const meta=await getJson('meta',{fresh:'1'});
      if(meta.sourceSafe!==true||meta.runtimeRead!==true||!meta.revision)throw new Error('Respuesta live inválida');
      const changed=!currentRevision||meta.revision!==currentRevision;
      if(changed){
        const snapshot=await getJson('json');
        const runtime=snapshot&&snapshot._runtime?Object.assign({},meta,snapshot._runtime):meta;
        if(snapshot&&snapshot._runtime)delete snapshot._runtime;
        const applied=applyWithoutImmediateRerender(snapshot,runtime,reason||'live_refresh');
        currentRevision=meta.revision;
        const overlay=reapplyFullVisual('after_live_hr_change');
        markLive(meta);
        const detail={sourceRevision:meta.revision,reason:reason||'live_refresh',stableOverlay:overlay&&overlay.ok===true};
        const render=emitVisitFlowPreservingUi(reason||'live_refresh',detail,applied.state);
        consecutiveFailures=0;
        return {ok:true,changed:true,revision:meta.revision,applied:applied.result,overlay,render};
      }
      markLive(meta);
      if(fullVisualRequested&&!window.CX_TYA_FULL_VISUAL_READY)reapplyFullVisual('same_revision_before_full_visual_ready');
      flushPendingRender();
      consecutiveFailures=0;
      return {ok:true,changed:false,revision:meta.revision};
    }catch(error){
      markFailure(error);
      return {ok:false,error:String(error&&error.message||error)};
    }finally{checking=false;}
  }

  window.CX_TYA_REQUEST_STABLE_RERENDER=(reason,detail)=>emitVisitFlowPreservingUi(reason||'manual_stable_rerender',detail||{},captureUiState());
  window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER=flushPendingRender;
  window.CX_TYA_CAPTURE_UI_STATE=captureUiState;
  window.CX_TYA_CHECK_LIVE_SOURCE=check;

  if(window.CX_TYA_HR_LIVE_META&&window.CX_TYA_HR_LIVE_META.runtimeRead===true)markLive(window.CX_TYA_HR_LIVE_META);
  else if(CX.dataSource){CX.dataSource.warnings=['Validando lectura HR viva…'];refreshBadge();}

  window.addEventListener('focus',()=>check('window_focus'));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check('visibility_resume');});
  document.addEventListener('focusout',()=>setTimeout(flushPendingRender,0));
  document.addEventListener('close',()=>setTimeout(flushPendingRender,0),true);
  window.addEventListener('load',()=>setTimeout(()=>check('initial_load'),300),{once:true});
  window.setInterval(()=>check('poll'),pollMs);
})();
