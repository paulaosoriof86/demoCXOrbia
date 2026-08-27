import crypto from 'node:crypto';
import {createG2BSyntheticVisitProvider,EXPECTED_PREFIX} from './cxorbia-g2b-synthetic-visit-provider-v1.mjs';

export const VERSION='cxorbia-f5-synthetic-acceptance-provider-v1';
export const SYNTHETIC_PREFIX=EXPECTED_PREFIX;
const TENANT_ID='tya';
const PROJECT_ID='cinepolis';
const str=v=>String(v==null?'':v).trim();
const now=()=>new Date().toISOString();
const pref=v=>str(v).startsWith(SYNTHETIC_PREFIX);
const blocked=(code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,providerWrites:0,syntheticOnly:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,code,...extra});
const tag=gate=>({testSynthetic:true,syntheticTagPrefix:SYNTHETIC_PREFIX,syntheticRequestId:gate.requestId,syntheticGate:'F5',syntheticUpdatedAt:now()});

export function validateF5Gate(gate={}){
  const errors=[];
  if(gate.schemaVersion!=='cxorbia.f5.synthetic-acceptance-gate.v1')errors.push('schema');
  if(gate.repository!=='paulaosoriof86/demoCXOrbia'||gate.branch!=='docs-tya-v6-v71-audit')errors.push('lane');
  if(gate.firebaseProjectId!=='cxorbia-backend-dev'||gate.tenantId!==TENANT_ID||gate.projectId!==PROJECT_ID)errors.push('target');
  if(gate.enabled!==true||gate.authorizedBy!=='Paula'||gate.syntheticDataOnly!==true||gate.syntheticTagPrefix!==SYNTHETIC_PREFIX)errors.push('authorization');
  if(!str(gate.requestId)||!str(gate.authorizationId)||gate.cleanupRequired!==true||gate.postCleanupReadbackRequired!==true)errors.push('contract');
  for(const k of ['realDataWrites','externalHrWrites','realAuthWrites','realPaymentWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','hostingDeploys','cloudRunDeploys'])if(Number(gate[k]||0)!==0)errors.push('forbidden-'+k);
  if(gate.merge!==false||gate.automaticRetryAllowed!==false)errors.push('lifecycle');
  return {ok:errors.length===0,errors};
}

function refs(db,ids={}){
  const tenant=db.collection('tenants').doc(TENANT_ID),project=tenant.collection('projects').doc(PROJECT_ID);
  return {tenant,project,visit:project.collection('visits').doc(ids.visitId),shopper:tenant.collection('shoppers').doc(ids.shopperId),postulations:project.collection('postulations'),receipts:tenant.collection('commandReceipts'),audit:tenant.collection('entityAuditTrail')};
}
function validateIds(ids={}){for(const k of ['visitId','shopperId'])if(!pref(ids[k]))throw new Error('F5_SYNTHETIC_ID_INVALID:'+k);}
function tagged(data,gate){return data?.testSynthetic===true&&data?.syntheticTagPrefix===SYNTHETIC_PREFIX&&data?.syntheticRequestId===gate.requestId;}
async function countQuery(q){const s=await q.get();return s.size;}
async function taggedCounts(db,gate){const tenant=db.collection('tenants').doc(TENANT_ID),project=tenant.collection('projects').doc(PROJECT_ID),filters=[['visits',project.collection('visits')],['postulations',project.collection('postulations')],['receipts',tenant.collection('commandReceipts')],['audit',tenant.collection('entityAuditTrail')],['shoppers',tenant.collection('shoppers')]];const out={};for(const [name,col] of filters)out[name]=await countQuery(col.where('syntheticRequestId','==',gate.requestId));return out;}
async function deleteTaggedCollection(db,col,gate){const snap=await col.where('syntheticRequestId','==',gate.requestId).get();let deleted=0;for(const doc of snap.docs){const data=doc.data()||{};if(!tagged(data,gate))throw new Error('F5_SYNTHETIC_CLEANUP_TAG_MISMATCH');await doc.ref.delete();deleted++;}return deleted;}

export function createF5SyntheticAcceptanceProvider({auth,db,gate}={}){
  const gv=validateF5Gate(gate);if(!gv.ok)throw new Error('F5_SYNTHETIC_GATE_INVALID:'+gv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection)throw new Error('F5_SYNTHETIC_DEPENDENCIES_MISSING');
  const base=createG2BSyntheticVisitProvider({auth,db,gate:{schemaVersion:'cxorbia.g2b.synthetic-lifecycle-write-gate.v1',repository:gate.repository,branch:gate.branch,pullRequest:7,firebaseProjectId:gate.firebaseProjectId,tenantId:TENANT_ID,projectId:PROJECT_ID,enabled:true,authorizedBy:'Paula',requestId:gate.requestId,syntheticDataOnly:true,syntheticTagPrefix:SYNTHETIC_PREFIX,realHrVisitMutationAllowed:false,externalHrWrites:0,realDataWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,storageWrites:0,merge:false,automaticRetryAllowed:false}});
  return Object.freeze({
    version:VERSION,
    async seed(ids={}){
      validateIds(ids);const r=refs(db,ids),t=tag(gate),[v,s]=await Promise.all([r.visit.get(),r.shopper.get()]);if(v.exists&&!tagged(v.data()||{},gate))return blocked('F5_SYNTHETIC_VISIT_COLLISION');if(s.exists&&!tagged(s.data()||{},gate))return blocked('F5_SYNTHETIC_SHOPPER_COLLISION');const batch=db.batch();if(!v.exists)batch.create(r.visit,{id:ids.visitId,visitId:ids.visitId,tenantId:TENANT_ID,projectId:PROJECT_ID,estado:'disponible',status:'disponible',version:1,...t});if(!s.exists)batch.create(r.shopper,{id:ids.shopperId,shopperId:ids.shopperId,tenantId:TENANT_ID,projectIds:[PROJECT_ID],active:true,certified:true,status:'active',version:1,...t});await batch.commit();return {ok:true,status:'committed',providerAck:true,providerWrites:Number(!v.exists)+Number(!s.exists),syntheticOnly:true,ids,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
    },
    async execute(token,command){if(command?.tenantId!==TENANT_ID||command?.projectId!==PROJECT_ID)return blocked('F5_SYNTHETIC_SCOPE_MISMATCH');return base.execute(token,command);},
    async readback(){const counts=await taggedCounts(db,gate);return {ok:true,status:'readback',counts,syntheticOnly:true,requestId:gate.requestId};},
    async cleanup(ids={}){
      validateIds(ids);const r=refs(db,ids),v=await r.visit.get(),s=await r.shopper.get();for(const snap of [v,s])if(snap.exists&&!tagged(snap.data()||{},gate))throw new Error('F5_SYNTHETIC_CLEANUP_TAG_MISMATCH');const removed={postulations:await deleteTaggedCollection(db,r.postulations,gate),receipts:await deleteTaggedCollection(db,r.receipts,gate),audit:await deleteTaggedCollection(db,r.audit,gate),visits:0,shoppers:0};if(v.exists){await r.visit.delete();removed.visits=1;}if(s.exists){await r.shopper.delete();removed.shoppers=1;}const residual=await taggedCounts(db,gate),total=Object.values(residual).reduce((a,b)=>a+Number(b||0),0);if(total!==0)throw new Error('F5_SYNTHETIC_POST_CLEANUP_RESIDUE');return {ok:true,status:'clean',providerAck:true,providerWrites:Object.values(removed).reduce((a,b)=>a+b,0),removed,residual,syntheticOnly:true};
    }
  });
}
