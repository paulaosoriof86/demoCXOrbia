/* ============================================================
   CXOrbia · Backend bridge para Automatizaciones / Make
   ------------------------------------------------------------
   No modifica módulos UI. Persiste configuración y logs en Firestore
   cuando el preview/backend está activo. No ejecuta webhooks externos
   desde cliente; producción debe usar proxy seguro/Cloud Function.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND || {};
  const col = cfg.collections || {};
  let loaded = false;

  function db(){ return window.firebase && firebase.apps && firebase.apps.length ? firebase.firestore() : null; }
  function tenantId(){ return cfg.tenantId || 'tya'; }
  function userEmail(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.email || ''; }catch(_){ return ''; } }
  function uid(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.uid || ''; }catch(_){ return ''; } }
  function tenantRef(){ const d=db(); return d ? d.collection(col.tenants || 'tenants').doc(tenantId()) : null; }
  function automationsCol(){ const t=tenantRef(); return t ? t.collection(col.automations || 'automations') : null; }
  function logsCol(){ const t=tenantRef(); return t ? t.collection(col.automationLogs || 'automationLogs') : null; }
  function integrationsCol(){ const t=tenantRef(); return t ? t.collection(col.integrationSettings || 'integrationSettings') : null; }

  function clean(obj){
    if(Array.isArray(obj)) return obj.map(clean);
    if(!obj || typeof obj !== 'object') return obj;
    const out = {};
    Object.keys(obj).forEach(k=>{ const v=obj[k]; if(v !== undefined && typeof v !== 'function') out[k]=clean(v); });
    return out;
  }

  async function load(){
    if(!cfg.enabled || !cfg.previewMode || !CX.automations) return {automations:0, integrations:0};
    const aCol = automationsCol();
    const iCol = integrationsCol();
    if(!aCol || !iCol) return {automations:0, integrations:0};
    const [aSnap, iSnap] = await Promise.all([aCol.get(), iCol.get()]);
    const autos = aSnap.docs.map(d=>Object.assign({id:d.id}, d.data() || {}));
    const integrations = iSnap.docs.map(d=>Object.assign({id:d.id}, d.data() || {}));

    if(autos.length){
      CX.automations.__backendList = autos;
      if(CX.bus) CX.bus.emit('automations', {source:'firestore', count:autos.length});
    }
    CX.automations.__backendIntegrations = integrations;
    loaded = true;
    window.CX_BACKEND_AUTOMATIONS_STATUS = {source:'firestore', automations:autos.length, integrations:integrations.length, tenantId:tenantId(), at:new Date().toISOString()};
    return window.CX_BACKEND_AUTOMATIONS_STATUS;
  }

  async function saveAutomation(item){
    const c = automationsCol();
    if(!c || !item || !item.id) return;
    const payload = Object.assign({}, clean(item), {tenantId:tenantId(), updatedAt:new Date().toISOString(), updatedBy:uid(), updatedByEmail:userEmail()});
    await c.doc(item.id).set(payload, {merge:true});
  }

  async function logAutomation(record){
    const c = logsCol();
    if(!c) return;
    const payload = Object.assign({tenantId:tenantId(), createdAt:new Date().toISOString(), createdBy:uid(), createdByEmail:userEmail()}, clean(record || {}));
    await c.doc().set(payload);
  }

  function patch(){
    const A = CX.automations;
    if(!A || A.__backendAutomationWrapped) return;
    const originalList = A.list;
    const originalSave = A.save;
    const originalFire = A.fire;

    A.list = function(){
      return this.__backendList && this.__backendList.length ? this.__backendList : originalList.call(this);
    };

    A.save = function(list){
      const result = originalSave.call(this, list);
      if(Array.isArray(list)) list.forEach(item=>saveAutomation(item).catch(e=>console.warn('[CX.backend-automations] save no persistido', e)));
      return result;
    };

    A.fire = function(evento, ctx){
      const result = originalFire.call(this, evento, ctx || {});
      logAutomation({evento:evento, ctx:ctx || {}, mode:'client-preview-log'}).catch(e=>console.warn('[CX.backend-automations] log no persistido', e));
      return result;
    };

    A.__backendAutomationWrapped = true;
  }

  function start(){
    if(!cfg.previewMode) return;
    patch();
    if(CX.bus && typeof CX.bus.on === 'function'){
      CX.bus.on('backend-ready', ()=>load().catch(e=>console.warn('[CX.backend-automations] load falló', e)));
      CX.bus.on('backend-auth-ready', ()=>setTimeout(()=>load().catch(()=>{}), 900));
    }
    setTimeout(()=>{ if(!loaded) load().catch(()=>{}); }, 2600);
  }

  CX.backendAutomations = {load, saveAutomation, logAutomation};
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
