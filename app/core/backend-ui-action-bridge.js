/* ============================================================
   CXOrbia - Backend UI Action Bridge (Sprint 6 DEV)
   ------------------------------------------------------------
   Puente seguro para preparar integracion UI/backend sin conectar
   botones reales. No toca app/modules, no muta por defecto y solo
   ejecuta acciones si el flag DEV esta activo y se envia token.
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const ns = CX.backendUiActionBridge = CX.backendUiActionBridge || {};
  const BRIDGE_TOKEN = 'YES_PAULA_SPRINT6_UI_ACTION_BRIDGE_DEV';

  function cfg(){ return CX.BACKEND || {}; }
  function actions(){ return CX.backendOperationalActions || null; }
  function now(){ return new Date().toISOString(); }

  function enabled(input){
    const c = cfg();
    return c.enabled === true &&
      c.previewMode === true &&
      c.enableUiActionBridge === true &&
      input && input.bridgeToken === BRIDGE_TOKEN;
  }

  function baseResult(input, status, extra){
    return Object.assign({
      ok: status === 'ready' || status === 'dry-run',
      status,
      bridge: 'backend-ui-action-bridge-sprint6-dev',
      tenantId: (input && input.tenantId) || cfg().tenantId || 'tya',
      projectId: input && input.projectId || null,
      actionType: input && input.actionType || null,
      entityType: input && input.entityType || null,
      entityId: input && input.entityId || null,
      at: now()
    }, extra || {});
  }

  function validate(input){
    const errors = [];
    if(!input || typeof input !== 'object') errors.push('missing-input');
    if(input && !input.actionType) errors.push('missing-actionType');
    if(input && !input.entityType) errors.push('missing-entityType');
    if(input && !input.entityId) errors.push('missing-entityId');
    if(input && !input.projectId) errors.push('missing-projectId');
    return errors;
  }

  function planAction(input){
    input = input || {};
    const errors = validate(input);
    if(errors.length) return baseResult(input, 'invalid', {ok:false, errors});
    return baseResult(input, enabled(input) ? 'ready' : 'dry-run', {
      ok: true,
      canExecute: enabled(input),
      dryRun: !enabled(input),
      requiredBridgeToken: BRIDGE_TOKEN,
      uiConnected: false,
      mutatesByDefault: false,
      message: 'Puente preparado. No hay botones UI conectados en Sprint 6.'
    });
  }

  async function requestAssignVisit(input){
    input = input || {};
    const plan = planAction(Object.assign({}, input, {
      actionType: 'assignVisit',
      entityType: 'visit',
      entityId: input.visitId || input.entityId
    }));
    if(!plan.canExecute) return plan;
    if(!actions() || typeof actions().requestAssignVisit !== 'function'){
      return baseResult(input, 'missing-actions-adapter', {ok:false});
    }
    return actions().requestAssignVisit(Object.assign({}, input, {
      devWriteToken: actions().requiredDevWriteToken
    }));
  }

  Object.assign(ns, {
    requiredBridgeToken: BRIDGE_TOKEN,
    enabled,
    planAction,
    requestAssignVisit,
    status(){
      return {
        bridge: 'backend-ui-action-bridge-sprint6-dev',
        loaded: true,
        enabled: cfg().enableUiActionBridge === true,
        previewMode: cfg().previewMode === true,
        uiConnected: false,
        mutatesByDefault: false,
        at: now()
      };
    }
  });
})();
