import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertCanonicalModuleCoverage} from './cxorbia-i3-terminal-module-domain-coverage.mjs';

const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const TEMPLATE=process.env.TEMPLATE||descriptor.moduleTruthPath;
const LEDGER=process.env.LEDGER||descriptor.findingsLedgerPath;
const SOURCE=String(process.env.SOURCE||'').trim();
const TREE=String(process.env.TREE||'').trim();
const LAST_SERVED=String(process.env.LAST_SERVED||SOURCE).trim();
const OUT_FILE=process.env.OUT_FILE||'.tmp/c3-preterminal/module-truth-preterminal.json';
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('SOURCE_FAILURE:C3_SOURCE_MISSING');
if(!/^[a-f0-9]{40}$/.test(LAST_SERVED))throw new Error('SOURCE_FAILURE:C3_LAST_SERVED_MISSING');

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const safeBlob=(ref,path)=>{try{return git('rev-parse',ref+':'+path)}catch{return null}};
const m=JSON.parse(fs.readFileSync(TEMPLATE,'utf8'));
const ledger=JSON.parse(fs.readFileSync(LEDGER,'utf8'));
if(TEMPLATE!==descriptor.moduleTruthPath)throw new Error('MAPPING_FAILURE:C3_NOT_CANONICAL_MATRIX');
assertCanonicalModuleCoverage(m.modules);
if(m.productSource?.sha!==SOURCE||m.productSource?.treeSha!==TREE||descriptor.productSourceSha!==SOURCE||descriptor.productTreeAuthority!==TREE)
  throw new Error('RELEASE_COMPOSITION_FAILURE:C3_CANONICAL_SOURCE_TREE_MISMATCH');
if(git('rev-parse','HEAD:'+TEMPLATE)!==descriptor.moduleTruthExpectedGitBlob)
  throw new Error('MAPPING_FAILURE:C3_CANONICAL_MATRIX_BLOB_DESYNC');
if(ledger?.canonicalFunctionalCandidate?.sourceSha!==SOURCE)throw new Error('RELEASE_COMPOSITION_FAILURE:LEDGER_SOURCE_MISMATCH');
if(TREE&&git('rev-parse',SOURCE+'^{tree}')!==TREE)throw new Error('RELEASE_COMPOSITION_FAILURE:SOURCE_TREE_MISMATCH');

const findings=ledger.findings||{};
const moduleMap=new Map((m.modules||[]).map(x=>[x.domain,x]));
const pathFindingEntries=(path)=>Object.entries(findings).filter(([,v])=>{
  const owners=[...(Array.isArray(v?.owner)?v.owner:(v?.owner?[v.owner]:[])),...(v?.owners||[]),...(v?.sourceFixFiles||[]),...(v?.productFiles||[])].map(String);
  return owners.includes(path);
});
const isProvenState=state=>{const x=String(state||'');return !/NOT_PROVEN|PENDING|REQUIRED|HOLD|FAIL/.test(x)&&(/PROVEN|CLOSED|ALREADY_PROVEN/.test(x)||/^PASS_/.test(x));};
const collectRefs=(obj,out=new Set(),key='')=>{
  if(obj==null)return out;
  if(Array.isArray(obj)){for(const v of obj)collectRefs(v,out,key);return out;}
  if(typeof obj==='object'){for(const [k,v] of Object.entries(obj))collectRefs(v,out,k);return out;}
  if(typeof obj==='string'&&/^[a-f0-9]{40}$/.test(obj)&&/(?:sourceSha|functionalSource|sourceCommit|approvedSuccessor|source)$/i.test(key))out.add(obj);
  return out;
};

