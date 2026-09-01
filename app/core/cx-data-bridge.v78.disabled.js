/* ============================================================
   CXOrbia · CX.data bridge V78 DISABLED
   ------------------------------------------------------------
   No importado por index.html.
   No reemplaza CX.data.
   No modifica módulos.
   No conecta backend.
   Define la cadena futura:
   CX.data -> connection point -> backend adapter -> fallback local.
   ============================================================ */
window.CX = window.CX || {};

CX.dataBridgeV78Disabled = (function(){
  const state = {
    enabled:false,
    source:'disabled',
    tenantId:'tya',
    projectId:'tya-migration-dev',
    batchId:null,
    bridgeMode:'observe-only'
  };

  function clone(value){
    try { return JSON.parse(JSON.stringify(value)); }
    catch(e){ return value; }
  }

  function getConnectionPoint(){
    return CX.backendConnectionPointV78Disabled || null;
  }

  function getAdapter(){
    return CX.backendAdapterV78Disabled || null;
  }

  function status(){
    const connectionPoint = getConnectionPoint();
    const adapter = getAdapter();
    return clone({
      enabled:state.enabled,
      source:state.source,
      tenantId:state.tenantId,
      projectId:state.projectId,
      batchId:state.batchId,
      bridgeMode:state.bridgeMode,
      hasConnectionPoint:!!connectionPoint,
      hasAdapter:!!adapter,
      connectionStatus:connectionPoint && connectionPoint.status ? connectionPoint.status() : null,
      adapterStatus:adapter && adapter.status ? adapter.status() : null
    });
  }

  function resolve(methodName, args){
    const connectionPoint = getConnectionPoint();
    const adapter = getAdapter();
    return {
      ok:false,
      source:'disabled',
      methodName:methodName,
      args:Array.prototype.slice.call(args || []),
      hasConnectionPoint:!!connectionPoint,
      hasAdapter:!!adapter,
      reason:'bridge disabled; keep current CX.data behavior'
    };
  }

  function wrap(methodName){
    return function(){
      return resolve(methodName, arguments);
    };
  }

  return Object.freeze({
    status,
    resolve,
    project:wrap('project'),
    projects:wrap('projects'),
    projectsFor:wrap('projectsFor'),
    setProject:wrap('setProject'),
    visitas:wrap('visitas'),
    posts:wrap('posts'),
    shoppers:wrap('shoppers'),
    shoppersFor:wrap('shoppersFor'),
    getShopper:wrap('getShopper'),
    addShopper:wrap('addShopper'),
    updateShopper:wrap('updateShopper'),
    assignVisit:wrap('assignVisit'),
    postularVisita:wrap('postularVisita')
  });
})();
