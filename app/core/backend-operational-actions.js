/* ============================================================
   CXOrbia · Backend Operational Actions adapter (Sprint 3 DEV)
   ------------------------------------------------------------
   Acciones operativas controladas y auditables.
   No toca módulos UI. No ejecuta cambios finales en visitas,
   postulaciones ni cuestionarios; solo registra solicitud,
   evento, auditoría y responsibilityLog cuando hay aprobación DEV.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const ns = CX.backendOperationalActions = CX.backendOperationalActions || {};
  const DEV_WRITE_TOKEN = 'YES_PAULA_SPRINT3_OPERATION_ACTIONS_DEV';

  function cfg(){ return CX.BACKEND || {}; }
  function emit(name, payload){ if(CX.bus && typeof CX.bus.emit === 'function') CX.bus.emit(name, payload || {}); }
  function warn(){ console.warn.apply(console, ['[CX.backend.actions]'].concat([].slice.call(arguments))); }

  function isReady(){
    return !!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore);
  }

  function db(){
    if(!isReady()) throw new Error('Firebase no inicializado para acciones operativas');
    return firebase.firestore();
  }

  function writesAllowed(input){
    const c = cfg();
    return c.enabled === true && c.previewMode === true && (
      c.enableOperationalWrites === true ||
      (input && input.devWriteToken === DEV_WRITE_TOKEN)
    );
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
  function projectRef(input){ return tenantRef(input).collection('projects').doc(String(input.projectId || '')); }
  function actionsCol(input){ return tenantRef(input).collection('operationActions'); }
  function eventsCol(input){ return tenantRef(input).collection('operationEvents'); }
  function auditCol(input){ return tenantRef(input).collection('entityAuditTrail'); }
  function locksCol(input){ return tenantRef(input).collection('operationActionLocks'); }
  function responsibilityCol(input){ return projectRef(input).collection('responsibilityLog'); }
  function docData(d){ return Object.assign({id:d.id}, d.data() || {}); }

  function nowIso(){ return new Date().toISOString(); }

  function normalizeId(value){
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
    if(input && input.requireProject !== false && !input.projectId) errors.push('missing-projectId');
    return errors;
  }

  function normalizeAction(input, defaults){
    input = input || {};
    return Object.assign({}, input, defaults || {}, {
      tenantId: input.tenantId,
      projectId: input.projectId,
      payload: clean(Object.assign({}, (defaults && defaults.payload) || {}, input.payload || {})),
      devWriteToken: input.devWriteToken,
      actorId: input.actorId,
      idempotencyKey: input.idempotencyKey || (defaults && defaults.idempotencyKey),
      clientRequestId: input.clientRequestId
    });
  }

  async function performOperationAction(input){
    input = input || {};
    const errors = validateInput(input);
    if(errors.length) return {ok:false, status:'invalid', errors};

    if(!writesAllowed(input)){
      return {
        ok:false,
        status:'blocked',
        errors:['operational-writes-disabled'],
        reason:'Las escrituras operativas Sprint 3 requieren preview DEV y aprobación explícita. No se tocó Firestore.',
        requiredDevWriteToken: DEV_WRITE_TOKEN
      };
    }

    const tid = tenantId(input);
    const actionId = input.actionId || stableActionId(input);
    const userId = currentUserId() || input.actorId || 'unknown-user';
    const createdAt = nowIso();
    const idempotencyKey = input.idempotencyKey || actionId;
    const payload = clean(input.payload || {});

    const base = {
      tenantId: tid,
      projectId: input.projectId || null,
      actionId,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: String(input.entityId),
      status: 'requested',
      payload,
      idempotencyKey,
      createdAt,
      createdBy: userId,
      updatedAt: createdAt,
      updatedBy: userId,
      source: 'backend-operational-actions-sprint3-dev'
    };

    const eventId = `evt-${actionId}`;
    const auditId = `audit-${actionId}`;
    const responsibilityId = `resp-${actionId}`;

    await db().runTransaction(async tx=>{
      const lockRef = locksCol({tenantId:tid}).doc(idempotencyKey);
      const existing = await tx.get(lockRef);
      if(existing.exists) return;

      tx.set(lockRef, {
        tenantId: tid,
        projectId: input.projectId || null,
        idempotencyKey,
        actionId,
        createdAt,
        createdBy: userId,
        source: base.source
      });

      tx.set(actionsCol({tenantId:tid}).doc(actionId), base);

      tx.set(eventsCol({tenantId:tid}).doc(eventId), Object.assign({}, base, {
        eventId,
        eventType: 'actionRequested'
      }));

      tx.set(auditCol({tenantId:tid}).doc(auditId), Object.assign({}, base, {
        auditId,
        auditType: 'operationActionRequested'
      }));

      if(input.projectId){
        tx.set(responsibilityCol({tenantId:tid, projectId:input.projectId}).doc(responsibilityId), Object.assign({}, base, {
          responsibilityId,
          responsibilityType: 'operationActionRequested'
        }));
      }
    });

    emit('operation-action-requested', {
      tenantId:tid,
      projectId:input.projectId || null,
      actionId,
      actionType:input.actionType,
      entityType:input.entityType,
      entityId:input.entityId
    });
    return {ok:true, actionId, status:'requested'};
  }

  async function getOperationActions(input){
    input = input || {};
    let q = actionsCol(input);
    if(input.projectId) q = q.where('projectId', '==', input.projectId);
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

  async function getResponsibilityLog(input){
    input = input || {};
    if(!input.projectId) return {items:[], status:'error', errors:['missing-projectId']};
    let q = responsibilityCol(input);
    if(input.entityType) q = q.where('entityType', '==', input.entityType);
    if(input.entityId) q = q.where('entityId', '==', String(input.entityId));
    if(input.actionType) q = q.where('actionType', '==', input.actionType);
    const snap = await q.limit(input.limit || 100).get();
    return {items:snap.docs.map(docData), status:'ok'};
  }

  function requestAssignVisit(input){
    input = input || {};
    return performOperationAction(normalizeAction(input, {
      actionType:'assignVisit',
      entityType:'visit',
      entityId:input.visitId,
      payload:{visitId:input.visitId, shopperId:input.shopperId, scheduledDate:input.scheduledDate || null}
    }));
  }

  function requestRescheduleVisit(input){
    input = input || {};
    return performOperationAction(normalizeAction(input, {
      actionType:'rescheduleVisit',
      entityType:'visit',
      entityId:input.visitId,
      payload:{visitId:input.visitId, newDate:input.newDate || null, reason:input.reason || null}
    }));
  }

  function requestMarkVisitCompleted(input){
    input = input || {};
    return performOperationAction(normalizeAction(input, {
      actionType:'markVisitCompleted',
      entityType:'visit',
      entityId:input.visitId,
      payload:{visitId:input.visitId, completedDate:input.completedDate || null}
    }));
  }

  function requestMarkQuestionnaire(input){
    input = input || {};
    return performOperationAction(normalizeAction(input, {
      actionType:'markQuestionnaireCompleted',
      entityType:'visit',
      entityId:input.visitId,
      payload:{visitId:input.visitId, questionnaireDate:input.questionnaireDate || null, questionnaireId:input.questionnaireId || null}
    }));
  }

  function requestMarkSubmitted(input){
    input = input || {};
    return performOperationAction(normalizeAction(input, {
      actionType:'markSubmittedValidated',
      entityType:'visit',
      entityId:input.visitId,
      payload:{visitId:input.visitId, submittedAt:input.submittedAt || null, validationStatus:input.validationStatus || 'validated'}
    }));
  }

  function requestApplicationStatus(input){
    input = input || {};
    return performOperationAction(normalizeAction(input, {
      actionType:'changeApplicationStatus',
      entityType:'application',
      entityId:input.applicationId || input.postulationId,
      payload:{applicationId:input.applicationId || null, postulationId:input.postulationId || null, status:input.status || null, reason:input.reason || null}
    }));
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
    writesAllowed,
    requiredDevWriteToken: DEV_WRITE_TOKEN,
    performOperationAction(input){ return safeCall('performOperationAction', performOperationAction, input); },
    getOperationActions(input){ return safeCall('getOperationActions', getOperationActions, input); },
    getEntityAuditTrail(input){ return safeCall('getEntityAuditTrail', getEntityAuditTrail, input); },
    getResponsibilityLog(input){ return safeCall('getResponsibilityLog', getResponsibilityLog, input); },
    requestAssignVisit(input){ return safeCall('requestAssignVisit', requestAssignVisit, input); },
    requestRescheduleVisit(input){ return safeCall('requestRescheduleVisit', requestRescheduleVisit, input); },
    requestMarkVisitCompleted(input){ return safeCall('requestMarkVisitCompleted', requestMarkVisitCompleted, input); },
    requestMarkQuestionnaire(input){ return safeCall('requestMarkQuestionnaire', requestMarkQuestionnaire, input); },
    requestMarkSubmitted(input){ return safeCall('requestMarkSubmitted', requestMarkSubmitted, input); },
    requestApplicationStatus(input){ return safeCall('requestApplicationStatus', requestApplicationStatus, input); }
  });
})();
