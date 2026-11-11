import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

const ROOT=process.cwd();
const POINTER='CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
const DESCRIPTOR='CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json';
const RECEIPT='docs/checkpoints/CXORBIA_I3_HUMAN_PASS_B7_NO_LOOP_ACCOUNTING_20261111.json';
const GUARD=path.resolve(ROOT,'tools/qa/cxorbia-i3-human-pass-monotonic-guard.mjs');
const fixture=()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-phasea-human-pass-'));
  fs.mkdirSync(path.join(dir,'docs/checkpoints'),{recursive:true});
  fs.copyFileSync(path.join(ROOT,POINTER),path.join(dir,POINTER));
  fs.copyFileSync(path.join(ROOT,RECEIPT),path.join(dir,RECEIPT));
  const p=JSON.parse(fs.readFileSync(path.join(dir,POINTER),'utf8'));
  p.moduleTruthPath ||= 'RECOVERY-I3-MODULE-TRUTH-MATRIX-20261110-V293.json';
  p.moduleTruthExpectedGitBlob ||= 'e15b264b64782d49aab39875ebca7b5a76335d47';
  p.findingsLedgerPath ||= 'CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V606_2026-11-10.json';
  p.findingsLedgerExpectedGitBlob ||= '61e266ac736c8a338f011bed610ba3c00a33a11d';
  fs.writeFileSync(path.join(dir,POINTER),JSON.stringify(p,null,2)+'\n');
  fs.writeFileSync(path.join(dir,DESCRIPTOR),JSON.stringify({productSourceSha:p.productSourceSha,productTreeAuthority:p.productTree,moduleTruthPath:p.moduleTruthPath,moduleTruthExpectedGitBlob:p.moduleTruthExpectedGitBlob,findingsLedgerPath:p.findingsLedgerPath,findingsLedgerExpectedGitBlob:p.findingsLedgerExpectedGitBlob,phaseAHumanAcceptanceCurrent20261111:{humanAcceptedBlocks:[...p.activePhaseAClosureLock20261110.humanPassBlocks],humanCount:p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed,humanTotal:9}},null,2)+'\n');
  return dir;
};
const update=(dir,change)=>{
  const file=path.join(dir,POINTER);
  const p=JSON.parse(fs.readFileSync(file,'utf8'));
  change(p);
  fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
  const descriptorFile=path.join(dir,DESCRIPTOR);
  const d=JSON.parse(fs.readFileSync(descriptorFile,'utf8'));
  d.productSourceSha=p.productSourceSha;
  d.phaseAHumanAcceptanceCurrent20261111.humanAcceptedBlocks=[...p.activePhaseAClosureLock20261110.humanPassBlocks];
  d.phaseAHumanAcceptanceCurrent20261111.humanCount=p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed;
  fs.writeFileSync(descriptorFile,JSON.stringify(d,null,2)+'\n');
};
// Minimal fixtures intentionally omit the large canonical Git objects. The real
// checkout's CI-only object checks run separately after these regression tests.
const check=dir=>spawnSync(process.execPath,[GUARD],{cwd:dir,encoding:'utf8',env:{...process.env,GITHUB_ACTIONS:'false'}});
const cleanup=dir=>fs.rmSync(dir,{recursive:true,force:true});
const git=(dir,...args)=>execFileSync('git',args,{cwd:dir,stdio:['ignore','pipe','pipe']}).toString('utf8').trim();

test('positive: carries B4-B7, keeps human PASS separate from strict domains',()=>{
  const dir=fixture();
  try{const r=check(dir);assert.equal(r.status,0,r.stderr);const j=JSON.parse(r.stdout);const p=JSON.parse(fs.readFileSync(path.join(dir,POINTER),'utf8'));assert.ok(j.humanCount>=4);assert.equal(j.humanCount,p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed);assert.equal(j.strictOwnerDomainMatches,p.activePhaseAClosureLock20261110.strictDomainMatches);assert.equal(j.b7HumanPassPreserved,true);}finally{cleanup(dir);}
});

test('negative: B7 PASS cannot be silently deleted',()=>{
  const dir=fixture();
  try{update(dir,p=>{const a=p.activePhaseAClosureLock20261110;a.humanPassBlocks=a.humanPassBlocks.filter(x=>x!=='B7');a.phaseABlocksHumanPassed=a.humanPassBlocks.length;});const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/PROTECTED_HUMAN_PASS_ERASED:B7/);}finally{cleanup(dir);}
});

test('negative: mixing 4 human blocks with 5 strict domains is rejected',()=>{
  const dir=fixture();
  try{update(dir,p=>{p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed+=1;});const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/HUMAN_PASS_ACCOUNTING_MISMATCH/);}finally{cleanup(dir);}
});

test('negative: descriptor must not silently disagree with current human PASS',()=>{
  const dir=fixture();
  try{
    const file=path.join(dir,DESCRIPTOR),d=JSON.parse(fs.readFileSync(file,'utf8'));
    d.phaseAHumanAcceptanceCurrent20261111.humanAcceptedBlocks=['B4','B5','B6'];
    d.phaseAHumanAcceptanceCurrent20261111.humanCount=3;
    fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
    const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/DESCRIPTOR_HUMAN_ACCEPTANCE_DESYNC/);
  }finally{cleanup(dir);}
});

test('negative: a stale root matrix blob cannot disagree with the canonical descriptor',()=>{
  const dir=fixture();
  try{update(dir,p=>{p.moduleTruthExpectedGitBlob='0000000000000000000000000000000000000000';});const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/ROOT_DOCUMENT_AUTHORITY_DESYNC:moduleTruthExpectedGitBlob/);}finally{cleanup(dir);}
});

test('negative: a superseded root ledger cannot masquerade as the current ledger',()=>{
  const dir=fixture();
  try{update(dir,p=>{p.findingsLedgerPath='CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V605_2026-11-10.json';});const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/ROOT_DOCUMENT_AUTHORITY_DESYNC:findingsLedgerPath/);}finally{cleanup(dir);}
});

test('negative: newly acquired acceptance cannot disappear at next commit',t=>{
  const dir=fixture();
  try{
    const existing=JSON.parse(fs.readFileSync(path.join(dir,POINTER),'utf8')).activePhaseAClosureLock20261110.humanPassBlocks;
    const extra=['B1','B2','B3','B8','B9'].find(x=>!existing.includes(x));
    if(!extra){t.skip('all nine blocks have already received PASS');return;}
    git(dir,'init','-q');
    git(dir,'config','user.email','ci@cxorbia.invalid');
    git(dir,'config','user.name','CI fixture');
    update(dir,p=>{const a=p.activePhaseAClosureLock20261110;a.humanPassBlocks.push(extra);a.phaseABlocksHumanPassed=a.humanPassBlocks.length;a.currentAccountingSemantics.humanFunctionalBlocks.passed=a.humanPassBlocks.length;});
    git(dir,'add','.');git(dir,'commit','-qm','baseline with newly accepted block');
    update(dir,p=>{const a=p.activePhaseAClosureLock20261110;a.humanPassBlocks=a.humanPassBlocks.filter(x=>x!==extra);a.phaseABlocksHumanPassed=a.humanPassBlocks.length;a.currentAccountingSemantics.humanFunctionalBlocks.passed=a.humanPassBlocks.length;});
    git(dir,'add','.');git(dir,'commit','-qm','attempt erase new PASS');
    const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,new RegExp('MONOTONE_PASS_REGRESSION_FROM_PARENT:'+extra));
  }finally{cleanup(dir);}
});
