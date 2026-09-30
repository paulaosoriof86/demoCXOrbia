#!/usr/bin/env node
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const requestPath=process.argv[2]||'.github/cxorbia-gate-requests/request.json';
const contractPath='backend/contracts/c6-staff-provider-snapshot-runner-v1.json';
const request=JSON.parse(fs.readFileSync(requestPath,'utf8'));
const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
const run=(...args)=>{const r=spawnSync('git',args,{encoding:'utf8'});if(r.status!==0)throw new Error('git_failed');return String(r.stdout||'').trim();};
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const safe={repositoryWrites:false,dataWrites:false,providerWrites:false,authWrites:false,firestoreWrites:false,rulesWrites:false,storageWrites:false,hrWrites:false,deletes:false,deploy:false,merge:false,production:false,imports:false,payments:false,make:false,gemini:false};

try{
  ensure(contract.contractId==='c6-staff-provider-snapshot-runner-v1','contract_identity');
  ensure(process.env.GITHUB_REPOSITORY===contract.repository,'repository_exact');
  ensure(process.env.GITHUB_EVENT_NAME===contract.providerEvent,'provider_event_exact');
  ensure(request.schemaVersion==='cxorbia.readonly-post-gates-request.v1','request_schema');
  ensure(request.enabled===true&&request.consumed!==true,'request_enabled_unconsumed');
  ensure(request.repository===contract.repository&&request.branch===contract.branch&&Number(request.pullRequest)===Number(contract.pullRequest),'request_route_exact');
  ensure(request.profile===contract.profile,'profile_exact');
  ensure(Array.isArray(request.allowedProfiles)&&request.allowedProfiles.length===1&&request.allowedProfiles[0]===contract.profile,'allowed_profile_exact');
  ensure(Number(request.allowedExecutions)===1,'single_execution');
  ensure(request.providerReads===true,'provider_read_authorized');
  for(const [k,v] of Object.entries(safe))ensure(request.safeState?.[k]===v,`safe_state_${k}`);
  ensure(request.repositoryWrites===false&&request.dataWrites===false&&request.deploy===false&&request.merge===false&&request.production===false,'top_level_safe_state');
  const head=run('rev-parse','HEAD'),parent=run('rev-parse','HEAD^');
  ensure(request.targetHeadSha===parent,'target_head_exact');
  if(request.requestCommitSha!=null)ensure(request.requestCommitSha===head,'request_commit_exact');
  ensure(typeof request.authorizationScope==='string'&&request.authorizationScope.includes('STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY'),'authorization_scope_exact');
  ensure(request.stopRetryOnFailure===true,'stop_retry_required');
  console.log(JSON.stringify({decision:'PASS_C6_STAFF_PROVIDER_SNAPSHOT_REQUEST_GATE',requestId:request.requestId,targetHeadSha:request.targetHeadSha,requestCommitSha:head,profile:request.profile,providerReads:true,writes:false,deploy:false,merge:false,production:false}));
}catch(error){console.log(JSON.stringify({decision:'STOP_RETRY_C6_STAFF_PROVIDER_SNAPSHOT_REQUEST_GATE',errorCode:String(error?.message||error).split(':')[0],providerReads:0,writes:false,deploy:false,merge:false,production:false}));process.exit(2);}
