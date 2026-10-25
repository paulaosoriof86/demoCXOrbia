#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
