// Same-run Q2 source evidence. This is a test-to-owner mapping, not a release authority.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const SOURCE_OWNER_SUITES=Object.freeze([
  {id:'shopper-keeper-authority',owners:['backend/runtime/cxorbia-shopper-command-provider-v1.mjs'],
    tests:['backend/runtime/hr-live-service/test/cxorbia-shopper-command-provider-v1.test.mjs']},
  {id:'human-project-scope',owners:['app/adapters/tya-c6-unified-human-runtime-v1.js','app/adapters/tya-protected-auth-hr-authority-bridge-v2.js'],
    tests:['tools/qa/cxorbia-i3-human-project-scope.test.mjs']},
  {id:'frontend-behavior',owners:['app/core/programa.js','app/core/ui.js','app/modules/periodos.js','app/modules/configuracion.js','app/modules/cliente-insights.js',
    'app/adapters/cxorbia-command-adapter-v1.js','app/core/backend-bulletins.js','backend/runtime/cxorbia-operational-command-provider-v1.mjs','app/sw.js',
    'backend/runtime/hr-live-service/cxorbia-command-runtime-v1.mjs','backend/runtime/hr-live-service/server.mjs','app/modules/dashboard.js','app/core/notif.js'],
    tests:['tools/qa/cxorbia-i3-g05-writer-receipts.test.cjs','tools/qa/cxorbia-i3-q2-frontend-owner-behavior.test.mjs','tools/qa/cxorbia-i3-e04-benchmark-source.test.mjs',
      'tools/qa/cxorbia-i3-client-collaboration-ui.test.mjs','backend/runtime/hr-live-service/test/cxorbia-client-collaboration-provider.test.mjs','tools/qa/cxorbia-i3-d07-sw-pdf-cross-origin.test.mjs',
      'tools/qa/cxorbia-i3-dashboard-por-asignar-facets.test.mjs','tools/qa/cxorbia-i3-b7-notif-readback-source-20261014.test.mjs','backend/runtime/hr-live-service/test/cxorbia-gate7-operational-assignment.test.mjs']},
  {id:'finance-ack-boundary',owners:['app/core/backend-finance-benefits.js','app/core/backend-cxdata-finance-read.js',
    'app/adapters/cxorbia-cxdata-command-boundary-v1.js','backend/runtime/cxorbia-finance-command-provider-v1.mjs'],
    tests:['backend/runtime/hr-live-service/test/cxorbia-finance-command-provider-v1.test.mjs','tools/qa/cxorbia-i3-b8-historical-command-boundary.test.mjs']},
  {id:'external-hr-source',owners:['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','tools/hr-source/tya-enforce-live-tab-registry.mjs'],
    tests:['tools/hr-source/tya-resolve-live-month-tabs.test.mjs','backend/runtime/hr-live-service/test/cxorbia-vrm134-runtime-latency.test.mjs']}
]);
const SHA=/^[0-9a-f]{40}$/;
const HASH=/^[0-9a-f]{64}$/;
export const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export const sourceQaExpectedIdentity=(env,sourceSha,sourceTree)=>({sourceSha,sourceTree,
  controlSha:env.GITHUB_SHA,runId:Number(env.GITHUB_RUN_ID),
  runAttempt:Number(env.C3_SOURCE_QA_RUN_ATTEMPT)});
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:8*1024*1024}).trim();
const registryHash=()=>sha256(JSON.stringify(SOURCE_OWNER_SUITES));
const fail=code=>{throw new Error('RELEASE_COMPOSITION_FAILURE:SOURCE_QA_'+code);};
export function parseTap(tap){
  const stats={};
  for(const key of ['tests','pass','fail','cancelled','skipped','todo']){
    const matches=[...String(tap).matchAll(new RegExp('^# '+key+' (\\d+)\\s*$','gm'))];
    if(matches.length!==1)fail('TAP_SUMMARY_'+key);
    stats[key]=Number(matches[0][1]);
  }
  return stats;
}
function assertPassed(stats,exitCode){
  if(exitCode!==0||!stats||!Number.isInteger(stats.tests)||stats.tests<=0||stats.pass!==stats.tests||
     stats.fail!==0||stats.cancelled!==0||stats.skipped!==0||stats.todo!==0)fail('TESTS_NOT_ALL_EXECUTED_PASS');
}
export function validateSourceQaReceipt(receipt,{expected,blobAt,treeAt,logBytes}={}){
  if(receipt?.schemaVersion!=='cxorbia.i3.same-run-source-qa.v1'||receipt?.decision!=='PASS_I3_SAME_RUN_PATH_BOUND_SOURCE_QA'||
    receipt.production!==false||receipt.scope!=='SOURCE_QA_ONLY_NOT_E2E_OR_HUMAN_ACCEPTANCE')fail('RECEIPT_SCOPE');
  for(const key of ['sourceSha','sourceTree','controlSha']){
    if(!SHA.test(String(receipt[key]||''))||receipt[key]!==expected?.[key])fail('IDENTITY_'+key);
  }
  if(!Number.isSafeInteger(receipt.runId)||receipt.runId<=0||receipt.runId!==expected.runId||
    !Number.isSafeInteger(receipt.runAttempt)||receipt.runAttempt<=0||
    !Number.isSafeInteger(expected.runAttempt)||expected.runAttempt<=0||receipt.runAttempt!==expected.runAttempt)fail('RUN_IDENTITY');
  if(treeAt(receipt.sourceSha)!==receipt.sourceTree)fail('SOURCE_TREE');
  if(receipt.registrySha256!==registryHash())fail('REGISTRY_MISMATCH');
  if(!Array.isArray(receipt.suites)||receipt.suites.length!==SOURCE_OWNER_SUITES.length)fail('SUITE_COVERAGE');
  const proofs=[];
  for(const suite of SOURCE_OWNER_SUITES){
    const rows=receipt.suites.filter(x=>x.id===suite.id);if(rows.length!==1)fail('SUITE_ID_'+suite.id);
    const row=rows[0];assertPassed(row.stats,row.exitCode);
    if(JSON.stringify(row.owners?.map(x=>x.path))!==JSON.stringify(suite.owners)||
       JSON.stringify(row.tests?.map(x=>x.path))!==JSON.stringify(suite.tests))fail('OWNER_TEST_MAPPING_'+suite.id);
    if(row.logFile!==suite.id+'.tap'||!HASH.test(String(row.logSha256||'')))fail('LOG_IDENTITY');
    const tap=logBytes(row.logFile);
    if(sha256(tap)!==row.logSha256||JSON.stringify(parseTap(tap))!==JSON.stringify(row.stats))fail('LOG_CONTENT');
    for(const entry of row.tests){
      if(!SHA.test(String(entry.gitBlob||''))||blobAt(receipt.controlSha,entry.path)!==entry.gitBlob)fail('TEST_BLOB_'+entry.path);
    }
    for(const entry of row.owners){
      if(!SHA.test(String(entry.gitBlob||''))||blobAt(receipt.sourceSha,entry.path)!==entry.gitBlob||
        blobAt(receipt.controlSha,entry.path)!==entry.gitBlob)fail('OWNER_BLOB_'+entry.path);
      proofs.push({path:entry.path,sourceSha:receipt.sourceSha,sourceTree:receipt.sourceTree,
        runId:receipt.runId,decision:receipt.decision,
        ledgerLocation:'sameRunSourceQa.'+suite.id,
        sameRunEvidence:{controlSha:receipt.controlSha,runAttempt:receipt.runAttempt,suiteId:suite.id,
          ownerGitBlob:entry.gitBlob,logSha256:row.logSha256,scope:receipt.scope}});
    }
  }
  return proofs;
}
export function readSameRunSourceQa(file,expected,digest){
  const bytes=fs.readFileSync(file);
  if(!HASH.test(String(digest||''))||sha256(bytes)!==digest)fail('ARTIFACT_DIGEST');
  return validateSourceQaReceipt(JSON.parse(bytes),{expected,
    blobAt:(ref,p)=>git('rev-parse',ref+':'+p),treeAt:ref=>git('rev-parse',ref+'^{tree}'),
    logBytes:name=>fs.readFileSync(path.join(path.dirname(file),name))}).map(proof=>({...proof,sameRunEvidence:{...proof.sameRunEvidence,receiptSha256:digest}}));
}
export function runSourceQa(){
  const descriptor=JSON.parse(fs.readFileSync(process.env.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'));
  const sourceSha=descriptor.productSourceSha,sourceTree=descriptor.productTreeAuthority,controlSha=git('rev-parse','HEAD');
  const runId=Number(process.env.GITHUB_RUN_ID),runAttempt=Number(process.env.GITHUB_RUN_ATTEMPT||1);
  if(!Number.isSafeInteger(runId)||runId<=0||!Number.isSafeInteger(runAttempt)||runAttempt<=0)fail('GITHUB_RUN_REQUIRED');
  if(process.env.GITHUB_SHA!==controlSha)fail('CONTROL_CHECKOUT');
  if(git('rev-parse',sourceSha+'^{tree}')!==sourceTree)fail('SOURCE_TREE');
  // All product dependencies must be unchanged, not only the registered direct owners.
  execFileSync('git',['diff','--exit-code',sourceSha,'--','app','backend','firebase.json','.firebaserc',
    'firestore.rules','storage.rules','tools/hr-source',':(exclude)backend/runtime/hr-live-service/test/**'],{stdio:'pipe'});
  const out=process.env.SOURCE_QA_OUT||'.tmp/canonical-source-qa';fs.mkdirSync(out,{recursive:true});
  const receipt={schemaVersion:'cxorbia.i3.same-run-source-qa.v1',decision:'PASS_I3_SAME_RUN_PATH_BOUND_SOURCE_QA',
    sourceSha,sourceTree,controlSha,runId,runAttempt,registrySha256:registryHash(),
    scope:'SOURCE_QA_ONLY_NOT_E2E_OR_HUMAN_ACCEPTANCE',production:false,suites:[]};
  for(const suite of SOURCE_OWNER_SUITES){
    const owners=suite.owners.map(p=>({path:p,gitBlob:git('rev-parse',sourceSha+':'+p)}));
    const tests=suite.tests.map(p=>({path:p,gitBlob:git('rev-parse','HEAD:'+p)}));
    for(const item of [...owners,...tests])if(git('hash-object',item.path)!==item.gitBlob)fail('WORKTREE_BYTES_'+item.path);
    const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...suite.tests],{encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
    const tap=String(result.stdout||'');fs.writeFileSync(path.join(out,suite.id+'.tap'),tap);
    if(result.error||result.status!==0){process.stderr.write(String(result.stderr||'')+tap);fail('SUITE_FAILED_'+suite.id);}
    const stats=parseTap(tap);assertPassed(stats,result.status);
    // Reject a test that changed a source or test file while it was executing.
    for(const item of [...owners,...tests])if(git('hash-object',item.path)!==item.gitBlob)fail('POST_TEST_BYTES_'+item.path);
    receipt.suites.push({id:suite.id,owners,tests,exitCode:0,stats,logFile:suite.id+'.tap',logSha256:sha256(tap)});
  }
  const file=path.join(out,'source-qa-receipt.json');fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
  const digest=sha256(fs.readFileSync(file));
  readSameRunSourceQa(file,{sourceSha,sourceTree,controlSha,runId,runAttempt},digest);
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'source_qa_sha256='+digest+'\nsource_qa_run_attempt='+runAttempt+'\n');
  console.log(JSON.stringify({decision:receipt.decision,sourceSha,controlSha,runId,
    ownerCount:receipt.suites.reduce((n,x)=>n+x.owners.length,0),
    testPass:receipt.suites.reduce((n,x)=>n+x.stats.pass,0),testFail:0,receiptSha256:digest,production:false}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))runSourceQa();
