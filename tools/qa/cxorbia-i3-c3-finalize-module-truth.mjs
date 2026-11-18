import fs from 'node:fs';
import crypto from 'node:crypto';
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
const sha256=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const SHA256=/^[a-f0-9]{64}$/;
// The kind required to close a domain is independent of the evidence used to
// inspect its UI. In particular, a read-only screenshot is never a finance ACK.
// Frozen, module-specific requirements take precedence over these conservative
// fallbacks. Extra kinds can be imposed by the immutable module contract.
const requiredKindByDomain={
  'auth-protected-data-runtime':['AUTH_SESSION'],
  // Cold/warm boot, route restoration and role re-entry require real sessions
  // and browser navigation; a passive read must not close this module.
  'base-router-shell-cache':['AUTH_SESSION','UI_INTERACTION'],
  benefits:['READ_ONLY'],
  'canonical-hr-state-adapters':['PROVIDER_WRITE'],
  certifications:['PROVIDER_WRITE'],
  'client-portal-reportkit':['PROVIDER_WRITE'],
  'core-config-data-router-permissions':['UI_INTERACTION'],
  'dashboard-operation':['UI_INTERACTION'],
  'documents-resources':['PROVIDER_WRITE'],
  'finance-core-liquidation-costs':['PROVIDER_WRITE'],
  historical:['READ_ONLY'],
  'human-runtime-domain-consistency':['UI_INTERACTION'],
  'identity-membership-roll-forward':['AUTH_SESSION'],
  'persistence-command-ack-boundary':['PROVIDER_WRITE'],
  'phase-a-supporting-core':['UI_INTERACTION'],
  'projects-periods-hr-source-wizard-multiproject':['PROVIDER_WRITE'],
  'questionnaire-shopper':['PROVIDER_WRITE'],
  'reports-admin-shopper':['UI_INTERACTION'],
  'shoppers-mi-visitas-profile':['PROVIDER_WRITE'],
  'visits-review-postulations-reservations':['PROVIDER_WRITE'],
  'tenant-admin-config-branding':['READ_ONLY']
};
const nonWritingKinds=new Set(['READ_ONLY','AUTH_SESSION','UI_INTERACTION']);
const validByteProof=(p,expected)=>p?.gitBlob===expected && p.byteParity===true &&
  SHA256.test(String(p.sourceSha256||'')) && p.sourceSha256===p.servedSha256;
const unchangedByteProof=(p,expected)=>p?.gitBlob===expected &&
  SHA256.test(String(p.sourceSha256||'')) && p.sourceSha256===p.servedSha256;
