// Synthetic protocol fixtures only. No product certification and no provider I/O.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {normalizeD08Result,D08_OBLIGATION_IDS,permitsD08PeriodlessScope} from './cxorbia-i3-d08-result-normalizer.mjs';
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const h=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');

export function d08SyntheticFixture(){
  const roles=['admin','shopper','cliente'],runId='12345678',runAttempt='1',tag=`qa_d08_${runId}_${runAttempt}`,tenantId='synthetic-tenant',projectId='synthetic-project',prefix=`tenants/${tenantId}`;
  const base={schemaVersion:'cxorbia.academy-base-progress-contract.v1',courses:roles.map(role=>({courseId:'course-'+role,audience:role,revision:h(role),lessons:[{id:'one',quiz:[]},{id:'two',quiz:[{answer:1,options:3}]}]}))};
  const baseContractText=JSON.stringify(base),identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'synthetic-dev',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/synthetic/versions/1'};
  const draftScope={tenantId:[tenantId],projectId:[],rol:['admin'],pais:[],nivel:[],modulo:[],paquete:[]};
  const request={schemaVersion:'cxorbia.i3.d08-ui-qa-request.v1',authorization:'PAULA_AUTHORIZED_D08_DEV_ONLY',production:false,hrIndependent:true,...identity,tenantId,projectId,country:'GT',draftScope};
  const paths=['app/modules/academia.js','app/core/manuales-data.js','app/core/backend-browser-auth.js','app/adapters/cxorbia-command-adapter-v1.js','app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'];
  const sourceAssets=Object.fromEntries(paths.map(path=>[path,{gitBlob:crypto.createHash('sha1').update(path).digest('hex'),sourceSha256:h(path)}]));
  const serving={exact:true,...identity,assets:Object.fromEntries(paths.map(p=>[p,{...sourceAssets[p],servedSha256:sourceAssets[p].sourceSha256,byteParity:true}]))};
  const raw={schemaVersion:'cxorbia.i3.d08-ui-provider-new-session.v1',decision:'PASS_I3_D08_UI_PROVIDER_NEW_SESSION_EDIT_NEGATIVES_CLEANUP',functionalPass:true,moduleDomain:'certifications',production:false,fullDomain:false,phaseAComplete:false,hrIndependent:true,periodId:null,productionIndexUnchanged:true,runId,runAttempt,...identity,tenantId,projectId,serving:{before:structuredClone(serving),after:structuredClone(serving)},safety:Object.fromEntries(['hrWrites','realLearnerWrites','realCourseWrites','realVisitsWritten','paymentWrites','emailCalls','calendarCalls','productionDeploys'].map(k=>[k,0])),cleanup:{ok:true,exactKnownPathsOnly:true,ownershipTransaction:true,remainingOwnedDocuments:0,remainingOwnedAuth:0},awaitJournal:[{state:'FULFILLED'}],creationJournal:[],requestJournal:[],identities:[],sessionDiagnostics:[],roles:{},resources:[],negatives:[]};
  for(const label of [...roles,'other']){
    const role=label==='other'?'shopper':label,uid=`${tag}_${label}`,namespace=role==='shopper'?'shopper':'staff';
    const claims={tenantId,projectIds:[projectId],role,authNamespace:namespace,qaSynthetic:true,qaRunId:runId,qaRunAttempt:runAttempt,qaPurpose:'D08'};
    raw.identities.push({label,role,uid,namespace,observer:label==='other',state:'CREATED_VERIFIED',courseId:label==='other'?null:'course-'+role,authIdentity:{uid,disabled:false},memberPath:`${prefix}/users/${uid}`,memberCreateDispatched:true,expectedClaims:claims,expectedMembership:{...claims,uid,active:true,status:'active'},...(role==='shopper'?{profilePath:`${prefix}/shoppers/${uid}`,profileCreateDispatched:true,expectedProfile:{shopperId:uid}}:{})});
  }
  function ses(label,actor){raw.sessionDiagnostics.push({label,role:actor.role,stage:'READY',initialStorageEmpty:true,observed:{authenticated:true,role:actor.role,namespace:actor.namespace,tenantId,projectId,periodId:'ui-context-only',boundaryActorId:actor.role==='shopper'?actor.uid:'authenticated-user',shopperReady:actor.role==='shopper',shopperCountry:'GT',ownVisits:0}});}
  for(const role of roles){const a=raw.identities.find(a=>a.label===role);ses(role,a);ses(role+'-new-session',a);}
  ses('admin-edit-new-session',raw.identities.find(a=>a.label==='admin'));ses('other-shopper',raw.identities.find(a=>a.label==='other'));
  function req(record,mode,label){const q={sequence:raw.requestJournal.length+1,session:label,commandType:record.command.commandType,mode,recordPath:record.receiptPath,dispatched:true,responseParsed:true,closed:true,httpStatus:mode==='negative'?403:200};raw.requestJournal.push(q);return q;}
  function record(actor,command,mode,label,negative=null,version=null){
    const p=command.payload,progress=command.commandType==='academy.progress.lesson.complete',digest=progress?h({actorUid:actor.uid,tenantId,commandType:command.commandType,payload:p}):h(command);
    const id=progress?'academy-progress-'+h([actor.uid,command.idempotencyKey]).slice(0,40):h(tenantId+'\0'+command.idempotencyKey).slice(0,40),aid=progress?id:'aa-'+h(command.idempotencyKey).slice(0,32),tid=progress?id:'academy-'+h(command.idempotencyKey).slice(0,32);
    const r={uid:actor.uid,role:actor.role,kind:progress?'progress':'course',mode,negative,command,commandSha256:h(command),commandDigest:digest,progressKey:progress?h([p.origin,p.audience,p.courseId,p.revision]):null,receiptPath:`${prefix}/commandReceipts/${id}`,auditPath:`${prefix}/academyAudit/${aid}`,trailPath:`${prefix}/entityAuditTrail/${tid}`};
    if(mode==='write'){
      const audit={actorUid:actor.uid,actorRole:actor.role,tenantId,projectId,periodId:command.periodId,commandType:command.commandType,entityId:command.entityId,entityType:command.entityType,idempotencyKey:command.idempotencyKey};
      r.bundle={receipt:{status:'committed',providerAck:true,actorUid:actor.uid,commandDigest:digest,commandType:command.commandType,entityId:command.entityId,entityType:command.entityType,entityVersion:version,...(progress?{progressKey:r.progressKey}:{})},audit:{...audit,...(progress?{lessonId:p.lessonId,courseRevision:p.revision,progressVersion:version}:{})},trail:audit};
      r.bundleSha256=h(r.bundle);r.providerAck=true;r.durableReadback=true;
    }
    raw.creationJournal.push(r);req(r,mode,label);return r;
  }
  for(const role of roles){
    const actor=raw.identities.find(a=>a.label===role),course=base.courses.find(c=>c.audience===role);let last;
    course.lessons.forEach((lesson,i)=>{
      const c={commandType:'academy.progress.lesson.complete',entityType:'academyProgress',entityId:course.courseId,tenantId,projectId,periodId:null,requireProject:true,requirePeriod:false,actor:{actorId:actor.role==='shopper'?actor.uid:'authenticated-user',role},authorization:{permission:'academy.progress.self'},idempotencyKey:`progress-${role}-${i}`,expectedVersion:i,payload:{origin:'base',audience:role,courseId:course.courseId,revision:course.revision,lessonId:lesson.id,answers:lesson.quiz.map(q=>q.answer)}};
      last=record(actor,c,'write',role,null,i+1);
    });
    req(last,'replay',role+'-new-session');
    raw.roles[role]={courseId:course.courseId,courseRevision:course.revision,lessons:2,evaluationQuestions:1,...Object.fromEntries(['uiCourse','uiContent','uiEvaluation','uiProgress','providerAck','durableReadback','independentNewSession','replayNoDuplicate'].map(k=>[k,true]))};
    raw.resources.push({role,realSourceOwned:true,readOnly:true,sections:2,firstSectionSha256:h(role+'first'),secondSectionSha256:h(role+'second')});
  }
  const admin=raw.identities.find(a=>a.role==='admin');
  const create={commandType:'academy.course.create',entityType:'academyCourse',entityId:tag+'_course',tenantId,projectId,periodId:'ui-current-context',requirePeriod:false,actor:{actorId:'authenticated-user',role:'admin'},authorization:{permission:'academy.create'},idempotencyKey:'create-course',expectedVersion:'absent',payload:{id:tag+'_course',audience:'admin',estado:'borrador',cert:false,contentVersion:1,workflowVersion:1,lessons:[],scope:draftScope,qaSynthetic:true,qaRunId:runId,qaRunAttempt:runAttempt,qaPurpose:'D08'}};
  record(admin,create,'write','admin-new-session',null,1);
  const update={...create,commandType:'academy.course.update',authorization:{permission:'academy.edit'},idempotencyKey:'edit-course',expectedVersion:1,payload:{audience:'admin',contentChange:true,patch:{n:'updated',desc:'updated',cat:'Operación',scope:draftScope}}};
  const edited=record(admin,update,'write','admin-new-session',null,2);req(edited,'replay','admin-edit-new-session');
  raw.authorizedAdminEdit={providerAck:true,durableReadback:true,independentNewSession:true,replayNoDuplicate:true,courseId:tag+'_course',version:2,contentVersion:2,state:'borrador'};
  record(admin,{...update,idempotencyKey:'stale-edit'},'negative','admin-edit-new-session','stale_version');raw.negatives.push({case:'stale_version',role:'admin',code:'ACADEMY_EXPECTED_VERSION_CONFLICT',zeroWrites:true,receiptAbsent:true});
  for(const role of ['shopper','cliente']){
    const actor=raw.identities.find(a=>a.label===role);
    record(actor,{...update,actor:{actorId:actor.uid,role},idempotencyKey:'denied-'+role,expectedVersion:2},'negative',role+'-new-session','role_denied');
    raw.negatives.push({case:'role_denied',role,code:'ACADEMY_ACTOR_DENIED',zeroWrites:true,receiptAbsent:true},{case:'ui_edit_permission',role,zeroCommands:true});
  }
  const other=raw.identities.find(a=>a.label==='other'),clientProgress=raw.creationJournal.find(r=>r.role==='cliente'&&r.kind==='progress');
  record(other,{...clientProgress.command,actor:{actorId:other.uid,role:'shopper'},idempotencyKey:'wrong-audience',expectedVersion:0},'negative','other-shopper','wrong_audience');
  raw.negatives.push({case:'wrong_audience',role:'shopper',code:'ACADEMY_PROGRESS_COURSE_DENIED',zeroWrites:true,receiptAbsent:true},{case:'other_learner',role:'shopper',emptyOwnProgress:true,foreignMemberReadDenied:true});
  const transport={runId,runAttempt,jobId:123,artifactId:456,jobName:'i3-run2382-academy-b7-isolated-dev-qa',jobConclusion:'success',controlHead:'e'.repeat(40),artifactDigest:'sha256:'+'f'.repeat(64),verifiedArchiveDigest:'sha256:'+'f'.repeat(64),resultRef:'synthetic-fixture-only.json'};
  const scopeAuthority={taskId:'D08',periodRequired:false,sha256:h('synthetic-frozen-scope'),baseContractSha256:h(baseContractText),obligationIds:D08_OBLIGATION_IDS};
  const inputs={transport,request,baseContractText,moduleContract:'Shopper/Identidad/Visual',scopeAuthority,sourceAssets};
  return {raw,inputs,normalize:r=>normalizeD08Result({...inputs,resultText:JSON.stringify(r)})};
}

