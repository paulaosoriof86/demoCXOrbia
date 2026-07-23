#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const requestPath=process.argv[2]||'.github/cxorbia-apply-requests/request.json';
const outDir=path.join(root,'.tmp/cxorbia-atomic-apply-runner');
const proposalDir=path.join(outDir,'source-lock-proposal');
const manifestPath='app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json';
const buildLockPath='app/core/build-lock.js';
const report={
  schemaVersion:'1.0.0',
  runner:'CXORBIA_ATOMIC_APPLY_RUNNER',
  mode:'source_lock_regenerate_v1',
  status:'HOLD_ATOMIC_APPLY',
  requestId:null,
  expectedParentSha:null,
  requestCommitSha:null,
  functionalCommitSha:null,
  aggregateSha256:null,
  fileCount:null,
  files:[],
  blockers:[],
  safeState:{deploy:false,merge:false,production:false,providerWrites:false,dataWrites:false,forcePush:false,newBranch:false,newPullRequest:false}
};

function save(){fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');fs.writeFileSync(path.join(outDir,'report.md'),[
  '# CXOrbia atomic source-lock regeneration','',
  `- Status: \`${report.status}\``,
  `- Request: \`${report.requestId||'n/a'}\``,
  `- Parent: \`${report.expectedParentSha||'n/a'}\``,
  `- Commit: \`${report.functionalCommitSha||'n/a'}\``,
  `- Aggregate: \`${report.aggregateSha256||'n/a'}\``,
  `- File count: ${report.fileCount??'n/a'}`,'','## Blockers',
  ...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none'])
].join('\n')+'\n','utf8');}
function fail(message){throw new Error(message);}
function run(command,args){const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024});if(result.status!==0)fail(`command_failed:${command} ${args.join(' ')}:${String(result.stderr||result.stdout||'').slice(0,1500)}`);return String(result.stdout||'').trim();}
function readJson(rel){if(!fs.existsSync(path.join(root,rel)))fail(`required_file_missing:${rel}`);return JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));}

try{
  const request=readJson(requestPath);
  report.requestId=request.requestId||null;
  report.expectedParentSha=request.expectedParentSha||null;
  report.requestCommitSha=run('git',['rev-parse','HEAD']);
  const parent=run('git',['rev-parse','HEAD^']);
  if(request.schemaVersion!=='cxorbia.atomic-apply-request.v1'||request.mode!=='source_lock_regenerate_v1')fail('request_schema_or_mode_invalid');
  if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||Number(request.pullRequest)!==7)fail('request_target_invalid');
  if(request.deploy!==false||request.merge!==false||request.production!==false||request.providerWrites!==false||request.dataWrites!==false)fail('unsafe_request_flags');
  if(request.allowedExecutions!==1||request.atomicApply!==true)fail('single_atomic_execution_required');
  if(parent!==request.expectedParentSha)fail(`parent_mismatch:${parent}/${request.expectedParentSha}`);
  const requestDelta=run('git',['diff','--name-only','HEAD^','HEAD']).split(/\r?\n/).filter(Boolean).sort();
  if(requestDelta.length!==1||requestDelta[0]!==requestPath)fail(`request_commit_scope_invalid:${requestDelta.join(',')}`);
  const exactTargets=[buildLockPath,manifestPath].sort();
  const requestedTargets=(Array.isArray(request.targetPaths)?request.targetPaths:[]).slice().sort();
  if(JSON.stringify(requestedTargets)!==JSON.stringify(exactTargets))fail(`source_lock_targets_invalid:${requestedTargets.join(',')}`);

  fs.rmSync(proposalDir,{recursive:true,force:true});
  fs.mkdirSync(proposalDir,{recursive:true});
  run('node',['tools/release/tya-v174-r20-source-lock-proposal.mjs'],{env:{CXORBIA_SOURCE_LOCK_PROPOSAL_OUT:proposalDir}});
  const proposalReport=readJson(path.relative(root,path.join(proposalDir,'report.json')).replaceAll('\\','/'));
  if(proposalReport.decision!=='PASS_V174_R20_SOURCE_LOCK_PROPOSAL')fail('source_lock_proposal_not_pass');
  report.aggregateSha256=proposalReport.aggregateSha256;
  report.fileCount=proposalReport.fileCount;

  fs.copyFileSync(path.join(proposalDir,'MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json'),path.join(root,manifestPath));
  fs.copyFileSync(path.join(proposalDir,'build-lock.js'),path.join(root,buildLockPath));
  run('node',['tools/release/tya-v174-corte2a-empalme-directo-verify.mjs']);
  run('git',['rm','--',requestPath]);
  const changed=run('git',['diff','--name-only']).split(/\r?\n/).filter(Boolean).sort();
  const expected=[buildLockPath,manifestPath,requestPath].sort();
  if(JSON.stringify(changed)!==JSON.stringify(expected))fail(`working_tree_delta_invalid:${changed.join(',')}`);
  run('git',['config','user.name','cxorbia-automation']);
  run('git',['config','user.email','cxorbia-automation@users.noreply.github.com']);
  run('git',['add','-A','--',...expected]);
  const staged=run('git',['diff','--cached','--name-only']).split(/\r?\n/).filter(Boolean).sort();
  if(JSON.stringify(staged)!==JSON.stringify(expected))fail(`staged_delta_invalid:${staged.join(',')}`);
  const message=String(request.commitMessage||'').trim();
  if(message.length<8||message.length>120||/[\r\n]/.test(message))fail('commit_message_invalid');
  run('git',['commit','-m',message]);
  report.functionalCommitSha=run('git',['rev-parse','HEAD']);
  report.files=[
    {path:manifestPath,operation:'regenerate_source_lock'},
    {path:buildLockPath,operation:'regenerate_source_lock'},
    {path:requestPath,operation:'consume_request'}
  ];
  run('git',['push','origin','HEAD:docs-tya-v6-v71-audit']);
  report.status='APPLIED_AND_VERIFIED';
}catch(error){report.blockers.push(String(error?.message||error));process.exitCode=1;}
finally{save();}
