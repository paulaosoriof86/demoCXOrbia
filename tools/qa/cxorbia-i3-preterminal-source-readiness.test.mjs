import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assessPreterminalSourceReadiness as assess} from './cxorbia-i3-preterminal-source-readiness.mjs';
import {collectPathBoundLedgerSourceProofs} from './cxorbia-i3-c3-ledger-source-proofs.mjs';

const sample=()=>{
  const modules=Array.from({length:21},(_,i)=>({
    domain:'domain-'+i,
    classification:i<5?'MATCH':'PENDING_AUTHENTICATED_E2E',
    currentOwnerProofStatus:'PATH_BOUND_OWNER_PROVEN',
    pendingTerminalFiles:[]
  }));
  const sourceFiles=modules.map(m=>({
    domain:m.domain,path:'app/owner-'+m.domain+'.js',
    phaseAAuthority:true,classification:'MATCH',provenanceIndependent:true,
    currentBlob:'abc',approvedBlob:'abc'
  }));
  return {modules,sourceFiles};
};

test('21 source-ready domains can enter terminal E2E while 16 remain uncertified',()=>{
  const s=sample(),before=s.modules.map(x=>x.classification);
  const result=assess(s);
  assert.equal(result.terminalEligible,true);
  assert.equal(result.sourceReadyModuleCount,21);
  assert.equal(s.modules.filter(x=>x.classification==='MATCH').length,5);
  assert.deepEqual(s.modules.map(x=>x.classification),before);
});
test('unproven current owner cannot be source-ready',()=>{
  const s=sample();s.sourceFiles[10].provenanceIndependent=false;
  const result=assess(s);
  assert.equal(result.terminalEligible,false);
  assert.equal(result.sourceReadyModuleCount,20);
});
test('missing approval, unmapped owner or blob provenance blocks terminal',()=>{
  const s=sample();
  for(const variant of [
    {...s,pendingMappingApprovalFiles:['app/unmapped.js']},
    {...s,pendingBlobProvenanceFiles:[{path:'app/unproven.js'}]},
    {...s,sourceFiles:[...s.sourceFiles,{path:'app/unapproved.js',domain:'domain-0',phaseAAuthority:'TASK_REFERENCED'}]}
  ])assert.equal(assess(variant).terminalEligible,false);
});
test('duplicate domains and duplicate loaded owners block terminal',()=>{
  const s=sample();
  assert.equal(assess({...s,modules:[s.modules[0],...s.modules.slice(0,20)]}).terminalEligible,false);
  assert.equal(assess({...s,sourceFiles:[...s.sourceFiles,s.sourceFiles[0]]}).terminalEligible,false);
});
test('a historically MATCH domain without active owner remains source-ready',()=>{
  const s=sample();
  s.sourceFiles=s.sourceFiles.filter(x=>x.domain!=='domain-0');
  const r=assess(s);
  assert.equal(r.terminalEligible,true);
  assert.equal(r.sourceReadyModuleCount,21);
});

test('the terminal workflow uses current source-ready proof, never the old 21-MATCH prerequisite',()=>{
  const wf=readFileSync(new URL('../../.github/workflows/cxorbia-recovery-i3-dev-certification.yml',import.meta.url),'utf8');
  const pre=wf.split('  c3-preterminal-module-truth:')[1]?.split('  vrm043-name-diagnostic:')[0]||'';
  const terminal=wf.split('  certify:')[1]?.split('  live-fixtures:')[0]||'';
  assert.match(pre,/terminal_ready:.*c3_gate/);
  assert.match(pre,/PASS_C3_PRETERMINAL_SOURCE_READY_EXACT_DEV/);
  assert.match(terminal,/needs: \[canonical-candidate-authority, c3-preterminal-module-truth\]/);
  assert.match(terminal,/PRETERM_RUN_ID="\$GITHUB_RUN_ID"/);
  assert.match(terminal,/sourceReadyModules.*"21"/);
  assert.doesNotMatch(terminal,/lastModuleTruthProof/);
  assert.doesNotMatch(terminal,/matchModules.*"21"/);
});

