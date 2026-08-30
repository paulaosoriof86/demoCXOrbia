#!/usr/bin/env node
/* CXOrbia — reusable project lifecycle command provider v1.
   Creates/updates project configuration durably behind Auth/RBAC/idempotency/version gates.
   Importing this file executes zero writes. No external-source, HR, Make, Gemini or payment write
   is performed here; provider bindings are indirect references only.
*/
import crypto from 'node:crypto';

export const VERSION='cxorbia-project-command-provider-v1';
export const COMMAND_TYPES=Object.freeze(['project.create','project.update']);
export const OPERATOR_ROLES=Object.freeze(['super','admin']);
const SOURCE_MODES=new Set(['internal','external']);
const PROVIDERS=new Set(['internal_firestore','google_sheets','excel_import','external_api','external_platform','custom_adapter']);
const READ_POLICIES=new Set(['internal_live','external_live','external_snapshot_import']);
const WRITE_POLICIES=new Set(['platform_only','external_read_only','bidirectional_gated']);
const FORBIDDEN_KEYS=new Set(['password','token','apiKey','credentials','privateUrl','workbookUrl','rawWorkbookUrl','secret']);

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const normalizedName=name=>str(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
const canonicalProjectId=(tenantId,name)=>'prj-'+sha(`${tenantId}\0${normalizedName(name)}`).slice(0,20);

function forbiddenPath(value,path=[]){
  if(!value||typeof value!=='object')return null;
  for(const [key,nested] of Object.entries(value)){
    if(FORBIDDEN_KEYS.has(key))return [...path,key].join('.');
    const found=forbiddenPath(nested,[...path,key]);if(found)return found;
  }
  return null;
}
function sourceOf(payload){return clean(payload?.operationalSource||payload?.routeSource||{});}

export function validateProjectPayload(payload={},mode='create'){
  const errors=[],warnings=[],source=sourceOf(payload),srcMode=str(source.mode),provider=str(source.providerType),read=str(source.readPolicy),write=str(source.writePolicy);
  if(!str(payload.name))errors.push('PROJECT_NAME_REQUIRED');
  if(!arr(payload.countries).map(str).filter(Boolean).length)errors.push('PROJECT_COUNTRIES_REQUIRED');
  if(!SOURCE_MODES.has(srcMode))errors.push('PROJECT_SOURCE_MODE_REQUIRED');
  if(!PROVIDERS.has(provider))errors.push('PROJECT_SOURCE_PROVIDER_TYPE_INVALID');
  if(!READ_POLICIES.has(read))errors.push('PROJECT_SOURCE_READ_POLICY_INVALID');
  if(!WRITE_POLICIES.has(write))errors.push('PROJECT_SOURCE_WRITE_POLICY_INVALID');
  if(srcMode==='external'&&read==='external_live'&&!str(source.providerBindingId||source.integrationSettingId||source.providerRef))errors.push('PROJECT_SOURCE_BINDING_REQUIRED');
  if(srcMode==='external'&&!str(source.mappingRef))errors.push('PROJECT_SOURCE_MAPPING_REQUIRED');
  if(srcMode==='internal'&&provider!=='internal_firestore')errors.push('PROJECT_INTERNAL_PROVIDER_MUST_BE_INTERNAL_FIRESTORE');
  if(srcMode==='internal'&&write!=='platform_only')errors.push('PROJECT_INTERNAL_WRITE_POLICY_INVALID');
  const forbidden=forbiddenPath(payload);if(forbidden)errors.push('PROJECT_CONFIG_SECRET_FORBIDDEN:'+forbidden);
  if(/^(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)\s+\d{2}$/i.test(str(payload.ronda)))warnings.push('PROJECT_RONDA_PRESENTATION_MUST_NOT_BE_AUTHORITY');
  if(mode==='update'&&(payload.version===undefined||payload.version===null))errors.push('PROJECT_VERSION_REQUIRED_FOR_UPDATE');
  return {ok:errors.length===0,errors,warnings,source};
}

export function validateProviderPolicy(policy={}){
  const errors=[];
  if(policy.schemaVersion!=='cxorbia.project-command-provider-policy.v1')errors.push('POLICY_SCHEMA_INVALID');
  if(policy.enabled!==true)errors.push('POLICY_DISABLED');
  if(!arr(policy.allowedTenantIds).map(str).filter(Boolean).length)errors.push('POLICY_TENANTS_REQUIRED');
  if(policy.externalProviderWrites!==false||policy.hrWrites!==false||policy.makeCalls!==false||policy.geminiCalls!==false||policy.paymentWrites!==false)errors.push('POLICY_EXTERNAL_SIDE_EFFECTS_MUST_BE_FALSE');
  return {ok:errors.length===0,errors};
}

async function exactActor(auth,db,token,tenantId){
  const decoded=await auth.verifyIdToken(token,true),role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(str(decoded.tenantId)!==tenantId||!OPERATOR_ROLES.includes(role)||namespace!=='staff')throw new Error('PROJECT_ACTOR_DENIED');
  const member=await db.collection('tenants').doc(tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('PROJECT_MEMBERSHIP_MISSING');
  const m=member.data()||{};if(m.active!==true||str(m.role)!==role||str(m.authNamespace)!=='staff')throw new Error('PROJECT_MEMBERSHIP_INVALID');
  return {uid:decoded.uid,role};
}
function receiptId(command){return sha(`${command.tenantId}\0${command.idempotencyKey}`).slice(0,40);}
function ack(command,projectId,extra={}){return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,tenantId:command.tenantId,projectId,commandType:command.commandType,idempotencyKey:command.idempotencyKey,...extra};}
function blocked(command,code,extra={}){return {ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,tenantId:command?.tenantId||null,projectId:command?.projectId||null,commandType:command?.commandType||null,code,...extra};}

export function createProjectCommandProvider({auth,db,policy}={}){
  const pv=validateProviderPolicy(policy);if(!pv.ok)throw new Error('PROJECT_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('PROJECT_PROVIDER_DEPENDENCIES_MISSING');
  const allowedTenants=new Set(arr(policy.allowedTenantIds).map(str));
  return Object.freeze({
    version:VERSION,
    async execute(token,command={}){
      if(!COMMAND_TYPES.includes(command.commandType))return blocked(command,'PROJECT_COMMAND_TYPE_INVALID');
      const tenantId=str(command.tenantId);if(!tenantId||!allowedTenants.has(tenantId))return blocked(command,'PROJECT_TENANT_SCOPE_DENIED');
      if(!str(command.idempotencyKey))return blocked(command,'PROJECT_IDEMPOTENCY_REQUIRED');
      const payload=clean(command.payload||{}),mode=command.commandType==='project.create'?'create':'update',valid=validateProjectPayload(payload,mode);
      if(!valid.ok)return blocked(command,'PROJECT_CONFIG_INVALID',{errors:valid.errors,warnings:valid.warnings});
      let who;try{who=await exactActor(auth,db,token,tenantId);}catch(error){return blocked(command,str(error?.message||error));}
      const tenant=db.collection('tenants').doc(tenantId),projects=tenant.collection('projects'),receipt=tenant.collection('commandReceipts').doc(receiptId(command)),digest=sha(clean(command));
      try{return await db.runTransaction(async tx=>{
        const prior=await tx.get(receipt);
        if(prior.exists){const p=prior.data()||{};if(p.commandDigest!==digest)throw new Error('PROJECT_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');if(p.status==='committed')return ack(command,p.projectId,{idempotentReplay:true,providerWrites:0});}
        let projectId=str(command.projectId||payload.projectId||payload.id),providerWrites=0;
        if(mode==='create'){
          const deterministicId=canonicalProjectId(tenantId,payload.name);
          if(projectId&&projectId!==deterministicId)throw new Error('PROJECT_CREATE_ID_MUST_BE_CANONICAL');
          projectId=deterministicId;
          const pRef=projects.doc(projectId),existing=await tx.get(pRef);if(existing.exists)throw new Error('PROJECT_NORMALIZED_NAME_ALREADY_EXISTS');
          const record={...payload,id:projectId,projectId,tenantId,normalizedName:normalizedName(payload.name),version:1,status:payload.status||'draft',createdAt:now(),createdBy:who.uid,updatedAt:now(),updatedBy:who.uid};
          tx.create(pRef,record);providerWrites++;
        }else{
          if(!projectId)throw new Error('PROJECT_ID_REQUIRED');const pRef=projects.doc(projectId),snap=await tx.get(pRef);if(!snap.exists)throw new Error('PROJECT_MISSING');const current=snap.data()||{};
          if(String(command.expectedVersion??payload.version)!==String(current.version??0))throw new Error('PROJECT_EXPECTED_VERSION_CONFLICT');
          const intendedCanonicalId=canonicalProjectId(tenantId,payload.name);if(intendedCanonicalId!==projectId&&normalizedName(payload.name)!==str(current.normalizedName))throw new Error('PROJECT_RENAME_REQUIRES_DEDICATED_MIGRATION');
          const next={...payload,id:projectId,projectId,tenantId,normalizedName:normalizedName(payload.name),version:Number(current.version||0)+1,updatedAt:now(),updatedBy:who.uid};delete next.createdAt;delete next.createdBy;
          tx.set(pRef,next,{merge:true});providerWrites++;
        }
        tx.set(receipt,{status:'committed',commandDigest:digest,projectId,commandType:command.commandType,providerAck:true,actorUid:who.uid,updatedAt:now()});providerWrites++;
        tx.create(tenant.collection('entityAuditTrail').doc('project-'+sha(command.idempotencyKey).slice(0,32)),{tenantId,projectId,entityType:'project',entityId:projectId,commandType:command.commandType,actorUid:who.uid,actorRole:who.role,idempotencyKey:command.idempotencyKey,createdAt:now()});providerWrites++;
        return ack(command,projectId,{providerWrites,warnings:valid.warnings});
      });}catch(error){return blocked(command,str(error?.message||error));}
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:[...allowedTenants],canonicalProjectId:true,externalProviderWrites:false,hrWrites:false,makeCalls:false,geminiCalls:false,paymentWrites:false};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,validateProjectPayload,validateProviderPolicy,createProjectCommandProvider};
