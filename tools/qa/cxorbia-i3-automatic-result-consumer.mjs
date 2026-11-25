import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {DESCRIPTOR,POINTER,jsonBytes,gitBlob,sha256,makeMaterializationReceipt,projectMaterialization,bindControlPaths} from './cxorbia-i3-current-control-projection.mjs';
import {validateCurrentAuthorityAliases} from './cxorbia-i3-current-authority-alias-guard.mjs';
import {normalizeD08Result,D08_ASSET_PATHS} from './cxorbia-i3-d08-result-normalizer.mjs';
import {summarizeTypedResult,safeTypedFailureCode} from './cxorbia-i3-typed-result-summary.mjs';

const REPO='paulaosoriof86/demoCXOrbia',BRANCH='recovery/cxorbia-phase-a-20260831';
const WORKFLOW='cxorbia-recovery-i3-dev-certification.yml';
const SELF='continuity-result-consumer',PRODUCER='vrm154-156-dev-materialization';
const must=(ok,code)=>{if(!ok)throw new Error(code);};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const git=(...args)=>execFileSync('git',args,{maxBuffer:20*1024*1024,encoding:'utf8'}).trim();

export function createApi({token,fetchImpl=fetch}){
 must(Boolean(token),'AUTH_FAILURE:RESULT_CONSUMER_TOKEN_REQUIRED');
 return async function api(route,body,method=body===undefined?'GET':'POST'){
  must(route.startsWith(`/repos/${REPO}/`),'AUTH_FAILURE:REPOSITORY_SCOPE');
  const response=await fetchImpl('https://api.github.com'+route,{method,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
  if(!response.ok)throw new Error(`PROVIDER_FAILURE:GITHUB_${response.status}:${route.split('?')[0]}`);
  return response.json();
 };
}

async function pages(api,route,key){let rows=[];for(let page=1;page<=100;page++){
 const data=await api(route+(route.includes('?')?'&':'?')+`per_page=100&page=${page}`);
 const batch=data[key]||[];rows.push(...batch);if(batch.length<100)return rows;
 }throw new Error('PROVIDER_FAILURE:GITHUB_PAGINATION_LIMIT');}

export function validateZipListing(entries){
 must(entries.length>0&&entries.length<=2000,'SOURCE_FAILURE:ARTIFACT_FILE_COUNT');
 for(const entry of entries)must(entry&&!entry.startsWith('/')&&!entry.includes('\\')&&!entry.split('/').includes('..')&&!/^[A-Za-z]:/.test(entry)&&!/[\0\r\n]/.test(entry),'SOURCE_FAILURE:UNSAFE_ARTIFACT_PATH');
 must(new Set(entries).size===entries.length,'SOURCE_FAILURE:DUPLICATE_ZIP_ENTRY');
}

export async function downloadArtifact(api,artifact,token){
 const url=`https://api.github.com/repos/${REPO}/actions/artifacts/${artifact.id}/zip`;
 const redirect=await fetch(url,{redirect:'manual',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'}});
 must([302,200].includes(redirect.status),'PROVIDER_FAILURE:ARTIFACT_DOWNLOAD');
 let response=redirect;
 if(redirect.status===302){const target=new URL(redirect.headers.get('location'));must(target.protocol==='https:','PROVIDER_FAILURE:ARTIFACT_REDIRECT');response=await fetch(target,{redirect:'error'});}
 must(response.ok,'PROVIDER_FAILURE:ARTIFACT_DOWNLOAD_REDIRECT');
 const bytes=Buffer.from(await response.arrayBuffer());must(bytes.length<100*1024*1024,'SOURCE_FAILURE:ARTIFACT_TOO_LARGE');
 const digest='sha256:'+sha256(bytes);must(digest===artifact.digest,'SOURCE_FAILURE:ARTIFACT_DIGEST');
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-receipt-')),zip=path.join(folder,'evidence.zip'),out=path.join(folder,'data');fs.writeFileSync(zip,bytes);fs.mkdirSync(out);
 const names=execFileSync('unzip',['-Z1',zip],{encoding:'utf8',maxBuffer:2*1024*1024}).trim().split('\n');validateZipListing(names);
 // Extract only JSON evidence with Python's explicit regular-file checks. No shell evaluation or ZIP symlinks.
 execFileSync('python3',['-c',`import sys,zipfile,pathlib,stat
z=zipfile.ZipFile(sys.argv[1]); root=pathlib.Path(sys.argv[2]); total=0
for i in z.infolist():
 total+=i.file_size
 if total>200*1024*1024: raise RuntimeError('ZIP_EXPANDED_SIZE')
 if stat.S_ISLNK(i.external_attr>>16): raise RuntimeError('ZIP_SYMLINK')
 if i.filename.endswith('.json') and not i.is_dir():
  p=root/i.filename;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(i))
`,zip,out],{stdio:['ignore','pipe','pipe']});
 return {folder:out,digest,cleanup:()=>fs.rmSync(folder,{recursive:true,force:true})};
}

export function requiredPairedAssets(script){const list=script.match(/'PAIR_ASSET_FILES=([^']+)'/);must(Boolean(list),'SOURCE_FAILURE:PAIRED_ASSET_CONTRACT');return list[1].split(/\s+/);}
function sourceAssetHashes(result,controlHead){
 const required=requiredPairedAssets(git('show',`${controlHead}:tools/qa/cxorbia-i3-paired-source-checks.sh`));
 return Object.fromEntries(required.map(p=>{
  must(!p.startsWith('/')&&!p.split('/').includes('..'),'SOURCE_FAILURE:ASSET_PATH');
  const bytes=execFileSync('git',['show',`${result.sourceSha}:app/${p}`],{maxBuffer:20*1024*1024});return [p,sha256(bytes)];
 }));
}

export function selectPairedArtifact({run,job,artifacts}){
 const names=[`cxorbia-vrm154-156-dev-materialization-${run.id}-${run.run_attempt}`];
 if(run.run_attempt===1)names.push(`cxorbia-vrm154-156-dev-materialization-${run.id}`);
 const matches=artifacts.filter(a=>names.includes(a.name)&&a.workflow_run?.id===run.id&&a.workflow_run?.head_sha===run.head_sha&&!a.expired&&Date.parse(a.created_at)>=Date.parse(job.started_at)&&Date.parse(a.created_at)<=Date.parse(job.completed_at)+60000);
 must(matches.length===1,'SOURCE_FAILURE:PAIRED_ARTIFACT_MISSING_OR_AMBIGUOUS');return matches[0];
}

export const TYPED_JOBS={
 'i3-b14-qa-provider-proof':{prefix:'cxorbia-i3-b14-qa-provider',entries:['receipt.json','f3-run2782-recovery.json']},
 'i3-keeper-role-e2e-readonly':{prefix:'cxorbia-i3-two-keepers-role-e2e-readonly',entries:['result.json']},
 'i3-finance-focal-reproof':{prefix:'cxorbia-i3-finance-focal',entries:['finance-metadata.json','finance-readonly.json','finance-ui-readonly.json']},
 'i3-run2382-academy-b7-isolated-dev-qa':{prefix:'cxorbia-i3-run2382-academy-b7-synthetic',entries:['result.json','d08-recovery/result.json']}
};
export function selectTypedArtifact({run,job,artifacts}){
 const rule=TYPED_JOBS[job.name];must(rule,'MAPPING_FAILURE:TYPED_PRODUCER_UNSUPPORTED');
 // Existing focal producers retain the legacy name on reruns. The exact job
 // attempt window and immutable artifact digest bind either naming convention.
 const names=[`${rule.prefix}-${run.id}-${run.run_attempt}`,`${rule.prefix}-${run.id}`];
 const found=artifacts.filter(a=>names.includes(a.name)&&a.workflow_run?.id===run.id&&a.workflow_run?.head_sha===run.head_sha&&!a.expired&&
  Date.parse(a.created_at)>=Date.parse(job.started_at)&&Date.parse(a.created_at)<=Date.parse(job.completed_at)+60000);
 must(found.length===1,'SOURCE_FAILURE:TYPED_ARTIFACT_MISSING_OR_AMBIGUOUS');return found[0];
}
export const typedResultKey=x=>`${x.runId}/${x.runAttempt}/${x.jobId}`;
export function pendingTypedRuns(queue=[]){return [...new Map(queue.filter(x=>TYPED_JOBS[x.name]).map(x=>[`${x.runId}/${x.runAttempt}`,{runId:Number(x.runId),runAttempt:Number(x.runAttempt)}])).values()];}

const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export function pendingSatisfiedRequestRuns(controls){
 const request=controls.pointer.currentD08UiQaRequest;
 if(!request)return [];
 return [...new Map((controls.pointer.currentFunctionalEvidenceIndex?.results||[])
  .filter(x=>(x.decision==='PASS_D08_TYPED_PARTIAL_INCORPORATION'||x.kind==='D08_RECOVERY'&&x.producerDecision==='PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP')&&(!x.requestBinding||(x.requestBinding.path===request.path&&x.requestBinding.gitBlob===request.gitBlob)))
  .map(x=>[`${x.runId}/${x.runAttempt}`,{runId:Number(x.runId),runAttempt:Number(x.runAttempt)}])).values()];
}

// The producer commit retains its immutable request. Only the exact satisfied
// active request is retired; a late result cannot remove a newer request.
export async function retireSatisfiedD08Request({result,entry,producer,controls,files}){
 if(result.schemaVersion!=='cxorbia.i3.d08-typed-incorporation.v1'||result.decision!=='PASS_D08_TYPED_PARTIAL_INCORPORATION')return false;
 must(result.focalObligationCount===25&&result.ownerSpecificReceipts?.length===3&&result.fullDomain===false&&result.newDomainMatches===0&&result.production===false,'MAPPING_FAILURE:D08_REQUEST_CREDIT_BOUNDARY');
 const request=producer.pointer.currentD08UiQaRequest;
 must(request?.path&&request.gitBlob===producer.blobs.get(request.path)&&JSON.stringify(request)===JSON.stringify(producer.descriptor.currentD08UiQaRequest),'SOURCE_FAILURE:D08_REQUEST_PRODUCER_BINDING');
 const bytes=await producer.readBytes(request.path),body=JSON.parse(bytes),digest=sha256(JSON.stringify(canonical(body)));
 must(gitBlob(bytes)===request.gitBlob&&digest===result.evidence?.requestCanonicalSha256,'SOURCE_FAILURE:D08_REQUEST_RECEIPT_BINDING');
 const binding={path:request.path,gitBlob:request.gitBlob,canonicalSha256:digest};
 if(entry.requestBinding)must(JSON.stringify(entry.requestBinding)===JSON.stringify(binding),'SOURCE_FAILURE:D08_INDEX_REQUEST_BINDING');
 const bindingChanged=!entry.requestBinding;
 const active=Object.fromEntries([[DESCRIPTOR,'descriptor'],[POINTER,'pointer']].map(([file,key])=>[key,files.has(file)?JSON.parse(files.get(file)):structuredClone(controls[key])]));
 const current=active.pointer.currentD08UiQaRequest;
 must(JSON.stringify(current||null)===JSON.stringify(active.descriptor.currentD08UiQaRequest||null),'MAPPING_FAILURE:D08_ACTIVE_REQUEST_DESYNC');
 if(!current||current.path!==request.path||current.gitBlob!==request.gitBlob){entry.requestBinding=binding;return bindingChanged;}
 const archivePath=`docs/checkpoints/CXORBIA_I3_RUN${entry.runId}_ATTEMPT${entry.runAttempt}_JOB${entry.jobId}_SATISFIED_D08_REQUEST.json`;
 const archive={schemaVersion:'cxorbia.i3.satisfied-d08-request.v1',requestBinding:binding,typedReceipt:{path:entry.path,gitBlob:entry.gitBlob,sha256:entry.sha256},controls:{},production:false,newDomainMatches:0,fullDomain:false};
 const provedResiduals=new Set(['Current Admin, Shopper and Cliente independent UI/session acceptance','Authorized content edit/provider ACK for content, distinct from historical learner progress','Current command integration proof for owners changed since the historical provider run']);
 const updates=new Map();
 for(const [file,key]of [[DESCRIPTOR,'descriptor'],[POINTER,'pointer']]){
  const value=active[key],saved=archive.controls[key]={currentD08UiQaRequest:value.currentD08UiQaRequest};delete value.currentD08UiQaRequest;
  const residual=value.d08AcademyProgressResidual;
  if(residual){
   saved.d08AcademyProgressResidual=structuredClone(residual);
   for(const field of ['roleSessionsPending','currentReadOnlyUiObservation','currentUiCertified'])delete residual[field];
   if(Array.isArray(residual.remaining))residual.remaining=residual.remaining.filter(x=>!provedResiduals.has(x));
   residual.status='HISTORICAL_PROVIDER_PASS_PRESERVED_SCOPED_CURRENT_UI_CLAUSES_INDEXED';
  }
  updates.set(file,jsonBytes(value));
 }
 const archiveBytes=jsonBytes(archive);
 if(controls.blobs?.has(archivePath))must(controls.blobs.get(archivePath)===gitBlob(archiveBytes),'SOURCE_FAILURE:D08_SATISFIED_REQUEST_ARCHIVE_CHANGED');
 entry.requestBinding=binding;
 for(const [file,text]of updates)files.set(file,text);
 files.set(archivePath,archiveBytes);return true;
}

// Cleanup settles only its exact cleanup-only request. Functional D08 residuals
// remain untouched, and a late artifact cannot retire a newer request.
export async function retireSatisfiedD08RecoveryRequest({result,entry,producer,controls,files}){
 if(result.kind!=='D08_RECOVERY'||result.producer?.decision!=='PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP'||result.producer.jobConclusion!=='success')return false;
 const o=result.observations;
 must(result.state==='HOLD'&&result.newDomainMatches===0&&result.ownerSpecificReceipts?.length===0&&result.fullDomain===false&&result.phaseAComplete===false&&result.production===false&&o?.cleanup?.ok===true&&o.cleanup.remainingOwnedDocuments===0&&o.cleanup.remainingOwnedAuth===0&&o.firestoreTransactionConfirmed===true,'MAPPING_FAILURE:D08_RECOVERY_REQUEST_CREDIT_BOUNDARY');
 const request=producer.pointer.currentD08UiQaRequest;
 must(request?.path&&request.gitBlob===producer.blobs.get(request.path)&&JSON.stringify(request)===JSON.stringify(producer.descriptor.currentD08UiQaRequest),'SOURCE_FAILURE:D08_RECOVERY_REQUEST_PRODUCER_BINDING');
 const bytes=await producer.readBytes(request.path),body=JSON.parse(bytes),pin=body.recoveryRun2783;
 must(gitBlob(bytes)===request.gitBlob&&body.executionMode==='RECOVERY_ONLY'&&body.authorization==='PAULA_AUTHORIZED_D08_DEV_ONLY'&&body.production===false&&String(pin?.runId)===o.fixtureRunId&&String(pin.runAttempt)===o.fixtureRunAttempt&&pin.journalSha256===o.originalJournalSha256&&pin.expectedDocuments===18&&pin.expectedAuthUsers===4,'SOURCE_FAILURE:D08_RECOVERY_REQUEST_RECEIPT_BINDING');
 const binding={path:request.path,gitBlob:request.gitBlob,canonicalSha256:sha256(JSON.stringify(canonical(body)))};
 if(entry.requestBinding)must(JSON.stringify(entry.requestBinding)===JSON.stringify(binding),'SOURCE_FAILURE:D08_RECOVERY_INDEX_REQUEST_BINDING');
 const bindingChanged=!entry.requestBinding;
 const active=Object.fromEntries([[DESCRIPTOR,'descriptor'],[POINTER,'pointer']].map(([file,key])=>[key,files.has(file)?JSON.parse(files.get(file)):structuredClone(controls[key])]));
 const current=active.pointer.currentD08UiQaRequest;
 must(JSON.stringify(current||null)===JSON.stringify(active.descriptor.currentD08UiQaRequest||null),'MAPPING_FAILURE:D08_RECOVERY_ACTIVE_REQUEST_DESYNC');
 if(!current||current.path!==request.path||current.gitBlob!==request.gitBlob){entry.requestBinding=binding;return bindingChanged;}
 const archivePath=`docs/checkpoints/CXORBIA_I3_RUN${entry.runId}_ATTEMPT${entry.runAttempt}_JOB${entry.jobId}_SATISFIED_D08_RECOVERY_REQUEST.json`;
 const archive={schemaVersion:'cxorbia.i3.satisfied-d08-recovery-request.v1',requestBinding:binding,fixtureRunId:o.fixtureRunId,typedReceipt:{path:entry.path,gitBlob:entry.gitBlob,sha256:entry.sha256},controls:{},production:false,newDomainMatches:0,fullDomain:false};
 const updates=new Map();
 for(const [file,key]of [[DESCRIPTOR,'descriptor'],[POINTER,'pointer']]){const value=active[key];archive.controls[key]={currentD08UiQaRequest:value.currentD08UiQaRequest};delete value.currentD08UiQaRequest;updates.set(file,jsonBytes(value));}
 const archiveBytes=jsonBytes(archive);
 if(controls.blobs?.has(archivePath))must(controls.blobs.get(archivePath)===gitBlob(archiveBytes),'SOURCE_FAILURE:D08_RECOVERY_SATISFIED_ARCHIVE_CHANGED');
 entry.requestBinding=binding;for(const [file,text]of updates)files.set(file,text);files.set(archivePath,archiveBytes);return true;
}

async function normalizeD08Artifact({text,transport,producer}){
 const q=producer.pointer.currentD08UiQaRequest,a=producer.pointer.currentD08ScopedAuthority;
 must(q?.path&&q.gitBlob===producer.blobs.get(q.path)&&a?.path&&a.gitBlob===producer.blobs.get(a.path),'SOURCE_FAILURE:D08_FROZEN_CONTROL_POINTERS');
 const request=await producer.readFile(q.path),authorityText=await producer.readBytes(a.path),authority=JSON.parse(authorityText);
 must(sha256(authorityText)===a.sha256,'SOURCE_FAILURE:D08_FROZEN_SCOPE_HASH');
 const baseContractText=execFileSync('git',['show',`${request.sourceSha}:backend/contracts/cxorbia-academy-base-progress-contract-v1.json`],{encoding:'utf8',maxBuffer:2*1024*1024});
 const mod=producer.matrix.modules.find(m=>m.domain==='certifications');
 must(mod?.scopedContractAuthorities?.D08?.sha256===a.sha256,'SOURCE_FAILURE:D08_MODULE_SCOPE_AUTHORITY');
 const sourceAssets=Object.fromEntries(D08_ASSET_PATHS.map(file=>{
  const bytes=execFileSync('git',['show',`${request.sourceSha}:${file}`],{maxBuffer:10*1024*1024});
  return [file,{gitBlob:gitBlob(bytes),sourceSha256:sha256(bytes)}];
 }));
 return normalizeD08Result({resultText:text,transport,request,baseContractText,moduleContract:mod.contractFunctional,
  scopeAuthority:{...authority,sha256:a.sha256},sourceAssets});
}

// Typed incorporation is separate from the immutable execution journal. A failed
// producer is recorded as a failure, never promoted to a functional certificate.
export async function incorporateTypedResults({api,token,run,jobs,artifacts,controls,journal,files,now,
 download=downloadArtifact,producerLoader=loadControls,d08Normalizer=normalizeD08Artifact}){
 const queue=new Map((controls.pointer.currentResultIncorporationQueue||[]).map(x=>[typedResultKey(x),x]));
 must(JSON.stringify(controls.descriptor.currentFunctionalEvidenceIndex||null)===JSON.stringify(controls.pointer.currentFunctionalEvidenceIndex||null),'MAPPING_FAILURE:TYPED_INDEX_CONTROL_DESYNC');
 const index=controls.pointer.currentFunctionalEvidenceIndex||{schemaVersion:'cxorbia.i3.typed-result-index.v1',results:[],production:false};
 must(index.schemaVersion==='cxorbia.i3.typed-result-index.v1'&&index.production===false&&Array.isArray(index.results),'MAPPING_FAILURE:TYPED_INDEX_SCHEMA');
 const entries=new Map(index.results.map(x=>[x.key,structuredClone(x)])),failures=[],incorporated=[];
 let requestsReconciled=0;
 let producer;
 for(const pending of journal.pendingTypedResults||[]){
  if(!TYPED_JOBS[pending.name])continue;
  const job=jobs.find(j=>j.id===pending.jobId&&j.name===pending.name),key=typedResultKey({runId:run.id,runAttempt:run.run_attempt,jobId:pending.jobId});
  if(!job||!job.conclusion||job.conclusion==='skipped')continue;
  const old=entries.get(key);let archive;
  try{
   if(old){
   const text=await controls.readBytes(old.path);
   must(gitBlob(text)===old.gitBlob&&sha256(text)===old.sha256,'SOURCE_FAILURE:TYPED_INDEX_RECEIPT_HASH');
   const saved=JSON.parse(text),proof=saved.provenance||saved.evidence;
   must(String(proof?.runId)===String(run.id)&&String(proof?.runAttempt)===String(run.run_attempt)&&String(proof?.jobId)===String(job.id)&&proof?.controlHead===run.head_sha,'SOURCE_FAILURE:TYPED_INDEX_IDENTITY');
   must(String(proof.artifactId)===String(old.artifactId)&&proof.artifactDigest===old.artifactDigest,'SOURCE_FAILURE:TYPED_INDEX_ARTIFACT_IDENTITY');
   if(saved.decision==='PASS_D08_TYPED_PARTIAL_INCORPORATION'){
    producer??=await producerLoader(api,run.head_sha);
    if(await retireSatisfiedD08Request({result:saved,entry:old,producer,controls,files}))requestsReconciled++;
   }
   if(saved.kind==='D08_RECOVERY'){
    producer??=await producerLoader(api,run.head_sha);
    if(await retireSatisfiedD08RecoveryRequest({result:saved,entry:old,producer,controls,files}))requestsReconciled++;
   }
    queue.delete(key);continue;
   }
   const artifact=selectTypedArtifact({run,job,artifacts});
   const journalArtifact=(journal.artifacts||[]).find(item=>String(item.id)===String(artifact.id));
   must(journalArtifact&&journalArtifact.name===artifact.name&&journalArtifact.digest===artifact.digest,'SOURCE_FAILURE:TYPED_ARTIFACT_JOURNAL_MISMATCH');
   archive=await download(api,artifact,token);
   const names=TYPED_JOBS[job.name].entries.filter(entry=>fs.existsSync(path.join(archive.folder,entry)));
   must(names.length===1,'SOURCE_FAILURE:TYPED_RESULT_ENTRY_MISSING_OR_AMBIGUOUS');
   const entry=names[0],text=fs.readFileSync(path.join(archive.folder,entry),'utf8'),raw=JSON.parse(text);
   const base=`docs/checkpoints/CXORBIA_I3_RUN${run.id}_ATTEMPT${run.run_attempt}_JOB${job.id}`;
   const receiptPath=base+'_TYPED_RESULT.json',rawPath=base+'_D08_RAW.json';
   const transport={runId:run.id,runAttempt:run.run_attempt,jobId:job.id,jobName:job.name,jobConclusion:job.conclusion,
    controlHead:run.head_sha,artifactId:artifact.id,artifactDigest:artifact.digest,verifiedArchiveDigest:archive.digest,entry,resultSha256:sha256(text),resultRef:rawPath};
   producer??=await producerLoader(api,run.head_sha);
   let result;
   if(raw.schemaVersion==='cxorbia.i3.d08-ui-provider-new-session.v1'){
    if(job.conclusion==='success'){
     result=await d08Normalizer({text,transport,producer});files.set(rawPath,text);
    }else{
     must(String(raw.runId)===String(run.id)&&String(raw.runAttempt)===String(run.run_attempt)&&raw.production===false,'SOURCE_FAILURE:D08_HELD_RESULT_SCOPE');
     result={schemaVersion:'cxorbia.i3.typed-result-summary.v1',kind:'D08_INCOMPLETE',state:'HOLD',decision:'RECORDED_D08_INCOMPLETE',
      provenance:transport,observedAt:now,producerDecision:/^[A-Z0-9_]+$/.test(raw.decision||'')?raw.decision:null,
      failureCode:safeTypedFailureCode(raw.error),failureSha256:raw.error?sha256(String(raw.error)):null,
      observations:{functionalPass:raw.functionalPass===true,cleanupOk:raw.cleanup?.ok===true,roleProofCount:Object.keys(raw.roles||{}).length,resourceCount:(raw.resources||[]).length},
      ownerSpecificReceipts:[],newDomainMatches:0,fullDomain:false,phaseAComplete:false,production:false};
    }
   }else{
    let identityReadback;
    if(raw.schemaVersion==='cxorbia.i3.finance-core-ui-readonly.v1'){
     const sealEntry='identity-live-readback.json',sealPath=path.join(archive.folder,sealEntry);
     if(fs.existsSync(sealPath)){
      const stat=fs.lstatSync(sealPath);
      identityReadback={entry:sealEntry,artifactId:artifact.id,artifactDigest:archive.digest,
       text:stat.isFile()&&stat.size<=65536?fs.readFileSync(sealPath,'utf8'):null};
     }
    }
    result=summarizeTypedResult({resultText:text,transport,expectedIdentity:producer.descriptor.currentMaterialization,identityReadback});
   }
   const bytes=jsonBytes(result);files.set(receiptPath,bytes);
   const saved={key,path:receiptPath,gitBlob:gitBlob(bytes),sha256:sha256(bytes),runId:run.id,runAttempt:run.run_attempt,jobId:job.id,
    controlHead:run.head_sha,artifactId:artifact.id,artifactDigest:artifact.digest,decision:result.decision,
    ownerReceiptCount:result.ownerSpecificReceipts?.length||0,observedAt:now,...(result.kind==='D08_RECOVERY'?{kind:result.kind,producerDecision:result.producer.decision}:{})};
   if(await retireSatisfiedD08Request({result,entry:saved,producer,controls,files}))requestsReconciled++;
   if(await retireSatisfiedD08RecoveryRequest({result,entry:saved,producer,controls,files}))requestsReconciled++;
   entries.set(key,saved);queue.delete(key);incorporated.push(saved);
  }catch(error){
   failures.push({key,runId:run.id,runAttempt:run.run_attempt,jobId:job.id,code:safeTypedFailureCode(error.message)||'MAPPING_FAILURE:TYPED_INCORPORATION_UNCONFIRMED',observedAt:now});
  }finally{archive?.cleanup();}
 }
 return {queue,incorporated,failures,requestsReconciled,index:{...index,results:[...entries.values()],updatedAt:now}};
}

export function runJournal({run,jobs,artifacts,needs,now}){
 must(run.repository?.full_name===REPO&&run.head_branch===BRANCH&&run.path===`.github/workflows/${WORKFLOW}`,'SOURCE_FAILURE:RUN_AUTHORITY');
 return {schemaVersion:'cxorbia.i3.automatic-execution-journal.v1',repository:REPO,iteration:'I3',state:'HOLD',runId:run.id,runNumber:run.run_number,runAttempt:run.run_attempt,controlHead:run.head_sha,observedAt:now,workflowStatus:run.status,workflowConclusion:run.conclusion||'FINALIZER_IN_PROGRESS',needs:needs||null,jobs:jobs.filter(j=>j.name!==SELF).map(j=>({id:j.id,name:j.name,status:j.status,conclusion:j.conclusion,runAttempt:j.run_attempt,startedAt:j.started_at,completedAt:j.completed_at})),artifacts:artifacts.map(a=>({id:a.id,name:a.name,digest:a.digest,createdAt:a.created_at,expired:a.expired})),newDomainMatches:0,production:false,productActionsPerformedByConsumer:0};
}

export async function commitFiles(api,{expectedHead,files,message}){
 const root=`/repos/${REPO}`;
 const current=await api(`${root}/git/ref/heads/${BRANCH}`);must(current.object.sha===expectedHead,'SOURCE_FAILURE:CAS_HEAD_CHANGED');
 const parent=await api(`${root}/git/commits/${expectedHead}`);
 const entries=[];
 for(const [file,content]of files){
  must(file===DESCRIPTOR||file===POINTER||/^RECOVERY-I3-MODULE-TRUTH-MATRIX-\d{8}-V\d+\.json$/.test(file)||/^CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V\d+_\d{4}-\d{2}-\d{2}\.json$/.test(file)||/^docs\/checkpoints\/CXORBIA_I3_[A-Za-z0-9_-]+\.json$/.test(file),'SOURCE_FAILURE:CONSUMER_WRITE_ALLOWLIST');
  const blob=await api(`${root}/git/blobs`,{content,encoding:'utf-8'});must(blob.sha===gitBlob(content),'SOURCE_FAILURE:BLOB_READBACK');entries.push({path:file,mode:'100644',type:'blob',sha:blob.sha});
 }
 const tree=await api(`${root}/git/trees`,{base_tree:parent.tree.sha,tree:entries});
 const commit=await api(`${root}/git/commits`,{message,tree:tree.sha,parents:[expectedHead]});
 const before=await api(`${root}/git/ref/heads/${BRANCH}`);must(before.object.sha===expectedHead,'SOURCE_FAILURE:CAS_HEAD_CHANGED');
 // Non-forced sibling update also rejects a race between the last read and PATCH.
 await api(`${root}/git/refs/heads/${BRANCH}`,{sha:commit.sha,force:false},'PATCH');
 const [after,readback]=await Promise.all([api(`${root}/git/ref/heads/${BRANCH}`),api(`${root}/git/commits/${commit.sha}`)]);
 must(after.object.sha===commit.sha&&readback.parents.length===1&&readback.parents[0].sha===expectedHead&&readback.tree.sha===tree.sha,'SOURCE_FAILURE:COMMIT_READBACK');
 const remoteTree=await api(`${root}/git/trees/${tree.sha}?recursive=1`);must(!remoteTree.truncated,'SOURCE_FAILURE:TREE_READBACK_TRUNCATED');
 for(const entry of entries)must(remoteTree.tree.some(x=>x.path===entry.path&&x.sha===entry.sha),'SOURCE_FAILURE:RECEIPT_BLOB_READBACK');
 return {head:commit.sha,parent:expectedHead,tree:tree.sha,changedFiles:entries.map(x=>x.path)};
}

async function loadControls(api,head){
 const root=`/repos/${REPO}`;
 const c=await api(`${root}/git/commits/${head}`),tree=await api(`${root}/git/trees/${c.tree.sha}?recursive=1`);must(!tree.truncated,'SOURCE_FAILURE:TREE_TRUNCATED');
 const blobs=new Map(tree.tree.map(x=>[x.path,x.sha]));
 const bytes=async file=>{const sha=blobs.get(file);must(Boolean(sha),'SOURCE_FAILURE:MISSING_CONTROL:'+file);const b=await api(`${root}/git/blobs/${sha}`);const text=Buffer.from(b.content.replace(/\n/g,''),'base64').toString('utf8');must(gitBlob(text)===sha,'SOURCE_FAILURE:CONTROL_BYTES:'+file);return text;};
 const load=async file=>JSON.parse(await bytes(file));
 const [descriptor,pointer]=await Promise.all([load(DESCRIPTOR),load(POINTER)]);
 must(JSON.stringify(descriptor.currentFunctionalEvidenceIndex||null)===JSON.stringify(pointer.currentFunctionalEvidenceIndex||null),'MAPPING_FAILURE:TYPED_INDEX_CONTROL_DESYNC');
 const [ledger,matrix]=await Promise.all([load(descriptor.findingsLedgerPath),load(descriptor.moduleTruthPath)]);
 return {descriptor,pointer,ledger,matrix,blobs,readFile:load,readBytes:bytes};
}

export async function consumeRun({api,token,runId,runAttempt=null,needs=null,now=new Date().toISOString()}){
 const root=`/repos/${REPO}`;
 const run=await api(`${root}/actions/runs/${runId}${runAttempt?'/attempts/'+runAttempt:''}`);
 const [jobs,artifacts,ref]=await Promise.all([pages(api,`${root}/actions/runs/${runId}/attempts/${run.run_attempt}/jobs`,'jobs'),pages(api,`${root}/actions/runs/${runId}/artifacts`,'artifacts'),api(`${root}/git/ref/heads/${BRANCH}`)]);
 const head=ref.object.sha,controls=await loadControls(api,head);
 const journalPath=`docs/checkpoints/CXORBIA_I3_RUN${run.id}_ATTEMPT${run.run_attempt}_EXECUTION_JOURNAL.json`;
 const journalExists=controls.blobs.has(journalPath);
 const journal=journalExists?await controls.readFile(journalPath):runJournal({run,jobs,artifacts,needs,now});
 if(journalExists)validateConsumedJournal(journal,run,run.run_attempt);
 const paired=jobs.find(j=>j.name===PRODUCER&&j.conclusion!=='skipped');
 let files=new Map(),outcome=journalExists?journal.outcome:'RECORDED_EXECUTION_NO_PRODUCT_PROMOTION',materialization=journal.materializationReceiptPath||null;
 if(!journalExists&&paired?.conclusion==='success'){
  const artifact=selectPairedArtifact({run,job:paired,artifacts}),download=await downloadArtifact(api,artifact,token);
  try{
   const result=readJson(path.join(download.folder,'result.json'));
   const runDescriptor=JSON.parse(git('show',`${run.head_sha}:${DESCRIPTOR}`));
   const hrWindowFile=path.join(download.folder,'hr-window-readback.json');
   const bundle=makeMaterializationReceipt({run,job:paired,artifact,result,hrWindow:fs.existsSync(hrWindowFile)?readJson(hrWindowFile):null,requireHrWindow:runDescriptor.pendingDevSuccessor?.hrPeriodWindowRequired===true,hrResult:readJson(path.join(download.folder,'hr-after/result.json')),mailbox:fs.existsSync(path.join(download.folder,'mailbox-environment-readback.json'))?readJson(path.join(download.folder,'mailbox-environment-readback.json')):null,sourceAssets:sourceAssetHashes(result,run.head_sha),verifiedArchiveDigest:download.digest});
   must(git('rev-parse',`${result.sourceSha}^{tree}`)===result.sourceTree,'SOURCE_FAILURE:PRODUCT_TREE_MISMATCH');
   if(result.sourceSha!==controls.descriptor.productSourceSha||result.sourceTree!==controls.descriptor.productSourceTree){
    files.set(bundle.receiptPath,jsonBytes(bundle.receipt));outcome='RECORDED_HISTORICAL_SOURCE_RESULT_NO_CURRENT_PROMOTION';
   }else{
    const date=now.slice(0,10),compact=date.replaceAll('-','');
    const matrixNumber=Number(controls.matrix.version.slice(1))+1;
    const ledgerNumber=Number(controls.descriptor.findingsLedgerPath.match(/FULL_V(\d+)_/)[1])+1;
    const matrixPath=`RECOVERY-I3-MODULE-TRUTH-MATRIX-${compact}-V${matrixNumber}.json`,ledgerPath=`CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V${ledgerNumber}_${date}.json`;
    const projected=projectMaterialization(controls,{...bundle,now,matrixPath,ledgerPath});
    if(!projected.noop){
     projected.ledger.schemaVersion=`cxorbia.i3.canonical-cumulative-findings-ledger.full.v${ledgerNumber}`;
     files=bindControlPaths(projected,{matrixPath,ledgerPath});
     const check=validateCurrentAuthorityAliases(projected);must(check.pass,'MAPPING_FAILURE:PROJECTED_CONTROLS:'+check.failures.join(','));
    }
    materialization=bundle.receiptPath;outcome=projected.noop?'NOOP_MATERIALIZATION_ALREADY_INCORPORATED':'CONSUMED_EXACT_DEV_MATERIALIZATION';
   }
  }finally{download.cleanup();}
 }else if(!journalExists&&paired){outcome='HOLD_PARTIAL_OR_FAILED_DEPLOY_READBACK_REQUIRED';}
 if(!journalExists){journal.outcome=outcome;journal.materializationReceiptPath=materialization;
  journal.pendingTypedResults=jobs.filter(j=>![SELF,PRODUCER].includes(j.name)&&j.conclusion!=='skipped'&&(j.name!=='canonical-candidate-authority'||j.conclusion!=='success')).map(j=>({jobId:j.id,name:j.name,conclusion:j.conclusion,state:'EVIDENCE_RECORDED_TYPED_CLAUSE_INCORPORATION_REQUIRED'}));}
 const queue=new Map((controls.pointer.currentResultIncorporationQueue||[]).map(x=>[`${x.runId}/${x.runAttempt}/${x.jobId}`,x]));
 for(const x of journal.pendingTypedResults)queue.set(`${run.id}/${run.run_attempt}/${x.jobId}`,{...x,runId:run.id,runAttempt:run.run_attempt,journalPath,journalBlob:journalExists?controls.blobs.get(journalPath):gitBlob(jsonBytes(journal)),controlHead:run.head_sha});
 const typedControls={...controls,pointer:{...controls.pointer,currentResultIncorporationQueue:[...queue.values()]}};
 const typed=await incorporateTypedResults({api,token,run,jobs,artifacts,controls:typedControls,journal,files,now});
 if(journalExists&&!typed.incorporated.length&&!typed.failures.length&&!typed.requestsReconciled&&JSON.stringify([...typed.queue.values()])===JSON.stringify(controls.pointer.currentResultIncorporationQueue||[]))return {decision:'NOOP_ALREADY_CONSUMED',runId,head};
 const event={schemaVersion:journal.schemaVersion,path:journalPath,gitBlob:gitBlob(jsonBytes(journal)),runId:run.id,runAttempt:run.run_attempt,outcome,pendingTypedResults:journal.pendingTypedResults,materializationReceiptPath:materialization,production:false};
 for(const [file,key]of [[DESCRIPTOR,'descriptor'],[POINTER,'pointer']]){
  const value=files.has(file)?JSON.parse(files.get(file)):controls[key];
  if(!journalExists)value.currentAutomationReceipt=event;
  value.currentResultIncorporationQueue=[...typed.queue.values()];value.currentFunctionalEvidenceIndex=typed.index;
  value.currentTypedResultFailures=[...new Map([...(value.currentTypedResultFailures||[]).filter(x=>typed.queue.has(x.key)),...typed.failures].map(x=>[x.key,x])).values()];
  if(typed.incorporated.length)value.lastTypedResultIncorporation={observedAt:now,runId:run.id,runAttempt:run.run_attempt,receipts:typed.incorporated,production:false,newDomainMatches:0};
  files.set(file,jsonBytes(value));
 }
 if(!journalExists)files.set(journalPath,jsonBytes(journal));
 const saved=await commitFiles(api,{expectedHead:head,files,message:`I3 persist run ${run.id} attempt ${run.run_attempt} exact outcomes [i3-auto-receipt]`});
 return {decision:journalExists?'CONSUMED_EXISTING_JOURNAL_TYPED_RESULTS':outcome,runId,...saved,pendingTypedResults:typed.queue.size,typedResultsIncorporated:typed.incorporated.length,requestsReconciled:typed.requestsReconciled,typedFailures:typed.failures,productActions:0};
}

export function validateConsumedJournal(journal,run,attempt){
 must(run.repository?.full_name===REPO&&run.head_branch===BRANCH&&run.path===`.github/workflows/${WORKFLOW}`,'SOURCE_FAILURE:RUN_AUTHORITY');
 must(journal?.schemaVersion==='cxorbia.i3.automatic-execution-journal.v1'&&journal.repository===REPO&&journal.runId===run.id&&journal.runAttempt===attempt&&journal.controlHead===run.head_sha&&['RECORDED_EXECUTION_NO_PRODUCT_PROMOTION','RECORDED_HISTORICAL_SOURCE_RESULT_NO_CURRENT_PROMOTION','CONSUMED_EXACT_DEV_MATERIALIZATION','NOOP_MATERIALIZATION_ALREADY_INCORPORATED','HOLD_PARTIAL_OR_FAILED_DEPLOY_READBACK_REQUIRED'].includes(journal.outcome)&&journal.production===false&&journal.productActionsPerformedByConsumer===0,'MAPPING_FAILURE:CONSUMED_JOURNAL_IDENTITY');
}

export async function pendingRuns({api,currentRunId,currentRunAttempt=1,descriptor,knownPaths,readJournal}){
 const floor=Number(descriptor.postDeployRunSeal?.runId||0),root=`/repos/${REPO}`,runs=[];
 for(let page=1;page<=100;page++){
  const data=await api(`${root}/actions/workflows/${WORKFLOW}/runs?branch=${encodeURIComponent(BRANCH)}&per_page=100&page=${page}`),batch=data.workflow_runs||[];
  runs.push(...batch.filter(r=>r.id>=floor));
  if(batch.length<100||batch.some(r=>r.id<floor))break;
  if(page===100)throw new Error('PROVIDER_FAILURE:RECOVERY_RUN_SCAN_LIMIT');
 }
 const pending=[];
 for(const run of runs.sort((a,b)=>a.id-b.id))for(let attempt=1;attempt<=run.run_attempt;attempt++){
  if(run.id===Number(currentRunId)&&attempt>=Number(currentRunAttempt))continue;
  if(run.status!=='completed'&&attempt===run.run_attempt)continue;
  const journal=`docs/checkpoints/CXORBIA_I3_RUN${run.id}_ATTEMPT${attempt}_EXECUTION_JOURNAL.json`;
  if(knownPaths.has(journal)){must(typeof readJournal==='function','MAPPING_FAILURE:JOURNAL_READER_REQUIRED');validateConsumedJournal(await readJournal(journal),run,attempt);continue;}
  if(run.id===Number(descriptor.postDeployRunSeal?.runId)&&attempt<=Number(descriptor.currentMaterialization?.runAttempt||1))continue;
  const jobs=await pages(api,`${root}/actions/runs/${run.id}/attempts/${attempt}/jobs`,'jobs');
  // A control-only execution also needs a durable journal when its finalizer
  // was interrupted. Recording its result never promotes product evidence.
  if(jobs.some(j=>j.name!==SELF&&j.conclusion&&j.conclusion!=='skipped'))pending.push({runId:run.id,runAttempt:attempt});
 }
 return pending;
}

async function main(){
 must(process.env.GITHUB_REPOSITORY===REPO&&process.env.GITHUB_REF===`refs/heads/${BRANCH}`,'SOURCE_FAILURE:CONSUMER_ENV_SCOPE');
 const token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN,api=createApi({token}),root=`/repos/${REPO}`;
 const ref=await api(`${root}/git/ref/heads/${BRANCH}`),controls=await loadControls(api,ref.object.sha);
 const pending=await pendingRuns({api,currentRunId:process.env.GITHUB_RUN_ID,currentRunAttempt:process.env.GITHUB_RUN_ATTEMPT,descriptor:controls.descriptor,knownPaths:controls.blobs,readJournal:controls.readFile});
 if(process.argv.includes('--preflight')){must(!pending.length,`MAPPING_FAILURE:UNCONSUMED_COMPLETED_RUNS:${pending.map(p=>p.runId+'/'+p.runAttempt).join(',')}`);console.log(jsonBytes({decision:'PASS_NO_UNCONSUMED_EXECUTION',hrReads:0,builds:0,deploys:0}));return;}
 must(process.argv.includes('--consume-current-run'),'SOURCE_FAILURE:UNSUPPORTED_CONSUMER_MODE');
 const drain=[...new Map([...pending,...pendingTypedRuns(controls.pointer.currentResultIncorporationQueue),...pendingSatisfiedRequestRuns(controls)].map(x=>[x.runId+'/'+x.runAttempt,x])).values()];
 for(const item of drain)console.log(jsonBytes(await consumeRun({api,token,...item})));
 console.log(jsonBytes(await consumeRun({api,token,runId:Number(process.env.GITHUB_RUN_ID),runAttempt:Number(process.env.GITHUB_RUN_ATTEMPT),needs:JSON.parse(process.env.CXORBIA_I3_NEEDS_JSON||'null')})));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
