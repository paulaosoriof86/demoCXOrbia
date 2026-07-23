#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const requestPath=process.argv[2]||'.github/cxorbia-apply-requests/request.json';
const outDir=path.join(root,'.tmp/cxorbia-atomic-apply-runner');
const report={schemaVersion:'1.0.0',runner:'CXORBIA_ATOMIC_APPLY_RUNNER',mode:'focal_text_patch_v1',status:'HOLD_ATOMIC_APPLY',requestId:null,expectedParentSha:null,requestCommitSha:null,functionalCommitSha:null,files:[],blockers:[],safeState:{deploy:false,merge:false,production:false,providerWrites:false,dataWrites:false,forcePush:false,newBranch:false,newPullRequest:false}};

function save(){fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');fs.writeFileSync(path.join(outDir,'report.md'),['# CXOrbia focal atomic apply','',`- Status: \`${report.status}\``,`- Request: \`${report.requestId||'n/a'}\``,`- Parent: \`${report.expectedParentSha||'n/a'}\``,`- Commit: \`${report.functionalCommitSha||'n/a'}\``,'','## Blockers',...(report.blockers.length?report.blockers.map(x=>`- ${x}`):['- none'])].join('\n')+'\n','utf8');}
function fail(message){throw new Error(message);}
function run(command,args){const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});if(result.status!==0)fail(`command_failed:${command} ${args.join(' ')}:${String(result.stderr||result.stdout||'').slice(0,1200)}`);return String(result.stdout||'').trim();}
function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}

try{
  if(!fs.existsSync(path.join(root,requestPath)))fail(`request_missing:${requestPath}`);
  const request=JSON.parse(fs.readFileSync(path.join(root,requestPath),'utf8'));
  report.requestId=request.requestId||null;
  report.expectedParentSha=request.expectedParentSha||null;
  report.requestCommitSha=run('git',['rev-parse','HEAD']);
  if(request.schemaVersion!=='cxorbia.atomic-apply-request.v1'||request.mode!=='focal_text_patch_v1')fail('request_schema_or_mode_invalid');
  if(request.repository!=='paulaosoriof86/demoCXOrbia'||request.branch!=='docs-tya-v6-v71-audit'||Number(request.pullRequest)!==7)fail('request_target_invalid');
  if(request.deploy!==false||request.merge!==false||request.production!==false||request.providerWrites!==false||request.dataWrites!==false)fail('unsafe_request_flags');
  const allowed=['tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs'];
  if(!allowed.includes(request.targetPath))fail(`target_not_allowlisted:${request.targetPath}`);
  const parent=run('git',['rev-parse','HEAD^']);
  if(parent!==request.expectedParentSha)fail(`parent_mismatch:${parent}/${request.expectedParentSha}`);
  const requestDelta=run('git',['diff','--name-only','HEAD^','HEAD']).split(/\r?\n/).filter(Boolean);
  if(requestDelta.length!==1||requestDelta[0]!==requestPath)fail(`request_commit_scope_invalid:${requestDelta.join(',')}`);
  const currentBlob=run('git',['hash-object',request.targetPath]);
  if(currentBlob!==request.expectedCurrentGitBlobSha)fail(`current_blob_mismatch:${currentBlob}/${request.expectedCurrentGitBlobSha}`);
  const original=fs.readFileSync(path.join(root,request.targetPath),'utf8');
  const occurrences=original.split(request.findText).length-1;
  if(occurrences!==1)fail(`find_occurrence_mismatch:${occurrences}`);
  const updated=original.replace(request.findText,request.replaceText);
  if(updated===original)fail('patch_no_change');
  if(updated.charCodeAt(0)===0xFEFF)fail('utf8_bom_forbidden');
  fs.writeFileSync(path.join(root,request.targetPath),updated,'utf8');
  run('node',['--check',request.targetPath]);
  run('git',['rm','--',requestPath]);
  const changed=run('git',['diff','--name-only']).split(/\r?\n/).filter(Boolean).sort();
  const expected=[request.targetPath,requestPath].sort();
  if(JSON.stringify(changed)!==JSON.stringify(expected))fail(`working_tree_delta_invalid:${changed.join(',')}`);
  run('git',['config','user.name','cxorbia-automation']);
  run('git',['config','user.email','cxorbia-automation@users.noreply.github.com']);
  run('git',['add','-A','--',...expected]);
  run('git',['commit','-m',String(request.commitMessage||'fix(tya): apply focal controlled patch')]);
  report.functionalCommitSha=run('git',['rev-parse','HEAD']);
  report.files=[{path:request.targetPath,operation:'focal_text_patch_v1',beforeGitBlobSha:currentBlob,afterGitBlobSha:run('git',['hash-object',request.targetPath]),afterSha256:sha256(Buffer.from(updated,'utf8'))}];
  run('git',['push','origin','HEAD:docs-tya-v6-v71-audit']);
  report.status='APPLIED_AND_VERIFIED';
}catch(error){report.blockers.push(String(error?.message||error));process.exitCode=1;}
finally{save();}
