#!/usr/bin/env node
/* CXOrbia — tenant-scoped commercial command provider v1.
   VRM-189: durable client/CRM authority. No HR, external, payment or browser-local writes.
*/
import crypto from 'node:crypto';

export const VERSION='cxorbia-commercial-command-provider-v1';
export const COMMAND_TYPES=Object.freeze([
  'client.create','client.update',
  'crm.account.create','crm.account.update',
  'crm.contact.create','crm.contact.update',
  'crm.opportunity.create','crm.opportunity.update',
  'crm.column.create','crm.column.update','crm.column.delete'
]);
export const OPERATOR_ROLES=Object.freeze(['super','admin']);
const TYPE_META=Object.freeze({
  client:{collection:'clients',prefix:'cl',labelField:'name'},
  crmAccount:{collection:'crmAccounts',prefix:'ac',labelField:'nombre'},
  crmContact:{collection:'crmContacts',prefix:'ct',labelField:'nombre'},
  crmOpportunity:{collection:'crmOpportunities',prefix:'op',labelField:'empresa'},
  crmColumn:{collection:'crmColumns',prefix:'col',labelField:'n'}
});
const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const clean=value=>{
  if(Array.isArray(value))return value.map(clean);
  if(value&&typeof value==='object'){
    const out={};
    for(const [k,v] of Object.entries(value)){
      if(v===undefined||typeof v==='function')continue;
      out[k]=clean(v);
    }
    return out;
  }
  return value;
};
const stable=value=>{
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object'){
    const out={};for(const k of Object.keys(value).sort())out[k]=stable(value[k]);return out;
  }
  return value;
};
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const now=()=>new Date().toISOString();
const safeId=v=>/^[A-Za-z0-9._:-]{1,120}$/.test(str(v));
const entityMeta=command=>TYPE_META[str(command?.entityType)]||null;
const isCreate=t=>/\.create$/.test(str(t));
const isUpdate=t=>/\.update$/.test(str(t));
const isDelete=t=>/\.delete$/.test(str(t));
const canonicalId=(tenantId,meta,payload,command)=>{
  const requested=str(command?.entityId||payload?.id);
  if(requested&&safeId(requested))return requested;
  const label=str(payload?.[meta.labelField]||payload?.name||payload?.nombre||payload?.empresa||command?.idempotencyKey);
  return meta.prefix+'-'+sha(tenantId+'\0'+label+'\0'+str(command?.idempotencyKey)).slice(0,20);
};
const receiptId=command=>sha(str(command?.tenantId)+'\0'+str(command?.idempotencyKey)).slice(0,40);
const blocked=(command,code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,hrWrites:0,externalWrites:0,paymentWrites:0,tenantId:command?.tenantId||null,projectId:null,periodId:null,commandType:command?.commandType||null,code,...extra});
const ack=(command,entityId,extra={})=>({ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,hrWrites:0,externalWrites:0,paymentWrites:0,tenantId:command.tenantId,projectId:null,periodId:null,commandType:command.commandType,entityType:command.entityType,entityId,idempotencyKey:command.idempotencyKey,...extra});

