import {createHash} from 'node:crypto';
import {isVerifiedGooglePairedExecution} from './cxorbia-i3-google-qa-execution.mjs';

export const DESCRIPTOR='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
export const POINTER='CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
export const PROJECTION_SCHEMA='cxorbia.i3.current-control-projection.v1';
export const HOLD='HOLD_I3_GTHN_DEV_MATERIALIZED';
export const NEXT='I3: DEV is published and its exact receipt is incorporated. Complete the authorized previous/current/next HR reading window without discarding confirmed history; prove the existing F3 application fixture ACK/readback/replay/conflict/echo/restoration/cleanup, authenticated HR durability, and the remaining A08/D08/finance clauses. E08 mailbox remains disabled/HOLD because metadata lookup was denied; do not infer key absence. Credit only exact newly proved clauses, preserve existing MATCH domains and B4/B5/B6/B7, then close C3/Gate20/Gate21 on the same artifact. Production DO_NOT_TOUCH; I4 requires explicit authorization.';
export const jsonBytes=v=>JSON.stringify(v,null,2)+'\n';
export const gitBlob=text=>createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');
export const sha256=text=>createHash('sha256').update(text).digest('hex');
const clone=x=>structuredClone(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const must=(ok,code)=>{if(!ok)throw new Error(code);};

// Technical executors and the HR provider are different identities. Legacy
// untagged receipts are Actions; a tagged foreign execution is never numeric.
export function executionProviderOf(value={}){
 const supported=['GITHUB_ACTIONS','GOOGLE_CLOUD_BUILD','GOOGLE_CLOUD_SHELL'];
 must(value.executionProvider===undefined||!supported.includes(value.provider)||value.executionProvider===value.provider,'SOURCE_FAILURE:CONFLICTING_EXECUTION_PROVIDER');
 const provider=value.executionProvider??(supported.includes(value.provider)?value.provider:'GITHUB_ACTIONS');
 must(supported.includes(provider),'SOURCE_FAILURE:UNKNOWN_EXECUTION_PROVIDER');
 return provider;
}
export function actionsCursorOf(descriptor){
 const explicit=descriptor.actionsScanCursor;
 if(explicit){
  must(explicit.provider==='GITHUB_ACTIONS'&&/^[1-9]\d*$/.test(String(explicit.runId))&&Number.isSafeInteger(Number(explicit.runId))&&Number.isSafeInteger(Number(explicit.runAttempt))&&Number(explicit.runAttempt)>0,'SOURCE_FAILURE:INVALID_ACTIONS_SCAN_CURSOR');
  return {provider:'GITHUB_ACTIONS',runId:String(explicit.runId),runAttempt:Number(explicit.runAttempt)};
 }
 const seal=descriptor.postDeployRunSeal;
 if(!seal)return {provider:'GITHUB_ACTIONS',runId:'0',runAttempt:1};
 must(executionProviderOf(seal)==='GITHUB_ACTIONS'&&/^[1-9]\d*$/.test(String(seal.runId))&&Number.isSafeInteger(Number(seal.runId)),'SOURCE_FAILURE:EXTERNAL_MATERIALIZATION_REQUIRES_ACTIONS_CURSOR');
 const attempt=Number(descriptor.currentMaterialization?.runAttempt||seal.runAttempt||1);
 must(Number.isSafeInteger(attempt)&&attempt>0,'SOURCE_FAILURE:INVALID_ACTIONS_SCAN_CURSOR');
 return {provider:'GITHUB_ACTIONS',runId:String(seal.runId),runAttempt:attempt};
}
const executionIdentity=value=>({provider:executionProviderOf(value),runId:String(value.runId),runAttempt:Number(value.runAttempt||1)});

function assertMaterializationSuccession(input,receipt){
 const current=input.descriptor.currentMaterialization,provider=executionProviderOf(receipt.materialization);
 must(['GITHUB_ACTIONS','GOOGLE_CLOUD_BUILD'].includes(provider),'SOURCE_FAILURE:UNSUPPORTED_MATERIALIZATION_PROVIDER');
 must(Number.isSafeInteger(Number(receipt.materialization.runAttempt))&&Number(receipt.materialization.runAttempt)>0,'SOURCE_FAILURE:INVALID_EXECUTION_ATTEMPT');
 if(provider==='GITHUB_ACTIONS')must(/^[1-9]\d*$/.test(String(receipt.materialization.runId))&&Number.isSafeInteger(Number(receipt.materialization.runId)),'SOURCE_FAILURE:INVALID_ACTIONS_EXECUTION_ID');
 else must(/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(receipt.materialization.runId)&&receipt.materialization.runNumber===null,'SOURCE_FAILURE:INVALID_GOOGLE_EXECUTION_ID');
 if(provider==='GITHUB_ACTIONS'&&(!current||executionProviderOf(current)==='GITHUB_ACTIONS')){
  must(Number(receipt.materialization.runId)>Number(current?.runId||0)||(String(receipt.materialization.runId)===String(current?.runId)&&Number(receipt.materialization.runAttempt)>=Number(current.runAttempt||1)),'SOURCE_FAILURE:OUT_OF_ORDER_MATERIALIZATION');
  return;
 }
 const next=receipt.succession,seal=input.descriptor.postDeployRunSeal;
 must(next&&/^[a-f0-9]{40}$/.test(input.head||'')&&next.expectedControlHead===input.head,'SOURCE_FAILURE:EXTERNAL_SUCCESSION_CONTROL_HEAD');
 must(next.predecessorReceiptPath===seal?.receiptPath&&next.predecessorReceiptBlob===seal?.receiptBlob&&same(next.predecessorExecution,executionIdentity(current)),'SOURCE_FAILURE:EXTERNAL_SUCCESSION_PREDECESSOR');
 must(!same(executionIdentity(current),executionIdentity(receipt.materialization)),'SOURCE_FAILURE:REPLAY_RECEIPT_CHANGED');
 const binding=receipt.executionBinding;
 must(/^[a-f0-9]{40}$/.test(binding?.producerControlHead||'')&&binding.request?.path===DESCRIPTOR&&binding.request?.field==='pendingDevSuccessor'&&/^[a-f0-9]{40}$/.test(binding.request?.gitBlob||'')&&/^[a-f0-9]{64}$/.test(binding.request?.sha256||'')&&binding.predecessorReceiptPath===next.predecessorReceiptPath&&binding.predecessorReceiptBlob===next.predecessorReceiptBlob&&same(binding.predecessorExecution,next.predecessorExecution)&&same(binding,receipt.materialization.executionBinding),'SOURCE_FAILURE:EXTERNAL_SUCCESSION_REQUEST');
}

// Enumerated active compatibility paths only. No recursive prefix rewriting.
export const REGISTRY={
 executionIdentity:['executionProvider','executionBinding'],
 executionCursors:['actionsScanCursor'],
 materialization:['currentMaterialization','currentDevMaterialization','lastDevMaterialization','latestDevMaterialization','latestDev'],
 execution:['currentExecutionReceipt','lastExecutionReceipt','latestExecutionReceipt'],
 obsolete:['currentAuthorityAliasPrevention','currentControlStatusCompatibilityRepair','currentHarnessOnlyCorrection','currentSessionProofPackage','currentSessionProofRequest','currentSourceReproof','currentSourceSuccessor419','devCertification','humanVisualCheckpointState','lastModuleTruthAttempt','lastSourceFix','lastSourceProof','latestFocalSourceFix','latestSourceSuccessor','sourceReproof','currentB14ToolboxStatus','currentB14ExecutionPrerequisite','currentF3EnvironmentReadback','planChoque20261113','currentA08ResidualQaExecution'],
 completedPending:['pendingDevSuccessor','pendingDevSuccessorEvidence','pendingMaterialization','pairedBuildResumeRequest','currentDevEnvironmentFailure','currentRemediationCandidate','currentRemediationPackage','currentHostingOnlyDevMaterialization'],
};

export function assertPreserved(before,after){
 const b=before.matrix.modules.filter(x=>x.classification==='MATCH').map(x=>x.domain).sort();
 const a=after.matrix.modules.filter(x=>x.classification==='MATCH').map(x=>x.domain).sort();
 must(same(b,a),'MAPPING_FAILURE:DEPLOY_CANNOT_CHANGE_DOMAIN_MATCHES');
 must(same(before.descriptor.currentC3PreterminalAudit,after.descriptor.currentC3PreterminalAudit),'MAPPING_FAILURE:HISTORICAL_C3_MUTATED');
 for(const name of ['descriptor','pointer','ledger','matrix']){
  for(const key of ['phaseAHumanAcceptanceCurrent20261111'])if(before[name][key]){
   must(same(before[name][key],after[name][key]),`MAPPING_FAILURE:HUMAN_APPROVAL_MUTATED:${name}.${key}`);
  }
 }
 const lock=after.pointer.activePhaseAClosureLock20261110;
 must(lock?.currentAccountingSemantics?.humanFunctionalBlocks?.names?.join(',')==='B4,B5,B6,B7','MAPPING_FAILURE:HUMAN_BLOCKS_DROPPED');
 must(after.descriptor.production==='DO_NOT_TOUCH'&&after.pointer.production==='DO_NOT_TOUCH'&&after.pointer.authorizationI4!==true,'RELEASE_COMPOSITION_FAILURE:PRODUCTION_AUTHORITY_CHANGED');
}

export function makeMaterializationReceipt({run,job,artifact,externalExecution,result,hrResult,mailbox,hrWindow,requireHrWindow=false,sourceAssets,verifiedArchiveDigest,succession}){
 const google=externalExecution!==undefined;
 if(google){
  must(!run&&!job&&!artifact&&isVerifiedGooglePairedExecution(externalExecution),'SOURCE_FAILURE:GOOGLE_NATIVE_PROVENANCE_REQUIRED');
  must(externalExecution.artifactDigest===verifiedArchiveDigest&&externalExecution.sourceSha===result.sourceSha&&externalExecution.sourceTree===result.sourceTree,'SOURCE_FAILURE:GOOGLE_PAIRED_SOURCE_OR_ARCHIVE');
  must(result.executionProvider==='GOOGLE_CLOUD_BUILD'&&result.runId===externalExecution.runId&&result.runAttempt===1&&['workflowRunId','jobId','artifactId'].every(k=>!Object.hasOwn(result,k)),'SOURCE_FAILURE:GOOGLE_PAIRED_RESULT_EXECUTION');
 }else{
 must(job.conclusion==='success'&&job.run_id===run.id,'ENVIRONMENT_FAILURE:PRODUCER_NOT_SUCCESS');
 must(run.head_branch==='recovery/cxorbia-phase-a-20260831','SOURCE_FAILURE:WRONG_BRANCH');
 must(run.path==='.github/workflows/cxorbia-recovery-i3-dev-certification.yml','SOURCE_FAILURE:WRONG_WORKFLOW');
 must(job.run_attempt===run.run_attempt,'SOURCE_FAILURE:WRONG_ATTEMPT');
 must(artifact.workflow_run?.id===run.id&&artifact.workflow_run?.head_sha===run.head_sha,'SOURCE_FAILURE:ARTIFACT_RUN_IDENTITY');
 must(artifact.digest===verifiedArchiveDigest&&/^sha256:[a-f0-9]{64}$/.test(verifiedArchiveDigest),'SOURCE_FAILURE:ARTIFACT_DIGEST');
 const created=Date.parse(artifact.created_at),started=Date.parse(job.started_at),ended=Date.parse(job.completed_at);
 must(created>=started&&created<=ended+60000,'SOURCE_FAILURE:ARTIFACT_OUTSIDE_PRODUCER_ATTEMPT');
 const expected=`cxorbia-vrm154-156-dev-materialization-${run.id}-${run.run_attempt}`;
 const legacy=`cxorbia-vrm154-156-dev-materialization-${run.id}`;
 must(artifact.name===expected||(run.run_attempt===1&&artifact.name===legacy),'SOURCE_FAILURE:ARTIFACT_NAME_ATTEMPT');
 }
 const id=google?externalExecution.runId:run.id,attempt=google?externalExecution.runAttempt:run.run_attempt;
 const executionMatches=value=>google?value.executionProvider==='GOOGLE_CLOUD_BUILD'&&String(value.runId)===id&&Number(value.runAttempt)===attempt:Number(value.runId)===id;
 must(/^PASS/.test(result.decision)&&result.production===false&&result.productionUnchanged===true,'RELEASE_COMPOSITION_FAILURE:INCOMPLETE_PAIRED_RESULT');
 must(result.sourceHostedExact===true&&result.runtimeTrafficExact===true&&result.scenarioDimensionsProven===true,'RELEASE_COMPOSITION_FAILURE:MISSING_LIVE_READBACK');
 must(/^[a-f0-9]{40}$/.test(result.sourceSha)&&/^[a-f0-9]{40}$/.test(result.sourceTree),'SOURCE_FAILURE:PRODUCT_IDENTITY');
 must(/^cxorbia-live-hr-dev-/.test(result.runtimeRevision)&&/^sha256:[a-f0-9]{64}$/.test(result.runtimeDigest),'ENVIRONMENT_FAILURE:RUNTIME_IDENTITY');
 must(/^sites\/cxorbia-backend-dev\/versions\//.test(result.hostingVersion)&&/^sites\/cxorbia-backend-dev\/channels\/live\/releases\//.test(result.hostingRelease),'ENVIRONMENT_FAILURE:HOSTING_IDENTITY');
 const assets=Object.entries(result.servedSha256||{});
 must(same(Object.keys(sourceAssets).sort(),assets.map(([p])=>p).sort()),'RELEASE_COMPOSITION_FAILURE:INCOMPLETE_SERVED_INVENTORY');
 must(assets.length>=19&&assets.length===result.verifiedServedAssetCount,'RELEASE_COMPOSITION_FAILURE:ASSET_INVENTORY');
 for(const [path,digest]of assets){
  must(!path.startsWith('/')&&!path.split('/').includes('..')&&/^[a-f0-9]{64}$/.test(digest),'SOURCE_FAILURE:ASSET_PATH');
  must(sourceAssets[path]===digest,`RELEASE_COMPOSITION_FAILURE:SERVED_ASSET:${path}`);
 }
 must(hrResult?.decision==='PASS_EXCEL_CANONICAL_ID_READONLY'||hrResult?.decision==='PASS_HR_DURABLE_REVISION_READONLY','SOURCE_FAILURE:MISSING_HR_READBACK');
 must(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].every(k=>hrResult[k]===result[k])&&executionMatches(hrResult)&&hrResult.revision===result.hrRevision&&hrResult.production===false&&hrResult.fullDomain===false&&['firestoreWrites','authWrites','hrWrites','commandPosts'].every(k=>hrResult[k]===0),'SOURCE_FAILURE:HR_READBACK_IDENTITY_OR_SCOPE');
 must(result.hrWrites===0&&result.firestoreRulesDeploys===0&&result.storageRulesDeploys===0,'RELEASE_COMPOSITION_FAILURE:UNEXPECTED_WRITE');
 if(requireHrWindow)must(Boolean(hrWindow),'SOURCE_FAILURE:HR_WINDOW_REQUIRED');
 if(hrWindow){
  must(hrWindow.decision==='PASS_HR_PERIOD_WINDOW_HISTORY_AND_EXPLICIT_READ'&&hrWindow.schemaVersion==='cxorbia.i3.hr-period-window-dev.v1'&&
   ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].every(k=>hrWindow[k]===result[k])&&executionMatches(hrWindow)&&hrWindow.runAttempt===attempt&&hrWindow.revision===result.hrRevision,'SOURCE_FAILURE:HR_WINDOW_IDENTITY');
  must(hrWindow.production===false&&hrWindow.fullDomain===false&&hrWindow.authenticatedUiCertified===false&&['firestoreWrites','authWrites','hrWrites','commandPosts','operationalImports'].every(k=>hrWindow[k]===0),'SOURCE_FAILURE:HR_WINDOW_SCOPE');
  must(hrWindow.rolling?.mode==='rolling_window'&&hrWindow.returned?.mode==='rolling_window'&&same(hrWindow.rolling.periodIds,hrWindow.returned.periodIds)&&hrWindow.returned.revision===result.hrRevision&&hrWindow.rolling.periodIds.length<=3&&hrWindow.rolling.periodIds.length>0&&hrWindow.explicit?.mode==='explicit_period'&&hrWindow.explicit.periodIds.length===1&&!hrWindow.rolling.periodIds.includes(hrWindow.explicit.periodIds[0])&&hrWindow.history?.externalReadCurrent===false&&hrWindow.history.available===true&&hrWindow.history.originalSeedVisits===836&&hrWindow.history.periods>=19,'SOURCE_FAILURE:HR_WINDOW_INCOMPLETE');
 }
 const receiptPath=google?`docs/checkpoints/CXORBIA_I3_GOOGLE_BUILD_${id}_AUTOMATIC_DEV_RECEIPT.json`:`docs/checkpoints/CXORBIA_I3_RUN${id}_ATTEMPT${attempt}_AUTOMATIC_DEV_RECEIPT.json`;
 const materialization={...result};delete materialization.servedSha256;
 const identity=google?{executionProvider:'GOOGLE_CLOUD_BUILD',runId:id,runNumber:null,runAttempt:attempt,jobConclusion:'success',executionBinding:clone(externalExecution)}:{workflowRunId:run.id,runId:run.id,runNumber:run.run_number,runAttempt:run.run_attempt,jobId:job.id,jobConclusion:job.conclusion,artifactId:artifact.id};
 Object.assign(materialization,{...identity,controlHeadAtDeploy:google?externalExecution.producerControlHead:run.head_sha,artifactDigest:verifiedArchiveDigest,artifactDigestType:google?'GOOGLE_CLOUD_BUILD_DEV_EVIDENCE_ZIP_SHA256_NOT_I4_CERTIFIED_TAR':'GITHUB_ACTIONS_DEV_EVIDENCE_ZIP_SHA256_NOT_I4_CERTIFIED_TAR',materializationReceiptPath:receiptPath,hrLiveVerified:true,state:'PASS_DEV_EXACT_FUNCTIONAL_AND_CURRENT_C3_PENDING',humanAcceptance:'B4_B5_B6_B7_PASS_PRESERVED_NO_NEW_APPROVAL',fullTaskClosed:false});
 const receipt={schemaVersion:'cxorbia.i3.current-source-dev-materialization.v1',kind:'EXACT_PAIRED_DEV_ACK_NOT_FUNCTIONAL_CERTIFICATE',iteration:'I3',state:'HOLD',source:{sha:result.sourceSha,tree:result.sourceTree},sourceSha:result.sourceSha,sourceTree:result.sourceTree,...identity,artifactDigest:verifiedArchiveDigest,archiveDigestVerified:true,observedAt:google?externalExecution.completedAt:job.completed_at,decision:result.decision,materialization,servedSha256:result.servedSha256,verifiedServedAssetCount:assets.length,sourceHostedExact:true,productionUnchanged:true,production:false,i4Authorized:false,phaseAComplete:false,terminalCertified:false,newDomainMatches:0,hrReadback:hrResult,hrPeriodWindow:hrWindow||null,mailboxEnvironment:mailbox||null,scope:'DEV_MATERIALIZATION_ONLY_NO_DOMAIN_OR_HUMAN_PROMOTION'};
 if(google)receipt.succession={predecessorReceiptPath:externalExecution.predecessorReceiptPath,predecessorReceiptBlob:externalExecution.predecessorReceiptBlob,predecessorExecution:clone(externalExecution.predecessorExecution)};
 else if(succession){receipt.succession=clone(succession);receipt.executionBinding=clone(succession.executionBinding);materialization.executionBinding=clone(succession.executionBinding);materialization.executionProvider='GITHUB_ACTIONS';receipt.executionProvider='GITHUB_ACTIONS';}
 return {receiptPath,receipt};
}

