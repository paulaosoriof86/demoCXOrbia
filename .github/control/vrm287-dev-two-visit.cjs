'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const {initializeApp, applicationDefault}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const project='cxorbia-backend-dev';
const sourceRevision='d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2';
const shopperId='shopper_gt_319cd82eaf';
const ids=['OCTUBRE 26!19','OCTUBRE 26!20'];
const expectedUpdates={
 'OCTUBRE 26!19':'2026-10-25T00:55:54.215Z',
 'OCTUBRE 26!20':'2026-10-25T00:55:54.251Z'
};
function safeRest(value) {
 const copy={...value};
 for (const key of ['reviewRequired','reviewReasons','updatedAt','version'])delete copy[key];
 return copy;
}
function normalize(obj){
 if(Array.isArray(obj))return obj.map(normalize);
 if(obj&&typeof obj==='object'&&!(obj instanceof Date))return Object.fromEntries(Object.keys(obj).sort().map(k=>[k,normalize(obj[k])]));
 return obj;
}
function digest(obj){return crypto.createHash('sha256').update(JSON.stringify(normalize(obj))).digest('hex');}
function validate(id,d) {
 if(!d||d.tenantId!=='tya'||d.projectId!=='cinepolis'||d.periodId!=='cinepolis-2026-10')throw Error('SCOPE_PRECONDITION:'+id);
 if(d.visitId!==id||d.hrRowId!==id||d.sourceTab!=='OCTUBRE 26')throw Error('STABLE_VISIT_ID_PRECONDITION:'+id);
 if(d.hrSourceRevision!==sourceRevision||d.sourceSnapshotAt!=='2026-10-25T00:55:30.611Z')throw Error('SOURCE_REVISION_PRECONDITION:'+id);
 if(d.shopperId!==shopperId||d.assignmentState!=='assigned'||d.availableFrom!=='2026-10-24')throw Error('ASSIGNMENT_PRECONDITION:'+id);
 if(d.canonicalState!=='pending_realization'||d.operationalState!=='pending_realization')throw Error('OPERATIVE_STATE_PRECONDITION:'+id);
 if(d.hrManaged?.reviewRequired!==false||!Array.isArray(d.hrManaged?.reviewReasons)||d.hrManaged.reviewReasons.length!==0)throw Error('HR_MANAGED_MIRROR_PRECONDITION:'+id);
 const corrected=d.reviewRequired===false&&Array.isArray(d.reviewReasons)&&d.reviewReasons.length===0;
 const before=d.reviewRequired===true&&Array.isArray(d.reviewReasons)&&d.reviewReasons.length===1&&d.reviewReasons[0]==='available_from_missing_for_unassigned_visit'&&d.version===24&&d.updatedAt===expectedUpdates[id];
 if(!corrected&&!before)throw Error('STALE_OR_CONFLICTING_DOCUMENT_PRECONDITION:'+id);
 if(corrected&&d.version!==25)throw Error('ALREADY_CORRECTED_BUT_VERSION_UNEXPECTED:'+id);
 return corrected?'already-correct':'repair-required';
}
function guardRunner(){
 const {execFileSync}=require('node:child_process');
 if(process.env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia'||process.env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'||process.env.GITHUB_EVENT_NAME!=='push')throw Error('GITHUB_SCOPE_PRECONDITION');
 if(!process.env.GITHUB_EVENT_PATH||!fs.existsSync(process.env.GITHUB_EVENT_PATH))throw Error('MISSING_SIGNED_GITHUB_PUSH_EVENT');
 const ev=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
 if(ev.head_commit?.message!=='VRM287-DEV-TWO-VISIT'||ev.after!==process.env.GITHUB_SHA)throw Error('ONE_SHOT_TRIGGER_PRECONDITION');
 const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 if(descriptor.productSourceSha!=='317db03683cb7956e42b163c637602e879c7401c'||descriptor.productTreeAuthority!=='4c7ef2d129196f5ed2f0f169498337151a39d832'||descriptor.status!=='HOLD_I3_A09_B11_REVIEW_FLAG_SOURCE_PROOF_PENDING')throw Error('CANDIDATE_AUTHORITY_PRECONDITION');
 const sourceTree=String(execFileSync('git',['rev-parse','317db03683cb7956e42b163c637602e879c7401c^{tree}'],{encoding:'utf8'})).trim();
 if(sourceTree!==descriptor.productTreeAuthority)throw Error('SOURCE_TREE_PRECONDITION');
 execFileSync('git',['merge-base','--is-ancestor','317db03683cb7956e42b163c637602e879c7401c','HEAD']);
 execFileSync('git',['diff','--quiet','317db03683cb7956e42b163c637602e879c7401c','HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source']);
 if(!process.env.GOOGLE_APPLICATION_CREDENTIALS||!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS))throw Error('MISSING_DEV_SERVICE_CREDENTIALS');
 const c=JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS,'utf8'));
 if(c.project_id!=='cxorbia-backend-dev')throw Error('SERVICE_ACCOUNT_PROJECT_PRECONDITION');
}
guardRunner();

