import {createHash} from 'node:crypto';

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

// Enumerated active compatibility paths only. No recursive prefix rewriting.
export const REGISTRY={
 materialization:['currentMaterialization','currentDevMaterialization','lastDevMaterialization','latestDevMaterialization','latestDev'],
 execution:['currentExecutionReceipt','lastExecutionReceipt','latestExecutionReceipt'],
 obsolete:['currentAuthorityAliasPrevention','currentControlStatusCompatibilityRepair','currentHarnessOnlyCorrection','currentSessionProofPackage','currentSessionProofRequest','currentSourceReproof','currentSourceSuccessor419','devCertification','humanVisualCheckpointState','lastModuleTruthAttempt','lastSourceFix','lastSourceProof','latestFocalSourceFix','latestSourceSuccessor','sourceReproof','currentB14ToolboxStatus','currentB14ExecutionPrerequisite','currentF3EnvironmentReadback','planChoque20261113'],
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

export function makeMaterializationReceipt({run,job,artifact,result,hrResult,mailbox,hrWindow,requireHrWindow=false,sourceAssets,verifiedArchiveDigest}){
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
 must(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].every(k=>hrResult[k]===result[k])&&Number(hrResult.runId)===run.id&&hrResult.revision===result.hrRevision&&hrResult.production===false&&hrResult.fullDomain===false&&['firestoreWrites','authWrites','hrWrites','commandPosts'].every(k=>hrResult[k]===0),'SOURCE_FAILURE:HR_READBACK_IDENTITY_OR_SCOPE');
 must(result.hrWrites===0&&result.firestoreRulesDeploys===0&&result.storageRulesDeploys===0,'RELEASE_COMPOSITION_FAILURE:UNEXPECTED_WRITE');
 if(requireHrWindow)must(Boolean(hrWindow),'SOURCE_FAILURE:HR_WINDOW_REQUIRED');
 if(hrWindow){
  must(hrWindow.decision==='PASS_HR_PERIOD_WINDOW_HISTORY_AND_EXPLICIT_READ'&&hrWindow.schemaVersion==='cxorbia.i3.hr-period-window-dev.v1'&&
   ['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].every(k=>hrWindow[k]===result[k])&&Number(hrWindow.runId)===run.id&&hrWindow.runAttempt===run.run_attempt&&hrWindow.revision===result.hrRevision,'SOURCE_FAILURE:HR_WINDOW_IDENTITY');
  must(hrWindow.production===false&&hrWindow.fullDomain===false&&hrWindow.authenticatedUiCertified===false&&['firestoreWrites','authWrites','hrWrites','commandPosts','operationalImports'].every(k=>hrWindow[k]===0),'SOURCE_FAILURE:HR_WINDOW_SCOPE');
  must(hrWindow.rolling?.mode==='rolling_window'&&hrWindow.returned?.mode==='rolling_window'&&same(hrWindow.rolling.periodIds,hrWindow.returned.periodIds)&&hrWindow.returned.revision===result.hrRevision&&hrWindow.rolling.periodIds.length<=3&&hrWindow.rolling.periodIds.length>0&&hrWindow.explicit?.mode==='explicit_period'&&hrWindow.explicit.periodIds.length===1&&!hrWindow.rolling.periodIds.includes(hrWindow.explicit.periodIds[0])&&hrWindow.history?.externalReadCurrent===false&&hrWindow.history.available===true&&hrWindow.history.originalSeedVisits===836&&hrWindow.history.periods>=19,'SOURCE_FAILURE:HR_WINDOW_INCOMPLETE');
 }
 const receiptPath=`docs/checkpoints/CXORBIA_I3_RUN${run.id}_ATTEMPT${run.run_attempt}_AUTOMATIC_DEV_RECEIPT.json`;
 const materialization={...result};delete materialization.servedSha256;
 Object.assign(materialization,{runId:run.id,runNumber:run.run_number,runAttempt:run.run_attempt,jobId:job.id,jobConclusion:job.conclusion,controlHeadAtDeploy:run.head_sha,artifactId:artifact.id,artifactDigest:artifact.digest,artifactDigestType:'GITHUB_ACTIONS_DEV_EVIDENCE_ZIP_SHA256_NOT_I4_CERTIFIED_TAR',materializationReceiptPath:receiptPath,hrLiveVerified:true,state:'PASS_DEV_EXACT_FUNCTIONAL_AND_CURRENT_C3_PENDING',humanAcceptance:'B4_B5_B6_B7_PASS_PRESERVED_NO_NEW_APPROVAL',fullTaskClosed:false});
 return {receiptPath,receipt:{schemaVersion:'cxorbia.i3.current-source-dev-materialization.v1',kind:'EXACT_PAIRED_DEV_ACK_NOT_FUNCTIONAL_CERTIFICATE',iteration:'I3',state:'HOLD',source:{sha:result.sourceSha,tree:result.sourceTree},sourceSha:result.sourceSha,sourceTree:result.sourceTree,workflowRunId:run.id,runId:run.id,runNumber:run.run_number,runAttempt:run.run_attempt,jobId:job.id,jobConclusion:job.conclusion,artifactId:artifact.id,artifactDigest:artifact.digest,archiveDigestVerified:true,observedAt:job.completed_at,decision:result.decision,materialization,servedSha256:result.servedSha256,verifiedServedAssetCount:assets.length,sourceHostedExact:true,productionUnchanged:true,production:false,i4Authorized:false,phaseAComplete:false,terminalCertified:false,newDomainMatches:0,hrReadback:hrResult,hrPeriodWindow:hrWindow||null,mailboxEnvironment:mailbox||null,scope:'DEV_MATERIALIZATION_ONLY_NO_DOMAIN_OR_HUMAN_PROMOTION'}};
}

function oldResidual(mod,archive){(archive.modules||={})[mod.domain]={actionRequired:mod.actionRequired,currentResidualClauses:clone(mod.currentResidualClauses)};}

export function residualAction(mod){
 const residual=mod.currentResidualClauses;
 if(Array.isArray(residual))return residual.join(' ');
 if(residual?.pending)return residual.pending+(residual.preserved?' PRESERVE: '+residual.preserved:'');
 return null;
}

function archiveActive(object,keys,archive){for(const key of keys)if(Object.hasOwn(object,key)){archive[key]=object[key];delete object[key];}}

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

export function projectMaterialization(input,{receipt,receiptPath,now=receipt.observedAt,ledgerPath,matrixPath,finding}){
 const out=Object.fromEntries(['descriptor','pointer','ledger','matrix'].map(k=>[k,clone(input[k])])),{descriptor:d,pointer:p,ledger:l,matrix:m}=out;
 const r=receipt.materialization,blob=gitBlob(jsonBytes(receipt));
 const nextAction=receipt.hrPeriodWindow?NEXT.replace('Complete the authorized previous/current/next HR reading window without discarding confirmed history; prove', 'The previous/current/next HR reading window, retained history and explicit older-period read are verified. Prove'):NEXT;
 must(r.sourceSha===d.productSourceSha&&r.sourceTree===d.productSourceTree,'SOURCE_FAILURE:RESULT_IS_NOT_CURRENT_PRODUCT');
 must(Number(r.runId)>Number(d.currentMaterialization?.runId||0)||(Number(r.runId)===Number(d.currentMaterialization?.runId||0)&&Number(r.runAttempt)>=Number(d.currentMaterialization?.runAttempt||1)),'SOURCE_FAILURE:OUT_OF_ORDER_MATERIALIZATION');
 if(d.postDeployRunSeal?.receiptPath===receiptPath){must(d.postDeployRunSeal.receiptBlob===blob,'SOURCE_FAILURE:REPLAY_RECEIPT_CHANGED');return {noop:true,...out};}
 const archived={schemaVersion:'cxorbia.i3.active-alias-migration.v1',reason:'Historical active aliases are archived verbatim; operational projection is derived from exact receipt.',observedAt:now,controls:{}};
 const c3=d.currentC3PreterminalAudit;
 const seal={schemaVersion:'cxorbia.i3.postdeploy-consistency-seal.v1',mode:'CURRENT_SOURCE_SERVING',...Object.fromEntries(['runId','runNumber','sourceSha','sourceTree','artifactDigest','runtimeRevision','runtimeDigest','hostingVersion','hostingRelease','firestoreRuleset','hrRevision'].map(k=>[k,r[k]])),receiptPath,receiptBlob:blob,liveE2e:'EXACT_DEV_READBACK_FUNCTIONAL_CLAUSES_PENDING',hrLiveVerified:true,certifiable:false,humanAcceptance:'B4_B5_B6_B7_PASS_PRESERVED',gate20:'HOLD',gate21:'HOLD',production:false};
 const execution={path:receiptPath,gitBlob:blob,receiptPath,receiptBlob:blob,kind:receipt.kind,decision:receipt.decision,state:'HOLD',...Object.fromEntries(['runId','runNumber','runAttempt','jobId','artifactId','artifactDigest','sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','hrRevision'].map(k=>[k,r[k]])),materializationRunId:r.runId,provider:'excel_online',production:false,terminalCertified:false,phaseAComplete:false,i4Authorized:false,matchModules:m.modules.filter(x=>x.classification==='MATCH').length,nonMatchModules:m.modules.filter(x=>x.classification!=='MATCH').length};
 const preC3={state:'DEV_RUNTIME_AND_HOSTING_VERIFIED_C3_PENDING',...Object.fromEntries(['sourceSha','sourceTree','hostingVersion','hostingRelease','runtimeRevision','runtimeDigest','runId','runNumber'].map(k=>[k,r[k]])),previousC3SourceSha:c3.sourceSha,previousC3SourceTree:c3.sourceTree,previousHostingVersion:c3.hostingVersion,previousRuntimeRevision:c3.runtimeRevision,receiptPath,receiptBlob:blob,production:false,scope:'CURRENT_PAIRED_DEV_VERIFIED_PRIOR_C3_HISTORICAL_CURRENT_C3_PENDING'};
 const serving={path:receiptPath,gitBlob:blob,receiptPath,receiptBlob:blob,...Object.fromEntries(['sourceSha','sourceTree','runId','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,r[k]])),scope:'EXACT_DEV_MATERIALIZATION_NOT_FUNCTIONAL_OR_HUMAN_CERTIFICATE'};
 const binding={...serving,materializationRunId:r.runId,observedRunId:r.runId,hrRevision:r.hrRevision,provider:'excel_online',production:false,runtimeProjectBindingResolutionProven:true,b14Closed:false};
 for(const [name,o]of Object.entries(out)){
  const old=archived.controls[name]={};
  if(Object.hasOwn(o,'asOf')){old.asOf=o.asOf;o.asOf=now;}
  for(const k of [...REGISTRY.materialization,...REGISTRY.execution,'nextPlannedBlock','activeAuthoritySemantics','lastModuleTruthProof','i3Q2HostingReleaseC3Pending'])if(Object.hasOwn(o,k))old[k]=clone(o[k]);
  archiveActive(o,[...REGISTRY.obsolete,...REGISTRY.completedPending],old);
  for(const k of Object.keys(o).filter(k=>k.startsWith('currentSuccessor'))){old[k]=o[k];delete o[k];}
  for(const k of REGISTRY.materialization)if(Object.hasOwn(o,k)||['currentMaterialization','currentDevMaterialization'].includes(k))o[k]=clone(r);
  for(const k of REGISTRY.execution)o[k]=clone(execution);
  Object.assign(o,{updatedAt:now,status:HOLD,state:'HOLD',activeBlocker:'CURRENT_SOURCE_FUNCTIONAL_CLOSURE_AND_E08_ENVIRONMENT_HOLD',activeBlockers:['F3_APPLICATION_ACK_REPLAY_CONFLICT_ECHO_CLEANUP','UNCOVERED_DOMAIN_CLAUSES','CURRENT_SOURCE_C3_GATE20_GATE21','E08_MAILBOX_UNCONFIGURED'],currentMaterializationIsPredecessorOnly:false,lastServedSource:r.sourceSha,currentServingAuthority:clone(serving),postDeployRunSeal:clone(seal),currentRuntimeBinding:clone(binding),i3Q2HostingReleaseC3Pending:clone(preC3),exactNextAction:nextAction,nextExactAction:nextAction,currentExecutionReceiptSemantics:'LAST_TYPED_EXECUTION_IS_INDEPENDENT_OF_LAST_DEPLOYMENT_AND_LAST_HR_OBSERVATION',lastExecutionReceiptSemantics:'LAST_TYPED_EXECUTION_IS_INDEPENDENT_OF_LAST_DEPLOYMENT_AND_LAST_HR_OBSERVATION',activeAuthoritySemantics:`Current product ${r.sourceSha}; DEV run ${r.runId}, runtime ${r.runtimeRevision}, Hosting ${r.hostingVersion}. Six existing MATCH and prior C3 are preserved; this deployment is not domain certification.`,nextPlannedBlock:{taskIds:[...(receipt.hrPeriodWindow?[]:['HR_PERIOD_WINDOW']),'F3','A08','D08','FINANCE_RESIDUAL','E08','G20','G21'],completedTaskIds:receipt.hrPeriodWindow?['HR_PERIOD_WINDOW']:[],exactPending:nextAction,sourceSha:d.productSourceSha,production:false}});
  if(receipt.hrPeriodWindow)o.currentHrPeriodWindow={...clone(receipt.hrPeriodWindow),receiptPath,receiptBlob:blob,scope:'READ_WINDOW_AND_HISTORY_ONLY_NO_DOMAIN_PROMOTION'};
  // A fresh paired HR read is its own fact; do not relabel an old F2 config-write receipt.
  if(o.currentF2OperationalExcel){old.currentF2OperationalExcel=o.currentF2OperationalExcel;delete o.currentF2OperationalExcel;}
  o.lastHrObservation={runId:r.runId,sourceSha:r.sourceSha,sourceTree:r.sourceTree,hrRevision:r.hrRevision,receiptPath,receiptBlob:blob,provider:'excel_online',production:false,kind:'EXACT_PAIRED_READONLY_HR_OBSERVATION'};
  o.lastModuleTruthProof=clone(c3);o.c3PreterminalProof=clone(c3);o.currentC3PreterminalAudit=clone(c3);
  if(o.canonicalFunctionalCandidate){old.canonicalFunctionalCandidateMaterialization=clone(o.canonicalFunctionalCandidate.currentMaterialization);Object.assign(o.canonicalFunctionalCandidate,{state:'RUNTIME_AND_HOSTING_DEV_MATERIALIZED_FUNCTIONAL_C3_PENDING',currentMaterialization:clone(r),nextExactAction:nextAction,exactNextAction:nextAction});}
  if(o.currentMailboxEnvironmentHold&&receipt.mailboxEnvironment){old.currentMailboxEnvironmentHold=clone(o.currentMailboxEnvironmentHold);Object.assign(o.currentMailboxEnvironmentHold,{runtimeRevision:r.runtimeRevision,observedRunId:r.runId,reason:receipt.mailboxEnvironment.secretMetadataOutcome==='PERMISSION_DENIED'?'Mailbox key metadata lookup was denied; key existence is not established. Retain E08 functional HOLD.':'Mailbox environment observation only; authenticated functional E08 proof remains required.',secretMetadataOutcome:receipt.mailboxEnvironment.secretMetadataOutcome,mailboxEnabled:receipt.mailboxEnvironment.mailboxEnabled,sendEnabled:receipt.mailboxEnvironment.sendEnabled,receiptPath,receiptBlob:blob});}
  if(o.d08AcademyProgressResidual?.currentMaterialization)o.d08AcademyProgressResidual.currentMaterialization=clone(r);
 }
 const count=execution.matchModules;
 archived.matrixProductSourceMaterialization=clone(m.productSource.currentMaterialization);
 Object.assign(m.productSource,{authorityState:'RUNTIME_AND_HOSTING_DEV_MATERIALIZED_PENDING_C3_E2E',state:HOLD,currentMaterialization:clone(r),message:'Exact runtime, Hosting assets and HR readback verified. Functional and current-source C3 clauses remain pending.',devMaterializationReceiptPath:receiptPath,devMaterializationReceiptGitBlob:blob});
 synchronizeModuleServingAliases(m,{sourceSha:d.productSourceSha,sourceTree:d.productSourceTree,materialization:r,archive:archived});
 for(const mod of m.modules){
  if(mod.classification==='SOURCE_PROVEN_PENDING_DEV_MATERIALIZATION'){(archived.modulePublicationStages||={})[mod.domain]=mod.classification;mod.classification='DEV_HOSTING_MATERIALIZED_PENDING_FUNCTIONAL_E2E';}
  Object.assign(mod,{lastServedSource:r.sourceSha,currentMaterializationRunId:r.runId,servedHostingVersion:r.hostingVersion,servedRuntimeRevision:r.runtimeRevision,currentServingAuthority:clone(serving),currentDevStage:'EXACT_CURRENT_SOURCE_DEV_VERIFIED_FUNCTIONAL_RESIDUAL_UNCHANGED'});
  if(mod.currentEvidenceDimensions)Object.assign(mod.currentEvidenceDimensions,{source:`CURRENT_PRODUCT_${r.sourceSha}_OWNER_PROOFS_PRESERVED`,dev:`EXACT_RUN_${r.runId}_${r.runtimeRevision}_${r.hostingVersion}`,newMatchPromotion:false});
  if(['canonical-hr-state-adapters','persistence-command-ack-boundary'].includes(mod.domain)){oldResidual(mod,archived);mod.currentResidualClauses=['Original Excel project binding, current DEV publication and isolated QA fixture transport are already proved. Preserve those receipts.',(receipt.hrPeriodWindow?'Preserve the verified reading window, confirmed history and explicit historical read. Complete authenticated durable HR; run the existing isolated F3 application fixture for remote ACK, independent readback, lost-response replay, per-field event order, conflict/echo, restoration and cleanup. Credit only uncovered clauses.':'Complete the authorized reading window and authenticated durable HR; run the existing isolated F3 application fixture for remote ACK, independent readback, lost-response replay, per-field event order, conflict/echo, restoration and cleanup. Credit only uncovered clauses.')];if(mod.domain==='persistence-command-ack-boundary')mod.currentResidualClauses.push('Preserve accepted D08/B7/B3/C04/C05 durable evidence and complete uncovered D08/C09/C10 role, session and provider clauses.');mod.actionRequired=mod.currentResidualClauses.join(' ');}
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
 Object.assign(l.currentTruth,{currentMaterializationRunId:r.runId,currentMaterializationSourceSha:r.sourceSha,currentRuntimeRevision:r.runtimeRevision,currentHostingVersion:r.hostingVersion,sourceMaterialized:true,materializationScope:'RUNTIME_AND_HOSTING',moduleMatch:count,currentHostingSourceSha:r.sourceSha,latestDevMaterializationAttempt:clone(r),currentMaterialization:clone(r),currentMaterializationIsPredecessor:false,latestHostingReadbackRunId:r.runId,latestHostingReadbackReceiptPath:receiptPath,latestHostingReadbackReceiptBlob:blob,currentOperationalHrRevision:r.hrRevision,newExternalHrFinding:'F3_EXISTING_ISOLATED_FIXTURE_APPLICATION_ACK_REPLAY_CONFLICT_ECHO_CLEANUP_PENDING'});
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
 for(const o of [d,p,l,m])o.currentControlProjection=clone(projection);
 assertPreserved(input,out);
 return { ...out,receiptPath,receipt,archivePath,archived,matrixPath,ledgerPath,noop:false};
}

export function bindControlPaths(out,{matrixPath,ledgerPath}){
 const {descriptor:d,pointer:p,ledger:l,matrix:m}=out;
 m.version=matrixPath.match(/-(V\d+)\.json$/)?.[1]||m.version;
 m.findingsLedgerPath=ledgerPath;
 const matrixBlob=gitBlob(jsonBytes(m));
 p.moduleTruthAuthority={path:matrixPath,gitBlob:matrixBlob};
 Object.assign(p.activeShockModuleTruth,{sourceSha:d.productSourceSha,matrixPath,matrixBlob,classificationCounts:clone(m.classificationCounts),derivedAt:d.updatedAt,meaning:'CURRENT_PAIRED_DEV_EXACT_FUNCTIONAL_CLAUSES_PENDING'});
 Object.assign(l,{currentLedgerSuccessor:ledgerPath});
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
 return new Map([[DESCRIPTOR,jsonBytes(d)],[POINTER,jsonBytes(p)],[matrixPath,jsonBytes(m)],[ledgerPath,jsonBytes(l)],[out.receiptPath,jsonBytes(out.receipt)],[out.archivePath,jsonBytes(out.archived)]]);
}

export function validateProjectionRegistry({descriptor:d,pointer:p,ledger:l,matrix:m}){
 const errors=[],check=(ok,path)=>{if(!ok)errors.push('CURRENT_PROJECTION_DESYNC:'+path);};
 if(!d.currentControlProjection)return {pass:true,failures:[]};
 const seal=d.postDeployRunSeal,materialization=d.currentMaterialization,c3=d.currentC3PreterminalAudit;
 for(const [name,o]of Object.entries({descriptor:d,pointer:p,ledger:l,matrix:m})){
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
  if(seal.mode==='CURRENT_SOURCE_SERVING')for(const key of REGISTRY.completedPending)check(!Object.hasOwn(o,key),name+'.'+key+'.already_completed');
  if(o.canonicalFunctionalCandidate){check(o.canonicalFunctionalCandidate.nextExactAction===d.exactNextAction,name+'.canonicalFunctionalCandidate.nextExactAction');check(same(o.canonicalFunctionalCandidate.currentMaterialization,materialization),name+'.canonicalFunctionalCandidate.currentMaterialization');}
 }
 check(same(m.productSource.currentMaterialization,materialization),'matrix.productSource.currentMaterialization');
 check(l.currentTruth.currentHostingSourceSha===seal.sourceSha&&same(l.currentTruth.currentMaterialization,materialization)&&same(l.currentTruth.latestDevMaterializationAttempt,materialization),'ledger.currentTruth.materialization');
 check(l.currentTruth.latestHostingReadbackRunId===seal.runId&&l.currentTruth.latestHostingReadbackReceiptPath===seal.receiptPath&&l.currentTruth.latestHostingReadbackReceiptBlob===seal.receiptBlob,'ledger.currentTruth.latestHostingReadback');
 check(seal.runId===d.currentControlProjection.runId,'projection.runId');
 check(seal.receiptPath===d.currentControlProjection.receiptPath&&seal.receiptBlob===d.currentControlProjection.receiptBlob,'projection.receipt');
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
