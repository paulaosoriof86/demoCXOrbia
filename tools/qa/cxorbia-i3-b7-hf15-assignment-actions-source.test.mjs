import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../app/modules/postulaciones.js', import.meta.url), 'utf8');

test('HF-20261012-15: operational assignments expose an individual action column', () => {
  assert.match(source, /<th>Agenda<\/th><th>Acciones<\/th>/);
  assert.match(source, /class="btn btn-soft btn-sm poAssignedManage"/);
  assert.match(source, /data-visit-id="\$\{String\(v\.id\|\|v\.visitId\|\|""\)/);
  assert.match(source, /<tr><td colspan="6">/);
});

test('HF-20261012-15: context action dispatches the exact canonical visit owner', () => {
  const from = source.indexOf("document.querySelectorAll('.poAssignedManage')");
  const until = source.indexOf('    const poList=', from);
  assert.ok(from > 0 && until > from, 'canonical assignment binder not found');
  const binder = source.slice(from, until);
  assert.doesNotMatch(binder, /updateVisit|setVisit|_posts\.push|requestVisit|localStorage/);
  const events=[], calls=[],data={currentProjectId:'cinepolis'},ui={};
  const document = {querySelectorAll:() => [{dataset:{visitId:'hr_2026-10_gt_22_e03f9f545a'},addEventListener:(type,fn)=>events.push({type,fn})}]};
  const CX = {adminPostulacionesActions:{openContext: args => calls.push(args)}};
  new Function('document','CX','data','ui',binder)(document,CX,data,ui);
  assert.equal(events.length,1);
  assert.equal(events[0].type,'click');
  events[0].fn();
  assert.equal(calls.length,1);
  assert.equal(calls[0].visitId,'hr_2026-10_gt_22_e03f9f545a');
  assert.equal(calls[0].data,data);
  assert.equal(calls[0].ui,ui);
});

test('HF-20261012-15: missing visit ID cannot dispatch an action', () => {
  const from=source.indexOf("document.querySelectorAll('.poAssignedManage')");
  const until=source.indexOf('    const poList=',from);
  const binder=source.slice(from,until);
  let click, calls=0;
  new Function('document','CX','data','ui',binder)(
    {querySelectorAll:()=>[{dataset:{visitId:''},addEventListener:(_event,fn)=>{click=fn;}}]},
    {adminPostulacionesActions:{openContext:()=>{calls++;}}},
    {},{}
  );
  click();
  assert.equal(calls,0);
});
