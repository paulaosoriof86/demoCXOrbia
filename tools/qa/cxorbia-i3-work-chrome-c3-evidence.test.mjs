import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const root='docs/checkpoints/CXORBIA_I3_WORK_CHROME_20261120/';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const rawReceipt=fs.readFileSync(root+'recibos_Chrome.json');
const rawMatrix=fs.readFileSync(root+'matriz_21_dominios.csv');
const manifest=JSON.parse(fs.readFileSync(root+'IMPORT_C3_MANIFEST.json','utf8'));
const truth=JSON.parse(fs.readFileSync('RECOVERY-I3-MODULE-TRUTH-MATRIX-20261119-V366.json','utf8'));
const receipts=JSON.parse(rawReceipt.toString('utf8'));
const csv=rawMatrix.toString('utf8').replace(/^\ufeff/,'');
const rows=csv.trimEnd().split(/\r?\n/);
const domains=rows.slice(1).map(x=>x.slice(0,x.indexOf(',')));

test('Work ZIP source receipt hashes match byte exact import, not transformed text',()=>{
  assert.equal(hash(rawReceipt),'44feeeef1ccb32bf5904bacc3fac9b4efde38b1fda6aaba6614e2e41dceff721');
  assert.equal(hash(rawMatrix),'6f03de5b0c084bfac64c1e12b9017d31e50918cffaad6d79e15424910e0105c9');
  assert.equal(rawReceipt.byteLength,67654);assert.equal(rawMatrix.byteLength,17618);
  assert.equal(manifest.sourceLibrary.zip.sha256,'2dc7c264e5ab5e78eb4375b6abb6870c2df4195e0c01469466b624fd495b006a');
});
test('28 receipts are scoped focal, 20 PASS 3 FAIL and 5 HOLD with no fictitious terminal PASS',()=>{
  assert.equal(receipts.length,28);
  for(const [state,count] of [['PASS focal',20],['FAIL',3],['HOLD',5]])
    assert.equal(receipts.filter(x=>x.estado===state).length,count);
  assert.equal(receipts.every(x=>x.certificacion_terminal===false&&x.dominio_completo===false),true);
  assert.deepEqual(receipts.filter(x=>x.estado==='FAIL').map(x=>x.id).sort(),['GT11','GT12','HN06']);
  for(const x of receipts){
    // Work did not have authenticated Admin, Operativo or Cliente sessions.
    // Their HOLD records correctly contain null tenant and project; never
    // synthesize a principal or promote a route that was not visited.
    if(x.rol_autenticado===true){
      assert.equal(x.tenant,'tya');assert.equal(x.proyecto,'cinepolis');
    }else{
      assert.equal(x.estado,'HOLD');assert.equal(x.tenant,null);
      assert.equal(x.proyecto,null);
      assert.ok(['AD01','OP01','CL01'].includes(x.id));
    }
    assert.equal(x.source_de_control,'d72275685d57941f6cfa0fcebc4823287942f786');
  }
});
test('21 Work domain records match exact canonical V366 IDs and preserve 6 MATCH',()=>{
  assert.equal(rows.length,22);assert.equal(domains.length,21);assert.equal(new Set(domains).size,21);
  assert.deepEqual(domains.slice().sort(),truth.modules.map(x=>x.domain).sort());
  assert.equal(truth.modules.filter(x=>x.classification==='MATCH').length,6);
  assert.equal(truth.phaseAComplete,false);
});
test('Work three period cases are real, with no independent source revision or write claim',()=>{
  for(const id of ['GT11','GT12','HN06']){
    const x=receipts.find(x=>x.id===id);
    assert.equal(x.estado,'FAIL');
    assert.equal(x.hr_revision_independiente_en_esta_prueba,null);
    assert.equal(x.ack_externo_observado,null);
    assert.equal(x.clasificacion_propuesta,'PERSISTENCE_FAILURE');
  }
});
