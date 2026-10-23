import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Source-only contract. This does not authenticate or write to any provider.
const source = readFileSync(new URL('../../app/core/shoppers-store.js', import.meta.url), 'utf8');
const exactId = 'TYA_GT_393371F88D10F7A8';

function makeFixture({ role = 'shopper', uid = 'auth-fixture-280', listed = [],
  sessionShopperId = exactId, profile = { id: exactId, nombre: 'Shopper I3.8 DEV Validation' },
  authorityPatch = {}, providerUid = uid } = {}) {
  const data = { shoppers: listed, _visitas: [], _posts: [] };
  const CX = { data, session: { role, user: { shopperId: sessionShopperId } } };
  const authority = {
    applied: true, exactSessionShopperReady: true, shopperPrincipalClaimsVerified: true,
    actorUid: uid, canonicalShopperId: exactId, shopperCountry: 'GT',
    ...authorityPatch,
  };
  const window = {
    CX, CX_DEV_ENTRY_CANONICAL: { canonical: true },
    CX_PROTECTED_AUTH_HR_AUTHORITY: authority,
    firebase: { auth: () => ({ currentUser: providerUid ? { uid: providerUid } : null }) },
  };
  runInNewContext(source, { window, CX, localStorage: new Proxy({}, {
    get() { throw new Error('Canonical shopper path consulted localStorage'); },
  }) }, { timeout: 3000 });
  data.__sessionShopperProfile = profile;
  return data;
}

test('VRM-280: exact signed-in zero-visit shopper resolves sparse provider profile and GT authority', () => {
  const data = makeFixture();
  const found = data.getShopper(exactId);
  assert.equal(found?.id, exactId);
  assert.equal(found?.shopperId, exactId);
  assert.equal(found?.pais, 'GT');
  assert.equal(found?.country, 'GT');
  assert.equal(found?.__exactAuthenticatedSessionProfile, true);
  assert.equal(data.shoppers.length, 0, 'No invented HR operational row');
  assert.equal(data.visitsForShopper(exactId).length, 0);
});

test('VRM-280: HR-listed shopper retains existing object and precedence', () => {
  const existing = { id: exactId, nombre: 'Operational Shopper', pais: 'HN' };
  assert.equal(makeFixture({ listed: [existing] }).getShopper(exactId), existing);
});

test('VRM-280: cannot resolve another requested shopper ID', () => {
  assert.equal(makeFixture().getShopper('TYA_GT_ANOTHER'), null);
});

test('VRM-280: session and protected canonical shopper IDs must match exactly', () => {
  assert.equal(makeFixture({ sessionShopperId: 'another' }).getShopper(exactId), null);
  assert.equal(makeFixture({ authorityPatch: { canonicalShopperId: 'another' } }).getShopper(exactId), null);
  assert.equal(makeFixture({ profile: { id: 'another' } }).getShopper(exactId), null);
});

test('VRM-280: Firebase provider UID is required and tied to authority actor UID', () => {
  assert.equal(makeFixture({ providerUid: null }).getShopper(exactId), null);
  assert.equal(makeFixture({ providerUid: 'unexpected-user' }).getShopper(exactId), null);
});

test('VRM-280: authenticated non-Shopper roles cannot use session fallback', () => {
  assert.equal(makeFixture({ role: 'admin' }).getShopper(exactId), null);
  assert.equal(makeFixture({ role: 'cliente' }).getShopper(exactId), null);
});

test('VRM-280: protected authority must be applied, ready, and claims-verified', () => {
  for (const key of ['applied', 'exactSessionShopperReady', 'shopperPrincipalClaimsVerified']) {
    assert.equal(makeFixture({ authorityPatch: { [key]: false } }).getShopper(exactId), null, key);
  }
});

test('VRM-280: absent profile, blank request, or unknown ID fail closed', () => {
  const data = makeFixture({ profile: null });
  assert.equal(data.getShopper(exactId), null);
  assert.equal(data.getShopper(''), null);
  assert.equal(data.getShopper(undefined), null);
});
