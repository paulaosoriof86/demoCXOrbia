/* CXOrbia — reusable command adapter contract v1.
   Source-only foundation for durable/no-code writes behind CX.data.

   Contract:
   - public CX.data method names stay unchanged; Iteration 2 will delegate them here;
   - no local mutation and no localStorage persistence occur in this adapter;
   - every write is tenant/project scoped, RBAC-aware, idempotent and version-aware;
   - provider execution is impossible until an explicit transport is registered AND
     CX.BACKEND.enableCommandWrites === true;
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

  function currentAuthContext(){
    try{return CX.backendAuth?.context?.()||null;}catch(_){return null;}
  }

  function currentActor(){
    const auth=currentAuthContext();
    const session=CX.session?.user||{};
    return {
      actorId:str(auth?.actorId||session.id||session.userId||session.shopperId||'authenticated-user'),
      role:str(auth?.role||session.role||CX.session?.testRole||CX.session?.role),
      tenantId:str(auth?.tenantId||session.tenantId||CX.BACKEND?.tenantId),
      projectIds:uniq(auth?.projectIds||session.projectIds||(session.scopeProjectId?[session.scopeProjectId]:[]))
    };
  }

  function clean(value){
    if(Array.isArray(value))return value.map(clean);
    if(!value||typeof value!=='object')return value;
    const out={};
    Object.keys(value).forEach(key=>{
      const v=value[key];
      if(v===undefined||typeof v==='function')return;
      out[key]=clean(v);
    });
    return out;
  }

  function blocked(command,code,extra){
    return Object.assign({
      ok:false,
      status:'blocked',
      committed:false,
      providerAck:false,
      code:code||'COMMAND_WRITE_BLOCKED',
      commandType:str(command?.commandType),
      entityType:str(command?.entityType),
      entityId:str(command?.entityId)||null,
      tenantId:str(command?.tenantId)||null,
      projectId:str(command?.projectId)||null,
      localMutation:false,
      localStorageWrite:false,
      successUiAllowed:false,
      at:now()
    },extra||{});
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
    return errors;
  }

  function build(input){
    input=input||{};
    const actor=Object.assign(currentActor(),clean(input.actor||{}));
    const tenantId=str(input.tenantId||actor.tenantId);
    const projectId=str(input.projectId||'');
    const entityId=str(input.entityId||input.visitId||input.shopperId||input.applicationId||input.postulationId||'');
    const command={
      version:VERSION,
      commandType:str(input.commandType),
      entityType:str(input.entityType),
      entityId:entityId||null,
      tenantId,
      projectId:projectId||null,
      requireProject:input.requireProject!==false,
      actor:{
        actorId:str(input.actorId||actor.actorId),
        role:str(input.role||actor.role),
        projectIds:uniq(actor.projectIds)
      },
      expectedVersion:input.expectedVersion,
      idempotencyKey:str(input.idempotencyKey),
      payload:clean(input.payload||{}),
      source:str(input.source||'cx.data'),
      requestedAt:now(),
      audit:{
        reason:str(input.reason||''),
        correlationId:str(input.correlationId||input.idempotencyKey),
        clientVersion:str(root.CX_BUILD_LOCK?.version||root.CX_BUILD_LOCK?.sha||'')||null
      }
    };
    const errors=validate(command);
    return {ok:errors.length===0,command,errors};
  }

  function writesEnabled(){
    return CX.BACKEND?.enableCommandWrites===true;
  }

  function registerTransport(name,transport){
    name=str(name);
    if(!name)throw new Error('COMMAND_TRANSPORT_NAME_REQUIRED');
    if(!transport||typeof transport.execute!=='function')throw new Error('COMMAND_TRANSPORT_EXECUTE_REQUIRED');
    transports.set(name,transport);
    return true;
  }

  function useTransport(name){
    name=str(name);
    if(!transports.has(name))throw new Error('COMMAND_TRANSPORT_NOT_REGISTERED');
    activeTransport=name;
    return true;
  }

  async function execute(input){
    const built=input?.version===VERSION&&input?.commandType?{ok:validate(input).length===0,command:input,errors:validate(input)}:build(input);
    if(!built.ok)return blocked(built.command,'COMMAND_INVALID',{errors:built.errors});
    const command=built.command;
    if(!writesEnabled())return blocked(command,'COMMAND_WRITES_DISABLED');
    if(!activeTransport||!transports.has(activeTransport))return blocked(command,'COMMAND_TRANSPORT_UNAVAILABLE');

    let result;
    try{result=await transports.get(activeTransport).execute(clean(command));}
    catch(error){
      return blocked(command,'COMMAND_TRANSPORT_ERROR',{error:str(error?.message||error)});
    }
    const committed=result?.ok===true&&result?.status==='committed'&&result?.providerAck===true;
    if(!committed){
      return Object.assign(blocked(command,'COMMAND_NOT_COMMITTED'),clean(result||{}),{
        ok:false,
        committed:false,
        providerAck:false,
        successUiAllowed:false,
        localMutation:false,
        localStorageWrite:false
      });
    }
    return Object.assign({},clean(result),{
      ok:true,
      status:'committed',
      committed:true,
      providerAck:true,
      successUiAllowed:true,
      localMutation:false,
      localStorageWrite:false,
      commandType:command.commandType,
      entityType:command.entityType,
      entityId:command.entityId,
      tenantId:command.tenantId,
      projectId:command.projectId,
      idempotencyKey:command.idempotencyKey,
      at:now()
    });
  }

  CX.commandAdapter=Object.freeze({
    version:VERSION,
    build,
    validate,
    execute,
    registerTransport,
    useTransport,
    writesEnabled,
    status(){
      return {
        version:VERSION,
        writesEnabled:writesEnabled(),
        activeTransport:activeTransport||null,
        registeredTransports:[...transports.keys()],
        preservesCxDataInterface:true,
        localMutation:false,
        localStoragePersistence:false,
        successRequiresProviderAck:true,
        at:now()
      };
    }
  });
})(typeof window!=='undefined'?window:globalThis);
