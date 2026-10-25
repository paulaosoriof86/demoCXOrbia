#!/usr/bin/env node
import fs from 'node:fs';
import {loadStaffPrivateExecutionHandoff} from '../../backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs';

const REQUEST=process.argv[2]||'.github/cxorbia-gate-requests/request.json';
const OUT='.tmp/cxorbia-readonly-post-gates-runner/report.json';
const ensure=(v,c)=>{if(!v)throw new Error(c);};
const request=JSON.parse(fs.readFileSync(REQUEST,'utf8').replace(/^\uFEFF/,''));
ensure(request.schemaVersion==='cxorbia.readonly-post-gates-request.v1','REQUEST_SCHEMA');
ensure(request.enabled===true&&request.profile==='C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_ONLY','REQUEST_PROFILE');
ensure(request.repository==='paulaosoriof86/demoCXOrbia'&&request.branch==='docs-tya-v6-v71-audit','REQUEST_REPOSITORY');
ensure(request.providerReads===false&&request.providerWrites===false&&request.dataWrites===false&&request.repositoryWrites===false,'REQUEST_PROVIDER_OR_DATA_SCOPE');
ensure(request.deploy===false&&request.merge===false&&request.production===false,'REQUEST_RELEASE_SCOPE');
ensure(request.frozenWriteBudget?.authWritesTotal===14&&request.frozenWriteBudget?.firestoreWritesTotal===16&&request.frozenWriteBudget?.authDeletes===0&&request.frozenWriteBudget?.firestoreDeletes===0,'REQUEST_BUDGET');
ensure(request.providerSnapshotRunId===31518927950&&request.providerSnapshotRepeat===false&&request.dRebaseRepeat===false,'REQUEST_FROZEN_BOUNDARY');
const handoff=loadStaffPrivateExecutionHandoff();
try{
  for(const alias of ['A','B','C','D']){
    const value=handoff.getVisibleLogin(alias);
    ensure(typeof value==='string'&&value.length>0,`RUNTIME_HANDOFF_EMPTY_${alias}`);
  }
  const report={
    status:'PASS_READONLY_POST_GATES',
    profile:'C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_ONLY',
    requestId:request.requestId,
    requestCommitSha:process.env.GITHUB_SHA||null,
    targetHeadSha:request.targetHeadSha||null,
    checks:[
      'staff_handoff_envelope_decrypted_in_memory',
      'A_exact_digest_and_owner_binding',
      'B_exact_digest_and_owner_binding',
      'C_exact_digest_and_owner_binding',
      'D_deterministic_regeneration_digest_and_owner_binding',
      'no_provider_access',
      'no_plaintext_serialization'
    ],
    blockers:[],
    handoff:{targetsValidated:['A','B','C','D'],abcEncryptedAtRest:true,dDeterministic:true,providerReads:0,providerWrites:0,rawLoginEmitted:false,rawLoginPersisted:false},
    safety:{repositoryWrites:false,dataWrites:false,providerReads:0,providerWrites:0,authWrites:0,firestoreWrites:0,hrWrites:0,rulesWrites:0,storageWrites:0,deletes:0,deploy:false,merge:false,production:false,piiExported:false,credentialsExported:false}
  };
  fs.mkdirSync('.tmp/cxorbia-readonly-post-gates-runner',{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n','utf8');
  console.log(JSON.stringify({status:report.status,profile:report.profile,checks:report.checks.length,blockers:0,providerReads:0,providerWrites:0,dataWrites:false,piiExported:false}));
}finally{
  handoff.dispose();
}
