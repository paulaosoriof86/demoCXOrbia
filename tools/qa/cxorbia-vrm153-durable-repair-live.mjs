#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const HOST=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const OUT=process.env.OUT||'.tmp/vrm151-durable-reconciliation';
const DRY_RESULT=process.env.DRY_RESULT||OUT+'/dry/result.json';
const TENANT=process.env.TENANT_ID||'tya';
const PROGRAM=process.env.PROJECT_ID||'cinepolis';
const SOURCE=String(process.env.SOURCE_SHA||'');
const TREE=String(process.env.SOURCE_TREE||'');
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
fs.mkdirSync(OUT,{recursive:true});

const dry=JSON.parse(fs.readFileSync(DRY_RESULT,'utf8'));
assert(dry.decision==='PASS_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN','VRM153_REPAIR_REQUIRES_PASS_DRY_RUN');
assert(dry.observed?.canonicalSubmitted===628,'VRM153_REPAIR_CANONICAL_COUNT');
assert(dry.observed?.paid===562,'VRM153_REPAIR_PAID_COUNT');
assert(dry.observed?.pending===66,'VRM153_REPAIR_PENDING_COUNT');
assert(dry.observed?.amountReviewRequired===5,'VRM153_REPAIR_REVIEW_COUNT');
assert(dry.observed?.octoberTouched===0,'VRM153_REPAIR_OCTOBER_DRY_SCOPE');
assert(dry.observed?.ambiguous===0,'VRM153_REPAIR_AMBIGUITY');
const sourceRevision=str(dry.sourceRevision);
assert(/^[0-9a-f]{64}$/.test(sourceRevision),'VRM153_REPAIR_SOURCE_REVISION_REQUIRED');

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(TENANT),projectRef=tenant.collection('projects').doc(PROGRAM);

async function apiKey(){
  const r=await fetch(HOST+'/__/firebase/init.json',{cache:'no-store'});
  assert(r.ok,'ENVIRONMENT_FAILURE:FIREBASE_INIT_'+r.status);
  return str((await r.json()).apiKey);
}
async function adminToken(){
  const users=(await tenant.collection('users').get()).docs.map(d=>({id:d.id,...(d.data()||{})}));
  const m=users.find(x=>x.active===true&&str(x.authNamespace)==='staff'&&['super','admin'].includes(str(x.role))&&(str(x.role)==='super'||arr(x.projectIds).map(String).includes(PROGRAM)));
  assert(m,'AUTH_FAILURE:VRM151_ADMIN_MISSING');
  const custom=await auth.createCustomToken(m.id),key=await apiKey();
  const r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})
  });
  const body=await r.json().catch(()=>null);
  assert(r.ok&&body?.idToken,'AUTH_FAILURE:VRM151_TOKEN_EXCHANGE');
  return {token:body.idToken,uid:m.id};
}
async function send(token,command){
  const r=await fetch(HOST+'/v1/cxorbia/commands',{
    method:'POST',
    headers:{authorization:'Bearer '+token,'content-type':'application/json'},
    body:JSON.stringify(command)
  });
  const body=await r.json().catch(()=>null);
  return {httpStatus:r.status,httpOk:r.ok,body};
}
function commandFor(batch){
  const period=str(batch.period),status=str(batch.paymentStatus);
  const visitIds=arr(batch.visitIds).map(str).filter(Boolean).sort();
  const visitRefs=arr(batch.visitRefs).map(x=>({visitId:str(x.visitId),hrRowId:str(x.hrRowId)||null})).sort((a,b)=>a.visitId.localeCompare(b.visitId));
  const batchId='hist-'+PROGRAM+'-'+period+'-'+status+'-scope-v1';
  const payload={visitIds,visitRefs,paymentStatus:status,reconciliationBatchId:batchId,sourceRef:'internal:historical_reconciliation_scope_v1',sourceRevision,notes:'Paula-confirmed historical payment scope; no external bank reference asserted.'};
  const idempotencyKey='vrm153-repair-'+sha(JSON.stringify({tenant:TENANT,project:PROGRAM,period,status,visitIds,sourceRevision})).slice(0,48);
  return {
    version:'cxorbia-command-adapter-v1',
    commandType:'finance.historical.reconcile',
    entityType:'historicalPaymentReconciliation',
    entityId:batchId,
    tenantId:TENANT,projectId:PROGRAM,periodId:str(batch.periodId)||('cinepolis-'+period),
    expectedVersion:'source-current',
    idempotencyKey,payload,
    authorization:{providerEnforcementRequired:true,permission:'finance.reconcile'},
    audit:{reason:'VRM-153 durable repair after exact canonical dry-run and HR-authority fix'},
    source:'vrm153-durable-repair'
  };
}
const commands=arr(dry.batches).map(commandFor).sort((a,b)=>[a.periodId,a.payload.paymentStatus].join('|').localeCompare([b.periodId,b.payload.paymentStatus].join('|')));
assert(commands.length>0,'VRM153_REPAIR_BATCHES_REQUIRED');
assert(commands.reduce((n,c)=>n+c.payload.visitIds.length,0)===628,'VRM153_REPAIR_BATCH_TOTAL');

