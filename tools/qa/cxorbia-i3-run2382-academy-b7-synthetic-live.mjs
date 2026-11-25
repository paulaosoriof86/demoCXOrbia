#!/usr/bin/env node
/* I3 / RUN2382 — fenced DEV-only, temporary-identity provider certification.
 * The only writes are explicitly tagged disposable QA members, Auth accounts,
 * visit/application fixtures and their exact command receipts, audits/notices.
 * Never touches an HR row, a real visitor, an existing learner or production.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
// Control-only modes use Node builtins, so source gates and self-tests run without
// installing or initializing Firebase. Live modes load the same SDK versions later.
let applicationDefault,initializeApp,getApps,getAuth,getFirestore;
async function loadQaFirebaseDependencies(){
  const [app,auth,firestore]=await Promise.all([import('firebase-admin/app'),import('firebase-admin/auth'),import('firebase-admin/firestore')]);
  ({applicationDefault,initializeApp,getApps}=app);({getAuth}=auth);({getFirestore}=firestore);
}

function runD08Preflight(){
  const e=process.env,read=p=>JSON.parse(fs.readFileSync(p,'utf8')),check=(ok,code)=>{if(!ok)throw Error(code);};
  const native=e.CXORBIA_GOOGLE_QA_BRANCH;
  check((!native||(!e.GITHUB_ACTIONS&&!e.GITHUB_RUN_ID))&&(native||e.GITHUB_REF_NAME)==='recovery/cxorbia-phase-a-20260831','AUTH_FAILURE:D08_BRANCH');
  check(execFileSync('git',['rev-parse',e.FOCAL_SOURCE+'^{tree}'],{encoding:'utf8'}).trim()===e.FOCAL_TREE,'RELEASE_COMPOSITION_FAILURE:D08_SOURCE_TREE');
  execFileSync('git',['diff','--quiet',e.FOCAL_SOURCE,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules',':(exclude)backend/runtime/hr-live-service/test/**'],{stdio:'pipe'});
  execFileSync(process.execPath,['--check','tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs'],{stdio:'pipe'});
  fs.mkdirSync(e.QA_OUT,{recursive:true});
  const c=read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json'),d=read(e.CANDIDATE_DESCRIPTOR),pointer=c.currentD08UiQaRequest||{};
  check(c.production==='DO_NOT_TOUCH'&&c.authorizationI4===false&&/^docs\/checkpoints\/[^/]+\.json$/.test(pointer.path||''),'AUTH_FAILURE:D08_REQUEST_POINTER');
  check(execFileSync('git',['hash-object',pointer.path],{encoding:'utf8'}).trim()===pointer.gitBlob,'RELEASE_COMPOSITION_FAILURE:D08_REQUEST_BLOB');
  const q=read(pointer.path),seal=d.postDeployRunSeal||{};
  check(q.schemaVersion==='cxorbia.i3.d08-ui-qa-request.v1'&&q.authorization==='PAULA_AUTHORIZED_D08_DEV_ONLY'&&q.production===false&&q.hrIndependent===true&&q.sourceSha===e.FOCAL_SOURCE&&q.sourceTree===e.FOCAL_TREE&&q.tenantId===e.TENANT_ID&&q.projectId===e.PROJECT_ID,'AUTH_FAILURE:D08_REQUEST_SCOPE');
  for(const k of ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'])check(q[k]===seal[k],'RELEASE_COMPOSITION_FAILURE:D08_REQUEST_SEAL_'+k);
  check(q.pairedReceiptPath===seal.receiptPath&&/^docs\/checkpoints\/[^/]+\.json$/.test(q.pairedReceiptPath||'')&&execFileSync('git',['hash-object',q.pairedReceiptPath],{encoding:'utf8'}).trim()===q.pairedReceiptGitBlob,'RELEASE_COMPOSITION_FAILURE:D08_PAIRED_RECEIPT');
  check(['RECOVERY_ONLY','UI_WITH_RECOVERY'].includes(q.executionMode),'AUTH_FAILURE:D08_REQUEST_EXECUTION_MODE');
  const variables={D08_QA_CLEANUP_ONLY:String(q.executionMode==='RECOVERY_ONLY'),D08_QA_REQUEST:pointer.path,CXORBIA_I3_QA_SCOPE:'D08_ACADEMY_UI',CXORBIA_I3_QA_ISOLATED_WRITE_GATE:'PAULA_AUTHORIZED_D08_DEV_ONLY',DEV_REVISION:q.runtimeRevision,RUNTIME_DIGEST:q.runtimeDigest,HOSTING_VERSION_NAME:q.hostingVersion};
  for(const [k,v] of Object.entries(variables)){check(typeof v==='string'&&!/[\r\n]/.test(v),'SOURCE_FAILURE:D08_ENV_VALUE');fs.appendFileSync(native?e.CXORBIA_GOOGLE_QA_ENV:e.GITHUB_ENV,k+'='+v+'\n');}
  console.log(JSON.stringify({decision:'PASS_D08_CURRENT_PAIRED_DEV_REQUEST_PREFLIGHT',sourceSha:q.sourceSha,providerWrites:0}));
  return {request:q,current:c,descriptor:d};
}

function verifyD08UiResult(r){
  const check=(ok,code)=>{if(!ok)throw Error(code);};
  check(r.decision==='PASS_I3_D08_UI_PROVIDER_NEW_SESSION_EDIT_NEGATIVES_CLEANUP'&&r.functionalPass===true,'FUNCTIONAL_DEFECT:D08_RESULT_NOT_PASS');
  check(r.cleanup?.ok===true&&r.cleanup.exactKnownPathsOnly===true&&r.cleanup.remainingOwnedDocuments===0&&r.cleanup.remainingOwnedAuth===0,'PERSISTENCE_FAILURE:D08_RESULT_CLEANUP');
  check(r.serving?.before?.exact===true&&r.serving?.after?.exact===true&&r.productionIndexUnchanged===true,'RELEASE_COMPOSITION_FAILURE:D08_RESULT_SERVING');
  check(r.hrIndependent===true&&r.fullDomain===false&&r.production===false,'SOURCE_FAILURE:D08_RESULT_SCOPE');
  check(r.safety?.hrWrites===0&&r.safety.realLearnerWrites===0&&r.safety.realCourseWrites===0&&r.safety.realVisitsWritten===0,'AUTH_FAILURE:D08_RESULT_UNAUTHORIZED_WRITE');
  check(['admin','shopper','cliente'].every(role=>r.roles?.[role]?.independentNewSession===true&&r.roles[role].replayNoDuplicate===true&&r.roles[role].providerAck===true)&&Array.isArray(r.resources)&&r.resources.length===3&&r.authorizedAdminEdit?.independentNewSession===true,'FUNCTIONAL_DEFECT:D08_RESULT_COVERAGE');
  return {decision:'PASS_D08_RESULT_ARTIFACT_CONTRACT',providerWrites:0,fullDomain:false};
}

function runD08ResultVerify(){
  const r=JSON.parse(fs.readFileSync(process.env.QA_OUT+'/result.json','utf8'));
  console.log(JSON.stringify(verifyD08UiResult(r)));
}

/* D08 proposal: insert this block before runClientCollaborationQa in the existing runner.
 * No automatic MATCH promotion. Source-owned courses/manuals are read; only disposable
 * QA identities, their progress and one tagged draft course can be written.
 */
function academyUiQaPrimitives(){
  const str=v=>String(v??'').trim();
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const hash=v=>crypto.createHash('sha256').update(Buffer.isBuffer(v)?v:typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex');
  const check=(ok,code)=>{if(!ok)throw Error(code);};
  const same=(a,b)=>hash(a)===hash(b);
  const without=(o,keys)=>Object.fromEntries(Object.entries(o||{}).filter(([k])=>!keys.includes(k)));
  const progressKey=p=>hash([p.origin,p.audience,p.courseId,p.revision]);
  function shopperFixtureMembership(uid,claims){
    check(claims.role==='shopper'&&claims.authNamespace==='shopper'&&claims.shopperId===uid&&str(claims.tenantId)&&
      Array.isArray(claims.projectIds)&&claims.projectIds.length>0,'AUTH_FAILURE:D08_SHOPPER_FIXTURE_SCOPE');
    const canonical={authNamespace:'shopper',projectIds:[...new Set(claims.projectIds)].sort(),role:'shopper',shopperId:uid,tenantId:claims.tenantId};
    return {providerUidFingerprint:hash('cxorbia-provider-uid-v1\0'+uid),claimsDigest:hash(JSON.stringify(canonical))};
  }
  function describeCommand(c,identity,plan,spec){
    check(identity&&spec.identities.some(x=>x.uid===identity.uid),'AUTH_FAILURE:D08_UNPLANNED_ACTOR');
    check(c&&c.commandType===plan.type&&c.tenantId===spec.tenantId&&c.projectId===spec.projectId&&str(c.idempotencyKey)&&str(c.idempotencyKey).length<=250,'SOURCE_FAILURE:D08_COMMAND_SCOPE');
    // The current browser boundary can label Admin/Cliente as "authenticated-user".
    // That label is not identity authority: bind the observed boundary here and verify
    // the actual Firebase UID independently in every receipt/audit/readback below.
    check(c.actor?.actorId===(plan.actorId||identity.uid)&&c.actor?.role===identity.role,'AUTH_FAILURE:D08_COMMAND_ACTOR');
    check(['write','replay','negative'].includes(plan.mode),'SOURCE_FAILURE:D08_COMMAND_MODE');
    const p=c.payload||{},kind=c.commandType==='academy.progress.lesson.complete'?'progress':'course';
    let rid,auditId,trailId,course;
    if(kind==='progress'){
      check(c.entityType==='academyProgress'&&c.entityId===p.courseId&&c.periodId===null&&c.requireProject===true&&c.requirePeriod===false&&c.authorization?.permission==='academy.progress.self','SOURCE_FAILURE:D08_PROGRESS_BOUNDARY');
      check(Object.keys(p).every(k=>['origin','audience','courseId','revision','lessonId','answers'].includes(k))&&p.origin==='base'&&Number.isInteger(c.expectedVersion)&&c.expectedVersion>=0,'SOURCE_FAILURE:D08_PROGRESS_PAYLOAD');
      course=spec.courses.find(x=>x.courseId===p.courseId&&x.audience===p.audience&&x.revision===p.revision);
      const lesson=course?.lessons.find(x=>x.id===p.lessonId);
      check(course&&lesson&&Array.isArray(p.answers)&&p.answers.length===lesson.quiz.length&&p.answers.every((v,i)=>Number.isInteger(v)&&v>=0&&v<lesson.quiz[i].options),'SOURCE_FAILURE:D08_PROGRESS_REFERENCE');
      check(plan.courseId===p.courseId&&plan.lessonId===p.lessonId,'SOURCE_FAILURE:D08_UNPLANNED_LESSON');
      if(plan.mode!=='negative')check(identity.courseId===p.courseId&&identity.role===p.audience&&!identity.observer,'AUTH_FAILURE:D08_REAL_OR_OTHER_LEARNER_WRITE');
      else check(plan.negative==='wrong_audience'&&identity.observer===true&&identity.role==='shopper'&&p.audience==='cliente','SOURCE_FAILURE:D08_UNPLANNED_NEGATIVE');
      rid='academy-progress-'+hash([identity.uid,c.idempotencyKey]).slice(0,40);auditId=rid;trailId=rid;
    }else{
      check(['academy.course.create','academy.course.update'].includes(c.commandType)&&c.entityType==='academyCourse'&&c.entityId===spec.courseId&&c.requirePeriod===false,'SOURCE_FAILURE:D08_UNPLANNED_COURSE_COMMAND');
      check(c.periodId===null||typeof c.periodId==='string'&&c.periodId.length>0,'SOURCE_FAILURE:D08_COURSE_PERIOD');
      check(p.audience==='admin','SOURCE_FAILURE:D08_DRAFT_AUDIENCE');
      if(c.commandType==='academy.course.create'){
        check(plan.mode==='write'&&identity.role==='admin'&&c.expectedVersion==='absent'&&c.authorization?.permission==='academy.create','AUTH_FAILURE:D08_DRAFT_CREATE');
        check(p.id===spec.courseId&&p.n===spec.draftName&&p.desc===spec.draftDescription&&p.cat==='Operación'&&p.cert===false&&Array.isArray(p.lessons)&&p.lessons.length===0&&p.estado==='borrador'&&p.contentVersion===1&&p.workflowVersion===1,'SOURCE_FAILURE:D08_DRAFT_CREATE_PAYLOAD');
        check(p.qaSynthetic===true&&p.qaRunId===spec.runId&&p.qaRunAttempt===spec.attempt&&p.qaPurpose==='D08'&&same(p.scope,spec.draftScope),'SOURCE_FAILURE:D08_DRAFT_CREATE_OWNERSHIP');
      }else{
        check(Number.isInteger(c.expectedVersion)&&c.expectedVersion>0&&c.authorization?.permission==='academy.edit','SOURCE_FAILURE:D08_DRAFT_UPDATE_VERSION');
        check(p.patch&&Object.keys(p.patch).every(k=>['n','desc','cat','scope'].includes(k))&&p.contentChange===true,'SOURCE_FAILURE:D08_DRAFT_UPDATE_FIELDS');
        check(p.patch.n===spec.updatedName&&p.patch.desc===spec.updatedDescription&&p.patch.cat==='Operación'&&same(p.patch.scope,spec.draftScope),'SOURCE_FAILURE:D08_DRAFT_UPDATE_PAYLOAD');
        if(plan.mode==='negative')check(['role_denied','stale_version'].includes(plan.negative)&&(plan.negative==='role_denied'?['shopper','cliente'].includes(identity.role):identity.role==='admin'),'AUTH_FAILURE:D08_NEGATIVE_UPDATE_ACTOR');
        else check(identity.role==='admin','AUTH_FAILURE:D08_DRAFT_UPDATE_ACTOR');
      }
      rid=hash(spec.tenantId+'\0'+c.idempotencyKey).slice(0,40);
      auditId='aa-'+hash(c.idempotencyKey).slice(0,32);trailId='academy-'+hash(c.idempotencyKey).slice(0,32);
    }
    const prefix='tenants/'+spec.tenantId;
    return {uid:identity.uid,role:identity.role,kind,mode:plan.mode,negative:plan.negative||null,command:c,commandSha256:hash(c),commandDigest:kind==='progress'?hash({actorUid:identity.uid,tenantId:spec.tenantId,commandType:c.commandType,payload:p}):hash(c),progressKey:kind==='progress'?progressKey(p):null,
      receiptPath:prefix+'/commandReceipts/'+rid,auditPath:prefix+'/academyAudit/'+auditId,trailPath:prefix+'/entityAuditTrail/'+trailId};
  }
  function verifyBundle(record,bundle,spec){
    const {receipt,audit,trail}=bundle,any=!!(receipt||audit||trail);
    if(!any)return false;
    const c=record.command,p=c.payload;
    check(receipt&&audit&&trail,'PERSISTENCE_FAILURE:D08_PARTIAL_COMMAND_BUNDLE');
    check(receipt.status==='committed'&&receipt.providerAck===true&&receipt.actorUid===record.uid&&receipt.commandDigest===record.commandDigest&&receipt.commandType===c.commandType&&receipt.entityId===c.entityId&&receipt.entityType===c.entityType,'PERSISTENCE_FAILURE:D08_RECEIPT_OWNERSHIP');
    for(const a of [audit,trail])check(a.actorUid===record.uid&&a.actorRole===record.role&&a.tenantId===spec.tenantId&&a.projectId===spec.projectId&&a.commandType===c.commandType&&a.entityId===c.entityId&&a.entityType===c.entityType&&a.idempotencyKey===c.idempotencyKey&&(a.periodId??null)===(c.periodId??null),'PERSISTENCE_FAILURE:D08_AUDIT_OWNERSHIP');
    if(record.kind==='progress')check(receipt.progressKey===record.progressKey&&audit.lessonId===p.lessonId&&audit.courseRevision===p.revision&&audit.progressVersion===receipt.entityVersion,'PERSISTENCE_FAILURE:D08_PROGRESS_AUDIT');
    return true;
  }
  function verifyMembership(row,identity,committed,spec){
    check(row&&same(without(row,['academyProgress']),identity.expectedMembership),'PERSISTENCE_FAILURE:D08_MEMBER_NON_PROGRESS_DRIFT');
    const records=committed.filter(r=>r.uid===identity.uid&&r.kind==='progress'),saved=row.academyProgress;
    if(!records.length){check(saved===undefined,'PERSISTENCE_FAILURE:D08_UNPLANNED_PROGRESS');return;}
    check(saved&&saved.schemaVersion===1&&saved.ownerUid===identity.uid&&saved.tenantId===spec.tenantId&&Object.keys(saved).every(k=>['schemaVersion','ownerUid','tenantId','courses'].includes(k)),'PERSISTENCE_FAILURE:D08_PROGRESS_OWNER');
    const keys=[...new Set(records.map(r=>r.progressKey))].sort();
    check(same(Object.keys(saved.courses||{}).sort(),keys),'PERSISTENCE_FAILURE:D08_UNPLANNED_PROGRESS_COURSE');
    for(const key of keys){
      const list=records.filter(r=>r.progressKey===key).sort((a,b)=>a.bundle.receipt.entityVersion-b.bundle.receipt.entityVersion),p=list[0].command.payload,course=spec.courses.find(x=>x.courseId===p.courseId&&x.audience===p.audience&&x.revision===p.revision),lessons={};
      list.forEach((r,i)=>{check(r.bundle.receipt.entityVersion===i+1&&r.command.expectedVersion===i&&!lessons[r.command.payload.lessonId],'PERSISTENCE_FAILURE:D08_PROGRESS_VERSION_SEQUENCE');lessons[r.command.payload.lessonId]=100;});
      const actual=saved.courses[key],expected={origin:p.origin,audience:p.audience,courseId:p.courseId,revision:p.revision,version:list.length,lessons,completed:course.lessons.every(l=>lessons[l.id]===100)};
      check(same(without(actual,['updatedAt']),expected)&&Number.isFinite(Date.parse(actual.updatedAt)),'PERSISTENCE_FAILURE:D08_PROGRESS_PAYLOAD_DRIFT');
    }
  }
  function verifyCourse(row,committed,spec){
    const records=committed.filter(r=>r.kind==='course').sort((a,b)=>a.bundle.receipt.entityVersion-b.bundle.receipt.entityVersion);
    if(!records.length){check(!row,'PERSISTENCE_FAILURE:D08_UNPLANNED_DRAFT');return;}
    const create=records[0],c=create.command,p=c.payload;
    check(c.commandType==='academy.course.create'&&create.bundle.receipt.entityVersion===1,'PERSISTENCE_FAILURE:D08_DRAFT_CREATE_RECEIPT');
    const identity=spec.identities.find(x=>x.uid===create.uid),clean=without(p,['id','version','createdAt','createdBy','updatedAt','updatedBy','seed','sourceOwned']);
    let expected={...clean,id:spec.courseId,tenantId:spec.tenantId,audience:'admin',estado:'borrador',contentVersion:1,workflowVersion:1,version:1,createdBy:create.uid,createdByUserId:create.uid,creador:identity.name,updatedBy:create.uid};
    records.slice(1).forEach((r,i)=>{check(r.command.commandType==='academy.course.update'&&r.bundle.receipt.entityVersion===i+2&&r.command.expectedVersion===i+1,'PERSISTENCE_FAILURE:D08_DRAFT_VERSION_SEQUENCE');expected={...expected,...r.command.payload.patch,contentVersion:expected.contentVersion+1,version:expected.version+1,updatedBy:r.uid};});
    check(row&&same(without(row,['createdAt','updatedAt']),expected)&&Number.isFinite(Date.parse(row.createdAt))&&Number.isFinite(Date.parse(row.updatedAt)),'PERSISTENCE_FAILURE:D08_DRAFT_OWNERSHIP_OR_CONCURRENT_CHANGE');
  }
  return {str,stable,hash,check,same,without,progressKey,shopperFixtureMembership,describeCommand,verifyBundle,verifyMembership,verifyCourse};
}

// A raw browser command is not finished at headers. Keep the same abort handle
// alive until the JSON body settles; perform still independently validates ACK.
async function d08BrowserCommandPost({command,httpTimeoutMs=75000,tokenTimeoutMs=20000}){
  const controller=new AbortController();window.__D08_REQUEST_ABORT=controller;let tokenTimer;
  const httpTimer=setTimeout(()=>controller.abort(),httpTimeoutMs);
  try{
    const token=await Promise.race([firebase.auth().currentUser.getIdToken(true),new Promise((_,reject)=>{tokenTimer=setTimeout(()=>reject(Error('ENVIRONMENT_FAILURE:D08_TOKEN_DEADLINE')),tokenTimeoutMs);})]);
    clearTimeout(tokenTimer);
    const response=await fetch('/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify(command),signal:controller.signal});
    const ack=await response.json();return {status:response.status,ack};
  }finally{
    clearTimeout(tokenTimer);clearTimeout(httpTimer);
    if(window.__D08_REQUEST_ABORT===controller)delete window.__D08_REQUEST_ABORT;
  }
}

// Only the control self-test calls this fixture. It uses no sockets, credentials,
// SDKs or providers and restores globals even when an assertion fails.
async function d08ResponseLifetimeSelfTest(){
  const {check}=academyUiQaPrimitives(),names=['window','firebase','fetch'];
  const saved=new Map(names.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let passed=0;
  const assert=(value,code)=>{check(value,'SOURCE_FAILURE:D08_BODY_SELF_TEST_'+code);passed++;};
  try{
    globalThis.window={};globalThis.firebase={auth:()=>({currentUser:{getIdToken:async()=>'LOCAL_FIXTURE_ONLY'}})};
    let release,signal,settled=false,bodyStarted;
    const started=new Promise(resolve=>bodyStarted=resolve);
    globalThis.fetch=async(_url,options)=>{signal=options.signal;return {status:200,json:()=>{bodyStarted();return new Promise(resolve=>release=resolve);}};};
    const complete=d08BrowserCommandPost({command:{fixture:true},httpTimeoutMs:1000,tokenTimeoutMs:500}).then(value=>{settled=true;return value;});
    await started;assert(!settled&&window.__D08_REQUEST_ABORT?.signal===signal,'HANDLE_RETAINS_BODY');
    release({ok:true});const value=await complete;
    assert(value.status===200&&value.ack.ok===true&&!window.__D08_REQUEST_ABORT,'BODY_BEFORE_SUCCESS');
    let aborted=false;
    globalThis.fetch=async(_url,options)=>({status:200,json:()=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{aborted=true;reject(Error('LOCAL_ABORT'));},{once:true}))});
    let failed=false;try{await d08BrowserCommandPost({command:{fixture:true},httpTimeoutMs:15,tokenTimeoutMs:500});}catch(error){failed=error.message==='LOCAL_ABORT';}
    assert(failed&&aborted&&!window.__D08_REQUEST_ABORT,'STALLED_BODY_ABORTS');
    let fetches=0;
    globalThis.firebase={auth:()=>({currentUser:{getIdToken:()=>new Promise(()=>{})}})};globalThis.fetch=async()=>{fetches++;};
    failed=false;try{await d08BrowserCommandPost({command:{fixture:true},httpTimeoutMs:1000,tokenTimeoutMs:15});}catch(error){failed=error.message==='ENVIRONMENT_FAILURE:D08_TOKEN_DEADLINE';}
    assert(failed&&fetches===0&&!window.__D08_REQUEST_ABORT,'TOKEN_TIMEOUT_NO_DISPATCH');
    globalThis.firebase={auth:()=>({currentUser:{getIdToken:async()=>'LOCAL_FIXTURE_ONLY'}})};
    globalThis.fetch=async()=>({status:502,json:async()=>{throw Error('LOCAL_INVALID_JSON');}});
    failed=false;try{await d08BrowserCommandPost({command:{fixture:true},httpTimeoutMs:1000,tokenTimeoutMs:500});}catch(error){failed=error.message==='LOCAL_INVALID_JSON';}
    assert(failed&&!window.__D08_REQUEST_ABORT,'PARSE_FAILURE_NOT_SUCCESS');
    return passed;
  }finally{for(const name of names){const descriptor=saved.get(name);if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}
}

// QA-only deadlines: keep the observed await and its outcome in the artifact.
// A timeout is an ENVIRONMENT_FAILURE, never a provider ACK or permission failure.
function d08DeadlineHarness(result,save,redact=String){
  result.awaitJournal??=[];
  return async function awaited(stage,operation,timeoutMs=45000){
    const row={sequence:result.awaitJournal.length+1,stage,state:'WAITING',startedAt:new Date().toISOString(),timeoutMs};
    result.awaitJournal.push(row);save();let timer;
    try{
      const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{
        row.state='TIMED_OUT';row.finishedAt=new Date().toISOString();save();
        reject(Error('ENVIRONMENT_FAILURE:D08_AWAIT_TIMEOUT:'+stage));
      },timeoutMs);});
      const value=await Promise.race([Promise.resolve().then(operation),timeout]);
      row.state='FULFILLED';return value;
    }catch(error){if(row.state!=='TIMED_OUT')row.state='REJECTED';row.error=redact(error?.message||error);throw error;}
    finally{clearTimeout(timer);row.finishedAt=new Date().toISOString();save();}
  };
}

// UI rerenders may replace a locator while Playwright captures its element box.
// Capture the page, and independently prove the visible owner's text on both sides.
// Missing/changed evidence never passes and retries do not repeat any command.
async function d08CaptureFrame(page,selector,path,record=()=>{},expectedTexts=[]){
  const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
  for(let attempt=1;attempt<=3;attempt++){
    const row={selector,path:path.split('/').at(-1),attempt,mode:'page-with-visible-owner',state:'WAITING'};
    record(row);
    try{
      const owner=page.locator(selector).first();
      await owner.waitFor({state:'visible',timeout:10000});
      await owner.scrollIntoViewIfNeeded({timeout:10000});
      const before=await owner.innerText({timeout:10000});
      if(!before.trim())throw Error('VISUAL_DEFECT:D08_SCREENSHOT_EMPTY_OWNER');
      if(expectedTexts.some(text=>!before.includes(text)))throw Error('VISUAL_DEFECT:D08_SCREENSHOT_EXPECTED_TEXT_MISSING');
      const bytes=await page.screenshot({path,fullPage:true,animations:'disabled',timeout:10000});
      const afterOwner=page.locator(selector).first();
      await afterOwner.waitFor({state:'visible',timeout:10000});
      const after=await afterOwner.innerText({timeout:10000});
      if(before!==after)throw Error('ENVIRONMENT_FAILURE:D08_SCREENSHOT_OWNER_REPLACED');
      row.state='FULFILLED';row.ownerTextSha256=hash(before);row.imageSha256=hash(bytes);record(row);return row;
    }catch(error){
      row.state='REJECTED';row.error=String(error?.message||error);record(row);
      const retryable=/Element is not attached to the DOM|element was detached|D08_SCREENSHOT_OWNER_REPLACED/i.test(row.error);
      if(!retryable||attempt===3)throw Error('ENVIRONMENT_FAILURE:D08_SCREENSHOT_CAPTURE:'+row.error);
    }
  }
}

