// Evidence readiness is not module certification. This gate may open I3
// terminal E2E while preserving non-MATCH module statuses for the finalizer.
export function assessPreterminalSourceReadiness({modules, sourceFiles, pendingMappingApprovalFiles=[], pendingBlobProvenanceFiles=[], unauthorizedFileCount=0}={}) {
  const blockers=[];
  if(!Array.isArray(modules)||modules.length!==21)blockers.push('MODULE_DOMAIN_COUNT');
  if(!Array.isArray(sourceFiles))blockers.push('SOURCE_FILE_INVENTORY_MISSING');
  const rows=Array.isArray(modules)?modules:[];
  const files=Array.isArray(sourceFiles)?sourceFiles:[];
  const domainNames=rows.map(x=>String(x?.domain||''));
  const domains=new Set(domainNames);
  if(domains.size!==21||domainNames.some(x=>!x))blockers.push('DUPLICATE_OR_MISSING_DOMAIN');
  const active=files.filter(x=>x.phaseAAuthority===true);
  const scoped=files.filter(x=>x.phaseAAuthority!==false);
  const activePaths=active.map(x=>String(x.path||''));
  if(new Set(activePaths).size!==activePaths.length||activePaths.some(x=>!x))blockers.push('DUPLICATE_OR_MISSING_ACTIVE_FILE');
  if(scoped.some(x=>x.phaseAAuthority!==true))blockers.push('UNAPPROVED_SCOPE_MAPPING');
  if(active.some(x=>!domains.has(x.domain)))blockers.push('UNKNOWN_SOURCE_DOMAIN');
  if(pendingMappingApprovalFiles.length)blockers.push('PENDING_MAPPING_APPROVAL');
  if(pendingBlobProvenanceFiles.length)blockers.push('PENDING_BLOB_PROVENANCE');
  if(unauthorizedFileCount!==0)blockers.push('UNAUTHORIZED_SOURCE_DRIFT');
  const sourceReadyModules=[];
  for(const mod of rows){
    const ownerFiles=active.filter(x=>x.domain===mod.domain);
    const ownerReady=ownerFiles.every(x=>x.classification==='MATCH'&&
      x.provenanceIndependent===true&&!!x.currentBlob&&x.approvedBlob===x.currentBlob);
    const historicalNoFileMatch=ownerFiles.length===0&&mod.classification==='MATCH';
    const moduleReady=mod.currentOwnerProofStatus==='PATH_BOUND_OWNER_PROVEN'&&
      Array.isArray(mod.pendingTerminalFiles)&&mod.pendingTerminalFiles.length===0&&
      ownerReady&&(ownerFiles.length>0||historicalNoFileMatch);
    if(moduleReady)sourceReadyModules.push(mod.domain);
    else blockers.push('MODULE_SOURCE_PENDING:'+String(mod.domain||'UNKNOWN'));
  }
  return {
    terminalEligible:blockers.length===0&&sourceReadyModules.length===21,
    sourceReadyModules,
    sourceReadyModuleCount:sourceReadyModules.length,
    blockers
  };
}
