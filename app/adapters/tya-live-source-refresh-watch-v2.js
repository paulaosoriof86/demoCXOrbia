/* CXOrbia TyA Phase A — stable live HR watcher v2 (DEV).
   Stable content revision only; zero functional work on same revision.
   A changed revision applies HR once, recomposes once and renders once while preserving
   canonical model context plus canvas/sidebar scroll. DOM select values are never restored
   independently from CX.data, preventing visible/model period divergence. */
(function(){
  'use strict';
  window.CX=window.CX||{};
  const params=new URLSearchParams(location.search||'');
  const protectedRuntime=params.get('cxProtectedRuntime')==='YES_PAULA_20260730_PROTECTED_DEV';
  const fullVisual=params.get('cxHumanFullVisual')==='YES_PAULA_20260731_FULL_PROFILE_DEV';
  if(protectedRuntime){const reason='protected-runtime-owns-cxdata';window.CX_TYA_LIVE_SOURCE_WATCH_DISABLED_REASON=reason;window.CX_TYA_CHECK_LIVE_SOURCE=async()=>({ok:false,skipped:true,reason});return;}
  const endpoint=window.CX_TYA_LIVE_SOURCE_URL||'/api/tya/cinepolis/hr-live';
  const pollMs=Math.max(15000,Number(window.CX_TYA_LIVE_POLL_MS||20000));
  let currentRevision=window.CX_TYA_HR_LIVE_META?.revision||null,checking=false,failures=0,pending=null,currentContentSignature=null;
  const str=v=>String(v==null?'':v).trim();
  const VOLATILE=new Set(['generatedAt','sourceReadAt','sourceSnapshotAt','lastSnapshotAt','tabRegistryObservedAt','observedAt','refreshedAt','loadedAt','updatedAt','cacheAgeMs','refreshStartedAt','refreshFinishedAt','refreshDurationMs']);
  function stableValue(v){if(Array.isArray(v))return v.map(stableValue);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort()){if(!VOLATILE.has(k)&&k!=='_runtime')o[k]=stableValue(v[k]);}return o;}return v;}
  function signature(snapshot){try{return JSON.stringify(stableValue({periods:snapshot?.periods||[],visits:snapshot?.visits||[],shoppers:snapshot?.shoppers||[],periodOperationalSummary:snapshot?.periodOperationalSummary||[]}));}catch(_){return '';}}
  function refreshBadge(){try{const el=document.getElementById('tbDataBadge');if(el&&CX.dataSource){const b=CX.dataSource.badge();el.innerHTML='<span class="d" style="background:'+b.c+'"></span> '+b.t;}}catch(_){}}
  function markUpdating(){if(CX.dataSource){CX.dataSource.updating=true;CX.dataSource.runtimeReadActive=true;}refreshBadge();}
  function markLive(meta){
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;
    if(CX.data){const stable=fullVisual&&window.CX_TYA_FULL_VISUAL_READY===true;CX.data.sourceMode=stable?'tya_hr_live_plus_firestore_full_profile_stable_dev':fullVisual?'tya_hr_live_preparing_full_profile_stable_dev':'tya_hr_live_runtime_source_safe_dev';CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{},{generatedAt:meta.generatedAt||null,sourceReadAt:meta.sourceReadAt||null,runtimeReadActive:true,runtimeSyncActive:false,sourceRevision:meta.revision||null,revisionStable:meta.revisionStable===true,fullProfileVisual:stable||CX.data.previewMeta?.fullProfileVisual===true,note:stable?'HR viva estable; perfil protegido compuesto desde revisión canónica.':'Lectura HR viva runtime sin recargar la página.'});}
    if(CX.dataSource){CX.dataSource.mode='connected';CX.dataSource.status='ready';CX.dataSource.sourceRef=fullVisual?'hr-live+firestore-full-profile-stable+canonical-finance':'hr-live-runtime:tya:cinepolis';CX.dataSource.updatedAt=meta.sourceReadAt||meta.generatedAt||new Date().toISOString();CX.dataSource.runtimeSyncActive=false;CX.dataSource.runtimeReadActive=true;CX.dataSource.updating=false;if(!CX.dataSource.blockers?.length)CX.dataSource.blockers=[];}
    refreshBadge();
  }
  function markFailure(error){failures++;if(CX.dataSource){CX.dataSource.updating=false;CX.dataSource.runtimeReadActive=failures<3;CX.dataSource.warnings=['Lectura HR viva no disponible: '+String(error?.message||error)+' · Se conserva el último dato válido.'];if(failures>=3)CX.dataSource.status='degraded';}refreshBadge();}
  async function getJson(format,extra={}){const q=new URLSearchParams({format,...extra,ts:String(Date.now())});const r=await fetch(endpoint+(endpoint.includes('?')?'&':'?')+q,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});const j=await r.json().catch(()=>null);if(!r.ok)throw new Error('HTTP '+r.status+(j?.message?': '+j.message:''));return j;}
  function busy(){try{const modal=[...document.querySelectorAll('dialog[open],[aria-modal="true"],.modal.show,.modal.open,.overlay.open,.drawer.open,.cx-ov')].some(x=>x.getClientRects().length);const a=document.activeElement;return modal||!!(a&&a!==document.body&&(['INPUT','TEXTAREA','SELECT'].includes(a.tagName)||a.isContentEditable));}catch(_){return false;}}
  function capture(){const content=document.querySelector('.content'),rail=document.getElementById('rail');return {periodId:CX.data?.currentPeriodId||null,projectId:CX.data?.currentProjectId||null,view:CX.session?.view||null,contentTop:content?.scrollTop||0,contentLeft:content?.scrollLeft||0,railTop:rail?.scrollTop||0,windowX:window.scrollX||0,windowY:window.scrollY||0};}
  function restoreModel(s){if(!CX.data||!s)return;if(s.periodId&&CX.data.projects?.some(p=>String(p.id)===String(s.periodId)))CX.data.currentPeriodId=s.periodId;if(s.projectId)CX.data.currentProjectId=s.projectId;if(CX.session&&s.view)CX.session.view=s.view;}
  function restoreScroll(s){if(!s)return;const run=()=>{const content=document.querySelector('.content'),rail=document.getElementById('rail');if(content){content.scrollTop=s.contentTop;content.scrollLeft=s.contentLeft;}if(rail)rail.scrollTop=s.railTop;window.scrollTo(s.windowX,s.windowY);};requestAnimationFrame(()=>requestAnimationFrame(run));}
  function emitOnce(reason,detail,state){if(!CX.bus?.emit)return {ok:false,reason:'bus_missing'};if(busy()){pending={reason,detail,state};return {ok:true,deferred:true};}pending=null;CX.bus.emit('visit-flow',Object.assign({reason,preserveUiState:true},detail||{}));restoreScroll(state);return {ok:true,deferred:false};}
  function flush(){if(!pending||busy())return false;const p=pending;pending=null;emitOnce(p.reason,p.detail,p.state);return true;}
  function applySilent(snapshot,runtime,reason){const fn=window.CX_TYA_APPLY_LIVE_SNAPSHOT;if(typeof fn!=='function')throw new Error('Adapter in-place no disponible');const state=capture(),original=CX.bus?.emit;let intercepted=0;if(original)CX.bus.emit=function(event,...args){if(event==='visit-flow'){intercepted++;return;}return original.call(CX.bus,event,...args);};try{return {result:fn(snapshot,runtime,{reason}),state,intercepted};}finally{if(original)CX.bus.emit=original;}}
  function recompose(reason){if(!fullVisual)return {ok:true,skipped:true};const fn=window.CX_TYA_REAPPLY_FULL_VISUAL_OVERLAY;if(typeof fn!=='function')return {ok:false,skipped:true,reason:'overlay_not_ready'};return fn(reason);}
  async function check(reason){
    if(checking)return {ok:true,skipped:true,reason:'check_in_progress'};checking=true;markUpdating();
    try{
      const meta=await getJson('meta',{fresh:'1'});if(meta.sourceSafe!==true||meta.runtimeRead!==true||!meta.revision)throw new Error('Respuesta live inválida');
      const changed=!currentRevision||meta.revision!==currentRevision;
      if(!changed){markLive(meta);if(fullVisual&&!window.CX_TYA_FULL_VISUAL_READY)recompose('same_revision_before_full_visual_ready');flush();failures=0;return {ok:true,changed:false,revision:meta.revision};}
      const snapshot=await getJson('json'),runtime=snapshot?._runtime?Object.assign({},meta,snapshot._runtime):meta;if(snapshot?._runtime)delete snapshot._runtime;
      const nextSignature=signature(snapshot);
      if(!currentContentSignature&&window.CX_TYA_HR_SOURCE_SAFE)currentContentSignature=signature(window.CX_TYA_HR_SOURCE_SAFE);
      if(currentContentSignature&&nextSignature===currentContentSignature){currentRevision=meta.revision;markLive(meta);failures=0;return {ok:true,changed:false,metadataRevisionChanged:true,revision:meta.revision,contentStable:true};}
      const applied=applySilent(snapshot,runtime,reason||'live_refresh');currentRevision=meta.revision;currentContentSignature=nextSignature;restoreModel(applied.state);
      const overlay=recompose('after_live_hr_change');markLive(meta);failures=0;
      const preload=reason==='full_visual_preload'||(!window.CX_TYA_FULL_VISUAL_READY&&fullVisual);
      if(preload){restoreScroll(applied.state);return {ok:true,changed:true,preload:true,revision:meta.revision,applied:applied.result,overlay};}
      const render=emitOnce(reason||'live_refresh',{sourceRevision:meta.revision,stableOverlay:overlay?.ok===true},applied.state);
      return {ok:true,changed:true,revision:meta.revision,applied:applied.result,overlay,render};
    }catch(error){markFailure(error);return {ok:false,error:String(error?.message||error)};}finally{checking=false;}
  }
  window.CX_TYA_REQUEST_STABLE_RERENDER=(reason,detail)=>emitOnce(reason||'manual_stable_rerender',detail||{},capture());
  window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER=flush;window.CX_TYA_CAPTURE_UI_STATE=capture;window.CX_TYA_CHECK_LIVE_SOURCE=check;
  if(window.CX_TYA_HR_LIVE_META?.runtimeRead===true)markLive(window.CX_TYA_HR_LIVE_META);else if(CX.dataSource){CX.dataSource.warnings=['Validando lectura HR viva…'];refreshBadge();}
  window.addEventListener('focus',()=>check('window_focus'));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check('visibility_resume');});document.addEventListener('focusout',()=>setTimeout(flush,0));window.addEventListener('load',()=>setTimeout(()=>check('initial_load'),300),{once:true});setInterval(()=>check('poll'),pollMs);
})();
