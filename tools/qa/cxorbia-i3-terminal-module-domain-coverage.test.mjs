import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
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
test('B4-B6 prior functional PASS stays visible without fabricating 21-domain MATCH',()=>{
  const a=current.functionalBlockCertificationAccounting20261110;
  assert.ok(a,'B4_B5_B6_ACCOUNTING_MISSING_FROM_CURRENT_CANONICAL_MATRIX');
  const receipt=JSON.parse(fs.readFileSync(a.source,'utf8'));
  const acceptedBlocks=Object.values(receipt.blocks).filter(x=>x.blockFunctionalLocked===true);
  const domainMatches=modules.filter(x=>x.classification==='MATCH');
  assert.equal(a.functionalBlockPassCount,acceptedBlocks.length);
  assert.equal(a.functionalBlockPassCount,a.certifiedFunctionalBlocks.length);
  assert.deepEqual(a.certifiedFunctionalBlocks.slice().sort(),[
    'B4_CERTIFICACIONES','B5_BENEFICIOS','B6_DASHBOARD_VISITAS_DETALLE'
  ].sort());
  assert.equal(a.domainMatchCount,domainMatches.length);
  assert.equal(a.domainPendingCount,modules.length-domainMatches.length);
  assert.equal(a.domainCount,21);
  assert.equal(a.falsePromotionForbidden,true);
  assert.equal(a.currentProductSourceSha,d.productSourceSha);
  const expectedOwners={
    certifications:'app/modules/academia.js',
    benefits:'app/modules/beneficios.js',
    'dashboard-operation':'app/modules/midia.js'
  };
  for(const [domain,owner] of Object.entries(expectedOwners)){
    const m=modules.find(x=>x.domain===domain);
    assert.ok(m?.owners.includes(owner),`FROZEN_OWNER_MISSING:${domain}:${owner}`);
    assert.equal(a.affectedDomainCrosswalk[domain].domainStatus,m.classification);
    assert.equal(a.affectedDomainCrosswalk[domain].blockFunctionalCertified,true);
  }
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

test('C3 preterminal can audit the HOLD candidate without pretending it is 21/21 certified',()=>{
  const pre=fs.readFileSync('tools/qa/cxorbia-i3-c3-preterminal-module-truth.mjs','utf8');
  const final=fs.readFileSync('tools/qa/cxorbia-i3-c3-finalize-module-truth.mjs','utf8');
  const workflow=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const start=workflow.indexOf('\n  c3-preterminal-module-truth:');
  const end=workflow.indexOf('\n  vrm043-name-diagnostic:',start);
  assert.ok(start>0&&end>start);
  const job=workflow.slice(start,end);
  assert.doesNotMatch(pre,/assertAllModulesAccepted/);
  assert.doesNotMatch(pre,/C3_UNACCEPTED_SOURCE_FILES/);
  assert.match(pre,/PENDING_OWNER_PROOF_SERVED/);
  assert.match(pre,/PENDING_BLOB_PROVENANCE_SERVED/);
  assert.match(pre,/HISTORICAL_PROVEN_FINDING_WITHOUT_CURRENT_PATH_BOUND_BLOB/);
  assert.match(pre,/PENDING_INDEPENDENT_APPROVAL_MAPPING/);
  assert.match(pre,/PRESERVED_NON_AUTHORITY/);
  assert.match(pre,/historicalMatchPreserved/);
  assert.match(pre,/terminalEligible:/);
  assert.match(job,/HOLD_C3_PRETERMINAL_MODULE_TRUTH_EVIDENCE_PENDING/);
  assert.match(job,/C3_AUTH_STATUS/);
  assert.match(final,/C3_PENDING_SOURCE_APPROVAL_MAPPING/);
  assert.match(final,/if\(cls==='MATCH'&&!pending\.length\)continue/);
  assert.match(final,/C3_OWNER_RECEIPT_MISSING/);
  assert.match(final,/C3_OPEN_P0_FINDINGS/);
  assert.equal(assertCanonicalModuleCoverage(modules).moduleCount,21);
  assert.ok(modules.some(x=>x.classification!=='MATCH'));
});

test('C3 finalizer preserves historical MATCH but cannot skip missing current-owner receipts',()=>{
  const dir=fs.mkdtempSync(join(tmpdir(),'cxorbia-c3-preserve-'));
  try{
    const source='a'.repeat(40),tree='b'.repeat(40),hr='c'.repeat(64);
    const runtime='test-runtime',digest='sha256:'+'d'.repeat(64),hosting='sites/test/versions/1';
    const write=(name,value)=>{const p=join(dir,name+'.json');fs.writeFileSync(p,JSON.stringify(value));return p;};
    const historicPath='app/modules/historico.js';
    const pre=write('pre',{
      productSource:{sha:source,treeSha:tree},
      preTerminalComposition:{decision:'PASS_C3_PRETERMINAL_COMPOSITION',moduleCount:21,pendingMappingApprovalFiles:[]},
      modules:modules.map(m=>({...m,classification:'MATCH',pendingTerminalFiles:m.domain==='historical'?[historicPath]:[]})),
      sourceFiles:[{path:historicPath,domain:'historical',classification:'PENDING_BLOB_PROVENANCE_SERVED'}]
    });
    const focal=write('focal',{decision:'PASS_PRE_I4_FOCAL_HUMAN_BROWSER',sourceSha:source,hrRevision:hr});
    const human=write('human',{decision:'PASS_I3_HUMAN_LIVE_ACCEPTANCE',sourceSha:source,sourceRevision:hr});
    const qa=write('qa',{decision:'PASS_C3_QA_RESERVATION_CLEANUP',after:0});
    const parity=write('parity',{decision:'PASS_C3_PENDING_OWNER_BYTE_PARITY',mismatches:0});
    const findings=Object.fromEntries(['VRM-033','VRM-034','VRM-035','VRM-036','VRM-037','VRM-038','VRM-039','VRM-040','VRM-041','VRM-042'].map(id=>[id,{state:'FIXED_PROVEN'}]));
    const ledgerPath=write('ledger',{findings});
    const output=join(dir,'out.json');
    const env={...process.env,C3_PRETERMINAL:pre,C3_FOCAL:focal,C3_HUMAN:human,C3_QA:qa,C3_PARITY:parity,
      C3_LEDGER:ledgerPath,C3_FINAL_MATRIX:output,C3_SOURCE:source,C3_TREE:tree,C3_RUNTIME_REVISION:runtime,C3_RUNTIME_DIGEST:digest,C3_HOSTING_VERSION:hosting};
    const run=()=>spawnSync(process.execPath,['tools/qa/cxorbia-i3-c3-finalize-module-truth.mjs'],{env,encoding:'utf8'});
    const noReceipt=run();
    assert.notEqual(noReceipt.status,0);
    assert.match(noReceipt.stderr,/C3_OWNER_RECEIPT_MISSING:historical/);
    findings['VRM-C3-HISTORICAL-RECEIPT']={
      severity:'P0',state:'FIXED_PROVEN',owner:[historicPath],terminalEvidence:{ownerSpecificReceipts:[{
        decision:'PASS_TEST_HISTORICAL_OWNER',moduleDomain:'historical',sourceSha:source,sourceTree:tree,
        runtimeRevision:runtime,runtimeDigest:digest,hostingVersion:hosting,hrRevision:hr,ownerPaths:[historicPath],
        actionReal:true,providerAck:true,durableReadback:true,reloadProof:true,noDuplicateRegression:true,production:false
      }]}
    };
    write('ledger',{findings});
    const pass=run();
    assert.equal(pass.status,0,pass.stderr);
    const result=JSON.parse(fs.readFileSync(output,'utf8'));
    assert.equal(result.terminalClosure.decision,'PASS_C3_TERMINAL_MODULE_TRUTH_21_21');
    assert.equal(result.modules.find(m=>m.domain==='historical').historicalMatchPreserved,true);
    assert.equal(result.sourceFiles[0].classification,'MATCH');
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
