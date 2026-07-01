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

  function firstArrayValue(value, fallback){
    return Array.isArray(value) && value.length ? value[0] : fallback;
  }

  function normalizeProject(p){
    if(!p || typeof p !== 'object') return p;
    const id = p.id || p.projectId;
    return Object.assign({}, p, {
      id,
      projectId: p.projectId || id,
      tenantId: p.tenantId || tenantId(),
      name: p.name || id || 'Proyecto',
      client: p.client || p.clientId || 'Cliente',
      currency: p.currency || p.currencies || {},
      countries: Array.isArray(p.countries) ? p.countries : [],
      quincenas: p.quincenas || ['Quincena 1','Quincena 2'],
      honorario: p.honorario || {},
      boleto: p.boleto || {},
      comboAmt: p.comboAmt || {},
    });
  }

  function normalizeShopper(s){
    if(!s || typeof s !== 'object') return s;
    const id = s.id || s.shopperId;
    const country = s.pais || firstArrayValue(s.countries, 'GT');
    return Object.assign({}, s, {
      id,
      shopperId: s.shopperId || id,
      nombre: s.nombre || s.name || id || 'Shopper',
      pais: country,
      ciudad: s.ciudad || firstArrayValue(s.cities, ''),
      code: s.code || id,
      estado: s.estado || s.status || 'Activo',
      rating: s.rating || (s.score ? +(s.score / 20).toFixed(1) : 0),
      visitas: s.visitas || (s.stats && s.stats.completedVisits) || 0,
      promCuest: s.promCuest || 0,
      certs: s.certs || 0,
    });
  }

  function normalizeVisit(v, projectId){
    if(!v || typeof v !== 'object') return v;
    const id = v.id || v.visitId;
    const fee = v.fee || {};
    const country = v.pais || v.country || 'GT';
    const franjaCode = v.franjaCode || (v.franja === 'WKND' ? 'WKND' : v.franja === 'WK' ? 'WK' : v.franja);
    return Object.assign({}, v, {
      id,
      visitId: v.visitId || id,
      projectId: v.projectId || projectId,
      estado: v.estado || v.status || 'disponible',
      status: v.status || v.estado || 'disponible',
      pais: country,
      country,
      sucursal: v.sucursal || v.branchName || v.branchId || id,
      branchId: v.branchId || v.sucursal || '',
      quincena: v.quincena || 1,
      franja: v.franja || franjaCode || 'WK',
      franjaCode: franjaCode || 'WK',
      escenario: v.escenario || v.scenario || '',
      scenario: v.scenario || v.escenario || '',
      disponibleDesde: v.disponibleDesde || v.availableFrom || '',
      availableFrom: v.availableFrom || v.disponibleDesde || '',
      honorario: v.honorario || fee.amount || 0,
      currency: v.currency || fee.currency || '',
      reimbursements: Array.isArray(v.reimbursements) ? v.reimbursements : [],
    });
  }

  function normalizeApplication(a, projectId, visitsById, shoppersById){
    if(!a || typeof a !== 'object') return a;
    const id = a.id || a.applicationId || a.postulationId;
    const visitId = a.visitaId || a.visitId;
    const visit = visitsById[visitId] || {};
    const shopperId = a.shopperId;
    const shopper = shoppersById[shopperId] || {};
    return Object.assign({}, a, {
      id,
      applicationId: a.applicationId || id,
      postulationId: a.postulationId || id,
      visitaId: visitId,
      visitId,
      projectId: a.projectId || projectId,
      estado: a.estado || a.status || 'pendiente',
      status: a.status || a.estado || 'pendiente',
      fechaProp: a.fechaProp || a.proposedDate || '',
      proposedDate: a.proposedDate || a.fechaProp || '',
      franjaCode: a.franjaCode || visit.franjaCode || a.proposedTimeBand || '',
      shopper: a.shopper || shopper.nombre || shopper.name || shopperId || '',
      shopperCode: a.shopperCode || shopper.code || shopperId || '',
      sucursal: a.sucursal || visit.sucursal || '',
      ciudad: a.ciudad || visit.ciudad || '',
      pais: a.pais || visit.pais || visit.country || '',
      quincena: a.quincena || visit.quincena || '',
      disponibleDesde: a.disponibleDesde || visit.disponibleDesde || visit.availableFrom || '',
      honorario: a.honorario || visit.honorario || 0,
      boleto: a.boleto || visit.boleto || 0,
      comboAmt: a.comboAmt || visit.comboAmt || 0,
      currency: a.currency || visit.currency || '',
    });
  }

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
    const password = readStoredPreviewPassword(key);

    if(!email || !password){
      markSource('localStorage/demo', {auth:'pending'});
      throw new Error('Falta usuario o credencial temporal DEV para iniciar preview autenticado');
    }

    await auth.signInWithEmailAndPassword(email, password);
    emit('backend-auth-ready', {provider:'firebase', tenantId:tenantId(), preview:true, email});
  }

  async function loadProjectData(project, shoppersById){
    const projectId = project.id;
    const visitsRaw = await getAll(subCol(projectId, 'visits'));
    const visitsById = {};
    const visits = visitsRaw.map(v=>normalizeVisit(v, projectId));
    visits.forEach(v=>{ v.projectId = v.projectId || projectId; visitsById[v.id] = v; visitsById[v.visitId] = v; });

    const postulationsPromise = getAll(subCol(projectId, 'postulations')).catch(function(e){
      warn('No se pudieron leer postulations de '+projectId, e);
      return [];
    });
    const applicationsPromise = getAll(subCol(projectId, 'applications')).catch(function(e){
      warn('No se pudieron leer applications de '+projectId, e);
      return [];
    });

    const result = await Promise.all([postulationsPromise, applicationsPromise]);
    const posts = [];
    result[0].concat(result[1]).forEach(x=>{
      const item = normalizeApplication(x, projectId, visitsById, shoppersById);
      if(item) posts.push(item);
    });

    return {visits, posts};
  }

  async function loadTenantData(){
    const loadStartedAt = Date.now();
    emit('backend-loading', {provider:'firebase', tenantId:tenantId(), source:'firestore'});

    const result = await Promise.all([getAll(projectsCol()), getAll(shoppersCol())]);
    const projectsRaw = result[0];
    const shoppersRaw = result[1];
    const projects = projectsRaw.map(normalizeProject);
    const shoppers = shoppersRaw.map(normalizeShopper);
    const shoppersById = {};
    shoppers.forEach(s=>{ shoppersById[s.id] = s; shoppersById[s.shopperId] = s; });

    const perProject = await Promise.all(projects.map(function(p){ return loadProjectData(p, shoppersById); }));
    const visits = [];
    const posts = [];
    perProject.forEach(function(bucket){
      (bucket.visits || []).forEach(v=>visits.push(v));
      (bucket.posts || []).forEach(p=>posts.push(p));
    });

    emit('backend-loaded', {
      provider:'firebase',
      tenantId:tenantId(),
      source:'firestore',
      ms:Date.now()-loadStartedAt,
      counts:{projects:projects.length, shoppers:shoppers.length, visits:visits.length, posts:posts.length}
    });

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
