#!/usr/bin/env node
/* CXOrbia TyA — canonical Phase A/postproduction drift gate.
   Historical mode preserves the original frozen-source behavior.
   Postproduction mode separates the immutable live release from an exact,
   fail-closed, non-deployed source successor declared by path + Git blob SHA.
   No provider calls, writes, deploys, imports or production mutation occur.
*/
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args=process.argv.slice(2);
const valIdx=args.indexOf('--validated');
const outIdx=args.indexOf('--out');
const historicalValidatedInput=valIdx>=0?args[valIdx+1]:null;
const outDir=outIdx>=0?args[outIdx+1]:null;
const baseLockPath='backend/config/cxorbia-phase-a-continuity-lock.json';
const overlayPath='backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json';
const successorPath='backend/config/cxorbia-postprod-source-successor-lock-v1.json';

function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function git(args){return execFileSync('git',args,{encoding:'utf8'}).trim();}
function listDiff(base){return git(['diff','--name-only',`${base}..HEAD`]).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);}
function blobFor(file){return git(['hash-object','--',file]);}
function runtimeFiles(files){
  const exact=new Set(['app/index.html','app/index-backend-dev.html','app/app.js','app/manifest.webmanifest','app/sw.js']);
  const prefixes=['app/core/','app/modules/','app/styles/','app/adapters/','app/data/','app/demo/'];
  return files.filter(f=>exact.has(f)||prefixes.some(p=>f.startsWith(p))).sort();
}
function writeReport(r){
  if(!outDir)return;
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'rc-phase-a-drift-report.json'),JSON.stringify(r,null,2),'utf8');
  fs.writeFileSync(path.join(outDir,'rc-phase-a-drift-report.md'),[
    '# CXOrbia TyA RC Phase A / postproduction drift report','',
    `Generated: ${r.generatedAt}`,
    `Mode: ${r.mode||'historical'}`,
    `Plan: ${r.planId||'n/a'}`,
    `Epoch: ${r.syncEpoch||'n/a'}`,
    `Frozen functional source: ${r.functionalSourceLock||'n/a'}`,
    `Head: ${r.head||'n/a'}`,
    `Verdict: ${r.verdict}`,'',
    '## Runtime successor',
    ...(r.runtimeChangedFiles?.length?r.runtimeChangedFiles.map(f=>`- ${f}`):['- none']),
    '',
    '## Safe state',
    '- No provider redeploy',
    '- No database writes',
    '- No imports',
    '- No production mutation',''
  ].join('\n'),'utf8');
}
function fail(message,extra={}){
  const report={gate:'cxorbia-tya-rc-phase-a-drift',verdict:'NO_GO_DRIFT',message,historicalValidatedInput,generatedAt:new Date().toISOString(),...extra,safeState:{providerRedeploy:false,databaseWrites:false,imports:false,productionMutation:false}};
  writeReport(report);console.log(JSON.stringify(report,null,2));process.exit(1);
}

function verifyDeclaredBlobs(entries,kind){
  const mismatches=[];
  for(const entry of entries||[]){
    const file=String(entry.path||'').trim();
    const expected=String(entry.gitBlobSha||'').trim();
    if(!file||!expected){mismatches.push({path:file||null,kind,reason:'declaration_incomplete'});continue;}
    if(!fs.existsSync(file)){mismatches.push({path:file,kind,reason:'missing'});continue;}
    let actual='';try{actual=blobFor(file);}catch(error){mismatches.push({path:file,kind,reason:'hash_failed',error:String(error?.message||error)});continue;}
    if(actual!==expected)mismatches.push({path:file,kind,expectedGitBlobSha:expected,actualGitBlobSha:actual,reason:'blob_mismatch'});
  }
  return mismatches;
}

