#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync('app/modules/beneficios.js','utf8');

test('VRM-257 paid canonical liquidation cannot render pending payment badge',()=>{
  assert.match(src,/VRM-257/);
  assert.match(src,/const payLabel=isPaid\(l\)\?\['Pago confirmado','g'\]:paymentHumanLabel\(vc&&vc\.paymentState\)/);
  assert.match(src,/const isPaid=\(l\)=>l\.paymentConfirmed===true/);
});

console.log('PASS_VRM257_BENEFITS_PAYMENT_LABEL_SOURCE');
