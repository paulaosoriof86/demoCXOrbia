import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const dashboard = readFileSync(new URL('../../app/modules/dashboard.js', import.meta.url), 'utf8');
const data = readFileSync(new URL('../../app/core/data.js', import.meta.url), 'utf8');

test('the dashboard assignment bucket uses its canonical visit-facet predicate', () => {
  const source = dashboard.match(/const porAsignar\s*=\s*all\.filter\(([^;]+)\);/);
  assert.ok(source, 'Dashboard assignment bucket must be present');
  assert.equal(source[1].trim(), 'BF.sinAsignar');
  assert.match(dashboard, /bucket\('👤 Pendientes por asignar','purple',porAsignar,/);
});

test('realized, cancelled, and assigned visits cannot appear as pending assignments', () => {
  const source = data.match(/\bsinAsignar\s*:\s*(v=>\{const f=CX\.data\.visitFacets\(v\);return [^}]+\})\s*,/);
  assert.ok(source, 'Canonical unassigned visit predicate must be present');
  const predicate = runInNewContext(`(${source[1]})`, {
    CX: {data: {visitFacets: visit => visit.canonicalFacets}},
  });
  const records = [
    {id: 'available-no-owner', canonicalFacets: {assigned: false, realized: false, cancelled: false}},
    {id: 'realized-no-owner', canonicalFacets: {assigned: false, realized: true, cancelled: false}},
    {id: 'cancelled-no-owner', canonicalFacets: {assigned: false, realized: false, cancelled: true}},
    {id: 'assigned', canonicalFacets: {assigned: true, realized: false, cancelled: false}},
  ];
  assert.deepEqual(records.filter(predicate).map(visit => visit.id), ['available-no-owner']);
});
