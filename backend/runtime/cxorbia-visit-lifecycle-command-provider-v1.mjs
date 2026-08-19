#!/usr/bin/env node
/* CXOrbia I4-B visit lifecycle provider source v1.
   Source-only until an explicit DEV write gate supplies a request and starts the server.
   No HR/Make/Gemini/Storage/payment/deploy action is performed by this module. */
import crypto from 'node:crypto';

export const VERSION='cxorbia-visit-lifecycle-command-provider-v1';
export const COMMAND_TYPES=Object.freeze([
  'application.create',
  'application.status.update',
  'visit.assign',
  'visit.state.update',
  'visit.reschedule',
  'visit.cancel',
  'visit.questionnaire.submit',
  'visit.review.update'
]);
export const OPERATOR_ROLES=Object.freeze(['super','admin','ops','coordinador']);
export const REVIEW_STATES=Object.freeze(['pending_review','in_review','needs_correction','approved_for_submitido','submitido_registered','rejected','hr_conflict','cancelled']);
export const APPLICATION_STATES=Object.freeze(['pendiente','aprobada','rechazada','standby','cancelada']);
export const SHOPPER_COMMANDS=Object.freeze(['application.create','visit.state.update','visit.reschedule','visit.cancel','visit.questionnaire.submit']);
export const PROVIDER_COLLECTIONS=Object.freeze({visits:'visits',postulations:'postulations',receipts:'commandReceipts',audit:'entityAuditTrail'});

