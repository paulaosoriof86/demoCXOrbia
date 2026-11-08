import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertCanonicalModuleCoverage,assertAllModulesAccepted} from './cxorbia-i3-terminal-module-domain-coverage.mjs';

const d=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
const current=JSON.parse(fs.readFileSync(d.moduleTruthPath,'utf8'));
const modules=current.modules;

test('C3 21-domain inventory is canonical, unique and exact (historical 20 + branding)',()=>{
  const c=assertCanonicalModuleCoverage(modules);
  assert.equal(c.moduleCount,21);
  assert.ok(c.domains.includes('tenant-admin-config-branding'));
  assert.throws(()=>assertCanonicalModuleCoverage(modules.slice(0,20)),/C3_CANONICAL_21_DOMAIN_SET/);
  assert.throws(()=>assertCanonicalModuleCoverage([...modules.slice(0,20),modules[0]]),/C3_CANONICAL_21_DOMAIN_SET/);
  assert.throws(()=>assertCanonicalModuleCoverage([...modules.slice(0,20),{domain:'other',classification:'MATCH'}]),/C3_CANONICAL_21_DOMAIN_SET/);
});
test('C3 never upgrades a pending domain from file-byte parity or an historical 20/20 receipt',()=>{
  const pending=modules.filter(x=>x.classification!=='MATCH');
  if(pending.length)assert.throws(()=>assertAllModulesAccepted(modules),/C3_UNCERTIFIED_MODULES/);
  const accepted=modules.map(m=>({...m,classification:'MATCH'}));
  assert.doesNotThrow(()=>assertAllModulesAccepted(accepted));
  assert.deepEqual(modules.map(x=>x.classification),current.modules.map(x=>x.classification));
});
test('Current matrix product authority equals the descriptor; previous terminal 20/20 is not current 21/21',()=>{
  assert.equal(current.productSource.sha,d.productSourceSha);
  assert.equal(current.productSource.treeSha,d.productTreeAuthority);
  if(d.lastModuleTruthProof?.moduleCount!==21)assert.notEqual(d.lastModuleTruthProof?.sourceSha,d.productSourceSha);
});

test('Terminal jobs and Gate21 require the same 21-domain contract, never legacy 20',()=>{
  const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const gate21=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-gate21-artifact-fingerprint.yml','utf8');
  const start=workflow.indexOf('\n  c3-preterminal-module-truth:');
  const preEnd=workflow.indexOf('\n  vrm043-name-diagnostic:',start);
  const certStart=workflow.indexOf('\n  certify:',preEnd);
  const end=workflow.indexOf('\n  live-fixtures:',certStart);
  assert.ok(start>0&&preEnd>start&&certStart>preEnd&&end>certStart);
  const terminal=workflow.slice(start,preEnd)+'\n'+workflow.slice(certStart,end);
  assert.doesNotMatch(terminal,/MODULE_TRUTH_20_20|moduleCount:20|matchModules:20|MATRIX-20260918/);
  assert.match(terminal,/CANDIDATE_DESCRIPTOR.*READY_FOR_TERMINAL_CERTIFICATION|READY_FOR_TERMINAL_CERTIFICATION/);
  assert.match(terminal,/moduleTruthPath/);
  assert.match(terminal,/PASS_C3_TERMINAL_MODULE_TRUTH_21_21/);
  assert.match(terminal,/cxorbia-i3-terminal-module-domain-coverage\.mjs/);
  const currentCertify=workflow.slice(certStart,end);
  assert.doesNotMatch(currentCertify,/POST_RUN500_LEDGER/);
  assert.match(currentCertify,/findingsLedgerPath/);
  assert.match(workflow,/\n  vrm076-terminal-module-truth-finalizer:/);
  assert.doesNotMatch(gate21,/MODULE_TRUTH_20_20|moduleCount:20/);
  assert.match(gate21,/cxorbia-i3-terminal-module-domain-coverage\.mjs/);
});
