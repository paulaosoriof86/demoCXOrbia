/* ============================================================
   CXOrbia · CX.data read guard para Preview Backend DEV
   ------------------------------------------------------------
   Normaliza lecturas Firestore sin tocar modulos UI.
   No escribe datos. No se carga en app/index.html.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  function emit(name, payload){ if(CX.bus && typeof CX.bus.emit === 'function') CX.bus.emit(name, payload || {}); }
  function warn(){ console.warn.apply(console, ['[CX.backend.read-guard]'].concat([].slice.call(arguments))); }

  function isBackendPreview(){ return !!(CX.BACKEND && CX.BACKEND.enabled === true && CX.BACKEND.previewMode === true); }
  function num(value, fallback){ const n = Number(value); return Number.isFinite(n) ? n : (fallback || 0); }
  function firstArrayValue(value, fallback){ return Array.isArray(value) && value.length ? value[0] : fallback; }
  function lower(value){ return String(value || '').trim().toLowerCase(); }

  const VISIT_STATUS = {
    available:'disponible', disponible:'disponible', open:'disponible', nueva:'disponible', pending:'disponible',
    applied:'postulada', postulada:'postulada', postulated:'postulada', requested:'postulada',
    assigned:'asignada', asignada:'asignada', approved:'asignada', aprobada:'asignada',
    scheduled:'agendada', agendada:'agendada', booked:'agendada',
    completed:'realizada', realizada:'realizada', done:'realizada', visited:'realizada',
    questionnaire:'cuestionario', cuestionario:'cuestionario', submitted_pending:'cuestionario', pending_submit:'cuestionario', pendiente_submitir:'cuestionario',
    submitted:'liquidada', liquidated:'liquidada', liquidada:'liquidada', paid:'liquidada', pagada:'liquidada',
    out_of_range:'fuera_rango', fuera_rango:'fuera_rango', rejected:'fuera_rango'
  };

  const POST_STATUS = {
    pending:'pendiente', pendiente:'pendiente', applied:'pendiente', requested:'pendiente',
    approved:'aprobada', aprobada:'aprobada', assigned:'aprobada', asignada:'aprobada',
    standby:'standby', waitlist:'standby', rejected:'rechazada', rechazada:'rechazada', cancelled:'cancelada', cancelada:'cancelada'
  };

  function visitStatus(value){ return VISIT_STATUS[lower(value)] || value || 'disponible'; }
  function postStatus(value){ return POST_STATUS[lower(value)] || value || 'pendiente'; }

  function reimbursementAmount(v, keys, matchWords){
    for(const k of keys){ if(v && v[k] !== undefined && v[k] !== null && v[k] !== '') return num(v[k], 0); }
    const list = Array.isArray(v && v.reimbursements) ? v.reimbursements : [];
    let total = 0;
    list.forEach(item=>{
      const hay = lower([item.type, item.kind, item.category, item.label, item.name].filter(Boolean).join(' '));
      if(matchWords.some(w=>hay.indexOf(w) >= 0)) total += num(item.amount || item.value || item.total, 0);
    });
    return total;
  }

  function canonicalVisit(v){
    if(!v || typeof v !== 'object') return v;
    const id = v.id || v.visitId;
    const country = v.pais || v.country || v.countryCode || '';
    const status = visitStatus(v.estado || v.status || v.state);
    const fee = v.fee || {};
    const franjaRaw = v.franjaCode || v.timeBand || v.proposedTimeBand || v.franja || '';
    const franjaCode = lower(franjaRaw).indexOf('weekend') >= 0 || franjaRaw === 'WKND' || franjaRaw === 'Fin de semana' ? 'WKND' : (franjaRaw === 'WK' || franjaRaw === 'Semana' ? 'WK' : franjaRaw || 'WK');
    return Object.assign({}, v, {
      id,
      visitId: v.visitId || id,
      estado: status,
      status,
      pais: country,
      country,
      sucursal: v.sucursal || v.branchName || v.branchId || id || '',
      branchId: v.branchId || v.sucursal || '',
      ciudad: v.ciudad || v.city || '',
      city: v.city || v.ciudad || '',
      quincena: v.quincena || v.periodName || v.periodId || '',
      franjaCode,
      franja: v.franja || (franjaCode === 'WKND' ? 'Fin de semana' : 'Semana'),
      escenario: v.escenario || v.scenario || '',
      scenario: v.scenario || v.escenario || '',
      disponibleDesde: v.disponibleDesde || v.availableFrom || '',
      availableFrom: v.availableFrom || v.disponibleDesde || '',
      agendada: v.agendada || v.scheduledDate || '',
      realizada: v.realizada || v.completedDate || '',
      cuestFecha: v.cuestFecha || v.questionnaireDate || v.submittedAt || '',
      submit: v.submit === true || v.submitted === true || !!v.submittedAt,
      honorario: num(v.honorario !== undefined ? v.honorario : (fee.amount !== undefined ? fee.amount : v.honorariumAmount), 0),
      boleto: reimbursementAmount(v, ['boleto','ticketReimbursementAmount','ticketAmount'], ['ticket','boleto','transporte']),
      comboAmt: reimbursementAmount(v, ['comboAmt','comboReimbursementAmount','comboAmount'], ['combo','compra','purchase']),
      currency: v.currency || fee.currency || v.moneda || ''
    });
  }

  function canonicalShopper(s){
    if(!s || typeof s !== 'object') return s;
    const id = s.id || s.shopperId || s.userId;
    return Object.assign({}, s, {
      id,
      shopperId: s.shopperId || id,
      nombre: s.nombre || s.name || s.fullName || id || 'Shopper',
      pais: s.pais || firstArrayValue(s.countries, '') || s.country || '',
      ciudad: s.ciudad || firstArrayValue(s.cities, '') || s.city || '',
      code: s.code || s.codigo || id,
      estado: s.estado || s.status || 'Activo'
    });
  }

  function canonicalPost(p, visitsById, shoppersById){
    if(!p || typeof p !== 'object') return p;
    const id = p.id || p.applicationId || p.postulationId || [p.visitId || p.visitaId, p.shopperId].filter(Boolean).join('-');
    const visitId = p.visitaId || p.visitId;
    const visit = visitsById[visitId] || {};
    const shopper = shoppersById[p.shopperId] || {};
    return Object.assign({}, p, {
      id,
      applicationId: p.applicationId || id,
      postulationId: p.postulationId || id,
      visitaId: visitId,
      visitId,
      projectId: p.projectId || visit.projectId || '',
      estado: postStatus(p.estado || p.status || p.state),
      status: postStatus(p.status || p.estado || p.state),
      fechaProp: p.fechaProp || p.proposedDate || p.scheduledDate || '',
      proposedDate: p.proposedDate || p.fechaProp || p.scheduledDate || '',
      franjaCode: p.franjaCode || visit.franjaCode || p.proposedTimeBand || '',
      shopper: p.shopper || shopper.nombre || shopper.name || p.shopperId || '',
      shopperCode: p.shopperCode || shopper.code || p.shopperId || '',
      sucursal: p.sucursal || visit.sucursal || '',
      ciudad: p.ciudad || visit.ciudad || '',
      pais: p.pais || visit.pais || visit.country || '',
      quincena: p.quincena || visit.quincena || '',
      disponibleDesde: p.disponibleDesde || visit.disponibleDesde || visit.availableFrom || '',
      honorario: num(p.honorario !== undefined ? p.honorario : visit.honorario, 0),
      boleto: num(p.boleto !== undefined ? p.boleto : visit.boleto, 0),
      comboAmt: num(p.comboAmt !== undefined ? p.comboAmt : visit.comboAmt, 0),
      currency: p.currency || visit.currency || ''
    });
  }

  function dedupe(items, keyFn){
    const seen = Object.create(null);
    const out = [];
    (items || []).forEach(item=>{
      const key = keyFn(item);
      if(!key || seen[key]) return;
      seen[key] = true;
      out.push(item);
    });
    return out;
  }

  function normalizeProject(project, visits){
    if(!project || typeof project !== 'object') return project;
    const id = project.id || project.projectId;
    const pv = visits.filter(v=>v.projectId === id);
    const countries = Array.isArray(project.countries) && project.countries.length ? project.countries : Array.from(new Set(pv.map(v=>v.pais || v.country).filter(Boolean)));
    const currency = project.currency && typeof project.currency === 'object' ? Object.assign({}, project.currency) : {};
    pv.forEach(v=>{ if((v.pais || v.country) && v.currency && !currency[v.pais || v.country]) currency[v.pais || v.country] = v.currency; });
    return Object.assign({}, project, {
      id,
      projectId: project.projectId || id,
      tenantId: project.tenantId || (CX.backend && CX.backend.tenantId && CX.backend.tenantId()) || (CX.BACKEND && CX.BACKEND.tenantId) || 'tya',
      name: project.name || project.nombre || id || 'Proyecto',
      client: project.client || project.clientName || project.clientId || 'Cliente',
      countries,
      currency
    });
  }

  function runGuard(){
    if(!isBackendPreview() || !CX.data) return null;
    if(window.CX_BACKEND_DATA_SOURCE !== 'firestore') return null;

    const D = CX.data;
    const anomalies = [];
    const visits = (Array.isArray(D._visitas) ? D._visitas : []).map(canonicalVisit);
    const shoppers = (Array.isArray(D.shoppers) ? D.shoppers : []).map(canonicalShopper);
    const visitsById = Object.create(null);
    visits.forEach(v=>{ if(v && v.id) visitsById[v.id] = v; if(v && v.visitId) visitsById[v.visitId] = v; });
    const shoppersById = Object.create(null);
    shoppers.forEach(s=>{ if(s && s.id) shoppersById[s.id] = s; if(s && s.shopperId) shoppersById[s.shopperId] = s; });

    const posts = dedupe((Array.isArray(D._posts) ? D._posts : []).map(p=>canonicalPost(p, visitsById, shoppersById)), p=>p.id || [p.visitId, p.shopperId].filter(Boolean).join(':'));
    const projects = (Array.isArray(D.projects) ? D.projects : []).map(p=>normalizeProject(p, visits));

    const projectIds = new Set(projects.map(p=>p.id));
    visits.forEach(v=>{ if(v.projectId && !projectIds.has(v.projectId)) anomalies.push('visit-without-project:'+v.id); });
    posts.forEach(p=>{ if(p.visitId && !visitsById[p.visitId]) anomalies.push('post-without-visit:'+p.id); });

    D.projects = projects;
    D.shoppers = shoppers;
    D._visitas = visits;
    D._posts = posts;

    if(!D.currentProjectId || !projectIds.has(D.currentProjectId)){
      const preferred = CX.BACKEND && CX.BACKEND.defaultProjectId;
      D.currentProjectId = preferred && projectIds.has(preferred) ? preferred : (projects[0] && projects[0].id) || '';
    }

    const currentProjectId = D.currentProjectId;
    const currentVisits = visits.filter(v=>v.projectId === currentProjectId);
    const currentPosts = posts.filter(p=>p.projectId === currentProjectId);
    const currentCountries = Array.from(new Set(currentVisits.map(v=>v.pais || v.country).filter(Boolean)));

    D.__backendReadGuard = {
      status:'ok',
      source:'firestore',
      at:new Date().toISOString(),
      currentProjectId,
      totals:{projects:projects.length, visits:visits.length, shoppers:shoppers.length, posts:posts.length},
      current:{visits:currentVisits.length, posts:currentPosts.length, countries:currentCountries},
      anomalies
    };

    window.CX_BACKEND_READ_GUARD = D.__backendReadGuard;
    emit('backend-read-guard-ready', D.__backendReadGuard);
    try{ console.info('[CX.backend.read-guard] ok', D.__backendReadGuard); }catch(_){ }
    if(anomalies.length) warn('anomalies', anomalies);
    return D.__backendReadGuard;
  }

  function bind(){
    if(!CX.bus || typeof CX.bus.on !== 'function') return;
    CX.bus.on('backend-ready', function(){ setTimeout(runGuard, 0); });
    CX.bus.on('project', function(){ setTimeout(runGuard, 0); });
  }

  window.CX_BACKEND_RUN_READ_GUARD = runGuard;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
