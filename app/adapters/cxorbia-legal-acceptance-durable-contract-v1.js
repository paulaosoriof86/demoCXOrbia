/* CXOrbia — durable legal acceptance source contract v1.
   SOURCE-ONLY in this block: this file is not added to a product entrypoint and performs no I/O.

   Purpose:
   - evaluate a provider-authoritative preloaded legal read model fail-closed;
   - prepare a human-only legal.acceptance.record command for the existing command boundary;
   - never use localStorage, browser-local acceptance, fuzzy identity, or an informational banner as legal truth;
   - never turn a client timestamp into authoritative acceptedAt (provider must stamp it).
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-legal-acceptance-durable-contract-v1';
  const ACCEPTANCE_METHOD='human_ui';
  const str=v=>String(v==null?'':v).trim();
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};

  function exactScope(input){
    input=obj(input);
    const tenantId=str(input.tenantId),scopeMode=str(input.scopeMode),projectId=str(input.projectId),role=str(input.role),authNamespace=str(input.authNamespace);
    const errors=[];
    if(!tenantId)errors.push('LEGAL_TENANT_REQUIRED');
    if(!['tenant','project'].includes(scopeMode))errors.push('LEGAL_SCOPE_MODE_INVALID');
    if(scopeMode==='project'&&!projectId)errors.push('LEGAL_PROJECT_REQUIRED');
    if(scopeMode==='tenant'&&projectId)errors.push('LEGAL_TENANT_SCOPE_PROJECT_MUST_BE_EMPTY');
    if(!role)errors.push('LEGAL_ROLE_REQUIRED');
    if(!authNamespace)errors.push('LEGAL_AUTH_NAMESPACE_REQUIRED');
    return {ok:errors.length===0,tenantId,scopeMode,projectId:scopeMode==='project'?projectId:null,role,authNamespace,errors};
  }

  function exactCurrent(input){
    input=obj(input);
    const legalContentId=str(input.legalContentId),legalVersion=str(input.legalVersion),contentDigest=str(input.contentDigest);
    const errors=[];
    if(!legalContentId)errors.push('LEGAL_CONTENT_ID_REQUIRED');
    if(!legalVersion)errors.push('LEGAL_VERSION_REQUIRED');
    if(!/^[a-f0-9]{64}$/i.test(contentDigest))errors.push('LEGAL_CONTENT_DIGEST_SHA256_REQUIRED');
    return {ok:errors.length===0,legalContentId,legalVersion,contentDigest:contentDigest.toLowerCase(),errors};
  }

  function pendingFromProviderReadModel(input){
    input=obj(input);
    const scope=exactScope(input.scope),current=exactCurrent(input.current),snapshot=obj(input.snapshot),receipt=obj(snapshot.acceptance);
    const reasons=[];
    if(!scope.ok)reasons.push(...scope.errors);
    if(!current.ok)reasons.push(...current.errors);
    if(snapshot.authority!=='provider')reasons.push('LEGAL_PROVIDER_AUTHORITY_REQUIRED');
    if(snapshot.ready!==true)reasons.push('LEGAL_PROVIDER_SNAPSHOT_NOT_READY');
    if(snapshot.subjectExact!==true)reasons.push('LEGAL_SUBJECT_NOT_EXACT');
    if(snapshot.ambiguous===true)reasons.push('LEGAL_PROVIDER_STATE_AMBIGUOUS');
    if(str(snapshot.tenantId)!==scope.tenantId)reasons.push('LEGAL_TENANT_MISMATCH');
    if(str(snapshot.scopeMode)!==scope.scopeMode)reasons.push('LEGAL_SCOPE_MODE_MISMATCH');
    if(scope.scopeMode==='project'&&str(snapshot.projectId)!==scope.projectId)reasons.push('LEGAL_PROJECT_MISMATCH');
    if(scope.scopeMode==='tenant'&&str(snapshot.projectId))reasons.push('LEGAL_TENANT_SCOPE_PROJECT_DRIFT');
    if(str(snapshot.role)!==scope.role)reasons.push('LEGAL_ROLE_MISMATCH');
    if(str(snapshot.authNamespace)!==scope.authNamespace)reasons.push('LEGAL_AUTH_NAMESPACE_MISMATCH');
    if(str(snapshot.legalContentId)!==current.legalContentId)reasons.push('LEGAL_CURRENT_CONTENT_MISMATCH');
    if(str(snapshot.legalVersion)!==current.legalVersion)reasons.push('LEGAL_CURRENT_VERSION_MISMATCH');
    if(str(snapshot.contentDigest).toLowerCase()!==current.contentDigest)reasons.push('LEGAL_CURRENT_DIGEST_MISMATCH');
    if(receipt.status!=='accepted')reasons.push('LEGAL_ACCEPTANCE_MISSING');
    if(receipt.acceptanceMethod!==ACCEPTANCE_METHOD)reasons.push('LEGAL_ACCEPTANCE_METHOD_INVALID');
    if(receipt.subjectExact!==true)reasons.push('LEGAL_ACCEPTANCE_SUBJECT_NOT_EXACT');
    if(str(receipt.tenantId)!==scope.tenantId)reasons.push('LEGAL_ACCEPTANCE_TENANT_MISMATCH');
    if(str(receipt.scopeMode)!==scope.scopeMode)reasons.push('LEGAL_ACCEPTANCE_SCOPE_MISMATCH');
    if(scope.scopeMode==='project'&&str(receipt.projectId)!==scope.projectId)reasons.push('LEGAL_ACCEPTANCE_PROJECT_MISMATCH');
    if(str(receipt.role)!==scope.role)reasons.push('LEGAL_ACCEPTANCE_ROLE_MISMATCH');
    if(str(receipt.authNamespace)!==scope.authNamespace)reasons.push('LEGAL_ACCEPTANCE_AUTH_NAMESPACE_MISMATCH');
    if(str(receipt.legalContentId)!==current.legalContentId)reasons.push('LEGAL_ACCEPTANCE_CONTENT_MISMATCH');
    if(str(receipt.legalVersion)!==current.legalVersion)reasons.push('LEGAL_ACCEPTANCE_VERSION_MISMATCH');
    if(str(receipt.contentDigest).toLowerCase()!==current.contentDigest)reasons.push('LEGAL_ACCEPTANCE_DIGEST_MISMATCH');
    if(!str(receipt.acceptedAt))reasons.push('LEGAL_ACCEPTED_AT_REQUIRED');
    return Object.freeze({
      pending:reasons.length>0,
      accepted:reasons.length===0,
      authority:'provider',
      failClosed:true,
      reasons:Object.freeze([...new Set(reasons)]),
      legalContentId:current.legalContentId||null,
      legalVersion:current.legalVersion||null,
      scopeMode:scope.scopeMode||null
    });
  }

  function currentAuthenticatedActor(){
    let auth=null;try{auth=root.CX?.backendAuth?.context?.()||null;}catch(_){auth=null;}
    const a=obj(auth);
    return {
      authenticated:a.authenticated===true,
      tenantId:str(a.tenantId),
      role:str(a.role),
      authNamespace:str(a.authNamespace||((a.role==='shopper')?'shopper':'staff')),
      projectIds:Array.isArray(a.projectIds)?a.projectIds.map(str).filter(Boolean):[]
    };
  }

  function buildHumanAcceptanceCommand(input){
    input=obj(input);
    const actor=currentAuthenticatedActor(),scope=exactScope(input.scope),current=exactCurrent(input.current),idempotencyKey=str(input.idempotencyKey),errors=[];
    if(input.humanConfirmed!==true)errors.push('LEGAL_HUMAN_CONFIRMATION_REQUIRED');
    if(!actor.authenticated)errors.push('LEGAL_AUTHENTICATED_ACTOR_REQUIRED');
    if(!scope.ok)errors.push(...scope.errors);
    if(!current.ok)errors.push(...current.errors);
    if(actor.tenantId!==scope.tenantId)errors.push('LEGAL_ACTOR_TENANT_MISMATCH');
    if(actor.role!==scope.role)errors.push('LEGAL_ACTOR_ROLE_MISMATCH');
    if(actor.authNamespace!==scope.authNamespace)errors.push('LEGAL_ACTOR_NAMESPACE_MISMATCH');
    if(scope.scopeMode==='project'&&actor.role!=='super'&&actor.projectIds.length&&!actor.projectIds.includes(scope.projectId))errors.push('LEGAL_ACTOR_PROJECT_MISMATCH');
    if(!idempotencyKey)errors.push('LEGAL_IDEMPOTENCY_KEY_REQUIRED');
    if(errors.length)return Object.freeze({ok:false,status:'blocked',code:'LEGAL_ACCEPTANCE_COMMAND_INVALID',errors:Object.freeze([...new Set(errors)]),providerWrites:0,legalAcceptanceWrites:0,localStorageWrite:false,automaticAcceptance:false});
    if(!root.CX?.commandAdapter?.build)return Object.freeze({ok:false,status:'blocked',code:'LEGAL_COMMAND_ADAPTER_UNAVAILABLE',errors:Object.freeze(['LEGAL_COMMAND_ADAPTER_UNAVAILABLE']),providerWrites:0,legalAcceptanceWrites:0,localStorageWrite:false,automaticAcceptance:false});
    const built=root.CX.commandAdapter.build({
      commandType:'legal.acceptance.record',
      entityType:'legalAcceptance',
      entityId:null,
      tenantId:scope.tenantId,
      projectId:scope.projectId,
      requireProject:scope.scopeMode==='project',
      role:scope.role,
      expectedVersion:current.legalVersion,
      idempotencyKey,
      source:'authenticated_product_ui',
      reason:'human legal acceptance',
      payload:{
        scopeMode:scope.scopeMode,
        legalContentId:current.legalContentId,
        legalVersion:current.legalVersion,
        contentDigest:current.contentDigest,
        acceptanceMethod:ACCEPTANCE_METHOD,
        humanConfirmed:true
      },
      authorization:{
        providerEnforcementRequired:true,
        verifiedIdTokenActorRequired:true,
        actorUidFromProviderToken:true,
        selfAcceptanceOnly:true,
        humanAcceptanceRequired:true,
        automaticAcceptanceForbidden:true
      }
    });
    return Object.freeze({ok:built.ok===true,status:built.ok?'prepared':'blocked',command:built.command||null,errors:Object.freeze(built.errors||[]),providerWrites:0,legalAcceptanceWrites:0,localStorageWrite:false,automaticAcceptance:false});
  }

  async function recordHumanAcceptance(input){
    const prepared=buildHumanAcceptanceCommand(input);
    if(!prepared.ok)return prepared;
    if(!root.CX?.commandAdapter?.execute)return Object.freeze({ok:false,status:'blocked',code:'LEGAL_COMMAND_EXECUTOR_UNAVAILABLE',providerWrites:0,legalAcceptanceWrites:0,localStorageWrite:false,automaticAcceptance:false});
    return root.CX.commandAdapter.execute(prepared.command);
  }

  root.CX.legalAcceptanceDurable=Object.freeze({
    version:VERSION,
    acceptanceMethod:ACCEPTANCE_METHOD,
    pendingFromProviderReadModel,
    buildHumanAcceptanceCommand,
    recordHumanAcceptance,
    currentAuthenticatedActor,
    status(){return Object.freeze({
      version:VERSION,
      sourceOnly:true,
      activated:false,
      providerAuthorityRequired:true,
      preloadedReadModelRequired:true,
      browserLocalAuthority:false,
      localStorageAuthority:false,
      humanAcceptanceOnly:true,
      automaticAcceptance:false,
      providerAckRequired:true,
      failClosed:true,
      exactIdentityOnly:true,
      fuzzyMatching:false,
      informationalBannerIsLegalAcceptance:false
    });}
  });
})(typeof window!=='undefined'?window:globalThis);
