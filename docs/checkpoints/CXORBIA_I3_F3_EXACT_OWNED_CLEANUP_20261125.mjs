#!/usr/bin/env node
// Disposable QA recovery for one preserved native attempt. Not a product feature.
// Default mode is --plan. No execution or publication is performed by authoring this file.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const T=Object.freeze({runId:'1795653493842440',attempt:'1',owner:'f3-qa-1795653493842440-1',
  controlSha:'a6f126005ef86d8effe903f73774669edb1c6441',firebaseProject:'cxorbia-backend-dev',
  tenantId:'tya',projectId:'f3-qa-20261124',periodId:'f3-qa-20261124-2026-11',checkpoint:'f3.Z2A8q0Wr'});
const INVENTORY_DIGEST='09dd4b984e7ba49f6da87b41c539bd1a9b3f43ad1a3b7f4db82861be589c9754';
const HISTORY_SHA='0e582159e7aea3704566a4b59bb427f99c30d84a6430bfb5212982d6bfc7a252';
const WRITE_EXECUTION='59660c881d63439f9eaceee173b3fea3';
const EVENT_ID='hfe-d9a5925fb8f9546836a0da4e52def7ffe19cf27065997f1c601311f63ca39831';
const EVENT_DIGEST='1ccee2a3230d81e23b8bf5d0c09b8b5639fe87fcb722badd816f296afd9e6617';
const REMOTE_KEYS=['412e4d0b0f1a7c5b9f32c8b9084ac2d2e305d838a949f774e962d061a6911b98','event:'+EVENT_ID];
const SENTINEL='757bfe4bd75b';
const FLAGS=['COMPLETE_MAKE_OUTCOME_AND_REMOTE_KEY_ABSENCE_NOT_VERIFIED','FRESH_EXTERNAL_BASELINE_NOT_CAPTURED'];
const ROOT='tenants/tya/projects/'+T.projectId,MAX_PROOF_AGE_MS=20*60*1000;
const sha=x=>createHash('sha256').update(x).digest('hex');
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const digest=x=>sha(JSON.stringify(stable(x)));
const same=(a,b)=>digest(a??null)===digest(b??null);
const need=(ok,code)=>{if(!ok)throw Error('PERSISTENCE_FAILURE:F3_EXACT_CLEANUP_'+code);};
const ts=x=>x?{seconds:x.seconds,nanoseconds:x.nanoseconds,iso:x.toDate().toISOString()}:null;
const safeError=e=>({code:/^[a-z0-9_/.-]{1,100}$/i.test(String(e?.code||''))?String(e.code):'RECOVERY_FAILED',
  machineCode:/^(?:SOURCE|AUTH|MAPPING|PERSISTENCE|PROVIDER|ENVIRONMENT)_FAILURE:[A-Z0-9_]+$/.test(e?.message||'')?e.message:null});
const jsonBytes=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
const fresh=(date,now=Date.now())=>Number.isFinite(Date.parse(date))&&Date.parse(date)<=now+5000&&now-Date.parse(date)<=MAX_PROOF_AGE_MS;
function noSerializedSpecialTypes(x){
  if(!x||typeof x!=='object')return true;
  if(Object.hasOwn(x,'_seconds')||Object.hasOwn(x,'_nanoseconds')||Object.hasOwn(x,'$timestamp')||Object.hasOwn(x,'_referencePath'))return false;
  return Object.values(x).every(noSerializedSpecialTypes);
}
function parseArgs(){
  const a=process.argv.slice(2),out={mode:'plan'};
  for(let i=0;i<a.length;i++){
    if(a[i]==='--plan'||a[i]==='--execute'){out.mode=a[i].slice(2);continue;}
    need(['--inventory','--baseline','--make'].includes(a[i])&&a[i+1]&&!a[i+1].startsWith('--'),'ARGUMENTS');
    out[a[i].slice(2)]=a[++i];
  }
  need(out.inventory&&out.baseline&&out.make,'THREE_EVIDENCE_FILES_REQUIRED');return out;
}
if(process.argv.includes('--describe')){
  console.log(JSON.stringify({target:T,inventoryDigest:INVENTORY_DIGEST,expectedDocuments:26,expectedAuth:3,
    command:'node DRIVER.mjs --plan|--execute --inventory FILE --baseline FILE --make FILE',
    baseline:'Existing cxorbia.f3.qa-live-restoration-projection.v1, unchanged live/freshCountries/proof contract. Copy its exact raw evidence to the job using the basename in authority.rawEvidencePath.',
    make:{schemaVersion:'cxorbia.f3.cleanup-make-readback.v1',qaOwner:T.owner,scenarioId:10199316,dataStoreId:213856,observedAt:'ACTUAL_CURRENT_READ_TIME',remoteMutations:0,
      executionWindow:'Actual structured execution-list response',recordReadback:'Actual structured datastore response; total 3'},
    historicalMake:'Copy CXORBIA_I3_F3_MAKE_FAILED_WINDOW_20261125.json unchanged into the checkpoint directory; its SHA256 is pinned.',
    proofMaxAgeMinutes:20,executeOperations:['GCS create-only evidence and readback','One Firestore transaction with exact CAS and scope-lock baseline restoration','Three exact owned Auth deletions after Firestore readback'],
    excludedOperations:['Make calls or keys deletion','HR/Excel writes','Commands or replay','IAM grants','Product changes'],
    finalState:'HOLD until root independently deletes and verifies the two Make keys; original FAIL is immutable'},null,2));process.exit(0);
}