async function d08CaptureFrameSelfTest(){
  const assert=(ok,name)=>{if(!ok)throw Error('D08_CAPTURE_SELF_TEST:'+name);};let passed=0;
  function fixture({detach=0,texts=['Completado'],captureError=null}={}){
    let scrolls=0,reads=0,captures=0;
    const page={locator:()=>({first(){return this;},async waitFor(){},async scrollIntoViewIfNeeded(){if(++scrolls<=detach)throw Error('Element is not attached to the DOM');},async innerText(){return texts[Math.min(reads++,texts.length-1)];}}),async screenshot(options){captures++;assert(options.fullPage&&options.timeout===10000,'bounded page capture');if(captureError)throw Error(captureError);return Buffer.from('frame-'+captures);}};
    return {page,counts:()=>({scrolls,reads,captures})};
  }
  let f=fixture({detach:1}),journal=[];const result=await d08CaptureFrame(f.page,'[data-course="qa"]','/qa/frame.png',row=>journal.push({...row}));
  assert(result.attempt===2&&result.state==='FULFILLED'&&f.counts().captures===1&&journal.some(x=>x.state==='REJECTED'),'detached owner reacquired without extra command');passed++;
  f=fixture({texts:['Completado','Actualizando','Completado','Completado']});
  assert((await d08CaptureFrame(f.page,'[data-course="qa"]','/qa/frame.png')).attempt===2&&f.counts().captures===2,'content replacement requires fresh frame');passed++;
  f=fixture({detach:9});try{await d08CaptureFrame(f.page,'x','x.png');throw Error('missed');}catch(error){assert(error.message.startsWith('ENVIRONMENT_FAILURE:D08_SCREENSHOT_CAPTURE:')&&f.counts().scrolls===3,'persistent detach bounded fail');passed++;}
  f=fixture({captureError:'Target page closed'});try{await d08CaptureFrame(f.page,'x','x.png');throw Error('missed');}catch(error){assert(error.message.includes('Target page closed')&&f.counts().captures===1,'unrelated error not swallowed');passed++;}
  f=fixture({texts:['']});try{await d08CaptureFrame(f.page,'x','x.png');throw Error('missed');}catch(error){assert(error.message.includes('D08_SCREENSHOT_EMPTY_OWNER')&&f.counts().captures===0,'empty owner cannot pass');passed++;}
  assert(/^[a-f0-9]{64}$/.test(result.ownerTextSha256)&&/^[a-f0-9]{64}$/.test(result.imageSha256),'frame and content hashes recorded');passed++;
  return passed;
}

async function d08DeadlineSelfTest(){
  const assert=(ok,name)=>{if(!ok)throw Error('D08_DEADLINE_SELF_TEST:'+name);};
  const result={},snapshots=[],awaited=d08DeadlineHarness(result,()=>snapshots.push(JSON.parse(JSON.stringify(result))));let passed=0;
  assert(await awaited('readback',()=>Promise.resolve(7),100)===7,'resolved value');passed++;
  assert(snapshots[0].awaitJournal[0].state==='WAITING'&&result.awaitJournal[0].state==='FULFILLED','persist before and after');passed++;
  try{await awaited('original rejection',()=>Promise.reject(Error('PERSISTENCE_FAILURE:owned drift')),100);throw Error('missed');}
  catch(error){assert(error.message==='PERSISTENCE_FAILURE:owned drift'&&result.awaitJournal[1].state==='REJECTED','preserve rejection');passed++;}
  let release;const slow=new Promise(resolve=>{release=resolve;});
  try{await awaited('new session replay action',()=>slow,5);throw Error('missed');}
  catch(error){assert(error.message==='ENVIRONMENT_FAILURE:D08_AWAIT_TIMEOUT:new session replay action','bounded unresolved action');passed++;}
  release('late');await Promise.resolve();await Promise.resolve();
  assert(result.awaitJournal[2].state==='TIMED_OUT','late completion never promotes timeout');passed++;
  const unsettled=r=>r.some(x=>x.dispatched===true&&x.responseParsed!==true);
  assert(unsettled([{dispatched:true,responseParsed:false}]),'uncertain write holds cleanup');passed++;
  assert(!unsettled([{dispatched:false,responseParsed:false},{dispatched:true,responseParsed:true}]),'no undispatched false positive');passed++;
  return passed;
}

async function runAcademyUiQaSelfTest(){
  const h=academyUiQaPrimitives(),{check,describeCommand,verifyBundle,verifyMembership,verifyCourse}=h;
  const course={courseId:'s_ruta',audience:'shopper',revision:'a'.repeat(64),lessons:[{id:'sr1',quiz:[]},{id:'sr2',quiz:[]}]};
  const identity={uid:'qa_d08_12345678_1_shopper',role:'shopper',name:'QA D08',courseId:'s_ruta',expectedMembership:{uid:'qa_d08_12345678_1_shopper',qaSynthetic:true}};
  const spec={tenantId:'qaTenant',projectId:'qaProject',runId:'12345678',attempt:'1',courseId:'qa_draft',identities:[identity],courses:[course]};
  const c={commandType:'academy.progress.lesson.complete',entityType:'academyProgress',entityId:'s_ruta',tenantId:spec.tenantId,projectId:spec.projectId,periodId:null,requireProject:true,requirePeriod:false,actor:{actorId:identity.uid,role:'shopper'},authorization:{permission:'academy.progress.self'},idempotencyKey:'key-one',expectedVersion:0,payload:{origin:'base',audience:'shopper',courseId:'s_ruta',revision:course.revision,lessonId:'sr1',answers:[]}};
  const plan={type:c.commandType,mode:'write',courseId:'s_ruta',lessonId:'sr1'},r=describeCommand(c,identity,plan,spec);
  const audit={actorUid:identity.uid,actorRole:'shopper',tenantId:spec.tenantId,projectId:spec.projectId,periodId:null,commandType:c.commandType,entityId:c.entityId,entityType:c.entityType,idempotencyKey:c.idempotencyKey};
  const bundle={receipt:{status:'committed',providerAck:true,actorUid:identity.uid,commandDigest:r.commandDigest,commandType:c.commandType,entityId:c.entityId,entityType:c.entityType,progressKey:r.progressKey,entityVersion:1},audit:{...audit,lessonId:'sr1',courseRevision:course.revision,progressVersion:1},trail:audit};r.bundle=bundle;
  const member={...identity.expectedMembership,academyProgress:{schemaVersion:1,ownerUid:identity.uid,tenantId:spec.tenantId,courses:{[r.progressKey]:{...c.payload,version:1,lessons:{sr1:100},completed:false,updatedAt:'2026-11-24T00:00:00.000Z'}}}};
  delete member.academyProgress.courses[r.progressKey].lessonId;delete member.academyProgress.courses[r.progressKey].answers;
  let passed=0;const positive=(name,fn)=>{fn();passed++;},negative=(name,fn)=>{let rejected=false;try{fn();}catch{rejected=true;}check(rejected,'D08_SELF_TEST_ACCEPTED:'+name);passed++;};
  positive('owned progress bundle',()=>check(verifyBundle(r,bundle,spec),'D08_SELF_TEST_BUNDLE'));
  positive('owned progress member',()=>verifyMembership(member,identity,[r],spec));
  negative('cross-tenant dispatch',()=>describeCommand({...c,tenantId:'foreign'},identity,plan,spec));
  negative('foreign actor',()=>describeCommand({...c,actor:{actorId:'real-user',role:'shopper'}},identity,plan,spec));
  negative('unplanned type',()=>describeCommand({...c,commandType:'visit.state.update'},identity,{...plan,type:'visit.state.update'},spec));
  negative('owner spoof in progress',()=>describeCommand({...c,payload:{...c.payload,ownerUid:'real-user'}},identity,plan,spec));
  negative('partial receipt bundle',()=>verifyBundle(r,{...bundle,trail:null},spec));
  negative('foreign receipt owner',()=>verifyBundle(r,{...bundle,receipt:{...bundle.receipt,actorUid:'real-user'}},spec));
  negative('modified non-progress member field',()=>verifyMembership({...member,qaSynthetic:false},identity,[r],spec));
  negative('foreign progress owner',()=>verifyMembership({...member,academyProgress:{...member.academyProgress,ownerUid:'real-user'}},identity,[r],spec));
  negative('unexpected course progress',()=>verifyMembership({...member,academyProgress:{...member.academyProgress,courses:{...member.academyProgress.courses,foreign:{}}}},identity,[r],spec));
  negative('unexpected completed lesson',()=>verifyMembership({...member,academyProgress:{...member.academyProgress,courses:{[r.progressKey]:{...member.academyProgress.courses[r.progressKey],lessons:{sr1:100,sr2:100}}}}},identity,[r],spec));
  negative('unplanned draft',()=>verifyCourse({id:'real-course'},[],spec));
  positive('absent draft',()=>verifyCourse(null,[],spec));
  const admin={uid:'qa_d08_12345678_1_admin',role:'admin',name:'QA D08 Admin'},draftScope={tenantId:['qaTenant'],projectId:[],rol:['admin'],pais:[],nivel:[],modulo:[],paquete:[]};
  const draftSpec={...spec,identities:[...spec.identities,admin],draftScope,draftName:'QA draft',draftDescription:'QA description',updatedName:'QA updated',updatedDescription:'QA changed'};
  const create={commandType:'academy.course.create',entityType:'academyCourse',entityId:'qa_draft',tenantId:spec.tenantId,projectId:spec.projectId,periodId:null,requirePeriod:false,actor:{actorId:admin.uid,role:'admin'},authorization:{permission:'academy.create'},expectedVersion:'absent',idempotencyKey:'draft-create',payload:{id:'qa_draft',n:draftSpec.draftName,desc:draftSpec.draftDescription,cat:'Operación',cert:false,lessons:[],estado:'borrador',contentVersion:1,workflowVersion:1,audience:'admin',scope:draftScope,qaSynthetic:true,qaRunId:spec.runId,qaRunAttempt:spec.attempt,qaPurpose:'D08'}};
  const created=describeCommand(create,admin,{type:create.commandType,mode:'write'},draftSpec);created.bundle={receipt:{entityVersion:1}};
  const draft={...create.payload,id:'qa_draft',tenantId:spec.tenantId,version:1,createdBy:admin.uid,createdByUserId:admin.uid,creador:admin.name,updatedBy:admin.uid,createdAt:'2026-11-24T00:00:00Z',updatedAt:'2026-11-24T00:00:00Z'};
  positive('owned draft cleanup',()=>verifyCourse(draft,[created],draftSpec));
  negative('unowned draft creator',()=>verifyCourse({...draft,createdByUserId:'real-user'},[created],draftSpec));
  negative('concurrent draft edit',()=>verifyCourse({...draft,desc:'changed outside journal'},[created],draftSpec));
  negative('non-draft publication',()=>verifyCourse({...draft,estado:'publicado_preview'},[created],draftSpec));
  negative('untagged draft creation',()=>describeCommand({...create,payload:{...create.payload,qaSynthetic:false}},admin,{type:create.commandType,mode:'write'},draftSpec));
  const update={...create,commandType:'academy.course.update',authorization:{permission:'academy.edit'},expectedVersion:1,idempotencyKey:'draft-update',payload:{audience:'admin',contentChange:true,patch:{n:draftSpec.updatedName,desc:draftSpec.updatedDescription,cat:'Operación',scope:draftScope}}};
  const updated=describeCommand(update,admin,{type:update.commandType,mode:'write'},draftSpec);updated.bundle={receipt:{entityVersion:2}};
  const draft2={...draft,...update.payload.patch,version:2,contentVersion:2};
  positive('owned updated draft cleanup',()=>verifyCourse(draft2,[created,updated],draftSpec));
  negative('unplanned draft field update',()=>describeCommand({...update,payload:{...update.payload,patch:{...update.payload.patch,createdByUserId:'real-user'}}},admin,{type:update.commandType,mode:'write'},draftSpec));
  positive('observed browser actor label remains non-authoritative',()=>describeCommand({...c,actor:{actorId:'authenticated-user',role:'shopper'}},identity,{...plan,actorId:'authenticated-user'},spec));
  passed+=await d08DeadlineSelfTest();
  passed+=await d08ResponseLifetimeSelfTest();
  passed+=await d08CaptureFrameSelfTest();
  // Exercise the served membership guard itself, including both rejection paths.
  const {runInNewContext}=await import('node:vm');
  const uid=identity.uid,ctx={authenticated:true,role:'shopper',authNamespace:'shopper',tenantId:'qaTenant',projectIds:['qaProject'],shopperId:uid};
  const principal={currentUser:{uid},signOut:async()=>{}};
  let membership={...ctx,active:true};
  const ref={collection:()=>ref,doc:()=>ref,get:async()=>({exists:true,data:()=>membership})};
  const root={CX:{backendAuth:{ensureAuthenticated:async()=>ctx}},firebase:{auth:()=>principal,firestore:()=>ref},crypto:crypto.webcrypto,TextEncoder};
  runInNewContext(fs.readFileSync('app/adapters/cxorbia-shopper-membership-wiring-v1.js','utf8'),root);
  const verify=()=>root.CX.backendAuth.verifyShopperMembership(ctx);
  const assert=await import('node:assert/strict');
  await assert.rejects(verify,/SHOPPER_MEMBERSHIP_UID_MISMATCH/);passed++;
  Object.assign(membership,h.shopperFixtureMembership(uid,ctx));
  assert.equal((await verify()).membershipVerified,true);passed++;
  membership.claimsDigest=h.shopperFixtureMembership(uid,{...ctx,projectIds:['other']}).claimsDigest;
  await assert.rejects(verify,/SHOPPER_MEMBERSHIP_CLAIMS_MISMATCH/);passed++;
  assert.throws(()=>h.shopperFixtureMembership('other',ctx),/D08_SHOPPER_FIXTURE_SCOPE/);passed++;

  console.log(JSON.stringify({decision:'PASS_D08_QA_HELPER_OWNERSHIP_SELF_TEST',pass:passed,fail:0,writes:0}));
}

const D08_RUN2783_RECOVERY=Object.freeze({runId:'45514816284',runAttempt:'1',artifactId:14976779119,
  artifactName:'cxorbia-i3-run2382-academy-b7-synthetic-45514816284',
  artifactSha256:'aebb76345afed8b39c80c65e180dc0896ab50482df5a9dffb29141ce9483855c',journalEntry:'result.json',
  journalSha256:'f77b28264754da5011b40b25e19107c3091f34f7163108d24ba50ddd7e2446fc',
  sourceSha:'1691a76a7bc095ad4bf444aa0db76df2f359a5f0',sourceTree:'3725071a72014d6b891648ab5d2eeef9638276ac',
  expectedDocuments:18,expectedAuthUsers:4,policy:'EXACT_PINNED_RUN2783_FIXTURE_CLEANUP_ONLY'});

function buildD08RecoveryPlan(bytes,request,base){
  const {check,hash,same,describeCommand,verifyBundle}=academyUiQaPrimitives(),pin=request.recoveryRun2783;
  check(pin&&Object.entries(D08_RUN2783_RECOVERY).every(([k,v])=>pin[k]===v),'AUTH_FAILURE:D08_RECOVERY_PIN');
  check(hash(bytes)===pin.journalSha256,'SOURCE_FAILURE:D08_RECOVERY_JOURNAL_HASH');
  const j=JSON.parse(bytes.toString('utf8'));
  check(j.schemaVersion==='cxorbia.i3.d08-ui-provider-new-session.v1'&&j.runId===pin.runId&&j.runAttempt===pin.runAttempt&&
    j.sourceSha===pin.sourceSha&&j.sourceTree===pin.sourceTree&&j.tenantId===request.tenantId&&j.projectId===request.projectId&&
    j.production===false&&j.hrIndependent===true&&j.fixtureIdsPreflightAbsent===true,'AUTH_FAILURE:D08_RECOVERY_JOURNAL_SCOPE');
  const selections=[['admin','admin','a_fin_op'],['shopper','shopper','s_ruta'],['cliente','cliente','cl_ruta'],['other','shopper',null]],tag='qa_d08_'+j.runId+'_'+j.runAttempt;
  check(j.identities?.length===4&&j.creationJournal?.length===4,'SOURCE_FAILURE:D08_RECOVERY_COUNTS');
  const requests=j.requestJournal||[],unsettled=requests.filter(r=>r.dispatched===true&&r.responseParsed!==true);
  check(requests.length===5&&requests.slice(0,4).every((r,i)=>r.mode==='write'&&r.responseParsed===true&&r.recordPath===j.creationJournal[i].receiptPath)&&
    unsettled.length===1&&unsettled[0]===requests[4]&&unsettled[0].mode==='replay'&&unsettled[0].recordPath===j.creationJournal[3].receiptPath&&unsettled[0].closed===true,
    'AUTH_FAILURE:D08_RECOVERY_ONLY_KNOWN_REPLAY_UNSETTLED');
  const identities=selections.map(([label,role,courseId])=>{
    const matches=j.identities.filter(x=>x.label===label),uid=tag+'_'+label;check(matches.length===1,'SOURCE_FAILURE:D08_RECOVERY_IDENTITY');const x=matches[0];
    check(x.uid===uid&&x.role===role&&x.courseId===courseId&&x.observer===(label==='other')&&x.namespace===(role==='shopper'?'shopper':'staff')&&
      x.memberPath==='tenants/'+j.tenantId+'/users/'+uid&&x.profilePath===(role==='shopper'?'tenants/'+j.tenantId+'/shoppers/'+uid:null)&&
      x.state==='CREATED_VERIFIED'&&x.memberCreateDispatched===true&&(!x.profilePath||x.profileCreateDispatched===true)&&x.authIdentity?.uid===uid,
      'AUTH_FAILURE:D08_RECOVERY_IDENTITY_OWNERSHIP');
    for(const row of [x.expectedClaims,x.expectedMembership,...(x.profilePath?[x.expectedProfile]:[])])check(row?.qaSynthetic===true&&row.qaRunId===j.runId&&row.qaRunAttempt===j.runAttempt&&row.qaPurpose==='D08'&&row.tenantId===j.tenantId,'AUTH_FAILURE:D08_RECOVERY_TAGS');
    return structuredClone(x);
  });
  const courses=selections.filter(x=>x[2]).map(([,audience,id])=>base.courses.find(c=>c.audience===audience&&c.courseId===id));
  check(courses.every(Boolean),'SOURCE_FAILURE:D08_RECOVERY_COURSES');
  const spec={tenantId:j.tenantId,projectId:j.projectId,runId:j.runId,attempt:j.runAttempt,identities,courses,courseId:tag+'_course'};
  const admin=identities.find(x=>x.label==='admin');
  const records=j.creationJournal.map((r,i)=>{
    check(r.uid===admin.uid&&r.role==='admin'&&r.kind==='progress'&&r.mode==='write'&&r.command?.expectedVersion===i&&r.command.commandType==='academy.progress.lesson.complete'&&r.providerAck===true&&r.durableReadback===true,'AUTH_FAILURE:D08_RECOVERY_COMMAND_SCOPE');
    const rebuilt=describeCommand(r.command,admin,{type:r.command.commandType,mode:'write',actorId:'authenticated-user',courseId:r.command.payload.courseId,lessonId:r.command.payload.lessonId},spec);
    check(Object.entries(rebuilt).every(([k,v])=>same(v,r[k]))&&hash(r.bundle)===r.bundleSha256&&verifyBundle(r,r.bundle,spec),'PERSISTENCE_FAILURE:D08_RECOVERY_COMMAND_HASH');
    return structuredClone(r);
  });
  const bundlePaths=records.flatMap(r=>[r.receiptPath,r.auditPath,r.trailPath]),paths=[...bundlePaths,...identities.flatMap(x=>[x.memberPath,x.profilePath].filter(Boolean))];
  check(paths.length===18&&new Set(paths).size===18&&new Set(identities.map(x=>x.uid)).size===4,'SOURCE_FAILURE:D08_RECOVERY_PATHS');
  return {pin,spec,identities,records,paths,bundlePaths,coursePath:'tenants/'+j.tenantId+'/academyCourses/'+spec.courseId};
}

function verifyD08RecoverySnapshot(plan,state){
  const {check,hash,same,verifyBundle,verifyMembership,verifyCourse}=academyUiQaPrimitives(),known=new Set(plan.bundlePaths);
  check(state.actorReferences.every(path=>known.has(path))&&state.courseReferences.length===0,'PERSISTENCE_FAILURE:D08_RECOVERY_UNEXPECTED_REFERENCE');
  check(!state.course,'PERSISTENCE_FAILURE:D08_RECOVERY_UNEXPECTED_COURSE');
  for(const identity of plan.identities){const user=state.authUsers.get(identity.uid);if(user)check(same(user.identity,identity.authIdentity)&&same(user.claims,identity.expectedClaims),'AUTH_FAILURE:D08_RECOVERY_AUTH_CHANGED');}
  const count=plan.paths.filter(p=>state.documents.get(p)!=null).length;
  check(count===0||count===18,'PERSISTENCE_FAILURE:D08_RECOVERY_PARTIAL_DOCUMENTS');
  if(count===0){check(state.actorReferences.length===0,'PERSISTENCE_FAILURE:D08_RECOVERY_RESIDUAL_REFERENCE');return {mode:'DOCS_ALREADY_ABSENT',paths:[]};}
  check(plan.identities.every(x=>state.authUsers.has(x.uid)),'AUTH_FAILURE:D08_RECOVERY_AUTH_MISSING_WITH_DOCUMENTS');
  for(const r of plan.records){const bundle=Object.fromEntries(['receipt','audit','trail'].map(k=>[k,state.documents.get(r[k+'Path'])]));check(verifyBundle(r,bundle,plan.spec)&&hash(bundle)===r.bundleSha256,'PERSISTENCE_FAILURE:D08_RECOVERY_BUNDLE_CHANGED');}
  for(const identity of plan.identities){verifyMembership(state.documents.get(identity.memberPath),identity,plan.records,plan.spec);if(identity.profilePath)check(same(state.documents.get(identity.profilePath),identity.expectedProfile),'PERSISTENCE_FAILURE:D08_RECOVERY_PROFILE_CHANGED');}
  verifyCourse(null,plan.records,plan.spec);
  return {mode:'DELETE_EXACT_18',paths:[...plan.paths]};
}

function d08RecoverySelfTest(plan,bytes,request,base){
  const {check}=academyUiQaPrimitives();let pass=0;
  const documents=new Map();for(const r of plan.records)for(const k of ['receipt','audit','trail'])documents.set(r[k+'Path'],structuredClone(r.bundle[k]));
  for(const identity of plan.identities){
    const row=structuredClone(identity.expectedMembership),records=plan.records.filter(r=>r.uid===identity.uid);
    if(records.length){const r=records[0],p=r.command.payload;row.academyProgress={schemaVersion:1,ownerUid:identity.uid,tenantId:plan.spec.tenantId,courses:{[r.progressKey]:{origin:p.origin,audience:p.audience,courseId:p.courseId,revision:p.revision,version:records.length,lessons:Object.fromEntries(records.map(x=>[x.command.payload.lessonId,100])),completed:true,updatedAt:'2026-11-24T09:30:00Z'}}};}
    documents.set(identity.memberPath,row);if(identity.profilePath)documents.set(identity.profilePath,structuredClone(identity.expectedProfile));
  }
  const state={documents,actorReferences:[...plan.bundlePaths],courseReferences:[],course:null,authUsers:new Map(plan.identities.map(x=>[x.uid,{identity:structuredClone(x.authIdentity),claims:structuredClone(x.expectedClaims)}]))};
  const positive=(name,fn)=>{check(fn(),'SOURCE_FAILURE:D08_RECOVERY_SELFTEST_'+name);pass++;},negative=(name,fn)=>{let rejected=false;try{fn();}catch{rejected=true;}positive(name,()=>rejected);};
  positive('exact18',()=>verifyD08RecoverySnapshot(plan,state).paths.length===18);
  negative('altered_bytes',()=>buildD08RecoveryPlan(Buffer.concat([bytes,Buffer.from(' ')]),request,base));
  let bad=structuredClone(state);bad.actorReferences.push('tenants/other/commandReceipts/foreign');negative('foreign_reference',()=>verifyD08RecoverySnapshot(plan,bad));
  bad=structuredClone(state);bad.documents.delete(plan.paths[0]);negative('partial_documents',()=>verifyD08RecoverySnapshot(plan,bad));
  bad=structuredClone(state);bad.documents.get(plan.records[0].receiptPath).actorUid='foreign';negative('changed_bundle',()=>verifyD08RecoverySnapshot(plan,bad));
  bad=structuredClone(state);bad.documents.get(plan.identities[0].memberPath).name='changed';negative('changed_membership',()=>verifyD08RecoverySnapshot(plan,bad));
  bad=structuredClone(state);bad.authUsers.get(plan.identities[0].uid).identity.creationTime='changed';negative('changed_auth',()=>verifyD08RecoverySnapshot(plan,bad));
  bad=structuredClone(state);bad.course={qaSynthetic:true};negative('unexpected_course',()=>verifyD08RecoverySnapshot(plan,bad));
  bad=structuredClone(state);bad.documents=new Map();bad.actorReferences=[];bad.authUsers.delete(plan.identities[0].uid);bad.authUsers.delete(plan.identities[1].uid);positive('resume_auth_only',()=>verifyD08RecoverySnapshot(plan,bad).paths.length===0&&bad.authUsers.size===2);
  return {pass,fail:0,writes:0};
}

