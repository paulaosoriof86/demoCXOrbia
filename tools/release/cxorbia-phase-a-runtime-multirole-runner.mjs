#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const ROOT=process.cwd();
const REQUEST_PATH=process.argv[2]||'.github/cxorbia-gate-requests/request.json';
const PROFILE='PHASE_A_COMPLETE_RUNTIME_MULTIROLE';
const REPORT_DIR=path.join(ROOT,'.tmp/cxorbia-readonly-post-gates-runner');
const REPORT_JSON=path.join(REPORT_DIR,'report.json');
const REPORT_MD=path.join(REPORT_DIR,'report.md');
const RUNTIME_DIR=path.join(ROOT,'.tmp/phase-a-runtime-multirole');
const PRIVATE_PATH=process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS||'.tmp/phase-a-runtime-private/private-e2e.json';
const EXPECTED_SAFE_STATE={
  repositoryWrites:false,dataWrites:false,deploy:false,merge:false,production:false,
  imports:false,payments:false,make:false,gemini:false,firestoreWrites:false,
  authWrites:false,storageWrites:false,hrWrites:false
};
const report={
  schemaVersion:'1.1.0',runner:'CXORBIA_READONLY_POST_GATES_RUNNER',
  generatedAt:new Date().toISOString(),status:'HOLD_NOT_RUN',
  repository:process.env.GITHUB_REPOSITORY||null,branch:process.env.GITHUB_REF_NAME||null,
  requestPath:REQUEST_PATH,requestId:null,requestCommitSha:null,targetHeadSha:null,
  profile:PROFILE,profileDefinition:{browserRequired:true,providerReads:true,
    purpose:'Validate the accumulated Phase A runtime for Staff/Admin, Client and Shopper against the current live HR authority without frozen visit or month invariants.'},
  checks:[],blockers:[],commands:[],artifacts:[],summary:null,
  safeState:{...EXPECTED_SAFE_STATE,providerReads:true}
};

