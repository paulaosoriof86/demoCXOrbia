import crypto from 'node:crypto';

export const VERSION='cxorbia-f5-synthetic-acceptance-provider-v1';
export const SYNTHETIC_PREFIX='CXORBIA_E2E_SYNTH_';
export const SYNTHETIC_PROJECT_ID='CXORBIA_E2E_SYNTH_CINEPOLIS_2026';
const TENANT_ID='tya';
const CONTROL_PROJECT_ID='cinepolis';
const STAFF_ROLES=new Set(['super','admin','ops','coordinador']);
const str=v=>String(v==null?'':v).trim();
const now=()=>new Date().toISOString();
const pref=v=>str(v).startsWith(SYNTHETIC_PREFIX);
const hash=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex').slice(0,40);
const blocked=(code,extra={})=>({ok:false,status:'blocked',committed:false,providerAck:false,providerWrites:0,syntheticOnly:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,code,...extra});
const tag=gate=>({testSynthetic:true,syntheticTagPrefix:SYNTHETIC_PREFIX,syntheticRequestId:gate.requestId,syntheticGate:'F5',syntheticUpdatedAt:now()});

export function validateF5Gate(gate={}){
  const errors=[];
  if(gate.schemaVersion!=='cxorbia.f5.synthetic-acceptance-gate.v1')errors.push('schema');
  if(gate.repository!=='paulaosoriof86/demoCXOrbia'||gate.branch!=='docs-tya-v6-v71-audit')errors.push('lane');
  if(gate.firebaseProjectId!=='cxorbia-backend-dev'||gate.tenantId!==TENANT_ID||gate.controlProjectId!==CONTROL_PROJECT_ID||gate.syntheticProjectId!==SYNTHETIC_PROJECT_ID)errors.push('target');
  if(gate.enabled!==true||gate.authorizedBy!=='Paula'||gate.syntheticDataOnly!==true||gate.syntheticTagPrefix!==SYNTHETIC_PREFIX)errors.push('authorization');
  if(!str(gate.requestId)||!str(gate.authorizationId)||gate.cleanupRequired!==true||gate.postCleanupReadbackRequired!==true)errors.push('contract');
  for(const k of ['realDataWrites','externalHrWrites','realAuthWrites','realPaymentWrites','rulesWrites','storageWrites','makeCalls','geminiCalls','hostingDeploys','cloudRunDeploys'])if(Number(gate[k]||0)!==0)errors.push('forbidden-'+k);
  if(gate.merge!==false||gate.automaticRetryAllowed!==false)errors.push('lifecycle');
  return {ok:errors.length===0,errors};
}

function refs(db,gate,ids={}){
  const tenant=db.collection('tenants').doc(TENANT_ID);
  const project=tenant.collection('projects').doc(SYNTHETIC_PROJECT_ID);
  return {
    tenant,project,
    visits:project.collection('visits'),
    postulations:project.collection('postulations'),
    shoppers:tenant.collection('shoppers'),
    receipts:tenant.collection('commandReceipts'),
    audit:tenant.collection('entityAuditTrail'),
    visit:ids.visitId?project.collection('visits').doc(ids.visitId):null,
    shopper:ids.shopperId?tenant.collection('shoppers').doc(ids.shopperId):null,
    result:ids.resultId?project.collection('results').doc(ids.resultId):null,
    review:ids.reviewId?project.collection('reviews').doc(ids.reviewId):null,
    approval:ids.approvalId?project.collection('approvals').doc(ids.approvalId):null
  };
}

function validateIds(ids={}){
  const required=['visitId','shopperId','resultId','reviewId','approvalId'];
  const bad=required.filter(k=>!pref(ids[k]));
  return {ok:bad.length===0,bad};
}

async function actor(auth,db,token,gate,{allowShopper=false}={}){
  let decoded;try{decoded=await auth.verifyIdToken(token,true);}catch{return {error:'F5_SYNTHETIC_INVALID_AUTHORIZATION'};}
  if(str(decoded.tenantId)!==TENANT_ID)return {error:'F5_SYNTHETIC_ACTOR_TENANT_DENIED'};
  const role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(STAFF_ROLES.has(role)){
    if(namespace!=='staff')return {error:'F5_SYNTHETIC_ACTOR_NAMESPACE_DENIED'};
  }else if(allowShopper&&role==='shopper'){
    if(namespace!=='shopper'||!pref(decoded.shopperId))return {error:'F5_SYNTHETIC_SHOPPER_ACTOR_DENIED'};
  }else return {error:'F5_SYNTHETIC_ACTOR_ROLE_DENIED'};
  const member=await db.collection('tenants').doc(TENANT_ID).collection('users').doc(decoded.uid).get();
  if(!member.exists)return {error:'F5_SYNTHETIC_MEMBERSHIP_MISSING'};
  const m=member.data()||{};
  if(m.active!==true||str(m.tenantId)!==TENANT_ID||str(m.role)!==role)return {error:'F5_SYNTHETIC_MEMBERSHIP_INVALID'};
  return {uid:decoded.uid,role,shopperId:str(decoded.shopperId||m.shopperId),decoded};
}

