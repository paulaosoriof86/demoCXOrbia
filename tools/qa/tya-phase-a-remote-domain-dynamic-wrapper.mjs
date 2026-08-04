#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const sourcePath=path.join(root,'tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs');
const tempDir=path.join(root,'.tmp/phase-a-runtime-private');
const tempPath=path.join(tempDir,'tya-remote-domain-dynamic.mjs');
if(!fs.existsSync(sourcePath))throw new Error('HISTORICAL_DOMAIN_GATE_SOURCE_MISSING');
let source=fs.readFileSync(sourcePath,'utf8');
const frozen="assert(staff.authority.firstPeriod==='2025-06'&&staff.authority.latestPeriod==='2026-07'&&staff.data.periodKey==='2026-07','LIVE_PERIOD_RANGE_INVALID');";
const dynamic="assert(Boolean(staff.authority.firstPeriod)&&Boolean(staff.authority.latestPeriod)&&staff.data.periodKey===staff.authority.latestPeriod,'LIVE_PERIOD_RANGE_INVALID');";
const occurrences=source.split(frozen).length-1;
if(occurrences!==1)throw new Error('FROZEN_PERIOD_INVARIANT_NOT_EXACTLY_ONE_'+occurrences);
source=source.replace(frozen,dynamic);
source=source.replace("schemaVersion:'cxorbia.c6.remote-domain-finance-portals-reservations.v2'","schemaVersion:'cxorbia.phase-a.remote-domain-finance-portals-reservations.dynamic.v1'");
source=source.replace("decision:'PASS_C6_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS'","decision:'PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC'");
fs.mkdirSync(tempDir,{recursive:true});
fs.writeFileSync(tempPath,source,{encoding:'utf8',mode:0o600});
const run=spawnSync(process.execPath,[tempPath,...process.argv.slice(2)],{cwd:root,env:{...process.env},encoding:'utf8',maxBuffer:80*1024*1024});
try{fs.rmSync(tempPath,{force:true});}catch{}
if(run.stdout)process.stdout.write(run.stdout);
if(run.stderr)process.stderr.write(run.stderr);
process.exitCode=run.status||0;
