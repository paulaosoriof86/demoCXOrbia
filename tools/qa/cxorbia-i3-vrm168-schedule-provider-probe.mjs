#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const E=process.env,PROJECT=E.PROJECT||'cxorbia-backend-dev',TENANT=E.TENANT_ID||'tya',PROJECT_ID=E.PROJECT_ID||'cinepolis';
const HOST=String(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const PERIOD_ID=E.VRM168_PERIOD_ID||'cinepolis-2026-10',SHOPPER_ID=E.VRM168_SHOPPER_ID||'shopper_gt_1440137b73';
const UID_HINT=String(E.VRM168_UID||'').trim(),RUN=String(E.GITHUB_RUN_ID||Date.now()),OUT=E.VRM168_OUT||E.OUT||'.tmp/vrm168-schedule-probe';
fs.mkdirSync(OUT,{recursive:true}); if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),str=v=>String(v==null?'':v).trim();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const tenantDateKey=(timezone='America/Guatemala')=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return `${parts.year}-${parts.month}-${parts.day}`;};
const SCHEDULE_DATE=tenantDateKey();
const tenant=db.collection('tenants').doc(TENANT),project=tenant.collection('projects').doc(PROJECT_ID);
let UID='';
async function resolveActiveCanonicalPrincipal(){
  const snap=await tenant.collection('users').where('shopperId','==',SHOPPER_ID).get();
  const memberships=snap.docs.map(d=>({uid:d.id,...(d.data()||{})})).filter(row=>
    row.active===true&&str(row.role)==='shopper'&&str(row.authNamespace)==='shopper'&&
    Array.isArray(row.projectIds)&&row.projectIds.map(str).includes(PROJECT_ID)
  );
  if(memberships.length!==1)throw new Error('AUTH_FAILURE:VRM168_ACTIVE_CANONICAL_MEMBERSHIP_COUNT_'+memberships.length);
  const member=memberships[0];
  if(UID_HINT&&UID_HINT!==member.uid)throw new Error('AUTH_FAILURE:VRM168_UID_HINT_STALE');
  const user=await auth.getUser(member.uid);
  if(user.disabled===true)throw new Error('AUTH_FAILURE:VRM168_ACTIVE_CANONICAL_AUTH_DISABLED');
  return {uid:member.uid,user,member};
}
const visitId='QA_VRM168_'+RUN,idem='vrm168.schedule.synthetic:'+RUN;
const receiptId=sha(TENANT+'\0'+PROJECT_ID+'\0'+PERIOD_ID+'\0'+idem).slice(0,40);
const auditId=sha(idem+'\0visit.state.update\0'+visitId).slice(0,40);
const visitRef=project.collection('visits').doc(visitId),receiptRef=tenant.collection('commandReceipts').doc(receiptId),auditRef=tenant.collection('entityAuditTrail').doc(auditId);
let created=false,result=null,before=null,after=null,claims=null,cleanup={visit:false,receipt:false,audit:false};
async function apiKey(){const r=await fetch(HOST+'/__/firebase/init.json?ts='+Date.now(),{cache:'no-store'});const j=await r.json();if(!r.ok||!str(j.apiKey))throw new Error('ENVIRONMENT_FAILURE:FIREBASE_INIT_'+r.status);return str(j.apiKey);}
async function exchange(token,key){const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,returnSecureToken:true})});const j=await r.json().catch(()=>({}));if(!r.ok||!j.idToken)throw new Error('AUTH_FAILURE:TOKEN_EXCHANGE_'+r.status);return j.idToken;}
try{
  const principal=await resolveActiveCanonicalPrincipal(); UID=principal.uid; const user=principal.user,member=principal.member;
  if(member.active!==true||str(member.shopperId)!==SHOPPER_ID)throw new Error('AUTH_FAILURE:MEMBERSHIP_SCOPE');
  const custom=await auth.createCustomToken(UID,user.customClaims||{}),idToken=await exchange(custom,await apiKey()); claims=await auth.verifyIdToken(idToken,true);
  const required={tenantId:TENANT,role:'shopper',authNamespace:'shopper',shopperId:SHOPPER_ID};
  for(const [k,v] of Object.entries(required))if(str(claims[k])!==v)throw new Error('AUTH_FAILURE:CLAIM_'+k);
  if(!Array.isArray(claims.projectIds)||!claims.projectIds.map(str).includes(PROJECT_ID))throw new Error('AUTH_FAILURE:CLAIM_PROJECT');
  await visitRef.set({id:visitId,visitId,hrRowId:visitId,tenantId:TENANT,projectId:PROJECT_ID,periodId:PERIOD_ID,periodKey:'2026-10',sucursal:'QA VRM-168',pais:'GT',estado:'asignada',status:'asignada',shopperId:SHOPPER_ID,assignmentSource:'platform',assignmentSyncStatus:'synced',disponibleDesde:SCHEDULE_DATE,agendada:null,realizada:null,version:1,canonicalFacets:{available:false,assigned:true,scheduled:false,realized:false,questionnaire:false,submitted:false,liquidationConfirmed:false,paymentConfirmed:false,cancelled:false},qaSynthetic:true,qaRunId:RUN,createdAt:new Date().toISOString()},{merge:false}); created=true;
  before=(await visitRef.get()).data()||null;
  const command={version:'cxorbia-command-adapter-v1',commandType:'visit.state.update',entityType:'visit',entityId:visitId,tenantId:TENANT,projectId:PROJECT_ID,periodId:PERIOD_ID,actor:{actorId:UID,role:'shopper',projectIds:[PROJECT_ID],shopperId:SHOPPER_ID},expectedVersion:'source-current',idempotencyKey:idem,payload:{periodId:PERIOD_ID,visitId,hrRowId:visitId,shopperId:SHOPPER_ID,patch:{estado:'agendada',agendada:SCHEDULE_DATE}},source:'vrm168-synthetic-dev',authorization:{providerEnforcementRequired:true,permission:'visit.schedule'},audit:{reason:'VRM-168 exact provider scheduling probe',correlationId:idem,clientVersion:'diagnostic'}};
  const response=await fetch(HOST+'/v1/cxorbia/commands',{method:'POST',cache:'no-store',headers:{'content-type':'application/json','authorization':'Bearer '+idToken,'cache-control':'no-store'},body:JSON.stringify(command)});
  const body=await response.json().catch(()=>({}));result={httpStatus:response.status,...body};after=(await visitRef.get()).data()||null;
} finally {
  try{await visitRef.delete();cleanup.visit=true}catch{}
  try{await receiptRef.delete();cleanup.receipt=true}catch{}
  try{await auditRef.delete();cleanup.audit=true}catch{}
}
const decision=result?.ok===true&&result?.status==='committed'&&result?.providerAck===true&&after?.estado==='agendada'?'PASS_VRM168_PROVIDER_SCHEDULE_PATH':'FAIL_VRM168_PROVIDER_SCHEDULE_PATH';
const out={decision,principalResolution:{mode:'unique_active_canonical_membership',uid:UID,shopperId:SHOPPER_ID,hintProvided:!!UID_HINT},uid:UID,shopperId:SHOPPER_ID,claims:{tenantId:claims?.tenantId||null,role:claims?.role||null,authNamespace:claims?.authNamespace||null,shopperId:claims?.shopperId||null,projectIds:claims?.projectIds||[]},before:before?{estado:before.estado,version:before.version,periodId:before.periodId,shopperId:before.shopperId}:null,result,after:after?{estado:after.estado,version:after.version,agendada:after.agendada,periodId:after.periodId,shopperId:after.shopperId}:null,cleanup,writes:created?1:0,hrWrites:0,production:false};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify(out,null,2));
if(decision!=='PASS_VRM168_PROVIDER_SCHEDULE_PATH'||!cleanup.visit||!cleanup.receipt||!cleanup.audit)process.exitCode=2;
