#!/usr/bin/env node
/* R07 DEV external-HR cancellation read-only reconciliation.
 * Does not create/release visits, submit commands, mutate HR, or infer ACK.
 * Same artifact and exact HR revision required. Outputs only counts and non-identifying decisions.
 */
import fs from 'node:fs';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

const E=process.env;
const source=String(E.FOCAL_SOURCE||''),expected=String(E.EXPECTED_HR_REVISION||'');
const root=String(E.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const out=String(E.R07_OUT||'.tmp/phasea-representative-live/r07');
const tenantId='tya',projectId='cinepolis',str=x=>String(x??'').trim(),arr=x=>Array.isArray(x)?x:[];
fs.mkdirSync(out,{recursive:true});
const evidence={schemaVersion:'cxorbia.i3.r07.external-hr-readonly.v1',
 decision:'HOLD_R07_UNPROVEN',classification:null,productSourceSha:source,
 expectedHrRevision:expected,externalHrRevision:null,readbackHrRevision:null,
 scope:'EXTERNAL_HR_CANCEL_ACK_INDEPENDENT_READONLY',noWrite:true,
 firestoreWrites:0,hrWrites:0,authWrites:0,paymentWrites:0,deploys:0,production:false,
 cases:{pendingReview:0,approvedPendingHr:0,rejected:0,approved:0,other:0},
 externalHrMatched:0,externalHrUnmatched:0,externalPendingFalselyAvailable:0,
 completeReleasedExternalAckProven:0};
const persist=()=>{fs.writeFileSync(out+'/result.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));};
const fail=(classification,reason)=>{evidence.classification=classification;evidence.decision='HOLD_R07_'+reason;persist();process.exitCode=2;};
function revOf(body,meta){
  const snap=body?.snapshot||body?.data||body||{};
  return str(meta?.revision||body?._runtime?.revision||snap?._runtime?.revision||snap.sourceRevision);
}
async function hrRead(kind){
  const [a,b]=await Promise.all([
    fetch(root+'/api/'+tenantId+'/'+projectId+'/hr-live?format=meta&r07_'+kind+'='+Date.now(),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(95000)}),
    fetch(root+'/api/'+tenantId+'/'+projectId+'/hr-live?format=json&r07_'+kind+'='+Date.now(),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(95000)})
  ]);
  if(!a.ok||!b.ok)throw Error('PROVIDER_FAILURE_HR_HTTP');
  const [meta,body]=await Promise.all([a.json(),b.json()]);
  if(meta.ok!==true||meta.sourceSafe!==true||meta.revisionStable!==true)throw Error('PROVIDER_FAILURE_HR_META');
  const snap=body.snapshot||body.data||body;
  if(snap.sourceSafe!==true||!Array.isArray(snap.visits))throw Error('SOURCE_FAILURE_HR_SHAPE');
  const revision=revOf(body,meta);
  if(!/^[a-f0-9]{64}$/.test(revision))throw Error('SOURCE_FAILURE_HR_REVISION_MISSING');
  return {revision,visits:snap.visits};
}
try{
  if(!/^[a-f0-9]{40}$/.test(source)||!/^[a-f0-9]{64}$/.test(expected))throw Error('SOURCE_FAILURE_SOURCE_OR_HR_UNPINNED');
  if(new URL(root).origin!=='https://cxorbia-backend-dev.web.app')throw Error('ENVIRONMENT_FAILURE_NON_DEV_ORIGIN');
  const first=await hrRead('before');evidence.externalHrRevision=first.revision;
  if(first.revision!==expected)throw Error('ENVIRONMENT_FAILURE_HR_REVISION_DRIFT');
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:'cxorbia-backend-dev'});
  const project=getFirestore().collection('tenants').doc(tenantId).collection('projects').doc(projectId);
  const [projectSnap,localSnap]=await Promise.all([project.get(),project.collection('visits').get()]);
  if(!projectSnap.exists)throw Error('SOURCE_FAILURE_PROJECT_NOT_FOUND');
  const config=projectSnap.data()||{},route=config.operationalSource||config.routeSource||{};
  const mode=str(typeof route==='string'?route:route.mode||route.sourceType||route.authority).toLowerCase();
  if(mode==='internal')throw Error('SOURCE_FAILURE_EXTERNAL_ROUTE_NOT_CONFIRMED');
  const external=new Map();
  for(const v of first.visits){
    for(const k of [str(v.hrRowId),str(v.id),str(v.visitId)].filter(Boolean))if(!external.has(k))external.set(k,v);
  }
  let seen=0;const states=[];
  for(const snap of localSnap.docs){
    const v=snap.data()||{},c=v.cancelRequest;
    if(!c||!str(c.status))continue;
    seen++;
    const state=str(c.status).toLowerCase(),key=str(v.hrRowId||v.visitId||v.id||snap.id);
    if(['pending_review','approved_pending_hr','rejected','approved'].includes(state))evidence.cases[state==='pending_review'?'pendingReview':state==='approved_pending_hr'?'approvedPendingHr':state]++;
    else evidence.cases.other++;
    const hv=external.get(key)||null;
    if(hv)evidence.externalHrMatched++;else evidence.externalHrUnmatched++;
    const projectAvailable=v.canonicalFacets?.available===true||str(v.estado||v.status).toLowerCase()==='disponible';
    if(state==='approved_pending_hr'){
      if(projectAvailable)evidence.externalPendingFalselyAvailable++;
      states.push({status:state,hrMatched:!!hv,projectAvailable});
    }
    if(state==='approved'&&hv){
      // Read-only does not substitute an external provider's write ACK.
      // Completed source state alone is not proof of a new external write.
      states.push({status:state,hrMatched:true,projectAvailable});
    }
  }
  evidence.cancellationRecordsInspected=seen;
  evidence.hrVisitsInspected=first.visits.length;
  const second=await hrRead('after');evidence.readbackHrRevision=second.revision;
  if(second.revision!==expected)throw Error('ENVIRONMENT_FAILURE_HR_REVISION_CHANGED_DURING_READ');
  if(evidence.externalPendingFalselyAvailable>0)throw Error('MAPPING_FAILURE_PENDING_HR_ALREADY_AVAILABLE_IN_PLATFORM');
  evidence.safetyInvariantPass=true;
  evidence.externalHrAckWriteNotAttempted=true;
  evidence.completeReleasedExternalAckProven=0;
  evidence.decision=evidence.cases.approvedPendingHr>0?'HOLD_R07_EXTERNAL_HR_ACK_PENDING':
    seen===0?'HOLD_R07_NO_EXISTING_CANCELLATION_CASE':
    'HOLD_R07_EXTERNAL_HR_ACK_NOT_PROVEN';
  // Absence of an external ACK receipt is not a provider failure.
  evidence.classification=null;
  evidence.evidenceGap='NO_LIVE_APPROVED_EXTERNAL_HR_ACK_AND_RELEASE_CASE';
  persist();
  process.exitCode=2;
}catch(e){
  const m=str(e?.message),type=m.split('_')[0];
  const classification=['SOURCE','MAPPING','PROVIDER','AUTH','ENVIRONMENT'].includes(type)?type+'_FAILURE':'FUNCTIONAL_DEFECT';
  fail(classification,m.replace(/[^A-Z0-9_]/g,'').slice(0,95)||'UNKNOWN');
}
