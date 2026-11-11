import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

const ROOT=process.cwd();
const POINTER='CXORBIA_RECOVERY_EXECUTION_CURRENT.json';
const RECEIPT='docs/checkpoints/CXORBIA_I3_HUMAN_PASS_B7_NO_LOOP_ACCOUNTING_20261111.json';
const GUARD=path.resolve(ROOT,'tools/qa/cxorbia-i3-human-pass-monotonic-guard.mjs');
const fixture=()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cxorbia-phasea-human-pass-'));
  fs.mkdirSync(path.join(dir,'docs/checkpoints'),{recursive:true});
  fs.copyFileSync(path.join(ROOT,POINTER),path.join(dir,POINTER));
  fs.copyFileSync(path.join(ROOT,RECEIPT),path.join(dir,RECEIPT));
  return dir;
};
const update=(dir,change)=>{
  const file=path.join(dir,POINTER);
  const p=JSON.parse(fs.readFileSync(file,'utf8'));
  change(p);
  fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
};
const check=dir=>spawnSync(process.execPath,[GUARD],{cwd:dir,encoding:'utf8'});
const cleanup=dir=>fs.rmSync(dir,{recursive:true,force:true});
const git=(dir,...args)=>execFileSync('git',args,{cwd:dir,stdio:['ignore','pipe','pipe']}).toString('utf8').trim();

test('positive: carries B4-B7, keeps 4/9 distinct from 5/21',()=>{
  const dir=fixture();
  try{const r=check(dir);assert.equal(r.status,0,r.stderr);const j=JSON.parse(r.stdout);assert.equal(j.humanCount,4);assert.equal(j.strictOwnerDomainMatches,5);assert.equal(j.b7HumanPassPreserved,true);}finally{cleanup(dir);}
});

test('negative: B7 PASS cannot be silently deleted',()=>{
  const dir=fixture();
  try{update(dir,p=>{p.activePhaseAClosureLock20261110.humanPassBlocks=['B4','B5','B6'];p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed=3;});const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/PROTECTED_HUMAN_PASS_ERASED:B7/);}finally{cleanup(dir);}
});

test('negative: mixing 4 human blocks with 5 strict domains is rejected',()=>{
  const dir=fixture();
  try{update(dir,p=>{p.activePhaseAClosureLock20261110.phaseABlocksHumanPassed=5;});const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/HUMAN_PASS_ACCOUNTING_MISMATCH/);}finally{cleanup(dir);}
});

test('negative: acceptance newly acquired after B7 cannot disappear at next commit',()=>{
  const dir=fixture();
  try{
    git(dir,'init','-q');
    git(dir,'config','user.email','ci@cxorbia.invalid');
    git(dir,'config','user.name','CI fixture');
    update(dir,p=>{const a=p.activePhaseAClosureLock20261110;a.humanPassBlocks.push('B1');a.phaseABlocksHumanPassed=5;a.currentAccountingSemantics.humanFunctionalBlocks.passed=5;});
    git(dir,'add','.');git(dir,'commit','-qm','baseline with B1 PASS');
    update(dir,p=>{const a=p.activePhaseAClosureLock20261110;a.humanPassBlocks=a.humanPassBlocks.filter(x=>x!=='B1');a.phaseABlocksHumanPassed=4;a.currentAccountingSemantics.humanFunctionalBlocks.passed=4;});
    git(dir,'add','.');git(dir,'commit','-qm','attempt erase B1 PASS');
    const r=check(dir);assert.notEqual(r.status,0);assert.match(r.stderr,/MONOTONE_PASS_REGRESSION_FROM_PARENT:B1/);
  }finally{cleanup(dir);}
});
