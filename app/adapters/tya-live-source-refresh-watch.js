/* CXOrbia TyA Phase A — live source freshness watcher.
   Build overlay only: no UI module is modified. */
window.CX = window.CX || {};
(function(){
  const endpoint=window.CX_TYA_LIVE_SOURCE_URL||'/api/tya/cinepolis/hr-live';
  const pollMs=Math.max(30000,Number(window.CX_TYA_LIVE_POLL_MS||60000));
  let currentRevision=window.CX_TYA_HR_LIVE_META&&window.CX_TYA_HR_LIVE_META.revision||null;
  let checking=false;
  let reloadRequested=false;

  function refreshBadge(){
    try{
      const db=document.getElementById('tbDataBadge');
      if(db&&CX.dataSource){const b=CX.dataSource.badge();db.innerHTML='<span class="d" style="background:'+b.c+'"></span> '+b.t;}
    }catch(e){}
  }

  function markLive(meta){
    window.CX_TYA_HR_VIVA_SOURCE_SAFE=true;
    window.CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=false;
    if(CX.data){
      CX.data.sourceMode='tya_hr_live_runtime_source_safe_dev';
      CX.data.previewMeta=Object.assign({},CX.data.previewMeta||{}, {
        generatedAt:meta.generatedAt||null,
        runtimeReadActive:true,
        runtimeSyncActive:false,
        sourceRevision:meta.revision||null,
        note:'Lectura HR viva source-safe en runtime. No escribe la HR ni materializa datos.'
      });
    }
    if(CX.dataSource){
      CX.dataSource.mode='connected';
      CX.dataSource.status='ready';
      CX.dataSource.sourceRef='hr-live-runtime:tya:cinepolis';
      CX.dataSource.updatedAt=meta.generatedAt||new Date().toISOString();
      CX.dataSource.runtimeSyncActive=false;
      CX.dataSource.runtimeReadActive=true;
      CX.dataSource.warnings=[];
      CX.dataSource.blockers=[];
      try{localStorage.setItem('cx_data_mode','connected');}catch(e){}
    }
    refreshBadge();
  }

  function markStale(message){
    if(CX.dataSource){
      CX.dataSource.status='degraded';
      CX.dataSource.runtimeReadActive=false;
      CX.dataSource.warnings=[message||'La lectura viva de la HR no está disponible. Los datos visibles pueden estar vencidos.'];
    }
    refreshBadge();
  }

  async function check(reason){
    if(checking||reloadRequested)return;
    checking=true;
    try{
      const url=endpoint+(endpoint.includes('?')?'&':'?')+'format=meta&ts='+Date.now();
      const response=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store','Pragma':'no-cache'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const meta=await response.json();
      if(meta.sourceSafe!==true||meta.runtimeRead!==true||!meta.revision)throw new Error('Respuesta live inválida');
      markLive(meta);
      if(currentRevision&&meta.revision!==currentRevision){
        reloadRequested=true;
        try{sessionStorage.setItem('cx_live_source_reload_reason',reason||'source_changed');}catch(e){}
        location.reload();
        return;
      }
      currentRevision=meta.revision;
    }catch(error){
      markStale('Lectura HR viva no disponible: '+String(error&&error.message||error));
    }finally{
      checking=false;
    }
  }

  if(window.CX_TYA_HR_LIVE_META&&window.CX_TYA_HR_LIVE_META.runtimeRead===true)markLive(window.CX_TYA_HR_LIVE_META);
  else markStale('El build no recibió una revisión HR viva al iniciar.');

  window.addEventListener('focus',()=>check('window_focus'));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check('visibility_resume');});
  setInterval(()=>check('poll'),pollMs);
  window.CX_TYA_CHECK_LIVE_SOURCE=check;
})();
