/* ============================================================
   CXOrbia · Firebase backend adapter (scaffold seguro)
   ------------------------------------------------------------
   Mantiene CX.data como interfaz estable.
   No toca módulos UI.
   No se activa si CX.BACKEND.enabled !== true.
   Preview DEV: puede autenticarse solo si se habilita por config
   separada y token de preview, sin guardar datos sensibles en repo.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND || {};
  const col = cfg.collections || {};
  let app = null;
  let db = null;
  let started = false;
  let original = null;

  function emit(name, payload){ if(CX.bus) CX.bus.emit(name, payload || {}); }
  function warn(){ console.warn.apply(console, ['[CX.backend]'].concat([].slice.call(arguments))); }
  function markSource(source, extra){
    window.CX_BACKEND_DATA_SOURCE = source;
    window.CX_BACKEND_LAST_STATE = Object.assign({source, at:new Date().toISOString(), tenantId:tenantId()}, extra || {});
  }

  function clean(obj){
    if(Array.isArray(obj)) return obj.map(clean);
    if(!obj || typeof obj !== 'object') return obj;
    const out = {};
    Object.keys(obj).forEach(k=>{
      const v = obj[k];
      if(v === undefined || typeof v === 'function') return;
      out[k] = clean(v);
    });
    return out;
  }

  function tenantId(){ return cfg.tenantId || 'tya'; }
  function tenantsCol(){ return db.collection(col.tenants || 'tenants'); }
  function tenantRef(){ return tenantsCol().doc(tenantId()); }
  function projectsCol(){ return tenantRef().collection(col.projects || 'projects'); }
  function projectRef(projectId){ return projectsCol().doc(projectId); }
  function subCol(projectId, name){ return projectRef(projectId).collection(col[name] || name); }
  function shoppersCol(){ return tenantRef().collection(col.shoppers || 'shoppers'); }

  function docData(d){ return Object.assign({id:d.id}, d.data() || {}); }
  async function getAll(q){ const snap = await q.get(); return snap.docs.map(docData); }

  function initFirebase(){
    if(!window.firebase || !firebase.apps) throw new Error('Firebase SDK no cargado');
    if(!cfg.firebaseConfig) throw new Error('Falta CX.BACKEND.firebaseConfig');
    app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg.firebaseConfig);
    db = firebase.firestore(app);
  }

  function readStoredPreviewPassword(key){
    if(!key) return null;
    try{ return sessionStorage.getItem(key) || localStorage.getItem(key); }
    catch(_){ return null; }
  }

  function writeStoredPreviewPassword(key, password){
    if(!key || !password) return;
    try{ sessionStorage.setItem(key, password); }catch(_){ /* no-op */ }
  }

  async function ensurePreviewAuth(){
    const authCfg = cfg.devPreviewAuth || {};
    if(authCfg.enabled !== true) return;
    if(!window.firebase || !firebase.auth) throw new Error('Firebase Auth SDK no cargado para preview DEV');

    const auth = app && typeof app.auth === 'function' ? app.auth() : firebase.auth();
    if(auth.currentUser){
      emit('backend-auth-ready', {provider:'firebase', tenantId:tenantId(), preview:true, email:auth.currentUser.email || ''});
      return;
    }

    const email = authCfg.email;
    const key = authCfg.passwordStorageKey || 'CXORBIA_DEV_PASSWORD';
    let password = readStoredPreviewPassword(key);

    if(!password && authCfg.allowPrompt === true && window.prompt){
      password = window.prompt('Credencial temporal DEV para preview CXOrbia');
      if(password) writeStoredPreviewPassword(key, password);
    }

    if(!email || !password){
      markSource('localStorage/demo', {auth:'pending'});
      throw new Error('Falta usuario o credencial temporal DEV para iniciar preview autenticado');
    }

    await auth.signInWithEmailAndPassword(email, password);
    emit('backend-auth-ready', {provider:'firebase', tenantId:tenantId(), preview:true, email});
  }

  async function loadTenantData(){
    const projects = await getAll(projectsCol());
    const shoppers = await getAll(shoppersCol());
    const visits = [];
    const posts = [];

    for(const p of projects){
      const projectId = p.id;
      const vs = await getAll(subCol(projectId, 'visits'));
      const ps = await getAll(subCol(projectId, 'postulations'));
      vs.forEach(v=>{ v.projectId = v.projectId || projectId; visits.push(v); });
      ps.forEach(x=>{ x.projectId = x.projectId || projectId; posts.push(x); });
    }

    return {projects, shoppers, visits, posts};
  }

  function applyData(state){
    if(!CX.data){
      markSource('localStorage/demo', {reason:'missing-cx-data'});
      return false;
    }
    if(!state || !state.projects || !state.projects.length){
      markSource('firestore', {empty:true, counts:{projects:0, visits:0, shoppers:0, posts:0}});
      emit('backend-ready', {provider:'firebase', empty:true, tenantId:tenantId(), source:'firestore'});
      return false;
    }

    CX.data.projects = state.projects;
    CX.data.shoppers = state.shoppers || [];
    CX.data._visitas = state.visits || [];
    CX.data._posts = state.posts || [];

    const keep = CX.data.currentProjectId;
    const exists = CX.data.projects.some(p=>p.id===keep);
    CX.data.currentProjectId = exists ? keep : (cfg.defaultProjectId || CX.data.projects[0].id);

    const counts = {
      projects: CX.data.projects.length,
      visits: CX.data._visitas.length,
      shoppers: CX.data.shoppers.length,
      posts: CX.data._posts.length,
      projectId: CX.data.currentProjectId,
    };
    markSource('firestore', {empty:false, counts});

    emit('project', {source:'firebase'});
    emit('shoppers', {source:'firebase'});
    emit('visit-flow', {source:'firebase'});
    emit('backend-ready', {provider:'firebase', empty:false, tenantId:tenantId(), source:'firestore', counts});
    return true;
  }

  async function writeProject(project){
    if(!project || !project.id) return;
    await projectRef(project.id).set(clean(project), {merge:true});
  }

  async function writeShopper(shopper){
    if(!shopper || !shopper.id) return;
    await shoppersCol().doc(shopper.id).set(clean(shopper), {merge:true});
  }

  async function writeVisit(visit){
    if(!visit || !visit.id || !visit.projectId) return;
    await subCol(visit.projectId, 'visits').doc(visit.id).set(clean(visit), {merge:true});
  }

  function safePersist(promise, label){
    Promise.resolve(promise).catch(e=>{
      warn('No se pudo persistir '+label, e);
      emit('backend-error', {label, message:e.message || String(e), source:'localStorage/demo', tenantId:tenantId()});
    });
  }

  function wrapDataMethods(){
    const D = CX.data;
    if(!D || D.__firebaseWrapped) return;
    original = {
      addProject: D.addProject,
      setVisitState: D.setVisitState,
      assignVisit: D.assignVisit,
      payVisits: D.payVisits,
      addShopper: D.addShopper,
      updateShopper: D.updateShopper,
    };

    if(typeof D.addProject === 'function') D.addProject = function(cfg){
      const p = original.addProject.call(this, cfg);
      if(p) safePersist(writeProject(p), 'project');
      return p;
    };

    if(typeof D.setVisitState === 'function') D.setVisitState = function(id, estado, dateField, dateVal){
      const v = original.setVisitState.call(this, id, estado, dateField, dateVal);
      if(v) safePersist(writeVisit(v), 'visit-state');
      return v;
    };

    if(typeof D.assignVisit === 'function') D.assignVisit = function(visitId, shopperId){
      const v = original.assignVisit.call(this, visitId, shopperId);
      if(v) safePersist(writeVisit(v), 'visit-assign');
      return v;
    };

    if(typeof D.payVisits === 'function') D.payVisits = function(ids, fechaPago){
      const res = original.payVisits.call(this, ids, fechaPago);
      (ids || []).forEach(id=>{ const v = this._visitas.find(x=>x.id===id); if(v) safePersist(writeVisit(v), 'visit-payment'); });
      return res;
    };

    if(typeof D.addShopper === 'function') D.addShopper = function(cfg){
      const s = original.addShopper.call(this, cfg);
      if(s) safePersist(writeShopper(s), 'shopper-add');
      return s;
    };

    if(typeof D.updateShopper === 'function') D.updateShopper = function(id, patch){
      const s = original.updateShopper.call(this, id, patch);
      if(s) safePersist(writeShopper(s), 'shopper-update');
      return s;
    };

    D.__firebaseWrapped = true;
  }

  async function refresh(){
    if(!db) throw new Error('Firebase backend no inicializado');
    const state = await loadTenantData();
    applyData(state);
    return state;
  }

  async function start(){
    if(started) return CX.backend;
    started = true;

    if(cfg.enabled !== true){
      markSource('localStorage/demo', {reason:'backend-disabled'});
      emit('backend-disabled', {provider:'firebase', tenantId:tenantId(), source:'localStorage/demo'});
      return CX.backend;
    }

    try{
      initFirebase();
      await ensurePreviewAuth();
      wrapDataMethods();
      await refresh();
    }catch(e){
      markSource('localStorage/demo', {error:e.message || String(e)});
      warn('No se pudo iniciar adapter. La UI sigue con mock/localStorage.', e);
      emit('backend-error', {label:'start', message:e.message || String(e), source:'localStorage/demo', tenantId:tenantId()});
    }

    return CX.backend;
  }

  CX.backend = {
    config: cfg,
    start,
    refresh,
    writeProject,
    writeShopper,
    writeVisit,
    isEnabled(){ return cfg.enabled === true; },
    tenantId,
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
