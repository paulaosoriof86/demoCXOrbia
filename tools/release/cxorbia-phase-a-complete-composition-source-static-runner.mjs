#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const ROOT=process.cwd();
const REQUEST_PATH=process.argv[2]||'.github/cxorbia-gate-requests/request.json';
const GATE='tools/qa/tya-phase-a-complete-composition-source-gate.mjs';
const REPORT_DIR=path.join(ROOT,'.tmp/cxorbia-readonly-post-gates-runner');
const REPORT_JSON=path.join(REPORT_DIR,'report.json');
const REPORT_MD=path.join(REPORT_DIR,'report.md');
const PROFILE='PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC';
const EXPECTED_SAFE_STATE={
  repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,
  imports:false,payments:false,make:false,gemini:false,firestoreWrites:false,
  authWrites:false,storageWrites:false,hrWrites:false
};
const report={
  schemaVersion:'1.5.0',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',
  generatedAt:new Date().toISOString(),status:'HOLD_NOT_RUN',
  repository:process.env.GITHUB_REPOSITORY||null,branch:process.env.GITHUB_REF_NAME||null,
  requestPath:REQUEST_PATH,requestId:null,requestCommitSha:null,targetHeadSha:null,
  profile:PROFILE,profileDefinition:{browserRequired:false,providerReads:false,
    purpose:'Validate the exact Phase A complete source/composition manifest without provider calls or repository mutation.'},
  stableVisitIdentity:null,checks:[],blockers:[],commands:[],artifacts:[],summary:null,
  safeState:{...EXPECTED_SAFE_STATE}
};

function save(){
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  fs.writeFileSync(REPORT_JSON,JSON.stringify(report,null,2)+'\n','utf8');
  const lines=[
    '# CXOrbia read-only post-gates runner','',
    `- Status: \`${report.status}\``,`- Request: \`${report.requestId||'n/a'}\``,
    `- Profile: \`${report.profile}\``,`- Request commit: \`${report.requestCommitSha||'n/a'}\``,
    `- Target HEAD: \`${report.targetHeadSha||'n/a'}\``,'- Browser required: `false`','',
    '## Summary','','```json',JSON.stringify(report.summary,null,2),'```','',
    '## Blockers','',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none']),'',
    '## Checks','',...(report.checks.length?report.checks.map(x=>`- ${x}`):['- none']),'',
    '## Commands','',...(report.commands.length?report.commands.map(x=>`- \`${x}\``):['- none'])
  ];
  fs.writeFileSync(REPORT_MD,lines.join('\n')+'\n','utf8');
}
function hold(code,detail=''){
  const value=detail?`${code}:${detail}`:code;
  report.blockers.push(value);
  throw new Error(value);
}
function check(ok,code,detail=''){
  if(!ok)hold(code,detail);
  report.checks.push(detail?`${code}:${detail}`:code);
}
function run(command,args){
  report.commands.push([command,...args].join(' '));
  const r=spawnSync(command,args,{cwd:ROOT,encoding:'utf8',env:{...process.env},maxBuffer:60*1024*1024});
  if(r.status!==0)hold('command_failed',`${command} ${args.join(' ')} :: ${(r.stderr||r.stdout||'').slice(0,4000)}`);
  return String(r.stdout||'').trim();
}
function readJson(rel){
  const abs=path.join(ROOT,rel);
  check(fs.existsSync(abs),'required_file_present',rel);
  try{return JSON.parse(fs.readFileSync(abs,'utf8'));}catch(e){hold('invalid_json',`${rel}:${e.message}`);}
}

async function main(){
  const request=readJson(REQUEST_PATH);
  report.requestCommitSha=run('git',['rev-parse','HEAD']);
  report.targetHeadSha=request.targetHeadSha||null;
  report.requestId=request.requestId||null;
  check(request.enabled===true,'request_enabled');
  check(report.repository==='paulaosoriof86/demoCXOrbia','repository_exact',report.repository||'');
  check(report.branch==='docs-tya-v6-v71-audit','branch_exact',report.branch||'');
  check(request.schemaVersion==='cxorbia.readonly-post-gates-request.v1','request_schema_valid');
  check(request.repository===report.repository,'request_repository_exact');
  check(request.branch===report.branch,'request_branch_exact');
  check(Number(request.pullRequest)===7,'request_pr_exact');
  check(request.profile===PROFILE,'profile_exact',String(request.profile||''));
  check(Array.isArray(request.allowedProfiles)&&request.allowedProfiles.length===1&&request.allowedProfiles[0]===PROFILE,'profile_authorized');
  check(request.targetHeadSha===run('git',['rev-parse','HEAD^']),'target_head_exact',String(request.targetHeadSha||''));
  check(request.allowedExecutions===1,'single_execution_required');
  for(const [key,expected] of Object.entries(EXPECTED_SAFE_STATE))check(request.safeState?.[key]===expected,`safe_state_${key}`);
  check(request.repositoryWrites===false,'repository_writes_forbidden');
  check(request.dataWrites===false,'data_writes_forbidden');
  check(request.deploy===false&&request.merge===false&&request.production===false,'deploy_merge_production_forbidden');
  check(request.sourceLockDocument==='app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json','source_lock_document_exact');
  check(request.containsPii===false&&request.containsSecrets===false,'request_sanitized');
  check(fs.existsSync(path.join(ROOT,GATE)),'script_present',GATE);
  run('node',['--check',GATE]);
  const output=run('node',[GATE]);
  let gate;
  try{gate=JSON.parse(output);}catch(e){hold('gate_output_invalid_json',e.message);}
  check(String(gate?.decision||'').startsWith('PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE'),'source_static_gate_pass',String(gate?.decision||''));
  const evidenceDir=path.join(ROOT,'.tmp/phase-a-complete-composition-source-static');
  fs.mkdirSync(evidenceDir,{recursive:true});
  fs.writeFileSync(path.join(evidenceDir,'report.json'),JSON.stringify(gate,null,2)+'\n','utf8');
  report.artifacts=['.tmp/phase-a-complete-composition-source-static/report.json'];
  report.summary={
    status:'PASS_READONLY_POST_GATES',profile:PROFILE,browserExecuted:false,
    providerReads:false,providerWrites:false,dataWrites:false,
    decision:gate.decision,failures:gate.failures||[],warnings:gate.warnings||[],
    checks:gate.checks||null
  };
  check(run('git',['status','--porcelain'])==='','repository_unchanged_after_gates');
  report.status='PASS_READONLY_POST_GATES';
}

main().catch(error=>{
  if(!report.blockers.length)report.blockers.push(String(error?.message||error));
  report.status='HOLD_READONLY_POST_GATES';
  process.exitCode=1;
}).finally(save);