// The source registry contains historical labels outside the 21 acceptance domains.
// Preserve each historical label for audit; do not silently create a 22nd domain.
const LEGACY_DOMAIN_ALIASES=Object.freeze({
  'finance-dependency-closure':'finance-core-liquidation-costs',
  'shopper-portal-profile-history':'shoppers-mi-visitas-profile',
  'project-multiproject-contracts':'projects-periods-hr-source-wizard-multiproject',
  'identity-auth-closure':'auth-protected-data-runtime',
  'client-portal':'client-portal-reportkit'
});
const unauthorized=[];
const pendingProvenance=[];
const mappingPending=[];
const authorityRows=[];
const sourceFiles=(m.sourceFiles||[]).map(orig=>{
  const f={...orig};
  const canonical=moduleMap.has(f.domain)?f.domain:LEGACY_DOMAIN_ALIASES[f.domain];
  if(!canonical||!moduleMap.has(canonical))throw new Error('MAPPING_FAILURE:C3_UNKNOWN_SOURCE_DOMAIN:'+f.domain+':'+f.path);
  if(canonical!==f.domain){f.preTerminalHistoricalDomain=f.domain;f.domain=canonical;}
  if(f.phaseAAuthority===false){
    // Explicitly excluded files stay preserved; they are not pending approvals.
    f.preTerminalScope='PRESERVED_NON_AUTHORITY';
    return f;
  }
  if(f.phaseAAuthority!==true){
    // Task-referenced is not an approval; keep the missing mapping visible.
    f.classification='PENDING_INDEPENDENT_APPROVAL_MAPPING';
    mappingPending.push({path:f.path,domain:f.domain,phaseAAuthority:f.phaseAAuthority});
    return f;
  }
  const actual=safeBlob(SOURCE,f.path);
  if(!actual){unauthorized.push({path:f.path,reason:'MISSING_AT_CANDIDATE'});return f;}
  const mod=moduleMap.get(f.domain)||{};
  const fileRefs=new Set([
    f.approvedSourceCommit,f.latestApprovedSource,f.f9ApprovedSource,f.terminalCertifiedSource,
    mod.sourceCommit,...(mod.preI4SuccessorCommits||[])
  ].filter(Boolean));
  const findingEntries=pathFindingEntries(f.path);
  for(const [,finding] of findingEntries){
    if(isProvenState(finding?.state))collectRefs(finding,fileRefs);
  }
  let matched=null;
  for(const ref of fileRefs){
    if(safeBlob(ref,f.path)===actual){matched=ref;break;}
  }
  const servedBlob=safeBlob(LAST_SERVED,f.path);
  const changedVsServed=servedBlob!==actual;
  f.preTerminalHistoricalApprovedSource=f.approvedSourceCommit||null;
  f.preTerminalHistoricalApprovedBlob=f.approvedBlob||null;
  f.currentBlob=actual;
  f.currentCumulativeSource=SOURCE;
  f.lastServedBlob=servedBlob;
  f.changedVsLastServed=changedVsServed;
  f.findingIds=findingEntries.map(([id])=>id);
  if(matched){
    f.approvedSourceCommit=matched;
    f.approvedBlob=actual;
    f.provenanceIndependent=true;
    f.approvalStatus='INDEPENDENT_PATH_BOUND_PROVEN';
    f.classification=changedVsServed?'COMPOSED_NOT_DEPLOYED':'MATCH';
    authorityRows.push({path:f.path,domain:f.domain,matchedSource:matched,classification:f.classification});
  }else if(findingEntries.length){
    const states=findingEntries.map(([id,v])=>({id,state:String(v?.state||'')}));
    const allProven=states.every(x=>isProvenState(x.state));
    if(allProven){
      // Old finding PASS is historical evidence, not approval of a newer byte blob.
      f.approvedSourceCommit=null;f.approvedBlob=null;f.provenanceIndependent=false;
      f.approvalStatus='PENDING_CURRENT_BLOB_PROVENANCE';
      f.classification='PENDING_BLOB_PROVENANCE_SERVED';
      f.pendingProvenanceReason='HISTORICAL_PROVEN_FINDING_WITHOUT_CURRENT_PATH_BOUND_BLOB';
      pendingProvenance.push({path:f.path,domain:f.domain,reason:f.pendingProvenanceReason,findingIds:states.map(x=>x.id)});
    }else{
      f.approvedSourceCommit=null;f.approvedBlob=null;f.provenanceIndependent=false;
      f.approvalStatus='PENDING_FINDING_PROOF';
      f.classification=changedVsServed?'COMPOSED_NOT_DEPLOYED':'PENDING_OWNER_PROOF_SERVED';
      f.pendingFindingIds=states.map(x=>x.id);
    }
  }else{
    f.approvedSourceCommit=null;f.approvedBlob=null;f.provenanceIndependent=false;
    f.approvalStatus='PENDING_CURRENT_BLOB_PROVENANCE';
    f.classification='PENDING_BLOB_PROVENANCE_SERVED';
    f.pendingProvenanceReason='CURRENT_BLOB_WITHOUT_PATH_BOUND_APPROVAL_REFERENCE';
    pendingProvenance.push({path:f.path,domain:f.domain,reason:f.pendingProvenanceReason,findingIds:[]});
  }
  return f;
});
if(unauthorized.length)throw new Error('RELEASE_COMPOSITION_FAILURE:UNAUTHORIZED_MODULE_DRIFT:'+JSON.stringify(unauthorized));

