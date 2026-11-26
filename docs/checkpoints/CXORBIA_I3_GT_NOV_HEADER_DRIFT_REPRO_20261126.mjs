import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [repoArg, receiptArg] = process.argv.slice(2);
const repo = path.resolve(repoArg || '.');
const receipt = JSON.parse(fs.readFileSync(receiptArg || new URL('./CXORBIA_I3_GT_NOV_HEADER_DRIFT_20261126.json', import.meta.url), 'utf8'));
const dig = object => createHash('sha256').update(JSON.stringify(object)).digest('hex');
for (const [owner, expected] of Object.entries(receipt.owners)) {
  const getBlob = ref => execFileSync('git',['-C',repo,'rev-parse',ref+':'+owner],{encoding:'utf8'}).trim();
  assert.equal(getBlob(receipt.source), expected);
  assert.equal(getBlob(receipt.predecessor), expected);
  assert.equal(execFileSync('git',['-C',repo,'hash-object',owner],{encoding:'utf8'}).trim(), expected);
}
const {validateGraphColumnMap} = await import(pathToFileURL(path.join(repo,'backend/runtime/cxorbia-make-graph-provider-v1.mjs')));
const contract = JSON.parse(fs.readFileSync(path.join(repo,'backend/contracts/tya-hr-column-map-r20-v1.json'),'utf8'));
const [current, earlier] = receipt.observations;
assert.deepEqual(current.scope, earlier.scope);
assert.equal(current.bindingFingerprint, earlier.bindingFingerprint);
assert.equal(current.worksheetIdSha256, earlier.worksheetIdSha256);
assert.equal(current.range, earlier.range);
assert.deepEqual(current.header.flatMap((v,i)=> v===earlier.header[i]?[]:[{column:i+1,before:earlier.header[i],after:v}]), [{column:12,before:'Shopper Asignado',after:'Columna1'}]);
function result(header, country, expected) {
  const rows = [[],[],[],header];
  if (expected==='REJECT') {
    assert.throws(()=>validateGraphColumnMap(rows,contract,country), /^Error: MAPPING_FAILURE:B14_HEADER_AMBIGUOUS_OR_MISSING$/);
    return 'MAPPING_FAILURE:B14_HEADER_AMBIGUOUS_OR_MISSING';
  }
  const proof=validateGraphColumnMap(rows,contract,country);
  assert.equal(proof.headerRow,4);
  assert.equal(proof.nonemptyRows,0);
  return proof.headerVariant;
}
const observations=receipt.observations.map((r,i)=>{
  assert.equal(dig(r.header), r.headerSha256);
  assert.equal(r.sameArray,true);
  assert.equal(r.bothReturnSameHeader,true);
  assert.deepEqual(r.statusPair,[200,200]);
  assert.equal(r.hashPair[0],r.hashPair[1]);
  return {id:r.id,scope:r.scope,classification:result(r.header,r.scope[2],i===0?'REJECT':'MATCH')};
});
const restored=[...current.header]; restored[11]='Shopper Asignado';
assert.deepEqual(restored,earlier.header);
console.log(JSON.stringify({decision:'PASS_REPRODUCED_EXTERNAL_HEADER_DRIFT_OFFLINE',observations,hypotheticalHeaderRestoration: result(restored,'GT','MATCH'),providerCalls:0,productWrites:0,excelWrites:0},null,2));
