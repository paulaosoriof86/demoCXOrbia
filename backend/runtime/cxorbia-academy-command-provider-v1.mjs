#!/usr/bin/env node
/* CXOrbia — tenant-scoped Academia command provider v1.
   VRM-192: durable custom course/category/workflow/audit authority.
   Seed/base courses remain source-owned and immutable.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';

export const VERSION='cxorbia-academy-command-provider-v1';
export const COMMAND_TYPES=Object.freeze([
  'academy.course.create','academy.course.update','academy.course.state','academy.category.create','academy.progress.lesson.complete'
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

// D08: references are derived from the existing source-owned catalog. Tests
// compare every semantic course revision; this is not an editable second catalog.
const BASE_PROGRESS_CONTRACT=JSON.parse(fs.readFileSync(new URL('../contracts/cxorbia-academy-base-progress-contract-v1.json',import.meta.url),'utf8'));
export function academyProgressCourseContract(course,audience){
  const lessons=arr(course.lessons).filter(l=>!l._deleted);
  const content={id:course.id,audience,contentVersion:Number(course.contentVersion||1),lessons:lessons.map(l=>({id:l.id,tipo:l.tipo||'content',content:l.content||'',quiz:l.quiz||[]})),scope:course.scope||{},cert:course.cert===true};
  return {courseId:course.id,audience,revision:sha(content),scope:course.scope||{},technicalOnly:course.id==='a_backend',lessons:lessons.map(l=>({id:l.id,quiz:arr(l.quiz).map(q=>({options:arr(q.o).length,answer:q.a}))}))};
}
export function academyProgressCatalog(courses=[]){
  return [...BASE_PROGRESS_CONTRACT.courses.map(c=>({...c,origin:'base'})),...arr(courses).map(c=>({...academyProgressCourseContract(c,str(c.audience)),origin:'custom'}))]
    .map(c=>({origin:c.origin,audience:c.audience,courseId:c.courseId,revision:c.revision}));
}
export function academyProgressSnapshot(member,tenantId,uid){
  const empty={schemaVersion:1,tenantId,ownerUid:uid,courses:{}};
  const saved=member?.academyProgress;
  if(!saved||saved.schemaVersion!==1||saved.tenantId!==tenantId||saved.ownerUid!==uid)return empty;
  return {...empty,courses:clean(saved.courses||{})};
}
function learnerMembership(decoded,member,tenantId,projectId){
  const role=str(decoded.role).toLowerCase(),namespace=str(decoded.authNamespace||(role==='shopper'?'shopper':'')).toLowerCase();
  if(!safeId(decoded.uid)||str(decoded.tenantId)!==tenantId||!['super','admin','ops','coordinador','shopper','cliente','client'].includes(role)||!namespace)throw new Error('ACADEMY_LEARNER_DENIED');
  if(role==='shopper'&&namespace!=='shopper'||['super','admin','ops','coordinador'].includes(role)&&namespace!=='staff')throw new Error('ACADEMY_LEARNER_NAMESPACE_DENIED');
  if(!member||member.active===false||str(member.status||'active').toLowerCase()==='inactive'||str(member.tenantId)&&str(member.tenantId)!==tenantId||str(member.role).toLowerCase()!==role||str(member.authNamespace).toLowerCase()!==namespace)throw new Error('ACADEMY_LEARNER_MEMBERSHIP_INVALID');
  if(!safeId(projectId)||role!=='super'&&!arr(member.projectIds).map(str).includes(projectId))throw new Error('ACADEMY_LEARNER_PROJECT_DENIED');
  return {uid:decoded.uid,role,namespace,country:str(decoded.country||member.country||member.pais),displayName:str(decoded.name||member.name||member.displayName||decoded.uid)};
}
function courseLearnerAllowed(course,who,command){
  const audience=who.role==='shopper'?'shopper':['cliente','client'].includes(who.role)?'cliente':'admin';
  if(!OPERATOR_ROLES.includes(who.role)&&course.audience!==audience)return false;
  if(course.technicalOnly&&who.role!=='super')return false;
  const scope=course.scope||{},axis=(list,value)=>!arr(list).length||list.includes(value);
  return axis(scope.tenantId,command.tenantId)&&axis(scope.projectId,command.projectId)&&axis(scope.rol,who.role)&&axis(scope.pais,who.country);
}
async function completeOwnAcademyLesson({auth,db,token,command}){
  const p=command.payload||{},tenantId=str(command.tenantId),projectId=str(command.projectId);
  const allowed=['origin','audience','courseId','revision','lessonId','answers'];
  if(!p||Array.isArray(p)||Object.keys(p).some(k=>!allowed.includes(k))||!['base','custom'].includes(p.origin)||!safeId(p.courseId)||!safeId(p.lessonId)||!['admin','shopper','cliente'].includes(p.audience)||!/^[a-f0-9]{64}$/.test(str(p.revision))||command.entityType!=='academyProgress'||command.entityId!==p.courseId||!Number.isInteger(command.expectedVersion)||command.expectedVersion<0)return blocked(command,'ACADEMY_PROGRESS_REFERENCE_INVALID');
  let decoded;try{decoded=await auth.verifyIdToken(token,true);}catch{return blocked(command,'ACADEMY_LEARNER_AUTH_FAILED');}
  const tenant=db.collection('tenants').doc(tenantId),memberRef=tenant.collection('users').doc(str(decoded.uid));
  const key=sha([p.origin,p.audience,p.courseId,p.revision]);
  const receiptKey='academy-progress-'+sha([decoded.uid,command.idempotencyKey]).slice(0,40),receipt=tenant.collection('commandReceipts').doc(receiptKey);
  const digest=sha({actorUid:decoded.uid,tenantId,commandType:command.commandType,payload:clean(p)});
  const auditRef=tenant.collection('academyAudit').doc(receiptKey);
  let result;
  try{
    result=await db.runTransaction(async tx=>{
      const [memberSnap,prior]=await Promise.all([tx.get(memberRef),tx.get(receipt)]);
      const member=memberSnap.exists?memberSnap.data():null,who=learnerMembership(decoded,member,tenantId,projectId);
      let course;
      if(p.origin==='base')course=BASE_PROGRESS_CONTRACT.courses.find(c=>c.audience===p.audience&&c.courseId===p.courseId);
      else{
        const cs=await tx.get(tenant.collection('academyCourses').doc(p.courseId)),c=cs.exists?cs.data():null;
        if(!c||c.tenantId!==tenantId||c.audience!==p.audience||c.estado!=='publicado_preview')throw new Error('ACADEMY_PROGRESS_COURSE_NOT_PUBLISHED');
        course=academyProgressCourseContract({...c,id:p.courseId},p.audience);
      }
      if(!course||!courseLearnerAllowed(course,who,command))throw new Error('ACADEMY_PROGRESS_COURSE_DENIED');
      if(course.revision!==p.revision)throw new Error('ACADEMY_PROGRESS_REVISION_CONFLICT');
      const lesson=course.lessons.find(l=>l.id===p.lessonId);
      if(!lesson)throw new Error('ACADEMY_PROGRESS_LESSON_UNKNOWN');
      const answers=arr(p.answers);
      if(answers.length!==lesson.quiz.length||answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=lesson.quiz[i].options))throw new Error('ACADEMY_PROGRESS_QUIZ_REVIEW_REQUIRED');
      if(member.academyProgress&&(member.academyProgress.ownerUid!==who.uid||member.academyProgress.tenantId!==tenantId))throw new Error('ACADEMY_PROGRESS_OWNER_CONFLICT');
      const state=academyProgressSnapshot(member,tenantId,who.uid),current=state.courses[key]||null;
      if(prior.exists){
        const old=prior.data();if(old.commandDigest!==digest||old.actorUid!==who.uid)throw new Error('ACADEMY_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
        if(!current||!current.lessons?.[p.lessonId])throw new Error('ACADEMY_PROGRESS_RECEIPT_STATE_MISMATCH');
        return {key,ownerUid:who.uid,version:current.version,providerWrites:0,idempotentReplay:true};
      }
      if(current?.lessons?.[p.lessonId]>=100)return {key,ownerUid:who.uid,version:current.version,providerWrites:0,idempotentReplay:true};
      if(Number(current?.version||0)!==command.expectedVersion)throw new Error('ACADEMY_PROGRESS_VERSION_CONFLICT');
      const lessons={...(current?.lessons||{}),[p.lessonId]:100};
      const completed=course.lessons.length>0&&course.lessons.every(l=>lessons[l.id]>=100);
      const next={origin:p.origin,audience:p.audience,courseId:p.courseId,revision:p.revision,version:Number(current?.version||0)+1,lessons,completed,updatedAt:now()};
      state.courses[key]=next;
      if(Object.keys(state.courses).length>300||Buffer.byteLength(JSON.stringify(state),'utf8')>400000)throw new Error('ACADEMY_PROGRESS_HISTORY_CAPACITY');
      const audit=auditRecord(command,who,'academyProgress',p.courseId,'lesson.complete',{audience:p.audience});
      tx.set(memberRef,{academyProgress:state},{merge:true});
      tx.create(auditRef,{...audit,lessonId:p.lessonId,courseRevision:p.revision,progressVersion:next.version});
      tx.set(receipt,{status:'committed',commandDigest:digest,actorUid:who.uid,entityType:'academyProgress',entityId:p.courseId,progressKey:key,entityVersion:next.version,commandType:command.commandType,providerAck:true,updatedAt:now()});
      tx.create(tenant.collection('entityAuditTrail').doc(receiptKey),audit);
      return {key,ownerUid:who.uid,version:next.version,providerWrites:4,idempotentReplay:false};
    });
  }catch(error){return blocked(command,str(error?.message||error));}
  try{
    const rb=await memberRef.get(),state=academyProgressSnapshot(rb.data(),tenantId,result.ownerUid),row=state.courses[key];
    if(!row||row.version<result.version||row.lessons?.[p.lessonId]!==100)throw new Error('ACADEMY_PROGRESS_READBACK_MISMATCH');
    return ack(command,p.courseId,{entityType:'academyProgress',entityVersion:row.version,entityReadback:{ownerUid:result.ownerUid,tenantId,progressKey:key,progress:row},providerWrites:result.providerWrites,idempotentReplay:result.idempotentReplay});
  }catch(error){return blocked(command,str(error?.message||error),{committed:true,providerAck:true,providerWrites:result.providerWrites,receiptPath:receipt.path});}
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
      if(type==='academy.progress.lesson.complete')return completeOwnAcademyLesson({auth,db,token,command});
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