test('synthetic D08 normalizes 25 scoped clauses with one owner and no domain promotion',()=>{
  const {raw,normalize}=d08SyntheticFixture(),got=normalize(raw);
  assert.deepEqual(got.ownerSpecificReceipts.map(r=>[r.scope.role,r.contractCoverage.obligations.length]),[['admin',9],['shopper',9],['cliente',7]]);
  assert.equal(got.focalObligationCount,25);assert.equal(got.fullDomain,false);assert.equal(got.newDomainMatches,0);
  assert.ok(got.ownerSpecificReceipts.every(r=>r.ownerPaths.length===1&&r.ownerPaths[0]==='app/modules/academia.js'&&r.scope.periodId===null));
  assert.ok(got.ownerSpecificReceipts[0].providerWriteProof.receipts.some(r=>r.commandType==='academy.course.update'&&r.commandPeriodId==='ui-current-context'));
});
for(const [label,mutator] of [
  ['old attempt',r=>r.runAttempt='2'],
  ['period-bound progress',r=>r.creationJournal[0].command.periodId='context'],
  ['missing readback',r=>delete r.creationJournal[0].durableReadback],
  ['wrong actor',r=>r.creationJournal[0].bundle.receipt.actorUid='foreign'],
  ['bundle digest',r=>r.creationJournal[0].bundleSha256='0'.repeat(64)],
  ['replay missing',r=>r.requestJournal=r.requestJournal.filter(q=>!(q.mode==='replay'&&q.session==='shopper-new-session'))],
  ['dirty session',r=>r.sessionDiagnostics[0].initialStorageEmpty=false],
  ['cleanup',r=>r.cleanup.remainingOwnedDocuments=1],
  ['serving drift',r=>r.serving.after.assets['app/modules/academia.js'].servedSha256='0'.repeat(64)],
  ['HOLD raw',r=>r.decision='HOLD'],
  ['unsettled request',r=>r.requestJournal[0].responseParsed=false],
  ['wrong audience wrote',r=>r.negatives.find(n=>n.case==='wrong_audience').zeroWrites=false]
])test('D08 rejects '+label,()=>{const {raw,normalize}=d08SyntheticFixture();mutator(raw);assert.throws(()=>normalize(raw),/MAPPING_FAILURE:D08_NORMALIZATION_/);});
test('D08 period waiver cannot be reused for finance',()=>{
  const {raw,normalize,inputs}=d08SyntheticFixture(),receipt=normalize(raw).ownerSpecificReceipts[0];
  assert.equal(permitsD08PeriodlessScope({...receipt,moduleDomain:'finance-core-liquidation-costs'},inputs.scopeAuthority),false);
});

