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
if(lock.masterPlan?.id!=='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1'||lock.masterPlan?.status!=='FROZEN'||lock.masterPlan?.currentPhase!=='M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY')fail('master_plan');
if(lock.rc15ControlPlaneEpoch!=='RC15-M2-F0-CLOSED-20260825-01'||lock.m3MechanismEpoch!==E)fail('control_epoch');
if(lock.m1ExecutionControl?.status!=='CLOSED_PASS'||lock.m2ExecutionControl?.status!=='CLOSED_PASS')fail('m1_m2_not_closed');
if(lock.m2ExecutionControl?.next!=='M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY')fail('lock_m2_next');
if(lock.m3ExecutionControl?.mechanismEpoch!==E||Number(lock.m3ExecutionControl?.currentResidualHolds)!==28)fail('lock_m3_control');
if(m2.status!=='CLOSED_PASS'||m2.stateEpoch!=='RC15-M2-F0-CLOSED-20260825-01')fail('m2_evidence');
if(Number(m2.progressAfter?.exhaustivenessFlagsTrue)!==4||Number(m2.progressAfter?.exhaustivenessFlagsTotal)!==4||Number(m2.unclassifiedWriteCapableSurfaces)!==0)fail('m2_exhaustiveness');
if(m3.m3MechanismEpoch!==E||m3.status!=='ACTIVE_MECHANISM_REPAIR_APPLIED_CERTIFICATION_PENDING_READBACK')fail('m3_evidence');
if(authority.m3MechanismEpoch!==E||authority.status!=='ACTIVE_M3_VALIDATOR_SET')fail('validator_authority');
const canonicalDocs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
for(const p of canonicalDocs){const t=readText(p);for(const marker of ['CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1',E,'M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY','98/100'])if(!t.includes(marker))fail(`mirror_drift:${p}:${marker}`);}
for(const script of ['tools/continuity/validate-cxorbia-master-plan-freeze-m3.js','tools/continuity/validate-cxorbia-canonical-authority.js']){const r=cp.spawnSync(process.execPath,[path.join(root,script)],{cwd:root,encoding:'utf8'});if(r.status!==0)fail(`${path.basename(script)}:${(r.stderr||r.stdout||'').trim()}`);}
console.log('STATE_SYNC_M3_GATE_PASS');
console.log('m2ControlEpoch=RC15-M2-F0-CLOSED-20260825-01');
console.log(`m3MechanismEpoch=${E}`);
console.log('m3Status=MECHANISM_REPAIR_APPLIED_CERTIFICATION_PENDING_READBACK');
console.log('currentResidualHolds=28');
console.log('next=M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28');
