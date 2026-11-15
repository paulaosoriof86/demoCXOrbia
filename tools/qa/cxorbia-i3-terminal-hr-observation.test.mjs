import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTerminalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';
const valid=()=>({ok:true,revision:'a'.repeat(64),sourceSafe:true,refreshError:null,
  writes:false,hrWrites:false,production:false,shopperReconciliation:null,visitReconciliation:null});
test('G05 valid read-only observation passes without inventing reconciliation ACK',()=>{
  const r=validateTerminalHrObservation(valid());
  assert.equal(r.reconciliationCertified,false);assert.equal(r.scope,'HR_OBSERVATION_ONLY_NOT_COMMAND_RECONCILIATION');
  assert.equal(r.providerAck,undefined);
});
for(const [field,value] of [['ok',false],['revision','stale'],['sourceSafe',false],['refreshError','timeout'],
  ['writes',true],['hrWrites',true],['production',true],['writes',undefined]]){
  test('invalid HR observation remains blocked: '+field+'='+String(value),()=>{
    const m=valid();m[field]=value;
    assert.throws(()=>validateTerminalHrObservation(m),/TERMINAL_HR_READ_ONLY_OBSERVATION_INVALID/);
  });
}
test('an old ACK cannot disguise invalid current HR observation',()=>{
  const m=valid();m.sourceSafe=false;m.shopperReconciliation={providerAck:true};m.visitReconciliation={providerAck:true};
  assert.throws(()=>validateTerminalHrObservation(m));
});
test('active terminal preflight invokes the observation predicate and preserves revision stability',()=>{
  const w=fs.readFileSync('.github/workflows/cxorbia-recovery-i3-dev-certification.yml','utf8');
  const job=w.split('\n  certify:')[1].split('\n  live-fixtures:')[0];
  assert.match(job,/node tools\/qa\/cxorbia-i3-terminal-hr-observation\.mjs "\$OUT\/hr-current-live-meta.json"/);
  assert.doesNotMatch(job,/\[\[ "\$\(jq -r '\.shopperReconciliation.providerAck'/);
  assert.match(job,/"\$REV" = "\$PREV_REV"/);
  assert.match(job,/"\$SNAP_REV" = "\$CURRENT_LIVE_HR_REVISION"/);
});