function save(){
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  fs.writeFileSync(REPORT_JSON,JSON.stringify(report,null,2)+'\n','utf8');
  const lines=[
    '# CXOrbia Phase A runtime multi-role gate','',
    `- Status: \`${report.status}\``,`- Request: \`${report.requestId||'n/a'}\``,
    `- Profile: \`${report.profile}\``,`- Request commit: \`${report.requestCommitSha||'n/a'}\``,
    `- Target HEAD: \`${report.targetHeadSha||'n/a'}\``,'- Browser required: `true`','- Provider reads: `true`','',
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
function run(command,args,extraEnv={}){
  report.commands.push([command,...args].join(' '));
  const r=spawnSync(command,args,{cwd:ROOT,encoding:'utf8',env:{...process.env,...extraEnv},maxBuffer:80*1024*1024});
  if(r.status!==0)hold('command_failed',`${command} ${args.join(' ')} :: ${(r.stderr||r.stdout||'').replace(/[^\x20-\x7E\n]/g,'').slice(0,5000)}`);
  return String(r.stdout||'').trim();
}
function readJson(rel){
  const abs=path.join(ROOT,rel);
  check(fs.existsSync(abs),'required_file_present',rel);
  try{return JSON.parse(fs.readFileSync(abs,'utf8'));}catch(e){hold('invalid_json',`${rel}:${e.message}`);}
}
function parseJsonFile(abs,code){
  check(fs.existsSync(abs),code+'_present',path.relative(ROOT,abs));
  try{return JSON.parse(fs.readFileSync(abs,'utf8'));}catch(e){hold(code+'_invalid_json',e.message);}
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
  check(request.repositoryWrites===false&&request.dataWrites===false,'writes_forbidden');
  check(request.deploy===false&&request.merge===false&&request.production===false,'deploy_merge_production_forbidden');
  check(request.providerReads===true,'provider_reads_authorized');
  check(request.devRootUrl==='https://cxorbia-backend-dev.web.app','dev_root_exact');
  check(request.tenantId==='tya'&&request.projectId==='cinepolis','tenant_project_exact');
  check(request.sourceLockDocument==='app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json','source_lock_document_exact');
  check(request.containsPii===false&&request.containsSecrets===false,'request_sanitized');
  check(fs.existsSync(PRIVATE_PATH),'private_credentials_present');

  if(request.diagnosticMode==='client_route_wait'){
    const diagnosticRequestPath=path.join(ROOT,'.tmp/c6-client-route-wait-diagnostic/request.runtime-profile.json');
    fs.mkdirSync(path.dirname(diagnosticRequestPath),{recursive:true});
    fs.writeFileSync(diagnosticRequestPath,JSON.stringify({
      ...request,
      profile:'C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC',
      allowedProfiles:['C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC']
    },null,2)+'\n','utf8');
    run('node',['tools/qa/tya-c6-client-route-wait-diagnostic.mjs',path.relative(ROOT,diagnosticRequestPath)],{
      CXORBIA_DEV_ROOT_URL:request.devRootUrl,
      CXORBIA_E2E_PRIVATE_CREDENTIALS:PRIVATE_PATH
    });
    const diagnostic=parseJsonFile(REPORT_JSON,'client_route_diagnostic_runner');
    check(diagnostic.status==='PASS_READONLY_POST_GATES','client_route_diagnostic_pass',String(diagnostic.status||''));
    check(diagnostic.summary?.classification?.owner==='PRODUCT'||diagnostic.summary?.classification?.owner==='HARNESS'||diagnostic.summary?.classification?.owner==='INCONCLUSIVE','client_route_classification_present');
    Object.assign(report,diagnostic);
    return;
  }

  const scripts=[
    'tools/qa/tya-live-hr-dynamic-authority-gate.mjs',
    'tools/qa/tya-c6-remote-parity-gate.mjs',
    'tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs',
    'tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs'
  ];
  for(const script of scripts){
    check(fs.existsSync(path.join(ROOT,script)),'runtime_script_present',script);
    run('node',['--check',script]);
  }

  fs.mkdirSync(RUNTIME_DIR,{recursive:true});
  const liveAuthorityPath=path.join(RUNTIME_DIR,'live-hr-authority.json');
  const parityPath=path.join(RUNTIME_DIR,'remote-parity.json');
  const humanPath=path.join(RUNTIME_DIR,'human-auth.json');
  const domainPath=path.join(RUNTIME_DIR,'domain-finance-portals-reservations.json');
  const common={
    CXORBIA_DEV_ROOT_URL:request.devRootUrl,
    CXORBIA_E2E_PRIVATE_CREDENTIALS:PRIVATE_PATH
  };

  run('node',['tools/qa/tya-live-hr-dynamic-authority-gate.mjs',request.devRootUrl],{
    ...common,CXORBIA_LIVE_AUTHORITY_OUTPUT:liveAuthorityPath
  });
  const live=parseJsonFile(liveAuthorityPath,'live_authority');
  check(live.decision==='PASS_TYA_LIVE_HR_DYNAMIC_AUTHORITY','live_authority_pass',String(live.decision||''));
  check(Number(live.visits||0)>0&&Number(live.periods||0)>0,'live_authority_non_empty',`${live.periods||0}/${live.visits||0}`);
  check(live.duplicateStableKeys===0&&live.missingStableKeys===0&&live.missingPeriods===0,'live_authority_stable_identity');
  check(live.frozenVisitCountAssumed===false&&live.frozenLatestPeriodAssumed===false,'live_authority_no_frozen_invariants');

  run('node',['tools/qa/tya-c6-remote-parity-gate.mjs',request.devRootUrl],{
    ...common,CXORBIA_REMOTE_PARITY_OUTPUT:parityPath,CXORBIA_REMOTE_PARITY_ATTEMPTS:'3',CXORBIA_REMOTE_PARITY_WAIT_MS:'3000'
  });
  const parity=parseJsonFile(parityPath,'remote_parity');
  check(parity.decision==='PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR','remote_parity_pass',String(parity.decision||''));
  check(parity.allCriticalAssetsMatch===true,'remote_assets_exact');
  check(parity.liveEndpoint?.ok===true,'live_hr_endpoint_ok');

  run('node',['tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs',request.devRootUrl],{
    ...common,CXORBIA_HUMAN_GATE_OUTPUT:humanPath
  });
  const human=parseJsonFile(humanPath,'human_auth');
  check(human.decision==='PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY','human_auth_pass',String(human.decision||''));
  check(human.staff?.reloadsStable===true&&human.staff?.newTabStable===true,'staff_reload_newtab_stable');
  check(human.shopper?.reloadsStable===true&&human.shopper?.newTabStable===true,'shopper_reload_newtab_stable');
  check(Number(human.shopper?.ownVisits||0)>0,'shopper_history_present',String(human.shopper?.ownVisits||0));
  check(human.client?.integratedCredentialRoute===true,'client_integrated_route_ready');
  check(Number(human.staff?.visits||0)===Number(live.visits),'human_live_visit_parity',`${human.staff?.visits||0}/${live.visits}`);
  check(Number(human.staff?.periods||0)===Number(live.periods),'human_live_period_parity',`${human.staff?.periods||0}/${live.periods}`);
  check(human.staff?.latestPeriod===live.latestPeriod,'human_latest_period_dynamic',`${human.staff?.latestPeriod||''}/${live.latestPeriod||''}`);

  run('node',['tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs',request.devRootUrl],{
    ...common,CXORBIA_REMOTE_SEMANTIC_OUTPUT:domainPath
  });
  const domain=parseJsonFile(domainPath,'domain_runtime');
  check(domain.decision==='PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC','domain_runtime_pass',String(domain.decision||''));
  check(domain.client?.authenticated===true&&domain.client?.panoramaVisible===true,'client_portal_authenticated');
  check(domain.shopper?.authenticated===true&&domain.shopper?.exactIdentity===true&&domain.shopper?.fullHistory===true,'shopper_portal_authenticated');
  check(domain.finance?.model==='delegado'&&Number(domain.finance?.royaltyPct||0)===0&&domain.finance?.valuesInvented===false,'finance_delegated_truth');
  check(domain.reservations?.browserLocalStorageAsSource===false&&domain.reservations?.mutationsEnabled===false,'reservations_fail_closed');
  check(Number(domain.source?.visits||0)===Number(live.visits),'domain_live_visit_parity',`${domain.source?.visits||0}/${live.visits}`);
  check(Number(domain.source?.periods||0)===Number(live.periods),'domain_live_period_parity',`${domain.source?.periods||0}/${live.periods}`);
  check(domain.source?.firstPeriod===live.firstPeriod&&domain.source?.latestPeriod===live.latestPeriod,'domain_live_period_range',`${domain.source?.firstPeriod||''}..${domain.source?.latestPeriod||''}`);
  check(domain.latestPeriod?.periodKey===live.latestPeriod,'domain_current_period_is_live_latest',`${domain.latestPeriod?.periodKey||''}/${live.latestPeriod||''}`);

  report.artifacts=[
    '.tmp/phase-a-runtime-multirole/live-hr-authority.json',
    '.tmp/phase-a-runtime-multirole/remote-parity.json',
    '.tmp/phase-a-runtime-multirole/human-auth.json',
    '.tmp/phase-a-runtime-multirole/domain-finance-portals-reservations.json'
  ];
  report.summary={
    status:'PASS_READONLY_POST_GATES',profile:PROFILE,
    devRootUrl:request.devRootUrl,providerReads:true,providerWrites:false,dataWrites:false,
    liveAuthority:{visits:live.visits,shoppers:live.shoppers,periods:live.periods,firstPeriod:live.firstPeriod,latestPeriod:live.latestPeriod,periodCounts:live.periodCounts,frozenVisitCountAssumed:false,frozenLatestPeriodAssumed:false},
    remoteParity:{decision:parity.decision,assets:parity.files?.length||0,liveHrOk:parity.liveEndpoint?.ok===true,revision:parity.liveEndpoint?.revision||live.source?.revision||null},
    staff:{role:human.staff?.role||null,periods:human.staff?.periods||null,visits:human.staff?.visits||null,shoppers:human.staff?.shoppers||null,reloadsStable:true,newTabStable:true},
    client:{authenticated:domain.client?.authenticated===true,projectScope:domain.client?.projectScope||null,panoramaVisible:domain.client?.panoramaVisible===true},
    shopper:{authenticated:domain.shopper?.authenticated===true,exactIdentity:domain.shopper?.exactIdentity===true,ownVisits:domain.shopper?.ownVisits||null,fullHistory:domain.shopper?.fullHistory===true,certificationVisible:domain.shopper?.certificationVisible===true,reloadsStable:true,newTabStable:true},
    finance:domain.finance,reservations:domain.reservations,
    source:domain.source,
    credentialsExposed:false,tokensExposed:false,authWrites:0,firestoreWrites:0,hrWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,merge:false,production:false
  };
  check(run('git',['status','--porcelain'])==='','repository_unchanged_after_gates');
  report.status='PASS_READONLY_POST_GATES';
}

main().catch(error=>{
  if(!report.blockers.length)report.blockers.push(String(error?.message||error));
  report.status='HOLD_READONLY_POST_GATES';
  process.exitCode=1;
}).finally(save);
