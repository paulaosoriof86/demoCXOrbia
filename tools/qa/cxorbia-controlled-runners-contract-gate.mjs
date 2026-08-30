#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const root=process.cwd();
const run=(script)=>spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const core='tools/qa/cxorbia-controlled-runners-contract-core-v1.mjs';
const continuity='tools/continuity/validate-cxorbia-state-sync.js';

for(const [label,script] of [['CONTROLLED_RUNNERS_CORE',core],['CONTINUITY_STATE_SYNC',continuity]]){
  const result=run(script);
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  if(result.status!==0){
    console.error(`${label}_FAILED:${result.status}`);
    process.exit(result.status||1);
  }
}
console.log('PASS_CXORBIA_CONTROLLED_RUNNERS_AND_CONTINUITY_SYNC');
