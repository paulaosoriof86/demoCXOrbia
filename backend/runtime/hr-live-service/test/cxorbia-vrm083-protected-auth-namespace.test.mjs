import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
const match=source.match(/function canonicalProtectedAuthNamespace\(role,value\)\{[\s\S]*?\n\}/);
assert.ok(match,'canonicalProtectedAuthNamespace helper must exist');
const fn=(0,eval)('('+match[0]+')');

test('VRM-083 missing authNamespace is compatible only for shopper role',()=>{
  assert.equal(fn('shopper',''),'shopper');
  assert.equal(fn('SHOPPER',null),'shopper');
  assert.equal(fn('shopper','shopper'),'shopper');
  assert.equal(fn('admin',''),'');
  assert.equal(fn('super',undefined),'');
  assert.equal(fn('admin','staff'),'staff');
});

test('VRM-083 protected principal uses canonical namespace before membership comparison',()=>{
  assert.match(source,/const namespace=canonicalProtectedAuthNamespace\(role,decoded\.authNamespace\);/);
  assert.match(source,/String\(member\.authNamespace\|\|''\)\.trim\(\)\.toLowerCase\(\)!==namespace/);
  assert.match(source,/AUTH_FAILURE:PROTECTED_RUNTIME_MEMBERSHIP_CLAIMS_MISMATCH/);
});
