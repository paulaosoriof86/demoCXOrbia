import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {TextEncoder} from 'node:util';

const fullSource=fs.readFileSync('app/modules/cert.js','utf8');
const storeSource=fullSource.split("\nCX.module('cert'")[0];
const period='2026-10',project='cinepolis',certificationId='qa-d05-import-review-focal';
const resourceId=`certbank-${project}-${period}-${certificationId}`;

function harness(){
  const writes=[];
  const CX={
    BACKEND:{enabled:true},data:{currentProjectId:project},
    session:{effectiveRole:()=> 'admin'},
    backendCertifications:{currentUid:()=> 'qa-reviewer'},
    bus:{emit:()=>{}},
    backendResources:{
      async saveMetadata(item,options){
        writes.push({item,options});
        const committed={...item,version:2,status:'active',createdByUid:'qa-author'};
        return {providerAck:true,committed:true,item:committed,
          readback:{confirmed:true,source:'firestore-server',item:committed}};
      }
    }
  };
  vm.runInNewContext(storeSource,{CX,crypto:webcrypto,TextEncoder});
  const original={
    certificationId,certificationName:'Banco QA importador',
    preguntas:[{q:'Pregunta de referencia',ops:['A','B','C','D'],correcta:'A',
      exp:'Explicación original',fuente:'Instructivo de prueba'}],
    estado:'pending_review',contentRevision:'qa-import-original',
    generadoPorUid:'qa-author',__resourceId:resourceId,__resourceVersion:1
  };
  return {store:CX.certStore,original,writes};
}

test('D05 imported drafts with 2/3/4 options always offer a fourth editable slot',()=>{
  const {store,writes}=harness();
  const draft={q:'Pregunta importada',ops:['A','B','C'],correcta:'B',exp:'',fuente:''};
  assert.equal(store.importQuestions([draft]).length,1);
  assert.equal(store.editorOptions(draft.ops).join('|'),'A|B|C|');
  assert.equal(store.editorOptions(['A','B']).join('|'),'A|B||');
  assert.equal(store.editorOptions(['A','B','C','D']).join('|'),'A|B|C|D');
  assert.equal(draft.ops.length,3,'original provider data not mutated');
  assert.match(fullSource,/options=CX\.certStore\.editorOptions\(q\.ops\)\.map/,
    'natural Admin editor must use the editable slots');
  assert.equal(writes.length,0);
});

test('D05 unsupported five-option import fails before any provider write',()=>{
  const {store,writes}=harness();
  const draft={q:'Pregunta importada',ops:['A','B','C','D','E'],correcta:'A'};
  assert.throws(()=>store.importQuestions([draft]),/CERT_IMPORT_MAX_FOUR_OPTIONS/);
  assert.throws(()=>store.importQuestions([{...draft,ops:['A']}]),/NO_VALID_QUESTIONS/);
  assert.match(fullSource,/cada pregunta admite como máximo cuatro opciones/);
  assert.equal(writes.length,0);
});

test('D05 incomplete review fails closed; corrected four-option review requires provider ACK',async()=>{
  const {store,original,writes}=harness();
  const incomplete=[{...original.preguntas[0],ops:store.editorOptions(['A','B','C']),exp:'',fuente:''}];
  await assert.rejects(store.reviewDraft(period,original,incomplete,'authorized_admin'),/CERT_REVIEW_INVALID_QUESTION_0/);
  assert.equal(writes.length,0);
  const corrected=[{...incomplete[0],ops:['A','B','C','D'],exp:'Explicación revisada',fuente:'Instructivo sección 1'}];
  const result=await store.reviewDraft(period,original,corrected,'authorized_admin');
  assert.equal(result.providerAck,true);
  assert.equal(result.committed,true);
  assert.equal(writes.length,1);
  assert.equal(writes[0].options.expectedVersion,1);
  assert.equal(writes[0].options.requireReadback,true);
  assert.match(fullSource,/Completa las cuatro opciones diferentes/);
});
