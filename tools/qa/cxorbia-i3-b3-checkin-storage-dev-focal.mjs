#!/usr/bin/env node
/* I3 / B3: actual Firebase Storage SDK upload and operational provider ACK
   against one synthetic DEV-only visit, two existing scoped shoppers, and
   full cleanup. No real visit, HR, user, payment or production mutation.
   Synthetic coordinates and a 1-pixel PNG do NOT prove human camera/GPS UX. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {initializeApp as initializeAdminApp,applicationDefault,getApps as getAdminApps} from 'firebase-admin/app';
import {getAuth as getAdminAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {getStorage as getAdminStorage} from 'firebase-admin/storage';
import {initializeApp as initializeClientApp,deleteApp as deleteClientApp} from 'firebase/app';
import {getAuth as getClientAuth,signInWithCustomToken as clientSignIn} from 'firebase/auth';
import {getStorage as getClientStorage,ref as storageRef,uploadBytes,getMetadata} from 'firebase/storage';

const env=process.env;
const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const host=str(env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const project=str(env.PROJECT||'cxorbia-backend-dev');
const tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const bucketName='cxorbia-backend-dev.firebasestorage.app';
const source=str(env.FOCAL_SOURCE),expectedHr=str(env.EXPECTED_HR_REVISION);
const runId=str(env.GITHUB_RUN_ID).replace(/\D/g,'');
const out=str(env.B3_OUT||'.tmp/i3-b3-schedule-two-shopper');
if(!/^\d{6,}$/.test(runId)||!/^([a-f0-9]{40})$/.test(source)||!/^([a-f0-9]{64})$/.test(expectedHr))throw Error('SOURCE_FAILURE:B3_CHECKIN_QA_ENV_REQUIRED');
if(env.CXORBIA_I3_B3_QA_WRITE_GATE!=='PAULA_AUTHORIZED_SYNTHETIC_DEV_ONLY')throw Error('SOURCE_FAILURE:B3_CHECKIN_QA_WRITE_GATE_REQUIRED');
fs.mkdirSync(out,{recursive:true});
if(!getAdminApps().length)initializeAdminApp({credential:applicationDefault(),projectId,storageBucket:bucketName});
const adminApp=getAdminApps()[0],auth=getAdminAuth(adminApp),db=getFirestore(adminApp),adminBucket=getAdminStorage(adminApp).bucket(bucketName);
const tenant=db.collection('tenants').doc(tenantId),projectRef=tenant.collection('projects').doc(projectId);
const visitId=`QA_I3_B3_CHECKIN_${runId}`,evidenceId=`ev-qa-i3-b3-${runId}`;
const visitRef=projectRef.collection('visits').doc(visitId),evidenceRef=projectRef.collection('visitEvidence').doc(evidenceId);
const storagePath=`tenants/${tenantId}/projects/${projectId}/periods/${periodId}/visits/${visitId}/evidence/${evidenceId}/${evidenceId}.png`;
const pixels=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=','base64');
const checksum=sha(pixels),fakeLat=14.6,fakeLon=-90.5;
const result={schemaVersion:'cxorbia.i3.b3.checkin-storage-synthetic-dev.v1',decision:'HOLD',sourceSha:source,
  visitId,evidenceId,storagePath,hrBefore:null,hrAfter:null,storageSdkUploadAck:false,storageReadback:false,
  storageObjectExists:false,otherShopperDenied:false,missingStorageAckDenied:false,providerAck:false,
  independentFirestoreReadback:false,receiptAuditDurable:false,idempotentReplay:false,cleaned:false,
  syntheticGps:true,syntheticImage:true,cameraUxTested:false,gpsUxTested:false,humanAcceptance:false,
  safety:{syntheticVisitsCreated:0,syntheticVisitsDeleted:0,evidenceDocsCreated:0,evidenceDocsDeleted:0,
    storageObjectsUploaded:0,storageObjectsDeleted:0,hrWrites:0,commercialVisitWrites:0,paymentWrites:0,authWrites:0,
    builds:0,deploys:0,production:false},errors:[]};
const refs=[];let storageMayExist=false,clientApp=null;
const track=ref=>{if(!refs.some(v=>v.path===ref.path))refs.push(ref);};
const requireOk=(ok,kind,reason)=>{if(!ok)throw Error(`${kind}:${reason}`);};
const receipt=cmd=>tenant.collection('commandReceipts').doc(sha(`${tenantId}\0${projectId}\0${periodId}\0${cmd.idempotencyKey}`).slice(0,40));
const audit=cmd=>tenant.collection('entityAuditTrail').doc(sha(`${cmd.idempotencyKey}\0${cmd.commandType}\0${cmd.entityId}`).slice(0,40));
const write=()=>fs.writeFileSync(out+'/checkin-result.json',JSON.stringify(result,null,2)+'\n');

async function getHrRevision(){
  const response=await fetch(`${host}/api/${tenantId}/${projectId}/hr-live?format=meta&b3-checkin-qa=${runId}-${Date.now()}`,
    {headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});
  requireOk(response.ok,'PROVIDER_FAILURE',`HR_META_HTTP_${response.status}`);
  const body=await response.json();
  requireOk(body.ok===true&&body.sourceSafe===true&&body.revisionStable===true&&body.hrWrites===false&&body.production===false,
    'PROVIDER_FAILURE','HR_META_CONTRACT');
  return str(body.revision);
}
async function firebaseConfig(){
  const response=await fetch(`${host}/__/firebase/init.json`,{signal:AbortSignal.timeout(35000)});
  const config=await response.json();
  requireOk(response.ok&&!!str(config.apiKey),'ENVIRONMENT_FAILURE','FIREBASE_CONFIG');
  requireOk(str(config.projectId)===project,'ENVIRONMENT_FAILURE','WRONG_FIREBASE_PROJECT');
  return {...config,storageBucket:bucketName};
}
async function bearer(member,key){
  const user=await auth.getUser(member.uid);
  requireOk(user.disabled!==true,'AUTH_FAILURE','SHOPPER_DISABLED');
  const custom=await auth.createCustomToken(member.uid,user.customClaims||{});
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(key)}`,
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true}),signal:AbortSignal.timeout(45000)});
  const body=await response.json().catch(()=>({}));
  requireOk(response.ok&&!!str(body.idToken),'AUTH_FAILURE',`TOKEN_EXCHANGE_${response.status}`);
  const claims=await auth.verifyIdToken(body.idToken,true);
  requireOk(claims.role==='shopper'&&claims.authNamespace==='shopper'&&str(claims.shopperId)===str(member.shopperId)
    &&str(claims.tenantId)===tenantId&&arr(claims.projectIds).map(str).includes(projectId),'AUTH_FAILURE','EXACT_SHOPPER_CLAIMS');
  return {idToken:body.idToken,customToken:custom};
}
function command(idempotencyKey,payload){
  return {version:'cxorbia-command-adapter-v1',commandType:'visit.checkin.evidence',entityType:'visitEvidence',entityId:visitId,
    tenantId,projectId,periodId,idempotencyKey,expectedVersion:1,authorization:{providerEnforcementRequired:true,permission:'visit.checkin.evidence'},
    payload,audit:{reason:'i3-b3-checkin-synthetic-storage-dev',correlationId:idempotencyKey}};
}
async function invoke(token,cmd){
  const response=await fetch(host+'/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token,'cache-control':'no-store'},
    body:JSON.stringify(cmd),signal:AbortSignal.timeout(60000)});
  return {http:response.status,...(await response.json().catch(()=>({})))};
}

try{
  result.hrBefore=await getHrRevision();
  requireOk(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_BEFORE');
  requireOk(!(await visitRef.get()).exists&&!(await evidenceRef.get()).exists,'SOURCE_FAILURE','QA_TEST_FIXTURE_COLLISION');
  const members=(await tenant.collection('users').get()).docs.map(d=>({uid:d.id,...d.data()}))
    .filter(m=>m.active===true&&m.role==='shopper'&&m.authNamespace==='shopper'&&arr(m.projectIds).map(str).includes(projectId));
  const owner=members.filter(m=>str(m.shopperId)==='shopper_gt_1440137b73');
  requireOk(owner.length===1,'MAPPING_FAILURE',`OWNER_IDENTITY_${owner.length}`);
  const other=members.filter(m=>str(m.shopperId)!==str(owner[0].shopperId));
  requireOk(other.length>0,'MAPPING_FAILURE','SECOND_SCOPED_SHOPPER_REQUIRED');
  const config=await firebaseConfig(),ownerIdentity=await bearer(owner[0],config.apiKey);
  let otherIdentity=null;
  for(const member of other){
    const cross=await tenant.collection('shopperIdentityCrosswalk').doc(str(member.shopperId)).get();
    const canonical=str(cross.exists?(cross.data()?.canonicalShopperId||cross.data()?.shopperId):member.shopperId);
    if(canonical===str(owner[0].shopperId))continue;
    try{otherIdentity=await bearer(member,config.apiKey);break;}
    catch(error){if(!/AUTH_FAILURE:SHOPPER_DISABLED|AUTH_FAILURE:EXACT_SHOPPER_CLAIMS|auth\/user-not-found|AUTH_FAILURE:TOKEN_EXCHANGE/.test(str(error.message)))throw error;}
  }
  requireOk(!!otherIdentity,'AUTH_FAILURE','OTHER_AUTHENTICATED_SHOPPER_UNAVAILABLE');

  await visitRef.create({id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey:'2026-11',shopperId:owner[0].shopperId,
    estado:'agendada',status:'agendada',agendada:'2026-11-01',sucursal:'QA B3 DEV CHECKIN',ciudad:'Guatemala',pais:'GT',quincena:'1Q',
    assignmentSource:'platform',assignmentSyncStatus:'synced',version:1,qaSynthetic:true,qaRunId:runId,
    canonicalFacets:{available:false,assigned:true,scheduled:true,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
  track(visitRef);result.safety.syntheticVisitsCreated++;

  clientApp=initializeClientApp(config,`cxorbia-i3-b3-checkin-${runId}`);
  await clientSignIn(getClientAuth(clientApp),ownerIdentity.customToken);
  const objectRef=storageRef(getClientStorage(clientApp),storagePath);
  storageMayExist=true; // Cleanup even if the client loses its ACK after the provider writes.
  const uploaded=await uploadBytes(objectRef,pixels,{contentType:'image/png',customMetadata:{
    tenantId,projectId,periodId,visitId,evidenceId,shopperId:owner[0].shopperId,checksum,kind:'geo_checkin'}});
  result.safety.storageObjectsUploaded++;
  result.storageSdkUploadAck=uploaded?.ref?.fullPath===storagePath&&Number(uploaded?.metadata?.size)===pixels.length;
  requireOk(result.storageSdkUploadAck,'PERSISTENCE_FAILURE','STORAGE_SDK_UPLOAD_NO_ACK');
  const meta=await getMetadata(objectRef);
  const [objectExists]=await adminBucket.file(storagePath).exists();
  result.storageObjectExists=objectExists;
  result.storageReadback=meta.fullPath===storagePath&&Number(meta.size)===pixels.length&&meta.contentType==='image/png'
    &&meta.customMetadata?.visitId===visitId&&meta.customMetadata?.evidenceId===evidenceId
    &&meta.customMetadata?.shopperId===owner[0].shopperId;
  requireOk(result.storageReadback&&result.storageObjectExists,'PERSISTENCE_FAILURE','STORAGE_METADATA_INDEPENDENT_READBACK_MISMATCH');

  const payload={visitId,evidenceId,storagePath,checksum,mimeType:'image/png',size:pixels.length,
    storageProviderAck:true,lat:fakeLat,lon:fakeLon,accuracy:5,capturedAt:new Date().toISOString()};
  const noAck=command(`qa-i3-b3-checkin-${runId}-missing-storage-ack`,{...payload,storageProviderAck:false});
  track(receipt(noAck));track(audit(noAck));
  const noAckResult=await invoke(ownerIdentity.idToken,noAck);
  result.missingStorageAckDenied=noAckResult.ok!==true&&str(noAckResult.code).includes('OPS_CHECKIN_EVIDENCE_REQUIRED');
  requireOk(result.missingStorageAckDenied,'PERSISTENCE_FAILURE','CHECKIN_ACCEPTED_WITHOUT_STORAGE_ACK');
  const denied=command(`qa-i3-b3-checkin-${runId}-other-shopper`,payload);
  track(receipt(denied));track(audit(denied));
  const wrong=await invoke(otherIdentity.idToken,denied);
  result.otherShopperDenied=wrong.ok!==true&&str(wrong.code).includes('OPS_CHECKIN_SHOPPER_SCOPE_DENIED');
  requireOk(result.otherShopperDenied,'AUTH_FAILURE',`OTHER_SHOPPER_NOT_DENIED_${str(wrong.code)}`);
  requireOk((await visitRef.get()).data()?.version===1,'PERSISTENCE_FAILURE','DENIED_CHECKIN_CHANGED_VISIT');
  const positive=command(`qa-i3-b3-checkin-${runId}-owner-commit`,payload);
  track(receipt(positive));track(audit(positive));track(evidenceRef);
  const ok=await invoke(ownerIdentity.idToken,positive);
  result.providerAck=ok.ok===true&&ok.providerAck===true&&ok.status==='committed'&&ok.successUiAllowed===true;
  requireOk(result.providerAck,'PERSISTENCE_FAILURE',`CHECKIN_PROVIDER_ACK_MISSING_${str(ok.code)}`);
  const [visit,evidence,rec,aud]=await Promise.all([visitRef.get(),evidenceRef.get(),receipt(positive).get(),audit(positive).get()]);
  result.independentFirestoreReadback=visit.data()?.checkInStatus==='confirmed'&&visit.data()?.latestCheckInEvidenceId===evidenceId
    &&visit.data()?.version===2&&evidence.data()?.storagePath===storagePath&&evidence.data()?.checksum===checksum
    &&evidence.data()?.geo?.lat===fakeLat&&evidence.data()?.geo?.lon===fakeLon&&evidence.data()?.providerAck===true;
  result.safety.evidenceDocsCreated=Number(evidence.exists);
  result.receiptAuditDurable=rec.exists&&aud.exists;
  requireOk(result.independentFirestoreReadback&&result.receiptAuditDurable,'PERSISTENCE_FAILURE','CHECKIN_DURABLE_ACK_READBACK_MISMATCH');
  const replay=await invoke(ownerIdentity.idToken,positive);
  result.idempotentReplay=replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true&&Number(replay.providerWrites||0)===0
    &&(await visitRef.get()).data()?.version===2;
  requireOk(result.idempotentReplay,'PERSISTENCE_FAILURE','CHECKIN_REPLAY_NOT_IDEMPOTENT');
  result.hrAfter=await getHrRevision();
  requireOk(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_REVISION_DRIFT_AFTER');
}catch(error){result.errors.push(str(error?.message||error));}
finally{
  if(clientApp)try{await deleteClientApp(clientApp);}catch(error){result.errors.push('ENVIRONMENT_FAILURE:SDK_SHUTDOWN:'+str(error?.message));}
  const cleanupErrors=[];
  for(const ref of refs.reverse()){
    try{const snap=await ref.get();await ref.delete();
      if(ref.path===visitRef.path&&snap.exists)result.safety.syntheticVisitsDeleted++;
      if(ref.path===evidenceRef.path&&snap.exists)result.safety.evidenceDocsDeleted++;}
    catch(error){cleanupErrors.push(`FIRESTORE:${ref.path}:${str(error?.code||error?.message)}`);}
  }
  if(storageMayExist){try{const [exists]=await adminBucket.file(storagePath).exists();
      if(exists){await adminBucket.file(storagePath).delete();result.safety.storageObjectsDeleted++;}}
    catch(error){cleanupErrors.push('STORAGE:'+str(error?.code||error?.message));}}
  if(cleanupErrors.length)result.errors.push('PERSISTENCE_FAILURE:CLEANUP:'+cleanupErrors.join('|'));
  result.cleaned=cleanupErrors.length===0&&result.safety.syntheticVisitsCreated===result.safety.syntheticVisitsDeleted
    &&result.safety.evidenceDocsCreated===result.safety.evidenceDocsDeleted
    &&result.safety.storageObjectsUploaded===result.safety.storageObjectsDeleted;
  result.decision=result.errors.length===0&&result.storageSdkUploadAck&&result.storageReadback&&result.storageObjectExists
    &&result.otherShopperDenied&&result.missingStorageAckDenied&&result.providerAck&&result.independentFirestoreReadback
    &&result.receiptAuditDurable&&result.idempotentReplay&&result.cleaned&&result.hrBefore===expectedHr&&result.hrAfter===expectedHr
    ?'PASS_I3_B3_SYNTHETIC_CHECKIN_STORAGE_SDK_PROVIDER_ACK_DEV':'HOLD_I3_B3_SYNTHETIC_CHECKIN_STORAGE_SDK_PROVIDER_ACK_DEV';
  write();console.log(JSON.stringify({decision:result.decision,sourceSha:source,checks:{storageSdkUploadAck:result.storageSdkUploadAck,
    storageReadback:result.storageReadback,storageObjectExists:result.storageObjectExists,missingStorageAckDenied:result.missingStorageAckDenied,
    otherShopperDenied:result.otherShopperDenied,providerAck:result.providerAck,independentFirestoreReadback:result.independentFirestoreReadback,
    receiptAuditDurable:result.receiptAuditDurable,idempotentReplay:result.idempotentReplay,cleaned:result.cleaned},
    hrStable:result.hrBefore===result.hrAfter,safety:result.safety,errors:result.errors}));
  if(result.decision!=='PASS_I3_B3_SYNTHETIC_CHECKIN_STORAGE_SDK_PROVIDER_ACK_DEV')process.exitCode=2;
}
