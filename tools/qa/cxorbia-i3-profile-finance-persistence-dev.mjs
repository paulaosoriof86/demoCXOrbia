#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const OUT=process.env.OUT||'.tmp/recovery-i3-dev-certification';
const HOSTING_URL=String(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const TENANT_ID=String(process.env.TENANT_ID||'tya').trim();
const PROJECT_ID=String(process.env.PROJECT_ID||'cinepolis').trim();
const PERIOD_ID=String(process.env.PERIOD_ID||'cinepolis-2026-09').trim();
const SOURCE_SHA=String(process.env.SOURCE_SHA||'').trim();
const RUN_ID=String(process.env.GITHUB_RUN_ID||Date.now()).replace(/[^A-Za-z0-9_-]/g,'');
const now=()=>new Date().toISOString();
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const fp=v=>sha(v).slice(0,24);
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.periodId||''}\0${command.idempotencyKey}`).slice(0,40);
const auditId=command=>sha(`${command.idempotencyKey}\0${command.commandType}`).slice(0,40);
const stableShopperId=(tenantId,projectId,idempotencyKey)=>`shopper_manual_${sha(`${tenantId}\0${projectId}\0${idempotencyKey}`).slice(0,24)}`;
const stableShopperUid=(tenantId,shopperId)=>`cx-sh-${sha(`${tenantId}\0shopper\0${shopperId}`).slice(0,28)}`;
const clientHash=value=>{const s=typeof value==='string'?value:JSON.stringify(value||{});let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
const write=(name,value)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n');};
function assert(ok,message){if(!ok)throw new Error(message);}
async function jsonFetch(url,options){const response=await fetch(url,options);return {response,body:await response.json().catch(()=>null)};}
async function apiKey(){const r=await fetch(`${HOSTING_URL}/__/firebase/init.json`,{cache:'no-store'});assert(r.ok,`ENVIRONMENT_FAILURE:FIREBASE_INIT_${r.status}`);const j=await r.json();assert(str(j?.apiKey),'ENVIRONMENT_FAILURE:FIREBASE_API_KEY_MISSING');return str(j.apiKey);}
async function exchangeCustomToken(token){const key=await apiKey();const {response,body}=await jsonFetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,returnSecureToken:true})});assert(response.ok&&body?.idToken,`AUTH_FAILURE:CUSTOM_TOKEN_EXCHANGE_${response.status}`);return body.idToken;}
async function command(token,payload){return jsonFetch(`${HOSTING_URL}/v1/cxorbia/commands`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(payload)});}
async function allDocs(ref){const snap=await ref.get();return snap.docs.map(d=>({id:d.id,...(d.data()||{})}));}

if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
const auth=getAuth(),db=getFirestore();
const tenant=db.collection('tenants').doc(TENANT_ID),project=tenant.collection('projects').doc(PROJECT_ID);
const members=await allDocs(tenant.collection('users'));
const staff=members.find(m=>m.active===true&&str(m.authNamespace)==='staff'&&['super','admin'].includes(str(m.role))&&(str(m.role)==='super'||arr(m.projectIds).map(String).includes(PROJECT_ID)));
assert(staff,'AUTH_FAILURE:I3_CERT_ADMIN_MISSING');
const token=await exchangeCustomToken(await auth.createCustomToken(staff.id));

const createIdempotencyKey=`i3-profile-create-${RUN_ID}`;
let shopperId=stableShopperId(TENANT_ID,PROJECT_ID,createIdempotencyKey),shopperUid=stableShopperUid(TENANT_ID,shopperId);
let createReceiptRef=null,updateReceiptRef=null;
let financeVisitRef=null,financeReceiptRef=null,financeAuditRef=null,financeMovementRef=null,financeLotRef=null;
const cleanup={attempted:false,profileArtifactsRemoved:false,financeArtifactsRemoved:false,authRemoved:false};

try{
  const createCommand={
    version:'cxorbia-command-adapter-v1',commandType:'shopper.create',entityType:'shopper',entityId:null,
    tenantId:TENANT_ID,projectId:PROJECT_ID,periodId:PERIOD_ID,
    actor:{actorId:staff.id,role:str(staff.role),projectIds:arr(staff.projectIds)},
    expectedVersion:'absent',idempotencyKey:createIdempotencyKey,
    payload:{periodId:PERIOD_ID,projectIds:[PROJECT_ID],profile:{firstName:'QA',lastName:'I3 Profile',nombre:'QA I3 Profile',whatsapp:'00000000',sourceType:'platform',createdVia:'i3-dev-certification'},protectedProfile:{},sourceType:'platform',sourceRef:`qa:${RUN_ID}`},
    source:'i3-dev-certification',authorization:{providerEnforcementRequired:true,permission:'shopper.create'},audit:{reason:'I3 synthetic profile persistence certification'}
  };
  createReceiptRef=tenant.collection('commandReceipts').doc(receiptId(createCommand));
  const created=await command(token,createCommand);
  assert(created.response.ok&&created.body?.ok===true&&created.body?.status==='committed'&&created.body?.providerAck===true&&created.body?.successUiAllowed===true,'PERSISTENCE_FAILURE:SHOPPER_PROFILE_CREATE_ACK_MISSING');
  assert(str(created.body?.entityId)===shopperId,'PERSISTENCE_FAILURE:SHOPPER_PROFILE_CREATE_ID_MISMATCH');
  const profileRef=tenant.collection('shoppers').doc(shopperId),crossRef=tenant.collection('shopperIdentityCrosswalk').doc(shopperId),memberRef=tenant.collection('users').doc(shopperUid);
  const [profileBefore,crossBefore,memberBefore,createReceiptBefore]=await Promise.all([profileRef.get(),crossRef.get(),memberRef.get(),createReceiptRef.get()]);
  assert(profileBefore.exists&&crossBefore.exists&&memberBefore.exists&&createReceiptBefore.exists,'PERSISTENCE_FAILURE:SHOPPER_PROFILE_CREATE_FRESH_READBACK_MISSING');
  const before=profileBefore.data()||{};
  const expectedVersion=before.version??before.updatedAt??before.lastSyncedAt??before.hrRevision??before.sourceRevision??'source-current';
  const updateCommand={
    version:'cxorbia-command-adapter-v1',commandType:'shopper.update',entityType:'shopper',entityId:shopperId,
    tenantId:TENANT_ID,projectId:PROJECT_ID,periodId:PERIOD_ID,
    actor:{actorId:staff.id,role:str(staff.role),projectIds:arr(staff.projectIds)},
    expectedVersion,idempotencyKey:`i3-profile-update-${RUN_ID}`,
    payload:{periodId:PERIOD_ID,shopperId,projectIds:[PROJECT_ID],patch:{whatsapp:'00000001',ciudad:'QA-DEV'},protectedPatch:{}},
    source:'i3-dev-certification',authorization:{providerEnforcementRequired:true,permission:'shopper.update'},audit:{reason:'I3 synthetic profile persistence certification'}
  };
  updateReceiptRef=tenant.collection('commandReceipts').doc(receiptId(updateCommand));
  const updated=await command(token,updateCommand);
  assert(updated.response.ok&&updated.body?.ok===true&&updated.body?.status==='committed'&&updated.body?.providerAck===true&&updated.body?.successUiAllowed===true&&updated.body?.profileUpdated===true,'PERSISTENCE_FAILURE:SHOPPER_PROFILE_UPDATE_ACK_MISSING');
  const [profileAfter,updateReceiptAfter]=await Promise.all([profileRef.get(),updateReceiptRef.get()]);
  assert(profileAfter.exists&&updateReceiptAfter.exists,'PERSISTENCE_FAILURE:SHOPPER_PROFILE_UPDATE_FRESH_READBACK_MISSING');
  const after=profileAfter.data()||{};
  assert(str(after.whatsapp)==='00000001'&&str(after.ciudad)==='QA-DEV','PERSISTENCE_FAILURE:SHOPPER_PROFILE_PATCH_NOT_DURABLE');
  const replay=await command(token,updateCommand);
  assert(replay.response.ok&&replay.body?.providerAck===true&&replay.body?.idempotentReplay===true&&Number(replay.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE:SHOPPER_PROFILE_IDEMPOTENT_REPLAY_FAILED');
  write('shopper-profile-persistence.json',{decision:'SHOPPER_PROFILE_PERSISTENCE_PASS',iteration:'I3',sourceSha:SOURCE_SHA||null,production:false,fixtureOnly:true,shopperFingerprint:fp(shopperId),remoteAck:true,successUiAllowed:true,freshReadback:true,idempotentReplay:true,replayProviderWrites:0,profileUpdated:true,fieldAssertions:{whatsapp:true,ciudad:true},hrWrites:0,externalWrites:0});

  const visitId=`qa-i3-fin-${RUN_ID}`;
  financeVisitRef=project.collection('visits').doc(visitId);
  await financeVisitRef.set({id:visitId,visitId,tenantId:TENANT_ID,projectId:PROJECT_ID,periodId:PERIOD_ID,estado:'validada',status:'validada',pais:'GT',country:'GT',currency:'GTQ',honorario:1,boleto:0,comboAmt:0,shopper:'QA I3 Profile',shopperId,sucursal:'QA DEV',version:1,fixtureOnly:true,createdAt:now(),updatedAt:now()},{merge:false});
  const fixtureFresh=await financeVisitRef.get();
  assert(fixtureFresh.exists&&fixtureFresh.data()?.version===1,'ENVIRONMENT_FAILURE:FINANCE_FIXTURE_CREATE_READBACK');
  const financeCommand={
    version:'cxorbia-command-adapter-v1',commandType:'finance.payment.batch',entityType:'paymentBatch',entityId:`qa-batch-${RUN_ID}`,
    tenantId:TENANT_ID,projectId:PROJECT_ID,periodId:PERIOD_ID,
    actor:{actorId:staff.id,role:str(staff.role),projectIds:arr(staff.projectIds)},
    expectedVersion:clientHash([[visitId,1]]),idempotencyKey:`i3-finance-payment-${RUN_ID}`,
    payload:{periodId:PERIOD_ID,visitIds:[visitId],fechaPago:new Date().toISOString().slice(0,10),referencia:`QA-I3-${RUN_ID}`},
    source:'i3-dev-certification',authorization:{providerEnforcementRequired:true,permission:'finance.markPaid'},audit:{reason:'I3 synthetic finance persistence certification'}
  };
  financeReceiptRef=tenant.collection('commandReceipts').doc(receiptId(financeCommand));
  financeAuditRef=tenant.collection('entityAuditTrail').doc(`finance-${auditId(financeCommand)}`);
  const paid=await command(token,financeCommand);
  assert(paid.response.ok&&paid.body?.ok===true&&paid.body?.status==='committed'&&paid.body?.providerAck===true&&paid.body?.successUiAllowed===true,'PERSISTENCE_FAILURE:FINANCE_PAYMENT_ACK_MISSING');
  assert(Number(paid.body?.pagadas)===1&&paid.body?.externalPaymentConfirmed===false,'PERSISTENCE_FAILURE:FINANCE_PAYMENT_ACK_SEMANTICS_INVALID');
  const lotId=str(paid.body?.loteIds?.[0]);
  assert(lotId,'PERSISTENCE_FAILURE:FINANCE_LOT_ID_MISSING');
  financeLotRef=tenant.collection('paymentLots').doc(lotId);
  const movementId=`pay-${sha(`${TENANT_ID}\0${PROJECT_ID}\0${PERIOD_ID}\0${visitId}\0${lotId}`).slice(0,32)}`;
  financeMovementRef=tenant.collection('financialMovements').doc(movementId);
  const [visitAfter,receiptAfter,auditAfter,movementAfter,lotAfter]=await Promise.all([financeVisitRef.get(),financeReceiptRef.get(),financeAuditRef.get(),financeMovementRef.get(),financeLotRef.get()]);
  assert(visitAfter.exists&&receiptAfter.exists&&auditAfter.exists&&movementAfter.exists&&lotAfter.exists,'PERSISTENCE_FAILURE:FINANCE_FRESH_READBACK_INCOMPLETE');
  const v=visitAfter.data()||{},r=receiptAfter.data()||{},m=movementAfter.data()||{},l=lotAfter.data()||{};
  assert(str(v.estado).toLowerCase()==='liquidada'&&v.externalPaymentConfirmed===false&&str(v.loteId)===lotId,'PERSISTENCE_FAILURE:FINANCE_VISIT_NOT_DURABLE');
  assert(r.providerAck===true&&r.externalPaymentConfirmed===false&&m.externalPaymentConfirmed===false&&l.externalPaymentConfirmed===false,'PERSISTENCE_FAILURE:FINANCE_EXTERNAL_TRUTH_INVALID');
  const paidReplay=await command(token,financeCommand);
  assert(paidReplay.response.ok&&paidReplay.body?.providerAck===true&&paidReplay.body?.idempotentReplay===true&&Number(paidReplay.body?.providerWrites||0)===0,'PERSISTENCE_FAILURE:FINANCE_IDEMPOTENT_REPLAY_FAILED');
  write('finance-bulk-payment-persistence.json',{decision:'FINANCE_BULK_PAYMENT_PERSISTENCE_PASS',iteration:'I3',sourceSha:SOURCE_SHA||null,production:false,fixtureOnly:true,visitFingerprint:fp(visitId),lotFingerprint:fp(lotId),movementFingerprint:fp(movementId),remoteAck:true,successUiAllowed:true,freshReadback:true,idempotentReplay:true,replayProviderWrites:0,internalPaymentRecorded:true,externalPaymentConfirmed:false,bankWrites:0,externalPaymentWrites:0,hrWrites:0});
} finally {
  cleanup.attempted=true;
  const deletes=[];
  if(financeVisitRef)deletes.push(financeVisitRef.delete().catch(()=>{}));
  if(financeReceiptRef)deletes.push(financeReceiptRef.delete().catch(()=>{}));
  if(financeAuditRef)deletes.push(financeAuditRef.delete().catch(()=>{}));
  if(financeMovementRef)deletes.push(financeMovementRef.delete().catch(()=>{}));
  if(financeLotRef)deletes.push(financeLotRef.delete().catch(()=>{}));
  deletes.push(tenant.collection('shoppers').doc(shopperId).delete().catch(()=>{}));
  deletes.push(tenant.collection('shopperIdentityCrosswalk').doc(shopperId).delete().catch(()=>{}));
  deletes.push(tenant.collection('users').doc(shopperUid).delete().catch(()=>{}));
  if(createReceiptRef)deletes.push(createReceiptRef.delete().catch(()=>{}));
  if(updateReceiptRef)deletes.push(updateReceiptRef.delete().catch(()=>{}));
  await Promise.all(deletes);
  try{await auth.deleteUser(shopperUid);cleanup.authRemoved=true;}catch(error){if(str(error?.code)==='auth/user-not-found')cleanup.authRemoved=true;}
  if(financeVisitRef){const refs=[financeVisitRef,financeReceiptRef,financeAuditRef,financeMovementRef,financeLotRef].filter(Boolean);const snaps=await Promise.all(refs.map(r=>r.get()));cleanup.financeArtifactsRemoved=snaps.every(s=>!s.exists);}else cleanup.financeArtifactsRemoved=true;
  const profileRefs=[tenant.collection('shoppers').doc(shopperId),tenant.collection('shopperIdentityCrosswalk').doc(shopperId),tenant.collection('users').doc(shopperUid),createReceiptRef,updateReceiptRef].filter(Boolean);
  const profileSnaps=await Promise.all(profileRefs.map(r=>r.get()));cleanup.profileArtifactsRemoved=profileSnaps.every(s=>!s.exists);
  write('synthetic-cleanup.json',{decision:(cleanup.profileArtifactsRemoved&&cleanup.financeArtifactsRemoved&&cleanup.authRemoved)?'PASS_I3_SYNTHETIC_CLEANUP':'ENVIRONMENT_FAILURE',production:false,...cleanup,hrWrites:0});
  if(!(cleanup.profileArtifactsRemoved&&cleanup.financeArtifactsRemoved&&cleanup.authRemoved))process.exitCode=1;
}
