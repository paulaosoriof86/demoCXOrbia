import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const TEMPLATE=process.env.TEMPLATE||'RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json';
const LEDGER=process.env.LEDGER||'CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V10_2026-09-24.json';
const SOURCE=String(process.env.SOURCE||'').trim();
const TREE=String(process.env.TREE||'').trim();
const LAST_SERVED=String(process.env.LAST_SERVED||'d8aad982ae4b47e66bf949d906b6c7ede8866f84').trim();
const OUT_FILE=process.env.OUT_FILE||'.tmp/c3-preterminal/module-truth-preterminal.json';
if(!/^[a-f0-9]{40}$/.test(SOURCE))throw new Error('SOURCE_FAILURE:C3_SOURCE_MISSING');
if(!/^[a-f0-9]{40}$/.test(LAST_SERVED))throw new Error('SOURCE_FAILURE:C3_LAST_SERVED_MISSING');

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const safeBlob=(ref,path)=>{try{return git('rev-parse',ref+':'+path)}catch{return null}};
const m=JSON.parse(fs.readFileSync(TEMPLATE,'utf8'));
const ledger=JSON.parse(fs.readFileSync(LEDGER,'utf8'));
if((m.modules||[]).length!==20)throw new Error('RELEASE_COMPOSITION_FAILURE:MODULE_COUNT_NOT_20');
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

const unauthorized=[];
const authorityRows=[];
const sourceFiles=(m.sourceFiles||[]).map(orig=>{
  const f={...orig};
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
    if(allProven)unauthorized.push({path:f.path,domain:f.domain,actual,reason:'PROVEN_FINDING_WITHOUT_PATH_BOUND_BLOB_AUTHORITY',states});
    else{
      f.approvedSourceCommit=null;f.approvedBlob=null;f.provenanceIndependent=false;
      f.approvalStatus='PENDING_FINDING_PROOF';
      f.classification='COMPOSED_NOT_DEPLOYED';
      f.pendingFindingIds=states.map(x=>x.id);
    }
  }else{
    unauthorized.push({path:f.path,domain:f.domain,actual,reason:'CURRENT_BLOB_HAS_NO_APPROVED_OR_PATH_BOUND_FINDING_AUTHORITY'});
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
  const pending=files.filter(x=>x.classification==='COMPOSED_NOT_DEPLOYED');
  return {...mod,
    classification:pending.length?'COMPOSED_NOT_DEPLOYED':'MATCH',
    currentCandidateSource:SOURCE,
    lastServedSource:LAST_SERVED,
    pendingTerminalFiles:pending.map(x=>x.path),
    ownerAuthorityCount:files.length
  };
});
if(modules.some(x=>!['MATCH','COMPOSED_NOT_DEPLOYED'].includes(x.classification)))throw new Error('RELEASE_COMPOSITION_FAILURE:INVALID_PRETERMINAL_MODULE_STATE');

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
  schemaVersion:'cxorbia.recovery.module-truth-matrix.v7-preterminal',
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
    pendingFileCount:sourceFiles.filter(x=>x.classification==='COMPOSED_NOT_DEPLOYED').length,
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
  production:false
},null,2));
