/* CXOrbia — canonical CX.data command boundary v1.
   Iteration 2 root-cause correction: keep the public CX.data method names while
   removing protected-runtime local mutation/localStorage fallbacks.

   Rules:
   - explicit demo/lab may keep the prototype mutators;
   - canonical/backend runtime owns mutations here;
   - unconverted callers fail closed synchronously before legacy code can show false success;
   - ACK-aware callers opt in explicitly and receive the Promise from CX.commandAdapter;
   - no provider transport is registered here and no provider write is executed by this file.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-cxdata-command-boundary-v1';
  const str=v=>String(v==null?'':v).trim();
  const now=()=>new Date().toISOString();
  const hash=value=>{
    const s=typeof value==='string'?value:JSON.stringify(value||{});
    let h=2166136261;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(36);
  };

  function canonicalMode(){
    return root.CX_DEV_ENTRY_CANONICAL?.canonical===true || CX.BACKEND?.enabled===true;
  }
  function ctx(){
    const d=CX.data||{};
    const c=typeof d.ctx==='function'?d.ctx():{};
    const auth=(()=>{try{return CX.backendAuth?.context?.()||{};}catch(_){return {};}})();
    const user=CX.session?.user||{};
    const effectiveRole=(CX.session?.effectiveRole&&CX.session.effectiveRole())||CX.session?.testRole||auth.role||user.role||CX.session?.role||'';
    const projectId=str(auth.projectIds?.length===1?auth.projectIds[0]:c.projectId||user.scopeProjectId||CX.BACKEND?.defaultProjectId||CX.BACKEND?.tenantProjectId||'');
    return {
      tenantId:str(auth.tenantId||c.tenantId||user.tenantId||CX.BACKEND?.tenantId),
      projectId,
      periodId:str(c.periodId||d.currentPeriodId),
      role:str(effectiveRole),
      actorId:str(auth.actorId||user.id||user.userId||user.shopperId||'authenticated-user'),
      shopperId:str(auth.shopperId||user.shopperId)||null,
      projectIds:Array.isArray(auth.projectIds)&&auth.projectIds.length?auth.projectIds.slice():(Array.isArray(user.projectIds)?user.projectIds.slice():projectId?[projectId]:[])
    };
  }
  function versionOf(entity){
    return entity?.version ?? entity?.updatedAt ?? entity?.lastSyncedAt ?? entity?.hrRevision ?? entity?.sourceRevision ?? 'source-current';
  }
  function visit(id){return (CX.data?._visitas||[]).find(v=>str(v.id||v.visitId)===str(id))||null;}
  function post(id){return (CX.data?._posts||[]).find(p=>str(p.id||p.applicationId||p.postulationId)===str(id))||null;}
  function commandMeta(meta){return meta&&typeof meta==='object'?meta:{};}
  function idempotency(type,entityId,payload,expectedVersion){return `${type}:${hash([ctx().tenantId,ctx().projectId,entityId||'',expectedVersion, payload])}`;}

  class CXCommandBlockedError extends Error{
    constructor(result){super(result?.reason||result?.code||'COMMAND_BLOCKED');this.name='CXCommandBlockedError';this.cxCommandBlocked=true;this.result=result;}
  }
  function surfaceBlocked(result){
    try{CX.bus?.emit?.('command-blocked',result);}catch(_){}
    try{CX.ui?.toast?.('Acción no ejecutada: la persistencia real aún no está habilitada para este flujo. No se modificó ningún dato.','warn',4200);}catch(_){}
    return result;
  }
  function legacyFailClosed(result){surfaceBlocked(result);throw new CXCommandBlockedError(result);}
  function execute(input,meta){
    meta=commandMeta(meta);
    if(!CX.commandAdapter?.execute){
      const r={ok:false,status:'blocked',code:'COMMAND_ADAPTER_UNAVAILABLE',successUiAllowed:false,localMutation:false,localStorageWrite:false,reason:'Command adapter no disponible.'};
      return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);
    }
    if(meta.ackAware===true) return CX.commandAdapter.execute(input);
    const r=CX.commandAdapter.blocked?CX.commandAdapter.blocked(input,'COMMAND_UI_ACK_REQUIRED',{reason:'Este consumidor todavía no declara manejo explícito del ACK del proveedor.'}):{ok:false,status:'blocked',code:'COMMAND_UI_ACK_REQUIRED',successUiAllowed:false,localMutation:false,localStorageWrite:false};
    return legacyFailClosed(r);
  }

  function buildBase(commandType,entityType,entityId,payload,expectedVersion,meta){
    const c=ctx();
    return {
      commandType,entityType,entityId:entityId||null,
      tenantId:c.tenantId,projectId:c.projectId,
      actor:{actorId:c.actorId,role:c.role,projectIds:c.projectIds},
      expectedVersion,
      idempotencyKey:idempotency(commandType,entityId,payload,expectedVersion),
      payload:Object.assign({periodId:c.periodId},payload||{}),
      source:'cx.data',
      reason:str(meta?.reason||''),
      authorization:{providerEnforcementRequired:true,permission:str(meta?.permission||'')||null}
    };
  }

  function install(reason){
    if(!canonicalMode()||!CX.data)return false;
    const D=CX.data;
    if(D.__cxCommandBoundaryVersion===VERSION)return true;
    if(!D.__prototypeMutationMethods){
      D.__prototypeMutationMethods={};
      ['addProject','setVisitState','assignVisit','payVisits','addShopper','updateShopper'].forEach(name=>{
        if(typeof D[name]==='function')D.__prototypeMutationMethods[name]=D[name];
      });
    }

    D.addProject=function(cfg){
      cfg=cfg||{};const meta=commandMeta(cfg.__commandMeta);const c=ctx();const name=str(cfg.name||cfg.client);
      const payload=Object.assign({},cfg);delete payload.__commandMeta;
      const cmd=buildBase('project.create','project',null,payload,'absent',Object.assign({permission:'project.create'},meta));
      cmd.projectId=str(cfg.id||c.projectId)||c.projectId;cmd.requireProject=false;
      return execute(cmd,meta);
    };
    D.addShopper=function(cfg){
      cfg=cfg||{};const meta=commandMeta(cfg.__commandMeta);const c=ctx();
      const built=CX.shopperAdminCommandContract?.create?.({
        tenantId:c.tenantId,projectId:c.projectId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],actorId:c.actorId,actorRole:c.role,
        expectedVersion:'absent',idempotencyKey:idempotency('shopper.create','',cfg,'absent'),profile:cfg,identity:cfg,sourceType:cfg.sourceType||'platform',sourceRef:cfg.sourceRef||null
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_CREATE_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.create'};
      return execute(built.command,meta);
    };
    D.updateShopper=function(id,patch){
      patch=patch||{};const meta=commandMeta(patch.__commandMeta);const cleanPatch=Object.assign({},patch);delete cleanPatch.__commandMeta;const c=ctx();const current=typeof D.getShopper==='function'?D.getShopper(id):null;
      const built=CX.shopperAdminCommandContract?.update?.({
        tenantId:c.tenantId,projectId:c.projectId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],actorId:c.actorId,actorRole:c.role,
        shopperId:id,expectedVersion:versionOf(current),idempotencyKey:idempotency('shopper.update',id,cleanPatch,versionOf(current)),patch:cleanPatch,identity:current||{}
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_UPDATE_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.update'};
      return execute(built.command,meta);
    };
    D.setVisitState=function(id,estado,dateField,dateVal,meta){
      meta=commandMeta(meta);const v=visit(id);const patch={estado};if(dateField&&dateVal)patch[dateField]=dateVal;
      if(meta.patch&&typeof meta.patch==='object')Object.assign(patch,meta.patch);
      const cmd=buildBase('visit.state.update','visit',id,{visitId:id,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||ctx().shopperId||null,patch},versionOf(v),Object.assign({permission:meta.permission||'visit.state.update'},meta));
      return execute(cmd,meta);
    };
    D.assignVisit=function(visitId,shopperId,meta){
      meta=commandMeta(meta);const v=visit(visitId);const cmd=buildBase('visit.assign','visit',visitId,{visitId,hrRowId:v?.hrRowId||null,shopperId,assignmentSource:meta.assignmentSource||'platform',assignmentSyncStatus:'pending'},versionOf(v),Object.assign({permission:'visit.assign'},meta));
      return execute(cmd,meta);
    };
    D.payVisits=function(ids,fechaPago,referencia,meta){
      meta=commandMeta(meta);const list=Array.isArray(ids)?ids.map(str).filter(Boolean):[];const current=list.map(visit).filter(Boolean);const expected=current.map(v=>[v.id,versionOf(v)]);
      const cmd=buildBase('finance.payment.batch','paymentBatch',idempotency('finance.payment.batch','',list,'source-current'),{visitIds:list,fechaPago:fechaPago||null,referencia:str(referencia)||null},hash(expected),Object.assign({permission:'finance.markPaid'},meta));
      return execute(cmd,meta);
    };
    D.setApplicationStatus=function(applicationId,status,meta){
      meta=commandMeta(meta);const p=post(applicationId);const cmd=buildBase('application.status.update','application',applicationId,{applicationId,visitId:p?.visitaId||p?.visitId||null,status,reason:meta.reason||null},versionOf(p),Object.assign({permission:status==='rechazada'?'postulacion.reject':'postulacion.approve'},meta));
      return execute(cmd,meta);
    };
    D.requestVisitReschedule=function(visitId,newDate,meta){
      meta=commandMeta(meta);const v=visit(visitId);const cmd=buildBase('visit.reschedule','visit',visitId,{visitId,hrRowId:v?.hrRowId||null,newDate:newDate||null,reason:meta.reason||null,requestedByShopper:meta.requestedByShopper===true,decision:meta.decision||null},versionOf(v),Object.assign({permission:'visit.reschedule'},meta));
      return execute(cmd,meta);
    };
    D.requestVisitCancel=function(visitId,meta){
      meta=commandMeta(meta);const v=visit(visitId);const cmd=buildBase('visit.cancel','visit',visitId,{visitId,hrRowId:v?.hrRowId||null,reason:meta.reason||null,requestOnly:meta.requestOnly===true},versionOf(v),Object.assign({permission:'visit.cancel'},meta));
      return execute(cmd,meta);
    };
    D.submitQuestionnaire=function(visitId,result,meta){
      meta=commandMeta(meta);const v=visit(visitId);const payload={visitId,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||ctx().shopperId||null,result:result||{}};
      const cmd=buildBase('visit.questionnaire.submit','visit',visitId,payload,versionOf(v),Object.assign({permission:'visit.questionnaire.submit'},meta));
      return execute(cmd,meta);
    };

    D.__firebaseWrapped=true; /* prevents legacy local-first Firebase wrapper from taking ownership */
    D.__cxCommandBoundaryVersion=VERSION;
    D.__backendWriteMode='command-provider-ack';
    D.__localMutationFallback=false;
    D.__localStorageWriteFallback=false;
    root.CX_CXDATA_COMMAND_BOUNDARY={ready:true,version:VERSION,canonical:true,reason:reason||'install',providerWrites:0,localMutation:false,localStoragePersistence:false,at:now()};
    return true;
  }

  function bindAfterLegacyGuards(){
    if(!canonicalMode())return;
    install('dom-ready');
    if(CX.bus?.on){
      ['backend-loaded','backend-ready','backend-error','backend-source-safe-ready','cx:protected-auth-hr-authority-ready','cx:live-source-updated'].forEach(evt=>CX.bus.on(evt,()=>queueMicrotask(()=>install(evt))));
    }
  }

  root.addEventListener?.('error',event=>{
    if(event?.error?.cxCommandBlocked===true){event.preventDefault();return false;}
  });
  CX.cxDataCommandBoundary=Object.freeze({version:VERSION,install,canonicalMode,context:ctx});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAfterLegacyGuards);
  else bindAfterLegacyGuards();
})(typeof window!=='undefined'?window:globalThis);
