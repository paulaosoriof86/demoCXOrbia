#!/usr/bin/env node
// Exact disposable QA inventory. Remote operations are reads only.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const TARGET=Object.freeze({runId:'1795653493842440',attempt:'1',owner:'f3-qa-1795653493842440-1',
  controlSha:'a6f126005ef86d8effe903f73774669edb1c6441',firebaseProject:'cxorbia-backend-dev',
  tenantId:'tya',projectId:'f3-qa-20261124',periodId:'f3-qa-20261124-2026-11',checkpoint:'f3.Z2A8q0Wr'});
const ROOT='tenants/tya/projects/'+TARGET.projectId;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const digest=x=>sha(JSON.stringify(stable(x)));
const same=(a,b)=>digest(a??null)===digest(b??null);
const need=(ok,code)=>{if(!ok)throw Error(code);};
const safeError=e=>({code:/^[a-z0-9_/.-]{1,100}$/i.test(String(e?.code||''))?String(e.code):'READ_FAILED',
  machineCode:/^(?:SOURCE|AUTH|MAPPING|PERSISTENCE|PROVIDER|ENVIRONMENT)_FAILURE:[A-Z0-9_]+$/.test(e?.message||'')?e.message:null,
  httpStatus:Number.isInteger(Number(e?.response?.status))?Number(e.response.status):null});
const ts=x=>x?{seconds:x.seconds,nanoseconds:x.nanoseconds,iso:x.toDate?.().toISOString()||null}:null;
function redact(x,key=''){
  if(/^(?:password|passwordHash|salt|token|idToken|refreshToken|accessToken|access_token|refresh_token|authorization|apiKey|privateKey|private_key|clientSecret|client_secret|credentials|credential|email|mail|telefono|phone|phoneNumber)$/i.test(key))
    return {redacted:true,sha256:digest(x)};
  if(x?.constructor?.name==='Timestamp')return {$timestamp:ts(x)};
  if(Buffer.isBuffer(x)||x instanceof Uint8Array)return {binarySha256:sha(x),bytes:x.length};
  if(Array.isArray(x))return x.map(v=>redact(v));
  if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,redact(x[k],k)]));
  if(typeof x==='string')return x.replace(/\bBearer\s+[^\s]+/gi,'Bearer [REDACTED]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL REDACTED]');
  return x;
}

