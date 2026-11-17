import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {assertCanonicalModuleCoverage} from './cxorbia-i3-terminal-module-domain-coverage.mjs';
import {validateTenantReadonlyReceipt} from './cxorbia-i3-tenant-readonly-acceptance.mjs';
import {validateBenefitsReadonlyReceipt,BENEFITS_FINDINGS} from './cxorbia-i3-benefits-readonly-contract.mjs';

const resolvedState=state=>{
  const s=String(state||'');
  if(!s||/^P0_PROVEN(?:_|$)/.test(s)||/PENDING|REQUIRED|HOLD|FAIL|OPEN/.test(s))return false;
  return /^PASS_/.test(s)||/FIXED_(?:SOURCE_)?PROVEN|PROVEN_CLOSED|CLOSED_PROVEN|ALREADY_PROVEN|RESOLVED/.test(s);
};
const ownerPaths=v=>[...(Array.isArray(v?.owner)?v.owner:(v?.owner?[v.owner]:[])),...(v?.owners||[]),...(v?.sourceFixFiles||[]),...(v?.productFiles||[])].map(String);
const priorIds=['VRM-036','VRM-037','VRM-039','VRM-042'];
const terminalIds=['VRM-033','VRM-034','VRM-035','VRM-038','VRM-040','VRM-041'];

