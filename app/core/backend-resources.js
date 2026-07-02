window.CX = window.CX || {};
(function(){
  const cfg = CX.BACKEND || {};
  const col = cfg.collections || {};
  let loaded = false;

  function db(){ return window.firebase && firebase.apps && firebase.apps.length ? firebase.firestore() : null; }
  function tenantId(){ return cfg.tenantId || 'tya'; }
  function uid(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.uid || ''; }catch(_){ return ''; } }
  function role(){ return (CX.session && CX.session.role) || 'admin'; }
  function tenantRef(){ const d=db(); return d ? d.collection(col.tenants || 'tenants').doc(tenantId()) : null; }
  function resourcesCol(){ const t=tenantRef(); return t ? t.collection(col.resources || 'resources') : null; }

  function clean(obj){
    if(Array.isArray(obj)) return obj.map(clean);
    if(!obj || typeof obj !== 'object') return obj;
    const out = {};
    Object.keys(obj).forEach(k=>{ const v=obj[k]; if(v !== undefined && typeof v !== 'function') out[k]=clean(v); });
    return out;
  }

  function canSee(item){
    if(!item || item.status === 'deleted') return false;
    if(['super','admin','ops','coordinador'].includes(role())) return true;
    if(Array.isArray(item.visibleRoles) && item.visibleRoles.includes(role())) return true;
    return item.targetAll === true;
  }

  async function load(){
    if(!cfg.enabled || !cfg.previewMode) return [];
    const c = resourcesCol();
    if(!c) return [];
    const snap = await c.where('status','==','active').get();
    const items = snap.docs.map(d=>Object.assign({id:d.id}, d.data() || {})).filter(canSee);
    CX.backendResources.items = items;
    loaded = true;
    window.CX_BACKEND_RESOURCES_STATUS = {source:'firestore', count:items.length, tenantId:tenantId(), at:new Date().toISOString()};
    if(CX.bus) CX.bus.emit('resources', window.CX_BACKEND_RESOURCES_STATUS);
    return items;
  }

  async function saveMetadata(item){
    const c = resourcesCol();
    if(!c) throw new Error('Firestore no inicializado para resources');
    const payload = Object.assign({tenantId: tenantId(), status: 'active', createdAt: new Date().toISOString(), createdByUid: uid()}, clean(item || {}), {updatedAt: new Date().toISOString(), updatedByUid: uid()});
    const ref = payload.id ? c.doc(payload.id) : c.doc();
    await ref.set(payload, {merge:true});
    return Object.assign({id:ref.id}, payload);
  }

  function start(){
    if(!cfg.previewMode) return;
    if(CX.bus && typeof CX.bus.on === 'function'){
      CX.bus.on('backend-ready', ()=>load().catch(e=>console.warn('[CX.backend-resources] load fallo', e)));
      CX.bus.on('backend-auth-ready', ()=>setTimeout(()=>load().catch(()=>{}), 1000));
    }
    setTimeout(()=>{ if(!loaded) load().catch(()=>{}); }, 2800);
  }

  CX.backendResources = {items:[], load, saveMetadata};
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