test('Google Academy receipt preserves 25 scopes and rejects mixed provenance or unverified archives',()=>{
  const {raw,inputs}=d08SyntheticFixture(),{jobId,artifactId,artifactDigest,verifiedArchiveDigest,...base}=inputs.transport;
  const prefix='gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-qa/5573055a-facf-48a5-8e80-2d9698b4c21b';
  const startUri=prefix+'/start.json#'+raw.runId,archiveUri=prefix+'/evidence.zip#1795624414514001';
  raw.controlSha=base.controlHead;raw.externalExecution={startUri,transportSha:'a'.repeat(40)};
  raw.priorAbsence={status:'VERIFIED_ABSENT',writes:0};
  const resultText=JSON.stringify(raw),transport={...base,provider:'GOOGLE_CLOUD_SHELL',startGeneration:raw.runId,startUri,
    resultGeneration:'1795624414514002',resultUri:prefix+'/result.json#1795624414514002',archiveUri,resultRef:archiveUri,
    archiveVerified:true,archiveSha256:'2'.repeat(64),bundleSha256:'3'.repeat(64),startSha256:'4'.repeat(64),transportSha:'a'.repeat(40),resultSha256:h(resultText)};
  const normalize=t=>normalizeD08Result({...inputs,resultText,transport:t});
  assert.equal(normalize(transport).focalObligationCount,25);
  for(const bad of [{jobId:123},{archiveVerified:false},{archiveUri:archiveUri.replace('evidence.zip','other.zip')},{resultSha256:'0'.repeat(64)}]){
    assert.throws(()=>normalize({...transport,...bad}),/GOOGLE_TRANSPORT_IDENTITY/);
  }
});

