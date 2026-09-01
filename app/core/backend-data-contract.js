/* CXOrbia backend data contract. No activa backend ni escribe datos. */
window.CX = window.CX || {};

(function(){
  const requiredMethods = [
    'project','setProject','projectsFor','programs','periodsForProgram','visitas','posts','shoppersFor','setVisitState','assignVisit','payVisits','kpis','phaseFlow','getShopper','addShopper','updateShopper','visitsForShopper','postsForShopper','shopperStats'
  ];

  const collections = {
    projects:'projects',
    visits:'visits',
    posts:'postulations',
    shoppers:'shoppers',
    shoppersPrivate:'shoppersPrivate',
    notifications:'notificationHistory',
    liquidations:'liquidationCandidates',
    audit:'auditLog'
  };

  function cleanId(v){
    return String(v||'').trim().replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,120);
  }

  function pathFor(tenantId, projectId, name){
    const t=cleanId(tenantId||'tya');
    const p=cleanId(projectId||'unknown');
    const c=collections[name]||cleanId(name);
    return `tenants/${t}/projects/${p}/${c}`;
  }

  function validateShape(data){
    const missing = requiredMethods.filter(k=>!data || typeof data[k] !== 'function');
    return { ok: missing.length===0, missing };
  }

  CX.backendDataContract = {
    version:'2026-07-03',
    requiredMethods,
    collections,
    pathFor,
    validateShape,
    safety:{ firestoreWrites:0, importsExecuted:0, deploy:0, active:false }
  };
})();
