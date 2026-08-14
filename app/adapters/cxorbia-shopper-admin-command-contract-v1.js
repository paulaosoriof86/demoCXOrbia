/* CXOrbia — reusable Shopper admin command contract v1.
   Defines durable create/update semantics without executing provider writes.

   Production intent:
   Admin -> exact validation -> Auth principal -> claims -> membership -> profile/shopper
   -> exact crosswalk -> provider ACK -> UI refresh.

   Password/token creation is intentionally absent from browser payloads. Credential reset is
   a separate protected server operation. No localStorage persistence is allowed here.
*/
(function(root){
  'use strict';
  root.CX=root.CX||{};
  const VERSION='cxorbia-shopper-admin-command-contract-v1';
  const str=v=>String(v==null?'':v).trim();
  const arr=v=>Array.isArray(v)?v:[];
  const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))];
  const exactKeys=()=>Array.isArray(root.CX_EXACT_IDENTITY_CONTRACT?.technicalKeys)?root.CX_EXACT_IDENTITY_CONTRACT.technicalKeys.slice():['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId'];
  const PUBLIC_PROFILE_FIELDS=['firstName','lastName','nombre','email','whatsapp','pais','country','depto','ciudad','sexo','edad','estado','sourceRef','sourceType','perfilCompleto','honorarioPref'];
  const PROTECTED_PROFILE_FIELDS=['dpi','documentId','banco','ctaTipo','ctaNum','ctaTitular','ctaMoneda','cuentaPago','ndaStatus'];

  function pick(input,keys){const out={};keys.forEach(key=>{if(input&&input[key]!==undefined)out[key]=input[key];});return out;}
  function safeProfile(input){return pick(input||{},PUBLIC_PROFILE_FIELDS);}
  function protectedProfile(input){return pick(input||{},PROTECTED_PROFILE_FIELDS);}
  function exactAnchors(input){
    const out={};exactKeys().forEach(key=>{const value=input&&input[key];if(Array.isArray(value)){const values=uniq(value);if(values.length)out[key]=values;}else if(str(value))out[key]=str(value);});return out;
  }
  function validateBase(input){
    const errors=[];
    if(!str(input?.tenantId))errors.push('missing-tenantId');
    if(!uniq(input?.projectIds).length)errors.push('missing-projectIds');
    if(!str(input?.idempotencyKey))errors.push('missing-idempotencyKey');
    if(input?.expectedVersion===undefined||input?.expectedVersion===null||input?.expectedVersion==='')errors.push('missing-expectedVersion');
    if(!str(input?.actorRole))errors.push('missing-actorRole');
    return errors;
  }
  function persistenceContract(){return{profileRequired:true,crosswalkRequired:true,providerAckRequired:true,localStorageAllowed:false};}
  function protectionContract(){return{serverProtected:true,encryptAtRestRequired:true,browserPersistenceAllowed:false,auditRedactionRequired:true,plainRepoStorageAllowed:false};}

  function create(input){
    input=input||{};const errors=validateBase(input),profile=safeProfile(input.profile||input),protectedData=protectedProfile(input.profile||input);
    if(!str(profile.firstName||profile.nombre))errors.push('missing-shopper-name');
    return {ok:errors.length===0,errors,command:{
      commandType:'shopper.create',entityType:'shopper',entityId:null,tenantId:str(input.tenantId),projectId:str(input.projectId||uniq(input.projectIds)[0]),
      actor:{actorId:str(input.actorId||''),role:str(input.actorRole),projectIds:uniq(input.projectIds)},expectedVersion:input.expectedVersion,idempotencyKey:str(input.idempotencyKey),
      payload:{projectIds:uniq(input.projectIds),profile,protectedProfile:protectedData,protectedProfilePolicy:protectionContract(),exactIdentityAnchors:exactAnchors(input.identity||input),
        auth:{namespace:'shopper',principalRequired:true,claimsRequired:true,membershipRequired:true,credentialMode:'server_generated_or_protected_reset_flow',browserPasswordAllowed:false,browserTokenAllowed:false},
        persistence:persistenceContract(),sourceType:str(input.sourceType||profile.sourceType||'platform'),sourceRef:str(input.sourceRef||profile.sourceRef||'')||null},
      source:'admin-shopper-flow',authorization:{providerEnforcementRequired:true,permission:'shopper.create'}
    }};
  }
  function update(input){
    input=input||{};const errors=validateBase(input),shopperId=str(input.shopperId||input.entityId),patch=input.patch||{};
    if(!shopperId)errors.push('missing-shopperId');
    return {ok:errors.length===0,errors,command:{
      commandType:'shopper.update',entityType:'shopper',entityId:shopperId||null,tenantId:str(input.tenantId),projectId:str(input.projectId||uniq(input.projectIds)[0]),
      actor:{actorId:str(input.actorId||''),role:str(input.actorRole),projectIds:uniq(input.projectIds)},expectedVersion:input.expectedVersion,idempotencyKey:str(input.idempotencyKey),
      payload:{shopperId:shopperId||null,projectIds:uniq(input.projectIds),patch:safeProfile(patch),protectedPatch:protectedProfile(patch),protectedProfilePolicy:protectionContract(),exactIdentityAnchors:exactAnchors(input.identity||input),persistence:persistenceContract()},
      source:'admin-shopper-flow',authorization:{providerEnforcementRequired:true,permission:'shopper.update'}
    }};
  }
  function credentialReset(input){
    input=input||{};const shopperId=str(input.shopperId);const errors=[!str(input.tenantId)?'missing-tenantId':null,!shopperId?'missing-shopperId':null,!str(input.idempotencyKey)?'missing-idempotencyKey':null,!str(input.actorRole)?'missing-actorRole':null].filter(Boolean);
    return {ok:errors.length===0,errors,command:{commandType:'shopper.credential.reset',entityType:'shopper',entityId:shopperId||null,tenantId:str(input.tenantId),projectId:str(input.projectId||'')||null,requireProject:false,
      actor:{actorId:str(input.actorId||''),role:str(input.actorRole),projectIds:uniq(input.projectIds)},expectedVersion:input.expectedVersion==null?'provider-current':input.expectedVersion,idempotencyKey:str(input.idempotencyKey),
      payload:{shopperId,serverOnly:true,browserPasswordAllowed:false,browserTokenAllowed:false},source:'admin-shopper-credential-reset',authorization:{providerEnforcementRequired:true,permission:'shopper.credential.reset'}}};
  }

  CX.shopperAdminCommandContract=Object.freeze({version:VERSION,create,update,credentialReset,exactIdentityKeys:exactKeys(),protectedFields:PROTECTED_PROFILE_FIELDS.slice(),browserCredentialStorageAllowed:false,localStoragePersistenceAllowed:false,successRequiresProviderAck:true,protectedDataRequiresEncryption:true});
})(typeof window!=='undefined'?window:globalThis);
