/* Current control-plane compatibility aliases must not contradict the canonical
   descriptor-selected ledger and DEV seal. Historical nested evidence is immutable;
   only explicitly current top-level fields are compared here. */
export function validateCurrentAuthorityAliases({descriptor:d,pointer:p,ledger:l,matrix:m}){
  const failures=[];
  const check=(condition,code)=>{if(!condition)failures.push(code);};
  const ids=Object.keys(l?.findings||{}).sort();
  const count=ids.length,next='VRM-'+String(count+1).padStart(3,'0');
  const ledgerPath=String(d?.findingsLedgerPath||'');
  const action=String(d?.exactNextAction||'');
  const blocker=String(d?.activeBlocker||'');
  const source=String(d?.productSourceSha||'');
  const tree=String(d?.productSourceTree||'');
  const current=l?.currentTruth||{};
  const seal=l?.currentMaterialization||{};
  const currentDev=p?.currentDevMaterialization||{};
  const phaseLock=p?.activePhaseAClosureLock20261110||{};
  check(phaseLock.currentAccountingSemantics?.strictOwnerDomainMatch?.matched===phaseLock.strictDomainMatches&&
    phaseLock.currentAccountingSemantics?.strictOwnerDomainMatch?.total===21&&
    phaseLock.currentAccountingSemantics?.humanFunctionalBlocks?.passed===phaseLock.phaseABlocksHumanPassed&&
    phaseLock.currentAccountingSemantics?.humanFunctionalBlocks?.total===9,'CURRENT_PHASE_LOCK_NESTED_ACCOUNTING_DESYNC');
  // A source-proven successor can precede its DEV deployment. In that state
  // the materialization is immutable evidence of the *served predecessor*;
  // forcing its source/tree aliases to match the new source would falsify DEV.
  const postDeploy=d?.postDeployRunSeal||{};
  const pendingServing=postDeploy.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'&&
    p?.postDeployRunSeal?.mode===postDeploy.mode&&
    postDeploy.sourceSha!==source&&postDeploy.sourceTree!==tree&&
    seal.sourceSha===postDeploy.sourceSha&&seal.sourceTree===postDeploy.sourceTree&&
    current?.sourceMaterialized===false;
  // Hosting-only DEV can serve the current frontend source while the last
  // immutable *paired* Cloud Run + Hosting receipt remains the predecessor.
  // The business-facing phase lock must then point to the newer served Hosting,
  // never to the old paired Hosting version or a fictitious runtime deploy.
  const hosting=d?.currentHostingOnlyDevMaterialization||{};
  const hostingP=p?.currentHostingOnlyDevMaterialization||{};
  const pending=d?.pendingDevSuccessor||{};
  const pendingHostingOnly=pending.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION'&&
    ['HOSTING_ONLY','RUNTIME_AND_HOSTING'].includes(pending.scope)&&pending.production===false&&pending.devPublished===false&&
    JSON.stringify(pending)===JSON.stringify(p?.pendingDevSuccessor||null)&&
    pending.sourceSha===source&&pending.sourceTree===tree&&
    pending.predecessorProductSourceSha===hosting.sourceSha&&
    JSON.stringify(pending.servingHosting)===JSON.stringify(hosting)&&
    JSON.stringify(hosting)===JSON.stringify(hostingP)&&
    hosting.runtimeRevision===seal.runtimeRevision&&
    current?.sourceMaterialized===false;
  const pendingFromPaired=pendingServing&&!d?.currentHostingOnlyDevMaterialization&&!p?.currentHostingOnlyDevMaterialization&&
    pending.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION'&&['HOSTING_ONLY','RUNTIME_AND_HOSTING'].includes(pending.scope)&&
    pending.production===false&&pending.devPublished===false&&pending.sourceSha===source&&pending.sourceTree===tree&&
    pending.predecessorProductSourceSha===seal.sourceSha&&!pending.servingHosting&&
    JSON.stringify(pending)===JSON.stringify(p?.pendingDevSuccessor||null)&&
    JSON.stringify(pending.servingPairedMaterialization)===JSON.stringify(d?.currentMaterialization)&&
    JSON.stringify(pending.servingPairedMaterialization)===JSON.stringify(seal)&&
    JSON.stringify(pending.servingPairedMaterialization)===JSON.stringify(currentDev)&&
    JSON.stringify(pending.servingRuntimeSeal)===JSON.stringify(postDeploy);
  const hostingOnlyServing=postDeploy.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'&&
    p?.postDeployRunSeal?.mode===postDeploy.mode&&
    hosting.sourceSha===source&&hosting.sourceTree===tree&&
    hostingP.sourceSha===source&&hostingP.sourceTree===tree&&
    hosting.hostingVersion===hostingP.hostingVersion&&
    hosting.hostingVersion!==postDeploy.hostingVersion&&
    hosting.runtimeRevision===postDeploy.runtimeRevision&&
    hosting.productionChanged===false&&
    seal.sourceSha===postDeploy.sourceSha&&seal.sourceTree===postDeploy.sourceTree&&
    currentDev.sourceSha===postDeploy.sourceSha&&
    current?.sourceMaterialized===true&&current?.materializationScope==='HOSTING_ONLY_WITH_PAIRED_PREDECESSOR';
  // The immutable Hosting ACK may arrive before the new source's C3 audit.
  // Preserve the *previous* C3 as historical only during this receipt-bound
  // interval; never claim its 5 MATCH as a new-source certificate.
  const preC3=d?.i3Q2HostingReleaseC3Pending||{};
  const c3PredecessorAfterHosting=hostingOnlyServing&&
    preC3.state==='DEV_HOSTING_VERIFIED_C3_PENDING'&&
    JSON.stringify(preC3)===JSON.stringify(p?.i3Q2HostingReleaseC3Pending||null)&&
    JSON.stringify(preC3)===JSON.stringify(l?.i3Q2HostingReleaseC3Pending||null)&&
    preC3.sourceSha===source&&preC3.sourceTree===tree&&
    preC3.hostingVersion===hosting.hostingVersion&&
    preC3.runtimeRevision===hosting.runtimeRevision&&
    preC3.production===false;
  const c3PredecessorAfterPaired=(postDeploy.mode==='CURRENT_SOURCE_SERVING'||pendingFromPaired)&&
    p?.postDeployRunSeal?.mode===postDeploy.mode&&
    preC3.state==='DEV_RUNTIME_AND_HOSTING_VERIFIED_C3_PENDING'&&
    JSON.stringify(preC3)===JSON.stringify(p?.i3Q2HostingReleaseC3Pending||null)&&
    JSON.stringify(preC3)===JSON.stringify(l?.i3Q2HostingReleaseC3Pending||null)&&
    preC3.sourceSha===(pendingFromPaired?seal.sourceSha:source)&&preC3.sourceTree===(pendingFromPaired?seal.sourceTree:tree)&&
    preC3.hostingVersion===seal.hostingVersion&&preC3.runtimeRevision===seal.runtimeRevision&&
    postDeploy.sourceSha===preC3.sourceSha&&postDeploy.sourceTree===preC3.sourceTree&&
    postDeploy.hostingVersion===seal.hostingVersion&&postDeploy.runtimeRevision===seal.runtimeRevision&&
    (pendingFromPaired||(current.sourceMaterialized===true&&current.materializationScope==='RUNTIME_AND_HOSTING'))&&
    typeof preC3.previousRuntimeRevision==='string'&&preC3.production===false;
  // I3/F2: original Excel source-only P0 can follow a Hosting-only
  // release. Preserve the immutable paired predecessor C3 as evidence,
  // never re-label it as a certificate of the unserved new runtime.
  const c3PredecessorFromHostingSourceOnly=pendingHostingOnly&&
    preC3.state==='DEV_HOSTING_VERIFIED_C3_PENDING'&&
    preC3.sourceSha===hosting.sourceSha&&preC3.sourceTree===hosting.sourceTree&&
    preC3.previousC3SourceSha===c3.sourceSha&&
    preC3.previousC3SourceTree===c3.sourceTree&&
    preC3.previousHostingVersion===c3.hostingVersion&&
    preC3.previousRuntimeRevision===c3.runtimeRevision&&
    JSON.stringify(preC3)===JSON.stringify(p?.i3Q2HostingReleaseC3Pending||null)&&
    JSON.stringify(preC3)===JSON.stringify(l?.i3Q2HostingReleaseC3Pending||null);
  const c3PredecessorAfterServing=c3PredecessorAfterHosting||c3PredecessorAfterPaired||c3PredecessorFromHostingSourceOnly;
  check(Boolean(ledgerPath)&&p?.findingsLedgerPath===ledgerPath,'CURRENT_LEDGER_PATH_DESYNC');
  check(Boolean(d?.findingsLedgerExpectedGitBlob)&&p?.findingsLedgerExpectedGitBlob===d.findingsLedgerExpectedGitBlob,'CURRENT_LEDGER_BLOB_DESYNC');
  check(l?.governance?.findingCount===count&&l?.findingCount===count,'CURRENT_FINDING_COUNT_DESYNC');
  check(l?.governance?.nextFindingId===next&&l?.nextFindingId===next&&d?.nextFindingId===next&&p?.nextFindingId===next,'CURRENT_NEXT_FINDING_ID_DESYNC');
  check(Array.isArray(l?.governance?.findingIdsPresent)&&l.governance.findingIdsPresent.length===count&&l.governance.findingIdsPresent.every((id,i)=>id===ids[i]),'CURRENT_FINDING_IDS_DESYNC');
  check(l?.currentLedgerSuccessor===ledgerPath,'CURRENT_LEDGER_SUCCESSOR_DESYNC');
  check(Boolean(source)&&l?.currentProductSourceSha===source&&l?.governance?.currentProductSourceSha===source&&current?.productSourceSha===source&&(pendingServing||hostingOnlyServing||seal?.sourceSha===source),'CURRENT_PRODUCT_SOURCE_DESYNC');
  check(Boolean(tree)&&p?.productTree===tree&&l?.currentProductSourceTree===tree&&l?.governance?.currentProductSourceTree===tree&&current?.productTree===tree&&(pendingServing||hostingOnlyServing||seal?.sourceTree===tree),'CURRENT_PRODUCT_TREE_DESYNC');
  check(Boolean(action)&&p?.exactNextAction===action&&p?.nextExactAction===action&&d?.nextExactAction===action&&l?.exactNextAction===action&&l?.nextExactAction===action,'CURRENT_NEXT_ACTION_DESYNC');
  check(Boolean(blocker)&&p?.activeBlocker===blocker&&l?.activeBlocker===blocker,'CURRENT_ACTIVE_BLOCKER_DESYNC');
  check(Boolean(current?.moduleTruthPath)&&current.moduleTruthPath===d?.moduleTruthPath,'CURRENT_TRUTH_MATRIX_DESYNC');
  check(Boolean(seal?.runId)&&current?.currentMaterializationRunId===seal.runId&&current?.currentMaterializationSourceSha===seal.sourceSha,'CURRENT_TRUTH_DEV_SEAL_DESYNC');
  // Nested compatibility headers remain current authorities too. Preserve
  // predecessor receipts only under explicit historical containers.
  if(Object.prototype.hasOwnProperty.call(l?.governance||{},'currentMaterialization'))check(
    JSON.stringify(l.governance.currentMaterialization)===JSON.stringify(d.currentMaterialization)&&
    JSON.stringify(l.governance.currentMaterialization)===JSON.stringify(seal),'CURRENT_GOVERNANCE_MATERIALIZATION_DESYNC');
  if(Object.prototype.hasOwnProperty.call(l?.governance||{},'postDeployRunSeal'))check(
    JSON.stringify(l.governance.postDeployRunSeal)===JSON.stringify(postDeploy),'CURRENT_GOVERNANCE_SEAL_DESYNC');
  if(Object.prototype.hasOwnProperty.call(current,'currentRuntimeRevision'))check(current.currentRuntimeRevision===seal.runtimeRevision,'CURRENT_TRUTH_RUNTIME_DESYNC');
  if(Object.prototype.hasOwnProperty.call(current,'currentHostingVersion'))check(current.currentHostingVersion===((hostingOnlyServing||pendingHostingOnly)?hosting.hostingVersion:seal.hostingVersion),'CURRENT_TRUTH_HOSTING_DESYNC');
  // The business-facing B1-B9 lock must point to the very same served DEV
  // release as the control seal, not a historical valid predecessor.  Keeping
  // a stale nested DEV pointer was sufficient to restart deployment loops.
  check(Boolean(seal?.runtimeRevision)&&currentDev.runtimeRevision===seal.runtimeRevision&&phaseLock.devRuntime===seal.runtimeRevision,'CURRENT_PHASE_LOCK_DEV_RUNTIME_DESYNC');
  check(Boolean(seal?.hostingVersion)&&currentDev.hostingVersion===seal.hostingVersion&&phaseLock.devHosting===((hostingOnlyServing||pendingHostingOnly)?hosting.hostingVersion:seal.hostingVersion),'CURRENT_PHASE_LOCK_DEV_HOSTING_DESYNC');
  check(Boolean(seal?.sourceSha)&&currentDev.sourceSha===seal.sourceSha&&phaseLock.sourceSha===((pendingServing||hostingOnlyServing)?source:seal.sourceSha),'CURRENT_PHASE_LOCK_PRODUCT_SOURCE_DESYNC');
  // The current 21-domain C3 audit is distinct from archived 20-domain
  // terminal evidence. A stale lastModuleTruthProof previously survived every
  // canonical CI run and caused later conversations to re-enter old gates.
  const c3=d?.currentC3PreterminalAudit||{};
  // Current aliases are checked only at the top level. Historical receipts may
  // retain their original field names and identities without being reclassified.
  for(const object of [d,p,l,m].filter(Boolean))for(const [key,value]of Object.entries(object)){
    if(!key.startsWith('currentSuccessor')&&key!=='pendingDevSuccessorEvidence')continue;
    const identities=[value,value?.receipt,value?.materialization].filter(v=>v&&typeof v==='object'&&('sourceSha'in v||'sourceTree'in v));
    check(identities.length>0&&identities.every(v=>v.sourceSha===source&&v.sourceTree===tree),'CURRENT_SUCCESSOR_IDENTITY_DESYNC');
    if(pending.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION')check(value?.executed===false&&value?.pending===true&&value?.production===false&&
      [value,value?.materialization].filter(Boolean).every(v=>!v.builds&&!v.runtimeDeploys&&!v.hostingDeploys),'CURRENT_SUCCESSOR_EXECUTION_STATE_DESYNC');
  }
  if(d.lastExecutionReceipt||d.lastExecutionReceiptSemantics)check(JSON.stringify(d.lastExecutionReceipt)===JSON.stringify(d.currentExecutionReceipt)&&
    d.lastExecutionReceiptSemantics===d.currentExecutionReceiptSemantics,'CURRENT_LAST_EXECUTION_ALIAS_DESYNC');
  const accountingEvidence=phaseLock.currentAccountingSemantics?.strictOwnerDomainMatch?.evidence;
  check(accountingEvidence?.path===d.moduleTruthPath&&accountingEvidence?.gitBlob===d.moduleTruthExpectedGitBlob&&
    accountingEvidence?.runId===c3.runId&&accountingEvidence?.sourceSha===c3.sourceSha,'CURRENT_STRICT_ACCOUNTING_EVIDENCE_DESYNC');
  if(phaseLock.latestTerminalAttempt){
    const terminal=phaseLock.latestTerminalAttempt;
    check(['runId','sourceSha','sourceTree'].every(k=>terminal[k]===c3[k])&&
      (!(terminal.runNumber&&c3.runNumber)||terminal.runNumber===c3.runNumber),'CURRENT_TERMINAL_ATTEMPT_DESYNC');
  }
  const pendingBreakdown=['pendingOwnerProofFiles','pendingBlobProvenanceFiles','pendingMappingApprovalFiles'];
  check(pendingBreakdown.every(k=>Number.isInteger(c3[k])&&c3[k]>=0)&&
    pendingBreakdown.reduce((n,k)=>n+c3[k],0)===c3.pendingFiles,'CURRENT_C3_PENDING_BREAKDOWN_DESYNC');
  const sameProof=JSON.stringify(c3)===JSON.stringify(p?.currentC3PreterminalAudit||null)&&
    JSON.stringify(c3)===JSON.stringify(l?.currentC3PreterminalAudit||null);
  const currentlyServedHosting=c3PredecessorAfterServing?preC3.previousHostingVersion:
    ((hostingOnlyServing||pendingHostingOnly)?hosting.hostingVersion:seal.hostingVersion);
  // A source successor must not inherit or fabricate a current-source C3 receipt.
  // While the exact Hosting-only predecessor is still served, the previous C3
  // remains historical with its own source, tree and successful run identity.
  const c3Source=c3PredecessorAfterServing?preC3.previousC3SourceSha:(pendingFromPaired?seal.sourceSha:pendingHostingOnly?hosting.sourceSha:source);
  const c3Tree=c3PredecessorAfterServing?preC3.previousC3SourceTree:(pendingFromPaired?seal.sourceTree:pendingHostingOnly?hosting.sourceTree:tree);
  const c3Runtime=c3PredecessorAfterServing?(preC3.previousRuntimeRevision??seal.runtimeRevision):seal.runtimeRevision;
  if(pendingFromPaired&&!c3PredecessorAfterServing)check(!d.i3Q2HostingReleaseC3Pending&&!p.i3Q2HostingReleaseC3Pending&&!l.i3Q2HostingReleaseC3Pending&&
    typeof seal.runtimeDigest==='string'&&c3.runtimeDigest===seal.runtimeDigest&&postDeploy.runtimeDigest===seal.runtimeDigest,
    'CURRENT_COMPLETED_PAIRED_C3_IDENTITY_DESYNC');
  check(sameProof&&c3.schemaVersion==='cxorbia.i3.current-c3-preterminal-audit.v1'&&
    Number.isInteger(c3.runId)&&c3.runId>0&&
    c3.moduleCount===21&&c3.matchModules>=0&&c3.matchModules<=21&&
    c3.sourceReadyModules>=0&&c3.sourceReadyModules<=21&&
    Array.isArray(c3.sourceReadyDomainNames)&&c3.sourceReadyDomainNames.length===c3.sourceReadyModules&&
    c3.pendingFiles>=0&&c3.sourceSha===c3Source&&c3.sourceTree===c3Tree&&
    c3.hostingVersion===currentlyServedHosting&&c3.runtimeRevision===c3Runtime&&
    c3.production===false&&/^(HOLD|PASS)_/.test(c3.decision||'')&&
    JSON.stringify(d?.lastModuleTruthProof||null)===JSON.stringify(c3)&&
    JSON.stringify(d?.c3PreterminalProof||null)===JSON.stringify(c3)&&
    JSON.stringify(l?.lastModuleTruthProof||null)===JSON.stringify(c3)&&
    JSON.stringify(l?.c3PreterminalProof||null)===JSON.stringify(c3),
    'CURRENT_C3_PROOF_DESYNC');
  for(const control of [d,p])check(control?.currentCanonicalControl?.sourceSha===c3Source&&control?.currentCanonicalControl?.sourceTree===c3Tree,'CURRENT_CANONICAL_C3_SOURCE_DESYNC');
  check(Boolean(d?.updatedAt)&&d.updatedAt===p?.updatedAt&&p.updatedAt===l?.updatedAt,'CURRENT_CONTROL_UPDATED_AT_DESYNC');
  // Accepted provider evidence must survive control-only continuity updates.
  // Its historical source is not a certificate for the current UI/role chain.
  const academyAccepted=p?.latestRun2391B7CancelRescheduleAcademyRepeatScopedQa;
  if(academyAccepted?.academiaD08ProviderRepeat==='PASS'){
    const residual=d?.d08AcademyProgressResidual,proof=residual?.providerEvidence;
    check(Boolean(residual)&&JSON.stringify(residual)===JSON.stringify(p?.d08AcademyProgressResidual),'CURRENT_D08_RESIDUAL_ALIAS_DESYNC');
    check(proof?.runId===academyAccepted.workflowRunId&&proof?.runNumber===academyAccepted.workflowRunNumber&&
      proof?.sourceSha===academyAccepted.sourceSha&&proof?.receiptPath===academyAccepted.receiptPath&&
      proof?.historicalProviderOnly===true&&proof?.decision==='PASS'&&
      residual?.status!=='SOURCE_CI_EXACT_DEV_AND_READ_ONLY_UI_PASS_REAL_ACK_ROLE_SESSION_PENDING',
      'CURRENT_D08_ACCEPTED_PROVIDER_EVIDENCE_DROPPED');
  }
  const financeEvidence=d?.currentFinanceReadonlyEvidence;
  if(financeEvidence){
    check([p,l,...(m?[m]:[])].every(o=>JSON.stringify(o?.currentFinanceReadonlyEvidence)===JSON.stringify(financeEvidence)),
      'CURRENT_FINANCE_READONLY_EVIDENCE_DESYNC');
    // During a source-only successor, preserve the exact immutable finance
    // read-only receipt from the still-served predecessor. This never certifies
    // settlement, provider ACK, or the successor source's real E2E.
    const exactSource=financeEvidence.sourceSha===source&&financeEvidence.sourceTree===tree;
    const predecessorServed=pendingServing&&financeEvidence.sourceSha===seal.sourceSha&&
      financeEvidence.sourceTree===seal.sourceTree;
    check((exactSource||predecessorServed)&&
      financeEvidence.decision==='PASS_FINANCE_READONLY_CURRENT_MANIFEST'&&financeEvidence.completeRead===true&&
      financeEvidence.sameDocumentsStable===true&&financeEvidence.providerCommandsExecuted===0&&
      financeEvidence.newDomainMatches===0&&financeEvidence.financeSettlementCertified===false&&financeEvidence.production===false,
      'CURRENT_FINANCE_READONLY_SCOPE_OR_CREDIT_INVALID');
  }
  check(Boolean(d?.currentExecutionReceipt)&&JSON.stringify(d.currentExecutionReceipt)===JSON.stringify(p?.currentExecutionReceipt),'CURRENT_EXECUTION_RECEIPT_DESYNC');
  check(Boolean(d?.currentExecutionReceiptSemantics)&&d.currentExecutionReceiptSemantics===p?.currentExecutionReceiptSemantics,'CURRENT_EXECUTION_RECEIPT_SEMANTICS_DESYNC');
  check(d?.phaseAHumanAcceptanceCurrent20261111?.technicalDomainMatches===phaseLock.strictDomainMatches && phaseLock.strictDomainMatches===current.moduleMatch && current.moduleMatch===c3.matchModules,'CURRENT_TECHNICAL_DOMAIN_COUNT_DESYNC');
  check(Boolean(d?.moduleTruthExpectedGitBlob)&&current.moduleTruthGitBlob===d.moduleTruthExpectedGitBlob,'CURRENT_TRUTH_MATRIX_BLOB_DESYNC');
  for(const control of [d,p])check(control?.currentCanonicalControl?.matrix?.path===d.moduleTruthPath && control?.currentCanonicalControl?.matrix?.gitBlob===d.moduleTruthExpectedGitBlob && control?.currentCanonicalControl?.ledger?.path===d.findingsLedgerPath && control?.currentCanonicalControl?.ledger?.gitBlob===d.findingsLedgerExpectedGitBlob,'CURRENT_CANONICAL_CONTROL_POINTER_DESYNC');
  if(m){
    if(Object.prototype.hasOwnProperty.call(m,'findingsLedgerPath'))check(m.findingsLedgerPath===ledgerPath,'CURRENT_MATRIX_LEDGER_PATH_DESYNC');
    // A successful current-source HR readback retires older failed-HR
    // instructions. A subsequent real failure must identify its newer run
    // and exact source; historical receipts never act as current blockers.
    if(postDeploy.mode==='CURRENT_SOURCE_SERVING'&&seal.sourceSha===source&&seal.hrLiveVerified===true){
      for(const mod of m.modules||[]){
        if(!/HR_FAILED/.test(String(mod.currentDevStage||'')))continue;
        const residual=mod.currentResidualEvidence||{};
        check(Number(residual.runId)>Number(seal.runId)&&residual.sourceSha===source&&
          ['PROVIDER_FAILURE','ENVIRONMENT_FAILURE','AUTH_FAILURE'].includes(residual.classification)&&
          ['HOLD','NO_GO'].includes(residual.state),'CURRENT_MODULE_HR_FAILURE_WITHOUT_NEWER_EVIDENCE');
      }
    }
    // This alias denotes the immutable paired runtime + Hosting receipt, even
    // when a newer source or Hosting-only release is pending. Never leave a
    // previous paired run labelled current beside a newer canonical DEV seal.
    if(Object.prototype.hasOwnProperty.call(m,'currentMaterialization'))check(
      Boolean(m.currentMaterialization)&&
      JSON.stringify(m.currentMaterialization)===JSON.stringify(d.currentMaterialization)&&
      JSON.stringify(m.currentMaterialization)===JSON.stringify(seal),
      'CURRENT_MATRIX_MATERIALIZATION_DESYNC');
    if(Object.prototype.hasOwnProperty.call(m.productSource||{},'devMaterializationReceiptPath'))check(
      m.productSource.devMaterializationReceiptPath===postDeploy.receiptPath&&
      m.productSource.devMaterializationReceiptGitBlob===postDeploy.receiptBlob,'CURRENT_MATRIX_DEV_RECEIPT_DESYNC');
    if(!hostingOnlyServing&&!pendingHostingOnly)for(const mod of m.modules||[]){
      if(Object.prototype.hasOwnProperty.call(mod,'currentMaterializationRunId'))check(mod.currentMaterializationRunId===seal.runId,'CURRENT_MODULE_DEV_RUN_DESYNC');
      if(Object.prototype.hasOwnProperty.call(mod,'servedRuntimeRevision'))check(mod.servedRuntimeRevision===seal.runtimeRevision,'CURRENT_MODULE_RUNTIME_DESYNC');
      if(Object.prototype.hasOwnProperty.call(mod,'servedHostingVersion'))check(mod.servedHostingVersion===seal.hostingVersion,'CURRENT_MODULE_HOSTING_DESYNC');
      if(Object.prototype.hasOwnProperty.call(mod,'currentServingAuthority'))check(
        mod.currentServingAuthority?.runId===seal.runId&&mod.currentServingAuthority?.sourceSha===seal.sourceSha&&
        mod.currentServingAuthority?.sourceTree===seal.sourceTree&&
        mod.currentServingAuthority?.path===postDeploy.receiptPath&&mod.currentServingAuthority?.gitBlob===postDeploy.receiptBlob,
        'CURRENT_MODULE_SERVING_AUTHORITY_DESYNC');
    }
    const actual=(m.modules||[]).filter(x=>x.classification==='MATCH').length;
    check(actual===current.moduleMatch && m.integralCertificationUnchanged?.match===actual,'CURRENT_MATRIX_MATCH_COUNT_DESYNC');
    check(m.version===(String(d.moduleTruthPath).match(/-(V\d+)\.json$/)||[])[1],'CURRENT_MATRIX_VERSION_DESYNC');
    const accounting=m.functionalBlockCertificationAccounting20261110;
    if(accounting){
      check(accounting.currentProductSourceSha===source,'CURRENT_FUNCTIONAL_ACCOUNTING_SOURCE_DESYNC');
      check(accounting.domainMatchCount===actual&&accounting.domainCount===m.modules.length&&
        accounting.domainPendingCount===m.modules.length-actual,'CURRENT_FUNCTIONAL_ACCOUNTING_COUNT_DESYNC');
    }
  }
  return {pass:failures.length===0,failures,findingCount:count,nextFindingId:next,ledgerPath,sourceSha:source,devRunId:seal?.runId||null};
}

