import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DESCRIPTOR,POINTER,bindControlPaths,validateProjectionRegistry,assertPreserved} from './cxorbia-i3-current-control-projection.mjs';

const root=new URL('../../',import.meta.url);
const read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
function current(){
  const descriptor=read(DESCRIPTOR),pointer=read(POINTER);
  return {descriptor,pointer,matrix:read(descriptor.moduleTruthPath),ledger:read(descriptor.findingsLedgerPath)};
}
const field='currentCumulativeTaskEvidenceMap';

test('current documentary map drift in either matrix or ledger is rejected',()=>{
  for(const name of ['matrix','ledger']){
    const controls=current();
    controls[name][field]={...controls.descriptor[field],gitBlob:'0'.repeat(40)};
    const result=validateProjectionRegistry(controls);
    assert.ok(result.failures.includes('CURRENT_PROJECTION_DESYNC:'+name+'.'+field));
  }
});

test('binding current controls synchronizes the existing documentary map without changing certified scopes',()=>{
  const controls=current(),before=structuredClone(controls);
  for(const name of ['matrix','ledger'])controls[name][field]={...controls.descriptor[field],gitBlob:'0'.repeat(40)};
  const files=bindControlPaths(controls,{matrixPath:controls.descriptor.moduleTruthPath,ledgerPath:controls.descriptor.findingsLedgerPath});
  for(const name of ['descriptor','pointer','matrix','ledger'])assert.deepEqual(controls[name][field],before.descriptor[field]);
  for(const file of [controls.descriptor.moduleTruthPath,controls.descriptor.findingsLedgerPath])assert.deepEqual(JSON.parse(files.get(file))[field],before.descriptor[field]);
  assertPreserved(before,controls);
});
