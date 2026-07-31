/* CXOrbia TyA Phase A — live source in-place freshness watcher.
   No UI module is modified. No document reload is permitted.

   Corte 6:
   - protected Firebase/Auth runtime owns CX.data and keeps watcher disabled;
   - human full visual is CUMULATIVE: live HR stays active and protected profile
     is re-applied after each HR refresh. */
window.CX = window.CX || {};
(function(){
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

  function refreshBadge(){
    try{
      const db=document.getElementById('tbDataBadge');
      if(db&&CX.dataSource){const b=CX.dataSource.badge();db.innerHTML='<span class="d" style="background:'+b.c+'"></span> '+b.t;}
    }catch(e){}
  }

  function markUpdating(){if(CX.dataSource){CX.dataSource.updating=true;CX.dataSource.runtimeReadActive=true;}refreshBadge();}

  function markLive(meta){
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;
    window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;
    if(CX.data){
      CX.data.sourceMode=fullVisualRequested?'tya_hr_live_plus_firestore_full_profile_dev':'tya_hr_live_runtime_source_safe_dev';
      CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
        generatedAt:meta.generatedAt||null,sourceReadAt:meta.sourceReadAt||null,
        runtimeReadActive:true,runtimeSyncActive:false,sourceRevision:meta.revision||null,revisionStable:meta.revisionStable===true,
        fullProfileVisual:fullVisualRequested||CX.data.previewMeta&&CX.data.previewMeta.fullProfileVisual===true,
        note:fullVisualRequested?'HR viva activa y auto-refrescable; perfil Firestore se conserva como overlay acumulativo.':'Lectura HR viva source-safe en runtime, aplicada sin recargar la página.'
      });
    }
    if(CX.dataSource){
      CX.dataSource.mode='connected';CX.dataSource.status='ready';
      CX.dataSource.sourceRef=fullVisualRequested?'hr-live+firestore-full-profile+canonical-finance':'hr-live-runtime:tya:cinepolis';
      CX.dataSource.updatedAt=meta.sourceReadAt||meta.generatedAt||new Date().toISOString();
      CX.dataSource.runtimeSyncActive=false;CX.dataSource.runtimeReadActive=true;CX.dataSource.updating=false;CX.dataSource.warnings=[];CX.dataSource.blockers=[];
      try{localStorage.setItem('cx_data_mode','connected');}catch(e){}
    }
    refreshBadge();
  }

  function markFailure(error){
    consecutiveFailures++;
    const message='Lectura HR viva no disponible: '+String(error&&error.message||error);
    if(CX.dataSource){CX.dataSource.updating=false;CX.dataSource.runtimeReadActive=consecutiveFailures<3;CX.dataSource.warnings=[message+' · Se conserva el último dato válido.'];if(consecutiveFailures>=3)CX.dataSource.status='degraded';}
    refreshBadge();
  }

  async function getJson(format,paramsInput={}){
    const query=new URLSearchParams({format,...paramsInput,ts:String(Date.now())});
    const response=await fetch(endpoint+(endpoint.includes('?')?'&':'?')+query.toString(),{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
    const json=await response.json().catch(()=>null);
    if(!response.ok)throw new Error('HTTP '+response.status+(json&&json.message?': '+json.message:''));
    return json;
  }

  function reapplyFullVisual(reason){
    if(!fullVisualRequested)return;
    const fn=window.CX_TYA_REAPPLY_FULL_VISUAL_OVERLAY;
    if(typeof fn==='function')fn(reason||'live_hr_refresh');
  }

  async function check(reason){
    if(checking)return;
    checking=true;markUpdating();
    try{
      const meta=await getJson('meta',{fresh:'1'});
      if(meta.sourceSafe!==true||meta.runtimeRead!==true||!meta.revision)throw new Error('Respuesta live inválida');
      const changed=!currentRevision||meta.revision!==currentRevision;
      if(changed){
        const snapshot=await getJson('json');
        const apply=window.CX_TYA_APPLY_LIVE_SNAPSHOT;
        if(typeof apply!=='function')throw new Error('Adapter in-place no disponible');
        const runtime=snapshot&&snapshot._runtime?Object.assign({},meta,snapshot._runtime):meta;
        if(snapshot&&snapshot._runtime)delete snapshot._runtime;
        apply(snapshot,runtime,{reason:reason||'live_refresh'});
        currentRevision=meta.revision;
        reapplyFullVisual('after_live_hr_change');
      }else{
        markLive(meta);
        if(fullVisualRequested&&!window.CX_TYA_FULL_VISUAL_READY)reapplyFullVisual('after_live_hr_same_revision');
      }
      consecutiveFailures=0;
    }catch(error){markFailure(error);}finally{checking=false;}
  }

  if(window.CX_TYA_HR_LIVE_META&&window.CX_TYA_HR_LIVE_META.runtimeRead===true)markLive(window.CX_TYA_HR_LIVE_META);
  else if(CX.dataSource){CX.dataSource.warnings=['Validando lectura HR viva…'];refreshBadge();}

  window.addEventListener('focus',()=>check('window_focus'));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check('visibility_resume');});
  window.addEventListener('load',()=>setTimeout(()=>check('initial_load'),300),{once:true});
  window.setInterval(()=>check('poll'),pollMs);
  window.CX_TYA_CHECK_LIVE_SOURCE=check;
})();
