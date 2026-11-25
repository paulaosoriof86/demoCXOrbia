// Synthetic evidence only. Never imported by an operational producer.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readFrozenTaskContracts,taskMappingSha256,evaluateFrozenTaskCoverage,FUNCTIONAL_TASK_MODE,ORIGINAL_PLAN_SHA256} from '../cxorbia-i3-terminal-module-domain-coverage.mjs';
export function completeSyntheticProcessMatrix(identity){
 const contracts=readFrozenTaskContracts(),allOwners=[...new Set(contracts.tasks.flatMap(t=>t.ownerPaths))];
 const domain='phase-a-supporting-core';
 const modules=[...JSON.parse(fs.readFileSync('CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json','utf8')).modules.map(x=>x.domain),'tenant-admin-config-branding'].map(d=>({domain:d,owners:d===domain?allOwners:[],classification:'COMPOSED_NOT_DEPLOYED'}));
 const matrix={productSource:{sha:identity.sourceSha,treeSha:identity.sourceTree},modules,sourceFiles:[],functionalTaskEvidenceMappings:{},phaseAComplete:true,allModulesMatch:false};
 const receipts=[];
 for(const task of contracts.tasks){
  const routes=task.roleRoutes.length?task.roleRoutes:[{role:'admin',route:'synthetic'}];
  const requiredClauses=routes.map((r,i)=>({id:task.taskId+'.'+i,moduleDomain:domain,operationKind:'UI_INTERACTION',role:r.role,route:r.route,scope:{tenantId:'synthetic',projectId:'synthetic',periodId:'2026-11'},ownerPaths:task.ownerPaths.length?task.ownerPaths:[allOwners[0]]}));
  const mapping={taskId:task.taskId,originalPlanSha256:ORIGINAL_PLAN_SHA256,acceptanceBindingSha256:task.acceptanceBindingSha256,completeTaskInventory:true,requiredClauses};
  matrix.functionalTaskEvidenceMappings[task.taskId]=mapping;
  for(const c of requiredClauses)receipts.push({...identity,decision:'PASS_SYNTHETIC_TEST_ONLY',production:false,moduleDomain:domain,operationKind:c.operationKind,ownerPaths:c.ownerPaths,scope:{...c.scope,role:c.role},uiProof:{route:c.route},contractAuthority:{taskBindings:[{taskId:task.taskId,acceptanceBindingSha256:task.acceptanceBindingSha256,mappingSha256:taskMappingSha256(mapping)}]},contractCoverage:{obligations:[{id:c.id,observed:true,evidenceRef:'synthetic-test-only',evidenceSha256:'9'.repeat(64)}]}});
 }
 const contract='synthetic exact contract',blob='8'.repeat(40),bytes='7'.repeat(64),hr='6'.repeat(64);
 for(const m of modules){m.contractFunctional=contract;m.roles=['Admin','Shopper','Cliente'];m.currentOwnerBlobs=Object.fromEntries(m.owners.map(p=>[p,blob]));}
 for(const r of receipts){r.hrIndependent=true;r.hrRevision=hr;r.auth={authenticated:true,tenantExact:true,projectAuthorized:true,role:r.scope.role};r.ownerEvidence=r.ownerPaths.map(path=>({path,gitBlob:blob,byteParity:true,sourceSha256:bytes,servedSha256:bytes}));r.contractAuthority.contractSha256=crypto.createHash('sha256').update(contract).digest('hex');r.mutationEvidence={applicable:false,providerAckClaimed:false,providerWrites:0,firestoreWrites:0,hrWrites:0,authWrites:0};Object.assign(r.uiProof,{realBrowserE2E:true,routeConsistent:true,roleScopeVerified:true,visualEvidenceSha256:bytes});}
 const proof=evaluateFrozenTaskCoverage({matrix,receipts,identity});
 matrix.terminalClosure={...identity,hrRevision:hr,acceptanceMode:FUNCTIONAL_TASK_MODE,decision:'PASS_C3_TERMINAL_FUNCTIONAL_TASK_SETS',status:'GO',failures:[],unresolvedP0:[],qaReservationAfter:0,hardenedFocalDecision:'PASS_PRE_I4_FOCAL_HUMAN_BROWSER',fullHumanDecision:'PASS_I3_HUMAN_LIVE_ACCEPTANCE',pendingOwnerByteParity:'PASS_C3_PENDING_OWNER_BYTE_PARITY',processAcceptance:proof,acceptedCurrentOwnerReceipts:receipts.map(receipt=>({receipt}))};
 return matrix;
}
