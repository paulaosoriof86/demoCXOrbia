/* ============================================================
   CXOrbia · Firebase backend adapter (DEV seguro)
   ------------------------------------------------------------
   Mantiene CX.data como interfaz estable.
   No toca modulos UI.
   No se activa si CX.BACKEND.enabled !== true.
   El alcance de proyecto/periodo se resuelve antes del primer render.
   Corte 6: toda lectura protegida respeta el principal Firebase real.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND || {};
  const col = cfg.collections || {};
  let app = null;
  let db = null;
  let started = false;
  let original = null;
  let principal = null;

  function emit(name, payload){ if(CX.bus && typeof CX.bus.emit === 'function') CX.bus.emit(name, payload || {}); }
  function warn(){ console.warn.apply(console, ['[CX.backend]'].concat([].slice.call(arguments))); }
  function now(){ return new Date().toISOString(); }
  function tenantId(){ return cfg.tenantId || 'tya'; }

  function markSource(source, extra){
    window.CX_BACKEND_DATA_SOURCE = source;
    window.CX_BACKEND_LAST_STATE = Object.assign({source, at:now(), tenantId:tenantId()}, extra || {});
  }

  function clean(obj){
    if(Array.isArray(obj)) return obj.map(clean);
    if(!obj || typeof obj !== 'object') return obj;
    const out = {};
    Object.keys(obj).forEach(function(k){
      const v = obj[k];
      if(v === undefined || typeof v === 'function') return;
      out[k] = clean(v);
    });
    return out;
  }

  function tenantsCol(){ return db.collection(col.tenants || 'tenants'); }
  function tenantRef(){ return tenantsCol().doc(tenantId()); }
  function projectsCol(){ return tenantRef().collection(col.projects || 'projects'); }
  function projectRef(projectId){ return projectsCol().doc(projectId); }
  function subCol(projectId, name){ return projectRef(projectId).collection(col[name] || name); }
  function shoppersCol(){ return tenantRef().collection(col.shoppers || 'shoppers'); }
  function docData(d){ return Object.assign({id:d.id}, d.data() || {}); }
  async function getAll(q){ const snap = await q.get(); return snap.docs.map(docData); }
  async function getOne(ref){ const snap = await ref.get(); return snap.exists ? docData(snap) : null; }

  function firstArrayValue(value, fallback){ return Array.isArray(value) && value.length ? value[0] : fallback; }
  function toList(value){
    if(Array.isArray(value)) return value.map(String).map(function(x){return x.trim();}).filter(Boolean);
    if(typeof value === 'string') return value.split(',').map(function(x){return x.trim();}).filter(Boolean);
    return [];
  }
  function lower(value){ return String(value || '').trim().toLowerCase(); }

  function projectDisplayName(p){ return p.name || p.nombre || p.client || p.clientName || p.id || 'Proyecto'; }

  function inferPeriod(p){
    const id = String(p.id || p.projectId || '');
    const name = String(p.name || p.nombre || id);
    const source = [id, name, p.periodId, p.periodName, p.ronda, p.round].filter(Boolean).join(' ');
    const monthMap = {
      enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06', julio:'07', agosto:'08', septiembre:'09', setiembre:'09', octubre:'10', noviembre:'11', diciembre:'12'
    };
    const sourceLower = lower(source);
    let month = '';
    Object.keys(monthMap).some(function(m){ if(sourceLower.indexOf(m) >= 0){ month = monthMap[m]; return true; } return false; });
    const yearMatch = source.match(/(?:20)?(25|26|27|28|29|30)\b/);
    const year = yearMatch ? ('20' + yearMatch[1]) : '';
    const country = /\bHN\b/i.test(source) ? 'HN' : (/\bGT\b/i.test(source) ? 'GT' : '');
    const periodId = p.periodId || [year, month, country].filter(Boolean).join('-') || id;
    const periodName = p.periodName || p.ronda || p.round || name;
    return {id:periodId, name:periodName, year:year, month:month, country:country, sourceProjectId:id, status:p.periodStatus || p.status || 'historico'};
  }

  function normalizeProject(p){
    if(!p || typeof p !== 'object') return p;
    const id = p.id || p.projectId;
    return Object.assign({}, p, {
      id:id,
      projectId: p.projectId || id,
      tenantId: p.tenantId || tenantId(),
      name: projectDisplayName(p),
      client: p.client || p.clientId || p.clientName || 'Cliente',
      currency: p.currency || p.currencies || {},
      countries: Array.isArray(p.countries) ? p.countries : [],
      quincenas: p.quincenas || ['Quincena 1','Quincena 2'],
      honorario: p.honorario || {},
      boleto: p.boleto || {},
      comboAmt: p.comboAmt || {},
    });
  }

  function normalizePeriod(p, project){
    if(!p || typeof p !== 'object') return p;
    const id = p.periodId || p.key || p.id;
    const status = p.state || p.status || 'closed';
    return Object.assign({}, p, {
      id:id,
      periodId:id,
      key:p.key || id,
      name:p.label || p.name || p.periodName || id,
      label:p.label || p.name || p.periodName || id,
      year:p.year || '',
      month:p.month || '',
      country:p.country || '',
      countries:p.countries || {},
      projectId:project.id,
      projectName:project.name,
      sourceProjectId:project.id,
      status:status,
      state:status,
      active:status === 'active'
    });
  }

  function normalizeShopper(s){
    if(!s || typeof s !== 'object') return s;
    const id = s.id || s.shopperId;
    const country = s.pais || firstArrayValue(s.countries, 'GT');
    return Object.assign({}, s, {
      id:id,
      shopperId: s.shopperId || id,
      nombre: s.nombre || s.name || s.fullName || id || 'Shopper',
      pais: country,
      ciudad: s.ciudad || firstArrayValue(s.cities, '') || s.city || '',
      code: s.code || s.codigo || id,
      estado: s.estado || s.status || 'Activo',
      rating: s.rating || (s.score ? +(s.score / 20).toFixed(1) : 0),
      visitas: s.visitas || (s.stats && s.stats.completedVisits) || 0,
      promCuest: s.promCuest || 0,
      certs: s.certs || 0,
    });
  }

  function normalizeVisit(v, projectId, periodId){
    if(!v || typeof v !== 'object') return v;
    const id = v.id || v.visitId;
    const fee = v.fee || {};
    const country = v.pais || v.country || v.countryCode || 'GT';
    const franjaCode = v.franjaCode || v.timeBand || (v.franja === 'WKND' ? 'WKND' : v.franja === 'WK' ? 'WK' : v.franja);
    return Object.assign({}, v, {
      id:id,
      visitId: v.visitId || id,
      projectId: v.projectId || projectId,
      periodId: v.periodId || periodId || projectId,
      estado: v.estado || v.status || 'disponible',
      status: v.status || v.estado || 'disponible',
      pais: country,
      country: country,
      sucursal: v.sucursal || v.branchName || v.branchId || id,
      branchId: v.branchId || v.sucursal || '',
      ciudad: v.ciudad || v.city || '',
      quincena: v.quincena || v.periodName || 1,
      franja: v.franja || franjaCode || 'WK',
      franjaCode: franjaCode || 'WK',
      escenario: v.escenario || v.scenario || '',
      scenario: v.scenario || v.escenario || '',
      disponibleDesde: v.disponibleDesde || v.availableFrom || '',
      availableFrom: v.availableFrom || v.disponibleDesde || '',
      agendada: v.agendada || v.scheduledDate || '',
      realizada: v.realizada || v.completedDate || '',
      cuestFecha: v.cuestFecha || v.questionnaireDate || v.submittedAt || '',
      submit: v.submit === true || v.submitted === true || !!v.submittedAt,
      honorario: v.honorario || fee.amount || v.honorariumAmount || 0,
      currency: v.currency || fee.currency || v.moneda || '',
      boleto: v.boleto || v.ticketReimbursementAmount || 0,
      comboAmt: v.comboAmt || v.comboReimbursementAmount || 0,
      reimbursements: Array.isArray(v.reimbursements) ? v.reimbursements : [],
    });
  }

  function normalizeApplication(a, projectId, periodId, visitsById, shoppersById){
    if(!a || typeof a !== 'object') return a;
    const id = a.id || a.applicationId || a.postulationId || [a.visitId || a.visitaId, a.shopperId].filter(Boolean).join('-');
    const visitId = a.visitaId || a.visitId;
    const visit = visitsById[visitId] || {};
    const shopperId = a.shopperId;
    const shopper = shoppersById[shopperId] || {};
    return Object.assign({}, a, {
      id:id,
      applicationId: a.applicationId || id,
      postulationId: a.postulationId || id,
      visitaId: visitId,
      visitId: visitId,
      projectId: a.projectId || projectId,
      periodId: a.periodId || periodId || projectId,
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
    if(authCfg.enabled !== true) return null;
    if(CX.backendAuth && typeof CX.backendAuth.ensureAuthenticated === 'function'){
      principal = await CX.backendAuth.ensureAuthenticated();
      emit('backend-auth-ready', {provider:'firebase', tenantId:tenantId(), preview:true, role:principal && principal.role || '', scoped:true});
      return principal;
    }
    if(authCfg.storedCredentialFallback !== true) throw new Error('AUTH_INTERACTIVE_GATE_REQUIRED');
    if(!window.firebase || !firebase.auth) throw new Error('Firebase Auth SDK no cargado para preview DEV');
    const auth = app && typeof app.auth === 'function' ? app.auth() : firebase.auth();
    if(auth.currentUser){ emit('backend-auth-ready', {provider:'firebase', tenantId:tenantId(), preview:true, scoped:false}); return null; }
    const email = authCfg.email;
    const key = authCfg.passwordStorageKey || 'CXORBIA_DEV_PASSWORD';
    const password = readStoredPreviewPassword(key);
    if(!email || !password){ markSource('localStorage/demo', {auth:'pending'}); throw new Error('Falta autenticacion Firebase DEV'); }
    await auth.signInWithEmailAndPassword(email, password);
    emit('backend-auth-ready', {provider:'firebase', tenantId:tenantId(), preview:true, scoped:false});
    return null;
  }

  function authContext(){
    if(principal) return principal;
    if(CX.backendAuth && typeof CX.backendAuth.context === 'function') return CX.backendAuth.context();
    return null;
  }
  function roleOf(ctx){ return ctx && ctx.role ? String(ctx.role) : ''; }
  function isOperator(ctx){ return ['super','admin','ops','coordinador'].includes(roleOf(ctx)); }
  function isClient(ctx){ return ['cliente','client'].includes(roleOf(ctx)); }
  function isShopper(ctx){ return roleOf(ctx) === 'shopper'; }

  async function loadAuthorizedProjects(ctx){
    if(!ctx || isOperator(ctx)) return getAll(projectsCol());
    const ids = toList(ctx.projectIds);
    if(!ids.length) throw new Error('PROJECT_SCOPE_REQUIRED');
    const docs = await Promise.all(ids.map(function(id){ return getOne(projectRef(id)); }));
    return docs.filter(Boolean);
  }

  async function loadAuthorizedShoppers(ctx){
    if(!ctx || isOperator(ctx)) return getAll(shoppersCol());
    if(isShopper(ctx) && ctx.shopperId){
      const own = await getOne(shoppersCol().doc(ctx.shopperId));
      return own ? [own] : [];
    }
    return [];
  }

  async function loadShopperVisits(projectId, shopperId){
    if(!shopperId) throw new Error('SHOPPER_SCOPE_REQUIRED');
    const merged = new Map();
    const queries = [
      {label:'own', q:subCol(projectId, 'visits').where('shopperId','==',shopperId)},
      {label:'available-status', q:subCol(projectId, 'visits').where('status','==','disponible')},
      {label:'available-legacy', q:subCol(projectId, 'visits').where('estado','==','disponible')},
    ];
    for(const item of queries){
      try{
        const rows = await getAll(item.q);
        rows.forEach(function(v){ merged.set(v.id || v.visitId, v); });
      }catch(e){
        warn('Lectura shopper '+item.label+' bloqueada en '+projectId, e && e.message ? e.message : e);
      }
    }
    return Array.from(merged.values());
  }

  async function loadPostsForPrincipal(projectId, ctx){
    if(!ctx || isOperator(ctx)){
      const result = await Promise.all([
        getAll(subCol(projectId, 'postulations')).catch(function(e){ warn('No se pudieron leer postulations de '+projectId, e); return []; }),
        getAll(subCol(projectId, 'applications')).catch(function(e){ warn('No se pudieron leer applications de '+projectId, e); return []; })
      ]);
      return result[0].concat(result[1]);
    }
    if(isShopper(ctx) && ctx.shopperId){
      const result = await Promise.all([
        getAll(subCol(projectId, 'postulations').where('shopperId','==',ctx.shopperId)).catch(function(e){ warn('No se pudieron leer postulations propias de '+projectId, e); return []; }),
        getAll(subCol(projectId, 'applications').where('shopperId','==',ctx.shopperId)).catch(function(e){ warn('No se pudieron leer applications propias de '+projectId, e); return []; })
      ]);
      return result[0].concat(result[1]);
    }
    return [];
  }

  function resolveActiveProjects(projects){
    const ctx = authContext();
    const scoped = ctx && !isOperator(ctx) ? toList(ctx.projectIds) : [];
    const requested = scoped.length ? scoped : toList(cfg.previewProjectIds).concat(toList(cfg.defaultProjectId));
    const ids = new Set(requested.filter(Boolean));
    let active = ids.size ? projects.filter(function(p){ return ids.has(p.id); }) : [];
    if(!active.length && cfg.defaultProjectId){ active = projects.filter(function(p){ return p.id === cfg.defaultProjectId; }); }
    if(!active.length && projects.length){
      const preferred = projects.find(function(p){ return /cinepolis/i.test([p.id, p.name].join(' ')); });
      active = preferred ? [preferred] : [projects[0]];
    }
    return active;
  }

  async function loadCanonicalPeriods(activeProjects){
    const buckets = await Promise.all(activeProjects.map(async function(project){
      const raw = await getAll(subCol(project.id, 'periods'));
      return raw.map(function(period){ return normalizePeriod(period, project); });
    }));
    const periods = [];
    buckets.forEach(function(bucket){ (bucket || []).forEach(function(period){ periods.push(period); }); });
    periods.sort(function(a,b){ return String(a.key || a.id || '').localeCompare(String(b.key || b.id || '')); });
    return periods;
  }

  async function loadProjectData(project, shoppersById, ctx){
    const projectId = project.id;
    const periodId = project.periodId || projectId;
    const visitsRaw = isShopper(ctx) ? await loadShopperVisits(projectId, ctx.shopperId) : await getAll(subCol(projectId, 'visits'));
    const visitsById = {};
    const visits = visitsRaw.map(function(v){ return normalizeVisit(v, projectId, periodId); });
    visits.forEach(function(v){ v.projectId = v.projectId || projectId; visitsById[v.id] = v; visitsById[v.visitId] = v; });
    const rawPosts = isClient(ctx) ? [] : await loadPostsForPrincipal(projectId, ctx);
    const posts = [];
    rawPosts.forEach(function(x){
      const item = normalizeApplication(x, projectId, periodId, visitsById, shoppersById);
      if(item) posts.push(item);
    });
    return {visits:visits, posts:posts};
  }

  async function loadTenantData(){
    const loadStartedAt = Date.now();
    const ctx = authContext();
    emit('backend-loading', {provider:'firebase', tenantId:tenantId(), source:'firestore', role:roleOf(ctx), scoped:!!ctx});
    const result = await Promise.all([loadAuthorizedProjects(ctx), loadAuthorizedShoppers(ctx)]);
    const allProjects = result[0].map(normalizeProject);
    const activeProjects = resolveActiveProjects(allProjects);
    const periods = await loadCanonicalPeriods(activeProjects);
    const shoppers = result[1].map(normalizeShopper);
    const shoppersById = {};
    shoppers.forEach(function(s){ shoppersById[s.id] = s; shoppersById[s.shopperId] = s; });
    const perProject = await Promise.all(activeProjects.map(function(p){ return loadProjectData(p, shoppersById, ctx); }));
    const visits = [];
    const posts = [];
    perProject.forEach(function(bucket){
      (bucket.visits || []).forEach(function(v){ visits.push(v); });
      (bucket.posts || []).forEach(function(p){ posts.push(p); });
    });
    const counts = {projects:activeProjects.length, projectRecords:allProjects.length, periods:periods.length, shoppers:shoppers.length, visits:visits.length, posts:posts.length};
    window.CX_BACKEND_PERIODS = periods;
    window.CX_BACKEND_PROJECT_SCOPE = {mode:'firebase-auth-principal', role:roleOf(ctx), activeProjectIds:activeProjects.map(function(p){return p.id;}), totalProjectRecords:allProjects.length, at:now()};
    emit('backend-loaded', {provider:'firebase', tenantId:tenantId(), source:'firestore', ms:Date.now()-loadStartedAt, counts:counts, role:roleOf(ctx), scoped:!!ctx});
    return {projects:activeProjects, allProjects:allProjects, periods:periods, shoppers:shoppers, visits:visits, posts:posts};
  }

  function applyData(state){
    if(!CX.data){ markSource('localStorage/demo', {reason:'missing-cx-data'}); return false; }
    if(!state || !state.projects || !state.projects.length){ markSource('firestore', {empty:true, counts:{projects:0, visits:0, shoppers:0, posts:0}}); emit('backend-ready', {provider:'firebase', empty:true, tenantId:tenantId(), source:'firestore'}); return false; }
    CX.data.projects = state.projects;
    CX.data.periods = state.periods || [];
    CX.data.__backendAllProjectRecords = state.allProjects || [];
    CX.data.__backendPeriods = state.periods || [];
    CX.data.shoppers = state.shoppers || [];
    CX.data._visitas = state.visits || [];
    CX.data._posts = state.posts || [];
    const keep = CX.data.currentProjectId;
    const exists = CX.data.projects.some(function(p){ return p.id === keep; });
    CX.data.currentProjectId = exists ? keep : (cfg.defaultProjectId && CX.data.projects.some(function(p){return p.id === cfg.defaultProjectId;}) ? cfg.defaultProjectId : CX.data.projects[0].id);
    const keepPeriod = CX.data.currentPeriodId;
    const periodExists = CX.data.periods.some(function(p){ return p.id === keepPeriod; });
    const activePeriod = CX.data.periods.find(function(p){ return p.active; }) || CX.data.periods[CX.data.periods.length - 1] || null;
    CX.data.currentPeriodId = periodExists ? keepPeriod : (activePeriod ? activePeriod.id : '');
    const counts = {projects:CX.data.projects.length, projectRecords:state.allProjects ? state.allProjects.length : CX.data.projects.length, periods:CX.data.periods.length, visits:CX.data._visitas.length, shoppers:CX.data.shoppers.length, posts:CX.data._posts.length, projectId:CX.data.currentProjectId, periodId:CX.data.currentPeriodId};
    markSource('firestore', {empty:false, counts:counts, scope:'firebase-auth-principal'});
    emit('project', {source:'firebase'});
    emit('shoppers', {source:'firebase'});
    emit('visit-flow', {source:'firebase'});
    emit('backend-ready', {provider:'firebase', empty:false, tenantId:tenantId(), source:'firestore', counts:counts, scope:'firebase-auth-principal'});
    return true;
  }

  async function writeProject(project){ if(!project || !project.id) return; await projectRef(project.id).set(clean(project), {merge:true}); }
  async function writeShopper(shopper){ if(!shopper || !shopper.id) return; await shoppersCol().doc(shopper.id).set(clean(shopper), {merge:true}); }
  async function writeVisit(visit){ if(!visit || !visit.id || !visit.projectId) return; await subCol(visit.projectId, 'visits').doc(visit.id).set(clean(visit), {merge:true}); }
  function safePersist(promise, label){ Promise.resolve(promise).catch(function(e){ warn('No se pudo persistir '+label, e); emit('backend-error', {label:label, message:e.message || String(e), source:'localStorage/demo', tenantId:tenantId()}); }); }

  function wrapDataMethods(){
    const D = CX.data;
    if(!D || D.__firebaseWrapped) return;
    original = {addProject:D.addProject, setVisitState:D.setVisitState, assignVisit:D.assignVisit, payVisits:D.payVisits, addShopper:D.addShopper, updateShopper:D.updateShopper};
    if(typeof D.addProject === 'function') D.addProject = function(cfgInput){ const p = original.addProject.call(this, cfgInput); if(p) safePersist(writeProject(p), 'project'); return p; };
    if(typeof D.setVisitState === 'function') D.setVisitState = function(id, estado, dateField, dateVal){ const v = original.setVisitState.call(this, id, estado, dateField, dateVal); if(v) safePersist(writeVisit(v), 'visit-state'); return v; };
    if(typeof D.assignVisit === 'function') D.assignVisit = function(visitId, shopperId){ const v = original.assignVisit.call(this, visitId, shopperId); if(v) safePersist(writeVisit(v), 'visit-assign'); return v; };
    if(typeof D.payVisits === 'function') D.payVisits = function(ids, fechaPago){ const res = original.payVisits.call(this, ids, fechaPago); (ids || []).forEach(function(id){ const v = this._visitas.find(function(x){return x.id===id;}); if(v) safePersist(writeVisit(v), 'visit-payment'); }, this); return res; };
    if(typeof D.addShopper === 'function') D.addShopper = function(cfgInput){ const s = original.addShopper.call(this, cfgInput); if(s) safePersist(writeShopper(s), 'shopper-add'); return s; };
    if(typeof D.updateShopper === 'function') D.updateShopper = function(id, patch){ const s = original.updateShopper.call(this, id, patch); if(s) safePersist(writeShopper(s), 'shopper-update'); return s; };
    D.__firebaseWrapped = true;
  }

  async function refresh(){ if(!db) throw new Error('Firebase backend no inicializado'); const state = await loadTenantData(); applyData(state); return state; }

  async function start(){
    if(started) return CX.backend;
    started = true;
    if(cfg.enabled !== true){ markSource('localStorage/demo', {reason:'backend-disabled'}); emit('backend-disabled', {provider:'firebase', tenantId:tenantId(), source:'localStorage/demo'}); return CX.backend; }
    try{ initFirebase(); await ensurePreviewAuth(); wrapDataMethods(); await refresh(); }
    catch(e){ markSource('localStorage/demo', {error:e.message || String(e)}); warn('No se pudo iniciar adapter protegido.', e); emit('backend-error', {label:'start', message:e.message || String(e), source:'localStorage/demo', tenantId:tenantId()}); }
    return CX.backend;
  }

  CX.backend = {config:cfg, start:start, refresh:refresh, writeProject:writeProject, writeShopper:writeShopper, writeVisit:writeVisit, authContext:authContext, isEnabled:function(){ return cfg.enabled === true; }, tenantId:tenantId};
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
