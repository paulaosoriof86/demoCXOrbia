/* ============================================================
   CXOrbia · Backend bridge para Tablón/Novedades
   ------------------------------------------------------------
   No modifica módulos UI. Conecta datos vivos Firestore al store
   CX.notif cuando el preview/backend está activo.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const cfg = CX.BACKEND || {};
  const col = cfg.collections || {};
  let loaded = false;

  function emit(name, payload){ if(CX.bus) CX.bus.emit(name, payload || {}); }
  function tenantId(){ return cfg.tenantId || 'tya'; }
  function role(){ return (CX.session && CX.session.role) || 'admin'; }
  function uid(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.uid || ''; }catch(_){ return ''; } }
  function currentEmail(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.email || ''; }catch(_){ return ''; } }
  function currentProjectId(){ return (CX.data && CX.data.currentProjectId) || cfg.defaultProjectId || ''; }
  function shopperId(){ return (CX.session && (CX.session.shopperId || CX.session.id)) || ''; }
  function country(){ return (CX.session && (CX.session.country || CX.session.pais || CX.session.scopeCountry)) || ''; }
  function db(){ return window.firebase && firebase.apps && firebase.apps.length ? firebase.firestore() : null; }
  function tenantRef(){ const d = db(); return d ? d.collection(col.tenants || 'tenants').doc(tenantId()) : null; }
  function bulletinsCol(){ const t = tenantRef(); return t ? t.collection(col.bulletins || 'bulletins') : null; }
  function readsCol(){ const t = tenantRef(); return t ? t.collection(col.bulletinReads || 'bulletinReads') : null; }

  function nowLabel(value){
    if(!value) return 'vigente';
    try{
      const d = value.toDate ? value.toDate() : new Date(value);
      if(Number.isNaN(d.getTime())) return 'vigente';
      return d.toLocaleDateString('es-419', {day:'2-digit', month:'short', year:'numeric'});
    }catch(_){ return 'vigente'; }
  }

  function tone(priority){
    return {urgent:'r', high:'a', normal:'b', low:'g'}[priority] || 'b';
  }

  function icon(type){
    return {news:'📢', task:'📝', alert:'⚠️', request:'📌', training:'🎓', finance:'💰', certification:'🏆'}[type] || '🔔';
  }

  function normalize(doc, readSet){
    const d = Object.assign({id:doc.id}, doc.data ? doc.data() : doc);
    const firstRole = Array.isArray(d.targetRoles) && d.targetRoles.length ? d.targetRoles[0] : role();
    return {
      id: d.id,
      to: d.toRole || firstRole || 'admin',
      tipo: d.type || 'news',
      icon: d.icon || icon(d.type),
      tono: d.tone || tone(d.priority),
      titulo: d.title || 'Novedad',
      txt: d.body || d.text || '',
      fecha: nowLabel(d.createdAt || d.activeFrom),
      leida: readSet.has(d.id),
      nav: d.actionRoute || d.nav || '',
      para: d.targetLabel || '',
      priority: d.priority || 'normal',
      source: 'firestore',
    };
  }

  async function getReadSet(userId){
    const out = new Set();
    const c = readsCol();
    if(!c || !userId) return out;
    try{
      const snap = await c.where('userId', '==', userId).get();
      snap.forEach(doc=>{ const d = doc.data() || {}; if(d.bulletinId) out.add(d.bulletinId); });
    }catch(e){ console.warn('[CX.backend-bulletins] No se pudieron leer estados de lectura', e); }
    return out;
  }

  async function queryBulletinsForUser(){
    const c = bulletinsCol();
    if(!c) return [];
    const r = role();
    const userId = uid();
    const sid = shopperId();
    const projectId = currentProjectId();
    const scopeCountry = country();
    const seen = new Map();
    const queries = [];

    if(['super','admin','ops','coordinador'].includes(r)){
      queries.push(c.where('status','==','active'));
    }else{
      queries.push(c.where('targetAll','==',true));
      queries.push(c.where('targetTenants','array-contains',tenantId()));
      queries.push(c.where('targetRoles','array-contains',r));
      if(userId) queries.push(c.where('targetUserIds','array-contains',userId));
      if(sid) queries.push(c.where('targetShopperIds','array-contains',sid));
      if(projectId) queries.push(c.where('targetProjectIds','array-contains',projectId));
      if(scopeCountry) queries.push(c.where('targetCountries','array-contains',scopeCountry));
    }

    for(const q of queries){
      try{
        const snap = await q.get();
        snap.forEach(doc=>{
          const d = doc.data ? doc.data() : {};
          if((d.status || 'active') === 'active') seen.set(doc.id, doc);
        });
      }catch(e){ console.warn('[CX.backend-bulletins] Consulta omitida', e); }
    }
    return Array.from(seen.values());
  }

  async function load(){
    const userId = uid();
    if(!cfg.enabled || !cfg.previewMode || !window.firebase || !firebase.apps || !firebase.apps.length || !CX.notif) return [];
    const readSet = await getReadSet(userId);
    const docs = await queryBulletinsForUser();
    const items = docs.map(doc=>normalize(doc, readSet));
    if(items.length){
      CX.notif._items = items.concat((CX.notif._items || []).filter(x=>x.source !== 'firestore'));
      emit('notif', {source:'firestore', count:items.length});
    }
    loaded = true;
    window.CX_BACKEND_BULLETINS_STATUS = {source:'firestore', count:items.length, role:role(), email:currentEmail(), at:new Date().toISOString()};
    return items;
  }

  async function markRead(bulletinId){
    const c = readsCol();
    const userId = uid();
    if(!c || !bulletinId || !userId) return;
    const id = userId + '_' + bulletinId;
    await c.doc(id).set({tenantId:tenantId(), bulletinId, userId, readAt:new Date().toISOString()}, {merge:true});
  }

  async function markAllRead(items){
    const list = items || (CX.notif && CX.notif._items) || [];
    await Promise.all(list.filter(x=>x && x.id).map(x=>markRead(x.id)));
  }

  async function createBulletin(data){
    const c = bulletinsCol();
    if(!c) throw new Error('Firestore no inicializado para bulletins');
    const payload = Object.assign({
      tenantId: tenantId(),
      status: 'active',
      type: 'news',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      createdBy: uid(),
      createdByEmail: currentEmail(),
    }, data || {});
    const ref = payload.id ? c.doc(payload.id) : c.doc();
    await ref.set(payload, {merge:true});
    return Object.assign({id:ref.id}, payload);
  }

  function patchNotifWrites(){
    if(!CX.notif || CX.notif.__backendBulletinsWrapped) return;
    const originalMarkRead = CX.notif.markRead;
    const originalMarkAllRead = CX.notif.markAllRead;
    const originalPush = CX.notif.push;

    CX.notif.markRead = function(id){
      const result = originalMarkRead.call(this, id);
      markRead(id).catch(e=>console.warn('[CX.backend-bulletins] markRead no persistido', e));
      return result;
    };

    CX.notif.markAllRead = function(roleArg){
      const before = this.for ? this.for(roleArg) : this._items;
      const result = originalMarkAllRead.call(this, roleArg);
      markAllRead(before).catch(e=>console.warn('[CX.backend-bulletins] markAllRead no persistido', e));
      return result;
    };

    CX.notif.push = function(n){
      const result = originalPush.call(this, n);
      if(cfg.previewMode && n && n.source !== 'firestore'){
        createBulletin({
          title: n.titulo || n.title || 'Novedad',
          body: n.txt || n.body || '',
          type: n.tipo || n.type || 'news',
          icon: n.icon,
          tone: n.tono,
          targetRoles: n.to ? [n.to] : ['admin'],
          actionRoute: n.nav || '',
        }).catch(e=>console.warn('[CX.backend-bulletins] push no persistido', e));
      }
      return result;
    };

    CX.notif.__backendBulletinsWrapped = true;
  }

  function start(){
    if(!cfg.previewMode) return;
    patchNotifWrites();
    if(CX.bus && typeof CX.bus.on === 'function'){
      CX.bus.on('backend-ready', ()=>load().catch(e=>console.warn('[CX.backend-bulletins] load falló', e)));
      CX.bus.on('backend-auth-ready', ()=>setTimeout(()=>load().catch(()=>{}), 800));
    }
    setTimeout(()=>{ if(!loaded) load().catch(()=>{}); }, 2500);
  }

  CX.backendBulletins = {load, markRead, markAllRead, createBulletin};

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
