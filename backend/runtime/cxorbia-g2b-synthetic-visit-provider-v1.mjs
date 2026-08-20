#!/usr/bin/env node
/* CXOrbia G2-B synthetic-only lifecycle provider wrapper.
   Reuses the frozen I4-B lifecycle provider but adds a hard production firewall:
   only CXORBIA_E2E_SYNTH_* resources explicitly tagged for the current G2-B
   request can be touched. Real HR, real identities, payments, Make/Gemini,
   Storage and non-synthetic business data are outside this provider. */
import crypto from 'node:crypto';
import {createVisitLifecycleProvider} from './cxorbia-visit-lifecycle-command-provider-v1.mjs';

export const VERSION='cxorbia-g2b-synthetic-visit-provider-v1';
export const EXPECTED_PREFIX='CXORBIA_E2E_SYNTH_';
const str=v=>String(v==null?'':v).trim();
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const pref=(v,prefix)=>str(v).startsWith(prefix);
const blocked=(code)=>({ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,code});

export function validateG2BGate(gate={}){
  const errors=[];
  if(gate.schemaVersion!=='cxorbia.g2b.synthetic-lifecycle-write-gate.v1')errors.push('schema');
  if(gate.repository!=='paulaosoriof86/demoCXOrbia'||gate.branch!=='docs-tya-v6-v71-audit'||Number(gate.pullRequest)!==7)errors.push('lane');
  if(gate.firebaseProjectId!=='cxorbia-backend-dev'||gate.tenantId!=='tya'||gate.projectId!=='cinepolis')errors.push('target');
  if(gate.enabled!==true||gate.authorizedBy!=='Paula'||gate.syntheticDataOnly!==true||gate.syntheticTagPrefix!==EXPECTED_PREFIX)errors.push('authorization');
  if(!str(gate.requestId)||gate.realHrVisitMutationAllowed!==false||gate.externalHrWrites!==0||gate.realDataWrites!==0||gate.realAuthWrites!==0||gate.realPaymentWrites!==0||gate.makeCalls!==0||gate.geminiCalls!==0||gate.storageWrites!==0)errors.push('forbidden-scope');
  if(gate.merge!==false||gate.automaticRetryAllowed!==false)errors.push('lifecycle');
  return {ok:errors.length===0,errors};
}

function legacyGate(gate){
  return {
    schemaVersion:'cxorbia.i4b.visit-lifecycle-write-gate.v1',repository:gate.repository,branch:gate.branch,pullRequest:gate.pullRequest,
    firebaseProjectId:gate.firebaseProjectId,tenantId:gate.tenantId,projectId:gate.projectId,enabled:true,consumed:false,authorizedBy:'Paula',allowedExecutions:1,
    syntheticVisitOnly:true,historicalShopperAccess:false,realHrVisitMutationAllowed:false,hrWrites:0,rulesWrites:0,storageWrites:0,makeCalls:0,geminiCalls:0,paymentWrites:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,production:false
  };
}

function refs(db,command){
  const tenant=db.collection('tenants').doc(command.tenantId),project=tenant.collection('projects').doc(command.projectId);
  const receiptId=sha(`${command.tenantId}\0${command.projectId}\0${command.idempotencyKey}`).slice(0,40);
  const auditId=sha(`${command.idempotencyKey}\0${command.commandType}\0audit`).slice(0,40);
  return {tenant,project,visits:project.collection('visits'),postulations:project.collection('postulations'),shoppers:tenant.collection('shoppers'),receipt:tenant.collection('commandReceipts').doc(receiptId),audit:tenant.collection('entityAuditTrail').doc(auditId)};
}

function tagged(data,gate){return data?.testSynthetic===true&&str(data?.syntheticRequestId)===str(gate.requestId)&&str(data?.syntheticTagPrefix)===gate.syntheticTagPrefix;}
async function requireTagged(ref,gate,missingCode,tagCode){const s=await ref.get();if(!s.exists)throw new Error(missingCode);if(!tagged(s.data()||{},gate))throw new Error(tagCode);return s.data()||{};}