const movementBefore=(await tenant.collection('financialMovements').get()).size;
const {token,uid}=await adminToken();
const firstPass=[];
for(const command of commands){
  const x=await send(token,command);
  assert(x.httpOk&&x.body?.providerAck===true,'PERSISTENCE_FAILURE:VRM153_REPAIR_ACK:'+command.entityId+':'+JSON.stringify(x.body));
  assert(Number(x.body?.reconciled||0)===command.payload.visitIds.length,'PERSISTENCE_FAILURE:VRM153_REPAIR_COUNT:'+command.entityId);
  assert(Number(x.body?.bankWrites||0)===0&&Number(x.body?.hrWrites||0)===0&&Number(x.body?.externalPaymentWrites||0)===0,'PERSISTENCE_FAILURE:VRM153_REPAIR_FORBIDDEN_WRITE:'+command.entityId);
  firstPass.push({batchId:command.entityId,periodId:command.periodId,status:command.payload.paymentStatus,count:command.payload.visitIds.length,providerAck:true,idempotentReplay:x.body?.idempotentReplay===true,providerWrites:Number(x.body?.providerWrites||0)});
}
const replay=[];
for(const command of commands){
  const x=await send(token,command);
  assert(x.httpOk&&x.body?.providerAck===true&&x.body?.idempotentReplay===true,'PERSISTENCE_FAILURE:VRM153_REPAIR_IDEMPOTENT_REPLAY:'+command.entityId+':'+JSON.stringify(x.body));
  assert(Number(x.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE:VRM153_REPAIR_REPLAY_WRITES:'+command.entityId);
  replay.push({batchId:command.entityId,idempotentReplay:true,providerWrites:0});
}

const recSnap=await tenant.collection('paymentReconciliations').get();
const batchIds=new Set(commands.map(c=>c.entityId));
const recs=recSnap.docs.map(d=>({id:d.id,...(d.data()||{})})).filter(r=>batchIds.has(str(r.reconciliationBatchId)));
assert(recs.length===628,'PERSISTENCE_FAILURE:VRM153_REPAIR_RECONCILIATION_READBACK_COUNT:'+recs.length);
assert(new Set(recs.map(r=>str(r.visitId))).size===628,'PERSISTENCE_FAILURE:VRM153_REPAIR_RECONCILIATION_DUPLICATES');
const paid=recs.filter(r=>str(r.paymentStatus)==='paid').length;
const pending=recs.filter(r=>str(r.paymentStatus)==='pending').length;
const amountReviewRequired=recs.filter(r=>r.amountReviewRequired===true).length;
assert(paid===562&&pending===66&&amountReviewRequired===5,'PERSISTENCE_FAILURE:VRM153_REPAIR_RECONCILIATION_COUNTS');
assert(recs.every(r=>str(r.source)==='historical_reconciliation'&&str(r.sourceRevision)===sourceRevision),'PERSISTENCE_FAILURE:VRM153_REPAIR_RECONCILIATION_AUTHORITY');
assert(recs.every(r=>str(r.periodId)!=='cinepolis-2026-10'),'PERSISTENCE_FAILURE:VRM153_REPAIR_OCTOBER_RECONCILIATION');

const refs=recs.map(r=>projectRef.collection('visits').doc(str(r.durableVisitId||r.visitId)));
let visitDocs=[];
for(let i=0;i<refs.length;i+=100){
  const snaps=await db.getAll(...refs.slice(i,i+100));
  visitDocs.push(...snaps.map(s=>({id:s.id,...(s.data()||{})})));
}
assert(visitDocs.length===628&&visitDocs.every(v=>v.id),'PERSISTENCE_FAILURE:VRM153_REPAIR_VISIT_READBACK');
assert(visitDocs.filter(v=>str(v.historicalPaymentStatus)==='paid').length===562,'PERSISTENCE_FAILURE:VRM153_REPAIR_VISIT_PAID_READBACK');
assert(visitDocs.filter(v=>str(v.historicalPaymentStatus)==='pending').length===66,'PERSISTENCE_FAILURE:VRM153_REPAIR_VISIT_PENDING_READBACK');
assert(visitDocs.filter(v=>v.historicalPaymentAmountReviewRequired===true).length===5,'PERSISTENCE_FAILURE:VRM153_REPAIR_VISIT_REVIEW_READBACK');
assert(visitDocs.every(v=>str(v.reconciliationSourceRevision)===sourceRevision),'PERSISTENCE_FAILURE:VRM153_REPAIR_VISIT_SOURCE_REVISION');

const movementAfter=(await tenant.collection('financialMovements').get()).size;
assert(movementAfter===movementBefore,'PERSISTENCE_FAILURE:VRM153_REPAIR_FINANCIAL_MOVEMENT_DELTA');

const result={
  schemaVersion:'cxorbia.vrm153.durable-repair-live.v1',
  decision:'PASS_VRM153_DURABLE_HISTORICAL_REPAIR',
  sourceSha:SOURCE,sourceTree:TREE,sourceRevision,actorUid:uid,
  observed:{canonicalSubmitted:628,paid,pending,amountReviewRequired,octoberTouched:0,ambiguous:0,batches:commands.length,reconciliationRecords:recs.length},
  firstPass,replay,
  providerAck:true,durableReadback:true,idempotentReplay:true,
  financialMovementWrites:0,financialMovementCountBefore:movementBefore,financialMovementCountAfter:movementAfter,
  bankWrites:0,hrWrites:0,externalPaymentWrites:0,production:false
};
fs.writeFileSync(OUT+'/result.json',JSON.stringify(result,null,2)+'\n');
process.stdout.write(JSON.stringify(result,null,2)+'\n');
