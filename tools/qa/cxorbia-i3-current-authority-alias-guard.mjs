/* Current control-plane compatibility aliases must not contradict the canonical
   descriptor-selected ledger and DEV seal. Historical nested evidence is immutable;
   only explicitly current top-level fields are compared here. */
export function validateCurrentAuthorityAliases({descriptor:d,pointer:p,ledger:l}){
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
    pending.scope==='HOSTING_ONLY'&&pending.production===false&&pending.devPublished===false&&
    JSON.stringify(pending)===JSON.stringify(p?.pendingDevSuccessor||null)&&
    pending.sourceSha===source&&pending.sourceTree===tree&&
    pending.predecessorProductSourceSha===hosting.sourceSha&&
    JSON.stringify(pending.servingHosting)===JSON.stringify(hosting)&&
    JSON.stringify(hosting)===JSON.stringify(hostingP)&&
    hosting.runtimeRevision===seal.runtimeRevision&&
    current?.sourceMaterialized===false;
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
  const sameProof=JSON.stringify(c3)===JSON.stringify(p?.currentC3PreterminalAudit||null)&&
    JSON.stringify(c3)===JSON.stringify(l?.currentC3PreterminalAudit||null);
  const currentlyServedHosting=c3PredecessorAfterHosting?preC3.previousHostingVersion:
    ((hostingOnlyServing||pendingHostingOnly)?hosting.hostingVersion:seal.hostingVersion);
  // A source successor must not inherit or fabricate a current-source C3 receipt.
  // While the exact Hosting-only predecessor is still served, the previous C3
  // remains historical with its own source, tree and successful run identity.
  const c3Source=c3PredecessorAfterHosting?preC3.previousC3SourceSha:(pendingHostingOnly?hosting.sourceSha:source);
  const c3Tree=c3PredecessorAfterHosting?preC3.previousC3SourceTree:(pendingHostingOnly?hosting.sourceTree:tree);
  check(sameProof&&c3.schemaVersion==='cxorbia.i3.current-c3-preterminal-audit.v1'&&
    Number.isInteger(c3.runId)&&c3.runId>0&&
    c3.moduleCount===21&&c3.matchModules>=0&&c3.matchModules<=21&&
    c3.sourceReadyModules>=0&&c3.sourceReadyModules<=21&&
    Array.isArray(c3.sourceReadyDomainNames)&&c3.sourceReadyDomainNames.length===c3.sourceReadyModules&&
    c3.pendingFiles>=0&&c3.sourceSha===c3Source&&c3.sourceTree===c3Tree&&
    c3.hostingVersion===currentlyServedHosting&&c3.runtimeRevision===seal.runtimeRevision&&
    c3.production===false&&/^(HOLD|PASS)_/.test(c3.decision||'')&&
    JSON.stringify(d?.lastModuleTruthProof||null)===JSON.stringify(c3)&&
    JSON.stringify(d?.c3PreterminalProof||null)===JSON.stringify(c3)&&
    JSON.stringify(l?.lastModuleTruthProof||null)===JSON.stringify(c3)&&
    JSON.stringify(l?.c3PreterminalProof||null)===JSON.stringify(c3),
    'CURRENT_C3_PROOF_DESYNC');
  check(Boolean(d?.updatedAt)&&d.updatedAt===p?.updatedAt&&p.updatedAt===l?.updatedAt,'CURRENT_CONTROL_UPDATED_AT_DESYNC');
  return {pass:failures.length===0,failures,findingCount:count,nextFindingId:next,ledgerPath,sourceSha:source,devRunId:seal?.runId||null};
}
