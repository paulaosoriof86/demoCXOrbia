import crypto from 'node:crypto';
import {createG2BSyntheticVisitProvider,EXPECTED_PREFIX} from './cxorbia-g2b-synthetic-visit-provider-v1.mjs';

export const VERSION='cxorbia-f5-synthetic-acceptance-provider-v1';
export const SYNTHETIC_PREFIX=EXPECTED_PREFIX;
const TENANT_ID='tya';
const PROJECT_ID='cinepolis';
const SHOPPER_UID='CXORBIA_E2E_SYNTH_UID_SHOPPER_001';
const OPERATOR_UID='CXORBIA_E2E_SYNTH_UID_OPERATOR_001';
const DEFAULT_SHOPPER_ID='CXORBIA_E2E_SYNTH_SHOPPER_001';
const str=v=>String(v==null?'':v).trim();
const now=()=>new Date().toISOString();
const pref=v=>str(v).startsWith(SYNTHETIC_PREFIX);
const blocked=(code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,providerWrites:0,syntheticOnly:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,code,...extra});
const tag=gate=>({testSynthetic:true,syntheticTagPrefix:SYNTHETIC_PREFIX,syntheticRequestId:gate.requestId,syntheticGate:'F5',syntheticUpdatedAt:now()});
const actorKey=gate=>crypto.createHash('sha256').update(`${gate.requestId}\0${gate.authorizationId}\0CXORBIA_F5_SYNTHETIC_ACTOR_V1`,'utf8').digest();
const actorSig=(gate,actor)=>crypto.createHmac('sha256',actorKey(gate)).update(actor,'utf8').digest('hex');

export function validateF5Gate(gate={}){
  const errors=[];
  if(gate.schemaVersion!=='cxorbia.f5.synthetic-acceptance-gate.v1')errors.push('schema');
  if(gate.repository!=='paulaosoriof86/demoCXOrbia'||gate.branch!=='docs-tya-v6-v71-audit')errors.push('lane');
  if(gate.firebaseProjectId!=='cxorbia-backend-dev'||gate.tenantId!==TENANT_ID||gate.projectId!==PROJECT_ID)errors.push('target');
  if(gate.enabled!==true||gate.authorizedBy!=='Paula'||gate.syntheticDataOnly!==true||gate.syntheticTagPrefix!==SYNTHETIC_PREFIX)errors.push('authorization');
  if(!str(gate.requestId)||!str(gate.authorizationId)||gate.cleanupRequired!==true||gate.postCleanupReadbackRequired!==true)errors.push('contract');
  if(!gate.expiresAt||!Number.isFinite(Date.parse(gate.expiresAt))||Date.now()>=Date.parse(gate.expiresAt))errors.push('expiry');
  for(const k of ['realDataWrites','externalHrWrites','realAuthWrites','realPaymentWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','hostingDeploys','cloudRunDeploys'])if(Number(gate[k]||0)!==0)errors.push('forbidden-'+k);
  if(gate.merge!==false||gate.automaticRetryAllowed!==false)errors.push('lifecycle');
  return {ok:errors.length===0,errors};
}

export function createF5SyntheticActorToken(gate={},actor='operator'){
  const a=str(actor).toLowerCase();
  if(!['operator','shopper'].includes(a))throw new Error('F5_SYNTHETIC_ACTOR_INVALID');
  return `F5SYNTH.${a}.${actorSig(gate,a)}`;
}
function decodeActorToken(token,gate){
  const m=str(token).match(/^F5SYNTH\.(operator|shopper)\.([a-f0-9]{64})$/);
  if(!m)return null;
  const expected=actorSig(gate,m[1]);
  const got=Buffer.from(m[2],'hex'),want=Buffer.from(expected,'hex');
  if(got.length!==want.length||!crypto.timingSafeEqual(got,want))return null;
  if(m[1]==='shopper')return {uid:SHOPPER_UID,role:'shopper',authNamespace:'shopper',tenantId:TENANT_ID,projectIds:[PROJECT_ID],shopperId:DEFAULT_SHOPPER_ID,synthetic:true};
  return {uid:OPERATOR_UID,role:'admin',authNamespace:'staff',tenantId:TENANT_ID,projectIds:[PROJECT_ID],shopperId:null,synthetic:true};
}
function syntheticAuth(gate){return {async verifyIdToken(token){const decoded=decodeActorToken(token,gate);if(!decoded)throw new Error('F5_SYNTHETIC_ACTOR_TOKEN_INVALID');return decoded;}};}