const byDomain=new Map();
for(const f of sourceFiles.filter(x=>x.phaseAAuthority===true)){
  if(!byDomain.has(f.domain))byDomain.set(f.domain,[]);
  byDomain.get(f.domain).push(f);
}
const modules=(m.modules||[]).map(mod=>{
  const files=byDomain.get(mod.domain)||[];
  const pending=files.filter(x=>x.classification!=='MATCH');
  const notApproved=mappingPending.filter(x=>x.domain===mod.domain);
  return {...mod,
    preTerminalHistoricalClassification:mod.classification,
    historicalMatchPreserved:mod.classification==='MATCH',
    classification:mod.classification==='MATCH'?'MATCH':notApproved.length?'PENDING_OWNER_APPROVAL_MAPPING':pending.length?'PENDING_OWNER_PROOF_SERVED':mod.classification,
    currentOwnerProofStatus:notApproved.length?'PENDING_APPROVAL_MAPPING':pending.length?'PENDING_PATH_BOUND_OWNER_PROOF':'PATH_BOUND_OWNER_PROVEN',
    currentCandidateSource:SOURCE,
    lastServedSource:LAST_SERVED,
    pendingTerminalFiles:[...pending.map(x=>x.path),...notApproved.map(x=>x.path)],
    ownerAuthorityCount:files.length
  };
});
// Preterminal verifies provenance/composition, not 21/21 human acceptance.
// Only the terminal finalizer may promote pending owners with valid receipts.
// An intentionally unloaded legacy/preserved file is not an active Phase A
// owner, and must never count as an uncertified served file. The preserved
// entrypoint guard below separately rejects accidental future activation.
const uncoveredFiles=sourceFiles.filter(x=>x.phaseAAuthority!==false&&x.classification!=='MATCH');