function oldResidual(mod,archive){(archive.modules||={})[mod.domain]={actionRequired:mod.actionRequired,currentResidualClauses:clone(mod.currentResidualClauses)};}

export function residualAction(mod){
 const residual=mod.currentResidualClauses;
 if(Array.isArray(residual))return residual.join(' ');
 if(residual?.pending)return residual.pending+(residual.preserved?' PRESERVE: '+residual.preserved:'');
 return null;
}

// Derive the next operational step from existing residual clauses. This changes
// no module verdict, approval or execution receipt and adds no acceptance gate.
function currentD08Followup(out,evidence){
 const {descriptor:d,pointer:p}=out,followup=d.currentD08GoogleFollowup,requestRef=d.currentD08UiQaRequest;
 const entry=d.currentFunctionalEvidenceIndex?.results?.filter(x=>x.provider==='GOOGLE_CLOUD_SHELL'&&x.path?.includes('_GOOGLE_D08_')).at(-1);
 const served=d.currentMaterialization||{},seal=d.postDeployRunSeal||{};
 if(!evidence||!followup?.nextAction||!entry||entry.key!==followup.resultKey||entry.sha256!==followup.receiptSha256||
  !requestRef?.path||requestRef.sourceSha!==served.sourceSha||!same(followup,p.currentD08GoogleFollowup)||
  !same(requestRef,p.currentD08UiQaRequest)||!same(entry,p.currentFunctionalEvidenceIndex?.results?.find(x=>x.key===entry.key))||
  !same(served,p.currentMaterialization)||!same(seal,p.postDeployRunSeal))return null;
 const {producer,receiptBytes,requestBytes}=evidence;
 if(producer?.head!==entry.controlHead||!same(requestRef,producer.descriptor?.currentD08UiQaRequest)||
  !same(requestRef,producer.pointer?.currentD08UiQaRequest))return null;
 must(typeof receiptBytes==='string'&&gitBlob(receiptBytes)===entry.gitBlob&&sha256(receiptBytes)===entry.sha256,'SOURCE_FAILURE:D08_FOLLOWUP_RECEIPT_BYTES');
 must(typeof requestBytes==='string'&&gitBlob(requestBytes)===requestRef.gitBlob,'SOURCE_FAILURE:D08_FOLLOWUP_REQUEST_BYTES');
 const receipt=JSON.parse(receiptBytes),proof=receipt.provenance||{},request=JSON.parse(requestBytes);
 must(receipt.schemaVersion==='cxorbia.i3.typed-result-summary.v1'&&receipt.kind==='D08_INCOMPLETE'&&
  receipt.decision==='RECORDED_D08_INCOMPLETE'&&receipt.production===false&&proof.provider==='GOOGLE_CLOUD_SHELL'&&
  proof.archiveVerified===true&&proof.job==='i3-run2382-academy-b7-isolated-dev-qa'&&
  entry.key==='GOOGLE_CLOUD_SHELL/'+proof.startGeneration&&proof.controlSha===entry.controlHead&&
  ['controlHead','transportSha','startUri','resultUri','bundleSha256','archiveUri','archiveSha256'].every(k=>typeof entry[k]==='string'&&entry[k]===proof[k]),
  'SOURCE_FAILURE:D08_FOLLOWUP_RECEIPT_IDENTITY');
 const identities=[served,producer.descriptor.currentMaterialization,producer.pointer.currentMaterialization];
 if(request.production!==false||requestRef.production!==false||request.sourceSha!==requestRef.sourceSha||
  String(request.pairedRunId)!==String(requestRef.pairedRunId)||
  !identities.every(value=>value&&['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].every(k=>typeof request[k]==='string'&&request[k]===value[k])&&String(value.runId)===String(request.pairedRunId))||
  ![seal,producer.descriptor.postDeployRunSeal,producer.pointer.postDeployRunSeal].every(value=>value&&value.receiptPath===request.pairedReceiptPath&&value.receiptBlob===request.pairedReceiptGitBlob))return null;
 return {entry,nextAction:followup.nextAction};
}

export function projectCurrentResidualNextAction(out,{completedTaskIds=[],d08Evidence}={}){
 const {descriptor:d,pointer:p,matrix:m}=out;
 const completed=[...new Set([...[d,p,out.ledger,m].flatMap(x=>x.nextPlannedBlock?.completedTaskIds||[]),...completedTaskIds])];
 const residuals=(m.modules||[]).filter(x=>x.classification!=='MATCH').map(mod=>({domain:mod.domain,pending:Array.isArray(mod.currentResidualClauses)?mod.currentResidualClauses.join(' '):mod.currentResidualClauses?.pending||mod.actionRequired||'Unproved existing contract; retain HOLD.'}));
 const priorities=[['FINANCE_RESIDUAL','finance-core-liquidation-costs'],['D08','certifications'],['F3','canonical-hr-state-adapters'],['A08','auth-protected-data-runtime']];
 const pendingPriorities=priorities.filter(([,domain])=>residuals.some(x=>x.domain===domain));
 const taskIds=[...new Set([...(p.nextPlannedBlock?.taskIds||[]),...pendingPriorities.map(([task])=>task),'E08','G20','G21'])].filter(id=>!completed.includes(id));
 const served=d.currentMaterialization||{},sameCandidate=served.sourceSha===d.productSourceSha&&served.sourceTree===d.productSourceTree;
 const environmentBlocked=d.activeBlocker==='ENVIRONMENT_FAILURE_GITHUB_ACTIONS_ACCOUNT_LOCKED';
 const followup=d.currentFinanceGoogleFollowup;
 const lastGoogleFinance=d.currentFunctionalEvidenceIndex?.results?.filter(x=>x.provider==='GOOGLE_CLOUD_SHELL'&&x.resultUri&&x.path?.includes('_GOOGLE_FINANCE_')).at(-1);
 const pendingFinance=followup?.servedSource===served.sourceSha&&lastGoogleFinance?.key===followup?.resultKey&&lastGoogleFinance?.sha256===followup?.receiptSha256&&followup?.nextAction;
 const d08=currentD08Followup(out,d08Evidence),results=d.currentFunctionalEvidenceIndex?.results||[];
 // The append-only incorporation order chooses between bound Google follow-ups;
 // execution clocks and foreign run IDs do not establish succession.
 const pendingD08=d08&&(!pendingFinance||results.indexOf(d08.entry)>results.indexOf(lastGoogleFinance));
 const start=pendingD08?d08.nextAction:pendingFinance?followup.nextAction:sameCandidate?'Use the exact currently served DEV candidate.':environmentBlocked?'GitHub Actions recorded zero steps. Use the authorized Google Cloud DEV lane when QA signing and external evidence incorporation are verified. Run the pending Finance and Academy requests on their producer-bound served source before paired publication. If Actions resumes first, use its original attempt lineage. Use one executor and incorporate each result before the next functional write.':'First verify and publish the approved pending source through the existing paired DEV lane, then verify the served artifact.';
 const focused=pendingPriorities.map(([task,domain])=>task+': '+residuals.find(x=>x.domain===domain).pending).join(' ');
 const other=residuals.filter(x=>!pendingPriorities.some(([,domain])=>domain===x.domain)).map(x=>x.domain);
 const nextAction='I3: '+start+(completed.includes('HR_PERIOD_WINDOW')?' The reading window, retained history and explicit older-period read are verified in their recorded scope.':'')+' Execute only active bound requests and the following current residuals. '+focused+(other.length?' Also retain the currentResidualClauses of '+other.join(', ')+'.':'')+' E08: resolve the authenticated mailbox/provider configuration and prove the authorized external ACK; retain its HOLD until verified. After the existing business-process contracts and open P0 are satisfied, complete C3/Gate20/Gate21 on the same artifact. Preserve all accepted scoped evidence and B4/B5/B6/B7. Production DO_NOT_TOUCH; I4 requires explicit exact-artifact authorization.';
 const block={...(p.nextPlannedBlock||{}),taskIds,completedTaskIds:completed,exactPending:nextAction,sourceSha:d.productSourceSha,production:false};
 let changed=false;
 const assign=(value,key,next)=>{if(!same(value[key],next)){value[key]=clone(next);changed=true;}};
 for(const value of [d,p,out.ledger,m]){
  assign(value,'nextExactAction',nextAction);assign(value,'exactNextAction',nextAction);assign(value,'nextPlannedBlock',block);
  if(value.canonicalFunctionalCandidate){assign(value.canonicalFunctionalCandidate,'nextExactAction',nextAction);assign(value.canonicalFunctionalCandidate,'exactNextAction',nextAction);}
  if(value.currentCanonicalCheckpoint)assign(value.currentCanonicalCheckpoint,'immediateAction',nextAction);
  if(value.continuityHandoff)assign(value.continuityHandoff,'immediateAction',nextAction);
 }
 return {changed,nextAction,completedTaskIds:completed};
}

function archiveActive(object,keys,archive){for(const key of keys)if(Object.hasOwn(object,key)){archive[key]=object[key];delete object[key];}}

// These compatibility snapshots have no execution readers. The exact request
// file and typed evidence index carry authority; duplicate pending states do not.
export function retireDuplicateExecutionAliases(out,archive={}){
 let changed=0;
 for(const [name,value]of Object.entries(out).filter(([key])=>['descriptor','pointer','ledger','matrix'].includes(key))){
  const histories=archive.controls||={},old=histories[name]||={};
  if(Object.hasOwn(value,'currentA08ResidualQaExecution')){old.currentA08ResidualQaExecution=value.currentA08ResidualQaExecution;delete value.currentA08ResidualQaExecution;changed++;}
  if(value.continuityHandoff&&Object.hasOwn(value.continuityHandoff,'independentD08UiQaRequest')){old.independentD08UiQaRequest=value.continuityHandoff.independentD08UiQaRequest;delete value.continuityHandoff.independentD08UiQaRequest;changed++;}
 }
 const finding=out.ledger.findings?.['VRM-369'];
 if(finding&&Object.hasOwn(finding,'currentExecutionScope')){(archive.controls.ledger||={}).vrm369CurrentExecutionScope=finding.currentExecutionScope;delete finding.currentExecutionScope;changed++;}
 return {changed,archive};
}

// These module-level compatibility headers describe the current candidate or
// current paired deployment. Their original values remain verbatim in history;
// approved functional receipts keep their original identities and classifications.
export function synchronizeModuleServingAliases(matrix,{sourceSha,sourceTree,materialization,archive={}}){
 let changed=0;
 for(const mod of matrix.modules||[]){
  const old={};
  for(const [key,value]of Object.entries({currentCandidateSource:sourceSha,currentCandidateTree:sourceTree,cumulativeSource:sourceSha})){
   if(Object.hasOwn(mod,key)&&!same(mod[key],value)){old[key]=clone(mod[key]);mod[key]=value;changed++;}
  }
  for(const key of REGISTRY.materialization)if(Object.hasOwn(mod,key)&&!same(mod[key],materialization)){
   old[key]=clone(mod[key]);mod[key]=clone(materialization);changed++;
  }
  if(Object.hasOwn(mod,'currentF2OperationalExcel')){old.currentF2OperationalExcel=clone(mod.currentF2OperationalExcel);delete mod.currentF2OperationalExcel;changed++;}
  if(mod.sourceClosure?.state==='COMPOSED_NOT_DEPLOYED'){
   old.sourceClosure=clone(mod.sourceClosure);delete mod.sourceClosure;changed++;
  }
  if(Object.keys(old).length)(archive.moduleCurrentAliases||={})[mod.domain]=old;
 }
 return {changed,archive};
}

export function readBoundedF3CellProof(controls,readBytes){
 const {descriptor:d,pointer:p,matrix:m,ledger:l}=controls,proof=d.currentF3BoundedCellEvidence;
 if(!proof){
  must(![p,m,l,...(m.modules||[])].some(x=>x.currentF3BoundedCellEvidence),'MAPPING_FAILURE:F3_BOUNDED_CELL_EVIDENCE_BINDING');
  return null;
 }
 const idx=d.currentFunctionalEvidenceIndex?.results?.find(entry=>entry.key===proof.typedResultKey);
 const counterpart=p.currentFunctionalEvidenceIndex?.results?.find(entry=>entry.key===proof.typedResultKey);
 must(proof.taskId==='B14'&&proof.terminalTaskPass===false&&proof.fullB14===false&&proof.fullF3===false&&proof.production===false&&
  /^[a-f0-9]{40}$/.test(proof.gitBlob)&&/^[a-f0-9]{64}$/.test(proof.sha256)&&
  /^docs\/checkpoints\/CXORBIA_I3_[A-Za-z0-9_-]+\.json$/.test(proof.path)&&
  [p,m,l].every(control=>same(control.currentF3BoundedCellEvidence,proof))&&
  idx?.provider==='GOOGLE_CLOUD_SHELL'&&idx.kind==='F3_ENDPOINT'&&same(idx,counterpart)&&idx.path===proof.typedResultPath&&idx.gitBlob===proof.typedResultBlob,
  'MAPPING_FAILURE:F3_BOUNDED_CELL_EVIDENCE_BINDING');
 const owners=['canonical-hr-state-adapters','persistence-command-ack-boundary'];
 for(const domain of owners){
  const mod=m.modules.find(module=>module.domain===domain);
  must(mod&&same(mod.currentF3BoundedCellEvidence,proof)&&Array.isArray(mod.currentResidualClauses)&&mod.currentResidualClauses.length>0,'MAPPING_FAILURE:F3_BOUNDED_CELL_MODULE_BINDING');
 }
 if(readBytes){
  const bytes=readBytes(proof.path);
  must(gitBlob(bytes)===proof.gitBlob&&sha256(bytes)===proof.sha256,'SOURCE_FAILURE:F3_BOUNDED_CELL_RECEIPT_BYTES');
  const seal=JSON.parse(bytes), native=seal.nativeResult, audit=seal.independentAudit, process=seal.businessProcessAcceptance;
  const id=native?.sourceAndRuntime?.observed;
  must(id&&['sourceSha','sourceTree','runtimeRevision','hostingVersion'].every(key=>id[key]===proof[key])&&
   String(seal.nativeResultGeneration)===proof.nativeResultGeneration&&'GOOGLE_CLOUD_SHELL/'+seal.nativeStartGeneration===proof.typedResultKey&&
   native.path===proof.typedResultPath&&process?.originalTaskId===proof.taskId&&process.frozenAcceptanceBindingSha256===proof.acceptanceBindingSha256&&
   same(process.ownerDomains,owners)&&process.wholeOriginalTaskComplete===false&&seal.b14Closed===false&&seal.fullF3Closed===false&&seal.production===false&&
   Array.isArray(audit?.windowDefects)&&audit.windowDefects.length===0&&audit.physicalPatchRequests===2&&audit.replayAndRejectedPhysicalPatches===0&&
   audit.remoteCleanupVerified===true&&native.baselineRevision===native.restoredRevision,'MAPPING_FAILURE:F3_BOUNDED_CELL_RECEIPT_SCOPE');
 }
 return proof;
}

export function projectMaterialization(input,{receipt,receiptPath,now=receipt.observedAt,ledgerPath,matrixPath,finding}){
 const out=Object.fromEntries(['descriptor','pointer','ledger','matrix'].map(k=>[k,clone(input[k])])),{descriptor:d,pointer:p,ledger:l,matrix:m}=out;
 const r=receipt.materialization,blob=gitBlob(jsonBytes(receipt));
 const f3Cell=readBoundedF3CellProof(input);
 const nextAction=receipt.hrPeriodWindow?NEXT.replace('Complete the authorized previous/current/next HR reading window without discarding confirmed history; prove', 'The previous/current/next HR reading window, retained history and explicit older-period read are verified. Prove'):NEXT;
 must(r.sourceSha===d.productSourceSha&&r.sourceTree===d.productSourceTree,'SOURCE_FAILURE:RESULT_IS_NOT_CURRENT_PRODUCT');
 if(d.postDeployRunSeal?.receiptPath===receiptPath){must(same(executionIdentity(d.currentMaterialization),executionIdentity(r)),'SOURCE_FAILURE:OUT_OF_ORDER_MATERIALIZATION');must(d.postDeployRunSeal.receiptBlob===blob,'SOURCE_FAILURE:REPLAY_RECEIPT_CHANGED');return {noop:true,...out};}
 assertMaterializationSuccession(input,receipt);
 const executionProvider=executionProviderOf(r),previousActionsCursor=actionsCursorOf(d);
 const actionsScanCursor=executionProvider==='GITHUB_ACTIONS'?{provider:'GITHUB_ACTIONS',runId:String(r.runId),runAttempt:Number(r.runAttempt)}:previousActionsCursor;
 const technical=Object.fromEntries(REGISTRY.executionIdentity.filter(k=>Object.hasOwn(r,k)).map(k=>[k,clone(r[k])]));
 const archived={schemaVersion:'cxorbia.i3.active-alias-migration.v1',reason:'Historical active aliases are archived verbatim; operational projection is derived from exact receipt.',observedAt:now,controls:{}};
 const c3=d.currentC3PreterminalAudit;
 const seal={schemaVersion:'cxorbia.i3.postdeploy-consistency-seal.v1',mode:'CURRENT_SOURCE_SERVING',...Object.fromEntries(['runId','runNumber','sourceSha','sourceTree','artifactDigest','runtimeRevision','runtimeDigest','hostingVersion','hostingRelease','firestoreRuleset','hrRevision'].map(k=>[k,r[k]])),receiptPath,receiptBlob:blob,liveE2e:'EXACT_DEV_READBACK_FUNCTIONAL_CLAUSES_PENDING',hrLiveVerified:true,certifiable:false,humanAcceptance:'B4_B5_B6_B7_PASS_PRESERVED',gate20:'HOLD',gate21:'HOLD',production:false};
 const execution={path:receiptPath,gitBlob:blob,receiptPath,receiptBlob:blob,kind:receipt.kind,decision:receipt.decision,state:'HOLD',...Object.fromEntries(['runId','runNumber','runAttempt','jobId','artifactId','artifactDigest','sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','hrRevision'].map(k=>[k,r[k]])),materializationRunId:r.runId,provider:'excel_online',production:false,terminalCertified:false,phaseAComplete:false,i4Authorized:false,matchModules:m.modules.filter(x=>x.classification==='MATCH').length,nonMatchModules:m.modules.filter(x=>x.classification!=='MATCH').length};
 const preC3={state:'DEV_RUNTIME_AND_HOSTING_VERIFIED_C3_PENDING',...Object.fromEntries(['sourceSha','sourceTree','hostingVersion','hostingRelease','runtimeRevision','runtimeDigest','runId','runNumber'].map(k=>[k,r[k]])),previousC3SourceSha:c3.sourceSha,previousC3SourceTree:c3.sourceTree,previousHostingVersion:c3.hostingVersion,previousRuntimeRevision:c3.runtimeRevision,receiptPath,receiptBlob:blob,production:false,scope:'CURRENT_PAIRED_DEV_VERIFIED_PRIOR_C3_HISTORICAL_CURRENT_C3_PENDING'};
 const serving={path:receiptPath,gitBlob:blob,receiptPath,receiptBlob:blob,...Object.fromEntries(['sourceSha','sourceTree','runId','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,r[k]])),scope:'EXACT_DEV_MATERIALIZATION_NOT_FUNCTIONAL_OR_HUMAN_CERTIFICATE'};
 const binding={...serving,materializationRunId:r.runId,observedRunId:r.runId,hrRevision:r.hrRevision,provider:'excel_online',production:false,runtimeProjectBindingResolutionProven:true,b14Closed:false};
 for(const alias of [seal,execution,preC3,serving,binding])Object.assign(alias,clone(technical));
 for(const [name,o]of Object.entries(out)){
  const old=archived.controls[name]={};
  if(o.actionsScanCursor)old.actionsScanCursor=clone(o.actionsScanCursor);
  o.actionsScanCursor=clone(actionsScanCursor);
  if(Object.hasOwn(o,'asOf')){old.asOf=o.asOf;o.asOf=now;}
  for(const k of [...REGISTRY.materialization,...REGISTRY.execution,'nextPlannedBlock','activeAuthoritySemantics','lastModuleTruthProof','i3Q2HostingReleaseC3Pending'])if(Object.hasOwn(o,k))old[k]=clone(o[k]);
  archiveActive(o,[...REGISTRY.obsolete,...REGISTRY.completedPending],old);
  for(const k of Object.keys(o).filter(k=>k.startsWith('currentSuccessor'))){old[k]=o[k];delete o[k];}
  for(const k of REGISTRY.materialization)if(Object.hasOwn(o,k)||['currentMaterialization','currentDevMaterialization'].includes(k))o[k]=clone(r);
  for(const k of REGISTRY.execution)o[k]=clone(execution);
  Object.assign(o,{updatedAt:now,status:HOLD,state:'HOLD',activeBlocker:'CURRENT_SOURCE_FUNCTIONAL_CLOSURE_AND_E08_ENVIRONMENT_HOLD',activeBlockers:[f3Cell?'F3_UNCOVERED_FIELDS_ROLES_AND_EXTERNAL_EVENTS':'F3_APPLICATION_ACK_REPLAY_CONFLICT_ECHO_CLEANUP','UNCOVERED_FUNCTIONAL_CONTRACT_CLAUSES','CURRENT_SOURCE_C3_GATE20_GATE21','E08_MAILBOX_CONFIGURATION_AND_EXTERNAL_ACK_UNPROVEN'],currentMaterializationIsPredecessorOnly:false,lastServedSource:r.sourceSha,currentServingAuthority:clone(serving),postDeployRunSeal:clone(seal),currentRuntimeBinding:clone(binding),i3Q2HostingReleaseC3Pending:clone(preC3),exactNextAction:nextAction,nextExactAction:nextAction,currentExecutionReceiptSemantics:'LAST_TYPED_EXECUTION_IS_INDEPENDENT_OF_LAST_DEPLOYMENT_AND_LAST_HR_OBSERVATION',lastExecutionReceiptSemantics:'LAST_TYPED_EXECUTION_IS_INDEPENDENT_OF_LAST_DEPLOYMENT_AND_LAST_HR_OBSERVATION',activeAuthoritySemantics:`Current product ${r.sourceSha}; DEV run ${r.runId}, runtime ${r.runtimeRevision}, Hosting ${r.hostingVersion}. Six existing MATCH and prior C3 are preserved; this deployment is not domain certification.`,nextPlannedBlock:{taskIds:[...(receipt.hrPeriodWindow?[]:['HR_PERIOD_WINDOW']),'F3','A08','D08','FINANCE_RESIDUAL','E08','G20','G21'],completedTaskIds:receipt.hrPeriodWindow?['HR_PERIOD_WINDOW']:[],exactPending:nextAction,sourceSha:d.productSourceSha,production:false}});
  if(receipt.hrPeriodWindow)o.currentHrPeriodWindow={...clone(receipt.hrPeriodWindow),receiptPath,receiptBlob:blob,scope:'READ_WINDOW_AND_HISTORY_ONLY_NO_DOMAIN_PROMOTION'};
  // A fresh paired HR read is its own fact; do not relabel an old F2 config-write receipt.
  if(o.currentF2OperationalExcel){old.currentF2OperationalExcel=o.currentF2OperationalExcel;delete o.currentF2OperationalExcel;}
  o.lastHrObservation={runId:r.runId,...clone(technical),sourceSha:r.sourceSha,sourceTree:r.sourceTree,hrRevision:r.hrRevision,receiptPath,receiptBlob:blob,provider:'excel_online',production:false,kind:'EXACT_PAIRED_READONLY_HR_OBSERVATION'};
  o.lastModuleTruthProof=clone(c3);o.c3PreterminalProof=clone(c3);o.currentC3PreterminalAudit=clone(c3);
  if(o.canonicalFunctionalCandidate){old.canonicalFunctionalCandidateMaterialization=clone(o.canonicalFunctionalCandidate.currentMaterialization);Object.assign(o.canonicalFunctionalCandidate,{state:'RUNTIME_AND_HOSTING_DEV_MATERIALIZED_FUNCTIONAL_C3_PENDING',currentMaterialization:clone(r),nextExactAction:nextAction,exactNextAction:nextAction});}
  if(o.currentMailboxEnvironmentHold&&receipt.mailboxEnvironment){old.currentMailboxEnvironmentHold=clone(o.currentMailboxEnvironmentHold);Object.assign(o.currentMailboxEnvironmentHold,{runtimeRevision:r.runtimeRevision,observedRunId:r.runId,reason:receipt.mailboxEnvironment.secretMetadataOutcome==='PERMISSION_DENIED'?'Mailbox key metadata lookup was denied; key existence is not established. Retain E08 functional HOLD.':'Mailbox environment observation only; authenticated functional E08 proof remains required.',secretMetadataOutcome:receipt.mailboxEnvironment.secretMetadataOutcome,mailboxEnabled:receipt.mailboxEnvironment.mailboxEnabled,sendEnabled:receipt.mailboxEnvironment.sendEnabled,receiptPath,receiptBlob:blob});}
  if(o.d08AcademyProgressResidual?.currentMaterialization)o.d08AcademyProgressResidual.currentMaterialization=clone(r);
 }
 retireDuplicateExecutionAliases(out,archived);
 const count=execution.matchModules;
 archived.matrixProductSourceMaterialization=clone(m.productSource.currentMaterialization);
 Object.assign(m.productSource,{authorityState:'RUNTIME_AND_HOSTING_DEV_MATERIALIZED_PENDING_C3_E2E',state:HOLD,currentMaterialization:clone(r),message:'Exact runtime, Hosting assets and HR readback verified. Functional and current-source C3 clauses remain pending.',devMaterializationReceiptPath:receiptPath,devMaterializationReceiptGitBlob:blob});
 synchronizeModuleServingAliases(m,{sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,materialization:r,archive:archived});
 for(const mod of m.modules){
  if(mod.classification==='SOURCE_PROVEN_PENDING_DEV_MATERIALIZATION'){(archived.modulePublicationStages||={})[mod.domain]=mod.classification;mod.classification='DEV_HOSTING_MATERIALIZED_PENDING_FUNCTIONAL_E2E';}
  Object.assign(mod,{lastServedSource:r.sourceSha,currentMaterializationRunId:r.runId,servedHostingVersion:r.hostingVersion,servedRuntimeRevision:r.runtimeRevision,currentServingAuthority:clone(serving),currentDevStage:'EXACT_CURRENT_SOURCE_DEV_VERIFIED_FUNCTIONAL_RESIDUAL_UNCHANGED'});
  if(mod.currentEvidenceDimensions)Object.assign(mod.currentEvidenceDimensions,{source:`CURRENT_PRODUCT_${r.sourceSha}_OWNER_PROOFS_PRESERVED`,dev:`EXACT_RUN_${r.runId}_${r.runtimeRevision}_${r.hostingVersion}`,newMatchPromotion:false});
  const hrScope=['canonical-hr-state-adapters','persistence-command-ack-boundary'].includes(mod.domain);
  if(hrScope&&f3Cell){
   must(same(mod.currentF3BoundedCellEvidence,f3Cell)&&Array.isArray(mod.currentResidualClauses)&&mod.currentResidualClauses.length>0,
    'MAPPING_FAILURE:F3_BOUNDED_CELL_MODULE_BINDING');
   oldResidual(mod,archived);
   mod.actionRequired=residualAction(mod);
  }else if(hrScope){oldResidual(mod,archived);mod.currentResidualClauses=['Original Excel project binding, current DEV publication and isolated QA fixture transport are already proved. Preserve those receipts.',(receipt.hrPeriodWindow?'Preserve the verified reading window, confirmed history and explicit historical read. Complete authenticated durable HR; run the existing isolated F3 application fixture for remote ACK, independent readback, lost-response replay, per-field event order, conflict/echo, restoration and cleanup. Credit only uncovered clauses.':'Complete the authorized reading window and authenticated durable HR; run the existing isolated F3 application fixture for remote ACK, independent readback, lost-response replay, per-field event order, conflict/echo, restoration and cleanup. Credit only uncovered clauses.')];if(mod.domain==='persistence-command-ack-boundary')mod.currentResidualClauses.push('Preserve accepted D08/B7/B3/C04/C05 durable evidence and complete uncovered D08/C09/C10 role, session and provider clauses.');mod.actionRequired=mod.currentResidualClauses.join(' ');}
  else if(residualAction(mod)!==null){oldResidual(mod,archived);mod.actionRequired=residualAction(mod);}
  if(mod.domain==='client-portal-reportkit'){
   oldResidual(mod,archived);
   mod.currentResidualClauses={pending:'Independent same-HR KPI parity, uncovered filters/drilldown/visual and role clauses; current-source C3 remains pending.',preserved:'F09 three Client actions, Admin reception and role-negative PASS_RUN2543; historical C3 RUN2564 applies to its exact predecessor; F12 no fabricated benchmark, VRM331 heading and VRM235 clientAuth closure remain preserved.'};
   mod.actionRequired=residualAction(mod);
   for(const o of [d,p,l,m])if(o.currentModuleEvidenceOverrides?.[mod.domain]?.remaining)o.currentModuleEvidenceOverrides[mod.domain].remaining=clone(mod.currentResidualClauses);
  }
 }
 for(const owner of m.sourceFiles||[]){
  if(owner.currentServingAuthority)owner.currentServingAuthority=clone(serving);
  if(Object.hasOwn(owner,'lastServedSource'))owner.lastServedSource=r.sourceSha;
  if(owner.currentBlob){owner.lastServedBlob=owner.currentBlob;owner.changedVsLastServed=false;}
  if(owner.classification==='SOURCE_PROVEN_PENDING_DEV_MATERIALIZATION')owner.classification='DEV_HOSTING_MATERIALIZED_PENDING_FUNCTIONAL_E2E';
 }
 m.classificationCounts=Object.fromEntries(Object.entries(m.modules.reduce((a,x)=>(a[x.classification]=(a[x.classification]||0)+1,a),{})).sort(([a],[b])=>a.localeCompare(b)));
 const cp={...(p.currentCanonicalCheckpoint||{}),path:receiptPath,gitBlob:blob,checkpointGitBlob:blob,status:HOLD,productSourceSha:r.sourceSha,productSourceTree:r.sourceTree,devServedCurrentSourceSha:r.sourceSha,devMaterialization:clone(r),devMaterializationRunId:r.runId,devRuntimeRevision:r.runtimeRevision,devHostingVersion:r.hostingVersion,authority:'AUTOMATIC_EXACT_RUN_RESULT_CONSUMPTION',asOf:now,latestBatchRunId:r.runId,immediateAction:nextAction,moduleMatches:count,moduleTotal:21,production:false};
 p.currentCanonicalCheckpoint=cp;d.currentCanonicalCheckpoint=clone(cp);
 Object.assign(p.continuityHandoff,{authority:'AUTOMATIC_EXACT_RUN_RESULT_CONSUMPTION',path:receiptPath,gitBlob:blob,asOf:now,status:HOLD,productSourceSha:r.sourceSha,productSourceTree:r.sourceTree,latestBatchRunId:r.runId,immediateAction:nextAction});
 for(const o of [d,l,m])o.continuityHandoff=clone(p.continuityHandoff);
 Object.assign(p.activePhaseAClosureLock20261110,{sourceSha:d.productSourceSha,devRuntime:r.runtimeRevision,devHosting:r.hostingVersion});
 for(const o of [d,l,m])if(o.activePhaseAClosureLock20261110)o.activePhaseAClosureLock20261110=clone(p.activePhaseAClosureLock20261110);
 Object.assign(l.currentTruth,{currentMaterializationRunId:r.runId,currentMaterializationSourceSha:r.sourceSha,currentRuntimeRevision:r.runtimeRevision,currentHostingVersion:r.hostingVersion,sourceMaterialized:true,materializationScope:'RUNTIME_AND_HOSTING',moduleMatch:count,currentHostingSourceSha:r.sourceSha,latestDevMaterializationAttempt:clone(r),currentMaterialization:clone(r),currentMaterializationIsPredecessor:false,latestHostingReadbackRunId:r.runId,latestHostingReadbackReceiptPath:receiptPath,latestHostingReadbackReceiptBlob:blob,currentOperationalHrRevision:r.hrRevision,newExternalHrFinding:f3Cell?'F3_BOUNDED_CELL_ACCEPTED_UNCOVERED_FIELDS_ROLES_AND_EXTERNAL_EVENTS':'F3_EXISTING_ISOLATED_FIXTURE_APPLICATION_ACK_REPLAY_CONFLICT_ECHO_CLEANUP_PENDING'});
 Object.assign(l.governance,{currentMaterialization:clone(r),postDeployRunSeal:clone(seal)});
 if(l.currentClosureState){l.currentClosureState.i3Technical='HOLD_ONLY_UNCOVERED_FUNCTIONAL_CLAUSES_CURRENT_DEV_EXACT';l.currentClosureState.d08Progress=d.d08AcademyProgressResidual?.status||l.currentClosureState.d08Progress;}
 if(finding){l.findings[finding.id]=clone(finding.value);}
 if(receipt.hrPeriodWindow&&l.findings['VRM-375'])Object.assign(l.findings['VRM-375'],{state:'PASS_DEV_WINDOW_HISTORY_EXPLICIT_READ_AUTHENTICATED_UI_AND_DOMAIN_CLAUSES_PENDING',devReceiptPath:receiptPath,devReceiptBlob:blob,devRunId:r.runId,newDomainMatches:0});
 const ids=Object.keys(l.findings).sort(),next='VRM-'+String(ids.length+1).padStart(3,'0');
 l.findingCount=ids.length;l.nextFindingId=next;Object.assign(l.governance,{findingCount:ids.length,nextFindingId:next,findingIdsPresent:ids});
 d.nextFindingId=p.nextFindingId=next;
 const archivePath=`docs/checkpoints/CXORBIA_I3_RUN${r.runId}_ATTEMPT${r.runAttempt}_ACTIVE_ALIAS_HISTORY.json`;
 for(const o of [d,p,l,m])o.activeAliasHistory={path:archivePath,gitBlob:gitBlob(jsonBytes(archived)),semantics:'IMMUTABLE_SUPERSEDED_ACTIVE_HEADERS_NOT_EXECUTION_AUTHORITY'};
 const projection={schemaVersion:PROJECTION_SCHEMA,receiptPath,receiptBlob:blob,runId:r.runId,runAttempt:r.runAttempt,sourceSha:r.sourceSha,sourceTree:r.sourceTree,historicalC3SourceSha:c3.sourceSha,currentSourceC3Certified:false,domainPromotion:false,production:false};
 Object.assign(projection,clone(technical));
 for(const o of [d,p,l,m])o.currentControlProjection=clone(projection);
 projectCurrentResidualNextAction(out,{completedTaskIds:input.pointer.nextPlannedBlock?.completedTaskIds||[]});
 assertPreserved(input,out);
 return { ...out,receiptPath,receipt,archivePath,archived,matrixPath,ledgerPath,noop:false};
}

export function bindControlPaths(out,{matrixPath,ledgerPath}){
 const {descriptor:d,pointer:p,ledger:l,matrix:m}=out;
 // This is a current document reference; historical evidence entries stay immutable.
 if(d.currentCumulativeTaskEvidenceMap)for(const control of [p,m,l])control.currentCumulativeTaskEvidenceMap=clone(d.currentCumulativeTaskEvidenceMap);
 m.version=matrixPath.match(/-(V\d+)\.json$/)?.[1]||m.version;
 m.findingsLedgerPath=ledgerPath;
 const matrixBlob=gitBlob(jsonBytes(m));
 p.moduleTruthAuthority={path:matrixPath,gitBlob:matrixBlob};
 Object.assign(p.activeShockModuleTruth,{sourceSha:d.productSourceSha,matrixPath,matrixBlob,classificationCounts:clone(m.classificationCounts),derivedAt:d.updatedAt,meaning:'CURRENT_PAIRED_DEV_EXACT_FUNCTIONAL_CLAUSES_PENDING'});
 Object.assign(l,{currentLedgerSuccessor:ledgerPath,findingsLedgerPath:ledgerPath});
 if(l.governance)l.governance.currentLedgerSuccessor=ledgerPath;
 Object.assign(l.currentTruth,{moduleTruthPath:matrixPath,moduleTruthGitBlob:matrixBlob});
 const ledgerBlob=gitBlob(jsonBytes(l));
 for(const o of [d,p]){
  Object.assign(o,{moduleTruthPath:matrixPath,moduleTruthExpectedGitBlob:matrixBlob,findingsLedgerPath:ledgerPath,findingsLedgerExpectedGitBlob:ledgerBlob});
  if(o.currentCanonicalControl)Object.assign(o.currentCanonicalControl,{matrix:{...o.currentCanonicalControl.matrix,path:matrixPath,gitBlob:matrixBlob},ledger:{...o.currentCanonicalControl.ledger,path:ledgerPath,gitBlob:ledgerBlob}});
 }
 const acc=p.activePhaseAClosureLock20261110.currentAccountingSemantics.strictOwnerDomainMatch;
 Object.assign(acc.evidence,{path:matrixPath,gitBlob:matrixBlob});
 // The same business lock can occur in descriptor. Its accounting evidence is a pointer, not historical C3 data.
 if(d.activePhaseAClosureLock20261110)d.activePhaseAClosureLock20261110=clone(p.activePhaseAClosureLock20261110);
 const files=new Map([[DESCRIPTOR,jsonBytes(d)],[POINTER,jsonBytes(p)],[matrixPath,jsonBytes(m)],[ledgerPath,jsonBytes(l)]]);
 if(out.receiptPath)files.set(out.receiptPath,jsonBytes(out.receipt));
 if(out.archivePath)files.set(out.archivePath,jsonBytes(out.archived));
 return files;
}

export function validateProjectionRegistry({descriptor:d,pointer:p,ledger:l,matrix:m}){
 const errors=[],check=(ok,path)=>{if(!ok)errors.push('CURRENT_PROJECTION_DESYNC:'+path);};
 if(!d.currentControlProjection)return {pass:true,failures:[]};
 const seal=d.postDeployRunSeal,materialization=d.currentMaterialization,c3=d.currentC3PreterminalAudit;
 for(const [name,o]of Object.entries({descriptor:d,pointer:p,ledger:l,matrix:m})){
  if(d.currentCumulativeTaskEvidenceMap||o.currentCumulativeTaskEvidenceMap)check(same(o.currentCumulativeTaskEvidenceMap,d.currentCumulativeTaskEvidenceMap),name+'.currentCumulativeTaskEvidenceMap');
  for(const key of REGISTRY.executionCursors)if(d[key]||o[key])check(same(o[key],d[key]),name+'.'+key);
  for(const key of REGISTRY.executionIdentity){
   check(same(o.postDeployRunSeal?.[key],materialization[key]),name+'.postDeployRunSeal.'+key);
   check(same(o.currentControlProjection?.[key],materialization[key]),name+'.currentControlProjection.'+key);
  }
  check(same(o.currentControlProjection,d.currentControlProjection),name+'.currentControlProjection');
  for(const key of REGISTRY.materialization)if(Object.hasOwn(o,key))check(same(o[key],materialization),name+'.'+key);
  for(const key of REGISTRY.execution)check(same(o[key],d.currentExecutionReceipt),name+'.'+key);
  check(same(o.i3Q2HostingReleaseC3Pending,d.i3Q2HostingReleaseC3Pending),name+'.i3Q2HostingReleaseC3Pending');
  check(same(o.lastModuleTruthProof,c3),name+'.lastModuleTruthProof');
  check(o.lastServedSource===seal.sourceSha,name+'.lastServedSource');
  check(o.nextPlannedBlock?.exactPending===d.exactNextAction,name+'.nextPlannedBlock');
  check(o.exactNextAction===d.exactNextAction&&o.nextExactAction===d.exactNextAction,name+'.nextExactAction');
  check(o.activeAuthoritySemantics===d.activeAuthoritySemantics,name+'.activeAuthoritySemantics');
  if(Object.hasOwn(o,'asOf'))check(o.asOf===o.updatedAt,name+'.asOf');
  for(const key of REGISTRY.obsolete)check(!Object.hasOwn(o,key),name+'.'+key+'.must_be_historical');
  check(!Object.hasOwn(o.continuityHandoff||{},'independentD08UiQaRequest'),name+'.continuityHandoff.independentD08UiQaRequest.must_be_historical');
  if(o.currentD08UiQaRequest)check(!(o.currentFunctionalEvidenceIndex?.results||[]).some(x=>x.decision==='PASS_D08_TYPED_PARTIAL_INCORPORATION'&&x.requestBinding?.path===o.currentD08UiQaRequest.path&&x.requestBinding.gitBlob===o.currentD08UiQaRequest.gitBlob),name+'.currentD08UiQaRequest.already_satisfied');
  if(seal.mode==='CURRENT_SOURCE_SERVING')for(const key of REGISTRY.completedPending)check(!Object.hasOwn(o,key),name+'.'+key+'.already_completed');
  if(o.canonicalFunctionalCandidate){check(o.canonicalFunctionalCandidate.nextExactAction===d.exactNextAction,name+'.canonicalFunctionalCandidate.nextExactAction');check(same(o.canonicalFunctionalCandidate.currentMaterialization,materialization),name+'.canonicalFunctionalCandidate.currentMaterialization');}
 }
 check(same(m.productSource.currentMaterialization,materialization),'matrix.productSource.currentMaterialization');
 check(l.currentTruth.currentHostingSourceSha===seal.sourceSha&&same(l.currentTruth.currentMaterialization,materialization)&&same(l.currentTruth.latestDevMaterializationAttempt,materialization),'ledger.currentTruth.materialization');
 check(l.currentTruth.latestHostingReadbackRunId===seal.runId&&l.currentTruth.latestHostingReadbackReceiptPath===seal.receiptPath&&l.currentTruth.latestHostingReadbackReceiptBlob===seal.receiptBlob,'ledger.currentTruth.latestHostingReadback');
 check(seal.runId===d.currentControlProjection.runId,'projection.runId');
 check(seal.receiptPath===d.currentControlProjection.receiptPath&&seal.receiptBlob===d.currentControlProjection.receiptBlob,'projection.receipt');
 check(!Object.hasOwn(l.findings?.['VRM-369']||{},'currentExecutionScope'),'ledger.findings.VRM-369.currentExecutionScope.must_be_historical');
 check(l.findingsLedgerPath===d.findingsLedgerPath&&l.currentLedgerSuccessor===d.findingsLedgerPath&&l.governance?.currentLedgerSuccessor===d.findingsLedgerPath,'ledger.currentLedgerPath');
 for(const mod of m.modules){
  check(mod.lastServedSource===seal.sourceSha,`matrix.modules.${mod.domain}.lastServedSource`);
  for(const key of REGISTRY.materialization)if(Object.hasOwn(mod,key))check(same(mod[key],materialization),`matrix.modules.${mod.domain}.${key}`);
  // Candidate identity advances independently of the immutable served predecessor.
  for(const [key,value]of Object.entries({currentCandidateSource:d.productSourceSha,currentCandidateTree:d.productSourceTree,cumulativeSource:d.productSourceSha}))if(Object.hasOwn(mod,key))check(mod[key]===value,`matrix.modules.${mod.domain}.${key}`);
  if(seal.mode==='CURRENT_SOURCE_SERVING'&&seal.sourceSha===d.productSourceSha){
   check(!Object.hasOwn(mod,'currentF2OperationalExcel'),`matrix.modules.${mod.domain}.currentF2OperationalExcel.must_be_historical`);
   check(mod.sourceClosure?.state!=='COMPOSED_NOT_DEPLOYED',`matrix.modules.${mod.domain}.sourceClosure.already_deployed`);
  }
  if(seal.mode==='CURRENT_SOURCE_SERVING'&&residualAction(mod)!==null)check(mod.actionRequired===residualAction(mod),`matrix.modules.${mod.domain}.actionRequired`);
  if(mod.domain==='client-portal-reportkit'&&d.currentControlProjection.currentSourceC3Certified===false)check(!/RUN2564 current-source C3 is complete/.test(mod.actionRequired||''),`matrix.modules.${mod.domain}.historicalC3`);
 }
 for(const owner of m.sourceFiles||[]){
  if(owner.currentServingAuthority)check(same(owner.currentServingAuthority,d.currentServingAuthority),`matrix.sourceFiles.${owner.path}.currentServingAuthority`);
  if(Object.hasOwn(owner,'lastServedSource'))check(owner.lastServedSource===seal.sourceSha,`matrix.sourceFiles.${owner.path}.lastServedSource`);
 }
 return {pass:errors.length===0,failures:errors};
}
