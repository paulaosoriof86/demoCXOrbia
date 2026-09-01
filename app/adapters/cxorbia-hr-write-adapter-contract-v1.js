/* CXOrbia — reusable HR write adapter contract v1.
   Source-only foundation for platform -> HR synchronization.

   HR read authority is configured elsewhere and remains unchanged.
   This file defines only the write boundary. It does not call Google Sheets, Make,
   Firestore or any provider until a provider is registered and enableHrWrites=true.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-hr-write-adapter-contract-v1';
  const providers=new Map();
  let activeProvider='';
  const str=v=>String(v==null?'':v).trim();
  const now=()=>new Date().toISOString();

  function blocked(input,code,extra){
    return Object.assign({
      ok:false,
      status:'blocked',
      committed:false,
      providerAck:false,
      code:code||'HR_WRITE_BLOCKED',
      tenantId:str(input?.tenantId)||null,
      projectId:str(input?.projectId)||null,
      visitId:str(input?.visitId)||null,
      hrRowId:str(input?.hrRowId)||null,
      localMutation:false,
      silentOverwrite:false,
      reviewRequired:false,
      at:now()
    },extra||{});
  }

  function validate(input){
    const errors=[];
    if(!str(input?.tenantId))errors.push('missing-tenantId');
    if(!str(input?.projectId))errors.push('missing-projectId');
    if(!str(input?.visitId)&&!str(input?.hrRowId))errors.push('missing-visitId-or-hrRowId');
    if(!str(input?.idempotencyKey))errors.push('missing-idempotencyKey');
    if(!str(input?.assignmentSource)&&input?.actionType==='assignment')errors.push('missing-assignmentSource');
    if(input?.expectedVersion===undefined||input?.expectedVersion===null||input?.expectedVersion==='')errors.push('missing-expectedVersion');
    return errors;
  }

  function registerProvider(name,provider){
    name=str(name);
    if(!name)throw new Error('HR_PROVIDER_NAME_REQUIRED');
    if(!provider||typeof provider.execute!=='function')throw new Error('HR_PROVIDER_EXECUTE_REQUIRED');
    providers.set(name,provider);
    return true;
  }

  function useProvider(name){
    name=str(name);
    if(!providers.has(name))throw new Error('HR_PROVIDER_NOT_REGISTERED');
    activeProvider=name;
    return true;
  }

  function writesEnabled(){return CX.BACKEND?.enableHrWrites===true;}

  async function execute(input){
    input=Object.assign({},input||{});
    const errors=validate(input);
    if(errors.length)return blocked(input,'HR_WRITE_INVALID',{errors});
    if(!writesEnabled())return blocked(input,'HR_WRITES_DISABLED');
    if(!activeProvider||!providers.has(activeProvider))return blocked(input,'HR_PROVIDER_UNAVAILABLE');

    const request={
      version:VERSION,
      tenantId:str(input.tenantId),
      projectId:str(input.projectId),
      actionType:str(input.actionType||'state'),
      visitId:str(input.visitId)||null,
      hrRowId:str(input.hrRowId)||null,
      shopperId:str(input.shopperId)||null,
      assignmentSource:str(input.assignmentSource)||null,
      assignmentSyncStatus:str(input.assignmentSyncStatus||'pending'),
      lastSyncedAt:input.lastSyncedAt||null,
      expectedVersion:input.expectedVersion,
      idempotencyKey:str(input.idempotencyKey),
      payload:Object.assign({},input.payload||{}),
      conflictPolicy:'review_no_silent_overwrite',
      requestedAt:now()
    };

    let result;
    try{result=await providers.get(activeProvider).execute(request);}
    catch(error){return blocked(request,'HR_PROVIDER_ERROR',{error:str(error?.message||error)});}

    if(result?.conflict===true){
      return Object.assign(blocked(request,'HR_CONFLICT_REVIEW_REQUIRED'),result,{
        ok:false,
        status:'conflict',
        committed:false,
        providerAck:false,
        reviewRequired:true,
        silentOverwrite:false
      });
    }
    const committed=result?.ok===true&&result?.status==='committed'&&result?.providerAck===true;
    if(!committed)return Object.assign(blocked(request,'HR_WRITE_NOT_COMMITTED'),result||{});
    return Object.assign({},result,{
      ok:true,
      status:'committed',
      committed:true,
      providerAck:true,
      reviewRequired:false,
      silentOverwrite:false,
      tenantId:request.tenantId,
      projectId:request.projectId,
      visitId:request.visitId,
      hrRowId:request.hrRowId,
      assignmentSource:request.assignmentSource,
      assignmentSyncStatus:str(result.assignmentSyncStatus||'synced'),
      lastSyncedAt:result.lastSyncedAt||now()
    });
  }

  CX.hrWriteAdapter=Object.freeze({
    version:VERSION,
    validate,
    execute,
    registerProvider,
    useProvider,
    writesEnabled,
    status(){return{
      version:VERSION,
      writesEnabled:writesEnabled(),
      activeProvider:activeProvider||null,
      registeredProviders:[...providers.keys()],
      conflictPolicy:'review_no_silent_overwrite',
      providerWritesExecuted:0,
      at:now()
    };}
  });
})(typeof window!=='undefined'?window:globalThis);
