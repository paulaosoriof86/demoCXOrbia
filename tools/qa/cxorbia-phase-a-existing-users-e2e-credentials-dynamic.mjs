#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const sourcePath=path.join(root,'tools/qa/cxorbia-c6-existing-users-e2e-credentials-v6.mjs');
const tempDir=path.join(root,'.tmp/phase-a-runtime-private');
const tempPath=path.join(tempDir,'cxorbia-existing-users-e2e-dynamic.mjs');
if(!fs.existsSync(sourcePath))throw new Error('HISTORICAL_SELECTOR_SOURCE_MISSING');
let source=fs.readFileSync(sourcePath,'utf8');
const frozen="if(baseVisits.length!==616)stageFail(`LIVE_HR_VISITS_MISMATCH_${baseVisits.length}`);";
const dynamic="if(baseVisits.length<1)stageFail('LIVE_HR_VISITS_EMPTY');";
const occurrences=source.split(frozen).length-1;
if(occurrences!==1)throw new Error('FROZEN_VISIT_INVARIANT_NOT_EXACTLY_ONE_'+occurrences);
source=source.replace(frozen,dynamic);
source=source.replace("schemaVersion:'cxorbia.c6.e2e-private-credentials.v7'","schemaVersion:'cxorbia.phase-a.e2e-private-credentials.dynamic.v1'");
source=source.replace("decision:'PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION_V6'","decision:'PASS_PHASE_A_EXISTING_E2E_CREDENTIAL_SELECTION_DYNAMIC'");
fs.mkdirSync(tempDir,{recursive:true});
fs.writeFileSync(tempPath,source,{encoding:'utf8',mode:0o600});
const run=spawnSync(process.execPath,[tempPath],{cwd:root,env:{...process.env},encoding:'utf8',maxBuffer:60*1024*1024});
try{fs.rmSync(tempPath,{force:true});}catch{}
if(run.status!==0){if(run.stderr)process.stderr.write(run.stderr);if(run.stdout)process.stderr.write(run.stdout);process.exit(run.status||1);}
const lines=String(run.stdout||'').trim().split(/\r?\n/).filter(Boolean);
const result=JSON.parse(lines.at(-1)||'{}');
if(result.decision!=='PASS_PHASE_A_EXISTING_E2E_CREDENTIAL_SELECTION_DYNAMIC')throw new Error('DYNAMIC_CREDENTIAL_SELECTOR_NOT_PASS');
if(Number(result.liveVisits||0)<1||result.authWrites!==0||result.passwordChanges!==0||result.valuesExported!==false)throw new Error('DYNAMIC_CREDENTIAL_SELECTOR_UNSAFE_OR_EMPTY');
result.frozenVisitCountAssumed=false;
console.log(JSON.stringify(result));
