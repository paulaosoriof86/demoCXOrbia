/* ============================================================
   CXOrbia · Backend Operational Actions adapter (scaffold seguro)
   ------------------------------------------------------------
   Acciones persistibles y auditables para operaciones.
   Archivo nuevo; no toca módulos UI ni se activa solo.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const ns = CX.backendOperationalActions = CX.backendOperationalActions || {};

  function cfg(){ return CX.BACKEND || {}; }
  function emit(name, payload){ if(CX.bus) CX.bus.emit(name, payload || {}); }
  function warn(){ console.warn.apply(console, ['[CX.backend.actions]'].concat([].slice.call(arguments))); }

  function isReady(){
    return !!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore);
  }

  function db(){
    if(!isReady()) throw new Error('Firebase no inicializado para acciones operativas');
    return firebase.firestore();
  }

  function currentUserId(){
    try{
      const auth = firebase.auth && firebase.auth();
      return auth && auth.currentUser ? auth.currentUser.uid : null;
    }catch(_){ return null; }
  }

  function tenantId(input){
    return (input && input.tenantId) || (CX.backend && CX.backend.tenantId && CX.backend.tenantId()) || cfg().tenantId || 'tya';
  }

  function tenantRef(input){ return db().collection('tenants').doc(tenantId(input)); }
  function actionsCol(input){ return tenantRef(input).collection('operationActions'); }
  function eventsCol(input){ return tenantRef(input).collection('operationEvents'); }
  function auditCol(input){ return tenantRef(input).collection('entityAuditTrail'); }
  function locksCol(input){ return tenantRef(input).collection('operationActionLocks'); }
  function docData(d){ return Object.assign({id:d.id}, d.data() || {}); }

  function nowIso(){ return new Date().toISOString(); }

  function normalizeId(value){
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function stableActionId(input){
    const base = [
      tenantId(input),
      input.actionType,
      input.entityType,
      input.entityId,
      input.idempotencyKey || input.clientRequestId || nowIso()
    ].join('|');
    return 'act-' + normalizeId(base).slice(0, 180);
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

  function validateInput(input){
    const errors = [];
    if(!input || typeof input !== 'object') errors.push('missing-input');
    if(!input.actionType) errors.push('missing-actionType');
    if(!input.entityType) errors.push('missing-entityType');
    if(!input.entityId) errors.push('missing-entityId');
    return errors;
  }

  async function performOperationAction(input){
    input = input || {};
    const errors = validateInput(input);
    if(errors.length) return {ok:false, errors};

    const tid = tenantId(input);
    const actionId = input.actionId || stableActionId(input);
    const userId = currentUserId() || input.actorId || 'unknown-user';
    const createdAt = nowIso();
    const idempotencyKey = input.idempotencyKey || actionId;

    const payload = clean(input.payload || {});
    const actionDoc = {
      tenantId: tid,
      actionId,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: String(input.entityId),
      projectId: input.projectId || payload.projectId || null,
      status: 'requested',
      payload,
      idempotencyKey,
      createdAt,
      createdBy: userId,
      updatedAt: createdAt,
      updatedBy: userId
    };

    const eventId = `evt-${actionId}`;
    const auditId = `audit-${actionId}`;

    await db().runTransaction(async tx=>{
      const lockRef = locksCol({tenantId:tid}).doc(idempotencyKey);
      const existing = await tx.get(lockRef);
      if(existing.exists) return;

      tx.set(lockRef, {tenantId:tid, idempotencyKey, actionId, createdAt, createdBy:userId});
      tx.set(actionsCol({tenantId:tid}).doc(actionId), actionDoc, {merge:true});
      tx.set(eventsCol({tenantId:tid}).doc(eventId), {
        tenantId:tid,
        eventId,
        actionId,
        eventType:'actionRequested',
        entityType:input.entityType,
        entityId:String(input.entityId),
        createdAt,
        createdBy:userId
      }, {merge:true});
      tx.set(auditCol({tenantId:tid}).doc(auditId), {
        tenantId:tid,
        auditId,
        actionId,
        entityType:input.entityType,
        entityId:String(input.entityId),
        actionType:input.actionType,
        payload,
        createdAt,
        createdBy:userId
      }, {merge:true});
    });

    emit('operation-action-requested', {tenantId:tid, actionId, actionType:input.actionType, entityType:input.entityType, entityId:input.entityId});
    return {ok:true, actionId, status:'requested'};
  }

  async function getOperationActions(input){
    input = input || {};
    let q = actionsCol(input);
    if(input.entityType) q = q.where('entityType', '==', input.entityType);
    if(input.entityId) q = q.where('entityId', '==', String(input.entityId));
    if(input.actionType) q = q.where('actionType', '==', input.actionType);
    if(input.status) q = q.where('status', '==', input.status);
    const snap = await q.limit(input.limit || 100).get();
    return {items:snap.docs.map(docData), status:'ok'};
  }

  async function getEntityAuditTrail(input){
    input = input || {};
    if(!input.entityType || !input.entityId) return {items:[], status:'error', errors:['missing-entity']};
    const snap = await auditCol(input)
      .where('entityType', '==', input.entityType)
      .where('entityId', '==', String(input.entityId))
      .limit(input.limit || 100)
      .get();
    return {items:snap.docs.map(docData), status:'ok'};
  }

  async function safeCall(label, fn, input){
    try{ return await fn(input || {}); }
    catch(e){
      warn(label, e);
      emit('backend-error', {label:'actions-'+label, message:e.message || String(e)});
      return {ok:false, items:[], status:'error', errors:[e.message || String(e)]};
    }
  }

  Object.assign(ns, {
    isReady,
    performOperationAction(input){ return safeCall('performOperationAction', performOperationAction, input); },
    getOperationActions(input){ return safeCall('getOperationActions', getOperationActions, input); },
    getEntityAuditTrail(input){ return safeCall('getEntityAuditTrail', getEntityAuditTrail, input); }
  });
})();
