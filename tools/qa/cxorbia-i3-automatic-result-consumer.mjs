import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {DESCRIPTOR,POINTER,jsonBytes,gitBlob,sha256,makeMaterializationReceipt,projectMaterialization,bindControlPaths} from './cxorbia-i3-current-control-projection.mjs';
import {validateCurrentAuthorityAliases} from './cxorbia-i3-current-authority-alias-guard.mjs';

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
 const load=async file=>{const sha=blobs.get(file);must(Boolean(sha),'SOURCE_FAILURE:MISSING_CONTROL:'+file);const b=await api(`${root}/git/blobs/${sha}`);return JSON.parse(Buffer.from(b.content.replace(/\n/g,''),'base64').toString('utf8'));};
 const [descriptor,pointer]=await Promise.all([load(DESCRIPTOR),load(POINTER)]);
 const [ledger,matrix]=await Promise.all([load(descriptor.findingsLedgerPath),load(descriptor.moduleTruthPath)]);
 return {descriptor,pointer,ledger,matrix,blobs,readFile:load};
}

export async function consumeRun({api,token,runId,runAttempt=null,needs=null,now=new Date().toISOString()}){
 const root=`/repos/${REPO}`;
 const run=await api(`${root}/actions/runs/${runId}${runAttempt?'/attempts/'+runAttempt:''}`);
 const [jobs,artifacts,ref]=await Promise.all([pages(api,`${root}/actions/runs/${runId}/attempts/${run.run_attempt}/jobs`,'jobs'),pages(api,`${root}/actions/runs/${runId}/artifacts`,'artifacts'),api(`${root}/git/ref/heads/${BRANCH}`)]);
 const head=ref.object.sha,controls=await loadControls(api,head);
 const journalPath=`docs/checkpoints/CXORBIA_I3_RUN${run.id}_ATTEMPT${run.run_attempt}_EXECUTION_JOURNAL.json`;
 const journal=runJournal({run,jobs,artifacts,needs,now});
 if(controls.blobs.has(journalPath)){validateConsumedJournal(await controls.readFile(journalPath),run,run.run_attempt);return {decision:'NOOP_ALREADY_CONSUMED',runId,head};}
 const paired=jobs.find(j=>j.name===PRODUCER&&j.conclusion!=='skipped');
 let files=new Map(),outcome='RECORDED_EXECUTION_NO_PRODUCT_PROMOTION',materialization=null;
 if(paired?.conclusion==='success'){
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
 }else if(paired){outcome='HOLD_PARTIAL_OR_FAILED_DEPLOY_READBACK_REQUIRED';}
 journal.outcome=outcome;journal.materializationReceiptPath=materialization;
 journal.pendingTypedResults=jobs.filter(j=>![SELF,PRODUCER].includes(j.name)&&j.conclusion!=='skipped'&&(j.name!=='canonical-candidate-authority'||j.conclusion!=='success')).map(j=>({jobId:j.id,name:j.name,conclusion:j.conclusion,state:'EVIDENCE_RECORDED_TYPED_CLAUSE_INCORPORATION_REQUIRED'}));
 const queue=new Map((controls.pointer.currentResultIncorporationQueue||[]).map(x=>[`${x.runId}/${x.runAttempt}/${x.jobId}`,x]));
 for(const x of journal.pendingTypedResults)queue.set(`${run.id}/${run.run_attempt}/${x.jobId}`,{...x,runId:run.id,runAttempt:run.run_attempt,journalPath,journalBlob:gitBlob(jsonBytes(journal)),controlHead:run.head_sha});
 const event={schemaVersion:journal.schemaVersion,path:journalPath,gitBlob:gitBlob(jsonBytes(journal)),runId:run.id,runAttempt:run.run_attempt,outcome,pendingTypedResults:journal.pendingTypedResults,materializationReceiptPath:materialization,production:false};
 for(const [file,key]of [[DESCRIPTOR,'descriptor'],[POINTER,'pointer']]){
  const value=files.has(file)?JSON.parse(files.get(file)):controls[key];value.currentAutomationReceipt=event;value.currentResultIncorporationQueue=[...queue.values()];files.set(file,jsonBytes(value));
 }
 files.set(journalPath,jsonBytes(journal));
 const saved=await commitFiles(api,{expectedHead:head,files,message:`I3 persist run ${run.id} attempt ${run.run_attempt} exact outcomes [i3-auto-receipt]`});
 return {decision:outcome,runId,...saved,pendingTypedResults:journal.pendingTypedResults.length,productActions:0};
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
 for(const item of pending)console.log(jsonBytes(await consumeRun({api,token,...item})));
 console.log(jsonBytes(await consumeRun({api,token,runId:Number(process.env.GITHUB_RUN_ID),runAttempt:Number(process.env.GITHUB_RUN_ATTEMPT),needs:JSON.parse(process.env.CXORBIA_I3_NEEDS_JSON||'null')})));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
