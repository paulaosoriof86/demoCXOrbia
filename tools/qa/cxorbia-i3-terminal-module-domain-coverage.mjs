import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateTerminalAcceptedReceipt} from './cxorbia-i3-c3-finalize-module-truth.mjs';
import {DOCUMENT_AUTHORITY_KIND,validateD01DocumentAuthorityBinding} from './cxorbia-i3-document-authority-task-binding.mjs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// The historical module registry has 20 domains; November's independently
// accepted tenant configuration/branding domain is the twenty-first.
export const HISTORICAL_REGISTRY_PATH='CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json';
export const ADDITIONAL_APPROVED_DOMAIN='tenant-admin-config-branding';

export function assertCanonicalModuleCoverage(modules,{registryPath=HISTORICAL_REGISTRY_PATH}={}){
  const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
  const baseline=(registry.modules||[]).map(x=>String(x.domain||''));
  if(baseline.length!==20||new Set(baseline).size!==20||baseline.includes(ADDITIONAL_APPROVED_DOMAIN))
    throw new Error('RELEASE_COMPOSITION_FAILURE:C3_HISTORICAL_REGISTRY_UNEXPECTED');
  const required=[...baseline,ADDITIONAL_APPROVED_DOMAIN];
  const actual=(Array.isArray(modules)?modules:[]).map(x=>String(x.domain||''));
  const uniq=new Set(actual),need=new Set(required);
  if(actual.length!==21||uniq.size!==21||actual.some(domain=>!need.has(domain))||required.some(domain=>!uniq.has(domain)))
    throw new Error('RELEASE_COMPOSITION_FAILURE:C3_CANONICAL_21_DOMAIN_SET:'+JSON.stringify({expected:required,actual}));
  return {moduleCount:21,domains:required,matchModules:modules.filter(x=>x.classification==='MATCH').length};
}
export function assertAllModulesAccepted(modules){
  const pending=modules.filter(x=>x.classification!=='MATCH').map(x=>({domain:x.domain,classification:x.classification}));
  if(pending.length)throw new Error('FUNCTIONAL_DEFECT:C3_UNCERTIFIED_MODULES:'+JSON.stringify(pending));
}