// Pending functional proof produces a durable HOLD report. Identity corruption
// still throws. Only the final 21-domain + global-proof conjunction yields GO.
export function evaluateTerminalModuleTruth({pre,ledger,focal={},human={},qa={},parity={},identity,additionalReceipts=[]}){
  const {sourceSha:SOURCE,sourceTree:TREE,runtimeRevision:RUNTIME,runtimeDigest:DIGEST,hostingVersion:HOSTING}=identity;
  if(pre?.preTerminalComposition?.decision!=='PASS_C3_PRETERMINAL_COMPOSITION'||pre?.productSource?.sha!==SOURCE||pre?.productSource?.treeSha!==TREE)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_PRETERMINAL_RECEIPT');
  const pendingMappings=pre?.preTerminalComposition?.pendingMappingApprovalFiles||[];
  if(pendingMappings.length)throw new Error('MAPPING_FAILURE:C3_PENDING_SOURCE_APPROVAL_MAPPING:'+pendingMappings.join(','));
  const modules=(pre.modules||[]).map(x=>({...x,pendingTerminalFiles:[...(x.pendingTerminalFiles||[])]}));
  const sourceFiles=(pre.sourceFiles||[]).map(x=>({...x}));
  assertCanonicalModuleCoverage(modules);
  if(pre.preTerminalComposition.moduleCount!==21)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_PRETERMINAL_MODULE_COUNT_NOT_21');
  const failures=[],historicalReceipts=[],rejectedReceipts=[],receiptsByDomain=new Map(),closedByCurrentReceipt=new Set();
  const addFailure=code=>{if(!failures.includes(code))failures.push(code);};
  if(focal.decision!=='PASS_PRE_I4_FOCAL_HUMAN_BROWSER'||focal.sourceSha!==SOURCE)addFailure('C3_HARDENED_FOCAL');
  if(human.decision!=='PASS_I3_HUMAN_LIVE_ACCEPTANCE'||human.sourceSha!==SOURCE)addFailure('C3_FULL_HUMAN_ACCEPTANCE');
  if(!/^[a-f0-9]{64}$/.test(String(focal.hrRevision||''))||!/^[a-f0-9]{64}$/.test(String(human.sourceRevision||'')))addFailure('C3_HR_REVISION_MISSING');
  if(focal.hrRevision && human.sourceRevision && focal.hrRevision!==human.sourceRevision)throw new Error('RELEASE_COMPOSITION_FAILURE:C3_HR_REVISION_DESYNC');
  if(qa.decision!=='PASS_C3_QA_RESERVATION_CLEANUP'||Number(qa.after)!==0)addFailure('C3_QA_RESIDUE');
  if(parity.decision!=='PASS_C3_PENDING_OWNER_BYTE_PARITY'||Number(parity.mismatches)!==0)addFailure('C3_PENDING_OWNER_PARITY');
  const f=ledger.findings||{};
  const candidates=[];
  for(const [id,v] of Object.entries(f)){
    if(!resolvedState(v.state))continue;
    const te=v.terminalEvidence||{},rs=Array.isArray(te.ownerSpecificReceipts)?te.ownerSpecificReceipts:(te.ownerSpecificReceipt?[te.ownerSpecificReceipt]:[]);
    for(const receipt of rs)candidates.push({findingId:id,receipt,additional:false});
  }
  for(const receipt of additionalReceipts)candidates.push({findingId:(receipt.findingIds||[]).join('+'),receipt,additional:true});
  for(const row of candidates){
    const {findingId:id,receipt:r}=row,domain=String(r.moduleDomain||''),mod=modules.find(m=>m.domain===domain);
    if(!mod)continue;
    if(r.sourceSha!==SOURCE||r.sourceTree!==TREE||r.runtimeRevision!==RUNTIME||r.runtimeDigest!==DIGEST||r.hostingVersion!==HOSTING){
      historicalReceipts.push({findingId:id,moduleDomain:domain,sourceSha:r.sourceSha,reason:'HISTORICAL_IDENTITY_NOT_CURRENT_RECEIPT'});continue;
    }
    const errors=[];
    const need=(ok,k)=>{if(!ok)errors.push(k);};
    need(String(r.decision||'').startsWith('PASS_'),'DECISION');
    need(r.production===false,'PRODUCTION');
    need(r.hrIndependent===true?(!r.hrRevision||r.hrRevision===human.sourceRevision):r.hrRevision===human.sourceRevision&&!!human.sourceRevision,'HR_REVISION');
    const paths=(r.ownerPaths||[]).map(String);
    need(paths.length>0,'PATHS');
    const ids=row.additional?(r.findingIds||[]):[id];
    need(ids.length>0 && ids.every(fid=>f[fid] && paths.every(p=>ownerPaths(f[fid]).includes(p))),'OWNER_MISMATCH');
    if(r.operationKind==='READ_ONLY'){
      const benefits=domain==='benefits';
      const check=benefits?validateBenefitsReadonlyReceipt(r,mod):validateTenantReadonlyReceipt(r,mod);errors.push(...check.failures);
      // A readonly receipt closes only the exact approved readonly findings.
      need(ids.every(fid=>(benefits?BENEFITS_FINDINGS:['VRM-194','VRM-330']).includes(fid)),'READONLY_FINDING_SCOPE');
    }else{
      for(const k of ['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression'])need(r[k]===true,'INCOMPLETE:'+k);
      // Previously MATCH domains need only reproof of the affected owner files.
      // A new full-domain promotion also needs explicit functional obligations.
      if(mod.classification!=='MATCH')need(r.contractCoverage?.fullDomain===true && Array.isArray(r.contractCoverage.obligations) && r.contractCoverage.obligations.length>0 && r.contractCoverage.obligations.every(x=>x.observed===true && x.evidenceRef),'FUNCTIONAL_OBLIGATIONS');
    }
    if(errors.length){rejectedReceipts.push({findingId:id,moduleDomain:domain,reasons:errors});continue;}
    if(!receiptsByDomain.has(domain))receiptsByDomain.set(domain,[]);
    receiptsByDomain.get(domain).push(row);
    if(row.additional)for(const fid of ids)closedByCurrentReceipt.add(fid);
  }
  const isResolved=id=>resolvedState(f[id]?.state)||closedByCurrentReceipt.has(id);
  for(const id of priorIds)if(!isResolved(id))addFailure('C3_PRIOR_P0_NOT_RESOLVED:'+id);
  for(const id of terminalIds)if(!isResolved(id))addFailure('C3_TERMINAL_FINDING_NOT_RESOLVED:'+id);
  const openP0=Object.entries(f).filter(([id,v])=>(String(v.severity||'').toUpperCase()==='P0'||/^P0_PROVEN(?:_|$)/.test(String(v.priority||'')))&&!isResolved(id));
  if(openP0.length)addFailure('C3_OPEN_P0_FINDINGS:'+openP0.map(([id])=>id).join(','));
  const promotionByDomain=new Map(),domainResults=[];
  for(const mod of modules){
    const cls=String(mod.classification||''),pending=(mod.pendingTerminalFiles||[]).map(String),domain=mod.domain;
    if(cls==='MATCH'&&!pending.length)continue;
    const moduleFiles=sourceFiles.filter(x=>x.phaseAAuthority!==false&&x.domain===domain).map(x=>String(x.path||'')).filter(Boolean);
    const required=cls==='MATCH'?pending:[...new Set([...(mod.owners||[]),...moduleFiles])];
    const candidate=receiptsByDomain.get(domain)||[],covered=new Set(candidate.flatMap(x=>x.receipt.ownerPaths||[]));
    const uncovered=required.filter(p=>!covered.has(p));
    const blockers=openP0.filter(([,v])=>v.moduleDomain===domain || (v.moduleDomains||[]).includes(domain));
    const reasons=[];
    if(!candidate.length)reasons.push('C3_OWNER_RECEIPT_MISSING:'+domain);
    if(uncovered.length)reasons.push('C3_OWNER_RECEIPT_PENDING_FILE_UNCOVERED:'+domain+':'+uncovered.join(','));
    if(blockers.length)reasons.push('C3_DOMAIN_P0_OPEN:'+domain+':'+blockers.map(([id])=>id).join(','));
    domainResults.push({moduleDomain:domain,status:reasons.length?'HOLD':'GO',requiredOwnerPaths:required,coveredOwnerPaths:[...covered],reasons,
      rejectedReceipts:rejectedReceipts.filter(x=>x.moduleDomain===domain),historicalReceiptCount:historicalReceipts.filter(x=>x.moduleDomain===domain).length});
    if(reasons.length){reasons.forEach(addFailure);continue;}
    promotionByDomain.set(domain,candidate);
    mod.preTerminalClassification=cls;mod.classification='MATCH';mod.pendingTerminalFiles=[];
    mod.terminalServedSource=SOURCE;mod.terminalProof='CURRENT_OWNER_SPECIFIC_FUNCTIONAL_CONTRACT';
    mod.ownerSpecificReceiptFindingIds=candidate.map(x=>x.findingId);mod.historicalMatchPreserved=cls==='MATCH';
  }
  for(const file of sourceFiles){
    if(file.phaseAAuthority===false){file.terminalProof='PRESERVED_NON_RUNTIME_OWNER_NOT_PART_OF_TERMINAL_ACCEPTANCE';continue;}
    if(file.classification==='MATCH'){file.terminalServedSource=SOURCE;file.terminalProof='preserved-preterminal-match+same-source-byte-parity';continue;}
    const rows=promotionByDomain.get(file.domain)||[];
    if(!rows.some(x=>(x.receipt.ownerPaths||[]).includes(file.path)))continue;
    file.preTerminalClassification=file.classification;file.classification='MATCH';file.terminalServedSource=SOURCE;
    file.terminalProof='owner-specific-receipt+same-source-byte-parity';file.ownerSpecificReceiptFindingIds=rows.map(x=>x.findingId);
  }
  const nonMatchModules=modules.filter(x=>x.classification!=='MATCH');
  const nonMatchFiles=sourceFiles.filter(x=>x.phaseAAuthority!==false&&x.classification!=='MATCH');
  if(nonMatchModules.length||nonMatchFiles.length)addFailure('C3_MODULE_TRUTH_NOT_CLOSED');
  const complete=failures.length===0;
  const receiptRows=[...promotionByDomain.entries()].flatMap(([moduleDomain,rows])=>rows.map(x=>({moduleDomain,findingId:x.findingId,decision:x.receipt.decision,ownerPaths:x.receipt.ownerPaths})));
  return {...pre,schemaVersion:'cxorbia.recovery.module-truth-matrix.v10-incremental-owner-receipts',generatedAt:new Date().toISOString(),
    productSource:{sha:SOURCE,treeSha:TREE},sourceFiles,modules,phaseAComplete:complete,allModulesMatch:nonMatchModules.length===0&&nonMatchFiles.length===0,
    terminalClosure:{decision:complete?'PASS_C3_TERMINAL_MODULE_TRUTH_21_21':'HOLD_C3_TERMINAL_MODULE_TRUTH',status:complete?'GO':'HOLD',
      moduleCount:21,matchModules:modules.filter(x=>x.classification==='MATCH').length,nonMatchModules:nonMatchModules.length,
      sourceSha:SOURCE,sourceTree:TREE,hrRevision:String(human.sourceRevision||''),runtimeRevision:RUNTIME,runtimeDigest:DIGEST,hostingVersion:HOSTING,
      hardenedFocalDecision:focal.decision||null,fullHumanDecision:human.decision||null,qaReservationAfter:qa.after??null,pendingOwnerByteParity:parity.decision||null,
      terminalFindingsResolved:terminalIds.filter(isResolved),priorP0Resolved:priorIds.filter(isResolved),ownerSpecificReceipts:receiptRows,
      domainResults,historicalReceipts,rejectedReceipts,closedByCurrentReceipt:[...closedByCurrentReceipt],
      unresolvedP0:openP0.map(([id,v])=>({id,state:v.state,priority:v.priority||v.severity})),failures,selfApproval:false,production:false}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const E=process.env,read=p=>p&&fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{};
  for(const k of ['C3_PRETERMINAL','C3_LEDGER','C3_FINAL_MATRIX','C3_SOURCE','C3_TREE','C3_RUNTIME_REVISION','C3_RUNTIME_DIGEST','C3_HOSTING_VERSION'])if(!E[k])throw new Error('ENVIRONMENT_FAILURE:C3_FINALIZE_'+k);
  const extra=read(E.C3_ADDITIONAL_RECEIPTS),additionalReceipts=Array.isArray(extra)?extra:extra.moduleDomain?[extra]:extra.ownerSpecificReceipts||[];
  const out=evaluateTerminalModuleTruth({pre:read(E.C3_PRETERMINAL),ledger:read(E.C3_LEDGER),focal:read(E.C3_FOCAL),human:read(E.C3_HUMAN),qa:read(E.C3_QA),parity:read(E.C3_PARITY),additionalReceipts,
    identity:{sourceSha:E.C3_SOURCE,sourceTree:E.C3_TREE,runtimeRevision:E.C3_RUNTIME_REVISION,runtimeDigest:E.C3_RUNTIME_DIGEST,hostingVersion:E.C3_HOSTING_VERSION}});
  fs.writeFileSync(E.C3_FINAL_MATRIX,JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify(out.terminalClosure,null,2));
  if(!out.phaseAComplete&&E.C3_MODE!=='progress'){console.error(out.terminalClosure.failures.join('\n'));process.exitCode=2;}
}
