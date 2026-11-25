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
const runnerFiles = ['tools/qa/cxorbia-i3-finance-ui-readonly.mjs','tools/qa/cxorbia-i3-google-qa-execution.mjs'];
export const academyJob='i3-run2382-academy-b7-isolated-dev-qa';
export const academyAbsenceScope='docs/checkpoints/CXORBIA_I3_D08_2783_ABSENCE_SCOPE_20261125.json';
const readCommand = (cmd,args) => execFileSync(cmd,args,{encoding:'utf8',timeout:45000,maxBuffer:3*1024*1024});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

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
