/* ============================================================
   CXOrbia · Corte 4 · CX.data Firestore READ-ONLY guard
   ------------------------------------------------------------
   Objetivo:
   - conservar exactamente la interfaz pública de CX.data;
   - permitir lectura desde un Firebase nuevo y vacío;
   - bloquear toda persistencia Firestore y toda acción operativa;
   - fallar cerrado sin volver silenciosamente al mock/localStorage.
   No toca módulos UI.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND = Object.assign(CX.BACKEND || {}, {
    readOnly:true,
    writeMode:'disabled',
    enableDataWrites:false,
    enableOperationalWrites:false,
    allowEmptyBackend:true,
    failClosedOnReadError:true,
    preserveCxDataInterface:true
  });

  const D = CX.data || {};
  const methodNames = ['addProject','setVisitState','assignVisit','payVisits','addShopper','updateShopper'];
  const originalMethods = {};
  methodNames.forEach(name=>{
    if(typeof D[name] === 'function') originalMethods[name] = D[name];
  });

  function emit(name, payload){
    if(CX.bus && typeof CX.bus.emit === 'function') CX.bus.emit(name, payload || {});
  }

  function blockedResult(action){
    const result = {
      ok:false,
      status:'blocked',
      readOnly:true,
      action,
      errors:['corte4-firestore-readonly'],
      reason:'Corte 4 permite lectura únicamente. No se ejecutó ninguna escritura.'
    };
    emit('backend-write-blocked', result);
    return result;
  }

  function restoreCxDataInterface(){
    if(!CX.data) return;
    Object.keys(originalMethods).forEach(name=>{
      CX.data[name] = originalMethods[name];
    });
    CX.data.__firebaseWrapped = false;
    CX.data.__corte4Readonly = true;
    CX.data.__backendWriteMode = 'disabled';
  }

  function blockDirectBackendWrites(){
    if(!CX.backend) return;
    CX.backend.writeProject = async function(){ return blockedResult('writeProject'); };
    CX.backend.writeShopper = async function(){ return blockedResult('writeShopper'); };
    CX.backend.writeVisit = async function(){ return blockedResult('writeVisit'); };
    CX.backend.writeMode = function(){ return 'disabled'; };
    CX.backend.isReadOnly = function(){ return true; };
  }

  function blockOperationalWrites(){
    const ns = CX.backendOperationalActions;
    if(!ns) return;
    const names = [
      'performOperationAction',
      'requestAssignVisit',
      'requestRescheduleVisit',
      'requestMarkVisitCompleted',
      'requestMarkQuestionnaire',
      'requestMarkSubmitted',
      'requestApplicationStatus'
    ];
    names.forEach(name=>{
      if(typeof ns[name] === 'function') ns[name] = async function(){ return blockedResult(name); };
    });
    ns.writesAllowed = function(){ return false; };
    ns.requiredDevWriteToken = null;
    ns.readOnly = true;
  }

  function syncDataSource(reason){
    if(!CX.dataSource) return;
    const verified = reason === 'verified-empty-read';
    const failed = reason === 'read-error-fail-closed';
    CX.dataSource.mode = 'connected';
    CX.dataSource.status = verified ? 'ready' : (failed ? 'degraded' : 'loading');
    CX.dataSource.sourceRef = 'firebase:protected-dev-corte4';
    CX.dataSource.updatedAt = new Date().toISOString();
    CX.dataSource.blockers = [];
    CX.dataSource.warnings = verified
      ? ['Firestore DEV verificado vacío; modo solo lectura.']
      : failed
        ? ['Lectura protegida no disponible en esta sesión; estado vacío fail-closed, sin fallback demo/localStorage.']
        : ['Esperando lectura protegida de Firestore DEV; datos demo/localStorage deshabilitados.'];
    emit('datasource', {mode:CX.dataSource.mode,status:CX.dataSource.status,sourceRef:CX.dataSource.sourceRef,reason});
  }

  function clearToBackendEmpty(reason){
    if(!CX.data) return;
    CX.data.projects = [];
    CX.data.periods = [];
    CX.data.__backendAllProjectRecords = [];
    CX.data.__backendPeriods = [];
    CX.data.shoppers = [];
    CX.data._visitas = [];
    CX.data._posts = [];
    CX.data.currentProjectId = '';
    CX.data.currentPeriodId = '';
    CX.data.__backendReadOnlyEmpty = {
      status:'empty',
      source:'firestore',
      reason:reason || 'empty-new-backend',
      at:new Date().toISOString(),
      readOnly:true,
      writes:false,
      fallbackUsed:false
    };
    window.CX_BACKEND_DATA_SOURCE = 'firestore';
    window.CX_BACKEND_LAST_STATE = Object.assign({}, window.CX_BACKEND_LAST_STATE || {}, {
      source:'firestore',
      empty:true,
      readOnly:true,
      writes:false,
      fallbackUsed:false,
      reason:reason || 'empty-new-backend'
    });
    syncDataSource(reason || 'empty-new-backend');
    emit('project', {source:'firestore', empty:true, readOnly:true});
    emit('shoppers', {source:'firestore', empty:true, readOnly:true});
    emit('visit-flow', {source:'firestore', empty:true, readOnly:true});
    emit('corte4-readonly-empty', CX.data.__backendReadOnlyEmpty);
  }

  function enforce(payload){
    restoreCxDataInterface();
    blockDirectBackendWrites();
    blockOperationalWrites();
    const counts = payload && payload.counts || {};
    const empty = payload && payload.empty === true || Number(counts.projects || 0) === 0;
    if(empty && cfg.allowEmptyBackend === true) clearToBackendEmpty('verified-empty-read');
    else if(CX.dataSource){
      CX.dataSource.mode='connected';
      CX.dataSource.status='ready';
      CX.dataSource.sourceRef='firebase:protected-dev-corte4';
      CX.dataSource.updatedAt=new Date().toISOString();
      CX.dataSource.warnings=[];
      CX.dataSource.blockers=[];
      emit('datasource',{mode:'connected',status:'ready',sourceRef:CX.dataSource.sourceRef});
    }
    window.CX_CORTE4_READONLY = {
      ready:true,
      source:window.CX_BACKEND_DATA_SOURCE || 'pending',
      empty:!!empty,
      readOnly:true,
      writeMode:'disabled',
      preserveCxDataInterface:true,
      fallbackUsed:false,
      at:new Date().toISOString()
    };
  }

  function failClosed(payload){
    restoreCxDataInterface();
    blockDirectBackendWrites();
    blockOperationalWrites();
    if(cfg.failClosedOnReadError === true) clearToBackendEmpty('read-error-fail-closed');
    window.CX_CORTE4_READONLY = {
      ready:false,
      source:'firestore-read-error',
      empty:true,
      readOnly:true,
      writeMode:'disabled',
      preserveCxDataInterface:true,
      fallbackUsed:false,
      error:payload && (payload.message || payload.error) || 'read-error',
      at:new Date().toISOString()
    };
  }

  function bind(){
    restoreCxDataInterface();
    blockDirectBackendWrites();
    blockOperationalWrites();
    /* P0-C4-VIS-01: vaciar seeds ANTES del primer render del shell. backend-firebase inicia
       primero y puede quedar esperando/rechazar Auth; este bind ocurre en el mismo DOMContentLoaded
       antes de app.js, así que el runtime nunca alcanza a pintar fixtures demo mientras se resuelve
       la lectura protegida. */
    if(cfg.previewMode === true && cfg.readOnly === true && cfg.failClosedOnReadError === true && cfg.allowEmptyBackend === true){
      clearToBackendEmpty('awaiting-protected-read');
    }
    if(!CX.bus || typeof CX.bus.on !== 'function') return;
    CX.bus.on('backend-loaded', payload=>enforce(payload));
    CX.bus.on('backend-ready', payload=>enforce(payload));
    CX.bus.on('backend-error', payload=>failClosed(payload));
  }

  window.CX_CORTE4_BLOCKED_WRITE = blockedResult;
  window.CX_CORTE4_ENFORCE_READONLY = enforce;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