async function runD08RecoverCleanup({selfTestOnly=false}={}){
  const e=process.env,h=academyUiQaPrimitives(),{check,hash,same}=h;
  const request=selfTestOnly?JSON.parse(fs.readFileSync(e.D08_QA_REQUEST,'utf8')):runD08Preflight().request,pin=request.recoveryRun2783;
  check(pin&&Object.entries(D08_RUN2783_RECOVERY).every(([k,v])=>pin[k]===v),'AUTH_FAILURE:D08_RECOVERY_PIN');
  check(['RECOVERY_ONLY','UI_WITH_RECOVERY'].includes(request.executionMode),'AUTH_FAILURE:D08_RECOVERY_MODE');
  const base=JSON.parse(execFileSync('git',['show',pin.sourceSha+':backend/contracts/cxorbia-academy-base-progress-contract-v1.json'],{encoding:'utf8'}));
  let bytes,out;
  if(selfTestOnly)bytes=fs.readFileSync(e.D08_RECOVERY_SELF_TEST_JOURNAL);
  else{
    check(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE==='PAULA_AUTHORIZED_D08_DEV_ONLY'&&e.PROJECT==='cxorbia-backend-dev'&&e.HOSTING_URL==='https://cxorbia-backend-dev.web.app'&&e.GITHUB_REPOSITORY==='paulaosoriof86/demoCXOrbia'&&/^\d{8,}$/.test(e.GITHUB_RUN_ID||''),'AUTH_FAILURE:D08_RECOVERY_DEV_ONLY');
    out=e.QA_OUT+(request.executionMode==='RECOVERY_ONLY'?'/d08-recovery':'/run2783-recovery');fs.mkdirSync(out,{recursive:true});
    const gh=endpoint=>execFileSync('gh',['api','--method','GET',endpoint],{timeout:45000,maxBuffer:20*1024*1024});
    const artifact=JSON.parse(gh('repos/paulaosoriof86/demoCXOrbia/actions/artifacts/'+pin.artifactId)),run=JSON.parse(gh('repos/paulaosoriof86/demoCXOrbia/actions/runs/'+pin.runId));
    check(artifact.id===pin.artifactId&&artifact.name===pin.artifactName&&artifact.expired===false&&String(artifact.workflow_run?.id)===pin.runId&&run.status==='completed'&&String(run.run_attempt)===pin.runAttempt&&run.head_branch==='recovery/cxorbia-phase-a-20260831','AUTH_FAILURE:D08_RECOVERY_ARTIFACT_AUTHORITY');
    const zip=gh('repos/paulaosoriof86/demoCXOrbia/actions/artifacts/'+pin.artifactId+'/zip');check(hash(zip)===pin.artifactSha256,'SOURCE_FAILURE:D08_RECOVERY_ZIP_HASH');fs.writeFileSync(out+'/original.zip',zip);
    bytes=execFileSync('python3',['-c','import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.namelist().count("result.json")==1; sys.stdout.buffer.write(z.read("result.json"))',out+'/original.zip'],{maxBuffer:1024*1024});
    check(hash(bytes)===pin.journalSha256,'SOURCE_FAILURE:D08_RECOVERY_JOURNAL_HASH');fs.writeFileSync(out+'/original-result.json',bytes);
    fs.writeFileSync(out+'/artifact-metadata.json',JSON.stringify({artifactId:artifact.id,name:artifact.name,runId:run.id,status:run.status,runAttempt:run.run_attempt,expired:false},null,2)+'\n');
  }
  const plan=buildD08RecoveryPlan(bytes,request,base),tests=d08RecoverySelfTest(plan,bytes,request,base);
  if(selfTestOnly){console.log(JSON.stringify({decision:'PASS_D08_RUN2783_RECOVERY_OWNERSHIP_SELF_TEST',...tests,documents:plan.paths.length,auth:plan.identities.length}));return;}
  const result={schemaVersion:'cxorbia.i3.d08-recovery-cleanup.v1',state:'HOLD',decision:'HOLD',runId:String(e.GITHUB_RUN_ID),runAttempt:String(e.GITHUB_RUN_ATTEMPT||'1'),executionRunId:e.GITHUB_RUN_ID,executionRunAttempt:e.GITHUB_RUN_ATTEMPT,executionMode:request.executionMode,fixtureRunId:pin.runId,fixtureRunAttempt:pin.runAttempt,originalJournalSha256:pin.journalSha256,sourceSha:e.FOCAL_SOURCE,sourceTree:e.FOCAL_TREE,production:false,phaseAComplete:false,fullDomain:false,newDomainMatches:0,fixtureCreates:0,providerCommands:0,hrWrites:0,productionWrites:0,expectedDocuments:pin.expectedDocuments,expectedAuthUsers:pin.expectedAuthUsers,tests,cleanup:{ok:false},awaitJournal:[]};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n'),awaited=d08DeadlineHarness(result,save);save();
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:e.PROJECT});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(request.tenantId),uids=plan.identities.map(x=>x.uid);
  const authIdentity=u=>({uid:u.uid,displayName:u.displayName||'',disabled:u.disabled,email:u.email||null,emailVerified:u.emailVerified,phoneNumber:u.phoneNumber||null,photoURL:u.photoURL||null,creationTime:u.metadata.creationTime,providerData:u.providerData||[],mfa:u.multiFactor?.enrolledFactors||[]});
  async function userFor(identity){try{const user=await awaited('recovery.auth.read:'+identity.uid,()=>auth.getUser(identity.uid));check(same(authIdentity(user),identity.authIdentity)&&same(user.customClaims||{},identity.expectedClaims),'AUTH_FAILURE:D08_RECOVERY_AUTH_CHANGED');return {identity:authIdentity(user),claims:user.customClaims||{}};}catch(error){if(error.code==='auth/user-not-found')return null;throw error;}}
  async function references(read){const actorReferences=[];for(const name of ['commandReceipts','academyAudit','entityAuditTrail']){const q=await read(tenant.collection(name).where('actorUid','in',uids));actorReferences.push(...q.docs.map(x=>x.ref.path));}const courses=await read(tenant.collection('academyCourses').where('createdByUserId','in',uids));return {actorReferences,courseReferences:courses.docs.map(x=>x.ref.path)};}
  try{
    const authUsers=new Map();for(const identity of plan.identities){const u=await userFor(identity);if(u)authUsers.set(identity.uid,u);}
    const deleted=await awaited('recovery.firestore.transaction',()=>db.runTransaction(async tx=>{
      const refs=await references(q=>tx.get(q)),documents=new Map();
      for(const path of plan.paths){const doc=await tx.get(db.doc(path));documents.set(path,doc.exists?doc.data():null);}
      const course=await tx.get(db.doc(plan.coursePath));const checked=verifyD08RecoverySnapshot(plan,{...refs,documents,authUsers,course:course.exists?course.data():null});
      for(const path of checked.paths)tx.delete(db.doc(path));return checked.paths;
    },{maxAttempts:1}),60000);
    result.firestoreTransactionConfirmed=true;result.deletedPaths=deleted;save();let deletedAuth=0;
    // Never delete Auth following a timed-out or uncertain Firestore commit.
    for(const identity of plan.identities)if(await userFor(identity)){await awaited('recovery.auth.delete:'+identity.uid,()=>auth.deleteUser(identity.uid));deletedAuth++;}
    const remaining=[];for(const path of [...plan.paths,plan.coursePath])if((await awaited('recovery.document.absence',()=>db.doc(path).get())).exists)remaining.push(path);
    const refs=await awaited('recovery.references.absence',()=>references(q=>q.get()));check(!remaining.length&&!refs.actorReferences.length&&!refs.courseReferences.length,'PERSISTENCE_FAILURE:D08_RECOVERY_RESIDUE');
    for(const identity of plan.identities)check(await userFor(identity)===null,'AUTH_FAILURE:D08_RECOVERY_AUTH_RESIDUE');
    result.cleanup={ok:true,exactKnownPathsOnly:true,deletedDocuments:deleted.length,deletedAuth,remainingOwnedDocuments:0,remainingOwnedAuth:0,ownershipTransaction:true};
    result.decision='PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP';
  }catch(error){result.error=String(error.message||error).slice(0,700);result.classification=result.error.split(':')[0];process.exitCode=2;}
  finally{save();console.log(JSON.stringify({decision:result.decision,fixtureRunId:pin.runId,cleanup:result.cleanup,error:result.error||null,production:false}));}
  if(result.awaitJournal.some(x=>x.state==='TIMED_OUT')){await awaited('recovery.firestore.terminate',()=>db.terminate(),10000).catch(()=>{});save();process.exit(2);}
}

