import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';

const source=fs.readFileSync('app/modules/cert.js','utf8');
const questions=Array.from({length:15},(_,i)=>({q:'Pregunta '+(i+1),ops:['Uno','Dos','Tres','Cuatro'],correcta:'Uno',exp:'Explicación '+(i+1),fuente:'[Página '+((i%7)+1)+']'}));
const clone=x=>JSON.parse(JSON.stringify(x));
function setup(){
  const project='cinepolis',period='cinepolis-2026-09',cid='ai-3654d624896f';
  const id='certbank-'+project+'-'+period+'-'+cid;
  const bank={certificationId:cid,certificationName:'Banco IA pendiente de revisión',
    estado:'pending_review',contentRevision:'old-revision',preguntas:clone(questions),
    generadoPorUid:'qa-author',documentSource:{name:'Instructivo Shopper.pdf',source_sha256:'a'.repeat(64),extraction_quality:{pageCount:7,sufficient:true}}};
  const record={id,projectId:project,periodId:period,version:3,bank:clone(bank)};
  const resources={
    items:[record],list(){return this.items;},async saveMetadata(payload,options){
      assert.equal(options.projectId,project);assert.equal(options.periodId,period);
      assert.equal(payload.id,id);
      if(String(this.items[0]?.version)!==String(options.expectedVersion))throw Error('RESOURCE_EXPECTED_VERSION_CONFLICT');
      const updated={...clone(payload),version:this.items[0].version+1};
      this.items=[updated];
      return {ok:true,status:'committed',committed:true,providerAck:true,item:updated};
    }
  };
  const CX={BACKEND:{enabled:true},data:{currentProjectId:project},backendResources:resources,
    session:{role:'admin',user:{role:'admin'}},backendCertifications:{currentUid:()=> 'qa-reviewer'},bus:{emit(){}},module(){}};
  vm.runInNewContext(source,{CX,window:{CX},crypto:webcrypto,TextEncoder,console,Date,setTimeout});
  return {CX,bank:{...bank,__resourceId:id,__resourceVersion:3},resources,period};
}
test('D04 reviews fifteen questions with version guard, source provenance and durable readback',async()=>{
  const {CX,bank,resources,period}=setup();
  const next=clone(bank.preguntas);
  next[0].q='Pregunta revisada número uno';
  const result=await CX.certStore.reviewDraft(period,bank,next,'maker_checker');
  assert.equal(result.committed,true);
  assert.equal(resources.items[0].version,4);
  assert.equal(resources.items[0].bank.estado,'pending_review');
  assert.equal(resources.items[0].bank.preguntas.length,15);
  assert.equal(resources.items[0].bank.preguntas[0].q,next[0].q);
  assert.equal(resources.items[0].bank.documentSource.source_sha256,bank.documentSource.source_sha256);
  assert.equal(resources.items[0].bank.reviewHistory.length,1);
  assert.equal(resources.items[0].bank.reviewHistory[0].changes.length,1);
  assert.equal(resources.items[0].bank.reviewHistory[0].fromVersion,3);
  assert.equal(resources.items[0].bank.reviewHistory[0].toVersion,4);
  assert.equal(resources.items[0].bank.__resourceId,undefined);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,next),/RESOURCE_EXPECTED_VERSION_CONFLICT/);
});
test('D04 rejects invalid source, same-author maker-checker, missing version and empty edits',async()=>{
  const {CX,bank,resources,period}=setup();
  const bad=clone(bank.preguntas);bad[1].fuente='[Página 99]';
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,bad),/CERT_REVIEW_SOURCE_PAGE_INVALID_/);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,{...bank,generadoPorUid:'qa-reviewer'},clone(bank.preguntas),'maker_checker'),/CERT_REVIEW_DISTINCT_REVIEWER_REQUIRED/);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,{...bank,__resourceVersion:undefined},bad),/CERT_REVIEW_EXPECTED_VERSION_REQUIRED/);
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,clone(bank.preguntas)),/CERT_REVIEW_NO_CHANGES/);
  assert.equal(resources.items[0].version,3);
});
test('D04 role gate and complete question validation fail closed',async()=>{
  const {CX,bank,resources,period}=setup();
  CX.session.role='ops';
  const next=clone(bank.preguntas);next[0].q='Nueva pregunta';
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,next),/CERT_REVIEW_AUTHORIZED_ADMIN_REQUIRED/);
  CX.session.role='admin';next[0].ops=['Igual','Igual','Otra','Cuatro'];next[0].correcta='Igual';
  await assert.rejects(()=>CX.certStore.reviewDraft(period,bank,next),/CERT_REVIEW_INVALID_QUESTION_0/);
  assert.equal(resources.items[0].version,3);
});
test('D04 modal edit button, diff preview and CAS-backed save exist without auto-publication',()=>{
 assert.match(source,/certReviewEdit/);
 assert.match(source,/certReviewPreview/);
 assert.match(source,/certReviewSave/);
 assert.match(source,/CX\.certStore\.reviewDraft\(p\.id,bank,read\(\),policy\)/);
 assert.match(source,/expectedVersion:version,expectedResourceId:original\.__resourceId,requireReadback:true/);
 const method=source.slice(source.indexOf('  async reviewDraft('),source.indexOf('  async clear(',source.indexOf('  async reviewDraft(')));
 assert.ok(method.length>0);
 assert.doesNotMatch(method,/estado\s*:\s*['"]published['"]/);
});
