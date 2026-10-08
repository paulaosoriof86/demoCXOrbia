#!/usr/bin/env node
/* I3 B7 focal DEV ONLY: real authenticated two-role commands on disposable synthetic visits.
   Uses ONE existing DEV artifact, no build, HR writes, payments or production. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const E=process.env,str=v=>String(v??'').trim(),arr=v=>Array.isArray(v)?v:[];
const host=String(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const project=E.PROJECT||'cxorbia-backend-dev',tenantId=E.TENANT_ID||'tya',projectId=E.PROJECT_ID||'cinepolis';
const shopperId=E.B7_SHOPPER_ID||'shopper_gt_1440137b73',periodId=E.B7_PERIOD_ID||'cinepolis-2026-10';
const runId=String(E.GITHUB_RUN_ID||'').replace(/\D/g,''),sourceSha=str(E.FOCAL_SOURCE),expectedHr=str(E.EXPECTED_HR_REVISION);
const out=E.B7_OUT||'.tmp/i3-b7-exact-two-role-live';
if(!/^\d{6,}$/.test(runId)||!/^[a-f0-9]{64}$/.test(expectedHr)||!/^[a-f0-9]{40}$/.test(sourceSha))throw new Error('SOURCE_FAILURE:B7_FOCAL_ENV_INCOMPLETE');
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:project});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),projectRef=tenant.collection('projects').doc(projectId);
const hash=x=>crypto.createHash('sha256').update(String(x),'utf8').digest('hex');
const result={schemaVersion:'cxorbia.i3.b7.exact-two-role-live.v1',decision:'HOLD',classification:null,sourceSha,periodId,
  hrRevisionExpected:expectedHr,hrBefore:null,hrAfter:null,providerAck:false,cases:[],cleanup:{visits:true,receipts:true,audits:true,bulletins:true},
  cleanupCount:0,production:false,hrWrites:0,paymentWrites:0,builds:0,deploys:0};
const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
const requireOk=(v,category,code)=>{if(!v)throw new Error(category+':'+code)};
const todo=[],seen=new Set();
function add(ref,kind){if(seen.has(ref.path))return;seen.add(ref.path);todo.push({ref,kind});}
function receipt(c){return tenant.collection('commandReceipts').doc(hash(tenantId+'\0'+projectId+'\0'+periodId+'\0'+c.idempotencyKey).slice(0,40))}
function audit(c){return tenant.collection('entityAuditTrail').doc(hash(c.idempotencyKey+'\0'+c.commandType+'\0'+c.entityId).slice(0,40))}
function bulletin(c){return tenant.collection('bulletins').doc('visit-request-'+hash(tenantId+'\0'+projectId+'\0'+periodId+'\0'+c.idempotencyKey).slice(0,40))}
async function hrRevision(){
 const url=host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&b7='+runId+'-'+Date.now();
 const r=await fetch(url,{headers:{'cache-control':'no-cache, no-store, max-age=0'},signal:AbortSignal.timeout(120000)});
 requireOk(r.ok,'PROVIDER_FAILURE','HR_META_HTTP_'+r.status);
 const j=await r.json();requireOk(j.ok===true&&j.sourceSafe===true&&j.revisionStable===true&&j.hrWrites===false&&j.production===false,'PROVIDER_FAILURE','HR_META_CONTRACT');
 return str(j.revision);
}
async function firebaseKey(){
 const r=await fetch(host+'/__/firebase/init.json',{headers:{'cache-control':'no-store'},signal:AbortSignal.timeout(40000)});
 requireOk(r.ok,'ENVIRONMENT_FAILURE','FIREBASE_INIT_HTTP_'+r.status);
 const j=await r.json();requireOk(!!str(j.apiKey),'ENVIRONMENT_FAILURE','FIREBASE_KEY_MISSING');
 return str(j.apiKey);
}
async function tokenFor(uid,key){
 const u=await auth.getUser(uid);requireOk(u.disabled!==true,'AUTH_FAILURE','PRINCIPAL_DISABLED');
 const custom=await auth.createCustomToken(uid,u.customClaims||{});
 const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
  {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true}),signal:AbortSignal.timeout(45000)});
 const j=await response.json().catch(()=>({}));
 requireOk(response.ok&&!!str(j.idToken),'AUTH_FAILURE','TOKEN_EXCHANGE_'+response.status);
 const claims=await auth.verifyIdToken(j.idToken,true);
 requireOk(str(claims.tenantId)===tenantId,'AUTH_FAILURE','TENANT_CLAIM');
 requireOk(Array.isArray(claims.projectIds)&&claims.projectIds.map(str).includes(projectId),'AUTH_FAILURE','PROJECT_CLAIM');
 return {token:j.idToken,claims};
}
function cmd(vid,version,key,payload){return {
 version:'cxorbia-command-adapter-v1',commandType:'visit.cancel',entityType:'visit',entityId:vid,
 tenantId,projectId,periodId,idempotencyKey:key,expectedVersion:version,
 authorization:{providerEnforcementRequired:true,permission:'visit.cancel'},
 payload:{visitId:vid,hrRowId:vid,shopperId,...payload},
 audit:{reason:'i3-b7-focal-synthetic-dev',correlationId:key}
}}
async function invoke(token,command){
 const response=await fetch(host+'/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token,'cache-control':'no-store'},
 body:JSON.stringify(command),signal:AbortSignal.timeout(60000)});
 const j=await response.json().catch(()=>({}));
 return {http:response.status,...j};
}
async function exercise(decision,shopperToken,adminToken){
 const vid='QA_I3_B7_'+decision+'_'+runId, ref=projectRef.collection('visits').doc(vid);
 const request=cmd(vid,1,'qa-i3-b7-'+runId+'-'+decision+'-req',{requestOnly:true,reason:'QA cancel request '+decision});
 const decide=cmd(vid,2,'qa-i3-b7-'+runId+'-'+decision+'-dec',{decision,reason:'QA administrative decision '+decision});
 add(ref,'visits');
 for(const c of [request,decide]){add(receipt(c),'receipts');add(audit(c),'audits');add(bulletin(c),'bulletins');}
 requireOk(!(await ref.get()).exists,'SOURCE_FAILURE','QA_VISIT_COLLISION');
 await ref.create({id:vid,visitId:vid,hrRowId:vid,tenantId,projectId,periodId,periodKey:periodId.replace(/^.*-(20\d{2}-\d{2})$/,'$1'),
  shopperId,estado:'agendada',status:'agendada',agendada:'2026-10-09',sucursal:'QA B7 VISIT',pais:'GT',
  assignmentSource:'platform',assignmentSyncStatus:'synced',qaSynthetic:true,qaRunId:runId,version:1,
  canonicalFacets:{available:false,assigned:true,scheduled:true,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
 const a=await invoke(shopperToken,request);
 requireOk(a.ok===true&&a.providerAck===true&&a.status==='committed'&&a.successUiAllowed===true,'PERSISTENCE_FAILURE','SHOPPER_REQUEST_ACK_'+decision+':'+str(a.code));
 let row=(await ref.get()).data();
 requireOk(row.cancelRequest?.status==='pending_review'&&row.shopperId===shopperId&&row.estado==='agendada','PERSISTENCE_FAILURE','REQUEST_READBACK_'+decision);
 const b=await invoke(adminToken,decide);
 requireOk(b.ok===true&&b.providerAck===true&&b.status==='committed'&&b.successUiAllowed===true,'PERSISTENCE_FAILURE','ADMIN_DECISION_ACK_'+decision+':'+str(b.code));
 row=(await ref.get()).data();
 requireOk(row.cancelRequest?.status===(decision==='approved'?'approved_pending_hr':'rejected'),'PERSISTENCE_FAILURE','DECISION_STATUS_'+decision);
 requireOk(row.shopperId===shopperId&&row.estado==='agendada'&&row.canonicalFacets?.available===false,'MAPPING_FAILURE','EXTERNAL_HR_UNAUTHORIZED_STATE_'+decision);
 requireOk(row.cancelRequest?.reason===request.payload.reason&&!!str(row.cancelRequest?.decidedBy),'PERSISTENCE_FAILURE','REQUEST_LINEAGE_'+decision);
 const [r1,r2,a1,a2,n1,n2]=await Promise.all([receipt(request).get(),receipt(decide).get(),audit(request).get(),audit(decide).get(),bulletin(request).get(),bulletin(decide).get()]);
 requireOk(r1.exists&&r2.exists&&a1.exists&&a2.exists&&n1.exists&&n2.exists,'PERSISTENCE_FAILURE','ATOMIC_RECEIPT_AUDIT_NOTIFICATION_'+decision);
 requireOk(n1.data().toRole==='admin'&&n2.data().toRole==='shopper'&&arr(n2.data().targetShopperIds).includes(shopperId),
  'MAPPING_FAILURE','SHOPPER_NOTICE_TARGET_'+decision);
 const replay=await invoke(adminToken,decide);
 requireOk(replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true&&Number(replay.providerWrites||0)===0,
   'PERSISTENCE_FAILURE','IDEMPOTENT_REPLAY_'+decision);
 requireOk((await ref.get()).data().version===row.version,'PERSISTENCE_FAILURE','REPLAY_VERSION_DRIFT_'+decision);
 return {decision,status:row.cancelRequest.status,providerAck:true,readback:true,notification:true,idempotentReplay:true,hrStatePreserved:true,available:false};
}
let failure=null;
try{
 result.hrBefore=await hrRevision();
 requireOk(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_REVISION_BEFORE_DRIFT');
 const [staffSnap,projectSnap]=await Promise.all([tenant.collection('users').get(),projectRef.get()]);
 requireOk(projectSnap.exists,'SOURCE_FAILURE','PROJECT_NOT_FOUND');
 const config=projectSnap.data()||{},route=config.operationalSource||config.routeSource||{};
 const mode=str(typeof route==='string'?route:route.mode||route.sourceType||route.authority).toLowerCase();
 requireOk(mode!=='internal','SOURCE_FAILURE','EXTERNAL_HR_CONTRACT_EXPECTED');
 const members=staffSnap.docs.map(x=>({uid:x.id,...(x.data()||{})}));
 const shoppers=members.filter(x=>x.active===true&&x.role==='shopper'&&x.authNamespace==='shopper'&&str(x.shopperId)===shopperId&&arr(x.projectIds).map(str).includes(projectId));
 requireOk(shoppers.length===1,'AUTH_FAILURE','EXACT_SHOPPER_COUNT_'+shoppers.length);
 const admins=members.filter(x=>x.active===true&&['admin','super'].includes(str(x.role))&&x.authNamespace==='staff'&&
    (x.role==='super'||arr(x.projectIds).map(str).includes(projectId)));
 requireOk(admins.length>0,'AUTH_FAILURE','ADMIN_NOT_FOUND');
 const key=await firebaseKey();
 const [shopAuth,adminAuth]=await Promise.all([tokenFor(shoppers[0].uid,key),tokenFor(admins[0].uid,key)]);
 requireOk(shopAuth.claims.role==='shopper'&&shopAuth.claims.authNamespace==='shopper'&&str(shopAuth.claims.shopperId)===shopperId,'AUTH_FAILURE','SHOPPER_CLAIMS');
 requireOk(['admin','super'].includes(str(adminAuth.claims.role))&&adminAuth.claims.authNamespace==='staff','AUTH_FAILURE','ADMIN_CLAIMS');
 result.cases.push(await exercise('approved',shopAuth.token,adminAuth.token));
 result.cases.push(await exercise('rejected',shopAuth.token,adminAuth.token));
 result.providerAck=true;
 result.hrAfter=await hrRevision();
 requireOk(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_REVISION_AFTER_DRIFT');
}catch(error){
 failure=str(error?.message||error);result.failure=failure;
 result.classification=/^(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE|ENVIRONMENT_FAILURE)/.test(failure)?
    failure.split(':')[0]:'PERSISTENCE_FAILURE';
}finally{
 for(const {ref,kind} of [...todo].reverse()){
   try{await ref.delete()}catch(error){result.cleanup[kind]=false;result.cleanupError=kind+':'+str(error?.code||error?.message)}
 }
}
result.cleanupCount=todo.length;
result.decision=(!failure&&result.providerAck&&result.cases.length===2&&result.hrAfter===expectedHr&&Object.values(result.cleanup).every(Boolean))
  ?'PASS_I3_B7_TWO_ROLE_DECISION_LIVE_DEV':'HOLD_I3_B7_TWO_ROLE_DECISION_LIVE_DEV';
save();console.log(JSON.stringify(result,null,2));
if(result.decision!=='PASS_I3_B7_TWO_ROLE_DECISION_LIVE_DEV')process.exitCode=2;