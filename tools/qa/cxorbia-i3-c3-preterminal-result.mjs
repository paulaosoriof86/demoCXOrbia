// Finalize the existing C3 job after live Hosting/runtime/Rules readback.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessPreterminalSourceReadiness} from './cxorbia-i3-preterminal-source-readiness.mjs';
import {assertCanonicalModuleCoverage} from './cxorbia-i3-terminal-module-domain-coverage.mjs';

export function buildC3Result({matrix,sourceSha,sourceTree,inputAuthorityStatus,moduleTruthSha256,
  hostingVersion,runtimeRevision,runtimeDigest,firestoreRulesSha256,activeBrowserOwners}){
  const c=matrix.preTerminalComposition;
  assertCanonicalModuleCoverage(matrix.modules);
  if(c?.decision!=='PASS_C3_PRETERMINAL_COMPOSITION'||matrix.productSource?.sha!==sourceSha||
    matrix.productSource?.treeSha!==sourceTree||matrix.entrypointClosure?.allApprovedOwnersLoaded!==true||
    matrix.entrypointClosure?.duplicateSrc?.length!==0)throw new Error('C3_RESULT_SOURCE_COMPOSITION_MISMATCH');
  const readiness=assessPreterminalSourceReadiness({modules:matrix.modules,sourceFiles:matrix.sourceFiles,
    pendingMappingApprovalFiles:c.pendingMappingApprovalFiles,pendingBlobProvenanceFiles:c.pendingBlobProvenanceFiles,
    unauthorizedFileCount:c.unauthorizedFileCount});
  const pending=matrix.sourceFiles.filter(x=>x.phaseAAuthority!==false&&x.classification!=='MATCH').length;
  const matches=matrix.modules.filter(x=>x.classification==='MATCH').length;
  if(c.sourceReadyModuleCount!==readiness.sourceReadyModuleCount||c.pendingFileCount!==pending||
    c.terminalEligible!==readiness.terminalEligible||matrix.modules.length!==21)
    throw new Error('C3_RESULT_COUNTER_DRIFT');
  const ready=readiness.sourceReadyModuleCount===21&&pending===0&&readiness.terminalEligible;
  return {decision:ready?'PASS_C3_PRETERMINAL_SOURCE_READY_EXACT_DEV':'HOLD_C3_PRETERMINAL_SOURCE_EVIDENCE_PENDING',
    inputAuthorityStatus,status:ready?'READY_FOR_TERMINAL_CERTIFICATION':
      `HOLD_I3_C3_${readiness.sourceReadyModuleCount}_SOURCE_READY_${pending}_OWNER_PROOF_PENDING`,
    enabledNextBlock:ready?'I3-Q3':null,enabledJob:ready?'certify':null,
    sourceSha,sourceTree,moduleTruthSha256,moduleCount:21,matchModules:matches,nonMatchModules:21-matches,
    sourceReadyModules:readiness.sourceReadyModuleCount,pendingFiles:pending,terminalEligible:ready,
    activeBrowserOwners,hostingVersion,runtimeRevision,runtimeDigest,firestoreRulesSha256,
    sameRunSourceQa:c.sameRunSourceQa||null,allApprovedOwnersLoaded:true,duplicateScripts:0,
    builds:0,deploys:0,writes:0,production:false};
}
export function writeC3Result(){
  const env=process.env,dir=env.C3_OUT,bytes=fs.readFileSync(dir+'/module-truth-preterminal.json');
  const result=buildC3Result({matrix:JSON.parse(bytes),sourceSha:env.C3_SOURCE,sourceTree:env.C3_TREE,
    inputAuthorityStatus:env.C3_AUTH_STATUS,moduleTruthSha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    hostingVersion:env.EXPECTED_HOSTING_VERSION,runtimeRevision:env.EXPECTED_RUNTIME_REVISION,
    runtimeDigest:env.EXPECTED_RUNTIME_DIGEST,
    firestoreRulesSha256:JSON.parse(fs.readFileSync(dir+'/firestore-live-parity.json')).sha256,
    activeBrowserOwners:Number(fs.readFileSync(dir+'/active-browser-owner-count.txt','utf8').trim())});
  fs.writeFileSync(dir+'/result.json',JSON.stringify(result,null,2)+'\n');
  fs.appendFileSync(env.GITHUB_OUTPUT,'terminal_ready='+result.terminalEligible+'\nartifact_name=cxorbia-c3-preterminal-module-truth-'+env.GITHUB_RUN_ID+'-'+env.GITHUB_RUN_ATTEMPT+'\n');
  const rows=[['Fuente acreditada',result.sourceReadyModules+'/21'],['Archivos pendientes',result.pendingFiles],
    ['MATCH integral',result.matchModules+'/21'],['Siguiente bloque habilitado',result.enabledNextBlock||'ninguno'],
    ['Job consumidor',result.enabledJob||'ninguno'],['Owners transportados en esta ejecución',result.sameRunSourceQa?.pathCount||0]];
  fs.appendFileSync(env.GITHUB_STEP_SUMMARY,'## I3 — habilitación comprobada\n\n| Indicador | Resultado |\n|---|---|\n'+
    rows.map(([k,v])=>'| '+k+' | '+v+' |').join('\n')+'\n\nI4 no autorizado. Producción intacta.\n');
  console.log(JSON.stringify(result));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))writeC3Result();
