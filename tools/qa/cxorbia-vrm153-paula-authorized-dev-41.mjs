#!/usr/bin/env node
/* Recovery I3 VRM-153: one-time, Paula-authorized, exact 41 DEV Firestore historical
 * reconciliation. Only finance.historical.reconcile provider transactions are used.
 * The old pending audit records are retained as superseded, never deleted.
 * No HR, bank, external payment, financial movement, production or Hosting write.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {applicationDefault,initializeApp,getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import {createFinanceCommandProvider} from '../../backend/runtime/cxorbia-finance-command-provider-v1.mjs';

const str=v=>String(v??'').trim();
const arr=v=>Array.isArray(v)?v:[];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const must=(x,message)=>{if(!x)throw new Error('VRM153_FAIL_CLOSED:'+message);};
const OUT=process.env.OUT||'.tmp/vrm153-paula-authorized-dev-41';
const PROJECT=process.env.PROJECT||'cxorbia-backend-dev';
const TENANT=process.env.TENANT_ID||'tya',PROGRAM=process.env.PROJECT_ID||'cinepolis';
const HOST=str(process.env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const DRY=process.env.DRY_RESULT||OUT+'/dry/result.json';
const BEFORE=process.env.PREFLIGHT_RESULT||OUT+'/before/result.json';
const APPROVAL='PAULA_CHAT_2026-10-08_DEV_VRM153_EXACT_41';
const FROZEN_REVISION='9f543e12c27ac76be6add2d8abadca61c238f1d787ca5f073b5b0496f1e172ef';
const SOURCE='d9915f330a8d6e5fc2b4f2019872a4b03eaf7ced';
const SOURCE_TREE='edf38a46ee4630d2bf0f31520cecc1c77f3b9835';
const GROUPS=[
 {period:'2026-08',country:'GT',status:'paid',count:34,kind:'supersession'},
 {period:'2026-08',country:'HN',status:'paid',count:3,kind:'initialPaid'},
 {period:'2026-09',country:'GT',status:'pending',count:3,kind:'initialPending'},
 {period:'2026-09',country:'HN',status:'pending',count:1,kind:'initialPending'}
];
const receipts=[];
fs.mkdirSync(OUT,{recursive:true});
function save(stage,extra={}){
 fs.writeFileSync(OUT+'/result.json',JSON.stringify({
  schemaVersion:'cxorbia.i3.vrm153.paula-authorized-dev-41.v1',
  stage,scope:{tenantId:TENANT,projectId:PROGRAM},approval:APPROVAL,
  sourceSha:SOURCE,sourceTree:SOURCE_TREE,hrRevision:FROZEN_REVISION,
  receipts,initialCommittedGroups:receipts.length,
  production:false,...extra
 },null,2)+'\n');
}
async function hrRead(){
 const url=HOST+'/api/tya/cinepolis/hr-live?format=json&vrm153=authorized-'+Date.now();
 const response=await fetch(url,{headers:{'cache-control':'no-cache,no-store,max-age=0'}});
 must(response.ok,'EXACT_DEV_HR_HTTP_'+response.status);
 const revision=str(response.headers.get('x-cxorbia-source-revision'));
 must(revision===FROZEN_REVISION,'HR_REVISION_CHANGED');
 const snapshot=await response.json();
 must(arr(snapshot?.visits).length>0,'NO_EXTERNAL_HR_SNAPSHOT');
 return {snapshot,revision};
}
function inspectAuthorization(){
 must(PROJECT==='cxorbia-backend-dev'&&TENANT==='tya'&&PROGRAM==='cinepolis','DEV_ONLY_SCOPE');
 must(HOST==='https://cxorbia-backend-dev.web.app','DEV_ONLY_HOST');
 const d=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 must(d.status==='HOLD_VRM153_AUTHORIZED_SCOPED_DEV_RECONCILIATION','EXPLICIT_SINGLE_USE_STATUS_REQUIRED');
 must(d?.i3Vrm153PaulaScopedRealDevAuthorization?.approved?.includes('34 August GT'),'EXPLICIT_APPROVAL_RECORD_REQUIRED');
 must(d.productSourceSha===SOURCE&&d.productTreeAuthority===SOURCE_TREE,'SOURCE_AUTHORITY_DRIFT');
 must(d.production==='DO_NOT_TOUCH'&&d.i4Authorized!==true,'PRODUCTION_POLICY');
 must(d.currentMaterialization?.runtimeRevision==='cxorbia-live-hr-dev-00280-95g','DEV_RUNTIME_UNEXPECTED');
 must(d.currentMaterialization?.hostingVersion==='sites/cxorbia-backend-dev/versions/d912c9db59002681','DEV_HOSTING_UNEXPECTED');
 const sourceTree=execFileSync('git',['rev-parse',SOURCE+'^{tree}'],{encoding:'utf8'}).trim();
 must(sourceTree===SOURCE_TREE,'SOURCE_TREE_MISMATCH');
 const changed=execFileSync('git',['diff','--name-only',SOURCE,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source',':(exclude)backend/runtime/hr-live-service/test/**'],{encoding:'utf8'}).trim();
 must(changed==='','UNDECLARED_PRODUCT_DRIFT:'+changed);
 const dry=JSON.parse(fs.readFileSync(DRY,'utf8'));
 const pre=JSON.parse(fs.readFileSync(BEFORE,'utf8'));
 must(dry.decision==='PASS_VRM151_FINAL_CANONICAL_HISTORICAL_DRY_RUN','DRY_RUN_NOT_PASS');
 must(dry.sourceRevision===FROZEN_REVISION&&pre.sourceRevision===FROZEN_REVISION&&pre.hrRevision===FROZEN_REVISION,'HR_SOURCE_REVISION_DIFFERENT');
 must(dry.observed?.canonicalSubmitted===643&&dry.observed?.paid===599&&dry.observed?.pending===44
  &&dry.observed?.amountReviewRequired===5&&dry.observed?.ambiguous===0&&dry.writes===0,'HR_CURRENT_CONTRACT_CHANGED');
 must(pre?.counts?.expectedRecords===643&&pre.counts.records===602&&pre.counts.paid===562
  &&pre.counts.pending===40&&pre.counts.missingExactVisits===41,'DURABLE_BASELINE_CHANGED');
 must(arr(pre.missingRows).length===41&&arr(pre.unexpectedScopeRows).length===0
  &&arr(pre.activeHistoricalDuplicates).length===0&&arr(pre.statusMismatches).length===0
  &&arr(pre.reviewExtra).length===0&&arr(pre.reviewMissing).length===0,'ALREADY_UNRESOLVED_RECONCILIATION_CONFLICT');
 must(pre?.supersessionPreflight?.readyToRequestScopedFinancialAuthorization===true,'EXACT_AUTHORIZED_PREFLIGHT_NOT_PASS');
 must(pre.supersessionPreflight.examined===41&&pre.supersessionPreflight.previousPendingRecords===34
  &&pre.supersessionPreflight.identityVerifiedExact===10&&pre.supersessionPreflight.unrecordedExactVisits===7,'EXACT_SCOPE_COUNTS_CHANGED');
 must(pre.exactIdentityAdjudication?.counts?.sameHumanExact===10
  &&pre.exactIdentityAdjudication?.counts?.ambiguous===0
  &&pre.exactIdentityAdjudication?.counts?.notProven===0,'ALIAS_AUTHORITY_NOT_EXACT');
 const links=pre.exactIdentityAdjudication.safeIdentityLinkRefsByVisitId||{};
 must(Object.keys(links).length===10&&Object.values(links).every(x=>/^irl_[a-zA-Z0-9_-]{8,96}$/.test(str(x))),'LINK_REFS_NOT_EXACT');
 const rows=pre.supersessionPreflight.rows;
 must(rows.length===41&&new Set(rows.map(x=>str(x.visitId))).size===41,'DUPLICATE_TARGET_VISITS');
 const missingById=new Map(pre.missingRows.map(x=>[str(x.visitId),x]));
 must(!arr(dry.amountReviewRows).some(x=>missingById.has(str(x.visitId))),'NEW_FINANCIAL_AMOUNT_REVIEW_NOT_AUTHORIZED');
 for(const g of GROUPS){
  const group=rows.filter(x=>x.period===g.period&&x.country===g.country&&x.expectedStatus===g.status);
  must(group.length===g.count,'GROUP_SIZE_CHANGED:'+g.period+g.country);
  for(const row of group){
   const ref=missingById.get(str(row.visitId));
   must(ref&&str(ref.period)===g.period&&str(ref.country)===g.country
    &&str(ref.expectedStatus)===g.status&&row.visitDocumentPresent===true,'VISIT_REFERENCE_DRIFT');
   if(g.kind==='supersession'){
    must(row.priorRecordFound===true&&row.priorBatchId==='hist-cinepolis-2026-08-pending-scope-v1','PRIOR_AUG_GT_NOT_EXACT');
    const blockers=arr(row.blockers);
    must(blockers.length===0||(blockers.length===1&&blockers[0]==='PRIOR_SHOPPER_ID_MISMATCH'&&!!links[row.visitId]),'UNPROVEN_GT_CONFLICT');
   }else{
    must(row.noExistingReconciliation===true&&row.priorBatchId===null
      &&arr(row.blockers).length===0,'UNAUTHORIZED_EXISTING_RECONCILIATION');
   }
  }
 }
 const dates=arr(dry.batches).map(x=>str(x.period)+':'+str(x.paymentStatus));
 must(dates.includes('2026-08:paid')&&dates.includes('2026-09:pending'),'FROZEN_MONTH_STATUSES_DRIFT');
 return {dry,pre,rows,links,missingById};
}
async function staffToken(auth,db){
 const members=(await db.collection('tenants').doc(TENANT).collection('users').get()).docs
  .map(x=>({...(x.data()||{}),uid:x.id})).filter(x=>
    x.active===true&&str(x.tenantId)===TENANT&&str(x.authNamespace)==='staff'
    &&['super','admin'].includes(str(x.role))
    &&(str(x.role)==='super'||arr(x.projectIds).map(str).includes(PROGRAM)));
 must(members.length>0,'NO_AUTHORIZED_STAFF_PRINCIPAL');
 const login=x=>str(x.visibleLogin||x.username||x.login||x.user).toLowerCase();
 const paula=members.filter(x=>login(x)==='paula.osorio');
 const supers=members.filter(x=>str(x.role)==='super');
 const selected=paula.length===1?paula[0]:(supers.length===1?supers[0]:(members.length===1?members[0]:null));
 must(selected,'NO_UNAMBIGUOUS_OPERATOR_PRINCIPAL');
 const firebaseInit=await fetch(HOST+'/__/firebase/init.json',{cache:'no-store'});
 must(firebaseInit.ok,'FIREBASE_DEV_INIT_UNAVAILABLE');
 const apiKey=str((await firebaseInit.json()).apiKey);
 must(apiKey,'FIREBASE_DEV_API_KEY_MISSING');
 const customToken=await auth.createCustomToken(selected.uid);
 const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(apiKey),{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:customToken,returnSecureToken:true})
 });
 const body=await response.json().catch(()=>({}));
 must(response.ok&&str(body.idToken),'STAFF_TOKEN_EXCHANGE_FAILED');
 return {idToken:body.idToken,uid:selected.uid,role:selected.role};
}
async function run(){
 const ctx=inspectAuthorization();
 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:PROJECT});
 const db=getFirestore(),auth=getAuth(),tenant=db.collection('tenants').doc(TENANT);
 const movementsBefore=(await tenant.collection('financialMovements').get()).size;
 const {snapshot}=await hrRead();
 const byHrId=new Map(arr(snapshot.visits).map(v=>[str(v.id||v.visitId),v]));
 for(const row of ctx.rows){
  const h=byHrId.get(str(row.visitId));
  must(h&&str(h.hrRowId)===str(ctx.missingById.get(row.visitId).hrRowId),'VISIT_NOT_IN_EXACT_FRESH_HR');
 }
 save('PREFLIGHT_PASS', {scopeCount:41,groups:GROUPS.map(x=>({period:x.period,country:x.country,status:x.status,count:x.count})),writes:0});
 const principal=await staffToken(auth,db);
 const policy={schemaVersion:'cxorbia.finance-command-provider-policy.v1',enabled:true,
  allowedTenantIds:[TENANT],allowedProjectIds:[PROGRAM],conflictPolicy:'review_no_silent_overwrite',
  externalPaymentWrites:false,bankWrites:false,hrWrites:false};
 const provider=createFinanceCommandProvider({auth,db,policy,hrSnapshot:snapshot,hrRevision:FROZEN_REVISION});
 for(const group of GROUPS){
  // Every transaction must retain the exact same external revision.
  await hrRead();
  const rows=ctx.rows.filter(x=>x.period===group.period&&x.country===group.country&&x.expectedStatus===group.status)
   .sort((a,b)=>str(a.visitId).localeCompare(str(b.visitId)));
  const visitIds=rows.map(x=>str(x.visitId));
  const visitRefs=rows.map(x=>({visitId:str(x.visitId),hrRowId:str(ctx.missingById.get(x.visitId).hrRowId)}));
  const batchId='hist-'+PROGRAM+'-'+group.period+'-'+group.status+'-scope-v1';
  const identityLinkRefsByVisitId=Object.fromEntries(rows.filter(x=>!!ctx.links[x.visitId]).map(x=>[x.visitId,ctx.links[x.visitId]]));
  const payload={visitIds,visitRefs,paymentStatus:group.status,reconciliationBatchId:batchId,
    sourceRef:'paula-authorized:2026-10-08:dev:vrm153:historical',
    sourceRevision:FROZEN_REVISION,notes:'Historical state reconstruction only; no bank transfer initiated or confirmed'};
  if(group.kind==='supersession')payload.supersession={
    priorBatchId:'hist-cinepolis-2026-08-pending-scope-v1',priorPaymentStatus:'pending',
    authorityRef:APPROVAL,paymentDate:'2026-10-02',identityLinkRefsByVisitId
  };
  if(group.kind==='initialPaid'){
   payload.historicalPaymentDate='2026-10-02';
   payload.historicalPaymentAuthorityRef=APPROVAL;
  }
  const idempotencyKey='vrm153:paula-approved:dev:20261008:'+group.period+':'+group.country+':'+group.status+':'+sha(visitIds.join('|')+'|'+FROZEN_REVISION).slice(0,24);
  const command={version:'cxorbia-command-adapter-v1',commandType:'finance.historical.reconcile',
    entityType:'historicalPaymentReconciliation',entityId:batchId,
    tenantId:TENANT,projectId:PROGRAM,periodId:PROGRAM+'-'+group.period,
    expectedVersion:'source-current',idempotencyKey,payload,
    authorization:{providerEnforcementRequired:true,permission:'finance.reconcile'},
    audit:{reason:'Paula explicit DEV-only VRM153 historical reconciliation authorization',authorizationRef:APPROVAL},
    source:'i3-paula-authorized-dev-historical-41'};
  const result=await provider.execute(principal.idToken,command);
  must(result.ok===true&&result.providerAck===true&&result.reconciled===group.count
    &&result.bankWrites===0&&result.hrWrites===0&&result.externalPaymentWrites===0
    &&result.idempotentReplay===false,'TRANSACTION_ACK_FAILED:'+group.period+':'+group.country+':'+str(result.code));
  const replay=await provider.execute(principal.idToken,command);
  must(replay.ok===true&&replay.providerAck===true&&replay.idempotentReplay===true
   &&replay.providerWrites===0,'IDEMPOTENT_REPLAY_FAILED:'+group.period+':'+group.country);
  for(const row of rows){
   const r=ctx.missingById.get(row.visitId);
   const refId=sha(TENANT+'\0'+PROGRAM+'\0'+row.visitId+'\0'+batchId).slice(0,40);
   const [reconSnap,visitSnap]=await Promise.all([
    tenant.collection('paymentReconciliations').doc(refId).get(),
    tenant.collection('projects').doc(PROGRAM).collection('visits').doc(row.durableVisitId).get()
   ]);
   must(reconSnap.exists&&visitSnap.exists,'DURABLE_READBACK_MISSING');
   const rec=reconSnap.data()||{},v=visitSnap.data()||{};
   must(rec.active===true&&str(rec.visitId)===row.visitId
    &&str(rec.tenantId)===TENANT&&str(rec.projectId)===PROGRAM
    &&str(rec.periodId)===PROGRAM+'-'+group.period
    &&str(rec.country)===group.country&&str(rec.paymentStatus)===group.status
    &&str(rec.reconciliationBatchId)===batchId
    &&str(v.historicalPaymentStatus)===group.status&&str(v.reconciliationBatchId)===batchId,
    'RECONCILIATION_READBACK_MISMATCH:'+group.period+':'+group.country);
   if(group.period==='2026-08')must(str(rec.paymentDate)==='2026-10-02'&&str(v.historicalPaymentDate)==='2026-10-02','AUGUST_PAYMENT_DATE_MISSING');
   if(group.period==='2026-09')must(rec.paymentConfirmed===false&&!rec.paymentDate,'SEPTEMBER_PAYMENT_INVENTED');
   if(group.kind==='supersession'){
    const priorId=sha(TENANT+'\0'+PROGRAM+'\0'+row.visitId+'\0'+'hist-cinepolis-2026-08-pending-scope-v1').slice(0,40);
    const oldSnap=await tenant.collection('paymentReconciliations').doc(priorId).get();
    const old=oldSnap.exists?(oldSnap.data()||{}):null;
    must(old&&old.active===false&&old.superseded===true
      &&old.paymentStatus==='pending'&&old.supersededByBatchId===batchId,'HISTORICAL_AUDIT_NOT_PRESERVED');
    if(ctx.links[row.visitId])must(rec.supersessionIdentityLinkId===ctx.links[row.visitId]
      &&old.supersessionIdentityLinkId===ctx.links[row.visitId],'IDENTITY_AUTHORITY_NOT_PERSISTED');
   }
  }
  receipts.push({period:group.period,country:group.country,paymentStatus:group.status,count:group.count,
    batchId,visitIdSetDigest:sha(visitIds.join('|')),providerAck:true,durableReadback:true,
    idempotentReplay:true,bankWrites:0,hrWrites:0,externalPaymentWrites:0});
  save('PARTIAL_COMMITTED_READBACK_PASS',{committedVisits:receipts.reduce((n,x)=>n+x.count,0),bankWrites:0,hrWrites:0});
 }
 const batchIds=new Set(arr(ctx.dry.batches).map(x=>'hist-'+PROGRAM+'-'+str(x.period)+'-'+str(x.paymentStatus)+'-scope-v1'));
 const recSnap=await tenant.collection('paymentReconciliations').get();
 const selected=recSnap.docs.map(x=>x.data()||{}).filter(x=>batchIds.has(str(x.reconciliationBatchId)));
 const paid=selected.filter(x=>str(x.paymentStatus)==='paid').length;
 const pending=selected.filter(x=>str(x.paymentStatus)==='pending').length;
 must(selected.length===643&&new Set(selected.map(x=>str(x.visitId))).size===643&&paid===599&&pending===44
   &&selected.filter(x=>x.amountReviewRequired===true).length===5,'POST_SCOPE_TOTALS_MISMATCH');
 const allRecs=recSnap.docs.map(x=>x.data()||{}).filter(x=>str(x.tenantId)===TENANT&&str(x.projectId)===PROGRAM&&str(x.source)==='historical_reconciliation');
 const activeById=new Map();
 for(const item of allRecs){
  if(item.active===false||item.superseded===true)continue;
  const id=str(item.visitId);activeById.set(id,(activeById.get(id)||0)+1);
 }
 must([...activeById.values()].every(n=>n===1),'DUPLICATE_ACTIVE_RECONCILIATION');
 const movementsAfter=(await tenant.collection('financialMovements').get()).size;
 must(movementsAfter===movementsBefore,'FINANCIAL_MOVEMENTS_MUTATED');
 const postHr=await hrRead();must(postHr.revision===FROZEN_REVISION,'POST_HR_REVISION_CHANGED');
 save('PASS_VRM153_PAULA_AUTHORIZED_DEV_41_DURABLE_RECONCILIATION',{
   decision:'PASS_VRM153_PAULA_AUTHORIZED_DEV_41_DURABLE_RECONCILIATION',
   observed:{historicalReconciliations:selected.length,paid,pending,amountReviewRequired:5,
      visitsReconciled:receipts.reduce((n,x)=>n+x.count,0),supersededPriorAugGt:34,
      newlyRecordedAugHn:3,newlyRecordedSepPending:4},
   providerAck:true,durableReadback:true,idempotentReplay:true,
   financialMovementCountBefore:movementsBefore,financialMovementCountAfter:movementsAfter,
   bankWrites:0,externalPaymentWrites:0,hrWrites:0,production:false
 });
 process.stdout.write('PASS_VRM153_PAULA_AUTHORIZED_DEV_41_DURABLE_RECONCILIATION 34+3+4\n');
}
try{await run();}
catch(error){
 save('HOLD_FAIL_CLOSED',{decision:'HOLD_VRM153_PAULA_AUTHORIZED_DEV_41',error:String(error?.message||error).slice(0,220),
  remainingAction:'Inspect exact receipt scope before retry. Do not reimport or change bank or HR.',
  production:false});
 console.error('VRM153_FAIL_CLOSED:'+String(error?.message||error).slice(0,220));process.exitCode=1;
}
