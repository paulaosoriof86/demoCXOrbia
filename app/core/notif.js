/* ============================================================
   CXOrbia · Notificaciones (centro de eventos)
   Una sola fuente que alimenta Mi Día, Tablón/Drill y badges,
   tanto para admin como para shopper. Bidireccional:
   el equipo pide acciones al shopper y gestiona lo que el shopper pide.
   ============================================================ */
window.CX = window.CX || {};

CX.notif = {
  /* Frontend gen\u00e9rico (correcci\u00f3n 20260711): bug real \u2014 estas 6 notificaciones "demo" se
     sembraban SIN ning\u00fan gate de modo, visibles tambi\u00e9n fuera de demo. Ahora solo se siembran si
     CX.dataSource.showFixtures() es true; fuera de demo el centro de notificaciones empieza vac\u00edo
     (honesto) hasta que ocurran eventos reales v\u00eda push(). */
  _items: (function(){
    const allowSynthetic = CX.dataSource ? CX.dataSource.showFixtures() : true;
    if(!allowSynthetic) return [];
    return [
    {id:'n1', to:'admin',   tipo:'postulacion', icon:'📩', tono:'b', titulo:'Nueva postulación', txt:'Evaluador 02 se postuló a Sucursal 03', fecha:'hace 12 min', leida:false, nav:'postulaciones'},
    {id:'n2', to:'admin',   tipo:'reprog',      icon:'🔄', tono:'a', titulo:'Solicitud de reprogramación', txt:'Evaluador 05 pide nueva fecha', fecha:'hace 1 h', leida:false, nav:'postulaciones'},
    {id:'n3', to:'admin',   tipo:'realizada',   icon:'✅', tono:'g', titulo:'Visita realizada', txt:'Evaluador 01 marcó realizada · validar cuestionario', fecha:'hace 3 h', leida:false, nav:'postulaciones'},
    {id:'n4', to:'shopper', tipo:'aprobada',    icon:'✅', tono:'g', titulo:'Postulación aprobada', txt:'Tu visita a Sucursal 03 fue aprobada', fecha:'hace 20 min', leida:false, nav:'misvisitas'},
    {id:'n5', to:'shopper', tipo:'pide_fecha',  icon:'📅', tono:'a', titulo:'El equipo pide confirmar fecha', txt:'Confirma o propone fecha para Sucursal 07', fecha:'hace 40 min', leida:false, nav:'misvisitas', accion:'confirmar_fecha'},
    {id:'n6', to:'shopper', tipo:'pago',        icon:'💰', tono:'g', titulo:'Liquidación actualizada', txt:'Tu pago de Sucursal 06 pasó a "pagada (vista previa)"', fecha:'ayer', leida:true, nav:'beneficios'},
    ];
  })(),

  _validForRole(n,role){
    if(!n||n.to!==role)return false;
    const scope=(()=>{try{return CX.backendAuth?.context?.()||{};}catch(_){return {};}})();
    const tenant=String(scope.tenantId||CX.BACKEND?.tenantId||''),project=String(CX.data?.currentProjectId||'');
    if(n.tenantId&&(!tenant||String(n.tenantId)!==tenant))return false;
    if(n.projectId&&(!project||String(n.projectId)!==project))return false;
    const projects=Array.isArray(n.targetProjectIds)?n.targetProjectIds.map(String).filter(Boolean):[];
    if(projects.length&&(!project||!projects.includes(project)))return false;
    if(role!=='shopper'||n.source!=='firestore')return true;
    const ctx=(()=>{try{return CX.backendAuth?.context?.()||{};}catch(_){return {};}})();
    const sid=String(ctx.shopperId||(CX.session?.user&&CX.session.user.shopperId)||'');
    const targets=Array.isArray(n.targetShopperIds)?n.targetShopperIds.map(String).filter(Boolean):[];
    const projectTargets=Array.isArray(n.targetProjectIds)?n.targetProjectIds.map(String).filter(Boolean):[];
    const currentProject=String(CX.data?.currentProjectId||'');
    const explicitBroadcast=n.targetAll===true;
    if(!sid)return false;
    if(targets.length&&!targets.includes(sid))return false;
    if(!targets.length&&!explicitBroadcast)return false;
    if(projectTargets.length&&currentProject&&!projectTargets.includes(currentProject))return false;
    if(explicitBroadcast&&(!projectTargets.length||!currentProject))return false;
    const operationalTypes=new Set(['confirmar','cambio','reprog','agendar','cuestionario','pide_fecha','aprobada','reserva_aprobada','reprog_aprobada','reprog_rechazada','ajuste','cancel','recert']);
    if(n.operational===true||operationalTypes.has(String(n.tipo||''))){
      if(!n.entityType||!n.entityId)return false;
      if(n.entityType==='visit'){
        const v=(CX.data?._visitas||[]).find(x=>[x?.id,x?.visitId,x?.hrRowId].map(String).includes(String(n.entityId)));
        if(!v)return false;
        if(sid&&v.shopperId&&String(v.shopperId)!==sid&&String(n.tipo)!=='cancel')return false;
      }
      if(n.entityType==='application'){
        const a=(CX.data?._posts||[]).find(x=>[x?.id,x?.applicationId,x?.postulationId].map(String).includes(String(n.entityId)));
        if(!a)return false;
        if(sid&&a.shopperId&&String(a.shopperId)!==sid)return false;
      }
    }
    return true;
  },
  _visitForNotice(n){
    if(n?.entityType!=='visit'||!n.entityId)return null;
    const matches=(CX.data?._visitas||[]).filter(v=>[v?.id,v?.visitId,v?.hrRowId].filter(Boolean).map(String).includes(String(n.entityId)));
    if(matches.length!==1)return null;
    const visit=matches[0],period=String(visit.measurementPeriodId||visit.periodId||'');
    // Some accepted HR rows retain projectId as their measurement-period alias.
    const project=String(visit.operationalProjectId||(String(visit.projectId||'')!==period?visit.projectId:'')||'');
    if(n.periodId&&period&&String(n.periodId)!==period)return null;
    if(n.projectId&&project&&String(n.projectId)!==project)return null;
    if(n.tenantId&&visit.tenantId&&String(n.tenantId)!==String(visit.tenantId))return null;
    return visit;
  },
  _actionable(n){
    const type=String(n?.tipo||''),visit=this._visitForNotice(n);
    if(type==='cancel'||type==='reprog'){
      const request=visit?.[type==='cancel'?'cancelRequest':'rescheduleRequest'];
      if(!n.requestCycleId||String(request?.requestCycleId||'')!==String(n.requestCycleId))return false;
      if(!request.requestedByShopperId||!visit.shopperId||String(request.requestedByShopperId)!==String(visit.shopperId))return false;
      const targets=Array.isArray(n.targetShopperIds)?n.targetShopperIds.map(String):[];
      if(request.requestedByShopperId&&targets.length&&!targets.includes(String(request.requestedByShopperId)))return false;
      return request.status==='pending_review'||(type==='cancel'&&request.status==='approved_pending_hr');
    }
    if(n?.eventKey==='postulation_approved_visit_assigned'){
      if(!visit)return false;
      const facets=visit.canonicalFacets||{};
      return facets.assigned===true&&facets.scheduled!==true&&!visit.agendada&&facets.cancelled!==true&&!visit.cancelled;
    }
    const types=new Set(['confirmar','cambio','agendar','cuestionario','pide_fecha','reserva_aprobada','reprog_aprobada','ajuste']);
    return !!(n?.accion||n?.actionRequired===true||n?.operational===true||types.has(type));
  },
  _activeForRole(n){
    if(!n)return false;
    if(n.resolvedAt)return false;
    if(n.expiredAt&&(!Number.isFinite(Date.parse(n.expiredAt))||Date.parse(n.expiredAt)<=Date.now()))return false;
    if(n.activeFrom&&Date.parse(n.activeFrom)>Date.now())return false;
    const projectId=String(CX.data?.currentProjectId||'');
    if(n.projectId&&(!projectId||String(n.projectId)!==projectId))return false;
    if(this._actionable(n))return true;
    const periodId=String(CX.data?.currentPeriodId||'');
    if(n.periodId&&periodId&&String(n.periodId)!==periodId)return false;
    const ym=(s)=>{const m=String(s||'').match(/20\d{2}-[01]\d/);return m?m[0]:'';};
    const period=CX.data?.period?.()||{},currentYm=ym(periodId)||ym(period.periodo)||ym(period.ronda)||ym(period.name);
    const createdYm=ym(n.createdAt)||ym(n.fechaISO)||ym(n.date);
    if(currentYm&&createdYm&&createdYm!==currentYm)return false;
    return true;
  },
  for(role){ return this._items.filter(n=>this._validForRole(n,role)&&this._activeForRole(n)); },
  history(role){ return this._items.filter(n=>this._validForRole(n,role)); },
  unread(role){ return this.for(role).filter(n=>!n.leida).length; },

  push(n){
    this._items.unshift(Object.assign({id:'n'+Date.now().toString(36), fecha:'ahora', leida:false}, n));
    CX.bus && CX.bus.emit('notif');
  },
  markRead(id){ const n=this._items.find(x=>x.id===id); if(n)n.leida=true; CX.bus&&CX.bus.emit('notif'); },
  markAllRead(role){ this.for(role).forEach(n=>n.leida=true); CX.bus&&CX.bus.emit('notif'); },

  toneVar(t){ return {r:'red',a:'amber',g:'green',b:'brand',p:'purple'}[t]||'brand'; },
};