const str=v=>String(v==null?'':v).trim();
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const versionOf=data=>data?.version ?? data?.updatedAt ?? data?.lastSyncedAt ?? data?.sourceRevision ?? 'source-current';
const isAvailable=v=>['disponible','available'].includes(str(v?.estado||v?.status).toLowerCase()) && !str(v?.shopperId);
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.idempotencyKey}`).slice(0,40);
const auditId=command=>sha(`${command.idempotencyKey}\0${command.commandType}\0audit`).slice(0,40);

export function validateExecutionGate(gate={}){
  const errors=[];
  if(gate.schemaVersion!=='cxorbia.i4b.visit-lifecycle-write-gate.v1')errors.push('gate-schema');
  if(gate.repository!=='paulaosoriof86/demoCXOrbia'||gate.branch!=='docs-tya-v6-v71-audit'||Number(gate.pullRequest)!==7)errors.push('gate-lane');
  if(gate.firebaseProjectId!=='cxorbia-backend-dev'||gate.tenantId!=='tya'||gate.projectId!=='cinepolis')errors.push('gate-target');
  if(gate.enabled!==true||gate.consumed!==false||gate.authorizedBy!=='Paula'||gate.allowedExecutions!==1)errors.push('gate-authorization');
  if(gate.syntheticVisitOnly!==true||gate.historicalShopperAccess!==false||gate.realHrVisitMutationAllowed!==false)errors.push('gate-fixture-policy');
  for(const k of ['hrWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','paymentWrites','hostingDeploys','cloudRunDeploys'])if(Number(gate[k]||0)!==0)errors.push('gate-forbidden-'+k);
  if(gate.merge!==false||gate.production!==false)errors.push('gate-production-policy');
  return {ok:errors.length===0,errors};
}

export function validateCommand(command={}){
  const errors=[];
  if(command.version!=='cxorbia-command-adapter-v1')errors.push('command-version');
  if(!COMMAND_TYPES.includes(command.commandType))errors.push('command-type');
  if(str(command.entityType)==='')errors.push('entity-type');
  if(str(command.tenantId)===''||str(command.projectId)==='')errors.push('scope');
  if(str(command.idempotencyKey)==='')errors.push('idempotency');
  if(command.expectedVersion===undefined||command.expectedVersion===null||command.expectedVersion==='')errors.push('expected-version');
  if(command.authorization?.providerEnforcementRequired!==true)errors.push('provider-enforcement');
  return {ok:errors.length===0,errors};
}

function actorAllowed(actor,command){
  const role=str(actor?.role);
  if(OPERATOR_ROLES.includes(role))return true;
  return role==='shopper'&&SHOPPER_COMMANDS.includes(command.commandType);
}

async function exactActor(auth,db,token,tenantId,projectId){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(decoded.tenantId!==tenantId)throw new Error('I4B_ACTOR_TENANT_DENIED');
  if(!OPERATOR_ROLES.includes(role)&&role!=='shopper')throw new Error('I4B_ACTOR_ROLE_DENIED');
  if(role==='shopper'&&namespace!=='shopper')throw new Error('I4B_ACTOR_NAMESPACE_DENIED');
  if(OPERATOR_ROLES.includes(role)&&namespace!=='staff')throw new Error('I4B_ACTOR_NAMESPACE_DENIED');
  const tokenProjects=Array.isArray(decoded.projectIds)?decoded.projectIds.map(str):[];
  if(role!=='super'&&!tokenProjects.includes(projectId))throw new Error('I4B_ACTOR_PROJECT_DENIED');
  const member=await db.collection('tenants').doc(tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('I4B_ACTOR_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(m.active!==true||str(m.tenantId)!==tenantId||str(m.role)!==role||str(m.authNamespace)!==namespace)throw new Error('I4B_ACTOR_MEMBERSHIP_INVALID');
  const memberProjects=Array.isArray(m.projectIds)?m.projectIds.map(str):[];
  if(role!=='super'&&!memberProjects.includes(projectId))throw new Error('I4B_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  const shopperId=role==='shopper'?str(decoded.shopperId||m.shopperId):null;
  if(role==='shopper'&&!shopperId)throw new Error('I4B_ACTOR_SHOPPER_ID_MISSING');
  return {uid:decoded.uid,role,tenantId,projectIds:tokenProjects,shopperId};
}

function refs(db,command){
  const tenant=db.collection('tenants').doc(command.tenantId);
  const project=tenant.collection('projects').doc(command.projectId);
  return {
    tenant,project,
    visits:project.collection(PROVIDER_COLLECTIONS.visits),
    postulations:project.collection(PROVIDER_COLLECTIONS.postulations),
    receipt:tenant.collection(PROVIDER_COLLECTIONS.receipts).doc(receiptId(command)),
    audit:tenant.collection(PROVIDER_COLLECTIONS.audit).doc(auditId(command))
  };
}

function ack(command,entityId,extra={}){
  return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,providerWrites:Number(extra.providerWrites||1),commandType:command.commandType,entityType:command.entityType,entityId:entityId||command.entityId||null,tenantId:command.tenantId,projectId:command.projectId,idempotencyKey:command.idempotencyKey,...extra};
}

function assertVersion(command,data){
  if(command.expectedVersion==='absent')return;
  if(str(command.expectedVersion)!==str(versionOf(data)))throw new Error('I4B_EXPECTED_VERSION_CONFLICT');
}

function assertShopperOwns(actor,data){
  if(actor.role!=='shopper')return;
  if(str(data?.shopperId)!==str(actor.shopperId))throw new Error('I4B_SHOPPER_RESOURCE_SCOPE_DENIED');
}

function visitPatchForState(current,patch,actor){
  const next=str(patch?.estado||patch?.status).toLowerCase();
  const currentState=str(current?.estado||current?.status).toLowerCase();
  const allowedShopper={asignada:new Set(['agendada']),agendada:new Set(['realizada']),realizada:new Set(['cuestionario']),cuestionario:new Set([])};
  if(actor.role==='shopper'&&!(allowedShopper[currentState]?.has(next)))throw new Error('I4B_VISIT_TRANSITION_DENIED');
  if(['cancelada','liquidada','pagada'].includes(currentState))throw new Error('I4B_VISIT_TERMINAL_STATE');
  const out={estado:next,status:next,updatedAt:now(),version:Number(current?.version||0)+1};
  for(const k of ['agendada','realizada','cuestFecha'])if(patch?.[k])out[k]=patch[k];
  return out;
}

async function executeInTransaction(db,command,actor){
  const r=refs(db,command),digest=sha(clean(command));
  return db.runTransaction(async tx=>{
    const prior=await tx.get(r.receipt);
    if(prior.exists){const p=prior.data()||{};if(p.commandDigest!==digest)throw new Error('I4B_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD');if(p.status==='committed')return ack(command,p.entityId,{idempotentReplay:true,providerWrites:0});}
    let entityId=str(command.entityId),providerWrites=0,auditTarget='';
    const payload=clean(command.payload||{});

    if(command.commandType==='application.create'){
      if(actor.role!=='shopper')throw new Error('I4B_APPLICATION_CREATE_SHOPPER_ONLY');
      const visitId=str(payload.visitId||command.entityId);if(!visitId)throw new Error('I4B_VISIT_ID_REQUIRED');
      const vRef=r.visits.doc(visitId),vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('I4B_VISIT_MISSING');const v=vSnap.data()||{};
      if(!isAvailable(v))throw new Error('I4B_VISIT_NOT_AVAILABLE');
      const shopperId=str(payload.shopperId||actor.shopperId);if(shopperId!==actor.shopperId)throw new Error('I4B_APPLICATION_SHOPPER_SCOPE_DENIED');
      entityId=entityId&&entityId!==visitId?entityId:'app-'+sha(command.idempotencyKey).slice(0,24);
      const aRef=r.postulations.doc(entityId),aSnap=await tx.get(aRef);if(aSnap.exists)throw new Error('I4B_APPLICATION_ALREADY_EXISTS');
      tx.create(aRef,{id:entityId,applicationId:entityId,postulationId:entityId,tenantId:command.tenantId,projectId:command.projectId,visitId,visitaId:visitId,shopperId,status:'pendiente',estado:'pendiente',fechaProp:payload.proposedDate||payload.fechaProp||null,note:payload.note||null,source:'platform',version:1,createdAt:now(),updatedAt:now()});providerWrites++;
      auditTarget=entityId;
    } else if(command.commandType==='application.status.update'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('I4B_APPLICATION_STATUS_OPERATOR_ONLY');
      const aRef=r.postulations.doc(entityId),aSnap=await tx.get(aRef);if(!aSnap.exists)throw new Error('I4B_APPLICATION_MISSING');const a=aSnap.data()||{};assertVersion(command,a);
      const status=str(payload.status).toLowerCase();if(!APPLICATION_STATES.includes(status))throw new Error('I4B_APPLICATION_STATUS_INVALID');
      tx.set(aRef,{status,estado:status,decisionReason:payload.reason||null,managedBy:actor.uid,updatedAt:now(),version:Number(a.version||0)+1},{merge:true});providerWrites++;
      if(status==='aprobada'){
        const visitId=str(a.visitId||a.visitaId||payload.visitId);const vRef=r.visits.doc(visitId),vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('I4B_VISIT_MISSING');const v=vSnap.data()||{};
        const assigned=str(v.shopperId);if(assigned&&assigned!==str(a.shopperId))throw new Error('I4B_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
        tx.set(vRef,{shopperId:str(a.shopperId),estado:'asignada',status:'asignada',assignmentSource:'platform',assignmentSyncStatus:'pending',lastSyncedAt:null,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      }
      auditTarget=entityId;
    } else {
      const visitId=str(payload.visitId||entityId);if(!visitId)throw new Error('I4B_VISIT_ID_REQUIRED');entityId=visitId;
      const vRef=r.visits.doc(visitId),vSnap=await tx.get(vRef);if(!vSnap.exists)throw new Error('I4B_VISIT_MISSING');const v=vSnap.data()||{};assertVersion(command,v);assertShopperOwns(actor,v);
      if(command.commandType==='visit.assign'){
        if(!OPERATOR_ROLES.includes(actor.role))throw new Error('I4B_VISIT_ASSIGN_OPERATOR_ONLY');
        const shopperId=str(payload.shopperId);if(!shopperId)throw new Error('I4B_ASSIGN_SHOPPER_REQUIRED');if(str(v.shopperId)&&str(v.shopperId)!==shopperId)throw new Error('I4B_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
        tx.set(vRef,{shopperId,estado:'asignada',status:'asignada',assignmentSource:str(payload.assignmentSource||'platform'),assignmentSyncStatus:'pending',updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      } else if(command.commandType==='visit.state.update'){
        const patch=visitPatchForState(v,payload.patch||{},actor);tx.set(vRef,patch,{merge:true});providerWrites++;
      } else if(command.commandType==='visit.reschedule'){
        const newDate=str(payload.newDate);if(!newDate)throw new Error('I4B_RESCHEDULE_DATE_REQUIRED');
        if(actor.role==='shopper'||payload.requestedByShopper===true){tx.set(vRef,{rescheduleRequest:{status:'pending_review',newDate,reason:payload.reason||null,requestedByShopperId:actor.shopperId,requestedAt:now()},updatedAt:now(),version:Number(v.version||0)+1},{merge:true});}
        else {const decision=str(payload.decision||'approved').toLowerCase();if(!['approved','rejected'].includes(decision))throw new Error('I4B_RESCHEDULE_DECISION_INVALID');const patch={rescheduleRequest:{status:decision,newDate,reason:payload.reason||null,decidedBy:actor.uid,decidedAt:now()},updatedAt:now(),version:Number(v.version||0)+1};if(decision==='approved'){patch.agendada=newDate;patch.estado='agendada';patch.status='agendada';}tx.set(vRef,patch,{merge:true});}
        providerWrites++;
      } else if(command.commandType==='visit.cancel'){
        if(actor.role==='shopper'||payload.requestOnly===true){tx.set(vRef,{cancelRequest:{status:'pending_review',reason:payload.reason||null,requestedByShopperId:actor.shopperId,requestedAt:now()},updatedAt:now(),version:Number(v.version||0)+1},{merge:true});}
        else {const release=payload.releaseToAvailable===true;tx.set(vRef,{estado:release?'disponible':'cancelada',status:release?'disponible':'cancelada',cancelled:true,cancelReason:payload.reason||null,shopperId:release?null:v.shopperId||null,shopper:release?null:v.shopper||null,agendada:release?null:v.agendada||null,assignmentSyncStatus:'pending',updatedAt:now(),version:Number(v.version||0)+1},{merge:true});}
        providerWrites++;
      } else if(command.commandType==='visit.questionnaire.submit'){
        if(actor.role!=='shopper'&&!OPERATOR_ROLES.includes(actor.role))throw new Error('I4B_QUESTIONNAIRE_ROLE_DENIED');
        tx.set(vRef,{questionnaireResult:payload.result||{},cuestFecha:payload.completedAt||now().slice(0,10),estado:'cuestionario',status:'cuestionario',questionnaireSubmittedBy:actor.uid,questionnaireSubmittedAt:now(),updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      } else if(command.commandType==='visit.review.update'){
        if(!OPERATOR_ROLES.includes(actor.role))throw new Error('I4B_REVIEW_OPERATOR_ONLY');const state=str(payload.reviewStatus);if(!REVIEW_STATES.includes(state))throw new Error('I4B_REVIEW_STATUS_INVALID');
        tx.set(vRef,{reviewStatus:state,reviewNote:payload.note||null,reviewedBy:actor.uid,reviewedAt:now(),updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      }
      auditTarget=visitId;
    }

    tx.set(r.receipt,{status:'committed',commandDigest:digest,entityId,commandType:command.commandType,providerAck:true,tenantId:command.tenantId,projectId:command.projectId,actorUid:actor.uid,updatedAt:now()});providerWrites++;
    tx.create(r.audit,{tenantId:command.tenantId,projectId:command.projectId,entityId:auditTarget||entityId,entityType:command.entityType,commandType:command.commandType,actorUid:actor.uid,actorRole:actor.role,idempotencyKey:command.idempotencyKey,reason:command.audit?.reason||null,createdAt:now()});providerWrites++;
    return ack(command,entityId,{providerWrites});
  });
}

export function createVisitLifecycleProvider({auth,db,gate}={}){
  const gv=validateExecutionGate(gate);if(!gv.ok)throw new Error('I4B_WRITE_GATE_INVALID:'+gv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('I4B_PROVIDER_DEPENDENCIES_MISSING');
  return Object.freeze({
    version:VERSION,
    async execute(token,command){
      const cv=validateCommand(command);if(!cv.ok)return {ok:false,status:'blocked',providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,code:'I4B_COMMAND_INVALID',errors:cv.errors,providerWrites:0};
      if(command.tenantId!==gate.tenantId||command.projectId!==gate.projectId)return {ok:false,status:'blocked',providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,code:'I4B_COMMAND_SCOPE_MISMATCH',providerWrites:0};
      const actor=await exactActor(auth,db,token,gate.tenantId,gate.projectId);if(!actorAllowed(actor,command))return {ok:false,status:'blocked',providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,code:'I4B_COMMAND_ROLE_DENIED',providerWrites:0};
      return executeInTransaction(db,command,actor);
    },
    status(){return {version:VERSION,gateValidated:true,tenantId:gate.tenantId,projectId:gate.projectId,syntheticVisitOnly:gate.syntheticVisitOnly===true,realHrVisitMutationAllowed:false,hrWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,REVIEW_STATES,APPLICATION_STATES,SHOPPER_COMMANDS,PROVIDER_COLLECTIONS,validateExecutionGate,validateCommand,createVisitLifecycleProvider};
