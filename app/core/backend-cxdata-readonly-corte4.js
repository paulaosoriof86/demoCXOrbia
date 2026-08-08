/* ============================================================
   CXOrbia · Corte 4 · CX.data READ-ONLY guard
   ------------------------------------------------------------
   Objetivo:
   - conservar exactamente la interfaz pública de CX.data;
   - bloquear toda persistencia y toda acción operativa;
   - Firestore protegido: fail-closed, sin fallback demo;
   - Validación humana DEV: preservar explícitamente el HR source-safe aprobado,
     sin pedir credenciales ni presentarlo como Firestore autenticado.
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
      errors:['corte4-readonly'],
      reason:'Este entorno permite lectura/validación únicamente. No se ejecutó ninguna escritura.'
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

  function isHumanVisualSourceSafe(){
    return cfg.previewMode === true && cfg.humanVisualSourceSafe === true && window.CX_TYA_HR_VIVA_SOURCE_SAFE === true;
  }

  function counts(){
    const d=CX.data||{};
    return {
      projects:Array.isArray(d.projects)?d.projects.length:0,
      periods:Array.isArray(d.projects)?d.projects.length:0,
      visits:Array.isArray(d._visitas)?d._visitas.length:0,
      shoppers:Array.isArray(d.shoppers)?d.shoppers.length:0,
      posts:Array.isArray(d._posts)?d._posts.length:0,
      projectId:d.currentProjectId||'',
      periodId:d.currentPeriodId||''
    };
  }

  function applyHumanSourceSafe(reason){
    restoreCxDataInterface();
    blockDirectBackendWrites();
    blockOperationalWrites();
    const c=counts();
    if(CX.dataSource){
      CX.dataSource.mode='source_safe_preview';
      CX.dataSource.status='ready';
      CX.dataSource.sourceRef='hr:tya-source-safe-human-visual-dev';
      CX.dataSource.updatedAt=new Date().toISOString();
      CX.dataSource.warnings=['Validación visual DEV con HR source-safe. Auth/RBAC y Firestore se verifican por gates técnicos separados; no hay fallback demo ni escrituras.'];
      CX.dataSource.blockers=[];
      emit('datasource',{mode:'source_safe_preview',status:'ready',sourceRef:CX.dataSource.sourceRef,reason:reason||'human-visual-source-safe'});
    }
    window.CX_BACKEND_DATA_SOURCE='hr-source-safe';
    window.CX_BACKEND_LAST_STATE={
      source:'hr-source-safe',
      empty:false,
      readOnly:true,
      writes:false,
      fallbackUsed:false,
      humanVisual:true,
      auth:'validated-separately',
      counts:c,
      reason:reason||'human-visual-source-safe',
      at:new Date().toISOString()
    };
    window.CX_CORTE4_READONLY={
      ready:true,
      source:'hr-source-safe',
      empty:false,
      readOnly:true,
      writeMode:'disabled',
      preserveCxDataInterface:true,
      fallbackUsed:false,
      humanVisual:true,
      at:new Date().toISOString()
    };
    emit('backend-source-safe-ready',{provider:'source-safe',tenantId:(cfg.tenantId||'tya'),source:'hr-source-safe',counts:c,readOnly:true,humanVisual:true,authValidatedSeparately:true});
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
        ? ['Lectura protegida no disponible; estado vacío fail-closed, sin fallback demo/localStorage.']
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
      status:'empty', source:'firestore', reason:reason || 'empty-new-backend', at:new Date().toISOString(),
      readOnly:true, writes:false, fallbackUsed:false
    };
    window.CX_BACKEND_DATA_SOURCE = 'firestore';
    window.CX_BACKEND_LAST_STATE = Object.assign({}, window.CX_BACKEND_LAST_STATE || {}, {
      source:'firestore', empty:true, readOnly:true, writes:false, fallbackUsed:false, reason:reason || 'empty-new-backend'
    });
    window.CX_CORTE4_READONLY = Object.assign({}, window.CX_CORTE4_READONLY || {}, {
      ready: reason === 'verified-empty-read', source:'firestore', empty:true, readOnly:true, writeMode:'disabled',
      preserveCxDataInterface:true, fallbackUsed:false, state:reason || 'empty-new-backend', at:new Date().toISOString()
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
    const countsPayload = payload && payload.counts || {};
    const empty = payload && payload.empty === true || Number(countsPayload.projects || 0) === 0;
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
    if(isHumanVisualSourceSafe()){
      applyHumanSourceSafe('provider-error-human-visual-source-safe-preserved');
      return;
    }
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

    /* P0 visual 2026-07-30: en el entrypoint humano no se vacía el snapshot source-safe ni se
       exige Auth interactivo. Es una ruta explícita y rotulada de validación visual; no un fallback. */
    if(isHumanVisualSourceSafe()){
      applyHumanSourceSafe('human-visual-source-safe');
    } else if(cfg.previewMode === true && cfg.readOnly === true && cfg.failClosedOnReadError === true && cfg.allowEmptyBackend === true){
      clearToBackendEmpty('awaiting-protected-read');
    }

    if(!CX.bus || typeof CX.bus.on !== 'function') return;
    CX.bus.on('backend-loaded', payload=>enforce(payload));
    CX.bus.on('backend-ready', payload=>enforce(payload));
    CX.bus.on('backend-error', payload=>failClosed(payload));
  }

  window.CX_CORTE4_BLOCKED_WRITE = blockedResult;
  window.CX_CORTE4_ENFORCE_READONLY = enforce;
  window.CX_CORTE4_APPLY_HUMAN_SOURCE_SAFE = applyHumanSourceSafe;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