const currentBlobFor=(path,mod,sourceFiles)=>mod?.currentOwnerBlobs?.[path]||sourceFiles.find(x=>x.path===path)?.currentBlob;
const scopeErrors=(r,mod,sourceFiles,paths)=>{
  const errors=[],need=(ok,key)=>{if(!ok)errors.push(key);};
  const evidence=Array.isArray(r.ownerEvidence)?r.ownerEvidence:[];
  need(!!(mod.contractFunctional||mod.contract) && r.contractAuthority?.contractSha256===sha256(mod.contractFunctional||mod.contract),'FROZEN_CONTRACT_HASH');
  need(paths.every(p=>currentBlobFor(p,mod,sourceFiles) &&
    evidence.some(x=>x.path===p && validByteProof(x,currentBlobFor(p,mod,sourceFiles)))),'EXACT_CURRENT_OWNER_BYTE_PARITY');
  const s=r.scope||{},a=r.auth||{};
  need(typeof s==='object' && !!s.tenantId && !!s.projectId && !!s.periodId &&
    ['admin','super','shopper','client'].includes(s.role) && a.authenticated===true &&
    a.tenantExact===true && a.projectAuthorized===true && a.role===s.role,'AUTHENTICATED_CONTRACT_SCOPE');
  if(Array.isArray(mod.roles)&&mod.roles.length&&mod.roles.every(x=>typeof x==='string'))
    need(mod.roles.includes(s.role),'MODULE_ROLE_AUTHORITY');
  const coverage=r.contractCoverage||{};
  need(Array.isArray(coverage.obligations) && coverage.obligations.length>0 &&
    coverage.obligations.every(x=>x?.id && x.observed===true && x.evidenceRef && SHA256.test(String(x.evidenceSha256||''))),'OBSERVED_CONTRACT_OBLIGATIONS');
  return errors;
};
const nonWritingErrors=(r)=>{
  const errors=[],need=(ok,key)=>{if(!ok)errors.push(key);};
  const m=r.mutationEvidence||{};
  // Browser actions can be real without changing product state. Similarly,
  // ordinary Firebase/Auth sign-in can refresh Auth session state without
  // constituting a project/HR/Firestore business write.
  const authOnlySession=r.operationKind==='AUTH_SESSION'&&Number.isSafeInteger(m.authWrites)&&m.authWrites>=0;
  need(m.applicable===false && m.providerAckClaimed===false && r.providerAck!==true &&
    ['providerWrites','firestoreWrites','hrWrites'].every(k=>m[k]===0) &&
    (m.authWrites===0||authOnlySession),'NO_PRODUCT_OR_PROVIDER_MUTATION');
  if(r.operationKind==='READ_ONLY'){
    const p=r.readOnlyProof||{};
    need(p.liveReadback===true && p.expectedObserved===true && p.providerCommandsObserved===0,'LIVE_READONLY_REPROOF');
  }else if(r.operationKind==='AUTH_SESSION'){
    const p=r.authProof||{};
    need(p.ordinaryCredential===true && p.login===true && p.logout===true && p.relogin===true &&
      p.protectedScope===true,'REAL_CREDENTIAL_SESSION');
  }else if(r.operationKind==='UI_INTERACTION'){
    const p=r.uiProof||{};
    need(p.realBrowserE2E===true && p.routeConsistent===true && p.roleScopeVerified===true &&
      SHA256.test(String(p.visualEvidenceSha256||'')),'SCOPED_BROWSER_E2E');
  }
  return errors;
};
const approvedCarryForward=(r,mod,sourceFiles,identity)=>{
  const c=r.carryForward;
  if(!c||c.approvedUnchangedOwners!==true||c.ownerAndDependenciesUnchanged!==true||c.currentAssetReadback!==true||
    c.currentSourceSha!==identity.sourceSha||c.currentSourceTree!==identity.sourceTree||
    c.currentRuntimeRevision!==identity.runtimeRevision||c.currentRuntimeDigest!==identity.runtimeDigest||
    c.currentHostingVersion!==identity.hostingVersion||
    c.unchangedApprovedContractSha256!==sha256(mod.contractFunctional||mod.contract||''))return false;
  const owners=Array.isArray(c.ownerEvidence)?c.ownerEvidence:[],deps=Array.isArray(c.dependencyEvidence)?c.dependencyEvidence:[];
  if(!owners.length||!deps.length)return false;
  if(!(r.ownerPaths||[]).every(p=>owners.some(x=>x.path===p && unchangedByteProof(x,currentBlobFor(p,mod,sourceFiles)))))return false;
  return deps.every(x=>sourceFiles.some(s=>s.path===x.path &&
    unchangedByteProof(x,s.currentBlob)));
};
const moduleEvidenceRequirements=(mod,sourceFiles,candidate)=>{
  const cls=String(mod.classification||''),domain=mod.domain,pending=(mod.pendingTerminalFiles||[]).map(String);
  const moduleFiles=sourceFiles.filter(x=>x.phaseAAuthority!==false&&x.domain===domain).map(x=>String(x.path||'')).filter(Boolean);
  const required=cls==='MATCH'?pending:[...new Set([...(mod.owners||[]),...moduleFiles])];
  const covered=new Set(candidate.flatMap(x=>x.receipt.ownerPaths||[]));
  const uncovered=required.filter(p=>!covered.has(p));
  const reasons=[];
  if(!candidate.length)reasons.push('C3_OWNER_RECEIPT_MISSING:'+domain);
  if(uncovered.length)reasons.push('C3_OWNER_RECEIPT_PENDING_FILE_UNCOVERED:'+domain+':'+uncovered.join(','));
  const actualKinds=new Set(candidate.map(x=>x.receipt.operationKind||'PROVIDER_WRITE'));
  // A previously approved MATCH needs reproof only for its changed owner,
  // not a new full-domain ceremony. Non-MATCH domains need their real kind.
  const requiredKinds=cls==='MATCH'?[]:
    Array.isArray(mod.terminalRequiredOperationKinds)&&mod.terminalRequiredOperationKinds.length?
      mod.terminalRequiredOperationKinds:(requiredKindByDomain[domain]||['PROVIDER_WRITE']);
  const missingKinds=requiredKinds.filter(kind=>!actualKinds.has(kind));
  if(missingKinds.length)reasons.push('C3_REQUIRED_OPERATION_PROOF_MISSING:'+domain+':'+missingKinds.join(','));
  // Evidence may be combined, but the inventory of obligations must be frozen
  // in the contract; one receipt cannot create its own required obligations.
  if(cls!=='MATCH' && !['benefits','tenant-admin-config-branding'].includes(domain)){
    const requiredIds=Array.isArray(mod.terminalRequiredObligationIds)?mod.terminalRequiredObligationIds:[];
    const observed=new Set(candidate.flatMap(x=>(x.receipt.contractCoverage?.obligations||[]).filter(o=>o.observed===true).map(o=>o.id)));
    if(requiredIds.length){
      const missing=requiredIds.filter(id=>!observed.has(id));
      if(missing.length)reasons.push('C3_CONTRACT_OBLIGATION_MISSING:'+domain+':'+missing.join(','));
    }else if(!candidate.some(x=>x.receipt.contractCoverage?.fullDomain===true)){
      reasons.push('C3_FULL_DOMAIN_EVIDENCE_REQUIRED:'+domain);
    }
  }
  return {required,covered,reasons};
};

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
    const currentIdentity=r.sourceSha===SOURCE&&r.sourceTree===TREE&&r.runtimeRevision===RUNTIME&&r.runtimeDigest===DIGEST&&r.hostingVersion===HOSTING;
    if(!currentIdentity&&!approvedCarryForward(r,mod,sourceFiles,identity)){
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
    // Contract evidence may be attached to a module even without a historical
    // defect. It can never silently resolve any unrelated ledger finding.
    if(ids.length)need(ids.every(fid=>f[fid] && paths.every(p=>ownerPaths(f[fid]).includes(p))),'OWNER_MISMATCH');
    else need(row.additional && paths.every(p=>(mod.owners||[]).includes(p)),'OWNER_DOMAIN_SCOPE');
    const hardenedReadOnly=r.operationKind==='READ_ONLY'&&['benefits','tenant-admin-config-branding'].includes(domain);
    if(hardenedReadOnly){
      const benefits=domain==='benefits';
      const check=benefits?validateBenefitsReadonlyReceipt(r,mod):validateTenantReadonlyReceipt(r,mod);errors.push(...check.failures);
      // The two explicitly frozen read-only contracts retain their strict
      // domain-specific validators and approved finding scopes.
      need(ids.length>0 && ids.every(fid=>(benefits?BENEFITS_FINDINGS:['VRM-194','VRM-330']).includes(fid)),'READONLY_FINDING_SCOPE');
    }else if(nonWritingKinds.has(r.operationKind)){
      errors.push(...scopeErrors(r,mod,sourceFiles,paths),...nonWritingErrors(r));
    }else if(!r.operationKind||r.operationKind==='PROVIDER_WRITE'){
      for(const k of ['actionReal','providerAck','durableReadback','reloadProof','noDuplicateRegression'])need(r[k]===true,'INCOMPLETE:'+k);
      if(r.operationKind==='PROVIDER_WRITE'){
        const p=r.providerWriteProof||{};
        need(!!p.remoteReceiptId && !!p.idempotencyKey && p.replayNoDuplicate===true,'REMOTE_ACK_IDEMPOTENCY_REPLAY');
        errors.push(...scopeErrors(r,mod,sourceFiles,paths));
      }
      // Previously MATCH domains need only reproof of the affected owner files.
      // A new full-domain promotion also needs explicit functional obligations.
      if(mod.classification!=='MATCH')need((r.contractCoverage?.fullDomain===true ||
        Array.isArray(mod.terminalRequiredObligationIds)&&mod.terminalRequiredObligationIds.length>0) &&
        Array.isArray(r.contractCoverage?.obligations) && r.contractCoverage.obligations.length>0 &&
        r.contractCoverage.obligations.every(x=>x.observed===true && x.evidenceRef),'FUNCTIONAL_OBLIGATIONS');
    }else errors.push('UNKNOWN_OPERATION_KIND');
    if(errors.length){rejectedReceipts.push({findingId:id,moduleDomain:domain,reasons:errors});continue;}
    if(!receiptsByDomain.has(domain))receiptsByDomain.set(domain,[]);
    receiptsByDomain.get(domain).push(row);
  }
  // A partial receipt is never sufficient to resolve a P0. Only complete
  // owner/kind/obligation coverage can close its explicitly scoped findings.
  for(const mod of modules){
    const pending=mod.pendingTerminalFiles||[];
    if(mod.classification==='MATCH'&&!pending.length)continue;
    const candidate=receiptsByDomain.get(mod.domain)||[];
    if(moduleEvidenceRequirements(mod,sourceFiles,candidate).reasons.length)continue;
    for(const row of candidate)if(row.additional)for(const fid of row.receipt.findingIds||[])closedByCurrentReceipt.add(fid);
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
    const candidate=receiptsByDomain.get(domain)||[];
    const {required,covered,reasons}=moduleEvidenceRequirements(mod,sourceFiles,candidate);
    const blockers=openP0.filter(([,v])=>v.moduleDomain===domain || (v.moduleDomains||[]).includes(domain));
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
