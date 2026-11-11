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
  check(Boolean(ledgerPath)&&p?.findingsLedgerPath===ledgerPath,'CURRENT_LEDGER_PATH_DESYNC');
  check(Boolean(d?.findingsLedgerExpectedGitBlob)&&p?.findingsLedgerExpectedGitBlob===d.findingsLedgerExpectedGitBlob,'CURRENT_LEDGER_BLOB_DESYNC');
  check(l?.governance?.findingCount===count&&l?.findingCount===count,'CURRENT_FINDING_COUNT_DESYNC');
  check(l?.governance?.nextFindingId===next&&l?.nextFindingId===next&&d?.nextFindingId===next&&p?.nextFindingId===next,'CURRENT_NEXT_FINDING_ID_DESYNC');
  check(Array.isArray(l?.governance?.findingIdsPresent)&&l.governance.findingIdsPresent.length===count&&l.governance.findingIdsPresent.every((id,i)=>id===ids[i]),'CURRENT_FINDING_IDS_DESYNC');
  check(l?.currentLedgerSuccessor===ledgerPath,'CURRENT_LEDGER_SUCCESSOR_DESYNC');
  check(Boolean(source)&&l?.currentProductSourceSha===source&&l?.governance?.currentProductSourceSha===source&&current?.productSourceSha===source&&seal?.sourceSha===source,'CURRENT_PRODUCT_SOURCE_DESYNC');
  check(Boolean(tree)&&p?.productTree===tree&&l?.currentProductSourceTree===tree&&l?.governance?.currentProductSourceTree===tree&&current?.productTree===tree&&seal?.sourceTree===tree,'CURRENT_PRODUCT_TREE_DESYNC');
  check(Boolean(action)&&p?.exactNextAction===action&&p?.nextExactAction===action&&d?.nextExactAction===action&&l?.exactNextAction===action&&l?.nextExactAction===action,'CURRENT_NEXT_ACTION_DESYNC');
  check(Boolean(blocker)&&p?.activeBlocker===blocker&&l?.activeBlocker===blocker,'CURRENT_ACTIVE_BLOCKER_DESYNC');
  check(Boolean(current?.moduleTruthPath)&&current.moduleTruthPath===d?.moduleTruthPath,'CURRENT_TRUTH_MATRIX_DESYNC');
  check(Boolean(seal?.runId)&&current?.currentMaterializationRunId===seal.runId&&current?.currentMaterializationSourceSha===seal.sourceSha,'CURRENT_TRUTH_DEV_SEAL_DESYNC');
  // The business-facing B1-B9 lock must point to the very same served DEV
  // release as the control seal, not a historical valid predecessor.  Keeping
  // a stale nested DEV pointer was sufficient to restart deployment loops.
  check(Boolean(seal?.runtimeRevision)&&currentDev.runtimeRevision===seal.runtimeRevision&&phaseLock.devRuntime===seal.runtimeRevision,'CURRENT_PHASE_LOCK_DEV_RUNTIME_DESYNC');
  check(Boolean(seal?.hostingVersion)&&currentDev.hostingVersion===seal.hostingVersion&&phaseLock.devHosting===seal.hostingVersion,'CURRENT_PHASE_LOCK_DEV_HOSTING_DESYNC');
  check(Boolean(seal?.sourceSha)&&currentDev.sourceSha===seal.sourceSha&&phaseLock.sourceSha===seal.sourceSha,'CURRENT_PHASE_LOCK_PRODUCT_SOURCE_DESYNC');
  check(Boolean(d?.updatedAt)&&d.updatedAt===p?.updatedAt&&p.updatedAt===l?.updatedAt,'CURRENT_CONTROL_UPDATED_AT_DESYNC');
  return {pass:failures.length===0,failures,findingCount:count,nextFindingId:next,ledgerPath,sourceSha:source,devRunId:seal?.runId||null};
}
