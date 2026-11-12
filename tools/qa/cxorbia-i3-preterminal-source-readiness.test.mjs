import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assessPreterminalSourceReadiness as assess} from './cxorbia-i3-preterminal-source-readiness.mjs';

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
