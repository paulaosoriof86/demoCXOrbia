#!/usr/bin/env node
import fs from 'node:fs';

const mode=process.argv[2]||'snapshot';
const request=JSON.parse(fs.readFileSync('.github/cxorbia-gate-requests/request.json','utf8'));
const out='.tmp/cxorbia-readonly-post-gates-runner/report.json';
fs.mkdirSync('.tmp/cxorbia-readonly-post-gates-runner',{recursive:true});

if(mode==='await-pr'){
  fs.writeFileSync(out,JSON.stringify({status:'PASS_READONLY_POST_GATES',requestId:request.requestId,profile:request.profile,targetHeadSha:request.targetHeadSha,checks:['provider_profile_waits_for_pull_request_event'],blockers:[],summary:{providerObservationExecuted:false,reason:'push_event_not_provider_lane'}},null,2)+'\n');
  process.exit(0);
}
if(mode==='already-consumed'){
  fs.writeFileSync(out,JSON.stringify({status:'PASS_READONLY_POST_GATES',requestId:request.requestId,profile:request.profile,targetHeadSha:request.targetHeadSha,checks:['provider_observation_already_consumed_no_second_observation'],blockers:[],summary:{providerObservationExecuted:false,reason:'durable_consumption_status_present'}},null,2)+'\n');
  process.exit(0);
}
const p='.tmp/c6-staff-repair-bootstrap-provider-snapshot/report.json';
const snapshot=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{decision:'STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE',blockers:[{code:'snapshot_report_missing'}]};
const pass=process.env.SNAPSHOT_CODE==='0'&&snapshot.decision==='PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE';
const blockers=(snapshot.blockers||[]).map(x=>typeof x==='string'?x:(x.code||'source_safe_blocker'));
const report={status:pass?'PASS_READONLY_POST_GATES':'HOLD_READONLY_POST_GATES',requestId:request.requestId,profile:request.profile,targetHeadSha:request.targetHeadSha,checks:pass?['provider_auth_population_228','focal_principals_present','r4_canonical_preserved','owner_bound_A_adjudicated_without_role_uniqueness','A_D_collision_check_complete','write_budget_frozen','rollback_dry_run_pass']:[],blockers,summary:snapshot,safeState:{repositoryWrites:false,dataWrites:false,providerWrites:false,authWrites:false,firestoreWrites:false,rulesWrites:false,storageWrites:false,hrWrites:false,deploy:false,merge:false,production:false}};
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n','utf8');
process.exit(pass?0:2);