const PROOF_SHA='a'.repeat(40),PROOF_TREE='b'.repeat(40),PROOF_OWNER='app/modules/cliente-insights.js';
const validScopedProof={owners:[PROOF_OWNER],sourceSha:PROOF_SHA,production:false,state:'F12_DEV_PENDING_HUMAN',
  sourceProof:{sourceSha:PROOF_SHA,sourceTree:PROOF_TREE,runId:39095029741,
    decision:'PASS_I3_B_CUMULATIVE_SOURCE_PROOF',f12Tests:{pass:2,fail:0},production:false}};

test('C3 recovers exact-owner source proof without promoting pending human acceptance',()=>{
  assert.deepEqual(collectPathBoundLedgerSourceProofs({executionUpdateE04F12:validScopedProof}),[{
    path:PROOF_OWNER,sourceSha:PROOF_SHA,sourceTree:PROOF_TREE,runId:39095029741,
    decision:'PASS_I3_B_CUMULATIVE_SOURCE_PROOF',ledgerLocation:'executionUpdateE04F12'
  }]);
});

test('C3 recognizes Academy source-count QA only within its explicit owner scope',()=>{
  const academy={...validScopedProof,owners:['backend/runtime/cxorbia-academy-command-provider-v1.mjs'],
    sourceProof:{...validScopedProof.sourceProof,runId:42420173152,sourceTestsPass:27,sourceTestsFail:0,f12Tests:undefined}};
  const proofs=collectPathBoundLedgerSourceProofs({currentRemediationCandidate:academy});
  assert.equal(proofs.length,1);
  assert.equal(proofs[0].runId,42420173152);
});

test('C3 preserves exact QA receipt file and Git blob binding for scoped Q2 evidence',()=>{
  const q2={...validScopedProof,sourceProof:{...validScopedProof.sourceProof,
    evidencePath:'docs/checkpoints/exact-source-qa.json',evidenceGitBlob:'d'.repeat(40)}};
  const [proof]=collectPathBoundLedgerSourceProofs({q2});
  assert.equal(proof.evidencePath,'docs/checkpoints/exact-source-qa.json');
  assert.equal(proof.evidenceGitBlob,'d'.repeat(40));
  assert.equal(proof.ledgerLocation,'q2');
});

test('C3 rejects mere green status, failing QA, wrong source, production proof and unowned paths',()=>{
  const bad={
    noReceipt:{owners:[PROOF_OWNER],sourceSha:PROOF_SHA,state:'PASS',production:false},
    differentSource:{...validScopedProof,sourceSha:'c'.repeat(40)},
    failedTests:{...validScopedProof,sourceProof:{...validScopedProof.sourceProof,f12Tests:{pass:2,fail:1}}},
    noJob:{...validScopedProof,sourceProof:{...validScopedProof.sourceProof,runId:null}},
    production:{...validScopedProof,production:true},
    noExactOwner:{...validScopedProof,owners:['app/modules/another.js']}
  };
  assert.deepEqual(collectPathBoundLedgerSourceProofs(bad).filter(x=>x.path===PROOF_OWNER),[]);
});

test('C3 preserves cumulative independent F12 and D08 receipts across control versions',()=>{
  const descriptor=JSON.parse(readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
  const ledger=JSON.parse(readFileSync(descriptor.findingsLedgerPath,'utf8'));
  const proofs=collectPathBoundLedgerSourceProofs(ledger);
  assert.ok(proofs.some(x=>x.path===PROOF_OWNER&&x.runId===39095029741&&x.ledgerLocation==='executionUpdateE04F12'));
  assert.ok(proofs.some(x=>x.path==='backend/runtime/cxorbia-academy-command-provider-v1.mjs'&&x.runId===42420173152));
  assert.ok(proofs.some(x=>x.path==='backend/contracts/cxorbia-academy-base-progress-contract-v1.json'&&x.runId===42420173152));
  const q2=proofs.filter(x=>x.ledgerLocation.startsWith('q2ScopedSourceProofRecovery20261112.proofs.'));
  assert.equal(q2.length,6);
  assert.ok(q2.every(x=>x.evidencePath&&/^[a-f0-9]{40}$/.test(x.evidenceGitBlob)));
});
