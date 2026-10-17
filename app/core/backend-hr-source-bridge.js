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


  const pendingSyncs=new Map();
  function syncBlocked(code,extra={}){
    return {ok:false,status:'blocked',committed:false,providerAck:false,readbackVerified:false,
      successUiAllowed:false,providerWrites:0,localMutation:false,localStorageWrite:false,code,
      message:'No se pudo confirmar la sincronización de esta fuente y este proyecto.',...extra};
  }
  function captureSyncContext(projectId){
    const context=CX.backendAuth?.context?.(),user=window.firebase?.auth?.().currentUser;
    const pid=String(projectId||''),tenantId=String(context?.tenantId||'');
    const project=CX.hrSource?._projectRecord?.(pid),src=project?.operationalSource||project?.routeSource||{};
    const meta=CX.data?.previewMeta||{},authority=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
    const revision=String(CX.data?.__liveHrSourceRevision||'');
    if(context?.authenticated!==true||!user?.uid||context.authNamespace!=='staff'||!['super','admin'].includes(context.role)){
      return syncBlocked('HR_SYNC_AUTHORIZED_STAFF_REQUIRED');
    }
    if(!tenantId||!pid||pid!==String(CX.data?.currentProjectId)||!project||
      (project.tenantId&&String(project.tenantId)!==tenantId)||
      (context.role!=='super'&&!(context.projectIds||[]).map(String).includes(pid))){
      return syncBlocked('HR_SYNC_PROJECT_SCOPE_REQUIRED');
    }
    if(src.mode!=='external'||src.readPolicy!=='external_live'||
      !String(src.providerBindingId||src.integrationSettingId||src.providerRef||'').trim()||!String(src.mappingRef||'').trim()){
      return syncBlocked('HR_SYNC_LIVE_SOURCE_CONFIG_REQUIRED');
    }
    if(!/^[a-f0-9]{64}$/.test(revision)||String(meta.sourceRevision||'')!==revision||meta.hrAuthority!==true||
      String(meta.tenantId)!==tenantId||String(meta.projectId)!==pid||
      authority.applied!==true||String(authority.actorUid)!==String(user.uid)||
      authority.role!==context.role||authority.authNamespace!==context.authNamespace||
      String(authority.tenantId)!==tenantId||String(authority.projectId)!==pid){
      return syncBlocked('HR_SYNC_VERIFIED_SOURCE_REVISION_REQUIRED');
    }
    if(CX.BACKEND?.enableCommandWrites!==true||typeof CX.commandAdapter?.execute!=='function'){
      return syncBlocked('HR_SYNC_COMMAND_WRITES_DISABLED');
    }
    return {ok:true,context,user,uid:String(user.uid),role:context.role,authNamespace:context.authNamespace,tenantId,projectId:pid,revision};
  }
  function sameSyncContext(capture){
    const current=captureSyncContext(capture.projectId);
    return current.ok===true&&current.context===capture.context&&current.user===capture.user&&
      current.uid===capture.uid&&current.tenantId===capture.tenantId&&current.revision===capture.revision&&
      current.role===capture.role&&current.authNamespace===capture.authNamespace;
  }
  function canonicalSync(payload){
    const capture=captureSyncContext(payload.projectId);
    if(!capture.ok)return Promise.resolve(capture);
    const scopeKey=JSON.stringify([capture.uid,capture.tenantId,capture.projectId,capture.revision]);
    let pending=pendingSyncs.get(scopeKey);
    if(pending?.promise)return pending.promise;
    if(!pending){
      if(!window.crypto?.randomUUID)return Promise.resolve(syncBlocked('HR_SYNC_IDEMPOTENCY_UNAVAILABLE'));
      pending={idempotencyKey:'hr-sync-'+window.crypto.randomUUID(),promise:null};
      pendingSyncs.set(scopeKey,pending);
    }
    const command={
      commandType:'hr.snapshot.reconcile',entityType:'hrSnapshot',entityId:capture.revision,
      tenantId:capture.tenantId,projectId:capture.projectId,periodId:null,requireProject:true,requirePeriod:false,
      expectedVersion:capture.revision,idempotencyKey:pending.idempotencyKey,payload:{},
      source:'hr-source-sync-request',authorization:{providerEnforcementRequired:true}
    };
    const task=(async()=>{
      let result;
      try{
        result=await CX.commandAdapter.execute(command);
        const resume=String(result?.resumeIdempotencyKey||'');
        if(result?.code==='HR_RECONCILIATION_SCOPE_BUSY'&&resume.length>=16&&resume.length<=200&&resume!==pending.idempotencyKey&&sameSyncContext(capture)){
          pending.idempotencyKey=resume;
          result=await CX.commandAdapter.execute({...command,idempotencyKey:resume});
        }
      }
      catch(_){result=syncBlocked('HR_SYNC_TRANSPORT_OUTCOME_UNKNOWN',{providerWrites:null});}
      if(result?.code==='COMMAND_TRANSPORT_ERROR')result={...result,providerWrites:null,code:'HR_SYNC_TRANSPORT_OUTCOME_UNKNOWN'};
      let expectedReceiptPath='';
      try{
        const input=new TextEncoder().encode(JSON.stringify([capture.projectId,pending.idempotencyKey]));
        const digest=new Uint8Array(await window.crypto.subtle.digest('SHA-256',input));
        expectedReceiptPath='tenants/'+capture.tenantId+'/commandReceipts/hr-'+Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('');
      }catch(_){}
      const binding=result?.receiptBinding||{},receiptParts=String(result?.receiptPath||'').split('/');
      const bound=Boolean(expectedReceiptPath)&&result.receiptPath===expectedReceiptPath&&receiptParts.length===4&&receiptParts[0]==='tenants'&&receiptParts[1]===capture.tenantId&&
        receiptParts[2]==='commandReceipts'&&/^hr-[a-f0-9]{64}$/.test(receiptParts[3])&&
        binding.tenantId===capture.tenantId&&binding.projectId===capture.projectId&&binding.sourceRevision===capture.revision&&
        binding.actorUid===capture.uid&&binding.idempotencyKey===pending.idempotencyKey&&binding.commandType==='hr.snapshot.reconcile';
      const confirmed=result?.ok===true&&result?.status==='committed'&&result?.committed===true&&
        result?.providerAck===true&&result?.readbackVerified===true&&result?.successUiAllowed===true&&
        result?.unresolvedEffects===0&&result?.unverifiedEffects===0&&
        result?.sourceRevision===capture.revision&&result?.tenantId===capture.tenantId&&
        result?.projectId===capture.projectId&&bound;
      const response=confirmed?{
        ...result,viewRefreshVerified:false,viewRefresh:'pending',
        message:result.identityReviewRequired?'Sincronización confirmada con casos pendientes de revisión; actualización de vista pendiente.':'Sincronización confirmada; actualización de vista pendiente.'
      }:{
        ...syncBlocked('HR_SYNC_ACK_READBACK_REQUIRED'),...result,ok:false,committed:false,providerAck:false,
        providerWrites:Object.prototype.hasOwnProperty.call(result||{},'providerWrites')?result.providerWrites:null,
        successUiAllowed:false,message:result?.status==='partial'?'La sincronización quedó parcial. El recibo conserva los efectos confirmados.':'No se recibió una confirmación completa de la sincronización.'
      };
      response.contextCurrent=sameSyncContext(capture);
      response.publishUiAllowed=response.contextCurrent;
      if(response.contextCurrent)CX.backendHrSourceBridge.last={kind:'sync-request',payload:{projectId:capture.projectId,sourceRevision:capture.revision,idempotencyKey:pending.idempotencyKey},response,at:now()};
      // Retain the same key after an uncertain/partial response. A confirmed new click is a new operation.
      if(confirmed)pendingSyncs.delete(scopeKey);
      return response;
    })();
    pending.promise=task.finally(()=>{pending.promise=null;});
    return pending.promise;
  }

  async function handle(kind, payload){
    payload = payload || {};
    if(kind==='sync-request'&&CX.hrSource?._canonical?.()===true)return canonicalSync(payload);
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

  CX.backendHrSourceBridge = { attach, handle, normalizeResponse, getBackendConfig, captureSyncContext, sameSyncContext, last: null };
  if(!attach()){
    let tries = 0;
    const t = setInterval(()=>{ tries++; if(attach() || tries > 40) clearInterval(t); }, 250);
  }
})();