// A new frontend-only ACK does not rewrite the immutable paired runtime seal.
// Bind every latest-execution field to that exact committed Hosting receipt.
export function validateLatestExecutionSource({descriptor:d,pointer:p,gitBlob,readJson}){
  const latest=p.lastExecutionReceipt,seal=d.postDeployRunSeal||{},failures=[];
  const check=(ok,code)=>{if(!ok)failures.push(code);};
  // A completed C3 observation belongs to the exact served source. Its attempt
  // is execution evidence, never a terminal certificate or another deployment.
  // This remains true when a separately proven source successor is pending.
  if(latest?.kind==='C3_PRETERMINAL_AND_CERTIFY_ATTEMPT_NOT_TERMINAL_CERTIFICATE'){
    const pending=d.pendingDevSuccessor||{},audit=d.currentC3PreterminalAudit||{};
    const currentPaired=seal.mode==='CURRENT_SOURCE_SERVING';
    const paired=!d.currentHostingOnlyDevMaterialization&&!p.currentHostingOnlyDevMaterialization&&
      Boolean(currentPaired?d.currentMaterialization:pending.servingPairedMaterialization);
    const h=(paired?d.currentMaterialization:d.currentHostingOnlyDevMaterialization)||{};
    if(currentPaired){
      check(paired&&!d.pendingDevSuccessor&&!p.pendingDevSuccessor,'LATEST_C3_CURRENT_PAIRED_STATE');
      check(h.sourceSha===d.productSourceSha&&h.sourceTree===d.productTreeAuthority,'LATEST_C3_CURRENT_PAIRED_SOURCE');
      check(JSON.stringify(h)===JSON.stringify(p.currentDevMaterialization||null)&&
        JSON.stringify(seal)===JSON.stringify(p.postDeployRunSeal||null),'LATEST_C3_CURRENT_PAIRED_POINTER');
    }else{
      check(seal.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'&&pending.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION'&&pending.scope==='RUNTIME_AND_HOSTING','LATEST_C3_PENDING_STATE');
      check(JSON.stringify(pending)===JSON.stringify(p.pendingDevSuccessor||null)&&pending.production===false&&pending.devPublished===false,'LATEST_C3_PENDING_POINTER');
      check(pending.sourceSha===d.productSourceSha&&pending.sourceTree===d.productTreeAuthority&&pending.predecessorProductSourceSha===h.sourceSha&&h.sourceSha!==pending.sourceSha,'LATEST_C3_PENDING_SOURCE');
      check(JSON.stringify(h)===JSON.stringify((paired?p.currentDevMaterialization:p.currentHostingOnlyDevMaterialization)||null)&&JSON.stringify(h)===JSON.stringify((paired?pending.servingPairedMaterialization:pending.servingHosting)||null)&&JSON.stringify(seal)===JSON.stringify(pending.servingRuntimeSeal||null),'LATEST_C3_SERVING_POINTER');
    }
    if(paired){
      check(!pending.servingHosting&&!d.i3Q2HostingReleaseC3Pending&&!p.i3Q2HostingReleaseC3Pending&&h.sourceSha===seal.sourceSha&&h.sourceTree===seal.sourceTree&&h.hostingVersion===seal.hostingVersion&&h.runtimeRevision===seal.runtimeRevision&&h.runtimeDigest===seal.runtimeDigest,'LATEST_C3_PAIRED_SEAL');
      check(Boolean(seal.receiptPath&&seal.receiptBlob)&&h.materializationReceiptPath===seal.receiptPath&&gitBlob(seal.receiptPath)===seal.receiptBlob,'LATEST_C3_PAIRED_RECEIPT_BLOB');
      let pairedReceipt={};try{pairedReceipt=readJson(seal.receiptPath);}catch{check(false,'LATEST_C3_PAIRED_RECEIPT_UNREADABLE');}
      check(pairedReceipt.schemaVersion==='cxorbia.i3.current-source-dev-materialization.v1'&&pairedReceipt.production===false&&pairedReceipt.i4Authorized===false&&pairedReceipt.productionUnchanged===true,'LATEST_C3_PAIRED_RECEIPT_SCOPE');
      for(const k of ['sourceSha','sourceTree','runId','runNumber','runtimeRevision','runtimeDigest','hostingVersion','artifactDigest'])check(Boolean(h[k])&&pairedReceipt.materialization?.[k]===h[k],'LATEST_C3_PAIRED_RECEIPT_'+k);
      check(pairedReceipt.sourceSha===h.sourceSha&&pairedReceipt.sourceTree===h.sourceTree&&pairedReceipt.materialization?.builds===1&&pairedReceipt.materialization?.runtimeDeploys===1&&pairedReceipt.materialization?.hostingDeploys===1,'LATEST_C3_PAIRED_RECEIPT_IDENTITY');
    }
    check(JSON.stringify(audit)===JSON.stringify(p.currentC3PreterminalAudit||null)&&audit.sourceSha===h.sourceSha&&audit.sourceTree===h.sourceTree&&audit.hostingVersion===h.hostingVersion&&audit.runtimeRevision===seal.runtimeRevision,'LATEST_C3_AUDIT_IDENTITY');
    check(JSON.stringify(latest)===JSON.stringify(d.currentExecutionReceipt||null)&&JSON.stringify(latest)===JSON.stringify(p.currentExecutionReceipt||null),'LATEST_C3_EXECUTION_POINTER');
    check(Boolean(latest.path&&latest.gitBlob)&&gitBlob(latest.path)===latest.gitBlob,'LATEST_C3_RECEIPT_BLOB');
    let r={};try{r=readJson(latest.path);}catch{check(false,'LATEST_C3_RECEIPT_UNREADABLE');}
    check(r.schemaVersion==='cxorbia.i3.c3-certify-attempt-readback.v1'&&r.kind===latest.kind&&r.decision===latest.decision&&r.strictCertificationStatus==='HOLD','LATEST_C3_RECEIPT_SCOPE');
    for(const k of ['sourceSha','sourceTree','runId','runNumber','artifactId','artifactDigest'])check(Boolean(r[k])&&latest[k]===r[k]&&audit[k]===r[k],'LATEST_C3_RECEIPT_'+k);
    check(r.runtimeRevision===seal.runtimeRevision&&r.runtimeDigest===seal.runtimeDigest&&r.runtimeRevision===h.runtimeRevision&&r.runtimeDigest===h.runtimeDigest&&r.hostingVersion===h.hostingVersion,'LATEST_C3_LIVE_IDENTITY');
    check(r.c3Decision==='PASS_C3_PRETERMINAL_SOURCE_READY_EXACT_DEV'&&r.c3Decision===audit.decision&&r.moduleCount===21&&r.matchModules===audit.matchModules&&r.sourceReadyModules===audit.sourceReadyModules&&r.pendingFiles===0,'LATEST_C3_PROOF_IDENTITY');
    for(const k of ['builds','runtimeDeploys','hostingDeploys','rulesDeploys','hrWrites','productionDeploys'])check(r[k]===0,'LATEST_C3_ZERO_'+k);
    for(const k of ['production','terminalCertified','phaseAComplete','i4Authorized'])check(r[k]===false&&latest[k]===false,'LATEST_C3_NONTERMINAL_'+k);
    return {pass:failures.length===0,failures,sourceSha:audit.sourceSha,hostingOnly:false,c3Attempt:true};
  }
  const expected=seal.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'?seal.sourceSha:d.productSourceSha;
  const isHostingAck=latest?.kind==='EXACT_HOSTING_ONLY_DEV_ACK_NOT_FUNCTIONAL_CERTIFICATE';
  if(!isHostingAck&&(!latest?.sourceSha||latest.sourceSha===expected))return {pass:true,failures,sourceSha:expected,hostingOnly:false};
  const h=d.currentHostingOnlyDevMaterialization||{};
  check(seal.mode==='PREDECESSOR_SERVING_PENDING_SOURCE'&&latest.kind==='EXACT_HOSTING_ONLY_DEV_ACK_NOT_FUNCTIONAL_CERTIFICATE','LATEST_EXECUTION_KIND');
  check(JSON.stringify(h)===JSON.stringify(p.currentHostingOnlyDevMaterialization||null),'LATEST_HOSTING_POINTER');
  const sourceOnlyF2=d.pendingDevSuccessor?.state==='P0_PROVEN_PENDING_DEV_MATERIALIZATION'&&
    d.pendingDevSuccessor.scope==='RUNTIME_AND_HOSTING'&&
    d.pendingDevSuccessor.devPublished===false&&d.pendingDevSuccessor.production===false&&
    h.sourceSha===d.pendingDevSuccessor.predecessorProductSourceSha&&
    h.sourceTree===d.pendingDevSuccessor.servingHosting?.sourceTree&&
    d.pendingDevSuccessor.sourceSha===d.productSourceSha&&
    d.pendingDevSuccessor.sourceTree===d.productTreeAuthority;
  check((h.sourceSha===d.productSourceSha&&h.sourceTree===d.productTreeAuthority)||sourceOnlyF2,'LATEST_HOSTING_SOURCE');
  check(h.runtimeRevision===seal.runtimeRevision&&h.runtimeDigest===seal.runtimeDigest,'LATEST_HOSTING_RUNTIME_SEAL');
  check(Boolean(h.receiptPath&&h.receiptBlob)&&gitBlob(h.receiptPath)===h.receiptBlob,'LATEST_HOSTING_RECEIPT_BLOB');
  let r={};try{r=readJson(h.receiptPath);}catch{check(false,'LATEST_HOSTING_RECEIPT_UNREADABLE');}
  check(r.schemaVersion==='cxorbia.i3.hosting-only-dev-exact-ack.v1'&&r.decision==='PASS_I3_CURRENT_SOURCE_HOSTING_DEV_ONLY','LATEST_HOSTING_RECEIPT_DECISION');
  for(const k of ['sourceSha','sourceTree','runNumber','runtimeRevision','runtimeDigest','hostingRelease'])check(r[k]===h[k],'LATEST_HOSTING_RECEIPT_'+k);
  check(r.workflowRunId===h.runId&&r.hostingAfter===h.hostingVersion,'LATEST_HOSTING_RECEIPT_RUN_VERSION');
  check(r.sourceHostedExact===true&&r.verifiedServedAssetCount>0&&r.verifiedServedAssetCount===Object.keys(r.servedSha256||{}).length,'LATEST_HOSTING_EXACT_ASSETS');
  for(const k of ['cloudRunBuilds','cloudRunDeploys','rulesDeploys','hrWrites','productionDeploys','firestoreDirectWrites'])check(r[k]===0,'LATEST_HOSTING_ZERO_'+k);
  check(r.hostingDeploys===1&&r.productionUnchanged===true&&r.production===false&&r.i4Authorized===false&&r.phaseAComplete===false,'LATEST_HOSTING_NONTERMINAL');
  check(latest.path===h.receiptPath&&latest.gitBlob===h.receiptBlob&&latest.runId===h.runId&&latest.runNumber===h.runNumber,'LATEST_HOSTING_EXECUTION_IDENTITY');
  for(const k of ['sourceSha','sourceTree','artifactId','artifactDigest'])check(Boolean(r[k])&&latest[k]===r[k],'LATEST_HOSTING_EXECUTION_'+k);
  check(latest.production===false,'LATEST_HOSTING_EXECUTION_PRODUCTION');
  return {pass:failures.length===0,failures,sourceSha:h.sourceSha,hostingOnly:true};
}
