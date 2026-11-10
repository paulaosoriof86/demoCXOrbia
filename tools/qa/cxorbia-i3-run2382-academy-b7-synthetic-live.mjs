#!/usr/bin/env node
/* I3 / RUN2382 — fenced DEV-only, temporary-identity provider certification.
 * The only writes are explicitly tagged disposable QA members, Auth accounts,
 * visit/application fixtures and their exact command receipts, audits/notices.
 * Never touches an HR row, a real visitor, an existing learner or production.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const env=process.env,str=v=>String(v??'').trim(),sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v),'utf8').digest('hex');
const runId=str(env.GITHUB_RUN_ID),sourceSha=str(env.FOCAL_SOURCE),expectedHr=str(env.EXPECTED_HR_REVISION);
const host=str(env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const projectName=str(env.PROJECT||'cxorbia-backend-dev'),tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const out=str(env.QA_OUT||'.tmp/i3-run2382-academy-b7-synthetic');
if(env.CXORBIA_I3_QA_ISOLATED_WRITE_GATE!=='PAULA_AUTHORIZED_RUN2382_DEV_ONLY'||
   projectName!=='cxorbia-backend-dev'||host!=='https://cxorbia-backend-dev.web.app'||
   !/^\d{8,}$/.test(runId)||!/^[a-f0-9]{40}$/.test(sourceSha)||!/^[a-f0-9]{64}$/.test(expectedHr)){
  throw Error('SOURCE_FAILURE:QA_SCOPE_GATE_DENIED');
}
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),proj=tenant.collection('projects').doc(projectId);
const baseCourses=JSON.parse(fs.readFileSync(new URL('../../backend/contracts/cxorbia-academy-base-progress-contract-v1.json',import.meta.url),'utf8')).courses;
const progressCourse=baseCourses.find(c=>c.audience==='shopper'&&c.courseId==='s_ruta');
const lesson=progressCourse?.lessons.find(l=>l.id==='sr1');
if(!lesson||lesson.quiz.length)throw Error('SOURCE_FAILURE:EXACT_SOURCE_BASE_LESSON_DRIFT');
const result={schemaVersion:'cxorbia.i3.run2382.qa-academy-b7-live.v1',decision:'HOLD',classification:null,
  runId,sourceSha,environment:projectName,production:false,periodId,hrBefore:null,hrAfter:null,
  academia:{},postulaciones:{},qaIdentitiesCreated:0,qaIdentitiesDeleted:0,cleanup:{ok:false,docFailures:[],authFailures:[],residue:[]},
  safety:{realLearnerWrites:0,realVisitsWritten:0,hrWrites:0,paymentWrites:0,productionDeploys:0}};
const persist=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
const ensure=(yes,category,code)=>{if(!yes)throw Error(category+':'+code)};
const delDocs=new Map(),createdAuth=[];
function queue(ref){delDocs.set(ref.path,ref);return ref}
function receipt(command){return queue(tenant.collection('commandReceipts').doc(sha(`${tenantId}\0${projectId}\0${periodId}\0${command.idempotencyKey}`).slice(0,40)))}
function audit(command){return queue(tenant.collection('entityAuditTrail').doc(sha(`${command.idempotencyKey}\0${command.commandType}\0${command.entityId||''}`).slice(0,40)))}
async function json(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});
  const body=await response.json().catch(()=>({}));return {http:response.status,...body};
}
async function hrMeta(){
  const m=await json(`${host}/api/tya/cinepolis/hr-live?format=meta&qa=${runId}-${Date.now()}`,
    {headers:{'cache-control':'no-cache, no-store'}});
  ensure(m.http===200&&m.ok===true&&m.sourceSafe===true&&m.revisionStable===true&&m.hrWrites===false&&m.production===false,'PROVIDER_FAILURE','HR_META_CONTRACT');
  return str(m.revision);
}
async function apiKey(){
  const j=await json(host+'/__/firebase/init.json',{headers:{'cache-control':'no-store'}});
  ensure(j.http===200&&str(j.apiKey),'ENVIRONMENT_FAILURE','DEV_AUTH_INITIALIZATION');return str(j.apiKey);
}
async function qaIdentity(letter,key){
  const uid=`qa_i3_${runId}_${letter}`,shopperId=`qa_i3_shopper_${runId}_${letter}`;
  const memberRef=queue(tenant.collection('users').doc(uid));
  ensure(!(await memberRef.get()).exists,'SOURCE_FAILURE','QA_MEMBER_COLLISION_'+letter);
  try{await auth.getUser(uid);throw Error('SOURCE_FAILURE:QA_AUTH_COLLISION_'+letter)}
  catch(e){if(e?.code!=='auth/user-not-found')throw e}
  const claims={tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId};
  await auth.createUser({uid,displayName:'QA Recovery '+letter,disabled:false});createdAuth.push(uid);
  await auth.setCustomUserClaims(uid,claims);
  await memberRef.create({uid,tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId,
    name:'QA Recovery '+letter,active:true,status:'active',qaSynthetic:true,qaRunId:runId});
  result.qaIdentitiesCreated++;
  return {uid,shopperId};
}
async function identityToken(uid,key){
  const user=await auth.getUser(uid),custom=await auth.createCustomToken(uid,user.customClaims||{});
  const j=await json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(j.http===200&&str(j.idToken),'AUTH_FAILURE','DEV_QA_LOGIN_'+j.http);
  const claims=await auth.verifyIdToken(j.idToken,true);
  ensure(claims.uid===uid&&claims.tenantId===tenantId&&claims.role==='shopper'&&claims.authNamespace==='shopper','AUTH_FAILURE','QA_CLAIMS_INVALID');
  return j.idToken;
}
async function command(token,c){return json(host+'/v1/cxorbia/commands',
  {method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(c)});}
function op(type,id,key,expectedVersion,payload,entityType='application'){
  const c={version:'cxorbia-command-adapter-v1',commandType:type,entityType,entityId:id,tenantId,projectId,periodId,
    expectedVersion,idempotencyKey:`qa-i3-${runId}-${key}`,authorization:{providerEnforcementRequired:true},
    payload,audit:{reason:'QA synthetic DEV RUN2382',correlationId:`qa-i3-${runId}-${key}`}};
  receipt(c);audit(c);return c;
}
async function applyPostulation(caseName,who,shopToken,adminToken,proposedDate,approval){
  const visitId=`QA_I3_${runId}_${caseName}_VISIT`,postId=`QA_I3_${runId}_${caseName}_APPLICATION`;
  const visitRef=queue(proj.collection('visits').doc(visitId)),postRef=queue(proj.collection('postulations').doc(postId));
  ensure(!(await visitRef.get()).exists&&!(await postRef.get()).exists,'SOURCE_FAILURE','QA_POSTULATION_ID_COLLISION');
  await visitRef.create({id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey:'2026-11',
    estado:'disponible',status:'disponible',shopperId:null,pais:'GT',sucursal:'QA SYNTHETIC DEV',
    assignmentSource:'platform',qaSynthetic:true,qaRunId:runId,version:1,
    canonicalFacets:{available:true,assigned:false,scheduled:false,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
  const create=op('application.create',postId,caseName+'-create','absent',
    {visitId,hrRowId:visitId,shopperId:who.shopperId,proposedDate,note:'QA EXCLUSIVAMENTE'});
  const made=await command(shopToken,create);
  ensure(made.ok===true&&made.providerAck===true&&made.status==='committed','PERSISTENCE_FAILURE','CREATE_'+caseName+':'+str(made.code));
  ensure((await postRef.get()).data()?.shopperId===who.shopperId,'PERSISTENCE_FAILURE','CREATE_READBACK_'+caseName);
  const createAgain=await command(shopToken,create);
  ensure(createAgain.ok===true&&createAgain.idempotentReplay===true&&Number(createAgain.providerWrites)===0,'PERSISTENCE_FAILURE','CREATE_IDEMPOTENCE_'+caseName);
  const decide=op('application.status.update',postId,caseName+'-decision',1,
    {status:approval?'aprobada':'rechazada',reason:'QA administracion DEV'});
  const notice=queue(tenant.collection('bulletins').doc('application-approval-'+receiptIdUnqueued(decide)));
  const approved=await command(adminToken,decide);
  ensure(approved.ok===true&&approved.providerAck===true&&approved.status==='committed','PERSISTENCE_FAILURE','DECISION_'+caseName+':'+str(approved.code));
  const p=(await postRef.get()).data(),v=(await visitRef.get()).data(),n=await notice.get();
  ensure(p?.status===(approval?'aprobada':'rechazada')&&p?.version===2,'PERSISTENCE_FAILURE','DECISION_READBACK_'+caseName);
  const [cr,dr,ca,da]=await Promise.all([receipt(create).get(),receipt(decide).get(),audit(create).get(),audit(decide).get()]);
  ensure(cr.exists&&dr.exists&&ca.exists&&da.exists,'PERSISTENCE_FAILURE','RECEIPT_AUDIT_'+caseName);
  if(approval){
    ensure(v.shopperId===who.shopperId&&v.assignmentSyncStatus==='pending_hr'&&v.approvedApplicationId===postId,
      'PERSISTENCE_FAILURE','VISIT_ASSIGNMENT_READBACK');
    const body=n.exists?n.data():{};
    ensure(n.exists&&body.operational===true&&body.eventKey==='postulation_approved_visit_assigned'&&
      body.actionRoute==='misvisitas'&&body.toRole==='shopper'&&body.entityId===visitId&&
      JSON.stringify(body.targetShopperIds)==='["'+who.shopperId+'"]'&&JSON.stringify(body.targetProjectIds)==='["'+projectId+'"]',
      'MAPPING_FAILURE','SINGLE_SHOPPER_NOTICE');
  }else{
    ensure(!n.exists&&v.shopperId==null&&v.estado==='disponible','MAPPING_FAILURE','REJECTED_MUST_NOT_ASSIGN_OR_NOTIFY');
  }
  const replay=await command(adminToken,decide);
  ensure(replay.ok===true&&replay.idempotentReplay===true&&Number(replay.providerWrites)===0,
    'PERSISTENCE_FAILURE','DECISION_IDEMPOTENCE_'+caseName);
  const persisted=await postRef.get();
  ensure(persisted.data()?.version===2,'PERSISTENCE_FAILURE','DUPLICATE_DECISION_VERSION_'+caseName);
  return {status:p.status,approval,ack:true,postulationReadback:true,assignmentReadback:approval,
    shopperTargetExact:approval?'single_shopper':'no_approval_notice',receiptsAndAudits:true,idempotentReplay:true};
}
function receiptIdUnqueued(command){return sha(`${tenantId}\0${projectId}\0${periodId}\0${command.idempotencyKey}`).slice(0,40)}
async function lessonProgress(who,firstToken,other,otherToken,key){
  const payload={origin:'base',audience:'shopper',courseId:progressCourse.courseId,revision:progressCourse.revision,lessonId:lesson.id,answers:[]};
  const c={version:'cxorbia-command-adapter-v1',commandType:'academy.progress.lesson.complete',entityType:'academyProgress',entityId:payload.courseId,
    tenantId,projectId,periodId,idempotencyKey:`qa-i3-${runId}-academy-sr1`,expectedVersion:0,
    authorization:{providerEnforcementRequired:true},payload};
  const keyDigest=sha([who.uid,c.idempotencyKey]),receiptKey='academy-progress-'+keyDigest.slice(0,40);
  queue(tenant.collection('commandReceipts').doc(receiptKey));queue(tenant.collection('academyAudit').doc(receiptKey));
  queue(tenant.collection('entityAuditTrail').doc(receiptKey));
  ensure(!(await tenant.collection('users').doc(who.uid).get()).data()?.academyProgress,'SOURCE_FAILURE','SYNTHETIC_USER_HAS_PROGRESS');
  const a=await command(firstToken,c);
  ensure(a.ok===true&&a.status==='committed'&&a.providerAck===true&&a.successUiAllowed===true&&a.providerWrites===4,
    'PERSISTENCE_FAILURE','ACADEMY_LESSON_ACK:'+str(a.code));
  const member=await tenant.collection('users').doc(who.uid).get(),state=member.data()?.academyProgress;
  ensure(state?.ownerUid===who.uid&&state.tenantId===tenantId&&Object.values(state.courses||{}).some(v=>v.courseId==='s_ruta'&&v.lessons?.sr1===100&&v.version===1),
    'PERSISTENCE_FAILURE','ACADEMY_PROGRESS_READBACK');
  const newSessionToken=await identityToken(who.uid,key);
  const replay=await command(newSessionToken,c);
  ensure(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0,
    'PERSISTENCE_FAILURE','ACADEMY_NEW_SESSION_REPLAY');
  ensure(!(await tenant.collection('users').doc(other.uid).get()).data()?.academyProgress,
    'MAPPING_FAILURE','ACADEMY_OTHER_LEARNER_PROGRESS_CONTAMINATED');
  const wrongAudience={...c,idempotencyKey:`qa-i3-${runId}-academy-wrong-role`,payload:{...c.payload,audience:'cliente'}};
  const denied=await command(otherToken,wrongAudience);
  ensure(denied.ok===false&&denied.providerWrites===0,'AUTH_FAILURE','ACADEMY_INVALID_AUDIENCE_NOT_BLOCKED');
  ensure(!(await tenant.collection('users').doc(other.uid).get()).data()?.academyProgress,
    'MAPPING_FAILURE','ACADEMY_WRONG_ROLE_MUTATED');
  const [rr,ar,tr]=await Promise.all([tenant.collection('commandReceipts').doc(receiptKey).get(),
    tenant.collection('academyAudit').doc(receiptKey).get(),tenant.collection('entityAuditTrail').doc(receiptKey).get()]);
  ensure(rr.exists&&ar.exists&&tr.exists,'PERSISTENCE_FAILURE','ACADEMY_RECEIPT_AUDIT');
  return {baseCourse:'s_ruta',lesson:'sr1',separateQaLearner:sha(who.uid).slice(0,12),
    providerAck:true,durableProgress:true,independentNewSession:true,idempotentReplay:true,
    secondLearnerUnchanged:true,otherAudienceDenied:true,auditsAndReceipts:true};
}
let error=null;
try{
  // Hosting does not proxy /health; the live scoped HR meta contract is the
  // correct DEV-only no-write runtime assertion for this endpoint.
  result.hrBefore=await hrMeta();ensure(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_BEFORE_MISMATCH');
  ensure((await proj.get()).exists,'SOURCE_FAILURE','PROJECT_MISSING');
  const key=await apiKey(),who=await qaIdentity('a',key),other=await qaIdentity('b',key);
  const [shopToken,otherToken]=await Promise.all([identityToken(who.uid,key),identityToken(other.uid,key)]);
  const members=await tenant.collection('users').get();
  const admins=members.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.active===true&&
    ['admin','super'].includes(str(u.role))&&u.authNamespace==='staff'&&
    (u.role==='super'||Array.isArray(u.projectIds)&&u.projectIds.includes(projectId)));
  ensure(admins.length>0,'AUTH_FAILURE','ADMIN_MISSING');
  const adminToken=await identityTokenStaff(admins[0].uid,key);
  result.academia=await lessonProgress(who,shopToken,other,otherToken,key);
  const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const proposedDate=new Date(localDate+'T12:00:00Z');proposedDate.setUTCDate(proposedDate.getUTCDate()+4);
  const when=proposedDate.toISOString().slice(0,10);
  result.postulaciones.approve=await applyPostulation('approved',who,shopToken,adminToken,when,true);
  result.postulaciones.reject=await applyPostulation('rejected',other,otherToken,adminToken,when,false);
  const targetBulletin=await tenant.collection('bulletins').doc('application-approval-'+receiptIdUnqueued(op('application.status.update',`QA_I3_${runId}_approved_APPLICATION`,'approved-decision',1,{status:'aprobada',reason:'QA administracion DEV'}))).get();
  ensure(targetBulletin.exists&&targetBulletin.data().targetShopperIds?.includes(who.shopperId)&&
    !targetBulletin.data().targetShopperIds?.includes(other.shopperId),'MAPPING_FAILURE','B7_OTHER_SHOPPER_NOT_EXCLUDED');
  result.postulaciones.otherShopperExcluded=true;
  result.hrAfter=await hrMeta();ensure(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_AFTER_MISMATCH');
}catch(e){error=str(e?.message||e);result.failure=error;result.classification=/^(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE|ENVIRONMENT_FAILURE)/.test(error)?error.split(':')[0]:'PERSISTENCE_FAILURE';}
finally{
  for(const ref of [...delDocs.values()].reverse()){
    try{await ref.delete();if((await ref.get()).exists)result.cleanup.residue.push(ref.path)}
    catch(e){result.cleanup.docFailures.push({path:ref.path,error:str(e?.code||e?.message)})}
  }
  for(const uid of [...createdAuth].reverse()){
    try{await auth.deleteUser(uid);result.qaIdentitiesDeleted++;
      try{await auth.getUser(uid);result.cleanup.residue.push('auth:qa-user-still-present')}
      catch(e){if(e?.code!=='auth/user-not-found')throw e}}
    catch(e){result.cleanup.authFailures.push({uidHash:sha(uid).slice(0,12),error:str(e?.code||e?.message)})}
  }
}
result.cleanup.ok=result.cleanup.docFailures.length===0&&result.cleanup.authFailures.length===0&&result.cleanup.residue.length===0&&result.qaIdentitiesCreated===result.qaIdentitiesDeleted;
result.decision=!error&&result.cleanup.ok&&result.academia.providerAck&&result.postulaciones.otherShopperExcluded&&result.hrAfter===result.hrBefore
  ?'PASS_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV':'HOLD_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV';
persist();console.log(JSON.stringify(result,null,2));
if(result.decision!=='PASS_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV')process.exitCode=2;

async function identityTokenStaff(uid,key){
  const member=await tenant.collection('users').doc(uid).get();
  ensure(member.exists,'AUTH_FAILURE','STAFF_MEMBER_NOT_FOUND');
  const user=await auth.getUser(uid),custom=await auth.createCustomToken(uid,user.customClaims||{});
  const r=await json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(r.http===200&&r.idToken,'AUTH_FAILURE','ADMIN_CUSTOM_TOKEN_EXCHANGE');
  const decoded=await auth.verifyIdToken(r.idToken,true);
  ensure(['admin','super'].includes(decoded.role)&&decoded.tenantId===tenantId&&decoded.authNamespace==='staff',
    'AUTH_FAILURE','ADMIN_ROLE_CLAIMS');return r.idToken;
}