function refs(db,ids={}){
  const tenant=db.collection('tenants').doc(TENANT_ID),project=tenant.collection('projects').doc(PROJECT_ID),users=tenant.collection('users');
  return {tenant,project,visit:project.collection('visits').doc(ids.visitId),application:project.collection('postulations').doc(ids.applicationId),shopper:tenant.collection('shoppers').doc(ids.shopperId),shopperUser:users.doc(SHOPPER_UID),operatorUser:users.doc(OPERATOR_UID),postulations:project.collection('postulations'),receipts:tenant.collection('commandReceipts'),audit:tenant.collection('entityAuditTrail'),users};
}
function validateIds(ids={}){for(const k of ['visitId','shopperId','applicationId'])if(!pref(ids[k]))throw new Error('F5_SYNTHETIC_ID_INVALID:'+k);if(ids.shopperId!==DEFAULT_SHOPPER_ID)throw new Error('F5_SYNTHETIC_SHOPPER_FIXTURE_INVALID');}
function tagged(data,gate){return data?.testSynthetic===true&&data?.syntheticTagPrefix===SYNTHETIC_PREFIX&&data?.syntheticRequestId===gate.requestId;}
async function countQuery(q){const s=await q.get();return s.size;}
async function actorArtifactCount(col){let n=0;for(const uid of [SHOPPER_UID,OPERATOR_UID])n+=await countQuery(col.where('actorUid','==',uid));return n;}
async function taggedCounts(db,gate){const tenant=db.collection('tenants').doc(TENANT_ID),project=tenant.collection('projects').doc(PROJECT_ID),filters=[['visits',project.collection('visits')],['postulations',project.collection('postulations')],['receipts',tenant.collection('commandReceipts')],['audit',tenant.collection('entityAuditTrail')],['shoppers',tenant.collection('shoppers')],['users',tenant.collection('users')]];const out={};for(const [name,col] of filters)out[name]=await countQuery(col.where('syntheticRequestId','==',gate.requestId));out.receiptActorOrphans=await actorArtifactCount(tenant.collection('commandReceipts'));out.auditActorOrphans=await actorArtifactCount(tenant.collection('entityAuditTrail'));return out;}
async function deleteTaggedCollection(col,gate){const snap=await col.where('syntheticRequestId','==',gate.requestId).get();let deleted=0;for(const doc of snap.docs){const data=doc.data()||{};if(!tagged(data,gate))throw new Error('F5_SYNTHETIC_CLEANUP_TAG_MISMATCH');await doc.ref.delete();deleted++;}return deleted;}
async function deleteActorArtifacts(col,kind){let deleted=0;for(const uid of [SHOPPER_UID,OPERATOR_UID]){const snap=await col.where('actorUid','==',uid).get();for(const doc of snap.docs){const d=doc.data()||{};const identity=kind==='audit'?str(d.idempotencyKey):str(d.entityId);if(!pref(identity))throw new Error('F5_SYNTHETIC_CLEANUP_ACTOR_ARTIFACT_MISMATCH');await doc.ref.delete();deleted++;}}return deleted;}
async function safeExactDelete(ref,gate,predicate,code){const snap=await ref.get();if(!snap.exists)return 0;const d=snap.data()||{};if(!tagged(d,gate)&&!predicate(d))throw new Error(code);await ref.delete();return 1;}
async function fixtureState(db,ids,gate){const r=refs(db,ids),[v,a,s,su,ou]=await Promise.all([r.visit.get(),r.application.get(),r.shopper.get(),r.shopperUser.get(),r.operatorUser.get()]);const cleanSnap=s=>s.exists?Object.fromEntries(Object.entries(s.data()||{}).filter(([k])=>!['questionnaireResult'].includes(k))):null;return {visit:cleanSnap(v),application:cleanSnap(a),shopper:cleanSnap(s),shopperMembership:cleanSnap(su),operatorMembership:cleanSnap(ou),allTagged:[v,a,s,su,ou].filter(x=>x.exists).every(x=>tagged(x.data()||{},gate))};}