test('native password proof binds each of eight clean independent browser sessions to its own fixture, claims and password provider',()=>{
  const {raw,inputs}=d08SyntheticFixture();
  const prefix='gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-qa/5573055a-facf-48a5-8e80-2d9698b4c21b';
  const startUri=prefix+'/start.json#'+raw.runId,archiveUri=prefix+'/evidence.zip#1795624414514001',passwordConfigSha256='4'.repeat(64);
  const {jobId,artifactId,artifactDigest,verifiedArchiveDigest,...base}=inputs.transport;
  raw.controlSha=base.controlHead;raw.externalExecution={startUri,transportSha:'a'.repeat(40),passwordConfigSha256};
  raw.authentication='FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY';raw.ordinaryPasswordAuthenticationProven=false;raw.priorAbsence={status:'VERIFIED_ABSENT',writes:0};
  for(const s of raw.sessionDiagnostics){
    const label=s.label.split('-')[0],actor=raw.identities.find(a=>a.label===label);
    actor.authIdentity.email=actor.uid+'@cxorbia.invalid';
    s.passwordProof={uid:actor.uid,signInProvider:'password',claimsSha256:h(actor.expectedClaims)};
  }
  const run=r=>{const resultText=JSON.stringify(r);return normalizeD08Result({...inputs,resultText,transport:{...base,provider:'GOOGLE_CLOUD_SHELL',startGeneration:r.runId,startUri,resultGeneration:'1795624414514002',resultUri:prefix+'/result.json#1795624414514002',archiveUri,resultRef:archiveUri,archiveVerified:true,archiveSha256:'2'.repeat(64),bundleSha256:'3'.repeat(64),startSha256:'4'.repeat(64),transportSha:'a'.repeat(40),resultSha256:h(resultText),passwordConfigSha256}});};
  const result=run(raw);
  assert.equal(result.focalObligationCount,25);
  assert.ok(result.ownerSpecificReceipts.every(receipt=>receipt.auth.method==='FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY'));
  for(const mutant of [r=>delete r.sessionDiagnostics[0].passwordProof,r=>r.sessionDiagnostics[1].passwordProof.uid='foreign',r=>r.sessionDiagnostics.at(-1).passwordProof.signInProvider='custom',r=>r.sessionDiagnostics[1].passwordProof.claimsSha256='3'.repeat(64),r=>r.identities[0].authIdentity.email='foreign@example.com',r=>delete r.externalExecution.passwordConfigSha256,r=>r.ordinaryPasswordAuthenticationProven=true]){
    const other=structuredClone(raw);mutant(other);assert.throws(()=>run(other),/PASSWORD/);
  }
});
