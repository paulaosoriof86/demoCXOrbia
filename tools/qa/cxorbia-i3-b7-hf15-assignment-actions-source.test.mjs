import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../app/modules/postulaciones.js',import.meta.url),'utf8');

function groupMarkup(visits){
  const begin=source.indexOf('  const escapeAssignment=(value)=>');
  const end=source.indexOf('  const html=',begin);
  assert.ok(begin>0 && end>begin,'assignment grouping and escaping helpers are absent');
  const safe=x=>String(x??'—');
  const ui={bdg:(label)=>'<b>'+label+'</b>',empty:(_icon,msg)=>'<div>'+msg+'</div>'};
  const data={visitFacets:v=>({realized:!!v.realizada,scheduled:!!v.agendada})};
  const assignmentOrigin=v=>v.assignmentSource==='platform'?'Plataforma':'HR / Hoja de Ruta';
  const assignmentState=v=>v.realizada?'Realizada':v.agendada?'Agendada':'Asignada';
  const displayShopper=x=>x.shopper||'Identidad protegida';
  return new Function('operationalAssignments','safe','ui','assignmentOrigin','assignmentState','displayShopper','data',source.slice(begin,end)+' return assignmentGroupHTML;')
    (visits,safe,ui,assignmentOrigin,assignmentState,displayShopper,data);
}
function binderHarness(visitId){
  const from=source.indexOf("document.querySelectorAll('.poAssignedManage')");
  const until=source.indexOf('    const poList=',from);
  assert.ok(from>0&&until>from,'canonical action binder not found');
  const binder=source.slice(from,until);
  assert.doesNotMatch(binder,/updateVisit|setVisit|_posts\.push|requestVisit|localStorage/);
  const events=[],calls=[],data={currentProjectId:'cinepolis'},ui={};
  const document={querySelectorAll:()=>[{dataset:{visitId},addEventListener:(type,fn)=>events.push({type,fn})}]};
  const CX={adminPostulacionesActions:{openContext:args=>calls.push(args)}};
  new Function('document','CX','data','ui',binder)(document,CX,data,ui);
  return {events,calls,data,ui};
}
test('HF15: cards are grouped by exact country+branch; HR vs platform retain origin',()=>{
  const html=groupMarkup([
    {id:'hr_1',pais:'GT',sucursal:'Central',shopper:'Ana',assignmentSource:'hr_external',agendada:'2026-10-20'},
    {id:'hr_2',pais:'HN',sucursal:'Central',shopper:'Luis',assignmentSource:'hr_external'},
    {id:'pl_3',pais:'GT',sucursal:'Central',shopper:'Marta',assignmentSource:'platform',agendada:'2026-10-22'}
  ]);
  assert.equal((html.match(/data-cx-assignment-group/g)||[]).length,2);
  assert.equal((html.match(/data-cx-assignment-card/g)||[]).length,3);
  assert.equal((html.match(/poAssignedManage/g)||[]).length,3);
  assert.match(html,/HR \/ Hoja de Ruta/);
  assert.match(html,/Plataforma/);
  assert.match(html,/data-visit-id="pl_3"/);
  assert.match(html,/Agenda: <b/);
});
test('HF15: source-provided text is HTML-escaped and no posts are synthesized',()=>{
  const html=groupMarkup([{id:'hr_3',pais:'GT',sucursal:'<img src=x>',shopper:'<script>Bad</script>',assignmentSource:'hr_external'}]);
  assert.doesNotMatch(html,/<script>|<img src=x>/);
  assert.match(html,/&lt;img src=x&gt;/);
  assert.match(html,/&lt;script&gt;Bad&lt;\/script&gt;/);
  assert.match(source,/const activePosts=typeof data\.activePosts==='function'\?data\.activePosts\(\):/);
  assert.match(source,/postulationLifecycle!=='transitioned_to_assignment'/);
  assert.match(source,/id="pGroups"/);
});
test('HF15: assignments empty state is honest, without fictional rows',()=>{
  const html=groupMarkup([]);
  assert.match(html,/Sin asignaciones vigentes en este periodo/);
  assert.doesNotMatch(html,/poAssignedManage/);
});
test('HF15: per-card action dispatches exact visit to canonical owner',()=>{
  const {events,calls,data,ui}=binderHarness('hr_2026-10_gt_22_e03f9f545a');
  assert.equal(events.length,1);assert.equal(events[0].type,'click');
  events[0].fn();assert.equal(calls.length,1);
  assert.equal(calls[0].visitId,'hr_2026-10_gt_22_e03f9f545a');
  assert.equal(calls[0].data,data);assert.equal(calls[0].ui,ui);
});
test('HF15: missing exact visit cannot invoke action',()=>{
  const {events,calls}=binderHarness('');
  events[0].fn();
  assert.equal(calls.length,0);
});