export function createF5SyntheticAcceptanceProvider({db,gate}={}){
  const gv=validateF5Gate(gate);if(!gv.ok)throw new Error('F5_SYNTHETIC_GATE_INVALID:'+gv.errors.join(','));
  if(!db?.collection||!db?.batch)throw new Error('F5_SYNTHETIC_DEPENDENCIES_MISSING');
  const auth=syntheticAuth(gate);
  const base=createG2BSyntheticVisitProvider({auth,db,gate:{schemaVersion:'cxorbia.g2b.synthetic-lifecycle-write-gate.v1',repository:gate.repository,branch:gate.branch,pullRequest:7,firebaseProjectId:gate.firebaseProjectId,tenantId:TENANT_ID,projectId:PROJECT_ID,enabled:true,authorizedBy:'Paula',requestId:gate.requestId,syntheticDataOnly:true,syntheticTagPrefix:SYNTHETIC_PREFIX,realHrVisitMutationAllowed:false,externalHrWrites:0,realDataWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,storageWrites:0,merge:false,automaticRetryAllowed:false}});
  return Object.freeze({
    version:VERSION,
    authorizeControl(token){const a=decodeActorToken(token,gate);return a?.role==='admin'&&a?.uid===OPERATOR_UID;},
    async seed(ids={}){
      validateIds(ids);const r=refs(db,ids),t=tag(gate),snaps=await Promise.all([r.visit.get(),r.application.get(),r.shopper.get(),r.shopperUser.get(),r.operatorUser.get()]);
      for(const snap of snaps)if(snap.exists&&!tagged(snap.data()||{},gate))return blocked('F5_SYNTHETIC_FIXTURE_COLLISION');
      const [v,a,s,su,ou]=snaps,batch=db.batch();let writes=0;
      if(!v.exists){batch.create(r.visit,{id:ids.visitId,visitId:ids.visitId,tenantId:TENANT_ID,projectId:PROJECT_ID,estado:'disponible',status:'disponible',version:1,...t});writes++;}
      if(a.exists)return blocked('F5_SYNTHETIC_APPLICATION_COLLISION');
      if(!s.exists){batch.create(r.shopper,{id:ids.shopperId,shopperId:ids.shopperId,tenantId:TENANT_ID,projectIds:[PROJECT_ID],active:true,certified:true,status:'active',version:1,...t});writes++;}
      if(!su.exists){batch.create(r.shopperUser,{uid:SHOPPER_UID,tenantId:TENANT_ID,role:'shopper',authNamespace:'shopper',projectIds:[PROJECT_ID],shopperId:ids.shopperId,active:true,...t});writes++;}
      if(!ou.exists){batch.create(r.operatorUser,{uid:OPERATOR_UID,tenantId:TENANT_ID,role:'admin',authNamespace:'staff',projectIds:[PROJECT_ID],active:true,...t});writes++;}
      if(writes)await batch.commit();return {ok:true,status:'committed',providerAck:true,providerWrites:writes,syntheticOnly:true,ids,actors:{shopperUid:SHOPPER_UID,operatorUid:OPERATOR_UID},realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
    },
    async execute(token,command){if(command?.tenantId!==TENANT_ID||command?.projectId!==PROJECT_ID)return blocked('F5_SYNTHETIC_SCOPE_MISMATCH');return base.execute(token,command);},
    async readback(ids={}){validateIds(ids);const counts=await taggedCounts(db,gate),fixtures=await fixtureState(db,ids,gate);return {ok:true,status:'readback',counts,fixtures,syntheticOnly:true,requestId:gate.requestId};},
    async cleanup(ids={}){
      validateIds(ids);const r=refs(db,ids),removed={postulations:await deleteTaggedCollection(r.postulations,gate),receipts:await deleteTaggedCollection(r.receipts,gate),audit:await deleteTaggedCollection(r.audit,gate),receiptActorOrphans:0,auditActorOrphans:0,application:0,visit:0,shopper:0,shopperMembership:0,operatorMembership:0};
      removed.receiptActorOrphans=await deleteActorArtifacts(r.receipts,'receipt');removed.auditActorOrphans=await deleteActorArtifacts(r.audit,'audit');
      removed.application=await safeExactDelete(r.application,gate,d=>str(d.visitId||d.visitaId)===ids.visitId&&str(d.shopperId)===ids.shopperId,'F5_SYNTHETIC_APPLICATION_CLEANUP_MISMATCH');
      removed.visit=await safeExactDelete(r.visit,gate,d=>str(d.visitId||d.id)===ids.visitId,'F5_SYNTHETIC_VISIT_CLEANUP_MISMATCH');
      removed.shopper=await safeExactDelete(r.shopper,gate,d=>str(d.shopperId||d.id)===ids.shopperId,'F5_SYNTHETIC_SHOPPER_CLEANUP_MISMATCH');
      removed.shopperMembership=await safeExactDelete(r.shopperUser,gate,d=>str(d.uid)===SHOPPER_UID&&str(d.shopperId)===ids.shopperId,'F5_SYNTHETIC_SHOPPER_MEMBERSHIP_CLEANUP_MISMATCH');
      removed.operatorMembership=await safeExactDelete(r.operatorUser,gate,d=>str(d.uid)===OPERATOR_UID&&str(d.role)==='admin','F5_SYNTHETIC_OPERATOR_MEMBERSHIP_CLEANUP_MISMATCH');
      const residual=await taggedCounts(db,gate),fixtures=await fixtureState(db,ids,gate),total=Object.values(residual).reduce((x,y)=>x+Number(y||0),0)+Object.values(fixtures).filter(v=>v&&typeof v==='object').length;if(total!==0)throw new Error('F5_SYNTHETIC_POST_CLEANUP_RESIDUE');
      return {ok:true,status:'clean',providerAck:true,providerWrites:Object.values(removed).reduce((x,y)=>x+Number(y||0),0),removed,residual,fixtures,syntheticOnly:true};
    }
  });
}

export const F5_SYNTHETIC_ACTORS=Object.freeze({SHOPPER_UID,OPERATOR_UID,DEFAULT_SHOPPER_ID});
