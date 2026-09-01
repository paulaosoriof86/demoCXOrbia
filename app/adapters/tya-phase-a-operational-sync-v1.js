/* CXOrbia TyA — Phase A operational authority + durable command facade v1.
   Purpose:
   - HR live owns periods, visits and observed operational milestones.
   - Platform/Firestore owns applications, decisions, identities, profiles and protected overlays.
   - Synthetic HR-derived "postulations" are forbidden.
   - UI-visible success is allowed only after provider ACK + refresh.
   - No localStorage truth and no local mutation are introduced here.
   - Assignment reconciliation uses stable technical keys only; names are never dedupe keys.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='tya-phase-a-operational-sync-v1';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const now=()=>new Date().toISOString();
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

  function isSyntheticHrPost(p){
    return !!(p&&/^hr-post-/.test(str(p.id))&&p.sourceSafe===true&&p.piiProtected===true&&str(p.source||'')!=='platform');
  }
  function stripSyntheticPosts(rows){return arr(rows).filter(p=>!isSyntheticHrPost(p));}

  function purgeSyntheticHrPosts(reason){
    const d=CX.data;if(!d)return {removed:0,remaining:0};
    const before=arr(d._posts),after=stripSyntheticPosts(before),removed=before.length-after.length;
    if(removed){d._posts=after;}
    root.CX_TYA_POSTULATION_AUTHORITY={
      version:VERSION,authority:'firestore_platform_only',syntheticHrPostsForbidden:true,
      removed,remaining:after.length,reason:reason||'runtime',at:now()
    };
    return {removed,remaining:after.length};
  }

  function wrapCanonicalComposer(){
    const model=root.CX_TYA_CUMULATIVE_READ_MODEL;
    if(!model||typeof model.compose!=='function'||model.__operationalAuthorityWrapped)return false;
    const original=model.compose.bind(model);
    model.compose=function(input){
      const next=clone(input||{});
      next.hr=next.hr||{};
      next.hr.posts=stripSyntheticPosts(next.hr.posts||next.hr._posts);
      next.hr._posts=next.hr.posts;
      const out=original(next);
      out.posts=stripSyntheticPosts(out.posts);
      if(out.diagnostics){
        out.diagnostics.syntheticHrPostsForbidden=true;
        out.diagnostics.syntheticHrPostsOutput=out.posts.filter(isSyntheticHrPost).length;
      }
      return out;
    };
    model.__operationalAuthorityWrapped=true;
    return true;
  }

  function evidenceFacets(v){
    const f=(root.CX_TYA_F10_OPERATIONAL_EVIDENCE&&typeof root.CX_TYA_F10_OPERATIONAL_EVIDENCE.facets==='function')
      ?root.CX_TYA_F10_OPERATIONAL_EVIDENCE.facets(v)
      :(v&&v.canonicalFacets)||{};
    const st=str(v&&(v.estado||v.status||v.presentationState)).toLowerCase();
    const realized=typeof f.realized==='boolean'?f.realized:!!(v&&v.realizada);
    const cancelled=typeof f.cancelled==='boolean'?f.cancelled:!!(v&&v._archived)||['cancelada','cancelled','archivada'].includes(st);
    return {realized,cancelled};
  }
  function installPeriodStats(){
    const d=CX.data;if(!d||d.__operationalPeriodStatsInstalled)return false;
    d.periodStats=function(id){
      const vs=arr(this._visitas).filter(v=>str(v.projectId)===str(id)||str(v.periodId)===str(id));
      const done=vs.filter(v=>{const f=evidenceFacets(v);return f.realized&&!f.cancelled;}).length;
      return {total:vs.length,done,pct:vs.length?Math.round(done/vs.length*100):0,source:'direct_hr_operational_evidence'};
    };
    d.__operationalPeriodStatsInstalled=true;
    return true;
  }

  function actor(){
    try{return CX.commandAdapter?.currentActor?.()||{};}catch(_){return {};}
  }
  function scope(input){
    const a=actor(),d=CX.data||{},period=typeof d.period==='function'?d.period():null;
    return {
      tenantId:str(input?.tenantId||a.tenantId||CX.BACKEND?.tenantId||'tya'),
      projectId:str(input?.projectId||period?.rootProjectId||d.currentProjectId||'cinepolis'),
      actor:a
    };
  }
  function idem(prefix,parts){
    return [prefix,...arr(parts).map(str).filter(Boolean),Date.now().toString(36)].join(':');
  }
  function versionOf(entity){return entity?.version??entity?.updatedAt??entity?.lastSyncedAt??'source-current';}
  async function execute(command){
    if(!CX.commandAdapter?.execute)return {ok:false,status:'blocked',providerAck:false,committed:false,successUiAllowed:false,code:'OPERATIONAL_COMMAND_ADAPTER_UNAVAILABLE'};
    const result=await CX.commandAdapter.execute(command);
    if(!(result?.ok===true&&result?.committed===true&&result?.providerAck===true&&result?.successUiAllowed===true))return result;
    try{if(CX.backend?.refresh)await CX.backend.refresh();}catch(error){return Object.assign({},result,{ok:false,status:'blocked',committed:true,providerAck:true,successUiAllowed:false,code:'OPERATIONAL_REFRESH_AFTER_ACK_FAILED',refreshError:str(error?.message||error)});}
    purgeSyntheticHrPosts('provider_ack_refresh');
    try{CX.bus?.emit?.('visit-flow',{reason:'operational_provider_ack_refresh'});}catch(_){}
    return Object.assign({},result,{refreshedAfterAck:true});
  }

  async function createApplication(input){
    input=input||{};const s=scope(input),visit=input.visit||arr(CX.data?._visitas).find(v=>str(v.id||v.visitId)===str(input.visitId));
    const visitId=str(input.visitId||visit?.id||visit?.visitId),shopperId=str(input.shopperId||s.actor.shopperId);
    if(!visitId)return {ok:false,status:'blocked',code:'APPLICATION_VISIT_REQUIRED'};
    if(!shopperId)return {ok:false,status:'blocked',code:'APPLICATION_SHOPPER_REQUIRED'};
    return execute({
      commandType:'application.create',entityType:'application',entityId:null,tenantId:s.tenantId,projectId:s.projectId,
      expectedVersion:'absent',idempotencyKey:str(input.idempotencyKey||idem('application.create',[visitId,shopperId])),
      payload:{visitId,shopperId,proposedDate:input.proposedDate||input.fechaProp||null,note:input.note||null,hrRowId:visit?.hrRowId||null},
      source:'cx.data',authorization:{providerEnforcementRequired:true,permission:'application.create'},
      reason:'shopper_application_durable'
    });
  }

  async function updateApplicationStatus(input){
    input=input||{};const s=scope(input),application=input.application||arr(CX.data?._posts).find(p=>str(p.id||p.applicationId||p.postulationId)===str(input.applicationId));
    const applicationId=str(input.applicationId||application?.id||application?.applicationId||application?.postulationId);
    if(!applicationId)return {ok:false,status:'blocked',code:'APPLICATION_ID_REQUIRED'};
    return execute({
      commandType:'application.status.update',entityType:'application',entityId:applicationId,tenantId:s.tenantId,projectId:s.projectId,
      expectedVersion:input.expectedVersion??versionOf(application),idempotencyKey:str(input.idempotencyKey||idem('application.status.update',[applicationId,input.status])),
      payload:{status:str(input.status).toLowerCase(),reason:input.reason||null,visitId:input.visitId||application?.visitId||application?.visitaId||null},
      source:'cx.data',authorization:{providerEnforcementRequired:true,permission:'application.status.update'},
      reason:'admin_application_decision_durable'
    });
  }

  async function assignVisit(input){
    input=input||{};const s=scope(input),visit=input.visit||arr(CX.data?._visitas).find(v=>str(v.id||v.visitId)===str(input.visitId));
    const visitId=str(input.visitId||visit?.id||visit?.visitId),shopperId=str(input.shopperId);
    if(!visitId||!shopperId)return {ok:false,status:'blocked',code:'VISIT_ASSIGN_KEYS_REQUIRED'};
    return execute({
      commandType:'visit.assign',entityType:'visit',entityId:visitId,tenantId:s.tenantId,projectId:s.projectId,
      expectedVersion:input.expectedVersion??versionOf(visit),idempotencyKey:str(input.idempotencyKey||idem('visit.assign',[visitId,shopperId])),
      payload:{visitId,shopperId,hrRowId:visit?.hrRowId||null,assignmentSource:str(input.assignmentSource||'platform'),assignmentSyncStatus:str(input.assignmentSyncStatus||'pending_hr')},
      source:'cx.data',authorization:{providerEnforcementRequired:true,permission:'visit.assign'},reason:'durable_visit_assignment'
    });
  }

  function reconcileAssignment(platformVisit,hrVisit){
    const p=platformVisit||{},h=hrVisit||{};
    const pk=[p.tenantId,p.rootProjectId||p.projectId,p.id||p.visitId,p.hrRowId].map(str);
    const hk=[h.tenantId,h.rootProjectId||h.projectId,h.id||h.visitId,h.hrRowId].map(str);
    if(!pk[0]||!pk[1]||!pk[2]||!pk[3]||!hk[0]||!hk[1]||!hk[2]||!hk[3])return {decision:'review_conflict',conflict:true,code:'stable_identity_missing',automaticOverwrite:false};
    if(pk.join('::')!==hk.join('::'))return {decision:'review_conflict',conflict:true,code:'stable_identity_mismatch',automaticOverwrite:false};
    const ps=str(p.shopperId),hs=str(h.shopperId);
    if(ps&&hs&&ps!==hs)return {decision:'review_conflict',conflict:true,code:'shopper_mismatch',automaticOverwrite:false};
    if(ps&&!hs)return {decision:'platform_to_hr_pending',conflict:false,assignmentSource:'platform',assignmentSyncStatus:'pending_hr'};
    if(!ps&&hs)return {decision:'hr_to_platform_pending',conflict:false,assignmentSource:'hr',assignmentSyncStatus:'pending_platform'};
    if(ps&&hs&&ps===hs)return {decision:'synced',conflict:false,assignmentSource:str(p.assignmentSource||h.assignmentSource||'hr'),assignmentSyncStatus:'synced'};
    return {decision:'both_unassigned_noop',conflict:false};
  }

  function installCommandFacade(){
    const d=CX.data;if(!d)return false;
    d.createApplication=createApplication;
    d.updateApplicationStatus=updateApplicationStatus;
    d.assignVisitDurable=assignVisit;
    d.reconcileAssignment=reconcileAssignment;
    d.operationalAuthority=function(){return clone(root.CX_TYA_OPERATIONAL_AUTHORITY_LOCK);};
    return true;
  }
  function activate(reason){
    wrapCanonicalComposer();
    purgeSyntheticHrPosts(reason||'activate');
    installPeriodStats();
    installCommandFacade();
    root.CX_TYA_OPERATIONAL_AUTHORITY_LOCK={
      version:VERSION,
      hrOwns:['periods','visits','observedOperationalMilestones'],
      platformOwns:['applications','applicationDecisions','users','profiles','certifications','protectedOverlays'],
      syntheticHrApplications:false,
      uiSuccessRequiresProviderAck:true,
      refreshAfterProviderAck:true,
      assignmentKey:['tenantId','projectId','visitId/hrRowId','shopperId'],
      dedupeByName:false,
      conflictPolicy:'human_review_no_silent_overwrite',
      localMutation:false,
      localStorageTruth:false,
      at:now()
    };
    return true;
  }

  root.CX_TYA_PHASE_A_OPERATIONAL_SYNC=Object.freeze({
    version:VERSION,activate,purgeSyntheticHrPosts,stripSyntheticPosts,reconcileAssignment,
    createApplication,updateApplicationStatus,assignVisit,
    status(){return clone(root.CX_TYA_OPERATIONAL_AUTHORITY_LOCK||{version:VERSION,ready:false});}
  });

  if(typeof root.addEventListener==='function'){
    root.addEventListener('cx:live-source-updated',()=>{purgeSyntheticHrPosts('live_source_updated_sync');installPeriodStats();});
    root.addEventListener('cx:protected-auth-hr-authority-ready',()=>activate('protected_authority_ready'));
    root.addEventListener('cx:full-visual-ready',()=>activate('full_visual_ready'));
  }
  if(CX.bus?.on){
    CX.bus.on('backend-ready',()=>activate('backend_ready'));
    CX.bus.on('command-committed',()=>purgeSyntheticHrPosts('command_committed'));
  }
  activate('script_ready');
  setTimeout(()=>activate('post_boot'),0);
})(typeof window!=='undefined'?window:globalThis);