export function validateCommercialPolicy(policy={}){
  const errors=[];
  if(policy.schemaVersion!=='cxorbia.commercial-command-provider-policy.v1')errors.push('POLICY_SCHEMA_INVALID');
  if(policy.enabled!==true)errors.push('POLICY_DISABLED');
  if(!arr(policy.allowedTenantIds).map(str).filter(Boolean).length)errors.push('POLICY_TENANTS_REQUIRED');
  if(policy.hrWrites!==false||policy.externalWrites!==false||policy.paymentWrites!==false)errors.push('POLICY_EXTERNAL_SIDE_EFFECTS_MUST_BE_FALSE');
  return {ok:errors.length===0,errors};
}
async function exactActor(auth,db,token,tenantId){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role).toLowerCase(),namespace=str(decoded.authNamespace).toLowerCase();
  if(str(decoded.tenantId)!==tenantId||!OPERATOR_ROLES.includes(role)||namespace!=='staff')throw new Error('COMMERCIAL_ACTOR_DENIED');
  const member=await db.collection('tenants').doc(tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('COMMERCIAL_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(m.active===false||str(m.status||'active').toLowerCase()==='inactive')throw new Error('COMMERCIAL_MEMBERSHIP_INACTIVE');
  if(str(m.tenantId)!==tenantId||str(m.role).toLowerCase()!==role||str(m.authNamespace).toLowerCase()!==namespace)throw new Error('COMMERCIAL_MEMBERSHIP_CLAIMS_MISMATCH');
  return {uid:decoded.uid,role};
}
function validatePayload(command,payload,meta){
  const errors=[];
  if(isCreate(command.commandType)&&!str(payload?.[meta.labelField]))errors.push('COMMERCIAL_LABEL_REQUIRED');
  if(isUpdate(command.commandType)&&!str(command.entityId))errors.push('COMMERCIAL_ENTITY_ID_REQUIRED');
  if(isDelete(command.commandType)&&command.entityType!=='crmColumn')errors.push('COMMERCIAL_DELETE_NOT_ALLOWED');
  if(command.entityType==='crmColumn'&&isDelete(command.commandType)&&['nuevo','ganado','perdido'].includes(str(command.entityId)))errors.push('COMMERCIAL_PROTECTED_COLUMN_DELETE_DENIED');
  return {ok:errors.length===0,errors};
}

export function createCommercialCommandProvider({auth,db,policy}={}){
  const pv=validateCommercialPolicy(policy);
  if(!pv.ok)throw new Error('COMMERCIAL_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('COMMERCIAL_PROVIDER_DEPENDENCIES_MISSING');
  const allowedTenants=new Set(arr(policy.allowedTenantIds).map(str));
  return {
    async execute(token,command={}){
      const type=str(command.commandType);
      if(!COMMAND_TYPES.includes(type))return blocked(command,'COMMERCIAL_COMMAND_TYPE_INVALID');
      const tenantId=str(command.tenantId);
      if(!tenantId||!allowedTenants.has(tenantId))return blocked(command,'COMMERCIAL_TENANT_SCOPE_DENIED');
      if(command.requireProject!==false||command.requirePeriod!==false||str(command.projectId)||str(command.periodId))return blocked(command,'COMMERCIAL_MUST_BE_TENANT_SCOPED');
      if(!str(command.idempotencyKey))return blocked(command,'COMMERCIAL_IDEMPOTENCY_REQUIRED');
      if(command.expectedVersion===undefined||command.expectedVersion===null||command.expectedVersion==='')return blocked(command,'COMMERCIAL_EXPECTED_VERSION_REQUIRED');
      const meta=entityMeta(command);
      if(!meta)return blocked(command,'COMMERCIAL_ENTITY_TYPE_INVALID');
      const payload=clean(command.payload||{});
      const valid=validatePayload(command,payload,meta);
      if(!valid.ok)return blocked(command,'COMMERCIAL_PAYLOAD_INVALID',{errors:valid.errors});
      let who;try{who=await exactActor(auth,db,token,tenantId);}catch(error){return blocked(command,str(error?.message||error));}
      const tenant=db.collection('tenants').doc(tenantId);
      const receipt=tenant.collection('commandReceipts').doc(receiptId(command));
      const digest=sha(clean(command));
      const mode=isCreate(type)?'create':isDelete(type)?'delete':'update';
      let txResult;
      try{
        txResult=await db.runTransaction(async tx=>{
          const prior=await tx.get(receipt);
          if(prior.exists){
            const p=prior.data()||{};
            if(p.commandDigest!==digest)throw new Error('COMMERCIAL_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
            if(p.status==='committed')return {entityId:p.entityId,entityVersion:p.entityVersion,idempotentReplay:true,providerWrites:0};
          }
          const entityId=canonicalId(tenantId,meta,payload,command);
          const ref=tenant.collection(meta.collection).doc(entityId);
          const currentSnap=await tx.get(ref);
          const current=currentSnap.exists?(currentSnap.data()||{}):null;
          const sourceDefaultColumn=command.entityType==='crmColumn'&&String(command.expectedVersion)==='source-default'&&!current;
          const projectDerivedClient=command.entityType==='client'&&String(command.expectedVersion)==='project-derived'&&!current;
          if(mode==='create'&&current)throw new Error('COMMERCIAL_ENTITY_ALREADY_EXISTS');
          if(mode!=='create'&&!current&&!sourceDefaultColumn&&!projectDerivedClient)throw new Error('COMMERCIAL_ENTITY_NOT_FOUND');
          if(mode==='create'&&String(command.expectedVersion)!=='absent')throw new Error('COMMERCIAL_CREATE_EXPECTED_VERSION_INVALID');
          if(mode!=='create'&&current&&String(command.expectedVersion)!==String(current.version??0))throw new Error('COMMERCIAL_EXPECTED_VERSION_CONFLICT');
          const base=current||{id:entityId,tenantId,version:0,createdAt:now(),createdBy:who.uid};
          const sanitized={...payload};delete sanitized.id;delete sanitized.tenantId;delete sanitized.version;delete sanitized.createdAt;delete sanitized.createdBy;delete sanitized.updatedAt;delete sanitized.updatedBy;delete sanitized.deleted;
          const next=mode==='delete'
            ? {...base,id:entityId,tenantId,deleted:true,version:Number(base.version||0)+1,updatedAt:now(),updatedBy:who.uid}
            : {...base,...sanitized,id:entityId,tenantId,deleted:false,version:Number(base.version||0)+1,updatedAt:now(),updatedBy:who.uid};
          if(mode==='create'){next.createdAt=now();next.createdBy=who.uid;}
          if(current)tx.set(ref,next,{merge:false});else tx.create(ref,next);
          let providerWrites=1;
          tx.set(receipt,{status:'committed',commandDigest:digest,entityType:command.entityType,entityId,entityVersion:next.version,commandType:type,providerAck:true,actorUid:who.uid,updatedAt:now()});providerWrites++;
          tx.create(tenant.collection('entityAuditTrail').doc('commercial-'+sha(command.idempotencyKey).slice(0,32)),{tenantId,entityType:command.entityType,entityId,commandType:type,actorUid:who.uid,actorRole:who.role,idempotencyKey:command.idempotencyKey,fromVersion:current?.version??(sourceDefaultColumn?'source-default':projectDerivedClient?'project-derived':'absent'),toVersion:next.version,createdAt:now()});providerWrites++;
          return {entityId,entityVersion:next.version,idempotentReplay:false,providerWrites};
        });
      }catch(error){return blocked(command,str(error?.message||error));}
      const ref=tenant.collection(meta.collection).doc(txResult.entityId);
      const readback=await ref.get();
      if(!readback.exists)return blocked(command,'COMMERCIAL_DURABLE_READBACK_MISSING',{entityId:txResult.entityId});
      const entityReadback={id:readback.id,...clean(readback.data()||{})};
      if(String(entityReadback.version)!==String(txResult.entityVersion))return blocked(command,'COMMERCIAL_DURABLE_READBACK_VERSION_MISMATCH',{entityId:txResult.entityId,expectedVersion:txResult.entityVersion,observedVersion:entityReadback.version});
      return ack(command,txResult.entityId,{entityVersion:txResult.entityVersion,entityReadback,readbackVerified:true,idempotentReplay:txResult.idempotentReplay,providerWrites:txResult.providerWrites});
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:[...allowedTenants],operatorRoles:[...OPERATOR_ROLES],tenantScoped:true,hrWrites:false,externalWrites:false,paymentWrites:false};}
  };
}
export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,validateCommercialPolicy,createCommercialCommandProvider};