async function preflight(auth,db,token,command,gate){
  if(command.tenantId!==gate.tenantId||command.projectId!==gate.projectId)return blocked('G2B_SYNTHETIC_SCOPE_MISMATCH');
  if(!pref(command.entityId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_ENTITY_ID_REQUIRED');
  let decoded;try{decoded=await auth.verifyIdToken(token,true);}catch{return blocked('G2B_SYNTHETIC_INVALID_AUTHORIZATION');}
  if(str(decoded.tenantId)!==gate.tenantId)return blocked('G2B_SYNTHETIC_ACTOR_TENANT_DENIED');
  if(str(decoded.role)==='shopper'&&!pref(decoded.shopperId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_REAL_SHOPPER_ACTOR_FORBIDDEN');
  const r=refs(db,command),p=command.payload||{};
  if(command.commandType==='application.create'){
    const visitId=str(p.visitId||command.entityId);if(!pref(visitId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_VISIT_ID_REQUIRED');
    await requireTagged(r.visits.doc(visitId),gate,'G2B_SYNTHETIC_VISIT_MISSING','G2B_SYNTHETIC_VISIT_TAG_INVALID');
    const shopperId=str(p.shopperId||decoded.shopperId);if(!pref(shopperId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_SHOPPER_ID_REQUIRED');
    await requireTagged(r.shoppers.doc(shopperId),gate,'G2B_SYNTHETIC_SHOPPER_MISSING','G2B_SYNTHETIC_SHOPPER_TAG_INVALID');
  }else if(command.commandType==='application.status.update'){
    const a=await requireTagged(r.postulations.doc(command.entityId),gate,'G2B_SYNTHETIC_APPLICATION_MISSING','G2B_SYNTHETIC_APPLICATION_TAG_INVALID');
    const visitId=str(a.visitId||a.visitaId||p.visitId);if(!pref(visitId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_VISIT_ID_REQUIRED');
    await requireTagged(r.visits.doc(visitId),gate,'G2B_SYNTHETIC_VISIT_MISSING','G2B_SYNTHETIC_VISIT_TAG_INVALID');
  }else{
    const visitId=str(p.visitId||command.entityId);if(!pref(visitId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_VISIT_ID_REQUIRED');
    await requireTagged(r.visits.doc(visitId),gate,'G2B_SYNTHETIC_VISIT_MISSING','G2B_SYNTHETIC_VISIT_TAG_INVALID');
    if(command.commandType==='visit.assign'){
      const shopperId=str(p.shopperId);if(!pref(shopperId,gate.syntheticTagPrefix))return blocked('G2B_SYNTHETIC_SHOPPER_ID_REQUIRED');
      await requireTagged(r.shoppers.doc(shopperId),gate,'G2B_SYNTHETIC_SHOPPER_MISSING','G2B_SYNTHETIC_SHOPPER_TAG_INVALID');
    }
  }
  return null;
}

export function createG2BSyntheticVisitProvider({auth,db,gate}={}){
  const gv=validateG2BGate(gate);if(!gv.ok)throw new Error('G2B_SYNTHETIC_WRITE_GATE_INVALID:'+gv.errors.join(','));
  const base=createVisitLifecycleProvider({auth,db,gate:legacyGate(gate)});
  return Object.freeze({
    version:VERSION,
    async execute(token,command){
      const denied=await preflight(auth,db,token,command,gate);if(denied)return denied;
      const result=await base.execute(token,command);if(!(result?.ok===true&&result?.status==='committed'&&result?.providerAck===true))return result;
      const r=refs(db,command),tag={testSynthetic:true,syntheticTagPrefix:gate.syntheticTagPrefix,syntheticRequestId:gate.requestId,syntheticGate:'I5-G2-B',syntheticUpdatedAt:new Date().toISOString()};
      const batch=db.batch();batch.set(r.receipt,tag,{merge:true});batch.set(r.audit,tag,{merge:true});let tagWrites=2;
      if(command.commandType==='application.create'){batch.set(r.postulations.doc(result.entityId),tag,{merge:true});tagWrites++;}
      await batch.commit();
      return {...result,providerWrites:Number(result.providerWrites||0)+tagWrites,syntheticOnly:true,syntheticTagPrefix:gate.syntheticTagPrefix,syntheticRequestId:gate.requestId,realDataWrites:0,externalHrWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0};
    },
    status(){return {version:VERSION,syntheticOnly:true,syntheticTagPrefix:gate.syntheticTagPrefix,syntheticRequestId:gate.requestId,targetProject:gate.firebaseProjectId,tenantId:gate.tenantId,projectId:gate.projectId,realDataWrites:0,externalHrWrites:0,realAuthWrites:0,realPaymentWrites:0,makeCalls:0,geminiCalls:0,storageWrites:0,merge:false};}
  });
}

export default {VERSION,EXPECTED_PREFIX,validateG2BGate,createG2BSyntheticVisitProvider};