const args=parseArgs(),repo=fs.realpathSync(process.cwd()),job=fs.realpathSync(path.join(os.homedir(),'.cxorbia-i3-qa',T.checkpoint));
function localFile(file){
  const p=fs.realpathSync(path.resolve(job,file));need(p.startsWith(job+path.sep),'INPUT_OUTSIDE_CHECKPOINT');
  const bytes=fs.readFileSync(p);need(bytes.length<12*1024*1024,'INPUT_SIZE');return {path:p,bytes,data:JSON.parse(bytes),sha256:sha(bytes)};
}
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(job,'owned-cleanup-'+stamp+'.json');
const receipt={schemaVersion:'cxorbia.f3.native-exact-owned-recovery.v1',target:T,state:'HOLD',decision:'PENDING',mode:args.mode,startedAt:new Date().toISOString(),
  originalAttemptStatus:'FAIL_PRESERVED',applicationAckProven:false,b14Closed:false,newModuleMatches:0,productionWrites:0,hrWrites:0,remoteMakeWrites:0,
  commandPosts:0,firestoreDeletes:0,firestoreRestores:0,authDeletes:0,cleanup:{firestore:false,auth:false,remoteMake:'PENDING_ROOT_CONNECTOR'},seals:[]};
fs.writeFileSync(out,jsonBytes(receipt),{flag:'wx',mode:0o600});
const save=()=>fs.writeFileSync(out,jsonBytes(receipt),{mode:0o600});
const gcloud=a=>execFileSync('gcloud',a,{cwd:repo,timeout:45000,maxBuffer:32*1024*1024});
let app,deleteApp,prefix,stageCount=0;
async function seal(stage,payload){
  const bytes=jsonBytes(payload),hash=sha(bytes),name='recovery-'+T.runId+'-'+stamp+'-'+String(++stageCount).padStart(2,'0')+'-'+stage+'-'+hash+'.json';
  const file=path.join(job,name),uri=prefix+name;
  fs.writeFileSync(file,bytes,{flag:'wx',mode:0o600});
  gcloud(['storage','cp',file,uri,'--if-generation-match=0','--quiet']);
  const meta=JSON.parse(gcloud(['storage','objects','describe',uri,'--raw','--format=json']));
  need(meta.bucket==='cxorbia-backend-dev_cloudbuild'&&uri==='gs://'+meta.bucket+'/'+meta.name&&/^[1-9]\d+$/.test(String(meta.generation)),'SEAL_METADATA');
  const pinned=uri+'#'+meta.generation;need(sha(gcloud(['storage','cat',pinned]))===hash,'SEAL_READBACK');
  receipt.seals.push({stage,uri:pinned,sha256:hash});save();return receipt.seals.at(-1);
}
try{
  need(execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim()===T.controlSha,'CHECKOUT');
  const helperPath='tools/qa/cxorbia-i3-b14-isolated-provider-writer-qa.mjs',rolePath='tools/qa/cxorbia-i3-f3-shopper-role-qa.mjs';
  for(const file of [helperPath,rolePath])need(execFileSync('git',['hash-object',file],{cwd:repo,encoding:'utf8'}).trim()===execFileSync('git',['rev-parse',T.controlSha+':'+file],{cwd:repo,encoding:'utf8'}).trim(),'HELPER_DRIFT');
  const {F3_QA,f3FixtureDocuments,f3OwnedCleanupPath,f3AssertCleanupLock,f3VerifyRestoredBaseline,f3RequireRemoteRestoredBeforeCleanup}=await import(pathToFileURL(path.join(repo,helperPath)));
  const {f3RoleActors,f3RoleAuthOwned}=await import(pathToFileURL(path.join(repo,rolePath)));
  const rawFile=localFile('evidence/receipt.json'),raw=rawFile.data,bundleFile=localFile('result.json'),bundle=bundleFile.data;
  const inventoryFile=localFile(args.inventory),inv=inventoryFile.data,baselineFile=localFile(args.baseline),baseline=baselineFile.data,makeFile=localFile(args.make),make=makeFile.data;
  need(raw.schemaVersion==='cxorbia.i3.f3.qa-endpoint.v1'&&String(raw.runId)===T.runId&&String(raw.runAttempt)===T.attempt&&raw.qaOwner===T.owner&&raw.controlSha===T.controlSha&&
    raw.syntheticOnly===true&&raw.productionWrites===0&&raw.operationalHrWrites===0&&raw.recoveryRequired===true&&raw.cleanup?.firestore===false&&
    Number.isFinite(Date.parse(raw.finishedAt))&&Date.parse(raw.finishedAt)<Date.now()-90000&&raw.events?.length===1&&raw.remoteCommandAttempts?.length>=1,'RAW_PRESERVED_FINISHED_SCOPE');
  need(raw.events[0].eventId===EVENT_ID&&raw.events[0].eventDigest===EVENT_DIGEST&&raw.applicationAckProven!==true,'EXACT_FAILED_EVENT');
  need(bundle.schemaVersion==='cxorbia.i3.google-f3-result.v1'&&bundle.resultSha256===rawFile.sha256&&bundle.startUri===raw.externalExecution?.startUri,'NATIVE_RAW_BINDING');
  const native=/^gs:\/\/cxorbia-backend-dev_cloudbuild\/cxorbia-i3-qa\/([a-f0-9-]{36})\/start\.json#1795653493842440$/.exec(bundle.startUri||'');need(native,'NATIVE_PREFIX');
  prefix='gs://cxorbia-backend-dev_cloudbuild/cxorbia-i3-qa/'+native[1]+'/';
  need(inv.schemaVersion==='cxorbia.f3.native-owned-readonly-inventory.v1'&&same(inv.target,T)&&inv.state==='HOLD'&&inv.decision==='CAPTURED_EXACT_QA_READONLY_INVENTORY_NOT_CLEANUP_AUTHORITY'&&!inv.failure&&
    inv.documents?.length===26&&inv.auth?.length===3&&inv.crosswalks?.length===4&&same([...inv.flags].sort(),FLAGS)&&
    inv.cleanupExecuted===false&&inv.cleanupAuthorized===false&&['firestoreWrites','authWrites','hrWrites','makeCalls','commandPosts','productionWrites'].every(k=>inv[k]===0),'INVENTORY_COMPLETE');
  const calculated=digest({documents:inv.documents.map(x=>({path:x.path,sha256:x.sha256,updateTime:x.updateTime})),lock:{path:inv.lock.path,sha256:inv.lock.sha256,updateTime:inv.lock.updateTime},auth:inv.auth,crosswalks:inv.crosswalks});
  need(calculated===INVENTORY_DIGEST&&inv.inventoryDigest===INVENTORY_DIGEST&&new Set(inv.documents.map(x=>x.path)).size===26,'PINNED_INVENTORY_DIGEST');
  need(inv.documents.every(x=>x.ownerCheck?.startsWith('EXACT_')&&/^[a-f0-9]{64}$/.test(x.sha256)&&x.updateTime)&&
    inv.auth.every(x=>x.exists===true&&x.ownerCheck==='EXACT_SYNTHETIC_PASSWORD_OWNER')&&inv.crosswalks.every(x=>x.exists===false&&x.deletionAuthority===false)&&inv.lock.leaseAbsent===true,'OWNERS_AND_ABSENCES');
  const original=inv.originalEvidence;
  need(original?.nativeReadbackVerified===true&&original.rawSha256===rawFile.sha256&&original.resultSha256===bundleFile.sha256&&
    original.resultUri?.startsWith(prefix+'result.json#')&&original.archiveUri===bundle.archiveUri&&original.archiveSha256===bundle.archiveSha256,'INVENTORY_NATIVE_PROVENANCE');
  need(gcloud(['storage','cat',original.resultUri]).equals(bundleFile.bytes),'RESULT_READBACK');
  const archive=gcloud(['storage','cat',original.archiveUri]);need(sha(archive)===original.archiveSha256,'ARCHIVE_HASH');
  const archived=execFileSync('python3',['-c','import io,sys,zipfile\nz=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); n=z.namelist(); assert n.count("receipt.json")==1 and len(n)==len(set(n)); sys.stdout.buffer.write(z.read("receipt.json"))'],{input:archive,timeout:10000,maxBuffer:2*1024*1024});
  need(archived.equals(rawFile.bytes),'ARCHIVE_RAW');
  const manifestBytes=fs.readFileSync(path.join(repo,'docs/checkpoints/CXORBIA_I3_F3_REMOTE_FIXTURE_20261124.json'));
  need(sha(manifestBytes)==='9276e4b72e67a33ac74dc3342fb6c7ca9223a770f0adaec3f46294b5f96a694a','MANIFEST');
  const manifest=JSON.parse(manifestBytes),actors=f3RoleActors(T.owner,F3_QA),adminClaims={tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:[T.projectId],qaOwner:T.owner};
  actors.unshift({uid:T.owner+'-admin',claims:adminClaims,displayName:'CXOrbia isolated QA operator',path:'tenants/tya/users/'+T.owner+'-admin'});
  need(same(inv.auth.map(x=>x.uid).sort(),actors.map(x=>x.uid).sort()),'EXACT_THREE_AUTH');
  const commands=new Set(),reconcilePaths=[];
  for(const r of raw.remoteCommandAttempts){
    const c=r.command;need(c?.tenantId==='tya'&&c.projectId===T.projectId&&c.periodId===T.periodId&&c.commandType==='visit.hr.fields.update'&&c.idempotencyKey===T.owner+'-field-1'&&c.entityId===F3_QA.visits.GT,'COMMAND_SCOPE');
    const expected=['tenants/tya/commandReceipts/'+sha(c.tenantId+'\0'+c.projectId+'\0'+c.periodId+'\0'+c.idempotencyKey).slice(0,40),'tenants/tya/entityAuditTrail/'+sha(c.idempotencyKey+'\0'+c.commandType+'\0'+c.entityId).slice(0,40)];
    need(same(r.receiptPaths,expected),'COMMAND_PATHS');for(const p of expected)commands.add(p);
  }
  for(const r of raw.reconciliations||[]){need(['initial','restored'].includes(r.serial)&&r.idempotencyKey===T.owner+'-reconcile-'+r.serial&&r.receiptPath==='tenants/tya/commandReceipts/hr-'+digest([T.projectId,r.idempotencyKey]),'RECONCILE_PATH');commands.add(r.receiptPath);reconcilePaths.push(r.receiptPath);}
  const roots=[...new Set([ROOT,...f3FixtureDocuments(manifest,T.owner).map(x=>x.path),...actors.map(x=>x.path),...commands])].sort();
  need(same(inv.rootStates.map(x=>x.path).sort(),roots)&&inv.documents.every(x=>f3OwnedCleanupPath(x.path,T.owner,[...commands])),'EXACT_ROOTS');
  const lockPath='tenants/tya/commandReceipts/hr-scope-'+digest('tya');
  need(inv.lock.path===lockPath&&raw.scopeLockBaseline?.path===lockPath&&raw.scopeLockBaseline.digest===digest(raw.scopeLockBaseline.data)&&
    raw.scopeLockBaseline.existed===(raw.scopeLockBaseline.data!==null)&&noSerializedSpecialTypes(raw.scopeLockBaseline.data),'LOCK_BASELINE_RESTORABLE');

  // Existing real reader projection: verify all eight values against the original raw receipt.
  need(baseline.schemaVersion==='cxorbia.f3.qa-live-restoration-projection.v1'&&baseline.authority?.owner===T.owner&&baseline.authority.tenantId==='tya'&&
    baseline.authority.projectId===T.projectId&&baseline.authority.periodId===T.periodId&&baseline.authority.readerScenarioId===10200465&&
    baseline.networkCallsDuringProjection===0&&baseline.providerWriteRequests===0&&baseline.authMutations===0&&baseline.firestoreMutations===0,'FRESH_BASELINE_SCOPE');
  const providerFile=localFile(path.basename(baseline.authority.rawEvidencePath));need(providerFile.sha256===baseline.authority.rawEvidenceSha256,'FRESH_BASELINE_RAW_HASH');
  const provider=providerFile.data;need(provider.readerScenarioId===10200465&&provider.readerGetOnlyVerified===true&&provider.providerWriteRequests===0&&provider.authMutations===0&&provider.firestoreMutations===0,'FRESH_READER_READONLY');
  for(const country of F3_QA.countries){const p=baseline.freshCountries[country],q=provider.countries[country],observed=q?.executionGet?.structuredContent?.outputs;
    need(p&&q&&fresh(p.observedAt)&&Date.parse(p.requestedAt)>Date.parse(raw.finishedAt)&&Date.parse(p.observedAt)>=Date.parse(p.requestedAt)&&
      p.requestedAt===q.requestedAt&&p.observedAt===q.observedAt&&/^[a-f0-9]{32}$/.test(p.executionId)&&p.makeHash1===p.makeHash2&&/^[a-f0-9]{64}$/.test(p.makeHash1)&&
      p.proof?.externalRevisionIndependentlyVerified===true&&p.proof.providerWriteRequests===0&&p.proof.hrWrites===0&&p.proof.providerAck===false&&
      p.worksheetFingerprint===manifest.countries[country].worksheetFingerprint&&p.visitId===F3_QA.visits[country]&&
      same(p.values,Object.fromEntries(F3_QA.fields.map(k=>[k,baseline.live.rows.find(x=>(x.country||x.pais)===country)?.[k]??null]))),'FRESH_PAIR_PROOF');
    need(q.result?.isError===false&&q.executionGet?.isError===false&&q.result.structuredContent.executionId===p.executionId&&q.executionGet.structuredContent.execution.id===p.executionId&&
      q.result.structuredContent.status==='success'&&q.executionGet.structuredContent.execution.status==='success'&&same(observed,q.result.structuredContent.outputs)&&
      q.inputs.operation==='read'&&observed.tenantId==='tya'&&observed.projectId===T.projectId&&observed.periodId===T.periodId&&observed.countryCode===country&&
      observed.bindingFingerprint===p.bindingFingerprint&&observed.worksheetId===manifest.countries[country].worksheetId&&observed.rangeAddress==='A1:Z2'&&
      observed.status1===200&&observed.status2===200&&observed.hash1===p.makeHash1&&observed.hash2===p.makeHash2&&
      observed.values1?.length===2&&same(observed.values1,observed.values2)&&same(observed.values1[0],manifest.countries[country].headerValues),'FRESH_PROVIDER_EXECUTION');
  }
  receipt.remoteBaselineReadback=f3VerifyRestoredBaseline(raw.remoteBaseline,baseline.live);
  // This is a new recovery proof in memory. The original raw remains unchanged.
  f3RequireRemoteRestoredBeforeCleanup({remoteCommandAttempts:raw.remoteCommandAttempts,remoteValuesRestored:true});

  // Complete current Make window plus exact current keys; one failed PATCH is preserved as fact.
  need(make.schemaVersion==='cxorbia.f3.cleanup-make-readback.v1'&&make.qaOwner===T.owner&&make.scenarioId===10199316&&make.dataStoreId===213856&&make.remoteMutations===0,'MAKE_SCOPE');
  const historyFile=localFile('CXORBIA_I3_F3_MAKE_FAILED_WINDOW_20261125.json');need(historyFile.sha256===HISTORY_SHA,'MAKE_HISTORICAL_HASH');
  const history=historyFile.data,window=make.executionWindow,store=make.recordReadback;
  need(fresh(make.observedAt)&&Date.parse(make.observedAt)>Date.parse(raw.finishedAt)&&window?.hasMore!==true&&!window?.nextCursor&&!store?.nextCursor,'CURRENT_MAKE_WINDOW');
  const executions=window?.executions,originalExecutions=history.exactRecoveredResponses.ALLWINDOW.structuredContent.executions;
  need(executions?.length===3&&same([...executions].sort((a,b)=>a.id.localeCompare(b.id)),[...originalExecutions].sort((a,b)=>a.id.localeCompare(b.id)))&&executions.every(x=>x.status==='success'),'NO_NEW_OR_ACTIVE_WRITER');
  const write=history.exactRecoveredResponses.writeExecutionInspect.structuredContent,patch=history.findings.executions.find(x=>x.id===WRITE_EXECUTION);
  need(patch?.patchModule36Invocations===1&&patch.providerWriteRequests===1&&patch.patchError.startsWith('[404]')&&write.outputs.eventId===EVENT_ID&&
    write.outputs.eventDigest===EVENT_DIGEST&&write.outputs.providerWriteRequests===1&&write.outputs.providerAck===false&&write.outputs.remoteReceiptVerified===false&&write.outputs.writeAttempted===true,'ONE_PATCH_404_NO_ACK');
  const records=store?.records,oldRecords=history.exactRecoveredResponses.datastore213856Page0.structuredContent.records;
  const parsed=items=>items.map(r=>({key:r.key,schemaVersion:r.data.schemaVersion,recordType:r.data.recordType,payload:JSON.parse(r.data.payloadJson)})).sort((a,b)=>a.key.localeCompare(b.key));
  need(store.total===3&&records?.length===3&&same(parsed(records),parsed(oldRecords))&&same(records.map(x=>x.key).sort(),[...REMOTE_KEYS,SENTINEL].sort()),'MAKE_KEYS_EXACT_NO_ACK');
  receipt.makeAdjudication={patchRequests:1,patchHttpStatus:404,applicationAck:false,writeExecutionId:WRITE_EXECUTION,activeExecutions:0,originalRunnerFinishedAt:raw.finishedAt,
    observedAt:make.observedAt,keysPendingDeletion:REMOTE_KEYS,sentinelPreserved:SENTINEL,makeMutationsByDriver:0};
  receipt.inputs={inventory:{path:inventoryFile.path,sha256:inventoryFile.sha256,digest:INVENTORY_DIGEST},baseline:{path:baselineFile.path,sha256:baselineFile.sha256,rawSha256:providerFile.sha256},
    make:{path:makeFile.path,sha256:makeFile.sha256,historySha256:historyFile.sha256},original};save();

  const req=createRequire(path.join(repo,'package.json'));need(JSON.parse(fs.readFileSync(path.join(repo,'node_modules/firebase-admin/package.json'))).version==='13.4.0','ADMIN_VERSION');
  const sdk=req('firebase-admin/app');deleteApp=sdk.deleteApp;app=sdk.initializeApp({credential:sdk.applicationDefault(),projectId:T.firebaseProject},'f3-cleanup-'+Date.now());
  const db=req('firebase-admin/firestore').getFirestore(app),auth=req('firebase-admin/auth').getAuth(app);need(db.projectId===T.firebaseProject,'DATABASE_PROJECT');
  const expected=new Map(inv.documents.map(x=>[x.path,x])),crossPaths=inv.crosswalks.map(x=>x.path).sort();
  function matchSnap(s,old){need(old&&s.exists&&same(ts(s.updateTime),old.updateTime)&&digest(s.data())===old.sha256,'DOCUMENT_CAS_DRIFT');}
  async function capture(){
    const found=new Map(),collections=new Map(),seen=new Set();
    async function walk(ref,depth=0){
      need(depth<=12&&seen.size<300,'BOUNDED_TREE');if(seen.has(ref.path))return;seen.add(ref.path);
      need(f3OwnedCleanupPath(ref.path,T.owner,[...commands]),'FOREIGN_DESCENDANT');
      const s=await ref.get(),cols=await ref.listCollections();
      need(expected.has(ref.path)||(!s.exists&&cols.length===0),'UNKNOWN_TREE');
      if(s.exists){matchSnap(s,expected.get(ref.path));found.set(ref.path,s);}
      for(const c of cols){const refs=await c.listDocuments();collections.set(c.path,refs.map(x=>x.path).sort());for(const child of refs)await walk(child,depth+1);}
    }
    for(const root of roots)await walk(db.doc(root));
    need(same([...found.keys()].sort(),[...expected.keys()].sort()),'MISSING_OR_EXTRA_DOCUMENT');
    const lock=await db.doc(lockPath).get();need(lock.exists===inv.lock.exists&&same(ts(lock.updateTime),inv.lock.updateTime)&&digest(lock.exists?lock.data():null)===inv.lock.sha256,'LOCK_CAS_DRIFT');
    f3AssertCleanupLock({current:lock.exists?lock.data():null,baseline:raw.scopeLockBaseline.data,owner:T.owner,reconcilePaths,receipts:[...found.values()].map(s=>({path:s.ref.path,data:s.data()}))});
    const ld=lock.exists?lock.data():null;need(ld===null||ld.status==='committed'&&Number.isFinite(ld.expiresAt)&&ld.expiresAt<=Date.now(),'SCOPE_LEASE');
    const head=found.get(ROOT+'/hrFieldHeads/'+raw.events[0].remoteHeadKey)?.data();need(head&&!head.leaseOwner&&head.leaseUntil===0&&head.pendingEventId===EVENT_ID,'FIELD_LEASE');
    for(const p of crossPaths){const ref=db.doc(p);need(!(await ref.get()).exists&&(await ref.listCollections()).length===0,'CROSSWALK_NOT_ABSENT');}
    return {found,collections,lock};
  }
  async function ownedAuth(actor){
    const u=await auth.getUser(actor.uid),old=inv.auth.find(x=>x.uid===actor.uid),email=actor.uid+'@cxorbia.invalid';
    need(u.uid===actor.uid&&same(u.customClaims,actor.claims)&&digest(u.customClaims)===old.claimsSha256&&u.displayName===actor.displayName&&u.disabled===false&&
      u.email===email&&sha(u.email)===old.emailSha256&&u.providerData.length===1&&u.providerData[0].providerId==='password'&&u.providerData[0].email===email&&u.providerData[0].uid===email&&
      u.metadata.creationTime===old.creationTime&&u.metadata.lastSignInTime===old.lastSignInTime&&u.tokensValidAfterTime===old.tokensValidAfterTime&&
      (actor.uid.endsWith('-admin')||f3RoleAuthOwned(u,actor,T.owner)),'AUTH_OWNER_OR_CHANGE');
    return {uid:u.uid,claims:u.customClaims,displayName:u.displayName,disabled:u.disabled,emailSha256:sha(u.email),providerIds:u.providerData.map(x=>x.providerId),
      creationTime:u.metadata.creationTime,lastSignInTime:u.metadata.lastSignInTime,tokensValidAfterTime:u.tokensValidAfterTime};
  }
  const before=await capture(),authBefore=[];for(const actor of actors)authBefore.push(await ownedAuth(actor));
  receipt.plan={documentCount:26,deletePaths:[...expected.keys()].sort(),lockPath,restoreLockBaseline:raw.scopeLockBaseline.data,
    authUids:actors.map(x=>x.uid),collections:[...before.collections].sort((a,b)=>a[0].localeCompare(b[0])),crosswalksMustRemainAbsent:crossPaths,authBefore};
  receipt.planDigest=digest(receipt.plan);receipt.decision=args.mode==='plan'?'PASS_PLAN_ONLY_NO_REMOTE_MUTATIONS':'READY_FOR_SEAL';save();
  if(args.mode==='execute'){
    await seal('before-delete',{schemaVersion:'cxorbia.f3.native-owned-cleanup-seal.v1',receipt,
      inventoryUtf8:inventoryFile.bytes.toString('utf8'),baselineUtf8:baselineFile.bytes.toString('utf8'),providerEvidenceUtf8:providerFile.bytes.toString('utf8'),
      makeUtf8:makeFile.bytes.toString('utf8'),historicalMakeUtf8:historyFile.bytes.toString('utf8'),originalRawSha256:rawFile.sha256,originalNativeEvidence:original});
    const again=await capture();need(same([...again.collections].sort(),[...before.collections].sort()),'TREE_CHANGED');
    for(const actor of actors)await ownedAuth(actor);
    need(fresh(make.observedAt)&&Object.values(baseline.freshCountries).every(x=>fresh(x.observedAt)),'PROOF_AGED_BEFORE_CAS');
    receipt.firestoreTransactionAttempted=true;receipt.firestoreCommitOutcome='UNCONFIRMED';save();
    await db.runTransaction(async tx=>{
      const refs=[...expected.keys()].sort().map(p=>db.doc(p)),snaps=await tx.getAll(...refs,db.doc(lockPath),...crossPaths.map(p=>db.doc(p)));
      for(let i=0;i<refs.length;i++)matchSnap(snaps[i],expected.get(refs[i].path));
      const lock=snaps[refs.length];need(lock.exists===before.lock.exists&&same(ts(lock.updateTime),ts(before.lock.updateTime))&&digest(lock.exists?lock.data():null)===inv.lock.sha256,'LOCK_TRANSACTION_CAS');
      need(snaps.slice(refs.length+1).every(x=>!x.exists),'CROSSWALK_TRANSACTION');
      // Query reads make new documents in known collections conflict with this transaction.
      for(const [collection,paths] of before.collections){const q=await tx.get(db.collection(collection));need(same(q.docs.map(x=>x.ref.path).sort(),paths),'COLLECTION_TRANSACTION_DRIFT');}
      const liveRows=snaps.slice(0,refs.length).map(s=>({path:s.ref.path,data:s.data()}));
      f3AssertCleanupLock({current:lock.exists?lock.data():null,baseline:raw.scopeLockBaseline.data,owner:T.owner,reconcilePaths,receipts:liveRows});
      const h=liveRows.find(x=>x.path===ROOT+'/hrFieldHeads/'+raw.events[0].remoteHeadKey)?.data;
      need(h&&!h.leaseOwner&&h.leaseUntil===0,'TRANSACTION_FIELD_LEASE');
      for(const ref of refs)tx.delete(ref);
      if(raw.scopeLockBaseline.data===null){if(lock.exists)tx.delete(db.doc(lockPath));}
      else tx.set(db.doc(lockPath),raw.scopeLockBaseline.data,{merge:false});
    },{maxAttempts:1});
    receipt.firestoreDeletes=26+(raw.scopeLockBaseline.data===null&&before.lock.exists?1:0);
    receipt.firestoreRestores=raw.scopeLockBaseline.data===null?0:1;receipt.firestoreTransactionCommitted=true;receipt.firestoreCommitOutcome='CONFIRMED';save();
    async function verifyAbsent(){
      for(const p of [...new Set([...roots,...expected.keys()])]){const ref=db.doc(p);need(!(await ref.get()).exists&&(await ref.listCollections()).length===0,'POST_DELETE_RESIDUAL');}
      const s=await db.doc(lockPath).get();need(s.exists===(raw.scopeLockBaseline.data!==null)&&same(s.exists?s.data():null,raw.scopeLockBaseline.data),'LOCK_RESTORE_READBACK');
      for(const p of crossPaths){const ref=db.doc(p);need(!(await ref.get()).exists&&(await ref.listCollections()).length===0,'POST_DELETE_CROSSWALK');}
    }
    await verifyAbsent();receipt.cleanup.firestore=true;receipt.decision='FIRESTORE_CLEAN_AUTH_PENDING';save();await seal('firestore-readback',receipt);
    for(const actor of actors){
      await ownedAuth(actor);await seal('before-auth-'+actor.uid.split('-').slice(-2).join('-'),{...receipt,nextOwnedAuthUid:actor.uid});
      // Firebase Auth exposes no compare-and-delete transaction. Recheck exact identity immediately before deletion.
      await ownedAuth(actor);await auth.deleteUser(actor.uid);receipt.authDeletes++;save();
      try{await auth.getUser(actor.uid);need(false,'AUTH_POST_DELETE_PRESENT');}catch(e){if(e.code!=='auth/user-not-found')throw e;}
      receipt.authAbsent=[...(receipt.authAbsent||[]),actor.uid];save();
    }
    await verifyAbsent();receipt.cleanup.auth=true;receipt.decision='PASS_FIRESTORE_AUTH_CLEANUP_MAKE_KEYS_PENDING';
    receipt.recoveryRequired=true;receipt.nextExactAction={owner:'ROOT_MAKE_CONNECTOR',dataStoreId:213856,deleteOnlyExactKeysAfterCurrentReadback:REMOTE_KEYS,
      sentinelMustRemain:SENTINEL,then:'Verify exactly sentinel remains and attach separate final cleanup receipt; original F3 remains FAIL.'};
    need(sha(fs.readFileSync(rawFile.path))===rawFile.sha256&&sha(fs.readFileSync(bundleFile.path))===bundleFile.sha256,'ORIGINAL_EVIDENCE_CHANGED');
    receipt.originalEvidenceUnchanged=true;receipt.finishedAt=new Date().toISOString();save();await seal('complete-firestore-auth',receipt);
  }
}catch(error){
  receipt.failure=safeError(error);process.exitCode=1;
  receipt.decision=receipt.firestoreTransactionCommitted?'HOLD_PARTIAL_OWNED_CLEANUP_PRESERVE_PROOF':
    receipt.firestoreTransactionAttempted?'HOLD_OWNED_CLEANUP_COMMIT_UNCONFIRMED':'HOLD_NO_CLEANUP_AUTHORITY';
  if(receipt.firestoreTransactionAttempted){
    receipt.recoveryRequired=true;receipt.requiresReadback=true;receipt.noAutomaticRetry=true;
    if(!receipt.firestoreTransactionCommitted){receipt.firestoreDeletes=null;receipt.firestoreRestores=null;}
    receipt.finishedAt=new Date().toISOString();save();
    try{await seal('interrupted',receipt);}catch(sealError){receipt.sealFailure=safeError(sealError);save();}
  }
}
finally{
  receipt.finishedAt=new Date().toISOString();save();if(app)await deleteApp(app).catch(()=>{});
  console.log(JSON.stringify({decision:receipt.decision,state:receipt.state,mode:receipt.mode,output:out,sha256:sha(fs.readFileSync(out)),firestoreDeletes:receipt.firestoreDeletes,
    firestoreRestores:receipt.firestoreRestores,authDeletes:receipt.authDeletes,hrWrites:0,makeWrites:0,applicationAckProven:false,cleanup:receipt.cleanup,
    seals:receipt.seals,failure:receipt.failure||null},null,2));
}
