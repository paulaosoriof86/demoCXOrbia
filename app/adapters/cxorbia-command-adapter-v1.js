/* CXOrbia — reusable command adapter contract v1.
   Durable/no-code write boundary behind CX.data.

   Contract:
   - public CX.data method names stay unchanged;
   - no local mutation and no localStorage persistence occur here;
   - every write is tenant/project scoped, RBAC-aware, idempotent and version-aware;
   - provider execution is impossible until a transport is registered AND
     CX.BACKEND.enableCommandWrites===true;
   - UI success is valid only after a provider ACK with status=committed.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-command-adapter-v1';
  const transports=new Map();
  let activeTransport='';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const now=()=>new Date().toISOString();
  const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];

  function currentAuthContext(){try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}}
  function currentActor(){
    const auth=currentAuthContext()||{};
    const session=CX.session?.user||{};
    const role=(CX.session?.effectiveRole&&CX.session.effectiveRole())||CX.session?.testRole||auth.role||session.role||CX.session?.role||'';
    return {
      actorId:str(auth.actorId||session.id||session.userId||session.shopperId||'authenticated-user'),
      role:str(role),
      tenantId:str(auth.tenantId||session.tenantId||CX.BACKEND?.tenantId),
      projectIds:uniq(auth.projectIds||session.projectIds||(session.scopeProjectId?[session.scopeProjectId]:[])),
      shopperId:str(auth.shopperId||session.shopperId)||null
    };
  }
  function clean(value){
    if(Array.isArray(value))return value.map(clean);
    if(!value||typeof value!=='object')return value;
    const out={};Object.keys(value).forEach(key=>{const v=value[key];if(v===undefined||typeof v==='function')return;out[key]=clean(v);});return out;
  }
  function blocked(command,code,extra){
    const result=Object.assign({
      ok:false,status:'blocked',committed:false,providerAck:false,code:code||'COMMAND_WRITE_BLOCKED',
      commandType:str(command?.commandType),entityType:str(command?.entityType),entityId:str(command?.entityId)||null,
      tenantId:str(command?.tenantId)||null,projectId:str(command?.projectId)||null,
      localMutation:false,localStorageWrite:false,successUiAllowed:false,providerWrites:0,at:now()
    },extra||{});
    try{CX.bus?.emit?.('command-blocked',result);}catch(_){}
    return result;
  }
  function validate(command){
    const errors=[];
    if(!command||typeof command!=='object')return ['missing-command'];
    if(!str(command.commandType))errors.push('missing-commandType');
    if(!str(command.entityType))errors.push('missing-entityType');
    if(!str(command.tenantId))errors.push('missing-tenantId');
    if(command.requireProject!==false&&!str(command.projectId))errors.push('missing-projectId');
    if(!str(command.idempotencyKey))errors.push('missing-idempotencyKey');
    if(command.expectedVersion===undefined||command.expectedVersion===null||command.expectedVersion==='')errors.push('missing-expectedVersion');
    if(!str(command.actor?.role))errors.push('missing-actor-role');
    if(command.authorization?.providerEnforcementRequired!==true)errors.push('provider-authorization-required');
    return errors;
  }
  function build(input){
    input=input||{};const baseActor=currentActor();const actor=Object.assign({},baseActor,clean(input.actor||{}));
    const tenantId=str(input.tenantId||actor.tenantId),projectId=str(input.projectId||'');
    const entityId=str(input.entityId||input.visitId||input.shopperId||input.applicationId||input.postulationId||'');
    const command={
      version:VERSION,commandType:str(input.commandType),entityType:str(input.entityType),entityId:entityId||null,
      tenantId,projectId:projectId||null,requireProject:input.requireProject!==false,
      actor:{actorId:str(input.actorId||actor.actorId),role:str(input.role||actor.role),projectIds:uniq(actor.projectIds),shopperId:str(actor.shopperId)||null},
      expectedVersion:input.expectedVersion,idempotencyKey:str(input.idempotencyKey),payload:clean(input.payload||{}),
      source:str(input.source||'cx.data'),requestedAt:now(),authorization:clean(input.authorization||{providerEnforcementRequired:true}),
      audit:{reason:str(input.reason||''),correlationId:str(input.correlationId||input.idempotencyKey),clientVersion:str(root.CX_BUILD_LOCK?.version||root.CX_BUILD_LOCK?.sha||'')||null}
    };
    const errors=validate(command);return{ok:errors.length===0,command,errors};
  }
  function writesEnabled(){return CX.BACKEND?.enableCommandWrites===true;}
  function clientScopeCheck(command){
    const actor=currentActor();
    if(actor.tenantId&&command.tenantId&&actor.tenantId!==command.tenantId)return{ok:false,code:'COMMAND_TENANT_SCOPE_DENIED'};
    if(actor.projectIds.length&&command.requireProject!==false&&command.projectId&&!actor.projectIds.includes(command.projectId)&&actor.role!=='super')return{ok:false,code:'COMMAND_PROJECT_SCOPE_DENIED'};
    /* Legal acceptance is a self-scoped command. The provider, not this browser adapter,
       derives the actor UID from the verified Firebase ID token and enforces tenant/role/scope.
       It must remain available to authenticated shoppers and clients even though their ordinary
       operational write sets are intentionally narrow/closed. */
    if(command.commandType==='legal.acceptance.record'){
      if(command.entityType!=='legalAcceptance')return{ok:false,code:'COMMAND_LEGAL_ENTITY_INVALID'};
      if(command.payload?.humanConfirmed!==true||command.authorization?.humanAcceptanceRequired!==true||command.authorization?.automaticAcceptanceForbidden!==true)return{ok:false,code:'COMMAND_LEGAL_HUMAN_CONFIRMATION_REQUIRED'};
      return{ok:true};
    }
    if(actor.role==='shopper'){
      const allowed=new Set(['visit.state.update','visit.reschedule','visit.cancel','visit.questionnaire.submit','application.create']);
      if(!allowed.has(command.commandType))return{ok:false,code:'COMMAND_ROLE_DENIED'};
      const targetShopper=str(command.payload?.shopperId||command.payload?.actorShopperId||actor.shopperId);
      if(actor.shopperId&&targetShopper&&actor.shopperId!==targetShopper)return{ok:false,code:'COMMAND_SHOPPER_SCOPE_DENIED'};
    }
    if(['cliente','client'].includes(actor.role))return{ok:false,code:'COMMAND_CLIENT_WRITE_DENIED'};
    return{ok:true};
  }
  function registerTransport(name,transport){name=str(name);if(!name)throw new Error('COMMAND_TRANSPORT_NAME_REQUIRED');if(!transport||typeof transport.execute!=='function')throw new Error('COMMAND_TRANSPORT_EXECUTE_REQUIRED');transports.set(name,transport);return true;}
  function useTransport(name){name=str(name);if(!transports.has(name))throw new Error('COMMAND_TRANSPORT_NOT_REGISTERED');activeTransport=name;return true;}

  async function execute(input){
    const built=input?.version===VERSION&&input?.commandType?{ok:validate(input).length===0,command:input,errors:validate(input)}:build(input);
    if(!built.ok)return blocked(built.command,'COMMAND_INVALID',{errors:built.errors});
    const command=built.command,scope=clientScopeCheck(command);
    if(!scope.ok)return blocked(command,scope.code);
    if(!writesEnabled())return blocked(command,'COMMAND_WRITES_DISABLED',{reason:'Las escrituras por command adapter requieren un gate explícito. No se modificó ningún dato.'});
    if(!activeTransport||!transports.has(activeTransport))return blocked(command,'COMMAND_TRANSPORT_UNAVAILABLE');
    let result;
    try{result=await transports.get(activeTransport).execute(clean(command));}
    catch(error){return blocked(command,'COMMAND_TRANSPORT_ERROR',{error:str(error?.message||error)});}
    const committed=result?.ok===true&&result?.status==='committed'&&result?.providerAck===true;
    if(!committed)return Object.assign(blocked(command,'COMMAND_NOT_COMMITTED'),clean(result||{}),{ok:false,committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false});
    const out=Object.assign({},clean(result),{
      ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,
      commandType:command.commandType,entityType:command.entityType,entityId:command.entityId,tenantId:command.tenantId,projectId:command.projectId,idempotencyKey:command.idempotencyKey,at:now()
    });
    try{CX.bus?.emit?.('command-committed',out);}catch(_){}
    return out;
  }

  CX.commandAdapter=Object.freeze({
    version:VERSION,build,validate,execute,blocked,registerTransport,useTransport,writesEnabled,currentActor,
    status(){return{version:VERSION,writesEnabled:writesEnabled(),activeTransport:activeTransport||null,registeredTransports:[...transports.keys()],preservesCxDataInterface:true,localMutation:false,localStoragePersistence:false,successRequiresProviderAck:true,providerAuthorizationRequired:true,at:now()};}
  });
})(typeof window!=='undefined'?window:globalThis);
