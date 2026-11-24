import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseTab} from '../../../../tools/hr-source/tya-build-live-hr-source-safe-r20.mjs';
import {deriveHrReviewState} from '../../../../tools/hr-source/tya-canonical-visit-state-r20.mjs';
import {authorizedHrReviewObservation} from '../../cxorbia-excel-operational-snapshot-v1.mjs';
import {prepareHrReviewNotices} from '../../cxorbia-operational-command-provider-v1.mjs';

const contract=JSON.parse(fs.readFileSync(new URL('../../../contracts/tya-hr-column-map-r20-v1.json',import.meta.url),'utf8'));
const registry=JSON.parse(fs.readFileSync(new URL('../../../contracts/tya-cinepolis-cinema-identity-r20-v1.json',import.meta.url),'utf8'));
const tab={country:'GT',key:'2026-11',year:2026,month:11,tabTitle:'NOVIEMBRE 26',label:'Noviembre',fullLabel:'Noviembre 2026'};
function parse({note='Resultado: NO APROBADO\nFalta una evidencia QA.',submitted='',mapped=true,reverse=false}={}){
  let fields=Object.entries(contract.columns).filter(([key])=>mapped||key!=='observacionesRevision');
  if(reverse)fields=fields.reverse();
  const record={pais:'Guatemala',idCinema:'2022002',ciudad:'Ciudad QA',shopping:'Sucursal QA',franja:'WKND',formato:'2D',tipoCompra:'APP',quincena:'1Q',shopper:'Shopper Sintético QA',fechaProgramada:'2026-11-20',fechaRealizada:'2026-11-20',fechaCuestionario:'2026-11-21',fechaSubmitido:submitted,observacionesRevision:note};
  return parseTab(tab,[fields.map(([key,value])=>key==='observacionesRevision'?'Observaciones\nde revisión':value.aliases[0]),fields.map(([key])=>record[key]??'')],contract,registry);
}

test('original normalized HR header maps a pending correction without leaking free text in public rows',()=>{
  const parsed=parse();assert.equal(parsed.issues.some(x=>x.severity==='critical'),false);
  const review=parsed.visits[0].hrReview;
  assert.equal(review.state,'pending_correction');assert.equal(review.outcome,'rejected');assert.equal(review.requiresAttention,true);
  assert.match(review.observationDigest,/^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(parsed.visits).includes('evidencia QA'),false);
  assert.equal(parsed.privateReviewNotes[0].sourceRow,2);assert.match(parsed.privateReviewNotes[0].observation,/Falta una evidencia QA/);
});
test('column reordering preserves exact mapped observation and digest',()=>{
  assert.deepEqual(parse({reverse:true}).visits[0].hrReview,parse().visits[0].hrReview);
});
test('historical missing review column remains explicitly unmapped and does not invent a correction',()=>{
  const result=parse({mapped:false});assert.equal(result.issues.some(x=>x.severity==='critical'),false);
  assert.equal(result.visits[0].hrReview.state,'not_mapped');assert.equal(result.visits[0].hrReview.requiresAttention,false);
  assert.deepEqual(result.privateReviewNotes,[]);
});
test('retained notes on submitted visits never undo submission or create a payment confirmation',()=>{
  const v=parse({submitted:'2026-11-22'}).visits[0];
  assert.equal(v.hrReview.state,'submitted_with_observation');assert.equal(v.hrReview.requiresAttention,false);
  assert.equal(v.canonicalFacets.submitted,true);assert.equal(v.canonicalFacets.paymentConfirmed,false);
});
test('consult-shopper, generic observations, approval and empty cells remain distinct',()=>{
  assert.equal(parse({note:'Resultado: CONSULTAR AL SHOPPER\nDetalle QA.'}).visits[0].hrReview.state,'pending_correction');
  assert.equal(parse({note:'Falta una evidencia QA.'}).visits[0].hrReview.state,'pending_review');
  assert.equal(parse({note:'Resultado: APROBADO'}).visits[0].hrReview.state,'ready_to_submit');
  assert.equal(parse({note:''}).visits[0].hrReview.state,'no_observation');
  assert.equal(parse({note:'Sin observaciones'}).visits[0].hrReview.requiresAttention,false);
});
test('same source note keeps its digest and a changed or cleared note changes the revision input',()=>{
  const a=parse().visits[0].hrReview,b=parse().visits[0].hrReview,c=parse({note:'Resultado: NO APROBADO\nOtro detalle QA.'}).visits[0].hrReview,d=parse({note:''}).visits[0].hrReview;
  assert.equal(a.observationDigest,b.observationDigest);assert.notEqual(a.observationDigest,c.observationDigest);
  assert.equal(d.observationDigest,null);assert.equal(d.requiresAttention,false);
});
test('contradictory result labels and invalid submitted dates do not silently approve review',()=>{
  assert.equal(parse({note:'Resultado: NO APROBADO\nResultado: APROBADO',submitted:'pendiente'}).visits[0].hrReview.state,'pending_review');
  const r=deriveHrReviewState({observation:'Resultado: NO APROBADO',visit:{cancelled:true}});
  assert.equal(r.state,'cancelled');assert.equal(r.requiresAttention,false);
});