async function verifyClosedAcademyFixture({request,scopePath,db,auth,tenant}){
  const {check,hash}=academyUiQaPrimitives(),pin=request.recoveryRun2783,prior=request.priorCleanupPrerequisite;
  const bytes=fs.readFileSync(scopePath),scope=JSON.parse(bytes);
  check(hash(bytes)==='99b6797e43b9b97ff762bbe91fa89bc542801c1e5ac202f9fb47e89ad7507fe7'&&
    scope.journalSha256===pin.journalSha256&&scope.zipSha256===pin.artifactSha256&&scope.tenantId===request.tenantId&&
    scope.projectId===request.projectId&&scope.typedCleanupSha256===prior.typedResult.sha256,'SOURCE_FAILURE:D08_ABSENCE_SCOPE');
  for(const ref of [prior.typedResult,prior.retirementArchive]){
    const body=fs.readFileSync(ref.path);
    check(hash(body)===ref.sha256&&execFileSync('git',['hash-object',ref.path],{encoding:'utf8'}).trim()===ref.gitBlob,'SOURCE_FAILURE:D08_CLEANUP_AUTHORITY');
  }
  const receipt=JSON.parse(fs.readFileSync(prior.typedResult.path)),clean=receipt.observations?.cleanup;
  check(prior.fixtureRunId===pin.runId&&prior.fixtureRunAttempt===pin.runAttempt&&
    clean?.ok===true&&clean.ownershipTransaction===true&&clean.remainingOwnedDocuments===0&&clean.remainingOwnedAuth===0,
    'PERSISTENCE_FAILURE:D08_PRIOR_CLEANUP_NOT_VERIFIED');
  const actor=scope.syntheticUids;
  const [docs,users,refs]=await Promise.all([
    db.getAll(...[...scope.documentPaths,scope.coursePath].map(p=>db.doc(p))),
    auth.getUsers(actor.map(uid=>({uid}))),
    Promise.all([['commandReceipts','actorUid'],['academyAudit','actorUid'],['entityAuditTrail','actorUid'],['academyCourses','createdByUserId']]
      .map(([name,field])=>tenant.collection(name).where(field,'in',actor).limit(1).get()))
  ]);
  check(docs.length===19&&docs.every(d=>!d.exists)&&users.users.length===0&&users.notFound.length===4&&refs.every(s=>s.empty),
    'PERSISTENCE_FAILURE:D08_PRIOR_FIXTURE_NOT_ABSENT');
  return {status:'VERIFIED_ABSENT',journalSha256:scope.journalSha256,scopeSha256:hash(bytes),documents:18,authUsers:4,remainingOwnedDocuments:0,remainingOwnedAuth:0,writes:0};
}
async function runAcademyUiQa(){
  const e=process.env,h=academyUiQaPrimitives(),{str:s,stable,hash,check,same,without,describeCommand,verifyBundle,verifyMembership,verifyCourse}=h;
  const sourceSha=s(e.FOCAL_SOURCE),sourceTree=s(e.FOCAL_TREE);
  const googleControl=e.CXORBIA_GOOGLE_QA_START?await import('./cxorbia-i3-google-qa-execution.mjs'):null;
  const google=googleControl?.readGoogleQaExecution(e,googleControl.academyJob,sourceSha,sourceTree);
  const runId=s(google?.runId||e.GITHUB_RUN_ID),attempt=s(google?.runAttempt||e.GITHUB_RUN_ATTEMPT||'1'),out=s(e.QA_OUT);
  const projectName=s(e.PROJECT),tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,'');
  const requestPath=s(e.D08_QA_REQUEST),readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  check(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE==='PAULA_AUTHORIZED_D08_DEV_ONLY'&&projectName==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&e.SERVICE==='cxorbia-live-hr-dev'&&e.REGION==='us-central1'&&(google?.repository||e.GITHUB_REPOSITORY)==='paulaosoriof86/demoCXOrbia'&&(google?.branch||e.GITHUB_REF_NAME)==='recovery/cxorbia-phase-a-20260831'&&tenantId&&projectId&&out&&/^\d{8,}$/.test(runId)&&/^\d+$/.test(attempt)&&/^[a-f0-9]{40}$/.test(sourceSha)&&/^[a-f0-9]{40}$/.test(sourceTree)&&/^docs\/checkpoints\/[^/]+\.json$/.test(requestPath),'SOURCE_FAILURE:D08_SCOPE_GATE');
  const current=readJson('CXORBIA_RECOVERY_EXECUTION_CURRENT.json'),descriptor=readJson(e.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),qa=readJson(requestPath),seal=descriptor.postDeployRunSeal||{};
  check(qa.executionMode==='UI_WITH_RECOVERY','AUTH_FAILURE:D08_CLEANUP_ONLY_NO_NEW_FIXTURE');
  check(current.production==='DO_NOT_TOUCH'&&current.authorizationI4===false&&descriptor.productSourceSha===sourceSha&&descriptor.productTreeAuthority===sourceTree&&current.currentD08UiQaRequest?.path===requestPath&&execFileSync('git',['hash-object',requestPath],{encoding:'utf8'}).trim()===current.currentD08UiQaRequest.gitBlob,'AUTH_FAILURE:D08_REQUEST_AUTHORITY');
  check(qa.schemaVersion==='cxorbia.i3.d08-ui-qa-request.v1'&&qa.authorization==='PAULA_AUTHORIZED_D08_DEV_ONLY'&&qa.production===false&&qa.tenantId===tenantId&&qa.projectId===projectId&&qa.sourceSha===sourceSha&&qa.sourceTree===sourceTree&&qa.hrIndependent===true,'SOURCE_FAILURE:D08_REQUEST_SCOPE');
  for(const k of ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'])check(qa[k]===seal[k],'RELEASE_COMPOSITION_FAILURE:D08_REQUEST_SEAL_'+k);
  check(qa.pairedReceiptPath===seal.receiptPath&&/^docs\/checkpoints\/[^/]+\.json$/.test(qa.pairedReceiptPath)&&execFileSync('git',['hash-object',qa.pairedReceiptPath],{encoding:'utf8'}).trim()===qa.pairedReceiptGitBlob,'RELEASE_COMPOSITION_FAILURE:D08_PAIRED_RECEIPT');
  check(execFileSync('git',['rev-parse',sourceSha+'^{tree}'],{encoding:'utf8'}).trim()===sourceTree,'RELEASE_COMPOSITION_FAILURE:D08_SOURCE_TREE');
  execFileSync('git',['diff','--exit-code',sourceSha,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules',':(exclude)backend/runtime/hr-live-service/test/**'],{stdio:'pipe'});
  const country=s(qa.country).toUpperCase(),tag='qa_d08_'+runId+'_'+attempt,customId=tag+'_course';
  check(/^[A-Z]{2}$/.test(country)&&same(qa.draftScope?.tenantId,[tenantId])&&same(qa.draftScope?.rol,['admin'])&&same(qa.draftScope?.projectId,[])&&Object.keys(qa.draftScope).every(k=>['tenantId','projectId','pais','rol','nivel','modulo','paquete'].includes(k)),'SOURCE_FAILURE:D08_FIXTURE_SCOPE');
  const draftScope={tenantId:[tenantId],projectId:qa.draftScope.projectId,pais:[],rol:['admin'],nivel:[],modulo:[],paquete:[]};
  check(same({...draftScope,...qa.draftScope},draftScope),'SOURCE_FAILURE:D08_FIXTURE_UNSUPPORTED_SCOPE');
  const base=readJson('backend/contracts/cxorbia-academy-base-progress-contract-v1.json');
  const selections=[['admin','admin','a_fin_op'],['shopper','shopper','s_ruta'],['cliente','cliente','cl_ruta'],['other','shopper',null]];
  const identities=selections.map(([label,role,courseId])=>({uid:tag+'_'+label,label,role,courseId,observer:label==='other',namespace:role==='shopper'?'shopper':'staff',name:'QA D08 '+runId+' '+label,memberPath:'tenants/'+tenantId+'/users/'+tag+'_'+label,profilePath:role==='shopper'?'tenants/'+tenantId+'/shoppers/'+tag+'_'+label:null,state:'PLANNED_ABSENT'}));
  const courses=selections.filter(x=>x[2]).map(([,audience,id])=>base.courses.find(c=>c.audience===audience&&c.courseId===id));
  check(courses.every(c=>c&&c.lessons.length>=2&&c.lessons.some(l=>l.quiz.length>0)&&!c.technicalOnly),'SOURCE_FAILURE:D08_BASE_CONTRACT');
  const spec={tenantId,projectId,runId,attempt,identities,courses,courseId:customId,draftScope,draftName:'QA D08 '+runId+' borrador',draftDescription:'Fixture temporal de edición autorizada D08.',updatedName:'QA D08 '+runId+' editado',updatedDescription:'Edición D08 confirmada por proveedor y sesión nueva.'};
  fs.mkdirSync(out,{recursive:true});
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName,...(google?{serviceAccountId:google.signer}:{})});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
  const result={schemaVersion:'cxorbia.i3.d08-ui-provider-new-session.v1',...(google?{externalExecution:google,controlSha:google.controlSha}:{}),decision:'HOLD',moduleDomain:'certifications',findingIds:[],sourceSha,sourceTree,runId,runAttempt:attempt,tenantId,projectId,periodId:null,hrIndependent:true,production:false,phaseAComplete:false,fullDomain:false,
    runtimeRevision:qa.runtimeRevision,runtimeDigest:qa.runtimeDigest,hostingVersion:qa.hostingVersion,scope:'D08_FOCAL_UI_PROVIDER_PROGRESS_EDIT_AND_ROLE_NEGATIVES_NOT_FULL_CERTIFICATIONS_DOMAIN',
    identities,creationJournal:[],requestJournal:[],awaitJournal:[],roles:{},negatives:[],resources:[],sessionDiagnostics:[],cleanup:{ok:false},serving:{},safety:{hrWrites:0,realLearnerWrites:0,realCourseWrites:0,realVisitsWritten:0,paymentWrites:0,emailCalls:0,calendarCalls:0,productionDeploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');save();
  const records=new Map(),contexts=[],liveSessions=[];let browser=null,fixturesStarted=false,productionBefore='';
  const authIdentity=u=>({uid:u.uid,displayName:u.displayName||'',disabled:u.disabled,email:u.email||null,emailVerified:u.emailVerified,phoneNumber:u.phoneNumber||null,photoURL:u.photoURL||null,creationTime:u.metadata.creationTime,providerData:u.providerData||[],mfa:u.multiFactor?.enrolledFactors||[]});
  const gcloud=args=>execFileSync('gcloud',args,{encoding:'utf8',timeout:45000,maxBuffer:8*1024*1024}).trim();
  const redact=v=>String(v??'').replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]').replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/g,'$1').slice(0,700);
  const awaited=d08DeadlineHarness(result,save,redact);
  // SDK/Auth calls do not all accept AbortSignal. Persist their deadline and hold
  // destructive cleanup if a dispatched command has no terminal HTTP response.
  for(const method of ['createUser','setCustomUserClaims','createCustomToken','getUser','deleteUser']){
    const original=auth[method].bind(auth);
    auth[method]=(...args)=>awaited('auth.'+method,()=>original(...args),45000);
  }
  const readDoc=(path,stage='document.read')=>awaited(stage+':'+path,()=>db.doc(path).get(),45000);
  async function serving(stage){
    const service=JSON.parse(gcloud(['run','services','describe',e.SERVICE,'--project',projectName,'--region',e.REGION,'--format=json'])),traffic=(service.status?.traffic||[]).filter(x=>Number(x.percent||0)>0);
    check(service.status?.latestReadyRevisionName===qa.runtimeRevision&&traffic.length>0&&traffic.every(x=>x.revisionName===qa.runtimeRevision)&&traffic.reduce((a,x)=>a+Number(x.percent||0),0)===100,'RELEASE_COMPOSITION_FAILURE:D08_RUNTIME_DRIFT');
    const revision=JSON.parse(gcloud(['run','revisions','describe',qa.runtimeRevision,'--project',projectName,'--region',e.REGION,'--format=json'])),vars=new Map((revision.spec?.containers?.[0]?.env||[]).map(x=>[x.name,x.value]));
    check('sha256:'+s(revision.status?.imageDigest).split('sha256:').at(-1)===qa.runtimeDigest&&vars.get('CXORBIA_RECOVERY_SOURCE_SHA')===sourceSha,'RELEASE_COMPOSITION_FAILURE:D08_RUNTIME_SOURCE_DIGEST');
    const token=gcloud(['auth','print-access-token']),res=await fetch('https://firebasehosting.googleapis.com/v1beta1/sites/cxorbia-backend-dev/channels/live',{headers:{authorization:'Bearer '+token},signal:AbortSignal.timeout(45000)});
    check(res.ok,'PROVIDER_FAILURE:D08_HOSTING_INVENTORY');const hosting=await res.json();check(hosting.release?.version?.name===qa.hostingVersion,'RELEASE_COMPOSITION_FAILURE:D08_HOSTING_DRIFT');
    const assets={};
    for(const path of ['app/modules/academia.js','app/core/manuales-data.js','app/core/backend-browser-auth.js','app/adapters/cxorbia-command-adapter-v1.js','app/adapters/tya-protected-auth-hr-authority-bridge-v2.js']){
      const source=execFileSync('git',['show',sourceSha+':'+path],{maxBuffer:8*1024*1024}),r=await fetch(host+'/'+path.slice(4)+'?d08qa='+runId+'-'+stage,{cache:'no-store',signal:AbortSignal.timeout(45000)});
      check(r.ok,'PROVIDER_FAILURE:D08_SERVED_ASSET');const served=Buffer.from(await r.arrayBuffer());check(source.equals(served),'RELEASE_COMPOSITION_FAILURE:D08_ASSET_PARITY:'+path);
      assets[path]={gitBlob:execFileSync('git',['rev-parse',sourceSha+':'+path],{encoding:'utf8'}).trim(),sourceSha256:hash(source),servedSha256:hash(served),byteParity:true};
    }
    result.serving[stage]={exact:true,sourceSha,sourceTree,runtimeRevision:qa.runtimeRevision,runtimeDigest:qa.runtimeDigest,hostingVersion:qa.hostingVersion,assets};save();
  }
  async function track(command,identity,plan){
    const r=describeCommand(command,identity,plan,spec),old=records.get(r.receiptPath);
    if(old){check(old.uid===r.uid&&old.commandSha256===r.commandSha256&&plan.mode==='replay','SOURCE_FAILURE:D08_IDEMPOTENCY_PLAN_COLLISION');return old;}
    check((await Promise.all([r.receiptPath,r.auditPath,r.trailPath].map(p=>readDoc(p,'command.preflight')))).every(x=>!x.exists),'SOURCE_FAILURE:D08_RECEIPT_COLLISION');
    records.set(r.receiptPath,r);result.creationJournal.push(r);save();return r;
  }
  async function observe(record){
    const docs=await Promise.all([record.receiptPath,record.auditPath,record.trailPath].map(p=>readDoc(p,'command.readback')));
    const bundle=Object.fromEntries(['receipt','audit','trail'].map((k,i)=>[k,docs[i].exists?docs[i].data():null]));
    if(verifyBundle(record,bundle,spec)){
      if(record.bundle)check(same(record.bundle,bundle),'PERSISTENCE_FAILURE:D08_RECEIPT_CHANGED');
      record.bundle=bundle;record.bundleSha256=hash(bundle);
    }
    return !!record.bundle;
  }
  async function proveState(){
    const committed=[...records.values()].filter(r=>r.bundle),snapshots={};
    for(const identity of identities){const row=(await readDoc(identity.memberPath,'proveState.member')).data();verifyMembership(row,identity,committed,spec);snapshots[identity.uid]=hash(row);}
    const course=await readDoc(tenant.collection('academyCourses').doc(customId).path,'proveState.course');verifyCourse(course.exists?course.data():null,committed,spec);snapshots.course=course.exists?hash(course.data()):null;return snapshots;
  }
  async function session(identity,label){
    const context=await awaited(label+':context.new',()=>browser.newContext({viewport:{width:1440,height:1000}}),30000);contexts.push(context);
    context.setDefaultTimeout(30000);context.setDefaultNavigationTimeout(90000);
    const nativeClose=context.close.bind(context);context.close=()=>awaited(label+':context.close',()=>nativeClose(),10000);
    const empty=await awaited(label+':storage.empty',()=>context.storageState(),15000);check(empty.origins.length===0&&empty.cookies.length===0,'ENVIRONMENT_FAILURE:D08_NEW_CONTEXT_NOT_EMPTY');
    const page=await awaited(label+':page.new',()=>context.newPage(),15000),ses={identity,label,context,page,expected:null,postCount:0};liveSessions.push(ses);
    const nativeEvaluate=page.evaluate.bind(page);page.__d08NativeEvaluate=nativeEvaluate;
    page.evaluate=(fn,arg)=>{const caller=String(new Error().stack||'').split('\n').slice(2).find(x=>x.includes('synthetic-live.mjs:'))||'page.evaluate';return awaited(label+':page.evaluate:'+caller.trim(),()=>nativeEvaluate(fn,arg),95000);};
    const diagnostic={label,role:identity.role,initialStorageEmpty:true,stage:'OPENING',network:[],pageErrors:[]};result.sessionDiagnostics.push(diagnostic);save();
    page.on('pageerror',err=>{if(diagnostic.pageErrors.length<10)diagnostic.pageErrors.push(redact(err.message));});
    page.on('requestfailed',r=>{if(diagnostic.network.length<35)diagnostic.network.push({path:new URL(r.url()).pathname,error:redact(r.failure()?.errorText)});});
    await page.route('**/v1/cxorbia/commands',async route=>{
      try{check(ses.expected,'AUTH_FAILURE:D08_UNPLANNED_BROWSER_COMMAND');const command=route.request().postDataJSON();ses.lastRecord=await track(command,identity,ses.expected);check(ses.expected&&ses.activeRequest&&!ses.activeRequest.closed,'ENVIRONMENT_FAILURE:D08_LATE_REQUEST_ABORTED');ses.postCount++;ses.activeRequest.recordPath=ses.lastRecord.receiptPath;ses.activeRequest.dispatched=true;ses.activeRequest.dispatchedAt=new Date().toISOString();save();await awaited(label+':request.continue',()=>route.continue(),10000);}
      catch(error){diagnostic.interceptionError=redact(error.message);result.interceptionError=diagnostic.interceptionError;save();await route.abort('failed').catch(()=>{});}
    });
    const url=host+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
    try{
      for(let i=0;i<3;i++){
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.firebase?.apps?.length>0,null,{timeout:90000});
        const token=await auth.createCustomToken(identity.uid);
        try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}catch(error){if(!/context was destroyed|navigation|network|interrupted/i.test(String(error)))throw error;}
        await page.waitForLoadState('domcontentloaded');if(await page.evaluate(uid=>window.firebase?.auth?.().currentUser?.uid===uid,identity.uid).catch(()=>false))break;
      }
      await page.goto('about:blank');await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid&&typeof window.CX?.backendAuth?.ensureAuthenticated==='function',identity.uid,{timeout:90000});
      await page.evaluate(()=>CX.backendAuth.ensureAuthenticated());diagnostic.stage='AUTHENTICATED_WAITING_CONTEXT';save();
      const ready=({uid,role,namespace,tenantId,projectId})=>{
        const a=window.CX?.backendAuth?.context?.()||{},p=window.CX_BACKEND_AUTHORIZED_STATE?.principal||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},h=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{},d=window.CX?.data||{},academy=d.__academyState||{};
        return a.authenticated===true&&a.role===role&&a.authNamespace===namespace&&a.tenantId===tenantId&&firebase.auth().currentUser?.uid===uid&&p.actorUid===uid&&p.role===role&&p.tenantId===tenantId&&h.applied===true&&h.actorUid===uid&&g.ready===true&&!g.blocked&&d.currentProjectId===projectId&&academy.authority==='firestore_tenant_academy'&&academy.progressOwnerUid===uid&&academy.progress?.ownerUid===uid&&academy.progressAuthority==='firestore_user_academy_progress'&&CX.acadData?._canonical?.()===true;
      };
      const scope={uid:identity.uid,role:identity.role,namespace:identity.namespace,tenantId,projectId};
      try{await page.waitForFunction(ready,scope,{timeout:75000});}
      catch(error){
        if(error.name!=='TimeoutError'||ses.postCount!==0)throw error;
        const bound=await page.evaluate(({uid,role,namespace,tenantId,projectId})=>{
          const ctx=window.CX?.backendAuth?.context?.()||{};
          return firebase.auth().currentUser?.uid===uid&&ctx.authenticated===true&&ctx.role===role&&ctx.authNamespace===namespace&&ctx.tenantId===tenantId&&ctx.projectIds?.includes(projectId);
        },scope);
        if(!bound)throw error;
        diagnostic.contextReload='EXACT_AUTHENTICATED_SCOPE_NO_COMMANDS';save();
        await page.reload({waitUntil:'domcontentloaded',timeout:90000});
        await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid&&typeof window.CX?.backendAuth?.ensureAuthenticated==='function',identity.uid,{timeout:90000});
        await page.evaluate(()=>CX.backendAuth.ensureAuthenticated());
        await page.waitForFunction(ready,scope,{timeout:75000});
      }
      diagnostic.observed=await page.evaluate(()=>{const a=CX.backendAuth.context(),h=window.CX_PROTECTED_AUTH_HR_AUTHORITY||{};return {authenticated:a.authenticated,role:a.role,namespace:a.authNamespace,tenantId:a.tenantId,projectId:CX.data.currentProjectId,periodId:CX.data.currentPeriodId,sourceRevision:CX.data.previewMeta?.sourceRevision||null,shopperCountry:h.shopperCountry||null,shopperReady:h.exactSessionShopperReady===true,ownVisits:h.ownVisits??null,boundaryActorId:CX.cxDataCommandBoundary.context().actorId};});
      ses.boundaryActorId=diagnostic.observed.boundaryActorId;check(ses.boundaryActorId,'AUTH_FAILURE:D08_BOUNDARY_ACTOR_MISSING');
      if(identity.role==='shopper')check(diagnostic.observed.shopperCountry===country&&diagnostic.observed.shopperReady&&diagnostic.observed.ownVisits===0,'AUTH_FAILURE:D08_SHOPPER_FIXTURE_PROFILE');
      await page.evaluate(()=>CX.router.nav('aprendizaje'));await page.locator('#acadManuales').waitFor({state:'visible',timeout:30000});
      if(identity.role==='admin'){await page.locator('#acadAud').selectOption('admin');}
      diagnostic.stage='READY';save();return ses;
    }catch(error){diagnostic.stage='FAILED';diagnostic.error=redact(error.message);diagnostic.authority=await awaited(label+':failure.authority',()=>page.__d08NativeEvaluate(()=>({gate:window.CX_C6_HR_AUTHORITY_GATE?.reason||null,authorityError:window.CX_PROTECTED_AUTH_HR_AUTHORITY?.error||null,academyOwner:window.CX?.data?.__academyState?.progressOwnerUid||null})),5000).catch(()=>({}));save();throw error;}
  }
  async function perform(ses,plan,action){
    check(!ses.expected,'ENVIRONMENT_FAILURE:D08_OVERLAPPING_DISPATCH');ses.expected={...plan,actorId:plan.actorId||ses.boundaryActorId};ses.lastRecord=null;
    ses.activeRequest={sequence:result.requestJournal.length+1,session:ses.label,commandType:plan.type,mode:plan.mode,dispatched:false,responseParsed:false,startedAt:new Date().toISOString()};result.requestJournal.push(ses.activeRequest);save();
    try{
      const responseTask=awaited(ses.label+':command.response',()=>ses.page.waitForResponse(r=>{try{return new URL(r.url()).pathname==='/v1/cxorbia/commands'&&r.request().postDataJSON()?.commandType===plan.type;}catch{return false;}},{timeout:90000}),92000).then(async response=>{ses.activeRequest.httpStatus=response.status();ses.activeRequest.headersReceivedAt=new Date().toISOString();save();const ack=await awaited(ses.label+':command.response.json',()=>response.json(),30000);ses.activeRequest.responseParsed=true;ses.activeRequest.finishedAt=new Date().toISOString();save();return {ack};});
      const [{ack}]=await Promise.all([responseTask,awaited(ses.label+':command.action',action,95000)]);
      const record=ses.lastRecord;check(record&&!result.interceptionError,'SOURCE_FAILURE:D08_COMMAND_NOT_JOURNALED');await observe(record);
      if(plan.mode==='negative'){
        check(!record.bundle&&ack.ok===false&&ack.providerAck===false&&ack.providerWrites===0&&ack.code===plan.expectedCode,'AUTH_FAILURE:D08_NEGATIVE_NOT_DENIED:'+s(ack.code));
        await proveState();result.negatives.push({case:plan.negative,role:ses.identity.role,code:ack.code,zeroWrites:true,receiptAbsent:true});
      }else{
        check(ack.ok===true&&ack.status==='committed'&&ack.committed===true&&ack.providerAck===true&&ack.readbackVerified===true&&ack.successUiAllowed===true&&ack.entityId===record.command.entityId&&record.bundle,'PERSISTENCE_FAILURE:D08_PROVIDER_ACK:'+s(ack.code));
        check(plan.mode==='replay'?ack.idempotentReplay===true&&ack.providerWrites===0:ack.idempotentReplay===false&&ack.providerWrites===4,'PERSISTENCE_FAILURE:D08_WRITE_OR_REPLAY_COUNT');
        if(record.kind==='progress')check(ack.entityReadback?.ownerUid===ses.identity.uid&&ack.entityReadback?.tenantId===tenantId&&ack.entityReadback?.progressKey===record.progressKey,'PERSISTENCE_FAILURE:D08_PROGRESS_ACK_OWNER');
        await proveState();record.providerAck=true;record.durableReadback=true;
      }
      save();return {ack,record};
    }finally{ses.expected=null;ses.activeRequest.closed=true;save();}
  }
  const rawPost=(ses,command)=>ses.page.evaluate(d08BrowserCommandPost,{command});
  const capture=async(ses,selector,name,expectedTexts=[])=>awaited(ses.label+':screenshot:'+name,()=>d08CaptureFrame(ses.page,selector,out+'/'+name+'.png',row=>{result.visualCaptureJournal??=[];const old=result.visualCaptureJournal.find(x=>x.path===row.path&&x.attempt===row.attempt);if(old)Object.assign(old,row);else result.visualCaptureJournal.push({...row});save();},expectedTexts),45000);
  async function resource(ses){
    const before=ses.postCount,role=ses.identity.role,page=ses.page;
    const manual=await page.evaluate(role=>{const m=(CX.manualesData?.MANUALES||[]).find(x=>x.rol===role&&x.secciones?.length>1);return m?{id:m.id,title:m.titulo,count:m.secciones.length}:null;},role);check(manual,'SOURCE_FAILURE:D08_REAL_ROLE_MANUAL_MISSING');
    await page.locator('#acadManuales').click();await page.locator('.manualPick[data-mid="'+manual.id+'"]').click();
    const body=page.locator('.acad-content');await body.waitFor({state:'visible'});const first=await body.innerText();check(first.trim().length>80,'FUNCTIONAL_DEFECT:D08_RESOURCE_EMPTY');
    await capture(ses,'.acad-content',ses.label+'-resource');await page.locator('#mNext').click();const second=await body.innerText();check(second.trim().length>80&&first!==second,'FUNCTIONAL_DEFECT:D08_RESOURCE_NAVIGATION');
    check(ses.postCount===before,'PERSISTENCE_FAILURE:D08_RESOURCE_READ_WROTE');result.resources.push({role,id:manual.id,title:manual.title,sections:manual.count,firstSectionSha256:hash(first),secondSectionSha256:hash(second),realSourceOwned:true,readOnly:true});
    await page.evaluate(()=>CX.router.nav('aprendizaje'));await page.locator('#acadManuales').waitFor({state:'visible'});save();
  }
  async function progressUi(ses){
    const identity=ses.identity,course=courses.find(c=>c.courseId===identity.courseId),page=ses.page,card=page.locator('[data-course="'+course.courseId+'"]');
    await card.waitFor({state:'visible'});check((await card.innerText()).includes('Comenzar'),'PERSISTENCE_FAILURE:D08_FRESH_LEARNER_NOT_EMPTY');await capture(ses,'[data-course="'+course.courseId+'"]',identity.label+'-course-before',['Comenzar']);await card.click();
    for(const lesson of course.lessons){
      await page.locator('[data-li="'+lesson.id+'"]').click();
      const plan={type:'academy.progress.lesson.complete',mode:'write',courseId:course.courseId,lessonId:lesson.id};
      if(lesson.quiz.length){
        const count=ses.postCount;check(await page.locator('.acad-question').count()===lesson.quiz.length&&await page.locator('#finQuiz').isDisabled(),'FUNCTIONAL_DEFECT:D08_QUIZ_REVIEW_GATE');
        await page.locator('.acad-verify[data-qi="0"]').click();check(await page.locator('#finQuiz').isDisabled()&&ses.postCount===count,'PERSISTENCE_FAILURE:D08_INCOMPLETE_QUIZ_WRITE');
        for(let qi=0;qi<lesson.quiz.length;qi++){await page.locator('input[name="q'+qi+'"][value="'+lesson.quiz[qi].answer+'"]').check();await page.locator('.acad-verify[data-qi="'+qi+'"]').click();await page.locator('#fb'+qi).waitFor({state:'visible'});check((await page.locator('#fb'+qi).innerText()).includes('Correcto'),'FUNCTIONAL_DEFECT:D08_QUIZ_FEEDBACK');}
        check(await page.locator('#finQuiz').isEnabled(),'FUNCTIONAL_DEFECT:D08_REVIEWED_QUIZ_DISABLED');await capture(ses,'.acad-question',identity.label+'-evaluation');
        await perform(ses,plan,()=>page.locator('#finQuiz').click());
      }else{
        const body=page.locator('.acad-content');check(await body.isVisible()&&(await body.innerText()).trim().length>80,'FUNCTIONAL_DEFECT:D08_LESSON_BODY');
        if(lesson===course.lessons[0])await capture(ses,'.acad-content',identity.label+'-lesson');
        await perform(ses,plan,()=>page.locator('#nextL').click());
      }
      await page.waitForFunction(({id,lessonId,audience})=>{const c=CX.acadData.COURSES[audience].find(x=>x.id===id);return CX.acadData.courseProgress(c,audience).lessons?.[lessonId]===100;},{id:course.courseId,lessonId:lesson.id,audience:course.audience},{timeout:30000});
    }
    await card.waitFor({state:'visible'});check((await card.innerText()).includes('Completado'),'FUNCTIONAL_DEFECT:D08_COMPLETION_NOT_VISIBLE');await capture(ses,'[data-course="'+course.courseId+'"]',identity.label+'-course-complete',['Completado']);
    result.roles[identity.role]={courseId:course.courseId,courseRevision:course.revision,lessons:course.lessons.length,evaluationQuestions:course.lessons.reduce((n,l)=>n+l.quiz.length,0),uiCourse:true,uiContent:true,uiEvaluation:true,uiProgress:true,providerAck:true,durableReadback:true};save();
  }
  async function newSessionProof(identity){
    const ses=await session(identity,identity.label+'-new-session'),page=ses.page,card=page.locator('[data-course="'+identity.courseId+'"]');await card.waitFor({state:'visible'});
    check((await card.innerText()).includes('Completado'),'PERSISTENCE_FAILURE:D08_NEW_SESSION_PROGRESS_MISSING');await capture(ses,'[data-course="'+identity.courseId+'"]',identity.label+'-new-session',['Completado']);
    const original=[...records.values()].filter(r=>r.uid===identity.uid&&r.kind==='progress'&&r.bundle).at(-1),before=await proveState();
    await perform(ses,{type:original.command.commandType,mode:'replay',courseId:identity.courseId,lessonId:original.command.payload.lessonId},()=>rawPost(ses,original.command));
    check(same(before,await proveState()),'PERSISTENCE_FAILURE:D08_REPLAY_CHANGED_STATE');result.roles[identity.role].independentNewSession=true;result.roles[identity.role].replayNoDuplicate=true;save();return ses;
  }
  try{
    await serving('before');productionBefore=hash(Buffer.from(await(await fetch('https://tya-plataforma.web.app/',{cache:'no-store',signal:AbortSignal.timeout(45000)})).arrayBuffer()));
    const projectDoc=await readDoc(project.path,'preflight.project');check(projectDoc.exists&&projectDoc.data().deleted!==true&&(projectDoc.data().tenantId===undefined||projectDoc.data().tenantId===tenantId),'SOURCE_FAILURE:D08_PROJECT');
    // Same normalization already used by the protected HR bridge; values still
    // come from the current project document and the explicit QA request.
    const countryCode=v=>{const raw=s(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();return raw==='HN'||raw==='HONDURAS'?'HN':raw==='GT'||raw==='GUATEMALA'?'GT':'';};
    const configured=(projectDoc.data().countries||[]).map(countryCode);check(configured.includes(country),'SOURCE_FAILURE:D08_COUNTRY_NOT_IN_CURRENT_PROJECT');result.projectCountryAuthority={country,projectSha256:hash(projectDoc.data())};
    const canonicalAdminProjects=(await awaited('preflight.admin.projects',()=>tenant.collection('projects').select('deleted').get())).docs.filter(x=>x.data().deleted!==true).map(x=>x.id).sort();check(canonicalAdminProjects.includes(projectId),'AUTH_FAILURE:D08_ADMIN_PROJECTS');
    const docPaths=[...identities.flatMap(x=>[x.memberPath,x.profilePath].filter(Boolean)),tenant.collection('academyCourses').doc(customId).path];
    check((await Promise.all(docPaths.map(p=>readDoc(p,'fixture.preflight')))).every(x=>!x.exists),'SOURCE_FAILURE:D08_FIXTURE_DOC_COLLISION');
    for(const identity of identities){try{await auth.getUser(identity.uid);throw Error('SOURCE_FAILURE:D08_AUTH_COLLISION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
    if(google){result.priorAbsence=await awaited('preflight.prior-fixture.absence',()=>verifyClosedAcademyFixture({request:qa,scopePath:googleControl.academyAbsenceScope,db,auth,tenant}),45000);save();}
    fixturesStarted=true;result.fixtureIdsPreflightAbsent=true;save();
    for(const identity of identities){
      const claims={tenantId,projectIds:identity.role==='admin'?canonicalAdminProjects:[projectId],role:identity.role,authNamespace:identity.namespace,qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'D08',...(identity.role==='shopper'?{shopperId:identity.uid,country}:{})};
      identity.expectedClaims=claims;identity.state='AUTH_CREATE_DISPATCHED';save();const created=await auth.createUser({uid:identity.uid,displayName:identity.name,disabled:false});identity.authIdentity=authIdentity(created);identity.state='CLAIMS_DISPATCHED';save();await auth.setCustomUserClaims(identity.uid,claims);
      const staff=identity.role==='admin'?{entitlementMode:'TYA_COMPLETE',claimsDigest:hash(JSON.stringify({authNamespace:'staff',projectIds:canonicalAdminProjects,role:'admin',tenantId})),providerUidFingerprint:hash('cxorbia-provider-uid-v1\0'+identity.uid)}:{};
      identity.expectedMembership={uid:identity.uid,...claims,name:identity.name,active:true,status:'active',...staff,...(identity.role==='shopper'?h.shopperFixtureMembership(identity.uid,claims):{})};identity.memberCreateDispatched=true;save();await awaited('fixture.member.create:'+identity.uid,()=>db.doc(identity.memberPath).create(identity.expectedMembership));
      if(identity.profilePath){identity.expectedProfile={id:identity.uid,shopperId:identity.uid,tenantId,projectIds:[projectId],pais:country,country,nombre:identity.name,active:true,status:'active',qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'D08'};identity.profileCreateDispatched=true;save();await awaited('fixture.profile.create:'+identity.uid,()=>db.doc(identity.profilePath).create(identity.expectedProfile));check(same((await readDoc(identity.profilePath,'fixture.profile.readback')).data(),identity.expectedProfile),'PERSISTENCE_FAILURE:D08_PROFILE_READBACK');}
      check(same((await readDoc(identity.memberPath,'fixture.member.readback')).data(),identity.expectedMembership),'PERSISTENCE_FAILURE:D08_MEMBER_READBACK');const actual=await auth.getUser(identity.uid);check(same(actual.customClaims,claims)&&same(authIdentity(actual),identity.authIdentity),'AUTH_FAILURE:D08_AUTH_READBACK');identity.state='CREATED_VERIFIED';save();
    }
    const {chromium}=await import('playwright');browser=await awaited('browser.launch',()=>chromium.launch({headless:true}),45000);
    for(const identity of identities.filter(x=>!x.observer)){
      const ses=await session(identity,identity.label);await resource(ses);await progressUi(ses);await ses.context.close();const fresh=await newSessionProof(identity);
      if(identity.role==='admin'){
        const payload={id:customId,n:spec.draftName,desc:spec.draftDescription,cat:'Operación',ic:'🧪',color:'#475569',cert:false,lessons:[],scope:draftScope,qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'D08'};
        await perform(fresh,{type:'academy.course.create',mode:'write'},()=>fresh.page.evaluate(p=>CX.acadData.addCourse('admin',p,CX.permissions.ctx()),payload));
        // Direct fixture creation has no UI handler to call Academia's draw().
        // Re-enter the real route after provider ACK/readback before editing it.
        await fresh.page.evaluate(()=>CX.router.nav('aprendizaje'));
        await fresh.page.locator('.acad-edit[data-cid="'+customId+'"]').waitFor({state:'visible',timeout:30000});
        await fresh.page.locator('.acad-edit[data-cid="'+customId+'"]').click();await fresh.page.locator('#ecN').fill(spec.updatedName);await fresh.page.locator('#ecD').fill(spec.updatedDescription);await fresh.page.locator('#ecC').selectOption({label:'Operación'});
        await fresh.page.locator('#ecScProj').selectOption(draftScope.projectId);await fresh.page.locator('#ecScRol').selectOption(['admin']);
        for(const id of ['#ecScPais','#ecScNivel','#ecScModulo','#ecScPaquete'])await fresh.page.locator(id).selectOption([]);
        check(await fresh.page.evaluate(({tenantId,projectIds})=>CX.BRAND.id===tenantId&&JSON.stringify([...document.querySelector('#ecScProj').selectedOptions].map(x=>x.value))===JSON.stringify(projectIds),{tenantId,projectIds:draftScope.projectId}),'SOURCE_FAILURE:D08_DRAFT_SCOPE_SELECTOR');
        const edited=await perform(fresh,{type:'academy.course.update',mode:'write'},()=>fresh.page.locator('#ecSave').click());await fresh.page.locator('#ecSave').waitFor({state:'hidden'});check(edited.ack.entityReadback?.version===2&&edited.ack.entityReadback?.contentVersion===2,'PERSISTENCE_FAILURE:D08_EDIT_VERSION');
        await fresh.context.close();const adminAgain=await session(identity,'admin-edit-new-session');const card=adminAgain.page.locator('[data-course="'+customId+'"]');await card.waitFor({state:'visible'});check((await card.innerText()).includes(spec.updatedName)&&(await card.innerText()).includes(spec.updatedDescription),'PERSISTENCE_FAILURE:D08_EDIT_NEW_SESSION');await capture(adminAgain,'[data-course="'+customId+'"]','admin-edit-new-session',[spec.updatedName,spec.updatedDescription]);
        const stale={...edited.record.command,idempotencyKey:tag+'_stale_edit',expectedVersion:1};await perform(adminAgain,{type:'academy.course.update',mode:'negative',negative:'stale_version',expectedCode:'ACADEMY_EXPECTED_VERSION_CONFLICT'},()=>rawPost(adminAgain,stale));
        const before=await proveState();await perform(adminAgain,{type:'academy.course.update',mode:'replay'},()=>rawPost(adminAgain,edited.record.command));check(same(before,await proveState()),'PERSISTENCE_FAILURE:D08_EDIT_REPLAY_CHANGED');result.authorizedAdminEdit={providerAck:true,durableReadback:true,independentNewSession:true,replayNoDuplicate:true,version:2,contentVersion:2,state:'borrador',courseId:customId};await adminAgain.context.close();
      }else{
        check(await fresh.page.locator('.acad-edit').count()===0,'AUTH_FAILURE:D08_EDITOR_VISIBLE_TO_LEARNER');
        const postCount=fresh.postCount,uiDenied=await fresh.page.evaluate(({id,patch})=>CX.acadData.editCourse('admin',id,patch,CX.permissions.ctx()),{id:customId,patch:{n:spec.updatedName,desc:spec.updatedDescription,cat:'Operación',scope:draftScope}});
        check(uiDenied.ok===false&&fresh.postCount===postCount,'AUTH_FAILURE:D08_UI_EDIT_PERMISSION');result.negatives.push({case:'ui_edit_permission',role:identity.role,zeroCommands:true});
        const original=[...records.values()].find(r=>r.command.commandType==='academy.course.update'&&r.mode==='write'),denied={...original.command,actor:{actorId:identity.uid,role:identity.role,projectIds:[projectId]},expectedVersion:2,idempotencyKey:tag+'_'+identity.label+'_denied_edit'};
        await perform(fresh,{type:'academy.course.update',mode:'negative',negative:'role_denied',expectedCode:'ACADEMY_ACTOR_DENIED',actorId:identity.uid},()=>rawPost(fresh,denied));await fresh.context.close();
      }
    }
    const observer=identities.find(x=>x.observer),other=await session(observer,'other-shopper');
    const self=await other.page.evaluate(()=>({owner:CX.data.__academyState.progressOwnerUid,progress:CX.data.__academyState.progress}));check(self.owner===observer.uid&&self.progress.ownerUid===observer.uid&&Object.keys(self.progress.courses||{}).length===0,'AUTH_FAILURE:D08_OTHER_LEARNER_LEAK');
    const ownCard=other.page.locator('[data-course="s_ruta"]');check((await ownCard.innerText()).includes('Comenzar'),'AUTH_FAILURE:D08_OTHER_LEARNER_UI_PROGRESS');
    const foreignPath=identities.find(x=>x.label==='shopper').memberPath,readDenied=await other.page.evaluate(async path=>{try{await firebase.firestore().doc(path).get({source:'server'});return false;}catch(error){return String(error?.code||'').includes('permission-denied');}},foreignPath);check(readDenied,'AUTH_FAILURE:D08_FOREIGN_MEMBERSHIP_READ');
    result.negatives.push({case:'other_learner',role:'shopper',emptyOwnProgress:true,foreignMemberReadDenied:true});
    const course=courses.find(c=>c.audience==='cliente'),lesson=course.lessons[0],wrong={version:'cxorbia-academy-command-boundary-v1',commandType:'academy.progress.lesson.complete',entityType:'academyProgress',entityId:course.courseId,tenantId,projectId,periodId:null,requireProject:true,requirePeriod:false,actor:{actorId:observer.uid,role:'shopper',projectIds:[projectId]},expectedVersion:0,idempotencyKey:tag+'_wrong_audience',payload:{origin:'base',audience:course.audience,courseId:course.courseId,revision:course.revision,lessonId:lesson.id,answers:lesson.quiz.map(q=>q.answer)},source:'d08-qa-negative',authorization:{providerEnforcementRequired:true,permission:'academy.progress.self'}};
    await perform(other,{type:wrong.commandType,mode:'negative',negative:'wrong_audience',expectedCode:'ACADEMY_PROGRESS_COURSE_DENIED',courseId:course.courseId,lessonId:lesson.id,actorId:observer.uid},()=>rawPost(other,wrong));await other.context.close();
    check(!result.interceptionError&&['admin','shopper','cliente'].every(role=>result.roles[role]?.independentNewSession&&result.roles[role]?.replayNoDuplicate)&&result.resources.length===3&&result.authorizedAdminEdit?.independentNewSession,'FUNCTIONAL_DEFECT:D08_COVERAGE_INCOMPLETE');result.functionalPass=true;save();
  }catch(error){result.error=redact(error.message||error);result.classification=result.error.match(/(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):/)?.[1]||'FUNCTIONAL_DEFECT';save();}
  finally{
    await Promise.allSettled(liveSessions.map(ses=>awaited(ses.label+':http.abort',()=>ses.page.__d08NativeEvaluate(()=>window.__D08_REQUEST_ABORT?.abort()),3000)));
    await Promise.allSettled(contexts.map(c=>c.close()));if(browser)await awaited('browser.close',()=>browser.close(),10000).catch(()=>{});
    if(!fixturesStarted)result.cleanup={ok:true,writesNotStarted:true,remainingOwnedDocuments:0,remainingOwnedAuth:0};
    else try{
      check(!result.requestJournal.some(r=>r.dispatched===true&&r.responseParsed!==true),'ENVIRONMENT_FAILURE:D08_UNSETTLED_COMMAND_CLEANUP_HELD');
      const known=new Set([...records.values()].flatMap(r=>[r.receiptPath,r.auditPath,r.trailPath])),uids=identities.map(x=>x.uid),deleted=[];
      await awaited('cleanup.firestore.transaction',()=>db.runTransaction(async tx=>{
        for(const collection of ['commandReceipts','academyAudit','entityAuditTrail']){const found=await tx.get(tenant.collection(collection).where('actorUid','in',uids));check(found.docs.every(x=>known.has(x.ref.path)),'PERSISTENCE_FAILURE:D08_UNEXPECTED_ACTOR_REFERENCE:'+collection);}
        const createdCourses=await tx.get(tenant.collection('academyCourses').where('createdByUserId','in',uids));check(createdCourses.docs.every(x=>x.id===customId),'PERSISTENCE_FAILURE:D08_UNEXPECTED_COURSE');
        const refs=[];const committed=[];
        for(const r of records.values()){
          const docs=await Promise.all([r.receiptPath,r.auditPath,r.trailPath].map(p=>tx.get(db.doc(p)))),bundle=Object.fromEntries(['receipt','audit','trail'].map((k,i)=>[k,docs[i].exists?docs[i].data():null]));
          if(!verifyBundle(r,bundle,spec))continue;if(r.bundleSha256)check(hash(bundle)===r.bundleSha256,'PERSISTENCE_FAILURE:D08_CLEANUP_RECEIPT_CHANGED');r.bundle=bundle;committed.push(r);refs.push(...docs.map(x=>x.ref));
        }
        for(const identity of identities){
          const member=await tx.get(db.doc(identity.memberPath));if(member.exists){check(identity.memberCreateDispatched===true,'PERSISTENCE_FAILURE:D08_UNOWNED_MEMBER');verifyMembership(member.data(),identity,committed,spec);refs.push(member.ref);}
          if(identity.profilePath){const profile=await tx.get(db.doc(identity.profilePath));if(profile.exists){check(identity.profileCreateDispatched===true&&same(profile.data(),identity.expectedProfile),'PERSISTENCE_FAILURE:D08_PROFILE_CONCURRENT_CHANGE');refs.push(profile.ref);}}
        }
        const course=await tx.get(tenant.collection('academyCourses').doc(customId));verifyCourse(course.exists?course.data():null,committed,spec);if(course.exists)refs.push(course.ref);
        for(const ref of refs)tx.delete(ref);deleted.splice(0,deleted.length,...refs.map(x=>x.path));
      },{maxAttempts:1}),60000);
      let deletedAuth=0;
      for(const identity of identities){try{const user=await auth.getUser(identity.uid),claims=user.customClaims||{},initialClaims=identity.state==='CLAIMS_DISPATCHED'&&Object.keys(claims).length===0;check(identity.authIdentity&&same(authIdentity(user),identity.authIdentity)&&(same(claims,identity.expectedClaims)||initialClaims),'AUTH_FAILURE:D08_AUTH_CLEANUP_OWNERSHIP');await auth.deleteUser(identity.uid);deletedAuth++;}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
      const paths=[...known,...identities.flatMap(x=>[x.memberPath,x.profilePath].filter(Boolean)),tenant.collection('academyCourses').doc(customId).path];check((await Promise.all(paths.map(p=>readDoc(p,'cleanup.absence')))).every(x=>!x.exists),'PERSISTENCE_FAILURE:D08_DOC_RESIDUE');
      for(const identity of identities){try{await auth.getUser(identity.uid);throw Error('AUTH_FAILURE:D08_AUTH_RESIDUE');}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
      result.cleanup={ok:true,exactKnownPathsOnly:true,deletedDocuments:deleted.length,deletedAuth,remainingOwnedDocuments:0,remainingOwnedAuth:0,ownershipTransaction:true};
    }catch(error){result.cleanup={...result.cleanup,ok:false,error:redact(error.message||error),journalPath:out+'/result.json',manualDeletionAuthorized:false};}
    try{await serving('after');if(productionBefore){const r=await fetch('https://tya-plataforma.web.app/',{cache:'no-store',signal:AbortSignal.timeout(45000)});check(r.ok,'PROVIDER_FAILURE:D08_PRODUCTION_READBACK');result.productionIndexUnchanged=hash(Buffer.from(await r.arrayBuffer()))===productionBefore;check(result.productionIndexUnchanged,'ENVIRONMENT_FAILURE:D08_PRODUCTION_INDEX_DRIFT');}}catch(error){result.postflightError=redact(error.message||error);}
    if(result.functionalPass&&result.cleanup.ok&&!result.awaitJournal.some(r=>r.state==='TIMED_OUT')&&result.serving.before?.exact&&result.serving.after?.exact&&result.productionIndexUnchanged&&!result.postflightError)result.decision='PASS_I3_D08_UI_PROVIDER_NEW_SESSION_EDIT_NEGATIVES_CLEANUP';save();
  }
  console.log(JSON.stringify({decision:result.decision,sourceSha,runId,roles:Object.keys(result.roles),commands:records.size,cleanup:result.cleanup,error:result.error||result.postflightError||null,fullDomain:false}));
  if(result.decision!=='PASS_I3_D08_UI_PROVIDER_NEW_SESSION_EDIT_NEGATIVES_CLEANUP')process.exitCode=2;
  if(result.awaitJournal.some(r=>r.state==='TIMED_OUT')){
    await awaited('firestore.terminate',()=>db.terminate(),10000).catch(()=>{});save();
    // Abort leftover transport handles after saving HOLD; do not wait 45 minutes.
    process.exit(2);
  }
}

async function runClientCollaborationQa(){
  const e=process.env,s=v=>String(v??'').trim(),hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const check=(yes,code)=>{if(!yes)throw Error(code);};
  const runId=s(e.GITHUB_RUN_ID),attempt=s(e.GITHUB_RUN_ATTEMPT||'1'),sourceSha=s(e.FOCAL_SOURCE),sourceTree=s(e.FOCAL_TREE);
  const projectName=s(e.PROJECT),tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,'');
  const out=s(e.QA_OUT),expectedHr=s(e.EXPECTED_HR_REVISION),tag='qa_f09_'+runId+'_'+attempt;
  check(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE==='PAULA_AUTHORIZED_F09_DEV_ONLY'&&projectName==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&tenantId&&projectId&&out&&/^\d{8,}$/.test(runId)&&/^[a-f0-9]{40}$/.test(sourceSha)&&/^[a-f0-9]{40}$/.test(sourceTree)&&/^[a-f0-9]{64}$/.test(expectedHr),'SOURCE_FAILURE:F09_SCOPE_GATE_DENIED');
  fs.mkdirSync(out,{recursive:true});
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
  const result={schemaVersion:'cxorbia.i3.f09.client-collaboration-live.v1',decision:'HOLD',sourceSha,sourceTree,runId,runAttempt:attempt,production:false,tenantId,projectId,periodId:null,
    runtimeRevision:s(e.DEV_REVISION),runtimeDigest:s(e.RUNTIME_DIGEST),hostingVersion:s(e.HOSTING_VERSION_NAME),hrBefore:null,hrAfter:null,
    ui:{},readback:{},creationJournal:[],identities:[],cleanup:{ok:false},safety:{hrWrites:0,realMemberWrites:0,calendarCalls:0,emailCalls:0,paymentWrites:0,productionDeploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');save();
  const request=async(url,options={})=>{const r=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});const b=await r.json().catch(()=>({}));return {http:r.status,...b};};
  const hrMeta=()=>request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&f09='+runId+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'}});
  const planned=[['a','cliente'],['b','cliente'],['admin','admin']].map(([label,role])=>({uid:tag+'_'+label,label,role,name:'QA F09 '+runId+' '+label,memberPath:tenant.collection('users').doc(tag+'_'+label).path}));
  const contexts=[],records=new Map();let browser=null,periodId='',periodIds=[],projectBefore='',periodBefore='',productionBefore='';
  const authIdentity=user=>({uid:user.uid,displayName:user.displayName||'',disabled:user.disabled,email:user.email||null,emailVerified:user.emailVerified,phoneNumber:user.phoneNumber||null,photoURL:user.photoURL||null,creationTime:user.metadata.creationTime,providerData:user.providerData||[],mfa:user.multiFactor?.enrolledFactors||[]});
  const getPeriod=async()=>{
    const h=await request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=json&f09='+runId,{headers:{'cache-control':'no-cache, no-store'}});
    const snap=h.snapshot||h.data||h,key=s(snap.source?.currentCalendarPeriodKey),p=(snap.periods||[]).find(x=>s(x.key||x.periodKey)===key);
    check(h.http===200&&p?.id&&key&&snap.sourceSafe===true&&snap.imported===false&&snap.tenantId===tenantId&&snap.projectId===projectId&&p.projectId===projectId&&h._runtime?.revision===expectedHr&&h._runtime?.cacheOrigin==='runtime_refresh','SOURCE_FAILURE:F09_ACTIVE_HR_PERIOD_MISSING');
    result.hrPeriodAuthority={id:s(p.id),key,sourceRevision:h._runtime.revision,authority:'current_server_hr_snapshot'};return s(p.id);
  };
  function commandPaths(c,uid){
    const kind={'client.nps.submit':'nps','client.note.create':'note','client.meeting.request':'meeting'}[c.commandType];
    check(kind&&c.tenantId===tenantId&&c.projectId===projectId&&c.periodId===periodId,'SOURCE_FAILURE:F09_COMMAND_SCOPE');
    const rid=hash(`${tenantId}\0${projectId}\0${periodId}\0${c.idempotencyKey}`).slice(0,40);
    const id='client-'+kind+'-'+hash([tenantId,projectId,periodId,uid,c.commandType,c.idempotencyKey]).slice(0,32);
    return {uid,kind,id,commandDigest:hash(stable(c)),command:c,entityPath:tenant.collection('bulletins').doc(id).path,receiptPath:tenant.collection('commandReceipts').doc(rid).path,auditPath:tenant.collection('entityAuditTrail').doc('client-'+rid).path};
  }
  async function track(c,uid){
    const record=commandPaths(c,uid),old=records.get(record.receiptPath);
    if(old){check(old.uid===uid&&old.commandDigest===record.commandDigest,'SOURCE_FAILURE:F09_REPLAY_PLAN_CHANGED');return old;}
    const existing=await Promise.all([record.entityPath,record.receiptPath,record.auditPath].map(p=>db.doc(p).get()));
    check(existing.every(x=>!x.exists),'SOURCE_FAILURE:F09_ENTITY_COLLISION');
    records.set(record.receiptPath,record);result.creationJournal.push(record);save();return record;
  }
  function ownedEntity(row,record){
    const fields={nps:['score','comment'],note:['subject','detail'],meeting:['subject','date','time','mode']}[record.kind];
    return row&&row.id===record.id&&row.entityType==='client_collaboration'&&row.status==='active'&&row.collaborationStatus==='pending'&&row.createdBy===record.uid&&row.idempotencyKey===record.command.idempotencyKey&&row.requesterUid===record.uid&&row.tenantId===tenantId&&row.projectId===projectId&&row.periodId===periodId&&row.kind===record.kind&&row.version===1&&row.requesterName===planned.find(x=>x.uid===record.uid)?.name&&fields.every(k=>record.command.payload[k]===undefined?row[k]===undefined:row[k]===(typeof record.command.payload[k]==='string'?s(record.command.payload[k]):record.command.payload[k]));
  }
  async function verifyRecord(record,ack){
    check(ack?.ok===true&&ack.providerAck===true&&ack.status==='committed'&&ack.readbackVerified===true&&ack.actorUid===record.uid&&ack.entityId===record.id&&ack.tenantId===tenantId&&ack.projectId===projectId&&ack.periodId===periodId,'PERSISTENCE_FAILURE:F09_PROVIDER_ACK');
    const [entity,receipt,audit]=await Promise.all([record.entityPath,record.receiptPath,record.auditPath].map(p=>db.doc(p).get()));
    const r=entity.data(),c=receipt.data(),a=audit.data();
    check(entity.exists&&receipt.exists&&audit.exists&&r.requesterUid===record.uid&&r.tenantId===tenantId&&r.projectId===projectId&&r.periodId===periodId&&r.version===1&&r.kind===record.kind&&r.actionRoute==='tablon'&&JSON.stringify(r.targetUserIds)===JSON.stringify([record.uid])&&r.targetAll!==true&&!(r.targetProjectIds||[]).length&&c.actorUid===record.uid&&c.commandDigest===record.commandDigest&&c.entityId===record.id&&a.actorUid===record.uid&&a.idempotencyKey===record.command.idempotencyKey,'PERSISTENCE_FAILURE:F09_INDEPENDENT_READBACK');
    check(ownedEntity(r,record),'PERSISTENCE_FAILURE:F09_ENTITY_PAYLOAD_DRIFT');
    for(const [field,value] of [['entitySha256',r],['receiptSha256',c],['auditSha256',a]]){const digest=hash(stable(value));check(!record[field]||record[field]===digest,'PERSISTENCE_FAILURE:F09_REPLAY_READBACK_CHANGED');record[field]=digest;}
    return {entityId:record.id,kind:record.kind,providerAck:true,readbackVerified:true,actorExact:true,version:1,receiptAndAudit:true,privateRecipient:true};
  }
  try{
    const initial=await hrMeta();check(initial.http===200&&initial.revision===expectedHr&&initial.hrWrites===false&&initial.production===false,'PROVIDER_FAILURE:F09_HR_PREFLIGHT');result.hrBefore=initial.revision;
    productionBefore=hash(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).text());
    periodId=await getPeriod();result.periodId=periodId;
    periodIds=[...new Set([periodId,result.hrPeriodAuthority.key])];
    const pr=await project.get(),periodDocs=await Promise.all(periodIds.map(id=>project.collection('periods').doc(id).get())),present=periodDocs.filter(x=>x.exists);
    check(pr.exists&&pr.data().tenantId===tenantId&&present.length<=1&&present.every(x=>(x.data().tenantId===undefined||x.data().tenantId===tenantId)&&(x.data().projectId===undefined||x.data().projectId===projectId)),'SOURCE_FAILURE:F09_EXACT_PROJECT_PERIOD_REQUIRED');
    check([pr.data(),...present.map(x=>x.data())].every(x=>x.active!==false&&['status','state'].every(k=>!['inactive','deleted','closed','archived','inactivo','cerrado','archivado'].includes(s(x[k]).toLowerCase()))),'SOURCE_FAILURE:F09_PERIOD_NOT_WRITABLE');
    const mode=s(pr.data().operationalSource?.mode||pr.data().routeSource?.mode||pr.data().routeSource);
    check(present.length||!mode||mode==='external','SOURCE_FAILURE:F09_EXTERNAL_PERIOD_AUTHORITY_REQUIRED');
    projectBefore=hash(stable(pr.data()));periodBefore=hash(stable(periodDocs.map(x=>({id:x.id,exists:x.exists,data:x.exists?x.data():null}))));
    result.preflight={exactProject:true,exactPeriod:true,periodAuthority:present.length?'project_period_metadata':'current_server_hr_snapshot',projectSourceMode:mode||'server_hr_exact_scope_legacy_metadata_absent',projectSha256:projectBefore,periodSha256:periodBefore};
    const canonicalAdminProjects=(await tenant.collection('projects').select('deleted').get()).docs.filter(x=>x.data().deleted!==true).map(x=>x.id).sort();
    check(canonicalAdminProjects.includes(projectId),'SOURCE_FAILURE:F09_ADMIN_CANONICAL_PROJECT_SCOPE');
    for(const identity of planned){
      check(!(await db.doc(identity.memberPath).get()).exists,'SOURCE_FAILURE:F09_MEMBER_COLLISION');
      try{await auth.getUser(identity.uid);throw Error('SOURCE_FAILURE:F09_AUTH_COLLISION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}
    }
    result.identities=planned.map(x=>({...x,state:'PLANNED_ABSENT'}));save();
    for(const identity of planned){
      const claims={tenantId,projectIds:identity.role==='admin'?canonicalAdminProjects:[projectId],role:identity.role,authNamespace:'staff',qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'F09'};
      const entry=result.identities.find(x=>x.uid===identity.uid);
      entry.expectedClaims=claims;entry.state='AUTH_CREATE_DISPATCHED';save();
      const created=await auth.createUser({uid:identity.uid,displayName:identity.name,disabled:false});
      entry.authIdentity=authIdentity(created);entry.state='AUTH_CREATED';save();
      entry.state='CLAIMS_DISPATCHED';save();
      await auth.setCustomUserClaims(identity.uid,claims);
      entry.memberCreateDispatched=true;save();
      const staffMembership=identity.role==='admin'?{
        entitlementMode:'TYA_COMPLETE',
        claimsDigest:hash({authNamespace:'staff',projectIds:[...new Set(claims.projectIds)].sort(),role:identity.role,tenantId}),
        providerUidFingerprint:hash('cxorbia-provider-uid-v1\0'+identity.uid)
      }:{};
      const member={uid:identity.uid,...claims,name:identity.name,active:true,status:'active',...staffMembership};
      entry.expectedMembershipSha256=hash(stable(member));save();
      await db.doc(identity.memberPath).create(member);
      const persistedMember=await db.doc(identity.memberPath).get();
      check(persistedMember.exists&&JSON.stringify(stable(persistedMember.data()))===JSON.stringify(stable(member)),'AUTH_FAILURE:F09_CREATED_MEMBERSHIP_READBACK');
      const read=await auth.getUser(identity.uid);check(JSON.stringify(stable(read.customClaims||{}))===JSON.stringify(stable(claims)),'AUTH_FAILURE:F09_CREATED_IDENTITY_READBACK');
      check(JSON.stringify(stable(entry.authIdentity))===JSON.stringify(stable(authIdentity(read))),'AUTH_FAILURE:F09_CREATED_IDENTITY_CHANGED');entry.state='CREATED_VERIFIED';save();
    }
    const {chromium}=await import('playwright');browser=await chromium.launch({headless:true});
    const url=host+'/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId='+encodeURIComponent(projectId)+'&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV';
    async function session(identity){
      const ctx=await browser.newContext({viewport:{width:1440,height:1000}});contexts.push(ctx);const page=await ctx.newPage();
      const redact=v=>String(v??'').replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]').replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/g,'$1').slice(0,700);
      const diagnostic={label:identity.label,role:identity.role,stage:'OPENING',network:[],pageErrors:[]};
      (result.sessionDiagnostics??=[]).push(diagnostic);save();
      page.on('pageerror',error=>{if(diagnostic.pageErrors.length<20)diagnostic.pageErrors.push(redact(error.message));});
      page.on('requestfailed',r=>{if(diagnostic.network.length<80)diagnostic.network.push({path:new URL(r.url()).pathname,error:redact(r.failure()?.errorText)});});
      page.on('response',r=>{const u=new URL(r.url());if(diagnostic.network.length<80&&(/\/api\/.*\/hr-live|\/v1\/cxorbia\//.test(u.pathname)||r.status()>=400))diagnostic.network.push({path:u.pathname,status:r.status()});});
      const capture=async()=>{
        diagnostic.observed=await page.evaluate(({uid,role,tenantId,projectId,periodId,hr})=>{
          const w=window,a=w.CX?.backendAuth?.context?.()||{},p=w.CX_BACKEND_AUTHORIZED_STATE?.principal||{},g=w.CX_C6_HR_AUTHORITY_GATE||{},d=w.CX?.data||{},h=w.CX_PROTECTED_AUTH_HR_AUTHORITY||{};
          const clean=v=>String(v??'').replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]').replace(/(https?:\/\/[^\s?#]+)[?#][^\s]*/g,'$1').slice(0,500);
          const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>o&&['string','number','boolean'].includes(typeof o[k])).map(k=>[k,typeof o[k]==='string'?clean(o[k]):o[k]]));
          const predicates={authenticated:a.authenticated===true,role:a.role===role,namespace:a.authNamespace==='staff',tenant:a.tenantId===tenantId,firebaseActor:w.firebase?.auth?.().currentUser?.uid===uid,principalActor:p.actorUid===uid,principalRole:p.role===role,principalTenant:p.tenantId===tenantId,hrApplied:h.applied===true,gateReady:g.ready===true,gateNotBlocked:!g.blocked,project:d.currentProjectId===projectId,period:d.currentPeriodId===periodId,hrRevision:d.previewMeta?.sourceRevision===hr};
          const visible=id=>{const x=document.getElementById(id);return !!x&&getComputedStyle(x).display!=='none'&&getComputedStyle(x).visibility!=='hidden'&&x.getClientRects().length>0;};
          return {predicates,failedPredicates:Object.keys(predicates).filter(k=>!predicates[k]),
            expected:{role,tenantId,projectId,periodId,sourceRevision:hr},auth:pick(a,['authenticated','role','authNamespace','tenantId','projectId']),principal:pick(p,['role','authNamespace','tenantId','projectId']),
            data:pick(d,['currentProjectId','currentPeriodId','__liveHrSourceRevision']),preview:pick(d.previewMeta,['sourceRevision','sourceRef','status']),
            gate:pick(g,['ready','blocked','reason','error','status','projectId','periodId','sourceRevision']),
            authority:{...pick(h,['applied','error','retryable','role','tenantId','projectId','sourceRevision','atomicPublication']),actorMatches:h.actorUid===uid},
            reconcile:pick(w.CX_PROTECTED_AUTH_HR_BOOT_RECONCILE,['attempts','attempt','authorized','protectedBackendReady','runtimeDependenciesReady','exhausted','lastAuthorityError','status']),
            adminWiring:pick(w.CX_C6_LIVE_USER_ADMIN_WIRING,['status','code']),adminHandoff:pick(w.CX_C6_LIVE_USER_ADMIN_FRONTEND_HANDOFF,['status','error','appOn','loginHidden']),
            backendState:{...pick(w.CX_BACKEND_LAST_STATE,['status','phase','error','code','source','empty','sourceRef','tenantId','projectId']),counts:Object.fromEntries(Object.entries(w.CX_BACKEND_LAST_STATE?.counts||{}).filter(([,v])=>Number.isFinite(v)))},
            backendScope:{...pick(w.CX_BACKEND_PROJECT_SCOPE,['status','error','tenantId','projectId','mode','role','totalProjectRecords']),selectedProjectPresent:(w.CX_BACKEND_PROJECT_SCOPE?.activeProjectIds||[]).includes(projectId)},dataSource:pick(w.CX?.dataSource,['status','error','sourceRef','sourceRevision','projectId','periodId']),
            session:pick(w.CX?.session,['role','view','projectId','periodId']),appVisible:visible('app'),loginVisible:visible('login'),gateText:clean(document.querySelector('[data-cx-human-authority-gate]')?.textContent)};
        },{uid:identity.uid,role:identity.role,tenantId,projectId,periodId,hr:expectedHr}).catch(error=>({captureError:redact(error.message)}));save();
      };
      try{
      for(let i=0;i<3;i++){
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.firebase?.apps?.length>0,null,{timeout:90000});
        const token=await auth.createCustomToken(identity.uid);
        try{await page.evaluate(async t=>{await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithCustomToken(t);},token);}catch(error){if(!/context was destroyed|navigation|network|interrupted/i.test(String(error)))throw error;}
        await page.waitForLoadState('domcontentloaded');if(await page.evaluate(uid=>window.firebase?.auth?.().currentUser?.uid===uid,identity.uid).catch(()=>false))break;
      }
      await page.goto('about:blank');await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction(uid=>window.firebase?.auth?.().currentUser?.uid===uid&&typeof window.CX?.backendAuth?.ensureAuthenticated==='function',identity.uid,{timeout:90000});
      await page.evaluate(()=>CX.backendAuth.ensureAuthenticated());
      diagnostic.stage='AUTHENTICATED_WAITING_OPERATIONAL_CONTEXT';save();
      await page.waitForFunction(({uid,role,tenantId,projectId,periodId,hr})=>{
        const a=CX.backendAuth.context()||{},p=window.CX_BACKEND_AUTHORIZED_STATE?.principal||{},g=window.CX_C6_HR_AUTHORITY_GATE||{},d=CX.data;
        return a.authenticated===true&&a.role===role&&a.authNamespace==='staff'&&a.tenantId===tenantId&&firebase.auth().currentUser?.uid===uid&&p.actorUid===uid&&p.role===role&&p.tenantId===tenantId&&window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied===true&&g.ready===true&&!g.blocked&&d.currentProjectId===projectId&&d.currentPeriodId===periodId&&d.previewMeta?.sourceRevision===hr;
      },{uid:identity.uid,role:identity.role,tenantId,projectId,periodId,hr:expectedHr},{timeout:150000});
      diagnostic.stage='READY';await capture();
      return {ctx,page};
      }catch(error){diagnostic.failedAt=diagnostic.stage;diagnostic.stage='FAILED';diagnostic.error=redact(error.message);await capture();const gate=page.locator('[data-cx-human-authority-gate]').first();if(await gate.count())await gate.screenshot({path:out+'/session-'+identity.label+'-gate.png',timeout:5000}).catch(()=>{});save();throw error;}
    }
    const a=await session(planned[0]);let dropNoteAck=true,droppedResolve;
    const droppedPromise=new Promise(resolve=>{droppedResolve=resolve;});
    await a.page.route('**/v1/cxorbia/commands',async route=>{
      const c=route.request().postDataJSON();if(!String(c?.commandType||'').startsWith('client.'))return route.continue();
      try{
        const record=await track(c,planned[0].uid);
        if(c.commandType==='client.note.create'&&dropNoteAck){
          dropNoteAck=false;const response=await route.fetch({timeout:90000}),ack=await response.json();
          result.ui.noteCommittedBeforeAckLoss=await verifyRecord(record,ack);save();await route.abort('failed');droppedResolve(true);return;
        }
        await route.continue();
      }catch(error){result.interceptionError=String(error?.message||error);save();await route.abort('failed').catch(()=>{});droppedResolve(false);}
    });
    await a.page.evaluate(()=>CX.router.nav('cli_insights'));
    await a.page.waitForFunction(()=>document.body.innerText.includes('0 respuesta(s)'));
    const noteSubject='QA F09 '+runId+' nota',noteDetail='Detalle verificable de la solicitud',meetingSubject='QA F09 '+runId+' reunión';
    const responseFor=type=>a.page.waitForResponse(r=>{try{return r.url().endsWith('/v1/cxorbia/commands')&&r.request().postDataJSON()?.commandType===type;}catch(_){return false;}},{timeout:90000});
    async function submit(type,click){const [response]=await Promise.all([responseFor(type),click()]);const ack=await response.json();const record=[...records.values()].find(x=>x.command.commandType===type);result.ui[type]=await verifyRecord(record,ack);save();return {ack,record};}
    await a.page.locator('#npsBtn').click();await a.page.locator('#npsCom').fill('QA F09 '+runId+' programa');
    await submit('client.nps.submit',()=>a.page.locator('.npsN[data-n="9"]').click());await a.page.locator('#npsCom').waitFor({state:'hidden',timeout:30000});
    await a.page.locator('#notaBtn').click();await a.page.locator('#ntTema').fill(noteSubject);await a.page.locator('#ntTxt').fill(noteDetail);await a.page.locator('#ntOk').click();
    check(await Promise.race([droppedPromise,new Promise(resolve=>setTimeout(()=>resolve(false),90000))]),'PERSISTENCE_FAILURE:F09_LOST_ACK_SETUP');
    await a.page.waitForFunction(()=>document.querySelector('#ntOk')?.disabled===false);check(await a.page.locator('#ntOk').count()===1,'PERSISTENCE_FAILURE:F09_FALSE_SUCCESS_AFTER_LOST_ACK');
    const note=await submit('client.note.create',()=>a.page.locator('#ntOk').click());
    check(note.ack.idempotentReplay===true&&note.ack.providerWrites===0,'PERSISTENCE_FAILURE:F09_LOST_ACK_RETRY_DUPLICATE');result.ui.lostAckRecoveredSameEntity=true;
    await a.page.locator('#ntOk').waitFor({state:'hidden',timeout:30000});
    const timezone=s(pr.data().timeZone||pr.data().timezone||'UTC'),dateParts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.now()+7*86400000)).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    const meetingDate=dateParts.year+'-'+dateParts.month+'-'+dateParts.day;
    await a.page.locator('#reuBtn').click();await a.page.locator('#ruTema').fill(meetingSubject);await a.page.locator('#ruF').fill(meetingDate);await a.page.locator('#ruH').fill('12:00');await a.page.locator('#ruM').selectOption({label:'Presencial'});
    await submit('client.meeting.request',()=>a.page.locator('#ruOk').click());await a.page.locator('#ruOk').waitFor({state:'hidden',timeout:30000});
    await a.page.screenshot({path:out+'/cliente-after.png',fullPage:true});await a.ctx.close();
    const second=await session(planned[0]);await second.page.evaluate(()=>CX.router.nav('cli_insights'));
    await second.page.waitForFunction(({note,meeting})=>document.body.innerText.includes(note)&&document.body.innerText.includes(meeting)&&document.body.innerText.includes('1 respuesta(s)'),{note:noteSubject,meeting:meetingSubject},{timeout:30000});
    const fresh=await second.page.evaluate(()=>CX.backendBulletins.listClientCollaboration());check(fresh.source==='firestore_server'&&fresh.entries.length===3&&fresh.entries.every(x=>x.requesterUid===planned[0].uid),'PERSISTENCE_FAILURE:F09_NEW_SESSION_READ');
    result.readback.newIndependentClientSession={ok:true,count:3,ids:fresh.entries.map(x=>x.id).sort()};await second.page.screenshot({path:out+'/cliente-new-session.png',fullPage:true});
    const b=await session(planned[1]);await b.page.evaluate(()=>CX.router.nav('cli_insights'));
    const other=await b.page.evaluate(()=>CX.backendBulletins.listClientCollaboration());check(other.entries.length===0,'AUTH_FAILURE:F09_OTHER_CLIENT_LEAK');
    const denied=await b.page.evaluate(async path=>{try{await firebase.firestore().doc(path).get({source:'server'});return false;}catch(error){return String(error?.code||'').includes('permission-denied');}},note.record.entityPath);check(denied,'AUTH_FAILURE:F09_FOREIGN_DOCUMENT_READ_ALLOWED');
    result.readback.otherClient={zeroRows:true,directDocumentPermissionDenied:true};
    const admin=await session(planned[2]);const adminRows=await admin.page.evaluate(()=>CX.backendBulletins.listClientCollaboration());
    check([...records.values()].every(r=>adminRows.entries.some(x=>x.id===r.id&&x.requesterUid===planned[0].uid)),'AUTH_FAILURE:F09_ADMIN_READ_MISSING');
    await admin.page.evaluate(async()=>{await CX.backendBulletins.load();CX.router.nav('tablon');});
    await admin.page.waitForFunction(({note,meeting,detail})=>document.body.innerText.includes(note)&&document.body.innerText.includes(meeting)&&document.body.innerText.includes(detail),{note:noteSubject,meeting:meetingSubject,detail:noteDetail},{timeout:30000});
    const adminDenied=await admin.page.evaluate(()=>CX.data.createClientNote({subject:'No suplantar',detail:'Prueba negativa',clientRequestId:'qa-admin-denied-001'},{ackAware:true}));check(adminDenied.ok===false&&adminDenied.providerAck===false,'AUTH_FAILURE:F09_ADMIN_SELF_IMPERSONATION');
    result.readback.admin={sameThreeRecords:true,tablonContentVisible:true,clientWriteDenied:true};await admin.page.screenshot({path:out+'/admin-tablon.png',fullPage:true});
    check(records.size===3,'PERSISTENCE_FAILURE:F09_ENTITY_COUNT');result.functionalPass=true;
  }catch(error){result.error=String(error?.message||error);result.classification=result.error.match(/(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|PERSISTENCE_FAILURE|AUTH_FAILURE|FUNCTIONAL_DEFECT|VISUAL_DEFECT|RELEASE_COMPOSITION_FAILURE|ENVIRONMENT_FAILURE):/)?.[1]||(/MEMBERSHIP_|permission-denied/.test(result.error)?'AUTH_FAILURE':'FUNCTIONAL_DEFECT');}
  finally{
    await Promise.allSettled(contexts.map(c=>c.close()));if(browser)await browser.close().catch(()=>{});
    try{
      const ownedIdentities=result.identities,ids=ownedIdentities.map(x=>x.uid),known=new Set([...records.values()].flatMap(x=>[x.entityPath,x.receiptPath,x.auditPath]));
      let deleted=0;
      await db.runTransaction(async tx=>{
        for(const [collection,field] of [['bulletins','requesterUid'],['commandReceipts','actorUid'],['entityAuditTrail','actorUid']]){
          if(!ids.length)continue;const refs=await tx.get(tenant.collection(collection).where(field,'in',ids));check(refs.docs.every(d=>known.has(d.ref.path)),'PERSISTENCE_FAILURE:F09_UNEXPECTED_FIXTURE_REFERENCE');
        }
        const docs=[];for(const record of records.values()){
          const [en,re,au]=await Promise.all([record.entityPath,record.receiptPath,record.auditPath].map(p=>tx.get(db.doc(p))));
          if(!en.exists&&!re.exists&&!au.exists)continue;
          check(en.exists&&re.exists&&au.exists&&en.data().requesterUid===record.uid&&en.data().projectId===projectId&&en.data().periodId===periodId&&en.data().version===1&&re.data().actorUid===record.uid&&re.data().commandDigest===record.commandDigest&&re.data().entityId===record.id&&au.data().actorUid===record.uid&&au.data().idempotencyKey===record.command.idempotencyKey,'PERSISTENCE_FAILURE:F09_CLEANUP_OWNERSHIP');
          check(ownedEntity(en.data(),record),'PERSISTENCE_FAILURE:F09_CLEANUP_PAYLOAD_CHANGED');
          check((!record.entitySha256||hash(stable(en.data()))===record.entitySha256)&&(!record.receiptSha256||hash(stable(re.data()))===record.receiptSha256)&&(!record.auditSha256||hash(stable(au.data()))===record.auditSha256),'PERSISTENCE_FAILURE:F09_CLEANUP_CONCURRENT_CHANGE');
          docs.push(en.ref,re.ref,au.ref);
        }
        for(const identity of ownedIdentities){const member=await tx.get(db.doc(identity.memberPath));if(!member.exists)continue;const row=member.data();check(identity.memberCreateDispatched===true&&row.qaSynthetic===true&&row.qaRunId===runId&&row.qaRunAttempt===attempt&&row.qaPurpose==='F09'&&row.role===identity.role&&row.authNamespace==='staff'&&row.tenantId===tenantId&&row.name===identity.name&&JSON.stringify(row.projectIds)===JSON.stringify(identity.expectedClaims.projectIds)&&hash(stable(row))===identity.expectedMembershipSha256,'PERSISTENCE_FAILURE:F09_MEMBER_OWNERSHIP');docs.push(member.ref);}
        for(const ref of docs)tx.delete(ref);deleted=docs.length;
      });
      let authDeleted=0;for(const identity of ownedIdentities){
        try{const user=await auth.getUser(identity.uid),c=user.customClaims||{};
          const exactClaims=JSON.stringify(stable(c))===JSON.stringify(stable(identity.expectedClaims));
          const initialClaims=['AUTH_CREATED','CLAIMS_DISPATCHED'].includes(identity.state)&&Object.keys(c).length===0;
          check(identity.authIdentity&&JSON.stringify(stable(authIdentity(user)))===JSON.stringify(stable(identity.authIdentity))&&(exactClaims||initialClaims),'AUTH_FAILURE:F09_AUTH_CLEANUP_OWNERSHIP');
          await auth.deleteUser(identity.uid);authDeleted++;
        }catch(error){if(error.code!=='auth/user-not-found')throw error;}
      }
      const remaining=await Promise.all([...known,...ownedIdentities.map(x=>x.memberPath)].map(p=>db.doc(p).get()));check(remaining.every(x=>!x.exists),'PERSISTENCE_FAILURE:F09_DOC_RESIDUE');
      for(const x of ownedIdentities){try{await auth.getUser(x.uid);throw Error('AUTH_FAILURE:F09_AUTH_RESIDUE');}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
      result.cleanup={ok:true,deletedDocuments:deleted,deletedAuth:authDeleted,remainingDocuments:0,remainingAuth:0};
      if(projectBefore&&periodBefore){const pr=await project.get(),periodDocs=await Promise.all(periodIds.map(id=>project.collection('periods').doc(id).get()));check(hash(stable(pr.data()))===projectBefore&&hash(stable(periodDocs.map(x=>({id:x.id,exists:x.exists,data:x.exists?x.data():null}))))===periodBefore,'PERSISTENCE_FAILURE:F09_REAL_PROJECT_PERIOD_CHANGED');result.realProjectPeriodUnchanged=true;}
      const after=await hrMeta();result.hrAfter=after.revision;check(after.revision===expectedHr&&after.hrWrites===false,'PROVIDER_FAILURE:F09_HR_CHANGED');
      if(productionBefore){result.productionIndexUnchanged=hash(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).text())===productionBefore;check(result.productionIndexUnchanged,'ENVIRONMENT_FAILURE:F09_PRODUCTION_INDEX_DRIFT');}
      const {execFileSync}=await import('node:child_process');
      const runtime=JSON.parse(execFileSync('gcloud',['run','services','describe',e.SERVICE,'--project',projectName,'--region',e.REGION,'--format=json'],{encoding:'utf8'}));
      check(runtime.status.latestReadyRevisionName===result.runtimeRevision&&(runtime.status.traffic||[]).filter(x=>Number(x.percent||0)>0).every(x=>x.revisionName===result.runtimeRevision)&&(runtime.status.traffic||[]).reduce((a,x)=>a+Number(x.percent||0),0)===100,'ENVIRONMENT_FAILURE:F09_RUNTIME_TRAFFIC_DRIFT');
      result.runtimeTrafficExact=true;
    }catch(error){result.cleanup.error=String(error?.message||error);result.cleanup.ok=false;result.cleanup.unverifiedAuthIdentities=result.identities.map(x=>x.uid);}
    if(result.functionalPass&&result.cleanup.ok)result.decision='PASS_I3_F09_UI_PROVIDER_NEW_SESSION_PRIVACY_REPLAY_CLEANUP';save();
  }
  console.log(JSON.stringify({decision:result.decision,sourceSha,runId,periodId,records:records.size,cleanup:result.cleanup,error:result.error||null}));
  if(result.decision!=='PASS_I3_F09_UI_PROVIDER_NEW_SESSION_PRIVACY_REPLAY_CLEANUP')process.exitCode=2;
}

