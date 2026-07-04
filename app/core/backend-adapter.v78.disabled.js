/* ============================================================
   CXOrbia · Backend adapter scaffold V78 DISABLED
   ------------------------------------------------------------
   Estado: NO importado por index.html y NO conectado a CX.data.
   Objetivo: fijar la forma del adapter futuro sin cambiar módulos.
   ============================================================ */
window.CX = window.CX || {};

CX.backendAdapterV78Disabled = (function(){
  const state = {
    enabled:false,
    source:'disabled',
    tenantId:'tya',
    projectId:'tya-migration-dev',
    batchId:null,
    lastError:null
  };

  function clone(value){
    try{return JSON.parse(JSON.stringify(value));}
    catch(e){return value;}
  }

  function status(){
    return clone({
      enabled:state.enabled,
      source:state.source,
      tenantId:state.tenantId,
      projectId:state.projectId,
      batchId:state.batchId,
      lastError:state.lastError
    });
  }

  function previewRoot(){
    if(!state.batchId) return null;
    return 'tenants/'+state.tenantId+'/projects/'+state.projectId+'/migrationPreview/'+state.batchId;
  }

  function routes(){
    const root=previewRoot();
    return {
      batch: state.batchId ? 'tenants/'+state.tenantId+'/migrationBatches/'+state.batchId : null,
      visits: root ? root+'/visits' : null,
      shoppers: root ? root+'/shoppers' : null,
      communicationsHistory: root ? root+'/communicationsHistory' : null,
      operativeCandidates: root ? root+'/operativeCandidates' : null
    };
  }

  function unavailableResult(reason){
    return { ok:false, source:'disabled', reason:reason||'backend adapter disabled', data:null };
  }

  const api = {
    status,
    routes,
    project(){ return unavailableResult('project backend read disabled'); },
    projects(){ return unavailableResult('projects backend read disabled'); },
    visitas(){ return unavailableResult('visits backend read disabled'); },
    posts(){ return unavailableResult('posts backend read disabled'); },
    shoppers(){ return unavailableResult('shoppers backend read disabled'); },
    shoppersFor(){ return unavailableResult('shoppersFor backend read disabled'); },
    getShopper(){ return unavailableResult('getShopper backend read disabled'); },
    addShopper(){ return unavailableResult('addShopper backend write disabled'); },
    updateShopper(){ return unavailableResult('updateShopper backend write disabled'); },
    assignVisit(){ return unavailableResult('assignVisit backend write disabled'); },
    postularVisita(){ return unavailableResult('postularVisita backend write disabled'); },
    setProject(){ return unavailableResult('setProject backend write disabled'); }
  };

  return Object.freeze(api);
})();
