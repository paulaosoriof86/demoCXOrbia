window.CX = window.CX || {};
(function(){
  const cfg = CX.BACKEND || {};
  const col = cfg.collections || {};
  let loaded = false;

  function db(){ return window.firebase && firebase.apps && firebase.apps.length ? firebase.firestore() : null; }
  function tenantId(){ return cfg.tenantId || 'tya'; }
  function uid(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.uid || ''; }catch(_){ return ''; } }
  function tenantRef(){ const d=db(); return d ? d.collection(col.tenants || 'tenants').doc(tenantId()) : null; }
  function settingsCol(){ const t=tenantRef(); return t ? t.collection(col.aiSettings || 'aiSettings') : null; }
  function logsCol(){ const t=tenantRef(); return t ? t.collection(col.aiLogs || 'aiLogs') : null; }

  function sanitize(item){
    const out = Object.assign({}, item || {});
    delete out.apiKey;
    delete out.key;
    delete out.token;
    delete out.secret;
    delete out.credential;
    return out;
  }

  async function load(){
    if(!cfg.enabled || !cfg.previewMode || !CX.ai) return null;
    const c = settingsCol();
    if(!c) return null;
    const snap = await c.where('status','==','active').limit(1).get();
    if(snap.empty){
      window.CX_BACKEND_AI_STATUS = {source:'firestore', configured:false, tenantId:tenantId(), at:new Date().toISOString()};
      return window.CX_BACKEND_AI_STATUS;
    }
    const doc = snap.docs[0];
    const data = sanitize(Object.assign({id:doc.id}, doc.data() || {}));
    CX.ai.__backendCfg = data;
    loaded = true;
    window.CX_BACKEND_AI_STATUS = {source:'firestore', configured:true, provider:data.provider || '', model:data.model || '', tenantId:tenantId(), at:new Date().toISOString()};
    if(CX.bus) CX.bus.emit('ai-settings', window.CX_BACKEND_AI_STATUS);
    return window.CX_BACKEND_AI_STATUS;
  }

  async function logUsage(record){
    const c = logsCol();
    if(!c) return;
    const payload = Object.assign({tenantId:tenantId(), createdAt:new Date().toISOString(), createdByUid:uid()}, sanitize(record || {}));
    await c.doc().set(payload);
  }

  function patch(){
    if(!CX.ai || CX.ai.__backendAiWrapped) return;
    const originalCfg = CX.ai.cfg;
    const originalReady = CX.ai.ready;
    const originalAsk = CX.ai.ask;

    CX.ai.cfg = function(){
      const base = originalCfg ? originalCfg.call(this) : {};
      return Object.assign({}, base, this.__backendCfg || {});
    };

    CX.ai.ready = function(){
      if(this.__backendCfg && this.__backendCfg.status === 'active') return true;
      return originalReady ? originalReady.call(this) : false;
    };

    CX.ai.ask = function(prompt, opts){
      logUsage({event:'ask_attempt', module:(opts && opts.module) || '', promptLength:String(prompt || '').length, mode:'preview-client'}).catch(()=>{});
      if(this.__backendCfg && !this.__backendCfg.clientCallable){
        return Promise.reject(new Error('IA configurada por backend. Ejecucion real pendiente de proxy seguro.'));
      }
      return originalAsk ? originalAsk.call(this, prompt, opts || {}) : Promise.reject(new Error('IA no disponible'));
    };

    CX.ai.__backendAiWrapped = true;
  }

  function start(){
    if(!cfg.previewMode) return;
    patch();
    if(CX.bus && typeof CX.bus.on === 'function'){
      CX.bus.on('backend-ready', ()=>load().catch(e=>console.warn('[CX.backend-ai] load fallo', e)));
      CX.bus.on('backend-auth-ready', ()=>setTimeout(()=>load().catch(()=>{}), 1100));
    }
    setTimeout(()=>{ if(!loaded) load().catch(()=>{}); }, 3000);
  }

  CX.backendAI = {load, logUsage};
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