(async()=>{
 const app=initializeApp({credential:applicationDefault(),projectId:project});
 const db=getFirestore(app);
 const refs=ids.map(id=>db.collection('tenants').doc('tya').collection('projects').doc('cinepolis').collection('visits').doc(id));
 const witness=await db.runTransaction(async tx=>{
  const before=[];
  for(const ref of refs)before.push(await tx.get(ref));
  if(before.some(s=>!s.exists))throw Error('DOCUMENT_NOT_FOUND');
  const states=before.map((s,i)=>validate(ids[i],s.data()));
  if(states[0]!==states[1])throw Error('NON_ATOMIC_PREEXISTING_PARTIAL_REPAIR');
  const originals=before.map(s=>({version:s.data().version,updatedAt:s.data().updatedAt,otherFieldsSha256:digest(safeRest(s.data()))}));
  const updateTime=new Date().toISOString();
  if(states[0]==='repair-required')for(const ref of refs)tx.update(ref,{reviewRequired:false,reviewReasons:[],updatedAt:updateTime,version:25});
  return {action:states[0]==='repair-required'?'TWO_DOCUMENT_ATOMIC_TRANSACTION':'ALREADY_CORRECT_NO_WRITES',originals,updateTime};
 },{maxAttempts:1});
 const after=[];
 for(const ref of refs)after.push(await ref.get());
 if(after.some(s=>!s.exists))throw Error('POST_READBACK_MISSING_DOCUMENT');
 const output={project,tenantId:'tya',projectId:'cinepolis',sourceRevision,receipt:'VRM287_AUTHORIZED_TWO_VISIT_REPAIR',...witness,documents:ids.map((id,i)=>{
  const d=after[i].data();
  const untouched=digest(safeRest(d))===witness.originals[i].otherFieldsSha256;
  if(!untouched||d.reviewRequired!==false||!Array.isArray(d.reviewReasons)||d.reviewReasons.length!==0||d.version!==25||d.updatedAt!==(witness.action==='TWO_DOCUMENT_ATOMIC_TRANSACTION'?witness.updateTime:witness.originals[i].updatedAt))throw Error('POST_READBACK_MISMATCH:'+id);
  return {id,version:d.version,updatedAt:d.updatedAt,reviewRequired:d.reviewRequired,reviewReasons:d.reviewReasons,shopperId:d.shopperId,sourceRevision:d.hrSourceRevision,unrelatedFieldsIntact:untouched};
 })};
 fs.mkdirSync('.tmp/vrm287',{recursive:true});
 fs.writeFileSync('.tmp/vrm287/readback.json',JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({decision:'PASS_VRM287_TWO_DOC_DEV_DURABLE_READBACK',action:output.action,docs:output.documents.map(x=>({id:x.id,version:x.version,reviewRequired:x.reviewRequired,reviewReasons:x.reviewReasons,unrelatedFieldsIntact:x.unrelatedFieldsIntact})),production:false,externalHrWrites:0,authWrites:0,hostingWrites:0}));
})().catch(e=>{console.error('VRM287_FAIL_CLOSED:'+e.message);process.exitCode=1;});