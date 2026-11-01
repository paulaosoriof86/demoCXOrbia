import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';

const crm = readFileSync(new URL('../../app/modules/crm.js', import.meta.url), 'utf8');
const crmStoreOnly = crm.slice(0, crm.indexOf("\nCX.module('crm'"));
const composition = readFileSync(
  new URL('../../app/adapters/tya-ab-cumulative-composition-v1.js', import.meta.url), 'utf8');

function fixture(canonical) {
  let canonicalState = canonical;
  const CX = {
    BACKEND: {tenantId: 'tya'},
    dataSource: {showFixtures: () => true},
    commercialCommandBoundary: {canonicalMode: () => canonicalState},
    data: {
      clients: [],
      __commercialState: {
        accounts: [
          {id: 'provider-account', deleted: false},
          {id: 'provider-string-false', deleted: 'false'},
          {id: 'provider-tombstone', deleted: true},
        ],
        opportunities: [{id: 'provider-opportunity', deleted: false}],
        contacts: [{id: 'provider-contact', deleted: false}],
      },
      ctx: () => ({tenantId: 'tya', projectId: 'cinepolis', periodId: 'cinepolis-2026-09'}),
      project: () => ({id: 'cinepolis'}),
      period: () => ({id: 'cinepolis-2026-09', periodKey: 'cinepolis-2026-09'}),
    },
  };
  const window = {
    CX,
    CX_DEV_ENTRY_CANONICAL: {lane: 'authenticated-human-canonical'},
    addEventListener: () => {},
  };
  const context = {CX, window, location: {search: ''}, document: {addEventListener: () => {}}, URLSearchParams};
  runInNewContext(crmStoreOnly, context, {timeout: 1000});
  runInNewContext(composition, context, {timeout: 1000});
  return {CX, setCanonical: value => { canonicalState = value; }};
}

test('G03: historical A+B composition never masks provider-backed canonical CRM rows', () => {
  const {CX} = fixture(true);
  assert.equal(CX.crmStore.__abCompositionWrapped, true);
  assert.deepEqual(Array.from(CX.crmStore.cuentas(), x => x.id), [
    'provider-account', 'provider-string-false',
  ]);
  assert.deepEqual(Array.from(CX.crmStore.list(), x => x.id), ['provider-opportunity']);
  assert.deepEqual(Array.from(CX.crmStore.contactos(), x => x.id), ['provider-contact']);
  // A new protected readback must appear without clearing a local cache or reloading.
  CX.data.__commercialState.accounts.push({id: 'provider-later-ack', deleted: false});
  assert.deepEqual(Array.from(CX.crmStore.cuentas(), x => x.id), [
    'provider-account', 'provider-string-false', 'provider-later-ack',
  ]);
});

test('G03: noncanonical historical demo/fixture provenance filtering remains intact', () => {
  const {CX, setCanonical} = fixture(false);
  assert.equal(CX.crmStore.cuentas().length, 0);
  CX.crmStore._cuentas = [
    {id: 'unproven-demo-row'},
    {id: 'explicit-user-row', dataOrigin: 'platform_user'},
  ];
  assert.deepEqual(Array.from(CX.crmStore.cuentas(), x => x.id), ['explicit-user-row']);
  setCanonical(true);
  assert.deepEqual(Array.from(CX.crmStore.cuentas(), x => x.id), [
    'provider-account', 'provider-string-false',
  ]);
});
