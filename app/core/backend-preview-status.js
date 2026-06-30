/* CXOrbia · Diagnóstico visual solo para Preview Backend DEV. No se carga en app/index.html. */
window.CX = window.CX || {};
(function(){
  function isPreview(){ return !!(CX.BACKEND && CX.BACKEND.previewMode); }
  function counts(){
    const d = CX.data || {};
    return {
      projects: Array.isArray(d.projects) ? d.projects.length : 0,
      visits: Array.isArray(d._visitas) ? d._visitas.length : 0,
      shoppers: Array.isArray(d.shoppers) ? d.shoppers.length : 0,
      posts: Array.isArray(d._posts) ? d._posts.length : 0,
      projectId: d.currentProjectId || ''
    };
  }
  function firebaseState(){
    try{
      const ready = !!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore);
      const user = ready && firebase.auth ? firebase.auth().currentUser : null;
      return {ready, email:user && user.email ? user.email : ''};
    }catch(_){ return {ready:false, email:''}; }
  }
  function ensurePill(){
    let pill = document.getElementById('cxBackendPreviewStatus');
    if(pill) return pill;
    pill = document.createElement('div');
    pill.id = 'cxBackendPreviewStatus';
    pill.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:99999;padding:10px 13px;border-radius:12px;font:600 12px system-ui,-apple-system,Segoe UI,sans-serif;background:#0d2740;color:#fff;box-shadow:0 8px 30px rgba(13,39,64,.22);max-width:360px;line-height:1.35;border:1px solid rgba(255,255,255,.18)';
    document.body.appendChild(pill);
    return pill;
  }
  function render(status){
    if(!isPreview() || !document.body) return;
    const c = counts();
    const f = firebaseState();
    const pill = ensurePill();
    const ok = status === 'ready' || (f.ready && c.projects > 0);
    const tone = ok ? '#16a05c' : status === 'error' ? '#c8232c' : '#d97706';
    pill.innerHTML = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:3px"><span style="width:8px;height:8px;border-radius:99px;background:'+tone+';display:inline-block"></span><b>Backend DEV '+(ok?'conectado':status === 'error'?'con error':'iniciando')+'</b></div>'+
      '<div>Proyecto: <b>'+(c.projectId || 'pendiente')+'</b> · Proyectos: '+c.projects+' · Visitas: '+c.visits+' · Shoppers: '+c.shoppers+' · Postulaciones: '+c.posts+'</div>'+
      '<div style="opacity:.75;margin-top:2px">Auth: '+(f.email || 'pendiente')+'</div>';
    window.CX_BACKEND_PREVIEW_STATUS = {status, counts:c, firebase:f, at:new Date().toISOString()};
  }
  function bindBus(){
    const bus = CX.bus;
    if(!bus || typeof bus.on !== 'function') return;
    ['backend-auth-ready','backend-ready','backend-error','backend-disabled','finance-read-bridge-ready'].forEach(function(evt){
      bus.on(evt, function(payload){
        render(evt === 'backend-error' ? 'error' : evt === 'backend-ready' ? 'ready' : 'starting');
        try{ console.info('[CX.backend-preview-status]', evt, payload || {}, window.CX_BACKEND_PREVIEW_STATUS); }catch(_){ }
      });
    });
  }
  function start(){
    if(!isPreview()) return;
    bindBus();
    render('starting');
    setTimeout(function(){ render('starting'); }, 1000);
    setTimeout(function(){ render('ready'); }, 3000);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
