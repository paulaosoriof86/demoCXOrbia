#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT=process.cwd();
const statePath='app/docs/CXORBIA-EXECUTION-STATE.json';
const canonicalDocs=[
  statePath,
  'app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md',
  'app/docs/SOURCE-LOCK-CXORBIA-TYA.md',
  'app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md',
  'app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md',
  'app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md',
  'app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md',
  'CAMBIOS-BACKEND.md',
  'RESUMEN-PARA-CLAUDE.md',
  'PENDIENTES-PROTOTIPO.md'
];
const errors=[],warnings=[];
const read=rel=>{const p=path.join(ROOT,rel);if(!fs.existsSync(p)){errors.push('MISSING:'+rel);return'';}return fs.readFileSync(p,'utf8');};

let state={};
try{state=JSON.parse(read(statePath));}catch{errors.push('STATE_JSON_INVALID');}
const EPOCH=String(state.syncEpoch||'');
const FRONTIER=String(state.phaseA?.exactFrontier||state.nextGate?.name||'');
const progress=Number(state.phaseA?.formalProgressPercent);
const remaining=Number(state.phaseA?.formalRemainingPercent);

if(!EPOCH)errors.push('STATE_SYNC_EPOCH_MISSING');
if(!FRONTIER)errors.push('STATE_FRONTIER_MISSING');
if(progress!==60||remaining!==40)errors.push('STATE_FORMAL_PROGRESS_MISMATCH');
if(state.repository!=='paulaosoriof86/demoCXOrbia'||state.branch!=='docs-tya-v6-v71-audit'||Number(state.pullRequest)!==7)errors.push('STATE_LANE_MISMATCH');
if(state.nextGate?.name&&state.nextGate.name!==FRONTIER)errors.push('STATE_NEXT_GATE_FRONTIER_MISMATCH');

for(const d of canonicalDocs){
  const t=read(d);
  if(EPOCH&&!t.includes(EPOCH))errors.push('EPOCH:'+d);
  if(FRONTIER&&!t.includes(FRONTIER))errors.push('FRONTIER:'+d);
}

for(const d of canonicalDocs.filter(x=>x.endsWith('.md'))){
  const t=read(d);
  if(!t.includes('60%')||!t.includes('40%'))errors.push('PROGRESS:'+d);
}

try{
  const branch=execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(branch!=='docs-tya-v6-v71-audit'&&!(branch==='HEAD'&&process.env.CXORBIA_ALLOW_DETACHED_HEAD==='1'))errors.push('BRANCH:'+branch);
}catch{warnings.push('BRANCH_CHECK_UNAVAILABLE');}

const out={
  schemaVersion:'cxorbia.source-truth-sync-verifier.v10.dynamic',
  syncEpoch:EPOCH,
  expectedFrontier:FRONTIER,
  canonicalDocsChecked:canonicalDocs.length,
  formalProgressPercent:progress,
  formalRemainingPercent:remaining,
  sourceOfEpochAndFrontier:statePath,
  hardCodedEpoch:false,
  hardCodedFrontier:false,
  errors,
  warnings,
  decision:errors.length?'FAIL_SOURCE_TRUTH_SYNC':'PASS_SOURCE_TRUTH_SYNC'
};
console.log(JSON.stringify(out,null,2));
process.exit(errors.length?1:0);