test('private review text requires exact scope, visit revision and staff or assigned shopper identity',()=>{
  const scope={tenantId:'tenant-qa',projectId:'project-qa'},visit={...scope,id:'visit-qa',periodId:'project-qa-2026-11',shopperId:'owner-qa',hrReview:{observationDigest:'digest-qa'}};
  const privateReviewNotes=new Map([[visit.id,{...scope,periodId:visit.periodId,shopperId:visit.shopperId,observationDigest:'digest-qa',observation:'Private review QA'}]]);
  const get=principal=>authorizedHrReviewObservation({visit,scope,privateReviewNotes,principal});
  for(const role of ['super','admin','ops','coordinador'])assert.equal(get({uid:'staff-qa',role}),'Private review QA');
  assert.equal(get({uid:'owner-user',role:'shopper',shopperId:'owner-qa'}),'Private review QA');
  assert.equal(get({uid:'other-user',role:'shopper',shopperId:'other-qa'}),null);
  assert.equal(get({uid:'client-qa',role:'cliente'}),null);assert.equal(get({role:'admin'}),null);
  assert.equal(authorizedHrReviewObservation({visit,scope:{...scope,projectId:'other'},privateReviewNotes,principal:{uid:'staff',role:'admin'}}),null);
  assert.equal(authorizedHrReviewObservation({visit:{...visit,hrReview:{observationDigest:'changed'}},scope,privateReviewNotes,principal:{uid:'staff',role:'admin'}}),null);
});

function noticeFixture(){
  const records=new Map(),doc=path=>({path,collection:name=>({doc:id=>doc(path+'/'+name+'/'+id)})});
  const db={collection:name=>({doc:id=>doc(name+'/'+id)})};
  const tx={get:async ref=>({exists:records.has(ref.path),data:()=>structuredClone(records.get(ref.path))})};
  const flush=writes=>{for(const [method,ref,value,options]of writes){if(method==='create')assert.equal(records.has(ref.path),false);records.set(ref.path,options?.merge?{...records.get(ref.path),...value}:structuredClone(value));}};
  const base=parse().visits[0],candidate={...base,tenantId:'tenant-qa',projectId:'project-qa',periodId:'project-qa-2026-11',visitId:'visit-qa',id:'visit-qa',shopperId:'owner-qa'};
  return {records,db,tx,flush,candidate};
}
test('pending review creates exact staff and owner notices once; rereads preserve read state',async()=>{
  const f=noticeFixture(),first=await prepareHrReviewNotices(f.tx,{db:f.db,candidate:f.candidate,sourceRevision:'rev1'});
  assert.equal(first.writes.length,2);f.flush(first.writes);
  const notices=[...f.records.values()];
  assert.deepEqual(notices.find(x=>x.toRole==='shopper').targetShopperIds,['owner-qa']);
  assert.equal(notices.some(x=>JSON.stringify(x).includes('evidencia QA')),false);
  const existing={...f.candidate,hrReviewNoticeState:first.state};
  const again=await prepareHrReviewNotices(f.tx,{db:f.db,existing,candidate:f.candidate,sourceRevision:'unrelated-new-revision'});
  assert.equal(again.writes.length,0);assert.deepEqual(again.state,first.state);
});
test('changed observations or assignment resolve old notices and notify the new exact cycle',async()=>{
  const f=noticeFixture(),a=await prepareHrReviewNotices(f.tx,{db:f.db,candidate:f.candidate,sourceRevision:'a'});f.flush(a.writes);
  const changed={...f.candidate,shopperId:'new-owner',hrReview:{...f.candidate.hrReview,observationDigest:'b'.repeat(64)}};
  const b=await prepareHrReviewNotices(f.tx,{db:f.db,existing:{...f.candidate,hrReviewNoticeState:a.state},candidate:changed,sourceRevision:'b'});f.flush(b.writes);
  assert.equal(b.state.cycle,2);assert.equal(b.writes.length,4);
  const active=[...f.records.values()].filter(x=>x.status==='active');assert.equal(active.length,2);
  assert.deepEqual(active.find(x=>x.toRole==='shopper').targetShopperIds,['new-owner']);
});
test('submitted source closes pending alerts, while retained historical notes create no initial alarm',async()=>{
  const f=noticeFixture(),a=await prepareHrReviewNotices(f.tx,{db:f.db,candidate:f.candidate,sourceRevision:'a'});f.flush(a.writes);
  const submitted={...f.candidate,hrReview:{...f.candidate.hrReview,requiresAttention:false,submissionConfirmed:true,state:'submitted_with_observation'}};
  const b=await prepareHrReviewNotices(f.tx,{db:f.db,existing:{...f.candidate,hrReviewNoticeState:a.state},candidate:submitted,sourceRevision:'b'});f.flush(b.writes);
  assert.equal(b.writes.length,2);assert.equal([...f.records.values()].filter(x=>x.status==='active').length,0);
  assert.equal((await prepareHrReviewNotices(f.tx,{db:f.db,candidate:submitted,sourceRevision:'b'})).writes.length,0);
  const reopen=await prepareHrReviewNotices(f.tx,{db:f.db,existing:{...submitted,hrReviewNoticeState:b.state},candidate:f.candidate,sourceRevision:'c'});
  assert.equal(reopen.state.cycle,2);assert.equal(reopen.writes.length,2);
});
test('a changed note after submission creates an informational notice without reversing submission',async()=>{
  const f=noticeFixture(),submitted={...f.candidate,hrReview:{...f.candidate.hrReview,requiresAttention:false,submissionConfirmed:true,state:'submitted_with_observation'}};
  const changed={...submitted,hrReview:{...submitted.hrReview,observationDigest:'c'.repeat(64)}};
  const n=await prepareHrReviewNotices(f.tx,{db:f.db,existing:submitted,candidate:changed,sourceRevision:'c'});
  assert.equal(n.writes.length,2);assert.equal(n.state.kind,'submitted_review_changed');
  assert.equal(n.writes[0][2].priority,'normal');assert.equal(changed.hrReview.submissionConfirmed,true);
});
