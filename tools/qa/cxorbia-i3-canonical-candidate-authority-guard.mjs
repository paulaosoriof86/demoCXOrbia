import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const DESCRIPTOR='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const WORKFLOW='.github/workflows/cxorbia-recovery-i3-dev-certification.yml';

const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const fail=(code,detail)=>{throw new Error(code+(detail?':'+detail:''));};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const d=readJson(DESCRIPTOR);
const LEDGER=String(d.findingsLedgerPath||'');
if(!LEDGER)fail('RELEASE_COMPOSITION_FAILURE:LEDGER_POINTER_EMPTY');
const l=readJson(LEDGER);

if(d.schemaVersion!=='cxorbia.i3.canonical-candidate-descriptor.v1')fail('MAPPING_FAILURE:CANDIDATE_DESCRIPTOR_SCHEMA');
if(d.branch!=='recovery/cxorbia-phase-a-20260831')fail('SOURCE_FAILURE:CANDIDATE_BRANCH');
if(d.production!=='DO_NOT_TOUCH')fail('RELEASE_COMPOSITION_FAILURE:PRODUCTION_POLICY');
const ledgerBlob=git('rev-parse','HEAD:'+LEDGER);
if(d.findingsLedgerExpectedGitBlob&&ledgerBlob!==d.findingsLedgerExpectedGitBlob)fail('RELEASE_COMPOSITION_FAILURE:LEDGER_BLOB_DRIFT',ledgerBlob);

git('cat-file','-e',d.productSourceSha+'^{commit}');
git('cat-file','-e',d.predecessorProductSourceSha+'^{commit}');
try{execFileSync('git',['merge-base','--is-ancestor',d.predecessorProductSourceSha,d.productSourceSha]);}
catch{fail('RELEASE_COMPOSITION_FAILURE:NON_MONOTONIC_PRODUCT_SUCCESSOR');}
try{execFileSync('git',['merge-base','--is-ancestor',d.productSourceSha,'HEAD']);}
catch{fail('RELEASE_COMPOSITION_FAILURE:PRODUCT_SOURCE_NOT_ANCESTOR_OF_CONTROL_HEAD');}

const productTree=git('rev-parse',d.productSourceSha+'^{tree}');
const postCandidateDrift=git('diff','--name-only',d.productSourceSha,'HEAD','--','app','backend','firebase.json','.firebaserc','firestore.rules','storage.rules','tools/hr-source',':(exclude)backend/runtime/hr-live-service/test/**');
const headMessage=git('log','-1','--pretty=%B');
const driftFiles=postCandidateDrift?postCandidateDrift.split(/\n/).map(x=>x.trim()).filter(Boolean):[];
const vrm132SourceProof=headMessage.includes('[prei4-vrm132-liquidaciones-source]')&&driftFiles.length===1&&driftFiles[0]==='app/modules/finanzas.js';
if(postCandidateDrift&&!vrm132SourceProof)fail('RELEASE_COMPOSITION_FAILURE:UNDECLARED_PRODUCT_DRIFT_AFTER_CANONICAL_CANDIDATE',postCandidateDrift.replace(/\n/g,','));

if(!/^cxorbia\.i3\.canonical-cumulative-findings-ledger\.full\.v\d+$/.test(String(l.schemaVersion||'')))fail('MAPPING_FAILURE:FULL_LEDGER_SCHEMA');
const ids=Object.keys(l.findings||{}).sort();
if(!ids.length)fail('RELEASE_COMPOSITION_FAILURE:EMPTY_FINDING_LEDGER');
for(let i=0;i<ids.length;i++){
  const expected='VRM-'+String(i+1).padStart(3,'0');
  if(ids[i]!==expected)fail('RELEASE_COMPOSITION_FAILURE:FINDING_LEDGER_SEQUENCE',JSON.stringify({index:i,expected,actual:ids[i]}));
}
const next='VRM-'+String(ids.length+1).padStart(3,'0');
if(l.governance?.nextFindingId!==next||d.nextFindingId!==next)fail('MAPPING_FAILURE:NEXT_FINDING_ID',JSON.stringify({ledger:l.governance?.nextFindingId,descriptor:d.nextFindingId,expected:next}));
if(l.canonicalFunctionalCandidate?.sourceSha!==d.productSourceSha)fail('RELEASE_COMPOSITION_FAILURE:LEDGER_DESCRIPTOR_SOURCE_MISMATCH');

