#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`STATE_SYNC_GATE_BLOCKED: ${m}`);process.exit(2);};
const readJson=p=>{try{return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}catch(e){fail(`json_read:${p}:${e.message}`);}};
const readText=p=>{try{return fs.readFileSync(path.join(root,p),'utf8');}catch(e){fail(`text_read:${p}:${e.message}`);}};
const state=readJson('app/docs/evidence/RC15-M1-CANONICAL-STATE-LATEST.json');
const lock=readJson('backend/config/cxorbia-phase-a-continuity-lock.json');
const audit=readJson('app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json');
if(state.masterPlanId!=='CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1')fail('master_plan_id');
if(lock.masterPlan?.id!==state.masterPlanId||lock.masterPlan?.status!=='FROZEN')fail('continuity_master_plan');
if(lock.rc15ControlPlaneEpoch!==state.stateEpoch)fail('epoch_drift');
if(lock.m1ExecutionControl?.status!=='CLOSED_PASS')fail('m1_not_closed');
if(lock.nextNow?.action!=='M2_FINITE_F0_CLOSURE')fail('next_not_m2');
const p=audit.progress||{};
const expect={classifiedFindings:142,holdDiscoveriesCumulative:32,currentResidualHolds:30,exhaustivenessFlagsTrue:2,exhaustivenessFlagsTotal:4};
for(const [k,v] of Object.entries(expect))if(p[k]!==v)fail(`audit_${k}:${p[k]}`);
if(audit.detailedSnapshot?.path!=='app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-TRANCHE14-DETAIL.json'||audit.detailedSnapshot?.findingsThrough!==142)fail('tranche14_not_authoritative');
if(state.authoritativeAudit?.tranche!==14||state.authoritativeAudit?.classifiedFindings!==142||state.authoritativeAudit?.holdDiscoveriesCumulative!==32||state.authoritativeAudit?.currentResidualHolds!==30)fail('canonical_state_counts');
if(state.providerState?.providerMutationAuthorizedNow!==false||lock.masterPlan?.providerMutationAuthorizedNow!==false)fail('provider_mutation_must_be_false');
for(const pth of ['app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md','app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md','app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md','app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md']){
  const t=readText(pth);
  for(const marker of ['RC15-M1-STATE-SYNC-20260825-01','142','32','30','M2_FINITE_F0_CLOSURE'])if(!t.includes(marker))fail(`mirror_drift:${pth}:${marker}`);
}
const freeze=cp.spawnSync(process.execPath,[path.join(root,'tools/continuity/validate-cxorbia-master-plan-freeze.js')],{cwd:root,encoding:'utf8'});
if(freeze.status!==0)fail(`master_plan_freeze:${(freeze.stderr||freeze.stdout||'').trim()}`);
console.log('STATE_SYNC_GATE_PASS');
console.log(`stateEpoch=${state.stateEpoch}`);
console.log('tranche=14');
console.log('progress=142/32/30');
console.log('exhaustiveness=2/4');
console.log('next=M2_FINITE_F0_CLOSURE');
