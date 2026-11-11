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