// Always read the same descriptor-selected module matrix, including during HOLD.
// A passing lineage guard is NOT a 21-module, visual, E2E or artifact certificate.
const moduleTruthPath=String(d.moduleTruthPath||'');
if(!moduleTruthPath)fail('RELEASE_COMPOSITION_FAILURE:MODULE_TRUTH_POINTER_EMPTY');
const mt=readJson(moduleTruthPath);
const mtSource=String(mt?.productSource?.sha||mt?.productSourceSha||'');
const modules=Array.isArray(mt?.modules)?mt.modules:[];
const domains=modules.map(x=>String(x?.domain||'')).filter(Boolean);
const moduleTruthReadback={
  path:moduleTruthPath,sourceSha:mtSource,expectedSourceSha:d.productSourceSha,
  sourceAligned:mtSource===d.productSourceSha,
  domainCount:modules.length,uniqueDomainCount:new Set(domains).size,
  phaseAComplete:mt?.phaseAComplete===true,allModulesMatch:mt?.allModulesMatch===true,
  scope:'CONTROL_DIAGNOSTIC_ONLY_NOT_CERTIFICATION'
};
const moduleRegistryPath=String(d.moduleAuthorityRegistryPath||'');
const moduleRegistry=moduleRegistryPath?readJson(moduleRegistryPath):null;
const registryDomains=Array.isArray(moduleRegistry?.modules)?moduleRegistry.modules.map(x=>String(x?.domain||'')):[];
const moduleRegistryReadback={
  path:moduleRegistryPath,domainCount:registryDomains.length,targetDomainCount:modules.length,
  coverageAligned:registryDomains.length===modules.length,
  historicalSubsetValid:registryDomains.every(x=>domains.includes(x)),
  frozenHistoricalBaselineNotFinalAuthority:true
};
// Check every Phase A owner and source inventory blob against the exact product tree.
const sourceTreeLines=git('ls-tree','-r',d.productSourceSha,'--','app','backend','tools','firebase.json','.firebaserc','firestore.rules','storage.rules');
const sourceBlobs=new Map(sourceTreeLines.split('\n').map(line=>line.match(/^[0-7]{6} blob ([a-f0-9]{40})\t(.+)$/)).filter(Boolean).map(x=>[x[2],x[1]]));
const ownerPaths=[...new Set(modules.flatMap(x=>Array.isArray(x.owners)?x.owners:[]))];
const sourceInventory=Array.isArray(mt.sourceFiles)?mt.sourceFiles:[];
const mismatchedOwners=modules.flatMap(x=>(x.owners||[]).filter(p=>sourceBlobs.get(p)!==String(x.currentOwnerBlobs?.[p]||'')).map(p=>({path:p,domain:x.domain})));
const mismatchedSourceFiles=sourceInventory.filter(x=>sourceBlobs.get(x.path)!==String(x.currentBlob||'')).map(x=>x.path);
const moduleBlobReadback={
  sourceSha:d.productSourceSha,domainCount:modules.length,ownerCount:ownerPaths.length,
  sourceFileCount:sourceInventory.length,ownerMismatches:mismatchedOwners,sourceFileMismatches:mismatchedSourceFiles,
  pass:mismatchedOwners.length===0&&mismatchedSourceFiles.length===0&&ownerPaths.length>=21&&sourceInventory.length>=21,
  scope:'EXACT_SOURCE_GIT_BLOBS_ONLY_NO_HUMAN_VISUAL_OR_PROVIDER_E2E'
};
const terminalLike=String(d.status||'')==='GO'||String(d.status||'')==='READY_FOR_TERMINAL_CERTIFICATION';
const promotionLike=/READY_FOR_|PENDING_PAULA_VISUAL_ACCEPTANCE|PAULA_HUMAN_VISUAL_APPROVAL|HOLD_HUMAN_VISUAL_CHECKPOINT_REQUIRED|READY_FOR_TERMINAL_CERTIFICATION/.test(String(d.status||'')+' '+String(d.activeBlocker||''))
  && !/REJECTION|REMEDIATION|CONTROL_PLANE_REMEDIATION/.test(String(d.status||'')+' '+String(d.activeBlocker||''));
