/* CXOrbia · Diagnóstico visual solo para Preview Backend DEV. No se carga en app/index.html. */
window.CX = window.CX || {};
(function(){
  const STATE = {
    status: 'starting',
    source: 'unknown',
    tenantId: '',
    authEmail: '',
    lastEvent: '',
    lastError: '',
    at: '',
  };

  function isPreview(){ return !!(CX.BACKEND && CX.BACKEND.previewMode); }

  function counts(){
    const d = CX.data || {};
    return {
      projects: Array.isArray(d.projects) ? d.projects.length : 0,
      visits: Array.isArray(d._visitas) ? d._visitas.length : 0,
      shoppers: Array.isArray(d.shoppers) ? d.shoppers.length : 0,
      posts: Array.isArray(d._posts) ? d._posts.length : 0,
      projectId: d.currentProjectId || '',
      periodId: d.currentPeriodId || '',
    };
  }

  function firebaseState(){
    try{
      const ready = !!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore);
      const authReady = !!(ready && firebase.auth);
      const user = authReady ? firebase.auth().currentUser : null;
      return {ready, authReady, email:user && user.email ? user.email : ''};
    }catch(_){ return {ready:false, authReady:false, email:''}; }
  }

  function finalAuthority(){
    return window.CX_PROTECTED_AUTH_HR_AUTHORITY && window.CX_PROTECTED_AUTH_HR_AUTHORITY.applied === true
      ? window.CX_PROTECTED_AUTH_HR_AUTHORITY
      : null;
  }

  function inferSource(status, eventName){
    if(finalAuthority()) return 'hr-live-all-periods+firestore-authenticated-exact-overlay';
    const live = window.CX_BACKEND_DATA_SOURCE || '';
    if(live && live !== 'localStorage/demo') return live;
    if(status === 'ready' || eventName === 'backend-ready' || eventName === 'backend-read-guard-ready') return 'firestore';
    if(status === 'error' || eventName === 'backend-error'){
      if(CX.BACKEND && CX.BACKEND.failClosedOnReadError === true) return 'firestore-read-error';
      return 'localStorage/demo';
    }
    if(eventName === 'backend-disabled') return (CX.BACKEND && CX.BACKEND.humanVisualSourceSafe) ? 'hr-source-safe' : 'localStorage/demo';
    if(live) return live;
    return 'pending';
  }

  function ensurePill(){
    let pill = document.getElementById('cxBackendPreviewStatus');
    if(pill) return pill;
    pill = document.createElement('div');
    pill.id = 'cxBackendPreviewStatus';
    pill.setAttribute('aria-hidden','true');
    pill.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:99999;padding:10px 13px;border-radius:12px;font:600 12px system-ui,-apple-system,Segoe UI,sans-serif;background:#0d2740;color:#fff;box-shadow:0 8px 30px rgba(13,39,64,.22);max-width:500px;line-height:1.35;border:1px solid rgba(255,255,255,.18);pointer-events:none;user-select:none';
    document.body.appendChild(pill);
    return pill;
  }

  function guardLine(){
    const g = window.CX_BACKEND_READ_GUARD || (CX.data && CX.data.__backendReadGuard);
    if(!g || g.status !== 'ok') return '';
    const cur = g.current || {};
    const totals = g.totals || {};
    const anomalies = Array.isArray(g.anomalies) ? g.anomalies.length : 0;
    const countries = Array.isArray(cur.countries) && cur.countries.length ? cur.countries.join('/') : 's/pais';
    return '<div>Guard CX.data: <b>ok</b> · Proyecto visitas: '+(cur.visits || 0)+' · Posts proyecto: '+(cur.posts || 0)+' · Países: '+countries+' · Alertas: '+anomalies+'</div>'+ 
      '<div style="opacity:.78">Totales normalizados: P '+(totals.projects || 0)+' · V '+(totals.visits || 0)+' · S '+(totals.shoppers || 0)+' · Post '+(totals.posts || 0)+'</div>';
  }

  function render(status, payload, eventName){
    if(!isPreview() || !document.body) return;
    const c = counts();
    const f = firebaseState();
    const authority = finalAuthority();
    const source = inferSource(status, eventName);
    const tenant = (payload && payload.tenantId) || (CX.BACKEND && CX.BACKEND.tenantId) || (CX.backend && CX.backend.tenantId && CX.backend.tenantId()) || 'tya';
    const isCanonical = !!authority;
    const isFirestore = source.indexOf('firestore') === 0;
    const isSourceSafe = source === 'hr-source-safe' || source.indexOf('source-safe') >= 0;
    const isError = status === 'error';
    const tone = isCanonical ? '#16a05c' : isFirestore ? (isError ? '#d97706' : '#16a05c') : isSourceSafe ? '#2a6fdb' : isError ? '#c8232c' : '#d97706';
    const label = isCanonical
      ? 'HR viva + overlay protegido'
      : isFirestore
        ? (isError ? 'Firestore protegido · sin fallback' : 'Firestore protegido · slice transitorio')
        : isSourceSafe ? 'HR source-safe · validación visual'
        : isError ? 'Fuente no disponible' : 'Validando fuente';
    const authLabel = isSourceSafe ? 'validado por gate separado' : (f.email ? 'autenticado' : 'pendiente');
    const periodsLabel = isCanonical ? String(authority.periods || c.projects) : 'pendiente';

    STATE.status = status || STATE.status;
    STATE.source = source;
    STATE.tenantId = tenant;
    STATE.authEmail = f.email || '';
    STATE.lastEvent = eventName || STATE.lastEvent || '';
    STATE.lastError = payload && payload.message ? payload.message : (isCanonical ? '' : STATE.lastError);
    STATE.at = new Date().toISOString();

    const pill = ensurePill();
    pill.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:3px"><span style="width:8px;height:8px;border-radius:99px;background:'+tone+';display:inline-block"></span><b>Backend DEV · '+label+'</b></div>'+ 
      '<div>Fuente: <b>'+source+'</b> · Tenant: <b>'+tenant+'</b> · Auth: <b>'+authLabel+'</b></div>'+ 
      '<div>Proyecto operativo: <b>'+(c.projectId || 'pendiente')+'</b> · Periodos HR: <b>'+periodsLabel+'</b> · Visitas: '+c.visits+' · Shoppers: '+c.shoppers+' · Postulaciones: '+c.posts+'</div>'+ 
      (!isCanonical && isFirestore ? '<div style="opacity:.78">Estado transitorio: esperando autoridad HR viva antes de considerar definitivas estas cifras.</div>' : '')+
      (authority && authority.firstPeriod && authority.latestPeriod ? '<div>Rango HR: <b>'+authority.firstPeriod+' → '+authority.latestPeriod+'</b></div>' : '')+
      (c.periodId ? '<div>Periodo activo: <b>'+c.periodId+'</b></div>' : '')+
      guardLine()+
      (STATE.lastError ? '<div style="opacity:.78;margin-top:2px">Último error: '+STATE.lastError+'</div>' : '');

    window.CX_BACKEND_PREVIEW_STATUS = {status:STATE.status, source, counts:c, firebase:f, tenantId:tenant, event:STATE.lastEvent, error:STATE.lastError, authority, at:STATE.at, guard:window.CX_BACKEND_READ_GUARD || null};
  }

  function bindBus(){
    const bus = CX.bus;
    if(!bus || typeof bus.on !== 'function') return;
    const map = {
      'backend-auth-ready': 'starting',
      'backend-ready': 'ready',
      'backend-read-guard-ready': 'ready',
      'backend-source-safe-ready': 'ready',
      'backend-error': 'error',
      'backend-disabled': 'ready',
      'finance-read-bridge-ready': 'starting',
    };
    Object.keys(map).forEach(function(evt){
      bus.on(evt, function(payload){
        render(map[evt], payload || {}, evt);
        try{ console.info('[CX.backend-preview-status]', evt, payload || {}, window.CX_BACKEND_PREVIEW_STATUS); }catch(_){ }
      });
    });
  }

  function start(){
    if(!isPreview()) return;
    bindBus();
    window.addEventListener('cx:protected-auth-hr-authority-ready', function(event){ render('ready', event.detail || {}, 'protected-auth-hr-authority-ready'); });
    window.addEventListener('cx:live-source-updated', function(event){ render(finalAuthority() ? 'ready' : 'starting', event.detail || {}, 'live-source-updated'); });
    render(finalAuthority() ? 'ready' : 'starting', {}, 'start');
    setTimeout(function(){ render(finalAuthority() ? 'ready' : (STATE.status || 'starting'), {}, 'tick-1s'); }, 1000);
    setTimeout(function(){ render(finalAuthority() ? 'ready' : (STATE.status || 'starting'), {}, 'tick-3s'); }, 3000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