// Effective postproduction mode. This is authoritative only when BOTH the
// postproduction overlay and the exact successor lock exist.
if(fs.existsSync(overlayPath)&&fs.existsSync(successorPath)){
  let overlay,successor;
  try{overlay=readJson(overlayPath);successor=readJson(successorPath);}catch(error){fail('postprod_control_plane_unreadable',{mode:'postprod_successor',error:String(error?.message||error)});}
  if(successor.repository!=='paulaosoriof86/demoCXOrbia')fail('successor_repository_lock_mismatch',{mode:'postprod_successor',repository:successor.repository});
  if(successor.branch!=='docs-tya-v6-v71-audit')fail('successor_branch_lock_mismatch',{mode:'postprod_successor',branch:successor.branch});
  const frozen=successor.frozenLiveRelease||{};
  const production=overlay.productionState||{};
  if(!frozen.functionalSourceSha)fail('successor_frozen_functional_source_missing',{mode:'postprod_successor'});
  if(production.functionalSourceSha!==frozen.functionalSourceSha)fail('overlay_frozen_functional_source_mismatch',{mode:'postprod_successor',overlayFunctionalSource:production.functionalSourceSha,declaredFunctionalSource:frozen.functionalSourceSha});
  if(production.releaseId!==frozen.releaseId)fail('overlay_release_identity_mismatch',{mode:'postprod_successor',overlayReleaseId:production.releaseId,declaredReleaseId:frozen.releaseId});
  if(successor.policy?.sourceSuccessorDeployed!==false||successor.policy?.deployAuthorized!==false)fail('successor_deployment_policy_not_fail_closed',{mode:'postprod_successor'});

  let changedFiles;try{changedFiles=listDiff(frozen.functionalSourceSha);}catch(error){fail('git_diff_from_frozen_functional_source_failed',{mode:'postprod_successor',error:String(error?.message||error)});}
  const actualRuntime=runtimeFiles(changedFiles);
  const expectedRuntime=(successor.runtimeSuccessorExact||[]).map(e=>String(e.path||'').trim()).filter(Boolean).sort();
  const unexpectedRuntime=actualRuntime.filter(p=>!expectedRuntime.includes(p));
  const declaredButAbsent=expectedRuntime.filter(p=>!actualRuntime.includes(p));
  const runtimeBlobMismatches=verifyDeclaredBlobs(successor.runtimeSuccessorExact,'runtime_successor');
  const criticalSourceBlobMismatches=verifyDeclaredBlobs(successor.criticalSourceContractsExact,'critical_source_contract');
  if(unexpectedRuntime.length||declaredButAbsent.length||runtimeBlobMismatches.length||criticalSourceBlobMismatches.length){
    fail('postprod_source_successor_exact_lineage_mismatch',{
      mode:'postprod_successor',
      planId:overlay.effectiveState?.masterPlanId,
      syncEpoch:overlay.effectiveState?.syncEpoch,
      functionalSourceLock:frozen.functionalSourceSha,
      head:git(['rev-parse','HEAD']),
      runtimeChangedFiles:actualRuntime,
      expectedRuntimeFiles:expectedRuntime,
      unexpectedRuntime,
      declaredButAbsent,
      runtimeBlobMismatches,
      criticalSourceBlobMismatches
    });
  }
  const report={
    gate:'cxorbia-tya-rc-phase-a-drift',
    verdict:'GO_POSTPROD_LIVE_RELEASE_PRESERVED_EXACT_SOURCE_SUCCESSOR',
    mode:'postprod_successor',
    generatedAt:new Date().toISOString(),
    planId:overlay.effectiveState?.masterPlanId,
    syncEpoch:overlay.effectiveState?.syncEpoch,
    currentMasterPhase:overlay.effectiveState?.currentMasterPhase,
    functionalSourceLock:frozen.functionalSourceSha,
    liveReleaseId:frozen.releaseId,
    head:git(['rev-parse','HEAD']),
    historicalValidatedInput,
    historicalValidatedInputIgnoredAsAuthority:true,
    exactRuntimeSuccessorDeclared:true,
    sourceSuccessorDeployed:false,
    runtimeChangedFiles:actualRuntime,
    runtimeChangedCount:actualRuntime.length,
    unexpectedRuntimeCount:0,
    runtimeBlobMismatchCount:0,
    criticalSourceBlobMismatchCount:0,
    productionActive:production.active===true,
    liveReleaseReopened:false,
    productP0Proven:false,
    safeState:{providerRedeploy:false,databaseWrites:false,imports:false,businessDataWritesAuthorized:false,productionMutation:false}
  };
  writeReport(report);console.log(JSON.stringify(report,null,2));process.exit(0);
}

