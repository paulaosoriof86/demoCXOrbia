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

  function inferSource(status, eventName){
    if(status === 'ready' || eventName === 'backend-ready') return 'firestore';
    if(status === 'error' || eventName === 'backend-error') return 'localStorage/demo';
    if(eventName === 'backend-disabled') return 'localStorage/demo';
    if(window.CX_BACKEND_DATA_SOURCE) return window.CX_BACKEND_DATA_SOURCE;
    return 'pending';
  }

  function ensurePill(){
    let pill = document.getElementById('cxBackendPreviewStatus');
    if(pill) return pill;
    pill = document.createElement('div');
    pill.id = 'cxBackendPreviewStatus';
    pill.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:99999;padding:10px 13px;border-radius:12px;font:600 12px system-ui,-apple-system,Segoe UI,sans-serif;background:#0d2740;color:#fff;box-shadow:0 8px 30px rgba(13,39,64,.22);max-width:420px;line-height:1.35;border:1px solid rgba(255,255,255,.18)';
    document.body.appendChild(pill);
    return pill;
  }

  function render(status, payload, eventName){
    if(!isPreview() || !document.body) return;
    const c = counts();
    const f = firebaseState();
    const source = inferSource(status, eventName);
    const tenant = (payload && payload.tenantId) || (CX.BACKEND && CX.BACKEND.tenantId) || (CX.backend && CX.backend.tenantId && CX.backend.tenantId()) || 'pendiente';
    const isFirestore = source === 'firestore';
    const isError = status === 'error';
    const tone = isFirestore ? '#16a05c' : isError ? '#c8232c' : '#d97706';
    const label = isFirestore ? 'Firestore activo' : isError ? 'Usando demo/localStorage' : 'Validando fuente';
    const authLabel = f.email ? f.email : 'pendiente';

    STATE.status = status || STATE.status;
    STATE.source = source;
    STATE.tenantId = tenant;
    STATE.authEmail = f.email || '';
    STATE.lastEvent = eventName || STATE.lastEvent || '';
    STATE.lastError = payload && payload.message ? payload.message : STATE.lastError;
    STATE.at = new Date().toISOString();

    const pill = ensurePill();
    pill.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:3px"><span style="width:8px;height:8px;border-radius:99px;background:'+tone+';display:inline-block"></span><b>Backend DEV · '+label+'</b></div>'+
      '<div>Fuente: <b>'+source+'</b> · Tenant: <b>'+tenant+'</b> · Auth: <b>'+authLabel+'</b></div>'+
      '<div>Proyecto: <b>'+(c.projectId || 'pendiente')+'</b> · Proyectos: '+c.projects+' · Visitas: '+c.visits+' · Shoppers: '+c.shoppers+' · Postulaciones: '+c.posts+'</div>'+
      (STATE.lastError ? '<div style="opacity:.78;margin-top:2px">Último error: '+STATE.lastError+'</div>' : '');

    window.CX_BACKEND_PREVIEW_STATUS = {status:STATE.status, source, counts:c, firebase:f, tenantId:tenant, event:STATE.lastEvent, error:STATE.lastError, at:STATE.at};
  }

  function bindBus(){
    const bus = CX.bus;
    if(!bus || typeof bus.on !== 'function') return;
    const map = {
      'backend-auth-ready': 'starting',
      'backend-ready': 'ready',
      'backend-error': 'error',
      'backend-disabled': 'disabled',
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
    render('starting', {}, 'start');
    setTimeout(function(){ render(STATE.status || 'starting', {}, 'tick-1s'); }, 1000);
    setTimeout(function(){ render(STATE.status || 'starting', {}, 'tick-3s'); }, 3000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
