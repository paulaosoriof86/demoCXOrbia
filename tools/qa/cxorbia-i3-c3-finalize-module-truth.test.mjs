import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateTerminalModuleTruth} from './cxorbia-i3-c3-finalize-module-truth.mjs';
import {validReadonlyReceipt} from './cxorbia-i3-tenant-readonly-acceptance.test.mjs';
const d=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const matrix=JSON.parse(fs.readFileSync(d.moduleTruthPath,'utf8'));
function fixture(){
  const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'dev',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'host'};
  const modules=structuredClone(matrix.modules).map(m=>({...m,classification:['tenant-admin-config-branding','benefits'].includes(m.domain)?'PENDING':'MATCH',pendingTerminalFiles:[]}));
  const findings=Object.fromEntries(['033','034','035','036','037','038','039','040','041','042'].map(n=>['VRM-'+n,{state:'FIXED_PROVEN'}]));
  findings['VRM-194']={severity:'P0',state:'PENDING_REPROOF',owners:modules.find(m=>m.domain==='tenant-admin-config-branding').owners};
  findings['VRM-330']={priority:'P0_PROVEN',state:'PENDING_REPROOF',owner:findings['VRM-194'].owners};
  const receipt={...validReadonlyReceipt(),...identity};
  return {pre:{productSource:{sha:identity.sourceSha,treeSha:identity.sourceTree},preTerminalComposition:{decision:'PASS_C3_PRETERMINAL_COMPOSITION',moduleCount:21,pendingMappingApprovalFiles:[]},modules,sourceFiles:[]},
    ledger:{findings},identity,additionalReceipts:[receipt]};
}
test('valid domain progress persists while another domain and global gates remain HOLD',()=>{
  const r=evaluateTerminalModuleTruth(fixture());
  assert.equal(r.modules.find(x=>x.domain==='tenant-admin-config-branding').classification,'MATCH');
  assert.equal(r.terminalClosure.matchModules,20);assert.equal(r.phaseAComplete,false);assert.equal(r.allModulesMatch,false);
  assert.equal(r.terminalClosure.status,'HOLD');assert.ok(r.terminalClosure.failures.includes('C3_FULL_HUMAN_ACCEPTANCE'));
});
test('an old source receipt is retained as history without blocking valid current receipt',()=>{
  const x=fixture();x.additionalReceipts.unshift({...x.additionalReceipts[0],sourceSha:'d'.repeat(40)});
  const r=evaluateTerminalModuleTruth(x);assert.equal(r.terminalClosure.matchModules,20);assert.equal(r.terminalClosure.historicalReceipts.length,1);
});
test('one owner cannot certify a domain with three owners even when pendingTerminalFiles is empty',()=>{
  const x=fixture();x.additionalReceipts[0].ownerPaths=[x.additionalReceipts[0].ownerPaths[0]];
  assert.equal(evaluateTerminalModuleTruth(x).terminalClosure.matchModules,19);
});
test('priority P0_PROVEN is a blocker even without severity property',()=>{
  const x=fixture();x.additionalReceipts=[];const r=evaluateTerminalModuleTruth(x);
  assert.ok(r.terminalClosure.unresolvedP0.some(f=>f.id==='VRM-330'));
});
test('readonly proof does not bypass a real enabled write branch',()=>{
  const x=fixture();x.additionalReceipts[0].readOnlyProof.commandWritesEnabled=true;
  const r=evaluateTerminalModuleTruth(x);assert.equal(r.terminalClosure.matchModules,19);
  assert.ok(r.terminalClosure.rejectedReceipts[0].reasons.includes('READONLY_PROJECT_COUNTRY_WRITE_BRANCH_REQUIRES_SEPARATE_EVIDENCE'));
});
test('diagnostic supersession is not proof of P0 closure',()=>{
  const x=fixture();x.ledger.findings['VRM-240']={severity:'P0',state:'SUPERSEDED_BY_DIAGNOSTIC_VRM241'};
  assert.ok(evaluateTerminalModuleTruth(x).terminalClosure.unresolvedP0.some(f=>f.id==='VRM-240'));
});
test('source identity corruption still aborts before any progress promotion',()=>{
  const x=fixture();x.pre.productSource.sha='e'.repeat(40);
  assert.throws(()=>evaluateTerminalModuleTruth(x),/C3_PRETERMINAL_RECEIPT/);
});
test('missing HR revision in PASS-shaped proofs cannot produce global GO',()=>{
  const x=fixture();x.pre.modules.forEach(m=>m.classification='MATCH');x.additionalReceipts=[];
  Object.values(x.ledger.findings).forEach(f=>f.state='FIXED_PROVEN');
  x.human={decision:'PASS_I3_HUMAN_LIVE_ACCEPTANCE',sourceSha:x.identity.sourceSha};
  x.focal={decision:'PASS_PRE_I4_FOCAL_HUMAN_BROWSER',sourceSha:x.identity.sourceSha};
  x.qa={decision:'PASS_C3_QA_RESERVATION_CLEANUP',after:0};x.parity={decision:'PASS_C3_PENDING_OWNER_BYTE_PARITY',mismatches:0};
  const r=evaluateTerminalModuleTruth(x);assert.equal(r.phaseAComplete,false);assert.ok(r.terminalClosure.failures.includes('C3_HR_REVISION_MISSING'));
});
