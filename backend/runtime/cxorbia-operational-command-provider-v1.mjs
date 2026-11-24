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
  'application.create','application.status.update','application.delete','reservation.create','reservation.status.update','reservation.delete',
  'visit.assign','visit.reassign','visit.state.update','visit.reschedule','visit.cancel','visit.questionnaire.submit','visit.checkin.evidence','resource.read.receipt','visit.sync.confirm',
  'support.ticket.create','support.ticket.update','client.nps.submit','client.note.create','client.meeting.request'
]);
export const OPERATOR_ROLES=Object.freeze(['super','admin','ops','coordinador']);
export const APPLICATION_STATES=Object.freeze(['pendiente','aprobada','rechazada','standby','cancelada']);
export const RESERVATION_STATES=Object.freeze(['solicitada','asignada','aprobada','rechazada','cruzada','cancelada']);
const CLIENT_COLLABORATION=Object.freeze({
  'client.nps.submit':{entityType:'clientNps',kind:'nps',fields:['score','comment']},
  'client.note.create':{entityType:'clientNote',kind:'note',fields:['subject','detail']},
  'client.meeting.request':{entityType:'clientMeeting',kind:'meeting',fields:['subject','date','time','mode']}
});

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const versionOf=data=>data?.version??data?.updatedAt??data?.lastSyncedAt??'source-current';
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${command.idempotencyKey}`).slice(0,40);
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
  if(!str(command.tenantId)||!str(command.projectId)||!str(command.periodId))errors.push('scope');
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
  const clientCollaboration=!!CLIENT_COLLABORATION[command.commandType];
  if(clientCollaboration){if(!['cliente','client'].includes(role)||str(decoded.authNamespace)!=='staff')throw new Error('OPS_CLIENT_SELF_ONLY');}
  else if(!OPERATOR_ROLES.includes(role)&&role!=='shopper')throw new Error('OPS_ACTOR_ROLE_DENIED');
  if(role==='shopper'&&namespace!=='shopper')throw new Error('OPS_ACTOR_NAMESPACE_DENIED');
  if(OPERATOR_ROLES.includes(role)&&namespace!=='staff')throw new Error('OPS_ACTOR_NAMESPACE_DENIED');
  const tokenProjects=arr(decoded.projectIds).map(str);
  if(role!=='super'&&!tokenProjects.includes(str(command.projectId)))throw new Error('OPS_ACTOR_PROJECT_DENIED');
  const member=await db.collection('tenants').doc(command.tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('OPS_ACTOR_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  const active=clientCollaboration?(m.active!==false&&(m.active===true||m.status==='active')&&!['inactive','disabled','deleted','revoked'].includes(str(m.status))):m.active===true;
  if(!active||str(m.tenantId)!==str(command.tenantId)||str(m.role)!==role||str(m.authNamespace)!==namespace)throw new Error('OPS_ACTOR_MEMBERSHIP_INVALID');
  const memberProjects=arr(m.projectIds).map(str);
  if(role!=='super'&&!memberProjects.includes(str(command.projectId)))throw new Error('OPS_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  const rawShopperId=role==='shopper'?str(decoded.shopperId||m.shopperId):null;
  if(role==='shopper'&&!rawShopperId)throw new Error('OPS_ACTOR_SHOPPER_ID_MISSING');
  let shopperId=rawShopperId;
  if(role==='shopper'){
    const cross=await db.collection('tenants').doc(command.tenantId).collection('shopperIdentityCrosswalk').doc(rawShopperId).get();
    if(cross.exists){
      const row=cross.data()||{},canonical=str(row.shopperId||row.canonicalShopperId);
      if(str(row.tenantId||command.tenantId)!==str(command.tenantId))throw new Error('OPS_ACTOR_IDENTITY_CROSSWALK_TENANT_CONFLICT');
      if(canonical)shopperId=canonical;
    }
  }
  return {uid:decoded.uid,role,namespace,tenantId:command.tenantId,projectId:command.projectId,shopperId,rawShopperId};
}

function validateClientCollaboration(command){
  const spec=CLIENT_COLLABORATION[command.commandType],p=command.payload||{};
  if(!spec)return;
  if(command.entityType!==spec.entityType||command.entityId||command.expectedVersion!=='absent'||command.authorization?.permission!==command.commandType)throw new Error('OPS_CLIENT_CONTRACT_INVALID');
  if(Object.keys(p).some(k=>!['periodId','clientRequestId',...spec.fields].includes(k)))throw new Error('OPS_CLIENT_PAYLOAD_FIELD_DENIED');
  if(str(p.periodId)!==str(command.periodId)||![command.tenantId,command.projectId,command.periodId].every(v=>typeof v==='string'&&v.length<=160&&!/[\/\x00-\x1f]/.test(v)))throw new Error('OPS_CLIENT_SCOPE_INVALID');
  if(typeof p.clientRequestId!=='string'||!/^[a-zA-Z0-9_-]{8,128}$/.test(p.clientRequestId)||str(command.idempotencyKey).length>300)throw new Error('OPS_CLIENT_REQUEST_ID_REQUIRED');
  const text=(key,max,required=false)=>{if((p[key]!==undefined&&typeof p[key]!=='string')||(required&&!str(p[key]))||str(p[key]).length>max)throw new Error('OPS_CLIENT_'+key.toUpperCase()+'_INVALID');};
  if(spec.kind==='nps'){if(!Number.isInteger(p.score)||p.score<0||p.score>10)throw new Error('OPS_CLIENT_NPS_INVALID');text('comment',4000);}
  else{text('subject',240,true);if(spec.kind==='note')text('detail',12000,true);}
  if(spec.kind==='meeting'){
    if(typeof p.date!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(p.date)||!Number.isFinite(Date.parse(p.date+'T00:00:00Z'))||new Date(p.date+'T00:00:00Z').toISOString().slice(0,10)!==p.date)throw new Error('OPS_CLIENT_MEETING_DATE_INVALID');
    if(typeof p.time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time)||!['Videollamada (Meet/Teams)','Presencial','Telefónica'].includes(p.mode))throw new Error('OPS_CLIENT_MEETING_DETAILS_INVALID');
  }
}

async function clientCollaborationContext(tx,r,command,actor,hrSnapshot,hrRevision){
  const member=await tx.get(r.tenant.collection('users').doc(actor.uid)),m=member.exists?member.data():null;
  if(!m||m.active===false||!(m.active===true||m.status==='active')||['inactive','disabled','deleted','revoked'].includes(str(m.status))||str(m.tenantId)!==command.tenantId||str(m.role)!==actor.role||str(m.authNamespace)!=='staff'||!arr(m.projectIds).includes(command.projectId))throw new Error('OPS_CLIENT_MEMBERSHIP_REVOKED');
  const project=await tx.get(r.project),pr=project.exists?project.data():null;
  const disabled=x=>x.active===false||['status','state'].some(k=>['inactive','deleted','archived','closed','inactivo','cerrado','archivado'].includes(str(x[k]).toLowerCase()));
  if(!pr||str(pr.tenantId)!==command.tenantId||disabled(pr))throw new Error('OPS_CLIENT_PROJECT_PERIOD_DENIED');
  const ids=[command.periodId],prefix=command.projectId+'-';
  if(command.periodId.startsWith(prefix)&&command.periodId.length>prefix.length)ids.push(command.periodId.slice(prefix.length));
  const periods=[];for(const id of ids){const doc=await tx.get(r.project.collection('periods').doc(id));if(doc.exists)periods.push(doc.data());}
  if(periods.length>1||periods.some(pe=>(pe.tenantId!==undefined&&str(pe.tenantId)!==command.tenantId)||(pe.projectId!==undefined&&str(pe.projectId)!==command.projectId)||disabled(pe)))throw new Error('OPS_CLIENT_PROJECT_PERIOD_DENIED');
  if(!periods.length){
    // HR owns operational periods. Firestore metadata is optional; an explicit
    // internal project or a closed metadata alias never inherits HR authority.
    const mode=str(pr.operationalSource?.mode||pr.routeSource?.mode||pr.routeSource);
    if((mode&&mode!=='external')||hrSnapshot?.sourceSafe!==true||hrSnapshot.imported!==false||!/^[a-f0-9]{64}$/.test(str(hrRevision))||
      str(hrSnapshot.tenantId||hrSnapshot.tenantConfig?.tenantId)!==command.tenantId||str(hrSnapshot.projectId||hrSnapshot.projectConfig?.projectId)!==command.projectId)throw new Error('OPS_CLIENT_PERIOD_AUTHORITY_REQUIRED');
    const matches=arr(hrSnapshot.periods).filter(pe=>str(pe.id||pe.periodId||command.projectId+'-'+str(pe.key))===command.periodId);
    if(matches.length!==1||matches.some(pe=>(pe.tenantId!==undefined&&str(pe.tenantId)!==command.tenantId)||(pe.projectId!==undefined&&str(pe.projectId)!==command.projectId)||disabled(pe)))throw new Error('OPS_CLIENT_PROJECT_PERIOD_DENIED');
  }
  return {member:m,project:pr};
}

async function verifyClientCollaborationReadback(db,command,actor,result){
  const r=refs(db,command);
  try{
    const [entity,receipt]=await Promise.all([r.bulletins.doc(result.entityId).get(),r.receipt.get()]);
    const row=entity.exists?entity.data():null,proof=receipt.exists?receipt.data():null;
    if(!row||!proof||row.entityType!=='client_collaboration'||row.kind!==CLIENT_COLLABORATION[command.commandType].kind||row.requesterUid!==actor.uid||row.tenantId!==command.tenantId||row.projectId!==command.projectId||row.periodId!==command.periodId||row.idempotencyKey!==command.idempotencyKey||row.version!==1||JSON.stringify(row.targetUserIds)!==JSON.stringify([actor.uid])||row.targetAll===true||arr(row.targetProjectIds).length||proof.actorUid!==actor.uid||proof.entityId!==result.entityId||proof.commandDigest!==sha(clean(command))||proof.status!=='committed')throw new Error('OPS_CLIENT_READBACK_SCOPE_MISMATCH');
    return {...result,readbackVerified:true,actorUid:actor.uid};
  }catch(error){return blocked(command,'OPS_CLIENT_READBACK_PENDING',{mutationCommitted:true,providerWrites:result.providerWrites,entityId:result.entityId,actorUid:actor.uid,idempotentReplay:result.idempotentReplay===true,error:str(error?.message||error)});}
}

function refs(db,command){
  const tenant=db.collection('tenants').doc(command.tenantId),project=tenant.collection('projects').doc(command.projectId);
  return {
    tenant,project,visits:project.collection('visits'),applications:project.collection('postulations'),reservations:project.collection('reservations'),
    visitEvidence:project.collection('visitEvidence'),resourceReadReceipts:project.collection('resourceReadReceipts'),resources:tenant.collection('resources'),bulletins:tenant.collection('bulletins'),
    receipt:tenant.collection('commandReceipts').doc(receiptId(command)),
    audit:tenant.collection('entityAuditTrail').doc(CLIENT_COLLABORATION[command.commandType]?'client-'+receiptId(command):auditId(command)),
    review:tenant.collection('reviewQueue').doc('ops-'+auditId(command))
  };
}
function ack(command,entityId,extra={}){return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,commandType:command.commandType,entityType:command.entityType,entityId:entityId||command.entityId||null,idempotencyKey:command.idempotencyKey,...extra};}
function blocked(command,code,extra={}){return {ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null,commandType:command?.commandType||null,entityId:command?.entityId||null,code,...(command?.commandType==='visit.sync.confirm'?{hrProviderAck:false,hrReflectionVerified:false}:{}),...extra};}
function assertVersion(command,data){
  if(command.expectedVersion==='absent'||command.expectedVersion==='source-current')return;
  if(str(command.expectedVersion)!==str(versionOf(data)))throw new Error('OPS_EXPECTED_VERSION_CONFLICT');
}
function visitCountry(v){const x=str(v?.countryCode||v?.pais||v?.country).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();return ({GUATEMALA:'GT',HONDURAS:'HN'})[x]||x;}
function isExcelVisit(v){return /^[a-f0-9]{64}$/.test(str(v?.excelWorksheetFingerprint));}
async function resolveVisitDocument(tx,visits,visitId,hrRowId,{command={},snapshot=null}={}){
  const logical=str(visitId),row=str(hrRowId),keys=[...new Set([logical,row].filter(Boolean))];
  if(!keys.length)throw new Error('OPS_VISIT_ID_REQUIRED');
  const trusted=snapshot?.sourceSafe===true&&snapshot?.imported!==true&&Number(snapshot?.firestoreWrites||0)===0&&str(snapshot.tenantId)===str(command.tenantId)&&str(snapshot.projectId)===str(command.projectId);
  const sourceRows=trusted?arr(snapshot.visits).filter(v=>(!row||str(v?.hrRowId)===row)&&visitPeriodId(v,snapshot)===str(command.periodId)&&[str(v?.visitId),str(v?.id),...arr(v?.durableAliasIds).map(str)].includes(logical)):[];
  if(sourceRows.length>1)throw new Error('OPS_VISIT_HR_IDENTITY_NOT_UNIQUE');
  const hr=sourceRows[0]||null;
  for(const key of keys){
    const ref=visits.doc(key),snap=await tx.get(ref);
    if(!snap.exists)continue;
    const data=snap.data()||{},durableHrRow=str(data.hrRowId),explicitAlias=[str(data.id),str(data.visitId)].includes(logical);
    if(row&&durableHrRow&&durableHrRow!==row)throw new Error('OPS_VISIT_HR_ROW_MISMATCH');
    if((str(data.tenantId)&&str(command.tenantId)&&str(data.tenantId)!==str(command.tenantId))||
       (str(data.rootProjectId||data.projectId)&&str(command.projectId)&&str(data.rootProjectId||data.projectId)!==str(command.projectId))||
       (hr&&visitCountry(hr)&&visitCountry(data)&&visitCountry(hr)!==visitCountry(data))||
       (visitCountry(command.payload)&&visitCountry(data)&&visitCountry(command.payload)!==visitCountry(data)))throw new Error('OPS_VISIT_IDENTITY_SCOPE_MISMATCH');
    if(str(data.periodId)&&str(command.periodId)&&str(data.periodId)!==str(command.periodId))throw new Error('OPS_PERIOD_MISMATCH');
    if(key!==logical&&!explicitAlias){
      if(!hr||(isExcelVisit(hr)&&(!visitCountry(data)||visitCountry(data)!==visitCountry(hr))))throw new Error('OPS_VISIT_UNPROVEN_ROW_ALIAS');
      const allowed=new Set([logical,row,...arr(hr.durableAliasIds).map(str)]);
      if([data.id,data.visitId].filter(Boolean).some(id=>!allowed.has(str(id))))throw new Error('OPS_VISIT_UNPROVEN_ROW_ALIAS');
    }
    return {ref,snap,data,durableVisitId:key,logicalVisitId:logical||key};
  }
  throw new Error('OPS_VISIT_MISSING');
}
/* A local assignment or caller-supplied HR value is never evidence of an
   external reflection. The server injects this snapshot/revision after a fresh
   read; this proof certifies that observation, not a remote HR write. */
async function syncReflectionContext(tx,r,command,actor,snapshot,revision){
  if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_SYNC_CONFIRM_OPERATOR_ONLY');
  if(command.entityType!=='visit'||command.authorization?.permission!=='visit.sync.confirm')throw new Error('OPS_SYNC_CONFIRM_CONTRACT_INVALID');
  if(snapshot?.sourceSafe!==true||snapshot?.imported!==false||Number(snapshot?.firestoreWrites||0)!==0||
    !/^[a-f0-9]{64}$/.test(str(revision))||str(snapshot.tenantId)!==command.tenantId||str(snapshot.projectId)!==command.projectId||
    (snapshot._runtime?.revision!==undefined&&snapshot._runtime.revision!==revision))throw new Error('OPS_SYNC_CONFIRM_INDEPENDENT_HR_REQUIRED');
  const payload=command.payload||{},hrRowId=str(payload.hrRowId),visitId=str(payload.visitId||command.entityId);
  if(!hrRowId||!visitId)throw new Error('OPS_SYNC_CONFIRM_EXACT_IDENTITY_REQUIRED');
  const matches=arr(snapshot.visits).filter(row=>str(row?.hrRowId)===hrRowId&&visitPeriodId(row,snapshot)===command.periodId&&(visitId===hrRowId||[str(row?.id),str(row?.visitId),...arr(row?.durableAliasIds).map(str)].includes(visitId)));
  if(matches.length!==1)throw new Error('OPS_SYNC_CONFIRM_HR_ROW_NOT_UNIQUE');
  const hr=matches[0],hrVisitId=str(hr.id||hr.visitId),periodKey=str(hr.periodKey);
  if(!hrVisitId||str(hr.tenantId)!==command.tenantId||str(hr.projectId)!==command.projectId||
    (hr.visitId!==undefined&&![hrVisitId,hrRowId].includes(str(hr.visitId))))throw new Error('OPS_SYNC_CONFIRM_HR_SCOPE_MISMATCH');
  const periods=arr(snapshot.periods).filter(period=>periodKey&&str(period.key||period.periodKey)===periodKey);
  if(periods.length!==1)throw new Error('OPS_SYNC_CONFIRM_HR_PERIOD_NOT_UNIQUE');
  const period=periods[0],periodId=str(period.id||period.periodId);
  if(!periodId||periodId!==command.periodId||str(period.projectId)!==command.projectId||
    (period.tenantId!==undefined&&str(period.tenantId)!==command.tenantId)||
    (period.id&&period.periodId&&str(period.id)!==str(period.periodId))||
    ['periodId','measurementPeriodId','measurementWindowProjectId'].some(k=>hr[k]!==undefined&&str(hr[k])!==periodId))throw new Error('OPS_SYNC_CONFIRM_HR_PERIOD_MISMATCH');
  const resolved=await resolveVisitDocument(tx,r.visits,visitId,hrRowId,{command,snapshot}),v=resolved.data,aliases=new Set([hrVisitId,hrRowId]);
  const present=[command.entityId,payload.visitId,payload.visitaId,payload.entityId,payload.durableVisitId,payload.hrVisitId,v.id,v.visitId,resolved.durableVisitId].filter(x=>x!==undefined&&x!==null);
  if(present.some(x=>!aliases.has(str(x)))||str(v.hrRowId)!==hrRowId||str(v.tenantId)!==command.tenantId||str(v.projectId)!==command.projectId||str(v.periodId)!==periodId||
    (v.periodKey!==undefined&&str(v.periodKey)!==periodKey))throw new Error('OPS_SYNC_CONFIRM_IDENTITY_SCOPE_MISMATCH');
  const shopperId=str(hr.shopperId);
  if(!shopperId||str(v.shopperId)!==shopperId||['hrShopperId','shopperId'].some(k=>payload[k]!==undefined&&str(payload[k])!==shopperId))throw new Error('OPS_SYNC_CONFIRM_HR_ASSIGNMENT_NOT_REFLECTED');
  return {resolved,identity:{tenantId:command.tenantId,projectId:command.projectId,periodId,hrRowId,hrVisitId,durableVisitId:resolved.durableVisitId,shopperId}};
}
function validateSyncReflectionReplay(prior,context,command,actor,digest){
  const proof=prior.hrReflection,v=context.resolved.data;
  if(prior.actorUid!==actor.uid)throw new Error('OPS_SYNC_CONFIRM_RECEIPT_ACTOR_DENIED');
  if(prior.providerAck!==true||prior.hrProviderAck!==false||!proof||proof.schemaVersion!=='cxorbia.hr-assignment-reflection.v1'||proof.hrProviderAck!==false||
    proof.proofScope!=='INDEPENDENT_HR_ASSIGNMENT_REFLECTION_ONLY'||!/^[a-f0-9]{64}$/.test(str(proof.sourceRevision))||
    !Number.isFinite(Date.parse(proof.verifiedAt||''))||proof.actorUid!==actor.uid||proof.commandDigest!==digest||proof.idempotencyKey!==command.idempotencyKey||
    Object.entries(context.identity).some(([k,value])=>proof[k]!==value)||prior.commandType!==command.commandType||
    prior.entityId!==str(command.payload?.visitId||command.entityId)||!Number.isSafeInteger(proof.previousVersion)||proof.previousVersion<0||
    str(command.expectedVersion)!==str(proof.previousVersion)||proof.committedVersion!==proof.previousVersion+1||
    !Number.isSafeInteger(v.version)||v.version<proof.committedVersion||v.assignmentSyncStatus!=='synced'||!v.hrReflection||sha(v.hrReflection)!==sha(proof))throw new Error('OPS_SYNC_CONFIRM_REPLAY_PROOF_REQUIRED');
  return proof;
}
function assertPeriod(command,data){if(str(data?.periodId)!==str(command.periodId))throw new Error('OPS_PERIOD_SCOPE_MISMATCH');}
function isAvailable(v){const state=str(v?.estado||v?.status).toLowerCase();return ['disponible','available'].includes(state)&&!str(v?.shopperId);}
function branchKey(v){return (str(v?.sucursal||v?.branchName||v?.branchId)+'|'+str(v?.ciudad||v?.city)).toLowerCase().replace(/\s+/g,'-');}
function reservationFutureEligible(v,projectData={}){
  const mode=str(projectData?.reservationWindowMode||projectData?.reservationPolicy?.windowMode||'future_only').toLowerCase();
  if(mode==='all_available')return true;
  const timezone=str(projectData?.timeZone||projectData?.timezone||'America/Guatemala'),today=tenantDateKey(timezone),month=today.slice(0,7);
  const periodKey=str(v?.periodKey||v?.measurementPeriodId||v?.periodo),availableFrom=str(v?.disponibleDesde||v?.availableFrom);
  return (/^20\d{2}-[01]\d$/.test(periodKey)&&periodKey>month)||(/^20\d{2}-[01]\d-[0-3]\d$/.test(availableFrom)&&availableFrom>today);
}
function tenantDateKey(timezone='America/Guatemala'){
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
/* Recovery I3 B3: date windows derive from the exact visit, not global project literals. */
export function validateVisitDateWindow(v,date,{timezone='America/Guatemala',nowDate=null}={}){
  const value=str(date);
  if(!/^20\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(value))throw new Error('OPS_SCHEDULE_DATE_REQUIRED');
  const actual=new Date(value+'T00:00:00Z');
  if(!Number.isFinite(actual.getTime())||actual.toISOString().slice(0,10)!==value)throw new Error('OPS_SCHEDULE_INVALID_CALENDAR_DATE');
  const period=str(v?.periodKey||v?.measurementPeriodId||v?.periodo||v?.periodId).match(/20\d{2}-(?:0[1-9]|1[0-2])/);
  const q=str(v?.quincena||v?.executionCut).toUpperCase();
  if(period&&value.slice(0,7)!==period[0])throw new Error('OPS_SCHEDULE_MONTH_MISMATCH');
  if(/^(1Q|Q1|QUINCENA\s*1|PRIMERA QUINCENA)$/.test(q)&&Number(value.slice(8,10))>15)throw new Error('OPS_SCHEDULE_QUINCENA_RANGE');
  if(/^(2Q|Q2|QUINCENA\s*2|SEGUNDA QUINCENA)$/.test(q)&&Number(value.slice(8,10))<16)throw new Error('OPS_SCHEDULE_QUINCENA_RANGE');
  const code=str(v?.franjaCode||v?.franja).toUpperCase(),weekend=[0,6].includes(actual.getUTCDay());
  if((code==='WK'||code==='SEMANA'||code==='ENTRE SEMANA')&&weekend)throw new Error('OPS_SCHEDULE_WEEKDAY_REQUIRED');
  if((code==='WKND'||code==='FIN DE SEMANA'||code==='WEEKEND')&&!weekend)throw new Error('OPS_SCHEDULE_WEEKEND_REQUIRED');
  const min=[str(nowDate||tenantDateKey(timezone)),str(v?.disponibleDesde||v?.availableFrom).slice(0,10)].filter(Boolean).sort().at(-1);
  if(min&&value<min)throw new Error('OPS_SCHEDULE_DATE_BEFORE_ALLOWED');
  return value;
}
/* I3 B7 exact cancellation decisions are source-scoped and fail closed.
   External HR retains operational ownership until its own ACK/revision; no synthetic availability. */
export function planVisitCancelDecision(visit,{decision,reason,actorUid,sourceMode='external',at=now()}={}){
  const pending=visit?.cancelRequest;
  if(str(pending?.status)!=='pending_review')throw new Error('OPS_CANCEL_REQUEST_NOT_PENDING');
  const outcome=str(decision).toLowerCase();
  if(!['approved','rejected'].includes(outcome))throw new Error('OPS_CANCEL_DECISION_INVALID');
  if(!str(reason))throw new Error('OPS_CANCEL_DECISION_REASON_REQUIRED');
  if(!str(actorUid))throw new Error('OPS_CANCEL_DECISION_ACTOR_REQUIRED');
  const internal=str(sourceMode).toLowerCase()==='internal', approved=outcome==='approved';
  const status=approved?(internal?'approved':'approved_pending_hr'):'rejected';
  const patch={
    cancelRequest:{...pending,status,decisionReason:str(reason),decidedBy:str(actorUid),decidedAt:at},
    updatedAt:at,version:Number(visit.version||0)+1
  };
  if(approved&&internal){
    Object.assign(patch,{estado:'cancelada',status:'cancelada',cancelled:true,cancelReason:pending.reason||str(reason),
      canonicalFacets:{...(visit.canonicalFacets||{}),available:false,assigned:false,scheduled:false,cancelled:true}});
  }
  return patch;
}
function visitRouteMode(project={}){
  const route=project.operationalSource||project.routeSource||{};
  const mode=str(typeof route==='string'?route:route.mode||route.sourceType||route.authority).toLowerCase();
  return mode==='internal'?'internal':'external';
}
function assertSchedulableDate(v,date,timezone){
  const facets=canonicalFacets(v);
  if(facets.realized===true||facets.questionnaire===true||facets.submitted===true||facets.liquidationConfirmed===true||facets.paymentConfirmed===true||facets.cancelled===true)throw new Error('OPS_VISIT_NOT_SCHEDULABLE');
  return validateVisitDateWindow(v,date,{timezone});
}
function projectScope(snapshot){
  return {
    tenantId:str(snapshot?.tenantId||snapshot?.tenantConfig?.tenantId),
    projectId:str(snapshot?.projectId||snapshot?.projectConfig?.projectId)
  };
}
function sourceCoord(v){const t=str(v?.sourceTab),r=str(v?.sourceRow);return t&&r?`${t}::${r}`:'';}
function stableVisitId(v){if(isExcelVisit(v))return str(v?.visitId||v?.id);return str(v?.hrRowId)||sourceCoord(v)||str(v?.visitId||v?.id);}
function visitPeriodId(v,snapshot){
  const explicit=str(v?.periodId||v?.measurementPeriodId||v?.measurementWindowProjectId);
  if(explicit)return explicit;
  const periodKey=str(v?.periodKey);
  if(periodKey){
    const period=arr(snapshot?.periods).find(p=>str(p?.key||p?.periodKey)===periodKey);
    const canonical=str(period?.periodId||period?.id);
    if(canonical)return canonical;
    const rootProjectId=str(period?.rootProjectId||snapshot?.projectId||snapshot?.projectConfig?.projectId||period?.projectId);
    if(rootProjectId)return `${rootProjectId}-${periodKey}`;
  }
  return str(snapshot?.currentPeriodId);
}
function canonicalFacets(v){
  const f=v?.canonicalFacets||{};
  const state=str(v?.estado||v?.status||v?.presentationState).toLowerCase();
  const assigned=typeof f.assigned==='boolean'?f.assigned:!!str(v?.shopperId);
  const available=typeof f.available==='boolean'?f.available:state==='disponible';
  return clean({...f,assigned,available:available&&!assigned,eligibilityBlocked:typeof f.eligibilityBlocked==='boolean'?f.eligibilityBlocked:(!available||assigned)});
}
function visitCandidate(row,scope,snapshot){
  const visitId=stableVisitId(row),periodId=visitPeriodId(row,snapshot);
  if(!visitId||!periodId)return null;
  const shopperId=str(row?.shopperId);
  const patch=clean({
    ...row,
    id:visitId,
    visitId,
    tenantId:scope.tenantId,
    projectId:scope.projectId,
    periodId,
    rootProjectId:scope.projectId,
    hrRowId:str(row?.hrRowId)||null,
    sourceTab:str(row?.sourceTab)||null,
    sourceRow:str(row?.sourceRow)||null,
    sourceCoord:sourceCoord(row)||null,
    shopperId:shopperId||null,
    assignmentSource:shopperId?'hr':null,
    assignmentSyncStatus:shopperId?'synced':null,
    canonicalFacets:canonicalFacets(row),
    hrManaged:clean({...row}),
    hrSourceRevision:str(snapshot?.sourceRevision||snapshot?._runtime?.revision||'')||null
  });
  return patch;
}
export function visitsFromSnapshot(snapshot={}){
  if(snapshot?.sourceSafe!==true||snapshot?.imported===true||Number(snapshot?.firestoreWrites||0)!==0)throw new Error('OPS_HR_SNAPSHOT_UNSAFE');
  const scope=projectScope(snapshot);
  if(!scope.tenantId||!scope.projectId)throw new Error('OPS_HR_SCOPE_MISSING');
  const byId=new Map();
  for(const row of arr(snapshot.visits)){
    const candidate=visitCandidate(row,scope,snapshot);
    if(!candidate)continue;
    if(byId.has(candidate.visitId))throw new Error('OPS_HR_DUPLICATE_VISIT_STABLE_KEY');
    byId.set(candidate.visitId,candidate);
  }
  return {scope,visits:[...byId.values()].sort((a,b)=>a.visitId.localeCompare(b.visitId))};
}
function durableVisitReviewRef(db,tenantId,visitId){
  return db.collection('tenants').doc(tenantId).collection('reviewQueue').doc(`ops-visit-reconcile-${sha(visitId).slice(0,28)}`);
}
async function reconcileVisitDoc({db,policy,candidate,sourceRevision}){
  const tenantId=str(candidate.tenantId),projectId=str(candidate.projectId),visitId=str(candidate.visitId);
  if(!tenantId||!projectId||!visitId||!str(sourceRevision))throw new Error('OPS_VISIT_RECONCILIATION_KEYS_REQUIRED');
  const commandScope={tenantId,projectId};
  if(!scopeAllowed(policy,commandScope))throw new Error('OPS_VISIT_RECONCILIATION_SCOPE_DENIED');
  const visitRef=db.collection('tenants').doc(tenantId).collection('projects').doc(projectId).collection('visits').doc(visitId);
  const reviewRef=durableVisitReviewRef(db,tenantId,visitId);
  return db.runTransaction(async tx=>{
    const snap=await tx.get(visitRef);
    if(!snap.exists){
      tx.create(visitRef,{...candidate,hrSourceRevision:sourceRevision,createdAt:now(),updatedAt:now(),version:1});
      return {providerWrites:1,created:true,idempotentReplay:false};
    }
    const existing=snap.data()||{};
    const excel=isExcelVisit(candidate),existingStableVisitKey=excel?visitId:(str(existing.hrRowId)||sourceCoord(existing)||str(existing.visitId||existing.id||visitId));
    const aliases=new Set([visitId,str(candidate.hrRowId),str(existing.hrRowId),...arr(candidate.durableAliasIds).map(str)]);
    if(str(existing.tenantId||tenantId)!==tenantId||str(existing.projectId||projectId)!==projectId||existingStableVisitKey!==visitId||
       (excel&&((str(existing.periodId)&&str(existing.periodId)!==str(candidate.periodId))||
       (visitCountry(existing)&&visitCountry(candidate)&&visitCountry(existing)!==visitCountry(candidate))||
       [existing.id,existing.visitId].filter(Boolean).some(id=>!aliases.has(str(id))))))throw new Error('OPS_VISIT_DURABLE_SCOPE_CONFLICT');
    const durableShopper=str(existing.shopperId),hrShopper=str(candidate.shopperId);
    const platformPending=str(existing.assignmentSource)==='platform'&&str(existing.assignmentSyncStatus)==='pending_hr'&&durableShopper;
    if(platformPending&&hrShopper&&hrShopper!==durableShopper){
      const reviewSnap=await tx.get(reviewRef);
      const prior=reviewSnap.exists?(reviewSnap.data()||{}):null;
      const sameOpenReview=Boolean(prior&&str(prior.status)==='open'&&str(prior.reviewType)==='hr_platform_assignment_conflict'&&str(prior.platformShopperId)===durableShopper&&str(prior.observedHrShopperId)===hrShopper&&str(prior.sourceRevision)===str(sourceRevision));
      if(!sameOpenReview){
        const ts=now();
        tx.set(reviewRef,{tenantId,projectId,periodId:str(existing.periodId||candidate.periodId)||null,entityType:'visit',entityId:visitId,reviewType:'hr_platform_assignment_conflict',status:'open',reason:'hr_shopper_differs_from_platform_pending_assignment',platformShopperId:durableShopper,observedHrShopperId:hrShopper,automaticOverwrite:false,sourceRevision,createdAt:prior?.createdAt||ts,updatedAt:ts},{merge:false});
      }
      // External HR remains authoritative for HR-managed assignment/state.
      // The conflict stays auditable in reviewQueue but must not overwrite the live HR read model.
    }
    const basePatch=clean({
      periodId:candidate.periodId,rootProjectId:projectId,hrRowId:candidate.hrRowId,sourceTab:candidate.sourceTab,sourceRow:candidate.sourceRow,sourceCoord:candidate.sourceCoord,hrSourceRevision:sourceRevision
    });
    // External HR remains authoritative for reservation dates on existing durable visits.
    // Explicit null clears stale future-window fields when HR no longer provides them.
    const hrTemporal=clean({
      periodKey:str(candidate.periodKey)||null,
      disponibleDesde:str(candidate.disponibleDesde||candidate.availableFrom)||null,
      availableFrom:str(candidate.availableFrom||candidate.disponibleDesde)||null
    });
    // I3 A09/B11: HR is the owner of assignment and availability state.
    // The existing-record merge must refresh all HR-managed representations,
    // not only shopperId/estado/canonicalFacets. Otherwise a normalized shopper
    // has the right owner but stale "unassigned" fields in that same document.
    const hrAssigned=candidate.canonicalFacets?.assigned===true;
    // HR owns operational execution and questionnaire facts. On existing
    // records the nested HR mirror was updated, but outer consumers kept old
    // schedule/submission values. Only this explicit operational allowlist is
    // mirrored; platform finance, payments and audit fields stay untouched.
    const hrManaged=candidate.hrManaged&&typeof candidate.hrManaged==='object'?candidate.hrManaged:{};
    const operationalHrFields=[
      'agendada','controlDia','cuestFecha','executionState','realizada',
      'schedulingState','questionnaireState','submissionState','submit',
      'submittedAt','sourceSnapshotAt','boleto','comboAmt',
      // The HR snapshot owns these validation flags. Leaving their old outer
      // values while refreshing hrManaged creates false reviews on assigned rows.
      'reviewRequired','reviewReasons'
    ];
    const operationalHrPatch=Object.fromEntries(operationalHrFields
      .filter(key=>Object.hasOwn(hrManaged,key)||Object.hasOwn(candidate,key))
      .map(key=>[key,Object.hasOwn(hrManaged,key)?hrManaged[key]:candidate[key]]));
    const desired=clean({
      ...basePatch,...hrTemporal,
      estado:candidate.estado,status:candidate.status,
      shopperId:candidate.shopperId||null,
      shopper:candidate.shopper||null,shopperCode:candidate.shopperCode||null,
      hasShopper:hrAssigned,assignmentState:hrAssigned?'assigned':'unassigned',
      canonicalState:candidate.canonicalState??null,
      operationalState:candidate.operationalState??null,
      availabilityState:candidate.availabilityState??null,
      availabilityDependency:candidate.availabilityDependency??null,
      assignmentSource:candidate.assignmentSource||null,
      assignmentSyncStatus:candidate.assignmentSyncStatus||null,
      canonicalFacets:candidate.canonicalFacets,
      // Explicit null from HR clears stale dates; unrelated CX financial state
      // is never inferred from a questionnaire or overwritten by this mirror.
      ...operationalHrPatch,
      hrManaged:candidate.hrManaged
    });
    const same=Object.entries(desired).every(([key,value])=>JSON.stringify(stable(existing[key]))===JSON.stringify(stable(value)));
    if(same)return {providerWrites:0,created:false,idempotentReplay:true};
    tx.set(visitRef,{...desired,updatedAt:now(),version:Number(existing.version||0)+1},{merge:true});
    return {providerWrites:1,created:false,idempotentReplay:false,periodScopeRepaired:str(existing.periodId)!==str(candidate.periodId),hrOperationalStateReconciled:true};
  });
}

async function transactionExecute(db,command,actor,hrSnapshot,hrRevision){
  const r=refs(db,command),digest=sha(clean(command));
  return db.runTransaction(async tx=>{
    const clientContext=CLIENT_COLLABORATION[command.commandType]?await clientCollaborationContext(tx,r,command,actor,hrSnapshot,hrRevision):null;
    const prior=await tx.get(r.receipt);
    const syncContext=command.commandType==='visit.sync.confirm'?await syncReflectionContext(tx,r,command,actor,hrSnapshot,hrRevision):null;
    if(prior.exists){
      const p=prior.data()||{};
      if(clientContext&&p.actorUid!==actor.uid)throw new Error('OPS_CLIENT_RECEIPT_ACTOR_DENIED');
      if(p.commandDigest!==digest)throw new Error('OPS_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD');
      if(p.status==='committed'){
        const reflection=syncContext?validateSyncReflectionReplay(p,syncContext,command,actor,digest):null;
        return ack(command,p.entityId,{idempotentReplay:true,providerWrites:0,...(reflection?{hrReflectionVerified:true,hrProviderAck:false,hrReflection:reflection,hrRevalidationRevision:hrRevision}:{})});
      }
    }
    const payload=clean(command.payload||{});
    let entityId=str(command.entityId),providerWrites=0,auditEntityType=command.entityType,notificationTargetShopperId=null;
    let notificationRequestCycleId=null,notificationEventAt=null;
    let hrReflection=null;

    if(clientContext){
      const spec=CLIENT_COLLABORATION[command.commandType];
      if(spec.kind==='meeting'){
        const timezone=str(clientContext.project.timeZone||clientContext.project.timezone||'UTC');
        const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
        if(payload.date+'T'+payload.time<=`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`)throw new Error('OPS_CLIENT_MEETING_IN_PAST');
      }
      entityId='client-'+spec.kind+'-'+sha([command.tenantId,command.projectId,command.periodId,actor.uid,command.commandType,command.idempotencyKey]).slice(0,32);
      const ref=r.bulletins.doc(entityId),existing=await tx.get(ref);
      if(existing.exists)throw new Error('OPS_CLIENT_ENTITY_WITHOUT_RECEIPT');
      const titles={nps:'Calificación del programa',note:'Anotación del cliente',meeting:'Solicitud de reunión del cliente'};
      const values=Object.fromEntries(spec.fields.filter(k=>payload[k]!==undefined).map(k=>[k,typeof payload[k]==='string'?str(payload[k]):payload[k]]));
      const requesterName=str(clientContext.member.name||clientContext.member.displayName)||actor.uid;
      const body=requesterName+' · '+(spec.kind==='nps'?('Calificación: '+payload.score+'/10'+(str(payload.comment)?' · '+str(payload.comment):'')):str(payload.subject)+' · '+(spec.kind==='note'?str(payload.detail):payload.date+' '+payload.time+' · '+payload.mode+' · '+str(clientContext.project.timeZone||clientContext.project.timezone||'UTC')+' · Pendiente de confirmación'));
      tx.create(ref,{id:entityId,entityId,entityType:'client_collaboration',kind:spec.kind,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,
        status:'active',collaborationStatus:'pending',type:'request',title:titles[spec.kind],body,
        targetUserIds:[actor.uid],targetRoles:['admin'],actionRoute:'tablon',requesterUid:actor.uid,requesterName,
        ...values,...(spec.kind==='meeting'?{timeZone:str(clientContext.project.timeZone||clientContext.project.timezone||'UTC')}:{}),
        operational:true,idempotencyKey:command.idempotencyKey,version:1,createdBy:actor.uid,createdAt:now(),updatedAt:now()});
      providerWrites++;auditEntityType=spec.entityType;
    }
    else if(command.commandType==='application.create'){
      if(actor.role!=='shopper')throw new Error('OPS_APPLICATION_CREATE_SHOPPER_ONLY');
      const visitId=str(payload.visitId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,vSnap=resolved.snap,v=resolved.data;assertPeriod(command,v);
      if(!isAvailable(v))throw new Error('OPS_VISIT_NOT_AVAILABLE');
      const shopperId=str(payload.shopperId||actor.shopperId);if(shopperId!==actor.shopperId)throw new Error('OPS_APPLICATION_SHOPPER_SCOPE_DENIED');
      const proposedDate=str(payload.proposedDate);if(!/^20\d{2}-[01]\d-[0-3]\d$/.test(proposedDate))throw new Error('OPS_APPLICATION_PROPOSED_DATE_REQUIRED');
      const projectSnap=await tx.get(r.project),projectData=projectSnap.exists?(projectSnap.data()||{}):{};
      const timezone=str(projectData.timeZone||projectData.timezone||'America/Guatemala');
      const localParts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
      const localToday=`${localParts.year}-${localParts.month}-${localParts.day}`;
      if(proposedDate<localToday)throw new Error('OPS_APPLICATION_PROPOSED_DATE_IN_PAST');
      entityId=entityId||('app-'+sha(`${command.tenantId}\0${command.projectId}\0${visitId}\0${shopperId}\0${command.idempotencyKey}`).slice(0,24));
      const aRef=r.applications.doc(entityId),aSnap=await tx.get(aRef);if(aSnap.exists)throw new Error('OPS_APPLICATION_ALREADY_EXISTS');
      tx.create(aRef,{id:entityId,applicationId:entityId,postulationId:entityId,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,visitId,visitaId:visitId,hrRowId:payload.hrRowId||v.hrRowId||null,shopperId,status:'pendiente',estado:'pendiente',fechaProp:payload.proposedDate||null,note:payload.note||null,source:'platform',version:1,createdAt:now(),updatedAt:now()});providerWrites++;
      auditEntityType='application';
    }
    else if(command.commandType==='application.status.update'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_APPLICATION_STATUS_OPERATOR_ONLY');
      const aRef=r.applications.doc(entityId),aSnap=await tx.get(aRef);if(!aSnap.exists)throw new Error('OPS_APPLICATION_MISSING');const a=aSnap.data()||{};assertPeriod(command,a);assertVersion(command,a);
      const status=str(payload.status).toLowerCase();if(!APPLICATION_STATES.includes(status))throw new Error('OPS_APPLICATION_STATUS_INVALID');
      if(status==='aprobada'&&(str(a.status||a.estado)==='aprobada'||a.postulationLifecycle==='transitioned_to_assignment'))
        throw new Error('OPS_APPLICATION_ALREADY_APPROVED');
      let vRef=null,v=null;
      if(status==='aprobada'){
        const visitId=str(a.visitId||a.visitaId||payload.visitId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');
        const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId||a.hrRowId,{command,snapshot:hrSnapshot});vRef=resolved.ref;v=resolved.data;assertPeriod(command,v);
        const assigned=str(v.shopperId);if(assigned&&assigned!==str(a.shopperId)){
          tx.set(r.review,{tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,entityType:'visit',entityId:visitId,reviewType:'assignment_conflict',status:'open',reason:'shopper_mismatch',platformShopperId:str(a.shopperId),observedShopperId:assigned,automaticOverwrite:false,createdAt:now()});providerWrites++;
          throw new Error('OPS_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
        }
        if(!assigned&&!isAvailable(v))throw new Error('OPS_VISIT_NOT_AVAILABLE');
      }
      const transitioned=status==='aprobada';
      tx.set(aRef,{status,estado:status,decisionReason:payload.reason||null,managedBy:actor.uid,active:!transitioned&&['pendiente','standby'].includes(status),postulationLifecycle:transitioned?'transitioned_to_assignment':status,transitionedToVisitId:transitioned?str(a.visitId||a.visitaId||payload.visitId):null,transitionedAt:transitioned?now():null,updatedAt:now(),version:Number(a.version||0)+1},{merge:true});providerWrites++;
      if(status==='aprobada'){
        const proposedScheduleDate=str(a.fechaProp||a.proposedDate);
        tx.set(vRef,{shopperId:str(a.shopperId),estado:'asignada',status:'asignada',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',proposedScheduleDate:proposedScheduleDate||null,approvedApplicationId:entityId,lastSyncedAt:null,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
        /* A shopper approval notice and its assignment belong to one atomic decision.
           Use the command receipt key so retries cannot create another notice. */
        const approvedShopperId=str(a.shopperId);
        if(!approvedShopperId)throw new Error('OPS_APPLICATION_SHOPPER_SCOPE_REQUIRED');
        const approvedVisitId=str(a.visitId||a.visitaId||payload.visitId);
        const bulletinId='application-approval-'+receiptId(command);
        tx.set(r.bulletins.doc(bulletinId),{
          id:bulletinId,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,status:'active',
          toRole:'shopper',targetRoles:['shopper'],targetShopperIds:[approvedShopperId],targetProjectIds:[command.projectId],
          entityType:'visit',entityId:approvedVisitId,eventKey:'postulation_approved_visit_assigned',
          operational:true,idempotencyKey:command.idempotencyKey,type:'aprobada',
          title:'Tu postulación fue aprobada',
          body:'Tu visita fue asignada. Revisa los detalles en Mis Visitas; la hoja de ruta está pendiente de sincronización.',
          priority:'high',actionRoute:'misvisitas',createdAt:now(),source:'cxorbia-operational-command-provider-v1'
        },{merge:false});providerWrites++;
      }
      auditEntityType='application';
    }
    else if(command.commandType==='application.delete'){
      const aRef=r.applications.doc(entityId),aSnap=await tx.get(aRef);
      if(aSnap.exists){
        const a=aSnap.data()||{};assertPeriod(command,a);assertVersion(command,a);
        if(actor.role==='shopper'&&str(a.shopperId)!==actor.shopperId)throw new Error('OPS_APPLICATION_DELETE_SHOPPER_SCOPE_DENIED');
        tx.delete(aRef);providerWrites++;
      }
      auditEntityType='application';
    }
    else if(command.commandType==='reservation.create'){
      const shopperId=str(payload.shopperId||actor.shopperId),branchId=str(payload.branchId||payload.sucursalId),visitId=str(payload.visitId),hrRowId=str(payload.hrRowId);
      if(!shopperId||!branchId||!visitId||!hrRowId)throw new Error('OPS_RESERVATION_KEYS_REQUIRED');
      if(actor.role==='shopper'&&shopperId!==actor.shopperId)throw new Error('OPS_RESERVATION_SHOPPER_SCOPE_DENIED');
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,hrRowId,{command,snapshot:hrSnapshot}),v=resolved.data;assertPeriod(command,v);
      if(!isAvailable(v))throw new Error('OPS_RESERVATION_VISIT_NOT_AVAILABLE');
      if(branchKey(v)!==branchId)throw new Error('OPS_RESERVATION_BRANCH_NOT_ELIGIBLE');
      const projectSnap=await tx.get(r.project),projectData=projectSnap.exists?(projectSnap.data()||{}):{};
      if(!reservationFutureEligible(v,projectData))throw new Error('OPS_RESERVATION_FUTURE_WINDOW_REQUIRED');
      const status=str(payload.status||payload.estado||'solicitada').toLowerCase();
      if(!RESERVATION_STATES.includes(status))throw new Error('OPS_RESERVATION_STATUS_INVALID');
      entityId=entityId||('rsv-'+sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${shopperId}\0${branchId}`).slice(0,28));
      const reservationRef=r.reservations.doc(entityId),reservationSnap=await tx.get(reservationRef);
      if(reservationSnap.exists)throw new Error('OPS_RESERVATION_ALREADY_EXISTS');
      tx.create(reservationRef,{id:entityId,reservationId:entityId,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,periodo:payload.periodo||null,branchId,sucursalId:branchId,sucursal:v.sucursal||payload.sucursal||null,ciudad:v.ciudad||payload.ciudad||null,pais:v.pais||v.country||payload.pais||null,visitId:resolved.logicalVisitId||visitId,visitaId:resolved.logicalVisitId||visitId,hrRowId:str(v.hrRowId)||hrRowId,sourceRevision:str(payload.sourceRevision)||null,shopperId,shopper:payload.shopper||null,status,estado:status,source:'platform',eligibilitySource:'live_hr_exact_visit',version:1,createdAt:now(),updatedAt:now()});providerWrites++;
      auditEntityType='reservation';
    }
    else if(command.commandType==='reservation.status.update'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_RESERVATION_STATUS_OPERATOR_ONLY');
      const reservationRef=r.reservations.doc(entityId),reservationSnap=await tx.get(reservationRef);if(!reservationSnap.exists)throw new Error('OPS_RESERVATION_MISSING');
      const reservation=reservationSnap.data()||{};assertPeriod(command,reservation);assertVersion(command,reservation);
      const status=str(payload.status||payload.estado).toLowerCase();if(!RESERVATION_STATES.includes(status))throw new Error('OPS_RESERVATION_STATUS_INVALID');
      const shopperId=str(payload.shopperId||reservation.shopperId),visitId=str(payload.visitId||payload.visitaId);
      if(!shopperId)throw new Error('OPS_RESERVATION_SHOPPER_REQUIRED');
      if(visitId){
        const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId||reservation.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,v=resolved.data;assertPeriod(command,v);
        const assigned=str(v.shopperId);if(assigned&&assigned!==shopperId)throw new Error('OPS_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
        if(!assigned&&!isAvailable(v))throw new Error('OPS_VISIT_NOT_AVAILABLE');
        tx.set(vRef,{shopperId,estado:'asignada',status:'asignada',assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      }
      const finalStatus=visitId&&['asignada','aprobada','cruzada'].includes(status)?'cruzada':status;
      tx.set(reservationRef,{shopperId,shopper:payload.shopper||reservation.shopper||null,status:finalStatus,estado:finalStatus,visitId:visitId||reservation.visitId||null,visitaId:visitId||reservation.visitaId||null,managedBy:actor.uid,updatedAt:now(),version:Number(reservation.version||0)+1},{merge:true});providerWrites++;
      auditEntityType='reservation';
    }
    else if(command.commandType==='reservation.delete'){
      const reservationRef=r.reservations.doc(entityId),reservationSnap=await tx.get(reservationRef);
      if(reservationSnap.exists){
        const reservation=reservationSnap.data()||{};assertPeriod(command,reservation);assertVersion(command,reservation);
        if(actor.role==='shopper'&&str(reservation.shopperId)!==actor.shopperId)throw new Error('OPS_RESERVATION_SHOPPER_SCOPE_DENIED');
        tx.delete(reservationRef);providerWrites++;
      }
      auditEntityType='reservation';
    }
    else if(command.commandType==='support.ticket.create'){
      if(actor.role!=='shopper'&&!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_SUPPORT_CREATE_ROLE_DENIED');
      const subject=str(payload.subject||payload.asunto),detail=str(payload.detail||payload.detalle),supportType=str(payload.supportType||payload.tipo||'Plataforma'),priority=str(payload.priority||payload.prio||'media').toLowerCase();
      if(!subject)throw new Error('OPS_SUPPORT_SUBJECT_REQUIRED');
      if(!['baja','media','alta'].includes(priority))throw new Error('OPS_SUPPORT_PRIORITY_INVALID');
      entityId=entityId||('support-'+sha(`${command.tenantId}\0${command.projectId}\0${command.periodId}\0${actor.uid}\0${command.idempotencyKey}`).slice(0,30));
      const ticketRef=r.bulletins.doc(entityId),ticketSnap=await tx.get(ticketRef);
      if(ticketSnap.exists)throw new Error('OPS_SUPPORT_TICKET_ALREADY_EXISTS');
      const shopperTargets=actor.role==='shopper'&&actor.shopperId?[actor.shopperId]:[];
      tx.create(ticketRef,{
        id:entityId,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,status:'active',type:'request',priority,
        title:'Nueva solicitud de soporte',body:subject+(detail?(' · '+detail):''),targetRoles:['admin'],targetUserIds:[actor.uid],targetShopperIds:shopperTargets,targetProjectIds:[command.projectId],
        actionRoute:'soporte',entityType:'support_ticket',entityId,operational:true,idempotencyKey:command.idempotencyKey,
        supportRequesterUserId:actor.uid,supportRequesterShopperId:actor.shopperId||null,supportRequesterName:str(payload.requesterName)||actor.uid,supportRequesterRole:actor.role,
        supportType,supportSubject:subject,supportDetail:detail,supportStatus:'abierto',supportPriority:priority,supportNote:'',supportOwnerName:'',
        version:1,createdBy:actor.uid,createdAt:now(),updatedAt:now()
      });providerWrites++;auditEntityType='supportTicket';
    }
    else if(command.commandType==='support.ticket.update'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_SUPPORT_UPDATE_OPERATOR_ONLY');
      if(!entityId)throw new Error('OPS_SUPPORT_TICKET_ID_REQUIRED');
      const ticketRef=r.bulletins.doc(entityId),ticketSnap=await tx.get(ticketRef);
      if(!ticketSnap.exists)throw new Error('OPS_SUPPORT_TICKET_MISSING');
      const ticket=ticketSnap.data()||{};
      if(str(ticket.entityType)!=='support_ticket')throw new Error('OPS_SUPPORT_TICKET_TYPE_MISMATCH');
      if(str(ticket.projectId)!==str(command.projectId)||str(ticket.periodId)!==str(command.periodId))throw new Error('OPS_SUPPORT_SCOPE_MISMATCH');
      assertVersion(command,ticket);
      const supportStatus=str(payload.status||payload.estado||ticket.supportStatus||'abierto').toLowerCase();
      if(!['abierto','en_proceso','resuelto'].includes(supportStatus))throw new Error('OPS_SUPPORT_STATUS_INVALID');
      tx.set(ticketRef,{supportStatus,supportNote:str(payload.note??payload.nota??ticket.supportNote),supportOwnerName:str(payload.ownerName??payload.responsable??ticket.supportOwnerName),managedBy:actor.uid,updatedAt:now(),version:Number(ticket.version||0)+1},{merge:true});
      providerWrites++;auditEntityType='supportTicket';
    }
    else if(command.commandType==='visit.assign'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_VISIT_ASSIGN_OPERATOR_ONLY');
      const visitId=str(payload.visitId||entityId),shopperId=str(payload.shopperId);if(!visitId||!shopperId)throw new Error('OPS_VISIT_ASSIGN_KEYS_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,vSnap=resolved.snap,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      const assigned=str(v.shopperId);if(assigned&&assigned!==shopperId)throw new Error('OPS_VISIT_ALREADY_ASSIGNED_OTHER_SHOPPER');
      if(!isAvailable(v))throw new Error('OPS_VISIT_NOT_AVAILABLE');
      const source=str(payload.assignmentSource||'platform');if(!['platform','hr'].includes(source))throw new Error('OPS_ASSIGNMENT_SOURCE_INVALID');
      tx.set(vRef,{shopperId,estado:'asignada',status:'asignada',assignmentSource:source,assignmentSyncStatus:source==='platform'?'pending_hr':'pending_platform',hrRowId:payload.hrRowId||v.hrRowId||null,periodId:command.periodId,lastSyncedAt:null,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});providerWrites++;
      auditEntityType='visit';
    }
    else if(command.commandType==='visit.reassign'){
      if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_VISIT_REASSIGN_OPERATOR_ONLY');
      const visitId=str(payload.visitId||entityId),shopperId=str(payload.shopperId);if(!visitId||!shopperId)throw new Error('OPS_VISIT_REASSIGN_KEYS_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,vSnap=resolved.snap,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      const priorShopperId=str(v.shopperId);if(!priorShopperId)throw new Error('OPS_VISIT_REASSIGN_REQUIRES_ASSIGNED_VISIT');
      const state=str(v.estado||v.status).toLowerCase();if(!['asignada','agendada'].includes(state))throw new Error('OPS_VISIT_REASSIGN_STATE_DENIED');
      const scheduleDecision=str(payload.scheduleDecision||'keep').toLowerCase();if(!['keep','change','pending'].includes(scheduleDecision))throw new Error('OPS_VISIT_REASSIGN_SCHEDULE_DECISION_INVALID');
      const patch={shopperId,assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,reassignedFromShopperId:priorShopperId,reassignedBy:actor.uid,reassignedAt:now(),updatedAt:now(),version:Number(v.version||0)+1};
      if(scheduleDecision==='change'){
        const scheduledDate=str(payload.scheduledDate);if(!scheduledDate)throw new Error('OPS_VISIT_REASSIGN_DATE_REQUIRED');
        patch.agendada=scheduledDate;patch.estado='agendada';patch.status='agendada';if(str(payload.franjaCode))patch.franjaCode=str(payload.franjaCode);
      }else if(scheduleDecision==='pending'){
        patch.agendada=null;patch.estado='asignada';patch.status='asignada';patch.pendienteAgendamiento=true;
      }
      patch.canonicalFacets={...(v.canonicalFacets||{}),available:false,assigned:true,scheduled:scheduleDecision==='change'||(scheduleDecision==='keep'&&!!v.agendada),realized:false,cancelled:false};
      tx.set(vRef,patch,{merge:true});providerWrites++;auditEntityType='visit';
    }
    else if(command.commandType==='visit.state.update'){
      const visitId=str(payload.visitId||entityId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,vSnap=resolved.snap,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      if(actor.role==='shopper'&&str(v.shopperId)!==actor.shopperId)throw new Error('OPS_VISIT_SHOPPER_SCOPE_DENIED');
      const current=str(v.estado||v.status).toLowerCase(),next=str(payload.patch?.estado||payload.patch?.status).toLowerCase();if(!next)throw new Error('OPS_VISIT_STATE_REQUIRED');
      if(['cancelada','liquidada','pagada'].includes(current))throw new Error('OPS_VISIT_TERMINAL_STATE');
      if(actor.role==='shopper'){
        const allowed={asignada:['agendada'],agendada:['realizada'],realizada:['cuestionario']};
        if(!(allowed[current]||[]).includes(next))throw new Error('OPS_VISIT_TRANSITION_DENIED');
      }
      const patch={estado:next,status:next,updatedAt:now(),version:Number(v.version||0)+1};
      for(const k of ['agendada','realizada','cuestFecha'])if(payload.patch?.[k])patch[k]=payload.patch[k];
      if(next==='agendada'){
        const projectSnap=await tx.get(r.project),projectData=projectSnap.exists?(projectSnap.data()||{}):{};
        patch.agendada=assertSchedulableDate(v,patch.agendada,str(projectData.timeZone||projectData.timezone||'America/Guatemala'));
      }
      tx.set(vRef,patch,{merge:true});providerWrites++;auditEntityType='visit';
    }
    else if(command.commandType==='visit.reschedule'){
      const visitId=str(payload.visitId||entityId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,vSnap=resolved.snap,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      /* B7: server notification must target the assigned shopper, not the Admin actor. */
      notificationTargetShopperId=str(v.shopperId);
      if(!notificationTargetShopperId)throw new Error('OPS_RESCHEDULE_SHOPPER_TARGET_REQUIRED');
      if(actor.role==='shopper'&&str(v.shopperId)!==actor.shopperId)throw new Error('OPS_VISIT_SHOPPER_SCOPE_DENIED');
      const newDate=str(payload.newDate),shopperRequest=actor.role==='shopper'||payload.requestedByShopper===true;
      const projectSnap=await tx.get(r.project),projectData=projectSnap.exists?(projectSnap.data()||{}):{},timezone=str(projectData.timeZone||projectData.timezone||'America/Guatemala');
      if(shopperRequest){
        if(!newDate)throw new Error('OPS_RESCHEDULE_DATE_REQUIRED');
        const validatedDate=assertSchedulableDate(v,newDate,timezone);
        if(!str(payload.reason))throw new Error('OPS_RESCHEDULE_REASON_REQUIRED');
        if(str(v.rescheduleRequest?.status)==='pending_review'||str(v.cancelRequest?.status)==='pending_review')throw new Error('OPS_VISIT_REQUEST_ALREADY_PENDING');
        notificationRequestCycleId=receiptId(command);notificationEventAt=now();
        tx.set(vRef,{rescheduleRequest:{status:'pending_review',requestCycleId:notificationRequestCycleId,newDate:validatedDate,reason:str(payload.reason),requestedByShopperId:actor.shopperId,requestedAt:notificationEventAt,decidedAt:null,decidedBy:null,decisionReason:null},updatedAt:notificationEventAt,version:Number(v.version||0)+1},{merge:true});
      }else{
        if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_RESCHEDULE_OPERATOR_ONLY');
        const decision=str(payload.decision||'approved').toLowerCase();if(!['approved','rejected'].includes(decision))throw new Error('OPS_RESCHEDULE_DECISION_INVALID');
        if(decision==='approved'&&!newDate)throw new Error('OPS_RESCHEDULE_DATE_REQUIRED');
        const validatedDate=decision==='approved'?assertSchedulableDate(v,newDate,timezone):null;
        const pending=v.rescheduleRequest?.status==='pending_review'?v.rescheduleRequest:null;
        notificationRequestCycleId=pending?.requestCycleId||null;notificationEventAt=now();
        const patch={rescheduleRequest:{status:decision,requestCycleId:notificationRequestCycleId,newDate:validatedDate,reason:payload.reason||null,requestedByShopperId:pending?.requestedByShopperId||null,requestedAt:pending?.requestedAt||null,decisionReason:payload.reason||null,decidedBy:actor.uid,decidedAt:notificationEventAt},updatedAt:notificationEventAt,version:Number(v.version||0)+1};
        if(decision==='approved'){patch.agendada=validatedDate;patch.estado='agendada';patch.status='agendada';patch.pendienteAgendamiento=false;if(str(payload.franjaCode))patch.franjaCode=str(payload.franjaCode);}
        tx.set(vRef,patch,{merge:true});
      }
      providerWrites++;auditEntityType='visit';
    }
    else if(command.commandType==='visit.cancel'){
      const visitId=str(payload.visitId||entityId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      notificationTargetShopperId=str(v.shopperId);
      if(actor.role==='shopper'&&notificationTargetShopperId!==actor.shopperId)throw new Error('OPS_VISIT_SHOPPER_SCOPE_DENIED');
      if(actor.role==='shopper'){
        if(str(payload.decision)||payload.releaseToAvailable===true)throw new Error('OPS_CANCEL_SHOPPER_DECISION_DENIED');
        if(!str(payload.reason))throw new Error('OPS_CANCEL_REASON_REQUIRED');
        if(str(v.cancelRequest?.status)==='pending_review'||str(v.cancelRequest?.status)==='approved_pending_hr'||str(v.rescheduleRequest?.status)==='pending_review')throw new Error('OPS_VISIT_REQUEST_ALREADY_PENDING');
        notificationRequestCycleId=receiptId(command);notificationEventAt=now();
        tx.set(vRef,{cancelRequest:{status:'pending_review',requestCycleId:notificationRequestCycleId,reason:str(payload.reason),requestedByShopperId:actor.shopperId,requestedAt:notificationEventAt,decidedAt:null,decidedBy:null,decisionReason:null},
          updatedAt:notificationEventAt,version:Number(v.version||0)+1},{merge:true});
      }else{
        if(!OPERATOR_ROLES.includes(actor.role))throw new Error('OPS_CANCEL_OPERATOR_ONLY');
        if(payload.requestOnly===true)throw new Error('OPS_CANCEL_STAFF_REQUEST_IMPERSONATION_DENIED');
        const projectSnap=await tx.get(r.project),projectData=projectSnap.exists?(projectSnap.data()||{}):{},sourceMode=visitRouteMode(projectData);
        const decision=str(payload.decision).toLowerCase();
        if(decision){
          if(payload.releaseToAvailable===true)throw new Error('OPS_CANCEL_DECISION_CANNOT_AUTO_RELEASE');
          notificationRequestCycleId=v.cancelRequest?.requestCycleId||null;notificationEventAt=now();
          const patch=planVisitCancelDecision(v,{decision,reason:payload.reason,actorUid:actor.uid,sourceMode,at:notificationEventAt});
          tx.set(vRef,patch,{merge:true});
        }else{
          /* Existing direct Admin cancellation is only safe for an internal-owned route.
             For external/provider HR the pending approval must await independent HR ACK. */
          if(['pending_review','approved_pending_hr'].includes(str(v.cancelRequest?.status)))throw new Error('OPS_CANCEL_DECISION_OR_HR_ACK_REQUIRED');
          if(sourceMode!=='internal')throw new Error('OPS_CANCEL_EXTERNAL_HR_ACK_REQUIRED');
          if(!str(payload.reason))throw new Error('OPS_CANCEL_REASON_REQUIRED');
          const release=payload.releaseToAvailable===true;
          const patch=release
            ? {estado:'disponible',status:'disponible',cancelled:false,cancelReason:str(payload.reason),shopperId:null,shopper:null,agendada:null,
               assignmentSource:'platform',assignmentSyncStatus:'pending_hr',lastSyncedAt:null,
               canonicalFacets:{...(v.canonicalFacets||{}),available:true,assigned:false,scheduled:false,cancelled:false},
               updatedAt:now(),version:Number(v.version||0)+1}
            : {estado:'cancelada',status:'cancelada',cancelled:true,cancelReason:str(payload.reason),
               canonicalFacets:{...(v.canonicalFacets||{}),available:false,cancelled:true},updatedAt:now(),version:Number(v.version||0)+1};
          tx.set(vRef,patch,{merge:true});
        }
      }
      providerWrites++;auditEntityType='visit';
    }
    else if(command.commandType==='visit.questionnaire.submit'){
      const visitId=str(payload.visitId||entityId);if(!visitId)throw new Error('OPS_VISIT_ID_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,vSnap=resolved.snap,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      if(actor.role==='shopper'&&str(v.shopperId)!==actor.shopperId)throw new Error('OPS_VISIT_SHOPPER_SCOPE_DENIED');
      tx.set(vRef,{questionnaireResult:payload.result||{},cuestFecha:payload.completedAt||now().slice(0,10),estado:'cuestionario',status:'cuestionario',questionnaireSubmittedBy:actor.uid,questionnaireSubmittedAt:now(),updatedAt:now(),version:Number(v.version||0)+1},{merge:true});
      providerWrites++;auditEntityType='visit';
    }
    else if(command.commandType==='visit.checkin.evidence'){
      const visitId=str(payload.visitId||entityId),evidenceId=str(payload.evidenceId),storagePath=str(payload.storagePath),checksum=str(payload.checksum),mimeType=str(payload.mimeType);
      if(!visitId||!evidenceId||!storagePath||!checksum||!mimeType||payload.storageProviderAck!==true)throw new Error('OPS_CHECKIN_EVIDENCE_REQUIRED');entityId=visitId;
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      if(actor.role!=='shopper'||str(v.shopperId)!==actor.shopperId)throw new Error('OPS_CHECKIN_SHOPPER_SCOPE_DENIED');
      const confirmedDate=str(v.agendada||v.scheduledDate||v.fechaAgendada).slice(0,10);
      if(!/^20\d{2}-[01]\d-[0-3]\d$/.test(confirmedDate))throw new Error('OPS_CHECKIN_SCHEDULE_REQUIRED');
      if(tenantDateKey(str(v.timeZone||v.timezone||'America/Guatemala'))<confirmedDate)throw new Error('OPS_CHECKIN_BEFORE_AGENDA_DATE');
      if(!/^image\//i.test(mimeType)||!Number.isFinite(Number(payload.size))||Number(payload.size)<=0||Number(payload.size)>15*1024*1024)throw new Error('OPS_CHECKIN_IMAGE_INVALID');
      const lat=Number(payload.lat),lon=Number(payload.lon),accuracy=Number(payload.accuracy||0);
      if(!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lon)||lon<-180||lon>180||!Number.isFinite(accuracy)||accuracy<0)throw new Error('OPS_CHECKIN_GPS_INVALID');
      const expectedPrefix=['tenants',command.tenantId,'projects',command.projectId,'periods',command.periodId,'visits',visitId,'evidence',evidenceId].join('/')+'/';
      if(!storagePath.startsWith(expectedPrefix))throw new Error('OPS_CHECKIN_STORAGE_SCOPE_MISMATCH');
      const capturedAt=str(payload.capturedAt);if(!capturedAt||!Number.isFinite(Date.parse(capturedAt)))throw new Error('OPS_CHECKIN_CAPTURE_TIME_INVALID');
      const eRef=r.visitEvidence.doc(evidenceId),eSnap=await tx.get(eRef);
      const item={tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,visitId,hrRowId:str(v.hrRowId)||null,shopperId:actor.shopperId,
        evidenceId,storagePath,checksum,mimeType,size:Number(payload.size),geo:{lat,lon,accuracy},capturedAt,providerAck:true,
        createdByUid:actor.uid,createdAt:eSnap.exists?(eSnap.data()?.createdAt||now()):now(),updatedAt:now()};
      tx.set(eRef,item,{merge:false});
      tx.set(vRef,{latestCheckInEvidenceId:evidenceId,checkInStatus:'confirmed',checkInAt:capturedAt,checkInGeo:{lat,lon,accuracy},updatedAt:now(),version:Number(v.version||0)+1},{merge:true});
      providerWrites+=2;auditEntityType='visitEvidence';
    }
    else if(command.commandType==='resource.read.receipt'){
      const visitId=str(payload.visitId),resourceId=str(payload.resourceId);if(!visitId||!resourceId||payload.humanConfirmed!==true)throw new Error('OPS_RESOURCE_READ_CONFIRMATION_REQUIRED');
      const resolved=await resolveVisitDocument(tx,r.visits,visitId,payload.hrRowId,{command,snapshot:hrSnapshot}),vRef=resolved.ref,v=resolved.data;assertPeriod(command,v);assertVersion(command,v);
      if(actor.role!=='shopper'||str(v.shopperId)!==actor.shopperId)throw new Error('OPS_RESOURCE_READ_SHOPPER_SCOPE_DENIED');
      const resRef=r.resources.doc(resourceId),resSnap=await tx.get(resRef);if(!resSnap.exists)throw new Error('OPS_RESOURCE_MISSING');
      const resource=resSnap.data()||{};if(resource.status!=='active'||str(resource.projectId)!==command.projectId)throw new Error('OPS_RESOURCE_SCOPE_MISMATCH');
      if(resource.periodId&&str(resource.periodId)!==command.periodId)throw new Error('OPS_RESOURCE_PERIOD_MISMATCH');
      const roles=arr(resource.visibleRoles).map(str);if(resource.targetAll!==true&&!roles.includes('shopper'))throw new Error('OPS_RESOURCE_SHOPPER_VISIBILITY_DENIED');
      const revision=str(payload.resourceRevision||resource.contentRevision||resource.version||resource.updatedAt||'source-current');
      const receiptKey=sha([command.tenantId,command.projectId,command.periodId,actor.shopperId,visitId,resourceId,revision]).slice(0,36),readAt=str(payload.readAt)||now();
      const rr=r.resourceReadReceipts.doc('read-'+receiptKey);
      tx.set(rr,{tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,shopperId:actor.shopperId,visitId,hrRowId:str(v.hrRowId)||null,
        resourceId,resourceRevision:revision,resourceType:str(payload.resourceType||resource.resourceType||'project_resource'),humanConfirmed:true,readAt,providerAck:true,createdByUid:actor.uid,updatedAt:now()},{merge:true});
      tx.set(vRef,{instructiveReadAt:readAt,instructiveResourceId:resourceId,instructiveResourceRevision:revision,updatedAt:now(),version:Number(v.version||0)+1},{merge:true});
      entityId='read-'+receiptKey;providerWrites+=2;auditEntityType='resourceReadReceipt';
    }
    else if(command.commandType==='visit.sync.confirm'){
      const {resolved,identity}=syncContext,v=resolved.data;
      if(!Number.isSafeInteger(v.version)||v.version<0||str(command.expectedVersion)!==str(v.version))throw new Error('OPS_SYNC_CONFIRM_CONCRETE_VERSION_REQUIRED');
      entityId=str(payload.visitId||entityId);const at=now();
      hrReflection={schemaVersion:'cxorbia.hr-assignment-reflection.v1',proofScope:'INDEPENDENT_HR_ASSIGNMENT_REFLECTION_ONLY',...identity,sourceRevision:hrRevision,actorUid:actor.uid,commandDigest:digest,idempotencyKey:command.idempotencyKey,previousVersion:v.version,committedVersion:v.version+1,verifiedAt:at,hrProviderAck:false};
      tx.set(resolved.ref,{assignmentSyncStatus:'synced',lastSyncedAt:at,updatedAt:at,version:v.version+1,hrReflection},{mergeFields:['assignmentSyncStatus','lastSyncedAt','updatedAt','version','hrReflection']});providerWrites++;
      auditEntityType='visit';
    }

    /* Durable, idempotent notification in the SAME Firestore command transaction. */
    if(command.commandType==='visit.reschedule'||command.commandType==='visit.cancel'){
      const requested=actor.role==='shopper'||payload.requestedByShopper===true||payload.requestOnly===true;
      const kind=command.commandType==='visit.reschedule'?'reprog':'cancel';
      const targetShopper=str(notificationTargetShopperId||payload.shopperId||actor.shopperId);
      const outcome=str(payload.decision||'approved').toLowerCase();
      const bulletinId='visit-request-'+receiptId(command);
      const title=requested?(kind==='reprog'?'Solicitud de reprogramación':'Solicitud de cancelación'):(outcome==='rejected'?'Solicitud no autorizada':'Solicitud revisada');
      const body=requested?('Solicitud registrada para visita '+entityId+' · '+(str(payload.newDate)||str(payload.reason))):('Decisión '+(outcome==='rejected'?'rechazada':'aprobada')+' para visita '+entityId+'. Revisa el estado en Mis Visitas.');
      tx.set(r.bulletins.doc(bulletinId),{id:bulletinId,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,status:'active',
        toRole:requested?'admin':'shopper',targetRoles:requested?['admin']:['shopper'],
        targetProjectIds:[command.projectId],targetShopperIds:requested?[]:[targetShopper].filter(Boolean),
        entityType:'visit',entityId,operational:true,eventKey:'durable_'+kind+'_request_decision',
        requestCycleId:notificationRequestCycleId,
        idempotencyKey:command.idempotencyKey,type:kind,title,body,priority:'high',actionRoute:requested?'postulaciones':'misvisitas',
        createdAt:notificationEventAt||now(),source:'cxorbia-operational-command-provider-v1'}, {merge:false});
      providerWrites++;
    }
    tx.set(r.receipt,{status:'committed',commandDigest:digest,entityId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,updatedAt:now(),...(hrReflection?{hrReflection,hrProviderAck:false}:{})});providerWrites++;
    tx.set(r.audit,{tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId,entityId,entityType:auditEntityType,commandType:command.commandType,actorUid:actor.uid,actorRole:actor.role,idempotencyKey:command.idempotencyKey,reason:command.audit?.reason||null,createdAt:now(),...(hrReflection?{hrReflection,hrProviderAck:false}:{})},{merge:false});providerWrites++;
    return ack(command,entityId,{providerWrites,...(hrReflection?{hrReflectionVerified:true,hrProviderAck:false,hrReflection}:{})});
  });
}

export function createOperationalCommandProvider({auth,db,policy,hrSnapshot=null,hrRevision=''}={}){
  const pv=validateProviderPolicy(policy);if(!pv.ok)throw new Error('OPS_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('OPS_PROVIDER_DEPENDENCIES_MISSING');
  return Object.freeze({
    version:VERSION,
    async execute(token,command){
      const cv=validateCommand(command);if(!cv.ok)return blocked(command,'OPS_COMMAND_INVALID',{errors:cv.errors});
      try{validateClientCollaboration(command);}catch(error){return blocked(command,str(error?.message||error));}
      if(!scopeAllowed(policy,command))return blocked(command,'OPS_COMMAND_SCOPE_DENIED');
      let actor;
      try{actor=await exactActor(auth,db,token,command);}catch(error){return blocked(command,'OPS_ACTOR_DENIED',{error:str(error?.message||error)});}
      try{
        const result=await transactionExecute(db,command,actor,hrSnapshot,hrRevision);
        return CLIENT_COLLABORATION[command.commandType]?await verifyClientCollaborationReadback(db,command,actor,result):result;
      }catch(error){return blocked(command,str(error?.message||error));}
    },
    async reconcileSnapshot(snapshot,{sourceRevision}={}){
      const {scope,visits}=visitsFromSnapshot(snapshot);
      if(!scopeAllowed(policy,scope))throw new Error('OPS_VISIT_RECONCILIATION_SCOPE_DENIED');
      const revision=str(sourceRevision||snapshot?.sourceRevision||snapshot?._runtime?.revision);
      if(!revision)throw new Error('OPS_VISIT_RECONCILIATION_REVISION_REQUIRED');
      let created=0,replayed=0,writes=0,reviews=0,conflicts=0,cursor=0;
      const startedAt=Date.now();
      const configured=Number(process.env.CXORBIA_VISIT_RECONCILIATION_CONCURRENCY||16);
      const reconciliationConcurrency=Math.max(1,Math.min(24,Number.isFinite(configured)?Math.trunc(configured):16,Math.max(1,visits.length)));
      const worker=async()=>{
        while(true){
          const index=cursor++;
          if(index>=visits.length)return;
          const result=await reconcileVisitDoc({db,policy,candidate:visits[index],sourceRevision:revision});
          if(result.created)created++;
          if(result.idempotentReplay)replayed++;
          if(result.reviewRequired)reviews++;
          if(result.conflict)conflicts++;
          writes+=Number(result.providerWrites||0);
        }
      };
      const settled=await Promise.allSettled(Array.from({length:reconciliationConcurrency},()=>worker()));
      const failed=settled.find(result=>result.status==='rejected');
      if(failed)throw failed.reason;
      return {ok:true,status:'committed',providerAck:true,sourceRevision:revision,tenantId:scope.tenantId,projectId:scope.projectId,visitCount:visits.length,createdVisits:created,idempotentReplays:replayed,reviewRequiredVisits:reviews,conflicts,providerWrites:writes,reconciliationConcurrency,reconciliationDurationMs:Date.now()-startedAt,hrWrites:0,externalWrites:0,fuzzyMatching:false};
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:arr(policy.allowedTenantIds),allowedProjectIds:arr(policy.allowedProjectIds),conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,APPLICATION_STATES,RESERVATION_STATES,validateProviderPolicy,validateCommand,createOperationalCommandProvider};

