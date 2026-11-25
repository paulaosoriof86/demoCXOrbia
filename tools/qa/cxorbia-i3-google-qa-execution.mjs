import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const bucket = 'cxorbia-backend-dev_cloudbuild';
const repository = 'paulaosoriof86/demoCXOrbia';
const branch = 'recovery/cxorbia-phase-a-20260831';
const project = 'cxorbia-backend-dev';
const signer = 'firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com';
const sha = /^[a-f0-9]{40}$/;
const objectUri = /^gs:\/\/cxorbia-backend-dev_cloudbuild\/cxorbia-i3-qa\/([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})\/(start|result)\.json#([1-9]\d{7,19})$/;
const runnerFiles = ['tools/qa/cxorbia-i3-finance-ui-readonly.mjs','tools/qa/cxorbia-i3-google-qa-execution.mjs','tools/qa/cxorbia-i3-finance-ui-readonly-contract.mjs'];
export const academyJob='i3-run2382-academy-b7-isolated-dev-qa';
export const academyAbsenceScope='docs/checkpoints/CXORBIA_I3_D08_2783_ABSENCE_SCOPE_20261125.json';
const readCommand = (cmd,args) => execFileSync(cmd,args,{encoding:'utf8',timeout:45000,maxBuffer:3*1024*1024});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const verifiedPairedExecutions=new WeakSet();
export const isVerifiedGooglePairedExecution=value=>verifiedPairedExecutions.has(value);
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const deepFreeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
function nativeMd5(row){
 const keys=['file_hash','fileHash'].filter(k=>row[k]!==undefined);
 need(keys.length===1,'GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
 let value=row[keys[0]];
 for(let depth=0;depth<3;depth++){
  const entries=Array.isArray(value)?value:[value];need(entries.length===1,'GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
  const item=entries[0];need(item&&typeof item==='object','GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
  if(item.type!==undefined||item.value!==undefined){
   need(JSON.stringify(Object.keys(item).sort())===JSON.stringify(['type','value'])&&[2,'MD5'].includes(item.type)&&typeof item.value==='string','GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
   if(/^[a-f0-9]{32}$/.test(item.value))return item.value;
   const digest=/^[A-Za-z0-9+/]{32}$/.test(item.value)?Buffer.from(item.value,'base64').toString('utf8'):item.value;
   need(/^[A-Za-z0-9+/]{22}==$/.test(digest)&&Buffer.from(digest,'base64').length===16&&Buffer.from(digest,'base64').toString('base64')===digest,'GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
   return Buffer.from(digest,'base64').toString('hex');
  }
  const inner=['file_hash','fileHash'].filter(k=>item[k]!==undefined);
  need(inner.length===1&&Object.keys(item).length===1,'GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');value=item[inner[0]];
 }
 throw Error('SOURCE_FAILURE:GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
}
function executableStep(value){
 const fields=['name','args','env','id','dir','entrypoint','secretEnv','volumes','waitFor','timeout','script','automapSubstitutions','allowFailure','allowExitCodes'];
 const runtime=['timing','pullTiming','status','exitCode'];
 need(value&&Object.keys(value).every(k=>fields.includes(k)||runtime.includes(k)),'GOOGLE_PAIRED_NATIVE_STEP_CONFIG');
 need(typeof value.name==='string'&&value.name.length>0&&!value.allowFailure&&!value.allowExitCodes?.length&&!value.automapSubstitutions&&!value.secretEnv?.length&&!value.volumes?.length,'GOOGLE_PAIRED_NATIVE_STEP_CONFIG');
 return canonical(Object.fromEntries(fields.filter(k=>Object.hasOwn(value,k)&&value[k]!==false&&value[k]!==''&&!(Array.isArray(value[k])&&value[k].length===0)).map(k=>[k,value[k]])));
}

// Native Cloud Build transport for the SAME paired DEV evidence ZIP. No build,
// deploy, provider write, generated Actions ID or new certificate is produced.
// Expected pins are read from the immutable producer request by the consumer.
export function readGooglePairedArchive({buildId,location,expected},read=(cmd,args)=>execFileSync(cmd,args,{timeout:45000,maxBuffer:256*1024*1024})){
 const idPattern=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
 need(idPattern.test(buildId)&&/^[a-z][a-z0-9-]+$/.test(location),'GOOGLE_PAIRED_EXECUTION_ID');
 need(expected&&['controlSha','sourceSha','sourceTree','predecessorReceiptBlob'].every(k=>sha.test(expected[k]||''))&&
  /^docs\/checkpoints\/CXORBIA_I3_[A-Za-z0-9_-]+\.json$/.test(expected.predecessorReceiptPath||'')&&
  expected.request?.path==='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'&&expected.request?.field==='pendingDevSuccessor'&&sha.test(expected.request?.gitBlob||'')&&
  /^[a-f0-9]{64}$/.test(expected.request?.sha256||'')&&/^[A-Za-z0-9_-]+$/.test(expected.stepId||'')&&
  expected.workflow?.path==='.github/workflows/cxorbia-recovery-i3-dev-certification.yml'&&expected.workflow?.job==='vrm154-156-dev-materialization'&&sha.test(expected.workflow?.gitBlob||'')&&/^[a-f0-9]{64}$/.test(expected.workflow?.sha256||'')&&
  expected.step?.id===expected.stepId&&
  /^projects\/(?:cxorbia-backend-dev|\d+)\/serviceAccounts\/[A-Za-z0-9._-]+@(?:cxorbia-backend-dev\.iam\.gserviceaccount\.com|cloudbuild\.gserviceaccount\.com|developer\.gserviceaccount\.com)$/.test(expected.serviceAccount||''),'GOOGLE_PAIRED_EXPECTED_BINDING');
 need(['GITHUB_ACTIONS','GOOGLE_CLOUD_BUILD'].includes(expected.predecessorExecution?.provider)&&typeof expected.predecessorExecution?.runId==='string'&&expected.predecessorExecution.runId.length>0&&Number.isSafeInteger(expected.predecessorExecution.runAttempt)&&expected.predecessorExecution.runAttempt>0,'GOOGLE_PAIRED_PREDECESSOR_EXECUTION');
 const buildBytes=read('gcloud',['builds','describe',buildId,'--project='+project,'--region='+location,'--format=json']);
 const build=JSON.parse(String(buildBytes)),resource=build.name,idResource=`projects/${project}/locations/${location}/builds/${buildId}`;
 let projectNumberBinding={};
 if(resource!==idResource){
  const projectBytes=read('gcloud',['projects','describe',project,'--format=json']),projectMeta=JSON.parse(String(projectBytes));
  need(projectMeta.projectId===project&&/^[1-9]\d+$/.test(String(projectMeta.projectNumber))&&resource===`projects/${projectMeta.projectNumber}/locations/${location}/builds/${buildId}`,'GOOGLE_PAIRED_NATIVE_BUILD_RESOURCE');
  projectNumberBinding={projectNumber:String(projectMeta.projectNumber),projectMetadataSha256:hash(projectBytes)};
 }
 need(build.id===buildId&&build.projectId===project&&build.status==='SUCCESS'&&build.serviceAccount===expected.serviceAccount,'GOOGLE_PAIRED_NATIVE_BUILD');
 const started=Date.parse(build.startTime),ended=Date.parse(build.finishTime);
 need(Number.isFinite(started)&&Number.isFinite(ended)&&ended>=started,'GOOGLE_PAIRED_NATIVE_WINDOW');
 const steps=(build.steps||[]).filter(x=>x.id===expected.stepId),step=steps[0];
 need(build.steps.length===1&&steps.length===1&&step.status==='SUCCESS'&&(step.exitCode===undefined||step.exitCode===0)&&Date.parse(step.timing?.startTime)>=started&&Date.parse(step.timing?.endTime)<=ended&&Date.parse(step.timing?.endTime)>Date.parse(step.timing?.startTime),'GOOGLE_PAIRED_NATIVE_STEP');
 need(JSON.stringify(executableStep(step))===JSON.stringify(executableStep(expected.step))&&!build.options?.env?.length&&!build.options?.secretEnv?.length&&!build.options?.volumes?.length&&!build.options?.automapSubstitutions&&!build.options?.dynamicSubstitutions&&!build.options?.pool?.name&&!build.secrets?.length&&!build.availableSecrets,'GOOGLE_PAIRED_NATIVE_STEP_CONFIG');
 const substitutions={_CXORBIA_SCOPE:'I3_PAIRED_DEV',_CXORBIA_CONTROL_SHA:expected.controlSha,_CXORBIA_SOURCE_SHA:expected.sourceSha,_CXORBIA_SOURCE_TREE:expected.sourceTree,_CXORBIA_REQUEST_BLOB:expected.request.gitBlob,_CXORBIA_PREDECESSOR_BLOB:expected.predecessorReceiptBlob};
 need(Object.entries(substitutions).every(([k,v])=>build.substitutions?.[k]===v),'GOOGLE_PAIRED_NATIVE_SCOPE');
 const object=(pin,{withinBuild=false,source=false}={})=>{
  need(pin&&pin.bucket===bucket&&typeof pin.name==='string'&&!pin.name.startsWith('/')&&!pin.name.split('/').includes('..')&&!/[#?\\\r\n]/.test(pin.name)&&/^[1-9]\d{7,19}$/.test(String(pin.generation))&&Number.isSafeInteger(Number(pin.size))&&Number(pin.size)>0&&Number(pin.size)<=256*1024*1024&&/^[a-f0-9]{64}$/.test(pin.sha256||''),'GOOGLE_PAIRED_OBJECT_PIN');
  const uri=`gs://${pin.bucket}/${pin.name}#${pin.generation}`,metaBytes=read('gcloud',['storage','objects','describe',uri,'--raw','--format=json']),meta=JSON.parse(String(metaBytes));
  need(meta.bucket===pin.bucket&&meta.name===pin.name&&String(meta.generation)===String(pin.generation)&&Number(meta.size)===Number(pin.size),'GOOGLE_PAIRED_OBJECT_METADATA');
  const created=Date.parse(meta.timeCreated);
  need(Number.isFinite(created)&&(!withinBuild||(created>=started&&created<=ended+60000))&&(!source||created<=started),'GOOGLE_PAIRED_OBJECT_WINDOW');
  const bytes=read('gcloud',['storage','cat',uri]);
  need(Buffer.byteLength(bytes)===Number(pin.size)&&hash(bytes)===pin.sha256,'GOOGLE_PAIRED_OBJECT_BYTES');
  return {bytes,uri,meta,pin:{...pin,generation:String(pin.generation),size:Number(pin.size)}};
 };
 const resolved=build.sourceProvenance?.resolvedStorageSource;
 need(resolved&&resolved.bucket===expected.sourceObject?.bucket&&resolved.object===expected.sourceObject?.name&&String(resolved.generation)===String(expected.sourceObject?.generation),'GOOGLE_PAIRED_RESOLVED_SOURCE');
 const source=object(expected.sourceObject,{source:true}),archive=object(expected.evidenceObject,{withinBuild:true});
 const manifestBase=build.results?.artifactManifest;
 need(typeof manifestBase==='string'&&manifestBase.startsWith('gs://'+bucket+'/')&&manifestBase.split('#')[0].endsWith('/artifacts-'+buildId+'.json'),'GOOGLE_PAIRED_NATIVE_MANIFEST');
 const manifestGeneration=manifestBase.split('#')[1];
 need(manifestBase.split('#').length<=2&&(!manifestGeneration||/^[1-9]\d{7,19}$/.test(manifestGeneration)),'GOOGLE_PAIRED_NATIVE_MANIFEST');
 const manifestMeta=JSON.parse(String(read('gcloud',['storage','objects','describe',manifestBase,'--raw','--format=json'])));
 need(manifestMeta.bucket===bucket&&manifestBase.split('#')[0]==='gs://'+bucket+'/'+manifestMeta.name&&/^[1-9]\d{7,19}$/.test(String(manifestMeta.generation))&&(!manifestGeneration||manifestGeneration===String(manifestMeta.generation))&&Date.parse(manifestMeta.timeCreated)>=started&&Date.parse(manifestMeta.timeCreated)<=ended+60000,'GOOGLE_PAIRED_MANIFEST_METADATA');
 const manifestUri=manifestBase.split('#')[0]+'#'+manifestMeta.generation,manifestBytes=read('gcloud',['storage','cat',manifestUri]);
 need(Number.isSafeInteger(Number(manifestMeta.size))&&Number(manifestMeta.size)>0&&Number(manifestMeta.size)===Buffer.byteLength(manifestBytes),'GOOGLE_PAIRED_MANIFEST_BYTES');
 const manifestText=String(manifestBytes).trim();
 let manifest;try{manifest=JSON.parse(manifestText);if(!Array.isArray(manifest))manifest=[manifest];}catch{manifest=manifestText.split('\n').filter(Boolean).map(x=>JSON.parse(x));}
 const uploaded=manifest.filter(x=>x.location===archive.uri);
 need(uploaded.length===1,'GOOGLE_PAIRED_ARCHIVE_NOT_NATIVE_ARTIFACT');
 need(nativeMd5(uploaded[0])===createHash('md5').update(archive.bytes).digest('hex'),'GOOGLE_PAIRED_NATIVE_ARTIFACT_HASH');
 const logs=read('gcloud',['builds','log',buildId,'--project='+project,'--region='+location]);
 need(Buffer.byteLength(logs)>0,'GOOGLE_PAIRED_NATIVE_LOGS_EMPTY');
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-google-paired-')),zip=path.join(folder,'evidence.zip'),out=path.join(folder,'entries');
 try{
  fs.writeFileSync(zip,archive.bytes);fs.mkdirSync(out);
  execFileSync('python3',['-c',`import pathlib,stat,sys,zipfile
z=zipfile.ZipFile(sys.argv[1]);root=pathlib.Path(sys.argv[2]);seen=set();total=0
for i in z.infolist():
 p=pathlib.PurePosixPath(i.filename)
 if p.is_absolute() or '..' in p.parts or ':' in i.filename or '\\\\' in i.filename or i.filename in seen or stat.S_ISLNK(i.external_attr>>16): raise RuntimeError('SOURCE_FAILURE:GOOGLE_PAIRED_UNSAFE_ZIP')
 seen.add(i.filename);total+=i.file_size
 if total>128*1024*1024: raise RuntimeError('SOURCE_FAILURE:GOOGLE_PAIRED_ZIP_LIMIT')
 if i.filename.endswith('.json') and not i.is_dir():
  dst=root/i.filename;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(z.read(i))
`,zip,out],{stdio:['ignore','pipe','pipe'],timeout:45000});
  const externalExecution=deepFreeze({executionProvider:'GOOGLE_CLOUD_BUILD',runId:buildId,runAttempt:1,runNumber:null,project,...projectNumberBinding,location,resourceName:resource,serviceAccount:build.serviceAccount,stepId:step.id,jobConclusion:'success',workflow:structuredClone(expected.workflow),nativeStepSha256:hash(JSON.stringify(executableStep(step))),producerControlHead:expected.controlSha,sourceSha:expected.sourceSha,sourceTree:expected.sourceTree,request:structuredClone(expected.request),predecessorReceiptPath:expected.predecessorReceiptPath,predecessorReceiptBlob:expected.predecessorReceiptBlob,predecessorExecution:structuredClone(expected.predecessorExecution),startedAt:build.startTime,completedAt:build.finishTime,buildMetadataSha256:hash(buildBytes),nativeLogsSha256:hash(logs),sourceObject:{...source.pin,uri:source.uri},evidenceObject:{...archive.pin,uri:archive.uri},artifactManifest:{uri:manifestUri,sha256:hash(manifestBytes)},artifactDigest:'sha256:'+archive.pin.sha256,nativeBuildVerified:true,scope:'I3_PAIRED_DEV',production:false});
  verifiedPairedExecutions.add(externalExecution);
  return {folder:out,digest:externalExecution.artifactDigest,externalExecution,cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})};
 }catch(error){fs.rmSync(folder,{recursive:true,force:true});throw error;}
}

function need(condition,code){
  if(!condition)throw Error('SOURCE_FAILURE:'+code);
}
function readObject(uri,kind,read){
  const match=objectUri.exec(uri);
  need(match&&match[2]===kind,'GOOGLE_QA_OBJECT_URI');
  const name='cxorbia-i3-qa/'+match[1]+'/'+kind+'.json';
  const meta=JSON.parse(read('gcloud',['storage','objects','describe',uri,'--raw','--format=json']));
  need(meta.bucket===bucket&&meta.name===name&&String(meta.generation)===match[3]&&meta.timeCreated,'GOOGLE_QA_OBJECT_IDENTITY');
  const bytes=read('gcloud',['storage','cat',uri]);
  return {contents:JSON.parse(bytes),sha256:hash(bytes),id:match[1],generation:match[3]};
}
function verifyStart(uri,job,sourceSha,sourceTree,controlSha,read){
  const marker=readObject(uri,'start',read);
  const start=marker.contents;
  need(start.schemaVersion==='cxorbia.i3.google-qa-start.v1'&&start.provider==='GOOGLE_CLOUD_SHELL'&&
    start.project===project&&start.repository===repository&&start.branch===branch&&start.job===job&&
    start.attempt===1&&start.production===false&&sha.test(sourceSha)&&sha.test(sourceTree)&&sha.test(controlSha)&&
    start.sourceSha===sourceSha&&start.sourceTree===sourceTree&&start.controlSha===controlSha&&sha.test(start.transportSha)&&
    sourceTree===read('git',['rev-parse',sourceSha+'^{tree}']).trim(),'GOOGLE_QA_PRODUCER_SCOPE');
  return {provider:start.provider,startUri:uri,startGeneration:marker.generation,startSha256:marker.sha256,
    job,controlSha,transportSha:start.transportSha,branch,repository,signer,runId:marker.generation,runAttempt:'1'};
}
export function readGoogleQaExecution(env,job,sourceSha,sourceTree,read=readCommand){
  if(!env.CXORBIA_GOOGLE_QA_START)return null;
  need(!env.GITHUB_RUN_ID&&!env.GITHUB_ACTIONS,'AMBIGUOUS_GOOGLE_QA_EXECUTION');
  const control=read('git',['rev-parse','HEAD']).trim();
  const start=verifyStart(env.CXORBIA_GOOGLE_QA_START,job,sourceSha,sourceTree,control,read);
  const files=job===academyJob?['tools/qa/cxorbia-i3-run2382-academy-b7-synthetic-live.mjs',runnerFiles[1],academyAbsenceScope]:runnerFiles;
  need(job===academyJob||job==='i3-finance-focal-reproof','GOOGLE_QA_UNREGISTERED_JOB');
  for(const file of files){
    need(read('git',['hash-object',file]).trim()===read('git',['rev-parse',start.transportSha+':'+file]).trim(),'GOOGLE_QA_TRANSPORT_BLOB');
  }
  return start;
}

function readEncryptedPdfEvidence(bundle,raw,id,read){
  const wanted=raw.failurePdf?.privateEvidence,refs=bundle.encryptedPdfObjects;
  if(!wanted)return {status:'NOT_REQUESTED',objects:[]};
  const entry=typeof wanted.entry==='string'&&/^private-session-[01]-(?:movements|dashboard)-pdf\.envelope\.json$/.test(wanted.entry)?wanted.entry:null;
  const expectedHash=typeof wanted.sha256==='string'&&/^[a-f0-9]{64}$/.test(wanted.sha256)?wanted.sha256:null;
  if(!entry||!expectedHash)return {status:'HOLD_INVALID_REFERENCE',objects:[],failureCode:'SOURCE_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_REFERENCE'};
  if(!Array.isArray(refs))return {status:'HOLD_LEGACY_REFERENCE_UNBOUND',objects:[],failureCode:'SOURCE_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_GENERATION_MISSING'};
  const ref=refs.find(x=>x?.entry===entry);
  if(refs.length!==1||!ref)return {status:'HOLD_NOT_ARCHIVED',objects:[],failureCode:'PROVIDER_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_ARCHIVE'};
  const item={entry,sha256:expectedHash,verified:false};
  try{
    const prefix='gs://'+bucket+'/cxorbia-i3-qa/'+id+'/'+entry+'#';
    need(typeof ref.uri==='string'&&ref.uri.startsWith(prefix)&&/^[1-9]\d{7,19}$/.test(ref.uri.slice(prefix.length))&&
      ref.generation===ref.uri.slice(prefix.length)&&ref.sha256===expectedHash,'GOOGLE_FINANCE_PRIVATE_EVIDENCE_BINDING');
    item.uri=ref.uri;item.generation=ref.generation;
    const meta=JSON.parse(read('gcloud',['storage','objects','describe',ref.uri,'--raw','--format=json']));
    need(meta.bucket===bucket&&meta.name==='cxorbia-i3-qa/'+id+'/'+entry&&String(meta.generation)===ref.generation&&meta.timeCreated,
      'GOOGLE_FINANCE_PRIVATE_EVIDENCE_OBJECT');
    const bytes=read('gcloud',['storage','cat',ref.uri]);
    need(hash(bytes)===expectedHash,'GOOGLE_FINANCE_PRIVATE_EVIDENCE_HASH');
    const envelope=JSON.parse(bytes);
    need(wanted.encrypted===true&&wanted.algorithm==='RSA-OAEP-SHA256+AES-256-GCM'&&envelope.version===1&&envelope.algorithm===wanted.algorithm&&
      envelope.plainSha256===wanted.plainSha256&&/^[a-f0-9]{64}$/.test(String(envelope.plainSha256))&&
      ['key','iv','tag','ciphertext'].every(k=>typeof envelope[k]==='string'&&envelope[k].length>0),'GOOGLE_FINANCE_PRIVATE_EVIDENCE_ENVELOPE');
    item.verified=true;return {status:'VERIFIED',objects:[item]};
  }catch(error){
    const code=String(error?.message||'');item.failureCode=/^SOURCE_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_[A-Z_]+$/.test(code)?code:'PROVIDER_FAILURE:GOOGLE_FINANCE_PRIVATE_EVIDENCE_READBACK';
    return {status:'HOLD_READBACK_UNCONFIRMED',objects:[item],failureCode:item.failureCode};
  }
}

// Read both object generations independently. The caller supplies the approved
// producer and transport commits, and the materialization from the live controls.
export function readGoogleFinanceResult(uri,expected,read=readCommand){
  const result=readObject(uri,'result',read);
  const bundle=result.contents;
  const job='i3-finance-focal-reproof';
  need(bundle.schemaVersion==='cxorbia.i3.google-finance-result.v1'&&Number.isSafeInteger(bundle.exitCode)&&
    bundle.exitCode>=0&&bundle.exitCode<=255,'GOOGLE_QA_RESULT_SCHEMA');
  const start=verifyStart(bundle.startUri,job,expected.sourceSha,expected.sourceTree,expected.controlSha,read);
  need(objectUri.exec(start.startUri)[1]===result.id&&expected.transportSha===start.transportSha,'GOOGLE_QA_RESULT_PRODUCER');
  const resultText=bundle.resultText,sealText=bundle.identityReadbackText;
  need(typeof resultText==='string'&&Buffer.byteLength(resultText)<=2*1024*1024&&hash(resultText)===bundle.resultSha256,'GOOGLE_QA_RESULT_HASH');
  need(typeof sealText==='string'&&Buffer.byteLength(sealText)<=65536&&hash(sealText)===bundle.sealSha256,'GOOGLE_QA_SEAL_HASH');
  const raw=JSON.parse(resultText);
  need(raw.schemaVersion==='cxorbia.i3.finance-core-ui-readonly.v1'&&raw.controlSha===start.controlSha&&
    raw.sourceSha===expected.sourceSha&&raw.sourceTree===expected.sourceTree&&
    raw.externalExecution&&Object.entries(start).every(([k,v])=>raw.externalExecution[k]===v),'GOOGLE_QA_RESULT_IDENTITY');
  const transport={...start,provider:start.provider,jobName:job,jobConclusion:bundle.exitCode===0?'success':'failure',
    controlHead:start.controlSha,entry:'finance-ui-readonly.json',resultUri:uri,resultGeneration:result.generation,
     bundleSha256:result.sha256,resultSha256:bundle.resultSha256,encryptedPdfEvidence:readEncryptedPdfEvidence(bundle,raw,result.id,read)};
  return {resultText,identityReadback:{entry:'identity-live-readback.json',resultUri:uri,bundleSha256:result.sha256,text:sealText},transport};
}


function readAcademyArchive(uri,digest){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-d08-readback-'));
  try{
    const zip=path.join(dir,'evidence.zip');
    execFileSync('gcloud',['storage','cp',uri,zip],{stdio:'pipe',timeout:120000});
    need(hash(fs.readFileSync(zip))===digest,'GOOGLE_D08_ARCHIVE_HASH');
    const names=execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n');
    need(names.filter(n=>n==='result.json').length===1&&new Set(names).size===names.length&&
      names.every(n=>n==='result.json'||/^[\w-]+\.png$/.test(n)),'GOOGLE_D08_ARCHIVE_ENTRIES');
    const text=execFileSync('unzip',['-p',zip,'result.json'],{encoding:'utf8',maxBuffer:8*1024*1024});
    for(const row of JSON.parse(text).visualCaptureJournal||[]){
      if(row.state!=='FULFILLED')continue;
      need(names.includes(row.path)&&/^[\w-]+\.png$/.test(row.path),'GOOGLE_D08_CAPTURE_ENTRY');
      const png=execFileSync('unzip',['-p',zip,row.path],{maxBuffer:16*1024*1024});
      need(hash(png)===row.imageSha256,'GOOGLE_D08_CAPTURE_HASH');
    }
    return text;
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}

export function readGoogleAcademyResult(uri,expected,read=readCommand,readArchive=readAcademyArchive){
  const result=readObject(uri,'result',read),bundle=result.contents;
  need(bundle.schemaVersion==='cxorbia.i3.google-d08-result.v1'&&Number.isInteger(bundle.exitCode)&&bundle.exitCode>=0&&bundle.exitCode<=255,'GOOGLE_D08_RESULT_SCHEMA');
  const start=verifyStart(bundle.startUri,academyJob,expected.sourceSha,expected.sourceTree,expected.controlSha,read);
  need(objectUri.exec(start.startUri)[1]===result.id&&expected.transportSha===start.transportSha,'GOOGLE_D08_RESULT_PRODUCER');
  const prefix='gs://'+bucket+'/cxorbia-i3-qa/'+result.id+'/evidence.zip#';
  need(typeof bundle.archiveUri==='string'&&bundle.archiveUri.startsWith(prefix)&&/^[1-9]\d{7,19}$/.test(bundle.archiveUri.slice(prefix.length))&&
    /^[a-f0-9]{64}$/.test(bundle.archiveSha256),'GOOGLE_D08_ARCHIVE_BINDING');
  const text=readArchive(bundle.archiveUri,bundle.archiveSha256),raw=JSON.parse(text);
  need(hash(text)===bundle.resultSha256&&raw.schemaVersion==='cxorbia.i3.d08-ui-provider-new-session.v1'&&raw.production===false&&
    Object.entries(start).every(([k,v])=>raw.externalExecution?.[k]===v)&&raw.runId===start.runId&&raw.runAttempt===start.runAttempt&&
    raw.controlSha===start.controlSha&&['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].every(k=>raw[k]===expected[k]),'GOOGLE_D08_RESULT_IDENTITY');
  const transport={...start,resultRef:bundle.archiveUri,resultUri:uri,resultGeneration:result.generation,bundleSha256:result.sha256,
    archiveUri:bundle.archiveUri,archiveSha256:bundle.archiveSha256,archiveVerified:true,entry:'result.json',resultSha256:bundle.resultSha256,
    jobName:academyJob,jobConclusion:bundle.exitCode===0?'success':'failure',controlHead:start.controlSha};
  return {text,transport};
}
