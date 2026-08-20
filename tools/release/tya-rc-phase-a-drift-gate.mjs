#!/usr/bin/env node
/* CXOrbia TyA — canonical Phase A drift gate. Safe source/control-plane validator. */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const args=process.argv.slice(2),valIdx=args.indexOf('--validated'),outIdx=args.indexOf('--out');
const historicalValidatedInput=valIdx>=0?args[valIdx+1]:null,outDir=outIdx>=0?args[outIdx+1]:null,lockPath='backend/config/cxorbia-phase-a-continuity-lock.json';
function writeReport(r){if(!outDir)return;fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'rc-phase-a-drift-report.json'),JSON.stringify(r,null,2),'utf8');fs.writeFileSync(path.join(outDir,'rc-phase-a-drift-report.md'),['# CXOrbia TyA RC Phase A drift report','',`Generated: ${r.generatedAt}`,`Plan: ${r.planId||'n/a'}`,`Epoch: ${r.syncEpoch||'n/a'}`,`Current iteration: ${r.currentIteration||'n/a'}`,`Functional source lock: ${r.functionalSourceLock||'n/a'}`,`Head: ${r.head||'n/a'}`,`Verdict: ${r.verdict}`,'','## Runtime drift',...(r.runtimeChangedFiles?.length?r.runtimeChangedFiles.map(f=>`- ${f}`):['- none']),'','## Safe state',`- Production active: ${r.productionActive===true?'yes':'no'}`,'- No provider redeploy','- No database writes','- No imports',''].join('\n'),'utf8');}
function fail(message,extra={}){const report={gate:'cxorbia-tya-rc-phase-a-drift',verdict:'NO_GO_DRIFT',message,historicalValidatedInput,generatedAt:new Date().toISOString(),...extra,safeState:{providerRedeploy:false,databaseWrites:false,imports:false}};writeReport(report);console.log(JSON.stringify(report,null,2));process.exit(1);}
let lock;try{lock=JSON.parse(fs.readFileSync(lockPath,'utf8'));}catch(e){fail('canonical_continuity_lock_unreadable',{error:String(e?.message||e)});}
const functionalSourceLock=lock.functionalSourceLock;if(!functionalSourceLock)fail('functional_source_lock_missing',{planId:lock.planId,syncEpoch:lock.syncEpoch});
if(lock.repository!=='paulaosoriof86/demoCXOrbia')fail('repository_lock_mismatch',{repository:lock.repository});
if(lock.branch!=='docs-tya-v6-v71-audit')fail('branch_lock_mismatch',{branch:lock.branch});
const postCutover=lock.currentIteration==='I5-G2';
if(postCutover){if(lock.formalProgress?.productionIsAuthorized!==true||lock.formalProgress?.productionCutoverExecuted!==true||lock.productionState?.active!==true||lock.productionState?.providerRedeployExecuted!==false||lock.productionState?.rebuildExecuted!==false||lock.productionState?.businessDataWritesAuthorized!==false)fail('post_cutover_production_state_invalid');}
else if(lock.formalProgress?.productionIsAuthorized!==false)fail('production_must_remain_unauthorized_before_G1_completion');
let continuityOutput='';try{continuityOutput=execFileSync(process.execPath,['tools/continuity/validate-cxorbia-phase-a-continuity-lock.js'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch(e){fail('canonical_continuity_validator_failed',{planId:lock.planId,syncEpoch:lock.syncEpoch,currentIteration:lock.currentIteration,functionalSourceLock,validatorError:String(e?.stderr||e?.message||e).slice(0,2000)});}
if(!continuityOutput.includes('CONTINUITY_LOCK_PASS'))fail('canonical_continuity_validator_missing_terminal_pass',{continuityOutput:continuityOutput.slice(0,2000)});
let changedFiles;try{changedFiles=execFileSync('git',['diff','--name-only',`${functionalSourceLock}..HEAD`],{encoding:'utf8'}).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);}catch(e){fail('git_diff_from_functional_source_lock_failed',{error:String(e?.message||e)});}
const runtimeExact=new Set(['app/index.html','app/index-backend-dev.html','app/app.js','app/manifest.webmanifest']);
const runtimePrefixes=['app/core/','app/modules/','app/styles/','app/adapters/','app/data/'];
const runtimeChangedFiles=changedFiles.filter(f=>runtimeExact.has(f)||runtimePrefixes.some(p=>f.startsWith(p)));
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(runtimeChangedFiles.length)fail('functional_runtime_drift_after_frozen_source',{planId:lock.planId,syncEpoch:lock.syncEpoch,currentIteration:lock.currentIteration,functionalSourceLock,head,runtimeChangedFiles});
const report={gate:'cxorbia-tya-rc-phase-a-drift',verdict:'GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED',generatedAt:new Date().toISOString(),planId:lock.planId,syncEpoch:lock.syncEpoch,currentIteration:lock.currentIteration,functionalSourceLock,head,historicalValidatedInput,historicalValidatedInputIgnoredAsAuthority:true,continuityValidator:'CONTINUITY_LOCK_PASS',consumedTerminalHarnessHoldPolicyEnforced:true,runtimeProtectionIncludesBackendDevAdaptersData:true,productionActive:postCutover,productionCutoverExecuted:lock.formalProgress?.productionCutoverExecuted===true,providerRedeployExecuted:lock.productionState?.providerRedeployExecuted===true,changedFilesSinceFunctionalLock:changedFiles.length,runtimeChangedFiles,runtimeChangedCount:runtimeChangedFiles.length,safeState:{providerRedeploy:false,databaseWrites:false,imports:false,businessDataWritesAuthorized:false}};
writeReport(report);console.log(JSON.stringify(report,null,2));