function ensureTagged(data,gate){return data?.testSynthetic===true&&data?.syntheticTagPrefix===SYNTHETIC_PREFIX&&str(data?.syntheticRequestId)===str(gate.requestId);}
function lifecycleState(data={}){return str(data.status||data.estado).toUpperCase();}
function expected(current,allowed,code){if(!allowed.includes(current))throw Object.assign(new Error(code),{code});}

async function queryTagged(collection,gate){
  const snap=await collection.where('syntheticRequestId','==',gate.requestId).get();
  const out=[];for(const doc of snap.docs){const data=doc.data()||{};if(!ensureTagged(data,gate))throw Object.assign(new Error('F5_SYNTHETIC_CLEANUP_TAG_MISMATCH'),{code:'F5_SYNTHETIC_CLEANUP_TAG_MISMATCH'});out.push(doc.ref);}return out;
}

export function createF5SyntheticAcceptanceProvider({auth,db,gate}={}){
  const gv=validateF5Gate(gate);if(!gv.ok)throw new Error('F5_SYNTHETIC_GATE_INVALID:'+gv.errors.join(','));
  if(!auth?.verifyIdToken||!db?.collection||!db?.runTransaction)throw new Error('F5_SYNTHETIC_PROVIDER_DEPENDENCIES_MISSING');

  async function seed(token,ids){
    const iv=validateIds(ids);if(!iv.ok)return blocked('F5_SYNTHETIC_IDS_INVALID',{bad:iv.bad});
    const a=await actor(auth,db,token,gate);if(a.error)return blocked(a.error);
    const r=refs(db,gate,ids),t=tag(gate);
    const existingVisit=await r.visit.get(),existingShopper=await r.shopper.get();
    if(existingVisit.exists&&!ensureTagged(existingVisit.data()||{},gate))return blocked('F5_SYNTHETIC_VISIT_COLLISION');
    if(existingShopper.exists&&!ensureTagged(existingShopper.data()||{},gate))return blocked('F5_SYNTHETIC_SHOPPER_COLLISION');
    const batch=db.batch();let writes=0;
    if(!existingVisit.exists){batch.create(r.visit,{id:ids.visitId,visitId:ids.visitId,tenantId:TENANT_ID,projectId:SYNTHETIC_PROJECT_ID,status:'AVAILABLE',estado:'AVAILABLE',shopperId:null,version:1,assignmentSource:null,assignmentSyncStatus:null,createdAt:now(),updatedAt:now(),...t});writes++;}
    if(!existingShopper.exists){batch.create(r.shopper,{id:ids.shopperId,shopperId:ids.shopperId,tenantId:TENANT_ID,status:'active',active:true,syntheticOnly:true,createdAt:now(),updatedAt:now(),...t});writes++;}
    if(writes)await batch.commit();
    return {ok:true,status:writes?'committed':'NO_OP_ALREADY_SEEDED',providerAck:true,providerWrites:writes,syntheticOnly:true,ids,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
  }

  async function execute(token,operation,ids,payload={}){
    const iv=validateIds(ids);if(!iv.ok)return blocked('F5_SYNTHETIC_IDS_INVALID',{bad:iv.bad});
    const allowShopper=['CONFIRM','CHECK_IN','SUBMIT_RESULT'].includes(operation);
    const a=await actor(auth,db,token,gate,{allowShopper});if(a.error)return blocked(a.error);
    const r=refs(db,gate,ids),t=tag(gate);
    try{
      return await db.runTransaction(async tx=>{
        const vs=await tx.get(r.visit);if(!vs.exists)throw Object.assign(new Error('F5_SYNTHETIC_VISIT_MISSING'),{code:'F5_SYNTHETIC_VISIT_MISSING'});
        const v=vs.data()||{};if(!ensureTagged(v,gate))throw Object.assign(new Error('F5_SYNTHETIC_VISIT_TAG_MISMATCH'),{code:'F5_SYNTHETIC_VISIT_TAG_MISMATCH'});
        const state=lifecycleState(v);let writes=0;
        if(operation==='ASSIGN'){
          if(!STAFF_ROLES.has(a.role))throw Object.assign(new Error('F5_SYNTHETIC_OPERATOR_REQUIRED'),{code:'F5_SYNTHETIC_OPERATOR_REQUIRED'});expected(state,['AVAILABLE'],'F5_SYNTHETIC_STATE_ASSIGN_INVALID');
          const ss=await tx.get(r.shopper);if(!ss.exists||!ensureTagged(ss.data()||{},gate))throw Object.assign(new Error('F5_SYNTHETIC_SHOPPER_MISSING_OR_UNTAGGED'),{code:'F5_SYNTHETIC_SHOPPER_MISSING_OR_UNTAGGED'});
          tx.set(r.visit,{shopperId:ids.shopperId,status:'ASSIGNED',estado:'ASSIGNED',assignmentSource:'platform',assignmentSyncStatus:'synthetic_pending',version:Number(v.version||0)+1,updatedAt:now(),...t},{merge:true});writes++;
        }else if(operation==='CONFIRM'){
          expected(state,['ASSIGNED'],'F5_SYNTHETIC_STATE_CONFIRM_INVALID');if(a.role==='shopper'&&a.shopperId!==ids.shopperId)throw Object.assign(new Error('F5_SYNTHETIC_SHOPPER_SCOPE_DENIED'),{code:'F5_SYNTHETIC_SHOPPER_SCOPE_DENIED'});
          tx.set(r.visit,{status:'CONFIRMED',estado:'CONFIRMED',confirmedAt:now(),version:Number(v.version||0)+1,updatedAt:now(),...t},{merge:true});writes++;
        }else if(operation==='CHECK_IN'){
          expected(state,['CONFIRMED'],'F5_SYNTHETIC_STATE_CHECKIN_INVALID');if(a.role==='shopper'&&a.shopperId!==ids.shopperId)throw Object.assign(new Error('F5_SYNTHETIC_SHOPPER_SCOPE_DENIED'),{code:'F5_SYNTHETIC_SHOPPER_SCOPE_DENIED'});
          tx.set(r.visit,{status:'IN_PROGRESS',estado:'IN_PROGRESS',checkedInAt:now(),version:Number(v.version||0)+1,updatedAt:now(),...t},{merge:true});writes++;
        }else if(operation==='SUBMIT_RESULT'){
          expected(state,['IN_PROGRESS'],'F5_SYNTHETIC_STATE_SUBMIT_INVALID');if(a.role==='shopper'&&a.shopperId!==ids.shopperId)throw Object.assign(new Error('F5_SYNTHETIC_SHOPPER_SCOPE_DENIED'),{code:'F5_SYNTHETIC_SHOPPER_SCOPE_DENIED'});
          tx.set(r.visit,{status:'SUBMITTED',estado:'SUBMITTED',resultId:ids.resultId,submittedAt:now(),version:Number(v.version||0)+1,updatedAt:now(),...t},{merge:true});tx.set(r.result,{id:ids.resultId,visitId:ids.visitId,shopperId:ids.shopperId,status:'SUBMITTED',payload:payload.result||{synthetic:true},createdAt:now(),updatedAt:now(),...t});writes+=2;
        }else if(operation==='REVIEW_RESULT'){
          if(!STAFF_ROLES.has(a.role))throw Object.assign(new Error('F5_SYNTHETIC_REVIEWER_REQUIRED'),{code:'F5_SYNTHETIC_REVIEWER_REQUIRED'});expected(state,['SUBMITTED'],'F5_SYNTHETIC_STATE_REVIEW_INVALID');
          tx.set(r.visit,{status:'REVIEWED',estado:'REVIEWED',reviewId:ids.reviewId,reviewedBy:a.uid,reviewedAt:now(),version:Number(v.version||0)+1,updatedAt:now(),...t},{merge:true});tx.set(r.review,{id:ids.reviewId,visitId:ids.visitId,resultId:ids.resultId,status:'REVIEWED',reviewedBy:a.uid,createdAt:now(),updatedAt:now(),...t});writes+=2;
        }else if(operation==='APPROVE_RESULT'){
          if(!STAFF_ROLES.has(a.role))throw Object.assign(new Error('F5_SYNTHETIC_APPROVER_REQUIRED'),{code:'F5_SYNTHETIC_APPROVER_REQUIRED'});expected(state,['REVIEWED'],'F5_SYNTHETIC_STATE_APPROVE_INVALID');
          tx.set(r.visit,{status:'APPROVED',estado:'APPROVED',approvalId:ids.approvalId,approvedBy:a.uid,approvedAt:now(),version:Number(v.version||0)+1,updatedAt:now(),...t},{merge:true});tx.set(r.approval,{id:ids.approvalId,visitId:ids.visitId,resultId:ids.resultId,reviewId:ids.reviewId,status:'APPROVED',approvedBy:a.uid,createdAt:now(),updatedAt:now(),...t});writes+=2;
        }else throw Object.assign(new Error('F5_SYNTHETIC_OPERATION_INVALID'),{code:'F5_SYNTHETIC_OPERATION_INVALID'});
        const receipt=r.receipts.doc(hash(`${gate.requestId}\0${operation}\0${ids.visitId}`));const audit=r.audit.doc(hash(`${gate.requestId}\0${operation}\0audit\0${ids.visitId}`));
        tx.set(receipt,{operation,visitId:ids.visitId,status:'committed',actorUid:a.uid,createdAt:now(),...t});tx.set(audit,{operation,visitId:ids.visitId,actorUid:a.uid,actorRole:a.role,createdAt:now(),...t});writes+=2;
        return {ok:true,status:'committed',committed:true,providerAck:true,providerWrites:writes,operation,visitId:ids.visitId,syntheticOnly:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
      });
    }catch(error){return blocked(str(error?.code||error?.message||'F5_SYNTHETIC_COMMAND_FAILED').split(':')[0]);}
  }

  async function readback(token,ids){
    const iv=validateIds(ids);if(!iv.ok)return blocked('F5_SYNTHETIC_IDS_INVALID',{bad:iv.bad});
    const a=await actor(auth,db,token,gate,{allowShopper:true});if(a.error)return blocked(a.error);
    const r=refs(db,gate,ids);const [visit,shopper,result,review,approval]=await Promise.all([r.visit.get(),r.shopper.get(),r.result.get(),r.review.get(),r.approval.get()]);
    const view=s=>({exists:s.exists,tagged:s.exists?ensureTagged(s.data()||{},gate):false,status:s.exists?lifecycleState(s.data()||{}):null});
    return {ok:true,status:'readback',providerAck:true,providerWrites:0,syntheticOnly:true,visit:view(visit),shopper:view(shopper),result:view(result),review:view(review),approval:view(approval),realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
  }

  async function cleanup(token,ids){
    const iv=validateIds(ids);if(!iv.ok)return blocked('F5_SYNTHETIC_IDS_INVALID',{bad:iv.bad});
    const a=await actor(auth,db,token,gate);if(a.error)return blocked(a.error);
    const r=refs(db,gate,ids),collections=[r.visits,r.postulations,r.project.collection('results'),r.project.collection('reviews'),r.project.collection('approvals'),r.shoppers,r.receipts,r.audit];
    try{
      const groups=await Promise.all(collections.map(c=>queryTagged(c,gate)));const refsToDelete=[...new Map(groups.flat().map(ref=>[ref.path,ref])).values()];
      if(refsToDelete.length>100)return blocked('F5_SYNTHETIC_CLEANUP_BUDGET_EXCEEDED',{found:refsToDelete.length});
      if(refsToDelete.length){const batch=db.batch();for(const ref of refsToDelete)batch.delete(ref);await batch.commit();}
      const remaining=(await Promise.all(collections.map(c=>queryTagged(c,gate)))).flat();
      if(remaining.length)return blocked('F5_SYNTHETIC_CLEANUP_INCOMPLETE',{remaining:remaining.map(x=>x.path)});
      return {ok:true,status:'CLEANUP_PASS',providerAck:true,providerWrites:refsToDelete.length,deleted:refsToDelete.map(x=>x.path),remaining:0,syntheticOnly:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
    }catch(error){return blocked(str(error?.code||error?.message||'F5_SYNTHETIC_CLEANUP_FAILED').split(':')[0]);}
  }

  return Object.freeze({version:VERSION,seed,execute,readback,cleanup,status(){return {version:VERSION,tenantId:TENANT_ID,controlProjectId:CONTROL_PROJECT_ID,syntheticProjectId:SYNTHETIC_PROJECT_ID,syntheticOnly:true,cleanupRequired:true,postCleanupReadbackRequired:true,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};}});
}

export default {VERSION,SYNTHETIC_PREFIX,SYNTHETIC_PROJECT_ID,validateF5Gate,createF5SyntheticAcceptanceProvider};