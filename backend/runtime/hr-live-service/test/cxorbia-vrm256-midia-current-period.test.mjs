#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src=fs.readFileSync('app/modules/midia.js','utf8');

test('VRM-256 Mi Día scopes next visit to active period and active assignment',()=>{
  assert.match(src,/VRM-256/);
  assert.match(src,/data\.recordPeriodId\?data\.recordPeriodId\(v\)/);
  assert.match(src,/recordPeriodId===String\(data\.currentPeriodId\|\|''\)/);
  assert.match(src,/f\.assigned===true/);
  assert.match(src,/f\.realized!==true/);
  assert.match(src,/f\.cancelled!==true/);
  assert.doesNotMatch(src,/filter\(v=>!\(data\.visitFacets\?\.\(v\)\?\.cancelled\)\)\.slice\(0,2\)/);
});

console.log('PASS_VRM256_MIDIA_CURRENT_PERIOD_SOURCE');

test('B1/B11 November calendar follows selected period, even if historical October HR dates appear in that tab',()=>{
  const dataSource=fs.readFileSync('app/core/data.js','utf8');
  const start=dataSource.indexOf('  periodMonth(id){');
  const end=dataSource.indexOf('  duplicatePeriod(',start);
  assert.ok(start>=0&&end>start);
  const method=dataSource.slice(start,end).trim().replace(/,\s*$/,'');
  const periodMonth=vm.runInNewContext('({'+method+'}).periodMonth');
  const context={
    projects:[{id:'period-nov',periodo:'NOV 2026'},{id:'period-oct',periodo:'OCT 2026'}],
    periodDates:()=>['2026-10-03','2026-10-19']
  };
  assert.equal(periodMonth.call(context,'period-nov'),'2026-11');
  assert.equal(periodMonth.call(context,'period-oct'),'2026-10');
  assert.equal(periodMonth.call(context,'cinepolis-2026-11'),'2026-11');
  assert.equal(periodMonth.call(context,'unlabeled'),'2026-10');
});
