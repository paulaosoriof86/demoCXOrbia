/* CXOrbia TyA — Phase A operational synchronization bridge v1.
   Purpose: enforce the architecture agreed from the start without touching UI modules.

   Authority split:
   - HR live owns periods, visits and observed operational milestones.
   - Firestore/platform owns applications, protected profiles and platform-originated decisions.
   - platform assignment overlays may project immediately while HR sync is pending.
   - conflicts never overwrite HR silently.
   - every write remains behind CX.commandAdapter + provider ACK.

   This file performs no provider write, no HR write, no localStorage persistence and no deploy.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='tya-phase-a-operational-sync-v1';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const now=()=>new Date().toISOString();
  const isSyntheticHrPost=p=>/^hr-post-/i.test(str(p?.id||p?.applicationId||p?.postulationId));
  const visitIdOf=v=>str(v?.visitId||v?.id);
  const hrRowIdOf=v=>str(v?.hrRowId);
  const versionOf=v=>v?.version ?? v?.updatedAt ?? v?.lastSyncedAt ?? v?.sourceRevision ?? 'source-current';

  function exactVisitMatch(base,overlay){
    const bh=hrRowIdOf(base),oh=hrRowIdOf(overlay);
    if(bh&&oh)return bh===oh;
    const bi=visitIdOf(base),oi=visitIdOf(overlay);
    return !!bi&&!!oi&&bi===oi;
  }

  function normalizedSyncStatus(v){
    const s=str(v?.assignmentSyncStatus).toLowerCase();
    if(s==='pending')return 'pending_hr';
    return s;
  }

  function isPlatformOverlay(v){
    const source=str(v?.assignmentSource).toLowerCase();
    const status=normalizedSyncStatus(v);
    return source==='platform'&&['pending_hr','synced','conflict'].includes(status)&&!!str(v?.shopperId);
  }

  function applyPlatformAssignmentOverlay(base,overlay){
    if(!base||!overlay||!isPlatformOverlay(overlay))return base;
    const out=clone(base),hrShopper=str(base.shopperId),platformShopper=str(overlay.shopperId);
    if(!hrShopper){
      out.shopperId=platformShopper;
      if(overlay.shopper)out.shopper=overlay.shopper;
      if(overlay.shopperCode)out.shopperCode=overlay.shopperCode;
      out.estado='asignada';
      out.status='asignada';
      out.assignmentSource='platform';
      out.assignmentSyncStatus='pending_hr';
      out.lastSyncedAt=overlay.lastSyncedAt||null;
      out.__platformPendingAssignment=true;
      out.__hrOwnedOperational=true;
      out.canonicalFacets=Object.assign({},out.canonicalFacets||{},{assigned:true,available:false});
      return out;
    }
    if(hrShopper===platformShopper){
      out.assignmentSource='platform';
      out.assignmentSyncStatus='synced';
      out.lastSyncedAt=overlay.lastSyncedAt||out.lastSyncedAt||null;
      out.__platformAssignmentReflectedByHr=true;
      return out;
    }
    out.assignmentSyncStatus='conflict';
    out.syncConflict={
      code:'shopper_mismatch',
      hrShopperId:hrShopper,
      platformShopperId:platformShopper,
      reviewRequired:true,
      automaticOverwrite:false
    };
    out.reviewRequired=true;
    out.reviewReasons=[...new Set(arr(out.reviewReasons).concat(['assignment_shopper_mismatch']))];
    return out;
  }

  function prepareComposeInput(input){
    const next=clone(input||{}),hr=next.hr=next.hr||{},protectedPayload=next.protectedPayload=next.protectedPayload||{};
    const protectedPosts=arr(protectedPayload.posts).filter(p=>!isSyntheticHrPost(p));
    hr.posts=arr(hr.posts||hr._posts).filter(p=>!isSyntheticHrPost(p));
    hr._posts=hr.posts;
    protectedPayload.postulations=arr(protectedPayload.postulations).concat(protectedPosts);
    return next;
  }

  function postProcessComposition(result,input){
    if(!result||typeof result!=='object')return result;
    const protectedVisits=arr(input?.protectedPayload?.visits).filter(isPlatformOverlay);
    if(protectedVisits.length){
      result.visits=arr(result.visits).map(v=>{
        const matches=protectedVisits.filter(p=>exactVisitMatch(v,p));
        if(matches.length!==1){
          if(matches.length>1){
            const out=clone(v);out.reviewRequired=true;out.reviewReasons=[...new Set(arr(out.reviewReasons).concat(['ambiguous_platform_assignment_overlay']))];return out;
          }
          return v;
        }
        return applyPlatformAssignmentOverlay(v,matches[0]);
      });
    }
    const visitsById=new Map(arr(result.visits).map(v=>[visitIdOf(v),v]));
    const shoppersById=new Map(arr(result.shoppers).map(s=>[str(s?.shopperId||s?.id),s]));
    result.posts=arr(result.posts).filter(p=>!isSyntheticHrPost(p)).map(p=>{
      const out=clone(p),visit=visitsById.get(str(p?.visitId||p?.visitaId))||{},shopper=shoppersById.get(str(p?.shopperId))||{};
      const use=(key,value)=>{if((out[key]===undefined||out[key]===null||out[key]==='')&&value!==undefined&&value!==null&&value!=='')out[key]=clone(value);};
      use('visitaId',visitIdOf(visit));use('visitId',visitIdOf(visit));use('hrRowId',hrRowIdOf(visit));
      use('sucursal',visit.sucursal);use('ciudad',visit.ciudad);use('pais',visit.pais||visit.country);use('quincena',visit.quincena);
      use('franjaCode',visit.franjaCode);use('disponibleDesde',visit.disponibleDesde);use('honorario',visit.honorario);use('boleto',visit.boleto);
      use('comboAmt',visit.comboAmt);use('currency',visit.currency);use('fechaProp',visit.agendada||visit.disponibleDesde);
      use('shopper',shopper.nombre||visit.shopper);use('shopperCode',shopper.code||visit.shopperCode);
      return out;
    });
    if(result.diagnostics){
      result.diagnostics.syntheticHrPostsRemoved=true;
      result.diagnostics.platformAssignmentOverlaysProjected=protectedVisits.length;
      result.diagnostics.platformApplicationsAuthority='firestore_only';
    }
    return result;
  }

  function installComposerBridge(){
    const engine=root.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!engine||typeof engine.compose!=='function'||engine.__phaseAOperationalSyncV1)return false;
    const original=engine.compose.bind(engine);
    engine.compose=function(input){
      const prepared=prepareComposeInput(input);
      return postProcessComposition(original(prepared),prepared);
    };
    engine.__phaseAOperationalSyncV1=true;
    return true;
  }

  function installSnapshotSanitizer(){
    const original=root.CX_TYA_APPLY_LIVE_SNAPSHOT;
    if(typeof original!=='function'||original.__phaseAOperationalSyncV1)return false;
    const wrapped=function(snapshot,meta,options){
      const result=original(snapshot,meta,options);
      if(root.CX?.data&&Array.isArray(CX.data._posts))CX.data._posts=CX.data._posts.filter(p=>!isSyntheticHrPost(p));
      return result;
    };
    wrapped.__phaseAOperationalSyncV1=true;
    root.CX_TYA_APPLY_LIVE_SNAPSHOT=wrapped;
    return true;
  }

  function installPeriodStats(){
    const d=CX.data;if(!d)return false;
    d.periodStats=function(id){
      const vs=arr(this._visitas).filter(v=>v.projectId===id);
      const facetFn=typeof this.operationalEvidenceFacets==='function'?this.operationalEvidenceFacets.bind(this):
        (typeof this.visitFacets==='function'?this.visitFacets.bind(this):null);
      const done=facetFn?vs.filter(v=>{const f=facetFn(v)||{};return f.realized===true&&f.cancelled!==true;}).length:
        vs.filter(v=>!!v.realizada&&!v._archived).length;
      return {total:vs.length,done,pct:vs.length?Math.round(done/vs.length*100):0,source:'direct_operational_evidence'};
    };
    return true;
  }

  function commandContext(){
    try{return CX.cxDataCommandBoundary?.context?.()||CX.commandAdapter?.currentActor?.()||{};}catch(_){return {};}
  }

  async function executeAndRefresh(command){
    if(!CX.commandAdapter?.execute)return {ok:false,status:'blocked',code:'COMMAND_ADAPTER_UNAVAILABLE',providerAck:false,successUiAllowed:false};
    const result=await CX.commandAdapter.execute(command);
    if(result?.ok===true&&result?.committed===true&&result?.providerAck===true){
      try{await CX.backend?.refresh?.();}catch(_){}
    }
    return result;
  }

  function installApplicationCommands(){
    const d=CX.data;if(!d)return false;
    d.createApplication=async function(visitId,proposedDate,note,meta){
      meta=meta||{};const v=arr(this._visitas).find(x=>visitIdOf(x)===str(visitId));const c=commandContext();
      if(!v)return {ok:false,status:'blocked',code:'APPLICATION_VISIT_MISSING',providerAck:false,successUiAllowed:false};
      const shopperId=str(c.shopperId||CX.session?.user?.shopperId);
      const tenantId=str(c.tenantId||CX.BACKEND?.tenantId),projectId=str(c.projectId||v.rootProjectId||'cinepolis');
      const idempotencyKey=str(meta.idempotencyKey)||`application.create:${tenantId}:${projectId}:${visitIdOf(v)}:${shopperId}:${str(proposedDate)}`;
      return executeAndRefresh({
        commandType:'application.create',entityType:'application',entityId:null,tenantId,projectId,
        actor:{actorId:str(c.actorId),role:str(c.role),projectIds:arr(c.projectIds)},
        expectedVersion:versionOf(v),idempotencyKey,
        payload:{visitId:visitIdOf(v),hrRowId:hrRowIdOf(v)||null,shopperId,proposedDate:proposedDate||null,fechaProp:proposedDate||null,note:str(note)||null,periodId:v.projectId||null,periodKey:v.periodKey||null},
        source:'cx.data',authorization:{providerEnforcementRequired:true,permission:'application.create'}
      });
    };
    d.setApplicationStatusAck=async function(applicationId,status,meta){
      meta=meta||{};
      if(typeof this.setApplicationStatus!=='function')return {ok:false,status:'blocked',code:'APPLICATION_STATUS_BOUNDARY_UNAVAILABLE',providerAck:false,successUiAllowed:false};
      return this.setApplicationStatus(applicationId,status,Object.assign({},meta,{ackAware:true}));
    };
    return true;
  }

  function configureTransportSourceOnly(){
    CX.BACKEND=CX.BACKEND||{};
    CX.BACKEND.commandEndpoint=CX.BACKEND.commandEndpoint||'/api/tya/cinepolis/commands';
    if(CX.BACKEND.enableCommandWrites!==true)CX.BACKEND.enableCommandWrites=false;
    if(!CX.commandHttpTransport&&typeof document!=='undefined'&&!document.querySelector('script[data-cx-command-http-transport-v1]')){
      const script=document.createElement('script');
      script.src='adapters/cxorbia-command-http-transport-v1.js';
      script.async=false;script.dataset.cxCommandHttpTransportV1='true';
      script.onload=()=>{try{CX.commandHttpTransport?.activate?.();}catch(_){}};
      document.head.appendChild(script);
    }else{try{CX.commandHttpTransport?.activate?.();}catch(_){}}
  }

  function install(reason){
    const state={composer:installComposerBridge(),snapshot:installSnapshotSanitizer(),periodStats:installPeriodStats(),applicationCommands:installApplicationCommands()};
    configureTransportSourceOnly();
    root.CX_TYA_PHASE_A_OPERATIONAL_SYNC={
      ready:true,version:VERSION,reason:reason||'install',...state,
      hrAuthority:'periods_visits_operational_milestones',platformAuthority:'applications_profiles_platform_decisions',
      syntheticHrPostulations:false,platformPendingAssignmentProjection:true,conflicts:'review_no_silent_overwrite',
      commandEndpoint:CX.BACKEND?.commandEndpoint||null,commandWritesEnabled:CX.BACKEND?.enableCommandWrites===true,
      providerWrites:0,hrWrites:0,localMutation:false,localStorageTruth:false,at:now()
    };
    return true;
  }

  CX.phaseAOperationalSync=Object.freeze({version:VERSION,install,isSyntheticHrPost,prepareComposeInput,postProcessComposition,applyPlatformAssignmentOverlay});
  install('script-load');
  if(CX.bus?.on){
    ['backend-ready','backend-loaded','visit-flow'].forEach(evt=>CX.bus.on(evt,()=>queueMicrotask(()=>install(evt))));
  }
  root.addEventListener?.('cx:live-source-updated',()=>install('live-source-updated'));
})(typeof window!=='undefined'?window:globalThis);