const html=git('show',SOURCE+':app/index-backend-dev.html');
const staticScripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(x=>x[1].replace(/^\.\//,''));
const dynamicScripts=[...html.matchAll(/\b(?:[A-Za-z_$][\w$]*\.)?src\s*=\s*["']([^"']+\.js(?:\?[^"']*)?)["']/gi)].map(x=>x[1].replace(/^\.\//,'').replace(/\?.*$/,''));
const scripts=[...new Set([...staticScripts,...dynamicScripts])];
const styles=[...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)].map(x=>x[1].replace(/^\.\//,'').replace(/\?.*$/,''));
const duplicateSrc=staticScripts.filter((x,i,a)=>a.indexOf(x)!==i);
if(duplicateSrc.length)throw new Error('RELEASE_COMPOSITION_FAILURE:DUPLICATE_SCRIPT:'+JSON.stringify([...new Set(duplicateSrc)]));
const missing=[];
for(const f of sourceFiles.filter(x=>x.phaseAAuthority===true)){
  const rel=f.path.replace(/^app\//,'');
  if(f.loadTarget==='browser-script'&&!scripts.includes(rel))missing.push(rel);
  if(f.loadTarget==='browser-style'&&!styles.includes(rel))missing.push(rel);
}
if(missing.length)throw new Error('RELEASE_COMPOSITION_FAILURE:APPROVED_OWNER_NOT_LOADED:'+JSON.stringify(missing));
for(const [before,after] of m.loadOrder?.checks||[]){
  const a=scripts.indexOf(before),b=scripts.indexOf(after);
  if(a<0||b<0||a>=b)throw new Error('RELEASE_COMPOSITION_FAILURE:LOAD_ORDER:'+before+'->'+after);
}
for(const f of m.preservedNonAuthoritySource||[]){
  const rel=f.path.replace(/^app\//,'');
  if(scripts.includes(rel))throw new Error('RELEASE_COMPOSITION_FAILURE:NON_AUTHORITY_LIBRARY_BECAME_ACTIVE:'+rel);
}
const overlay=m.loadOrder?.preservedSupersededOverlay;
if(overlay?.path){
  const oi=scripts.indexOf(overlay.path.replace(/^app\//,''));
  const ci=scripts.indexOf('adapters/tya-c6-domain-consistency-bridge.js');
  if(oi<0||ci<0||oi>=ci)throw new Error('RELEASE_COMPOSITION_FAILURE:SUPERSEDED_OVERLAY_ORDER');
}

const out={...m,
  schemaVersion:'cxorbia.recovery.module-truth-matrix.v8-preterminal-21',
  generatedAt:new Date().toISOString(),
  productSource:{sha:SOURCE,treeSha:TREE||git('rev-parse',SOURCE+'^{tree}')},
  lastServedSource:LAST_SERVED,
  sourceFiles,modules,
  phaseAComplete:false,allModulesMatch:false,
  entrypointClosure:{
    ...(m.entrypointClosure||{}),
    loadedScriptsTotal:scripts.length,
    duplicateSrc:[],
    missingApprovedOwners:[],
    allApprovedOwnersLoaded:true
  },
  preTerminalComposition:{
    decision:'PASS_C3_PRETERMINAL_COMPOSITION',
    moduleCount:modules.length,
    matchModules:modules.filter(x=>x.classification==='MATCH').map(x=>x.domain),
    composedNotDeployedModules:modules.filter(x=>x.classification==='COMPOSED_NOT_DEPLOYED').map(x=>x.domain),
    pendingFileCount:uncoveredFiles.length,
    pendingServedOwnerProofFiles:sourceFiles.filter(x=>x.classification==='PENDING_OWNER_PROOF_SERVED').map(x=>x.path),
    pendingBlobProvenanceFiles:pendingProvenance,
    pendingMappingApprovalFiles:mappingPending.map(x=>x.path),
    terminalEligible:modules.every(x=>x.classification==='MATCH')&&uncoveredFiles.length===0,
    modulesWithCurrentOwnerProof:modules.filter(x=>x.currentOwnerProofStatus==='PATH_BOUND_OWNER_PROVEN').map(x=>x.domain),
    historicalModuleMatchesPreserved:modules.filter(x=>x.historicalMatchPreserved).map(x=>x.domain),
    unauthorizedFileCount:0,
    pathBoundAuthority:true,
    globalCandidateSelfApproval:false,
    loadOrderPass:true,
    production:false
  },
  authorityRows
};
fs.mkdirSync(OUT_FILE.split('/').slice(0,-1).join('/')||'.',{recursive:true});
fs.writeFileSync(OUT_FILE,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
  decision:out.preTerminalComposition.decision,
  sourceSha:SOURCE,
  moduleCount:modules.length,
  matchModules:out.preTerminalComposition.matchModules.length,
  composedNotDeployedModules:out.preTerminalComposition.composedNotDeployedModules.length,
  pendingFileCount:out.preTerminalComposition.pendingFileCount,
  pendingMappingApprovalCount:out.preTerminalComposition.pendingMappingApprovalFiles.length,
  pendingBlobProvenanceCount:out.preTerminalComposition.pendingBlobProvenanceFiles.length,
  terminalEligible:out.preTerminalComposition.terminalEligible,
  production:false
},null,2));
