#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const sourcePath=path.join(root,'tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs');
if(!fs.existsSync(sourcePath))throw new Error('DOMAIN_GATE_SOURCE_MISSING');
const source=fs.readFileSync(sourcePath,'utf8');
const forbidden=[
  "staff.authority.latestPeriod==='2026-07'",
  "staff.data.periodKey==='2026-07'",
  "window.CX?.modules?.cliente==='function'"
];
for(const marker of forbidden){
  if(source.includes(marker))throw new Error('OUTDATED_DOMAIN_GATE_MARKER_'+marker.replace(/[^A-Z0-9]+/gi,'_'));
}
const required=[
  "staff.data.periodKey===staff.authority.latestPeriod",
  "window.CX?.modules?.cli_dashboard==='function'",
  "decision:'PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC'"
];
for(const marker of required){
  if(!source.includes(marker))throw new Error('DYNAMIC_DOMAIN_GATE_MARKER_MISSING_'+marker.replace(/[^A-Z0-9]+/gi,'_'));
}
const run=spawnSync(process.execPath,[sourcePath,...process.argv.slice(2)],{
  cwd:root,
  env:{...process.env},
  encoding:'utf8',
  maxBuffer:80*1024*1024
});
if(run.stdout)process.stdout.write(run.stdout);
if(run.stderr)process.stderr.write(run.stderr);
process.exitCode=run.status||0;