async function runHrDurableRevisionDiagnostic(){
  const e=process.env,s=v=>String(v??'').trim(),stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(stable(v))).digest('hex'),hrDigest=v=>hash(JSON.stringify(stable(v))),check=(ok,code)=>{if(!ok)throw Error(code);};
  const tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,''),out=s(e.QA_OUT),fingerprint='bfc8f1788b902124e6';
  check(e.PROJECT==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&tenantId&&projectId&&out&&/^\d+$/.test(s(e.GITHUB_RUN_ID)),'SOURCE_FAILURE:HR_DIAG_DEV_SCOPE');
  fs.mkdirSync(out,{recursive:true});if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:e.PROJECT});const db=getFirestore(),tenant=db.collection('tenants').doc(tenantId);
  const r={schemaVersion:'cxorbia.i3.hr-durable-diagnostic-readonly.v1',decision:'HOLD',observationComplete:false,runId:s(e.GITHUB_RUN_ID),candidateSourceSha:s(e.FOCAL_SOURCE),visitFingerprint:fingerprint,scope:'READ_ONLY_DIAGNOSIS_NOT_RECONCILIATION_OR_TERMINAL_CERTIFICATE',production:false,phaseAComplete:false,safety:{firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0,builds:0,deploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(r,null,2)+'\n');save();
  const endpoint=host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live',get=async format=>{const response=await fetch(endpoint+'?format='+format+'&hrdiag='+e.GITHUB_RUN_ID+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});check(response.ok,'PROVIDER_FAILURE:HR_DIAG_HTTP');return response.json();};
  const time=t=>t&&Number.isInteger(t.seconds)?{seconds:t.seconds,nanoseconds:t.nanoseconds}:null,stamp=t=>typeof t==='string'&&/^\d{4}-\d\d-\d\dT/.test(t)?t:time(t),state=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v)?v:null,counts=o=>Object.fromEntries(Object.entries(o||{}).filter(([,v])=>typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v)));
  let exactBinding=null,readServing=null,nameTargets=[];
  try{
    if(e.QA_RO==='true'){
      const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
      const d=read(e.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),p=read('CXORBIA_RECOVERY_EXECUTION_CURRENT.json'),seal=d.postDeployRunSeal||{};
      const {validateHrUidDiagnosticBinding}=await import('./cxorbia-i3-hr-ack-exact-same-revision.mjs'),{validateFixtureDevIdentity}=await import('./cxorbia-i3-live-fixture-contract.mjs');
      check(typeof seal.receiptPath==='string'&&/^docs\/checkpoints\/[A-Za-z0-9_./-]+\.json$/.test(seal.receiptPath)&&!seal.receiptPath.split('/').includes('..'),'SOURCE_FAILURE:HR_UID_READONLY_RECEIPT_PATH');
      const receipt=read(seal.receiptPath);
      exactBinding=validateHrUidDiagnosticBinding({descriptor:d,pointer:p,receipt,sourceSha:s(e.FOCAL_SOURCE),sourceTree:s(e.FOCAL_TREE),receiptBlob:git('hash-object',seal.receiptPath),treeExact:git('rev-parse',e.FOCAL_SOURCE+'^{tree}')===e.FOCAL_TREE,
        productDiffClean:!git('diff','--name-only',e.FOCAL_SOURCE,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules'),branchName:e.GITHUB_REF_NAME,writeGate:s(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE)});
      r.exactDevBinding=exactBinding;
      nameTargets=Array.isArray(d.hrUidReadOnlyRequest?.nameAuthorityTargets)?d.hrUidReadOnlyRequest.nameAuthorityTargets:[];
      check(nameTargets.length<=2&&nameTargets.every(x=>['sourceShopperId','canonicalShopperId'].every(k=>/^[A-Za-z0-9_-]{1,120}$/.test(s(x?.[k])))),'SOURCE_FAILURE:HR_NAME_DIAG_SCOPE');
      check(/^[a-z0-9-]+$/.test(e.REGION||'')&&e.SERVICE,'SOURCE_FAILURE:HR_UID_READONLY_RUNTIME_ENV');
      readServing=async()=>{
        const token=await getApps()[0].options.credential.getAccessToken(),base='https://'+e.REGION+'-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/'+encodeURIComponent(e.PROJECT);
        const readCloud=async url=>{const response=await fetch(url,{headers:{authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(30000)});check(response.ok,'PROVIDER_FAILURE:HR_UID_READONLY_CLOUD_HTTP_'+response.status);return response.json();};
        const service=await readCloud(base+'/services/'+encodeURIComponent(e.SERVICE)),revision=await readCloud(base+'/revisions/'+encodeURIComponent(exactBinding.runtimeRevision)),hosting=await readCloud('https://firebasehosting.googleapis.com/v1beta1/sites/'+encodeURIComponent(e.PROJECT)+'/channels/live');
        validateFixtureDevIdentity(exactBinding,{service,revision,hosting});
        return{verified:true,runtimeRevision:exactBinding.runtimeRevision,runtimeDigest:exactBinding.runtimeDigest,hostingVersion:exactBinding.hostingVersion,serviceSha256:hash(service),revisionSha256:hash(revision),hostingSha256:hash(hosting),observedAt:new Date().toISOString()};
      };
      r.exactDevBefore=await readServing();save();
    }
    const {b14PredecessorReadOnly}=await import('./cxorbia-i3-hr-ack-exact-same-revision.mjs');const {validateTerminalHrObservation}=await import('./cxorbia-i3-terminal-hr-observation.mjs'),before=await get('meta');validateTerminalHrObservation(before);const revision=before.revision;r.sourceRevision=revision;
    if(exactBinding)check(revision===exactBinding.hrRevision,'SOURCE_FAILURE:HR_UID_READONLY_HR_CHANGED');
    const response=await get('json'),hr=response.snapshot||response.data||response;check(hr.tenantId===tenantId&&hr.projectId===projectId&&hr.sourceSafe===true&&hr.imported===false&&response._runtime?.revision===revision&&response._runtime?.cacheOrigin==='runtime_refresh','SOURCE_FAILURE:HR_DIAG_HR_SCOPE');
    const sourceId=v=>s(v.visitId||v.id||v.hrRowId||(s(v.sourceTab)&&s(v.sourceRow)?s(v.sourceTab)+'::'+s(v.sourceRow):'')),matches=(hr.visits||[]).filter(v=>hash(sourceId(v)).slice(0,18)===fingerprint);check(matches.length===1,'SOURCE_FAILURE:HR_DIAG_VISIT_NOT_EXACT');
    const live=matches[0],durableId=s(live.hrRowId||(s(live.sourceTab)&&s(live.sourceRow)?s(live.sourceTab)+'::'+s(live.sourceRow):'')||live.visitId||live.id),periods=(hr.periods||[]).filter(p=>s(p.key||p.periodKey)===s(live.periodKey));check(durableId&&!durableId.includes('/')&&periods.length===1,'MAPPING_FAILURE:HR_DIAG_DURABLE_PERIOD');const expectedPeriodId=s(periods[0].id||periods[0].periodId);check(expectedPeriodId,'MAPPING_FAILURE:HR_DIAG_PERIOD_ID');
    const discovered=await tenant.collection('users').where('authNamespace','==','staff').select('active','authNamespace','role','projectIds').limit(33).get();check(discovered.size<33,'SOURCE_FAILURE:HR_DIAG_STAFF_BOUND_EXCEEDED');
    const eligible=m=>m.active===true&&m.authNamespace==='staff'&&(m.role==='super'||m.role==='admin'&&Array.isArray(m.projectIds)&&m.projectIds.includes(projectId));const uids=discovered.docs.filter(d=>eligible(d.data())).map(d=>d.id);check(uids.length>0&&uids.length<=8,'SOURCE_FAILURE:HR_DIAG_STAFF_SCOPE_UNRESOLVED');
    const visitRef=tenant.collection('projects').doc(projectId).collection('visits').doc(durableId),memberRefs=uids.map(uid=>tenant.collection('users').doc(uid)),lockRef=tenant.collection('commandReceipts').doc('hr-scope-'+hrDigest(tenantId));
    const observation=await db.runTransaction(async tx=>{
      const [visit]=await tx.getAll(visitRef,{fieldMask:['tenantId','projectId','periodId','periodKey','hrSourceRevision','estado','status','shopperId','assignmentSource','assignmentSyncStatus','version','createdAt','updatedAt']}),members=await tx.getAll(...memberRefs,{fieldMask:['active','authNamespace','role','projectIds']}),[lock]=await tx.getAll(lockRef,{fieldMask:['status','projectId','receiptPath','expiresAt']});const row=visit.data()||{},actors=[];
      for(let i=0;i<uids.length;i++){
        const uid=uids[i],member=members[i],m=member.data()||{},actor={uidHash:hash(uid),membershipExists:member.exists,membershipUpdateTime:time(member.updateTime),role:state(m.role),authNamespace:state(m.authNamespace),eligibleForAutomaticReconciliation:member.exists&&eligible(m)};
        if(actor.eligibleForAutomaticReconciliation){
          const key='hr-auto-v2-'+revision.slice(0,32)+'-'+uid,ref=tenant.collection('commandReceipts').doc('hr-'+hrDigest([projectId,key]));
          const [receipt]=await tx.getAll(ref,{fieldMask:['digest','actorUid','tenantId','projectId','sourceRevision','idempotencyKey','status','startedAt','completedAt','predecessorReconciliation','result.predecessorReconciliation','result.code','result.ok','result.status','result.committed','result.providerAck','result.sourceRevision','result.receiptPath','result.receiptBinding','result.confirmedProviderWrites','result.providerWrites','result.unresolvedEffects','result.unverifiedEffects','result.applicationWritesThisAttempt','result.stages']}),stages=await tx.getAll(ref.collection('stages').doc('visits'),ref.collection('stages').doc('shoppers'),{fieldMask:['status','sourceRevision','completedAt','summary']});
          const rr=receipt.data()||{},result=rr.result||{},binding=result.receiptBinding||{},digest=hrDigest({actorUid:uid,scope:{tenantId,projectId},sourceRevision:revision,commandType:'hr.snapshot.reconcile'});
          actor.receipt={pathHash:hash(ref.path),exists:receipt.exists,updateTime:time(receipt.updateTime),status:state(rr.status),startedAt:stamp(rr.startedAt),completedAt:stamp(rr.completedAt),sourceRevision:rr.sourceRevision||null,exactBinding:receipt.exists&&rr.digest===digest&&rr.actorUid===uid&&rr.tenantId===tenantId&&rr.projectId===projectId&&rr.sourceRevision===revision&&rr.idempotencyKey===key&&result.sourceRevision===revision&&result.receiptPath===ref.path&&binding.actorUid===uid&&binding.tenantId===tenantId&&binding.projectId===projectId&&binding.sourceRevision===revision&&binding.idempotencyKey===key&&binding.commandType==='hr.snapshot.reconcile',result:counts(result),errorCode:state(result.code),stageResults:Object.fromEntries(['visits','shoppers'].map(k=>[k,{...counts(result.stages?.[k]),code:state(result.stages?.[k]?.code),status:state(result.stages?.[k]?.status)}])),predecessorReconciliation:await b14PredecessorReadOnly(tx,{receipt:rr,receiptRef:ref,tenantId,projectId,revision,db}),applicationWritesThisAttempt:counts(result.applicationWritesThisAttempt),stages:stages.map((d,j)=>({name:['visits','shoppers'][j],exists:d.exists,updateTime:time(d.updateTime),status:state(d.data()?.status),sourceRevision:d.data()?.sourceRevision||null,completedAt:stamp(d.data()?.completedAt),counts:counts(d.data()?.summary),summaryStatus:state(d.data()?.summary?.status)}))};
        }
        actors.push(actor);
      }
      const l=lock.data()||{};return {tenantIdHash:hash(tenantId),projectIdHash:hash(projectId),independentHR:{periodId:expectedPeriodId,periodKey:s(live.periodKey),state:state(live.estado||live.status),shopperPresent:!!s(live.shopperId)},durable:{pathHash:hash(visitRef.path),exists:visit.exists,updateTime:time(visit.updateTime),tenantMatches:row.tenantId===tenantId,projectMatches:row.projectId===projectId,periodId:row.periodId||null,periodMatches:row.periodId===expectedPeriodId,hrSourceRevision:row.hrSourceRevision||null,revisionMatches:row.hrSourceRevision===revision,state:state(row.estado||row.status),shopperPresent:!!s(row.shopperId),assignmentSource:state(row.assignmentSource),assignmentSyncStatus:state(row.assignmentSyncStatus),version:Number.isFinite(row.version)?row.version:null},reconciliationLock:{exists:lock.exists,updateTime:time(lock.updateTime),status:state(l.status),projectMatches:l.projectId===projectId,receiptPathHash:l.receiptPath?hash(l.receiptPath):null,expiresAt:Number.isFinite(l.expiresAt)?l.expiresAt:null},actors};
    },{readOnly:true});
    Object.assign(r,observation);const {b14ReconciliationLeaseReadOnly,hrCrosswalkUidReadOnly}=await import('./cxorbia-i3-hr-ack-exact-same-revision.mjs');r.reconciliationLeaseDetail=await b14ReconciliationLeaseReadOnly(db,tenantId,projectId,revision);save();
    if(e.QA_RO==='true'||r.reconciliationLeaseDetail.receipt?.stageResults?.shoppers?.code==='SHOPPER_CROSSWALK_UID_CONFLICT'){
      r.shopperCrosswalkDiagnosis=await hrCrosswalkUidReadOnly({db,auth:getAuth(),snapshot:{...hr,_runtime:response._runtime},tenantId,projectId,revision,sourceDir:s(e.SOURCE_DIR)||process.cwd()});save();
    }

    if(nameTargets.length){
      const privateResponse=await get('json&view=operational-names&cxOperationalPreview=YES_PAULA_20260731_NAMES_DEV'),privateHr=privateResponse.snapshot||privateResponse.data||privateResponse;
      check(privateResponse._runtime?.revision===revision&&privateHr.operationalIdentityPreview===true&&privateHr.operationalIdentityScope==='display_name_only'&&privateHr.shoppers?.length===hr.shoppers?.length,'SOURCE_FAILURE:HR_NAME_DIAG_INDEPENDENT_AUTHORITY');
      const norm=v=>s(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase(),name=row=>s(row?.nombre||row?.name||row?.displayName||row?.fullName);
      r.nameAuthorityDiagnosis=[];
      for(const target of nameTargets){
        const sourceId=s(target.sourceShopperId),canonicalId=s(target.canonicalShopperId),ids=[...new Set([sourceId,canonicalId])];
        const sourceRows=privateHr.shoppers.filter(x=>s(x.shopperId||x.id)===sourceId),canonicalRows=privateHr.shoppers.filter(x=>s(x.shopperId||x.id)===canonicalId);
        check(sourceRows.length===1&&canonicalRows.length===1,'SOURCE_FAILURE:HR_NAME_DIAG_EXACT_ID_COUNT');
        const read=()=>db.runTransaction(async tx=>{
          const profiles=await tx.getAll(...ids.map(id=>tenant.collection('shoppers').doc(id))),crosses=await tx.getAll(...ids.map(id=>tenant.collection('shopperIdentityCrosswalk').doc(id)));
          const links=await tx.get(tenant.collection('shopperIdentityLinks').where('canonicalShopperId','==',canonicalId).limit(9));
          check(links.size<9,'SOURCE_FAILURE:HR_NAME_DIAG_LINK_BOUND');
          const project=(doc)=>({id:doc.id,path:doc.ref.path,exists:doc.exists,updateTime:time(doc.updateTime),data:doc.data()||{}});
          const refs=[...new Set([...profiles.map(x=>s(x.data()?.identityAuthorityRef)),...links.docs.map(x=>s(x.data()?.authorityRef||x.data()?.adjudicationId))].filter(Boolean))];
          check(refs.length<=8&&refs.every(x=>/^[A-Za-z0-9_-]{1,200}$/.test(x)),'SOURCE_FAILURE:HR_NAME_DIAG_RECEIPT_BOUND');
          const receipts=refs.length?await tx.getAll(...refs.map(id=>tenant.collection('commandReceipts').doc(id))):[];
          return{profiles:profiles.map(project),crosses:crosses.map(project),links:links.docs.map(project),receipts:receipts.map(project)};
        },{readOnly:true});
        const first=await read(),profile=first.profiles.find(x=>x.id===canonicalId),p=profile.data,full=name(p),firstLast=[s(p.firstName),s(p.lastName||p.apellido)].filter(Boolean).join(' ');
        const {collectTenantAdjudications}=await import('./cxorbia-i3-terminal-human-contract.mjs');
        const crossTargets=new Map(first.crosses.filter(x=>x.exists&&s(x.data.shopperId)).map(x=>[x.id,new Set([s(x.data.shopperId)])])),commandReceipts=new Map(first.receipts.map(x=>[x.id,x]));
        const authority=collectTenantAdjudications(first.links.map(x=>({...x.data,id:x.id,_documentPath:x.path})),{tenantId,projectId,crossTargets,commandReceipts});
        const second=await read();check(hash(first)===hash(second),'PERSISTENCE_FAILURE:HR_NAME_DIAG_CHANGED_DURING_READ');
        r.nameAuthorityDiagnosis.push({sourceShopperId:sourceId,canonicalShopperId:canonicalId,hrRevision:revision,authorityReadStable:true,profileExists:profile.exists,profileUpdateTime:profile.updateTime,
          sourceNamePresent:!!name(sourceRows[0]),canonicalHrNamePresent:!!name(canonicalRows[0]),profileNamePresent:!!full,
          profileNameEqualsSourceHr:norm(full)===norm(name(sourceRows[0])),profileNameEqualsCanonicalHr:norm(full)===norm(name(canonicalRows[0])),sourceAndCanonicalHrNamesEqual:norm(name(sourceRows[0]))===norm(name(canonicalRows[0])),
          profileNameEqualsFirstLast:norm(full)===norm(firstLast),firstLastEqualsCanonicalHr:norm(firstLast)===norm(name(canonicalRows[0])),firstLastEqualsSourceHr:norm(firstLast)===norm(name(sourceRows[0])),
          profileNameHash:hash(norm(full)),sourceHrNameHash:hash(norm(name(sourceRows[0]))),canonicalHrNameHash:hash(norm(name(canonicalRows[0]))),firstLastHash:hash(norm(firstLast)),
          profileIdentityAuthority:state(p.identityAuthority),profileAuthorityRefHash:p.identityAuthorityRef?hash(p.identityAuthorityRef):null,profileHrRevision:s(p.hrSourceRevision),profileSelfDisplayNameVerified:p.__selfDisplayNameVerified===true||p.selfDisplayNameVerified===true,displayNameAuthority:state(p.displayNameAuthority),
          sourceAliasApprovedToCanonical:authority.targets[sourceId]===canonicalId,canonicalSelfApproved:authority.targets[canonicalId]===canonicalId,
          links:authority.evidence.filter(x=>[sourceId,canonicalId].includes(x.sourceId)),rejected:authority.rejected,
          referencedReceipts:first.receipts.map(x=>({idHash:hash(x.id),exists:x.exists,updateTime:x.updateTime,status:state(x.data.status),commandType:x.data.commandType==='shopper.identity.adjudicate'?'shopper.identity.adjudicate':null,providerAck:x.data.providerAck===true,identityConsolidated:x.data.identityConsolidated===true,canonicalMatches:s(x.data.shopperId)===canonicalId,keeperUidFingerprint:/^[a-f0-9]{64}$/.test(s(x.data.keeperUidFingerprint))?x.data.keeperUidFingerprint:null,commandDigest:/^[a-f0-9]{64}$/.test(s(x.data.commandDigest))?x.data.commandDigest:null,externalHrSourceLinks:Number.isInteger(x.data.externalHrSourceLinks)?x.data.externalHrSourceLinks:null})),
          rawNamesPublished:false});
      }save();
    }
    const after=await get('meta');validateTerminalHrObservation(after);r.sourceRevisionAfter=after.revision;check(after.revision===revision,'PROVIDER_FAILURE:HR_DIAG_REVISION_DRIFT');
    if(readServing)r.exactDevAfter=await readServing();
    r.observationComplete=true;r.decision=observation.durable.revisionMatches?'OBSERVED_DURABLE_REVISION_MATCH_NOT_FULL_RECONCILIATION':'HOLD_OBSERVED_DURABLE_REVISION_DIVERGENCE';
  }catch(error){r.error=String(error?.message||error).replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').slice(0,1000);process.exitCode=2;}finally{save();}
  console.log(JSON.stringify(r));
}

async function runNotificationCycleQa(){
  const e=process.env,s=v=>String(v??'').trim(),hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const check=(yes,code)=>{if(!yes)throw Error(code);},runId=s(e.GITHUB_RUN_ID),attempt=s(e.GITHUB_RUN_ATTEMPT||'1'),sourceSha=s(e.FOCAL_SOURCE),sourceTree=s(e.FOCAL_TREE);
  const projectName=s(e.PROJECT),tenantId=s(e.TENANT_ID),projectId=s(e.PROJECT_ID),host=s(e.HOSTING_URL).replace(/\/$/,''),out=s(e.QA_OUT),expectedHr=s(e.EXPECTED_HR_REVISION),tag='qa_vrm143_'+runId+'_'+attempt;
  check(e.CXORBIA_I3_QA_ISOLATED_WRITE_GATE==='PAULA_AUTHORIZED_VRM143_DEV_ONLY'&&projectName==='cxorbia-backend-dev'&&host==='https://cxorbia-backend-dev.web.app'&&tenantId&&projectId&&out&&/^\d{8,}$/.test(runId)&&/^[a-f0-9]{40}$/.test(sourceSha)&&/^[a-f0-9]{40}$/.test(sourceTree)&&/^[a-f0-9]{64}$/.test(expectedHr),'SOURCE_FAILURE:VRM143_SCOPE_GATE_DENIED');
  fs.mkdirSync(out,{recursive:true});if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
  const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),project=tenant.collection('projects').doc(projectId);
  const result={schemaVersion:'cxorbia.i3.vrm143.live-provider-served-consumer.v1',decision:'HOLD',runId,runAttempt:attempt,sourceSha,sourceTree,tenantId,projectId,periodId:null,runtimeRevision:s(e.DEV_REVISION),runtimeDigest:s(e.RUNTIME_DIGEST),hostingVersion:s(e.HOSTING_VERSION_NAME),hrBefore:null,hrAfter:null,cases:[],identities:[],cleanup:{ok:false},scope:'LIVE_DEV_PROVIDER_AND_EXACT_SERVED_SHARED_CONSUMER_NOT_BROWSER_UI_OR_FULL_DOMAIN',phaseAComplete:false,fullDomain:false,production:false,safety:{hrWrites:0,realVisitWrites:0,realMemberWrites:0,paymentWrites:0,calendarCalls:0,emailCalls:0,productionDeploys:0}};
  const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');save();
  const request=async(url,options={})=>{const r=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});const b=await r.json().catch(()=>({}));return {http:r.status,...b};};
  const hr=()=>request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&vrm143='+runId+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'}});
  const owned=new Map(),identities=[],register=(ref,kind,expected={})=>{owned.set(ref.path,{ref,kind,expected});return ref;};
  const authShape=u=>({uid:u.uid,displayName:u.displayName||'',disabled:u.disabled,email:u.email||null,emailVerified:u.emailVerified,phoneNumber:u.phoneNumber||null,creationTime:u.metadata.creationTime,providerData:u.providerData||[]});
  let beforeProject='',beforeProduction='',periodId='',periodKey='',consumerScripts=null;
  try{
    const h=await hr();check(h.http===200&&h.sourceSafe===true&&h.revisionStable===true&&h.hrWrites===false&&h.production===false&&h.revision===expectedHr,'SOURCE_FAILURE:VRM143_HR_PRECONDITION');result.hrBefore=h.revision;
    const snapResponse=await request(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=json&vrm143='+runId,{headers:{'cache-control':'no-store'}}),snapshot=snapResponse.snapshot||snapResponse.data||snapResponse;
    periodKey=s(snapshot.source?.currentCalendarPeriodKey);const periods=(snapshot.periods||[]).filter(x=>s(x.key||x.periodKey)===periodKey);
    check(snapResponse.http===200&&snapshot.sourceSafe===true&&snapshot.imported===false&&snapshot.tenantId===tenantId&&snapshot.projectId===projectId&&snapResponse._runtime?.revision===expectedHr&&periods.length===1&&periods[0].projectId===projectId,'SOURCE_FAILURE:VRM143_CURRENT_PERIOD');periodId=s(periods[0].id);result.periodId=periodId;
    const projectSnap=await project.get();check(projectSnap.exists&&projectSnap.data().tenantId===tenantId,'SOURCE_FAILURE:VRM143_PROJECT');beforeProject=hash(stable(projectSnap.data()));
    const route=projectSnap.data().operationalSource||projectSnap.data().routeSource||{};check(s(typeof route==='string'?route:route.mode||route.sourceType||route.authority)!=='internal','SOURCE_FAILURE:VRM143_EXTERNAL_HR_CASE_REQUIRED');
    beforeProduction=hash(Buffer.from(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).arrayBuffer()));
    const legacy=(await project.collection('visits').select('periodId','cancelRequest','rescheduleRequest','qaSynthetic').get()).docs;
    result.legacyPendingCycleAudit={realVisitsRead:legacy.filter(x=>x.data().qaSynthetic!==true).length,unlinkedPending:legacy.flatMap(x=>{const v=x.data();return v.qaSynthetic===true?[]:['cancelRequest','rescheduleRequest'].filter(k=>['pending_review','approved_pending_hr'].includes(v[k]?.status)&&!v[k]?.requestCycleId).map(k=>({visitHash:hash(x.id),requestKind:k,periodId:v.periodId||null,status:v[k].status}));}),writes:0,scope:'EXACT_CURRENT_PROJECT_DURABLE_REQUEST_METADATA_ONLY'};
    const cp=await import('node:child_process'),vm=await import('node:vm');consumerScripts={};result.servedConsumerSha256={};
    for(const file of ['core/notif.js','core/backend-bulletins.js']){const response=await fetch(host+'/'+file+'?vrm143='+runId,{cache:'no-store'}),bytes=Buffer.from(await response.arrayBuffer()),exact=cp.execFileSync('git',['show',sourceSha+':app/'+file],{maxBuffer:3*1024*1024});check(response.ok&&bytes.equals(exact),'SOURCE_FAILURE:VRM143_SERVED_CONSUMER:'+file);consumerScripts[file]=bytes.toString('utf8');result.servedConsumerSha256[file]=hash(bytes);}
    const feed=(bulletins,visit,role)=>{
      const next=new Date(periodKey+'-01T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);const later=next.toISOString().slice(0,7),CX={BACKEND:{enabled:false,previewMode:false,tenantId},dataSource:{showFixtures:()=>false},session:{role,user:{shopperId:tag+'_shopper'}},backendAuth:{context:()=>({tenantId,role,shopperId:tag+'_shopper'})},data:{currentProjectId:projectId,currentPeriodId:later,period:()=>({periodo:later}),_visitas:[visit]}};
      const c=vm.createContext({CX,Date,Set,console,document:{readyState:'complete'}});c.window=c;c.addEventListener=()=>{};vm.runInContext(consumerScripts['core/notif.js'],c);vm.runInContext(consumerScripts['core/backend-bulletins.js'].replace('  CX.backendBulletins = {','  CX.__normalizeNotice=normalize;\n  CX.backendBulletins = {'),c);CX.notif._items=bulletins.map(b=>CX.__normalizeNotice({id:b.id,data:()=>b},new Set()));return CX.notif;
    };
    const init=await request(host+'/__/firebase/init.json');check(init.http===200&&init.apiKey,'ENVIRONMENT_FAILURE:VRM143_FIREBASE_INIT');
    const tokenFor=async identity=>{const token=await auth.createCustomToken(identity.uid,identity.claims),r=await request('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(init.apiKey),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,returnSecureToken:true})});check(r.http===200&&r.idToken,'AUTH_FAILURE:VRM143_QA_SESSION');return r.idToken;};
    for(const role of ['shopper','admin']){
      const uid=tag+'_'+role,member=tenant.collection('users').doc(uid),claims={tenantId,projectIds:[projectId],role,authNamespace:role==='shopper'?'shopper':'staff',...(role==='shopper'?{shopperId:uid}:{}),qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'VRM143'};
      check(!(await member.get()).exists,'SOURCE_FAILURE:VRM143_MEMBER_COLLISION');try{await auth.getUser(uid);throw Error('SOURCE_FAILURE:VRM143_AUTH_COLLISION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}
      const identity={uid,role,claims,state:'PLANNED',memberPath:member.path};identities.push(identity);result.identities=identities;save();
      identity.state='AUTH_CREATE_DISPATCHED';save();const created=await auth.createUser({uid,displayName:'QA VRM143 '+runId+' '+role,disabled:false});identity.authIdentity=authShape(created);identity.state='AUTH_CREATED';save();await auth.setCustomUserClaims(uid,claims);
      const membership={uid,...claims,active:true,status:'active',name:created.displayName};register(member,'member',{sha256:hash(stable(membership))});await member.create(membership);identity.memberCreated=true;
      check(hash(stable((await member.get()).data()))===hash(stable(membership))&&hash(stable((await auth.getUser(uid)).customClaims||{}))===hash(stable(claims)),'AUTH_FAILURE:VRM143_IDENTITY_READBACK');identity.state='VERIFIED';save();
    }
    const shopper=identities.find(x=>x.role==='shopper'),admin=identities.find(x=>x.role==='admin'),tokens={shopper:await tokenFor(shopper),admin:await tokenFor(admin)};
    const invoke=(role,command)=>request(host+'/v1/cxorbia/commands',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+tokens[role]},body:JSON.stringify(command)});
    if(e.ACTIVE_STATUS==='HOLD_I3_VRM350_DEV_MATERIALIZATION_REQUIRED'){
      // The HTTP negative uses an owned synthetic visit absent from the real HR.
      // An erroneous commit can only affect documents already in the cleanup journal.
      const visitId=tag+'_sync_confirm',ref=project.collection('visits').doc(visitId);check(!(await ref.get()).exists&&!(snapshot.visits||[]).some(v=>v.hrRowId===visitId||v.id===visitId),'SOURCE_FAILURE:VRM350_FIXTURE_COLLISION');register(ref,'visit',{visitId});
      const original={id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey,shopperId:shopper.uid,estado:'asignada',status:'asignada',version:1,assignmentSource:'platform',assignmentSyncStatus:'pending_hr',qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'VRM143'};await ref.create(original);
      const command={version:'cxorbia-command-adapter-v1',commandType:'visit.sync.confirm',entityType:'visit',entityId:visitId,tenantId,projectId,periodId,expectedVersion:1,idempotencyKey:tag+'_vrm350_no_independent_row',payload:{visitId,hrRowId:visitId,hrShopperId:shopper.uid},authorization:{providerEnforcementRequired:true,permission:'visit.sync.confirm'},audit:{reason:'isolated-dev-vrm350',correlationId:tag}};
      const receipt=tenant.collection('commandReceipts').doc(hash([tenantId,projectId,periodId,command.idempotencyKey].join('\0')).slice(0,40)),audit=tenant.collection('entityAuditTrail').doc(hash([command.idempotencyKey,command.commandType,visitId].join('\0')).slice(0,40));
      for(const [kind,doc]of[['receipt',receipt],['audit',audit]]){check(!(await doc.get()).exists,'SOURCE_FAILURE:VRM350_RECEIPT_COLLISION');register(doc,kind,{visitId,key:command.idempotencyKey,type:command.commandType});}
      const before=await ref.get(),responses=[];
      for(let session=0;session<2;session++){
        if(session)tokens.admin=await tokenFor(admin);const response=await invoke('admin',command),after=await ref.get();
        check(response.ok===false&&response.status==='blocked'&&response.code==='OPS_SYNC_CONFIRM_HR_ROW_NOT_UNIQUE'&&response.providerAck===false&&response.hrProviderAck===false&&response.hrReflectionVerified===false&&response.providerWrites===0,'FUNCTIONAL_DEFECT:VRM350_FALSE_SYNC_HTTP:'+s(response.code));
        check(hash(stable(after.data()))===hash(stable(before.data()))&&after.updateTime.isEqual(before.updateTime)&&!(await receipt.get()).exists&&!(await audit.get()).exists,'PERSISTENCE_FAILURE:VRM350_NEGATIVE_WROTE');responses.push({freshSession:session===1,http:response.http,code:response.code,providerAck:false,hrProviderAck:false,providerWrites:0,durableUnchanged:true,receiptAbsent:true,auditAbsent:true});
      }
      // Positive and replay use this same independently fetched HR, but only an
      // in-memory durable fixture. No commercial visit or remote HR is written.
      const live=(snapshot.visits||[]).find(v=>s(v.shopperId)&&s(v.id)&&s(v.hrRowId)&&(snapshot.periods||[]).filter(p=>s(p.key||p.periodKey)===s(v.periodKey)&&p.projectId===projectId).length===1);check(live,'SOURCE_FAILURE:VRM350_ASSIGNED_HR_REFERENCE_REQUIRED');
      const pe=snapshot.periods.find(p=>s(p.key||p.periodKey)===s(live.periodKey)&&p.projectId===projectId),memory=new Map(),clone=v=>v===undefined?undefined:structuredClone(v),snap=(path,store)=>({id:path.split('/').at(-1),exists:store.has(path),data:()=>clone(store.get(path))});
      const memoryRef=path=>({path,id:path.split('/').at(-1),collection:n=>memoryRef(path+'/'+n),doc:id=>memoryRef(path+'/'+id),get:async()=>snap(path,memory)});
      const memoryDb={collection:memoryRef,runTransaction:async fn=>{const working=new Map([...memory].map(([k,v])=>[k,clone(v)]));let written=false;const out=await fn({get:async ref=>{check(!written,'SOURCE_FAILURE:VRM350_READ_AFTER_WRITE');return snap(ref.path,working);},set:(ref,v,o={})=>{written=true;working.set(ref.path,(o.merge||o.mergeFields)?{...(working.get(ref.path)||{}),...clone(v)}:clone(v));}});memory.clear();for(const [k,v]of working)memory.set(k,v);return out;}};
      memory.set(admin.memberPath,clone((await tenant.collection('users').doc(admin.uid).get()).data()));const memoryPath=project.path+'/visits/'+live.hrRowId;
      memory.set(memoryPath,{id:live.hrRowId,visitId:live.hrRowId,hrRowId:live.hrRowId,tenantId,projectId,periodId:pe.id,periodKey:live.periodKey,shopperId:live.shopperId,assignmentSyncStatus:'pending_hr',version:4,hrSourceRevision:'b'.repeat(64),unrelatedMarker:'preserved'});
      const {pathToFileURL}=await import('node:url'),{createOperationalCommandProvider}=await import(pathToFileURL(e.SOURCE_DIR+'/backend/runtime/cxorbia-operational-command-provider-v1.mjs').href);
      const provider=createOperationalCommandProvider({auth,db:memoryDb,policy:{schemaVersion:'cxorbia.operational.provider-policy.v1',enabled:true,allowedTenantIds:[tenantId],allowedProjectIds:[projectId],conflictPolicy:'review_no_silent_overwrite',hrWrites:false,makeCalls:false,geminiCalls:false,storageWrites:false,paymentWrites:false},hrSnapshot:snapshot,hrRevision:expectedHr});
      const positive={...command,periodId:pe.id,entityId:live.id,expectedVersion:4,idempotencyKey:tag+'_vrm350_memory',payload:{visitId:live.id,hrRowId:live.hrRowId,hrShopperId:live.shopperId}},first=await provider.execute(tokens.admin,positive);check(first.ok===true&&first.providerWrites===3&&first.hrReflectionVerified===true&&first.hrProviderAck===false,'FUNCTIONAL_DEFECT:VRM350_REAL_HR_FACTORY_POSITIVE:'+s(first.code));
      const seal=hash(stable([...memory]));const replay=await provider.execute(tokens.admin,positive);check(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0&&hash(stable([...memory]))===seal&&memory.get(memoryPath).hrSourceRevision==='b'.repeat(64)&&memory.get(memoryPath).unrelatedMarker==='preserved','FUNCTIONAL_DEFECT:VRM350_REAL_HR_FACTORY_REPLAY');
      result.syncConfirmation={decision:'PASS_VRM350_SERVED_HTTP_REJECTS_UNOBSERVED_HR_AND_REAL_HR_FACTORY_POSITIVE_REPLAY',sourceRevision:expectedHr,httpNegative:{scope:'LIVE_HTTP_OWNED_SYNTHETIC_VISIT_ABSENT_FROM_REAL_HR',cases:responses},positive:{scope:'EXACT_PRODUCT_FACTORY_WITH_REAL_INDEPENDENT_HR_AND_MEMORY_ONLY_DURABLE_STATE_NOT_HTTP_OR_FIRESTORE_PERSISTENCE',initialMemoryWrites:3,replayMemoryWrites:0,hrProviderAck:false,proofSourceRevision:first.hrReflection.sourceRevision,visitFingerprint:hash(live.id),periodId:pe.id},commercialVisitWrites:0,hrWrites:0,fullDomain:false,b14Closed:false};save();
    }
    let future=new Date(Date.now()+2*86400000).toISOString().slice(0,10);if(future.slice(0,7)!==periodKey)future=new Date(Date.now()).toISOString().slice(0,10);check(future.slice(0,7)===periodKey,'SOURCE_FAILURE:VRM143_PERIOD_CLOCK');
    for(const [type,field]of [['visit.cancel','cancelRequest'],['visit.reschedule','rescheduleRequest']]){
      const visitId=tag+'_'+field,ref=project.collection('visits').doc(visitId);check(!(await ref.get()).exists,'SOURCE_FAILURE:VRM143_VISIT_COLLISION');register(ref,'visit',{visitId});
      const original={id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey,shopperId:shopper.uid,estado:'agendada',status:'agendada',agendada:future,version:1,assignmentSource:'platform',canonicalFacets:{available:false,assigned:true,scheduled:true,cancelled:false},qaSynthetic:true,qaRunId:runId,qaRunAttempt:attempt,qaPurpose:'VRM143'};await ref.create(original);
      const command=(version,label,payload)=>({version:'cxorbia-command-adapter-v1',commandType:type,entityType:'visit',entityId:visitId,tenantId,projectId,periodId,expectedVersion:version,idempotencyKey:tag+'_'+field+'_'+label,payload:{visitId,hrRowId:visitId,shopperId:shopper.uid,...payload},authorization:{providerEnforcementRequired:true,permission:type},audit:{reason:'isolated-dev-vrm143',correlationId:tag}});
      const request1=command(1,'request1',{reason:'QA request one',newDate:future,...(type==='visit.cancel'?{requestOnly:true}:{requestedByShopper:true})}),decision1=command(2,'decision1',{decision:'rejected',reason:'QA decision one'}),request2=command(3,'request2',{reason:'QA request two',newDate:future,...(type==='visit.cancel'?{requestOnly:true}:{requestedByShopper:true})}),decision2=command(4,'decision2',{decision:'approved',reason:'QA decision two',...(type==='visit.reschedule'?{newDate:future}:{})});
      const docRefs=new Map();
      const blockedRequest=type==='visit.cancel'?command(5,'blocked',{requestOnly:true,reason:'QA blocked pendingHR'}):null;
      for(const c of [request1,decision1,request2,decision2,...(blockedRequest?[blockedRequest]:[])]){const id=hash([tenantId,projectId,periodId,c.idempotencyKey].join('\0')).slice(0,40),refs={receipt:tenant.collection('commandReceipts').doc(id),audit:tenant.collection('entityAuditTrail').doc(hash([c.idempotencyKey,c.commandType,c.entityId].join('\0')).slice(0,40)),bulletin:tenant.collection('bulletins').doc('visit-request-'+id)};docRefs.set(c.idempotencyKey,refs);for(const [kind,doc]of Object.entries(refs)){check(!(await doc.get()).exists,'SOURCE_FAILURE:VRM143_COMMAND_COLLISION');register(doc,kind,{visitId,key:c.idempotencyKey,type:c.commandType});}}
      const acked=async(role,c)=>{const r=await invoke(role,c);check(r.http===200&&r.ok===true&&r.providerAck===true&&r.status==='committed'&&r.successUiAllowed===true&&r.providerWrites===4,'PERSISTENCE_FAILURE:VRM143_COMMAND_ACK:'+s(r.code));const refs=docRefs.get(c.idempotencyKey),docs=await Promise.all(Object.values(refs).map(x=>x.get()));check(docs.every(x=>x.exists),'PERSISTENCE_FAILURE:VRM143_ATOMIC_RECORDS');
        const [receipt,audit,notice]=docs.map(x=>x.data()),actor=role==='shopper'?shopper.uid:admin.uid;
        check(receipt.status==='committed'&&receipt.providerAck===true&&receipt.commandDigest===hash(stable(c))&&receipt.commandType===c.commandType&&receipt.entityId===visitId&&receipt.actorUid===actor,'PERSISTENCE_FAILURE:VRM143_RECEIPT_CONTENT');
        check(audit.tenantId===tenantId&&audit.projectId===projectId&&audit.periodId===periodId&&audit.idempotencyKey===c.idempotencyKey&&audit.commandType===type&&audit.entityId===visitId&&audit.entityType==='visit'&&audit.actorUid===actor,'PERSISTENCE_FAILURE:VRM143_AUDIT_CONTENT');
        const current=(await ref.get()).data();check(notice.id===refs.bulletin.id&&notice.tenantId===tenantId&&notice.projectId===projectId&&notice.periodId===periodId&&notice.entityType==='visit'&&notice.entityId===visitId&&notice.idempotencyKey===c.idempotencyKey&&notice.requestCycleId===current[field]?.requestCycleId&&notice.toRole===(role==='shopper'?'admin':'shopper')&&JSON.stringify(notice.targetRoles)===JSON.stringify([role==='shopper'?'admin':'shopper'])&&JSON.stringify(notice.targetProjectIds)===JSON.stringify([projectId])&&JSON.stringify(notice.targetShopperIds)===JSON.stringify(role==='shopper'?[]:[shopper.uid]),'PERSISTENCE_FAILURE:VRM143_BULLETIN_CONTENT');return r;};
      await acked('shopper',request1);const row1=(await ref.get()).data(),cycle1=row1[field]?.requestCycleId;check(cycle1===docRefs.get(request1.idempotencyKey).receipt.id,'PERSISTENCE_FAILURE:VRM143_CYCLE_MISSING');
      await acked('admin',decision1);const rejected=(await ref.get()).data(),n1=(await docRefs.get(request1.idempotencyKey).bulletin.get()).data(),nd=(await docRefs.get(decision1.idempotencyKey).bulletin.get()).data();check(rejected[field].status==='rejected'&&rejected[field].requestCycleId===cycle1&&n1.requestCycleId===cycle1&&nd.requestCycleId===cycle1&&nd.idempotencyKey===decision1.idempotencyKey,'PERSISTENCE_FAILURE:VRM143_DECISION_CYCLE');
      await acked('shopper',request2);const row2=(await ref.get()).data(),cycle2=row2[field]?.requestCycleId,n2=(await docRefs.get(request2.idempotencyKey).bulletin.get()).data();check(cycle2===docRefs.get(request2.idempotencyKey).receipt.id&&cycle2!==cycle1&&n2.requestCycleId===cycle2&&row2[field].status==='pending_review'&&['decidedAt','decidedBy','decisionReason'].every(k=>row2[field][k]===null),'PERSISTENCE_FAILURE:VRM143_SECOND_CYCLE');
      const omit=v=>{const x=structuredClone(v);for(const k of [field,'version','updatedAt'])delete x[k];return x;};check(hash(stable(omit(row2)))===hash(stable(omit(original))),'PERSISTENCE_FAILURE:VRM143_UNRELATED_VISIT_DRIFT');
      tokens.shopper=await tokenFor(shopper);tokens.admin=await tokenFor(admin);
      for(const [role,c]of [['shopper',request1],['admin',decision1]]){const replay=await invoke(role,c);check(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0&&hash(stable((await ref.get()).data()))===hash(stable(row2)),'PERSISTENCE_FAILURE:VRM143_OLD_REPLAY_CHANGED_CYCLE');}
      const adminFeed=feed([n1,nd,n2],row2,'admin'),shopperFeed=feed([n1,nd,n2],row2,'shopper');check(adminFeed.for('admin').length===1&&adminFeed.for('admin')[0].id===n2.id&&adminFeed.history('admin').length===2&&shopperFeed.for('shopper').length===0&&shopperFeed.history('shopper').length===1,'FUNCTIONAL_DEFECT:VRM143_HISTORIC_CYCLE_CONSUMER');
      await acked('admin',decision2);const row3=(await ref.get()).data(),last=(await docRefs.get(decision2.idempotencyKey).bulletin.get()).data();check(row3[field].requestCycleId===cycle2&&last.requestCycleId===cycle2,'PERSISTENCE_FAILURE:VRM143_APPROVAL_CYCLE');
      if(type==='visit.cancel'){check(row3.cancelRequest.status==='approved_pending_hr'&&hash(stable(omit(row3)))===hash(stable(omit(original)))&&feed([last],row3,'shopper').for('shopper').length===1,'FUNCTIONAL_DEFECT:VRM143_PENDING_HR');const blocked=await invoke('shopper',blockedRequest);const blockedDocs=await Promise.all(Object.values(docRefs.get(blockedRequest.idempotencyKey)).map(x=>x.get()));check(blocked.ok===false&&blocked.code==='OPS_VISIT_REQUEST_ALREADY_PENDING'&&blockedDocs.every(x=>!x.exists)&&hash(stable((await ref.get()).data()))===hash(stable(row3)),'PERSISTENCE_FAILURE:VRM143_PENDING_HR_SECOND_REQUEST');}
      else {check(row3.rescheduleRequest.status==='approved'&&row3.agendada===future&&feed([last],row3,'shopper').for('shopper').length===0,'FUNCTIONAL_DEFECT:VRM143_COMPLETED_RESCHEDULE');const finalUnrelated=v=>{const x=omit(v);for(const k of ['agendada','estado','status','pendienteAgendamiento','franjaCode'])delete x[k];return x;};check(hash(stable(finalUnrelated(row3)))===hash(stable(finalUnrelated(original))),'PERSISTENCE_FAILURE:VRM143_RESCHEDULE_UNRELATED_DRIFT');}
      result.cases.push({type,cycle1,cycle2,providerAck:true,independentDurableReadback:true,newSessionOldReplayZeroWrites:true,requestAndDecisionCycleExact:true,secondCycleClearsPriorDecision:true,oldNoticeNotReactivated:true,authorizedHistoryPreserved:true,unrelatedVisitFieldsPreserved:true,finalStatus:row3[field].status,commands:4,providerWrites:16});save();
    }
    result.functionalPass=true;
  }catch(error){result.error=String(error?.message||error).replace(/Bearer\s+\S+|eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]').slice(0,1200);result.classification=result.error.split(':')[0];}
  finally{
    try{
      const entries=[...owned.values()];let deleted=0;
      await db.runTransaction(async tx=>{const docs=await Promise.all(entries.map(x=>tx.get(x.ref)));for(let i=0;i<entries.length;i++){const x=entries[i],doc=docs[i];if(!doc.exists)continue;const v=doc.data();let ok=false;
        if(x.kind==='member')ok=hash(stable(v))===x.expected.sha256&&v.qaPurpose==='VRM143'&&v.qaRunId===runId;
        if(x.kind==='visit')ok=v.id===x.expected.visitId&&v.qaSynthetic===true&&v.qaRunId===runId&&v.qaRunAttempt===attempt&&v.qaPurpose==='VRM143'&&v.tenantId===tenantId&&v.projectId===projectId;
        if(x.kind==='receipt')ok=v.entityId===x.expected.visitId&&v.commandType===x.expected.type&&identities.some(i=>i.uid===v.actorUid)&&v.status==='committed';
        if(x.kind==='audit')ok=v.entityId===x.expected.visitId&&v.idempotencyKey===x.expected.key&&v.tenantId===tenantId&&v.projectId===projectId&&identities.some(i=>i.uid===v.actorUid);
        if(x.kind==='bulletin')ok=v.entityId===x.expected.visitId&&v.idempotencyKey===x.expected.key&&v.tenantId===tenantId&&v.projectId===projectId&&v.source==='cxorbia-operational-command-provider-v1';
        check(ok,'PERSISTENCE_FAILURE:VRM143_CLEANUP_OWNERSHIP:'+x.kind);
      }for(let i=0;i<entries.length;i++)if(docs[i].exists){tx.delete(entries[i].ref);deleted++;}});
      const left=await Promise.all(entries.map(x=>x.ref.get()));check(left.every(x=>!x.exists),'PERSISTENCE_FAILURE:VRM143_DOCUMENT_RESIDUE');
      let authDeleted=0;for(const identity of identities){if(!identity.authIdentity){try{await auth.getUser(identity.uid);throw Error('AUTH_FAILURE:VRM143_UNVERIFIED_AUTH_CREATION');}catch(error){if(error.code!=='auth/user-not-found')throw error;}continue;}const u=await auth.getUser(identity.uid);check(hash(stable(authShape(u)))===hash(stable(identity.authIdentity))&&[hash(stable(identity.claims)),hash({})].includes(hash(stable(u.customClaims||{}))),'AUTH_FAILURE:VRM143_AUTH_CLEANUP_OWNERSHIP');await auth.deleteUser(identity.uid);authDeleted++;try{await auth.getUser(identity.uid);throw Error('AUTH_FAILURE:VRM143_AUTH_RESIDUE');}catch(error){if(error.code!=='auth/user-not-found')throw error;}}
      result.cleanup={ok:true,documentsDeleted:deleted,authDeleted,remainingDocuments:0,remainingAuth:0};
      const after=await hr();result.hrAfter=after.revision;check(after.http===200&&after.sourceSafe===true&&after.revisionStable===true&&after.hrWrites===false&&after.production===false&&result.hrAfter===expectedHr,'PROVIDER_FAILURE:VRM143_HR_CHANGED');
      result.realProjectUnchanged=beforeProject===hash(stable((await project.get()).data()));result.productionIndexUnchanged=beforeProduction===hash(Buffer.from(await (await fetch('https://tya-plataforma.web.app/',{cache:'no-store'})).arrayBuffer()));check(result.realProjectUnchanged&&result.productionIndexUnchanged,'PERSISTENCE_FAILURE:VRM143_REAL_SCOPE_CHANGED');
      const cp=await import('node:child_process'),runtime=JSON.parse(cp.execFileSync('gcloud',['run','services','describe',s(e.SERVICE),'--project',projectName,'--region',s(e.REGION),'--format=json'],{encoding:'utf8'}));result.runtimeTrafficExact=runtime.status?.latestReadyRevisionName===result.runtimeRevision&&(runtime.status?.traffic||[]).filter(t=>t.revisionName===result.runtimeRevision&&t.percent===100).length===1;check(result.runtimeTrafficExact,'ENVIRONMENT_FAILURE:VRM143_RUNTIME_CHANGED');
      const token=cp.execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim(),hosting=await request('https://firebasehosting.googleapis.com/v1beta1/sites/'+s(e.HOSTING_SITE)+'/channels/live',{headers:{authorization:'Bearer '+token}});result.hostingVersionExact=hosting.http===200&&hosting.release?.version?.name===result.hostingVersion;check(result.hostingVersionExact,'ENVIRONMENT_FAILURE:VRM143_HOSTING_CHANGED');
    }catch(error){result.cleanup.ok=false;result.cleanup.error=String(error?.message||error).slice(0,1000);}
    if(result.functionalPass&&result.cleanup.ok)result.decision='PASS_VRM143_LIVE_PROVIDER_EXACT_CYCLE_AND_SERVED_CONSUMER';save();
  }
  console.log(JSON.stringify({decision:result.decision,sourceSha,cases:result.cases.length,cleanup:result.cleanup,error:result.error||null}));if(result.decision!=='PASS_VRM143_LIVE_PROVIDER_EXACT_CYCLE_AND_SERVED_CONSUMER')process.exitCode=2;
}

async function runExcelCanonicalReadOnly(){
  const e=process.env,host=String(e.HOSTING_URL||'').replace(/\/$/,''),tenantId=String(e.TENANT_ID||''),projectId=String(e.PROJECT_ID||''),out=String(e.QA_OUT||'');
  if(e.PROJECT!=='cxorbia-backend-dev'||host!=='https://cxorbia-backend-dev.web.app'||!tenantId||!projectId||!out||!/^[a-f0-9]{40}$/.test(e.FOCAL_SOURCE||''))throw new Error('SOURCE_FAILURE:EXCEL_CANONICAL_DEV_SCOPE');
  fs.mkdirSync(out,{recursive:true});
  const result={schemaVersion:'cxorbia.i3.excel-canonical-readonly.v1',decision:'HOLD',sourceSha:e.FOCAL_SOURCE,sourceTree:e.FOCAL_TREE,runId:e.GITHUB_RUN_ID,runtimeRevision:e.DEV_REVISION,runtimeDigest:e.RUNTIME_DIGEST,hostingVersion:e.HOSTING_VERSION_NAME,production:false,fullDomain:false,firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0};
  const started=Date.now(),get=async format=>{const r=await fetch(host+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format='+format+'&canonical='+e.GITHUB_RUN_ID+'-'+Date.now(),{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});if(!r.ok)throw new Error('PROVIDER_FAILURE:EXCEL_CANONICAL_HTTP_'+r.status);return r.json();};
  try{
    const {validateExcelCanonicalHrObservation}=await import('./cxorbia-i3-terminal-hr-observation.mjs');
    const before=await get('meta'),response=await get('json'),after=await get('meta');
    Object.assign(result,validateExcelCanonicalHrObservation({before,response,after,tenantId,projectId}));
  }catch(error){result.error=String(error?.message||error);process.exitCode=2;}
  result.durationMs=Date.now()-started;fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}

const qaControlOnlyScopes=new Set(['D08_PREFLIGHT','D08_VERIFY','D08_ACADEMY_UI_SELF_TEST','D08_RECOVERY_SELF_TEST']);
if(!qaControlOnlyScopes.has(process.env.CXORBIA_I3_QA_SCOPE))await loadQaFirebaseDependencies();
if(process.env.CXORBIA_I3_QA_SCOPE==='D08_PREFLIGHT'){
  runD08Preflight();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='D08_VERIFY'){
  runD08ResultVerify();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='D08_ACADEMY_UI_SELF_TEST'){
  await runAcademyUiQaSelfTest();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='D08_RECOVERY_SELF_TEST'){
  await runD08RecoverCleanup({selfTestOnly:true});
}else if(process.env.CXORBIA_I3_QA_SCOPE==='D08_RECOVER_CLEANUP'){
  await runD08RecoverCleanup();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='D08_ACADEMY_UI'){
  await runAcademyUiQa();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='EXCEL_CANONICAL_ID_READONLY'){
  await runExcelCanonicalReadOnly();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='HR_DURABLE_REVISION_READONLY'){
  await runHrDurableRevisionDiagnostic();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='VRM143_NOTIFICATION_CYCLE'){
  await runNotificationCycleQa();
}else if(process.env.CXORBIA_I3_QA_SCOPE==='F09_CLIENT_COLLABORATION'){
  await runClientCollaborationQa();
}else{
const env=process.env,str=v=>String(v??'').trim(),sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v),'utf8').digest('hex');
const runId=str(env.GITHUB_RUN_ID),sourceSha=str(env.FOCAL_SOURCE),expectedHr=str(env.EXPECTED_HR_REVISION);
const host=str(env.HOSTING_URL||'https://cxorbia-backend-dev.web.app').replace(/\/$/,'');
const projectName=str(env.PROJECT||'cxorbia-backend-dev'),tenantId='tya',projectId='cinepolis',periodId='cinepolis-2026-11';
const out=str(env.QA_OUT||'.tmp/i3-run2382-academy-b7-synthetic');
if(env.CXORBIA_I3_QA_ISOLATED_WRITE_GATE!=='PAULA_AUTHORIZED_RUN2382_DEV_ONLY'||
   projectName!=='cxorbia-backend-dev'||host!=='https://cxorbia-backend-dev.web.app'||
   !/^\d{8,}$/.test(runId)||!/^[a-f0-9]{40}$/.test(sourceSha)||!/^[a-f0-9]{64}$/.test(expectedHr)){
  throw Error('SOURCE_FAILURE:QA_SCOPE_GATE_DENIED');
}
fs.mkdirSync(out,{recursive:true});
if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:projectName});
const auth=getAuth(),db=getFirestore(),tenant=db.collection('tenants').doc(tenantId),proj=tenant.collection('projects').doc(projectId);
const baseCourses=JSON.parse(fs.readFileSync(new URL('../../backend/contracts/cxorbia-academy-base-progress-contract-v1.json',import.meta.url),'utf8')).courses;
const progressCourse=baseCourses.find(c=>c.audience==='shopper'&&c.courseId==='s_ruta');
const lesson=progressCourse?.lessons.find(l=>l.id==='sr1');
if(!lesson||lesson.quiz.length)throw Error('SOURCE_FAILURE:EXACT_SOURCE_BASE_LESSON_DRIFT');
const result={schemaVersion:'cxorbia.i3.run2382.qa-academy-b7-live.v1',decision:'HOLD',classification:null,
  runId,sourceSha,environment:projectName,production:false,periodId,hrBefore:null,hrAfter:null,
  academia:{},postulaciones:{},qaIdentitiesCreated:0,qaIdentitiesDeleted:0,cleanup:{ok:false,docFailures:[],authFailures:[],residue:[]},
  safety:{realLearnerWrites:0,realVisitsWritten:0,hrWrites:0,paymentWrites:0,productionDeploys:0}};
const persist=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2)+'\n');
const ensure=(yes,category,code)=>{if(!yes)throw Error(category+':'+code)};
const delDocs=new Map(),createdAuth=[];
function queue(ref){delDocs.set(ref.path,ref);return ref}
function receipt(command){return queue(tenant.collection('commandReceipts').doc(sha(`${tenantId}\0${projectId}\0${periodId}\0${command.idempotencyKey}`).slice(0,40)))}
function audit(command){return queue(tenant.collection('entityAuditTrail').doc(sha(`${command.idempotencyKey}\0${command.commandType}\0${command.entityId||''}`).slice(0,40)))}
async function json(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(90000)});
  const body=await response.json().catch(()=>({}));return {http:response.status,...body};
}
async function hrMeta(){
  const m=await json(`${host}/api/tya/cinepolis/hr-live?format=meta&qa=${runId}-${Date.now()}`,
    {headers:{'cache-control':'no-cache, no-store'}});
  ensure(m.http===200&&m.ok===true&&m.sourceSafe===true&&m.revisionStable===true&&m.hrWrites===false&&m.production===false,'PROVIDER_FAILURE','HR_META_CONTRACT');
  return str(m.revision);
}
async function apiKey(){
  const j=await json(host+'/__/firebase/init.json',{headers:{'cache-control':'no-store'}});
  ensure(j.http===200&&str(j.apiKey),'ENVIRONMENT_FAILURE','DEV_AUTH_INITIALIZATION');return str(j.apiKey);
}
async function qaIdentity(letter,key){
  const uid=`qa_i3_${runId}_${letter}`,shopperId=`qa_i3_shopper_${runId}_${letter}`;
  const memberRef=queue(tenant.collection('users').doc(uid));
  ensure(!(await memberRef.get()).exists,'SOURCE_FAILURE','QA_MEMBER_COLLISION_'+letter);
  try{await auth.getUser(uid);throw Error('SOURCE_FAILURE:QA_AUTH_COLLISION_'+letter)}
  catch(e){if(e?.code!=='auth/user-not-found')throw e}
  const claims={tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId};
  await auth.createUser({uid,displayName:'QA Recovery '+letter,disabled:false});createdAuth.push(uid);
  await auth.setCustomUserClaims(uid,claims);
  await memberRef.create({uid,tenantId,projectIds:[projectId],role:'shopper',authNamespace:'shopper',shopperId,
    name:'QA Recovery '+letter,active:true,status:'active',qaSynthetic:true,qaRunId:runId});
  result.qaIdentitiesCreated++;
  return {uid,shopperId};
}
async function identityToken(uid,key){
  const user=await auth.getUser(uid),custom=await auth.createCustomToken(uid,user.customClaims||{});
  const j=await json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(j.http===200&&str(j.idToken),'AUTH_FAILURE','DEV_QA_LOGIN_'+j.http);
  const claims=await auth.verifyIdToken(j.idToken,true);
  ensure(claims.uid===uid&&claims.tenantId===tenantId&&claims.role==='shopper'&&claims.authNamespace==='shopper','AUTH_FAILURE','QA_CLAIMS_INVALID');
  return j.idToken;
}
async function command(token,c){return json(host+'/v1/cxorbia/commands',
  {method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(c)});}