if(promotionLike){
  const scope=d.visualCheckpointScope;
  if(!scope||!Array.isArray(scope.findingIds)||!scope.findingIds.length||!Array.isArray(scope.modules)||!scope.modules.length)fail('RELEASE_COMPOSITION_FAILURE:VISUAL_CHECKPOINT_SCOPE_REQUIRED');
  if(!moduleTruthReadback.sourceAligned)fail('RELEASE_COMPOSITION_FAILURE:STALE_MODULE_TRUTH_FOR_PROMOTION',JSON.stringify({matrixSource:mtSource,productSource:d.productSourceSha}));
  if(moduleTruthReadback.domainCount!==21||moduleTruthReadback.uniqueDomainCount!==21)
    fail('RELEASE_COMPOSITION_FAILURE:MODULE_TRUTH_DOMAIN_COVERAGE',JSON.stringify(moduleTruthReadback));
  if(!moduleBlobReadback.pass)
    fail('RELEASE_COMPOSITION_FAILURE:SOURCE_MODULE_BLOB_DRIFT',JSON.stringify(moduleBlobReadback));
  const liveClosed=/^(?:CLOSED|CLOSED_PROVEN|FIXED_PROVEN(?:_RUN\d+|_DURABLE)?|PASS_PROVEN(?:_RUN\d+)?|NOT_APPLICABLE_WITH_EVIDENCE|ALREADY_PROVEN_NO_DRIFT)/;
  for(const id of scope.findingIds){
    const finding=l.findings?.[id];
    if(!finding)fail('RELEASE_COMPOSITION_FAILURE:VISUAL_SCOPE_FINDING_MISSING',id);
    if(!liveClosed.test(String(finding.state||'')))fail('RELEASE_COMPOSITION_FAILURE:VISUAL_SCOPE_FINDING_NOT_LIVE_CLOSED',id+':'+String(finding.state||''));
  }
  if(scope.requiresAdminMatrix===true){
    const admin=readJson(String(d.adminAdministrationMatrixPath||'CXORBIA_I3_ADMIN_FULL_ADMINISTRATION_MATRIX_2026-10-03.json'));
    if(admin.humanVisualApprovalAllowed!==true||Number(admin?.summary?.OPEN_BLOCKER||0)!==0)fail('RELEASE_COMPOSITION_FAILURE:ADMIN_MATRIX_NOT_READY',JSON.stringify({humanVisualApprovalAllowed:admin.humanVisualApprovalAllowed,openBlockers:admin?.summary?.OPEN_BLOCKER||0}));
    if(String(admin.productSourceSha||'')!==d.productSourceSha)fail('RELEASE_COMPOSITION_FAILURE:STALE_ADMIN_MATRIX_FOR_PROMOTION',JSON.stringify({adminSource:admin.productSourceSha,productSource:d.productSourceSha}));
  }
  if(scope.requiresShopperPopulation===true&&(!Array.isArray(scope.representativeIdentities)||scope.representativeIdentities.length<3))fail('MAPPING_FAILURE:REPRESENTATIVE_IDENTITY_COVERAGE_REQUIRED');
}

const wf=fs.readFileSync(WORKFLOW,'utf8');
const workflowLedgerPointer=String((wf.match(/^\s*FINDINGS_LEDGER:\s*(\S+)/m)||[])[1]||'');
const legacyWorkflowLedgerActive=wf.includes('$FINDINGS_LEDGER')||wf.includes('env.FINDINGS_LEDGER');
const workflowLedgerReadback={
  declaredPath:workflowLedgerPointer,descriptorPath:LEDGER,
  aligned:!workflowLedgerPointer||workflowLedgerPointer===LEDGER,
  activelyConsumed:legacyWorkflowLedgerActive,scope:'HISTORICAL_ENV_POINTER_NOT_RELEASE_AUTHORITY'
};
if(terminalLike&&(!moduleTruthReadback.sourceAligned||!moduleTruthReadback.phaseAComplete||
   !moduleTruthReadback.allModulesMatch||!moduleBlobReadback.pass||
   !moduleRegistryReadback.historicalSubsetValid||
   (legacyWorkflowLedgerActive&&!workflowLedgerReadback.aligned)))
  fail('RELEASE_COMPOSITION_FAILURE:TERMINAL_AUTHORITIES_NOT_CONVERGED',
    JSON.stringify({moduleTruthReadback,moduleRegistryReadback,moduleBlobReadback,workflowLedgerReadback}));