if(process.argv.includes('--describe')){
  console.log(JSON.stringify({target:TARGET,remoteOperations:['GCS object read','Firestore document/subcollection read','Auth getUser'],
    remoteWrites:0,newAuthSessions:0,makeCalls:0,commandPosts:0,baselineRead:false},null,2));
  process.exit(0);
}
const repo=fs.realpathSync(process.cwd());
const job=path.join(os.homedir(),'.cxorbia-i3-qa',TARGET.checkpoint);
need(fs.statSync(job).isDirectory(),'SOURCE_FAILURE:F3_INVENTORY_CHECKPOINT_MISSING');
const output=path.join(job,'readonly-inventory-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
const report={schemaVersion:'cxorbia.f3.native-owned-readonly-inventory.v1',target:TARGET,state:'HOLD',decision:'PENDING_READONLY_INVENTORY',
  startedAt:new Date().toISOString(),firestoreWrites:0,authWrites:0,hrWrites:0,makeCalls:0,commandPosts:0,productionWrites:0,
  cleanupAuthorized:false,cleanupExecuted:false,applicationAckProven:false,documents:[],rootStates:[],auth:[],crosswalks:[],flags:[]};
const checkpoint=()=>fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{mode:0o600});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
let app,deleteApp;
try{
  const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
  need(head===TARGET.controlSha,'SOURCE_FAILURE:F3_INVENTORY_CHECKOUT');
  const runnerPath='tools/qa/cxorbia-i3-b14-isolated-provider-writer-qa.mjs',rolePath='tools/qa/cxorbia-i3-f3-shopper-role-qa.mjs';
  for(const file of [runnerPath,rolePath])need(execFileSync('git',['hash-object',file],{cwd:repo,encoding:'utf8'}).trim()===
    execFileSync('git',['rev-parse',TARGET.controlSha+':'+file],{cwd:repo,encoding:'utf8'}).trim(),'SOURCE_FAILURE:F3_INVENTORY_HELPER_DRIFT');
  const {F3_QA,f3FixtureDocuments,f3OwnedCleanupPath,f3AssertCleanupLock,f3VerifyRun2782GtPendingBaseline}=await import(pathToFileURL(path.join(repo,runnerPath)));
  const {f3RoleActors,f3RoleAuthOwned}=await import(pathToFileURL(path.join(repo,rolePath)));
  const rawBytes=fs.readFileSync(path.join(job,'evidence/receipt.json')),raw=JSON.parse(rawBytes);
  const localBundleBytes=fs.readFileSync(path.join(job,'result.json')),localBundle=JSON.parse(localBundleBytes);
  need(raw.schemaVersion==='cxorbia.i3.f3.qa-endpoint.v1'&&String(raw.runId)===TARGET.runId&&String(raw.runAttempt)===TARGET.attempt&&raw.qaOwner===TARGET.owner&&
    raw.tenantId===TARGET.tenantId&&raw.projectId===TARGET.projectId&&raw.periodId===TARGET.periodId&&raw.controlSha===head&&
    raw.externalExecution?.provider==='GOOGLE_CLOUD_SHELL'&&raw.externalExecution.startGeneration===TARGET.runId&&
    raw.syntheticOnly===true&&raw.productionWrites===0&&raw.operationalHrWrites===0,'SOURCE_FAILURE:F3_INVENTORY_RAW_SCOPE');
  need(raw.events?.length===1&&raw.remoteCommandAttempts?.length>=1&&raw.recoveryRequired===true&&raw.cleanup?.firestore===false,
    'SOURCE_FAILURE:F3_INVENTORY_PRESERVED_ATTEMPT_REQUIRED');
  need(localBundle.schemaVersion==='cxorbia.i3.google-f3-result.v1'&&localBundle.startUri===raw.externalExecution.startUri&&sha(rawBytes)===localBundle.resultSha256,
    'SOURCE_FAILURE:F3_INVENTORY_RAW_HASH');
  const uri=/^gs:\/\/cxorbia-backend-dev_cloudbuild\/cxorbia-i3-qa\/([a-f0-9-]{36})\/start\.json#1795653493842440$/.exec(localBundle.startUri||'');
  need(uri,'SOURCE_FAILURE:F3_INVENTORY_START_URI');
  const prefix='gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-qa/'+uri[1]+'/';
  need(localBundle.archiveUri?.startsWith(prefix+'evidence.zip#')&&/^[1-9]\d{7,19}$/.test(localBundle.archiveUri.split('#')[1]||''),'SOURCE_FAILURE:F3_INVENTORY_ARCHIVE_URI');
  const gcloud=args=>execFileSync('gcloud',args,{cwd:repo,timeout:45000,maxBuffer:32*1024*1024});
  const meta=JSON.parse(gcloud(['storage','objects','describe',prefix+'result.json','--raw','--format=json']));
  need(meta.bucket==='cxorbia-backend-dev_cloudbuild'&&meta.name==='cxorbia-i3-qa/'+uri[1]+'/result.json'&&/^[1-9]\d{7,19}$/.test(String(meta.generation)),
    'SOURCE_FAILURE:F3_INVENTORY_RESULT_OBJECT');
  const resultUri=prefix+'result.json#'+meta.generation,resultBytes=gcloud(['storage','cat',resultUri]);
  need(resultBytes.equals(localBundleBytes),'SOURCE_FAILURE:F3_INVENTORY_RESULT_READBACK');
  const archive=gcloud(['storage','cat',localBundle.archiveUri]);
  need(sha(archive)===localBundle.archiveSha256,'SOURCE_FAILURE:F3_INVENTORY_ARCHIVE_HASH');
  const archivedRaw=execFileSync('python3',['-c','import io,sys,zipfile\nz=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); n=z.namelist(); assert n.count("receipt.json")==1 and len(n)==len(set(n)); sys.stdout.buffer.write(z.read("receipt.json"))'],
    {input:archive,timeout:10000,maxBuffer:2*1024*1024});
  need(archivedRaw.equals(rawBytes),'SOURCE_FAILURE:F3_INVENTORY_ARCHIVE_RAW');
  report.originalEvidence={rawSha256:sha(rawBytes),resultUri,resultSha256:sha(resultBytes),archiveUri:localBundle.archiveUri,archiveSha256:sha(archive),nativeReadbackVerified:true,
    sourceSha:raw.sourceSha,sourceTree:raw.sourceTree,runtimeRevision:raw.runtimeRevision,runtimeDigest:raw.runtimeDigest,hostingVersion:raw.hostingVersion,
    originalDecision:raw.decision,applicationAckProven:raw.applicationAckProven,remoteValuesRestored:raw.remoteValuesRestored,recoveryRequired:raw.recoveryRequired};
  const manifestBytes=fs.readFileSync(path.join(repo,'docs/checkpoints/CXORBIA_I3_F3_REMOTE_FIXTURE_20261124.json'));
  need(sha(manifestBytes)==='9276e4b72e67a33ac74dc3342fb6c7ca9223a770f0adaec3f46294b5f96a694a','SOURCE_FAILURE:F3_INVENTORY_MANIFEST');
  const manifest=JSON.parse(manifestBytes),actors=f3RoleActors(TARGET.owner,F3_QA),claims={tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:[F3_QA.projectId],qaOwner:TARGET.owner};
  const admin={uid:TARGET.owner+'-admin',displayName:'CXOrbia isolated QA operator',claims,path:'tenants/tya/users/'+TARGET.owner+'-admin'};
  const fixed=new Map(f3FixtureDocuments(manifest,TARGET.owner).map(x=>[x.path,x.data]));
  fixed.set(admin.path,{...claims,uid:admin.uid,active:true,status:'active',synthetic:true,qaOwner:TARGET.owner});
  for(const actor of actors)fixed.set(actor.path,actor.data);
  const commandRoots=new Set(),reconcilePaths=[];
  for(const item of raw.remoteCommandAttempts||[]){
    const c=item.command;
    need(c?.tenantId==='tya'&&c.projectId===TARGET.projectId&&c.periodId===TARGET.periodId&&c.commandType==='visit.hr.fields.update'&&
      c.idempotencyKey===TARGET.owner+'-field-1'&&c.entityId===F3_QA.visits.GT,'SOURCE_FAILURE:F3_INVENTORY_COMMAND_SCOPE');
    const expected=['tenants/tya/commandReceipts/'+sha(c.tenantId+'\0'+c.projectId+'\0'+c.periodId+'\0'+c.idempotencyKey).slice(0,40),
      'tenants/tya/entityAuditTrail/'+sha(c.idempotencyKey+'\0'+c.commandType+'\0'+c.entityId).slice(0,40)];
    need(same(item.receiptPaths,expected),'SOURCE_FAILURE:F3_INVENTORY_COMMAND_PATHS');
    for(const p of expected)commandRoots.add(p);
  }
  for(const q of raw.reconciliations||[]){
    need(['initial','restored'].includes(q.serial)&&q.idempotencyKey===TARGET.owner+'-reconcile-'+q.serial&&
      q.receiptPath==='tenants/tya/commandReceipts/hr-'+digest([TARGET.projectId,q.idempotencyKey]),'SOURCE_FAILURE:F3_INVENTORY_RECONCILE_SCOPE');
    commandRoots.add(q.receiptPath);reconcilePaths.push(q.receiptPath);
    if(q.durable?.receipt)fixed.set(q.receiptPath,q.durable.receipt);
    for(const kind of ['stages','intents','effects'])for(const row of q.durable?.[kind]||[]){
      need(row.path.startsWith(q.receiptPath+'/'+kind+'/')&&row.path.split('/').length===q.receiptPath.split('/').length+2,'SOURCE_FAILURE:F3_INVENTORY_RECONCILE_CHILD');fixed.set(row.path,row.data);
    }
  }
  for(const item of raw.events||[]){
    const e=item.event;
    need(/^hfe-[a-f0-9]{64}$/.test(item.eventId)&&e?.eventId===item.eventId&&e.actorUid===admin.uid&&e.tenantId==='tya'&&e.projectId===TARGET.projectId&&e.periodId===TARGET.periodId&&
      e.countryCode==='GT'&&e.fieldKey==='escenario'&&e.idempotencyKey===TARGET.owner+'-field-1','SOURCE_FAILURE:F3_INVENTORY_EVENT_SCOPE');
    fixed.set(ROOT+'/hrFieldEvents/'+item.eventId,e);
    if(item.delivery)fixed.set(ROOT+'/hrFieldDeliveries/'+item.eventId,item.delivery);
    for(const {id,...data} of item.attempts||[]){need(/^[a-f0-9-]+-(?:intent|effect)$/.test(id),'SOURCE_FAILURE:F3_INVENTORY_ATTEMPT_ID');fixed.set(ROOT+'/hrFieldDeliveries/'+item.eventId+'/attempts/'+id,data);}
  }
  const roots=[...new Set([ROOT,...f3FixtureDocuments(manifest,TARGET.owner).map(x=>x.path),admin.path,...actors.map(x=>x.path),...commandRoots])].sort();
  const lockPath='tenants/tya/commandReceipts/hr-scope-'+digest('tya');
  need(raw.scopeLockBaseline?.path===lockPath,'SOURCE_FAILURE:F3_INVENTORY_LOCK_PATH');
  const req=createRequire(path.join(repo,'package.json'));
  need(JSON.parse(fs.readFileSync(path.join(repo,'node_modules/firebase-admin/package.json'))).version==='13.4.0','ENVIRONMENT_FAILURE:F3_INVENTORY_ADMIN_VERSION');
  const sdk=req('firebase-admin/app');deleteApp=sdk.deleteApp;
  app=sdk.initializeApp({credential:sdk.applicationDefault(),projectId:TARGET.firebaseProject},'f3-readonly-'+Date.now());
  const db=req('firebase-admin/firestore').getFirestore(app),auth=req('firebase-admin/auth').getAuth(app);
  need(db.projectId===TARGET.firebaseProject,'SOURCE_FAILURE:F3_INVENTORY_DATABASE_PROJECT');
  checkpoint();
  const found=new Map(),seen=new Set(),rootStates=new Map();
  async function walk(ref,depth=0){
    if(seen.has(ref.path))return;seen.add(ref.path);
    need(seen.size<=300&&depth<=12,'SOURCE_FAILURE:F3_INVENTORY_BOUNDED_SCOPE');
    if(!f3OwnedCleanupPath(ref.path,TARGET.owner,[...commandRoots])){report.flags.push('EXTERNAL_DESCENDANT_NOT_AUTHORIZED_FOR_READ:'+ref.path);return;}
    const snap=await ref.get(),collections=await ref.listCollections();
    rootStates.set(ref.path,{path:ref.path,exists:snap.exists,subcollections:collections.map(x=>x.id).sort()});
    if(snap.exists)found.set(ref.path,{path:ref.path,data:snap.data(),updateTime:ts(snap.updateTime),createTime:ts(snap.createTime),readTime:ts(snap.readTime)});
    for(const collection of collections)for(const child of await collection.listDocuments())await walk(child,depth+1);
  }
  for(const p of roots)await walk(db.doc(p));
  const lockSnap=await db.doc(lockPath).get(),lockData=lockSnap.exists?lockSnap.data():null;
  report.lock={path:lockPath,exists:lockSnap.exists,data:redact(lockData),sha256:digest(lockData),updateTime:ts(lockSnap.updateTime),
    originalBaseline:redact(raw.scopeLockBaseline),decision:null};
  try{report.lock.decision=f3AssertCleanupLock({current:lockData,baseline:raw.scopeLockBaseline.data,owner:TARGET.owner,reconcilePaths,receipts:[...found.values()]});}
  catch(e){report.lock.error=safeError(e);report.flags.push('SCOPE_LOCK_OWNERSHIP_UNPROVEN');}
  report.lock.leaseAbsent=lockData===null||(lockData.status==='committed'&&Number.isFinite(lockData.expiresAt)&&lockData.expiresAt<=Date.now());
  if(!report.lock.leaseAbsent)report.flags.push('SCOPE_LOCK_LEASE_NOT_ABSENT');
  for(const row of [...found.values()].sort((a,b)=>a.path.localeCompare(b.path))){
    let ownerCheck='UNCLASSIFIED_DESCENDANT',error;
    if(fixed.has(row.path))ownerCheck=same(row.data,fixed.get(row.path))?'EXACT_RECORDED_OR_SEEDED_DATA':'RECORDED_DATA_DRIFT';
    else if(row.path.startsWith(ROOT+'/hrFieldHeads/')){
      const item=(raw.events||[]).find(e=>row.path===ROOT+'/hrFieldHeads/'+e.remoteHeadKey),d=row.data;
      const expected=item?{...Object.fromEntries(['tenantId','projectId','periodId','countryCode','visitId','hrRowId','fieldKey'].map(k=>[k,item.event[k]])),
        confirmedValue:item.event.before,latestEventId:item.event.baseEventId??null,causalSequence:item.event.causalSequence,
        pendingEventId:item.eventId,leaseOwner:null,leaseUntil:0}:null;
      ownerCheck=expected&&same(d,expected)?'EXACT_EVENT_HEAD_NO_ACTIVE_LEASE':'HEAD_OWNERSHIP_OR_LEASE_UNPROVEN';
    }else if(row.path.startsWith(ROOT+'/visits/')){
      const operationRecord=(raw.reconciliations||[]).flatMap(q=>q.durable?.effects||[]).find(x=>x.data?.operations?.some(o=>o.entity===row.path));
      const effect=operationRecord?.data.operations.find(o=>o.entity===row.path);
      if(effect&&row.path===ROOT+'/visits/'+F3_QA.visits.HN)ownerCheck=digest(row.data)===effect.expectedDigest?'EXACT_UNTOUCHED_CREATE_DIGEST':'VISIT_CREATE_DIGEST_DRIFT';
      else if(effect&&row.path===ROOT+'/visits/'+F3_QA.visits.GT){try{f3VerifyRun2782GtPendingBaseline({raw,data:row.data,effect,effectRecord:operationRecord.data});ownerCheck='EXACT_GT_PENDING_AND_CREATE_DIGEST';}catch(e){error=safeError(e);ownerCheck='GT_PENDING_BASELINE_UNPROVEN';}}
    }else if(commandRoots.has(row.path)&&!reconcilePaths.includes(row.path)){
      const c=raw.remoteCommandAttempts[0].command,d=row.data;
      const exact=d.actorUid===admin.uid&&d.entityId===c.entityId&&d.commandType===c.commandType;
      ownerCheck=exact&&(row.path.includes('/commandReceipts/')?d.commandDigest===digest(c)&&d.status==='committed'&&same(d.hrFieldEventIds,raw.events.map(e=>e.eventId)):
        d.idempotencyKey===c.idempotencyKey&&d.tenantId==='tya'&&d.projectId===TARGET.projectId&&d.periodId===TARGET.periodId)?'EXACT_COMMAND_OWNER':'COMMAND_OWNER_UNPROVEN';
    }
    if(!ownerCheck.startsWith('EXACT_'))report.flags.push(ownerCheck+':'+row.path);
    report.documents.push({...row,data:redact(row.data),sha256:digest(row.data),ownerCheck,...(error?{error}:{})});
  }
  for(const p of fixed.keys())if(!found.has(p))report.flags.push('EXPECTED_DOCUMENT_ABSENT:'+p);
  for(const p of commandRoots)if(!found.has(p))report.flags.push('EXPECTED_COMMAND_ROOT_ABSENT:'+p);
  report.rootStates=roots.map(p=>rootStates.get(p));
  for(const country of F3_QA.countries)for(const letter of ['A','B']){
    const id='shopper_'+country.toLowerCase()+'_'+sha(('CXOrbia QA '+country+' F3 '+letter).toLowerCase()).slice(0,10),p='tenants/tya/shopperIdentityCrosswalk/'+id,s=await db.doc(p).get();
    report.crosswalks.push({path:p,exists:s.exists,sha256:s.exists?digest(s.data()):null,data:s.exists?redact(s.data()):null,updateTime:ts(s.updateTime),deletionAuthority:false});
    if(s.exists)report.flags.push('UNEXPECTED_CROSSWALK_REQUIRES_OWNER_REVIEW:'+p);
  }
  for(const actor of [admin,...actors]){
    try{
      const u=await auth.getUser(actor.uid),emailExpected=actor.uid+'@cxorbia.invalid',providerIds=u.providerData.map(x=>x.providerId).sort();
      const claimsExact=same(u.customClaims,actor.claims),roleOwner=actor.uid===admin.uid?claimsExact:f3RoleAuthOwned(u,actor,TARGET.owner);
      const record={uid:actor.uid,exists:true,claims:redact(u.customClaims||{}),claimsSha256:digest(u.customClaims||{}),claimsExact,roleOwner,
        emailMatchesSynthetic:u.email===emailExpected,emailSha256:sha(String(u.email||'')),displayNameMatches:u.displayName===actor.displayName,disabled:u.disabled,
        providerIds,providerIdentityExact:u.providerData.length===1&&u.providerData[0].providerId==='password'&&u.providerData[0].email===emailExpected&&u.providerData[0].uid===emailExpected,
        creationTime:u.metadata.creationTime,lastSignInTime:u.metadata.lastSignInTime,tokensValidAfterTime:u.tokensValidAfterTime,
        createdWithinInvocation:Number.isFinite(Date.parse(u.metadata.creationTime))&&Date.parse(u.metadata.creationTime)>=Date.parse(raw.startedAt)-1000&&
          Date.parse(u.metadata.creationTime)<=Date.parse(raw.finishedAt)+1000};
      record.ownerCheck=record.claimsExact&&record.roleOwner&&record.emailMatchesSynthetic&&record.displayNameMatches&&record.disabled===false&&record.providerIdentityExact&&record.createdWithinInvocation?'EXACT_SYNTHETIC_PASSWORD_OWNER':'AUTH_OWNER_UNPROVEN';
      if(record.ownerCheck!=='EXACT_SYNTHETIC_PASSWORD_OWNER')report.flags.push(record.ownerCheck+':'+actor.uid);report.auth.push(record);
    }catch(e){if(e.code==='auth/user-not-found')report.auth.push({uid:actor.uid,exists:false});else{report.auth.push({uid:actor.uid,error:safeError(e)});report.flags.push('AUTH_READ_FAILED:'+actor.uid);}}
  }
  report.expectedRemoteBaseline=redact(raw.remoteBaseline);
  report.originalRemoteEvents=(raw.events||[]).map(x=>({eventId:x.eventId,eventDigest:x.eventDigest,remoteEventKey:x.remoteEventKey,remoteHeadKey:x.remoteHeadKey}));
  report.baseline={freshReadExecuted:false,valuesVerified:false,reason:'ROOT_MUST_SUPPLY_INDEPENDENT_FRESH_READER_RESULT_FOR_BOTH_ROWS_AND_8_VALUES',
    helper:'f3VerifyRestoredBaseline(raw.remoteBaseline, {rows, revision})'};
  report.remoteAudit={executed:false,zeroPatchClaimed:false,reason:'COMPLETE_MAKE_WINDOW_AND_EXACT_REMOTE_KEYS_REQUIRE_SEPARATE_PROVIDER_EVIDENCE'};
  report.flags.push('FRESH_EXTERNAL_BASELINE_NOT_CAPTURED','COMPLETE_MAKE_OUTCOME_AND_REMOTE_KEY_ABSENCE_NOT_VERIFIED');
  report.flags=[...new Set(report.flags)].sort();
  report.inventoryDigest=digest({documents:report.documents.map(x=>({path:x.path,sha256:x.sha256,updateTime:x.updateTime})),lock:{path:lockPath,sha256:report.lock.sha256,updateTime:report.lock.updateTime},auth:report.auth,crosswalks:report.crosswalks});
  report.decision='CAPTURED_EXACT_QA_READONLY_INVENTORY_NOT_CLEANUP_AUTHORITY';
}catch(e){report.decision='HOLD_READONLY_INVENTORY_INCOMPLETE';report.failure=safeError(e);process.exitCode=1;}
finally{
  report.finishedAt=new Date().toISOString();checkpoint();
  if(app)await deleteApp(app).catch(()=>{});
  console.log(JSON.stringify({decision:report.decision,output,inventoryDigest:report.inventoryDigest||null,documents:report.documents.length,auth:report.auth.length,
    flags:report.flags,remoteWrites:0,cleanupExecuted:false,failure:report.failure||null},null,2));
}
