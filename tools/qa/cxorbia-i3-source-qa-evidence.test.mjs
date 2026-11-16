import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SOURCE_OWNER_SUITES,sha256,parseTap,validateSourceQaReceipt,readSameRunSourceQa,sourceQaExpectedIdentity} from './cxorbia-i3-source-qa-evidence.mjs';
import {buildC3Result} from './cxorbia-i3-c3-preterminal-result.mjs';

// Synthetic validator fixtures: never execution receipts or release authority.
const fixture=()=>{
  const expected={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),controlSha:'c'.repeat(40),runId:123,runAttempt:1};
  const tap='TAP version 13\nok 1 - synthetic validator fixture\n1..1\n# tests 1\n# pass 1\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
  const blob='d'.repeat(40),logs={};
  const receipt={schemaVersion:'cxorbia.i3.same-run-source-qa.v1',decision:'PASS_I3_SAME_RUN_PATH_BOUND_SOURCE_QA',
    ...expected,registrySha256:sha256(JSON.stringify(SOURCE_OWNER_SUITES)),production:false,
    scope:'SOURCE_QA_ONLY_NOT_E2E_OR_HUMAN_ACCEPTANCE',suites:SOURCE_OWNER_SUITES.map(s=>{
      logs[s.id+'.tap']=tap;
      return {id:s.id,owners:s.owners.map(path=>({path,gitBlob:blob})),tests:s.tests.map(path=>({path,gitBlob:blob})),
        exitCode:0,stats:parseTap(tap),logFile:s.id+'.tap',logSha256:sha256(tap)};
    })};
  const context={expected,blobAt:()=>blob,treeAt:()=>expected.sourceTree,logBytes:name=>logs[name]};
  return {receipt,context,logs};
};
test('same-run proof returns every registered owner without functional acceptance',()=>{
  const {receipt,context}=fixture(),proofs=validateSourceQaReceipt(receipt,context);
  assert.deepEqual(proofs.map(x=>x.path),SOURCE_OWNER_SUITES.flatMap(x=>x.owners));
  assert.equal(new Set(proofs.map(x=>x.path)).size,20);
  for(const proof of proofs){assert.equal(proof.sameRunEvidence.controlSha,receipt.controlSha);
    assert.equal(proof.sameRunEvidence.scope,'SOURCE_QA_ONLY_NOT_E2E_OR_HUMAN_ACCEPTANCE');
    assert.equal(proof.classification,undefined);assert.equal(proof.humanAcceptance,undefined);}
});
for(const key of ['sourceSha','sourceTree','controlSha','runId','runAttempt'])test('rejects a different '+key,()=>{
  const x=fixture();x.receipt[key]=typeof x.receipt[key]==='number'?999:'e'.repeat(40);
  assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context));
});
test('missing attempt is rejected even if both receipt and expectation omit it',()=>{
  const x=fixture();delete x.receipt.runAttempt;delete x.context.expected.runAttempt;
  assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context),/RUN_IDENTITY/);
});
test('a failed-only consumer retry reuses the exact successful producer attempt',()=>{
  const x=fixture();
  const env={GITHUB_SHA:x.receipt.controlSha,GITHUB_RUN_ID:String(x.receipt.runId),
    GITHUB_RUN_ATTEMPT:'2',C3_SOURCE_QA_RUN_ATTEMPT:'1'};
  x.context.expected=sourceQaExpectedIdentity(env,x.receipt.sourceSha,x.receipt.sourceTree);
  assert.equal(validateSourceQaReceipt(x.receipt,x.context).length,20);
  x.receipt.runAttempt=2;assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context),/RUN_IDENTITY/);
  for(const bad of [undefined,'0','invalid']){
    const y=fixture();y.context.expected=sourceQaExpectedIdentity({...env,C3_SOURCE_QA_RUN_ATTEMPT:bad},y.receipt.sourceSha,y.receipt.sourceTree);
    assert.throws(()=>validateSourceQaReceipt(y.receipt,y.context),/RUN_IDENTITY/);
  }
});
for(const kind of ['owner','test'])test('rejects modified '+kind+' blob',()=>{
  const x=fixture();x.receipt.suites[0][kind==='owner'?'owners':'tests'][0].gitBlob='e'.repeat(40);
  assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context),/BLOB_/);
});
for(const kind of ['missing','duplicate','foreign-owner','foreign-test','registry'])test('rejects '+kind+' coverage',()=>{
  const x=fixture();
  if(kind==='missing')x.receipt.suites.pop();
  if(kind==='duplicate')x.receipt.suites[1]=x.receipt.suites[0];
  if(kind==='foreign-owner')x.receipt.suites[0].owners[0].path='app/foreign.js';
  if(kind==='foreign-test')x.receipt.suites[0].tests[0].path='tools/foreign.test.mjs';
  if(kind==='registry')x.receipt.registrySha256='f'.repeat(64);
  assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context));
});
for(const kind of ['exit','zero','fail','cancelled','skipped','todo','summary','log','hash'])test('rejects invalid test evidence '+kind,()=>{
  const x=fixture(),s=x.receipt.suites[0];
  if(kind==='exit')s.exitCode=1;
  if(kind==='zero'){s.stats.tests=0;s.stats.pass=0;}
  if(['fail','cancelled','skipped','todo'].includes(kind))s.stats[kind]=1;
  if(kind==='summary'){s.stats.tests=2;s.stats.pass=2;}
  if(kind==='log')x.logs[s.logFile]+='# altered\n';
  if(kind==='hash')s.logSha256='0'.repeat(64);
  assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context));
});
for(const kind of ['production','scope'])test('rejects altered '+kind,()=>{
  const x=fixture();x.receipt[kind]=kind==='production'?true:'FUNCTIONAL_E2E';
  assert.throws(()=>validateSourceQaReceipt(x.receipt,x.context),/RECEIPT_SCOPE/);
});
test('rejects a digest mismatch before looking up source blobs',()=>{
  assert.throws(()=>readSameRunSourceQa(import.meta.filename,{},'0'.repeat(64)),/ARTIFACT_DIGEST/);
});
test('workflow carries the same-run receipt through both C3 invocations',()=>{
  const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const canonical=workflow.split('  canonical-candidate-authority:')[1].split('  vrm143-151-source-reproof:')[0];
  const c3=workflow.split('  c3-preterminal-module-truth:')[1].split('  vrm043-name-diagnostic:')[0];
  const terminal=workflow.split('  certify:')[1].split('\n  gate20:')[0];
  assert.match(canonical,/node tools\/qa\/cxorbia-i3-source-qa-evidence\.mjs/);
  assert.match(canonical,/name: cxorbia-i3-source-qa-\$\{\{ github.run_id \}\}/);
  assert.match(c3,/uses: actions\/download-artifact@v4/);
  assert.match(c3,/name: cxorbia-i3-source-qa-\$\{\{ github.run_id \}\}/);
  for(const section of [c3,terminal]){
    assert.match(section,/C3_SOURCE_QA_REQUIRED: 'true'/);
    assert.match(section,/C3_SOURCE_QA_SHA256: \$\{\{ needs.canonical-candidate-authority.outputs.source_qa_sha256 \}\}/);
    assert.match(section,/C3_SOURCE_QA_RUN_ATTEMPT: \$\{\{ needs.canonical-candidate-authority.outputs.source_qa_run_attempt \}\}/);
  }
  assert.match(canonical,/source_qa_run_attempt: \$\{\{ steps.source_qa.outputs.source_qa_run_attempt \}\}/);
  assert.match(c3,/artifact_name: \$\{\{ steps.c3_gate.outputs.artifact_name \}\}/);
  assert.match(terminal,/PRETERM_ARTIFACT="\$\{\{ needs.c3-preterminal-module-truth.outputs.artifact_name \}\}"/);
  assert.match(terminal,/cp -R "\$PRIOR\/source-qa" "\$OUT\/source-qa"/);
  assert.match(terminal,/C3_SOURCE_QA_RECEIPT=\$OUT\/source-qa\/source-qa-receipt.json/);
  assert.match(terminal,/needs.c3-preterminal-module-truth.outputs.terminal_ready=='true'/);
});

