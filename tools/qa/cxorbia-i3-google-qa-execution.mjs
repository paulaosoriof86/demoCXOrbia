import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const bucket = 'cxorbia-backend-dev_cloudbuild';
const repository = 'paulaosoriof86/demoCXOrbia';
const branch = 'recovery/cxorbia-phase-a-20260831';
const project = 'cxorbia-backend-dev';
const signer = 'firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com';
const sha = /^[a-f0-9]{40}$/;
const objectUri = /^gs:\/\/cxorbia-backend-dev_cloudbuild\/cxorbia-i3-qa\/([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})\/(start|result)\.json#([1-9]\d{7,19})$/;
const runnerFiles = ['tools/qa/cxorbia-i3-finance-ui-readonly.mjs','tools/qa/cxorbia-i3-google-qa-execution.mjs'];
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
  for(const file of runnerFiles){
    need(read('git',['hash-object',file]).trim()===read('git',['rev-parse',start.transportSha+':'+file]).trim(),'GOOGLE_QA_TRANSPORT_BLOB');
  }
  return start;
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
    bundleSha256:result.sha256,resultSha256:bundle.resultSha256};
  return {resultText,identityReadback:{entry:'identity-live-readback.json',resultUri:uri,bundleSha256:result.sha256,text:sealText},transport};
}
