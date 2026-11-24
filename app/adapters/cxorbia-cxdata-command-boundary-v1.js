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
  function sourceCoord(v){const tab=str(v?.sourceTab),row=str(v?.sourceRow);return tab&&row?`${tab}::${row}`:'';}
  function stableVisitKey(v,fallback){return str(v?.hrRowId)||sourceCoord(v)||str(v?.visitId||v?.id||fallback);}
  function visit(id){const key=str(id);return (CX.data?._visitas||[]).find(v=>[str(v?.id),str(v?.visitId),str(v?.hrRowId),sourceCoord(v)].filter(Boolean).includes(key))||null;}
  function protectedVisitFor(v){
    if(!v)return null;
    const rows=Array.isArray(CX.data?.__protectedVisits)?CX.data.__protectedVisits:[],hrRow=str(v.hrRowId),ids=new Set([str(v.id),str(v.visitId),str(v.__protectedVisitId)].filter(Boolean));
    const matches=rows.filter(p=>(hrRow&&str(p?.hrRowId)===hrRow)||ids.has(str(p?.id||p?.visitId)));
    return matches.length===1?matches[0]:null;
  }
  const hrFields=['escenario','tipoCombo','formato','metodoPago','franja','quincena','disponibleDesde','agendada','realizada','cuestFecha','submittedAt','shopperId','boleto','comboAmt','honorario'];
  function liveHrRows(scope){
    const snapshot=root.CX_TYA_HR_SOURCE_SAFE;
    // Use the atomically published provider values, before display fallbacks
    // turn a missing amount into 0 or a project default.
    if(snapshot?.sourceSafe===true&&snapshot.tenantId===scope.tenantId&&snapshot.projectId===scope.projectId&&Array.isArray(snapshot.visits))return snapshot.visits;
    return Array.isArray(CX.data?.__liveHrVisits)?CX.data.__liveHrVisits:[];
  }
  function hrBases(row){return Object.fromEntries(hrFields.map(key=>[key,row?.[key]===undefined||row?.[key]===''?null:row[key]]));}
  function post(id){return (CX.data?._posts||[]).find(p=>str(p.id||p.applicationId||p.postulationId)===str(id))||null;}
  function reservation(id){return (CX.data?.__protectedReservations||[]).find(r=>str(r.id||r.reservationId)===str(id))||null;}
  function commandMeta(meta){return meta&&typeof meta==='object'?meta:{};}
  function idempotency(type,entityId,payload,expectedVersion,scope){
    const c=scope||ctx();
    return `${type}:${hash([c.tenantId,c.projectId,c.periodId,entityId||'',expectedVersion,payload])}`;
  }

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
    const snapshot=root.CX_TYA_HR_SOURCE_SAFE,readScope=snapshot?.readScope;
    const sensitive=new Set(['visit.assign','visit.reassign','visit.hr.fields.update','visit.state.update','visit.reschedule','visit.cancel',
      'visit.questionnaire.submit','visit.sync.confirm','application.status.update','reservation.status.update','finance.reconcile.visit','finance.historical.reconcile']);
    if(readScope&&sensitive.has(input.commandType)){
      const scope={tenantId:input.tenantId,projectId:input.projectId},rows=liveHrRows(scope),p=input.payload||{};
      const keys=(input.commandType==='finance.historical.reconcile'?(p.visitIds||[]):[p.visitId||(input.entityType==='visit'?input.entityId:'')]).map(str).filter(Boolean);
      const covered=new Set((readScope.countryPeriods||[]).map(x=>x.countryCode+'|'+x.periodId));
      const fresh=root.CX_TYA_HR_LIVE_META?.externalReadCurrent===true&&keys.length>0&&keys.every(key=>{
        const found=rows.filter(v=>[v.id,v.visitId,v.hrRowId,...(v.durableAliasIds||[])].map(str).includes(key));
        return found.length===1&&covered.has(str(found[0].country||found[0].pais)+'|'+str(found[0].periodId));
      });
      if(!fresh){const r={ok:false,status:'blocked',code:'HR_PERIOD_FRESH_READ_REQUIRED',successUiAllowed:false,localMutation:false,localStorageWrite:false,
        reason:'Actualiza el período de esta visita desde su hoja de ruta antes de guardar.'};
        try{CX.ui?.toast?.(r.reason,'warn',5000);}catch(_){}
        return meta.ackAware?Promise.resolve(r):legacyFailClosed(r);
      }
    }
    if(!CX.commandAdapter?.execute){
      const r={ok:false,status:'blocked',code:'COMMAND_ADAPTER_UNAVAILABLE',successUiAllowed:false,localMutation:false,localStorageWrite:false,reason:'Command adapter no disponible.'};
      return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);
    }
    if(meta.ackAware===true) return CX.commandAdapter.execute(input);
    const r=CX.commandAdapter.blocked?CX.commandAdapter.blocked(input,'COMMAND_UI_ACK_REQUIRED',{reason:'Este consumidor todavía no declara manejo explícito del ACK del proveedor.'}):{ok:false,status:'blocked',code:'COMMAND_UI_ACK_REQUIRED',successUiAllowed:false,localMutation:false,localStorageWrite:false};
    return legacyFailClosed(r);
  }

  function buildBase(commandType,entityType,entityId,payload,expectedVersion,meta){
    let c=ctx();payload=Object.assign({},payload||{});
    const hrCommands=new Set(['visit.assign','visit.reassign','visit.hr.fields.update','visit.state.update',
      'visit.reschedule','visit.cancel','visit.questionnaire.submit','application.status.update','reservation.status.update','finance.reconcile.visit']);
    if(hrCommands.has(commandType)){
      const key=str(payload.visitId||(entityType==='visit'?entityId:''));
      const rows=liveHrRows(c);
      const matches=rows.filter(v=>[v.id,v.visitId,v.hrRowId,...(v.durableAliasIds||[])].map(str).includes(key));
      if(matches.length===1){
        const v=matches[0],periodId=str(v.periodId||v.measurementPeriodId),rootProject=str(v.rootProjectId||(str(v.projectId)!==periodId?v.projectId:''));
        if(periodId&&rootProject===c.projectId&&(!v.tenantId||v.tenantId===c.tenantId)){
          c=Object.assign({},c,{periodId});
          payload.baseFieldValues=payload.baseFieldValues||hrBases(v);
          payload.sourceRevision=payload.sourceRevision||str(CX.data?.previewMeta?.sourceRevision);
          payload.countryCode=str(v.country||v.pais);
        }
      }
    }
    return {
      commandType,entityType,entityId:entityId||null,
      tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,
      actor:{actorId:c.actorId,role:c.role,projectIds:c.projectIds},
      expectedVersion,
      idempotencyKey:idempotency(commandType,entityId,payload,expectedVersion,c),
      payload:Object.assign({periodId:c.periodId},payload||{}),
      source:'cx.data',
      reason:str(meta?.reason||''),
      authorization:{providerEnforcementRequired:true,permission:str(meta?.permission||'')||null}
    };
  }

  function buildFinance(commandType,entityType,entityId,payload,expectedVersion,meta){
    const cmd=buildBase(commandType,entityType,entityId,payload,expectedVersion,meta);
    if(meta?.global!==true)return cmd;
    const c=ctx(),periodId=str(meta.periodId);
    cmd.projectId=null;cmd.periodId=periodId;cmd.requireProject=false;cmd.requirePeriod=true;
    cmd.payload=Object.assign({},payload,{global:true,periodId});
    cmd.idempotencyKey=idempotency(commandType,entityId,cmd.payload,expectedVersion,{tenantId:c.tenantId,projectId:null,periodId});
    return cmd;
  }

  function install(reason){
    if(!canonicalMode()||!CX.data)return false;
    const D=CX.data;
    if(D.__cxCommandBoundaryVersion===VERSION&&D.updateShopper?.__cxCommandBoundaryVersion===VERSION)return true;
    if(!D.__prototypeMutationMethods){
      D.__prototypeMutationMethods={};
      ['addProject','setVisitState','assignVisit','reconcileFinanceVisit','payVisits','addShopper','updateShopper','adjudicateShopperIdentity','resetShopperCredential'].forEach(name=>{
        if(typeof D[name]==='function')D.__prototypeMutationMethods[name]=D[name];
      });
    }

    D.addProject=function(cfg){
      cfg=cfg||{};const meta=commandMeta(cfg.__commandMeta);const c=ctx();const name=str(cfg.name||cfg.client);
      const payload=Object.assign({},cfg);delete payload.__commandMeta;
      payload.initialPeriodId=str(payload.initialPeriodId||payload.periodId||('setup-'+hash([c.tenantId,name,payload.frecuencia,payload.periodoMedicion])));
      const cmd=buildBase('project.create','project',null,payload,'absent',Object.assign({permission:'project.create'},meta));
      cmd.projectId=null;cmd.periodId=payload.initialPeriodId;cmd.requireProject=false;
      return execute(cmd,meta);
    };
    D.updateProject=function(id,patch,meta){
      patch=patch||{};meta=commandMeta(meta||patch.__commandMeta);const cleanPatch=Object.assign({},patch);delete cleanPatch.__commandMeta;const c=ctx();
      const current=(D.__backendAllProjectRecords||[]).find(p=>str(p.id||p.projectId)===str(id))
        ||(D.projects||[]).find(p=>str(p.id||p.projectId)===str(id))||{};
      const periodId=str(cleanPatch.periodId||current.periodId||c.periodId||('setup-'+hash([c.tenantId,id,cleanPatch.name||current.name])));
      const currentVersion=versionOf(current);
      const cmd=buildBase('project.update','project',id,Object.assign({},cleanPatch,{projectId:id,periodId,version:currentVersion}),currentVersion,Object.assign({permission:'project.update'},meta));
      cmd.projectId=str(id);cmd.periodId=periodId;
      return execute(cmd,meta);
    };
    D.addShopper=function(cfg){
      cfg=cfg||{};const meta=commandMeta(cfg.__commandMeta);const c=ctx();
      const isSelfRegistration=String(cfg.via||cfg.createdVia||'').toLowerCase()==='registro';
      const sourceType=String(cfg.sourceType||'platform').toLowerCase();
      if(isSelfRegistration&&sourceType!=='hr_external'&&(!str(cfg.pais||cfg.country)||!str(cfg.municipio||cfg.municipality)||!str(cfg.ciudad||cfg.city))){
        const r=CX.commandAdapter?.blocked?.({commandType:'shopper.create',entityType:'shopper'},'SHOPPER_SELF_REGISTRATION_GEO_REQUIRED',{required:['country','municipality','city']})||{ok:false,status:'blocked'};
        return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);
      }
      const built=CX.shopperAdminCommandContract?.create?.({
        tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],actorId:c.actorId,actorRole:c.role,
        expectedVersion:'absent',idempotencyKey:idempotency('shopper.create','',cfg,'absent'),profile:cfg,identity:cfg,sourceType:cfg.sourceType||'platform',sourceRef:cfg.sourceRef||null
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_CREATE_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.create'};
      return execute(built.command,meta);
    };
    D.updateShopper=function(id,patch){
      patch=patch||{};const meta=commandMeta(patch.__commandMeta);const cleanPatch=Object.assign({},patch);delete cleanPatch.__commandMeta;const c=ctx();const current=typeof D.getShopper==='function'?D.getShopper(id):null;
      const built=CX.shopperAdminCommandContract?.update?.({
        tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],actorId:c.actorId,actorRole:c.role,
        shopperId:id,expectedVersion:versionOf(current),idempotencyKey:idempotency('shopper.update',id,cleanPatch,versionOf(current)),patch:cleanPatch,identity:current||{}
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_UPDATE_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:c.role==='shopper'?'shopper.self.update':'shopper.update'};
      return execute(built.command,meta);
    };
    D.updateShopper.__cxCommandBoundaryVersion=VERSION;
    D.adjudicateShopperIdentity=function(canonicalShopperId,aliasShopperIds,meta){
      meta=commandMeta(meta);const c=ctx(),current=typeof D.getShopper==='function'?D.getShopper(canonicalShopperId):null,expected=versionOf(current);
      const aliases=Array.isArray(aliasShopperIds)?aliasShopperIds:[];
      const built=CX.shopperAdminCommandContract?.identityAdjudicate?.({
        tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],
        actorId:c.actorId,actorRole:c.role,canonicalShopperId,aliasShopperIds:aliases,humanConfirmed:true,
        expectedVersion:expected,idempotencyKey:idempotency('shopper.identity.adjudicate',canonicalShopperId,{aliasShopperIds:[...aliases].sort(),keeperShopperId:meta.keeperShopperId||'',preserveHistoricalVisitRows:meta.preserveHistoricalVisitRows===true,authoritativeVisitIds:[...(meta.authoritativeVisitIds||[])].map(String).sort()},expected),
        keeperShopperId:meta.keeperShopperId||'',keeperAccessConfirmed:meta.keeperAccessConfirmed===true,
        reason:meta.reason||'admin_confirmed_same_human',preserveHistoricalVisitRows:meta.preserveHistoricalVisitRows===true,authoritativeVisitIds:meta.authoritativeVisitIds||[]
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_IDENTITY_ADJUDICATION_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.identity.adjudicate',humanAdjudicationRequired:true};
      return execute(built.command,meta);
    };

    D.resolveShopperIdentityReview=function(shopperIds,meta){
      meta=commandMeta(meta);const c=ctx(),ids=[...new Set((Array.isArray(shopperIds)?shopperIds:[]).map(String).map(x=>x.trim()).filter(Boolean))].sort();
      const current=ids.map(id=>typeof D.getShopper==='function'?D.getShopper(id):null).filter(Boolean);
      const expected=hash(current.map(x=>[String(x.id||x.shopperId),versionOf(x)]));
      const built=CX.shopperAdminCommandContract?.identityReviewResolve?.({
        tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],
        actorId:c.actorId,actorRole:c.role,shopperIds:ids,humanConfirmed:true,reason:meta.reason||'admin_confirmed_distinct_humans',
        evidence:meta.evidence||'',expectedVersion:expected,idempotencyKey:idempotency('shopper.identity.review.resolve',ids.join('|'),{shopperIds:ids,reason:meta.reason||'admin_confirmed_distinct_humans',evidence:meta.evidence||''},expected)
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_IDENTITY_REVIEW_RESOLUTION_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.identity.review.resolve',humanAdjudicationRequired:true};
      return execute(built.command,meta);
    };
    D.deleteShopperProfile=function(id,meta){
      meta=commandMeta(meta);const c=ctx(),current=typeof D.getShopper==='function'?D.getShopper(id):null,expected=versionOf(current);
      const built=CX.shopperAdminCommandContract?.deleteShopper?.({
        tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],
        actorId:c.actorId,actorRole:c.role,shopperId:id,humanConfirmed:true,reason:meta.reason||'admin_safe_retire',
        expectedVersion:expected,idempotencyKey:idempotency('shopper.delete',id,{shopperId:id,reason:meta.reason||'admin_safe_retire'},expected)
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_DELETE_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.delete',humanAdjudicationRequired:true};
      return execute(built.command,meta);
    };
    D.resetShopperCredential=function(id,meta){
      meta=commandMeta(meta);const c=ctx();const current=typeof D.getShopper==='function'?D.getShopper(id):null;
      const expected=versionOf(current);
      const built=CX.shopperAdminCommandContract?.credentialReset?.({
        tenantId:c.tenantId,projectId:c.projectId,periodId:c.periodId,projectIds:c.projectIds.length?c.projectIds:[c.projectId],actorId:c.actorId,actorRole:c.role,
        shopperId:id,expectedVersion:expected,idempotencyKey:idempotency('shopper.credential.reset',id,{shopperId:id},expected)
      });
      if(!built?.ok){const r=CX.commandAdapter?.blocked?.(built?.command||{},'SHOPPER_CREDENTIAL_RESET_INVALID',{errors:built?.errors||[]})||{ok:false,status:'blocked'};return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);}
      built.command.authorization={providerEnforcementRequired:true,permission:'shopper.credential.reset'};
      return execute(built.command,meta);
    };
    D.hrVisitFieldEditContext=function(id){
      const v=visit(id),scope=ctx(),rows=liveHrRows(scope),key=str(v?.visitId||v?.id||id);
      const matches=rows.filter(row=>[row.id,row.visitId,row.hrRowId,...(row.durableAliasIds||[])].map(str).includes(key));
      if(!v||matches.length!==1)return {ok:false,code:'HR_FIELD_EDITOR_LIVE_SOURCE_REQUIRED'};
      const source=matches[0],protectedVisit=protectedVisitFor(v);
      return {ok:true,baseFieldValues:hrBases(source),sourceRevision:str(CX.data?.previewMeta?.sourceRevision),
        expectedVersion:versionOf(protectedVisit||v),pendingFields:Object.assign({},protectedVisit?.hrPendingFields||{})};
    };
    D.updateHrVisitFields=function(id,patch,meta){
      meta=commandMeta(meta);const v=visit(id),visitId=str(v?.visitId||v?.id||id);
      const payload={visitId,hrRowId:v?.hrRowId||null,patch:Object.assign({},patch||{}),
        ...(meta.baseFieldValues?{baseFieldValues:meta.baseFieldValues,sourceRevision:meta.sourceRevision}: {})};
      const cmd=buildBase('visit.hr.fields.update','visit',visitId,payload,
        meta.expectedVersion??versionOf(protectedVisitFor(v)||v),Object.assign({},meta,{permission:'visit.hr.fields.update'}));
      if(meta.idempotencyKey)cmd.idempotencyKey=str(meta.idempotencyKey);
      return execute(cmd,meta);
    };
    D.setVisitState=function(id,estado,dateField,dateVal,meta){
      meta=commandMeta(meta);const v=visit(id),visitId=stableVisitKey(v,id),hrRowId=str(v?.hrRowId)||null;const patch={estado};if(dateField&&dateVal)patch[dateField]=dateVal;
      if(meta.patch&&typeof meta.patch==='object')Object.assign(patch,meta.patch);
      const cmd=buildBase('visit.state.update','visit',visitId,{visitId,hrRowId,shopperId:v?.shopperId||ctx().shopperId||null,patch},versionOf(v),Object.assign({permission:meta.permission||'visit.state.update'},meta));
      return execute(cmd,meta);
    };
    D.assignVisit=function(visitId,shopperId,meta){
      meta=commandMeta(meta);const v=visit(visitId),reassign=meta.reassign===true;
      const payload={visitId,hrRowId:v?.hrRowId||null,shopperId,assignmentSource:meta.assignmentSource||'platform',assignmentSyncStatus:'pending'};
      if(reassign){payload.scheduleDecision=meta.scheduleDecision||'keep';payload.scheduledDate=meta.scheduledDate||null;payload.franjaCode=meta.franjaCode||null;}
      const cmd=buildBase(reassign?'visit.reassign':'visit.assign','visit',visitId,payload,versionOf(v),Object.assign({permission:reassign?'visit.reassign':'visit.assign'},meta));
      return execute(cmd,meta);
    };
    D.reconcileFinanceVisit=function(visitId,meta){
      meta=commandMeta(meta);const v=visit(visitId),pv=protectedVisitFor(v);
      const expected=versionOf(pv||v);
      const cmd=buildBase('finance.reconcile.visit','financeReconciliation',visitId,{
        visitId,hrRowId:v?.hrRowId||null,sourceRevision:str(CX.data?.previewMeta?.sourceRevision||''),country:v?.pais||v?.country||null
      },expected,Object.assign({permission:'finance.reconcile'},meta));
      return execute(cmd,meta);
    };
    D.reconcileHistoricalPayments=function(ids,paymentStatus,meta){
      meta=commandMeta(meta);
      const sourceRevision=str(CX.data?.previewMeta?.sourceRevision);
      if(!sourceRevision)throw new Error('FINANCE_HISTORICAL_HR_REVISION_REQUIRED');
      if(Object.prototype.hasOwnProperty.call(meta,'sourceRevision')&&(typeof meta.sourceRevision!=='string'||meta.sourceRevision.trim()!==sourceRevision))throw new Error('FINANCE_HISTORICAL_HR_REVISION_MISMATCH');
      const list=Array.isArray(ids)?ids.map(str).filter(Boolean):[];
      const current=list.map(visit).filter(Boolean);
      const expected=current.map(v=>[v.id,versionOf(protectedVisitFor(v)||v)]);
      const visitRefs=current.map(v=>({visitId:str(v.id||v.visitId),hrRowId:str(v.hrRowId)||null}));
      const payload={visitIds:list,visitRefs,paymentStatus:str(paymentStatus).toLowerCase(),reconciliationBatchId:str(meta.reconciliationBatchId),sourceRef:str(meta.sourceRef),sourceRevision,notes:str(meta.notes)};
      const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00.000Z'))&&new Date(value+'T00:00:00.000Z').toISOString().slice(0,10)===value&&value<=now().slice(0,10);
      const hasDate=Object.prototype.hasOwnProperty.call(meta,'historicalPaymentDate'),hasAuthority=Object.prototype.hasOwnProperty.call(meta,'historicalPaymentAuthorityRef');
      if(hasDate||hasAuthority){
        if(payload.paymentStatus!=='paid'||meta.supersession!=null||!validDay(meta.historicalPaymentDate)||typeof meta.historicalPaymentAuthorityRef!=='string'||!meta.historicalPaymentAuthorityRef.trim())throw new Error('FINANCE_HISTORICAL_INITIAL_PAYMENT_DATE_PROOF_REQUIRED');
        payload.historicalPaymentDate=meta.historicalPaymentDate;payload.historicalPaymentAuthorityRef=meta.historicalPaymentAuthorityRef.trim();
      }
      if(meta.supersession!=null){
        const prior=meta.supersession;
        if(typeof prior!=='object'||Array.isArray(prior)||payload.paymentStatus!=='paid'||prior.priorPaymentStatus!=='pending'||typeof prior.priorBatchId!=='string'||!prior.priorBatchId.trim()||prior.priorBatchId.trim()===payload.reconciliationBatchId||typeof prior.authorityRef!=='string'||!prior.authorityRef.trim()||!validDay(prior.paymentDate))throw new Error('FINANCE_HISTORICAL_SUPERSESSION_PROOF_REQUIRED');
        payload.supersession={priorBatchId:prior.priorBatchId.trim(),priorPaymentStatus:'pending',authorityRef:prior.authorityRef.trim(),paymentDate:prior.paymentDate};
        if(prior.identityLinkRefsByVisitId!=null){
          const links=prior.identityLinkRefsByVisitId;
          if(typeof links!=='object'||Array.isArray(links)||Object.entries(links).some(([id,ref])=>!list.includes(id)||typeof ref!=='string'||!/^irl_[a-zA-Z0-9_-]{8,96}$/.test(ref)))throw new Error('FINANCE_HISTORICAL_EXACT_IDENTITY_LINK_SCOPE_REQUIRED');
          payload.supersession.identityLinkRefsByVisitId=Object.fromEntries(Object.entries(links));
        }
      }
      const cmd=buildBase('finance.historical.reconcile','historicalPaymentReconciliation',payload.reconciliationBatchId||null,payload,hash(expected),Object.assign({permission:'finance.reconcile'},meta));
      return execute(cmd,meta);
    };
    D.payVisits=function(ids,fechaPago,referencia,meta){
      meta=commandMeta(meta);const list=Array.isArray(ids)?ids.map(str).filter(Boolean):[];const current=list.map(visit).filter(Boolean);const expected=current.map(v=>[v.id,versionOf(protectedVisitFor(v)||v)]);
      const visitRefs=current.map(v=>({visitId:str(v.id||v.visitId),hrRowId:str(v.hrRowId)||null}));
      const cmd=buildBase('finance.payment.batch','paymentBatch',idempotency('finance.payment.batch','',list,'source-current'),{visitIds:list,visitRefs,fechaPago:fechaPago||null,referencia:str(referencia)||null},hash(expected),Object.assign({permission:'finance.markPaid'},meta));
      return execute(cmd,meta);
    };
    D.createFinancialMovement=function(rec,meta){
      rec=rec||{};meta=commandMeta(meta||rec.__commandMeta);const payload=Object.assign({},rec);delete payload.__commandMeta;
      const cmd=buildFinance('finance.movement.create','financialMovement',null,payload,'absent',Object.assign({permission:'finance.movement.write'},meta));
      return execute(cmd,meta);
    };
    D.updateFinancialMovementMetadata=function(movementId,patch,meta){
      meta=commandMeta(meta);const c=ctx();
      const matches=(Array.isArray(D.__financialMovements)?D.__financialMovements:[]).filter(row=>str(row.id)===str(movementId));
      const current=matches.length===1?matches[0]:null;
      if(!current||current.global===true||str(current.tenantId)!==c.tenantId||str(current.projectId)!==c.projectId||str(current.periodId)!==c.periodId||versionOf(current)==='source-current'){
        const result=CX.commandAdapter?.blocked?.({commandType:'finance.movement.metadata.update',entityType:'financialMovement'},'FINANCE_MOVEMENT_SOURCE_READ_REQUIRED')||{ok:false,status:'blocked',code:'FINANCE_MOVEMENT_SOURCE_READ_REQUIRED'};
        return meta.ackAware?Promise.resolve(surfaceBlocked(result)):legacyFailClosed(result);
      }
      const payload={patch:Object.assign({},patch||{}),reason:str(meta.reason),authorityRef:str(meta.authorityRef)};
      const cmd=buildBase('finance.movement.metadata.update','financialMovement',str(movementId),payload,meta.expectedVersion??versionOf(current),Object.assign({},meta,{permission:'finance.movement.write'}));
      if(meta.idempotencyKey)cmd.idempotencyKey=str(meta.idempotencyKey);
      return execute(cmd,meta);
    };
    D.createFinanceAccount=function(kind,rec,meta){
      rec=rec||{};meta=commandMeta(meta||rec.__commandMeta);const payload=Object.assign({},rec,{kind});delete payload.__commandMeta;
      const cmd=buildFinance('finance.account.create','financeAccount',null,payload,'absent',Object.assign({permission:'finance.account.write'},meta));
      return execute(cmd,meta);
    };
    D.applyFinanceAccount=function(accountId,amount,meta){
      meta=commandMeta(meta);const matches=(meta.global===true?D.__globalFinanceAccounts||[]:D.__financeAccounts||[]).filter(x=>str(x.id)===str(accountId));
      const current=meta.global===true?(matches.length===1?matches[0]:{}):(matches[0]||{});
      if(meta.global===true&&(matches.length!==1||current.global!==true||current.projectId!==null||current.tenantId!==ctx().tenantId||current.periodId!==meta.periodId)){
        const result=CX.commandAdapter?.blocked?.({commandType:'finance.account.apply',entityType:'financeAccount'},'FINANCE_ACCOUNT_SOURCE_READ_REQUIRED')||{ok:false,status:'blocked',code:'FINANCE_ACCOUNT_SOURCE_READ_REQUIRED'};
        return meta.ackAware?Promise.resolve(surfaceBlocked(result)):legacyFailClosed(result);
      }
      const payload={accountId,amount,fecha:meta.fecha||null,desc:meta.desc||null};
      const cmd=buildFinance('finance.account.apply','financeAccount',accountId,payload,versionOf(current),Object.assign({permission:'finance.account.apply'},meta));
      return execute(cmd,meta);
    };
    D.saveFinanceBudget=function(rec,meta){
      rec=rec||{};meta=commandMeta(meta||rec.__commandMeta);
      const input=Object.assign({},rec);delete input.__commandMeta;
      const id=str(input.id||input.budgetId);delete input.id;delete input.budgetId;
      const current=id?(Array.isArray(D.__financeBudgets)?D.__financeBudgets:[]).find(x=>str(x.id)===id):null;
      const expected=id?versionOf(current):'absent';
      const cmd=buildBase('finance.budget.save','financeBudget',id||null,input,expected,Object.assign({permission:'finance.budget.write'},meta));
      return execute(cmd,meta);
    };
    D.deleteFinanceBudget=function(budgetId,meta){
      meta=commandMeta(meta);const id=str(budgetId);
      const current=(Array.isArray(D.__financeBudgets)?D.__financeBudgets:[]).find(x=>str(x.id)===id);
      if(!current){
        const blocked=CX.commandAdapter?.blocked?.({commandType:'finance.budget.delete',entityType:'financeBudget'},'FINANCE_BUDGET_SOURCE_READ_REQUIRED')||{ok:false,status:'blocked',code:'FINANCE_BUDGET_SOURCE_READ_REQUIRED'};
        return meta.ackAware?Promise.resolve(surfaceBlocked(blocked)):legacyFailClosed(blocked);
      }
      const cmd=buildBase('finance.budget.delete','financeBudget',id,{budgetId:id},versionOf(current),Object.assign({permission:'finance.budget.delete'},meta));
      return execute(cmd,meta);
    };
    [['submitClientNps','client.nps.submit','clientNps',['score','comment']],['createClientNote','client.note.create','clientNote',['subject','detail']],['requestClientMeeting','client.meeting.request','clientMeeting',['subject','date','time','mode']]].forEach(([method,type,entityType,fields])=>{
      D[method]=function(rec,meta){
        rec=rec||{};meta=commandMeta(meta);const c=ctx();
        const payload={clientRequestId:str(rec.clientRequestId)};
        fields.forEach(key=>{if(rec[key]!==undefined)payload[key]=rec[key];});
        const cmd=buildBase(type,entityType,null,payload,'absent',{permission:type});
        const actorUid=str(root.firebase?.auth?.()?.currentUser?.uid);
        cmd.actor.actorId=actorUid;
        cmd.idempotencyKey=type+':'+hash([c.tenantId,c.projectId,c.periodId,actorUid,payload.clientRequestId]);
        return execute(cmd,meta);
      };
    });
    D.createSupportTicket=function(rec,meta){
      rec=rec||{};meta=commandMeta(meta);const c=ctx();
      const payload={subject:str(rec.asunto||rec.subject),detail:str(rec.detalle||rec.detail),supportType:str(rec.tipo||rec.supportType||'Plataforma'),priority:str(rec.prio||rec.priority||'media'),requesterName:str(rec.de||rec.requesterName),clientRequestId:str(rec.clientRequestId)};
      const cmd=buildBase('support.ticket.create','supportTicket',null,payload,'absent',Object.assign({permission:'support.ticket.create'},meta));
      if(payload.clientRequestId)cmd.idempotencyKey='support.ticket.create:'+hash([c.tenantId,c.projectId,c.periodId,c.actorId,payload.clientRequestId]);
      return execute(cmd,meta);
    };
    D.updateSupportTicket=function(ticketId,patch,meta){
      patch=patch&&typeof patch==='object'?patch:{};meta=commandMeta(meta);
      const current=(CX.backendBulletins?.cachedSupportTickets?.()||[]).find(x=>str(x.id)===str(ticketId))||{};
      const payload={status:str(patch.estado||patch.status),note:str(patch.nota??patch.note),ownerName:str(patch.responsable??patch.ownerName)};
      const cmd=buildBase('support.ticket.update','supportTicket',ticketId,payload,versionOf(current),Object.assign({permission:'support.ticket.update'},meta));
      return execute(cmd,meta);
    };
    D.createReservation=function(rec,meta){
      rec=rec||{};meta=commandMeta(meta);const payload=Object.assign({},rec);delete payload.__commandMeta;
      const cmd=buildBase('reservation.create','reservation',null,payload,'absent',Object.assign({permission:'reservation.create'},meta));
      return execute(cmd,meta);
    };
    D.setReservationStatus=function(reservationId,status,extra,meta){
      extra=extra&&typeof extra==='object'?extra:{};meta=commandMeta(meta);const current=reservation(reservationId);
      const payload=Object.assign({reservationId,status},extra);
      const cmd=buildBase('reservation.status.update','reservation',reservationId,payload,versionOf(current),Object.assign({permission:'reservation.update'},meta));
      return execute(cmd,meta);
    };
    D.deleteReservation=function(reservationId,meta){
      meta=commandMeta(meta);const current=reservation(reservationId);
      const cmd=buildBase('reservation.delete','reservation',reservationId,{reservationId},versionOf(current),Object.assign({permission:'reservation.delete'},meta));
      return execute(cmd,meta);
    };
    D.setApplicationStatus=function(applicationId,status,meta){
      meta=commandMeta(meta);const p=post(applicationId);const cmd=buildBase('application.status.update','application',applicationId,{applicationId,visitId:p?.visitaId||p?.visitId||null,status,reason:meta.reason||null},versionOf(p),Object.assign({permission:status==='rechazada'?'postulacion.reject':'postulacion.approve'},meta));
      return execute(cmd,meta);
    };
    D.deleteApplication=function(applicationId,meta){
      meta=commandMeta(meta);const p=post(applicationId);
      if(p&&/^hr-post-/.test(str(p.id||p.applicationId||p.postulationId))&&str(p.source||'')!=='platform'){
        const r=CX.commandAdapter?.blocked?.({commandType:'application.delete',entityType:'application',entityId:applicationId},'SYNTHETIC_HR_APPLICATION_DELETE_FORBIDDEN')||{ok:false,status:'blocked'};
        return meta.ackAware?Promise.resolve(surfaceBlocked(r)):legacyFailClosed(r);
      }
      const cmd=buildBase('application.delete','application',applicationId,{applicationId,visitId:p?.visitaId||p?.visitId||null,reason:meta.reason||null},versionOf(p),Object.assign({permission:'application.delete'},meta));
      return execute(cmd,meta);
    };
    D.requestVisitReschedule=function(visitId,newDate,meta){
      meta=commandMeta(meta);const v=visit(visitId);const cmd=buildBase('visit.reschedule','visit',visitId,{visitId,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||ctx().shopperId||null,newDate:newDate||null,reason:meta.reason||null,requestedByShopper:meta.requestedByShopper===true,decision:meta.decision||null,franjaCode:meta.franjaCode||null},versionOf(v),Object.assign({permission:'visit.reschedule'},meta));
      return execute(cmd,meta);
    };
    D.requestVisitCancel=function(visitId,meta){
      meta=commandMeta(meta);const v=visit(visitId);const cmd=buildBase('visit.cancel','visit',visitId,{visitId,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||ctx().shopperId||null,reason:meta.reason||null,requestOnly:meta.requestOnly===true,decision:meta.decision||null,releaseToAvailable:meta.releaseToAvailable===true},versionOf(v),Object.assign({permission:'visit.cancel'},meta));
      return execute(cmd,meta);
    };
    D.submitQuestionnaire=function(visitId,result,meta){
      meta=commandMeta(meta);const v=visit(visitId);const payload={visitId,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||ctx().shopperId||null,result:result||{}};
      const cmd=buildBase('visit.questionnaire.submit','visit',visitId,payload,versionOf(v),Object.assign({permission:'visit.questionnaire.submit'},meta));
      return execute(cmd,meta);
    };
    D.recordVisitCheckinEvidence=function(visitId,evidence,meta){
      meta=commandMeta(meta);evidence=evidence||{};const v=visit(visitId),c=ctx();
      const payload={visitId,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||c.shopperId||null,
        evidenceId:str(evidence.evidenceId),storagePath:str(evidence.storagePath),checksum:str(evidence.checksum),
        mimeType:str(evidence.mimeType),size:Number(evidence.size||0),storageProviderAck:evidence.storageProviderAck===true,
        lat:Number(evidence.lat),lon:Number(evidence.lon),accuracy:Number(evidence.accuracy||0),capturedAt:str(evidence.capturedAt)};
      const cmd=buildBase('visit.checkin.evidence','visitEvidence',visitId,payload,versionOf(v),Object.assign({permission:'visit.checkin.evidence'},meta));
      cmd.idempotencyKey='visit.checkin.evidence:'+hash([c.tenantId,c.projectId,c.periodId,visitId,payload.evidenceId,payload.checksum]);
      return execute(cmd,meta);
    };
    D.recordResourceReadReceipt=function(visitId,resource,meta){
      meta=commandMeta(meta);resource=resource||{};const v=visit(visitId),c=ctx();
      const payload={visitId,hrRowId:v?.hrRowId||null,shopperId:v?.shopperId||c.shopperId||null,
        resourceId:str(resource.id||resource.resourceId),resourceRevision:str(resource.contentRevision||resource.version||resource.updatedAt||'source-current'),
        resourceType:str(resource.resourceType||resource.tipo||'project_resource'),readAt:now(),humanConfirmed:true};
      const cmd=buildBase('resource.read.receipt','resourceReadReceipt',payload.resourceId,payload,versionOf(v),Object.assign({permission:'resource.read.receipt'},meta));
      cmd.idempotencyKey='resource.read.receipt:'+hash([c.tenantId,c.projectId,c.periodId,visitId,payload.resourceId,payload.resourceRevision,c.shopperId]);
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
    const tryInstall=reason=>{if(canonicalMode())install(reason);};
    /* Canonical mode can become true after this script loads. Bind first; decide on each event.
       Returning early here leaves shoppers-store.updateShopper permanently fail-closed. */
    tryInstall('dom-ready');
    if(CX.bus?.on){
      ['backend-loaded','backend-ready','backend-error','backend-source-safe-ready','cx:protected-auth-hr-authority-ready','cx:live-source-updated'].forEach(evt=>CX.bus.on(evt,()=>queueMicrotask(()=>tryInstall(evt))));
    }
    root.addEventListener?.('cx:full-visual-ready',()=>queueMicrotask(()=>tryInstall('full-visual-ready')));
    [0,250,1000,2500,5000,10000,20000,30000].forEach(ms=>setTimeout(()=>tryInstall('deferred-'+ms),ms));
  }

  root.addEventListener?.('error',event=>{
    if(event?.error?.cxCommandBlocked===true){event.preventDefault();return false;}
  });
  function commercialCommand(commandType,entityType,entityId,payload,expectedVersion,permission){
    const scope=ctx(),body=payload&&typeof payload==='object'?JSON.parse(JSON.stringify(payload)):{};
    const cmd={
      commandType,entityType,entityId:entityId||null,tenantId:scope.tenantId,projectId:null,periodId:null,
      requireProject:false,requirePeriod:false,actor:{actorId:scope.actorId,role:scope.role,projectIds:scope.projectIds},
      expectedVersion,idempotencyKey:idempotency(commandType,entityId,body,expectedVersion,{tenantId:scope.tenantId,projectId:'',periodId:''}),
      payload:body,source:'commercial-ui',authorization:{providerEnforcementRequired:true,permission}
    };
    return execute(cmd,{ackAware:true,reason:'commercial-durable-write'});
  }
  CX.commercialCommandBoundary=Object.freeze({
    version:'cxorbia-commercial-command-boundary-v1',canonicalMode,context:ctx,
    createClient:payload=>commercialCommand('client.create','client',payload?.id||null,payload,'absent','cliente.edit'),
    updateClient:(id,payload,version)=>commercialCommand('client.update','client',id,payload,version,'cliente.edit'),
    createAccount:payload=>commercialCommand('crm.account.create','crmAccount',payload?.id||null,payload,'absent','crm.edit'),
    updateAccount:(id,payload,version)=>commercialCommand('crm.account.update','crmAccount',id,payload,version,'crm.edit'),
    createContact:payload=>commercialCommand('crm.contact.create','crmContact',payload?.id||null,payload,'absent','crm.edit'),
    updateContact:(id,payload,version)=>commercialCommand('crm.contact.update','crmContact',id,payload,version,'crm.edit'),
    createOpportunity:payload=>commercialCommand('crm.opportunity.create','crmOpportunity',payload?.id||null,payload,'absent','crm.edit'),
    updateOpportunity:(id,payload,version)=>commercialCommand('crm.opportunity.update','crmOpportunity',id,payload,version,'crm.edit'),
    createColumn:payload=>commercialCommand('crm.column.create','crmColumn',payload?.id||null,payload,'absent','crm.edit'),
    updateColumn:(id,payload,version)=>commercialCommand('crm.column.update','crmColumn',id,payload,version,'crm.edit'),
    deleteColumn:(id,version)=>commercialCommand('crm.column.delete','crmColumn',id,{},version,'crm.edit')
  });
  CX.cxDataCommandBoundary=Object.freeze({version:VERSION,install,canonicalMode,context:ctx});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindAfterLegacyGuards);
  else bindAfterLegacyGuards();
})(typeof window!=='undefined'?window:globalThis);
