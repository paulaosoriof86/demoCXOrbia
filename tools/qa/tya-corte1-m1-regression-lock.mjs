#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const requiredFiles=[
  'app/adapters/tya-live-source-refresh-watch.js',
  'app/adapters/tya-live-source-inplace-apply.js',
  'app/adapters/tya-live-source-fast-trigger.js',
  'app/adapters/tya-corte1-report-projection-live.js',
  'backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json'
];
const gates=[
  'tools/qa/tya-hr-header-variants-r20-gate.mjs',
  'tools/qa/tya-live-hr-inplace-refresh-gate.mjs',
  'tools/qa/tya-corte1-context-history-reports-gate.mjs',
  'tools/qa/tya-corte1-report-frontend-runtime-gate.mjs',
  'tools/qa/tya-project-period-kpi-history-gate-r20.mjs'
];

const blockers=[];
const results=[];
for(const rel of requiredFiles){
  if(!fs.existsSync(path.join(root,rel))) blockers.push({code:'required_file_missing',file:rel});
}

const watcherPath=path.join(root,'app/adapters/tya-live-source-refresh-watch.js');
if(fs.existsSync(watcherPath)){
  const watcher=fs.readFileSync(watcherPath,'utf8');
  if(watcher.includes('location.reload')) blockers.push({code:'document_reload_forbidden',file:'app/adapters/tya-live-source-refresh-watch.js'});
}

const inplacePath=path.join(root,'app/adapters/tya-live-source-inplace-apply.js');
if(fs.existsSync(inplacePath)){
  const inplace=fs.readFileSync(inplacePath,'utf8');
  if(!inplace.includes('CX_TYA_APPLY_LIVE_SNAPSHOT')) blockers.push({code:'inplace_apply_entrypoint_missing',file:'app/adapters/tya-live-source-inplace-apply.js'});
  if(!inplace.includes('sourceRevision')) blockers.push({code:'source_revision_tracking_missing',file:'app/adapters/tya-live-source-inplace-apply.js'});
}

for(const gate of gates){
  const full=path.join(root,gate);
  if(!fs.existsSync(full)){
    blockers.push({code:'gate_missing',file:gate});
    continue;
  }
  const run=spawnSync(process.execPath,[full],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
  const result={gate,exitCode:run.status,signal:run.signal||null,stdout:(run.stdout||'').trim().slice(-4000),stderr:(run.stderr||'').trim().slice(-4000)};
  results.push(result);
  if(run.status!==0) blockers.push({code:'gate_failed',file:gate,exitCode:run.status,stderr:result.stderr});
}

const report={
  ok:blockers.length===0,
  decision:blockers.length?'HOLD_CORTE1_M1_REGRESSION_LOCK':'PASS_CORTE1_M1_REGRESSION_LOCK',
  frozenFunctionalBuild:'67c0943260f076f5686284ac509458ed5fd34dbd',
  documentReload:false,
  gates:results,
  blockers
};

const outDir=path.join(root,'.tmp/tya-corte1-m1-regression-lock');
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(outDir,'report.md'),`# Corte 1 / M1 regression lock\n\n- Decision: \`${report.decision}\`\n- Frozen functional build: \`${report.frozenFunctionalBuild}\`\n- Gates executed: ${results.length}\n- Blockers: ${blockers.length}\n\n${blockers.length?blockers.map(x=>`- ${x.code}: ${x.file||''}`).join('\n'):'- None'}\n`,'utf8');
console.log(JSON.stringify(report,null,2));
if(blockers.length) process.exit(1);
