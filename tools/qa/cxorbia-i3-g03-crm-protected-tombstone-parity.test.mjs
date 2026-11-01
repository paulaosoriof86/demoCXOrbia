import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';
import './cxorbia-i3-g03-crm-composition-provider-parity.test.mjs';

const source = readFileSync(new URL('../../app/modules/crm.js', import.meta.url), 'utf8');
const storeSource = source.slice(0, source.indexOf("\nCX.module('crm'"));

test('G03: CRM canonical shows protected rows unless deleted is the boolean true tombstone', () => {
  assert.ok(storeSource.includes('CX.crmStore = CX.crmStore || {'));
  const CX = {
    commercialCommandBoundary: {canonicalMode: () => true},
    data: {
      __commercialState: {
        accounts: [
          {id: 'g03-test-durable', deleted: 'false'},
          {id: 'g03-test-legacy', deleted: false},
          {id: 'g03-test-tombstone', deleted: true},
        ],
        opportunities: [
          {id: 'g03-test-opportunity', deleted: 'false'},
          {id: 'g03-test-opportunity-deleted', deleted: true},
        ],
      },
    },
  };
  runInNewContext(storeSource, {CX}, {timeout: 1000});
  assert.equal(CX.crmStore._canonical(), true);
  assert.deepEqual(Array.from(CX.crmStore.cuentas(), row => row.id), [
    'g03-test-durable', 'g03-test-legacy',
  ]);
  assert.deepEqual(Array.from(CX.crmStore.list(), row => row.id), [
    'g03-test-opportunity',
  ]);
});
