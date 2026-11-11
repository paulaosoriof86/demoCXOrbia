#!/usr/bin/env node
/* B7 exact missing edge: Shopper reservation -> Admin cross -> assigned visit.
   DEV-only, one disposable Firestore visit and reservation, no HR write. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const E=process.env,str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const hash=s=>crypto.createHash('sha256').update(String(s)).digest('hex');
const host=str(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const project=str(E.PROJECT||'cxorbia-backend-dev'),source=str(E.FOCAL_SOURCE),expectedHr=str(E.EXPECTED_HR_REVISION);
const runId=str(E.GITHUB_RUN_ID).replace(/\D/g,'');
const out=str(E.B7_OUT||'.tmp/i3-b7-reservation-to-visit');
if(!/^\d{6,}$/.test(runId)||!/^([a-f0-9]{40})$/.test(source)||!/^([a-f0-9]{64})$/.test(expectedHr))throw Error('SOURCE_FAILURE:B7_GATED_ENV_REQUIRED');
if(E.CXORBIA_I3_B7_RESERVATION_QA_WRITE_GATE!=='PAULA_AUTHORIZED_SYNTHETIC_DEV_ONLY')throw Error('SOURCE_FAILURE:B7_QA_WRITE_GATE_REQUIRED');
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:project});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),projectRef=tenant.collection('projects').doc(projectId);
const visitId='QA_I3_B7_RESV_VISIT_'+runId, reservationId='QA_I3_B7_RESV_'+runId;
const visitRef=projectRef.collection('visits').doc(visitId),reservationRef=projectRef.collection('reservations').doc(reservationId);
const result={schemaVersion:'cxorbia.i3.b7.reservation-to-visit-dev.v1',decision:'HOLD',sourceSha:source,periodId,
  visitId,reservationId,hrBefore:null,hrAfter:null,shopperReserveAck:false,adminCrossAck:false,
  visitAssignedPersisted:false,reservationCrossedPersisted:false,receiptAuditPersisted:false,
  idempotentReplay:false,cleaned:false,errors:[],safety:{syntheticVisitsCreated:0,syntheticVisitsDeleted:0,
   syntheticReservationsCreated:0,syntheticReservationsDeleted:0,hrWrites:0,commercialVisitsWritten:0,
   paymentsWritten:0,authWrites:0,builds:0,deploys:0,production:false}};
const cleanup=[],seen=new Set();
const track=(ref,kind)=>{if(!seen.has(ref.path)){seen.add(ref.path);cleanup.push({ref,kind});}};
const need=(ok,type,why)=>{if(!ok)throw Error(type+':'+why);};
const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
const receipt=c=>tenant.collection('commandReceipts').doc(hash(tenantId+'\0'+projectId+'\0'+periodId+'\0'+c.idempotencyKey).slice(0,40));
const audit=c=>tenant.collection('entityAuditTrail').doc(hash(c.idempotencyKey+'\0'+c.commandType+'\0'+c.entityId).slice(0,40));
async function hrRevision(){
 const u=host+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&b7-resv='+runId+'-'+Date.now();
 const r=await fetch(u,{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});
 need(r.ok,'PROVIDER_FAILURE','HR_META_HTTP_'+r.status);
 const j=await r.json();need(j.ok===true&&j.sourceSafe===true&&j.revisionStable===true&&j.hrWrites===false&&j.production===false,'PROVIDER_FAILURE','HR_META_CONTRACT');
 return str(j.revision);
}
async function apiKey(){
 const r=await fetch(host+'/__/firebase/init.json',{signal:AbortSignal.timeout(35000)}),j=await r.json();
 need(r.ok&&!!str(j.apiKey),'ENVIRONMENT_FAILURE','DEV_FIREBASE_API_KEY');return str(j.apiKey);
}
async function tokenFor(member,key){
 const u=await auth.getUser(member.uid);need(u.disabled!==true,'AUTH_FAILURE','USER_DISABLED');
 const custom=await auth.createCustomToken(member.uid,u.customClaims||{});
 const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
  {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true}),signal:AbortSignal.timeout(45000)});
 const j=await r.json().catch(()=>({}));need(r.ok&&!!str(j.idToken),'AUTH_FAILURE','TOKEN_EXCHANGE_'+r.status);
 const c=await auth.verifyIdToken(j.idToken,true);
 need(str(c.role)===str(member.role)&&str(c.authNamespace)===str(member.authNamespace)&&str(c.tenantId)===tenantId&&
  (c.role==='super'||arr(c.projectIds).map(str).includes(projectId)),'AUTH_FAILURE','EXACT_CLAIMS');
 return j.idToken;
}
function cmd(commandType,entityId,version,key,payload){
 return {version:'cxorbia-command-adapter-v1',commandType,entityType:'reservation',entityId,
  tenantId,projectId,periodId,idempotencyKey:key,expectedVersion:version,
  authorization:{providerEnforcementRequired:true,permission:commandType},payload,
  audit:{reason:'qa-i3-b7-reservation-visit-synthetic-dev',correlationId:key}};
}
async function invoke(token,c){
 const r=await fetch(host+'/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json',
  authorization:'Bearer '+token,'cache-control':'no-store'},body:JSON.stringify(c),signal:AbortSignal.timeout(60000)});
 return {http:r.status,...(await r.json().catch(()=>({})))};
}
try{
 result.hrBefore=await hrRevision();need(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_BEFORE');
 const [v0,r0,projectSnap,membersSnap]=await Promise.all([visitRef.get(),reservationRef.get(),projectRef.get(),tenant.collection('users').get()]);
 need(!v0.exists&&!r0.exists,'SOURCE_FAILURE','SYNTHETIC_ID_COLLISION');
 need(projectSnap.exists,'SOURCE_FAILURE','PROJECT_MISSING');
 const config=projectSnap.data()||{},route=config.operationalSource||config.routeSource||{};
 need(str(typeof route==='string'?route:route.mode||route.sourceType||route.authority).toLowerCase()!=='internal','SOURCE_FAILURE','EXTERNAL_HR_EXPECTED');
 const members=membersSnap.docs.map(d=>({uid:d.id,...d.data()}));
 const shopper=members.filter(m=>m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&
  str(m.shopperId)==='shopper_gt_1440137b73'&&arr(m.projectIds).map(str).includes(projectId));
 const admins=members.filter(m=>m.active===true&&['admin','super'].includes(str(m.role))&&m.authNamespace==='staff'&&
  (m.role==='super'||arr(m.projectIds).map(str).includes(projectId)));
 need(shopper.length===1&&admins.length>0,'AUTH_FAILURE','SCOPED_SHOPPER_AND_ADMIN_REQUIRED');
 const key=await apiKey();
 const [shopperToken,adminToken]=await Promise.all([tokenFor(shopper[0],key),tokenFor(admins[0],key)]);
 const shopperId=str(shopper[0].shopperId),branchId='qa-b7-reserva|guatemala';
 await visitRef.create({id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey:'2026-11',
  sucursal:'QA B7 RESERVA',ciudad:'Guatemala',pais:'GT',quincena:'2Q',disponibleDesde:'2026-11-25',
  shopperId:null,estado:'disponible',status:'disponible',assignmentSource:'hr',assignmentSyncStatus:'synced',
  qaSynthetic:true,qaRunId:runId,hrSourceRevision:expectedHr,version:1,
  canonicalFacets:{available:true,assigned:false,scheduled:false,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
 track(visitRef,'visits');result.safety.syntheticVisitsCreated++;
 const request=cmd('reservation.create',reservationId,'absent','qa-i3-b7-resv-'+runId+'-shopper',
  {shopperId,branchId,visitId,hrRowId:visitId,sourceRevision:expectedHr,status:'solicitada'});
 const decide=cmd('reservation.status.update',reservationId,1,'qa-i3-b7-resv-'+runId+'-admin',
  {status:'cruzada',shopperId,visitId,hrRowId:visitId});
 track(reservationRef,'reservations');
 for(const c of [request,decide]){track(receipt(c),'receipts');track(audit(c),'audits');}
 const first=await invoke(shopperToken,request);
 result.shopperReserveAck=first.ok===true&&first.providerAck===true&&first.status==='committed'&&first.successUiAllowed===true;
 need(result.shopperReserveAck,'PERSISTENCE_FAILURE','SHOPPER_RESERVATION_ACK_'+str(first.code));
 result.safety.syntheticReservationsCreated++;
 const requested=(await reservationRef.get()).data();
 need(requested?.status==='solicitada'&&requested.visitId===visitId&&requested.shopperId===shopperId,'PERSISTENCE_FAILURE','RESERVATION_LINK_READBACK');
 const second=await invoke(adminToken,decide);
 result.adminCrossAck=second.ok===true&&second.providerAck===true&&second.status==='committed'&&second.successUiAllowed===true;
 need(result.adminCrossAck,'PERSISTENCE_FAILURE','ADMIN_CROSS_ACK_'+str(second.code));
 const [assigned,crossed]=await Promise.all([visitRef.get(),reservationRef.get()]);
 const a=assigned.data(),c=crossed.data();
 result.visitAssignedPersisted=a?.shopperId===shopperId&&a?.estado==='asignada'&&a?.status==='asignada'&&
  a?.assignmentSource==='platform'&&a?.assignmentSyncStatus==='pending_hr'&&a?.version===2;
 result.reservationCrossedPersisted=c?.status==='cruzada'&&c?.estado==='cruzada'&&c?.shopperId===shopperId&&
  c?.visitId===visitId&&c?.version===2;
 need(result.visitAssignedPersisted&&result.reservationCrossedPersisted,'PERSISTENCE_FAILURE','RESERVATION_TO_VISIT_LINK_LOST');
 const [r1,r2,a1,a2]=await Promise.all([receipt(request).get(),receipt(decide).get(),audit(request).get(),audit(decide).get()]);
 result.receiptAuditPersisted=r1.exists&&r2.exists&&a1.exists&&a2.exists;
 need(result.receiptAuditPersisted,'PERSISTENCE_FAILURE','DURABLE_RECEIPT_AUDIT_MISSING');
 const replay=await invoke(adminToken,decide);
 result.idempotentReplay=replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true&&Number(replay.providerWrites||0)===0;
 need(result.idempotentReplay,'PERSISTENCE_FAILURE','ADMIN_CROSS_NOT_IDEMPOTENT');
 need((await visitRef.get()).data().version===2&&(await reservationRef.get()).data().version===2,'PERSISTENCE_FAILURE','REPLAY_CHANGED_VERSION');
 result.hrAfter=await hrRevision();need(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_AFTER');
}catch(e){result.errors.push(str(e?.message||e));}
finally{
 const errors=[];
 for(const item of cleanup.reverse()){
  try{await item.ref.delete();if(item.kind==='visits')result.safety.syntheticVisitsDeleted++;if(item.kind==='reservations'&&result.safety.syntheticReservationsCreated>0)result.safety.syntheticReservationsDeleted++;}
  catch(e){errors.push(item.kind+':'+str(e?.message||e));}
 }
 result.cleaned=errors.length===0&&result.safety.syntheticVisitsCreated===result.safety.syntheticVisitsDeleted&&
  result.safety.syntheticReservationsCreated===result.safety.syntheticReservationsDeleted;
 if(errors.length)result.errors.push('CLEANUP_FAILURE:'+errors.join('|'));
 result.decision=result.errors.length===0&&result.shopperReserveAck&&result.adminCrossAck&&result.visitAssignedPersisted&&
  result.reservationCrossedPersisted&&result.receiptAuditPersisted&&result.idempotentReplay&&result.cleaned&&
  result.hrBefore===expectedHr&&result.hrAfter===expectedHr?'PASS_I3_B7_RESERVATION_TO_VISIT_TWO_ROLE_DEV':'HOLD_I3_B7_RESERVATION_TO_VISIT_TWO_ROLE_DEV';
 save();console.log(JSON.stringify({decision:result.decision,sourceSha:source,hrBefore:result.hrBefore,hrAfter:result.hrAfter,
  shopperReserveAck:result.shopperReserveAck,adminCrossAck:result.adminCrossAck,visitAssignedPersisted:result.visitAssignedPersisted,
  reservationCrossedPersisted:result.reservationCrossedPersisted,receiptAuditPersisted:result.receiptAuditPersisted,
  idempotentReplay:result.idempotentReplay,cleaned:result.cleaned,errors:result.errors,safety:result.safety}));
 if(result.decision!=='PASS_I3_B7_RESERVATION_TO_VISIT_TWO_ROLE_DEV')process.exitCode=2;
}
