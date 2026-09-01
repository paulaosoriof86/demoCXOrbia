#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..','..');
const E='RC15-M3-MECHANISM-20260825-02';
const fail=m=>{console.error(`STATE_SYNC_GATE_BLOCKED: ${m}`);process.exit(2);};
const j=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){fail(`json:${p}:${e.message}`);}};
const t=p=>{try{return fs.readFileSync(path.join(root,p),'utf8');}catch(e){fail(`text:${p}:${e.message}`);}};
const lock=j('backend/config/cxorbia-phase-a-continuity-lock.json'),m2=j('app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json'),m3=j('app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json'),authority=j('backend/config/cxorbia-validator-authority.json'),tomb=j('backend/config/cxorbia-historical-authority-tombstones.json'),q=j('backend/config/cxorbia-m3-quiescence-lock.json'),direct=j('backend/config/cxorbia-m3-direct-readback-gate.json');
const current=Number(tomb.progress?.currentResidualHolds),next=String(lock.masterPlan?.next||'');
if(lock.masterPlan?.id!=='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1'||lock.masterPlan?.status!=='FROZEN'||lock.masterPlan?.currentPhase!=='M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY')fail('master_plan');
if(lock.rc15ControlPlaneEpoch!=='RC15-M2-F0-CLOSED-20260825-01'||lock.m3MechanismEpoch!==E||lock.m1ExecutionControl?.status!=='CLOSED_PASS'||lock.m2ExecutionControl?.status!=='CLOSED_PASS')fail('prior_state');
if(q.status!=='CLOSED_PASS'||lock.m3ExecutionControl?.quiescenceStatus!=='CLOSED_PASS'||lock.m3ExecutionControl?.finiteQueueFrozen!==false)fail('quiescence');
if(Number(lock.m3ExecutionControl?.currentResidualHolds)!==current||lock.m3ExecutionControl?.next!==next||direct.next!==next)fail('m3_next_or_queue');
if(Number(lock.productionRealReadiness?.completed)!==69)fail('production_readiness');
if(m2.status!=='CLOSED_PASS'||Number(m2.progressAfter?.exhaustivenessFlagsTrue)!==4||Number(m2.progressAfter?.exhaustivenessFlagsTotal)!==4||Number(m2.unclassifiedWriteCapableSurfaces)!==0)fail('m2_evidence');
if(m3.m3MechanismEpoch!==E||Number(m3.f1?.currentResidualHolds)!==current)fail('m3_evidence');
if(authority.m3MechanismEpoch!==E||authority.status!=='ACTIVE_M3_VALIDATOR_SET'||authority.activeSourceOnlyGate?.mode!=='DIRECT_GITHUB_READBACK')fail('validator_authority');
const docs=['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md','RESUMEN-PARA-CLAUDE.md','PENDIENTES-PROTOTIPO.md'];
for(const p of docs){const s=t(p);for(const marker of ['CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1',E,'98/100','69/100','M3_0','M3_FINITE_QUEUE_BATCH_1'])if(!s.includes(marker))fail(`mirror_drift:${p}:${marker}`);}
for(const s of ['tools/continuity/validate-cxorbia-master-plan-freeze-m3.js','tools/continuity/validate-cxorbia-canonical-authority.js','tools/continuity/validate-cxorbia-m3-direct-readback.js','tools/continuity/validate-cxorbia-m3-quiescence.js']){const r=cp.spawnSync(process.execPath,[path.join(root,s)],{cwd:root,encoding:'utf8'});if(r.status!==0)fail(`${path.basename(s)}:${(r.stderr||r.stdout||'').trim()}`);}
console.log('STATE_SYNC_M3_GATE_PASS');
console.log('barrier=CLOSED_PASS');
console.log(`currentResidualHolds=${current}`);
console.log(`next=${next}`);
console.log('productionRealReadiness=69/100');