// Current acceptance selector: original business contracts. The 21-domain list
// remains the owner inventory; legacy MATCH acceptance is historical only.
export const FUNCTIONAL_TASK_MODE='FROZEN_FUNCTIONAL_TASK_SETS';
export const LEGACY_TASK_MODE='LEGACY_21_HISTORICAL';
export const FUNCTIONAL_TASK_CONTRACTS='docs/checkpoints/CXORBIA_I3_FROZEN_FUNCTIONAL_TASK_CONTRACTS_20261125.json';
export const FUNCTIONAL_TASK_CONTRACTS_SHA256='a8908d4879473ae3d0afe8d6dd4462788bc3f42409781db7ed766deee208e832';
export const ORIGINAL_PLAN_SHA256='83e8f2c0a6b190bab1d9dea32bf99158116f3164f419ae72e051fd791fd8576c';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export const taskMappingSha256=value=>hash(JSON.stringify(canonical(value)));
const HEX=/^[a-f0-9]{64}$/;
const role=value=>value==='cliente'?'client':value;
const identityFields=['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion','artifactSha256'];
export function readFrozenTaskContracts(){
 const raw=fs.readFileSync(FUNCTIONAL_TASK_CONTRACTS,'utf8');
 if(hash(raw)!==FUNCTIONAL_TASK_CONTRACTS_SHA256)throw Error('SOURCE_FAILURE:FUNCTIONAL_TASK_CONTRACT_HASH');
 const c=JSON.parse(raw),ids=Object.values(c.taskSets).flat();
 if(c.activeMode!==FUNCTIONAL_TASK_MODE||c.originalPlanSha256!==ORIGINAL_PLAN_SHA256||ids.length!==52||new Set(ids).size!==52||c.tasks.length!==52||c.tasks.some(t=>!ids.includes(t.taskId)||taskMappingSha256(t.frozenAuthority)!==t.acceptanceBindingSha256))throw Error('SOURCE_FAILURE:FUNCTIONAL_TASK_INVENTORY');
 return c;
}
// Inputs are owner receipts accepted by the existing C3 source/scope/ACK checks.
// The mapping is frozen in the matrix, never supplied by a producer receipt.
export function evaluateFrozenTaskCoverage({matrix,receipts=[],identity={}}){
 const failures=[],tasks=[];let contracts;
 try{contracts=readFrozenTaskContracts();}catch(error){return {mode:FUNCTIONAL_TASK_MODE,pass:false,failures:[error.message],tasks,production:false};}
 const fail=code=>{if(!failures.includes(code))failures.push(code);};
 if(!HEX.test(identity.artifactSha256||'')||!identityFields.every(k=>typeof identity[k]==='string'&&identity[k]))fail('C3_PROCESS_ARTIFACT_IDENTITY_REQUIRED');
 const mappings=matrix.functionalTaskEvidenceMappings||{};
 for(const task of contracts.tasks){
  const mapping=mappings[task.taskId],missing=[],reject=[];
  // The original D01 contract is document/version/approval authority. Reuse
  // that immutable accepted proof without manufacturing a runtime execution.
  // This explicit branch does not change any functional receipt validator.
  if(mapping?.acceptanceKind===DOCUMENT_AUTHORITY_KIND){
   const documentProof=validateD01DocumentAuthorityBinding({task,mapping,matrix});
   if(!documentProof.pass)fail('C3_PROCESS_TASK_UNPROVEN:'+task.taskId);
   tasks.push({taskId:task.taskId,taskSet:task.taskSet,status:documentProof.pass?'GO':'HOLD',
    acceptanceBindingSha256:task.acceptanceBindingSha256,mappingSha256:taskMappingSha256(mapping),
    missingClauses:documentProof.pass?[]:(mapping.requiredClauses||[]).map(c=>c.id),
    mappingFailures:documentProof.failures,documentaryEvidence:documentProof});
   continue;
  }
  const bad=code=>reject.push(code);
  if(!mapping)bad('MAPPING_MISSING');
  else{
   if(mapping.taskId!==task.taskId||mapping.originalPlanSha256!==ORIGINAL_PLAN_SHA256||mapping.acceptanceBindingSha256!==task.acceptanceBindingSha256||mapping.completeTaskInventory!==true)bad('MAPPING_CONTRACT_BINDING');
   if(!Array.isArray(mapping.requiredClauses)||!mapping.requiredClauses.length||new Set(mapping.requiredClauses.map(c=>c.id)).size!==mapping.requiredClauses.length)bad('MAPPING_CLAUSE_INVENTORY');
   const clauses=Array.isArray(mapping.requiredClauses)?mapping.requiredClauses:[];
   for(const c of clauses){
    const mod=matrix.modules?.find(m=>m.domain===c.moduleDomain),owners=[...(mod?.owners||[]),...(matrix.sourceFiles||[]).filter(f=>f.phaseAAuthority!==false&&f.domain===c.moduleDomain).map(f=>f.path)];
    if(!c.id||!mod||!Array.isArray(c.ownerPaths)||!c.ownerPaths.length||c.ownerPaths.some(p=>!owners.includes(p))||!['READ_ONLY','AUTH_SESSION','UI_INTERACTION','PROVIDER_WRITE'].includes(c.operationKind)||!['admin','super','shopper','client','cliente'].includes(c.role)||!c.scope?.tenantId||!c.scope?.projectId||!Object.hasOwn(c.scope,'periodId'))bad('MAPPING_OWNER_KIND_SCOPE');
   }
   if(task.ownerPaths.some(p=>!clauses.some(c=>c.ownerPaths?.includes(p))))bad('MAPPING_FROZEN_OWNER_UNCOVERED');
   // Frozen roleRoutes are traceability joins, not a task-by-route test matrix.
   // Full-human/G20 acceptance retains global role/route coverage. An explicit
   // UI_INTERACTION clause still requires its own exact route, role and UI proof.
   if(!reject.length){
    const mappingHash=taskMappingSha256(mapping);
    for(const clause of clauses){
     const observed=receipts.some(r=>{
      const current=identityFields.filter(k=>k!=='artifactSha256').every(k=>r[k]===identity[k])&&(!r.artifactSha256||r.artifactSha256===identity.artifactSha256);
      const cf=r.carryForward||{},carry=cf.approvedUnchangedOwners===true&&cf.ownerAndDependenciesUnchanged===true&&cf.currentAssetReadback===true&&(!cf.currentArtifactSha256||cf.currentArtifactSha256===identity.artifactSha256)&&identityFields.filter(k=>k!=='artifactSha256').every(k=>cf['current'+k[0].toUpperCase()+k.slice(1)]===identity[k]);
      const binding=r.contractAuthority?.taskBindings?.find(b=>b.taskId===task.taskId);
      const scoped=matrix.modules?.find(m=>m.domain===clause.moduleDomain)?.scopedContractAuthorities?.[task.taskId];
      const typedBinding=binding?.acceptanceBindingSha256===task.acceptanceBindingSha256&&binding?.mappingSha256===mappingHash;
      const existingBinding=r.contractAuthority?.taskId===task.taskId&&HEX.test(clause.scopeContractSha256||'')&&r.contractAuthority.scopeContractSha256===clause.scopeContractSha256&&scoped?.sha256===clause.scopeContractSha256;
      return (current||carry)&&r.production===false&&String(r.decision||'').startsWith('PASS_')&&r.moduleDomain===clause.moduleDomain&&r.operationKind===clause.operationKind&&role(r.scope?.role)===role(clause.role)&&['tenantId','projectId','periodId'].every(k=>(r.scope?.[k]??null)===(clause.scope[k]??null))&&clause.ownerPaths.every(p=>r.ownerPaths?.includes(p))&&(!clause.route||r.uiProof?.route===clause.route)&&(typedBinding||existingBinding)&&r.contractCoverage?.obligations?.some(o=>o.id===clause.id&&o.observed===true&&o.evidenceRef&&HEX.test(o.evidenceSha256||''));
     });
     if(!observed)missing.push(clause.id);
    }
   }
  }
  if(reject.length||missing.length)fail('C3_PROCESS_TASK_UNPROVEN:'+task.taskId);
  tasks.push({taskId:task.taskId,taskSet:task.taskSet,status:reject.length||missing.length?'HOLD':'GO',acceptanceBindingSha256:task.acceptanceBindingSha256,mappingSha256:mapping?taskMappingSha256(mapping):null,missingClauses:missing,mappingFailures:reject});
 }
 return {mode:FUNCTIONAL_TASK_MODE,pass:failures.length===0,contractInventorySha256:FUNCTIONAL_TASK_CONTRACTS_SHA256,originalPlanSha256:ORIGINAL_PLAN_SHA256,identity:{...identity},taskSets:contracts.taskSets,requiredTaskCount:52,provenTaskCount:tasks.filter(t=>t.status==='GO').length,tasks,failures,production:false};
}
export function hasTerminalAcceptance(matrix,expected={}){
 const c=matrix?.terminalClosure||{};
 if(matrix?.phaseAComplete!==true)return false;
 try{assertCanonicalModuleCoverage(matrix.modules);}catch{return false;}
 // Historical receipts remain readable but never satisfy the current selector.
 if(c.acceptanceMode!==FUNCTIONAL_TASK_MODE)return false;
 if(c.acceptanceMode!==FUNCTIONAL_TASK_MODE||c.decision!=='PASS_C3_TERMINAL_FUNCTIONAL_TASK_SETS'||c.status!=='GO'||c.failures?.length!==0||c.unresolvedP0?.length!==0||c.qaReservationAfter!==0||c.hardenedFocalDecision!=='PASS_PRE_I4_FOCAL_HUMAN_BROWSER'||c.fullHumanDecision!=='PASS_I3_HUMAN_LIVE_ACCEPTANCE'||c.pendingOwnerByteParity!=='PASS_C3_PENDING_OWNER_BYTE_PARITY')return false;
 const proof=c.processAcceptance;if(!proof?.pass||proof.mode!==FUNCTIONAL_TASK_MODE||proof.contractInventorySha256!==FUNCTIONAL_TASK_CONTRACTS_SHA256)return false;
 if(matrix.productSource?.sha!==c.sourceSha||matrix.productSource?.treeSha!==c.sourceTree||identityFields.some(k=>c[k]!==proof.identity?.[k]||(expected[k]!==undefined&&c[k]!==expected[k])))return false;
 const rows=c.acceptedCurrentOwnerReceipts||[];
 if(rows.some(row=>{const mod=matrix.modules.find(m=>m.domain===row.receipt?.moduleDomain);return !mod||validateTerminalAcceptedReceipt({receipt:row.receipt,mod,sourceFiles:matrix.sourceFiles||[],identity:proof.identity,hrRevision:c.hrRevision,findingIds:row.findingIds||[]}).length;}))return false;
 const recomputed=evaluateFrozenTaskCoverage({matrix,receipts:rows.map(x=>x.receipt),identity:proof.identity});
 return recomputed.pass&&taskMappingSha256(recomputed)===taskMappingSha256(proof);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [, ,file,mode,artifactSha256]=process.argv;
  if(!file)throw new Error('ENVIRONMENT_FAILURE:C3_MODULE_MATRIX_PATH_MISSING');
  const matrix=JSON.parse(fs.readFileSync(file,'utf8'));
  const coverage=assertCanonicalModuleCoverage(matrix.modules);
  if(mode==='--require-match')assertAllModulesAccepted(matrix.modules);
  if(mode==='--require-terminal'&&(!HEX.test(artifactSha256||'')||!hasTerminalAcceptance(matrix,{artifactSha256})))throw Error('FUNCTIONAL_DEFECT:C3_TERMINAL_ACCEPTANCE_REQUIRED');
  console.log(JSON.stringify({decision:mode==='--require-terminal'?'PASS_C3_TERMINAL_FUNCTIONAL_TASK_SETS':coverage.matchModules===21?'PASS_C3_21_MODULE_COVERAGE':'HOLD_C3_MODULE_ACCEPTANCE',...coverage,nonMatchModules:21-coverage.matchModules,production:false},null,2));
}
