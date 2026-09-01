#!/usr/bin/env node
/* CXOrbia — reusable operational command provider v1.
   Durable Firestore boundary for Phase A operational commands.
   Source only: importing this module performs zero writes. Execution is impossible unless
   an explicit provider policy has enabled=true and the caller supplies verified Auth + DB.
   HR writes, Make, Gemini, Storage and payments are intentionally outside this provider.
*/
import crypto from 'node:crypto';

export const VERSION='cxorbia-operational-command-provider-v1';
export const COMMAND_TYPES=Object.freeze([
  'application.create','application.status.update','visit.assign','visit.sync.confirm'
]);
export const OPERATOR_ROLES=Object.freeze(['super','admin','ops','coordinador']);
export const APPLICATION_STATES=Object.freeze(['pendiente','aprobada','rechazada','standby','cancelada']);

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const versionOf=data=>data?.version??data?.updatedAt??data?.lastSyncedAt??'source-current';
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.idempotencyKey}`).slice(0,40);
const auditId=command=>sha(`${command.idempotencyKey}\0${command.commandType}\0${command.entityId||''}`).slice(0,40);

export function validateProviderPolicy(policy={}){
  const errors=[];
  if(policy.schemaVersion!=='cxorbia.operational.provider-policy.v1')errors.push('policy-schema');
  if(policy.enabled!==true)errors.push('policy-disabled');
  if(!arr(policy.allowedTenantIds).map(str).filter(Boolean).length)errors.push('allowed-tenants-required');
  if(policy.hrWrites!==false||policy.makeCalls!==false||policy.geminiCalls!==false||policy.storageWrites!==false||policy.paymentWrites!==false)errors.push('external-side-effects-must-be-false');
  if(policy.conflictPolicy!=='review_no_silent_overwrite')errors.push('conflict-policy');
  return {ok:errors.length===0,errors};
}

export function validateCommand(command={}){
  const errors=[];
  if(command.version!=='cxorbia-command-adapter-v1')errors.push('command-version');
  if(!COMMAND_TYPES.includes(command.commandType))errors.push('command-type');
  if(!str(command.entityType))errors.push('entity-type');
  if(!str(command.tenantId)||!str(command.projectId))errors.push('scope');
  if(!str(command.idempotencyKey))errors.push('idempotency');
  if(command.expectedVersion===undefined||command.expectedVersion===null||command.expectedVersion==='')errors.push('expected-version');
  if(command.authorization?.providerEnforcementRequired!==true)errors.push('provider-enforcement');
  return {ok:errors.length===0,errors};
}

function scopeAllowed(policy,command){
  const tenants=new Set(arr(policy.allowedTenantIds).map(str));
  const projects=new Set(arr(policy.allowedProjectIds).map(str));
  return tenants.has(str(command.tenantId))&&(!projects.size||projects.has(str(command.projectId)));
}

async function exactActor(auth,db,token,command){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(str(decoded.tenantId)!==str(command.tenantId))throw new Error('OPS_ACTOR_TENANT_DENIED');
  if(!OPERATOR_ROLES.includes(role)&&role!=='shopper')throw new Error('OPS_ACTOR_ROLE_DENIED');
  if(role==='shopper'&&namespace!=='shopper')throw new Error('OPS_ACTOR_NAMESPACE_DENIED');
  if(OPERATOR_ROLES.includes(role)&&namespace!=='staff')throw new Error('OPS_ACTOR_NAMESPACE_DENIED');
  const tokenProjects=arr(decoded.projectIds).map(str);
  if(role!=='super'&&!tokenProjects.includes(str(command.projectId)))throw new Error('OPS_ACTOR_PROJECT_DENIED');
  const member=await db.collection('tenants').doc(command.tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('OPS_ACTOR_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(m.active!==true||str(m.tenantId)!==str(command.tenantId)||str(m.role)!==role||str(m.authNamespace)!==namespace)throw new Error('OPS_ACTOR_MEMBERSHIP_INVALID');
  const memberProjects=arr(m.projectIds).map(str);
  if(role!=='super'&&!memberProjects.includes(str(command.projectId)))throw new Error('OPS_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  const shopperId=role==='shopper'?str(decoded.shopperId||m.shopperId):null;
  if(role==='shopper'&&!shopperId)throw new Error('OPS_ACTOR_SHOPPER_ID_MISSING');
  return {uid:decoded.uid,role,namespace,tenantId:command.tenantId,projectId:command.projectId,shopperId};
}

function refs(db,command){
  const tenant=db.collection('tenants').doc(command.tenantId),project=tenant.collection('projects').doc(command.projectId);
  return {
    tenant,project,visits:project.collection('visits'),applications:project.collection('postulations'),
    receipt:tenant.collection('commandReceipts').doc(receiptId(command)),
    audit:tenant.collection('entityAuditTrail').doc(auditId(command)),
    review:tenant.collection('reviewQueue').doc('ops-'+auditId(command))
  };
}
function ack(command,entityId,extra={}){return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,tenantId:command.tenantId,projectId:command.projectId,commandType:command.commandType,entityType:command.entityType,entityId:entityId||command.entityId||null,idempotencyKey:command.idempotencyKey,...extra};}
function blocked(command,code,extra={}){return {ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,tenantId:command?.tenantId||null,projectId:command?.projectId||null,commandType:command?.commandType||null,entityId:command?.entityId||null,code,...extra};}
function assertVersion(command,data){if(command.expectedVersion==='absent')return;if(str(command.expectedVersion)!==str(versionOf(data)))throw new Error('OPS_EXPECTED_VERSION_CONFLICT');}
function isAvailable(v){const state=str(v?.estado||v?.status).toLowerCase();return ['disponible','available'].includes(state)&&!str(v?.shopperId);}

async function transactionExecute(db,command,actor){
  const r=refs(db,command),digest=sha(clean(command));
  return db.runTransaction(async tx=>{
    const prior=await tx.get(r.receipt);
    if(prior.exists){
      const p=prior.data()||{};
      if(p.commandDigest!==digest)throw new Error('OPS_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD');
      if(p.status==='committed')return ack(command,p.entityId,{idempotentReplay:true,providerWrites:0});
    }
    const payload=clean(command.payload||{});
    let entityId=str(command.entityId),providerWrites=0,auditEntityType=command.entityType;

    if(command.commandType==='application.create'){
      if(actor.role!=='shopper')throw new Error('OPS_APPLICATION_CREATE_SHOPPER_ONLY');
      const visitId=str(payload.visitId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');
      const vRef=r.visits.doc(visitId),vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('OPS_VISIT_MISSING');const v=vSnap.data()||{};
      if(!isAvailable(v))throw new Error('OPS_VISIT_NOT_AVAILABLE');
      const shopperId=str(payload.shopperId||actor.shopperId);if(shopperId!==actor.shopperId)throw new Error('OPS_APPLICATION_SHOPPER_SCOPE_DENIED');
      entityId=entityId||('app-'+sha(`${command.tenantId}\0${command.projectId}\0${visitId}\0${shopperId}\0${command.idempotencyKey}`).slice(0,24));
      const aRef=r.applications.doc(entityId),aSnap=await tx.get(aRef);if(aSnap.exists)throw new Error('OPS_APPLICATION_ALREADY_EXISTS');
      tx.create(aRef,{id:entityId,applicationId:entityId,postulationId:entityId,tenantId:command.tenantId,projectId:command.projectId,visitId,visitaId:visitId,hrRowId:payload.hrRowId||v.hrRowId||null,shopperId,status:'pendiente',estado:'pendiente',fechaProp:payload.proposedDate||null,note:payload.note||null,source:'platform',version:1,createdAt:now(),updatedAt:now()});providerWrites++;
      auditEntityType='application';
    }
    else if(command.commandType==='application.status.update'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_APPLICATION_STATUS_OPERATOR_ONLY');
      const aRef=r.applications.doc(entityId),aSnap=await tx.get(aRef);if(!aSnap.exists)throw new Error('OPS_APPLICATION_MISSING');const a=aSnap.data()||{};assertVersion(command,a);
      const status=str(payload.status).toLowerCase();if(!APPLICATION_STATES.includes(status))throw new Error('OPS_APPLICATION_STATUS_INVALID');
      let vRef=null,v=null;
      if(status==='aprobada'){
        const visitId=str(a.visitId||a.visitaId||payload.visitId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');
        vRef=r.visits.doc(visitId);const vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('OPS_VISIT_MISSING');v=vSnap.data()||{};
        const assigned=str(v.shopperId);if(assigned&&assigned!==str(a.shopperId)){
          tx.set(r.review,{tenantId:command.tenantId,projectId:command.projectId,entityType:'visit',entityId:visitId,reviewType:'assignment_conflict',status:'open',reason:'shopper_mismatch',platformShopperId:str(a.shopperId),observedShopperId:assigned,automaticOverwrite:false,createdAt:now()});providerWrites++;
          throw new Error('OPS_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
        }
      }
      tx.set(aRef,{status,estado:status,decisionReason:payload.reason||null,managedBy:actor.uid,updatedAt:now(),version:Number(a.version||0)+1},{merge:true});providerWrites++;
      if(status==='aprobada'){
        tx.set(vRef,{shopperId:str(a.shopperId),estado:'asignada',status:'asignada',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      }
      auditEntityType='application';
    }
    else if(command.commandType==='visit.assign'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_VISIT_ASSIGN_OPERATOR_ONLY');
      const visitId=str(payload.visitId||entityId),shopperId=str(payload.shopperId);if(!visitId||!shopperId)throw new Error('OPS_VISIT_ASSIGN_KEYS_REQUIRED');entityId=visitId;
      const vRef=r.visits.doc(visitId),vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('OPS_VISIT_MISSING');const v=vSnap.data()||{};assertVersion(command,v);
      const assigned=str(v.shopperId);if(assigned&&assigned!==shopperId)throw new Error('OPS_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
      const source=str(payload.assignmentSource||'platform');if(!['platform','hr'].includes(source))throw new Error('OPS_ASSIGNMENT_SOURCE_INVALID');
      tx.set(vRef,{shopperId,estado:'asignada',status:'asignada',assignmentSource:source,assignmentSyncStatus:source==='platform'?'pending_hr':'pending_platform',hrRowId:payload.hrRowId||v.hrRowId||null,lastSyncedAt:null,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      auditEntityType='visit';
    }
    else if(command.commandType==='visit.sync.confirm'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_SYNC_CONFIRM_OPERATOR_ONLY');
      const visitId=str(payload.visitId||entityId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');entityId=visitId;
      const vRef=r.visits.doc(visitId),vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('OPS_VISIT_MISSING');const v=vSnap.data()||{};assertVersion(command,v);
      const expectedShopper=str(v.shopperId),observedShopper=str(payload.hrShopperId||payload.shopperId),expectedHr=str(v.hrRowId),observedHr=str(payload.hrRowId);
      if(!expectedShopper||!observedShopper||expectedShopper!==observedShopper||!expectedHr||!observedHr||expectedHr!==observedHr){
        tx.set(r.review,{tenantId:command.tenantId,projectId:command.projectId,entityType:'visit',entityId:visitId,reviewType:'assignment_sync_conflict',status:'open',reason:'stable_identity_or_shopper_mismatch',expectedShopperId:expectedShopper,observedShopperId:observedShopper,expectedHrRowId:expectedHr,observedHrRowId:observedHr,automaticOverwrite:false,createdAt:now()});providerWrites++;
        throw new Error('OPS_SYNC_CONFIRM_CONFLICT_REVIEW_REQUIRED');
      }
      tx.set(vRef,{assignmentSyncStatus:'synced',lastSyncedAt:payload.lastSyncedAt||now(),updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      auditEntityType='visit';
    }

    tx.set(r.receipt,{status:'committed',commandDigest:digest,entityId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,updatedAt:now()});providerWrites++;
    tx.set(r.audit,{tenantId:command.tenantId,projectId:command.projectId,entityId,entityType:auditEntityType,commandType:command.commandType,actorUid:actor.uid,actorRole:actor.role,idempotencyKey:command.idempotencyKey,reason:command.audit?.reason||null,createdAt:now()},{merge:false});providerWrites++;
    return ack(command,entityId,{providerWrites});
  });
}

export function createOperationalCommandProvider({auth,db,policy}={}){
  const pv=validateProviderPolicy(policy);if(!pv.ok)throw new Error('OPS_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('OPS_PROVIDER_DEPENDENCIES_MISSING');
  return Object.freeze({
    version:VERSION,
    async execute(token,command){
      const cv=validateCommand(command);if(!cv.ok)return blocked(command,'OPS_COMMAND_INVALID',{errors:cv.errors});
      if(!scopeAllowed(policy,command))return blocked(command,'OPS_COMMAND_SCOPE_DENIED');
      let actor;
      try{actor=await exactActor(auth,db,token,command);}catch(error){return blocked(command,'OPS_ACTOR_DENIED',{error:str(error?.message||error)});}
      try{return await transactionExecute(db,command,actor);}catch(error){return blocked(command,str(error?.message||error));}
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:arr(policy.allowedTenantIds),allowedProjectIds:arr(policy.allowedProjectIds),conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,APPLICATION_STATES,validateProviderPolicy,validateCommand,createOperationalCommandProvider};
