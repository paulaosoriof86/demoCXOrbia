/* ============================================================
   CXOrbia · Backend connection point V78 DISABLED
   ------------------------------------------------------------
   No importado por index.html.
   No reemplaza CX.data.
   No modifica módulos.
   No conecta backend.
   Define el punto único futuro para alternar fuente de datos.
   ============================================================ */
window.CX = window.CX || {};

CX.backendConnectionPointV78Disabled = (function(){
  const allowedSources = Object.freeze(['demo','local','backend-dev-preview','unavailable']);

  const state = {
    active:false,
    source:'unavailable',
    requestedSource:'local',
    tenantId:'tya',
    projectId:'tya-migration-dev',
    batchId:null,
    reason:'disabled connection point'
  };

  function clone(value){
    try { return JSON.parse(JSON.stringify(value)); }
    catch(e){ return value; }
  }

  function status(){
    return clone({
      active:state.active,
      source:state.source,
      requestedSource:state.requestedSource,
      tenantId:state.tenantId,
      projectId:state.projectId,
      batchId:state.batchId,
      reason:state.reason,
      allowedSources:allowedSources.slice()
    });
  }

  function canUseBackendPreview(){
    return false;
  }

  function resolveSource(requestedSource){
    const requested = allowedSources.includes(requestedSource) ? requestedSource : 'local';
    return {
      ok:false,
      requestedSource:requested,
      resolvedSource:'unavailable',
      reason:'connection point disabled'
    };
  }

  function passthroughLocal(methodName, args){
    return {
      ok:false,
      source:'unavailable',
      methodName:methodName,
      args:Array.prototype.slice.call(args || []),
      reason:'connection point disabled; keep existing CX.data behavior'
    };
  }

  return Object.freeze({
    status,
    canUseBackendPreview,
    resolveSource,
    passthroughLocal
  });
})();
