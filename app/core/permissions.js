/* ============================================================
   CXOrbia · Autorización por ACCIÓN (P0.5 — instrucciones V98)
   No duplica ni reemplaza la matriz de rutas/scopes existente
   (CX.roleCanAccess en core/config.js) — la complementa con una
   capa de acciones SENSIBLES puntuales dentro de un módulo ya
   visible. Fail-closed: un rol sin permiso explícito para una
   acción queda bloqueado, sin importar si el shell que usa es el
   de admin (coordinador/aliado/rol personalizado nunca heredan
   una acción sensible solo por navegar sobre el shell admin).
   ============================================================ */
window.CX = window.CX || {};

(function(){
  const LS='cx_action_perms';

  /* Acciones mínimas cubiertas (P0.5 + Bloque 3 V100). Cada una mapea a los roles que
     la tienen por defecto — super/admin siempre la tienen; el resto
     necesita estar en esta lista o en la personalización guardada.
     academy.review/academy.approve: nuevas (Bloque 3) — antes "enviar a revisión" y "aprobar"
     en Academia no tenían una acción de permiso propia (dependían de academy.publish o de nada). */
  const DEFAULTS = {
    'academy.create':        ['super','admin'],
    'academy.edit':          ['super','admin'],
    'academy.review':        ['super','admin'],
    'academy.approve':       ['super','admin'],
    'academy.duplicate':     ['super','admin'],
    'academy.archive':       ['super','admin'],
    'academy.delete':        ['super','admin'],
    'academy.restore':       ['super','admin'],
    'academy.publish':       ['super','admin'],
    'integration.configure': ['super','admin'],
    'integration.test':      ['super','admin','ops'],
    'automation.configure':  ['super','admin'],
    'certification.publish': ['super','admin'],
    'finance.markPaid':      ['super','admin'],
    'conflict.resolve':      ['super','admin','ops'],
    'diagnostics.viewSensitive': ['super','admin'],
    'postulacion.approve':   ['super','admin','ops'],
    'postulacion.reject':    ['super','admin','ops'],
    'visit.reassign':        ['super','admin'],
    'visit.cancel':          ['super','admin'],
    'visit.archive':         ['super','admin'],
    /* P1 (paquete V114→V125, matriz CRM/Documentos/Configuraci\u00f3n): antes documentos.js usaba
       role==='admin' crudo (no CX.permissions, ignoraba scope real bajo shell admin) y crm.js/
       clientes.js no ten\u00edan ning\u00fan gate de acci\u00f3n \u2014 cualquier admin pod\u00eda editar/eliminar/mover
       sin validaci\u00f3n de permiso ni contexto. */
    'documento.edit':        ['super','admin'],
    'documento.delete':      ['super','admin'],
    'cliente.edit':          ['super','admin'],
    'crm.edit':              ['super','admin'],
  };
  const DEFAULTS_KEYS = Object.keys(DEFAULTS);

  /* Bloque 3 (auditoría V100 — corrección exacta): la matriz ya NO vive en una única llave global
     de navegador sin namespace — se guarda por TENANT dentro de la misma llave de localStorage
     (`{tenantId: {actionId: [roles]}}`), igual patrón que `cx_make_hook` en core/automations.js.
     Sin tenant identificable, cae a un namespace 'default' explícito (nunca mezcla silenciosa). */
  const _tenantId=()=>{
    try{
      return (CX.session&&CX.session.user&&CX.session.user.tenantId)
        || (CX.theme&&CX.theme.active&&CX.theme.active())
        || 'default';
    }catch(e){ return 'default'; }
  };
  const _allTenants=()=>{ try{ return JSON.parse(localStorage.getItem(LS)||'{}'); }catch(e){ return {}; } };
  /* migración desde el formato legado (llave global plana `{actionId:[roles]}` sin namespace):
     se detecta si las CLAVES del objeto son IDs de acción conocidos en vez de tenantIds, y se
     traslada una única vez al tenant 'default' — nunca se pierde la personalización previa. */
  const _custom=()=>{
    const raw=_allTenants();
    const looksLegacy = Object.keys(raw).some(k=>DEFAULTS_KEYS.includes(k));
    if(looksLegacy){
      const migrated={ default: raw };
      try{ localStorage.setItem(LS, JSON.stringify(migrated)); }catch(e){}
      return migrated[_tenantId()] || {};
    }
    return raw[_tenantId()] || {};
  };
  const _save=(map)=>{
    const raw=_allTenants();
    const looksLegacy = Object.keys(raw).some(k=>DEFAULTS_KEYS.includes(k));
    const byTenant = looksLegacy ? { default: raw } : raw;
    byTenant[_tenantId()]=map;
    try{ localStorage.setItem(LS, JSON.stringify(byTenant)); }catch(e){}
  };


  CX.permissions = {
    ACTIONS: Object.keys(DEFAULTS),
    DEFAULTS,

    /* Bloque C (auditoría V101 — 20260711): muchos handlers sensibles llamaban gate(...,{},ui) con
       contexto vacío, dejando sin validar tenant/proyecto/país aunque el usuario tuviera scope
       asignado. `ctx()` construye el contexto estándar {tenantId, projectId, pais} a partir del
       proyecto activo, para que cualquier handler lo use sin tener que armarlo a mano. */
    /* Bloque 6 (corrección V103, 20260711): bug real — ctx() usaba SIEMPRE p.countries[0] como
       "el" país del contexto, incluso en proyectos multipaís (GT/HN). Un coordinador con scope
       HN evaluando una acción sobre una entidad de HN terminaba comparado contra GT (el primer
       país del arreglo), pasando el chequeo de país por accidente o fallando por accidente —
       ninguno de los dos es correcto. Ahora: el país SOLO se infiere automáticamente cuando el
       proyecto es de un único país (caso no ambiguo); en proyectos multipaís, `pais` queda
       `undefined` a menos que el LLAMADOR pase el país real de la entidad sobre la que actúa
       (extra.pais / extra.entityId con su país) — nunca se asume el primero del arreglo.
       También acepta entityType/entityId explícitos para que _contextOk pueda, en el futuro,
       validar contra el país real de la entidad en vez de solo el proyecto activo. */
    ctx(extra){
      const out={};
      try{
        const u=(CX.session&&CX.session.user)||{};
        const p=CX.data&&CX.data.period&&CX.data.period();
        out.tenantId = u.tenantId || undefined;
        out.projectId = p&&p.id || undefined;
        const countries = (p&&p.countries)||[];
        out.pais = countries.length===1 ? countries[0] : undefined; // multipaís: nunca asumir countries[0]
        out.entityType = undefined;
        out.entityId = undefined;
      }catch(e){}
      return Object.assign(out, extra||{});
    },

    /* rol EFECTIVO de una acción sensible: nunca 'admin' crudo (un coordinador/aliado/rol de
       prueba navega sobre el shell admin pero su rol real vive en session.testRole/scopeRole) */
    _effectiveRole(ctx){
      if(ctx && ctx.role) return ctx.role;
      if(CX.session && CX.session.effectiveRole) return CX.session.effectiveRole();
      return (CX.session && CX.session.role) || 'admin';
    },

    /* P0-4 (paquete genérico 20260711): permisos con CONTEXTO — no basta con "este rol puede
       hacer esta acción en general"; si el usuario tiene un scope de tenant/proyecto/país
       (coordinador, aliado, projectCoordinator con scopeProjectId, invitado con scopePaises), la
       acción sensible SOLO se permite sobre datos dentro de ESE scope. Un coordinador con permiso
       de acción 'finance.markPaid' pero scopeado a un solo proyecto no puede marcar pagado un lote
       de OTRO proyecto, aunque su rol general tenga el permiso.
       ctx admite: {role, tenantId, projectId, pais}. Todos opcionales — si el llamador no provee
       projectId/pais, no se valida ese eje (comportamiento igual al fail-closed por rol solamente,
       para no romper handlers que aún no pasan contexto — ver limitación documentada en el reporte). */
    /* P0-8 (paquete acumulado 20260711): acciones sensibles sobre entidades con país (pagos,
       certificación, reasignación/archivado/cancelación de visita, resolución de conflicto) no
       pueden pasar sin validar el eje país solo porque el llamador no lo proveyó — un usuario con
       scopePaises (coordinador/aliado regional) quedaría sin restricción real si el handler omite
       `pais`. Antes: sin `ctx.pais`, ese eje simplemente no se evaluaba (bypass silencioso). Ahora:
       si la acción es geo-sensible Y el usuario tiene scopePaises definido pero el llamador no dio
       país, se bloquea pidiendo selección explícita — nunca se asume "sin restricción". */
    GEO_SENSITIVE:['finance.markPaid','certification.publish','visit.reassign','visit.cancel','visit.archive','conflict.resolve'],
    _contextOk(ctx, actionId){
      ctx=ctx||{};
      const u=(CX.session&&CX.session.user)||{};
      /* tenant: si el llamador especifica un tenant y el usuario tiene uno propio, deben coincidir */
      if(ctx.tenantId && u.tenantId && ctx.tenantId!==u.tenantId) return {ok:false, why:'de otro tenant'};
      /* proyecto: scopeProjectId (projectCoordinator/operationsCoordinator con proyecto único) */
      if(ctx.projectId && u.scopeProjectId && ctx.projectId!==u.scopeProjectId) return {ok:false, why:'fuera de tu proyecto asignado'};
      /* país: scopePaises (coordinador/aliado con alcance regional) */
      if(ctx.pais && u.scopePaises && u.scopePaises.length && !u.scopePaises.includes(ctx.pais)) return {ok:false, why:'fuera de tu alcance de país'};
      if(!ctx.pais && u.scopePaises && u.scopePaises.length && actionId && this.GEO_SENSITIVE.includes(actionId)){
        return {ok:false, why:'requiere seleccionar el país de la entidad — tu alcance está limitado por país'};
      }
      return {ok:true, why:''};
    },

    /* matriz personalizable por tenant, igual patrón que cx_perm de rutas — un admin puede
       ampliar/restringir qué roles tienen cada acción desde Usuarios & Permisos (Avanzado). */
    matrix(){
      const c=_custom();
      const out={};
      this.ACTIONS.forEach(a=>{ out[a]= c[a] || DEFAULTS[a] || []; });
      return out;
    },
    setActionRoles(actionId, roles){
      const c=_custom(); c[actionId]=roles; _save(c);
      CX.bus&&CX.bus.emit('permissions');
    },

    /* true/false — SIEMPRE fail-closed: acción desconocida o rol sin matriz → bloqueado.
       Fail-closed real (auditoría V99): una acción NO REGISTRADA se bloquea para TODOS,
       incluido 'super' — el bypass de super solo aplica a acciones que sí existen en la matriz.
       P0-4: además del rol, valida el CONTEXTO (tenant/proyecto/país) cuando el llamador lo
       provee — super sigue teniendo bypass total (acceso pleno a todo tenant/proyecto/scope). */
    can(actionId, ctx){
      if(!this.ACTIONS.includes(actionId)) return false; /* acción desconocida → bloqueada siempre, sin excepción */
      const role=this._effectiveRole(ctx||{});
      if(role==='super') return true; /* super: acceso pleno a toda acción YA REGISTRADA, sin límite de scope */
      const allowed=this.matrix()[actionId];
      if(!allowed) return false;
      if(!allowed.includes(role)) return false;
      return this._contextOk(ctx, actionId).ok;
    },
    /* variante que además explica el motivo de bloqueo, para mostrarlo en UI */
    check(actionId, ctx){
      const role=this._effectiveRole(ctx||{});
      if(!this.ACTIONS.includes(actionId)) return {ok:false, reason:'Acción no reconocida ("'+actionId+'") — bloqueada por defecto.'};
      if(role!=='super'){
        const allowed=this.matrix()[actionId];
        if(!allowed || !allowed.includes(role)) return {ok:false, reason:'Tu rol ('+role+') no tiene el permiso de acción "'+actionId+'". Un admin puede otorgarlo en Usuarios & Permisos → Acciones.'};
        const ctxCheck=this._contextOk(ctx, actionId);
        if(!ctxCheck.ok) return {ok:false, reason:'Esta acción está fuera de tu alcance asignado ('+ctxCheck.why+').'};
      }
      return {ok:true, reason:''};
    },
    /* helper de UI: si no tiene permiso, muestra el motivo en un toast y devuelve false —
       úsalo al INICIO de cualquier handler de acción sensible, no solo para ocultar el botón. */
    gate(actionId, ctx, ui){
      const r=this.check(actionId, ctx);
      if(!r.ok && ui&&ui.toast) ui.toast('🔒 '+r.reason,'warn',4200);
      return r.ok;
    },
  };
})();
