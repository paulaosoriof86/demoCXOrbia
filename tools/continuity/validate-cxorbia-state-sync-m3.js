#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..','..');
const E='RC15-M3-MECHANISM-20260825-02';
const fail=m=>{console.error(`STATE_SYNC_GATE_BLOCKED: ${m}`);process.exit(2);};
const readJson=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){fail(`json_read:${p}:${e.message}`);}};
const readText=p=>{try{return fs.readFileSync(path.join(root,p),'utf8');}catch(e){fail(`text_read:${p}:${e.message}`);}};
const lock=readJson('backend/config/cxorbia-phase-a-continuity-lock.json');
const m2=readJson('app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json');
const m3=readJson('app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json');
const authority=readJson('backend/config/cxorbia-validator-authority.json');
const tomb=readJson('backend/config/cxorbia-historical-authority-tombstones.json');
const q=readJson('backend/config/cxorbia-m3-quiescence-lock.json');
const current=Number(tomb.progress?.currentResidualHolds);
const queueNext=`M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_${current}`;
const barrierActive=q.status!=='CLOSED_PASS';
const expectedNext=barrierActive?'M3_0_FINAL_CLEAN_PROBE_AND_CLOSE_OR_FAIL_CLOSED':queueNext;
if(lock.masterPlan?.id!=='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1'||lock.masterPlan?.status!=='FROZEN'||lock.masterPlan?.currentPhase!=='M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY')fail('master_plan');
if(lock.rc15ControlPlaneEpoch!=='RC15-M2-F0-CLOSED-20260825-01'||lock.m3MechanismEpoch!==E)fail('control_epoch');
if(lock.m1ExecutionControl?.status!=='CLOSED_PASS'||lock.m2ExecutionControl?.status!=='CLOSED_PASS')fail('m1_m2_not_closed');
if(lock.m2ExecutionControl?.next!=='M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY')fail('lock_m2_next');
if(lock.m3ExecutionControl?.mechanismEpoch!==E||Number(lock.m3ExecutionControl?.currentResidualHolds)!==current||lock.m3ExecutionControl?.next!==expectedNext||lock.masterPlan?.next!==expectedNext)fail('lock_m3_control');
if(barrierActive&&(lock.m3ExecutionControl?.finiteQueueFrozen!==true||current!==27||Number((tomb.completedTombstones||[]).length)!==3))fail('barrier_queue_not_frozen');
if(m2.status!=='CLOSED_PASS'||m2.stateEpoch!=='RC15-M2-F0-CLOSED-20260825-01')fail('m2_evidence');
if(Number(m2.progressAfter?.exhaustivenessFlagsTrue)!==4||Number(m2.progressAfter?.exhaustivenessFlagsTotal)!==4||Number(m2.unclassifiedWriteCapableSurfaces)!==0)fail('m2_exhaustiveness');
if(m3.m3MechanismEpoch!==E||!String(m3.status||'').startsWith('ACTIVE_MECHANISM_')||Number(m3.f1?.currentResidualHolds)!==current)fail('m3_evidence');
if(authority.m3MechanismEpoch!==E||authority.status!=='ACTIVE_M3_VALIDATOR_SET')fail('validator_authority');
const canonicalDocs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
for(const p of canonicalDocs){const t=readText(p);for(const marker of ['CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1',E,'98/100','68/100','M3_0'])if(!t.includes(marker))fail(`mirror_drift:${p}:${marker}`);}
for(const script of ['tools/continuity/validate-cxorbia-master-plan-freeze-m3.js','tools/continuity/validate-cxorbia-canonical-authority.js','tools/continuity/validate-cxorbia-m3-quiescence.js']){const r=cp.spawnSync(process.execPath,[path.join(root,script)],{cwd:root,encoding:'utf8'});if(r.status!==0)fail(`${path.basename(script)}:${(r.stderr||r.stdout||'').trim()}`);}
console.log('STATE_SYNC_M3_GATE_PASS');
console.log(`barrier=${barrierActive?'ACTIVE':'CLOSED_PASS'}`);
console.log(`currentResidualHolds=${current}`);
console.log(`next=${expectedNext}`);
