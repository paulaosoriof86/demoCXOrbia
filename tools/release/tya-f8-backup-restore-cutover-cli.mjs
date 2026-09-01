#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {runF8BackupRestoreCutoverOneShot} from './tya-f8-backup-restore-cutover-one-shot.mjs';

const AUTH_ID='PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01';
const OUT='app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json';
const PASS='PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY';

function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function gitDir(){
  const r=spawnSync('git',['rev-parse','--git-dir'],{encoding:'utf8',timeout:10000});
  if(r.status!==0)throw new Error('F8_GIT_DIR_UNAVAILABLE');
  return String(r.stdout||'').trim();
}
function blocksReplay(prior){
  if(!prior||prior.authorizationId!==AUTH_ID)return false;
  return prior.authorizationConsumed===true || Number(prior?.safety?.providerWrites||0)>0 || prior?.backup?.started===true;
}
function safeSummary(result){
  return {
    decision:String(result?.decision||'UNKNOWN'),
    stage:String(result?.stage||'UNKNOWN'),
    authorizationConsumed:result?.authorizationConsumed===true,
    providerWrites:Number(result?.safety?.providerWrites||0),
    next:result?.next||null
  };
}

async function main(){
  const accessToken=String(process.env.CXORBIA_GCP_ACCESS_TOKEN||'');
  if(accessToken.length<=20)throw new Error('F8_ACCESS_TOKEN_ROUTE_MISSING');

  if(fs.existsSync(OUT)){
    const prior=readJson(OUT);
    if(blocksReplay(prior))throw new Error('F8_AUTHORIZATION_ALREADY_CONSUMED_OR_PROVIDER_MUTATION_ALREADY_STARTED');
  }

  const lockPath=path.join(gitDir(),'cxorbia-f8-backup-restore-cutover.single-use.lock');
  let lockFd=null;
  try{
    lockFd=fs.openSync(lockPath,'wx');
    fs.writeFileSync(lockFd,JSON.stringify({authorizationId:AUTH_ID,createdAt:new Date().toISOString(),secretMaterialStored:false})+'\n','utf8');
    fs.closeSync(lockFd);lockFd=null;
  }catch(error){
    if(lockFd!==null){try{fs.closeSync(lockFd);}catch{}}
    if(error?.code==='EEXIST')throw new Error('F8_LOCAL_SINGLE_USE_LEASE_ALREADY_PRESENT');
    throw error;
  }

  let result=null;
  try{
    result=await runF8BackupRestoreCutoverOneShot({accessToken});
  }finally{
    const providerWrites=Number(result?.safety?.providerWrites||0);
    const consumed=result?.authorizationConsumed===true;
    if(result && !consumed && providerWrites===0){
      try{fs.unlinkSync(lockPath);}catch{}
    }
  }

  process.stdout.write(JSON.stringify(safeSummary(result))+'\n');
  if(result?.decision!==PASS)process.exitCode=2;
}

main().catch(error=>{
  process.stderr.write(String(error?.message||error)+'\n');
  process.exitCode=2;
});
