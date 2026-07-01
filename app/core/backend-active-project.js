/* CXOrbia · Active project scope for backend preview DEV. */
window.CX = window.CX || {};
(function(){
  const ACTIVE = 'cinepolis-abril-26';

  function isPreview(){ return !!(CX.BACKEND && CX.BACKEND.previewMode === true); }
  function emit(name, payload){ if(CX.bus && typeof CX.bus.emit === 'function') CX.bus.emit(name, payload || {}); }
  function list(){ return (CX.BACKEND && Array.isArray(CX.BACKEND.previewProjectIds) && CX.BACKEND.previewProjectIds.length) ? CX.BACKEND.previewProjectIds : [ACTIVE]; }

  function setConfig(){
    if(!isPreview()) return;
    CX.BACKEND.defaultProjectId = CX.BACKEND.defaultProjectId || ACTIVE;
    CX.BACKEND.previewProjectIds = list();
    CX.BACKEND.projectScopeMode = 'active-preview';
  }

  function applyScope(){
    if(!isPreview() || !CX.data) return null;
    if(window.CX_BACKEND_DATA_SOURCE !== 'firestore') return null;

    const ids = new Set(list());
    const D = CX.data;
    if(!D.__backendAllProjects) D.__backendAllProjects = Array.isArray(D.projects) ? D.projects.slice() : [];
    if(!D.__backendAllVisits) D.__backendAllVisits = Array.isArray(D._visitas) ? D._visitas.slice() : [];
    if(!D.__backendAllPosts) D.__backendAllPosts = Array.isArray(D._posts) ? D._posts.slice() : [];

    D.projects = D.__backendAllProjects.filter(p=>p && ids.has(p.id));
    D._visitas = D.__backendAllVisits.filter(v=>v && ids.has(v.projectId));
    D._posts = D.__backendAllPosts.filter(p=>p && ids.has(p.projectId));
    D.currentProjectId = D.projects[0] ? D.projects[0].id : (CX.BACKEND.defaultProjectId || ACTIVE);

    window.CX_BACKEND_PROJECT_SCOPE = {
      mode:'active-preview',
      ids:Array.from(ids),
      currentProjectId:D.currentProjectId,
      counts:{projects:D.projects.length, visits:D._visitas.length, posts:D._posts.length},
      at:new Date().toISOString()
    };

    emit('project', {source:'firebase-scope'});
    emit('visit-flow', {source:'firebase-scope'});
    emit('backend-project-scope-ready', window.CX_BACKEND_PROJECT_SCOPE);

    if(typeof window.CX_BACKEND_RUN_READ_GUARD === 'function'){
      setTimeout(function(){ window.CX_BACKEND_RUN_READ_GUARD(); }, 0);
    }
    return window.CX_BACKEND_PROJECT_SCOPE;
  }

  function bind(){
    setConfig();
    if(CX.bus && typeof CX.bus.on === 'function'){
      CX.bus.on('backend-ready', function(){ setTimeout(applyScope, 25); });
      CX.bus.on('backend-read-guard-ready', function(){ setTimeout(applyScope, 25); });
    }
    setTimeout(applyScope, 1200);
    setTimeout(applyScope, 3500);
  }

  window.CX_BACKEND_APPLY_PROJECT_SCOPE = applyScope;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
