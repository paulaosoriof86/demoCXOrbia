import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {readFrozenTaskContracts,taskMappingSha256,ORIGINAL_PLAN_SHA256} from './cxorbia-i3-terminal-module-domain-coverage.mjs';
import {createD01DocumentAuthorityMapping,validateD01DocumentAuthorityBinding} from './cxorbia-i3-document-authority-task-binding.mjs';
import {normalizeRun2537AcceptedScopes} from './cxorbia-i3-run2537-accepted-scope-codec.mjs';

// Builds a reviewable binding patch, never a source deploy or a functional PASS.
// Accepted historical evidence is read by immutable blob, not a mutable path.
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const blob=bytes=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${Buffer.byteLength(bytes)}\0`),Buffer.from(bytes)])).digest('hex');
const need=(ok,code)=>{if(!ok)throw Error('MAPPING_FAILURE:FROZEN_TASK_BINDINGS_'+code);};
const equal=(a,b)=>taskMappingSha256(a)===taskMappingSha256(b);
const cleanPath=value=>typeof value==='string'&&!path.isAbsolute(value)&&!value.split('/').includes('..');
export function buildFrozenTaskEvidenceBindings({matrix,contracts,cumulativeMap,readImmutable,readDocumentBytes}){
 need(contracts.originalPlanSha256===ORIGINAL_PLAN_SHA256&&cumulativeMap.originalFrozenPlanSha256===ORIGINAL_PLAN_SHA256,'ORIGINAL_PLAN');
 const taskById=new Map(contracts.tasks.map(t=>[t.taskId,t]));
 const mapping=createD01DocumentAuthorityMapping(taskById.get('D01'));
 const document=validateD01DocumentAuthorityBinding({task:taskById.get('D01'),mapping,matrix,readBytes:readDocumentBytes});
 need(document.pass,'D01_'+document.failures.join(','));
 const prior=matrix.functionalTaskEvidenceMappings||{};
 need(!prior.D01||equal(prior.D01,mapping),'EXISTING_D01_MAPPING_CONFLICT');
 const verified={};
 for(const [id,ref] of Object.entries(cumulativeMap.evidence||{})){
  need(cleanPath(ref.path)&&/^[a-f0-9]{40}$/.test(ref.gitBlob||'')&&/^[a-f0-9]{64}$/.test(ref.sha256||''),'REFERENCE_'+id);
  const bytes=readImmutable(ref);
  need(blob(bytes)===ref.gitBlob&&hash(bytes)===ref.sha256,'IMMUTABLE_HASH_'+id);
  verified[id]={path:ref.path,gitBlob:ref.gitBlob,sha256:ref.sha256};
 }
 const preserved=(cumulativeMap.tasks||[]).map(item=>{
  const task=taskById.get(item.taskId);
  need(task&&item.originalAcceptance===task.frozenAuthority.acceptance,'TASK_ACCEPTANCE_'+item.taskId);
  need(item.newPassGranted===false&&Array.isArray(item.evidenceRefs)&&item.evidenceRefs.every(ref=>verified[ref]),'TASK_REFERENCES_'+item.taskId);
  return {taskId:task.taskId,acceptanceBindingSha256:task.acceptanceBindingSha256,
   evidenceState:item.evidenceState,evidenceReferences:item.evidenceRefs.map(ref=>verified[ref]),
   preservedEvidenceScope:item.preservedEvidenceScope,
   remainingOrMappingBoundary:item.remainingOrMappingBoundary,
   acceptanceKind:'HISTORICAL_SCOPE_REFERENCE_ONLY',newFunctionalPass:false};
 });
 need(preserved.length===cumulativeMap.taskCount&&new Set(preserved.map(t=>t.taskId)).size===preserved.length,'CUMULATIVE_TASK_INVENTORY');
 const scoped=[];
 for(const mod of matrix.modules||[])for(const [taskId,authority] of Object.entries(mod.scopedContractAuthorities||{})){
  const task=taskById.get(taskId);if(!task)continue;
  need(authority.taskId===taskId&&authority.moduleDomain===mod.domain&&authority.originalPlanSha256===ORIGINAL_PLAN_SHA256&&authority.production===false,'SCOPED_AUTHORITY_'+taskId);
  need(cleanPath(authority.path)&&/^[a-f0-9]{40}$/.test(authority.gitBlob||'')&&/^[a-f0-9]{64}$/.test(authority.sha256||''),'SCOPED_REFERENCE_'+taskId);
  const bytes=readImmutable(authority);
  need(blob(bytes)===authority.gitBlob&&hash(bytes)===authority.sha256,'SCOPED_HASH_'+taskId);
  const frozen=JSON.parse(Buffer.from(bytes).toString('utf8'));
  need(equal(frozen.obligationIds,authority.obligationIds)&&equal(frozen.ownerPaths,authority.ownerPaths),'SCOPED_INVENTORY_'+taskId);
  need(Array.isArray(authority.obligationIds)&&new Set(authority.obligationIds).size===authority.obligationIds.length,'SCOPED_DUPLICATE_'+taskId);
  const domainOwners=[...(mod.owners||[]),...(matrix.sourceFiles||[]).filter(s=>s.phaseAAuthority!==false&&s.domain===mod.domain).map(s=>s.path)];
  need(authority.ownerPaths.every(p=>domainOwners.includes(p)),'SCOPED_OWNER_'+taskId);
  scoped.push({taskId,acceptanceBindingSha256:task.acceptanceBindingSha256,
   moduleDomain:mod.domain,scopeContract:{path:authority.path,gitBlob:authority.gitBlob,sha256:authority.sha256},
   knownClauseIds:[...authority.obligationIds],contractOwnerPaths:[...authority.ownerPaths],
   otherTraceabilityOwnerPaths:task.ownerPaths.filter(p=>!authority.ownerPaths.includes(p)),
   completeTaskInventory:false,fullDomain:false,newFunctionalPass:false,
   meaning:'Frozen scoped clauses preserved; not a full-task mapping or an instruction to test every traceability owner.'});
 }
 const mappings={...prior,D01:mapping};
 return {schemaVersion:'cxorbia.i3.frozen-task-evidence-bindings.v1',state:'HOLD',
  originalPlanSha256:ORIGINAL_PLAN_SHA256,
  matrixPatch:{functionalTaskEvidenceMappings:mappings},
  reusedDocumentaryTaskIds:['D01'],newFunctionalPasses:0,
  immutableReferencesVerified:Object.keys(verified).length,
  preservedCumulativeTaskScopes:preserved,scopedClauseBindings:scoped,
  unmappedTaskIds:contracts.tasks.filter(t=>!mappings[t.taskId]).map(t=>t.taskId),
  rule:'Unmapped means technical linkage required; never repeat an accepted task solely to manufacture a newer receipt.',
  phaseAComplete:false,production:false};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [,,matrixPath,outputPath]=process.argv;
 if(!matrixPath||!outputPath)throw Error('ENVIRONMENT_FAILURE:FROZEN_TASK_BINDINGS_MATRIX_AND_OUTPUT_REQUIRED');
 need(![matrixPath,'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','CXORBIA_RECOVERY_EXECUTION_CURRENT.json'].some(p=>path.resolve(p)===path.resolve(outputPath)),'SEPARATE_REVIEW_OUTPUT');
 const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 const matrixText=fs.readFileSync(matrixPath),matrix=JSON.parse(matrixText);
 need(matrixPath===descriptor.moduleTruthPath,'CURRENT_MATRIX_PATH');
 need(blob(matrixText)===descriptor.moduleTruthExpectedGitBlob,'CURRENT_MATRIX_BLOB');
 const mapRef=descriptor.currentCumulativeTaskEvidenceMap;
 const readImmutable=ref=>execFileSync('git',['cat-file','blob',ref.gitBlob],{maxBuffer:32*1024*1024});
 const mapText=readImmutable(mapRef);
 need(blob(mapText)===mapRef.gitBlob&&hash(mapText)===mapRef.sha256,'CUMULATIVE_MAP_HASH');
 const out=buildFrozenTaskEvidenceBindings({matrix,contracts:readFrozenTaskContracts(),cumulativeMap:JSON.parse(mapText),readImmutable});
 out.inputAuthority={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),matrixPath,matrixGitBlob:blob(matrixText),matrixSha256:hash(matrixText),cumulativeMap:mapRef};
 // Decode the accepted historical scope without inventing a current receipt or full E05 mapping.
 out.preservedAcceptedRuntimeScopes=[normalizeRun2537AcceptedScopes({readImmutable,
  task:readFrozenTaskContracts().tasks.find(t=>t.taskId==='E05'),currentSourceSha:matrix.productSource.sha,
  readSourceBytes:(source,p)=>execFileSync('git',['show',`${source}:${p}`],{maxBuffer:4*1024*1024})})];
 fs.writeFileSync(outputPath,JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify({state:out.state,reusedDocumentaryTaskIds:out.reusedDocumentaryTaskIds,newFunctionalPasses:0,
  immutableReferencesVerified:out.immutableReferencesVerified,preservedTaskScopes:out.preservedCumulativeTaskScopes.length,
  scopedClauses:out.scopedClauseBindings.reduce((n,x)=>n+x.knownClauseIds.length,0),unmappedTaskCount:out.unmappedTaskIds.length,outputPath,production:false}));
}
