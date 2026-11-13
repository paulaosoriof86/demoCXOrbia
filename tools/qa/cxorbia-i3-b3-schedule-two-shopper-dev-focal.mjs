#!/usr/bin/env node
/* Phase A B3: one exact DEV-only, reversible, two-shopper scheduling provider E2E.
   Not a substitute for visual/human B3 acceptance. Never writes external HR,
   commercial visits, payment, production, or a permanent test profile. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const E=process.env;
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const host=str(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const project=str(E.PROJECT||'cxorbia-backend-dev');
const tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const source=str(E.FOCAL_SOURCE),expectedHr=str(E.EXPECTED_HR_REVISION);
const runId=str(E.GITHUB_RUN_ID).replace(/\D/g,'');
const out=str(E.B3_OUT||'.tmp/i3-b3-schedule-two-shopper');
if(!/^\d{6,}$/.test(runId)||!/^([a-f0-9]{40})$/.test(source)||!/^([a-f0-9]{64})$/.test(expectedHr))throw Error('SOURCE_FAILURE:B3_QA_GATE_ENV_REQUIRED');
if(E.CXORBIA_I3_B3_QA_WRITE_GATE!=='PAULA_AUTHORIZED_SYNTHETIC_DEV_ONLY')throw Error('SOURCE_FAILURE:B3_QA_WRITE_GATE_REQUIRED');
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:project});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),projectRef=tenant.collection('projects').doc(projectId);
const visitId=`QA_I3_B3_SCHEDULE_${runId}`;
const visitRef=projectRef.collection('visits').doc(visitId);
const result={schemaVersion:'cxorbia.i3.b3.schedule-two-shopper-dev.v2',decision:'HOLD',sourceSha:source,periodId,
  visitId,hrBefore:null,hrAfter:null,positiveAck:false,negativeDenied:false,idempotent:false,
  independentReadback:false,rescheduleRequestAck:false,rescheduleOtherDenied:false,
  reschedulePendingReadback:false,rescheduleIdempotent:false,cleaned:false,safety:{qaSyntheticVisitsCreated:0,qaSyntheticVisitsDeleted:0,hrWrites:0,
  commercialVisitsWritten:0,paymentWrites:0,authWrites:0,noticesCreated:0,noticesDeleted:0,builds:0,deploys:0,production:false},errors:[]};
const cleanup=[];const seen=new Set();
const track=(ref,kind)=>{if(!seen.has(ref.path)){seen.add(ref.path);cleanup.push({ref,kind});}};
const requireOk=(v,kind,why)=>{if(!v)throw Error(`${kind}:${why}`);};
const write=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
const receipt=cmd=>tenant.collection('commandReceipts').doc(sha(`${tenantId}\0${projectId}\0${periodId}\0${cmd.idempotencyKey}`).slice(0,40));
const audit=cmd=>tenant.collection('entityAuditTrail').doc(sha(`${cmd.idempotencyKey}\0${cmd.commandType}\0${cmd.entityId}`).slice(0,40));
const bulletin=cmd=>tenant.collection('bulletins').doc('visit-request-'+sha(`${tenantId}\0${projectId}\0${periodId}\0${cmd.idempotencyKey}`).slice(0,40));
async function getHrRevision(){
 const u=`${host}/api/${tenantId}/${projectId}/hr-live?format=meta&b3-qa=${runId}-${Date.now()}`;
 const r=await fetch(u,{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});
 requireOk(r.ok,'PROVIDER_FAILURE',`HR_META_HTTP_${r.status}`);
 const j=await r.json();requireOk(j.ok===true&&j.sourceSafe===true&&j.revisionStable===true&&j.hrWrites===false&&j.production===false,'PROVIDER_FAILURE','HR_META_CONTRACT');
 return str(j.revision);
}
async function apiKey(){
 const r=await fetch(host+'/__/firebase/init.json',{signal:AbortSignal.timeout(35000)});
 const j=await r.json();requireOk(r.ok&&!!str(j.apiKey),'ENVIRONMENT_FAILURE','FIREBASE_API_KEY');return str(j.apiKey);
}
async function tokenFor(member,key){
 const u=await auth.getUser(member.uid);requireOk(u.disabled!==true,'AUTH_FAILURE','SHOPPER_DISABLED');
 const custom=await auth.createCustomToken(member.uid,u.customClaims||{});
 const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(key)}`,
  {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true}),signal:AbortSignal.timeout(45000)});
 const j=await r.json().catch(()=>({}));requireOk(r.ok&&!!str(j.idToken),'AUTH_FAILURE',`TOKEN_EXCHANGE_${r.status}`);
 const c=await auth.verifyIdToken(j.idToken,true);
 requireOk(c.role==='shopper'&&c.authNamespace==='shopper'&&str(c.shopperId)===str(member.shopperId)&&str(c.tenantId)===tenantId&&arr(c.projectIds).map(str).includes(projectId),'AUTH_FAILURE','SHOPPER_EXACT_CLAIMS');
 return j.idToken;
}
function command(idempotencyKey){return {version:'cxorbia-command-adapter-v1',commandType:'visit.state.update',entityType:'visit',entityId:visitId,
 tenantId,projectId,periodId,idempotencyKey,expectedVersion:1,authorization:{providerEnforcementRequired:true,permission:'visit.state.update'},
 payload:{visitId,hrRowId:visitId,patch:{estado:'agendada',status:'agendada',agendada:'2026-11-25'}},
 audit:{reason:'i3-b3-schedule-synthetic-dev',correlationId:idempotencyKey}};}
function reschedule(idempotencyKey){return {version:'cxorbia-command-adapter-v1',commandType:'visit.reschedule',entityType:'visit',entityId:visitId,
 tenantId,projectId,periodId,idempotencyKey,expectedVersion:2,authorization:{providerEnforcementRequired:true,permission:'visit.reschedule'},
 payload:{visitId,newDate:'2026-11-27',reason:'QA B3 synthetic reschedule request'},
 audit:{reason:'i3-b3-reschedule-request-synthetic-dev',correlationId:idempotencyKey}};}
async function invoke(token,cmd){
 const r=await fetch(host+'/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token,'cache-control':'no-store'},body:JSON.stringify(cmd),signal:AbortSignal.timeout(60000)});
 return {http:r.status,...(await r.json().catch(()=>({})))};
}
try{
 result.hrBefore=await getHrRevision();requireOk(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_BEFORE');
 requireOk(!(await visitRef.get()).exists,'SOURCE_FAILURE','SYNTHETIC_ID_ALREADY_EXISTS');
 const members=(await tenant.collection('users').get()).docs.map(d=>({uid:d.id,...d.data()}))
  .filter(m=>m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&arr(m.projectIds).map(str).includes(projectId));
 const owner=members.filter(m=>str(m.shopperId)==='shopper_gt_1440137b73');
 requireOk(owner.length===1,'MAPPING_FAILURE',`EXACT_OWNER_MEMBERSHIP_${owner.length}`);
 const other=members.filter(m=>str(m.shopperId)!==str(owner[0].shopperId));
 requireOk(other.length>0,'MAPPING_FAILURE','OTHER_SHOPPER_REQUIRED');
 const key=await apiKey();const ownerToken=await tokenFor(owner[0],key);
 let otherToken=null,otherId=null;
 for(const m of other){
  const cross=await tenant.collection('shopperIdentityCrosswalk').doc(str(m.shopperId)).get();
  const canonical=str(cross.exists?(cross.data()?.canonicalShopperId||cross.data()?.shopperId):m.shopperId);
  if(canonical===str(owner[0].shopperId))continue;
  try{otherToken=await tokenFor(m,key);otherId=m.shopperId;break;}
  catch(e){if(!/AUTH_FAILURE:SHOPPER_DISABLED|AUTH_FAILURE:SHOPPER_EXACT_CLAIMS|auth\/user-not-found|AUTH_FAILURE:TOKEN_EXCHANGE/.test(str(e.message)))throw e;}
 }
 requireOk(!!otherToken,'AUTH_FAILURE','OTHER_SCOPED_SHOPPER_UNAVAILABLE');
 const projectSnap=await projectRef.get(),projectConfig=projectSnap.exists?(projectSnap.data()||{}):{};
 const route=projectConfig.operationalSource||projectConfig.routeSource||{};
 requireOk(str(typeof route==='string'?route:route.mode||route.sourceType||route.authority).toLowerCase()!=='internal','SOURCE_FAILURE','EXTERNAL_HR_PROJECT_EXPECTED');
 await visitRef.create({id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey:'2026-11',shopperId:owner[0].shopperId,
  estado:'asignada',status:'asignada',sucursal:'QA B3 DEV SCHEDULE',ciudad:'Guatemala',pais:'GT',quincena:'2Q',disponibleDesde:'2026-11-01',
  assignmentSource:'platform',assignmentSyncStatus:'synced',version:1,qaSynthetic:true,qaRunId:runId,
  canonicalFacets:{available:false,assigned:true,scheduled:false,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
 track(visitRef,'visits');result.safety.qaSyntheticVisitsCreated++;
 const denied=command(`qa-i3-b3-${runId}-different-shopper`);
 for(const x of [receipt(denied),audit(denied)])track(x,x.path.includes('commandReceipts')?'receipts':'audits');
 const wrong=await invoke(otherToken,denied);
 result.negativeDenied=wrong.ok!==true&&str(wrong.code).includes('OPS_VISIT_SHOPPER_SCOPE_DENIED');
 requireOk(result.negativeDenied,'AUTH_FAILURE',`OTHER_SHOPPER_WAS_NOT_DENIED_${str(wrong.code)}`);
 requireOk((await visitRef.get()).data().version===1,'PERSISTENCE_FAILURE','DENIED_ATTEMPT_CHANGED_VERSION');
 const positive=command(`qa-i3-b3-${runId}-owner-schedule`);
 for(const x of [receipt(positive),audit(positive)])track(x,x.path.includes('commandReceipts')?'receipts':'audits');
 const ok=await invoke(ownerToken,positive);
 result.positiveAck=ok.ok===true&&ok.providerAck===true&&ok.status==='committed'&&ok.successUiAllowed===true;
 requireOk(result.positiveAck,'PERSISTENCE_FAILURE',`OWNER_SCHEDULE_NO_ACK_${str(ok.code)}`);
 const row=(await visitRef.get()).data();
 result.independentReadback=row?.estado==='agendada'&&row?.agendada==='2026-11-25'&&row?.shopperId===owner[0].shopperId&&row?.version===2;
 requireOk(result.independentReadback,'PERSISTENCE_FAILURE','NEW_SESSION_READBACK_MISMATCH');
 const [rr,ar]=await Promise.all([receipt(positive).get(),audit(positive).get()]);
 requireOk(rr.exists&&ar.exists,'PERSISTENCE_FAILURE','RECEIPT_AUDIT_NOT_DURABLE');
 const replay=await invoke(ownerToken,positive);
 result.idempotent=replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true&&Number(replay.providerWrites||0)===0;
 requireOk(result.idempotent,'PERSISTENCE_FAILURE','REPLAY_NOT_IDEMPOTENT');
 requireOk((await visitRef.get()).data().version===2,'PERSISTENCE_FAILURE','REPLAY_CHANGED_STATE');
 const crossRequest=reschedule(`qa-i3-b3-${runId}-reschedule-different-shopper`);
 for(const x of [receipt(crossRequest),audit(crossRequest),bulletin(crossRequest)])track(x,x.path.includes('commandReceipts')?'receipts':x.path.includes('bulletins')?'notices':'audits');
 const wrongRequest=await invoke(otherToken,crossRequest);
 result.rescheduleOtherDenied=wrongRequest.ok!==true&&str(wrongRequest.code).includes('OPS_VISIT_SHOPPER_SCOPE_DENIED');
 requireOk(result.rescheduleOtherDenied,'AUTH_FAILURE',`OTHER_SHOPPER_RESCHEDULE_NOT_DENIED_${str(wrongRequest.code)}`);
 requireOk((await visitRef.get()).data().version===2,'PERSISTENCE_FAILURE','DENIED_RESCHEDULE_CHANGED_VERSION');
 const requested=reschedule(`qa-i3-b3-${runId}-owner-reschedule-request`);
 for(const x of [receipt(requested),audit(requested),bulletin(requested)])track(x,x.path.includes('commandReceipts')?'receipts':x.path.includes('bulletins')?'notices':'audits');
 const requestedAck=await invoke(ownerToken,requested);
 result.rescheduleRequestAck=requestedAck.ok===true&&requestedAck.providerAck===true&&requestedAck.status==='committed'&&requestedAck.successUiAllowed===true;
 requireOk(result.rescheduleRequestAck,'PERSISTENCE_FAILURE',`OWNER_RESCHEDULE_REQUEST_NO_ACK_${str(requestedAck.code)}`);
 const afterRequest=(await visitRef.get()).data();
 result.reschedulePendingReadback=afterRequest?.version===3&&afterRequest?.estado==='agendada'&&afterRequest?.agendada==='2026-11-25'
  &&afterRequest?.rescheduleRequest?.status==='pending_review'&&afterRequest?.rescheduleRequest?.newDate==='2026-11-27'
  &&afterRequest?.rescheduleRequest?.requestedByShopperId===owner[0].shopperId;
 requireOk(result.reschedulePendingReadback,'PERSISTENCE_FAILURE','RESCHEDULE_PENDING_READBACK_MISMATCH');
 const [requestReceipt,requestAudit,requestNotice]=await Promise.all([receipt(requested).get(),audit(requested).get(),bulletin(requested).get()]);
 result.safety.noticesCreated=Number(requestNotice.exists);
 requireOk(requestReceipt.exists&&requestAudit.exists&&requestNotice.exists,'PERSISTENCE_FAILURE','RESCHEDULE_RECEIPT_AUDIT_NOTICE_NOT_DURABLE');
 requireOk(requestNotice.data()?.toRole==='admin'&&requestNotice.data()?.entityId===visitId&&requestNotice.data()?.idempotencyKey===requested.idempotencyKey,'PERSISTENCE_FAILURE','RESCHEDULE_NOTICE_TARGET_MISMATCH');
 const requestedReplay=await invoke(ownerToken,requested);
 result.rescheduleIdempotent=requestedReplay.ok===true&&requestedReplay.providerAck===true&&requestedReplay.idempotentReplay===true&&Number(requestedReplay.providerWrites||0)===0;
 requireOk(result.rescheduleIdempotent,'PERSISTENCE_FAILURE','RESCHEDULE_REPLAY_NOT_IDEMPOTENT');
 requireOk((await visitRef.get()).data().version===3,'PERSISTENCE_FAILURE','RESCHEDULE_REPLAY_CHANGED_VERSION');
 result.otherShopperExcluded=str(otherId)!==str(row.shopperId);
 result.hrAfter=await getHrRevision();requireOk(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_AFTER');
}catch(error){result.errors.push(str(error?.message||error));}
finally{
 const errors=[];
 for(const item of cleanup.reverse()){
  try{const existed=item.kind==='notices'?(await item.ref.get()).exists:false;await item.ref.delete();if(item.kind==='visits')result.safety.qaSyntheticVisitsDeleted++;if(existed)result.safety.noticesDeleted++;}
  catch(e){errors.push(`${item.kind}:${str(e?.code||e?.message)}`);}
 }
 result.cleaned=errors.length===0&&result.safety.qaSyntheticVisitsCreated===result.safety.qaSyntheticVisitsDeleted&&result.safety.noticesCreated===1&&result.safety.noticesDeleted===1;
 if(errors.length)result.errors.push('CLEANUP_FAILURE:'+errors.join('|'));
 result.decision=result.errors.length===0&&result.negativeDenied&&result.positiveAck&&result.independentReadback&&result.idempotent
  &&result.rescheduleRequestAck&&result.rescheduleOtherDenied&&result.reschedulePendingReadback&&result.rescheduleIdempotent
  &&result.cleaned&&result.hrBefore===expectedHr&&result.hrAfter===expectedHr?'PASS_I3_B3_SYNTHETIC_SHOPPER_SCHEDULE_AND_RESCHEDULE_ACK_DEV':'HOLD_I3_B3_SYNTHETIC_SHOPPER_SCHEDULE_AND_RESCHEDULE_ACK_DEV';
 write();console.log(JSON.stringify({decision:result.decision,sourceSha:source,hrBefore:result.hrBefore,hrAfter:result.hrAfter,negativeDenied:result.negativeDenied,positiveAck:result.positiveAck,independentReadback:result.independentReadback,idempotent:result.idempotent,rescheduleRequestAck:result.rescheduleRequestAck,rescheduleOtherDenied:result.rescheduleOtherDenied,reschedulePendingReadback:result.reschedulePendingReadback,rescheduleIdempotent:result.rescheduleIdempotent,cleaned:result.cleaned,errors:result.errors,safety:result.safety}));
 if(result.decision!=='PASS_I3_B3_SYNTHETIC_SHOPPER_SCHEDULE_ACK_DEV')process.exitCode=2;
}