// Historical pre-postproduction behavior retained for old refs where the
// effective overlay/successor declaration does not exist.
let lock;try{lock=readJson(baseLockPath);}catch(error){fail('canonical_continuity_lock_unreadable',{mode:'historical',error:String(error?.message||error)});}
const functionalSourceLock=lock.functionalSourceLock;
if(!functionalSourceLock)fail('functional_source_lock_missing',{mode:'historical',planId:lock.planId,syncEpoch:lock.syncEpoch});
if(lock.repository!=='paulaosoriof86/demoCXOrbia')fail('repository_lock_mismatch',{mode:'historical',repository:lock.repository});
if(lock.branch!=='docs-tya-v6-v71-audit')fail('branch_lock_mismatch',{mode:'historical',branch:lock.branch});
const postCutover=lock.currentIteration==='I5-G2';
if(postCutover){
  if(lock.formalProgress?.productionIsAuthorized!==true||lock.formalProgress?.productionCutoverExecuted!==true||lock.productionState?.active!==true||lock.productionState?.providerRedeployExecuted!==false||lock.productionState?.rebuildExecuted!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('post_cutover_production_state_invalid',{mode:'historical'});
}else if(lock.formalProgress?.productionIsAuthorized!==false)fail('production_must_remain_unauthorized_before_G1_completion',{mode:'historical'});
let continuityOutput='';
try{continuityOutput=execFileSync(process.execPath,['tools/continuity/validate-cxorbia-phase-a-continuity-lock.js'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}
catch(error){fail('canonical_continuity_validator_failed',{mode:'historical',planId:lock.planId,syncEpoch:lock.syncEpoch,currentIteration:lock.currentIteration,functionalSourceLock,validatorError:String(error?.stderr||error?.message||error).slice(0,2000)});}
if(!continuityOutput.includes('CONTINUITY_LOCK_PASS'))fail('canonical_continuity_validator_missing_terminal_pass',{mode:'historical',continuityOutput:continuityOutput.slice(0,2000)});
let changedFiles;try{changedFiles=listDiff(functionalSourceLock);}catch(error){fail('git_diff_from_functional_source_lock_failed',{mode:'historical',error:String(error?.message||error)});}
const runtimeChangedFiles=runtimeFiles(changedFiles);
const head=git(['rev-parse','HEAD']);
if(runtimeChangedFiles.length)fail('functional_runtime_drift_after_frozen_source',{mode:'historical',planId:lock.planId,syncEpoch:lock.syncEpoch,currentIteration:lock.currentIteration,functionalSourceLock,head,runtimeChangedFiles});
const report={gate:'cxorbia-tya-rc-phase-a-drift',verdict:'GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED',mode:'historical',generatedAt:new Date().toISOString(),planId:lock.planId,syncEpoch:lock.syncEpoch,currentIteration:lock.currentIteration,functionalSourceLock,head,historicalValidatedInput,historicalValidatedInputIgnoredAsAuthority:true,continuityValidator:'CONTINUITY_LOCK_PASS',productionActive:postCutover,runtimeChangedFiles,runtimeChangedCount:runtimeChangedFiles.length,safeState:{providerRedeploy:false,databaseWrites:false,imports:false,businessDataWritesAuthorized:false,productionMutation:false}};
writeReport(report);console.log(JSON.stringify(report,null,2));