function op(type,id,key,expectedVersion,payload,entityType='application'){
  const c={version:'cxorbia-command-adapter-v1',commandType:type,entityType,entityId:id,tenantId,projectId,periodId,
    expectedVersion,idempotencyKey:`qa-i3-${runId}-${key}`,authorization:{providerEnforcementRequired:true},
    payload,audit:{reason:'QA synthetic DEV RUN2382',correlationId:`qa-i3-${runId}-${key}`}};
  receipt(c);audit(c);return c;
}
async function applyPostulation(caseName,who,shopToken,adminToken,proposedDate,approval){
  const visitId=`QA_I3_${runId}_${caseName}_VISIT`,postId=`QA_I3_${runId}_${caseName}_APPLICATION`;
  const visitRef=queue(proj.collection('visits').doc(visitId)),postRef=queue(proj.collection('postulations').doc(postId));
  ensure(!(await visitRef.get()).exists&&!(await postRef.get()).exists,'SOURCE_FAILURE','QA_POSTULATION_ID_COLLISION');
  await visitRef.create({id:visitId,visitId,hrRowId:visitId,tenantId,projectId,periodId,periodKey:'2026-11',
    estado:'disponible',status:'disponible',shopperId:null,pais:'GT',sucursal:'QA SYNTHETIC DEV',
    assignmentSource:'platform',qaSynthetic:true,qaRunId:runId,version:1,
    canonicalFacets:{available:true,assigned:false,scheduled:false,realized:false,submitted:false,paymentConfirmed:false,cancelled:false}});
  const create=op('application.create',postId,caseName+'-create','absent',
    {visitId,hrRowId:visitId,shopperId:who.shopperId,proposedDate,note:'QA EXCLUSIVAMENTE'});
  const made=await command(shopToken,create);
  ensure(made.ok===true&&made.providerAck===true&&made.status==='committed','PERSISTENCE_FAILURE','CREATE_'+caseName+':'+str(made.code));
  ensure((await postRef.get()).data()?.shopperId===who.shopperId,'PERSISTENCE_FAILURE','CREATE_READBACK_'+caseName);
  const createAgain=await command(shopToken,create);
  ensure(createAgain.ok===true&&createAgain.idempotentReplay===true&&Number(createAgain.providerWrites)===0,'PERSISTENCE_FAILURE','CREATE_IDEMPOTENCE_'+caseName);
  const decide=op('application.status.update',postId,caseName+'-decision',1,
    {status:approval?'aprobada':'rechazada',reason:'QA administracion DEV'});
  const notice=queue(tenant.collection('bulletins').doc('application-approval-'+receiptIdUnqueued(decide)));
  const approved=await command(adminToken,decide);
  ensure(approved.ok===true&&approved.providerAck===true&&approved.status==='committed','PERSISTENCE_FAILURE','DECISION_'+caseName+':'+str(approved.code));
  const p=(await postRef.get()).data(),v=(await visitRef.get()).data(),n=await notice.get();
  ensure(p?.status===(approval?'aprobada':'rechazada')&&p?.version===2,'PERSISTENCE_FAILURE','DECISION_READBACK_'+caseName);
  const [cr,dr,ca,da]=await Promise.all([receipt(create).get(),receipt(decide).get(),audit(create).get(),audit(decide).get()]);
  ensure(cr.exists&&dr.exists&&ca.exists&&da.exists,'PERSISTENCE_FAILURE','RECEIPT_AUDIT_'+caseName);
  if(approval){
    ensure(v.shopperId===who.shopperId&&v.assignmentSyncStatus==='pending_hr'&&v.approvedApplicationId===postId,
      'PERSISTENCE_FAILURE','VISIT_ASSIGNMENT_READBACK');
    const body=n.exists?n.data():{};
    ensure(n.exists&&body.operational===true&&body.eventKey==='postulation_approved_visit_assigned'&&
      body.actionRoute==='misvisitas'&&body.toRole==='shopper'&&body.entityId===visitId&&
      JSON.stringify(body.targetShopperIds)==='["'+who.shopperId+'"]'&&JSON.stringify(body.targetProjectIds)==='["'+projectId+'"]',
      'MAPPING_FAILURE','SINGLE_SHOPPER_NOTICE');
  }else{
    ensure(!n.exists&&v.shopperId==null&&v.estado==='disponible','MAPPING_FAILURE','REJECTED_MUST_NOT_ASSIGN_OR_NOTIFY');
  }
  const replay=await command(adminToken,decide);
  ensure(replay.ok===true&&replay.idempotentReplay===true&&Number(replay.providerWrites)===0,
    'PERSISTENCE_FAILURE','DECISION_IDEMPOTENCE_'+caseName);
  const persisted=await postRef.get();
  ensure(persisted.data()?.version===2,'PERSISTENCE_FAILURE','DUPLICATE_DECISION_VERSION_'+caseName);
  return {status:p.status,approval,ack:true,postulationReadback:true,assignmentReadback:approval,
    shopperTargetExact:approval?'single_shopper':'no_approval_notice',receiptsAndAudits:true,idempotentReplay:true};
}
function receiptIdUnqueued(command){return sha(`${tenantId}\0${projectId}\0${periodId}\0${command.idempotencyKey}`).slice(0,40)}
async function lessonProgress(who,firstToken,other,otherToken,key){
  const payload={origin:'base',audience:'shopper',courseId:progressCourse.courseId,revision:progressCourse.revision,lessonId:lesson.id,answers:[]};
  const c={version:'cxorbia-command-adapter-v1',commandType:'academy.progress.lesson.complete',entityType:'academyProgress',entityId:payload.courseId,
    tenantId,projectId,periodId,idempotencyKey:`qa-i3-${runId}-academy-sr1`,expectedVersion:0,
    authorization:{providerEnforcementRequired:true},payload};
  const keyDigest=sha([who.uid,c.idempotencyKey]),receiptKey='academy-progress-'+keyDigest.slice(0,40);
  queue(tenant.collection('commandReceipts').doc(receiptKey));queue(tenant.collection('academyAudit').doc(receiptKey));
  queue(tenant.collection('entityAuditTrail').doc(receiptKey));
  ensure(!(await tenant.collection('users').doc(who.uid).get()).data()?.academyProgress,'SOURCE_FAILURE','SYNTHETIC_USER_HAS_PROGRESS');
  const a=await command(firstToken,c);
  ensure(a.ok===true&&a.status==='committed'&&a.providerAck===true&&a.successUiAllowed===true&&a.providerWrites===4,
    'PERSISTENCE_FAILURE','ACADEMY_LESSON_ACK:'+str(a.code));
  const member=await tenant.collection('users').doc(who.uid).get(),state=member.data()?.academyProgress;
  ensure(state?.ownerUid===who.uid&&state.tenantId===tenantId&&Object.values(state.courses||{}).some(v=>v.courseId==='s_ruta'&&v.lessons?.sr1===100&&v.version===1),
    'PERSISTENCE_FAILURE','ACADEMY_PROGRESS_READBACK');
  const newSessionToken=await identityToken(who.uid,key);
  const replay=await command(newSessionToken,c);
  ensure(replay.ok===true&&replay.idempotentReplay===true&&replay.providerWrites===0,
    'PERSISTENCE_FAILURE','ACADEMY_NEW_SESSION_REPLAY');
  ensure(!(await tenant.collection('users').doc(other.uid).get()).data()?.academyProgress,
    'MAPPING_FAILURE','ACADEMY_OTHER_LEARNER_PROGRESS_CONTAMINATED');
  const wrongAudience={...c,idempotencyKey:`qa-i3-${runId}-academy-wrong-role`,payload:{...c.payload,audience:'cliente'}};
  const denied=await command(otherToken,wrongAudience);
  ensure(denied.ok===false&&denied.providerWrites===0,'AUTH_FAILURE','ACADEMY_INVALID_AUDIENCE_NOT_BLOCKED');
  ensure(!(await tenant.collection('users').doc(other.uid).get()).data()?.academyProgress,
    'MAPPING_FAILURE','ACADEMY_WRONG_ROLE_MUTATED');
  const [rr,ar,tr]=await Promise.all([tenant.collection('commandReceipts').doc(receiptKey).get(),
    tenant.collection('academyAudit').doc(receiptKey).get(),tenant.collection('entityAuditTrail').doc(receiptKey).get()]);
  ensure(rr.exists&&ar.exists&&tr.exists,'PERSISTENCE_FAILURE','ACADEMY_RECEIPT_AUDIT');
  return {baseCourse:'s_ruta',lesson:'sr1',separateQaLearner:sha(who.uid).slice(0,12),
    providerAck:true,durableProgress:true,independentNewSession:true,idempotentReplay:true,
    secondLearnerUnchanged:true,otherAudienceDenied:true,auditsAndReceipts:true};
}
let error=null;
try{
  // Hosting does not proxy /health; the live scoped HR meta contract is the
  // correct DEV-only no-write runtime assertion for this endpoint.
  result.hrBefore=await hrMeta();ensure(result.hrBefore===expectedHr,'PROVIDER_FAILURE','HR_BEFORE_MISMATCH');
  ensure((await proj.get()).exists,'SOURCE_FAILURE','PROJECT_MISSING');
  const key=await apiKey(),who=await qaIdentity('a',key),other=await qaIdentity('b',key);
  const [shopToken,otherToken]=await Promise.all([identityToken(who.uid,key),identityToken(other.uid,key)]);
  const members=await tenant.collection('users').get();
  const admins=members.docs.map(d=>({uid:d.id,...d.data()})).filter(u=>u.active===true&&
    ['admin','super'].includes(str(u.role))&&u.authNamespace==='staff'&&
    (u.role==='super'||Array.isArray(u.projectIds)&&u.projectIds.includes(projectId)));
  ensure(admins.length>0,'AUTH_FAILURE','ADMIN_MISSING');
  const adminToken=await identityTokenStaff(admins[0].uid,key);
  result.academia=await lessonProgress(who,shopToken,other,otherToken,key);
  const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const proposedDate=new Date(localDate+'T12:00:00Z');proposedDate.setUTCDate(proposedDate.getUTCDate()+4);
  const when=proposedDate.toISOString().slice(0,10);
  result.postulaciones.approve=await applyPostulation('approved',who,shopToken,adminToken,when,true);
  result.postulaciones.reject=await applyPostulation('rejected',other,otherToken,adminToken,when,false);
  const targetBulletin=await tenant.collection('bulletins').doc('application-approval-'+receiptIdUnqueued(op('application.status.update',`QA_I3_${runId}_approved_APPLICATION`,'approved-decision',1,{status:'aprobada',reason:'QA administracion DEV'}))).get();
  ensure(targetBulletin.exists&&targetBulletin.data().targetShopperIds?.includes(who.shopperId)&&
    !targetBulletin.data().targetShopperIds?.includes(other.shopperId),'MAPPING_FAILURE','B7_OTHER_SHOPPER_NOT_EXCLUDED');
  result.postulaciones.otherShopperExcluded=true;
  result.hrAfter=await hrMeta();ensure(result.hrAfter===expectedHr,'PROVIDER_FAILURE','HR_AFTER_MISMATCH');
}catch(e){error=str(e?.message||e);result.failure=error;result.classification=/^(SOURCE_FAILURE|MAPPING_FAILURE|PROVIDER_FAILURE|AUTH_FAILURE|ENVIRONMENT_FAILURE)/.test(error)?error.split(':')[0]:'PERSISTENCE_FAILURE';}
finally{
  for(const ref of [...delDocs.values()].reverse()){
    try{await ref.delete();if((await ref.get()).exists)result.cleanup.residue.push(ref.path)}
    catch(e){result.cleanup.docFailures.push({path:ref.path,error:str(e?.code||e?.message)})}
  }
  for(const uid of [...createdAuth].reverse()){
    try{await auth.deleteUser(uid);result.qaIdentitiesDeleted++;
      try{await auth.getUser(uid);result.cleanup.residue.push('auth:qa-user-still-present')}
      catch(e){if(e?.code!=='auth/user-not-found')throw e}}
    catch(e){result.cleanup.authFailures.push({uidHash:sha(uid).slice(0,12),error:str(e?.code||e?.message)})}
  }
}
result.cleanup.ok=result.cleanup.docFailures.length===0&&result.cleanup.authFailures.length===0&&result.cleanup.residue.length===0&&result.qaIdentitiesCreated===result.qaIdentitiesDeleted;
result.decision=!error&&result.cleanup.ok&&result.academia.providerAck&&result.postulaciones.otherShopperExcluded&&result.hrAfter===result.hrBefore
  ?'PASS_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV':'HOLD_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV';
persist();console.log(JSON.stringify(result,null,2));
if(result.decision!=='PASS_I3_RUN2382_ACADEMY_B7_SYNTHETIC_DEV')process.exitCode=2;

async function identityTokenStaff(uid,key){
  const member=await tenant.collection('users').doc(uid).get();
  ensure(member.exists,'AUTH_FAILURE','STAFF_MEMBER_NOT_FOUND');
  const user=await auth.getUser(uid),custom=await auth.createCustomToken(uid,user.customClaims||{});
  const r=await json('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(key),
    {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});
  ensure(r.http===200&&r.idToken,'AUTH_FAILURE','ADMIN_CUSTOM_TOKEN_EXCHANGE');
  const decoded=await auth.verifyIdToken(r.idToken,true);
  ensure(['admin','super'].includes(decoded.role)&&decoded.tenantId===tenantId&&decoded.authNamespace==='staff',
    'AUTH_FAILURE','ADMIN_ROLE_CLAIMS');return r.idToken;
}

}
