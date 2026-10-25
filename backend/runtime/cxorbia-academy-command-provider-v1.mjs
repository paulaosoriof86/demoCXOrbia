#!/usr/bin/env node
/* CXOrbia — tenant-scoped Academia command provider v1.
   VRM-192: durable custom course/category/workflow/audit authority.
   Seed/base courses remain source-owned and immutable.
*/
import crypto from 'node:crypto';

export const VERSION='cxorbia-academy-command-provider-v1';
export const COMMAND_TYPES=Object.freeze([
  'academy.course.create','academy.course.update','academy.course.state','academy.category.create'
]);
export const OPERATOR_ROLES=Object.freeze(['super','admin']);
export const COURSE_STATES=Object.freeze({
  borrador:['en_revision','archivado','eliminado'],
  en_revision:['aprobado','borrador','archivado','eliminado'],
  aprobado:['publicado_preview','en_revision','archivado','eliminado'],
  publicado_preview:['archivado','en_revision'],
  archivado:['borrador'],
  eliminado:['borrador']
});
const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const norm=v=>str(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
const safeId=v=>/^[A-Za-z0-9._:-]{1,140}$/.test(str(v));
const blocked=(command,code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,readbackVerified:false,localMutation:false,localStorageWrite:false,providerWrites:0,hrWrites:0,externalWrites:0,paymentWrites:0,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null,commandType:command?.commandType||null,code,...extra});
const ack=(command,entityId,extra={})=>({ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,readbackVerified:true,localMutation:false,localStorageWrite:false,hrWrites:0,externalWrites:0,paymentWrites:0,tenantId:command.tenantId,projectId:command.projectId||null,periodId:command.periodId||null,commandType:command.commandType,entityId,idempotencyKey:command.idempotencyKey,...extra});
const receiptId=command=>sha(str(command.tenantId)+'\0'+str(command.idempotencyKey)).slice(0,40);
const courseId=(tenantId,audience,payload,command)=>{
  const requested=str(command.entityId||payload.id);
  if(requested&&safeId(requested))return requested;
  return 'acad-'+sha(tenantId+'\0'+str(audience)+'\0'+norm(payload.n||payload.name)+'\0'+str(command.idempotencyKey)).slice(0,22);
};
const categoryId=(tenantId,name,command)=>{
  const requested=str(command.entityId);
  if(requested&&safeId(requested))return requested;
  return 'acat-'+sha(tenantId+'\0'+norm(name)).slice(0,20);
};
function validatePolicy(policy={}){
  const errors=[];
  if(policy.schemaVersion!=='cxorbia.academy-command-provider-policy.v1')errors.push('POLICY_SCHEMA_INVALID');
  if(policy.enabled!==true)errors.push('POLICY_DISABLED');
  if(!arr(policy.allowedTenantIds).map(str).filter(Boolean).length)errors.push('POLICY_TENANTS_REQUIRED');
  if(policy.hrWrites!==false||policy.externalWrites!==false||policy.paymentWrites!==false)errors.push('POLICY_EXTERNAL_SIDE_EFFECTS_MUST_BE_FALSE');
  return {ok:errors.length===0,errors};
}
async function exactActor(auth,db,token,tenantId){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role).toLowerCase(),namespace=str(decoded.authNamespace||'staff').toLowerCase();
  if(str(decoded.tenantId)!==tenantId||!OPERATOR_ROLES.includes(role)||namespace!=='staff')throw new Error('ACADEMY_ACTOR_DENIED');
  const member=await db.collection('tenants').doc(tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('ACADEMY_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(m.active===false||str(m.status||'active').toLowerCase()==='inactive'||str(m.role).toLowerCase()!==role||str(m.authNamespace).toLowerCase()!=='staff')throw new Error('ACADEMY_MEMBERSHIP_INVALID');
  return {uid:decoded.uid,role,displayName:str(decoded.name||decoded.displayName||m.name||m.displayName||decoded.email||decoded.uid)};
}
function validateCourseCreate(payload={}){
  const errors=[];
  if(!str(payload.n||payload.name))errors.push('ACADEMY_COURSE_NAME_REQUIRED');
  if(!str(payload.audience))errors.push('ACADEMY_AUDIENCE_REQUIRED');
  if(payload.seed===true||payload.sourceOwned===true)errors.push('ACADEMY_SEED_MUTATION_FORBIDDEN');
  return {ok:errors.length===0,errors};
}
function auditRecord(command,who,entityType,entityId,action,detail={}){
  return {
    tenantId:command.tenantId,projectId:command.projectId||null,periodId:command.periodId||null,
    entityType,entityId,action,commandType:command.commandType,
    actorUid:who.uid,actorRole:who.role,actorDisplayName:who.displayName,
    audience:str(detail.audience||command.payload?.audience||''),reason:str(detail.reason||command.payload?.reason||''),
    fromState:detail.fromState??null,toState:detail.toState??null,
    contentVersion:detail.contentVersion??null,workflowVersion:detail.workflowVersion??null,
    idempotencyKey:command.idempotencyKey,createdAt:now()
  };
}

export function createAcademyCommandProvider({auth,db,policy}={}){
  const pv=validatePolicy(policy);
  if(!pv.ok)throw new Error('ACADEMY_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('ACADEMY_PROVIDER_DEPENDENCIES_MISSING');
  const allowedTenants=new Set(arr(policy.allowedTenantIds).map(str));
  return Object.freeze({
    version:VERSION,
    async execute(token,command={}){
      const type=str(command.commandType);
      if(!COMMAND_TYPES.includes(type))return blocked(command,'ACADEMY_COMMAND_TYPE_INVALID');
      const tenantId=str(command.tenantId);
      if(!tenantId||!allowedTenants.has(tenantId))return blocked(command,'ACADEMY_TENANT_SCOPE_DENIED');
      if(!str(command.idempotencyKey))return blocked(command,'ACADEMY_IDEMPOTENCY_REQUIRED');
      let who;try{who=await exactActor(auth,db,token,tenantId);}catch(error){return blocked(command,str(error?.message||error));}
      const tenant=db.collection('tenants').doc(tenantId),courses=tenant.collection('academyCourses'),categories=tenant.collection('academyCategories'),audits=tenant.collection('academyAudit'),receipt=tenant.collection('commandReceipts').doc(receiptId(command));
      const payload=clean(command.payload||{}),digest=sha(clean(command));

      if(type==='academy.category.create'){
        const name=str(payload.name);
        if(!name)return blocked(command,'ACADEMY_CATEGORY_NAME_REQUIRED');
        if(String(command.expectedVersion)!=='absent')return blocked(command,'ACADEMY_CATEGORY_EXPECTED_VERSION_INVALID');
        const id=categoryId(tenantId,name,command),ref=categories.doc(id);
        let txResult;
        try{
          txResult=await db.runTransaction(async tx=>{
            const prior=await tx.get(receipt);
            if(prior.exists){
              const p=prior.data()||{};
              if(p.commandDigest!==digest)throw new Error('ACADEMY_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
              if(p.status==='committed')return {entityId:p.entityId,entityVersion:p.entityVersion,idempotentReplay:true,providerWrites:0,auditId:p.auditId};
            }
            const existing=await tx.get(ref);
            if(existing.exists)throw new Error('ACADEMY_CATEGORY_ALREADY_EXISTS');
            const record={id,name,normalizedName:norm(name),tenantId,version:1,createdAt:now(),createdBy:who.uid,updatedAt:now(),updatedBy:who.uid};
            tx.create(ref,record);
            const auditId='aa-'+sha(command.idempotencyKey).slice(0,32),auditRef=audits.doc(auditId),audit=auditRecord(command,who,'academyCategory',id,'category.create',{});
            tx.create(auditRef,{id:auditId,...audit});
            tx.set(receipt,{status:'committed',commandDigest:digest,entityType:'academyCategory',entityId:id,entityVersion:1,auditId,commandType:type,providerAck:true,actorUid:who.uid,updatedAt:now()});
            tx.create(tenant.collection('entityAuditTrail').doc('academy-'+sha(command.idempotencyKey).slice(0,32)),audit);
            return {entityId:id,entityVersion:1,idempotentReplay:false,providerWrites:4,auditId};
          });
        }catch(error){return blocked(command,str(error?.message||error));}
        const rb=await ref.get(),ab=await audits.doc(txResult.auditId).get();
        if(!rb.exists)return blocked(command,'ACADEMY_CATEGORY_READBACK_MISSING',{entityId:id});
        return ack(command,id,{entityType:'academyCategory',entityVersion:txResult.entityVersion,entityReadback:{id:rb.id,...clean(rb.data()||{})},auditReadback:ab.exists?{id:ab.id,...clean(ab.data()||{})}:null,idempotentReplay:txResult.idempotentReplay,providerWrites:txResult.providerWrites});
      }

      const audience=str(payload.audience);
      const create=type==='academy.course.create';
      if(create){
        const valid=validateCourseCreate(payload);if(!valid.ok)return blocked(command,'ACADEMY_COURSE_INVALID',{errors:valid.errors});
        if(String(command.expectedVersion)!=='absent')return blocked(command,'ACADEMY_CREATE_EXPECTED_VERSION_INVALID');
      }
      const id=courseId(tenantId,audience,payload,command),ref=courses.doc(id);
      let txResult;
      try{
        txResult=await db.runTransaction(async tx=>{
          const prior=await tx.get(receipt);
          if(prior.exists){
            const p=prior.data()||{};
            if(p.commandDigest!==digest)throw new Error('ACADEMY_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
            if(p.status==='committed')return {entityId:p.entityId,entityVersion:p.entityVersion,idempotentReplay:true,providerWrites:0,auditId:p.auditId};
          }
          const snap=await tx.get(ref),current=snap.exists?(snap.data()||{}):null;
          if(create&&current)throw new Error('ACADEMY_COURSE_ALREADY_EXISTS');
          if(!create&&!current)throw new Error('ACADEMY_COURSE_NOT_FOUND');
          if(!create&&String(command.expectedVersion)!==String(current.version??0))throw new Error('ACADEMY_EXPECTED_VERSION_CONFLICT');
          let next,action='',fromState=current?.estado||null,toState=current?.estado||null;
          if(create){
            const cleanPayload={...payload};delete cleanPayload.id;delete cleanPayload.version;delete cleanPayload.createdAt;delete cleanPayload.createdBy;delete cleanPayload.updatedAt;delete cleanPayload.updatedBy;delete cleanPayload.seed;delete cleanPayload.sourceOwned;
            next={...cleanPayload,id,tenantId,audience,estado:'borrador',contentVersion:Number(payload.contentVersion||1),workflowVersion:Number(payload.workflowVersion||1),version:1,createdAt:now(),createdBy:who.uid,createdByUserId:who.uid,creador:who.displayName,updatedAt:now(),updatedBy:who.uid};
            action='course.create';toState='borrador';
          }else if(type==='academy.course.update'){
            const patch=clean(payload.patch||{});
            for(const k of ['id','tenantId','version','createdAt','createdBy','createdByUserId','estado','workflowVersion'])delete patch[k];
            next={...current,...patch,id,tenantId,audience:current.audience||audience,contentVersion:Number(current.contentVersion||1)+(payload.contentChange===false?0:1),version:Number(current.version||0)+1,updatedAt:now(),updatedBy:who.uid};
            action='course.update';
          }else{
            const desired=str(payload.state),allowed=COURSE_STATES[current.estado||'borrador']||[];
            if(desired!==current.estado&&!allowed.includes(desired))throw new Error('ACADEMY_STATE_TRANSITION_INVALID');
            const needsReason=['archivado','eliminado','publicado_preview','aprobado'].includes(desired)||(desired==='borrador'&&['archivado','eliminado'].includes(current.estado));
            if(needsReason&&!str(payload.reason))throw new Error('ACADEMY_STATE_REASON_REQUIRED');
            if(desired==='en_revision'){
              if(str(current.createdByUserId||current.createdBy)===who.uid)throw new Error('ACADEMY_REVIEWER_MUST_DIFFER_FROM_CREATOR');
              current.revisadoPor=who.displayName;current.reviewedByUserId=who.uid;
            }
            if(desired==='aprobado'){
              if(str(current.createdByUserId||current.createdBy)===who.uid)throw new Error('ACADEMY_APPROVER_MUST_DIFFER_FROM_CREATOR');
              if(str(current.reviewedByUserId)===who.uid)throw new Error('ACADEMY_APPROVER_MUST_DIFFER_FROM_REVIEWER');
              current.aprobadoPor=who.displayName;current.approvedByUserId=who.uid;
            }
            fromState=current.estado||'borrador';toState=desired;
            next={...current,estado:desired,workflowVersion:Number(current.workflowVersion||1)+1,version:Number(current.version||0)+1,updatedAt:now(),updatedBy:who.uid};
            action='course.state';
          }
          if(current)tx.set(ref,next,{merge:false});else tx.create(ref,next);
          const auditId='aa-'+sha(command.idempotencyKey).slice(0,32),auditRef=audits.doc(auditId);
          const audit=auditRecord(command,who,'academyCourse',id,action,{audience:next.audience,reason:payload.reason,fromState,toState,contentVersion:next.contentVersion,workflowVersion:next.workflowVersion});
          tx.create(auditRef,{id:auditId,...audit});
          tx.set(receipt,{status:'committed',commandDigest:digest,entityType:'academyCourse',entityId:id,entityVersion:next.version,auditId,commandType:type,providerAck:true,actorUid:who.uid,updatedAt:now()});
          tx.create(tenant.collection('entityAuditTrail').doc('academy-'+sha(command.idempotencyKey).slice(0,32)),audit);
          return {entityId:id,entityVersion:next.version,idempotentReplay:false,providerWrites:4,auditId};
        });
      }catch(error){return blocked(command,str(error?.message||error));}
      const rb=await ref.get(),ab=await audits.doc(txResult.auditId).get();
      if(!rb.exists)return blocked(command,'ACADEMY_DURABLE_READBACK_MISSING',{entityId:id});
      const entityReadback={id:rb.id,...clean(rb.data()||{})};
      if(String(entityReadback.version)!==String(txResult.entityVersion))return blocked(command,'ACADEMY_DURABLE_READBACK_VERSION_MISMATCH',{entityId:id,expectedVersion:txResult.entityVersion,observedVersion:entityReadback.version});
      return ack(command,id,{entityType:'academyCourse',entityVersion:txResult.entityVersion,entityReadback,auditReadback:ab.exists?{id:ab.id,...clean(ab.data()||{})}:null,idempotentReplay:txResult.idempotentReplay,providerWrites:txResult.providerWrites});
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:[...allowedTenants],operatorRoles:[...OPERATOR_ROLES],tenantScoped:true,seedMutation:false,hrWrites:false,externalWrites:false,paymentWrites:false};}
  });
}
export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,COURSE_STATES,createAcademyCommandProvider};