const resultFixture=()=>{
  const domains=JSON.parse(fs.readFileSync('CXORBIA_CANONICAL_MODULE_REGISTRY_2026-09-18.json')).modules.map(x=>x.domain);
  domains.push('tenant-admin-config-branding');
  const matrix={productSource:{sha:'source',treeSha:'tree'},
    entrypointClosure:{allApprovedOwnersLoaded:true,duplicateSrc:[]},
    modules:domains.map((domain,i)=>({domain,classification:i<4?'MATCH':'PENDING_FUNCTIONAL_E2E',
      currentOwnerProofStatus:'PATH_BOUND_OWNER_PROVEN',pendingTerminalFiles:[]})),
    sourceFiles:domains.map((domain,i)=>({domain,path:'app/fixture-'+i+'.js',phaseAAuthority:true,
      classification:'MATCH',provenanceIndependent:true,currentBlob:'same',approvedBlob:'same'})),
    preTerminalComposition:{decision:'PASS_C3_PRETERMINAL_COMPOSITION',sourceReadyModuleCount:21,
      pendingFileCount:0,terminalEligible:true,unauthorizedFileCount:0}};
  return {matrix,sourceSha:'source',sourceTree:'tree',inputAuthorityStatus:'OLD_STATUS'};
};
test('computed 21/21 source evidence enables the next job without changing four integral MATCH',()=>{
  const input=resultFixture(),r=buildC3Result(input);
  assert.equal(r.sourceReadyModules,21);assert.equal(r.pendingFiles,0);assert.equal(r.terminalEligible,true);
  assert.equal(r.enabledNextBlock,'I3-Q3');assert.equal(r.enabledJob,'certify');
  assert.equal(r.matchModules,4);assert.equal(r.nonMatchModules,17);assert.equal(r.production,false);
  assert.equal(r.status,'READY_FOR_TERMINAL_CERTIFICATION');assert.equal(r.inputAuthorityStatus,'OLD_STATUS');
  assert.equal(input.matrix.modules.filter(x=>x.classification==='MATCH').length,4);
});
test('one missing source proof keeps the consumer disabled and rejects a stale optimistic counter',()=>{
  const input=resultFixture();input.matrix.sourceFiles[20].classification='PENDING_BLOB_PROVENANCE_SERVED';
  assert.throws(()=>buildC3Result(input),/COUNTER_DRIFT/);
  Object.assign(input.matrix.preTerminalComposition,{sourceReadyModuleCount:20,pendingFileCount:1,terminalEligible:false});
  const r=buildC3Result(input);assert.equal(r.enabledJob,null);assert.equal(r.enabledNextBlock,null);
  assert.equal(r.terminalEligible,false);assert.equal(r.matchModules,4);
});
