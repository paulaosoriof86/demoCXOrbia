#!/usr/bin/env node
/*
  Verify the exact generated V174/R20 composite against a source-lock proposal
  without changing repository history. The current manifest/build-lock are
  restored before exit. No commit, push, deploy, provider or data writes.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const proposalDir=path.resolve(process.argv[2]||'.tmp/cxorbia-readonly-post-gates/source-lock-proposal');
const manifestRel='app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json';
const lockRel='app/core/build-lock.js';
const proposalManifest=path.join(proposalDir,'MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json');
const proposalLock=path.join(proposalDir,'build-lock.js');
const currentManifest=path.join(root,manifestRel);
const currentLock=path.join(root,lockRel);
const backups=[];

function fail(message){throw new Error(`V174_PROPOSED_SOURCE_LOCK_VERIFY_HOLD: ${message}`);}
function run(command,args){
  const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024});
  if(result.status!==0)fail(String(result.stderr||result.stdout||'').slice(0,4000));
  return String(result.stdout||'').trim();
}
function backup(file){
  if(!fs.existsSync(file))fail(`missing current file ${file}`);
  const copy=`${file}.cxorbia-proposed-lock-backup`;
  fs.copyFileSync(file,copy);
  backups.push([file,copy]);
}
function restore(){
  for(const [file,copy] of backups.reverse()){
    if(fs.existsSync(copy)){fs.copyFileSync(copy,file);fs.rmSync(copy,{force:true});}
  }
}

let report=null;
try{
  if(!fs.existsSync(proposalManifest)||!fs.existsSync(proposalLock))fail('proposal files missing');
  backup(currentManifest);backup(currentLock);
  fs.copyFileSync(proposalManifest,currentManifest);
  fs.copyFileSync(proposalLock,currentLock);
  const stdout=run('node',['tools/release/tya-v174-corte2a-empalme-directo-verify.mjs']);
  const proposalReport=JSON.parse(fs.readFileSync(path.join(proposalDir,'report.json'),'utf8'));
  report={
    decision:'PASS_V174_PROPOSED_SOURCE_LOCK_VERIFY',
    aggregateSha256:proposalReport.aggregateSha256,
    fileCount:proposalReport.fileCount,
    verifierOutput:stdout.slice(-1000),
    safeState:{repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,imports:false,payments:false}
  };
  console.log(JSON.stringify(report,null,2));
}catch(error){
  console.error(String(error?.message||error));
  process.exitCode=1;
}finally{
  restore();
}
