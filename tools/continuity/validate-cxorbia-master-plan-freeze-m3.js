#!/usr/bin/env node
'use strict';
const fs=require('fs'),crypto=require('crypto'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..','..');
const fail=m=>{console.error(`MASTER_PLAN_FREEZE_BLOCKED: ${m}`);process.exit(2);};
const lockPath=path.join(root,'backend/config/cxorbia-phase-a-continuity-lock.json');
let lock;try{lock=JSON.parse(fs.readFileSync(lockPath,'utf8'));}catch(e){fail(`lock_read:${e.message}`);}
const m=lock.masterPlan||{};
const expected={id:'CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1',version:'1.0.0',status:'FROZEN',path:'app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md',gitBlobSha:'48494ebe5fc439aa6d00e6edcf2e78133357e7f3',sha256:'2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475',amendmentPolicy:'PLAN_CHANGE_REQUEST_ONLY_EXPLICIT_PAULA_ATOMIC'};
for(const [k,v] of Object.entries(expected))if(m[k]!==v)fail(`lock_master_plan_${k}_drift:${m[k]}`);
if(lock.resumeProtocol?.masterPlanMustValidateBeforeAction!==true||lock.resumeProtocol?.masterPlanChangeRequiresPlanChangeRequest!==true)fail('resume_protocol_master_plan_controls_missing');
if(lock.hardStops?.changeMasterPlanWithoutPlanChangeRequest!==false)fail('hard_stop_master_plan_control_missing');
const planPath=path.join(root,m.path);let buf;try{buf=fs.readFileSync(planPath);}catch(e){fail(`plan_read:${e.message}`);}
if(buf.length>=3&&buf[0]===0xef&&buf[1]===0xbb&&buf[2]===0xbf)fail('utf8_bom_forbidden');
const sha=crypto.createHash('sha256').update(buf).digest('hex');if(sha!==m.sha256)fail(`sha256_drift:${sha}`);
const blob=cp.execFileSync('git',['hash-object',m.path],{cwd:root,encoding:'utf8'}).trim();if(blob!==m.gitBlobSha)fail(`git_blob_drift:${blob}`);
const text=buf.toString('utf8');
for(const marker of ['`CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`','MASTER_PLAN_STATUS','F0 — Auditoría sistémica RC15','F1 — Inertización histórica','F2 — Autoridad canónica única y control-plane','F3 — Revalidación del carril G2-B','F6 — Freeze Phase A como release inmutable','F9 — Aceptación postproducción','F10 — Modelo operativo permanente','`PLAN_CHANGE_REQUEST`'])if(!text.includes(marker))fail(`required_marker_missing:${marker}`);
console.log('MASTER_PLAN_FREEZE_M3_PASS');
console.log(`masterPlanId=${m.id}`);console.log(`version=${m.version}`);console.log(`sha256=${sha}`);console.log(`gitBlobSha=${blob}`);console.log('dynamicExecutionState=OUTSIDE_FROZEN_PLAN_VALIDATOR');