if(/^\s*I3_CERTIFICATION_SOURCE_SHA:\s*[a-f0-9]{40}\s*$/m.test(wf))fail('RELEASE_COMPOSITION_FAILURE:TOP_LEVEL_LEGACY_PRODUCT_SOURCE_AUTHORITY');
if(/^\s*I3_CERTIFICATION_SOURCE_TREE:\s*[a-f0-9]{40}\s*$/m.test(wf))fail('RELEASE_COMPOSITION_FAILURE:TOP_LEVEL_LEGACY_PRODUCT_TREE_AUTHORITY');

const jobs={};
const lines=wf.split(/\r?\n/);
let current=null;
for(const line of lines){
  const m=line.match(/^  ([A-Za-z0-9_-]+):\s*$/);
  if(m){current=m[1];jobs[current]=[];continue;}
  if(current)jobs[current].push(line);
}
const historicalDisabled=[
  'pre-i4-human-entrypoint-dev',
  'pre-i4-finance-p0-hosting-fix',
  'pre-i4-module-truth-closure',
  'pre-i4-postdeploy-readback',
  'pre-i4-human-semantic-remediation',
  'pre-i4-resource-rules-fix',
  'pre-i4-human-semantic-focal-only',
  'pre-i4-vrm040-hosting-fix'
];
for(const id of historicalDisabled){
  const body=(jobs[id]||[]).slice(0,12).join('\n');
  if(body&&!/if:\s*\$\{\{\s*false\s*\}\}/.test(body))fail('RELEASE_COMPOSITION_FAILURE:HISTORICAL_JOB_STILL_EXECUTABLE',id);
}

const active=['canonical-candidate-authority','certify','live-fixtures','gate21','pre-i4-vrm037-diagnostic'];
const sourceAssignment=/\b(?:PRODUCT_SOURCE|SEM_SOURCE|CXORBIA_PREI4_SOURCE_SHA|I3_CERTIFICATION_SOURCE_SHA)\s*[:=]\s*['"]?([a-f0-9]{40})/g;
for(const id of active){
  const body=(jobs[id]||[]).join('\n');
  let m;while((m=sourceAssignment.exec(body)))fail('RELEASE_COMPOSITION_FAILURE:ACTIVE_JOB_LOCAL_PRODUCT_SOURCE',id+':'+m[1]);
  if(/CXORBIA_PREI4_SOURCE_SHA:\s*\$\{\{\s*github\.sha\s*\}\}/.test(body)||/PRODUCT_SOURCE:\s*\$\{\{\s*github\.sha\s*\}\}/.test(body))fail('RELEASE_COMPOSITION_FAILURE:ACTIVE_JOB_GITHUB_SHA_AS_PRODUCT_AUTHORITY',id);
}

const result={
  decision:'PASS_I3_SINGLE_CANONICAL_CANDIDATE_AUTHORITY',
  productSourceSha:d.productSourceSha,
  productSourceTree:productTree,
  predecessorProductSourceSha:d.predecessorProductSourceSha,
  findingCount:ids.length,
  nextFindingId:next,
  postCandidateProductDrift:false,
  historicalSourceSpecificJobsDisabled:historicalDisabled.length,
  proofScope:'CANONICAL_SOURCE_LINEAGE_ONLY_NOT_MODULE_OR_ARTIFACT_CERTIFICATION',
  moduleTruthReadback,moduleRegistryReadback,moduleBlobReadback,workflowLedgerReadback,
  terminalReleaseEligible:terminalLike&&moduleTruthReadback.sourceAligned&&moduleTruthReadback.phaseAComplete&&
    moduleTruthReadback.allModulesMatch&&moduleBlobReadback.pass&&moduleRegistryReadback.historicalSubsetValid&&
    (!legacyWorkflowLedgerActive||workflowLedgerReadback.aligned),
  production:false
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
