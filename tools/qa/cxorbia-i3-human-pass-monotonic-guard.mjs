import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const POINTER='CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
const REQUIRED=Object.freeze(['B4','B5','B6','B7']);
const fail=(code,detail='')=>{throw new Error('PHASE_A_ACCEPTANCE_CONTINUITY_FAILURE:'+code+(detail?':'+detail:''));};
const read=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const pointer=read(POINTER);
const active=pointer.activePhaseAClosureLock20261110;
if(!active||typeof active!=='object')fail('CURRENT_LOCK_MISSING');
if(active.priority!=='READ_CURRENT_HUMAN_PASS_RECEIPT_AND_MONOTONE_ACCOUNTING_BEFORE_OLDER_SNAPSHOTS')fail('STALE_LOCK_READ_PRIORITY');
const passed=active.humanPassBlocks;
if(!Array.isArray(passed)||new Set(passed).size!==passed.length)fail('INVALID_OR_DUPLICATED_HUMAN_PASS');
for(const block of REQUIRED)if(!passed.includes(block))fail('PROTECTED_HUMAN_PASS_ERASED',block);
if(active.phaseABlocksHumanPassed!==passed.length||active.phaseABlocksTotal!==9)fail('HUMAN_PASS_ACCOUNTING_MISMATCH');
const b7=active.blocks?.B7;
if(!b7||!String(b7.human).startsWith('PASS_')||b7.humanAcceptanceLocked!==true)fail('B7_HUMAN_PASS_NOT_CARRIED');
const receiptPath=b7.humanAcceptanceReceipt;
if(receiptPath!=='docs/checkpoints/CXORBIA_I3_HUMAN_PASS_B7_NO_LOOP_ACCOUNTING_20261111.json')fail('B7_RECEIPT_PATH_DRIFT');
const receipt=read(receiptPath);
if(receipt.exactHumanDecision?.actor!=='Paula Andrea Osorio Franco'||!String(receipt.exactHumanDecision?.verbatim||'').includes('B7 con Pass'))fail('B7_HUMAN_RECEIPT_NOT_VERIFIED');
if(!receipt.after?.humanPassed?.every(x=>passed.includes(x)))fail('B7_RECEIPT_ACCEPTANCE_NOT_CARRIED');
if(active.strictDomainTotal!==21||!Number.isInteger(active.strictDomainMatches)||active.strictDomainMatches<0||active.strictDomainMatches>21)fail('STRICT_DOMAIN_ACCOUNTING_INVALID');
if(active.technicalIsNotHumanAcceptance!==true||active.currentAccountingSemantics?.humanFunctionalBlocks?.passed!==passed.length||active.currentAccountingSemantics?.strictOwnerDomainMatch?.matched!==active.strictDomainMatches)fail('MIXED_COUNT_OR_LABEL_DRIFT');
if(pointer.productSourceSha!==active.sourceSha||pointer.productTree!==active.sourceTree)fail('SOURCE_POINTER_DESYNC');
if(active.gate20!=='HOLD'||active.gate21!=='HOLD'){
  // Terminal gate progression is reported separately. This guard never grants I3 or I4.
  if(active.i4Authorized===true && active.phaseABlocksHumanPassed!==9)fail('EARLY_I4');
}
const previous=()=>{
  try{return JSON.parse(execFileSync('git',['show','HEAD^:'+POINTER],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}
  catch{return null;}
};
const old=previous();
if(old?.activePhaseAClosureLock20261110?.humanPassBlocks){
  const older=old.activePhaseAClosureLock20261110.humanPassBlocks;
  for(const block of older)if(!passed.includes(block))fail('MONOTONE_PASS_REGRESSION_FROM_PARENT',block);
}
const result={
  decision:'PASS_PHASE_A_ACCEPTANCE_CONTINUITY_NOT_TERMINAL_CERTIFICATION',
  branch:'recovery/cxorbia-phase-a-20260831',
  humanAcceptedBlocks:passed,
  humanCount:passed.length,
  humanTotal:9,
  strictOwnerDomainMatches:active.strictDomainMatches,
  strictOwnerDomainTotal:active.strictDomainTotal,
  historicalComparisonNotAdditive:true,
  b7HumanPassPreserved:true,
  b7TinyFishPassed:false,
  terminalGate20:active.gate20,
  terminalGate21:active.gate21,
  production:active.production,
  i4Authorized:active.i4Authorized,
  noDataWrites:true
};
console.log(JSON.stringify(result,null,2));
