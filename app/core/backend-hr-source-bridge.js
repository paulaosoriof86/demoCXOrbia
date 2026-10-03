/* CXOrbia backend HR source bridge
   Listens to HR source UI events and routes them to a backend endpoint when configured.
   No Firestore writes are performed in this browser bridge. */
(function(){
  window.CX = window.CX || {};

  const VALID_STATUS = new Set([
    'pendiente_backend','connected','auth_error','not_found','empty_range','schema_changed',
    'parsed_with_warnings','blocked','ready_for_preview','ready_for_import'
  ]);

  function now(){ return new Date().toISOString(); }

  function getBackendConfig(){
    const b = CX.BACKEND || {};
    return {
      enabled: !!b.enabled,
      tenantId: b.tenantId || 'tya',
      projectId: b.defaultProjectId || null,
      hrSourceEndpoint: b.hrSourceEndpoint || (b.endpoints && b.endpoints.hrSource) || '',
      env: b.env || 'dev'
    };
  }

  function issue(code, message, severity){
    return {
      codigo: code,
      code: code,
      periodo: 'backend',
      severidad: severity || 'medio',
      severity: severity || 'warning',
      expected: 'configured_backend_endpoint',
      detected: 'pending',
      delta: 1,
      sourceRow: '',
      accion: message
    };
  }

  function normalizeIssue(item){
    item = item || {};
    return {
      codigo: item.codigo || item.code || 'hr_source_issue',
      code: item.code || item.codigo || 'hr_source_issue',
      periodo: item.periodo || item.sourceTab || item.period || item.tab || 'backend',
      severidad: item.severidad || item.severity || 'medio',
      severity: item.severity || item.severidad || 'warning',
      expected: item.expected != null ? item.expected : '',
      detected: item.detected != null ? item.detected : '',
      delta: item.delta != null ? item.delta : '',
      sourceRow: item.sourceRow || item.row || '',
      accion: item.accion || item.action || item.message || ''
    };
  }

  function normalizeResponse(kind, payload, raw){
    const r = raw || {};
    const status = VALID_STATUS.has(r.status) ? r.status : 'pendiente_backend';
    return {
      status,
      sourceType: r.sourceType || payload.sourceType || 'google_sheets',
      sourceRef: r.sourceRef || r.providerBindingId || payload.sourceRef || '',
      providerBindingId: r.providerBindingId || r.sourceRef || payload.sourceRef || '',
      mappingRef: r.mappingRef || payload.mappingRef || payload.mappingContract || '',
      maskedUrl: r.maskedUrl || payload.maskedUrl || '',
      providerAck: r.providerAck===true || Boolean(r.providerBindingId||r.sourceRef),
      periodsDetected: Array.isArray(r.periodsDetected) ? r.periodsDetected : (Array.isArray(r.periodos) ? r.periodos : []),
      counts: r.counts || {},
      issues: Array.isArray(r.issues) ? r.issues.map(normalizeIssue) : [],
      canImport: !!r.canImport,
      ultimaLectura: r.ultimaLectura || r.readAt || now(),
      ultimoPreview: kind === 'preview' ? (r.ultimoPreview || r.previewAt || now()) : (r.ultimoPreview || null),
      message: r.message || ''
    };
  }

  function localPending(kind, payload){
    const cfg = getBackendConfig();
    const label = kind === 'register' ? 'Registrar fuente' : kind === 'test' ? 'Probar conexion' : kind === 'preview' ? 'Generar preview' : 'Solicitar sync';
    return normalizeResponse(kind, payload, {
      status: 'pendiente_backend',
      sourceType: payload.sourceType,
      sourceRef: payload.sourceRef,
      maskedUrl: payload.maskedUrl,
      counts: {},
      periodsDetected: [],
      canImport: false,
      issues: [issue('backend_endpoint_missing', label + ': endpoint backend pendiente en ' + cfg.env, 'medio')],
      message: 'Endpoint backend HR pendiente.'
    });
  }

  async function callEndpoint(kind, payload){
    const cfg = getBackendConfig();
    if(!cfg.hrSourceEndpoint) return localPending(kind, payload);
    const body = {
      action: kind,
      tenantId: cfg.tenantId,
      projectId: payload.projectId || cfg.projectId,
      sourceType: payload.sourceType,
      sourceRef: payload.sourceRef,
      maskedUrl: payload.maskedUrl || '',
      urlPending: payload.urlPending || '',
      requestedAt: payload.requestedAt || now(),
      env: cfg.env
    };
    if(kind==='register'&&payload.privateSourceUrl)body.privateSourceUrl=String(payload.privateSourceUrl);
    const res = await fetch(cfg.hrSourceEndpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body),
      credentials: 'include'
    });
    if(!res.ok){
      return normalizeResponse(kind, payload, {
        status: res.status === 401 || res.status === 403 ? 'auth_error' : 'blocked',
        canImport: false,
        issues: [issue('backend_http_'+res.status, 'Respuesta HTTP no exitosa del backend HR', 'alto')],
        message: 'Backend HR HTTP '+res.status
      });
    }
    return normalizeResponse(kind, payload, await res.json());
  }

  async function applyToUi(kind, payload, response){
    const pid = payload.projectId || (CX.data && CX.data.currentProjectId) || 'cinepolis';
    if(!CX.hrSource || typeof CX.hrSource.get !== 'function' || typeof CX.hrSource.save !== 'function') return;
    const current = CX.hrSource.get(pid);
    const next={
      tipo: response.sourceType || current.tipo,
      sourceRef: response.sourceRef || current.sourceRef,
      providerBindingId: response.providerBindingId || response.sourceRef || current.providerBindingId || current.sourceRef,
      mappingRef: response.mappingRef || current.mappingRef || current.mappingContract || '',
      maskedUrl: response.maskedUrl || current.maskedUrl,
      estado: response.status,
      ultimaLectura: response.ultimaLectura || current.ultimaLectura,
      ultimoPreview: response.ultimoPreview || current.ultimoPreview,
      periodos: response.periodsDetected || current.periodos || [],
      counts: response.counts || current.counts || {},
      incidencias: response.issues || current.incidencias || [],
      canImport: !!response.canImport
    };
    const persisted=await Promise.resolve(CX.hrSource.save(pid,next,{reason:'hr-source-backend-'+kind}));
    response.projectPersistence=persisted||null;
    if(CX.hrSource._canonical?.()&&response.providerAck===true&&!(persisted&&persisted.ok===true&&persisted.providerAck===true&&persisted.readbackVerified===true)){
      response.status='blocked';response.canImport=false;response.message='La fuente respondió, pero la configuración del proyecto no obtuvo ACK/readback durable.';
    }
    if(CX.ui && CX.ui.toast){
      const msg = response.message || ('HR backend: '+response.status);
      const tone = response.status === 'ready_for_import' || response.status === 'ready_for_preview' ? 'ok' : (response.status === 'blocked' || response.status === 'auth_error' ? 'warn' : '');
      CX.ui.toast(msg, tone, 3600);
    }
  }

  async function handle(kind, payload){
    payload = payload || {};
    try{
      const response = await callEndpoint(kind, payload);
      await applyToUi(kind, payload, response);
      const safePayload={projectId:payload.projectId,sourceType:payload.sourceType,sourceRef:payload.sourceRef||'',mappingRef:payload.mappingRef||payload.mappingContract||'',requestedAt:payload.requestedAt};
      CX.backendHrSourceBridge.last = {kind,payload:safePayload,response,at:now()};
      return response;
    }catch(err){
      const response = normalizeResponse(kind, payload, {
        status: 'blocked',
        canImport: false,
        issues: [issue('backend_bridge_exception', err && err.message ? err.message : 'Bridge exception', 'alto')],
        message: 'Error en puente backend HR.'
      });
      await applyToUi(kind, payload, response);
      const safePayload={projectId:payload.projectId,sourceType:payload.sourceType,sourceRef:payload.sourceRef||'',mappingRef:payload.mappingRef||payload.mappingContract||'',requestedAt:payload.requestedAt};
      CX.backendHrSourceBridge.last = {kind,payload:safePayload,response,error:String(err),at:now()};
      return response;
    }
  }

  function attach(){
    if(!CX.bus || typeof CX.bus.on !== 'function') return false;
    if(attach.done) return true;
    CX.bus.on('hr-source:register', payload => handle('register', payload));
    CX.bus.on('hr-source:test', payload => handle('test', payload));
    CX.bus.on('hr-source:preview', payload => handle('preview', payload));
    CX.bus.on('hr-source:sync-request', payload => handle('sync-request', payload));
    attach.done = true;
    return true;
  }

  CX.backendHrSourceBridge = { attach, handle, normalizeResponse, getBackendConfig, last: null };
  if(!attach()){
    let tries = 0;
    const t = setInterval(()=>{ tries++; if(attach() || tries > 40) clearInterval(t); }, 250);
  }
})();
