import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function ui(){
  const CX={data:{_visitas:[]}},context={CX};context.window=context;
  Object.defineProperty(context,'localStorage',{get(){throw new Error('LOCAL_STORAGE_MUST_NOT_BE_REVIEW_AUTHORITY');}});
  vm.runInNewContext(fs.readFileSync('app/modules/revision-admin.js','utf8'),context);
  return CX;
}
test('authorized HR text is rendered as text, and supplied markup never executes',()=>{
  const CX=ui(),html=CX.hrReviewHTML({hrReview:{mapped:true,state:'pending_correction',requiresAttention:true,hasObservation:true},hrReviewObservation:'<script>untrusted()</script> & detalle'});
  assert.match(html,/&lt;script&gt;untrusted\(\)&lt;\/script&gt;/);assert.equal(html.includes('<script>'),false);
  assert.match(html,/Observación por atender/);assert.match(html,/<details open/);
});
test('historical submitted observation stays informational and missing private detail is explicit',()=>{
  const CX=ui(),v={hrReview:{mapped:true,state:'submitted_with_observation',requiresAttention:false,submissionConfirmed:true,hasObservation:true}};
  assert.equal(CX.hrReviewPresentation(v).pending,false);
  const html=CX.hrReviewHTML(v);assert.match(html,/Submitida/);assert.doesNotMatch(html,/Atiende la observación antes/);
  assert.match(html,/sesión autorizada/);
});
test('review compatibility reads fresh canonical data and refuses a fabricated local save',()=>{
  const CX=ui();CX.data._visitas=[{id:'qa',hrReview:{state:'pending_correction'}}];
  assert.equal(CX.revisionStore.get('qa').estado,'pending_correction');
  CX.data._visitas=[{id:'qa',hrReview:{state:'submitted'}}];
  assert.equal(CX.revisionStore.get('qa').estado,'submitted');
  assert.throws(()=>CX.revisionStore.set('qa','approved'),/EXTERNAL_AUTHORITY/);
});
